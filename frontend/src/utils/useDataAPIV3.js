import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { fetchPost } from "./fetch";
import { Modal } from 'antd';
import { deepEqual, pickAll } from 'utils';
import { useImmer } from "use-immer";
import { validateMessages } from './schemaValidator';

export const getLocalStorage = (id, useStorage) => {
    if (useStorage && id) {
        return JSON.parse(localStorage.getItem(`dapi-${id}`));
    }
    return {};
}

const _getStatus = (vObject, { formStatus = { error: [], warning: [], info: [], success: [] }, fieldStatus = {} } = {}, rowIndex) => {
    const ret = { errors: 0, warnings: 0, formStatus: { ...formStatus }, fieldStatus: { ...fieldStatus } };
    ret.value = vObject?.value;
    if (vObject?.error) {
        for (const itm of vObject.error?.details) {
            ret.errors++;
            if (itm.path.length > 0) {
                if (!(rowIndex in ret.fieldStatus)) {
                    ret.fieldStatus[rowIndex] = { [itm.path[0]]: { status: "error", col: itm.path[0], msg: [{ message: itm.message }] } };
                } else {
                    ret.fieldStatus[rowIndex] = { ...ret.fieldStatus[rowIndex], [itm.path[0]]: { status: "error", col: itm.path[0], msg: [{ message: itm.message }] } };
                }
            } else {
                ret.formStatus.error.push({ message: itm.message });
            }
        }
    }
    if (vObject?.warning) {
        for (const itm of vObject.warning?.details) {
            ret.warnings++;
            if (itm.path.length > 0) {
                if (!(rowIndex in ret.fieldStatus)) {
                    ret.fieldStatus[rowIndex] = { [itm.path[0]]: { status: "warning", col: itm.path[0], msg: [{ message: itm.message }] } };
                } else {
                    ret.fieldStatus[rowIndex] = { ...ret.fieldStatus[rowIndex], [itm.path[0]]: { status: "warning", col: itm.path[0], msg: [{ message: itm.message }] } };
                }
            } else {
                ret.formStatus.warning.push({ message: itm.message });
            }
        }
    }
    return ret;
}


