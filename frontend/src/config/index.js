import React from 'react';
import { DashOutlined, DashboardOutlined, HomeFilled, LeftCircleFilled, UnorderedListOutlined, LogoutOutlined, ControlOutlined, MenuOutlined } from '@ant-design/icons';


//export const SERVER_PORT = "81";
//export const SERVER = "192.168.0.16";
export const SERVER_PORT = "8000";
export const SERVER = "localhost";
export const ROOT_URL = `http://${SERVER}:${SERVER_PORT}`;
export const DASHBOARD_URL = `/app`;
export const CSRF = document.cookie.replace("csrftoken=", "");
export const MAX_UPLOAD_SIZE = 5; //MB
export const API_URL = "/api";
export const URL_EXPIRATION = 30; //minutes
export const DOWNLOAD_URL = "/downloadfile";
export const MEDIA_URL = "/media";
export const DADOSBASE_URL = `${API_URL}/dadosbase`;
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const TIME_FORMAT = 'HH:mm';
export const DATE_FORMAT_NO_SEPARATOR = 'YYYYMMDD';
export const PAGE_TOOLBAR_HEIGHT = "45px";
export const DATE_ENGINE = "dayjs";
export const SOCKET = { url: `ws://${SERVER}:${SERVER_PORT}/ws` };
export const LOGIN_URL = `${ROOT_URL}/users/login/`;
export const LOGOUT_URL = `${ROOT_URL}/users/logout-/`;
export const SCREENSIZE_OPTIMIZED = { width: 1920, height: 1080 }

export const SAGE_ESTABELECIMENTOS = [{ value: "E01", label: "E01" }];
export const SAGE_LOCS = [{ value: "ARM", label: "ARM" }];
export const SAGE_STATUS = [{ value: "A", label: "A" }];

export const bColors = (estado) => {
    if (estado === "G") {
        return { color: "#237804", fontColor: "#fff" };//"green";
    } else if (estado === "DM") {
        return { color: "#fadb14", fontColor: "#000" };//"gold";
    } else if (estado === "R") {
        return { color: "#ff1100", fontColor: "#fff" };//"red";
    } else if (estado === "LAB") {
        return { color: "#13c2c2", fontColor: "#000" };//"cyan";
    } else if (estado === "BA") {
        return { color: "#ff1100", fontColor: "#fff" };//"red";
    } else if (estado === "IND") {
        return { color: "#0050b3", fontColor: "#fff" };//"blue";
    } else if (estado === "HOLD") {
        return { color: "#391085", fontColor: "#fff" };//"purple";
    } else {
        return { color: "#fff", fontColor: "#000" };
    }
}

export const HISTORY_DEFAULT = [
    { label: <div style={{textAlign:"center"}}><MenuOutlined style={{ fontSize: "14px",color:"#1677ff" }} /></div>, key: `mainmenu` },
    { label: "Dashboard", key: `#${DASHBOARD_URL}`, icon: <HomeFilled style={{ fontSize: "14px" }} /> },
    { label: "Dashboard Produção Linha 1", key: "#/app/producao/widgetestadoproducao", state: null, icon: <DashboardOutlined style={{ fontSize: "14px" }} /> },
    { label: "Painel de Controlo", key: "#/app/picking/main/", state: { newWindow: "controlpanel" }, icon: <ControlOutlined style={{ fontSize: "14px" }} /> },
    { label: "Ordens de Fabrico", key: "#/app/ofabrico/ordensfabricolist/", state: null, icon: <UnorderedListOutlined style={{ fontSize: "14px" }} /> },
    { label: "Paletes", key: "#/app/paletes/paleteslist/", state: null, icon: <UnorderedListOutlined style={{ fontSize: "14px" }} /> },
    { label: "Bobinagens", key: "#/app/bobinagens/reellings/", state: null, icon: <UnorderedListOutlined style={{ fontSize: "14px" }} /> },
    { label: "Bobines", key: "#/app/bobines/bobineslist/", state: null, icon: <UnorderedListOutlined style={{ fontSize: "14px" }} /> },
    { type: 'divider' },
    { label: "Retroceder", key: "back", state: null, icon: <LeftCircleFilled style={{ fontSize: "14px" }} /> },
    { type: 'divider' }
];
export const HISTORY_DEFAULT_FOOTER = [
    { type: 'divider' },
    { label: <div style={{ fontWeight: 700 }}>Logout</div>, key: `logout`, icon: <LogoutOutlined style={{ fontSize: "14px" }} /> },
    { type: 'divider' }
];

