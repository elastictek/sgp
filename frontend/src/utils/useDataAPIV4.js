import React, { useEffect, useState, useCallback, useRef, useMemo, useContext } from 'react';
import { fetchPost } from "./fetch";
import { Modal } from 'antd';
import { deepEqual, pickAll, getInt, sleep, isObject } from 'utils';
import { produce, finishDraft } from 'immer';
import { useImmer } from "use-immer";
import { json, includeObjectKeys, updateByPath, valueByPath } from "utils/object";
import { uid } from 'uid';
import { clone, isEmpty, isNil, isNotNil, mergeDeepRight } from 'ramda';
import { AppContext } from "app";
import dayjs from 'dayjs';
import { DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT } from 'config';
import { _fieldZodDescription } from './schemaZodRules';
import { getValue, isNullOrEmpty } from '.';

export const filterRegExp = new RegExp(/(==|=|!==|!=|>=|<=|>|<|between:|btw:|in:|!btw|!between:|!in:|isnull|!isnull|@:|:)(.*)/, 'i');

export const parseFilter = (name, parsed, { group = "t1", type = "input", logic, rel, options = {} } = {}) => {
    return { [`${name}_${group}`]: { name, groups: { [group]: { parsed: Array.isArray(parsed) ? parsed : [parsed], group, type, logic, rel, ...options } } } };
}

export const parseFilters = (filters = {}) => {
    let _filters = {};
    Object.keys(filters).forEach(v => {
        if (isObject(filters[v])) {
            _filters = { ..._filters, ...filters[v] };
        } else {
            _filters = { ..._filters, ...parseFilter(v, filters[v]) };
        }
    });
    return _filters;
}

//type = any | start | end | exact
export const getFilterValue = (v, type = 'exact', caseLetter = false) => {
    let val = (v === undefined) ? v : (v?.value === undefined) ? v : v.value;
    val = (val === undefined || val === null) ? val : `${val}`;
    if (val !== '' && val !== undefined) {
        const re = new RegExp(/(==|=|!==|!=|>=|<=|>|<|between:|btw:|in:|!btw|!between:|!in:|isnull|!isnull|@:|:)(.*)/, 'i')
        //RegExp('(^==|^=|^!==|^!=|^>=|^<=|^>|^<|^between:|^in:|^!between:|^!in:|isnull|!isnull|^@:)(.*)', 'i');
        const matches = val.toString().match(re);
        if (matches !== null && matches.length > 0) {
            return `${val}`;
        } else {
            switch (type) {
                case 'any': return `%${val.replaceAll('%%', ' ').replaceAll('%', '').replaceAll(' ', '%%')}%`;
                case 'start': return `${val.replaceAll('%%', ' ').replaceAll(' ', '%%')}%`;
                case 'end': return `%${val.replaceAll('%%', ' ').replaceAll(' ', '%%')}`;
                case '==': return `==${val.replaceAll('==', '')}`;
                case '<': return `<${val.replaceAll('==', '')}`;
                case '>': return `>${val.replaceAll('==', '')}`;
                case '<=': return `<=${val.replaceAll('==', '')}`;
                case '>=': return `>=${val.replaceAll('==', '')}`;
                case '@': return `@${val.replaceAll('==', '')}`;
                case 'exact': return `${val}`;
                default: return `==${val.replaceAll('==', '').replaceAll('%%', ' ').replaceAll('%', '').replaceAll(' ', '%%')}%`;
            }
        }
    }
    return undefined;
}

