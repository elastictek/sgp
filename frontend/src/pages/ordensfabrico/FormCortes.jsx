import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { uid } from 'uid';
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import Toolbar from "components/toolbar";
import { orderObjectKeys, json, isObjectEmpty, nullIfEmpty } from "utils/object";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll, getFloat } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, TimePicker } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, TIME_FORMAT, ENROLAMENTO_OPTIONS } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Cores, CortesPlanSelect } from 'components/EditorsV3';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, DatetimeField, TimeField, CortesField, Chooser, VerticalSpace, RowSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { ObsTableEditor } from 'components/TableEditorsV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { Core, EstadoBobines, Largura, Link, DateTime, RightAlign, LeftAlign, Favourite, IndexChange } from "components/TableColumns";
import { LeftToolbar, RightToolbar, Edit } from "./OrdemFabrico";
import { ImArrowDown, ImArrowUp } from 'react-icons/im';
import { MediaContext, AppContext } from 'app';
import { loadFormulacaoPlan } from './FormFormulacaoPlan';
//import FormulacaoReadOnly from '../formulacao/FormulacaoReadOnly';
const FormGenerateCortes = React.lazy(() => import('./FormGenerateCortes'));
const FormCortesOrdem = React.lazy(() => import('./FormCortesOrdem'));

const EDITKEY = "cortes";
const PERMISSION = { item: "edit", action: "cortes" };

const schema = (options = {}) => {
    return getSchema({
        /* xxxx: Joi.any().label("xxxxx").required()*/
    }, options).unknown(true);
}

const ToolbarTable = ({ form, modeEdit, allowEdit, submitting, changeMode, parameters, permission }) => {
    const navigate = useNavigate();

    const onChange = (v, field) => {


    }

    const leftContent = (<>
        {/* <Space>
            {modeEdit?.formPalete && <Button disabled={(!allowEdit.formPalete || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={()=>changeMode('formPalete')} />}
            {!modeEdit?.formPalete && <Button disabled={(!allowEdit.formPalete || submitting.state)} icon={<EditOutlined />} onClick={()=>changeMode('formPalete')}>Editar</Button>}
        </Space> */}
        <LeftToolbar permission={permission} />
    </>);

    const rightContent = (
        <Space>
            <RightToolbar permission={permission} bobinagem={{ id: parameters?.bobinagem?.id, nome: parameters?.bobinagem?.nome }} />
        </Space>
    );
    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}

export const loadCortesOrdemLookup = async ({ cortes, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "CortesOrdemLookup" }, filter: { cortes }, sort: [{ column: 'versao', direction: 'DESC' }], signal });
    return rows;
}


