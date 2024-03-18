import React, { useEffect, useState, useCallback, useRef, useContext, forwardRef, useLayoutEffect, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import YScroll from 'components/YScroll';
import classNames from 'classnames';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { useSubmitting } from "utils";
import Portal from "components/portal";
import {
    StarFilled, CheckSquareOutlined, BorderOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteTwoTone, UnorderedListOutlined, CheckOutlined, PauseOutlined, SyncOutlined,
    CheckCircleTwoTone, CloseCircleTwoTone, EditTwoTone, EllipsisOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { json, includeObjectKeys, isObjectEmpty, valueByPath } from "utils/object";
import { Tag, Button, Space, Badge, Dropdown, Form, Select, InputNumber, Checkbox } from "antd";
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
import { getInt, isNullOrEmpty } from 'utils/index';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { columnHasPath, columnPath } from './TableV4';
import { Field, Container as FormContainer, SelectField, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule } from 'components/FormFields';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { StyledBobine } from 'components/FormFields/FormsV2';
import { LiaDatabaseSolid } from "react-icons/lia";

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


export const OPTIONS_LAB_PARAMETERTYPE = {
    "gramagem": { label: "Gramagem", props: {} },
    "histerese": { label: "Histerese", props: {} },
    "peel": { label: "Peel", props: {} },
    "traction": { label: "Tração", props: {} }
}

export const OPTIONS_LAB_MODE = {
    "simples": { label: "Simples", props: {} },
    "controle": { label: "Controle", props: {} },
    "ciclico": { label: "Cíclico", props: {} }
}

export const PRIORIDADES_DESTINOS = {
    1: { label: "1", props: {} },
    2: { label: "2", props: {} },
    3: { label: "3", props: {} },
    4: { label: "4", props: {} },
    5: { label: "5", props: {} },
    6: { label: "6", props: {} },
    7: { label: "7", props: {} },
    8: { label: "8", props: {} }
}
export const useDestinosStyles = createUseStyles({
    "1": { backgroundColor: "#389e0d", color: "#fff", textAlign: "center" },
    "2": { backgroundColor: "#73d13d", color: "#000", textAlign: "center" },
    "3": { backgroundColor: "#b7eb8f", color: "#000", textAlign: "center" },
    "4": { backgroundColor: "#fadb14", color: "#000", textAlign: "center" },
    "5": { backgroundColor: "#ffec3d", color: "#000", textAlign: "center" },
    "6": { backgroundColor: "#fff566", color: "#000", textAlign: "center" },
    "7": { backgroundColor: "#ffa940", color: "#000", textAlign: "center" },
    "8": { backgroundColor: "#ffd591", color: "#000", textAlign: "center" }

});


const OuterDiv = ({ error, style, children }) => {
    return (
        <div title={error && error.message} style={{ width: "100%", height: "100%", ...error && { backgroundColor: "#ffa39e", borderRadius: "5px" }, ...style }}>
            {children}
        </div>
    );
}

const useValidation = (node, col) => {
    const { validation, validationGroups } = col?.getDefinition()?.cellRendererParams || {};
    const error = useMemo(() => {
        if (validation && Object.keys(validation).length > 0) {
            const _validation = validation?.[node.id];
            if (_validation) {
                const _path = validationGroups ? validationGroups.groupPaths(columnPath(col)) : [columnPath(col)];
                const _f = _validation.find(v => _path.includes(v.field));
                if (_f) {
                    return { label: col?.headerName ? col.headerName : _f.label, message: _f.message };
                } else {

                }
                return undefined;
            }
        }
    }, [validation?.[node?.id]]);

    return error;
};



export const StyledPlanningStatus = styled("div").withConfig({
    shouldForwardProp: (prop) =>
        ![].includes(prop)
})`
    border:solid 1px #000;
    background-color:${props => props.ok ? "#52c41a" : "#f5222d"};
    border-radius:3px;
    margin-right:1px;
    text-align:center;
    min-height:${props => props.$height ? props.$height : "25px"};
    width:${props => props.$width ? props.$width : "25px"};
    min-width:${props => props.$width ? props.$width : "25px"};
    font-size:${props => props.$fontSize ? props.$fontSize : "8px"};
    font-weight:${props => props.$fontWeight ? props.$fontWeight : "400"};
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

export const PlanningStatus = ({ params: { column: col, data, node, rowIndex } = {}, check: { paletizacao } = {}, value, style, outerStyle, className, onClick }) => {
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onClick(event)
        }
    }

    return (
        <div style={{ display: "flex", margin: "3px", ...outerStyle }}>
            {paletizacao?.id && <StyledPlanningStatus ok={data?.[paletizacao?.id]}><LiaDatabaseSolid size={18} color="#fff" /></StyledPlanningStatus>}
        </div>
    );

}

export const AuditCsOperation = ({ params: { column: col, data, node, rowIndex } = {}, value, style, outerStyle, className, onClick }) => {
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
        const _path = columnPath(col);
        _v = (_v === undefined && col && data) ? (typeof column === "string") ? valueByPath(data, column) : (columnHasPath(col) ? valueByPath(data, _path) : data?.[_path]) : _v;
        if (_v == undefined) {
            return null;
        }
        return _v;
    }, [data]);

    return (
        <OuterDiv error={error}>
            <div style={{ display: "flex", margin: "3px", ...outerStyle }}>
                {(_value == "formulacao_formulation_change") && <>
                    <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="#108ee9"><div>Formulação</div></TagButton>
                </>}
                {(_value == "formulacao_dosers_change") && <>
                    <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="#108ee9"><div>Doseadores</div></TagButton>
                </>}
                {(_value == "created") && <>
                    <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="#108ee9"><div>Criada</div></TagButton>
                </>}
                {(_value == "status_finished") && <>
                    <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="#108ee9"><div>Finalizada</div></TagButton>
                </>}
                {(_value == "status_inproduction") && <>
                    <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="#108ee9"><div>Em Produção</div></TagButton>
                </>}
                {(_value == "status_stopped") && <>
                    <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="#108ee9"><div>Suspensa</div></TagButton>
                </>}
                {(_value == "gamaoperatoria") && <>
                    <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="#108ee9"><div>Gama Operatória</div></TagButton>
                </>}
                {(_value == "cortes") && <>
                    <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="#108ee9"><div>Cortes</div></TagButton>
                </>}
                {(_value == "nonwovens") && <>
                    <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="#108ee9"><div>Nonwovens</div></TagButton>
                </>}
                {(_value == "settings_of_change") && <>
                    <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="#108ee9"><div>Definições</div></TagButton>
                </>}
                {(_value == "specs") && <>
                    <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="#108ee9"><div>Especificações</div></TagButton>
                </>}
                {(_value == "delete") && <>
                    <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="#108ee9"><div>Apagada</div></TagButton>
                </>}
            </div>
        </OuterDiv>
    );
}

export const OrdemFabricoStatus = ({ field: { status, aggCod, ofId } = {}, params: { column: col, data, node, rowIndex } = {}, style, className, onClick }) => {
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onClick(event)
        }
    }
    return (
        <OuterDiv error={error}>
            <div style={{ display: "flex", flexDirection: "column", margin: "2px",lineHeight:1.3 }}>
                {ofId && <span style={{ fontSize: "14px", fontWeight: 900 }}>{data?.[ofId]}</span>}
                {(data?.[status] == 0) && <>
                    {aggCod && <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} icon={<CheckOutlined />} color="#108ee9">{aggCod && <div>{data?.[aggCod]}</div>}<div>Validar</div></TagButton>}
                    {!aggCod && <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} icon={<CheckOutlined />} color="#108ee9">Validar</TagButton>}
                </>}
                {(data?.[status] == 1) && <>
                    {aggCod && <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} icon={<UnorderedListOutlined />} color="warning">{aggCod && <div>{data?.[aggCod]}</div>}<div>Em Elaboração</div></TagButton>}
                    {!aggCod && <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} icon={<UnorderedListOutlined />} color="warning">Em Elaboração</TagButton>}
                </>}
                {(data?.[status] == 2 && data?.was_in_production == 0) && <>
                    {aggCod && <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} icon={<UnorderedListOutlined />} color="orange">{aggCod && <div>{data?.[aggCod]}</div>}<div>Na Produção</div></TagButton>}
                    {!aggCod && <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} icon={<UnorderedListOutlined />} color="orange">Na Produção</TagButton>}
                </>}
                {(data?.[status] == 2 && data?.was_in_production == 1) && <>
                    {aggCod && <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} icon={<PauseOutlined />} color="orange">{aggCod && <div>{data?.[aggCod]}</div>}<div>Suspensa</div></TagButton>}
                    {!aggCod && <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} icon={<PauseOutlined />} color="orange">Suspensa</TagButton>}
                </>}
                {(data?.[status]) == 3 && <>
                    {aggCod && <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} icon={<SyncOutlined spin />} color="success">{aggCod && <div>{data?.[aggCod]}</div>}<div>Em Produção</div></TagButton>}
                    {!aggCod && <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} icon={<SyncOutlined spin />} color="success">Em Produção</TagButton>}
                </>}
                {(data?.[status]) == 9 && <>
                    {aggCod && <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="error">{aggCod && <div>{data?.[aggCod]}</div>}<div>Finalizada</div></TagButton>}
                    {!aggCod && <TagButton {...genericProps({ width: "110px", textAlign: "center" }, onClick, onKeyDown, style, _classNames)} color="error">Finalizada</TagButton>}
                </>}
            </div>
        </OuterDiv>
    );
}

export const ClienteArtigo = ({ field: { clienteCod, clienteNome, artigoCod, artigoDes } = {}, params: { column: col, data, node, rowIndex } = {}, style, className, onClick }) => {
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onClick(event)
        }
    }
    return (
        <OuterDiv error={error}>
            <div {...genericProps({ display: "flex", flexDirection: "column"/* , margin: "3px" */,lineHeight:1.3 }, onClick, onKeyDown, style, _classNames)}>
                {(clienteNome || clienteCod) && <div style={{ fontWeight: 700, fontSize: "14px", color: "#000" }}><span style={{ fontWeight: 400 }}>{clienteCod && data?.[clienteCod]}</span> {clienteNome && data?.[clienteNome]}</div>}
                {(artigoCod || artigoDes) && <div style={{fontSize:"12px"}}><span>{artigoCod && data?.[artigoCod]}</span><span style={{ marginLeft: "10px" }}>{artigoDes && data?.[artigoDes]?.replace(new RegExp(`Nonwoven Elastic Bands |Nonwoven Elastic Band |NW Elastic Bands `, "gi"), "")}</span></div>}
            </div>
        </OuterDiv>
    );
}

export const Encomenda = ({ field: { ofCod, orderCod, prfCod } = {}, params: { column: col, data, node, rowIndex } = {}, style, className, onClick }) => {
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onClick(event)
        }
    }
    return (
        <OuterDiv error={error}>
            <div {...genericProps({ display: "flex", flexDirection: "column"/* , margin: "3px" */,lineHeight:1.3 }, onClick, onKeyDown, style, _classNames)}>
                {(prfCod || ofCod) && <div style={{ fontWeight: 700, color: "#000", fontSize: "14px" }}>{ofCod && <span style={{ fontSize: "12px", fontWeight: "400", marginRight: "10px" }}>{data?.[ofCod]}</span>}{prfCod && data?.[prfCod]}</div>}
                {(orderCod) && <div><span style={{fontSize:"12px"}}>{data?.[orderCod]}</span></div>}
            </div>
        </OuterDiv>
    );
}

export const Options = ({ params: { column: col, data, node } = {}, color, integer, column, value, style, bold, className, onClick, map }) => {
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const { validation, map: mp } = col.getDefinition().cellRendererParams || {};
    const _map = map ? map : mp;
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
        if (_map) {
            return _map?.[integer ? getInt(_v) : _v];
        }
        return { label: integer ? getInt(_v) : _v };
    }, [data]);

    return (<div title={error && error.message} style={{ width: "100%", height: "100%", ...error && { backgroundColor: "#ffa39e", borderRadius: "5px" } }}><Tag {...color && { color }} {...genericProps({ ...bold && { fontWeight: 700 } }, onClick, onKeyDown, style, _classNames)} {..._value?.props}>{_value?.label}</Tag></div>);
}

export const ArrayTags = ({ params = {}, color, isObject = false, value, column, style, className, onClick, valueProperty = "value", labelProperty = "label" }) => {
    const { column: col, data, rowIndex, node } = params;
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const { modeApi, check, checkKey, checks, updateChecks, editColumControl } = col.getDefinition().cellRendererParams || {};
    const _checkKey = checkKey ? checkKey : col.getDefinition().field;
    const isOnMode = useMemo(() => {
        if (col.getDefinition()?.editable) {
            return modeApi?.isOnMode() && col.getDefinition().editable(params);
        }
        return false;
    }, [modeApi?.isOnMode()]);

    const onCheckChange = useCallback((e) => {
        if (e.target.checked) {
            updateChecks(draft => {
                if (!draft[_checkKey].includes(node.id)) {
                    draft[_checkKey].push(node.id);
                    draft.timestamp = new Date();
                }
            });
        } else {
            updateChecks(draft => {
                draft[_checkKey] = draft[_checkKey].filter(item => item !== node.id);
                draft.timestamp = new Date();
            });
        }
    }, []);

    const _checkValue = useMemo(() => {
        if (check) {
            return (checks[_checkKey].includes(node.id)) ? true : false;
        }
        return false;
    }, [checks?.[_checkKey]?.length]);

    const onColumControl = () => {
        params.api.startEditingCell({
            rowIndex: params.rowIndex,
            colKey: col.colId
        })
    }



    const onKeyDown = (event, a) => {
        if (event.keyCode === 13) {
            onClick(a)
        }
    }

    const _values = useMemo(() => {
        let _v = value;
        const _path = columnPath(col);
        _v = (_v === undefined && col && data) ? (typeof column === "string") ? valueByPath(data, column) : (columnHasPath(col) ? valueByPath(data, _path) : data?.[_path]) : _v;
        if (_v == undefined) {
            return null;
        }
        return json(_v);
    }, [data]);


    return (<OuterDiv style={{ display: "flex" }} error={error}>
        <div onClick={editColumControl && onColumControl} style={{ flex: 1 }}>
            {(Array.isArray(_values)) && _values.map((v, i) => <Tag {...color && { color }} {...genericProps({ fontWeight: 600 },
                onClick ? () => onClick && onClick({ data: v }) : null,
                (e) => onKeyDown(e, { data: v }), style, _classNames)}
                key={`va-${rowIndex}-${isObject ? v?.[valueProperty] : v}-${i}`}
            >{isObject ? v?.[labelProperty] : v}</Tag>)}
        </div>
        {(isOnMode && check) && <Checkbox defaultChecked={false} checked={_checkValue} onChange={onCheckChange} />}
    </OuterDiv>);
}

export const Action = ({ params: { column: col, data, node } = {}, icon, onClick, items = [] }) => {

    return (

        <Dropdown menu={{ items: (Array.isArray(items) ? items : items()), onClick }} placement="bottomLeft" trigger={["click"]}>
            <Button size='small' icon={icon ? icon : <EllipsisOutlined />} />
        </Dropdown>

    )

}

export const ActionButton = ({ params: { column: col, data, node } = {}, text, icon, onClick, buttonProps }) => {

    return (
        <Button size='small' onClick={onClick} icon={icon ? icon : <EllipsisOutlined />} {...buttonProps}>{text && text}</Button>
    )
}

export const Value = ({ params = {}, column, detailColumn, detailValue, value, unit, style, className, addonAfter, addonBefore, link, bold, fixed, align = "left", onClick, datetime, outerStyle }) => {
    const { column: col, data, rowIndex, node } = params;
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const { format = DATETIME_FORMAT, editColumControl } = col?.getDefinition()?.cellRendererParams || {};
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
        if (_v == undefined) {
            return null;
        }
        if (datetime) {
            _v = (_v && dayjs(_v).isValid()) && dayjs(_v).format(format);
        } else {
            if (fixed && parseFloat(_v)) {
                return parseFloat(_v).toFixed(fixed);
            }
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

    const onColumControl = () => {
        params.api.startEditingCell({
            rowIndex: params.rowIndex,
            colKey: col.colId
        })
    }

    if (link) {
        return (
            <div onClick={editColumControl && onColumControl} style={{ width: "100%", height: "100%", ..._detail !== null && { lineHeight: 1.3 }, outerStyle }}>
                <Button title={error && error.message} size='small' type='link' {...genericProps({ textAlign: align, height: "16px", lineHeight: 1.3, fontSize: "12px", ...error && { backgroundColor: "#ffa39e", borderRadius: "5px" }, ...bold && { fontWeight: 700 } }, onClick, onKeyDown, style, _classNames)}>{(_value !== null) && addonBefore}{_value}{((unit && _value !== null) && unit)}{(_value !== null) && addonAfter}</Button>
                {_detail !== null && <div style={{ padding: "0px 7px" }}>{_detail}</div>}
            </div>
        );
    }
    return (
        <OuterDiv error={error}>
            <div onClick={editColumControl && onColumControl} style={{ textAlign: align, width: "100%", height: "100%", ..._detail !== null && { lineHeight: 1.3 }, ...outerStyle }}>
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

export const Cortes = ({ params: { column: col, data, node, rowIndex } = {}, column, value, style, outerStyle, className, onClick }) => {
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const onKeyDown = (event, a, b) => {
        if (event.keyCode === 13) {
            onClick(a, b)
        }
    }

    const _value = useMemo(() => {
        let _v = value;
        const _path = columnPath(col);
        _v = (_v === undefined && col && data) ? (typeof column === "string") ? valueByPath(data, column) : (columnHasPath(col) ? valueByPath(data, _path) : data?.[_path]) : _v;
        return json(_v);
    }, [data]);

    return (<OuterDiv error={error}>
        {(_value && Object.keys(_value)) && Object.keys(_value).map((v, i) => <div key={`crt-${rowIndex}-${i}`} style={{ height: "100%", ...outerStyle }}>
            <Tag
                {...genericProps({ fontWeight: 600 },
                    onClick ? () => onClick && onClick("cortes", { data: _value[v] }) : null,
                    (e) => onKeyDown(e, "cortes", { data: _value[v] }), style, _classNames)}
            >L<span style={{ fontWeight: 700 }}>{v}</span> x {_value[v]}</Tag>
        </div>)}
    </OuterDiv>);
}

export const CortesOrdem = ({ params: { column: col, data, node, rowIndex } = {}, column, value, style, className, width = 1000, onClick }) => {
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    let _alternate = 0;
    const onKeyDown = (event, a, b) => {
        if (event.keyCode === 13) {
            onClick(a, b)
        }
    }

    const _value = useMemo(() => {
        let _v = value;
        const _path = columnPath(col);
        _v = (_v === undefined && col && data) ? (typeof column === "string") ? valueByPath(data, column) : (columnHasPath(col) ? valueByPath(data, _path) : data?.[_path]) : _v;
        return json(_v);
    }, [data]);

    const _largura_util = useMemo(() => {
        if (!_value) {
            return 1;
        }
        return _value.reduce((accumulator, currentValue) => {
            return accumulator + parseInt(currentValue);
        }, 0);
    }, [_value]);

    return (<OuterDiv error={error}>
        <div style={{ width: `${width}px`, background: "#f0f0f0", borderRight: "solid 4px red", height: "100%" }}>
            <div {...genericProps({ display: "flex", width: `${parseInt((_largura_util * width) / 2100)}px` }, onClick ? () => onClick && onClick("cortes_ordem", { data: _value }) : null, (e) => onKeyDown(e, "cortes_ordem", { data: _value }), style, _classNames)}>
                {_value && _value.map((v, i) => {
                    if (_value?.[i - 1] !== _value?.[i]) {
                        _alternate = _alternate == 0 ? 1 : 0;
                    }
                    return (<div style={{ minWidth: "30px", padding: "0px 1px", flex: `${(parseInt(v) * 1) / _largura_util}%` }} key={`crto-${rowIndex}-${i}`}>
                        <div style={{ textAlign: "center", borderRadius: "2px", backgroundColor: _alternate == 0 ? "#0050b3" : "#003a8c", color: _alternate == 0 ? "#ffffff" : "#ffffff" }}>{v}</div>
                    </div>);
                })}
            </div>
        </div>
    </OuterDiv>);
}

export const BadgeNumber = ({ params: { column: col, data, node } = {}, column, value, unit, style, className, bold, align = "center", onClick }) => {
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

export const BadgeCount = ({ params = {}, column, value, unit, style, className, bold, align = "center", onClick }) => {
    const { column: col, data, rowIndex, node } = params;
    const classes = useStyles();
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const { modeApi, check, checkKey, checks, updateChecks, editColumControl } = col.getDefinition().cellRendererParams || {};
    const _checkKey = checkKey ? checkKey : col.getDefinition().field;
    const error = useValidation(node, col);
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onClick(event)
        }
    }
    const isOnMode = useMemo(() => {
        if (col.getDefinition()?.editable) {
            return modeApi?.isOnMode() && col.getDefinition().editable(params);
        }
        return false;
    }, [modeApi?.isOnMode()]);
    const onCheckChange = useCallback((e) => {
        if (e.target.checked) {
            updateChecks(draft => {
                if (!draft[_checkKey].includes(node.id)) {
                    draft[_checkKey].push(node.id);
                    draft.timestamp = new Date();
                }
            });
        } else {
            updateChecks(draft => {
                draft[_checkKey] = draft[_checkKey].filter(item => item !== node.id);
                draft.timestamp = new Date();
            });
        }
    }, []);

    const _checkValue = useMemo(() => {
        if (check) {
            return (checks[_checkKey].includes(node.id)) ? true : false;
        }
        return false;
    }, [checks?.[_checkKey]?.length]);

    const onColumControl = () => {
        params.api.startEditingCell({
            rowIndex: params.rowIndex,
            colKey: col.colId
        })
    }

    const _value = useMemo(() => {
        let _v = value;
        _v = (_v === undefined && col && data) ? (typeof column === "string") ? valueByPath(data, column) : data?.[col.getDefinition().field] : _v;
        return Array.isArray(_v) ? _v.length : null;
    }, [data]);


    return (<OuterDiv error={error} style={{ textAlign: align, display: "flex" }}>
        <div style={{ flex: 1, height: "100%" }} onClick={editColumControl && onColumControl}>
            <div {...genericProps({ ...bold && { fontWeight: 700 } }, !isOnMode && onClick, onKeyDown, style, _classNames)}>
                <Badge count={_value} />{((unit && _value !== null) && unit)}
            </div>
        </div>
        {(isOnMode && check) && <Checkbox defaultChecked={false} checked={_checkValue} onChange={onCheckChange} />}
    </OuterDiv>);
}

const _valueFromTo = (value, datetime, format) => {
    let _v = value;
    if (datetime) {
        _v = (_v && dayjs(_v).isValid()) && dayjs(_v).format(format);
    } else {
        _v = (isNullOrEmpty(value)) ? 0 : value;
    }
    return _v;
};
export const FromTo = ({ field: { from, to } = {}, params: { column: col, data, node } = {}, style, bold, align = "left", separator = "/", className, addonAfter, datetime, addonBefore, onClick, unit, pad = 2, colorize = false, color = "#000", colorGreater = "#b7eb8f", colorLess = "#ffa39e" }) => {
    let _color = color;
    const classes = useStyles();
    const { format = DATETIME_FORMAT, editColumControl } = col.getDefinition().cellRendererParams || {};
    const _classNames = classNames({ [className]: className, [classes.focus]: onClick });
    const error = useValidation(node, col);
    const _from = _valueFromTo(data?.[from], datetime, format);
    const _to = _valueFromTo(data?.[to], datetime, format);

    if (colorize) {
        _color = (_from < _to) ? colorLess : colorGreater;
    }
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onClick(event)
        }
    }

    if (datetime) {
        return (<OuterDiv style={{ textAlign: align }}><span {...genericProps({ ...bold && { fontWeight: 700 } }, onClick, onKeyDown, style, _classNames)}>
            {addonBefore}
            <span style={{ ...colorize && { padding: "2px", borderRadius: "2px", backgroundColor: _color } }}><b>{_from}</b>{separator}{_to}</span>
            {addonAfter}
        </span>
        </OuterDiv>)
    }


    return (<OuterDiv style={{ textAlign: align }}><span {...genericProps({ ...bold && { fontWeight: 700 } }, onClick, onKeyDown, style, _classNames)}>
        {addonBefore}
        <span style={{ ...colorize && { padding: "2px", borderRadius: "2px", backgroundColor: _color } }}><b>{String(_from).padStart(pad, '0')}</b>{separator}{String(_to).padStart(pad, '0')}</span>
        {(unit && unit)}{addonAfter}
    </span>
    </OuterDiv>);




    //return (<div style={{ textAlign: "left", ...style }} {...className && { className }}></div>;
}

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

export const EstadoBobine = ({ field: { estado, largura } = {}, params = {}, align = "center", ...props }) => {
    const { column: col, data, rowIndex, node } = params;
    const error = useValidation(node, col);
    const _data = { artigo: [{ estado: valueByPath(data, estado), lar: valueByPath(data, largura) }] };
    const { modeApi, check, checkKey, checks, updateChecks, editColumControl } = col.getDefinition().cellRendererParams || {};
    const _checkKey = checkKey ? checkKey : col.getDefinition().field;
    const isOnMode = useMemo(() => {
        if (col.getDefinition()?.editable) {
            return modeApi?.isOnMode() && col.getDefinition().editable(params);
        }
        return false;
    }, [modeApi?.isOnMode()]);

    const onCheckChange = useCallback((e) => {
        if (e.target.checked) {
            updateChecks(draft => {
                if (!draft[_checkKey].includes(node.id)) {
                    draft[_checkKey].push(node.id);
                    draft.timestamp = new Date();
                }
            });
        } else {
            updateChecks(draft => {
                draft[_checkKey] = draft[_checkKey].filter(item => item !== node.id);
                draft.timestamp = new Date();
            });
        }
    }, []);

    const _checkValue = useMemo(() => {
        if (check) {
            return (checks[_checkKey].includes(node.id)) ? true : false;
        }
        return false;
    }, [checks?.[_checkKey]?.length]);

    const onColumControl = () => {
        params.api.startEditingCell({
            rowIndex: params.rowIndex,
            colKey: col.colId
        })
    }

    return (<OuterDiv style={{ display: "flex" }} error={error}>
        <div onClick={editColumControl && onColumControl} style={{ flex: 1 }}>
            <EstadoBobines field={{ artigos: "artigo" }} params={{ column: col, data: _data, rowIndex, node }} align={align} {...props} />
        </div>
        {(isOnMode && check) && <Checkbox defaultChecked={false} checked={_checkValue} onChange={onCheckChange} />}
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
    return (<div style={{ whiteSpace: "pre-wrap" }}>{value}</div>)
}
export const MultiLine = ({ params = {}, column, value, style, className, bold, align = "left", type = "drawer", dataType = "text", width = 500, height = 300, }) => {
    const { column: col, data, api, node } = params;
    const _classNames = classNames({ [className]: className });
    const { modalApi, modeApi, check, checkKey, checks, updateChecks, editColumControl } = col.getDefinition().cellRendererParams || {};
    const error = useValidation(node, col);
    const _checkKey = checkKey ? checkKey : col.getDefinition().field;
    const isOnMode = useMemo(() => {
        if (col.getDefinition()?.editable) {
            return modeApi?.isOnMode() && col.getDefinition().editable(params);
        }
        return false;
    }, [modeApi?.isOnMode()]);

    const onCheckChange = useCallback((e) => {
        if (e.target.checked) {
            updateChecks(draft => {
                if (!draft[_checkKey].includes(node.id)) {
                    draft[_checkKey].push(node.id);
                    draft.timestamp = new Date();
                }
            });
        } else {
            updateChecks(draft => {
                draft[_checkKey] = draft[_checkKey].filter(item => item !== node.id);
                draft.timestamp = new Date();
            });
        }
    }, []);

    const _checkValue = useMemo(() => {
        if (check) {
            return (checks[_checkKey].includes(node.id)) ? true : false;
        }
        return false;
    }, [checks?.[_checkKey]?.length]);

    const onColumControl = () => {
        params.api.startEditingCell({
            rowIndex: params.rowIndex,
            colKey: col.colId
        })
    }


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

    const onOpen = () => {
        const _t = api.getFocusedCell();
        modalApi.setModalParameters({ content: <MultiText dataType={dataType} value={_value} />, title: col.getDefinition().headerName, type: type, width: width, height: height, parameters: { gridApi: api, cellFocus: { rowIndex: _t.rowIndex, colId: _t.column.colId } } });
        modalApi.showModal();
    }

    return (<OuterDiv style={{ display: "flex" }} error={error}>
        <div onClick={editColumControl && onColumControl} style={{ flex: 1 }}>
            <div {...!isOnMode && { onClick: onOpen, onKeyDown }} tabIndex="0" {...genericProps({ textAlign: align, cursor: "pointer", ...bold && { fontWeight: 700 } }, null, null, style, _classNames)}>{_value}</div>
        </div>
        {(isOnMode && check) && <Checkbox defaultChecked={false} checked={_checkValue} onChange={onCheckChange} />}
    </OuterDiv>
    );
}


export const ModalMultiRangeView = ({ value, unit, minValue, maxValue, extraFields, wndRef, closeSelf, ...props }) => {
    const submitting = useSubmitting(true);
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({ items: [...value].reverse() });
        submitting.end();
    }, []);

    return (<>
        <FormContainer fluid form={form} forInput={false} wrapForm={true} wrapFormItem={true} style={{}}>
            <Row style={{}} gutterWidth={10}>
                <Col>
                    <Form.List name="items">
                        {(fields, { add, remove, move }) => {
                            // const addRow = (fields) => {
                            //     if (fields.length === 0 && type == "furos") {
                            //         add({ [`min`]: 1, [`max`]: p.row.comp_actual, "unit": unit });
                            //     } else {
                            //         add({ [`min`]: null, [`max`]: null, "unit": unit, ...(type == "ff" && { "type": "Desbobinagem" }) });
                            //     }
                            // }
                            // const removeRow = (fieldName, field) => {
                            //     remove(fieldName);
                            // }
                            // const moveRow = (from, to) => {
                            //     //move(from, to);
                            // }
                            return (
                                <>
                                    <div style={{ height: "300px" }}>
                                        <YScroll>
                                            {fields.map((field, index) => (
                                                <Row key={field.key} gutterWidth={1}>
                                                    <Col width={20} style={{ alignSelf: "center", fontWeight: 700 }}>{index + 1}</Col>
                                                    <Col xs="content"><Field name={[field.name, `min`]} label={{ enabled: false }}><InputNumber autoFocus size="small" style={{ width: "110px", textAlign: "right" }} controls={false} addonAfter={<b>{unit}</b>} min={minValue} max={maxValue} /></Field></Col>
                                                    <Col xs="content"><Field name={[field.name, `max`]} label={{ enabled: false }} includeKeyRules={['min']} allValues={{ min: form.getFieldValue(['items', index, 'min']) }}><InputNumber size="small" style={{ width: "110px", textAlign: "right" }} controls={false} addonAfter={<b>{unit}</b>} min={minValue} max={maxValue} /></Field></Col>
                                                    {extraFields?.type && <Col xs="content"><Field name={[field.name, `type`]} label={{ enabled: false }}><Select size="small" style={{ width: "150px", textAlign: "right" }} options={[{ value: "Bobinagem" }, { value: "Desbobinagem" }]} /></Field></Col>}
                                                </Row>
                                            ))}
                                        </YScroll>
                                    </div>
                                </>
                            )
                        }
                        }
                    </Form.List>
                </Col>
            </Row>
        </FormContainer>
        {wndRef && <Portal elId={wndRef.current}>
            <Space>
                <Button disabled={submitting.state} onClick={closeSelf}>Fechar</Button>
            </Space>
        </Portal>}
    </>
    );
}