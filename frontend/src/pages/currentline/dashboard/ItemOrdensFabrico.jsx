import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL, DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from "config";
import { useModal } from "react-modal-hook";
import Drawer from "components/Drawer";
import { getSchema } from "utils/schemaValidator";
import { useSubmitting, noValue } from "utils";
import { useDataAPI } from "utils/useDataAPI";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space, Form } from "antd";
const { Option } = Select;
import { EditOutlined, HistoryOutlined, AppstoreAddOutlined, UnorderedListOutlined, CheckOutlined, SyncOutlined, MoreOutlined, FilePdfTwoTone, EllipsisOutlined } from '@ant-design/icons';
import { BiWindowOpen } from 'react-icons/bi';
import ResponsiveModal from 'components/Modal';
import Reports, { downloadReport } from "components/DownloadReports";
import TagButton from "components/TagButton";
import loadInit from "utils/loadInit";
/* const FormCortes = React.lazy(() => import('../FormCortes')); */
import Table from 'components/TableV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';
const FormOFabricoValidar = React.lazy(() => import('../../planeamento/ordemFabrico/FormOFabricoValidar'));

const title = "Ordens de Fabrico";
const useStyles = createUseStyles({});
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        {/*         <Col xs='content'><Field wrapFormItem={true} name="lote" label={{ enabled: true, text: "Lote" }}><Input width={250} size="small" /></Field></Col>
        <Col xs='content'><Field wrapFormItem={true} name="source" label={{ enabled: true, text: "Origem" }}><Input width={100} size="small" /></Field></Col>
        <Col xs='content'><Field wrapFormItem={true} name="timestamp" label={{ enabled: true, text: "Data" }}><Input width={150} size="small" /></Field></Col> */}
    </>
    );
}

const SelectOrdensFabrico = ({ onView, onChangeContent, dataAPI }) => {
    const navigate = useNavigate();
    return (
        <Space>
            <Button type="link" onClick={(e) => { e.stopPropagation(); navigate("/app", { state: { tstamp: Date.now() }, replace: true }); }} disabled={dataAPI.isLoading()}>A decorrer...</Button>
            {/* <Select defaultValue={noValue(dataAPI.getFilter(true)?.valid, "0")} style={{ width: 90 }} onChange={(v) => onChangeContent(v, "valid")} dropdownMatchSelectWidth={false} disabled={dataAPI.isLoading()}>
                <Option value="0">Por validar</Option>
                <Option value="1">Validadas</Option>
                <Option value="-1"> </Option>
            </Select>
            <Select defaultValue={noValue(dataAPI.getFilter(true)?.type, "1")} style={{ width: 200 }} onChange={(v) => onChangeContent(v, "type")} dropdownMatchSelectWidth={false} disabled={dataAPI.isLoading()}>
                <Option value="1">Bobinagens da Ordem de Fabrico</Option>
                <Option value="-1">Todas as Bobinagens</Option>
            </Select> */}
            <Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} disabled={dataAPI.isLoading()} />
        </Space>
    );
}



const ColumnEstado = ({ p, setShow }) => {
    const { status, temp_ofabrico } = p.row;

    const onClick = (forInput = false) => {
        setShow(prev => ({ ...prev, show: !prev.show, record: p.row, forInput }));
    }

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {((status == 0 || !status) && !temp_ofabrico) && <>
                <TagButton style={{ width: "110px", textAlign: "center" }} icon={<CheckOutlined />} color="#108ee9">Validar</TagButton>
            </>}
            {((status == 1 || !status) && temp_ofabrico) && <>
                <TagButton style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="warning" onClick={() => onClick(true)}>Em Elaboração</TagButton>
            </>}
            {(status == 2 && temp_ofabrico) && <>
                <TagButton style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="orange" onClick={() => onClick()}>Na Produção</TagButton>
            </>}
            {status == 3 && <>
                <TagButton style={{ width: "110px", textAlign: "center" }} icon={<SyncOutlined spin />} color="success" onClick={() => onClick()}>Em Produção</TagButton>
            </>}
            {status == 9 && <>
                <TagButton style={{ width: "110px", textAlign: "center" }} color="error" onClick={() => onClick()}>Finalizada</TagButton>
            </>}
        </div>
    );
}


