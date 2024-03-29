import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues, getFilterValue, isValue } from 'utils';
import { json } from "utils/object";
import FormManager, { FieldLabel, FieldSet as OldFieldSet, FilterTags, AutoCompleteField as OldAutoCompleteField, useMessages, DropDown } from "components/form";
import Drawer from "components/Drawer";
import Table, { setColumns } from "components/table";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import ResponsiveModal from "components/ResponsiveModal";
import MoreFilters from 'assets/morefilters.svg';
import YScroll from "components/YScroll";
import { MdAdjust } from 'react-icons/md';
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, SelectMultiField, Selector, Label, SwitchField } from 'components/FormFields';

import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge } from "antd";
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled } from '@ant-design/icons';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, API_URL, GTIN, SCREENSIZE_OPTIMIZED, BOBINE_DEFEITOS } from 'config';
const { Title } = Typography;





const StyledStatus = styled.div`
    border:dashed 1px #000;
    background-color:${props => props.color};
    color:${props => props.fontColor};
    height:${props => props.height};
    border-radius:3px;
    margin-right:1px;
    text-align:center;
    width:35px;
    line-height:12px;
    font-size:8px;
    cursor:pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    &:hover {
        border-color: #d9d9d9;
    }
    .lar{
        font-size:9px;
    }
`;

const StyledStatusProducao = styled.div`
    border:solid 1px #000;
    background-color:${props => props.color};
    color:${props => props.fontColor};
    border-radius:3px;
    margin-right:2px;
    text-align:center;
    width:35px;
    line-height:12px;
    font-size:8px;
    cursor:pointer;
    padding:"2px";
    &:hover {
        border-color: #d9d9d9;
    }
    .n{
        font-size:11px;
    }
`;

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
    } else if (estado === "D") {
        return { color: "#ff1100", fontColor: "#fff" };//"red";
    } else {
        return { color: "#000", fontColor: "#fff" };
    }
}

export const Status = ({ b, onClick, height = "26px", column = "estado", larguraColumn = "largura" }) => {
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };
    return (
        <StyledStatus height={height} onClick={handleClick} color={bColors(b[column]).color} fontColor={bColors(b[column]).fontColor} key={`bob-${b.id}`}><b>{b[column] === 'HOLD' ? 'HLD' : b[column]}</b>{b[larguraColumn] && <div className='lar'>{b[larguraColumn]}</div>}</StyledStatus>
    );
}

export const StatusBobineProducao = ({ b, onClick }) => {
    return (
        <StyledStatusProducao onClick={onClick} color={bColors(b.estado).color} fontColor={bColors(b.estado).fontColor} key={`bob-${b.id}`}><b>{b.estado === 'HOLD' ? 'HLD' : b.estado}</b><div className='n'>{b.total_por_estado}</div></StyledStatusProducao>
    );
}

