import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN, ENROLAMENTO_OPTIONS } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../../App";
import FormRequirements from "./FormRequirements";
import FormAgg from "./FormAgg";

const schema = (options = {}) => {
    return getSchema({
        /* produto_cod: Joi.string().label("Designação do Produto").required(),
        artigo_formu: Joi.string().label("Fórmula").required(),
        artigo_nw1: Joi.string().label("Nonwoven 1").required(),
        typeofabrico: Joi.number().integer().min(0).max(2).label("Tipo Ordem de Fabrico").required(),
        artigo_width: Joi.number().integer().min(1).max(5000).label("Largura").required(),
        artigo_diam: Joi.number().integer().min(1).max(5000).label("Diâmetro").required(),
        artigo_core: Joi.number().integer().valid(3, 6).label("Core").required(),
        artigo_gram: Joi.number().integer().min(1).max(1000).label("Gramagem").required(),
        artigo_thickness: Joi.number().integer().min(0).max(5000).label("Espessura").required() */
    }, options).unknown(true);
}
export const schemaAgg = (options = {}) => {
    return getSchema({
    }, options).unknown(true);
}
export const schemaSpecs = (options = {}) => {
    return getSchema({
    }, options).unknown(true);
}
export const schemaFormulacao = (options = {}) => {
    return getSchema({
    }, options).unknown(true);
}
export const schemaGamaOperatoria = (options = {}) => {
    return getSchema({
    }, options).unknown(true);
}
export const schemaNonwovens = (options = {}) => {
    return getSchema({
    }, options).unknown(true);
}
export const schemaCortes = (options = {}) => {
    return getSchema({
    }, options).unknown(true);
}
export const schemaRequirements = (options = {}) => {
    return getSchema({
        start_prev_date: Joi.string().label("Data prevista de início").required(),
        end_prev_date: Joi.string().label("Data prevista de fim").required()
    }, options).unknown(true);
}

const LoadOrdemFabricoTemp = async ({ temp_ofabrico, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, pagination: { limit: 1 }, filter: { temp_ofabrico }, parameters: { method: "TempOrdemFabricoGet" }, signal });
    return (Array.isArray(rows) && rows.length >= 1) ? rows[0] : false;
}

export default ({ parameters, extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [form] = Form.useForm();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const dataAPIArtigos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "ordemfabrico" });
    const [activeTab, setActiveTab] = useState();
    const [changedTabs, setChangedTabs] = useState([]);
    const primaryKeys = [];

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal } = {}) => {
        props?.setTitle({ title: `Ordem de Fabrico ${parameters?.ofabrico}` });
        const row = await LoadOrdemFabricoTemp({ temp_ofabrico: parameters?.temp_ofabrico, signal });
        if (row) {
            console.log(row)
            form.setFieldsValue({
                ...row,
                start_prev_date: row?.start_prev_date ? dayjs(row?.start_prev_date, DATETIME_FORMAT) : null,
                end_prev_date: row?.end_prev_date ? dayjs(row?.end_prev_date, DATETIME_FORMAT) : null,
                sentido_enrolamento: ENROLAMENTO_OPTIONS.find(v => v.value == row.sentido_enrolamento)
                /* , nbobines: (record.qty_item / oFabricoTemp.sqm_bobine).toFixed(2) */
            });
            setActiveTab(props?.tab ? props.tab : "1");
            submitting.end();
        }
    }

    const onFinish = async () => {
        submitting.trigger();
        const values = form.getFieldsValue(true);
        



        try {
            switch (activeTab) {
                case "1":
                    const v = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
                    let { errors, warnings, value, ...status } = getStatus(v);
                    //errors++;
                    //status.fieldStatus.start_prev_date = { status: "error", messages: [{ message: "A sigla do cliente é obrigatória! A sigla não está definida." }] };
                    setFieldStatus({ ...status.fieldStatus });
                    setFormStatus({ ...status.formStatus });

                    if (errors === 0) {

                    }

                    break;
                case "2": break;
                case "3": break;
                case "4": break;
                case "5": break;
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        }

        submitting.end();
    }

    const onTabChange = (k) => {
        //Guarda a tab selecionada no parent, por forma a abrir sempre no último selecionado.
        if (props?.setTab) { props.setTab(k); }
        setActiveTab(k);
    }

    const onValuesChange = (changedValues, values, source) => {
        setChangedTabs([...new Set([...changedTabs, activeTab])]);
        console.log("changedddddd", changedValues, values, source)
        if ("YYYY" in changedValues) {
            //console.log(changedValues)
            //form.setFieldsValue("YYYY", null);
        }
    }

    return (
        <YScroll>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-VAL" fluid forInput={permission.isOk({ item: "planeamento" })} loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }}>


                <Tabs type="card" dark={1} defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}
                    items={[
                        {
                            label: `Requisitos`,
                            key: '1',
                            children: <FormRequirements form={form} {...{ parameters: { ...props?.parameters, cliente_id: form.getFieldValue("cliente_id") }, permission }} />
                        },
                        {
                            label: `Ordens Fabrico`,
                            key: '2',
                            children: <FormAgg form={form} {...{ parameters: { ...props?.parameters, agg_of_id: form.getFieldValue("agg_of_id") }, permission }} />
                        },
                        {
                            label: `Nonwovens`,
                            key: '3',
                            children: <div></div>,
                        },
                        {
                            label: `Especificações`,
                            key: '4',
                            children: <div></div>,
                        },
                        {
                            label: `Formulação`,
                            key: '5',
                            children: <div></div>,
                        },
                        {
                            label: `Gama Operatória`,
                            key: '6',
                            children: <div></div>,
                        },
                        {
                            label: `Cortes`,
                            key: '7',
                            children: <div></div>,
                        }
                    ]}
                />



                {extraRef && <Portal elId={extraRef.current}>
                    {permission.isOk({ item: "planeamento" }) && <Space>
                        <Button disabled={submitting.state} type="primary" onClick={onFinish}>Submeter para Produção</Button>
                        <Button disabled={submitting.state} onClick={closeSelf}>Cancelar</Button>
                        <Button disabled={submitting.state} type="primary" onClick={onFinish}>Guardar</Button>
                    </Space>}
                </Portal>
                }
            </FormContainer>
        </YScroll>
    )

}