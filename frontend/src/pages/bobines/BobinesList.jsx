import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import moment from 'moment';
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
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Drawer } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { json } from "utils/object";
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, BOBINE_ESTADOS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { Status } from './commons';
import { TbCircles } from "react-icons/tb";
import { GoArrowUp } from 'react-icons/go';
import { ImArrowLeft } from 'react-icons/im';
// import Palete from './Palete';
// import FormCreatePalete from './FormCreatePalete';
import { MediaContext } from "../App";
import OF from '../commons/OF';
import { DestinoPaleteEditor } from 'components/tableEditors';
import Palete from '../paletes/Palete';
import Bobine from './Bobine';


const focus = (el, h,) => { el?.focus(); };
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const schemaOut = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const schemaOutDate = (options = {}) => {
    return getSchema({
        t_stamp_out: Joi.any().label("Data de Saída").required()
    }, options).unknown(true);
}
const schemaIn = (options = {}) => {
    return getSchema({
        artigo_cod: Joi.any().label("Artigo").required(),
        n_lote: Joi.any().label("Lote").required(),
        qty_lote: Joi.number().label("Quantidade do Lote").required(),
        t_stamp: Joi.any().label("Data de Entrada").required()
    }, options).unknown(true);
}
const title = "Bobines";
const TitleForm = ({ data, onChange, record, level, form }) => {
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
    { flargura: { label: "Largura", field: { type: 'input', size: 'small' }, span: 8 }, fcore: { label: "Core", field: { type: 'input', size: 'small' }, span: 4 } },
    { festados: { label: 'Estados', field: { type: 'selectmulti', size: 'small', options: BOBINE_ESTADOS }, span: 10 } },
    // { fartigo: { label: "Artigo", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data", field: { type: "rangedate", size: 'small' } } },
    {
        farea: { label: "Área", field: { type: 'input', size: 'small' }, span: 4 },
        fcomp: { label: "Comprimento", field: { type: 'input', size: 'small' }, span: 5 },
    },
    // { fof: { label: "Ordem Fabrico", field: { type: 'input', size: 'small' } } },
    // { fprf: { label: "PRF", field: { type: 'input', size: 'small' }, span: 12 }, forder: { label: "Encomenda", field: { type: 'input', size: 'small' }, span: 12 } },
    // {
    //     fdispatched: { label: 'Expedido', field: { type: 'select', size: 'small', options: [{ value: "ALL", label: " " }, { value: "!isnull", label: "Sim" }, { value: "isnull", label: "Não" }] }, span: 6 },
    //     fcarga: { label: 'Carga', field: { type: 'select', size: 'small', options: [{ value: "ALL", label: " " }, { value: "!isnull", label: "Sim" }, { value: "isnull", label: "Não" }] }, span: 6 },
    //     feec: { label: 'EEC', field: { type: 'input', size: 'small' }, span: 4 },
    //     fano: { label: "Ano Exp.", field: { type: 'input', size: 'small' }, span: 4 },
    //     fmes: { label: "Mês Exp.", field: { type: 'input', size: 'small' }, span: 4 }
    // },
    // { fcarganome: { label: "Carga Designação", field: { type: 'input', size: 'small' } } },
    // { fsdh: { label: "Expedição", field: { type: 'input', size: 'small' }, span: 12 }, fclienteexp: { label: "Expedição Cliente", field: { type: 'input', size: 'small' }, span: 12 } },
    // { fartigoexp: { label: "Artigo Expedição", field: { type: 'input', size: 'small' }, span: 8 }, fmatricula: { label: "Matrícula", field: { type: 'input', size: 'small' }, span: 8 }, fmatricula_reboque: { label: "Mat.Reboque", field: { type: 'input', size: 'small' }, span: 8 } },
    // { fdestino: { label: "Destino", field: { type: 'input', size: 'small' } } },
    // { fdestino_lar: { label: "Destino Largura", field: { type: 'input', size: 'small' }, span: 8 }, fdestino_estado: { label: "Destino Estado", field: { type: 'input', size: 'small' }, span: 8 }, fdestino_reg: { label: " Destino Regranular", field: { type: 'input', size: 'small' }, span: 8 } },
    // { fdestinoold: { label: "Destino (Legacy)", field: { type: 'input', size: 'small' } } },
    // { ftiponw: { label: "Nonwoven Artigo", field: { type: 'input', size: 'small' }, span: 12 }, flotenw: { label: "Lote Nonwoven", field: { type: 'input', size: 'small' }, span: 12 } },
    // { fartigo_mp: { label: "Artigo Granulado (MP)", field: { type: 'input', size: 'small' }, span: 12 }, flote_mp: { label: "Lote Granulado (MP)", field: { type: 'input', size: 'small' }, span: 12 } },



    // { fqty: { label: "Quantidade Lote", field: { type: 'input', size: 'small' }, span: 12 } },
    // { fqty_reminder: { label: "Quantidade Restante", field: { type: 'input', size: 'small' }, span: 12 } },
    // { ftype_mov: { label: 'Movimento', field: { type: 'select', size: 'small', options: [{ value: 0, label: "Saída" }, { value: 1, label: "Entrada" }] }, span: 6 } },
];
const OfsColumn = ({ value }) => {
    return (<div>
        {value && value.map(v => <Tag style={{ fontWeight: 600, fontSize: "10px" }} key={`${v}`}>{v}</Tag>)}
    </div>);
}
const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [
        ...(modeEdit && props.row?.closed === 0 && props.row?.valid !== 0) ? [{ label: <span style={{}}>Fechar movimento</span>, key: 'close', icon: <CheckCircleOutlined style={{ fontSize: "16px" }} /> }, { type: 'divider' }] : [],
        ...(modeEdit && props.row?.closed === 0 && props.row?.valid !== 0 && props.row?.type_mov == 1) ? [{ label: <span style={{}}>Saída de Linha</span>, key: 'out', icon: <ImArrowLeft size={16} style={{ verticalAlign: "text-top" }} /> }, { type: 'divider' }] : [],
        (modeEdit && props.row?.closed === 0 && props.row?.valid !== 0) && { label: <span style={{ fontWeight: 700 }}>Eliminar Registo</span>, key: 'delete', icon: <DeleteFilled style={{ fontSize: "16px", color: "red" }} /> }
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

export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({});
    const [modeEdit, setModeEdit] = useState({ datagrid: false });

    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = { method: "BobinesList" };
    const defaultSort = [{ column: "timestamp", direction: "DESC" }];
    const dataAPI = useDataAPI({ id: "lst-bobines", payload: { url: `${API_URL}/bobines/sql/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: [] } });
    const submitting = useSubmitting(true);
    const [lastTabPalete, setLastTabPalete] = useState('1');
    const [lastTabBobine, setLastTabBobine] = useState('1');

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "palete": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTabPalete} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
                case "bobine": return <Bobine tab={modalParameters.tab} setTab={modalParameters.setLastTabBobine} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
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
        if (modeEdit.datagrid && permission.isOk({ action: "changeDestino" }) && !row?.carga_id && !row?.SDHNUM_0) {
            return (col === "destino") ? true : false;
        }
        return false;
    }
    const editableClass = (row, col) => {
        if (col === "destino" && row.destinos_has_obs>0) {
            return classes.hasObs;
        }
    }

    // const formatterClass = (row, col) => {
    //     if (col === "type_mov" && row.closed === 1) {
    //         return classes.closed;
    //     }
    //     if (col === "diff" && row.diff !== 0) {
    //         let percent = (100 * row.diff) / row.avgdiff;
    //         if (percent >= 125) {
    //             return classes.diffAbove;
    //         }
    //         if (percent <= 75) {
    //             return classes.diffBellow;
    //         }
    //     }
    // }
    // const onLoteChange = (p, v) => {
    //     const r = { ...p.row, valid: p.row["vcr_num"] !== v.row["VCRNUM_0"] ? 0 : null, vcr_num: v.row["VCRNUM_0"], n_lote: v.row["LOT_0"], qty_lote: v.row["QTYPCU_0"] };
    //     if (!("vcr_num_original" in p.row)) {
    //         r["vcr_num_original"] = p.row["vcr_num"];
    //     }
    //     if (p.row.qty_lote === p.row.qty_reminder) {
    //         r["qty_reminder"] = v.row["QTYPCU_0"];
    //     }
    //     p.onRowChange(r, true);
    // }
    // const onQtyLoteChange = (p, v) => {
    //     const r = { ...p.row, valid: p.row["qty_lote"] !== v ? 0 : null, qty_lote: v };
    //     if (p.row.qty_lote <= p.row.qty_reminder || p.row.type_mov == 1) {
    //         r["qty_reminder"] = v;
    //     }
    //     p.onRowChange(r, true);
    // }
    // const onQtyReminderChange = (p, v) => {
    //     const r = { ...p.row, valid: p.row["qty_reminder"] !== v ? 0 : null, qty_reminder: v };
    //     if (p.row.qty_lote <= v || p.row.type_mov == 1) {
    //         r["qty_reminder"] = p.row.qty_lote;
    //     }
    //     p.onRowChange(r, true);
    // }

    const onPaleteClick = (row) => {
        setModalParameters({ content: "palete", type: "drawer", push: false, width: "90%", parameters: { palete: { id: row.palete_id, nome: row.palete_nome }, palete_id: row.palete_id, palete_nome: row.palete_nome } });
        showModal();
    }

    const onBobineClick = (row) => {
        setModalParameters({ content: "bobine", type: "drawer", push: false, width: "90%", parameters: { bobine: { id: row.id, nome: row.nome }, bobine_id: row.id, bobine_nome: row.nome } });
        showModal();
    }

    const columns = [
        { key: 'nome', name: 'Lote', frozen: true, width: 130, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.nome}</Button> },
        // {
        //     key: 'baction', name: '', minWidth: 40, maxWidth: 40, frozen: true, formatter: p => <Button icon={<TbCircles />} size="small" onClick={() => onClickDetails("all", p.row)} />,
        // },
        { key: 'timestamp', width: 130, name: 'Data', formatter: p => moment(p.row.timestamp).format(DATETIME_FORMAT) },
        { key: 'estado', name: 'Estado', width: 90, formatter: p => <Status b={{lar:p.row.lar,estado:p.row.estado}} larguraColumn="lar" /> },
        { key: 'area', name: 'Área',reportFormat:'0.00', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.area} m&sup2;</div> },
        { key: 'comp_actual', name: 'Comp.',reportFormat:'0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_actual} m</div> },
        { key: 'metros_cons', name: 'Metros Cons.',reportFormat:'0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.metros_cons} m</div> },
        { key: 'lar', name: 'Largura', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.lar} mm</div> },
        { key: 'diam', name: 'Diâmetro', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam} mm</div> },
        { key: 'core', name: 'Core', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.core}''</div> },
        { key: 'palete_nome', name: 'Palete', width: 130, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onPaleteClick(p.row)}>{p.row.palete_nome}</Button> },
        {
            key: 'destino', name: 'Destino', width: 200,
            editor: p => <DestinoPaleteEditor forInput={false} p={p} />,
            cellClass: r => editableClass(r, 'destino'),
            editable: true,
            editorOptions: { editOnClick: true },
            formatter: p => p.row.destino
        },







        // { key: 'nbobines_real', name: 'Bobines', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{String(p.row.nbobines_real).padStart(2, '0')}/{String(p.row.num_bobines).padStart(2, '0')}</div> },
        // { key: 'nbobines_emendas', name: 'Bobines C/Emendas',reportFormat:'0', width: 60, formatter: p => p.row.nbobines_emendas },
        // { key: 'area_real', name: 'Área',reportFormat:'0.00', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.area_real} m&sup2;</div> },
        // { key: 'comp_real', name: 'Comp.',reportFormat:'0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_real} m</div> },
        // { key: 'peso_bruto', name: 'Peso B.',reportFormat:'0.00', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.peso_bruto} kg</div> },
        // { key: 'peso_liquido', name: 'Peso .L',reportFormat:'0.00', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.peso_liquido} kg</div> },
        // { key: 'diam_min', name: 'Diam. Min.',reportFormat:'0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam_min} mm</div> },
        // { key: 'diam_max', name: 'Diam. Máx.',reportFormat:'0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam_max} mm</div> },
        // { key: 'diam_avg', name: 'Diam. Médio.',reportFormat:'0', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam_avg} mm</div> },
       
        // { key: 'cliente_nome', name: 'Cliente', width: 200, formatter: p => p.row.cliente_nome },
        // { key: 'ofid', name: 'Ordem Fabrico', width: 130, formatter: p => <OF id={p.row.id} ofid={p.row.ofid} of_des={p.row.ordem_original} /> },
        // { key: 'prf', name: 'PRF', width: 130, formatter: p => p.row.prf },
        // { key: 'iorder', name: 'Encomenda', width: 130, formatter: p => p.row.iorder },
        // { key: 'data_encomenda', width: 130, name: 'Data Encomenda', formatter: p => p.row.data_encomenda && moment(p.row.data_encomenda).format(DATETIME_FORMAT) },
        // { key: 'item', name: 'Cod. Artigo', width: 130, formatter: p => p.row.item },
        // { key: 'ofid_original', name: 'Ordem F. Origem', width: 130, formatter: p => <OF id={p.row.id} ofid={p.row.ofid_original} /> },
        // { key: 'stock_loc', name: 'Loc.', width: 30, formatter: p => p.row.stock_loc },
        // { key: 'stock_qtypcu', name: 'Qtd. Stock',reportFormat:'0.00', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.stock_qtypcu} {p.row.stock_qtypcu && <>m&sup2;</>}</div> },
        // { key: 'VCRNUMORI_0', name: 'Doc.', width: 130, formatter: p => p.row.VCRNUMORI_0 },
        // { key: 'SDHNUM_0', name: 'Expedição', width: 130, formatter: p => p.row.SDHNUM_0 },
        // { key: 'BPCNAM_0', name: 'Expedição Cliente', width: 200, formatter: p => p.row.BPCNAM_0 },
        // { key: 'EECICT_0', name: 'EEC', width: 60, formatter: p => p.row.EECICT_0 },
        // { key: 'modo_exp', name: 'Modo Expedição',reportFormat:'0', width: 90, formatter: p => modoExpedicao(p.row.modo_exp) },
        // { key: 'matricula', name: 'Matrícula', width: 60, formatter: p => p.row.matricula },
        // { key: 'matricula_reboque', name: 'Matrícula Reboque', width: 60, formatter: p => p.row.matricula_reboque },
        // { key: 'mes', name: 'Mês',reportFormat:'0', width: 60, formatter: p => p.row.mes },
        // { key: 'ano', name: 'Ano',reportFormat:'0', width: 60, formatter: p => p.row.ano },



        //{ key: 'print', frozen: true, name: '', cellClass: classes.noOutline, minWidth: 50, width: 50, sortable: false, resizable: false, formatter: p => <ColumnPrint record={p.row} dataAPI={dataAPI} onClick={() => onPrint(p.row)} /> },
        // { key: 'type_mov', width: 90, name: 'Movimento', frozen: true, cellClass: r => formatterClass(r, 'type_mov'), formatter: p => <MovGranuladoColumn value={p.row.type_mov} /> },
        // { key: "group_id", sortable: false, name: "Cuba", frozen: true, minWidth: 55, width: 55, formatter: p => <Cuba value={p.row.group_id} /> },
        // { key: 'dosers', width: 90, name: 'Doseadores', frozen: true, formatter: p => p.row.dosers },
        // { key: 'artigo_cod', name: 'Artigo', frozen: true, width: 200, formatter: p => p.row.artigo_cod },
        // { key: 't_stamp', width: 140, name: 'Data Mov.', editable: editable, cellClass: r => editableClass(r, 't_stamp'), editor: p => <DateTimeEditor p={p} field="t_stamp" />, editorOptions: { editOnClick: true }, formatter: p => moment(p.row.t_stamp).format(DATETIME_FORMAT) },
        // { key: 'artigo_des', width: 280, name: 'Designação', formatter: p => <b>{p.row.artigo_des}</b> },
        // { key: 'n_lote', width: 310, name: 'Lote', editable: (r) => editable(r, 'n_lote'), cellClass: r => editableClass(r, 'n_lote'), editor: p => <SelectDebounceEditor onSelect={(o, v) => onLoteChange(p, v)} fetchOptions={(v) => loadMovimentosLookup(p, v)} optionsRender={optionsRender} p={p} field="n_lote" />, editorOptions: { editOnClick: true }, formatter: p => <b>{p.row.n_lote}</b> },
        // { key: 'qty_lote', name: 'Qtd', minWidth: 95, width: 95, editable: (r) => editable(r, 'qty_lote'), cellClass: r => editableClass(r, 'qty_lote'), editor: p => <InputNumberEditor onChange={onQtyLoteChange} p={p} field="qty_lote" min={0} addonAfter="kg" />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{parseFloat(p.row.qty_lote).toFixed(2)} kg</div> },
        // { key: 'qty_reminder', width: 110, name: 'Qtd. Restante', editable: (r) => editable(r, 'qty_reminder'), cellClass: r => editableClass(r, 'qty_reminder'), editor: p => <InputNumberEditor onChange={onQtyReminderChange} p={p} field="qty_reminder" min={0} max={p.row.qty_lote} addonAfter="kg" />, editorOptions: { editOnClick: true }, formatter: p => <div>{parseFloat(p.row.qty_reminder).toFixed(2)} kg</div> },
        // { key: "in_t", width: 140, name: 'Data Entrada', formatter: p => moment(p.row.in_t).format(DATETIME_FORMAT) },
        // { key: "out_t", width: 140, name: 'Data Saída', formatter: p => p.row.diff !== 0 && moment(p.row.out_t).format(DATETIME_FORMAT) },
        // { key: "diff", width: 140, name: 'Duração', cellClass: r => formatterClass(r, 'diff'), formatter: p => p.row.diff !== 0 && secondstoDay(p.row.diff) },
        // { key: "avgdiff", width: 140, name: 'Duração Média', formatter: p => secondstoDay(p.row.avgdiff) },
        // { key: "stddiff", width: 140, name: 'Desvio Padrão', formatter: p => secondstoDay(p.row.stddiff) },
        // { key: 'vcr_num', name: 'Movimento', width: 200, formatter: p => p.row.vcr_num },
        // { key: 'ofs', width: 280, name: 'Ordem Fabrico', formatter: p => <OfsColumn value={p.row.ofs && JSON.parse(p.row.ofs)} /> }
    ];

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ init = false, signal } = {}) => {
        if (init) {
            const initFilters = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, {}, [...Object.keys(dataAPI.getAllFilter())]);
            let { filterValues, fieldValues } = fixRangeDates(['fdata'], initFilters);
            formFilter.setFieldsValue({ ...fieldValues });
            dataAPI.addFilters({ ...filterValues }, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters(defaultParameters, true, true);
            dataAPI.fetchPost({ signal });
        }
        submitting.end();
    }

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const vals = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
                const _values = {
                    ...vals,
                    // fartigo: getFilterValue(vals?.fartigo, 'any'),
                    flote: getFilterValue(vals?.flote, 'any'),
                    fbobine: getFilterValue(vals?.fbobine, 'any'),
                    fpalete: getFilterValue(vals?.fpalete, 'any'),
                    fdata: getFilterRangeValues(vals["fdata"]?.formatted),





                    // fsdh: getFilterValue(vals?.fsdh, 'any'),
                    // fclienteexp: getFilterValue(vals?.fclienteexp, 'any'),
                    // fartigoexp: getFilterValue(vals?.fartigoexp, 'any'),
                    // fartigo: getFilterValue(vals?.fartigo, 'any'),
                    // flotenw: getFilterValue(vals?.flotenw, 'any'),
                    // ftiponw: getFilterValue(vals?.ftiponw, 'any'),
                    // fcarganome: getFilterValue(vals?.fcarganome, 'any'),
                    // fdestinoold: getFilterValue(vals?.fdestinoold, 'any'),
                    
                    // fmatricula:getFilterValue(vals?.fmatricula, 'any'),
                    // fmatricula_reboque:getFilterValue(vals?.fmatricula_reboque, 'any'),
                    // fprf: getFilterValue(vals?.fprf, 'any'),
                    // forder: getFilterValue(vals?.forder, 'any'),
                    // fdestino: getFilterValue(vals?.fdestino, 'any'),
                    // fartigo_mp: getFilterValue(vals?.fartigo_mp, 'any'),
                    // flote_mp: getFilterValue(vals?.flote_mp, 'any'),
                    // fdispatched: (!vals?.fdispatched || vals?.fdispatched === 'ALL') ? null : vals.fdispatched,
                    // fcarga: (!vals?.fcarga || vals?.fcarga === 'ALL') ? null : vals.fcarga,
                    // fvcr: getFilterValue(vals?.fvcr, 'any'),
                    
                    // fdatain: getFilterRangeValues(vals["fdatain"]?.formatted),
                    // fdataout: getFilterRangeValues(vals["fdataout"]?.formatted),
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
        switch (item.key) {
            case "delete": Modal.confirm({
                title: <div>Eliminar Movimento <b>{row.vcr_num}</b></div>, content: <ul>
                    {row.type_mov === 1 && <li>Serão eliminados os movimentos de entrada e saída!</li>}
                    <li style={{ fontWeight: 700 }}>Atenção!! Se tiver alterações por guardar, ao efetuar esta operação perderá todas as alterações.</li>
                </ul>, onOk: async () => {
                    submitting.trigger();
                    try {
                        let response = await fetchPost({ url: `${API_URL}/deletegranulado/`, filter: { vcr_num: row.vcr_num, type_mov: row.type_mov }, parameters: {} });
                        if (response.data.status !== "error") {
                            dataAPI.fetchPost();
                        } else {
                            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
                        }
                    } catch (e) {
                        Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
                    } finally {
                        submitting.end();
                    };
                }
            });
                break;
            case "out":
                setModalParameters({ type: item.key, title: "Saída de lote em linha", loadData: () => dataAPI.fetchPost(), record: row });
                showModal();
                break;
            case "close":
                setModalParameters({ type: item.key, title: "Fechar movimento", loadData: () => dataAPI.fetchPost(), record: row, height: 300 });
                showModal();
                break;
        }
    }
    const changeMode = () => {
        setModeEdit({ datagrid: (modeEdit.datagrid) ? false : true });
    }
    const onSave = async (action) => {
        const rows = dataAPI.getData().rows.filter(v => v?.valid === 0).map(({ n_lote, vcr_num, t_stamp, qty_lote, qty_reminder, vcr_num_original, type_mov }) =>
            ({ n_lote, vcr_num, t_stamp: moment.isMoment(t_stamp) ? t_stamp.format(DATETIME_FORMAT) : moment(t_stamp).format(DATETIME_FORMAT), qty_lote, qty_reminder, vcr_num_original, type_mov })
        );
        submitting.trigger();
        try {
            let response = await fetchPost({ url: `${API_URL}/updategranulado/`, parameters: { type: "datagrid", rows } });
            if (response.data.status == "multi") {
                Modal.info({
                    title: "Estado das atualizações",
                    content: <YScroll style={{ maxHeight: "270px" }}>
                        {response.data.success.length > 0 && <ul style={{ padding: "0px 0px 5px 20px", background: "#f6ffed", border: "solid 1px #b7eb8f" }}>
                            {response.data.success.map(v => <li>{v}</li>)}
                        </ul>
                        }
                        {response.data.errors.length > 0 && <ul style={{ padding: "0px 0px 5px 20px", background: "#fff2f0", border: "solid 1px #ffccc7" }}>
                            {response.data.errors.map(v => <li>{v}</li>)}
                        </ul>
                        }
                    </YScroll>
                })
                if (response.data.success.length > 0) {
                    dataAPI.fetchPost();
                }
            } else {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        } finally {
            submitting.end();
        };
    }
    const onAdd = () => {
        setModalParameters({ height: 380, type: "in", title: "Entrada de lote em linha", loadData: () => dataAPI.fetchPost() });
        showModal();
    }
    const onClose = () => {
        setModalParameters({ height: 220, width: 450, type: "closedate", title: "Fechar Movimentos por data de saída", loadData: () => dataAPI.fetchPost() });
        showModal();
    }

    const onClickDetails = (type, row) => {
        setModalParameters({ content: "details", tab: lastTab, setLastTab, type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: () => dataAPI.fetchPost(), parameters: { palete: row, palete_id: row.id, palete_nome: row.nome } });
        showModal();
    }

    const onCreatePalete = () => {
        setModalParameters({ content: "createpalete",type: "drawer", title:"Criar Palete (Selecionar Ordem de Fabrico)", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: () => dataAPI.fetchPost(), parameters: {} });
        showModal();
    }

    return (
        <>
            {!setFormTitle && <TitleForm data={dataAPI.getAllFilter()} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
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
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={false}
                rowHeight={28}
                rowClass={(row) => (row?.valid === 0 ? classes.notValid : undefined)}
                leftToolbar={<Space>
                    <Permissions permissions={permission} action="createPalete"><Button disabled={submitting.state} onClick={onCreatePalete}>Criar Palete</Button></Permissions>
                    {/* <Permissions permissions={permission} action="editList">
                        {!modeEdit.datagrid && <Button disabled={submitting.state} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
                        {modeEdit.datagrid && <Button disabled={submitting.state} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                        {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={submitting.state} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                    </Permissions> */}

                    {/* {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<CheckCircleOutlined />} onClick={onClose}>Fechar Movimentos</Button>}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<PlusCircleOutlined />} onClick={onAdd}>Nova Entrada</Button>}
                    {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                    {!modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>} */}
                </Space>}
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 500, mask: true }
                }}
            />
        </>
    );
}