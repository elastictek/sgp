import React, { useEffect, useState, useCallback, useRef, useContext, useMemo, useImperativeHandle } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith, clone, isNil, is } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { useSubmitting, populateArray, isNullOrEmpty } from "utils";
import loadInit, { fixRangeDates, newWindow } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH, ROOT_URL } from "config";
import { json, includeObjectKeys, valueByPath } from "utils/object";
import { Button, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
import { PrinterOutlined, SearchOutlined, StopOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';

import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { useImmer } from "use-immer";
import { rules, validate, validateList, validateRows } from 'utils/useValidation';
import { useDataAPI, parseFilter } from 'utils/useDataAPIV4';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';
import Page, { Container as FormContainer, Field, Label, Lookup, SelectorPopup, SelectorComponentPopup } from 'components/FormFields/FormsV2';
import { Value } from 'components/TableV4/TableColumnsV4';
import { z } from "zod";
import { FormPrint, printersList } from 'components/FormFields';
import useModalApi from 'utils/useModalApi';


export const ListColumns = styled.div`
    column-count: ${(props) => Math.ceil(props.$nItems / 20) >= props.$columns ? props.$columns : Math.ceil(props.$nItems / 20)};
    column-gap: 10px;
    column-width: ${(props) => props.$columnWidth}px;
    ${props => Math.ceil(props.$nItems / 20) >= 6 &&
        css`
            @media (max-width: ${(props) => props.$columnWidth * 7 + 100}px) {
                column-count: 6;
            }
        `}
    ${props => Math.ceil(props.$nItems / 20) >= 5 &&
        css`
        @media (max-width: ${(props) => props.$columnWidth * 6 + 100}px) {
            column-count: 5;
        }
    `}
    ${props => Math.ceil(props.$nItems / 20) >= 4 &&
        css`
            @media (max-width: ${(props) => props.$columnWidth * 5 + 100}px) {
                column-count: 4;
            }
        `}
    ${props => Math.ceil(props.$nItems / 20) >= 3 &&
        css`
        @media (max-width: ${(props) => props.$columnWidth * 4 + 100}px) {
            column-count: 3;
        }
    `}
    ${props => Math.ceil(props.$nItems / 20) >= 2 &&
        css`
        @media (max-width: ${(props) => props.$columnWidth * 3 + 100}px) {
            column-count: 2;
        }
    `}
    ${props => Math.ceil(props.$nItems / 20) >= 1 &&
        css`
            @media (max-width: ${(props) => props.$columnWidth * 2 + 100}px) {
                column-count: 1;
            }
        `}
`;

const styleItemStatus = (input, index, focusIndex, disabled) => {
    const _focused = { ...(index === focusIndex && !disabled) && { border: "solid 2px #1890ff" } };
    if (input.status.error) {
        return { backgroundColor: "#ff7875", border: "solid 1px #595959", ..._focused };
    } else {
        if (input.picked === false) {
            return { backgroundColor: "#ff7875", border: "solid 1px #595959", ..._focused };
        } else if (input.picked === true) {
            return { border: "solid 1px #595959", ..._focused };
        }
    }
    return { ..._focused };
}

const SearchButton = ({onClick}) =>{
    return(
        <Button onClick={onClick} icon={<SearchOutlined />}/>
    )
}

export const PickMax = React.forwardRef(({ disabled = false, initialInputs, onInputChange, selectorPopupComponent, popupProps, popupValuePath, n, pattern, duplicates = false, allowEmpty = false, onPick, rowNumber = true, rowNumberFn, rowNumberWidth = 30, adjustWidth = 10, columnWidth = 300, width = "100%", height = "80vh" }, ref) => {
    const inputRef = useRef();
    const inputsRef = useRef();
    const [state, updateState] = useState({ value: null, focusIndex: 0, timestamp: Date.now() });
    const submitting = useSubmitting(true);

    useImperativeHandle(ref, () => ({
        inputRef,
        inputsRef
    }));



    useEffect(() => {
        const _initialLength = Array.isArray(initialInputs) ? initialInputs.length : 0;
        if (_initialLength > 0) {
            inputsRef.current = {
                picked: _initialLength, n, errors: 0, items: Array(n).fill().map((v, i) => ({
                    ...(typeof initialInputs[i] == "object" && !isNullOrEmpty(initialInputs[i])) ? initialInputs[i] : { item: initialInputs[i], picked: true, status: { error: false, description: "" } }
                }))
            };
            updateState(prev => ({ ...prev, value: (typeof initialInputs[0] == "object" && !isNullOrEmpty(initialInputs[0])) ? initialInputs[0]?.item : initialInputs[0] }));
        } else {
            inputsRef.current = { picked: 0, n, errors: 0, items: Array(n).fill().map((v, i) => ({ item: null, picked: null, status: { error: false, description: "" } })) };
        }
        submitting.end();
    }, []);

    const update = (index, v) => {
        updateState({
            ...state,
            value: v,
            ...!isNil(index) && { focusIndex: index },
            timestamp: Date.now()
        });
        if (onPick && typeof onPick == "function") {
            onPick({ data: inputsRef.current, newValue: v, newIndex: index, index, value });
        }
    }

    const onItemClick = (e, v, index) => {
        checkInput(state.value, state.focusIndex);
        update(index, v);
    }

    const checkInput = (v, index) => {
        if (index == -1) {
            if (onInputChange && typeof onInputChange == "function") {
                onInputChange(v, index, state);
            }
            return;
        }
        const _hasError = inputsRef.current.items[index].status.error;
        const t = (pattern && (!isNullOrEmpty(v) || !allowEmpty)) ? pattern.test(v) : true;

        inputsRef.current.items[index].item = v;
        inputsRef.current.items[index].picked = t;
        inputsRef.current.items[index].status.error = !t;
        inputsRef.current.items[index].status.description = (t) ? "" : "Erro no padrão de entrada";
        if (t && !duplicates) {
            const _duplicated = inputsRef.current.items.some((x, idx) => x.item === v && idx !== index);
            inputsRef.current.picked = ((_hasError && _duplicated) || (!_hasError && !_duplicated)) ? inputsRef.current.picked : (!_hasError && _duplicated) ? inputsRef.current.picked - 1 : inputsRef.current.picked + 1;
            inputsRef.current.items[index].picked = !_duplicated;
            inputsRef.current.items[index].status.error = _duplicated;
            inputsRef.current.items[index].status.description = (!_duplicated) ? "" : "Entrada duplicada";
        }
        inputsRef.current.errors = inputsRef.current.items.filter(x => x.status.error === true).length;
        inputsRef.current.picked = inputsRef.current.items.filter(x => x.picked === true).length;
        if (onInputChange && typeof onInputChange == "function") {
            onInputChange(v, index, state);
        }
    }

    const _onInputOk = (e) => {
        if (e.key) {
            if (["Enter", "Tab"].includes(e.key)) {
                e.preventDefault();
                if (e.shiftKey) {
                    checkInput(state.value, state.focusIndex);
                    if (state.focusIndex == 0) {
                        updateState({ ...state, timestamp: Date.now(), focusIndex: -1 });
                        return;
                    }
                    update(state.focusIndex - 1, inputsRef.current.items[state.focusIndex - 1].item);
                } else {
                    checkInput(state.value, state.focusIndex);
                    if (n === state.focusIndex + 1) {
                        updateState({ ...state, timestamp: Date.now(), focusIndex: -1 });
                        return;
                    }
                    update(state.focusIndex + 1, inputsRef.current.items[state.focusIndex + 1].item);
                }
            }

        }
    }

    const _onInput = (v, index) => {
        inputsRef.current.items[index].item = v;
        update(null, v);
    }

    const onContainerClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }

    const onFocus = (e) => {
        e.target.select();
    }

    const columns = useMemo(() => {
        return Math.floor(n / 16) + 1;
    }, [n]);

    const onPopupSelect = (v) => {
        const _value = valueByPath(v, popupValuePath);
        inputsRef.current.items[state.focusIndex].item = _value;
        inputRef.current.value = _value;
        inputRef.current.focus();
        update(null, _value);
    }

    return (
        <Row onClick={onContainerClick} nogutter style={{}}>
            <Col style={{ justifyContent: "center", display: "flex" }}>
                <YScroll width={width} height={height}>
                    <Row nogutter style={{ justifyContent: "center" }}>
                        <Col xs="content">
                            <ListColumns $nItems={n} $columnWidth={columnWidth} $columns={columns}>
                                {!submitting.state && inputsRef.current.items.map((v, index) => {
                                    return (<Row style={{ fontSize: "14px", height: "32px", padding: "1px", breakInside: "avoid" }} key={`pi-${index}`} nogutter>
                                        <Col width={columnWidth} style={{ border: "dashed 1px #bfbfbf", alignItems: "center", display: "flex", ...styleItemStatus(v, index, state.focusIndex, disabled) }} >
                                            <Row nogutter>
                                                {rowNumber && <Col width={rowNumberWidth} style={{ alignSelf: "center", fontWeight: 900, cursor: "pointer", paddingLeft: "5px" }} {...!disabled && { onClick: (e) => onItemClick(e, v.item, index) }}>{(rowNumberFn) ? rowNumberFn(index, v.item) : index + 1}</Col>}
                                                <Col style={{ alignSelf: "center" }} {...(!rowNumber && !disabled) && { onClick: (e) => onItemClick(e, v.item, index) }}>
                                                    {(state.focusIndex === index && !disabled) ?
                                                        <div style={{ display: "flex" }}>
                                                            <Input {...disablePaste && { onPaste }} onFocus={onFocus} disabled={disabled} ref={inputRef} style={{ width: `${columnWidth - (rowNumber ? rowNumberWidth + adjustWidth : adjustWidth)}px`, border: 'none', boxShadow: 'none', background: "none" }} value={state.value} autoFocus onChange={(e) => _onInput(e.target.value, index, e)} onKeyDown={(e) => _onInputOk(e, index)} />
                                                            {(selectorPopupComponent && popupValuePath && !disabled) && <SelectorComponentPopup customSearch={<SearchButton/>} popupProps={{ type: "drawer", width: "95%", ...popupProps }} allowClear={true} keyField={popupValuePath} component={React.cloneElement(selectorPopupComponent, { ...selectorPopupComponent.props, onSelectionChanged: onPopupSelect })} />}
                                                        </div>
                                                        :
                                                        <span style={{ paddingLeft: "10px" }}>{v.item}</span>}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>);
                                })}
                            </ListColumns>
                        </Col>
                    </Row>
                </YScroll>
            </Col>
        </Row>
    );
});

export default React.forwardRef(({ disabled = false, disablePaste = false, initialInputs, selectorPopupComponent, popupProps, onInputChange, popupValuePath, n, pattern, duplicates = false, allowEmpty = false, onPick, rowNumber = true, rowNumberFn, rowNumberWidth = 30, adjustWidth = 10, columnWidth = 300, width = "100%", height = "80vh" }, ref) => {
    const inputRef = useRef();
    const inputsRef = useRef();
    const [state, updateState] = useState({ value: null, focusIndex: 0, timestamp: Date.now() });
    const submitting = useSubmitting(true);

    useImperativeHandle(ref, () => ({
        inputRef,
        inputsRef
    }));



    useEffect(() => {
        if (n !== inputsRef.current?.n) {
            const _initialLength = Array.isArray(initialInputs) ? initialInputs.length : 0;
            if (_initialLength == n) {
                inputsRef.current = {
                    picked: _initialLength, n, errors: 0, items: Array(n).fill().map((v, i) => ({
                        ...(typeof initialInputs[i] == "object" && !isNullOrEmpty(initialInputs[i])) ? initialInputs[i] : { item: initialInputs[i], picked: true, status: { error: false, description: "" } }
                    }))
                };
                updateState(prev => ({ ...prev, value: (typeof initialInputs[0] == "object" && !isNullOrEmpty(initialInputs[0])) ? initialInputs[0]?.item : initialInputs[0] }));
            } else {
                inputsRef.current = { picked: 0, n, errors: 0, items: Array(n).fill().map((v, i) => ({ item: null, picked: null, status: { error: false, description: "" } })) };
            }
        }
        submitting.end();
    }, []);

    const update = (index, v) => {
        updateState({
            ...state,
            value: v,
            ...!isNil(index) && { focusIndex: index },
            timestamp: Date.now()
        });
        if (onPick && typeof onPick == "function") {
            onPick({ data: inputsRef.current, newValue: v, newIndex: index, index, value });
        }
    }

    const onItemClick = (e, v, index) => {
        checkInput(state.value, state.focusIndex);
        update(index, v);
    }

    const checkInput = (v, index) => {
        if (index == -1) {
            if (onInputChange && typeof onInputChange == "function") {
                onInputChange(v, index, state);
            }
            return;
        }
        const _hasError = inputsRef.current.items[index].status.error;
        const t = (pattern && (!isNullOrEmpty(v) || !allowEmpty)) ? pattern.test(v) : true;

        inputsRef.current.items[index].item = v;
        inputsRef.current.items[index].picked = t;
        inputsRef.current.items[index].status.error = !t;
        inputsRef.current.items[index].status.description = (t) ? "" : "Erro no padrão de entrada";
        if (t && !duplicates) {
            const _duplicated = inputsRef.current.items.some((x, idx) => x.item === v && idx !== index);
            inputsRef.current.picked = ((_hasError && _duplicated) || (!_hasError && !_duplicated)) ? inputsRef.current.picked : (!_hasError && _duplicated) ? inputsRef.current.picked - 1 : inputsRef.current.picked + 1;
            inputsRef.current.items[index].picked = !_duplicated;
            inputsRef.current.items[index].status.error = _duplicated;
            inputsRef.current.items[index].status.description = (!_duplicated) ? "" : "Entrada duplicada";
        }
        inputsRef.current.errors = inputsRef.current.items.filter(x => x.status.error === true).length;
        inputsRef.current.picked = inputsRef.current.items.filter(x => x.picked === true).length;
        if (onInputChange && typeof onInputChange == "function") {
            onInputChange(v, index, state);
        }
    }

    const _onInputOk = (e) => {
        if (e.key) {
            if (["Enter", "Tab"].includes(e.key)) {
                e.preventDefault();
                if (e.shiftKey) {
                    checkInput(state.value, state.focusIndex);
                    if (state.focusIndex == 0) {
                        updateState({ ...state, timestamp: Date.now(), focusIndex: -1 });
                        return;
                    }
                    update(state.focusIndex - 1, inputsRef.current.items[state.focusIndex - 1].item);
                } else {
                    checkInput(state.value, state.focusIndex);
                    if (n === state.focusIndex + 1) {
                        updateState({ ...state, timestamp: Date.now(), focusIndex: -1 });
                        return;
                    }
                    update(state.focusIndex + 1, inputsRef.current.items[state.focusIndex + 1].item);
                }
            }

        }
    }

    const _onInput = (v, index) => {
        inputsRef.current.items[index].item = v;
        update(null, v);
    }

    const onContainerClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }

    const onFocus = (e) => {
        e.target.select();
    }

    const columns = useMemo(() => {
        return Math.floor(n / 16) + 1;
    }, [n]);

    const onPopupSelect = (v) => {
        const _v = Array.isArray(v) ? v[0] : v;
        const _value = valueByPath(_v, popupValuePath);
        inputsRef.current.items[state.focusIndex].item = _value;
        inputRef.current.value = _value;
        inputRef.current.focus();
        update(null, _value);
    }

    const onPaste = (e) => {
        e.preventDefault();
    }

    return (
        <Row onClick={onContainerClick} nogutter style={{}}>
            <Col style={{ justifyContent: "center", display: "flex" }}>
                <YScroll width={width} height={height}>
                    <Row nogutter style={{ justifyContent: "center" }}>
                        <Col xs="content">
                            <ListColumns $nItems={n} $columnWidth={columnWidth} $columns={columns}>
                                {!submitting.state && inputsRef.current.items.map((v, index) => {
                                    return (<Row style={{ fontSize: "14px", height: "32px", padding: "1px", breakInside: "avoid" }} key={`pi-${index}`} nogutter>
                                        <Col width={columnWidth} style={{ border: "dashed 1px #bfbfbf", alignItems: "center", display: "flex", ...styleItemStatus(v, index, state.focusIndex, disabled) }} >
                                            <Row nogutter>
                                                {rowNumber && <Col width={rowNumberWidth} style={{ alignSelf: "center", fontWeight: 900, cursor: "pointer", paddingLeft: "5px" }} {...!disabled && { onClick: (e) => onItemClick(e, v.item, index) }}>{(rowNumberFn) ? rowNumberFn(index, v.item) : index + 1}</Col>}
                                                <Col style={{ alignSelf: "center" }} {...(!rowNumber && !disabled) && { onClick: (e) => onItemClick(e, v.item, index) }}>
                                                    {(state.focusIndex === index && !disabled) ?
                                                        <div style={{ display: "flex" }}>
                                                            <Input {...disablePaste && { onPaste }} onFocus={onFocus} disabled={disabled} ref={inputRef} style={{ width: `${columnWidth - (rowNumber ? rowNumberWidth + adjustWidth : adjustWidth)}px`, border: 'none', boxShadow: 'none', background: "none" }} value={state.value} autoFocus onChange={(e) => _onInput(e.target.value, index, e)} onKeyDown={(e) => _onInputOk(e, index)} />
                                                            {(selectorPopupComponent && popupValuePath && !disabled) && <SelectorComponentPopup customSearch={<SearchButton/>} popupProps={{ type: "drawer", width: "95%", ...popupProps }} allowClear={true} keyField={popupValuePath} component={React.cloneElement(selectorPopupComponent, { ...selectorPopupComponent.props, onSelectionChanged: onPopupSelect })} />}


                                                            {/* {(selectorPopup && popupValuePath && !disabled) && <SelectorPopup customSearch={<Button icon={<SearchOutlined />} />} {...selectorPopup} onSelectionChanged={onPopupSelect} />} */}
                                                        </div>
                                                        :
                                                        <span style={{ paddingLeft: "10px" }}>{v.item}</span>}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>);
                                })}
                            </ListColumns>
                        </Col>
                    </Row>
                </YScroll>
            </Col>
        </Row>
    );
});