import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Pagination, Row, Col, Space } from "antd";
import styled from 'styled-components';
import { ConditionalWrapper } from './conditionalWrapper';
import ColumnChooser from './columnChooser';
import ButtonIcon from './buttonIcon';
import Toolbar from './toolbar';
import Icon, { ReloadOutlined, SwapOutlined } from '@ant-design/icons';
import ClearSort from 'assets/clearsort.svg';


const StyledTable = styled(Table)`
    .ant-table-body {
        overflow-y: auto !important;
        overflows-x: hidden !important;
    }
    .ant-table-row {        
        ${(props) => (props.selectionEnabled === true) && `
        cursor:pointer;
    `}
    }
`;

export const setColumns = ({ uuid, dataAPI, data, include = [], exclude = [] } = {}) => {
    if (!uuid) {
        throw new Error('uuid is required')
    }
    const ret = { all: [], notOptional: [], uuid };
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
        let { sort = true, optional=true, ...rOptions } = (include[v] == undefined) ? {} : include[v];
        const c = {
            title: v,
            dataIndex: v,
            key: v,
            sorter: sort && { multiple: i },
            sortOrder: sort && dataAPI.sortOrder(v),
            optional,
            ...rOptions
        }
        if (!c.optional) {
            ret.notOptional.push(c);
        }
        ret.all.push(c);
    }
    return ret;
}


const TableOptions = ({ columnChooser, reload, clearSort, checkedColumns, setCheckedColumns, dataAPI, columns, onFetch, toolbar }) => {
    return (
        <>
            <Space>
                {React.isValidElement(toolbar) && toolbar}
                {clearSort && typeof onFetch==='function' && <ButtonIcon onClick={() => { dataAPI.clearSort(); onFetch(); }}><Icon component={ClearSort} /></ButtonIcon>}
                {reload && typeof onFetch==='function' && <ButtonIcon onClick={() => onFetch()}><ReloadOutlined /></ButtonIcon>}
                {dataAPI?.hasData() && columnChooser && <ColumnChooser columns={columns} checkedColumns={checkedColumns} setCheckedColumns={setCheckedColumns} />}
            </Space>
        </>);
}


export default ({ dataAPI, onFetch, columns, selection={}, columnChooser = true, reload = true, clearSort = true, title, toolbar, header = true, paginationProps={}, ...rest }) => {
    const { rowKey, onSelection, enabled: selectionEnabled = false, multiple = false, selectedRows, setSelectedRows } = selection;
    /*     const [selectedRows, setSelectedRows] = useState([]); */
    const [checkedColumns, setCheckedColumns] = useState([]);

    const onTableChange = (pagination, filters, sorter, { action }) => {
        switch (action) {
            case "sort":
                console.log("ADDING SORT-----",sorter);
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
            if (selectedRows.includes(_row)) {
                newRows = selectedRows.filter(item => item !== _row);
                setSelectedRows(newRows);
                /*                 onSelection(newRows); */
            } else {
                newRows = [...selectedRows];
                newRows.push(_row);
                setSelectedRows(newRows);
                /*                 onSelection(newRows); */
            }
        } else {
            setSelectedRows([_row]);
            /*             onSelection([_row]); */
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
                    {...selectionEnabled && {
                        onRow: (record, rowIndex) => { return { onClick: () => onRowClick(record, rowIndex, rowKey) } },
                        rowSelection: { selectedRowKeys: selectedRows/* , columnWidth: 0, renderCell: () => "" */ }
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