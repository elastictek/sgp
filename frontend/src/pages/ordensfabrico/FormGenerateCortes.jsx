import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import classNames from "classnames";
import { useSubmitting, getPositiveInt, getInt } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL } from "config";
import IconButton from "components/iconButton";
import { CgCloseO } from 'react-icons/cg';
import { useDataAPI } from "utils/useDataAPIV3";
import Toolbar from "components/toolbar";
import { orderObjectKeys, json } from "utils/object";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, TimePicker } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, InfoCircleOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV3';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, TIME_FORMAT, ENROLAMENTO_OPTIONS } from 'config';
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Cores } from 'components/EditorsV3';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, DatetimeField, TimeField, CortesField, RowSpace, InputNumberField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { Core, EstadoBobines, Largura } from "components/TableColumns";
import { LeftToolbar, RightToolbar, Edit } from "./OrdemFabrico";
import FormCortesOrdem from './FormCortesOrdem';
import { ImArrowDown, ImArrowUp } from 'react-icons/im';
import { current } from 'immer';
import { MediaContext, AppContext } from 'app';
import { uid } from 'uid';

const EDITKEY = "cortes_plan";
const PERMISSION = { item: "edit", action: "cortes_plan" };

const schema = (options = {}) => {
    return getSchema({
    }, options).unknown(true);
}

const loadGenerationCortes = async (agg_of_id) => {
    const { data } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, pagination: { limit: 1 }, filter: { "agg_of_id": agg_of_id }, parameters: { method: "GetCortesGeneration" } });
    return data;
}
const loadStockCutOptimizer = async (child_rolls, parent_rolls, max_cutters) => {
    const { data } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "StockCutOptimizer", child_rolls, parent_rolls, max_cutters } });
    return data;
}

const loadCortesOrdemLookup = async ({ cortes, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "CortesOrdemLookup" }, filter: { cortes }, sort: [{ column: 'versao', direction: 'DESC' }], signal });
    return rows;
}

const coloured = (field, form, index) => {
    switch (field) {
        case 'largura_util':
            const diff = form.getFieldValue('largura_util') - form.getFieldValue('cortes')[index].largura_util;
            console.log(diff)
            if (diff >= 40) {
                return "#ff4d4f";
            }
            if (diff != 0) {
                return "#ffec3d";
            }
            break;
    }
}

const RowHover = styled(Row)`
    cursor:pointer;
    padding:5px;
    ${({ selected }) => (selected === 1) && `background-color:#d9f7be;`}
    border-radius:3px;
    ${({ selected }) => (selected === 0) && `
    &:hover {
        background-color:#f5f5f5;
    `}

  }`;

export const VersionsPopup = ({ record, closeSelf }) => {
    const [visible, setVisible] = useState({ drawer: { open: false } });
    const dataAPI = useDataAPI({ payload: { parameters: {}, primaryKey: "id", pagination: { enabled: false, limit: 30 }, filter: {}, sort: [] } });
    const columns = [
        { name: 'versao', header: 'Versão', defaultWidth: 50 },
        { name: 'designacao', header: 'Designação', defaultWidth: 180 },
        { name: 'largura_ordem', flex: 1, header: 'Posicionamento', render: ({ data, cellProps }) => <div style={{ color: "#1890ff", fontWeight: 600 }}>{data.largura_ordem.replaceAll('"', ' ')}</div> }
    ];

    useEffect(() => {
        dataAPI.setData({ rows: record.versions }, { tstamp: Date.now() });
    }, []);

    const onOpen = (component, data) => {
        setVisible(prev => ({ ...prev, [component]: { ...data, title: <div>Bobine <span style={{ fontWeight: 900 }}>{data.nome}</span></div>, open: true } }));
    }

    const onClose = (component) => {
        setVisible(prev => ({ ...prev, [component]: { open: false } }));
    }

    const onSelect = (row, col) => {
        record.onSelect(row?.data);
        closeSelf();
    }

    return (<YScroll>

        <Table
            idProperty={dataAPI.getPrimaryKey()}
            local={true}
            cellNavigation={false}
            onSelectionChange={onSelect}
            enableSelection={true}
            rowSelect={true}
            sortable={false}
            settings={false}
            reorderColumns={false}
            showColumnMenuTool={false}
            loadOnInit={false}
            defaultLimit={30}
            columns={columns}
            dataAPI={dataAPI}
            moreFilters={false}
        />
        {/* 



        <Table
            onRowClick={onSelect}
            rowStyle={`cursor:pointer;font-size:12px;`}
            headerStyle={`background-color:#f0f0f0;font-size:10px;`}
            loadOnInit={false}
            columns={columns}
            dataAPI={dataAPI}
            toolbar={false}
            search={false}
            moreFilters={false}
            rowSelection={false}
            editable={false}
        //rowHeight={28}
        /> */}
    </YScroll>);
}