const rowReportItems = [
    { label: 'Ficha de Processo', key: 'pl-ficha', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} />, data: { extension: "pdf", export: "pdf", name: "ORDEM-FABRICO", path: "ELASTICTEK-OF/MAIN-AGG" } },
];
const Action = ({ r, dataAPI }) => {
    const [downloading, setDownloading] = useState(false);

    const onDownload = async ({ type, r, limit, orientation, isDirty }) => {
        let itm = rowReportItems.filter(v => v.key === type.key);
        if (itm.length <= 0) { return false; }
        let { parameters, ...data } = itm[0].data;
        let dataexport = {
            ...data,
            "conn-name": "MYSQL-SGP",
            "data": {
                agg_of_id: r.temp_ofabrico_agg
            }
        };
        console.log("$#$#$#$#row-", dataexport)

        downloadReport({ dataAPI, url: `${API_URL}/exportfile/`, type, dataexport, limit, orientation, isDirty });
    }

    const showForm = ({ type, r, ...rest }) => {
        onDownload({ type, r, ...rest })
    }

    return (
        <>

            <Reports onExport={(type, limit, orientation, isDirty) => showForm({ type, limit, orientation, isDirty, r })} items={rowReportItems} dataAPI={dataAPI} button={<Button size="small" icon={<EllipsisOutlined />} />} />
        </>
    )
}

export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [show, setShow] = useState({ show: false });
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "dashb-ofabricolist", payload: { url: `${API_URL}/ofabricolist/`, parameters: {}, pagination: { enabled: false, limit: 120 }, filter: { fofstatus: 'IN(2,3)' }, sort: [{ column: 'ofabrico', direction: 'DESC' }] } });
    const primaryKeys = ['ofabrico', 'item', 'iorder'];
    const columns = [
        { key: 'options', frozen: true, name: '', cellClass: classes.noOutline, minWidth: 45, width: 45, sortable: false, resizable: false, formatter: p => <Action r={p.row} dataAPI={dataAPI} /> },
        { key: 'ofabrico', width: 120, frozen: true, name: 'Ordem Fabrico', formatter: p => <Button type="link" size="small" onClick={() => onOfClick(p.row)}>{p.row.ofabrico}</Button> },
        { key: 'prf', frozen: true, width: 120, name: 'Prf' },
        { key: 'iorder', width: 120, name: 'Encomenda' },
        { key: 'cod', width: 120, name: 'Agg' },
        { key: 'estado', sortable: false, width: 140, name: 'Estado', formatter: p => <ColumnEstado p={p} setShow={setShow} /> },
        { key: 'item_nome', name: 'Artigo' },
        { key: 'cliente_nome', name: 'Cliente' },
        { key: 'start_date', width: 100, name: 'Início Previsto' },
        { key: 'end_date', width: 100, name: 'Fim Previsto' }
    ];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal footer="ref" onCancel={hideModal} width={800} height={400}>
            {/* <FormCortes forInput={modalParameters.forInput} record={modalParameters} parentReload={parentReload} /> */}
        </ResponsiveModal>
    ), [modalParameters]);

    const onOfClick = (row) => {
        //if (row?.valid === 1) {
        //    window.location.href = `/producao/bobinagem/${row.id}/`;
        //} else {
        console.log(row)
        navigate("/app", { state: { aggId: row.temp_ofabrico_agg, tstamp: Date.now() }, replace: true });
        //}
    }
    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };

    const onView = () => {
        navigate("/app/ofabricolist", { state: { tstamp: Date.now() } });
    }

    const onChangeContent = async (v, field) => {
        dataAPI.addFilters({ ...dataAPI.getFilter(true), [field]: v });
        dataAPI.fetchPost();
    }

    /*     useEffect(()=>{
            console.log("entrei ofsssssssssssssssssssssssssss")
        },[record]) */

    return (
        <>
            <Suspense fallback={<></>}><Drawer showWrapper={show} setShowWrapper={setShow} parentReload={dataAPI.fetchPost}><FormOFabricoValidar forInput={show.forInput} /></Drawer></Suspense>
            <Card
                hoverable
                headStyle={{ padding: "0px 32px 0px 12px" }}
                style={{ height: "100%", border: "1px solid #8c8c8c" }}
                bodyStyle={{ height: "calc(100% - 45px)" }}
                size="small"
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{card.title}</div>}
                extra={<SelectOrdensFabrico onChangeContent={onChangeContent} onView={onView} dataAPI={dataAPI} />}
            >
                <YScroll>
                    <Table
                        //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
                        reportTitle={title}
                        loadOnInit={true}
                        columns={columns}
                        dataAPI={dataAPI}
                        //actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                        toolbar={false}
                        search={false}
                        moreFilters={false}
                        rowSelection={false}
                        primaryKeys={primaryKeys}
                        editable={false}
                    //rowClass={(row) => (row?.status === 0 ? classes.notValid : undefined)}
                    //selectedRows={selectedRows}
                    //onSelectedRowsChange={setSelectedRows}
                    // leftToolbar={<>
                    //     {/* <Button type='primary' icon={<AppstoreAddOutlined />} onClick={(showNewLoteModal)}>Novo Lote</Button> */}
                    // </>}
                    //content={<PickHolder/>}
                    //paginationPos='top'
                    // toolbarFilters={{ form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange, filters: <ToolbarFilters dataAPI={dataAPI} /> }}
                    />
                </YScroll>
            </Card>
        </>
    );
}
