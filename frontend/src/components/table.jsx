import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Pagination, Row, Col, Space } from "antd";
import styled from 'styled-components';
import { createUseStyles } from 'react-jss';
import classNames from "classnames";
import { ConditionalWrapper } from './conditionalWrapper';
import ColumnChooser from './columnChooser';
import ButtonIcon from './buttonIcon';
import Toolbar from './toolbar';
import Icon, { ReloadOutlined, SwapOutlined } from '@ant-design/icons';
import ClearSort from 'assets/clearsort.svg';


const useStyles = createUseStyles({
    stripRows: {
        '& tr:nth-child(even)': {
            backgroundColor: "#fafafa"
        }
    },
    darkHeader: {
        '& thead > tr > th': {
            backgroundColor: "#262626!important",
            color: "#fff!important",
            borderRight: "solid 1px #f5f5f5!important"
        }
    }
});

/* const StyledTable = styled(Table)`
  .ant-table-body::-webkit-scrollbar {
    width:10px;
    height:16px;
  }
  .ant-table-body::-webkit-scrollbar-thumb{
      background-color:rgba(105,112,125,.5);
      background-clip:content-box;
      border-radius:16px;
      border:2px solid transparent;
    }
    .ant-table-body::-webkit-scrollbar-corner{
      background-color:transparent;
    }
    .ant-table-body:focus {
        outline: none;
    }
    .ant-table-body:focus:focus-visible{
      outline-style:auto;
    }
    .ant-table-body::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 2px;
    }
    .ant-table-body{
        scrollbar-color:rgba(105,112,125,.5) transparent;
        scrollbar-width:thin;
        overflow-y:auto;
        overflow-x:hidden;
        -webkit-mask-image:linear-gradient(180deg,rgba(255,0,0,.1) 0 7.5px calc(100%-7.5px),rgba(255,0,0,.1));
        mask-image:linear-gradient(180deg,rgba(255,0,0,.1) 0 7.5px calc(100%-7.5px),rgba(255,0,0,.1));
    }
    .ant-table-row {        
        ${(props) => (props.selectionEnabled === true) && `
        cursor:pointer;
    `}
    }
    .ant-table-cell {
        padding: 1px 3px !important;
    }
`; */


const StyledTable = styled(Table)`
  
    .ant-table-cell {
        padding: 1px 3px !important;
    }
`;


/* const StyledTable = styled(Table)`
    .ant-table-body {
        overflow-y: auto !important;
        overflows-x: hidden !important;
    }
    .ant-table-row {        
        ${(props) => (props.selectionEnabled === true) && `
        cursor:pointer;
    `}
    }
`; */

export const setColumns = ({ uuid, dataAPI, data, include = [], exclude = [] } = {}) => {
    if (!uuid) {
        throw new Error('uuid is required')
    }
    const ret = { all: [], notOptional: [], report: {}, width:0, uuid };
    if (!data) return;
    var keys = []
    if (Array.isArray(include) && include.length > 0) {
        keys = include;
    } else if (typeof include === 'object') {
        keys = Object.keys(include);
    } else if (data.length > 0) {
        keys = Object.keys(data[0])
    }

    for (const [i, v] of keys.entries()) {
        if (exclude.includes(v)) continue;
        let { sort = true, optional = true, ...rOptions } = (include[v] == undefined) ? {} : include[v];
        const c = {
            title: v,
            dataIndex: v,
            key: v,
            sorter: sort && { multiple: i },
            sortOrder: sort && dataAPI.sortOrder(v),
            optional,
            ellipsis:true,
            ...rOptions
        }

        if (c.editable){
            c["onCell"]=(record) => ({
                record,
                editable: c.editable,
                dataIndex: c.dataIndex,
                title: c.title,
                input:c?.input
                //handleSave: this.handleSave,
              });
        }

        if (!c.optional) {
            ret.notOptional.push(c);
        }
        ret.width+=(c?.width) ? c.width : 0;
        ret.report[c.dataIndex] = { ...(c.width && { width: c.width }), title: c.title };
        ret.all.push(c);
    }
    return ret;
}


