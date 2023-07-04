import React, { useEffect, useState, useRef } from 'react';
import { PALETE_SIZES } from 'config';
import { isValue } from 'utils';
import styled from 'styled-components';

export const SvgPalete = ({ key, pos, text }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <g key={key} transform={`translate(${x},${y})`}>
            <title>Palete</title>
            <rect stroke="#000" rx="2" height={20} width="150" y={0} x={0} fill="#000000" />
            <rect stroke="#000" height={20 / 2} width="60" y={((20 / 2) / 2)} x={10} fill="#ffffff" />
            <rect stroke="#000" height={20 / 2} width="60" y={((20 / 2) / 2)} x={80} fill="#ffffff" />
            {text && <text transform={`matrix(1 0 0 1 -50 15)`} /* fontWeight="bold" */ textAnchor="middle">{text}</text>}
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

export const SvgPlacaPlastico = ({ key, pos }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <g key={key} transform={`translate(${x},${y})`}>
            <title>Placa de Plástico</title>
            <ellipse stroke="#000000" ry="9.00012" rx="74.50103" cy="9.50082" cx="75.00207" fill="#ffffff" />
            <text transform="matrix(1 0 0 1 75 13)" textAnchor="middle">Placa de Plástico</text>
        </g>
    );
}

export const SvgBobines = ({ key, pos, filmeEstiravel = 0, bobinesTxt, onClick, npalete, nbobines }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <React.Fragment key={key}>
            <g transform={`translate(${x},${y})`} style={{ ...onClick && { cursor: "pointer" } }} onClick={() => onClick && onClick(npalete, nbobines)}>
                <title>Bobines</title>
                <path fill="#ffffff" stroke="#000" strokeWidth="2" d="m148.95834,66.83333c0,3.63588 -33.14959,6.58334 -74.04168,6.58334m74.04168,-6.58334l0,0c0,3.63588 -33.14959,6.58334 -74.04168,6.58334c-40.89208,0 -74.04166,-2.94746 -74.04166,-6.58334m0,0l0,0c0,-3.63587 33.14958,-6.58333 74.04166,-6.58333c40.89209,0 74.04168,2.94746 74.04168,6.58333l0,26.33335c0,3.63587 -33.14959,6.58332 -74.04168,6.58332c-40.89208,0 -74.04166,-2.94745 -74.04166,-6.58332l0,-26.33335z" />
                <path fill="#ffffff" stroke="#000" strokeWidth="2" d="m148.95834,36.95833c0,3.63588 -33.14959,6.58334 -74.04168,6.58334m74.04168,-6.58334l0,0c0,3.63588 -33.14959,6.58334 -74.04168,6.58334c-40.89208,0 -74.04166,-2.94746 -74.04166,-6.58334m0,0l0,0c0,-3.63587 33.14958,-6.58333 74.04166,-6.58333c40.89209,0 74.04168,2.94746 74.04168,6.58333l0,26.33335c0,3.63587 -33.14959,6.58332 -74.04168,6.58332c-40.89208,0 -74.04166,-2.94745 -74.04166,-6.58332l0,-26.33335z" />
                <path fill="#ffffff" stroke="#000" strokeWidth="2" d="m148.95834,7.58333c0,3.63588 -33.14959,6.58334 -74.04167,6.58334m74.04167,-6.58334l0,0c0,3.63588 -33.14959,6.58334 -74.04167,6.58334c-40.89208,0 -74.04166,-2.94746 -74.04166,-6.58334m0,0l0,0c0,-3.63587 33.14958,-6.58333 74.04166,-6.58333c40.89208,0 74.04167,2.94746 74.04167,6.58333l0,26.33335c0,3.63587 -33.14959,6.58332 -74.04167,6.58332c-40.89208,0 -74.04166,-2.94745 -74.04166,-6.58332l0,-26.33335z" />
                {bobinesTxt && <text transform="matrix(1 0 0 1 75 60)" textAnchor="middle" fontWeight={800} fontSize="18px">{bobinesTxt}</text>}
            </g>
            {filmeEstiravel === 1 &&
                <g transform={`translate(${x + 160},${y})`}>
                    <title>Filme Estirável</title>
                    <line y2="100" x2="10" y1="0" x1="10" stroke="#000000" fill="none" />
                    <line y2="0.5007" x2="10.37618" y1="0.5007" x1="0.00104" stroke="#000000" fill="none" />
                    <line y2="99.50207" x2="9.75" y1="99.50207" x1="0.00104" stroke="#000000" fill="none" />
                    <text transform="matrix(1 0 0 1 55 50)" textAnchor="middle">Filme Estirável</text>
                </g>
            }
        </React.Fragment>
    );
}

