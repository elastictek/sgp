import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues, getFilterValue, isValue } from 'utils';
import uuIdInt from "utils/uuIdInt";
import FormManager, { FieldLabel, FieldSet as OldFieldSet, FilterTags, AutoCompleteField as OldAutoCompleteField, useMessages, DropDown } from "components/form";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, InputAddon, SelectField, TitleForm, WrapperForm, SelectDebounceField, AutoCompleteField, RangeDateField, RangeTimeField, FilterDrawer, CheckboxField, SwitchField, SelectMultiField } from "components/formLayout";
import Drawer from "components/Drawer";
import Table, { setColumns } from "components/table";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import ResponsiveModal from "components/ResponsiveModal";
import MoreFilters from 'assets/morefilters.svg';
import { Outlet, useNavigate } from "react-router-dom";
import YScroll from "components/YScroll";
import { MdAdjust } from 'react-icons/md';


import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge } from "antd";
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled } from '@ant-design/icons';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SwapRightOutlined, CheckSquareTwoTone, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, BOBINE_DEFEITOS, API_URL, GTIN, SCREENSIZE_OPTIMIZED, DOSERS } from 'config';
const { Title } = Typography;
import { SocketContext, MediaContext } from '../App';
const BobinesValidarList = lazy(() => import('../bobines/BobinesValidarList'));


const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const filterRules = (keys) => {
    return getSchema({
        //field1: Joi.string().label("Designação")
    }, keys).unknown(true);
}

const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;

const filterSchema = ({ ordersField, customersField, itemsField, ordemFabricoStatusField }) => [
    { fartigo: { label: "Artigo", field: { type: 'input', size: 'small' } } },
    { flote: { label: "Lote", field: { type: 'input', size: 'small' } } },
    { fmulti_dosers: { label: 'Doseador Formulação', field: { type: 'selectmulti', size: 'small', options: DOSERS } } },
    { fqty_lote: { label: "Qtd. Lote", field: { type: 'input', size: 'small' } } },
    { fqty_lote_available: { label: "Qtd. Lote Disponível (Em Linha/Buffer)", field: { type: 'input', size: 'small' } } },
    { fqty_artigo_available: { label: "Qtd. Artigo Disponível (Em Linha/Buffer)", field: { type: 'input', size: 'small' } } },
    { fmulti_location: { label: 'Localização', field: { type: 'selectmulti', size: 'small', options: [{ value: "ARM", label: "ARM" }, { value: "BUFFER", label: "BUF" }] } } },
    { fpicked: { label: 'Na Linha', field: { type: 'select', size: 'small', options: [{ value: "ALL", label: " " }, { value: 1, label: "Sim" }, { value: 0, label: "Não" }] } } },
    //{ f_ofabrico: { label: "Ordem de Fabrico" } },
    //{ f_agg: { label: "Agregação Ordem de Fabrico" } },
    //{ fofstatus: { label: "Ordem de Fabrico: Estado", field: ordemFabricoStatusField, initialValue: 'all', ignoreFilterTag: (v) => v === 'all' } },
    //{ fmulti_order: { label: "Nº Encomenda/Nº Proforma", field: ordersField } },
    //{ fmulti_customer: { label: "Nº/Nome de Cliente", field: customersField } },
    //{ fmulti_item: { label: "Cód/Designação Artigo", field: itemsField } },
    //{ forderdate: { label: "Data Encomenda", field: { type: "rangedate", size: 'small' } } },
    //{ fstartprevdate: { label: "Data Prevista Início", field: { type: "rangedate", size: 'small' } } },
    //{ fendprevdate: { label: "Data Prevista Fim", field: { type: "rangedate", size: 'small' } } },

    /* { SHIDAT_0: { label: "Data Expedição", field: { type: "rangedate" } } },
    { LASDLVNUM_0: { label: "Nº Última Expedição" } },
    { ofstatus: { label: "Ordem de Fabrico: Estado", field: ordemFabricoStatusField, ignoreFilterTag: (v) => v === 'all' } } */
];

const ToolbarTable = ({ form, dataAPI, typeListField, setTypeList, typeList }) => {
    const navigate = useNavigate();

    const onChange = (v) => {
        form.submit();
    }

    const leftContent = (
        <>
            {/* <button onClick={() => navigate(-1)}>go back</button> */}
            {/* <Button type="primary" size="small" disabled={flyoutStatus.visible ? true : false} onClick={() => setFlyoutStatus(prev => ({ ...prev, visible: !prev.visible }))}>Flyout</Button> */}
        </>
    );

    const rightContent = (
        <Space>
            <div style={{ display: "flex", flexDirection: "row", whiteSpace: "nowrap" }}>

            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }}>
                {/* <Form form={form} initialValues={{ typelist: [] }}>
                    <Form.Item name="typelist" noStyle>
                        {typeListField({ onChange, typeList })}
                    </Form.Item>
                </Form> */}
            </div>
        </Space>
    );
    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}

