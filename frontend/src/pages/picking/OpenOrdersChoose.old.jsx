import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH, BOBINE_ESTADOS } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys, excludeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles, getFilters, getMoreFilters, getFiltersValues } from 'components/TableV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn, EstadoBobines, Largura, OF, ArtigoColumn, ArrayObjectColumn } from 'components/TableColumns';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { produce } from 'immer';
import { useImmer } from "use-immer";

const TitleForm = ({ level, auth, hasEntries, onSave, loading, title }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, auth, num, v, columns, ...props }) => {
    return (<>
        {true && <>
            {getFilters({ columns: columns })}
            {/* <Col xs="content">
                <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
                </Field>
            </Col> */}
            {/*<Col xs="content">
                <Field name="fyear" shouldUpdate label={{ enabled: true, text: "Ano", pos: "top", padding: "0px" }}>
                    <DatePicker size="small" picker="year" format={"YYYY"} />
                </Field>
            </Col>
            <Col xs="content">
                <Field name="fquarter" label={{ enabled: true, text: "Quarter", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: 1, label: "Q1" }, { value: 2, label: "Q2" }, { value: 3, label: "Q3" }, { value: 4, label: "Q4" }]} allowClear style={{ width: "60px" }} />
                </Field>
            </Col> */}
        </>}
    </>
    );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFilters = ({ form, columns }) => [
    ...getMoreFilters({ columns }),
    // <Col xs="content">
    //     <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
    //         <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
    //     </Field>
    // </Col>
    /* { fgroup: { label: "Grupo", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcod: { label: "Artigo Cód.", field: { type: 'input', size: 'small' }, span: 8 }, fdes: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span: 16 } }, */
];


const renderRowDetails = ({ data, onDetailClick }) => {
    return <ArrayObjectColumn style={{flexDirection:"row"}} value={json(data?.details)} cellProps={{}}><ArtigoColumn onClick={onDetailClick} style={{cursor:"pointer", margin:"10px",padding:"3px",background: "#91d5ff", borderRadius:"4px"}} /></ArrayObjectColumn>
};

export default ({ extraRef, closeSelf, loadParentData, noid = true, defaultFilters = {}, defaultSort = [], onSelect, title, onFilterChange, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "controlpanel" });

    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    //const defaultFilters = { fcarga: "isnull", fdisabled: "==0", fdispatched: "isnull" };
    const defaultParameters = { method: "OpenOrdersList" };
    //const defaultSort = [{ column: `t.timestamp`, direction: "DESC" }];
    const dataAPI = useDataAPI({ ...(!noid && { id: "openorderlist" }), /* fnPostProcess: (dt) => postProcess(dt, submitting), */ payload: { url: `${API_URL}/cargas/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, baseFilter: defaultFilters, sort: defaultSort } });



    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, { ...props?.parameters }, { ...location?.state }, null);
            inputParameters.current = paramsIn;
        }
        submitting.end();
    }

    const columns = [
        ...(true) ? [{ name: 'eef', header: 'Encomenda', filter: { show: "toolbar", op: "any" }, userSelect: true, defaultLocked: true, defaultWidth: 140, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.eef}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'prf', header: 'Prf', filter: { show: "toolbar", op: "any" }, userSelect: true, defaultLocked: false, defaultWidth: 140, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.prf}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'data_expedicao', header: 'Data Expedição', defaultWidth: 115, render: ({ cellProps, data }) => <DateTime value={data?.data_expedicao} cellProps={cellProps} format={DATE_FORMAT} /> }] : [],
        ...(true) ? [{ name: 'cliente', header: 'Cliente', filter: { show: "toolbar", op: "any" }, userSelect: true, defaultLocked: false, defaultWidth: 240, minWidth: 240, flex: 1, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.cliente}</LeftAlign> }] : [],
        //...(true) ? [{ name: 'detalhes', header: 'Detalhes', filter: { show: false, op: "any" }, userSelect: true, defaultLocked: false, defaultWidth: 240, minWidth: 240, flex: 1, headerAlign: "center", render: ({ data, cellProps }) => <ArrayObjectColumn value={json(data?.details)} cellProps={cellProps}><ArtigoColumn /></ArrayObjectColumn> }] : [],
    ];

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
                    ...getFiltersValues({ columns, values: vals, server: false })
                };


                dataAPI.setBaseFilters({ ...defaultFilters });
                dataAPI.addFilters(dataAPI.removeEmpty({ ...excludeObjectKeys(_values, Object.keys(defaultFilters)) }));
                dataAPI.setSort(dataAPI.getSort(), defaultSort);
                dataAPI.addParameters({ ...defaultParameters });


                //formFilter.setFieldsValue({ fyear: dayjs().year(_year) });
                dataAPI.first();
                dataAPI.setAction("filter", true);
                dataAPI.update(true);
                break;
        }
    };

    const onFilter = (changedValues, values) => {
        if (typeof onFilterChange == 'function') {
            onFilterChange(changedValues, values);
        }

        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onSelectionChange = (v) => {
        if (typeof onSelect == 'function') {
            onSelect(v);
        }
        //navigate("/app/picking/newpaleteline", { state: { palete_id: v.data.id, palete_nome: v.data.nome, ordem_id:v.data.ordem_id, num_bobines:v.data.num_bobines } });
    }

    const onDetailClick = (v) => {
        console.log("vvvvvvvvvvvvvv",v)
    }



    return (
        <>
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />
            <Container fluid style={{ padding: "0px", margin: "0px" }}>
                <Row>
                    <Col>
                        <Table

                            // gridRef={gridRef}
                            // setGridRef={setGridRef}
                            // isRowExpandable={()=>true}
                            // expandedRows={expandedRows}
                            // collapsedRows={collapsedRows}
                            // onExpandedRowsChange={onExpandedRowsChange}
                            //rowExpandHeight={100}
                            //renderRowDetails={({data})=>renderRowDetails({data})}
                            //defaultExpandedRows={[]}



                            dirty={false}
                            loading={submitting.state}
                            idProperty={dataAPI.getPrimaryKey()}
                            local={false}
                            onRefresh={loadData}
                            cellNavigation={false}
                            rowHeight={30}
                            rowSelect={true}
                            onSelectionChange={onSelectionChange}
                            enableSelection={true}
                            checkboxColumn={false}
                            // rowClassName={rowClassName}
                            //groups={groups}
                            sortable
                            reorderColumns={false}
                            showColumnMenuTool
                            loadOnInit={true}
                            //editStartEvent={"click"}
                            pagination="remote"
                            defaultLimit={20}
                            columns={columns}
                            dataAPI={dataAPI}
                            moreFilters={true}
                            // onCellAction={onCellAction}
                            toolbarFilters={{
                                form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilter,
                                filters: <ToolbarFilters dataAPI={dataAPI} auth={permission.auth} v={formFilter.getFieldsValue(true)} columns={columns} />,
                                moreFilters: { filters: moreFilters }
                            }}
                            editable={{
                                enabled: false,
                                add: false
                            }}
                            leftToolbar={<Space></Space>}
                        />
                    </Col >
                </Row >
            </Container >
        </>
    )

}