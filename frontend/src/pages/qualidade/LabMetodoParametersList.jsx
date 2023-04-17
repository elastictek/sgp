import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
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
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, BorderOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor, LabParametersUnitEditor, InputTableEditor, BooleanTableEditor, StatusTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, Status } from 'components/TableColumns';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';


const title = "Parâmetros";
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
        //"unit": Joi.string().label("Unidade").required(),
        //"nvalues": Joi.number().label("Nº Valores").required(),
        //"min_value": Joi.number().max(Joi.ref('max_value')).label("Mínimo").required(),
        //"max_value": Joi.number().label("Máximo").required(),
        //"value_precision": Joi.number().label("Precisão").default(0)
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
        </>}
    </>
    );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    /* { fgroup: { label: "Grupo", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcod: { label: "Artigo Cód.", field: { type: 'input', size: 'small' }, span: 8 }, fdes: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span: 16 } }, */
];


export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "quality", item: "parameters" });//Permissões Iniciais
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
    const defaultParameters = { method: "ListLabMetodosParameters" };
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props?.id, payload: { url: `${API_URL}/qualidade/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters } });
    const submitting = useSubmitting(true);

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "textarea": return <TextAreaViewer parameters={modalParameters.parameters} />;
                case "parameters": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onParametersChooser = () => {
        setModalParameters({
            content: "parameters", responsive: true, type: "drawer", width: 1200, title: "Parâmetros", push: false, loadData: () => { }, parameters: {
                payload: { payload: { url: `${API_URL}/qualidade/sql/`, primaryKey: "id", parameters: { method: "ListLabParameters" }, pagination: { enabled: true }, filter: {}, baseFilter: { status: 1 }, sort: [] } },
                toolbar: false,
                pagination: "remote",
                multipleSelection: true,
                columns: [
                    ...(true) ? [{ name: 'designacao', header: 'Parâmetro', userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
                    ...(true) ? [{ name: 'unit', header: 'Unidade', userSelect: true, defaultLocked: false, width: 150, headerAlign: "center" }] : [],
                    ...(true) ? [{ name: 'nvalues', header: 'Nº Valores', userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
                    ...(true) ? [{ name: 'min_value', header: 'Min', userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
                    ...(true) ? [{ name: 'max_value', header: 'Max', userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
                    ...(true) ? [{ name: 'value_precision', header: 'Precisão', userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
                    ...(true) ? [{ name: 'status', header: 'Estado', render: ({ data }) => <Status value={data?.status} genre="m" />, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
                    ...(true) ? [{ name: 'required', header: 'Obrigatório', render: ({ data }) => <Bool value={data?.required} />, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : []
                ],
                onSelect: onSelectParameters
                // filters: { fofabrico: { type: "any", width: 150, text: "Ordem", autoFocus: true } },
            },

        });
        showModal();
    }

    const onSelectParameters = async ({ data, rows, close }) => {
        console.log(data, rows)
        const _current = dataAPI.getData().rows.map(v => v?.parametro_id);
        const _rows = rows.map(r => ({ parametro_id: r.id, parametro_des: r.designacao, unit: r.unit, nvalues: r.nvalues, min_value: r.min_value, max_value: r.max_value, value_precision: r.value_precision, required: r.required, status: 1, [dataAPI.getPrimaryKey()]: `id_${uid(4)}` })).filter(v => !_current.includes(v["parametro_id"]));
        dataAPI.addRows(_rows);
        dataAPI.setAction("edit", true);
        dataAPI.update(true);
    }


    const columnEditable = (v, { data, name }) => {
        if (["required", "status"].includes(name) && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
            return true;
        }
        return false;
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        if (dataAPI.getFieldStatus(data[dataAPI.getPrimaryKey()])?.[name]?.status === "error") {
            return tableCls.error;
        }
        if (["required", "status"].includes(name) && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
            return tableCls.edit;
        }
    };

    const groups = [
        //{ name: 'name', header: 'Header', headerAlign: "center" }
    ]
    const columns = [
        ...(true) ? [{ name: 'parametro_des', header: 'Parâmetro', editable: columnEditable, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'unit', header: 'Unidade', editable: columnEditable, renderEditor: (props) => <LabParametersUnitEditor dataAPI={dataAPI} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 150, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'nvalues', header: 'Nº Valores', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 1, max: 12 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'min_value', header: 'Min', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 100 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'max_value', header: 'Max', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 100 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'value_precision', header: 'Precisão', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 6 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'status', header: 'Estado', editable: columnEditable, renderEditor: (props) => <StatusTableEditor {...props} checkbox={true} genre="m" />, render: ({ data,cellProps }) => <Status cellProps={cellProps} value={data?.status} genre="m" />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'required', header: 'Obrigatório', editable: columnEditable, renderEditor: (props) => <BooleanTableEditor {...props} />, render: ({ data,cellProps }) => <Bool cellProps={cellProps} value={data?.required} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
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
        formFilter.setFieldsValue({ ...excludeObjectKeys(fieldValues, ["id"]) });
        dataAPI.setBaseFilters({ lab_metodo_id: filterValues?.id });
        dataAPI.addFilters({ ...excludeObjectKeys(filterValues, ["id"]) }, true);
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
                    //fdes: getFilterValue(vals?.fdes, 'any'),
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
            _rows = dataAPI.updateValues(index, columnId, { [columnId]: value });
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
                    response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "UpdateLabMetodoParameters", rows }, filter: { id: inputParameters.current.id } });
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
        // const rows = dataAPI.dirtyRows();
        // if (rows && rows.length > 0) {
        //     submitting.trigger();
        //     let response = null;
        //     try {
        //         const status = dataAPI.validateRows(rowSchema); //Validate all rows
        //         const msg = dataAPI.getMessages();
        //         if (status.errors > 0) {
        //             openNotification("error", "top", "Notificação", msg.error, 5, { width: "500px" });
        //         } else {
        //             response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "NewLabParameter", data: excludeObjectKeys(rows[0], ["id", "rowadded", "rowvalid"]) } });
        //             if (response.data.status !== "error") {
        //                 dataAPI.setAction("load", true);
        //                 dataAPI.update(true);
        //                 setMode((prev) => ({ ...prev, datagrid: { ...mode?.datagrid, add: false } }));
        //                 openNotification(response.data.status, 'top', "Notificação", response.data.title);
        //             } else {
        //                 openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
        //             }
        //         }
        //     } catch (e) {
        //         console.log(e)
        //         openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        //     } finally {
        //         submitting.end();
        //     };
        // }
    }
    const onAdd = (cols) => {
        // dataAPI.addRow({ ...cols, nvalues: 4, min_value: 0, value_precision: 0 }, null, 0);
    }
    const onDelete = (data, rowIndex) => {
        if (data?.rowadded === 1) {
            dataAPI.deleteRow({ [dataAPI.getPrimaryKey()]: data?.[dataAPI.getPrimaryKey()] }, [dataAPI.getPrimaryKey()]);
            dataAPI.setAction("edit", true);
            dataAPI.update(true);
        } else {
            dataAPI.validateRows(rowSchema, {}, {}, _rows);
            Modal.confirm({
                content: <div>Tem a certeza que deseja eliminar o parâmetro <span style={{ fontWeight: 700 }}>{data?.designacao}</span>?</div>, onOk: async () => {
                    submitting.trigger();
                    let response = null;
                    try {
                        const status = dataAPI.validateRows(rowSchema); //Validate all rows
                        const msg = dataAPI.getMessages();
                        if (status.errors > 0) {
                            openNotification("error", "top", "Notificação", msg.error, 5, { width: "500px" });
                        } else {
                            response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "DeleteLabMetodoParameter" }, filter: { id: data["id"] } });
                            if (response.data.status !== "error") {
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
            //setModalParameters({content: "textarea", type: "drawer", width: 550, title: column.header, push: false, parameters: {value:data[column.name]}});
            //showModal();
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
                    add: false,
                    onAdd: onAdd, onAddSave: onAddSave,
                    onSave: () => onSave("update"), onCancel: onEditCancel,
                    modeKey: "datagrid", setMode, mode, onEditComplete
                }}
                leftToolbar={
                    <Space>
                        <Permissions permissions={permission} action="edit" forInput={[mode.datagrid.edit]}><Button icon={<BorderOutlined />} onClick={onParametersChooser}>Selecionar Parâmetros</Button></Permissions>
                    </Space>
                }

            />
            {/* </Col>
                </Row>
            </FormContainer> */}
        </YScroll>
    );


};