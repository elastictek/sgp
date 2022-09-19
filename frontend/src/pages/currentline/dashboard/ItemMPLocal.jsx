import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import moment from 'moment';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL, DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from "config";
import { useModal } from "react-modal-hook";
import { getSchema } from "utils/schemaValidator";
import { useSubmitting, noValue } from "utils";
import { useDataAPI } from "utils/useDataAPI";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space, Form, Tag, Modal } from "antd";
const { Option } = Select;
import { EditOutlined, HistoryOutlined, AppstoreAddOutlined, MoreOutlined, PrinterOutlined } from '@ant-design/icons';
import { BiWindowOpen } from 'react-icons/bi';
import ResponsiveModal from 'components/Modal';
import loadInit from "utils/loadInit";
/* const FormCortes = React.lazy(() => import('../FormCortes')); */
import Table from 'components/TableV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';
import TitleCard from './TitleCard';
import useWebSocket from 'react-use-websocket';
import { Quantity, ColumnPrint } from '../../artigos/commons';

const title = "Matérias Primas";
const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    }
});
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

const SelectData = ({ onView, onChangeContent, dataAPI }) => {
    return (
        <Space>
            <Select defaultValue={noValue(dataAPI.getFilter(true)?.loc, "-1")} style={{ width: 200 }} onChange={(v) => onChangeContent(v, "loc")} dropdownMatchSelectWidth={false} disabled={dataAPI.isLoading()}>
                <Option value="-1">Todas as Localizações</Option>
                <Option value="ARM">Armazém</Option>
                <Option value="ARM2">Armazém 2</Option>
                <Option value="BUFFER">Buffer</Option>
                <Option value="DM12">DM12</Option>
                <Option value="EPIS">EPIS</Option>
                <Option value="INT">int</Option>
            </Select>
            <Select defaultValue={noValue(dataAPI.getFilter(true)?.type, "-1")} style={{ width: 200 }} onChange={(v) => onChangeContent(v, "type")} dropdownMatchSelectWidth={false} disabled={dataAPI.isLoading()}>
                <Option value="-1">Todas M.P.</Option>
                <Option value="1">Nonwovens</Option>
                <Option value="2">Cores</Option>
                <Option value="3">Granulado</Option>
                <Option value="4">Reciclado</Option>
            </Select>
            <Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} disabled={dataAPI.isLoading()} />
        </Space>
    );
}


const SelectedTitle = ({ v, cardTitle }) => {

    const title = () => {
        switch (v) {
            case "-1": return "";
            default: return `em ${v}`;
        }
    }

    return (<div>{cardTitle} <span>{title()}</span></div>);
}


const FormPrint = ({ v, parentRef, closeParent }) => {
    const [values, setValues] = useState({ impressora: "PRINTER-BUFFER" })
    const onClick = async () => {
        
        const response = await fetchPost({ url: `${API_URL}/printmpbuffer/`, parameters: { ...v.row, ...values } });
        if (response.data.status !== "error") {
            Modal.confirm({ title: 'Etiqueta Impressa', content: <div><b>{v.row.ITMDES1_0}</b>  {v.row.LOT_0}</div> });
            closeParent();
        } else {
            Modal.error({ title: 'Erro ao Imprimir Etiqueta', content: response.data.title });
        }
        
        
        
        // const response = await fetchPost({ url: `${API_URL}/printmpbuffer/`, parameters: { type: "bobinagem", bobinagem: v.bobinagem, ...values } });
        // if (response.data.status !== "error") {
        //     closeParent();
        // }else{
        //     Modal.error({title:response.data.title})
        // }
        
    }

    const onChange = (t, v) => {
        setValues(prev => ({ ...prev, [t]: v }));
    }

    return (<>
        <Container>
            <Row>
                <Col><b>Impressora:</b></Col>
            </Row>
            <Row>
                <Col><Select onChange={(v) => onChange("impressora", v)} defaultValue={values.impressora} style={{ width: "100%" }} options={[{ value: 'PRINTER-BUFFER', label: 'BUFFER' }]} /></Col>
            </Row>
            <Row style={{ marginTop: "15px" }}>
                <Col style={{ textAlign: "right" }}>
                    <Space>
                        <Button onClick={closeParent}>Cancelar</Button>
                        <Button type="primary" onClick={onClick}>Imprimir</Button>
                    </Space>
                </Col>
            </Row>
        </Container>
    </>);
}

