import React, { useEffect, useState } from 'react';
import { PALETE_SIZES } from 'config';
import { isValue } from 'utils';

export const SvgPalete = ({ key, pos, text }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <svg key={key}>
            <g transform={`translate(${x},${y})`}>
                <title>Palete</title>
                <rect stroke="#000" rx="2" height={20} width="150" y={0} x={0} fill="#000000" />
                <rect stroke="#000" height={20 / 2} width="60" y={((20 / 2) / 2)} x={10} fill="#ffffff" />
                <rect stroke="#000" height={20 / 2} width="60" y={((20 / 2) / 2)} x={80} fill="#ffffff" />
                {text && <text transform={`matrix(1 0 0 1 -50 15)`} /* fontWeight="bold" */ textAnchor="middle">{text}</text>}
            </g>
        </svg>
    );
}

export const SvgBobine = ({ key, pos = {} }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <svg key={key}>
            <g transform={`translate(${x},${y})`}>
                <title>Bobine</title>
                <path stroke="#000" strokeWidth={2} d="m149.93665,6.86042c0,3.63587 -33.54134,6.58333 -74.91668,6.58333m74.91668,-6.58333l0,0c0,3.63587 -33.54134,6.58333 -74.91668,6.58333c-41.37532,0 -74.91665,-2.94745 -74.91665,-6.58333m0,0l0,0c0,-3.63587 33.54133,-6.58333 74.91665,-6.58333c41.37534,0 74.91668,2.94746 74.91668,6.58333l0,26.33334c0,3.63587 -33.54134,6.58332 -74.91668,6.58332c-41.37532,0 -74.91665,-2.94745 -74.91665,-6.58332l0,-26.33334z" fill="#ffffff" />
            </g>
        </svg>
    );

}

export const SvgPlacaPlastico = ({ key, pos }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <svg key={key}>
            <g transform={`translate(${x},${y})`}>
                <title>Placa de Plástico</title>
                <ellipse stroke="#000000" ry="9.00012" rx="74.50103" cy="9.50082" cx="75.00207" fill="#ffffff" />
                <text transform="matrix(1 0 0 1 75 13)" textAnchor="middle">Placa de Plástico</text>
            </g>
        </svg>
    );
}

export const SvgBobines = ({ key, pos, filmeEstiravel = 0, bobinesTxt }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <svg key={key}>
            <g transform={`translate(${x},${y})`}>
                <title>Bobines</title>
                <path stroke="#000" strokeWidth="2" d="m148.95834,66.83333c0,3.63588 -33.14959,6.58334 -74.04168,6.58334m74.04168,-6.58334l0,0c0,3.63588 -33.14959,6.58334 -74.04168,6.58334c-40.89208,0 -74.04166,-2.94746 -74.04166,-6.58334m0,0l0,0c0,-3.63587 33.14958,-6.58333 74.04166,-6.58333c40.89209,0 74.04168,2.94746 74.04168,6.58333l0,26.33335c0,3.63587 -33.14959,6.58332 -74.04168,6.58332c-40.89208,0 -74.04166,-2.94745 -74.04166,-6.58332l0,-26.33335z" fill="#ffffff" />
                <path stroke="#000" strokeWidth="2" d="m148.95834,36.95833c0,3.63588 -33.14959,6.58334 -74.04168,6.58334m74.04168,-6.58334l0,0c0,3.63588 -33.14959,6.58334 -74.04168,6.58334c-40.89208,0 -74.04166,-2.94746 -74.04166,-6.58334m0,0l0,0c0,-3.63587 33.14958,-6.58333 74.04166,-6.58333c40.89209,0 74.04168,2.94746 74.04168,6.58333l0,26.33335c0,3.63587 -33.14959,6.58332 -74.04168,6.58332c-40.89208,0 -74.04166,-2.94745 -74.04166,-6.58332l0,-26.33335z" fill="#ffffff" />
                <path stroke="#000" strokeWidth="2" d="m148.95834,7.58333c0,3.63588 -33.14959,6.58334 -74.04167,6.58334m74.04167,-6.58334l0,0c0,3.63588 -33.14959,6.58334 -74.04167,6.58334c-40.89208,0 -74.04166,-2.94746 -74.04166,-6.58334m0,0l0,0c0,-3.63587 33.14958,-6.58333 74.04166,-6.58333c40.89208,0 74.04167,2.94746 74.04167,6.58333l0,26.33335c0,3.63587 -33.14959,6.58332 -74.04167,6.58332c-40.89208,0 -74.04166,-2.94745 -74.04166,-6.58332l0,-26.33335z" fill="#ffffff" />
                {bobinesTxt && <text transform="matrix(1 0 0 1 75 60)" textAnchor="middle">{bobinesTxt}</text>}
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
        </svg>
    );
}

