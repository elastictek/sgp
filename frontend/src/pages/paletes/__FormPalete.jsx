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
import loadInit from "utils/loadInit";
import { EllipsisOutlined, LoadingOutlined } from '@ant-design/icons';
import { Input, Space, Form, Button, InputNumber, DatePicker, Select, Spin, Switch, Tag, Modal, Typography, Dropdown, Menu } from "antd";
const { Title } = Typography;
import { SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import ResponsiveModal from "components/ResponsiveModal";
import TagButton from "components/TagButton";
import useModalv4 from 'components/useModalv4';
import { useNavigate, useLocation } from "react-router-dom";


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

export default ({ forInput = true, ...props }) => {
    const [form] = Form.useForm();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [changedValues, setChangedValues] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    const inputRef = useRef("");
    const posRef = useRef();
    const [focusStyle, setFocusStyle] = useState({ background: "#fff" });
    const [manual, setManual] = useState(false);
    const modal = useModalv4();
    const [numBobines, setNumBobines] = useState();
    const [bobines, setBobines] = useState();
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        const data = loadInit({}, {}, props, location?.state, ["num_bobines"]);
        setNumBobines(data.num_bobines);
        setBobines([...Array(data.numBobines)]);
    }, []);

    const onCancel = () => {
        setTouched(false);
        form.setFieldsValue({ source: '' });
        inputRef.current = '';
    }

    const onFinish = async (values) => {
        //const status = { error: [], warning: [], info: [], success: [] };
        //const response = await fetchPost({ url: `${API_URL}/createpalete/`, parameters: {} });
        //setTouched(false);
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
            //onPick(event);
        }
    };

    const onPick = async (e, obj) => {
        const keyCode = (e === null) ? obj.keyCode : e.keyCode;
        
        if (keyCode == 9 || keyCode == 13) {
            if (posRef.current && inputRef.current){
                const aux = [...bobines];
                aux[posRef.current-1]=inputRef.current;
                setBobines([...aux]);
            }else if (inputRef.current){

            }
        }

        
        console.log("PICK",posRef.current, inputRef.current);
        console.log(keyCode);
        console.log(form.getFieldsValue(true));
    }

    const onFocus = (f) => {
        setFocusStyle(f ? { background: "#bae7ff" /* boxShadow: "inset 0px 20px 20px 0px #DBA632" */ } : { background: "#fff" });
    }

    const InputManual = ({ numBobines }) => {
        const [options, setOptions] = useState([ ...Array(numBobines).keys() ].map(f=>({value:f+1,label:f+1})));

        const onChange = (e, v) => {
            if (v=="pos"){
                posRef.current=e;
                form.setFieldsValue({pos: e });
            }else{
                inputRef.current=e.target.value;
                form.setFieldsValue({viewer: e.target.value });
            }
        }

        return (
            <div style={{display:"flex",flexDirection:"row"}}>
                <Select size="small" tabIndex={-1} onChange={(e)=>onChange(e,"pos")} options={options} />
                <Input size="small" tabIndex={-1} onChange={onChange}/>
            </div>
        );
    }

    const onManualInput = (e,numBobines) => {
        setManual(true);
        modal.show({
            title: "Indique a Bobine e Posição na Palete",
            width: "350px",
            height: "100px",
            content: <InputManual numBobines={numBobines} />,
            onOk: () => { onPick(null, { keyCode: 9 }) },
            onCancel: () => setManual(false)
        });
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
                <Form form={form} name={`fbobines`} onFinish={onFinish}>
                    <FormLayout
                        id="LAY-PALETES"
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
                        <FieldSet wide={16} margin={false} field={{ wide: [6] }}>
                            <Field name="viewer" forInput={false} label={{ enabled: false }}><Input size='small' onDoubleClick={(e)=>onManualInput(e,numBobines)} /></Field>
                            <FieldItem label={{ enabled: false }}>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "right" }}>
                                    {/* <ConfirmButton style={{ marginRight: "3px" }} disabled={!touched} onClick={onFinish}>Confirmar</ConfirmButton> */}
                                    <Button style={{ marginRight: "3px" }} disabled={!touched} onClick={onCancel}>Cancelar</Button>
                                    {/* <Button style={{ marginRight: "3px" }} disabled={touched} type='primary' onClick={() => onModal({ type: "saida_doseador" })}>Saída de Doseador</Button> */}
                                </div>
                            </FieldItem>
                        </FieldSet>

                        <YScroll>
                            {bobines && [...Array(numBobines)].map((x, i) =>
                                <div key={`bo-${i}`} style={{ display: "flex", flexDirection: "row", height: "25px", alignContent: "center" }}>
                                    <div style={{ width: "20px", textAlign: "right" }}><b>{i + 1}</b></div>
                                    <div style={{ border: "dashed 1px #000", width: "150px", margin: "3px" }}>{bobines[i]}</div>
                                </div>
                            )}

                            {/*                             
                            <Spin spinning={dataAPI.isLoading()} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
                                
                            </Spin> */}
                        </YScroll>

                    </FormLayout>
                </Form>
            </ResultMessage>
        </div>
    );
}