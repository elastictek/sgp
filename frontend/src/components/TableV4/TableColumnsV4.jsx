import React, { useEffect, useState, useCallback, useRef, useContext, forwardRef, useLayoutEffect, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import classNames from 'classnames';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import {
    StarFilled, CheckSquareOutlined, BorderOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteTwoTone, UnorderedListOutlined, CheckOutlined, PauseOutlined, SyncOutlined,
    CheckCircleTwoTone, CloseCircleTwoTone, EditTwoTone, EllipsisOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { json, includeObjectKeys, isObjectEmpty, valueByPath } from "utils/object";
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
import { getInt } from 'utils/index';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { columnHasPath, columnPath } from './TableV4';

export const useStyles = createUseStyles({
    focus: {
        outline: "none",
        '&:focus': {
            outline: 'solid 1px #000'
        },
    }
});

const genericProps = (localStyle, onClick, onKeyDown, style, className) => {
    return {
        ...onClick && { tabIndex: "0", onClick, onKeyDown },
        style: { ...localStyle, ...onClick && { cursor: "pointer" }, ...style },
        className
    };
}

export const OPTIONS_TROCAETIQUETAS = {
    1: { label: "Com alteração do lote", props: { color: "orange" } },
    2: { label: "Sem alteração do lote", props: { color: "blue" } }
}


const OuterDiv = ({ error, style, children }) => {
    return (
        <div title={error && error.message} style={{ width: "100%", height: "100%", ...error && { backgroundColor: "#ffa39e", borderRadius: "5px" }, ...style }}>
            {children}
        </div>
    );
}

const useValidation = (node, col) => {
    const { validation } = col.getDefinition().cellRendererParams || {};
    const error = useMemo(() => {
        if (validation && Object.keys(validation).length > 0) {
            const _validation = validation?.[node.id];
            if (_validation) {
                const _path = columnPath(col);
                const _f = _validation.find(v => v.field === _path);
                if (_f) {
                    return { label: col?.headerName ? col.headerName : _f.label, message: _f.message };
                }
                return undefined;
            }
        }
    }, [validation?.[node.id]]);

    return error;
};



export const Options = ({ params: { column: col, data, node } = {}, integer, column, value, style, bold, className, onClick, map }) => {
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const { validation } = col.getDefinition().cellRendererParams || {};
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onClick(event)
        }
    }
    const error = useMemo(() => {
        if (validation && Object.keys(validation).length > 0) {
            const _validation = validation?.[node.id];
            if (_validation) {
                const _path = columnPath(col);
                const _f = _validation.find(v => v.field === _path);
                if (_f) {
                    return { label: col?.headerName ? col.headerName : _f.label, message: _f.message };
                }
                return undefined;
            }
        }
    }, [validation?.[node.id]]);
    const _value = useMemo(() => {
        let _v = value;
        _v = (_v === undefined && col && data) ? (typeof column === "string") ? valueByPath(data, column) : data?.[col.getDefinition().field] : _v;
        if (map) {
            return map?.[integer ? getInt(_v) : _v];
        }
        return { label: integer ? getInt(_v) : _v };
    }, [data]);

    return (<div title={error && error.message} style={{ width: "100%", height: "100%", ...error && { backgroundColor: "#ffa39e", borderRadius: "5px" } }}><Tag {...genericProps({ ...bold && { fontWeight: 700 } }, onClick, onKeyDown, style, _classNames)} {..._value?.props}>{_value?.label}</Tag></div>);
}


export const Action = ({ params: { column: col, data, node } = {}, icon, onClick, items = [] }) => {

    return (

        <Dropdown menu={{ items: (Array.isArray(items) ? items : items()), onClick }} placement="bottomLeft" trigger={["click"]}>
            <Button size='small' icon={icon ? icon : <EllipsisOutlined />} />
        </Dropdown>

    )

}