export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "dashb-mpbuffer", payload: { url: `${API_URL}/stocklistbuffer/`, parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [{ column: 'CREDATTIM_0', direction: 'DESC' }] } });
    const primaryKeys = ['ROWID'];
    const [modalParameters, setModalParameters] = useState({});
    const [showPrintModal, hidePrintModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal title={modalParameters.title} footer="none" onCancel={hidePrintModal} width={300} height={180}><FormPrint v={{ ...modalParameters }} /></ResponsiveModal>
    ), [modalParameters]);
    const columns = [
        { key: 'print', frozen: true, name: '', cellClass: classes.noOutline, minWidth: 50, width: 50, sortable: false, resizable: false, formatter: p => <ColumnPrint record={p.row} dataAPI={dataAPI} onClick={()=>onPrint(p.row)}/> },
        { key: 'LOT_0', name: 'Lote', width: 180, frozen: true },
        { key: 'ITMREF_0', name: 'Artigo Cód.', width: 180, frozen: true },
        { key: 'ITMDES1_0', name: 'Artigo' },
        { key: 'QTYPCU_0', name: 'Qtd.', width: 110, formatter: p => <Quantity v={p.row.QTYPCU_0} u={p.row.PCU_0} /> },
        { key: 'LOC_0', name: 'Localização', width: 110 },
        { key: 'CREDATTIM_0', name: 'Data', width: 130, formatter: props => moment(props.row.CREDATTIM_0).format(DATETIME_FORMAT) }
    ];
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimegeneric`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        queryParams: { /* 'token': '123456' */ },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 500
    });

    const onPrint = (row)=>{
        setModalParameters({title:"Imprimir Etiqueta",row});
        showPrintModal();
    }

    const loadData = async ({ signal } = {}) => {
        //const request = (async () => sendJsonMessage({ cmd: 'checklineevents', value: {} }));
        //request();
        const ok = dataAPI.fetchPost();
        //return (ok) ? setInterval(request, 30000) : null;
    }

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ signal: controller.signal });
        return (() => { controller.abort(); clearInterval(interval); });
    }, []);

    /* 
        useEffect(() => {
            if (lastJsonMessage) {
                dataAPI.fetchPost();
            }
        }, [lastJsonMessage?.hash]); */



    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };

    const onView = () => {
        if (Object.keys(record).length > 0) {
            navigate("/app/artigos/mpbufferlist", { state: { ...dataAPI.getFilter(true), agg_of_id: record.agg_of_id, ofs: record.ofs.map(v => v.of_cod), tstamp: Date.now() } });
        } else {
            navigate("/app/artigos/mpbufferlist", { state: { ...dataAPI.getFilter(true), type: '-1', tstamp: Date.now() } });
        }
    }

    const onChangeContent = async (v, field) => {
        dataAPI.addFilters({ ...dataAPI.getFilter(true), [field]: v }, true, true);
        dataAPI.fetchPost();
    }

    return (
        <>
            <Card
                hoverable
                headStyle={{ padding: "0px 32px 0px 12px" }}
                style={{ height: "100%", border: "1px solid #8c8c8c" }}
                bodyStyle={{ height: "calc(100% - 61px)" }}
                size="small"
                title={<TitleCard /* data={record} */ title={<SelectedTitle v={dataAPI.getFilter(true)?.loc} cardTitle={card.title} />} />}
                extra={<SelectData onChangeContent={onChangeContent} onView={onView} dataAPI={dataAPI} />}
            >
                <YScroll>
                    <Table
                        //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
                        reportTitle={title}
                        loadOnInit={false}
                        columns={columns}
                        dataAPI={dataAPI}
                        //actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                        toolbar={false}
                        search={false}
                        moreFilters={false}
                        rowSelection={false}
                        primaryKeys={primaryKeys}
                        editable={false}
                        rowHeight={30}
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
