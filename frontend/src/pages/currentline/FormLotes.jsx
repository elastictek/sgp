import React, { useEffect, useState, useCallback, useRef, useMemo, useContext, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { groupBy } from "utils";
import uuIdInt from "utils/uuIdInt";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace, InputAddon, SelectDebounceField, AutoCompleteField, SelectMultiField } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import ResultMessage from 'components/resultMessage';
import YScroll from "components/YScroll";
import XScroll from "components/XScroll";
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, DatePicker, Select, Spin, Switch, Tag } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT, FORMULACAO_MANGUEIRAS, SOCKET, COLORS } from 'config';
import useWebSocket from 'react-use-websocket';
import { SocketContext } from '../App';
import ResponsiveModal from "components/ResponsiveModal";
import TagButton from "components/TagButton";


const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const useFocus = () => {
    const htmlElRef = useRef(null)
    const setFocus = () => { htmlElRef.current && htmlElRef.current.focus() }
    return [htmlElRef, setFocus]
}

const Wnd = ({ parameters, setParameters }) => {
    const { modalProps = {} } = parameters;
    const iref = useRef();

    return (
        <ResponsiveModal
            title={parameters.title}
            visible={parameters.visible}
            centered
            responsive
            onCancel={setParameters}
            maskClosable={true}
            destroyOnClose={true}
            fullWidthDevice={parameters.fullWidthDevice}
            width={parameters.width}
            height={parameters.height}
            bodyStyle={{ /* backgroundColor: "#f0f0f0" */ }}
            footer={<div ref={iref} id="wnd-wrapper" style={{ textAlign: 'right' }}></div>}
            {...modalProps}
        >
            <YScroll>
                {parameters.type == "saida_mp" && <Suspense fallback={<></>}><SaidaMP parameters={parameters} wndRef={iref} setParameters={setParameters} /></Suspense>}
                {parameters.type == "saida_doseador" && <Suspense fallback={<></>}><SaidaDoser parameters={parameters} wndRef={iref} setParameters={setParameters} /></Suspense>}
                {parameters.type == "reminder" && <Suspense fallback={<></>}><Reminder parameters={parameters} wndRef={iref} /></Suspense>}
            </YScroll>
        </ResponsiveModal>
    );
}

const StyleDoser = styled.div(
    (props) => css`
        ${props.enabled &&
        css`
            border-radius: 2px;
            margin-right:1px;
            padding:1px;
            position:relative;
            border:solid 1px ${props => props.qty > 0 ? "#1890ff" : "#a8071a"};
            background-color:${props => props.qty > 0 ? "#e6f7ff" : "#cf1322"};
            color:${props => props.qty > 0 ? "#000" : "#fff"};
            width:130px;
            height:48px;
        `}
    `
);

const Reminder = ({ parameters }) => {
    useEffect(() => {
        parameters.form.setFieldsValue({ reminder: parameters.lote.qty_lote_available });
    }, [])
    return (
        <Form form={parameters.form}>
            <FormLayout id="f-reminder">
                <Field name="reminder" label={{ enabled: false, width: "60px", text: "Resto", pos: "left" }}><InputNumber precision={2} addonAfter="kg" size="small" min={0} max={parameters.lote.qty_lote} /></Field>
            </FormLayout>
        </Form>
    );
}

