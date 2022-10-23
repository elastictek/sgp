import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
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
import { getFilterRangeValues, getFilterValue } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission } from "utils/usePermission";
import { Status } from './commons';
import { GoArrowUp } from 'react-icons/go';
import { ImArrowUp, ImArrowDown, ImArrowRight, ImArrowLeft } from 'react-icons/im';
import { Cuba } from "../currentline/dashboard/commons/Cuba";
import { MovGranuladoColumn } from "../picking/commons"

const focus = (el, h,) => { el?.focus(); };
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const title = "Ganulado Movimentos";
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
            <Field name="ftype_mov" label={{ enabled: true, text: "Mov.", pos: "top", padding: "0px" }}>
                <Select size='small' options={[{ value: 0, label: "Saída" }, { value: 1, label: "Entrada" }]} allowClear style={{ width: "100px" }} />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="fdata" label={{ enabled: true, text: "Data", pos: "top", padding: "0px" }}>
                <RangeDateField size='small' allowClear />
            </Field>
        </Col>
    </>
    );
}

const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
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
    { fdata: { label: "Data", field: { type: "rangedate", size: 'small' } } },
    { fqty: { label: "Quantidade Lote", field: { type: 'input', size: 'small' }, span: 12 } },
    { fqty_reminder: { label: "Quantidade Restante", field: { type: 'input', size: 'small' }, span: 12 } },
    { ftype_mov: { label: 'Movimento', field: { type: 'select', size: 'small', options: [{ value: 0, label: "Saída" }, { value: 1, label: "Entrada" }] }, span: 6 } },
];

const OfsColumn = ({ value }) => {
    return (<div>
        {value && value.map(v => <Tag style={{ fontWeight: 600, fontSize: "10px" }} key={`${v}`}>{v}</Tag>)}
    </div>);
}

const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [
        (modeEdit && props.row?.closed === 0 && props.row?.valid !== 0) && { label: <span style={{ fontWeight: 700 }}>Eliminar Registo</span>, key: 'delete', icon: <DeleteFilled style={{ color: "red" }} /> }
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}


