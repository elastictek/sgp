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
import { Status, MovColumn, PosColumn } from '../../picking/commons';
import TitleCard from './TitleCard';

const title = "Nonwovens Lotes";
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
            <Select defaultValue={noValue(dataAPI.getFilter(true)?.type, "1")} style={{ width: 200 }} onChange={(v) => onChangeContent(v, "type")} dropdownMatchSelectWidth={false} disabled={dataAPI.isLoading()}>
                <Option value="1">Lotes da Ordem de Fabrico</Option>
                <Option value="-1">Todos os Lotes</Option>
            </Select>
            <Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} disabled={dataAPI.isLoading()} />
        </Space>
    );
}


export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "dashb-nwlist", payload: { url: `${API_URL}/nwlist/`, parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [{ column: 't_stamp', direction: 'DESC' }] } });
    const primaryKeys = ['id'];


    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimegeneric`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        queryParams: { /* 'token': '123456' */ },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 500
    });

    const loadData = async ({ signal } = {}) => {
        const request = (async () => sendJsonMessage({ cmd: 'checknw', value: {} }));
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
            if (record?.agg_of_id) {
                dataAPI.addFilters({ ...dataAPI.getFilter(true), agg_of_id: record.agg_of_id }, true, true);
            } else {
                const { agg_of_id, ...f } = dataAPI.getFilter(true);
                dataAPI.addFilters(f, true, true);
            }
            dataAPI.fetchPost();
        }
    }, [lastJsonMessage?.hash, record?.agg_of_id]);

    const columns = [
        { key: 'status', width: 90, name: 'Movimento', formatter: p => <MovColumn value={p.row.status} /> },
        { key: 'artigo_cod', name: 'Artigo' },
        { key: 'artigo_des', name: 'Designação' },
        { key: 'n_lote', width: 110, name: 'Lote', formatter: p => p.row.lote },
        { key: 'type', width: 90, name: 'Posição', formatter: p => <PosColumn value={p.row.type} /> },
        { key: 'qty_lote', name: 'Qtd', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{p.row.qty_lote} m<sup>2</sup></div> },
        { key: 't_stamp', width: 140, name: 'Data', formatter: props => moment(props.row.t_stamp).format(DATETIME_FORMAT) }
    ];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal footer="ref" onCancel={hideModal} width={800} height={400}>
            {/* <FormCortes forInput={modalParameters.forInput} record={modalParameters} parentReload={parentReload} /> */}
        </ResponsiveModal>
    ), [modalParameters]);





    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };

    const onView = () => {

        if (Object.keys(record).length > 0) {
            navigate("/app/picking/picknwlist", { state: { ...dataAPI.getFilter(true), agg_of_id: record.agg_of_id, nonwovens: record.nonwovens, ofs: record.ofs?.map(v => v.of_cod), status: record.status, tstamp: Date.now() } });
        } else {
            navigate("/app/picking/picknwlist", { state: { ...dataAPI.getFilter(true), type: '-1', tstamp: Date.now() } });
        }


    }

    const onChangeContent = async (v, field) => {
        dataAPI.addFilters({ ...dataAPI.getFilter(true), [field]: v });
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
                title={<TitleCard data={record} title={card.title} />}
                extra={<SelectItems onChangeContent={onChangeContent} onView={onView} dataAPI={dataAPI} />}
            >
                <YScroll>
                    <Table
                        reportTitle={title}
                        loadOnInit={false}
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
        </>
    );
}
