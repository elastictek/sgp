import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import moment from 'moment';
import { uid } from 'uid';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, sleep } from "utils";
import { json } from "utils/object";
import loadInit from "utils/loadInit";
import { API_URL, DOSERS, JUSTIFICATION_OUT } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
//import { WrapperForm, TitleForm, FormLayout, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, containsAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, Dropdown, DatePicker } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, CloseCircleOutlined, LogoutOutlined, PropertySafetyOutlined, LoginOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { RightAlign, Cuba } from 'components/TableColumns';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { usePermission } from "utils/usePermission";
import { Status } from './commons';
import { GoArrowUp } from 'react-icons/go';
import { ImArrowUp, ImArrowDown, ImArrowRight, ImArrowLeft } from 'react-icons/im';
import { MovColumn, PosColumn, QueueNwColumn } from "./commons";
import dayjs from 'dayjs';
import { MediaContext, AppContext } from "../App";

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const title = "Entrada/Saída de Granulado em Linha";
const TitleForm = ({ data, onChange, level, auth, form }) => {
    return (<ToolbarTitle id={auth?.user} description={title} title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }} wrap="nowrap" nogutter>
                <Col xs='content' style={{}}><Row nogutter><Col title={title} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}><span style={{}}>{title}</span></Col></Row></Col>
                {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
            </Row>

        </Col>
    </>
    }
    />);
}
const useStyles = createUseStyles({});

// const loadCurrentSettings = async (signal) => {
//     const { data: { rows } } = await fetchPost({ url: `${API_URL}/currentsettings/sql/`, filter: {}, sort: [], parameters: { method: "GetCurrentSettings" }, signal });
//     if (rows && rows.length > 0) {
//         //rows[0].formulacao = json(rows[0]?.formulacao?.items);
//         return json(rows[0]?.formulacao)?.items;
//         //rows[0].ofs = json(rows[0].ofs);

//     }
//     return [];
// }

const loadGranuladoInline = async (signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: {}, sort: [], parameters: { method: "GetGranuladoInLine" }, signal });
    if (rows && rows.length > 0) {
        return rows;
    }
    return [];
}
const loadLoteQuantity = async (parameters, signal) => {
    const { data } = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: { ...parameters }, sort: [], parameters: { method: "GetGranuladoLoteQuantity" }, signal });
    return data || {};
}

const Output = ({ data, openNotification, parentRef, closeParent, loadParentData }) => {
    const id = uid(4);
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);

    const schemaOut = (options = {}) => {
        return getSchema({}, options).unknown(true);
    }

    const loadData = async ({ signal } = {}) => {
        form.setFieldsValue({ ...data, t_stamp: dayjs(), qty_reminder: null });
        submitting.end();
    };
    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onSave = async () => {
        const values = form.getFieldsValue(true);
        const v = schemaOut().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);
        if ((values.qty_reminder !== null || values.qty_reminder > 0) && !values.obs) {
            errors = 1;
            status.fieldStatus.obs = { status: "error", messages: [{ message: "A justicação da saída de Matéria Prima é obrigatória!" }] };
        }
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });

        if (errors === 0) {
            let response = null;
            try {
                response = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: values, sort: [], parameters: { method: "RemoveGranuladoFromLine" } });
                if (response.data.status !== "error") {
                    openNotification(response.data.status, 'top', "Notificação", response.data.title);
                    closeParent();
                    loadParentData();
                } else {
                    openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
                }
            } catch (e) {
                openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
            } finally {
                submitting.end();
            };
        }
    }

    return (<FormContainer id={id} form={form} wrapFormItem={true} wrapForm={true} schema={schemaOut} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} fluid>
        <Row style={{}} gutterWidth={10}>
            <Col xs={4}><Field forInput={false} wrapFormItem={true} name="artigo_cod" label={{ enabled: true, text: "Cód. Artigo" }}><Input size="small" /></Field></Col>
            <Col><Field forInput={false} wrapFormItem={true} name="artigo_des" label={{ enabled: true, text: "Artigo" }}><Input size="small" /></Field></Col>
        </Row>
        <Row style={{}} gutterWidth={10}>
            <Col><Field forInput={false} wrapFormItem={true} name="n_lote" label={{ enabled: true, text: "Lote" }}><Input size="small" /></Field></Col>
            <Col><Field forInput={false} wrapFormItem={true} name="vcr_num" label={{ enabled: true, text: "Movimento" }}><Input size="small" /></Field></Col>
        </Row>
        <Row style={{}} gutterWidth={10}>
            <Col><Field forInput={false} wrapFormItem={true} name="qty_lote" label={{ enabled: true, text: "Quantidade Lote" }}><InputNumber size="small" addonAfter="kg" /></Field></Col>
            <Col><Field wrapFormItem={true} forInput={data?.arranque} name="qty_reminder" label={{ enabled: true, text: "Quantidade Restante" }}><InputNumber size="small" addonAfter="kg" min={0} max={data?.qty_lote} /></Field></Col>
            <Col><Field wrapFormItem={true} name="t_stamp" label={{ enabled: true, text: "Data Saída" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
        </Row>
        <Row style={{}} gutterWidth={10}>
            <Col><Field wrapFormItem={true} name="obs" label={{ enabled: true, text: "Justificação de Saída" }}>
                <SelectField size="small" keyField="value" textField="value" data={JUSTIFICATION_OUT} />
            </Field>
            </Col>
        </Row>
        {parentRef && <Portal elId={parentRef.current}>
            <Space>
                <Button type="primary" disabled={submitting.state} onClick={onSave}>Registar</Button>
                <Button onClick={closeParent}>Cancelar</Button>
            </Space>
        </Portal>
        }
    </FormContainer>);
}

