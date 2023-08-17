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
import loadInit, { fixRangeDates } from "utils/loadInitV3";
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

const title = "Formulação";
const TitleForm = ({ data, onChange, level, auth, form, showHistory }) => {
    return (<ToolbarTitle id={auth?.user} description={title} showHistory={showHistory} title={<>
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

const loadFormulacao = async (params, primaryKey, signal) => {
    let rows;
    if (params?.formulacaoData) {
        rows = [{ formulacao: params.formulacaoData }];
    } else {
        const { data } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...params }, sort: [], parameters: { method: "GetFormulacao" }, signal });
        rows = data?.rows;
    }
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

export default ({ setFormTitle, showTitle=true, noDosers = false, form:_form, header = true, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "formulacao", item: "readonly" });//Permissões Iniciais
    const inputParameters = useRef({});
    const [form] = !_form ? Form.useForm() : [_form];
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
        ...(!noDosers) ? [{ name: 'cuba', header: false, userSelect: true, defaultLocked: false, width: 45, headerAlign: "center", cellProps: { className: columnClass }, colspan: ({ data, column, columns }) => (data?.group) ? columns.length : 1, render: ({ cellProps, data }) => data?.group ? <div style={{ fontWeight: 900 }}>{data?.designacao}</div> : <Cuba value={data?.cuba} /> }] : [],
        ...(!noDosers) ? [{ name: 'doseador', header: false, userSelect: true, defaultLocked: false, width: 30, headerAlign: "center", render: (p) => <CenterAlign style={{ fontWeight: 700 }}>{p.data?.doseador}</CenterAlign> }] : [],
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
    }, [props?.parameters?.formulacaoData, props?.parameters?.cs_id, props?.parameters?.formulacao_id, props?.parameters?.tstamp,props?.parameters?.audit_cs_id,props?.parameters?.new]);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, ["formulacao_id", "cs_id", "audit_cs_id", "new"]);
            inputParameters.current = paramsIn;
        }
        const { items, ...formulacao } = await loadFormulacao({ ...inputParameters.current, formulacaoData: props?.parameters?.formulacaoData }, dataAPI.getPrimaryKey(), signal);
        dataAPI.setData({ rows: items, total: items?.length });
        if (header) {
            console.log("#xxxx",{
                formulacaoRO: {
                    joinbc: 1, reference: 0, ...formulacao,
                    cliente: { BPCNUM_0: formulacao?.cliente_cod, BPCNAM_0: formulacao?.cliente_nome },
                    produto_id: formulacao?.produto_id,
                    artigo_id: formulacao?.artigo_id
                }
            })
            form.setFieldsValue({
                formulacaoRO: {
                    joinbc: 1, reference: 0, ...formulacao,
                    cliente: { BPCNUM_0: formulacao?.cliente_cod, BPCNAM_0: formulacao?.cliente_nome },
                    produto_id: formulacao?.produto_id,
                    artigo_id: formulacao?.artigo_id
                }
            });
        }
        submitting.end();
    }

    const onFilterFinish = (type, values) => { }
    const onFilterChange = (changedValues, values) => { };
    const rowClassName = ({ data }) => { }

    return (
        <>
            {(!setFormTitle && showTitle) && <TitleForm showHistory={false} auth={permission.auth} data={dataAPI.getFilter(true)} level={location?.state?.level} />}
            <FormContainer id="form" fluid loading={submitting.state} wrapForm={(!_form && header) ? true : false} form = {form} wrapFormItem={true} forInput={false} style={{ padding: "0px" }} alert={{ tooltip: true, pos: "none" }}>
                {header && <Row style={{ marginBottom: "10px" }} gutterWidth={10} wrap="wrap">
                    <Col xs={2} md={1}><Field name={["formulacaoRO", "versao"]} forInput={false} label={{ enabled: true, text: "Versao" }}><Input /></Field></Col>
                    <Col xs={4} md={2}><FormulacaoGroups name={["formulacaoRO", "group_name"]} label={{ enabled: true, text: "Grupo" }} /></Col>
                    <Col xs={4} md={2}><FormulacaoSubGroups name={["formulacaoRO", "subgroup_name"]} label={{ enabled: true, text: "SubGrupo" }} /></Col>
                    <Col xs={12} md={6} lg={4}><Field name={["formulacaoRO", "designacao"]} label={{ enabled: true, text: "Designação" }}><Input /></Field></Col>
                    <Col xs={12} md={6} lg={4}><Produtos name={["formulacaoRO", "produto_id"]} allowClear label={{ enabled: true, text: "Produto" }} load /></Col>
                    <Col xs={12} md={6} lg={4}><Artigos name={["formulacaoRO", "artigo_id"]} allowClear label={{ enabled: true, text: "Artigo" }} load /></Col>
                    <Col xs={12} md={6} lg={4}><Clientes name={["formulacaoRO", "cliente"]} allowClear label={{ enabled: true, text: "Cliente" }} /></Col>
                </Row>}
            </FormContainer>
            <Table
                style={{ fontSize: "10px"/* , minHeight: "100%" */ }}
                rowHeight={20}
                headerHeight={20}
                dynamicHeight={70}
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

        </>
    );


};