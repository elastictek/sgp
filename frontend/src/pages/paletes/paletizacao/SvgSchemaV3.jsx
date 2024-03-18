import React, { useEffect, useState, useRef } from 'react';
import { PALETE_SIZES, DESENROLAMENTO_OPTIONS } from 'config';
import { isValue, getInt } from 'utils';
import styled from 'styled-components';
import { produce } from 'immer';
import { useImmer } from "use-immer";


const mainProps = {
    offset: 10,
    vGap: 0,
    x: 50,
    width: 150,
    xText: -80,
    svgWidth: "100%",
    height: null,
    heightPercentage: 1,
    viewBox: null
};

const Group = styled.g`
    cursor:pointer; 
    &:hover {
        #bobine{
        fill: #91d5ff !important;
        }
    }   
`;

const Scissors = ({ scale = 1, fill = "#000" }) => {
    return (<path fill={fill} d="M23.354,7.23c0,0-1.439-1.239-2.652-0.548c-0.934,0.537-6.867,3.514-9.514,4.84L7.44,9.379
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
c0.158-0.582,0.621-1.14,1.236-1.492c1.047-0.598,2.291-0.477,2.717,0.266C6.04,17.569,5.999,17.947,5.927,18.203z"
        transform={`scale(${scale})`} />);
};

const ArrowBackwards = ({ scale = 1 }) => {
    return (
        <path
            d="m 63.679368,137.13612 c 0,-8.51041 6.92397,-15.43438 15.434731,-15.43438 h 49.912061 l -10.97104,10.97068 6.62658,6.62693 22.28215,-22.28286 -22.28215,-22.28284 -6.62658,6.62693 10.97104,10.97067 H 79.114099 c -13.677541,0 -24.805212,11.12767 -24.805212,24.80557 0,13.67754 11.127671,24.80486 24.805212,24.80486 h 61.223881 v -9.37049 H 79.114099 c -8.510761,0 -15.434731,-6.92432 -15.434731,-15.43507"
            style={{ fill: "#000000", fillOpacity: 1, fillRule: "nonzero", stroke: "none", strokeWidth: 0.352778 }}
            transform={`scale(${scale})`} />
    );
}

const Arrow = ({ scale = 1, sentido = DESENROLAMENTO_OPTIONS[0].value }) => {
    return (
        <>
            {sentido == 3 && <path d="M 13 6 L 13 10 L 2 10 L 2 14 L 13 14 L 13 18 L 22 12 L 13 6 z" transform={`scale(${scale})`} />}
            {sentido == 4 && <path d="M 13 6 L 13 10 L 2 10 L 2 14 L 13 14 L 13 18 L 22 12 L 13 6 z" transform={`scale(${-scale},${scale}) translate(-24, 0)`} />}
        </>
    );
}

const BarCode = ({ scale = 1 }) => {
    return (
        <g transform={`scale(${scale})`}>
            <rect x="10" y="20" width="10" height="60" fill="black" />
            <rect x="30" y="20" width="10" height="60" fill="black" />
            <rect x="50" y="20" width="10" height="60" fill="black" />
            <rect x="70" y="20" width="10" height="60" fill="black" />
            <rect x="90" y="20" width="10" height="60" fill="black" />
            <rect x="110" y="20" width="10" height="60" fill="black" />
            <rect x="130" y="20" width="10" height="60" fill="black" />
            <rect x="150" y="20" width="10" height="60" fill="black" />
        </g>
    );
}

