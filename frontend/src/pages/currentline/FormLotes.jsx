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
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, DatePicker, Select, Spin, Switch, Tag } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT, FORMULACAO_MANGUEIRAS, SOCKET, COLORS } from 'config';
import useWebSocket from 'react-use-websocket';
import { SocketContext } from '../App';
import ResponsiveModal from "components/ResponsiveModal";
import TagButton from "components/TagButton";
import { F } from 'ramda';

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const setId = (id) => {
    if (id) {
        return { key: "update", values: { id } };
    }
    return { key: "insert", values: {} };
}

const loadMateriasPrimasLookup = async ({ token }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimaslookup/`, filter: {}, sort: [], cancelToken: token });
    return rows;
}

const loadLotesLookup = async (lote_cod, item_cod) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/loteslookup/`, pagination: { limit: 10 }, filter: { item_cod, loc_cod: 'BUFFER', lote_cod: `%${lote_cod}%` } });
    return rows;
}

const TitleExtrusora = ({ value, extrusoraRef }) => {
    const show = useRef(false);
    useEffect(() => {
        if (extrusoraRef.current !== value) {
            show.current = true;
            console.log("extrusora", value, extrusoraRef.current)
            extrusoraRef.current = value;
        } else {
            show.current = false;
        }
    }, []);

    return (
        <>
            {show.current &&
                <FieldSet wide={16} layout="horizontal" margin={false} field={{ wide: [8, 1.5, 1.5, 5], label: { enabled: false } }}>
                    <FieldItem><div style={{ fontWeight: 700/* , fontSize: "12px" */ }}>Extrusora {value}</div></FieldItem>
                    <FieldItem><div style={{ textAlign: "right" }}>Qtd. Requerida</div></FieldItem>
                    <FieldItem><div style={{ textAlign: "right" }}>Qtd. Disponível</div></FieldItem>
                    <FieldItem><div style={{ textAlign: "center" }}>Lotes</div></FieldItem>
                </FieldSet>
            }
        </>
    )
}

const useFocus = () => {
    const htmlElRef = useRef(null)
    const setFocus = () => { htmlElRef.current && htmlElRef.current.focus() }
    return [htmlElRef, setFocus]
}

const StyledButtonMenu = styled(Button).withConfig({
    shouldForwardProp: (prop) => !['first'].includes(prop)
})`
    border-radius:0px !important;
    ${({ first = false }) => !first && css`border-left: 0px !important;`}
`;

const MenuExtrusoras = ({ setExtrusora, extrusora, setFocus }) => {
    const onSelect = (v) => {
        if (extrusora === 'BC' && v === 'BC') {
            setExtrusora('C');
        } else if (extrusora === 'BC' && v === 'C') {
            setExtrusora('B');
        } else {
            setExtrusora(v);
        }
        setFocus();
    }
    const type = (v) => {
        if (v.includes(extrusora)) {
            return 'primary';
        }
        return 'default';
    }

    return (
        <>
            <StyledButtonMenu size='small' onClick={() => onSelect('A')} first={true} type={type(['A'])}>Extrusora A</StyledButtonMenu>
            <StyledButtonMenu size='small' onClick={() => onSelect('BC')} type={type(['B', 'BC'])}>Extrusora B</StyledButtonMenu>
            <StyledButtonMenu size='small' onClick={() => onSelect('C')} type={type(['C', 'BC'])}>Extrusora C</StyledButtonMenu>
        </>
    );
}

