import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import moment from 'moment';
import { useImmer } from 'use-immer';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, DOSERS } from "config";
import { useDataAPI } from "utils/useDataAPI";
//import { WrapperForm, TitleForm, FormLayout, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Drawer, Checkbox } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { json } from "utils/object";
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, SettingOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, BOBINE_ESTADOS, BOBINE_DEFEITOS } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, SwitchField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { TbCircles } from "react-icons/tb";
import { GoArrowUp } from 'react-icons/go';
import { ImArrowLeft } from 'react-icons/im';
// import Palete from './Palete';
// import FormCreatePalete from './FormCreatePalete';
import { MediaContext } from "../App";
import OF from '../commons/OF';
import { Status, toolbarFilters, postProcess, processFilters, saveBobinesDefeitos, saveTrocaEtiqueta } from "./commons";
import { DateTimeEditor, InputNumberEditor, ModalObsEditor, SelectDebounceEditor, ModalRangeEditor, useEditorStyles, DestinoEditor, ItemsField, MultiLine, CheckColumn, FieldEstadoEditor, FieldDefeitosEditor, FieldDefeitos, SwitchEditor } from 'components/tableEditors';
import Palete from '../paletes/Palete';
import Bobine from './Bobine';
import BobinesTasks from './BobinesTasks';


