import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import moment from 'moment';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit from "utils/loadInit";
import { API_URL, DOSERS } from "config";
import { useDataAPI } from "utils/useDataAPI";
//import { WrapperForm, TitleForm, FormLayout, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission } from "utils/usePermission";
import { Status } from './commons';
import { GoArrowUp } from 'react-icons/go';
import { ImArrowUp, ImArrowDown, ImArrowRight, ImArrowLeft } from 'react-icons/im';
import { Cuba } from "../currentline/dashboard/commons/Cuba";
import { MovGranuladoColumn } from "./commons"

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const title = "Registo Granulado - Entrada em Linha";
const cFormulacao = (record) => {
    let _formulacao = {};
    if (record?.formulacao) {
        for (let v of record.formulacao.items) {
            const _dosers = [];
            const _cuba = (v?.cuba_A) ? v?.cuba_A : v?.cuba_BC;
            if (v?.doseador_A) _dosers.push(v.doseador_A);
            if (v?.doseador_B) _dosers.push(v.doseador_B);
            if (v?.doseador_C) _dosers.push(v.doseador_C);
            const _cod = v.matprima_cod;
            const _des = v.matprima_des;
            if (_cod in _formulacao) {
                _formulacao[_cod].dosers = [..._formulacao[_cod].dosers, ..._dosers];
                _formulacao[_cod].cubas = [..._formulacao[_cod].cubas, _cuba];
            } else {
                _formulacao[_cod] = { dosers: _dosers, matprima_des: v.matprima_des, cubas: [_cuba] };
            }
        }
    }
    return _formulacao;
}
const TitleForm = ({ data, onChange, record, level, form }) => {
    const st = JSON.stringify(record.ofs)?.replaceAll(/[\[\]\"]/gm, "")?.replaceAll(",", " | ");

    return (<ToolbarTitle /* history={level === 0 ? [] : ['Registo Nonwovens - Entrada em Linha']} */ title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }}>
                <Col xs='content' style={{}}><Row nogutter><Col><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title}</span></Col></Row></Col>
                <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col>
            </Row>

        </Col>
    </>
    }
        details={
            <>{record.formulacao && Object.keys(record.formulacao).map((k, i) => {
                return (
                    <Row key={`if-${k}-${i}`}>
                        <Col width={60} style={{ display: "flex" }}>{[...new Set(record.formulacao[k].cubas)].map(v => <Cuba key={`${i}-${v}`} value={v} />)}</Col>
                        <Col width={100}><div style={{ textAlign: "center", fontSize: "14px" }}><b>{record.formulacao[k].dosers.join()}</b></div></Col>
                        <Col width={150}><div style={{ fontSize: "12px" }}>{k}</div></Col>
                        <Col><div style={{ fontSize: "12px" }}>{record.formulacao[k].matprima_des}</div></Col>
                    </Row>
                );
            })}</>
        }
    />);
}

