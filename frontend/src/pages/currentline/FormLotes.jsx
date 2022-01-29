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
import { Input, Space, Form, Button, InputNumber, DatePicker, Select, Spin, Switch } from "antd";
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
                <FieldSet wide={16} layout="horizontal" margin={false} field={{ wide: [16], label: { enabled: false } }}>
                    <FieldItem><div style={{ fontWeight: 700, fontSize: "14px" }}>Extrusora {value}</div></FieldItem>
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


            record.formulacao.items.forEach(v => { if (!('lotes' in v)) v.lotes = [] });
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
                fv[idx].lotes = [...fv[idx].lotes, { lote: lastJsonMessage[0].LOT_0, qty: Math.round(lastJsonMessage[0].QTYPCU_0, 2), unit: lastJsonMessage[0].PCUORI_0 }];
                console.log('--------', { extrusora, matprima_cod: fv[idx].matprima_cod, matprima_des: fv[idx].matprima_des }, fv[idx].lotes);
                form.setFieldsValue(fv);
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
                        <FieldSet wide={16} margin={false}>
                            <FieldItem label={{ enabled: false }}><input className="ant-input" ref={inputRef} onKeyDown={onPick} autoFocus /></FieldItem>
                        </FieldSet>




                        <Form.List name="lotes">
                            {(fields, { add, remove, move }) => {
                                return (
                                    <>
                                        {fields.map((field, index) => (
                                            <React.Fragment key={field.key}>
                                                <FieldSet wide={16} layout="horizontal" margin={false} field={{ label: { enabled: false } }}>
                                                    <FieldSet wide={16} margin={false}
                                                        field={{
                                                            wide: [2, 6, 4],
                                                            style: { border: "solid 1px #fff", borderLeft: "none", fontWeight: "10px" }
                                                        }}
                                                    >
                                                        <Field name={[field.name, `lote_cod`]} required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: false }}>
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
                                                        </Field>
                                                    </FieldSet>
                                                </FieldSet>
                                            </React.Fragment>
                                        ))}
                                    </>
                                );
                            }}
                        </Form.List>



                        <Form.List name="formulacao">
                            {(fields, { add, remove, move }) => {
                                return (
                                    <>
                                        {fields.map((field, index) => (
                                            <React.Fragment key={field.key}>
                                                <TitleExtrusora extrusoraRef={extrusoraRef} value={form.getFieldValue("formulacao")[field.name]['extrusora']} />
                                                <FieldSet wide={16} layout="horizontal" margin={false} field={{ label: { enabled: false } }}>
                                                    <FieldSet wide={16} margin={false}
                                                        field={{
                                                            wide: [1, 3, 4],
                                                            style: { border: "solid 1px #fff", borderLeft: "none", fontWeight: "10px" }
                                                        }}
                                                    >
                                                        <Field name={[field.name, `mangueira`]}>
                                                            <SelectField tabIndex={1000} size="small" data={FORMULACAO_MANGUEIRAS[form.getFieldValue("formulacao")[field.name]['extrusora']]} keyField="key" textField="key"
                                                                optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                                            />
                                                        </Field>
                                                        <Field name={[field.name, `matprima_cod`]} forInput={false}>
                                                            <SelectField size="small" data={matPrimasLookup} keyField="ITMREF_0" textField="ITMDES1_0"
                                                                optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                                                showSearch
                                                                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                            />
                                                        </Field>
                                                        <FieldItem>
                                                            <Space >
                                                                {form.getFieldValue("formulacao")[field.name]?.lotes && form.getFieldValue("formulacao")[field.name]?.lotes.map((v, idx) => {
                                                                    return (<div key={`lot-${idx}`} >{v.lote} {v.qty}{v.unit}</div>);
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