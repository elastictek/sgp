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
import { PlusOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { MdAdjust } from 'react-icons/md';
import { CgCloseO } from 'react-icons/cg';
import { DATE_FORMAT, DATETIME_FORMAT, GAMAOPERATORIA } from 'config';
import { OFabricoContext } from '../ordemFabrico/FormOFabricoValidar';
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

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const ctx = useContext(OFabricoContext);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [changedValues, setChangedValues] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [operation, setOperation] = useState(setId(record.gamaoperatoria_id));
    const [resultMessage, setResultMessage] = useState({ status: "none" });

    const init = (lookup = false) => {
        (async () => {
            if (lookup) {

            }
            if (operation.key === "update") {
                (setFormTitle) && setFormTitle({ title: `Editar Gama Operatória` });
                form.setFieldsValue({ ...record.gamaOperatoria, ...record.gamaOperatoriaItems });
            } else {
                (setFormTitle) && setFormTitle({ title: `Nova Gama Operatória ${ctx.item_cod}`, subTitle: `${ctx.item_nome}` });
                const initValues = {};
                initValues[`nitems`] = gamaOperatoriaItems.length;
                for (let [idx, v] of gamaOperatoriaItems.entries()) {
                    initValues[`key-${idx}`] = v.key;
                    initValues[`des-${idx}`] = v.designacao;
                    initValues[`tolerancia-${idx}`] = v.tolerancia;
                    initValues[`v${v.key}-${idx}`] = null;
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
                if (k !== 'designacao' && (values[k] === undefined || values[k] === null)) {
                    error = true;
                    break;
                }
            }
            if (error) {
                status.error.push({ message: "Os items da Gama Operatória têm de estar preenchidos!" });
            }
            if (status.error.length === 0) {
                const response = await fetchPost({ url: `${API_URL}/newgamaoperatoria/`, parameters: { ...form.getFieldsValue(true), produto_id: ctx.produto_id } });
                if (response.data.status !== "error") {
                    parentReload({ gamaoperatoria_id: record.gamaoperatoria_id }, "init");
                }
                setResultMessage(response.data);
            }
        }
        setSubmitting(false);
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
                        {forInput && <>
                            <FieldSet margin={false} field={{ wide: [6, 4] }}>
                                <Field name="designacao" label={{ enabled: false }}><Input placeholder="Designação" size="small" /></Field>
                            </FieldSet>
                            <VerticalSpace height="24px" />
                        </>
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
                        <Button disabled={submitting} onClick={onSubmit} type="primary">Guardar</Button>
                        {/* <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button> */}
                    </Space>
                </Portal>
                }
            </ResultMessage>
        </>
    );
}