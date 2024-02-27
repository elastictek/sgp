import React, { useEffect, useState, useRef } from 'react';
import { PALETE_SIZES, PALETES_WEIGH, PALETIZACAO_ITEMS, CONTENTORES_OPTIONS, CINTASPALETES_OPTIONS } from 'config';
import { isValue } from 'utils';
import styled from 'styled-components';
import { produce } from 'immer';
import { useImmer } from "use-immer";


const offset = 10;
const vGap = 0;
const x = 200;
const xText = -80;
const width = "100%"
const height = null;
const heightPercentage = 1;
const viewBox = null;

const Group = styled.g`
    cursor:pointer;  
    &:hover {
        fill: #1677ff;
    }
`;

export const SvgPalete = ({ key, pos, text }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <g key={key} transform={`translate(${x},${y})`}>
            <title>{text}</title>
            <rect stroke="#000" height={20} width="180" y={0} x={-15} fill="#000000" />
            <rect stroke="#000" height={20 / 2} width="70" y={20 / 2 / 2} x={0} fill="#ffffff" />
            <rect stroke="#000" height={20 / 2} width="70" y={20 / 2 / 2} x={80} fill="#ffffff" />
            {text && (<text transform={`matrix(1 0 0 1 ${xText} 15)`} fontFamily="'Open Sans', sans-serif" fontSize="12" /* fontWeight="bold" */ textAnchor="middle">{text}</text>)}
        </g>
    );
}
export const SvgBobine = ({ key, pos = {} }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <g key={key} transform={`translate(${x},${y})`}>
            <title>Bobine</title>
            <path stroke="#000" strokeWidth={2} d="m149.93665,6.86042c0,3.63587 -33.54134,6.58333 -74.91668,6.58333m74.91668,-6.58333l0,0c0,3.63587 -33.54134,6.58333 -74.91668,6.58333c-41.37532,0 -74.91665,-2.94745 -74.91665,-6.58333m0,0l0,0c0,-3.63587 33.54133,-6.58333 74.91665,-6.58333c41.37534,0 74.91668,2.94746 74.91668,6.58333l0,26.33334c0,3.63587 -33.54134,6.58332 -74.91668,6.58332c-41.37532,0 -74.91665,-2.94745 -74.91665,-6.58332l0,-26.33334z" fill="#ffffff" />
        </g>
    );

}
export const SvgBobines = ({ key, pos, filmeEstiravel = 0, bobinesTxt, onClick, npalete, nbobines, ...props }) => {
    const { x = 0, y = 20 } = pos;
    const objProps = {
        height: ((props.height - 5) / 3), //3 elements and gap
        width: 150,
        gap: 3,
        x: 0.25,
        y: 0.25,
        strokeWidth: 1
    }
    return (
        <React.Fragment key={key}>
            <g transform={`translate(${x},${y})`} style={{ ...onClick && { cursor: "pointer" } }} onClick={() => onClick && onClick(npalete, nbobines)}>
                <g>
                    <rect
                        style={{ display: "inline", fill: "#ffffff", fillOpacity: 1, stroke: "#000000", strokeWidth: objProps.strokeWidth, strokeDasharray: "none", strokeOpacity: 1 }}
                        id="rect1"
                        width={objProps.width}
                        height={objProps.height}
                        x={objProps.x}
                        y={objProps.y} />
                    <rect
                        style={{ display: "inline", fill: "#ffffff", fillOpacity: 1, stroke: "#000000", strokeWidth: objProps.strokeWidth, strokeDasharray: "none", strokeOpacity: 1 }}
                        id="rect2"
                        width={objProps.width}
                        height={objProps.height}
                        x={objProps.x}
                        y={objProps.y + (objProps.height) + (objProps.gap)} />
                    {bobinesTxt && <text textAnchor="middle" dominantBaseline="middle" fontWeight={800} fontFamily="'Open Sans', sans-serif" fontSize="18px" x={objProps.x + objProps.width / 2} y={(objProps.y + 1 + (objProps.height) + (objProps.gap)) + objProps.height / 2}>{bobinesTxt}</text>}
                    <rect
                        style={{ display: "inline", fill: "#ffffff", fillOpacity: 1, stroke: "#000000", strokeWidth: objProps.strokeWidth, strokeDasharray: "none", strokeOpacity: 1 }}
                        id="rect3"
                        width={objProps.width}
                        height={objProps.height}
                        x={objProps.x}
                        y={objProps.y + (objProps.height * 2) + (objProps.gap * 2)} />
                </g>
            </g>
        </React.Fragment>
    );
}
export const SvgPlacaCartao = ({ key, pos, text = "Placa de Cartão", ...props }) => {
    const { x = 0, y = 20 } = pos;
    const rectHeight = 4;
    const objProps = {
        height: props.height,
        width: 150,
        y: (props.height / 2) - (rectHeight / 2),
        strokeWidth: 1
    }
    return (
        <g key={key} transform={`translate(${x},${y})`}>
            <title>{text}</title>
            <rect strokeWidth={objProps.strokeWidth} stroke="#000000" height={rectHeight} width={objProps.width} y={objProps.y} x="0" fill="#595959" />
            {text && <text transform={`matrix(1 0 0 1 ${xText} ${objProps.height - rectHeight})`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">{text}</text>}
        </g>
    );
}
export const SvgPlacaPlastico = ({ key, pos, text = "Placa de Plástico", ...props }) => {
    const { x = 0, y = 20 } = pos;
    const rectHeight = 4;
    const objProps = {
        height: props.height,
        width: 150,
        y: (props.height / 2) - (rectHeight / 2),
        strokeWidth: 1
    }
    return (
        <g key={key} transform={`translate(${x},${y})`}>
            <title>{text}</title>
            <rect strokeWidth={objProps.strokeWidth} stroke="#000" height={rectHeight} width={objProps.width} y={objProps.y} x="0" fill="#8c8c8c" />
            {text && <text transform={`matrix(1 0 0 1 ${xText} ${objProps.height - rectHeight})`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">{text}</text>}
        </g>
    );
}
export const SvgPlacaMDF = ({ key, pos, text = "Placa MDF", ...props }) => {
    const { x = 0, y = 20 } = pos;
    const objProps = {
        height: props.height,
        width: 150,
        gap: 5,
        x: 0.25,
        y: 0.25,
        strokeWidth: 1
    }
    return (
        <g key={key} transform={`translate(${x},${y})`}>
            <g>
                <rect
                    style={{ display: "inline", fill: "#d9d9d9", fillOpacity: 1, stroke: "#000000", strokeWidth: objProps.strokeWidth, strokeDasharray: "none", strokeOpacity: 1 }}
                    id="rect2"
                    width={objProps.width}
                    height={objProps.height}
                    x={objProps.x}
                    y={objProps.y}
                />
                <text textAnchor="middle" dominantBaseline="middle" x={objProps.x + objProps.width / 2} y={(objProps.y + objProps.height + 2) / 2} fontFamily="'Open Sans', sans-serif" fontSize="12">{text}</text>
            </g>
        </g>
    );
}
export const SvgCantoneira = ({ key, pos, text = "Cantoneira Cartão Branco", idx, group, elements, ...props }) => {
    const { x = 0, y = 20 } = pos;
    const rectHeight = 6;
    const lineHeight = props.height - rectHeight;
    const objProps = {
        height: props.height,
        width: 150,
        x: 0.25,
        y: props.height
    }

    return (
        <g key={key} transform={`translate(${x},${y})`}>
            <title>{text}</title>
            {idx > 0 && elements[group][idx - 1]?.item_id == 2 ?
                <>
                    <line id="svg_10" y2={objProps.y + objProps.height} x2="-5" y1="0" x1="-5" strokeWidth={rectHeight} stroke="#000" fill="none" />
                    <line id="svg_10" y2={objProps.y + objProps.height} x2={objProps.width + 5} y1="0" x1={objProps.width + 5} strokeWidth={rectHeight} stroke="#000" fill="none" />
                    {text && <text transform={`matrix(1 0 0 1 ${xText} ${objProps.height + (objProps.height / 2)})`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">{text}</text>}
                    <rect stroke="null" height={rectHeight} width={objProps.width + 10} y={0} x="-5" fill="#000000" />
                </>
                :
                <>
                    <line id="svg_10" y2={-objProps.y} x2="-5" y1={objProps.y} x1="-5" strokeWidth={rectHeight} stroke="#000" fill="none" />
                    <line id="svg_10" y2={-objProps.y} x2={objProps.width + 5} y1={objProps.y} x1={objProps.width + 5} strokeWidth={rectHeight} stroke="#000" fill="none" />
                    {text && <text transform={`matrix(1 0 0 1 ${xText} ${objProps.height - (objProps.y / 2)})`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">{text}</text>}
                    <rect stroke="null" height={rectHeight} width={objProps.width + 10} y={lineHeight} x="-5" fill="#000000" />
                </>
            }

        </g>
    );
}
export const SvgCutHere = ({ key, pos, text = "Etiqueta Cut Here", ...props }) => {
    const { x = 0, y = 20 } = pos;
    const objProps = {
        height: props.height,
        width: 150,
        x: 0.25,
        y: props.height * 2 - 5
    }
    return (
        <g key={key} transform={`translate(${x - 30},${y - 2})`}>
            <title>{text}</title>
            <path d="M23.354,7.23c0,0-1.439-1.239-2.652-0.548c-0.934,0.537-6.867,3.514-9.514,4.84L7.44,9.379
    C7.847,8.658,7.915,7.824,7.696,7.02c-0.277-1.016-1.01-1.979-2.092-2.598C3.659,3.307,1.321,3.731,0.388,5.369
    c-0.416,0.723-0.484,1.563-0.266,2.373c0.277,1.016,1.01,1.98,2.092,2.602c0.478,0.27,0.976,0.449,1.471,0.541v0.001
    c0.004,0.001,0.008,0.001,0.012,0.003c0.039,0.006,0.084,0.015,0.127,0.02c3.086,0.459,4.664,1.33,5.43,1.944
    c-0.766,0.616-2.344,1.485-5.43,1.945c-0.043,0.005-0.088,0.013-0.127,0.019c-0.004,0.002-0.008,0.002-0.012,0.004l0,0
    c-0.494,0.092-0.992,0.271-1.471,0.542c-1.082,0.622-1.814,1.585-2.092,2.602c-0.219,0.808-0.15,1.648,0.266,2.375
    c0.934,1.635,3.271,2.061,5.217,0.946c1.082-0.621,1.814-1.584,2.092-2.602c0.219-0.803,0.15-1.635-0.256-2.357l3.748-2.142
    c2.646,1.325,8.58,4.305,9.514,4.839c1.213,0.691,2.652-0.547,2.652-0.547l-9.838-5.624L23.354,7.23z M5.843,8.487
    C5.417,9.229,4.173,9.35,3.126,8.751C2.511,8.401,2.048,7.843,1.89,7.263C1.821,7.004,1.776,6.625,1.978,6.278
    c0.424-0.741,1.668-0.862,2.715-0.264c0.625,0.355,1.074,0.898,1.234,1.488C5.999,7.758,6.04,8.139,5.843,8.487z M5.927,18.203
    c-0.16,0.591-0.609,1.133-1.234,1.489c-1.047,0.6-2.291,0.478-2.715-0.265c-0.201-0.348-0.156-0.726-0.088-0.982
    c0.158-0.582,0.621-1.14,1.236-1.492c1.047-0.598,2.291-0.477,2.717,0.266C6.04,17.569,5.999,17.947,5.927,18.203z"/>
            <line id="svg_10" y2={(objProps.height / 2) + 2} x2="175" y1={(objProps.height / 2) + 2} x1="35" strokeWidth="1" stroke="#000" fill="none" strokeDasharray="4"></line>
            {/*{text && <text transform={`matrix(1 0 0 1 ${objProps.width+85} 16)`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">{text}!</text>}*/}
            {text && <text transform={`matrix(1 0 0 1 ${xText} 16)`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">{text}!</text>}

        </g>
    );
}

const compute = (els, currentPosY = 0) => {
    let _grpHeight = 0;
    let _grpY = 0;
    for (const v of els) {
        let posY = currentPosY + offset;
        if (v.item_id !== 7) {
            _grpHeight += v.height + vGap;
        }
        _grpY += v.height + vGap;
        currentPosY += v.height + vGap;
        v.pos = { x: v.x, y: posY };
    }
    return { total: currentPosY, totalGroupHeight: _grpHeight, totalGroupY: _grpY };
}
const build = (data, reverse = false) => {
    if (data?.details) {
        const _details = reverse ? [...data.details].reverse() : [...data.details];
        let els = [];
        let npaletes = 0;
        let newPaleteGroup = false;
        //const cintas = isValue(data.cintas, undefined, 0);
        //const ncintas = isValue(data.ncintas, undefined, 0);
        //const currentGroup=0;
        const groupsLvl = [[]];
        const groupsLvlHeight = [];
        for (let v of _details) {
            switch (v.item_id) {
                case 1:
                    npaletes++;
                    newPaleteGroup = true;
                    if (npaletes > groupsLvl.length) {
                        groupsLvl.push([]);
                    }
                    groupsLvl[groupsLvl.length - 1].push({
                        obj: SvgPalete, x, height: 25, text: `Palete ${PALETE_SIZES.find((p) => p.key == v.item_paletesize).value
                            }`,
                        item_order: v.item_order,
                        item_id: v.item_id,
                    });
                    break;
                case 2:
                    if (newPaleteGroup) {
                        newPaleteGroup = false;
                    } else {
                        npaletes++;
                        if (npaletes > groupsLvl.length) {
                            groupsLvl.push([]);
                        }
                    }
                    groupsLvl[groupsLvl.length - 1].push({ obj: SvgBobines, x, height: 70, filmeEstiravel: isValue(data.filmeestiravel_bobines, undefined, 0), item_numbobines: v.item_numbobines, bobinesTxt: v.item_numbobines ? `${v.item_numbobines} Bobine(s)` : null, item_order: v.item_order, item_id: v.item_id });
                    break;
                case 3:
                    groupsLvl[groupsLvl.length - 1].push({ obj: SvgPlacaCartao, x, height: 15, item_order: v.item_order, item_id: v.item_id });
                    break;
                case 4:
                    groupsLvl[groupsLvl.length - 1].push({ obj: SvgPlacaMDF, x, height: 15, item_order: v.item_order, item_id: v.item_id });
                    break;
                case 5:
                    groupsLvl[groupsLvl.length - 1].push({ obj: SvgPlacaPlastico, x, height: 15, item_order: v.item_order, item_id: v.item_id });
                    break;
                case 6:
                    groupsLvl[groupsLvl.length - 1].push({ obj: SvgCantoneira, x, height: 10, item_order: v.item_order, item_id: v.item_id });
                    break;
                case 7:
                    groupsLvl[groupsLvl.length - 1].push({ obj: SvgCutHere, x, height: 20, item_order: v.item_order, item_id: v.item_id });
                    break;

            }
        }
        let _posY = 0;
        if (reverse) {
            groupsLvl.reverse();
        }
        for (const g of groupsLvl) {
            const _heights = compute(reverse ? g.reverse() : g, _posY);
            _posY = _heights.total;
            groupsLvlHeight.push({ height: _heights.totalGroupHeight, y: _heights.totalGroupY });
            if (reverse) {
                g.reverse();
            }
        }
        return {
            totalHeight: _posY,
            elements: groupsLvl,
            elementsHeight: groupsLvlHeight,
            paletes_sobrepostas: npaletes > 1 ? 1 : 0,
        };
    }
};


export default ({ data, timestamp,reverse }) => {
    const acc = useRef(0);
    const offs = useRef(0);
    const [state, updateState] = useState({
        totalHeight: 0,
        elements: [],
        elementsHeight: [],
        paletes_sobrepostas: 0,
    });
    useEffect(() => {
        updateState(build(data, reverse));
    }, [timestamp]);
    return (
        <>{state &&
            <svg preserveAspectRatio="xMidYMid meet" width={width} height={height ? height : (state.totalHeight * heightPercentage) + 50} viewBox={viewBox ? viewBox : `0 0 500 ${(state.totalHeight * heightPercentage) + 50}`} id="svg" xmlns="http://www.w3.org/2000/svg">
                {state.paletes_sobrepostas === 1 && <g transform={`translate(${420},${15})`}>
                    <title>Filme Estirável Exterior</title>
                    <line id="svg_10" y2={(state.totalHeight)} x2="0" y1="-10" x1="0" stroke="#000000" fill="none" strokeWidth={3} />
                    <line id="svg_11" y2="-10.5007" x2="1" y1="-10.5007" x1="-12" stroke="#000000" fill="none" strokeWidth={3} />
                    <line id="svg_12" y2={(state.totalHeight)} x2="1" y1={(state.totalHeight)} x1="-12" stroke="#000000" fill="none" strokeWidth={3} />
                    <text x="10" y={(state.totalHeight) / 2} transform={`rotate(90, 10, ${(state.totalHeight) / 2})`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">Filme Estirável Exterior</text>
                </g>
                }
                <g>
                    {state.elements.map((v, i) => {
                        let _acc = (i == 0) ? 0 : acc.current;
                        if (i == 0) {
                            acc.current = 0;
                            offs.current = 0;
                        }
                        acc.current += state.elementsHeight[i]?.y;
                        offs.current = state.elementsHeight[i].y - state.elementsHeight[i].height; //+ (i==0 ? 0 : 10);
                        let _lineHeight = _acc + state.elementsHeight[i].y;
                        //let _lineHeight = _acc+state.elementsHeight[i].height;
                        //if (offs.current!==0){
                        //  offs.current+=15;
                        //  _lineHeight+=15;
                        //}else{
                        //  //offs.current+=5;
                        //}

                        console.log("???-", offs.current, _acc, _lineHeight)
                        return (
                            <Group key={`gsvg-${i}`}>
                                <g transform={`translate(0, 0)`}>
                                    {v.map((x, k) => x.obj({ key: `svg-${k}`, ...x, elements: state.elements, idx: k, group: i }))}
                                    <g transform={`translate(380,10)`}>
                                        <title>Filme Estirável</title>
                                        <line id="svg_10" y2={_lineHeight} x2="0" y1={_acc + 20} x1="0" stroke="#000000" fill="none" strokeWidth={3} />
                                        <line id="svg_11" y2={_acc + 20} x2="1" y1={_acc + 20} x1="-12" stroke="#000000" fill="none" strokeWidth={3} />
                                        <line id="svg_12" y2={_lineHeight} x2="1" y1={_lineHeight} x1="-12" stroke="#000000" fill="none" strokeWidth={3} />
                                        <text x="5" y={(_lineHeight + _acc + 20) / 2} transform={`rotate(90, 10, ${(_lineHeight + _acc + 20) / 2})`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">Filme Estirável</text>
                                    </g>
                                </g>
                            </Group>);
                    }
                    )}
                </g>
                {/*               <TableData/> */}
            </svg>
        }</>
    );
};