export default ({ operationsRef, extraRef, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);

    const permission = usePermission({ permissions: props?.permissions });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: true, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});

    const classes = useStyles();
    const [form] = Form.useForm();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = [];
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];
    const [selected, setSelected] = useState();
    const [larguras, setLarguras] = useState([]);
    const [generated, setGenerated] = useState(false);

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.type) {
                case "versions": return <VersionsPopup record={{ ...modalParameters }} />
            }
        }

        return (
            <ResponsiveModal title={modalParameters.title} onCancel={hideModal} width={modalParameters.width ? modalParameters.width : 600} height={modalParameters.height ? modalParameters.height : 250} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        setFormDirty(false);
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
            inputParameters.current = { showPlan: true, ...paramsIn };
        }
        const _base = await loadGenerationCortes(inputParameters.current.agg_of_id);
        let _cortes = [];
        if (inputParameters.current?.data && inputParameters.current.data.length > 0) {
            _cortes = inputParameters.current.data.map((v, idx) => {
                const l = Object.keys(json(v.cortes)).reduce((acc, key) => ({ ...acc, [key]: parseInt(key) }), {});
                return { idx: idx, id: v.id, n_cortes: json(v.cortes), n: v.iterations, largura_util: v.largura_util, cortes_ordem: json(v.cortes_ordem), bobines_total: json(v.cortes_ordem).length * v.iterations, largura: l }
            })
            setGenerated(true);
        }
        setLarguras([...new Set(_base.map(v => v.largura))]);
        form.setFieldsValue({ larguras: [..._base], largura_util: 2100, max_cutters: 24, cortes: [..._cortes] });
        submitting.end();
    }

    const onSave = async (values) => {
        submitting.trigger();
        if (props?.onSelectPlan && typeof props.onSelectPlan == "function") {
            props?.onSelectPlan(form.getFieldsValue(true));
        }
        submitting.end();
    }

    const onSaveCortes = async (values) => {
        submitting.trigger();
        if (props?.onSelectPlan && typeof props.onSelectPlan == "function") {
            const v = form.getFieldsValue(true);
            let _n_cuts = Object.values(v?.cortes[0].n_cortes).reduce((a, b) => a + b, 0);
            if (_n_cuts==0){
                openNotification("error", 'top', "Notificação", "O nº de cortes não pode ser zero!");
            }else{
                props?.onSelectPlan(form.getFieldsValue(true));
            }
        }
        submitting.end();
    }

    const onValuesChange = (v, a) => {
        if ("larguras" in v) {
            let idx = v.larguras.length;
            let l = a.larguras[idx - 1];
            l.paletes_stock = getPositiveInt(l.paletes_stock);
            l.paletes = getPositiveInt(l.paletes);
            l.paletes_stock = (l.paletes_stock > l.paletes) ? l.paletes : l.paletes_stock;
            a.larguras[idx - 1].bobines_total = (l.paletes - l.paletes_stock) * l.bobines_palete;
            let _paleteproduzir = l.paletes - l.paletes_stock;
            a.larguras[idx - 1].paletes_para_stock = l.paletes_original < _paleteproduzir ? _paleteproduzir - l.paletes_original : 0;
            form.setFieldsValue({ ...a });
        }
        if ("cortes" in v) {
            if (form.getFieldsValue(["remove"])?.remove === true) {
                form.setFieldsValue({ remove: false });
            }
            else {
                let _max_cutters = form.getFieldValue("max_cutters")
                let idx = v.cortes.length;
                let l = a.cortes[idx - 1];
                for (const key in l.n_cortes) {
                    if (l.n_cortes[key] === null) {
                        l.n_cortes[key] = 0;
                    }
                }
                let _n_cuts = Object.values(l.n_cortes).reduce((a, b) => a + b, 0);
                if (_n_cuts > _max_cutters) {
                    l.n_cortes[Object.keys(v.cortes[idx - 1].n_cortes)[0]] = Object.values(v.cortes[idx - 1].n_cortes)[0] - (_n_cuts - _max_cutters);
                }
                let _lar_util = Object.entries(l.n_cortes).reduce((a, b) => a + (b[0] * b[1]), 0);
                let _n_bobines_total = Object.entries(l.n_cortes).reduce((a, b) => a + (b[1] * l.n), 0);
                a.cortes[idx - 1].largura_util = _lar_util;
                a.cortes[idx - 1].bobines_total = _n_bobines_total;
                if (l.idx === selected?.idx || !inputParameters.current.showPlan) {
                    if (!inputParameters.current.showPlan || JSON.stringify(l.n_cortes) !== JSON.stringify(selected.n_cortes)) {
                        const _cortes_ordem = [];
                        for (let x of larguras) {
                            _cortes_ordem.push(...(new Array(l.n_cortes[x])).fill(x));
                        }
                        a.cortes[idx - 1].cortes_ordem = _cortes_ordem;
                        setSelected(a.cortes[idx - 1]);
                    }
                }
                form.setFieldsValue({ ...a });
            }
        }
    };

    const gerar = async () => {
        let _lines = [];
        let values = form.getFieldsValue(true);

        const child_rolls = values.larguras.map(v => {
            return [v.bobines_total, v.largura];
        });
        const parent_rolls = [[10, values.largura_util]];
        const max_cutters = values.max_cutters;
        const _op = await loadStockCutOptimizer(child_rolls, parent_rolls, max_cutters);
        for (const [i, v] of _op.entries()) {
            let _template = { largura: {}, n_cortes: {} };
            let _n_bobines_total = 0;
            let _cortes_ordem = [];
            for (let x of larguras) {
                let _cuts = (x in v.cuts_count) ? v.cuts_count[x] : 0;
                _template = { largura: { ..._template.largura, [x]: x }, n_cortes: { ..._template.n_cortes, [x]: _cuts } };
                _n_bobines_total += _cuts;
                _cortes_ordem.push(...(new Array(_cuts)).fill(x));
            }
            _lines.push({ idx: uid(4), ..._template, n: v.n, largura_util: v.largura_util, selected: 0, /* cuts: v.cuts_count */ bobines_total: _n_bobines_total * v.n, cortes_ordem: _cortes_ordem });
        }
        setSelected(null);
        setGenerated(true);
        form.setFieldsValue({ cortes: _lines });
    }

    const onGerar = async () => {
        submitting.trigger();
        if (!generated) {
            await gerar();
            submitting.end();
        } else {
            Modal.confirm({
                title: <div>Deseja gerar novos esquemas de corte?</div>, content: <div>Atenção!! Se continuar, todos os esquemas de cortes definidos serão perdidos!</div>, onCancel: () => submitting.end(), onOk: async () => {
                    await gerar();
                    submitting.end();
                }
            });
        }
    }

    const onSelectCorte = async (index) => {
        let _sel = null;
        form.getFieldValue("cortes")
        const c = form.getFieldValue("cortes").map((v, i) => {
            if (i === index) {
                _sel = v;
            }
            return v;
        })
        form.setFieldsValue({ cortes: c });
        setSelected(_sel);
    }

    const onSelectCortesOrdem = (row) => {
        onChangeCortesOrdem(selected.idx, json(row.largura_ordem));
    }

    const subTotal = (type) => {
        switch (type) {
            case 'bobines_a_produzir':
                return (form.getFieldValue('larguras')) && form.getFieldValue('larguras').reduce((a, b) => a + b.bobines_total, 0);
            case 'paletes_a_produzir':
                return (form.getFieldValue('larguras')) && form.getFieldValue('larguras').reduce((a, b) => a + b.paletes, 0);
            case 'paletes_stock':
                return (form.getFieldValue('larguras')) && form.getFieldValue('larguras').reduce((a, b) => a + b.paletes_stock, 0);
            case 'bobines_total':
                return (form.getFieldValue('cortes')) && form.getFieldValue('cortes').reduce((a, b) => a + b.bobines_total, 0);
            case 'n_bobinagens':
                return (form.getFieldValue('cortes')) && form.getFieldValue('cortes').reduce((a, b) => a + b.n, 0);
        }
    }

    const onChangeCortesOrdem = (idx, ordem) => {
        const index = form.getFieldValue(["cortes"]).findIndex(x => x.idx === idx);
        setSelected(prev => ({ ...prev, cortes_ordem: ordem }));
        form.setFieldValue(["cortes", index, 'cortes_ordem'], ordem);
    }

    const showVersions = async () => {
        const versions = await loadCortesOrdemLookup({ cortes: selected.n_cortes });
        setModalParameters({ type: 'versions', width: 850, title: <div>Versões de Posicionamento <span style={{ fontWeight: 900 }}>{JSON.stringify(selected.n_cortes).replaceAll(":", "x").replaceAll('"', "")}</span></div>, versions, onSelect: onSelectCortesOrdem });
        showModal();
    }

    return (
        <YScroll>

            <FormContainer id="LAY-OFCORTES" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                {inputParameters.current.showPlan && <>
                    <Row><Col><HorizontalRule marginTop='0px' title="Definições" right={<Space><Button type='link' disabled={(submitting.state)} size="small" onClick={onGerar}>Gerar Plano de Cortes</Button></Space>} /></Col></Row>
                    <Row>
                        <Col width={130}><Field name="largura_util" label={{ enabled: true, text: "Largura Útil", pos: "top" }}><InputNumber size="small" controls={false} addonAfter={<b>mm</b>} min={100} max={2400} /></Field></Col>
                        <Col width={120}><Field name="max_cutters" label={{ enabled: true, text: "Nº de Bandas", pos: "top" }}><InputNumber size="small" controls={false} min={1} max={25} /></Field></Col>
                    </Row>
                    <Row>

                        <Col></Col>
                    </Row>
                    <Form.List name="larguras">
                        {(fields, { add, remove, move }) => {
                            const addRow = (fields) => { }
                            const removeRow = (fieldName, field) => { }
                            const moveRow = (from, to) => { }
                            return (
                                <>
                                    <Row><Col><HorizontalRule title="Necessidades de Produção"/*  right={<Space><Button type='link' disabled={(submitting.state)} size="small" onClick={onGerar}>Gerar Plano de Cortes</Button></Space>} */ /></Col></Row>
                                    <Row gutterWidth={5}>
                                        <Col width={65} style={{ /* fontWeight: 700 */ }}></Col>
                                        <Col width={125} style={{ textAlign: "center" /* fontWeight: 700 */ }}>Bobines por Palete</Col>
                                        <Col></Col>
                                        <Col width={125} style={{ textAlign: "center"/* fontWeight: 700 */ }}>Paletes</Col>
                                        <Col width={125} style={{ textAlign: "center"/* fontWeight: 700 */ }}>Paletes de Stock</Col>
                                        <Col></Col>
                                        <Col width={125} style={{ textAlign: "center"/* fontWeight: 700 */ }}>Bobines a Produzir</Col>
                                        <Col width={125} style={{ textAlign: "center"/* fontWeight: 700 */ }}>Paletes para Stock</Col>
                                    </Row>
                                    {fields.map((field, index) => (
                                        <Row key={field.key} gutterWidth={5}>
                                            <Col width={65} style={{ display: "flex", justifyContent: "center" }}><Field forInput={false} name={[field.name, `largura`]} label={{ enabled: false }}><InputNumber size="small" style={{ width: "100%", }} controls={false} addonAfter={<b>mm</b>} /></Field></Col>
                                            <Col width={125} style={{ display: "flex", justifyContent: "center" }}><Field forInput={false} name={[field.name, `bobines_por_palete`]} label={{ enabled: false }}><InputNumber size="small" style={{ width: "80px", }} controls={false} /></Field></Col>
                                            <Col></Col>
                                            <Col width={125} style={{ display: "flex", justifyContent: "center" }}><Field name={[field.name, `paletes`]} label={{ enabled: false }}><InputNumber size="small" style={{ width: "80px" }} controls={false} /></Field></Col>
                                            <Col width={125} style={{ display: "flex", justifyContent: "center" }}><Field name={[field.name, `paletes_stock`]} label={{ enabled: false }}><InputNumber size="small" style={{ width: "80px" }} controls={false} /></Field></Col>
                                            <Col></Col>
                                            <Col width={125} style={{ display: "flex", justifyContent: "center" }}><Field forInput={false} name={[field.name, `bobines_total`]} label={{ enabled: false }}><InputNumber size="small" style={{ width: "80px" }} controls={false} /></Field></Col>
                                            <Col width={125} style={{ display: "flex", justifyContent: "center" }}><Field forInput={false} name={[field.name, `paletes_para_stock`]} label={{ enabled: false }}><InputNumber size="small" style={{ width: "80px" }} controls={false} /></Field></Col>
                                        </Row>
                                    ))}
                                    <Row gutterWidth={5}>
                                        <Col width={65} style={{ display: "flex", justifyContent: "center" }}></Col>
                                        <Col width={125} style={{ display: "flex", justifyContent: "center" }}></Col>
                                        <Col></Col>
                                        <Col width={125} style={{ display: "flex", justifyContent: "center", borderTop: "solid 2px #000", textAlign: "end", fontWeight: 600 }}>{subTotal('paletes_a_produzir')}</Col>
                                        <Col width={125} style={{ display: "flex", justifyContent: "center", borderTop: "solid 2px #000", textAlign: "end", fontWeight: 600 }}>{subTotal('paletes_stock')}</Col>
                                        <Col></Col>
                                        <Col width={125} style={{ display: "flex", justifyContent: "center", borderTop: "solid 2px #000", textAlign: "end", fontWeight: 600 }}>{subTotal('bobines_a_produzir')}</Col>
                                        <Col width={125}></Col>
                                    </Row>
                                </>
                            )
                        }
                        }
                    </Form.List>

                    <RowSpace />
                </>}
                <Form.List name="cortes">
                    {(fields, { add, remove, move }) => {
                        const addRow = (fields) => {
                            if ((inputParameters.current.showPlan === false && fields.length == 0) || inputParameters.current.showPlan === true) {
                                let _template = { largura: {}, n_cortes: {} };
                                for (let x of larguras) {
                                    _template = { largura: { ..._template.largura, [x]: x }, n_cortes: { ..._template.n_cortes, [x]: 0 } };
                                }
                                add({ idx: uid(4), ..._template, n: 0, largura_util: 0, bobines_total: 0, cortes_ordem: [] });
                            }
                        }
                        const removeRow = (e, fieldName, field) => {
                            e.stopPropagation();
                            const _c = form.getFieldsValue(true)?.cortes;
                            if (_c && selected && _c[fieldName]?.idx == selected?.idx) {
                                setSelected(null);
                            }
                            form.setFieldsValue({ remove: true });
                            remove(fieldName);
                        }
                        const moveRow = (from, to) => {
                            //move(from, to);
                        }
                        return (
                            <>
                                <Row><Col><HorizontalRule title="Plano de Cortes" right={<Button size="small" type="link" disabled={(submitting.state)} onClick={() => addRow(fields)} style={{ width: "100%" }}><PlusOutlined />Nova combinação de cortes </Button>} /></Col></Row>
                                <Row wrap='nowrap'>
                                    <Col width={30} style={{ alignSelf: "center" }}></Col>

                                    <Col width={larguras.length * 132}></Col>
                                    <Col></Col>
                                    {inputParameters.current.showPlan && <>
                                        <Col width={125} style={{ textAlign: "center" /* fontWeight: 700 */ }}>Bobinagens</Col>
                                        <Col width={125} style={{ textAlign: "center" /* fontWeight: 700 */ }}>Bobines</Col>
                                    </>}
                                    <Col width={125}></Col>
                                    <Col width={20}></Col>
                                </Row>
                                {fields.map((field, index) => (
                                    <RowHover wrap='nowrap' selected={form.getFieldValue([`cortes`, field.name, "idx"]) === selected?.idx ? 1 : 0} key={field.key} gutterWidth={5} onClick={(e) => onSelectCorte(index)}>
                                        <Col width={30} style={{ alignSelf: "center" }}><b>{index + 1} </b></Col>

                                        {larguras.map(v => {
                                            return (<React.Fragment key={`${field.key}_${v}`}>
                                                <Col width={70}><Field forInput={false} name={[field.name, `largura`, `${v}`]} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "65px", padding: "0px" }} controls={false} addonAfter={<b>mm</b>} /></Field></Col>
                                                <Col width={52} style={{ flexDirection: "row", display: "flex", alignItems: "center", marginRight: "10px" }}><div>&nbsp;x&nbsp;</div><Field name={[field.name, `n_cortes`, `${v}`]} label={{ enabled: false }}><InputNumber onClick={(e) => e.stopPropagation()} size="small" style={{ width: "35px", textAlign: "right", padding: "0px" }} controls={false} min={0} max={25} /></Field></Col>
                                            </React.Fragment>);
                                        })}
                                        <Col></Col>
                                        {inputParameters.current.showPlan && <>
                                            <Col width={125} style={{ display: "flex", justifyContent: "center" }}><Field name={[field.name, 'n']} label={{ enabled: false }}><InputNumberField onClick={(e) => e.stopPropagation()} size="small" style={{ width: "80px", padding: "0px" }} controls={false} /></Field></Col>
                                            <Col width={125} style={{ display: "flex", justifyContent: "center" }}><Field forInput={false} name={[field.name, 'bobines_total']} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "80px", padding: "0px" }} controls={false} /></Field></Col>
                                        </>}
                                        <Col width={125} style={{ display: "flex", justifyContent: "center" }}><Field forInput={false} name={[field.name, 'largura_util']} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "80px", padding: "1px", backgroundColor: coloured('largura_util', form, index) }} controls={false} addonAfter={<b>mm</b>} /></Field></Col>
                                        <Col width={20}>{(!submitting.state) && <div className={classNames(classes.right)}><IconButton onClick={(e) => removeRow(e, field.name, field)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton></div>}</Col>
                                    </RowHover>
                                ))}
                                {form.getFieldValue("cortes")?.length > 0 &&
                                    <Row wrap='nowrap' gutterWidth={5}>
                                        <Col width={20}></Col>
                                        {larguras.map((v, i) => {
                                            return (<React.Fragment key={`col-${i}`}>
                                                <Col width={70}></Col>
                                                <Col width={52} style={{ marginRight: "10px" }}></Col>
                                            </React.Fragment>);
                                        })}
                                        <Col></Col>
                                        {inputParameters.current.showPlan && <>
                                        <Col width={125} style={{ display: "flex", justifyContent: "center", borderTop: "solid 2px #000", textAlign: "end", fontWeight: 600 }}>{subTotal("n_bobinagens")}</Col>
                                        <Col width={125} style={{ display: "flex", justifyContent: "center", borderTop: "solid 2px #000", textAlign: "end", fontWeight: 600 }}>{subTotal("bobines_total")}</Col>
                                        </>}
                                        <Col width={125}></Col>
                                        <Col width={20}></Col>
                                    </Row>
                                }
                            </>
                        )
                    }
                    }
                </Form.List>

                {selected && <>
                    <HorizontalRule title="Posicionamento dos Cortes" right={
                        <Space>
                            <Button type="link" size="small" disabled={(submitting.state)} onClick={showVersions} style={{ width: "100%" }}><HistoryOutlined />Versões</Button>
                        </Space>
                    } />
                    <FormCortesOrdem onChangeCortesOrdem={onChangeCortesOrdem} record={selected} larguras={larguras} />
                </>}

                {extraRef && <Portal elId={extraRef.current}>
                    {permission.isOk(PERMISSION) && <Space>
                        {(generated && inputParameters.current.showPlan) && <Button disabled={submitting.state} type="primary" onClick={onSave}>Confirmar</Button>}
                        {(form.getFieldValue("cortes") && form.getFieldValue("cortes").length>0 && inputParameters.current.showPlan===false) && <Button disabled={submitting.state} type="primary" onClick={onSaveCortes}>Confirmar</Button>}
                    </Space>}
                </Portal>
                }

            </FormContainer>
        </YScroll>
    )

}