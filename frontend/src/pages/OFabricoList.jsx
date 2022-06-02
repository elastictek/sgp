import React, { useEffect, useState, useCallback, useRef, Suspense, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { API_URL, GTIN, SCREENSIZE_OPTIMIZED, DATE_FORMAT, DATETIME_FORMAT, THICKNESS } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues, getFilterValue, isValue } from 'utils';

import FormManager, { FieldLabel, FieldSet as OldFieldSet, FilterTags, AutoCompleteField as OldAutoCompleteField, useMessages, DropDown } from "components/form";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, InputAddon, SelectField, TitleForm, WrapperForm, SelectDebounceField, AutoCompleteField, RangeDateField, FilterDrawer } from "components/formLayout";
import Drawer from "components/Drawer";
import Table, { setColumns } from "components/table";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import MoreFilters from 'assets/morefilters.svg'
import SubLayout from "components/SubLayout";
import Container from "components/container";
import AlertMessages from "components/alertMessages";
import ProgressBar from "components/ProgressBar";
//import ActionButton from "components/ActionButton";
import TagButton from "components/TagButton";
import ResponsiveModal from 'components/ResponsiveModal';
import { GrStorage } from "react-icons/gr";
import { RiRefreshLine } from "react-icons/ri";
import { Outlet, useNavigate } from "react-router-dom";

import { FcCancel, FcClock, FcAdvance, FcUnlock, FcTodoList } from "react-icons/fc";
import YScroll from "components/YScroll";

const FormOFabricoValidar = React.lazy(() => import('./planeamento/ordemFabrico/FormOFabricoValidar'));
const FormMenuActions = React.lazy(() => import('./currentline/FormMenuActions'));
import { SocketContext } from './App';


import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal } from "antd";
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled } from '@ant-design/icons';
const { Option } = Select;
const { confirm } = Modal;
import useModalv4 from 'components/useModalv4';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { VerticalSpace } from 'components/formLayout';
import { useForm } from 'antd/lib/form/Form';
const { Title } = Typography;

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const filterRules = (keys) => {
    return getSchema({
        //field1: Joi.string().label("Designação")
    }, keys).unknown(true);
}

const filterSchema = ({ ordersField, customersField, itemsField, ordemFabricoStatusField }) => [
    { f_ofabrico: { label: "Ordem de Fabrico" } },
    { f_agg: { label: "Agregação Ordem de Fabrico" } },
    { fofstatus: { label: "Estado", field: ordemFabricoStatusField, initialValue: 'Todos', ignoreFilterTag: (v) => v === 'Todos' } },
    { fmulti_order: { label: "Nº Encomenda/Nº Proforma", field: ordersField } },
    { fmulti_customer: { label: "Nº/Nome de Cliente", field: customersField } },
    { fmulti_item: { label: "Cód/Designação Artigo", field: itemsField } },
    { forderdate: { label: "Data Encomenda", field: { type: "rangedate", size: 'small' } } },
    { fstartprevdate: { label: "Data Prevista Início", field: { type: "rangedate", size: 'small' } } },
    { fendprevdate: { label: "Data Prevista Fim", field: { type: "rangedate", size: 'small' } } },

    /* { SHIDAT_0: { label: "Data Expedição", field: { type: "rangedate" } } },
    { LASDLVNUM_0: { label: "Nº Última Expedição" } },
    { ofstatus: { label: "Ordem de Fabrico: Estado", field: ordemFabricoStatusField, ignoreFilterTag: (v) => v === 'all' } } */
];

//const filterSchema = ({ /*field_multi, field_daterange, field*/ }) => [
/*{ field1: { label: "field", field: field } },
{ field2: { label: "Date Range", field: { type: "rangedate" } } },
{ field3: { label: "Multi", field: field_multi } }*/
//];

const ToolbarTable = ({ form, dataAPI, setFlyoutStatus, flyoutStatus, ordemFabricoStatusField }) => {

    const onChange = () => {
        form.submit();
    }

    const leftContent = (
        <>
            {/* <Button type="primary" size="small" disabled={flyoutStatus.visible ? true : false} onClick={() => setFlyoutStatus(prev => ({ ...prev, visible: !prev.visible }))}>Flyout</Button> */}
        </>
    );

    const rightContent = (
        <Space>
            <div style={{ display: "flex", flexDirection: "row", whiteSpace: "nowrap" }}>

            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }}>
                <Form form={form} initialValues={{ fofstatus: "Todos" }}>
                    <FormLayout id="tbt-of" schema={schema}>
                        <Field name="fofstatus" label={{ enabled: true, width: "60px", text: "Estado", pos: "left" }}>{ordemFabricoStatusField({ onChange })}</Field>
                    </FormLayout>
                </Form>
            </div>
        </Space>
    );
    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}

const downloadFile = (data, filename, mime, bom) => {
    var blobData = (typeof bom !== 'undefined') ? [bom, data] : [data]
    var blob = new Blob(blobData, { type: mime || 'application/octet-stream' });
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        var blobURL = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
        var tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = blobURL;
        tempLink.setAttribute('download', filename);

        // Safari thinks _blank anchor are pop ups. We only want to set _blank
        // target if the browser does not support the HTML5 download attribute.
        // This allows you to download files in desktop safari if pop up blocking
        // is enabled.
        if (typeof tempLink.download === 'undefined') {
            tempLink.setAttribute('target', '_blank');
        }

        document.body.appendChild(tempLink);
        tempLink.click();

        // Fixes "webkit blob resource error 1"
        setTimeout(function () {
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobURL);
        }, 200);
    }
};

