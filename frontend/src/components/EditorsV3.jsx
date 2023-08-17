import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import classNames from "classnames";
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { useDataAPI } from "utils/useDataAPI";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Drawer, Badge, Checkbox, Divider } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { CheckCircleOutlined, DeleteOutlined, PlusOutlined, CopyOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, ReadOutlined, LockOutlined, DeleteFilled, PlusCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import YScroll from 'components/YScroll';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SwitchField, Label, SelectMultiField, AutoCompleteField } from 'components/FormFields';
import { API_URL, DOSERS, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS, DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, JUSTIFICATION_OUT } from 'config';
import { Status } from '../pages/bobines/commons';
import IconButton from "components/iconButton";
import { CgCloseO } from 'react-icons/cg';
import { sha1 } from 'crypto-hash';
import { json, orderObjectKeys } from "utils/object";
import { MultiLine } from 'components/tableEditors';

const focus = (el, h,) => { el?.focus(); };

export const FormulacaoPlanSelect = ({ name, label, forInput = null, forViewBorder = true, forViewBackground = true, wrapFormItem = null, alert,agg_of_id, ...props }) => {
    return (
        <Field name={name} label={label} forInput={forInput} forViewBorder={forViewBorder} forViewBackground={forViewBackground} wrapFormItem={wrapFormItem} alert={alert}>
            <Selector
                title="Formulações"
                params={{ payload: { url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "FormulacaoPlanList" }, pagination: { enabled: false, limit:100 }, filter: {agg_of_id}, sort: [] } }}
                keyField={["plan_id"]}
                textField="designacao"
                detailText={r => <div style={{display:"flex"}}>
                    <div>{r?.idx}<Divider type='vertical'/></div>
                    {r?.group_name && <div>{r?.group_name}<Divider type='vertical'/></div>}
                    {r?.subgroup_name && <div>{r?.subgroup_name}<Divider type='vertical'/></div>}
                    {r?.cliente_nome && <div>{r?.cliente_nome}<Divider type='vertical'/></div>}
                </div>}
                style={{ fontWeight: 700 }}
                columns={[
                    { key: 'idx', name: 'Index', width: 40,frozen: true },
                    { key: 'versao', name: 'Versão',width:40,frozen: true },
                    { key: 'designacao', name: 'Designação',width:320,frozen: true },                    
                    { key: 'group_name', name: 'Grupo',width:200 },
                    { key: 'subgroup_name', name: 'SubGrupo',width:200 },
                    { key: 'observacoes', name: 'Observações' },
                    
                ]}
                popupWidth="95%"
                type="drawer"
                filters={{}}
                toolbar={false}
                search={false}
                moreFilters={false}
                {...props}
            />
        </Field>
    );
}

export const CortesPlanSelect = ({ name, label, forInput = null, forViewBorder = true, forViewBackground = true, wrapFormItem = null, alert,agg_of_id, ...props }) => {
    return (
        <Field name={name} label={label} forInput={forInput} forViewBorder={forViewBorder} forViewBackground={forViewBackground} wrapFormItem={wrapFormItem} alert={alert}>
            <Selector
                title="Cortes"
                params={{ payload: { url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "CortesPlanList" }, pagination: { enabled: false, limit:100 }, filter: {agg_of_id}, sort: [] } }}
                keyField={["plan_id"]}
                textField="designacao"
                detailText={r => <div style={{display:"flex"}}>
                    <div>{r?.idx}<Divider type='vertical'/></div>
                    {r?.cortes && <div style={{ color: "#1890ff", fontWeight: 600 }}>{r.cortes.replaceAll('"', ' ')}<Divider type='vertical'/></div>}
                    {r?.cortes_ordem && <div style={{ color: "#1890ff", fontWeight: 600 }}>{r.cortes_ordem.replaceAll('"', ' ')}<Divider type='vertical'/></div>}
                </div>}
                style={{ fontWeight: 700 }}
                columns={[
                    { key: 'idx', name: 'Index', width: 40,frozen: true },
                    { key: 'versao', name: 'Versão',width:40,frozen: true },
                    { key: 'designacao', name: 'Designação',width:180,frozen: true },
                    { key: 'cortes', name: 'Cortes', formatter:p => <div style={{ color: "#1890ff", fontWeight: 600 }}>{p.row.cortes.replaceAll('"', ' ')}</div> },
                    { key: 'cortes_ordem', name: 'Posicionamento', formatter:p => <div style={{ color: "#1890ff", fontWeight: 600 }}>{p.row.cortes_ordem.replaceAll('"', ' ')}</div> },
                    { key: 'largura_util', name: 'Largura Útil', width: 80 },
                    { key: 'observacoes', width:200,name: 'Observações' }
                    
                ]}
                popupWidth="95%"
                type="drawer"
                filters={{}}
                toolbar={false}
                search={false}
                moreFilters={false}
                {...props}
            />
        </Field>
    );
}

export const Cores = ({ name, label, forInput = null, forViewBorder = true, forViewBackground = true, wrapFormItem = null, alert,core,largura, ...props }) => {
    return (
        <Field name={name} label={label} forInput={forInput} forViewBorder={forViewBorder} forViewBackground={forViewBackground} wrapFormItem={wrapFormItem} alert={alert}>
            <Selector
                title="Cores"
                params={{ payload: { url: `${API_URL}/materiasprimas/sql/`, parameters: { method: "MateriasPrimasLookup",type:"cores", ...core && {core}, ...largura && {largura} }, pagination: { enabled: true, pageSize: 15 }, filter: {}, sort: [] } }}
                keyField={["ITMREF_0"]}
                textField="ITMDES1_0"
                detailText={r => r?.ITMREF_0}
                style={{ fontWeight: 700 }}
                columns={[
                    { key: 'ITMREF_0', name: 'Cód', width: 160 },
                    { key: 'ITMDES1_0', name: 'Nome' }
                ]}
                filters={{ fmulti_artigo: { type: "any", width: 150, text: "Core", autoFocus: true } }}
                moreFilters={{}}
                {...props}
            />


            {/*  <SelectField size="small" data={coresLookup} keyField="ITMREF_0" textField="ITMDES1_0"
                                    optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                    showSearch
                                    labelInValue
                                    filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                /> */}
        </Field>
    );
}

