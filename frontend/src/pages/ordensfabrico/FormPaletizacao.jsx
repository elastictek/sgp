

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
import { API_URL, CINTASPALETES_OPTIONS, PALETIZACAO_ITEMS, PALETE_SIZES } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV3';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext, AppContext } from "app";
import IconButton from "components/iconButton";
import { LeftToolbar, RightToolbar, Edit } from "./OrdemFabrico";
import { CgArrowDownO, CgArrowUpO, CgCloseO } from 'react-icons/cg';
import SvgSchema from './paletizacaoSchema/SvgSchema';
import { json } from "utils/object";

const EDITKEY = "paletizacao";
const PERMISSION = { item: "edit", action: "paletizacao" };

const schema = (options = {}) => {
    return getSchema({
        /* xxxx: Joi.any().label("xxxxx").required()*/
    }, options).unknown(true);
}

const ToolbarTable = ({ form, modeEdit, permission, submitting, changeMode, dirty, onSave, ...props }) => {
    const navigate = useNavigate();
    const onChange = (v, field) => {


    }

    const edit = () => {
        console.log(props)
        if (!props?.parameters?.palete?.SDHNUM_0 && !props?.parameters?.palete?.carga_id) {
            return true;
        } else {
            permission.isOk({ item: "embalamento", action: "edit" })
        }
    }

    const leftContent = (<>
        <Space>
            {/* {modeEdit?.formPaletizacao && <Button disabled={(!edit() || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={() => changeMode('formPaletizacao')} />}
            {!modeEdit?.formPaletizacao && <Button disabled={(!edit() || submitting.state)} icon={<EditOutlined />} onClick={() => changeMode('formPaletizacao')}>Editar</Button>}
            {(modeEdit?.formPaletizacao && dirty) && <Button type="primary" disabled={submitting.state} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>} */}
        </Space>
        <LeftToolbar />
    </>);

    const rightContent = (
        <Space>
            <RightToolbar permission={permission} edit={(!props?.parameters?.palete?.SDHNUM_0 && !props?.parameters?.palete?.carga_id)} />
        </Space>
    );
    return (
        <div style={{ marginBottom: "5px" }}>
            <Toolbar left={leftContent} right={rightContent} />
        </div>
    );
}

