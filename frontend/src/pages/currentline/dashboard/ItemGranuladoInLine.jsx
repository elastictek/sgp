import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
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
import { EventColumn, doserConsume } from '../../logslist/commons';
import { Cuba } from "./commons/Cuba";


const title = "Granulado em Linha";
const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    error: {
        background: "#cf1322",
        color: "#fff",
        '&:hover': {
            color: '#000',
        }
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
            <Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} disabled={dataAPI.isLoading()} />
        </Space>
    );
}


export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "dashb-granuladoinline", payload: { url: `${API_URL}/granuladolistinline/`, parameters: {}, pagination: { enabled: false, limit: 10 }, filter: {}, sort: [{ column: 'cuba', direction: 'ASC' }] } });
    const primaryKeys = ['cuba', 'dosers', 'matprima_cod'];
    const columns = [
        { key: `cuba`, sortable: false, name: ``, frozen: true, minWidth: 45, width: 45, formatter: p => <Cuba value={parseInt(p.row.cuba)} /> },
        { key: 'dosers', sortable: false, name: ``, frozen: true, minWidth: 90, width: 90, formatter: p => <div style={{ textAlign: "center", fontSize: "14px" }}><b>{p.row.dosers}</b></div> },
        { key: 'arranque', sortable: false, name: 'Arranque', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.arranque} %</div> },
        { key: 'matprima_cod', sortable: false, name: `Matéria Prima`, frozen: true, formatter: p => <b>{p.row.matprima_cod}</b> },
        { key: 'matprima_des', sortable: false, name: `Designação`, frozen: true, formatter: p => <b>{p.row.matprima_des}</b> },
        { key: 'n_lote', sortable: false, name: `Lote`, frozen: true, formatter: p => <b>{p.row.n_lote}</b> },
        { key: 'qty_lote', name: 'Quantidade', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.qty_lote && `${parseFloat(p.row.qty_lote).toFixed(2)} kg`}</div> },
        { key: 't_stamp', name: 'Data', width: 130, frozen: true, formatter: props => props.row.t_stamp && dayjs(props.row.t_stamp).format(DATETIME_FORMAT) }
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
        const request = (async () => sendJsonMessage({ cmd: 'checkgranulado', value: {} }));
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
        navigate("/app/picking/pickgranuladolist", { state: { ...dataAPI.getFilter(true), type: '-1', tstamp: Date.now() } });
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
                        rowClass={(row) => (row?.n_lote ? undefined : classes.error)}
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