export const Value = ({ params: { column: col, data, node } = {}, column, detailColumn, detailValue, value, unit, style, className, addonAfter, addonBefore, link, bold, align = "left", onClick, datetime }) => {
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const { format = DATETIME_FORMAT } = col.getDefinition().cellRendererParams || {};
    const error = useValidation(node, col);
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onClick(event)
        }
    }


    const _value = useMemo(() => {
        let _v = value;
        const _path = columnPath(col);
        _v = (_v === undefined && col && data) ? (typeof column === "string") ? valueByPath(data, column) : (columnHasPath(col) ? valueByPath(data, _path) : data?.[_path]) : _v;
        if (datetime) {
            _v = (_v && dayjs(_v).isValid()) && dayjs(_v).format(format);
        }
        return _v;
    }, [data]);

    const _detail = useMemo(() => {
        if (detailColumn || detailValue) {
            let _v = detailValue;
            _v = (_v === undefined && data) ? ((detailColumn) ? valueByPath(data, detailColumn) : null) : _v;
            return _v;
        }
        return null;
    }, [data]);

    if (link) {
        return (
            <div style={{ ..._detail !== null && { lineHeight: 1.3 } }}>
                <Button title={error && error.message} size='small' type='link' {...genericProps({ textAlign: align, height: "16px", lineHeight: 1.3, ...error && { backgroundColor: "#ffa39e", borderRadius: "5px" }, ...bold && { fontWeight: 700 } }, onClick, onKeyDown, style, _classNames)}>{(_value !== null) && addonBefore}{_value}{((unit && _value !== null) && unit)}{(_value !== null) && addonAfter}</Button>
                {_detail !== null && <div style={{ padding: "0px 7px" }}>{_detail}</div>}
            </div>
        );
    }
    return (
        <OuterDiv error={error}>
            <div style={{ textAlign: align, ..._detail !== null && { lineHeight: 1.3 } }}>
                <div><span {...genericProps({ ...bold && { fontWeight: 700 } }, onClick, onKeyDown, style, _classNames)}>{(_value !== null) && addonBefore}{_value}{((unit && _value !== null) && unit)}{(_value !== null) && addonAfter}</span></div>
                {_detail !== null && <div>{_detail}</div>}
            </div>
        </OuterDiv>
    );
}

export const Ordens = ({ field: { cod, des } = {}, params: { column: col, data, node } = {}, style, className, onClick }) => {
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onClick(event)
        }
    }
    return (
        <OuterDiv error={error}>{data?.[cod] ?
            <Tag {...genericProps({ fontWeight: 600 }, onClick, onKeyDown, style, _classNames)} >{data?.[cod]}</Tag> :
            <span {...genericProps({ fontWeight: 600 }, onClick, onKeyDown, style, _classNames)}>{data?.[des]}</span>}
        </OuterDiv>
    );
}

export const Larguras = ({ field: { artigos } = {}, params: { column: col, data, node, rowIndex } = {}, style, className, onClick }) => {
    const _artigos = json(data?.[artigos]);
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const onKeyDown = (event, a, b) => {
        if (event.keyCode === 13) {
            onClick(a, b)
        }
    }
    return (<OuterDiv error={error}>
        {(Array.isArray(_artigos)) && [...new Set(_artigos.map(item => item?.lar ? item.lar : item?.largura))]
            .map((v, i) => <Tag
                {...genericProps({ fontWeight: 600 },
                    onClick ? () => onClick && onClick("lar", { data: v }) : null,
                    (e) => onKeyDown(e, "lar", { data: v }), style, _classNames)}
                key={`bol-${rowIndex}-${v?.lar ? v.lar : v?.largura}-${i}`}
            >{v}</Tag>)}
    </OuterDiv>);
}

