import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace, InputAddon } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import IconButton from "components/iconButton";
import ResultMessage from 'components/resultMessage';
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, DatePicker } from "antd";
import { PlusOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { MdAdjust } from 'react-icons/md';
import { CgCloseO } from 'react-icons/cg';
import { DATE_FORMAT, DATETIME_FORMAT, GAMAOPERATORIA } from 'config';
const gamaOperatoriaItems = GAMAOPERATORIA.filter(v => !v?.disabled);

const schema = (keys, excludeKeys) => {
    return getSchema({
        //designacao: Joi.string().label("Designação").required()
    }, keys, excludeKeys).unknown(true);
}

const setId = (id) => {
    if (id) {
        return { key: "update", values: { id } };
    }
    return { key: "insert", values: {} };
}

const loadGamasOperatoriasLookup = async ({ produto_id, token }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/gamasoperatoriaslookup/`, filter: { produto_id }, sort: [], cancelToken: token });
    return rows;
}
const getGamaOperatoriaItems = async ({ gamaoperatoria_id, token }) => {
    if (!gamaoperatoria_id) {
        return [];
    }
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/gamaoperatoriaitemsget/`, filter: { gamaoperatoria_id }, sort: [], cancelToken: token });
    return rows;
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [changedValues, setChangedValues] = useState({});
    const [isTouched, setIsTouched] = useState(false);
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [operation, setOperation] = useState(setId(record.gamaoperatoria.id));
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    const [gamasOperatorias, setGamasOperatorias] = useState([]);


    const transformData = ({ items, gamaoperatoria }) => {
        const fieldsValue = { nitems: items.length };
        for (let [i, v] of items.entries()) {
            fieldsValue[`key-${i}`] = v.item_key;
            fieldsValue[`des-${i}`] = v.item_des;
            fieldsValue[`tolerancia-${i}`] = v.tolerancia;
            const vals = (typeof v.item_values === "string") ? JSON.parse(v.item_values) : v.item_values;
            for (let [iV, vV] of vals.entries()) {
                fieldsValue[`v${v.item_key}-${iV}`] = vV;
            }
        }
        return { ...gamaoperatoria, ...fieldsValue };
    }

    const init = (lookup = false, token) => {
        (async () => {
            if (lookup) {

            }
            if (operation.key === "update") {
                (setFormTitle) && setFormTitle({ title: `Gama Operatória` });
                const { items, ...gamaoperatoria } = record.gamaoperatoria;
                setGamasOperatorias(await loadGamasOperatoriasLookup({ produto_id: gamaoperatoria.produto_id, token }));
                form.setFieldsValue(transformData({ items, gamaoperatoria }));
            }
            setLoading(false);
        })();
    }

    useEffect(() => {
        const cancelFetch = cancelToken();
        init(true, cancelFetch);
        return (() => cancelFetch.cancel("Form Gama Operatória Cancelled"));
    }, []);

    const onValuesChange = async (changedValues) => {
        setIsTouched(true);
        if ('id' in changedValues) {
            const gamaoperatoria = gamasOperatorias.find(v=>v.id===changedValues.id);
            const items = await getGamaOperatoriaItems({ gamaoperatoria_id: changedValues.id });
            form.setFieldsValue(transformData({ items, gamaoperatoria }));
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
                if (k !== 'designacao' && values[k] === undefined) {
                    error = true;
                    break;
                }
            }
            if (error) {
                status.error.push({ message: "Os items da Gama Operatória têm de estar preenchidos!" });
            }
            if (status.error.length === 0) {
                const response = await fetchPost({ url: `${API_URL}/updatecurrentsettings/`, filter: { csid: record.id }, parameters: { type: 'gamaoperatoria', gamaoperatoria: { ...form.getFieldsValue(true), produto_id: record.gamaoperatoria.produto_id } } });
                setResultMessage(response.data);
                if (response.data.status !== "error") {
                    throw 'TODO RELOAD PARENT'
                    //parentReload({ formulacao_id: record.formulacao.id }, "init");
                }
                // //const response = await fetchPost({ url: `${API_URL}/newgamaoperatoria/`, parameters: { ...form.getFieldsValue(true), produto_id: record.gamaoperatoria.produto_id } });
                // if (response.data.status !== "error") {
                //     parentReload({ gamaoperatoria_id: record.gamaoperatoria_id }, "init");
                // }
                // setResultMessage(response.data);
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
                successButtonOK={operation.key === "insert" && <Button type="primary" key="goto-of" onClick={onSuccessOK}>Criar Nova Gama Operatória</Button>}
                successButtonClose={<Button key="goto-close" onClick={() => onClose(true)}>Fechar</Button>}
                errorButtonOK={<Button type="primary" key="goto-ok" onClick={onErrorOK}>OK</Button>}
                errorButtonClose={<Button key="goto-close" onClick={onClose}>Fechar</Button>}
            >
                <AlertsContainer id="el-external" />
                <AlertMessages formStatus={formStatus} />
                <Form form={form} name={`fps`} onFinish={onFinish} onValuesChange={onValuesChange} component={wrapForm}>
                    <FormLayout
                        id="LAY-GAMAOPERATORIA-UPSERT"
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
                        {forInput && <FieldSet wide={16}>
                            <Toolbar
                                style={{ width: "100%" }}
                                left={
                                    <FieldSet>
                                        <Field name="id" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: false, text: "Gama Operatória", pos: "left" }}>
                                            <SelectField size="small" data={gamasOperatorias} keyField="id" textField="designacao"
                                                optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ minWidth: "150px" }}><b>{d[textField]}</b></div><div>v.{d["versao"]}</div></div>, value: d[keyField] })}
                                            />
                                        </Field>
                                    </FieldSet>
                                }
                            />
                        </FieldSet>
                        }
                        <FieldSet wide={16} margin={false} layout="vertical">
                            {gamaOperatoriaItems.map((v, idx) =>
                                <FieldSet key={`gop-${idx}`} wide={16} field={{ wide: [5, 9, 2] }} margin={false}>
                                    <FieldItem label={{ enabled: false }} style={{ fontSize: "11px" }}>
                                        <b>{v.designacao}</b> ({v.unidade})
                                    </FieldItem>
                                    <FieldSet wide={9} margin={false}>
                                        {[...Array(v.nvalues)].map((x, i) =>
                                            <Field split={9} key={`${v.key}-${i}`} name={`v${v.key}-${i}`} label={{ enabled: false }}>
                                                <InputNumber min={v.min} max={v.max} controls={false} size="small" precision={v?.precision} />
                                            </Field>
                                        )}
                                    </FieldSet>
                                    <Field name={`tolerancia-${idx}`} label={{ enabled: false }}><InputNumber style={{ maxWidth: "70px" }} addonBefore="&plusmn;" min={0} max={100} controls={false} size="small" /></Field>
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