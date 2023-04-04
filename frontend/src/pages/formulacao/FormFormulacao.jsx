import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
//import moment from 'moment';
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
// import ToolbarTitle from './commons/ToolbarTitle';
const { Title } = Typography;
import { json } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign } from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';
import { BsFillEraserFill } from 'react-icons/bs';

const primaryKey = "rowid";
const title = "Formulação";
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
const rowSchema = (options = {}) => {
    return getSchema({
        "matprima_des": Joi.string().label("Matéria Prima").required(),
        // "des": Joi.string().label("des").required()
    }, options).unknown(true);
}



const loadFormulacao = async (params, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...params }, sort: [], parameters: { method: "GetFormulacao" }, signal });
    if (rows && rows.length > 0) {
        let _v = json(rows[0]?.formulacao);
        if (!_v?.items) {
            _v["items"] = [];
        }
        if (!("joinbc" in _v) || _v?.joinbc == 1) {
            _v["items"] = _v?.items?.filter(v => v?.extrusora !== "C").map(v => ({ ...v, [primaryKey]: `${v.extrusora}-${uid(4)}` })).sort((a, b) => a.extrusora.localeCompare(b.extrusora));
        } else {
            _v["items"] = _v?.items?.map(v => ({ ...v, [primaryKey]: `${v.extrusora}-${uid(4)}` })).sort((a, b) => a.extrusora.localeCompare(b.extrusora));
        }
        return _v;
    }
    return {};
}

const FieldSelectorEditor = ({ dataAPI, selectorProps, ...props }) => {
    const onChange = async (v) => {
        props.onChange(v === '' ? null : v);
        await sleep(100);
        props.onComplete(v === '' ? null : v);
    };
    const onComplete = (v) => {
        props.onComplete(v === '' ? null : v);
    }
    const onSelect = (v) => {
        props.onChange(v === '' ? null : v);
    };
    const onKeyDown = (e) => {
        if (e.key == 'Escape') {
            props.onCancel();
        }
        if (e.key == 'Tab') {
            e.preventDefault();
            e.stopPropagation();
            props.onTabNavigation(
                true /*complete navigation?*/,
                //e.shiftKey ? -1 : 1 /*backwards of forwards*/
            );
        }
    }
    return (<>
        <Selector
            onKeyDown={onKeyDown}
            autoFocus
            value={selectorProps?.value}
            onChange={onChange}
            style={{ width: "100%" }}
            {...selectorProps}
        />
        {/* <AutoCompleteField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={props.value} ref={focus} onSelect={onSelect} onChange={onChange} onBlur={onComplete}
        onKeyDown={onKeyDown}
        size="small"
        keyField="group"
        textField="group"
        showSearch
        showArrow
        allowClear
        fetchOptions={async (value) => await fetchGroups({ value, groups: dataAPI.dirtyRows().map(v => v?.group) })}
      /> */}
    </>
    );
}

const InputNumberEditor = ({ dataAPI, inputProps, ...props }) => {
    const onChange = async (v) => {
        props.onChange(v === '' ? null : v);
    };
    const onComplete = (v) => {
        props.onComplete(v === '' ? null : v);
    }
    const onKeyDown = (e) => {
        if (e.key == 'Escape') {
            props.onCancel();
        }
        if (e.key == 'Tab' || e.key == "Enter") {
            e.preventDefault();
            e.stopPropagation();
            props.onTabNavigation(
                true /*complete navigation?*/,
                //e.shiftKey ? -1 : 1 /*backwards of forwards*/
            );
        }
    }
    return (<InputNumber onKeyDown={onKeyDown}
        autoFocus
        value={props?.value}
        onChange={onChange}
        onBlur={onComplete}
        style={{ width: "100%" }}
        {...inputProps}
    />);
}

