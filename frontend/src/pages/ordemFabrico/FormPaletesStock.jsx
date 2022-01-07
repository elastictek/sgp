import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon } from "components/formLayout";
import Toolbar from "components/toolbar";
import { Button, Spin } from "antd";
import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT, PALETIZACAO_ITEMS, PALETE_SIZES } from 'config';
import FormPaletesStockUpsert from '../paletesStock/FormPaletesStockUpsert';

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
            //width={width}
            mask={true}
            /* style={{ maginTop: "48px" }} */
            setVisible={onVisible}
            visible={showWrapper.show}
            width={800}
            bodyStyle={{ height: "450px" /*  paddingBottom: 80 *//* , overflowY: "auto", minHeight: "350px", maxHeight: "calc(100vh - 50px)" */ }}
            footer={<div ref={iref} id="form-wrapper" style={{ textAlign: 'right' }}></div>}
        >
            <FormPaletesStockUpsert setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} />
        </WrapperForm>
    );
}

const loadArtigosSpecsLookup = async ({ produto_id }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/artigosspecslookup/`, filter: { produto_id }, sort: [] });
    return rows;
}
const getArtigoSpecsItems = async ({ artigospecs_id }) => {
    if (!artigospecs_id) {
        return [];
    }
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/artigospecsitemsget/`, filter: { artigospecs_id }, sort: [] });
    return rows;
}

export default ({ id, record, form, guides, schema, changedValues={} }) => {
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState({ show: false });
    const [artigosSpecs, setArtigosSpecs] = useState([]);

    useEffect(() => {
        const { produto_id } = record;
        loadData({ artigospecs_id: id, produto_id });
    }, []);

    useEffect(() => {
        if ("artigospecs_id" in changedValues) {
            setLoading(true);
            loadData({ artigospecs_id: changedValues.artigospecs_id });
        }
    }, [changedValues]);

    const loadData = (data = {}, type = "init") => {
        const { produto_id } = record;
        const { artigospecs_id } = data;
        switch (type) {
            case "lookup":
                setLoading(true);
                (async () => {
                    setArtigosSpecs(await loadArtigosSpecsLookup({ produto_id }));
                    setLoading(false);
                })();
                break;
            default:
                if (!loading) {
                    setLoading(true);
                }
                (async () => {
                    let _artigosspecs = artigosSpecs;
                    if (produto_id) {
                        _artigosspecs = await loadArtigosSpecsLookup({ produto_id });
                        setArtigosSpecs(_artigosspecs);
                    }
                    if (artigospecs_id) {
                        let [artigoSpecs] = _artigosspecs.filter(v => v.id === artigospecs_id);
                        const artigoSpecsItems = await getArtigoSpecsItems({ artigospecs_id });
                        const fieldsValue = { nitems: artigoSpecsItems.length };
                        for (let [i, v] of artigoSpecsItems.entries()) {
                            fieldsValue[`key-${i}`] = v.item_key;
                            fieldsValue[`des-${i}`] = v.item_des;
                            const vals = (typeof v.item_values === "string") ? JSON.parse(v.item_values) : v.item_values;
                            for (let [iV, vV] of vals.entries()) {
                                fieldsValue[`v${v.item_key}-${iV}`] = vV;
                            }
                        }
                        artigoSpecs = { ...artigoSpecs, cliente_cod: { key: artigoSpecs.cliente_cod, value: artigoSpecs.cliente_cod, label: artigoSpecs.cliente_nome } };
                        form.setFieldsValue({ artigoSpecs, artigoSpecsItems: fieldsValue });
                    }
                    setLoading(false);
                })();
        }
    }

    const onShowForm = (newForm = false) => {
        const { item, item_nome, produto_id, produto_cod } = record;
        console.log("onshowwwwwww",form.getFieldsValue("agg_of_id"));
        if (newForm) {
            setShowForm(prev => ({ ...prev, show: !prev.show, record: { item_cod: item, item_nome, produto_id, produto_cod } }));
        } else {
            setShowForm(prev => ({ ...prev, show: !prev.show, record: { ...form.getFieldsValue(true), produto_id, produto_cod } }));
        }
    }

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                <Drawer showWrapper={showForm} setShowWrapper={setShowForm} parentReload={loadData} />
                <FormLayout
                    id="LAY-PALETESSTOCK"
                    guides={guides}
                    layout="vertical"
                    style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{
                        //wide: [3, 2, 1, '*'],
                        margin: "2px", overflow: false, guides: guides,
                        label: { enabled: true, pos: "top", align: "start", vAlign: "center", width: "120px", wrap: false, overflow: false, colon: true, ellipsis: true },
                        alert: { pos: "right", tooltip: true, container: true /* container: "el-external" */ },
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
                    <FieldSet>
                        <Toolbar
                            style={{ width: "100%" }}
                            left={
                                <FieldSet>
                                    <Field name="artigospecs_id" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Especificações", pos: "left" }} addons={{
                                        ...(form.getFieldValue("artigospecs_id") && { right: <Button onClick={() => onShowForm()} style={{ marginLeft: "3px" }} size="small"><EditOutlined style={{ fontSize: "16px" }} /></Button> })
                                    }}>
                                        <SelectField size="small" data={artigosSpecs} keyField="id" textField="designacao"
                                            optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ minWidth: "150px" }}><b>{d[textField]}</b></div><div>v.{d["versao"]}</div></div>, value: d[keyField] })}
                                        />
                                    </Field>
                                </FieldSet>
                            }
                            right={<Button onClick={() => onShowForm(true)}>Paletes em Stock</Button>}
                        />
                    </FieldSet>
                    <FieldSet>
                        {(!loading && form.getFieldValue("artigospecs_id")) && <FormPaletesStockUpsert record={form.getFieldsValue(true)} wrapForm={false} forInput={false} parentReload={loadData} />}
                    </FieldSet>
                </FormLayout>
            </Spin>
        </>
    );
}