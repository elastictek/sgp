import React, { useEffect, useState, useCallback, useRef, useMemo, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace, InputAddon, SelectDebounceField } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import ResultMessage from 'components/resultMessage';
import Portal from "components/portal";
import Toolbar from "components/toolbar";
import { Input, Space, Form, Button, InputNumber, DatePicker, Select, Spin } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT, ARTIGOS_SPECS } from 'config';
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
const loadArtigosSpecsLookup = async ({ produto_id, token }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/artigosspecslookup/`, filter: { produto_id }, sort: [], cancelToken: token });
    return rows;
}
const getArtigoSpecsItems = async ({ artigospecs_id, token }) => {
    if (!artigospecs_id) {
        return [];
    }
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/artigospecsitemsget/`, filter: { artigospecs_id }, sort: [], cancelToken: token });
    return rows;
}
export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [isTouched, setIsTouched] = useState(false);
    const [changedValues, setChangedValues] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [operation, setOperation] = useState(setId(record.artigospecs.id));
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    const [customerLookup, setCustomerLookup] = useState([]);
    const [artigosSpecs, setArtigosSpecs] = useState([]);

    const transformData = ({ items, artigospecs }) => {
        const fieldsValue = { nitems: items.length };
        for (let [i, v] of items.entries()) {
            fieldsValue[`key-${i}`] = v.item_key;
            fieldsValue[`des-${i}`] = v.item_des;
            fieldsValue[`nv-${i}`] = v.item_nvalues;
            const vals = (typeof v.item_values === "string") ? JSON.parse(v.item_values) : v.item_values;
            for (let [iV, vV] of vals.entries()) {
                fieldsValue[`v${v.item_key}-${iV}`] = vV;
            }
        }
        const cliente_cod = { key: artigospecs?.cliente_cod, value: artigospecs?.cliente_cod, label: artigospecs?.cliente_nome };
        return { ...artigospecs, ...fieldsValue, cliente_cod };
    }

    const init = (lookup = false, token) => {
        (async () => {
            if (lookup) {

            }
            if (operation.key === "update") {
                (setFormTitle) && setFormTitle({ title: `Editar Especificações` });
                const { items, ...artigospecs } = record.artigospecs;
                setArtigosSpecs(await loadArtigosSpecsLookup({ produto_id: artigospecs.produto_id, token }));
                form.setFieldsValue(transformData({ items, artigospecs }));
            }
            setLoading(false);
        })();
    }

    useEffect(() => {
        console.log("PARENTREF......",parentRef)
        const cancelFetch = cancelToken();
        init(true, cancelFetch);
        return (() => cancelFetch.cancel("Form Specs Cancelled"));

    }, [record]);

    const onValuesChange = async (changedValues) => {
        setIsTouched(true);
        if ('id' in changedValues) {
            const artigospecs = artigosSpecs.find(v=>v.id===changedValues.id);
            const artigoSpecsItems = await getArtigoSpecsItems({ artigospecs_id: changedValues.id });
            form.setFieldsValue(transformData({ items:artigoSpecsItems, artigospecs }));
        }
        setChangedValues(changedValues);
    }

    const onFinish = async (values) => {
        if (!isTouched) {
            return;
        }
        const status = { error: [], warning: [], info: [], success: [] };
        const v = schema().validate(values, { abortEarly: false });
        if (!v.error) {
            let error = false;
            for (let k in values) {
                if ((values[k] === undefined || values[k] === null) && k !== "cliente_cod" && k !== "designacao") {
                    error = true;
                    break;
                }
            }
            if (error) {
                status.error.push({ message: "Os items têm de estar preenchidos!" });
            }
            if (status.error.length === 0) {
                const { cliente_cod: { value: cliente_cod, label: cliente_nome } = {} } = values;
                const response = await fetchPost({ url: `${API_URL}/updatecurrentsettings/`, filter: { csid: record.id }, parameters: { type: 'specs', specs: { ...form.getFieldsValue(true), produto_id: record.artigospecs.produto_id, cliente_cod, cliente_nome } } });
                setResultMessage(response.data);
                if (response.data.status !== "error") {
                    //throw 'TODO RELOAD PARENT'
                    //parentReload({ formulacao_id: record.formulacao.id }, "init");
                }
                /* const { cliente_cod: { value: cliente_cod, label: cliente_nome } = {} } = values;
                const response = await fetchPost({ url: `${API_URL}/newartigospecs/`, parameters: { ...form.getFieldsValue(true), produto_id: record.formulacao.produto_id, cliente_cod, cliente_nome } });
                if (response.data.status !== "error") {
                    parentReload({ artigospecs_id: record.artigospecs_id }, "init");
                }
                setResultMessage(response.data); */
            }
        }
        setFormStatus(status);
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
                            <FieldSet>
                                <Toolbar
                                    style={{ width: "100%" }}
                                    left={
                                        <FieldSet>
                                            <Field name="id" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: false, text: "Especificações", pos: "left" }}>
                                                <SelectField size="small" data={artigosSpecs} keyField="id" textField="designacao"
                                                    optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ minWidth: "150px" }}><b>{d[textField]}</b></div><div>v.{d["versao"]}</div></div>, value: d[keyField] })}
                                                />
                                            </Field>
                                        </FieldSet>
                                    }
                                    right={<div style={{ display: "flex", flexDirection: "row" }}>
                                        <FieldSet style={{ minWidth: "300px" }} margin={false} field={{ wide: [16] }}>
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
                                    </div>}
                                />
                            </FieldSet>
                            <VerticalSpace height="12px" />
                        </>
                        }
                        {!forInput && <>
                            <FieldSet margin={false} field={{ wide: [16] }}>
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
                            <VerticalSpace height="12px" />
                        </>
                        }
                        <FieldSet wide={16} margin={false} layout="vertical">
                            <FieldSet margin={false}>
                                <FieldItem label={{ enabled: false }} wide={7}></FieldItem>
                                <FieldSet wide={9} margin={false} style={{ minWidth: "185px" }}>
                                    <FieldItem label={{ enabled: false }} split={3}><div style={{ textAlign: "center", fontWeight: 700 }}>TDS</div></FieldItem>
                                    <FieldItem label={{ enabled: false }} split={50}></FieldItem>
                                    <FieldItem label={{ enabled: false }} split={3}><div style={{ textAlign: "center", fontWeight: 700 }}>Objetivo</div></FieldItem>
                                </FieldSet>
                            </FieldSet>
                            <FieldSet margin={false}>
                                <FieldItem label={{ enabled: false }} wide={7}></FieldItem>
                                <FieldSet wide={9} margin={false} style={{ minWidth: "185px" }}>
                                    <FieldItem label={{ enabled: false }} split={6}><div style={{ textAlign: "center" }}>Min.</div></FieldItem>
                                    <FieldItem label={{ enabled: false }} split={6}><div style={{ textAlign: "center" }}>Máx.</div></FieldItem>
                                    <FieldItem label={{ enabled: false }} split={50}></FieldItem>
                                    <FieldItem label={{ enabled: false }} split={6}><div style={{ textAlign: "center" }}>Min.</div></FieldItem>
                                    <FieldItem label={{ enabled: false }} split={6}><div style={{ textAlign: "center" }}>Máx.</div></FieldItem>
                                </FieldSet>
                            </FieldSet>
                            {artigoSpecsItems.map((v, idx) =>
                                <FieldSet key={`gop-${idx}`} wide={16} field={{ wide: [7, 9] }} margin={false}>
                                    <FieldItem label={{ enabled: false }} style={{ fontSize: "11px" }}>
                                        <b>{v.designacao}</b> ({v.unidade})
                                    </FieldItem>
                                    <FieldSet wide={9} margin={false} style={{ minWidth: "185px", ...(!forInput && {fontSize:"10px"}) }}>
                                        {[...Array(form.getFieldValue(`nv-${idx}`))].map((x, i) => {
                                            if (i % 2 === 0 && i !== 0) {
                                                return (
                                                    <React.Fragment key={`${v.key}-${i}`}>
                                                        <FieldItem label={{ enabled: false }} split={50}></FieldItem>
                                                        <Field split={6} key={`${v.key}-${i}`} name={`v${v.key}-${i}`} label={{ enabled: false }}>
                                                            <InputNumber min={v.min} max={v.max} controls={false} size="small" precision={v?.precision} />
                                                        </Field>
                                                    </React.Fragment>
                                                );
                                            }
                                            return (
                                                <Field split={6} key={`${v.key}-${i}`} name={`v${v.key}-${i}`} label={{ enabled: false }}>
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
                        {isTouched && <Button type="primary" onClick={() => onFinish(form.getFieldsValue(true))}>Guardar</Button>}
                        <Button onClick={onClose}>Fechar</Button>
                    </Space>
                </Portal>
                }
            </ResultMessage>
        </>
    );
}