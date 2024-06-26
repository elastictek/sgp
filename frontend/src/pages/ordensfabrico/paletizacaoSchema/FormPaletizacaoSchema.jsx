import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import IconButton from "components/iconButton";
import ResultMessage from 'components/resultMessage';
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { CgArrowDownO, CgArrowUpO, CgCloseO } from 'react-icons/cg';
import { DATE_FORMAT, DATETIME_FORMAT, PALETIZACAO_ITEMS, PALETE_SIZES, CONTENTORES_OPTIONS, CINTASPALETES_OPTIONS } from 'config';
import SvgSchema from './SvgSchema';
import { usePermission } from "utils/usePermission";

const schema = (keys, excludeKeys) => {
    return getSchema({
        npaletes: Joi.number().positive().label("Paletes/Contentor").required(),
        palete_maxaltura: Joi.number().positive().precision(2).label("Altura Máx. Palete (metros)").required(),
        //designacao: Joi.string().label("Designação").required(),
        netiquetas_bobine: Joi.number().positive().precision(2).label("Etiqueta/Bobine").required(),
        netiquetas_lote: Joi.number().positive().precision(2).label("Etiqueta do Lote da Palete").required(),
        netiquetas_final: Joi.number().positive().precision(2).label("Etiqueta Final da Palete").required(),
        folha_identificativa: Joi.number().min(0).precision(2).label("Folha Identificativa Palete").default(1),
        cintas: Joi.number().valid(0, 1),
        ncintas: Joi.when('cintas', { is: 1, then: Joi.number().positive().required() }),
        paletizacao: Joi.array().min(1).label("Items da Paletização").required()
    }, keys, excludeKeys).unknown(true);
}

