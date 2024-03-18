import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { AutoComplete, Checkbox, DatePicker, Input, InputNumber, Select, Form, Space, Button, Tooltip, Switch, Modal, Dropdown } from 'antd';
import { useNavigate, useLocation } from "react-router-dom";
import { uid } from 'uid';
import { dayjsValue, getValue, isNullOrEmpty, useSubmitting, updateArrayWhere, deleteArrayElementWhere, maxOf } from 'utils';
import { CheckSquareOutlined, CloseOutlined, DeleteFilled, EditOutlined, MoreOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { columnPath, getAllNodes, getAllNodesMap, getCellFocus, getNodes, getSelectedNodes, refreshDataSource } from 'components/TableV4/TableV4';
import { useDataAPI, _fieldZodDescription, parseFilter } from 'utils/useDataAPIV4';
import { API_URL, ROOT_URL, DATETIME_FORMAT, BOBINE_ESTADOS, PALETE_SIZES, CONTENTORES_OPTIONS, MDF_SIZES, PLACACARTAO_SIZES, DESENROLAMENTO_OPTIONS } from 'config';
import { Action, Bool, EstadoBobine, MultiLine, PRIORIDADES_DESTINOS, Options, Value, useDestinosStyles, ActionButton } from 'components/TableV4/TableColumnsV4';
import { fetchPostV4 } from 'utils/fetch';
import { sortBy, prop, is, isEmpty, isNil, isNotNil } from 'ramda';
import { valueByPath, json, updateByPath, excludeObjectKeys } from 'utils/object';
import YScroll from 'components/YScroll';
import Portal from "components/portal";
import IconButton from "components/iconButton";
import Page, { Container as FormContainer, Field, Label, ClientesLookupField, Lookup, ButtonChooser, SelectorPopup, EstadoBobineLookup, SelectorComponentPopup } from 'components/FormFields/FormsV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { CgCloseO } from 'react-icons/cg';
import { zGroupIntervalNumber, zGroupRangeNumber } from 'utils/schemaZodRules';
import { z } from "zod";
import TextArea from 'antd/es/input/TextArea';
import useModalApi from "utils/useModalApi";
import { rules, setValidationGroups, validate, validateList, validateRows } from 'utils/useValidation';
import TableGridEdit from 'components/TableV4/TableGridEdit';
import useModeApi from 'utils/useModeApi';
import { createUseStyles } from 'react-jss';
import { noValue, minOf, unique, uniqueValues, countWhere } from 'utils';
import loadInitV3 from 'utils/loadInitV3';
import { usePermission } from 'utils/usePermission';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';
import { styled } from 'styled-components';
import { AppContext } from 'app';
import SvgSchema from './SvgSchemaV3';
import { AntdCheckboxEditor, MultiEditor } from 'components/TableV4/TableEditorsV4';
import { openNotification } from 'components/openNotification';
import PaletizacoesList from './PaletizacoesList';



const imgGroup01 = `${ROOT_URL}/static/img/group01.png`;
const imgGroup02 = `${ROOT_URL}/static/img/group02.png`;
const imgGroup03 = `${ROOT_URL}/static/img/group03.png`;
const imgGroup04 = `${ROOT_URL}/static/img/group04.png`;
const imgGroup05 = `${ROOT_URL}/static/img/group05.png`;
const imgGroup06 = `${ROOT_URL}/static/img/group06.png`;

const imgItem01 = `${ROOT_URL}/static/img/item01.png`;
const imgItem02 = `${ROOT_URL}/static/img/item02.png`;
const imgItem03 = `${ROOT_URL}/static/img/item03.png`;
const imgItem04 = `${ROOT_URL}/static/img/item04.png`;
const imgItem05 = `${ROOT_URL}/static/img/item05.png`;
const imgItem06 = `${ROOT_URL}/static/img/item06.png`;
const imgItem07 = `${ROOT_URL}/static/img/item07.png`;

const gutterWidth = 5;

const title = "Esquema de Embalamento";
const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
    return (<>{visible && <ToolbarTitleV3 disabled={loading} id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
        {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
    />}</>);
}
const useTableStyles = createUseStyles({});

export const postProcess = async (dt, { validate = false }) => { return dt; };
export const schema = z.object({});
export const validationGroups = (dataAPI) => setValidationGroups({});


const StyledButton = styled(Button)`
    height:80px !important;
    width:100px !important;
    .txt{
        height:20px;
        line-height:1;
        text-wrap:wrap;
    }
`;

const ToolbarItems = ({ onClick, data, edit = false, associate = false, onSave, onCancel, onAssociate, hasId = false, isDirty = false, schemaChanged, submitting, openNotification }) => {
    const [form] = Form.useForm();
    useEffect(() => {
        form.setFieldsValue({ paletizacao: { ...data } });
    }, [data?.tstamp]);

    const onSelectionChanged = async (row) => {
        if (schemaChanged && typeof schemaChanged == "function") {
            await schemaChanged(row);
        }
    }

    const isRowSelectable = (params) => {
        if (data?.artigo_cod != params.data?.artigo_cod || data?.cliente_cod != params.data?.cliente_cod) {
            return false;
        }
        return true;
    }

    return (<>
        {(associate || edit) && <Row gutterWidth={2} justify='center' style={{ margin: "0px 5px 5px 5px", overflowX: "auto", backgroundColor: "#fafafa", padding: "5px", border: "solid 1px #d9d9d9", borderRadius: "5px" }} wrap='nowrap'>
            {associate && <Col>
                <FormContainer fluid form={form} forInput={true} wrapForm={true} wrapFormItem={true} style={{}} /* onValuesChange={onValuesChange} validation={validation} */>
                    <Row style={{}} gutterWidth={gutterWidth}>
                        <Col width={300}>
                            <Field label={{ enabled: true, text: "Esquema" }} name="paletizacao"><SelectorComponentPopup popupProps={{ type: "drawer", width: "95%", title: "Esquemas de Embalamento" }} allowClear={false} keyField="id" textField="designacao" component={<PaletizacoesList isRowSelectable={isRowSelectable} onSelectionChanged={onSelectionChanged} edit={edit} select={true} header={false} />} /></Field>
                        </Col>
                        <Col xs="content" style={{ alignSelf: "end", paddingBottom: "5px" }}>
                            {isDirty && <Button disabled={submitting} onClick={onAssociate} type="primary" icon={<EditOutlined />}>Associar esquema</Button>}
                        </Col>
                    </Row>
                </FormContainer>
            </Col>}

            {edit && <>
                {isDirty && <Col xs="content" style={{ alignSelf: "center" }}>
                    {hasId && <Space>
                        <Button disabled={submitting} onClick={onCancel} type="default" icon={<EditOutlined />}>Cancelar</Button>
                        <Dropdown.Button disabled={submitting} trigger={["click"]} menu={{ items: [{ key: "new", label: "Guardar como novo esquema" }], onClick: onSave }} onClick={() => onSave({ key: "update" })} type="primary" icon={<MoreOutlined />}>Guardar</Dropdown.Button>
                    </Space>}

                    {!hasId && <Button disabled={submitting} onClick={onSave} type="primary" icon={<EditOutlined />}>Guardar</Button>}
                </Col>}
                <Col></Col>
                <>
                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("g01")} icon={<img src={imgGroup01} alt="Icon" />} /></Col>
                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("g02")} icon={<img src={imgGroup02} alt="Icon" />} /></Col>
                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("g05")} icon={<img src={imgGroup05} alt="Icon" />} /></Col>
                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("g03")} icon={<img src={imgGroup03} alt="Icon" />} /></Col>
                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("g04")} icon={<img src={imgGroup04} alt="Icon" />} /></Col>
                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("g06")} icon={<img src={imgGroup06} alt="Icon" />} /></Col>

                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("1")}><img src={imgItem01} alt="Icon" /><div className='txt'>Palete</div></StyledButton></Col>
                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("2")}><img src={imgItem02} alt="Icon" /><div className='txt'>Bobines</div></StyledButton></Col>
                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("3")}><img src={imgItem03} alt="Icon" /><div className='txt'>Placa de Cartão</div></StyledButton></Col>
                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("4")}><img src={imgItem04} alt="Icon" /><div className='txt'>Placa MDF</div></StyledButton></Col>
                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("5")}><img src={imgItem05} alt="Icon" /><div className='txt'>Placa de Plástico</div></StyledButton></Col>
                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("6")}><img src={imgItem06} alt="Icon" /><div className='txt'>Cantoneira</div></StyledButton></Col>
                    <Col xs="content"><StyledButton disabled={submitting} onClick={() => onClick("7")}><img src={imgItem07} alt="Icon" /><div className='txt'>Cut Here!</div></StyledButton></Col>
                </>
            </>}
        </Row>
        }
    </>
    );
}

