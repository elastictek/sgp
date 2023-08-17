import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL, ROOT_URL, DATETIME_FORMAT } from "config";
import { useModal } from "react-modal-hook";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import ResponsiveModal from 'components/Modal';
import Portal from "components/portal";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space, Form, Modal } from "antd";
const { Panel } = Collapse;
import { EditOutlined, HistoryOutlined } from '@ant-design/icons';
import { VerticalSpace } from 'components/FormFields';
import { usePermission } from "utils/usePermission";
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, SelectDebounceField } from 'components/FormFields';
import { useSubmitting, noValue } from "utils";
import TitleCard from './TitleCard';

const fetchBobinagens = async (value) => {
    if (value) {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/getconsumosbobinagenslookup/`, pagination: { limit: 20 }, filter: { ["fbobinagem"]: `%${value.replaceAll(' ', '%%')}%` }, sort: [{ column: 'ig.t_stamp', direction: 'ASC' }] });
        return rows;
    }
}
const lastBobinagem = async ({ signal } = {}) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/getconsumosbobinagenslookup/`, pagination: { limit: 1 }, filter: {}, sort: [{ column: 'ig.t_stamp', direction: 'DESC' }], signal });
    return rows;
}
const schemaStatus = (options = {}) => { return getSchema({}, options).unknown(true); }

