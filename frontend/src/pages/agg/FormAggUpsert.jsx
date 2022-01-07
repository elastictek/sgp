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

const loadAggsLookup = async ({ produto_id }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/tempaggofabricolookup/`, filter: { status: 0, produto_id }, parameters: { group: false }, sort: [] });
    return rows;
}

export default ({ setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const ctx = useContext(OFabricoContext);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [changedValues, setChangedValues] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [operation, setOperation] = useState(setId(ctx.agg_id));
    const [resultMessage, setResultMessage] = useState({ status: "none" });

    const init = () => {
        const { produto_id, produto_cod, of_cod, agg_id } = ctx;
        (async () => {
            const aggsLookup = await loadAggsLookup({ produto_id });
            (setFormTitle) && setFormTitle({ title: `Agrupar Ordens Fabrico` });
            const aggs = aggsLookup.filter(v => (v.id == agg_id || v.agg_ofid_original == v.id)).map(v => {
                return ({
                    checked: (agg_id === v.id ? 1 : 0),
                    tempof_id: v.tempof_id,
                    of_id: v.of_id,
                    artigo_cod: v.item_cod,
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
            closeParent();
        } else {
            setResultMessage(response.data);
        }
        //setResultMessage(response.data);


        /* const status = { error: [], warning: [], info: [], success: [] };
        const msgKeys = [];
        const v = schema().validate(values, { abortEarly: false });
        status.error = [...status.error, ...(v.error ? v.error?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        status.warning = [...status.warning, ...(v.warning ? v.warning?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        if (!v.error) {
        }

        if (status.error.length === 0) {
            const { nw_cod_sup: { value: nw_cod_sup, label: nw_des_sup } = {} } = values;
            const { nw_cod_inf: { value: nw_cod_inf, label: nw_des_inf } = {} } = values;
            const response = await fetchPost({ url: `${API_URL}/newartigononwovens/`, parameters: { ...values, produto_id: record.produto_id, nw_cod_sup, nw_des_sup, nw_cod_inf, nw_des_inf } });
            setResultMessage(response.data);
        }
        setFormStatus(status); */
        throw "TODO - RELOAD PARENT...";

        /* const response = await fetchPost({ url: `${API_URL}/newformulacao/`, parameters: { ...values, artigo_cod: record.item_cod } });
        if (operation.key === "update") {
            parentReload({ formulacao_id: operation.values.id });
        } else {
            parentReload({}, "lookup");
        }
        setResultMessage(response.data); */
        //throw "TODO - CHECK VALIDATION ERRORS...";
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
                                    <FieldSet layout="vertical">
                                        {fields.map((field, index) => (
                                            <FieldSet key={field.key} field={{ wide: [1, 4, 4] }}>
                                                <Field forInput={true} name={[field.name, `checked`]} label={{ enabled: false }}><CheckboxField disabled={form.getFieldValue(["aggs", field.name, "enabled"]) ? false : true} /></Field>
                                                <Field forInput={false} name={[field.name, `of_id`]} label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                                <Field forInput={false} name={[field.name, `artigo_cod`]} label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
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
                        <Button type="primary" onClick={() => form.submit()}>Guardar</Button>
                        <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button>
                    </Space>
                </Portal>
                }
            </ResultMessage>
        </>
    );
}