const XXXXExtrusora = ({ extrusoraRef, form, id, matPrimasLookup }) => {
    const name = `lotes${id}`;
    return (
        <Form.List name={name}>
            {(fields, { add, remove, move }) => {
                return (
                    <>
                        {fields.map((field, index) => (
                            <React.Fragment key={field.key}>
                                <TitleExtrusora extrusoraRef={extrusoraRef} value={form.getFieldValue(name)[field.name]['extrusora']} />
                                {/* <FieldSet wide={8} layout="horizontal" margin={false} field={{ label: { enabled: false } }} style={{ ...(index % 2 == 0 && { backgroundColor: "#f5f5f5" }) }}> */}
                                <FieldSet wide={16} margin={false}
                                    /* style={{ ...(index % 2 == 0 && { backgroundColor: "#f5f5f5" }) }} */
                                    field={{
                                        label: { enabled: false },
                                        style: { alignSelf: "center" },
                                        wide: [1, 7, 1.5, 1.5, 5],
                                        /* style: { border: "solid 1px #fff", borderLeft: "none", fontWeight: "10px" } */
                                    }}
                                >
                                    <Field name={[field.name, `mangueira`]} style={{ /* fontSize: "12px",  */backgroundColor: "#fff", alignSelf: "center" }}>
                                        <SelectField tabIndex={1000} size="small" data={FORMULACAO_MANGUEIRAS[form.getFieldValue(name)[field.name]['extrusora']]} keyField="key" textField="key"
                                            optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                        />
                                    </Field>
                                    <Field name={[field.name, `matprima_cod`]} forInput={false} style={{ fontWeight: 700, /* fontSize: "12px" */ alignSelf: "center" }}>
                                        <SelectField size="small" data={matPrimasLookup} keyField="ITMREF_0" textField="ITMDES1_0"
                                            optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                            showSearch
                                            filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        />
                                    </Field>
                                    <FieldItem style={{ textAlign: "right", alignSelf: "center"/* , fontSize: "12px"  */ }}>
                                        <b>{form.getFieldValue(name)[field.name].qty}</b> kg
                                    </FieldItem>

                                    <FieldItem style={{
                                        textAlign: "right", alignSelf: "center", /* fontSize: "12px", */
                                        ...form.getFieldValue(name)[field.name].qty <= form.getFieldValue(name)[field.name].qty_available && { color: "#237804" }
                                    }}>
                                        <b>{form.getFieldValue(name)[field.name].qty_available}</b> kg
                                    </FieldItem>
                                    <FieldItem style={{ alignSelf: "center", /* fontSize: "12px" */ }}>
                                        <Space size={2} wrap={true}>
                                            {form.getFieldValue(name)[field.name]?.lotes && form.getFieldValue(name)[field.name]?.lotes.map((v, idx) => {
                                                return (<Tag style={{ /* fontSize: "11px", */ padding: "2px" }} closable key={`lot-${idx}`} color="orange">{v.lote} <b>{v.qty}</b> {v.unit.toLowerCase()}</Tag>);
                                            })}
                                        </Space>
                                    </FieldItem>
                                    {/* <Field name={[field.name, `lote_cod`]} required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: false }}>
                                                                                                                    <SelectDebounceField
                                                            autoFocus={field.name == 0 ? true : false}
                                                            tabIndex={0}
                                                            defaultActiveFirstOption
                                                            placeholder="Lote"
                                                            size="small"
                                                            keyField="LOT_0"
                                                            textField="LOT_0"
                                                            showSearch
                                                            showArrow
                                                            allowClear
                                                            fetchOptions={(v) => loadLotesLookup(v, form.getFieldValue("formulacao")[field.name]['matprima_cod'])}
                                                        /> 
                                                            <AutoCompleteField
                                                                //autoFocus={field.name == 0 ? true : false}
                                                                tabIndex={0}
                                                                placeholder="Selecione o Lote"
                                                                size="small"
                                                                keyField="LOT_0"
                                                                textField="LOT_0"
                                                                dropdownMatchSelectWidth={250}
                                                                allowClear
                                                                backfill
                                                                optionsRender={lotesRenderer}
                                                                fetchOptions={(v) => loadLotesLookup(v, form.getFieldValue("formulacao")[field.name]['matprima_cod'])}
                                                            />
                                                        </Field> */}
                                </FieldSet>
                                {/*                                                         </FieldSet> */}
                            </React.Fragment>
                        ))}
                    </>
                );
            }}
        </Form.List>
    );
}

