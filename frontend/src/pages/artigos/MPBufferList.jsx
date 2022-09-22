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
import { Quantity, ColumnPrint, FormPrint } from './commons';

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'><Field name="fartigo" label={{ enabled: true, text: "Artigo", pos: "top", padding: "0px" }}>
            <Input size='small' allowClear />
        </Field></Col>
        <Col xs='content'><Field name="flote" label={{ enabled: true, text: "Lote", pos: "top", padding: "0px" }}>
            <Input size='small' allowClear />
        </Field></Col>
        <Col xs='content'><Field name="fdate" label={{ enabled: true, text: "Data", pos: "top", padding: "0px" }}>
            <RangeDateField size='small' allowClear />
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
        <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col>
    </>} right={
        <Col xs="content">
            <FormContainer id="frm-title" form={form} wrapForm={true} wrapFormItem={true} schema={schema} label={{ enabled: false }} onValuesChange={onChange} fluid>
                <Col style={{ alignItems: "center" }}>
                    <Row gutterWidth={2} justify='end'>
                        <Col xs="content">
                            <Field name="type" label={{ enabled: false }}>
                                <SelectField style={{ width: "200px" }} size="small" keyField="value" textField="label" data={
                                    [{ value: "-1", label: "Todas M.P." },
                                    { value: "1", label: "Nonwovens" },
                                    { value: "2", label: "Cores" },
                                    { value: "3", label: "Granulado" },
                                    { value: "4", label: "Reciclado" }
                                    ]} />
                            </Field>
                        </Col>
                        <Col xs="content">
                            <Field name="loc" label={{ enabled: false }}>
                                <SelectField style={{ width: "200px" }} size="small" keyField="value" textField="label" data={
                                    [{ value: "-1", label: "Todas as Localizações" },
                                    { value: "ARM", label: "Armazém" },
                                    { value: "ARM2", label: "Armazém 2" },
                                    { value: "BUFFER", label: "Buffer" },
                                    { value: "DM12", label: "DM12" },
                                    { value: "EPIS", label: "EPIS" },
                                    { value: "INT", label: "Int" }

                                    ]} />
                            </Field>
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
    const [modalParameters, setModalParameters] = useState({});
    const [showPrintModal, hidePrintModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal title={modalParameters.title} footer="none" onCancel={hidePrintModal} width={500} height={280}><FormPrint v={{ ...modalParameters }} /></ResponsiveModal>
    ), [modalParameters]);
    const columns = [
        { key: 'print', frozen: true, name: '', cellClass: classes.noOutline, minWidth: 50, width: 50, sortable: false, resizable: false, formatter: p => <ColumnPrint record={p.row} dataAPI={dataAPI} onClick={()=>onPrint(p.row)}/>  },
        { key: 'LOT_0', name: 'Lote', width: 180, frozen: true },
        { key: 'ITMREF_0', name: 'Artigo Cód.', width: 180, frozen: true },
        { key: 'ITMDES1_0', name: 'Artigo' },
        { key: 'VCRNUM_0', name: 'Transação' },
        { key: 'QTYPCU_0', name: 'Qtd.', width: 110, formatter: p => <Quantity v={p.row.QTYPCU_0} u={p.row.PCU_0} /> },
        { key: 'LOC_0', name: 'Localização', width: 110 },
        { key: 'CREDATTIM_0', name: 'Data', width: 130, formatter: props => moment(props.row.CREDATTIM_0).format(DATETIME_FORMAT) }
    ];


    const onPrint = (row)=>{
        setModalParameters({title:"Imprimir Etiqueta",row});
        showPrintModal();
    }

    const loadData = ({ signal }) => {
        const { ...initFilters } = loadInit({ type: "-1", loc: "BUFFER" }, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter())]);
        formFilter.setFieldsValue({ ...initFilters });
        dataAPI.addFilters(initFilters, true, true);
        //dataAPI.addParameters({ typelist }, true, true);
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
                //remove empty values
                const { ...vals } = Object.fromEntries(Object.entries({ ...dataAPI.getAllFilter(), ...values }).filter(([_, v]) => v !== null && v!==''));
                const _values = {
                    ...vals,
                    fartigo: getFilterValue(vals?.fartigo, 'any'),
                    flote: getFilterValue(vals?.flote, 'any'),
                    fdate: getFilterRangeValues(vals["fdate"]?.formatted)
                };
                dataAPI.addFilters(_values);
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
        if ("type" in changedValues) {
            dataAPI.addFilters({type:changedValues.type}, false, true);
            dataAPI.fetchPost();
        } else if ("loc" in changedValues) {
            dataAPI.addFilters({loc:changedValues.loc}, false, true);
            dataAPI.fetchPost();
        }
        

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