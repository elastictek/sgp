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
import { ColumnBobines, Ofs, Bobines, typeListField, typeField, validField } from "./commons";
import ToolbarTitle from 'components/ToolbarTitle';

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

// const ToolbarTitle = ({ data, form }) => {
//     const st = (parseInt(data?.type) === -1 || !data?.ofs) ? null : JSON.stringify(data?.ofs).replaceAll(/[\[\]\"]/gm, "").replaceAll(",", " | ");
//     return (
//         <FormContainer id="frm-title" form={form} wrapForm={true} wrapFormItem={true} schema={schema} label={{ enabled: false }} fluid>
//             <Row>
//                 <Col>
//                     <Row>
//                         <Col>{
//                             (parseInt(data?.valid) === 0) ?
//                                 <Title style={{ margin: "0px" }} level={4}>Bobinagens da Linha 1 por Validar</Title> :
//                                 <Title style={{ margin: "0px" }} level={4}>Bobinagens da Linha 1</Title>
//                         }</Col>
//                     </Row>
//                     <Row>
//                         <Col>
//                             {st && <Text code style={{ fontSize: "14px", color: "#1890ff" }}>{st}</Text>}
//                         </Col>
//                     </Row>
//                 </Col>
//                 <Col style={{ alignItems: "center" }}>
//                     <Row gutterWidth={2} justify='end'>
//                         <Col xs="content">
//                             <Field name="typelist" label={{ enabled: false }}>
//                                 <SelectField size="small" keyField="value" textField="label" data={
//                                     [{ value: "A", label: "Estado Bobines" },
//                                     { value: "B", label: "Consumo Bobinagem" },
//                                     { value: "C", label: "Ordens de Fabrico" }]} />
//                             </Field>
//                         </Col>
//                         <Col xs="content">
//                             <Field name="type" label={{ enabled: false }}>
//                                 <SelectField size="small" keyField="value" textField="label" data={
//                                     [{ value: "1", label: "Bobinagens da Ordem de Fabrico" },
//                                     { value: "-1", label: "Todas as Bobinagens" }]} />
//                             </Field>
//                         </Col>
//                         <Col xs="content">
//                             <Field name="valid" label={{ enabled: false }}>
//                                 <SelectField size="small" keyField="value" textField="label" data={
//                                     [{ value: "0", label: "Por validar" },
//                                     { value: "1", label: "Validadas" },
//                                     { value: "-1", label: " " }
//                                     ]} /></Field>
//                         </Col>
//                     </Row>
//                 </Col>
//             </Row>
//         </FormContainer>
//     );
// }


const TitleForm = ({ data, onChange, form }) => {
    const st = (parseInt(data?.type) === -1 || !data?.ofs) ? null : JSON.stringify(data?.ofs).replaceAll(/[\[\]\"]/gm, "").replaceAll(",", " | ");
    return (<ToolbarTitle title={<>
        <Col xs='content' style={{}}><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>Bobinagens</span></Col>
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

const IFrame = ({src})=> {
    return <div dangerouslySetInnerHTML={{ __html: `<iframe frameBorder="0" onload="this.width=screen.width;this.height=screen.height;" src='${src}'/>`}} />;
}


export default (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "bobinagensL1list", payload: { url: `${API_URL}/bobinagenslist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: {}, sort: [{ column: 'nome', direction: 'DESC' }] } });
    const primaryKeys = ['id'];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
            <ResponsiveModal title={modalParameters.title} lazy={true} footer="ref" onCancel={hideModal} width={5000} height={5000}><IFrame src={modalParameters.src}/></ResponsiveModal>
    ), [modalParameters]);

    const columns = [
        { key: 'nome', name: 'Bobinagem', width: 115, frozen: true, formatter: p => <Button size="small" type="link" onClick={() => onBobinagemClick(p.row)}>{p.row.nome}</Button> },
        { key: 'inico', name: 'Início', width: 90 },
        { key: 'fim', name: 'Fim', width: 90 },
        { key: 'duracao', name: 'Duração', width: 90 },
        { key: 'core', name: 'Core', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.core}''</div> },
        { key: 'comp', name: 'Comprimento', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp} m</div> },
        { key: 'comp_par', name: 'Comp. Emenda', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_par} m</div> },
        { key: 'comp_cli', name: 'Comp. Cliente', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_cli} m</div> },
        { key: 'area', name: 'Área', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.area} m&sup2;</div> },
        { key: 'diam', name: 'Diâmetro', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam} mm</div> },
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

    const onBobineClick = (v) => {
        setModalParameters({ src:`/producao/bobine/details/${v.id}/`,title:`Detalhes da Bobine` });
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

    const loadData = ({ signal }) => {
        const { typelist, ...initFilters } = loadInit({ typelist: "A", type: "-1", valid: "-1" }, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, location?.state, [...Object.keys(location?.state), ...Object.keys(dataAPI.getAllFilter())]);
        formFilter.setFieldsValue({ typelist, ...initFilters });
        dataAPI.addFilters(initFilters, true, true);
        dataAPI.addParameters({ typelist }, true, true);
        dataAPI.fetchPost({ signal });
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());

    }, [location?.state?.typelist, location?.state?.type, location?.state?.valid]);

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const { typelist, ...vals } = Object.fromEntries(Object.entries({ ...dataAPI.getAllFilter(), ...values }).filter(([_, v]) => v !== null && v!==''));
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
                dataAPI.addFilters(_values);
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

    return (
        <>
            {/*  <ToolbarTitle data={dataAPI.getAllFilter()} onChange={onFilterChange} form={formFilter} /> */}
            <TitleForm data={dataAPI.getFilter(true)} onChange={onFilterChange} form={formFilter} />
            <Table
                //title=""
                reportTitle="Bobinagens"
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
                rowHeight={formFilter.getFieldValue('typelist') === "C" ? 44 : 28}
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