const Extrusora = ({ extrusoraRef, form, id, matPrimasLookup }) => {
    const name = `doseadores-${id}`;
    return (
        <Form.List name={name}>
            {(fields, { add, remove, move }) => {
                return (
                    <>
                        {fields.map((field, index) => (
                            <React.Fragment key={field.key}>

                            </React.Fragment>
                        ))}
                    </>
                );
            }}
        </Form.List>
    );
}

const StyleLote = styled.div`
    border: ${props => props.n > 0 ? "solid 1px #1890ff" : "rgba(0, 0, 0, 0.06)"};
    background-color: ${props => props.n > 0 ? "#e6f7ff" : "rgb(250,250,250)"};
    border-radius: 2px;
    margin-right:5px;
    padding:6px;
    position:relative;
    width:135px;
`;


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
        `}
    `
);

const Lote = ({ value }) => {
    return (
        <StyleLote n={parseFloat(value.qty_lote_available).toFixed(2)}>
            <div>{value.n_lote}</div>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <div><span>{parseFloat(value.qty).toFixed(2)}</span> <span>{value.unit}</span></div>
                <div><span style={{ color: parseFloat(value.qty_lote_available).toFixed(2) > 0 ? "green" : "red" }}>{parseFloat(value.qty_lote_available).toFixed(2)}</span> <span>{value.unit}</span></div>
            </div>
        </StyleLote>
    );
}

const Doseador = ({ lotes, name, buffer, lotesAvailability, dosersSets }) => {
    const [artigo, setArtigo] = useState();

    useEffect(() => {
        if (lotes?.length > 0) {
            let ba = buffer.filter(v => v.ITMREF_0 == lotes[0].artigo_cod && v.LOT_0 == lotes[0].n_lote);
            if (ba.length > 0) {
                setArtigo({ des: ba[0].ITMDES1_0, cod: ba[0].ITMREF_0, group: lotes[0].group_id });
            }
        }
    }, [lotes]);

    const getBufferArtigo = (artigo_cod, n_lote) => {
        let ba = buffer.filter(v => v.ITMREF_0 == artigo_cod && v.LOT_0 == n_lote);
        let la = lotesAvailability.filter(v => v.artigo_cod == artigo_cod && v.n_lote == n_lote);
        let lai = {}
        if (la.length > 0) {
            lai = { qty_lote_available: la[0].qty_lote_available, group_id: la[0].group_id };
        }
        if (ba.length > 0) {
            return { qty: ba[0].QTYPCU_0, unit: ba[0].PCUORI_0, des: ba[0].ITMDES1_0, artigo_cod: artigo_cod, n_lote: n_lote, ...lai };
        }
        return {};
    }

    return (
        <>
            <td>
                {name}
            </td>

            {/*         <tr>
            <td rowSpan={1} style={{ width: "40px", border: "0px", textAlign: "center", backgroundColor: COLORS[(!artigo?.group) ? 0 : artigo.group % 10] }}><span style={{ fontWeight: 700, fontSize: "16px" }}>{name}</span></td>
            {artigo && <td style={{ border: "1px solid rgba(0,0,0,.06)", backgroundColor: "#bae7ff" }}>
                <div><span style={{ fontWeight: 700 }}>{artigo.des}</span></div>
                <div><span style={{ fontWeight: 500 }}>{artigo.cod}</span></div>
            </td>
            }
            {!artigo && <td style={{ border: "1px dashed rgba(0,0,0,.06)" }}>
                <div><span style={{ fontWeight: 700 }}></span></div>
                <div><span style={{ fontWeight: 500 }}></span></div>
            </td>
            }
            <td><span style={{ fontWeight: 700 }}>{dosersSets[0][`${name}_S`]}%</span></td>
            <td><span style={{ fontWeight: 700 }}>{dosersSets[0][`${name}_P`]}%</span></td>
            <td><span style={{ fontWeight: 700 }}>{dosersSets[0][`${name}_D`]}g/cm&#xB3;</span></td>
            <td>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    {lotes && lotes.map(v => {
                        return <Lote key={`ld-${name}-${v.n_lote}`} value={getBufferArtigo(v.artigo_cod, v.n_lote)} />
                    })}
                </div>
            </td>
        </tr> */}

        </>




    );
}


