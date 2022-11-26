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
import moment from 'moment';
import useWebSocket from 'react-use-websocket';
import { useSubmitting, noValue } from "utils";
import { json } from "utils/object";
import TitleCard from './TitleCard';
import { SocketContext } from "../../App";

/* const fetchBobinagens = async (value) => {
    if (value) {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/getconsumosbobinagenslookup/`, pagination: { limit: 20 }, filter: { ["fbobinagem"]: `%${value.replaceAll(' ', '%%')}%` }, sort: [{ column: 'ig.t_stamp', direction: 'ASC' }] });
        return rows;
    }
}
const lastBobinagem = async ({ signal } = {}) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/getconsumosbobinagenslookup/`, pagination: { limit: 1 }, filter: {}, sort: [{ column: 'ig.t_stamp', direction: 'DESC' }], signal });
    return rows;
} */
const schemaStatus = (options = {}) => { return getSchema({}, options).unknown(true); }

// const ChangeStatus = ({ parameters, parentRef, closeParent }) => {
//     const [footer, setFooter] = useState(false);
//     const permission = usePermission();
//     const navigate = useNavigate();
//     const [form] = Form.useForm();
//     const [fieldStatus, setFieldStatus] = useState({});
//     const [lastId, setLastId] = useState();
//     const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
//     const submitting = useSubmitting(true);

//     const [produtoGranulado, setProdutoGranulado] = useState([]);
//     const loadData = async ({ signal }) => {
//         try {
//             setFooter(true);
//             let bobinagem = await lastBobinagem({ signal });
//             if (bobinagem.length > 0) {
//                 form.setFieldsValue({ date: bobinagem[0]["t_stamp"], fbobinagem: { key: bobinagem[0]["id"], value: bobinagem[0]["id"], label: <div key={`ls-${bobinagem[0]["id"]}`}><b>{bobinagem[0]["nome"]}</b> {moment(bobinagem[0]["t_stamp"]).format(DATETIME_FORMAT)}</div> } });
//                 setLastId(bobinagem[0]["id"]);
//             }
//         } catch (e) {
//             Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
//         } finally {
//             submitting.end();
//         };
//     };

//     useEffect(() => {
//         const controller = new AbortController();
//         loadData({ signal: controller.signal });
//         return (() => controller.abort());
//     }, []);

//     const onFinish = async (values) => {
//         submitting.trigger();
//         console.log(values);
//         console.log(parameters);
//         try {
//             const { fbobinagem, date } = form.getFieldsValue(true);
//             const dt = moment.isMoment(date) ? date.format(DATETIME_FORMAT) : moment(date).format(DATETIME_FORMAT);
//             const response = await fetchPost({ url: `${API_URL}/changecurrsettings/`, parameters: { id: parameters.id, status: parameters.status, agg_of_id: parameters.agg_of_id, ig_id: fbobinagem?.key, last: (lastId === fbobinagem?.key ? true : false), date: dt } });
//             if (response.data.status !== "error") {
//                 Modal.success({ title: "Estado da ordem de fabrico alterado com sucesso!", onOk: () => { parameters.parentReload(); closeParent(); } });
//             } else {
//                 Modal.error({ title: "Erro ao alterar estado da ordem de fabrico!", onOk: () => { closeParent(); } });
//             }
//         } catch (e) {
//             Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
//         } finally {
//             submitting.end();
//         }

//         //current settings id {parameters.id} - status {parameters.status} - agg_of_id {parameters.agg_of_id} - last bobinagem {lastId}
//         /*         const status = { error: [], warning: [], info: [], success: [] };
//                 submitting.trigger();
//                 try {
//                     const response = await fetchPost({ url: `${API_URL}/newlotegranulado/`, parameters: { peso: 0, tara: '15 kg', estado: 'ND', produto_granulado_id: values.produto } });
//                     if (response.data.status !== "error") {
//                         navigate('/app/picking/pickgranulado', { state: { id: response.data.id[0] } });
//                     } else {
//                         status.error.push({ message: <div>{response.data.title} {response.data.subTitle && response.data.subTitle}</div> });
//                         setFormStatus({ ...status });
//                     }
//                 } catch (e) {
//                     status.error.push({ message: e.message });
//                     setFormStatus({ ...status });
//                 } finally {
//                     submitting.end();
//                 } */
//     }

//     const onValuesChange = (changedValues, values) => {
//         if ("fbobinagem" in v) {
//             form.setFieldsValue({ date: moment(v.fbobinagem.value) });
//         }
//     }