export const Clientes = ({ name, label, forInput = null, forViewBorder = true, forViewBackground = true, wrapFormItem = null, alert, ...props }) => {
    return (
        <Field name={name} label={label} forInput={forInput} forViewBorder={forViewBorder} forViewBackground={forViewBackground} wrapFormItem={wrapFormItem} alert={alert}>
            <Selector
                title="Clientes"
                params={{ payload: { url: `${API_URL}/artigos/sql/`, parameters: { method: "ClientesLookup" }, pagination: { enabled: true, pageSize: 15 }, filter: {}, sort: [] } }}
                keyField={["BPCNUM_0"]}
                textField="BPCNAM_0"
                detailText={r => r?.BPCNUM_0}
                style={{ fontWeight: 700 }}
                columns={[
                    { key: 'BPCNUM_0', name: 'Cód', width: 160 },
                    { key: 'BPCNAM_0', name: 'Nome' }
                ]}
                filters={{ fmulti_customer: { type: "any", width: 150, text: "Cliente", autoFocus: true } }}
                moreFilters={{}}
                {...props}
            />
        </Field>
    );
}

export const Produtos = ({ name, label, forInput = null, forViewBorder = true, forViewBackground = true, wrapFormItem = null, alert, ...props }) => {
    return (
        <Field name={name} label={label} forInput={forInput} forViewBorder={forViewBorder} forViewBackground={forViewBackground} wrapFormItem={wrapFormItem} alert={alert}>
            <Selector
                title="Produtos"
                params={{ payload: { url: `${API_URL}/artigos/sql/`, parameters: { method: "ProdutosLookup" }, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } }}
                keyField={["id"]}
                textField="produto_cod"
                style={{ fontWeight: 700 }}
                columns={[
                    { key: 'produto_cod', name: 'Cód', width: "1fr" },
                ]}
                filters={{ fcod: { type: "any", width: 150, text: "Produto", autoFocus: true } }}
                moreFilters={{}}
                {...props}
            />
        </Field>
    );
}

export const Artigos = ({ name, label, forInput = null, forViewBorder = true, forViewBackground = true, wrapFormItem = null, alert, ...props }) => {
    return (<Field name={name} label={label} forInput={forInput} forViewBorder={forViewBorder} forViewBackground={forViewBackground} wrapFormItem={wrapFormItem} alert={alert}>
        <Selector
            title="Artigo"
            params={{ payload: { url: `${API_URL}/artigos/sql/`, parameters: { method: "ArtigosLookup" }, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } }}
            keyField={["id"]}
            textField="des"
            detailText={r => r?.cod}
            style={{ fontWeight: 700 }}
            columns={[
                { key: 'cod', name: 'Cód', width: 160 },
                { key: 'des', name: 'Nome' }
            ]}
            filters={{ fartigo: { type: "any", width: 150, text: "Artigo", autoFocus: true } }}
            moreFilters={{}}
            {...props}
        />
    </Field>);
}


const fetchFormulacaoGroups = async ({ value, groups, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "FormulacaoGroupsLookup" }, pagination: { limit: 20 }, filter: { group_name: getFilterValue(value, 'any') }, signal });
    if (!groups || groups.length === 0) {
        return rows;
    } else {
        const r = [...rows];
        groups.forEach(el => { if (!r.some(v => v.group === el)) { r.push({ group: el }); } });
        return r;
    }
}
export const FormulacaoGroups = ({ name, label, forInput = null, forViewBorder = true, forViewBackground = true, wrapFormItem = null, alert, groups, ...props }) => {
    return (
        <Field name={name} label={label} forInput={forInput} forViewBorder={forViewBorder} forViewBackground={forViewBackground} wrapFormItem={wrapFormItem} alert={alert}>
            <AutoCompleteField defaultOpen={true} bordered={false} style={{ width: "100%" }}
                keyField="group_name"
                textField="group_name"
                showSearch
                showArrow
                allowClear
                fetchOptions={async (value) => await fetchFormulacaoGroups({ value, groups })}
                {...props}
            />
        </Field>
    );
}

const fetchFormulacaoSubGroups = async ({ value, subgroups, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "FormulacaoSubGroupsLookup" }, pagination: { limit: 20 }, filter: { subgroup_name: getFilterValue(value, 'any') }, signal });
    if (!subgroups || subgroups.length === 0) {
        return rows;
    } else {
        const r = [...rows];
        subgroups.forEach(el => { if (!r.some(v => v.group === el)) { r.push({ group: el }); } });
        return r;
    }
}
export const FormulacaoSubGroups = ({ name, label, forInput = null, forViewBorder = true, forViewBackground = true, wrapFormItem = null, alert, subgroups, ...props }) => {
    return (
        <Field name={name} label={label} forInput={forInput} forViewBorder={forViewBorder} forViewBackground={forViewBackground} wrapFormItem={wrapFormItem} alert={alert}>
            <AutoCompleteField defaultOpen={true} bordered={false} style={{ width: "100%" }}
                keyField="subgroup_name"
                textField="subgroup_name"
                showSearch
                showArrow
                allowClear
                fetchOptions={async (value) => await fetchFormulacaoSubGroups({ value, subgroups })}
                {...props}
            />
        </Field>
    );
}