const Lotes = ({ index, lotes, lotesAvailability }) => {
    return (
        <td>
            <StyleLote n={0/* parseFloat(value.qty_lote_available).toFixed(2) */}>
                aaaaaa{index}
                {/* <div>{value.n_lote}</div>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <div><span>{parseFloat(value.qty).toFixed(2)}</span> <span>{value.unit}</span></div>
                <div><span style={{ color: parseFloat(value.qty_lote_available).toFixed(2) > 0 ? "green" : "red" }}>{parseFloat(value.qty_lote_available).toFixed(2)}</span> <span>{value.unit}</span></div>
            </div> */}
            </StyleLote>
        </td>
    );
}




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

const SaidaDoser = ({ parameters, wndRef }) => {
    const { title } = parameters;
    const [form] = Form.useForm();
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
        //setModal(prev => ({ ...prev, visible: !prev.visible }))
    }

    const onFinish = (lt) => {
       // setSubmitting(true);

/*         (async () => {
            console.log("SUBMITTING", lt.artigo_cod, lt.n_lote, lt.qty_lote, lt, form.getFieldValue("reminder"));
            const response = await fetchPost({ url: `${API_URL}/saidamp/`, parameters: { lote: lt, reminder: form.getFieldValue("reminder") } });
            if (response.data.status !== "error") {
                onCancel();
            }
            setSubmitting(false);
        })(); */


    }

    return (<div>
        {dosers.length > 0 &&
            <Form form={form}>
                <FormLayout id="f-dosers">
                    <Field name="dosers" label={{ enabled: false, width: "60px", text: "Resto", pos: "left" }}><SelectMultiField allowClear size="small" options={dosers} /></Field>
                </FormLayout>
                {wndRef && <Portal elId={wndRef.current}>
                    <Space>
                        <Button type="primary" onClick={onFinish}>Registar</Button>
                        <Button onClick={onCancel}>Cancelar</Button>
                    </Space>
                </Portal>}
            </Form>
        }
    </div>);
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
                {parameters.type == "saida_mp" && <Suspense fallback={<></>}><SaidaMP parameters={parameters} wndRef={iref} /></Suspense>}
                {parameters.type == "saida_doseador" && <Suspense fallback={<></>}><SaidaDoser parameters={parameters} wndRef={iref} /></Suspense>}
                {parameters.type == "reminder" && <Suspense fallback={<></>}><Reminder parameters={parameters} wndRef={iref} /></Suspense>}
            </YScroll>
        </ResponsiveModal>
    );
}


const StyleTable = styled.table`
    width:100%;
    border-collapse: separate;
    /*border-spacing: 0px 20px;*/

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
`;

const Group = ({ children }) => {
    return (
        <>
            <tr>
                {children}
            </tr>
        </>
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
        <tr>
            <th colSpan={20} style={{ fontSize: "14px" }}>
                <div>{designacao}</div>
            </th>
        </tr>
    );
}

const Artigo = ({ artigo_cod, lotes, children }) => {
    return (
        <>
            <td>
                {/* <div>{artigo_cod}</div> */}
                {lotes && lotes.map(v => {
                    return (<div style={{ borderBottom: "dashed 1px #d9d9d9" }} key={v.n_lote}>
                        <div>{v.n_lote}</div>
                        {v.n_lote && <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{parseFloat(v.qty_lote).toFixed(2)}kg</div><div>{parseFloat(v.qty_lote_available).toFixed(2)}kg</div></div>}
                    </div>);
                })}
            </td>
        </>
    );
}