const focus = (el, h,) => { el?.focus(); };
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const title = "Bobines";
const TitleForm = ({ data, onChange }) => {

    useEffect(() => { }, [data?.type]);

    // const st = JSON.stringify(record.ofs)?.replaceAll(/[\[\]\"]/gm, "")?.replaceAll(",", " | ");
    return (<ToolbarTitle /* history={level === 0 ? [] : ['Registo Nonwovens - Entrada em Linha']} */ title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }}>
                <Col xs='content' style={{}}><Row nogutter><Col><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title}</span></Col></Row></Col>
                {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
            </Row>

        </Col>
    </>
    }
        right={<Col xs="content" style={{ padding: "5px" }}>
            <SelectField value={data?.type} onChange={(v) => onChange(v, "type")} size="small" keyField="value" textField="label"
                data={[{ value: "A", label: "Propriedades" }, { value: "B", label: "Defeitos" }, { value: "C", label: "Dados de Expedição" }]} />
        </Col>
        }
    />);
}
const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'>
            <Field name="flote" label={{ enabled: true, text: "Bobine", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs="content">
            <Field name="fpalete" label={{ enabled: true, text: "Palete", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col width={150}>
            <Field name="festados" label={{ enabled: true, text: "Estados", pos: "top", padding: "0px" }}>
                <SelectMultiField size="small" keyField='value' textField='value' data={BOBINE_ESTADOS} />
            </Field>
        </Col>
    </>
    );
}

const useStyles = createUseStyles({
    hasObs: {
        backgroundColor: "#fffb8f"
    },
    diffAbove: {
        backgroundColor: "#ffa39e"
    },
    diffBellow: {
        backgroundColor: "#fffb8f"
    },
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    },
    closed: {
        background: "#d9f7be"
    },
    edit: {
        position: "relative",
        '&:before': {
            /* we need this to create the pseudo-element */
            content: "''",
            display: "block",
            /* position the triangle in the top right corner */
            position: "absolute",
            zIndex: "0",
            top: "0",
            right: "0",
            /* create the triangle */
            width: "0",
            height: "0",
            border: ".3em solid transparent",
            borderTopColor: "#66afe9",
            borderRightColor: "#66afe9"

        }
    }
});
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    { flote: { label: "Bobine", field: { type: 'input', size: 'small' } } },
    { fpalete: { label: "Palete", field: { type: 'input', size: 'small' } } },
    { flargura: { label: "Largura", field: { type: 'input', size: 'small' }, span: 4 }, fcore: { label: "Core", field: { type: 'input', size: 'small' }, span: 4 } },
    { festados: { label: 'Estados', field: { type: 'selectmulti', size: 'small', options: BOBINE_ESTADOS }, span: 10 } },
    { fartigo: { label: "Artigo Cod.", field: { type: 'input', size: 'small' }, span:12 },fartigodes: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span:12 } },
    { fdata: { label: "Data", field: { type: "rangedate", size: 'small' } } },
    {
        farea: { label: "Área", field: { type: 'input', size: 'small' }, span: 4 },
        fcomp: { label: "Comprimento", field: { type: 'input', size: 'small' }, span: 5 },
    },
    { fof: { label: "Ordem Fabrico Original", field: { type: 'input', size: 'small' }, span: 12 }, fpof: { label: "Ordem Fabrico Palete", field: { type: 'input', size: 'small' }, span: 12 } },
    { ftiponwinf: { label: "Nonwoven Artigo Inf.", field: { type: 'input', size: 'small' }, span: 12 }, flotenwinf: { label: "Lote Nonwoven Inf.", field: { type: 'input', size: 'small' }, span: 12 } },
    { ftiponwsup: { label: "Nonwoven Artigo Sup.", field: { type: 'input', size: 'small' }, span: 12 }, flotenwsup: { label: "Lote Nonwoven Sup.", field: { type: 'input', size: 'small' }, span: 12 } },
    {
        freldefeitos: { label: " ", field: TipoRelation, span: 4 },
        fdefeitos: { label: 'Defeitos', field: { type: 'selectmulti', size: 'small', options: BOBINE_DEFEITOS }, span: 20 }
    },
    { fprf: { label: "PRF", field: { type: 'input', size: 'small' }, span: 12 }, forder: { label: "Encomenda", field: { type: 'input', size: 'small' }, span: 12 } },
    {
        fdispatched: { label: 'Expedido', field: { type: 'select', size: 'small', options: [{ value: "ALL", label: " " }, { value: "!isnull", label: "Sim" }, { value: "isnull", label: "Não" }] }, span: 6 },
        fcarga: { label: 'Carga', field: { type: 'select', size: 'small', options: [{ value: "ALL", label: " " }, { value: "!isnull", label: "Sim" }, { value: "isnull", label: "Não" }] }, span: 6 },
        feec: { label: 'EEC', field: { type: 'input', size: 'small' }, span: 4 },
        fano: { label: "Ano Exp.", field: { type: 'input', size: 'small' }, span: 4 },
        fmes: { label: "Mês Exp.", field: { type: 'input', size: 'small' }, span: 4 }
    },
    { fcarganome: { label: "Carga Designação", field: { type: 'input', size: 'small' } } },
    { fsdh: { label: "Expedição", field: { type: 'input', size: 'small' }, span: 12 }, fclienteexp: { label: "Expedição Cliente", field: { type: 'input', size: 'small' }, span: 12 } },
    { fartigoexp: { label: "Artigo Expedição", field: { type: 'input', size: 'small' }, span: 8 }, fmatricula: { label: "Matrícula", field: { type: 'input', size: 'small' }, span: 8 }, fmatricula_reboque: { label: "Mat.Reboque", field: { type: 'input', size: 'small' }, span: 8 } },
    { fdestino: { label: "Destino", field: { type: 'input', size: 'small' } } },
    { fdestino_lar: { label: "Destino Largura", field: { type: 'input', size: 'small' }, span: 8 }, fdestino_estado: { label: "Destino Estado", field: { type: 'input', size: 'small' }, span: 8 }, fdestino_reg: { label: " Destino Regranular", field: { type: 'input', size: 'small' }, span: 8 } },
    { fdestinoold: { label: "Destino (Legacy)", field: { type: 'input', size: 'small' } } },
    { fartigo_mp: { label: "Artigo Granulado (MP)", field: { type: 'input', size: 'small' }, span: 12 }, flote_mp: { label: "Lote Granulado (MP)", field: { type: 'input', size: 'small' }, span: 12 } },



    // { fqty: { label: "Quantidade Lote", field: { type: 'input', size: 'small' }, span: 12 } },
    // { fqty_reminder: { label: "Quantidade Restante", field: { type: 'input', size: 'small' }, span: 12 } },
    // { ftype_mov: { label: 'Movimento', field: { type: 'select', size: 'small', options: [{ value: 0, label: "Saída" }, { value: 1, label: "Entrada" }] }, span: 6 } },
];



