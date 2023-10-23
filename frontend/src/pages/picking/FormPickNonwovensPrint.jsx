import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL, JUSTIFICATION_OUT_V2 } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { downloadFile } from 'components/DownloadReports';
import { json, includeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Divider, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List, Radio, Checkbox } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn, QueueNwColumn } from 'components/TableColumns';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace, FormPrint, printersList } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { MdOutlineOutput, MdOutlineInput } from 'react-icons/md';


const title = "Imprimir Etiquetas de Nonwovens";
const TitleForm = ({ level, auth, onSave, loading }) => {
    return (<ToolbarTitle id={auth?.user} description={title} details={<span style={{ fontSize: "16px", marginLeft: "135px" }}>Para Amostras</span>}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

export const loadNonwovensInLine = async ({ }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: {}, sort: [], parameters: { method: "GetNonwovensInLine" }, signal });
    if (rows && rows.length > 0) {
        return rows;
    }
    return null;
}

const steps = [
    {
        title: 'Seleção'
    }
];

const ListItem = styled(List.Item)`
    cursor: pointer;
    padding: 10px;
    transition: background-color 0.3s ease; /* Add a smooth transition effect */
    border-radius: 3px;
    &:hover {
    background-color: #bae7ff; /* Background color on hover */
    }
`;

const NonwovensList = ({ loadLists, openNotification, next, listInf, listSup, setListInf, setListSup, setDirty, onSelectNw, ...props }) => {

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        await loadLists({ signal, init });
    }

    return (
        <>
            <Col md={12} lg={6}>
                <YScroll>
                    {listInf &&
                        <List
                            header={<span style={{ fontWeight: 900, fontSize: "14px" }}>Nonwovens Inferiores</span>}
                            size="small"
                            itemLayout="horizontal"
                            dataSource={listInf}
                            renderItem={(item, index) => (
                                <List.Item/*  onClick={() => onSelectNw(item)} */>
                                    <List.Item.Meta
                                        avatar={
                                            <div><Checkbox onChange={(e) => onSelectNw(item)} /></div>
                                        }
                                        title={<div>{item.artigo_des} <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{item.artigo_cod}</span></div>}
                                        description={<div style={{ display: "flex" }}><QueueNwColumn style={{ fontSize: "9px", width: "110px" }} value={item.queue} status={item.status} /><span style={{ fontWeight: 800, color: "#000", fontSize: "14px", marginLeft: "10px" }}>{item.n_lote}</span></div>}
                                    />
                                </List.Item>
                            )}
                        />}
                </YScroll>
            </Col>
            <Col md={12} lg={6}>
                <YScroll>
                    {listSup &&
                        <List
                            header={<span style={{ fontWeight: 900, fontSize: "14px" }}>Nonwovens Superiores</span>}
                            size="small"
                            itemLayout="horizontal"
                            dataSource={listSup}
                            renderItem={(item, index) => (
                                <List.Item /* onClick={() => onSelectNw(item)} */>
                                    <List.Item.Meta
                                        avatar={

                                            <div><Checkbox onChange={() => onSelectNw(item)} /></div>

                                        }
                                        title={<div>{item.artigo_des} <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{item.artigo_cod}</span></div>}
                                        description={<div style={{ display: "flex" }}><QueueNwColumn style={{ fontSize: "9px", width: "110px" }} value={item.queue} status={item.status} /><span style={{ fontWeight: 800, color: "#000", fontSize: "14px", marginLeft: "10px" }}>{item.n_lote}</span></div>}
                                    />
                                </List.Item>
                            )}
                        />}
                </YScroll>
            </Col>
        </>
    );
}



