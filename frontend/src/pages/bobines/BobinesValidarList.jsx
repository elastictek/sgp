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
import ResultMessage from 'components/resultMessage';


import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge } from "antd";
const { TextArea } = Input;
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled, CompassOutlined } from '@ant-design/icons';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, BOBINE_DEFEITOS, SCREENSIZE_OPTIMIZED } from 'config';
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


const FEstado = ({ index, data, width = "70px", onChange }) => {
    const name = `st-${index}`;
    const tabIndex = 100 + index;
    return (<SelectField onChange={(v) => onChange("st", v, index)} value={data.st[index]} name={name} tabIndex={tabIndex} style={{ width }} size="small" options={BOBINE_ESTADOS} />);
};
const HeaderCol = ({ data, name, title, onChange }) => {
    return (<Space>{title}<Checkbox onChange={(v) => onChange(`${name}-all`, v)} checked={data[`${name}-all`]} name={`${name}-all`} /></Space>);
};
const FLarguraReal = ({ index, data, width = "60px", onChange }) => {
    const name = `lr-${index}`;
    const tabIndex = 200 + index;
    return (<InputNumber onChange={(v) => onChange("l_real", v, index)} tabIndex={tabIndex} controls={false} style={{ width }} value={data.l_real[index]} name={name} size="small" />);
}
const FDefeitos = ({ index, data, width = "100%", onChange }) => {
    const name = `defeitos-${index}`;
    const tabIndex = 300 + index;
    return (<SelectMultiField onChange={(v) => onChange("defeitos", v, index)} tabIndex={tabIndex} style={{ width }} name={name} value={data.defeitos[index]} allowClear size="small" options={BOBINE_DEFEITOS} />);
};
const FFalhaCorte = ({ index, data, width = "50px", onChange, min, max }) => {
    const name1 = `fc-i-${index}`;
    const name2 = `fc-e-${index}`;
    const tabIndex = 400 + index;
    const hasDefeito = useCallback(() => data.defeitos[index]?.some(v => v.value === 'fc'), [data.defeitos[index]]);
    return (<Space>
        <InputNumber min={min} max={max} onChange={(v) => onChange("fc-i", v, index)} value={data["fc"][index]?.init} tabIndex={tabIndex} controls={false} style={{ width }} disabled={!hasDefeito()} name={name1} size="small" />
        <InputNumber min={min} max={max} onChange={(v) => onChange("fc-e", v, index)} value={data["fc"][index]?.end} tabIndex={tabIndex} controls={false} style={{ width }} disabled={!hasDefeito()} name={name2} size="small" />
    </Space>);
}
const FFalhaFilme = ({ index, data, width = "50px", onChange, min, max }) => {
    const name1 = `ff-i-${index}`;
    const name2 = `ff-e-${index}`;
    const tabIndex = 500 + index;
    const hasDefeito = useCallback(() => data.defeitos[index]?.some(v => v.value === 'ff'), [data.defeitos[index]]);
    return (<Space>
        <InputNumber min={min} max={max} onChange={(v) => onChange("ff-i", v, index)} value={data["ff"][index]?.init} tabIndex={tabIndex} controls={false} style={{ width }} disabled={!hasDefeito()} name={name1} size="small" />
        <InputNumber min={min} max={max} onChange={(v) => onChange("ff-e", v, index)} value={data["ff"][index]?.end} tabIndex={tabIndex} controls={false} style={{ width }} disabled={!hasDefeito()} name={name2} size="small" />
    </Space>);
}

const FProbs = ({ index, data, width = "50px", onChange }) => {
    const name = `probs-${index}`;
    const tabIndex = 600 + index;
    return (<TextArea autoSize={{ minRows: 1, maxRows: 2 }} onChange={(v) => onChange("probs", v, index)} value={data.probs[index]} style={{ height: "22px", minHeight: "22px", maxHeight: "122px", overflowY: "hidden", resize: "none" }} tabIndex={tabIndex} name={name} size="small" />);
}

const FObs = ({ index, data, width = "50px", onChange }) => {
    const name = `obs-${index}`;
    const tabIndex = 700 + index;
    return (<TextArea autoSize={{ minRows: 1, maxRows: 2 }} onChange={(v) => onChange("obs", v, index)} value={data.obs[index]} style={{ height: "22px", minHeight: "22px", maxHeight: "122px", overflowY: "hidden", resize: "none" }} tabIndex={tabIndex} name={name} size="small" />);
}

