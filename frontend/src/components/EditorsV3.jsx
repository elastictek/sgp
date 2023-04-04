import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import classNames from "classnames";
import moment from 'moment';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { useDataAPI } from "utils/useDataAPI";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Drawer, Badge, Checkbox } from "antd";
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
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SwitchField, Label, SelectMultiField,AutoCompleteField } from 'components/FormFields';
import { API_URL, DOSERS, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS, DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, JUSTIFICATION_OUT } from 'config';
import { Status } from '../pages/bobines/commons';
import IconButton from "components/iconButton";
import { CgCloseO } from 'react-icons/cg';
import { sha1 } from 'crypto-hash';
import { json, orderObjectKeys } from "utils/object";

const focus = (el, h,) => { el?.focus(); };

export const Clientes = ({ name, label, forInput = null, forViewBorder = true, forViewBackground = true, wrapFormItem = null, alert, ...props }) => {
    return (
        <Field name={name} label={label} forInput={forInput} forViewBorder={forViewBorder} forViewBackground={forViewBackground} wrapFormItem={wrapFormItem} alert={alert}>
            <Selector
                title="Clientes"
                params={{ payload: { url: `${API_URL}/artigos/sql/`, parameters: { method: "ClientesLookup" }, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } }}
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