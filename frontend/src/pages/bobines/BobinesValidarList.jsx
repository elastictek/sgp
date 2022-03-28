import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { API_URL, GTIN } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues, getFilterValue, isValue } from 'utils';

import FormManager, { FieldLabel, FieldSet as OldFieldSet, FilterTags, AutoCompleteField as OldAutoCompleteField, useMessages, DropDown } from "components/form";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, InputAddon, SelectField, TitleForm, WrapperForm, SelectDebounceField, AutoCompleteField, RangeDateField, RangeTimeField, SelectMultiField, FilterDrawer, CheckboxField, SwitchField } from "components/formLayout";
import Drawer from "components/Drawer";
import Table, { setColumns } from "components/table";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import MoreFilters from 'assets/morefilters.svg';
import { Outlet, useNavigate } from "react-router-dom";
import YScroll from "components/YScroll";
import { MdAdjust } from 'react-icons/md';


import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge } from "antd";
const { TextArea } = Input;
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled } from '@ant-design/icons';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, BOBINE_DEFEITOS } from 'config';
import { useImmer } from 'use-immer';
const { Title } = Typography;

const ApproveButton = styled(Button)`
  &&& {
    background-color: #389e0d;
    border-color: #389e0d;
    color:#fff;
    &:hover{
        background-color: #52c41a;
        border-color: #52c41a;
    }
  }
`;

const ToolbarTable = ({ dataAPI, onSubmit }) => {
    const navigate = useNavigate();

    const leftContent = (
        <Space>
            <Button type="primary" size="small" onClick={() => onSubmit("validar")}>Validar</Button>
            <ApproveButton size="small" onClick={() => onSubmit("aprovar")}>Aprovar</ApproveButton>
            <Button danger size="small" onClick={() => onSubmit("hold")}>Hold</Button>
            {/* <button onClick={() => navigate(-1)}>go back</button> */}
            {/* <Button type="primary" size="small" disabled={flyoutStatus.visible ? true : false} onClick={() => setFlyoutStatus(prev => ({ ...prev, visible: !prev.visible }))}>Flyout</Button> */}
        </Space>
    );

    const rightContent = (
        <Space>
            <div style={{ display: "flex", flexDirection: "row", whiteSpace: "nowrap" }}>

            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }}>

            </div>
        </Space>
    );
    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}


const FEstado = ({ index, data, width = "70px" }) => {
    const name = `st-${index}`;
    const tabIndex = 100 + index;
    return (<SelectField value={data.estado[name]} name={name} tabIndex={tabIndex} style={{ width }} size="small" options={BOBINE_ESTADOS} />);
};
const HeaderCol = ({ data, name, title, onChange }) => {
    return (<Space>{title}<Checkbox onChange={(v) => onChange(`${name}-all`, v)} checked={data[`${name}-all`]} name={`${name}-all`} /></Space>);
};
const FLarguraReal = ({ index, data, width = "60px" }) => {
    const name = `lr-${index}`;
    const tabIndex = 200 + index;
    return (<InputNumber tabIndex={tabIndex} controls={false} style={{ width }} value={data.l_real[name]} name={name} size="small" />);
}
const FDefeitos = ({ index, data, width = "100%", onChange }) => {
    const name = `defeitos-${index}`;
    const tabIndex = 300 + index;
    return (<SelectMultiField onChange={(v) => onChange("defeitos", v, index)} tabIndex={tabIndex} style={{ width }} name={name} value={data.defeitos[index]} allowClear size="small" options={BOBINE_DEFEITOS} />);
};
const FFalhaCorte = ({ index, data, width = "50px" }) => {
    const name1 = `fc-i-${index}`;
    const name2 = `fc-e-${index}`;
    const tabIndex = 400 + index;
    return (<Space><InputNumber tabIndex={tabIndex} controls={false} style={{ width }} disabled name={name1} size="small" /><InputNumber tabIndex={tabIndex} controls={false} style={{ width }} disabled name={name2} size="small" /></Space>);
}
const FFalhaFilme = ({ index, data, width = "50px" }) => {
    const name1 = `ff-i-${index}`;
    const name2 = `ff-e-${index}`;
    const tabIndex = 500 + index;
    return (<Space><InputNumber tabIndex={tabIndex} controls={false} style={{ width }} disabled name={name1} size="small" /><InputNumber tabIndex={tabIndex} controls={false} style={{ width }} disabled name={name2} size="small" /></Space>);
}