export const Cores = ({ field: { artigos } = {}, params: { column: col, data, node, rowIndex } = {}, style, className, onClick }) => {
    const _artigos = json(data?.[artigos]);
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const onKeyDown = (event, a, b) => {
        if (event.keyCode === 13) {
            onClick(a, b)
        }
    }
    return (<OuterDiv error={error}>
        {(Array.isArray(_artigos)) && [...new Set(_artigos.map(item => item?.core))]
            .map((v, i) => <Tag
                {...genericProps({ fontWeight: 600 },
                    onClick ? () => onClick && onClick("core", { data: v }) : null,
                    (e) => onKeyDown(e, "core", { data: v }), style, _classNames)}
                key={`bol-${rowIndex}-${v?.core}-${i}`}
            >{v}''</Tag>)}
    </OuterDiv>);
}


export const BadgeNumber = ({ params: { column: col, data, node } = {}, column, value, unit, style, className, bold, align = "left", onClick }) => {
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onClick(event)
        }
    }
    const _value = useMemo(() => {
        let _v = value;
        _v = (_v === undefined && col && data) ? (typeof column === "string") ? valueByPath(data, column) : data?.[col.getDefinition().field] : _v;
        return _v;
    }, [data]);


    return (<OuterDiv error={error} style={{ textAlign: align }}><div {...genericProps({ ...bold && { fontWeight: 700 } }, onClick, onKeyDown, style, _classNames)}><Badge count={_value} />{((unit && _value !== null) && unit)}</div></OuterDiv>);
}

export const FromTo = ({ field: { from, to } = {}, params: { column: col, data, node } = {}, style, bold, align = "left", className, addonAfter, addonBefore, onClick, unit, pad = 2, colorize = false, color = "#000", colorGreater = "#b7eb8f", colorLess = "#ffa39e" }) => {
    let _color = color;
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const _from = data?.[from] || 0;
    const _to = data?.[to] || 0;
    if (colorize) {
        _color = (_from < _to) ? colorLess : colorGreater;
    }
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onClick(event)
        }
    }
    return (<OuterDiv style={{ textAlign: align }}><span {...genericProps({ ...bold && { fontWeight: 700 } }, onClick, onKeyDown, style, _classNames)}>
        {addonBefore}
        <span style={{ ...colorize && { padding: "2px", borderRadius: "2px", backgroundColor: _color } }}><b>{String(_from).padStart(pad, '0')}</b>/{String(_to).padStart(pad, '0')}</span>
        {(unit && unit)}{addonAfter}
    </span>
    </OuterDiv>);




    //return (<div style={{ textAlign: "left", ...style }} {...className && { className }}></div>;
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

export const EstadoBobines = ({ field: { artigos } = {}, params: { column: col, data, rowIndex, node } = {}, style, align = "start", className, onClick }) => {
    const _artigos = uniqWith(allPass(map(eqProps)(['lar', 'largura', 'estado'])))(json(data?.[artigos], []));
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const onKeyDown = (event, a, b) => {
        if (event.keyCode === 13) {
            onClick(a, b)
        }
    }
    return (<OuterDiv error={error}>
        <div style={{ display: "flex", flexDirection: "row", lineHeight: "12px", justifyContent: align }}>
            {
                Array.isArray(_artigos) &&
                <>
                    {_artigos.map((v, i) => {
                        return (
                            <StyledBobine key={`bos-${rowIndex}-${v?.estado}-${v?.lar ? v.lar : v?.largura}-${i}`} color={bColors(v.estado).color} $fontColor={bColors(v.estado).fontColor}
                                {...genericProps({},
                                    onClick ? () => onClick && onClick("estado", { data: v }) : null,
                                    (e) => onKeyDown(e, "estado", { data: v }), style, _classNames)}
                            >
                                <b>{v.estado === 'HOLD' ? 'HLD' : v.estado}</b><div className='lar'>{v.lar ? v.lar : v?.largura}</div>
                            </StyledBobine>
                        );
                    })}
                </>
            }
        </div></OuterDiv>);
}

