import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import moment from 'moment';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
//import { WrapperForm, TitleForm, FormLayout, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission } from "utils/usePermission";
import { Status, FormPrint } from './commons';

const title = "Registo de Reciclado";
const TitleForm = ({ data, onChange, details, level }) => {
    return (<ToolbarTitle history={level === 0 ? [] : ['Reciclado Lotes']} title={
        <Col xs='content' style={{}}>
            <Row nogutter><Col><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title}</span></Col></Row>
            <Row nogutter><Col><Details details={details} minWidth="300px" maxWidth="600px" /></Col></Row>
        </Col>
    } />);
}

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const schemaWeigh = (options = {}) => {
    return getSchema({
        peso: Joi.number().positive().label("Peso").required(),
        estado: Joi.string().label("Estado").required(),
        obs: Joi.when('estado', { is: "R", then: Joi.number().required() })
    }, options).unknown(true);
}

const ActionContent = ({ dataAPI, hide, onClick, ...props }) => {
    const items = [
        { label: 'Eliminar Entrada', key: 'delete', icon: <DeleteOutlined /> }
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<></>);
}


const Blinker = styled.div`
    animation: blinker 1s linear infinite;
    font-weight:700;
    font-size:22px;
    margin-right:3px;
    font-family:'Times New Roman', serif;
    @keyframes blinker {
        50% { opacity: 0; }
    }
`;

const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    }
});

