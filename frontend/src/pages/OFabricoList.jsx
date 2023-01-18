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
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, InputAddon, SelectField, WrapperForm, SelectDebounceField, AutoCompleteField, RangeDateField, FilterDrawer } from "components/formLayout";
import Drawer from "components/Drawer";
import Table, { setColumns } from "components/table";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import MoreFilters from 'assets/morefilters.svg'
import AlertMessages from "components/alertMessages";
import ColumnSettings from "components/columnSettings";
import Reports, { downloadReport } from "components/DownloadReports";
import TagButton from "components/TagButton";
import ResponsiveModal from 'components/ResponsiveModal';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import YScroll from "components/YScroll";
import { useModal } from "react-modal-hook";
import ResponsiveModalv2 from 'components/Modal';
import { usePermission } from "utils/usePermission";

const FormOFabricoValidar = React.lazy(() => import('./planeamento/ordemFabrico/FormOFabricoValidar'));
const FormMenuActions = React.lazy(() => import('./currentline/FormMenuActions'));
import { SocketContext } from './App';


import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal } from "antd";
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled } from '@ant-design/icons';
import useModalv4 from 'components/useModalv4';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { VerticalSpace } from 'components/formLayout';
import { useForm } from 'antd/lib/form/Form';
const { Title } = Typography;
import ToolbarTitle from 'components/ToolbarTitle';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';