const GlobalSearch = ({ form, dataAPI, columns, setShowFilter, showFilter, ordemFabricoStatusField } = {}) => {
    const [formData, setFormData] = useState({});
    const [changed, setChanged] = useState(false);
    const onFinish = (type = "filter", values = null) => {
        if (values === null || values === undefined) {
            values = form.getFieldsValue(true);
        }
        switch (type) {
            case "filter":
                (!changed) && setChanged(true);
                const _values = {
                    ...values,
                    f_ofabrico: getFilterValue(values?.f_ofabrico, 'any'),
                    f_agg: getFilterValue(values?.f_agg, 'any'),
                    fmulti_customer: getFilterValue(values?.fmulti_customer, 'any'),
                    fmulti_order: getFilterValue(values?.fmulti_order, 'any'),
                    fmulti_item: getFilterValue(values?.fmulti_item, 'any'),
                    forderdate: getFilterRangeValues(values["forderdate"]?.formatted),
                    fstartprevdate: getFilterRangeValues(values["fstartprevdate"]?.formatted),
                    fendprevdate: getFilterRangeValues(values["fendprevdate"]?.formatted)
                };
                dataAPI.addFilters(_values);
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };

    const onValuesChange = (type, changedValues, allValues) => {
        switch (type) {
            case "filter":
                form.setFieldsValue(allValues);
                break;
        }
    }

    const fetchCustomers = async (value) => {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellcustomerslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_customer"]: `%${value.replaceAll(' ', '%%')}%` } });
        return rows;
    }
    const fetchOrders = async (value) => {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellorderslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_order"]: `%${value.replaceAll(' ', '%%')}%` } });
        console.log("FETECHED", rows)
        return rows;
    }
    const fetchItems = async (value) => {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellitemslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_item"]: `%${value.replaceAll(' ', '%%')}%` } });
        return rows;
    }

    const customersField = () => (
        <AutoCompleteField
            placeholder="Cliente"
            size="small"
            keyField="BPCNAM_0"
            textField="BPCNAM_0"
            dropdownMatchSelectWidth={250}
            allowClear
            onPressEnter={onFinish}
            fetchOptions={fetchCustomers}
        />
    );
    const ordersField = () => (
        <AutoCompleteField
            placeholder="Encomenda/Prf"
            size="small"
            keyField="SOHNUM_0"
            textField="computed"
            dropdownMatchSelectWidth={250}
            allowClear
            fetchOptions={fetchOrders}
        />
    );
    const itemsField = () => (
        <AutoCompleteField
            placeholder="Artigo"
            size="small"
            keyField="ITMREF_0"
            textField="computed"
            dropdownMatchSelectWidth={250}
            allowClear
            fetchOptions={fetchItems}
        />
    );

    const menu = (
        <Menu onClick={(v) => exportFile(v)}>
            <Menu.Item key="pdf" icon={<FilePdfTwoTone twoToneColor="red" />}>Pdf</Menu.Item>
            <Menu.Item key="excel" icon={<FileExcelTwoTone twoToneColor="#52c41a" />}>Excel</Menu.Item>
            <Menu.Item key="word" icon={<FileWordTwoTone />}>Word</Menu.Item>
        </Menu>
    );

    const exportFile = async (type) => {
        const requestData = dataAPI.getPostRequest();
        requestData.parameters = {
            ...requestData.parameters,
            "config": "default",
            "orientation": "landscape",
            "template": "TEMPLATES-LIST/LIST-A4-${orientation}",
            "title": "Ordens de Fabrico",
            "export": type.key,
            cols: columns
        }
        const response = await fetchPostBlob(requestData);
        switch (type.key) {
            case "pdf":
                downloadFile(response.data, `list-${new Date().toJSON().slice(0, 10)}.pdf`);
                break;
            case "excel":
                downloadFile(response.data, `list-${new Date().toJSON().slice(0, 10)}.xlsx`);
                break;
            case "word":
                downloadFile(response.data, `list-${new Date().toJSON().slice(0, 10)}.docx`);
                break;
        }
    }

    return (
        <>

            <FilterDrawer schema={filterSchema({ form, ordersField, customersField, itemsField, ordemFabricoStatusField })} filterRules={filterRules()} form={form} width={350} setShowFilter={setShowFilter} showFilter={showFilter} />
            <Form form={form} name={`fps`} onFinish={(values) => onFinish("filter", values)} onValuesChange={onValuesChange}>
                <FormLayout
                    id="LAY-OFFLIST"
                    layout="horizontal"
                    style={{ width: "700px", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{ guides: false, wide: [3, 3, 3, 4, 1.5, 1.5], style: { marginLeft: "2px", alignSelf: "end" } }}
                    fieldSet={{ guides: false, wide: 16, margin: false, layout: "horizontal", overflow: false }}
                >
                    <Field name="fmulti_customer" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Cliente", pos: "top" }}>
                        {customersField()}
                    </Field>
                    <Field name="fmulti_order" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Encomenda/Prf", pos: "top" }}>
                        {ordersField()}
                    </Field>
                    <Field name="fmulti_item" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Artigo", pos: "top" }}>
                        {itemsField()}
                    </Field>
                    <Field name="forderdate" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Data Encomenda", pos: "top" }}>
                        <RangeDateField size='small' />
                    </Field>
                    <FieldItem label={{ enabled: false }}>
                        <ButtonGroup size='small' style={{ marginLeft: "5px" }}>
                            <Button style={{ padding: "0px 3px" }} onClick={() => form.submit()}><SearchOutlined /></Button>
                            <Button style={{ padding: "0px 3px" }}><MoreFilters style={{ fontSize: "16px", marginTop: "2px" }} onClick={() => setShowFilter(prev => !prev)} /></Button>
                            {/* <Dropdown overlay={menu}>
                            <Button style={{ padding: "3px" }}><DownOutlined /></Button>
                        </Dropdown> */}
                        </ButtonGroup>
                    </FieldItem>
                    <FieldItem label={{ enabled: false }}><Dropdown overlay={menu}>
                        <Button size="small" icon={<FileFilled />}><DownOutlined /></Button>
                    </Dropdown>
                    </FieldItem>
                </FormLayout>
            </Form>
        </>
    );
}

// const TitlePopup = ({ status, action, ofabrico }) => {
//     /*     if (ativa == 1 && completa == 0){
//             return <div><b>Finalizar</b> a Ordem de Fabrico?</div>
//         }
//         if (ativa == 0 && completa == 0){
//             return <div><b>Iniciar</b> a Ordem de Fabrico?</div>
//         } */
//     return (
//         <div style={{ display: "flex", flexDirection: "row" }}>
//             <div><ExclamationCircleOutlined /></div>
//             <div style={{ display: "flex", flexDirection: "column" }}>
//                 <div><h3><b style={{ textTransform: "capitalize" }}>{action}</b> a Ordem de Fabrico?</h3></div>
//                 <div style={{ color: "#1890ff" }}>{ofabrico}</div>
//             </div>
//         </div>
//     );

// }


/* const menu = (action, showPopconfirm) => {
    return (
        <Menu onClick={(k) => showPopconfirm(k.key)}>
            {action.includes('ignorar') &&
                <Menu.Item key="ignorar" icon={<FcCancel size="18px" />}>Ignorar</Menu.Item>
            }
            {action.includes('reabrir') &&
                <Menu.Item key="reabrir" icon={<FcUnlock size="18px" />}>Reabrir</Menu.Item>
            }
            {action.includes('suspender') &&
                <Menu.Item key="suspender" icon={<FcClock size="18px" />}>A Aguardar...</Menu.Item>
            }
            {action.includes('iniciar') &&
                <Menu.Item key="iniciar" icon={<FcAdvance size="18px" />}>Em Curso...</Menu.Item>
            }
        </Menu>
    );
} */


const ColumnProgress = ({ record, type }) => {
    let current, total;
    let showProgress = (record.ativa == 1 && record.completa == 0) ? true : false;
    if (type === 1) {
        current = record.n_paletes_produzidas;
        total = record.num_paletes_produzir;
    } else if (type === 2) {
        current = record.n_paletes_stock_in;
        total = record.num_paletes_stock;
    } else if (type === 3) {
        current = record.n_paletes_produzidas + record.n_paletes_stock_in;
        total = record.num_paletes_produzir + record.num_paletes_stock;
    }

    return (<>
        {showProgress ?
            <ProgressBar value={current} max={total} />
            : <div style={{ textAlign: "center" }}>{current}/{total}</div>}
    </>);
}

const schemaConfirm = (keys, excludeKeys) => {
    return getSchema({
        produto_cod: Joi.string().label("Designação do Produto").required(),
        artigo_formu: Joi.string().label("Fórmula").required(),
        artigo_nw1: Joi.string().label("Nonwoven 1").required(),
        artigo_width: Joi.number().integer().min(1).max(5000).label("Largura").required(),
        artigo_diam: Joi.number().integer().min(1).max(5000).label("Diâmetro").required(),
        artigo_core: Joi.number().integer().valid(3, 6).label("Core").required(),
        artigo_gram: Joi.number().integer().min(1).max(1000).label("Gramagem").required(),
        artigo_thickness: Joi.number().integer().min(0).max(5000).label("Espessura").required()
    }, keys, excludeKeys).unknown(true);
}

const TitleConfirm = ({ status, action, ofabrico }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div><ExclamationCircleOutlined style={{ color: "#faad14" }} /></div>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "column" }}>
                <div><b style={{ textTransform: "capitalize" }}>{action}</b> Ordem de Fabrico?</div>
                <div style={{ color: "#1890ff" }}>{ofabrico}</div>
            </div>
        </div>
    );
}