const SaidaMP = ({ parameters }) => {
    const { title, buffer } = parameters;
    const [lotes, setLotes] = useState([]);
    const [modal, setModal] = useState({ visible: false });
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [lote, setLote] = useState();

    const onCancel = () => {
        setModal(prev => ({ ...prev, visible: !prev.visible }))
    }

    const onFinish = (lt) => {
        setSubmitting(true);

        (async () => {
            console.log("SUBMITTING", lt.artigo_cod, lt.n_lote, lt.qty_lote, lt, form.getFieldValue("reminder"));
            const response = await fetchPost({ url: `${API_URL}/saidamp/`, parameters: { lote: lt, reminder: form.getFieldValue("reminder") } });
            if (response.data.status !== "error") {
                onCancel();
            }
            setSubmitting(false);
        })();


    }

    const onModal = (lt) => {
        const modalProps = { footer: <div><Button type="primary" onClick={() => onFinish(lt)}>Registar</Button><Button onClick={onCancel}>Cancelar</Button></div> }
        setModal(prev => ({ ...prev, lote: lt, visible: !prev.visible, width: "300px", height: "200px", fullWidthDevice: 1, title: "Resto de Matéria Prima", type: "reminder", form, modalProps }));
    }

    useEffect(() => {
        const lt = [];
        for (const [key, value] of Object.entries(parameters.lotes)) {
            if (key !== 'null') {
                const artigo = buffer.find(v => v.ITMREF_0 === value.artigo_cod);
                for (const v of value.lotes) {
                    lt.push({ artigo_cod: value.artigo_cod, artigo_des: artigo.ITMDES1_0, ...v });
                }
            }
        }
        setLotes(lt);
    }, [parameters.lotes]);
    return (
        <div style={{ textAlign: "center" }}>
            <Wnd parameters={modal} setParameters={onModal} />
            {lotes.map((v, i) => {
                return <div key={`lt-${i}`}><TagButton onClick={() => onModal(v)} style={{ height: "40px", marginBottom: "5px", width: "100%", textAlign: "center" }}>{v.artigo_des} <b>{v.n_lote}</b><br /> {parseFloat(v.qty_lote_available).toFixed(2)}kg </TagButton></div>
            })}
        </div>
    );
}

const SaidaDoser = ({ parameters, wndRef, setParameters }) => {
    const { title } = parameters;
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [dosers, setDosers] = useState([]);

    useEffect(() => {
        let d = [];
        for (const [key, value] of Object.entries(parameters.dosers)) {
            if (key !== 'null') {
                for (let v of value.dosers) {
                    d.push({ value: v });
                }
            }
        }
        setDosers(d);

    }, [parameters.dosers]);


    const onCancel = () => {
        setParameters(prev => ({ ...prev, visible: !prev.visible }))
    }

    const onFinish = () => {
        setSubmitting(true);
        (async () => {
            const response = await fetchPost({ url: `${API_URL}/saidadoser/`, parameters: { dosers: form.getFieldValue("dosers") } });
            if (response.data.status !== "error") {
                onCancel();
            }
            setSubmitting(false);
        })();


    }

    return (<div>
        {dosers.length > 0 &&
            <Form form={form}>
                <FormLayout id="f-dosers">
                    <Field name="dosers" label={{ enabled: false, width: "60px", text: "Resto", pos: "left" }}><SelectMultiField allowClear size="small" options={dosers} /></Field>
                </FormLayout>
                {wndRef && <Portal elId={wndRef.current}>
                    <Space>
                        <Button disabled={submitting} type="primary" onClick={onFinish}>Registar</Button>
                        <Button disabled={submitting} onClick={onCancel}>Cancelar</Button>
                    </Space>
                </Portal>}
            </Form>
        }
    </div>);
}

/* const StyleTable = styled.table`
    width:100%;
    border-collapse: separate;

    & th{
        border: none;
        padding-top:5px;
    }

    & td:first-child {
        border:solid 1px #d9d9d9;
        border-left-radius:2px;
        border-right:0px;
        width:1px;
    }
    & td:last-child {
        border:solid 1px #d9d9d9;
        border-right-radius:2px;
        border-left:0px;
        width: 100%;
    }
    & td{
        padding:4px 2px 4px 2px;
        border-top:solid 1px #d9d9d9;
        border-bottom:solid 1px #d9d9d9;
        width:1px;
        background-color:#f5f5f5;
    }
`; */

const StyleTable = styled.table`
    width:100%;
    border-collapse: separate;
    & td{
        display: block;
        width:100vw;
    }
    /*border-spacing: 0px 20px;*/
`;

