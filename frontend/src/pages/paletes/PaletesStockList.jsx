import React, { useEffect, useState, useCallback, useRef, useContext, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { uid } from 'uid';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, sleep } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay, getFloat } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { json, excludeObjectKeys } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, BarsOutlined, ExperimentOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor, LabParametersUnitEditor, MetodoOwnerTableEditor, InputTableEditor, BooleanTableEditor, ClientesTableEditor, ArtigosTableEditor, StatusTableEditor, ObsTableEditor, LabMetodosTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, Status, TextAreaViewer, MetodoOwner, Link, DateTime, Favourite, Valid, Nonwovens, ArrayColumn, EstadoBobines, Largura, Core, Delete } from 'components/TableColumns';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
//const LabArtigoSpecsParametersList = lazy(() => import('./LabArtigoSpecsParametersList'));
// import { isPrivate, LeftUserItem } from './commons';
const Palete = lazy(() => import('../paletes/Palete'));


const title = "Paletes de Stock";
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
        // "matprima_des":
        //     Joi.alternatives(
        //         Joi.string(),
        //         Joi.object().keys({
        //             ITMREF_0: Joi.string().label("Matéria Prima").required()//alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
        //         }).unknown(true)).label("Matéria Prima").required(),
        //"designacao": Joi.string().label("Designação").required(),
        //"cliente_nome": Joi.string().label("Cliente").required(),
        //"des": Joi.string().label("Artigo").required()
    }, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, auth, num, v, ...props }) => {
    return (<>
        {true && <>
            <Col width={200}>
                <Field name="flote" shouldUpdate label={{ enabled: true, text: "Lote", pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear />
                </Field>
            </Col>
            <Col xs='content'>
                <Field name="fdata" label={{ enabled: true, text: "Data", pos: "top", padding: "0px" }}>
                    <RangeDateField size='small' allowClear />
                </Field>
            </Col>
            {/* <Col width={200}>
                <Field name="fartigo_cod" shouldUpdate label={{ enabled: true, text: "Artigo Cód.", pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear />
                </Field>
            </Col>
            <Col width={200}>
                <Field name="fcliente" shouldUpdate label={{ enabled: true, text: "Cliente", pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear />
                </Field>
            </Col> */}
        </>}
    </>
    );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    { flote: { label: "Lote", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data", field: { type: "rangedate", size: 'small' } } },
];

const Actions = ({ data, rowIndex, onAction }) => {

    const items = [
        {
            key: 'Histerese',
            icon: <ExperimentOutlined />,
            label: "Carregar teste de Histerese",
        },
        {
            key: 'Tração',
            icon: <ExperimentOutlined />,
            label: "Carregar teste de Tração",
        },
        {
            key: 'Peel',
            icon: <ExperimentOutlined />,
            label: "Carregar teste de Peel",
        },
    ];

    return (
        <Dropdown menu={{ items, onClick: onAction }} placement="bottomLeft" trigger={["click"]}>
            <Button icon={<EllipsisOutlined />} />
        </Dropdown>
    );
}

export default ({ setFormTitle, noid = false, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "paletes", item: "stock" });//Permissões Iniciais
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
    const defaultParameters = { method: "GetPaletesStock" };
    const defaultSort = [];
    const dataAPI = useDataAPI({ ...(!noid && { id: props?.id }), /* fnPostProcess: (dt) => postProcess(dt, submitting), */ payload: { url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: false, limit: 300 }, filter: defaultFilters } });
    const submitting = useSubmitting(true);
    //const [columns, setColumns] = useState([]);
    const columnsRef = useRef([]);
    const [lastTab, setLastTab] = useState('1');

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "palete": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
                // case "textarea": return <TextAreaViewer parameters={modalParameters.parameters} />;
                // case "parameters": return <LabArtigoSpecsParametersList parameters={modalParameters.parameters} />;
                // case "load": return <LoadEssay parameters={modalParameters.parameters} />;
                case "paletesstock": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal lazy={modalParameters?.lazy} responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    const onClickPalete = (type, row) => {
        setModalParameters({ content: "palete", lazy: true, tab: lastTab, setLastTab, type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData, parameters: { palete: row, palete_id: row.id, palete_nome: row.nome } });
        showModal();
    }

    const onSelectPaletes = () => {

        const _filter = { ordem_id: inputParameters.current.id, cliente_cod: inputParameters.current.cliente_cod, artigo_cod: inputParameters.current.artigo_cod };
        setModalParameters({
            content: "paletesstock", responsive: true, type: "drawer", width: "85%", title: "Paletes disponíveis", push: false, loadData: () => { }, parameters: {
                offsetHeight:"200px",
                multipleSelection: true,
                payload: { payload: { url: `${API_URL}/paletes/sql/`, primaryKey: "id", parameters: { method: "PaletesStockAvailableList" }, pagination: { enabled: true }, filter: _filter, sort: [] } },
                toolbar: true,
                columns: [
                    { name: 'nome', header: 'Palete', defaultWidth: 160,defaultLocked: true },
                    { name: 'ofid', header: 'Ordem', defaultWidth: 160 },
                    { name: 'cliente_nome', header: 'Cliente', defaultWidth: 160 },
                    ...(true) ? [{ name: 'timestamp', header: 'Data', userSelect: true, defaultLocked: false, defaultWidth: 110, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.timestamp} format={DATETIME_FORMAT} /> }] : [],
                    ...(true) ? [{ name: 'nbobines_real', header: 'Bobines', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} addonAfter={`/${data?.num_bobines}`}>{getFloat(data?.nbobines_real, 0)}</RightAlign> }] : [],
                    ...(true) ? [{ name: 'nbobines_emendas', header: 'C/Emendas', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps}>{getFloat(data?.nbobines_emendas, 0)}</RightAlign> }] : [],
                    ...(true) ? [{ name: "estado", header: "Estado", defaultWidth: 100, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <EstadoBobines id={data.id} nome={data.nome} artigos={json(data.artigo)} cellProps={cellProps} /> }] : [],
                    ...(true) ? [{ name: 'largura', header: 'Largura', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <Largura id={data.id} nome={data.nome} artigos={json(data.artigo)} cellProps={cellProps} /> }] : [],
                    ...(true) ? [{ name: 'core', header: 'Core', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <Core id={data.id} nome={data.nome} artigos={json(data.artigo)} cellProps={cellProps} /> }] : [],
                    ...(true) ? [{ name: "has_bobines_expired", header: "B. Expiradas", defaultWidth: 100, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <Boolean data={data?.has_bobines_expired}/> }] : [],
                    ...(true) ? [{ name: 'area_real', header: 'Área', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m&sup2;">{getFloat(data?.area_real, 0)}</RightAlign> }] : [],
                    ...(true) ? [{ name: 'comp_real', header: 'Comp.', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m">{getFloat(data?.comp_real, 0)}</RightAlign> }] : [],
                    ...(true) ? [{ name: 'peso_bruto', header: 'Peso B.', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="kg">{getFloat(data?.peso_bruto, 0)}</RightAlign> }] : [],
                    ...(true) ? [{ name: 'peso_liquido', header: 'Peso L.', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="kg">{getFloat(data?.peso_liquido, 0)}</RightAlign> }] : [],
                    ...(true) ? [{ name: 'diam_min', header: 'Diam. Min.', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="mm">{getFloat(data?.diam_min, 0)}</RightAlign> }] : [],
                    ...(true) ? [{ name: 'diam_max', header: 'Diam. Máx.', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} uniot="mm">{getFloat(data?.diam_max, 0)}</RightAlign> }] : [],
                    ...(true) ? [{ name: 'diam_avg', header: 'Diam. Médio', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="mm">{getFloat(data?.diam_avg, 0)}</RightAlign> }] : [],
                ],
                onSelect: async ({ data, rows, close }) => {
                    const _current = dataAPI.getData().rows.map(v => v?.id);
                    const _rows = rows.map(r => ({ ...r/* , [dataAPI.getPrimaryKey()]: `id_${uid(4)}`  */ })).filter(v => !_current.includes(v["id"]));
                    dataAPI.addRows(_rows);
                    dataAPI.setAction("edit", true);
                    dataAPI.update(true);
                },
                filters: { flote: { type: "any", width: 150, text: "Palete", autoFocus: true } }
            },

        });
        showModal();
    }




    const groups = [
        //{ name: 'name', header: 'Header', headerAlign: "center" }
    ]

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    /*     useEffect(() => {
            if (columnsRef.current.length > 0) {
                setColumns(columnsRef.current);
                columnsRef.current = [];
            }
        }, [dataAPI.updated]) */

    const loadData = async ({ signal, init = false } = {}) => {

        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, null);
            inputParameters.current = { ...paramsIn, isOpen: paramsIn.ativa == 1 ? true : false };
        }
        setFormDirty(false);
        let { filterValues, fieldValues } = fixRangeDates([], inputParameters.current?.filter);
        formFilter.setFieldsValue({ ...excludeObjectKeys(fieldValues, ["ordem_id"]) });
        dataAPI.setBaseFilters({ fordem_id: filterValues?.fordem_id });
        dataAPI.addFilters({ ...excludeObjectKeys(filterValues, ["ordem_id"]) }, true);
        dataAPI.setSort(dataAPI.getSort(), defaultSort);
        dataAPI.addParameters({ ...defaultParameters }, true);
        dataAPI.setAction("init", true);
        dataAPI.update(true);
        submitting.end();
    }

    const postProcess = async (dt, submitting) => { }


    const columns = [
        ...(true) ? [{ name: "nome", header: "Palete", defaultWidth: 110, userSelect: true, defaultlocked: true, headerAlign: "center", render: ({ data, cellProps }) => <Link cellProps={cellProps} onClick={() => onClickPalete("all", data)} value={data?.nome} /> }] : [],
        ...(true) ? [{ name: 'timestamp', header: 'Data', userSelect: true, defaultLocked: false, defaultWidth: 110, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.timestamp} format={DATETIME_FORMAT} /> }] : [],
        ...(true) ? [{ name: 'nbobines_real', header: 'Bobines', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} addonAfter={`/${data?.num_bobines}`}>{getFloat(data?.nbobines_real, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'nbobines_emendas', header: 'C/Emendas', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps}>{getFloat(data?.nbobines_emendas, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: "estado", header: "Estado", defaultWidth: 100, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <EstadoBobines id={data.id} nome={data.nome} artigos={json(data.artigo)} cellProps={cellProps} /> }] : [],
        ...(true) ? [{ name: 'largura', header: 'Largura', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <Largura id={data.id} nome={data.nome} artigos={json(data.artigo)} cellProps={cellProps} /> }] : [],
        ...(true) ? [{ name: 'core', header: 'Core', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <Core id={data.id} nome={data.nome} artigos={json(data.artigo)} cellProps={cellProps} /> }] : [],
        ...(true) ? [{ name: 'area_real', header: 'Área', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m&sup2;">{getFloat(data?.area_real, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'comp_real', header: 'Comp.', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m">{getFloat(data?.comp_real, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'peso_bruto', header: 'Peso B.', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="kg">{getFloat(data?.peso_bruto, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'peso_liquido', header: 'Peso L.', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="kg">{getFloat(data?.peso_liquido, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'diam_min', header: 'Diam. Min.', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="mm">{getFloat(data?.diam_min, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'diam_max', header: 'Diam. Máx.', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} uniot="mm">{getFloat(data?.diam_max, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'diam_avg', header: 'Diam. Médio', userSelect: true, defaultLocked: false, defaultWidth: 75, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="mm">{getFloat(data?.diam_avg, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: "cliente_nome", header: "Cliente", defaultWidth: 160, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign>{data?.cliente_nome}</LeftAlign> }] : [],
        ...(true) ? [{ name: "ofid", header: "Ordem", defaultWidth: 120, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign>{data?.ofid}</LeftAlign> }] : [],
        ...(true) ? [{ name: "artigo_cod", header: "Artigo", defaultWidth: 130, flex: 1, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign>{data?.artigo_cod}</LeftAlign> }] : [],
        ...(permission.isOk({ forInput: [!submitting.state, mode.datagrid.edit, inputParameters.current.isOpen], action: "delete" })) ? [{ name: 'bdelete', header: '', headerAlign: "center", userSelect: true, defaultLocked: false, width: 45, render: ({ data, rowIndex }) => <Delete onClick={() => onDelete(data, rowIndex)} /> }] : []
        // { name: 'baction', header: '', headerAlign: "center", userSelect: true, defaultlocked: false, width: 45, render: ({ data, rowIndex }) => <Actions data={data} rowIndex={rowIndex} onAction={(action) => onAction(action, data, rowIndex)} /> },
    ];

    const onFilterFinish = (type, values) => {
        //Required Filters
        // const _data = { start: values?.fdata?.startValue?.format(DATE_FORMAT), end: values?.fdata?.endValue?.format(DATE_FORMAT) };
        // const { errors, warnings, value, messages, ...status } = getStatus(schema().validate(_data, { abortEarly: false, messages: validateMessages, context: {} }));
        // if (errors > 0) {
        //     openNotification("error", 'top', "Notificação", messages.error);
        // } else {
        //     if (warnings > 0) {
        //         openNotification("warning", 'top', "Notificação", messages.warning);
        //     }
        //}
        switch (type) {
            case "filter":
                //remove empty values
                const vals = dataAPI.removeEmpty({ ...defaultFilters, ...values });
                const _values = {
                    ...vals,
                    flote: getFilterValue(vals?.flote, 'any'),
                    fdata: getFilterRangeValues(vals?.fdata?.formatted),
                    //fartigo_cod: getFilterValue(vals?.fartigo_cod, 'any'),
                    //fartigo_des: getFilterValue(vals?.fartigo_des, 'any'),
                    //fcliente: getFilterValue(vals?.fcliente, 'any'),
                    //fcod: getFilterValue(vals?.fcod, 'any'),
                    //fdes: getFilterValue(vals?.fdes, 'any'),
                    //f1: getFilterValue(vals?.f1, 'any'),
                    //f2: getFilterRangeValues(vals?.f2?.formatted)
                };
                dataAPI.addFilters(dataAPI.removeEmpty(_values));
                dataAPI.addParameters(defaultParameters);
                dataAPI.first();
                dataAPI.setAction("filter", true);
                dataAPI.update(true);
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onEditComplete = ({ value, columnId, rowIndex, data, ...rest }) => {
        //const index = dataAPI.getIndex(data);
        // const index = rowIndex;
        // if (index >= 0) {
        //     let _rows = [];
        //     if (columnId === "cliente_nome") {
        //         _rows = dataAPI.updateValues(index, columnId, { [columnId]: value?.BPCNAM_0, "cliente_cod": value?.BPCNUM_0 });
        //     } else if (columnId === "des") {
        //         _rows = dataAPI.updateValues(index, columnId, { [columnId]: value?.des, "artigo_id": value?.id, "cod": value?.cod });
        //     } else if (columnId === "lab_metodo") {
        //         _rows = dataAPI.updateValues(index, columnId, { ...!data?.designacao && { designacao: `${dayjs().format(DATE_FORMAT_NO_SEPARATOR)} ${value?.designacao}` }, "metodo_designacao": value?.designacao, "lab_metodo_id": value?.id, "cliente_nome": value?.cliente_nome, "des": value?.des, "owner": value?.owner });
        //     } else {
        //         _rows = dataAPI.updateValues(index, columnId, { [columnId]: value });
        //     }
        //     dataAPI.validateRows(rowSchema, {}, {}, _rows);
        // const { errors, warnings, fieldStatus, formStatus } = dataAPI.validateField(rowSchema, data[dataAPI.getPrimaryKey()], columnId, value, index, gridStatus);
        // setGridStatus({ errors, warnings, fieldStatus, formStatus });
        //}
    }

    const onSave = async (type) => {
        //return;
        const rows = dataAPI.dirtyRows().map(({ id, rowadded, rowvalid }) => ({ id, rowadded, rowvalid }));
        //const rows = dataAPI.dirtyRows();
        if (rows && rows.length > 0) {
            submitting.trigger();
            let response = null;
            try {
                const status = dataAPI.validateRows(rowSchema); //Validate all rows
                const msg = dataAPI.getMessages();
                //const msg = ["Error 1"];
                //msg.push("Error 2");
                //openNotification("error", "top", "Notificação", msg, 5, { width: "500px" });
                //if (status.errors > 0) {
                //    openNotification("error", "top", "Notificação", msg, 5, { width: "500px" });
                //}
                if (status.errors > 0) {
                    openNotification("error", "top", "Notificação", msg.error, 5, { width: "500px" });
                } else {
                    response = await fetchPost({ url: `${API_URL}/paletes/sql/`, parameters: { method: "AddPaletesStock", rows, ordem_id: inputParameters.current.id } });
                    if (response?.data?.status !== "error") {
                        dataAPI.update(true);
                        openNotification(response?.data?.status, 'top', "Notificação", response?.data?.title);
                    } else {
                        openNotification(response?.data?.status, 'top', "Notificação", response?.data?.title, null);
                    }
                }
            } catch (e) {
                console.log(e)
                openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
            } finally {
                submitting.end();
            };
        }
    }

    const onDelete = (data, rowIndex) => {
        Modal.confirm({
            content: <div>Tem a certeza que deseja eliminar a palete de stock <span style={{ fontWeight: 700 }}>{data?.nome}</span>?</div>, onOk: async () => {

                submitting.trigger();
                let response = null;
                try {
                    response = await fetchPost({ url: `${API_URL}/paletes/sql/`, parameters: { method: "DeletePaletesStock", rows: [{ ...data, rowdeleted: 1,rowadded:0 }], ordem_id: inputParameters.current.id } });
                    if (response.data.status !== "error") {
                        //const _rows = dataAPI.deleteRow({ [dataAPI.getPrimaryKey()]: data?.[dataAPI.getPrimaryKey()] }, [dataAPI.getPrimaryKey()]);
                        dataAPI.setAction("edit", true);
                        dataAPI.update(true);
                        openNotification(response.data.status, 'top', "Notificação", response.data.title);
                    } else {
                        openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
                    }
                } catch (e) {
                    console.log(e)
                    openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
                } finally {
                    submitting.end();
                };
            }
        });
    }

    const rowClassName = ({ data }) => {
        // if () {
        //     return tableCls.error;
        // }
    }
    const columnEditable = (v, { data, name }) => {
        if (["designacao", "lab_metodo", "status", "obs", "reference", "cliente_nome", "des"].includes(name) && (mode.datagrid.add && data?.rowadded === 1)) {
            return true;
        }
        if (["designacao", "status", "obs", "reference", "cliente_nome", "des"].includes(name) && (mode.datagrid.edit)) {
            return true;
        }
        return false;
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        if (dataAPI.getFieldStatus(data[dataAPI.getPrimaryKey()])?.[name]?.status === "error") {
            return tableCls.error;
        }
        if (["nws"].includes(name)) {
            return tableCls.cellPadding1;
        }
        // if (["designacao", "lab_metodo", "status", "obs", "reference", "cliente_nome", "des"].includes(name) && (mode.datagrid.add && data?.rowadded === 1)) {
        //     return tableCls.edit;
        // }
        // if (["designacao", "status", "obs", "reference", "cliente_nome", "des"].includes(name) && (mode.datagrid.edit)) {
        //     return tableCls.edit;
        // }
    };
    
    const onValuesChange = (changed, all) => {
        setFormDirty(true);
    }

    const onEditCancel = async () => {
        await loadData();
        return false;
    }

    const onCellAction = (data, column, key) => {
        if (key === "Enter" || key === "DoubleClick") {
            if (column.name === "obs") {
                setModalParameters({ content: "textarea", type: "drawer", width: 550, title: column.header, push: false, parameters: { value: data[column.name] } });
                showModal();
            }
        }
    }



    return (
        <YScroll>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            <Table
                dirty={formDirty}
                loading={submitting.state}
                idProperty={dataAPI.getPrimaryKey()}
                local={false}
                onRefresh={loadData}
                rowClassName={rowClassName}
                offsetHeight="150px"
                //groups={groups}
                sortable
                reorderColumns={false}
                showColumnMenuTool
                loadOnInit={false}
                pagination={false}
                //defaultLimit={20}
                //rowHeight={40}
                enableColumnAutosize={true}
                columns={columns}
                dataAPI={dataAPI}
                moreFilters={true}
                onCellAction={onCellAction}
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} auth={permission.auth} v={formFilter.getFieldsValue(true)} />,
                    moreFilters: { schema: moreFiltersSchema }
                }}
                editable={{
                    enabled: permission.isOk({ forInput: [!submitting.state, inputParameters.current.isOpen], action: "edit" }),
                    add: false,
                    /* onAdd: onAdd, onAddSave: onAddSave, */
                    onSave: () => onSave("update"), onCancel: onEditCancel,
                    modeKey: "datagrid", setMode, mode, //onEditComplete
                }}
                leftToolbar={<Space>
                    <Permissions permissions={permission} action="edit" forInput={[inputParameters.current?.isOpen, mode.datagrid.edit]}><Button onClick={onSelectPaletes}>Adicionar paletes de stock</Button></Permissions>
                </Space>}

            />
            {/* </Col>
                </Row>
            </FormContainer> */}
        </YScroll>
    );


};