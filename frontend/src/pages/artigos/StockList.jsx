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
    { fmulti_dosers: {label: 'Doseador Formulação', field: {type: 'selectmulti', size: 'small', options: DOSERS}}},
    { fqty_lote: { label: "Qtd. Lote", field: { type: 'input', size: 'small' } } },
    { fqty_lote_available: { label: "Qtd. Lote Disponível (Em Linha/Buffer)", field: { type: 'input', size: 'small' } } },
    { fqty_artigo_available: { label: "Qtd. Artigo Disponível (Em Linha/Buffer)", field: { type: 'input', size: 'small' } } },
    { fmulti_location: {label: 'Localização', field: {type: 'selectmulti', size: 'small', options: [{ value: "ARM", label: "ARM" }, { value: "BUFFER", label: "BUF" }]}}},
    { fpicked: {label: 'Na Linha', field: {type: 'select', size: 'small', options: [{ value: "ALL", label: " " }, { value: 1, label: "Sim" }, { value: 0, label: "Não" }]}}},
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
            <button onClick={() => navigate(-1)}>go back</button>
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
                    field={{ guides: false, wide: [3, 4, 3,2, 1.5, 1.5], style: { marginLeft: "2px", alignSelf: "end" } }}
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

/* const StyledBobine = styled.div`
    border:dashed 1px #000;
    background-color:${props => props.color};
    color:${props => props.fontColor};
    border-radius:3px;
    margin-right:1px;
    text-align:center;
    width:25px;
    font-size:8px;
    cursor:pointer;
    &:hover {
        border-color: #d9d9d9;
    }
    .lar{
        font-size:9px;
    }
`;

const useStyles = createUseStyles({
    columnBobines: {
        width: '25px',
        minWidth: '25px',
        textAlign: "center",
        marginRight: "1px"
    }
}) */

/* const ColumnBobines = ({ n }) => {
    const classes = useStyles();
    return (<div style={{ display: "flex", flexDirection: "row" }}>
        {[...Array(n)].map((x, i) =>
            <div className={classes.columnBobines} key={`bh-${i}`}>{i + 1}</div>
        )}
    </div>);
}

const bColors = (estado) => {
    if (estado === "G") {
        return { color: "#237804", fontColor: "#fff" };//"green";
    } else if (estado === "DM") {
        return { color: "#fadb14", fontColor: "#000" };//"gold";
    } else if (estado === "R") {
        return { color: "#ff1100", fontColor: "#fff" };//"red";
    } else if (estado === "LAB") {
        return { color: "#13c2c2", fontColor: "#000" };//"cyan";
    } else if (estado === "BA") {
        return { color: "#ff1100", fontColor: "#fff" };//"red";
    } else if (estado === "IND") {
        return { color: "#0050b3", fontColor: "#fff" };//"blue";
    } else if (estado === "HOLD") {
        return { color: "#391085", fontColor: "#fff" };//"purple";
    }
} */

/* const Bobines = ({ b, bm, setShow }) => {
    let bobines = b;

    const handleClick = () => {
        setShow({ show: true, data: { bobinagem_id: bm.id, bobinagem_nome: bm.nome } });
    };

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {bobines.map((v, i) => {
                return (<StyledBobine onClick={handleClick} color={bColors(v.estado).color} fontColor={bColors(v.estado).fontColor} key={`bob-${v.id}`}><b>{v.estado === 'HOLD' ? 'HLD' : v.estado}</b><div className='lar'>{v.lar}</div></StyledBobine>);
            })}
        </div>
    );
}; */

/* const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
}; */


/* const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    input,
    handleSave,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
        if (editing) {
            inputRef.current.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{
                    margin: 0,
                }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                {React.isValidElement(input) ? React.cloneElement(input, { ref: inputRef, onPressEnter: save, onBlur: save, ...input.props }) : <Input ref={inputRef} onPressEnter={save} onBlur={save} />}
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{
                    paddingRight: 24,
                }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};
 */
/* const TitleValidar = ({ data }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Space>
                    <div><b style={{ textTransform: "capitalize" }}></b>Validar/Classificar a Bobinagem {data.bobinagem_nome}</div>
                </Space>
            </div>
        </div>
    );
} */