export const saveTrocaEtiqueta = async (row, value, submitting, parameters, loadData) => {
    submitting.trigger();
    const status = { error: [] };
    // for (let [i, r] of rows.entries()) {

    //     if (r?.notValid) {
    //         r.defeitos = (r?.defeitos ? r.defeitos : []);
    //         const hasDefeitos = (r?.defeitos && r.defeitos.length > 0 || r.fc_pos?.length > 0 || r.ff_pos?.length > 0 || r.fc_pos?.length > 0 || r.furos_pos?.length > 0 || r.buracos_pos?.length > 0 || r.rugas_pos?.length > 0 || r.prop_obs?.length > 0 || r.obs?.length > 0) ? true : false;
    //         const estado = r.estado;
    //         // if ((r.estado_original === "HOLD")/*  && !permission.allow() */) {
    //         //     status.error.push({ message: <span><b>{r.nome}</b>: Não tem permissões para alterar o estado de uma bobine em <b>HOLD</b>.</span> });
    //         // }
    //         // if ((estado === "HOLD")/*  && !permission.allow() */) {
    //         //     status.error.push({ message: <span><b>{r.nome}</b>: Não tem permissões para alterar o estado para <b>HOLD</b>.</span> });
    //         // }
    //         if ((estado === "R" || estado === "DM") && !hasDefeitos) {
    //             status.error.push({ message: <span><b>{r.nome}</b>: Para classificar como <b>DM</b> ou <b>R</b> tem de definir pelo menos um defeito.</span> });
    //         }
    //         if (r.defeitos.some(x => x.key === "fmp") && !r.obs?.length > 0) {
    //             status.error.push({ message: <span><b>{r.nome}</b>: Falha de <b>Matéria Prima</b>, preencher nas observações o motivo.</span> });
    //         }
    //         if (r.defeitos.some(x => x.key === "esp") && !r.prop_obs?.length > 0) {
    //             status.error.push({ message: <span><b>{r.nome}</b>: <b>Gramagem</b>, preencher nas observações das propriedades o motivo.</span> });
    //         }
    //         if (r.defeitos.some(x => x.key === "prop") && !r.prop_obs?.length > 0) {
    //             status.error.push({ message: <span><b>{r.nome}</b>: <b>Propriedades</b>, preencher nas observações das propriedades o motivo.</span> });
    //         }
    //     }
    //     if (status.error.length > 0) {
    //         Modal.error({
    //             title: "Erros",
    //             content: <YScroll style={{ maxHeight: "270px" }}>
    //                 <ul style={{ padding: "0px 0px 5px 20px", background: "#fff2f0", border: "solid 1px #ffccc7" }}>
    //                     {status.error.map((v, i) => <li key={`err-${i}`}>{v.message}</li>)}
    //                 </ul>
    //             </YScroll>
    //         })
    //         submitting.end();
    //         return;
    //     }

    //     rows[i]["prop"] = (r.prop_obs?.length > 0) ? 1 : 0;
    //     rows[i]["fc"] = (r.fc_pos?.length > 0) ? 1 : 0;
    //     rows[i]["ff"] = (r.ff_pos?.length > 0) ? 1 : 0;
    //     rows[i]["furos"] = (r.furos_pos?.length > 0) ? 1 : 0;
    //     rows[i]["buraco"] = (r.buracos_pos?.length > 0) ? 1 : 0;
    //     rows[i]["rugas"] = (r.rugas_pos?.length > 0) ? 1 : 0;
    // }


    try {
        let response = await fetchPost({ url: `${API_URL}/bobines/sql/`, parameters: { method: "UpdateTrocaEtiqueta", rows: [{ id: row.id, troca_etiqueta: value }], ...parameters }, filter: {} });
        if (response.data.status !== "error") {
            //Modal.success({ title: "Registos alterados com sucesso!" })
            loadData();
        } else {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
        }
    } catch (e) {
        Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
    };
    submitting.end();


}


export const checkBobinesDefeitos = (rows, plainText = false) => {
    const status = { error: [] };
    let _array = [];
    for (let [i, r] of rows.entries()) {
        const _r = { ...r, defeitos: r?.defeitos ? r.defeitos : [] };
        if (r?.notValid) {
            //r.defeitos = (r?.defeitos ? r.defeitos : []);
            const hasDefeitos = (_r?.defeitos && _r.defeitos.length > 0 || _r.fc_pos?.length > 0 || _r.ff_pos?.length > 0 || _r.fc_pos?.length > 0 || _r.furos_pos?.length > 0 || _r.buracos_pos?.length > 0 || _r.rugas_pos?.length > 0 || _r.prop_obs?.length > 0 || _r.obs?.length > 0) ? true : false;
            const estado = _r.estado;
            // if ((_r.estado_original === "HOLD")/*  && !permission.allow() */) {
            //     status.error.push({ message: <span><b>{_r.nome}</b>: Não tem permissões para alterar o estado de uma bobine em <b>HOLD</b>.</span> });
            // }
            // if ((estado === "HOLD")/*  && !permission.allow() */) {
            //     status.error.push({ message: <span><b>{_r.nome}</b>: Não tem permissões para alterar o estado para <b>HOLD</b>.</span> });
            // }
            if ((estado === "R" || estado === "DM") && !hasDefeitos) {
                if (plainText) {
                    status.error.push({ message: `${_r.nome}: Para classificar como DM ou R tem de definir pelo menos um defeito.` });
                } else {
                    status.error.push({ message: <span><b>{_r.nome}</b>: Para classificar como <b>DM</b> ou <b>R</b> tem de definir pelo menos um defeito.</span> });
                }
            }
            if (_r.defeitos.some(x => x.key === "fmp") && !_r.obs?.length > 0) {
                if (plainText) {
                    status.error.push({ message: `${_r.nome}: Falha de Matéria Prima, preencher nas observações o motivo.` });
                } else {
                    status.error.push({ message: <span><b>{_r.nome}</b>: Falha de <b>Matéria Prima</b>, preencher nas observações o motivo.</span> });
                }
            }
            if (_r.defeitos.some(x => x.key === "esp") && !_r.prop_obs?.length > 0) {
                if (plainText) {
                    status.error.push({ message: `${_r.nome}: Gramagem, preencher nas observações das propriedades o motivo.` });
                } else {
                    status.error.push({ message: <span><b>{_r.nome}</b>: <b>Gramagem</b>, preencher nas observações das propriedades o motivo.</span> });
                }
            }
            if (_r.defeitos.some(x => x.key === "prop") && !_r.prop_obs?.length > 0) {
                if (plainText) {
                    status.error.push({ message: `${_r.nome}: Propriedades, preencher nas observações das propriedades o motivo.` });
                } else {
                    status.error.push({ message: <span><b>{_r.nome}</b>: <b>Propriedades</b>, preencher nas observações das propriedades o motivo.</span> });
                }
            }
        }

        _r["prop"] = (_r.prop_obs?.length > 0) ? 1 : 0;
        _r["fc"] = (_r.fc_pos?.length > 0) ? 1 : 0;
        _r["ff"] = (_r.ff_pos?.length > 0) ? 1 : 0;
        _r["furos"] = (_r.furos_pos?.length > 0) ? 1 : 0;
        _r["buraco"] = (_r.buracos_pos?.length > 0) ? 1 : 0;
        _r["rugas"] = (_r.rugas_pos?.length > 0) ? 1 : 0;
        _array.push(_r);
    }
    return { rows: _array, status };
}

