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
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, UploadOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles, getFilters, getMoreFilters } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor, LabParametersUnitEditor, InputTableEditor, BooleanTableEditor, MetodoTipoTableEditor, MetodoModeTableEditor, ClientesTableEditor, SalesPriceProdutosTableEditor, StatusApprovalTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime } from 'components/TableColumns';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
import { IoCreateOutline, IoTimeOutline } from 'react-icons/io5';


const title = "Preços de Venda";
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
        "cliente_nome": Joi.string().label("Client").required(),
        "produto": Joi.string().label("Product").required(),
        "quotation_exw": Joi.number().max(Joi.ref('quotation_final')).label("Quotation EXW").required(),
        "quotation_final": Joi.number().label("Quotation Final").required(),
        "sqm": Joi.number().label("Sqm").required(),
        "q": Joi.number().label("Quarter").required(),
        "y": Joi.number().label("Year").required()
    }, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, auth, num, v, columns, ...props }) => {
    return (<>
        {true && <>
            {getFilters({ columns: columns })}
            <Col xs="content">
                <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
                </Field>
            </Col>
            {/*<Col xs="content">
                <Field name="fyear" shouldUpdate label={{ enabled: true, text: "Ano", pos: "top", padding: "0px" }}>
                    <DatePicker size="small" picker="year" format={"YYYY"} />
                </Field>
            </Col>
            <Col xs="content">
                <Field name="fquarter" label={{ enabled: true, text: "Quarter", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: 1, label: "Q1" }, { value: 2, label: "Q2" }, { value: 3, label: "Q3" }, { value: 4, label: "Q4" }]} allowClear style={{ width: "60px" }} />
                </Field>
            </Col> */}
        </>}
    </>
    );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFilters = ({ form, columns }) => [
    ...getMoreFilters({ columns }),
    <Col xs="content">
        <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
            <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
        </Field>
    </Col>
    /* { fgroup: { label: "Grupo", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcod: { label: "Artigo Cód.", field: { type: 'input', size: 'small' }, span: 8 }, fdes: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span: 16 } }, */
];

const loadLastDocs = async () => {
    const { data } = await fetchPost({ url: `${API_URL}/artigos/sql/`, filter: {}, parameters: { method: "GetLastDocs" }, sort: [] });
    const _inElaboration = data?.data.find(v => v.doc_status === 0);
    return {
        rows: data?.data,
        inElaboration: _inElaboration ? true : false,
        elaborationDoc: { doc_id: _inElaboration?.id, y: _inElaboration?.y, q: _inElaboration?.q, doc_version: _inElaboration?.doc_version, doc_status: 0 },
        addText: `Nova linha Doc. v.${_inElaboration?.doc_version}.Q${_inElaboration?.q}.${_inElaboration?.y}`,
        editText: `Editar Doc. v.${_inElaboration?.doc_version}.Q${_inElaboration?.q}.${_inElaboration?.y}`
    };
}

export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "comercial", item: "salesprice" });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: false, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});
    const bulkLoad = useRef(false);
    const [form] = Form.useForm();

    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = { method: "ListSalePrices" };
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props?.id, fnPostProcess: (dt) => postProcess(dt, submitting), payload: { url: `${API_URL}/artigos/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters } });
    const submitting = useSubmitting(true);
    const [dropdownItems, setDropdownItems] = useState([]);
    const [lastDocs, setLastDocs] = useState(); //Documentos com status elaboração e fechado

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "textarea": return <TextAreaViewer parameters={modalParameters.parameters} />;
                //case "content": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    const onItemClick = (v) => {
        switch (v?.key) {
            case '1': onNewDoc(v.item.props.parameters); break; //novo documento
            case '2': onNewDoc(v.item.props.parameters); break; //novo documento copiado
            case '3': onNewRevision(); break; //nova revisão
            case '4': onCloseDoc(); break; //fechar documento
        }
        /*         setMode({ datagrid: { edit: false, add: true } });
                setModalParameters({ content: "loadparameters", responsive: true, type: "drawer", width: 1200, title: "Carregar Parâmetros", push: false, loadData: () => { }, parameters: { addLoadedParameters } });
                showModal(); */
    }

    const onNewDoc = (v) => {
        let _content = "copyFrom" in v ? <div>Confirmar novo documento no período <span style={{ fontWeight: 700, fontSize: "14px" }}>Q{v.q} {v.y}</span> <b>copiado</b> de Q{v.copyFrom.q} {v.copyFrom.y}?</div> :
            <div>Confirmar novo documento <b>vazio</b> no período <span style={{ fontWeight: 700, fontSize: "14px" }}>Q{v.q} {v.y}</span>?</div>;
        Modal.confirm({
            title: "Confirmação",
            content: _content, onOk: async () => {
                submitting.trigger();
                let response = null;
                try {
                    response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "NewSalePricesDoc", ...v, qdate: v.qdate.format(DATE_FORMAT) }, filter: {} });
                    if (response.data.status !== "error") {
                        dataAPI.update(true);
                        openNotification(response.data.status, 'top', "Notificação", response.data.title);
                    } else {
                        openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
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

    const onNewRevision = () => {
        const _closed = lastDocs?.rows?.find(v => v.doc_status == 2);
        let _content = <div>Confirmar revisão de preços no período <span style={{ fontWeight: 700, fontSize: "14px" }}>Q{_closed.q} {_closed.y}</span>?</div>;
        Modal.confirm({
            title: "Confirmação",
            content: _content, onOk: async () => {
                submitting.trigger();
                let response = null;
                try {
                    response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "NewSalePricesRevision", doc_id: _closed.id, qdate: _closed.qdate, q: _closed.q, y: _closed.y }, filter: {} });
                    if (response.data.status !== "error") {
                        dataAPI.update(true);
                        openNotification(response.data.status, 'top', "Notificação", response.data.title);
                    } else {
                        openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
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

    const onCloseDoc = () => {
        const _elaboration = lastDocs?.rows?.find(v => v.doc_status == 0);
        let _content = <div>Confirmar fecho do documento <b>v.{_elaboration.doc_version}</b> no período <span style={{ fontWeight: 700, fontSize: "14px" }}>Q{_elaboration.q} {_elaboration.y}</span>?</div>;
        Modal.confirm({
            title: "Confirmação",
            content: _content, onOk: async () => {
                submitting.trigger();
                let response = null;
                try {
                    response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "CloseSalePricesDoc", doc_id: _elaboration.id, q: _elaboration.q, y: _elaboration.y }, filter: {} });
                    if (response.data.status !== "error") {
                        dataAPI.update(true);
                        openNotification(response.data.status, 'top', "Notificação", response.data.title);
                    } else {
                        openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
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

    const onDeleteRow = (data, rowIndex) => {
        let _content = <div>Tem a certeza que deseja eliminar o registo do cliente <span style={{ fontWeight: 700, fontSize: "14px" }}>{data?.cliente_nome}</span> relativo ao produto <span style={{ fontWeight: 700, fontSize: "14px" }}>{data?.produto} {data.gsm_des}</span>?
            <div style={{ margin: "5px 0px" }}><b>Nota:</b> Se o documento se encontrar em revisão de preços, a linha correspondente ficará como obsoleta!</div>
        </div>;
        Modal.confirm({
            title: "Confirmação",
            content: _content, onOk: async () => {
                submitting.trigger();
                let response = null;
                try {
                    response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "DeleteSalePricesRow", id: data.id, doc_id: data.doc_id, q: data.q, y: data.y }, filter: {} });
                    if (response.data.status !== "error") {
                        dataAPI.update(true);
                        openNotification(response.data.status, 'top', "Notificação", response.data.title);
                    } else {
                        openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
                    }
                } catch (e) {
                    console.log(e)
                    openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
                } finally {
                    submitting.end();
                };
            }
        });



        // Modal.confirm({
        //     content: <div>Tem a certeza que deseja eliminar o parâmetro <span style={{ fontWeight: 700 }}>{data?.designacao}</span>?</div>, onOk: async () => {

        //         submitting.trigger();
        //         let response = null;
        //         try {
        //             const status = dataAPI.validateRows(rowSchema); //Validate all rows
        //             const msg = dataAPI.getMessages();
        //             if (status.errors > 0) {
        //                 openNotification("error", "top", "Notificação", msg.error, 5, { width: "500px" });
        //             } else {
        //                 response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "DeleteLabParameter" }, filter: { id: data["id"] } });
        //                 if (response.data.status !== "error") {
        //                     const _rows = dataAPI.deleteRow({ [dataAPI.getPrimaryKey()]: data?.[dataAPI.getPrimaryKey()] }, [dataAPI.getPrimaryKey()]);
        //                     dataAPI.setAction("edit", true);
        //                     dataAPI.update(true);
        //                     openNotification(response.data.status, 'top', "Notificação", response.data.title);
        //                 } else {
        //                     openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
        //                 }
        //             }
        //         } catch (e) {
        //             console.log(e)
        //             openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        //         } finally {
        //             submitting.end();
        //         };
        //     }
        // });
    }

    /*     const addLoadedParameters = (rows) => {
            dataAPI.addRows(rows.map(v => ({ ...v, [dataAPI.getPrimaryKey()]: `id_${uid(4)}`, nvalues: 4, min_value: 0, max_value: 100, value_precision: 0 })));
            dataAPI.setAction("add", true);
            dataAPI.update(true);
            bulkLoad.current = true;
        } */

    const postProcess = async (dt, submitting) => {
        //Sempre que o dataset atualiza, atualiza o documento em elaboração
        setLastDocs(await loadLastDocs());
        submitting.end();
        return dt;
    }

    const columnEditable = (v, { data, name }) => {
        if (data?.doc_status !== 0 || (data?.status == 2 && data?.rowvalid !== 0)) {
            return false;
        }
        if (["cliente_nome", "quotation_exw", "sqm", "quotation_final", "produto", "status"].includes(name) && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
            return true;
        }
        return false;
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        if (dataAPI.getFieldStatus(data[dataAPI.getPrimaryKey()])?.[name]?.status === "error") {
            return tableCls.error;
        }
        if (data?.doc_status !== 0 || (data?.status == 2 && data?.rowvalid !== 0)) {
            return null;
        }
        if (["cliente_nome", "quotation_exw", "sqm", "quotation_final", "produto", "status"].includes(name) && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
            return tableCls.edit;
        }
    };

    const groups = [
        //{ name: 'name', header: 'Header', headerAlign: "center" }
    ]
    const columns = [
        ...(true) ? [{ name: 'cliente_nome', header: 'Cliente', userSelect: true, defaultLocked: false, defaultWidth: 300, flex: 1, headerAlign: "center", editable: columnEditable, renderEditor: (props) => <ClientesTableEditor dataAPI={dataAPI} {...props} />, cellProps: { className: columnClass }, render: ({ cellProps, data }) => <LeftAlign style={{ fontWeight: 700 }}>{data.cliente_nome}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'pais_des', header: 'País', editable: false, userSelect: true, defaultLocked: false, defaultWidth: 100, headerAlign: "center", cellProps: { className: columnClass }, render: ({ cellProps, data }) => <LeftAlign>{data.pais_des}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'incoterm', header: 'Incoterm', editable: false, userSelect: true, defaultLocked: false, defaultWidth: 90, headerAlign: "center", cellProps: { className: columnClass }, render: ({ cellProps, data }) => <LeftAlign>{data.incoterm}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'cond_pag_des', header: 'Condições Pagamento', editable: false, userSelect: true, defaultLocked: false, defaultWidth: 300, headerAlign: "center", cellProps: { className: columnClass }, render: ({ cellProps, data }) => <LeftAlign>{data.cond_pag_des}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'produto', header: 'Produto', editable: columnEditable, renderEditor: (props) => <SalesPriceProdutosTableEditor dataAPI={dataAPI} {...props} />, cellProps: { className: columnClass }, render: ({ cellProps, data }) => <LeftAlign style={{ fontWeight: 700 }}>{data.produto}</LeftAlign>, userSelect: true, defaultLocked: false, defaultWidth: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'gsm_des', header: 'Gsm', editable: false, userSelect: true, defaultLocked: false, defaultWidth: 80, headerAlign: "center", cellProps: { className: columnClass }, render: ({ cellProps, data }) => <LeftAlign>{data.gsm_des}</LeftAlign> }] : [],

        ...(true) ? [{ name: 'quotation_exw', header: 'Quotation EXW', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 2 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign addonAfter=" €">{data.quotation_exw}</RightAlign> }] : [],
        ...(true) ? [{ name: 'sqm', header: 'Sqm/Truck/Ctr', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign addonAfter=" m&#178;">{data.sqm}</RightAlign> }] : [],
        ...(true) ? [{ name: 'quotation_final', header: 'Quotation Final', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 2 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign addonAfter=" €">{data.quotation_final}</RightAlign> }] : [],
        ...(true) ? [{ name: 'doc_version', header: 'v.', editable: false, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 50, headerAlign: "center", render: ({ cellProps, data }) => <LeftAlign>v.{data.doc_version}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'q', header: 'Quarter', filter: { show: true, type: "select", field: { style: { width: "60px" }, options: [{ value: 1, label: "Q1" }, { value: 2, label: "Q2" }, { value: 3, label: "Q3" }, { value: 4, label: "Q4" }] } }, editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 1, max: 4 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 90, headerAlign: "center", render: ({ cellProps, data }) => <LeftAlign>Q<span style={{ fontWeight: 700 }}>{data.q}</span></LeftAlign> }] : [],
        ...(true) ? [{ name: 'y', header: 'Year', filter: { show: true, type: "datetime", field: { style: { width: "80px" }, picker: "year", format: "YYYY" } }, editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 1, max: 4 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 70, headerAlign: "center", render: ({ cellProps, data }) => <LeftAlign style={{ fontWeight: 700 }}>{data.y}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'status', header: 'Estado', editable: columnEditable, renderEditor: (props) => <StatusApprovalTableEditor {...props} genre="m" allowed={[0, 1, 2]} />, render: ({ data, cellProps }) => <StatusApproval docStatus={data?.doc_status} cellProps={cellProps} allowed={[-1, 0, 1, 2]} value={data?.status} genre="m" />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        //...(true) ? [{ name: 'doc_status', header: 'Doc. Estado', editable: false, render: ({ data, cellProps }) => <StatusDoc cellProps={cellProps} value={data?.doc_status} genre="m" />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 't_stamp_approved', header: 'Aprovado em', userSelect: true, defaultLocked: false, defaultWidth: 120, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.t_stamp_approved} format={DATETIME_FORMAT} /> }] : [],
        ...(permission.isOk({ forInput: [!submitting.state, !mode.datagrid.edit], action: "delete" })) ? [{ name: 'bdelete', filter: { show: false }, header: '', headerAlign: "center", userSelect: true, defaultLocked: false, width: 45, render: ({ data, rowIndex }) => ((data?.doc_status == 0 && data?.status == 0) && <Button size='small' onClick={() => onDeleteRow(data, rowIndex)} icon={<DeleteOutlined /* twoToneColor="#f5222d" */ />} />) }] : []
        /* ...(true) ? [{ name: 'nome', header: 'Nome', editable: columnEditable, renderEditor: (props) => <InputTableEditor inputProps={{}} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'designacao', header: 'Designação', editable: columnEditable, renderEditor: (props) => <InputTableEditor inputProps={{}} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'parameter_type', header: 'Tipo', editable: columnEditable, renderEditor: (props) => <MetodoTipoTableEditor {...props} />, cellProps: { className: columnClass },render: ({ data, cellProps }) => <MetodoTipo cellProps={cellProps} value={data?.parameter_type} />, userSelect: true, defaultLocked: false, width: 150, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'parameter_mode', header: 'Modo', editable: columnEditable, renderEditor: (props) => <MetodoModeTableEditor {...props} />,render: ({ data, cellProps }) => <MetodoMode cellProps={cellProps} value={data?.parameter_mode} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 150, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'unit', header: 'Unidade', editable: columnEditable, renderEditor: (props) => <LabParametersUnitEditor dataAPI={dataAPI} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 150, headerAlign: "center" }] : [],
        //...(true) ? [{ name: 'nvalues', header: 'Nº Valores', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 1, max: 12 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'min_value', header: 'Min', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 100 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'max_value', header: 'Max', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 100 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'value_precision', header: 'Precisão', editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 6 }} {...props} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'required', header: 'Obrigatório', editable: columnEditable, renderEditor: (props) => <BooleanTableEditor {...props} />, render: ({ data, cellProps }) => <Bool cellProps={cellProps} value={data?.required} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(permission.isOk({ forInput: [!submitting.state, mode.datagrid.edit], action: "delete" })) ? [{ name: 'bdelete', header: '', headerAlign: "center", userSelect: true, defaultLocked: false, width: 45, render: ({ data, rowIndex }) => <Button onClick={() => onDelete(data, rowIndex)} icon={<DeleteTwoTone twoToneColor="#f5222d" />} /> }] : [] */
    ];


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, { fy: new Date().getFullYear(), fq: Math.floor(new Date().getMonth() / 3) + 1, ...props?.parameters }, { ...location?.state }, null);
            inputParameters.current = paramsIn;
        }
        setFormDirty(false);
        let { filterValues, fieldValues } = fixRangeDates([], inputParameters.current);
        formFilter.setFieldsValue({ ...fieldValues, ..."fy" in fieldValues && { fy: dayjs().year(fieldValues?.fy) } });
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
                const _year = vals?.fy && vals?.fy?.year();
                const _values = {
                    ...vals,
                    fy: getFilterValue(_year, '==')
                    //fdes: getFilterValue(vals?.fdes, 'any'),
                    //fcod: getFilterValue(vals?.fcod, 'any'),
                    //fdes: getFilterValue(vals?.fdes, 'any'),
                    //f1: getFilterValue(vals?.f1, 'any'),
                    //f2: getFilterRangeValues(vals?.f2?.formatted)
                };
                dataAPI.addFilters(dataAPI.removeEmpty(_values));
                //formFilter.setFieldsValue({ fyear: dayjs().year(_year) });
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
            const { cliente_cod, produto, gsm_des, original_cliente_cod, original_produto, original_gsm_des } = dataAPI.getData().rows[index];
            if (columnId === "cliente_nome") {
                _rows = dataAPI.updateValues(index, columnId, {
                    [columnId]: value?.BPCNAM_0, "cliente_cod": value?.BPCNUM_0,
                    pais_cod: value?.CRY_0, pais_des: value?.country_des,
                    incoterm: value?.EECICT_0,
                    cond_pag_cod: value?.PTE_0,
                    cond_pag_des: value?.cond_des,
                    produto: null,
                    gsm_des: null,
                    gsm: null,
                    ...!original_cliente_cod && { original_cliente_cod: cliente_cod },
                    ...!original_produto && { original_produto: produto },
                    ...!original_gsm_des && { original_gsm_des: gsm_des },
                });
            } else if (columnId === "produto") {
                _rows = dataAPI.updateValues(index, columnId, {
                    produto: value?.produto,
                    gsm_des: value?.gsm_des,
                    gsm: value?.gsm,
                    ...!original_produto && { original_produto: produto },
                    ...!original_gsm_des && { original_gsm_des: gsm_des },
                });
            } else {
                _rows = dataAPI.updateValues(index, columnId, { [columnId]: value });
            }
            //else if (columnId === "parameter_type") {
            //     _rows = dataAPI.updateValues(index, columnId, { [columnId]: value, ...!data?.parameter_mode && { parameter_mode: value==="histerese" ? "cíclico" : "simples" } });
            // }else {
            //     _rows = dataAPI.updateValues(index, columnId, { [columnId]: value });
            // }
            dataAPI.validateRows(rowSchema, {}, {}, _rows);
            //const { errors, warnings, fieldStatus, formStatus } = dataAPI.validateField(rowSchema, data[dataAPI.getPrimaryKey()], columnId, value, index, gridStatus);
            //setGridStatus({ errors, warnings, fieldStatus, formStatus });
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
                    response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "UpdateSalePricesRows", rows } });
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
                    /*                     if (bulkLoad.current === true) {
                                            response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "NewLabBulkParameter", rows } });
                                        } else { */
                    response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "NewSalePricesRows", data: excludeObjectKeys(rows[0], ["id", "rowadded", "rowvalid"]) } });
                    /*                     } */
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
    const onAdd = async (cols) => {
        dataAPI.addRow({ ...cols, ...lastDocs?.elaborationDoc }, null, 0);
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

    // const onCellAction = (data, column, key) => {
    //     if (key === "Enter" || key === "DoubleClick") {
    //         //setModalParameters({content: "textarea", type: "drawer", width: 550, title: column.header, push: false, parameters: {value:data[column.name]}});
    //         //showModal();
    //     }
    // }

    const onDropdownOpenChange = async (open) => {
        if (open) {
            const _options = [];
            const currentDate = dayjs();
            const currentQuarter = currentDate.quarter();
            const currentYear = currentDate.year();
            const firstDateOfQuarter = currentDate.startOf('quarter');
            if (lastDocs?.rows && lastDocs?.rows?.length > 0) {
                const _elaboration = lastDocs?.rows?.find(v => v.doc_status == 0);
                const _closed = lastDocs?.rows?.find(v => v.doc_status == 2);
                if (!_elaboration && _closed) {
                    const _d = dayjs(_closed.qdate);
                    if (_d.isBefore(firstDateOfQuarter)) {
                        _options.push({ label: <div>Novo Documento <b>vazio</b> em <b>Q{currentQuarter} {currentYear}</b></div>, key: '1', parameters: { qdate: firstDateOfQuarter, q: currentQuarter, y: currentYear }, icon: <IoCreateOutline style={{ fontSize: "16px" }} /> });
                        _options.push({ label: <div>Novo Documento <b>copiado</b> de Q{_closed.q} {_closed.y} em <b>Q{currentQuarter} {currentYear}</b></div>, key: '2', parameters: { copyFrom: { q: _closed.q, y: _closed.y }, qdate: firstDateOfQuarter, q: currentQuarter, y: currentYear }, icon: <IoCreateOutline style={{ fontSize: "16px" }} /> });
                    } else if (_d.isSame(firstDateOfQuarter)) {
                        const _d_next = _d.add(1, 'quarter');
                        _options.push({ label: <div>Novo Documento <b>vazio</b> em <b>Q{_d_next.quarter()} {_d_next.year()}</b></div>, parameters: { qdate: _d_next, q: _d_next.quarter(), y: _d_next.year() }, key: '1', icon: <IoCreateOutline style={{ fontSize: "16px" }} /> });
                        _options.push({ label: <div>Novo Documento <b>copiado</b> de Q{_closed.q} {_closed.y} em <b>Q{_d_next.quarter()} {_d_next.year()}</b></div>, parameters: { copyFrom: { q: _closed.q, y: _closed.y }, qdate: _d_next, q: _d_next.quarter(), y: _d_next.year() }, key: '2', icon: <IoCreateOutline style={{ fontSize: "16px" }} /> });
                        _options.push({ label: <div>Revisão de preços em <b>Q{_closed.q} {_closed.y}</b></div>, key: '3', icon: <IoCreateOutline style={{ fontSize: "16px" }} /> });
                    } else if (_d.isAfter(firstDateOfQuarter)) {
                        _options.push({ label: <div>Revisão de preços em <b>Q{_closed.q} {_closed.y}</b></div>, key: '3', icon: <IoCreateOutline style={{ fontSize: "16px" }} /> });
                    }
                } else if (_elaboration) {
                    _options.push({ label: <div>Fechar Documento em <b>Q{_elaboration.q} {_elaboration.y}</b></div>, key: '4', icon: <IoCreateOutline style={{ fontSize: "16px" }} /> });
                } else { }
            } else {
                _options.push({ label: <div>Novo Documento em <b>Q{currentQuarter} {currentYear}</b></div>, parameters: { qdate: firstDateOfQuarter, q: currentQuarter, y: currentYear }, key: '1', icon: <IoCreateOutline style={{ fontSize: "16px" }} /> });
            }
            setDropdownItems(_options);
        }
    }

    return (
        <YScroll>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}

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
                editStartEvent={"click"}
                pagination="remote"
                defaultLimit={20}
                columns={columns}
                dataAPI={dataAPI}
                moreFilters={true}
                // onCellAction={onCellAction}
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} auth={permission.auth} v={formFilter.getFieldsValue(true)} columns={columns} />,
                    moreFilters: { filters: moreFilters }
                }}
                editable={{
                    enabled: permission.isOk({ forInput: [!submitting.state, lastDocs?.inElaboration], action: "edit" }),
                    add: permission.isOk({ forInput: [!submitting.state, lastDocs?.inElaboration], action: "add" }),
                    onAdd: onAdd, onAddSave: onAddSave, addText: lastDocs?.addText, editText: lastDocs?.editText,
                    onSave: () => onSave("update"), onCancel: onEditCancel,
                    modeKey: "datagrid", setMode, mode, onEditComplete
                }}
                leftToolbar={<Space>
                    <Permissions permissions={permission} action="edit" forInput={[!submitting.state, !mode.datagrid.edit, !mode.datagrid.add]}>
                        <div>
                            <Dropdown trigger={["click"]} onOpenChange={onDropdownOpenChange} menu={{ items: dropdownItems, onClick: onItemClick }}>
                                <Button icon={<EllipsisOutlined />} />
                            </Dropdown>
                        </div>
                    </Permissions>

                </Space>}

            />
        </YScroll>
    );


};