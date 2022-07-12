import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchPost } from "./fetch";

const getLocalStorage = (id, useStorage) => {
    if (useStorage && id) {
        return JSON.parse(localStorage.getItem(`dapi-${id}`));
    }
    return {};
}


export const useDataAPI = ({ payload, id, useStorage = true } = {}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dataState, setDataState] = useState({
        pagination: payload?.pagination,
        filter: payload?.filter,
        sort: payload?.sort,
        parameters: payload?.parameters,
        data: (payload?.data) ? payload.data : {},
        url: payload.url,
        ...getLocalStorage(id, useStorage)
    });

    var action = [];
    var _sort = [];
    var _filter = payload?.filter;
    var _pagination = payload?.pagination;
    var _parameters = payload?.parameters;

    const addAction = (type) => {
        if (!action.includes(type))
            action.push(type);
    }

    const isAction = (type) => {
        return action.includes(type);
    }

    const first = (applyState = false) => {
        var _p = (isAction('nav') || isAction('pageSize')) ? _pagination : {};
        addAction('nav');
        _pagination = { ...dataState.pagination, ..._p, page: 1 };
        if (applyState) {
            setDataState(prev => ({ ...prev, pagination: { ...prev.pagination, page: 1 } }));
        }
    }
    const previous = (applyState = false) => {
        addAction('nav');
        _pagination = { ...dataState.pagination, page: ((dataState.pagination.page <= 1) ? 1 : (dataState.pagination.page - 1)) }
        if (applyState) {
            setDataState(prev => ({ ...prev, pagination: { ...prev.pagination, page: ((prev.page <= 1) ? 1 : (prev.page - 1)) } }));
        }
    }
    const next = (applyState = false) => {
        addAction('nav');
        _pagination = { ...dataState.pagination, page: (dataState.pagination.page + 1) };
        if (applyState) {
            setDataState(prev => ({ ...prev, pagination: { ...prev.pagination, page: (prev.page + 1) } }));
        }
    }
    const last = (applyState = false) => {
        addAction('nav');
        _pagination = { ...dataState.pagination, page: -1 };
        if (applyState) {
            setDataState(prev => ({ ...prev, pagination: { ...prev.pagination, page: -1 } }));
        }
    }
    const currentPage = (page = 1, applyState = false) => {
        addAction('nav');
        _pagination = { ...dataState.pagination, page: ((page <= 1) ? 1 : page) };
        if (applyState) {
            setDataState(prev => ({ ...prev, pagination: { ...prev.pagination, page: ((page <= 1) ? 1 : page) } }));
        }
    }
    const pageSize = (size = 10, applyState = false) => {
        addAction('pageSize');
        _pagination = { ...dataState.pagination, pageSize: size };
        if (applyState) {
            setDataState(prev => ({ ...prev, pagination: { ...prev.pagination, pageSize: size } }));
        }
    }
    const _addSort = ({ columnKey, field, order, ...rest }) => {
        const column = (columnKey) ? columnKey : field;
        const direction = (order == "ascend") ? "ASC" : "DESC";
        let idx = _sort.findIndex(v => (v.column === column));
        if (idx >= 0) {
            const array = [..._sort];
            array[idx] = { column, direction, order, table: rest.column.table };
            _sort = array;
        } else {
            _sort = [..._sort, { column, direction, order, table: rest.column.table }];
        }
    }

    const addSort = (obj, applyState = false) => {
        addAction('sort');
        _sort = [];
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
        if (applyState) {
            setDataState(prev => ({ ...prev, sort: _sort }));
        }
    };

    const resetSort = (applyState = false) => {
        addAction('sort');
        _sort = [...payload.sort];
        if (applyState) {
            setDataState(prev => ({ ...prev, sort: _sort }));
        }
    }

    const clearSort = (applyState = false) => {
        addAction('sort');
        console.log("CLEARING SORT....", payload);
        _sort = [];
        if (applyState) {
            setDataState(prev => ({ ...prev, sort: _sort }));
        }
    }

    const addFilters = (obj, assign = true, applyState = false) => {
        addAction('filter');
        if (assign) {
            _filter = obj;
            if (applyState) {
                setDataState(prev => ({ ...prev, filter: { ...obj } }));
            }
        } else {
            _filter = { ...dataState.filter, ..._filter, ...obj };
            if (applyState) {
                setDataState(prev => ({ ...prev, filter: { ..._filter } }));
            }

        }
    }

    const addParameters = (obj, assign = true, applyState = false) => {
        addAction('parameters');
        if (assign) {
            console.log("ADD PARAMETERS->", obj);
            _parameters = obj;
            if (applyState) {
                setDataState(prev => ({ ...prev, parameters: { ...obj } }));
            }
        } else {
            throw ("TODO----FILTER SPREAD...");
        }
    }

    const getPayload = (fromState = false) => {
        if (fromState) {
            return {
                pagination: { ...dataState.pagination },
                filter: { ...dataState.filter },
                sort: [...dataState.sort],
                parameters: { ...dataState.parameters }
            }
        } else {
            return {
                pagination: { ...((isAction('nav') || isAction('pageSize'))) ? _pagination : dataState.pagination },
                filter: { ...(isAction('filter')) ? _filter : dataState.filter },
                sort: [...(isAction('sort')) ? _sort : dataState.sort],
                parameters: { ...(isAction('parameters')) ? _parameters : dataState.parameters }
            }
        }
    }

    const getPagination = (fromState = false) => {

        if (fromState) {
            //console.log("return true pagination--------->",dataState.pagination)
            return { ...dataState.pagination };
        } else {
            return { ..._pagination };
        }
    };

    const getPageSize = (fromState = false) => {
        if (fromState) {
            return (dataState.pagination.pageSize !== undefined) ? dataState.pagination.pageSize : 10;
        } else {
            return (_pagination.pageSize !== undefined) ? _pagination.pageSize : 10;
        }
    };

    const getFilter = (fromState = false) => {
        if (fromState) {
            return { ...dataState.filter };
        } else {
            return { ..._filter };
        }
    }

    const getAllFilter = () => {
        return { ...dataState.filter, ..._filter };
    }

    const getParameters = () => {
        return { ...dataState.parameters, ..._parameters };
    }

    const sortOrder = (columnkey) => {
        if (dataState.sort) {
            let item = dataState.sort.find(v => (v.column === columnkey));
            return (item) ? item.order : false;
        }
        return false;
    };

    const getSort = (fromState = false) => {
        if (fromState) {
            return [...dataState.sort];
        } else {
            return [..._sort];
        }
    }

    const setData = (data, payload) => {
        console.log("SETTING DATA", payload.pagination, (isAction('nav') || isAction('pageSize')))
        setDataState(prev => ({
            ...prev,
            ...((isAction('nav') || isAction('pageSize')) && { pagination: { ...prev.pagination, ...payload.pagination } }),
            ...(isAction('filter') && { filter: { ...prev.filter, ...payload.filter } }),
            ...(isAction('sort') && { sort: [...payload.sort] }),
            ...(isAction('parameters') && { parameters: { ...prev.parameters, ...payload.parameters } }),
            data: { ...data }
        }));
        action = [];
    }

    const clearData = () => {
        setDataState(prev => ({ ...prev, data: {} }));
    }

    const getData = () => {
        return { ...dataState.data };
    }

    const _fetchPost = ({ url, token } = {}) => {
        let _url = (url) ? url : dataState.url;
        const payload = {...getPayload(), tstamp:Date.now()};
        setIsLoading(true);
        (async () => {
            if (id && useStorage) {
                localStorage.setItem(`dapi-${id}`, JSON.stringify(payload));
            }
            const dt = (await fetchPost({ url: _url, ...payload, cancelToken: token })).data;
            setData(dt, payload);
            setIsLoading(false);
        })();
    }

    const getPostRequest = ({ url }) => {
        return { url: (url) ? url : dataState.url, ...getPayload() };
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

    const url = () => {
        return dataState.url;
    }

    const printState = (print = false) => {
        const { data, ...rest } = dataState;
        if (print) {
            console.log("STATE -> ", JSON.stringify(rest));
        } else {
            return JSON.stringify(rest);
        }
    }

    const _isLoading = () => {
        return isLoading;
    }

    const getTimeStamp = ()=>{
        return dataState.tstamp;
    }

    return {
        first,
        previous,
        next,
        last,
        currentPage,
        pageSize,
        setData,
        hasData: () => (dataState.data.rows !== undefined),
        addSort,
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
        nav,
        url,
        isActionPageSize: () => isAction('pageSize'),
        fetchPost: _fetchPost,
        isLoading: () => _isLoading()
    }
}