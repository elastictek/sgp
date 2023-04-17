import React, { useEffect, useState, useCallback, useRef, useContext, forwardRef, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import { StarFilled, CheckSquareOutlined, BorderOutlined } from '@ant-design/icons';
import { Tag, Button } from "antd";
import { FORMULACAO_CUBAS } from "config";
import { props } from 'ramda';


export const Link = ({ value, onClick, style, cellProps, ...props }) => {
    return (<>{!cellProps?.inEdit && <Button type='link' style={{ fontWeight: 700, ...style }} onClick={onClick}>{value}</Button>}</>);
}

export const RightAlign = ({ children, unit, style, className, addonAfter, addonBefore, cellProps }) => {
    return (<>{!cellProps?.inEdit && <div style={{ textAlign: "right", ...style }} {...className && { className }}>{addonBefore}{children && `${children}${(unit && unit) || ''}`}{addonAfter}</div>}</>);
}
export const CenterAlign = ({ children, unit, style, className, addonAfter, addonBefore, cellProps }) => {
    return (<>{!cellProps?.inEdit && <div style={{ textAlign: "center", ...style }} {...className && { className }}>{addonBefore}{children && `${children}${(unit && unit) || ''}`}{addonAfter}</div>}</>);
}
export const LeftAlign = ({ children, unit, style, className, cellProps }) => {
    return (<>{!cellProps?.inEdit && <div style={{ textAlign: "left", ...style }} {...className && { className }}>{children}{unit && ` ${unit}`}</div>}</>);
}
export const Favourite = ({ value, cellProps }) => {
    return (<>{!cellProps?.inEdit && <div style={{ display: "flex", justifyContent: "center" }}>{value ? <StarFilled style={{ fontSize: "18px", color: "#d4b106" }} /> : ""}</div>}</>)
}
const colors = [
    { color: "#237804", fontColor: "#fff" },
    { color: "#fadb14", fontColor: "#000" },
    { color: "#ff1100", fontColor: "#fff" },
    { color: "#13c2c2", fontColor: "#000" },
    { color: "#0050b3", fontColor: "#fff" },
    { color: "#d50329", fontColor: "#fff" },
    { color: "#2fb48e", fontColor: "#fff" },
    { color: "#8dbbca", fontColor: "#fff" },
    { color: "#dfcc88", fontColor: "#fff" },
    { color: "#bc5fcb", fontColor: "#fff" },
    { color: "#02b5f7", fontColor: "#fff" }
];
const StyledCuba = styled.div`
        border:dashed 1px #000;
        background-color:${props => props.color};
        color:${props => props.fontColor};
        border-radius:3px;
        text-align:center;
        font-weight:700;
        width:25px;
        height:19px;
        line-height:17px;
        font-size:14px;
        cursor:pointer;
        &:hover {
            border - color: #d9d9d9;
    }
        `;
export const getValue = (v) => (v) ? FORMULACAO_CUBAS.find(x => x.key == v)?.value : null;
export const Cuba = ({ value }) => {
    const val = getValue(value);
    return (<>
        {value && <>
            {(val !== null && val !== undefined) ? <StyledCuba color={colors[value].color} fontColor={colors[value].fontColor}>{val}</StyledCuba> : <StyledCuba color="#000" fontColor="#fff">{value}</StyledCuba>}
        </>}
    </>);
}
export const Bool = ({ value, cellProps }) => {
    return (<>
        {!cellProps?.inEdit && <div style={{ display: "flex", justifyContent: "center" }}>
            {(value == 1) ? <CheckSquareOutlined style={{ fontSize: "18px" }} /> : <BorderOutlined style={{ fontSize: "18px", color: "#d9d9d9" }} />}
        </div>}
    </>);
}

export const Status = ({ value = 1, genre = "m", onClick, allowed = [0, 1], cellProps }) => {
    return (<>
        {!cellProps?.inEdit &&
            <>
                {value == 0 && allowed.includes(value) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }}>Inativ{genre === "m" ? "o" : "a"} </Tag>}
                {value == 1 && allowed.includes(value) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="green">Ativ{genre === "m" ? "o" : "a"}</Tag>}
                {value == 9 && allowed.includes(value) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="red">Finalizad{genre === "m" ? "o" : "a"}</Tag>}
            </>
        }</>);
}

export const MetodoOwner = ({ value = 0, onClick, cellProps }) => {
    return (<>
        {!cellProps?.inEdit &&
            <>
                {value == 0 && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }}>Elastictek</Tag>}
                {value == 1 && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }}>Cliente</Tag>}
            </>
        }
    </>);
}

export const TextAreaViewer = ({ parameters }) => {
    return (<>
        {parameters?.value}
    </>);
}