export const SvgPalete = ({ pos, text, tx, textEnabled, view = "lateral", ...props }) => {
    const _topGap = 5;
    const _height = props.height - _topGap;
    const _increase = 30;
    return (
        <>
            {view === "lateral" ? <g transform={`translate(${tx ? tx : pos.x},${pos.y})`}>
                <title>{text}</title>
                <rect stroke="#000" height={_height} width={mainProps.width + _increase} y={_topGap} x={-(_increase / 2)} fill="#000000" />
                <rect stroke="#000" height={_height / 2} width={(mainProps.width / 2) - 5} y={(_height / 2 / 2) + _topGap} x={0} fill="#ffffff" />
                <rect stroke="#000" height={_height / 2} width={(mainProps.width / 2) - 5} y={(_height / 2 / 2) + _topGap} x={(mainProps.width / 2) + 5} fill="#ffffff" />
                {text && textEnabled && (<text transform={`matrix(1 0 0 1 ${mainProps.xText} ${_height})`} fontFamily="'Open Sans', sans-serif" fontSize="12" /* fontWeight="bold" */ textAnchor="middle">{text}</text>)}
            </g>
                :
                <g transform={`translate(${tx ? tx : pos.x},${pos.y})`}>
                    <title>{text}</title>
                    <rect strokeWidth={0} height={_height} width={mainProps.width + _increase} y={_topGap} x={-(_increase / 2)} fill="#000000" />
                    <rect strokeWidth={0} height={_height / 2 + 5} width={(mainProps.width / 2) - 5} y={(_height / 2 / 2) + _topGap} x={0} fill="#ffffff" />
                    <rect strokeWidth={0} height={_height / 2 + 5} width={(mainProps.width / 2) - 5} y={(_height / 2 / 2) + _topGap} x={(mainProps.width / 2) + 5} fill="#ffffff" />
                    {text && textEnabled && (<text transform={`matrix(1 0 0 1 ${mainProps.xText} ${_height})`} fontFamily="'Open Sans', sans-serif" fontSize="12" /* fontWeight="bold" */ textAnchor="middle">{text}</text>)}
                </g>
            }
        </>
    );
}
// export const SvgBobine = ({ key, pos = {} }) => {
//     const { x = 0, y = 20 } = pos;
//     return (
//         <g key={key} transform={`translate(${x},${y})`}>
//             <title>Bobine</title>
//             <path stroke="#000" strokeWidth={2} d="m149.93665,6.86042c0,3.63587 -33.54134,6.58333 -74.91668,6.58333m74.91668,-6.58333l0,0c0,3.63587 -33.54134,6.58333 -74.91668,6.58333c-41.37532,0 -74.91665,-2.94745 -74.91665,-6.58333m0,0l0,0c0,-3.63587 33.54133,-6.58333 74.91665,-6.58333c41.37534,0 74.91668,2.94746 74.91668,6.58333l0,26.33334c0,3.63587 -33.54134,6.58332 -74.91668,6.58332c-41.37532,0 -74.91665,-2.94745 -74.91665,-6.58332l0,-26.33334z" fill="#ffffff" />
//         </g>
//     );

// }