export const SvgPlacaMDF = ({ key, pos, text = "Placa MDF" }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <g key={key} transform={`translate(${x},${y})`}>
            <title>Placa MDF</title>
            <rect stroke="null" height="5" width="150" y="0" x="0" fill="#000000" />
            {text && <text transform={`matrix(1 0 0 1 -50 5)`} /* fontWeight="bold" */ textAnchor="middle">{text}</text>}
        </g>
    );
}

export const SvgPlacaCartao = ({ key, pos, text = "Placa de Cartão" }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <g key={key} transform={`translate(${x},${y})`}>
            <title>Placa de Cartão</title>
            <rect stroke="null" height="2" width="150" y="9" x="0" fill="#000000" />
            {text && <text transform={`matrix(1 0 0 1 -50 13)`} /* fontWeight="bold" */ textAnchor="middle">{text}</text>}
        </g>
    );
}

export const SvgCantoneira = ({ key, pos, text = "Cantoneira Cartão Branco", idx, elements }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <g key={key} transform={`translate(${x},${y})`}>
            <title>{text}</title>
            {idx > 0 && elements[idx - 1]?.item_id == 2 ?
                <>
                    <line id="svg_10" y2={10} x2="-5" y1="0" x1="-5" strokeWidth="2" stroke="#000" fill="none" />
                    <line id="svg_10" y2={10} x2="155" y1="0" x1="155" strokeWidth="2" stroke="#000" fill="none" />
                    {text && <text transform={`matrix(1 0 0 1 -80 7)`} /* fontWeight="bold" */ textAnchor="middle">{text}</text>}
                </>
                :
                <>
                    <line id="svg_10" y2={-10} x2="-5" y1="2" x1="-5" strokeWidth="2" stroke="#000" fill="none" />
                    <line id="svg_10" y2={-10} x2="155" y1="2" x1="155" strokeWidth="2" stroke="#000" fill="none" />
                    {text && <text transform={`matrix(1 0 0 1 -80 0)`} /* fontWeight="bold" */ textAnchor="middle">{text}</text>}
                </>

            }
            <rect stroke="null" height="2" width="160" y="0" x="-5" fill="#000000" />
        </g>
    );
}

export const SvgCutHere = ({ key, pos, text = "Etiqueta Cut Here" }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <g key={key} transform={`translate(${x - 30},${y - 12})`}>
            <title>Etiqueta Cut Here</title>
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
            <rect x="15.864" y="12.367" width="2.41" height="0.992" />
            <rect x="19.478" y="12.367" width="2.408" height="0.992" />
            <rect x="23.302" y="12.357" width="2.406" height="0.991" />
            <line id="svg_10" y2="13" x2="175" y1="13" x1="35" strokeWidth="1" stroke="#000" fill="none" strokeDasharray="4"></line>
            {text && <text transform={`matrix(1 0 0 1 -60 16)`} /* fontWeight="bold" */ textAnchor="middle">{text}</text>}
        </g>
    );
}

const Group = styled.g`
    cursor:pointer;  
    &:hover {
        fill: #1677ff;
    }
`;