const loadPaletizacaoLookup = async (p) => {
    const { data: { rows } } = await fetchPostV4({ url: `${API_URL}/paletes/sql/`, pagination: { limit: 1 }, filter: { ...p }, parameters: { method: "PaletizacaoLookup" } });
    return rows;
}

const schemaItems = z.object({
    item_id: z.coerce.number(),
    value: z.any()
}).refine((v) => {
    const errors = [];
    if ((!is(Number, v.value) && (v.item_id == 2))) {
        errors.push({ path: ['value'], message: 'O nº de bobines tem de estar preenchido!' });
    }
    if ((is(Number, v.value) && v.value < 1 && (v.item_id == 2))) {
        errors.push({ path: ['value'], message: 'O nº de bobines tem de ser maior que zero!' });
    }
    if ((isNullOrEmpty(v.value) && (v.item_id == 1))) {
        errors.push({ path: ['value'], message: 'O Tamanho da palete tem de ser preenchido!' });
    }
    if ((isNullOrEmpty(v.value) && (v.item_id == 3))) {
        errors.push({ path: ['value'], message: 'O Tamanho da placa de cartão tem de ser preenchido!' });
    }
    if ((isNullOrEmpty(v.value) && (v.item_id == 4))) {
        errors.push({ path: ['value'], message: 'O Tamanho do MDF tem de ser preenchido!' });
    }
    if (errors.length > 0) {
        throw new z.ZodError(errors);
    }
    return true;
}, {});