const ContentConfirm = ({cliente_nome, iorder, item, item_nome, produto_id, produto_cod, action }) => {
    if (produto_id) {
        return (<div>Confirmar a Ordem de Fabrico:
            <ul>
                <li>Produto <b>{produto_cod}</b></li>
                <li>Artigo <b>{item}</b></li>
                <li>Des.Artigo <b>{item_nome}</b></li>
                {iorder && <li>Encomenda <b>{iorder}</b></li>}
                {iorder && <li>Cliente <b>{cliente_nome}</b></li>}
            </ul>
        </div>);
    }

    return (
        <>
            <ul>
                <li> Artigo <b>{item}</b></li>
                <li>Des.Artigo <b>{item_nome}</b></li>
                {iorder && <li>Encomenda <b>{iorder}</b></li>}
                {iorder && <li>Cliente <b>{cliente_nome}</b></li>}
            </ul>
            <div>Para Validar a Ordem de Fabrico tem de Confirmar/Preencher os seguintes dados:</div>
            <VerticalSpace />
            <FormLayout
                id="LAY-PROD"
                guides={false}
                layout="vertical"
                style={{ width: "100%", padding: "0px" }}
                schema={schemaConfirm}
                fieldStatus={{}}
                field={{ forInput: true, wide: [16], alert: { pos: "right", tooltip: true, container: false } }}
                fieldSet={{ guides: false, wide: 16 }}
            >
                <FieldSet>
                    <Field name="produto_cod" label={{ enabled: false }}><Input placeholder="Designação do Produto" size="small" /></Field>
                </FieldSet>
                <FieldSet field={{ wide: [4, 4, 4, 4], margin: "2px" }}>
                    <Field required={false} label={{ text: <Tooltip title="O código Gtin se deixado em branco será calculado automáticamente" color="blue"><div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "3px" }}>Gtin<InfoCircleOutlined style={{ color: "#096dd9" }} /></div></Tooltip> }} name="artigo_gtin"><Input size="small" /></Field>
                    <Field required={true} label={{ text: "Fórmula" }} name="artigo_formu"><Input size="small" /></Field>
                    <Field required={true} label={{ text: "Nw1" }} name="artigo_nw1"><Input size="small" /></Field>
                    <Field required={false} label={{ text: "Nw2" }} name="artigo_nw2"><Input size="small" /></Field>
                </FieldSet>
                <FieldSet field={{ wide: [3, 3, 3, 3, 3, '*'] }}>
                    <Field required={true} label={{ text: "Largura" }} name="artigo_width"><InputAddon size="small" addonAfter={<b>mm</b>} maxLength={4} /></Field>
                    <Field required={true} label={{ text: "Diâmetro" }} name="artigo_diam"><InputAddon size="small" addonAfter={<b>mm</b>} maxLength={4} /></Field>
                    <Field required={true} label={{ text: "Core" }} name="artigo_core"><InputAddon size="small" addonAfter={<b>''</b>} maxLength={1} /></Field>
                    <Field required={true} label={{ text: "Gramagem" }} name="artigo_gram"><InputAddon size="small" addonAfter={<b>mm</b>} maxLength={4} /></Field>
                    <Field required={true}
                        label={{
                            text: <Tooltip title="A espessura é usada como valor de referência, na conversão de metros&#xB2; -> metros lineares." color="blue">
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "3px" }}>Espessura<InfoCircleOutlined style={{ color: "#096dd9" }} /></div>
                            </Tooltip>
                        }}
                        name="artigo_thickness">
                        <InputAddon size="small" addonAfter={<b>&#x00B5;</b>} maxLength={4} />
                    </Field>
                </FieldSet>
            </FormLayout>

        </>
    );
}