export const filtersDef = (filters, gridRef, { all = false, keys = ["toolbar"] } = {}) => {
    const _keys = (all) ? Object.keys(filters).filter(v => v !== "no") : keys.filter(v => v !== "no");

    let _newFilters = [];
    for (const k of _keys) {
        let _idx = filters?.[k].indexOf("@columns");
        const _nf = (_idx >= 0) ? [...filters?.[k].slice(0, _idx), ...gridRef.current.api.getColumnDefs().filter(v => !filters?.no.includes(v.field)), ...filters?.[k].slice(_idx)] : [...filters?.[k]];
        _newFilters = [..._newFilters, ..._nf];
        if (k == "more") {
            _newFilters = [..._newFilters, "fcustom"];
        }
    }

    // let _idx = filters?.toolbar.indexOf("@columns");
    // let _newfilters = (_idx >= 0) ? [...filters?.toolbar.slice(0, _idx), ...gridRef.current.api.getColumnDefs().filter(v => !filters?.no.includes(v.field)), ...filters?.toolbar.slice(_idx)] : [...filters?.toolbar];
    // if (all) {
    //     let _idx = filters?.more.indexOf("@columns");
    //     let _morefilters = (_idx >= 0) ? [...filters?.more.slice(0, _idx), ...gridRef.current.api.getColumnDefs().filter(v => !filters?.no.includes(v.field)), ...filters?.more.slice(_idx)] : [...filters?.more];
    //     _newfilters = [..._newfilters, ..._morefilters, "fcustom"];
    // }

    const _f = {};
    for (const v of _newFilters.filter(v => v !== "@columns" && v !== undefined)) {
        if (Object.prototype.toString.call(v) === '[object Object]') {
            let _headerName = "";
            if (v?.colId || v?.headerName) {
                _headerName = v?.headerName;
            } else {
                _headerName = gridRef.current.api.getColumnDefs().find(x => x.field === v.field)?.headerName;
            }
            let _alias = v.field;
            if (!v?.colId && !v?.alias) {
                _alias = gridRef.current.api.getColumnDefs().find(x => x.field === v.field)?.colId;
                if (!_alias) {
                    _alias = v.field;
                }
            }

            const _group = v?.group ? v.group : "t1";
            const _groupOpts = _f?.[v.field]?.["groups"]?.[_group];
            _f[v.field] = {
                ..._f?.[v.field],
                name: v.field,
                groups: {
                    ..._f?.[v.field]?.["groups"], [_group]: {
                        type: v?.type ? v.type : _groupOpts?.type ? _groupOpts?.type : "input",
                        alias: v?.colId ? v.colId : v?.alias ? v.alias : _groupOpts?.colId ? _groupOpts?.colId : _alias,
                        op: v?.op ? v.op : _groupOpts?.op ? _groupOpts?.op : null,
                        mask: v?.mask ? v.mask : _groupOpts?.mask ? _groupOpts?.mask : null,
                        vmask: v?.vmask ? v.vmask : _groupOpts?.vmask ? _groupOpts?.vmask : null,
                        gmask: v?.gmask ? v.gmask : _groupOpts?.gmask ? _groupOpts?.gmask : null,
                        group: _group,
                        case: v?.case ? v.case : _groupOpts?.case ? _groupOpts?.case : "i",
                        assign: isNotNil(v?.assign) ? v.assign : isNotNil(_groupOpts?.assign) ? _groupOpts?.assign : true,
                        wildcards: isNotNil(v?.wildcards) ? v.wildcards : isNotNil(_groupOpts?.wildcards) ? _groupOpts?.wildcards : true,
                        tags: isNotNil(v?.tags) ? v.tags : isNotNil(_groupOpts?.tags) ? _groupOpts?.tags : true,
                        fnvalue: v?.fnvalue ? v.fnvalue : _groupOpts?.fnvalue ? _groupOpts?.fnvalue : null,
                        fn: v?.fn ? v.fn : _groupOpts?.fn ? _groupOpts?.fn : null
                    }
                },
                type: v?.type ? v?.type : _f?.[v.field]?.type ? _f[v.field]?.type : "input",
                style: v?.style ? v?.style : _f?.[v.field]?.style ? _f[v.field]?.style : null,
                label: v?.label ? v.label : _f?.[v.field]?.label ? _f[v.field]?.label : _headerName ? _headerName : v.field,
                col: v?.col ? v.col : _f?.[v.field]?.col ? _f[v.field]?.col : "content",
                multi: isNotNil(v?.multi) ? v.multi : isNotNil(_f?.[v.field]?.multi) ? _f[v.field]?.multi : false,
                // exp: v?.exp ? v.exp : _f?.[v.field]?.exp ? _f[v.field]?.exp : null,
                options: v?.options ? v.options : _f?.[v.field]?.options ? _f[v.field]?.options : null

            };

            // _f[v.field] = {
            //     type: v?.type ? v.type : _f?.[v.field]?.type ? _f[v.field]?.type : "input",
            //     name: v.field,
            //     alias: v?.colId ? v.colId : v?.alias ? v.alias : _f?.[v.field]?.colId ? _f[v.field]?.colId : _alias,
            //     style: v?.style ? v?.style : _f?.[v.field]?.style ? _f[v.field]?.style : null,
            //     op: v?.op ? v.op : _f?.[v.field]?.op ? _f[v.field]?.op : null,
            //     label: v?.label ? v.label : _f?.[v.field]?.label ? _f[v.field]?.label : _headerName ? _headerName : v.field,
            //     col: v?.col ? v.col : _f?.[v.field]?.col ? _f[v.field]?.col : "content",
            //     mask: v?.mask ? v.mask : _f?.[v.field]?.mask ? _f[v.field]?.mask : null,
            //     vmask: v?.vmask ? v.vmask : _f?.[v.field]?.vmask ? _f[v.field]?.vmask : null,
            //     group: _group,
            //     multi: isNotNil(v?.multi) ? v.multi : isNotNil(_f?.[v.field]?.multi) ? _f[v.field]?.multi : false,
            //     // exp: v?.exp ? v.exp : _f?.[v.field]?.exp ? _f[v.field]?.exp : null,
            //     options: v?.options ? v.options : _f?.[v.field]?.options ? _f[v.field]?.options : null,
            //     case: v?.case ? v.case : _f?.[v.field]?.case ? _f[v.field]?.case : "i",
            //     assign: isNotNil(v?.assign) ? v.assign : isNotNil(_f?.[v.field]?.assign) ? _f[v.field]?.assign : true,
            //     wildcards: isNotNil(v?.wildcards) ? v.wildcards : isNotNil(_f?.[v.field]?.wildcards) ? _f[v.field]?.wildcards : true,
            //     tags: isNotNil(v?.tags) ? v.tags : isNotNil(_f?.[v.field]?.tags) ? _f[v.field]?.tags : true,
            //     fnvalue: v?.fnvalue ? v.fnvalue : _f?.[v.field]?.fnvalue ? _f[v.field]?.fnvalue : null,
            // }
        } else {
            const _s = gridRef.current.api.getColumnDefs().find(x => x.field === v);
            const _headerName = _s?.headerName;
            let _alias = _s?.colId;
            if (!_alias) {
                _alias = v;
            }
            const _group = "t1";
            const _groupOpts = _f?.[v]?.["groups"]?.[_group];
            _f[v] = {
                ..._f?.[v],
                name: v,
                groups: {
                    ..._f?.[v]?.["groups"], [_group]: {
                        type: getValue(_groupOpts?.type, "input"),
                        alias: getValue(_groupOpts?.alias, _alias),
                        op: getValue(_groupOpts?.op, null),
                        mask: getValue(_groupOpts?.mask, null),
                        vmask: getValue(_groupOpts?.vmask, null),
                        gmask: getValue(_groupOpts?.gmask, null),
                        group: _group,
                        case: getValue(_groupOpts?.case, "i"),
                        assign: getValue(_groupOpts?.assign, true),
                        wildcards: getValue(_groupOpts?.wildcards, true),
                        tags: getValue(_groupOpts?.tags, true),
                        fnvalue: getValue(_groupOpts?.fnvalue, null),
                        fn: getValue(_groupOpts?.fn, null)
                    }
                },
                type: getValue(_groupOpts?.type, "input"),
                style: getValue(_groupOpts?.style, null),
                label: _groupOpts?.label ? _groupOpts?.label : _headerName ? _headerName : v,
                col: getValue(_groupOpts?.col, "content"),
                multi: getValue(_groupOpts?.multi, false),
                // exp: _f?.[v]?.exp ? _f[v]?.exp : null,
                options: getValue(_groupOpts?.options, null)
            };







            // _f[v] = {
            //     type: _f?.[v]?.type ? _f[v]?.type : "input",
            //     name: v,
            //     alias: _f?.[v]?.alias ? _f[v]?.alias : _alias,
            //     style: _f?.[v]?.style ? _f[v]?.style : null,
            //     op: _f?.[v]?.op ? _f[v]?.op : null,
            //     label: _f?.[v]?.label ? _f[v]?.label : _headerName ? _headerName : v,
            //     col: _f?.[v]?.col ? _f[v]?.col : "content",
            //     mask: _f?.[v]?.mask ? _f[v]?.mask : null,
            //     vmask: _f?.[v]?.vmask ? _f[v]?.vmask : null,
            //     group: _group,
            //     multi: isNotNil(_f?.[v]?.multi) ? _f[v]?.multi : false,
            //     // exp: _f?.[v]?.exp ? _f[v]?.exp : null,
            //     options: _f?.[v]?.options ? _f[v]?.options : null,
            //     case: _f?.[v]?.case ? _f[v]?.case : "i",
            //     assign: isNotNil(_f?.[v]?.assign) ? _f[v]?.assign : true,
            //     wildcards: isNotNil(_f?.[v]?.wildcards) ? _f[v]?.wildcards : true,
            //     tags: isNotNil(_f?.[v]?.tags) ? _f[v]?.tags : true,
            //     fnvalue: _f?.[v]?.fnvalue ? _f[v]?.fnvalue : null
            // }
        }
    }

    return Object.values(_f);
};

