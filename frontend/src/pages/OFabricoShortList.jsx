import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { isValue } from 'utils';
import { useDataAPI } from "utils/useDataAPI";
import Table, { setColumns } from "components/table";
import { Typography, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge, Form } from "antd";
import { TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AutoCompleteField } from "components/formLayout";
import { getSchema } from "utils/schemaValidator";
import Icon, { LoadingOutlined, UnorderedListOutlined, SyncOutlined, SearchOutlined } from "@ant-design/icons";
import TagButton from "components/TagButton";
const ButtonGroup = Button.Group;
import { API_URL, SCREENSIZE_OPTIMIZED } from 'config';
import YScroll from "components/YScroll";
import ResponsiveModal from "components/ResponsiveModal";
const { Title } = Typography;
const FormFormulacao = React.lazy(() => import('./currentline/FormFormulacaoUpsert'));
import MoreFilters from 'assets/morefilters.svg'

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const filterRules = (keys) => {
    return getSchema({
        //field1: Joi.string().label("Designação")
    }, keys).unknown(true);
}

const filterSchema = ({ ordersField, customersField, itemsField, ordemFabricoStatusField }) => [
];


const loadCurrentSettings = async (aggId, token) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/currentsettingsget/`, filter: { aggId }, sort: [], cancelToken: token });
    return rows;
}

const Wnd = ({ parameters, setVisible }) => {
    const [formTitle, setFormTitle] = useState({});
    const iref = useRef();
    return (
        <ResponsiveModal
            title={<TitleForm title={formTitle.title} subTitle={formTitle.subTitle} />}
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
            footer={<div ref={iref} id="form-wrapper" style={{ textAlign: 'right' }}></div>}
        >
            <YScroll>
                {parameters?.parameters && <>
                    {(parameters.parameters.feature.endsWith("_change")) &&
                        <Suspense fallback={<></>}><FormFormulacao setFormTitle={setFormTitle} record={parameters?.parameters} forInput={parameters?.parameters.forInput} parentRef={iref} closeParent={setVisible} /></Suspense>
                    }
                    {(parameters.parameters.feature === "lotes_stock") &&
                        <Suspense fallback={<></>}></Suspense>
                    }
                </>
                }
            </YScroll>
        </ResponsiveModal>
    );

}

const ColumnEstado = ({ record, feature, onModalVisible }) => {
    const { status, temp_ofabrico, temp_ofabrico_agg } = record;

    const onClick = async () => {
        const raw = await loadCurrentSettings(temp_ofabrico_agg);
        const fData = { id: raw[0].id, formulacao: JSON.parse(raw[0].formulacao), feature, forInput: ((feature == "dosers_change") ? false : true) }
        onModalVisible(null, fData);
    }

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {(status == 2 && temp_ofabrico) && <>
                <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="orange">Na Produção</TagButton>
            </>}
            {status == 3 && <>
                <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<SyncOutlined spin />} color="success">Em Produção</TagButton>
            </>}
        </div>
    );
}


const fetchOrders = async (value) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellorderslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_order"]: `%${value.replaceAll(' ', '%%')}%` } });
    console.log("FETECHED", rows)
    return rows;
}
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

const GlobalSearch = ({ form, dataAPI, columns } = {}) => {
    const [formData, setFormData] = useState({});
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

    // const fetchCustomers = async (value) => {
    //     const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellcustomerslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_customer"]: `%${value.replaceAll(' ', '%%')}%` } });
    //     return rows;
    // }
    // const fetchOrders = async (value) => {
    //     const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellorderslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_order"]: `%${value.replaceAll(' ', '%%')}%` } });
    //     console.log("FETECHED", rows)
    //     return rows;
    // }
    // const fetchItems = async (value) => {
    //     const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellitemslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_item"]: `%${value.replaceAll(' ', '%%')}%` } });
    //     return rows;
    // }

    // const customersField = () => (
    //     <AutoCompleteField
    //         placeholder="Cliente"
    //         size="small"
    //         keyField="BPCNAM_0"
    //         textField="BPCNAM_0"
    //         dropdownMatchSelectWidth={250}
    //         allowClear
    //         onPressEnter={onFinish}
    //         fetchOptions={fetchCustomers}
    //     />
    // );
    // const ordersField = () => (
    //     <AutoCompleteField
    //         placeholder="Encomenda/Prf"
    //         size="small"
    //         keyField="SOHNUM_0"
    //         textField="computed"
    //         dropdownMatchSelectWidth={250}
    //         allowClear
    //         fetchOptions={fetchOrders}
    //     />
    // );
    // const itemsField = () => (
    //     <AutoCompleteField
    //         placeholder="Artigo"
    //         size="small"
    //         keyField="ITMREF_0"
    //         textField="computed"
    //         dropdownMatchSelectWidth={250}
    //         allowClear
    //         fetchOptions={fetchItems}
    //     />
    // );

    // const downloadFile = (data, filename, mime, bom) => {
    //     var blobData = (typeof bom !== 'undefined') ? [bom, data] : [data]
    //     var blob = new Blob(blobData, { type: mime || 'application/octet-stream' });
    //     if (typeof window.navigator.msSaveBlob !== 'undefined') {
    //         // IE workaround for "HTML7007: One or more blob URLs were
    //         // revoked by closing the blob for which they were created.
    //         // These URLs will no longer resolve as the data backing
    //         // the URL has been freed."
    //         window.navigator.msSaveBlob(blob, filename);
    //     }
    //     else {
    //         var blobURL = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
    //         var tempLink = document.createElement('a');
    //         tempLink.style.display = 'none';
    //         tempLink.href = blobURL;
    //         tempLink.setAttribute('download', filename);

    //         // Safari thinks _blank anchor are pop ups. We only want to set _blank
    //         // target if the browser does not support the HTML5 download attribute.
    //         // This allows you to download files in desktop safari if pop up blocking
    //         // is enabled.
    //         if (typeof tempLink.download === 'undefined') {
    //             tempLink.setAttribute('target', '_blank');
    //         }

    //         document.body.appendChild(tempLink);
    //         tempLink.click();

    //         // Fixes "webkit blob resource error 1"
    //         setTimeout(function () {
    //             document.body.removeChild(tempLink);
    //             window.URL.revokeObjectURL(blobURL);
    //         }, 200);
    //     }
    // }

    /*     const menu = (
            <Menu onClick={(v) => exportFile(v)}>
                <Menu.Item key="pdf" icon={<FilePdfTwoTone twoToneColor="red" />}>Pdf</Menu.Item>
                <Menu.Item key="excel" icon={<FileExcelTwoTone twoToneColor="#52c41a" />}>Excel</Menu.Item>
                <Menu.Item key="word" icon={<FileWordTwoTone />}>Word</Menu.Item>
            </Menu>
        ); */

    /*     const exportFile = async (type) => {
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
        } */

    return (
        <>

            {/* <FilterDrawer schema={filterSchema({ form, ordersField, customersField, itemsField, ordemFabricoStatusField })} filterRules={filterRules()} form={form} width={350} setShowFilter={setShowFilter} showFilter={showFilter} /> */}
            <Form form={form} name={`fps`} onFinish={(values) => onFinish("filter", values)} onValuesChange={onValuesChange}>
                <FormLayout
                    id="LAY-OFFLIST"
                    layout="horizontal"
                    style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{ guides: false, wide: [3, 3, 3, 4, 1.5, 1.5], style: { marginLeft: "2px", alignSelf: "end" } }}
                    fieldSet={{ guides: false, wide: 16, margin: false, layout: "horizontal", overflow: false }}
                >
                    <Field name="fmulti_order" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Encomenda/Prf", pos: "top" }}>
                        {ordersField()}
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
                    </Field> */}
                    <FieldItem label={{ enabled: false }}>
                        <ButtonGroup size='small' style={{ marginLeft: "5px" }}>
                            <Button style={{ padding: "0px 3px" }} onClick={() => form.submit()}><SearchOutlined /></Button>
                            <Button style={{ padding: "0px 3px" }}><MoreFilters style={{ fontSize: "16px", marginTop: "2px" }} onClick={() => setShowFilter(prev => !prev)} /></Button>
                        </ButtonGroup>
                    </FieldItem>
                    {/* <FieldItem label={{ enabled: false }}><Dropdown overlay={menu}>
                        <Button size="small" icon={<FileFilled />}><DownOutlined /></Button>
                    </Dropdown>
                    </FieldItem> */}
                </FormLayout>
            </Form>
        </>
    );
}


export default ({ feature }) => {
    const [loading, setLoading] = useState(false);
    const [formFilter] = Form.useForm();
    const [modalParameters, setModalParameters] = useState({ visible: false });
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/ofabricolist/`, parameters: {}, pagination: { enabled: false }, filter: { fofstatus: "IN(2,3)" }, sort: [] } });

    useEffect(() => {
        const cancelFetch = cancelToken();
        //dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, []);

    const selectionRowKey = (record) => {
        return `${record.ofabrico}-${isValue(record.item, undefined)}-${isValue(record.iorder, undefined)}`;
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "ofshortlist",
            include: {
                ...((common) => (
                    {
                        ofabrico: { title: "Ordem Fabrico", width: 130, fixed: 'left', render: (v, r) => v, ...common },
                        prf: { title: "PRF", width: 130, render: v => <b>{v}</b>, ...common },
                        estado: { title: "", width: 125, render: (v, r) => <ColumnEstado record={r} feature={feature} onModalVisible={onModalVisible} />, ...common },
                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    const onModalVisible = (e, parameters) => {
        if (!parameters) {
            setModalParameters(prev => ({ visible: false }));
        } else {
            setModalParameters(prev => ({ visible: !prev.visible, width: "900px", height: "750px", fullWidthDevice: 3, parameters }));
        }
    }

    return (
        <>
            <Wnd parameters={modalParameters} setVisible={onModalVisible} />
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                <Table
                    columnChooser={false}
                    reload
                    header={feature === "lotes_stock" ? true : false}
                    stripRows
                    darkHeader
                    size="small"
                    selection={{ enabled: false, rowKey: record => selectionRowKey(record) }}
                    paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                    dataAPI={dataAPI}
                    columns={columns}
                    onFetch={dataAPI.fetchPost}
                    {...(feature === "lotes_stock" && { toolbar: <GlobalSearch columns={columns?.report} form={formFilter} dataAPI={dataAPI}/*  setShowFilter={setShowFilter} showFilter={showFilter} ordemFabricoStatusField={ordemFabricoStatusField} */ /> })}

                    scroll={{ x: 300, scrollToFirstRowOnChange: true }}
                />
            </Spin>
        </>
    )
}