export const saveBobinesDefeitos = async (rows, submitting, parameters, loadData, submit = true) => {
    if (submit) {
        submitting.trigger();
    }
    const { status, rows: _array } = checkBobinesDefeitos(rows);

    if (!submit) {
        return { rows: _array, status };
    }

    if (status.error.length > 0) {
        Modal.error({
            title: "Erros",
            content: <YScroll style={{ maxHeight: "270px" }}>
                <ul style={{ padding: "0px 0px 5px 20px", background: "#fff2f0", border: "solid 1px #ffccc7" }}>
                    {status.error.map((v, i) => <li key={`err-${i}`}>{v.message}</li>)}
                </ul>
            </YScroll>
        })
        submitting.end();
        return;
    }

    // const status = { error: [] };
    // let _array = [];
    // for (let [i, r] of rows.entries()) {
    //     const _r = { ...r, defeitos: r?.defeitos ? r.defeitos : [] };
    //     if (r?.notValid) {
    //         //r.defeitos = (r?.defeitos ? r.defeitos : []);
    //         const hasDefeitos = (_r?.defeitos && _r.defeitos.length > 0 || _r.fc_pos?.length > 0 || _r.ff_pos?.length > 0 || _r.fc_pos?.length > 0 || _r.furos_pos?.length > 0 || _r.buracos_pos?.length > 0 || _r.rugas_pos?.length > 0 || _r.prop_obs?.length > 0 || _r.obs?.length > 0) ? true : false;
    //         const estado = _r.estado;
    //         // if ((_r.estado_original === "HOLD")/*  && !permission.allow() */) {
    //         //     status.error.push({ message: <span><b>{_r.nome}</b>: Não tem permissões para alterar o estado de uma bobine em <b>HOLD</b>.</span> });
    //         // }
    //         // if ((estado === "HOLD")/*  && !permission.allow() */) {
    //         //     status.error.push({ message: <span><b>{_r.nome}</b>: Não tem permissões para alterar o estado para <b>HOLD</b>.</span> });
    //         // }
    //         if ((estado === "R" || estado === "DM") && !hasDefeitos) {
    //             status.error.push({ message: <span><b>{_r.nome}</b>: Para classificar como <b>DM</b> ou <b>R</b> tem de definir pelo menos um defeito.</span> });
    //         }
    //         if (_r.defeitos.some(x => x.key === "fmp") && !_r.obs?.length > 0) {
    //             status.error.push({ message: <span><b>{_r.nome}</b>: Falha de <b>Matéria Prima</b>, preencher nas observações o motivo.</span> });
    //         }
    //         if (_r.defeitos.some(x => x.key === "esp") && !_r.prop_obs?.length > 0) {
    //             status.error.push({ message: <span><b>{_r.nome}</b>: <b>Gramagem</b>, preencher nas observações das propriedades o motivo.</span> });
    //         }
    //         if (_r.defeitos.some(x => x.key === "prop") && !_r.prop_obs?.length > 0) {
    //             status.error.push({ message: <span><b>{_r.nome}</b>: <b>Propriedades</b>, preencher nas observações das propriedades o motivo.</span> });
    //         }
    //     }
    //     if (status.error.length > 0) {
    //         Modal.error({
    //             title: "Erros",
    //             content: <YScroll style={{ maxHeight: "270px" }}>
    //                 <ul style={{ padding: "0px 0px 5px 20px", background: "#fff2f0", border: "solid 1px #ffccc7" }}>
    //                     {status.error.map((v, i) => <li key={`err-${i}`}>{v.message}</li>)}
    //                 </ul>
    //             </YScroll>
    //         })
    //         submitting.end();
    //         return;
    //     }

    //     _r["prop"] = (_r.prop_obs?.length > 0) ? 1 : 0;
    //     _r["fc"] = (_r.fc_pos?.length > 0) ? 1 : 0;
    //     _r["ff"] = (_r.ff_pos?.length > 0) ? 1 : 0;
    //     _r["furos"] = (_r.furos_pos?.length > 0) ? 1 : 0;
    //     _r["buraco"] = (_r.buracos_pos?.length > 0) ? 1 : 0;
    //     _r["rugas"] = (_r.rugas_pos?.length > 0) ? 1 : 0;
    //     _array.push(_r);
    // }

    try {
        let response = await fetchPost({ url: `${API_URL}/bobines/sql/`, parameters: { method: "UpdateDefeitos", rows: _array.filter(v => v?.notValid === 1), ...parameters }, filter: {} });
        if (response.data.status !== "error") {
            //Modal.success({ title: "Registos alterados com sucesso!" })
            loadData();
        } else {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
        }
    } catch (e) {
        Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
    };
    submitting.end();


}


