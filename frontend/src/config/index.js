import React from 'react';
export const ROOT_URL = "http://localhost:8000";
export const CSRF = document.cookie.replace("csrftoken=", "");
export const MAX_UPLOAD_SIZE = 5; //MB
export const API_URL = "/api";
export const DOWNLOAD_URL = "/downloadfile";
export const MEDIA_URL = "/media";
export const DADOSBASE_URL = `${API_URL}/dadosbase`;
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const TIME_FORMAT = 'HH:mm';
export const PAGE_TOOLBAR_HEIGHT = "45px";
export const SOCKET = { url: 'ws://localhost:8000/ws' };

//APP DATA
//ORDEM FABRICO TIPO ANEXOS

export const TIPOANEXOS_OF = [{ value: "Ficha de Processo", key: "Ficha de Processo" }, { value: "Ficha Técnica", key: "Ficha Técnica" }, { value: "Resumo de Produção", key: "Resumo de Produção" },
{ value: "Packing List", key: "Packing List" },
{ value: "Orientação Qualidade", key: "Orientação Qualidade" },
{ value: "Ordem de Fabrico", key: "Ordem de Fabrico" }];
//SENTIDO ENROLAMENTO
export const ENROLAMENTO_OPTIONS = [{ label: "Anti-Horário", value: 1 }, { label: "Horário", value: 2 }];
export const TIPOEMENDA_OPTIONS = [{ value: "Fita Preta", key: 1 }, { value: "Fita metálica e Fita Preta", key: 2 }, { value: "Fita metálica", key: 3 }];
//--ARTIGO
export const THICKNESS = 325; //microns
export const GTIN = '560084119'
//--PALETIZAÇÃO
export const PALETIZACAO_ITEMS = [{ key: 1, value: "Palete" }, { key: 2, value: "Bobines" }, { key: 3, value: "Placa de Cartão" }, { key: 4, value: "Placa MDF" }, { key: 5, value: "Placa de Plástico" }];
export const PALETE_SIZES = [{ key: '970x970', value: "970x970" }];
export const CONTENTORES_OPTIONS = [
    { label: <b>Camião</b>, value: 'Camião' },
    { label: <b>40HC</b>, value: '40HC' },
    { label: <b>40DV</b>, value: '40DV' },
    { label: <b>20</b>, value: '20' }
];
export const CINTASPALETES_OPTIONS = [{ label: "Ambas as Paletes", value: 1 }, { label: "Palete Superior", value: 2 }, { label: "Palete Inferior", value: 3 }];
//--FORMULAÇÃO
export const FORMULACAO_EXTRUSORAS_COD = ['A', 'C', 'B', 'C', 'A'];
export const FORMULACAO_MANGUEIRAS = {
    A: [{ key: 'A1' }, { key: 'A2' }, { key: 'A3' }, { key: 'A4' }, { key: 'A5' }, { key: 'A6' }], BC: [{ key: 'B1' }, { key: 'B2' }, { key: 'B3' }, { key: 'B4' }, { key: 'B5' }, { key: 'B6' }, { key: 'C1' }, { key: 'C2' }, { key: 'C3' }, { key: 'C4' }, { key: 'C5' }, { key: 'C6' }],
    B: [{ key: 'B1' }, { key: 'B2' }, { key: 'B3' }, { key: 'B4' }, { key: 'B5' }, { key: 'B6' }], C: [{ key: 'C1' }, { key: 'C2' }, { key: 'C3' }, { key: 'C4' }, { key: 'C5' }, { key: 'C6' }]
};
export const FORMULACAO_EXTRUSORAS_VAL = [5, 22.5, 45, 22.5, 5];
export const FORMULACAO_TOLERANCIA = 0.5;
const ponderacaoExtrusoras = () => {
    const p = [0, 0];
    for (const [index, value] of FORMULACAO_EXTRUSORAS_COD.entries()) {
        if (value === "A") {
            p[0] += FORMULACAO_EXTRUSORAS_VAL[index];
        } else {
            p[1] += FORMULACAO_EXTRUSORAS_VAL[index];
        }
    }
    return p;
}
export const FORMULACAO_PONDERACAO_EXTR = ponderacaoExtrusoras();
export const GAMAOPERATORIA = [
    { key: "A", designacao: "Gramagem do filme", unidade: "gsm", nvalues: 1, min: 0, max: 999, tolerancia: 10 },
    { key: "B", designacao: "Espessura set", unidade: "µm", nvalues: 1, min: 0, max: 999, tolerancia: 10 },
    { key: "C", designacao: "Densidades (Extrusoras A, B, C e Total)", unidade: "", nvalues: 1, min: 0, max: 999, tolerancia: 10, disabled: true },
    { key: "D", designacao: "Velocidade da linha - Na bobinadora", unidade: "m/min", nvalues: 1, min: 0, max: 999, tolerancia: 10 },
    { key: "E", designacao: "Temperatura na extrusora A", unidade: "ºC", nvalues: 8, min: -999, max: 999, tolerancia: 10 },
    { key: "F", designacao: "Temperatura nas extrusoras B e C", unidade: "ºC", nvalues: 9, min: -999, max: 999, tolerancia: 10 },
    { key: "G", designacao: "Temperatura no feed-block", unidade: "ºC", nvalues: 1, min: -999, max: 999, tolerancia: 10 },
    { key: "H", designacao: "Temperatura na fieira", unidade: "ºC", nvalues: 1, min: -999, max: 999, tolerancia: 10 },
    { key: "I", designacao: "Posicionamento dos parcializadores da fieira", unidade: "mm", nvalues: 2, min: 0, max: 999, tolerancia: 10 },
    { key: "J", designacao: "Pressão na Comerio", unidade: "bar", nvalues: 2, min: 0, max: 999, tolerancia: 10 },
    { key: "K", designacao: "Posição dos eixos na calandra LO/LA", unidade: "mm", nvalues: 2, min: -999, max: 999, precision: 1, tolerancia: 10 },
    { key: "L", designacao: "Temperatura da Comerio", unidade: "ºC", nvalues: 1, min: -999, max: 999, tolerancia: 10 },
    { key: "M", designacao: "Pick Breaker", unidade: "mm", nvalues: 1, min: -999, max: 999, precision: 1, tolerancia: 10 },
    { key: "N", designacao: "Pressão do pêndulo", unidade: "bar", nvalues: 2, min: 0, max: 999, precision: 1, tolerancia: 10 },
    { key: "O", designacao: "Referência da curva de tensão de Bobinagem", unidade: "", nvalues: 1, min: 0, max: 999, tolerancia: 10 },
    { key: "P", designacao: "Rolo C", unidade: "ºC", nvalues: 1, min: -999, max: 999, tolerancia: 10 },
    { key: "Q", designacao: "Rolo F", unidade: "ºC", nvalues: 1, min: -999, max: 999, tolerancia: 10 }
];