const SubFormPalete = ({ form, field, remove, move, index, length, forInput }) => {
    const [item, setItem] = useState(1);
    useEffect(() => {
        setItem(form.getFieldValue(["paletizacao", field.name, "item_id"]));
    }, []);
    const onSelect = (f) => {
        setItem(form.getFieldValue(["paletizacao", f, "item_id"]));
    }
    return (
        <FieldSet layout="horizontal" field={{ wide: [1, 1, 8, 5, 1] }}>
            <FieldItem label={{ enabled: false }}>{forInput && index > 0 && <IconButton onClick={() => move(index, index - 1)} style={{ alignSelf: "center" }}><CgArrowUpO /></IconButton>}</FieldItem>
            <FieldItem label={{ enabled: false }}>{forInput && index < (length - 1) && <IconButton onClick={() => move(index, index + 1)} style={{ alignSelf: "center" }}><CgArrowDownO /></IconButton>}</FieldItem>
            <Field label={{ enabled: false }} name={[field.name, "item_id"]}>
                <SelectField onChange={() => onSelect(field.name)} size="small" data={PALETIZACAO_ITEMS} keyField="key" textField="value" />
            </Field>
            {item === 1 && <Field label={{ enabled: false }} name={[field.name, "item_paletesize"]}>
                <SelectField size="small" data={PALETE_SIZES} keyField="key" textField="value" />
            </Field>
            }
            {item === 2 && <Field label={{ enabled: false }} name={[field.name, "item_numbobines"]}>
                <InputNumber size="small" min={1} max={80} />
            </Field>
            }
            {(item > 2 || item === undefined) && <FieldItem label={{ enabled: false }} />}
            <FieldItem label={{ enabled: false }}>{forInput && <IconButton onClick={() => remove(field.name)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton>}</FieldItem>
        </FieldSet>

    );
}

const setId = (id) => {
    if (id) {
        return { key: "update", values: { id } };
    }
    return { key: "insert", values: {} };
}

const loadPaletizacoesLookup = async ({ artigo_cod, cliente_cod, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/paletizacoeslookup/`, filter: { artigo_cod, cliente_cod }, sort: [{ column: 'contentor_id' }, { column: 'designacao' }], signal });
    return rows;
}
const getPaletizacaoDetails = async ({ paletizacao_id, signal }) => {
    if (!paletizacao_id) {
        return [];
    }
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/paletizacaodetailsget/`, filter: { paletizacao_id }, sort: [{ column: 'item_order', direction: 'DESC' }], signal });
    return rows;
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form" }) => {
    const [form] = Form.useForm();
    const [forInput, setForInput] = useState(false);
    const [isTouched, setIsTouched] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [changedValues, setChangedValues] = useState({});
    const [paletizacoes, setPaletizacoes] = useState([]);
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [operation, setOperation] = useState(setId(record.paletizacao_id));
    const [resultMessage, setResultMessage] = useState({ status: "none" });

    const init = ({ signal }) => {
        (async () => {
            (setFormTitle) && setFormTitle({ title: `Esquema de Paletização ${record.aggItem.cliente_nome}`, subTitle: `${record.aggItem.item_cod}` });
            const _paletizacoes = await loadPaletizacoesLookup({ artigo_cod: record.aggItem.item_cod, cliente_cod: record.aggItem.cliente_cod, signal });
            setPaletizacoes(_paletizacoes);
            const { items, ...r } = record;
            form.setFieldsValue({ paletizacao_id: r.paletizacao.id, ...r.paletizacao, paletizacao: items });
            setLoading(false);
        })();
    }

    useEffect(() => {
        const controller = new AbortController();
        init({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onValuesChange = async (changedValues, allValues) => {
        setIsTouched(true);
        if ('paletizacao_id' in changedValues && changedValues.paletizacao_id) {
            const [paletizacao] = paletizacoes.filter(v => v.id === changedValues.paletizacao_id);
            const paletizacaoDetails = await getPaletizacaoDetails({ paletizacao_id: changedValues.paletizacao_id });
            form.setFieldsValue({ ...paletizacao, paletizacao_id: changedValues.paletizacao_id, paletizacao: [...paletizacaoDetails] });
        }
        setChangedValues(changedValues);
    }

    const onFinish = async (values) => {
        const status = { error: [], warning: [], info: [], success: [] };
        const msgKeys = ["paletizacao"];
        const v = schema().validate(values, { abortEarly: false });
        status.error = [...status.error, ...(v.error ? v.error?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        if (!v.error && status.error.length === 0) {
            const { of_id, of_cod, draft_of_id, agg_of_id } = record.aggItem;
            const {paletizacao, ...vals} = values;
            console.log(record);
            const dt = { of_id, of_cod, draft_of_id, paletizacao: { id: values.paletizacao_id, ...vals, details:paletizacao.reverse() } };
            const response = await fetchPost({ url: `${API_URL}/updatecurrentsettings/`, filter: { csid: record.csid }, parameters: { type: 'paletizacao', paletizacao: dt, artigo:record.aggItem } });
            if (response.data.status !== "error") {
                parentReload({ aggId: agg_of_id });
            }
            setResultMessage(response.data);
        }
        setSubmitting(false);
        setFormStatus(status);
    }

    const onSuccessOK = () => {
        setSubmitting(false);
        setResultMessage({ status: "none" });
    }

    const onErrorOK = () => {
        setSubmitting(false);
        setResultMessage({ status: "none" });
    }

    const onClose = (reload = false) => {
        closeParent();
    }

    const onSubmit = useCallback(async () => {
        setSubmitting(true);
        form.submit();
    }, []);

    return (
        <>
            <ResultMessage
                result={resultMessage}
                successButtonOK={operation.key === "insert" && <Button type="primary" key="goto-of" onClick={onSuccessOK}>Ok</Button>}
                successButtonClose={<Button key="goto-close" onClick={() => onClose(true)}>Fechar</Button>}
                errorButtonOK={<Button type="primary" key="goto-ok" onClick={onErrorOK}>OK</Button>}
                errorButtonClose={<Button key="goto-close" onClick={onClose}>Fechar</Button>}
            >
                <AlertsContainer id="el-external" />
                <AlertMessages formStatus={formStatus} />
                <Form form={form} name={`fps`} onFinish={onFinish} onValuesChange={onValuesChange} component={wrapForm}>
                    <FormLayout
                        id="LAY-PALETIZACAO_SCHEMA"
                        guides={guides}
                        layout="vertical"
                        style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                        schema={schema}
                        field={{
                            forInput,
                            wide: [16],
                            margin: "2px", overflow: false, guides: guides,
                            label: { enabled: true, pos: "top", align: "start", vAlign: "center", /* width: "80px", */ wrap: false, overflow: false, colon: true, ellipsis: true },
                            alert: { pos: "right", tooltip: true, container: false /* container: "el-external" */ },
                            layout: { top: "", right: "", center: "", bottom: "", left: "" },
                            required: true,
                            style: { alignSelf: "top" }
                        }}
                        fieldSet={{
                            guides: guides,
                            wide: 16, margin: "2px", layout: "horizontal", overflow: false
                        }}
                    >

                        <FieldSet>
                            <Toolbar
                                style={{ width: "100%" }}
                                left={
                                    <FieldSet>
                                        <Field required={false} name="paletizacao_id" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Paletização", pos: "left" }} >
                                            <SelectField size="small" data={paletizacoes} keyField="id" textField="designacao"
                                                optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ width: "70px" }}><b>{d["contentor_id"]}</b></div><div style={{ flex: 1 }}>{d[textField]}</div><div style={{ width: "20px" }}>v.{d["versao"]}</div></div>, value: d[keyField] })}
                                            />
                                        </Field>
                                    </FieldSet>
                                }
                                right={<Button size="small" onClick={() => setForInput(!forInput)}>{forInput ? "Apenas Leitura" : "Alterar"}</Button>}
                            />
                        </FieldSet>


                        <FieldSet margin={false} field={{ wide: [4, 4] }}>
                            <Field name="contentor_id" label={{ enabled: true, text: "Contentor" }}>
                                <SelectField size="small" data={CONTENTORES_OPTIONS} keyField="value" textField="label"
                                    optionsRender={(d, keyField, textField) => ({ label: d[keyField], value: d[keyField] })}
                                />
                            </Field>
                            <Field name="designacao" label={{ enabled: true, text: "Designação" }}><Input size="small" /></Field>
                        </FieldSet>
                        <HorizontalRule margin="12px" />

                        <FieldSet margin={false} field={{ wide: 16 }}>
                            <FieldSet margin={false} split={3} field={{ alert: { tooltip: true }, layout: { center: "min-width: 70px; max-width: 70px; align-self:center;" }, label: { pos: "right", width: "100%" } }} layout="vertical">
                                <Field label={{ text: "Paletes/Contentor" }} name="npaletes"><InputNumber size="small" min={1} max={150} /></Field>
                                <Field label={{ text: "Altura Máx. Palete (metros)" }} name="palete_maxaltura"><InputNumber size="small" min={1} max={150} /></Field>
                                <Field required={false} name="paletes_sobrepostas" label={{ enabled: true, text: "Paletes Sobrepostas" }}><CheckboxField disabled={true} /></Field>
                            </FieldSet>
                            <FieldSet margin={false} split={3} field={{ layout: { center: "min-width: 70px;max-width: 70px; align-self:center;" }, label: { pos: "right", width: "100%" } }} layout="vertical">
                                <Field name="netiquetas_bobine" label={{ enabled: true, text: "Etiqueta/Bobine" }}><InputNumber size="small" min={1} max={10} /></Field>
                                <Field name="netiquetas_lote" label={{ enabled: true, text: "Etiqueta do Lote da Palete" }}><InputNumber size="small" min={1} max={10} /></Field>
                                <Field name="netiquetas_final" label={{ enabled: true, text: "Etiqueta Final da Palete" }}><InputNumber size="small" min={1} max={10} /></Field>
                            </FieldSet>
                            <FieldSet margin={false} split={3} field={{ layout: { center: "min-width: 20px;max-width: 20px; align-self:center;" }, label: { pos: "right", width: "100%" } }} layout="vertical">
                                <Field required={false} name="filmeestiravel_bobines" label={{ enabled: true, text: "Filme Estirável/Palete" }}><CheckboxField /></Field>
                                <Field required={false} name="filmeestiravel_exterior" label={{ enabled: true, text: "Filme Estirável Exterior" }}><CheckboxField /></Field>
                            </FieldSet>
                        </FieldSet>

                        <FieldSet wide={16} margin={false} field={{ wide: [2, 2, 3, 5, '*'], style: { alignSelf: "center" } }}>
                            <Field name="cintas" style={{ minWidth: "20px", alignSelf: "center" }} label={{ enabled: false }}><CheckboxField /></Field>
                            <FieldItem label={{ enabled: false }}>
                                <Item shouldUpdate={(prevValues, curValues) => prevValues?.cintas !== curValues?.cintas}>
                                    {() =>
                                        <Field rule={schema(['cintas', 'ncintas'])} allValues={form.getFieldsValue(true)} layout={{ center: "min-width: 50px;max-width: 50px; align-self:center;" }} name="ncintas" label={{ enabled: true, text: "Cintas", pos: "right", colon: false }}>
                                            <InputNumber disabled={form.getFieldValue(["cintas"]) !== 1} size="small" min={1} max={10} />
                                        </Field>
                                    }
                                </Item>
                            </FieldItem>
                            <FieldItem label={{ enabled: false }}>
                                <Item shouldUpdate={(prevValues, curValues) => prevValues?.cintas !== curValues?.cintas}>
                                    {() =>
                                        <Field name="cintas_palete" layout={{ center: "align-self:center;" }} label={{ enabled: false }}>
                                            <SelectField size="small" data={CINTASPALETES_OPTIONS} keyField="value" textField="label" disabled={form.getFieldValue(["cintas"]) !== 1}
                                                optionsRender={(d, keyField, textField) => ({ label: d[textField], value: d[keyField] })}
                                            />
                                        </Field>
                                    }</Item>
                            </FieldItem>
                            <Field name="folha_identificativa" required={false} layout={{ center: "align-self:center;" }} label={{ enabled: true, text: "Folha Identificativa da Palete", pos: "left", width: "100%" }}><InputNumber size="small" min={0} max={10} /></Field>
                        </FieldSet>
                        <HorizontalRule margin="12px" />
                        <FieldSet field={{ wide: 16 }} layout="horizontal">
                            <FieldSet layout="vertical" wide={7}>
                                <Form.List name="paletizacao">
                                    {(fields, { add, remove, move }) => {
                                        const addRow = (fields) => {
                                            add({ item_id: 1, item_paletesize: '970x970', item_numbobines: 10 }, 0);
                                        }
                                        const removeRow = (fieldName) => {
                                            remove(fieldName);
                                        }
                                        const moveRow = (from, to) => {
                                            move(from, to);
                                        }
                                        return (
                                            <>
                                                <FieldSet>
                                                    {forInput && <Button type="dashed" onClick={() => addRow(fields)} style={{ width: "100%" }}><PlusOutlined />Adicionar</Button>}
                                                </FieldSet>
                                                {fields.map((field, index) => (
                                                    <SubFormPalete key={field.key} form={form} remove={removeRow} move={moveRow} field={field} index={index} length={fields.length} operation={operation} forInput={forInput} />
                                                ))}
                                            </>
                                        );
                                    }}
                                </Form.List>
                            </FieldSet>
                            <FieldSet wide={9}>
                                {!loading && <SvgSchema form={form} changedValues={changedValues} />}
                            </FieldSet>
                        </FieldSet>
                    </FormLayout>
                </Form>
                {parentRef && <Portal elId={parentRef.current}>
                    <Space>
                        {isTouched && <Button disabled={submitting} onClick={onSubmit} type="primary">Guardar</Button>}
                        <Button onClick={onClose}>Fechar</Button>
                        {/* <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button> */}
                    </Space>
                </Portal>
                }
            </ResultMessage>
        </>
    );
}