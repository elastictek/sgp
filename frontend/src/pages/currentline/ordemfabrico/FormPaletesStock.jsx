import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
//import { WrapperForm, TitleForm, FormLayout, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography } from "antd";
const { Title } = Typography;
import { LoadingOutlined, EditOutlined, CompassOutlined, InfoCircleOutlined, FilePdfTwoTone, FileExcelTwoTone } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import Reports, { Report } from "components/DownloadReports";
import Pagination from 'components/Paginator';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS } from 'config';
import { Field, Container } from 'components/FormFields';
import { Row, Col } from 'react-grid-system';

const columns = [
    { key: 'id', name: 'id' },
    { key: 'nome', name: 'Palete' },
    { key: 'largura_bobines', name: 'Largura' },
    { key: 'core_bobines', name: 'Core' },
    { key: 'area', name: 'Área' },
    { key: 'comp_total', name: 'Comprimento' }

];

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}


const rowReportItems = [
    { label: 'Packing List', key: 'pl-pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} />, data: { extension: "pdf", export: "pdf", name: "PACKING-LIST", path: "PACKING-LIST/PACKING-LIST-MASTER" } },
    { label: 'Packing List', key: 'pl-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { extension: "xlsx", export: "excel", name: "PACKING-LIST", path: "PACKING-LIST/PACKING-LIST-MASTER" } },
    { label: 'Packing List Detalhado', key: 'pld-pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} />, data: { extension: "pdf", export: "pdf", name: "PACKING-LIST-DETAILED", path: "PACKING-LIST/PACKING-LIST-DETAILED-MASTER" } },
    { label: 'Packing List Detalhado', key: 'pld-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { extension: "xlsx", export: "excel", name: "PACKING-LIST-DETAILED", path: "PACKING-LIST/PACKING-LIST-DETAILED-MASTER" } }
];

const ActionMenuTest = () => {
    const items = [
        { label: 'item 1', key: 'item-1' }, // remember to pass the key prop
        { label: 'item 2', key: 'item-2' }, // which is required
        {
            label: 'sub menu',
            key: 'submenu',
            children: [{ label: 'item 3', key: 'submenu-item-1' }],
        },
    ];
    return <Menu items={items} />;
}

const ActionContent = ({ dataAPI, data, hide, ...props }) => {
    return (
        <>
            <ActionMenuTest />
            <Title level={5}>Exportar</Title>
            <Report onExport={() => { console.log(data) }} items={rowReportItems} dataAPI={dataAPI} hide={hide} />
        </>
    );
}

const ToolbarFilters = ({ dataAPI, addRow, deleteRow, ...props }) => {
    return (<>
        <Col xs='content'><Field wrapFormItem={true} name="teste1" label={{ enabled: true, text: "test" }}><Input size="small" /></Field></Col>
        <Col xs='content'><Field wrapFormItem={true} name="teste2" label={{ enabled: true, text: "test2" }}><Input size="small" /></Field></Col>
        <Col xs='content'><Field wrapFormItem={true} name="teste3" label={{ enabled: true, text: "test3" }}><Input size="small" /></Field></Col>
        <Col xs='content'><Button onClick={addRow}>add</Button></Col>
        <Col xs='content'><Button onClick={deleteRow}>delete</Button></Col>
    </>
    );
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, forInput = true }) => {
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/paletesstocklookup/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: { item_id: 5 }, sort: [] } });
    const [newRows, setNewRows] = useState([]);

    useEffect(() => {
        (setFormTitle) && setFormTitle({ title: "Paletes de Stock" });
    }, []);

    /*     useEffect(() => {
            if (!dataAPI.isLoading()) {
            }
        }, [dataAPI.isLoading()]); */

    const addRow = () => {
        dataAPI.addRow({ area: 2242.9, comp_total: 32042, core_bobines: "3", id: Math.floor(Math.random() * 101), largura_bobines: 0, nome: "DM0370-2019" }, ['id'], 0);
    };
    const deleteRow = () => {
        dataAPI.deleteRow({ id: Math.floor(Math.random() * 101) }, ['id']);
    };

    const onFinish = (type, values) => { console.log("vvvv", values) };
    const onValuesChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };



    return (
        <Table
            //title={<Title style={{marginBottom:"0px"}} level={4}>Paletes de Stock</Title>} 
            reportTitle="Paletes de Stock"
            loadOnInit
            columns={columns}
            dataAPI={dataAPI}
            actionColumn={<ActionContent dataAPI={dataAPI} />}
            paginationPos='top'
            toolbarFilters={{ form: formFilter, schema, onFinish, onValuesChange, filters: <ToolbarFilters dataAPI={dataAPI} addRow={addRow} deleteRow={deleteRow} /> }}
        />
    );
}