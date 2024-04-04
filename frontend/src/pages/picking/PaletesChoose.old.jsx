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
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined,FileExcelTwoTone, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles, getFilters, getMoreFilters, getFiltersValues } from 'components/TableV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn, EstadoBobines, Largura, OF } from 'components/TableColumns';
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
import SvgSchema from "../paletes/paletizacao/SvgSchemaV2";

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
        </>}
    </>
    );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFilters = ({ form, columns }) => [
    ...getMoreFilters({ columns })
];



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
    const defaultParameters = { method: "PaletesListV2" };
    //const defaultSort = [{ column: `t.timestamp`, direction: "DESC" }];
    const dataAPI = useDataAPI({ ...((!noid || location?.state?.noid === false) && { id: "lst-paletes-c" }), /* fnPostProcess: (dt) => postProcess(dt, submitting), */ payload: { url: `${API_URL}/paletes/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, baseFilter: defaultFilters, sort: defaultSort } });


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
        let { filterValues, fieldValues } = fixRangeDates(null, inputParameters.current);
        formFilter.setFieldsValue(excludeObjectKeys({ ...dataAPI.getFilter(), ...fieldValues }, ['tstamp']));
        dataAPI.addFilters(excludeObjectKeys({ ...dataAPI.getFilter(), ...fieldValues }, ['tstamp']), true);
        dataAPI.setSort(dataAPI.getSort(), defaultSort);

        dataAPI.addParameters({ ...defaultParameters }, true);
        dataAPI.setAction("init", true);
        dataAPI.update(true);
        submitting.end();
    }

    const columns = [
        ...(true) ? [{ name: 'sgppl.nome', header: 'Nome', filter: { show: "toolbar", op: "any", alias: "lote" }, userSelect: true, defaultLocked: true, defaultWidth: 120, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.nome}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'sgppl.timestamp', header: 'Data', filter: { show: true, alias: "data", type: "rangedatetime", field: { style: { width: "90px" }, format: DATE_FORMAT } }, userSelect: true, defaultLocked: false, defaultWidth: 128, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.timestamp} format={DATETIME_FORMAT} /> }] : [],
        ...(true) ? [{ name: "sgppl.nbobines_real", header: "Bobines", filter: { show: true, type: "number", alias: "nbobinesreal", field: { style: { width: "70px" } } }, defaultWidth: 80, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{String(data.nbobines_real).padStart(2, '0')}/{String(data.num_bobines).padStart(2, '0')}</LeftAlign> }] : [],
        ...(true) ? [{ name: "sgppl.estado", header: "Estado", filter: { show: true, alias: "estados", type: "selectmulti", field: { style: { width: "80px" }, keyField: 'value', textField: 'value', options: BOBINE_ESTADOS } }, defaultWidth: 90, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <EstadoBobines id={data.id} nome={data.nome} artigos={json(data.artigo)} /> }] : [],
        ...(true) ? [{ name: "sgppl.largura", header: "Largura", filter: { show: true, type: "number", field: { style: { width: "90px" } } }, defaultWidth: 120, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <Largura id={data.id} nome={data.nome} artigos={json(data.artigo)} /> }] : [],
        ...(true) ? [{ name: 'sgppl.ofid', header: 'Ordem Fabrico', filter: { show: "toolbar", op: "any", alias: "of" }, userSelect: true, defaultLocked: false, defaultWidth: 120, headerAlign: "center", render: ({ data, cellProps }) => <OF id={data.id} ofid={data.ofid} of_des={data.ordem_original} /> }] : [],
        ...(true) ? [{ name: "pt.prf_cod", header: "Prf", filter: { show: true, op: "any" }, defaultWidth: 130, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{data.prf}</LeftAlign> }] : [],
        ...(true) ? [{ name: "pt.order_cod", header: "Encomenda", filter: { show: true, op: "any", alias: "order" }, defaultWidth: 130, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{data.iorder}</LeftAlign> }] : [],
        ...(true) ? [{ name: "sgppl.cliente_nome", header: "Cliente", filter: { show: true, op: "any", alias: "cliente" }, defaultWidth: 230, flex: 1, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{data.cliente_nome}</LeftAlign> }] : [],
        ...(true) ? [{ name: "sgppl.destino", header: "Destino", filter: { show: true, op: "any", alias: "destinoold" }, defaultWidth: 230, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{data.destino}</LeftAlign> }] : [],
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

    return (
        <>
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />
            <Container fluid style={{ padding: "0px", margin: "0px" }}>
                <Row>
                    <Col>
                        <Table
                            responsiveToolbar={false}
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
                            loadOnInit={false}
                            //editStartEvent={"click"}
                            pagination="remote"
                            defaultLimit={20}
                            columns={columns}
                            dataAPI={dataAPI}
                            moreFilters={true}
                            reportItems={[
                                { label: 'Paletes (Detalhado)', key: 'PaletesDetailed_01', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { orientation: "landscape", extension: "xlsx" } },
                            ]}
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