/* const Group = ({ children }) => {
    return (
        <>
            <tr>
                <td>
                    {children}
                </td>
            </tr>
        </>
    );
} */

const Group = ({ children }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", marginBottom: "10px", border: "solid 1px #d9d9d9", borderRadius: "2px", background: "#f5f5f5", padding: "3px" }}>{children}</div>
    );
}

const ArtigoDesignacao = ({ artigo_cod, buffer }) => {
    const [designacao, setDesignacao] = useState();

    useEffect(() => {
        if (artigo_cod) {
            const artigo = buffer.find(v => v.ITMREF_0 === artigo_cod);
            setDesignacao(artigo.ITMDES1_0);
        }
        else {
            setDesignacao('');
        }
    }, [artigo_cod]);

    return (
        <div style={{ width: "100%", fontSize: "14px", fontWeight: 700 }}>
            {designacao}
        </div>
    );
}

/* const ArtigoDesignacao = ({ artigo_cod, buffer }) => {
    const [designacao, setDesignacao] = useState();

    useEffect(() => {
        if (artigo_cod) {
            const artigo = buffer.find(v => v.ITMREF_0 === artigo_cod);
            setDesignacao(artigo.ITMDES1_0);
        }
        else {
            setDesignacao('');
        }
    }, [artigo_cod]);

    return (
        <tr>
            <th colSpan={20} style={{ fontSize: "14px" }}>
                <div>{designacao}</div>
            </th>
        </tr>
    );
} */

/* const Artigo = ({ artigo_cod, lotes, children }) => {
    return (
        <>
            <td>
                {lotes && lotes.map(v => {
                    return (<div style={{ borderBottom: "dashed 1px #d9d9d9" }} key={v.n_lote}>
                        <div>{v.n_lote}</div>
                        {v.n_lote && <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{parseFloat(v.qty_lote).toFixed(2)}kg</div><div>{parseFloat(v.qty_lote_available).toFixed(2)}kg</div></div>}
                    </div>);
                })}
            </td>
        </>
    );
} */

const Artigo = ({ artigo_cod, lotes, children }) => {
    return (
        <div style={{ minWidth: "180px", maxWidth: "180px", marginRight: "10px" }}>
            {lotes && lotes.map(v => {
                return (v.n_lote == null) ? <div key={v.n_lote} /> :
                    <div style={{ borderBottom: "dashed 1px #d9d9d9" }} key={v.n_lote}>
                        <div>{v.n_lote}</div>
                        {v.n_lote && <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{parseFloat(v.qty_lote).toFixed(2)}kg</div><div>{parseFloat(v.qty_lote_available).toFixed(2)}kg</div></div>}
                    </div>;
            })}
        </div>
    );
}

