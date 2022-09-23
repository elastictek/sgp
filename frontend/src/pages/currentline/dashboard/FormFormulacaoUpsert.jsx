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
import { Input, Space, Form, Button, InputNumber, DatePicker, Modal } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { MdAdjust, MdAssignmentReturned } from 'react-icons/md';
import { CgCloseO } from 'react-icons/cg';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, SelectDebounceField } from 'components/FormFields';

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
        formu_materiasprimas_BC: Joi.array().label("Matérias Primas das Extrusoras B & C").min(1).required(),
        matprima_cod_A: Joi.string().label("Matéria Prima [A]").required(),
        densidade_A: Joi.number().label("Densidade [A]").required(),
        arranque_A: Joi.number().label("Arranque [A]").required(),
        matprima_cod_BC: Joi.string().label("Matéria Prima [BC]").required(),
        densidade_BC: Joi.number().label("Densidade [BC]").required(),
        arranque_BC: Joi.number().label("Arranque [BC]").required()
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

const transformData = ({ items, formulacao }) => {
    let formu_materiasprimas_A = items?.filter(v => (v.extrusora === 'A')).map(v => ({ global: v.vglobal, matprima_cod_A: v.matprima_cod, orig_matprima_cod_A: v.matprima_cod, densidade_A: v.densidade, arranque_A: v.arranque, tolerancia_A: v.tolerancia, removeCtrl: true }));
    let formu_materiasprimas_BC = items?.filter(v => (v.extrusora === 'BC')).map(v => ({ global: v.vglobal, matprima_cod_BC: v.matprima_cod, orig_matprima_cod_BC: v.matprima_cod, densidade_BC: v.densidade, arranque_BC: v.arranque, tolerancia_BC: v.tolerancia, removeCtrl: true }));
    const cliente_cod = { key: formulacao?.cliente_cod, value: formulacao?.cliente_cod, label: formulacao?.cliente_nome };
    return { ...formulacao, cliente_cod, formu_materiasprimas_A, formu_materiasprimas_BC, totalGlobal: 100 };
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
        {id === "BC" &&
            <Row style={{ border: "solid 1px #dee2e6", background: "#f8f9fa", marginTop: "5px" }} align="stretch">
                <Col xs={5} style={{ borderRight: "solid 1px #dee2e6" }}><div className={classNames(classes.center, classes.bold)}>Matérias Primas [{id}]</div></Col>
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

const Extrusora = ({ id, form, matPrimasLookup, forInput }) => {
    const classes = useStyles();

    const adjust = (idx, extrusora) => {
        const fieldValues = updateGlobals({ values: form.getFieldsValue(true), adjust: { extrusora, index: idx }, action: "adjust" });
        form.setFieldsValue(fieldValues);
    }

    return (
        <>
            <HeaderExtrusora id={id} />
            <Form.List name={`formu_materiasprimas_${id}`}>
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
                                <Row key={field.key}>
                                    <Col xs={5}>
                                        <Field name={[field.name, `matprima_cod_${id}`]} label={{ enabled: false }}>
                                            <SelectField size="small" data={matPrimasLookup} keyField="ITMREF_0" textField="ITMDES1_0" showSearch
                                                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            />
                                        </Field>
                                    </Col>
                                    <Col xs={1}><Field name={[field.name, `densidade_${id}`]} label={{ enabled: false }}><InputNumber style={{ width: "100%" }} controls={false} size="small" min={0} max={50} precision={3} step={.025} /></Field></Col>
                                    <Col xs={6}>
                                        <Row wrap='nowrap'>
                                            <Col xs={4}><Field name={[field.name, `arranque_${id}`]} label={{ enabled: false }}><InputNumber size="small" style={{ width: "100%" }} controls={false} {...(forInput && { addonBefore: <IconButton onClick={() => adjust(index, id)}><MdAdjust /></IconButton> })} addonAfter={<b>%</b>} precision={2} min={0} max={100} /></Field></Col>
                                            <Col xs={4}><Field name={[field.name, `tolerancia_${id}`]} label={{ enabled: false }}><InputNumber size="small" style={{ width: "100%" }} controls={false} addonBefore="&plusmn;" addonAfter={<b>%</b>} maxLength={4} precision={1} min={0} max={100} /></Field></Col>
                                            <Col xs={3}><div className={classNames(classes.center)}>{append(form.getFieldValue([`formu_materiasprimas_${id}`, field.name, "global"])?.toFixed(2), '%')}</div></Col>
                                            <Col xs={1}><div className={classNames(classes.center)}>{forInput && <IconButton onClick={() => removeRow(field.name, field)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton>}</div></Col>
                                        </Row>
                                    </Col>
                                </Row>
                            ))}
                            {(id == "BC" && form.getFieldValue("totalGlobal") > 0) &&
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

    const [matPrimasLookup, setMatPrimasLookup] = useState([]);
    const [formulacoesLookup, setFormulacoesLookup] = useState([]);

    const loadData = async ({ lookup = false, signal }) => {
        const { items, produto_id } = record.formulacao;
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
        setFormulacoesLookup(await loadFormulacaoesLookup({ produto_id }, signal));
        form.setFieldsValue(transformData({ items, formulacao: record?.formulacao }));
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
        const keys = ["formu_materiasprimas_A", "formu_materiasprimas_BC"];
        const v = schema({ keys }).validate(values, { abortEarly: false });
        //Verifica se existem items definidos em ambas as extrusoras
        status.error = [...status.error, ...(v.error ? v.error?.details.filter((v) => keys.includes(v.context.key)) : [])];
        status.warning = [...status.warning, ...(v.warning ? v.warning?.details.filter((v) => msgKekeysys.includes(v.context.key)) : [])];
        const _fieldStatus = { ...fieldStatus };
        if (!v.error) {
            for (const [i, x] of values.formu_materiasprimas_A.entries()) {
                const vx = schema({ excludeKeys: [...keys, 'matprima_cod_BC', 'densidade_BC', 'arranque_BC'] }).validate(x, { abortEarly: false });
                if (vx?.error) {
                    for (let k of vx?.error?.details) {
                        _fieldStatus[`${i},${k.context.key}`] = { status: "error", messages: [{ message: k.message }] };
                    }
                }
            }
            for (const [i, x] of values.formu_materiasprimas_BC.entries()) {
                const vx = schema({ excludeKeys: [...keys, 'matprima_cod_A', 'densidade_A', 'arranque_A'] }).validate(x, { abortEarly: false });
                if (vx?.error) {
                    for (let k of vx?.error?.details) {
                        _fieldStatus[`${i},${k.context.key}`] = { status: "error", messages: [{ message: k.message }] };
                    }
                }
            }
        }
        if (Object.keys(_fieldStatus).length === 0) {
            const fieldValues = updateGlobals({ values, action: "finish" });
            console.log("#############################", fieldValues)
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
            if (status.error.length === 0) {
                for (let v of fieldValues?.formu_materiasprimas_A) {
                    let matprima_des = matPrimasLookup.find(val => val.ITMREF_0 === v.matprima_cod_A)?.ITMDES1_0;
                    if (v.matprima_cod_A !== v.orig_matprima_cod_A) {

                    }
                    items.push({
                        tolerancia: v.tolerancia_A, arranque: v.arranque_A, vglobal: v.global,
                        densidade: v.densidade_A, extrusora: 'A', matprima_cod: v.matprima_cod_A,
                        doseador_A: v.doseador_A, cuba_A: v.cuba_A,
                        /*                         ...(v.matprima_cod_A === v.orig_matprima_cod_A) && { doseador_A: v.doseador_A },
                                                ...(v.matprima_cod_A === v.orig_matprima_cod_A) && { cuba_A: v.cuba_A }, */
                        matprima_des
                    });
                }
                for (let v of fieldValues?.formu_materiasprimas_BC) {
                    let matprima_des = matPrimasLookup.find(val => val.ITMREF_0 === v.matprima_cod_BC)?.ITMDES1_0;
                    items.push({
                        tolerancia: v.tolerancia_BC, arranque: v.arranque_BC, vglobal: v.global,
                        densidade: v.densidade_BC, extrusora: 'BC', matprima_cod: v.matprima_cod_BC,
                        doseador_B: v.doseador_B, doseador_C: v.doseador_C, cuba_BC: v.cuba_BC,
                        /*                         ...(v.matprima_cod_BC === v.orig_matprima_cod_BC) && { doseador_B: v.doseador_B, doseador_C: v.doseador_C },
                                                ...(v.matprima_cod_BC === v.orig_matprima_cod_BC) && { cuba_BC: v.cuba_BC }, */
                        matprima_des
                    });
                }
                const { cliente_cod: { value: cliente_cod, label: cliente_nome } = {}, source, ...vals } = values;
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
    const onValuesChange = async (changedValues, { formu_materiasprimas_A: allA = [], formu_materiasprimas_BC: allBC = [], ...values }) => {
        setIsTouched(true);
        if ('id' in changedValues) {
            const formulacao = formulacoesLookup.find(v => v.id === changedValues.id);
            const items = await getFormulacaoMateriasPrimas({ formulacao_id: changedValues.id });
            form.setFieldsValue(transformData({ items, formulacao: formulacao }));
        } else {
            const formu_materiasprimas_A = allA.filter(v => v.removeCtrl === true);
            const formu_materiasprimas_BC = allBC.filter(v => v.removeCtrl === true);
            const fieldValues = updateGlobals({ values: { ...values, formu_materiasprimas_A, formu_materiasprimas_BC }, action: "valueschange" });
            form.setFieldsValue(fieldValues);
        }
    }

    return (
        <Form form={form} name={`f-formulacao`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
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
                <Extrusora id="BC" form={form} matPrimasLookup={matPrimasLookup} forInput={forInput} />


            </FormContainer>


            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    {isTouched && <Button disabled={submitting.state} type="primary" onClick={onFinish}>Guardar</Button>}
                    <Button onClick={closeParent}>Fechar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}