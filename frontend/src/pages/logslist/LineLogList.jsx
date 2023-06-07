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
import loadInit from "utils/loadInit";
import { useNavigate, useLocation } from "react-router-dom";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag } from "antd";
const { Title, Text } = Typography;
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined } from '@ant-design/icons';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, RangeTimeField, SelectMultiField  } from 'components/FormFields';
//import { ColumnBobines, Ofs, Bobines, typeListField, typeField, validField } from "./commons";
import ToolbarTitle from 'components/ToolbarTitle';
import { EventColumn, doserConsume } from './commons';

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'>
            <Field name="fdate" label={{ enabled: true, text: "Data", pos: "top", padding: "0px" }}>
                <RangeDateField size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="ftime" label={{ enabled: true, text: "Hora", pos: "top", padding: "0px" }}>
                <RangeTimeField size='small' allowClear />
            </Field>
        </Col>
    </>
    );
}

const HasBobinagemField = () => (
    <SelectField
        placeholder="Relação"
        size="small"
        dropdownMatchSelectWidth={250}
        allowClear
        options={[{ value: "ALL", label: " " }, { value: 1, label: "Sim" }, { value: 0, label: "Não" }]}
    />
);

const EventField = () => (
    <SelectMultiField
        placeholder="Evento"
        size="small"
        dropdownMatchSelectWidth={250}
        allowClear
        options={[{ value: 1, label: "Troca Bobinagem" },
        { value: 8, label: "Working" },
        { value: 9, label: "Stop" },
        { value: 7, label: "Start" },
        { value: 6, label: "NW Superiror" },
        { value: 5, label: "NW Inferior" },
        ]}
    />
);


const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    // { fbobinagem: { label: "Nº Bobinagem", field: { type: 'input', size: 'small' } } },
    { fdate: { label: "Data", field: { type: "rangedate", size: 'small' } } },
    { ftime: { label: "Hora", field: { type: "rangetime", size: 'small' } } },
    { fduracao: { label: "Duração", field: { type: 'input', size: 'small' }, span: 12 } },
    { fhasbobinagem: { label: "Bobinagem Associada", field: HasBobinagemField } },
    { fevento: { label: "Evento", field: EventField } }
    // { fduracao: { label: "Duração", field: { type: 'input', size: 'small' }, span: 12 } },
    // { farea: { label: "Área", field: { type: 'input', size: 'small' }, span: 12 }, fdiam: { label: "Diâmetro", field: { type: 'input', size: 'small' }, span: 12 } },
    // { fcore: { label: "Core", field: { type: 'input', size: 'small' }, span: 12 }, fcomp: { label: "Comprimento", field: { type: 'input', size: 'small' }, span: 12 } },
    // //Defeitos
    // {
    //     freldefeitos: { label: " ", field: TipoRelation, span: 4 },
    //     fdefeitos: { label: 'Defeitos', field: { type: 'selectmulti', size: 'small', options: BOBINE_DEFEITOS }, span: 20 }
    // },
    // //Estados
    // { festados: { label: 'Estados', field: { type: 'selectmulti', size: 'small', options: BOBINE_ESTADOS } } },
    // { fofabrico: { label: "Ordem de Fabrico", field: { type: 'input', size: 'small' } } },
    // { fcliente: { label: "Cliente", field: { type: 'input', size: 'small' } } },
    // { fdestino: { label: "Destino", field: { type: 'input', size: 'small' } } }
];


