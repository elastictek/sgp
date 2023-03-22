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


export const SubType = ({ type, v }) => {
    return (<div style={{ fontWeight: 700 }}>{("subtypes" in tasks[parseInt(type)]) && tasks[parseInt(type)]?.subtypes[v]?.name}</div>);
}
export const Status = ({ v, genre = "m", onClick }) => {
    return (<>
        {v == 0 && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }}>Inativ{genre === "m" ? "o" : "a"} </Tag>}
        {v == 1 && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="green">Ativ{genre === "m" ? "o" : "a"}</Tag>}
        {v == 9 && <Tag {...onClick && { onClick }} style={{ width: "80px", ...onClick && { cursor: "pointer" } }} color="red">Finalizad{genre === "m" ? "o" : "a"}</Tag>}
    </>);

}
export const modes = [{ value: 1, label: "Execução" }, { value: 2, label: "Pré-Seleção" }, { value: 3, label: "Execução/Pré-Seleção" }];
export const checklistStatus = [{ value: 0, label: "Inativa" }, { value: 1, label: "Ativa" }, { value: 9, label: "Fechada" }];
export const taskStatus = [{ value: 0, label: "Inativa" }, { value: 1, label: "Ativa" }, { value: 9, label: "Fechada" }];

export const tasks = {
    1: {
        id: 1, task: "Troca de etiqueta", action: "Trocar etiqueta", subtypes: {
            1: { name: "Com alteração do lote" },
            2: { name: "Sem alteração do lote" }
        }
    },
    5: { id: 5, task: "Reembalamento", action: "Reembalar" },
    10: { id: 10, task: "Paletes de stock", action: "Adicionar palete de stock" },
    15: { id: 15, task: "Retrabalho", action: "Retrabalhar" },
};

export const tasksMenuItems = Object.keys(tasks).map(v => ({
    key: tasks[v].id, label: tasks[v].task
}));

export const fnTasks = {
    1: { fn: () => { } },
    5: { fn: () => { } },
    10: { fn: () => { } },
    15: { fn: () => { } }
};

export const changeStatus = (title,statusList, onFinish, genre = "m") => {
    console.log(statusList)
    Modal.confirm({
        title:title,
        content: <div>
            {statusList.map((v, i) => {
                return (<div><Status genre={genre} v={v.value} key={`st-${i}`} /></div>);
            })}
        </div>
    })
}


export const TypeChecklist = ({ v, onClick }) => {
    return (<div style={{}}><Tag onClick={() => onClick && onClick()}>{tasks[parseInt(v)].task}</Tag></div>);
}

export const ButtonTypeChecklist = ({ v, onClick }) => {
    return (<div style={{}}><Button onClick={() => onClick && onClick()}>{tasks[parseInt(v)].action}</Button></div>);
}

export const ButtonTask = ({ t, s, onClick }) => {
    return (<div style={{}}>
        {s === 1 && <Button type='link' size="small" onClick={() => onClick && onClick()}>{tasks[parseInt(t)].action}</Button>}
        {s !== 1 && <div style={{ padding: "0px 7px" }}>{tasks[parseInt(t)].task}</div>}
    </div>);
}

export const ItemStatus = ({ v }) => {
    return (<Tag style={{ width: "80px" }} color={v === 2 ? "green" : "orange"}>{v === 2 ? "Executado" : "Por executar"}</Tag>);

}