export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ payload: { primaryKey: "vcr_num", parameters: { ...defaultParameters }, pagination: { enabled: false }, filter: { ...defaultFilters }, sort: [...defaultSort] } });
    const permission = usePermission({ name: "controlpanel" });
    const [step, setStep] = useState(0);
    const [listInf, setListInf] = useState(null);
    const [listSup, setListSup] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [selectedNws, setSelectedNws] = useState([]);
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "nwsprint": return <FormPrint {...modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal lazy={modalParameters?.lazy} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
        }
        submitting.end();
    }

    const loadLists = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, null, null);
            inputParameters.current = { ...paramsIn };
        }
        const _items = await loadNonwovensInLine({}, signal);
        setListInf(_items.filter(v => v.type == 0));
        setListSup(_items.filter(v => v.type == 1));
        submitting.end();
    }

    const onSave = async () => {
        let response = null;
        try {
            response = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: {}, parameters: { method: "AdjustNwQueue", row: { listInf, listSup } } });
            if (response && response.data.status !== "error") {
                openNotification(response.data.status, 'top', "Notificação", response.data.title);
                prev(0);
                await loadLists({ init: true });
            } else {
                openNotification("error", 'top', "Notificação", response.data.title, null);
            }
        }
        catch (e) {
            console.log(e)
            openNotification("error", 'top', "Notificação", e.message, null);
        }
    }

    const next = (item) => {
        console.log(item)
        setStep(step + 1);
    };

    const prev = (v = null) => {
        setDirty(false);
        setStep(v !== null ? v : step - 1);
    };

    const onStepChange = (value) => {
        if (value == 0 && step == 1) {
            prev();
        }
    }

    const onSelectNw = (item) => {

        const _checked = selectedNws.findIndex(v => v == item.id) == -1 ? false : true;
        console.log(_checked,selectedNws,item.id)
        if (!_checked) {
            setSelectedNws(prev => ([...prev, item.id]));
        } else {
            setSelectedNws(prev => prev.filter(v => v !== item.id));
        }
    }

    const onDownloadComplete = async (response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, '_blank');
        //downloadFile(response.data,"etiqueta_nw.pdf");
    }
    const onNwsPrint = () => {
        if (selectedNws.length > 0) {
            setModalParameters({
                width: "500px",
                height: "200px",
                content: "nwsprint", type: "modal", push: false/* , width: "90%" */, title: <div style={{ fontWeight: 900 }}>Imprimir Etiquetas de Nonwovens</div>,
                parameters: {
                    url: `${API_URL}/print/sql/`, printers: printersList?.CABS,
                    onComplete: onDownloadComplete,
                    parameters: {
                        method: "PrintNwsEtiquetas",
                        ids: selectedNws.join(','),
                        name: "ETIQUETAS-NWS-AMOSTRA",
                        path: "ETIQUETAS/NWS-AMOSTRA"
                    }
                }
            });
            showModal();
        }
    }

    return (
        <ConfigProvider
            theme={{
                components: {
                    Segmented: {
                        itemSelectedBg: "#1890ff"
                    },
                },
            }}
        >
            <TitleForm auth={permission.auth} level={location?.state?.level} onSave={onSave} loading={submitting.state} />
            <Container>
                <Row>
                    <Col>
                        <Steps type='inline' current={step} items={steps} direction="horizontal" onChange={onStepChange} style={{ flexDirection: "row" }} />
                    </Col>
                    <Col xs="content">
                        <Space>
                            {(step == 0 && dirty && !submitting.state) && <Button
                                onClick={onSave}
                                type="primary"
                            >Submeter</Button>}
                        </Space>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                            <Row nogutter>
                                {step == 0 && <NonwovensList loadLists={loadLists} setDirty={setDirty} openNotification={openNotification} next={next} setListSup={setListSup} listSup={listSup} setListInf={setListInf} listInf={listInf} onSelectNw={onSelectNw} />}
                            </Row>
                            <Row nogutter style={{ marginTop: "10px", borderTop: "1px dashed #d9d9d9", padding: "5px" }}>
                                {(selectedNws && selectedNws.length > 0) && <Col style={{ textAlign: "center" }}>
                                    <Button type="primary" size="large" icon={<PrinterOutlined />} title="Imprimir etiquetas de nonwovens" onClick={onNwsPrint}>Imprimir</Button>
                                </Col>}
                            </Row>
                        </Container>

                    </Col >
                </Row >
            </Container >
        </ConfigProvider >
    )

}