const DOSERS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6']
const Dosers = ({ group_id, dosers, lotes, dosersSets }) => {
    //const [dosersList, setDosersList] = useState([]);
    const [qty, setQty] = useState();
    useEffect(() => {
        console.log("-------------------------------------", lotes)
        if (lotes) {
            setQty(lotes.map(item => item.qty_lote_available).reduce((prev, next) => prev + next));
        }
        else {
            setQty(0);
        }
    }, [lotes]);
    // useEffect(() => {
    //     const notUsed = []
    //     for (let dos of DOSERS) {
    //         if (dosersSets[0][`${dos}_S`] === 0) {
    //             notUsed.push(dos);
    //         }
    //     }
    //     let d = [...new Set(JSON.parse(dosers.dosers))].filter((el) => !notUsed.includes(el));
    //     setDosersList(d);
    //     setQty(JSON.parse(dosers.lotes).map(item => item.qty_lote_available).reduce((prev, next) => prev + next));
    // }, [dosers.dosers]);
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




                        {/*                         <div style={{ ...((dosersList.length > i) ? { width: "130px", border: 'solid 1px red', padding: '2px' } : {}) }}>

                        </div> */}
                    </td>
                </React.Fragment>
            )}

        </>
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
                        const pickData = v.split(';');
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
                            }

                        }
                        setDosers(_dosers);
                        inputRef.current.value = '';
                        console.log("PICKED", lotes, _dosers)
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
                        {console.log("lotesssssss", lotes)}
                        <FieldSet wide={16} margin={false} field={{ wide: [3, 3, 6, 1, 1, 1, 1] }}>
                            <Field forInput={false} name="source" label={{ enabled: false }} style={{ textAlign: "center" }}>
                                <Input size="small" />
                                {/* <MenuExtrusoras setExtrusora={setExtrusora} extrusora={extrusora} setFocus={() => setInputFocus(inputRef)} /> */}
                            </Field>
                            <FieldItem label={{ enabled: false }}><input className="ant-input" style={{ padding: "2px 7px" }} ref={inputRef} onKeyDown={onPick} autoFocus /></FieldItem>
                            <FieldItem label={{ enabled: false }}></FieldItem>
                            <FieldItem style={{ minWidth: "80px", maxWidth: "80px" }} label={{ enabled: false }}><ConfirmButton disabled={!touched} onClick={onFinish}>Confirmar</ConfirmButton></FieldItem>
                            <FieldItem style={{ minWidth: "80px", maxWidth: "80px" }} label={{ enabled: false }}><Button disabled={!touched} onClick={onFinish}>Cancelar</Button></FieldItem>
                            <FieldItem style={{ minWidth: "125px", maxWidth: "125px" }} label={{ enabled: false }}><Button disabled={Object.keys(dosers).length === 0} type='primary' onClick={() => onModalParameters({ type: "saida_doseador" })}>Saída de Doseador</Button></FieldItem>
                            <FieldItem style={{ minWidth: "125px", maxWidth: "125px" }} label={{ enabled: false }}><Button disabled={Object.keys(lotes).length === 0} type='primary' onClick={() => onModalParameters({ type: "saida_mp" })}>Saída de MP</Button></FieldItem>
                        </FieldSet>

                        <YScroll>
                            <StyleTable cellPadding={2} cellSpacing={0}>
                                <tbody>
                                    {(groups && dosersSets) && groups.map((v, i) => {
                                        return (
                                            <React.Fragment key={`grp-${v.group_id}`}>
                                                <ArtigoDesignacao artigo_cod={v.artigo_cod} buffer={buffer} />
                                                <Group>
                                                    <Artigo artigo_cod={v.artigo_cod} lotes={lotes[v.group_id]?.lotes}></Artigo>
                                                    <Dosers group_id={v.group_id} dosers={dosers[v.group_id]?.dosers} lotes={lotes[v.group_id]?.lotes} dosersSets={dosersSets} />
                                                    <td></td>
                                                </Group>

                                            </React.Fragment>
                                        );
                                    })}

                                </tbody>
                            </StyleTable>
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