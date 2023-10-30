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


const title = "Saída de Nonwovens da Linha";
const TitleForm = ({ level, auth, onSave, loading, showHistory }) => {
    return (<ToolbarTitle id={auth?.user} description={title} showHistory={showHistory}
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
    },
    {
        title: 'Quantidade'
    },
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

const NonwovensList = ({ openNotification, next, list, setList, ...props }) => {
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
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, null, null);
            inputParameters.current = { ...paramsIn };
        }
        const _items = await loadNonwovensInLine({}, signal);
        setList(_items);
        submitting.end();
    }

    return (<YScroll>
        {list &&
            <List
                size="small"
                itemLayout="horizontal"
                dataSource={list}
                renderItem={(item, index) => (
                    <ListItem onClick={() => next(item)} style={{}}>
                        <List.Item.Meta
                            avatar={

                                <Avatar size={36} style={{ backgroundColor: '#000' }}><PosColumn value={item.type} cellProps={{}} /></Avatar>

                            }
                            title={<div>{item.artigo_des} <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{item.artigo_cod}</span></div>}
                            description={<div style={{ display: "flex" }}><QueueNwColumn style={{ fontSize: "9px", width: "110px" }} value={item.queue} status={item.status} /><span style={{ fontWeight: 800, color: "#000", fontSize: "14px", marginLeft: "10px" }}>{item.n_lote}</span></div>}
                        />
                    </ListItem>
                )}
            />}
    </YScroll>);
}



export default ({ extraRef, closeSelf, loadParentData, showHistory=true, ...props }) => {
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
    const [pos, setPos] = useState(null);
    const [list, setList] = useState(null);
    const [qtd, setQtd] = useState(null);
    const [unit, setUnit] = useState('m2');
    const [justificacao, setJustificacao] = useState(null);

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

    const onSave = async () => {
        let response = null;
        try {
            const _qtd = (unit==='m2') ? qtd : parseFloat((qtd*(pos.largura/1000)).toFixed(2));
            response = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: {}, parameters: { method: "RemoveNonwovenFromLine", row: { qty_reminder: _qtd, obs: justificacao, vcr_num: pos.vcr_num } } });
            if (response && response.data.status !== "error") {
                openNotification(response.data.status, 'top', "Notificação", response.data.title);
                prev();
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
        setPos(item);
        setStep(step + 1);
    };

    const prev = () => {
        setList(null);
        setQtd(null);
        setPos(null);
        setJustificacao(null);
        setStep(step - 1);
    };

    const onStepChange = (value) => {
        if (value == 0 && step == 1) {
            prev();
        }
    }

    const onUnitSelect = (v) => {
        setUnit(v);
    }

    const onQtdChange = (v) => {
        setQtd(v);
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
            <TitleForm auth={permission.auth} level={location?.state?.level} onSave={onSave} loading={submitting.state} showHistory={showHistory} />
            <Container>
                <Row>
                    <Col>
                        <Steps type='inline' current={step} items={steps} direction="horizontal" onChange={onStepChange} style={{ flexDirection: "row" }} />
                        <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                            <Row nogutter>
                                {step == 0 && <Col><NonwovensList openNotification={openNotification} next={next} setList={setList} list={list} /></Col>}
                                {step == 1 &&
                                    <Col>
                                        <Row nogutter>
                                            <Col>
                                                <List
                                                    size="small"
                                                    itemLayout="horizontal"
                                                    dataSource={[pos]}
                                                    renderItem={(item, index) => (
                                                        <ListItem onClick={() => next(item)} style={{}}>
                                                            <List.Item.Meta
                                                                avatar={

                                                                    <Avatar size={36} style={{ backgroundColor: '#000' }}><PosColumn value={item.type} cellProps={{}} /></Avatar>

                                                                }
                                                                title={<div>{item.artigo_des} <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{item.artigo_cod}</span></div>}
                                                                description={<div style={{ display: "flex" }}><QueueNwColumn style={{ fontSize: "9px", width: "110px" }} value={item.queue} status={item.status} /><span style={{ fontWeight: 800, color: "#000", fontSize: "14px", marginLeft: "10px" }}>{item.n_lote}</span></div>}
                                                            />
                                                        </ListItem>
                                                    )}
                                                />
                                            </Col>
                                        </Row>
                                        <Row style={{ marginTop: "15px" }} nogutter>
                                            <Col style={{ /* display: "flex", justifyContent: "center" */ }}>

                                                <Row nogutter style={{ alignItems: "center", justifyContent: "center" }}>
                                                    <Col xs="content"><InputNumber value={qtd} placeholder='Qtd. Restante' style={{ width: "180px" }} min={0} max={pos?.qty_lote} onChange={onQtdChange} /></Col>
                                                    <Col xs="content">

                                                        <Segmented
                                                            defaultChecked={false}
                                                            value={unit}
                                                            onChange={onUnitSelect}
                                                            options={[
                                                                {
                                                                    label: (<div>Metros&sup2;</div>),
                                                                    value: 'm2'
                                                                },
                                                                {
                                                                    label: (<div>Metros</div>),
                                                                    value: 'm'
                                                                }
                                                            ]}
                                                        />

                                                    </Col>
                                                </Row>
                                                <Row nogutter style={{ alignItems: "center", justifyContent: "center" }}>
                                                    <Col></Col>
                                                    <Col>
                                                        <Divider orientation="center">Justificação da saída</Divider>
                                                        {!justificacao && <List
                                                            bordered
                                                            dataSource={JUSTIFICATION_OUT_V2}
                                                            renderItem={(item) => (
                                                                <ListItem onClick={() => setJustificacao(item)}>
                                                                    <Typography.Text></Typography.Text> {item}
                                                                </ListItem>
                                                            )}
                                                        />}
                                                        {justificacao && <List
                                                            bordered
                                                            dataSource={[justificacao]}
                                                            renderItem={(item) => (
                                                                <List.Item actions={[<a href='#' onClick={() => setJustificacao(null)}>Limpar</a>]}>
                                                                    <Typography.Text></Typography.Text> {item}
                                                                </List.Item>
                                                            )}
                                                        />}
                                                    </Col>
                                                    <Col></Col>
                                                </Row>
                                                {((justificacao && qtd !== null && qtd >= 0)) && <Row style={{ alignItems: "center", justifyContent: "center", marginTop: "15px" }}>
                                                    <Col xs="content"><Button disabled={submitting.state} size="large" type="primary" onClick={onSave} icon={<CheckOutlined />}>Submeter</Button></Col>
                                                </Row>}

                                            </Col>
                                        </Row>
                                    </Col>
                                }
                            </Row>
                        </Container>
                    </Col >
                </Row >
            </Container >
        </ConfigProvider >
    )

}