const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    }
});
const TitleForm = ({ data, onChange, form }) => {
    const st = (parseInt(data?.type) === -1 || !data?.ofs) ? null : JSON.stringify(data?.ofs).replaceAll(/[\[\]\"]/gm, "").replaceAll(",", " | ");
    return (<ToolbarTitle title={<>
        <Col xs='content' style={{}}><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>Eventos da Linha</span></Col>
        {/*         <Col xs='content' style={{ paddingTop: "3px" }}>{st &&<Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
    </>} right={
        <Col xs="content">
            <FormContainer id="frm-title" form={form} wrapForm={true} wrapFormItem={true} schema={schema} label={{ enabled: false }} onValuesChange={onChange} fluid>
                <Col style={{ alignItems: "center" }}>
                    <Row gutterWidth={2} justify='end'>
                        {/* <Col xs="content">
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
                                <SelectField size="small" keyField="value" textField="label" data={
                                    [{ value: "0", label: "Por validar" },
                                    { value: "1", label: "Validadas" },
                                    { value: "-1", label: " " }
                                    ]} /></Field>
                        </Col> */}
                    </Row>
                </Col>
            </FormContainer>
        </Col>
    } />);
}



export default ({setFormTitle, ...props}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "lineloglist", payload: { url: `${API_URL}/lineloglist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: {}, sort: [{ column: 'id', direction: 'DESC' }] } });
    const primaryKeys = ['id'];
    const columns = [
        { key: 'type_desc', name: '', width: 40, frozen: true, formatter: p => <EventColumn v={p.row.type_desc} /> },
        { key: 'inicio_ts', name: 'Início', width: 130, frozen: true, formatter: props => moment(props.row.inicio_ts).format(DATETIME_FORMAT) },
        { key: 'fim_ts', name: 'Fim', width: 130, frozen: true, formatter: props => moment(props.row.fim_ts).format(DATETIME_FORMAT) },
        { key: 'nome', name: 'Bobinagem', frozen: true, width: 100 },
        { key: 'diametro', name: 'Diâmetro', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diametro} mm</div> },
        { key: 'metros', name: 'Comprimento', width: 110, formatter: p => <div style={{ textAlign: "right" }}>{p.row.metros} m</div> },
        { key: 'nw_inf', name: 'NW Inferior', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.nw_inf} m</div> },
        { key: 'nw_sup', name: 'NW Superior', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.nw_sup} m</div> },
        { key: 'peso', name: 'Peso', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.peso).toFixed(2)} kg</div> },
        { key: 'cast_speed', name: 'Vel. Cast', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.cast_speed} m/s</div> },
        { key: 'A1', name: 'A1', width: 90, formatter: p => doserConsume(p.row.A1, p.row.A1_LAG, p.row.A1_RESET, p.row.type) },
        { key: 'A2', name: 'A2', width: 90, formatter: p => doserConsume(p.row.A2, p.row.A2_LAG, p.row.A2_RESET, p.row.type) },
        { key: 'A3', name: 'A3', width: 90, formatter: p => doserConsume(p.row.A3, p.row.A3_LAG, p.row.A3_RESET, p.row.type) },
        { key: 'A4', name: 'A4', width: 90, formatter: p => doserConsume(p.row.A4, p.row.A4_LAG, p.row.A4_RESET, p.row.type) },
        { key: 'A5', name: 'A5', width: 90, formatter: p => doserConsume(p.row.A5, p.row.A5_LAG, p.row.A5_RESET, p.row.type) },
        { key: 'A6', name: 'A6', width: 90, formatter: p => doserConsume(p.row.A6, p.row.A6_LAG, p.row.A6_RESET, p.row.type) },
        { key: 'B1', name: 'B1', width: 90, formatter: p => doserConsume(p.row.B1, p.row.B1_LAG, p.row.B1_RESET, p.row.type) },
        { key: 'B2', name: 'B2', width: 90, formatter: p => doserConsume(p.row.B2, p.row.B2_LAG, p.row.B2_RESET, p.row.type) },
        { key: 'B3', name: 'B3', width: 90, formatter: p => doserConsume(p.row.B3, p.row.B3_LAG, p.row.B3_RESET, p.row.type) },
        { key: 'B4', name: 'B4', width: 90, formatter: p => doserConsume(p.row.B4, p.row.B4_LAG, p.row.B4_RESET, p.row.type) },
        { key: 'B5', name: 'B5', width: 90, formatter: p => doserConsume(p.row.B5, p.row.B5_LAG, p.row.B5_RESET, p.row.type) },
        { key: 'B6', name: 'B6', width: 90, formatter: p => doserConsume(p.row.B6, p.row.B6_LAG, p.row.B6_RESET, p.row.type) },
        { key: 'C1', name: 'C1', width: 90, formatter: p => doserConsume(p.row.C1, p.row.C1_LAG, p.row.C1_RESET, p.row.type) },
        { key: 'C2', name: 'C2', width: 90, formatter: p => doserConsume(p.row.C2, p.row.C2_LAG, p.row.C2_RESET, p.row.type) },
        { key: 'C3', name: 'C3', width: 90, formatter: p => doserConsume(p.row.C3, p.row.C3_LAG, p.row.C3_RESET, p.row.type) },
        { key: 'C4', name: 'C4', width: 90, formatter: p => doserConsume(p.row.C4, p.row.C4_LAG, p.row.C4_RESET, p.row.type) },
        { key: 'C5', name: 'C5', width: 90, formatter: p => doserConsume(p.row.C5, p.row.C5_LAG, p.row.C5_RESET, p.row.type) },
        { key: 'C6', name: 'C6', width: 90, formatter: p => doserConsume(p.row.C6, p.row.C6_LAG, p.row.C6_RESET, p.row.type) },
        { key: 'id', name: 'ID', width: 90 }
    ];

    const loadData = ({ signal }) => {
        const { ...filters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter())]);
        formFilter.setFieldsValue({ ...filters });
        dataAPI.addFilters(filters, true, true);
        //dataAPI.addParameters({}, true, true);
        dataAPI.fetchPost({ signal });
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());

    }, [/* location?.state?.typelist, location?.state?.type, location?.state?.valid */]);

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const vals = Object.fromEntries(Object.entries({ ...dataAPI.getAllFilter(), ...values }).filter(([_, v]) => v !== null && v!==''));
                const _values = {
                    ...vals,
                    //fbobinagem: getFilterValue(vals?.fbobinagem, 'any'),
                    fdate: getFilterRangeValues(vals["fdate"]?.formatted),
                    ftime: getFilterRangeValues(vals["ftime"]?.formatted),
                    //fduracao: getFilterValue(vals?.fduracao, '=='),
                    //fofabrico: getFilterValue(vals?.fofabrico, 'any'),
                    //fcliente: getFilterValue(vals?.fcliente, 'any'),
                    //fdestino: getFilterValue(vals?.fdestino, 'any'),
                };
                dataAPI.addFilters(_values);
                //dataAPI.addParameters({ typelist })
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
        /*  if ("typelist" in changedValues) {
             navigate("/app/bobinagens/reellings", { state: { ...formFilter.getFieldsValue(true), typelist: changedValues.typelist, tstamp: Date.now() }, replace: true });
         } else if ("type" in changedValues) {
             navigate("/app/bobinagens/reellings", { state: { ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
         } else if ("valid" in changedValues) {
             navigate("/app/bobinagens/reellings", { state: { ...formFilter.getFieldsValue(true), valid: changedValues.valid, tstamp: Date.now() }, replace: true });
         } */
    };

    return (
        <>
            {/*  <ToolbarTitle data={dataAPI.getAllFilter()} onChange={onFilterChange} form={formFilter} /> */}
            {!setFormTitle && <TitleForm data={dataAPI.getFilter(true)} onChange={onFilterChange} form={formFilter} />}
            <Table
                //title=""
                reportTitle="Eventos da Linha"
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                //actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                toolbar={true}
                search={true}
                moreFilters={true}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={true}
                //rowHeight={formFilter.getFieldValue('typelist') === "C" ? 44 : 28}
                //rowClass={(row) => (row?.status === 0 ? classes.notValid : undefined)}
                //selectedRows={selectedRows}
                //onSelectedRowsChange={setSelectedRows}
                leftToolbar={<>
                    {/* <Button type='primary' icon={<AppstoreAddOutlined />} onClick={(showNewLoteModal)}>Novo Lote</Button> */}
                </>}
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