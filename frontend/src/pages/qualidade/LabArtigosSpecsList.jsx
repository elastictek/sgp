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
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { json, excludeObjectKeys } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, BarsOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor, LabParametersUnitEditor, MetodoOwnerTableEditor, InputTableEditor, BooleanTableEditor, ClientesTableEditor, ArtigosTableEditor, StatusTableEditor, ObsTableEditor, LabMetodosTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, Status, TextAreaViewer, MetodoOwner, Link, DateTime, Favourite, Valid, MetodoAging } from 'components/TableColumns';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
const LabArtigoSpecsParametersList = lazy(() => import('./LabArtigoSpecsParametersList'));
// import { isPrivate, LeftUserItem } from './commons';


const title = "Especificações dos Artigos";
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
        "designacao": Joi.string().label("Designação").required(),
        "cliente_nome": Joi.string().label("Cliente").required(),
        "des": Joi.string().label("Artigo").required()
    }, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, auth, num, v, ...props }) => {
    return (<>
        {true && <>
            <Col width={200}>
                <Field name="fdes" shouldUpdate label={{ enabled: true, text: "Designação", pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear />
                </Field>
            </Col>
            <Col width={200}>
                <Field name="fartigo_cod" shouldUpdate label={{ enabled: true, text: "Artigo Cód.", pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear />
                </Field>
            </Col>
            <Col width={200}>
                <Field name="fcliente" shouldUpdate label={{ enabled: true, text: "Cliente", pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear />
                </Field>
            </Col>
        </>}
    </>
    );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    { fdes: { label: "Designação", field: { type: 'input', size: 'small' }, span: 24 } },
    { fartigo_cod: { label: "Artigo Cód.", field: { type: 'input', size: 'small' }, span: 12 }, fartigo_des: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcliente: { label: "Cliente", field: { type: 'input', size: 'small' }, span: 12 } },
    /*{ fcod: { label: "Artigo Cód.", field: { type: 'input', size: 'small' }, span: 8 }, fdes: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span: 16 } }, */
];


export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "quality", item: "metodos" });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: false, add: false } });
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
    const defaultParameters = { method: "ListLabArtigosSpecs" };
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props?.id, payload: { url: `${API_URL}/qualidade/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters } });
    const submitting = useSubmitting(true);

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "textarea": return <TextAreaViewer parameters={modalParameters.parameters} />;
                case "parameters": return <LabArtigoSpecsParametersList loadParentData={modalParameters?.loadParentData} parameters={modalParameters.parameters} />;
                //case "content": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal lazy={modalParameters?.lazy} responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onOpenParameters = ({ id, designacao, valid, artigo_id, cliente_cod }) => {
        setModalParameters({ content: "parameters", type: "drawer", width: "95%", title: `Especificações ${designacao}`, push: false, loadParentData: () => dataAPI.update(true), lazy: true, parameters: { id, valid, artigo_id, cliente_cod } });
        showModal();
    }



    const columnEditable = (v, { data, name }) => {
        if (["designacao", "lab_metodo", "status", "obs", "reference", "cliente_nome", "des"].includes(name) && (mode.datagrid.add && data?.rowadded === 1)) {
            return true;
        }
        if (["designacao", "status", "obs", "reference", "cliente_nome", "des"].includes(name) && (mode.datagrid.edit)) {
            return true;
        }
        return false;
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        if (dataAPI.getFieldStatus(data[dataAPI.getPrimaryKey()])?.[name]?.status === "error") {
            return tableCls.error;
        }
        if (["designacao", "lab_metodo", "status", "obs", "reference", "cliente_nome", "des"].includes(name) && (mode.datagrid.add && data?.rowadded === 1)) {
            return tableCls.edit;
        }
        if (["designacao", "status", "obs", "reference", "cliente_nome", "des"].includes(name) && (mode.datagrid.edit)) {
            return tableCls.edit;
        }
    };

    const groups = [
        //{ name: 'name', header: 'Header', headerAlign: "center" }
    ]
    const columns = [
        ...(true) ? [{ name: 'designacao', header: 'Designação', editable: columnEditable, renderEditor: (props) => <InputTableEditor inputProps={{}} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, minWidth:200, headerAlign: "center", render: ({ data, cellProps }) => <Link cellProps={cellProps} onClick={() => onOpenParameters(data)} value={data?.designacao} /> }] : [],
        ...(true) ? [{ name: 'lab_metodo', header: 'Método', editable: columnEditable, renderEditor: (props) => <LabMetodosTableEditor dataAPI={dataAPI} {...props} />, cellProps: { className: columnClass }, render: ({ cellProps, data }) => cellProps.inEdit ? <></> : data?.metodo_designacao, userSelect: true, defaultLocked: false, minWidth:200, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'des', header: 'Artigo', editable: columnEditable, renderEditor: (props) => <ArtigosTableEditor dataAPI={dataAPI} {...props} />, cellProps: { className: columnClass }, render: ({ cellProps, data }) => cellProps.inEdit ? <></> : <div>{data?.cod} <span style={{ fontWeight: 700 }}>{data?.des}</span></div>, userSelect: true, defaultLocked: false, minWidth:250, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'cliente_nome', header: 'Cliente', editable: columnEditable, renderEditor: (props) => <ClientesTableEditor dataAPI={dataAPI} {...props} />, cellProps: { className: columnClass }, render: ({ cellProps, data }) => cellProps.inEdit ? <></> : data?.cliente_nome, userSelect: true, defaultLocked: false, minWidth:200, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'owner', header: 'Owner', editable: columnEditable, render: ({ data, cellProps }) => <MetodoOwner cellProps={cellProps} value={data?.owner} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'aging', header: 'Aging', editable: columnEditable, render: ({ data, cellProps }) => <MetodoAging cellProps={cellProps} value={data?.aging} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 120, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'status', header: 'Estado', editable: columnEditable, renderEditor: (props) => <StatusTableEditor {...props} genre="m" checkbox={true} />, render: ({ data, cellProps }) => <Status cellProps={cellProps} value={data?.status} genre="m" />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{
            name: 'reference', header: 'Referência', editable: columnEditable, userSelect: true, defaultLocked: false,headerAlign: "center",
            width: 90,
            renderEditor: (props) => <BooleanTableEditor {...props} genre="m" checkbox={true} />,
            cellProps: { className: columnClass },
            render: ({ data }) => <Favourite value={data?.reference} />
        }] : [],
        ...(true) ? [{ name: 'obs', header: 'Observações', editable: columnEditable, 
        renderEditor: (props) => <ObsTableEditor dataAPI={dataAPI} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 't_stamp', header: 'Data', editable: columnEditable, cellProps: { className: columnClass }, render: ({ cellProps, data }) => <DateTime value={data?.t_stamp} format={DATETIME_FORMAT} />, userSelect: true, defaultLocked: false, width: 150, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'valid', header: 'Válido', editable: columnEditable, render: ({ data, cellProps }) => <Valid cellProps={cellProps} value={data?.valid} genre="m" />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(permission.isOk({ forInput: [!submitting.state, mode.datagrid.edit], action: "delete" })) ? [{ name: 'bdelete', header: '', headerAlign: "center", userSelect: true, defaultLocked: false, width: 45, render: ({ data, rowIndex }) => <Button onClick={() => onDelete(data, rowIndex)} icon={<DeleteTwoTone twoToneColor="#f5222d" />} /> }] : []
    ];


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, null);
            inputParameters.current = paramsIn;
        }
        setFormDirty(false);
        let { filterValues, fieldValues } = fixRangeDates([], inputParameters.current);
        formFilter.setFieldsValue({ ...fieldValues });
        dataAPI.addFilters({ ...filterValues }, true);
        dataAPI.setSort(dataAPI.getSort(), defaultSort);
        dataAPI.addParameters({ ...defaultParameters }, true);
        submitting.end();
    }

    const onFilterFinish = (type, values) => {
        //Required Filters
        // const _data = { start: values?.fdata?.startValue?.format(DATE_FORMAT), end: values?.fdata?.endValue?.format(DATE_FORMAT) };
        // const { errors, warnings, value, messages, ...status } = getStatus(schema().validate(_data, { abortEarly: false, messages: validateMessages, context: {} }));
        // if (errors > 0) {
        //     openNotification("error", 'top', "Notificação", messages.error);
        // } else {
        //     if (warnings > 0) {
        //         openNotification("warning", 'top', "Notificação", messages.warning);
        //     }
        //}
        switch (type) {
            case "filter":
                //remove empty values
                const vals = dataAPI.removeEmpty({ ...defaultFilters, ...values });
                const _values = {
                    ...vals,
                    fdes: getFilterValue(vals?.fdes, 'any'),
                    fartigo_cod: getFilterValue(vals?.fartigo_cod, 'any'),
                    fartigo_des: getFilterValue(vals?.fartigo_des, 'any'),
                    fcliente: getFilterValue(vals?.fcliente, 'any'),
                    //fcod: getFilterValue(vals?.fcod, 'any'),
                    //fdes: getFilterValue(vals?.fdes, 'any'),
                    //f1: getFilterValue(vals?.f1, 'any'),
                    //f2: getFilterRangeValues(vals?.f2?.formatted)
                };
                dataAPI.addFilters(dataAPI.removeEmpty(_values));
                dataAPI.addParameters(defaultParameters);
                dataAPI.first();
                dataAPI.setAction("filter", true);
                dataAPI.update(true);
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onEditComplete = ({ value, columnId, rowIndex, data, ...rest }) => {
        //const index = dataAPI.getIndex(data);
        const index = rowIndex;
        if (index >= 0) {
            let _rows = [];
            if (columnId === "cliente_nome") {
                _rows = dataAPI.updateValues(index, columnId, { [columnId]: value?.BPCNAM_0, "cliente_cod": value?.BPCNUM_0 });
            } else if (columnId === "des") {
                _rows = dataAPI.updateValues(index, columnId, { [columnId]: value?.des, "artigo_id": value?.id, "cod": value?.cod });
            } else if (columnId === "lab_metodo") {
                _rows = dataAPI.updateValues(index, columnId, { ...!data?.designacao && { designacao: `${dayjs().format(DATE_FORMAT_NO_SEPARATOR)} ${value?.designacao}` }, "metodo_designacao": value?.designacao, "lab_metodo_id": value?.id, "cliente_nome": value?.cliente_nome, "des": value?.des, "owner": value?.owner, "aging": value?.aging });
            } else {
                _rows = dataAPI.updateValues(index, columnId, { [columnId]: value });
            }
            dataAPI.validateRows(rowSchema, {}, {}, _rows);
            // const { errors, warnings, fieldStatus, formStatus } = dataAPI.validateField(rowSchema, data[dataAPI.getPrimaryKey()], columnId, value, index, gridStatus);
            // setGridStatus({ errors, warnings, fieldStatus, formStatus });
        }
    }

    const onSave = async (type) => {
        //const rows = dataAPI.dirtyRows().map(({ id, group }) => ({ artigo_id: id, group }));
        const rows = dataAPI.dirtyRows();
        if (rows && rows.length > 0) {
            submitting.trigger();
            let response = null;
            try {
                const status = dataAPI.validateRows(rowSchema); //Validate all rows
                const msg = dataAPI.getMessages();
                //const msg = ["Error 1"];
                //msg.push("Error 2");
                //openNotification("error", "top", "Notificação", msg, 5, { width: "500px" });
                //if (status.errors > 0) {
                //    openNotification("error", "top", "Notificação", msg, 5, { width: "500px" });
                //}
                if (status.errors > 0) {
                    openNotification("error", "top", "Notificação", msg.error, 5, { width: "500px" });
                } else {
                    response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "UpdateLabArtigoSpecs", rows } });
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

    const onAddSave = async (type) => {
        const rows = dataAPI.dirtyRows();
        if (rows && rows.length > 0) {
            submitting.trigger();
            let response = null;
            try {
                const status = dataAPI.validateRows(rowSchema); //Validate all rows
                const msg = dataAPI.getMessages();
                if (status.errors > 0) {
                    openNotification("error", "top", "Notificação", msg.error, 5, { width: "500px" });
                } else {
                    response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "NewLabArtigoSpecs", data: excludeObjectKeys(rows[0], []) } });
                    if (response.data.status !== "error") {
                        dataAPI.setAction("load", true);
                        dataAPI.update(true);
                        setMode((prev) => ({ ...prev, datagrid: { ...mode?.datagrid, add: false } }));
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
    const onAdd = (cols) => {
        dataAPI.addRow({ ...cols, status: 1, reference: 0 }, null, 0);
    }
    const onDelete = (data, rowIndex) => {
        Modal.confirm({
            content: <div>Tem a certeza que deseja eliminar o método <span style={{ fontWeight: 700 }}>{data?.designacao}</span>?</div>, onOk: async () => {

                submitting.trigger();
                let response = null;
                try {
                    const status = dataAPI.validateRows(rowSchema); //Validate all rows
                    const msg = dataAPI.getMessages();
                    if (status.errors > 0) {
                        openNotification("error", "top", "Notificação", msg.error, 5, { width: "500px" });
                    } else {
                        response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "DeleteLabArtigoSpecs" }, filter: { id: data["id"] } });
                        if (response?.data?.status !== "error") {
                            const _rows = dataAPI.deleteRow({ [dataAPI.getPrimaryKey()]: data?.[dataAPI.getPrimaryKey()] }, [dataAPI.getPrimaryKey()]);
                            dataAPI.setAction("edit", true);
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
        });
    }

    const rowClassName = ({ data }) => {
        // if () {
        //     return tableCls.error;
        // }
    }

    const onValuesChange = (changed, all) => {
        setFormDirty(true);
    }

    const onEditCancel = async () => {
        await loadData();
        return false;
    }

    const onCellAction = (data, column, key) => {
        if (key === "Enter" || key === "DoubleClick") {
            if (column.name === "obs") {
                setModalParameters({ content: "textarea", type: "drawer", width: 550, title: column.header, push: false, parameters: { value: data[column.name] } });
                showModal();
            }
        }
    }

    return (
        <YScroll>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            {/* <FormContainer id="form" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onValuesChange={onValuesChange} wrapFormItem={true} forInput={mode.datagrid.edit} style={{ padding: "0px" }} alert={{ tooltip: true, pos: "none" }}> */}
            {/* <Row style={{}} gutterWidth={10}>
                    <Col xs={2} md={1}><Field name="versao" forInput={false} label={{ enabled: true, text: "Versao" }}><Input /></Field></Col>
                    <Col xs={4} md={2}><FormulacaoGroups name="group_name" label={{ enabled: true, text: "Grupo" }} /></Col>
                    <Col xs={4} md={2}><FormulacaoSubGroups name="subgroup_name" label={{ enabled: true, text: "SubGrupo" }} /></Col>
                    <Col xs={12} md={6} lg={4}><Field name="designacao" label={{ enabled: true, text: "Designação" }}><Input /></Field></Col>
                    <Col xs={12} md={6} lg={4}><Produtos name="produto_id" allowClear label={{ enabled: true, text: "Produto" }} load /></Col>
                    <Col xs={12} md={6} lg={4}><Artigos name="artigo_id" allowClear label={{ enabled: true, text: "Artigo" }} load /></Col>
                    <Col xs={12} md={6} lg={4}><Clientes name="cliente" allowClear label={{ enabled: true, text: "Cliente" }} /></Col>

                </Row> */}
            {/* <Row style={{}} nogutter>
                    <Col> */}
            <Table
                dirty={formDirty}
                loading={submitting.state}
                idProperty={dataAPI.getPrimaryKey()}
                local={false}
                onRefresh={loadData}
                rowClassName={rowClassName}
                //groups={groups}
                sortable
                editOnClick={true}
                reorderColumns={false}
                showColumnMenuTool
                loadOnInit={true}
                pagination="remote"
                defaultLimit={20}
                columns={columns}
                dataAPI={dataAPI}
                moreFilters={true}
                onCellAction={onCellAction}
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} auth={permission.auth} v={formFilter.getFieldsValue(true)} />,
                    moreFilters: { schema: moreFiltersSchema }
                }}
                editable={{
                    enabled: permission.isOk({ forInput: [!submitting.state], action: "edit" }),
                    add: permission.isOk({ forInput: [!submitting.state], action: "edit" }),
                    onAdd: onAdd, onAddSave: onAddSave,
                    onSave: () => onSave("update"), onCancel: onEditCancel,
                    modeKey: "datagrid", setMode, mode, onEditComplete
                }}

            />
            {/* </Col>
                </Row>
            </FormContainer> */}
        </YScroll>
    );


};