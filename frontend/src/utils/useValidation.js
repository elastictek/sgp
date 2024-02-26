import React, { useEffect, useState, useCallback, useRef } from 'react';
import { _fieldZodDescription } from './schemaZodRules';
import { is, isEmpty, isNil, isNotNil } from 'ramda';
import { updateByPath, valueByPath } from './object';
import { getValue, isNullOrEmpty } from 'utils';


const _dataValidation = (values, schema) => {
    //TODO info warning success
    const obj = {
        values, schema,
        alerts: { error: [], info: [], warning: [], success: [] },
        valid: true,
        timestamp: new Date(),
        onValidationSuccess: async function (fn) { if (this.valid && typeof fn === "function") { return fn(this); } },
        onValidationFail: async function (fn) { if (!this.valid && typeof fn === "function") { return fn(this); } },
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

const _reverseMapping = (_vg) => {
    const r = {};
    for (const key in _vg) {
        const items = _vg[key];
        items.forEach(item => {
            if (!r[item]) {
                r[item] = [];
            }
            r[item].push(key);
            if (item !== key) {
                r[item].push(`${key}.${item}`);
            }
        });
    }
    return r;
}


export const rules = () => {
    let message = "";
    let valid = true;
    const errors = [];
    let _previousPath = null;
    return (value, path, { name } = {}) => {
        let _path = path ? path : "";
        let v = _path == "" ? value : valueByPath(value, _path);
        let _name = name;
        message = { valid: true, path: _path.split(",") };

        const _newPath = () => {
            console.log("path", _previousPath, _path)
            if (_previousPath !== _path) {
                valid = true;
                _previousPath = _path;
            }
        }
        _newPath();

        const _parseNumber = (val, ret = null) => {
            if (isNullOrEmpty(val)) {
                return ret;
            }
            return parseFloat(val);
        }

        const _isNumber = (val, _allowNullOrEmpty = false) => {
            if (_allowNullOrEmpty) {
                if (isNullOrEmpty(val)) {
                    return true;
                }
            }
            return ((is(Number, val) && !isNaN(val)) || (is(String, val) && !isNaN(parseFloat(val))));
        }

        const _error = (txt) => {
            valid = false;
            message = { valid, path: _path.split(","), error: txt };
            errors.push(message);
        };

        const clear = () => {
            errors.length = 0;
            valid = true;
            message = { valid: true, path: _path.split(",") };
        }

        const number = () => {
            const _n = _parseNumber(v);
            if (valid && !_isNumber(_n, true)) {
                _error(`${getValue(_name, "O valor")} tem de ser um valor numérico.`);
                console.log("number--->", _path, valid, v, _isNumber(_n), errors)
            }
            return obj;
        }
        const positive = (allowZero = false) => {
            const _n = _parseNumber(v);
            let _tester = false;
            if (_isNumber(_n)) {
                if (allowZero) {
                    if (_n >= 0) {
                        _tester = true;
                    }
                } else {
                    if (_n > 0) {
                        _tester = true;
                    }
                }
            }
            if (valid && _tester === false) {
                _error(`${getValue(_name, "O valor")} tem de ser um valor positivo.`);
            }
            return obj;
        }
        const negative = (allowZero = false) => {
            const _n = _parseNumber(v);
            let _tester = false;
            if (_isNumber(_n)) {
                if (allowZero) {
                    if (_n <= 0) {
                        _tester = true;
                    }
                } else {
                    if (_n < 0) {
                        _tester = true;
                    }
                }
            }
            if (valid && _tester === false) {
                _error(`${getValue(_name, "O valor")} tem de ser um valor negativo.`);
            }
            return obj;
        }
        const min = (_min, { name: _nameref } = {}) => {
            if (!_isNumber(_min)) {
                return obj;
            }
            const _n = _parseNumber(v);
            if (valid && (!_isNumber(_n) || (_n < _min))) {
                _error(`${getValue(_name, "O valor")} tem de ser maior ou igual a ${_min}${_nameref ? ` (${_nameref})` : ""}.`);
            }
            return obj;
        }
        const max = (_max, { name: _nameref } = {}) => {
            if (!_isNumber(_max)) {
                return obj;
            }
            const _n = _parseNumber(v);
            if (valid && (!_isNumber(_n) || (_n > _max))) {
                _error(`${getValue(_name, "O valor")} tem de ser menor ou igual a ${_max}${_nameref ? ` (${_nameref})` : ""}.`);
            }
            return obj;
        }

        const between = (_min, _max, { including = true, nameMin: _minref, nameMax: _maxref } = {}) => {
            if (!_isNumber(_min) || !_isNumber(_max)) {
                return obj;
            }
            const _n = _parseNumber(v);
            let _tester = false;
            if (_isNumber(_n)) {
                if (including) {
                    if (_n >= _min && _n <= _max) {
                        _tester = true;
                    }
                } else {
                    if (_n > _min && _n < _max) {
                        _tester = true;
                    }
                }
            }
            if (valid && _tester === false) {
                _error(`${getValue(_name, "O valor")} tem de estar entre ${_min}${_minref ? ` (${_minref})` : ""} e ${_max}${_maxref ? ` (${_maxref})` : ""}.`);
                console.log("between--->", _path, valid, v, _min, _max, _isNumber(_n), errors)
            }
            return obj;
        }

        const required = () => {
            if (valid && isNullOrEmpty(v)) {
                _error(`${getValue(_name, "O valor")} é obrigatório.`);
                console.log("required--->", _path, valid, v, isNullOrEmpty(v), errors)
            }
            return obj;
        }

        const obj = {
            number,
            positive,
            negative,
            min,
            max,
            between,
            required,
            valid: () => !errors.some(v => v.valid == false),
            errors: () => errors,
            clear
        };
        return obj;
    }
};


export const setValidationGroups = (vg) => {
    const def = vg;
    const reversed = _reverseMapping(vg);

    const groupPaths = (path) => {
        if (reversed?.[path]) {
            return [path, ...reversed[path]];
        }
        return [path];
    }

    const _groups = (_vg, _path) => {
        const g = {};
        for (const key in _vg) {
            const idx = _vg[key].findIndex(item => item === _path);
            if (idx >= 0) {
                g[key] = _vg[key];
            }
        }
    }
    const _createGroupsData = (data) => {
        const _data = Array.isArray(data) ? [...data] : { ...data };
        for (const groupName in def) {
            const groupItems = def[groupName];
            _data[groupName] = {};
            groupItems.forEach(item => {
                _data[groupName] = updateByPath(_data[groupName], item, valueByPath(_data, item));
            });
        }
        return _data;
    }

    const r = {
        obj: def,
        data: _createGroupsData,
        reversed,
        groupPaths
        //groups: (path) => _groups(vg, path)
        // alerts: { error: [], info: [], warning: [], success: [] },
        // success: null,
        // valid: true,
        // response: null,
        // timestamp: new Date(),
        // onValidationSuccess: async function (fn) { if (this.valid && typeof fn === "function") { fn(this); } },
        // onValidationFail: async function (fn) { if (!this.valid && typeof fn === "function") { fn(this); } },
        // onSuccess: async function (fn) { if ((this.valid && this.success) && typeof fn === "function") { fn(this); } },
        // onFail: async function (fn) { if (!this.success && typeof fn === "function") { fn(this); } }
    };
    return r;
}

export const validate = async (data, schema, { passthrough = true, validationGroups, fn } = {}) => {
    let validation = null;
    let p = _dataValidation(null, schema);
    p.timestamp = new Date();
    const _data = (fn && typeof fn === "function") ? fn(data) : data;
    try {
        if (isNotNil(validationGroups)) {
            validation = passthrough ? await p.schema.passthrough().spa(validationGroups.data(_data)) : await p.schema.spa(validationGroups.data(_data));
        } else {
            validation = passthrough ? await p.schema.passthrough().spa(_data) : await p.schema.spa(_data);
        }
    } catch (e) {
        console.log(e);
        validation = { success: false, error: { errors: [...e.issues] } };
    }
    p.valid = (p.valid === true) ? validation.success : p.valid;
    if (!validation.success) {
        const _errors = validation?.error.errors.map(v => ({ ...v, field: v.path.join('.'), label: _fieldZodDescription(schema, v.path), type: "props" }));
        p.alerts.error = _errors;
    } else {
        p.alerts.error = null;
    }
    p.values = _data;
    return p;
}


// export const validate = async (values = {}, schema, { passthrough = true, validationGroups, fn } = {}) => {
//     let validation = null;
//     let p = _dataValidation(values, schema);
//     p.timestamp = new Date();
//     console.log("########",p)
//     validation = passthrough ? await p.schema.passthrough().spa(p.values) : await p.schema.spa(p.values);
//     p.valid = validation.success;
//     if (!validation.success) {
//         const _errors = validation?.error.errors.map(v => ({ ...v, field: v.path.join('.'), label: _fieldZodDescription(schema, v.path), type: "props" }));
//         p.alerts.error.push(..._errors);
//     }
//     return p;
// }

export const validateRows = async (rows = [], schema, nodeId, { passthrough = true, validationGroups, fn } = {}) => {
    let validation = null;
    let p = _dataRowsValidation(null, schema);
    p.timestamp = new Date();
    const _rows = [];
    for (const row of rows) {
        const _row = (fn && typeof fn === "function") ? fn(row) : row;
        _rows.push(_row);
        try {
            if (isNotNil(validationGroups)) {
                validation = passthrough ? await p.schema.passthrough().spa(validationGroups.data(_row)) : await p.schema.spa(validationGroups.data(_row));
            } else {
                validation = passthrough ? await p.schema.passthrough().spa(_row) : await p.schema.spa(_row);
            }
        } catch (e) {
            console.log(e);
            validation = { success: false, error: { errors: [...e.issues] } };
        }
        p.valid = (p.valid === true) ? validation.success : p.valid;
        if (!validation.success) {
            const _errors = validation?.error.errors.map(v => ({ ...v, field: v.path.join('.'), label: _fieldZodDescription(schema, v.path), type: "props" }));
            p.alerts.error[_row[nodeId]] = _errors;
        } else {
            p.alerts.error[_row[nodeId]] = null;
        }
    }
    p.values = (_rows.length === 0) ? rows : _rows;
    return p;
}

export const validateList = async (rows = [], schema, { passthrough = true, validationGroups, fn } = {}) => {
    let validation = null;
    let p = _dataRowsValidation(null, schema);
    p.timestamp = new Date();
    const _rows = [];
    for (const [index, row] of rows.entries()) {
        const _row = (fn && typeof fn === "function") ? fn(row) : row;
        _rows.push(_row);
        try {
            if (isNotNil(validationGroups)) {
                validation = passthrough ? await p.schema.passthrough().spa(validationGroups.data(_row)) : await p.schema.spa(validationGroups.data(_row));
            } else {
                validation = passthrough ? await p.schema.passthrough().spa(_row) : await p.schema.spa(_row);
            }
        } catch (e) {
            console.log(e);
            validation = { success: false, error: { errors: [...e.issues] } };
        }
        p.valid = (p.valid === true) ? validation.success : p.valid;
        if (!validation.success) {
            const _errors = validation?.error.errors.map(v => ({ ...v, field: v.path.join('.'), label: _fieldZodDescription(schema, v.path), type: "props", index }));
            p.alerts.error[index] = _errors;
        } else {
            p.alerts.error[index] = null;
        }
    }
    p.values = (_rows.length === 0) ? rows : _rows;
    return p;
}

// export const useFormStatus = ({ schema }) => {
//     var fieldStatus = { error: {}, info: {}, warning: {} };
//     var formStatus = { error: [], info: [], warning: [], success: [] };
// }