const DOSERS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6']
/* const Dosers = ({ group_id, dosers, lotes, dosersSets }) => {
    const [qty, setQty] = useState();
    useEffect(() => {
        if (lotes) {
            setQty(lotes.map(item => item.qty_lote_available).reduce((prev, next) => prev + next));
        }
        else {
            setQty(0);
        }
    }, [lotes]);

    return (
        <>
            {[...Array(18)].map((x, i) =>
                <React.Fragment key={`dl-${group_id}-${i}`}>
                    <td>
                        <StyleDoser enabled={(dosers && dosers.length > i)} qty={qty}>
                            <div style={{ textAlign: "center", fontWeight: 700, fontSize: '14px' }}>{(dosers && dosers.length > i) && dosers[i]}</div>
                            {(dosers && dosers.length > i) &&
                                <div style={{ display: "flex", flexDirection: "row" }}>
                                    <div style={{ width: "30px", textAlign: "center", borderRight: "solid 1px #d9d9d9" }}>{dosersSets[0][`${dosers[i]}_S`]}%</div>
                                    <div style={{ width: "30px", textAlign: "center", borderRight: "solid 1px #d9d9d9" }}>{dosersSets[0][`${dosers[i]}_P`]}%</div>
                                    <div style={{ width: "70px", textAlign: "center" }}>{dosersSets[0][`${dosers[i]}_D`]}g/cm&#xB3;</div>
                                </div>
                            }
                        </StyleDoser>
                    </td>
                </React.Fragment>
            )}
        </>
    );
} */
const Dosers = ({ group_id, dosers, lotes, dosersSets }) => {
    const [qty, setQty] = useState();
    useEffect(() => {
        if (lotes) {
            setQty(lotes.map(item => item.qty_lote_available).reduce((prev, next) => prev + next));
        }
        else {
            setQty(0);
        }
    }, [lotes]);

    return (
        <XScroll style={{ alignSelf: "center" }}>
            <div style={{ display: "flex", flexDirection: "row", alignSelf: "center" }}>
                {[...Array(18)].map((x, i) =>
                    <React.Fragment key={`dl-${group_id}-${i}`}>
                        <StyleDoser enabled={(dosers && dosers.length > i)} qty={qty}>
                            <div style={{ textAlign: "center", fontWeight: 700, fontSize: '14px' }}>{(dosers && dosers.length > i) && dosers[i]}</div>
                            {(dosers && dosers.length > i) &&
                                <div style={{ display: "flex", flexDirection: "row" }}>
                                    <div style={{ width: "30px", textAlign: "center", borderRight: "solid 1px #d9d9d9" }}>{dosersSets[0][`${dosers[i]}_S`]}%</div>
                                    <div style={{ width: "30px", textAlign: "center", borderRight: "solid 1px #d9d9d9" }}>{dosersSets[0][`${dosers[i]}_P`]}%</div>
                                    <div style={{ width: "70px", textAlign: "center" }}>{dosersSets[0][`${dosers[i]}_D`]}g/cm&#xB3;</div>
                                </div>
                            }
                        </StyleDoser>
                    </React.Fragment>
                )}
            </div>
        </XScroll>
    );
}

