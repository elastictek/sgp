import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { hasValue, deepMerge } from "utils";
import { getSchema, dateTimeDiffValidator } from "utils/schemaValidator";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon } from "components/formLayout";
import Tabs, { TabPane } from "components/Tabs";
import AlertMessages from "components/alertMessages";
import ResultMessage from 'components/resultMessage';
import IconButton from "components/iconButton";
import Portal from "components/portal";
import { Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, DatePicker, InputNumber, TimePicker, Spin } from "antd";
const { Option, OptGroup } = Select;
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';

import FormRequirements from './FormRequirements';
import FormNonwovens from './FormNonwovens';
const FormPaletizacao = React.lazy(() => import('./FormPaletizacao'));
const FormFormulacao = React.lazy(() => import('./FormFormulacao'));
const FormGamaOperatoria = React.lazy(() => import('./FormGamaOperatoria'));
const FormSpecs = React.lazy(() => import('./FormSpecs'));
const FormAgg = React.lazy(() => import('./FormAgg'));
const FormNwsCore = React.lazy(() => import('./FormNwsCore'));
const FormCortes = React.lazy(() => import('./FormCortes'));

export const OFabricoContext = React.createContext({});

const schema = (keys, excludeKeys) => {
    return getSchema({
        start_prev_date: Joi.any().label("Data de Início"),
        end_prev_date: Joi.any().label("Data de Fim")
    }, keys, excludeKeys).unknown(true);
}

