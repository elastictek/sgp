import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues, getFilterForceRangeValues, getFilterValue, isValue } from 'utils';
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


import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge, DatePicker } from "antd";
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled } from '@ant-design/icons';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SwapRightOutlined, CheckSquareTwoTone, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, BOBINE_DEFEITOS, API_URL, GTIN, SCREENSIZE_OPTIMIZED, DOSERS } from 'config';
const { Title } = Typography;
import { SocketContext, MediaContext } from '../App';
const BobinesValidarList = lazy(() => import('../bobines/BobinesValidarList'));
import useModalv4 from 'components/useModalv4';
import moment from 'moment';


const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}
const schemaAdd = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const filterRules = (keys) => { return getSchema({}, keys).unknown(true); }
const filterSchema = ({ ordersField, customersField, itemsField, ordemFabricoStatusField }) => [
    { fartigo: { label: "Artigo", field: { type: 'input', size: 'small' } } },
    { flote: { label: "Lote", field: { type: 'input', size: 'small' } } },
    { fdoser: { label: "Doseador", field: { type: 'input', size: 'small' } } }
];

const ToolbarTable = ({ dataAPI, data, onSwitchChange }) => {
    const leftContent = (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <Switch size="small" defaultChecked={false} onChange={onSwitchChange} /><div style={{marginLeft:"4px"}}>Lotes da Ùltima Ordem de Fabrico</div>
        </div>
    );

    const rightContent = (
        <Space>
            <div style={{ display: "flex", flexDirection: "row", whiteSpace: "nowrap" }}>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }}>
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
                    fdoser: getFilterValue(vals?.fdoser, 'any'),
                    ft_stamp: getFilterForceRangeValues(values["ft_stamp"]?.formatted),
                };
                dataAPI.addFilters(_values, false);
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

    const artigosField = () => (
        <Input size="small" allowClear />
    );
    const lotesField = () => (
        <Input size="small" allowClear />
    );
    const doserField = () => (
        <Input size="small" allowClear />
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
                    style={{ width: "800px", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{ guides: false, wide: [3, 3, 3, 4, 1.5, 1.5], style: { marginLeft: "2px", alignSelf: "end" } }}
                    fieldSet={{ guides: false, wide: 16, margin: false, layout: "horizontal", overflow: false }}
                >
                    <Field name="fartigo" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Artigo", pos: "top" }}>
                        {artigosField()}
                    </Field>
                    <Field name="flote" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Lote", pos: "top" }}>
                        {lotesField()}
                    </Field>
                    <Field name="fdoser" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Doseador", pos: "top" }}>
                        {doserField()}
                    </Field>
                    <Field name="ft_stamp" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Data Início/Fim", pos: "top" }}>
                        <RangeDateField size='small' />
                    </Field>
                    <FieldItem label={{ enabled: false }}>
                        <ButtonGroup size='small' style={{ marginLeft: "5px" }}>
                            <Button style={{ padding: "0px 3px" }} onClick={() => form.submit()}><SearchOutlined /></Button>
                            {/*                             <Button style={{ padding: "0px 3px" }}><MoreFilters style={{ fontSize: "16px", marginTop: "2px" }} onClick={() => setShowFilter(prev => !prev)} /></Button> */}
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

const FormAdd = ({ record, parameters, parentDataAPI, closeParent, parentRef }) => {
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        let _dosers = "";
        let _group;
        for (let itm of JSON.parse(record.frm)){
            _dosers = `${_dosers},${itm["doseador"]}`;
        }
        _dosers = _dosers.split(',').filter(el => el).sort().join("");
        if (_dosers=="A1"){

        }


        form.setFieldsValue({ qty_lote: record.QTYPCU_0, saida_mp: 1, date: moment(record.CREDATTIM_0, 'YYYY-MM-DD HH:mm'),lote_id:record.ROWID });
    }, []);

    const onValuesChange = () => {

    }

    const onSubmit = () => {
        setSubmitting(true);
        form.submit();
    }

    const onFinish = async (values) => {
        console.log(values);
        setSubmitting(false);
        closeParent();
        values.date = moment(values.date).format(DATETIME_FORMAT);
        const response = await fetchPost({ url: `${API_URL}/pickmanual/`, parameters: { pickItems: parameters.pickItems, direction: parameters.direction, ig_id: parameters.ig_id, id: record.ROWID, ...values } });
        parentDataAPI.fetchPost();
    }

    return (
        <Form form={form} name={`fra`} onFinish={onFinish} onValuesChange={onValuesChange}>
            <FormLayout
                id="LAY-FRMADD"
                layout="vertical"
                style={{ width: "800px", padding: "0px"/* , minWidth: "700px" */ }}
                schema={schemaAdd}
                field={{ guides: false, wide: [8, 8], style: { marginLeft: "2px", alignSelf: "end" } }}
                fieldSet={{ guides: false, wide: 16, margin: false, layout: "horizontal", overflow: false }}
            >

                <FieldSet margin={false}>
                    <Field required={true} wide={2} name="qty_lote" label={{ text: "Quantidade" }}><InputNumber size="small" min={1} max={2000} addonAfter="kg" /></Field>
                </FieldSet>
                <FieldSet margin={false}>
                    <Field required={true} wide={3} label={{ text: "Data" }} name="date"><DatePicker showTime size="small" format="YYYY-MM-DD HH:mm" /></Field>
                </FieldSet>
                <FieldSet margin={false}>
                    <Field required={true} wide={3} label={{ text: "Movimento Lote ID" }} name="lote_id"><InputNumber size="small" /></Field>
                </FieldSet>
                <FieldSet margin={false}>
                    <Field required={true} wide={3} label={{ text: "Grupo (Cuba)" }} name="group_id"><InputNumber size="small" /></Field>
                </FieldSet>
                <FieldSet margin={false}>
                    <Field name="saida_mp" label={{ enabled: true, text: "Saída de Matérias Primas existentes" }}>
                        <SelectField size="small" data={[
                            { label: "Apenas quando a Matéria Prima for diferente", value: 1 },
                            { label: "Não dar saída", value: 2 },
                            { label: "Dar saída", value: 3 }
                        ]} keyField="value" textField="label"
                            optionsRender={(d, keyField, textField) => ({ label: d[textField], value: d[keyField] })}
                        />
                    </Field>
                </FieldSet>

                {parentRef && <Portal elId={parentRef.current}>
                    <Space>
                        <Button disabled={submitting} type="primary" onClick={onSubmit}>Registar</Button>
                        <Button onClick={closeParent}>Fechar</Button>
                    </Space>
                </Portal>
                }

                {/*                 <Field name="fartigo" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Artigo", pos: "top" }}>
                    {artigosField()}
                </Field>
                <Field name="flote" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Lote", pos: "top" }}>
                    {lotesField()}
                </Field>
                <Field name="fdoser" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Doseador", pos: "top" }}>
                    {doserField()}
                </Field>
                <Field name="ft_stamp" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Data Início/Fim", pos: "top" }}>
                    <RangeDateField size='small' />
                </Field>
                <FieldItem label={{ enabled: false }}>
                    <ButtonGroup size='small' style={{ marginLeft: "5px" }}>
                        <Button style={{ padding: "0px 3px" }} onClick={() => form.submit()}><SearchOutlined /></Button>
                    </ButtonGroup>
                </FieldItem>
                <FieldItem label={{ enabled: false }}><Dropdown overlay={menu}>
                    <Button size="small" icon={<FileFilled />}><DownOutlined /></Button>
                </Dropdown>
                </FieldItem> */}
            </FormLayout>
        </Form>
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
    const modal = useModalv4();
    const onClick = async () => {
        //{"group_id": "3462729180381184", "lote_id": "9589", "artigo_cod": "RVMAX0863000012","n_lote": "VM6202V21092801AB50296", "qty_lote": "650.00", "doser": "A1"}, 
        const _uid = uuIdInt(0).uuid();
        const pickItems = [];
        console.log("/////////////////////////",record,data)
        for (let itm of JSON.parse(record.frm)) {
            for (let m of itm.doseador.split(',')) {
                if (m) {
                    const pick = { "group_id": _uid, "lote_id": record.ROWID, "artigo_cod": record.ITMREF_0, "n_lote": record.LOT_0, "qty_lote_buffer": record.QTYPCU_0, "doser": m, "order": data.order,"end_id":record?.end_id,"loteslinha_id":record?.id };
                    pickItems.push(pick);
                }
            }
        }
        console.log("-----",pickItems)
        if (pickItems.length > 0) {
            modal.show({
                propsToChild: true, footer: "ref",
                //maskClosable: true,
                //closable: true,
                height: "300px",
                title: `Entrada em Linha ${record.ITMDES1_0} - ${record.LOT_0}`,
                content: <FormAdd record={record} parameters={{ pickItems, direction: data.direction, ig_id: data.ig_id }} parentDataAPI={dataAPI} />
            });
            //console.log(data)
            //const response = await fetchPost({ url: `${API_URL}/pickmanual/`, parameters: { pickItems,direction:data.direction,ig_id:data.ig_id,id:data.id } });
            //dataAPI.fetchPost();
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
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/stocklistbyigbobinagem/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 10 }, filter: { ig_id: data?.ig_id, t_stamp: data?.t_stamp }, sort: [] } });
    const elFilterTags = document.getElementById('filter-tags');
    const { data: dataSocket } = useContext(SocketContext) || {};
    const { windowDimension } = useContext(MediaContext);
    const [typeList, setTypeList] = useState();
    const [lastOf, setLastOf] = useState(false);

    useEffect(() => {
        console.log("-----", data)
        const cancelFetch = cancelToken();
        dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, []);

    const selectionRowKey = (record) => {
        return `${record.ROWID}`;
    }

    const onSwitchChange = (v) => {
        setLastOf(v);
        dataAPI.first();
        dataAPI.addParameters({lastof:v,ig_id:data.ig_id},true);
        dataAPI.fetchPost();
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "bufferlist",
            include: {
                ...((common) => (
                    {
                        action_line: { title: "", align: "center", width: 60, fixed: "left", render: (v, r) => <ColumnToLine record={r} dataAPI={dataAPI} data={data} />, ...common },
                        ITMDES1_0: { title: "Matéria Prima", width: 190, fixed: 'left', render: (v, r) => <b>{v}</b>, ...common },
                        LOT_0: { title: "Lote", width: 180, fixed: 'left', render: (v, r) => <b>{v}</b>, ...common },
                        ITMREF_0: { title: "Cod. MP", width: 120, render: (v, r) => v, ...common },
                        QTYPCU_0: { title: "Qtd. Lote", width: 120, render: (v, r) => v && `${parseFloat(v).toFixed(2)} ${r.PCU_0}`, ...common },
                        CREDATTIM_0: { title: "Data Buffer", width: 120, render: (v, r) => dayjs(v).format(DATETIME_FORMAT), ...common },
                        frm: { title: "Formulação", render: (v, r, i) => <Formulacao rowIndex={i} data={v} />, ...common }
                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    return (
        <>
            <Spin spinning={dataAPI.isLoading()} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /* style={{ top: "50%", left: "50%", position: "absolute" }} */ >
                <ToolbarTable dataAPI={dataAPI} data={data} onSwitchChange={onSwitchChange} />
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
                    toolbar={!lastOf && <GlobalSearch columns={columns?.report} form={formFilter} dataAPI={dataAPI} setShowFilter={setShowFilter} showFilter={showFilter} />}
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