const ActionContent = ({ dataAPI, hide, onClick, ...props }) => {
    const items = [
        { label: 'Eliminar Entrada', key: 'delete', icon: <DeleteOutlined /> }
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'>
            <Field name="fof" label={{ enabled: true, text: "Ordem de Fabrico", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="fartigo" label={{ enabled: true, text: "Artigo", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="fdata" label={{ enabled: true, text: "Data Entrada", pos: "top", padding: "0px" }}>
                <RangeDateField size='small' allowClear />
            </Field>
        </Col>
    </>
    );
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

const PickContent = ({ lastValue, setLastValue, onChange, parentRef, closeParent, formulacao }) => {
    const permission = usePermission({ allowed: {} });
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
            setLastValue(prev => ({ ...prev?.last && { last: { ...prev?.last } }, dosers: prev?.dosers, picked: true, row: { id: uuIdInt(0).uuid(), t_stamp: Date(), notValid: 1, qty_consumed: 0, qty_reminder: lastJsonMessage.row.qty_lote, ...lastJsonMessage.row }, error: lastJsonMessage.error }));
        }
    }, [lastJsonMessage]);

    const onPick = (formulacao) => {
        if (value.current !== '') {
            const v = value.current.startsWith("000026") ? value.current.replace("000026", "") : value.current.startsWith("\\000026") ? value.current.replace("\\000026", "") : value.current;
            if (DOSERS.some(x => x.value === v.toUpperCase())) {
                setLastValue(prev => {
                    let av = (prev?.dosers) ? prev.dosers.split(",") : [];
                    if (!av.includes(v)) {
                        av.push(v);
                    } else {
                        av.splice(av.indexOf(v), 1);
                    }
                    return { ...prev, picked: true, dosers: av.join() }
                });
                value.current = '';
                setCurrent(value.current);
            } else {
                const pickValues = v.split(";");
                if (pickValues.length >= 5) {
                    sendJsonMessage({ cmd: 'getgranuladolotequantity', value: v });
                    value.current = '';
                    setCurrent(value.current);
                }
            }
        }
    }

    const keydownHandler = async (e, obj, formulacao) => {
        if (e.srcElement.name === "qty_lote" || e.srcElement.name === "unit" || !pick.current) {
            return;
        }
        e.preventDefault();
        const keyCode = (e === null) ? obj.keyCode : e.keyCode;
        if (keyCode == 9 || keyCode == 13) {
            onPick(formulacao);
        } else if ((keyCode >= 48 && keyCode <= 90) || keyCode == 18 || (keyCode >= 96 && keyCode <= 111) || keyCode == 186 || keyCode == 188 || keyCode == 110 || keyCode == 190 || keyCode == 189) {
            value.current = `${value.current}${e.key}`;
            setCurrent(value.current);
        } else if (keyCode == 16 || keyCode == 220) {

        } else if (keyCode === 8) {
            value.current = value.current.slice(0, -1);
            setCurrent(value.current);
        }
        else {
            console.log("keycode....", keyCode)
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
        const keyDown = (e, obj) => keydownHandler(e, obj, formulacao);
        document.body.addEventListener('keydown', keyDown);
        document.body.addEventListener('focusout', focusOut);
        document.body.addEventListener('focusin', focusIn);
        //window.addEventListener('paste', paste);
        return () => {
            document.body.removeEventListener('keydown', keyDown);
            document.body.removeEventListener('focusout', focusOut);
            document.body.removeEventListener('focusin', focusIn);
            //window.removeEventListener('paste', paste);
        };
    }, []);
    return (<><FormContainer id="pick-container">
        {(lastValue?.last) &&
            <Row style={lastValue?.last?.error === null ? { border: "solid 1px #b7eb8f", background: "#f6ffed", padding: "5px" } : { border: "solid 1px #ffccc7", background: "#fff2f0", padding: "5px" }}>
                <Col>
                    <Row align='center' gutterWidth={5}>
                        <Col>Último lote registado:</Col>
                        <Col style={{ maxWidth: "95px", width: "95px" }}>Quantidade</Col>
                        <Col style={{ maxWidth: "100px", width: "100px" }}>Unidade Medida</Col>
                    </Row>
                    <Row gutterWidth={5} align='center'>
                        <Col style={{ fontSize: "14px", fontWeight: 700 }}>{lastValue?.last?.dosers}</Col>
                        <Col style={{ fontSize: "14px", fontWeight: 700 }}>{lastValue?.last?.n_lote}</Col>
                        {lastValue?.last?.n_lote &&
                            <>
                                <Col style={{ maxWidth: "95px", width: "95px" }}><InputNumber disabled={!permission.allow()} value={lastValue.last?.qty_lote} width={100} name='qty_lote' size="large" min={0} onFocus={(e) => focusIn(e, "input")} onBlur={(e) => focusOut(e, "input")} onChange={(v) => onChange(v, 'qty_lote')} /></Col>
                                <Col style={{ maxWidth: "100px", width: "100px" }}><Select disabled={!permission.allow()} optionLabelProp="label" defaultValue="m2" style={{ width: "60px" }} value={lastValue.last?.unit} name='unit' size="large" options={[{ value: "m", label: "m" }, { value: "kg", label: "kg" }, { value: "m2", label: <div>m&sup2;</div> }]} onChange={(v) => onChange(v, 'unit')} onFocus={(e) => focusIn(e, "select")} onBlur={(e) => focusOut(e, "select")} /></Col>
                            </>
                        }
                    </Row>
                </Col>
            </Row>
        }
        {(lastValue.row?.n_lote || lastValue?.dosers) &&
            <Row style={lastValue.error === null ? { border: "solid 1px #d9d9d9", background: "#fafafa", padding: "5px", marginTop: "5px" } : { border: "solid 1px #ffccc7", background: "#fff2f0", padding: "5px", marginTop: "5px" }}>
                <Col>
                    <Row align='center' gutterWidth={5}>
                        <Col>{lastValue.error === null ? "Lote a registar:" : lastValue.error}</Col>
                        <Col style={{ maxWidth: "95px", width: "95px" }}>Quantidade</Col>
                        <Col style={{ maxWidth: "100px", width: "100px" }}>Unidade Medida</Col>
                    </Row>
                    <Row gutterWidth={5} align='center'>
                        <Col style={{ fontSize: "14px", fontWeight: 700 }}>
                            {lastValue?.dosers && lastValue?.dosers.toUpperCase()}
                        </Col>
                        <Col style={{ fontSize: "14px", fontWeight: 700 }}>{lastValue?.row?.n_lote}</Col>
                        {lastValue?.row?.n_lote &&
                            <>
                                <Col style={{ maxWidth: "95px", width: "95px" }}>{parseFloat(lastValue?.row?.qty_lote).toFixed(2)}</Col>
                                <Col style={{ maxWidth: "100px", width: "100px" }}>{lastValue.row?.unit}</Col>
                            </>
                        }
                    </Row>
                </Col>
            </Row>

        }
        <Row align='center' gutterWidth={5}><Col xs={11}>
            <Row align='center' gutterWidth={5} style={{ border: status ? "solid 2px #1890ff" : "solid 2px #f0f0f0", height: "50px", margin: "10px 0px" }}>
                {status && <Col xs="content"><Blinker>|</Blinker></Col>}
                <Col style={{ fontSize: "22px", fontWeight: 700, overflowX: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{value.current}</Col>
            </Row>
        </Col>
            <Col xs='content'><Button icon={<SnippetsOutlined />} onClick={paste} title="Colar" /></Col>
        </Row>
    </FormContainer >
        {parentRef && <Portal elId={parentRef.current}>
            <Space>
                <Button disabled={current === ''} type="primary" onClick={onPick}>Registar</Button>
                <Button onClick={closeParent}>Cancelar</Button>
            </Space>
        </Portal>
        }
    </>);
}

const schemaOut = (options = {}) => {
    return getSchema({
        entrada_linha: Joi.number().label("Lote").required(),
    }, options).unknown(true);
}
const loadGranuladoListLookup = async (filter, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/granuladolistlookup/`, filter: { ...filter }, sort: [], signal });
    return rows;
}
const OutContent = ({ parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);


    const [granuladol, setGranuladol] = useState([]);
    const [granulado, setGranulado] = useState([]);
    /*const estado = [{ id: "G", txt: "GOOD" }, { id: "R", txt: "REJEITADO" }];
    const tara = [{ id: 15, txt: "15 kg" }, { id: 30, txt: "30 kg" }]
 */
    const loadData = async ({ loteId, signal } = {}) => {
        const gl = await loadGranuladoListLookup({ type_mov: 1, cs_status: 3 }, signal);
        setGranuladol(gl);
        submitting.end();
    };

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (values) => {
        submitting.trigger();
        const v = schemaOut().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        const { errors, warnings, value, ...status } = getStatus(v);
        if (errors === 0) {
            try {
                let response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { ...values, vcr_num: granulado[0].vcr_num }, parameters: { status: 0 } });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: "Saída de Lote da linha efetuada!" })
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
        if ("entrada_linha" in changedValues) {
            setGranulado(granuladol.filter(v => v.id === changedValues.entrada_linha));
        }
    }

    return (
        <Form form={form} name={`f-out`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-OUT" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaOut} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field wrapFormItem={true} name="entrada_linha" label={{ enabled: true, text: "Lote de Granulado" }}>
                        <SelectField showSearch style={{ width: "100%" }} size="small" keyField="id" textField="n_lote" data={granuladol} optionsRender={d => ({
                            label: <div>
                                <div><span><b>{d["n_lote"]}</b></span> <span>[Quantidade Restante: <b>{d["qty_reminder"]} kg</b>]</span></div>
                                <div><span>{d["artigo_cod"]}</span> <span>{d["artigo_des"]}</span></div>
                            </div>, value: d["id"]
                        })} />
                    </Field>
                    </Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field wrapFormItem={true} name="qty_reminder" label={{ enabled: true, text: "Quantidade Restante" }}>
                        <InputNumber disabled={granulado.length == 0} size="small" addonAfter="kg" min={1} max={granulado.length > 0 && granulado[0].qty_reminder} />
                    </Field>
                    </Col>
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


const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    { fof: { label: "Ordem de Fabrico", field: { type: 'input', size: 'small' } } },
    { fartigo: { label: "Artigo", field: { type: 'input', size: 'small' } } },
    { flote: { label: "Lote", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data Entrada", field: { type: "rangedate", size: 'small' } } },
    { fqty: { label: "Quantidade Lote", field: { type: 'input', size: 'small' }, span: 12 } },
    { fqty_reminder: { label: "Quantidade Restante", field: { type: 'input', size: 'small' }, span: 12 } }
    /*     { ftime: { label: "Início/Fim", field: { type: "rangetime", size: 'small' } } },
        { fduracao: { label: "Duração", field: { type: 'input', size: 'small' }, span: 12 } },
        { farea: { label: "Área", field: { type: 'input', size: 'small' }, span: 12 }, fdiam: { label: "Diâmetro", field: { type: 'input', size: 'small' }, span: 12 } },
        { fcore: { label: "Core", field: { type: 'input', size: 'small' }, span: 12 }, fcomp: { label: "Comprimento", field: { type: 'input', size: 'small' }, span: 12 } },
        //Defeitos
        {
            freldefeitos: { label: " ", field: TipoRelation, span: 4 },
            fdefeitos: { label: 'Defeitos', field: { type: 'selectmulti', size: 'small', options: BOBINE_DEFEITOS }, span: 20 }
        },
        //Estados
        { festados: { label: 'Estados', field: { type: 'selectmulti', size: 'small', options: BOBINE_ESTADOS } } },
        { fofabrico: { label: "Ordem de Fabrico", field: { type: 'input', size: 'small' } } },
        { fcliente: { label: "Cliente", field: { type: 'input', size: 'small' } } },
        { fdestino: { label: "Destino", field: { type: 'input', size: 'small' } } } */
];


const sleep = ms => new Promise(r => setTimeout(r, ms));

const PosColumn = ({ value }) => {
    return (<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {value === 1 ? <ImArrowUp /> : <ImArrowDown />}
        <div style={{ marginRight: "5px" }}>{value === 1 ? "SUP" : "INF"}</div>
    </div>);
}
/* const MovColumn = ({ value }) => {
    return (<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {value === 1 ? <ImArrowRight color='green' /> : <ImArrowLeft color="red" />}
        <div style={{ marginRight: "5px" }}>{value === 1 ? "Entrada" : "Saída"}</div>
    </div>);
} */
const OfsColumn = ({ value }) => {
    return (<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {value && value.map(v => <div style={{ marginRight: "3px", fontWeight: 700 }} key={`${v}`}>{v}</div>)}
    </div>);
}

const loadCurrentSettings = async (signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/currentsettingsinproductionget/`, filter: {}, sort: [], signal });
    if (rows && rows.length>0){
        rows[0].formulacao=JSON.parse(rows[0].formulacao);
        rows[0].ofs=JSON.parse(rows[0].ofs)
    }
    return rows;
}

export default ({ setFormTitle, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const permission = usePermission({ allowed: {} });
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "pickgranuladolist", payload: { url: `${API_URL}/granuladolist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, sort: [] } });
    /*     const [selectedRows, setSelectedRows] = useState(() => new Set());
        const [newRows, setNewRows] = useState([]); */
    const submitting = useSubmitting(true);
    const primaryKeys = ['vcr_num', 'type_mov', 'lote_id'];
    const columns = [
        { key: 'type_mov', width: 90, name: 'Movimento', froze: true, formatter: p => <MovGranuladoColumn value={p.row.type_mov} /> },
        { key: "group_id", sortable: false, name: "Cuba", frozen: true, minWidth: 55, width: 55, formatter: p => <Cuba value={p.row.group_id} /> },
        { key: 'dosers', width: 90, name: 'Doseadores', formatter: p => p.row.dosers },
        { key: 'artigo_cod', name: 'Artigo', formatter: p => p.row.artigo_cod },
        { key: 'artigo_des', name: 'Designação', formatter: p => <b>{p.row.artigo_des}</b> },
        { key: 'n_lote', width: 310, name: 'Lote', formatter: p => <b>{p.row.n_lote}</b> },
        { key: 'qty_lote', name: 'Qtd', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.qty_lote).toFixed(2)} kg</div>, editor: p => <InputNumber bordered={false} size="small" value={p.row.qty_lote} ref={(el, h,) => { el?.focus(); }} onChange={(e) => p.onRowChange({ ...p.row, qty_lote: e === null ? 0 : e, notValid: 1 }, true)} min={0} /> },
        { key: 'qty_reminder', width: 110, name: 'Qtd. Restante', formatter: p => <div>{parseFloat(p.row.qty_reminder).toFixed(2)} kg</div> },
        { key: 't_stamp', width: 140, name: 'Data', formatter: p => moment(p.row.t_stamp).format(DATETIME_FORMAT) },
        { key: 'ofs', width: 140, name: 'Ordem Fabrico', formatter: p => <OfsColumn value={p.row.ofs && JSON.parse(p.row.ofs)} /> }
    ];
    const [formulacao, setFormulacao] = useState();
    const [ofs, setOfs] = useState();
    const [aggStatus, setAggStatus] = useState();
    const [modalParameters, setModalParameters] = useState({});

    const [showPickingModal, hidePickingModal] = useModal(({ in: open, onExited }) => {
        const [lastValue, setLastValue] = useState({ picked: false, row: {}, error: null, type: null });
        const [dirty, setDirty] = useState(false);
        useEffect(() => {
            if (lastValue.picked && lastValue.error === null) {
                if (lastValue.row.n_lote && lastValue?.dosers) {
                    let dosers = "";
                    let cuba;
                    const idx = dataAPI.getData().rows ? dataAPI.getData().rows.findIndex(x => x.n_lote === lastValue.row.n_lote && x.notValid === 1 && x.vcr_num === lastValue.row.vcr_num) : -1;
                    if (lastValue.row.artigo_cod in formulacao) {
                        const dosersOk = lastValue.dosers.toUpperCase().split(',').every(r => formulacao[lastValue.row.artigo_cod].dosers.includes(r));
                        if (!dosersOk) {
                            setLastValue(prev => ({ ...prev, error: "O Lote/Doseadores não estão conforme a formulação!", picked: false }));
                            return;
                        } else {
                            dosers = formulacao[lastValue.row.artigo_cod].dosers.join();
                            cuba = [...new Set(formulacao[lastValue.row.artigo_cod].cubas)][0];
                        }
                    } else {
                        setLastValue(prev => ({ ...prev, error: "O Lote/Doseadores não estão conforme a formulação!", picked: false }));
                        return;
                    }
                    if (idx === -1) {
                        dataAPI.addRow({ ...lastValue.row, qty_lote: parseFloat(lastValue.row.qty_lote).toFixed(2), dosers: dosers, group_id: cuba, type_mov: 1 }, primaryKeys, 0);
                        setLastValue(prev => ({ ...prev, row: {}, dosers: null, picked: false, last: { ...prev?.last, ...lastValue.row, error: null, dosers: dosers, group_id: cuba } }));
                    } else {
                        setLastValue(prev => ({ ...prev, error: "O Lote já foi registado!", picked: false }));
                    }
                }
            } else {
                setLastValue(prev => ({ ...prev, picked: false }));
            }
        }, [lastValue.picked, lastValue?.row?.n_lote, lastValue?.dosers]);
        const onChange = (v, f) => {
            const rows = dataAPI.getData().rows;
            const idx = rows.findIndex(x => x.n_lote === lastValue.last.n_lote);
            if (idx > -1) {
                rows[idx][f] = v;
                dataAPI.setRows([...rows], rows.length);
                setLastValue(prev => ({ ...prev, last: { ...prev?.last, [f]: v } }));
            }

        }
        return <ResponsiveModal title={<div style={{ display: "flex", flexDirection: "row" }}><div><SyncOutlined spin /></div><div style={{ marginLeft: "5px" }}>Registo de Lotes em Curso...</div></div>}
            onCancel={hidePickingModal}
            /*onOk={() => onPickFinish(lastValue)} */
            width={600} height={250} footer="ref">
            <PickContent lastValue={lastValue} setLastValue={setLastValue} onFinish={onPickFinish} onChange={onChange} formulacao={formulacao} />
        </ResponsiveModal>;
    }, [dataAPI.getTimeStamp(),formulacao]);







    const [showOutModal, hideOutModal] = useModal(({ in: open, onExited }) => {
        return <ResponsiveModal title={`Saída de lote em linha`}
            onCancel={hideOutModal}
            //onOk={() => onPickFinish(lastValue)}
            width={600} height={180} footer="ref" >
            <OutContent loadParentData={loadData} />
        </ResponsiveModal>;
    }, [dataAPI.getTimeStamp(), modalParameters]);
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimegeneric`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        queryParams: { /* 'token': '123456' */ },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 500
    });

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); clearInterval(interval); });
    }, []);

    const loadData = async ({ init = false, signal } = {}) => {
        if (init) {
            const initFilters = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, {}, [...Object.keys(dataAPI.getAllFilter())]);
            formFilter.setFieldsValue({ ...initFilters });
            dataAPI.addFilters({ ...initFilters }, true, true);
            dataAPI.setSort([{ column: "`order`", direction: "DESC" }]);
            dataAPI.addParameters({}, true, true);
        }
        const request = (async () => sendJsonMessage({ cmd: 'checkcurrentsettings', value: {} }));
        request();
        //const ok = dataAPI.fetchPost();
        return setInterval(request, 30000);
    }

    useEffect(() => {
        if (lastJsonMessage && lastJsonMessage.rows) {
            if (lastJsonMessage.rows[0].mx === null) {
                Modal.error({ title: "Não existe neste momento nenhuma produção em curso!" });
            } else {
                (async () => {
                    try {
                        const cs = await loadCurrentSettings();
                        let _formulacao = {};
                        if (cs[0].formulacao) {
                            for (let v of cs[0].formulacao.items) {
                                const _dosers = [];
                                const _cuba = (v?.cuba_A) ? v?.cuba_A : v?.cuba_BC;
                                if (v?.doseador_A) _dosers.push(v.doseador_A);
                                if (v?.doseador_B) _dosers.push(v.doseador_B);
                                if (v?.doseador_C) _dosers.push(v.doseador_C);
                                const _cod = v.matprima_cod;
                                const _des = v.matprima_des;
                                if (_cod in _formulacao) {
                                    _formulacao[_cod].dosers = [..._formulacao[_cod].dosers, ..._dosers];
                                    _formulacao[_cod].cubas = [..._formulacao[_cod].cubas, _cuba];
                                } else {
                                    _formulacao[_cod] = { dosers: _dosers, matprima_des: v.matprima_des, cubas: [_cuba] };
                                }
                            }
                        }
                        setFormulacao(_formulacao);
                        setOfs(cs[0].ofs.map(v=>v.of_cod));
                        setAggStatus(cs[0].status);
                        dataAPI.fetchPost();
                    } catch (e) {
                        Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
                    }finally{
                        submitting.end();
                    };

                })();

            }
        }
    }, [lastJsonMessage?.hash]);



    /*     const loadData = async ({ signal } = {}) => {
            const initFilters = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, {}, [...Object.keys(dataAPI.getAllFilter())]);
            const data = loadInit({}, {}, props, location?.state, [...Object.keys(location?.state || {})]);
            if (data?.formulacao) {
                setRecord(data);
                formFilter.setFieldsValue({ ...initFilters, type: data?.type });
    
    
    
                dataAPI.addFilters({ ...initFilters, type: data?.type, agg_of_id: data?.agg_of_id }, true, true);
                dataAPI.setSort([{ column: "`order`", direction: "DESC" }]);
                dataAPI.addParameters({}, true, true);
                dataAPI.fetchPost({ signal });
            }
            else {
                Modal.error({ title: "Não existe neste momento nenhuma produção em curso!" });
            }
            submitting.end();
        }; */

    /*     useEffect(() => {
            (setFormTitle) && setFormTitle({ title });
            const controller = new AbortController();
            loadData({ signal: controller.signal });
            return (() => controller.abort());
        }, []); */





    // const loadData = async ({ signal } = {}) => {
    //     const request = (async () => sendJsonMessage({ cmd: 'checkcurrentsettings', value: {} }));
    //     request();
    //     const ok = dataAPI.fetchPost();
    //     return (ok) ? setInterval(request, 30000) : null;
    // }




    // useEffect(() => {
    //     if (lastJsonMessage) {
    //         dataAPI.fetchPost();
    //     }
    // }, [lastJsonMessage?.hash]);




    const onPickFinish = (values) => { console.log("picking", values) };

    const deleteRow = async ({ id, dataAPI }) => {
        const status = { error: [], warning: [], info: [], success: [] };
        submitting.trigger();
        try {
            const response = await fetchPost({ url: `${API_URL}/deletegranuladoitem/`, filter: { id } });
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
            Modal.confirm({ title: <div>Remover a entrada do Lote: <span style={{ color: "#cf1322", fontWeight: 900 }}>{row.n_lote}</span> ?</div>, onOk: () => dataAPI.deleteRow({ id: row.id }, primaryKeys) });
        }
        else if (permission) {
            Modal.confirm({ title: <div>Remover a entrada do Lote: <span style={{ color: "#cf1322", fontWeight: 900 }}>{row.n_lote}</span> ?</div>, onOk: () => deleteRow({ id: row.id, dataAPI }, primaryKeys) });
        }
    };
    const onSave = async () => {
        const status = { error: [], warning: [], info: [], success: [] };
        submitting.trigger();
        try {
            const response = await fetchPost({ url: `${API_URL}/savegranuladoitems/`, parameters: { rows: dataAPI.getData().rows }, dates: [{ key: "t_stamp", format: DATETIME_FORMAT }] });
            if (response.data.status !== "error") {
                status.error.push(...response.data.errors);
                setFormStatus({ ...status });
                dataAPI.fetchPost();
            } else {
                status.error.push({ message: response.data.title });
                setFormStatus({ ...status });
            }
        } catch (e) {
            status.error.push({ message: e.message });
            setFormStatus({ ...status });
        } finally {
            submitting.end();
        }
    }

    const onFilterFinish = (type, values) => {

        switch (type) {
            case "filter":
                //remove empty values
                const vals = Object.fromEntries(Object.entries({ ...dataAPI.getAllFilter(), ...values }).filter(([_, v]) => v !== null && v !== ''));
                const _values = {
                    ...vals,
                    fof: getFilterValue(vals?.fof, 'any'),
                    fartigo: getFilterValue(vals?.fartigo, 'any'),
                    flote: getFilterValue(vals?.flote, 'any'),
                    fdata: getFilterRangeValues(vals["fdata"]?.formatted),
                };
                console.log(_values)
                dataAPI.addFilters(_values);
                dataAPI.addParameters({})
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }


    };
    const onFilterChange = (changedValues, values) => {
        if ("type" in changedValues) {
            console.log("aaaaa")
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        }
    };

    return (
        <>

            {!setFormTitle && <TitleForm data={dataAPI.getAllFilter()} onChange={onFilterChange} record={{formulacao,ofs,aggStatus}} level={location?.state?.level} form={formFilter} />}
            <AlertsContainer mask formStatus={formStatus} portal={false} style={{ margin: "5px" }} />
            {formulacao &&
                <Table
                    //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
                    reportTitle={title}
                    loadOnInit={false}
                    columns={columns}
                    dataAPI={dataAPI}
                    //actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                    toolbar={true}
                    search={true}
                    moreFilters={true}
                    rowSelection={false}
                    primaryKeys={primaryKeys}
                    editable={true}
                    clearSort={false}
                    rowClass={(row) => (row?.notValid === 1 ? classes.notValid : undefined)}
                    //selectedRows={selectedRows}
                    //onSelectedRowsChange={setSelectedRows}
                    leftToolbar={aggStatus === 3 && <>
                        <Button disabled={submitting.state} type='primary' icon={<AppstoreAddOutlined />} onClick={showPickingModal}>Picar Lotes</Button>
                        {(dataAPI.hasData() && dataAPI.getData().rows.filter(v => v?.notValid === 1).length > 0) && <Button disabled={submitting.state} style={{ marginLeft: "5px" }} icon={<CheckOutlined />} onClick={onSave}> Guardar Registos</Button>}
                        {(dataAPI.hasData() && dataAPI.getData().rows.filter(v => v?.notValid === 1).length === 0) && <Button disabled={submitting.state} style={{ marginLeft: "5px" }} icon={<GoArrowUp color='red' fontSize={18} style={{ verticalAlign: "top" }} />} onClick={() => { setModalParameters({}); showOutModal(); }}>Saída de Linha</Button>}
                    </>}
                    //content={<PickHolder />}
                    //paginationPos='top'
                    toolbarFilters={{
                        form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange, filters: <ToolbarFilters dataAPI={dataAPI} />,
                        moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 350, mask: true }
                    }}
                />
            }
        </>
    );
}