const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [
        // ...(modeEdit && props.row?.closed === 0 && props.row?.valid !== 0) ? [{ label: <span style={{}}>Fechar movimento</span>, key: 'close', icon: <CheckCircleOutlined style={{ fontSize: "16px" }} /> }, { type: 'divider' }] : [],
        // ...(modeEdit && props.row?.closed === 0 && props.row?.valid !== 0 && props.row?.type_mov == 1) ? [{ label: <span style={{}}>Saída de Linha</span>, key: 'out', icon: <ImArrowLeft size={16} style={{ verticalAlign: "text-top" }} /> }, { type: 'divider' }] : [],
        // (modeEdit && props.row?.closed === 0 && props.row?.valid !== 0) && { label: <span style={{ fontWeight: 700 }}>Eliminar Registo</span>, key: 'delete', icon: <DeleteFilled style={{ fontSize: "16px", color: "red" }} /> }
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}


export const ModalViewer = ({ p, title, width = "90%", type = "drawer", push = false, height, footer = "ref", yScroll = true, children }) => {
    const [visible, setVisible] = useState(true);

    const onCancel = () => {
        p.onClose();
        setVisible(false);
    };

    return (
        <ResponsiveModal title={title} type={type} push={push} onCancel={onCancel} width={width} height={height} footer={footer} yScroll={yScroll}>
            {children}
        </ResponsiveModal>
    );
};


const modoExpedicao = (v) => {
    switch (v) {
        case "1": return "CONTAINER";
        case "3": return "TRUCK";
        case "4": return "AIR";
        default: return "";
    }
}

const applyToAllRows = (rows, col, currentIndex, added, removed) => {
    return rows.map((v, i) => {
        if (i !== currentIndex) {
            let _d = v[col] || [];
            _d = _d.filter(a => !removed?.map(b => b.value).includes(a.value));
            _d = [..._d, ...added.filter(a => !_d?.map(b => b.value).includes(a.value))];
            return { ...v, [col]: _d, notValid: 1 };
        }
        return v;
    });
}
const applyRangeToAllRows = (rows, col, currentIndex, added, removed) => {
    return rows.map((v, i) => {
        if (i !== currentIndex) {
            let _d = v[col] || [];
            _d = _d.filter(a => !removed?.map(({ min, max }) => ({ min, max })).some(v => v.min === a.min && v.max === a.max));
            _d = [..._d, ...added.filter(a => !_d?.map(({ min, max }) => ({ min, max })).some(v => v.min === a.min && v.max === a.max))];
            return { ...v, [col]: _d, notValid: 1 };
        }
        return v;
    });
}
const applyValueToAllRows = (rows, col, currentIndex, value) => {
    return rows.map((v, i) => {
        if (i !== currentIndex) {
            return { ...v, [col]: value, notValid: 1 };
        }
        return v;
    });
}