export const processConditions = (inputValue, filterDef, rel = "and", logic = "") => {
    let _input = inputValue;
    let _arrayValue = null;
    let _overrideOptions = null;
    if (isNil(inputValue) || isEmpty(inputValue)) {
        if (typeof filterDef?.fnvalue == "function") {
            return filterDef.fnvalue(null);
        }
        return null;
    }
    if (typeof inputValue === 'object' && !Array.isArray(inputValue)) {
        _input = inputValue?.value;
        if (isNil(_input) || isEmpty(_input)) {
            if (typeof filterDef?.fnvalue == "function") {
                return filterDef.fnvalue(null);
            }
            return null;
        }
    }
    if (Array.isArray(_input)) {
        if (_input.length == 0) { return null; }
        //console.log("processed-Array-->", { value: _input, parsed: [`${logic}in:${_input.join(",")}`], logic, ...filterDef });
        let _v = "";
        switch (logic) {
            case "|":
                _v = [`in:${_input.join(",")}`];
                break;
            case "&":
                _v = [`==${_input.join("&==")}`];
                break;
            case "!|":
                _v = [`!in:${_input.join(",")}`];
                break;
            case "!&":
                _v = [`!==${_input.join("&!==")}`];
                break;
            default: _v = [`in:${_input.join(",")}`];
        }
        //        let _v = [`${logic}in:${_input.join(",")}`];
        if (typeof filterDef?.fnvalue == "function") {
            _v = filterDef.fnvalue(_v, logic);
        }
        _arrayValue = _input;
        _input = _v?.[0];
        //return { value: _input, parsed: _v, logic, ...filterDef };

    }

    //const conditionsArray = _input.split(';');
    // const conditionsArray = _input.split(/([&|])/).reduce((acc, current, index, array) => {
    //     if (index > 0 && array[index - 1] === '&' || array[index - 1] === '|') {
    //       acc[acc.length - 1] += current;
    //     } else {
    //       acc.push(current);
    //     }
    //     return acc;
    //   }, []);.toString().split(/([&|()])/)
    //const conditionsArray = _fixConditions(_input).toString().split(/([&|()])/).filter(Boolean);
    const conditionsArray = customSplit(prepareInput(_input, filterDef.wildcards, filterDef.tags));
    const _values = [];
    const _parsedvalues = [];
    if (typeof filterDef?.fn == "function") {
        _overrideOptions = filterDef.fn(_input, logic, rel);
    }
    for (const [idx, condition] of conditionsArray.entries()) {
        let _valid = true;
        const _value = [];
        const _parsedvalue = [];
        if (["&", "|", "(", ")"].includes(condition)) {
            if (idx >= 1 && !["(", ")"].includes(condition) && ["&", "|"].includes(_values[_values.length - 1])) {
                continue;
            }
            if (["(", ")"].includes(condition)) {
                _parsedvalues.push(condition);
                _values.push(condition);
                continue;
            }

            _parsedvalues.push(condition === "&" ? "and" : "or");
            _values.push(condition);
            continue;
        }
        const matches = condition.trim().toString().match(filterRegExp);
        const _opTag = matches ? matches[1] : "";
        const _x = matches ? matches[2] : condition.trim().toString();
        if (_opTag === "@:") {
            _parsedvalues.push(condition);
            _values.push(condition);
            continue;
        }
        if (_opTag === ":") {
            if (condition.trim() === ":") {
                continue;
            }
            _parsedvalues.push(condition);
            _values.push(condition);
            continue;
        }
        if (!isEmpty(_x) || (["isnull", "!isnull"].includes(_opTag))) {
            for (const value of _x.split(',')) {
                if (filterDef.type === "options") {
                    let _t = "";
                    if (filterDef.tags) {
                        _t = (_opTag === "") ? "==" : "";
                    }
                    _value.push(value);
                    _parsedvalue.push(fnValue(`${_t}${value}`, filterDef.fnvalue));
                } else if (filterDef.type === "number") {
                    if (isNaN(+value)) {
                        _valid = false;
                        break;
                    } else {
                        let _t = "";
                        if (filterDef.tags) {
                            _t = (_opTag === "") ? "==" : (_opTag === "=") ? "=" : "";
                        }
                        _value.push(value);
                        _parsedvalue.push(fnValue(`${_t}${value.replace(/\n/g, '')}`, filterDef.fnvalue));
                    }
                } else if (filterDef.type === "date") {
                    const parsedDate = dayjs(value, { strict: true });
                    if (!parsedDate.isValid()) {
                        _valid = false;
                        break;
                    } else {
                        let _t = "";
                        if (filterDef.tags) {
                            _t = (_opTag === "") ? "==" : (_opTag === "=") ? "=" : "";
                        }
                        _value.push(parsedDate.format(DATE_FORMAT));
                        _parsedvalue.push(fnValue(`${_t}${value.replace(/\n/g, '')}`, filterDef.fnvalue));
                    }
                } else if (filterDef.type === "datetime") {
                    const parsedDate = dayjs(value, { strict: true });
                    if (!parsedDate.isValid()) {
                        _valid = false;
                        break;
                    } else {
                        let _t = "";
                        if (filterDef.tags) {
                            _t = (_opTag === "") ? "==" : (_opTag === "=") ? "=" : "";
                        }
                        _value.push(parsedDate.format(DATETIME_FORMAT));
                        _parsedvalue.push(fnValue(`${_t}${value.replace(/\n/g, '')}`, filterDef.fnvalue));
                    }
                } else if (filterDef.type === "time") {
                    const parsedDate = dayjs(value, TIME_FORMAT);
                    if (!parsedDate.isValid()) {
                        _valid = false;
                        break;
                    } else {
                        let _t = "";
                        if (filterDef.tags) {
                            _t = (_opTag === "") ? "==" : (_opTag === "=") ? "=" : "";
                        }
                        _value.push(parsedDate.format(TIME_FORMAT));
                        _parsedvalue.push(fnValue(`${_t}${value.replace(/\n/g, '')}`, filterDef.fnvalue));
                    }
                } else {
                    const _v = filterDef.case === "i" ? value.toLowerCase() : value;
                    _value.push(value);
                    _parsedvalue.push(fnValue(prepareInput(_filterParser(_v.replace(/\n/g, ''), filterDef, _opTag), filterDef.wildcards, filterDef.tags), filterDef.fnvalue));
                }
            }
            if (_valid) {
                _values.push(`${_opTag}${_value.join(",")}`);
                _parsedvalues.push(`${filterDef.tags ? _opTag : ""}${_parsedvalue.join(",")}`);
            }

        };
    }
    if (_parsedvalues.length === 0) {
        return null;
    }
    if (["&", "|"].includes(_values[_values.length - 1])) {
        _values.splice(_values.length - 1, 1);
        _parsedvalues.splice(_parsedvalues.length - 1, 1);
    }
    console.log("processed--->", { value: !isNil(_arrayValue) ? _arrayValue : _values.join(""), parsed: _parsedvalues, rel, logic, ...filterDef, ..._overrideOptions && _overrideOptions })
    return { value: !isNil(_arrayValue) ? _arrayValue : _values.join(""), parsed: _parsedvalues, rel, logic, ...filterDef, ..._overrideOptions && _overrideOptions };
}

export const getLocalStorage = (id, useStorage) => {
    if (useStorage && id) {
        const v = JSON.parse(localStorage.getItem(`dapi-${id}`));
        if (v) {
            delete v.init;
            delete v.initLoaded;
        }
        return v;
    }
    return {};
}

