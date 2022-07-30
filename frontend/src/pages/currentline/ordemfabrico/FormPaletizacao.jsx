import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, CheckboxField, HorizontalRule } from "components/formLayout";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import ResultMessage from 'components/resultMessage';
import { Input, Space, Form, Button, InputNumber } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT, PALETIZACAO_ITEMS, PALETE_SIZES, CONTENTORES_OPTIONS, CINTASPALETES_OPTIONS } from 'config';
/* import FormPaletizacaoSchema from './paletizacaoSchema/FormPaletizacaoSchema'; */

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
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

const setId = (id) => {
    if (id) {
        return { key: "update", values: { id } };
    }
    return { key: "insert", values: {} };
}


const SubFormPalete = ({ form, field, remove, move, index, length, /* operation */ forInput }) => {
    const [item, setItem] = useState(1);
    useEffect(() => {
        //if (operation.key === "update") {
            setItem(form.getFieldValue(["paletizacao", field.name, "item_id"]));
        //}
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

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, forInput=true/* , changedValues = {} */ }) => {
    /* const { form, guides, schema, fieldStatus, ...ctx } = useContext(OFabricoContext); */
    const [form] = Form.useForm();
    const [isTouched, setIsTouched] = useState(false);
    const [guides, setGuides] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [operation, setOperation] = useState(setId(record.aggItem.paletizacao_id));
    const [changedValues, setChangedValues] = useState({});
    const [paletizacoes, setPaletizacoes] = useState([]);
    /*     const [changedValues, setChangedValues] = useState({}); */
    const [resultMessage, setResultMessage] = useState({ status: "none" });

    const init = ({ signal }) => {
        (setFormTitle) && setFormTitle({ title: `Esquema de Paletização ${record.aggItem.cliente_nome}`, subTitle: `${record.aggItem.item_cod}` });
        if (!loading) {
            setLoading(true);
        }
        (async () => {
            let _paletizacoes = paletizacoes;
            if (record.aggItem.item_cod) {
                _paletizacoes = await loadPaletizacoesLookup({ artigo_cod: record.aggItem.item_cod, cliente_cod: record.aggItem.cliente_cod, signal });
                setPaletizacoes(_paletizacoes);
            }
            let paletizacao_id = record.aggItem.paletizacao_id;
            if (paletizacao_id) {
                const [paletizacao] = _paletizacoes.filter(v => v.id === paletizacao_id);
                //const paletizacaoDetails = await getPaletizacaoDetails({ paletizacao_id, token });
                const paletizacaoDetails = record.items;
                form.setFieldsValue({ ...paletizacao, paletizacao_id: paletizacao.id, paletizacao: [...paletizacaoDetails] });
            }
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
        //setChangedValues(changedValues);
        if ('paletizacao_id' in changedValues && changedValues.paletizacao_id) {
            const [paletizacao] = paletizacoes.filter(v => v.id === changedValues.paletizacao_id);
            const paletizacaoDetails = await getPaletizacaoDetails({ paletizacao_id: changedValues.paletizacao_id });
            form.setFieldsValue({ ...paletizacao, paletizacao_id: changedValues.paletizacao_id, paletizacao: [...paletizacaoDetails] });
        }
    }

    const onFinish = async (values) => {
        const paletizacao_id = form.getFieldValue("paletizacao_id");

        const { tempof_id: ofabrico_id, of_id: ofabrico_cod, qty_encomenda: qty_item } = record.aggItem;
        const artigo = {
            artigo_thickness: record.aggItem.artigo.thickness,
            artigo_diam: record.aggItem.artigo.diam_ref,
            artigo_core: record.aggItem.artigo.core,
            artigo_width: record.aggItem.artigo.lar,
            qty_item: record.aggItem.qty_encomenda
        };

        /* const status = { error: [], warning: [], info: [], success: [] };
        const msgKeys = ["paletizacao"];
        const v = schema().validate(values, { abortEarly: false });
        status.error = [...status.error, ...(v.error ? v.error?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        if (!v.error && status.error.length === 0) {
            const response = await fetchPost({ url: `${API_URL}/newpaletizacaoschema/`, parameters: { ...values, id: record?.paletizacao_id, cliente_cod: record.cliente_cod, cliente_nome: record.cliente_nome, artigo_cod: record.artigo_cod } });
            if (response.data.status !== "error") {
                if (operation.key === "update") {
                    parentReload({ paletizacao_id: operation.values.id });
                } else {
                    parentReload({}, "lookup");
                }
            }
            setResultMessage(response.data);
        } */

        //const response = await fetchPost({ url: `${API_URL}/savetempordemfabrico/`, parameters: { type: "paletizacao", paletizacao_id, ofabrico_id, ofabrico_cod, artigo } });
        if (response.data.status !== "error") {
            parentReload({ agg_id: record.aggItem.id });
            closeParent();
        }
        setSubmitting(false);
    }

    const onSubmit = useCallback(async () => {
        setSubmitting(true);
        form.submit();
    }, []);

    const onClose = (reload = false) => {
        closeParent();
    }

    const onSuccessOK = () => {
        setSubmitting(false);
    }

    const onErrorOK = () => {
        setSubmitting(false);
        setResultMessage({ status: "none" });
    }

    return (
        <>
            <ResultMessage
                result={resultMessage}
                successButtonClose={<Button key="goto-close" onClick={() => onClose(true)}>Fechar</Button>}
                errorButtonOK={<Button type="primary" key="goto-ok" onClick={onErrorOK}>OK</Button>}
                errorButtonClose={<Button key="goto-close" onClick={onClose}>Fechar</Button>}
            >
                <Form form={form} name={`form-of-paletizacao`} onFinish={onFinish} onValuesChange={onValuesChange}>
                    <FormLayout
                        id="LAY-PALETIZACAO"
                        guides={guides}
                        layout="vertical"
                        style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                        schema={schema}
                        field={{
                            //wide: [3, 2, 1, '*'],
                            margin: "2px", overflow: false, guides: guides,
                            label: { enabled: true, pos: "top", align: "start", vAlign: "center", /* width: "80px", */ wrap: false, overflow: false, colon: true, ellipsis: true },
                            alert: { pos: "right", tooltip: true, container: true /* container: "el-external" */ },
                            layout: { top: "", right: "", center: "", bottom: "", left: "" },
                            addons: {}, //top|right|center|bottom|left
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
                                        <Field name="paletizacao_id" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Paletização", pos: "left" }} >
                                            <SelectField size="small" data={paletizacoes} keyField="id" textField="designacao"
                                                optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ width: "70px" }}><b>{d["contentor_id"]}</b></div><div style={{ flex: 1 }}>{d[textField]}</div><div style={{ width: "20px" }}>v.{d["versao"]}</div></div>, value: d[keyField] })}
                                            />
                                        </Field>
                                    </FieldSet>
                                }
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
{/*                             <FieldSet wide={9}>
                                {!loading && <SvgSchema form={form} changedValues={changedValues} />}
                            </FieldSet> */}
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