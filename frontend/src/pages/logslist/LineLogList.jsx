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

const OFabricoTimeLineShortList = React.lazy(() => import('../OFabricoTimeLineShortList'));



const useStyles = createUseStyles({
    noRelationRow: {
        backgroundColor: '#ffa39e'
    }
});

const TitleWnd = ({ title }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Space>
                    <div><b style={{ textTransform: "capitalize" }}></b>{title}</div>
                </Space>
            </div>
        </div>
    );
}

const Wnd = ({ parameters, setVisible }) => {
    return (
        <ResponsiveModal
            title={<TitleWnd title={parameters.title} />}
            visible={parameters.visible}
            centered
            responsive
            onCancel={setVisible}
            maskClosable={true}
            destroyOnClose={true}
            fullWidthDevice={parameters.fullWidthDevice}
            width={parameters?.width}
            height={parameters?.height}
            bodyStyle={{ /* backgroundColor: "#f0f0f0" */ }}
        >
            <YScroll>
                {parameters.type === "ofabricotimelinelist" && <Suspense fallback={<></>}><OFabricoTimeLineShortList params={parameters} parentClose={setVisible} /></Suspense>}
            </YScroll>
        </ResponsiveModal>
    );

}


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
    border-color: #ffc069;
    color:#fff;
    &:hover{
        background-color: #fa8c16;
        border-color: #ffe7ba;
    }
  }
