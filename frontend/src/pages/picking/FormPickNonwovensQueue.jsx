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
import { json, includeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Divider, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List, Radio } from "antd";
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
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { MdOutlineOutput, MdOutlineInput } from 'react-icons/md';


const title = "Ajustar Fila de Nonwovens";
const TitleForm = ({ level, auth, onSave, loading }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
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
        title: 'Ajustar'
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

const NonwovensList = ({ loadLists, openNotification, next, listInf, listSup, setListInf, setListSup, setDirty, ...props }) => {
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        await loadLists({ signal, init });
    }

    const onChange = (type, dir, idx) => {
        if (type == 1) {
            if (dir == 1) {
                if (idx > 0 && idx < listSup.length) {
                    setDirty(true);
                    setListSup(prev => {
                        const temp = prev[idx - 1];
                        prev[idx - 1] = prev[idx];
                        prev[idx] = temp;
                        return prev.map((v, i) => ({ ...v, queue: i + 1 }));
                    });
                }
            } else {
                if (idx >= 0 && idx < listSup.length - 1) {
                    setDirty(true);
                    setListSup(prev => {
                        const temp = prev[idx + 1];
                        prev[idx + 1] = prev[idx];
                        prev[idx] = temp;
                        return prev.map((v, i) => ({ ...v, queue: i + 1 }));
                    });
                }
            }
        } else {
            if (dir == 1) {
                if (idx > 0 && idx < listInf.length) {
                    setDirty(true);
                    setListInf(prev => {
                        const temp = prev[idx - 1];
                        prev[idx - 1] = prev[idx];
                        prev[idx] = temp;
                        return prev.map((v, i) => ({ ...v, queue: i + 1 }));
                    });
                }
            } else {
                if (idx >= 0 && idx < listInf.length - 1) {
                    setDirty(true);
                    setListInf(prev => {
                        const temp = prev[idx + 1];
                        prev[idx + 1] = prev[idx];
                        prev[idx] = temp;
                        return prev.map((v, i) => ({ ...v, queue: i + 1 }));
                    });
                }
            }
        }
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
                                <List.Item style={{}}>
                                    <List.Item.Meta
                                        avatar={

                                            <div style={{ display: "flex" }}>
                                                <Button disabled={index == 0} icon={<CaretUpOutlined />} onClick={() => onChange(0, 1, index)} />
                                                <Button disabled={index == listSup.length - 1} icon={<CaretDownOutlined />} onClick={() => onChange(0, 0, index)} />
                                            </div>

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
                                <List.Item style={{}}>
                                    <List.Item.Meta
                                        avatar={

                                            <div style={{ display: "flex" }}>
                                                <Button disabled={index == 0} icon={<CaretUpOutlined />} onClick={() => onChange(1, 1, index)} />
                                                <Button disabled={index == listSup.length - 1} icon={<CaretDownOutlined />} onClick={() => onChange(1, 0, index)} />
                                            </div>

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
    const permission = usePermission({ name: "picking" });
    const [step, setStep] = useState(0);
    const [listInf, setListInf] = useState(null);
    const [listSup, setListSup] = useState(null);
    const [dirty, setDirty] = useState(false);

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

    const prev = (v=null) => {
        setDirty(false);
        setStep(v!==null ? v : step - 1);
    };

    const onStepChange = (value) => {
        if (value == 0 && step == 1) {
            prev();
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
                                {step == 0 && <NonwovensList loadLists={loadLists} setDirty={setDirty} openNotification={openNotification} next={next} setListSup={setListSup} listSup={listSup} setListInf={setListInf} listInf={listInf} />}
                            </Row>
                        </Container>

                    </Col >
                </Row >
            </Container >
        </ConfigProvider >
    )

}