const ConfirmButton = styled(Button)`
  &&& {
    background-color: #389e0d;
    border-color: #389e0d;
    color:#fff;
    &[disabled]{
        color: rgba(0, 0, 0, 0.25);
        border-color: #d9d9d9;
        background: #f5f5f5;
    }
    &[disabled]:hover{
        color: rgba(0, 0, 0, 0.25);
        border-color: #d9d9d9;
        background: #f5f5f5;
    }
    &:hover{
        background-color: #52c41a;
        border-color: #52c41a;
    }
  }
`;

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [changedValues, setChangedValues] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    //const [matPrimasLookup, setMatPrimasLookup] = useState([]);
    const extrusoraRef = useRef();
    const [inputRef, setInputFocus] = useFocus();
    const [extrusora, setExtrusora] = useState('A');
    const [buffer, setBuffer] = useState(null);
    const [settings, setSettings] = useState(null);
    const [lotesDosers, setLotesDosers] = useState(null);
    const [dosersSets, setDosersSets] = useState(null);

    const [dosers, setDosers] = useState({});
    const [lotes, setLotes] = useState({});
    const [groups, setGroups] = useState([]);
    const [lin, setLin] = useState([]);
    const [lout, setLout] = useState([]);
    const [touched, setTouched] = useState(false);

    const [modalParameters, setModalParameters] = useState({ visible: false });
    const onModalParameters = (parameters) => {
        if (!parameters) {
            setModalParameters(prev => ({ ...prev, visible: !prev.visible }));
        } else {
            switch (parameters.type) {
                case "saida_mp":
                    parameters = { ...parameters, width: "500px", height: "500px", fullWidthDevice: 1, title: "Saída de Matéria Prima", lotes, buffer };
                    break;
                case "saida_doseador":
                    parameters = { ...parameters, width: "500px", height: "180px", fullWidthDevice: 1, title: "Saída de Doseador", dosers };
                    break;
            }
            setModalParameters(prev => ({ visible: !prev.visible, ...parameters }));
        }
    }

    useEffect(() => {
        if (modalParameters.type === "saida_mp") {
            setModalParameters(prev => ({ ...prev, lotes }));
        } else if (modalParameters.type === "saida_doseador") {
            setModalParameters(prev => ({ ...prev, dosers }));
        }
    }, [lotes, dosers])




    //const [lotesAvailability, setLotesAvailability] = useState(null);
    const [transformedData, setTransformedData] = useState({});
    const { data: dataSocket } = useContext(SocketContext) || {};
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/lotespick`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000
    });

    useEffect(() => {
        const cancelFetch = cancelToken();
        (async () => {
            //setMatPrimasLookup(await loadMateriasPrimasLookup({ token: cancelFetch }));
            (setFormTitle) && setFormTitle({ title: `Lotes de Matéria Prima` });
            form.setFieldsValue({ in: [], out: [] });
            setLoading(false);
        })();
        return (() => cancelFetch.cancel("Form Lotes Cancelled"));
    }, []);

    /*     useEffect(() => {
            console.log("MATERIAS PRIMAS---", matPrimasLookup)
        }, [matPrimasLookup]); */

    useEffect(() => {
        (async () => {
            sendJsonMessage({ cmd: 'loadbuffer', value: {} });
        })();
    }, [dataSocket?.buffer]);

    useEffect(() => {
        (async () => {
            sendJsonMessage({ cmd: 'loadlotesdosers', value: {} });
        })();
    }, [dataSocket?.availability, dataSocket?.dosers]);

    useEffect(() => {
        (async () => {
            sendJsonMessage({ cmd: 'loaddoserssets', value: {} });
        })();
    }, [dataSocket?.doserssets]);

    // useEffect(() => {
    //     (async () => {
    //         sendJsonMessage({ cmd: 'loadinproduction', value: {} });
    //     })();
    // }, [dataSocket?.inproduction]);

    useEffect(() => {
        if (lastJsonMessage) {
            if (lastJsonMessage.item === "buffer") {
                setBuffer([...lastJsonMessage.rows]);
                console.log("BUFFER-->", lastJsonMessage.rows)
            } else if (lastJsonMessage.item === "inproduction") {
                setSettings({ ...lastJsonMessage.rows[0] });
            } else if (lastJsonMessage.item === "lotesdosers") {
                console.log("------>LOTESDOSERS<-----", lastJsonMessage.rows[0])
                setLotesDosers([...lastJsonMessage.rows]);
            } else if (lastJsonMessage.item === "doserssets") {
                console.log("------>DOSERS SETS<-----", lastJsonMessage.rows)
                setDosersSets({ ...lastJsonMessage.rows });
            }
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        if (lotesDosers && dosersSets) {
            const notUsed = []
            for (let dos of DOSERS) {
                if (dosersSets[0][`${dos}_S`] === 0) {
                    notUsed.push(dos);
                }
            }
            if (!touched) {
                let d = {};
                let l = {};
                let g = [];
                for (let ld of lotesDosers) {
                    g.push({ group_id: ld.group_id, artigo_cod: ld.artigo_cod });
                    d = { ...d, [ld.group_id]: { artigo_cod: ld.artigo_cod, dosers: [...new Set(JSON.parse(ld.dosers))].filter((el) => !notUsed.includes(el)).sort() } };
                    let _lt = JSON.parse(ld.lotes);
                    l = { ...l, [ld.group_id]: { artigo_cod: ld.artigo_cod, lotes: _lt.filter((e, i) => _lt.findIndex(a => a.n_lote === e.n_lote) === i).filter((v, i) => v.qty_lote_available > 0 || i == 0) } };
                }
                setGroups(g);
                setDosers(d);
                setLotes(l);
            }
        }
    }, [lotesDosers, dosersSets]);

    useEffect(() => { }, [lotes, dosers, groups]);

    const onValuesChange = (changedValues) => {
        console.log("CHANGEDDDDD--", changedValues, " EXTRUSORA SELECIONADA--", extrusora);
        setChangedValues(changedValues);
    }

    const onFinish = async (values) => {


        console.log("--------LOTES--", lotes);
        console.log("--------DOSERS--", dosers);
        console.log("--------GROUPS--", groups);
        console.log("--------LOTESDOSERS--", lotesDosers);

        const status = { error: [], warning: [], info: [], success: [] };
        const response = await fetchPost({ url: `${API_URL}/pick/`, parameters: { lotes, dosers, groups } });
        setTouched(false);
        //setResultMessage(response.data);
        //setFormStatus(status);

        console.log("###################--", response.data, "-----", status);

        /* const status = { error: [], warning: [], info: [], success: [] };
        const v = schema().validate(values, { abortEarly: false });
        if (!v.error) {
            let error = false;
            for (let k in values) {
                if (values[k] === undefined && k !== "cliente_cod" && k !== "designacao") {
                    error = true;
                    break;
                }
            }
            if (error) {
                status.error.push({ message: "Os items têm de estar preenchidos!" });
            }
            if (status.error.length === 0) {
                const { cliente_cod: { value: cliente_cod, label: cliente_nome } = {} } = values;
                const response = await fetchPost({ url: `${API_URL}/newartigospecs/`, parameters: { ...form.getFieldsValue(true), produto_id: ctx.produto_id, cliente_cod, cliente_nome } });
                if (response.data.status !== "error") {
                    parentReload({ artigospecs_id: record.artigospecs_id }, "init");
                }
                setResultMessage(response.data);
            }
        }
        setFormStatus(status); */
    }

    const onSuccessOK = () => {
        if (operation.key === "insert") {
            form.resetFields();
            init();
            setResultMessage({ status: "none" });
        }
    }

    const onErrorOK = () => {
        setResultMessage({ status: "none" });
    }

    const onClose = (reload = false) => {
        closeParent();
    }


    const onManualPick = (v) => {
        sendJsonMessage({ cmd: 'pick', value: v.key, cs: record.id });
    }

    const onPick = (e, a, b) => {
        if (e.keyCode == 9 || e.keyCode == 13) {
            if (inputRef.current.value !== '') {
                if (!touched) { setTouched(true); }
                e.preventDefault();
                const v = inputRef.current.value.toUpperCase();
                console.log(buffer);
                if (DOSERS.includes(v)) {
                    //Source / Type
                    form.setFieldsValue({ source: v });
                    inputRef.current.value = '';
                } else {
                    //RVMAX0863000012;VM6202V21092802AB5033;650.00
                    //RAAOX0000000080;A211593;550.00
                    //RVMAX0862000013;VM6102V21080201AB5064;650.00
                    //RKRTG0910000069;22094728;10.00
                    let fData = form.getFieldsValue(true);
                    let picked = false;
                    if (fData.source) {
                        let pickData = v.split(';');
                        if (pickData.length < 2) {
                            pickData = v.split('#');
                        }
                        if (pickData.length > 1) {
                            const _dosers = { ...dosers };
                            for (const k in _dosers) {
                                if (_dosers[k].artigo_cod === pickData[0]) {
                                    picked = true;
                                    if (!_dosers[k].dosers.includes(fData.source)) {
                                        _dosers[k].dosers.push(fData.source);
                                    }
                                } else {
                                    _dosers[k].dosers = _dosers[k].dosers.filter(v => v !== fData.source);
                                }
                            }
                            if (!picked) {
                                let bufArtigo = buffer.find(v => v.ITMREF_0 === pickData[0] && v.LOT_0 === pickData[1]);
                                if (bufArtigo?.ITMREF_0) {
                                    const _lotes = { ...lotes };
                                    for (const k in _dosers) {
                                        _dosers[k].dosers = _dosers[k].dosers.filter(v => v !== fData.source);
                                    }
                                    const generator = uuIdInt(0);
                                    const _uid = generator.uuid();
                                    _dosers[`${_uid}`] = {
                                        artigo_cod: bufArtigo.ITMREF_0,
                                        dosers: [fData.source]
                                    };
                                    _lotes[`${_uid}`] = {
                                        artigo_cod: bufArtigo.ITMREF_0,
                                        lotes: [{ n_lote: bufArtigo.LOT_0, qty_lote: parseFloat(bufArtigo.QTYPCU_0).toFixed(2), qty_lote_available: parseFloat(bufArtigo.QTYPCU_0).toFixed(2), qty_lote_consumed: 0 }]
                                    };
                                    console.log("##################-", _lotes);
                                    setGroups(prev => [...prev, { group_id: `${_uid}`, artigo_cod: bufArtigo.ITMREF_0 }]);
                                    setLotes(_lotes);
                                    form.setFieldsValue({ source: '' });
                                }

                            }
                            setDosers(_dosers);
                        }
                        inputRef.current.value = '';
                    }

                }


                /* sendJsonMessage({ cmd: 'pick', value: inputRef.current.value, cs: record.id }); */
                // if (inputRef.current.value.toUpperCase().startsWith("MP-")) {
                //     //Source / Type
                //     form.setFieldsValue({ source: inputRef.current.value.toUpperCase().replace("MP-", "") });
                //     inputRef.current.value = '';
                // } else {
                //     let fData = form.getFieldsValue(true);
                //     if (fData.source) {
                //         console.log("OI", inputRef.current.value, buffer, fData)
                //         let artigoBuffer = buffer.filter(v => v.LOT_0 === inputRef.current.value);
                //         if (artigoBuffer.length > 0) {
                //             if (/A[1-6]/.test(fData.source)) {
                //                 let idx = fData.lotesA.findIndex(v => v.matprima_cod === artigoBuffer[0].ITMREF_0);
                //                 fData.lotesA[idx]["mangueira"] = fData.source;
                //                 const lotes = fData.lotesA[idx].lotes.filter(v => v.lote !== inputRef.current.value);
                //                 lotes.push({ lote: inputRef.current.value, unit: artigoBuffer[0].PCUORI_0, qty: parseFloat(artigoBuffer[0].QTYPCU_0).toFixed(2) });
                //                 fData.lotesA[idx].lotes = lotes;
                //                 form.setFieldsValue({ lotesA: fData.lotesA })
                //             } else if (/B[1-6]/.test(fData.source)) {
                //                 let idx = fData.lotesB.findIndex(v => v.matprima_cod === artigoBuffer[0].ITMREF_0);
                //                 fData.lotesB[idx]["mangueira"] = fData.source;
                //                 const lotes = fData.lotesB[idx].lotes.filter(v => v.lote !== inputRef.current.value);
                //                 lotes.push({ lote: inputRef.current.value, unit: artigoBuffer[0].PCUORI_0, qty: parseFloat(artigoBuffer[0].QTYPCU_0).toFixed(2) });
                //                 fData.lotesB[idx].lotes = lotes;
                //                 form.setFieldsValue({ lotesB: fData.lotesB })
                //             } else if (/C[1-6]/.test(fData.source)) {
                //                 let idx = fData.lotesC.findIndex(v => v.matprima_cod === artigoBuffer[0].ITMREF_0);
                //                 fData.lotesC[idx]["mangueira"] = fData.source;
                //                 const lotes = fData.lotesC[idx].lotes.filter(v => v.lote !== inputRef.current.value);
                //                 lotes.push({ lote: inputRef.current.value, unit: artigoBuffer[0].PCUORI_0, qty: parseFloat(artigoBuffer[0].QTYPCU_0).toFixed(2) });
                //                 fData.lotesC[idx].lotes = lotes;
                //                 form.setFieldsValue({ lotesC: fData.lotesC });
                //             }
                //             inputRef.current.value = '';
                //         }
                //     }
                // }

                //setInputFocus();
            }
            //console.log("----",inputRef.current.state.value,'----',fv);
        } else {
        }
    }

    return (
        <>
            <Wnd parameters={modalParameters} setParameters={onModalParameters} />
            <ResultMessage
                result={resultMessage}
                successButtonOK={<Button type="primary" key="goto-of" onClick={onSuccessOK}>Lotes de Matérias Primas</Button>}
                successButtonClose={<Button key="goto-close" onClick={() => onClose(true)}>Fechar</Button>}
                errorButtonOK={<Button type="primary" key="goto-ok" onClick={onErrorOK}>OK</Button>}
                errorButtonClose={<Button key="goto-close" onClick={onClose}>Fechar</Button>}
            >
                <AlertsContainer id="el-external" />
                <AlertMessages formStatus={formStatus} />
                <Form form={form} name={`flotes`} onFinish={onFinish} onValuesChange={onValuesChange} component={wrapForm}>
                    <FormLayout
                        id="LAY-LOTES"
                        guides={guides}
                        layout="vertical"
                        style={{ width: "100%", padding: "0px", /* height: "65vh" */ /* , minWidth: "700px" */ }}
                        schema={schema}
                        field={{
                            forInput,
                            wide: [16],
                            margin: "2px", overflow: false, guides: false,
                            label: { enabled: true, pos: "top", align: "start", vAlign: "center", /* width: "80px", */ wrap: false, overflow: false, colon: true, ellipsis: true },
                            alert: { pos: "right", tooltip: true, container: false /* container: "el-external" */ },
                            layout: { top: "", right: "", center: "", bottom: "", left: "" },
                            required: true,
                            style: { alignSelf: "top" }
                        }}
                        fieldSet={{
                            guides: false,
                            wide: 16, margin: "2px", layout: "horizontal", overflow: false
                        }}
                    >
                        <FieldSet wide={16} margin={false} field={{ wide: [3, 6, 7] }}>
                            <Field forInput={false} name="source" label={{ enabled: false }} style={{ textAlign: "center" }}>
                                <Input size="small" />
                                {/* <MenuExtrusoras setExtrusora={setExtrusora} extrusora={extrusora} setFocus={() => setInputFocus(inputRef)} /> */}
                            </Field>
                            <FieldItem label={{ enabled: false }}><input className="ant-input" style={{ padding: "2px 7px" }} ref={inputRef} onKeyDown={onPick} autoFocus /></FieldItem>
                            <FieldItem label={{ enabled: false }}>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "right" }}>
                                    <ConfirmButton style={{marginRight:"3px"}} disabled={!touched} onClick={onFinish}>Confirmar</ConfirmButton>
                                    <Button style={{marginRight:"3px"}} disabled={!touched} onClick={onFinish}>Cancelar</Button>
                                    <Button style={{marginRight:"3px"}} disabled={Object.keys(dosers).length === 0 || touched} type='primary' onClick={() => onModalParameters({ type: "saida_doseador" })}>Saída de Doseador</Button>
                                    <Button disabled={Object.keys(lotes).length === 0 || touched} type='primary' onClick={() => onModalParameters({ type: "saida_mp" })}>Saída de MP</Button>
                                </div>
                            </FieldItem>
                        </FieldSet>

                        <YScroll>
                            {(groups && dosersSets) && groups.map((v, i) => {
                                return (
                                    <React.Fragment key={`grp-${v.group_id}`}>
                                        <ArtigoDesignacao artigo_cod={v.artigo_cod} buffer={buffer} />
                                        <Group>
                                            <Artigo artigo_cod={v.artigo_cod} lotes={lotes[v.group_id]?.lotes}></Artigo>

                                            <Dosers group_id={v.group_id} dosers={dosers[v.group_id]?.dosers} lotes={lotes[v.group_id]?.lotes} dosersSets={dosersSets} />

                                        </Group>
                                    </React.Fragment>
                                );
                            })}

                        </YScroll>


                    </FormLayout>
                </Form>
                {parentRef && <Portal elId={parentRef.current}>
                    <Space>
                        <Button type="primary" onClick={() => form.submit()}>Registar</Button>
                        <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button>
                    </Space>
                </Portal>
                }
            </ResultMessage>
        </>
    );
}