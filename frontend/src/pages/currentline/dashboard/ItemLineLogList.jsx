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
import { useDataAPI } from "utils/useDataAPI";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space, Form, Tag } from "antd";
const { Option } = Select;
import { EditOutlined, HistoryOutlined, AppstoreAddOutlined, MoreOutlined } from '@ant-design/icons';
import { BiWindowOpen } from 'react-icons/bi';
import ResponsiveModal from 'components/Modal';
import loadInit from "utils/loadInit";
/* const FormCortes = React.lazy(() => import('../FormCortes')); */
import Table from 'components/TableV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';
import TitleCard from './TitleCard';
import useWebSocket from 'react-use-websocket';
import {EventColumn,doserConsume} from '../../logslist/commons';


const title = "Eventos da Linha";
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

const SelectData = ({ onView, onChangeContent, dataAPI }) => {
    return (
        <Space>
            <Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} disabled={dataAPI.isLoading()} />
        </Space>
    );
}


export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "dashb-lineloglist", payload: { url: `${API_URL}/lineloglist/`, parameters: {}, pagination: { enabled: false, limit: 10 }, filter: {}, sort: [{ column: 'id', direction: 'DESC' }] } });
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
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal footer="ref" onCancel={hideModal} width={800} height={400}>
            {/* <FormCortes forInput={modalParameters.forInput} record={modalParameters} parentReload={parentReload} /> */}
        </ResponsiveModal>
    ), [modalParameters]);

    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimegeneric`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        queryParams: { /* 'token': '123456' */ },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 500
    });

    const loadData = async ({ signal } = {}) => {
        const request = (async () => sendJsonMessage({ cmd: 'checklineevents', value: {} }));
        request();
        const ok = dataAPI.fetchPost();
        return (ok) ? setInterval(request, 30000) : null;
    }

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ signal: controller.signal });
        return (() => { controller.abort(); clearInterval(interval); });
    }, []);


    useEffect(() => {
        if (lastJsonMessage) {
            dataAPI.fetchPost();
        }
    }, [lastJsonMessage?.hash]);





    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };

    const onView = () => {
        navigate("/app/logslist/lineloglist", { state: { tstamp: Date.now() } });
    }

    const onChangeContent = async (v, field) => {
        //dataAPI.addFilters({ ...dataAPI.getFilter(true), [field]: v }, true, true);
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
                title={<TitleCard title={card.title} />}
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