const title = "Ordens de Fabrico";
const TitleForm = ({ data, form, ordemFabricoStatusField }) => {

    const onChange = () => {
        form.submit();
    }

    return (<ToolbarTitle title={
        <Col xs='content' style={{}}><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title}</span></Col>
    } right={
        <Col xs="content">
            <Form form={form} initialValues={{ fofstatus: "Todos" }}>
                <FormLayout id="tbt-of" schema={schema}>
                    <Field name="fofstatus" label={{ enabled: true, width: "60px", text: "Estado", pos: "left" }}>{ordemFabricoStatusField({ onChange })}</Field>
                </FormLayout>
            </Form>
        </Col>
    } />);
}

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
    { fendprevdate: { label: "Data Prevista Fim", field: { type: "rangedate", size: 'small' } } }
];

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
const GlobalSearch = ({ form, dataAPI, columns, setShowFilter, showFilter, ordemFabricoStatusField } = {}) => {
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

    return (
        <>

            <FilterDrawer schema={filterSchema({ form, ordersField, customersField, itemsField, ordemFabricoStatusField })} filterRules={filterRules()} form={form} width={350} setShowFilter={setShowFilter} showFilter={showFilter} />
            <Form form={form} name={`fps`} onFinish={(values) => onFinish("filter", values)} onValuesChange={onValuesChange} onKeyPress={(e) => { if (e.key === "Enter") { form.submit(); } }}>
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
                        </ButtonGroup>
                    </FieldItem>
                    <FieldItem label={{ enabled: false }}>
                        <Reports columns={columns} dataAPI={dataAPI} title="Ordens de Fabrico" />
                    </FieldItem>
                </FormLayout>
            </Form>
        </>
    );
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

const ContentConfirm = ({ cliente_nome, iorder, item, item_nome, produto_id, produto_cod, action }) => {
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

const IFrame = ({src})=> {
    return <div dangerouslySetInnerHTML={{ __html: `<iframe frameBorder="0" onload="this.width=screen.width;this.height=screen.height;" src='${src}'/>`}} />;
}


const ColumnEstado = ({ record, onAction, showConfirm, setShowConfirm, showMenuActions, setShowMenuActions, allow }) => {
    const { status, temp_ofabrico, ofabrico_sgp } = record;
    const modal = useModalv4();
    const [action, setAction] = useState();
    const navigate = useNavigate();

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModalv2 footer="ref" onCancel={hideModal} width={5000} height={5000} title={modalParameters.title}>
            <IFrame src={`/planeamento/ordemdeproducao/details/${modalParameters.ofabrico_sgp}/`}/>
        </ResponsiveModalv2>
    ), [modalParameters]);

    const onShowConfirm = (action) => {
        const { status, temp_ofabrico, cliente_cod, cliente_nome, iorder, item, item_nome, ofabrico, produto_id, produto_cod, qty_item, item_thickness, item_diam, item_core, item_width, item_id, prf } = record;
        modal.show({
            propsToChild: true, footer: "ref",
            maskClosable: false,
            closable: false,
            height: "300px",
            title: <TitleConfirm status={status} action={action} ofabrico={ofabrico} />,
            content: <PromiseFormConfirm data={{ status, temp_ofabrico, cliente_cod, cliente_nome, iorder, item, item_nome, ofabrico, produto_id, produto_cod, action, qty_item, item_thickness, item_diam, item_core, item_width, item_id, prf, onAction }} />
        });
    }
    const onShowMenuActions = () => {
        const { status, cod, temp_ofabrico_agg } = record;
        navigate("/app", { state: { aggId: temp_ofabrico_agg, tstamp: Date.now() }, replace: true });
        //navigate('/app/currentline/menuactions', { state: { status, aggCod: cod, aggId: temp_ofabrico_agg } });
        //setShowMenuActions({ show: true, data: { status, aggCod: cod, aggId: temp_ofabrico_agg, onAction } });
    }

    const onClickSgpBack = (v) =>{
        setModalParameters({title:"Ordem de Produção", ofabrico_sgp});
        showModal();
    }

    return (
        
        <div style={{ display: "flex", flexDirection: "row" }}>
            {((status == 0 || !status) && !temp_ofabrico && !ofabrico_sgp) && <>
                {allow ?
                <TagButton onClick={() => onShowConfirm('validar')} style={{ width: "110px", textAlign: "center" }} icon={<CheckOutlined />} color="#108ee9">Validar</TagButton>
                : <Tag style={{ width: "110px", textAlign: "center" }} icon={<CheckOutlined />} color="#108ee9">A Validar</Tag>
                }
            </>}
            {((status == 0 || !status) && !temp_ofabrico && ofabrico_sgp && record?.completa==1) && <>
                <TagButton onClick={() => onClickSgpBack(ofabrico_sgp)} style={{ width: "110px", textAlign: "center" }} color="error">Finalizada</TagButton>
            </>}
            {((status == 0 || !status) && !temp_ofabrico && ofabrico_sgp && record?.completa==0 && record.ativa==1) && <>
                <TagButton onClick={() => onClickSgpBack(ofabrico_sgp)} style={{ width: "110px", textAlign: "center" }} icon={<SyncOutlined spin />} color="success">Em Produção</TagButton>
            </>}
            {((status == 0 || !status) && !temp_ofabrico && ofabrico_sgp && record?.completa==0 && record.ativa==0) && <>
                <TagButton onClick={() => onClickSgpBack(ofabrico_sgp)} style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="orange">Na Produção</TagButton>
            </>}
            {((status == 1 || !status) && temp_ofabrico) && <>
                {allow ?
                <TagButton onClick={() => onAction(record, "inpreparation", () => { })} style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="warning">Em Elaboração</TagButton>
                :
                <Tag style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="warning">Em Elaboração</Tag>
                }
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
                <TagButton onClick={() => onShowMenuActions()} /* onClick={() => onShowMenuActions()} *//* onClick={showPopConfirm}  */ style={{ width: "110px", textAlign: "center" }} color="error">Finalizada</TagButton>
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

const rowReportItems = [
    { label: 'Packing List', key: 'pl-pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} />, data: { extension: "pdf", export: "pdf", name: "PACKING-LIST", path: "PACKING-LIST/PACKING-LIST-MASTER" } },
    { label: 'Packing List', key: 'pl-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { extension: "xlsx", export: "excel", name: "PACKING-LIST", path: "PACKING-LIST/PACKING-LIST-MASTER" } },
    { label: 'Packing List Detalhado', key: 'pld-pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} />, data: { extension: "pdf", export: "pdf", name: "PACKING-LIST-DETAILED", path: "PACKING-LIST/PACKING-LIST-DETAILED-MASTER" } },
    { label: 'Packing List Detalhado', key: 'pld-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { extension: "xlsx", export: "excel", name: "PACKING-LIST-DETAILED", path: "PACKING-LIST/PACKING-LIST-DETAILED-MASTER" } }
];


const fetchCargas = async (enc) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/cargaslookup/`, pagination: { limit: 20 }, filter: { enc } });
    return rows;
}

const PackingListForm = ({ r, form, ...rest }) => {
    const dataCargas = useDataAPI({ id: "cargaslookup", payload: { url: `${API_URL}/cargaslookup/`, parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [] } });
    useEffect(() => {
        dataCargas.addFilters({ enc: r.iorder });
        dataCargas.fetchPost();
        let f = {};
        if (r.matricula) {
            f = { container: r.matricula };
        }
        if (r.modo_exp) {
            let modo = "CONTAINER";
            switch (r.modo_exp) {
                case "1": modo = "CONTAINER"; break;
                case "3": modo = "TRUCK"; break;
                case "4": modo = "AIR"; break;
            }
            f = { ...f, modo_exp: modo };
        }
        if (r.matricula_reboque) {
            f = { ...f, container_trailer: r.matricula_reboque };
        }
        form.setFieldsValue(f);
    }, []);

    return (
        <Spin spinning={dataCargas.isLoading()} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
            <Form form={form} initialValues={{ produto_cod: r.produto_cod, container: r?.container }}>
                <FormLayout form={form} id="plist">
                    <Field forInput={false} name="produto_cod" label={{ enabled: true, width: "60px", text: "Produto", pos: "top" }}><Input size="small" /></Field>
                    <Field name="container" label={{ enabled: true, width: "60px", text: "Container", pos: "top" }}><Input size="small" /></Field>
                    <Field name="container_trailer" label={{ enabled: true, width: "60px", text: "Trailer Container", pos: "top" }}><Input size="small" /></Field>
                    <FieldSet field={{ wide: [8, 8], margin: "2px", }}>
                        <Field name="modo_exp" label={{ enabled: true, width: "60px", text: "Modo Expedição", pos: "top" }}><Input size="small" /></Field>
                        <Field name="po" label={{ enabled: true, width: "60px", text: "PO (Cliente)", pos: "top" }}><Input size="small" /></Field>
                    </FieldSet>
                    <Field name="carga" label={{ enabled: true, width: "60px", text: "Carga", pos: "top" }}>

                        <SelectField
                            placeholder="Cargas"
                            size="small"
                            keyField="id"
                            textField="carga"
                            dropdownMatchSelectWidth={250}
                            allowClear
                            data={dataCargas.getData().rows}
                        />

                    </Field>
                </FormLayout>
            </Form>
        </Spin>
    );
}

const Action = ({ v, r, dataAPI }) => {
    const modal = useModalv4();
    const [form] = useForm();
    const [downloading, setDownloading] = useState(false);

    const onDownload = async ({ type, r, limit, orientation, isDirty }) => {
        const values = form.getFieldsValue(true);
        let itm = rowReportItems.filter(v => v.key === type.key);
        if (itm.length <= 0) { return false; }
        let { parameters, ...data } = itm[0].data;
        let dataexport = {
            ...data,
            "conn-name": "PG-SGP-GW",
            "data": {
                "TITLE": "PACKING LIST",
                "PRODUCT_ID": values.produto_cod,
                "CONTAINER": values.container,
                "CONTAINER-TRAILER": values.container_trailer,
                "MODO-EXP": values.modo_exp,
                ...(values.carga && { "CARGA_ID": values.carga }),
                "PRF_COD": r.prf,
                "ORDER_COD": r.iorder,
                "PO_COD": values.po
            }
        };
        downloadReport({ dataAPI, url: `${API_URL}/exportfile/`, type, dataexport, limit, orientation, isDirty });
    }

    const showForm = ({ type, r, ...rest }) => {
        let title;
        switch (type.key) {
            case "pl-pdf":
                title = `Imprimir Packing List <Pdf> ${r.prf}`;
                break;
            case "pld-pdf":
                title = `Imprimir Packing List Detalhado <Pdf> ${r.prf}`;
                break;
            case "pl-excel":
                title = `Imprimir Packing List <Excel> ${r.prf}`;
                break;
            case "pld-excel":
                title = `Imprimir Packing List Detalhado <Excel> ${r.prf}`;
                break;
        }
        modal.show({ propsToChild: true, width: '500px', height: '320px', title, onOk: () => onDownload({ type, r, ...rest }), content: <PackingListForm form={form} downloading={false} r={{ ...r, produto_cod: r.item_nome.substring(0, r.item_nome.lastIndexOf(' L')) }} /> });
        return false;
    }

    return (
        <>

            {r.prf && <Reports onExport={(type, limit, orientation, isDirty) => showForm({ type, limit, orientation, isDirty, r })} items={rowReportItems} dataAPI={dataAPI} button={<Button size="small" icon={<EllipsisOutlined />} />} />}

            {/*  {r.prf &&
                <Dropdown overlay={<Menu onClick={onModal} items={actionItems} />}>
                    <Button size="small" icon={<EllipsisOutlined />} />
                </Dropdown>
            } */}
        </>
    )
}

export default () => {
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false });
    const [formFilter] = Form.useForm();
    const location = useLocation();
    const dataAPI = useDataAPI({ id: "ofabricolist", payload: { url: `${API_URL}/ofabricolist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, sort: [{ column: 'ofabrico', direction: 'DESC' }] } });
    const elFilterTags = document.getElementById('filter-tags');
    const [flyoutStatus, setFlyoutStatus] = useState({ visible: false, fullscreen: false });
    const [showMenuActions, setShowMenuActions] = useState({ show: false, data: {} });
    const permission = usePermission({ allowed: { planeamento:200 } });

    useEffect(() => {
        const cancelFetch = cancelToken();
        //dataAPI.first();
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
        const { cliente_cod, cliente_nome, iorder, prf, item, ofabrico, produto_id, qty_item, item_diam, item_core, item_thickness, item_width, item_id } = record;
        let response;
        switch (action) {
            case 'validar':
                setLoading(true);
                response = await fetchPost({
                    url: `${API_URL}/savetempordemfabrico/`,
                    parameters: { cliente_cod, cliente_nome, iorder, prf, item, ofabrico_cod: ofabrico, produto_id, artigo: data, qty_item, artigo_diam: item_diam, artigo_core: item_core, artigo_width: item_width, item_id, artigo_thickness: item_thickness }
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
                        estado: { title: "", sort:false, width: 125, render: (v, r) => <ColumnEstado allow={permission.allow()} record={r} showMenuActions={showMenuActions} setShowMenuActions={setShowMenuActions} /*showConfirm={showConfirm} setShowConfirm={setShowConfirm} */ onAction={onEstadoChange} /*    setEstadoRecord={setEstadoRecord} estadoRecord={estadoRecord} reloadParent={reloadFromChild} rowKey={selectionRowKey(r)} record={r} */ />, ...common },
                        /* options: { title: "", sort: false, width: 25, render: (v, r) => <ActionButton content={<MenuActionButton record={r} />} />, ...common }, */
                        //item: { title: "Artigo(s)", width: 140, render: v => <>{v}</>, ...common },
                        item_nome: { title: "Artigo(s)", ellipsis: true, render: v => <div style={{ /* overflow:"hidden", textOverflow:"ellipsis" */whiteSpace: 'nowrap' }}>{v}</div>, ...common },
                        cliente_nome: { title: "Cliente(s)", ellipsis: true, render: v => <div style={{ whiteSpace: 'nowrap' }}><b>{v}</b></div>, ...common },
                        start_date: { title: "Início Previsto", width: 130, ellipsis: true, render: (v, r) => <div style={{ whiteSpace: 'nowrap' }}><span>{dayjs((r.start_prev_date) ? r.start_prev_date : v).format(DATETIME_FORMAT)}</span></div>, ...common },
                        end_date: { title: "Fim Previsto", width: 130, ellipsis: true, render: (v, r) => <div style={{ whiteSpace: 'nowrap' }}><span>{(r.end_prev_date) && dayjs(r.end_prev_date).format(DATETIME_FORMAT)}</span></div>, ...common },
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
            {columns &&
                <>
                    {/*                     <Container.Provider initialState={{
                        columnsState: {
                            persistenceKey: 'pro-table-singe-demos',
                            persistenceType: 'localStorage',
                            onChange(value) {
                                console.log('value: ', value);
                            }
                        }, columns: columns.all
                    }}> */}
                    {/* <ColumnSettings columns={columns.all} /> */}
                    <Spin spinning={dataAPI.isLoading()} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ /* top: "50%", left: "50%", position: "absolute" */ }} >
                        <MenuActions showMenuActions={showMenuActions} setShowMenuActions={setShowMenuActions} />
                        <Suspense fallback={<></>}><Drawer showWrapper={showValidar} setShowWrapper={setShowValidar} parentReload={dataAPI.fetchPost}><FormOFabricoValidar /></Drawer></Suspense>
                        <TitleForm form={formFilter} dataAPI={dataAPI} setFlyoutStatus={setFlyoutStatus} flyoutStatus={flyoutStatus} ordemFabricoStatusField={ordemFabricoStatusField} />
                        {elFilterTags && <Portal elId={elFilterTags}>
                            <FilterTags form={formFilter} filters={dataAPI.getAllFilter()} schema={filterSchema} rules={filterRules()} />
                        </Portal>}
                        <Table
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
                        />
                    </Spin>
                    {/*                     </Container.Provider> */}
                </>
            }
        </>
    )
}