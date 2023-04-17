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
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch, Card } from "antd";
const { TextArea } = Input;
// import ToolbarTitle from './commons/ToolbarTitle';
const { Title } = Typography;
import { json } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberEditor, MateriasPrimasTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba } from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';
import IconButton from "components/iconButton";
import { MdAdjust, MdAssignmentReturned } from 'react-icons/md';

const useStyles = createUseStyles({});

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}


const loadFormulacao = async (params, primaryKey, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...params }, sort: [], parameters: { method: "GetFormulacao" }, signal });
    if (rows && rows.length > 0) {
        let _v = json(rows[0]?.formulacao);
        if (!_v?.items) {
            _v["items"] = [];
        }
        const groupMap = new Map();
        _v["items"].forEach(obj => {
            if (groupMap.has(obj.extrusora)) {
                groupMap.get(obj.extrusora).push(obj);
            } else {
                groupMap.set(obj.extrusora, [obj]);
            }
        });
        // sort the group keys in ascending order
        const groupKeys = Array.from(groupMap.keys()).sort();
        // loop through the sorted group keys and add the objects to resultArray
        const resultArray = [];
        groupKeys.forEach(key => {
            resultArray.push({ group: key, designacao: `Extrusora ${key}`, [primaryKey]: key });
            groupMap.get(key).forEach(obj => {
                resultArray.push({ ...obj, [primaryKey]: `${obj.extrusora}-${uid(4)}` });
            });
        });
        _v["items"] = resultArray;
        return _v;
    }
    return {};
}

export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "formulacao", item: "readonly" });//Permissões Iniciais
    const inputParameters = useRef({});

    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: ``, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });
    const submitting = useSubmitting(true);

    // const [modalParameters, setModalParameters] = useState({});
    // const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
    //     const content = () => {
    //         switch (modalParameters.content) {
    //             case "ordensfabrico": return <Chooser parameters={modalParameters.parameters} />;
    //         }
    //     }
    //     return (
    //         <ResponsiveModal responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
    //             {content()}
    //         </ResponsiveModal>
    //     );
    // }, [modalParameters]);

    // const columnEditable = (v, { data, name }) => {
    //     return false;
    // }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        if (data?.group) {
            return tableCls.right;
        }
    };

    const groups = [
        { name: 'extrusora', header: 'Distribuição por Extrusora', headerAlign: "center" }
    ]

    const columns = [
        ...(true) ? [{ name: 'cuba', header: false, userSelect: true, defaultLocked: false, width: 45, headerAlign: "center", cellProps: { className: columnClass }, colspan: ({ data, column, columns }) => (data?.group) ? columns.length : 1, render: ({ cellProps, data }) => data?.group ? <div style={{ fontWeight: 900 }}>{data?.designacao}</div> : <Cuba value={data?.cuba} /> }] : [],
        ...(true) ? [{ name: 'doseador', header: false, userSelect: true, defaultLocked: false, width: 30, headerAlign: "center", render: (p) => <CenterAlign style={{ fontWeight: 700 }}>{p.data?.doseador}</CenterAlign> }] : [],
        ...(true) ? [{ name: 'matprima_cod', header: 'Código', userSelect: true, defaultLocked: false, width: 150, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'matprima_des', header: 'Artigo', userSelect: true, defaultLocked: false, minWidth: 170, flex: 1, headerAlign: "center", render: ({ cellProps, data }) => <div style={{ fontWeight: 700 }}>{data?.matprima_des}</div> }] : [],
        ...(true) ? [{ name: 'densidade', header: 'Densidade', userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", render: (p) => <RightAlign>{p.data?.densidade}</RightAlign> }] : [],
        ...(true) ? [{ name: 'arranque', header: 'Arranque', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", render: (p) => <RightAlign unit="%">{p.data?.arranque}</RightAlign> }] : [],
        ...(true) ? [{ name: 'tolerancia', header: 'Tolerância', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", render: (p) => <RightAlign unit="%">{p.data?.tolerancia}</RightAlign> }] : [],
        ...(true) ? [{ name: 'vglobal', header: 'Global', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", render: (p) => <RightAlign unit="%">{p.data?.vglobal}</RightAlign> }] : []
    ];


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, ["formulacao_id", "cs_id", "audit_cs_id", "new"]);
            inputParameters.current = paramsIn;
        }
        const { items, ...formulacao } = await loadFormulacao({ ...inputParameters.current }, dataAPI.getPrimaryKey(), signal);
        dataAPI.setData({ rows: items, total: items?.length });
        submitting.end();
    }

    const onFilterFinish = (type, values) => { }
    const onFilterChange = (changedValues, values) => { };
    const rowClassName = ({ data }) => { }

    return (
        <Table
            style={{ fontSize: "10px", minHeight: "100%" }}
            rowHeight={20}
            headerHeight={20}
            cellNavigation={false}
            loading={submitting.state}
            idProperty={dataAPI.getPrimaryKey()}
            local={true}
            onRefresh={loadData}
            rowClassName={rowClassName}
            groups={groups}
            sortable={false}
            reorderColumns={false}
            showColumnMenuTool={false}
            disableGroupByToolbar={true}
            editable={{ enabled: false, add: false }}
            columns={columns}
            dataAPI={dataAPI}
            moreFilters={false}
            leftToolbar={false}
            toolbarFilters={false}
            toolbar={false}
        />
    );


};