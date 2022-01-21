import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber } from "antd";
import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS } from 'config';
import { OFabricoContext } from './FormOFabricoValidar';

const schema = (keys, excludeKeys) => {
    return getSchema({
        n_paletes_total: Joi.number().label("Nº Paletes Total").min(0).required(),
        nemendas_paletescontentor: Joi.number().label("Nº Emendas Por Palete/Contentor").min(0).required(),
        nemendas_rolo: Joi.number().label("Nº Emendas Por Bobine").min(0).required(),
        maximo: Joi.number().label("Percentagem Máxima de Emendas").min(0).required(),
        tipo_emenda: Joi.number().label("Tipo Emenda").required(),
        cliente_cod: Joi.object().label("Cliente").required()
    }, keys, excludeKeys).unknown(true);
}

const loadCoresLookup = async (core, largura, token) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimaslookup/`, filter: {}, parameters: { type: 'cores', core, largura }, cancelToken: token });
    return rows;
}

const loadEmendasLookup = async ({ cliente_cod, artigo_cod, token }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/emendaslookup/`, filter: { cliente_cod, artigo_cod }, pagination: { limit: 1 }, sort: [{ column: 'id', direction: 'DESC' }], cancelToken: token });
    return rows;
}

const loadCustomersLookup = async (value) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellcustomerslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_customer"]: `%${value.replaceAll(' ', '%%')}%` } });
    return rows;
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload }) => {
    const [form] = Form.useForm();
    const [guides, setGuides] = useState(false);
    const [loading, setLoading] = useState(false);
    const [coresLookup, setCoresLookup] = useState([]);

    const loadData = (data = {}, type = "init") => {
        const { emendas, paletesstock, artigo, core_des, ...aggItem } = record.aggItem;
        const cliente_cod = (aggItem.cliente_cod) ? { label: aggItem.cliente_nome, cliente_cod: aggItem.cliente_cod } : null;
        const { token } = data;
        switch (type) {
            default:
                (async () => {
                    setLoading(true);
                    setCoresLookup(await loadCoresLookup(artigo.core, artigo.lar, token));
                    let _emendas = {};
                    if (!emendas.id) {

                        const retEmendas = await loadEmendasLookup({ cliente_cod: aggItem.cliente_cod, artigo_cod: aggItem.item_cod, token });
                        if (retEmendas.length > 0) {
                            _emendas = { emendas_id: retEmendas[0].id, nemendas_paletescontentor: retEmendas[0].paletes_contentor, maximo: retEmendas[0].maximo, tipo_emenda: parseInt(retEmendas[0].tipo_emenda), nemendas_rolo: retEmendas[0].emendas_rolo }
                        }
                    } else {
                        _emendas = { emendas_id: emendas.id, nemendas_paletescontentor: emendas.paletes_contentor, maximo: emendas.maximo, tipo_emenda: parseInt(emendas.tipo_emenda), nemendas_rolo: emendas.emendas_rolo }
                    }
                    setLoading(false);
                    const n_paletes = JSON.parse(aggItem.n_paletes);
                    const n_paletes_stock = !(paletesstock) ? 0 : paletesstock.length;
                    const n_paletes_total = (!aggItem.n_paletes_total) ? (!n_paletes?.total?.n_paletes ? n_paletes_stock : Math.round(n_paletes.total.n_paletes)) : aggItem.n_paletes_total;
                    const n_paletes_prod = n_paletes_total - n_paletes_stock;
                    const core_cod =  { key: aggItem?.core_cod, value: aggItem?.core_cod, label: aggItem?.core_des }
                    form.setFieldsValue({ ..._emendas, n_paletes_total, n_paletes_stock, n_paletes_prod, cliente_cod, core_cod });
                })();
        }
    }

    const init = () => {
        const nome = (!record.aggItem.cliente_nome) ? "" : record.aggItem.cliente_nome;
        (setFormTitle) && setFormTitle({ title: `Definições ${nome}`, subTitle: `${record.aggItem.of_id} - ${record.aggItem.item_cod}` });
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
        const { emendas, paletesstock, tempof_id, ...aggItem } = record.aggItem;
        const v = schema().validate(values, { abortEarly: false });
        if (!v.error) {
            const cliente = (!aggItem.order_cod) ? { cliente_nome: values.cliente_cod.label, cliente_cod: values.cliente_cod.value } : { cliente_nome: aggItem.cliente_nome, cliente_cod: aggItem.cliente_cod };
            const { core_cod: { value: core_cod, label: core_des } = {} } = values;
            const response = await fetchPost({ url: `${API_URL}/savetempordemfabrico/`, parameters: { type: "settings", ...values, core_cod, core_des, ...cliente, artigo_cod: aggItem.item_cod, ofabrico: tempof_id } });
            if (response.data.status !== "error") {
                parentReload({ agg_id: aggItem.id });
                closeParent();
            }
        }
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

                        <HorizontalRule title="1. Cliente" />
                        <VerticalSpace />
                        <FieldSet margin={false} field={{ wide: [8] }}>
                            <Field forInput={record.aggItem.order_cod ? false : true} name="cliente_cod" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: false, text: "Cliente", pos: "left" }}>
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


                        <HorizontalRule title="2. Core" />
                        <VerticalSpace />
                        <FieldSet margin={false}>
                            <Field wide={[10]} name="core_cod" label={{ enabled: false, text: "Core", pos: "top" /* pos: "left", width: "140px", align: "end" */ }} required={false}>
                                <SelectField size="small" data={coresLookup} keyField="ITMREF_0" textField="ITMDES1_0"
                                    optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                    showSearch
                                    labelInValue
                                    filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                />
                            </Field>
                        </FieldSet>
                        <VerticalSpace />
                        <HorizontalRule title="3. Nº de Paletes" />
                        <VerticalSpace />
                        <FieldSet margin={false}>
                            <Field wide={2} name="n_paletes_total" label={{ text: "Total" }}><InputNumber size="small" min={0} max={500} /></Field>
                        </FieldSet>
                        <FieldSet margin={false}>
                            <Field required={false} wide={2} name="n_paletes_stock" label={{ text: "Stock" }} forInput={false}><InputNumber size="small" min={0} max={500} /></Field>
                            <Field required={false} wide={2} name="n_paletes_prod" label={{ text: "A Produzir" }} forInput={false}><InputNumber size="small" min={0} max={500} /></Field>
                        </FieldSet>
                        <VerticalSpace />
                        <HorizontalRule title="4. Emendas" />
                        <VerticalSpace />
                        <FieldSet margin={false} field={{ wide: 4, style: { alignSelf: "left" }, label: { pos: "top", wrap: false, ellipsis: false, width: "130px" } }} layout="vertical">
                            <Field name="tipo_emenda" label={{ text: "Tipo Emenda" }}>
                                <SelectField size="small" data={TIPOEMENDA_OPTIONS} keyField="key" textField="value" />
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
                        <Button type="primary" onClick={() => form.submit()}>Guardar</Button>
                        <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button>
                    </Space>
                </Portal>
                }
            </Spin>
        </>
    );
}