export const ARTIGOS_SPECS = [
    { key: "A", designacao: "Basis Weight", unidade: "gsm", nvalues: 4, min: 0, max: 999, precision: 1 },
    { key: "B", designacao: "Tensile at peak CD", unidade: "N/25mm", nvalues: 4, min: 0, max: 999, precision: 1 },
    { key: "C", designacao: "Elongation at break CD", unidade: "%", nvalues: 4, min: 0, max: 999, precision: 1 },
    { key: "D", designacao: "Elongation at 9.81N CD", unidade: "%", nvalues: 4, min: 0, max: 999, precision: 1 },
    { key: "E", designacao: "Load at 5% elongation 1st cycle CD", nvalues: 4, unidade: "N/50mm", min: 0, max: 999, precision: 1 },
    { key: "F", designacao: "Load at 10% elongation 1st cycle CD", nvalues: 4, unidade: "N/50mm", min: 0, max: 999, precision: 1 },
    { key: "G", designacao: "Load at 20% elongation 1st cycle CD", nvalues: 4, unidade: "N/50mm", min: 0, max: 999, precision: 1 },
    { key: "H", designacao: "Load at 50% elongation 1st cycle CD", nvalues: 4, unidade: "N/50mm", min: 0, max: 999, precision: 1 },
    { key: "I", designacao: "Permanent set 2nd cycle", unidade: "%", nvalues: 4, min: 0, max: 999, precision: 1 },
    { key: "J", designacao: "Load at 100% elongation 2nd cycle", unidade: "N/50mm", nvalues: 4, min: 0, max: 999, precision: 1 },
    { key: "K", designacao: "Permanent set 3rd cycle", unidade: "%", nvalues: 4, min: 0, max: 999, precision: 1 },
    { key: "L", designacao: "Load at 100% elongation 3rd cycle", unidade: "N/50mm", nvalues: 4, min: 0, max: 999, precision: 1 },
    { key: "M", designacao: "Lamination strenght (CD)", unidade: "N/25mm", nvalues: 4, min: 0, max: 999, precision: 1 }
];