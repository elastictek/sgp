import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { useSubmitting, getFilterRangeValues, getFilterValue, isValue } from "utils";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import loadInit from "utils/loadInit";
import { useNavigate, useLocation } from "react-router-dom";
import Portal from "components/portal";
import { usePermission } from "utils/usePermission";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, AutoComplete } from "antd";
const { Title, Text } = Typography;
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, ConsoleSqlOutlined } from '@ant-design/icons';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, RangeTimeField, SelectDebounceField, AutoCompleteField } from 'components/FormFields';
/* import { ColumnBobines, Ofs, Bobines, typeListField, typeField, validField } from "./commons"; */
import ToolbarTitle from 'components/ToolbarTitle';
import { Quantity, ColumnPrint, FormPrint } from './commons';
import YScroll from 'components/YScroll';

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'><Field name="fgroup" label={{ enabled: true, text: "Grupo", pos: "top", padding: "0px" }}>
            <AutoCompleteField
                dropdownMatchSelectWidth={false}
                style={{ width: "130px" }}
                placeholder="Grupo"
                size="small"
                keyField="group"
                textField="group"
                showSearch
                showArrow
                allowClear
                fetchOptions={async (value) => await fetchMateriasPrimasGroups({ value })}
            />
        </Field>
        </Col>
        <Col xs='content'><Field name="fmulti_artigo" label={{ enabled: true, text: "Artigo", pos: "top", padding: "0px" }}>
            <AutoCompleteField
                dropdownMatchSelectWidth={false}
                style={{ width: "200px" }}
                placeholder="Artigo"
                size="small"
                keyField="ITMREF_0"
                textField="ITMDES1_0"
                showSearch
                showArrow
                allowClear
                fetchOptions={async (value) => await fetchMateriasPrimas({ value })}
            />
        </Field>
        </Col>
    </>
    );
}


const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    /* { fbobinagem: { label: "Nº Bobinagem", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data Bobinagem", field: { type: "rangedate", size: 'small' } } },
    { ftime: { label: "Início/Fim", field: { type: "rangetime", size: 'small' } } },
    { fduracao: { label: "Duração", field: { type: 'input', size: 'small' }, span: 12 } },
    { farea: { label: "Área", field: { type: 'input', size: 'small' }, span: 12 }, fdiam: { label: "Diâmetro", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcore: { label: "Core", field: { type: 'input', size: 'small' }, span: 12 }, fcomp: { label: "Comprimento", field: { type: 'input', size: 'small' }, span: 12 } },
    //Defeitos
    {
        freldefeitos: { label: " ", field: TipoRelation, span: 4 },
        fdefeitos: { label: 'Defeitos', field: { type: 'selectmulti', size: 'small', options: BOBINE_DEFEITOS }, span: 20 }
    },
    //Estados
    { festados: { label: 'Estados', field: { type: 'selectmulti', size: 'small', options: BOBINE_ESTADOS } } },
    { fofabrico: { label: "Ordem de Fabrico", field: { type: 'input', size: 'small' } } },
    { fcliente: { label: "Cliente", field: { type: 'input', size: 'small' } } },
    { fdestino: { label: "Destino", field: { type: 'input', size: 'small' } } } */
];


const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    }
});

