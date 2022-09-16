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
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, RangeTimeField } from 'components/FormFields';
/* import { ColumnBobines, Ofs, Bobines, typeListField, typeField, validField } from "./commons"; */
import ToolbarTitle from 'components/ToolbarTitle';
import { Quantity,ColumnPrint } from './commons';

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
    }
});

const TitleForm = ({ data, onChange, form }) => {
    const st = (parseInt(data?.type) === -1 || !data?.ofs) ? null : JSON.stringify(data?.ofs).replaceAll(/[\[\]\"]/gm, "").replaceAll(",", " | ");
    return (<ToolbarTitle title={<>
        <Col xs='content' style={{}}><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>Matérias Primas em Buffer</span></Col>
        <Col xs='content' style={{ paddingTop: "3px" }}>{st &&<Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col>
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
                                <SelectField size="small" keyField="value" textField="label" data={
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



export default (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "mpbufflerlist", payload: { url: `${API_URL}/stocklistbuffer/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: {}, sort: [{ column: 'CREDATTIM_0', direction: 'DESC' }] } });
    const primaryKeys = ['ROWID'];
    const columns = [
        { key: 'print', frozen:true, name: '', cellClass: classes.noOutline, minWidth: 50, width: 50, sortable: false, resizable: false, formatter: p => <ColumnPrint record={p.row} dataAPI={dataAPI} /> },
        { key: 'LOT_0', name: 'Lote', width: 180, frozen: true },
        { key: 'ITMREF_0', name: 'Artigo Cód.', width: 180, frozen: true },
        { key: 'ITMDES1_0', name: 'Artigo' },
        { key: 'QTYPCU_0', name: 'Qtd.', width: 110, formatter: p => <Quantity v={p.row.QTYPCU_0} u={p.row.PCU_0} /> },
        { key: 'LOC_0', name: 'Localização', width: 110 },
        { key: 'CREDATTIM_0', name: 'Data', width: 130, formatter: props => moment(props.row.CREDATTIM_0).format(DATETIME_FORMAT) }
    ];

    const loadData = ({ signal }) => {
        /* const { typelist, ...initFilters } = loadInit({ typelist: "A", type: "-1", valid: "-1" }, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, location?.state, [...Object.keys(location?.state), ...Object.keys(dataAPI.getAllFilter())]);
        formFilter.setFieldsValue({ typelist, ...initFilters });
        dataAPI.addFilters(initFilters, true, true);
        dataAPI.addParameters({ typelist }, true, true); */
        dataAPI.fetchPost({ signal });
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());

    }, [location?.state?.type, location?.state?.loc]);

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                // //remove empty values
                // const { typelist, ...vals } = Object.fromEntries(Object.entries({ ...dataAPI.getAllFilter(), ...values }).filter(([_, v]) => v !== null && v!==''));
                // const _values = {
                //     ...vals,
                //     fbobinagem: getFilterValue(vals?.fbobinagem, 'any'),
                //     fdata: getFilterRangeValues(vals["fdata"]?.formatted),
                //     ftime: getFilterRangeValues(vals["ftime"]?.formatted),
                //     fduracao: getFilterValue(vals?.fduracao, '=='),
                //     fofabrico: getFilterValue(vals?.fofabrico, 'any'),
                //     fcliente: getFilterValue(vals?.fcliente, 'any'),
                //     fdestino: getFilterValue(vals?.fdestino, 'any'),
                // };
                // dataAPI.addFilters(_values);
                // dataAPI.addParameters({ typelist })
                // dataAPI.first();
                // dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
        /* if ("typelist" in changedValues) {
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
            <TitleForm data={dataAPI.getFilter(true)} onChange={onFilterChange} form={formFilter} />
            <Table
                //title=""
                reportTitle="Matérias Primas em buffer"
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