import React, { useEffect, useState, useCallback, useRef, useContext, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { uid } from 'uid';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, sleep } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay, getFloat } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch } from "antd";
const { TextArea } = Input;
import Toolbar from "components/toolbar";
const { Title } = Typography;
import { json, excludeObjectKeys } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, BarsOutlined, ExperimentOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor, LabParametersUnitEditor, MetodoOwnerTableEditor, InputTableEditor, BooleanTableEditor, ClientesTableEditor, ArtigosTableEditor, StatusTableEditor, ObsTableEditor, LabMetodosTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, Status, TextAreaViewer, MetodoOwner, Link, DateTime, Favourite, Valid, Nonwovens, ArrayColumn, EstadoBobine, Largura, Core, Delete } from 'components/TableColumns';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";


const title = "Validar Bobinagem";
const TitleForm = ({ data, onChange, level, auth, form }) => {
    return (<ToolbarTitle id={auth?.user} description={title} title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }} wrap="nowrap" nogutter>
                <Col xs='content' style={{}}><Row nogutter><Col title={title} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}><span style={{}}>{title}</span></Col></Row></Col>
                {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
            </Row>

        </Col>
    </>
    }
    />);
}
const useStyles = createUseStyles({});
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const rowSchema = (options = {}) => {
    return getSchema({
        // "matprima_des":
        //     Joi.alternatives(
        //         Joi.string(),
        //         Joi.object().keys({
        //             ITMREF_0: Joi.string().label("Matéria Prima").required()//alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
        //         }).unknown(true)).label("Matéria Prima").required(),
        //"designacao": Joi.string().label("Designação").required(),
        //"cliente_nome": Joi.string().label("Cliente").required(),
        //"des": Joi.string().label("Artigo").required()
    }, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, auth, num, v, ...props }) => {
    return (<>
        {true && <>
            <Col width={200}>
                <Field name="flote" shouldUpdate label={{ enabled: true, text: "Lote", pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear />
                </Field>
            </Col>
            <Col xs='content'>
                <Field name="fdata" label={{ enabled: true, text: "Data", pos: "top", padding: "0px" }}>
                    <RangeDateField size='small' allowClear />
                </Field>
            </Col>
            {/* <Col width={200}>
                <Field name="fartigo_cod" shouldUpdate label={{ enabled: true, text: "Artigo Cód.", pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear />
                </Field>
            </Col>
            <Col width={200}>
                <Field name="fcliente" shouldUpdate label={{ enabled: true, text: "Cliente", pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear />
                </Field>
            </Col> */}
        </>}
    </>
    );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    { flote: { label: "Lote", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data", field: { type: "rangedate", size: 'small' } } },
];

const Actions = ({ data, rowIndex, onAction }) => {

    const items = [
        {
            key: 'Histerese',
            icon: <ExperimentOutlined />,
            label: "Carregar teste de Histerese",
        },
        {
            key: 'Tração',
            icon: <ExperimentOutlined />,
            label: "Carregar teste de Tração",
        },
        {
            key: 'Peel',
            icon: <ExperimentOutlined />,
            label: "Carregar teste de Peel",
        },
    ];

    return (
        <Dropdown menu={{ items, onClick: onAction }} placement="bottomLeft" trigger={["click"]}>
            <Button icon={<EllipsisOutlined />} />
        </Dropdown>
    );
}



const loadBobinesLookup = async (bobinagem_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobines/sql/`, pagination: {}, filter: { fbobinagemid: `==${bobinagem_id}` }, parameters: { method: "BobinesLookup" } });
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
        {/* <LeftToolbar permission={permission} /> */}
    </>);

    const rightContent = (
        <Space>
            {/* <RightToolbar permission={permission}/> */}
        </Space>
    );
    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}


export default ({ setFormTitle, noid = false, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "bobinagens", item: "validar" });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: true, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});
    const [form] = Form.useForm();

    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ ...(!noid && { id: props?.id }), /* fnPostProcess: (dt) => postProcess(dt, submitting), */ payload: { primaryKey: "id" } });
    const submitting = useSubmitting(true);
    //const [columns, setColumns] = useState([]);
    const columnsRef = useRef([]);
    const [lastTab, setLastTab] = useState('1');


    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        /*if (!permission.allow()) {
            Modal.error({ content: "Não tem permissões!" });
            return;
        } */

        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, null);
            inputParameters.current = { ...paramsIn };
            console.log("IN--->", paramsIn);
        }
        const _bobines = await loadBobinesLookup(inputParameters.current.bobinagem_id);
        inputParameters.current = { ...inputParameters.current, produto: _bobines[0]?.produto, agg_of_id: _bobines[0]?.agg_of_id };
        //console.log("AFTER--->", _bobines)
        setFormDirty(false);
        dataAPI.setData({ rows: _bobines, total: _bobines?.length });
        // let { filterValues, fieldValues } = fixRangeDates([], inputParameters.current?.filter);
        // formFilter.setFieldsValue({ ...excludeObjectKeys(fieldValues, []) });
        // dataAPI.setBaseFilters({ /* fordem_id: filterValues?.fordem_id */ });
        // dataAPI.addFilters({ ...excludeObjectKeys(filterValues, []) }, true);
        // dataAPI.setSort(dataAPI.getSort(), defaultSort);
        // dataAPI.addParameters({ ...defaultParameters }, true);
        // dataAPI.setAction("init", true);
        // dataAPI.update(true);
        submitting.end();
        return;

        const { ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, { ...props?.parameters }, location?.state, [...Object.keys({ ...location?.state }), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys({ ...props?.parameters })]);
        console.log()
        return;

        form.setFieldsValue(formValues.length > 0 ? { ...formValues[0], timestamp: moment(formValues[0].timestamp), IPTDAT_0: moment(formValues[0].IPTDAT_0) } : {});
        if (formValues.length > 0 && formValues[0]?.artigo) {
            dataAPIArtigos.setRows(formValues[0].artigo);
        }
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

    const rowClassName = ({ data }) => {
        // if () {
        //     return tableCls.error;
        // }
    }
    const columnEditable = (v, { data, name }) => {
        /* if (["designacao", "lab_metodo", "status", "obs", "reference", "cliente_nome", "des"].includes(name) && (mode.datagrid.add && data?.rowadded === 1)) {
            return true;
        }*/
        if (["l_real"].includes(name) && (mode.datagrid.edit)) {
            return true;
        }
        return false;
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        /* if (dataAPI.getFieldStatus(data[dataAPI.getPrimaryKey()])?.[name]?.status === "error") {
            return tableCls.error;
        }
        if (["nws"].includes(name)) {
            return tableCls.cellPadding1;
        } */
        // if (["designacao", "lab_metodo", "status", "obs", "reference", "cliente_nome", "des"].includes(name) && (mode.datagrid.add && data?.rowadded === 1)) {
        //     return tableCls.edit;
        // }
        if (["l_real"].includes(name) && (mode.datagrid.edit)) {
            return tableCls.edit;
        }
    };

    const onEditComplete = ({ value, columnId, rowIndex, data, ...rest }) => {
        //const index = dataAPI.getIndex(data);
        const index = rowIndex;
        if (index >= 0) {
            let _rows = [];
            _rows = dataAPI.updateValues(index, columnId, { [columnId]: value });
            dataAPI.validateRows(rowSchema, {}, {}, _rows);
            //// const { errors, warnings, fieldStatus, formStatus } = dataAPI.validateField(rowSchema, data[dataAPI.getPrimaryKey()], columnId, value, index, gridStatus);
            //// setGridStatus({ errors, warnings, fieldStatus, formStatus });
        }
    }
    const onEditCancel = async () => {
        await loadData();
        return false;
    }

    const onCellAction = (data, column, key) => {
        if (key === "Enter" || key === "DoubleClick") {
            //if (column.name === "obs") {
            //    setModalParameters({ content: "textarea", type: "drawer", width: 550, title: column.header, push: false, parameters: { value: data[column.name] } });
            //    showModal();
            // }
        }
    }


    const columns = [
        ...(true) ? [{ name: "nome", header: "Bobine", defaultWidth: 130, userSelect: true, defaultlocked: true, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign cellProps={cellProps}>{data?.nome}</LeftAlign> }] : [],
        ...(true) ? [{ name: "estado", header: "Estado", defaultWidth: 70, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <EstadoBobine id={data.id} nome={data.nome} estado={data.estado} largura={data.lar} cellProps={cellProps} /> }] : [],
        ...(true) ? [{ name: 'area', header: 'Área', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m&sup2;">{getFloat(data?.area, 0)}</RightAlign> }] : [],
        ...(true) ? [{
            name: 'l_real', header: 'Largura Real', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center",
            editable: columnEditable,
            cellProps: { className: columnClass },
            render: ({ data, cellProps }) => <LeftAlign cellProps={cellProps}>{data?.l_real}</LeftAlign>,
            renderEditor: (props) => <InputTableEditor inputProps={{}} {...props} />
        }] : [],
    ];



    return (
        <YScroll>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            <ToolbarTable {...props} submitting={submitting} />
            <FormContainer id="form" wrapForm={true} wrapFormItem={true} fluid loading={submitting.state} style={{ padding: "0px" }}>
                <Row>
                    <Col>
                        <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
                        <Row gutterWidth={5} style={{ marginBottom: "10px" }}>
                            <Col><Field name={inputParameters.current?.agg_of_id ? "produto_cod" : "perfil_nome"} label={{ enabled: true, text: inputParameters.current?.agg_of_id ? "Produto" : "Perfil", padding: "0px" }}><Input style={{ padding: "0px 10px" }} /></Field></Col>
                            <Col xs="content"><Field name="data" label={{ enabled: true, text: "Data", padding: "0px" }}><DatePicker style={{ padding: "0px 10px" }} showTime={false} format={DATE_FORMAT} /></Field></Col>
                            <Col xs="content"><Field name="inico" label={{ enabled: true, text: "Início", padding: "0px" }}><TimePicker style={{ padding: "0px 10px" }} format={TIME_FORMAT} /></Field></Col>
                            <Col xs="content"><Field name="fim" label={{ enabled: true, text: "Fim", padding: "0px" }}><TimePicker style={{ padding: "0px 10px" }} format={TIME_FORMAT} /></Field></Col>
                            <Col xs="content"><Field name="duracao" label={{ enabled: true, text: "Duração", padding: "0px" }}><Input style={{ padding: "0px 10px" }} /></Field></Col>
                        </Row>



                    </Col>
                    <Col>

                        <Table
                            dirty={formDirty}
                            loading={submitting.state}
                            offsetHeight="150px"
                            idProperty={dataAPI.getPrimaryKey()}
                            local={true}
                            onRefresh={loadData}
                            rowClassName={rowClassName}
                            sortable={false}
                            //cellNavigation={false}
                            reorderColumns={false}
                            showColumnMenuTool={false}
                            onCellAction={onCellAction}
                            editable={{
                                showCancelButton: false,
                                showSaveButton: false,
                                enabled: permission.isOk({ forInput: [!submitting.state], action: "edit" }),
                                add: false,
                                //onAdd: onAdd, onAddSave: onAddSave,
                                onSave: () => onSave("update"), onCancel: onEditCancel,
                                modeKey: "datagrid", setMode, mode, onEditComplete
                            }}
                            columns={columns}
                            dataAPI={dataAPI}
                            moreFilters={false}
                            leftToolbar={false}
                            toolbar={false}
                            toolbarFilters={false}
                        />

                    </Col>
                </Row>
            </FormContainer>

        </YScroll>
    )

}