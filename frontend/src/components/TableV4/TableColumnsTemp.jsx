import React, { useEffect, useState, useCallback, useRef, useContext, forwardRef, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import {
    StarFilled, CheckSquareOutlined, BorderOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteTwoTone, UnorderedListOutlined, CheckOutlined, PauseOutlined, SyncOutlined,
    CheckCircleTwoTone, CloseCircleTwoTone, EditTwoTone, EllipsisOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { Tag, Button, Space, Badge, Dropdown } from "antd";
import { FORMULACAO_CUBAS, DATETIME_FORMAT, bColors } from "config";
import dayjs from 'dayjs';
import { ImArrowDown, ImArrowUp } from 'react-icons/im';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import { GiBandageRoll } from 'react-icons/gi';
import { AiOutlineVerticalAlignTop, AiOutlineVerticalAlignBottom } from 'react-icons/ai';
import { VscDebugStart } from 'react-icons/vsc';
import { BsFillStopFill, BsPauseCircleFill, BsStopCircleFill, BsPlayCircleFill } from 'react-icons/bs';
import { IoCodeWorkingOutline } from 'react-icons/io5';
import TagButton from "components/TagButton";


const itemsIndexChange = ({ allowDelete, first = false, last = false }) => [
    ...(!first) ? [{
        label: 'Mover para cima',
        key: '1',
        icon: <ArrowUpOutlined />,
    }] : [],
    ...(!last) ? [{
        label: 'Mover para baixo',
        key: '2',
        icon: <ArrowDownOutlined />,
    }] : [],
    ...(allowDelete) ? [{
        label: 'Apagar',
        key: '3',
        icon: <CloseCircleOutlined />,
        danger: true,
    }] : []
];


export const IndexChange = ({ onUp, onDown, onDelete, allowDelete, value, modeEdit, cellProps }) => {
    const onClick = (e) => {
        switch (e.key) {
            case "1": onUp(cellProps.rowIndex); break;
            case "2": onDown(cellProps.rowIndex); break;
            case "3": onDelete(cellProps.rowIndex); break;
        }
    }
    return (<>{(modeEdit) ? <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", height: "100%", alignItems: "center" }}>
        <Dropdown menu={{ items: itemsIndexChange({ allowDelete, first: cellProps.rowIndex == 0, last: cellProps.totalDataCount == (cellProps.rowIndex + 1) }), onClick: onClick }} trigger={["click"]}>
            <Button size="small">
                <Space>
                    {value}
                    <EllipsisOutlined />
                </Space>
            </Button>
        </Dropdown>
    </div> : <>{value}</>}</>);
}



export const OFabricoStatus = ({ aggCod = false, data, onClick, cellProps }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {(data?.ofabrico_status == 0) && <>
                {aggCod && <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<CheckOutlined />} color="#108ee9">{aggCod && <div>{data.agg_cod}</div>}<div>Validar</div></TagButton>}
                {!aggCod && <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<CheckOutlined />} color="#108ee9">Validar</TagButton>}
            </>}
            {(data?.ofabrico_status == 1) && <>
                {aggCod && <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="warning">{aggCod && <div>{data.agg_cod}</div>}<div>Em Elaboração</div></TagButton>}
                {!aggCod && <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="warning">Em Elaboração</TagButton>}
            </>}
            {(data?.ofabrico_status == 2 && data?.was_in_production == 0) && <>
                {aggCod && <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="orange">{aggCod && <div>{data.agg_cod}</div>}<div>Na Produção</div></TagButton>}
                {!aggCod && <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="orange">Na Produção</TagButton>}
            </>}
            {(data?.ofabrico_status == 2 && data?.was_in_production == 1) && <>
                {aggCod && <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<PauseOutlined />} color="orange">{aggCod && <div>{data.agg_cod}</div>}<div>Suspensa</div></TagButton>}
                {!aggCod && <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<PauseOutlined />} color="orange">Suspensa</TagButton>}
            </>}
            {(data?.ofabrico_status) == 3 && <>
                {aggCod && <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<SyncOutlined spin />} color="success">{aggCod && <div>{data.agg_cod}</div>}<div>Em Produção</div></TagButton>}
                {!aggCod && <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<SyncOutlined spin />} color="success">Em Produção</TagButton>}
            </>}
            {(data?.ofabrico_status) == 9 && <>
                {aggCod && <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} color="error">{aggCod && <div>{data.agg_cod}</div>}<div>Finalizada</div></TagButton>}
                {!aggCod && <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} color="error">Finalizada</TagButton>}
            </>}
        </div>
    );
}