const PromiseFormConfirm = ({ data, parentRef, closeSelf }) => {
    const [form] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = useState(false);
    const { status, temp_ofabrico, cliente_cod, cliente_nome, iorder, item, produto_cod, action, onAction, item_nome, ofabrico, produto_id } = data;
    const [formStatus, setFormStatus] = useState({});

    useEffect(() => {
        if (!produto_id && ofabrico) {
            let artigo = { artigo_thickness: THICKNESS, produto_cod: item_nome.substring(0, item_nome.lastIndexOf(' L')), artigo_gtin: undefined, artigo_core: undefined, artigo_formu: undefined, artigo_nw1: undefined, artigo_nw2: undefined, artigo_width: undefined, artigo_diam: undefined, artigo_gram: undefined };
            const designacao = item_nome.split(' ').reverse();
            for (let v of designacao) {
                if (v.includes("''") || v.includes("'")) {
                    artigo["artigo_core"] = v.replaceAll("'", "");
                    continue;
                }
                if (v.toUpperCase().startsWith('H')) {
                    artigo["artigo_formu"] = v.toUpperCase();
                    continue;
                }
                if (v.toUpperCase().startsWith('ELA-')) {
                    artigo["artigo_nw1"] = v.toUpperCase();
                    continue;
                }
                if (v.toLowerCase().startsWith('l')) {
                    artigo["artigo_width"] = v.toLowerCase().replaceAll("l", "");
                    continue;
                }
                if (v.toLowerCase().startsWith('d')) {
                    artigo["artigo_diam"] = v.toLowerCase().replaceAll("d", "");
                    continue;
                }
                if (v.toLowerCase().startsWith('g') || (!isNaN(v) && Number.isInteger(parseFloat(v)))) {
                    artigo["artigo_gram"] = v.toLowerCase().replaceAll("g", "");
                    continue;
                }
            }
            setFormStatus({});
            form.setFieldsValue({ ...artigo });
        }
    }, [ofabrico]);

    const onFinish = async (values) => {
        let response;
        setConfirmLoading(true);
        let v;
        if (form.getFieldValue('type') === 'ignorar' && ofabrico) {
            response = await onAction(data, 'ignorar');
        } else if (!produto_id && ofabrico) {
            v = schemaConfirm().validate(values, { abortEarly: false });
            if (!v.error) {
                response = await onAction(data, action, { ...values, artigo_nome: item_nome, main_gtin: GTIN });
            }
        } else {
            response = await onAction(data, action);
        }
        if (response?.data?.status === "error") {
            setFormStatus({ error: [{ message: response.data.title }] });
        } else {
            if (!v?.error) {
                closeSelf();
            }
        }
        setConfirmLoading(false);
    }

    const onSubmit = (type = 'validar') => {
        form.setFieldsValue({ type });
        form.submit();
    }

    return (
        <>
            <Form form={form} name={`fpi`} onFinish={onFinish} component="form">
                <AlertMessages formStatus={formStatus} />
                <ContentConfirm {...data} />
            </Form>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button size="small" disabled={confirmLoading} danger type="primary" onClick={() => onSubmit('ignorar')}>Ignorar</Button>
                    <Button size="small" disabled={confirmLoading} onClick={closeSelf}>Cancelar</Button>
                    <Button size="small" disabled={confirmLoading} type="primary" onClick={onSubmit}>Validar</Button>
                </Space>
            </Portal>
            }
        </>
    );
};

