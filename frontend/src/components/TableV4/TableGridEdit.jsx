import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import ReactDOM from "react-dom";
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL } from "config";
import { uid } from 'uid';
import { useDataAPI } from "utils/useDataAPIV4";
import { json, includeObjectKeys, valueByPath } from "utils/object";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, UploadOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, RollbackOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle, { Title } from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import XScroll, { RowXScroll } from 'components/XScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';

// import useModeApi from 'utils/useModeApi';
import TableV4, { suppressKeyboardEvent, defaultValueGetter } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";
import { useImmer } from 'use-immer';

// import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber } from "components/TableV4/TableColumnsV4";
// import { GridApi } from 'ag-grid-community';


export default ({ loading, columnDefs, defaultColDefs, columnTypes, rowClassRules = {}, filters, title, leftTitle, permission, defaultParameters, dataAPI, onSelectionChanged, isRowSelectable, ignoreRowSelectionOnCells = [],
    topToolbar, loadOnInit = true, local = false, defaultSort = [], defaultFilters = {}, gridRef, style, modeApi, isCellEditable, valueGetter, onBeforeCellEditRequest,
    onAfterCellEditRequest, onRowClick, onCellClick, rowSelectionIgnoreOnMode, suppressCellFocus, rowSelection, onGridReady, 
    onGridRequest, onGridResponse, onGridFailRequest,modeOptions,
    /* extraRef, closeSelf, loadParentData, noid = false, defaultFilters = {}, defaultSort = [], onSelect, onFilterChange, local = false, loadOnInit = false, rowSelection, */ ...props }) => {
    const _gridRef = gridRef || useRef(); //not required
    // const [gridApi, setGridApi] = useState(); //not Required;
    const modalApi = useModalApi() //not Required;
    const submitting = useSubmitting(false);
    const location = useLocation();
    const inputParameters = useRef(loadInit({ filter: defaultFilters }, { filter: dataAPI.getFilters(false, true) }, { ...props?.parameters }, { ...location?.state }));

    // useEffect(() => {
    //     if (gridApi) {
    //         const controller = new AbortController();
    //         loadData({ signal: controller.signal, init: true });
    //         return (() => controller.abort());
    //     }
    // }, [gridApi]);

    // const loadData = async ({ signal, init = false } = {}) => {
    //     /**When not loadOnInit, we can do any init changes, before load it */
    //     if (gridApi && loadOnInit) {
    //         dataAPI.setDefaultSort(defaultSort);
    //         dataAPI.addParameters({ ...defaultParameters }, false);
    //         if (!local) {
    //             let datasource = dataAPI.dataSourceV4(null, gridApi);
    //             gridApi.setGridOption("serverSideDatasource", datasource);
    //         } else {
    //             // submitting.trigger();
    //             // const dt = await dataAPI.fetchPost({ ignoreTotalRows: true });
    //             // submitting.end();
    //         }
    //     }
    // }

    const _onGridReady = async ({ api, dataAPI, ...params }) => {
        /**When not loadOnInit, we can do any init changes, before load it */
        if (api && loadOnInit) {
            dataAPI.setDefaultSort(defaultSort);
            dataAPI.addParameters({ ...defaultParameters }, false);
            if (!local) {
                let datasource = dataAPI.dataSourceV4(null, api);
                api.setGridOption("serverSideDatasource", datasource);
            } else {
                // submitting.trigger();
                // const dt = await dataAPI.fetchPost({ ignoreTotalRows: true });
                // submitting.end();
            }
        }
        if (typeof onGridReady == "function") {
            await onGridReady(params);
        }
    }

    const _defaultColDef = useMemo(() => {
        return {
            //editable: (params) => modeApi.isOnEditMode() || (params.data?.rowadded == 1 && modeApi.isOnAddMode()), //params.data.year == 2012,
            filter: false,
            sortable:true,
            sortable: modeApi.isOnMode() ? false : true,
            suppressMenu: modeApi.isOnMode() ? true : false,
            valueGetter: (params) => {
                return defaultValueGetter(params, valueGetter);
            },
            suppressKeyboardEvent,
            // valueSetter: params => {
            //     console.log("AAAAAAAAAAAAAAAA",params,params.column.getDefinition().field)
            //     params.data[params.column.getDefinition().field] = params.newValue;
            //     //params.data.name = params.newValue;
            //     return true;
            // },
            ...defaultColDefs
        };
    }, [modeApi.isOnMode()]);

    const _columnTypes = useMemo(() => {
        return {
            editableColumn: {
                editable: (params) => {
                    const _allow = (modeApi.isOnEditMode() || (params.data?.rowadded == 1 && modeApi.isOnAddMode()));
                    if (_allow && typeof isCellEditable === "function") {
                        return isCellEditable(params);
                    }
                    return _allow;
                },
                cellStyle: (params) => {
                    const _allow = (modeApi.isOnEditMode() || (params.data?.rowadded == 1 && modeApi.isOnAddMode()));
                    if (_allow && typeof isCellEditable === "function" && isCellEditable(params)) {
                        return { /* border:"solid 1px #bae7ff" */ };
                    }
                    if (_allow) {
                        return { /* border:"solid 1px #bae7ff" */ };
                    } else {
                        return {/* border: "none" */ };
                    }
                },
            },
            ...columnTypes
        };
    }, [modeApi.isOnMode()]);

    const _rowClassRules = useMemo(() => {
        return rowClassRules;
    }, []);

    const _onSelectionChanged = (rows) => {
        if (typeof onSelectionChanged === "function") {
            onSelectionChanged(rows);
        }
    };

    const _isRowSelectable = (params) => {
        if (typeof isRowSelectable === "function") {
            return isRowSelectable(params);
        }
        return true;
    };


    return (
        <div style={{ width: "100%", height: "80vh", ...style }}>
            <TableV4
                onGridRequest={onGridRequest}
                onGridResponse={onGridResponse}
                onGridFailRequest={onGridFailRequest}
                loading={submitting.state || loading}
                // gridApi={gridApi}
                onGridReady={_onGridReady}
                loadOnInit={false}
                // setGridApi={setGridApi}
                multiSortKey='ctrl'
                gridRef={_gridRef}
                local={local}
                onBeforeCellEditRequest={onBeforeCellEditRequest}
                onAfterCellEditRequest={onAfterCellEditRequest}
                rowSelectionIgnoreOnMode={rowSelectionIgnoreOnMode}
                rowSelection={rowSelection}
                suppressCellFocus={suppressCellFocus}
                onSelectionChanged={_onSelectionChanged}
                isRowSelectable={_isRowSelectable}
                rowClassRules={_rowClassRules}
                ignoreRowSelectionOnCells={ignoreRowSelectionOnCells}

                showRange={false}
                allowGoTo={false}
                showTotalCount={true}
                showFromTo={false}

                dataAPI={dataAPI}
                columnDefs={columnDefs}
                defaultColDef={_defaultColDef}
                columnTypes={_columnTypes}
                onRowClick={onRowClick}
                onCellClick={onCellClick}
                //stopEditingWhenCellsLoseFocus={true}

                showTopToolbar={true}
                topToolbar={{
                    title: (!title && !leftTitle && dataAPI.preFilters()?.designacao) ? <Title level={3} text={title} style={{}} /> : null,
                    leftTitle: (leftTitle && !title) ? <Title level={3} text={leftTitle} style={{}} /> : null,
                    start: null,
                    left: null, /* <Space>
            <Permissions permissions={permission} action="edit" forInput={[!modeApi.isOnMode()]}><Button icon={<UploadOutlined />}>Carregar Parâmetros</Button></Permissions>
          </Space> */
                    right: null,
                    initFilterValues: inputParameters.current,
                    onFilterFinish: null,
                    filters,
                    showSettings: true,
                    showFilters: true,
                    showMoreFilters: true,
                    clearSort: true,
                    ...topToolbar
                }}
                modeApi={modeApi}
                modeOptions={modeOptions}
                {...props}
            />
        </div>
    );
}