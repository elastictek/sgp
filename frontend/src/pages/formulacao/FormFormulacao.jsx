import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { uid } from 'uid';
import { produce } from 'immer';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, sleep } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch } from "antd";
const { TextArea } = Input;
// import ToolbarTitle from './commons/ToolbarTitle';
const { Title } = Typography;
import { excludeObjectKeys, json } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, OFabricoStatus } from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';
import IconButton from "components/iconButton";
import { MdAdjust, MdAssignmentReturned } from 'react-icons/md';

const title = "Formulação";
const TitleForm = ({ data, onChange, level, auth, form }) => {
    return (<ToolbarTitle id={auth?.user} description={title} title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }} wrap="nowrap" nogutter>
                <Col xs='content' style={{}}><Row nogutter><Col title={title} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}><span style={{}}>{title}</span></Col></Row></Col>
                {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
            </Row>

        </Col>
    </>
    }
    />);
}

const useStyles = createUseStyles({});

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const rowSchema = (options = {}) => {
    return getSchema({
        "matprima_des":
            Joi.alternatives(
                Joi.string(),
                Joi.object().keys({
                    ITMREF_0: Joi.string().label("Matéria Prima").required()//alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
                }).unknown(true)).label("Matéria Prima").required(),
        // "des": Joi.string().label("des").required()
    }, options).unknown(true);
}

const loadFormulacao = async (params, primaryKey, signal) => {
    //console.log("feoreeee")
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...params }, sort: [], parameters: { method: "GetFormulacao" }, signal });
    //console.log("loadddddddddddddddddddddd", rows)
    if (rows && rows.length > 0) {
        let _v = json(rows[0]?.formulacao);
        if (!_v?.items) {
            _v["items"] = [];
        }
        if (!("joinbc" in _v) || _v?.joinbc == 1) {
            const _c = _v?.items?.filter(v => v?.extrusora === "C");
            _v["items"] = _v?.items?.filter(v => v?.extrusora !== "C").map((v, i) => ({ ...v, [primaryKey]: `${v.extrusora}-${uid(4)}`, doseador: [...new Set([v?.doseador, ...v?.extrusora !== "A" ? _c.filter(x => (x?.cuba == v?.cuba)).map(x => x?.doseador) : []].filter(Boolean))].join(",") })).sort((a, b) => a.extrusora.localeCompare(b.extrusora));
        } else {
            _v["items"] = _v?.items?.map(v => ({ ...v, [primaryKey]: `${v.extrusora}-${uid(4)}` })).sort((a, b) => a.extrusora.localeCompare(b.extrusora));
        }
        return _v;
    }
    return {};
}

const loadLastUsedFormulacao = async (params, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...params }, sort: [], parameters: { method: "GetLastUsedFormulacao" }, signal });
    if (rows && rows.length > 0) {
        let _v = json(rows[0]?.formulacao);
        const _items = [];
        if (!_v?.items) {
            _v["items"] = [];
        }
        if (params.joinbc == 1) {
            //Tem de retornar agregada
            _v["items"].forEach((value, index, array)=>{
                if (value.extrusora=="B" || value.extrusora=="C"){
                    const _value = excludeObjectKeys(value,["extrusora","cuba_BC","cuba_A","cuba_B","cuba_C"]);
                    _items.push({..._value,extrusora:"BC",cuba_BC:value.cuba});
                }else{
                    _items.push({...value,extrusora:"A",cuba_A:value.cuba});
                }
            });
        } else if (params.joinbc == 0) {
            //tem de retornar separada
            console.log("splitted")
            _v["items"].forEach((value, index, array)=>{
                if (value.extrusora=="BC"){
                    const _value = excludeObjectKeys(value,["extrusora","cuba_BC","cuba_A","cuba_B","cuba_C"]);
                    _items.push({..._value,extrusora:"B",cuba_B:value.cuba});
                    _items.push({..._value,extrusora:"C",cuba_C:value.cuba});
                }else{
                    _items.push({...value,[`cuba_${value.extrusora}`]:value.cuba});
                }
            });
        }
        _v["items"] = _items;
        return _v;
    }
    return {};
}