const ColumnEstado = ({ record, onAction, showConfirm, setShowConfirm, showMenuActions, setShowMenuActions }) => {
    const { status, temp_ofabrico } = record;
    const modal = useModalv4();
    const [action, setAction] = useState();

    const onShowConfirm = (action) => {
        const { status, temp_ofabrico, cliente_cod, cliente_nome, iorder, item, item_nome, ofabrico, produto_id, produto_cod, qty_item, item_thickness, item_diam, item_core, item_width, item_id } = record;
        modal.show({
            propsToChild: true, footer: "ref",
            maskClosable: false,
            closable: false,
            height:"300px",
            title: <TitleConfirm status={status} action={action} ofabrico={ofabrico} />,
            content: <PromiseFormConfirm data={{ status, temp_ofabrico, cliente_cod, cliente_nome, iorder, item, item_nome, ofabrico, produto_id, produto_cod, action, qty_item, item_thickness, item_diam, item_core, item_width, item_id, onAction }} />
        });
    }
    const onShowMenuActions = () => {
        const { status, cod, temp_ofabrico_agg } = record;
        setShowMenuActions({ show: true, data: { status, aggCod: cod, aggId: temp_ofabrico_agg, onAction } });
    }

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {((status == 0 || !status) && !temp_ofabrico) && <>
                <TagButton onClick={() => onShowConfirm('validar')} style={{ width: "110px", textAlign: "center" }} icon={<CheckOutlined />} color="#108ee9">Validar</TagButton>
            </>}
            {((status == 1 || !status) && temp_ofabrico) && <>
                <TagButton onClick={() => onAction(record, "inpreparation", () => { })} style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="warning">Em Elaboração</TagButton>
            </>}
            {(status == 2 && temp_ofabrico) && <>
                <TagButton onClick={() => onShowMenuActions()} style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="orange">Na Produção</TagButton>
            </>}
            {/*             {status == 4 && <>
                <TagButton onClick={() => showPopconfirm('finalizar')} style={{ width: "98px", textAlign: "center" }} icon={<SyncOutlined spin />} color="processing">Em Curso</TagButton>
                <Dropdown overlay={() => menu(['reabrir', 'suspender'], showPopconfirm)} trigger={['click']}>
                    <TagButton>...</TagButton>
                </Dropdown>
            </>} */}
            {status == 3 && <>
                <TagButton onClick={() => onShowMenuActions()} style={{ width: "110px", textAlign: "center" }} icon={<SyncOutlined spin />} color="success">Em Produção</TagButton>
            </>}
            {/*             {status == 3 && <>
                <TagButton onClick={() => showPopconfirm('iniciar')} style={{ width: "98px", textAlign: "center" }} icon={<ClockCircleOutlined />} color="warning">A Aguardar</TagButton>
                <Dropdown overlay={() => menu(['iniciar', 'reabrir'], showPopconfirm)} trigger={['click']}>
                    <TagButton>...</TagButton>
                </Dropdown>
            </>} */}
            {status == 9 && <>
                <Tag /* onClick={showPopConfirm}  */ style={{ width: "110px", textAlign: "center" }} color="error">Finalizada</Tag>
                {/*                 <Dropdown overlay={() => menu(['reabrir'], showPopconfirm)} trigger={['click']}>
                    <TagButton>...</TagButton>
                </Dropdown> */}
            </>}
        </div>
    );
}