/* const ModalValidar = ({ show, setShow }) => {
    const [confirmLoading, setConfirmLoading] = React.useState(false);

    const handleCancel = () => {
        setShow({ show: false, data: {} });
    };

    return (
        <>
            <ResponsiveModal
                title={<TitleValidar data={show.data} />}
                visible={show.show}
                centered
                responsive
                onCancel={handleCancel}
                maskClosable={true}
                destroyOnClose={true}
                fullWidthDevice={100}
                bodyStyle={{ backgroundColor: "#f0f0f0" }}
            >
                <YScroll>
                    <Suspense fallback={<></>}>{<BobinesValidarList data={show.data} closeSelf={handleCancel} />}</Suspense>
                </YScroll>
            </ResponsiveModal>
        </>
    );
}; */

const Formulacao = ({ data, rowIndex }) => {
    const formulacao = JSON.parse(data);
    return (
        <div style={{ display: "flex", flexDirection: "row" }}>{formulacao && formulacao.map((v, i) => {
            return (<Tag style={{fontWeight:"10px", width:"150px"}} color="blue" key={`frm-${rowIndex}-${i}`}><b>{v.doseador.replace(/(^,)|(,$)/g, '')}</b>: {v.arranque}% | {v.densidade}g/cm&#xB3;</Tag>);
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

const ColumnToLine = ({record, dataAPI})=>{
    const toLine = record.loc==="BUFFER" && !record.picked ;

    const onClick = async ()=>{
        //{"group_id": "3462729180381184", "lote_id": "9589", "artigo_cod": "RVMAX0863000012","n_lote": "VM6202V21092801AB50296", "qty_lote": "650.00", "doser": "A1"}, 
        const _uid = uuIdInt(0).uuid();
        const pickItems = [];
        for (let itm of JSON.parse(record.frm)){
            for (let m of itm.doseador.split(',')){
                if (m){
                    const pick = {"group_id": _uid, "lote_id": record.rowid, "artigo_cod": record.matprima_cod,"n_lote": record.n_lote, "qty_lote": record.qty_lote, "doser": m};
                    pickItems.push(pick);
                }
            }            
        }
        if (pickItems.length>0){
            const response = await fetchPost({ url: `${API_URL}/pick/`, parameters: { pickItems } });
            dataAPI.fetchPost();
        }
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaa",pickItems)
        
    }

    return(<>{toLine && <Tooltip title="Transferir para a Linha"><Button onClick={onClick} size="small" icon={<SwapRightOutlined />}></Button></Tooltip>}</>);
}

export default () => {
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false, data: {} });
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/stocklist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 10 }, filter: {}, sort: [] } });
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
                        matprima_cod: { title: "Matéria Prima", width: 120, fixed: 'left', render: (v, r) => v, ...common },
                        matprima_des: { title: "Designação", width: 190, fixed: 'left', render: (v, r) => <b>{v}</b>, ...common },
                        n_lote: { title: "Lote", width: 180, fixed: 'left', render: (v, r) => <b>{v}</b>, ...common },
                        loc: { title: "Loc.", width: 50, render: (v, r) => v, ...common },
                        //inbuffer: { title: "Buffer", width: 30, align: 'center', render: (v, r) => v === 1 && <CheckSquareTwoTone twoToneColor="#389e0d" style={{ fontSize: '16px' }} />, ...common },
                        picked: { title: "Linha", width: 30, align: 'center', render: (v, r) => v === 1 && <CheckSquareTwoTone twoToneColor="#389e0d" style={{ fontSize: '16px' }} />, ...common },
                        qty_lote: { title: "Qtd. Lote", width: 120, render: (v, r) => v && `${parseFloat(v).toFixed(2)} ${r.unit}`, ...common },
                        qty_lote_available: { title: "Qtd. Lote Disponível", width: 120, render: (v, r) => v && `${parseFloat(v).toFixed(2)} ${r.unit}`, ...common },
                        qty_lote_consumed: { title: "Qtd. Lote Comsumido", width: 120, render: (v, r) => v && `${parseFloat(v).toFixed(2)} ${r.unit}`, ...common },
                        qty_artigo_available: { title: "Qtd. Artigo Disponível", width: 120, render: (v, r) => v && `${parseFloat(v).toFixed(2)} ${r.unit}`, ...common },
                        action_line: { title: "", align:"center", width: 60, render: (v, r) => <ColumnToLine record={r} dataAPI={dataAPI} />, ...common },
                        frm: { title: "Formulação", render: (v, r, i) => <Formulacao rowIndex={i} data={v} />, ...common },
                        //ofs: { title: "Ordens Fabrico", render: (v, r, i) => <Ofs rowIndex={i} data={v} />, ...common },
                        //extrusora: { title: "Extrusora", width: 30, render: (v, r) => v, ...common },
                        //doser_a: { title: "Doseador A", width: 30, render: (v, r) => v, ...common },
                        //doser_b: { title: "Doseador B", width: 30, render: (v, r) => v, ...common },
                        //doser_c: { title: "Doseador C", width: 30, render: (v, r) => v, ...common }
                        //nome: { title: "Bobinagem", width: 90, fixed: 'left', render: (v, r) => <span onClick={() => handleClick(r)} style={{ color: "#096dd9", cursor: "pointer" }}>{v}</span>, ...common },
                        /* data: { title: "Data", render: (v, r) => dayjs(v).format(DATE_FORMAT), ...common }, */
                        //inico: { title: "Início", render: (v, r) => dayjs('01-01-1970 ' + v).format(TIME_FORMAT), ...common },
                        //fim: { title: "Fim", render: (v, r) => dayjs('01-01-1970 ' + v).format(TIME_FORMAT), ...common },
                        //duracao: { title: "Duração", width: 80, render: (v, r) => v, ...common },
                        //core: { title: "Core", width: 35, render: (v, r) => v, ...common },
                        //comp: { title: "Comp.", render: (v, r) => v, editable: true, input: <InputNumber />, ...common },
                        //comp_par: { title: "Comp. Emenda", render: (v, r) => v, ...common },
                        //comp_cli: { title: "Comp. Cliente", render: (v, r) => v, ...common },
                        //area: { title: <span>Área m&#178;</span>, render: (v, r) => v, ...common },
                        //diam: { title: "Diâmetro mm", render: (v, r) => v, ...common },
                        //nwinf: { title: "Nw Inf. m", render: (v, r) => v, ...common },
                        //nwsup: { title: "Nw Sup. m", render: (v, r) => v, ...common },
                        //cod: { title: "Agg", width: 140, render: v => <span style={{ color: "#096dd9" }}>{v}</span>, ...common },
                        //ofabrico: { title: "Ordem Fabrico", width: 140, render: v => <b>{v}</b>, ...common },
                        //prf: { title: "PRF", width: 140, render: v => <b>{v}</b>, ...common },
                        //iorder: { title: "Encomenda(s)", width: 140, ...common },
                        /* ofabrico_sgp: { title: "OF.SGP", width: 60, render: v => <>{v}</>, ...common }, */
                        //estado: { title: "", width: 125, ...common },
                        /* options: { title: "", sort: false, width: 25, render: (v, r) => <ActionButton content={<MenuActionButton record={r} />} />, ...common }, */
                        //item: { title: "Artigo(s)", width: 140, render: v => <>{v}</>, ...common },
                        //item_nome: { title: "Artigo(s)", ellipsis: true, render: v => <div style={{ /* overflow:"hidden", textOverflow:"ellipsis" */whiteSpace: 'nowrap' }}>{v}</div>, ...common },
                        //cliente_nome: { title: "Cliente(s)", ellipsis: true, render: v => <div style={{ whiteSpace: 'nowrap' }}><b>{v}</b></div>, ...common },
                        //start_date: { title: "Início Previsto", ellipsis: true, render: (v, r) => <div style={{ whiteSpace: 'nowrap' }}><span>{dayjs((r.start_prev_date) ? r.start_prev_date : v).format(DATETIME_FORMAT)}</span></div>, ...common },
                        //end_date: { title: "Fim Previsto", ellipsis: true, render: (v, r) => <div style={{ whiteSpace: 'nowrap' }}><span>{dayjs((r.end_prev_date) ? r.end_prev_date : v).format(DATETIME_FORMAT)}</span></div>, ...common },
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

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                <ToolbarTable form={formFilter} dataAPI={dataAPI} typeListField={typeListField} setTypeList={setTypeList} />
                {elFilterTags && <Portal elId={elFilterTags}>
                    <FilterTags form={formFilter} filters={dataAPI.getAllFilter()} schema={filterSchema} rules={filterRules()} />
                </Portal>}
                <Table
                    title={<Title level={4}>Matéria Prima em Stock (Currente)</Title>}
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