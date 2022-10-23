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
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, ReadOutlined, LockOutlined } from '@ant-design/icons';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, RangeTimeField } from 'components/FormFields';
import { ColumnBobines, Ofs, Bobines, typeListField, typeField, validField } from "./commons";
import ToolbarTitle from 'components/ToolbarTitle';
import { TbCircles } from "react-icons/tb";
import BobinesPopup from './commons/BobinesPopup';
import { usePermission } from "utils/usePermission";

const focus = (el, h,) => { el?.focus(); };

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'><Field name="fbobinagem" label={{ enabled: true, text: "Nº Bobinagem", pos: "top", padding: "0px" }}>
            <Input size='small' allowClear />
        </Field></Col>
        <Col xs='content'><Field name="fdata" label={{ enabled: true, text: "Data Bobinagem", pos: "top", padding: "0px" }}>
            <RangeDateField size='small' allowClear />
        </Field></Col>
        <Col xs='content'><Field name="ftime" label={{ enabled: true, text: "Início/Fim", pos: "top", padding: "0px" }}>
            <RangeTimeField size='small' format={TIME_FORMAT} allowClear />
        </Field></Col>
    </>
    );
}


const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    { fbobinagem: { label: "Nº Bobinagem", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data Bobinagem", field: { type: "rangedate", size: 'small' } } },
    { ftime: { label: "Início/Fim", field: { type: "rangetime", size: 'small' } } },
    { fduracao: { label: "Duração", field: { type: 'input', size: 'small' }, span: 12 } },
    { farea: { label: "Área", field: { type: 'input', size: 'small' }, span: 12 }, fdiam: { label: "Diâmetro", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcore: { label: "Core", field: { type: 'input', size: 'small' }, span: 12 }, fcomp: { label: "Comprimento", field: { type: 'input', size: 'small' }, span: 12 } },
    //Defeitos
    {
        freldefeitos: { label: " ", field: TipoRelation, span: 4 },
        fdefeitos: { label: 'Defeitos', field: { type: 'selectmulti', size: 'small', options: BOBINE_DEFEITOS }, span: 20 }
    },
    //Estados
    { festados: { label: 'Estados', field: { type: 'selectmulti', size: 'small', options: BOBINE_ESTADOS } } },
    { fofabrico: { label: "Ordem de Fabrico", field: { type: 'input', size: 'small' } } },
    { fcliente: { label: "Cliente", field: { type: 'input', size: 'small' } } },
    { fdestino: { label: "Destino", field: { type: 'input', size: 'small' } } }
];


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

const TitleForm = ({ data, onChange, form }) => {
    const st = (parseInt(data?.type) === -1 || !data?.ofs) ? null : JSON.stringify(data?.ofs).replaceAll(/[\[\]\"]/gm, "").replaceAll(",", " | ");
    return (<ToolbarTitle title={<>
        <Col xs='content' style={{}}><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>Bobinagens</span></Col>
        <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col>
    </>} right={
        <Col xs="content">
            <FormContainer id="frm-title" form={form} wrapForm={true} wrapFormItem={true} schema={schema} label={{ enabled: false }} onValuesChange={onChange} fluid>
                <Col style={{ alignItems: "center" }}>
                    <Row gutterWidth={2} justify='end'>
                        <Col xs="content">
                            <Field name="typelist" label={{ enabled: false }}>
                                <SelectField size="small" keyField="value" textField="label" data={
                                    [{ value: "A", label: "Estado Bobines" },
                                    { value: "B", label: "Consumo Bobinagem" },
                                    { value: "C", label: "Ordens de Fabrico" }]} />
                            </Field>
                        </Col>
                        <Col xs="content">
                            <Field name="type" label={{ enabled: false }}>
                                <SelectField size="small" keyField="value" textField="label" data={
                                    [{ value: "1", label: "Bobinagens da Ordem de Fabrico" },
                                    { value: "-1", label: "Todas as Bobinagens" }]} />
                            </Field>
                        </Col>
                        <Col xs="content">
                            <Field name="valid" label={{ enabled: false }}>
                                <SelectField style={{ width: "100px" }} size="small" keyField="value" textField="label" data={
                                    [{ value: "0", label: "Por validar" },
                                    { value: "1", label: "Validadas" },
                                    { value: "-1", label: " " }
                                    ]} /></Field>
                        </Col>
                    </Row>
                </Col>
            </FormContainer>
        </Col>
    } />);
}

const IFrame = ({ src }) => {
    return <div dangerouslySetInnerHTML={{ __html: `<iframe frameBorder="0" onload="this.width=screen.width;this.height=screen.height;" src='${src}'/>` }} />;
}

const ActionContent = ({ dataAPI, hide, onClick, ...props }) => {
    const items = [
        /* { label: 'Eliminar Entrada', key: 'delete', icon: <DeleteOutlined /> } */
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}

const InputNumberEditor = ({ field, p, ...props }) => {
    return <InputNumber style={{ width: "100%", padding: "3px" }} keyboard={false} controls={false} bordered={true} size="small" value={p.row[field]} ref={focus} onChange={(e) => p.onRowChange({ ...p.row, valid: p.row[field] !== e ? 0 : null, [field]: e }, true)} {...props} />
}


export default (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();

    const permission = usePermission({ allowed: { producao: 200 } });
    const [allowEdit, setAllowEdit] = useState({ datagrid: false });
    const [modeEdit, setModeEdit] = useState({ datagrid: false });

    const [formFilter] = Form.useForm();
    const submitting = useSubmitting(true);
    const dataAPI = useDataAPI({ id: "bobinagensL1list", payload: { url: `${API_URL}/bobinagenslist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: {}, sort: [] } });
    const defaultParameters = { typelist: "A" };
    const defaultFilters = { type: "-1", valid: "-1" };
    const defaultSort = [{ column: 'nome', direction: 'DESC' }];
    const primaryKeys = ['id'];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal title={modalParameters.title} lazy={true} footer="ref" onCancel={hideModal} width={5000} height={5000}><IFrame src={modalParameters.src} /></ResponsiveModal>
    ), [modalParameters]);
    const [showBobinesModal, hideBobinesModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal title={modalParameters.title} lazy={true} footer="ref" onCancel={hideBobinesModal} width={320} height={500}><BobinesPopup record={{ ...modalParameters }} /></ResponsiveModal>
    ), [modalParameters]);

    const editable = (row) => {
        return (modeEdit.datagrid && allowEdit.datagrid && row?.valid===1);
    }
    const editableClass = (row)=>{
        return (modeEdit.datagrid && row?.valid===1) && classes.edit;
    }

    const columns = [
        { key: 'nome', name: 'Bobinagem', width: 115, frozen: true, formatter: p => <Button size="small" type="link" onClick={() => onBobinagemClick(p.row)}>{p.row.nome}</Button> },
        { key: 'baction', name: '', minWidth: 40, maxWidth: 40, frozen: true, formatter: p => <Button icon={<TbCircles />} size="small" onClick={() => onBobinesPopup(p.row)} /> },
        { key: 'inico', name: 'Início', width: 90 },
        { key: 'fim', name: 'Fim', width: 90 },
        { key: 'duracao', name: 'Duração', width: 90 },
        { key: 'core', name: 'Core', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.core}''</div> },
        { key: 'comp', name: 'Comprimento', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp} m</div> },
        { key: 'comp_par', name: 'Comp. Emenda', width: 100, editable:editable, cellClass:editableClass, editor: p => <InputNumberEditor p={p} field="comp_par" min={0} max={p.row.comp} addonAfter="m" />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_par} m</div> },
        //{ key: 'comp_cli', name: 'Comp. Cliente', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_cli} m</div> },
        { key: 'largura', name: 'Largura', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.largura} mm</div> },
        { key: 'largura_bruta', name: 'Largura Bruta', width: 100, editable:editable, cellClass:editableClass, editor: p => <InputNumberEditor p={p} field="largura_bruta" min={p.row.largura} addonAfter="mm" />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{p.row.largura_bruta} mm</div> },
        { key: 'area', name: 'Área', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.area} m&sup2;</div> },
        { key: 'diam', name: 'Diâmetro', width: 100, editable:editable, cellClass:editableClass, editor: p => <InputNumberEditor p={p} field="diam" min={0} addonAfter="mm" />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam} mm</div> },
        { key: 'nwinf', name: 'Nw Inf.', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.nwinf} m</div> },
        { key: 'nwsup', name: 'Nw Sup.', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.nwsup} m</div> },
        ...formFilter.getFieldValue('typelist') === "A" ? [{ key: 'bobines', minWidth: 750, width: 750, name: <ColumnBobines n={28} />, sortable: false, formatter: p => <Bobines onClick={onBobineClick} b={JSON.parse(p.row.bobines)} bm={p.row}/*  setShow={setShowValidar} */ /> }] : [],
        ...formFilter.getFieldValue('typelist') === "B" ? [
            { key: 'A1', name: 'A1 kg', width: 55, sortable: false },
            { key: 'A2', name: 'A2 kg', width: 55, sortable: false },
            { key: 'A3', name: 'A3 kg', width: 55, sortable: false },
            { key: 'A4', name: 'A4 kg', width: 55, sortable: false },
            { key: 'A5', name: 'A5 kg', width: 55, sortable: false },
            { key: 'A6', name: 'A6 kg', width: 55, sortable: false },
            { key: 'B1', name: 'B1 kg', width: 55, sortable: false },
            { key: 'B2', name: 'B2 kg', width: 55, sortable: false },
            { key: 'B3', name: 'B3 kg', width: 55, sortable: false },
            { key: 'B4', name: 'B4 kg', width: 55, sortable: false },
            { key: 'B5', name: 'B5 kg', width: 55, sortable: false },
            { key: 'B6', name: 'B6 kg', width: 55, sortable: false },
            { key: 'C1', name: 'C1 kg', width: 55, sortable: false },
            { key: 'C2', name: 'C2 kg', width: 55, sortable: false },
            { key: 'C3', name: 'C3 kg', width: 55, sortable: false },
            { key: 'C4', name: 'C4 kg', width: 55, sortable: false },
            { key: 'C5', name: 'C5 kg', width: 55, sortable: false },
            { key: 'C6', name: 'C6 kg', width: 55, sortable: false }
        ] : [],
        ...formFilter.getFieldValue('typelist') === "C" ? [
            { key: 'ofs', name: 'Ordens de Fabrico', width: 480, sortable: false, formatter: (p) => <Ofs /* rowIdx={i} */ r={p.row} /* setShow={setShowValidar} */ /> },
            { key: 'tiponwinf', name: 'Tipo NW Inferior', width: 300, sortable: true },
            { key: 'tiponwsup', name: 'Tipo NW Superior', width: 300, sortable: true },
            { key: 'lotenwinf', name: 'Lote NW Inferior', width: 150, sortable: true },
            { key: 'lotenwsup', name: 'Lote NW Superior', width: 150, sortable: true }

        ] : []
    ];


    const onBobinesPopup = (row) => {
        console.log(row)
        setModalParameters({ title: <div>Bobinagem <span style={{ fontWeight: 900 }}>{row.nome}</span></div>, bobines: JSON.parse(row.bobines) });
        showBobinesModal();
    }

    const onBobineClick = (v) => {
        setModalParameters({ src: `/producao/bobine/details/${v.id}/`, title: `Detalhes da Bobine` });
        showModal();
    }

    const onBobinagemClick = (row) => {
        //if (row?.valid === 1) {
        //    setModalParameters({ src:`/producao/bobinagem/${row.id}/`,title:`Bobinagem ${row.nome}`  });
        //    showModal();
        //} else {
        navigate("/app/bobines/validarlist", { state: { bobinagem_id: row.id, bobinagem_nome: row.nome, tstamp: Date.now() } });
        //}
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ init: true, signal: controller.signal });
        return (() => controller.abort());

    }, [location?.state?.typelist, location?.state?.type, location?.state?.valid]);
    const loadData = ({ init = false, signal }) => {
        if (init) {
            const { typelist, ...initFilters } = loadInit({ ...defaultFilters, ...defaultParameters }, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter())]);
            let { filterValues, fieldValues } = fixRangeDates(['fdata'], initFilters);
            formFilter.setFieldsValue({ typelist, ...fieldValues });
            dataAPI.addFilters(filterValues, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters({ typelist }, true, false);
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
                const { typelist, ...vals } = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
                const _values = {
                    ...vals,
                    fbobinagem: getFilterValue(vals?.fbobinagem, 'any'),
                    fdata: getFilterRangeValues(vals["fdata"]?.formatted),
                    ftime: getFilterRangeValues(vals["ftime"]?.formatted),
                    fduracao: getFilterValue(vals?.fduracao, '=='),
                    fofabrico: getFilterValue(vals?.fofabrico, 'any'),
                    fcliente: getFilterValue(vals?.fcliente, 'any'),
                    fdestino: getFilterValue(vals?.fdestino, 'any'),
                };
                dataAPI.addFilters(_values, true);
                dataAPI.addParameters({ typelist })
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
        if ("typelist" in changedValues) {
            navigate("/app/bobinagens/reellings", { state: { ...formFilter.getFieldsValue(true), typelist: changedValues.typelist, tstamp: Date.now() }, replace: true });
        } else if ("type" in changedValues) {
            navigate("/app/bobinagens/reellings", { state: { ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } else if ("valid" in changedValues) {
            navigate("/app/bobinagens/reellings", { state: { ...formFilter.getFieldsValue(true), valid: changedValues.valid, tstamp: Date.now() }, replace: true });
        }
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
        const rows = dataAPI.getData().rows.filter(v => v?.valid === 0).map(({ comp_par, diam }) => ({ comp_par, diam }));
        submitting.trigger();
        submitting.end();
    }

    return (
        <>
            <TitleForm data={dataAPI.getFilter(true)} onChange={onFilterChange} form={formFilter} />
            <Table
                loading={submitting.state}
                reportTitle="Bobinagens"
                actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                frozenActionColumn={true}
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                toolbar={true}
                search={true}
                moreFilters={true}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={true}
                rowHeight={formFilter.getFieldValue('typelist') === "C" ? 44 : 28}
                rowClass={(row) => (row?.valid === 0 ? classes.notValid : undefined)}
                //selectedRows={selectedRows}
                //onSelectedRowsChange={setSelectedRows}
                leftToolbar={<Space>
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                    {modeEdit.datagrid && <Button type="primary" disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                    {!modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
                </Space>}
                //content={<PickHolder/>}
                //paginationPos='top'
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