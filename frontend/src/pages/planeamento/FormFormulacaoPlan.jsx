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
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Timeline } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Table from 'components/TableV3';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, ENROLAMENTO_OPTIONS } from 'config';
import useWebSocket from 'react-use-websocket';
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { dayjsValue } from 'utils/index';
import { useImmer } from "use-immer";
const FormFormulacao = React.lazy(() => import('../formulacao/FormFormulacao'));
//import { MediaContext } from "../App";
//import { Context } from './Palete';
// import { Core, EstadoBobines, Largura } from "./commons";
// import { LeftToolbar, RightToolbar } from "./Palete";

const schema = (options = {}) => {
    return getSchema({
        /* xxxx: Joi.any().label("xxxxx").required()*/
    }, options).unknown(true);
}

export const loadFormulacaoPlan = async ({ agg_of_id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { agg_of_id }, sort: [], parameters: { method: "FormulacaoPlanList" }, signal });
    if (rows && rows.length > 0) {
        return rows;
    }
    return [];
}

export default ({ operationsRef, index, updateState, operations, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});
    //const permission = usePermission({ allowed: { producao: 100, planeamento: 100 } });//Permissões Iniciais
    //const [allowEdit, setAllowEdit] = useState({ form: false, datagrid: false });//Se tem permissões para alterar (Edit)
    //const [modeEdit, setModeEdit] = useState({ form: false, datagrid: false }); //Se tem permissões para alternar entre Mode Edit e View
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [form] = Form.useForm();
    const permission = usePermission({ name: "ordemfabrico", permissions: props?.permissions });
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const dataAPIArtigos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];
    const [localState, updateLocalState] = useImmer({
        items: [],
        planId: null,
        formulacao_id: null,
        cs_id: null,
        loaded:false
    });


    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, [props?.parameters?.tstamp, location?.state?.tstamp]);

    const loadData = async ({ signal } = {}) => {
        submitting.trigger();
        setFormDirty(false);
        const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
        inputParameters.current = { ...paramsIn };



        // formulacao_id
        // : 
        // 7
        // formulacao_plan_id
        // : 
        // 2079
        // fplan_cliente_nome
        // : 
        // null
        // fplan_designacao
        // : 
        // null
        // fplan_idx
        // : 
        // null
        // fplan_versao
        // : 
        // null

        const _rows = await loadFormulacaoPlan({ agg_of_id: inputParameters.current.ordem.agg_of_id }, signal);
        updateLocalState(draft => {
            draft.loaded=true;
            draft.cs_id = inputParameters.current?.cs_id;
            draft.formulacao_id = inputParameters.current.ordem?.formulacao_id;
            draft.items = _rows;
            draft.planId = inputParameters.current.ordem.formulacao_plan_id;
        });
        console.log("#####ccccccccccccccccccccccccccc#######", _rows, inputParameters.current.ordem?.formulacao_id);
        // console.log("########################", inputParameters)
        // const _amostragem = pickAll(["sentido_enrolamento", "amostragem", "observacoes", "item_certificacoes"], inputParameters.current.ordem);
        // _amostragem["sentido_enrolamento"] = ENROLAMENTO_OPTIONS.find(v => v.value == _amostragem?.sentido_enrolamento);
        // const _tipoEmenda = pickAll(["maximo", "tipo_emenda", "emendas_rolo", "paletes_contentor"], json(inputParameters.current.ordem.emendas));
        // _tipoEmenda["tipo_emenda"] = TIPOEMENDA_OPTIONS.find(v => v.key == _tipoEmenda?.tipo_emenda).key;
        // const _artigo = pickAll([
        //     "of_cod", "artigo_cod", "artigo_des", "artigo_produto", "cliente_nome", "order_cod", "prf_cod", "qty_encomenda",
        //     "artigo_core", "artigo_gsm", "artigo_gtin", "artigo_lar", "artigo_thickness", "artigo_tipo","n_paletes_total"
        // ], inputParameters.current.ordem.of);
        // //_artigo["core_cod"] = pickAll([{ core_cod: "ITMREF_0" }, { core_des: "ITMDES1_0" }], inputParameters.current?.rows[0]?.of)
        // inputParameters.current.initValues={
        //     ..._artigo,
        //     ...pickAll(["start_prev_date", "end_prev_date", "inicio", "fim"], inputParameters.current.ordem, (k, n, v) => dayjsValue(v)),
        //     ..._amostragem,
        //     ..._tipoEmenda,
        //     ...pickAll(["n_paletes"], inputParameters.current.ordem)
        // };
        // form.setFieldsValue(inputParameters.current.initValues);

        submitting.end();
    }

    useEffect(() => {
        if (formDirty && !operations.dirtyForms.includes(index)) {
            form.resetFields();
            form.setFieldsValue({ ...inputParameters.current.initValues });
        }
    }, [formDirty, operations.dirtyForms])

    const onFinish = async (values) => {
        submitting.trigger();
        submitting.end();
    }

    const onValuesChange = (changedValues, values) => {
        if (updateState) {
            updateState(draft => {
                if (!draft.operations.dirtyForms.includes(index)) {
                    draft.operations.dirtyForms.push(index);
                }
            });
        }
        setFormDirty(true);
        if ("YYYY" in changedValues) {
            //console.log(changedValues)
            //form.setFieldsValue("YYYY", null);
        }
    }

    const onSave = () => {
        // temp_id  - temp_ofabrico id
        // agg_id   - temp_ofabricoagg id
        // cs_id    - current_settings id
        // ordem_id - planeamento_producao id
        console.log("saving---->", { ...pickAll(["cs_id", "agg_id", "ordem_id", "temp_id"], inputParameters.current) })
    }

    const forInput = (action, item = "edit") => {
        return (operations.edit && permission.isOk({ item, action }));
    }

    return (
        <YScroll>
            {localState.loaded && <Container fluid style={{ padding: "5px 5px" }}>
                {/*                 <Row><Col><HorizontalRule marginTop='0px' title="Artigo" /></Col></Row> */}
                <Row style={{}}>
                    <Col md={12} lg={3}>
                        <Timeline
                            /* mode="alternate" */
                            items={localState.items.map(v => ({
                                ...localState.planId == v.plan_id && { color: 'green' },
                                ...localState.planId != v.plan_id && { dot: <ClockCircleOutlined style={{ fontSize: '16px' }} /> },
                                children: <div>
                                    <div>{v.designacao}</div>
                                    <div style={{ fontWeight: 700 }}>{v.observacoes}</div>
                                </div>
                            }))}
                        />
                    </Col>
                    <Col>
                        <FormFormulacao noHeader={true} setFormTitle={true} parameters={{ ...localState.formulacao_id && { formulacao_id: localState.formulacao_id }, ...localState.cs_id && { cs_id: localState.cs_id }, type: "formulacao_formulation_change" }} />
                    </Col>
                </Row>
            </Container>
            }
            {(operationsRef && operations.edit) && <Portal elId={operationsRef.current}>
                {operations.dirtyForms.includes(index) && <Button onClick={onSave} type="primary">Guardar</Button>}
            </Portal>
            }
        </YScroll>
    )

}