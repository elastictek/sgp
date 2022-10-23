import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import classNames from "classnames";
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL, DATE_FORMAT, DATETIME_FORMAT, FORMULACAO_EXTRUSORAS_COD, FORMULACAO_EXTRUSORAS_VAL, FORMULACAO_TOLERANCIA, FORMULACAO_PONDERACAO_EXTR, FORMULACAO_MANGUEIRAS } from "config";
import { getSchema } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import IconButton from "components/iconButton";
import YScroll from "components/YScroll";
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, DatePicker, Modal, Checkbox } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { MdAdjust, MdAssignmentReturned } from 'react-icons/md';
import { CgCloseO } from 'react-icons/cg';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, SelectDebounceField, CheckboxField } from 'components/FormFields';
import {transformFormulacaoData} from "./commons";

const useStyles = createUseStyles({
    center: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%"
    },
    bold: {
        fontWeight: 700
    }
});


const schema = (options = {}) => {
    return getSchema({
        formu_materiasprimas_A: Joi.array().label("Matérias Primas da Extrusora A").min(1).required(),
        formu_materiasprimas_B: Joi.array().label("Matérias Primas das Extrusoras B").min(1).required(),
        formu_materiasprimas_C: Joi.array().label("Matérias Primas das Extrusoras C").min(1).required(),
        matprima_cod: Joi.string().label("Matéria Prima").required(),
        densidade: Joi.number().label("Densidade").required(),
        arranque: Joi.number().label("Arranque").required(),
    }, options).unknown(true);
}

