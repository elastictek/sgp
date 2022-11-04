import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import moment from 'moment';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { useSubmitting, getFilterRangeValues, getFilterValue, isValue } from "utils";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { useNavigate, useLocation } from "react-router-dom";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag } from "antd";
const { Title, Text } = Typography;
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, RangeTimeField } from 'components/FormFields';
/* import { ColumnBobines, Ofs, Bobines, typeListField, typeField, validField } from "./commons"; */
import ToolbarTitle from 'components/ToolbarTitle';
import { Quantity } from '../artigos/commons';
import { Status } from '../bobines/commons';
import { usePermission } from "utils/usePermission";

const focus = (el, h,) => { el?.focus(); };
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        {/* <Col xs='content'><Field name="fartigo" label={{ enabled: true, text: "Artigo", pos: "top", padding: "0px" }}>
            <Input size='small' allowClear />
        </Field></Col>
        <Col xs='content'><Field name="flote" label={{ enabled: true, text: "Lote", pos: "top", padding: "0px" }}>
            <Input size='small' allowClear />
        </Field></Col>
        <Col xs='content'><Field name="fdate" label={{ enabled: true, text: "Data", pos: "top", padding: "0px" }}>
            <RangeDateField size='small' allowClear />
        </Field></Col> */}
    </>
    );
}

const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    /* { fartigo: { label: "Artigo", field: { type: 'input', size: 'small' } } },
    { flote: { label: "Lote", field: { type: 'input', size: 'small' } } },
    { fvcr: { label: "Cód. Movimento", field: { type: 'input', size: 'small' } } },
    { fdate: { label: "Data Movimento", field: { type: "rangedate", size: 'small' } } } */
];

const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    }
});

