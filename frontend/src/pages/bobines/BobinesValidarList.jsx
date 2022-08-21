import React, { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import moment from 'moment';
import { useImmer } from 'use-immer';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { useSubmitting, getFilterRangeValues, getFilterValue, isValue } from "utils";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import loadInit from "utils/loadInit";
import { useNavigate, useLocation } from "react-router-dom";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Checkbox, Tag } from "antd";
const { Title, Text } = Typography;
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined } from '@ant-design/icons';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, RangeTimeField, SelectMultiField } from 'components/FormFields';
import { Status } from "./commons";

const title = "Bobines em validação"

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
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


const moreFiltersRules = (keys) => { return getSchema({}, keys).unknown(true); }
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

const ToolbarTitle = ({ data, bobinagem, form }) => {
    return (
        <>
            {bobinagem && <FormContainer id="frm-title" form={form} wrapForm={true} wrapFormItem={true} schema={schema} label={{ enabled: false }} fluid>
                <Row>
                    <Col>
                        <Row><Col><Title style={{ margin: "0px" }} level={4}>{title}</Title></Col></Row>
                        <Row><Col><Text code style={{ fontSize: "14px", color: "#1890ff" }}>{bobinagem.nome}</Text></Col></Row>
                    </Col>
                    <Col style={{ alignItems: "center" }}>
                        <Row gutterWidth={2} justify='end'>
                            <Col xs="content">
                            </Col>
                            <Col xs="content">
                            </Col>
                            <Col xs="content">
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </FormContainer>
            }
        </>
    );
}

const CheckColumn = ({ id, name, onChange, defaultChecked = false }) => {
    const ref = useRef();
    const onCheckChange = (e) => {
        ref.current.checked = !ref.current.checked;
        onChange(id, e);
    }
    return (<Space>{name}<Checkbox ref={ref} onChange={onCheckChange} defaultChecked={defaultChecked} /></Space>);
};

const focus = (el, h,) => { el?.focus(); };
const FieldEstadoEditor = ({ p }) => {
    const onChange = (v) => p.onRowChange({ ...p.row, estado: v }, true);
    return (
        <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.estado} ref={focus} onChange={onChange} size="small" keyField="value" textField="label" data={BOBINE_ESTADOS} />
    );
}
const FieldDefeitosEditor = ({ p }) => {
    const onChange = (v) => p.onRowChange({ ...p.row, defeitos: v }, true);
    return (
        <SelectMultiField autoFocus defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.defeitos} /* ref={focus}  */ onChange={onChange} allowClear size="small" data={BOBINE_DEFEITOS} />
    );
}
const FieldDefeitos = ({ p }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
                {p.row.defeitos && p.row.defeitos.map((v) => {
                    return (<Tag key={`d${v.value}-${p.row.id}`} color="error">{v.label}</Tag>);
                })}
            </div>
        </div>
    );
}


export default (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();
    const [formFilter] = Form.useForm();

    const [bobinagem, setBobinagem] = useState();
    const [checkData, setCheckData] = useImmer({ estado: false, defeitos: false, fc: false, ff: false, probs: false, obs: false });
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/validarbobineslist/`, parameters: {}, pagination: { enabled: false, limit: 100 }, filter: {}, sort: [{ column: 'nome', direction: 'ASC' }] } });
    const primaryKeys = ['id'];
    const onCheckChange = (key, value) => {
        setCheckData(draft => { draft[key] = value.target.checked; });
    }
    const columns = [
        { key: 'nome', name: 'Bobine', width: 115, frozen: true },
        { key: 'estado', sortable: false, headerRenderer: p => <CheckColumn id="estado" name="Estado" onChange={onCheckChange} defaultChecked={checkData.estado} />, minWidth: 85, width: 85, formatter: (p) => <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status b={p.row} /></div>, editor: p => <FieldEstadoEditor p={p} />, editorOptions: { editOnClick: true } },
        { key: 'l_real', name: 'Largura Real', width: 100, editor: p => <InputNumber bordered={false} size="small" value={p.row.l_real} ref={focus} onChange={(e) => p.onRowChange({ ...p.row, l_real: e === null ? 0 : e }, true)} min={0} />, editorOptions: { editOnClick: true }, formatter: ({ row }) => row.l_real },
        { key: 'defeitos', width: 350, headerRenderer: p => <CheckColumn id="defeitos" name='Outros Defeitos' onChange={onCheckChange} defaultChecked={checkData.defeitos} />, editor: p => <FieldDefeitosEditor p={p} />, editorOptions: { editOnClick: true }, formatter: (p) => <FieldDefeitos p={p} />, editorOptions: { editOnClick: true } },
        { key: 'fc-min', headerRenderer: p => <CheckColumn id="fc" name='Falha Corte' onChange={onCheckChange} defaultChecked={checkData.fc} />, formatter: ({ row }) => <div>todo</div>, colSpan(args) { if (args.type === 'HEADER') { return 2; } return undefined; } },
        { key: 'fc-max', formatter: ({ row }) => <div>todo</div> },
        { key: 'ff', headerRenderer: p => <CheckColumn id="ff" name='Falha Filme' onChange={onCheckChange} defaultChecked={checkData.ff} />, formatter: ({ row }) => <div>todo</div> },
        { key: 'comp', width: 100, formatter: ({ row }) => row.comp },
        { key: 'probs', headerRenderer: p => <CheckColumn id="props" name='Prop. Observações' onChange={onCheckChange} defaultChecked={checkData.probs} />, width: 450, formatter: ({ row }) => <div>todo</div> },
        { key: 'obs', headerRenderer: p => <CheckColumn id="obs" name='Observações' onChange={onCheckChange} defaultChecked={checkData.obs} />, width: 450, formatter: ({ row }) => <div>todo</div> },
    ];

    const loadData = ({ signal }) => {
        const { bobinagem_id, bobinagem_nome, ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, location?.state, [...Object.keys(location?.state), ...Object.keys(dataAPI.getAllFilter())]);
        setBobinagem({ id: bobinagem_id, nome: bobinagem_nome });
        formFilter.setFieldsValue({ ...initFilters });
        dataAPI.addFilters({ bobinagem_id, ...initFilters }, true, true);
        dataAPI.fetchPost({ signal });
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());

    }, []);

    const onFilterFinish = (type, values) => { };
    const onFilterChange = (changedValues, values) => { };

    return (
        <>
            <ToolbarTitle data={dataAPI.getAllFilter()} bobinagem={bobinagem} onChange={onFilterChange} form={formFilter} />
            <Table
                //title=""
                reportTitle="Bobines"
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
                rowHeight={28}
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