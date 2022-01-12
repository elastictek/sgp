import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule } from "components/formLayout";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber } from "antd";
import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS } from 'config';
import { OFabricoContext } from './FormOFabricoValidar';

const schema = (keys, excludeKeys) => {
    return getSchema({
        n_paletes_total: Joi.number().label("Nº Paletes Total").min(0).required(),
        nemendas_paletescontentor: Joi.number().label("Nº Emendas Por Palete/Contentor").min(0).required(),
        nemendas_rolo: Joi.number().label("Nº Emendas Por Bobine").min(0).required(),
        maximo: Joi.number().label("Percentagem Máxima de Emendas").min(0).required(),
        tipo_emenda: Joi.number().label("Tipo Emenda").required()
    }, keys, excludeKeys).unknown(true);
}

const Drawer = ({ showWrapper, setShowWrapper, parentReload }) => {
    const [formTitle, setFormTitle] = useState({});
    const iref = useRef();
    const { record = {} } = showWrapper;
    const onVisible = () => {
        setShowWrapper(prev => ({ ...prev, show: !prev.show }));
    }
    return (
        <WrapperForm
            title={<TitleForm title={formTitle.title} subTitle={formTitle.subTitle} />}
            type="drawer"
            destroyOnClose={true}
            mask={true}
            style={{}}
            setVisible={onVisible}
            visible={showWrapper.show}
            width={800}
            bodyStyle={{ height: "450px" /*  paddingBottom: 80 *//* , overflowY: "auto", minHeight: "350px", maxHeight: "calc(100vh - 50px)" */ }}
            footer={<div ref={iref} id="form-wrapper" style={{ textAlign: 'right' }}></div>}
        >
            {/* <FormToCall setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /> */}
        </WrapperForm>
    );
}