const ButtonIO = ({ data, onOutput, onInputDoser, onOutputDoser }) => {
    return (<>
        {(data?.arranque && data?.n_lote) ? <Button icon={<LogoutOutlined />} size="small" onClick={() => onOutput(data)}>Saída</Button> : <></>}
        {(data?.arranque && !data?.n_lote) ? <Button icon={<LoginOutlined />} size="small" onClick={() => onInputDoser(data)}>Entrada doseador</Button> : <></>}
        {(!data?.arranque && data?.n_lote) ? <Dropdown.Button size="small" trigger={["click"]} onClick={() => onOutputDoser(data)} menu={{
            onClick: () => onOutput(data),
            items: [
                {
                    label: 'Saída de Linha',
                    key: 'output',
                    icon: <LogoutOutlined />,
                }]
        }}
        ><LoginOutlined />Saída Doseador</Dropdown.Button>
            : <></>}
    </>);
}

export default ({ setFormTitle, lastValue, setLastValue, parentRef, closeParent, minItems = 1, maxItems = 5 }) => {
    const permission = usePermission({ allowed: {} });
    const { openNotification } = useContext(AppContext);
    const submitting = useSubmitting(true);
    const tableCls = useTableStyles();
    const value = useRef('');
    const pick = useRef(true);
    const ref = useRef(null);
    const [current, setCurrent] = useState('');
    const [status, setStatus] = useState(true);
    const [form] = Form.useForm();
    const dataAPI = useDataAPI({ payload: { parameters: {}, pagination: { enabled: false }, filter: {} } });
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "output": return <Output data={modalParameters.parameters.data} openNotification={modalParameters.parameters.openNotification} loadParentData={modalParameters?.loadData} column="" parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    /*     const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/lotespick`, {
            onOpen: () => console.log(`Connected to Web Socket`),
            onError: (event) => { console.error(event); },
            shouldReconnect: (closeEvent) => true,
            reconnectInterval: 3000
        }); */

    // useEffect(() => {
    //     if (lastJsonMessage !== null) {
    //         setLastValue(prev => ({ ...prev?.last && { last: { ...prev?.last } }, type: prev?.type, picked: true, row: { id: uuIdInt(0).uuid(), t_stamp: Date(), notValid: 1, qty_consumed: 0, qty_reminder: lastJsonMessage.row.qty_lote, ...lastJsonMessage.row }, error: lastJsonMessage.error }));
    //     }
    // }, [lastJsonMessage]);

    const onPick = async () => {
        if (current !== '') {
            if (!dataAPI.hasData()) {
                setCurrent("");
                return;
            }
            submitting.trigger();
            const v = current.startsWith("000026") ? current.replace("000026", "") : current.startsWith("\\000026") ? current.replace("\\000026", "") : current;
            setCurrent("");
            const items = form.getFieldsValue(true).items;
            for (const [i, item] of items.entries()) {
                //v1 has value 1, v2 has value 2
                if (!item?.v1 || !item?.v2) {
                    if (DOSERS.some(x => x.value === v.toUpperCase())) {
                        let av = (item?.row?.dosers) ? item?.row?.dosers.split(",") : [];
                        if (!av.includes(v.toUpperCase())) {
                            av.push(v.toUpperCase());
                        } else {
                            av.splice(av.indexOf(v.toUpperCase()), 1);
                        }
                        form.setFieldValue(["items", i, "v2"], true);
                        form.setFieldValue(["items", i, "row", "dosers"], av.join());
                    } else {
                        const pickValues = v.split(";");
                        if (pickValues.length >= 5) {
                            const data = await loadLoteQuantity({ value: pickValues });
                            form.setFieldValue(["items", i, "message"], data?.title);
                            form.setFieldValue(["items", i, "row"], { dosers: form.getFieldValue(["items", i, "row"])?.dosers, ...data?.row, valid: (data?.status !== "success" ? false : true), artigo_cod: pickValues[0], vcr_num: pickValues[4] });
                            form.setFieldValue(["items", i, "v1"], true);
                            if (data?.status !== "success") {
                                openNotification(data?.status, 'top', "Notificação", data?.title, null);
                                form.setFieldValue(["items", i, "valid"], false);
                            }
                        }
                    }
                    //Check formulação
                    const _row = form.getFieldValue(["items", i, "row"]);
                    if (_row?.dosers && _row?.valid) {
                        const valid = dataAPI.getData().rows.find(v => _row?.dosers.split(',').every(item => v.dosers.split(',').includes(item)) && v.artigo_cod === _row?.artigo_cod && v.n_lote !== _row?.n_lote);
                        form.setFieldValue(["items", i, "row", "group_id"], valid ? valid?.cuba : null);
                        form.setFieldValue(["items", i, "valid"], valid ? true : false);
                    }
                    break;
                }
            }
            await submitting.end(100);
        }
    }

    const keydownHandler = async (e, obj) => {
        //e.preventDefault();
        const keyCode = (e === null) ? obj.keyCode : e.keyCode;
        if (keyCode == 9 || keyCode == 13) {
            onPick();
        }
    };

    const focusIn = (e, src = null) => {
        if (e?.srcElement?.className === "ant-input-number-input" || e?.srcElement?.className === "ant-select-selection-search-input") {
            setStatus(false);
            pick.current = false;
        } else {
            setStatus(true);
            pick.current = true;
            ref.current.focus();
        }
    }
    const focusOut = (e, src) => {
        // if (e?.srcElement?.className !== "ant-input-number-input" && e?.srcElement?.className !== "ant-select-selection-search-input") {
        setStatus(false);
        pick.current = false;
        // }
    }

    const onChange = (e) => {
        setCurrent(e.target.value);
        value.current = e.target.value;
    }

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ signal: controller.signal });
        ref.current.focus();
        //document.body.addEventListener('keydown', keydownHandler);
        document.body.addEventListener('focusout', focusOut);
        document.body.addEventListener('focusin', focusIn);
        //window.addEventListener('paste', paste);

        const items = [...Array(maxItems).fill(0).map((x, i) => ({ v1: null, v2: null, required: i <= (minItems - 1) ? true : false }))];
        form.setFieldsValue({ items });

        return () => {
            //document.body.removeEventListener('keydown', keydownHandler);
            document.body.removeEventListener('focusout', focusOut);
            document.body.removeEventListener('focusin', focusIn);
            controller.abort();
            (interval) && clearInterval(interval);
            //window.removeEventListener('paste', paste);
        };
    }, []);

    const loadData = async ({ signal } = {}) => {
        submitting.trigger();
        const rows = await loadGranuladoInline(signal);
        dataAPI.setData({ rows, total: rows.length }, { update: true });
        submitting.end();
    }

    const clearRow = async (i) => {
        submitting.trigger();
        form.setFieldValue(["items", i, "v1"], null);
        form.setFieldValue(["items", i, "v2"], null);
        form.setFieldValue(["items", i, "message"], null);
        form.setFieldValue(["items", i, "row"], null);
        form.setFieldValue(["items", i, "valid"], null);
        await submitting.end(100);
    }

    const onConfirm = async (i) => {
        if (form.getFieldValue(["items", i, "valid"]) === true) {
            let response = null;
            try {
                response = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: form.getFieldValue(["items", i, "row"]), sort: [], parameters: { method: "AddGranuladoToLine" } });
                if (response.data.status !== "error") {
                    openNotification(response.data.status, 'top', "Notificação", response.data.title);
                    await clearRow(i);
                } else {
                    openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
                }
            } catch (e) {
                openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
            } finally {
                submitting.end();
            };
        }
    }

    const onOutput = (data) => {
        setModalParameters({ content: "output", type: "drawer", title: `Saída ${data.n_lote} ${data.artigo_des}`, push: false, width: "550px", loadData: loadData, parameters: { openNotification, data } });
        showModal();
    };
    const onInputDoser = async (data) => {
        let response = null;
        try {
            response = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: data, sort: [], parameters: { method: "AddDoserToLine" } });
            if (response.data.status !== "error") {
                openNotification(response.data.status, 'top', "Notificação", response.data.title);
                loadData();
            } else {
                openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
            }
        } catch (e) {
            openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        } finally {
            submitting.end();
        };
    }
    const onOutputDoser = async (data) => {
        let response = null;
        try {
            response = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: data, sort: [], parameters: { method: "RemoveDoserFromLine" } });
            if (response.data.status !== "error") {
                openNotification(response.data.status, 'top', "Notificação", response.data.title);
                loadData();
            } else {
                openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
            }
        } catch (e) {
            openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        } finally {
            submitting.end();
        };
    }


    const backgroundColor = (i) => {
        if (form.getFieldValue(["items", i, "valid"]) === true) {
            return "#d9f7be";
        }
        if (form.getFieldValue(["items", i, "valid"]) === false || form.getFieldValue(["items", i, "row"]?.valid === false)) {
            return "#ffccc7";
        }
        return "#f5f5f5";
    }

    const rowClassName = ({ data }) => {
        if (!data?.n_lote || !data?.arranque) {
            return tableCls.error;
        }
    }

    const columns = [
        ...(true) ? [{ name: 'cuba', header: 'Cuba', userSelect: true, showColumnMenuTool: false, defaultLocked: true, width: 90, render: (p) => <div style={{ display: "flex", justifyContent: "center" }}><Cuba value={p.data?.cuba} /></div> }] : [],
        ...(true) ? [{ name: 'dosers', header: 'Doseador', userSelect: true, showColumnMenuTool: false, defaultLocked: true, width: 95, render: (p) => <div style={{ display: "flex", justifyContent: "center" }}>{p.data?.dosers}</div> }] : [],
        ...(true) ? [{ name: 'baction', header: '', minWidth: 160, maxWidth: 160, render: ({ data }) => <ButtonIO data={data} onOutput={onOutput} onInputDoser={onInputDoser} onOutputDoser={onOutputDoser} /> }] : [],
        ...(true) ? [{ name: 'artigo_cod', header: 'Artigo', userSelect: true, showColumnMenuTool: false, minWidth: 170, flex: 1, render: (p) => <div style={{ fontWeight: 700 }}>{p.data?.artigo_cod}</div> }] : [],
        ...(true) ? [{ name: 'n_lote', header: 'Lote', userSelect: true, showColumnMenuTool: false, minWidth: 170, flex: 1, render: (p) => <div style={{ fontWeight: 700 }}>{p.data?.n_lote}</div> }] : [],
        ...(true) ? [{ name: 'artigo_des', header: 'Designação', userSelect: true, showColumnMenuTool: false, flex: 2, minWidth: 170, render: (p) => <div style={{}}>{p.data?.artigo_des}</div> }] : [],
        ...(true) ? [{ name: 'qty_lote', header: 'Qtd.', userSelect: true, showColumnMenuTool: false, width: 120, render: (p) => <RightAlign unit="kg">{p.data?.qty_lote}</RightAlign> }] : [],
        ...(true) ? [{ name: 'arranque', header: 'Arranque', userSelect: true, showColumnMenuTool: false, width: 120, render: (p) => <RightAlign unit="%">{p.data?.arranque}</RightAlign> }] : [],
        ...(true) ? [{ name: 't_stamp', header: 'Data', userSelect: true, showColumnMenuTool: false, width: 120, render: (p) => <div style={{}}>{p.data?.t_stamp && dayjs(p.data.t_stamp).format(DATETIME_FORMAT)}</div> }] : [],
        ...(true) ? [{ name: 'vcr_num', header: 'Movimento', userSelect: true, showColumnMenuTool: false, minWidth: 170, flex: 1, render: (p) => <div style={{}}>{p.data?.vcr_num}</div> }] : [],
    ]

    // const columns=[
    //     ...(true) ? [{ name: 'id', header: 'Movimento', userSelect: true, showColumnMenuTool: false, minWidth: 170, flex: 1,render: p =><div onClick={()=>console.log(p)}>gggg</div> }] : [],
    //     ...(true) ? [{ name: 'baction', header: 'h', minWidth: 90, maxWidth: 90, render: p => <Button icon={<LogoutOutlined />} size="small" onClick={() => onOutput(p)}>Saída {p.data.artigo_cod}</Button> }] : [],
    // ]

    return (
        <div style={{ width: "100%", height: "100vh" }} tabIndex={0}>
            {!setFormTitle && <TitleForm auth={permission.auth} data={null} onChange={null} level={location?.state?.level} form={null} />}
            <FormContainer loading={submitting.state} id="pick-container" wrapForm form={form} wrapFormItem={true} fluid style={{ padding: "0px", margin: "0px 2px 10px 0px" }}>
                <Row align='center' gutterWidth={5} style={{ padding: "0px 15px 0px 15px" }}>
                    <Col>
                        <Row align='center' gutterWidth={5} style={{ border: status ? "solid 2px #1890ff" : "solid 2px #f0f0f0", borderRadius: "3px", height: "50px", margin: "10px 0px" }}>
                            {/* <Col width={100} style={{ fontSize: "22px", fontWeight: 700, display: "flex", justifyContent: "center" }}><Button type='primary'>Confirmar</Button></Col> */}
                            <Col style={{ fontSize: "22px", fontWeight: 700 }}><Input style={{ border: "0px", fontSize: "18px", fontWeight: 700, height: "38px" }} ref={ref} value={current} onChange={onChange} onKeyDown={keydownHandler} /></Col>
                        </Row>
                    </Col>
                    {/* <Col xs='content'><Button icon={<SnippetsOutlined />} onClick={paste} title="Colar" /></Col> */}
                </Row>

                <Form.List name="items">
                    {(fields, { add, remove, move }) => {
                        const addRow = (fields, duplicate = false) => {
                            //if (fields.length === 0) {
                            //if (duplicate) {
                            //    add(form.getFieldValue(["destinos", duplicate.name]));
                            //} else {
                            //    add({ cliente: null, largura: p.row.lar, obs: null });
                            //}
                            //} else {
                            //    add({ [`min`]: null, [`max`]: null, "unit": unit, ...(type == "ff" && { "type": "Desbobinagem" }) });
                            //}
                        }
                        const removeRow = (fieldName, field) => {
                            remove(fieldName);
                        }
                        const moveRow = (from, to) => {
                            //move(from, to);
                        }
                        return (
                            <Row nogutter>
                                <Col>
                                    <YScroll>
                                        <Container fluid>
                                            {fields.map((field, index) => (
                                                <React.Fragment key={field.key}>
                                                    {(form.getFieldValue(["items", index, "v1"]) || form.getFieldValue(["items", index, "v2"])) && <Row nogutter style={{ padding: "2px", marginBottom: "2px", borderRadius: "3px", border: "1px solid rgba(5, 5, 5,0.1)", borderRadius: "3px", background: backgroundColor(index) /* background: index % 2 ? "#d9eaff" : "#e9f3ff" */ }}>
                                                        {maxItems !== 1 && <Col width={30} style={{ display: "flex", flexDirection: "column", alignItems: "center", fontWeight: 700, fontSize: "18px", justifyContent: "center" }}><div>{(form.getFieldValue(["items", index, "required"])) && <span style={{ color: "red" }}>*</span>}{index + 1}</div></Col>}
                                                        <Col width={180} style={{ fontSize: "12px", display: "flex", justifyContent: "center", alignSelf: "center" }}>
                                                            {form.getFieldValue(["items", index, "valid"]) === true && <Dropdown.Button style={{ width: "100px" }} onClick={() => onConfirm(index)} menu={{ items: [{ key: "1", label: "Cancelar", icon: <CloseCircleOutlined /> }], onClick: () => clearRow(index) }}>Confirmar</Dropdown.Button>}
                                                            {form.getFieldValue(["items", index, "valid"]) !== true && <Button icon={<CloseCircleOutlined />} style={{ width: "100px" }} onClick={() => clearRow(index)}>Cancelar</Button>}
                                                        </Col>
                                                        <Col style={{ fontSize: "12px" }}>
                                                            <Row>
                                                                <Col xs={12} width={150}>
                                                                    <Row align='center' gutterWidth={5}><Col>Doseador(es)</Col></Row>
                                                                    <Row align='center' gutterWidth={5}><Col style={{ fontSize: "12px", fontWeight: 700 }}>{form.getFieldValue(["items", index, "row"])?.dosers}</Col></Row>
                                                                </Col>
                                                                {form.getFieldValue(["items", index, "v1"]) === true && <Col xs={12} width={150}>
                                                                    <Row align='center' gutterWidth={5}><Col>Quantidade</Col></Row>
                                                                    <Row align='center' gutterWidth={5}><Col style={{ fontSize: "12px", fontWeight: 700 }}>{form.getFieldValue(["items", index, "row"])?.qty_lote && parseFloat(form.getFieldValue(["items", index, "row"])?.qty_lote).toFixed(2)} {form.getFieldValue(["items", index, "row"])?.unit?.toLowerCase()}</Col></Row>
                                                                </Col>}
                                                                {/*                                                                 <Col style={{fontStyle:"italic", display:"flex",justifyContent:"center"}}>
                                                                    {form.getFieldValue(["items", index, "message"])}
                                                                </Col> */}
                                                            </Row>



                                                            {form.getFieldValue(["items", index, "v1"]) === true && <Row>
                                                                <Col>
                                                                    <Row align='center' gutterWidth={5}><Col>Artigo</Col></Row>
                                                                    <Row align='center' gutterWidth={5}><Col style={{ fontSize: "12px", fontWeight: 700 }}>{form.getFieldValue(["items", index, "row"])?.artigo_cod}</Col></Row>
                                                                </Col>
                                                                <Col>
                                                                    <Row align='center' gutterWidth={5}><Col>Lote</Col></Row>
                                                                    <Row align='center' gutterWidth={5}><Col style={{ fontSize: "12px", fontWeight: 700 }}>{form.getFieldValue(["items", index, "row"])?.n_lote}</Col></Row>
                                                                </Col>
                                                                <Col>
                                                                    <Row align='center' gutterWidth={5}><Col>Movimento</Col></Row>
                                                                    <Row align='center' gutterWidth={5}><Col style={{ fontSize: "12px", fontWeight: 700 }}>{form.getFieldValue(["items", index, "row"])?.vcr_num}</Col></Row>
                                                                </Col>
                                                            </Row>}
                                                        </Col>
                                                        {/* <Col style={{ display: "flex", flexDirection: "row", alignItems: "start", fontSize: "14px" }}>
                                                        <Row gutterWidth={5}>
                                                            <Col xs={8}>
                                                                <Field sh name={[field.name, `v1`]} label={{ enabled: false }}><Input onFocus={(e) => { e.stopPropagation(); }} style={{ border: "0px", fontWeight: 700 }} /></Field>
                                                            </Col>
                                                            <Col xs={4}>
                                                                <Field name={[field.name, `v2`]} label={{ enabled: false }}><Input onFocus={(e) => { e.stopPropagation(); }} style={{ border: "0px", fontWeight: 700 }} /></Field>
                                                            </Col>
                                                        </Row>
                                                    </Col> */}
                                                    </Row>}
                                                </React.Fragment>
                                            ))}
                                        </Container>
                                    </YScroll>
                                </Col>
                            </Row>
                        )
                    }
                    }
                </Form.List>
                {/* <Row align='center' gutterWidth={5}>
                    <Col>
                        I HAVE THE RESULT
                    </Col>
                </Row> */}

                <Row gutterWidth={5} style={{ padding: "0px 15px 0px 15px" }}>
                    <Col>
                        <Table
                            loading={submitting.state}
                            offsetHeight="220px"
                            idProperty="id"
                            local={true}
                            onRefresh={loadData}
                            rowClassName={rowClassName}
                            // loadOnInit={false}
                            // pagination={false}
                            // defaultLimit={20}
                            columns={columns}
                            dataAPI={dataAPI}
                            editable={{ enabled: false }}
                            //enableFiltering={false} //Column Filter...
                            //defaultFilterValue={defaultFilterValue}
                            moreFilters={false}
                            leftToolbar={false}
                            toolbarFilters={false}
                        />
                    </Col>
                </Row>
            </FormContainer >


        </div>
    );
}