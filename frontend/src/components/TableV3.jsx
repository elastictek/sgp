import React, { useEffect, useState, useCallback, useRef, useContext, forwardRef, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { pickAll, useSizeMe, useSubmitting } from "utils";
import sizeMe from 'react-sizeme';
//import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Button, Form, Space, Input, InputNumber, Tooltip, Popover, Dropdown, Menu, Divider, Select, Checkbox, Empty, Tag, Badge, notification } from "antd";
import Icon, { LoadingOutlined, EditOutlined, CompassOutlined, InfoCircleOutlined, ReloadOutlined, EllipsisOutlined, FilterOutlined, SettingOutlined, SearchOutlined, FileFilled, RollbackOutlined } from '@ant-design/icons';
import ClearSort from 'assets/clearsort.svg';
import MoreFilters from 'assets/morefilters.svg'
import ResultMessage from 'components/resultMessage';
import { Report } from "components/DownloadReports";
import { uid } from 'uid';
import Pagination from 'components/Paginator';
import Spin from "./Spin";
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS } from 'config';
import DataGrid, { Row as TableRow, SelectColumn } from 'react-data-grid';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, FilterDrawer } from 'components/FormFields';
import { fixRangeDates } from "utils/loadInit";
import YScroll from 'components/YScroll';


import ReactDataGrid from '@inovua/reactdatagrid-enterprise';
import PaginationToolbar from '@inovua/reactdatagrid-community/packages/PaginationToolbar';
import '@inovua/reactdatagrid-enterprise/index.css';
import { props } from 'ramda';

const openNotification = (type, messages = []) => {
    if (messages.length > 0) {
        notification.open({
            placement: "top",
            message: type === "error" ? <b>Erros</b> : <b>Avisos</b>,
            description: <div style={{ height: "calc(100vh - 50vh)", overflow: "hidden" }}><YScroll><ul>{messages.map((v, i) => <li key={`msg-${i}`}>{v}ccc</li>)}</ul></YScroll></div>,
        });
    }
};

const Table = styled(ReactDataGrid)`
    .InovuaReactDataGrid__header{
        background-color:#000;
        color:#fff;
   }
    .InovuaReactDataGrid__column-header__content{
        padding:1px !important;
    }
    .InovuaReactDataGrid__header-group__title{
        padding:1px !important;
    }
    .InovuaReactDataGrid__cell{
        color:#000;
    }
    .inovua-react-pagination-toolbar{
        position:relative !important;
        border-top:none !important;
    }
`;

export const useTableStyles = createUseStyles({
    error: {
        background: "#ff4d4f52 !important"
    },
    warning: {
        background: "#ffec3d !important"
    },
    cellPadding1: {
        padding: "1px 5px !important"
    },
    rowNotValid: {
        background: "#ffe7ba !important"
    },
    right: {
        textAlign: "right"
    },
    selectable: {
        cursor: "pointer"
    },
    edit: {
        position: "relative",
        '&:before': {
            /* we need this to create the pseudo-element */
            content: "''",
            display: "block",
            /* position the triangle in the top right corner */
            position: "absolute",
            zIndex: "0",
            top: "0",
            right: "0",
            /* create the triangle */
            width: "0",
            height: "0",
            border: ".5em solid transparent",
            borderTopColor: "#66afe9",
            borderRightColor: "#66afe9"
        }
    }
});

export const TypeRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;

const Action = ({ dataAPI, content, ...props }) => {
    const [clickPopover, setClickPopover] = useState(false);

    const handleClickPopover = (visible) => {
        setClickPopover(visible);
    };

    const hide = () => {
        setClickPopover(false);
    };

    return (
        <>
            <Popover
                open={clickPopover}
                onOpenChange={handleClickPopover}
                placement="bottomRight"
                title=""
                content={React.cloneElement(content, { ...content.props, hide, row: props.row })}
                trigger="click"
            >
                <Button size="small" icon={<EllipsisOutlined />} />
            </Popover>
        </>
    )
}

const editMode = (obj = {}) => {
    const { modeKey = "datagrid", mode } = obj;
    if (mode) {
        return mode[modeKey]?.edit;
    }
    return false;
}
const addMode = (obj = {}) => {
    const { modeKey = "datagrid", mode } = obj;
    if (mode) {
        return mode[modeKey]?.add;
    }
    return false;
}

