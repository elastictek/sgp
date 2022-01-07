import Joi from 'joi';

export const validate = (schema, onlyExistingValues = [], mapper = {},parameters={}) => {
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
                        value = await schema[key](Object.keys(data),parameters).validateAsync(data);
                    } else {
                        value = await schema[key](undefined,parameters).validateAsync(data);
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

export const pick = (names, obj) => {
    var result = {};
    var idx = 0;
    while (idx < names.length) {
        if (names[idx] in obj) {
            result[names[idx]] = obj[names[idx]];
        }
        idx += 1;
    }
    return result;
};

export const getSchema = (rules, keys = null) => {
    if (!keys) {        
        return Joi.object(rules);
    } else {
        return Joi.object(pick(keys, rules));
    }
}

export const getRules = (rules, keys = null) => {
    if (!keys) {
        return rules;
    } else {
        return pick(keys, rules);
    }
}