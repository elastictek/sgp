import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { allPass, curry, eqProps, isNil, map, uniqWith } from 'ramda';
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
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector,FormPrint, Label, HorizontalRule, DatetimeField, TimeField, CortesField, Chooser, VerticalSpace, RowSpace,printersList } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { ObsTableEditor } from 'components/TableEditorsV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { Core, EstadoBobines, Largura, Link, DateTime, RightAlign, LeftAlign, Favourite, IndexChange } from "components/TableColumns";
import { ImArrowDown, ImArrowUp } from 'react-icons/im';
import { MediaContext, AppContext } from 'app';
const FormGenerateCortes = React.lazy(() => import('../ordensfabrico/FormGenerateCortes'));
const FormCortesOrdem = React.lazy(() => import('../ordensfabrico/FormCortesOrdem'));

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

const loadCortes = async ({ data, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "GetCortes" }, filter: { ...data }, sort: [], signal });
    if (rows && rows.length > 0) {
        return { cortes: json(rows[0].cortes), cortesordem: json(rows[0].cortesordem) };
    }
    return rows;
}

const loadMeasures = async ({ data, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "GetCortesMeasures" }, filter: { ...data }, sort: [], signal });
    if (rows && rows.length > 0) {
        return rows[0];
    }
    return rows;
}

