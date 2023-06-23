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
import { InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor, LabParametersUnitEditor, MetodoOwnerTableEditor, InputTableEditor, NwTableEditor, EstadoTableEditor, BooleanTableEditor, ClientesTableEditor, ArtigosTableEditor, StatusTableEditor, ObsTableEditor, LabMetodosTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, Status, TextAreaViewer, MetodoOwner, Link, DateTime, Favourite, Valid, Nonwovens, ArrayColumn, EstadoBobine, Largura, Core, Delete, NwColumn } from 'components/TableColumns';
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
    return getSchema({
        "lar_bruta": Joi.number().label("Largura bruta").required(),
    }, options).unknown(true);
}
// const rowSchema = (options = {}) => {
//     return getSchema({
//         // "matprima_des":
//         //     Joi.alternatives(
//         //         Joi.string(),
//         //         Joi.object().keys({
//         //             ITMREF_0: Joi.string().label("Matéria Prima").required()//alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
//         //         }).unknown(true)).label("Matéria Prima").required(),
//         //"designacao": Joi.string().label("Designação").required(),
//         //"cliente_nome": Joi.string().label("Cliente").required(),
//         //"des": Joi.string().label("Artigo").required()
//     }, options).unknown(true);
// }

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
        <Space>
            {/* {modeEdit?.formPalete && <Button disabled={(!allowEdit.formPalete || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={()=>changeMode('formPalete')} />}
            {!modeEdit?.formPalete && <Button disabled={(!allowEdit.formPalete || submitting.state)} icon={<EditOutlined />} onClick={()=>changeMode('formPalete')}>Editar</Button>} */}
        </Space>
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