const TitleMenuActions = ({ aggCod }) => {
    const v = useContext(SocketContext);
    const navigate = useNavigate();

    useEffect(() => { }, [v?.data?.bobinagens]);

    const onValidate = () => {
        navigate('/app/validateReellings', { state: {} });
    }

    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Space>
                    <div><b style={{ textTransform: "capitalize" }}></b>{aggCod}</div>
                    {v !== null && <Alert onClick={onValidate} style={{ cursor: "pointer", padding: "1px 15px" }} message={<div><span style={{ fontSize: "14px", fontWeight: 700 }}>{JSON.parse(v.data?.bobinagens).cnt}</span> Bobinagens por <Button size='small' style={{ paddingLeft: "0px" }} onClick={onValidate} type="link">Validar.</Button></div>} type="warning" showIcon />}
                </Space>
            </div>
        </div>
    );
}

const MenuActions = ({ showMenuActions, setShowMenuActions }) => {
    const [form] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = React.useState(false);
    const [modalText, setModalText] = React.useState('Content of the modal');
    const { aggId, aggCod } = showMenuActions.data;
    const [formStatus, setFormStatus] = useState({});

    useEffect(() => {
        console.log(showMenuActions)
    }, [showMenuActions]);

    const handleCancel = () => {
        setShowMenuActions({ show: false, data: {} });
    };

    return (
        <ResponsiveModal
            title={<TitleMenuActions aggCod={aggCod} />}
            visible={showMenuActions.show}
            centered
            responsive
            onCancel={handleCancel}
            maskClosable={true}
            destroyOnClose={true}
            fullWidthDevice={100}
            height="100vh"
            footer={null}
            bodyStyle={{ backgroundColor: "#f0f0f0" }}
        >
            <YScroll>
                <Suspense fallback={<></>}><FormMenuActions aggId={aggId} /></Suspense>
            </YScroll>
        </ResponsiveModal>
    );
};