//


export default ({ data, closeSelf }) => {
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false, data: {} });
    const [formFilter] = Form.useForm();
    const [formData, setFormData] = useImmer({ 'defeitos-all': 0, 'ff-all': 0, 'fc-all': 0, 'st-all': 0, 'probs-all': 0, 'obs-all': 0, st: [], l_real: [], defeitos: [], fc: [], ff: [], probs: [], obs: [] });
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/validarbobineslist/`, parameters: {}, pagination: { enabled: false, page: 1, pageSize: 30 }, filter: {}, sort: [{ column: 'nome', direction: 'ASC' }] } });

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
                    draft.l_real[i] = v.l_real;
                    draft.defeitos[i] = [];
                    draft.st[i] = v.estado;
                    draft.fc[i] = { init: null, end: null };
                    draft.ff[i] = { init: null, end: null };
                    draft.probs[i] = null;
                    draft.obs[i] = null;
                });
            }
        }
        //setFormData(draft => {
        //    draft.profile.bio = newBio;
        //  });
        //console.log("dataAPI.getData().rows");
        console.log(dataAPI.getData().rows);
    }, [dataAPI.hasData()]);

    const onChange = (type, value, index) => {
        switch (type) {
            case 'st-all':
            case 'fc-all':
            case 'ff-all':
            case 'probs-all':
            case 'obs-all':
            case 'defeitos-all':
                setFormData(draft => { draft[type] = value.target.checked; });
                break;
            case "defeitos":
                if (formData['defeitos-all']) {
                    setFormData(draft => { draft.defeitos = formData.defeitos.map(() => (value === undefined) ? [] : value); });
                } else {
                    setFormData(draft => { draft.defeitos[index] = (value === undefined) ? [] : value; });
                }
                break;
            case "probs":
                if (formData['probs-all']) {
                    setFormData(draft => { draft.probs = formData.probs.map(() => value.target.value); });
                } else {
                    setFormData(draft => { draft.probs[index] = value.target.value; });
                }
                break;
            case "obs":
                if (formData['obs-all']) {
                    setFormData(draft => { draft.obs = formData.obs.map(() => value.target.value); });
                } else {
                    setFormData(draft => { draft.obs[index] = value.target.value; });
                }
                break;
            case "st":
                if (formData['st-all']) {
                    setFormData(draft => { draft.st = formData.st.map(() => value); });
                } else {
                    setFormData(draft => { draft.st[index] = value; });
                }
                break;
            case "fc-e":
            case "fc-i":
                const attc = (type == "fc-i") ? "init" : "end";
                const idxsc = [];
                formData.defeitos.forEach((v, i) => { if (v.some(a => a.value === 'fc')) { idxsc.push(i); } });
                if (formData['fc-all']) {
                    setFormData(draft => { draft.fc = formData.fc.map((v, i) => ((idxsc.includes(i)) ? { ...v, [attc]: value } : v)); });
                } else {
                    setFormData(draft => { draft.fc[index] = { ...draft.fc[index], [attc]: value }; });
                }
                break;
            case "ff-e":
            case "ff-i":
                const attf = (type == "ff-i") ? "init" : "end";
                const idxsf = [];
                formData.defeitos.forEach((v, i) => { if (v.some(a => a.value === 'ff')) { idxsf.push(i); } });
                if (formData['ff-all']) {
                    setFormData(draft => { draft.ff = formData.ff.map((v, i) => ((idxsf.includes(i)) ? { ...v, [attf]: value } : v)); });
                } else {
                    setFormData(draft => { draft.ff[index] = { ...draft.ff[index], [attf]: value }; });
                }
                break;
            case "l_real":
                setFormData(draft => { draft.l_real[index] = value; });
                break;
        }
    };




    const onSubmit = async (type) => {
        const vData = [];
        const _all_defeitos = BOBINE_DEFEITOS.reduce((obj, item) => (obj[item.value] = 0, obj), {});
        const errors = [];
        for (let [i, v] of formData.defeitos.entries()) {
            const _defeitos = formData.defeitos[i].reduce((obj, item) => (obj[item.value] = 1, obj), {});

            if (formData.st[i] === 'DM12' || formData.st[i] === 'R') {
                if (formData.defeitos[i].length === 0) {
                    errors.push(<li key={`err-${i}`}>A Bobine {i} Classificadas como DM ou R tem de ter pelo menos um defeito!</li>);
                }
                if (formData.defeitos[i].some(a => a.value === 'fc')) {
                    //Tem falha de corte
                    if (formData.fc[i]?.init === null || formData.fc[i]?.end === null) {
                        errors.push(<li key={`err-${i}`}>A Bobine {i} tem de ter preenchido início e fim de falha de corte!</li>);
                    } else if (formData.fc[i]?.init > formData.fc[i]?.end) {
                        errors.push(<li key={`err-${i}`}>A falha de Corte na Bobine {i} tem de ser um intervalo válido!</li>);
                    }
                }
                if (formData.defeitos[i].some(a => a.value === 'ff')) {
                    //Tem falha de filme
                    if (formData.ff[i]?.init === null || formData.ff[i]?.end === null) {
                        errors.push(<li key={`err-${i}`}>A Bobine {i} tem de ter preenchido início e fim de falha de filme!</li>);
                    } else if (formData.ff[i]?.init > formData.ff[i]?.end) {
                        errors.push(<li key={`err-${i}`}>A falha de Filme na Bobine {i} tem de ser um intervalo válido!</li>);
                    }
                }
                if (formData.defeitos[i].some(a => a.value === 'fmp') && !formData.obs[i]) {
                    errors.push(<li key={`err-${i}`}>Falha de Matéria Prima na Bobine {i}, tem de preencher o motivo nas Observações!</li>);
                }
                if (formData.defeitos[i].some(a => a.value === 'fmp') && !formData.obs[i]) {
                    errors.push(<li key={`err-${i}`}>Falha de Matéria Prima na Bobine {i}, tem de preencher o motivo nas Observações!</li>);
                }
                if (formData.defeitos[i].some(a => a.value === 'buraco') && !formData.obs[i]) {
                    errors.push(<li key={`err-${i}`}>Buracos na Bobine {i}, tem de preencher os Metros de Desbobinagem nas Observações!</li>);
                }
                if (formData.defeitos[i].some(a => a.value === 'esp') && !formData.probs[i]) {
                    errors.push(<li key={`err-${i}`}>Gramagem na Bobine {i}, tem de preencher as Propriedades Observações!</li>);
                }
                if (formData.defeitos[i].some(a => a.value === 'prop') && !formData.probs[i]) {
                    errors.push(<li key={`err-${i}`}>Propriedades Bobine {i}, tem de preencher as Propriedades Observações!</li>);
                }
            }




            vData.push({ id: dataAPI.getData().rows[i].id, l_real: formData.l_real[i], estado: formData.st[i], prop_obs: formData.probs[i], obs: formData.obs[i], ..._all_defeitos, ..._defeitos });

            //console.log(key, dataAPI.getData().rows[key], formData.defeitos[`${dataAPI.getData().rows[key].id}`])
            //const _t = formData.defeitos[key].map(v => ({ [v.key]: 1 }));
            //console.log(dataAPI.getData().rows[key].id);
            //_defeitos.push({ id: dataAPI.getData().rows[key].id })
            //console.log(_t);
        }
        if (errors.length > 0) {
            Modal.error({ centered:true, width:"auto", style:{maxWidth:"768px"}, title: 'Erro de validação/classificação', content: <div style={{display:"flex"}}><div style={{maxHeight:"60vh",width:"100%"}}><YScroll><ul style={{ whiteSpace: 'nowrap', margin: '15px', padding: '15px' }}>{errors}</ul></YScroll></div></div> });
        } else {
            setLoading(true);
            try {
                let response = await fetchPost({ url: `${API_URL}/validarbobinagem/`, parameters: { bobines: vData, ...data } });
                if (response.data.status !== "error") {
                    setResultMessage(response.data);
                }
            } catch (e) {
                Modal.error({ centered:true, width:"auto", style:{maxWidth:"768px"}, title: 'Erro de validação/classificação', content: <div style={{display:"flex"}}><div style={{maxHeight:"60vh",width:"100%"}}><YScroll>{e.message}</YScroll></div></div> });
            };
            setLoading(false);
        }

        /*
        
        defeitos = [cd.get('nok'), cd.get('con'), cd.get('descen'), cd.get('presa'), cd.get('diam_insuf'), cd.get('suj'), cd.get('car'), cd.get('lac'), cd.get('ncore'), 
        cd.get('sbrt'), cd.get('fc'), cd.get('ff'), cd.get('fmp'), cd.get('furos'), cd.get('buraco'), cd.get('esp'), cd.get('prop'), cd.get('outros'), cd.get('troca_nw')]
        
                               
                                
                                

                                elif (estado == 'DM' or estado == 'R') and defeitos[15] == True and prop_obs == '':
                                    messages.error(
                                        request, 'Bobine nº' + str(index) + ' - Gramagem: Preencher nas Prop. Obs.')
                                    messages_count += 1
                                elif (estado == 'DM' or estado == 'R') and defeitos[16] == True and prop_obs == '':
                                    messages.error(
                                        request, 'Bobine nº' + str(index) + ' - Propriedades: Preencher nas Prop. Obs.')
                                    messages_count += 1
                                else:
        */





        switch (type) {
            case "validar": break;
            case "hold": break;
            case "aprovar": break;
        }
    }

    const selectionRowKey = (record) => {
        return `${record.id}`;
    }
    /* 
        const components = {
            body: {
                //row: EditableRow,
                //cell: EditableCell,
            },
        }; */

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "bobineslist_validar",
            include: {
                ...((common) => (
                    {
                        nome: { title: "Bobine", width: 125, fixed: 'left', render: v => <span style={{ color: "#096dd9", cursor: "pointer" }}>{v}</span>, ...common },
                        "A": { title: <HeaderCol title="Estado" name="st" data={formData} onChange={onChange} />, width: 80, render: (v, r, i) => <FEstado width="70px" index={i} data={formData} onChange={onChange} />, ...common },
                        largura: { title: "Lar. mm", width: 60, align: 'right', ...common },
                        "B": { title: "Largura Real", width: 90, render: (v, r, i) => <FLarguraReal width="60px" index={i} data={formData} onChange={onChange} />, ...common },
                        "E": { title: <HeaderCol title="Outros Defeitos" name="defeitos" data={formData} onChange={onChange} />, render: (v, r, i) => <FDefeitos width="100%" index={i} data={formData} onChange={onChange} />, ...common },
                        "C": { title: <HeaderCol title="Falha Corte" name="fc" data={formData} onChange={onChange} />, width: 120, render: (v, r, i) => <FFalhaCorte width="50px" index={i} data={formData} onChange={onChange} min={1} max={r.comp} />, ...common },
                        "D": { title: <HeaderCol title="Falha Filme" name="ff" data={formData} onChange={onChange} />, width: 120, render: (v, r, i) => <FFalhaFilme width="50px" index={i} data={formData} onChange={onChange} min={1} max={r.comp} />, ...common },
                        comp: { title: "Comp. m", width: 60, ...common },
                        "F": { title: <HeaderCol title="Prop. Obs." name="probs" data={formData} onChange={onChange} />, width: 270, render: (v, r, i) => <FProbs width="50px" index={i} data={formData} onChange={onChange} />, ...common },
                        "G": { title: <HeaderCol title="Obs." name="obs" data={formData} onChange={onChange} />, width: 270, render: (v, r, i) => <FObs width="50px" index={i} data={formData} onChange={onChange} />, ...common }
                    }
                ))({ idx: 1, optional: false, sorter: false })
            },
            exclude: []
        }
    );

    const onSuccessOK = () => {
        closeSelf();
    }

    return (
        <>
            <ResultMessage
                result={resultMessage}
                successButtonOK={<Button type="primary" key="goto-list" onClick={onSuccessOK}>OK</Button>}
            >
                <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                    <ToolbarTable dataAPI={dataAPI} onSubmit={onSubmit} />
                    <Table
                        columnChooser={false}
                        reload={false}
                        header={false}
                        stripRows
                        darkHeader
                        size="small"
                        toolbar={<></>}
                        selection={{ enabled: false, rowKey: record => selectionRowKey(record), onSelection: setSelectedRows, multiple: false, selectedRows, setSelectedRows }}
                        paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                        dataAPI={dataAPI}
                        columns={columns}
                        onFetch={dataAPI.fetchPost}
                        scroll={{ x: (SCREENSIZE_OPTIMIZED.width - 100), /* y: '80vh', scrollToFirstRowOnChange: true */ }}
                    /* components={components} */
                    //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}
                    />
                </Spin>
            </ResultMessage>
        </>
    )
}