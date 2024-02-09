import React, { useState, useEffect, useContext, createContext, useRef, useMemo } from 'react';
import { Form, Tooltip, Drawer, Modal, Button, Row as AntRow, Col as AntCol, Input, Tag, AutoComplete, Select, Switch, Alert, Checkbox, Spin, DatePicker, InputNumber, TimePicker } from "antd";
import styled, { css } from "styled-components";
import classNames from "classnames";
import { createUseStyles } from 'react-jss';
import { ConditionalWrapper } from '../conditionalWrapper';
import Portal from "../portal";
import YScroll from "../YScroll";
import PointingAlert from "../pointingAlert";
import { debounce, dayjsValue } from "utils";
import { validate, getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { LoadingOutlined, CheckSquareOutlined, BorderOutlined } from '@ant-design/icons';
import { BiWindow } from "react-icons/bi";
import { BsBoxArrowInDownRight } from "react-icons/bs";
import { AiOutlineFullscreen } from "react-icons/ai";
import RangeDate from "../RangeDate";
import RangeTime from "../RangeTime";
import { DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT } from 'config';
import { Container as MainContainer, Row, Col } from 'react-grid-system';
import Selector from './Selector';
import { isNil } from 'ramda';


export const Context = createContext({});



export const Container = ({ loading = false, children, id = "default", wrapForm = false, form, initialValues, onFinish, onValuesChange, forInput = true, wrapFormItem = false, style, size = "small", ...props }) => {
    const dataContext = { form, wrapForm, wrapFormItem, forInput, containerId: id, size };
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

export const ForView = ({ name, path, size, children, data, keyField, textField, optionsRender, labelInValue, forViewBorder = true, forViewBackground = true, style }) => {
    const { form } = useContext(Context);
    const value = form.getFieldValue(name);
    const _height = height(size);

    const type = useMemo(() => {
        if (children.type === InputNumber) {
            return 'InputNumber';
        } else if (children.type === Switch) {
            return 'Switch';
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
                    case 'InputNumber':
                        if ("addonAfter" in children.props || "addonBefore" in children.props) {
                            return (<div style={{ borderRadius: "3px", padding: "2px", ...forViewBorder && { border: "solid 1px #d9d9d9" }, ..._height, ...forViewBackground && { background: "#f0f0f0" }, ...(style && style) }} {...onDoubleClick && { onDoubleClick }}>
                                <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                                    {("addonBefore" in children.props) && <div style={{ marginRight: "2px" }}>{children.props.addonBefore}</div>}
                                    <div>{value}</div>
                                    {("addonAfter" in children.props) && <div style={{ marginLeft: "2px" }}>{children.props.addonAfter}</div>}
                                </div>
                            </div>)
                        }
                        return (<div style={{ borderRadius: "3px", padding: "2px", ...forViewBorder && { border: "solid 1px #d9d9d9" }, display: "flex", ..._height, alignItems: "center", justifyContent: "end", ...forViewBackground && { background: "#f0f0f0" }, ...(style && style) }} {...onDoubleClick && { onDoubleClick }}>{value}</div>);
                    default:
                        if ("addonAfter" in children.props || "addonBefore" in children.props) {
                            return (<div style={{ borderRadius: "3px", padding: "2px", ...forViewBorder && { border: "solid 1px #d9d9d9" }, ..._height, ...forViewBackground && { background: "#f0f0f0" }, ...(style && style) }} {...onDoubleClick && { onDoubleClick }}>
                                <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                                    {("addonBefore" in children.props) && <div style={{ marginRight: "2px" }}>{children.props.addonBefore}</div>}
                                    <div>{value}</div>
                                    {("addonAfter" in children.props) && <div style={{ marginLeft: "2px" }}>{children.props.addonAfter}</div>}
                                </div>
                            </div>)
                        }
                        return (<div style={{ borderRadius: "3px", padding: "2px", ...forViewBorder && { border: "solid 1px #d9d9d9" }, display: "flex", ..._height, alignItems: "center", ...forViewBackground && { background: "#f0f0f0" }, ...(style && style) }} {...onDoubleClick && { onDoubleClick }}>{value}</div>);
                }
            })()}
        </>
    );
}
export const Field = ({ name, path: _path, children, label = {}, forInput = true, forViewBackground, forViewBorder, status, style, colProps }) => {
    const { form, ...ctx } = useContext(Context);
    const path = path ? path : name;
    const _forInput = isNil(forInput) ? ctx.forInput : forInput;
    const _size = children?.props?.size ? children?.props?.size : ctx.size
    const { text, enabled = true, pos = "top", style: labelStyle } = label;
    if (!children) {
        return <>{children}</>
    } else if (_forInput) {
        return (
            <Row nogutter direction={pos == "top" ? "column" : "row"} style={{ margin: "2px" }}>
                {enabled && <Col xs="content" style={{ fontWeight: 600, ...labelStyle }}>{text}</Col>}
                <Col xs="content" style={{ ...style, ...status ? { padding: "2px", borderRadius: "3px", background: "#ffa39e", border: "solid 1px #ff7875" } : { padding: "3px" } }} {...colProps}>
                    <Form.Item name={name} noStyle>
                        {React.Children.map(children, child => {
                            return React.cloneElement(child, { size: _size /* ...onBlur && { onBlur: () => onBlur(name) } */ });
                        })}
                    </Form.Item>
                </Col >
            </Row>
        );
    } else if (children) {
        return <ForView name={name} path={path} size={_size} {...children?.props} forViewBackground={forViewBackground} forViewBorder={forViewBorder}>{children}</ForView>;
    }
}