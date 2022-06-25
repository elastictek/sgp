import React, { useEffect, useState, useCallback, useRef, useMemo, useContext, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi, { alternatives } from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL, SCREENSIZE_OPTIMIZED, DATETIME_FORMAT } from "config";
import { getSchema } from "utils/schemaValidator";
import uuIdInt from "utils/uuIdInt";
import dayjs from 'dayjs';
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, SelectMultiField } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import ResultMessage from 'components/resultMessage';
import { useDataAPI } from "utils/useDataAPI";
import Table, { setColumns } from "components/table";
import YScroll from "components/YScroll";
import XScroll from "components/XScroll";
import Modalv4 from "components/Modalv4";
import Portal from "components/portal";
import { EllipsisOutlined, LoadingOutlined } from '@ant-design/icons';
import { Input, Space, Form, Button, InputNumber, DatePicker, Select, Spin, Switch, Tag, Modal, Typography, Dropdown, Menu } from "antd";
const { Title } = Typography;
import { SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import { SocketContext } from '../App';
import ResponsiveModal from "components/ResponsiveModal";
import TagButton from "components/TagButton";
import useModalv4 from 'components/useModalv4';


const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const useFocus = () => {
    const htmlElRef = useRef(null)
    const setFocus = () => { htmlElRef.current && htmlElRef.current.focus() }
    return [htmlElRef, setFocus]
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
            height:40px;
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
    /* const [modal, setModal] = useState({ visible: false }); */
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [lote, setLote] = useState();

    /*     const onCancel = () => {
            setModal(prev => ({ ...prev, visible: !prev.visible }))
        } */

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
        Modalv4.show({
            width: "300px", height: "200px", fullWidthDevice: 1, title: "Resto de Matéria Prima",
            footer: <div><Button type="primary" onClick={() => onFinish(lt)}>Registar</Button><Button onClick={onCancel}>Cancelar</Button></div>,
            content: <Suspense fallback={<></>}><Reminder parameters={{ lote: lt, form }} /></Suspense>
        });
        //const modalProps = { footer: <div><Button type="primary" onClick={() => onFinish(lt)}>Registar</Button><Button onClick={onCancel}>Cancelar</Button></div> }
        //setModal(prev => ({ ...prev, lote: lt, visible: !prev.visible, width: "300px", height: "200px", fullWidthDevice: 1, title: "Resto de Matéria Prima", type: "reminder", form, modalProps }));
    }

    useEffect(() => {



        let mp = [];
        //let d = [];
        if (parameters?.artigos) {
            Object.keys(parameters.artigos).forEach(v => {
                let k = Object.keys(parameters.artigos[v])[0];
                if (k !== "undefined") {
                    const artigo = buffer.find(n => n.ITMREF_0 === v);
                    for (let y of parameters.artigos[v][k].lotes) {
                        mp.push({ artigo_cod: v, artigo_des: artigo.ITMDES1_0, ...y });
                    }
                }
            });
        }

        /*         const lt = [];
                for (const [key, value] of Object.entries(parameters.lotes)) {
                    if (key !== 'null') {
                        const artigo = buffer.find(v => v.ITMREF_0 === value.artigo_cod);
                        for (const v of value.lotes) {
                            lt.push({ artigo_cod: value.artigo_cod, artigo_des: artigo.ITMDES1_0, ...v });
                        }
                    }
                } */
        setLotes(mp);
    }, [parameters.artigos]);
    return (
        <div style={{ textAlign: "center" }}>
            {/* <Wnd parameters={modal} setParameters={onModal} /> */}
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
        if (parameters?.artigos) {
            Object.keys(parameters.artigos).forEach(v => {
                let k = Object.keys(parameters.artigos[v])[0];
                if (k !== "undefined") {
                    for (let v of parameters.artigos[v][k].dosers) {
                        d.push({ value: v });
                    }
                }
            });
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

const Group = ({ children }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", marginBottom: "10px", border: "solid 1px #d9d9d9", borderRadius: "2px", background: "#f5f5f5", padding: "3px" }}>{children}</div>
    );
}

const ArtigoDesignacao = ({ artigo_cod, buffer }) => {
    const [designacao, setDesignacao] = useState({});
    useEffect(() => {
        if (artigo_cod) {
            const artigo = buffer.find(v => v.ITMREF_0 === artigo_cod);
            if (!artigo) {
                setDesignacao({ txt: artigo_cod, buffer: false });
            } else {
                setDesignacao({ txt: artigo.ITMDES1_0, buffer: true });
            }
        }
    }, [artigo_cod]);

    return (
        <>
            {designacao &&
                <div style={{ width: "100%", fontSize: "14px", fontWeight: 700, color: (designacao.buffer ? "#000" : "#ff4d4f") }}>
                    {designacao.txt}
                </div>
            }
        </>
    );
}

const Lotes = ({ lotes }) => {
    return (
        <div style={{ minWidth: "220px", maxWidth: "220px", marginRight: "10px" }}>
            {lotes && lotes.map(v => {
                return (v.n_lote === null) ? <div key={v.n_lote} /> :
                    <div style={{ borderBottom: "dashed 1px #d9d9d9" }} key={`lid-${v.lote_id}`}>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>{v.n_lote}<div><b>{parseFloat(v.qty_lote_available).toFixed(2)}</b>kg</div></div>
                        {/* {v.n_lote && <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{parseFloat(v.qty_lote).toFixed(2)}kg</div><div>{parseFloat(v.qty_lote_available).toFixed(2)}kg</div></div>} */}
                    </div>;
            })}
        </div>
    );
}

const DOSERS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6']

const Dosers = ({ dosers, lotes, dosersSets }) => {
    const [qty, setQty] = useState();
    useEffect(() => {
        if (lotes && lotes.length > 0) {
            setQty(lotes.map(item => item.qty_lote_available).reduce((prev, next) => prev + next));
        }
        else {
            setQty(0);
        }
    }, [lotes]);

    return (
        <XScroll style={{ alignSelf: "center" }}>
            <div style={{ display: "flex", flexDirection: "row", alignSelf: "center" }}>
                {dosers.map((x, i) =>
                    <React.Fragment key={`dl-${x}-${i}`}>
                        <StyleDoser enabled={(dosers && dosers.length > i)} qty={qty}>
                            <div style={{ textAlign: "center", fontWeight: 700, fontSize: '12px' }}>{(dosers && dosers.length > i) && dosers[i]}</div>
                            {(dosers && dosers.length > i) &&
                                <div style={{ display: "flex", flexDirection: "row", fontSize: '10px' }}>
                                    <div style={{ width: "30px", textAlign: "center", borderRight: "solid 1px #d9d9d9", color: (qty > 0) ? "#52c41a" : "#b7eb8f", fontWeight: 700 }}>{dosersSets[0][`${dosers[i]}_S`]}%</div>
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

const Quantity = ({ v, unit = "kg" }) => {
    return (<div style={{ display: "flex", flexDirection: "row" }}>{v !== null && <><div style={{ width: "80%", textAlign: "right" }}>{parseFloat(v).toFixed(2)}</div><div style={{ width: "20%", marginLeft: "2px" }}>{unit}</div></>}</div>);
}

const actionItems = (t) => {
    switch (t) {
        default: return [
            { label: 'Saída de Matéria Prima', key: 'out_mp' },
            { label: 'Saída do doseador', key: 'out_doser' }
        ];
    }
};

const Action = ({ r, before, onClick, children }) => {
    const showAdd = () => {
        if ((!before || before["nome"] !== r["nome"]) && r["type_mov"] === "C") {
            return true;
        }
        return false;
    }

    const showOut = () => {
        if (r["type_mov"] === "IN") {
            return true;
        }
        return false
    }

    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
            <Dropdown overlay={<Menu onClick={(e, v) => onClick(r, e.key)} items={actionItems()} />} trigger={["click"]}>
                <Button size="small"><Space>{children}<EllipsisOutlined /* style={{fontSize:"26px"}}  */ /></Space></Button>
            </Dropdown>
        </div>
    );
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [changedValues, setChangedValues] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    //const [inputRef, setInputFocus] = useFocus();
    const inputRef = useRef("");
    const [buffer, setBuffer] = useState(null);
    const [settings, setSettings] = useState(null);
    const [lotesDosers, setLotesDosers] = useState(null);
    const [dosersSets, setDosersSets] = useState(null);
    const [focusStyle, setFocusStyle] = useState({});
    const [manual, setManual] = useState(false);
    const modal = useModalv4();
    const [selectedRows, setSelectedRows] = useState([]);
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/mpginout/`, parameters: {}, pagination: { enabled: true, pageSize:20 }, filter: {}, sort: [{ column: 'order', direction: 'DESC' },] } });


    const [artigos, setArtigos] = useState();
    const [touched, setTouched] = useState(false);

    const onModal = (parameters) => {
        switch (parameters.type) {
            case "saida_mp":
                Modalv4.show({ width: "500px", height: "500px", fullWidthDevice: 1, title: "Saída de Matéria Prima", content: <><Modalv4 /><Suspense fallback={<></>}><SaidaMP parameters={{ artigos, buffer }} /></Suspense></> });
                break;
            case "saida_doseador":
                Modalv4.show({ width: "500px", height: "180px", fullWidthDevice: 1, title: "Saída de Doseador", content: <Suspense fallback={<></>}><SaidaDoser parameters={{ artigos }} /></Suspense> });
                break;
        }
    }

    const { data: dataSocket } = useContext(SocketContext) || {};
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/lotespick`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000
    });

    useEffect(() => {
        const cancelFetch = cancelToken();
        dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, []);



    useEffect(() => {
        const cancelFetch = cancelToken();
        (async () => {
            (setFormTitle) && setFormTitle({ title: `Lotes de Matéria Prima` });
            setLoading(false);
        })();
        return (() => cancelFetch.cancel("Form Lotes Cancelled"));
    }, []);

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

    useEffect(() => {
        (async () => {
            sendJsonMessage({ cmd: 'loadinproduction', value: {} });
        })();
    }, [dataSocket?.inproduction]);

    useEffect(() => {
        if (lastJsonMessage) {
            if (lastJsonMessage.item === "buffer") {
                setBuffer([...lastJsonMessage.rows]);
                console.log("BUFFER-->", lastJsonMessage.rows)
            } else if (lastJsonMessage.item === "inproduction") {
                console.log("SETTINGS FORMULAÇÃO-->", lastJsonMessage.rows[0])
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

    const pickedDoser = (doser, artigo) => {
        if (doser) {
            for (let ld of lotesDosers) {
                if (ld.group_id !== null) {
                    if (ld.dosers.includes(doser) && ld.artigo_cod === artigo) {
                        return { artigo_cod: ld.artigo_cod, group_id: ld.group_id, lotes: JSON.parse(ld.lotes) };
                    }
                }
            }
        }
        return { lotes: [] };
    }

    const _pushArtigos = (_artigos, _doser, itemForm) => {
        let _pd = pickedDoser(_doser, itemForm.matprima_cod);
        let _grp = _pd?.group_id;
        if (!(_grp in _artigos[itemForm.matprima_cod])) {
            _artigos[itemForm.matprima_cod][_grp] = { dosers: [], lotes: [] };
        }
        _artigos[itemForm.matprima_cod][_grp].dosers.push(_doser);
        let arrlotes = [..._artigos[itemForm.matprima_cod][_grp].lotes, ..._pd.lotes];
        _artigos[itemForm.matprima_cod][_grp].lotes = arrlotes.filter((a, i) => arrlotes.findIndex((s) => a.lote_id === s.lote_id) === i);
    }

    useEffect(() => {
        if (lotesDosers && dosersSets && settings && !touched) {
            console.log("LOADED FORMULAÇÃO", JSON.parse(settings.formulacao).items);
            console.log("LOADED LOTES", lotesDosers);
            const items = JSON.parse(settings.formulacao).items;
            const _artigos = {};

            for (let itemForm of items) {
                if (!(itemForm.matprima_cod in _artigos)) {
                    _artigos[itemForm.matprima_cod] = {};
                }
                let _doser = null;
                if (itemForm?.doseador_A) {
                    _doser = itemForm.doseador_A;
                    _pushArtigos(_artigos, _doser, itemForm);
                }
                if (itemForm?.doseador_B) {
                    _doser = itemForm.doseador_B;
                    _pushArtigos(_artigos, _doser, itemForm);
                }
                if (itemForm?.doseador_C) {
                    _doser = itemForm.doseador_C;
                    _pushArtigos(_artigos, _doser, itemForm);
                }
            }
            setArtigos(_artigos);
        }
    }, [lotesDosers, dosersSets, settings]);

    const onValuesChange = (changedValues) => {
        setChangedValues(changedValues);
    }

    const onCancel = () => {
        setTouched(false);
        form.setFieldsValue({ source: '' });
        inputRef.current = '';
    }

    const onFinish = async (values) => {
        const status = { error: [], warning: [], info: [], success: [] };
        const response = await fetchPost({ url: `${API_URL}/pick/`, parameters: { artigos } });
        setTouched(false);
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

    const keydownHandler = (event) => {

        if (!manual) {
            event.preventDefault();
            onPick(event);
        }
    };

    const handleWndClick = async (bm, type) => {
        let title = '';


    };

    const onPick = async (e, obj) => {
        const keyCode = (e === null) ? obj.keyCode : e.keyCode;
        console.log(e, obj)
        if (keyCode == 9 || keyCode == 13) {
            form.setFieldsValue({ viewer: '' });
            if (inputRef.current !== '') {
                if (!touched) { setTouched(true); }
                if (e) {
                    e.preventDefault();
                }
                let v = inputRef.current;
                v = v.startsWith("000026") ? v.replace("000026", "").split(";") : v.split(";");
                if (v.every(itm => DOSERS.includes(itm.toUpperCase()))) {
                    //Source / Type
                    let s = form.getFieldValue("source") ? form.getFieldValue("source").split(";") : [];
                    for (let t of v) {
                        if (s.includes(t.toUpperCase())) {
                            s = s.filter(e => e !== t.toUpperCase());
                        }
                        else {
                            s.push(t.toUpperCase());
                        }
                    }
                    form.setFieldsValue({ source: s.sort().join(";") });
                    inputRef.current = '';
                } else {
                    let fData = form.getFieldsValue(true);
                    let picked = false;
                    if (fData.source) {
                        let _artigos = { ...artigos };
                        let pickData = v;
                        if (pickData.length < 2) {
                            pickData = pickData.join('').split('#');
                        }
                        if (pickData.length > 1) {

                            console.log({ source: fData.source, artigo_cod: pickData[0], n_lote: pickData[1], qty: pickData[2] })
                            const status = { error: [], warning: [], info: [], success: [] };
                            const response = await fetchPost({ url: `${API_URL}/pickmp/`, parameters: { source: fData.source, artigo_cod: pickData[0], n_lote: pickData[1], qty: pickData[2], type_mov: "IN" } });
                            if (response.data.status !== "error") {
                                dataAPI.fetchPost();
                            } else {
                                Modal.error({ title: 'Erro ao Picar Lote', content: response.data.title });
                            }


                        }
                        form.setFieldsValue({ source: '' });
                        inputRef.current = '';
                    }
                    inputRef.current = '';
                }
                //setInputFocus();
            }
        } else if ((keyCode >= 48 && keyCode <= 90) || keyCode == 186 || keyCode == 188 || keyCode == 110 || keyCode == 190) {
            inputRef.current = `${inputRef.current}${e.key}`;
            form.setFieldsValue({ viewer: inputRef.current });
        } else if (keyCode == 16) {

        } else {
            inputRef.current = '';
            form.setFieldsValue({ viewer: '' });
        }
    }

    const onFocus = (f) => {
        setFocusStyle(f ? { boxShadow: "inset 0px 20px 20px 0px #DBA632" } : {});
    }

    const InputManual = ({ inputRef }) => {
        const [valor, setValor] = useState('');

        const onChange = (e, v) => {
            inputRef.current = e.target.value
            form.setFieldsValue({ viewer: e.target.value });
        }

        return (
            <Input tabIndex={-1} onChange={onChange} value={inputRef.current.value} />
        );
    }

    const onManualInput = (e) => {
        setManual(true);
        modal.show({
            title: "Insira o valor",
            width: "350px",
            height: "180px",
            content: <InputManual inputRef={inputRef} />,
            onOk: () => { onPick(null, { keyCode: 9 }) },
            onCancel: () => setManual(false)
        });
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "mpg_list",
            include: {
                ...((common) => (
                    {
                        action: { sort: false, title: "Movimento", width: 100, render: (v, r, i) => <Action onClick={handleWndClick} r={r} before={i > 0 && dataAPI.getData().rows[i - 1]}>{r.type_mov == "IN" ? "Entrada" : "Saída"}</Action>, ...common },
                        dosers: { title: "Doseadores", width: 150, align: "center", render: (v, r) => v, ...common },
                        ITMDES1_0: { title: "Designação", align: "left", render: (v, r) => <b>{v}</b>, ...common },
                        qty_lote: { title: "Qtd", width: 130, align: "right", render: (v, r) => <Quantity v={v} />, ...common },
                        group_id: { title: "Cuba", width: 70, align: "center", render: (v, r) => v, ...common },
                        artigo_cod: { title: "Código", width: 180, align: "left", render: (v, r) => v, ...common },
                        n_lote: { title: "Lote", width: 180, align: "left", render: (v, r) => v, ...common },
                        t_stamp: { title: "Data", width: 130, ellipsis: true, render: (v, r) => <div style={{ whiteSpace: 'nowrap' }}><span>{dayjs((r.t_stamp) ? r.t_stamp : v).format(DATETIME_FORMAT)}</span></div>, ...common },

                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    const selectionRowKey = (record) => {
        return `${record.id}`;
    }



    return (
        <div onKeyDown={keydownHandler} tabIndex={-1} style={{ ...focusStyle }} onFocus={() => onFocus(true)} onBlur={() => onFocus(false)}>
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
                            <Field name="viewer" forInput={false} label={{ enabled: false }}><Input size='small' onDoubleClick={onManualInput} /></Field>
                            <FieldItem label={{ enabled: false }}>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "right" }}>
                                    {/* <ConfirmButton style={{ marginRight: "3px" }} disabled={!touched} onClick={onFinish}>Confirmar</ConfirmButton> */}
                                    <Button style={{ marginRight: "3px" }} disabled={!touched} onClick={onCancel}>Cancelar</Button>
                                    {/* <Button style={{ marginRight: "3px" }} disabled={touched} type='primary' onClick={() => onModal({ type: "saida_doseador" })}>Saída de Doseador</Button> */}
                                </div>
                            </FieldItem>
                        </FieldSet>

                        <YScroll>
                            <Spin spinning={dataAPI.isLoading()} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /* style={{ top: "50%", left: "50%", position: "absolute" }}  */>
                                <Table
                                    title={<Title level={4}>Lotes de Granulado na Linha de Produção</Title>}
                                    columnChooser={false}
                                    toolbar={false}
                                    reload={false}
                                    clearSort={false}
                                    rowHover={true}
                                    stripRows={true}
                                    darkHeader
                                    //rowClassName={(record) => (record.nome || record.type !== 1) ? 'data-row' : `data-row ${classes.noRelationRow}`}
                                    size="small"
                                    //toolbar={<GlobalSearch columns={columns?.report} form={formFilter} dataAPI={dataAPI} setShowFilter={setShowFilter} showFilter={showFilter} />}
                                    selection={{ enabled: false, rowKey: record => selectionRowKey(record), onSelection: setSelectedRows, multiple: false, selectedRows, setSelectedRows }}
                                    paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                                    dataAPI={dataAPI}
                                    columns={columns}
                                    onFetch={dataAPI.fetchPost}
                                //scroll={{ x: ((SCREENSIZE_OPTIMIZED.width / 2) - 20), y: '70vh', scrollToFirstRowOnChange: true }}
                                //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}
                                />
                            </Spin>
                        </YScroll>

                    </FormLayout>
                </Form>
            </ResultMessage>
        </div>
    );
}