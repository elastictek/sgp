import React, { useEffect, useState, useCallback, useRef, useMemo, useContext, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi, { alternatives } from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import uuIdInt from "utils/uuIdInt";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, SelectMultiField } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import ResultMessage from 'components/resultMessage';
import YScroll from "components/YScroll";
import XScroll from "components/XScroll";
import Modalv4 from "components/Modalv4";
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, DatePicker, Select, Spin, Switch, Tag } from "antd";
import { SOCKET } from 'config';
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

// const Wnd = ({ parameters, setParameters }) => {
//     const { modalProps = {} } = parameters;
//     const iref = useRef();

//     return (
//         <ResponsiveModal
//             title={parameters.title}
//             visible={parameters.visible}
//             centered
//             responsive
//             onCancel={setParameters}
//             maskClosable={true}
//             destroyOnClose={true}
//             fullWidthDevice={parameters.fullWidthDevice}
//             width={parameters.width}
//             height={parameters.height}
//             bodyStyle={{ /* backgroundColor: "#f0f0f0" */ }}
//             footer={<div ref={iref} id="wnd-wrapper" style={{ textAlign: 'right' }}></div>}
//             {...modalProps}
//         >
//             <YScroll>
//                 {parameters.type == "saida_mp" && <Suspense fallback={<></>}><SaidaMP parameters={parameters} wndRef={iref} setParameters={setParameters} /></Suspense>}
//                 {parameters.type == "saida_doseador" && <Suspense fallback={<></>}><SaidaDoser parameters={parameters} wndRef={iref} setParameters={setParameters} /></Suspense>}
//                 {parameters.type == "reminder" && <Suspense fallback={<></>}><Reminder parameters={parameters} wndRef={iref} /></Suspense>}
//             </YScroll>
//         </ResponsiveModal>
//     );
// }

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

    /*     useEffect(() => {
            if (modalParameters.type === "saida_mp") {
                setModalParameters(prev => ({ ...prev, artigos }));
            } else if (modalParameters.type === "saida_doseador") {
                setModalParameters(prev => ({ ...prev, artigos }));
            }
        }, [artigos]); */


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
        sendJsonMessage({ cmd: 'loadlotesdosers', value: {} });
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
        event.preventDefault();
        console.log("aaaaaaaaaa", event.keyCode)
        onPick(event);
    };

    const onPick = (e) => {
        if (e.keyCode == 9 || e.keyCode == 13) {
            form.setFieldsValue({ viewer: '' });
            if (inputRef.current !== '') {
                if (!touched) { setTouched(true); }
                e.preventDefault();
                const v = inputRef.current.toUpperCase();
                if (DOSERS.includes(v)) {
                    //Source / Type
                    form.setFieldsValue({ source: v });
                    inputRef.current = '';
                } else {
                    let fData = form.getFieldsValue(true);
                    let picked = false;
                    if (fData.source) {
                        let _artigos = { ...artigos };

                        let pickData = v.split(';');
                        if (pickData.length < 2) {
                            pickData = v.split('#');
                        }
                        if (pickData.length > 1) {
                            //Check se o artigo está na formulação
                            if (!(pickData[0] in _artigos)) return;
                            //Check se o doseador corresponde ao artigo e formulação
                            let allowPick = false;
                            let _group = null;
                            let _groupLote = null;
                            for (let v of Object.keys(_artigos[pickData[0]])) {
                                if (_artigos[pickData[0]][v].dosers.includes(fData.source)) {
                                    _group = v;
                                    allowPick = true;
                                }
                                //Check if Lote is already picked by other doser/same and store group
                                if (_artigos[pickData[0]][v].lotes.some(d => d.n_lote === pickData[1])) {
                                    _groupLote = v;
                                }
                            }
                            if (allowPick) {
                                console.log("-----ALLOW PICK-----")
                                //Check if is in Buffer
                                let bufArtigo = buffer.find(v => v.ITMREF_0 === pickData[0] && v.LOT_0 === pickData[1]);
                                if (bufArtigo) {
                                    console.log("-----BUFFER ARTIGO-----", bufArtigo, _group)
                                    if (_group === "undefined") {
                                        console.log("-----UNDEFINED GROUP-----")
                                        //Remove doser from undefined group
                                        _artigos[pickData[0]][_group].dosers = _artigos[pickData[0]][_group].dosers.filter(v => v !== fData.source);
                                        if (_groupLote === null) {
                                            //Lote not picked
                                            const _uid = uuIdInt(0).uuid();
                                            _artigos[pickData[0]][_uid] = { newgroup: true, dosers: [fData.source], lotes: [{ lote_id: bufArtigo.ROWID, n_lote: bufArtigo.LOT_0, qty_lote: parseFloat(bufArtigo.QTYPCU_0).toFixed(2), qty_lote_available: parseFloat(bufArtigo.QTYPCU_0).toFixed(2), qty_lote_consumed: 0 }] };
                                        } else {
                                            //Lote already picked
                                            _artigos[pickData[0]][_groupLote].dosers.push(fData.source);
                                        }
                                        console.log("PODE PICAR.......criar grupo e remover doser do grupo anterior e  adicionar lote!", _group, _groupLote)
                                    } else {
                                        console.log("-----HAS GROUP-----", _artigos[pickData[0]][_group])
                                        let _newDosers = [];
                                        let _newLotes = [];
                                        if (!_artigos[pickData[0]][_group]?.newgroup) {
                                            //Verificar se já existe algum lote picado onde tenha sido criado um novo grupo...
                                            let newgroups = Object.keys(_artigos[pickData[0]]).filter(key => _artigos[pickData[0]][key]?.newgroup === true && _artigos[pickData[0]][key].lotes.some(v => v.lote_id === bufArtigo.ROWID));
                                            for (let v of newgroups) {
                                                _newDosers.push(..._artigos[pickData[0]][v]?.dosers);
                                                _newLotes.push(..._artigos[pickData[0]][v]?.lotes);
                                                delete _artigos[pickData[0]][v];
                                            }
                                            console.log("NEW GROUPS-->", newgroups, _newDosers);
                                        }
                                        const _dosers = [...new Set([..._newDosers, ..._artigos[pickData[0]][_group].dosers, fData.source])];
                                        const _lotes = [..._newLotes, ..._artigos[pickData[0]][_group].lotes, { lote_id: bufArtigo.ROWID, n_lote: bufArtigo.LOT_0, qty_lote: parseFloat(bufArtigo.QTYPCU_0).toFixed(2), qty_lote_available: parseFloat(bufArtigo.QTYPCU_0).toFixed(2), qty_lote_consumed: 0 }];
                                        _artigos[pickData[0]][_group] = { dosers: _dosers, lotes: _lotes.filter((a, i) => _lotes.findIndex((s) => a.lote_id === s.lote_id) === i) };
                                        console.log("PODE PICAR.......e adicionar lote!", _group);
                                    }
                                    setArtigos(_artigos);
                                    form.setFieldsValue({ source: '' });
                                }
                            }
                        }
                        inputRef.current = '';
                    }
                }
                //setInputFocus();
            }
        } else if (e.keyCode === 27) {
            inputRef.current = '';
            form.setFieldsValue({ viewer: '' });
        } else if (e.keyCode <= 46) {

        } else {
            inputRef.current = `${inputRef.current}${e.key}`;
            form.setFieldsValue({ viewer: inputRef.current });
        }
    }

    const onFocus = (f) => {
        setFocusStyle(f ? { boxShadow: "inset 0px 0px 40px 40px #DBA632" } : {});
    }