export const useDataAPI = ({ payload, id, useStorage = true, fnPostProcess } = {}) => {
    const { openNotification } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);
    const action = useRef([]);
    const apiversion = "4";
    const [state, updateState] = useImmer({
        init: false,
        initLoaded: payload?.initLoaded || false,
        update: Date.now(),
        pagination: payload?.pagination || { enabled: false, pageSize: 10 },
        filter: payload?.filter || {},
        preFilter: payload?.preFilter ? { ...payload.preFilter } : {},
        defaultSort: _computeSort(payload?.sort),
        //sort: payload?.sort || [],
        sort: [],
        parameters: payload?.parameters || {},
        data: (payload?.data) ? payload.data : {},
        withCredentials: payload?.withCredentials || null,
        url: payload?.url,
        ...getLocalStorage(id, useStorage),
        primaryKey: payload?.primaryKey || null,
        baseFilter: payload?.baseFilter ? { ...payload.baseFilter } : {},
        totalRows: 0
    });
    const ref = useRef({
        init: false,
        id: id,
        dsV4StateInit: false,
        initLoaded: payload?.initLoaded || false,
        update: null,
        pagination: payload?.pagination ? { ...payload.pagination } : { enabled: false, pageSize: 10 },
        filter: payload?.filter ? { ...payload.filter } : {},
        preFilter: payload?.preFilter ? { ...payload.preFilter } : {},
        defaultSort: _computeSort(payload?.sort),
        sort: [],//sort: payload?.sort ? [...payload.sort] : [],
        parameters: payload?.parameters ? { ...payload.parameters } : {},
        withCredentials: payload?.withCredentials || null,
        url: payload?.url,
        ...getLocalStorage(id, useStorage),
        primaryKey: payload?.primaryKey || null,
        onGridRequest: payload?.onGridRequest ? payload.onGridRequest : null,
        onGridResponse: payload?.onGridResponse ? payload.onGridResponse : null,
        onGridFailRequest: payload?.onGridFailRequest ? payload.onGridFailRequest : null,
        baseFilter: payload?.baseFilter ? { ...payload.baseFilter } : {},
        sortMap: payload?.sortMap ? { ...payload.sortMap } : {},
        requestsCount: 0,
        data: (payload?.data) ? payload.data : {},
        totalRows: 0,
    });

    useEffect(() => {
        ref.current.init = true;
        updateState(draft => {
            draft.init = true;
        });
    }, []);

    const safePost = async (url, method, { filter = {}, parameters = {}, values = {}, schema, onPre, notify = ["run_fail", "run_success", "fatal"], passthrough = true, ...rest } = {}) => {
        let p = _dataPost(url, method, values, filter, parameters, schema);
        let validation = null;
        let response = null;
        try {
            p.timestamp = new Date();
            if (typeof preProcess === "function") {
                await pre(p);
            }
            if (p?.schema) {
                validation = passthrough ? await p.schema.passthrough().spa(p.values) : await p.schema.spa(p.values);
                p.valid = validation.success;
                if (!validation.success) {
                    const _errors = validation?.error.errors.map(v => ({ ...v, field: v.path.join('.'), label: _fieldZodDescription(schema, v.path), type: "props" }));
                    if (notify && notify.includes("props")) {
                        //TODO
                        //openNotification("error", "top", "Notificação", e.message);
                    }
                    p.alerts.error.push(..._errors);
                }
            } else {
                validation = { success: true };
            }

            if (validation?.success) {
                response = await fetchPost({ url: p.url, filter: p.filter, apiversion: "4", parameters: { method: p.method, ...p.parameters }, ...rest });
                p.response = response?.data;

                if (!response || (isNullOrEmpty(response?.data?.status) && response?.status != 200)) {
                    p.success = false;
                    p.alerts.error.push({ code: "RUN_ERROR", message: response?.data?.title ? response?.data?.title : response?.statusText, type: "run_fail" });
                    if (notify && notify.includes("run_fail")) {
                        openNotification("error", "top", "Notificação", response?.data?.title ? response?.data?.title : response?.statusText);
                    }
                } else if (!isNullOrEmpty(response?.data?.status) && response?.data?.status !== "success") {
                    p.success = false;
                    p.alerts.error.push({ code: "RUN_ERROR", message: response?.data?.title, type: "run_fail" });
                    if (notify && notify.includes("run_fail")) {
                        openNotification("error", "top", "Notificação", response?.data?.title);
                    }
                } else if (isNullOrEmpty(response?.data?.status) && response?.status == 200) {
                    p.success = true;
                    p.alerts.success.push({ code: "RUN_SUCCESS", message: response?.statusText, type: "run_success", data: response?.data });
                    if (notify && notify.includes("run_success")) {
                        openNotification("success", "top", "Notificação", response?.statusText);
                    }
                } else if (response?.data?.status === "success") {
                    const { title, status, ...rest } = response?.data;
                    p.success = true;
                    p.alerts.success.push({ code: "RUN_SUCCESS", message: title, type: "run_success", ...rest });
                    if (notify && notify.includes("run_success")) {
                        openNotification("success", "top", "Notificação", title);
                    }
                }
            }
        } catch (e) {
            console.log(e);
            p.success = false;
            p.alerts.error.push({ code: e.code, message: e.message, type: "fatal" });
            if (notify && notify.includes("fatal")) {
                openNotification("error", "top", e.code, e.message);
            }
        };
        return p;
    }

    const _updateData = (data, totalRows) => {
        if (totalRows !== null) {
            ref.current.totalRows = totalRows;
        }
        //ref.current.data = data;
        ref.current.tstamp = new Date();
        //updateState(draft => {
        //    draft.tstamp = ref.current.tstamp;
        //});
    }

    const setPayload = (payload) => {
        updateState(payload);
        ref.current = { ...payload };
    }

    const addAction = (type) => {
        if (!action.current.includes(type))
            action.current.push(type);
    }
    const isAction = (type) => {
        return action.current.includes(type);
    }
    const first = (updateStateData = false) => {
        //console.log("first");
        addAction('nav');
        ref.current.pagination = { ...ref.current.pagination, page: 1 };
        if (updateStateData) {
            updateState(draft => {
                draft.pagination = ref.current.pagination;
            });
        }
    }
    const previous = (updateStateData = false) => {
        //console.log("previous");
        addAction('nav');
        ref.current.pagination = { ...ref.current.pagination, page: ((ref.current.pagination.page <= 1) ? 1 : (ref.current.pagination.page - 1)) };
        if (updateStateData) {
            updateState(draft => {
                draft.pagination = ref.current.pagination;
            });
        }
    }
    const next = (updateStateData = false) => {
        //console.log("next");
        addAction('nav');
        ref.current.pagination = { ...ref.current.pagination, page: (ref.current.pagination.page + 1) };
        if (updateStateData) {
            updateState(draft => {
                draft.pagination = ref.current.pagination;
            });
        }
    }
    const last = (updateStateData = false) => {
        //console.log("last");
        addAction('nav');
        ref.current.pagination = { ...ref.current.pagination, page: -1 };
        if (updateStateData) {
            updateState(draft => {
                draft.pagination = ref.current.pagination;
            });
        }
    }
    const currentPage = (page = 0, updateStateData = false) => {
        //console.log("current");
        addAction('nav');
        ref.current.pagination = { ...ref.current.pagination, page: ((page <= 0) ? 0 : page) };
        if (updateStateData) {
            updateState(draft => {
                draft.pagination = ref.current.pagination;
            });
        }
    }
    const pageSize = (size = 10, updateStateData = false) => {
        //console.log("pageSize");
        addAction('pageSize');
        ref.current.pagination = { ...ref.current.pagination, pageSize: size }
        if (updateStateData) {
            updateState(draft => {
                draft.pagination = ref.current.pagination;
            });
        }
    }
    const getRowOffset = (row, fromState) => {
        if (typeof row == 'number') {
            if (getPagination(fromState).enabled) {
                return (getCurrentPage(fromState) - 1) * getPageSize(fromState) + row;
            } else {
                return row;
            }
        } else {
            if (getPagination(fromState).enabled) {
                return (getCurrentPage(fromState) - 1) * getPageSize(fromState) + getIndex(row)
            } else {
                return getIndex(row);
            }
        }

    }
    const getRowsFromTo = () => {
        const from = ((getInt(state.pagination.page, 1) - 1) * getInt(state.pagination.pageSize, 1)) + 1;
        const nPagerows = ((state?.data?.rows && Array.isArray(state?.data?.rows)) ? getInt(state.data.rows?.length) <= 0 ? 0 : getInt(state.data.rows?.length) - 1 : 0);
        const to = from + nPagerows;
        return { from, to };
    }

    const getPagination = (fromState = false) => {
        if (fromState) {
            return { ...state.pagination, pageSize: getPageSize(true) };
        } else {
            return { ...ref.current.pagination, pageSize: getPageSize(false) };
        }
    };
    const getPageSize = (fromState = false) => {
        if (fromState) {
            if (!state.pagination.enabled && state.pagination?.limit) {
                return state.pagination?.limit;
            }
            return state.pagination.pageSize;
        } else {
            if (!ref.current.pagination.enabled && ref.current.pagination?.limit) {
                return ref.current.pagination?.limit;
            }
            return ref.current.pagination.pageSize;
        }
    };
    const getCurrentPage = (fromState = false) => {
        if (fromState) {
            return getInt(state.pagination.page, 1);
        } else {
            return getInt(ref.current.pagination.page, 1);
        }
    };

    const setDefaultSort = (obj) => {
        const _s = (obj && obj.length > 0) ? obj : [];
        ref.current.defaultSort = _computeSort(_s);
    }

    const setSort = (obj, defaultObj, updateStateData = false) => {
        addAction('sort');
        const _s = (obj && obj.length > 0) ? obj : defaultObj ? defaultObj : [];
        ref.current.sort = _computeSort(_s);
        if (defaultObj) {
            ref.current.defaultSort = _computeSort(_s);
        }
        if (updateStateData) {
            updateState(draft => {
                draft.sort = ref.current.sort;
            });
        }
    };
    const getSort = (fromState = false) => {
        if (fromState) {
            return [...state.sort];
        } else {
            return [...ref.current.sort];
        }
    }
    const sortOrder = (columnkey) => {
        if (ref.current.sort) {
            let item = ref.current.sort.find(v => (v.column === columnkey));
            return (item) ? item.order : false;
        }
        return false;
    };
    const clearSort = (updateStateData = false) => {
        addAction('sort');
        ref.current.sort = [];
        if (updateStateData) {
            updateState(draft => {
                draft.sort = ref.current.sort;
            });
        }
    }
    const resetSort = (updateStateData = false) => {
        addAction('sort');
        ref.current.sort = [...ref.current.defaultSort];
        if (updateStateData) {
            updateState(draft => {
                draft.sort = ref.current.defaultSort;
            });
        }
    }

    const getDefaultSort = () => {
        return ref.current.defaultSort;
    }

    const _addSort = ({ columnKey, field, name, colId, id, order, ...rest }) => {
        const column = (columnKey) ? columnKey : (name) ? name : (id) ? id : (colId) ? colId : field;
        const direction = (order == "ascend" || order == "ASC" || order == 1 || order == "asc") ? "ASC" : "DESC";
        let idx = ref.current.sort.findIndex(v => (v.column === column));
        if (idx >= 0) {
            const array = [...ref.current.sort];
            array[idx] = { column, name: column, colId: column, id: column, sort: order, dir: direction === "ASC" ? 1 : -1, direction, order, table: rest.column.table };
            ref.current.sort = array;
        } else {
            ref.current.sort = [...ref.current.sort, { column, name: column, id: column, colId: column, sort: order, dir: direction === "ASC" ? 1 : -1, direction, order, table: rest.column.table }];
        }
    }
    const addSort = (obj, updateStateData = false) => {
        addAction('sort');
        //_sort.current = [];
        if (Array.isArray(obj)) {
            for (let s of obj) {
                if (!s.order) {
                    continue;
                }
                _addSort(s);
            }
        } else {
            if (obj.order) {
                _addSort(obj);
            }
        }
        if (updateStateData) {
            updateState(draft => {
                draft.sort = ref.current.sort;
            });
        }
    };

    const addFilters = (obj, assign = true, updateStateData = false) => {
        addAction('filter');
        if (assign) {
            ref.current.filter = obj;
        } else {
            ref.current.filter = { ...ref.current.filter, ...obj };
        }
        if (updateStateData) {
            updateState(draft => {
                draft.filter = ref.current.filter;
            });
        }
    }
    const setFilters = (obj, updateStateData = false) => {
        addAction('filter');
        ref.current.filter = obj;
        if (updateStateData) {
            updateState(draft => {
                draft.filter = ref.current.filter;
            });
        }
    }

    const addParameters = (obj, assign = true, updateStateData = false) => {
        addAction('parameters');
        if (assign) {
            ref.current.parameters = obj;
        } else {
            ref.current.parameters = { ...ref.current.parameters, ...obj };
        }
        if (updateStateData) {
            updateState(draft => {
                draft.parameters = ref.current.parameters;
            });
        }
    }

    const getPayload = (fromState = false) => {
        if (fromState) {
            const { data, ...rest } = state;
            return rest;
        } else {
            return ref.current;
        }
    }
    const getFilters = (fromState = false, onEmptyNull = false) => {
        if (fromState) {
            return (Object.keys(state.filter).length == 0 && onEmptyNull) ? null : { ...state.filter };
        } else {
            return (Object.keys(ref.current.filter).length == 0 && onEmptyNull) ? null : { ...ref.current.filter };
        }
    }
    const getAllFilters = () => {
        return { ...state.filter, ...ref.current.filter };
    }
    const getParameters = () => {
        return { ...state.parameters, ...ref.current.parameters };
    }

    const removeEmpty = (obj, keys = []) => {
        return Object.fromEntries(Object.entries(obj).filter(([_, v]) => (v !== null && v !== '' && v !== undefined && !keys.includes(_))));
    }

    const update = (keepAction = false, payload = {}) => {
        ref.current.updated = Date.now();
        if (!keepAction) {
            action.current = [];
        }
        updateState(draft => {
            draft.primaryKey = ref.current.primaryKey;
            draft.updated = ref.current.updated;
            draft.pagination = ref.current.pagination;
            draft.filter = ref.current.filter;
            draft.sort = ref.current.sort;
            draft.parameters = ref.current.parameters;
            draft.tstamp = ref.current.tstamp;
            draft.withCredentials = ref.current.withCredentials;
            draft.url = ref.current.url;

            if (payload?.primaryKey) { draft.primaryKey = payload?.primaryKey; }
            if (payload?.pagination) { draft.pagination = payload?.pagination; }
            if (payload?.filter) { draft.filter = payload?.filter; }
            if (payload?.sort) { draft.sort = payload?.sort; }
            if (payload?.parameters) { draft.parameters = payload?.parameters; }
            if (payload?.tstamp) { draft.tstamp = payload?.tstamp; }
            if (payload?.withCredentials) { draft.withCredentials = payload?.withCredentials; }
            if (payload?.url) { draft.url = payload?.url; }

        });

    }

    const _totalRows = (rows, total, fakeTotal = false) => {
        if (total) {
            //if (fakeTotal === true) {
            const _len = (rows && Array.isArray(rows)) ? rows.length : 0;
            return (_len < getPageSize()) ? (getCurrentPage() * getPageSize()) - (getPageSize() - _len) : total;
            //}
            //return total;
        }
        if (rows && Array.isArray(rows)) {
            return rows.length;
        }
        return 0;
    }

    const setData = (data, payload, ignoreTotalRows) => {

        ref.current.initLoaded = (ref.current.initLoaded === false) ? true : ref.current.initLoaded;
        if (payload?.update) {
            ref.current.updated = Date.now();
        }

        const _trows = ignoreTotalRows ? data?.rows?.length ?? 0 : _totalRows(data?.rows, data?.total, data?.faketotal);
        _updateData({ ...data }, _trows);

        updateState(draft => {
            draft.initLoaded = ref.current.initLoaded;
            draft.data = { ...data };
            draft.totalRows = _trows;
            if (payload?.update) {
                draft.updated = ref.current.updated;
            }
            draft.primaryKey = ref.current.primaryKey;
            draft.pagination = ref.current.pagination;
            draft.filter = ref.current.filter;
            draft.sort = ref.current.sort;
            draft.parameters = ref.current.parameters;
            //draft.tstamp = ref.current.tstamp;
            draft.withCredentials = ref.current.withCredentials;
            draft.url = ref.current.url;
            draft.tstamp = Date.now();

            if (payload?.primaryKey) { draft.primaryKey = payload?.primaryKey; }
            if (payload?.pagination) { draft.pagination = payload?.pagination; }
            if (payload?.filter) { draft.filter = payload?.filter; }
            if (payload?.sort) { draft.sort = payload?.sort; }
            if (payload?.parameters) { draft.parameters = payload?.parameters; }
            if (payload?.tstamp) { draft.tstamp = payload?.tstamp; }
            if (payload?.withCredentials) { draft.withCredentials = payload?.withCredentials; }
            if (payload?.url) { draft.url = payload?.url; }
        });
        action.current = [];
    }
    const addRow = (row, keys = null, at = null, cb = null) => {
        const r = keys ? pickAll(keys, row) : row;
        let _rows = [...state?.data?.rows || []];
        if (_rows && _rows.length > 0) {
            const exists = (keys === null) ? false : _rows.some(v => deepEqual(pickAll(keys, v), r));
            if (!exists) {
                if (at !== null) {
                    _rows.splice(at, 0, { ...row, rowadded: 1, rowvalid: 0 });
                } else {
                    _rows.push({ ...row, rowadded: 1, rowvalid: 0 });
                }
                if (typeof cb === "function") {
                    _rows = cb(_rows);
                }
                const _total = _totalRows(_rows, ref.current.totalRows + 1);
                _updateData({ rows: [..._rows], total: _total }, _total);
                updateState(draft => {
                    draft.tstamp = Date.now();
                    draft.data = { rows: [..._rows], total: _total };
                    draft.totalRows = _total;
                });
            }
        } else {
            _rows = [{ ...row, rowadded: 1, rowvalid: 0 }];
            const _total = _totalRows(_rows, 1);
            if (typeof cb === "function") {
                _rows = cb(_rows);
            }
            _updateData({ rows: _rows, total: _total }, _total);
            updateState(draft => {
                draft.tstamp = Date.now();
                draft.data = { rows: _rows, total: _total };
                draft.totalRows = _total;
            });
        }
    }
    const addRows = (rows, at = null, cb = null) => {
        let _rows = [...state?.data?.rows || []];
        if (_rows && _rows.length > 0) {
            if (at !== null) {
                _rows.splice(at, 0, rows.map(v => ({ ...v, rowadded: 1, rowvalid: 0 })));
            } else {
                _rows.push(...rows.map(v => ({ ...v, rowadded: 1, rowvalid: 0 })));
            }
            if (typeof cb === "function") {
                _rows = cb(_rows);
            }
            const _total = _totalRows(_rows, ref.current.totalRows + rows.length);
            ref.current.totalRows = _total;
            updateState(draft => {
                draft.tstamp = Date.now();
                draft.data = { rows: [..._rows], total: _total };
                draft.totalRows = _total;
            });
        } else {
            _rows = rows.map(v => ({ ...v, rowadded: 1, rowvalid: 0 }));
            const _total = _totalRows(_rows, null);
            if (typeof cb === "function") {
                _rows = cb(_rows);
            }
            _updateData({ rows: _rows, total: _total }, _total);
            updateState(draft => {
                draft.tstamp = Date.now();
                draft.data = { rows: _rows, total: _total };
                draft.totalRows = _total;
            });
        }
    }
    const setRows = (rows, total = null) => {
        const _total = _totalRows(rows, (total === null) ? ref.current.totalRows : total);
        _updateData({ rows: [...rows], total: _total }, _total);
        updateState(draft => {
            draft.tstamp = Date.now();
            draft.data = { rows: [...rows], total: _total };
            draft.totalRows = _total;
        });
    }
    const deleteRow = (data, keys) => {
        if (state?.data?.rows && state.data.rows?.length > 0) {
            const _rows = produce(state?.data?.rows, (draftArray) => {
                const idx = draftArray.findIndex(v => deepEqual(pickAll(keys, v), data));
                if (idx >= 0) {
                    draftArray.splice(idx, 1);
                }
            });
            const _total = _totalRows(_rows, ref.current.totalRows - 1);
            _updateData({ rows: [..._rows], total: _total }, _total);
            updateState(draft => {
                draft.tstamp = Date.now();
                draft.data = { rows: [..._rows], total: _total }
                draft.totalRows = _total;
            });
            return _rows;
        }
        return state?.data?.rows
    }
    const deleteRowByIndex = (index, indexCol) => {
        if (state?.data?.rows && index >= 0 && index < state.data.rows?.length) {
            const _rows = produce(state?.data?.rows, (draftArray) => {
                draftArray.splice(index, 1);
                if (indexCol) {
                    draftArray.forEach((draft, i) => {
                        draft[indexCol] = i + 1
                    });
                }
            });
            const _total = _totalRows(_rows, ref.current.totalRows - 1);
            _updateData({ rows: [..._rows], total: _total }, _total);
            updateState(draft => {
                draft.tstamp = Date.now();
                draft.data = { rows: [..._rows], total: _total }
                draft.totalRows = _total;
            });
            return _rows;
        }
        return state?.data?.rows;
    }
    const setAllRowsValid = () => {
        const _rows = produce(state?.data?.rows, (draftArray) => {
            draftArray.forEach((draft) => {
                draft["rowadded"] = 0;
                draft["rowvalid"] = 1;
            });
        });
        _updateData({ rows: [..._rows], ...(ref.current.data?.total) ? { total: ref.current.data.total } : {} }, null);
        updateState(draft => {
            draft.tstamp = Date.now();
            draft.data = { rows: [..._rows] };
        });
        return _rows;
    }



    const moveRowUp = (index, indexCol) => {
        const _rows = [...state.data.rows];
        if (_rows) {
            if (index > 0 && index < _rows.length) {
                if (indexCol) {
                    const temp = { ..._rows[index - 1], [indexCol]: index + 1, rowvalid: 0 };
                    _rows[index - 1] = { ..._rows[index], [indexCol]: index, rowvalid: 0 };
                    _rows[index] = temp;
                } else {
                    const temp = _rows[index - 1];
                    _rows[index - 1] = _rows[index];
                    _rows[index] = temp;
                }
                _updateData({ rows: [..._rows], total: ref.current.data.total }, null);
                updateState(draft => {
                    draft.tstamp = Date.now();
                    draft.data = { rows: [..._rows], total: draft.data.total }
                });
            }
        }
        return _rows;
    }

    const moveRowDown = (index, indexCol) => {
        const _rows = [...state.data.rows];
        if (_rows) {
            if (index >= 0 && index < _rows.length - 1) {
                if (indexCol) {
                    const temp = { ..._rows[index + 1], [indexCol]: index + 1, rowvalid: 0 };
                    _rows[index + 1] = { ..._rows[index], [indexCol]: index + 2, rowvalid: 0 };
                    _rows[index] = temp;
                } else {
                    const temp = _rows[index + 1];
                    _rows[index + 1] = _rows[index];
                    _rows[index] = temp;
                }
                _updateData({ rows: [..._rows], total: ref.current.data.total }, null);
                updateState(draft => {
                    draft.tstamp = Date.now();
                    draft.data = { rows: [..._rows], total: draft.data.total }
                });
            }
        }
        return _rows;
    }


    const updateRows = (row, conditions) => {

        const updatedRows = state.data.rows.map(r => {
            let match = true;
            for (const key in conditions) {
                if (conditions.hasOwnProperty(key) && r[key] !== conditions[key]) {
                    match = false;
                    break;
                }
            }
            return match ? { ...r, ...row } : r;
        });
        _updateData({ rows: updateRows, total: ref.current.totalRows }, null);
        updateState(draft => {
            draft.tstamp = Date.now();
            draft.data = { rows: updatedRows, total: ref.current.totalRows };
            draft.totalRows = 0;
        });
    }

    //Update just one column
    const updateValue = (idx, column, value) => {
        let _rows = [...state.data.rows];
        if (_rows[idx] && column in _rows[idx]) {
            if (_rows[idx][column] !== value) {
                let _obj = { ..._rows[idx] };
                _obj[column] = value;
                _obj["rowvalid"] = 0;
                _rows[idx] = { ..._obj };
                _updateData({ rows: [..._rows], total: ref.current.data.total }, null);
                updateState(draft => {
                    draft.updated = ref.current.updated;
                    draft.data = { rows: [..._rows], total: ref.current.totalRows };
                });
            }
        }
        return _rows;
    }
    //Update multiple columns
    const updateValues = (idx, column, row, replaceRow = false) => {
        let _rows = [...state.data.rows];
        if (_rows[idx]) {
            if (_rows[idx]?.[column] !== row?.[column]) {
                let _obj = { ..._rows[idx] };
                if (replaceRow) {
                    _obj = { ...row };
                } else {
                    _obj = { ..._obj, ...row };
                }
                _obj["rowvalid"] = 0;
                _rows[idx] = { ..._obj };
                _updateData({ rows: [..._rows], total: ref.current.data.total }, null);
                updateState(draft => {
                    draft.updated = ref.current.updated;
                    draft.data = { rows: [..._rows], total: ref.current.totalRows };
                });
            }
        }
        return _rows;
    }

    const clearData = () => {
        _updateData({}, 0);
        updateState(draft => {
            draft.tstamp = Date.now();
            draft.data = {};
            draft.totalRows = 0;
        });
    }
    const getData = () => {
        return { ...state.data };
    }
    const _fetchPost = async ({ url, withCredentials = null, token, signal, rowFn, fromState = false, ignoreTotalRows = false, norun = false, ...rest } = {}) => {
        let _url = (url) ? url : ref.current.url;
        let _withCredentials = (withCredentials !== null) ? withCredentials : ref.current.withCredentials;
        console.log("default-sortxx-", fromState, getPayload(fromState))
        const { sort, ...payload } = getPayload(fromState);
        payload.tstamp = Date.now();
        payload.apiversion = apiversion;
        if (rest?.update === true) {
            payload.update = true;
        } else {
            payload.update = false;
        }
        setIsLoading(true);
        return (async () => {
            let ret = null;
            //let ok = true;
            if (id && useStorage) {
                localStorage.setItem(`dapi-${id}`, JSON.stringify(payload));
            }
            try {
                const _sort = sort.map(v => {
                    if (v.column in ref.current.sortMap) {
                        v.column = ref.current.sortMap[v.column];
                        return v;
                    }
                    return v;
                });
                const dt = (await fetchPost({ url: _url, norun, ...(_withCredentials !== null && { withCredentials: _withCredentials }), ...payload, sort: _sort, filter: { ..._mergeObjects(ref.current.filter, ref.current.preFilter?.filter), ...ref.current.baseFilter }, ...((signal) ? { signal } : { cancelToken: token }) })).data;
                if (!Array.isArray(dt?.rows)) {
                    ret = dt;
                    setData(ret, payload, ignoreTotalRows);
                } else if (typeof rowFn === "function") {
                    ret = await rowFn(dt);
                    setData(ret, payload, ignoreTotalRows);
                } else if (typeof fnPostProcess === "function") {
                    ret = await fnPostProcess(dt);
                    setData(ret, payload, ignoreTotalRows);
                } else {
                    ret = dt;
                    setData(ret, payload, ignoreTotalRows);
                }
                ref.current.requestsCount++;
            } catch (e) {
                console.log(e)
                Modal.error({ content: e.message });
                //ok = false;
                ret = null;
            }
            setIsLoading(false);
            return ret;
            //return ok;
        })();
    }
    const getPostRequest = ({ url, fromState = false } = {}) => {
        return { ...getPayload(fromState), url: (url) ? url : ref.current.url };
    }
    const nav = ({ action = "", page = 1, onFetch } = {}) => {
        addAction('nav');
        switch (action) {
            case "first": first(); break;
            case "previous": previous(); break;
            case "next": next(); break;
            case "last": last(); break;
            default: currentPage(page, true);
        }
        if (onFetch) {
            onFetch();
        }
    }
    const url = (fromState = false) => {
        if (fromState) {
            return state.url;
        }
        else {
            return ref.current.url;
        }
    }

    const printState = (print = false) => {
        const { data, ...rest } = state;
        if (print) {
            console.log("STATE -> ", JSON.stringify(rest));
        } else {
            return JSON.stringify(rest);
        }
    }

    const _isLoading = () => {
        return isLoading;
    }

    const getTimeStamp = () => {
        return state.tstamp;
    }
    const updated = (fromState = false) => {
        if (fromState) {
            return state.updated;
        }
        else {
            return ref.current.updated;
        }
    }
    const initLoaded = (fromState = false) => {
        if (fromState) {
            return state.initLoaded;
        }
        else {
            return ref.current.initLoaded;
        }
    }

    const dirtyRows = () => {
        return (state.data.rows) ? state.data.rows.filter(v => v?.rowvalid === 0) : [];
    }

    const newRows = () => {
        return (state.data.rows) ? state.data.rows.filter(v => v?.rowadded === 1) : [];
    }

    const setAction = (v, assign = false) => {
        if (assign) {
            action.current = [v];
        } else {
            action.current = [...action.current, v];
        }
    }
    const clearActions = () => {
        action.current = [];
    }

    const getPrimaryKey = (fromState = false) => {
        if (fromState) {
            return state.primaryKey;
        } else {
            return ref.current.primaryKey;
        }
    }

    const getIndex = (row) => {
        return state.data.rows.findIndex(v => v?.[getPrimaryKey()] === row?.[getPrimaryKey()]);
    }

    const getLength = () => {
        return getInt(state?.data?.rows?.length, 0);
    }

    const setTotalRows = (n, updateStateData = false) => {
        addAction('totalRows');
        ref.current.totalRows = n;
        if (updateStateData) {
            updateState(draft => {
                draft.totalRows = ref.current.totalRows;
            });
        }
    }

    const loadSortStateV4 = (api) => {
        let _sort = getSort();
        _sort = (_sort && _sort.length > 0) ? _sort : _computeSort(getDefaultSort());
        api.applyColumnState({
            state: _sort.map(v => includeObjectKeys(v, ["colId", "sort"]))
            //     defaultState: { sort: _sort.map(v => includeObjectKeys(v, ["colId", "sort"])) },
            //     applyOrder: false
        });
    }

    /** Only for AG-GRID */
    const dataSourceV4 = (gridRef, _api) => {
        //Load Sort State
        loadSortStateV4(_api);
        return {
            getRows: async (params) => {
                const { api } = gridRef?.current || params;

                // if (!ref.current.dsV4StateInit) {
                //     //load Grid State through dataAPI
                //     // let _sort = getSort();
                //     // _sort = (_sort && _sort.length > 0) ? _sort : _computeSort(getDefaultSort());
                //     // api.applyColumnState({
                //     //     state: _sort.map(v => includeObjectKeys(v, ["colId", "sort"])),
                //     //     defaultState: { sort: null },
                //     //     applyOrder: false
                //     // });
                //     ref.current.dsV4StateInit = true;
                // }
                if (!ref.current.initLoaded && getCurrentPage() !== 1) {
                    //WORKAROUND FOR INITIAL PAGE (FROM STATE)
                    ref.current.initLoaded = (ref.current.initLoaded === false) ? true : ref.current.initLoaded;
                    updateState(draft => { draft.initLoaded = ref.current.initLoaded; });
                    params.success({
                        rowData: Array.from({ length: getPageSize() }, () => ({ [getPrimaryKey()]: uid(6) })), //Array(getPageSize()).fill({id:(()=>uid(6))()}),
                        rowCount: getCurrentPage() * getPageSize()
                    });
                }
                else {
                    api.showLoadingOverlay();
                    currentPage(api.paginationGetCurrentPage() + 1);
                    setSort(params.request.sortModel);
                    let doRequest = true;
                    if (typeof ref.current.onGridRequest == "function") {
                        doRequest = await ref.current.onGridRequest(api);
                    }
                    let data;
                    if (doRequest === false) {
                        clearData();
                        data = null;
                        console.log("SERVER-REQUEST-FAIL onGridRequest EVENT")
                    } else {
                        data = await _fetchPost();
                        console.log("SERVER-REQUEST", ref, params.request.sortModel, data?.total, data?.rows?.length)
                    }
                    if (data !== null && data?.status !== "error") {
                        params.success({
                            rowData: data.rows,//JSON.parse(JSON.stringify(data.rows)),
                            rowCount: ref.current.totalRows//data.total
                        });
                        if (typeof ref.current.onGridResponse == "function") {
                            await ref.current.onGridResponse(api);
                        }
                    } else {
                        if (typeof ref.current.onGridFailRequest == "function") {
                            await ref.current.onGridFailRequest(api);
                        }
                        params.fail();
                    }
                    api.hideOverlay();
                }
            },
        };
    };

    //                let datasource = dataAPI.dataSourceV4(null, gridApi);
    //gridApi.setGridOption("serverSideDatasource", datasource);

    return {
        init: () => state.init,
        getId: () => ref.current.id,
        first,
        previous,
        setDefaultSort,
        next,
        last,
        dirtyRows,
        newRows,
        currentPage,
        pageSize,
        setRows,
        addRow,
        addRows,
        deleteRow,
        deleteRowByIndex,
        setAllRowsValid,
        updateValue,
        updateValues,
        setData,
        hasData: () => (state.data.rows !== undefined && state.data.rows != null),
        setSort,
        addSort,
        updated,
        clearSort,
        resetSort,
        getDefaultSort,
        clearData,
        addFilters,
        addParameters,
        getPayload,
        getFilters,
        getAllFilters,
        getTimeStamp,
        getPagination,
        getCurrentPage,
        getPageSize,
        getRowOffset,
        getRowsFromTo,
        getPostRequest,
        getParameters,
        getSort,
        getData,
        sortOrder,
        initLoaded,
        setPayload,
        updateRows,
        nav,
        url,
        setAction,
        getActions: () => action.current,
        clearActions,
        isActionPageSize: () => isAction('pageSize'),
        fetchPost: _fetchPost,
        isLoading: () => _isLoading(),
        setIsLoading,
        setTotalRows,
        getTotalRows: (fromState = false) => (fromState) ? getInt(state?.totalRows) : ref.current.totalRows,
        getLength,
        update,
        removeEmpty,
        setFilters,
        setBaseFilters: (f) => ref.current.baseFilter = f,
        baseFilters: () => ref.current.baseFilter,
        setPreFilters: (f) => ref.current.preFilter = f,
        preFilters: () => ref.current.preFilter,
        getIndex,
        status: () => status,
        moveRowDown,
        moveRowUp,
        getPrimaryKey,
        dataSourceV4,
        loadSortStateV4,
        onGridRequest: (fn) => { ref.current.onGridRequest = fn; },
        onGridResponse: (fn) => { ref.current.onGridResponse = fn; },
        onGridFailRequest: (fn) => { ref.current.onGridFailRequest = fn; },
        safePost,
        //validate,
        //validateRows,
        openNotification,
        //validationGroups: vGroups,
        requestsCount: () => ref.current.requestsCount
    }
}