const actionItems = [
    { label: 'Packing List', key: 'pl-pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} /> },
    { label: 'Packing List', key: 'pl-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} /> },
    { label: 'Packing List Detalhado', key: 'pld-pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} /> },
    { label: 'Packing List Detalhado', key: 'pld-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} /> }
];

const PackingListForm = ({ r, downloading, form }) => {


    useEffect(() => {
        let f = {};
        if (r.matricula) {
            f = { container: r.matricula };
        }
        if (r.matricula_reboque) {
            f = { ...f, container_trailer: r.matricula_reboque };
        }
        form.setFieldsValue(f);
    }, []);

    useEffect(() => {

    }, [downloading]);

    return (
        <Spin spinning={downloading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
            <Form form={form} initialValues={{ produto_cod: r.produto_cod, container: r?.container }}>
                <FormLayout form={form} id="plist">
                    <Field forInput={false} name="produto_cod" label={{ enabled: true, width: "60px", text: "Produto", pos: "top" }}><Input size="small" /></Field>
                    <Field name="container" label={{ enabled: true, width: "60px", text: "Container", pos: "top" }}><Input size="small" /></Field>
                    <Field name="container_trailer" label={{ enabled: true, width: "60px", text: "Trailer Container", pos: "top" }}><Input size="small" /></Field>
                </FormLayout>
            </Form>
        </Spin>
    );
}


const Action = ({ v, r, dataAPI }) => {
    const modal = useModalv4();
    const [form] = useForm();
    const [downloading, setDownloading] = useState(false);

    const onModal = (item) => {
        let title = "";
        switch (item.key) {
            case "pl-pdf":
                title = `Imprimir Packing List <Pdf> ${r.prf}`
                break;
            case "pld-pdf":
                title = `Imprimir Packing List Detalhado <Pdf> ${r.prf}`
                break;
            case "pl-excel":
                title = `Imprimir Packing List <Excel> ${r.prf}`
                break;
            case "pld-excel":
                title = `Imprimir Packing List Detalhado <Excel> ${r.prf}`
                break;
        }
        modal.show({ propsToChild: true, width: '500px', height: '200px', title, onOk: () => onDownload(item), content: <PackingListForm form={form} downloading={downloading} r={{ ...r, produto_cod: r.item_nome.substring(0, r.item_nome.lastIndexOf(' L')) }} /> });
    }


    const onDownload = async (item) => {
        const values = form.getFieldsValue(true);
        setDownloading(true);
        const requestData = dataAPI.getPostRequest();
        requestData.url = `${API_URL}/exportfile/`;
        requestData.parameters = {
            ...requestData.parameters,
            "config": "default",
            "conn-name": "PG-SGP-GW",
            "export": item.key.split('-')[1],
            "data": {
                "TITLE": "PACKING LIST",
                "PRODUCT_ID": values.produto_cod,
                "CONTAINER": values.container,
                "CONTAINER-TRAILER": values.container_trailer,
                "PRF_COD": r.prf
            }
        };

        switch (item.key.split('-')[0]) {
            case "pl":
                requestData.parameters.name = "PACKING-LIST";
                requestData.parameters.path = "PACKING-LIST/PACKING-LIST-MASTER";
                //modal.show({ propsToChild: true, width: '1500px', height: '700px', minFullHeight: 800, content: <FormCortes forInput={record?.forInput} record={record} /> });
                break;
            case "pld":
                requestData.parameters.name = "PACKING-LIST-DETAILED";
                requestData.parameters.path = "PACKING-LIST/PACKING-LIST-DETAILED-MASTER";
                //modal.show({ propsToChild: true, width: '1500px', height: '700px', minFullHeight: 800, content: <FormCortes forInput={record?.forInput} record={record} /> });
                break;
        }
        console.log(requestData.parameters)
        const response = await fetchPostBlob(requestData);
        setDownloading(false);
        downloadFile(response.data, `PACKING-LIST-${new Date().toJSON().slice(0, 10)}.${item.key.split('-')[1]}`);
    }

    return (
        <>
            {r.prf &&
                <Dropdown overlay={<Menu onClick={onModal} items={actionItems} />}>
                    <Button size="small" icon={<EllipsisOutlined /* style={{fontSize:"26px"}}  */ />} />
                </Dropdown>
            }
        </>
    )
}


export default () => {
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false });
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({
        payload: {
            url: `${API_URL}/ofabricolist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, sort: [
                /* { column: 'status', direction: 'ASC', options: "NULLS FIRST" },  */
                { column: 'ofabrico', direction: 'DESC' },
                /* { column: 'completa' }, { column: 'end_date', direction: 'DESC' } */
            ]
        }
    });
    const elFilterTags = document.getElementById('filter-tags');
    const [flyoutStatus, setFlyoutStatus] = useState({ visible: false, fullscreen: false });
    const flyoutFooterRef = useRef();
    const [estadoRecord, setEstadoRecord] = useState(false);

    const [showConfirm, setShowConfirm] = useState({ show: false, data: {} });
    const [showMenuActions, setShowMenuActions] = useState({ show: false, data: {} });

    useEffect(() => {
        const cancelFetch = cancelToken();
        dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, []);

    const selectionRowKey = (record) => {
        return `${record.ofabrico}-${isValue(record.item, undefined)}-${isValue(record.iorder, undefined)}`;
    }

    const reloadFromChild = () => {
        dataAPI.fetchPost();
    }

    const onEstadoChange = async (record, action, data) => {
        const { cliente_cod, cliente_nome, iorder, item, ofabrico, produto_id, qty_item, item_diam, item_core, item_thickness, item_width, item_id } = record;
        let response;
        switch (action) {
            case 'validar':
                setLoading(true);
                response = await fetchPost({
                    url: `${API_URL}/savetempordemfabrico/`,
                    parameters: { cliente_cod, cliente_nome, iorder, item, ofabrico_cod: ofabrico, produto_id, artigo: data, qty_item, artigo_diam: item_diam, artigo_core: item_core, artigo_width: item_width, item_id, artigo_thickness: item_thickness }
                });
                if (response.data.status !== "error") {
                    dataAPI.fetchPost();
                }
                setLoading(false);
                return response;
            case 'ignorar':
                setLoading(true);
                response = await fetchPost({ url: `${API_URL}/ignorarordemfabrico/`, parameters: { ofabrico } });
                if (response.data.status !== "error") {
                    dataAPI.fetchPost();
                }
                setLoading(false);
                return response;
            case 'inpreparation':
                setShowValidar(prev => ({ ...prev, show: !prev.show, record }));
                break;
            case 'reabrir':
                console.log('reabrir', record);
                break;
            case 'iniciar':
                console.log('iniciar', record);
                break;
            case 'finalizar':
                console.log('finalizar', record);
                break;
            case 'suspender':
                console.log('suspender', record);
                break;
        }
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "ofabricolist",
            include: {
                ...((common) => (
                    {
                        action: { title: "", fixed: "left", width: 40, render: (v, r) => <Action v={v} r={r} dataAPI={dataAPI} />, ...common },
                        ofabrico: { title: "Ordem Fabrico", fixed: 'left', width: 130, render: v => <b>{v}</b>, ...common },
                        prf: { title: "PRF", width: 130, render: v => <b>{v}</b>, ...common },
                        iorder: { title: "Encomenda(s)", width: 130, ...common },
                        cod: { title: "Agg", width: 130, render: v => <span style={{ color: "#096dd9" }}>{v}</span>, ...common },
                        /* ofabrico_sgp: { title: "OF.SGP", width: 60, render: v => <>{v}</>, ...common }, */
                        estado: { title: "", width: 125, render: (v, r) => <ColumnEstado record={r} showMenuActions={showMenuActions} setShowMenuActions={setShowMenuActions} /*showConfirm={showConfirm} setShowConfirm={setShowConfirm} */ onAction={onEstadoChange} /*    setEstadoRecord={setEstadoRecord} estadoRecord={estadoRecord} reloadParent={reloadFromChild} rowKey={selectionRowKey(r)} record={r} */ />, ...common },
                        /* options: { title: "", sort: false, width: 25, render: (v, r) => <ActionButton content={<MenuActionButton record={r} />} />, ...common }, */
                        //item: { title: "Artigo(s)", width: 140, render: v => <>{v}</>, ...common },
                        item_nome: { title: "Artigo(s)", ellipsis: true, render: v => <div style={{ /* overflow:"hidden", textOverflow:"ellipsis" */whiteSpace: 'nowrap' }}>{v}</div>, ...common },
                        cliente_nome: { title: "Cliente(s)", ellipsis: true, render: v => <div style={{ whiteSpace: 'nowrap' }}><b>{v}</b></div>, ...common },
                        start_date: { title: "Início Previsto", ellipsis: true, render: (v, r) => <div style={{ whiteSpace: 'nowrap' }}><span>{dayjs((r.start_prev_date) ? r.start_prev_date : v).format(DATETIME_FORMAT)}</span></div>, ...common },
                        end_date: { title: "Fim Previsto", ellipsis: true, render: (v, r) => <div style={{ whiteSpace: 'nowrap' }}><span>{(r.end_prev_date) && dayjs(r.end_prev_date).format(DATETIME_FORMAT)}</span></div>, ...common },
                        //produzidas: { title: "Produzidas", width: 100, render: (v, r) => <ColumnProgress type={1} record={r} />, ...common },
                        //pstock: { title: "Para Stock", width: 100, render: (v, r) => <ColumnProgress type={2} record={r} />, ...common },
                        //total: { title: "Total", width: 100, render: (v, r) => <ColumnProgress type={3} record={r} />, ...common },
                        /* details: {
                            title: "", width: 50, render: (v, r) => <Space>
                                {r.stock == 1 && <GrStorage title="Para Stock" />}
                                {r.retrabalho == 1 && <RiRefreshLine title="Para Retrabalho" />}
                            </Space>, table: "sgp_op", ...common
                        } */


                        //PRFNUM_0: { title: "Prf", width: '160px', ...common },
                        //DSPTOTQTY_0: { title: "Quantidade", width: '160px', ...common }
                        //COLUNA2: { title: "Coluna 2", width: '160px', render: v => dayjs(v).format(DATE_FORMAT), ...common },
                        //COLUNA3: { title: "Coluna 3", width: '20%', render: v => <div style={{ whiteSpace: 'nowrap' }}><b>{v}</b></div>, ...common }
                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    const closeFlyout = () => {
        setFlyoutStatus(prev => ({ ...prev, visible: false }));
    }

    const ordemFabricoStatusField = ({ onChange } = {}) => {
        return (
            <SelectField onChange={onChange} keyField="value" valueField="label" style={{ width: 150 }} options={
                [{ value: "Todos", label: "Todos" },
                { value: "Por Validar", label: "Por validar" },
                { value: "Em Elaboração", label: "Em Elaboração" },
                { value: "Na Produção", label: "Na Produção" },
                { value: "Em Produção", label: "Em Produção" },
                { value: "Finalizada", label: "Finalizada" }]
            } />
        );
    }

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                <MenuActions showMenuActions={showMenuActions} setShowMenuActions={setShowMenuActions} />
                {/*<PromiseConfirm showConfirm={showConfirm} setShowConfirm={setShowConfirm} /> */}
                <Suspense fallback={<></>}><Drawer showWrapper={showValidar} setShowWrapper={setShowValidar} parentReload={dataAPI.fetchPost}><FormOFabricoValidar /></Drawer></Suspense>
                {/* <ModalValidar showValidar={showValidar} setShowValidar={setShowValidar} /> */}
                {/*                 <SubLayout flyoutWidth="700px" flyoutStatus={flyoutStatus} style={{ height: "100vh" }}>
                    <SubLayout.content> */}
                <ToolbarTable form={formFilter} dataAPI={dataAPI} setFlyoutStatus={setFlyoutStatus} flyoutStatus={flyoutStatus} ordemFabricoStatusField={ordemFabricoStatusField} />
                {elFilterTags && <Portal elId={elFilterTags}>
                    <FilterTags form={formFilter} filters={dataAPI.getAllFilter()} schema={filterSchema} rules={filterRules()} />
                </Portal>}
                <Table
                    title={<Title level={4}>Ordens de Fabrico</Title>}
                    columnChooser={false}
                    reload
                    stripRows
                    darkHeader
                    size="small"
                    toolbar={<GlobalSearch columns={columns?.report} form={formFilter} dataAPI={dataAPI} setShowFilter={setShowFilter} showFilter={showFilter} ordemFabricoStatusField={ordemFabricoStatusField} />}
                    selection={{ enabled: false, rowKey: record => selectionRowKey(record), onSelection: setSelectedRows, multiple: false, selectedRows, setSelectedRows }}
                    paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                    dataAPI={dataAPI}
                    columns={columns}
                    onFetch={dataAPI.fetchPost}
                    scroll={{ x: (SCREENSIZE_OPTIMIZED.width - 20), y: '70vh', scrollToFirstRowOnChange: true }}
                //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}
                />
                {/*                     </SubLayout.content>
                    <SubLayout.flyout>
                        <Container.Header fullScreen={false} setStatus={setFlyoutStatus} left={<Title level={4} style={{ marginBottom: "0px" }}>Title</Title>} />
                        <Container.Body>

                        </Container.Body> */}
                {/* <Container.Footer right={<div ref={flyoutFooterRef}/>} /> */}
                {/*                     </SubLayout.flyout>
                </SubLayout>
 */}
            </Spin>


        </>
    )
}