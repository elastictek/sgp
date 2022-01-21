import * as R from 'ramda';

export const getFilterRangeValues = (data) => {
    var ret = [];
    if (!data?.startValue && !data?.endValue) {
        return undefined;
    }
    if (data?.startValue) {
        ret.push(`>=${data.startValue}`);
    }
    if (data?.endValue) {
        ret.push(`<=${data.endValue}`);
    }
    return ret;
}

//type = any | start | end | exact
export const getFilterValue = (v, type = 'exact') => {
    const val = (v === undefined) ? v : (v?.value === undefined) ? v : v.value;
    if (val !== '' && val !== undefined) {
        switch (type) {
            case 'any': return `%${val.replaceAll(' ', '%%')}%`;
            case 'start': return `${val}%`;
            case 'end': return `${val}%`;
            default: return val;
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