export default ({ data }) => {
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false, data: {} });
    const [formFilter] = Form.useForm();
    const [formData, setFormData] = useImmer({ 'defeitos-all': 0, 'ff-all': 0, 'fc-all': 0, 'st-all': 0, estado: {}, l_real: {}, defeitos: [], fc: {}, ff: {} });
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/validarbobineslist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 30 }, filter: {}, sort: [{ column: 'nome', direction: 'ASC' }] } });

    useEffect(() => {
        const { bobinagem_id } = data;
        const cancelFetch = cancelToken();
        dataAPI.first();
        dataAPI.addFilters({ bobinagem_id });
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, []);

    useEffect(() => {
        if (dataAPI.hasData()) {
            for (let [i, v] of dataAPI.getData().rows.entries()) {
                setFormData(draft => {
                    draft.estado[`st-${i}`] = v.estado;
                    draft.l_real[`lr-${i}`] = v.l_real;
                    draft.defeitos[i]=[];
                });
            }
        }
        //setFormData(draft => {
        //    draft.profile.bio = newBio;
        //  });
        //console.log("dataAPI.getData().rows");
        //console.log(dataAPI.getData().rows);
    }, [dataAPI.hasData()]);


    const onChange = (type, value, index) => {

        switch (type) {
            case 'defeitos-all':
                console.log("---------------", value)
                setFormData(draft => {
                    draft['defeitos-all'] = value.target.checked;
                });
                break;
            case "defeitos":
                if (formData['defeitos-all']) {
                    setFormData(draft => {
                        draft.defeitos = formData.defeitos.map(() => value);
                    });

                } else {
                    setFormData(draft => {
                        draft.defeitos[index] = value;
                    });
                }
                break;
        }
        console.log(formData)
    };

    const onSubmit = (type) => {
        const _defeitos = [];
        for (let key in formData.defeitos) {
            console.log(key, dataAPI.getData().rows[key], formData.defeitos[`${dataAPI.getData().rows[key].id}`])
            const _t = formData.defeitos[key].map(v => ({ [v.key]: 1 }));
            console.log(dataAPI.getData().rows[key].id);
            _defeitos.push({ id: dataAPI.getData().rows[key].id })
            console.log(_t);
        }
        switch (type) {
            case "validar": break;
            case "hold": break;
            case "aprovar": break;
        }
    }

    const selectionRowKey = (record) => {
        return `${record.id}`;
    }

    const components = {
        body: {
            //row: EditableRow,
            //cell: EditableCell,
        },
    };

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "bobineslist_validar",
            include: {
                ...((common) => (
                    {
                        nome: { title: "Bobine", width: 125, render: v => <span style={{ color: "#096dd9", cursor: "pointer" }}>{v}</span>, ...common },
                        "A": { title: <HeaderCol title="Estado" name="st" data={formData} onChange={onChange} />, width: 80, render: (v, r, i) => <FEstado width="70px" index={i} data={formData} />, ...common },
                        "B": { title: "Largura Real", width: 90, render: (v, r, i) => <FLarguraReal width="60px" index={i} data={formData} />, ...common },
                        "E": { title: <HeaderCol title="Outros Defeitos" name="defeitos" data={formData} onChange={onChange} />, render: (v, r, i) => <FDefeitos width="100%" index={i} data={formData} onChange={onChange} />, ...common },
                        "C": { title: <HeaderCol title="Falha Corte" name="fc" data={formData} onChange={onChange} />, width: 70, render: (v, r, i) => <FFalhaCorte width="50px" index={i} data={formData} />, ...common },
                        "D": { title: <HeaderCol title="Falha Filme" name="ff" data={formData} onChange={onChange} />, width: 70, render: (v, r, i) => <FFalhaFilme width="50px" index={i} data={formData} />, ...common },
                        "F": { title: <HeaderCol title="Prop. Obs." name="probs" data={formData} onChange={onChange} />, width: 270, render: (v, r, i) => <TextArea style={{ height: "22px", minHeight: "22px", maxHeight: "122px", overflowY: "hidden", resize: "none" }} tabIndex={600 + i} name={`probs-i-${i}`} size="small" />, ...common },
                        "G": { title: <HeaderCol title="Obs." name="obs" data={formData} onChange={onChange} />, width: 270, render: (v, r, i) => <TextArea autoSize={{ minRows: 1, maxRows: 6 }} style={{ height: "22px", minHeight: "22px", maxHeight: "122px", overflowY: "hidden", resize: "none" }} tabIndex={700 + i} name={`obs-i-${i}`} size="small" />, ...common }
                    }
                ))({ idx: 1, optional: false, sorter: false })
            },
            exclude: []
        }
    );

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                <ToolbarTable dataAPI={dataAPI} onSubmit={onSubmit} />
                <Table
                    columnChooser={false}
                    reload={false}
                    header={false}
                    stripRows
                    darkHeader
                    size="small"
                    /* toolbar={<GlobalSearch columns={columns?.report} form={formFilter} dataAPI={dataAPI} setShowFilter={setShowFilter} showFilter={showFilter} />} */
                    selection={{ enabled: false, rowKey: record => selectionRowKey(record), onSelection: setSelectedRows, multiple: false, selectedRows, setSelectedRows }}
                    paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                    dataAPI={dataAPI}
                    columns={columns}
                    onFetch={dataAPI.fetchPost}
                    components={components}
                //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}
                />
            </Spin>
        </>
    )
}