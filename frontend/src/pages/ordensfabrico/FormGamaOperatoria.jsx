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
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, TIME_FORMAT, ENROLAMENTO_OPTIONS } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Cores, FormulacaoPlanSelect } from 'components/EditorsV3';
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
//import { loadFormulacaoPlan } from './FormFormulacaoPlan';
//import FormulacaoReadOnly from '../formulacao/FormulacaoReadOnly';
//const FormFormulacao = React.lazy(() => import('../formulacao/FormFormulacao'));

const EDITKEY = "formulacao";
const PERMISSION = { item: "edit", action: "formulacao" };

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

const renderRowDetails = ({ data }) => {
    return (
        <div style={{ background: '#464d56', color: '#c5cae9', padding: 10 }}>
            <h3>Observações:</h3>
            <pre>
                {data?.observacoes}
            </pre>
        </div>
    );
};

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
    const [formulacao, setFormulacao] = useState();
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
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
        console.log("load formulacao",inputParameters.current)
        form.setFieldsValue({ formulacao_plan: nullIfEmpty({ ...pickAll([{ formulacao_plan_id: "plan_id" }, { fplan_designacao: "designacao" }, { fplan_idx: "idx" }, { fplan_cliente_nome: "cliente_nome" }, { fplan_group_name: "group_name" }, { fplan_subgroup_name: "subgroup_name" }], inputParameters.current) }) });
        setFormulacao({ ...inputParameters.current, tstamp: Date.now() });
        submitting.end();
    }

    const onValuesChange = async (changedValues, values) => {
        if ("formulacao_plan" in changedValues) {
            if (values?.formulacao_plan?.id){
                setFormulacao({ data: null, formulacao_id: values?.formulacao_plan?.id, tstamp: Date.now() });
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
            response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...pickAll(["cs_id", "formulacao_id", "agg_of_id"], inputParameters.current) }, parameters: { method: "SaveFormulacao", formulacao_plan: form.getFieldValue("formulacao_plan") } });
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
        form.setFieldsValue({ formulacao_plan: null });
        props.loadParentData();
    }

    const hasFormulacao = () => {
        //console.log("check- ",selectedFormulacao,form.getFieldValue("formulacao_id"),(selectedFormulacao || form.getFieldValue("formulacao_id")))
        if (formulacao?.formulacao_id || formulacao?.data) {
            return true;
        }
        return false;
    }

    const onOpenFormulacao = (type) => {
        setModalParameters({ content: "formulacao", type: "drawer", width: "95%", title: "Formulação", lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, postProcess, enableAssociation:false, parameters: { ...pickAll(["cs_id","formulacao_id","agg_of_id"],inputParameters.current), type } });
        showModal();
    }

    return (
        <>
            <ToolbarTable {...props} parameters={inputParameters.current} submitting={submitting} />
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-OFFL" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={false} alert={{ tooltip: true, pos: "none" }}>
                {/* {mode.form.edit && <> */}
                <Row><Col><HorizontalRule marginTop='0px' title="Formulação planeada" right={<Edit permissions={permission} {...PERMISSION} editable={props?.editParameters?.isEditable(false)} {...props?.editParameters} resetData={() => loadData({ init: true })} fn={onSave} />} /></Col></Row>
                <Row nogutter><Col md={12} lg={6} ><FormulacaoPlanSelect forInput={mode.form.edit} name="formulacao_plan" allowClear label={{ enabled: false, text: "Formulação Planeada" }} agg_of_id={inputParameters.current?.agg_of_id} /></Col></Row>
                <RowSpace />
                {/* </>} */}
                <Row><Col><HorizontalRule marginTop='0px' title="Formulação" right={<Space>
                    {(permission.isOk(PERMISSION) && props?.editParameters?.isEditable(false)) && <Button onClick={() => onOpenFormulacao("formulacao_formulation_change")} type="link">Alterar formulação</Button>}
                    {(permission.isOk(PERMISSION) && props?.editParameters?.isEditable(false,2)) && <Button onClick={() => onOpenFormulacao("formulacao_dosers_change")} type="link">Alterar doseadores</Button>}
                </Space>} /></Col></Row>
                {/* {hasFormulacao() && <Row nogutter><Col><FormulacaoReadOnly showTitle={false} header={true} form={form} parameters={{ formulacaoData: formulacao?.data, ...pickAll(["cs_id", "formulacao_id", "tstamp"], formulacao) }} /></Col></Row>} */}
                {(operationsRef && props?.activeTab == '4') && <Portal elId={operationsRef.current}>
                    <></>
                    {/* <Edit permissions={permission} {...PERMISSION} editable={props?.editParameters?.isEditable(false)} {...props?.editParameters} resetData={loadData} /> */}
                </Portal>
                }

            </FormContainer>
        </>
    )

}