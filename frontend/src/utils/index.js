import React, { useEffect, useState, useRef } from 'react';
import * as R from 'ramda';
import moment from 'moment';
import dayjs from 'dayjs';
import { DATE_ENGINE } from 'config';

export const unique = (array, key) => {
    const seen = new Set();
    return array.filter((item) => {
        const value = item[key];
        if (!seen.has(value)) {
            seen.add(value);
            return true;
        }
        return false;
    });
}

export const uniqueKeys = (array, key) => {
    const seen = new Set();
    return array.reduce((uniqueArray, item) => {
        const value = item[key];
        if (!seen.has(value)) {
            seen.add(value);
            uniqueArray.push(value);
        }
        return uniqueArray;
    }, []);
}

export const dayjsValue = (value,retValue=null) => {
    if (!value) {
        return retValue;
    }
    if (dayjs.isDayjs(value)) {
        return value;
    }
    if (moment.isMoment(value)) {
        return value;
    }

    let dayjsObj;
    if (value.includes('-')) {
        // Date or datetime value
        dayjsObj = DATE_ENGINE == "moment" ? moment(value) : dayjs(value);
    } else if (value.includes(':')) {
        // Time value
        const timeFormat = (value.split(':').length === 2) ? 'HH:mm' : 'HH:mm:ss';
        dayjsObj = DATE_ENGINE == "moment" ? moment(`1970-01-01T${value}`, timeFormat) : dayjs(`1970-01-01T${value}`, { format: timeFormat });
    } else {
        return retValue; // Invalid format
    }

    if (!dayjsObj.isValid()) {
        return retValue;
    }

    return dayjsObj;
};

export const containsAll = (a1, a2) => {
    for (let i = 0; i < a2.length; i++) {
        if (a1.indexOf(a2[i]) === -1) {
            return false;
        }
    }
    return true;
}


export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const useSubmitting = (val = false) => {
    const [state, setState] = useState(val);
    const currentState = useRef(val);

    const trigger = async (seconds) => {
        if (seconds) {
            await sleep(seconds);
        }
        setState(true);
    }

    const init = () => {
        let ret = false;
        if (!currentState.current) {
            ret = true;
            currentState.current = true;
        }
        return ret;
    }

    const end = async (seconds) => {
        currentState.current = false;
        if (seconds) {
            await sleep(seconds);
        }
        setState(false);
    }

    const initiated = () => {
        return currentState.current
    }

    return { trigger, init, end, initiated, state };

}

export const getFilterRangeValues = (data, force = false, minTime = null, maxTime = null) => {
    let ret = [];
    let _minTime = "";
    let _maxTime = "";
    if (!data?.startValue && !data?.endValue) {
        return undefined;
    }
    if (minTime) {
        _minTime = ` ${minTime}`;
    }
    if (maxTime) {
        _maxTime = ` ${maxTime}`;
    }
    if (data?.startValue) {
        if (_minTime !== "") {
            ret.push(`>=${data.startValue.split(" ")[0]}${_minTime}`);
        } else {
            ret.push(`>=${data.startValue}${_minTime}`);
        }
    } else {
        if (!force) {
            ret.push(null);
        } else {
            if (_minTime !== "") {
                ret.push(`>=${data.endValue.split(" ")[0]}${_minTime}`);
            } else {
                ret.push(`>=${data.endValue}${_minTime}`);
            }
        }
    }
    if (data?.endValue) {
        if (_maxTime !== "") {
            ret.push(`<=${data.endValue.split(" ")[0]}${_maxTime}`);
        } else {
            ret.push(`<=${data.endValue}${_maxTime}`);
        }
    } else {
        if (!force) {
            ret.push(null);
        } else {
            if (_maxTime !== "") {
                ret.push(`<=${data.startValue.split(" ")[0]}${_maxTime}`);
            } else {
                ret.push(`<=${data.startValue}${_maxTime}`);
            }
        }
    }
    return ret;
}

export const getFilterForceRangeValues = (data) => {
    var ret = [];
    if (!data?.startValue && !data?.endValue) {
        return undefined;
    }
    if (data?.startValue) {
        ret.push(`>=${data.startValue}`);
    } else {
        ret.push(`>=${data.endValue}`);
    }
    if (data?.endValue) {
        ret.push(`<=${data.endValue}`);
    } else {
        ret.push(`<=${data.startValue}`);
    }
    return ret;
}


