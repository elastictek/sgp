import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon } from "components/formLayout";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input } from "antd";
import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import FormPaletizacaoSchema from '../paletizacaoSchema/FormPaletizacaoSchema';
import { OFabricoContext } from './FormOFabricoValidar';

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const Drawer = ({ showWrapper, setShowWrapper, parentReload }) => {
    const [formTitle, setFormTitle] = useState({});
    const iref = useRef();
    const { record = {} } = showWrapper;
    const onVisible = () => {
        setShowWrapper(prev => ({ ...prev, show: !prev.show }));
    }
    return (
        <WrapperForm
            title={<TitleForm title={formTitle.title} subTitle={formTitle.subTitle} />}
            type="drawer"
            destroyOnClose={true}
            //width={width}
            mask={true}
            /* style={{ maginTop: "48px" }} */
            setVisible={onVisible}
            visible={showWrapper.show}
            width={800}
            bodyStyle={{ height: "450px" /*  paddingBottom: 80 *//* , overflowY: "auto", minHeight: "350px", maxHeight: "calc(100vh - 50px)" */ }}
            footer={<div ref={iref} id="form-wrapper" style={{ textAlign: 'right' }}></div>}
        >
            <FormPaletizacaoSchema setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} />
        </WrapperForm>
    );
}

const loadPaletizacoesLookup = async ({ artigo_cod, cliente_cod, token }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/paletizacoeslookup/`, filter: { artigo_cod, cliente_cod }, sort: [{ column: 'contentor_id' }, { column: 'designacao' }], cancelToken: token });
    return rows;
}
const getPaletizacaoDetails = async ({ paletizacao_id, token }) => {
    if (!paletizacao_id) {
        return [];
    }
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/paletizacaodetailsget/`, filter: { paletizacao_id }, sort: [{ column: 'item_order', direction: 'DESC' }], cancelToken: token });
    return rows;
}

