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

const filterRules = (keys) => {return getSchema({}, keys).unknown(true);}
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const filterSchema = ({ ordersField, customersField, itemsField, ordemFabricoStatusField }) => [
    { fartigo: { label: "Artigo", field: { type: 'input', size: 'small' } } },
    { flote: { label: "Lote", field: { type: 'input', size: 'small' } } },
    { fmulti_dosers: { label: 'Doseador Formulação', field: { type: 'selectmulti', size: 'small', options: DOSERS } } },
    { fqty_lote: { label: "Qtd. Lote", field: { type: 'input', size: 'small' } } },
    { fqty_lote_available: { label: "Qtd. Lote Disponível (Em Linha/Buffer)", field: { type: 'input', size: 'small' } } },
    { fqty_artigo_available: { label: "Qtd. Artigo Disponível (Em Linha/Buffer)", field: { type: 'input', size: 'small' } } },
    { fmulti_location: { label: 'Localização', field: { type: 'selectmulti', size: 'small', options: [{ value: "ARM", label: "ARM" }, { value: "BUFFER", label: "BUF" }] } } },
    { fpicked: { label: 'Na Linha', field: { type: 'select', size: 'small', options: [{ value: "ALL", label: " " }, { value: 1, label: "Sim" }, { value: 0, label: "Não" }] } } }
];

const ToolbarTable = ({ form, dataAPI, data, type }) => {
    const navigate = useNavigate();

    const onChange = (v) => {
        form.submit();
    }

    const leftContent = (
        <div style={{display:"flex",flexDirection:"row"}}>
            <div style={{marginRight:"2px"}}>{type==="addlotes" ? "Entrada na Linha" : "Saída da Linha "}</div>
            <div style={{marginRight:"2px"}}><b>{data.direction==="up" && "Antes de "}</b></div>
            <div style={{marginRight:"2px"}}>{data.bobinagem_nome} </div>
            {/* <button onClick={() => navigate(-1)}>go back</button> */}
            {/* <Button type="primary" size="small" disabled={flyoutStatus.visible ? true : false} onClick={() => setFlyoutStatus(prev => ({ ...prev, visible: !prev.visible }))}>Flyout</Button> */}
        </div>
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

const ColumnToLine = ({ record, dataAPI, data }) => {
    const onClick = async () => {
        console.log("recordddd",record,data);
        //{"group_id": "3462729180381184", "lote_id": "9589", "artigo_cod": "RVMAX0863000012","n_lote": "VM6202V21092801AB50296", "qty_lote": "650.00", "doser": "A1"}, 
        const _uid = uuIdInt(0).uuid();
        const pickItems = [];
        for (let itm of JSON.parse(record.frm)) {
            for (let m of itm.doseador.split(',')) {
                if (m) {
                    const pick = { "group_id": _uid, "lote_id": record.ROWID, "artigo_cod": record.ITMREF_0, "n_lote": record.LOT_0, "qty_lote": record.QTYPCU_0, "doser": m, "order":data.order, id:data.id };
                    pickItems.push(pick);
                }
            }
        }
        if (pickItems.length > 0) {
            console.log(data)
            const response = await fetchPost({ url: `${API_URL}/pickmanual/`, parameters: { pickItems,direction:data.direction,ig_id:data.ig_id,id:data.id } });
            dataAPI.fetchPost();
        }
    }

    return (<Button onClick={onClick} size="small" icon={<SwapRightOutlined />}></Button>);
}

export default ({ type, data }) => {
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false, data: {} });
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/stocklistbyigbobinagem/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 10 }, filter: { ig_id:data?.ig_id }, sort: [] } });
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
        return `${record.ROWID}`;
    }


//     const typeListField = ({ onChange, setTypeList, typeList } = {}) => {
//         return (
//             <>
// /*             <SelectMultiField
//                     style={{ minWidth: "200px" }}
//                     name="typelist"
//                     size="small"
//                     dropdownMatchSelectWidth={250}
//                     allowClear
//                     options={[{ value: "A", label: "Lotes na Linha" }, { value: "!A", label: "Lotes fora da Linha" }, { value: "B", label: "Artigos/Lotes na formulação" }, { value: "C", label: "Agrupar Por Artigo" }]}
//                     onChange={onChange}
//                 /> */
//             </>
//         );
//     }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "bufferlist",
            include: {
                ...((common) => (
                    {
                        action_line: { title: "", align: "center", width: 60, fixed:"left", render: (v, r) => <ColumnToLine record={r} dataAPI={dataAPI} data={data} />, ...common },
                        ITMDES1_0: { title: "Matéria Prima", width: 190, fixed: 'left', render: (v, r) => <b>{v}</b>, ...common },
                        LOT_0: { title: "Lote", width: 180, fixed: 'left', render: (v, r) => <b>{v}</b>, ...common },
                        ITMREF_0: { title: "Cod. MP", width: 120, render: (v, r) => v, ...common },
                        QTYPCU_0: { title: "Qtd. Lote", width: 120, render: (v, r) => v && `${parseFloat(v).toFixed(2)} ${r.PCU_0}`, ...common },
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
               {/*  <ToolbarTable form={formFilter} dataAPI={dataAPI} data={data} type={type}/> */}
{/*                 {elFilterTags && <Portal elId={elFilterTags}>
                    <FilterTags form={formFilter} filters={dataAPI.getAllFilter()} schema={filterSchema} rules={filterRules()} />
                </Portal>} */}
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