import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace, InputAddon, SelectDebounceField } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import IconButton from "components/iconButton";
import ResultMessage from 'components/resultMessage';
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, DatePicker } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { MdAdjust, MdAssignmentReturned } from 'react-icons/md';
import { CgCloseO } from 'react-icons/cg';
import { DATE_FORMAT, DATETIME_FORMAT, FORMULACAO_EXTRUSORAS_COD, FORMULACAO_EXTRUSORAS_VAL, FORMULACAO_TOLERANCIA, FORMULACAO_PONDERACAO_EXTR, FORMULACAO_MANGUEIRAS } from 'config';
import { OFabricoContext } from '../ordemFabrico/FormOFabricoValidar';

const schema = (keys, excludeKeys) => {
    return getSchema({
        formu_materiasprimas_A: Joi.array().label("Matérias Primas da Extrusora A").min(1).required(),
        formu_materiasprimas_BC: Joi.array().label("Matérias Primas das Extrusoras B & C").min(1).required(),
        matprima_cod_A: Joi.string().label("Matéria Prima").required(),
        densidade_A: Joi.number().label("Densidade").required(),
        /* mangueira_A: Joi.string().label("Mangueira Extrusora A").required(), */
        arranque_A: Joi.number().label("Arranque").required(),
        matprima_cod_BC: Joi.string().label("Matéria Prima").required(),
        densidade_BC: Joi.number().label("Densidade").required(),
        arranque_BC: Joi.number().label("Arranque").required()
       /*  mangueira_BC: Joi.string().label("Mangueira Extrusora BC").required() */
    }, keys, excludeKeys,false,true).unknown(true);
}

const setId = (id) => {
    if (id) {
        return { key: "update", values: { id } };
    }
    return { key: "insert", values: {} };
}

const append = (value, suffix = '', prefix = '', onUndefined = '') => {
    if (value) {
        return `${prefix}${value}${suffix}`;
    }
    return onUndefined;
}

const HeaderA = ({ backgroundColor = "#f5f5f5", color = "#000", border = "solid 1px #d9d9d9" }) => {
    return (
        <FieldSet wide={16} layout="horizontal" margin={false}
            style={{ backgroundColor: `${backgroundColor}`, color: `${color}`, fontWeight: 500, textAlign: "center" }}
            field={{ noItemWrap: true, label: { enabled: false } }}
        >
            <FieldSet wide={7} margin={false}
                field={{
                    wide: [13, 3],
                    style: { border, borderLeft: "none", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }
                }}
            >
                <Field style={{ border, alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }} >Matérias Primas</Field>
                <Field >Densidade</Field>
            </FieldSet>
            <FieldSet margin={false} wide={9} layout="vertical"
                field={{ style: { border, borderLeft: "none" } }}
            >
                <FieldSet field={{ wide: [16] }} margin={false}>
                    <Field>Distribuição por Extrusora</Field>
                </FieldSet>
                <FieldSet margin={false}
                    field={{
                        wide: [/* 3,  */4, 4, 4, 3, 1/* , 2, 3 */],
                        style: { fontSize: "10px", border, borderLeft: "none", borderTop: "none", fontWeight: 400 }
                    }}
                >
                    {/* <Field>Doseador</Field> */}
                    <Field>%A</Field>
                    <Field>Arranque</Field>
                    <Field>Tolerância</Field>
                    <Field>% Global</Field>
                    <Field></Field>
                    {/* <Field>Checklist</Field>
                    <Field>Data/Hora</Field> */}
                </FieldSet>
            </FieldSet>
        </FieldSet>
    );
}

