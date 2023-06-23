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
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS, OFABRICO_FILTER_STATUS } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { json, excludeObjectKeys } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, ProfileOutlined, StarFilled, UploadOutlined, CopyOutlined, DeleteOutlined, FilePdfTwoTone, FileExcelTwoTone, UndoOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles, getFilters, getMoreFilters, getFiltersValues } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor, LabParametersUnitEditor, InputTableEditor, BooleanTableEditor, MetodoTipoTableEditor, MetodoModeTableEditor, ClientesTableEditor, SalesPriceProdutosTableEditor, StatusApprovalTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction } from 'components/TableColumns';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
import { IoCreateOutline, IoTimeOutline } from 'react-icons/io5';
import { BsFillStopFill, BsPauseCircleFill, BsStopCircleFill, BsPlayCircleFill, BsCircleFill, BsCircle } from 'react-icons/bs';

const FormOrdemFabricoValidar = React.lazy(() => import('../ordensfabrico/FormValidar'));
const OrdemFabrico = React.lazy(() => import('../ordensfabrico/OrdemFabrico'));
const FormPackingList = React.lazy(() => import('../ordensfabrico/FormPackingList'));
const PaletesList = React.lazy(() => import('../paletes/PaletesList'));
const PaletesStockList = React.lazy(() => import('../paletes/PaletesStockList'));


const Operations = ({ parameters }) => {

    useEffect(() => {

    }, [parameters?.status]);

    return (<><StatusProduction status={parameters?.status} /></>);
}