const ContentSettings = ({ setIsDirty, onClick, dataAPI, columns/*  pageSize, setPageSize */, reportTitle: _reportTitle, moreFilters, clearSort, reports, modeEdit, modeAdd }) => {
    const [reportTitle, setReportTitle] = useState(_reportTitle);
    const updateReportTitle = (e) => {
        console.log(e.target)
        setReportTitle(e.target.value);
    }
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <Menu onClick={(v) => onClick(v)} items={[
                (!modeEdit && !modeAdd) && { label: 'Atualizar', key: 'refresh', icon: <ReloadOutlined />, data: {} },
                (clearSort && !modeEdit && !modeAdd) && { label: 'Limpar Ordenação', key: 'cleansort', icon: <Icon component={ClearSort} />, data: {} },
                (moreFilters && !modeEdit && !modeAdd) && { label: 'Mais Filtros', key: 'morefilters', icon: <Icon component={MoreFilters} />, data: {} }
            ]}></Menu>
            <Divider style={{ margin: "8px 0" }} />
            {/* {dataAPI.getPagination(true).enabled && <div style={{ display: "flex", flexDirection: "row" }}>
                <Select value={pageSize} onChange={(v) => { setIsDirty(true); setPageSize(v); }} size="small" options={[{ value: 10, label: "10" }, { value: 15, label: "15" }, { value: 20, label: "20" }, { value: 30, label: "30" }, { value: 50, label: "50" }, { value: 100, label: "100" }]} />
                <div style={{ marginLeft: "5px" }}>Registos/Página</div>
            </div>} */}
            {reports && <>
                <Divider orientation="left" orientationMargin="0" style={{ margin: "8px 0" }}>Relatórios</Divider>
                <Input value={reportTitle} onChange={updateReportTitle} size="small" maxLength={200} />
                <Report dataAPI={dataAPI} columns={columns} hide={onClick} title={reportTitle} />
            </>}
        </div>
    );
}

const RenderChildren = sizeMe({ monitorHeight: true, noPlaceholder: true, refreshRate: 500 })(({ children, setChildrenSize, ...props }) => {
    const { width, height } = props.size;
    useEffect(() => {
        setChildrenSize({ width, height });
    }, [width, height]);
    return (
        <>
            {children}
        </>
    )
})

const MeasuredParent = sizeMe({ monitorHeight: true, noPlaceholder: true, refreshRate: 500 })(({ id, containerProps = {}, children, maxHeight, setIsOverflow, isOverflow, checkHeight, ...props }) => {
    const { width, height } = props.size;
    const [childrenSize, setChildrenSize] = useState({ width: null, height: null });

    const _overflow = () => {
        if (checkHeight) {
            return (childrenSize.width > width || childrenSize.height > height);
        } else {
            return (childrenSize.width > width);
        }
    }

    useEffect(() => {
        if (checkHeight) {
            setIsOverflow(_overflow());
        } else {
            setIsOverflow(_overflow());
        }
    }, [width, height, childrenSize.width, childrenSize.height]);

    return (
        <Col {...containerProps} style={{ maxHeight: `${maxHeight}px`, overflow: "hidden", ...containerProps?.style }}>
            <Row nogutter style={{ ...(_overflow() || isOverflow === null) && { visibility: "hidden", ...(!checkHeight) && { maxHeight: "1px" } } }}>
                <Col style={{ display: "flex" }}>
                    <RenderChildren setChildrenSize={setChildrenSize} containerWidth={width} containerHeight={height}>
                        {React.cloneElement(children, { ...children.props, style: { ...children.props?.style, /* ...childrenSize?.width && {width: `${childrenSize.width}px`} */ } })}
                    </RenderChildren>
                </Col>
            </Row>
        </Col>
    )
})

const ResponsiveItem = ({ id, containerProps, children, maxHeight = 24, colWidth = 25, rowProps, colProps = {}, popover, defaultCol, checkHeight = true }) => {
    const [isOverflow, setIsOverflow] = useState(null);
    return (
        <Col>
            <Row nogutter {...rowProps} style={{ ...rowProps?.style }} wrap="nowrap">
                <MeasuredParent id={id} containerProps={containerProps} maxHeight={maxHeight} setIsOverflow={setIsOverflow} isOverflow={isOverflow} checkHeight={checkHeight}>

                    {children}

                </MeasuredParent>
                <Col width={`${colWidth}px`} {...colProps} style={{ ...colProps?.style }}>
                    {(isOverflow === true && popover) && React.cloneElement(popover, { ...popover.props, content: [children, popover.props?.content] })}
                    {(isOverflow === false && defaultCol) && defaultCol}
                </Col>
            </Row>
        </Col>
    );
}

