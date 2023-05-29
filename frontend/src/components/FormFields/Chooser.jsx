import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
//import moment from 'moment';
import dayjs from 'dayjs';
import { uid } from 'uid';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, sleep } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch } from "antd";
const { TextArea } = Input;
// import ToolbarTitle from './commons/ToolbarTitle';
const { Title } = Typography;
import { json } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, SelectOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberEditor, MateriasPrimasTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign } from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';
import IconButton from "components/iconButton";
import { MdAdjust, MdAssignmentReturned } from 'react-icons/md';
import { xor } from 'ramda';

const useStyles = createUseStyles({});
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const moreFiltersSchema = ({ form }) => [];

const Filters = ({ filters }) => {
    const autoFocusRef = useRef(null);
    useEffect(() => {
        if (autoFocusRef.current) {
            autoFocusRef.current.focus();
        }
    }, []);
    return (<>
        {filters && Object.keys(filters).map(k => {
            return (
                <Col key={k} xs='content'><Field name={k} label={{ enabled: true, text: filters[k]?.text, pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear width={filters[k]?.width ? filters[k]?.width : 100} ref={filters[k]?.autoFocus && autoFocusRef} />
                </Field></Col>
            );
        })}
    </>)
}


export default ({ parameters, closeSelf, ...props }) => {
    const { payload, columns, filters, moreFilters = true, onSelect, toolbar = true, data = null, multipleSelection = false, onFilterFinish, ...rest } = parameters;
    const inputParameters = useRef({});
    const [form] = Form.useForm();

    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI(payload);
    const submitting = useSubmitting(true);
    const [selected, setSelected] = useState([]);
    const [unSelected, setUnSelected] = useState({});

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, payload?.payload?.filter, { ...location?.state }, null);//NO FILTERS IN????
            inputParameters.current = fixRangeDates(null, paramsIn);
        }
        let { filterValues, fieldValues } = inputParameters.current;
        formFilter.setFieldsValue({ ...fieldValues });
        dataAPI.addFilters({ ...filterValues }, true);
        dataAPI.setSort(dataAPI.getSort(), defaultSort);
        if (data) {
            dataAPI.setData({ rows: data, total: data?.length });
        } else {
            dataAPI.fetchPost();
        }
        dataAPI.update(true);
        submitting.end();
    }

    const _onFilterFinish = (type, values) => {
        if (onFilterFinish){
            onFilterFinish(type, values);
            console.log("!ssssssssssssssssTOIMPLEMENTsssssssssssssssss!")
        }else{
            console.log("!ssssssssssssssssTOIMPLEMENTsssssssssssssssss!")
        }
        // switch (type) {
        //     case "filter":
        //         //remove empty values
        //         const vals = dataAPI.removeEmpty({ ...defaultFilters, ...values });
        //         const _values = {
        //             ...vals,
        //             ...(Object.keys(filters).reduce((accumulator, value) => {
        //                 return { ...accumulator, [value]: getFilterValue(vals[value], filters[value].type) };
        //             }, {}))
        //         };
        //         dataAPI.addFilters(dataAPI.removeEmpty(_values));
        //         dataAPI.addParameters(defaultParameters);
        //         dataAPI.first();
        //         dataAPI.setAction("filter", true);
        //         dataAPI.update(true);
        //         break;
        // }
    };
    const onFilterChange = (changedValues, values) => {
    };

    // const onRowSelect = async (data) => {
    //     if (typeof onSelect == "function") {
    //         submitting.trigger();
    //         await onSelect({ data, closeSelf, loadData });
    //         submitting.end();
    //     };
    // }

    const onRowRender = useCallback((rowProps) => {
        if (!multipleSelection) {
            rowProps.onClick = async (event) => {
                if (typeof onSelect == "function") {
                    submitting.trigger();
                    await onSelect({ rowProps, closeSelf, loadData });
                    submitting.end();
                };
                //  if (rowProps.onClick) {
                //     rowProps.onClick(event);
                // }
            };
        }
    }, []);


    const onSelectionChange = useCallback(({ selected, unselected }) => {
        //Only for multiple selection
        setSelected(selected);
        setUnSelected(unselected)
    }, []);

    const onFinish = async () => {

        if (typeof onSelect == "function") {
            submitting.trigger();
            let _data = [];
            let _rows = [];
            if (selected === true) {
                const _uns = (!unSelected) ? [] : Object.keys(unSelected);
                _data = dataAPI.getData().rows.map(v => v[dataAPI.getPrimaryKey()]).filter(v => !_uns.includes(`${v[dataAPI.getPrimaryKey()]}`));
                console.log("bbbbbbbbbbbbb",_uns,dataAPI.getData().rows,dataAPI.getPrimaryKey())
                _rows = dataAPI.getData().rows.filter(v => !_uns.includes(`${v[dataAPI.getPrimaryKey()]}`));
            } else {
                _data = Object.keys(selected);
                _rows = Object.values(selected);
            }
            await onSelect({ data: _data, rows: _rows, close: closeSelf, loadData });
            submitting.end();
        };

    }



    return (<YScroll>
        <Table
            {...multipleSelection && { onSelectionChange: onSelectionChange, checkboxColumn: true, selected: selected }}
            cellNavigation={false}
            local={data ? true : false}
            loading={submitting.state}
            offsetHeight="180px"
            loadOnInit={true}
            rowSelect={true}
            pagination={dataAPI.getPagination().enable ? "remote" : false}
            defaultLimit={20}
            columns={columns}
            dataAPI={dataAPI}
            idProperty={dataAPI.getPrimaryKey()}
            editable={{
                enabled: false,
                add: false
            }}
            toolbar={toolbar}
            onRenderRow={onRowRender}
            moreFilters={moreFilters}
            toolbarFilters={{
                form: formFilter, schema, onFinish: _onFilterFinish, onValuesChange: onFilterChange,
                filters: <Filters filters={filters} />,
                moreFilters: { schema: moreFiltersSchema }
            }}
            {...rest}
        />

        {props?.extraRef && <Portal elId={props.extraRef.current}>
            <Space>
                <Button type="primary" onClick={onFinish}>Ok</Button>
            </Space>
        </Portal>
        }
        {!props?.extraRef && props?.wndRef && <Portal elId={props.wndRef.current}>
            <Space>
                <Button type="primary" onClick={onFinish}>Ok</Button>
            </Space>
        </Portal>
        }

        {/* <Table
            onRowClick={onRowClick}
            rowStyle={`cursor:pointer;font-size:12px;`}
            headerStyle={`background-color:#f0f0f0;font-size:10px;`}
            loadOnInit={false}
            columns={columns}
            rowHeight={rowHeight}
            dataAPI={dataAPI}
            toolbar={toolbar}
            search={true}
            moreFilters={false}
            rowSelection={false}
            editable={false}
            toolbarFilters={{
                filters: <Filters filters={filters} />,
                form: formFilter, schema, wrapFormItem: true,
                onFinish: onFilterFinish, onValuesChange: onFilterChange
            }}
        //rowHeight={28}
        /> */}
    </YScroll>);
}