export const SvgBobines = ({ pos, filmeEstiravel = 0, sentido_desenrolamento = DESENROLAMENTO_OPTIONS[0].value, bobinesTxt, onClick, npalete, nbobines, tx, textEnabled, view = "lateral", elements, idx, ...props }) => {
    const _gap = 3;
    const _strokeWidth = 1;
    const _x = 0;
    const _y = 0;
    const _height = ((props.height - (_gap * 3)) / 3); //3 elements and gap
    return (
        <React.Fragment>
            <g transform={`translate(${tx ? tx : pos.x},${pos.y})`} style={{ ...onClick && { cursor: "pointer" } }} onClick={() => onClick && onClick(npalete, nbobines)}>
                <g>
                    <rect
                        style={{ display: "inline", fill: "#ffffff", fillOpacity: 1, stroke: "#000000", strokeWidth: _strokeWidth, strokeDasharray: "none", strokeOpacity: 1 }}
                        id="bobine"
                        width={mainProps.width}
                        height={_height}
                        x={_x}
                        y={_y + _gap * 1} />
                    <rect
                        style={{ display: "inline", fill: "#ffffff", fillOpacity: 1, stroke: "#000000", strokeWidth: _strokeWidth, strokeDasharray: "none", strokeOpacity: 1 }}
                        id="bobine"
                        width={mainProps.width}
                        height={_height}
                        x={_x}
                        y={_y + (_height) + (_gap * 2)} />
                    {bobinesTxt && textEnabled && <text textAnchor="middle" dominantBaseline="middle" fontWeight={800} fontFamily="'Open Sans', sans-serif" fontSize="18px" x={_x + mainProps.width / 2} y={(_y + 1 + (_height) + (_gap * 2)) + _height / 2}>{bobinesTxt}</text>}
                    <rect
                        style={{ display: "inline", fill: "#ffffff", fillOpacity: 1, stroke: "#000000", strokeWidth: _strokeWidth, strokeDasharray: "none", strokeOpacity: 1 }}
                        id="bobine"
                        width={mainProps.width}
                        height={_height}
                        x={_x}
                        y={_y + (_height * 2) + (_gap * 3)} />



                    {view == "front" && <>
                        <rect style={{ display: "inline", fill: "#ffffff", fillOpacity: 1, stroke: "#000000", strokeWidth: 2, strokeDasharray: "none", strokeOpacity: 1 }}
                            width={20}
                            height={10}
                            x={mainProps.width / 2 - 10}
                            y={_y + 5 + _gap * 1} />
                        <g transform={`translate(${mainProps.width / 2 - 10 + 1},${_y + 5 + _gap * 1})`}>
                            <BarCode scale="0.1" />
                        </g>
                        <rect style={{ display: "inline", fill: "#ffffff", fillOpacity: 1, stroke: "#000000", strokeWidth: 2, strokeDasharray: "none", strokeOpacity: 1 }}
                            width={20}
                            height={10}
                            x={mainProps.width / 2 - 10}
                            y={_y + 5 + (_height) + (_gap * 2)} />
                        <g transform={`translate(${mainProps.width / 2 - 10 + 1},${_y + 5 + (_height) + (_gap * 2)})`}>
                            <BarCode scale="0.1" />
                        </g>
                        <g transform={`translate(${10},${(_height - 7)})`}>
                            <Arrow scale="2" sentido={sentido_desenrolamento} />
                        </g>
                        <g transform={`translate(${mainProps.width - 55},${(_height - 7)})`}>
                            <Arrow scale="2" sentido={sentido_desenrolamento} />
                        </g>
                        <rect style={{ display: "inline", fill: "#ffffff", fillOpacity: 1, stroke: "#000000", strokeWidth: 2, strokeDasharray: "none", strokeOpacity: 1 }}
                            width={20}
                            height={10}
                            x={mainProps.width / 2 - 10}
                            y={_y + 5 + (_height * 2) + (_gap * 3)} />
                        <g transform={`translate(${mainProps.width / 2 - 10 + 1},${_y + 5 + (_height * 2) + (_gap * 3)})`}>
                            <BarCode scale="0.1" />
                        </g>
                    </>
                    }



                </g>
            </g>
        </React.Fragment >
    );
}
export const SvgPlacaCartao = ({ pos, text = "Placa de Cartão", tx, textEnabled, ...props }) => {
    const _rectHeight = 4;
    const _height = props.height;
    const _strokeWidth = 1;
    const _y = (_height / 2) - (_rectHeight / 2);
    return (
        <g transform={`translate(${tx ? tx : pos.x},${pos.y})`}>
            <title>{text}</title>
            <rect strokeWidth={_strokeWidth} stroke="#000000" height={_rectHeight} width={mainProps.width} y={_y} x="0" fill="#595959" />
            {text && textEnabled && <text transform={`matrix(1 0 0 1 ${mainProps.xText} ${_height - _rectHeight})`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">{text}</text>}
        </g>
    );
}
export const SvgPlacaPlastico = ({ pos, text = "Placa de Plástico", tx, textEnabled, ...props }) => {
    const _rectHeight = 4;
    const _height = props.height;
    const _strokeWidth = 1;
    const _y = (_height / 2) - (_rectHeight / 2);
    return (
        <g transform={`translate(${tx ? tx : pos.x},${pos.y})`}>
            <title>{text}</title>
            <rect strokeWidth={_strokeWidth} stroke="#000000" height={_rectHeight} width={mainProps.width} y={_y} x="0" fill="#8c8c8c" />
            {text && textEnabled && <text transform={`matrix(1 0 0 1 ${mainProps.xText} ${_height - _rectHeight})`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">{text}</text>}
        </g>
    );
}
export const SvgPlacaMDF = ({ pos, text = "Placa MDF", tx, textEnabled, ...props }) => {
    const _topGap = 3;
    const _height = props.height - _topGap;
    const _strokeWidth = 1;
    const _x = 0;
    const _y = 0;
    return (
        <g transform={`translate(${tx ? tx : pos.x},${pos.y})`}>
            <g>
                <rect
                    style={{ display: "inline", fill: "#d9d9d9", fillOpacity: 1, stroke: "#000000", strokeWidth: _strokeWidth, strokeDasharray: "none", strokeOpacity: 1 }}
                    id="rect2"
                    width={mainProps.width}
                    height={_height}
                    x={_x}
                    y={_y + _topGap}
                />
                <text textAnchor="middle" dominantBaseline="middle" x={_x + mainProps.width / 2} y={(_y + _topGap * 2 + _height + 2) / 2} fontFamily="'Open Sans', sans-serif" fontSize="11">{text}</text>
            </g>
        </g>
    );
}
export const SvgCantoneira = ({ pos, text = "Cantoneira Cartão Branco", tx, idx, group, elements, textEnabled, ...props }) => {
    const _dir = (idx + 1 < elements.length && elements[idx + 1].item_id == 2) ? 0 : 1; //0 down 1 up
    const _rectHeight = 6;
    const _height = props.height;
    const _gap = _height - _rectHeight;
    const _increase = 10;
    const _width = mainProps.width + _increase;
    const _x = _increase / 2;
    const _y = 0;
    const _height2 = 10;
    return (
        <g transform={`translate(${tx ? tx : pos.x},${pos.y})`}>
            <title>{text}</title>
            <rect stroke="null" height={_rectHeight} width={_width} y={_y + _gap} x={-_x} fill="#000000" />
            {_dir == 0 ?
                <>
                    <line id="svg_10" y2={_gap} x2={-_x} y1={_y + _gap + _rectHeight + _height2} x1={-_x} strokeWidth={_rectHeight} stroke="#000" fill="none" />
                    <line id="svg_10" y2={_gap} x2={mainProps.width + (_increase / 2)} y1={_y + _gap + _rectHeight + _height2} x1={mainProps.width + (_increase / 2)} strokeWidth={_rectHeight} stroke="#000" fill="none" />
                    {text && textEnabled && <text transform={`matrix(1 0 0 1 ${mainProps.xText} ${_height + 3 - (_y / 2)})`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">{text}</text>}
                </>
                :
                <>
                    <line id="svg_10" y2={-_rectHeight} x2={-_x} y1={_height2} x1={-_x} strokeWidth={_rectHeight} stroke="#000" fill="none" />
                    <line id="svg_10" y2={-_rectHeight} x2={mainProps.width + (_increase / 2)} y1={_y + _gap + _rectHeight} x1={mainProps.width + (_increase / 2)} strokeWidth={_rectHeight} stroke="#000" fill="none" />
                    {text && textEnabled && <text transform={`matrix(1 0 0 1 ${mainProps.xText} ${_height - 1 - (_y / 2)})`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">{text}</text>}
                </>
            }

        </g>
    );
}
export const SvgCutHere = ({ pos, text = "Etiqueta Cut Here", tx, textEnabled, view = "lateral", ...props }) => {
    const _topGap = 3;
    const _strokeWidth = 2;
    const _height = props.height - _topGap;
    const _x1 = 35;
    const _x2 = 25;
    return (
        <g transform={`translate(${(tx ? tx : pos.x) - 30},${pos.y - 2})`}>
            <title>{text}</title>
            <Scissors scale={1} />
            <rect
                style={{ display: "inline", fill: "#fffb8f", fillOpacity: 1, strokeWidth: 0, strokeDasharray: "none", strokeOpacity: 1 }}
                id="rect2"
                width={mainProps.width + (_x2 - _x1)}
                height={_height - 3}
                x={_x1}
                y={_topGap * 2}
            />
            <line id="svg_10" y2={(_height / 2) + 2 + _topGap} x2={mainProps.width + _x2} y1={(_height / 2) + 2 + _topGap} x1={_x1} strokeWidth={_strokeWidth} stroke="#000" fill="none" strokeDasharray="4"></line>
            {/*{text && <text transform={`matrix(1 0 0 1 ${objProps.width+85} 16)`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">{text}!</text>}*/}
            {/* {text && textEnabled && <text transform={`matrix(1 0 0 1 ${mainProps.xText} 16)`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">{text}!</text>} */}


            {view == "front" && <>
                <rect style={{ display: "inline", fill: "#fff", fillOpacity: 1, strokeWidth: "1", stroke: "#bfbfbf", strokeOpacity: 1 }}
                    width={20}
                    height={12}
                    x={_x1 - 10}
                    y={(_height / 2)} />
                <g transform={`translate(${_x1 - 10 + 15},${(_height / 2) + 1})`}>
                    <Scissors fill="#595959" scale="-0.4, 0.4" />
                </g>
                <rect style={{ display: "inline", fill: "#fff", fillOpacity: 1, strokeWidth: "2", stroke: "#000", strokeOpacity: 1 }}
                    width={20}
                    height={12}
                    x={mainProps.width + 15}
                    y={(_height / 2)} />
                <g transform={`translate(${mainProps.width + 20},${(_height / 2) + 1})`}>
                    <Scissors fill="#000" scale="0.4" />
                </g>
            </>}
        </g>
    );
}

export const SvgCintas = ({ paletesHeight, accumulator, visible = 0, ...props }) => {
    const _strokeWidth = 1;
    const _strokeDash = 0;
    return (
        <>{visible == 1 && <g transform={`translate(0, 30)`}>
            <g transform={`translate(${mainProps.x},${5})`}>
                <rect
                    style={{ display: "inline", fill: "#d9d9d9", fillOpacity: 1, stroke: "#000000", strokeWidth: _strokeWidth, strokeDasharray: _strokeDash, strokeOpacity: 1 }}
                    id="rect2"
                    width={5}
                    height={paletesHeight - 15}
                    x={10}
                    y={accumulator}
                />
                <rect
                    style={{ display: "inline", fill: "#d9d9d9", fillOpacity: 1, stroke: "#000000", strokeWidth: _strokeWidth, strokeDasharray: _strokeDash, strokeOpacity: 1 }}
                    id="rect2"
                    width={5}
                    height={paletesHeight - 15}
                    x={10 + (mainProps.width - 23)}
                    y={accumulator}
                />
            </g>
        </g>
        }</>
    );
}

export const SvgCintasGroup = ({ paletesHeight, accumulator, visible = false, ...props }) => {
    const _strokeWidth = 4;
    const _strokeDash = 0;
    return (
        <>{visible == 1 && <g transform={`translate(0, 30)`}>
            <g transform={`translate(${mainProps.x},${5})`}>
                <rect
                    style={{ display: "inline", fill: "#f0f0f0", fillOpacity: 1, stroke: "#434343", strokeWidth: _strokeWidth, strokeDasharray: _strokeDash, strokeOpacity: 1 }}
                    id="rect2"
                    width={6}
                    height={paletesHeight - 1}
                    x={30}
                    y={accumulator - 15 + 1}
                />
                <rect
                    style={{ display: "inline", fill: "#f0f0f0", fillOpacity: 1, stroke: "#434343", strokeWidth: _strokeWidth, strokeDasharray: _strokeDash, strokeOpacity: 1 }}
                    id="rect2"
                    width={6}
                    height={paletesHeight - 1}
                    x={(mainProps.width - 40)}
                    y={accumulator - 15 + 1}
                />
            </g>
        </g>
        }</>
    );
}

// const compute = (els, currentPosY = 0) => {
//     let _grpHeight = 0;
//     let _grpY = 0;
//     for (const v of els) {
//         let posY = currentPosY + offset;
//         //if (v.item_id !== 7) {
//         _grpHeight += v.height + mainProps.vGap;
//         //}
//         _grpY += v.height + mainProps.vGap;
//         currentPosY += v.height + mainProps.vGap;
//         v.pos = { x: v.x, y: posY };
//     }
//     return { total: currentPosY, totalGroupHeight: _grpHeight, totalGroupY: _grpY };
// }
const build = (data) => {
    if (data?.details) {
        const _details = [...data.details];
        _details.sort((a, b) => a.item_order - b.item_order);//ascend
        let npaletes = 0;
        let _nElements = 0;
        const paletesLvl = [{ els: [], height: 0, y: 0, hasBobines: false, schemaBobines: [], allSchemaBobines:[], nBobines: 0, valid: true }];

        let _height = 0;
        for (let v of _details) {
            switch (v.item_id) {
                case 1:
                    _height = 25;
                    npaletes++;
                    if (npaletes > paletesLvl.length) {
                        paletesLvl.push({ els: [], height: 0, y: 0, hasBobines: false });
                    }
                    paletesLvl[paletesLvl.length - 1].height += _height;
                    paletesLvl[paletesLvl.length - 1].cintas = v?.cintas ? 1 : 0;
                    paletesLvl[paletesLvl.length - 1].els.push({
                        obj: SvgPalete, height: _height, text: `Palete ${PALETE_SIZES.find((p) => p.key == v.item_paletesize).value
                            }`,
                        item_paletesize: v.item_paletesize,
                        item_order: v.item_order,
                        item_id: v.item_id,
                        cintas: v?.cintas
                    });
                    _nElements++;
                    break;
                case 2:
                    _height = 73;
                    paletesLvl[paletesLvl.length - 1].hasBobines = true;
                    paletesLvl[paletesLvl.length - 1].height += _height;
                    paletesLvl[paletesLvl.length - 1].els.push({ obj: SvgBobines, height: _height, filmeEstiravel: isValue(data.filmeestiravel_bobines, undefined, 0), item_numbobines: v.item_numbobines, bobinesTxt: v.item_numbobines ? `${v.item_numbobines}` : null, item_order: v.item_order, item_id: v.item_id });
                    _nElements++;
                    break;
                case 3:
                    _height = 15;
                    paletesLvl[paletesLvl.length - 1].height += _height;
                    paletesLvl[paletesLvl.length - 1].els.push({ obj: SvgPlacaCartao, height: _height, item_order: v.item_order, item_id: v.item_id, item_size: v.item_size });
                    _nElements++;
                    break;
                case 4:
                    _height = 15;
                    paletesLvl[paletesLvl.length - 1].height += _height;
                    paletesLvl[paletesLvl.length - 1].els.push({ obj: SvgPlacaMDF, height: _height, item_order: v.item_order, item_id: v.item_id, item_size: v.item_size });
                    _nElements++;
                    break;
                case 5:
                    _height = 15;
                    paletesLvl[paletesLvl.length - 1].height += _height;
                    paletesLvl[paletesLvl.length - 1].els.push({ obj: SvgPlacaPlastico, height: _height, item_order: v.item_order, item_id: v.item_id });
                    _nElements++;
                    break;
                case 6:
                    _height = 10;
                    paletesLvl[paletesLvl.length - 1].height += _height;
                    paletesLvl[paletesLvl.length - 1].els.push({ obj: SvgCantoneira, height: _height, item_order: v.item_order, item_id: v.item_id });
                    _nElements++;
                    break;
                case 7:
                    _height = 20;
                    paletesLvl[paletesLvl.length - 1].height += _height;
                    paletesLvl[paletesLvl.length - 1].els.push({ obj: SvgCutHere, height: _height, item_order: v.item_order, item_id: v.item_id });
                    _nElements++;
                    break;
            }
        }

        let _posY = 0;
        let _elPosY = 0;
        paletesLvl.reverse();//reverse Groups
        const _allSchemabobines = [];
        for (const [index, p] of paletesLvl.entries()) {
            const _schemabobines = [];
            let _nbobines = 0;
            let _valid = true;
            p.els.sort((a, b) => b.item_order - a.item_order);//descending
            for (const el of p.els) {
                if (el.item_id == 2) {
                    const _b = getInt(el.item_numbobines, 0);
                    _nbobines += _b;
                    _schemabobines.push(_b);
                    _allSchemabobines.push(_b);
                    if (_valid) {
                        _valid = _b == 0 ? false : true;
                    }
                }
                el.pos = { x: mainProps.x, y: _elPosY };
                _elPosY += el.height;
            }
            _schemabobines.reverse();
            _allSchemabobines.reverse();
            p.lvl = paletesLvl.length - index;
            p.schemaBobines = _schemabobines;
            p.allSchemaBobines = _allSchemabobines;
            p.nBobines = _nbobines;
            p.valid = _valid;
            p.y = _posY;
            _posY += p.height;
        }

        return {
            nElments: _nElements,
            totalHeight: _posY,
            paletes: paletesLvl,
            data: data?.data,
            paletes_sobrepostas: npaletes > 1 ? 1 : 0
        }
    }
};


export default ({ select = { enabled: false }, onSelect, data, timestamp, reverse }) => {
    const [state, updateState] = useState({
        totalHeight: 0,
        paletes: [],
        data: {},
        paletes_sobrepostas: 0
    });
    useEffect(() => {
        updateState(build(data, reverse));
    }, [timestamp]);
    return (
        <div style={{ marginTop: "5px" }}>{state &&
            <svg
                id="svg"
                preserveAspectRatio="xMidYMid meet"
                width={mainProps.svgWidth}
                height={mainProps.height ? mainProps.height : ((state.totalHeight + 30) * mainProps.heightPercentage)}
                viewBox={mainProps.viewBox ? mainProps.viewBox : `0 0 500 ${((state.totalHeight + 30) * mainProps.heightPercentage)}`}
                xmlns="http://www.w3.org/2000/svg">

                {state.nElments > 0 && <>
                    <g>
                        <text x="130" y={15} fontFamily="'Open Sans', sans-serif" fontSize="18" textAnchor="middle" style={{ fontWeight: 900 }}>Lateral</text>
                    </g>
                    <g>
                        <text x="380" y={15} fontFamily="'Open Sans', sans-serif" fontSize="18" textAnchor="middle" style={{ fontWeight: 900 }}>Frontal</text>
                    </g>
                </>}

                {state.paletes_sobrepostas === 1 && state.data.filmeestiravel_exterior && <g transform={`translate(${520},${30})`}>
                    <title>Filme Estirável Exterior</title>
                    <line id="svg_10" y2={(state.totalHeight)} x2="0" y1="0" x1="0" stroke="#000000" fill="none" strokeWidth={3} />
                    <line id="svg_11" y2="1" x2="1" y1="1" x1="-12" stroke="#000000" fill="none" strokeWidth={3} />
                    <line id="svg_12" y2={(state.totalHeight - 1)} x2="1" y1={(state.totalHeight - 1)} x1="-12" stroke="#000000" fill="none" strokeWidth={3} />
                    <text x="10" y={(state.totalHeight) / 2} transform={`rotate(90, 10, ${(state.totalHeight) / 2})`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">Filme Estirável Exterior</text>
                </g>}
                {state.paletes.map((palete, index) => {
                    return (<React.Fragment key={`gsv-${index}`}>
                        <Group onClick={() => (select?.enabled && onSelect) && onSelect(palete)}>
                            <g transform={`translate(0, 30)`}>
                                {palete.els.map((el, idx) => <React.Fragment key={`gsvi-${idx}`}>{el.obj({ ...el, elements: palete.els, idx, group: index, textEnabled: true, view: "lateral" })}</React.Fragment>)}
                            </g>
                            <SvgCintas paletesHeight={palete.height} accumulator={palete.y} visible={palete?.cintas} />
                            <SvgCintasGroup paletesHeight={palete?.height} accumulator={palete?.y} visible={index !== 0 && state.paletes_sobrepostas == 1} />
                        </Group>
                        <Group onClick={() => (select?.enabled && onSelect) && onSelect(palete)}>
                            <g transform={`translate(0, 30)`}>
                                {palete.els.map((el, idx) => <React.Fragment key={`gsvm-${idx}`}>{el.obj({ ...el, sentido_desenrolamento: state.data.sentido_desenrolamento, elements: palete.els, idx, group: index, tx: 150 * 2, textEnabled: false, view: "front" })}</React.Fragment>)}
                            </g>
                            {palete.hasBobines && state.data.filmeestiravel_bobines && <g transform={`translate(${480},${30})`}>
                                <title>Filme Estirável</title>
                                <line id="svg_10" y2={palete.y} x2={0} y1={palete.y + palete.height - 3} x1={0} stroke="#000000" fill="none" strokeWidth={3} />
                                <line id="svg_11" y2={palete.y + 1} x2={1} y1={palete.y + 1} x1={-12} stroke="#000000" fill="none" strokeWidth={3} />
                                <line id="svg_12" y2={palete.y + palete.height - 3 - 1} x2={1} y1={palete.y + palete.height - 3 - 1} x1={-12} stroke="#000000" fill="none" strokeWidth={3} />
                                <text x="5" y={palete.y + (palete.height / 2)} transform={`rotate(90, 10, ${palete.y + (palete.height / 2)})`} fontFamily="'Open Sans', sans-serif" fontSize="12" textAnchor="middle">Filme Estirável</text>
                            </g>}
                        </Group>
                    </React.Fragment>);

                })}
            </svg>
        }
        </div>
    );
};
