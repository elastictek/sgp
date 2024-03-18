import { getFilterRangeValues, dayjsValue } from "utils";
import dayjs from 'dayjs';
import CryptoJS from 'crypto-js';
import { URL_EXPIRATION, ROOT_URL } from "config";

const customSort = (o1, o2) => {
    if (o1 == null) {
        o1 = { tstamp: null };
    }
    if (o2 == null) {
        o2 = { tstamp: null };
    }
    if ('tstamp' in o1 && 'tstamp' in o2) {
        return o2.tstamp - o1.tstamp;
    } else if ('tstamp' in o1) {
        return -1;
    } else if ('tstamp' in o2) {
        return 1;
    } else {
        return 0;
    }
}

const getQueryParameters = () => {
    const queryString = window.location.search.substring(1); // Get the query string excluding the leading '?'
    const params = new URLSearchParams(queryString);
    // const queryParams = {};
    // for (const [param, value] of params.entries()) {
    //   queryParams[param] = value;
    // }
    //return queryParams;
    return params;
}

export const newWindow = (url, data, name, expires = URL_EXPIRATION) => {
    const expirationTime = Date.now() + expires * 60 * 1000; // 5 minutes from now (adjust as needed)
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify({ ...data, expirationTime }), 'secret-key').toString();
    const _url = `${url}?data=${encodeURIComponent(encryptedData)}`;
    window.open(_url, name ? name : '_blank');
}

export default (init, store = {}, props = {}, state = {}, fields=null) => {
    let query = {};
    let df = { ...init };
    let _fields = (fields === null) ? Object.keys({ ...store, ...props, ...state }) : fields;
    const queryParams = getQueryParameters();
    if (queryParams.size > 0) {
        const currentTime = Date.now();
        const encryptedData = queryParams.get('data');
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, 'secret-key');
        query = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
        if (currentTime > query.expirationTime) {
            query = {};
            window.location.href = `${ROOT_URL}/app/linkexpired`;
        }
        _fields.push(...Object.keys({ ...query }));
    }
    const _s = [props, store, state, query].sort(customSort).reverse();
    for (let v of _fields) {
        if (_s[0] && _s[0][v] !== null && _s[0][v] !== undefined) { df[v] = _s[0][v]; }
        if (_s[1] && _s[1][v] !== null && _s[1][v] !== undefined) { df[v] = _s[1][v]; }
        if (_s[2] && _s[2][v] !== null && _s[2][v] !== undefined) { df[v] = _s[2][v]; }
        if (_s[3] && _s[3][v] !== null && _s[3][v] !== undefined) { df[v] = _s[3][v]; }
    }
    return df;
}



export const fixRangeDates = (fields, values = {}) => {
    const _fieldValues = { ...values };
    const _filterValues = { ...values }
    if (!fields) {
        for (let v in values) {
            if ((Array.isArray(_fieldValues[v]))) {
                let _fval = { formatted: {} };
                let _flval = {};
                for (let [i, x] of _fieldValues[v].entries()) {
                    if (x) {
                        let f = (i === 0) ? "startValue" : "endValue";
                        _fval[f] = dayjsValue(x.replace("=", '').replace("<", "").replace(">", ""));
                        _fval.formatted = { ..._fval.formatted, [f]: x.replace("=", '').replace("<", "").replace(">", "") };
                        _flval[f] = x.replace("=", '').replace("<", "").replace(">", "");
                    }
                }
                _filterValues[v] = getFilterRangeValues(_flval);
                _fieldValues[v] = _fval;
            }
        }
    } else {
        for (let v of fields) {
            if ((v in _fieldValues) && (Array.isArray(_fieldValues[v]))) {
                let _fval = { formatted: {} };
                let _flval = {};
                for (let [i, x] of _fieldValues[v].entries()) {
                    if (x) {
                        let f = (i === 0) ? "startValue" : "endValue";
                        _fval[f] = dayjsValue(x.replace("=", '').replace("<", "").replace(">", ""));
                        _fval.formatted = { ..._fval.formatted, [f]: x.replace("=", '').replace("<", "").replace(">", "") };
                        _flval[f] = x.replace("=", '').replace("<", "").replace(">", "");
                    }
                }
                _filterValues[v] = getFilterRangeValues(_flval);
                _fieldValues[v] = _fval;
            }
        }
    }
    return { fieldValues: _fieldValues, filterValues: _filterValues };
}


// export const fixRangeDates = (fields, values = {}) => {
//     const _fieldValues = { ...values };
//     const _filterValues = { ...values }
//     for (let v of fields) {
//         if ((v in _fieldValues) && (Array.isArray(_fieldValues[v]))) {
//             let _fval = { formatted: {} };
//             let _flval = {};
//             for (let [i, x] of _fieldValues[v].entries()) {
//                 if (x) {
//                     let f = (i === 0) ? "startValue" : "endValue";
//                     _fval[f] = dayjs(x.replace("=", '').replace("<", "").replace(">", ""));
//                     _fval.formatted = { ..._fval.formatted, [f]: x.replace("=", '').replace("<", "").replace(">", "") };
//                     _flval[f] = x.replace("=", '').replace("<", "").replace(">", "");
//                 }
//             }
//             _filterValues[v] = getFilterRangeValues(_flval);
//             _fieldValues[v] = _fval;
//         }
//     }
//     return { fieldValues: _fieldValues, filterValues: _filterValues };
// }