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
import { useDataAPI } from "utils/useDataAPIV3";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space, Form, Tag, Drawer } from "antd";
const { Option } = Select;
import { EditOutlined, HistoryOutlined, AppstoreAddOutlined, MoreOutlined } from '@ant-design/icons';
import { BiWindowOpen } from 'react-icons/bi';
import ResponsiveModal from 'components/Modal';
import loadInit from "utils/loadInit";
/* const FormCortes = React.lazy(() => import('../FormCortes')); */
import Table from 'components/TableV2';
import useWebSocket from 'react-use-websocket';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';
import TitleCard from './TitleCard';
import { TbCircles } from "react-icons/tb";
import BobinesPopup from "../../bobinagens/commons/BobinesPopup";

const title = "Bobinagens";
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

const SelectBobinagens = ({ onView, onChangeContent, dataAPI }) => {
    return (
        <Space>
            <Select defaultValue={noValue(dataAPI.getFilter(true)?.valid, "0")} style={{ width: 90 }} onChange={(v) => onChangeContent(v, "valid")} dropdownMatchSelectWidth={false} disabled={dataAPI.isLoading()}>
                <Option value="0">Por validar</Option>
                <Option value="1">Validadas</Option>
                <Option value="-1"> </Option>
            </Select>
            <Select defaultValue={noValue(dataAPI.getFilter(true)?.type, "1")} style={{ width: 200 }} onChange={(v) => onChangeContent(v, "type")} dropdownMatchSelectWidth={false} disabled={dataAPI.isLoading()}>
                <Option value="1">Bobinagens da Ordem de Fabrico</Option>
                <Option value="-1">Todas as Bobinagens</Option>
            </Select>
            <Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} disabled={dataAPI.isLoading()} />
        </Space>
    );
}

const IFrame = ({ src }) => {
    return <div dangerouslySetInnerHTML={{ __html: `<iframe frameBorder="0" onload="this.width=screen.width;this.height=screen.height;" src='${src}'/>` }} />;
}

export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "dashb-bobinagens", payload: { url: `${API_URL}/bobinagens/sql/`, parameters: {method:"BobinagensList"}, pagination: { enabled: false, limit: 20 }, filter: { valid: "0", type: "1"/* agg_of_id: record.agg_of_id, valid: "0", type: "1" */ }, sort: [{ column: 'nome', direction: 'ASC' }] } });
    const primaryKeys = ['id'];
    const columns = [
        { key: 'nome', name: 'Bobinagem', width: 115, frozen: true, formatter: p => <Button size="small" type="link" onClick={() => onBobinagemClick(p.row)}>{p.row.nome}</Button> },
        { key: 'action', name: '', minWidth: 40, maxWidth: 40, frozen: true, formatter: p => <Button icon={<TbCircles />} size="small" onClick={() => onBobinesPopup(p.row)} /> },
        { key: 'inico', name: 'Início', width: 90 },
        { key: 'fim', name: 'Fim', width: 90 },
        { key: 'duracao', name: 'Duração', width: 90 },
        { key: 'core', name: 'Core', width: 90 },
        { key: 'comp', name: 'Comprimento', width: 100 },
        { key: 'comp_par', name: 'Comp. Emenda', width: 100 },
        { key: 'comp_cli', name: 'Comp. Cliente', width: 100 },
        { key: 'area', name: 'Área', width: 90 },
        { key: 'diam', name: 'Diâmetro', width: 100 },
        { key: 'nwinf', name: 'Nw Inf. m', width: 100 },
        { key: 'nwsup', name: 'Nw Sup. m', width: 100 }
    ];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal title={modalParameters.title} lazy={true} footer="ref" onCancel={hideModal} width={5000} height={5000}><IFrame src={modalParameters.src} /></ResponsiveModal>
    ), [modalParameters]);
    const [showBobinesModal, hideBobinesModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal title={modalParameters.title} lazy={true} footer="ref" onCancel={hideBobinesModal} width={320} height={500}><BobinesPopup record={{ ...modalParameters }} /></ResponsiveModal>
    ), [modalParameters]);

    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimegeneric`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        queryParams: { /* 'token': '123456' */ },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 500
    });

    const onBobinesPopup = (row) => {
        console.log(row)
        setModalParameters({ title: <div>Bobinagem <span style={{fontWeight:900}}>{row.nome}</span></div>, bobines: JSON.parse(row.bobines) });
        showBobinesModal();
    }


    const loadData = async ({ signal } = {}) => {
        const request = (async () => sendJsonMessage({ cmd: 'checkbobinagens', value: {} }));
        request();
        //const ok = dataAPI.fetchPost();
        //return (ok) ? setInterval(request, 30000) : null;
        return setInterval(request, 5000);
    }

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ signal: controller.signal });
        return (() => { controller.abort(); clearInterval(interval); });
    }, []);


    useEffect(() => {
        if (lastJsonMessage) {
            //dataAPI.fetchPost();
            if (record?.agg_of_id) {
                dataAPI.addFilters({ ...dataAPI.getFilter(true), agg_of_id: record.agg_of_id }, true, true);
            } else {
                const { agg_of_id, ...f } = dataAPI.getFilter(true);
                dataAPI.addFilters(f, true, true);
            }
            dataAPI.fetchPost();
        }
    }, [lastJsonMessage?.hash, record?.agg_of_id]);

    const onBobinagemClick = (row) => {
        //if (row?.valid === 1 && !row?.agg_of_id) {
        //    setModalParameters({ src:`/producao/bobinagem/${row.id}/`,title:`Bobinagem ${row.nome}`  });
        //    showModal();
        //} else {
        navigate("/app/bobines/validarlist", { state: { bobinagem_id: row.id, bobinagem_nome: row.nome, tstamp: Date.now() } });
        //}
    }

    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };

    const onView = () => {
        if (Object.keys(record).length > 0) {
            navigate("/app/bobinagens/reellings", { state: { ...dataAPI.getFilter(true), agg_of_id: record.agg_of_id, ofs: record.ofs.map(v => v.of_cod), tstamp: Date.now() } });
        } else {
            navigate("/app/bobinagens/reellings", { state: { ...dataAPI.getFilter(true), type: '-1', tstamp: Date.now() } });
        }
    }





    const onChangeContent = async (v, field) => {
        dataAPI.addFilters({ ...dataAPI.getFilter(true), [field]: v }, true, true);
        dataAPI.fetchPost();
    }

    /*     useEffect(() => {
            if (record?.agg_of_id) {
                dataAPI.addFilters({ ...dataAPI.getFilter(true), agg_of_id: record.agg_of_id }, true, true);
            } else {
                const { agg_of_id, ...f } = dataAPI.getFilter(true);
                dataAPI.addFilters(f, true, true);
            }
            dataAPI.fetchPost();
        }, [record?.agg_of_id]);
     */




    return (
        <>
            <Card
                hoverable
                headStyle={{ padding: "0px 32px 0px 12px" }}
                style={{ height: "100%", border: "1px solid #8c8c8c" }}
                bodyStyle={{ height: "calc(100% - 61px)" }}
                size="small"
                title={<TitleCard data={record} title={card.title} />}
                extra={<SelectBobinagens onChangeContent={onChangeContent} onView={onView} dataAPI={dataAPI} />}
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
