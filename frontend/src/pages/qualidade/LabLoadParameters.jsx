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
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS, CSRF } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch, message, Upload } from "antd";
const { Dragger } = Upload;
const { TextArea } = Input;
const { Title } = Typography;
import { json, excludeObjectKeys } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, BarsOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InboxOutlined } from '@ant-design/icons';


import {
    InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor, LabParametersUnitEditor,
    MetodoOwnerTableEditor, InputTableEditor, BooleanTableEditor, ClientesTableEditor, ArtigosTableEditor, StatusTableEditor, ObsTableEditor,
    MetodoTipoTableEditor, MetodoModeTableEditor
} from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, Status, TextAreaViewer, MetodoOwner, Link, MetodoTipo, MetodoMode, MetodoAging } from 'components/TableColumns';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
const LabMetodoParametersList = lazy(() => import('./LabMetodoParametersList'));
// import { isPrivate, LeftUserItem } from './commons';


const title = "Carregar Parâmeteros";
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
        "mode": Joi.string().label("Modo").required(),
        "type": Joi.string().label("Tipo").required(),
        "aging": Joi.number().allow(null).min(1),
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


export default ({ setFormTitle, closeSelf, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "quality", item: "metodos" });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: true, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const [processedData, setProcessedData] = useState();
    const inputParameters = useRef({});
    const [form] = Form.useForm();

    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = { method: "ListLabMetodos" };
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props?.id, payload: { url: ``, primaryKey: "nome", parameters: defaultParameters, pagination: { enabled: false, limit: 150 }, filter: defaultFilters } });
    const submitting = useSubmitting(true);

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "textarea": return <TextAreaViewer parameters={modalParameters.parameters} />;
                case "parameters": return <LabMetodoParametersList parameters={modalParameters.parameters} />;
                //case "content": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal lazy={modalParameters?.lazy} responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onOpenParameters = (id, designacao) => {
        setModalParameters({ content: "parameters", type: "drawer", width: "95%", title: `Método ${designacao}`, push: false, loadData, lazy: true, parameters: { id } });
        showModal();
    }

    useEffect(() => {
        const controller = new AbortController();
        const interval = null;
        //const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    useEffect(() => {
        if (processedData) {
            loadData({ init: true });
        }
    }, [processedData]);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, null);
            inputParameters.current = paramsIn;
        }
        setFormDirty(false);
        dataAPI.setData({ rows: processedData.rows, total: processedData.total });
        let { filterValues, fieldValues } = fixRangeDates([], inputParameters.current);
        formFilter.setFieldsValue({ ...fieldValues });
        submitting.end();
    }

    const columns = [
        ...(true) ? [{ name: 'nome', header: 'Nome', userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'designacao', header: 'Designação', userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'unit', header: 'Unidade', userSelect: true, defaultLocked: false, width: 150, headerAlign: "center" }] : [],
        ...(permission.isOk({ forInput: [!submitting.state, mode.datagrid.edit], action: "delete" })) ? [{ name: 'bdelete', header: '', headerAlign: "center", userSelect: true, defaultLocked: false, width: 45, render: ({ data, rowIndex }) => <Button onClick={() => onDelete(data, rowIndex)} icon={<DeleteTwoTone twoToneColor="#f5222d" />} /> }] : []
    ];

    const onFilterFinish = (type, values) => { };
    const onFilterChange = (changedValues, values) => { };

    const onEditComplete = ({ value, columnId, rowIndex, data, ...rest }) => {
        // const index = rowIndex;
        // if (index >= 0) {
        //     let _rows = [];
        //     if (["value1", "value2", "value3", "value4"].includes(columnId)) {
        //         _rows = dataAPI.updateValues(index, columnId, { [columnId]: parseFloat(value).toFixed(data?.value_precision) });
        //     } else {
        //         _rows = dataAPI.updateValues(index, columnId, { [columnId]: value });
        //     }
        //     const required = (_rows[rowIndex]?.value1 || _rows[rowIndex]?.value2 || _rows[rowIndex]?.value3 || _rows[rowIndex]?.value4) ? true : _rows[rowIndex]?.required;
        //     const _status = dataAPI.validateRow(rowSchema({}, required), {}, {}, _rows[rowIndex], rowIndex);
        //     dataAPI.updateRowStatus(_status, data[dataAPI.getPrimaryKey()]);
        // }
    }

    const rowClassName = ({ data }) => {
        // if () {
        //     return tableCls.error;
        // }
    }

    const onEditCancel = async () => {
        await loadData();
        return false;
    }

    const onDelete = (data, rowIndex) => {
        dataAPI.deleteRow({ [dataAPI.getPrimaryKey()]: data?.[dataAPI.getPrimaryKey()] }, [dataAPI.getPrimaryKey()]);
        dataAPI.setAction("edit", true);
        dataAPI.update(true);
    }

    const onSave = async () => {
        props?.parameters?.addLoadedParameters(dataAPI.getData().rows);
        closeSelf();
    }

    return (
        <YScroll>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}

            {!processedData && <Dragger {...{
                name: 'file',
                multiple: false,
                accept: ".csv",
                headers: { "X-CSRFToken": CSRF },
                withCredentials: true,
                action: `${API_URL}/qualidade/loadlabmetodoparametersbyfile/`,
                showUploadList: false,
                onChange(info) {
                    const { status } = info.file;
                    if (status !== 'uploading') {
                        if (Array.isArray(info.fileList)) {
                            setProcessedData(info.fileList[0].response);
                            console.log("aaaaaaaaaaaa", info.fileList[0].response)
                        } else {
                            message.error(`${info.file.name} Erro ao processar ficheiro.`);
                        }
                    }
                    if (status === 'done') {
                        message.success(`${info.file.name} Ficheiro processado com sucesso.`);
                    } else if (status === 'error') {
                        message.error(`${info.file.name} Erro no upload do ficheiro.`);
                    }
                },
                onDrop(e) {
                },
            }}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Clique ou arraste o ficheiro <b>csv</b> para esta área por forma a efetuar o upload</p>
            </Dragger>
            }


            {processedData &&
                <FormContainer id="form" fluid loading={submitting.state} style={{ padding: "0px" }}>
                    <Row style={{}} nogutter>
                        <Col>
                            <Table
                                dirty={formDirty}
                                loading={submitting.state}
                                offsetHeight="270px"
                                idProperty={dataAPI.getPrimaryKey()}
                                local={true}
                                onRefresh={loadData}
                                rowClassName={rowClassName}
                                sortable={false}
                                reorderColumns={false}
                                showColumnMenuTool={false}

                                editable={{
                                    enabled: permission.isOk({ forInput: [!submitting.state], action: "edit" }),
                                    add: false,
                                    showCancelButton: false, showSaveButton: false,
                                    //onAdd: onAdd, onAddSave: onAddSave,
                                    onSave: () => onSave("update"), onCancel: onEditCancel,
                                    modeKey: "datagrid", setMode, mode, onEditComplete
                                }}

                                columns={columns}
                                dataAPI={dataAPI}
                                moreFilters={false}
                                settings={false}
                                leftToolbar={
                                    <Space>
                                        <Permissions permissions={permission} action="edit" forInput={[mode.datagrid.edit]}><Button type="primary" onClick={onSave}>Confirmar</Button></Permissions>
                                    </Space>
                                }
                                toolbarFilters={false}
                            />
                        </Col>
                    </Row>
                </FormContainer>
            }
        </YScroll>
    );


};