/*     const InputManual = ({ inputRef }) => {
        const [valor,setValor] = useState('');
        return (
            <Input tabIndex={-1} onChange={(v) => inputRef.current = `${inputRef.current}${v}`} value={inputRef.current.value} />
        );
    }

    const onManualInput = (e) => {
        Modalv4.show({
            title: "Insira o valor", width: "200px", height: "180px",
            content: <InputManual inputRef={inputRef} />,
            onOk: () => { },
            onCancel: () => inputRef.current = ''
        });
    } */

    return (
        <div onKeyDown={keydownHandler} tabIndex={-1} style={{ ...focusStyle }} onFocus={() => onFocus(true)} onBlur={() => onFocus(false)}>
            <Modalv4 />
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
                            <Field name="viewer" forInput={false} label={{ enabled: false }}><Input size='small'/*  onDoubleClick={onManualInput} */ /></Field>
                            <FieldItem label={{ enabled: false }}>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "right" }}>
                                    <ConfirmButton style={{ marginRight: "3px" }} disabled={!touched} onClick={onFinish}>Confirmar</ConfirmButton>
                                    <Button style={{ marginRight: "3px" }} disabled={!touched} onClick={onCancel}>Cancelar</Button>
                                    {/* <Button style={{ marginRight: "3px" }} disabled={touched} type='primary' onClick={() => onModal({ type: "saida_doseador" })}>Saída de Doseador</Button> */}
                                    <Button disabled={touched} type='primary' onClick={() => onModal({ type: "saida_mp" })}>Saída de MP</Button>
                                </div>
                            </FieldItem>
                        </FieldSet>

                        <YScroll>

                            {artigos && Object.keys(artigos).map((k, i) => {
                                return (
                                    <React.Fragment key={`art-${k}`}>
                                        <ArtigoDesignacao artigo_cod={k} buffer={buffer} />
                                        {Object.keys(artigos[k]).map((kg, ig) => {
                                            return (
                                                <React.Fragment key={`grp-${k}-${ig}`}>
                                                    {(artigos[k][kg].lotes.length > 0 || artigos[k][kg].dosers.length > 0) && <Group>
                                                        {artigos[k][kg].dosers.length > 0 && <Lotes lotes={artigos[k][kg].lotes} />}
                                                        {artigos[k][kg].dosers.length > 0 && <Dosers dosers={artigos[k][kg].dosers} lotes={artigos[k][kg].lotes} dosersSets={dosersSets} />}
                                                    </Group>}
                                                </React.Fragment>
                                            );
                                        })}

                                    </React.Fragment>
                                )
                            })}

                        </YScroll>

                    </FormLayout>
                </Form>
            </ResultMessage>
        </div>
    );
}