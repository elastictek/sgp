import React, { useEffect, useState, useCallback, useRef, useMemo, useContext } from 'react';
import { fetchPost } from "./fetch";
import { Modal } from 'antd';
import { deepEqual, pickAll, getInt, sleep } from 'utils';
import { produce, finishDraft } from 'immer';
import { useImmer } from "use-immer";
import { json, includeObjectKeys } from "utils/object";
import { uid } from 'uid';
import { isEmpty, isNil } from 'ramda';
import { AppContext } from "app";

//const filterRegExp = new RegExp('(^==|^=|^!==|^!=|^>=|^<=|^>|^<|^between:|^btw:|^in:|^!btw|^!between:|^!in:|isnull|!isnull|^@:)(.*)', 'i');
export const filterRegExp = new RegExp(/(==|=|!==|!=|>=|<=|>|<|between:|btw:|in:|!btw|!between:|!in:|isnull|!isnull|@:|:)(.*)/, 'i');

export const parseFilter = (name, parsed, { group = "t1", type = "input", options = {} }) => {
    return { [name]: { parsed: Array.isArray(parsed) ? parsed : [parsed], group, type, ...options } };
}

const _filterParser = (value, filter, opTag) => {
    const _op = filter?.op ? filter.op.toLowerCase() : "any";
    if (opTag !== "" && opTag !== "=" && opTag !== "!=" && !value.includes("%")) {
        return `${value}`;
    }
    if (value.includes("%")) {
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

// const _fixConditions = (v) => {
//     // Rule 0 - trim all spaces not inside '' and all new lines
//     let input = v.replace(/('[^']*')|\s+/g, (match, group1) => group1 || '');

//     // Rule 1
//     input = input.replace(/([^&|\(])\(/g, '$1&(');
//     input = input.replace(/\(\s*[&|]/g, '(');

//     // Rule 2
//     input = input.replace(/\)([^&|\)])/g, ')&$1');

//     // Rule 3
//     input = input.replace(/([^&|\(])\(/g, '$1&(');

//     // Rule 4
//     input = input.replace(/\)([^&|\)])/g, ')&$1');

//     // Rule 5
//     input = input.replace(/([&|])\1+/g, '$1');





//     // Rule 6
//     const openParenCount = (input.match(/\(/g) || []).length;
//     const closeParenCount = (input.match(/\)/g) || []).length;
//     const parenDiff = openParenCount - closeParenCount;

//     if (parenDiff > 0) {
//         for (let i = 0; i < parenDiff; i++) {
//             input += ')';
//         }
//     } else if (parenDiff < 0) {
//         for (let i = 0; i < -parenDiff; i++) {
//             input = '(' + input;
//         }
//     }

//     return input;
// }

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

export const filtersDef = (filters, gridRef, all = false) => {
    let _idx = filters?.toolbar.indexOf("@columns");
    let _newfilters = (_idx >= 0) ? [...filters?.toolbar.slice(0, _idx), ...gridRef.current.api.getColumnDefs().filter(v => !filters?.no.includes(v.field)), ...filters?.toolbar.slice(_idx)] : [...filters?.toolbar];
    if (all) {
        let _idx = filters?.more.indexOf("@columns");
        let _morefilters = (_idx >= 0) ? [...filters?.more.slice(0, _idx), ...gridRef.current.api.getColumnDefs().filter(v => !filters?.no.includes(v.field)), ...filters?.more.slice(_idx)] : [...filters?.more];
        _newfilters = [..._newfilters, ..._morefilters, "fcustom"];
    }
    const _f = {};
    for (const v of _newfilters.filter(v => v !== "@columns" && v !== undefined)) {
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
            _f[v.field] = {
                type: v?.type ? v.type : _f?.[v.field]?.type ? _f[v.field]?.type : "input",
                name: v.field,
                alias: v?.colId ? v.colId : v?.alias ? v.alias : _f?.[v.field]?.colId ? _f[v.field]?.colId : _alias,
                style: v?.style ? v?.style : _f?.[v.field]?.style ? _f[v.field]?.style : null,
                op: v?.op ? v.op : _f?.[v.field]?.op ? _f[v.field]?.op : null,
                label: v?.label ? v.label : _f?.[v.field]?.label ? _f[v.field]?.label : _headerName ? _headerName : v.field,
                col: v?.col ? v.col : _f?.[v.field]?.col ? _f[v.field]?.col : "content",
                mask: v?.mask ? v.mask : _f?.[v.field]?.mask ? _f[v.field]?.mask : null,
                group: v?.group ? v.group : _f?.[v.field]?.group ? _f[v.field]?.group : "t1",
                multi: v?.multi ? v.multi : _f?.[v.field]?.multi ? _f[v.field]?.multi : false,
                // exp: v?.exp ? v.exp : _f?.[v.field]?.exp ? _f[v.field]?.exp : null,
                options: v?.options ? v.options : _f?.[v.field]?.options ? _f[v.field]?.options : null,
                case: v?.case ? v.case : _f?.[v.field]?.case ? _f[v.field]?.case : "i",
            }
        } else {
            const _s = gridRef.current.api.getColumnDefs().find(x => x.field === v);
            const _headerName = _s?.headerName;
            let _alias = _s?.colId;
            if (!_alias) {
                _alias = v;
            }
            _f[v] = {
                type: _f?.[v]?.type ? _f[v]?.type : "input",
                name: v,
                alias: _f?.[v]?.alias ? _f[v]?.alias : _alias,
                style: _f?.[v]?.style ? _f[v]?.style : null,
                op: _f?.[v]?.op ? _f[v]?.op : null,
                label: _f?.[v]?.label ? _f[v]?.label : _headerName ? _headerName : v,
                col: _f?.[v]?.col ? _f[v]?.col : "content",
                mask: _f?.[v]?.mask ? _f[v]?.mask : null,
                group: _f?.[v]?.group ? _f[v]?.group : "t1",
                multi: _f?.[v]?.multi ? _f[v]?.multi : false,
                // exp: _f?.[v]?.exp ? _f[v]?.exp : null,
                options: _f?.[v]?.options ? _f[v]?.options : null,
                case: _f?.[v]?.case ? _f[v]?.case : "i",
            }
        }
    }
    return Object.values(_f);
};

export const processConditions = (inputValue, filterDef, rel = "and", logic = "") => {
    let _input = inputValue;
    if (isNil(inputValue) || isEmpty(inputValue)) {
        return null;
    }
    if (typeof inputValue === 'object' && !Array.isArray(inputValue)) {
        _input = inputValue?.value;
        if (isNil(_input) || isEmpty(_input)) {
            return null;
        }
    }
    if (Array.isArray(_input)) {
        if (_input.length == 0) { return null; }
        console.log("processed--->", { value: _input, parsed: [`${logic}in:${_input.join(",")}`], logic, ...filterDef });
        return { value: _input, parsed: [`${logic}in:${_input.join(",")}`], logic, ...filterDef };

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
    const conditionsArray = customSplit(_input);
    console.log("conditions", conditionsArray)
    const _values = [];
    const _parsedvalues = [];
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
                    const _t = (_opTag === "") ? "==" : "";
                    _value.push(value);
                    _parsedvalue.push(`${_t}${value}`);
                } else if (filterDef.type === "number") {
                    if (isNaN(+value)) {
                        _valid = false;
                        break;
                    } else {
                        const _t = (_opTag === "") ? "==" : (_opTag === "=") ? "=" : "";
                        _value.push(value);
                        _parsedvalue.push(`${_t}${value.replace(/\n/g, '')}`);
                    }
                } else if (filterDef.type === "date") {
                    const parsedDate = dayjs(value, { strict: true });
                    if (!parsedDate.isValid()) {
                        _valid = false;
                        break;
                    } else {
                        const _t = (_opTag === "") ? "==" : (_opTag === "=") ? "=" : "";
                        _value.push(parsedDate.format(DATE_FORMAT));
                        _parsedvalue.push(`${_t}${value.replace(/\n/g, '')}`);
                    }
                } else if (filterDef.type === "datetime") {
                    const parsedDate = dayjs(value, { strict: true });
                    if (!parsedDate.isValid()) {
                        _valid = false;
                        break;
                    } else {
                        const _t = (_opTag === "") ? "==" : (_opTag === "=") ? "=" : "";
                        _value.push(parsedDate.format(DATETIME_FORMAT));
                        _parsedvalue.push(`${_t}${value.replace(/\n/g, '')}`);
                    }
                } else if (filterDef.type === "time") {
                    const parsedDate = dayjs(value, TIME_FORMAT);
                    if (!parsedDate.isValid()) {
                        _valid = false;
                        break;
                    } else {
                        const _t = (_opTag === "") ? "==" : (_opTag === "=") ? "=" : "";
                        _value.push(parsedDate.format(TIME_FORMAT));
                        _parsedvalue.push(`${_t}${value.replace(/\n/g, '')}`);
                    }
                } else {
                    const _v = filterDef.case === "i" ? value.toLowerCase() : value;
                    _value.push(value);
                    _parsedvalue.push(_filterParser(_v.replace(/\n/g, ''), filterDef, _opTag));
                }
            }
            if (_valid) {
                _values.push(`${_opTag}${_value.join(",")}`);
                _parsedvalues.push(`${_opTag}${_parsedvalue.join(",")}`);
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
    console.log("processed--->", { value: _values.join(""), parsed: _parsedvalues, rel, ...filterDef });
    return { value: _values.join(""), parsed: _parsedvalues, rel, ...filterDef };
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
};

const _mergeObjects = (obj1, obj2) => {
    const result = {};
    if (!obj2) {
        return obj1;
    }
    for (const key in obj1) {
        if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
            result[key] = {
                ...obj1[key],
                parsed: obj1[key].parsed.concat(["and", "(", ...obj2[key].parsed, ")"])
            };
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

const _dataValidation = (values, schema) => {
    //TODO info warning success
    const obj = {
        values, schema,
        alerts: { error: [], info: [], warning: [], success: [] },
        valid: true,
        timestamp: new Date(),
        onValidationSuccess: async function (fn) { if (this.valid && typeof fn === "function") { fn(this); } },
        onValidationFail: async function (fn) { if (!this.valid && typeof fn === "function") { fn(this); } },
    };
    return obj;
}

const _dataRowsValidation = (values, schema) => {
    //TODO info warning success
    const obj = {
        values, schema,
        alerts: { error: {}, info: {}, warning: {}, success: {} },
        valid: true,
        timestamp: new Date(),
        onValidationSuccess: async function (fn) { if (this.valid && typeof fn === "function") { return fn(this); } },
        onValidationFail: async function (fn) { if (!this.valid && typeof fn === "function") { return fn(this); } },
    };
    return obj;
}


export const useDataAPI = ({ payload, id, useStorage = true, fnPostProcess } = {}) => {
    const { openNotification } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);
    const action = useRef([]);
    const apiversion = "4"
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
        primaryKey: payload?.primaryKey || null,
        data: (payload?.data) ? payload.data : {},
        withCredentials: payload?.withCredentials || null,
        url: payload?.url,
        ...getLocalStorage(id, useStorage),
        baseFilter: payload?.baseFilter ? { ...payload.baseFilter } : {},
        totalRows: 0
    });
    const ref = useRef({
        init: false,
        id: id,
        dsV4StateInit: false,
        initLoaded: payload?.initLoaded || false,
        update: null,
        primaryKey: payload?.primaryKey || null,
        pagination: payload?.pagination ? { ...payload.pagination } : { enabled: false, pageSize: 10 },
        filter: payload?.filter ? { ...payload.filter } : {},
        preFilter: payload?.preFilter ? { ...payload.preFilter } : {},
        defaultSort: _computeSort(payload?.sort),
        sort: [],//sort: payload?.sort ? [...payload.sort] : [],
        parameters: payload?.parameters ? { ...payload.parameters } : {},
        withCredentials: payload?.withCredentials || null,
        url: payload?.url,
        ...getLocalStorage(id, useStorage),
        baseFilter: payload?.baseFilter ? { ...payload.baseFilter } : {},
        sortMap: payload?.sortMap ? { ...payload.sortMap } : {},
        totalRows: 0
    });

    useEffect(() => {
        ref.current.init = true;
        updateState(draft => {
            draft.init = true;
        });
    }, []);



    const _fieldZodDescription = (schema, path) => {
        const parts = Array.isArray(path) ? path : path.split('.');
        let descriptions = "";
        for (const part of parts) {
            if (schema && !schema?.shape?.[part] && schema?._def?.schema) {
                schema = schema._def.schema.shape[part];
                if (schema?.description) {
                    descriptions = `${descriptions} ${schema?.description}`;
                }
            } else if (schema && schema?.shape) {
                schema = schema.shape[part];
                if (schema?.description) {
                    descriptions = `${descriptions} ${schema?.description}`;
                }
            } else {
                return null;
            }
        }
        return descriptions !== "" ? descriptions : parts.join(".");
    }

    const validate = async (values = {}, schema, passthrough = true) => {
        let validation = null;
        let p = _dataValidation(values, schema);
        p.timestamp = new Date();
        validation = passthrough ? await p.schema.passthrough().spa(p.values) : await p.schema.spa(p.values);
        p.valid = validation.success;
        if (!validation.success) {
            const _errors = validation?.error.errors.map(v => ({ ...v, field: v.path.join('.'), label: _fieldZodDescription(schema, v.path), type: "props" }));
            p.alerts.error.push(..._errors);
        }
        return p;
    }

    const validateRows = async (rows = [], schema, nodeId, passthrough = true) => {
        let validation = null;
        let p = _dataRowsValidation(rows, schema);
        p.timestamp = new Date();
        for (const row of p.values) {
            validation = passthrough ? await p.schema.passthrough().spa(row) : await p.schema.spa(row);
            p.valid = (p.valid === true ) ? validation.success : p.valid;
            if (!validation.success) {
                const _errors = validation?.error.errors.map(v => ({ ...v, field: v.path.join('.'), label: _fieldZodDescription(schema, v.path), type: "props" }));
                p.alerts.error[row[nodeId]] = _errors;
            }else{
                p.alerts.error[row[nodeId]] = null;
            }
        }
        return p;
    }

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
                response = await fetchPost({ url: p.url, filter: p.filter, parameters: { method: p.method, ...p.parameters, apiversion: "4" } });
                p.response = response?.data;
                if (!response || response?.data?.status !== "success") {
                    p.success = false;
                    p.alerts.error.push({ code: "RUN_ERROR", message: response?.data?.title, type: "run_fail" });
                    if (notify && notify.includes("run_fail")) {
                        openNotification("error", "top", "Notificação", response?.data?.title);
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
            return { ...state.pagination };
        } else {
            return { ...ref.current.pagination };
        }
    };
    const getPageSize = (fromState = false) => {
        if (fromState) {
            return state.pagination.pageSize;
        } else {
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
            if (fakeTotal === true) {
                const _len = (rows && Array.isArray(rows)) ? rows.length : 0;
                return (_len < getPageSize()) ? _len : total;
            }
            return total;
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

        ref.current.totalRows = _trows;
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
                ref.current.totalRows = _total;
                updateState(draft => {
                    draft.tstamp = Date.now();
                    draft.data = { rows: [..._rows], total: _total };
                    draft.totalRows = _total;
                });
            }
        } else {
            _rows = [{ ...row, rowadded: 1, rowvalid: 0 }];
            const _total = _totalRows(_rows, 1);
            ref.current.totalRows = _total;
            if (typeof cb === "function") {
                _rows = cb(_rows);
            }
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
            ref.current.totalRows = _total;
            if (typeof cb === "function") {
                _rows = cb(_rows);
            }
            updateState(draft => {
                draft.tstamp = Date.now();
                draft.data = { rows: _rows, total: _total };
                draft.totalRows = _total;
            });
        }
    }
    const setRows = (rows, total = null) => {
        const _total = _totalRows(rows, (total === null) ? ref.current.totalRows : total);
        ref.current.totalRows = _total;
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
            ref.current.totalRows = _total;
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
            ref.current.totalRows = _total;
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
                updateState(draft => {
                    draft.tstamp = Date.now();
                    draft.data = { rows: [..._rows], total: draft.data.total }
                });
            }
        }
        return _rows;
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
                ref.current.updated = Date.now();
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
                ref.current.updated = Date.now();
                updateState(draft => {
                    draft.updated = ref.current.updated;
                    draft.data = { rows: [..._rows], total: ref.current.totalRows };
                });
            }
        }
        return _rows;
    }

    const clearData = () => {
        ref.current.totalRows = 0;
        updateState(draft => {
            draft.tstamp = Date.now();
            draft.data = {};
            draft.totalRows = 0;
        });
    }
    const getData = () => {
        return { ...state.data };
    }
    // const _fetchPost = async ({ url, withCredentials = null, token, signal, rowFn, fromSate = false } = {}) => {
    //     console.log("FETCH POST-------")
    //     let _url = (url) ? url : ref.current.url;
    //     let _withCredentials = (withCredentials !== null) ? withCredentials : ref.current.withCredentials;
    //     const payload = getPayload(fromSate);
    //     payload.tstamp = Date.now();
    //     setIsLoading(true);
    //     let ret = null;
    //     //let ok = true;
    //     if (id && useStorage) {
    //         localStorage.setItem(`dapi-${id}`, JSON.stringify(payload));
    //     }
    //     try {
    //         const dt = (await fetchPost({ url: _url, ...(_withCredentials !== null && { withCredentials: _withCredentials }), ...payload, ...((signal) ? { signal } : { cancelToken: token }) })).data;
    //         if (typeof rowFn === "function") {
    //             ret = await rowFn(dt);
    //             setData(ret, payload);
    //         } else if (typeof fnPostProcess === "function") {
    //             ret = await fnPostProcess(dt);
    //             setData(ret, payload);
    //         } else {
    //             ret = dt;
    //             setData(ret, payload);
    //         }
    //     } catch (e) {
    //         Modal.error({ content: e.message });
    //         //ok = false;
    //         ret = null;
    //     }
    //     setIsLoading(false);
    //     return ret;
    //     //return ok;
    // }
    const _fetchPost = async ({ url, withCredentials = null, token, signal, rowFn, fromState = false, ignoreTotalRows = false, norun = false, ...rest } = {}) => {
        let _url = (url) ? url : ref.current.url;
        let _withCredentials = (withCredentials !== null) ? withCredentials : ref.current.withCredentials;
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
            state: _sort.map(v => includeObjectKeys(v, ["colId", "sort"])),
            defaultState: { sort: null },
            applyOrder: false
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
                    const data = await _fetchPost();
                    console.log("SERVER-REQUEST", ref, params.request.sortModel, data.total, data.rows.length)
                    if (data !== null && data?.status !== "error") {
                        params.success({
                            rowData: data.rows,//JSON.parse(JSON.stringify(data.rows)),
                            rowCount: ref.current.totalRows//data.total
                        });
                    } else {
                        params.fail();
                    }
                    api.hideOverlay();
                }
            },
        };
    };

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
        safePost,
        validate,
        validateRows,
        openNotification
    }
}