export default ({ operationsRef, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);

    const permission = usePermission({ name: "ordemfabrico" });//Permissões Iniciais
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
    const [measures, setMeasures] = useState({});
    const [offset, setOffset] = useState();
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "generate": return <FormGenerateCortes parameters={modalParameters.parameters} permissions={modalParameters.permissions} onSelectPlan={modalParameters.onSelectPlan} />;
                case "print": return <FormPrint {...modalParameters.parameters} printer={modalParameters.parameters?.printers && modalParameters.parameters?.printers[0]?.value} />;
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
        const row = await loadCortes({ data: inputParameters.current, signal });
        if (row?.cortesordem.id && inputParameters.current?.cs_id) {
            const rowMeasures = await loadMeasures({ data: { cortesordem_id: row.cortesordem.id, cs_id: inputParameters.current.cs_id }, signal });
            if (rowMeasures) {
                setOffset(rowMeasures._offset);
                const la = {};
                const lo = {};
                for (let i = 1; i <= 24; i++) {
                    if (!isNil(rowMeasures[`la_${i}`])) {
                        la[`${i}`] = rowMeasures[`la_${i}`];
                    }
                    if (!isNil(rowMeasures[`lo_${i}`])) {
                        lo[`${i}`] = rowMeasures[`lo_${i}`];
                    }
                }
                setMeasures({ LA: { ...la }, LO: { ...lo } });
            }

        }
        console.log("444444", row, {
            ...inputParameters.current,
            ...row?.cortesordem && { cortesordem_id: row.cortesordem.id, cortes_id: row.cortesordem.cortes_id },
            tstamp: Date.now()
        })
        setCortes({
            ...inputParameters.current,
            ...row?.cortesordem && { cortesordem_id: row.cortesordem.id, cortes_id: row.cortesordem.cortes_id },
            tstamp: Date.now()
        });
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
        if (cortes?.cortesordem_id) {
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

    const onSelectPlan = async (rows, closeModal) => {
        if (rows?.cortes && Array.isArray(rows?.cortes)) {
            let response = null;
            try {
                const _d = { cortes: JSON.stringify(rows?.cortes[0].n_cortes), cortes_ordem: JSON.stringify(rows?.cortes[0].cortes_ordem), largura_util: rows?.cortes[0].largura_util }
                response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: {}, parameters: { method: "SaveCortesOrdem", ..._d, ...inputParameters.current } });
                if (response.data.status !== "error") {
                    if (closeModal) {
                        closeModal();
                    }
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


    const onMeasuresSave = async () => {
        let errorLA = false;
        let errorLO = false;
        let dataLA = (measures?.LA || {});
        let dataLO = (measures?.LO || {});

        const la = Object.keys(dataLA).map(Number).sort((a, b) => a - b);
        const lo = Object.keys(dataLO).map(Number).sort((a, b) => a - b);

        for (let i = 0; i < la.length - 1; i++) {
            const currentKey = la[i];
            const nextKey = la[i + 1];

            if (dataLA[nextKey] == undefined)
                continue;

            if (currentKey + 1 !== nextKey) {
                errorLA = true;
                break;
            }
            if (dataLA[currentKey] >= dataLA[nextKey]) {
                errorLA = true;
                break;
            }
        }

        for (let i = 0; i < lo.length - 1; i++) {
            const currentKey = lo[i];
            const nextKey = lo[i + 1];
            if (dataLO[currentKey] == undefined) {
                continue;
            }
            if (currentKey + 1 !== nextKey) {
                errorLO = true;
                break;
            }
            if (dataLO[currentKey] <= dataLO[nextKey] || dataLO[nextKey] == undefined) {
                errorLO = true;
                break;
            }
        }

        if (errorLA) {
            openNotification("error", 'top', "Erros no preenchimento", "Não é possível registar as medições em LA.");
            return;
        }
        if (errorLO) {
            openNotification("error", 'top', "Erros no preenchimento", "Não é possível registar as medições em LO.");
            return;
        }

        if (isNil(offset)) {
            openNotification("error", 'top', "Erros no preenchimento", "O offset é obrigatório!");
            return;
        }

        let response = null;
        try {
            response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: {}, parameters: { method: "SaveCortesMeasures", measures, offset, cortesordem_id: cortes?.cortesordem_id, cs_id: cortes?.cs_id } });
            if (response?.data?.status !== "error") {
                openNotification(response?.data?.status, 'top', "Notificação", response?.data?.title);
            } else {
                openNotification("error", 'top', "Notificação", response?.data?.title, null);
            }
        }
        catch (e) {
            console.log(e)
            openNotification("error", 'top', "Notificação", e.message, null);
        }
    }

    const onOffsetChange = (v) => {
        setOffset(v);
    }

    const onMeasureChange = (type, idx, value) => {
        const _d = { ...measures, [type]: { ...measures[type], [idx]: value } };
        const _m = Object.fromEntries(
            Object.entries(_d).map(([key, nestedObj]) => [
                key,
                Object.fromEntries(
                    Object.entries(nestedObj).filter(([_, value]) => value !== undefined && value !== null)
                )
            ])
        );
        setMeasures(_m);
    }

    const measureIsValid = (type, idx, nBobines) => {
        if ((type === "LA" && idx === 1) || (idx === nBobines && type === "LO")) {
            return true;
        }
        const value = measures?.[type]?.[idx];
        const pnValue = (type === "LA") ? measures?.[type]?.[idx - 1] : measures?.[type]?.[idx + 1];

        if (pnValue === undefined && value !== undefined) {
            return false;
        }

        if (value !== undefined && pnValue !== undefined) {
            if (value <= pnValue) {
                return false;
            }
        }
        return true;

    }

    const onPrint = () => {
        setModalParameters({
            width: "500px",
            height: "200px",
            content: "print", type: "modal", push: false/* , width: "90%" */, title: <div style={{ fontWeight: 900 }}>Imprimir Esquema</div>,
            parameters: {
                url: `${API_URL}/print/sql/`, printers: [...printersList?.PRODUCAO, ...printersList?.ARMAZEM], numCopias: 1,
                onComplete: onDownloadComplete,
                parameters: {
                    method: "PrintCortesSchema",
                    cortesordem_id: cortes?.cortesordem_id,
                    cs_id:  inputParameters.current.cs_id,
                    name: "CORTES-SCHEMA",
                    path: "MISC/CORTES_SCHEMA"
                }
            }
        });
        showModal();
    }

    const onDownloadComplete = async (response,download) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, '_blank');
    }

    return (
        <>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-OFFL" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={false} alert={{ tooltip: true, pos: "none" }}>
                <RowSpace />
                <Row><Col><HorizontalRule marginTop='0px' title="Cortes" right={<Space>
                    <Button type="link" size="small" disabled={(submitting.state)} onClick={onGenerateCortes} style={{ width: "100%" }}>Gerar Cortes</Button>
                    <Button type="link" size="small" disabled={(submitting.state)} onClick={onPrint} style={{ width: "100%" }}>Imprimir</Button>
                    <Button type="link" size="small" disabled={(submitting.state || Object.keys(measures?.LA || {}).length == 0 || Object.keys(measures?.LO || {}).length == 0)} onClick={onMeasuresSave} style={{ width: "100%" }}>Registar Medições</Button>
                </Space>} /></Col></Row>
                <Row nogutter>
                    <Col>
                        {hasCortes() && <>
                            <FormCortesOrdem parameters={{ cortesOrdemId: cortes?.cortesordem_id }} forInput={false} measure={cortes?.ofabrico_status === 3 ? true : false} offset={offset} measures={measures} onOffsetChange={onOffsetChange} measureIsValid={measureIsValid} onMeasureChange={onMeasureChange} height="200px" />
                        </>}
                    </Col>
                </Row>
            </FormContainer>
        </>
    )

}