const rowSchema = (options = {}, required = false) => {
    return getSchema({
        comp: Joi.number().label("Comprimento"),
        troca_nw: Joi.number().label("Troca de Nonwoven"),
        lar: Joi.number().required().label("Largura"),
        estado: Joi.string().required().label("Estado"),
        vcr_num_inf: Joi.string().required().label("O Nonwoven inferior é obrigatório preencher."),
        vcr_num_sup: Joi.string().required().label("O Nonwoven superior é obrigatório preencher."),
        comp_emenda: Joi.when(Joi.ref('troca_nw'), {
            is: Joi.number().valid(1),
            then: Joi.number().min(1).max(Joi.ref('comp')).required()
                .messages({
                    'number.base': 'O comprimento da emenda tem de ser preenchido.',
                    'number.empty': 'O comprimento da emenda  tem de ser preenchido.',
                    'number.min': 'O comprimento da emenda tem de ser maior que zero',
                    'number.max': 'O comprimento da emenda tem de ser menor que o comprimento',
                    'any.required': 'O comprimento da emenda tem de ser preenchido.'
                }),
            otherwise: Joi.optional()
        }),
        l_real: Joi.when(Joi.ref('estado'), {
            is: Joi.string().valid('BA'),
            then: Joi.number().min(Joi.ref('lar', { adjust: val => val - 10 })).max(Joi.ref('lar', { adjust: val => val + 10 })).required()
                .messages({
                    'number.base': 'A largura real tem de ser um número válido',
                    'number.empty': 'A largura real não pode ser vazia',
                    'number.min': 'A largura real tem de ser um valor aproximado da largura definida [-10,+10]',
                    'number.max': 'A largura real tem de ser um valor aproximado da largura definida [-10,+10]',
                    'any.required': 'A largura real é obrigatória quando o estado é "BA"'
                })
            //,otherwise: Joi.optional()
        }).concat(
            Joi.when(Joi.ref('$num'), {
                is: Joi.number().multiple(10),
                then: Joi.number().min(Joi.ref('lar', { adjust: val => val - 10 })).max(Joi.ref('lar', { adjust: val => val + 10 })).required()
                    .messages({
                        'number.base': 'A largura real tem de ser preenchida.',
                        'number.empty': 'A largura real tem de ser preenchida.',
                        'number.min': 'A largura real tem de ser um valor aproximado da largura definida [-10,+10]',
                        'number.max': 'A largura real tem de ser um valor aproximado da largura definida [-10,+10]',
                        'any.required': 'A largura real tem de ser preenchida.'
                    }),
                otherwise: Joi.optional()
            })
        )
    }, options).unknown(true);
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
    const defaultSort = [{ column: "queue", direction: "ASC" }];
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
        const _bobines = (await loadBobinesLookup(inputParameters.current.bobinagem_id)).map(v => {
            return {
                ...v,
                inicio: inputParameters.current.bobinagem.inico, fim: inputParameters.current.bobinagem.fim, duracao: inputParameters.current.bobinagem.duracao,
                data: inputParameters.current.bobinagem.data,
                tiponwinf: inputParameters.current.bobinagem.tiponwinf, tiponwsup: inputParameters.current.bobinagem.tiponwsup,
                rowvalid: 0
            }
        });

        inputParameters.current = { ...inputParameters.current, produto: _bobines[0]?.produto, agg_of_id: _bobines[0]?.agg_of_id, largura_bobinagem: _bobines[0]?.largura_bobinagem };
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
        if (["l_real", "comp_emenda", "troca_nw", "vcr_num_inf", "vcr_num_sup", "estado"].includes(name) && (mode.datagrid.edit)) {
            if (name == "comp_emenda") {
                if (data?.troca_nw == 1) {
                    return true;
                } else {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        if (dataAPI.getFieldStatus(data[dataAPI.getPrimaryKey()])?.[name]?.status === "error") {
            return tableCls.error;
        }
        /*if (["nws"].includes(name)) {
            return tableCls.cellPadding1;
        } */
        // if (["designacao", "lab_metodo", "status", "obs", "reference", "cliente_nome", "des"].includes(name) && (mode.datagrid.add && data?.rowadded === 1)) {
        //     return tableCls.edit;
        // }
        if (["l_real", "comp_emenda", "troca_nw", "vcr_num_inf", "vcr_num_sup", "estado"].includes(name) && (mode.datagrid.edit)) {
            if (name == "comp_emenda") {
                if (data?.troca_nw == 1) {
                    return tableCls.edit;
                } else {
                    return null;
                }
            }
            return tableCls.edit;
        }
    };

    const onSave = async (type) => {
        //const rows = dataAPI.dirtyRows().map(({ id, group }) => ({ artigo_id: id, group }));
        const _values = form.getFieldsValue(true);
        const v = schema().validate(_values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);
        if (errors === 0) {
            if (inputParameters.current.largura_bobinagem > _values.lar_bruta || _values.lar_bruta > (inputParameters.current.largura_bobinagem + 200)) {
                errors = 1;
                status.fieldStatus.lar_bruta = { status: "error", messages: [{ message: "A largura bruta não está dentro dos valores permitidos (não inferior à largura da bobinagem)!" }] };
            }
        }
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        const _rows = dataAPI.getData().rows;
        if (errors == 0 && _rows && _rows.length > 0) {
            submitting.trigger();
            let response = null;
            try {
                const status = dataAPI.validateRows(rowSchema, {}, { context: { num: _rows[0].nome.split('-')[1] } }, _rows); //Validate all rows
                const msg = dataAPI.getMessages();
                if (status.errors > 0) {
                    openNotification("error", "top", "Notificação", msg.error, 5, { width: "500px" });
                } else {
                    response = await fetchPost({ url: `${API_URL}/bobinagens/sql/`, parameters: { method: "Validar", rows: _rows, lar_bruta: _values.lar_bruta } });
                    if (response.data.status !== "error") {
                        dataAPI.update(true);
                        openNotification(response.data.status, 'top', "Notificação", response.data.title);
                    } else {
                        openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
                    }
                }
            } catch (e) {
                console.log(e)
                openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
            } finally {
                submitting.end();
            };
        }
    }

    const onEditComplete = ({ value, columnId, rowIndex, data, ...rest }) => {
        const index = dataAPI.getIndex(data);
        if (index >= 0) {
            let _rows = [];
            if (columnId === "troca_nw") {
                _rows = dataAPI.getData().rows.map(v => {
                    return { ...v, [columnId]: value, ...(value == 0 && { comp_emenda: 0 }), rowvalid: 0 }
                });
                dataAPI.setRows(_rows, _rows.length);
            } else if (columnId === "vcr_num_inf") {
                _rows = dataAPI.getData().rows.map(v => {
                    return {
                        ...v, tiponwinf: value?.artigo_des, lotenwinf: value?.n_lote, vcr_num_inf: value?.vcr_num, rowvalid: 0
                    }
                });
                dataAPI.setRows(_rows, _rows.length);
            } else if (columnId === "vcr_num_sup") {
                _rows = dataAPI.getData().rows.map(v => {
                    return {
                        ...v, tiponwsup: value?.artigo_des, lotenwsup: value?.n_lote, vcr_num_sup: value?.vcr_num, rowvalid: 0
                    }
                });
                dataAPI.setRows(_rows, _rows.length);
            } else if (columnId === "troca_nw" || columnId === "comp_emenda" || columnId === "estado") {
                _rows = dataAPI.getData().rows.map(v => { return { ...v, [columnId]: value, rowvalid: 0 } });
                dataAPI.setRows(_rows, _rows.length);
            } else {
                _rows = dataAPI.updateValues(index, columnId, { [columnId]: value, rowvalid: 0 });
            }
            dataAPI.validateRows(rowSchema, {}, { context: { num: _rows[0].nome.split('-')[1] } }, _rows);
            //const { errors, warnings, fieldStatus, formStatus } = dataAPI.validateField(rowSchema, data[dataAPI.getPrimaryKey()], columnId, value, index, gridStatus);
            //console.log("aaaa",errors, warnings, fieldStatus, formStatus)
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
        ...(true) ? [{ name: 'data', header: 'Data', userSelect: true, defaultLocked: false, defaultWidth: 90, headerAlign: "center", render: ({ cellProps, data }) => <DateTime value={data?.data} format={DATE_FORMAT} /> }] : [],
        ...(true) ? [{ name: "inicio", header: "inicio", defaultWidth: 100, userSelect: true, defaultlocked: true, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign cellProps={cellProps}>{data?.inicio}</LeftAlign> }] : [],
        ...(true) ? [{ name: "fim", header: "fim", defaultWidth: 100, userSelect: true, defaultlocked: true, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign cellProps={cellProps}>{data?.fim}</LeftAlign> }] : [],
        ...(true) ? [{
            name: "estado", header: "Estado", defaultWidth: 70, userSelect: true, defaultlocked: false, headerAlign: "center",
            render: ({ data, cellProps }) => <EstadoBobine id={data.id} nome={data.nome} estado={data.estado} largura={data.lar} cellProps={cellProps} />,
            editable: columnEditable,
            cellProps: { className: columnClass },
            renderEditor: (props) => <EstadoTableEditor filter={(v => v?.value === "DM" || v?.value === "IND" || v?.value === "BA" || v?.value === "LAB")} {...props} />
        }] : [],
        ...(true) ? [{ name: 'troca_nw', header: 'Troca NW', editable: columnEditable, renderEditor: (props) => <BooleanTableEditor {...props} />, render: ({ data, cellProps }) => <Bool cellProps={cellProps} value={data?.troca_nw} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{
            name: 'l_real', header: 'Largura Real', userSelect: true, defaultLocked: false, defaultWidth: 90, headerAlign: "center",
            editable: columnEditable,
            cellProps: { className: columnClass },
            render: ({ data, cellProps }) => <RightAlign cellProps={cellProps} unit="mm">{data?.l_real}</RightAlign>,
            renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0 }} {...props} />
        }] : [],
        ...(true) ? [{
            name: 'comp_emenda', header: 'Comp. Emenda', userSelect: true, defaultLocked: false, defaultWidth: 90, headerAlign: "center",
            editable: columnEditable,
            cellProps: { className: columnClass },
            render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m">{getFloat(data?.comp_emenda, 0)}</RightAlign>,
            renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0 }} {...props} />
        }] : [],
        ...(true) ? [{ name: 'vcr_num_inf', header: 'Nonwoven Inf.', defaultWidth: 150, flex: 1, editable: columnEditable, renderEditor: (props) => <NwTableEditor dataAPI={dataAPI} {...props} filters={{ type: 0, queue: 1, status: 1 }} />, cellProps: { className: columnClass }, render: ({ cellProps, data }) => <NwColumn style={{ fontSize: "10px" }} data={{ data, artigo_des: data?.tiponwinf, n_lote: data?.lotenwinf }} cellProps={cellProps} />, userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'vcr_num_sup', header: 'Nonwoven Sup.', defaultWidth: 150, flex: 1, editable: columnEditable, renderEditor: (props) => <NwTableEditor dataAPI={dataAPI} {...props} filters={{ type: 1, queue: 1, status: 1 }} />, cellProps: { className: columnClass }, render: ({ cellProps, data }) => <NwColumn style={{ fontSize: "10px" }} data={{ data, artigo_des: data?.tiponwsup, n_lote: data?.lotenwsup }} cellProps={cellProps} />, userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'comp', header: 'Comprimento', userSelect: true, defaultLocked: false, defaultWidth: 90, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m">{getFloat(data?.comp, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'area', header: 'Área', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m&sup2;">{getFloat(data?.area, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'core', header: 'Core', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <Core cellProps={cellProps} value={data?.core} /> }] : [],
        ...(true) ? [{ name: 'diam', header: 'Diâmetro', userSelect: true, defaultLocked: false, defaultWidth: 90, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="mm">{getFloat(data?.diam, 0)}</RightAlign> }] : [],
        /* ...(true) ? [{ name: "artigo_cod", header: "Artigo", defaultWidth: 150, userSelect: true, defaultlocked: true, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign cellProps={cellProps}>{data?.artigo_cod}</LeftAlign> }] : [],
        ...(true) ? [{ name: "ofid_bobine", header: "Ordem F.", defaultWidth: 130, userSelect: true, defaultlocked: true, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign cellProps={cellProps}>{data?.ofid_bobine}</LeftAlign> }] : [],
        */

        //...(true) ? [{ name: "designacao_prod", header: "Produto", defaultWidth: 170, flex: 1, userSelect: true, defaultlocked: true, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign cellProps={cellProps}>{data?.designacao_prod}</LeftAlign> }] : [],
    ];



    return (
        <YScroll>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            <FormContainer id="form" form={form} wrapForm={true} wrapFormItem={true} fluid loading={submitting.state} style={{ padding: "0px" }} schema={schema} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} alert={{ tooltip: true, pos: "none" }}>
                {/* <Row nogutter><Col><ToolbarTable {...props} submitting={submitting} /></Col></Row> */}
                <Row>
                    {/*                     <Col>
                        <AlertsContainer  mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
                        <Row gutterWidth={5} style={{ marginBottom: "10px" }}>
                            <Col><Field name={inputParameters.current?.agg_of_id ? "produto_cod" : "perfil_nome"} label={{ enabled: true, text: inputParameters.current?.agg_of_id ? "Produto" : "Perfil", padding: "0px" }}><Input style={{ padding: "0px 10px" }} /></Field></Col>
                            <Col xs="content"><Field name="data" label={{ enabled: true, text: "Data", padding: "0px" }}><DatePicker style={{ padding: "0px 10px" }} showTime={false} format={DATE_FORMAT} /></Field></Col>
                            <Col xs="content"><Field name="inico" label={{ enabled: true, text: "Início", padding: "0px" }}><TimePicker style={{ padding: "0px 10px" }} format={TIME_FORMAT} /></Field></Col>
                            <Col xs="content"><Field name="fim" label={{ enabled: true, text: "Fim", padding: "0px" }}><TimePicker style={{ padding: "0px 10px" }} format={TIME_FORMAT} /></Field></Col>
                            <Col xs="content"><Field name="duracao" label={{ enabled: true, text: "Duração", padding: "0px" }}><Input style={{ padding: "0px 10px" }} /></Field></Col>
                        </Row>



                    </Col> */}
                    <Col>

                        <Table
                            //dirty={formDirty}
                            dirty={true}
                            loading={submitting.state}
                            offsetHeight="180px"
                            {...true && { rowHeight: 35 }}
                            idProperty={dataAPI.getPrimaryKey()}
                            local={true}
                            onRefresh={loadData}
                            rowClassName={rowClassName}
                            sortable={false}
                            //cellNavigation={false}
                            editStartEvent={"click"}
                            reorderColumns={false}
                            showColumnMenuTool={false}
                            onCellAction={onCellAction}
                            editable={{
                                markRows: false,
                                showCancelButton: false,
                                showSaveButton: true,
                                enabled: permission.isOk({ forInput: [!submitting.state], action: "edit" }),
                                add: false,
                                //onAdd: onAdd, onAddSave: onAddSave,
                                onSave: () => onSave("update"), onCancel: onEditCancel,
                                modeKey: "datagrid", setMode, mode, onEditComplete,
                                saveText: "Validar"
                            }}
                            columns={columns}
                            dataAPI={dataAPI}
                            moreFilters={false}
                            leftToolbar={false}
                            startToolbar={
                                <Space style={{ marginRight: "50px" }}>
                                    <Field name="lar_bruta" label={{ enabled: true, text: <div style={{ fontSize: "10px", lineHeight: 1.2 }}><div>Largura bruta</div><div>[{inputParameters.current.largura_bobinagem}mm]</div></div>, pos: "left", width: "80px" }}><InputNumber style={{ textAlign: "right", width: "150px" }} addonAfter="mm" /></Field>
                                </Space>}
                            toolbar={true}
                            toolbarFilters={false}
                        />

                    </Col>
                </Row>
            </FormContainer>

        </YScroll>
    )

}