import React, { useEffect, useState, useCallback, useRef, useMemo, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace, InputAddon, SelectDebounceField } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import ResultMessage from 'components/resultMessage';
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, DatePicker, Select, Spin } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT, ARTIGOS_SPECS } from 'config';
import { OFabricoContext } from '../ordemFabrico/FormOFabricoValidar';
const artigoSpecsItems = ARTIGOS_SPECS.filter(v => !v?.disabled);

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const setId = (id) => {
    if (id) {
        return { key: "update", values: { id } };
    }
    return { key: "insert", values: {} };
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
    const [operation, setOperation] = useState(setId(record.artigospecs_id));
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    const [customerLookup, setCustomerLookup] = useState([]);

    const init = (lookup = false) => {
        (async () => {
            if (lookup) {

            }
            if (operation.key === "update") {
                (setFormTitle) && setFormTitle({ title: `Editar Especificações` });
                form.setFieldsValue({ ...record.artigoSpecs, ...record.artigoSpecsItems });
            } else {
                (setFormTitle) && setFormTitle({ title: `Novas Especificações ${ctx.item_cod}`, subTitle: `${ctx.item_nome}` });
                const initValues = {};
                initValues[`nitems`] = artigoSpecsItems.length;
                for (let [idx, v] of artigoSpecsItems.entries()) {
                    initValues[`key-${idx}`] = v.key;
                    initValues[`des-${idx}`] = v.designacao;
                    initValues[`nv-${idx}`] = v.nvalues;
                }
                form.setFieldsValue(initValues);
            }
            setLoading(false);
        })();
    }

    useEffect(() => {
        init(true);
    }, []);

    const onValuesChange = (changedValues) => {
        setChangedValues(changedValues);
    }

    const onFinish = async (values) => {
        const status = { error: [], warning: [], info: [], success: [] };
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
        setFormStatus(status);
    }

    const onSuccessOK = () => {
        if (operation.key === "insert") {
            form.resetFields();
            init();
            setSubmitting(false);
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
                successButtonOK={operation.key === "insert" && <Button type="primary" key="goto-of" onClick={onSuccessOK}>Criar Novas Especificações</Button>}
                successButtonClose={<Button key="goto-close" onClick={() => onClose(true)}>Fechar</Button>}
                errorButtonOK={<Button type="primary" key="goto-ok" onClick={onErrorOK}>OK</Button>}
                errorButtonClose={<Button key="goto-close" onClick={onClose}>Fechar</Button>}
            >
                <AlertsContainer id="el-external" />
                <AlertMessages formStatus={formStatus} />
                <Form form={form} name={`fps`} onFinish={onFinish} onValuesChange={onValuesChange} component={wrapForm}>
                    <FormLayout
                        id="LAY-SPECS-UPSERT"
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
                        <FieldSet wide={16} margin={false} layout="vertical">
                            <FieldSet margin={false}>
                                <FieldItem label={{ enabled: false }} wide={7}></FieldItem>
                                <FieldSet wide={9} margin={false}>
                                    <FieldItem label={{ enabled: false }} split={4.5}><div style={{ textAlign: "center", fontWeight:700 }}>TDS</div></FieldItem>
                                    <FieldItem label={{ enabled: false }} split={50}></FieldItem>
                                    <FieldItem label={{ enabled: false }} split={4.5}><div style={{ textAlign: "center", fontWeight:700 }}>Objetivo</div></FieldItem>
                                </FieldSet>
                            </FieldSet>
                            <FieldSet margin={false}>
                                <FieldItem label={{ enabled: false }} wide={7}></FieldItem>
                                <FieldSet wide={9} margin={false}>
                                    <FieldItem label={{ enabled: false }} split={9}><div style={{ textAlign: "center" }}>Min.</div></FieldItem>
                                    <FieldItem label={{ enabled: false }} split={9}><div style={{ textAlign: "center" }}>Máx.</div></FieldItem>
                                    <FieldItem label={{ enabled: false }} split={50}></FieldItem>
                                    <FieldItem label={{ enabled: false }} split={9}><div style={{ textAlign: "center" }}>Min.</div></FieldItem>
                                    <FieldItem label={{ enabled: false }} split={9}><div style={{ textAlign: "center" }}>Máx.</div></FieldItem>
                                </FieldSet>
                            </FieldSet>
                            {artigoSpecsItems.map((v, idx) =>
                                <FieldSet key={`gop-${idx}`} wide={16} field={{ wide: [7, 9] }} margin={false}>
                                    <FieldItem label={{ enabled: false }} style={{ fontSize: "11px" }}>
                                        <b>{v.designacao}</b> ({v.unidade})
                                    </FieldItem>
                                    <FieldSet wide={9} margin={false}>
                                        {[...Array(form.getFieldValue(`nv-${idx}`))].map((x, i) => {
                                            if (i % 2 === 0 && i !==0) {
                                                return (
                                                    <React.Fragment key={`${v.key}-${i}`}>
                                                        <FieldItem label={{ enabled: false }} split={50}></FieldItem>
                                                        <Field split={9} key={`${v.key}-${i}`} name={`v${v.key}-${i}`} label={{ enabled: false }}>
                                                            <InputNumber min={v.min} max={v.max} controls={false} size="small" precision={v?.precision} />
                                                        </Field>
                                                    </React.Fragment>
                                                );
                                            }
                                            return (
                                                <Field split={9} key={`${v.key}-${i}`} name={`v${v.key}-${i}`} label={{ enabled: false }}>
                                                    <InputNumber min={v.min} max={v.max} controls={false} size="small" precision={v?.precision} />
                                                </Field>
                                            );
                                        }
                                        )}
                                    </FieldSet>
                                </FieldSet>
                            )}
                        </FieldSet>

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