export const postProcess = async (dt, submitting) => {
    const bobineDefeitos = BOBINE_DEFEITOS.filter(v => v.value !== 'furos' && v.value !== 'buraco' && v.value !== 'rugas' && v.value !== 'ff' && v.value !== 'fc');
    const _rows = (dt?.rows ? dt.rows : dt);
    for (let [i, v] of _rows.entries()) {
        let defeitos = [];
        for (let p of bobineDefeitos) {
            (v[p.value] === 1) && defeitos.push(p);
        }
        _rows[i]["defeitos"] = defeitos;
        _rows[i]["estado_original"] = _rows[i]["estado"];
        _rows[i]["fc_pos"] = json(_rows[i]["fc_pos"]);
        _rows[i]["ff_pos"] = json(_rows[i]["ff_pos"]);
        _rows[i]["furos_pos"] = json(_rows[i]["furos_pos"]);
        _rows[i]["buracos_pos"] = json(_rows[i]["buracos_pos"]);
        _rows[i]["rugas_pos"] = json(_rows[i]["rugas_pos"]);
        _rows[i]["estado"] = _rows[i]["estado"];
    }
    if (submitting) {
        submitting.end();
    }
    return dt;
}

const ToolbarFilters = ({ ...props }) => {
    return (<>
        <Col width={150}>
            <Field name="festados" label={{ enabled: true, text: "Estados", pos: "top", padding: "0px" }}>
                <SelectMultiField size="small" keyField='value' textField='value' data={BOBINE_ESTADOS} />
            </Field>
        </Col>
        <Col width={150}>
            <Field name="flote" label={{ enabled: true, text: "Lote", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        {/* <Col xs='content'>
            <Field name="fartigo" label={{ enabled: true, text: "Artigo", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="flote" label={{ enabled: true, text: "Lote", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="ftype_mov" label={{ enabled: true, text: "Mov.", pos: "top", padding: "0px" }}>
                <Select size='small' options={[{ value: 0, label: "Saída" }, { value: 1, label: "Entrada" }]} allowClear style={{ width: "100px" }} />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="fdataout" label={{ enabled: true, text: "Data Saída", pos: "top", padding: "0px" }}>
                <RangeDateField size='small' allowClear />
            </Field>
        </Col> */}
    </>
    );
}

export const processFilters = (type, values, defaultFilters) => {
    const vals = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
    const _values = {
        ...vals,
        flote: getFilterValue(vals?.flote, 'any')
        /*  fartigo: getFilterValue(vals?.fartigo, 'any'),
         
         fvcr: getFilterValue(vals?.fvcr, 'any'),
         fdata: getFilterRangeValues(vals["fdata"]?.formatted),
         fdatain: getFilterRangeValues(vals["fdatain"]?.formatted),
         fdataout: getFilterRangeValues(vals["fdataout"]?.formatted), */
    };
    return _values;
}
const schemaFilter = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    // { fartigo: { label: "Artigo", field: { type: 'input', size: 'small' } } },
    // { flote: { label: "Lote", field: { type: 'input', size: 'small' } } },
    // { fvcr: { label: "Cód. Movimento", field: { type: 'input', size: 'small' } } },
    // { fdata: { label: "Data Movimento", field: { type: "rangedate", size: 'small' } } },
    // { fdatain: { label: "Data Entrada", field: { type: "rangedate", size: 'small' } } },
    // { fdataout: { label: "Data Saída", field: { type: "rangedate", size: 'small' } } },
    // { fqty: { label: "Quantidade Lote", field: { type: 'input', size: 'small' }, span: 12 } },
    // { fqty_reminder: { label: "Quantidade Restante", field: { type: 'input', size: 'small' }, span: 12 } },
    // { ftype_mov: { label: 'Movimento', field: { type: 'select', size: 'small', options: [{ value: 0, label: "Saída" }, { value: 1, label: "Entrada" }] }, span: 6 } },
];
export const toolbarFilters = (formFilter) => {

    return {
        form: formFilter, schema: schemaFilter,
        filters: <ToolbarFilters />,
        moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 350, mask: true }
    };



}