const title = "Devoluções Produto Acabado";
const TitleForm = ({ data, onChange, form }) => {
    /*     const st = (parseInt(data?.type) === -1 || !data?.ofs) ? null : JSON.stringify(data?.ofs).replaceAll(/[\[\]\"]/gm, "").replaceAll(",", " | "); */
    return (<ToolbarTitle title={<>
        <Col style={{}}><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title}</span></Col>
        {/*         <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
    </>} />);
}

const ActionContent = ({ dataAPI, hide, onClick, ...props }) => {
    const items = [
        /* { label: 'Eliminar Entrada', key: 'delete', icon: <DeleteOutlined /> } */
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}

const FieldEstadoEditor = ({ p }) => {
    const onChange = (v) => {
        p.onRowChange({ ...p.row, ...(p.row?.valid !== 0 && p.row?.estado !== v) && {estado: v, valid: 0} }, true);
    };
    return (
        <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.estado} ref={focus} onChange={onChange} size="small" keyField="value" textField="label" data={[{ value: 'D' }, { value: '--' }]} />
    );
}
const InputNumberEditor = ({ field, p, onChange, ...props }) => {
    return <InputNumber style={{ width: "100%", padding: "3px" }} keyboard={false} controls={false} bordered={true} size="small" value={p.row[field]} ref={focus} onChange={onChange ? v => onChange(p, v) : (e) => p.onRowChange({ ...p.row, valid: p.row[field] !== e ? 0 : null, [field]: e }, true)} {...props} />
}

export default (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const submitting = useSubmitting(true);
    const dataAPI = useDataAPI({ id: "dev-list", payload: { url: `${API_URL}/devolucoeslist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 25 }, filter: {}, sort: [] } });
    const primaryKeys = ['SRHNUM_0', 'nome'];
    const defaultFilters = {};
    const defaultSort = [{ column: 'CREDATTIM_0', direction: 'DESC' }];

    const permission = usePermission({ allowed: { planeamento: 300, logistica: 200 } });
    const [allowEdit, setAllowEdit] = useState({ datagrid: false });
    const [modeEdit, setModeEdit] = useState({ datagrid: false });

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.type) {
                default: break;
            }
        }
        return (<ResponsiveModal title={modalParameters.title} onCancel={hideModal} width={600} height={modalParameters.height ? modalParameters.height : 250} footer="ref" yScroll>
            {content()}
        </ResponsiveModal>);
    }, [modalParameters]);


    const editable = (row) => {
        return (modeEdit.datagrid && allowEdit.datagrid);
    }
    const editableClass = (row) => {
        return (modeEdit.datagrid) && classes.edit;
    }

    const onAreaChange = (p, v) => {
        const area_original = ("area_original" in p.row) ? p.row.area_original : p.row.area;
        if (p.row?.area !== v && area_original >= p.row.area) {
            p.onRowChange({ ...p.row, ...((p.row?.valid !== 0 && p.row?.area !== v) && { valid: 0, area_original }) }, true);
        }
    }

    const columns = [
        { key: 'LOT_0', name: 'Lote', width: 120, frozen: true },
        { key: 'nome', name: 'Bobine', width: 120, frozen: true },
        { key: 'estado', name: 'Estado', width: 110, editable: (r) => editable(r, 'estado'), cellClass: r => editableClass(r, 'estado'), editor: p => <FieldEstadoEditor p={p} />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status b={p.row.valid === 0 ? p.row : { ...p.row, estado: 'D' }} /></div> },
        { key: 'area', name: 'Área', width: 110, editable: (r) => editable(r, 'area'), cellClass: r => editableClass(r, 'area'), editor: p => <InputNumberEditor onChange={onAreaChange} p={p} field="area" min={0} addonAfter="m2" />, editorOptions: { editOnClick: true }, formatter: p => <Quantity v={p.row.area} u="m2" /> },
        { key: 'SRHNUM_0', name: 'Devolução', width: 180 },
        { key: 'ITMREF_0', name: 'Artigo Cód.', width: 180 },
        { key: 'ITMDES1_0', name: 'Artigo' },
        { key: 'SDHNUM_0', name: 'Expedição', width: 180 },
        { key: 'QTY_0', name: 'Qtd. Devolvida', width: 110, formatter: p => <Quantity v={p.row.QTY_0} u="m2" /> },
        { key: 'largura', name: 'largura', width: 110, formatter: p => <Quantity v={p.row.largura} u="mm" /> },
        { key: 'comp_actual', name: 'Comp. Atual', width: 110, formatter: p => <Quantity v={p.row.comp_actual} u="m" /> },
        { key: 'comp', name: 'Comprimento', width: 110, formatter: p => <Quantity v={p.row.comp} u="m" /> },
        { key: 'CREDATTIM_0', name: 'Data', width: 130, formatter: props => moment(props.row.CREDATTIM_0).format(DATETIME_FORMAT) }
    ];



    useEffect(() => {
        const controller = new AbortController();
        loadData({ init: true, signal: controller.signal });
        return (() => controller.abort());

    }, [/* location?.state?.type, location?.state?.loc */]);

    const loadData = ({ init = false, signal }) => {
        if (init) {
            let { ...initFilters } = loadInit(defaultFilters, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter())]);
            let { filterValues, fieldValues } = fixRangeDates([], initFilters);
            formFilter.setFieldsValue({ ...fieldValues });
            dataAPI.addFilters(filterValues, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters({}, true, false);
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
                const { ...vals } = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
                const _values = {
                    ...vals,
                    // fartigo: getFilterValue(vals?.fartigo, 'any'),
                    // flote: getFilterValue(vals?.flote, 'any'),
                    // fdate: getFilterRangeValues(vals["fdate"]?.formatted)
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
            dataAPI.addFilters({ type: changedValues.type }, false, true);
            dataAPI.fetchPost();
        } else if ("loc" in changedValues) {
            dataAPI.addFilters({ loc: changedValues.loc }, false, true);
            dataAPI.fetchPost();
        } */
    };


    const onAction = (item, row) => {
        console.log(item, row);
    }

    const changeMode = () => {
        if (allowEdit.datagrid) {
            setModeEdit({ datagrid: (modeEdit.datagrid) ? false : allowEdit.datagrid });
        }
    }

    const onSave = async (action) => {
        console.log(dataAPI.getData().rows.filter(v => v?.estado==='D'))
        //const rows = dataAPI.getData().rows.filter(v => v?.estado==='D').map(({ n_lote, vcr_num, t_stamp, qty_lote, qty_reminder, vcr_num_original, type_mov }) =>
        //    ({ n_lote, vcr_num, t_stamp: moment.isMoment(t_stamp) ? t_stamp.format(DATETIME_FORMAT) : moment(t_stamp).format(DATETIME_FORMAT), qty_lote, qty_reminder, vcr_num_original, type_mov })
        //);
        submitting.trigger();
        try {
            /* let response = await fetchPost({ url: `${API_URL}/updategranulado/`, parameters: { type: "datagrid", rows } });
            if (response.data.status == "multi") {
                Modal.info({
                    title: "Estado das atualizações",
                    content: <YScroll style={{ maxHeight: "270px" }}>
                        {response.data.success.length > 0 && <ul style={{ padding: "0px 0px 5px 20px", background: "#f6ffed", border: "solid 1px #b7eb8f" }}>
                            {response.data.success.map(v => <li>{v}</li>)}
                        </ul>
                        }
                        {response.data.errors.length > 0 && <ul style={{ padding: "0px 0px 5px 20px", background: "#fff2f0", border: "solid 1px #ffccc7" }}>
                            {response.data.errors.map(v => <li>{v}</li>)}
                        </ul>
                        }
                    </YScroll>
                })
                if (response.data.success.length > 0) {
                    dataAPI.fetchPost();
                }
            } else {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
            } */
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        } finally {
            submitting.end();
        };
    }

    return (
        <>
            <TitleForm data={dataAPI.getFilter(true)} onChange={onFilterChange} form={formFilter} />
            <Table
                style={{ margin: "0px 20px" }}
                loading={submitting.state}
                reportTitle="Devoluções Produto Acabado"
                actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                frozenActionColumn={true}
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                toolbar={true}
                search={true}
                rowHeight={28}
                moreFilters={true}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={true}
                rowClass={(row) => (row?.valid === 0 ? classes.notValid : undefined)}
                leftToolbar={<Space>
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                    {(modeEdit.datagrid) && <Button type="primary" disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={onSave}>Confirmar Devoluções</Button>}
                    {!modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
                </Space>}
                toolbarFilters={{
                    form: formFilter, schema, wrapFormItem: true,
                    onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 350, mask: true }
                }}
            />
        </>
    );
}