const menuOptions = ({ edit, joinbc }) => [
    ...(edit && !joinbc) ? [{ key: 1, label: "Adicionar na Extrusora A" }, { key: 2, label: "Adicionar na Extrusora B" }, { key: 3, label: "Adicionar na Extrusora C" }] : [],
    ...(edit && joinbc) ? [{ key: 1, label: "Adicionar na Extrusora A" }, { key: 4, label: "Adicionar nas Extrusoras BC" }] : [],
    { type: 'divider' },
    ...(edit) ? [{ key: 5, label: <Space><Field name="reference" label={{ enabled: false }}><SwitchField /></Field><span>Formulação de Referência</span></Space> }] : [],
    { type: 'divider' },
    ...(edit) ? [{ key: 6, label: <Space><Field name="joinbc" label={{ enabled: false }}><SwitchField /></Field><span>{joinbc ? "Desagrupar extrusora BC" : "Agrupar extrusora BC"}</span></Space> }] : []
];


export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "formulacao", item: "datagrid" });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: false, add: false } });
    const [gridStatus, setGridStatus] = useState({ fieldStatus: {}, formStatus: {}, errors: 0, warnings: 0 });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const [form] = Form.useForm();
    const joinbc = Form.useWatch('joinbc', form);
    const reference = Form.useWatch('reference', form);

    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = { method: "ListArtigosCompativeis" };
    const defaultSort = [{ column: "pa.id", direction: "ASC" }];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: `${API_URL}/artigos/sql/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters } });
    const submitting = useSubmitting(true);

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                //case "<key_name>": return <Component p={modalParameters.parameters.p} column="" parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    const columnEditable = (v, { data, name }) => {
        if (["matprima_des", "densidade", "arranque", "tolerancia"].includes(name) && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
            return true;
        }
        return false;
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        if (gridStatus?.fieldStatus?.[rowIndex]?.[name]?.status === "error") {
            return tableCls.error;
        }
        if (!data?.__group && ["matprima_des", "densidade", "arranque", "tolerancia"].includes(name) && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
            return tableCls.edit;
        }
        // if (["group"].includes(name)){
        //   return tableCls.error;
        // }
    };

    const groups = [
        { name: 'extrusora', header: 'Distribuição por Extrusora', headerAlign: "center" }
    ]

    const columns = [
        ...(permission.isOk({ forInput: [!submitting.state, mode.datagrid.edit], action: "delete" })) ? [{ name: 'bdelete', header: '', headerAlign: "center", userSelect: true, defaultLocked: false, width: 45, render: ({ data }) => !data?.__group && <Button onClick={() => onDelete(data)} icon={<DeleteTwoTone />} /> }] : [],
        ...(true) ? [{ name: 'matprima_cod', header: 'Código', userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", }] : [],
        ...(true) ? [{
            name: 'matprima_des', header: 'Artigo', userSelect: true, defaultLocked: false, minWidth: 170, flex: 1, headerAlign: "center",
            editable: columnEditable, renderEditor: (props) => <FieldSelectorEditor {...props}
                selectorProps={{
                    value: { ITMREF_0: props?.cellProps?.data?.matprima_cod, ITMDES1_0: props?.cellProps?.data?.matprima_des },
                    title: "Matéria Prima",
                    params: { payload: { url: `${API_URL}/materiasprimaslookup/`, parameters: {}, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } },
                    keyField: ["ITMREF_0"],
                    textField: "ITMDES1_0",
                    columns: [
                        { key: 'ITMREF_0', name: 'Código', width: 160 },
                        { key: 'ITMDES1_0', name: 'Designação' }
                    ],
                    filters: { fmulti_artigo: { type: "any", width: 150, text: "Artigo", autoFocus: true } },
                    moreFilters: {}
                }} />,

            cellProps: { className: columnClass },
            render: ({ cellProps, data }) => {
                if (cellProps.inEdit) {
                    return <></>
                }
                if (data?.__group) {
                    return (mode.datagrid.edit && permission.isOk({ forInput: [!submitting.state], action: "add" })) &&
                        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}><Button style={{ width: "200px" }} size='small' icon={<PlusOutlined />} onClick={() => onCustomAdd(data)}>Adicionar</Button></div>;
                } else {
                    return <div style={{ fontWeight: 700 }}>{data?.matprima_des}</div>;
                }
            }
        }] : [],
        ...(true) ? [{
            name: 'densidade', header: 'Densidade', userSelect: true, defaultLocked: false, width: 150, headerAlign: "center",
            render: (p) => <RightAlign>{p.data?.densidade}</RightAlign>, cellProps: { className: columnClass },
            editable: columnEditable, renderEditor: (props) => <InputNumberEditor inputProps={{ min: 0, max: 5 }} {...props} />
        }] : [],
        ...(true) ? [{
            name: 'arranque', header: 'Arranque', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center",
            render: (p) => <RightAlign unit="%">{p.data?.arranque}</RightAlign>, cellProps: { className: columnClass },
            editable: columnEditable, renderEditor: (props) => <InputNumberEditor inputProps={{ min: 0, max: 100 }} {...props} />
        }] : [],
        ...(true) ? [{
            name: 'tolerancia', header: 'Tolerância', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center",
            render: (p) => <RightAlign unit="%">{p.data?.tolerancia}</RightAlign>, cellProps: { className: columnClass },
            editable: columnEditable, renderEditor: (props) => <InputNumberEditor inputProps={{ min: 0, max: 100 }} {...props} />
        }] : [],
        ...(true) ? [{
            name: 'vglobal', header: 'Global', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center",
            groupSummaryReducer: {
                initialValue: 0, reducer: (a, b) => parseFloat(a) + parseFloat(b),
                complete: (a, rows) => <RightAlign unit="%">{(rows[0]?.extrusora === "A" || form.getFieldValue("joinbc") == 1) ? parseFloat(a).toFixed(2) : (parseFloat(a) / 2).toFixed(2)}</RightAlign>
            }
        }] : []
    ];


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ signal } = {}) => {
        submitting.trigger();
        const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, ["formulacao_id", "cs_id", "audit_cs_id", "new"]);
        setFormDirty(false);
        if (paramsIn?.new) {
            form.setFieldsValue({ joinbc: 1, reference: 0 });
        } else {
            const { items, ...formulacao } = await loadFormulacao({ ...paramsIn }, signal);
            dataAPI.setData({ rows: items, total: items?.length });
            form.setFieldsValue({
                joinbc: 1, reference: 0, ...formulacao,
                cliente: { BPCNUM_0: formulacao?.cliente_cod, BPCNAM_0: formulacao?.cliente_nome },
                produto_id: formulacao?.produto_id,
                artigo_id: formulacao?.artigo_id
            });
        }
        submitting.end();
    }

    const onFilterFinish = (type, values) => {
        // const _data = { start: values?.fdata?.startValue?.format(DATE_FORMAT), end: values?.fdata?.endValue?.format(DATE_FORMAT) };
        // const { errors, warnings, value, messages, ...status } = getStatus(schema().validate(_data, { abortEarly: false, messages: validateMessages, context: {} }));
        // if (errors > 0) {
        //     openNotification("error", 'top', "Notificação", messages.error);
        // } else {
        //     if (warnings > 0) {
        //         openNotification("warning", 'top', "Notificação", messages.warning);
        //     }
        //     switch (type) {
        //         case "filter":
        //             //remove empty values
        //             const vals = dataAPI.removeEmpty({ ...defaultFilters, ...values });
        //             const _values = {
        //                 ...vals,
        //                 //fgroup: getFilterValue(vals?.fgroup, 'any'),
        //                 //fcod: getFilterValue(vals?.fcod, 'any'),
        //                 //fdes: getFilterValue(vals?.fdes, 'any'),
        //                 //f1: getFilterValue(vals?.f1, 'any'),
        //                 fdata: getFilterRangeValues(vals?.fdata?.formatted, true, "00:00:00", "23:59:59")
        //             };
        //             dataAPI.addFilters(dataAPI.removeEmpty(_values));
        //             dataAPI.addParameters(defaultParameters);
        //             dataAPI.first();
        //             dataAPI.setAction("filter", true);
        //             dataAPI.update(true);
        //             break;
        //     }
        // }
    };
    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onEditComplete = ({ value, columnId, rowIndex, data, ...rest }) => {
        const index = dataAPI.getData().rows.findIndex(v => v?.[primaryKey] === data?.[primaryKey]);
        if (index >= 0) {
            const { errors, warnings, fieldStatus, formStatus } = dataAPI.validateField(rowSchema, columnId, value, rowIndex, gridStatus);
            setGridStatus({ errors, warnings, fieldStatus, formStatus });
            if (columnId === "matprima_des") {
                dataAPI.updateValues(index, columnId, { matprima_cod: value?.ITMREF_0, matprima_des: value?.ITMDES1_0 });
            } else {
                const _ponderacao = FORMULACAO_PONDERACAO_EXTRUSORAS[data.extrusora === "A" ? "A" : "BC"] / 100;
                const _vglobal = columnId === "arranque" ? value * _ponderacao : data.vglobal;
                dataAPI.updateValues(index, columnId, { [columnId]: value, vglobal: parseFloat(_vglobal).toFixed(2) });
                //dataAPI.updateValue(index, columnId, value);
            }
        }

    }

    const onSave = async (type) => {
        console.log(dataAPI.getData().rows);
        console.log(form.getFieldsValue(true));



        // const rows = dataAPI.dirtyRows().map(({ id, group }) => ({ artigo_id: id, group }));
        submitting.trigger();
        let response = null;
        try {
            const { errors, warnings, fieldStatus, formStatus } = dataAPI.validateRows(rowSchema);
            setGridStatus({ errors, warnings, fieldStatus, formStatus });
            if (errors === 0) {
                //response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "SaveFormulacao", ...form.getFieldsValue(true), items: dataAPI.getData().rows } });
                //if (response.data.status !== "error") {
                //    dataAPI.update(true);
                //    openNotification(response.data.status, 'top', "Notificação", response.data.title);
                //} else {
                //    openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
                //}
            }
        } catch (e) {
            openNotification(response.data.status, 'top', "Notificação", e.message, null);
        } finally {
            submitting.end();
        };
    }

    const onAddSave = async (type) => {
        // const rows = dataAPI.getData().rows;
        // submitting.trigger();
        // let response = null;
        // try {
        //     const { errors, warnings, fieldStatus, formStatus } = dataAPI.validateRows(rowSchema);
        //     setGridStatus({ errors, warnings, fieldStatus, formStatus });
        //     if (errors === 0) {
        //         //response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "UpdateArtigosCompativeis", rows } });
        //         //if (response.data.status !== "error") {
        //         //  dataAPI.update(true);
        //         //  openNotification(response.data.status, 'top', "Notificação", response.data.title);
        //         //} else {
        //         ///  openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
        //         //}
        //     }
        // } catch (e) {
        //     //openNotification(response.data.status, 'top', "Notificação", e.message, null);
        // } finally {
        //     submitting.end();
        // };
    }
    const onAdd = (cols) => {
        dataAPI.addRow(cols, null, 0);
    }
    const onDelete = (data) => {
        dataAPI.deleteRow({ [primaryKey]: data?.[primaryKey] }, [primaryKey]);
    }
    const onCustomAdd = (data) => {
        if (Array.isArray(data)) {
            dataAPI.addRows([
                { rowid: `${data[0].value}-${uid(4)}`, extrusora: data[0].value, tolerancia: 0.5, arranque: 0, densidade: 0, vglobal: 0 },
                { rowid: `${data[1].value}-${uid(4)}`, extrusora: data[1].value, tolerancia: 0.5, arranque: 0, densidade: 0, vglobal: 0 }
            ], null, 0, (r) => {
                return r.sort((a, b) => a?.extrusora?.localeCompare(b?.extrusora));
            });
        } else {
            dataAPI.addRow({ rowid: `${data.value}-${uid(4)}`, extrusora: data.value, tolerancia: 0.5, arranque: 0, densidade: 0, vglobal: 0 }, null, 0, (r) => {
                return r.sort((a, b) => a?.extrusora?.localeCompare(b?.extrusora));
            });
        }
        dataAPI.update();
    }

    const rowClassName = ({ data }) => {
        // if (!data?.n_lote) {
        //     return tableCls.error;
        // }
    }

    const menuClick = (v) => {
        switch (v.key) {
            case '1': onCustomAdd({ value: "A" }); break;
            case '2': onCustomAdd({ value: "B" }); break;
            case '3': onCustomAdd({ value: "C" }); break;
            case '4': onCustomAdd({ value: "B" }); break;
            case '6':
                if (form.getFieldValue("joinbc") === 1) {
                    if (dataAPI.getData().rows) {
                        let _items = dataAPI.getData().rows.filter(x => x?.extrusora !== "C")
                        dataAPI.setData({ rows: _items, total: _items?.length });
                    }
                } else {
                    if (dataAPI.getData().rows) {
                        let _items = dataAPI.getData().rows.filter(x => x?.extrusora !== "C")
                        let _itemsC = _items.filter(x => x?.extrusora === "B").map(x => ({ ...x, extrusora: "C" }));
                        dataAPI.setData({ rows: [..._items, ..._itemsC], total: _items?.length + _itemsC?.length });
                    }
                }
                break;
            default: break;
        }
    }

    const onValuesChange = (changed, all) => {
        setFormDirty(true);
    }

    const onEditCancel = async () => {
        await loadData();
        return false;
    }

    return (
        <YScroll>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            <FormContainer id="form" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onValuesChange={onValuesChange} wrapFormItem={true} forInput={mode.datagrid.edit} style={{ padding: "0px" }} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col xs={2} md={1}><Field name="versao" forInput={false} label={{ enabled: true, text: "Versao" }}><Input /></Field></Col>
                    <Col xs={4} md={2}><FormulacaoGroups name="group_name" label={{ enabled: true, text: "Grupo" }} /></Col>
                    <Col xs={4} md={2}><FormulacaoSubGroups name="subgroup_name" label={{ enabled: true, text: "SubGrupo" }} /></Col>
                    <Col xs={12} md={6} lg={4}><Field name="designacao" label={{ enabled: true, text: "Designação" }}><Input /></Field></Col>
                    <Col xs={12} md={6} lg={4}><Produtos name="produto_id" label={{ enabled: true, text: "Produto" }} load /></Col>
                    <Col xs={12} md={6} lg={4}><Artigos name="artigo_id" allowClear label={{ enabled: true, text: "Artigo" }} load /></Col>
                    <Col xs={12} md={6} lg={4}><Clientes name="cliente" label={{ enabled: true, text: "Cliente" }} /></Col>

                </Row>
                <Row style={{}} nogutter>
                    <Col>
                        <Table
                            dirty={formDirty}
                            loading={submitting.state}
                            offsetHeight="150px"
                            idProperty={primaryKey}
                            local={true}
                            onRefresh={loadData}
                            rowClassName={rowClassName}
                            groups={groups}
                            sortable={false}
                            reorderColumns={false}
                            showColumnMenuTool={false}
                            disableGroupByToolbar={true}
                            groupBy={["extrusora"]}
                            groupColumn={{ headerAlign: "center", defaultWidth: 75, header: form.getFieldValue("reference") === 1 && <StarFilled style={{ fontSize: "18px", color: "yellow" }} />, renderGroupValue: ({ value }) => form.getFieldValue("joinbc") === 1 && ["B", "C"].includes(value) ? <Space><LockOutlined />BC</Space> : value }}

                            editable={{
                                enabled: permission.isOk({ forInput: [!submitting.state], action: "edit" }),
                                add: false,
                                gridStatus, setGridStatus,
                                //onAdd: onAdd, onAddSave: onAddSave,
                                onSave: () => onSave("update"), onCancel: onEditCancel,
                                modeKey: "datagrid", setMode, mode, onEditComplete
                            }}

                            columns={columns}
                            dataAPI={dataAPI}
                            moreFilters={false}
                            leftToolbar={
                                <>
                                    {mode.datagrid.edit && < Dropdown menu={{ onClick: menuClick, items: menuOptions({ edit: mode.datagrid.edit, joinbc: form.getFieldValue("joinbc") }) }}>
                                        <Button>
                                            <Space>
                                                <EllipsisOutlined />
                                            </Space>
                                        </Button>
                                    </Dropdown>}
                                </>
                            }
                            toolbarFilters={false}
                        />
                    </Col>
                </Row>
            </FormContainer>
        </YScroll>
    );


};