const TitleForm = ({ data, onChange, form }) => {
    //const st = (parseInt(data?.type) === -1 || !data?.ofs) ? null : JSON.stringify(data?.ofs).replaceAll(/[\[\]\"]/gm, "").replaceAll(",", " | ");
    return (<ToolbarTitle title={<>
        <Col xs='content' style={{}}><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>Matérias Primas Alternativas</span></Col>
        {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
    </>} right={
        <Col xs="content">
        </Col>
    } />);
}


const fetchMateriasPrimas = async ({ value, type, signal }) => {
    let v = `%${value.replaceAll('%%', ' ').replaceAll('%', '').replaceAll(' ', '%%')}%`;
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimaslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_artigo"]: v }, parameters: { type }, signal });
    return rows;
}

const fetchMateriasPrimasGroups = async ({ value, groups, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/listmpgroupslookup/`, pagination: { limit: 10 }, filter: { group: getFilterValue(value, 'any') }, signal });
    if (!groups || groups.length===0){
        return rows;
    }else{
        const r = [...rows];
        groups.forEach(el => {if (!r.some(v=>v.group===el)){r.push({group:el});}});
        return r;
    }
}

const focus = (el, h,) => { el?.focus(); };
const FieldGroupEditor = ({ p, dataAPI }) => {
    const [value, setValue] = useState(p.row.group);
    const onChange = (v) => {
        setValue(v);
    };
    const onBlur = () => {
        if (p.row.group !== value) {
            p.onRowChange({ ...p.row, group: value, valid: 0 }, true);
        }
    }
    const onSelect = (v) => {
        if (p.row.group !== v) {
            p.onRowChange({ ...p.row, group: v, valid: 0 }, true);
        }
    };
    return (
        <AutoCompleteField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={value} ref={focus} onSelect={onSelect} onChange={onChange} onBlur={onBlur} size="small"
            keyField="group"
            textField="group"
            showSearch
            showArrow
            allowClear
            fetchOptions={async (value) => await fetchMateriasPrimasGroups({ value, groups: dataAPI.getData().rows.filter(v => v.valid == 0).map(v => v.group) })}
        />
    );
}

const InputNumberEditor = ({ field, p, ...props }) => {
    return <InputNumber style={{ width: "100%", padding: "3px" }} keyboard={false} controls={false} bordered={true} size="small" value={p.row[field]} ref={focus} onChange={(e) => p.onRowChange({ ...p.row, valid: p.row[field] !== e ? 0 : null, [field]: e }, true)} {...props} />
}

export default (props) => {
    const submitting = useSubmitting(true);
    const permission = usePermission({ allowed: { planeamento: 300 } });
    const [allowEdit, setAllowEdit] = useState({ datagrid: false });
    const [modeEdit, setModeEdit] = useState({ datagrid: false });
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "listmpalt", payload: { url: `${API_URL}/listmpalternativas/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 25 }, filter: {}, sort: [] } });
    const primaryKeys = ['ROWID'];
    const [modalParameters, setModalParameters] = useState({});
    const [showPrintModal, hidePrintModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal title={modalParameters.title} footer="none" onCancel={hidePrintModal} width={500} height={280}><FormPrint v={{ ...modalParameters }} /></ResponsiveModal>
    ), [modalParameters]);
    const columns = [
        //{ key: 'print', frozen: true, name: '', cellClass: classes.noOutline, minWidth: 50, width: 50, sortable: false, resizable: false, formatter: p => <ColumnPrint record={p.row} dataAPI={dataAPI} onClick={()=>onPrint(p.row)}/>  },
        { key: 'ITMREF_0', name: 'Artigo Cód.', width: 250 },
        { key: 'ITMDES1_0', name: 'Artigo Designação' },
        { key: 'group', name: 'Grupo', width: 100, ...((modeEdit.datagrid && allowEdit.datagrid) && { editor: (p, r) => <FieldGroupEditor p={p} dataAPI={dataAPI} /> }), editorOptions: { editOnClick: true } },
        { key: 'max_in', width: 140, name: 'Qtd. Abastecimento', ...((modeEdit.datagrid && allowEdit.datagrid) && { editor: p => <InputNumber addonAfter="kg" style={{ width: "100%" }} bordered={false} size="small" value={p.row.max_in} ref={focus} onChange={(e) => p.onRowChange({ ...p.row, valid: p.row.max_in !== e ? 0 : null, max_in: e === null ? 0 : e }, true)} min={0} /> }), editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{p.row?.max_in ? `${parseFloat(p.row?.max_in).toFixed(2)} kg` : ''}</div> }
    ];


    const editable = (row) => {
        return (modeEdit.datagrid && allowEdit.datagrid && row?.valid===1);
    }
    const editableClass = (row)=>{
        return (modeEdit.datagrid && row?.valid===1) && classes.edit;
    }

    const loadData = ({ signal } = {}) => {
        const { ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter())]);
        formFilter.setFieldsValue({ ...initFilters });
        dataAPI.addFilters(initFilters, true, true);
        dataAPI.fetchPost({ signal });

        setAllowEdit({ datagrid: permission.allow() });
        setModeEdit({ datagrid: false });
        submitting.end();
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());

    }, [location?.state?.type, location?.state?.loc]);

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                if (dataAPI.getData().rows.some(v => v?.valid === 0) === true) {
                    Modal.confirm({ title: <div>Deseja aplicar o filtro?</div>, content: <div>Se continuar, as alterações por gravar serão perdidas!</div>, onOk: () => applyFilters(type, values) });
                } else {
                    applyFilters(type, values);
                }
                break;
        }
    };
    const applyFilters = (type, values) => {
        //remove empty values
        const { ...vals } = Object.fromEntries(Object.entries({ ...dataAPI.getAllFilter(), ...values }).filter(([_, v]) => v !== null && v !== ''));
        const _values = {
            ...vals,
            fmulti_artigo: getFilterValue(vals?.fmulti_artigo, 'any'),
            fgroup: getFilterValue(vals?.fgroup, 'any')
        };
        dataAPI.addFilters(_values);
        dataAPI.first();
        dataAPI.fetchPost();
    }

    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            dataAPI.addFilters({type:changedValues.type}, false, true);
            dataAPI.fetchPost();
        } else if ("loc" in changedValues) {
            dataAPI.addFilters({loc:changedValues.loc}, false, true);
            dataAPI.fetchPost();
        } */


        /* if ("typelist" in changedValues) {
            navigate("/app/bobinagens/reellings", { state: { ...formFilter.getFieldsValue(true), typelist: changedValues.typelist, tstamp: Date.now() }, replace: true });
        } else if ("type" in changedValues) {
            navigate("/app/bobinagens/reellings", { state: { ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } else if ("valid" in changedValues) {
            navigate("/app/bobinagens/reellings", { state: { ...formFilter.getFieldsValue(true), valid: changedValues.valid, tstamp: Date.now() }, replace: true });
        } */
    };

    const changeMode = () => {
        if (allowEdit.datagrid) {
            setModeEdit({ datagrid: (modeEdit.datagrid) ? false : allowEdit.datagrid });
        }
    }

    const onSave = async () => {
        const rows = dataAPI.getData().rows.filter(v => v?.valid === 0).map(({ max_in, group, ITMREF_0 }) => ({ max_in, group, artigo_cod: ITMREF_0 }));
        if (rows.length > 0 && allowEdit.datagrid) {
            submitting.trigger();
            try {

                let response = await fetchPost({ url: `${API_URL}/savempalternativas/`, parameters: { rows } });
                if (response.data.status !== "error") {
                    loadData();
                } else {
                    Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
                }

            } catch (e) {
                console.log(e)
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            } finally {
                submitting.end();
            };
        }
    }

    return (
        <>
            <TitleForm data={dataAPI.getFilter(true)} onChange={onFilterChange} form={formFilter} />
            <Table
                loading={submitting.state}
                reportTitle="Matérias Primas Alternativas"
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                //actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                toolbar={true}
                search={true}
                moreFilters={false}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={true}
                rowClass={(row) => (row?.valid === 0 ? classes.notValid : undefined)}
                //rowHeight={formFilter.getFieldValue('typelist') === "C" ? 44 : 28}
                //rowClass={(row) => (row?.status === 0 ? classes.notValid : undefined)}
                //selectedRows={selectedRows}
                //onSelectedRowsChange={setSelectedRows}
                leftToolbar={<>
                    <Space>
                        {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                        {modeEdit.datagrid && <Button type="primary" disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={onSave}>Guardar Registos</Button>}
                        {!modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
                    </Space>
                    {/* <Button type='primary' icon={<AppstoreAddOutlined />} onClick={(showNewLoteModal)}>Novo Lote</Button> */}
                </>}
                toolbarFilters={{
                    form: formFilter, schema, wrapFormItem: true,
                    onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    //moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 350, mask: true }
                }}
            />
        </>
    );
}