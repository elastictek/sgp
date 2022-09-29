import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import Toolbar from "components/toolbar";

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

const LoadMateriasPrimasLookup = async (token) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimaslookup/`, filter: {}, parameters: { type: 'nonwovens' }, cancelToken: token });
    return rows;
}

const loadNonwovensLookup = async ({ produto_id, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/nonwovenslookup/`, filter: { produto_id }, sort: [], signal });
    return rows;
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput, changedValues, parentLoading }) => {
    /* const ctx = useContext(OFabricoContext); */
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [operation, setOperation] = useState(setId(record.nonwovens_id));
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    const [matPrimasLookup, setMatPrimasLookup] = useState();
    const [fieldStatus, setFieldStatus] = useState({});
    const [nonwovensLookup, setNonwovensLookup] = useState();

    const init = async (data = {}, lookup = false, token) => {
        setNonwovensLookup(await loadNonwovensLookup({ produto_id: record.nonwovens.produto_id, token }));
        if (record?.nonwovens) {
            const nw_cod_inf = {
                value: record.nonwovens.nw_cod_inf,
                label: record.nonwovens.nw_des_inf
            };
            const nw_cod_sup = {
                value: record.nonwovens.nw_cod_sup,
                label: record.nonwovens.nw_des_sup
            };
            form.setFieldsValue({ nw_cod_inf, nw_cod_sup });
        }


        /* const { nonwovens } = record;
        const { nonwovens_id, token } = data;
        (async () => {
            let _matPrimas = null;
            if (lookup || !matPrimasLookup) {
                _matPrimas = await LoadMateriasPrimasLookup(token);
                setMatPrimasLookup(_matPrimas);
            }
            let nData = {};
            if (nonwovens_id) {
                if (!_matPrimas) {
                    _matPrimas = matPrimasLookup;
                }

                let [n] = nonwovens.filter(v => v.id === nonwovens_id);
                if (n) {
                    nData = {
                        nw_cod_sup: { key: n.nw_cod_sup, value: n.nw_cod_sup, label: n.nw_des_sup },
                        nw_cod_inf: { key: n.nw_cod_inf, value: n.nw_cod_inf, label: n.nw_des_inf },
                        designacao: n.designacao
                    };
                }
            }
 */
        /* if (operation.key === "update") {
            (setFormTitle) && setFormTitle({ title: `Editar Nonwovens ${ctx.item_cod}`, subTitle: `${ctx.item_nome}` });
        } else {
            (setFormTitle) && setFormTitle({ title: `Definir Nonwovens ${ctx.item_cod}`, subTitle: `${ctx.item_nome}` });
        } */
        //form.setFieldsValue(nData);
        //})();
    }




    useEffect(() => {
        const controller = new AbortController();
        init({ signal:controller.signal });
        return (() => { controller.abort(); });
    }, []);

    const onFinish = async (values) => {
        const status = { error: [], warning: [], info: [], success: [] };
        const msgKeys = [];
        const v = schema().validate(values, { abortEarly: false });
        status.error = [...status.error, ...(v.error ? v.error?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        status.warning = [...status.warning, ...(v.warning ? v.warning?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        if (v.error) {
            status.error.push({ message: "OS Nonwovens Superior e Inferior têm de estar preenchidos!" });
            setSubmitting(false);
        }

        if (status.error.length === 0) {
            const { nw_cod_sup: { value: nw_cod_sup, label: nw_des_sup } = {} } = values;
            const { nw_cod_inf: { value: nw_cod_inf, label: nw_des_inf } = {} } = values;
            const response = await fetchPost({ url: `${API_URL}/newartigononwovens/`, parameters: { ...values, id: record?.nonwovens_id, produto_id: ctx.produto_id, nw_cod_sup, nw_des_sup, nw_cod_inf, nw_des_inf } });
            if (response.data.status !== "error") {
                parentReload({}, "lookup");
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

    const onSubmit = useCallback(async () => {
        setSubmitting(true);
        onFinish(form.getFieldsValue(true));
    }, []);


    const onValuesChange = async (changedValues, allValues) => {
        console.log("---------------------",changedValues,nonwovensLookup);
    }

    return (
        <>
            <Form form={form} name={`f-nonwovens`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
                <FormContainer id="FRM-NONWOVENS" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} style={{ marginTop: "5px" }} schema={schema} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }} forInput={forInput}>
                    <Row style={{ border: "solid 1px #dee2e6", background: "#f8f9fa", padding: "5px" }}>
                        <Col>
                            <Field name="id" label={{ enabled: false, text: "Formulação", pos: "left" }}>
                                <SelectField size="small" data={nonwovensLookup} keyField="id" textField="designacao"
                                    optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ minWidth: "150px" }}><b>{d[textField]}</b></div><div>v.{d["versao"]}</div></div>, value: d[keyField] })}
                                />
                            </Field>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Field name="nw_cod_sup" label={{ enabled: true, text: "Nonwoven Superior", pos: "top" }}>
                                <SelectField size="small" keyField="ITMREF_0" textField="ITMDES1_0"
                                    //optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
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
                                <SelectField size="small" keyField="ITMREF_0" textField="ITMDES1_0"
                                    //optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                    showSearch
                                    labelInValue
                                    filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                />
                            </Field>
                        </Col>
                    </Row>
                </FormContainer>
            </Form>
        </>
    );
}