const LoadOFabricoTemp = async (record, token) => {
    const { iorder, item, cliente_cod, ofabrico } = record;
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/tempofabricoget/`, filter: { of_id: ofabrico, item_cod: item, cliente_cod, order_cod: iorder }, cancelToken: token });
    return rows;
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload }) => {
    /*     const { temp_ofabrico_agg, temp_ofabrico, item_id, produto_id, produto_cod, ofabrico } = record; */
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fieldStatus, setFieldStatus] = useState({});
    const submitForProduction = useRef(false);

    const [activeTab, setActiveTab] = useState("1");
    const [paletizacaoChangedValues, setPaletizacaoChangedValues] = useState({});
    const [formulacaoChangedValues, setFormulacaoChangedValues] = useState({});
    const [gamaOperatoriaChangedValues, setGamaOperatoriaChangedValues] = useState({});
    const [artigoSpecsChangedValues, setArtigoSpecsChangedValues] = useState({});
    const [nonwovensChangedValues, setNonwovensChangedValues] = useState({});
    const [requirementsChangedValues, setRequirementsChangedValues] = useState({});
    const [aggChangedValues, setAggChangedValues] = useState({});
    const [cortesOrdemChangedValues, setCortesOrdemChangedValues] = useState({});

    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [resultMessage, setResultMessage] = useState({ status: "none" });

    const contextValue = {
        agg_id: record.temp_ofabrico_agg,
        of_id: record.temp_ofabrico,
        of_cod: record.ofabrico,
        produto_id: record.produto_id,
        produto_cod: record.produto_cod,
        item_id: record.item_id,
        item_cod: record.item,
        item_nome: record.item_nome,
        order: record.iorder,
        cliente_cod: record.cliente_cod,
        cliente_nome: record.cliente_nome,
        qty_item: record.qty_item,
        sage_start_date: record.start_date,
        sage_end_date: record.end_date,
        fieldStatus,
        setFieldStatus,
        form,
        guides,
        schema
    }

    useEffect(() => {
        const cancelFetch = cancelToken();
        setFormTitle({ title: `Planear Ordem de Fabrico ${record.ofabrico}`, subTitle: `${record.item} - ${record.item_nome}` });
        (async () => {
            let [oFabricoTemp] = await LoadOFabricoTemp(record, cancelFetch);
            oFabricoTemp = { ...oFabricoTemp /* core_cod: { key: oFabricoTemp?.core_cod, value: oFabricoTemp?.core_cod, label: oFabricoTemp?.core_des } */ };
            form.setFieldsValue({ ...oFabricoTemp, nbobines: (record.qty_item / oFabricoTemp.sqm_bobine).toFixed(2) });
            setLoading(false);
        })();
        return (() => cancelFetch.cancel("Form OFabrico Plannig Cancelled"));
    }, []);

    const onValuesChange = (changedValues, allValues) => {
        if ("paletizacao_id" in changedValues) {
            setPaletizacaoChangedValues(changedValues);
        } else if ("formulacao_id" in changedValues) {
            setFormulacaoChangedValues(changedValues);
        } else if ("gamaoperatoria_id" in changedValues) {
            setGamaOperatoriaChangedValues(changedValues);
        } else if ("artigospecs_id" in changedValues) {
            setArtigoSpecsChangedValues(changedValues);
        } else if ("nonwovens_id" in changedValues) {
            setNonwovensChangedValues(changedValues);
        } /* else if ("core_id" in changedValues) {
            setCoreChangedValues(changedValues);
        } */ else if ("agg_id" in changedValues) {
            setAggChangedValues(changedValues);
        } else if ("cortesordem_id" in changedValues || "cortes" in changedValues) {
            setCortesOrdemChangedValues(changedValues);
        } else {
            setRequirementsChangedValues(changedValues);
        }
    }

    const onFinish = async (values) => {
        const forproduction = submitForProduction.current;
        submitForProduction.current = false;

        const status = { error: [], warning: [], info: [], success: [] };
        const msgKeys = ["start_prev_date", "end_prev_date"];
        const { cliente_cod, cliente_nome, iorder, item, ofabrico, produto_id, produto_cod, item_id, temp_ofabrico } = record;
        const { core_cod: { value: core_cod, label: core_des } = {} } = values;
        const { cortes_id/* , cortesordem_id */ } = form.getFieldsValue(true);
        let diff = {};
        const v = schema().custom((v, h) => {
            const { start_prev_date, end_prev_date } = v;
            diff = dateTimeDiffValidator(start_prev_date, end_prev_date);
            if (diff.errors == true) {
                return h.message("A Data de Fim tem de ser Maior que a Data de Início", { key: "start_date", label: "start_date" })
            }
        }).validate(values, { abortEarly: false });
        status.error = [...status.error, ...(v.error ? v.error?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        status.warning = [...status.warning, ...(v.warning ? v.warning?.details.filter((v) => msgKeys.includes(v.context.key)) : [])];
        if (!v.error) { }
        if (status.error.length === 0) {
            const { start_prev_date, end_prev_date } = values;

            if ("nonwovens_id" in values && values["nonwovens_id"]===undefined){
                values["nonwovens_id"]=-1;
            }
            if ("artigospecs_id" in values && values["artigospecs_id"]===undefined){
                values["artigospecs_id"]=-1;
            }
            if ("formulacao_id" in values && values["formulacao_id"]===undefined){
                values["formulacao_id"]=-1;
            }
            if ("gamaoperatoria_id" in values && values["gamaoperatoria_id"]===undefined){
                values["gamaoperatoria_id"]=-1;
            }
            if ("cortesordem_id" in values && values["cortesordem_id"]===undefined){
                values["cortesordem_id"]=-1;
            }
            const response = await fetchPost({ url: `${API_URL}/savetempordemfabrico/`, parameters: { ...values, ofabrico_cod:ofabrico, ofabrico_id:temp_ofabrico, forproduction, qty_item: record.qty_item, start_prev_date: start_prev_date.format('YYYY-MM-DD HH:mm:ss'), end_prev_date: end_prev_date.format('YYYY-MM-DD HH:mm:ss'), cliente_cod, cliente_nome, iorder, item, item_id, core_cod, core_des, produto_id, produto_cod, cortes_id/* , cortesordem_id */ } });
            setResultMessage(response.data);
            if (forproduction) {
                parentReload();
            }
        }
        setFieldStatus(diff.fields);
        setFormStatus(status);
    };

    const onSuccessOK = () => {
        setSubmitting(false);
        setResultMessage({ status: "none" });
    }

    const onErrorOK = () => {
        setSubmitting(false);
        setResultMessage({ status: "none" });
    }

    const onClose = (reload = false) => {
        closeParent();
    }

    const onSubmitForProduction = useCallback(() => {
        setSubmitting(true);
        submitForProduction.current = true;
        form.submit();
    },[]);

    const onSubmit = useCallback(() =>{
        setSubmitting(true);
        form.submit();
    },[]);

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                <ResultMessage
                    result={resultMessage}
                    successButtonOK={<Button type="primary" key="goto-of" onClick={onSuccessOK}>Continuar</Button>}
                    successButtonClose={<Button key="goto-close" onClick={() => onClose(true)}>Fechar</Button>}
                    errorButtonOK={<Button type="primary" key="goto-ok" onClick={onErrorOK}>OK</Button>}
                    errorButtonClose={<Button key="goto-close" onClick={onClose}>Fechar</Button>}
                >
                    <AlertsContainer id="el-external" />
                    <AlertMessages formStatus={formStatus} />
                    <OFabricoContext.Provider value={contextValue} /* value={{ temp_ofabrico_agg, temp_ofabrico, item_id, produto_id, produto_cod, ofabrico, form, guides, schema }} */>
                        <Form form={form} name={`form-of-validar`} onFinish={onFinish} onValuesChange={onValuesChange}>
                            <Tabs /* onChange={() => { }} */ type="card" dark={1} defaultActiveKey="1" activeKey={activeTab} onChange={(k) => setActiveTab(k)}>
                                <TabPane tab="Requisitos" key="1" forceRender={true}>
                                    <FormRequirements changedValues={requirementsChangedValues} />
                                </TabPane>
                                <TabPane tab="Ordens Fabrico" key="2">
                                    <Suspense fallback={<></>}><FormAgg changedValues={aggChangedValues} /></Suspense>
                                </TabPane>
                                <TabPane tab="Nonwovens" key="8">
                                    <Suspense fallback={<></>}><FormNonwovens changedValues={nonwovensChangedValues} /></Suspense>
                                    {/* <Suspense fallback={<></>}><FormNwsCore nwChangedValues={nonwovensChangedValues}  coreChangedValues={coreChangedValues} /></Suspense> */}
                                </TabPane>
                                <TabPane tab="Especificações" key="3">
                                    <Suspense fallback={<></>}><FormSpecs changedValues={artigoSpecsChangedValues} /></Suspense>
                                </TabPane>
                                <TabPane tab="Formulação" key="4">
                                    <Suspense fallback={<></>}><FormFormulacao changedValues={formulacaoChangedValues} /></Suspense>
                                </TabPane>
                                <TabPane tab="Gama Operatória" key="5">
                                    <Suspense fallback={<></>}><FormGamaOperatoria changedValues={gamaOperatoriaChangedValues} /></Suspense>
                                </TabPane>
                                {/*                                <TabPane tab="Paletização" key="6">
                                    <Suspense fallback={<></>}><FormPaletizacao changedValues={paletizacaoChangedValues} /></Suspense>
                                </TabPane> */}
                                <TabPane tab="Cortes" key="7">
                                    <Suspense fallback={<></>}><FormCortes changedValues={cortesOrdemChangedValues} /></Suspense>
                                </TabPane>
                                {/* <TabPane tab="Paletes Stock" key="9">
                                    <Suspense fallback={<></>}><FormPaletesStock id={form.getFieldValue("artigospecs_id")} record={record} form={form} guides={guides} schema={schema} changedValues={artigoSpecsChangedValues} /></Suspense>
                                </TabPane> */}
                            </Tabs>
                        </Form>
                    </OFabricoContext.Provider>
                </ResultMessage>
                <Portal elId={parentRef.current}>
                    <Space>
                        <Button disabled={submitting} type="primary" onClick={onSubmitForProduction}>Submeter para Produção</Button>
                        <Button disabled={submitting} onClick={onSubmit}>Guardar Ordem de Fabrico</Button>
                        {/* <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button> */}
                    </Space>
                </Portal>
            </Spin>
        </>
    );

}