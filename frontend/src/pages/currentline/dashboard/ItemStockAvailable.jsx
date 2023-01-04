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
import { Field, Container as FormContainer, SelectField, AlertsContainer, MultiSelector } from 'components/FormFields';
import useWebSocket from 'react-use-websocket';
import { Status, MovGranuladoColumn } from '../../picking/commons';
import TitleCard from './TitleCard';
import Portal from "components/portal";

const title = "Granulado Lotes";
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

const SelectItems = ({ onView, agg_of_id, onAddLote, onChangeContent, dataAPI }) => {




    return (
        <Space>
            {/* <Select defaultValue={noValue(dataAPI.getFilter(true)?.type, "1")} style={{ width: 200 }} onChange={(v) => onChangeContent(v, "type")} dropdownMatchSelectWidth={false} disabled={dataAPI.isLoading()}>
                <Option value="1">Lotes da Ordem de Fabrico</Option>
                <Option value="-1">Todos os Lotes</Option>
            </Select> */}
            <Button onClick={(e) => { e.stopPropagation(); onAddLote(); }} disabled={dataAPI.isLoading()}>Adicionar Lote</Button>
            <Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} disabled={dataAPI.isLoading()} />
        </Space>
    );
}

const schemaAdd = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const AddOFsStockAvailable = ({ parentRef, closeParent, loadParentData }) => {
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);
    //const artigo_cod = Form.useWatch('artigo_cod', form);

    const loadData = async ({ signal } = {}) => {
        submitting.end();
    };
    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (values) => {
        submitting.trigger();
        const v = schemaAdd().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);
        // if (xxxxxx === 1 && errors === 0 && !values.zzzzzz) {
        //     values.yyyyyyy = moment();
        // }
        // if (values.xxxxxxx <= values.yyyyyyy) {
        //     errors = 1;
        //     status.fieldStatus.t_stamp_out = { status: "error", messages: [{ message: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }] };
        // }


        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            try {
                let vals = {}
                let response = await fetchPost({ url: `${API_URL}/xxxxxxxx/`, filter: { ...vals }, parameters: {} });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: `xxxxxxxxxxx` })
                } else {
                    status.formStatus.error.push({ message: response.data.title });
                    setFormStatus({ ...status.formStatus });
                }
            } catch (e) {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            };

        }
        submitting.end();
    }

    const onValuesChange = (changedValues, values) => {
        // if ("xxxxxx" in changedValues) {
        //     form.setFieldsValue({ "yyy": null });
        //     form.setFieldsValue({ "zzzzzz": null });
        // }
    }

    return (
        <Form form={form} name={`f-addstock`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{}}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-ADD-STOCK" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} schema={schemaAdd} wrapFormItem={true} forInput={true} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col xs="content">{
                        <MultiSelector
                            type="drawer"
                            size="small"
                            title="Paletes"
                            label="Adicionar Paletes"
                            params={{ payload: { url: `${API_URL}/materiasprimaslookup/`, parameters: {}, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } }}
                            keyField={["ITMREF_0"]}
                            textField="ITMREF_0"
                            columns={[
                                { key: 'ITMREF_0', name: 'Código', width: 160 },
                                { key: 'ITMDES1_0', name: 'Designação' }
                            ]}
                            filters={{ fmulti_artigo: { type: "any", width: 150, text: "Artigo" } }}
                            moreFilters={{}}
                        />
                    }</Col>
                    <Col xs="content">{
                        <MultiSelector
                            type="drawer"
                            size="small"
                            title="Bobines"
                            label="Adicionar Bobines"
                            params={{ payload: { url: `${API_URL}/materiasprimaslookup/`, parameters: {}, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } }}
                            keyField={["ITMREF_0"]}
                            textField="ITMREF_0"
                            columns={[
                                { key: 'ITMREF_0', name: 'Código', width: 160 },
                                { key: 'ITMDES1_0', name: 'Designação' }
                            ]}
                            filters={{ fmulti_artigo: { type: "any", width: 150, text: "Artigo" } }}
                            moreFilters={{}}
                        />
                    }</Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col></Col>
                    <Col></Col>
                    <Col></Col>
                </Row>
            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Adicionar Lotes</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}

export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "dashb-stockav-01", payload: { url: `${API_URL}/paletes/paletessql/`, parameters: {method:"StockAvailableList"}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [{ column: 'lote', direction: 'ASC' }] } });
    const primaryKeys = ['id'];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.type) {
                case "lotes": return <AddOFsStockAvailable record={{ ...modalParameters }} />
            }
        }
        return (
            <ResponsiveModal type={modalParameters?.drawer ? "drawer" : "modal"} title={modalParameters.title} onCancel={hideModal} width={modalParameters.width ? modalParameters.width : 600} height={modalParameters.height ? modalParameters.height : 250} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimegeneric`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        queryParams: { /* 'token': '123456' */ },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 500
    });

    const loadData = async ({ signal } = {}) => {
        const request = (async () => sendJsonMessage({ cmd: 'checkstockavailable', value: {} }));
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
            dataAPI.addParameters({method:"StockAvailableList"},true)
            dataAPI.fetchPost();
        }
    }, [lastJsonMessage?.hash, record?.agg_of_id]);

    const columns = [
        { key: 'type', name: 'Tipo' },
        { key: 'lote', name: 'Lote' }
    ];






    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };

    const onView = () => {
        navigate("/app/paletes/stockavailablelist", { state: { ...dataAPI.getFilter(true), type: '-1', tstamp: Date.now() } });
    }

    const onAddLote = () => {
        setModalParameters({ type: 'lotes', drawer: true, width:"765px", agg_of_id: record?.agg_of_id });
        showModal();
        /* navigate("/app/picking/pickgranuladolist", { state: { ...dataAPI.getFilter(true), type: '-1', tstamp: Date.now() } }); */
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
                extra={<SelectItems record={record?.agg_of_id} onChangeContent={onChangeContent} onView={onView} dataAPI={dataAPI} onAddLote={onAddLote} />}
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