const loadLookup = async ({ token }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/.../`, filter: {}, sort: [], cancelToken: token });
    return rows;
}

const setId = (id) => {
    if (id) {
        return { key: "update", values: { id } };
    }
    return { key: "insert", values: {} };
}

export default ({ record, setFormTitle, parentRef/* , changedValues = {} */ }) => {
    /* const { form, guides, schema, fieldStatus, ...ctx } = useContext(OFabricoContext); */
    const [form] = Form.useForm();
    const [guides, setGuides] = useState(false);
    const [loading, setLoading] = useState(false);
    const [operation, setOperation] = useState(setId(record.aggItem.paletizacao_id));
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [showSchema, setShowSchema] = useState({ show: false });
    const [lookupData, setLookupData] = useState([]);
    const [changedValues, setChangedValues] = useState({});
    const [resultMessage, setResultMessage] = useState({ status: "none" });

    const loadData = (data = {}, type = "init") => {
        const { token } = data;
        switch (type) {
            default:
                (async () => {
                    const { emendas, paletesstock, ...aggItem } = record.aggItem;
                    const n_paletes = JSON.parse(aggItem.n_paletes);
                    const n_paletes_stock = !(paletesstock) ? 0 : paletesstock.length;
                    const n_paletes_total = (!aggItem.n_paletes_total) ? (!n_paletes?.total?.n_paletes ? n_paletes_stock : Math.round(n_paletes.total.n_paletes)) : aggItem.n_paletes_total;
                    const n_paletes_prod = n_paletes_total - n_paletes_stock;
                    form.setFieldsValue({ n_paletes_total, n_paletes_stock, n_paletes_prod });
                })();
        }
    }

    const init = () => {
        (setFormTitle) && setFormTitle({ title: `Definições ${record.aggItem.cliente_nome}`, subTitle: `${record.aggItem.of_id} - ${record.aggItem.item_cod}` });
        loadData();
    }

    useEffect(() => {
        init();
    }, []);

    const onValuesChange = (changedValues, allValues) => {
        if ("n_paletes_total" in changedValues) {
            const { paletesstock } = record.aggItem;
            const n_paletes_stock = !(paletesstock) ? 0 : paletesstock.length;
            const _total = (changedValues.n_paletes_total < n_paletes_stock) ? n_paletes_stock : changedValues.n_paletes_total;
            const n_paletes_prod = _total - n_paletes_stock;
            form.setFieldsValue({ n_paletes_total: _total, n_paletes_prod });
        }
    }

    const onFinish = async (values) => {
        console.log("okkkkk",values)
        const status = { error: [], warning: [], info: [], success: [] };
        const v = schema().validate(values, { abortEarly: false });
        console.log("vvvvvv",v)
        //const response = await fetchPost({ url: `${API_URL}/savetempordemfabrico/`, parameters: { type: "settings" } });
        //setResultMessage(response.data);
        
        
        // const status = { error: [], warning: [], info: [], success: [] };
        // const msgKeys = ["start_date", "start_hour", "end_date", "end_hour"];
        // const { cliente_cod, cliente_nome, iorder, item, ofabrico, produto_id, item_id } = record;
        // const { core_cod: { value: core_cod, label: core_des } = {} } = values;
        // const { cortes_id, cortesordem_id } = form.getFieldsValue(true);
        // let diff = {};
        // const v = schema().custom((v, h) => {
        //     const { start_date, start_hour, end_date, end_hour } = v;
        //     diff = dateTimeDiffValidator(start_date, start_hour, end_date, end_hour);
        //     if (diff.errors == true) {
        //         return h.message("A Data de Fim tem de ser Maior que a Data de Início", { key: "start_date", label: "start_date" })
        //     }
        // }).validate(values, { abortEarly: false });
        // status.error = [...status.error, ...(v.error ? v.error?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        // status.warning = [...status.warning, ...(v.warning ? v.warning?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        // if (!v.error) { }
        // if (status.error.length === 0) {
        //     const response = await fetchPost({ url: `${API_URL}/savetempordemfabrico/`, parameters: { ...values, cliente_cod, cliente_nome, iorder, item, item_id, ofabrico, core_cod, core_des, produto_id, cortes_id, cortesordem_id } });
        //     setResultMessage(response.data);
        // }
        // setFieldStatus(diff.fields);
        // setFormStatus(status);
    }

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                <Form form={form} name={`form-of-settings`} onFinish={onFinish} onValuesChange={onValuesChange} component='form'>
                    <FormLayout
                        id="LAY-SETTINGS"
                        guides={guides}
                        layout="vertical"
                        style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                        schema={schema}
                        field={{
                            //wide: [3, 2, 1, '*'],
                            margin: "2px", overflow: false, guides: guides,
                            label: { enabled: true, pos: "top", align: "start", vAlign: "center", /* width: "80px", */ wrap: false, overflow: true, colon: true, ellipsis: true },
                            alert: { pos: "right", tooltip: true, container: false /* container: "el-external" */ },
                            layout: { top: "", right: "", center: "", bottom: "", left: "" },
                            addons: {}, //top|right|center|bottom|left
                            required: true,
                            style: { alignSelf: "top" }
                        }}
                        fieldSet={{
                            guides: guides,
                            wide: 16, margin: "2px", layout: "horizontal", overflow: false
                        }}
                    >

                        <HorizontalRule title="1. Nº de Paletes" />
                        <VerticalSpace />
                        <FieldSet margin={false}>
                            <Field wide={2} name="n_paletes_total" label={{ text: "Total" }}><InputNumber size="small" min={0} max={500} /></Field>
                        </FieldSet>
                        <FieldSet margin={false}>
                            <Field required={false} wide={2} name="n_paletes_stock" label={{ text: "Stock" }} forInput={false}><InputNumber size="small" min={0} max={500} /></Field>
                            <Field required={false} wide={2} name="n_paletes_prod" label={{ text: "A Produzir" }} forInput={false}><InputNumber size="small" min={0} max={500} /></Field>
                        </FieldSet>
                        <VerticalSpace />
                        <HorizontalRule title="2. Emendas" />
                        <VerticalSpace />
                        <FieldSet margin={false} field={{ wide: 4, style: { alignSelf: "left" }, label: { pos: "top", wrap: false, ellipsis: false, width: "130px" } }} layout="vertical">
                            <Field name="tipo_emenda" label={{ text: "Tipo Emenda" }}>
                                <SelectField size="small" data={TIPOEMENDA_OPTIONS} keyField="value" textField="label"
                                    optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                />
                            </Field>
                            <FieldSet margin={false}>
                                <Field wide={2} name="maximo" label={{ text: "Máximo" }}><InputNumber size="small" addonAfter={<b>%</b>} min={0} max={100} /></Field>
                                <Field wide={2} label={{ text: "Emendas/Rolo" }} name="nemendas_rolo"><InputNumber size="small" min={0} max={100} /></Field>
                                <Field wide={2} overflow={true} label={{ text: "Paletes/Contentor" }} name="nemendas_paletescontentor"><InputNumber size="small" min={0} max={100} /></Field>
                            </FieldSet>
                        </FieldSet>


                    </FormLayout>
                </Form>
                {parentRef && <Portal elId={parentRef.current}>
                    <Space>
                        <Button type="primary" onClick={()=>form.submit()}>Guardar</Button>
                        <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button>
                    </Space>
                </Portal>
                }
            </Spin>
        </>
    );
}