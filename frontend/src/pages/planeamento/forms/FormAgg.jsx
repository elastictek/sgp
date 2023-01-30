import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import moment from 'moment';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { json } from "utils/object";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Card } from "antd";
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, PaperClipOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN, ENROLAMENTO_OPTIONS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SubContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace, InputNumberField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../../App";
import { schemaAgg as schema } from './FormOrdemFabrico';
import SvgSchema from '../../currentline/ordemfabrico/paletizacaoSchema/SvgSchema';

const StyledCard = styled(Card)`
    .ant-card-body{
        height:400px;
        max-height:400px; 
        overflow-y:hidden;
        padding:4px;
    }
`;

const StyledCollapse = styled(Collapse)`
    .ant-collapse-header{
        background-color:#f5f5f5;
        border-radius: 2px!important;
        padding:1px 1px!important;
    }
    .ant-collapse-content > .ant-collapse-content-box{
        padding:15px 15px!important;
    }
`;


const loadAggsLookup = async ({ agg_of_id, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { agg_of_id }, parameters: { method: "TempOrdemFabricoGet" }, sort: [], signal });
    return rows;
}

const CardOf = ({ v }) => {
    console.log("offid", v)
    return (
        <StyledCard hoverable
            style={{ width: '100%' /* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
            headStyle={{ backgroundColor: "#002766", color: "#fff" }}
            title={<div>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>{v.of_id}</div>
                <div style={{ color: "#fff", fontSize: ".7rem" }}>{v.artigo_cod} - {v.cliente_nome}</div>
            </div>} size="small"
            actions={[
                <div key="settings" onClick={() => onAction('settings')} title="Outras definições">Definições</div>,
                <div key="schema" onClick={() => onAction('schema')} title="Paletização (Esquema)">Paletização</div>,
                <div key="paletes" onClick={() => onAction('paletes_stock')}>Stock</div>,
                <div key="attachments" onClick={() => onAction('attachments')}><span><PaperClipOutlined />Anexos</span></div>
            ]}
        >
            <YScroll>
                <Row style={{}} gutterWidth={10}>
                    <Col>
                        <div style={{ marginBottom: "5px", fontWeight: 700 }}>{v?.artigo_des}</div>
                        <StyledCollapse defaultActiveKey={['1', '2']} expandIconPosition="right" bordered>
                            <Panel header={<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%" }}><div><b>Encomenda</b></div><div>{v.qty_encomenda} m&#178;</div></div>} key="1">
                                <Row gutterWidth={5}>
                                    <Col xs={2}>PRF</Col>
                                    <Col xs={4} style={{fontWeight:700,fontSize:"10px"}}>{v?.prf_cod}</Col>
                                    <Col xs={6} style={{ fontWeight: 700, textAlign: "center" }}>Valores Teóricos</Col>
                                </Row>
                                <Row gutterWidth={5}>
                                    <Col xs={2}>Enc.</Col>
                                    <Col xs={4} style={{fontWeight:700,fontSize:"10px"}}>{v?.order_cod}</Col>

                                    <Col style={{ textAlign: "right" }}>m. lineares</Col>
                                    <Col style={{ textAlign: "right" }}>{v?.linear_meters.toFixed(2)}</Col>
                                </Row>
                                <Row gutterWidth={5}>
                                    <Col xs={2}>Paletes</Col>
                                    <Col xs={4} style={{ fontWeight: 700 }}>{v?.n_paletes_total}</Col>
                                    <Col style={{ textAlign: "right" }}>m&#178;/bobine</Col>
                                    <Col style={{ textAlign: "right" }}>{v?.sqm_bobine.toFixed(2)}</Col>
                                </Row>

                                {/* <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{aggItem.linear_meters.toFixed(2)}</div><div>m/bobine</div></div>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{aggItem.sqm_bobine.toFixed(2)}</div><div>m&#178;/bobine</div></div>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{(aggItem.qty_encomenda / aggItem.sqm_bobine).toFixed(2)}</div><div>bobines</div></div>
                                {paletes?.items && <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{paletes.total.n_paletes.toFixed(2)}</div><div>paletes</div></div>}
                                {paletes?.items && <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{paletes.total.sqm_contentor.toFixed(2)}</div><div>m&#178;/contentor</div></div>}
                                {paletes?.items && <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{(aggItem.qty_encomenda / paletes.total.sqm_contentor).toFixed(2)}</div><div>contentores</div></div>} */}
                            </Panel>
                            <Panel header={<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%" }}><div><b>Paletização</b></div></div>} key="2">
                                {/* {paletes?.items && paletes.items.map((v, idx) => {
                                return (
                                    <div style={{ borderBottom: "20px" }} key={`pc-${aggItem.name}-${v.id}`}>
                                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", borderBottom: "solid 1px #d9d9d9" }}><div><b>Palete</b> {idx + 1}</div><div><b>Bobines</b> {v.num_bobines}</div></div>
                                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div style={{ color: "#595959" }}>m&#178;</div><div>{v.sqm_palete.toFixed(2)}</div></div>
                                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div style={{ color: "#595959" }}>Nº Paletes</div><div>{(paletes.total.n_paletes / paletes.items.length).toFixed(2)}</div></div>
                                    </div>
                                );
                            })} */}
                                <SvgSchema items={{ filmeestiravel_bobines: v?.filmeestiravel_bobines, filmeestiravel_exterior: v?.filmeestiravel_exterior, paletizacao: json(v?.paletizacao) }} width="100%" height="100%" />
                            </Panel>
                        </StyledCollapse>
                    </Col>
                </Row>
            </YScroll>


        </StyledCard>
    );
}

export default ({ parameters, extraRef, closeSelf, loadParentData, form, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const dataAPIArtigos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "ordemfabrico" });
    const [aggs, setAggs] = useState([]);
    const primaryKeys = [];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            // switch (modalParameters.content) {
            //     case "produtoalt": return <FormProdutoAlt updateProdutoAlt={updateProdutoAlt} parameters={modalParameters.parameters} permission={permission} />;
            // }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
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
        console.log(parameters)
        setAggs(await loadAggsLookup({ agg_of_id: parameters?.agg_of_id, signal }));
        submitting.end();
    }

    const onAgregar = () => {
        //setModalParameters({ content: "produtoalt", height: 180, width: 450, type: "modal", updateProdutoAlt, title: "Definir Nome Alternativo do Produto", /* loadData: () => dataAPI.fetchPost() */ parameters: { ...values, cliente_id } });
        //showModal();
    }

    return (
        <YScroll>
            <Toolbar style={{ width: "100%" }} right={<Button onClick={onAgregar}>Agrupar</Button>} />
            <SubContainer fluid schema={schema} forInput={permission.isOk({ item: "planeamento", action: "agg" })} loading={submitting.state}>
                <Row style={{}} gutterWidth={10}>
                    {aggs && aggs.map(v => <Col key={`of-${v.id}`} width={420} style={{ paddingBottom: "12px" }}><CardOf v={v} /></Col>)}
                </Row>
            </SubContainer>
        </YScroll>
    )

}