const TableOptions = ({ columnChooser, reload, clearSort, checkedColumns, setCheckedColumns, dataAPI, columns, onFetch, toolbar }) => {
    return (
        <>
            <Space align='end'>
                {React.isValidElement(toolbar) && toolbar}
                {clearSort && typeof onFetch === 'function' && <ButtonIcon onClick={() => { dataAPI.resetSort(); onFetch(); }}><Icon component={ClearSort} /></ButtonIcon>}
                {reload && typeof onFetch === 'function' && <ButtonIcon onClick={() => onFetch()}><ReloadOutlined /></ButtonIcon>}
                {dataAPI?.hasData() && columnChooser && <ColumnChooser columns={columns} checkedColumns={checkedColumns} setCheckedColumns={setCheckedColumns} />}
            </Space>
        </>);
}


export default ({ className, dataAPI, onFetch, columns, selection = {}, columnChooser = true, reload = true, clearSort = true, title, toolbar, header = true, paginationProps = {}, darkHeader = false, stripRows = false, ...rest }) => {
    const classes = useStyles();
    const { rowKey, onSelection, enabled: selectionEnabled = false, multiple = false, selectedRows, setSelectedRows } = selection;
    /*     const [selectedRows, setSelectedRows] = useState([]); */
    const [checkedColumns, setCheckedColumns] = useState([]);

    const css = classNames(className, { [classes.stripRows]: stripRows, [classes.darkHeader]: darkHeader });



    const onTableChange = (pagination, filters, sorter, { action }) => {
        switch (action) {
            case "sort":
                dataAPI.addSort(sorter);
                onFetch();
                break;
            case "paginate": break;
            case "filter": break;
        }
    }

    const onPageSize = (current, size) => {
        dataAPI.pageSize(size);
        dataAPI.first();
        onFetch();
    }

    const onRowClick = (record, index, rowKey) => {
        let _row;
        if (typeof rowKey === 'function') {
            _row = rowKey(record);
        } else {
            _row = [record[rowKey]];
        }
        if (multiple) {
            let newRows = [];
            if (selectedRows.includes(_row[0])) {
                newRows = selectedRows.filter(item => item !== _row[0]);
                setSelectedRows(newRows);
                if (onSelection) {
                    onSelection(newRows, record);
                }
                /*                 onSelection(newRows); */
            } else {
                newRows = [...selectedRows];
                newRows.push(..._row);
                setSelectedRows(newRows);
                if (onSelection) {
                    onSelection(newRows, record);
                }
                /*                 onSelection(newRows); */
            }
        } else {
            setSelectedRows(_row);
            if (onSelection) {
                onSelection(_row, record);
            }
            /*             onSelection([_row]); */
        }
    }

    const onChange = (keyValue, value) => {
        setSelectedRows(keyValue);
        if (onSelection) {
            onSelection(keyValue, value);
        }
    }

    return (
        <>
            {header && <Toolbar clean left={title} right={<TableOptions dataAPI={dataAPI} onFetch={onFetch} toolbar={toolbar} columns={columns} columnChooser={columnChooser} reload={reload} clearSort={clearSort} checkedColumns={checkedColumns} setCheckedColumns={setCheckedColumns} />} />}
            {dataAPI?.hasData() &&
                <StyledTable
                    selectionEnabled={selectionEnabled}
                    showSorterTooltip={false}
                    rowKey={rowKey}
                    className={css}
                    bordered
                    {...selectionEnabled && {
                        onRow: (record, rowIndex) => { return { onClick: () => onRowClick(record, rowIndex, rowKey) } },
                        rowSelection: { selectedRowKeys: selectedRows, onChange/* , columnWidth: 0, renderCell: () => "" */ }
                    }}
                    columns={(columnChooser) ? [...columns.notOptional, ...checkedColumns] : columns.all}
                    dataSource={dataAPI.getData().rows}
                    onChange={onTableChange}
                    pagination={false} {...rest} />
            }
            <Toolbar clean left={<div id="filter-tags"></div>} right={dataAPI?.hasData() && dataAPI.getPagination(true).enabled && <Pagination {...paginationProps} showLessItems={true} current={dataAPI.getPagination(true).page} onChange={(page) => { !dataAPI.isActionPageSize() && dataAPI.nav({ page, onFetch }); }} total={dataAPI.getData().total} pageSize={dataAPI.getPageSize(true)} onShowSizeChange={onPageSize} />} />
        </>
    );

}