const setId = (id) => {
    if (id) {
        return { key: "update", values: { id } };
    }
    return { key: "insert", values: {} };
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload/* , changedValues = {} */ }) => {
    /* const { form, guides, schema, fieldStatus, ...ctx } = useContext(OFabricoContext); */
    const [form] = Form.useForm();
    const [guides, setGuides] = useState(false);
    const [loading, setLoading] = useState(true);
    const [operation, setOperation] = useState(setId(record.aggItem.paletizacao_id));
    const [showSchema, setShowSchema] = useState({ show: false });
    const [paletizacoes, setPaletizacoes] = useState([]);
    const [changedValues, setChangedValues] = useState({});
    const [resultMessage, setResultMessage] = useState({ status: "none" });

    const init = () => {
        (setFormTitle) && setFormTitle({ title: `Esquema de Paletização ${record.aggItem.cliente_nome}`, subTitle: `${record.aggItem.item_cod}` });
    }

    useEffect(() => {
        console.log("zzzz",form.getFieldsValue(true))
        init();
    }, []);


    useEffect(() => {
        const cancelFetch = cancelToken();
        loadData({ paletizacao_id: (("paletizacao_id" in changedValues) ? changedValues.paletizacao_id : record.aggItem.paletizacao_id), token: cancelFetch });
        return (() => cancelFetch.cancel("Form Paletização Cancelled"));
    }, [changedValues]);



    const onValuesChange = (changedValues, allValues) => {
        if ("paletizacao_id" in changedValues) {
            setChangedValues(changedValues);
        }
    }

    const onFinish = async (values) => {
        const paletizacao_id = form.getFieldValue("paletizacao_id");
        const ofabrico = record.aggItem.tempof_id;
        const response = await fetchPost({ url: `${API_URL}/savetempordemfabrico/`, parameters: { type:"paletizacao", paletizacao_id, ofabrico } });
        if (response.data.status !== "error") {
            parentReload({ agg_id: record.aggItem.id });
            closeParent();
        }
        // const status = { error: [], warning: [], info: [], success: [] };
        // const msgKeys = ["start_date", "start_hour", "end_date", "end_hour"];
        // const { cliente_cod, cliente_nome, iorder, item, ofabrico, produto_id, item_id } = record;
        // const { core_cod: { value: core_cod, label: core_des } = {} } = values;
        // const { cortes_id, cortesordem_id } = form.getFieldsValue(true);
        // let diff = {};
        // const v = schema().custom((v, h) => {
        //     const { start_date, start_hour, end_date, end_hour } = v;
        //     diff = dateTimeDiffValidator(start_date, start_hour, end_date, end_hour);
        //     if (diff.errors == true) {
        //         return h.message("A Data de Fim tem de ser Maior que a Data de Início", { key: "start_date", label: "start_date" })
        //     }
        // }).validate(values, { abortEarly: false });
        // status.error = [...status.error, ...(v.error ? v.error?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        // status.warning = [...status.warning, ...(v.warning ? v.warning?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        // if (!v.error) { }
        // if (status.error.length === 0) {
        //     const response = await fetchPost({ url: `${API_URL}/savetempordemfabrico/`, parameters: { ...values, cliente_cod, cliente_nome, iorder, item, item_id, ofabrico, core_cod, core_des, produto_id, cortes_id, cortesordem_id } });
        //     setResultMessage(response.data);
        // }
        // setFieldStatus(diff.fields);
        // setFormStatus(status);
    }


    /*     useEffect(() => {
            const cancelFetch = cancelToken();
            if ("paletizacao_id" in changedValues) {
                setLoading(true);
                loadData({ paletizacao_id: changedValues.paletizacao_id, token: cancelFetch });
            }
            return (() => cancelFetch.cancel("Form Paletização Cancelled"));
        }, [changedValues]); */

    const loadData = (data = {}, type = "init") => {
        const { paletizacao_id, token } = data;
        switch (type) {
            case "lookup":
                setLoading(true);
                (async () => {
                    setPaletizacoes(await loadPaletizacoesLookup({ artigo_cod: record.aggItem.item_cod, cliente_cod: record.aggItem.cliente_cod, token }));
                    setLoading(false);
                })();
                break;
            default:
                if (!loading) {
                    setLoading(true);
                }
                (async () => {
                    let _paletizacoes = paletizacoes;
                    if (record.aggItem.item_cod) {
                        _paletizacoes = await loadPaletizacoesLookup({ artigo_cod: record.aggItem.item_cod, cliente_cod: record.aggItem.cliente_cod, token });
                        setPaletizacoes(_paletizacoes);
                    }
                    if (paletizacao_id) {
                        const [paletizacao] = _paletizacoes.filter(v => v.id === paletizacao_id);
                        const paletizacaoDetails = await getPaletizacaoDetails({ paletizacao_id, token });
                        form.setFieldsValue({ ...paletizacao, paletizacao_id: paletizacao.id, paletizacao: [...paletizacaoDetails] });
                    }
                    setLoading(false);
                })();
        }
    }

    const onShowSchema = (newSchema = false, forInput = false) => {
        const { cliente_cod, cliente_nome, item_cod, paletizacao_id } = record.aggItem;
        if (newSchema) {
            setShowSchema(prev => ({ ...prev, show: !prev.show, record: { cliente_cod, cliente_nome, artigo_cod: item_cod, paletizacao_id }, forInput }));
        } else {
            setShowSchema(prev => ({ ...prev, show: !prev.show, record: { ...form.getFieldsValue(true) }, forInput }));
        }
    }

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                <Drawer showWrapper={showSchema} setShowWrapper={setShowSchema} parentReload={loadData} />
                <Form form={form} name={`form-of-paletizacao`} onFinish={onFinish} onValuesChange={onValuesChange}>
                    <FormLayout
                        id="LAY-PALETIZACAO"
                        guides={guides}
                        layout="vertical"
                        style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                        schema={schema}
                        field={{
                            //wide: [3, 2, 1, '*'],
                            margin: "2px", overflow: false, guides: guides,
                            label: { enabled: true, pos: "top", align: "start", vAlign: "center", /* width: "80px", */ wrap: false, overflow: false, colon: true, ellipsis: true },
                            alert: { pos: "right", tooltip: true, container: true /* container: "el-external" */ },
                            layout: { top: "", right: "", center: "", bottom: "", left: "" },
                            addons: {}, //top|right|center|bottom|left
                            required: true,
                            style: { alignSelf: "top" }
                        }}
                        fieldSet={{
                            guides: guides,
                            wide: 16, margin: "2px", layout: "horizontal", overflow: false
                        }}
                    >
                        <FieldSet>
                            <Toolbar
                                style={{ width: "100%" }}
                                left={
                                    <FieldSet>
                                        <Field name="paletizacao_id" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Paletização", pos: "left" }} addons={{
                                            ...(form.getFieldValue("paletizacao_id") && { right: <Button onClick={() => onShowSchema()} style={{ marginLeft: "3px" }} size="small"><EditOutlined style={{ fontSize: "16px" }} /></Button> })
                                        }}>
                                            <SelectField size="small" data={paletizacoes} keyField="id" textField="designacao"
                                                optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ width: "70px" }}><b>{d["contentor_id"]}</b></div><div style={{flex:1}}>{d[textField]}</div><div style={{width:"20px"}}>v.{d["versao"]}</div></div>, value: d[keyField] })}
                                            />
                                        </Field>
                                    </FieldSet>
                                }
                                right={<Button onClick={() => onShowSchema(true)}>Novo Esquema</Button>}
                            />
                        </FieldSet>
                        <FieldSet>
                            {(!loading && form.getFieldValue("paletizacao_id")) && <FormPaletizacaoSchema record={form.getFieldsValue(true)} wrapForm={false} forInput={false} parentReload={loadData} />}
                        </FieldSet>
                    </FormLayout>
                </Form>
                {parentRef && <Portal elId={parentRef.current}>
                    <Space>
                        <Button type="primary" onClick={()=>form.submit()}>Guardar</Button>
                        <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button>
                    </Space>
                </Portal>
                }
            </Spin>
        </>
    );
}