import Joi from 'joi';
import dayjs from 'dayjs';

export const validate = (schema, onlyExistingValues = [], mapper = {}, parameters = {}) => {
    return async (req, res, next) => {
        const itemKey = (req.method == "POST") ? "body" : "query";
        let ret = {};
        let err = [];
        for (const key in schema) {
            try {
                let value;
                const datakey = (key in mapper) ? mapper[key] : key;
                const data = (datakey in req[itemKey]) ? req[itemKey][datakey] : {};
                if (typeof schema[key] === "function") {
                    if (onlyExistingValues.includes(key)) {
                        value = await schema[key](Object.keys(data), parameters).validateAsync(data);
                    } else {
                        value = await schema[key](undefined, parameters).validateAsync(data);
                    }
                } else {
                    value = await schema[key].validateAsync(data);
                }
                ret = { ...ret, ...{ [datakey]: value } };
            } catch (error) {
                err = [...err, ...error.details.map(x => x.message)];
            }
        }
        if (err.length == 0) {
            req.body = { ...req.body, ...ret };
            next();
        } else {
            next(`Validation error: ${err.join(', ')}`);
        }
    }
}

export const pick = (keys, obj, exclude = []) => {
    var result = {};
    var idx = 0;
    let ks = (!keys) ? Object.keys(obj) : keys;
    while (idx < ks.length) {
        if (ks[idx] in obj) {
            if (!exclude.includes(ks[idx])) {
                result[ks[idx]] = obj[ks[idx]];
            }
        }
        idx += 1;
    }
    return result;
};

export const getSchema = (rules, keys = [], excludeKeys = []) => {
    if (keys.length == 0 && excludeKeys.length == 0) {
        return Joi.object(rules);
    } else {
        return Joi.object(pick(keys, rules, excludeKeys));
    }
}

export const getRules = (rules, keys = null) => {
    if (!keys) {
        return rules;
    } else {
        return pick(keys, rules);
    }
}

/* export const dateTimeDiffValidator = (start_date, start_hour, end_date, end_hour) => {
    const start = dayjs(`${start_date?.format('YYYY-MM-DD')} ${start_hour?.format('HH:mm')}`);
    const end = dayjs(`${end_date?.format('YYYY-MM-DD')} ${end_hour?.format('HH:mm')}`);
    if (!start.isValid()) {
        let status = { status: "error", messages: [{ message: `` }] };
        return ({ errors: true, fields: { start_date: status } });
    } else if (!end.isValid()) {
        let status = { status: "error", messages: [{ message: `` }] };
        return ({ errors: true, fields: { end_date: status } });
    } else {
        const diff = end.diff(start);
        if (diff < 0) {
            let status = { status: "error", messages: [{ message: `` }] };
            return ({ errors: true, fields: { start_date: status, end_date: status } });
        } else {
            return ({ errors: false, fields: { start_date: {}, end_date: {} } });
        }
    }
}; */

export const dateTimeDiffValidator = (start_date, end_date) => {
    const start = dayjs(`${start_date?.format('YYYY-MM-DD HH:mm:ss')}`);
    const end = dayjs(`${end_date?.format('YYYY-MM-DD HH:mm:ss')}`);
    if (!start.isValid()) {
        let status = { status: "error", messages: [{ message: `` }] };
        return ({ errors: true, fields: { start_date: status } });
    } else if (!end.isValid()) {
        let status = { status: "error", messages: [{ message: `` }] };
        return ({ errors: true, fields: { end_date: status } });
    } else {
        const diff = end.diff(start);
        if (diff < 0) {
            let status = { status: "error", messages: [{ message: `` }] };
            return ({ errors: true, fields: { start_date: status, end_date: status } });
        } else {
            return ({ errors: false, fields: { start_date: {}, end_date: {} } });
        }
    }
};