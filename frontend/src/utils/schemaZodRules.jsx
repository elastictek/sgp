import { isNil, isNotNil } from "ramda";
import { z } from "zod";

export const _fieldZodDescription = (schema, path) => {
    const parts = Array.isArray(path) ? path : path.split('.');
    let descriptions = "";
    for (const part of parts) {
        if (schema && !schema?.shape?.[part] && schema?._def?.schema) {
            schema = schema._def.schema.shape[part];
            if (schema?.description) {
                descriptions = `${descriptions} ${schema?.description}`;
            }
        } else if (schema && schema?.shape) {
            schema = schema.shape[part];
            if (schema?.description) {
                descriptions = `${descriptions} ${schema?.description}`;
            }
        } else {
            return null;
        }
    }
    return descriptions !== "" ? descriptions : parts.join(".");
}

export const zIntervalDate = (min, max) => z.coerce.date().min(min).max(max);
export const zGroupIntervalDate = (init, end, { nullable = true, custom_error, description: { init: _init, end: _end } } = {}) =>
    z.object({
        [init]: z.coerce.date({ description: _init }),
        [end]: z.coerce.date({ description: _end })
    }).refine((v) => {
        if (nullable && (isNil(v?.[init]) || isNil(v?.[end]))) {
            return true;
        }
        return isNotNil(v?.[init]) && isNotNil(v?.[end]) && v[end] >= v[init];
    }, {
        ...custom_error ? custom_error : { message: `${_end ? _end : end} must be greater or equal than ${_init ? _init : init}` },
    });



export const zRangeNumber = (min, max) => z.coerce.number().min(min).max(max);
export const zGroupRangeNumber = (value, min, max, { nullable = true, custom_error, description: { value: _value, min: _min, max: _max } } = {}) =>
    z.object({
        [min]: z.coerce.number({ description: _min }),
        [max]: z.coerce.number({ description: _max }),
        [value]: z.coerce.number({ description: _value })
    }).refine((v) => {
        if (nullable && isNil(v?.[value])) {
            return true;
        }
        return isNotNil(v?.[min]) && isNotNil(v?.[max]) && v[value] >= v[min] && v[value] <= v[max];
    }, {
        ...custom_error ? custom_error : { message: `${_value ? _value : value} must be between ${_min ? _min : min} and ${_max ? _max : max}` },
    });
export const zGroupIntervalNumber = (init, end, { nullable = true, custom_error, description: { init: _init, end: _end } } = {}) =>
    z.object({
        [init]: z.coerce.number({ description: _init }),
        [end]: z.coerce.number({ description: _end })
    }).refine((v) => {
        if (nullable && (isNil(v?.[init]) || isNil(v?.[end]))) {
            return true;
        }
        return isNotNil(v?.[init]) && isNotNil(v?.[end]) && v[end] >= v[init];
    }, {
        ...custom_error ? custom_error : { message: `${_end ? _end : end} must be greater or equal than ${_init ? _init : init}` },
    });
export const zOneOfNumber = (values) => z.coerce.number().refine(value => values.includes(value));
export const zOneOfString = (values) => z.coerce.string().refine(value => values.includes(value));




/**----------------EXAMPLES----------------------- */
/*
const values = { 
    bobine_id: 1,
    id: 66,
    data_imputacao: "2024-11-01",
    artigo: { cod: "saddd" },
    cliente: { BPCNUM_0: "assds" },
    subtype: 1,
    date: {
        data_init: "2023-11-01",
        data_end: "2023-10-01"
    }
};

const schema = z.object({
    artigo: z.object({
        cod: z.string({ description: "Artigo" }).min(1).describe("dfsdfsdfsdsdf")
    }),
    cliente: z.object({
        BPCNUM_0: z.string({ description: "Cliente" }).min(1)
    }),
    data_imputacao: z.coerce.date({ description: "Data imputação" }).max(new Date()),
    id: z.coerce.number({ description: "Tarefa" }).min(1),
    subtype: z.coerce.number({ description: "Tipo tarefa" }).min(1),
    bobine_id: z.coerce.number({ description: "Bobine" }).min(1),
    date: zIntervalDate("data_init", "data_end", { description: { init: "Início", end: "Fim" } }).describe("Data prevista")
})
*/