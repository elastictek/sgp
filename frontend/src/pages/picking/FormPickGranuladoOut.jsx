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
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn } from 'components/TableColumns';
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


const title = "Saída de Granulado da Linha";
const TitleForm = ({ level, auth, onSave, loading, showHistory }) => {
    return (<ToolbarTitle id={auth?.user} description={title} showHistory={showHistory}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

export const loadQuantity = async ({ value, artigo_cod }, signal) => {
    const { data: { row } } = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: { value, artigo_cod }, sort: [], parameters: { method: "GetGranuladoLoteQuantityV2" }, signal });
    if (row && Object.keys(row).length > 0) {
        return row;
    }
    return null;
}

export const loadGranuladoInLine = async ({cs_id}, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: {cs_id}, sort: [], parameters: { method: "GetGranuladoInLine" }, signal });
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
        title: 'Registo'
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

const GranuladoList = ({ openNotification, next, list, setList, ...props }) => {
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
        console.log("granuladolist",inputParameters,props?.parameters);
        const _items = await loadGranuladoInLine({cs_id:inputParameters.current?.cs_id}, signal);
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
                    <ListItem onClick={() => next(item)} style={{ ...(!item?.arranque || (item?.arranque && !item?.n_lote)) && { backgroundColor: "rgb(245,34,45,0.45)" } }}>
                        <List.Item.Meta
                            avatar={<div style={{ width: "70px", maxWidth: "80px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Cuba style={{ fontSize: "12px"/* , lineHeight: 1.2 */ }} value={item.cuba} />
                                <div style={{ fontWeight: 700 }}>{item?.dosers}</div>
                            </div>}
                            title={<div>{item.artigo_des} <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{item.artigo_cod}</span></div>}
                            description={<div>{item?.arranque ? <span>{item.arranque}%</span> : <span>---%</span>}<span style={{ fontWeight: 800, color: "#000", fontSize: "14px", marginLeft: "10px" }}>{item.n_lote}</span></div>}
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
    const permission = usePermission({ name: "picking" });
    const [step, setStep] = useState(0);
    const [pos, setPos] = useState(null);
    const [option, setOption] = useState(null);
    const [list, setList] = useState(null);
    const [qtd, setQtd] = useState(null);
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
        let n = 1;
        try {
            switch (option) {
                case "1":
                    if (!pos?.arranque && pos?.n_lote) {
                        n = list.reduce((count, current) => ((current["vcr_num"] === pos.vcr_num && current["arranque"]) ? count + 1 : count), 0);
                    }
                    if (n <= 1) {
                        console.log("okkkkkkk")
                        //response = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: {}, parameters: { method: "RemoveGranuladoFromLine", row: { qty_reminder: qtd, obs: justificacao, vcr_num: pos.vcr_num } } });
                    } else {
                        openNotification("error", 'top', "Notificação", "Não é possível dar saída do lote, porque faz parte da formulação e encontra-se em linha!");
                        return;
                    }
                    break;
                case "2":
                    n = list.reduce((count, current) => ((current["vcr_num"] === pos.vcr_num) ? count + 1 : count), 0);
                    if (n == 1) {
                        //remove da linha se for único registo
                        response = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: {}, parameters: { method: "RemoveGranuladoFromLine", row: { qty_reminder: 0, obs: null, vcr_num: pos.vcr_num } } });
                    } else {
                        response = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: {}, parameters: { method: "RemoveDoserFromLine", row: { artigo_cod: pos.artigo_cod, n_lote: pos.n_lote, cuba: pos.cuba, dosers: pos.dosers, vcr_num: pos.vcr_num } } });
                    }
                    break;
                case "3":
                    n = list.reduce((count, current) => ((current["arranque"] && current["vcr_num"] && current["artigo_cod"] === pos.artigo_cod) ? count + 1 : count), 0);
                    if (n >= 1) {
                        response = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: {}, parameters: { method: "AddDoserToLine", row: { artigo_cod: pos.artigo_cod, cuba: pos.cuba, dosers: pos.dosers } } });
                    } else {
                        openNotification("error", 'top', "Notificação", "Não é possível dar entrada do doseador, o artigo não se encontra em linha!");
                        return;
                    }
                    break;
            }
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
        setOption(null);
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

    const onOptionSelect = (v) => {
        setOption(v);
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
                                {step == 0 && <Col><GranuladoList openNotification={openNotification} next={next} setList={setList} list={list} parameters={props?.parameters} /></Col>}
                                {step == 1 && <Col>
                                    <Row nogutter>
                                        <Col>

                                            <List
                                                size="small"
                                                itemLayout="horizontal"
                                                dataSource={[pos]}
                                                renderItem={(item, index) => (
                                                    <List.Item
                                                        /* actions={[(justificacao && qtd !== null && qtd >= 0 && option == "1") && <Button disabled={submitting.state} size="large" type="primary" onClick={onSave} icon={<CheckOutlined />}>Submeter</Button>]} */
                                                        style={{ ...!item?.arranque && { backgroundColor: "rgb(245,34,45,0.45)" } }}
                                                    >
                                                        <List.Item.Meta
                                                            avatar={<div style={{ width: "70px", maxWidth: "80px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <Cuba style={{ fontSize: "12px"/* , lineHeight: 1.2 */ }} value={item.cuba} />
                                                                <div style={{ fontWeight: 700 }}>{item?.dosers}</div>
                                                            </div>}
                                                            title={<div>{item.artigo_des} <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{item.artigo_cod}</span></div>}
                                                            description={<div>{item?.arranque ? <span>{item.arranque}%</span> : <span>---%</span>}<span style={{ fontWeight: 800, color: "#000", fontSize: "14px", marginLeft: "10px" }}>{item.n_lote}</span></div>}
                                                        />
                                                    </List.Item>
                                                )}
                                            />

                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: "10px" }} nogutter>
                                        <Col style={{ display: "flex", justifyContent: "center" }}>
                                            <Segmented
                                                defaultChecked={false}
                                                value={option}
                                                onChange={onOptionSelect}
                                                options={[
                                                    ...((!pos?.arranque && pos?.n_lote) || (pos?.arranque && pos?.n_lote)) ? [{
                                                        label: (
                                                            <div style={{ padding: 4, width: "100px" }}>
                                                                <Avatar style={{ /* backgroundColor: '#87d068' */ }} icon={<MdOutlineOutput style={{ fontSize: "24px", paddingTop: "3px" }} />} />
                                                                <div style={{ fontWeight: 400, lineHeight: 1.2, marginTop: "10px" }}><div>Saída</div><div>linha</div></div>
                                                            </div>
                                                        ),
                                                        value: '1'
                                                    }] : [],
                                                    ...((!pos?.arranque && pos?.n_lote)) ? [{
                                                        label: (
                                                            <div style={{ padding: 4, width: "100px" }}>
                                                                <Avatar style={{ /* backgroundColor: '#87d068' */ }} icon={<MdOutlineOutput style={{ fontSize: "24px", paddingTop: "3px" }} />} />
                                                                <div style={{ fontWeight: 400, lineHeight: 1.2, marginTop: "10px" }}><div>Saída</div><div>doseador</div></div>
                                                            </div>
                                                        ),
                                                        value: '2'
                                                    }] : [],
                                                    ...((pos?.arranque && !pos?.n_lote)) ? [{
                                                        label: (
                                                            <div style={{ padding: 4, width: "100px" }}>
                                                                <Avatar style={{ /* backgroundColor: '#87d068' */ }} icon={<MdOutlineInput style={{ fontSize: "24px", paddingTop: "3px" }} />} />
                                                                <div style={{ fontWeight: 400, lineHeight: 1.2, marginTop: "10px" }}><div>Entrada</div><div>doseador</div></div>
                                                            </div>
                                                        ),
                                                        value: '3'
                                                    }] : []
                                                ]}
                                            />
                                        </Col>
                                    </Row>
                                    {option && <Row style={{ marginTop: "15px" }} nogutter>
                                        <Col style={{ /* display: "flex", justifyContent: "center" */ }}>
                                            {option === "1" && <>
                                                <Row nogutter style={{ alignItems: "center", justifyContent: "center" }}><Col xs="content"><InputNumber value={qtd} placeholder='Qtd. Restante' style={{ width: "180px" }} min={0} max={pos?.qty_lote} addonAfter="Kg" onChange={onQtdChange} /></Col></Row>
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
                                                {((justificacao && qtd !== null && qtd >= 0 && option == "1")) && <Row style={{ alignItems: "center", justifyContent: "center", marginTop: "15px" }}>
                                                    <Col xs="content"><Button disabled={submitting.state} size="large" type="primary" onClick={onSave} icon={<CheckOutlined />}>Submeter</Button></Col>
                                                </Row>}
                                            </>}
                                            {(option === "2" || option === "3") && <Row style={{ alignItems: "center", justifyContent: "center", marginTop: "15px" }}>
                                                <Col xs="content"><Button disabled={submitting.state} size="large" type="primary" onClick={onSave} icon={<CheckOutlined />}>Submeter</Button></Col>
                                            </Row>}
                                        </Col>
                                    </Row>}
                                </Col>}
                            </Row>
                        </Container>
                    </Col >
                </Row >
            </Container >
        </ConfigProvider >
    )

}