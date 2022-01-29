import React, { useEffect, useState, useCallback, useRef, useMemo, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { groupBy } from "utils";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace, InputAddon, SelectDebounceField, AutoCompleteField } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import ResultMessage from 'components/resultMessage';
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, DatePicker, Select, Spin, Switch, Tag } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT, FORMULACAO_MANGUEIRAS, SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';

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
                <FieldSet wide={16} layout="horizontal" margin={false} field={{ wide: [6, 1, 5, 1], label: { enabled: false } }}>
                    <FieldItem><div style={{ fontWeight: 700, fontSize: "14px" }}>Extrusora {value}</div></FieldItem>
                    <FieldItem><div style={{ textAlign: "center" }}>Qtd. Requerida</div></FieldItem>
                    <FieldItem><div style={{ textAlign: "center" }}>Lotes</div></FieldItem>
                    <FieldItem><div style={{ textAlign: "center" }}>Qtd. Disponível</div></FieldItem>
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
            <StyledButtonMenu size='large' onClick={() => onSelect('A')} first={true} type={type(['A'])}>Extrusora A</StyledButtonMenu>
            <StyledButtonMenu size='large' onClick={() => onSelect('BC')} type={type(['B', 'BC'])}>Extrusora B</StyledButtonMenu>
            <StyledButtonMenu size='large' onClick={() => onSelect('C')} type={type(['C', 'BC'])}>Extrusora C</StyledButtonMenu>
        </>
    );
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [changedValues, setChangedValues] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [operation, setOperation] = useState(setId(record.artigospecs_id));
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    const [matPrimasLookup, setMatPrimasLookup] = useState([]);
    const extrusoraRef = useRef();
    const [inputRef, setInputFocus] = useFocus();
    const [extrusora, setExtrusora] = useState('A');
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/lotespick`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        /*         onMessage: (v) => {
                    if (lastJsonMessage) {
                        console.log(v,lastJsonMessage);
                    }
                }, */
        queryParams: { 'token': '123456' },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000
    });

    const init = ({ lookup = false, token }) => {
        (async () => {
            if (lookup) {
                setMatPrimasLookup(await loadMateriasPrimasLookup({ token }));
            }

            //Load das Matérias Primas em Buffer via Socket
            const matPrimas = record.formulacao.items.map(({ matprima_cod }) => `'${matprima_cod}'`).join(',');
            sendJsonMessage({ cmd: 'loadmatprimas', value: matPrimas, cs: record.id });

            console.log("$$#$#$#$#$--", record.nonwovens)
            console.log("$$#$#$#$#$--", record.quantity)
            console.log("$$#$#$#$#$--", record.produto)
            console.log("$$#$#$#$#$--", record.formulacao)

            const gsmNwSup = record.nonwovens.nw_des_sup.split(new RegExp('gsm', 'i'))[0].trim().split(' ').pop();
            const gsmNwInf = record.nonwovens.nw_des_inf.split(new RegExp('gsm', 'i'))[0].trim().split(' ').pop();

            const filmeSqm = Number(record.quantity.square_meters) * (Number(gsmNwSup) + Number(gsmNwInf)) / Number(record.produto.gsm);



            record.formulacao.items.forEach(v => {
                if (!('qty_available' in v)) v.qty_available = 0;
                if (!('lotes' in v)) v.lotes = [];
                if (!('qty' in v)) v.qty = Math.round((filmeSqm * (Number(v.vglobal) / 100)) * 0.1, 2);

                console.log(v.vglobal, "-------", (filmeSqm * (Number(v.vglobal) / 100)))

            });
            console.log("$$#$#$#$#$--", Number(record.quantity.square_meters));


            form.setFieldsValue({ formulacao: record.formulacao.items /* groupBy(record.formulacao.items, 'extrusora') */ });
            setLoading(false);
        })();
    }

    useEffect(() => {
        const cancelFetch = cancelToken();
        init({ lookup: true, token: cancelFetch });
        return (() => cancelFetch.cancel("Form Lotes Cancelled"));
    }, []);

    const onValuesChange = (changedValues) => {
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

    const ItemLabelRenderer = ({ d }) => {
        return (
            <div>
                <div>{d["LOT_0"]}</div>
                <Space><div>{d["QTYPCU_0"]}{d["PCUORI_0"]}</div></Space>
            </div>
        );
    }

    const lotesRenderer = (d) => {
        return { label: <ItemLabelRenderer d={d} />, key: d["LOT_0"], value: d["LOT_0"] };
    }

    useEffect(() => {
        if (lastJsonMessage && lastJsonMessage.length > 0) {
            const fv = form.getFieldValue("formulacao");
            const idx = fv.findIndex(v => v.extrusora === extrusora && v.matprima_cod === lastJsonMessage[0].ITMREF_0);
            if (idx >= 0) {
                if (fv[idx].lotes.findIndex(v => v.lote === lastJsonMessage[0].LOT_0) === -1) {
                    fv[idx].lotes = [...fv[idx].lotes, { lote: lastJsonMessage[0].LOT_0, qty: Math.round(lastJsonMessage[0].QTYPCU_0, 2), unit: lastJsonMessage[0].PCUORI_0 }];
                    //fv[idx].qty_available = fv[idx].lotes.reduce((basket, itm) => (itm.qty + basket));
                    fv[idx].lotes.forEach(e => { fv[idx].qty_available += e.qty; });
                    form.setFieldsValue(fv);
                }
            }
            /* const fv = form.getFieldsValue(true);
            const lotes = !("lotes" in fv) ? [] : fv.lotes;
            lotes.push({ lote_cod: lastJsonMessage[0].LOT_0 });
            fv.lotes = lotes; 
            form.setFieldsValue(fv);
            */

        }
        inputRef.current.value = '';

    }, [lastJsonMessage]);

    const onManualPick = (v) => {
        sendJsonMessage({ cmd: 'pick', value: v.key, cs: record.id });
    }

    const onPick = (e, a, b) => {
        if (e.keyCode == 9 || e.keyCode == 13) {
            if (inputRef.current.value !== '') {
                e.preventDefault();
                sendJsonMessage({ cmd: 'pick', value: inputRef.current.value, cs: record.id });
                //setInputFocus();
            }
            //console.log("----",inputRef.current.state.value,'----',fv);
        } else {
            console.log("xxxx->", e)
        }
    }

    return (
        <>
            <ResultMessage
                result={resultMessage}
                successButtonOK={operation.key === "insert" && <Button type="primary" key="goto-of" onClick={onSuccessOK}>Lotes de Matérias Primas</Button>}
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
                        style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
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

                        <FieldSet wide={16} field={{ wide: [4] }} margin={false}>
                            <FieldItem label={{ enabled: false }}>
                                <MenuExtrusoras setExtrusora={setExtrusora} extrusora={extrusora} setFocus={() => setInputFocus(inputRef)} />
                            </FieldItem>
                        </FieldSet>
                        <FieldSet wide={16} margin={false} field={{ wide: [4, 4] }}>
                            <FieldItem label={{ enabled: false }}><input className="ant-input ant-input-lg" ref={inputRef} onKeyDown={onPick} autoFocus /></FieldItem>
                            <Field required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: false }}>
                                <SelectDebounceField
                                    defaultActiveFirstOption
                                    placeholder="Lote Picagem Manual"
                                    size="large"
                                    keyField="LOT_0"
                                    textField="LOT_0"
                                    showSearch
                                    showArrow
                                    allowClear
                                    onSelect={onManualPick}
                                    fetchOptions={(v) => loadLotesLookup(v)}
                                />
                            </Field>
                        </FieldSet>


                        <Form.List name="formulacao">
                            {(fields, { add, remove, move }) => {
                                return (
                                    <>
                                        {fields.map((field, index) => (
                                            <React.Fragment key={field.key}>
                                                <TitleExtrusora extrusoraRef={extrusoraRef} value={form.getFieldValue("formulacao")[field.name]['extrusora']} />
                                                <FieldSet wide={16} layout="horizontal" margin={false} field={{ label: { enabled: false } }} style={{ ...(index % 2 == 0 && { backgroundColor: "#f5f5f5" }) }}>
                                                    <FieldSet wide={16} margin={false}
                                                        field={{
                                                            style: { alignSelf: "center" },
                                                            wide: [1, 4, 1, 5, 1],
                                                            /* style: { border: "solid 1px #fff", borderLeft: "none", fontWeight: "10px" } */
                                                        }}
                                                    >
                                                        <Field name={[field.name, `mangueira`]} style={{ fontSize: "14px", backgroundColor: "#fff", alignSelf: "center" }}>
                                                            <SelectField tabIndex={1000} size="large" data={FORMULACAO_MANGUEIRAS[form.getFieldValue("formulacao")[field.name]['extrusora']]} keyField="key" textField="key"
                                                                optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                                            />
                                                        </Field>
                                                        <Field name={[field.name, `matprima_cod`]} forInput={false} style={{ fontWeight: 700, fontSize: "14px", alignSelf: "center" }}>
                                                            <SelectField size="large" data={matPrimasLookup} keyField="ITMREF_0" textField="ITMDES1_0"
                                                                optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                                                showSearch
                                                                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                            />
                                                        </Field>
                                                        <FieldItem style={{ textAlign: "right", alignSelf: "center", fontSize: "14px" }}>
                                                            <b>{form.getFieldValue("formulacao")[field.name].qty}</b> kg
                                                        </FieldItem>
                                                        <FieldItem style={{ alignSelf: "center", fontSize: "14px" }}>
                                                            <Space size={2} wrap={true}>
                                                                {form.getFieldValue("formulacao")[field.name]?.lotes && form.getFieldValue("formulacao")[field.name]?.lotes.map((v, idx) => {
                                                                    return (<Tag style={{ fontSize: "14px", padding:"5px" }} closable key={`lot-${idx}`} color="orange">{v.lote} <b>{v.qty}</b> {v.unit.toLowerCase()}</Tag>);
                                                                })}
                                                            </Space>
                                                        </FieldItem>
                                                        <FieldItem style={{
                                                            textAlign: "right", alignSelf: "center", fontSize: "14px",
                                                            ...form.getFieldValue("formulacao")[field.name].qty <= form.getFieldValue("formulacao")[field.name].qty_available && { color: "#237804" }
                                                        }}>
                                                            <b>{form.getFieldValue("formulacao")[field.name].qty_available}</b> kg
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
                                                </FieldSet>
                                            </React.Fragment>
                                        ))}
                                    </>
                                );
                            }}
                        </Form.List>




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