export default ({ setFormTitle, noid=false, ...props }) => {
    const media = useContext(MediaContext);
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({});
    const [modeEdit, setModeEdit] = useState({ datagrid: false });
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const [parameters, setParameters] = useState();
    const defaultFilters = {};
    const defaultParameters = { method: "BobinesList" };
    const defaultSort = [{ column: "timestamp", direction: "DESC" }];
    const dataAPI = useDataAPI({ ...(!noid && {id: "lst-bobines"}), fnPostProcess: (dt) => postProcess(dt, submitting), payload: { url: `${API_URL}/bobines/sql/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: [] } });
    const submitting = useSubmitting(true);
    const [lastTabPalete, setLastTabPalete] = useState('1');
    const [lastTabBobine, setLastTabBobine] = useState('1');
    const [checkData, setCheckData] = useImmer({ destino: false });

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "palete": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTabPalete} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
                case "bobine": return <Bobine tab={modalParameters.tab} setTab={modalParameters.setLastTabBobine} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
                case "tasks": return <BobinesTasks loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
                //     case "details": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
                //     case "createpalete": return <FormCreatePalete loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    const primaryKeys = ['id'];

    const editable = (row, col) => {
        if (modeEdit.datagrid && permission.isOk({ action: "changeDefeitos" }) && !row?.carga_id && !row?.SDHNUM_0 && row?.palete_nome?.startsWith('D')) {
            if (col === "generic") { return true };
        }
        if (modeEdit.datagrid && permission.isOk({ action: "trocaEtiquetas" }) && !row?.carga_id && !row?.SDHNUM_0 && row?.palete_nome?.startsWith('D')) {
            if (col === "trocaEtiquetas") { return true; }
        }
        if (modeEdit.datagrid && permission.isOk({ action: "changeDestinos" }) && !row?.carga_id && !row?.SDHNUM_0 && row?.palete_nome?.startsWith('D')) {
            if (col === "destino") { return true };
        }
        return false;
    }
    const editableClass = (row, col) => {
        if (modeEdit.datagrid && permission.isOk({ action: "changeDefeitos" }) && !row?.carga_id && !row?.SDHNUM_0 && row?.palete_nome?.startsWith('D')) {
            if (col === "generic") { return classes.edit };
        }
        if (modeEdit.datagrid && permission.isOk({ action: "changeDestinos" }) && !row?.carga_id && !row?.SDHNUM_0 && row?.palete_nome?.startsWith('D')) {
            if (col === "destino") { return classes.edit };
        }
        if (modeEdit.datagrid && permission.isOk({ action: "trocaEtiquetas" }) && !row?.carga_id && !row?.SDHNUM_0 && row?.palete_nome?.startsWith('D')) {
            if (col === "trocaEtiquetas") { return classes.edit };
        }
        if (col === "destino" && row?.destinos_has_obs > 0) {
            return classes.hasObs;
        }
        return undefined;
    }

    const onCheckChange = (key, value) => { setCheckData(draft => { draft[key] = value.target.checked; }); }

    const onPaleteClick = (row) => {
        setModalParameters({ content: "palete", type: "drawer", push: false, width: "90%", parameters: { palete: { id: row.palete_id, nome: row.palete_nome }, palete_id: row.palete_id, palete_nome: row.palete_nome } });
        showModal();
    }

    const onBobineClick = (row) => {
        setModalParameters({ content: "bobine", type: "drawer", push: false, width: "90%", parameters: { bobine: { id: row.id, nome: row.nome }, bobine_id: row.id, bobine_nome: row.nome } });
        showModal();
    }

    const onClickRetrabalho = (row) => {
        setModalParameters({ content: "retrabalho", type: "drawer", push: false, width: "90%", parameters: { bobine: { id: row.id, nome: row.nome }, bobine_id: row.id, bobine_nome: row.nome } });
        showModal();
    }

    const onClickTasks = (row) => {
        setModalParameters({ content: "tasks", type: "drawer", push: false, width: "90%", parameters: { bobine: { id: row.id, nome: row.nome, artigo_cod: row.artigo_cod }, bobine_id: row.id, bobine_nome: row.nome, artigo_cod: row.artigo_cod } });
        showModal();
    }

    const columns = [
        { key: 'nome', name: 'Lote', frozen: true, width: 135, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.nome}</Button> },
        ...dataAPI.getAllFilter()?.type !== "C" ? [{
            key: 'baction', name: '', minWidth: 40, maxWidth: 40, frozen: true, formatter: p => <Button icon={<SettingOutlined />} size="small" onClick={() => onClickTasks(p.row)} />,
        }] : [],
        { key: 'timestamp', width: 130, name: 'Data', formatter: p => moment(p.row.timestamp).format(DATETIME_FORMAT) },
        {
            key: 'estado', sortable: false, name: 'Estado', minWidth: 85, width: 85, name: 'Estado',
            editor: p => <FieldEstadoEditor forInput={editable(p.row, 'generic')} p={p} />,
            formatter: (p) => <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status b={{ lar: p.row.lar, estado: p.row.estado }} larguraColumn="lar" /></div>,
            editorOptions: { editOnClick: true },
            cellClass: r => editableClass(r, 'generic')
        },
        ...dataAPI.getAllFilter()?.type === "A" ? [
            { key: 'area', name: 'Área', reportFormat: '0.00', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.area} m&sup2;</div> },
            { key: 'comp_actual', name: 'Comp.', reportFormat: '0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_actual} m</div> },
            { key: 'metros_cons', name: 'Metros Cons.', reportFormat: '0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.metros_cons} m</div> },
            { key: 'lar', name: 'Largura', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.lar} mm</div> },
            { key: 'diam', name: 'Diâmetro', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam} mm</div> },
            { key: 'core', name: 'Core', width: 60, formatter: p => <div style={{ textAlign: "right" }}>{p.row.core}''</div> }
        ] : [],

        ...dataAPI.getAllFilter()?.type === "C" ? [
            { key: 'area', name: 'Área', reportFormat: '0.00', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.area} m&sup2;</div> },
            { key: 'comp_actual', name: 'Comp.', reportFormat: '0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_actual} m</div> },
            { key: 'metros_cons', name: 'Metros Cons.', reportFormat: '0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.metros_cons} m</div> },
            { key: 'lar', name: 'Largura', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.lar} mm</div> },
            { key: 'diam', name: 'Diâmetro', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam} mm</div> },
            { key: 'core', name: 'Core', width: 60, formatter: p => <div style={{ textAlign: "right" }}>{p.row.core}''</div> }
        ] : [],


        { key: 'palete_nome', name: 'Palete', width: 130, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onPaleteClick(p.row)}>{p.row.palete_nome}</Button> },
        {
            key: 'destino', name: 'Destino', width: 200,
            editor: p => <DestinoEditor forInput={editable(p.row, 'destino')} forInputTroca={editable(p.row, 'trocaEtiquetas')} p={p} column="destino" onConfirm={onDestinoConfirm}/* onChange={() => { console.log("changedddddddd") }} */ />,
            cellClass: r => editableClass(r, 'destino'),
            editable: true,
            editorOptions: { editOnClick: true, commitOnOutsideClick: false },
            formatter: p => p.row.destino
        },
        ...(dataAPI.getAllFilter()?.type === "A" || dataAPI.getAllFilter()?.type === "C") ? [
            { key: 'ofid', name: 'OF Original', width: 130, formatter: p => <OF id={p.row.ordem_id} ofid={p.row.ofid} /> },
            { key: 'palete_ofid', name: 'OF Palete', width: 130, formatter: p => <OF id={p.row.palete_ordem_id} ofid={p.row.palete_ofid} /> },
            { key: 'tiponwinf', name: 'NW Inf.', width: 150, formatter: p => p.row.tiponwinf },
            { key: 'lotenwinf', name: 'Lote NW Inf.', width: 130, formatter: p => p.row.lotenwinf },
            { key: 'nwinf', name: 'NW Inf. Metros', reportFormat: '0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.nwinf} m</div> },
            { key: 'tiponwsup', name: 'NW Sup.', width: 150, formatter: p => p.row.tiponwsup },
            { key: 'lotenwsup', name: 'Lote NW Sup.', width: 130, formatter: p => p.row.lotenwsup },
            { key: 'nwsup', name: 'NW Sup. Metros', reportFormat: '0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.nwsup} m</div> }
        ] : [],
        ...(dataAPI.getAllFilter()?.type === "C") ? [
            { key: 'prf', name: 'PRF', width: 130, formatter: p => p.row.prf },
            { key: 'iorder', name: 'Encomenda', width: 130, formatter: p => p.row.iorder },
            { key: 'data_encomenda', width: 130, name: 'Data Encomenda', formatter: p => p.row.data_encomenda && moment(p.row.data_encomenda).format(DATETIME_FORMAT) },
            { key: 'item', name: 'Cod. Artigo', width: 130, formatter: p => p.row.item },
            { key: 'ofid_original', name: 'Ordem F. Origem', width: 130, formatter: p => <OF id={p.row.id} ofid={p.row.ofid_original} /> },
            { key: 'stock_loc', name: 'Loc.', width: 30, formatter: p => p.row.stock_loc },
            { key: 'stock_qtypcu', name: 'Qtd. Stock', reportFormat: '0.00', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.stock_qtypcu} {p.row.stock_qtypcu && <>m&sup2;</>}</div> },
            { key: 'VCRNUMORI_0', name: 'Doc.', width: 130, formatter: p => p.row.VCRNUMORI_0 },
            { key: 'SDHNUM_0', name: 'Expedição', width: 130, formatter: p => p.row.SDHNUM_0 },
            { key: 'BPCNAM_0', name: 'Expedição Cliente', width: 200, formatter: p => p.row.BPCNAM_0 },
            { key: 'EECICT_0', name: 'EEC', width: 60, formatter: p => p.row.EECICT_0 },
            { key: 'modo_exp', name: 'Modo Expedição', reportFormat: '0', width: 90, formatter: p => modoExpedicao(p.row.modo_exp) },
            { key: 'matricula', name: 'Matrícula', width: 60, formatter: p => p.row.matricula },
            { key: 'matricula_reboque', name: 'Matrícula Reboque', width: 60, formatter: p => p.row.matricula_reboque },
            { key: 'mes', name: 'Mês', reportFormat: '0', width: 60, formatter: p => p.row.mes },
            { key: 'ano', name: 'Ano', reportFormat: '0', width: 60, formatter: p => p.row.ano }
        ] : [],

        ...dataAPI.getAllFilter()?.type === "B" ? [
            {
                key: 'fc_pos', sortable: false, width: 85,
                headerRenderer: p => <CheckColumn id="fc_pos" name="Falha Corte" onChange={onCheckChange} defaultChecked={checkData?.fc_pos} forInput={editable(p.row, 'generic')} />,
                formatter: ({ row }) => <ItemsField row={row} column="fc_pos" />,
                editor(p) { return <ModalRangeEditor type="fc" unit='mm' p={p} column="fc_pos" title="Falha de Corte" forInput={editable(p.row, 'generic')} valid={1} /> },
                editorOptions: { editOnClick: true },
                cellClass: r => editableClass(r, 'generic')
            },
            {
                key: 'ff_pos', sortable: false, width: 85,
                headerRenderer: p => <CheckColumn id="ff_pos" name="Falha de Filme" onChange={onCheckChange} defaultChecked={checkData?.ff_pos} forInput={editable(p.row, 'generic')} />,
                formatter: ({ row }) => <ItemsField row={row} column="ff_pos" />,
                editor(p) { return <ModalRangeEditor type="ff" p={p} column="ff_pos" title="Falha de Filme" forInput={editable(p.row, 'generic')} valid={1} /> },
                editorOptions: { editOnClick: true },
                cellClass: r => editableClass(r, 'generic')
            },
            {
                key: 'buracos_pos', sortable: false, width: 85,
                headerRenderer: p => <CheckColumn id="buracos_pos" name="Buracos" onChange={onCheckChange} defaultChecked={checkData?.buracos} forInput={editable(p.row, 'generic')} />,
                formatter: ({ row }) => <ItemsField row={row} column="buracos_pos" />,
                editor(p) { return <ModalRangeEditor type="buracos" p={p} column="buracos_pos" title="Buracos" forInput={editable(p.row, 'generic')} valid={1} /> },
                editorOptions: { editOnClick: true },
                cellClass: r => editableClass(r, 'generic')
            },
            {
                key: 'furos_pos', sortable: false, width: 85,
                headerRenderer: p => <CheckColumn id="furos_pos" name="Furos" onChange={onCheckChange} defaultChecked={checkData?.furos_pos} forInput={editable(p.row, 'generic')} />,
                formatter: ({ row }) => <ItemsField row={row} column="furos_pos" />,
                editor(p) { return <ModalRangeEditor p={p} type="furos" column="furos_pos" title="Furos" forInput={editable(p.row, 'generic')} valid={1} /> },
                editorOptions: { editOnClick: true },
                cellClass: r => editableClass(r, 'generic')
            },
            {
                key: 'rugas_pos', sortable: false, width: 85,
                headerRenderer: p => <CheckColumn id="rugas_pos" name="Rugas" onChange={onCheckChange} defaultChecked={checkData?.rugas_pos} forInput={editable(p.row, 'generic')} />,
                formatter: ({ row }) => <ItemsField row={row} column="rugas_pos" />,
                editor(p) { return <ModalRangeEditor type="rugas" p={p} column="rugas_pos" title="Rugas" forInput={editable(p.row, 'generic')} valid={1} /> },
                editorOptions: { editOnClick: true },
                cellClass: r => editableClass(r, 'generic')
            },
            { key: 'comp', sortable: false, name: "Comprimento", width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp} m</div> },
            {
                key: 'defeitos', sortable: false,
                headerRenderer: p => <CheckColumn id="defeitos" name="Outros Defeitos" onChange={onCheckChange} defaultChecked={checkData?.defeitos} forInput={editable(p.row, 'generic')} />,
                editor: p => <FieldDefeitosEditor p={p} />, editorOptions: { editOnClick: true },
                width: 250, formatter: (p) => <FieldDefeitos p={p} />,
                cellClass: r => editableClass(r, 'generic'),
                editable: modeEdit.datagrid
            },
            {
                key: 'prop_obs', sortable: false,
                headerRenderer: p => <CheckColumn id="prop_obs" name="Propriedades Observações" onChange={onCheckChange} defaultChecked={checkData?.prop_obs} forInput={editable(p.row, 'generic')} />,
                formatter: ({ row, isCellSelected }) => <MultiLine value={row.prop_obs} isCellSelected={isCellSelected}><pre style={{ whiteSpace: "break-spaces" }}>{row.prop_obs}</pre></MultiLine>,
                editor(p) { return <ModalObsEditor forInput={editable(p.row, 'generic')} p={p} column="prop_obs" title="Propriedades Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> },
                cellClass: r => editableClass(r, 'generic'),
                editorOptions: { editOnClick: true }
            },
            {
                key: 'obs', sortable: false,
                headerRenderer: p => <CheckColumn id="obs" name="Observações" onChange={onCheckChange} defaultChecked={checkData?.obs} forInput={editable(p.row, 'generic')} />,
                formatter: ({ row, isCellSelected }) => <MultiLine value={row.obs} isCellSelected={isCellSelected}><pre style={{ whiteSpace: "break-spaces" }}>{row.obs}</pre></MultiLine>,
                editor: (p) => { return <ModalObsEditor forInput={editable(p.row, 'generic')} p={p} column="obs" title="Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> },
                cellClass: r => editableClass(r, 'generic'),
                editorOptions: { editOnClick: true },
            }
        ] : [],
    ];

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ init = false, signal, type } = {}) => {
        if (init) {
            const initFilters = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters?.filter, {}, null);
            let { filterValues, fieldValues } = fixRangeDates(['fdata'], initFilters);
            formFilter.setFieldsValue({ ...fieldValues });
            dataAPI.addFilters({ ...filterValues, ...!filterValues?.type && { type: "A" } }, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters(defaultParameters, true, true);
            dataAPI.fetchPost({ signal });
        } else {
            dataAPI.fetchPost({ signal });
        }
        submitting.end();
    }

    const onDestinoConfirm = async (p, destinos, destinoTxt, obs, prop_obs, troca_etiqueta) => {
        const ids = dataAPI.getData().rows.map(v => v.id);
        const rowsDestinos = (checkData?.destino) ? ids : [p.row.id];
        const rowsObs = (checkData?.obs) ? ids : [p.row.id];
        const rowsPropObs = (checkData?.prop_obs) ? ids : [p.row.id];
        const values = { destinos, destinoTxt, obs, prop_obs, troca_etiqueta };
        const palete_id = p.row.palete_id;

        try {
            let response = await fetchPost({
                url: `${API_URL}/paletes/paletessql/`, parameters: {
                    method: "UpdateDestinos", ids, rowsDestinos, rowsObs, rowsPropObs, values,
                    troca: permission.isOk({ action: "trocaEtiquetas" }),
                    destinos: permission.isOk({ action: "changeDestinos" })
                }, filter: { palete_id }
            });
            if (response.data.status !== "error") {
                p.onClose(true);
                loadData();
            } else {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        } finally { };
    }

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const vals = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
                const _values = {
                    ...vals,
                    // fartigo: getFilterValue(vals?.fartigo, 'any'),
                    flote: getFilterValue(vals?.flote, 'start'),
                    fbobine: getFilterValue(vals?.fbobine, 'start'),
                    fpalete: getFilterValue(vals?.fpalete, 'start'),
                    fof: getFilterValue(vals?.fof, 'start'),
                    fpof: getFilterValue(vals?.fpof, 'start'),
                    fdata: getFilterRangeValues(vals["fdata"]?.formatted),
                    flotenwinf: getFilterValue(vals?.flotenwinf, 'start'),
                    ftiponwinf: getFilterValue(vals?.ftiponwinf, 'start'),
                    flotenwsup: getFilterValue(vals?.flotenwsup, 'start'),
                    ftiponwsup: getFilterValue(vals?.ftiponwsup, 'start'),
                    fprf: getFilterValue(vals?.fprf, 'start'),
                    forder: getFilterValue(vals?.forder, 'start'),
                    fdispatched: (!vals?.fdispatched || vals?.fdispatched === 'ALL') ? null : vals.fdispatched,
                    fcarga: (!vals?.fcarga || vals?.fcarga === 'ALL') ? null : vals.fcarga,
                    fcarganome: getFilterValue(vals?.fcarganome, 'start'),
                    fdestinoold: getFilterValue(vals?.fdestinoold, 'start'),
                    fartigo_mp: getFilterValue(vals?.fartigo_mp, 'start'),
                    fdestino: getFilterValue(vals?.fdestino, 'start'),
                    flote_mp: getFilterValue(vals?.flote_mp, 'start'),
                    fmatricula: getFilterValue(vals?.fmatricula, 'start'),
                    fmatricula_reboque: getFilterValue(vals?.fmatricula_reboque, 'start'),
                    fsdh: getFilterValue(vals?.fsdh, 'start'),
                    fclienteexp: getFilterValue(vals?.fclienteexp, 'start'),
                    fartigoexp: getFilterValue(vals?.fartigoexp, 'start'),
                    fartigo: getFilterValue(vals?.fartigo, 'start'),
                    fartigodes: getFilterValue(vals?.fartigodes, 'start'),
                    // fvcr: getFilterValue(vals?.fvcr, 'any'),
                    // fdatain: getFilterRangeValues(vals["fdatain"]?.formatted),
                    // fdataout: getFilterRangeValues(vals["fdataout"]?.formatted)
                };
                dataAPI.addFilters(_values, true);
                dataAPI.addParameters(defaultParameters);
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onAction = (item, row) => {
        // switch (item.key) {
        //     case "delete": Modal.confirm({
        //         title: <div>Eliminar Movimento <b>{row.vcr_num}</b></div>, content: <ul>
        //             {row.type_mov === 1 && <li>Serão eliminados os movimentos de entrada e saída!</li>}
        //             <li style={{ fontWeight: 700 }}>Atenção!! Se tiver alterações por guardar, ao efetuar esta operação perderá todas as alterações.</li>
        //         </ul>, onOk: async () => {
        //             submitting.trigger();
        //             try {
        //                 let response = await fetchPost({ url: `${API_URL}/deletegranulado/`, filter: { vcr_num: row.vcr_num, type_mov: row.type_mov }, parameters: {} });
        //                 if (response.data.status !== "error") {
        //                     dataAPI.fetchPost();
        //                 } else {
        //                     Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
        //                 }
        //             } catch (e) {
        //                 Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        //             } finally {
        //                 submitting.end();
        //             };
        //         }
        //     });
        //         break;
        //     case "out":
        //         setModalParameters({ type: item.key, title: "Saída de lote em linha", loadData: () => dataAPI.fetchPost(), record: row });
        //         showModal();
        //         break;
        //     case "close":
        //         setModalParameters({ type: item.key, title: "Fechar movimento", loadData: () => dataAPI.fetchPost(), record: row, height: 300 });
        //         showModal();
        //         break;
        // }
    }
    const changeMode = () => {
        setModeEdit({ datagrid: (modeEdit.datagrid) ? false : true });
    }
    const onSave = async (action) => {
        await saveBobinesDefeitos(dataAPI.getData().rows, submitting, parameters, loadData);
    }
    const onSaveTrocaEtiqueta = async (r, v) => {
        await saveTrocaEtiqueta(r, v, submitting, parameters, loadData);
    }


    const onTitleChange = async (value, source) => {
        switch (source) {
            case "type":
                dataAPI.addFilters({ type: value }, false);
                await loadData({ init: true, type: value });
                //const vals = Object.fromEntries(Object.entries({ ...defaultFilters, ...formFilter.getFieldsValue(true) }).filter(([_, v]) => v !== null && v !== ''));
                //    const _values = { ...vals, type: value };
                //    dataAPI.addParameters({ ...defaultParameters, ...dataAPI.getParameters() });
                //    dataAPI.addFilters(_values, true);
                //    dataAPI.fetchPost();
                break;
        }
    }

    return (
        <>
            {!setFormTitle && <TitleForm data={dataAPI.getAllFilter()} onChange={onTitleChange} level={location?.state?.level} />}
            <Table
                loading={submitting.state}
                actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} modeEdit={modeEdit.datagrid} />}
                frozenActionColumn={true}
                reportTitle={title}
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                toolbar={true}
                search={true}
                moreFilters={true}
                maxPage={false}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={false}
                rowHeight={28}
                onPageChange={() => dataAPI.fetchPost()}
                rowClass={(row) => (row?.notValid === 1 ? classes.notValid : undefined)}
                leftToolbar={
                    <Space>
                        <Permissions permissions={permission} action="editList" {...dataAPI.getAllFilter()?.type === "C" && { forInput: false }}>
                            {!modeEdit.datagrid && <Button disabled={submitting.state} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
                            {modeEdit.datagrid && <Button disabled={submitting.state} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                            {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.notValid === 1).length > 0) && <Button type="primary" disabled={submitting.state} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                        </Permissions>

                    </Space>

                }
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 500, mask: true }
                }}
            />
        </>
    );
}