export const EstadoBobine = ({ field: { estado, largura } = {}, params: { column: col, data, rowIndex, node } = {}, align = "center", ...props }) => {
    const error = useValidation(node, col);
    const _data = { artigo: [{ estado: data?.[estado], lar: data?.[largura] }] };
    return (<OuterDiv error={error}>
        <EstadoBobines field={{ artigos: "artigo" }} params={{ column: col, data: _data, rowIndex, node }} align={align} {...props} />
    </OuterDiv>);
}

export const Bool = ({ params: { column: col, data, node } = {}, column, checkedValue = null, unCheckedValue = null, validation, value, style, className, addonAfter, addonBefore, align = "left", onClick, checkedColor = "#000", unCheckedColor = "#d9d9d9" }) => {
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onClick(event)
        }
    }
    const _checked = useMemo(() => {
        let _v = value;
        const _path = columnPath(col);
        _v = (_v === undefined && col && data) ? (typeof column === "string") ? valueByPath(data, column) : (columnHasPath(col) ? valueByPath(data, _path) : data?.[_path]) : _v;

        let _c = false;
        if (checkedValue == null && unCheckedValue == null) {
            _c = getInt(_v, null) >= 1 || _v === true || String(_v)?.toLowerCase() === "true";
        } else {
            if (checkedValue != null && _v == checkedValue) {
                _c = true;
            } else if (unCheckedValue != null && _v == unCheckedValue) {
                _c = false;
            }
        }
        return (_c) ? <CheckSquareOutlined style={{ fontSize: "18px", color: checkedColor }} /> : <BorderOutlined style={{ fontSize: "18px", color: unCheckedColor }} />;
    }, [data]);

    return (<OuterDiv error={error} style={{ textAlign: align }}><span {...genericProps({}, onClick, onKeyDown, style, _classNames)}>{addonBefore}{_checked}{addonAfter}</span></OuterDiv>);
}

const MultiText = ({ value, dataType }) => {
    if (dataType === "json") {
        return <SyntaxHighlighter customStyle={{ fontSize: "11px" }} language="json" style={a11yDark}>{value}</SyntaxHighlighter>;
    }
    return (<div style={{ whiteSpace: "pre" }}>{value}</div>)
}
export const MultiLine = ({ params = {}, column, value, style, className, bold, align = "left", type = "drawer", dataType = "text", width = 500, height = 300, }) => {
    const { column: col, data, api, node } = params;
    const _classNames = classNames({ [className]: className });
    const { modalApi, modeApi } = col.getDefinition().cellRendererParams || {};
    const error = useValidation(node, col);
    const _value = useMemo(() => {
        let _v = value;
        _v = (_v === undefined && col && data) ? (typeof column === "string") ? valueByPath(data, column) : data?.[col.getDefinition().field] : _v;
        if (dataType == "json") {
            const _j = json(_v, {});
            if (isObjectEmpty(_j)) {
                return "";
            }
            return JSON.stringify(_j, null, 2);
        }
        return _v;
    }, [data]);

    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onOpen();
        }
    }

    const isOnMode = useMemo(() => {
        return modeApi?.isOnMode() && col.getDefinition().editable(params);
    }, [modeApi?.isOnMode()]);

    const onOpen = () => {
        const _t = api.getFocusedCell();
        modalApi.setModalParameters({ content: <MultiText dataType={dataType} value={_value} />, title: col.getDefinition().headerName, type: type, width: width, height: height, parameters: { gridApi: api, cellFocus: { rowIndex: _t.rowIndex, colId: _t.column.colId } } });
        modalApi.showModal();
    }

    return (<OuterDiv error={error}><div {...!isOnMode && { onClick: onOpen, onKeyDown }} tabIndex="0" {...genericProps({ textAlign: align, cursor: "pointer", ...bold && { fontWeight: 700 } }, null, null, style, _classNames)}>{_value}</div></OuterDiv>);
}