export default ({ operationsRef, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);

    const permission = usePermission({ permissions: props?.permissions });//Permissões Iniciais
    const [mode, setMode] = useState({ form: { edit: false, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});

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
    const [cortes, setCortes] = useState();
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "generate": return <FormGenerateCortes parameters={modalParameters.parameters} permissions={modalParameters.permissions} onSelectPlan={modalParameters.onSelectPlan} />;
                //case "formulacao": return <FormFormulacao enableAssociation={modalParameters?.enableAssociation} postProcess={modalParameters?.postProcess} parameters={modalParameters.parameters} />
            }
        }
        return (
            <ResponsiveModal lazy={modalParameters?.lazy} responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, [props?.parentUpdated]);

    useEffect(() => {
        setMode(v => ({ ...v, form: { ...v.form, edit: permission.isOk(PERMISSION) && props?.editParameters?.editKey === EDITKEY } }));
    }, [props?.editParameters?.editKey]);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        setFormDirty(false);
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
        }
        form.setFieldsValue({ cortes_plan: !("cortes_plan_id" in inputParameters.current) ? null : nullIfEmpty({ ...pickAll([{ cortes_plan_id: "plan_id" }, { cplan_designacao: "designacao" }, { cplan_idx: "idx" }], inputParameters.current) }) });
        console.log("loaddddddddddddd", inputParameters.current)
        setCortes({ ...inputParameters.current, tstamp: Date.now() });
        submitting.end();
    }

    const onValuesChange = async (changedValues, values) => {
        if ("cortes_plan" in changedValues) {
            if (values?.cortes_plan?.id) {
                setCortes({ data: null, cortesordem_id: values?.cortes_plan?.id, tstamp: Date.now() });
            }
            //console.log(changedValues)
            //form.setFieldsValue("YYYY", null);
        }
        if (props?.onValuesChange) {
            props?.onValuesChange(changedValues, values);
        }
    }

    const onSave = async () => {
        let response = null;
        try {
            console.log("saving---->", { ...pickAll(["cs_id", "agg_of_id"], inputParameters.current), cortesordem_id: cortes.cortesordem_id })
            console.log({ method: "SaveCortes", cortes_plan: form.getFieldValue("cortes_plan") })
            response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...pickAll(["cs_id", "agg_of_id"], inputParameters.current), cortesordem_id: cortes.cortesordem_id }, parameters: { method: "SaveCortes", cortes_plan: form.getFieldValue("cortes_plan") } });
            if (response?.data?.status !== "error") {
                loadData();
                props.loadParentData();
                openNotification(response?.data?.status, 'top', "Notificação", response?.data?.title);
            } else {
                openNotification(response?.data?.status, 'top', "Notificação", response?.data?.title, null);
            }
        }
        catch (e) {
            console.log(e)
            openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        }
    }

    const postProcess = async () => {
        //Após alterar a formulação, temos de retirar a formulação em planeamento!!!
        form.setFieldsValue({ cortes_plan: null });
        props.loadParentData();
    }

    const hasCortes = () => {
        //console.log("check- ",selectedFormulacao,form.getFieldValue("formulacao_id"),(selectedFormulacao || form.getFieldValue("formulacao_id")))
        if (cortes?.cortesordem_id || cortes?.data) {
            return true;
        }
        return false;
    }

    // const onOpenFormulacao = (type) => {
    //     setModalParameters({ content: "formulacao", type: "drawer", width: "95%", title: "Formulação", lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, postProcess, enableAssociation:false, parameters: { ...pickAll(["cs_id","formulacao_id","agg_of_id"],inputParameters.current), type } });
    //     showModal();
    // }

    // const onChangeCortesOrdem = (idx, ordem) => {
    //     console.log("rrrrr",idx,ordem)
    //     //const index = form.getFieldValue(["cortes"]).findIndex(x => x.idx === idx);
    //     //setSelected(prev => ({ ...prev, cortes_ordem: ordem }));
    //     //form.setFieldValue(["cortes", index, 'cortes_ordem'], ordem);
    // }

    // const showVersions = async () => {
    //     console.log("EEEEE",cortes);
    //     //const versions = await loadCortesOrdemLookup({ cortes: selected.n_cortes });
    //     //setModalParameters({ type: 'versions', width: 850, title: <div>Versões de Posicionamento <span style={{ fontWeight: 900 }}>{JSON.stringify(selected.n_cortes).replaceAll(":", "x").replaceAll('"', "")}</span></div>, versions, onSelect: onSelectCortesOrdem });
    //     //showModal();
    // }

    const onGenerateCortes = () => {
        setModalParameters({ content: "generate", type: "drawer", width: "95%", title: "Gerar Cortes", lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, onSelectPlan, permissions: permission.permissions, parameters: { ...pickAll(["agg_of_id"], inputParameters.current), data: dataAPI.getData().rows, showPlan: false } });
        showModal();
    }

    const onSelectPlan = async (rows) => {
        if (rows?.cortes && Array.isArray(rows?.cortes)) {
            form.setFieldValue("cortes_plan", null);
            let response = null;
            try {
                const _d = { cortes: JSON.stringify(rows?.cortes[0].n_cortes), cortes_ordem: JSON.stringify(rows?.cortes[0].cortes_ordem), largura_util: rows?.cortes[0].largura_util }
                response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: {}, parameters: { method: "SaveCortesOrdem", ..._d } });
                if (response.data.status !== "error") {
                    setCortes({ cortesordem_id: response.data.id, tstamp: Date.now() });
                } else {
                    openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
                }
            }
            catch (e) {
                console.log(e)
                openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
            }
        }
    }

    return (
        <>
            <ToolbarTable {...props} parameters={inputParameters.current} submitting={submitting} />
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-OFFL" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={false} alert={{ tooltip: true, pos: "none" }}>
                {/* {mode.form.edit && <> */}
                <Row><Col><HorizontalRule marginTop='0px' title="Cortes planeados" right={<Edit permissions={permission} {...PERMISSION} editable={props?.editParameters?.isEditable(false)} {...props?.editParameters} resetData={() => loadData({ init: true })} fn={onSave} />} /></Col></Row>
                <Row nogutter><Col md={12} lg={6} ><CortesPlanSelect forInput={mode.form.edit} name="cortes_plan" allowClear label={{ enabled: false, text: "Cortes Planeados" }} agg_of_id={inputParameters.current?.agg_of_id} /></Col></Row>
                <RowSpace />
                {/* </>} */}
                <Row><Col><HorizontalRule marginTop='0px' title="Cortes" right={<Space>
                    {(mode.form.edit && hasCortes()) && <Button type="link" size="small" disabled={(submitting.state)} onClick={onGenerateCortes} style={{ width: "100%" }}>Alterar Cortes</Button>}
                    {/* {(permission.isOk(PERMISSION) && props?.editParameters?.isEditable(false)) && <Button onClick={() => onOpenFormulacao("formulacao_formulation_change")} type="link">Alterar formulação</Button>}
                    {(permission.isOk(PERMISSION) && props?.editParameters?.isEditable(false,2)) && <Button onClick={() => onOpenFormulacao("formulacao_dosers_change")} type="link">Alterar doseadores</Button>} */}
                </Space>} /></Col></Row>
                {hasCortes() && <Row nogutter><Col>

                    <FormCortesOrdem parameters={{ cortesordem_id: cortes?.cortesordem_id }} forInput={false} />

                </Col></Row>}
                {(operationsRef && props?.activeTab == '2') && <Portal elId={operationsRef.current}>
                    <></>
                    {/* <Edit permissions={permission} {...PERMISSION} editable={props?.editParameters?.isEditable(false)} {...props?.editParameters} resetData={loadData} /> */}
                </Portal>
                }

            </FormContainer>
        </>
    )

}