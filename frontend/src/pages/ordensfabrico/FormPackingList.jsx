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
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import Reports, { downloadReport } from "components/DownloadReports";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Table from 'components/TableV3';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN, MODO_EXPEDICAO } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";


const TitleForm = ({ ofabrico }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div><ExclamationCircleOutlined style={{ color: "#faad14" }} /></div>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 800 }}>Validar Ordem de Fabrico</div>
                <div style={{ color: "#1890ff" }}>{ofabrico}</div>
            </div>
        </div>
    );
}

const schema = (options = {}) => {
    return getSchema({
        // produto_cod: Joi.string().label("Designação do Produto").required(),
        // artigo_formu: Joi.string().label("Fórmula").required(),
        // artigo_nw1: Joi.string().label("Nonwoven 1").required(),
        // typeofabrico: Joi.number().integer().min(0).max(2).label("Tipo Ordem de Fabrico").required(),
        // artigo_width: Joi.number().integer().min(1).max(5000).label("Largura").required(),
        // artigo_diam: Joi.number().integer().min(1).max(5000).label("Diâmetro").required(),
        // artigo_core: Joi.number().integer().valid(3, 6).label("Core").required(),
        // artigo_gram: Joi.number().integer().min(1).max(1000).label("Gramagem").required(),
        // artigo_thickness: Joi.number().integer().min(0).max(5000).label("Espessura").required()
    }, options).unknown(true);
}

const fetchCargas = async ({ enc, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/cargas/sql/`, parameters: { method: "CargasLookup" }, pagination: { limit: 20 }, filter: { enc }, signal });
    return rows;
}

export default ({ extraRef, parentRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [form] = Form.useForm();
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/cargas/sql/`, parameters: { method: "CargasLookup" }, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "ordemfabrico" });
    const [cargas, setCargas] = useState();
    const primaryKeys = [];

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, { ...props?.parameters }, { ...location?.state }, null);
            inputParameters.current = paramsIn;
        }
        setFormDirty(false);
        let { filterValues, fieldValues } = fixRangeDates(null, inputParameters.current);
        setCargas(await fetchCargas({ enc: inputParameters.current.iorder, signal }));
        console.log(inputParameters.current);
        const _modo_exp = MODO_EXPEDICAO.find(v => v.value == inputParameters.current.modo_exp);
        form.setFieldsValue({ produto_cod: inputParameters.current?.produto_cod, container_trailer: inputParameters.current?.matricula_reboque, matricula: inputParameters.current?.matricula, modo_exp: _modo_exp?.label });
        submitting.end();
    }

    const onFinish = async () => {
        const values = form.getFieldsValue(true);
        let dataexport = {
            ...inputParameters.current.report,
            "conn-name": "PG-SGP-GW",
            "data": {
                "TITLE": "PACKING LIST",
                "PRODUCT_ID": values.produto_cod,
                "CONTAINER": values.container,
                "CONTAINER-TRAILER": values.container_trailer,
                "MODO-EXP": values.modo_exp,
                ...(values.carga && { "CARGA_ID": values.carga }),
                "PRF_COD": inputParameters.current.prf,
                "ORDER_COD": inputParameters.current.iorder,
                "PO_COD": values.po,
                "DATES": values.dates
            }
        };
        downloadReport({ dataAPI, url: `${API_URL}/print/sql/`, method: "ExportFile", type: { key: inputParameters.current.report.export }, dataexport, limit: 5000 });
    }

    const onValuesChange = (changedValues, values) => {
        // if ("YYYY" in changedValues) {
        //     //console.log(changedValues)
        //     //form.setFieldsValue("YYYY", null);
        // }
    }

    return (
        <YScroll>
            {!submitting.state && <FormContainer id="LAY-PKL" fluid forInput={permission.isOk({ item: "packingList" })} loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col xs={12}><Field forInput={false} name="produto_cod" label={{ enabled: true, width: "60px", text: "Produto", pos: "top" }}><Input size="small" /></Field></Col>
                    <Col xs={12}><Field name="container" label={{ enabled: true, width: "60px", text: "Container", pos: "top" }}><Input size="small" /></Field></Col>
                    <Col xs={12}><Field name="container_trailer" label={{ enabled: true, width: "60px", text: "Trailer Container", pos: "top" }}><Input size="small" /></Field></Col>
                    <Col xs={6}><Field name="modo_exp" label={{ enabled: true, width: "60px", text: "Modo Expedição", pos: "top" }}><Input size="small" /></Field></Col>
                    <Col xs={6}><Field name="po" label={{ enabled: true, width: "60px", text: "PO (Cliente)", pos: "top" }}><Input size="small" /></Field></Col>
                    {inputParameters.current.report.name === "PACKING-LIST" && <Col xs={12}><Field name="dates" layout={{ middle: "align-items:center;" }} label={{ enabled: true, width: "160px", text: "Data Produção/Validade", pos: "left" }}><CheckboxField /></Field></Col>}
                    <Col xs={12}><Field name="carga" label={{ enabled: true, width: "60px", text: "Carga", pos: "top" }}>

                        <SelectField
                            placeholder="Cargas"
                            size="small"
                            keyField="id"
                            textField="carga"
                            dropdownMatchSelectWidth={250}
                            allowClear
                            data={cargas}
                        />

                    </Field></Col>
                </Row>
                {parentRef && <Portal elId={parentRef.current}>
                    {permission.isOk({ item: "packingList" }) && <Space>
                        <Button disabled={submitting.state} type="primary" onClick={onFinish}>Imprimir</Button>
                    </Space>}
                </Portal>
                }
            </FormContainer>}
        </YScroll>
    )

}