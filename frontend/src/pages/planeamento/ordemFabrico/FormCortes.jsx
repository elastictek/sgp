import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import Toolbar from "components/toolbar";
import { Button, Spin, Input, Form, InputNumber, Skeleton } from "antd";
import { LoadingOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import FormCortesUpsert from '../cortes/FormCortesUpsert';
import { useImmer } from "use-immer";
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
            mask={true}
            setVisible={onVisible}
            visible={showWrapper.show}
            width={800}
            bodyStyle={{ height: "450px" }}
            footer={<div ref={iref} id="form-wrapper" style={{ textAlign: 'right' }}></div>}
        >
            <FormCortesUpsert setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} />
        </WrapperForm>
    );
}


const loadArtigosAggLookup = async ({ agg_id, token }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/artigostempagglookup/`, filter: { agg_id }, sort: [], cancelToken: token });
    return rows;
}

const loadCortesOrdemLookup = async ({ cortes_id, token }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/cortesordemlookup/`, filter: { cortes_id }, sort: [], cancelToken: token });
    return rows;
}


export default ({ /* form, guides, schema,  */changedValues }) => {
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState({ show: false });
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [cortesOrdemLookup, setCortesOrdemLookup] = useState([]);
    const [larguraUtil, setLarguraUtil] = useState();
    const { form, guides, schema, ...ctx } = useContext(OFabricoContext);

    useEffect(() => {
        const cancelFetch = cancelToken();
        loadData({ agg_id: ctx.agg_id, token: cancelFetch });
        return (() => cancelFetch.cancel("Form Cortes Cancelled"));
    }, []);

    useEffect(() => {
        if (changedValues) {
            if ("cortes" in changedValues) {
                setLarguraUtil(calculateLarguraUtil(form.getFieldValue("cortes")));
            }
            if ("cortesordem_id" in changedValues) {
                //const v = ((changedValues.cortesordem_id) ? cortesOrdemLookup.filter(v => v.id === changedValues.cortesordem_id) : [])[0];
                //console.log(v);
                //setCortesOrdem(v);
            }
        }
    }, [changedValues]);


    const cortesOrdem = () => {
        const id = form.getFieldValue("cortesordem_id");
        return ((id) ? cortesOrdemLookup.filter(v => v.id === id) : [])[0];
    };

    const isCortesTouched = () => {
        return !(!form.getFieldValue("cortes_id") || (changedValues && "cortes" in changedValues));
    }

    const calculateLarguraUtil = useCallback((cortes) => {
        const v = cortes.reduce((accumulator, current) => accumulator + (current.cortes_artigo_ncortes * current.cortes_artigo_lar), 0);
        return v;
    });

    const loadData = ({ agg_id, token }, type = "init") => {
        switch (type) {
            case "lookup":
                (async () => {
                    const _cortesOrdemLookup = await loadCortesOrdemLookup({ cortes_id: form.getFieldValue("cortes_id"), token });
                    setCortesOrdemLookup(_cortesOrdemLookup);
                })();
                break;
            default:
                if (!loading) {
                    setLoading(true);
                }
                (async () => {
                    const _cortes = await loadArtigosAggLookup({ agg_id, token });
                    const cortes_id = (_cortes.length > 0) ? _cortes[0]["cortes_id"] : null;
                    const cortesordem_id = (_cortes.length > 0) ? _cortes[0]["cortesordem_id"] : null;
                    const _cortesOrdemLookup = await loadCortesOrdemLookup({ cortes_id, token });
                    form.setFieldsValue({ cortes: _cortes, ...(cortes_id ? { cortes_id } : { cortes_id: null }), ...(cortesordem_id ? { cortesordem_id } : { cortesordem_id: null }) });
                    setLarguraUtil(calculateLarguraUtil(_cortes));
                    setCortesOrdemLookup(_cortesOrdemLookup);
                    setLoading(false);
                })();
        }
    }

    const onSubmit = async () => {
        const status = { error: [], warning: [], info: [], success: [] };
        const response = await fetchPost({ url: `${API_URL}/newcortes/`, parameters: { ...form.getFieldsValue(["cortes"]), agg_id: ctx.agg_id } });
        if (response.data.status == "error") {
            status.error.push({ message: response.data.title });
        } else {
            status.success.push({ message: response.data.title });
            loadData({ agg_id: ctx.agg_id });
        }
        setFormStatus(status);
    }

    const clearCortes = async () => {
        const status = { error: [], warning: [], info: [], success: [] };
        const response = await fetchPost({ url: `${API_URL}/clearcortes/`, parameters: { agg_id: ctx.agg_id } });
        if (response.data.status == "error") {
            status.error.push({ message: response.data.title });
        } else {
            status.success.push({ message: response.data.title });
            loadData({ agg_id: ctx.agg_id });
        }
        setFormStatus(status);
    }



    const onShowForm = (newForm = false) => {
        if (newForm) {
            setShowForm(prev => ({ ...prev, show: !prev.show, record: { ...form.getFieldsValue(["cortes", "cortes_id"]) } }));
        } else {
            setShowForm(prev => ({ ...prev, show: !prev.show, record: { ...form.getFieldsValue(["cortes", "cortes_id"]), cortesOrdem: cortesOrdem() } }));
        }
    }

    return (
        <>
            <AlertMessages formStatus={formStatus} />
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                <Drawer showWrapper={showForm} setShowWrapper={setShowForm} parentReload={loadData} />
                <FormLayout
                    id="LAY-CORTES"
                    guides={guides}
                    layout="vertical"
                    style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{
                        //wide: [3, 2, 1, '*'],
                        margin: "2px", overflow: false, guides: guides,
                        label: { enabled: true, pos: "top", align: "start", vAlign: "center", /* width: "80px", */ wrap: false, overflow: false, colon: true, ellipsis: true },
                        alert: { pos: "right", tooltip: true, container: true /* container: "el-external" */ },
                        layout: { top: "", right: "", center: "", bottom: "", left: "" },
                        addons: {}, //top|right|center|bottom|left
                        required: true,
                        style: { alignSelf: "center" }
                    }}
                    fieldSet={{
                        guides: guides,
                        wide: 16, margin: false, layout: "horizontal", overflow: false
                    }}
                >

                    <FieldSet>
                        {form.getFieldValue("cortes_id") && <Toolbar
                            style={{ width: "100%" }}
                            left={<div>{larguraUtil && <>Largura Útil [ <b>{larguraUtil}mm</b> ]</>}</div>}
                            right={<Button onClick={clearCortes}>Refazer Cortes</Button>}
                        />
                        }
                    </FieldSet>
                    <FieldSet>


                        <FieldSet wide={10} layout="vertical">
                            <FieldSet style={{ fontWeight: 500 }} field={{ wide: [5, 5, 3, 3], noItemWrap: true, label: { enabled: false } }}>
                                <Field>Ordem Fabrico</Field>
                                <Field>Artigo</Field>
                                <Field>Largura</Field>
                                <Field>Nº Cortes</Field>
                            </FieldSet>


                            <Form.List name="cortes">

                                {(fields, { add, remove, move }) => {
                                    return (
                                        <>
                                            {fields.map((field, index) => (
                                                <FieldSet key={field.key} field={{ wide: [5, 5, 3, 3] }}>
                                                    <Field forInput={false} name={[field.name, `of_id`]} label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                                    <Field forInput={false} name={[field.name, `item_cod`]} label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                                    <Field forInput={false} name={[field.name, `item_lar`]} label={{ enabled: false }}><Input disabled={true} size="small" /></Field>
                                                    <Field name={[field.name, `cortes_artigo_ncortes`]} label={{ enabled: false }}><InputNumber size="small" min={1} max={24} /></Field>
                                                </FieldSet>
                                            ))}
                                        </>

                                    )
                                }}

                            </Form.List>
                            <VerticalSpace height="12px" />
                            <FieldSet><Button disabled={isCortesTouched()} type="dashed" onClick={onSubmit} style={{ width: "100%" }}>Aplicar</Button></FieldSet>

                        </FieldSet>
                    </FieldSet>
                    <VerticalSpace height="12px" />
                    <FieldSet>
                        {form.getFieldValue("cortes_id") && <Toolbar
                            style={{ width: "100%" }}
                            left={
                                <FieldSet>
                                    <Field name="cortesordem_id" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Posição Cortes", pos: "left" }} addons={{
                                        ...(form.getFieldValue("cortesordem_id") && { right: <Button onClick={() => onShowForm()} style={{ marginLeft: "3px" }} size="small"><EditOutlined style={{ fontSize: "16px" }} /></Button> })
                                    }}>
                                        <SelectField allowClear size="small" data={cortesOrdemLookup} keyField="id" textField="designacao"
                                            optionsRender={(d, keyField, textField) => ({ label: <div><div style={{ display: "flex" }}><div style={{ minWidth: "150px" }}><b>{d[textField]}</b></div><div>v.{d["versao"]}</div></div><div style={{ color: "#1890ff" }}>{d["largura_ordem"].replaceAll('"', ' ')}</div></div>, value: d[keyField] })}
                                        />
                                    </Field>
                                </FieldSet>
                            }
                            right={<Button onClick={() => onShowForm(true)}>Novo Posicionamento de Cortes</Button>}
                        />
                        }
                    </FieldSet>
                    <FieldSet field={{ wide: [16] }}>
                        <FieldItem label={{ enabled: false }}>
                            {((loading, cortesOrdem) => {
                                if (!loading && cortesOrdem) {
                                    return (<FormCortesUpsert record={{ ...form.getFieldsValue(["cortes", "cortes_id"]), cortesOrdem }} wrapForm={false} forInput={false} parentReload={loadData} />);
                                }
                            })(loading, cortesOrdem())}
                        </FieldItem>
                    </FieldSet>
                </FormLayout>
            </Spin>
        </>
    );
}