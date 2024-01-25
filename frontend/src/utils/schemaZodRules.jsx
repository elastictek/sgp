import { z } from "zod";

export const zRangeNumber = (min, max) => z.coerce.number().min(min).max(max);
export const zRangeDate = (min, max) => z.coerce.date().min(min).max(max);
export const zIntervalDate = (init, end, { custom_error, description: { init: _dinit, end: _dend } } = {}) =>
    z.object({
        [init]: z.coerce.date({ description: _dinit }),
        [end]: z.coerce.date({ description: _dend })
    }).refine((value) => {
        return value?.[init] === undefined || value?.[end] === undefined || value[end] >= value[init];
    }, {
        ...custom_error ? custom_error : { message: 'Start date must be greater than or equal to End date' },
    })
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