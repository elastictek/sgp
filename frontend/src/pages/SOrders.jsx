import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues } from 'utils';

import FormManager, { FieldLabel, TitleForm, Field, FieldSet, RangeDateField, WrapperForm, FilterDrawer, SelectField, FilterTags, AutoCompleteField, useMessages } from "components/form";
import Table, { setColumns } from "components/table";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import MoreFilters from 'assets/morefilters.svg'
import SubLayout from "components/SubLayout";
import Container from "components/container";

import { Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip } from "antd";
const { Option } = Select;

import Icon, { SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CheckCircleOutlined, SyncOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
const { Title } = Typography;

/* import FormOrdemFabricoArtigos from "./ordemFabrico/FormArtigos"; */

const ToolbarTable = ({ form, dataAPI, groupByOrder, setGroupByOrder, setFlyoutStatus, flyoutStatus, ordemFabricoStatusField }) => {

    // const onFormChange = (type, changedValues, allValues) => {
    //     switch (type) {
    //         case "filter":
    //             /* form.setFieldsValue(allValues); */
    //             break;
    //     }
    // }

    // const handleOFState = (v) => {
    //     dataAPI.addFilters({ ofstatus: v }, false);
    //     dataAPI.first();
    //     dataAPI.fetchPost();
    // }

    const grouped = () => {
        dataAPI.clearSort();
        dataAPI.addParameters({ groupByOrder: !groupByOrder });
        dataAPI.first();
        dataAPI.fetchPost();
        dataAPI.clearData();
        setGroupByOrder(prev => !prev);
    }



    const leftContent = (
        <>
            <Button type="primary" size="small" disabled={flyoutStatus.visible ? true : false} onClick={() => setFlyoutStatus(prev => ({ ...prev, visible: !prev.visible }))}>Nova Ordem de Fabrico</Button>
        </>
    );

    const rightContent = (
        <Space>
            <div style={{ display: "flex", flexDirection: "row", whiteSpace: "nowrap" }}>
                <div>Agrupar por Encomenda:&nbsp;</div>
                <div><Switch size="small" checked={groupByOrder} onClick={grouped} /></div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }}>
                <div>Ordem de Fabrico:&nbsp;Estado&nbsp;</div>
                <div>
                    <FormManager noStyle={true} visible={true} form={form}>
                        <Field noStyle={true} name="ofstatus" initialValue='all' noLabel>
                            {ordemFabricoStatusField()}
                        </Field>
                    </FormManager>
                </div>
            </div>
        </Space>
    );

    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}

const menu = (
    <Menu>
        <Menu.Item key="1" icon={<UserOutlined />}>
            1st menu item
        </Menu.Item>
    </Menu>
);


const Expandable = styled.div`
    padding: 20px 80px; 
    background: #f0f0f0;
    
    .connector{
        position: absolute;
        top: -10px;
        left: 60px;
        height: 60px;
        z-index: 999;
        border-left: 2px dotted #8c8c8c;
        border-bottom: 2px dotted #8c8c8c;
        width: 25px;
    }
`;


