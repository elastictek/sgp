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
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ProfileOutlined } from '@ant-design/icons';
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
const schemaRemove = (options = {}) => {
    return getSchema({
        t_stamp_out: Joi.any().label("Data de Saída").required()
    }, options).unknown(true);
}
const schemaProcess = (options = {}) => {
    return getSchema({
        t_stamp_out: Joi.any().label("Data de Saída").required()
    }, options).unknown(true);
}
const title = "Consumos de Matérias Primas";
const TitleForm = ({ data, onChange, record, level, form }) => {
    // const st = JSON.stringify(record.ofs)?.replaceAll(/[\[\]\"]/gm, "")?.replaceAll(",", " | ");
    return (<ToolbarTitle /* history={level === 0 ? [] : ['Registo Nonwovens - Entrada em Linha']} */ title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }}>
                <Col xs='content' style={{}}><Row nogutter><Col><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title}</span></Col></Row></Col>
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
            <Field name="fof" label={{ enabled: true, text: "Ordem Fabrico", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="fdataout" label={{ enabled: true, text: "Data Saída", pos: "top", padding: "0px" }}>
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
    { fof: { label: "Ordem Fabrico", field: { type: 'input', size: 'small' } } },
    { fdatain: { label: "Data Entrada", field: { type: "rangedate", size: 'small' } } },
    { fdataout: { label: "Data Saída", field: { type: "rangedate", size: 'small' } } }
];

const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}

const RemoveConsumosContent = ({ parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);

    const loadData = async ({ signal } = {}) => {
        submitting.end();
    };
    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (values) => {
        submitting.trigger();
        const v = schemaRemove().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            try {
                let response = await fetchPost({ url: `${API_URL}/updateconsumos/`, filter: { reopen: values?.reopen, t_stamp_out: moment(values.t_stamp_out).format(DATE_FORMAT) }, parameters: { type: "removeconsumos", status: 0 } });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: "Consumos apagados com sucesso!" })
                } else {
                    status.formStatus.error.push({ message: response.data.title });
                    setFormStatus({ ...status.formStatus });
                }
            } catch (e) {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            };
        }
        submitting.end();
    }

    const onValuesChange = (changedValues, values) => { }

    return (
        <Form form={form} name={`f-out`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-OUT" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaRemove} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field forInput={true} wrapFormItem={true} name="t_stamp_out" label={{ enabled: true, text: "Data de Saída" }}><DatePicker format={DATE_FORMAT} size="small" /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col xs="content"><Field forInput={true} wrapFormItem={true} name="reopen" label={{ enabled: true, text: "Reabrir movimentos", style: { paddingTop: "5px", paddingBottom: "0px" } }}><CheckboxField /></Field></Col>
                </Row>
            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Apagar</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}

const ProcessConsumosContent = ({ parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);

    const loadData = async ({ signal } = {}) => {
        submitting.end();
    };
    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (values) => {
        submitting.trigger();
        const v = schemaProcess().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);
        

        if (values?.nonwovens==0 && values?.granulado==0) {
            errors = 1;
            status.fieldStatus.nonwovens = { status: "error", messages: [{ message: "Tem de selecionar pelo menos um tipo de matéria prima a processar!" }] };
        }
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            try {
                let response = await fetchPost({ url: `${API_URL}/updateconsumos/`, filter: { nonwovens: values?.nonwovens, granulado: values?.granulado, t_stamp_out: moment(values.t_stamp_out).format(DATE_FORMAT) }, parameters: { type: "processconsumos", status: 0 } });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: "Consumos processados com sucesso!" })
                } else {
                    status.formStatus.error.push({ message: response.data.title });
                    setFormStatus({ ...status.formStatus });
                }
            } catch (e) {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            };
        }
        submitting.end();
    }

    const onValuesChange = (changedValues, values) => { }

    return (
        <Form form={form} name={`f-out`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{ nonwovens: 1, granulado: 1 }}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-OUT" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ /* onValuesChange={onValuesChange}  */ schema={schemaRemove} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col><Field forInput={true} wrapFormItem={true} name="t_stamp_out" label={{ enabled: true, text: "Data de Saída" }}><DatePicker format={DATE_FORMAT} size="small" /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col xs="content"><Field forInput={true} wrapFormItem={true} name="nonwovens" label={{ enabled: true, text: "Nonwovens", style: { paddingTop: "5px", paddingBottom: "0px", paddingLeft: "0px" } }}><CheckboxField /></Field></Col>
                    <Col xs="content"><Field forInput={true} wrapFormItem={true} name="granulado" label={{ enabled: true, text: "Granulado", style: { paddingTop: "5px", paddingBottom: "0px", paddingLeft: "0px" } }}><CheckboxField /></Field></Col>
                </Row>
            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Processar</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}

const Unit = ({ v }) => {
    return (<>
        {v === 0 && <span>kg</span>}
        {v === 1 && <span>m<sup>2</sup></span>}
    </>);
}