const LoadMateriasPrimasLookup = async (record, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimaslookup/`, filter: {}, signal });
    return rows;
}
const loadFormulacaoesLookup = async ({ produto_id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/formulacoeslookup/`, filter: { produto_id }, sort: [], signal });
    return rows;
}
const loadCustomersLookup = async (value) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellcustomerslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_customer"]: `%${value.replaceAll(' ', '%%')}%` } });
    return rows;
}
const getFormulacaoMateriasPrimas = async ({ formulacao_id, signal }) => {
    if (!formulacao_id) { return []; }
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/formulacaomateriasprimasget/`, filter: { formulacao_id }, sort: [], signal });
    return rows;
}

const updateGlobals = ({ values = {}, adjust = { extrusora: null, index: null }, action = "adjust" }) => {
    const { formu_materiasprimas_A: listA = [], formu_materiasprimas_B: listB = [], formu_materiasprimas_C: listC = [], ...rest } = values;
    let ponderacaoA = FORMULACAO_PONDERACAO_EXTR[0];
    //let ponderacaoBC = FORMULACAO_PONDERACAO_EXTR[1];
    let ponderacaoB = FORMULACAO_PONDERACAO_EXTR[2];
    let ponderacaoC = FORMULACAO_PONDERACAO_EXTR[3];
    let globalA = 0;
    let globalB = 0;
    let globalC = 0;
    let sumArranqueA = 0;
    let sumArranqueB = 0;
    let sumArranqueC = 0;

    for (let [i, v] of listA.entries()) {
        let arranque = (v.arranque ? v.arranque : 0);
        let global = (ponderacaoA * arranque) / 100;
        if ((action === "adjust" && adjust.extrusora !== 'A') || (action !== 'adjust') || (action === "adjust" && adjust.index !== i && adjust.extrusora === 'A')) {
            globalA += global;
            sumArranqueA += arranque;
        }
        v.global = global;
    }
    for (let [i, v] of listB.entries()) {
        let arranque = (v.arranque ? v.arranque : 0);
        let global = (ponderacaoB * arranque) / 100;
        if ((action === "adjust" && adjust.extrusora !== 'B') || (action !== 'adjust') || (action === "adjust" && adjust.index !== i && adjust.extrusora === 'B')) {
            globalB += global;
            sumArranqueB += arranque;
        }
        v.global = global;
    }
    for (let [i, v] of listC.entries()) {
        let arranque = (v.arranque ? v.arranque : 0);
        let global = (ponderacaoC * arranque) / 100;
        if ((action === "adjust" && adjust.extrusora !== 'C') || (action !== 'adjust') || (action === "adjust" && adjust.index !== i && adjust.extrusora === 'C')) {
            globalC += global;
            sumArranqueC += arranque;
        }
        v.global = global;
    }

    if (action === "adjust") {
        if (adjust.extrusora === 'A') {
            listA[adjust.index].arranque = (100 - sumArranqueA) < 0 ? 0 : (100 - sumArranqueA);
            listA[adjust.index].global = (ponderacaoA * (listA[adjust.index].arranque)) / 100;
            globalA += listA[adjust.index].global;
        }
        if (adjust.extrusora === 'B') {
            listB[adjust.index].arranque = (100 - sumArranqueB) < 0 ? 0 : (100 - sumArranqueB);
            listB[adjust.index].global = (ponderacaoB * (listB[adjust.index].arranque)) / 100;
            globalB += listB[adjust.index].global;
        }
        if (adjust.extrusora === 'C') {
            listC[adjust.index].arranque = (100 - sumArranqueC) < 0 ? 0 : (100 - sumArranqueC);
            listC[adjust.index].global = (ponderacaoC * (listC[adjust.index].arranque)) / 100;
            globalC += listC[adjust.index].global;
        }
    }

    return { ...rest, formu_materiasprimas_A: listA, formu_materiasprimas_B: listB, formu_materiasprimas_C: listC, totalGlobal: (globalA + globalB + globalC) };
}

const append = (value, suffix = '', prefix = '', onUndefined = '') => {
    if (value) {
        return `${prefix}${value}${suffix}`;
    }
    return onUndefined;
}


const HeaderExtrusora = ({ id }) => {
    const classes = useStyles();
    return (<>
        {id === "A" &&
            <Row style={{ border: "solid 1px #dee2e6", background: "#f8f9fa", marginTop: "5px" }} align="stretch">
                <Col xs={5} style={{ borderRight: "solid 1px #dee2e6" }}><div className={classNames(classes.center, classes.bold)}>Matérias Primas [{id}]</div></Col>
                <Col xs={1} style={{ borderRight: "solid 1px #dee2e6" }}><div className={classNames(classes.center, classes.bold)}>Densidade</div></Col>
                <Col xs={6}>
                    <Row style={{ borderBottom: "solid 1px #dee2e6" }}><Col><div className={classNames(classes.center, classes.bold)}>Distribuição por Extrusora</div></Col></Row>
                    <Row wrap='nowrap'>
                        <Col xs={4} style={{ borderRight: "solid 1px #dee2e6" }}><div className={classNames(classes.center, classes.bold)}>Arranque</div></Col>
                        <Col xs={4} style={{ borderRight: "solid 1px #dee2e6" }}><div className={classNames(classes.center, classes.bold)}>Tolerância</div></Col>
                        <Col xs={3} style={{ borderRight: "solid 1px #dee2e6" }}><div className={classNames(classes.center, classes.bold)}>% Global</div></Col>
                        <Col xs={1}><div className={classNames(classes.center, classes.bold)}></div></Col>
                    </Row>
                </Col>
            </Row>
        }
        {(id === "BC" || id === "B" || id === "C") &&
            <Row style={{ border: "solid 1px #dee2e6", background: "#f8f9fa", marginTop: "5px" }} align="stretch">
                {(id === "B") ?
                    <>
                        <Col xs={2} style={{ borderRight: "solid 1px #dee2e6" }}><Field label={{ enabled: true, text: "BC", pos: "left", width: "25px" }} name="joinBC"><CheckboxField /></Field></Col>
                        <Col xs={3} style={{ borderRight: "solid 1px #dee2e6" }}><div className={classNames(classes.center, classes.bold)}>Matérias Primas [{id}]</div></Col>
                    </>
                    :
                    <Col xs={5} style={{ borderRight: "solid 1px #dee2e6" }}><div className={classNames(classes.center, classes.bold)}>Matérias Primas [{id}]</div></Col>
                }
                <Col xs={1} style={{ borderRight: "solid 1px #dee2e6" }}><div className={classNames(classes.center, classes.bold)}>Densidade</div></Col>
                <Col xs={6}>
                    <Row wrap='nowrap'>
                        <Col xs={4} style={{ borderRight: "solid 1px #dee2e6" }}><div className={classNames(classes.center, classes.bold)}>Arranque</div></Col>
                        <Col xs={4} style={{ borderRight: "solid 1px #dee2e6" }}><div className={classNames(classes.center, classes.bold)}>Tolerância</div></Col>
                        <Col xs={3} style={{ borderRight: "solid 1px #dee2e6" }}><div className={classNames(classes.center, classes.bold)}>% Global</div></Col>
                        <Col xs={1}><div className={classNames(classes.center, classes.bold)}></div></Col>
                    </Row>
                </Col>
            </Row>
        }
    </>);
}

const Extrusora = ({ id, form, matPrimasLookup, forInput, last = false }) => {
    const classes = useStyles();

    const adjust = (idx, extrusora) => {
        const fieldValues = updateGlobals({ values: form.getFieldsValue(true), adjust: { extrusora, index: idx }, action: "adjust" });
        form.setFieldsValue(fieldValues);
    }

    return (
        <>
            <HeaderExtrusora id={id} form={form} />
            <Form.List name={`formu_materiasprimas_${id}`}>
                {(fields, { add, remove, move }) => {

                    const addRow = (fields) => {
                        add({ [`tolerancia`]: FORMULACAO_TOLERANCIA, removeCtrl: true });
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
                                <Row key={field.key}>
                                    <Col xs={5}>
                                        <Field name={[field.name, `matprima_cod`]} label={{ enabled: false }}>
                                            <SelectField size="small" data={matPrimasLookup} keyField="ITMREF_0" textField="ITMDES1_0" showSearch
                                                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            />
                                        </Field>
                                    </Col>
                                    <Col xs={1}><Field name={[field.name, `densidade`]} label={{ enabled: false }}><InputNumber style={{ width: "100%" }} controls={false} size="small" min={0} max={50} precision={3} step={.025} /></Field></Col>
                                    <Col xs={6}>
                                        <Row wrap='nowrap'>
                                            <Col xs={4}><Field name={[field.name, `arranque`]} label={{ enabled: false }}><InputNumber size="small" style={{ width: "100%" }} controls={false} {...(forInput && { addonBefore: <IconButton onClick={() => adjust(index, id)}><MdAdjust /></IconButton> })} addonAfter={<b>%</b>} precision={2} min={0} max={100} /></Field></Col>
                                            <Col xs={4}><Field name={[field.name, `tolerancia`]} label={{ enabled: false }}><InputNumber size="small" style={{ width: "100%" }} controls={false} addonBefore="&plusmn;" addonAfter={<b>%</b>} maxLength={4} precision={1} min={0} max={100} /></Field></Col>
                                            <Col xs={3}><div className={classNames(classes.center)}>{append(form.getFieldValue([`formu_materiasprimas_${id}`, field.name, "global"])?.toFixed(2), '%')}</div></Col>
                                            <Col xs={1}><div className={classNames(classes.center)}>{forInput && <IconButton onClick={() => removeRow(field.name, field)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton>}</div></Col>
                                        </Row>
                                    </Col>
                                </Row>
                            ))}
                            {(last === true && form.getFieldValue("totalGlobal") > 0) &&
                                <Row>
                                    <Col></Col>
                                    <Col xs={2} style={{ marginTop: "4px", fontWeight: 500, border: "solid 1px #d9d9d9" }}><div className={classNames(classes.center)}>{append(form.getFieldValue("totalGlobal").toFixed(2), '%')}</div></Col>
                                </Row>
                            }
                            <Row style={{ marginTop: "5px" }}><Col>{forInput && <Button type="dashed" onClick={() => addRow(fields)} style={{ width: "100%" }}><PlusOutlined />Adicionar</Button>}</Col></Row>
                        </>
                    );
                }}
            </Form.List>
        </>
    );
}

const Distribution = ({ forInput }) => {
    return (
        <>
            {forInput &&
                <>
                    <Row justify="center" nogutter>
                        <Col xs={2}><Field name="extr0"><Input disabled={true} size="small" /></Field></Col>
                        <Col xs={2}><Field name="extr1"><Input disabled={true} size="small" /></Field></Col>
                        <Col xs={2}><Field name="extr2"><Input disabled={true} size="small" /></Field></Col>
                        <Col xs={2}><Field name="extr3"><Input disabled={true} size="small" /></Field></Col>
                        <Col xs={2}><Field name="extr4"><Input disabled={true} size="small" /></Field></Col>
                    </Row>
                    <Row justify="center" nogutter>
                        <Col xs={2}><Field name="extr0_val"><InputNumber disabled={true} size="small" addonAfter={<b>%</b>} maxLength={4} /></Field></Col>
                        <Col xs={2}><Field name="extr1_val"><InputNumber disabled={true} size="small" addonAfter={<b>%</b>} maxLength={4} /></Field></Col>
                        <Col xs={2}><Field name="extr2_val"><InputNumber disabled={true} size="small" addonAfter={<b>%</b>} maxLength={4} /></Field></Col>
                        <Col xs={2}><Field name="extr3_val"><InputNumber disabled={true} size="small" addonAfter={<b>%</b>} maxLength={4} /></Field></Col>
                        <Col xs={2}><Field name="extr4_val"><InputNumber disabled={true} size="small" addonAfter={<b>%</b>} maxLength={4} /></Field></Col>
                    </Row>
                </>
            }
        </>
    );
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, forInput = true }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);
    const [isTouched, setIsTouched] = useState(false);
    const [joinBC, setJoinBC] = useState();

    const [matPrimasLookup, setMatPrimasLookup] = useState([]);
    const [formulacoesLookup, setFormulacoesLookup] = useState([]);

    const loadData = async ({ lookup = false, signal }) => {
        const { items, produto_id, joinBC: _joinBC = 1 } = record.formulacao;
        if (lookup) {
            setMatPrimasLookup(await LoadMateriasPrimasLookup(record, signal));
        }
        if (setFormTitle) {
            if (record.feature === "formulation_change") {
                setFormTitle({ title: `Alterar Formulação` });
            } else {
                setFormTitle({ title: `Formulação` });
            }
        }
        setJoinBC(_joinBC === 1);
        setFormulacoesLookup(await loadFormulacaoesLookup({ produto_id }, signal));
        form.setFieldsValue({ ...transformFormulacaoData({ items, formulacao: record?.formulacao }), joinBC: _joinBC });
        submitting.end();
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ lookup: true, signal: controller.signal });
        return (() => controller.abort());
    }, [record]);

    const onFinish = async () => {
        submitting.trigger();
        const values = form.getFieldsValue(true);
        const items = [];
        const status = { error: [], warning: [], info: [], success: [] };
        const keys = ["formu_materiasprimas_A", "formu_materiasprimas_B", "formu_materiasprimas_C"];
        if (joinBC) {
            values.formu_materiasprimas_C = [...values.formu_materiasprimas_B];
        }
        const v = schema({ keys }).validate(values, { abortEarly: false });
        //Verifica se existem items definidos em ambas as extrusoras
        status.error = [...status.error, ...(v.error ? v.error?.details.filter((v) => keys.includes(v.context.key)) : [])];
        status.warning = [...status.warning, ...(v.warning ? v.warning?.details.filter((v) => msgKekeysys.includes(v.context.key)) : [])];
        const _fieldStatus = { ...fieldStatus };

        if (!v.error) {
            for (const [i, x] of values.formu_materiasprimas_A.entries()) {
                const vx = schema({ excludeKeys: [...keys] }).validate(x, { abortEarly: false });
                if (vx?.error) {
                    for (let k of vx?.error?.details) {
                        _fieldStatus[`${i},${k.context.key}`] = { status: "error", messages: [{ message: k.message }] };
                    }
                }
            }
            for (const [i, x] of values.formu_materiasprimas_B.entries()) {
                const vx = schema({ excludeKeys: [...keys] }).validate(x, { abortEarly: false });
                if (vx?.error) {
                    for (let k of vx?.error?.details) {
                        _fieldStatus[`${i},${k.context.key}`] = { status: "error", messages: [{ message: k.message }] };
                    }
                }
            }
            for (const [i, x] of values.formu_materiasprimas_C.entries()) {
                const vx = schema({ excludeKeys: [...keys] }).validate(x, { abortEarly: false });
                if (vx?.error) {
                    for (let k of vx?.error?.details) {
                        _fieldStatus[`${i},${k.context.key}`] = { status: "error", messages: [{ message: k.message }] };
                    }
                }
            }
        }
        if (Object.keys(_fieldStatus).length === 0) {
            const fieldValues = updateGlobals({ values, action: "finish" });
            let sumA = fieldValues.formu_materiasprimas_A.reduce((a, b) => a + (b["arranque"] || 0), 0);
            let sumB = fieldValues.formu_materiasprimas_B.reduce((a, b) => a + (b["arranque"] || 0), 0);
            let sumC = fieldValues.formu_materiasprimas_C.reduce((a, b) => a + (b["arranque"] || 0), 0);
            if (Math.round(fieldValues.totalGlobal) !== 100) {
                status.error.push({ message: "O Total Global das Matérias Primas tem de ser 100%!" });
            } else if (sumA !== 100) {
                status.error.push({ message: "O Total das Matérias Primas da Extrusora A tem de ser 100%!" });
            } else if (sumB !== 100) {
                status.error.push({ message: "O Total das Matérias Primas das Extrusoras B tem de ser 100%!" });
            } else if (sumC !== 100) {
                status.error.push({ message: "O Total das Matérias Primas das Extrusoras C tem de ser 100%!" });
            }
            if (status.error.length === 0) {
                for (let v of fieldValues?.formu_materiasprimas_A) {
                    let matprima_des = matPrimasLookup.find(val => val.ITMREF_0 === v.matprima_cod)?.ITMDES1_0;
                    if (v.matprima_cod !== v.orig_matprima_cod) {

                    }
                    items.push({
                        tolerancia: v.tolerancia, arranque: v.arranque, vglobal: v.global,
                        densidade: v.densidade, extrusora: 'A', matprima_cod: v.matprima_cod,
                        doseador: v.doseador, cuba: v.cuba, matprima_des
                    });
                }
                for (let v of fieldValues?.formu_materiasprimas_B) {
                    let matprima_des = matPrimasLookup.find(val => val.ITMREF_0 === v.matprima_cod)?.ITMDES1_0;
                    items.push({
                        tolerancia: v.tolerancia, arranque: v.arranque, vglobal: v.global,
                        densidade: v.densidade, extrusora: 'B', matprima_cod: v.matprima_cod,
                        doseador: v.doseador, cuba: v.cuba, matprima_des
                    });
                }
                for (let v of fieldValues?.formu_materiasprimas_C) {
                    let matprima_des = matPrimasLookup.find(val => val.ITMREF_0 === v.matprima_cod)?.ITMDES1_0;
                    items.push({
                        tolerancia: v.tolerancia, arranque: v.arranque, vglobal: v.global,
                        densidade: v.densidade, extrusora: 'C', matprima_cod: v.matprima_cod,
                        doseador: v.doseador, cuba: v.cuba, matprima_des
                    });
                }


                const { cliente_cod: { value: cliente_cod, label: cliente_nome } = {}, source, ...vals } = values;
                if ("formu_materiasprimas_BC" in vals) {
                    delete vals.formu_materiasprimas_BC;
                }
                try {
                    const response = await fetchPost({ url: `${API_URL}/updatecurrentsettings/`, filter: { csid: record.id }, parameters: { type: `formulacao_${record.feature}`, formulacao: { ...vals, items, produto_id: record.formulacao.produto_id, cliente_cod, cliente_nome, valid: 0 } } });
                    if (response.data.status !== "error") {
                        Modal.success({ title: "Formulação alterada com sucesso!", onOk: () => { parentReload(); closeParent(); } })
                    } else {
                        status.error.push({ message: response.data.title });
                        setFormStatus({ ...status });
                    }
                } catch (e) {
                    status.error.push({ message: e.message });
                    setFormStatus({ ...status });
                }
            }
        }
        setFieldStatus({ ..._fieldStatus });
        setFormStatus({ ...status });
        submitting.end();
    }
    const onValuesChange = async (changedValues, { formu_materiasprimas_A: allA = [], formu_materiasprimas_B: allB = [], formu_materiasprimas_C: allC = [], ...values }) => {
        setIsTouched(true);
        if ('joinBC' in changedValues) {
            setJoinBC(changedValues.joinBC === 1);
        } else if ('id' in changedValues) {
            const formulacao = formulacoesLookup.find(v => v.id === changedValues.id);
            const items = await getFormulacaoMateriasPrimas({ formulacao_id: changedValues.id });
            form.setFieldsValue(transformFormulacaoData({ items, formulacao: formulacao }));
        } else {
            const formu_materiasprimas_A = allA.filter(v => v.removeCtrl === true);
            const formu_materiasprimas_B = allB.filter(v => v.removeCtrl === true);
            const formu_materiasprimas_C = (!joinBC) ? allC.filter(v => v.removeCtrl === true) : [...formu_materiasprimas_B];
            const fieldValues = updateGlobals({ values: { ...values, formu_materiasprimas_A, formu_materiasprimas_B, formu_materiasprimas_C }, action: "valueschange" });
            form.setFieldsValue(fieldValues);
        }
    }

    return (
        <YScroll>
            <Form form={form} name={`f-formulacao`} onFinish={onFinish} onValuesChange={onValuesChange}>
                <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
                <FormContainer id="FRM-FORMULACAO" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} style={{ marginTop: "5px" }} schema={schema} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }} forInput={forInput}>
                    <Row style={{ border: "solid 1px #dee2e6", background: "#f8f9fa", padding: "5px" }}>
                        <Col>
                            <Field name="id" label={{ enabled: false, text: "Formulação", pos: "left" }}>
                                <SelectField size="small" data={formulacoesLookup} keyField="id" textField="designacao"
                                    optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ minWidth: "150px" }}><b>{d[textField]}</b></div><div>v.{d["versao"]}</div></div>, value: d[keyField] })}
                                />
                            </Field>
                        </Col>
                        <Col>
                            <Field name="cliente_cod" label={{ enabled: false, text: "Cliente", pos: "left" }}>
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
                        </Col>
                    </Row>
                    <Distribution forInput={forInput} />
                    <Extrusora id="A" form={form} matPrimasLookup={matPrimasLookup} forInput={forInput} />
                    <Extrusora id="B" form={form} matPrimasLookup={matPrimasLookup} forInput={forInput} last={joinBC === true} />
                    {joinBC === false &&
                        <Extrusora id="C" form={form} matPrimasLookup={matPrimasLookup} forInput={forInput} last />
                    }

                </FormContainer>


                {parentRef && <Portal elId={parentRef.current}>
                    <Space>
                        {isTouched && <Button disabled={submitting.state} type="primary" onClick={onFinish}>Guardar</Button>}
                        <Button onClick={closeParent}>Fechar</Button>
                    </Space>
                </Portal>
                }
            </Form>
        </YScroll>
    );
}