const loadMateriasPrimasLookup = async (p, value) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/stocklistbuffer/`, filter: { floc: 'BUFFER', fitm: p.row.artigo_cod, flote: `%${value.replaceAll(' ', '%%')}%` }, parameters: { lookup: true } });
    return rows;
}



const InputNumberEditor = ({ field, p, ...props }) => {
    return <InputNumber style={{ width: "100%", padding: "3px" }} keyboard={false} controls={false} bordered={true} size="small" value={p.row[field]} ref={focus} onChange={(e) => p.onRowChange({ ...p.row, valid: p.row[field] !== e ? 0 : null, [field]: e }, true)} {...props} />
}
const DateTimeEditor = ({ field, p, ...props }) => {
    return <DatePicker showTime size="small" format={DATETIME_FORMAT} value={moment(p.row[field])} ref={focus} onChange={(e) => p.onRowChange({ ...p.row, valid: p.row[field] !== e ? 0 : null, [field]: e }, true)} {...props}><Input /></DatePicker>
}
const SelectDebounceEditor = ({ field, keyField, textField, p, ...props }) => {
    return (<SelectDebounceField
        value={{ value: p.row[field], label: p.row[field] }}
        size="small"
        style={{ width: "100%", padding: "3px" }}
        keyField={keyField ? keyField : field}
        textField={textField ? textField : field}
        showSearch
        showArrow
        ref={focus}
        {...props}
    />)
}

const optionsRender = d => ({
    label: <div>
        <div><span><b>{d["LOT_0"]}</b></span> <span style={{ color: "#096dd9" }}>{moment(d["CREDATTIM_0"]).format(DATETIME_FORMAT)}</span> <span>[Qtd: <b>{d["QTYPCU_0"]} kg</b>]</span></div>
        <div><span>{d["ITMREF_0"]}</span> <span>{d["ITMDES1_0"]}</span></div>
    </div>, value: d["VCRNUM_0"], key: d["VCRNUM_0"], row: d
});

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
    const defaultSort = [{ column: "`order`", direction: "DESC" }];
    const dataAPI = useDataAPI({ id: "lst-granuladolist", payload: { url: `${API_URL}/granuladolist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: [] } });
    const submitting = useSubmitting(true);
    const primaryKeys = ['vcr_num', 'type_mov', 'lote_id'];
    const editable = (row, col) => {
        if (modeEdit.datagrid && allowEdit.datagrid && row?.closed === 0) {
            return (col === "qty_reminder" && row?.type_mov === 1) ? false : true;
        }
        return false;
    }
    const editableClass = (row, col) => {
        if (modeEdit.datagrid && allowEdit.datagrid && row?.closed === 0) {
            return (col === "qty_reminder" && row?.type_mov === 1) ? undefined : classes.edit;
        }
    }

    const onLoteChange = (p, v) => {
        p.onRowChange({ ...p.row, valid: p.row["vcr_num"] !== v.row["VCRNUM_0"] ? 0 : null, vcr_num: v.row["VCRNUM_0"], n_lote: v.row["LOT_0"], qty_lote: v.row["QTYPCU_0"] }, true)
    }

    const columns = [
        //{ key: 'print', frozen: true, name: '', cellClass: classes.noOutline, minWidth: 50, width: 50, sortable: false, resizable: false, formatter: p => <ColumnPrint record={p.row} dataAPI={dataAPI} onClick={() => onPrint(p.row)} /> },
        { key: 'type_mov', width: 90, name: 'Movimento', frozen: true, formatter: p => <MovGranuladoColumn value={p.row.type_mov} /> },
        { key: "group_id", sortable: false, name: "Cuba", frozen: true, minWidth: 55, width: 55, formatter: p => <Cuba value={p.row.group_id} /> },
        { key: 'dosers', width: 90, name: 'Doseadores', frozen: true, formatter: p => p.row.dosers },
        { key: 'artigo_cod', name: 'Artigo', frozen: true, width: 200, formatter: p => p.row.artigo_cod },
        { key: 'artigo_des', name: 'Designação', formatter: p => <b>{p.row.artigo_des}</b> },
        { key: 'n_lote', width: 310, name: 'Lote', editable: (r) => editable(r, 'n_lote'), cellClass: r => editableClass(r, 'n_lote'), editor: p => <SelectDebounceEditor onSelect={(o, v) => onLoteChange(p, v)} fetchOptions={(v) => loadMateriasPrimasLookup(p, v)} optionsRender={optionsRender} p={p} field="n_lote" />, editorOptions: { editOnClick: true }, formatter: p => <b>{p.row.n_lote}</b> },
        { key: 'qty_lote', name: 'Qtd', minWidth: 95, width: 95, editable: (r) => editable(r, 'qty_lote'), cellClass: r => editableClass(r, 'qty_lote'), editor: p => <InputNumberEditor p={p} field="qty_lote" min={0} addonAfter="kg" />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.qty_lote).toFixed(2)} kg</div> },
        { key: 'qty_reminder', width: 110, name: 'Qtd. Restante', editable: (r) => editable(r, 'qty_reminder'), cellClass: r => editableClass(r, 'qty_reminder'), editor: p => <InputNumberEditor p={p} field="qty_reminder" min={0} max={p.row.qty_lote} addonAfter="kg" />, editorOptions: { editOnClick: true }, formatter: p => <div>{parseFloat(p.row.qty_reminder).toFixed(2)} kg</div> },
        { key: 't_stamp', width: 140, name: 'Data', editable: editable, cellClass: r => editableClass(r, 't_stamp'), editor: p => <DateTimeEditor p={p} field="t_stamp" />, editorOptions: { editOnClick: true }, formatter: p => moment(p.row.t_stamp).format(DATETIME_FORMAT) },
        { key: 'vcr_num', name: 'Movimento', width: 200, formatter: p => p.row.vcr_num },
        { key: 'ofs', name: 'Ordem Fabrico', formatter: p => <OfsColumn value={p.row.ofs && JSON.parse(p.row.ofs)} /> }
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
            case "delete": Modal.confirm({
                title: <div>Eliminar Movimento <b>{row.vcr_num}</b></div>, content: <ul>
                    {row.type_mov === 1 && <li>Serão eliminados os movimentos de entrada e saída!</li>}
                    <li style={{ fontWeight: 700 }}>Atenção!! Se tiver alterações por guardar, ao efetuar esta operação perderá todas as alterações.</li>
                </ul>, onOk: async () => {
                    submitting.trigger();
                    try {
                        let response = await fetchPost({ url: `${API_URL}/deletegranulado/`, filter: { vcr_num: row.vcr_num }, parameters: {} });
                        if (response.data.status !== "error") {
                            dataAPI.fetchPost();
                        } else {
                            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
                        }
                    } catch (e) {
                        Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
                    } finally {
                        submitting.end();
                    };
                }
            }); 
            break;
        }
    }
    const changeMode = () => {
        if (allowEdit.datagrid) {
            setModeEdit({ datagrid: (modeEdit.datagrid) ? false : allowEdit.datagrid });
        }
    }
    const onSave = async (action) => {
        const rows = dataAPI.getData().rows.filter(v => v?.valid === 0).map(({ comp_par, diam }) => ({ comp_par, diam }));
        submitting.trigger();
        submitting.end();
    }
    const onAdd = () => {
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
                leftToolbar={<Space>
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<PlusCircleOutlined />} onClick={onAdd}>Nova Entrada</Button>}
                    {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                    {!modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
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