//APP DATA
export const LOCALIZACOES = [{ value: "-1", label: "Todas as Localizações" }, { value: "ARM", label: "Armazém" }, { value: "ARM2", label: "Armazém 2" }, { value: "BUFFER", label: "Buffer" }, { value: "DM12", label: "DM12" }, { value: "EPIS", label: "EPIS" }, { value: "INT", label: "Int" }];
export const MODO_EXPEDICAO = [{ value: "1", label: "CONTAINER" }, { value: "3", label: "TRUCK" }, { value: "4", label: "AIR" }];
export const OFABRICO_FILTER_STATUS = [{ value: "Todos", label: "Todos" }, { value: "Por Validar", label: "Por validar" }, { value: "Em Elaboração", label: "Em Elaboração" }, { value: "Na Produção", label: "Na Produção" }, { value: "Em Produção", label: "Em Produção" }, { value: "Finalizada", label: "Finalizada" }];
export const RECICLADO_ARTIGO = { cod: "R00000000000001", des: "Reciclado ElasticTek" };
export const JUSTIFICATION_OUT = [{ value: "" }, { value: "NÃO CONFORME" }, { value: "TROCA DE PRODUÇÃO" }, { value: "TROCA DE MATÉRIA PRIMA" }];
export const JUSTIFICATION_OUT_V2 = ["NÃO CONFORME", "TROCA DE PRODUÇÃO", "TROCA DE MATÉRIA PRIMA"];
//DOSERS
export const DOSERS = [{ value: 'A1' }, { value: 'A2' }, { value: 'A3' }, { value: 'A4' }, { value: 'A5' }, { value: 'A6' }, { value: 'B1' }, { value: 'B2' }, { value: 'B3' }, { value: 'B4' }, { value: 'B5' }, { value: 'B6' }, { value: 'C1' }, { value: 'C2' }, { value: 'C3' }, { value: 'C4' }, { value: 'C5' }, { value: 'C6' }]
//CORES
export const COLORS = ["#d50329", "#2fb48e", "#8dbbca", "#dfcc88", "#9e4f36", "#bc5fcb", "#02b5f7", "#f0cd48"];
//ORDEM FABRICO TIPO ANEXOS
export const TIPOANEXOS_OF = [{ value: "Ficha de Processo", key: "Ficha de Processo" }, { value: "Ficha Técnica", key: "Ficha Técnica" }, { value: "Resumo de Produção", key: "Resumo de Produção" },
{ value: "Packing List", key: "Packing List" },
{ value: "Orientação Qualidade", key: "Orientação Qualidade" },
{ value: "Ordem de Fabrico", key: "Ordem de Fabrico" }];
//SENTIDO ENROLAMENTO
export const ENROLAMENTO_OPTIONS = [{ label: "Anti-Horário", value: 1 }, { label: "Horário", value: 2 }];
export const TIPOEMENDA_OPTIONS = [{ value: "Não Aplicável", key: null },{ value: "Fita Preta", key: 1 }, { value: "Fita metálica e Fita Preta", key: 2 }, { value: "Fita metálica", key: 3 }];
//--ARTIGO
export const THICKNESS = 325; //microns
export const GTIN = '560084119'
//--PALETIZAÇÃO
export const PALETES_WEIGH = [{ key: 8, value: "8 kg" }, { key: 13, value: "13 kg" }];
export const PALETIZACAO_ITEMS = [{ key: 1, value: "Palete" }, { key: 2, value: "Bobines" }, { key: 3, value: "Placa de Cartão" }, { key: 4, value: "Placa MDF" }, { key: 5, value: "Placa de Plástico" }, { key: 6, value: "Cantoneira Cartão Branco" }, { key: 7, value: "Etiqueta Cut Here" }];
export const PALETE_SIZES = [{ key: '970x970', value: "970x970" }, { key: '1080x1080', value: "1080x1080" }, { key: '760x760', value: "760x760" }];
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
export const FORMULACAO_CUBAS = [{ key: 1, value: "A" }, { key: 2, value: "B" }, { key: 3, value: "C" }, { key: 4, value: "D" }, { key: 5, value: "E" }, { key: 6, value: "F" }, { key: 7, value: "G" }, { key: 8, value: "H" }, { key: 9, value: "I" }, { key: 10, value: "J" }];
export const FORMULACAO_EXTRUSORAS_VAL = [5, 22.5, 45, 22.5, 5];
export const FORMULACAO_TOLERANCIA = 0.5;
const ponderacaoExtrusoras = () => {
    const p = [0, 0, 0, 0];
    for (const [index, value] of FORMULACAO_EXTRUSORAS_COD.entries()) {
        if (value === "A") {
            p[0] += FORMULACAO_EXTRUSORAS_VAL[index];
        } else {
            p[1] += FORMULACAO_EXTRUSORAS_VAL[index];
            if (value === "B") {
                p[2] += FORMULACAO_EXTRUSORAS_VAL[index];
            } else if (value === "C") {
                p[3] += FORMULACAO_EXTRUSORAS_VAL[index];
            }
        }
    }
    return p;
}
const ponderacaoExtrusorasV2 = () => {
    const p = { A: 0, BC: 0, B: 0, C: 0 };
    //const p = [0, 0, 0, 0];
    for (const [index, value] of FORMULACAO_EXTRUSORAS_COD.entries()) {
        if (value === "A") {
            p.A += FORMULACAO_EXTRUSORAS_VAL[index];
        } else {
            p.BC += FORMULACAO_EXTRUSORAS_VAL[index];
            if (value === "B") {
                p.B += FORMULACAO_EXTRUSORAS_VAL[index];
            } else if (value === "C") {
                p.C += FORMULACAO_EXTRUSORAS_VAL[index];
            }
        }
    }
    return p;
}
export const FORMULACAO_PONDERACAO_EXTR = ponderacaoExtrusoras();
export const FORMULACAO_PONDERACAO_EXTRUSORAS = ponderacaoExtrusorasV2();
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

