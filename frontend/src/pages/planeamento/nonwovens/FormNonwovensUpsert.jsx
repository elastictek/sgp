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
import ResultMessage from 'components/resultMessage';
import Portal from "components/portal";
import { Input, Space, Form, Button } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import { OFabricoContext } from '../ordemFabrico/FormOFabricoValidar';

const schema = (keys, excludeKeys) => {
    return getSchema({
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

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput, changedValues, parentLoading }) => {
    const ctx = useContext(OFabricoContext);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [operation, setOperation] = useState(setId(record.nonwovens_id));
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    const [matPrimasLookup, setMatPrimasLookup] = useState();

    const init = (data = {}, lookup = false) => {
        const { nonwovens } = record;
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

            if (operation.key === "update") {
                (setFormTitle) && setFormTitle({ title: `Editar Nonwovens ${ctx.item_cod}`, subTitle: `${ctx.item_nome}` });
            } else {
                (setFormTitle) && setFormTitle({ title: `Definir Nonwovens ${ctx.item_cod}`, subTitle: `${ctx.item_nome}` });
            }
            form.setFieldsValue(nData);
        })();
    }

    useEffect(() => {
        const cancelFetch = cancelToken();
        if (!changedValues) {
            init({ nonwovens_id: record.nonwovens_id, token: cancelFetch });
        }
        return (() => cancelFetch.cancel("Form Nonwovens Upsert Cancelled"));
    }, []);

    useEffect(() => {
        const cancelFetch = cancelToken();
        if (changedValues && !parentLoading) {
            if ("nonwovens_id" in changedValues) {
                init({ nonwovens_id: changedValues.nonwovens_id, token: cancelFetch });
            } else {
                init({ nonwovens_id: record.nonwovens_id, token: cancelFetch });
            }
        }
        return (() => cancelFetch.cancel("Form Nonwovens Upsert Cancelled"));
    }, [changedValues, parentLoading]);

    const onFinish = async (values) => {
        const status = { error: [], warning: [], info: [], success: [] };
        const msgKeys = [];
        const v = schema().validate(values, { abortEarly: false });
        status.error = [...status.error, ...(v.error ? v.error?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        status.warning = [...status.warning, ...(v.warning ? v.warning?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        if (!v.error) {
        }

        if (status.error.length === 0) {
            const { nw_cod_sup: { value: nw_cod_sup, label: nw_des_sup } = {} } = values;
            const { nw_cod_inf: { value: nw_cod_inf, label: nw_des_inf } = {} } = values;
            const response = await fetchPost({ url: `${API_URL}/newartigononwovens/`, parameters: { ...values, produto_id: ctx.produto_id, nw_cod_sup, nw_des_sup, nw_cod_inf, nw_des_inf } });
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
                successButtonOK={operation.key === "insert" && <Button type="primary" key="goto-of" onClick={onSuccessOK}>Definir Nonwovens</Button>}
                successButtonClose={<Button key="goto-close" onClick={() => onClose(true)}>Fechar</Button>}
                errorButtonOK={<Button type="primary" key="goto-ok" onClick={onErrorOK}>OK</Button>}
                errorButtonClose={<Button key="goto-close" onClick={onClose}>Fechar</Button>}
            >
                <AlertsContainer id="el-external" />
                <AlertMessages formStatus={formStatus} />
                <Form form={form} name={`fps`} onFinish={onFinish} /* onValuesChange={onValuesChange} */ component={wrapForm}>
                    <FormLayout
                        id="LAY-NONWOVENS-UPSERT"
                        guides={guides}
                        layout="vertical"
                        style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                        schema={schema}
                        field={{
                            forInput,
                            wide: [16],
                            margin: "2px", overflow: false, guides: guides,
                            label: { enabled: true, pos: "top" /* pos: (forInput ? "top" : "left"), align: (forInput ? "start" : "end"), vAlign: "center", width: "140px" */, wrap: false, overflow: false, colon: false, ellipsis: true },
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
                        {forInput && <>
                            <FieldSet margin={false} field={{ wide: [6, 4] }}>
                                <Field name="designacao" label={{ enabled: false }}><Input placeholder="Designação" size="small" /></Field>
                            </FieldSet>
                            <VerticalSpace height="12px" />
                        </>
                        }


                        <Field wide={10} name="nw_cod_sup" label={{ text: `${forInput ? "Nonwoven " : ""}Superior` }} required={false}>
                            <SelectField size="small" data={matPrimasLookup} keyField="ITMREF_0" textField="ITMDES1_0"
                                optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                showSearch
                                labelInValue
                                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            />
                        </Field>
                        <Field wide={10} name="nw_cod_inf" label={{ text: `${forInput ? "Nonwoven " : ""}Inferior` }} required={false}>
                            <SelectField size="small" data={matPrimasLookup} keyField="ITMREF_0" textField="ITMDES1_0"
                                optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                labelInValue
                                showSearch
                                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            />
                        </Field>

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