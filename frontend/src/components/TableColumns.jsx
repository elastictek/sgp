import React, { useEffect, useState, useCallback, useRef, useContext, forwardRef, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import { StarFilled, CheckSquareOutlined, BorderOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Tag, Button } from "antd";
import { FORMULACAO_CUBAS, DATETIME_FORMAT } from "config";
import dayjs from 'dayjs';
import { props } from 'ramda';
import { ImArrowDown,ImArrowUp } from 'react-icons/im';



export const QueueNwColumn = ({ value, status, cellProps, style = {} }) => {

    const getValue = () => {
        if (status === 0) {
            return <div />;
        }
        switch (value) {
            case 1: return <Tag style={{ width: "100%", color: "#000", ...style }} color="#87d068">Em uso</Tag>;
            case 2: return <Tag style={{ width: "100%", color: "#000", ...style }} color="#fff566">Em espera</Tag>
            default: return <Tag style={{ width: "100%", color: "#000", ...style }} color="#2db7f5">Em preparação</Tag>
        }
    }

    return (<>{!cellProps?.inEdit && getValue(value)}</>);
}

export const PosColumn = ({ value, cellProps }) => {
    return (<>{!cellProps?.inEdit && <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {value === 1 ? <ImArrowUp /> : <ImArrowDown />}
        <div style={{ marginRight: "5px" }}>{value === 1 ? "SUP" : "INF"}</div>
    </div>}</>);
}

export const Link = ({ value, onClick, style, cellProps, ...props }) => {
    return (<>{!cellProps?.inEdit && <Button type='link' style={{ fontWeight: 700, ...style }} onClick={onClick}>{value}</Button>}</>);
}
export const DateTime = ({ value, format = DATETIME_FORMAT, style, className, cellProps }) => {
    return (<>{!cellProps?.inEdit && <div style={{ textAlign: "left", ...style }} {...className && { className }}>{(value && dayjs(value).isValid()) && dayjs(value).format(format)}</div>}</>);
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
export const Nonwovens = ({ valueUp, valueInf, onClick, style, cellProps, ...props }) => {
    return (<>{!cellProps?.inEdit && <div style={{ display: "flex", flexDirection: "column", fontSize: "11px" }}>
        <div>{valueUp ? valueUp : '--'}</div>
        <div>{valueInf ? valueInf : '--'}</div>
    </div>}</>);
}

export const ArrayColumn = ({ value, distinct = true, onClick, style, cellProps, ...props }) => {
    const getValue = (v) => {
        if (distinct) {
            return [...new Set(v)];
        } else {
            return v;
        }
    }

    return (<>{!cellProps?.inEdit && <div style={{ display: "flex", fontSize: "11px" }}>
        {value && getValue(value).map((v, i) => <div key={`${cellProps?.name}-${i}`}>{v}</div>)}
    </div>}</>);
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
export const Cuba = ({ value,style }) => {
    const val = getValue(value);
    return (<>
        {value && <>
            {(val !== null && val !== undefined) ? <StyledCuba style={{...style}} color={colors[value].color} fontColor={colors[value].fontColor}>{val}</StyledCuba> : <StyledCuba color="#000" fontColor="#fff">{value}</StyledCuba>}
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

export const Valid = ({ value = 1, genre = "m", onClick, allowed = [0, 1], cellProps }) => {
    return (<>
        {!cellProps?.inEdit &&
            <>
                {value == 0 && allowed.includes(value) && <Tag {...onClick && { onClick }} icon={<CloseCircleOutlined />} style={{ ...onClick && { cursor: "pointer" } }} color="error"></Tag>}
                {value == 1 && allowed.includes(value) && <Tag {...onClick && { onClick }} icon={<CheckCircleOutlined />} style={{ ...onClick && { cursor: "pointer" } }} color="success"></Tag>}
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

export const MetodoTipo = ({ value, onClick, cellProps }) => {
    return (<>
        {!cellProps?.inEdit &&
            <>
                {(value && (value?.toLowerCase() == "gramagem" || value?.toLowerCase() == "gramagem")) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }}>Gramagem</Tag>}
                {(value && (value?.toLowerCase() == "histerese" || value?.toLowerCase() == "histerese")) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }}>Histerese</Tag>}
                {(value && (value?.toLowerCase() == "tração" || value?.toLowerCase() == "traction")) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }}>Tração</Tag>}
                {(value && (value?.toLowerCase() == "desgrudar" || value?.toLowerCase() == "peel")) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }}>Peel</Tag>}
            </>
        }
    </>);
}
export const MetodoMode = ({ value, onClick, cellProps }) => {
    return (<>
        {!cellProps?.inEdit &&
            <>
                {(value && value?.toLowerCase() == "simples") && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }}>Simples</Tag>}
                {(value && value?.toLowerCase() == "controle") && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }}>Controle</Tag>}
                {(value && value?.toLowerCase() == "cíclico") && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }}>Cíclico</Tag>}
            </>
        }
    </>);
}
export const MetodoAging = ({ value, cellProps }) => {
    return (<>
        {!cellProps?.inEdit &&
            <>
                {!value && <Tag style={{ width: "100px" }}>Saída de Linha</Tag>}
                {value && <RightAlign unit={" dias"}>{value}</RightAlign>}
            </>
        }
    </>);
}


export const TextAreaViewer = ({ parameters }) => {
    return (<>
        {parameters?.value}
    </>);
}