// export const FormPrint = ({ v, parentRef, closeParent }) => {
//     const [values, setValues] = useState({ impressora: "Bobinadora_CAB_A4_200", num_copias: 1 })
//     const onClick = async () => {
//         const response = await fetchPost({ url: `${API_URL}/printetiqueta/`, parameters: { type: "bobinagem", bobinagem: v.bobinagem, ...values } });
//         if (response.data.status !== "error") {
//             closeParent();
//         } else {
//             Modal.error({ title: response.data.title })
//         }

//     }

//     const onChange = (t, v) => {
//         setValues(prev => ({ ...prev, [t]: v }));
//     }

//     return (<>
//         <Container>
//             <Row>
//                 <Col><b>Cópias:</b></Col>
//             </Row>
//             <Row>
//                 <Col><InputNumber onChange={(v) => onChange("num_copias", v)} min={1} max={3} defaultValue={values.num_copias} /></Col>
//             </Row>
//             <Row>
//                 <Col><b>Impressora:</b></Col>
//             </Row>
//             <Row>
//                 <Col><Select onChange={(v) => onChange("impressora", v)} defaultValue={values.impressora} style={{ width: "100%" }} options={[{ value: 'Bobinadora_CAB_A4_200', label: 'BOBINADORA' }, { value: 'DM12_CAB_A4_200', label: 'DM12' }]} /></Col>
//             </Row>
//             <Row style={{ marginTop: "15px" }}>
//                 <Col style={{ textAlign: "right" }}>
//                     <Space>
//                         <Button onClick={closeParent}>Cancelar</Button>
//                         <Button type="primary" onClick={onClick}>Imprimir</Button>
//                     </Space>
//                 </Col>
//             </Row>
//         </Container>
//     </>);
// }

























//MAYBE TO REMOVE ALL BELOW


export const WndTitle = ({ data }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Space>
                    <div><b style={{ textTransform: "capitalize" }}></b>{data.title}</div>
                </Space>
            </div>
        </div>
    );
}

export const Wnd = ({ show, setShow, children }) => {
    const [confirmLoading, setConfirmLoading] = React.useState(false);

    const handleCancel = () => {
        setShow({ ...show, show: false, data: {} });
    };

    return (
        <>
            <ResponsiveModal
                title={<WndTitle data={show.data} />}
                visible={show.show}
                centered
                responsive
                onCancel={handleCancel}
                maskClosable={true}
                destroyOnClose={true}
                fullWidthDevice={show?.fullWidthDevice ? show.fullWidthDevice : 100}
                minFullHeight={show?.minFullHeight}
                width={show?.width}
                height={show?.height}
            /* bodyStyle={{ backgroundColor: "#f0f0f0" }} */
            >
                <YScroll>
                    {children}
                    {/* <Suspense fallback={<></>}>{<BobinesValidarList data={show.data} closeSelf={handleCancel} />}</Suspense> */}
                </YScroll>
            </ResponsiveModal>
        </>
    );
};

