

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
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, CINTASPALETES_OPTIONS, PALETIZACAO_ITEMS, PALETE_SIZES } from "config";
import { useDataAPI } from "utils/useDataAPI";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Card } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../App";
import { Context } from './Palete';
import { Core, EstadoBobines, Largura } from "./commons";
import { LeftToolbar, RightToolbar } from "./Palete";
import IconButton from "components/iconButton";
import { CgArrowDownO, CgArrowUpO, CgCloseO } from 'react-icons/cg';
import SvgSchema from '../currentline/ordemfabrico/paletizacaoSchema/SvgSchema';
import { json } from "utils/object";
import PaleteBobinesPick from '../picking/PaleteBobinesPick';

const loadOrdensFabricoOpen = async () => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, pagination: {}, filter: {retrabalho:0}, parameters: { method: "OrdensFabricoOpen" } });
    return rows;
}

const CardTitle = ({ ofid, op, cliente, artigo }) => {
    return (
        <>
            {ofid &&
                <div>
                    <div style={{display:"flex",justifyContent:"space-between"}}><div style={{ fontWeight: 800 }}>{ofid}</div><div style={{}}>{artigo}</div></div>
                    <div style={{ fontWeight: 400, fontSize: "10px" }}>{cliente}</div>
                </div>
            }
            {!ofid &&
                <div>
                    <div style={{ fontWeight: 700 }}>{op}</div>
                </div>
            }
        </>
    );
}

export default ({ setFormTitle,loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const permission = usePermission({});
    const [modeEdit, setModeEdit] = useState({ formPaletizacao: false });
    const [dirty, setDirty] = useState(false);
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [form] = Form.useForm();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const dataAPIArtigos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];
    const [values, setValues] = useState();
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "pick": return <PaleteBobinesPick loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} minItems={modalParameters.parameters.nbobines} maxItems={modalParameters.parameters.nbobines} />;
            }
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
        const formValues = await loadOrdensFabricoOpen();
        setValues(formValues.map(v=>{
            if (v?.esquema){
                return v;
            }else{
                const x ={...v,esquema:{paletizacao:{details:[{item_id: 2, item_des: "Bobines", item_order: 0, item_numbobines: v.bobines_por_palete, item_paletesize: null}]}}};
                return x;
            }
        }));
        submitting.end();
    }

    const onPaleteClick = (value,idxPalete,nbobines) => {
        setModalParameters({ content: "pick",type: "drawer", push: false, width: "90%", loadData: loadParentData, parameters: {...value,idxPalete,nbobines} });
        showModal();
    }

    return (
        <>
            <YScroll>
                {values && <Container fluid>
                    <Row gutterWidth={3}>
                        {values && values.map((field, index) => (
                            <Col key={`fo-${index}`} width={450}>
                                <Card title={<CardTitle ofid={field.ofid} op={field.op} cliente={field.cliente_nome} artigo={field.item_cod} />} style={{ width: "100%", marginBottom: "5px" }}>
                                    <div style={{display:"flex",fontSize:"11px",justifyContent:"space-between",marginBottom:"5px"}}><div>{field.order_cod}</div><div>{field.prf_cod}</div></div>                                    
                                    <div>
                                        {field.esquema && <SvgSchema items={{ paletizacao: json(json(field?.esquema)?.paletizacao) }} height="200px" onClick={(idxPalete,nbobines)=>onPaleteClick(field,idxPalete,nbobines)} />}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>}
            </YScroll>
        </>
    );

}