const HeaderBC = ({ backgroundColor = "#f5f5f5", color = "#000", border = "solid 1px #d9d9d9" }) => {
    return (
        <FieldSet wide={16} layout="horizontal" margin={false}
            field={{ noItemWrap: true, label: { enabled: false } }}
            style={{ fontSize: "10px", backgroundColor: `${backgroundColor}`, color: `${color}`, textAlign: "center" }}
        >
            <FieldSet wide={7} margin={false}
                field={{
                    wide: [13, 3],
                    style: { border, borderLeft: "none" }
                }}
            >
                <Field style={{ border }}></Field>
                <Field></Field>
            </FieldSet>
            <FieldSet margin={false} wide={9}>
                <FieldSet margin={false}
                    field={{
                        wide: [/* 3,  */4, 4, 4, 3, 1/*  2, 3 */],
                        label: { enabled: false },
                        style: { border, borderLeft: "none" }
                    }}
                >
                    {/* <Field>Doseador</Field> */}
                    <Field>%B e C</Field>
                    <Field>Arranque</Field>
                    <Field>Tolerância</Field>
                    <Field>% Global</Field>
                    <Field></Field>
                    {/* <Field>Checklist</Field>
                    <Field>Data/Hora</Field> */}
                </FieldSet>
            </FieldSet>
        </FieldSet>
    );
}

const updateGlobals = ({ values = {}, adjust = { extrusora: null, index: null }, action = "adjust" }) => {
    const { formu_materiasprimas_A: listA = [], formu_materiasprimas_BC: listBC = [], ...rest } = values;
    let ponderacaoA = FORMULACAO_PONDERACAO_EXTR[0];
    let ponderacaoBC = FORMULACAO_PONDERACAO_EXTR[1];
    let globalA = 0;
    let globalBC = 0;
    let sumArranqueA = 0;
    let sumArranqueBC = 0;

    for (let [i, v] of listA.entries()) {
        let arranque = (v.arranque_A ? v.arranque_A : 0);
        let global = (ponderacaoA * arranque) / 100;
        if ((action === "adjust" && adjust.extrusora !== 'A') || (action !== 'adjust') || (action === "adjust" && adjust.index !== i && adjust.extrusora === 'A')) {
            globalA += global;
            sumArranqueA += arranque;
        }
        v.global = global;
    }
    for (let [i, v] of listBC.entries()) {
        let arranque = (v.arranque_BC ? v.arranque_BC : 0);
        let global = (ponderacaoBC * arranque) / 100;
        if ((action === "adjust" && adjust.extrusora !== 'BC') || (action !== 'adjust') || (action === "adjust" && adjust.index !== i && adjust.extrusora === 'BC')) {
            globalBC += global;
            sumArranqueBC += arranque;
        }
        v.global = global;
    }

    if (action === "adjust") {
        if (adjust.extrusora === 'A') {
            listA[adjust.index].arranque_A = (100 - sumArranqueA) < 0 ? 0 : (100 - sumArranqueA);
            listA[adjust.index].global = (ponderacaoA * (listA[adjust.index].arranque_A)) / 100;
            globalA += listA[adjust.index].global;
        } else {
            listBC[adjust.index].arranque_BC = (100 - sumArranqueBC) < 0 ? 0 : (100 - sumArranqueBC);
            listBC[adjust.index].global = (ponderacaoBC * (listBC[adjust.index].arranque_BC)) / 100;
            globalBC += listBC[adjust.index].global;
        }
    }

    return { ...rest, formu_materiasprimas_A: listA, formu_materiasprimas_BC: listBC, totalGlobal: (globalA + globalBC) };
}