export const EventColumn = ({ v, grayColor = false, title }) => {
    return (<>

        {v == 1 && <GiBandageRoll color={grayColor ? "#8c8c8c" : "#69c0ff"} size={20} title={`Bobinagem ${title}`} />}
        {v == 9 && <BsFillStopFill color={grayColor ? "#8c8c8c" : "red"} size={20} title={`Máquina Parada ${title}`} />}
        {v == 7 && <VscDebugStart color={grayColor ? "#8c8c8c" : "orange"} size={20} title={`Máquina Arranque ${title}`} />}
        {v == 8 && <IoCodeWorkingOutline color={grayColor ? "#8c8c8c" : "green"} size={20} title={`Máquina em Produção ${title}`} />}
        {v == 6 && <AiOutlineVerticalAlignTop size={20} color={grayColor ? "#8c8c8c" : "#000"} title={`Troca NW Superior ${title}`} />}
        {v == 5 && <AiOutlineVerticalAlignBottom size={20} color={grayColor ? "#8c8c8c" : "#000"} title={`Troca NW Inferior ${title}`} />}

    </>);
}

const StyledBobine = styled.div`
    border:dashed 1px #000;
    background-color:${props => props.color};
    color:${props => props.$fontColor};
    border-radius:3px;
    margin-right:1px;
    text-align:center;
    min-height:25px;
    width:25px;
    min-width:25px;
    font-size:8px;
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

export const EstadoReciclado = ({ id, nome, onClick, estado, cellProps, style = {} }) => {
    return (<>
        {(!cellProps?.inEdit) && <StyledBobine onClick={(v) => onClick && onClick("estado", id, nome, v)} color={bColors(estado).color} $fontColor={bColors(estado).fontColor}><b>{estado === 'HOLD' ? 'HLD' : estado}</b></StyledBobine>}
    </>);
}

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

export const ArtigoColumn = ({ data, cellProps, style, onClick }) => {
    return (<>{!cellProps?.inEdit && <div {...onClick && { onClick: () => onClick(data) }} style={{ display: "flex", alignItems: "start", flexDirection: "column", ...style }}>
        {data?.n_paletes_total && <div style={{ color: "#000" }}><b>{data?.n_paletes_total}</b> <span>Paletes</span> {data?.qtd && <span><b>{data.qtd}</b> m2</span>}</div>}
        <div style={{ fontWeight: 700 }}>{data?.artigo_cod}</div>
        <div style={{}}>{data?.artigo_des}</div>
    </div>}</>)
}

export const NwColumn = ({ data, cellProps, style }) => {
    if (!data?.n_lote) {
        return (<>{!cellProps?.inEdit && <div style={{ display: "flex", alignItems: "start", flexDirection: "column", lineHeight: 1.2, ...style }}>
            <div>{data?.artigo_des?.replace(/nonwoven/gi, '')}</div>
            <div style={{ fontWeight: 700 }}>{data?.artigo_cod}</div>
        </div>}</>)
    } else {
        return (<>{!cellProps?.inEdit && <div style={{ display: "flex", alignItems: "start", flexDirection: "column", lineHeight: 1.2, ...style }}>
            <div><span style={{ fontWeight: 700 }}>{data?.artigo_cod}</span> {data?.artigo_des?.replace(/nonwoven/gi, '')}</div>
            <div style={{ fontWeight: 700 }}>{data?.n_lote}</div>
        </div>}</>)
    }
}

export const PosColumn = ({ value, cellProps }) => {
    return (<>{!cellProps?.inEdit && <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {value === 1 ? <ImArrowUp /> : <ImArrowDown />}
        <div style={{ marginRight: "5px" }}>{value === 1 ? "SUP" : "INF"}</div>
    </div>}</>);
}

export const Delete = ({ value, rowIndex, onClick, style, cellProps }) => {
    return (<>{!cellProps?.inEdit && <Button onClick={onClick} icon={<DeleteTwoTone twoToneColor="#f5222d" />} />}</>);
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
        {value && getValue(value).map((v, i) => <div key={`${cellProps?.name}-${i}`} style={{ ...style }}>{v}</div>)}
    </div>}</>);
}

export const ArrayObjectColumn = ({ value, onClick, style, children, cellProps, ...props }) => {
    return (<>{!cellProps?.inEdit && <div style={{ display: "flex", flexDirection: "column", fontSize: "11px", ...style }}>
        {value && value.map((v, i) => <div key={`${cellProps?.name}-${i}`}>{React.cloneElement(children, { data: v, cellProps })}</div>)}
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
        color:${props => props.$fontColor};
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
export const Cuba = ({ value, style }) => {
    const val = getValue(value);
    return (<>
        {value && <>
            {(val !== null && val !== undefined) ? <StyledCuba style={{ ...style }} color={colors[value].color} $fontColor={colors[value].fontColor}>{val}</StyledCuba> : <StyledCuba color="#000" $fontColor="#fff">{value}</StyledCuba>}
        </>}
    </>);
}


export const StatusApproval = ({ value = 0, docStatus, genre = "m", onClick, allowed = [0, 1], cellProps }) => {
    return (<>
        {!cellProps?.inEdit &&
            <>
                {docStatus == -1 || docStatus == 1 ? <>
                    {(docStatus == -1 || value == -1) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="#f5222d">Obsolet{genre === "m" ? "o" : "a"}</Tag>}
                    {(docStatus == 1 && value !== -1) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="#fa8c16">Em revisão</Tag>}
                </> :
                    <>
                        {value == -1 && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="#f5222d">Obsolet{genre === "m" ? "o" : "a"}</Tag>}
                        {value == 0 && allowed.includes(value) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="warning">Em Elaboração</Tag>}
                        {value == 1 && allowed.includes(value) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="blue">Em Standby</Tag>}
                        {value == 2 && allowed.includes(value) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="green">Aprovad{genre === "m" ? "o" : "a"}</Tag>}
                    </>
                }
            </>
        }</>);
}

// export const StatusDoc = ({ value = 0, genre = "m", onClick, allowed = [-1, 0, 1, 2], cellProps }) => {
//     return (<>
//         {!cellProps?.inEdit &&
//             <>
//                 {value == -1 && allowed.includes(value) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="error">Obsolet{genre === "m" ? "o" : "a"}</Tag>}
//                 {value == 0 && allowed.includes(value) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }}>Em Elaboração</Tag>}
//                 {value == 1 && allowed.includes(value) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="warning">Em Revisão</Tag>}
//                 {value == 2 && allowed.includes(value) && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="green">Ativ{genre === "m" ? "o" : "a"}</Tag>}
//             </>
//         }</>);
// }

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


// {allowEdit.form && <>
//     {(record.status == 1 || record.status == 2) &&
//         <>
//             <Button block size="large" style={{ background: "#389e0d", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(3)}>Iniciar Produção</Button>
//             <VerticalSpace height="5px" />
//             {record.was_in_production ===1 && <Button block size="large" style={{ background: "#40a9ff", color: "#000", fontWeight: 700 }} onClick={() => changeStatus(9)}>Finalizar Produção</Button>}
//             {/* <Button block size="large" style={{ background: "#fa8c16", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(0)}>Refazer Planeamento</Button> */}
//         </>
//     }
//     {record.status == 3 &&
//         <>
//             <Button block size="large" style={{ background: "red", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(1)}>Parar/Suspender Produção</Button>
//             <VerticalSpace height="5px" />
//             <Button block size="large" style={{ background: "#40a9ff", color: "#000", fontWeight: 700 }} onClick={() => changeStatus(9)}>Finalizar Produção</Button>
//         </>
//     }</>
// }

export const StatusProduction = ({ status, onClick }) => {
    return (<>

        {(status == 1 || status == 2) && <Space>

            <Button icon={<BsPlayCircleFill color='green' fontSize={18} style={{ marginLeft: "5px" }} />} style={{ display: "flex", alignItems: "center" }}>{/* Iniciar */}</Button>
            {status == 1 && <Button icon={<BsStopCircleFill color='red' fontSize={18} style={{ marginLeft: "5px" }} />} style={{ display: "flex", alignItems: "center" }}>{/* Finalizar */}</Button>}

        </Space>}
        {status == 3 && <Space>

            <Button icon={<BsPauseCircleFill color='orange' fontSize={18} style={{ marginLeft: "5px" }} />} style={{ display: "flex", alignItems: "center" }}>{/* Suspender */}</Button>
            <Button icon={<BsStopCircleFill color='red' fontSize={18} style={{ marginLeft: "5px" }} />} style={{ display: "flex", alignItems: "center" }}>{/* Finalizar */}</Button>

        </Space>}


        {/* {v == 1 && <GiBandageRoll color={grayColor ? "#8c8c8c" : "#69c0ff"} size={20} title={`Bobinagem ${title}`}/>}
        {v == 9 && <BsFillStopFill color={grayColor ? "#8c8c8c" : "red"} size={20} title={`Máquina Parada ${title}`}/>}
        {v == 7 && <VscDebugStart color={grayColor ? "#8c8c8c" : "orange"} size={20} title={`Máquina Arranque ${title}`}/>}
        {v == 8 && <IoCodeWorkingOutline color={grayColor ? "#8c8c8c" : "green"} size={20} title={`Máquina em Produção ${title}`}/>}
        {v == 6 && <AiOutlineVerticalAlignTop size={20} color={grayColor ? "#8c8c8c" : "#000"} title={`Troca NW Superior ${title}`}/>}
        {v == 5 && <AiOutlineVerticalAlignBottom size={20} color={grayColor ? "#8c8c8c" : "#000"} title={`Troca NW Inferior ${title}`}/>} */}

    </>);
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
