import { isNil, isNotNil } from "ramda";
import { z } from "zod";
import dayjs from 'dayjs';
import { rules } from "./useValidation";

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
        [init]: z.any(),// coerce.date({ description: _init }),
        [end]: z.any() //coerce.date({ description: _end })
    }).refine((v) => {
        const errors = [];
        const _di = dayjs(v[init]);
        const _de = dayjs(v[end]);
        if (!nullable && (isNil(v?.[init]) || isNil(v?.[end]))) {
            errors.push({ path: [init], message: `${_init ? _init : init} tem de estar preenchido` });
            errors.push({ path: [end], message: `${_end ? _end : end} tem de estar preenchido` });
        }
        if (!_di.isValid() || !_de.isValid()) {
            errors.push({ path: [init], message: `${_init ? _init : init} tem de ser uma data válida` });
            errors.push({ path: [end], message: `${_end ? _end : end} tem de ser uma data válida` });
        }
        if (isNotNil(v?.[init]) && isNotNil(v?.[end]) && _de < _di) {
            errors.push({ path: [init], message: `${_end ? _end : end} tem de ser maior ou igual a ${_init ? _init : init}` });
            errors.push({ path: [end], message: `${_end ? _end : end} tem de ser maior ou igual a ${_init ? _init : init}` });
        };
        if (errors.length > 0) {
            throw new z.ZodError(errors);
        }
        return true;
    }, {});



export const zRangeNumber = (min, max) => z.coerce.number().min(min).max(max);
export const zGroupRangeNumber = (value, min, max, { nullable = true, custom_error, description: { value: _value, min: _min, max: _max } } = {}) =>
    z.object({
        [min]: z.coerce.number({ description: _min }),
        [max]: z.coerce.number({ description: _max }),
        [value]: z.coerce.number({ description: _value })
    }).refine((v) => {

        const r = rules();
        r(v, min).number().required(!nullable).positive(false);
        r(v, max).number().required(!nullable).positive(false);
        r(v, value, { name: _value ? _value : value }).number().required(!nullable).positive(false).between(v?.[min], v?.[max], { including: true, nameMin: _min ? _min : min, nameMax: _max ? _max : max });
        if (!r().valid()) {
            throw new z.ZodError(r().errors());
        }
        return true;
    }, {});
export const zGroupIntervalNumber = (init, end, { nullable = true, description: { init: _init, end: _end } } = {}) =>
    z.object({
        [init]: z.any(),
        [end]: z.any()
    }).refine((v) => {
        const r = rules();
        r(v, init, { name: _init ? _init : init }).number().required(!nullable).positive(false).max(v?.[end], { name: _end ? _end : end });
        r(v, end, { name: _end ? _end : end }).number().required(!nullable).positive(false).min(v?.[init], { name: _init ? _init : init });
        if (!r().valid()) {
            throw new z.ZodError(r().errors());
        }
        return true;
    }, {});
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