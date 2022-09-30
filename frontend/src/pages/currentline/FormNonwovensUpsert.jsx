import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { useSubmitting, noValue } from "utils";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";

import AlertMessages from "components/alertMessages";
import ResultMessage from 'components/resultMessage';
import Portal from "components/portal";
import { Input, Space, Form, Button } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
/* import { OFabricoContext } from '../ordemFabrico/FormOFabricoValidar'; */

const schema = (keys, excludeKeys) => {
    return getSchema({
        nw_cod_sup: Joi.any().label("Nonwoven Superior").required(),
        nw_cod_inf: Joi.any().label("Nonwoven Inferiror").required()
    }, keys, excludeKeys).unknown(true);
}

const setId = (id) => {
    if (id) {
        return { key: "update", values: { id } };
    }
    return { key: "insert", values: {} };
}

const LoadMateriasPrimasLookup = async (signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimaslookup/`, filter: {}, parameters: { type: 'nonwovens' }, signal });
    return rows;
}

const loadNonwovensLookup = async ({ produto_id, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/nonwovenslookup/`, filter: { produto_id }, sort: [], signal });
    return rows;
}

export default ({ record, parentRef, closeParent, parentReload, forInput }) => {
    /* const ctx = useContext(OFabricoContext); */
    const [form] = Form.useForm();
    const submitting = useSubmitting(true);
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [operation, setOperation] = useState(setId(record.nonwovens_id));
    const [matPrimasLookup, setMatPrimasLookup] = useState();
    const [fieldStatus, setFieldStatus] = useState({});
    const [nonwovensLookup, setNonwovensLookup] = useState();
    const [isTouched, setIsTouched] = useState(false);

    const transformData = (values) => {
        if (values) {
            const nw_cod_inf = {
                value: values.nw_cod_inf,
                label: values.nw_des_inf.trim()
            };
            const nw_cod_sup = {
                value: values.nw_cod_sup,
                label: values.nw_des_sup.trim()
            };
            form.setFieldsValue({ id: values.id, nw_cod_inf, nw_cod_sup });
        }
    }

    const init = async ({ signal }) => {
        const _matPrimas = await LoadMateriasPrimasLookup(signal);
        setMatPrimasLookup(_matPrimas);
        setNonwovensLookup(await loadNonwovensLookup({ produto_id: record.nonwovens.produto_id, signal }));
        console.log(record)
        transformData(record?.nonwovens);
        submitting.end();
    }




    useEffect(() => {
        const controller = new AbortController();
        init({ signal: controller.signal });
        return (() => { controller.abort(); });
    }, []);

    const onFinish = async (values) => {
        submitting.trigger();
        //const values = form.getFieldsValue(true);
        //const v = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        const { errors, warnings, value, ...status } = getStatus();
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        console.log("values",values,record)
        const vals = {
            "nw_cod_inf": values.nw_cod_inf.value,
            "nw_cod_sup": values.nw_cod_sup.value,
            "nw_des_inf": values.nw_cod_inf.label,
            "nw_des_sup": values.nw_cod_sup.label,
            "produto_id": record.nonwovens.produto_id
        }
        if (errors === 0) {
            try {
                const response = await fetchPost({ url: `${API_URL}/updatecurrentsettings/`, filter: { csid: record.id }, parameters: { type: `nonwovens`, nonwovens: { ...vals } } });
                if (response.data.status !== "error") {
                    Modal.success({ title: "Nonwovens alterados com sucesso!", onOk: () => { parentReload(); closeParent(); } })
                } else {
                    status.error.push({ message: response.data.title });
                    setFormStatus({ ...status });
                }
            } catch (e) {
                console.log(status)
                status.formStatus.error.push({ message: e.message });
                setFormStatus({ ...status.formStatus });
            }
        }
        submitting.end();
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

    const onSubmit = useCallback(async () => {
        setSubmitting(true);
        onFinish(form.getFieldsValue(true));
    }, []);


    const onValuesChange = async (changedValues, allValues) => {
        if (!isTouched) {
            setIsTouched(true);
        }
        if ("id" in changedValues) {
            transformData(nonwovensLookup.find(v => v.id == changedValues["id"]));
        }
    }

    return (
        <>
            <Form form={form} name={`f-nonwovens`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
                <FormContainer id="FRM-NONWOVENS" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} style={{ marginTop: "5px" }} schema={schema} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }} forInput={forInput}>
                    <Row style={{ border: "solid 1px #dee2e6", background: "#f8f9fa", padding: "5px" }}>
                        <Col>
                            <Field name="id" label={{ enabled: false, text: "Nonwovens", pos: "left" }}>
                                <SelectField size="small" data={nonwovensLookup} keyField="id" textField="designacao"
                                    optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ minWidth: "150px" }}><b>{d[textField]}</b></div><div>v.{d["versao"]}</div></div>, value: d[keyField] })}
                                />
                            </Field>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Field name="nw_cod_sup" label={{ enabled: true, text: "Nonwoven Superior", pos: "top" }}>
                                <SelectField size="small" data={matPrimasLookup} keyField="ITMREF_0" textField="ITMDES1_0"
                                    optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                    showSearch
                                    labelInValue
                                    filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                />
                            </Field>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Field name="nw_cod_inf" label={{ enabled: true, text: "Nonwoven Inferior", pos: "top" }}>
                                <SelectField size="small" data={matPrimasLookup} keyField="ITMREF_0" textField="ITMDES1_0"
                                    optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                    showSearch
                                    labelInValue
                                    filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                />
                            </Field>
                        </Col>
                    </Row>
                </FormContainer>
                {parentRef && <Portal elId={parentRef.current}>
                    <Space>
                        {isTouched && <Button disabled={submitting.state} type="primary" onClick={()=>form.submit()}>Guardar</Button>}
                        <Button onClick={closeParent}>Fechar</Button>
                    </Space>
                </Portal>
                }
            </Form>
        </>
    );
}