export const SvgPlacaMDF = ({ key, pos, text = "Placa MDF" }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <svg key={key}>
            <g transform={`translate(${x},${y})`}>
                <title>Placa MDF</title>
                <rect stroke="null" height="5" width="150" y="0" x="0" fill="#000000" />
                {text && <text transform={`matrix(1 0 0 1 -50 5)`} /* fontWeight="bold" */ textAnchor="middle">{text}</text>}
            </g>
        </svg>
    );
}

export const SvgPlacaCartao = ({ key, pos, text = "Placa de Cartão" }) => {
    const { x = 0, y = 20 } = pos;
    return (
        <svg key={key}>
            <g transform={`translate(${x},${y})`}>
                <title>Placa de Cartão</title>
                <rect stroke="null" height="2" width="150" y="9" x="0" fill="#000000" />
                {text && <text transform={`matrix(1 0 0 1 -50 13)`} /* fontWeight="bold" */ textAnchor="middle">{text}</text>}
            </g>
        </svg>
    );
}

export default ({ vGap = 2, form, items, changedValues, x = 200, width="100%",height }) => {
    const [elements, setElements] = useState([]);
    const [totalHeight, setTotalHeight] = useState(0);

    const compute = (els) => {
        let currentPosY = 0;
        for (const v of els) {
            let posY = currentPosY;
            currentPosY += v.height + vGap;
            v.pos = { x: v.x, y: posY };
        }
        return currentPosY;
    }

    useEffect(() => {
        let data = {};
        if (items) {
            let itms = items?.paletizacao?.sort((a, b) => b.item_order - a.item_order);
            console.log("#$#$#$#$--",itms);
            data = { paletizacao: itms, cintas: items.cintas, ncintas: items.ncintas, filmeestiravel_bobines: items.filmeestiravel_bobines, filmeestiravel_exterior: items.filmeestiravel_exterior }
        } else {
            data = { paletizacao: form.getFieldValue(["paletizacao"]), cintas: form.getFieldValue(["cintas"]), ncintas: form.getFieldValue(["ncintas"]), filmeestiravel_bobines: form.getFieldValue(["filmeestiravel_bobines"]), filmeestiravel_exterior: form.getFieldValue(["filmeestiravel_exterior"]) }
        }



        if (!data.paletizacao) {
            setElements([]);
        } else {
            let els = [];
            let npaletes = 0;
            const cintas = isValue(data.cintas, undefined, 0);
            const ncintas = isValue(data.ncintas, undefined, 0);
            for (let v of data.paletizacao) {
                switch (v.item_id) {
                    case 1:
                        els.push({ obj: SvgPalete, x, height: 25, text: `Palete ${PALETE_SIZES.find(p => p.key == v.item_paletesize).value}`, item_order: v.item_order });
                        npaletes++;
                        break;
                    case 2:
                        els.push({ obj: SvgBobines, x, height: 100, filmeEstiravel: isValue(data.filmeestiravel_bobines, undefined, 0), bobinesTxt: `${v.item_numbobines} Bobine(s)`, item_order: v.item_order });
                        break;
                    case 3:
                        els.push({ obj: SvgPlacaCartao, x, height: 15, item_order: v.item_order });
                        break;
                    case 4:
                        els.push({ obj: SvgPlacaMDF, x, height: 5, item_order: v.item_order });
                        break;
                    case 5:
                        els.push({ obj: SvgPlacaPlastico, x, height: 10, item_order: v.item_order });
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
            setTotalHeight(compute(els));
            setElements(els.reverse());
        }
    }, [changedValues]);
    return (
        <svg preserveAspectRatio="xMidYMid meet" width={width} height={height ? height : totalHeight} viewBox={`0 0 480 ${totalHeight}`} id="svg">
            {isValue((items) ? items.filmeestiravel_exterior : form.getFieldValue("filmeestiravel_exterior"), undefined, 0) === 1 && <g transform={`translate(${x - 100},${0})`}>
                <title>Filme Estirável</title>
                <line id="svg_10" y2={totalHeight} x2="0.50001" y1="0" x1="0.50001" stroke="#000000" fill="none" />
                <line id="svg_11" y2="0.5007" x2="11.3762" y1="0.5007" x1="1.00105" stroke="#000000" fill="none" />
                <line id="svg_12" y2={totalHeight} x2="11" y1={totalHeight} x1="1" stroke="#000000" fill="none" />
                <text transform={`matrix(1 0 0 1 -45 ${totalHeight / 2})`} strokeWidth="2" textAnchor="middle">Filme Estirável</text>
            </g>
            }

            {elements.map((v, i) => v.obj({ key: `svg-${i}`, ...v }))}
        </svg>
    );
}


