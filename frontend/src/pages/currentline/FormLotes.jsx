import React, { useEffect, useState, useCallback, useRef, useMemo, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { groupBy } from "utils";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace, InputAddon, SelectDebounceField, AutoCompleteField } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import ResultMessage from 'components/resultMessage';
import YScroll from "components/YScroll";
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, DatePicker, Select, Spin, Switch, Tag } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT, FORMULACAO_MANGUEIRAS, SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import { SocketContext } from '../App';

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
    width:180px;
`;

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

const Doseador = ({ lotes, name, buffer, lotesAvailability }) => {
    const [artigo, setArtigo] = useState();

    useEffect(() => {
        if (lotes?.length > 0) {
            let ba = buffer.filter(v => v.ITMREF_0 == lotes[0].artigo_cod && v.LOT_0 == lotes[0].n_lote);
            if (ba.length > 0) {
                setArtigo({ des: ba[0].ITMDES1_0, cod: ba[0].ITMREF_0 });
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
        <tr>
            <td rowSpan={1} style={{ border: "0px" }}><span style={{ fontWeight: 700, fontSize: "16px" }}>{name}</span></td>
            {artigo && <td style={{ border: "1px solid rgba(0,0,0,.06)", backgroundColor: "#fafafa" }}>
                <div><span style={{ fontWeight: 700 }}>{artigo.des}</span></div>
                <div><span style={{ fontWeight: 500 }}>{artigo.cod}</span></div>
            </td>
            }
            {!artigo && <td style={{ border: "1px dashed rgba(0,0,0,.06)" }}>
                <div><span style={{ fontWeight: 700 }}></span></div>
                <div><span style={{ fontWeight: 500 }}></span></div>
            </td>
            }
            <td>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    {lotes && lotes.map(v => {
                        return <Lote key={`ld-${name}-${v.n_lote}`} value={getBufferArtigo(v.artigo_cod, v.n_lote)} />
                    })}
                </div>
            </td>
        </tr>



    );
}


export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [changedValues, setChangedValues] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    const [matPrimasLookup, setMatPrimasLookup] = useState([]);
    const extrusoraRef = useRef();
    const [inputRef, setInputFocus] = useFocus();
    const [extrusora, setExtrusora] = useState('A');
    const [buffer, setBuffer] = useState(null);
    const [settings, setSettings] = useState(null);
    const [lotesDosers, setLotesDosers] = useState(null);
    const [dosersSets, setDosersSets] = useState(null);
    const [lotesAvailability, setLotesAvailability] = useState(null);
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
            setMatPrimasLookup(await loadMateriasPrimasLookup({ token: cancelFetch }));
            (setFormTitle) && setFormTitle({ title: `Lotes de Matéria Prima` });
            setLoading(false);
        })();
        return (() => cancelFetch.cancel("Form Lotes Cancelled"));
    }, []);

    useEffect(() => {
        console.log("MATERIAS PRIMAS---", matPrimasLookup)
    }, [matPrimasLookup]);

    useEffect(() => {
        (async () => {
            sendJsonMessage({ cmd: 'loadbuffer', value: {} });
        })();
    }, [dataSocket?.buffer]);

    useEffect(() => {
        (async () => {
            sendJsonMessage({ cmd: 'loadlotesavailability', value: {} });
        })();
    }, [dataSocket?.availability]);

    useEffect(() => {
        (async () => {
            console.log("################entreii")
            sendJsonMessage({ cmd: 'loaddoserssets', value: {} });
        })();
    }, [dataSocket?.doserssets]);

    // useEffect(() => {
    //     (async () => {
    //         sendJsonMessage({ cmd: 'loadinproduction', value: {} });
    //     })();
    // }, [dataSocket?.inproduction]);

    useEffect(() => {
        (async () => {
            sendJsonMessage({ cmd: 'loadlotesdosers', value: {} });
        })();
    }, [dataSocket?.dosers]);

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
            } else if (lastJsonMessage.item === "lotesavailability") {
                console.log("------>LOTESAVAILABILITY<-----", lastJsonMessage.rows)
                setLotesAvailability([...lastJsonMessage.rows]);
            } else if (lastJsonMessage.item === "doserssets") {
                console.log("------>DOSERS SETS<-----", lastJsonMessage.rows)
                setDosersSets({...lastJsonMessage.rows});
            }
        }
    }, [lastJsonMessage]);

    useEffect(() => {

        console.log("aaaaaa lotes dosers", lotesDosers);

    }, [lotesDosers]);

    const onValuesChange = (changedValues) => {
        console.log("CHANGEDDDDD--", changedValues, " EXTRUSORA SELECIONADA--", extrusora);
        setChangedValues(changedValues);
    }

    const onFinish = async (values) => {
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
                e.preventDefault();
                const v = inputRef.current.value.toUpperCase();
                if (v === 'A1' | v === 'A2' | v === 'A3' | v === 'A4' | v === 'A5' | v === 'A6' | v === 'B1' | v === 'B2' | v === 'B3' | v === 'B4' | v === 'B5' | v === 'B6' | v === 'C1' | v === 'C2' | v === 'C3' | v === 'C4' | v === 'C5' | v === 'C6') {
                    //Source / Type
                    form.setFieldsValue({ source: v });
                    inputRef.current.value = '';
                } else {
                    let fData = form.getFieldsValue(true);
                    if (fData.source) {
                        let ba = buffer.filter(v => v.ITMREF_0 == artigo_cod && v.LOT_0 == n_lote);
                        console.log("PICKED", ba)
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

                        <FieldSet wide={16} margin={false} field={{ wide: [4, 6, 6] }}>
                            <Field forInput={false} name="source" label={{ enabled: false }} style={{ textAlign: "center" }}>
                                <Input size="small" />
                                {/* <MenuExtrusoras setExtrusora={setExtrusora} extrusora={extrusora} setFocus={() => setInputFocus(inputRef)} /> */}
                            </Field>
                            <FieldItem label={{ enabled: false }}><input className="ant-input" style={{ padding: "2px 7px" }} ref={inputRef} onKeyDown={onPick} autoFocus /></FieldItem>
                        </FieldSet>

                        <YScroll>
                            <table cellPadding={2} cellSpacing={1} style={{ borderCollapse: "separate" }}>
                                <tbody>
                                    {lotesDosers && lotesDosers.map(v => {

                                        return <Doseador key={`d-${v.doser}`} lotes={JSON.parse(v.lotes)} name={v.doser} buffer={buffer} lotesAvailability={lotesAvailability} />

                                    })}
                                    {/* <FieldSet layout="horizontal" margin={false}>
                                <FieldSet layout="vertical" split={2} margin={false}>
                                    <Extrusora id='A' form={form} extrusoraRef={extrusoraRef} matPrimasLookup={matPrimasLookup} />
                                </FieldSet>
                                <FieldSet layout="vertical" split={2} margin={false}>
                                    <Extrusora id='B' form={form} extrusoraRef={extrusoraRef} matPrimasLookup={matPrimasLookup} />
                                    <Extrusora id='C' form={form} extrusoraRef={extrusoraRef} matPrimasLookup={matPrimasLookup} />
                                </FieldSet>
                            </FieldSet> */}
                                </tbody>
                            </table>
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