export const useDataAPI = ({ payload, id, useStorage = true, fnPostProcess } = {}) => {
    const [isLoading, setIsLoading] = useState(false);
    const action = useRef([]);
    const [state, updateState] = useImmer({
        initLoaded: payload?.initLoaded || false,
        update: Date.now(),
        pagination: payload?.pagination || { enabled: false, pageSize: 10 },
        filter: payload?.filter || {},
        defaultSort: payload?.sort || [],
        sort: payload?.sort || [],
        parameters: payload?.parameters || {},
        data: (payload?.data) ? payload.data : {},
        withCredentials: payload?.withCredentials || null,
        url: payload?.url,
        ...getLocalStorage(id, useStorage)
    });
    const ref = useRef({
        initLoaded: payload?.initLoaded || false,
        update: null,
        pagination: payload?.pagination ? { ...payload.pagination } : { enabled: false, pageSize: 10 },
        filter: payload?.filter ? { ...payload.filter } : {},
        defaultSort: payload?.sort || [],
        sort: payload?.sort ? [...payload.sort] : [],
        parameters: payload?.parameters ? { ...payload.parameters } : {},
        withCredentials: payload?.withCredentials || null,
        url: payload?.url,
        ...getLocalStorage(id, useStorage)
    });

    const addAction = (type) => {
        if (!action.current.includes(type))
            action.current.push(type);
    }
    const isAction = (type) => {
        return action.current.includes(type);
    }


    const first = (updateStateData = false) => {
        addAction('nav');
        ref.current.pagination = { ...ref.current.pagination, page: 1 };
        if (updateStateData) {
            updateState(draft => {
                draft.pagination = ref.current.pagination;
            });
        }
    }
    const previous = (updateStateData = false) => {
        addAction('nav');
        ref.current.pagination = { ...ref.current.pagination, page: ((ref.current.pagination.page <= 1) ? 1 : (ref.current.pagination.page - 1)) };
        if (updateStateData) {
            updateState(draft => {
                draft.pagination = ref.current.pagination;
            });
        }
    }
    const next = (updateStateData = false) => {
        addAction('nav');
        ref.current.pagination = { ...ref.current.pagination, page: (ref.current.pagination.page + 1) };
        if (updateStateData) {
            updateState(draft => {
                draft.pagination = ref.current.pagination;
            });
        }
    }
    const last = (updateStateData = false) => {
        addAction('nav');
        ref.current.pagination = { ...ref.current.pagination, page: -1 };
        if (updateStateData) {
            updateState(draft => {
                draft.pagination = ref.current.pagination;
            });
        }
    }
    const currentPage = (page = 0, updateStateData = false) => {
        addAction('nav');
        ref.current.pagination = { ...ref.current.pagination, page: ((page <= 0) ? 0 : page) };
        if (updateStateData) {
            updateState(draft => {
                draft.pagination = ref.current.pagination;
            });
        }
    }
    const pageSize = (size = 10, updateStateData = false) => {
        addAction('pageSize');
        ref.current.pagination = { ...ref.current.pagination, pageSize: size }
        if (updateStateData) {
            updateState(draft => {
                draft.pagination = ref.current.pagination;
            });
        }
    }


    const setSort = (obj, defaultObj = [], updateStateData = false) => {
        addAction('sort');
        const _s = (obj && obj.length > 0) ? obj : defaultObj;
        ref.current.sort = _s.map(v => ({
            ...v,
            ...(v?.id) && {
                column: v.id,
                direction: (v.dir === 1) ? "ASC" : "DESC"
            },
            ...(v?.column) && {
                id: v.column,
                dir: (v.direction === "ASC") ? 1 : -1,
                name: v.column
            }
        }));
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

    const _addSort = ({ columnKey, field, name, id, order, ...rest }) => {
        const column = (columnKey) ? columnKey : (name) ? name : (id) ? id : field;
        const direction = (order == "ascend" || order == "ASC" || order == 1) ? "ASC" : "DESC";
        let idx = ref.current.sort.findIndex(v => (v.column === column));
        if (idx >= 0) {
            const array = [...ref.current.sort];
            array[idx] = { column, name: column, id: column, dir: direction === "ASC" ? 1 : -1, direction, order, table: rest.column.table };
            ref.current.sort = array;
        } else {
            ref.current.sort = [...ref.current.sort, { column, name: column, id: column, dir: direction === "ASC" ? 1 : -1, direction, order, table: rest.column.table }];
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
    const getSkip = (fromState = false) => {
        if (fromState) {
            return (state.pagination.page - 1) * state.pagination.pageSize;
        } else {
            return (ref.current.pagination.page - 1) * ref.current.pagination.pageSize;
        }
    };
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

    const getFilter = (fromState = false) => {
        if (fromState) {
            return { ...state.filter };
        } else {
            return { ...ref.current.filter };
        }
    }
    const getAllFilter = () => {
        return { ...state.filter, ...ref.current.filter };
    }
    const getParameters = () => {
        return { ...state.parameters, ...ref.current.parameters };
    }

    const removeEmpty = (obj) => {
        return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null && v !== '' && v !== undefined));
    }

    const update = (keepAction = false, payload = {}) => {
        ref.current.updated = Date.now();
        updateState(draft => {
            draft.updated = ref.current.updated;
            draft.pagination = ref.current.pagination;
            draft.filter = ref.current.filter;
            draft.sort = ref.current.sort;
            draft.parameters = ref.current.parameters;
            draft.tstamp = ref.current.tstamp;
            draft.withCredentials = ref.current.withCredentials;
            draft.url = ref.current.url;

            if (payload?.pagination) { draft.pagination = payload?.pagination; }
            if (payload?.filter) { draft.filter = payload?.filter; }
            if (payload?.sort) { draft.sort = payload?.sort; }
            if (payload?.parameters) { draft.parameters = payload?.parameters; }
            if (payload?.tstamp) { draft.tstamp = payload?.tstamp; }
            if (payload?.withCredentials) { draft.withCredentials = payload?.withCredentials; }
            if (payload?.url) { draft.url = payload?.url; }

        });
        if (!keepAction) {
            action.current = [];
        }
    }

    const setData = (data, payload) => {
        ref.current.initLoaded = (ref.current.initLoaded === false) ? true : ref.current.initLoaded;
        updateState(draft => {
            draft.initLoaded = ref.current.initLoaded;
            draft.data = { ...data };
            //draft.updated = Date.now();
            draft.pagination = ref.current.pagination;
            draft.filter = ref.current.filter;
            draft.sort = ref.current.sort;
            draft.parameters = ref.current.parameters;
            //draft.tstamp = ref.current.tstamp;
            draft.withCredentials = ref.current.withCredentials;
            draft.url = ref.current.url;
            draft.tstamp = Date.now();


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
                    _rows.splice(at, 0, { ...row, rowadded: 1 });
                } else {
                    _rows.push({ ...row, rowadded: 1 });
                }
                if (typeof cb === "function") {
                    _rows = cb(_rows);
                }
                updateState(draft => {
                    draft.tstamp = Date.now();
                    draft.data = { rows: [..._rows], total: state.data.total + 1 };
                });
            }
        } else {
            if (typeof cb === "function") {
                _rows = cb(_rows);
            }
            updateState(draft => {
                draft.tstamp = Date.now();
                draft.data = { rows: [{ ...row, rowadded: 1 }], total: 1 };
            });
        }
    }
    const addRows = (rows, at = null, cb = null) => {
        let _rows = [...state?.data?.rows || []];
        if (_rows && _rows.length > 0) {
            if (at !== null) {
                _rows.splice(at, 0, rows.map(v => ({ ...v, rowadded: 1 })));
            } else {
                _rows.push(rows.map(v => ({ ...v, rowadded: 1 })));
            }
            if (typeof cb === "function") {
                _rows = cb(_rows);
            }
            updateState(draft => {
                draft.tstamp = Date.now();
                draft.data = { rows: [..._rows], total: state.data.total + rows.length };
            });
        } else {
            if (typeof cb === "function") {
                _rows = cb(_rows);
            }
            updateState(draft => {
                draft.tstamp = Date.now();
                draft.data = { rows: rows.map(v => ({ ...v, rowadded: 1 })), total: rows.length };
            });
        }
    }
    const setRows = (rows, total = null) => {
        updateState(draft => {
            draft.tstamp = Date.now();
            draft.data = { rows: [...rows], total: (total === null) ? state?.data?.total : total };
        });
    }
    const deleteRow = (data, keys) => {
        const _rows = [...state.data.rows];
        if (_rows) {
            const idx = _rows.findIndex(v => deepEqual(pickAll(keys, v), data));
            if (idx >= 0) {
                _rows.splice(idx, 1);
                updateState(draft => {
                    draft.tstamp = Date.now();
                    draft.data = { rows: [..._rows], total: state.data.total - 1 }
                });
            }
        }
    }
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
                    draft.data = { rows: [..._rows], total: state.data.total };
                });
            }
        }
    }
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
                    draft.data = { rows: [..._rows], total: state.data.total };
                });
            }
        }
    }
    const clearData = () => {
        updateState(draft => {
            draft.tstamp = Date.now();
            draft.data = {};
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
    const _fetchPost = async ({ url, withCredentials = null, token, signal, rowFn, fromSate = false } = {}) => {
        let _url = (url) ? url : ref.current.url;
        let _withCredentials = (withCredentials !== null) ? withCredentials : ref.current.withCredentials;
        const payload = getPayload(fromSate);
        payload.tstamp = Date.now();
        setIsLoading(true);
        return (async () => {
            let ret = null;
            //let ok = true;
            if (id && useStorage) {
                localStorage.setItem(`dapi-${id}`, JSON.stringify(payload));
            }
            try {
                const dt = (await fetchPost({ url: _url, ...(_withCredentials !== null && { withCredentials: _withCredentials }), ...payload, ...((signal) ? { signal } : { cancelToken: token }) })).data;
                if (typeof rowFn === "function") {
                    ret = await rowFn(dt);
                    setData(ret, payload);
                } else if (typeof fnPostProcess === "function") {
                    ret = await fnPostProcess(dt);
                    setData(ret, payload);
                } else {
                    ret = dt;
                    setData(ret, payload);
                }
            } catch (e) {
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
        return { url: (url) ? url : ref.current.url, ...getPayload(fromState) };
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

    const validateRows = (schema, status = {}, options = {}) => {
        let _accStatus = status?.status ? status?.status : {};
        let _errors = status?.errors ? status?.errors : 0;
        let _warnings = status?.warnings ? status?.warnings : 0;
        for (const [i, v] of state.data.rows.entries()) {
            if (v?.rowvalid === 0 || v?.rowadded === 1) {
                let { errors, warnings, value, ..._status } = _getStatus(schema().validate(v, { abortEarly: false, messages: validateMessages, context: {}, ...options }), _accStatus, i);
                _accStatus = _status;
                _errors = _errors + errors;
                _warnings = _warnings + warnings;
            }
        }
        return { ..._accStatus, errors: _errors, warnings: _warnings };
    }

    const validateField = (schema, column, value, rowIndex, gridStatus) => {
        let { errors, warnings, fieldStatus, formStatus } = _getStatus(schema({ keys: [column], wrapArray: false }).validate({ [column]: value }, { abortEarly: false, messages: validateMessages, context: {} }), {}, rowIndex);
        const _gridStatus = JSON.parse(JSON.stringify(gridStatus));
        if (_gridStatus?.fieldStatus?.[rowIndex]?.[column]) {
            if (_gridStatus?.fieldStatus?.[rowIndex]?.[column].status === "error") {
                _gridStatus.errors = _gridStatus.errors - _gridStatus?.fieldStatus?.[rowIndex]?.[column].msg.length;
            } else {
                _gridStatus.warnings = _gridStatus.warnings - _gridStatus?.fieldStatus?.[rowIndex]?.[column].msg.length;
            }
            delete _gridStatus?.fieldStatus?.[rowIndex]?.[column];
        }
        _gridStatus.fieldStatus[rowIndex] = { ..._gridStatus?.fieldStatus?.[rowIndex], ...fieldStatus[rowIndex] };
        _gridStatus.errors = _gridStatus.errors + errors;
        _gridStatus.warnings = _gridStatus.warnings + warnings;
        return _gridStatus;
    }

    const getMessages = (gridStatus) => {
        const messages = { error: [], warning: [] };
        for (const row of Object.keys(gridStatus?.fieldStatus)) {
            for (const col of Object.keys(gridStatus.fieldStatus[row])) {
                const item = gridStatus.fieldStatus[row][col];
                for (const msg of item.msg) {
                    messages[item.status].push(`#${row + 1} ${msg?.message}`);
                }
            }
        }
        if (gridStatus.formStatus?.error) {
            for (const msg of gridStatus.formStatus?.error) {
                messages["error"].push(`${msg}`);
            }
        }
        if (gridStatus.formStatus?.warning) {
            for (const msg of gridStatus.formStatus?.warning) {
                messages["warning"].push(`${msg}`);
            }
        }
        return messages;
    }

    return {
        first,
        previous,
        next,
        last,
        dirtyRows,
        newRows,
        currentPage,
        getSkip,
        pageSize,
        setRows,
        addRow,
        addRows,
        deleteRow,
        updateValue,
        updateValues,
        setData,
        hasData: () => (state.data.rows !== undefined),
        setSort,
        addSort,
        updated,
        clearSort,
        resetSort,
        clearData,
        addFilters,
        addParameters,
        getPayload,
        getFilter,
        getAllFilter,
        getTimeStamp,
        getPagination,
        getPageSize,
        getPostRequest,
        getParameters,
        getSort,
        getData,
        sortOrder,
        initLoaded,
        nav,
        url,
        setAction,
        getActions: () => action.current,
        clearActions,
        isActionPageSize: () => isAction('pageSize'),
        fetchPost: _fetchPost,
        isLoading: () => _isLoading(),
        setIsLoading,
        update,
        removeEmpty,
        setFilters,
        validateRows,
        validateField,
        getMessages
    }
}