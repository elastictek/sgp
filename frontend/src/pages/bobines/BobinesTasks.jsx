import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import moment from 'moment';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Empty, notification, Checkbox } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, TitleForm } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext, AppContext } from "../App";
import FormBobine from './FormBobine';
import { json } from "utils/object";
// import BobinesDefeitosList from '../bobines/BobinesDefeitosList';
// import BobinesDestinosList from '../bobines/BobinesDestinosList';
// import BobinesPropriedadesList from '../bobines/BobinesPropriedadesList';
// import PaletesHistoryList from './PaletesHistoryList';
// import BobinesMPGranuladoList from '../bobines/BobinesMPGranuladoList';
// import BobinesOriginaisList from '../bobines/BobinesOriginaisList';
// import FormPaletizacao from './FormPaletizacao';
import { FaWeightHanging } from 'react-icons/fa';
import { ButtonTypeChecklist, SubType } from '../ordensfabrico/commons';


const loadBobineLookup = async (bobine_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobines/sql/`, pagination: { limit: 1 }, filter: { bobine_id: `==${bobine_id}` }, parameters: { method: "BobinesLookup" } });
    return rows;
}

const loadTasksLookup = async ({ artigo_cod, lar, core, bobine_id }) => {
    const { data } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, pagination: {}, filter: { artigo_cod, lar, core, type1: 1, bobine_id }, parameters: { method: "TasksAvailableLookup" } });
    return data;
}

const TaskParameters = ({ type, r }) => {
    const parameters = json(r.parameters);
    if (type === 1) {
        return (<pre style={{ marginBottom: "0px" }}><Container fluid>
            <Row>
                <Col width={100} style={{ fontWeight: 700 }}>Artigo</Col>
                <Col width={130} style={{}}>{parameters.artigo.cod}</Col>
                <Col width={100} style={{ fontWeight: 700 }}>Designação</Col>
                <Col style={{}}>{parameters.artigo.des}</Col>
            </Row>
            <Row>
                <Col width={100} style={{ fontWeight: 700 }}>Cliente Cód.</Col>
                <Col width={130} style={{}}>{parameters.cliente.BPCNUM_0}</Col>
                <Col width={100} style={{ fontWeight: 700 }}>Cliente</Col>
                <Col style={{}}>{parameters.cliente.BPCNAM_0}</Col>
            </Row>
            <Row>
                <Col width={100} style={{ fontWeight: 700 }}>Data Imputação</Col>
                <Col width={130} style={{}}>{parameters.data_imputacao}</Col>
                <Col width={100} style={{ fontWeight: 700 }}>Observações</Col>
                <Col style={{}}>{parameters.obs}</Col>
            </Row>
        </Container></pre>);
    }
    return (<div></div>);
}

export default (props) => {
    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const permission = usePermission({});//Permissões Iniciais
    const [modeEdit, setModeEdit] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const dataAPITasks = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];
    const [activeTab, setActiveTab] = useState();
    const [bobineExists, setBobineExists] = useState(false);
    const [modalParameters, setModalParameters] = useState({});
    const [values, setValues] = useState();



    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                /* case "option": return <ReactComponent loadParentData={modalParameters.loadData} record={modalParameters.record} />; */
                default: return (<div>Teste</div>);
            }
        }
        return (
            <ResponsiveModal type={modalParameters?.type} push={modalParameters?.push} title={modalParameters.title} onCancel={hideModal} width={modalParameters?.width} height={modalParameters?.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal } = {}) => {
        const { bobine, ..._parameters } = props?.parameters || {};
        const { ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, _parameters, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys(_parameters ? _parameters : {})]);
        const formValues = await loadBobineLookup(initFilters.bobine_id);
        props.setFormTitle({ title: `Tarefas ${initFilters.bobine_nome}` }); //Set main Title
        if (formValues && formValues.length > 0) {
            const tasks = await loadTasksLookup({ artigo_cod: formValues[0].artigo_cod, lar: formValues[0].lar, core: formValues[0].core, bobine_id: initFilters.bobine_id });
            dataAPITasks.setRows(tasks.rows);

            console.log(tasks.rows)
        }
        submitting.end();
    }

    const onTaskClick = (v) => {
        Modal.info({
            content: `Trocar Etiqueta da bobine ${props.parameters.bobine_nome}?`, onOk: async () => {
                try {
                    let response = await fetchPost({ url: `${API_URL}/bobines/sql/`, filter: { bobine_id: props.parameters.bobine_id }, parameters: { method: "TrocaEtiqueta", ...v } });
                    if (response.data.status !== "error") {
                        openNotification(response.data.status, 'top', "Notificação", response.data.title);
                        loadData();
                        //props?.loadParentData();
                        //loadData({ checklist_id: response.data.id })
                    } else {
                        openNotification(response.data.status, 'top', "Notificação", response.data.title);
                        console.log("--->", response.data.title)
                        //status.formStatus.error.push({ message: response.data.title });
                        //setFormStatus({ ...status.formStatus });
                        submitting.end();
                    }
                } catch (e) {
                    Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
                    submitting.end();
                };
            }
        });
    }

    return (
        <div style={{ height: "calc(100vh - 120px)" }}>
            <YScroll>
                
                <Container fluid>
                    <Row style={{ background: "#000", color: "#fff", fontSize: "12px", fontWeight: 700 }} wrap="nowrap">
                        <Col width={150} style={{ borderInlineStart: "1px solid #fff", borderBlockEnd: "1px solid #fff", borderInlineEnd: "1px solid #fff" }}>Tarefa</Col>
                        <Col width={150} style={{ borderInlineStart: "1px solid #fff", borderBlockEnd: "1px solid #fff", borderInlineEnd: "1px solid #fff" }}>Tipo</Col>
                        <Col width={140} style={{ borderBlockEnd: "1px solid #fff", borderInlineEnd: "1px solid #fff" }}>Checklist</Col>
                        <Col width={140} style={{ borderBlockEnd: "1px solid #fff", borderInlineEnd: "1px solid #fff" }}>Data</Col>
                        <Col style={{ borderBlockEnd: "1px solid #fff", borderInlineEnd: "1px solid #fff" }}>Parametros</Col>
                    </Row>
                    <Row style={{background:"gray"}}><Col>Modo de execução</Col></Row>
                    {dataAPITasks.hasData() && dataAPITasks.getData().rows.filter(v => v.mode != 2).map(v => {

                        return (

                            <Row wrap="nowrap" key={`tsk-${v.id}`}>
                                <Col width={30} style={{ display: "flex", alignItems: "center", borderInlineStart: "1px solid #ddd", borderBlockEnd: "1px solid #ddd", borderInlineEnd: "1px solid #ddd" }}></Col>
                                <Col width={150} style={{ display: "flex", alignItems: "center", borderBlockEnd: "1px solid #ddd", borderInlineEnd: "1px solid #ddd" }}><ButtonTypeChecklist v={v.type} onClick={() => onTaskClick(v)} /></Col>
                                <Col width={140} style={{ display: "flex", alignItems: "center", borderBlockEnd: "1px solid #ddd", borderInlineEnd: "1px solid #ddd" }}><SubType type={v.type} v={v.subtype} /></Col>
                                <Col width={140} style={{ display: "flex", alignItems: "center", borderBlockEnd: "1px solid #ddd", borderInlineEnd: "1px solid #ddd" }}>{v.nome}</Col>
                                <Col width={140} style={{ display: "flex", alignItems: "center", borderBlockEnd: "1px solid #ddd", borderInlineEnd: "1px solid #ddd" }}>{moment(v.timestamp).format(DATETIME_FORMAT)}</Col>
                                <Col style={{ borderBlockEnd: "1px solid #ddd", borderInlineEnd: "1px solid #ddd" }}><TaskParameters type={v.type} r={v} /></Col>
                            </Row>


                        );


                    })}
                    <Row style={{background:"gray"}}><Col>Modo de Pré-seleção</Col></Row>
                    {dataAPITasks.hasData() && dataAPITasks.getData().rows.filter(v => v.mode != 1).map(v => {

                        return (

                            <Row wrap="nowrap" key={`tsk-${v.id}`}>
                                <Col width={30} style={{ display: "flex", alignItems: "center", borderInlineStart: "1px solid #ddd", borderBlockEnd: "1px solid #ddd", borderInlineEnd: "1px solid #ddd" }}><Checkbox/></Col>
                                <Col width={150} style={{ display: "flex", alignItems: "center", borderBlockEnd: "1px solid #ddd", borderInlineEnd: "1px solid #ddd" }}><ButtonTypeChecklist v={v.type} onClick={() => onTaskClick(v)} /></Col>
                                <Col width={140} style={{ display: "flex", alignItems: "center", borderBlockEnd: "1px solid #ddd", borderInlineEnd: "1px solid #ddd" }}><SubType type={v.type} v={v.subtype} /></Col>
                                <Col width={140} style={{ display: "flex", alignItems: "center", borderBlockEnd: "1px solid #ddd", borderInlineEnd: "1px solid #ddd" }}>{v.nome}</Col>
                                <Col width={140} style={{ display: "flex", alignItems: "center", borderBlockEnd: "1px solid #ddd", borderInlineEnd: "1px solid #ddd" }}>{moment(v.timestamp).format(DATETIME_FORMAT)}</Col>
                                <Col style={{ borderBlockEnd: "1px solid #ddd", borderInlineEnd: "1px solid #ddd" }}><TaskParameters type={v.type} r={v} /></Col>
                            </Row>


                        );


                    })}
                </Container>




            </YScroll>
        </div>
    )

}