const GlobalSearch = ({ form, dataAPI, setShowFilter, showFilter, ordemFabricoStatusField } = {}) => {
    const [formData, setFormData] = useState({});
    const [changed, setChanged] = useState(false);


    const fetchCustomers = async (value) => {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellcustomerslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_customer"]: `%${value.replaceAll(' ', '%%')}%` } });
        return rows;
    }
    const fetchOrders = async (value) => {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellorderslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_order"]: `%${value.replaceAll(' ', '%%')}%` } });
        return rows;
    }
    const fetchItems = async (value) => {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellitemslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_item"]: `%${value.replaceAll(' ', '%%')}%` } });
        return rows;
    }

    const ordersField = () => (
        <AutoCompleteField
            onChange={(v, options) => { }}
            handleSearch={fetchOrders}
            keyField="SOHNUM_0" valueField="SOHNUM_0" labelField={(item, valueField, keyField) => `${item[keyField]}  -  ${item['PRFNUM_0']}`}
            dropdownMatchSelectWidth={350}
            placeholder="Nº Encomenda/Nº Proforma"
            allowClear />
    );

    const customersField = () => (
        <AutoCompleteField
            onChange={(v, options) => { }}
            handleSearch={fetchCustomers}
            keyField="BPCNUM_0" valueField="BPCNAM_0" labelField={(item, valueField, keyField) => `${item[keyField]}  -  ${item[valueField]}`}
            dropdownMatchSelectWidth={350}
            placeholder="Nº/Nome Cliente"
            allowClear />
    );

    const itemsField = () => (
        <AutoCompleteField
            onChange={(v, options) => { }}
            handleSearch={fetchItems}
            keyField="ITMREF_0" valueField="ITMDES1_0" labelField={(item, valueField, keyField) => `${item[keyField]}  -  ${item[valueField]}`}
            dropdownMatchSelectWidth={350}
            placeholder="Cód/Designação Artigo"
            allowClear />
    );

    const onFinish = (type, values) => {
        switch (type) {
            case "filter":
                (!changed) && setChanged(true);
                const _values = {
                    ...values,
                    fmulti_customer: (values["fmulti_customer"] && values["fmulti_customer"].value !== '') ? `%${values["fmulti_customer"].value.replaceAll(' ', '%%')}%` : undefined,
                    fmulti_order: (values["fmulti_order"] && values["fmulti_order"].value !== '') ? `%${values["fmulti_order"].value.replaceAll(' ', '%%')}%` : undefined,
                    fmulti_item: (values["fmulti_item"] && values["fmulti_item"].value !== '') ? `%${values["fmulti_item"].value.replaceAll(' ', '%%')}%` : undefined,
                    LASDLVNUM_0: (values["LASDLVNUM_0"] && values["LASDLVNUM_0"] !== '') ? `%${values["LASDLVNUM_0"].replaceAll(' ', '%%')}%` : undefined,
                    forderdate: getFilterRangeValues(values["forderdate"]?.formatted),
                    SHIDAT_0: getFilterRangeValues(values["SHIDAT_0"]?.formatted)
                };
                dataAPI.addFilters(_values);
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };

    /*     const onFormChange = (type, changedValues, allValues) => {
            switch (type) {
                case "filter":
                    if ('ofstatus' in changedValues) {
                        dataAPI.addFilters({ ofstatus: changedValues.ofstatus }, false);
                        dataAPI.first();
                        dataAPI.fetchPost();
                    }
                    break;
            }
        } */

    const onValuesChange = (type, changedValues, allValues) => {
        switch (type) {
            case "filter":
                if ('ofstatus' in changedValues) {
                    dataAPI.addFilters({ ofstatus: changedValues.ofstatus }, false);
                    dataAPI.first();
                    dataAPI.fetchPost();
                } else {
                    console.log("ENTREI NO Values Change do form...", allValues);
                    form.setFieldsValue(allValues);
                }
                break;
        }
    }

    return (
        <>
            <FilterDrawer schema={filterSchema({ form, ordersField, customersField, itemsField, ordemFabricoStatusField })} filterRules={filterRules()} form={form} width={350} setShowFilter={setShowFilter} showFilter={showFilter} />
            <FormManager
                visible={true}
                form={form}
                name="feature-form-1"
                layout="horizontal"
                onFinish={(values) => onFinish("filter", values)}
                onValuesChange={(changedValues, allValues) => onValuesChange("filter", changedValues, allValues)}
                //messages={messages}
                /* formData={formData} */
                style={{ minWidth: "40vw" }}
                rowGap="10px"
                field={{ /* split: 3, */ layout: "vertical", gap: "5px", overflow: false, labelStyle: { align: "left" /* width: "90px", align: "right", gap: "10px" */ }, alert: { position: "right", visible: true } }}
                fieldSet={{ wide: 4, layout: "horizontal", overflow: false, grow: false /* alert: { position: "right", visible: true } */, alert: { position: "bottom", visible: true } }}
            >
                <FieldSet wide={5}>
                    <Field name="fmulti_order" initialValue={{ key: '', value: '', label: '' }} noLabel>
                        {ordersField()}
                    </Field>
                </FieldSet>
                <FieldSet>
                    <Field name="fmulti_customer" initialValue={{ key: '', value: '', label: '' }} noLabel>
                        {customersField()}
                    </Field>
                </FieldSet>
                <FieldSet wide={5}>
                    <Field name="forderdate" noLabel>
                        {/* <RangePicker allowClear onPressEnter={() => form.submit()} placeholder={['','']}/> */}
                        <RangeDateField />
                    </Field>
                </FieldSet>
                <FieldSet wide={2} style={{ alignItems: "flex-end", justifyContent: "flex-start" }}>


                    <ButtonGroup>
                        <Button style={{ padding: "3px" }} onClick={() => form.submit()}><SearchOutlined /></Button>
                        <Button style={{ padding: "3px" }}><MoreFilters style={{ fontSize: "16px", marginTop: "2px" }} onClick={() => setShowFilter(prev => !prev)} /></Button>
                        <Dropdown overlay={menu}>
                            <Button style={{ padding: "3px" }}><DownOutlined /></Button>
                        </Dropdown>
                    </ButtonGroup>

                </FieldSet>
            </FormManager>
        </>
    );
}

const filterRules = (keys) => {
    return getSchema({
        fmulti_item: Joi.string().label("Cód/Designação Artigo")
    }, keys).unknown(true);
}

const filterSchema = ({ ordersField, customersField, itemsField, ordemFabricoStatusField }) => [
    { fmulti_order: { label: "Nº Encomenda/Nº Proforma", field: ordersField } },
    { fmulti_customer: { label: "Nº/Nome de Cliente", field: customersField } },
    { forderdate: { label: "Data Encomenda", field: { type: "rangedate" } } },
    { fmulti_item: { label: "Cód/Designação Artigo", field: itemsField, initialValue: { key: '', value: '', label: '' } } },
    { SHIDAT_0: { label: "Data Expedição", field: { type: "rangedate" } } },
    { LASDLVNUM_0: { label: "Nº Última Expedição" } },
    { ofstatus: { label: "Ordem de Fabrico: Estado", field: ordemFabricoStatusField, ignoreFilterTag: (v) => v === 'all' } }
];

const Artigos = ({ record }) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/sellorderitemsList/`, pagination: { enabled: false }, filter: { SOHNUM_0: record.SOHNUM_0 }, sort: [] } });

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "items",
            include: {
                SOHNUM_0: { title: "Nº Encomenda" },
                ITMREF_0: { title: "Cod. Artigo", optional: false, width: 180 },
                ORIQTY_0: { title: "Quantidade Original", optional: false, width: 180 },
                QTY_0: { title: "Quantidade", optional: false, width: 120 },
                ITMDES1_0: { title: "Designação", optional: false },
                TSICOD_2: { title: "Gramagem", optional: false, width: 100 },
                TSICOD_3: { title: "Largura", optional: false, width: 100 },
                SDHNUM_0: { title: "Nº Expedição", optional: false, width: 150 }
            },
            exclude: ["SOHNUM_0"]
        }
    );

    useEffect(() => {
        console.log("ENTREI RECORD...");
        dataAPI.first();
        dataAPI.fetchPost();
    }, []);

    return (
        <>
            {dataAPI.hasData() &&
                <Expandable>
                    <div className="connector"></div>
                    <Table
                        header={false}
                        /* title={<Title level={4}>Artigos</Title>} */
                        columnChooser={false}
                        reload
                        size="small"
                        /* toolbar={<GlobalSearch form={formFilter} dataAPI={dataAPI} />} */
                        selection={{ enabled: true, rowKey: record => record.ITMREF_0, onSelection: setSelectedRows, multiple: true, selectedRows, setSelectedRows }}
                        dataAPI={dataAPI}
                        columns={columns}
                        onFetch={dataAPI.fetchPost}
                        scroll={{ y: 400, scrollToFirstRowOnChange: true }} />
                </Expandable>
            }
        </>
    );
}

const FormOrdemFabrico = () => {
    const [formData, setFormData] = useState({});
    const [form] = Form.useForm();

    const onFinish = (values) => {

    };

    const onFormChange = (changedValues, allValues) => {
        console.log("onFormChange -> ", allValues);
        form.setFieldsValue(allValues);
    }

    return (
        <div style={{ width: "100%", height: "100vh", borderLeft: "1px solid #f0f0f0", boxShadow: "5px 10px" }}>
            <div style={{ display: "flex", flexDirection: "column", flexWrap: "nowrap", width: "100%", height: "100%" }}>
                <Toolbar />
                <Header>Header...</Header>
                <Body>
                    <FormManager
                        visible={true}
                        form={form}
                        name="form-oredemfabrico"
                        layout="vertical"
                        onFinish={(values) => onFinish(values)}
                        onValuesChange={(changedValues, allValues) => onFormChange(changedValues, allValues)}
                        //messages={messages}
                        formData={formData}
                        rowGap="10px"
                        field={{ /* split: 3, */ layout: "vertical", gap: "5px", overflow: false, labelStyle: { align: "left" /* width: "90px", align: "right", gap: "10px" */ }, alert: { position: "right", visible: true } }}
                        fieldSet={{ wide: 4, layout: "horizontal", overflow: false, grow: false /* alert: { position: "right", visible: true } */, alert: { position: "bottom", visible: true } }}
                    >

                    </FormManager>
                </Body>
                <Footer>Footer...</Footer>
            </div>
        </div>
    );
}



const expandedRowRender = (record) => {
    return (<Artigos record={record} />);
}

export default () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);
    const [formFilter] = Form.useForm();
    const [groupByOrder, setGroupByOrder] = useState(false);
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/sellorders/`, parameters: { groupByOrder: groupByOrder }, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: {}, sort: [{ column: 'SOHNUM_0', direction: 'DESC', order: 'descend', table: 'enc' }] } });
    const elFilterTags = document.getElementById('filter-tags');
    const [flyoutStatus, setFlyoutStatus] = useState({ visible: false, fullscreen: false });
    const [newOrdemFabrico, setNewOrdemFabrico] = useState([]);
    const flyoutFooterRef = useRef();

    useEffect(() => {
        dataAPI.first();
        dataAPI.fetchPost();
    }, []);

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "sorders",
            include: {
                ...((common) => (
                    {
                        ...(!groupByOrder) && {
                            ITMREF_0: { title: "Cód. Artigo", width: '160px', render: v => <b>{v}</b>, style: { background: "red" }/* , fixed:'left' */, ...common },
                            ITMDES1_0: { title: "Designação Artigo", width: '350px', render: v => <div style={{  width: '340px',overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px' }}>{v}</div>, ...common }
                        }
                    }
                ))({ table: 'itm', idx: 0, optional: false }),

                ...((common) => (
                    {
                        SOHNUM_0: { title: "Nº Encomenda", width: '160px', render: v => <b>{v}</b>, ...common },
                        PRFNUM_0: { title: "Nº Fatura Proforma", width: '160px', ...common },
                        ORDDAT_0: { title: "Data Encomenda", width: '160px', render: v => dayjs(v).format(DATE_FORMAT), ...common },
                        BPCNAM_0: { title: "Nome Cliente", width: '20%', render: v => <div style={{ whiteSpace: 'nowrap'}}><b>{v}</b></div>, ...common }
                    }
                ))({ table: 'enc', idx: 1, optional: false }),

                ...((common) => (
                    {
                        BPCORD_0: { title: "Nº Cliente", ...common },
                        SHIDAT_0: { title: "Data Expedição", visible: true, render: v => dayjs(v).format(DATE_FORMAT), ...common },
                        DEMDLVDAT_0: { title: "Data Expedição Solicitada", render: v => dayjs(v).format(DATE_FORMAT), ...common },
                        CUSORDREF_0: { title: "Ref. Encomenda Cliente", visible: true, ...common },
                        DAYLTI_0: { title: "Prazo Entrega (Dias)", visible: true, ...common },
                        LASDLVDAT_0: { title: "Data Última Expedição", render: v => dayjs(v).format(DATE_FORMAT), ...common },
                        LASDLVNUM_0: { title: "Nº Última Expedição", ...common },
                        LASINVDAT_0: { title: "Data Última Fatura", render: v => dayjs(v).format(DATE_FORMAT), ...common },
                        LASINVNUM_0: { title: "Nº Última Fatura", ...common },
                        DSPTOTQTY_0: { title: "Quantidade Acumulada", ...common },
                        DSPTOTVOL_0: { title: "Volume Acumulado", ...common },
                        DSPTOTWEI_0: { title: "Peso Acumulado", ...common },
                        DSPVOU_0: { title: "Unidade Volume", ...common },
                        DSPWEU_0: { title: "Unidade Peso", ...common },
                        CREUSR_0: { title: "Operador Criação", ...common },
                        CREDAT_0: { title: "Data Criação", render: v => dayjs(v).format(DATE_FORMAT), ...common },
                        CREDATTIM_0: { title: "Data/Hora Criação", render: v => dayjs(v).format(DATETIME_FORMAT), ...common },
                        UPDUSR_0: { title: "Operador Modificação", ...common },
                        UPDDAT_0: { title: "Data Modificação", render: v => dayjs(v).format(DATE_FORMAT), ...common },
                        UPDDATTIM_0: { title: "Data/Hora Modificação", render: v => dayjs(v).format(DATETIME_FORMAT), ...common },
                    }
                ))({ table: 'enc' }),
                ACTION: {
                    width: "40px",
                    title: '',
                    sort: false,
                    optional: false,
                    /*                     fixed:'right', */
                    idx: 999,
                    render: (v, r) => (
                        <div style={{ display: "flex", flexDirection: "row", flex: 1, justifyContent: "flex-end" }}>
                            {!hasOrdemFabrico(r) && flyoutStatus.visible && <Button style={{marginRight:"8px"}} size="small" icon={<RightOutlined />} onClick={() => addNewOrdemFabrico(r)} />}
                            {r.status === 0 && <Tag icon={<ClockCircleOutlined />} color="default" />}
                            {r.status === 1 && <Tag icon={<SyncOutlined spin />} color="processing" />}
                            {r.status === 99 && <Tag icon={<CheckCircleOutlined />} color="success" />}
                        </div>
                    )
                }
            },
            exclude: []
        }
    );

    const closeFlyout = ()=>{
        setFlyoutStatus(prev=>({...prev,visible:false}));
    }


    const hasOrdemFabrico = (record) => {
        if (!record.ordemfabrico_id && newOrdemFabrico.findIndex(v => (v.SOHNUM_0 == record.SOHNUM_0 && v.ITMREF_0 == record.ITMREF_0)) === -1) {
            return false;
        }
        return true;
    }

    const addNewOrdemFabrico = (record) => {
        if (!hasOrdemFabrico(record)) {
            setNewOrdemFabrico(prev => [...prev, { ...record }]);
        }
    }



    const onExpand = (expanded, key) => {
        const singleRowExpand = true;
        if (singleRowExpand) {
            if (expanded) {
                setExpandedRows([key]);
            } else {
                setExpandedRows([]);
            }
        } else {
            let newRows = [];
            if (expanded) {
                if (!expandedRows.includes(key)) {
                    newRows = [...expandedRows, key];
                    setExpandedRows(newRows);
                }
            } else {
                newRows = expandedRows.filter(item => item !== key);
                setExpandedRows(newRows);
            }
        }
        console.log("####", expanded, key);
    }


    const ordemFabricoStatusField = () => (
        <SelectField keyField="value" valueField="label" style={{ width: 150 }} options={
            [{ value: "all", label: "Todos" },
            { value: "notcreated", label: "Não Criada" },
            { value: "inpreparation", label: "Em Preparação" },
            { value: "inprogress", label: "Em Progresso" },
            { value: "finished", label: "Finalizada" }]
        } />
    );

    return (
        <>
            <SubLayout flyoutWidth="700px" flyoutStatus={flyoutStatus} style={{ height: "100vh" }}>
                <SubLayout.content>
                    <ToolbarTable form={formFilter} dataAPI={dataAPI} groupByOrder={groupByOrder} setGroupByOrder={setGroupByOrder} setFlyoutStatus={setFlyoutStatus} flyoutStatus={flyoutStatus} ordemFabricoStatusField={ordemFabricoStatusField} />
                    {elFilterTags && <Portal elId={elFilterTags}>
                        <FilterTags form={formFilter} filters={dataAPI.getAllFilter()} schema={filterSchema} rules={filterRules()} />
                    </Portal>}
                    <Table
                        title={<Title level={4}>Encomendas</Title>}
                        columnChooser
                        reload
                        size="small"
                        toolbar={<GlobalSearch form={formFilter} dataAPI={dataAPI} setShowFilter={setShowFilter} showFilter={showFilter} ordemFabricoStatusField={ordemFabricoStatusField} />}
                        selection={{ enabled: false, rowKey: record => groupByOrder ? record.SOHNUM_0 : `${record.SOHNUM_0}-${record.ITMREF_0}-${record.SOPLIN_0}`, onSelection: setSelectedRows, multiple: true, selectedRows, setSelectedRows }}
                        {...groupByOrder && {
                            expandable: { expandedRowRender },
                            onExpand: (expanded, record) => onExpand(expanded, record.SOHNUM_0),
                            expandedRowKeys: expandedRows
                        }}
                        paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                        dataAPI={dataAPI}
                        columns={columns}
                        onFetch={dataAPI.fetchPost}
                    /* scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }} */
                    />
                </SubLayout.content>
                <SubLayout.flyout>
                    <Container.Header fullScreen={false} setStatus={setFlyoutStatus} left={<Title level={4} style={{ marginBottom: "0px" }}>Nova Ordem de Fabrico</Title>} />
                    <Container.Body>
                        <FormOrdemFabricoArtigos dataSource={newOrdemFabrico} setDataSource={setNewOrdemFabrico} footerRef={flyoutFooterRef} closeParent={closeFlyout} reloadDataTable={dataAPI.fetchPost}/>
                    </Container.Body>
                    {/* <Container.Footer right={<div ref={flyoutFooterRef}/>} /> */}
                </SubLayout.flyout>
            </SubLayout>



        </>
    )
}