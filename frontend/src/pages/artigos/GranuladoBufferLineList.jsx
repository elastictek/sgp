import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import moment from 'moment';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, DOSERS } from "config";
import { useDataAPI } from "utils/useDataAPI";
//import { WrapperForm, TitleForm, FormLayout, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission } from "utils/usePermission";
import { Status } from './commons';
import { GoArrowUp } from 'react-icons/go';
import { ImArrowLeft } from 'react-icons/im';
import { Cuba } from "../currentline/dashboard/commons/Cuba";
import { MovGranuladoColumn } from "../picking/commons";

const focus = (el, h,) => { el?.focus(); };
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const title = "Ganulado Movimentos BUFFER-LINHA";
const TitleForm = ({ data, onChange, record, level, form }) => {
    // const st = JSON.stringify(record.ofs)?.replaceAll(/[\[\]\"]/gm, "")?.replaceAll(",", " | ");
    return (<ToolbarTitle /* history={level === 0 ? [] : ['Registo Nonwovens - Entrada em Linha']} */ title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }}>
                <Col xs='content' style={{}}><Row nogutter><Col><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title.replace("-LINHA","")}&#8594;LINHA</span></Col></Row></Col>
                {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
            </Row>

        </Col>
    </>
    }
    />);
}
const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'>
            <Field name="fartigo" label={{ enabled: true, text: "Artigo", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="flote" label={{ enabled: true, text: "Lote", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="fdata" label={{ enabled: true, text: "Data Buffer", pos: "top", padding: "0px" }}>
                <RangeDateField size='small' allowClear />
            </Field>
        </Col>
    </>
    );
}
const useStyles = createUseStyles({
    diffAbove: {
        backgroundColor: "#ffa39e"
    },
    diffBellow: {
        backgroundColor: "#fffb8f"
    },
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    },
    closed: {
        background: "#d9f7be"
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
            border: ".3em solid transparent",
            borderTopColor: "#66afe9",
            borderRightColor: "#66afe9"

        }
    }
});
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    { fartigo: { label: "Artigo", field: { type: 'input', size: 'small' } } },
    { flote: { label: "Lote", field: { type: 'input', size: 'small' } } },
    { fvcr: { label: "Cód. Movimento", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data Buffer", field: { type: "rangedate", size: 'small' } } }
];

const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}

export default ({ setFormTitle, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({ allowed: { producao: 300, planeamento: 300 } });
    const [allowEdit, setAllowEdit] = useState({ datagrid: false });
    const [modeEdit, setModeEdit] = useState({ datagrid: false });

    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = [{ column: "CREDATTIM_0", direction: "DESC" }];
    const dataAPI = useDataAPI({ id: "lst-granuladoBL", payload: { url: `${API_URL}/granuladobufferlinelist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: [] } });
    const submitting = useSubmitting(true);

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.type) {
                case "in": return <InContent loadParentData={modalParameters.loadData} />;
                case "out": return <OutContent loadParentData={modalParameters.loadData} record={modalParameters.record} />;
                case "close": return <CloseContent loadParentData={modalParameters.loadData} record={modalParameters.record} />;
                case "closedate": return <CloseDateContent loadParentData={modalParameters.loadData} record={modalParameters.record} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters.title} onCancel={hideModal} width={modalParameters.width ? modalParameters.width : 600} height={modalParameters.height ? modalParameters.height : 250} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    const primaryKeys = ['VCRNUM_0'];
    const editable = (row, col) => {
        if (modeEdit.datagrid && allowEdit.datagrid) {}
        return false;
    }
    const editableClass = (row, col) => {
        if (modeEdit.datagrid && allowEdit.datagrid) {}
    }
    const formatterClass = (row, col) => {}
    
    const columns = [
        { key: 'ITMREF_0', name: 'Artigo', frozen: true, width: 200, formatter: p => p.row.ITMREF_0 },
        { key: 'ITMDES1_0', name: 'Designação', formatter: p => <b>{p.row.ITMDES1_0}</b> },
        { key: 'LOT_0', width: 310, name: 'Lote', formatter: p => <b>{p.row.LOT_0}</b> },
        { key: 'QTYPCU_0', name: 'Qtd', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.qtypcu_0).toFixed(2)} kg</div> },
        { key: 'VCRNUM_0', name: 'Movimento', width: 200, formatter: p => p.row.VCRNUM_0 },
        { key: 'CREDATTIM_0', width: 140, name: 'Data Buffer', formatter: p => moment(p.row.CREDATTIM_0).format(DATETIME_FORMAT) },
        { key: 't_stamp', width: 140, name: 'Data entrada Linha', formatter: p => p.row.t_stamp && moment(p.row.t_stamp).format(DATETIME_FORMAT) },
        { key: 't_stamp_out', width: 140, name: 'Data saída Linha', formatter: p => p.row.t_stamp_out && moment(p.row.t_stamp_out).format(DATETIME_FORMAT) }
    ];

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ init = false, signal } = {}) => {
        if (init) {
            const initFilters = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, {}, [...Object.keys(dataAPI.getAllFilter())]);
            let { filterValues, fieldValues } = fixRangeDates(['fdata'], initFilters);
            formFilter.setFieldsValue({ ...fieldValues });
            dataAPI.addFilters({ ...filterValues }, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters({}, true, true);
            dataAPI.fetchPost({ signal });
            setAllowEdit({ datagrid: permission.allow() });
            setModeEdit({ datagrid: false });
        }
        submitting.end();
    }

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const vals = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
                const _values = {
                    ...vals,
                    fartigo: getFilterValue(vals?.fartigo, 'any'),
                    flote: getFilterValue(vals?.flote, 'any'),
                    fvcr: getFilterValue(vals?.fvcr, 'any'),
                    fdata: getFilterRangeValues(vals["fdata"]?.formatted),
                };
                dataAPI.addFilters(_values, true);
                dataAPI.addParameters({});
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onAction = (item, row) => {
        switch (item.key) {
            default:break;
        }
    }
    const changeMode = () => {
        if (allowEdit.datagrid) {
            setModeEdit({ datagrid: (modeEdit.datagrid) ? false : allowEdit.datagrid });
        }
    }
    const onSave = async (action) => {
        submitting.trigger();
        try {} catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        } finally {
            submitting.end();
        };
    }

    return (
        <>
            {!setFormTitle && <TitleForm data={dataAPI.getAllFilter()} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            <Table
                loading={submitting.state}
                actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} modeEdit={modeEdit.datagrid} />}
                frozenActionColumn={true}
                reportTitle={title}
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                toolbar={true}
                search={true}
                moreFilters={true}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={false}
                rowHeight={28}
                rowClass={(row) => (row?.valid === 0 ? classes.notValid : undefined)}
                leftToolbar={<Space></Space>}
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 350, mask: true }
                }}
            />
        </>
    );
}