`;

const AssignOFColumn = ({ v, e, onClick, fim_ts, id }) => {

    return (<>
        {v && <b>{v}</b>}
        {(!v && e === 1) && <ExclamationButton size="small" icon={<ExclamationCircleOutlined />} onClick={() => onClick(id, fim_ts)} />}
    </>);
}

export default () => {
    const classes = useStyles()
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false, data: {} });
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/lineloglist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: {}, sort: [{ column: 'id', direction: 'DESC' },] } });
    const elFilterTags = document.getElementById('filter-tags');
    const { data: dataSocket } = useContext(SocketContext) || {};
    const { windowDimension } = useContext(MediaContext);
    const [modalParameters, setModalParameters] = useState({ visible: false });

    const onModalVisible = (e, type, params) => {
        if (!type) {
            setModalParameters(prev => ({ visible: false }));
        } else {
            switch (type) {
                case "ofabricotimelinelist":
                    let title = "Ordens de Fabrico";
                    setModalParameters(prev => ({ visible: !prev.visible, type, width: "900px", height: "500px", fullWidthDevice: 2, data: { ...params }, title })); break;
            }
        }
    }

    useEffect(() => {
        const cancelFetch = cancelToken();
        dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, [dataSocket?.igbobinagens]);

    const selectionRowKey = (record) => {
        return `${record.id}`;
    }

    const doserConsume = (d, dlag, dreset, event) => {
        if (event !== 1) {
            return null;
        }
        let _d = noValue(d, 0);
        let _dlag = noValue(dlag, 0);
        let _dreset = noValue(dreset, 0);
        return <div style={{ display: "flex", flexDirection: "row" }}><div style={{ width: "60px" }}>{((((_d < _dlag) ? _dreset : 0) + _d) - _dlag).toFixed(2)}</div>kg</div>

    }

    const reload = () => {
        dataAPI.fetchPost();
    }

    const onAssignOF = (id, fim_ts) => {
        onModalVisible(null, 'ofabricotimelinelist', { id, fim_ts, parentReload: reload });
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "logigbobinagem",
            include: {
                ...((common) => (
                    {
                        type_desc: { title: "", width: 40, align: "center", fixed: 'left', render: (v, r) => <EventColumn v={v} />, ...common }
                        , inicio_ts: { title: "Início", width: 120, fixed: 'left', render: (v, r) => v && dayjs(v).format(DATETIME_FORMAT), ...common }
                        , fim_ts: { title: "Fim", width: 120, fixed: 'left', render: (v, r) => v && dayjs(v).format(DATETIME_FORMAT), ...common }
                        , nome: { title: "Bobinagem", width: 100, align: "center", style: { backgroundColor: "undet" }, render: (v, r) => <AssignOFColumn v={v} e={r.type} fim_ts={r.fim_ts} id={r.id} onClick={onAssignOF} />, ...common }
                        , diametro: { title: "Diâmetro", width: 90, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}><div style={{ width: "60px" }}>{v}</div>mm</div>, ...common }
                        , metros: { title: "Comprimento", width: 100, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}><div style={{ width: "60px" }}>{v}</div>m</div>, ...common }
                        //, metros_evento_estado: { title: "metros_evento_estado", width: 90, render: (v, r) => v, ...common }
                        //, n_trocas: { title: "n_trocas", width: 90, render: (v, r) => v, ...common }
                        , nw_inf: { title: "NW Inf.", width: 100, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}><div style={{ width: "60px" }}>{v}</div>m</div>, ...common }
                        //, nw_inf_evento_estado: { title: "nw_inf_evento_estado", width: 90, render: (v, r) => v, ...common }
                        , nw_sup: { title: "NW Sup.", width: 100, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}><div style={{ width: "60px" }}>{v}</div>m</div>, ...common }
                        //, nw_sup_evento_estado: { title: "nw_sup_evento_estado", width: 90, render: (v, r) => v, ...common }
                        , peso: { title: "Peso", width: 90, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}><div style={{ width: "60px" }}>{parseFloat(v).toFixed(2)}</div>kg</div>, ...common }

                        , A1: { title: "A1", width: 90, render: (v, r) => doserConsume(r.A1, r.A1_LAG, r.A1_RESET, r.type), ...common }
                        , A2: { title: "A2", width: 90, render: (v, r) => doserConsume(r.A2, r.A2_LAG, r.A2_RESET, r.type), ...common }
                        , A3: { title: "A3", width: 90, render: (v, r) => doserConsume(r.A3, r.A3_LAG, r.A3_RESET, r.type), ...common }
                        , A4: { title: "A4", width: 90, render: (v, r) => doserConsume(r.A4, r.A4_LAG, r.A4_RESET, r.type), ...common }
                        , A5: { title: "A5", width: 90, render: (v, r) => doserConsume(r.A5, r.A5_LAG, r.A5_RESET, r.type), ...common }
                        , A6: { title: "A6", width: 90, render: (v, r) => doserConsume(r.A6, r.A6_LAG, r.A6_RESET, r.type), ...common }

                        , B1: { title: "B1", width: 90, render: (v, r) => doserConsume(r.B1, r.B1_LBG, r.B1_RESET, r.type), ...common }
                        , B2: { title: "B2", width: 90, render: (v, r) => doserConsume(r.B2, r.B2_LBG, r.B2_RESET, r.type), ...common }
                        , B3: { title: "B3", width: 90, render: (v, r) => doserConsume(r.B3, r.B3_LBG, r.B3_RESET, r.type), ...common }
                        , B4: { title: "B4", width: 90, render: (v, r) => doserConsume(r.B4, r.B4_LBG, r.B4_RESET, r.type), ...common }
                        , B5: { title: "B5", width: 90, render: (v, r) => doserConsume(r.B5, r.B5_LBG, r.B5_RESET, r.type), ...common }
                        , B6: { title: "B6", width: 90, render: (v, r) => doserConsume(r.B6, r.B6_LBG, r.B6_RESET, r.type), ...common }

                        , C1: { title: "C1", width: 90, render: (v, r) => doserConsume(r.C1, r.C1_LAG, r.C1_RESET, r.type), ...common }
                        , C2: { title: "C2", width: 90, render: (v, r) => doserConsume(r.C2, r.C2_LAG, r.C2_RESET, r.type), ...common }
                        , C3: { title: "C3", width: 90, render: (v, r) => doserConsume(r.C3, r.C3_LAG, r.C3_RESET, r.type), ...common }
                        , C4: { title: "C4", width: 90, render: (v, r) => doserConsume(r.C4, r.C4_LAG, r.C4_RESET, r.type), ...common }
                        , C5: { title: "C5", width: 90, render: (v, r) => doserConsume(r.C5, r.C5_LAG, r.C5_RESET, r.type), ...common }
                        , C6: { title: "C6", width: 90, render: (v, r) => doserConsume(r.C6, r.C6_LAG, r.C6_RESET, r.type), ...common }
                        , id: { title: "ID", width: 60, render: (v, r) => v, ...common }
                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    return (
        <>
            <Wnd parameters={modalParameters} setVisible={onModalVisible} />
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                <ToolbarTable form={formFilter} dataAPI={dataAPI} />
                {elFilterTags && <Portal elId={elFilterTags}>
                    <FilterTags form={formFilter} filters={dataAPI.getAllFilter()} schema={filterSchema} rules={filterRules()} />
                </Portal>}
                <Table
                    title={<Title level={4}>Eventos da Linha de Produção</Title>}
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