import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import moment from 'moment';
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
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission } from "utils/usePermission";
import { MediaContext } from "../App";
import { Context } from './Palete';

const schema = (options = {}) => {
    return getSchema({
        /* xxxx: Joi.any().label("xxxxx").required()*/
    }, options).unknown(true);
}

const loadPaleteLookup = async (palete_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/paletes/paletessql/`, pagination: { limit: 1 }, filter: { palete_id: `==${palete_id}` }, parameters: { method: "PaletesLookup" } });
    return rows;
}

export default (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const ctx = useContext(Context);
    //const permission = usePermission({ allowed: { producao: 100, planeamento: 100 } });//Permissões Iniciais
    //const [allowEdit, setAllowEdit] = useState({ form: false, datagrid: false });//Se tem permissões para alterar (Edit)
    //const [modeEdit, setModeEdit] = useState({ form: false, datagrid: false }); //Se tem permissões para alternar entre Mode Edit e View
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [form] = Form.useForm();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal } = {}) => {
        /*if (!permission.allow()) {
            Modal.error({ content: "Não tem permissões!" });
            return;
        } */

        const { ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, { ...props?.parameters, ...ctx?.parameters }, location?.state, [...Object.keys({ ...location?.state }), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys({ ...props?.parameters, ...ctx?.parameters })]);
        const formValues = await loadPaleteLookup(initFilters.palete_id);
        form.setFieldsValue(formValues.length > 0 ? {...formValues[0],timestamp:moment(formValues[0].timestamp)} : {});


        console.log("FORMPALETE####", formValues, initFilters);
        /*let { filterValues, fieldValues } = fixRangeDates([], initFilters);
        formFilter.setFieldsValue({ ...fieldValues });
        dataAPI.addFilters({ ...filterValues }, true, false);
        dataAPI.setSort(defaultSort);
        dataAPI.addParameters(defaultParameters, true, false);
        dataAPI.fetchPost({
            signal, rowFn: async (dt) => {
                submitting.end();
                return dt;
            }
        });*/
        submitting.end();
    }

    const onFinish = async (values) => {
        submitting.trigger();
        const v = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);
        /* if (values.XXXX < values.YYYY) {
            errors = 1;
            status.fieldStatus.ZZZZZ = { status: "error", messages: [{ message: "Error description." }] };
        } */
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            try {
                let vals = {

                }
                let response = await fetchPost({ url: `${API_URL}/api_to_call/`, filter: { ...vals }, parameters: {} });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: `Sucesso...` })
                } else {
                    status.formStatus.error.push({ message: response.data.title });
                    setFormStatus({ ...status.formStatus });
                }
            } catch (e) {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            };

        }
        submitting.end();
    }

    const onValuesChange = (changedValues, values) => {
        if ("YYYY" in changedValues) {
            //console.log(changedValues)
            //form.setFieldsValue("YYYY", null);
        }
    }




    return (
        <>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-FP" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={false} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col width={150}><Field name="nome" label={{ enabled: true, text: "Lote" }}><Input size="small" /></Field></Col>
                    <Col width={160}><Field name="timestamp" label={{ enabled: true, text: "Data" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                    <Col width={400}><Field name="cliente_nome" label={{ enabled: true, text: "Cliente" }}><Input size="small" /></Field></Col>
                    <Col width={150}><Field name="cliente_diamref" label={{ enabled: true, width:"200px", text: "Diâmetro Referência" }}><InputNumber style={{width:"80px"}} size="small" addonAfter="mm" /></Field></Col>
                    <Col width={150}><Field name="cliente_liminf" label={{ enabled: true, width:"200px", text: "Diâmetro Lim. Inf." }}><InputNumber style={{width:"80px"}} size="small" addonAfter="mm" /></Field></Col>
                    <Col width={150}><Field name="cliente_limsup" label={{ enabled: true, width:"200px", text: "Diâmetro Lim. Sup." }}><InputNumber style={{width:"80px"}} size="small" addonAfter="mm" /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field name="destino" label={{ enabled: true, text: "Destino" }}><Input size="small" /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field name="ofid" label={{ enabled: true, text: "Ordem Fabrico" }}><Input size="small" /></Field></Col>
                    <Col><Field name="op" label={{ enabled: true, text: "" }}><Input size="small" /></Field></Col>
                    <Col><Field name="ofid_original" label={{ enabled: true, text: "Ordem Fabrico" }}><Input size="small" /></Field></Col>
                    <Col><Field name="op_original" label={{ enabled: false, text: "Ordem Fabrico Original" }}><Input size="small" /></Field></Col>
                </Row>
            </FormContainer>
        </>
    )

}