const SubFormMateriasPrimas = ({ form, forInput, name, matPrimasLookup, sum = false, border = "solid 1px #d9d9d9", id }) => {

    const adjust = (idx, extrusora) => {
        const fieldValues = updateGlobals({ values: form.getFieldsValue(true), adjust: { extrusora, index: idx }, action: "adjust" });
        form.setFieldsValue(fieldValues);
    }

    return (
        <Form.List name={name}>
            {(fields, { add, remove, move }) => {

                const addRow = (fields) => {
                    add({ [`tolerancia_${id}`]: FORMULACAO_TOLERANCIA, removeCtrl: true });
                    /* add({ item_id: 1, item_paletesize: '970x970', item_numbobines: 10 }, 0); */
                }
                const removeRow = (fieldName, field) => {
                    remove(fieldName);
                }
                const moveRow = (from, to) => {
                    move(from, to);
                }

                return (
                    <>

                        {fields.map((field, index) => (

                            <FieldSet key={field.key} wide={16} layout="horizontal" margin={false} field={{ label: { enabled: false } }}>
                                <FieldSet wide={7} margin={false}
                                    field={{
                                        wide: [13, 3],
                                        style: { border: "solid 1px #fff", borderLeft: "none", fontWeight: "10px" }
                                    }}
                                >
{/*                                     <Field name={[field.name, `mangueira_${id}`]}>
                                        <SelectField size="small" data={FORMULACAO_MANGUEIRAS[id]} keyField="key" textField="key"
                                            optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                        />
                                    </Field> */}
                                    <Field name={[field.name, `matprima_cod_${id}`]}>
                                        <SelectField size="small" data={matPrimasLookup} keyField="ITMREF_0" textField="ITMDES1_0"
                                            optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                            showSearch
                                            filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        />
                                    </Field>
                                    <Field name={[field.name, `densidade_${id}`]}><InputNumber controls={false} size="small" min={0} max={50} precision={3} step={.025} /></Field>
                                </FieldSet>
                                <FieldSet margin={false} wide={9}>
                                    <FieldSet margin={false}
                                        field={{
                                            wide: [/* 3,  */4, 4, 4, 3, 1/* , 2, 3 */],
                                            label: { enabled: false },
                                            style: { border: "solid 1px #fff", borderLeft: "none", borderTop: "none" }
                                        }}
                                    >
                                        {/* <Field name={[field.name, "doseador"]}><Input size="small" /></Field> */}
                                        <Field></Field>
                                        <Field name={[field.name, `arranque_${id}`]}><InputNumber size="small" controls={false} {...(forInput && { addonBefore: <IconButton onClick={() => adjust(index, id)}><MdAdjust /></IconButton> })} addonAfter={<b>%</b>} precision={2} min={0} max={100} /></Field>
                                        <Field name={[field.name, `tolerancia_${id}`]}><InputNumber size="small" controls={false} addonBefore="&plusmn;" addonAfter={<b>%</b>} maxLength={4} precision={1} min={0} max={100} /></Field>
                                        <Field style={{ textAlign: "center", border: "solid 1px #fff", borderLeft: "none", borderTop: "none" }}>{append(form.getFieldValue([name, field.name, "global"])?.toFixed(2), '%')}{/* <InputNumber size="small" addonAfter={<b>%</b>} maxLength={4} min={0} max={100} /> */}</Field>
                                        <FieldItem label={{ enabled: false }}>{forInput && <IconButton onClick={() => removeRow(field.name, field)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton>}</FieldItem>
                                        {/*<Field name={[field.name, "checklist"]}><CheckboxField /></Field>
                                        <Field name={[field.name, "check_datetime"]}><DatePicker /></Field> */}
                                    </FieldSet>
                                </FieldSet>
                            </FieldSet>

                        ))}
                        {(sum && form.getFieldValue("totalGlobal") > 0) &&
                            <FieldSet wide={16} layout="horizontal" margin={false} field={{ label: { enabled: false } }}>
                                <FieldSet wide={7} margin={false} />
                                <FieldSet margin={false} wide={9}>
                                    <FieldSet margin={false}
                                        field={{
                                            wide: [12, 4],
                                            label: { enabled: false },
                                            style: { border: "solid 1px #fff", borderLeft: "none", borderTop: "none" }
                                        }}
                                    >
                                        <Field></Field>
                                        <Field style={{ marginTop: "4px", textAlign: "center", fontWeight: 500, border }}>{append(form.getFieldValue("totalGlobal").toFixed(2), '%')}</Field>
                                    </FieldSet>
                                </FieldSet>
                            </FieldSet>
                        }
                        <FieldSet>
                            {forInput && <Button type="dashed" onClick={() => addRow(fields)} style={{ width: "100%" }}><PlusOutlined />Adicionar</Button>}
                        </FieldSet>
                    </>
                );
            }}
        </Form.List>
    );
}



const LoadMateriasPrimasLookup = async (record) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimaslookup/`, filter: {} });
    return rows;
}
const loadCustomersLookup = async (value) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellcustomerslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_customer"]: `%${value.replaceAll(' ', '%%')}%` } });
    return rows;
}



export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const ctx = useContext(OFabricoContext);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [changedValues, setChangedValues] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [operation, setOperation] = useState(setId(record.formulacao_id));
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    const [matPrimasLookup, setMatPrimasLookup] = useState([]);

    const init = (lookup = false) => {
        (async () => {
            if (lookup) {
                setMatPrimasLookup(await LoadMateriasPrimasLookup(record));
            }
            if (operation.key === "update") {
                (setFormTitle) && setFormTitle({ title: `Editar Formulação` });
                let formu_materiasprimas_A = record.formulacaoMatPrimas?.filter(v => (v.extrusora === 'A')).map(v => ({ global: v.vglobal, /* mangueira_A: v.mangueira, */ matprima_cod_A: v.matprima_cod, densidade_A: v.densidade, arranque_A: v.arranque, tolerancia_A: v.tolerancia, removeCtrl: true }));
                let formu_materiasprimas_BC = record.formulacaoMatPrimas?.filter(v => (v.extrusora === 'BC')).map(v => ({ global: v.vglobal, /* mangueira_BC: v.mangueira, */ matprima_cod_BC: v.matprima_cod, densidade_BC: v.densidade, arranque_BC: v.arranque, tolerancia_BC: v.tolerancia, removeCtrl: true }));
                form.setFieldsValue({ ...record.formulacao, formu_materiasprimas_A, formu_materiasprimas_BC, totalGlobal: 100 });
            } else {
                (setFormTitle) && setFormTitle({ title: `Nova Formulação ${ctx.item_cod}`, subTitle: `${ctx.item_nome}` });
                form.setFieldsValue({
                    extr0: FORMULACAO_EXTRUSORAS_COD[0], extr1: FORMULACAO_EXTRUSORAS_COD[1], extr2: FORMULACAO_EXTRUSORAS_COD[2], extr3: FORMULACAO_EXTRUSORAS_COD[3], extr4: FORMULACAO_EXTRUSORAS_COD[4],
                    extr0_val: FORMULACAO_EXTRUSORAS_VAL[0], extr1_val: FORMULACAO_EXTRUSORAS_VAL[1], extr2_val: FORMULACAO_EXTRUSORAS_VAL[2], extr3_val: FORMULACAO_EXTRUSORAS_VAL[3], extr4_val: FORMULACAO_EXTRUSORAS_VAL[4]
                });
            }
            setLoading(false);
        })();
    }

    useEffect(() => {
        init(true);
        return (() => setMatPrimasLookup([]));
    }, []);


    const onValuesChange = (changedValues, { formu_materiasprimas_A: allA = [], formu_materiasprimas_BC: allBC = [], ...allValues }) => {
        const formu_materiasprimas_A = allA.filter(v => v.removeCtrl === true);
        const formu_materiasprimas_BC = allBC.filter(v => v.removeCtrl === true);
        const fieldValues = updateGlobals({ values: { ...allValues, formu_materiasprimas_A, formu_materiasprimas_BC }, action: "valueschange" });
        form.setFieldsValue(fieldValues);
        setChangedValues(changedValues);
    }

    const onFinish = async (values) => {
        const items = [];
        const status = { error: [], warning: [], info: [], success: [] };
        const msgKeys = ["formu_materiasprimas_A", "formu_materiasprimas_BC"];
        const v = schema(false, [/* 'mangueira_A', */ 'matprima_cod_A', 'densidade_A', 'arranque_A', /* 'mangueira_BC', */ 'matprima_cod_BC', 'densidade_BC', 'arranque_BC'],1).validate(values, { abortEarly: false });
        status.error = [...status.error, ...(v.error ? v.error?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        status.warning = [...status.warning, ...(v.warning ? v.warning?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        let fieldValues;
        console.log("UYUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU",v.error,values)
        if (!v.error) {
            fieldValues = updateGlobals({ values, action: "finish" });
            
            /* let mA = fieldValues.formu_materiasprimas_A.map((v) => v.mangueira_A);
            let mBC = fieldValues.formu_materiasprimas_BC.map((v) => v.mangueira_BC); */

/*             if ((new Set(mA)).size !== mA.length) {
                status.error.push({ message: "As mangueiras na Extrusora A, não podem estar duplicadas!" });
            } else if ((new Set(mBC)).size !== mBC.length) {
                status.error.push({ message: "As mangueiras na Extrusora BC, não podem estar duplicadas!" });
            } */


            let sumA = fieldValues.formu_materiasprimas_A.reduce((a, b) => a + (b["arranque_A"] || 0), 0);
            let sumBC = fieldValues.formu_materiasprimas_BC.reduce((a, b) => a + (b["arranque_BC"] || 0), 0);

            if (Math.round(fieldValues.totalGlobal) !== 100) {
                status.error.push({ message: "O Total Global das Matérias Primas tem de ser 100%!" });
            } else if (sumA !== 100) {
                status.error.push({ message: "O Total das Matérias Primas da Extrusora A tem de ser 100%!" });
            }
            else if (sumBC !== 100) {
                status.error.push({ message: "O Total das Matérias Primas das Extrusoras B&C tem de ser 100%!" });
            }
        }
        if (status.error.length === 0 && fieldValues) {
            for (let v of fieldValues?.formu_materiasprimas_A) {
                let matprima_des = matPrimasLookup.find(val => val.ITMREF_0 === v.matprima_cod_A)?.ITMDES1_0;
                items.push({
                    tolerancia: v.tolerancia_A, arranque: v.arranque_A, vglobal: v.global,
                    densidade: v.densidade_A, /* mangueira: v.mangueira_A, */ extrusora: 'A', matprima_cod: v.matprima_cod_A,
                    matprima_des
                });
            }
            for (let v of fieldValues?.formu_materiasprimas_BC) {
                let matprima_des = matPrimasLookup.find(val => val.ITMREF_0 === v.matprima_cod_BC)?.ITMDES1_0;
                items.push({
                    tolerancia: v.tolerancia_BC, arranque: v.arranque_BC, vglobal: v.global,
                    densidade: v.densidade_BC, /* mangueira: v.mangueira_BC, */ extrusora: 'BC', matprima_cod: v.matprima_cod_BC,
                    matprima_des
                });
            }
            const { cliente_cod: { value: cliente_cod, label: cliente_nome } = {} } = values;
            const response = await fetchPost({ url: `${API_URL}/newformulacao/`, parameters: { ...values, items, produto_id: ctx.produto_id, cliente_cod, cliente_nome } });
            if (response.data.status !== "error") {
                parentReload({formulacao_id: record.formulacao_id}, "init");
            }
            setResultMessage(response.data);
        }
        setFormStatus(status);
    }

    const onSuccessOK = () => {
        if (operation.key === "insert") {
            form.resetFields();
            init();
            setResultMessage({ status: "none" });
        }
        setSubmitting(false);
    }

    const onErrorOK = () => {
        setSubmitting(false);
        setResultMessage({ status: "none" });
    }

    const onClose = (reload = false) => {
        closeParent();
    }

    const onSubmit = () => {
        setSubmitting(true);
        onFinish(form.getFieldsValue(true));
    };

    return (
        <>
            <ResultMessage
                result={resultMessage}
                successButtonOK={operation.key === "insert" && <Button type="primary" key="goto-of" onClick={onSuccessOK}>Criar Nova Formulação</Button>}
                successButtonClose={<Button key="goto-close" onClick={() => onClose(true)}>Fechar</Button>}
                errorButtonOK={<Button type="primary" key="goto-ok" onClick={onErrorOK}>OK</Button>}
                errorButtonClose={<Button key="goto-close" onClick={onClose}>Fechar</Button>}
            >
                <AlertsContainer id="el-external" />
                <AlertMessages formStatus={formStatus} />
                <Form form={form} name={`fps`} onFinish={onFinish} onValuesChange={onValuesChange} component={wrapForm}>
                    <FormLayout
                        id="LAY-FORMULACAO-UPSERT"
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
                        {/* {forInput && <>
                            <FieldSet margin={false} field={{ wide: [6, 4] }}>
                                <Field name="designacao" label={{ enabled: false }}><Input placeholder="Designação" size="small" /></Field>
                            </FieldSet>
                            <HorizontalRule margin="24px" />
                        </>
                        } */}

                        {forInput && <>
                            <FieldSet margin={false} field={{ wide: [6, 8] }}>
                                <Field name="designacao" label={{ enabled: false }}><Input placeholder="Designação" size="small" /></Field>
                                <Field name="cliente_cod" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: false, text: "Cliente", pos: "left" }}>
                                    <SelectDebounceField
                                        placeholder="Cliente"
                                        size="small"
                                        keyField="BPCNUM_0"
                                        textField="BPCNAM_0"
                                        showSearch
                                        showArrow
                                        allowClear
                                        fetchOptions={loadCustomersLookup}
                                    />
                                </Field>
                            </FieldSet>
                            <VerticalSpace height="24px" />
                        </>
                        }
                        {!forInput && <>
                            <FieldSet margin={false} field={{ wide: [9, 7] }}>
                                <Field name="cliente_cod" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: false, text: "Cliente", pos: "left" }}>
                                    <SelectDebounceField
                                        placeholder="Cliente"
                                        size="small"
                                        keyField="BPCNUM_0"
                                        textField="BPCNAM_0"
                                        showSearch
                                        showArrow
                                        allowClear
                                        fetchOptions={loadCustomersLookup}
                                    />
                                </Field>
                            </FieldSet>
                            <VerticalSpace height="24px" />
                        </>
                        }

                        <FieldSet wide={16} margin={false}>
                            <FieldSet wide={3} />
                            <FieldSet wide={10} margin={false} layout="vertical" field={{ split: 5, wide: undefined }}>
                                <FieldSet margin={false}>
                                    <Field name="extr0" label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                    <Field name="extr1" label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                    <Field name="extr2" label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                    <Field name="extr3" label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                    <Field name="extr4" label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                </FieldSet>
                                <FieldSet margin={false}>
                                    <Field name="extr0_val" label={{ enabled: false }}><InputNumber disabled={true} size="small" addonAfter={<b>%</b>} maxLength={4} /></Field>
                                    <Field name="extr1_val" label={{ enabled: false }}><InputNumber disabled={true} size="small" addonAfter={<b>%</b>} maxLength={4} /></Field>
                                    <Field name="extr2_val" label={{ enabled: false }}><InputNumber disabled={true} size="small" addonAfter={<b>%</b>} maxLength={4} /></Field>
                                    <Field name="extr3_val" label={{ enabled: false }}><InputNumber disabled={true} size="small" addonAfter={<b>%</b>} maxLength={4} /></Field>
                                    <Field name="extr4_val" label={{ enabled: false }}><InputNumber disabled={true} size="small" addonAfter={<b>%</b>} maxLength={4} /></Field>
                                </FieldSet>
                            </FieldSet>
                            <FieldSet wide={3} />
                        </FieldSet>

                        <VerticalSpace height="12px" />

                        <HeaderA />
                        <SubFormMateriasPrimas form={form} name="formu_materiasprimas_A" forInput={forInput} matPrimasLookup={matPrimasLookup} id="A" />
                        <HeaderBC />
                        <SubFormMateriasPrimas form={form} name="formu_materiasprimas_BC" forInput={forInput} matPrimasLookup={matPrimasLookup} sum={true} id="BC" />

                    </FormLayout>
                </Form>
                {parentRef && <Portal elId={parentRef.current}>
                    <Space>
                        <Button disabled={submitting} onClick={onSubmit} type="primary">Guardar</Button>
                        {/* <Button type="primary" onClick={() => onFinish(form.getFieldsValue(true))}>Guardar</Button> */}
                        {/* <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button> */}
                    </Space>
                </Portal>
                }
            </ResultMessage>
        </>
    );
}