const schemaData = z.object({
    f: z.any(),
    v: z.any(),
    d: z.any()
}).refine((v) => {
    const errors = [];
    if (["artigo_cod", "cliente_nome", "designacao"].includes(v.f)) {
        if (isNullOrEmpty(v.v)) {
            errors.push({ path: ['v'], message: `O campo ${v.d} tem de estar preenchido!` });
        }
    } else if (v.f == "palete_maxaltura") {
        if (!is(Number, v.v)) {
            errors.push({ path: ['v'], message: `A ${v.d} tem de estar preenchida!` });
        } else if (v.v < 0) {
            errors.push({ path: ['v'], message: `A ${v.d} tem de ser maior que zero!` });
        }
    } else if (["netiquetas_lote", "netiquetas_final", "netiquetas_bobine", "folha_identificativa"].includes(v.f)) {
        if (!is(Number, v.v)) {
            errors.push({ path: ['v'], message: `A ${v.d} tem de estar preenchida!` });
        } else if (v.v < 0) {
            errors.push({ path: ['v'], message: `A ${v.d} tem de ser maior que um!` });
        }
    }
    if (errors.length > 0) {
        throw new z.ZodError(errors);
    }
    return true;
}, {});


const Columns = styled.div`
    display:grid;
    grid-template-columns: ${(props) => props.$template ? props.$template : "350px minmax(500px,1fr) 550px"};
    column-gap: 10px;
    @media (max-width: 1750px) {
        grid-template-columns: repeat(2, minmax(300px, 1fr)); /* Adjust for two columns */
    }
    @media (max-width: 1450px) {
        grid-template-columns: 1fr; /* Adjust for two columns */
    }
`;

