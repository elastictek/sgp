import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { fetchPost } from "./fetch";
import { Modal } from 'antd';
import { deepEqual, pickAll, getInt } from 'utils';
import { produce, finishDraft } from 'immer';
import { useImmer } from "use-immer";
import { json, includeObjectKeys } from "utils/object";
import { validateMessages } from './schemaValidator';
import { uid } from 'uid';

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

const _getStatus = (vObject, { formStatus = { error: [], warning: [], info: [], success: [] }, fieldStatus = {} } = {}, rowKey, rowIndex) => {
    const ret = { errors: 0, warnings: 0, formStatus: { ...formStatus }, fieldStatus: { ...fieldStatus } };
    ret.value = vObject?.value;
    if (vObject?.error) {
        for (const itm of vObject.error?.details) {
            ret.errors++;
            if (itm.path.length > 0) {
                if (!(rowKey in ret.fieldStatus)) {
                    ret.fieldStatus[rowKey] = { [itm.path[0]]: { status: "error", col: itm.path[0], msg: [{ message: itm.message }] } };
                } else {
                    ret.fieldStatus[rowKey] = { ...ret.fieldStatus[rowKey], [itm.path[0]]: { status: "error", col: itm.path[0], msg: [{ message: itm.message }] } };
                }
                ret.fieldStatus[rowKey]["row"] = rowIndex;
            } else {
                ret.formStatus.error.push({ message: itm.message });
            }
        }
    }
    if (vObject?.warning) {
        for (const itm of vObject.warning?.details) {
            ret.warnings++;
            if (itm.path.length > 0) {
                if (!(rowKey in ret.fieldStatus)) {
                    ret.fieldStatus[rowKey] = { [itm.path[0]]: { status: "warning", col: itm.path[0], msg: [{ message: itm.message }] } };
                } else {
                    ret.fieldStatus[rowKey] = { ...ret.fieldStatus[rowKey], [itm.path[0]]: { status: "warning", col: itm.path[0], msg: [{ message: itm.message }] } };
                }
                ret.fieldStatus[rowKey]["row"] = rowIndex;
            } else {
                ret.formStatus.warning.push({ message: itm.message });
            }
        }
    }
    return ret;
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

export const useDataAPI = ({ payload, id, useStorage = true, fnPostProcess } = {}) => {
    const [status, updateStatus] = useImmer({ fieldStatus: {}, formStatus: {}, errors: 0, warnings: 0 });
    const statusRef = useRef({ fieldStatus: {}, formStatus: {}, errors: 0, warnings: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const action = useRef([]);
    const [state, updateState] = useImmer({
        init: false,
        initLoaded: payload?.initLoaded || false,
        dsV4StateInit: false,
        update: Date.now(),
        pagination: payload?.pagination || { enabled: false, pageSize: 10 },
        filter: payload?.filter || {},
        baseFilter: payload?.baseFilter ? { ...payload.baseFilter } : {},
        preFilter: payload?.preFilter ? { ...payload.preFilter } : {},
        defaultSort: _computeSort(payload?.sort),
        sort: payload?.sort || [],
        parameters: payload?.parameters || {},
        primaryKey: payload?.primaryKey || null,
        data: (payload?.data) ? payload.data : {},
        withCredentials: payload?.withCredentials || null,
        url: payload?.url,
        ...getLocalStorage(id, useStorage),
        totalRows: 0
    });
    const ref = useRef({
        init: false,
        id: id,
        initLoaded: payload?.initLoaded || false,
        update: null,
        primaryKey: payload?.primaryKey || null,
        pagination: payload?.pagination ? { ...payload.pagination } : { enabled: false, pageSize: 10 },
        filter: payload?.filter ? { ...payload.filter } : {},
        baseFilter: payload?.baseFilter ? { ...payload.baseFilter } : {},
        preFilter: payload?.preFilter ? { ...payload.preFilter } : {},
        defaultSort: _computeSort(payload?.sort),
        sort: payload?.sort ? [...payload.sort] : [],
        parameters: payload?.parameters ? { ...payload.parameters } : {},
        withCredentials: payload?.withCredentials || null,
        url: payload?.url,
        ...getLocalStorage(id, useStorage),
        totalRows: 0
    });

    useEffect(() => {
        ref.current.init = true;
        updateState(draft => {
            draft.init = true;
        });
    }, []);

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
    const getSkip = (fromState) => {
        console.log("----DEPRECATED----getSkip");
        if (fromState) {
            return (state.pagination.page - 1) * state.pagination.pageSize;
        } else {

            return (ref.current.pagination.page - 1) * ref.current.pagination.pageSize;
        }
    };
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

    const _totalRows = (rows, total) => {
        if (total) {
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

        const _trows = ignoreTotalRows ? data?.rows?.length ?? 0 : _totalRows(data?.rows, data?.total);

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
        const payload = getPayload(fromState);
        payload.tstamp = Date.now();
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
                const dt = (await fetchPost({ url: _url, norun, ...(_withCredentials !== null && { withCredentials: _withCredentials }), ...payload, filter: { ..._mergeObjects(ref.current.filter, ref.current.preFilter?.filter), ...ref.current.baseFilter }, ...((signal) ? { signal } : { cancelToken: token }) })).data;
                if (typeof rowFn === "function") {
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

    const validateRows = (schema, status = {}, options = {}, rows = null) => {
        let _accStatus = status?.status ? status?.status : {};
        let _errors = status?.errors ? status?.errors : 0;
        let _warnings = status?.warnings ? status?.warnings : 0;
        const _rows = rows ? rows : state.data.rows;
        let _schema = schema;
        if (typeof schema === "function") {
            _schema = schema();
        }
        for (const [i, v] of _rows.entries()) {
            if (v?.rowvalid === 0 || v?.rowadded === 1) {
                let { errors, warnings, value, ..._status } = _getStatus(_schema.validate(v, { abortEarly: false, messages: validateMessages, context: {}, ...options }), _accStatus, v[getPrimaryKey()], i);
                _accStatus = _status;
                _errors = _errors + errors;
                _warnings = _warnings + warnings;
            }
        }
        statusRef.current = {
            errors: _errors,
            warnings: _warnings,
            fieldStatus: _accStatus?.fieldStatus || {},
            formStatus: _accStatus?.formStatus || {},
        };
        updateStatus(draft => {
            draft.errors = _errors;
            draft.warnings = _warnings;
            draft.fieldStatus = _accStatus?.fieldStatus || {};
            draft.formStatus = _accStatus?.formStatus || {};
        });
        return { ..._accStatus, errors: _errors, warnings: _warnings };
    }

    const validateRow = (schema, status = {}, options = {}, row = {}, rowIndex) => {
        let _accStatus = status?.status ? status?.status : {};
        let _errors = status?.errors ? status?.errors : 0;
        let _warnings = status?.warnings ? status?.warnings : 0;
        let _schema = schema;
        if (typeof schema === "function") {
            _schema = schema();
        }
        let { errors, warnings, value, ..._status } = _getStatus(_schema.validate(row, { abortEarly: false, messages: validateMessages, context: {}, ...options }), _accStatus, row[getPrimaryKey()], rowIndex);
        _accStatus = _status;
        _errors = _errors + errors;
        _warnings = _warnings + warnings;
        return ({
            errors: _errors,
            warnings: _warnings,
            fieldStatus: _accStatus?.fieldStatus || {},
            formStatus: _accStatus?.formStatus || {},
        });
    }

    const _updateRowStatus = ({ errors = 0, warnings = 0, fieldStatus, formStatus }, rowKey, updateState = true) => {
        const _gridStatus = { ...statusRef.current };
        _gridStatus.fieldStatus = { ..._gridStatus.fieldStatus, [rowKey]: fieldStatus?.[rowKey] };
        const _alerts = getNumAlerts(_gridStatus);
        statusRef.current = {
            errors: _alerts.errors,
            warnings: _alerts.warnings,
            fieldStatus: _gridStatus.fieldStatus || {}
        };
        if (updateState) {
            updateStatus(draft => {
                draft.errors = statusRef.current.errors;
                draft.warnings = statusRef.current.warnings;
                draft.fieldStatus = statusRef.current.fieldStatus
            });
        }
    }

    const _updateStatus = (_status = null) => {
        if (_status) {
            statusRef.current = {
                errors: _status?.errors,
                warnings: _status?.warnings,
                fieldStatus: _status.fieldStatus || {},
                formStatus: _status?.formStatus || {}
            };
        }
        updateStatus(draft => {
            draft.errors = statusRef.current.errors;
            draft.warnings = statusRef.current.warnings;
            draft.fieldStatus = statusRef.current.fieldStatus;
            draft.formStatus = statusRef.current.formStatus;
        });
    }

    const clearRowStatus = (rowKey) => {
        const _gridStatus = { ...status };
        let _errors = 0;
        let _warnings = 0;
        if (_gridStatus?.fieldStatus?.[rowKey]) {
            const _keys = Object.keys(_gridStatus?.fieldStatus?.[rowKey]);
            for (let v of _keys) {
                if (_gridStatus?.fieldStatus?.[rowKey]?.[v].status === "error") {
                    _errors += _gridStatus?.fieldStatus?.[rowKey]?.[v].msg.length;
                } else {
                    _warnings += _gridStatus?.fieldStatus?.[rowKey]?.[v].msg.length;
                }
            }
            delete _gridStatus?.fieldStatus?.[rowKey];
        }
        _gridStatus.errors = _gridStatus.errors - _errors;
        _gridStatus.warnings = _gridStatus.warnings - _warnings;
        statusRef.current = {
            errors: _gridStatus.errors,
            warnings: _gridStatus.warnings,
            fieldStatus: _gridStatus?.fieldStatus || {},
            formStatus: _gridStatus?.formStatus || {},
        };
        updateStatus(draft => {
            draft.errors = _gridStatus.errors;
            draft.warnings = _gridStatus.warnings;
            draft.fieldStatus = _gridStatus?.fieldStatus || {};
            draft.formStatus = _gridStatus?.formStatus || {};
        });
        return _gridStatus;
    }

    const clearStatus = () => {
        statusRef.current = { errors: 0, warnings: 0, fieldStatus: {}, formStatus: {} };
        updateStatus(draft => { draft.fieldStatus = {}; draft.formStatus = {}; draft.errors = 0; draft.warnings = 0; });
    }

    const validateField = (schema, rowKey, column, value, rowIndex) => {
        let { errors, warnings, fieldStatus, formStatus } = _getStatus(schema({ keys: [column], wrapArray: false }).validate({ [column]: value }, { abortEarly: false, messages: validateMessages, context: {} }), {}, rowKey, rowIndex);
        let _gridStatus = { ...status };
        //const _gridStatus = JSON.parse(JSON.stringify(gridStatus));
        if (_gridStatus?.fieldStatus?.[rowKey]?.[column]) {
            _gridStatus.fieldStatus[rowKey]["row"] = rowIndex;
            if (_gridStatus?.fieldStatus?.[rowKey]?.[column].status === "error") {
                _gridStatus.errors = _gridStatus.errors - _gridStatus?.fieldStatus?.[rowKey]?.[column].msg.length;
            } else {
                _gridStatus.warnings = _gridStatus.warnings - _gridStatus?.fieldStatus?.[rowKey]?.[column].msg.length;
            }
            delete _gridStatus?.fieldStatus?.[rowKey]?.[column];
        }
        _gridStatus.fieldStatus = { ..._gridStatus.fieldStatus, [rowKey]: { ..._gridStatus?.fieldStatus?.[rowKey], ...fieldStatus?.[rowKey] } };
        _gridStatus.errors = _gridStatus.errors + errors;
        _gridStatus.warnings = _gridStatus.warnings + warnings;
        statusRef.current = {
            errors: _gridStatus.errors,
            warnings: _gridStatus.warnings,
            fieldStatus: _gridStatus?.fieldStatus,
            formStatus: _gridStatus?.formStatus
        };
        updateStatus(draft => {
            draft.errors = _gridStatus.errors;
            draft.warnings = _gridStatus.warnings;
            draft.fieldStatus = _gridStatus.fieldStatus;
            draft.formStatus = _gridStatus.formStatus;
        });
        return _gridStatus;
        // let { errors, warnings, fieldStatus, formStatus } = _getStatus(schema({ keys: [column], wrapArray: false }).validate({ [column]: value }, { abortEarly: false, messages: validateMessages, context: {} }), {}, rowIndex);
        // const _gridStatus = JSON.parse(JSON.stringify(gridStatus));
        // if (_gridStatus?.fieldStatus?.[rowIndex]?.[column]) {
        //     if (_gridStatus?.fieldStatus?.[rowIndex]?.[column].status === "error") {
        //         _gridStatus.errors = _gridStatus.errors - _gridStatus?.fieldStatus?.[rowIndex]?.[column].msg.length;
        //     } else {
        //         _gridStatus.warnings = _gridStatus.warnings - _gridStatus?.fieldStatus?.[rowIndex]?.[column].msg.length;
        //     }
        //     delete _gridStatus?.fieldStatus?.[rowIndex]?.[column];
        // }
        // _gridStatus.fieldStatus[rowIndex] = { ..._gridStatus?.fieldStatus?.[rowIndex], ...fieldStatus[rowIndex] };
        // _gridStatus.errors = _gridStatus.errors + errors;
        // _gridStatus.warnings = _gridStatus.warnings + warnings;
        // return _gridStatus;
    }

    const getMessages = (_status = null) => {
        const _s = _status ? _status : status;
        const messages = { error: [], warning: [] };
        for (const rowKey of Object.keys(_s?.fieldStatus)) {

            for (const col of Object.keys(_s.fieldStatus?.[rowKey] || {})) {
                if (col !== "row") {
                    const item = _s.fieldStatus[rowKey][col];
                    for (const msg of item.msg) {
                        messages[item.status].push(`#${_s.fieldStatus[rowKey]?.["row"] + 1} ${msg?.message}`);
                    }
                }
            }
        }
        if (_s.formStatus?.error) {
            for (const msg of _s.formStatus?.error) {
                if (typeof msg === 'object' && msg !== null && 'message' in msg) {
                    messages["error"].push(`${msg.message}`);
                } else {
                    messages["error"].push(`${msg}`);
                }
            }
        }
        if (_s.formStatus?.warning) {
            for (const msg of _s.formStatus?.warning) {
                if (typeof msg === 'object' && msg !== null && 'message' in msg) {
                    messages["warning"].push(`${msg.message}`);
                } else {
                    messages["warning"].push(`${msg}`);
                }
            }
        }
        return messages;
    }

    const getNumAlerts = (gridStatus = null) => {
        const _gridStatus = gridStatus ? gridStatus : statusRef.current;
        const messages = { errors: 0, warnings: 0 };
        for (const rowKey of Object.keys(_gridStatus?.fieldStatus || {})) {
            for (const col of Object.keys(_gridStatus?.fieldStatus?.[rowKey] || {})) {
                if (col !== "row") {
                    const item = _gridStatus?.fieldStatus[rowKey][col];
                    for (const msg of item.msg) {
                        if (item.status === "error") {
                            messages.errors = messages.errors + 1;
                        }
                        if (item.status === "warning") {
                            messages.warnings = messages.warnings + 1;
                        }
                    }
                }
            }
        }
        if (_gridStatus?.formStatus?.error) {
            for (const msg of _gridStatus?.formStatus?.error) {
                messages.errors = messages.errors + 1;
            }
        }
        if (_gridStatus?.formStatus?.warning) {
            for (const msg of _gridStatus?.formStatus?.warning) {
                messages.warnings = messages.warnings + 1;
            }
        }
        return messages;
    }

    const getFieldStatus = (key) => {
        if (key) {
            return status.fieldStatus?.[key];
        }
        return status.fieldStatus;
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

    /** Only for AG-GRID */
    const dataSourceV4 = (gridRef) => {
        return {
            getRows: async (params) => {
                const { api } = gridRef?.current || params;
                if (!ref.current.dsV4StateInit) {
                    //load Grid State through dataAPI
                    let _sort = getSort();
                    _sort = (_sort && _sort.length > 0) ? _sort : _computeSort(getDefaultSort());
                    params.api.applyColumnState({
                        state: _sort.map(v => includeObjectKeys(v, ["colId", "sort"])),
                        defaultState: { sort: null },
                        applyOrder: false
                    });
                    ref.current.dsV4StateInit = true;
                }
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
                    console.log("SERVER-REQUEST")
                    api.showLoadingOverlay();
                    currentPage(api.paginationGetCurrentPage() + 1);
                    setSort(params.request.sortModel);
                    const data = await _fetchPost();
                    if (data !== null && data?.status !== "error") {
                        params.success({
                            rowData: JSON.parse(JSON.stringify(data.rows)),
                            rowCount: data.total
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
        validateRows,
        validateRow,
        validateField,
        clearRowStatus,
        updateRowStatus: _updateRowStatus,
        status: () => status,
        updateStatus: _updateStatus,
        clearStatus,
        getMessages,
        getFieldStatus,
        moveRowDown,
        moveRowUp,
        getPrimaryKey,
        dataSourceV4
    }
}