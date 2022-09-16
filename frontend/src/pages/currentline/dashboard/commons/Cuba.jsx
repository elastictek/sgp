import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { FORMULACAO_CUBAS } from "config";


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
    height:22px;
    font-size:14px;
    cursor:pointer;
    &:hover {
        border-color: #d9d9d9;
    }
`;

export const getValue = (v) => (v) ? FORMULACAO_CUBAS.find(x => x.key === v)?.value : null;

export const Cuba = ({ value }) => {
    const val = getValue(value);
    return (<>
        {value && <> 
            {(val !== null && val !== undefined) ? <StyledCuba color={colors[value].color} fontColor={colors[value].fontColor}>{val}</StyledCuba> : <StyledCuba color="#000" fontColor="#fff">{value}</StyledCuba>} 
        </>}
    </>);
}