const ToolbarFilters = ({ form, dataAPI, schema, onFinish, onValuesChange, initialValues, filters, content, modeEdit, modeAdd }) => {
    const countFilters = Object.keys(dataAPI.removeEmpty(dataAPI.getFilter(true))).length;
    return (
        <Form style={{}} form={form} name={`f-ltf`} onFinish={(values) => { onFinish("filter", values); }} onValuesChange={onValuesChange} onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { onFinish("filter", form.getFieldsValue(true)); } }} initialValues={initialValues}>
            <FormContainer style={{ paddingRight: "0px" }} id="LAY-TOOLBAR-FILTERS" wrapForm={false} form={form} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={!modeEdit && !modeAdd} fluid>
                <Row gutterWidth={2} style={{}} >
                    <ResponsiveItem
                        checkHeight={false}

                        containerProps={{ style: { maxHeight: "56px", display: "flex", justifyContent: "end" } }}
                        colWidth={25}
                        rowProps={{ style: { display: "flex" } }}
                        colProps={{ style: { alignSelf: "end", marginBottom: "4px", marginTop: "7px" } }}
                        defaultCol={
                            <Badge count={countFilters} size="small"><Button disabled={modeEdit || modeAdd} onClick={() => (form) && onFinish("filter", form.getFieldsValue(true))} size="small" icon={<SearchOutlined />} /></Badge>
                        }
                        popover={

                            <Popover trigger="click" content={
                                <div style={{ textAlign: "center" }}><Button type="primary" onClick={() => (form) && onFinish("filter", form.getFieldsValue(true))} size="small">Aplicar</Button></div>
                            }>
                                <Badge size='small' count={countFilters}>
                                    <Button onClick={() => (form) && onFinish("filter", form.getFieldsValue(true))} size="small" icon={<SearchOutlined />} />
                                </Badge>
                            </Popover>

                        }
                    >
                        <Row nogutter style={{ display: "flex", justifyContent: "end", paddingRight: "3px" }} wrap="nowrap">
                            {filters}
                            {content}
                        </Row>
                    </ResponsiveItem>
                </Row>
            </FormContainer>
        </Form >
    )
}

const paginationI18n = {
    pageText: 'Pág. ',
    ofText: ' de ',
    perPageText: '',
    //perPageText: 'Resultados por página',
    showingText: 'Mostrar '
}
const i18n = {
    ...ReactDataGrid.defaultProps.i18n,
    pagination: paginationI18n, ...{
        ...paginationI18n,
        showingText: 'Mostrar ',
        clearAll: 'Limpar tudo',
        clear: 'Limpar',
        showFilteringRow: 'Mostrar linha filtrada',
        hideFilteringRow: 'Esconder linha filtrada',
        dragHeaderToGroup: 'Arrastar cabeçalho para o grupo',
        disable: 'Inativar',
        enable: 'Ativar',
        sortAsc: 'Ordenação ascendente',
        sortDesc: 'Ordenação descendente',
        unsort: 'Limparar ordenação',
        group: 'Agrupar',
        ungroup: 'Desagrupar',
        lockStart: 'Fixar no íncio',
        lockEnd: 'Fixar no fim',
        unlock: 'Desfixar',
        columns: 'Colunas',
        contains: 'Contém',
        startsWith: 'Começa por',
        endsWith: 'Termina com',
        notContains: 'Não contém',
        neq: 'Dieferente',
        eq: 'Igual',
        notEmpty: 'Não vazio',
        empty: 'Vazio',
        lt: 'Menor que',
        lte: 'Menor ou igual que',
        gt: 'Maior que',
        gte: 'Maior ou igual que',
        autoresizeThisColumn: "Dimensionar auto. esta coluna",
        autoresizeAllColumns: "Dimensionar auto. todas as colunas",
        autoSizeToFit: "Dimensionar ao tamanho",
        calendar: {
            ...ReactDataGrid.defaultProps.i18n.calendar, ...{
                todayButtonText: 'Hoje',
                clearButtonText: 'Limpar',
                okButtonText: 'OK',
                cancelButtonText: 'Cancelar'
            }
        }
    }
};
const DEFAULT_ACTIVE_CELL = [0, 0];
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const defaultMoreFilters = () => ({
    width: "500px",
    mask: true,
    filterRules: ((keys) => { return getSchema({}, { keys }).unknown(true); })()
});