const FormPaletizacaoSchema = ({ record, form, forInput = false }) => {

    useEffect(() => {
        //console.log("aaaaaaaaaaaaa",form.getFieldsValue(true))
    });

    const getItem = (item) => {
        //console.log("ooooooooooooooooooooooooooooo",form.getFieldsValue(true))
        return form.getFieldValue(["details", item.name, "item_id"]);
    }

    return (
        <Form.List name={["details"]}>
            {(fields, { add, remove, move }) => {
                const addRow = (fields) => {
                    add({ item_id: 1, item_paletesize: '970x970', item_numbobines: 10 }, 0);
                }
                const removeRow = (fieldName) => {
                    remove(fieldName);
                }
                const moveRow = (from, to) => {
                    move(from, to);
                }
                return (
                    <Container fluid style={{ padding: "0px", marginTop: "15px" }}>
                        <Row nogutter>
                            <Col style={{ alignSelf: "center" }}>
                                <Container fluid style={{ padding: "0px" }}>
                                    <Row><Col>{forInput && <Button type="dashed" onClick={() => addRow(fields)} style={{ width: "100%" }}><PlusOutlined />Adicionar</Button>}</Col></Row>
                                    {fields.map((itemField, index) => (
                                        <Row key={`p-sch-${index + 1}`} gutterWidth={5}>
                                            <Col width={15}>{forInput && index > 0 && <IconButton onClick={() => moveRow(index, index - 1)} style={{ alignSelf: "center" }}><CgArrowUpO /></IconButton>}</Col>
                                            <Col width={15}>{forInput && index < (fields.length - 1) && <IconButton onClick={() => moveRow(index, index + 1)} style={{ alignSelf: "center" }}><CgArrowDownO /></IconButton>}</Col>
                                            <Col>
                                                <Field wrapFormItem={true} forInput={forInput} forViewBackground={forViewBackground} label={{ enabled: false }} name={[itemField.name, "item_id"]}>
                                                    <Selector
                                                        size="small"
                                                        toolbar={false}
                                                        title="Items de Embalamento"
                                                        popupWidth={350}
                                                        params={{ payload: { data: { rows: PALETIZACAO_ITEMS }, pagination: { limit: 30 } } }}
                                                        keyField={["key"]}
                                                        textField="value"
                                                        columns={[{ key: 'key', name: 'Item', formatter: p => p.row.value }]}
                                                    />
                                                </Field>
                                            </Col>
                                            <Col width={100}>
                                                {getItem(itemField) === 1 && <Field forInput={forInput} forViewBackground={forViewBackground} label={{ enabled: false }} name={[itemField.name, "item_paletesize"]}>
                                                    <SelectField size="small" data={PALETE_SIZES} keyField="key" textField="value" />
                                                </Field>
                                                }
                                                {getItem(itemField) === 2 && <Field forInput={forInput} forViewBackground={forViewBackground} label={{ enabled: false }} name={[itemField.name, "item_numbobines"]}>
                                                    <InputNumber size="small" min={1} max={80} />
                                                </Field>
                                                }
                                                {(getItem(itemField) > 2 || getItem(itemField) === undefined) && <></>}
                                            </Col>
                                            <Col width={15}>{forInput && <IconButton onClick={() => removeRow(itemField.name)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton>}</Col>
                                        </Row>
                                    ))}
                                </Container>
                            </Col>
                            <Col>
                                <SvgSchema form={form} items={form.getFieldsValue(true)} />
                            </Col>
                        </Row>
                    </Container>
                )
            }}
        </Form.List>
    );
}

const forViewBackground = true;
const FormPaletizacao = ({ record, form, forInput = false }) => {
    return (
        <Container fluid style={{ padding: "0px" }}>
            <Row gutterWidth={5}>
                <Col xs={4}><Field forInput={forInput} forViewBackground={forViewBackground} label={{ enabled: true, text: "Paletes/Contentor", pos: "right", width: "150px" }} name={[`npaletes`]}><InputNumber size="small" min={1} max={150} /></Field></Col>
                <Col xs={4}><Field forInput={forInput} forViewBackground={forViewBackground} label={{ enabled: true, text: "Etiqueta/Bobine", pos: "right", width: "150px" }} name={[`netiquetas_bobine`]}><InputNumber size="small" min={1} max={10} /></Field></Col>
                <Col xs={4}><Field forInput={forInput} forViewBackground={forViewBackground} label={{ enabled: true, text: "Filme Estirável/Palete", pos: "right", width: "170px" }} name={[`filmeestiravel_bobines`]}><CheckboxField /></Field></Col>
            </Row>
            <Row gutterWidth={5}>
                <Col xs={4}><Field forInput={forInput} forViewBackground={forViewBackground} label={{ text: "Altura Máx. Palete", pos: "right", width: "150px" }} name={["palete_maxaltura"]}><InputNumber size="small" min={1} max={150} addonAfter="m" /></Field></Col>
                <Col xs={4}><Field forInput={forInput} forViewBackground={forViewBackground} label={{ text: "Etiqueta da Palete", pos: "right", width: "150px" }} name={["netiquetas_lote"]}><InputNumber size="small" min={1} max={10} /></Field></Col>
                <Col xs={4}><Field forInput={forInput} forViewBackground={forViewBackground} label={{ text: "Filme Estirável Exterior", pos: "right", width: "170px" }} name={["filmeestiravel_exterior"]}><CheckboxField /></Field></Col>
            </Row>
            <Row gutterWidth={5}>
                <Col xs={4}><Field forInput={forInput} forViewBackground={forViewBackground} required={false} name={["paletes_sobrepostas"]} label={{ enabled: true, text: "Paletes Sobrepostas", pos: "right", width: "150px" }}><CheckboxField disabled={true} /></Field></Col>
                <Col xs={4}><Field forInput={forInput} forViewBackground={forViewBackground} label={{ text: "Etiqueta Final da Palete", pos: "right", width: "150px" }} name={["netiquetas_final"]}><InputNumber size="small" min={1} max={10} /></Field></Col>
            </Row>
            <Row gutterWidth={5}>
                <Col width={20}><Field forInput={forInput} forViewBackground={forViewBackground} label={{ enabled: false }} name={["cintas"]}><CheckboxField /></Field></Col>
                <Col width={100}>
                    <Form.Item noStyle style={{ width: "100%" }} shouldUpdate={(prevValues, curValues) => prevValues?.cintas !== curValues?.cintas}>
                        {() => <Field forInput={forInput} forViewBackground={forViewBackground} name={["ncintas"]} label={{ enabled: true, width: "50px", text: "Cintas", pos: "right", colon: false }}>
                            <InputNumber style={{ width: "45px" }} disabled={form.getFieldValue(["cintas"]) !== 1} size="small" min={1} max={10} />
                        </Field>
                        }
                    </Form.Item>
                </Col>
                <Col width={150}>
                    <Form.Item noStyle style={{ width: "100%" }} shouldUpdate={(prevValues, curValues) => prevValues?.cintas !== curValues?.cintas}>
                        {() => <Field forInput={forInput} forViewBackground={forViewBackground} name={["cintas_palete"]} label={{ enabled: false }}>
                            <SelectField size="small" data={CINTASPALETES_OPTIONS} keyField="value" textField="label" disabled={form.getFieldValue(["cintas"]) !== 1} />
                        </Field>
                        }
                    </Form.Item>
                </Col>
                <Col xs={4}><Field forInput={forInput} forViewBackground={forViewBackground} label={{ text: "Folha Identificativa", pos: "left", width: "180px" }} name={["folha_identificativa"]}><InputNumber size="small" min={0} max={10} /></Field></Col>
            </Row>
        </Container>
    );
}

const loadPaletizacao = async ({ id, of_id }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, pagination: { limit: 1 }, filter: { id, of_id }, parameters: { method: "GetPaletizacao" } });
    return rows;
}