const GlobalSearch = ({ form, dataAPI, columns, setShowFilter, showFilter } = {}) => {
    const [changed, setChanged] = useState(false);
    const onFinish = (type, values) => {
        switch (type) {
            case "filter":
                (!changed) && setChanged(true);
                const { typelist, ...vals } = values;
                const _values = {
                    ...vals,
                    fartigo: getFilterValue(vals?.fartigo, 'any'),
                    flote: getFilterValue(vals?.flote, 'any'),
                    fqty_lote: getFilterValue(vals?.fqty_lote, '=='),
                    fqty_artigo_available: getFilterValue(vals?.fqty_artigo_available, '=='),
                    fqty_lote_available: getFilterValue(vals?.fqty_lote_available, '==')
                };
                dataAPI.addFilters(_values);
                dataAPI.addParameters({ typelist })
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

    const pickedField = () => (
        <SelectField
            placeholder="Na Linha"
            size="small"
            dropdownMatchSelectWidth={250}
            allowClear
            options={[{ value: "ALL", label: " " }, { value: 1, label: "Sim" }, { value: 0, label: "Não" }]}
        />
    );

    const locationField = () => (
        <SelectMultiField
            placeholder="Localização"
            size="small"
            dropdownMatchSelectWidth={250}
            allowClear
            options={[{ value: "ARM", label: "ARM" }, { value: "BUFFER", label: "BUF" }]}
        />
    );
    const artigosField = () => (
        <Input size="small" />
    );
    const lotesField = () => (
        <Input size="small" />
    );

    /*     const fetchCustomers = async (value) => {
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
     */
    /* const customersField = () => (
        <AutoCompleteField
            placeholder="Cliente"
            size="small"
            keyField="BPCNAM_0"
            textField="BPCNAM_0"
            dropdownMatchSelectWidth={250}
            allowClear
            fetchOptions={fetchCustomers}
        />
    );
    const locationField = () => (
        <SelectMultiField
            placeholder="Localização"
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
    ); */

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
    }

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
        delete requestData.parameters.cols.bobines;
        requestData.parameters.cols.area.title = "Área m2";
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

            <FilterDrawer schema={filterSchema({ form /* ordersField, customersField, itemsField */ })} filterRules={filterRules()} form={form} width={350} setShowFilter={setShowFilter} showFilter={showFilter} />
            <Form form={form} name={`fps`} onFinish={(values) => onFinish("filter", values)} onValuesChange={onValuesChange}>
                <FormLayout
                    id="LAY-BOBINAGENS"
                    layout="horizontal"
                    style={{ width: "700px", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{ guides: false, wide: [3, 4, 3, 2, 1.5, 1.5], style: { marginLeft: "2px", alignSelf: "end" } }}
                    fieldSet={{ guides: false, wide: 16, margin: false, layout: "horizontal", overflow: false }}
                >
                    <Field name="fmulti_location" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Localização", pos: "top" }}>
                        {locationField()}
                    </Field>
                    <Field name="fartigo" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Artigo", pos: "top" }}>
                        {artigosField()}
                    </Field>
                    <Field name="flote" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Lote", pos: "top" }}>
                        {lotesField()}
                    </Field>
                    <Field name="fpicked" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Na Linha", pos: "top" }}>
                        {pickedField()}
                    </Field>
                    <FieldItem label={{ enabled: false }}>
                        <ButtonGroup size='small' style={{ marginLeft: "5px" }}>
                            <Button style={{ padding: "0px 3px" }} onClick={() => form.submit()}><SearchOutlined /></Button>
                            <Button style={{ padding: "0px 3px" }}><MoreFilters style={{ fontSize: "16px", marginTop: "2px" }} onClick={() => setShowFilter(prev => !prev)} /></Button>
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

const Formulacao = ({ data, rowIndex }) => {
    const formulacao = JSON.parse(data);
    return (
        <div style={{ display: "flex", flexDirection: "row" }}>{formulacao && formulacao.map((v, i) => {
            return (<Tag style={{ fontWeight: "10px", width: "150px" }} color="blue" key={`frm-${rowIndex}-${i}`}><b>{v.doseador.replace(/(^,)|(,$)/g, '')}</b>: {v.arranque}% | {v.densidade}g/cm&#xB3;</Tag>);
        })}</div>
    );
}

/* const Ofs = ({ data, rowIndex }) => {
    const ofs = JSON.parse(data);
    console.log(ofs)
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>{ofs && ofs.map((v, i) => {
            return (<Tag style={{fontWeight:"10px",marginTop:"5px"}} key={`ofs-${rowIndex}-${i}`}><b>{v.order_cod}</b>{v.prf_cod}{v.item_des}{v.cliente_nome}</Tag>);
        })}</div>
    );
} */

const ColumnToLine = ({ record, dataAPI }) => {
    const toLine = record.loc === "BUFFER" && !record.picked;

    const onClick = async () => {
        //{"group_id": "3462729180381184", "lote_id": "9589", "artigo_cod": "RVMAX0863000012","n_lote": "VM6202V21092801AB50296", "qty_lote": "650.00", "doser": "A1"}, 
        const _uid = uuIdInt(0).uuid();
        const pickItems = [];
        for (let itm of JSON.parse(record.frm)) {
            for (let m of itm.doseador.split(',')) {
                if (m) {
                    const pick = { "group_id": _uid, "lote_id": record.rowid, "artigo_cod": record.matprima_cod, "n_lote": record.n_lote, "qty_lote": record.qty_lote, "doser": m };
                    pickItems.push(pick);
                }
            }
        }
        if (pickItems.length > 0) {
            const response = await fetchPost({ url: `${API_URL}/pick/`, parameters: { pickItems } });
            dataAPI.fetchPost();
        }
    }

    return (<>{toLine && <Tooltip title="Transferir para a Linha"><Button onClick={onClick} size="small" icon={<SwapRightOutlined />}></Button></Tooltip>}</>);
}

export default ({ type, data }) => {
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false, data: {} });
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/stocklist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 10 }, filter: { acs_id: data?.acs_id }, sort: [] } });
    const elFilterTags = document.getElementById('filter-tags');
    const { data: dataSocket } = useContext(SocketContext) || {};
    const { windowDimension } = useContext(MediaContext);
    const [typeList, setTypeList] = useState();

    useEffect(() => {
        const cancelFetch = cancelToken();
        dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, []);

    const selectionRowKey = (record) => {
        return `${record.rowid}`;
    }


    const typeListField = ({ onChange, setTypeList, typeList } = {}) => {
        return (
            <>
/*             <SelectMultiField
                    style={{ minWidth: "200px" }}
                    name="typelist"
                    size="small"
                    dropdownMatchSelectWidth={250}
                    allowClear
                    options={[{ value: "A", label: "Lotes na Linha" }, { value: "!A", label: "Lotes fora da Linha" }, { value: "B", label: "Artigos/Lotes na formulação" }, { value: "C", label: "Agrupar Por Artigo" }]}
                    onChange={onChange}
                /> */
            </>
        );
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "bufferlist",
            include: {
                ...((common) => (
                    {
                        matprima_des: { title: "Matéria Prima", width: 190, fixed: 'left', render: (v, r) => <b>{v}</b>, ...common },
                        n_lote: { title: "Lote", width: 180, fixed: 'left', render: (v, r) => <b>{v}</b>, ...common },
                        matprima_cod: { title: "Cod. MP", width: 120, render: (v, r) => v, ...common },
                        loc: { title: "Loc.", width: 50, render: (v, r) => v, ...common },
                        picked: { title: "Linha", width: 30, align: 'center', render: (v, r) => v === 1 && <CheckSquareTwoTone twoToneColor="#389e0d" style={{ fontSize: '16px' }} />, ...common },
                        qty_lote: { title: "Qtd. Lote", width: 120, render: (v, r) => v && `${parseFloat(v).toFixed(2)} ${r.unit}`, ...common },
                        qty_lote_available: { title: "Qtd. Lote Disponível", width: 120, render: (v, r) => v && `${parseFloat(v).toFixed(2)} ${r.unit}`, ...common },
                        qty_lote_consumed: { title: "Qtd. Lote Comsumido", width: 120, render: (v, r) => v && `${parseFloat(v).toFixed(2)} ${r.unit}`, ...common },
                        qty_artigo_available: { title: "Qtd. Artigo Disponível", width: 120, render: (v, r) => v && `${parseFloat(v).toFixed(2)} ${r.unit}`, ...common },
                        action_line: { title: "", align: "center", width: 60, render: (v, r) => <ColumnToLine record={r} dataAPI={dataAPI} />, ...common },
                        frm: { title: "Formulação", render: (v, r, i) => <Formulacao rowIndex={i} data={v} />, ...common }
                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                <ToolbarTable form={formFilter} dataAPI={dataAPI} typeListField={typeListField} setTypeList={setTypeList} />
                {elFilterTags && <Portal elId={elFilterTags}>
                    <FilterTags form={formFilter} filters={dataAPI.getAllFilter()} schema={filterSchema} rules={filterRules()} />
                </Portal>}
                <Table
                    title={!type && <Title level={4}>Matéria Prima em Stock (Currente)</Title>}
                    columnChooser={false}
                    reload
                    stripRows
                    darkHeader
                    size="small"
                    toolbar={<GlobalSearch columns={columns?.report} form={formFilter} dataAPI={dataAPI} setShowFilter={setShowFilter} showFilter={showFilter} />}
                    selection={{ enabled: false, rowKey: record => selectionRowKey(record), onSelection: setSelectedRows, multiple: false, selectedRows, setSelectedRows }}
                    paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                    dataAPI={dataAPI}
                    columns={columns}
                    onFetch={dataAPI.fetchPost}
                    scroll={{ x: (SCREENSIZE_OPTIMIZED.width - 20), y: '70vh', scrollToFirstRowOnChange: true }}
                //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}
                />
            </Spin>
        </>
    )
}