const FilterTags = ({ dataAPI, removeFilter, style }) => {
    return (
        <div style={{ ...style }}>
            {dataAPI.getAllFilter() && Object.keys(dataAPI.removeEmpty(dataAPI.getAllFilter())).map(v =>
                <Tag key={`ftag-${v}`} color="blue" closable onClose={() => removeFilter(v)}>{dataAPI.getAllFilter()[v]}</Tag>
            )}
        </div>
    );
}

const EditControls = ({ editable = {}, dataAPI, columns, idProperty, dirty, grid }) => {
    const { enabled = false, add, modeKey = "datagrid", mode, onSave, setMode, onAdd, onAddSave, showSaveButton = true, showCancelButton = true, showAddButton = true } = editable;


    const changeMode = async () => {
        if (addMode(editable)) {
            dataAPI.setAction("cancel", true);
            dataAPI.clearStatus();

            const _v = { ...mode[modeKey], add: false };
            setMode((prev) => ({ ...prev, [modeKey]: { ..._v } }));
            let _update = true;
            if (editable?.onCancel && (typeof editable.onCancel === "function")) {
                _update = editable.onCancel();
            }
            if (_update !== false) {
                dataAPI.update(true);
            }
            return;
        }

        if (editMode(editable)) {
            grid.current.cancelEdit();
            dataAPI.setAction("cancel", true);
            dataAPI.clearStatus();
            let _update = true;
            if (editable?.onCancel && (typeof editable.onCancel === "function")) {
                _update = await editable.onCancel();
            }
            if (_update !== false) {
                dataAPI.update(true);
            }
        } else {
            dataAPI.setAction("edit", true);
            dataAPI.update(true);
        }
        const _v = { ...mode[modeKey], edit: mode[modeKey].edit ? false : true };
        setMode((prev) => ({ ...prev, [modeKey]: { ..._v } }));
    }
    const _onAdd = () => {
        if (typeof onAdd === "function") {
            const cols = { ...columns.reduce((acc, curr) => { acc[curr?.id ? curr?.id : curr.name] = null; return acc; }, {}), [idProperty]: `*${uid(4)}` };
            onAdd(cols);
        }
        // if (addMode(editable)) {
        //     dataAPI.setAction("cancel", true);
        //     dataAPI.update(true);
        // } else {
        dataAPI.setAction("add", true);
        dataAPI.update(true);
        // }
        const _v = { ...mode[modeKey], add: true };
        //const _v = { ...mode[modeKey], add: mode[modeKey].add ? false : true };
        setMode((prev) => ({ ...prev, [modeKey]: { ..._v } }));
    }
    const showMessages = (type) => {
        openNotification(type, dataAPI.getMessages()[type]);
    }

    return (<>
        <Space style={{ padding: "5px", ...editMode(editable) && { background: "#e6f7ff" } }}>
            {(dataAPI?.status()?.errors > 0 && (addMode(editable) || editMode(editable))) && <a href="#" onClick={() => showMessages("error")}><Badge count={dataAPI?.status()?.errors} /></a>}
            {(dataAPI?.status()?.warnings > 0 && (addMode(editable) || editMode(editable))) && <a href="#" onClick={() => showMessages("warning")}><Badge count={dataAPI?.status()?.warnings} color="#faad14" /></a>}
            {(enabled && !editMode(editable) && !addMode(editable)) && <Button style={{}} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
            {(add && showAddButton && !addMode(editable) && !editMode(editable)) && <Button style={{}} icon={<EditOutlined />} onClick={_onAdd}>Novo</Button>}
            {enabled && showCancelButton && (editMode(editable)) && <Button style={{}} icon={<RollbackOutlined />} onClick={changeMode} >Cancelar</Button>}
            {enabled && showSaveButton && ((editMode(editable) && dataAPI.dirtyRows().length > 0) || (editMode(editable) && dirty)) && <Button type="primary" style={{}} icon={<EditOutlined />} onClick={onSave} >Guardar</Button>}
            {add && showCancelButton && (addMode(editable)) && <Button style={{}} icon={<RollbackOutlined />} onClick={changeMode} >Cancelar</Button>}
            {add && showSaveButton && (addMode(editable) && dataAPI.dirtyRows().length > 0) && <Button type="primary" style={{}} icon={<EditOutlined />} onClick={onAddSave} >Guardar</Button>}
        </Space>
    </>
    )
}

export default ({ dataAPI, columns, rowSelect = true, cellNavigation = true, local = false, loading = false, onRefresh, loadOnInit = false, onPageChange, formFilter, toolbarFilters, moreFilters = false, showLoading = true, dirty = false, title, leftToolbar, toolbar = true, settings = true, clearSort = true, reports = true, reportTitle, offsetHeight = "130px", headerHeight = 30, rowHeight = 30, editable, rowClassName, idProperty = "id", onCellAction, ...props }) => {
    const classes = useTableStyles();
    const gridStyle = { minHeight: `calc(100vh - ${offsetHeight})`, fontSize: "12px" };
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [isSettingsDirty, setSettingsIsDirty] = useState(false);
    const [clickSettings, setClickSettings] = useState(false);
    /* const [initLoaded, setInitLoaded] = useState(false); //Indica se a datagrid já fez o load inicial */
    const [gridRef, setGridRef] = useState(null);
    const action = useRef(null);
    const initialized = useRef(false);
    const submitting = useSubmitting(false);


    const rowClass = ({ data }) => {
        if (data?.rowvalid === 0 || data?.rowadded === 1) {
            return classes.rowNotValid;
        }
        if (typeof rowClassName === "function") {
            return rowClassName({ data });
        }
        if (rowSelect) {
            return classes.selectable;
        }
    }

    const localDatasource = () => {
        return dataAPI.getData()?.rows || [];
    }

    const dataSource = useCallback(async ({ skip, limit, sortInfo, ...rest }) => {
        let dt = { data: [], count: 0 };
        console.log("entreeeeeeeeeeeeeeeewwwwwwwwwwwwwwwwwwwwwwwwww");
        console.log(dataAPI.getActions())
        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        if (dataAPI.getActions().includes("init")) {
            submitting.trigger();
            console.log("entreeeeeeeeeeeeeeeewwwwwwwwwwwwwwwwwwwwwwwwww-55")
            dataAPI.clearActions();
            const _v = await dataAPI.fetchPost();
            dt = { data: _v?.rows ? _v?.rows : [], count: _v?.total ? _v?.total : 0 };
            initialized.current = true;
            submitting.end();
        } else {
            if (!dataAPI.updated()) {
                console.log("entreeeeeeeeeeeeeeeewwwwwwwwwwwwwwwwwwwwwwwwww-1", dt)
                return dt;
            }
            if (initialized.current && (dataAPI.getActions().includes("cancel"))) {
                submitting.trigger();
                console.log("entreeeeeeeeeeeeeeeewwwwwwwwwwwwwwwwwwwwwwwwww-2")
                dataAPI.clearActions();
                const _v = await dataAPI.fetchPost();
                dt = { data: _v?.rows ? _v?.rows : [], count: _v?.total ? _v?.total : 0 };
                submitting.end();
            } else if (addMode(editable) && dataAPI.getActions().includes("load")) {
                submitting.trigger();
                console.log("entreeeeeeeeeeeeeeeewwwwwwwwwwwwwwwwwwwwwwwwww-9")
                dataAPI.setAction(dataAPI.getActions().filter(v => v !== 'load'), true);
                const _v = await dataAPI.fetchPost();
                dt = { data: _v?.rows ? _v?.rows : [], count: _v?.total ? _v?.total : 0 };
                submitting.end();
            } else if (addMode(editable) && dataAPI.getActions().includes("add")) {
                console.log("entreeeeeeeeeeeeeeeewwwwwwwwwwwwwwwwwwwwwwwwww-3")
                dt = { data: dataAPI.hasData() ? dataAPI.getData()?.rows : [], count: dataAPI.hasData() ? dataAPI.getData()?.total : 0 };
            } else if (editMode(editable) && ["editcomplete"].includes(action?.current)) {
                dt = { data: dataAPI.hasData() ? dataAPI.getData()?.rows : [], count: dataAPI.hasData() ? dataAPI.getData()?.total : 0 };
            } else if (initialized.current && (dataAPI.getActions().includes("edit"))) {
                console.log("entreeeeeeeeeeeeeeeewwwwwwwwwwwwwwwwwwwwwwwwww-10")
                dataAPI.clearActions();
                dt = { data: dataAPI.hasData() ? dataAPI.getData()?.rows : [], count: dataAPI.hasData() ? dataAPI.getData()?.total : 0 };
                //const _v = await dataAPI.fetchPost();
                //dt = { data: _v?.rows ? _v?.rows : [], count: _v?.total ? _v?.total : 0 };
            } else if (initialized.current && (dataAPI.getActions().includes("filter"))) {
                submitting.trigger();
                console.log("entreeeeeeeeeeeeeeeewwwwwwwwwwwwwwwwwwwwwwwwww-4")
                dataAPI.clearActions();
                const _v = await dataAPI.fetchPost();
                dt = { data: _v?.rows ? _v?.rows : [], count: _v?.total ? _v?.total : 0 };
                submitting.end();
            }
            else if (["page", "pagesize"].includes(action?.current)) {
                submitting.trigger();
                console.log("entreeeeeeeeeeeeeeeewwwwwwwwwwwwwwwwwwwwwwwwww-5")
                //dataAPI.pageSize(limit);
                //dataAPI.currentPage((skip / limit) + 1);
                const _v = await dataAPI.fetchPost();
                dt = { data: _v?.rows ? _v?.rows : [], count: _v?.total ? _v?.total : 0 };
                submitting.end();
            } else if (["sort"].includes(action?.current)) {
                submitting.trigger();
                console.log("entreeeeeeeeeeeeeeeewwwwwwwwwwwwwwwwwwwwwwwwww-6")
                const _v = await dataAPI.fetchPost();
                dt = { data: _v?.rows ? _v?.rows : [], count: _v?.total ? _v?.total : 0 };
                submitting.end();
            } else if (loadOnInit && !initialized.current) {
                submitting.trigger();
                console.log("entreeeeeeeeeeeeeeeewwwwwwwwwwwwwwwwwwwwwwwwww-7")
                const _v = await dataAPI.fetchPost();
                dt = { data: _v?.rows ? _v?.rows : [], count: _v?.total ? _v?.total : 0 };
                initialized.current = true;
                submitting.end();
            } else if (initialized.current) {
                submitting.trigger();
                console.log("entreeeeeeeeeeeeeeeewwwwwwwwwwwwwwwwwwwwwwwwww-8")
                const _v = await dataAPI.fetchPost();
                dt = { data: _v?.rows ? _v?.rows : [], count: _v?.total ? _v?.total : 0 };
                submitting.end();
                //dt = { data: dataAPI.hasData() ? dataAPI.getData()?.rows : [], count: dataAPI.hasData() ? dataAPI.getData()?.total : 0 };
            }
        }
        action.current = null;
        console.log("action", dataAPI.getActions(), dt)
        return dt;
    }, [dataAPI?.updated(true)]);


    useEffect(() => {
        if (loadOnInit) {
            dataAPI.update();
        }
    }, []);

    const renderPaginationToolbar = useCallback(
        (paginationProps) => {
            const removeFilter = (k) => {
                const { fieldValues, filterValues } = fixRangeDates(null, { ...dataAPI.getFilter(true), [k]: undefined });
                dataAPI.setFilters(filterValues);
                toolbarFilters?.form.setFieldsValue(fieldValues);
                dataAPI.first();
                dataAPI.setAction("filter", true);
                dataAPI.update(true);
            }

            return <Container fluid style={{ padding: "0px 5px" }}>
                <Row wrap="nowrap" nogutter style={{ borderTop: "1px solid #e4e3e2", display: "flex", flex: 1, alignItems: "center" }}>
                    <ResponsiveItem
                        maxHeight={24}
                        containerProps={{ style: {} }}
                        colWidth={65}
                        rowProps={{ style: { display: "flex" } }}
                        colProps={{ style: { alignSelf: "end", marginBottom: "4px" } }}
                        popover={
                            <Popover trigger="click">
                                <Badge size='small' count={Object.keys(dataAPI.removeEmpty(dataAPI?.getAllFilter())).length}>
                                    <Button size="small">Filtros</Button>
                                </Badge>
                            </Popover>
                        }
                    >
                        <FilterTags dataAPI={dataAPI} removeFilter={removeFilter} />
                    </ResponsiveItem>
                    {/* <ResponsiveItem maxHeight={24} id="pag" button={<Button size="small">Filtros</Button>} containerProps={{ xs: 2, md: 6 }} n={Object.keys(dataAPI.removeEmpty(dataAPI.getFilter(true))).length}><FilterTags dataAPI={dataAPI} removeFilter={removeFilter} /></ResponsiveItem> */}
                    <Col xs={10} md={6}><PaginationToolbar {...paginationProps} {...(editable.enabled || editable.add) && { skip: dataAPI?.getSkip() }} {...paginationI18n} bordered={false} /></Col>
                </Row>
            </Container>
        }, [dataAPI?.getSkip(true), dataAPI?.updated(true)])

    const onCellDoubleClick = () => {
        const grid = gridRef.current
        let [rowIndex, colIndex] = grid.computedActiveCell
        if (!editMode(editable) && !addMode(editable) && typeof onCellAction === "function") {
            onCellAction(grid.data[rowIndex], grid.getColumnBy(colIndex), "DoubleClick");
        }
    }
    const onKeyDown = (event) => {
        const grid = gridRef.current
        if (!grid.computedActiveCell) {
            return;
        }
        let [rowIndex, colIndex] = grid.computedActiveCell

        if (!editMode(editable) && !addMode(editable) && typeof onCellAction === "function") {
            onCellAction(grid.data[rowIndex], grid.getColumnBy(colIndex), event.key);
        }

        if (!cellNavigation) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            return;
        }



        // if (event.key === ' ' || event.key === 'Enter') {
        if ((!(["Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) && !grid.isInEdit.current) || event.key === 'Enter') {
            const column = grid.getColumnBy(colIndex);
            grid.startEdit({ columnId: column.name, rowIndex });
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            return
        }
        // }
        if (event.key !== 'Tab' && (editMode(editable) || addMode(editable))) {
            return;
        }
        //if (event.key !== 'Tab') {
        //    return
        //}

        event.preventDefault();
        event.stopPropagation();

        const direction = event.shiftKey ? -1 : 1

        const columns = grid.visibleColumns
        const rowCount = grid.count

        colIndex += direction
        if (colIndex === -1) {
            colIndex = columns.length - 1
            rowIndex -= 1
        }
        if (colIndex === columns.length) {
            rowIndex += 1
            colIndex = 0
        }
        if (rowIndex < 0 || rowIndex > rowCount) {
            return
        }
        grid.setActiveCell([rowIndex, colIndex])
    }
    const onSkipChange = (skip) => {
        if (action.current !== "editcomplete") {
            action.current = "page";
            dataAPI.currentPage((skip / dataAPI.getPageSize()) + 1);
        }
    }
    const onLimitChange = (limit) => {
        console.log("limit")
        action.current = "pagesize";
        dataAPI.pageSize(limit, true);
    }
    const onSortChange = (sortInfo) => {
        console.log("sort")
        onSkipChange(dataAPI.getSkip(true)); //It's necessary, because every time we trigger the onSortChange event, also, the event onSkipChange is triggered too, in first place. This replace the original skip position.
        action.current = "sort";
        dataAPI.setSort(Array.isArray(sortInfo) ? sortInfo : [sortInfo], [], true);
    }
    const onFilterValueChange = (filterValue) => {
        console.log("filter")
        action.current = "filter";
    }
    const onEditComplete = (v) => {
        onSkipChange(dataAPI.getSkip(true));
        action.current = "editcomplete";
        if (typeof editable?.onEditComplete === "function") {
            editable?.onEditComplete(v);
            dataAPI.update(true);
        }
    }
    const hideSettings = () => {
        setClickSettings(false);
    }
    const handleSettingsClick = (visible) => {
        setClickSettings(visible);
    }
    const onSettingsClick = async (type) => {
        if (type?.key) {
            switch (type.key) {
                case 'refresh': onRefresh ? onRefresh() : dataAPI.fetchPost(); break;
                case 'cleansort': dataAPI.clearSort(); dataAPI.fetchPost(); break;
                case 'morefilters': setShowMoreFilters(prev => !prev); break;
                default: break;
            }
        }
        hideSettings();
    }

    return (<>
        {(moreFilters && toolbarFilters?.moreFilters) &&
            <FilterDrawer
                setShowFilter={setShowMoreFilters} showFilter={showMoreFilters} dataAPI={dataAPI}
                {...defaultMoreFilters()}
                {...toolbarFilters?.onFinish && { onFinish: toolbarFilters.onFinish }}
                {...toolbarFilters?.form && { form: toolbarFilters.form }}
                {...toolbarFilters.moreFilters?.width && { width: toolbarFilters.moreFilters.width }}
                {...toolbarFilters.moreFilters?.rules && { filterRules: toolbarFilters.moreFilters.rules() }}
                {...toolbarFilters.moreFilters?.schema && { schema: toolbarFilters.moreFilters.schema({ form: toolbarFilters?.form }) }}
                {...toolbarFilters.moreFilters?.mask && { mask: toolbarFilters.moreFilters?.mask }}
            />}
        {toolbar && <Container fluid style={{ background: "#f8f9fa", /* border: "1px solid #dee2e6", borderRadius: "3px", */ padding: "5px" }}>
            <Row align='start' wrap="nowrap" gutterWidth={15}>
                <Col xs="content"></Col>
                {title && <Col xs="content">
                    <Row><Col>{title}</Col></Row>
                    <Row><Col>
                        <EditControls dataAPI={dataAPI} editable={editable} columns={columns} idProperty={idProperty} dirty={dirty} grid={gridRef} />
                        {leftToolbar && leftToolbar}
                    </Col></Row>
                </Col>
                }
                {!title && <Col xs="content" style={{ alignSelf: "end" }}>
                    <EditControls dataAPI={dataAPI} editable={editable} columns={columns} idProperty={idProperty} dirty={dirty} grid={gridRef} />
                    {leftToolbar && leftToolbar}
                </Col>}
                <Col style={{ overflow: "hidden" }}>{toolbarFilters && <ToolbarFilters dataAPI={dataAPI} {...toolbarFilters} modeEdit={editMode(editable)} modeAdd={addMode(editable)} />}</Col>
                {/* {search && <Col xs="content" style={{ padding: "0px", alignSelf: "end", marginBottom: "4px" }}><Badge count={Object.keys(dataAPI.removeEmpty(dataAPI.getFilter(true))).length} size="small"><Button onClick={() => (toolbarFilters?.form) && toolbarFilters.onFinish("filter", toolbarFilters.form.getFieldsValue(true))} size="small" icon={<SearchOutlined />} /></Badge></Col>} */}
                {settings && <Col xs="content" style={{ alignSelf: "end", marginBottom: "4px" }}>

                    <Popover
                        open={clickSettings}
                        onOpenChange={handleSettingsClick}
                        placement="bottomRight" title="Opções"
                        content={
                            <ContentSettings modeEdit={editMode(editable)} modeAdd={addMode(editable)} setIsDirty={setSettingsIsDirty} onClick={onSettingsClick}
                                dataAPI={dataAPI} columns={columns} pageSize={dataAPI?.getPageSize(true)} /* setPageSize={updatePageSize} */ reportTitle={reportTitle}
                                moreFilters={moreFilters} reports={reports} clearSort={clearSort}
                            />
                        } trigger="click">
                        <Button size="small" icon={<SettingOutlined />} />
                    </Popover>

                </Col>}

            </Row>
        </Container>}


        <>
            <Table
                {...showLoading ? { loading: loading || submitting.state } : { loading: false }}
                idProperty={idProperty}
                i18n={i18n}
                renderPaginationToolbar={renderPaginationToolbar}
                filterRowHeight={40}
                headerHeight={headerHeight}
                handle={setGridRef}
                columns={columns}
                rowHeight={rowHeight}
                dataSource={local ? localDatasource : dataSource}
                style={gridStyle}
                onKeyDown={onKeyDown}
                onCellDoubleClick={onCellDoubleClick}
                {...cellNavigation && { defaultActiveCell: DEFAULT_ACTIVE_CELL }}
                onSkipChange={onSkipChange}
                onLimitChange={onLimitChange}
                onSortInfoChange={onSortChange}
                onEditComplete={onEditComplete}
                rowClassName={rowClass}
                /* filterValue={[{ ...dataAPI.getFilter(true) }]} */
                onFilterValueChange={onFilterValueChange}
                limit={dataAPI?.getPageSize()}
                {...!local && { sortInfo: dataAPI?.getSort() }}
                enableFiltering={false}
                {...props}
                {...(editMode(editable) || addMode(editable)) && { pagination: false }}
                {...(editMode(editable) || addMode(editable)) && { sortable: false }}
            />
        </>
    </>
    );
}
