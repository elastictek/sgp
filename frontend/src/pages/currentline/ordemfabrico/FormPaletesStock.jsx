import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip } from "antd";
import { LoadingOutlined, EditOutlined, CompassOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS } from 'config';
import DataGrid from 'react-data-grid';

const columns = [
    { key: 'id', name: 'id' },
    { key: 'nome', name: 'Palete' },
    { key: 'largura_bobines', name: 'Largura' },    
    { key: 'area', name: 'Área' },
    { key: 'comp_total', name: 'Comprimento' }

];

//cols = ['distinct(pp.id),pp.nome,pp.largura_bobines,pp.core_bobines,pp.area,pp.comp_total']

/* const rows = [
    { id: 0, title: 'Example' },
    { id: 1, title: 'Demo' }
]; */

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const Table = styled(DataGrid)`
    block-size:100%;
    scrollbar-color:rgba(105,112,125,.5) transparent;
    scrollbar-width:thin;
    -webkit-mask-image:linear-gradient(180deg,rgba(255,0,0,.1) 0 7.5px calc(100%-7.5px),rgba(255,0,0,.1));
    mask-image:linear-gradient(180deg,rgba(255,0,0,.1) 0 7.5px calc(100%-7.5px),rgba(255,0,0,.1));
    &::-webkit-scrollbar {
      width:16px;
      height:16px;
    }
    &::-webkit-scrollbar-thumb{
      background-color:rgba(105,112,125,.5);
      background-clip:content-box;
      border-radius:16px;
      border:6px solid transparent;
    }
    &::-webkit-scrollbar-corner{
      background-color:transparent;
    }
    &:focus {
        outline: none;
    }
    &:focus:focus-visible{
      outline-style:auto;
    } 



    .rdg-header-row{
        color: #fff!important;
        background-color: #262626!important;
        font-size:12px;
    }
    .rdg-row{
        font-size:12px;
    }
`;


export default () => {
    const [sortColumns, setSortColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/paletesstocklookup/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: { item_id: 5 }, sort: [] } });

    useEffect(()=>{
        if (dataAPI.hasData()){
            setRows(dataAPI.getData().rows);
        }else{
            dataAPI.fetchPost({});
        }
    },[dataAPI.hasData()]);

    const onColumnResize = (idx, width) => {
        console.log("column resize->", idx, "-", width);
    }

    const onSortColumnsChange = (columns) => {
        setSortColumns([...sortColumns, ...columns]);
    }

    return (
        <Table
            columns={columns}
            sortColumns={sortColumns}
            rows={rows}
            rowHeight={24}
            headerRowHeight={24}
            defaultColumnOptions={{ sortable: true, resizable: true }}
            onColumnResize={onColumnResize}
            onSortColumnsChange={onSortColumnsChange}
        />
    );
}