const PickContent = ({ lastValue, setLastValue, onChange, parentRef, closeParent }) => {
    const value = useRef('');
    const pick = useRef(true);
    const [current, setCurrent] = useState('');
    const [status, setStatus] = useState(true);
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/lotespick`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000
    });

    useEffect(() => {
        if (lastJsonMessage !== null) {
            setLastValue({ picked: true, row: { id: uuIdInt(0).uuid(), timestamp: Date(), notValid: 1, ...lastJsonMessage.row }, error: lastJsonMessage.error });
        }
    }, [lastJsonMessage]);

    const onPick = () => {

        if (value.current !== '') {
            const v = value.current.startsWith("000026") ? value.current.replace("000026", "") : value.current.startsWith("\\000026") ? value.current.replace("\\000026", "") : value.current;
            const isElasticBand = v.match(/^\d{4}\d{2}\d{2}-\d{2}-\d{2}$/g);
            let type = "nw";
            if (isElasticBand) {
                type = "elasticband";
            } else {
                if (v.match(/^\d{4}\d{2}\d{2}-\d{2}$/g)) {
                    type = "bobinagem";
                }
            }

            sendJsonMessage({ cmd: 'getlotequantity', lote: v, type: type, unit: isElasticBand ? "m2" : "kg" });
            value.current = '';
            setCurrent(value.current);
        }
    }

    const keydownHandler = async (e, obj) => {
        if (e.srcElement.name === "qtd" || e.srcElement.name === "unit" || !pick.current) {
            return;
        }
        e.preventDefault();
        const keyCode = (e === null) ? obj.keyCode : e.keyCode;
        if (keyCode == 9 || keyCode == 13) {
            onPick();
        } else if ((keyCode >= 48 && keyCode <= 90) || (keyCode >= 96 && keyCode <= 111) || keyCode == 186 || keyCode == 188 || keyCode == 110 || keyCode == 190 || keyCode == 189) {
            value.current = `${value.current}${e.key}`;
            setCurrent(value.current);
        } else if (keyCode == 16 || keyCode == 18) {

        } else if (keyCode === 8) {
            value.current = value.current.slice(0, -1);
            setCurrent(value.current);
        }
        else {
            value.current = '';
            //setLastValue('');
        }
    };

    const focusIn = (e, src = null) => {
        if (e?.srcElement?.className === "ant-input-number-input" || e?.srcElement?.className === "ant-select-selection-search-input") {
            setStatus(false);
            pick.current = false;
        } else {
            setStatus(true);
            pick.current = true;
        }
    }
    const focusOut = (e, src) => {
        if (e?.srcElement?.className !== "ant-input-number-input" && e?.srcElement?.className !== "ant-select-selection-search-input") {
            setStatus(false);
            pick.current = false;
        }
    }
    const paste = async (e) => {
        value.current = await navigator.clipboard.readText();
        setCurrent(value.current);
    }

    useEffect(() => {
        document.body.addEventListener('keydown', keydownHandler);
        document.body.addEventListener('focusout', focusOut);
        document.body.addEventListener('focusin', focusIn);
        //window.addEventListener('paste', paste);
        return () => {
            document.body.removeEventListener('keydown', keydownHandler);
            document.body.removeEventListener('focusout', focusOut);
            document.body.removeEventListener('focusin', focusIn);
            //window.removeEventListener('paste', paste);
        };
    }, []);
    return (<><FormContainer id="pick-container">
        {lastValue.row?.lote && <>
            <Row style={lastValue.error === null ? { border: "solid 1px #b7eb8f", background: "#f6ffed", padding: "5px" } : { border: "solid 1px #ffccc7", background: "#fff2f0", padding: "5px" }}>
                <Col>
                    <Row align='center' gutterWidth={5}>
                        <Col>{lastValue.error === null ? "Último lote registado:" : lastValue.error}</Col>
                        <Col style={{ maxWidth: "95px", width: "95px" }}>Quantidade</Col>
                        <Col style={{ maxWidth: "100px", width: "100px" }}>Unidade Medida</Col>
                    </Row>
                    <Row gutterWidth={5} align='center'>
                        <Col style={{ fontSize: "14px", fontWeight: 700 }}>{lastValue.row.lote}</Col>
                        <Col style={{ maxWidth: "95px", width: "95px" }}><InputNumber value={lastValue.row?.qtd} width={100} name='qtd' size="large" min={0} onFocus={(e) => focusIn(e, "input")} onBlur={(e) => focusOut(e, "input")} onChange={(v) => onChange(v, 'qtd')} /></Col>
                        <Col style={{ maxWidth: "100px", width: "100px" }}><Select optionLabelProp="label" defaultValue="m2" style={{ width: "60px" }} value={lastValue.row?.unit} name='unit' size="large" options={[{ value: "m", label: "m" }, { value: "kg", label: "kg" }, { value: "m2", label: <div>m&sup2;</div> }]} onChange={(v) => onChange(v, 'unit')} onFocus={(e) => focusIn(e, "select")} onBlur={(e) => focusOut(e, "select")} /></Col>
                    </Row>
                </Col>
            </Row>
        </>}
        <Row align='center' gutterWidth={5}><Col>
            <Row align='center' gutterWidth={5} style={{ border: status ? "solid 2px #1890ff" : "solid 2px #f0f0f0", height: "50px", margin: "10px 0px" }}>
                {status && <Col xs="content"><Blinker>|</Blinker></Col>}
                <Col style={{ fontSize: "22px", fontWeight: 700 }}>{value.current}</Col>
            </Row>
        </Col>
            <Col xs='content'><Button icon={<SnippetsOutlined />} onClick={paste} title="Colar" /></Col>
        </Row>
    </FormContainer>
        {parentRef && <Portal elId={parentRef.current}>
            <Space>
                <Button disabled={current === ''} type="primary" onClick={onPick}>Registar</Button>
                <Button onClick={closeParent}>Cancelar</Button>
            </Space>
        </Portal>
        }
    </>);
}

const loadProdutoGranuladoLookup = async (signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/produtogranuladolookup/`, filter: {}, sort: [], signal });
    return rows;
}
const WeighContent = ({ loteId, parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);


    const [produtoGranulado, setProdutoGranulado] = useState([]);
    const estado = [{ id: "G", txt: "GOOD" }, { id: "R", txt: "REJEITADO" }];
    const tara = [{ id: 15, txt: "15 kg" }, { id: 30, txt: "30 kg" }]

    const loadData = async ({ loteId, signal } = {}) => {
        const pg = await loadProdutoGranuladoLookup(signal);
        setProdutoGranulado(pg);
        submitting.end();
    };

    useEffect(() => {
        const controller = new AbortController();
        loadData({ loteId, signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (values) => {
        submitting.trigger();
        const v = schemaWeigh().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        const { errors, warnings, value, ...status } = getStatus(v);
        if (errors === 0) {
            try {
                let response = await fetchPost({ url: `${API_URL}/pesarreciclado/`, filter: { id: loteId }, parameters: values });
                if (response.data.status !== "error") {
                    loadParentData();
                } else {
                    status.formStatus.error.push({ message: response.data.title });
                    setFormStatus({ ...status.formStatus });
                }
            } catch (e) {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            };
        }
        submitting.end();
    }

    const onValuesChange = (changedValues, values) => {

    }

    return (
        <Form form={form} name={`f-wlote`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{ produto: 1, tara: 15, estado: "G" }}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-WLOTE" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaWeigh} wrapFormItem={true} forInput={true}>
                <Row style={{}} gutterWidth={10}>
                    <Col xs={6}><Field wrapFormItem={true} name="produto" label={{ enabled: true, text: "Produto" }}><SelectField style={{ width: "100%" }} size="small" keyField="id" textField="produto_granulado" data={produtoGranulado} /></Field></Col>
                    <Col xs={3}><Field wrapFormItem={true} name="estado" label={{ enabled: true, text: "Estado" }} alert={{ tooltip: true, pos: "none" }}><SelectField style={{ width: "100%" }} size="small" keyField="id" textField="txt" data={estado} /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col xs={3}><Field wrapFormItem={true} name="peso" label={{ enabled: true, text: "Peso" }} alert={{ tooltip: true, pos: "none" }}><InputNumber size="small" style={{ width: "100%" }} addonAfter="kg" /></Field></Col>
                    <Col xs={3}><Field wrapFormItem={true} name="tara" label={{ enabled: true, text: "Tara" }}><SelectField style={{ width: "100%" }} size="small" keyField="id" textField="txt" data={tara} /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field wrapFormItem={true} name="obs" label={{ enabled: true, text: "Observações" }} allValues={{ "estado": form.getFieldValue("estado") }} alert={{ tooltip: true, pos: "none" }}><TextArea size="small" rows={4} maxLength={500} /></Field></Col>
                </Row>
            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Registar</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}

const Details = ({ details, maxWidth, minWidth }) => {
    return (
        <>
            {details && <div style={{ minWidth, maxWidth, margin: "15px 0px" }}>
                <Container style={{ border: "1px solid rgba(0,0,0,.06)" }} fluid>
                    <Row style={{ background: "#f0f0f0", borderBottom: "1px solid rgba(0,0,0,.06)" }}>
                        <Col style={{ width: "200px", borderRight: "1px solid rgba(0,0,0,.06)" }}>Lote</Col>
                        <Col style={{ width: "200px", borderRight: "1px solid rgba(0,0,0,.06)" }}>Produto</Col>
                        {
                            details.status === 1 && <>
                                <Col xs={2} style={{ borderRight: "1px solid rgba(0,0,0,.06)" }}>Estado</Col>
                                <Col xs={2} style={{ borderRight: "1px solid rgba(0,0,0,.06)" }}>Peso</Col>
                                <Col xs={2}>Tara</Col>
                            </>
                        }
                    </Row>
                    <Row>
                        <Col style={{ width: "200px", borderRight: "1px solid rgba(0,0,0,.06)" }}><b>{details.lote}</b></Col>
                        <Col style={{ width: "200px", borderRight: "1px solid rgba(0,0,0,.06)" }}><b>{details.produto_granulado}</b></Col>
                        {
                            details.status === 1 && <>
                                <Col xs={2} style={{ borderRight: "1px solid rgba(0,0,0,.06)", textAlign: "center" }}><Status estado={details.estado} /></Col>
                                <Col xs={2} style={{ borderRight: "1px solid rgba(0,0,0,.06)" }}>{details.peso}</Col>
                                <Col xs={2}>{details.tara}</Col>
                            </>
                        }
                    </Row>
                </Container>
            </div>}
        </>
    );
}

const loadRecicladoLookup = async (id, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/recicladolookup/`, filter: { id }, sort: [], signal });
    return rows;
}

const source = (v) => {
    if (v === 'elasticband') {
        return "ELASTIC BAND";
    } else if (v === 'nw') {
        return "NONWOVEN";
    } else if (v === 'bobinagem') {
        return "BOBINAGEM";
    } else if (v === 'bobinagem_ba') {
        return "BOBINAGEM ARRANQUE";
    } else if (v === 'bobinagem_r') {
        return "BOBINAGEM REJEITADA";
    }
    return "";
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, forInput = true }) => {
    const location = useLocation();
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/recicladoloteslist/`, parameters: {}, pagination: { enabled: false, limit: 200 }, filter: { reciclado_id: location?.state?.id }, sort: [] } });
    /*     const [selectedRows, setSelectedRows] = useState(() => new Set());
        const [newRows, setNewRows] = useState([]); */
    const [details, setDetails] = useState();
    const submitting = useSubmitting(true);
    const primaryKeys = ['id'];
    const columns = [
        //{ key: 'print', name: '',  minWidth: 45, width: 45, sortable: false, resizable: false, formatter:props=><Button size="small"><PrinterOutlined/></Button> },
        { key: 'lote', sortable: false, name: 'Lote', formatter: p => <b>{p.row.lote}</b> },
        { key: 'source', sortable: false, name: 'Origem', formatter: p => source(p.row.source) },
        { key: 'itm', sortable: false, name: 'Artigo', formatter: p => p.row.itm },
        { key: 'itm_des', sortable: false, name: 'Artigo Des.', formatter: p => p.row.itm_des },
        { key: 'qtd', sortable: false, name: 'Quantidade', minWidth: 95, width: 95, formatter: p => parseFloat(p.row.qtd).toFixed(2), editor: p => <InputNumber bordered={false} size="small" value={p.row.qtd} ref={(el, h,) => { el?.focus(); }} onChange={(e) => p.onRowChange({ ...p.row, qtd: e === null ? 0 : e, notValid: 1 }, true)} min={0} /> },
        { key: 'unit', sortable: false, name: 'Unidade', minWidth: 95, width: 95, editor: p => <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.unit} ref={(el, h,) => { el?.focus(); }} onChange={(v) => p.onRowChange({ ...p.row, unit: v, notValid: 1 }, true)} size="small" keyField="value" textField="label" data={[{ value: "m", label: "m" }, { value: "kg", label: "kg" }, { value: "m2", label: <div>m&sup2;</div> }]} /> },
        { key: 'timestamp', sortable: false, name: 'Data', formatter: props => moment(props.row.timestamp).format(DATETIME_FORMAT) },
        { key: 'delete', name: '', cellClass: classes.noOutline, minWidth: 45, width: 45, sortable: false, resizable: false, formatter: props => <Button disabled={details?.status === 1} size="small" onClick={() => onDelete(props.row, props)}><DeleteOutlined /* style={{ color: "#cf1322" }} */ /></Button> }
    ];
    const [modalParameters, setModalParameters] = useState({});
    const [showPickingModal, hidePickingModal] = useModal(({ in: open, onExited }) => {
        const [lastValue, setLastValue] = useState({ picked: false, row: {}, error: null });
        const [dirty, setDirty] = useState(false);
        useEffect(() => {
            if (lastValue.picked && lastValue.error === null) {
                const idx = dataAPI.getData().rows ? dataAPI.getData().rows.findIndex(x => (x.lote === lastValue.row.lote && x.source===lastValue.row.source)) : -1;
                if (idx === -1) {
                    dataAPI.addRow({ ...lastValue.row }, primaryKeys, 0);
                    setLastValue(prev => ({ ...prev, picked: false }));
                } else {
                    setLastValue(prev => ({ ...prev, error: "O Lote já foi registado!", picked: false }));
                }
            } else {
                setLastValue(prev => ({ ...prev, picked: false }));
            }
        }, [lastValue.picked]);
        const onChange = (v, f) => {
            const rows = dataAPI.getData().rows;
            const idx = rows.findIndex(x => x.lote === lastValue.row.lote);
            if (idx > -1) {
                rows[idx][f] = v;
                dataAPI.setRows([...rows], rows.length);
                setLastValue(prev => ({ ...prev, row: { ...prev?.row, [f]: v } }));
            }

        }
        return <ResponsiveModal title={<div style={{ display: "flex", flexDirection: "row" }}><div><SyncOutlined spin /></div><div style={{ marginLeft: "5px" }}>Registo de Lotes em Curso...</div></div>}
            onCancel={hidePickingModal}
            /*onOk={() => onPickFinish(lastValue)} */
            width={600} height={200} footer="ref">

            <PickContent lastValue={lastValue} setLastValue={setLastValue} onFinish={onPickFinish} onChange={onChange} />
        </ResponsiveModal>;
    }, [dataAPI.getTimeStamp()]);
    const [showWeighModal, hideWeighModal] = useModal(({ in: open, onExited }) => {
        return <ResponsiveModal title={`Pesar Reciclado ${modalParameters.lote}`}
            onCancel={hideWeighModal}
            //onOk={() => onPickFinish(lastValue)}
            width={600} height={340} footer="ref" >
            <WeighContent loteId={location?.state?.id} loadParentData={loadData} />
        </ResponsiveModal>;
    }, [dataAPI.getTimeStamp(), modalParameters]);
    const [showPrintModal, hidePrintModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal title={modalParameters.title} footer="none" onCancel={hidePrintModal} width={350} height={180}><FormPrint v={{ ...modalParameters }} /></ResponsiveModal>
    ), [modalParameters]);


    const loadData = async ({ signal } = {}) => {
        const _details = await loadRecicladoLookup(location?.state?.id, signal);
        if (_details.length > 0) {
            setDetails(_details[0]);
            submitting.end();
        }
    };

    useEffect(() => {
        (setFormTitle) && setFormTitle({ title });
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onPickFinish = (values) => { console.log("picking", values) };

    const deleteRow = async ({ id, dataAPI }) => {
        const status = { error: [], warning: [], info: [], success: [] };
        submitting.trigger();
        try {
            const response = await fetchPost({ url: `${API_URL}/deleterecicladoitem/`, filter: { id } });
            if (response.data.status !== "error") {
                dataAPI.fetchPost();
            } else {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro a eliminar', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{response.data.title}</YScroll></div></div> });
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro a eliminar', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        } finally {
            submitting.end();
        }
    }

    const onDelete = (row, props) => {
        if (row?.notValid === 1) {
            //remove locally
            Modal.confirm({ title: <div>Remover a entrada do Lote: <span style={{ color: "#cf1322", fontWeight: 900 }}>{row.lote}</span> ?</div>, onOk: () => dataAPI.deleteRow({ id: row.id }, primaryKeys) });
        }
        else {
            Modal.confirm({ title: <div>Remover a entrada do Lote: <span style={{ color: "#cf1322", fontWeight: 900 }}>{row.lote}</span> ?</div>, onOk: () => deleteRow({ id: row.id, dataAPI }, primaryKeys) });
        }
    };
    const onSave = async () => {
        const status = { error: [], warning: [], info: [], success: [] };
        submitting.trigger();
        try {
            let exists = dataAPI.getData().rows.some(v=>v.notValid===1 && (v.qtd===0 || v?.qtd===undefined || v?.qtd===null) );
            if (exists===true){
                throw new Error('A quantidade de cada um dos lotes tem de ser maior que zero!');
            }
            const response = await fetchPost({ url: `${API_URL}/saverecicladoitems/`, parameters: { id: details.id, rows: dataAPI.getData().rows }, dates: [{ key: "timestamp", format: DATETIME_FORMAT }] });
            if (response.data.status !== "error") {
                //navigate('/app/picking/pickreciclado', { state: { id: response.data.id[0] } });
                setFormStatus({ ...status });
                dataAPI.fetchPost();
            } else {
                status.error.push({ message: response.data.title });
                setFormStatus({ ...status });
            }
        } catch (e) {
            Modal.error({content:e.message});
            //status.error.push({ message: e.message });
            //setFormStatus({ ...status });
        } finally {
            submitting.end();
        }
    }

    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };

    /*     useEffect(() => {
            if (dataAPI.hasData()) {
                console.log("dddddd", details?.status, dataAPI.getData().rows, dataAPI.getData().rows.filter(v => {
                    console.log("######---------->", v?.notValid)
                    return v?.notValid === null
                }).length);
            }
        }, [dataAPI.hasData(), details]); */

    const onPrint = () => {
        setModalParameters({ reciclado: details, title: `Imprimir Etiqueta Reciclado ${details.lote} ` });
        showPrintModal();
    }
    const onPrintOld = () => {
        setModalParameters({ old:true, reciclado: details, title: `Imprimir Etiqueta Reciclado ${details.lote} ` });
        showPrintModal();
    }

    return (
        <YScroll>
            {!setFormTitle && <TitleForm data={dataAPI.getAllFilter()} onChange={onFilterChange} details={details} level={location?.state?.level} />}
            <AlertsContainer mask formStatus={formStatus} portal={false} style={{ margin: "5px" }} />
            <Table
                //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
                reportTitle={title}
                loadOnInit={true}
                columns={columns}
                dataAPI={dataAPI}
                //actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                toolbar={true}
                search={false}
                moreFilters={false}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={false}
                rowClass={(row) => (row?.notValid === 1 ? classes.notValid : undefined)}
                //selectedRows={selectedRows}
                //onSelectedRowsChange={setSelectedRows}
                leftToolbar={<>
                    {/* <Button disabled={details?.status < 1} type='primary' icon={<PrinterOutlined />} onClick={onPrint} style={{ marginLeft: "5px" }}>Imprimir Etiqueta New</Button> */}
                    <Button disabled={details?.status < 1} type='primary' icon={<PrinterOutlined />} onClick={onPrintOld} style={{ marginLeft: "5px" }}>Imprimir Etiqueta</Button>
                    {details?.status === 0 && <Button disabled={submitting.state} type='primary' icon={<AppstoreAddOutlined />} onClick={showPickingModal}>Picar Lotes</Button>}
                    {(dataAPI.hasData() && dataAPI.getData().rows.filter(v => v?.notValid === 1).length > 0 && details?.status === 0) && <Button disabled={submitting.state} style={{ marginLeft: "5px" }} icon={<CheckOutlined />} onClick={onSave}> Guardar Registos</Button>}
                    {(dataAPI.hasData() && dataAPI.getData().rows.filter(v => v?.notValid !== 1).length > 0 && details?.status === 0) && <Button disabled={submitting.state} style={{ marginLeft: "5px" }} icon={<CheckOutlined />} onClick={() => { setModalParameters({ lote: details.lote }); showWeighModal(); }}>Pesar Lote de Reciclado</Button>}
                </>}
                //content={<PickHolder/>}
                //paginationPos='top'
                toolbarFilters={{ form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange, filters: <ToolbarFilters dataAPI={dataAPI} /> }}
            />
        </YScroll>
    );
}