const title = "Ordens de Fabrico";
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
        // "cliente_nome": Joi.string().label("Client").required(),
        // "produto": Joi.string().label("Product").required(),
        // "quotation_exw": Joi.number().max(Joi.ref('quotation_final')).label("Quotation EXW").required(),
        // "quotation_final": Joi.number().label("Quotation Final").required(),
        // "sqm": Joi.number().label("Sqm").required(),
        // "q": Joi.number().label("Quarter").required(),
        // "y": Joi.number().label("Year").required()
    }, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, auth, num, v, columns, ...props }) => {
    return (<>
        {true && <>
            {getFilters({ columns: columns })}
            {/* <Col xs="content">
                <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
                </Field>
            </Col> */}
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
    // <Col xs="content">
    //     <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
    //         <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
    //     </Field>
    // </Col>
    /* { fgroup: { label: "Grupo", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcod: { label: "Artigo Cód.", field: { type: 'input', size: 'small' }, span: 8 }, fdes: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span: 16 } }, */
];

// const loadLastDocs = async () => {
//     const { data } = await fetchPost({ url: `${API_URL}/artigos/sql/`, filter: {}, parameters: { method: "GetLastDocs" }, sort: [] });
//     const _inElaboration = data?.data.find(v => v.doc_status === 0);
//     return {
//         rows: data?.data,
//         inElaboration: _inElaboration ? true : false,
//         elaborationDoc: { doc_id: _inElaboration?.id, y: _inElaboration?.y, q: _inElaboration?.q, doc_version: _inElaboration?.doc_version, doc_status: 0 },
//         addText: `Nova linha Doc. v.${_inElaboration?.doc_version}.Q${_inElaboration?.q}.${_inElaboration?.y}`,
//         editText: `Editar Doc. v.${_inElaboration?.doc_version}.Q${_inElaboration?.q}.${_inElaboration?.y}`
//     };
// }


// {(status == 1 || status == 2) && <Space>

//     <Button icon={<BsPlayCircleFill color='green' fontSize={18} style={{ marginLeft: "5px" }} />} style={{ display: "flex", alignItems: "center" }}>{/* Iniciar */}</Button>
//     {status == 1 && <Button icon={<BsStopCircleFill color='red' fontSize={18} style={{ marginLeft: "5px" }} />} style={{ display: "flex", alignItems: "center" }}>{/* Finalizar */}</Button>}

// </Space>}
// {status == 3 && <Space>

//     <Button icon={<BsPauseCircleFill color='orange' fontSize={18} style={{ marginLeft: "5px" }} />} style={{ display: "flex", alignItems: "center" }}>{/* Suspender */}</Button>
//     <Button icon={<BsStopCircleFill color='red' fontSize={18} style={{ marginLeft: "5px" }} />} style={{ display: "flex", alignItems: "center" }}>{/* Finalizar */}</Button>

// </Space>}



const Actions = ({ data, rowIndex, onAction, allows }) => {
    const items = [

        ...(data.ofabrico_status > 1) ? [
            { label: 'Paletes', key: 'op-paletes', icon: <ProfileOutlined style={{ fontSize: "18px" }} /> },
            { label: 'Paletes Stock', key: 'op-stock', icon: <ProfileOutlined style={{ fontSize: "18px" }} /> },
            { type: 'divider' },
        ] : [],
        ...(allows?.allowPackingList) ? [
            { label: 'Packing List', key: 'pl-pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} />, data: { extension: "pdf", export: "pdf", name: "PACKING-LIST", path: "PACKING-LIST/PACKING-LIST-MASTER" } },
            { label: 'Packing List', key: 'pl-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { extension: "xlsx", export: "excel", name: "PACKING-LIST", path: "PACKING-LIST/PACKING-LIST-MASTER" } },
            { label: 'Packing List Detalhado', key: 'pld-pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} />, data: { extension: "pdf", export: "pdf", name: "PACKING-LIST-DETAILED", path: "PACKING-LIST/PACKING-LIST-DETAILED-MASTER" } },
            { label: 'Packing List Detalhado', key: 'pld-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { extension: "xlsx", export: "excel", name: "PACKING-LIST-DETAILED", path: "PACKING-LIST/PACKING-LIST-DETAILED-MASTER" } },
            { type: 'divider' }
        ] : [],
        ...(allows?.allowValidar && data.ofabrico_status == 2) ? [
            { label: 'Reverter para elaboração', key: 'op-revert', icon: <UndoOutlined style={{ fontSize: "18px" }} /> },
            { type: 'divider' }
        ] : [],
        ...(allows?.allowReopen && data.ativa == 0 && (data.ofabrico_status == 9 || data.ofabrico_status == 2)) ? [
            { label: 'Abrir Proforma (PRF)', key: 'op-open', icon: <BsCircle style={{ fontSize: "10px" }} /> },
            { type: 'divider' }
        ] : [],
        ...(allows?.allowReopen && data.ativa == 1 && (data.ofabrico_status == 9 || data.ofabrico_status == 2)) ? [
            { label: 'Fechar Proforma (PRF)', key: 'op-close', icon: <BsCircleFill style={{ fontSize: "10px" }} /> },
            { type: 'divider' }
        ] : [],
        ...(allows?.allowChangeStatus) ? [
            ...(data.ofabrico_status == 2) ? [
                { label: 'Iniciar Produção', key: 'op-start', icon: <BsPlayCircleFill color='green' style={{ fontSize: "18px" }} /> },
                { type: 'divider' }
            ] : [],
            ...(data.ofabrico_status == 3) ? [
                { label: 'Finalizar Produção', key: 'op-stop', icon: <BsStopCircleFill color='red' style={{ fontSize: "18px" }} /> },
                { label: 'Suspender Produção', key: 'op-pause', icon: <BsPauseCircleFill color='orange' style={{ fontSize: "18px" }} /> },
                { type: 'divider' }
            ] : []
        ] : []
    ];

    return (
        <Dropdown menu={{ items, onClick: onAction }} placement="bottomLeft" trigger={["click"]}>
            <Button size='small' icon={<EllipsisOutlined />} />
        </Dropdown>
    );
}


export default ({ noid = true, setFormTitle, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "ordemfabrico", item: "list" });//Permissões Iniciais
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
    const defaultParameters = { method: "OrdensFabricoList" };
    const defaultSort = [{ column: "ofabrico_status", direction: "ASC" }, { column: "start_prev_date", direction: "DESC", options: "NULLS LAST" }];
    const dataAPI = useDataAPI({ ...(!noid && { id: "ofabricolist" }), /* fnPostProcess: (dt) => postProcess(dt, submitting), */ payload: { url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters } });
    const submitting = useSubmitting(true);
    const [allows, setAllows] = useState();

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "validar": return <FormOrdemFabricoValidar parameters={modalParameters.parameters} />;
                case "viewordemfabrico": return <OrdemFabrico parameters={modalParameters.parameters} />;
                case "textarea": return <TextAreaViewer parameters={modalParameters.parameters} />;
                case "packinglist": return <FormPackingList parameters={modalParameters.parameters} />;
                case "paletes": return <PaletesList parameters={{ ...modalParameters.parameters }} noid={true} />;
                case "paletesstock": return <PaletesStockList parameters={modalParameters.parameters} />
                //case "content": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal lazy={modalParameters?.lazy} responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    // const onItemClick = (v) => {
    //     switch (v?.key) {
    //         case '1': onNewDoc(v.item.props.parameters); break; //novo documento
    //         case '2': onNewDoc(v.item.props.parameters); break; //novo documento copiado
    //         case '3': onNewRevision(); break; //nova revisão
    //         case '4': onCloseDoc(); break; //fechar documento
    //     }
    //     /*         setMode({ datagrid: { edit: false, add: true } });
    //             setModalParameters({ content: "loadparameters", responsive: true, type: "drawer", width: 1200, title: "Carregar Parâmetros", push: false, loadData: () => { }, parameters: { addLoadedParameters } });
    //             showModal(); */
    // }

    // const onNewDoc = (v) => {
    //     let _content = "copyFrom" in v ? <div>Confirmar novo documento no período <span style={{ fontWeight: 700, fontSize: "14px" }}>Q{v.q} {v.y}</span> <b>copiado</b> de Q{v.copyFrom.q} {v.copyFrom.y}?</div> :
    //         <div>Confirmar novo documento <b>vazio</b> no período <span style={{ fontWeight: 700, fontSize: "14px" }}>Q{v.q} {v.y}</span>?</div>;
    //     Modal.confirm({
    //         title: "Confirmação",
    //         content: _content, onOk: async () => {
    //             submitting.trigger();
    //             let response = null;
    //             try {
    //                 response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "NewSalePricesDoc", ...v, qdate: v.qdate.format(DATE_FORMAT) }, filter: {} });
    //                 if (response.data.status !== "error") {
    //                     dataAPI.update(true);
    //                     openNotification(response.data.status, 'top', "Notificação", response.data.title);
    //                 } else {
    //                     openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
    //                 }
    //             } catch (e) {
    //                 console.log(e)
    //                 openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
    //             } finally {
    //                 submitting.end();
    //             };
    //         }
    //     });
    // }

    // const onNewRevision = () => {
    //     const _closed = lastDocs?.rows?.find(v => v.doc_status == 2);
    //     let _content = <div>Confirmar revisão de preços no período <span style={{ fontWeight: 700, fontSize: "14px" }}>Q{_closed.q} {_closed.y}</span>?</div>;
    //     Modal.confirm({
    //         title: "Confirmação",
    //         content: _content, onOk: async () => {
    //             submitting.trigger();
    //             let response = null;
    //             try {
    //                 response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "NewSalePricesRevision", doc_id: _closed.id, qdate: _closed.qdate, q: _closed.q, y: _closed.y }, filter: {} });
    //                 if (response.data.status !== "error") {
    //                     dataAPI.update(true);
    //                     openNotification(response.data.status, 'top', "Notificação", response.data.title);
    //                 } else {
    //                     openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
    //                 }
    //             } catch (e) {
    //                 console.log(e)
    //                 openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
    //             } finally {
    //                 submitting.end();
    //             };
    //         }
    //     });
    // }

    // const onCloseDoc = () => {
    //     const _elaboration = lastDocs?.rows?.find(v => v.doc_status == 0);
    //     let _content = <div>Confirmar fecho do documento <b>v.{_elaboration.doc_version}</b> no período <span style={{ fontWeight: 700, fontSize: "14px" }}>Q{_elaboration.q} {_elaboration.y}</span>?</div>;
    //     Modal.confirm({
    //         title: "Confirmação",
    //         content: _content, onOk: async () => {
    //             submitting.trigger();
    //             let response = null;
    //             try {
    //                 response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "CloseSalePricesDoc", doc_id: _elaboration.id, q: _elaboration.q, y: _elaboration.y }, filter: {} });
    //                 if (response.data.status !== "error") {
    //                     dataAPI.update(true);
    //                     openNotification(response.data.status, 'top', "Notificação", response.data.title);
    //                 } else {
    //                     openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
    //                 }
    //             } catch (e) {
    //                 console.log(e)
    //                 openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
    //             } finally {
    //                 submitting.end();
    //             };
    //         }
    //     });
    // }

    // const onDeleteRow = (data, rowIndex) => {
    //     let _content = <div>Tem a certeza que deseja eliminar o registo do cliente <span style={{ fontWeight: 700, fontSize: "14px" }}>{data?.cliente_nome}</span> relativo ao produto <span style={{ fontWeight: 700, fontSize: "14px" }}>{data?.produto} {data.gsm_des}</span>?
    //         <div style={{ margin: "5px 0px" }}><b>Nota:</b> Se o documento se encontrar em revisão de preços, a linha correspondente ficará como obsoleta!</div>
    //     </div>;
    //     Modal.confirm({
    //         title: "Confirmação",
    //         content: _content, onOk: async () => {
    //             submitting.trigger();
    //             let response = null;
    //             try {
    //                 response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "DeleteSalePricesRow", id: data.id, doc_id: data.doc_id, q: data.q, y: data.y }, filter: {} });
    //                 if (response.data.status !== "error") {
    //                     dataAPI.update(true);
    //                     openNotification(response.data.status, 'top', "Notificação", response.data.title);
    //                 } else {
    //                     openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
    //                 }
    //             } catch (e) {
    //                 console.log(e)
    //                 openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
    //             } finally {
    //                 submitting.end();
    //             };
    //         }
    //     });



    //     // Modal.confirm({
    //     //     content: <div>Tem a certeza que deseja eliminar o parâmetro <span style={{ fontWeight: 700 }}>{data?.designacao}</span>?</div>, onOk: async () => {

    //     //         submitting.trigger();
    //     //         let response = null;
    //     //         try {
    //     //             const status = dataAPI.validateRows(rowSchema); //Validate all rows
    //     //             const msg = dataAPI.getMessages();
    //     //             if (status.errors > 0) {
    //     //                 openNotification("error", "top", "Notificação", msg.error, 5, { width: "500px" });
    //     //             } else {
    //     //                 response = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "DeleteLabParameter" }, filter: { id: data["id"] } });
    //     //                 if (response.data.status !== "error") {
    //     //                     const _rows = dataAPI.deleteRow({ [dataAPI.getPrimaryKey()]: data?.[dataAPI.getPrimaryKey()] }, [dataAPI.getPrimaryKey()]);
    //     //                     dataAPI.setAction("edit", true);
    //     //                     dataAPI.update(true);
    //     //                     openNotification(response.data.status, 'top', "Notificação", response.data.title);
    //     //                 } else {
    //     //                     openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
    //     //                 }
    //     //             }
    //     //         } catch (e) {
    //     //             console.log(e)
    //     //             openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
    //     //         } finally {
    //     //             submitting.end();
    //     //         };
    //     //     }
    //     // });
    // }

    /*     const addLoadedParameters = (rows) => {
            dataAPI.addRows(rows.map(v => ({ ...v, [dataAPI.getPrimaryKey()]: `id_${uid(4)}`, nvalues: 4, min_value: 0, max_value: 100, value_precision: 0 })));
            dataAPI.setAction("add", true);
            dataAPI.update(true);
            bulkLoad.current = true;
        } */

    const postProcess = async (dt, submitting) => {
        //Sempre que o dataset atualiza, atualiza o documento em elaboração
        // setLastDocs(await loadLastDocs());
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
        ...(true) ? [{ name: 'baction', header: '', filter: { show: false }, headerAlign: "center", userSelect: true, defaultLocked: true, width: 45, render: ({ data, rowIndex }) => <Actions data={data} rowIndex={rowIndex} allows={allows} onAction={(action) => onAction(action, data, rowIndex)} /> }] : [],
        ...(true) ? [{ name: 'ofabrico', header: 'O. Fabrico', filter: { show: "toolbar", op: "any" }, userSelect: true, defaultLocked: false, defaultWidth: 120, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.ofabrico}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'prf', header: 'Prf', filter: { show: "toolbar", op: "any" }, userSelect: true, defaultLocked: false, defaultWidth: 120, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.prf}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'iorder', header: 'Encomenda', filter: { show: "toolbar", op: "any" }, render: ({ data, cellProps }) => data?.iorder, userSelect: true, defaultLocked: false, defaultWidth: 140, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'cod', header: 'Agg', filter: { show: true, op: "any" }, userSelect: true, defaultLocked: false, defaultWidth: 140, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'ofabrico_status', header: 'Estado Produção', filter: { show: true, type: "select", field: { style: { width: "80px" }, options: OFABRICO_FILTER_STATUS } }, userSelect: true, defaultLocked: false, defaultWidth: 130, headerAlign: "center", render: ({ data, cellProps }) => <OFabricoStatus data={data} cellProps={cellProps} onClick={(e) => onOFStatusClick(e, data)} /> }] : [],
        ...(true) ? [{ name: "cliente_nome", filter: { show: true, op: "any" }, header: "Cliente", defaultWidth: 160, flex: 1, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.cliente_nome}</LeftAlign> }] : [],
        ...(true) ? [{ name: "item", header: "Artigo", filter: { show: true, op: "any" }, defaultWidth: 160, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{data?.item}</LeftAlign> }] : [],
        ...(true) ? [{ name: "num_paletes_total", header: "Planeado", filter: { show: true,type:"number",field:{style:{width:"80px"}} }, defaultWidth: 80, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => data?.ofabrico_status > 1 && <RightAlign style={{}}>{data?.num_paletes_total}</RightAlign> }] : [],
        ...(true) ? [{ name: "n_paletes_produzidas", header: "Produzidas", filter: { show: true,type:"number",field:{style:{width:"80px"}} }, defaultWidth: 80, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => data?.ofabrico_status > 1 && <RightAlign style={{}}>{data?.num_paletes_total - data?.n_paletes_stock_in}</RightAlign> }] : [],
        ...(true) ? [{ name: "n_paletes_stock_in", header: "Stock", filter: { show: true,type:"number",field:{style:{width:"80px"}} }, defaultWidth: 80, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => data?.ofabrico_status > 1 && <RightAlign style={{}}>{data?.n_paletes_stock_in}</RightAlign> }] : [],
       
        ...(true) ? [{ name: 'start_prev_date', header: 'Início Previsto', filter: { show: true, type: "rangedatetime", field: { style: { width: "90px" }, format: DATE_FORMAT } }, userSelect: true, defaultLocked: false, defaultWidth: 128, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.start_prev_date} format={DATETIME_FORMAT} /> }] : [],
        ...(true) ? [{ name: 'end_prev_date', header: 'Fim Previsto', filter: { show: true, type: "rangedatetime", field: { style: { width: "90px" }, format: DATE_FORMAT } }, userSelect: true, defaultLocked: false, defaultWidth: 128, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.end_prev_date} format={DATETIME_FORMAT} /> }] : [],
        ...(true) ? [{ name: 'inicio', header: 'Início', filter: { show: true, type: "rangedatetime", field: { style: { width: "90px" }, format: DATE_FORMAT } }, userSelect: true, defaultLocked: false, defaultWidth: 128, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.inicio} format={DATETIME_FORMAT} /> }] : [],
        ...(true) ? [{ name: 'fim', header: 'Fim', filter: { show: true, type: "rangedatetime", field: { style: { width: "90px" }, format: DATE_FORMAT } }, userSelect: true, defaultLocked: false, defaultWidth: 128, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.fim} format={DATETIME_FORMAT} /> }] : [],
        ...(true) ? [{ name: 'ativa', header: 'Prf Estado', filter: { show: "toolbar", type: "select", field: { style: { width: "90px" }, options: [{ value: 0, label: "Fechada" }, { value: 1, label: "Aberta" }] } }, userSelect: true, defaultLocked: false, defaultWidth: 80, headerAlign: "center", render: ({ cellProps, data }) => <Bool cellProps={cellProps} value={data?.ativa} style={data?.ativa ? { color: "#fff", backgroundColor: "green" } : {}} /> }] : [],
        // ...(allows?.allowChangeStatus) ? [{
        //     name: 'bstatus', header: 'Produção', filter: { show: false }, userSelect: true, defaultLocked: false, defaultWidth: 90, headerAlign: "center", render: ({ cellProps, data }) => <Operations parameters={{ status: data?.ofabrico_status }} onClick={(status) => changeStatus(data, status)} />, rowspan: ({ data, value, dataSourceArray, rowIndex, column }) => {
        //         let rowspan = 1;
        //         const prevData = dataSourceArray[rowIndex - 1];
        //         if (!data["cod"] || (prevData && prevData["cod"] === data["cod"])) {
        //             return rowspan;
        //         }
        //         let currentRowIndex = rowIndex + 1;
        //         while (dataSourceArray[currentRowIndex] && dataSourceArray[currentRowIndex]["cod"] === data["cod"]
        //         ) {
        //             rowspan++;
        //             currentRowIndex++;
        //             if (rowspan > 9) { break; }
        //         }
        //         return rowspan;
        //     }
        // }] : []
    ];

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, { ...props?.parameters }, { ...location?.state }, null);
            inputParameters.current = paramsIn;
        }
        setFormDirty(false);
        console.log(inputParameters.current)
        let { filterValues, fieldValues } = fixRangeDates(null, inputParameters.current);
        formFilter.setFieldsValue({ ...fieldValues });
        dataAPI.addFilters({ ...filterValues }, true);
        dataAPI.setSort(dataAPI.getSort(), defaultSort);
        const instantPermissions = await permission.loadInstantPermissions({ name: "ordemfabrico", module: "main" });
        const allowChangeStatus = permission.isOk({ item: "changeStatus", instantPermissions });
        const allowValidar = permission.isOk({ item: "changeStatus", action: "validar", instantPermissions });
        const allowReopen = permission.isOk({ item: "changeStatus", action: "reopen", instantPermissions });
        const allowInElaboration = permission.isOk({ item: "viewInElaboration", instantPermissions });
        const allowViewValidar = permission.isOk({ item: "viewValidar", instantPermissions });
        const allowPackingList = permission.isOk({ item: "packingList", instantPermissions });
        setAllows({ allowChangeStatus, allowValidar, allowReopen, allowInElaboration, allowViewValidar, allowPackingList });
        dataAPI.addParameters({ ...defaultParameters, allowInElaboration, allowViewValidar }, true);
        dataAPI.setAction("init", true);
        dataAPI.update(true);
        submitting.end();
    }

    const onConfirm = ({ url, method, data, filter = {}, title, content }) => {
        Modal.confirm({
            title: title,
            content: content, onOk: async () => {
                submitting.trigger();
                let response = null;
                try {
                    response = await fetchPost({ url: url, parameters: { method, ...data }, filter: filter });
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

    const onAction = (action, data, rowIndex) => {



        switch (action.key) {
            case "pl-pdf":
                setModalParameters({ content: "packinglist", type: "modal", width: "800px", height: "400px", title: `Imprimir Packing List <Pdf> ${data.prf}`, lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: { report: { extension: "pdf", export: "pdf", name: "PACKING-LIST", path: "PACKING-LIST/PACKING-LIST-MASTER", orientation: "vertical" }, ...data } });
                showModal();
                break;
            case "pl-excel":
                setModalParameters({ content: "packinglist", type: "modal", width: "800px", height: "400px", title: `Imprimir Packing List <Excel> ${data.prf}`, lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: { report: { extension: "xlsx", export: "excel", name: "PACKING-LIST", path: "PACKING-LIST/PACKING-LIST-MASTER", orientation: "landscape" }, ...data } });
                showModal();
                break;
            case "pld-pdf":
                setModalParameters({ content: "packinglist", type: "modal", width: "800px", height: "400px", title: `Imprimir Packing List Detalhado <Pdf> ${data.prf}`, lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: { report: { extension: "pdf", export: "pdf", name: "PACKING-LIST-DETAILED", path: "PACKING-LIST/PACKING-LIST-DETAILED-MASTER", orientation: "vertical" }, ...data } });
                showModal();
                break;
            case "pld-excel":
                setModalParameters({ content: "packinglist", type: "modal", width: "800px", height: "400px", title: `Imprimir Packing List Detalhado <Excel> ${data.prf}`, lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: { report: { extension: "xlsx", export: "excel", name: "PACKING-LIST-DETAILED", path: "PACKING-LIST/PACKING-LIST-DETAILED-MASTER", orientation: "landscape" }, ...data } });
                showModal();
                break;
            case "op-start": break;
            case "op-pause": break;
            case "op-stop": break;
            case "op-revert":
                onConfirm({ url: `${API_URL}/ordensfabrico/sql/`, method: "RevertToElaboration", d: dataAPI, data: { aggid: data.temp_ofabrico_agg }, content: `Tem a certeza que reverter a Ordem ${data?.cod} para o estado "Em elaboração"` });
                break;
            case "op-open":
                onConfirm({ url: `${API_URL}/ordensfabrico/sql/`, method: "OpenPrf", data: { ofid: data.ofabrico_sgp }, content: `Tem a certeza que deseja abrir a Proforma (PRF) ${data?.prf}` });
                break;
            case "op-close":
                onConfirm({ url: `${API_URL}/ordensfabrico/sql/`, method: "ClosePrf", data: { ofid: data.ofabrico_sgp }, content: `Tem a certeza que deseja Fechar a Proforma (PRF) ${data?.prf}` });
                break;
            case "op-stock": 
                setModalParameters({ content: "paletesstock", type: "drawer", push: false, width: "90%", lazy: true, title: <div style={{ fontWeight: 900 }}>Paletes de Stock {data?.ofabrico}</div>, parameters: { ativa: data?.ativa, id: data.ofabrico_sgp, cliente_cod: data?.cliente_cod, artigo_cod: data?.item, filter: { fordem_id: `==${data?.ofabrico_sgp}` } } });
                showModal();
            break;
            case "op-paletes":
                setModalParameters({ content: "paletes", type: "drawer", lazy:true,push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Paletes</div>, parameters: { filter: { fof: `==${data?.ofabrico}` } } });
                showModal();    
            break;

        }
    }

    const onChangeStatus = async (data, status) => {
        // submitting.trigger();
        // let response = null;
        // try {

        //     response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "UpdateSalePricesRows", rows } });
        //     if (response.data.status !== "error") {
        //         dataAPI.update(true);
        //         openNotification(response.data.status, 'top', "Notificação", response.data.title);
        //     } else {
        //         openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
        //     }
        // } catch (e) {
        //     console.log(e)
        //     openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        // } finally {
        //     submitting.end();
        // };

    }

    const onOFStatusClick = (e, data) => {
        e.preventDefault();
        e.stopPropagation();
        if (data?.ofabrico_status === 0 && allows?.allowChangeStatus && allows?.allowValidar) {
            //Validar
            setModalParameters({ content: "validar", type: "drawer", width: "95%"/* , title: "Entrada/Saída de granulado em linha" */, lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: { ...data } });
            showModal();

        }
        if ((data?.ofabrico_status === 2 || data?.ofabrico_status === 3 || data?.ofabrico_status === 9)) {
            //navigate("/app/ofabrico/formordemfabrico", { state: { parameters: { ...data, allowChangeStatus, allowValidar, allowReopen }, tstamp: Date.now() }, replace: true });
            //Validar
            setModalParameters({ content: "viewordemfabrico", type: "drawer", width: "95%", title: `${data?.ofabrico}`, lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: { ...data, ...allows } });
            showModal();

        }
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
                    ...getFiltersValues({ columns, values: vals, server: false })
                };
                dataAPI.addFilters(dataAPI.removeEmpty(_values));
                //formFilter.setFieldsValue({ fyear: dayjs().year(_year) });
                dataAPI.addParameters({ ...defaultParameters, ...allows });
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
                loadOnInit={false}
                //editStartEvent={"click"}
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
                    enabled: false,//permission.isOk({ forInput: [!submitting.state, lastDocs?.inElaboration], action: "edit" }),
                    add: false,//permission.isOk({ forInput: [!submitting.state, lastDocs?.inElaboration], action: "add" }),
                    //onAdd: onAdd, onAddSave: onAddSave, addText: lastDocs?.addText, editText: lastDocs?.editText,
                    //onSave: () => onSave("update"), onCancel: onEditCancel,
                    //modeKey: "datagrid", setMode, mode, onEditComplete
                }}
                leftToolbar={<Space>
                    {/* <Button onClick={()=>{dataAPI.clearActions(); dataAPI.update(false);}}><b>Novo</b></Button> */}
                    {/* <Permissions permissions={permission} action="edit" forInput={[!submitting.state, !mode.datagrid.edit, !mode.datagrid.add]}>
                        <div>
                            <Dropdown trigger={["click"]} onOpenChange={onDropdownOpenChange} menu={{ items: dropdownItems, onClick: onItemClick }}>
                                <Button icon={<EllipsisOutlined />} />
                            </Dropdown>
                        </div>
                    </Permissions> */}

                </Space>}

            />
        </YScroll>
    );


};