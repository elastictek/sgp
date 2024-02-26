import React, { useState, useEffect, useContext, createContext, useRef, useMemo, forwardRef, useCallback } from 'react';
import { Form, Tooltip, Drawer, Modal, Button, Row as AntRow, Col as AntCol, Input, Tag, AutoComplete, Select, Switch, Alert, Checkbox, Spin, DatePicker, InputNumber, TimePicker, Space } from "antd";
import styled, { css } from "styled-components";
import classNames from "classnames";
import { createUseStyles } from 'react-jss';
import { ConditionalWrapper } from '../conditionalWrapper';
import Portal from "../portal";
import YScroll from "../YScroll";
import PointingAlert from "../pointingAlert";
import { debounce, dayjsValue } from "utils";
import { validate, getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { LoadingOutlined, CheckSquareOutlined, BorderOutlined, SearchOutlined, CloseCircleFilled } from '@ant-design/icons';
import { BiWindow } from "react-icons/bi";
import { BsBoxArrowInDownRight } from "react-icons/bs";
import { AiOutlineFullscreen } from "react-icons/ai";
import RangeDate from "../RangeDate";
import RangeTime from "../RangeTime";
import { DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, API_URL, BOBINE_ESTADOS, bColors } from 'config';
import { Container as MainContainer, Row, Col } from 'react-grid-system';
import Selector from './Selector';
import { isNil } from 'ramda';
import { includeObjectKeys, valueByPath } from 'utils/object';
import useModalApi from 'utils/useModalApi';
import { parseFilter, useDataAPI } from 'utils/useDataAPIV4';
import TableGridSelect from 'components/TableV4/TableGridSelect';
import { EstadoBobine, Value } from 'components/TableV4/TableColumnsV4';
import { getValue, isNullOrEmpty, useSubmitting } from 'utils/index';
import { getSelectedNodes } from 'components/TableV4/TableV4';
export const Context = createContext({});

const _status = (name, validation) => {
    let _index = null;
    let _path = [];
    let _validation = null;
    if (validation) {
        if (Array.isArray(name)) {
            name.forEach(el => {
                if (typeof el === "number") {
                    _index = el;
                } else {
                    _path.push(el);
                }
            });
            const _p = _path.join(".");
            _validation = validation?.[_index]?.find(v => v.path.join(".") == _p);
        } else {
            _validation = validation?.errors?.find(v => v.path.join(".") == name);
        }
    }
    return _validation ? _validation : { valid: true };
}

const useStyles = createUseStyles({
    inputContainer: {
        position: 'relative',
        //display: 'inline-block',
        '&:hover $clearButton': {
            display: 'block',
        },
    },
    input: {
        //width:"100%",
        /*         padding: '8px', */

    },
    clearButton: {
        position: 'absolute',
        top: '50%',
        right: '40px',
        zIndex: 2000,
        transform: 'translateY(-50%)',
        display: 'none',
        cursor: 'pointer'
    },
});

export const StyledBobine = styled("div").withConfig({
    shouldForwardProp: (prop) =>
        !['forView'].includes(prop)
})`
    border:dashed 1px #000;
    background-color:${props => props.color};
    color:${props => props.$fontColor};
    border-radius:3px;
    margin-right:1px;
    text-align:center;
    min-height:${props => props.$height ? props.$height : "25px"};
    width:${props => props.$width ? props.$width : "25px"};
    min-width:${props => props.$width ? props.$width : "25px"};
    font-size:${props => props.$fontSize ? props.$fontSize : "8px"};
    font-weight:${props => props.$fontWeight ? props.$fontWeight : "400"};
    cursor:pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &:hover {
        border-color: #d9d9d9;
    }
    .lar{
        font-size:9px;
    }
`;


const DefaultForView = ({ value, childrenProps, forViewProps }) => {
    if ("addonAfter" in childrenProps || "addonBefore" in childrenProps) {
        return (<div style={{ borderRadius: "3px", padding: "2px", ...forViewProps?.forViewBorder && { border: "solid 1px #d9d9d9" }, ...forViewProps?.height, ...forViewProps?.forViewBackground && { background: "#f0f0f0" }, ...(forViewProps?.style && forViewProps?.style) }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                {("addonBefore" in childrenProps) && <div style={{ marginRight: "2px" }}>{childrenProps?.addonBefore}</div>}
                <div>{value}</div>
                {("addonAfter" in childrenProps) && <div style={{ marginLeft: "2px" }}>{childrenProps?.addonAfter}</div>}
            </div>
        </div>)
    }
    return (<div style={{ borderRadius: "3px", padding: "2px", ...forViewProps?.forViewBorder && { border: "solid 1px #d9d9d9" }, display: "flex", ...forViewProps?.height, alignItems: "center", ...forViewProps?.forViewBackground && { background: "#f0f0f0" }, ...(forViewProps?.style && forViewProps?.style) }} /* {...onDoubleClick && { onDoubleClick }} */>{value}</div>);
}

export const SelectorPopup = ({ onSelectionChanged, options, keyField, textField, detailFn, dataGridProps = {}, popupProps = {}, payload, allowClear = true, onClear, customSearch, ...props }) => {
    const { columnDefs, filters = { toolbar: ["@columns"], more: [], no: ["action"] }, ..._dataGridProps } = dataGridProps;
    const { width = "700px", height = "500px", offsetHeight = "70px", type = "modal", responsive = true, closable = true, lazy = false, ..._popupProps } = popupProps;
    const classes = useStyles();
    const modalApi = useModalApi();
    const dataAPI = useDataAPI({ payload });

    const valueObj = useMemo(() => {
        if (isNullOrEmpty(props?.value)) {
            return { value: null, text: null };
        }
        if (typeof props.value === 'object') {
            return { value: props.value?.[keyField], text: getValue(props.value?.[textField], props.value?.[keyField]) };
        }
        return { value: props?.value, text: props?.value };
    }, [props?.value]);


    const _onClear = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (onClear) {
            onClear();
        }
        props.onChange({ value: null, text: null });
    }

    const _onSelectionChanged = async (row, closeSelf) => {
        if (onSelectionChanged && typeof onSelectionChanged == "function") {
            const _v = await onSelectionChanged(row[0]);
            if (_v !== false) {
                props.onChange(_v);
            }
        } else {
            props.onChange({ ...row[0] });
        }
        closeSelf();
    }
    const onPopup = () => {
        modalApi.setModalParameters({
            content: <Lookup style={{ height: `calc(${height} - ${offsetHeight}` }} dataAPI={dataAPI} columnDefs={columnDefs} filters={filters} onSelectionChanged={_onSelectionChanged} dataGridProps={_dataGridProps} />,
            closable,
            lazy,
            type,
            width,
            height,
            responsive,
            ..._popupProps
        });
        modalApi.showModal();
    }
    return <div>
        {customSearch ? React.cloneElement(customSearch, { ...customSearch.props, value: valueObj.text, forView: props?.forView, ...(!props?.forView) && { onClick: onPopup } }) :
            <>
                {props?.forView && <DefaultForView {...props?.forViewProps} value={valueObj.text} />}
                {!props?.forView && <div className={classes.inputContainer}>
                    <Input value={valueObj.text} style={{ cursor: "pointer", width: "100%" }} onClick={onPopup} /* onKeyDown={_onKeyDown} */ readOnly suffix={<SearchOutlined onClick={onPopup} style={{ cursor: "pointer" }} />} />
                    {(allowClear && valueObj.value) &&
                        <div className={classes.clearButton} onClick={_onClear}>
                            <CloseCircleFilled style={{ cursor: "pointer", color: "gray" }} />
                        </div>
                    }
                </div>}
            </>}
        <div style={{ fontSize: "11px" }}>{((valueObj && typeof detailFn === 'function')) && detailFn(valueObj, props.value)}</div>
    </div>;
};

export const EstadoBobineLookup = ({ field, onClick, onSelectionChange, forView, ...props }) => {

    const valueObj = useMemo(() => {
        if (isNullOrEmpty(props?.value)) {
            return { estado: null, lar: null };
        }
        if (typeof props.value === 'object') {
            return { estado: valueByPath(props?.value, field.estado), label: valueByPath(props?.value, field.largura) };
        }
        return { estado: props?.value, lar: null };
    }, [props.value]);

    return (
        <>
            <SelectorPopup
                forView={forView} //Important!!
                value={props?.value}
                onChange={props?.onChange}
                onSelectionChanged={onSelectionChange}
                payload={{ data: { rows: BOBINE_ESTADOS }, pagination: { enabled: false, limit: 30 } }}
                dataGridProps={{
                    local: true,
                    showTopToolbar: false,
                    headerHeight: 0,
                    columnDefs: [
                        { field: 'estado', headerName: 'Estado', flex: 1, cellRenderer: (params) => <EstadoBobine field={{ estado: "value" }} params={params} /> }
                    ]
                }}
                popupProps={{ title: "Estados", width: "150px", height: "320px", type: "modal", offsetHeight: "15px" }}
                customSearch={
                    <StyledBobine $fontSize="14px" $fontWeight={700} $width="40px" $height="35px" color={bColors(valueObj.estado).color} $fontColor={bColors(valueObj.estado).fontColor}
                    // {...onClick ? () => onClick && onClick("estado", { data: v }) : null}
                    >{valueObj.estado}</StyledBobine>
                }
            />
        </>
    )
}
export const Container = ({ loading = false, children, id = "default", wrapForm = false, form, initialValues, onFinish, onValuesChange, validation, forInput = true, wrapFormItem = false, style, size = "small", ...props }) => {
    const dataContext = { form, wrapForm, wrapFormItem, forInput, containerId: id, size, validation };
    return (
        <Spin spinning={loading} indicator={<></>}>
            <Context.Provider value={dataContext}>
                <ConditionalWrapper
                    condition={wrapForm}
                    wrapper={children => <Form name={`frm-${id}`} form={form} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={initialValues}>{children}</Form>}
                >
                    <MainContainer style={style} {...props}>{children}</MainContainer>
                </ConditionalWrapper>
            </Context.Provider>
        </Spin>
    );
}

const height = (size) => {
    if (size) {
        return { height: "28px", minHeight: "28px" };
    } else if (size === "small") {
        return { height: "22px", minHeight: "22px" };
    } else if (size === "default" || size === "middle") {
        return { height: "28px", minHeight: "28px" };
    } else if (size === "large") {
        return { height: "32px", minHeight: "32px" };
    }
};

export const Lookup = ({ dataAPI, payload, columnDefs, filters, onSelectionChanged, style, closeSelf, ignoreRowSelectionOnCells = [],
    rowSelection, wndRef, extraRef, onOk, onCancel, onCancelText = "Fechar", onOkText = "OK", dataGridProps, ...props }) => {
    const _dataAPI = dataAPI ? null : useDataAPI({ payload });
    const gridRef = useRef();
    const submitting = useSubmitting(true);
    useEffect(() => {
        submitting.end();
    }, []);

    const _onOk = async () => {
        let _close = null;
        if (onOk) {
            _close = await onOk(getSelectedNodes(gridRef.current.api), gridRef.current.api);
        }
        //Tem mesmo de fechar porque o STATE NÃO É ATUALIZADO devido ao Modal??
        if (_close !== false) {
            closeSelf();
        }
    }
    const _onCancel = async () => {
        if (onCancel) {
            await onCancel(gridRef.current.api);
        }
        closeSelf();
    }

    return (<>
        <TableGridSelect
            gridRef={gridRef}
            rowSelection={rowSelection}
            style={style}
            ignoreRowSelectionOnCells={ignoreRowSelectionOnCells}
            columnDefs={columnDefs}
            filters={filters}
            dataAPI={dataAPI ? dataAPI : _dataAPI}
            {...rowSelection !== "multiple" && { onSelectionChanged: async (row) => (typeof onSelectionChanged === "function") && await onSelectionChanged(row, closeSelf, gridRef.current.api) }}
            {...dataGridProps}
        />
        {extraRef && <Portal elId={extraRef.current}>
            <Space>
                <Button disabled={submitting.state} onClick={_onCancel}>{onCancelText}</Button>
                <Button type="primary" disabled={submitting.state} onClick={_onOk}>{onOkText}</Button>
            </Space>
        </Portal>}
    </>);
};
export const ClientesLookupField = ({ title = "Clientes", keyField = "BPCNUM_0", textField = "BPCNAM_0", baseFilters = {}, ...props }) => {
    return <SelectorPopup
        payload={{
            url: `${API_URL}/artigos/sql/`, primaryKey: "BPCNUM_0", parameters: { method: "ClientesLookup" },
            pagination: { enabled: true, page: 1, pageSize: 20 }, baseFilter: { ...parseFilter("sgp_id", `!isnull`, { type: "number" }) },
            sortMap: {}
        }}
        dataGridProps={{
            columnDefs: [
                { colId: '"BPCNUM_0"', field: 'BPCNUM_0', headerName: 'Cliente Cód.', width: 130, cellRenderer: (params) => <Value bold params={params} /> },
                { colId: '"BPCNAM_0"', field: 'BPCNAM_0', headerName: 'Cliente', flex: 1, cellRenderer: (params) => <Value params={params} /> },
            ],
            filters: { toolbar: ["@columns"], more: [], no: [...Object.keys(baseFilters)] }
        }}
        popupProps={{ title, width: "700px", height: "500px", type: "modal" }}
        keyField={keyField}
        textField={textField}
        detailFn={(v, r) => <b>{v?.value}</b>}
        {...props}
    />
};

export const Label = ({ ...props }) => {
    const { text = "", style = {}, name } = props;
    return (
        <div {...props} style={{ fontWeight: 600, ...style }}>
            <label htmlFor={name} title={text}>
                {text}
            </label>
        </div>
    );
}
export const ForView = ({ name, path, size, children, data, keyField, textField, optionsRender, labelInValue, forViewBorder = true, forViewBackground = true, style, ...props }) => {
    const { form } = useContext(Context);
    const value = form.getFieldValue(name);
    const _height = height(size);

    const type = useMemo(() => {
        if (props?.type == "selector") {
            return 'Selector';
        } else if (children.type === InputNumber) {
            return 'InputNumber';
        } else if (children.type === Switch) {
            return 'Switch';
        } else if (children.type === Checkbox) {
            return 'Checkbox';
        } else {
            return 'any';
        }
    }, [children.type]);

    return (
        <>
            {(() => {
                switch (type) {
                    case 'Switch':
                        return (<Switch size={size} {...children.props} value={value} disabled={true} />);
                    case 'Checkbox':
                        return (<Checkbox size={size} {...children.props} checked={value} disabled={true} />);
                    case 'InputNumber':
                        return <DefaultForView value={value} childrenProps={children.props} forViewProps={{ height: _height, name, path, size, data, keyField, textField, optionsRender, labelInValue, forViewBorder, forViewBackground, style, ...props }} />
                    case "Selector":
                        return React.cloneElement(children, { ...children.props, forView: true, forViewProps: { height: _height, name, path, size, data, keyField, textField, optionsRender, labelInValue, forViewBorder, forViewBackground, style, ...props }, value });
                    default:
                        return <DefaultForView value={value} childrenProps={children.props} forViewProps={{ height: _height, name, path, size, data, keyField, textField, optionsRender, labelInValue, forViewBorder, forViewBackground, style, ...props }} />
                }
            })()}
        </>
    );
}
export const Field = ({ name, path: _path, children, label = {}, forInput, forViewBackground, forViewBorder, style, colProps, type, rowStyle }) => {
    const { form, validation, ...ctx } = useContext(Context);
    const path = path ? path : name;
    const _forInput = isNil(forInput) ? ctx.forInput : forInput;
    const _size = children?.props?.size ? children?.props?.size : ctx.size
    const { text, enabled = true, pos = "top", style: labelStyle } = label;
    const status = _status(name, validation);
    if (!children) {
        return <>{children}</>
    } else if (_forInput) {
        return (
            <Row nogutter direction={pos == "top" ? "column" : "row"} style={{ margin: "2px", ...rowStyle }}>
                {enabled && <Col xs="content" style={{ fontWeight: 600, fontSize: "12px", ...labelStyle }}>{text}</Col>}
                <Tooltip title={status.valid ? "" : status.error}>
                    <Col xs="content" style={{ ...style, ...status.valid == false ? { padding: "2px", borderRadius: "3px", background: "#ffa39e", border: "solid 1px #ff7875" } : { padding: "3px" } }} {...colProps}>
                        <div>
                            <Form.Item name={name} noStyle {...children?.type === Checkbox && { valuePropName: "checked" }}>
                                {React.Children.map(children, child => {
                                    return React.cloneElement(child, { size: _size /* ...onBlur && {onBlur: () => onBlur(name) } */ });
                                })}
                            </Form.Item>

                        </div>
                    </Col >
                </Tooltip>
            </Row>
        );
    } else if (children) {
        return (
            <Row nogutter direction={pos == "top" ? "column" : "row"} style={{ margin: "2px", ...rowStyle }}>
                {enabled && <Col xs="content" style={{ fontWeight: 600, fontSize: "12px", ...labelStyle }}>{text}</Col>}
                <Col xs="content" style={{ ...style, padding: "3px" }} {...colProps}>
                    <ForView type={type} name={name} path={path} size={_size} {...children?.props} forViewBackground={forViewBackground} forViewBorder={forViewBorder}>{children}</ForView>
                </Col>
            </Row>
        );
    }
}