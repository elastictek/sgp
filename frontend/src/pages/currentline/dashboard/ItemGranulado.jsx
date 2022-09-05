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
import { Button, Select, Typography, Card, Collapse, Space, Form } from "antd";
const { Option } = Select;
import { EditOutlined, HistoryOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { BiWindowOpen } from 'react-icons/bi';
import ResponsiveModal from 'components/Modal';
import loadInit from "utils/loadInit";
/* const FormCortes = React.lazy(() => import('../FormCortes')); */
import Table from 'components/TableV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';
import useWebSocket from 'react-use-websocket';
import {Status} from '../../picking/commons';

const title = "Reciclado(Granulado) Lotes";
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
    return (<></>);
}

const SelectItems = ({ onView, onChangeContent, dataAPI }) => {
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
    const dataAPI = useDataAPI({ id: "dashb-granuladolist", payload: { url: `${API_URL}/granuladolist/`, parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [{ column: 'timestamp', direction: 'DESC' }] } });
    const primaryKeys = ['id'];
    
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimegeneric`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        queryParams: { /* 'token': '123456' */ },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 500
    });

    useEffect(() => {
        const request = (async () => sendJsonMessage({ cmd: 'checkreciclado', value: {} }));
        request();
        const interval = setInterval(request, 30000);
        return (() => clearInterval(interval));
    }, []);

    useEffect(() => {
        if (lastJsonMessage) {
            dataAPI.fetchPost();
        }
    }, [lastJsonMessage?.hash]);

    
    const columns = [

        { key: 'lote', width:110, name: 'Lote', formatter: p => <Button type="link" size="small" onClick={() => onLoteClick(p.row)}>{p.row.lote}</Button> },
        { key: 'estado', width:80, name: 'Estado', formatter:p=><Status estado={p.row.estado}/> },
        { key: 'peso', name: 'Peso', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{p.row.peso} kg</div> },
        //{ key: 'tara', name: 'Tara', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{p.row.tara}</div> },
        { key: 'produto_granulado', name: 'Produto' },
        { key: 'timestamp', width:140, name: 'Data', formatter: props => moment(props.row.timestamp).format(DATETIME_FORMAT) }
    ];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal footer="ref" onCancel={hideModal} width={800} height={400}>
            {/* <FormCortes forInput={modalParameters.forInput} record={modalParameters} parentReload={parentReload} /> */}
        </ResponsiveModal>
    ), [modalParameters]);




    const onLoteClick = (row) => {
        navigate('/app/picking/pickgranulado', { state: { id: row.id, level:0 } });
    }
    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };

    const onView = () => {
        navigate("/app/picking/granuladolist", { state: {} });
    }

    const onChangeContent = async (v, field) => {
        dataAPI.addFilters({ ...dataAPI.getFilter(true), [field]: v });
        dataAPI.fetchPost();
    }

    return (
        <>
            {Object.keys(record).length > 0 && <Card
                hoverable
                headStyle={{ padding: "0px 32px 0px 12px" }}
                style={{ height: "100%", border: "1px solid #8c8c8c" }}
                bodyStyle={{ height: "calc(100% - 45px)" }}
                size="small"
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{card.title}</div>}
                extra={<SelectItems onChangeContent={onChangeContent} onView={onView} dataAPI={dataAPI} />}
            >
                <YScroll>
                    <Table
                        reportTitle={title}
                        loadOnInit={true}
                        columns={columns}
                        dataAPI={dataAPI}
                        toolbar={false}
                        search={false}
                        moreFilters={false}
                        rowSelection={false}
                        primaryKeys={primaryKeys}
                        editable={false}
                        rowClass={(row) => (row?.status === 0 ? classes.notValid : undefined)}
                    />
                </YScroll>
            </Card>
            }
        </>
    );
}