//     return (
//         <div>
//             <Form form={form} name={`f-operations`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
//                 <AlertsContainer mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
//                 <FormContainer id="LAY-OPERATIONS" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} schema={schemaStatus} wrapFormItem={true} forInput={true}>
//                     <Row style={{}} gutterWidth={10}>
//                         <Col xs={6}>
//                             <Field forInput={permission.auth.isAdmin} wrapFormItem={true} name="fbobinagem" label={{ enabled: false }}>
//                                 <SelectDebounceField
//                                     placeholder="Bobinagem"
//                                     size="small"
//                                     keyField="id"
//                                     textField="nome"
//                                     showSearch
//                                     showArrow
//                                     allowClear
//                                     fetchOptions={fetchBobinagens}
//                                     optionsRender={(d, keyField, textField) => ({ label: <div><b>{d["nome"]}</b> {moment(d["t_stamp"]).format(DATETIME_FORMAT)}</div>, value: d["t_stamp"], key: d["id"] })}
//                                 />
//                             </Field>
//                         </Col>
//                     </Row>
//                 </FormContainer>
//             </Form>
//             {(footer && parentRef.current) && <Portal elId={parentRef.current}>
//                 <Space>
//                     <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Confirmar</Button>
//                     <Button onClick={closeParent}>Cancelar</Button>
//                 </Space>
//             </Portal>
//             }
//         </div>
//     );
// }

export default ({ record, card, parentReload }) => {
    const { hash: { hash_productionchanges, hash_linelog_params }, data: { datalinelog_params } } = useContext(SocketContext) || { hash: {}, data: {} };
    const [data, setData] = useState();
    const permission = usePermission();
    const [allowEdit, setAllowEdit] = useState({ form: false });
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimegeneric`, {
        onOpen: () => {},
        queryParams: {},
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 500
    });





    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        return <ResponsiveModal title={`${modalParameters.title}`}
            onCancel={hideModal}
            width={500} height={200} footer="ref" >
            {/* <ChangeStatus parameters={modalParameters} /> */}
        </ResponsiveModal>;
    }, [modalParameters]);




    useEffect(() => {
        if (hash_productionchanges && hash_linelog_params) {
            (async () => sendJsonMessage({ cmd: 'estadoproducao', value: {} }));
            //setData(json(currentproduction01));
            console.log("-------------->>>>",datalinelog_params.id)
        }
        

    }, [hash_productionchanges,hash_linelog_params]);

    useEffect(() => {
        if (lastJsonMessage) {
            console.log(lastJsonMessage)
        }
    }, [lastJsonMessage]);

    return (
        <>
            <Card
                hoverable
                headStyle={{ padding: "0px 32px 0px 12px", backgroundColor: "#237804", color: "#fff" }}
                /* onClick={onEdit} */
                style={{ height: "100%", border: "1px solid #8c8c8c", backgroundColor: "#73d13d" }}
                bodyStyle={{ height: "calc(100% - 61px)", display: "flex", justifyContent: "center", backgroundColor: "#73d13d" }}
                size="small"
                title={<TitleCard title={card.title} />}
            >
                <YScroll style={{ width: "100%", color: "#000" }}>
                    {data &&
                        <Container style={{fontSize:"11px", textAlign:"center"}} fluid>
                            <Row>
                                <Col>
                                    <Row nogutter>
                                        <Col xs={2}>Ordens Fabrico</Col>
                                        <Col xs={7}>Artigo</Col>
                                        <Col>Paletes</Col>
                                        <Col>Bobines/Palete</Col>
                                    </Row>
                                    {json(data.ofs).map(v => <Row nogutter style={{ fontWeight: 700 }} key={`iep01_${v.of_cod}`}>
                                        <Col xs={2}>{v.of_cod}</Col>
                                        <Col xs={7}>{v.artigo_des}</Col>
                                        <Col>{v.n_paletes_total}</Col>
                                        <Col>{v.n_bobines_palete}</Col>
                                    </Row>
                                    )}
                                </Col>
                            </Row>
                            <Row style={{ marginTop: "10px", textAlign:"center" }}>
                                <Col>Paletes Total</Col>
                                <Col>Paletes Produzidas</Col>
                                <Col>Paletes Stock</Col>
                                <Col>Bobines Total</Col>
                            </Row>
                            <Row style={{ fontWeight: 700 }}>
                                <Col>{data.num_paletes_total}</Col>
                                <Col>{data.num_paletes_produzidas}</Col>
                                <Col>{data.num_paletes_stock_in}</Col>
                                <Col>{data.num_bobines_total}</Col>
                            </Row>
                        </Container>
                    }
                </YScroll>
            </Card>
        </>
    );
}
