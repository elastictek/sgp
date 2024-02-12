import React, { useEffect, useState, useCallback, useRef } from 'react';

export const validate = async (values = {}, schema, passthrough = true) => {
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

// export const useFormStatus = ({ schema }) => {
//     var fieldStatus = { error: {}, info: {}, warning: {} };
//     var formStatus = { error: [], info: [], warning: [], success: [] };
// }