//BOBINES
export const BOBINE_ESTADOS = [{ value: 'G', label: "GOOD" }, { value: 'DM', label: "DM" }, { value: 'R', label: "REJEITADO" }, { value: 'BA', label: "BA" }, { value: 'LAB', label: "LAB" }, { value: 'IND', label: "INDUSTRIALIZAÇÃO" }, { value: 'HOLD', label: "HOLD" }, { value: 'SC' }];
export const BOBINE_DEFEITOS = [
    { value: 'troca_nw', label: 'Troca NW' }, { value: 'con', label: 'Cónico' }, { value: 'descen', label: 'Descentrada' }, { value: 'presa', label: 'Presa' },
    { value: 'diam_insuf', label: 'Diâmetro Insuficiente' }, { value: 'furos', label: 'Furos' }, { value: 'outros', label: 'Outros' }, { value: 'buraco', label: 'Buracos' },
    { value: 'nok', label: 'Largura NOK' }, { value: 'car', label: 'Carro Atrás' }, { value: 'fc', label: 'Falha Corte' }, { value: 'ff', label: 'Falha Filme' },
    { value: 'fmp', label: 'Falha Matéria Prima' }, { value: 'lac', label: 'Laçou' }, { value: 'ncore', label: 'Não Colou' }, { value: 'suj', label: 'Sujidade' },
    { value: 'sbrt', label: 'Sobretiragem' }, { value: 'esp', label: 'Gramagem' }, { value: 'rugas', label: 'Rugas' }, { value: 'tr', label: 'Troca Rápida' }, { value: 'prop', label: 'Propriedades' }, { value: 'mpalete', label: "Marcas de Palete" }
];