export default ({ setFormTitle, operationsRef, ...props }) => {
    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();

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


    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, [props?.parentUpdated]);

    useEffect(() => {
        setMode(v => ({ ...v, form: { ...v.form, edit: permission.isOk(PERMISSION) && props?.editParameters?.editKey === EDITKEY } }));
    }, [props?.editParameters?.editKey]);

    const loadData = async ({ signal, init } = {}) => {
        submitting.trigger();
        setFormDirty(false);
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
        }
        if (inputParameters.current?.paletizacao_id || inputParameters.current?.temp_ofabrico) {
            const _rows = await loadPaletizacao({ of_id: inputParameters.current?.temp_ofabrico, id: inputParameters.current?.paletizacao_id });
            if (_rows && _rows.length > 0) {
                form.setFieldsValue({ ..._rows[0] });
            }
            //     console.log("load paletizacao", inputParameters.current)
            // form.setFieldsValue({ formulacao_plan: nullIfEmpty({ ...pickAll([{ formulacao_plan_id: "plan_id" }, { fplan_designacao: "designacao" }, { fplan_idx: "idx" }, { fplan_cliente_nome: "cliente_nome" }, { fplan_group_name: "group_name" }, { fplan_subgroup_name: "subgroup_name" }], inputParameters.current) }) });
            // setFormulacao({ ...inputParameters.current, tstamp: Date.now() });
        } else {

        }

        submitting.end();
        return;


        /*if (!permission.allow()) {
            Modal.error({ content: "Não tem permissões!" });
            return;
        } */

        const { ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, { ...props?.parameters }, location?.state, [...Object.keys({ ...location?.state }), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys({ ...props?.parameters })]);
        const formValues = await loadPaletizacaoLookup(initFilters.palete_id);
        //form.setFieldsValue(formValues.length > 0 ? { ...formValues[0], timestamp: dayjs(formValues[0].timestamp), IPTDAT_0: dayjs(formValues[0].IPTDAT_0) } : {});
        if (formValues.length > 0) {
            form.setFieldsValue(json(formValues[0].paletizacao));
            //dataAPIArtigos.setRows(formValues[0].artigo);
        }
        console.log("FORMPALETIZACAO####", json(formValues[0].paletizacao), initFilters);
        /*let { filterValues, fieldValues } = fixRangeDates([], initFilters);
        formFilter.setFieldsValue({ ...fieldValues });
        dataAPI.addFilters({ ...filterValues }, true, false);
        dataAPI.setSort(defaultSort);
        dataAPI.addParameters(defaultParameters, true, false);
        dataAPI.fetchPost({
            signal, rowFn: async (dt) => {
                submitting.end();
                return dt;
            }
        });*/
        console.log("propssssss", props)
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
        setDirty(true);
        if ("details" in changedValues) {
            let idx = changedValues.details.length - 1;
            if (changedValues.details[idx]?.item_id) {
                if (changedValues.details[idx].item_id.key === 2) {
                    //default value
                    form.setFieldValue(["details", idx, "item_numbobines"], 1);
                }
                if (changedValues.details[idx].item_id.key === 1) {
                    //default value
                    form.setFieldValue(["details", idx, "item_paletesize"], PALETE_SIZES[0].key);
                }
                form.setFieldValue(["details", idx, "item_id"], changedValues.details[idx].item_id.key);
            }
        }
    }

    return (
        <>
            <ToolbarTable {...props} parameters={inputParameters.current} submitting={submitting} />
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-FP" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={false} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col width={800} >
                        <FormPaletizacao form={form} forInput={false} /* record={_values[index].paletizacao} */ />
                    </Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col width={800}>
                        <FormPaletizacaoSchema form={form} forInput={mode.form.edit} /* record={_values[index].paletizacao} */ />
                    </Col>
                </Row>
                {(operationsRef && props?.activeTab == '9') && <Portal elId={operationsRef.current}>
                    <></>
                    {/* <Edit permissions={permission} {...PERMISSION} editable={props?.editParameters?.isEditable(false)} {...props?.editParameters} resetData={loadData} /> */}
                </Portal>
                }
            </FormContainer>
        </>
    );

}