const ChangeStatus = ({ parameters, parentRef, closeParent }) => {
    const [footer, setFooter] = useState(false);
    const permission = usePermission();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [lastId, setLastId] = useState();
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);

    const [produtoGranulado, setProdutoGranulado] = useState([]);
    const loadData = async ({ signal }) => {
        try {
            setFooter(true);
            let bobinagem = await lastBobinagem({ signal });
            if (bobinagem.length > 0) {
                form.setFieldsValue({ date: bobinagem[0]["t_stamp"], fbobinagem: { key: bobinagem[0]["id"], value: bobinagem[0]["id"], label: <div key={`ls-${bobinagem[0]["id"]}`}><b>{bobinagem[0]["nome"]}</b> {dayjs(bobinagem[0]["t_stamp"]).format(DATETIME_FORMAT)}</div> } });
                setLastId(bobinagem[0]["id"]);
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        } finally {
            submitting.end();
        };
    };

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (values) => {
        submitting.trigger();
        console.log(values);
        console.log(parameters);
        try {
            const { fbobinagem, date } = form.getFieldsValue(true);
            const dt = dayjs.isDayjs(date) ? date.format(DATETIME_FORMAT) : dayjs(date).format(DATETIME_FORMAT);
            const response = await fetchPost({ url: `${API_URL}/changecurrsettings/`, parameters: { id: parameters.id, status: parameters.status, agg_of_id: parameters.agg_of_id, ig_id: fbobinagem?.key, last: (lastId === fbobinagem?.key ? true : false), date: dt } });
            if (response.data.status !== "error") {
                Modal.success({ title: "Estado da ordem de fabrico alterado com sucesso!", onOk: () => { parameters.parentReload(); closeParent(); } });
            } else {
                Modal.error({ title: "Erro ao alterar estado da ordem de fabrico!", onOk: () => { closeParent(); } });
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        } finally {
            submitting.end();
        }

        //current settings id {parameters.id} - status {parameters.status} - agg_of_id {parameters.agg_of_id} - last bobinagem {lastId}
        /*         const status = { error: [], warning: [], info: [], success: [] };
                submitting.trigger();
                try {
                    const response = await fetchPost({ url: `${API_URL}/newlotegranulado/`, parameters: { peso: 0, tara: '15 kg', estado: 'ND', produto_granulado_id: values.produto } });
                    if (response.data.status !== "error") {
                        navigate('/app/picking/pickgranulado', { state: { id: response.data.id[0] } });
                    } else {
                        status.error.push({ message: <div>{response.data.title} {response.data.subTitle && response.data.subTitle}</div> });
                        setFormStatus({ ...status });
                    }
                } catch (e) {
                    status.error.push({ message: e.message });
                    setFormStatus({ ...status });
                } finally {
                    submitting.end();
                } */
    }

    const onValuesChange = (changedValues, values) => {
        if ("fbobinagem" in v) {
            form.setFieldsValue({ date: dayjs(v.fbobinagem.value) });
        }
    }

    return (
        <div>
            <Form form={form} name={`f-operations`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
                <AlertsContainer mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
                <FormContainer id="LAY-OPERATIONS" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} schema={schemaStatus} wrapFormItem={true} forInput={true}>
                    <Row style={{}} gutterWidth={10}>
                        <Col xs={6}>
                            <Field forInput={permission.auth.isAdmin} wrapFormItem={true} name="fbobinagem" label={{ enabled: false }}>
                                <SelectDebounceField
                                    placeholder="Bobinagem"
                                    size="small"
                                    keyField="id"
                                    textField="nome"
                                    showSearch
                                    showArrow
                                    allowClear
                                    fetchOptions={fetchBobinagens}
                                    optionsRender={(d, keyField, textField) => ({ label: <div><b>{d["nome"]}</b> {dayjs(d["t_stamp"]).format(DATETIME_FORMAT)}</div>, value: d["t_stamp"], key: d["id"] })}
                                />
                            </Field>
                        </Col>
                    </Row>
                </FormContainer>
            </Form>
            {(footer && parentRef.current) && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Confirmar</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </div>
    );
}

export default ({ record, card, parentReload }) => {
    const permission = usePermission();
    const [allowEdit, setAllowEdit] = useState({ form: false });
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        return <ResponsiveModal title={`${modalParameters.title}`}
            onCancel={hideModal}
            width={500} height={200} footer="ref" >
            <ChangeStatus parameters={modalParameters} />
        </ResponsiveModal>;
    }, [modalParameters]);




    const changeStatus = async (status) => {
        let title;
        switch (status) {
            case 1: title = 'Parar/Suspender Produção!'; break;
            case 3: title = 'Iniciar/Retomar Produção!'; break;
            case 9: title = 'Finalizar Produção!'; break;
        }
        console.log("------", record.status, '----', status)
        setModalParameters({ parentReload, title, id: record.id, status, agg_of_id: record.agg_of_id });
        showModal();
        /* if (status === 9) {
             modal.show({
                 propsToChild: true, width: '400px', height: '150px', fullWidthDevice: 2, footer: "ref",
                 title: `Finalizar Produção`,
                 content: <FecharOrdemFabrico data={{ id: record.id, status, agg_of_id: record.agg_of_id }} parentReload={() => parentReload({ aggId: record.agg_of_id })} />
             });
         }
         if (status === 1) {
             //Modal.confirm({ title: "Parar/Suspender Produção!", content: "Tem a certeza que deseja Parar/Suspender a Produção?", onOk: suspenderProducao })
             modal.show({
                  propsToChild: true, width: '400px', height: '150px', fullWidthDevice: 2, footer: "ref",
                  title: `Parar/Suspender Produção`,
                  content: <FecharOrdemFabrico data={{ id: record.id, status, agg_of_id: record.agg_of_id }} parentReload={() => parentReload({ aggId: record.agg_of_id })} />
              });
         }
         if (status === 3 || status === 0) {
             const response = await fetchPost({ url: `${API_URL}/changecurrsettings/`, parameters: { id: record.id, status, agg_of_id: record.agg_of_id } });
             if (response.data.status !== "error") {
                 Modal.success({ content: response.data.title });
                 parentReload({ aggId: record.agg_of_id });
 
             } else {
                 Modal.error({
                     title: 'Erro ao alterar estado da Ordem de Fabrico',
                     content: response.data.title,
                 });
             }
         } */
    }

    useEffect(() => {
        setAllowEdit({ form: permission.allow({ producao: 200 }) });
    }, [record.status]);




    return (
        <>
            <Card
                hoverable
                headStyle={{ padding: "0px 32px 0px 12px" }}
                /* onClick={onEdit} */
                style={{ height: "100%", border: "1px solid #8c8c8c" }}
                bodyStyle={{ height: "calc(100% - 61px)",display:"flex", justifyContent:"center" }}
                size="small"
                title={<TitleCard data={record} title={card.title} />}
            >
                {Object.keys(record).length > 0 &&
                    <YScroll style={{maxWidth:"250px"}}>
                        {allowEdit.form && <>
                            {(record.status == 1 || record.status == 2) &&
                                <>
                                    <Button block size="large" style={{ background: "#389e0d", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(3)}>Iniciar Produção</Button>
                                    <VerticalSpace height="5px" />
                                    {record.was_in_production ===1 && <Button block size="large" style={{ background: "#40a9ff", color: "#000", fontWeight: 700 }} onClick={() => changeStatus(9)}>Finalizar Produção</Button>}
                                    {/* <Button block size="large" style={{ background: "#fa8c16", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(0)}>Refazer Planeamento</Button> */}
                                </>
                            }
                            {record.status == 3 &&
                                <>
                                    <Button block size="large" style={{ background: "red", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(1)}>Parar/Suspender Produção</Button>
                                    <VerticalSpace height="5px" />
                                    <Button block size="large" style={{ background: "#40a9ff", color: "#000", fontWeight: 700 }} onClick={() => changeStatus(9)}>Finalizar Produção</Button>
                                </>
                            }</>
                        }
                    </YScroll>
                }
            </Card>
        </>
    );
}