const StyledBobine = styled.div`
    border:dashed 1px #000;
    background-color:${props => props.color};
    color:${props => props.fontColor};
    border-radius:3px;
    margin-right:1px;
    text-align:center;
    width:25px;
    font-size:8px;
    cursor:pointer;
    &:hover {
        border-color: #d9d9d9;
    }
    .lar{
        font-size:9px;
    }
`;

const StyledOf = styled.div`
    border:solid 1px #40a9ff;
    border-radius:3px;
    margin-right:1px;
    min-width:150px;
    max-width:150px;
    padding:2px;
    cursor:pointer;
    text-align:center;
    font-size:9px;
    &:hover {
        border-color: #d9d9d9;
    }
    .cl{
        font-size:8px;
    }
`;

const useStyles = createUseStyles({
    columnBobines: {
        width: '25px',
        minWidth: '25px',
        textAlign: "center",
        marginRight: "1px"
    }
})

export const ColumnBobines = ({ n }) => {
    const classes = useStyles();
    return (<div style={{ display: "flex", flexDirection: "row" }}>
        {[...Array(n)].map((x, i) =>
            <div className={classes.columnBobines} key={`bh-${i}`}>{i + 1}</div>
        )}
    </div>);
}

export const Ofs = ({ r, setShow, rowIdx }) => {
    const navigate = useNavigate();
    const ofs = JSON.parse(r.ofs);
    const clientes = JSON.parse(r.clientes);
    const orders = JSON.parse(r.orders);
    const handleClick = () => {
        navigate('/app/currentline/menuactions', { state: { aggId: r.agg_of_id } });
    };

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {ofs && ofs.map((v, i) => {
                return (<StyledOf onClick={handleClick} /*color={bColors(v.estado).color} fontColor={bColors(v.estado).fontColor} */ key={`off-${v}-${rowIdx}`}>
                    <b>{v}</b>
                    <div>{orders[i]}</div>
                    <div className='cl'>{clientes[i]}</div>
                </StyledOf>);
            })}
        </div>
    );
};



export const Bobines = ({ b, bm, setShow }) => {
    let bobines = b;

    const handleClick = () => {
        setShow({ show: true, data: { bobinagem_id: bm.id, bobinagem_nome: bm.nome } });
    };

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {bobines.map((v, i) => {
                return (<StyledBobine onClick={handleClick} color={bColors(v.estado).color} fontColor={bColors(v.estado).fontColor} key={`bob-${v.id}`}><b>{v.estado === 'HOLD' ? 'HLD' : v.estado}</b><div className='lar'>{v.lar}</div></StyledBobine>);
            })}
        </div>
    );
};

export const typeListField = ({ onChange } = {}) => {
    return (
        <SelectField name="typelist" size="small" style={{ width: 150, marginRight: "3px" }} keyField="value" valueField="label" onChange={(v) => onChange(v, "typelist")} options={
            [{ value: "A", label: "Estado Bobines" },
            { value: "B", label: "Consumo Bobinagem" },
            { value: "C", label: "Ordens de Fabrico" }]} />
    );
}

export const validField = ({ onChange } = {}) => {
    return (
        <SelectField name="valid" size="small" style={{ width: 150, marginRight: "3px" }} keyField="value" valueField="label" onChange={(v) => onChange(v, "valid")} options={
            [{ value: "0", label: "Por validar" },
            { value: "1", label: "Validadas" },
            { value: "-1", label: " " }
            ]} />
    );
}

export const typeField = ({ onChange } = {}) => {
    return (
        <SelectField name="type" size="small" style={{ width: 220, marginRight: "3px" }} keyField="value" valueField="label" onChange={(v) => onChange(v, "type")} options={
            [{ value: "1", label: "Bobinagens da Ordem de Fabrico" },
            { value: "-1", label: "Todas as Bobinagens" }]} />
    );
}