export default ({ noid = true, initialSchemaBobines, header = true, print = false, edit = false, select = { enabled: false }, onSelectLevel, editItems = [], associate = false, loadOnInit = true, defaultFilters = {}, defaultSort = [], style, ...props }) => {
    const classes = useTableStyles();
    const location = useLocation();
    const navigate = useNavigate();
    const permission = usePermission({ permissions: props?.permissions });
    const { openNotification } = useContext(AppContext);
    const submitting = useSubmitting(true);
    const gridRefItems = useRef(); //not required
    const gridRefData = useRef(); //not required
    const modalApi = useModalApi(); //not Required;
    const modeApi = useModeApi(); //not Required;
    const [isDirty, setIsDirty] = useState(false);
    const baseFilters = {};
    const dataAPIItems = useDataAPI({ payload: { primaryKey: "id", pagination: { enabled: false, limit: 500 } } });
    const dataAPIData = useDataAPI({ payload: { primaryKey: "id", pagination: { enabled: false, limit: 500 } } });
    const [validation1, setValidation1] = useState({});
    const [validation2, setValidation2] = useState({});
    const [inputParameters, setInputParameters] = useState();
    const _inputParameters = useRef(loadInitV3({}, {}, { ...props?.parameters }, { ...location?.state }));


    const loadData = async ({ _paletizacao_id, signal, init = false } = {}) => {
        let _data;
        let _id;
        if (_paletizacao_id) {
            _data = await loadPaletizacaoLookup({ paletizacao_id: `==${_paletizacao_id}` });
            _data = Array.isArray(_data) ? _data[0] : {};
            _id = _paletizacao_id;
        } else if (_inputParameters.current?.id) {
            _data = await loadPaletizacaoLookup({ paletizacao_id: `==${_inputParameters.current?.id}` });
            _data = Array.isArray(_data) ? _data[0] : {};
            _id = _inputParameters.current?.id;
        } else if (_inputParameters.current?.of_id) {
            _data = await loadPaletizacaoLookup({ of_id: `==${_inputParameters.current?.of_id}` });
            _data = Array.isArray(_data) ? json(json(_data[0]?.paletizacao)) : {};
            _id = _inputParameters.current?.of_id;
        }
        setInputParameters({ tstamp: Date.now(), id: _data?.id, contentor_id: _data?.contentor_id, designacao: _data?.designacao, versao: _data?.versao, artigo_cod: _inputParameters.current?.artigo_cod, cliente_cod: _inputParameters.current?.cliente_cod });
        if (_id) {
            const _initSchemaBobines = [...initialSchemaBobines || []].reverse();
            let _details = json(_data?.details, []);
            _details = _details.map(v => {
                if (v?.item_id == 2 && v?.item_numbobines) {
                    const _n = (_initSchemaBobines.length > 0) ? _initSchemaBobines.pop() : v.item_numbobines;
                    return { ...v, value: _n, item_numbobines: _n };
                } else if (v?.item_id == 1 && v?.item_size) {
                    return { ...v, value: v.item_size };
                } else if (v?.item_id == 1 && v?.item_paletesize) {
                    return { ...v, value: v.item_paletesize, item_size: v.item_paletesize };
                } else if (v?.item_id == 3 && v?.item_size) {
                    return { ...v, value: v.item_size };
                } else if (v?.item_id == 4 && v?.item_size) {
                    return { ...v, value: v.item_size };
                }
                return { ...v, value: null };
            });
            _details.sort((a, b) => b.item_order - a.item_order);
            dataAPIItems.setRows(_details);
            const _rows = [
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "designacao", d: "Designação", v: noValue(_data?.["designacao"], null) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "versao", d: "Versão", v: noValue(_data?.["versao"], null) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "cliente_nome", d: "Cliente", v: noValue(_data?.["cliente_nome"], null), cod: noValue(_data?.["cliente_cod"], null) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "artigo_cod", d: "Artigo", v: noValue(_data?.["artigo_cod"], null), des: noValue(_data?.["cliente_des"], null) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "contentor_id", d: "Contentor", v: noValue(_data?.["contentor_id"], CONTENTORES_OPTIONS[0].value) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "npaletes", d: "Paletes/Contentor", v: noValue(_data?.["npaletes"], 0) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "palete_maxaltura", d: "Altura máxima", v: noValue(_data?.["palete_maxaltura"], 2.55) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "netiquetas_lote", d: "Etiquetas por lote", v: noValue(_data?.["netiquetas_lote"], 2) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "netiquetas_final", d: "Número de etiquetas final", v: noValue(_data?.["netiquetas_final"], 1) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "netiquetas_bobine", d: "Número de etiquetas por bobine", v: noValue(_data?.["netiquetas_bobine"], 1) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "folha_identificativa", d: "Folha identificativa", v: noValue(_data?.["folha_identificativa"], 1) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "filmeestiravel_bobines", d: "Filme estirável", v: noValue(_data?.["filmeestiravel_bobines"], 2) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "filmeestiravel_exterior", d: "Filme estirável exterior", v: noValue(_data?.["filmeestiravel_exterior"], 1) },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "sentido_desenrolamento", d: "Sentido de Desenrolamento", v: noValue(_data?.["sentido_desenrolamento"], DESENROLAMENTO_OPTIONS[0].value) }
            ];
            dataAPIData.setRows(_rows);
        } else {
            const _rows = [
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "designacao", d: "Designação", v: null },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "versao", d: "Versão", v: null },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "cliente_nome", d: "Cliente", v: null },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "artigo_cod", d: "Artigo", v: null },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "contentor_id", d: "Contentor", v: CONTENTORES_OPTIONS[0].value },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "npaletes", d: "Paletes/Contentor", v: 0 },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "palete_maxaltura", d: "Altura máxima", v: 2.55 },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "netiquetas_lote", d: "Etiquetas por lote", v: 2 },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "netiquetas_final", d: "Número de etiquetas final", v: 1 },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "netiquetas_bobine", d: "Número de etiquetas por bobine", v: 1 },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "folha_identificativa", d: "Folha identificativa", v: 1 },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "filmeestiravel_bobines", d: "Filme estirável", v: 2 },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "filmeestiravel_exterior", d: "Filme estirável exterior", v: 1 },
                { [dataAPIData.getPrimaryKey()]: uid(6), f: "sentido_desenrolamento", d: "Sentido de Desenrolamento", v: DESENROLAMENTO_OPTIONS[0].value }
            ];
            dataAPIData.setRows(_rows);
            dataAPIItems.setRows([]);
        }
        submitting.end();
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const onBeforeCellEditRequest = async (data, colDef, path, newValue, event) => {
        /**
         * Método que permite antes do "commit", fazer pequenas alterações aos dados.
         * No caso dessas alterações afetarem os valores de outras colunas da "Grid", é necessário desablitar o TabOnNextCell da coluna,
         * pois o próximo campo entra em edição antes deste método (isto é um Workaround!!!!!), para isso na definição da coluna colocar:
         * suppressKeyboardEvent: (params)=>disableTabOnNextCell(params)
         */

        const field = columnPath(event.column);
        if (field == "value" && data.item_id == 1) {
            data = updateByPath(data, "item_size", newValue);
            data = updateByPath(data, "item_paletesize", newValue);
            data = updateByPath(data, "value", newValue);
            return data;
        }
        if (field == "value" && [3, 4].includes(data.item_id)) {
            data = updateByPath(data, "item_size", newValue);
            data = updateByPath(data, "value", newValue);
            return data;
        }
        if (field == "value" && data.item_id == 2) {
            data = updateByPath(data, "value", newValue);
            data = updateByPath(data, "item_numbobines", newValue);
            return data;
        }
        return null;
    }
    const onAfterCellEditRequest = async (data, colDef, path, newValue, event, result) => {
        dataAPIItems.setRows(getAllNodes(event.api));
        setIsDirty(true);
    }

    const onBeforeCellEditRequest2 = async (data, colDef, path, newValue, event) => {
        /**
         * Método que permite antes do "commit", fazer pequenas alterações aos dados.
         * No caso dessas alterações afetarem os valores de outras colunas da "Grid", é necessário desablitar o TabOnNextCell da coluna,
         * pois o próximo campo entra em edição antes deste método (isto é um Workaround!!!!!), para isso na definição da coluna colocar:
         * suppressKeyboardEvent: (params)=>disableTabOnNextCell(params)
         */
        const field = columnPath(event.column);
        if (data.f == "cliente_nome") {
            data = updateByPath(data, "cod", newValue?.BPCNUM_0);
            data = updateByPath(data, "v", newValue?.BPCNAM_0);
            return data;
        }
        if (data.f == "artigo_cod") {
            data = updateByPath(data, "v", newValue?.cod);
            data = updateByPath(data, "des", newValue?.des);
            return data;
        }
        return null;
    }
    const onAfterCellEditRequest2 = async (data, colDef, path, newValue, event, result) => {
        dataAPIData.setRows(getAllNodes(event.api));
        setIsDirty(true);
    }

    const editorType = (col, data) => {
        switch (data.item_id) {
            case 1: return { type: "AntdSelectEditor", params: { options: PALETE_SIZES } };
            case 2: return { type: "AntdInputNumberEditor", params: { min: 1, max: 300 } };
            case 3: return { type: "AntdSelectEditor", params: { options: PLACACARTAO_SIZES } };
            case 4: return { type: "AntdSelectEditor", params: { options: MDF_SIZES } };
        }
        return null;
    }
    const editorType2 = (col, data) => {
        switch (data.f) {
            case "designacao": return { type: "AntdInputEditor" };
            case "cliente_nome": return { type: "ClientesLookupEditor" };
            case "artigo_cod": return { type: "ArtigosLookupEditor" };
            case "contentor_id": return { type: "AntdSelectEditor", params: { options: CONTENTORES_OPTIONS } };
            case "palete_maxaltura": return { type: "AntdInputNumberEditor", params: { min: 1, max: 3 } };
            case "npaletes": return { type: "AntdInputNumberEditor", params: { min: 0, max: 60 } };
            case "filmeestiravel_exterior": return { type: "AntdCheckboxEditor" };
            case "filmeestiravel_bobines": return { type: "AntdCheckboxEditor" };
            case "sentido_desenrolamento": return { type: "AntdSelectEditor", params: { options: DESENROLAMENTO_OPTIONS } };
            default: return { type: "AntdInputNumberEditor", params: { min: 1, max: 5 } };
        }
    }

    const _validationGroups = useMemo(() => validationGroups(dataAPIItems), []);
    const cellParams1 = useCallback((params = {}, editorParams = {}, headerParams = {}) => {
        /**
         * editColumnControl, transfere para cada elemento entrar em modo de edição, em vez de ser a grid, para isso tem de ser true, e na grid suppressClickEdit=true  
         */
        return {
            cellRendererParams: { validation: validation1, modeApi, modalApi, validationGroups: _validationGroups, ...params },
            cellEditorParams: { ...editorParams },
            headerComponentParams: { ...headerParams }
        };
    }, [validation1, modeApi?.isOnMode()]);
    const cellParams2 = useCallback((params = {}, editorParams = {}, headerParams = {}) => {
        /**
         * editColumnControl, transfere para cada elemento entrar em modo de edição, em vez de ser a grid, para isso tem de ser true, e na grid suppressClickEdit=true  
         */
        return {
            cellRendererParams: { validation: validation2, modeApi, modalApi, validationGroups: _validationGroups, ...params },
            cellEditorParams: { ...editorParams },
            headerComponentParams: { ...headerParams }
        };
    }, [validation2, modeApi?.isOnMode()]);

    const isCellEditable = useCallback((params) => {
        if (edit) {
            if (params.column.colId == "v" && (!["versao"].includes(params.data.f))) {
                return true;
            }
            if (params.column.colId == "cintas" && (params.data.item_id == 1)) {
                return true;
            }
            if (params.column.colId == "value" && [1, 2, 3, 4].includes(params.data.item_id)) {
                return true;
            }
        } else if (editItems && Array.isArray(editItems) && editItems.length > 0) {
            if (params.column.colId == "value" && editItems.includes(params.data.item_id)) {
                return true;
            }
        }
        return false;
    }, [modeApi?.isOnMode()]);

    const columnDefs = useMemo(() => {
        return {
            cols: [
                { field: 'id', hide: true },
                { field: 'item_id', hide: true },
                { field: 'item_order', hide: true },
                { field: 'item_des', rowDrag: edit, resizable: false, headerName: 'Item', ...cellParams1(), width: 165, flex: 1, cellRenderer: (params) => <Value bold params={params} /> },
                { field: 'value', headerName: 'Valor', resizable: false, width: 100, ...cellParams1(null, { editorType }), type: "editableColumn", cellEditor: MultiEditor, cellRenderer: (params) => <Value params={params} /> },
                { field: 'cintas', headerName: 'Cintas', resizable: false, width: 60, ...cellParams1(null, {}), type: "editableColumn", cellEditor: AntdCheckboxEditor, cellRenderer: (params) => <Bool params={params} /> },
                ...edit ? [{ colId: 'action', width: 40, resizable: false, type: "actionOnEditColumn", cellRenderer: (params) => <ActionButton icon={<CloseOutlined />} params={params} onClick={() => onDelItem(params.data, params.rowIndex)} /> }] : []
                //{ field: 'num_bobines', headerName: 'Bobines', ...cellParams(), width: 100, cellRenderer: (params) => <Value params={params} /> },
                //{ field: 'palete_size', headerName: 'Palete', ...cellParams(), width: 100, cellRenderer: (params) => <Value params={params} /> },
            ], timestamp: new Date()
        };
    }, [validation1, modeApi?.isOnMode(), dataAPIItems.getTimeStamp()]);

    const columnDefsData = useMemo(() => {
        return {
            cols: [
                { field: 'id', hide: true },
                { field: 'f', hide: true },
                { field: 'd', headerName: '', ...cellParams2(), width: 165, flex: 1, cellRenderer: (params) => <Value bold params={params} /> },
                { field: 'v', headerName: 'Valor', minWidth: 200, flex: 1, ...cellParams2(null, { editorType: editorType2 }), type: "editableColumn", cellEditor: MultiEditor, cellRenderer: (params) => <Value params={params} /> }
            ], timestamp: new Date()
        };
    }, [validation2, modeApi?.isOnMode()]);

    const filters = useMemo(() => ({
        toolbar: [],
        more: [/* "@columns" */],
        no: [...Object.keys(baseFilters), "action"]
    }), []);

    const rowClassRules = useMemo(() => {
        return {};
    }, []);

    const onAddItem = (item) => {
        const _rows = getAllNodes(gridRefItems.current.api);

        const _reorder = (_r) => _r.map((v, i) => ({ ...v, item_order: _r.length - i }));

        switch (item) {
            case "1":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 1, item_des: "Palete", item_order: 0, value: PALETE_SIZES[0].value, item_paletesize: PALETE_SIZES[0].value, item_size: PALETE_SIZES[0].value });
                break;
            case "2":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null, item_numbobines: null });
                break;
            case "3":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 3, item_des: "Placa de Cartão", item_order: 0, value: PLACACARTAO_SIZES[0].value, item_size: PLACACARTAO_SIZES[0].value });
                break;
            case "4":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 4, item_des: "Placa MDF", item_order: 0, value: MDF_SIZES[0].value, item_size: MDF_SIZES[0].value });
                break;
            case "5":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 5, item_des: "Placa de Plástico", item_order: 0, value: null });
                break;
            case "6":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                break;
            case "7":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 7, item_des: "Etiqueta Cut Here", item_order: 0, value: null });
                break;
            case "g01":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 1, item_des: "Palete", item_order: 0, value: PALETE_SIZES[0].value, item_paletesize: PALETE_SIZES[0].value, item_size: PALETE_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 3, item_des: "Placa de Cartão", item_order: 0, value: PLACACARTAO_SIZES[0].value, item_size: PLACACARTAO_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null, item_numbobines: null });
                break;
            case "g02":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 1, item_des: "Palete", item_order: 0, value: PALETE_SIZES[0].value, item_paletesize: PALETE_SIZES[0].value, item_size: PALETE_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 3, item_des: "Placa de Cartão", item_order: 0, value: PLACACARTAO_SIZES[0].value, item_size: PLACACARTAO_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null, item_numbobines: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 5, item_des: "Placa de Plástico", item_order: 0, value: null });
                break;
            case "g05":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 4, item_des: "Placa MDF", item_order: 0, value: MDF_SIZES[0].value, item_size: MDF_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 1, item_des: "Palete", item_order: 0, value: PALETE_SIZES[0].value, item_paletesize: PALETE_SIZES[0].value, item_size: PALETE_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 3, item_des: "Placa de Cartão", item_order: 0, value: PLACACARTAO_SIZES[0].value, item_size: PLACACARTAO_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null, item_numbobines: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 5, item_des: "Placa de Plástico", item_order: 0, value: null });
                break;
            case "g03":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 1, item_des: "Palete", item_order: 0, value: PALETE_SIZES[0].value, item_paletesize: PALETE_SIZES[0].value, item_size: PALETE_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 3, item_des: "Placa de Cartão", item_order: 0, value: PLACACARTAO_SIZES[0].value, item_size: PLACACARTAO_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null, item_numbobines: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                break;
            case "g04":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 7, item_des: "Etiqueta Cut Here", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null, item_numbobines: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                break;
            case "g06":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 7, item_des: "Etiqueta Cut Here", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null, item_numbobines: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 5, item_des: "Placa de Plástico", item_order: 0, value: null });
                break;
        }
        dataAPIItems.setRows(_reorder(_rows));
        setIsDirty(true);
    }
    const onDelItem = (data, index) => {
        dataAPIItems.deleteRowByIndex(index);
        setIsDirty(true);
    }
    const onRowDragEnd = useCallback((e) => {
        const _rows = getAllNodesMap(e.api, (n, i) => ({ ...n, item_order: dataAPIItems.getLength() - i }));
        dataAPIItems.setRows([..._rows]);
        setIsDirty(true);
    }, []);

    const aditionalData = useMemo(() => {
        if (dataAPIData?.getData()?.rows) {
            return dataAPIData.getData().rows.reduce((acc, obj) => {
                acc[obj.f] = obj.v;
                return acc;
            }, {});
        }
        return null;
    }, [dataAPIData.getTimeStamp()]);

    const onSave = async ({ key }) => {
        submitting.trigger();
        const _items = getAllNodes(gridRefItems.current.api);
        const _data = getAllNodes(gridRefData.current.api);

        const r1 = await validateRows(_items, schemaItems, dataAPIItems.getPrimaryKey(), { passthrough: false });
        r1.onValidationFail((p) => {
            setValidation1(prev => ({ ...prev, ...p.alerts.error }));
        });
        r1.onValidationSuccess((p) => {
            setValidation1(prev => ({ ...prev, ...p.alerts.error }));
        });

        const r2 = await validateRows(_data, schemaData, dataAPIData.getPrimaryKey(), { passthrough: false });
        r2.onValidationFail((p) => {
            setValidation2(prev => ({ ...prev, ...p.alerts.error }));
        });
        r2.onValidationSuccess((p) => {
            setValidation2(prev => ({ ...prev, ...p.alerts.error }));
        });

        if (r1.valid == true && r2.valid == true) {

            let _paletes_sobrepostas = countWhere(_items, (v) => v.item_id == 1);
            _paletes_sobrepostas = _paletes_sobrepostas > 1 ? _paletes_sobrepostas - 1 : 0;
            let _cintas_palete = _paletes_sobrepostas * 2;
            const _ncintas = countWhere(_items, (v) => v.cintas == 1) * 2;

            if (!_items.some(v => v.item_id == 2)) {
                openNotification("error", "top", "Notificação", "O esquema de embalamento não é válido!");
                submitting.end();
                return false;
            }
            const result = await dataAPIItems.safePost(`${API_URL}/ordensfabrico/sql/`, "SavePaletizacaoV2", {
                parameters: {
                    items: _items.map(v => {
                        return {
                            ...excludeObjectKeys(v, ["rowvalid", "rowadded", "value",
                                v.item_id !== 2 ? "item_numbobines" : null,
                                v.item_id !== 1 ? "item_paletesize" : null,
                                v.item_id !== 1 ? "item_cintas" : null,
                                ![1, 3, 4].includes(v.item_id) ? "item_size" : null
                            ])
                        };
                    }),
                    data: {
                        ...key == "update" && { id: _inputParameters.current?.id },
                        paletes_sobrepostas: _paletes_sobrepostas,
                        ncintas: _ncintas,
                        cintas_palete: _cintas_palete,
                        cintas: _cintas_palete > 0 ? 1 : 0,
                        ..._data.reduce((acc, obj) => {
                            acc[obj.f] = obj.v;
                            if (obj.f == "cliente_nome") {
                                acc["cliente_cod"] = obj.cod;
                            }
                            if (obj.f == "artigo_cod") {
                                acc["artigo_des"] = obj.des;
                            }
                            return acc;
                        }, {})
                    }
                }
            });
            result.onSuccess(async (p) => {
                _inputParameters.current.id = p.response.id;
                setIsDirty(false);
                await loadData();
                if (props?.parentApi) {
                    refreshDataSource(props.parentApi);
                }
            });
            result.onFail((p) => { });
            ////setFormStatus(result);
            submitting.end();
            return result.success;
        }
        submitting.end();
    }

    const onAssociate = async () => {
        submitting.trigger();
        const result = await dataAPIItems.safePost(`${API_URL}/ordensfabrico/sql/`, "AssociatePaletizacao", {
            parameters: {
                paletizacao_id: inputParameters?.id,
                of_id: _inputParameters.current?.of_id,
                draft_id: _inputParameters.current?.draft_id,
                palete_id: _inputParameters.current?.palete_id
            }
        });
        result.onSuccess(async (p) => {
            if (props?.onAssociateSuccess && typeof props?.onAssociateSuccess == "function") {
                props.onAssociateSuccess({
                    paletizacao_id: inputParameters?.id,
                    of_id: _inputParameters.current?.of_id,
                    draft_id: _inputParameters.current?.draft_id,
                    palete_id: _inputParameters.current?.palete_id
                });
            }
            setIsDirty(false);
        });
        result.onFail((p) => { });
        submitting.end();
        return result.success;
    }

    const _header = useMemo(() => {
        if (!isNullOrEmpty(props?.setTitle) || !header) {
            return false;
        }
        return true;
    }, [props?.setTitle, header]);

    const schemaChanged = async (row) => {
        await loadData({ _paletizacao_id: row.id });
        setIsDirty(true);
    }
    const onCancel = async () => {
        await loadData();
        setIsDirty(false);
    }

    const _edit = useMemo(() => {
        return (edit || (Array.isArray(editItems) && editItems?.length > 0));
    }, [edit, editItems?.length]);

    return (
        <Page.Ready ready={permission?.isReady}>
            <TitleForm visible={_header} loading={submitting.state} auth={permission.auth} level={location?.state?.level} title={props?.title ? props.title : title} subTitle={props?.subTitle ? props.subTitle : subTitle} />
            <ToolbarItems
                openNotification={openNotification}
                schemaChanged={schemaChanged}
                data={inputParameters}
                associate={permission.isOk({ item: "paletizacao", action: "associate", forInput: [associate] })}
                edit={permission.isOk({ item: "paletizacao", action: "admin", forInput: [edit] })}
                submitting={submitting.state}
                hasId={_inputParameters.current?.id ? true : false}
                onClick={onAddItem}
                isDirty={isDirty}
                onSave={onSave}
                onCancel={onCancel}
                onAssociate={onAssociate}
            />
            <Columns $template={_edit ? "350px minmax(500px,1fr) 650px" : "minmax(300px,1fr) 650px"}>
                {_edit && <>
                    <div>
                        <TableGridEdit
                            local
                            loading={submitting.state}
                            domLayout={'autoHeight'}
                            style={{ height: "auto" }}
                            gridRef={gridRefItems}
                            singleClickEdit={true}
                            onAfterCellEditRequest={onAfterCellEditRequest}
                            onBeforeCellEditRequest={onBeforeCellEditRequest}
                            isCellEditable={isCellEditable}
                            showTopToolbar={true}
                            topToolbar={{ showSettings: false }}
                            columnDefs={columnDefs}
                            filters={null}
                            {...edit && { rowDragManaged: true, rowDragMultiRow: true, onRowDragEnd: onRowDragEnd, rowSelection: 'multiple' }}
                            dataAPI={dataAPIItems}
                            modeApi={modeApi}
                            modeOptions={{ enabled: true, showControls: false, mode: modeApi.EDIT, allowEdit: true }}
                        />
                    </div>
                </>}
                <div><SvgSchema select={select} onSelect={onSelectLevel} timestamp={dataAPIItems.getTimeStamp() + dataAPIData.getTimeStamp()} data={{ data: aditionalData, details: dataAPIItems.getData().rows }} /></div>
                <div>
                    <TableGridEdit
                        local
                        loading={submitting.state}
                        domLayout={'autoHeight'}
                        style={{ height: "auto" }}
                        gridRef={gridRefData}
                        singleClickEdit={true}
                        showTopToolbar={true}
                        topToolbar={{ showSettings: false }}
                        onBeforeCellEditRequest={onBeforeCellEditRequest2}
                        onAfterCellEditRequest={onAfterCellEditRequest2}
                        isCellEditable={isCellEditable}
                        columnDefs={columnDefsData}
                        filters={null}
                        dataAPI={dataAPIData}
                        modeApi={modeApi}
                        modeOptions={edit ? { enabled: true, showControls: false, mode: modeApi.EDIT, allowEdit: true } : { enabled: false, showControls: false, allowEdit: false }}
                    />
                </div>
            </Columns>
        </Page.Ready>
    );
}

