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
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS } from 'config';
import { json } from "utils/object";
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
//import { Status } from './commons';
import { TbCircles } from "react-icons/tb";
import { GoArrowUp } from 'react-icons/go';
import { ImArrowLeft } from 'react-icons/im';
//import { Cuba } from "../currentline/dashboard/commons/Cuba";
//import { Core, EstadoBobines, Largura } from "./commons";
import Bobinagem from './Bobinagem';
import { MediaContext } from "../App";
import { RightAlign, LeftAlign, CenterAlign, Cuba, Status, TextAreaViewer, MetodoOwner, Link, DateTime, Favourite, Valid, Nonwovens, ArrayColumn, EstadoBobines, Largura, Core, Delete, Bool } from 'components/TableColumns';


const focus = (el, h,) => { el?.focus(); };
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const title = "Paletes";

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>

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
const moreFiltersSchema = ({ form }) => [];

const NumColumn = ({ value, unit = '' }) => {
    return (
        <>{value && <div style={{ textAlign: "right" }}>{value} {unit}</div>}</>
    );
}


export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({ allowed: { producao: 300, planeamento: 300 } });
    const [allowEdit, setAllowEdit] = useState({ datagrid: false });
    const [modeEdit, setModeEdit] = useState({ datagrid: false });

    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = { method: "BobinagensHistoryList" };
    const defaultSort = [{ column: "-audit_id", direction: "DESC" }];
    const dataAPI = useDataAPI({ id: "lst-hbobinagens", payload: { url: `${API_URL}/bobinagens/sql/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: [] } });
    const submitting = useSubmitting(true);
    const [lastTab, setLastTab] = useState('1');

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                //case "bobineslist": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal type={modalParameters?.type} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    const primaryKeys = ['audit_id'];

    const columns = [
        { key: 'audit_timestamp', width: 130, name: 'Data', formatter: p => moment(p.row.timestamp).format(DATETIME_FORMAT) },
        { key: 'inico', name: 'Início', width: 90, formatter: p => p.row.inico },
        { key: 'fim', name: 'Fim', width: 90, formatter: p => p.row.fim },
        { key: 'duracao', name: 'Duração', width: 90, formatter: p => p.row.duracao },
        { key: 'nome', name: 'Bobinagem', width: 90, formatter: p => <b>{p.row.nome}</b> },
        { key: 'comp', name: 'Comp.', width: 90, formatter: p => <NumColumn value={p.row.comp} unit={<>m</>} /> },
        { key: 'comp_par', name: 'Comp. Emenda', width: 90, formatter: p => <NumColumn value={p.row.comp_par} unit={<>m</>} /> },
        { key: 'comp_cli', name: 'Comp. Cliente', width: 90, formatter: p => <NumColumn value={p.row.comp_cli} unit={<>m</>} /> },
        { key: 'area', name: 'Área', width: 90, formatter: p => <NumColumn value={p.row.area} unit={<>m&sup2;</>} /> },
        { key: 'diam', name: 'Diam.', width: 90, formatter: p => <NumColumn value={p.row.diam} unit={<>mm</>} /> },
        { key: 'desper', name: 'Desper.', width: 90, formatter: p => <NumColumn value={p.row.desper} unit={<>m</>} /> },
        { key: 'largura_bruta', name: 'Diam.', width: 90, formatter: p => <NumColumn value={p.row.largura_bruta} unit={<>mm</>} /> },
        { key: 'valid', name: 'Válida', width: 90, formatter: p => <Bool value={p.row.valid} /> },

        { key: 'nwinf', name: 'Nw Inf.', width: 90, formatter: p => <NumColumn value={p.row.nwinf} unit={<>m</>} /> },
        { key: 'lotenwinf', name: 'Lote Nw Inf.', width: 90, formatter: p => <b>{p.row.lotenwinf}</b> },
        { key: 'tiponwinf', name: 'Nw Inf.', width: 220, formatter: p => <b>{p.row.tiponwinf}</b> },

        { key: 'nwSUP', name: 'Nw Sup.', width: 90, formatter: p => <NumColumn value={p.row.nwsup} unit={<>m</>} /> },
        { key: 'lotenwsup', name: 'Lote Nw Sup.', width: 90, formatter: p => <b>{p.row.lotenwsup}</b> },
        { key: 'tiponwsup', name: 'Nw Sup.', width: 220, formatter: p => <b>{p.row.tiponwsup}</b> },
    ];

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ init = false, signal } = {}) => {
        if (init) {
            const initFilters = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, {}, [...Object.keys(dataAPI.getAllFilter())]);
            let { filterValues, fieldValues } = fixRangeDates([], initFilters);
            formFilter.setFieldsValue({ ...fieldValues });
            const bobinagem_id = props?.parameters?.bobinagem_id;
            dataAPI.addFilters({ ...filterValues, ...(bobinagem_id && { bobinagem_id }) }, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters(defaultParameters, true, true);
            dataAPI.fetchPost({ signal });
            setAllowEdit({ datagrid: permission.allow() });
            setModeEdit({ datagrid: false });
        }
        submitting.end();
    }

    useEffect(() => {

        console.log("DATA->>>>", dataAPI.getData());

    }, [dataAPI.hasData()]);

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
                    fdatain: getFilterRangeValues(vals["fdatain"]?.formatted),
                    fdataout: getFilterRangeValues(vals["fdataout"]?.formatted),
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

    return (
        <>
            <Table
                loading={submitting.state}
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
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 350, mask: true }
                }}
            />
        </>
    );
}