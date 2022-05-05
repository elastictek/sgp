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
import { MdAdjust } from 'react-icons/md';
import { GiBandageRoll } from 'react-icons/gi';
import { AiOutlineVerticalAlignTop, AiOutlineVerticalAlignBottom } from 'react-icons/ai';
import { VscDebugStart } from 'react-icons/vsc';
import { BsFillStopFill } from 'react-icons/bs';
import { IoCodeWorkingOutline } from 'react-icons/io5';






import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge } from "antd";
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled } from '@ant-design/icons';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SwapRightOutlined, CheckSquareTwoTone, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, BOBINE_DEFEITOS, API_URL, GTIN, SCREENSIZE_OPTIMIZED, DOSERS } from 'config';
const { Title } = Typography;
import { SocketContext, MediaContext } from '../App';

const useStyles = createUseStyles({
    noRelationRow: {
        backgroundColor: '#ffa39e'
    }
});

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const filterRules = (keys) => {
    return getSchema({
        //field1: Joi.string().label("Designação")
    }, keys).unknown(true);
}

const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;

const ToolbarTable = ({ form, dataAPI }) => {
    const navigate = useNavigate();

    const onChange = (v) => {
        form.submit();
    }

    const leftContent = (
        <>
            <button onClick={() => navigate(-1)}>go back</button>
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

const HasBobinagemField = () => (
    <SelectField
        placeholder="Relação"
        size="small"
        dropdownMatchSelectWidth={250}
        allowClear
        options={[{ value: "ALL", label: " " }, { value: 1, label: "Sim" }, { value: 0, label: "Não" }]}
    />
);

const EventField = () => (
    <SelectMultiField
        placeholder="Evento"
        size="small"
        dropdownMatchSelectWidth={250}
        allowClear
        options={[{ value: 1, label: "Troca Bobinagem" },
        { value: 8, label: "Working" },
        { value: 9, label: "Stop" },
        { value: 7, label: "Start" },
        { value: 6, label: "NW Superiror" },
        { value: 5, label: "NW Inferior" },
        ]}
    />
);

const filterSchema = ({ }) => [
    { fdate: { label: "Data Início/Fim", field: { type: "rangedate", size: 'small' } } },
    { ftime: { label: "Hora Início/Fim", field: { type: "rangetime", size: 'small' } } },
    { fhasbobinagem: { label: "Relação", field: HasBobinagemField } },
    { fevento: { label: "Evento", field: EventField } }
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
                    fdate: getFilterRangeValues(values["fdate"]?.formatted),
                    ftime: getFilterRangeValues(values["ftime"]?.formatted),
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
                    <Field name="fdate" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Data Início/Fim", pos: "top" }}>
                        <RangeDateField size='small' />
                    </Field>
                    <Field name="ftime" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Hora Início/Fim", pos: "top" }}>
                        <RangeTimeField size='small' format={TIME_FORMAT} />
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

const EventColumn = ({ v }) => {
    return (<>

        {v === "reeling_exchange" && <GiBandageRoll color="#69c0ff" size={20} />}
        {v === "state_stop" && <BsFillStopFill color="red" size={20} />}
        {v === "state_start" && <VscDebugStart color="orange" size={20} />}
        {v === "state_working" && <IoCodeWorkingOutline color="green" size={20} />}
        {v === "nw_sup_change" && <AiOutlineVerticalAlignTop size={20} />}
        {v === "nw_inf_change" && <AiOutlineVerticalAlignBottom size={20} />}

    </>);
}

const ExclamationButton = styled(Button)`
  &&& {
    background-color: #ffa940;
    border-color: #873800;
    color:#fff;
    &:hover{
        background-color: #52c41a;
        border-color: #52c41a;
    }
  }
`;

const AssignOFColumn = ({ v, e }) => {
    return (<>
        {v && <b>v</b>}
        {(!v && e === 1) && <ExclamationButton size="small" icon={<ExclamationCircleOutlined />} />}
    </>);
}

const Quantity = ({ v, unit = "kg" }) => {
    return (<div style={{ display: "flex", flexDirection: "row" }}>{v && <><div style={{ width: "60px" }}>{parseFloat(v).toFixed(2)}</div><div>{unit}</div></>}</div>);

}

export default () => {
    const classes = useStyles()
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false, data: {} });
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({
        payload: {
            url: `${API_URL}/stockloglist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: {}, sort: [
                { column: 'idlinha', direction: 'ASC' }, { column: 'iddoser', direction: 'ASC' },
            ]
        }
    });
    const elFilterTags = document.getElementById('filter-tags');
    const { data: dataSocket } = useContext(SocketContext) || {};
    const { windowDimension } = useContext(MediaContext);

    useEffect(() => {
        const cancelFetch = cancelToken();
        dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, [dataSocket?.igbobinagens]);

    const selectionRowKey = (record) => {
        return `${record.idlinha}-${record.iddoser}`;
    }

    /*
     
    ll.id idlinha,ld.id iddoser,ld.t_stamp,ld.doser,ll.artigo_cod,ll.n_lote,
                CASE WHEN ld.type_mov='C' THEN NULL ELSE ll.type_mov END type_mov_linha,
                ld.type_mov type_mov_doser,
                ll.qty_lote,ld.qty_consumed,ld.qty_to_consume,ll.qty_reminder,ll.group,ld.ig_bobinagem_id
      
     */

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "loglotesdosers",
            include: {
                ...((common) => (
                    {
                        doser: { title: "doser", width: 60, render: (v, r) => v, ...common },
                        t_stamp: { title: "Data", width: 60, render: (v, r) => v && dayjs(v).format(DATETIME_FORMAT), ...common },
                        artigo_cod: { title: "Artigo", width: 60, render: (v, r) => v, ...common },
                        n_lote: { title: "Lote", width: 60, render: (v, r) => v, ...common },
                        type_mov_linha: { title: "Mov. Linha", width: 60, render: (v, r) => v, ...common },
                        type_mov_doser: { title: "Mov. Dos.", width: 60, render: (v, r) => v, ...common },
                        qty_lote: { title: "Qtd. Lote", width: 90, render: (v, r) => <Quantity v={v} unit="kg" />, ...common },
                        qty_consumed: { title: "Qtd. Consumida", width: 90, render: (v, r) => <Quantity v={v} unit="kg" />, ...common },
                        qty_to_consume: { title: "Qtd. a Consumir", width: 90, render: (v, r) => <Quantity v={v} unit="kg" />, ...common },
                        qty_reminder: { title: "Qtd. de Saída", width: 90, render: (v, r) => <Quantity v={v} unit="kg" />, ...common },
                        group_id: { title: "Grupo", width: 60, render: (v, r) => v, ...common },
                        ig_bobinagem_id: { title: "IGID", width: 60, render: (v, r) => v, ...common },
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
                {elFilterTags && <Portal elId={elFilterTags}>
                    <FilterTags form={formFilter} filters={dataAPI.getAllFilter()} schema={filterSchema} rules={filterRules()} />
                </Portal>}
                <Table
                    title={<Title level={4}>Log Movimento de Lotes</Title>}
                    columnChooser={false}
                    reload
                    rowHover={false}
                    stripRows={false}
                    darkHeader
                    rowClassName={(record) => (record.nome || record.type !== 1) ? 'data-row' : `data-row ${classes.noRelationRow}`}
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