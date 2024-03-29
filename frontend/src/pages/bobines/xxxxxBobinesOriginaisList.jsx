import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues, getFilterValue, isValue, noValue } from 'utils';
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

import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge } from "antd";
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled } from '@ant-design/icons';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SwapRightOutlined, CheckSquareTwoTone, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, BOBINE_DEFEITOS, API_URL, GTIN, SCREENSIZE_OPTIMIZED, DOSERS } from 'config';
const { Title,Text } = Typography;
import { SocketContext } from 'gridlayout';
import { MediaContext } from 'app';
const { TextArea } = Input;


const mainTitle = 'Rastreabilidade de Bobines (Originais)';

const useStyles = createUseStyles({});

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const filterRules = (keys) => { return getSchema({}, keys).unknown(true); }

const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;

const ToolbarTable = ({ form, dataAPI }) => {
    const navigate = useNavigate();

    const onChange = (v) => {
        form.submit();
    }

    const leftContent = (
        <>
            {/* <button onClick={() => navigate(-1)}>go back</button> */}
            {/* <Button type="primary" size="small" disabled={flyoutStatus.visible ? true : false} onClick={() => setFlyoutStatus(prev => ({ ...prev, visible: !prer.visible }))}>Flyout</Button> */}
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

const BobinesFilterField = ()=>{
    return(
        <TextArea rows={4} placeholder="Lista de Bobines" maxLength={20000} allowClear/>
    );
}
const BobinagensFilterField = ()=>{
    return(
        <TextArea rows={4} placeholder="Lista de Bobinagens" maxLength={20000} allowClear />
    );
}
const PaletesFilterField = ()=>{
    return(
        <TextArea rows={4} placeholder="Lista de Paletes" maxLength={20000} allowClear/>
    );
}

const filterSchema = ({ }) => [
    { fbobines: { label: "Bobines", field: BobinesFilterField } },
    { fbobinagens: { label: "Bobinagens", field: BobinagensFilterField } },
    { fpaletes: { label: "Paletes", field: PaletesFilterField } },
    { fbobinedate: { label: "Data Bobine", field: { type: "rangedate", size: 'small' } } }
    /* { fdate: { label: "Data Início/Fim", field: { type: "rangedate", size: 'small' } } },
    { ftime: { label: "Hora Início/Fim", field: { type: "rangetime", size: 'small' } } },
    { fhasbobinagem: { label: "Relação", field: HasBobinagemField } },
    { fevento: { label: "Evento", field: EventField } } */
];

const GlobalSearch = ({ form, dataAPI, columns, setShowFilter, showFilter } = {}) => {
    const [changed, setChanged] = useState(false);
    const onFinish = (type, values) => {
        switch (type) {
            case "filter":
                (!changed) && setChanged(true);
                const { typelist, ...vals } = values;
                const _values = {
                    ...vals,
                    fbobinedate: getFilterRangeValues(values["fbobinedate"]?.formatted)
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
            "title": mainTitle,
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

            <FilterDrawer schema={filterSchema({ form })} filterRules={filterRules()} form={form} width={350} setShowFilter={setShowFilter} showFilter={showFilter} />
            <Form form={form} name={`fps`} onFinish={(values) => onFinish("filter", values)} onValuesChange={onValuesChange}>
                <FormLayout
                    id="LAY-BOBINAGENS"
                    layout="horizontal"
                    style={{ width: "700px", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{ guides: false, wide: [4, 4, 1.5, 1.5], style: { marginLeft: "2px", alignSelf: "end" } }}
                    fieldSet={{ guides: false, wide: 16, margin: false, layout: "horizontal", overflow: false }}
                >
                     <Field name="fbobinedate" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Data Bobine", pos: "top" }}>
                        <RangeDateField size='small' />
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



const Quantity = ({ v, unit = "kg" }) => {
    return (<div style={{ display: "flex", flexDirection: "row" }}>{v && <><div style={{ width: "60px" }}>{parseFloat(v).toFixed(2)}</div><div>{unit}</div></>}</div>);

}

const Teste = ({ r, v }) => {
    return (<div>{v}</div>);
}

export default () => {
    const classes = useStyles()
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false, data: {} });
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({
        payload: { url: `${API_URL}/bobinesoriginaislist/`, parameters: {}, pagination: { enabled: false, page: 1, pageSize: 15 }, filter: {}, sort: [] }
    });
    const elFilterTags = document.getElementById('filter-tags');
    const { data: dataSocket } = useContext(SocketContext) || {};
    const { windowDimension } = useContext(MediaContext);

    useEffect(() => {
        const cancelFetch = cancelToken();
        dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, []);

    const selectionRowKey = (record) => {
        return `bo-${record.rowid}`;
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "bobinesoriginaislist",
            include: {
                ...((common) => (
                    {
                        nome: { title: "Palete", fixed: "left", width: 80, render: (v, r) => v, ...common },
                        bobine: { title: "Bobine", fixed: "left", width: 120, render: (v, r) => <b>{v}</b>, ...common },
                        largura0: { title: "Lar.", width: 80, render: (v, r) => v, ...common },
                        comp0: { title: "Comp.", width: 80, render: (v, r) => v, ...common },
                        original_lvl1: { title: "Nível 1", width: 120, render: (v, r) => <Text style={{color:"blue"}}>{v}</Text>, ...common },
                        largura1: { title: "Lar. N1", width: 80, render: (v, r) => v, ...common },
                        comp1_original: { title: "Comp. N1", width: 80, render: (v, r) => v !== 0 && v, ...common },
                        comp1_atual: { title: "C. Atual N1", width: 100, render: (v, r) => v !== 0 && v, ...common },
                        metros_cons: { title: "M. Cons. N1", width: 100, render: (v, r) => v !== 0 && v, ...common },
                        original_lvl2: { title: "Nível 2", width: 120, render: (v, r) => <Text style={{color:"blue"}}>{v}</Text>, ...common },
                        largura2: { title: "Lar. N2", width: 80, render: (v, r) => v, ...common },
                        comp2_original: { title: "Comp. N2", width: 80, render: (v, r) => v !== 0 && v, ...common },
                        comp2_atual: { title: "C. Atual N2", width: 100, render: (v, r) => v !== 0 && v, ...common },
                        metros_cons_lvl1: { title: "M. Cons. N2", width: 100, render: (v, r) => v !== 0 && v, ...common },
                        original_lvl3: { title: "Nível 3", width: 120, render: (v, r) => <Text style={{color:"blue"}}>{v}</Text>, ...common },
                        largura3: { title: "Lar. N3", width: 80, render: (v, r) => v, ...common },
                        comp3_original: { title: "Comp. N3", width: 80, render: (v, r) => v !== 0 && v, ...common },
                        comp3_atual: { title: "C. Atual N3", width: 100, render: (v, r) => v !== 0 && v, ...common },
                        metros_cons_lvl2: { title: "M. Cons. N3", width: 100, render: (v, r) => v !== 0 && v, ...common },
                        original_lvl4: { title: "Nível 4", width: 120, render: (v, r) => <Text style={{color:"blue"}}>{v}</Text>, ...common },
                        largura4: { title: "Lar. N4", width: 80, render: (v, r) => v, ...common },
                        comp4_original: { title: "Comp. N4", width: 80, render: (v, r) => v !== 0 && v, ...common },
                        comp4_atual: { title: "C. Atual N4", width: 100, render: (v, r) => v !== 0 && v, ...common },
                        metros_cons_lvl3: { title: "M. Cons. N4", width: 100, render: (v, r) => v !== 0 && v, ...common },
                        original_lvl5: { title: "Nível 5", width: 120, render: (v, r) => <Text style={{color:"blue"}}>{v}</Text>, ...common },
                        largura5: { title: "Lar. N5", width: 80, render: (v, r) => v, ...common },
                        comp5_original: { title: "Comp. N5", width: 80, render: (v, r) => v !== 0 && v, ...common },
                        comp5_atual: { title: "C. Atual N5", width: 100, render: (v, r) => v !== 0 && v, ...common },
                        metros_cons_lvl4: { title: "M. Cons. N5", width: 100, render: (v, r) => v !== 0 && v, ...common },
                        root: { title: "Raíz", width: 120, render: (v, r) => v, ...common },
                        nretrabalhos: { title: "Nº Níveis", width: 60, render: (v, r) => v, ...common },
                        emenda: { title: "Emenda", ellipsis: true, width: 560, render: (v, r) => v, ...common },
                        emenda_lvl1: { title: "Emenda Nível 1", ellipsis: true, width: 460, render: (v, r) => v, ...common },
                        emenda_lvl2: { title: "Emenda Nível 2", ellipsis: true, width: 360, render: (v, r) => v, ...common },
                        emenda_lvl3: { title: "Emenda Nível 3", ellipsis: true, width: 360, render: (v, r) => v, ...common },
                        emenda_lvl4: { title: "Emenda Nível 4", ellipsis: true, width: 360, render: (v, r) => v, ...common },
                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                <ToolbarTable form={formFilter} dataAPI={dataAPI} />
                {/* {elFilterTags && <Portal elId={elFilterTags}>
                    <FilterTags form={formFilter} filters={dataAPI.getAllFilter()} schema={filterSchema} rules={filterRules()} />
                </Portal>} */}
                <Table
                    title={<Title level={4}>{mainTitle}</Title>}
                    columnChooser={false}
                    reload
                    rowHover
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