export default ({ vGap = 2, form, items, changedValues, x = 200, width = "100%", height, heightPercentage = 1, viewBox, reverse = false, onClick }) => {
    const [elements, setElements] = useState([]);
    const [totalHeight, setTotalHeight] = useState(0);

    const compute = (els, currentPosY = 0) => {
        for (const v of els) {
            let posY = currentPosY + 10;
            currentPosY += v.height + vGap;
            v.pos = { x: v.x, y: posY };
        }
        return currentPosY;
    }

    useEffect(() => {
        let data = {};
        if (items) {
            // let itms;
            // if ("paletizacao" in items) {
            //     if ("details" in items?.paletizacao) {
            //         itms = items?.paletizacao?.details.sort((a, b) => b.item_order - a.item_order);
            //         data = {
            //             paletizacao: itms, cintas: items?.paletizacao.cintas, ncintas: items?.paletizacao.ncintas, filmeestiravel_bobines: items?.paletizacao.filmeestiravel_bobines,
            //             filmeestiravel_exterior: items?.paletizacao.filmeestiravel_exterior
            //         }
            //     } else {
            //         itms = items?.paletizacao?.sort((a, b) => b.item_order - a.item_order);
            //         data = { paletizacao: itms, cintas: items.cintas, ncintas: items.ncintas, filmeestiravel_bobines: items.filmeestiravel_bobines, filmeestiravel_exterior: items.filmeestiravel_exterior }
            //     }

            // } else {
            //     itms = items?.details?.sort((a, b) => b.item_order - a.item_order);
            //     data = { paletizacao: itms, cintas: items.cintas, ncintas: items.ncintas, filmeestiravel_bobines: items.filmeestiravel_bobines, filmeestiravel_exterior: items.filmeestiravel_exterior }
            // }

        } else {
            console.log(form.getFieldsValue(true));
            data = { ...form.getFieldsValue(true) };
            //data = { paletizacao: !form.getFieldValue(["paletizacao"]), cintas: form.getFieldValue(["cintas"]), ncintas: form.getFieldValue(["ncintas"]), filmeestiravel_bobines: form.getFieldValue(["filmeestiravel_bobines"]), filmeestiravel_exterior: form.getFieldValue(["filmeestiravel_exterior"]) }
        }
        if (!data.details) {
            setElements([]);
        } else {
            let els = [];
            let npaletes = 0;
            const cintas = isValue(data.cintas, undefined, 0);
            const ncintas = isValue(data.ncintas, undefined, 0);
            //const currentGroup=0;
            const groupsLvl = [[]];
            for (let v of data.details) {
                switch (v.item_id) {
                    case 1:
                        npaletes++;
                        if (npaletes > groupsLvl.length) {
                            groupsLvl.push([]);
                        }
                        groupsLvl[groupsLvl.length - 1].push({ obj: SvgPalete, x, height: 25, text: `Palete ${PALETE_SIZES.find(p => p.key == v.item_paletesize).value}`, item_order: v.item_order, item_id: v.item_id });
                        break;
                    case 2:
                        groupsLvl[groupsLvl.length - 1].push({ obj: SvgBobines, x, height: 100, filmeEstiravel: isValue(data.filmeestiravel_bobines, undefined, 0), item_numbobines:v.item_numbobines, bobinesTxt: `${v.item_numbobines} Bobine(s)`, item_order: v.item_order, item_id: v.item_id });
                        break;
                    case 3:
                        groupsLvl[groupsLvl.length - 1].push({ obj: SvgPlacaCartao, x, height: 15, item_order: v.item_order, item_id: v.item_id });
                        break;
                    case 4:
                        groupsLvl[groupsLvl.length - 1].push({ obj: SvgPlacaMDF, x, height: 5, item_order: v.item_order, item_id: v.item_id });
                        break;
                    case 5:
                        groupsLvl[groupsLvl.length - 1].push({ obj: SvgPlacaPlastico, x, height: 10, item_order: v.item_order, item_id: v.item_id });
                        break;
                    case 6:
                        groupsLvl[groupsLvl.length - 1].push({ obj: SvgCantoneira, x, height: 10, item_order: v.item_order, item_id: v.item_id });
                        break;
                    case 7:
                        groupsLvl[groupsLvl.length - 1].push({ obj: SvgCutHere, x, height: 10, item_order: v.item_order, item_id: v.item_id });
                        break;
                }
            }
            if (form) {
                if (npaletes > 1) {
                    form.setFieldsValue({ paletes_sobrepostas: 1 });
                } else {
                    form.setFieldsValue({ paletes_sobrepostas: 0 });
                }
            }
            let _posY = 0;
            if (reverse) { groupsLvl.reverse(); }
            for (const g of groupsLvl) {
                _posY = compute(reverse ? g.reverse() : g, _posY);
                if (reverse) {
                    g.reverse();
                }
            }
            setTotalHeight(_posY);
            setElements(groupsLvl);
        }
    }, [changedValues, JSON.stringify(items)]);
    return (
        <svg preserveAspectRatio="xMidYMid meet" width={width} height={height ? height : (totalHeight * heightPercentage) + 50} viewBox={viewBox ? viewBox : `0 0 480 ${(totalHeight * heightPercentage) + 50}`} id="svg" xmlns="http://www.w3.org/2000/svg">
            {isValue((items) ? items.filmeestiravel_exterior : form.getFieldValue("filmeestiravel_exterior"), undefined, 0) === 1 && <g transform={`translate(${x - 100},${0})`}>
                <title>Filme Estirável</title>
                <line id="svg_10" y2={(totalHeight)} x2="300" y1="-10" x1="300" stroke="#000000" fill="none" />
                <line id="svg_11" y2="-10.5007" x2="300" y1="-10.5007" x1="290" stroke="#000000" fill="none" />
                <line id="svg_12" y2={(totalHeight)} x2="300" y1={(totalHeight)} x1="290" stroke="#000000" fill="none" />
                <text x="311" y={(totalHeight) / 2} transform={`rotate(90, 311, ${(totalHeight) / 2})`} strokeWidth="2" textAnchor="middle">Filme Estirável</text>
            </g>
            }
            {elements.map((v, i) => <Group key={`gsvg-${i}`} {...onClick && { onClick: () => onClick(v,elements.length - i) }}>

                {v.map((x, k) => x.obj({ key: `svg-${k}`, ...x, elements, idx: k }))}


            </Group>
            )}
        </svg>
    );
}