const menuOptions = ({ edit, joinbc, referenceDisabled = false }) => [
    ...(edit && !joinbc) ? [{ key: 1, label: "Adicionar na Extrusora A" }, { key: 2, label: "Adicionar na Extrusora B" }, { key: 3, label: "Adicionar na Extrusora C" }] : [],
    ...(edit && joinbc) ? [{ key: 1, label: "Adicionar na Extrusora A" }, { key: 4, label: "Adicionar nas Extrusoras BC" }] : [],
    { type: 'divider' },
    ...(edit && !referenceDisabled) ? [{ key: 5, label: <Space><Field name="reference" label={{ enabled: false }}><SwitchField /></Field><span>Formulação de Referência</span></Space> }] : [],
    { type: 'divider' },
    ...(edit) ? [{ key: 6, label: <Space><Field name="joinbc" label={{ enabled: false }}><SwitchField /></Field><span>{joinbc ? "Desagrupar extrusora BC" : "Agrupar extrusora BC"}</span></Space> }] : []
];

export default ({ noHeader = false, setFormTitle, enableAssociation = true, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "formulacao", item: "datagrid" });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: false, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});
    const [form] = Form.useForm();

    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: ``, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });
    const submitting = useSubmitting(true);

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "ordensfabrico": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    const addToOFabrico = () => {
        const _filter = form.getFieldsValue(["artigo_id", "produto_id"]);
        setModalParameters({
            content: "ordensfabrico", responsive: true, type: "drawer", width: 1200, title: "Ordens de Fabrico", push: false, loadData: () => { }, parameters: {
                payload: { payload: { url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "of_id", parameters: { method: "OrdensFabricoAllowed" }, pagination: { enabled: false, limit: 50 }, filter: { ..._filter }, sort: [] } },
                toolbar: false,
                //pt.status,pf.designacao,pf.group_name ,pf.subgroup_name , pf.versao, pt2.cliente_nome
                columns: [
                    { name: 'cod', header: 'Agg.', defaultWidth: 160 },
                    { name: 'of_id', header: 'Ordem', defaultWidth: 160 },
                    { name: 'ofabrico_status', header: 'Estado', defaultWidth: 160, render: ({ data, cellProps }) => <OFabricoStatus cellProps={{}} data={data} /> },
                    { name: 'cliente_nome', header: 'Cliente', minWidth: 260, flex: 1 },
                    { name: 'artigo_cod', header: 'Artigo', minWidth: 160 }
                    // { name: 'designacao', header: 'Formulação Des.', defaultWidth: 260 },
                    // { name: 'group_name', header: 'Formulação Grupo', defaultWidth: 160 },
                    // { name: 'subgroup_name', header: 'Formulação Subgrupo', defaultWidth: 160 },
                    // { name: 'versao', header: 'Versão', width: 90 },
                ],
                onSelect: onSelectOrdemFabrico
                // filters: { fofabrico: { type: "any", width: 150, text: "Ordem", autoFocus: true } },
            },

        });
        showModal();
    }

    const onSelectOrdemFabrico = async ({ rowProps, closeSelf }) => {
        let response = null;
        try {
            response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { aggid: rowProps?.data?.id }, parameters: { method: "SetOrdemFabricoFormulacao", ...inputParameters.current } });
            if (response.data.status !== "error") {
                closeSelf();
                openNotification(response.data.status, 'top', "Notificação", response.data.title);
            } else {
                openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
            }
        } catch (e) {
            openNotification("error", 'top', "Notificação", e.message, null);
        } finally {
        };
    }

    const columnEditable = (v, { data, name }) => {
        if (["cuba", "doseador"].includes(name) && inputParameters.current?.type === "formulacao_dosers_change" && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
            return true;
        }
        if (["matprima_des", "densidade", "arranque", "tolerancia"].includes(name) && inputParameters.current?.type !== "formulacao_dosers_change" && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
            return true;
        }
        return false;
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        if (dataAPI.getFieldStatus(data[dataAPI.getPrimaryKey()])?.[name]?.status === "error") {
            return tableCls.error;
        }
        if (!data?.__group && ["cuba", "doseador"].includes(name) && inputParameters.current?.type === "formulacao_dosers_change" && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
            return tableCls.edit;
        }
        if (!data?.__group && ["matprima_des", "densidade", "arranque", "tolerancia"].includes(name) && inputParameters.current?.type !== "formulacao_dosers_change" && (mode.datagrid.edit || (mode.datagrid.add && data?.rowadded === 1))) {
            return tableCls.edit;
        }

        if (data?.__group && ["vglobal"].includes(name)) {
            if (form.getFieldValue("joinbc") == 1 && data?.value !== "A") {
                if (parseFloat(value) !== 90) {
                    return tableCls.error;
                }
            } else if ((data?.value === "B" || data?.value === "C")) {
                if (parseFloat(value) !== 45) {
                    return tableCls.error;
                }
            } else if (data?.value === "A" && parseFloat(value) !== 10) {
                return tableCls.error;
            }

        }
    };

    const groups = [
        { name: 'extrusora', header: 'Distribuição por Extrusora', headerAlign: "center" }
    ]

    const columns = [
        ...(inputParameters.current?.cs_id) ? [{
            name: 'cuba', header: "Cuba", userSelect: true, defaultLocked: false, width: 55, headerAlign: "center",
            cellProps: { className: columnClass }, colspan: ({ data, column, columns }) => (data?.group) ? columns.length : 1,
            editable: columnEditable, renderEditor: (props) => <CubaTableEditor {...props} />,
            render: ({ cellProps, data }) => data?.group ? <div style={{ fontWeight: 900 }}>{data?.designacao}</div> : <Cuba value={data?.cuba} />
        }] : [],
        ...(inputParameters.current?.cs_id) ? [{
            name: 'doseador', header: "Doseador", userSelect: true, defaultLocked: false, width: 90, headerAlign: "center",
            cellProps: { className: columnClass },
            editable: columnEditable, renderEditor: (props) => <DoserTableEditor {...props} joinbc={form.getFieldValue("joinbc")} />,
            render: (p) => <CenterAlign style={{ fontWeight: 700 }}>{p.data?.doseador}</CenterAlign>
        }] : [],
        ...(true) ? [{ name: 'matprima_cod', header: 'Código', userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", }] : [],
        ...(true) ? [{
            name: 'matprima_des', header: 'Artigo', userSelect: true, defaultLocked: false, minWidth: 170, flex: 1, headerAlign: "center",
            editable: columnEditable, renderEditor: (props) => <MateriasPrimasTableEditor {...props} />,

            cellProps: { className: columnClass },
            render: ({ cellProps, data }) => {
                if (cellProps.inEdit) {
                    return <></>
                }
                if (data?.__group) {
                    return (mode.datagrid.edit && permission.isOk({ forInput: [!submitting.state, inputParameters.current?.type !== "formulacao_dosers_change"], action: "add" })) &&
                        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}><Button style={{ width: "200px" }} size='small' icon={<PlusOutlined />} onClick={() => onCustomAdd(data)}>Adicionar</Button></div>;
                } else {
                    return <div style={{ fontWeight: 700 }}>{data?.matprima_des}</div>;
                }
            }
        }] : [],
        ...(true) ? [{
            name: 'densidade', header: 'Densidade', userSelect: true, defaultLocked: false, width: 150, headerAlign: "center",
            render: (p) => <RightAlign>{p.data?.densidade}</RightAlign>, cellProps: { className: columnClass },
            editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 5 }} {...props} />
        }] : [],
        ...(true) ? [{
            name: 'arranque', header: 'Arranque', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center",
            render: (p) => <RightAlign unit="%">{p.data?.arranque}</RightAlign>, cellProps: { className: columnClass },
            editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 100 }} {...props} />
        }] : [],
        ...(true) ? [{
            name: 'tolerancia', header: 'Tolerância', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center",
            render: (p) => <RightAlign unit="%">{p.data?.tolerancia}</RightAlign>, cellProps: { className: columnClass },
            editable: columnEditable, renderEditor: (props) => <InputNumberTableEditor inputProps={{ min: 0, max: 100 }} {...props} />
        }] : [],
        ...(true) ? [{
            name: 'vglobal', header: 'Global', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", cellProps: { className: columnClass },
            groupSummaryReducer: {
                initialValue: 0, reducer: (a, b) => (parseFloat(a) + parseFloat(b)),
                complete: (a, rows) => parseFloat(a).toFixed(1)
            },
            render: ({ data, cellProps }) => <RightAlign unit="%" addonAfter={mode.datagrid.edit && !data?.__group && <IconButton style={{ marginLeft: "10px" }} onClick={() => adjust(data, cellProps)}><MdAdjust /></IconButton>}>{data?.__group ? data?.groupColumnSummary?.vglobal : data.vglobal}</RightAlign>
        }] : [],
        ...(permission.isOk({ forInput: [!submitting.state, mode.datagrid.edit, inputParameters.current?.type !== "formulacao_dosers_change"], action: "delete" })) ? [{ name: 'bdelete', header: '', headerAlign: "center", userSelect: true, defaultLocked: false, width: 45, render: ({ data, rowIndex }) => !data?.__group && <Button onClick={() => onDelete(data, rowIndex)} icon={<DeleteTwoTone twoToneColor="#f5222d" />} /> }] : []
    ];


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, ["formulacao_id", "cs_id", "audit_cs_id", "new", "type", "agg_of_id"]);
            inputParameters.current = paramsIn;
        }
        console.log("###################--------------xxxxx-", props?.parameters)
        setFormDirty(false);
        if (inputParameters.current?.new) {
            form.setFieldsValue({ joinbc: 1, reference: 0 });
        } else {
            const { items, ...formulacao } = await loadFormulacao({ ...inputParameters.current }, dataAPI.getPrimaryKey(), signal);

            console.log("loadddedddd", formulacao)

            dataAPI.setData({ rows: items, total: items?.length });
            form.setFieldsValue({
                joinbc: 1, reference: 0, ...formulacao,
                cliente: { BPCNUM_0: formulacao?.cliente_cod, BPCNAM_0: formulacao?.cliente_nome },
                produto_id: formulacao?.produto_id,
                artigo_id: formulacao?.artigo_id
            });
        }
        submitting.end();
    }

    const onFilterFinish = (type, values) => {
        // const _data = { start: values?.fdata?.startValue?.format(DATE_FORMAT), end: values?.fdata?.endValue?.format(DATE_FORMAT) };
        // const { errors, warnings, value, messages, ...status } = getStatus(schema().validate(_data, { abortEarly: false, messages: validateMessages, context: {} }));
        // if (errors > 0) {
        //     openNotification("error", 'top', "Notificação", messages.error);
        // } else {
        //     if (warnings > 0) {
        //         openNotification("warning", 'top', "Notificação", messages.warning);
        //     }
        //     switch (type) {
        //         case "filter":
        //             //remove empty values
        //             const vals = dataAPI.removeEmpty({ ...defaultFilters, ...values });
        //             const _values = {
        //                 ...vals,
        //                 //fgroup: getFilterValue(vals?.fgroup, 'any'),
        //                 //fcod: getFilterValue(vals?.fcod, 'any'),
        //                 //fdes: getFilterValue(vals?.fdes, 'any'),
        //                 //f1: getFilterValue(vals?.f1, 'any'),
        //                 fdata: getFilterRangeValues(vals?.fdata?.formatted, true, "00:00:00", "23:59:59")
        //             };
        //             dataAPI.addFilters(dataAPI.removeEmpty(_values));
        //             dataAPI.addParameters(defaultParameters);
        //             dataAPI.first();
        //             dataAPI.setAction("filter", true);
        //             dataAPI.update(true);
        //             break;
        //     }
        // }
    };
    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const sumVGlobal = (extrusora) => {
        switch (extrusora) {
            case "A": return dataAPI.getData().rows.filter(v => v?.extrusora === "A").reduce((a, b) => parseFloat(a) + parseFloat(b?.vglobal), 0); break;
            case "B": return dataAPI.getData().rows.filter(v => form.getFieldValue("joinbc") != 1 && v?.extrusora === "B")?.reduce((a, b) => parseFloat(a) + parseFloat(b?.vglobal), 0); break;
            case "C": return dataAPI.getData().rows.filter(v => form.getFieldValue("joinbc") != 1 && v?.extrusora === "C")?.reduce((a, b) => parseFloat(a) + parseFloat(b?.vglobal), 0); break;
            case "BC": return dataAPI.getData().rows.filter(v => form.getFieldValue("joinbc") == 1 && v?.extrusora !== "A")?.reduce((a, b) => parseFloat(a) + parseFloat(b?.vglobal), 0); break;
        }
        const sumA = dataAPI.getData().rows.filter(v => v?.extrusora === "A").reduce((a, b) => parseFloat(a) + parseFloat(b?.vglobal), 0);
        const sumBC = dataAPI.getData().rows.filter(v => form.getFieldValue("joinbc") == 1 && v?.extrusora !== "A")?.reduce((a, b) => parseFloat(a) + parseFloat(b?.vglobal), 0);
        const sumB = dataAPI.getData().rows.filter(v => form.getFieldValue("joinbc") != 1 && v?.extrusora === "B")?.reduce((a, b) => parseFloat(a) + parseFloat(b?.vglobal), 0);
        const sumC = dataAPI.getData().rows.filter(v => form.getFieldValue("joinbc") != 1 && v?.extrusora === "C")?.reduce((a, b) => parseFloat(a) + parseFloat(b?.vglobal), 0);
        return { sumA: parseFloat(sumA.toFixed(2)), sumBC: parseFloat(sumBC.toFixed(2)), sumB: parseFloat(sumB.toFixed(2)), sumC: parseFloat(sumC.toFixed(2)), total: parseFloat((sumA + sumBC + sumB + sumC).toFixed(2)) };
    }
    const sumArranque = (extrusora) => {
        const _extrusora = extrusora === "BC" ? "B" : extrusora;
        return parseFloat(dataAPI.getData().rows.filter(v => v?.extrusora === _extrusora).reduce((a, b) => parseFloat(a) + parseFloat(b?.arranque), 0).toFixed(2));
    }
    const ponderacao = (extrusora) => {
        return FORMULACAO_PONDERACAO_EXTRUSORAS[extrusora] / 100;
    }
    const getExtrusora = (extrusora) => {
        if (extrusora === "A") {
            return "A";
        } else if (form.getFieldValue("joinbc") == 1 && extrusora !== "A") {
            return "BC";
        } else if (form.getFieldValue("joinbc") != 1 && extrusora === "B") {
            return "B";
        } else if (form.getFieldValue("joinbc") != 1 && extrusora === "C") {
            return "C";
        }
    }
    const adjust = (data, cellProps) => {
        let _extrusora = getExtrusora(data?.extrusora);
        const diff = 100 - (sumArranque(_extrusora) - parseFloat(data?.arranque));
        if (diff !== parseFloat(data?.arranque)) {
            dataAPI.updateValues(dataAPI.getIndex(data), "arranque", { "arranque": parseFloat(diff.toFixed(2)), "vglobal": (diff * ponderacao(_extrusora)).toFixed(2) });
        }

    }
    const vglobal = (extrusora, arranque) => {
        //console.log("vglobal-----", arranque, extrusora)
        return (parseFloat(arranque) * ponderacao(extrusora)).toFixed(2);
    }

    const onEditComplete = ({ value, columnId, rowIndex, data, ...rest }) => {
        const index = dataAPI.getIndex(data);
        if (index >= 0) {
            let _rows = [];
            if (columnId === "matprima_des") {
                _rows = dataAPI.updateValues(index, columnId, { matprima_cod: value?.ITMREF_0, matprima_des: value?.ITMDES1_0 });
            } else {
                const _vglobal = columnId === "arranque" ? vglobal(getExtrusora(data.extrusora), value) : data.vglobal;
                _rows = dataAPI.updateValues(index, columnId, { [columnId]: value, vglobal: _vglobal });
                //dataAPI.updateValue(index, columnId, value);
            }
            dataAPI.validateRows(rowSchema, {}, {}, _rows);
            // const { errors, warnings, fieldStatus, formStatus } = dataAPI.validateField(rowSchema, data[dataAPI.getPrimaryKey()], columnId, value, index, gridStatus);
            // setGridStatus({ errors, warnings, fieldStatus, formStatus });
        }

    }

    const onUpdateReference = async () => {
        if ("formulacao_id" in inputParameters.current) {
            submitting.trigger();
            let response = null;
            try {
                response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...inputParameters.current }, parameters: { method: "UpdateFormulacaoReference", reference: form.getFieldValue("reference") } });
                if (response.data.status !== "error") {
                    dataAPI.update(true);
                    openNotification(response.data.status, 'top', "Notificação", response.data.title);
                } else {
                    openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
                }
            } catch (e) {
                openNotification("error", 'top', "Notificação", e.message, null);
            } finally {
                submitting.end();
            };
        }
    }

    const onSave = async (type) => {
        // const rows = dataAPI.dirtyRows().map(({ id, group }) => ({ artigo_id: id, group }));
        submitting.trigger();
        let response = null;
        try {
            const status = dataAPI.validateRows(rowSchema);
            let sums = sumVGlobal();
            const joinbc = form.getFieldValue("joinbc");
            if (parseFloat(sums.total.toFixed(1)) !== 100) {
                const msg = ["O Total Global das Matérias Primas tem de ser 100%!"];
                if (sums.sumA !== 10) {
                    msg.push("O Total das Matérias Primas da Extrusora A tem de ser 10%!");
                }
                if (joinbc) {
                    if (sums.sumBC !== 90) {
                        msg.push("O Total das Matérias Primas das Extrusoras B e C tem de ser 90%!");
                    }
                } else {
                    if (sums.sumB !== 45) {
                        msg.push("O Total das Matérias Primas da Extrusora B tem de ser 45%!");
                    }
                    if (sums.sumC !== 45) {
                        msg.push("O Total das Matérias Primas da Extrusora C tem de ser 45%!");
                    }
                }
                openNotification("error", "top", "Notificação", msg, 5, { width: "500px" });
            } else {
                if (status.errors > 0) {
                    openNotification("error", "top", "Notificação", ["Existem erros no formulário!"], 5, { width: "500px" });
                }
            }
            if (status.errors === 0 && parseFloat(sums.total.toFixed(1)) === 100) {
                form.setFieldValue("cliente_cod", form.getFieldValue("cliente")?.BPCNUM_0);
                form.setFieldValue("cliente_nome", form.getFieldValue("cliente")?.BPCNAM_0);
                let _items = [];
                if (joinbc == 1) {
                    let _itemsAB = dataAPI.getData().rows.filter(x => x?.extrusora !== "C").map(x => ({ ...x, vglobal: vglobal(getExtrusora(x.extrusora), x.arranque), ...(x.extrusora !== "A" && x?.doseador) && { doseador: x.doseador.split(",").filter(v => v.startsWith("B")).join(",") } }));
                    let _itemsC = dataAPI.getData().rows.filter(x => x?.extrusora === "B").map(x => ({ ...x, extrusora: "C", [dataAPI.getPrimaryKey()]: `C-${uid(4)}`, vglobal: vglobal("C", x.arranque), ...(x?.doseador) && { doseador: x.doseador.split(",").filter(v => v.startsWith("C")).join(",") } }));
                    _items = [..._itemsAB, ..._itemsC];
                } else {
                    _items = dataAPI.getData().rows;
                }
                response = await fetchPost({
                    url: `${API_URL}/ordensfabrico/sql/`, filter: { ...inputParameters.current }, parameters: {
                        method: "SaveFormulacao", ...dataAPI.removeEmpty(form.getFieldsValue(true), ["cliente"]),
                        type: inputParameters.current?.type,
                        items: _items.map(obj => Object.keys(obj).reduce((acc, key) => {
                            if (obj[key] !== '') {
                                acc[key] = obj[key];
                            }
                            return acc;
                        }, {}))
                    }
                });
                if (response.data.status !== "error") {
                    if (props?.postProcess) {
                        props.postProcess();
                    }
                    //A ordem dos if's é muito importante!!!!
                    if ("cs_id" in inputParameters.current) {
                        setMode(v => ({ ...v, datagrid: { edit: false, add: false } }));
                        dataAPI.setAllRowsValid();
                    } else if ("formulacao_id" in inputParameters.current) {
                        if (response.data?.id) {
                            inputParameters.current = { formulacao_id: response.data.id };
                        }
                        loadData();
                    } else if ("new" in inputParameters.current) {
                        inputParameters.current = { formulacao_id: response.data.id };
                        loadData();
                    } else {
                        dataAPI.update(true);
                    }
                    openNotification(response.data.status, 'top', "Notificação", response.data.title);
                } else {
                    openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
                }
            }
        } catch (e) {
            console.log(e)
            openNotification("error", 'top', "Notificação", e.message, null);
        } finally {
            submitting.end();
        };
    }

    const onAddSave = async (type) => {
        // const rows = dataAPI.getData().rows;
        // submitting.trigger();
        // let response = null;
        // try {
        //     dataAPI.validateRows(rowSchema);
        //     if (errors === 0) {
        //         //response = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "UpdateArtigosCompativeis", rows } });
        //         //if (response.data.status !== "error") {
        //         //  dataAPI.update(true);
        //         //  openNotification(response.data.status, 'top', "Notificação", response.data.title);
        //         //} else {
        //         ///  openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
        //         //}
        //     }
        // } catch (e) {
        //     //openNotification(response.data.status, 'top', "Notificação", e.message, null);
        // } finally {
        //     submitting.end();
        // };
    }
    const onAdd = (cols) => {
        dataAPI.addRow(cols, null, 0);
    }
    const onDelete = (data, rowIndex) => {
        const _rows = dataAPI.deleteRow({ [dataAPI.getPrimaryKey()]: data?.[dataAPI.getPrimaryKey()] }, [dataAPI.getPrimaryKey()]);
        dataAPI.validateRows(rowSchema, {}, {}, _rows);
        // const { errors, warnings, fieldStatus, formStatus } = dataAPI.clearRowStatus(data?.[dataAPI.getPrimaryKey()], gridStatus);
        // setGridStatus({ errors, warnings, fieldStatus, formStatus });
    }
    const onCustomAdd = (data) => {
        if (Array.isArray(data)) {
            dataAPI.addRows([
                { rowid: `${data[0].value}-${uid(4)}`, extrusora: data[0].value, tolerancia: 0.5, arranque: 0, densidade: 0, vglobal: 0 },
                { rowid: `${data[1].value}-${uid(4)}`, extrusora: data[1].value, tolerancia: 0.5, arranque: 0, densidade: 0, vglobal: 0 }
            ], null, 0, (r) => {
                return r.sort((a, b) => a?.extrusora?.localeCompare(b?.extrusora));
            });
        } else {
            dataAPI.addRow({ rowid: `${data.value}-${uid(4)}`, extrusora: data.value, tolerancia: 0.5, arranque: 0, densidade: 0, vglobal: 0 }, null, 0, (r) => {
                return r.sort((a, b) => a?.extrusora?.localeCompare(b?.extrusora));
            });
        }
        dataAPI.update();
    }

    const rowClassName = ({ data }) => {
        // if (!data?.n_lote) {
        //     return tableCls.error;
        // }
    }

    const menuClick = (v) => {
        switch (v.key) {
            case '1': onCustomAdd({ value: "A" }); break;
            case '2': onCustomAdd({ value: "B" }); break;
            case '3': onCustomAdd({ value: "C" }); break;
            case '4': onCustomAdd({ value: "B" }); break;
            case '5': onUpdateReference(); break;
            case '6':
                if (form.getFieldValue("joinbc") == 1) {
                    if (dataAPI.getData().rows) {
                        let _itemsC = dataAPI.getData().rows.filter(x => x?.extrusora === "C");
                        let _items = dataAPI.getData().rows.filter(x => x?.extrusora !== "C").map(x => {
                            let _x = { ...x };
                            let _c = _itemsC.find(v => v.cuba == x.cuba && v.matprima_cod == x.matprima_cod);
                            if (_c) {
                                let _doser = x?.doseador ? x?.["doseador"].split(',') : [];
                                _doser.push(_c.doseador);
                                _doser.sort();
                                _x["doseador"] = _doser.filter(Boolean).join(',');
                                _x["vglobal"] = vglobal(getExtrusora(x.extrusora), x.arranque);
                            }
                            return _x;
                        })
                        //let _items = dataAPI.getData().rows.filter(x => x?.extrusora !== "C").map(x => ({ ...x, vglobal: vglobal(getExtrusora(x.extrusora), x.arranque) }));
                        dataAPI.setData({ rows: _items, total: _items?.length });
                        dataAPI.clearStatus();
                    }
                } else {
                    if (dataAPI.getData().rows) {
                        let _items = dataAPI.getData().rows.filter(x => x?.extrusora !== "C").map(x => {
                            let _x = { ...x }
                            let _dosers = (x?.doseador ? x?.["doseador"].split(',') : []).filter(v => v.startsWith(x.extrusora));
                            _dosers.sort();
                            _x["doseador"] = _dosers.filter(Boolean).join(',');
                            return { ..._x, vglobal: vglobal(getExtrusora(x.extrusora), x.arranque) };
                        });
                        let _itemsC = dataAPI.getData().rows.filter(x => x?.extrusora === "B").map(x => {
                            let _x = { ...x }
                            let _dosers = (x?.doseador ? x?.["doseador"].split(',') : []).filter(v => v.startsWith("C"));
                            _dosers.sort();
                            _x["doseador"] = _dosers.filter(Boolean).join(',');
                            return { ..._x, extrusora: "C", [dataAPI.getPrimaryKey()]: `C-${uid(4)}`, vglobal: vglobal("C", x.arranque) }
                        });
                        //console.log("itemssssssssssss", [..._items, ..._itemsC])
                        dataAPI.setData({ rows: [..._items, ..._itemsC], total: _items?.length + _itemsC?.length });
                        dataAPI.clearStatus();
                    }
                }
                break;
            default: break;
        }
    }

    const onValuesChange = (changed, all) => {
        if (!("reference" in changed)) {
            setFormDirty(true);
        }
    }

    const onEditCancel = async () => {
        await loadData();
        return false;
    }

    const importLastProduction = async () => {
        const joinbc = dataAPI.getData().rows.findIndex(v => v.extrusora == "BC") == -1 ? 0 : 1;
        //Get dos doseadores/cubas da última produção relativa, e devolve a formulação, nas seguintes condições:
        //se a formulação atual tiver join das cubas a última formulacao será retornada com join
        //se a formulação atual não tiver join das cubas a última formulacao será retornada sem join
        const _l = await loadLastUsedFormulacao({ cs_id: inputParameters.current.cs_id, joinbc });
        const _rows = produce(dataAPI.getData().rows, (draftArray) => {
            for (let i = 0; i < draftArray.length; i++) {
                delete draftArray[i].doseador;
                delete draftArray[i].cuba;
                delete draftArray[i].cuba_A;
                delete draftArray[i].cuba_B;
                delete draftArray[i].cuba_BC;
            }
            for (let i = 0; i < draftArray.length; i++) {
                const index = _l.items.findIndex(item => item.matprima_cod === draftArray[i]["matprima_cod"] && item.extrusora === draftArray[i]["extrusora"]);
                if (index !== -1) {
                    const x = _l.items.splice(index, 1);
                    draftArray[i].cuba = x[0].cuba;
                    draftArray[i][`cuba_${x[0].extrusora}`] = x[0].cuba;
                    draftArray[i].doseador = x[0].doseador;
                }
            }
        });
        dataAPI.setRows(_rows);
    }

    return (
        <YScroll>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            <FormContainer id="form" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onValuesChange={onValuesChange} wrapFormItem={true} forInput={mode.datagrid.edit} style={{ padding: "0px" }} alert={{ tooltip: true, pos: "none" }}>
                {!noHeader && <Row style={{}} gutterWidth={10}>
                    <Col xs={2} md={1}><Field name="versao" forInput={false} label={{ enabled: true, text: "Versao" }}><Input /></Field></Col>
                    <Col xs={4} md={2}><FormulacaoGroups name="group_name" label={{ enabled: true, text: "Grupo" }} /></Col>
                    <Col xs={4} md={2}><FormulacaoSubGroups name="subgroup_name" label={{ enabled: true, text: "SubGrupo" }} /></Col>
                    <Col xs={12} md={6} lg={4}><Field name="designacao" label={{ enabled: true, text: "Designação" }}><Input /></Field></Col>
                    <Col xs={12} md={6} lg={4}><Produtos name="produto_id" allowClear label={{ enabled: true, text: "Produto" }} load /></Col>
                    <Col xs={12} md={6} lg={4}><Artigos name="artigo_id" allowClear label={{ enabled: true, text: "Artigo" }} load /></Col>
                    <Col xs={12} md={6} lg={4}><Clientes name="cliente" allowClear label={{ enabled: true, text: "Cliente" }} /></Col>

                </Row>}
                <Row style={{}} nogutter>
                    <Col>
                        <Table
                            dirty={formDirty}
                            loading={submitting.state}
                            offsetHeight="270px"
                            idProperty={dataAPI.getPrimaryKey()}
                            local={true}
                            onRefresh={loadData}
                            rowClassName={rowClassName}
                            groups={groups}
                            sortable={false}
                            editStartEvent={"click"}
                            reorderColumns={false}
                            showColumnMenuTool={false}
                            disableGroupByToolbar={true}
                            groupBy={["extrusora"]}
                            groupColumn={{
                                headerAlign: "center", defaultWidth: 75,
                                header: form.getFieldValue("reference") === 1 && <StarFilled style={{ fontSize: "18px", color: "yellow" }} />,
                                renderGroupValue: ({ value }) => <span style={{ fontWeight: 700 }}>{form.getFieldValue("joinbc") == 1 && ["B", "C"].includes(value) ? <Space><LockOutlined />Extrusora BC</Space> : `Extrusora ${value}`}</span>,
                                colspan: ({ data, column, columns }) => {
                                    if (data?.__group) {
                                        return 2;
                                    }
                                    return 1;
                                }
                            }}

                            editable={{
                                enabled: permission.isOk({ forInput: [!submitting.state], action: "edit" }),
                                add: false,
                                //onAdd: onAdd, onAddSave: onAddSave,
                                onSave: () => onSave("update"), onCancel: onEditCancel,
                                modeKey: "datagrid", setMode, mode, onEditComplete
                            }}

                            columns={columns}
                            dataAPI={dataAPI}
                            moreFilters={false}
                            leftToolbar={
                                <Space>
                                    <Permissions permissions={permission} action="edit" forInput={[enableAssociation, form.getFieldValue("id") > 0, !inputParameters.current?.cs_id, (!mode.datagrid.edit && !mode.datagrid.add)]}><Button onClick={addToOFabrico}>Associar a Ordem Fabrico</Button></Permissions>
                                    {(mode.datagrid.edit && inputParameters.current.type == "formulacao_dosers_change") && <Button onClick={importLastProduction}>Importar da Última Producção</Button>}
                                    {(mode.datagrid.edit && inputParameters.current?.type !== "formulacao_dosers_change") && < Dropdown trigger={['click']} menu={{ onClick: menuClick, items: menuOptions({ edit: mode.datagrid.edit, joinbc: form.getFieldValue("joinbc"), referenceDisabled: inputParameters.current?.cs_id }) }}>
                                        <Button>
                                            <Space>
                                                <EllipsisOutlined />
                                            </Space>
                                        </Button>
                                    </Dropdown>}
                                </Space>
                            }
                            toolbarFilters={false}
                        />
                    </Col>
                </Row>
            </FormContainer>
        </YScroll>
    );


};