export default ({ setFormTitle, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({ allowed: { producao: 300, planeamento: 300 } });
    const [allowEdit, setAllowEdit] = useState({ datagrid: false, form: false });
    const [modeEdit, setModeEdit] = useState({ datagrid: false, form: true });

    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: "lst-consumos", payload: { url: `${API_URL}/consumogranuladolist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: [] } });
    const submitting = useSubmitting(true);

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.type) {
                case "removeconsumos": return <RemoveConsumosContent loadParentData={modalParameters.loadData} record={modalParameters.record} />;
                case "processconsumos": return <ProcessConsumosContent loadParentData={modalParameters.loadData} record={modalParameters.record} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters.title} onCancel={hideModal} width={modalParameters.width ? modalParameters.width : 600} height={modalParameters.height ? modalParameters.height : 250} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    const primaryKeys = ['ofid', 'artigo_cod', 'n_lote', 't_stamp_in'];
    const editable = (row, col) => {
        if (modeEdit.datagrid && allowEdit.datagrid) { }
        return false;
    }
    const editableClass = (row, col) => {
        if (modeEdit.datagrid && allowEdit.datagrid) { }
    }
    const formatterClass = (row, col) => { }

    const columns = [
        { key: 'type_mp_des', name: 'Mat.Prima', frozen: true, width: 100, formatter: p => p.row.type_mp_des },
        { key: 'artigo_cod', name: 'Artigo', frozen: true, width: 200, formatter: p => p.row.artigo_cod },
        { key: 'artigo_des', minWidth: 250, name: 'Designação', formatter: p => <b>{p.row.artigo_des}</b> },
        { key: 'n_lote', width: 310, name: 'Lote', formatter: p => <b>{p.row.n_lote}</b> },
        { key: 'ofid', name: 'Ordem Fabrico', width: 200, formatter: p => p.row.ofid },
        { key: 't_stamp_in', width: 140, name: 'Data Entrada Linha', formatter: p => p.row.t_stamp_in && moment(p.row.t_stamp_in).format(DATETIME_FORMAT) },
        { key: 't_stamp_out', width: 140, name: 'Data saída Linha', formatter: p => p.row.t_stamp_out && moment(p.row.t_stamp_out).format(DATETIME_FORMAT) },
        { key: 'qty_lote', name: 'Qtd. Lote', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.qty_lote).toFixed(2)} <Unit v={p.row.type_mp} /></div> },
        { key: 'qty', name: 'Qtd.', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.qty).toFixed(2)} <Unit v={p.row.type_mp} /></div> },
        { key: 'n_bobinagens', reportTitle: 'N. Bobinagens/of', name: <div style={{ lineHeight: 1.5 }}><div>N. Bobinagens por</div><div>OF</div></div>, width: 90, formatter: p => p.row.n_bobinagens },
        { key: 'nbob_of_artigo', reportTitle: 'N. Bobinagens/of/artigo', name: <div style={{ lineHeight: 1.5 }}><div>N. Bobinagens por</div><div>OF e Artigo</div></div>, width: 90, formatter: p => p.row.nbob_of_artigo },
        { key: 'area_total', name: 'Area Total', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.area_total).toFixed(2)} m<sup>2</sup></div> },
        { key: 'consumo_by_of', reportTitle: 'Consumo/of', name: <div style={{ lineHeight: 1.5 }}><div>Consumo por</div><div>OF</div></div>, minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.consumo_by_of).toFixed(2)} <Unit v={p.row.type_mp} /></div> },
        { key: 'consumo_of_artigo', name: 'Consumo/of/artigo', name: <div style={{ lineHeight: 1.5 }}><div>Consumo por</div><div>OF e Artigo</div></div>, minWidth: 110, width: 110, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.consumo_of_artigo).toFixed(2)} <Unit v={p.row.type_mp} /></div> },
    ];

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ init = false, signal } = {}) => {
        if (init) {
            const initFilters = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, {}, [...Object.keys(dataAPI.getAllFilter())]);
            let { filterValues, fieldValues } = fixRangeDates(['fdatain', 'fdataout'], initFilters);
            formFilter.setFieldsValue({ ...fieldValues });
            dataAPI.addFilters({ ...filterValues }, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters({}, true, true);
            dataAPI.fetchPost({ signal });
            setAllowEdit({ datagrid: permission.allow(), form: permission.allow() });
            setModeEdit({ datagrid: false, form: true });
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
                    fof: getFilterValue(vals?.fof, 'any'),
                    fdatain: getFilterRangeValues(vals["fdatain"]?.formatted),
                    fdataout: getFilterRangeValues(vals["fdataout"]?.formatted)
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
            default: break;
        }
    }
    const changeMode = () => {
        if (allowEdit.datagrid) {
            setModeEdit({ datagrid: (modeEdit.datagrid) ? false : allowEdit.datagrid });
        }
    }
    const onSave = async (action) => {
        submitting.trigger();
        try { } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        } finally {
            submitting.end();
        };
    }
    const onRemoveConsumos = () => {
        setModalParameters({ height: 180, width: 450, type: "removeconsumos", title: "Apagar Consumos na data de saída", loadData: () => dataAPI.fetchPost() });
        showModal();
    }
    const onProcessConsumos = () => {
        setModalParameters({ height: 200, width: 450, type: "processconsumos", title: "Processar consumos na data de saída", loadData: () => dataAPI.fetchPost() });
        showModal();
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
                headerRowHeight={40}
                rowClass={(row) => (row?.valid === 0 ? classes.notValid : undefined)}
                leftToolbar={<Space>
                    {modeEdit.form && <>
                        <Button disabled={(!allowEdit.form || submitting.state)} icon={<ProfileOutlined />} onClick={onProcessConsumos}>Processar consumos</Button>
                        <Button disabled={(!allowEdit.form || submitting.state)} icon={<CloseCircleOutlined style={{ color: "#cf1322" }} />} onClick={onRemoveConsumos}>Apagar consumos</Button>
                    </>}
                </Space>}
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 350, mask: true }
                }}
            />
        </>
    );
}