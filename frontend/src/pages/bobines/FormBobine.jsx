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
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, BOBINE_ESTADOS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule,SwitchField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../App";
import { Status } from "./commons";
import { LeftToolbar, RightToolbar } from "./Bobine";
import { DateTimeEditor, InputNumberEditor, ModalObsEditor, SelectDebounceEditor, ModalRangeEditor, useEditorStyles, DestinoEditor, ItemsField, MultiLine, CheckColumn, FieldEstadoEditor, FieldDefeitosEditor, FieldDefeitos } from 'components/tableEditors';

const schema = (options = {}) => {
    return getSchema({
        /* xxxx: Joi.any().label("xxxxx").required()*/
    }, options).unknown(true);
}

const loadBobineLookup = async (bobine_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobines/sql/`, pagination: { limit: 1 }, filter: { bobine_id: `==${bobine_id}` }, parameters: { method: "BobinesLookup" } });
    return rows;
}

const ToolbarTable = ({ form, modeEdit, allowEdit, submitting, changeMode, permission }) => {
    const navigate = useNavigate();

    const onChange = (v, field) => {
        /* if (field === "typelist") {
            navigate("/app/validateReellings", { replace:true, state: { ...dataAPI.getAllFilter(), typelist: v, tstamp: Date.now() } });
        } else {
            form.submit();
        } */

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
            <RightToolbar permission={permission} />
        </Space>
    );
    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}

const CustomEstadoSearch = ({ value, onClick, ...props }) => {
    return (
        <Status b={{ estado: value }} onClick={onClick} {...props} />
    );
}

export default (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    //const permission = usePermission({ allowed: { producao: 100, planeamento: 100 } });//Permissões Iniciais
    //const [allowEdit, setAllowEdit] = useState({ form: false, datagrid: false });//Se tem permissões para alterar (Edit)
    //const [modeEdit, setModeEdit] = useState({ form: false, datagrid: false }); //Se tem permissões para alternar entre Mode Edit e View
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [form] = Form.useForm();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const dataAPIDestinos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal } = {}) => {
        /*if (!permission.allow()) {
            Modal.error({ content: "Não tem permissões!" });
            return;
        } */
        const { ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, { ...props?.parameters }, location?.state, [...Object.keys({ ...location?.state }), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys({ ...props?.parameters })]);
        const formValues = await loadBobineLookup(initFilters.bobine_id);
        form.setFieldsValue(formValues.length > 0 ? { ...formValues[0], timestamp: moment(formValues[0].timestamp), IPTDAT_0: moment(formValues[0].IPTDAT_0) } : {});
        console.log("-----loaded--->",formValues)
        if (formValues.length > 0 && formValues[0]?.destinos?.destinos) {
            const _destinos = formValues[0]?.destinos?.destinos.map((v,i)=>({...v,idx:`dst-${i}`}));
            dataAPIDestinos.setRows(_destinos);
        }
        form.setFieldsValue(props?.values ? { ...props?.values, timestamp: moment(props?.values.timestamp) } : {});
        submitting.end();
    }

    const onFinish = async (values) => {
        submitting.trigger();
        const v = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);
        /* if (values.XXXX < values.YYYY) {
            errors = 1;
            status.fieldStatus.ZZZZZ = { status: "error", messages: [{ message: "Error description." }] };
        } */
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            try {
                let vals = {

                }
                let response = await fetchPost({ url: `${API_URL}/api_to_call/`, filter: { ...vals }, parameters: {} });
                if (response.data.status !== "error") {
                    loadParentData();
                    closeParent();
                    Modal.success({ title: `Sucesso...` })
                } else {
                    status.formStatus.error.push({ message: response.data.title });
                    setFormStatus({ ...status.formStatus });
                }
            } catch (e) {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            };

        }
        submitting.end();
    }

    const onValuesChange = (changedValues, values) => {
        if ("YYYY" in changedValues) {
            //console.log(changedValues)
            //form.setFieldsValue("YYYY", null);
        }
    }




    return (
        <YScroll>
            <ToolbarTable {...props} submitting={submitting} />
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-FP" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={false} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col width={150}><Field name="nome" label={{ enabled: true, text: "Lote" }}><Input size="small" /></Field></Col>
                    <Col width={150}><Field name="timestamp" label={{ enabled: true, text: "Data" }}><DatePicker showTime format={DATETIME_FORMAT} size="small" /></Field></Col>
                    <Col width={110}><Field name="inicio" label={{ enabled: true, text: "Início (h:m:s)" }}><InputNumber size="small" /></Field></Col>
                    <Col width={110}><Field name="fim" label={{ enabled: true, text: "Fim (h:m:s)" }}><InputNumber size="small" /></Field></Col>
                    <Col width={110}><Field name="duracao" label={{ enabled: true, text: "Duração (h:m:s)" }}><InputNumber size="small" /></Field></Col>
                    <Col width={110}><Field name="lar" label={{ enabled: true, text: "Largura" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter={<span>mm</span>} /></Field></Col>
                    <Col width={110}><Field name="diam" label={{ enabled: true, text: "Diâmetro" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter={<span>mm</span>} /></Field></Col>
                    <Col width={80}><Field name="core" label={{ enabled: true, text: "Core" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter={<span>''</span>} /></Field></Col>
                    <Col width={110}><Field name="lreal" label={{ enabled: true, text: "Largura Real" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter={<span>mm</span>} /></Field></Col>
                    <Col width={110}><Field name="comp_actual" label={{ enabled: true, text: "Comprimento" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter="m" /></Field></Col>
                    <Col width={110}><Field name="metros_cons" label={{ enabled: true, text: "M.Consumidos" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter={`/${form.getFieldValue("comp")} m`} /></Field></Col>
                    <Col width={110}><Field name="area" label={{ enabled: true, text: "Área" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter={<span>m&sup2;</span>} /></Field></Col>
                    <Col width={80}>
                        <Field wrapFormItem={true} name="estado" label={{ enabled: true, text: "Estado" }}>
                            <Selector
                                size="small"
                                toolbar={false}
                                title="Estados"
                                popupWidth={130}
                                params={{ payload: { data: { rows: BOBINE_ESTADOS }, pagination: { limit: 20 } } }}
                                keyField={["value"]}
                                textField="value"
                                rowHeight={28}
                                columns={[
                                    { key: 'value', name: 'Estado', formatter: p => <Status b={{ estado: p.row.value }} /> }
                                ]}
                                customSearch={<CustomEstadoSearch />}
                            />
                        </Field>
                    </Col>
                </Row>
                {form.getFieldValue("destino") && <><Row><Col><HorizontalRule title="Destinos" /></Col></Row>
                    <Row style={{}} gutterWidth={10}>
                    <Col width={100}><Field name={["destinos", "estado","value"]} label={{ enabled: false, text: "Estado" }}><Input size="small" /></Field></Col>
                    <Col width={120}><Field wrapFormItem={true} name={["destinos", "regranular"]} label={{ enabled: false, text: "Regranular" }}><SwitchField checkedChildren="Regranular" unCheckedChildren="Regranular" /></Field></Col>
                    <Col><Field name="destino" label={{ enabled: false, text: "Destino" }}><Input size="small" /></Field></Col>
                    </Row>
                    <Row style={{}} gutterWidth={10}>
                        <Col>
                            <Table
                                /*onRowClick={onRowClick} */
                                rowStyle={`cursor:pointer;font-size:12px;`}
                                loadOnInit={false}
                                columns={[
                                    { key: 'cliente', name: 'Cliente', frozen: true, width: 350, formatter: p => <div style={{ fontWeight: 700 }}>{p.row?.cliente?.BPCNAM_0}</div> },
                                    { key: 'largura', name: 'Largura', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.largura} mm</div> },
                                    {
                                        key: 'obs', sortable: false,
                                        name:"Observações",
                                        formatter: ({ row, isCellSelected }) => <MultiLine value={row.obs} isCellSelected={isCellSelected}><pre style={{ whiteSpace: "break-spaces" }}>{row.obs}</pre></MultiLine>,
                                        editor: (p) => { return <ModalObsEditor forInput={false} p={p} column="obs" title="Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> },
                                        editorOptions: { editOnClick: true },
                                    }
                                ]}
                                dataAPI={dataAPIDestinos}
                                toolbar={false}
                                search={false}
                                moreFilters={false}
                                rowSelection={false}
                                primaryKeys={["idx"]}
                                editable={false}
                                rowHeight={28}
                            />
                        </Col>
                    </Row>
                </>}
            </FormContainer>
        </YScroll>
    )

}