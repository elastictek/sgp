import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues, getFilterValue, isValue } from 'utils';

import FormManager, { FieldLabel, FieldSet as OldFieldSet, FilterTags, AutoCompleteField as OldAutoCompleteField, useMessages, DropDown } from "components/form";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, InputAddon, SelectField, TitleForm, WrapperForm, SelectDebounceField, AutoCompleteField, RangeDateField, RangeTimeField, FilterDrawer, CheckboxField, SwitchField } from "components/formLayout";
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
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled, AppstoreAddOutlined } from '@ant-design/icons';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, BOBINE_DEFEITOS, API_URL, GTIN, SCREENSIZE_OPTIMIZED } from 'config';
const { Title } = Typography;
import { SocketContext, MediaContext } from '../App';
import { Wnd, ColumnBobines, Bobines, typeListField } from "./commons";
const FixSimulatorList = lazy(() => import('./FixSimulatorList'));
const StockList = lazy(() => import('../artigos/StockList'));


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
    { fbobinagem: { label: "Nº Bobinagem", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data Bobinagem", field: { type: "rangedate", size: 'small' } } },
    { ftime: { label: "Início/Fim", field: { type: "rangetime", size: 'small' } } },
    { fduracao: { label: "Duração", field: { type: 'input', size: 'small' }, span: 12 } },
    { farea: { label: "Área", field: { type: 'input', size: 'small' }, span: 12 }, fdiam: { label: "Diâmetro", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcore: { label: "Core", field: { type: 'input', size: 'small' }, span: 12 }, fcomp: { label: "Comprimento", field: { type: 'input', size: 'small' }, span: 12 } },
    //Defeitos
    {
        freldefeitos: { label: " ", field: TipoRelation, span: 4 },
        fdefeitos: {
            label: 'Defeitos', field: {
                type: 'selectmulti', size: 'small', options: BOBINE_DEFEITOS
            }, span: 20
        }
    },
    //Estados
    {
        festados: {
            label: 'Estados', field: {
                type: 'selectmulti', size: 'small', options: BOBINE_ESTADOS
            }
        }
    },
    { fcliente: { label: "Cliente", field: { type: 'input', size: 'small' } } },
    { fdestino: { label: "Destino", field: { type: 'input', size: 'small' } } }
];

const ToolbarTable = ({ form, dataAPI, typeListField, setTypeList, typeList }) => {
    const navigate = useNavigate();

    const onChange = (v) => {
        form.submit();
    }

    const leftContent = (
        <>
            <button onClick={() => navigate(-1)}>go back</button>
            {/* <Button type="primary" size="small" disabled={flyoutStatus.visible ? true : false} onClick={() => setFlyoutStatus(prev => ({ ...prev, visible: !prev.visible }))}>Flyout</Button> */}
        </>
    );

    const rightContent = (
        <Space>
            <div style={{ display: "flex", flexDirection: "row", whiteSpace: "nowrap" }}>

            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }}>
                <Form form={form} initialValues={{ typelist: "A" }}>
                    <Form.Item name="typelist" noStyle>
                        {typeListField({ onChange, typeList })}
                    </Form.Item>
                </Form>
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
                    fbobinagem: getFilterValue(vals?.fbobinagem, 'any'),
                    fdata: getFilterRangeValues(vals["fdata"]?.formatted),
                    ftime: getFilterRangeValues(vals["ftime"]?.formatted),
                    fduracao: getFilterValue(vals?.fduracao, '=='),
                    fcliente: getFilterValue(vals?.fcliente, 'any'),
                    fdestino: getFilterValue(vals?.fdestino, 'any'),
                };
                dataAPI.addFilters(_values);
                dataAPI.addParameters({ ...dataAPI.getParameters(), typelist })
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
            "title": "Bobinagens, Corrigir Consumo de Lotes",
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

            <FilterDrawer schema={filterSchema({ form /* ordersField, customersField, itemsField */ })} filterRules={filterRules()} form={form} width={350} setShowFilter={setShowFilter} showFilter={showFilter} />
            <Form form={form} name={`fps`} onFinish={(values) => onFinish("filter", values)} onValuesChange={onValuesChange}>
                <FormLayout
                    id="LAY-BOBINAGENS"
                    layout="horizontal"
                    style={{ width: "700px", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{ guides: false, wide: [3, 4, 3, 1.5, 1.5], style: { marginLeft: "2px", alignSelf: "end" } }}
                    fieldSet={{ guides: false, wide: 16, margin: false, layout: "horizontal", overflow: false }}
                >
                    <Field name="fbobinagem" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Nº Bobinagem", pos: "top" }}>
                        <Input size='small' />
                    </Field>
                    <Field name="fdata" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Data Bobinagem", pos: "top" }}>
                        <RangeDateField size='small' />
                    </Field>
                    <Field name="ftime" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Início/Fim", pos: "top" }}>
                        <RangeTimeField size='small' format={TIME_FORMAT} />
                    </Field>
                    {/*                     <Field name="fmulti_customer" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Cliente", pos: "top" }}>
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
    </Field>*/}
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

export default () => {
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false, data: {} });
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/validarbobinagenslist/`, parameters: { feature: "fixconsumos" }, pagination: { enabled: true, page: 1, pageSize: 10 }, filter: {}, sort: [{ column: 'nome', direction: 'DESC' }] } });
    const elFilterTags = document.getElementById('filter-tags');
    const { data: dataSocket } = useContext(SocketContext) || {};
    const { windowDimension } = useContext(MediaContext);
    const [typeList, setTypeList] = useState('A');

    useEffect(() => {
        const cancelFetch = cancelToken();
        dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, []);

    const selectionRowKey = (record) => {
        return `${record.id}`;
    }

    const handleWndClick = (bm, type) => {
        let title = '';
        if (type==="preview"){
            title=`Previsualização: Corrigir Consumos Bobinagem ${bm.nome}`;
        }else if (type==="addlotes"){
            title=`Stock Matérias Primas para Ordem de Fabrico  ${bm.ofs}`;
        } 
        setShowValidar({ show: true, width: "1300px", fullWidthDevice: 3, type, data: { title, bobinagem_id: bm.id, bobinagem_nome: bm.nome, ig_id: bm.ig_bobinagem_id, acs_id:bm.audit_current_settings_id } });
    };

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "bobinagenslist_validar",
            include: {
                ...((common) => (
                    {
                        nome: { title: "Bobinagem", width: 90, fixed: 'left', render: (v, r) => <span onClick={() => handleWndClick(r, "preview")} style={{ color: "#096dd9", cursor: "pointer" }}>{v}</span>, ...common },
                        ofs: { title: "Of's", width: 200, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}><Button onClick={() => handleWndClick(r, "addlotes")} style={{ marginRight: "2px" }} size="small" icon={<AppstoreAddOutlined title="Adicionar Lotes à Ordem de Fabrico" />} /><div>{v.replaceAll('"', "")}</div></div>, ...common },
                        /* data: { title: "Data", render: (v, r) => dayjs(v).format(DATE_FORMAT), ...common }, */
                        inico: { title: "Início", render: (v, r) => dayjs('01-01-1970 ' + v).format(TIME_FORMAT), ...common },
                        fim: { title: "Fim", render: (v, r) => dayjs('01-01-1970 ' + v).format(TIME_FORMAT), ...common },
                        duracao: { title: "Duração", width: 80, render: (v, r) => v, ...common },
                        core: { title: "Core", width: 35, render: (v, r) => v, ...common },
                        comp: { title: "Comp.", render: (v, r) => v, input: <InputNumber />, ...common },
                        comp_par: { title: "Comp. Emenda", render: (v, r) => v, ...common },
                        comp_cli: { title: "Comp. Cliente", render: (v, r) => v, ...common },
                        area: { title: <span>Área m&#178;</span>, render: (v, r) => v, ...common },
                        diam: { title: "Diâmetro mm", render: (v, r) => v, ...common },
                        nwinf: { title: "Nw Inf. m", render: (v, r) => v, ...common },
                        nwsup: { title: "Nw Sup. m", render: (v, r) => v, ...common },
                    }
                ))({ idx: 1, optional: false }),
                ...((common) => (
                    {
                        ...(common.typeList == 'A' && { bobines: { title: <ColumnBobines n={28} />, width: 750, sorter: false, render: (v, r) => <Bobines b={JSON.parse(v)} bm={r} setShow={setShowValidar} />, ...common } }),
                        ...(common.typeList == 'B' && {
                            A1: { title: 'A1 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            A2: { title: 'A2 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            A3: { title: 'A3 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            A4: { title: 'A4 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            A5: { title: 'A5 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            A6: { title: 'A6 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            B1: { title: 'B1 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            B2: { title: 'B2 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            B3: { title: 'B3 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            B4: { title: 'B4 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            B5: { title: 'B5 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            B6: { title: 'B6 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            C1: { title: 'C1 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            C2: { title: 'C2 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            C3: { title: 'C3 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            C4: { title: 'C4 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            C5: { title: 'C5 kg', width: 55, sorter: false, render: (v, r) => v, ...common },
                            C6: { title: 'C6 kg', width: 55, sorter: false, render: (v, r) => v, ...common }
                        })
                    }
                ))({ idx: 2, optional: false, typeList: formFilter.getFieldValue('typelist') }),
            },
            exclude: []
        }
    );

    const handleWndCancel = () => {
        setShowValidar({ show: false, data: {} });
    };

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                <Wnd show={showValidar} setShow={setShowValidar}>
                    {showValidar.type === "preview" && <Suspense fallback={<></>}>{<FixSimulatorList data={showValidar.data} closeSelf={handleWndCancel} />}</Suspense>}
                    {showValidar.type === "addlotes" && <Suspense fallback={<Spin />}><StockList type={showValidar.type} data={showValidar.data} closeSelf={handleWndCancel}/></Suspense>}
                </Wnd>
                <ToolbarTable form={formFilter} dataAPI={dataAPI} typeListField={typeListField} setTypeList={setTypeList} />
                {elFilterTags && <Portal elId={elFilterTags}>
                    <FilterTags form={formFilter} filters={dataAPI.getAllFilter()} schema={filterSchema} rules={filterRules()} />
                </Portal>}
                <Table
                    title={<Title level={4}>Bobinagens Sem Consumos!</Title>}
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
                />
            </Spin>
        </>
    )
}