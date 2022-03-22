import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace, InputAddon } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import IconButton from "components/iconButton";
import ResultMessage from 'components/resultMessage';
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, DatePicker } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import { OFabricoContext } from '../ordemFabrico/FormOFabricoValidar';

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const setId = (id) => {
    if (id) {
        return { key: "update", values: { id } };
    }
    return { key: "insert", values: {} };
}

const loadAggsLookup = async ({ produto_id, agg_id }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/tempaggofabricolookup/`, filter: { status: 0, produto_id, agg_id }, parameters: { group: false }, sort: [] });
    return rows;
}

export default ({ setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const ctx = useContext(OFabricoContext);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [changedValues, setChangedValues] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [operation, setOperation] = useState(setId(ctx.agg_id));
    const [resultMessage, setResultMessage] = useState({ status: "none" });

    const init = () => {
        const { produto_id, produto_cod, of_cod, agg_id } = ctx;
        (async () => {
            const aggsLookup = await loadAggsLookup({ produto_id, agg_id });
            (setFormTitle) && setFormTitle({ title: `Agrupar Ordens Fabrico` });
            const aggs = aggsLookup.filter(v => (v.id == agg_id || v.agg_ofid_original == v.id)).map(v => {
                return ({
                    checked: (agg_id === v.id ? 1 : 0),
                    tempof_id: v.tempof_id,
                    of_id: v.of_id,
                    artigo_cod: v.item_cod,
                    cliente_nome: v.cliente_nome,
                    iorder: v.iorder,
                    item_nome: v.item_nome,
                    enabled: (of_cod == v.of_id ? false : true)
                });
            });
            form.setFieldsValue({ aggs });
            setLoading(false);
        })();
    }

    useEffect(() => {
        init();
        return (() => { });
    }, []);

    const onValuesChange = (changedValues) => {
        setChangedValues(changedValues);
    }

    const onFinish = async (values) => {
        const response = await fetchPost({ url: `${API_URL}/savetempagg/`, parameters: { ...values, agg_id: ctx.agg_id } });
        if (response.data.status !== "error") {
            parentReload({ agg_id: ctx.agg_id }, "init");
            setSubmitting(false);
            closeParent();
        } else {
            setSubmitting(false);
            setResultMessage(response.data);
        }
    }

    const onSuccessOK = () => {
        if (operation.key === "insert") {
            setSubmitting(false);
            form.resetFields();
            init();
            setResultMessage({ status: "none" });
        }
    }

    const onErrorOK = () => {
        setSubmitting(false);
        setResultMessage({ status: "none" });
    }

    const onClose = (reload = false) => {
        closeParent();
    }
    
    const onSubmit = useCallback(() =>{
        setSubmitting(true);
        form.submit();
    },[]);

    return (
        <>
            <ResultMessage
                result={resultMessage}
                successButtonOK={operation.key === "insert" && <Button type="primary" key="goto-of" onClick={onSuccessOK}>xxxx</Button>}
                successButtonClose={<Button key="goto-close" onClick={() => onClose(true)}>Fechar</Button>}
                errorButtonOK={<Button type="primary" key="goto-ok" onClick={onErrorOK}>OK</Button>}
                errorButtonClose={<Button key="goto-close" onClick={onClose}>Fechar</Button>}
            >
                <AlertsContainer id="el-external" />
                <AlertMessages formStatus={formStatus} />
                <Form form={form} name={`fps`} onFinish={onFinish} onValuesChange={onValuesChange} component={wrapForm}>
                    <FormLayout
                        id="LAY-AGG-UPSERT"
                        guides={guides}
                        layout="vertical"
                        style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                        schema={schema}
                        field={{
                            forInput,
                            wide: [16],
                            margin: "2px", overflow: false, guides: guides,
                            label: { enabled: true, pos: "top" /* pos: (forInput ? "top" : "left"), align: (forInput ? "start" : "end"), vAlign: "center", width: "140px" */, wrap: false, overflow: false, colon: true, ellipsis: true },
                            alert: { pos: "right", tooltip: true, container: false /* container: "el-external" */ },
                            layout: { top: "", right: "", center: "", bottom: "", left: "" },
                            required: true,
                            style: { alignSelf: "center" }
                        }}
                        fieldSet={{
                            guides: guides,
                            wide: 16, margin: false, layout: "horizontal", overflow: false
                        }}
                    >
                        <Form.List name="aggs">
                            {(fields, { }) => {
                                return (
                                    <FieldSet layout="vertical" margin={false}>
                                        {fields.map((field, index) => (
                                            <FieldSet key={field.key} field={{ wide: [1] }} margin="0px 0px 3px 0px" padding="5px" style={{ border: "solid 1px #d9d9d9", borderRadius: "3px" }}>
                                                <Field forInput={true} name={[field.name, `checked`]} label={{ enabled: false }}><CheckboxField disabled={form.getFieldValue(["aggs", field.name, "enabled"]) ? false : true} /></Field>
                                                <FieldSet margin={false} wide={15} layout="vertical">
                                                    <FieldSet field={{ wide: [5, 5, 6], forViewBorder: false }} margin={false} wide={16} style={{ fontWeight: 700 }}>
                                                        <Field forInput={false} name={[field.name, `of_id`]} label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                                        <Field forInput={false} name={[field.name, `iorder`]} label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                                        <Field forInput={false} name={[field.name, `artigo_cod`]} label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                                    </FieldSet>
                                                    <FieldSet field={{ wide: [7, 9], forViewBorder: false }} margin={false} wide={16}>
                                                        <Field forInput={false} name={[field.name, `cliente_nome`]} label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                                        <Field forInput={false} name={[field.name, `item_nome`]} label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                                    </FieldSet>
                                                </FieldSet>
                                            </FieldSet>
                                        ))}
                                    </FieldSet>
                                )
                            }}
                        </Form.List>
                    </FormLayout>
                </Form>
                {parentRef && <Portal elId={parentRef.current}>
                    <Space>
                        <Button disabled={submitting} type="primary" onClick={onSubmit}>Guardar</Button>
                        {/* <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button> */}
                    </Space>
                </Portal>
                }
            </ResultMessage>
        </>
    );
}