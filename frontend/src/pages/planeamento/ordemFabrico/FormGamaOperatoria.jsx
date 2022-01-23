import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon } from "components/formLayout";
import Toolbar from "components/toolbar";
import { Button, Spin } from "antd";
import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import FormGamaOperatoriaUpsert from '../gamaOperatoria/FormGamaOperatoriaUpsert';
import { OFabricoContext } from './FormOFabricoValidar';

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
            <FormGamaOperatoriaUpsert setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} />
        </WrapperForm>
    );
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

export default ({ changedValues }) => {
    const { form, guides, schema, fieldStatus, ...ctx } = useContext(OFabricoContext);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState({ show: false });
    const [gamasOperatorias, setGamasOperatorias] = useState([]);

    useEffect(() => {
        const cancelFetch = cancelToken();
        loadData({ gamaoperatoria_id: form.getFieldValue("gamaoperatoria_id"), token: cancelFetch });
        return (() => cancelFetch.cancel("Form Gama Operatória Cancelled"));
    }, []);

    useEffect(() => {
        const cancelFetch = cancelToken();
        if (changedValues) {
            if ("gamaoperatoria_id" in changedValues) {
                setLoading(true);
                loadData({ gamaoperatoria_id: changedValues.gamaoperatoria_id, token: cancelFetch });
            }
        }
        return (() => cancelFetch.cancel("Form Gama Operatória Cancelled"));
    }, [changedValues]);

    const loadData = (data = {}, type = "init") => {
        const { gamaoperatoria_id, token } = data;
        switch (type) {
            case "lookup":
                setLoading(true);
                (async () => {
                    setGamasOperatorias(await loadGamasOperatoriasLookup({ produto_id: ctx.produto_id, token }));
                    setLoading(false);
                })();
                break;
            default:
                if (!loading) {
                    setLoading(true);
                }
                (async () => {
                    let _gamasoperatorias = gamasOperatorias;
                    if (ctx.produto_id) {
                        _gamasoperatorias = await loadGamasOperatoriasLookup({ produto_id: ctx.produto_id, token });
                        setGamasOperatorias(_gamasoperatorias);
                    }
                    if (gamaoperatoria_id) {
                        const [gamaOperatoria] = _gamasoperatorias.filter(v => v.id === gamaoperatoria_id);
                        const gamaOperatoriaItems = await getGamaOperatoriaItems({ gamaoperatoria_id, token });

                        const fieldsValue = { nitems: gamaOperatoriaItems.length };
                        for (let [i, v] of gamaOperatoriaItems.entries()) {
                            fieldsValue[`key-${i}`] = v.item_key;
                            fieldsValue[`des-${i}`] = v.item_des;
                            fieldsValue[`tolerancia-${i}`] = v.tolerancia;
                            const vals = (typeof v.item_values === "string") ? JSON.parse(v.item_values) : v.item_values;
                            for (let [iV, vV] of vals.entries()) {
                                fieldsValue[`v${v.item_key}-${iV}`] = vV;
                            }
                        }
                        form.setFieldsValue({ gamaOperatoria, gamaOperatoriaItems: fieldsValue });
                    }
                    setLoading(false);
                })();
        }
    }

    const onShowForm = (newForm = false, forInput = false) => {
        if (newForm) {
            setShowForm(prev => ({ ...prev, show: !prev.show, record: {}, forInput }));
        } else {
            setShowForm(prev => ({ ...prev, show: !prev.show, record: { ...form.getFieldsValue(["gamaoperatoria_id", "gamaOperatoria", "gamaOperatoriaItems"]), forInput } }));
        }
    }

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                <Drawer showWrapper={showForm} setShowWrapper={setShowForm} parentReload={loadData} />
                <FormLayout
                    id="LAY-GAMAOPERATORIA"
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
                                    <Field name="gamaoperatoria_id" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Gama Operatória", pos: "left" }} addons={{
                                        ...(form.getFieldValue("gamaoperatoria_id") && { right: <Button onClick={() => onShowForm(false, true)} style={{ marginLeft: "3px" }} size="small"><EditOutlined style={{ fontSize: "16px" }} /></Button> })
                                    }}>
                                        <SelectField size="small" data={gamasOperatorias} keyField="id" textField="designacao"
                                            optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ minWidth: "150px" }}><b>{d[textField]}</b></div><div>v.{d["versao"]}</div></div>, value: d[keyField] })}
                                        />
                                    </Field>
                                </FieldSet>
                            }
                            right={<Button onClick={() => onShowForm(true, true)}>Nova Gama Operatória</Button>}
                        />
                    </FieldSet>
                    <FieldSet>
                        {(!loading && form.getFieldValue("gamaoperatoria_id")) && <FormGamaOperatoriaUpsert record={form.getFieldsValue(true)} wrapForm={false} forInput={false} parentReload={loadData} />}
                    </FieldSet>
                </FormLayout>
            </Spin>
        </>
    );
}