//type = any | start | end | exact
export const getFilterValue = (v, type = 'exact', caseLetter = false) => {
    let val = (v === undefined) ? v : (v?.value === undefined) ? v : v.value;
    val = (val === undefined || val === null) ? val : `${val}`;
    if (val !== '' && val !== undefined) {
        const re = new RegExp('(^==|^=|^!==|^!=|^>=|^<=|^>|^<|^between:|^in:|^!between:|^!in:|isnull|!isnull|^@:)(.*)', 'i');
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

export const isValue = (value, compare, ret = '') => {
    if (value === compare) {
        return ret;
    }
    return value;
}

export const hasValue = (value, compare, ret = '') => {
    if (value === compare) {
        return ret;
    }
    return value;
}

export const noValue = (value, ret = '') => {
    if (!value) {
        return ret;
    }
    return value;
}

export const deepMerge = (a, b) => {
    return (R.is(Object, a) && R.is(Object, b)) ? R.mergeWith(deepMerge, a, b) : b;
}

export const debounce = (fn, time) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
            timeoutId = null
            fn(...args)
        }, time)
    }
}

export const gtinCheckdigit = (input) => {
    let array = input.split('').reverse();
    let total = 0;
    let i = 1;
    array.forEach(number => {
        number = parseInt(number);
        if (i % 2 === 0) {
            total = total + number;
        }
        else {
            total = total + (number * 3);
        }
        i++;
    });

    return (Math.ceil(total / 10) * 10) - total;
}

export const groupBy = (xs, key) => {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};


export const pickAll = (names, obj={},fn=null) => {
    var result = {};
    var idx = 0;
    var len = Array.isArray(names) ? names.length : 0;
    while (idx < len) {
        var name = names[idx];
        if (typeof name == "object") {
            const k = Object.keys(name)[0];
            if (isObject(obj) && (k in obj)) {
                result[name[k]] = fn==null ? obj[k] : fn(k,name[k],obj[k]);
            }
        } else {
            if (isObject(obj) && (name in obj)) {
                result[name] = fn==null ? obj[name] : fn(name,name,obj[name]);
            }
        }
        idx += 1;
    }
    return result;
};

export const deepEqual = (object1, object2) => {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (areObjects && !deepEqual(val1, val2) || !areObjects && val1 !== val2) {
            return false;
        }
    }
    return true;
}

export const isObject = (object) => {
    return object != null && typeof object === 'object';
}

export const secondstoDay = (n) => {
    let day = parseInt(n / (24 * 3600));
    n = n % (24 * 3600);
    let hour = parseInt(n / 3600);
    n %= 3600;
    let minutes = n / 60;
    n %= 60;
    let seconds = n;
    return ((day > 0) ? day + "d " : '') + ((hour > 0) ? hour + "h " : '') + ((minutes.toFixed() > 0) ? minutes.toFixed().padStart(2, '0') + "m" : '');
}


//a function that return the float value from string watch out null values
export const getFloat = (value, fixed = null, ret = 0) => {
    let f = parseFloat(value);
    if (isNaN(f) || f === null || f === undefined) {
        f = ret;
    }
    if (fixed === null) {
        return f;
    } else {
        return parseFloat(f.toFixed(fixed));
    }
}

export const getInt = (value, ret = 0) => {
    let f = parseInt(value);
    if (isNaN(f) || f === null || f === undefined) {
        f = ret;
    }
    return f;
}

export const getPositiveInt = (value, ret = 0) => {
    let f = parseInt(value);
    if (isNaN(f) || f === null || f === undefined) {
        f = ret;
    }
    if (f<0){
        return ret
    }
    return f;
}

export const lpadFloat = (number, length = 2, char = '0') => {
    var str = number.toString();
    var parts = str.split('.');
    var integerPart = parts[0];
    var decimalPart = parts[1] || '';
    var integerLength = integerPart.length;
    var decimalLength = decimalPart.length;
    var zerosToAdd = length - integerLength - decimalLength;

    if (zerosToAdd <= 0) {
        return str;
    }

    var zeros = new Array(zerosToAdd + 1).join(char);
    return zeros + str;
}