const _filterParser = (value, filter, opTag) => {
    const _op = filter?.op ? filter.op.toLowerCase() : "any";
    if (opTag !== "" && opTag !== "=" && opTag !== "!=" && !value.includes("%") && !value.includes("_")) {
        return `${value}`;
    }
    if (value.includes("%") || value.includes("_")) {
        return `${value}`;
    }
    switch (_op) {
        case 'any': return `%${value.replaceAll(' ', '%%')}%`;
        case 'start': return `${value}%`;
        case 'end': return `%${value}`;
        case 'exact': return `==${value}`;
        default: return `${value}`;
    }
}
const customSplit = (input) => {
    let result = [];
    let insideQuotes = false;
    let currentChunk = '';
    // Rule 0 - trim all spaces not inside '' and all new lines
    //const _input = input.replace(/('[^']*')|\s+/g, (match, group1) => group1 || '');
    const _input = input.replace(/'[^']*'|"[^"]*"|\s+/g, function (match) {
        return match.startsWith("'") || match.startsWith('"') ? match : '';
    });

    for (let i = 0; i < _input.length; i++) {
        const char = _input[i];

        if (char === '"') {
            insideQuotes = !insideQuotes;
            currentChunk += char;
        } else if (insideQuotes) {
            currentChunk += char;
        } else if (char === '&' || char === '|' || char === '(' || char === ')') {
            if (currentChunk.trim() !== '') {
                result.push(currentChunk.trim());
            }
            result.push(char);
            currentChunk = '';
        } else {
            currentChunk += char;
        }
    }

    if (currentChunk.trim() !== '') {
        result.push(currentChunk.trim());
    }

    return result;
}
const prepareInput = (value, wildcards = true, tags = true) => {
    let _v = value;
    if (!tags) {
        const matches = _v.trim().toString().match(filterRegExp);
        _v = matches ? matches[2] : _v.trim().toString();
        _v = _v.replaceAll(",", "&");
        _v = _v.replaceAll(";", "|");
    }
    if (!wildcards) {
        _v = _v.replaceAll("%", "").replaceAll("_", "");
    }
    return _v;
}
const fnValue = (value, fnvalue = null) => {
    if (typeof fnvalue == "function") {
        return fnvalue(value);
    }
    return value;
}
const _computeSort = (_s = []) => {
    return _s.map(v => ({
        ...v,
        ...(v?.id) && {
            column: v.id,
            direction: (v?.dir === 1) ? "ASC" : "DESC",
            sort: (v?.dir === 1) ? "asc" : "desc",
            colId: v.id

        },
        ...(v?.column) && {
            id: v.column,
            dir: (v?.direction === "ASC") ? 1 : -1,
            name: v.column,
            sort: (v?.direction === "ASC") ? "asc" : "desc",
            colId: v.column
        },
        ...(v?.colId) && {
            id: v.colId,
            dir: (v?.sort === "asc") ? 1 : -1,
            column: v.colId,
            name: v.colId,
            direction: (v?.sort === "asc") ? "ASC" : "DESC"
        }
    }));
}
const _mergeObjects = (obj1, obj2) => {
    const result = {};
    if (!obj2) {
        return obj1;
    }
    for (const key in obj1) {
        if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {

            result[key] = clone(obj1[key]);

            for (const grp in result[key].groups) {
                if (grp in obj2[key].groups) {
                    result[key].groups[grp] = { ...result[key].groups[grp], parsed: [...result[key].groups[grp].parsed, ...["and", "(", ...obj2[key].groups[grp].parsed, ")"]] };
                }
            }


        } else if (obj1.hasOwnProperty(key)) {
            result[key] = obj1[key];
        }
    }

    for (const key in obj2) {
        if (obj2.hasOwnProperty(key) && !result.hasOwnProperty(key)) {
            result[key] = obj2[key];
        }
    }

    return result;
}
const _dataPost = (url, method, values, filter, parameters, schema) => {
    //TODO info warning success
    const obj = {
        url, method, values, filter, parameters, schema,
        alerts: { error: [], info: [], warning: [], success: [] },
        success: null,
        valid: true,
        response: null,
        timestamp: new Date(),
        onValidationSuccess: async function (fn) { if (this.valid && typeof fn === "function") { fn(this); } },
        onValidationFail: async function (fn) { if (!this.valid && typeof fn === "function") { fn(this); } },
        onSuccess: async function (fn) { if ((this.valid && this.success) && typeof fn === "function") { fn(this); } },
        onFail: async function (fn) { if (!this.success && typeof fn === "function") { fn(this); } }
    };
    return obj;
}