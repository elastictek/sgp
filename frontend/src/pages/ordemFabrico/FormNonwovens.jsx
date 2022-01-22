import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule } from "components/formLayout";
import Toolbar from "components/toolbar";
import { Button, Spin } from "antd";
import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import FormNonwovensUpsert from '../nonwovens/FormNonwovensUpsert';
import { OFabricoContext } from './FormOFabricoValidar';

const Drawer = ({ showWrapper, setShowWrapper, parentReload }) => {
    const [formTitle, setFormTitle] = useState({});
    const iref = useRef();
    const { record = {}, forInput } = showWrapper;
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
            <FormNonwovensUpsert setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} forInput={forInput} />
        </WrapperForm>
    );
}

const loadNonwovensLookup = async ({ produto_id, token }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/nonwovenslookup/`, filter: { produto_id }, sort: [], cancelToken: token });
    return rows;
}

export default ({ changedValues }) => {
    const { form, guides, schema, fieldStatus, ...ctx } = useContext(OFabricoContext);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState({ show: false });
    const [nonwovens, setNonwovens] = useState([]);

    useEffect(() => {
        const { produto_id } = ctx;
        const cancelFetch = cancelToken();
        loadData({ nonwovens_id: form.getFieldValue("nonwovens_id"), produto_id, token: cancelFetch });
        return (() => cancelFetch.cancel("Form Nonwovens Cancelled"));
    }, []);

    useEffect(() => {
        const cancelFetch = cancelToken();
        if (changedValues) {
            if ("nonwovens_id" in changedValues) {
                /*  setLoading(true);
                 loadData({ [idRefName]: changedValues[idRefName], token: cancelFetch }); */
            }
        }
        return (() => cancelFetch.cancel("Form Nonwovens Cancelled"));
    }, [changedValues]);

    const loadData = (data = {}, type = "init") => {
        const { produto_id } = ctx;
        const { token } = data;
        switch (type) {
            case "lookup":
                setLoading(true);
                (async () => {
                    setNonwovens(await loadNonwovensLookup({ produto_id, token }));
                    setLoading(false);
                })();
                break;
            default:
                if (!loading) {
                    setLoading(true);
                }
                (async () => {
                    let _nonwovens = nonwovens;
                    if (produto_id) {
                        _nonwovens = await loadNonwovensLookup({ produto_id, token });
                        setNonwovens(_nonwovens);
                    }
                    setLoading(false);
                })();
        }
    }

    const onShowForm = (newForm = false, forInput = false) => {
        if (newForm) {
            setShowForm(prev => ({ ...prev, show: !prev.show, record: {}, forInput }));
        } else {
            setShowForm(prev => ({ ...prev, show: !prev.show, record: { ...form.getFieldsValue(["nonwovens_id"]), nonwovens }, forInput }));
        }
    }

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                <Drawer showWrapper={showForm} setShowWrapper={setShowForm} parentReload={loadData} />
                <FormLayout
                    id="LAY-NONWOVENS"
                    guides={guides}
                    layout="vertical"
                    style={{ width: "100%", /* padding: "5px", border: "solid 1px #dee2e6", borderRadius: "3px" *//* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{
                        //wide: [3, 2, 1, '*'],
                        margin: "2px", overflow: false, guides: guides,
                        label: { enabled: true, pos: "top", align: "start", vAlign: "center", width: "80px", wrap: false, overflow: false, colon: false, ellipsis: true },
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
                    <VerticalSpace />
                    <HorizontalRule title="1. Nonwovens" />
                    <VerticalSpace />
                    {/* <Item><h4 style={{ padding: "5px" }}>Nonwovens</h4></Item> */}
                    <FieldSet margin={false} field={{ wide: [6, 2] }} style={{ alignItems: "center" }}>
                        <Field name="nonwovens_id" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: false, text: "Nonwovens", pos: "left" }} addons={{
                            ...(form.getFieldValue("nonwovens_id") && { right: <Button onClick={() => onShowForm(false, true)} style={{ marginLeft: "3px" }} size="small"><EditOutlined style={{ fontSize: "16px" }} /></Button> })
                        }}>
                            <SelectField size="small" data={nonwovens} keyField="id" textField="designacao"
                                optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ minWidth: "150px" }}><b>{d[textField]}</b></div><div>v.{d["versao"]}</div></div>, value: d[keyField] })}
                            />
                        </Field>
                        <Item><Button onClick={() => onShowForm(true, true)} size="small">Novo</Button></Item>
                    </FieldSet>
                    <FieldSet margin={false}>
                        <FormNonwovensUpsert parentLoading={loading} record={{ nonwovens, ...form.getFieldsValue(["nonwovens_id"]) }} wrapForm={false} forInput={false} parentReload={loadData} changedValues={changedValues} />
                    </FieldSet>

                </FormLayout>
            </Spin>
        </>
    );
}