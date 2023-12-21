import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { uid } from 'uid';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, sleep } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { json, excludeObjectKeys, arrayItem } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, BorderOutlined, ExperimentOutlined, CopyOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor, LabParametersUnitEditor, InputTableEditor, BooleanTableEditor, StatusTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, Status, MetodoTipo, MetodoMode } from 'components/TableColumns';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';


const title = "Especificações";
const TitleForm = ({ data, onChange, level, auth, form }) => {
    return (<ToolbarTitle id={auth?.user} description={title} title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }} wrap="nowrap" nogutter>
                <Col xs='content' style={{}}><Row nogutter><Col title={title} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}><span style={{}}>{title}</span></Col></Row></Col>
                {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
            </Row>

        </Col>
    </>
    }
    />);
}
const useStyles = createUseStyles({});
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const rowSchema = (options = {}, required = false) => {
    return getSchema({
        ...required ? {
            value1: Joi.number().required().label("TDS Mínimo"),
            value2: Joi.number().required().min(Joi.ref('value1')).label("TDS Máximo").messages({ 'number.min': '"TDS Máximo" tem de ser maior ou igual ao "TDS Mínimo"' }),
            value3: Joi.number().required().min(Joi.ref('value1')).label("Objetivo Mínimo").messages({ 'number.min': '"Objetivo Mínimo" tem de ser maior ou igual ao "TDS Mínimo"' }),
            value4: Joi.number().required().min(Joi.ref('value3')).max(Joi.ref('value2')).label("Objectivo Máximo").messages({
                'number.min': '"Objetivo Máximo" tem de ser maior ou igual ao "Objetivo Mínimo"',
                'number.max': '"Objetivo Máximo" tem de ser menor ou igual ao "TDS Máximo"'
            })
        } : {
            value1: Joi.number().label("TDS Mínimo").allow(null),
            value2: Joi.number().min(Joi.ref('value1')).label("TDS Máximo").messages({ 'number.min': '"TDS Máximo" tem de ser maior ou igual ao "TDS Mínimo"' }).allow(null),
            value3: Joi.number().min(Joi.ref('value1')).label("Objetivo Mínimo").messages({ 'number.min': '"Objetivo Mínimo" tem de ser maior ou igual ao "TDS Mínimo"' }).allow(null),
            value4: Joi.number().min(Joi.ref('value3')).max(Joi.ref('value2')).label("Objectivo Máximo").allow(null).messages({
                'number.min': '"Objetivo Máximo" tem de ser maior ou igual ao "Objetivo Mínimo"',
                'number.max': '"Objetivo Máximo" tem de ser menor ou igual ao "TDS Máximo"'
            })
        }


    }, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, auth, num, v, ...props }) => {
    return (<>
        {true && <>
            <Col width={200}>
                <Field name="fdes" shouldUpdate label={{ enabled: true, text: "Designação", pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear />
                </Field>
            </Col>
        </>}
    </>
    );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    /* { fgroup: { label: "Grupo", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcod: { label: "Artigo Cód.", field: { type: 'input', size: 'small' }, span: 8 }, fdes: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span: 16 } }, */
];


const postProcess = async (dt, submitting) => {
    for (let [i, v] of dt.rows.entries()) {
        const _a = json(v?.values, null);
        if (_a && Array.isArray(_a) && _a.length === 4) {
            dt.rows[i]["value1"] = parseFloat(_a[0]).toFixed(dt.rows[i].value_precision);
            dt.rows[i]["value2"] = parseFloat(_a[1]).toFixed(dt.rows[i].value_precision);
            dt.rows[i]["value3"] = parseFloat(_a[2]).toFixed(dt.rows[i].value_precision);
            dt.rows[i]["value4"] = parseFloat(_a[3]).toFixed(dt.rows[i].value_precision);
        }
    }
    submitting.end();
    return dt;
}

export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "quality", item: "parameters" });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: false, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});
    const [form] = Form.useForm();

    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = { method: "ListArtigoSpecsParameters" };
    const defaultSort = [];
    const submitting = useSubmitting(true);
    const dataAPI = useDataAPI({ id: props?.id, fnPostProcess: (dt) => postProcess(dt, submitting), payload: { url: `${API_URL}/qualidade/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: false, limit: 150 }, filter: defaultFilters } });


    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "textarea": return <TextAreaViewer parameters={modalParameters.parameters} />;
                case "ordensfabrico": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const addToOFabrico = () => {
        const { id, artigo_id, cliente_cod } = inputParameters.current;
        const _filter = { id, artigo_id, cliente_cod };
        setModalParameters({
            content: "ordensfabrico", responsive: true, type: "drawer", width: 1200, title: "Ordens de Fabrico em Elaboração", push: false, loadData: () => { }, parameters: {
                payload: { payload: { url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "of_id", parameters: { method: "OrdensFabricoInElaborationAllowed" }, pagination: { enabled: false, limit: 50 }, filter: { ..._filter }, sort: [] } },
                toolbar: false,
                //pt.status,pf.designacao,pf.group_name ,pf.subgroup_name , pf.versao, pt2.cliente_nome
                columns: [
                    { name: 'cod', header: 'Agg', minWidth: 160 },
                    { name: 'of_id', header: 'Ordem', minWidth: 160 },
                    { name: 'cliente_nome', header: 'Cliente', minWidth: 160, flex: 1 },
                    { name: 'designacao', header: 'Formulação Des.', minWidth: 160, flex: 1 },
                    { name: 'group_name', header: 'Formulação Grupo', minWidth: 160, flex: 1 },
                    { name: 'subgroup_name', header: 'Formulação Subgrupo', minWidth: 160, flex: 1 },
                    { name: 'versao', header: 'Versão', width: 90 },
                ],
                onSelect: onSelectOrdemFabrico
                // filters: { fofabrico: { type: "any", width: 150, text: "Ordem", autoFocus: true } },
            },

        });
        showModal();
    }

    const onSelectOrdemFabrico = async ({ rowProps, closeSelf }) => {
        let response = null;
        try {
            response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { aggid: rowProps?.data?.id }, parameters: { method: "SetOrdemFabricoFormulacao", ...inputParameters.current } });
            if (response.data.status !== "error") {
                closeSelf();
                openNotification(response.data.status, 'top', "Notificação", response.data.title);
            } else {
                openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
            }
        } catch (e) {
            openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        } finally {
        };
    }




    const columnEditable = (v, { data, name }) => {
        if (["value1", "value2", "value3", "value4", "required", "decisive","cycles","functions"].includes(name) && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
            return true;
        }
        return false;
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        if (dataAPI.getFieldStatus(data[dataAPI.getPrimaryKey()])?.[name]?.status === "error") {
            return tableCls.error;
        }
        if (["value1", "value2", "value3", "value4", "required", "decisive","cycles","functions"].includes(name) && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
            return tableCls.edit;
        }
    };

    const groups = [
        { name: 'tds', header: 'TDS', headerAlign: "center" },
        { name: 'target', header: 'Objetivo', headerAlign: "center" }
    ]
    const columns = [
        ...(true) ? [{ name: 'parameter_nome', header: 'Nome', editable: columnEditable, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'parameter_des', header: 'Designação', editable: columnEditable, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'parameter_type', header: 'Tipo', render: ({ data, cellProps }) => <MetodoTipo cellProps={cellProps} value={data?.parameter_type} />, userSelect: true, defaultLocked: false, width: 100, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'parameter_mode', header: 'Modo', render: ({ data, cellProps }) => <MetodoMode cellProps={cellProps} value={data?.parameter_mode} />, userSelect: true, defaultLocked: false, width: 100, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'value1', header: 'Min.', group: "tds", editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: props?.cellProps?.data?.min_value, max: props?.cellProps?.data?.max_value }} {...props} />, render: ({ data, cellProps }) => <RightAlign style={{ fontWeight: 700 }}>{data?.value1}</RightAlign>, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 80, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'value2', header: 'Max', group: "tds", editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: props?.cellProps?.data?.min_value, max: props?.cellProps?.data?.max_value }} {...props} />, render: ({ data, cellProps }) => <RightAlign style={{ fontWeight: 700 }}>{data?.value2}</RightAlign>, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 80, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'value3', header: 'Min.', group: "target", editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: props?.cellProps?.data?.min_value, max: props?.cellProps?.data?.max_value }} {...props} />, render: ({ data, cellProps }) => <RightAlign style={{ fontWeight: 700 }}>{data?.value3}</RightAlign>, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 80, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'value4', header: 'Max', group: "target", editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: props?.cellProps?.data?.min_value, max: props?.cellProps?.data?.max_value }} {...props} />, render: ({ data, cellProps }) => <RightAlign style={{ fontWeight: 700 }}>{data?.value4}</RightAlign>, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 80, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'unit', header: 'Unidade', editable: columnEditable, renderEditor: (props) => <LabParametersUnitEditor dataAPI={dataAPI} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 90, headerAlign: "center" }] : [],
        //...(true) ? [{ name: 'nvalues', header: 'Nº Valores', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 1, max: 12 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'min_value', header: 'Min', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 100 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 80, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'max_value', header: 'Max', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 100 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 80, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'cycles', header: 'Ciclos', editable: columnEditable, renderEditor: (props) => <InputTableEditor {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'functions', header: 'Funções', editable: columnEditable, renderEditor: (props) => <InputTableEditor {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
                ...(true) ? [{ name: 'value_precision', header: 'Precisão', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 6 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 80, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'status', header: 'Estado', editable: columnEditable, renderEditor: (props) => <StatusTableEditor {...props} checkbox={true} genre="m" />, render: ({ data, cellProps }) => <Status cellProps={cellProps} value={data?.status} genre="m" />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 100, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'decisive', header: 'Decisivo', editable: columnEditable, renderEditor: (props) => <BooleanTableEditor {...props} />, render: ({ data, cellProps }) => <Bool cellProps={cellProps} value={data?.decisive} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 80, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'required', header: 'Obrigatório', editable: columnEditable, renderEditor: (props) => <BooleanTableEditor {...props} />, render: ({ data, cellProps }) => <Bool cellProps={cellProps} value={data?.required} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 80, headerAlign: "center" }] : [],

    ];


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, null);
            inputParameters.current = paramsIn;
        }
        setFormDirty(false);
        let { filterValues, fieldValues } = fixRangeDates([], inputParameters.current);
        formFilter.setFieldsValue({ ...excludeObjectKeys(fieldValues, ["*"]) });
        dataAPI.setBaseFilters({ lab_artigospecs_id: filterValues?.id });
        dataAPI.addFilters({ ...excludeObjectKeys(filterValues, ["*"]) }, true);
        dataAPI.setSort(dataAPI.getSort(), defaultSort);
        dataAPI.addParameters({ ...defaultParameters }, true);
        submitting.end();
    }

    const onFilterFinish = (type, values) => {
        //Required Filters
        // const _data = { start: values?.fdata?.startValue?.format(DATE_FORMAT), end: values?.fdata?.endValue?.format(DATE_FORMAT) };
        // const { errors, warnings, value, messages, ...status } = getStatus(schema().validate(_data, { abortEarly: false, messages: validateMessages, context: {} }));
        // if (errors > 0) {
        //     openNotification("error", 'top', "Notificação", messages.error);
        // } else {
        //     if (warnings > 0) {
        //         openNotification("warning", 'top', "Notificação", messages.warning);
        //     }
        //}
        switch (type) {
            case "filter":
                //remove empty values
                const vals = dataAPI.removeEmpty({ ...defaultFilters, ...values });
                const _values = {
                    ...vals,
                    //fdes: getFilterValue(vals?.fdes, 'any'),
                    //fcod: getFilterValue(vals?.fcod, 'any'),
                    //fdes: getFilterValue(vals?.fdes, 'any'),
                    //f1: getFilterValue(vals?.f1, 'any'),
                    //f2: getFilterRangeValues(vals?.f2?.formatted)
                };
                dataAPI.addFilters(dataAPI.removeEmpty(_values));
                dataAPI.addParameters(defaultParameters);
                dataAPI.first();
                dataAPI.setAction("filter", true);
                dataAPI.update(true);
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onEditComplete = ({ value, columnId, rowIndex, data, ...rest }) => {
        const index = rowIndex;
        if (index >= 0) {
            let _rows = [];
            if (["value1", "value2", "value3", "value4"].includes(columnId)) {
                _rows = dataAPI.updateValues(index, columnId, { [columnId]: value ? parseFloat(value).toFixed(data?.value_precision) : null });
            } else {
                _rows = dataAPI.updateValues(index, columnId, { [columnId]: value });
            }
            const required = (_rows[rowIndex]?.value1 || _rows[rowIndex]?.value2 || _rows[rowIndex]?.value3 || _rows[rowIndex]?.value4) ? true : _rows[rowIndex]?.required;
            const _status = dataAPI.validateRow(rowSchema({}, required), {}, {}, _rows[rowIndex], rowIndex);
            dataAPI.updateRowStatus(_status, data[dataAPI.getPrimaryKey()]);
        }
    }

    const onSave = async (type) => {
        const rows = dataAPI.getData().rows;
        // const rows = dataAPI.dirtyRows();
        for (const [i, r] of rows.entries()) {
            const required = (r?.value1 || r?.value2 || r?.value3 || r?.value4) ? true : r?.required;
            const _status = dataAPI.validateRow(rowSchema({}, required), {}, {}, r, i);
            dataAPI.updateRowStatus(_status, r[dataAPI.getPrimaryKey()], false);
        }
        dataAPI.updateStatus();
        if (rows && rows.length > 0 && dataAPI.status().errors === 0) {
            submitting.trigger();
            let response = null;
            try {
                response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "UpdateArtigoSpecsParameters", rows }, filter: { ...inputParameters.current } });
                if (response.data.status !== "error") {
                    dataAPI.update(true);
                    openNotification(response.data.status, 'top', "Notificação", response.data.title);
                } else {
                    openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
                }
            } catch (e) {
                console.log(e)
                openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
            } finally {
                submitting.end();
            };
        }
    }

    const onAddSave = async (type) => {
        // const rows = dataAPI.dirtyRows();
        // if (rows && rows.length > 0) {
        //     submitting.trigger();
        //     let response = null;
        //     try {
        //         const status = dataAPI.validateRows(rowSchema); //Validate all rows
        //         const msg = dataAPI.getMessages();
        //         if (status.errors > 0) {
        //             openNotification("error", "top", "Notificação", msg.error, 5, { width: "500px" });
        //         } else {
        //             response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "NewLabParameter", data: excludeObjectKeys(rows[0], ["id", "rowadded", "rowvalid"]) } });
        //             if (response.data.status !== "error") {
        //                 dataAPI.setAction("load", true);
        //                 dataAPI.update(true);
        //                 setMode((prev) => ({ ...prev, datagrid: { ...mode?.datagrid, add: false } }));
        //                 openNotification(response.data.status, 'top', "Notificação", response.data.title);
        //             } else {
        //                 openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
        //             }
        //         }
        //     } catch (e) {
        //         console.log(e)
        //         openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        //     } finally {
        //         submitting.end();
        //     };
        // }
    }
    const onAdd = (cols) => {
        // dataAPI.addRow({ ...cols, nvalues: 4, min_value: 0, value_precision: 0 }, null, 0);
    }
    const onDelete = (data, rowIndex) => {
        // if (data?.rowadded === 1) {
        //     dataAPI.deleteRow({ [dataAPI.getPrimaryKey()]: data?.[dataAPI.getPrimaryKey()] }, [dataAPI.getPrimaryKey()]);
        //     dataAPI.setAction("edit", true);
        //     dataAPI.update(true);
        // } else {
        //     dataAPI.validateRows(rowSchema, {}, {}, _rows);
        //     Modal.confirm({
        //         content: <div>Tem a certeza que deseja eliminar o parâmetro <span style={{ fontWeight: 700 }}>{data?.designacao}</span>?</div>, onOk: async () => {
        //             submitting.trigger();
        //             let response = null;
        //             try {
        //                 const status = dataAPI.validateRows(rowSchema); //Validate all rows
        //                 const msg = dataAPI.getMessages();
        //                 if (status.errors > 0) {
        //                     openNotification("error", "top", "Notificação", msg.error, 5, { width: "500px" });
        //                 } else {
        //                     response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "DeleteLabMetodoParameter" }, filter: { id: data["id"] } });
        //                     if (response.data.status !== "error") {
        //                         const _rows = dataAPI.deleteRow({ [dataAPI.getPrimaryKey()]: data?.[dataAPI.getPrimaryKey()] }, [dataAPI.getPrimaryKey()]);
        //                         dataAPI.setAction("edit", true);
        //                         dataAPI.update(true);
        //                         openNotification(response.data.status, 'top', "Notificação", response.data.title);
        //                     } else {
        //                         openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
        //                     }
        //                 }
        //             } catch (e) {
        //                 console.log(e)
        //                 openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        //             } finally {
        //                 submitting.end();
        //             };
        //         }
        //     });
        // }
    }

    const rowClassName = ({ data }) => {
        // if () {
        //     return tableCls.error;
        // }
    }

    const onValuesChange = (changed, all) => {
        setFormDirty(true);
    }

    const onEditCancel = async () => {
        await loadData();
        return false;
    }

    const onCellAction = (data, column, key) => {
        if (key === "Enter" || key === "DoubleClick") {
            //setModalParameters({content: "textarea", type: "drawer", width: 550, title: column.header, push: false, parameters: {value:data[column.name]}});
            //showModal();
        }
    }

    const onDoTest = async () => {
        submitting.trigger();
        let response = null;
        try {
            response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "DoTest" }, filter: { ...inputParameters.current } });
            if (response.data.status !== "error") {
                openNotification(response.data.status, 'top', "Notificação", response.data.title);
            } else {
                openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
            }
        } catch (e) {
            console.log(e)
            openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        } finally {
            submitting.end();
        };
    }

    const onCopyTo = async () => {
        submitting.trigger();
        let response = null;
        try {
            response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "CopyTo" }, filter: { ...inputParameters.current } });
            if (response.data.status !== "error") {
                openNotification(response.data.status, 'top', "Notificação", response.data.title);
                props?.loadParentData();
            } else {
                openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
            }
        } catch (e) {
            console.log(e)
            openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        } finally {
            submitting.end();
        };
    }

    return (
        <YScroll>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            {/* <FormContainer id="form" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onValuesChange={onValuesChange} wrapFormItem={true} forInput={mode.datagrid.edit} style={{ padding: "0px" }} alert={{ tooltip: true, pos: "none" }}> */}
            {/* <Row style={{}} gutterWidth={10}>
                    <Col xs={2} md={1}><Field name="versao" forInput={false} label={{ enabled: true, text: "Versao" }}><Input /></Field></Col>
                    <Col xs={4} md={2}><FormulacaoGroups name="group_name" label={{ enabled: true, text: "Grupo" }} /></Col>
                    <Col xs={4} md={2}><FormulacaoSubGroups name="subgroup_name" label={{ enabled: true, text: "SubGrupo" }} /></Col>
                    <Col xs={12} md={6} lg={4}><Field name="designacao" label={{ enabled: true, text: "Designação" }}><Input /></Field></Col>
                    <Col xs={12} md={6} lg={4}><Produtos name="produto_id" allowClear label={{ enabled: true, text: "Produto" }} load /></Col>
                    <Col xs={12} md={6} lg={4}><Artigos name="artigo_id" allowClear label={{ enabled: true, text: "Artigo" }} load /></Col>
                    <Col xs={12} md={6} lg={4}><Clientes name="cliente" allowClear label={{ enabled: true, text: "Cliente" }} /></Col>

                </Row> */}
            {/* <Row style={{}} nogutter>
                    <Col> */}
            <Table
                offsetHeight="200px"
                dirty={formDirty}
                loading={submitting.state}
                idProperty={dataAPI.getPrimaryKey()}
                local={false}
                onRefresh={loadData}
                rowClassName={rowClassName}
                //groups={groups}
                sortable={false}
                editOnClick={true}
                groups={groups}
                reorderColumns={false}
                showColumnMenuTool
                loadOnInit={true}
                columns={columns}
                dataAPI={dataAPI}
                moreFilters={true}
                onCellAction={onCellAction}
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} auth={permission.auth} v={formFilter.getFieldsValue(true)} />,
                    moreFilters: { schema: moreFiltersSchema }
                }}
                editable={{
                    enabled: permission.isOk({ forInput: [!submitting.state], action: "edit" }),
                    add: false,
                    onAdd: onAdd, onAddSave: onAddSave,
                    onSave: () => onSave("update"), onCancel: onEditCancel,
                    modeKey: "datagrid", setMode, mode, onEditComplete
                }}
                leftToolbar={
                    <Space>
                        <Permissions permissions={permission} action="edit" forInput={[(!mode.datagrid.edit && !mode.datagrid.add)]}><Button icon={<CopyOutlined/>} onClick={onCopyTo}>Copiar</Button></Permissions>
                        <Permissions permissions={permission} action="edit" forInput={[(inputParameters.current.valid === 1), (!mode.datagrid.edit && !mode.datagrid.add)]}><Button onClick={addToOFabrico}>Associar a Ordem Fabrico</Button></Permissions>
                        <Permissions permissions={permission} action="edit" forInput={[mode.datagrid.edit]}><></></Permissions>
                        <Permissions permissions={permission} item="test" action="add" forInput={[!submitting.state, !mode.datagrid.edit, inputParameters.current?.valid ? true : false]}><Button icon={<ExperimentOutlined />} onClick={onDoTest}>Realizar Teste</Button></Permissions>
                    </Space>
                }

            />
            {/* </Col>
                </Row>
            </FormContainer> */}
        </YScroll>
    );


};