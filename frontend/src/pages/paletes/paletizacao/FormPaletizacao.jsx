import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { AutoComplete, Checkbox, DatePicker, Input, InputNumber, Select, Form, Space, Button, Tooltip, Switch, Modal } from 'antd';
import { useNavigate, useLocation } from "react-router-dom";
import { uid } from 'uid';
import { dayjsValue, getValue, isNullOrEmpty, useSubmitting, updateArrayWhere, deleteArrayElementWhere, maxOf } from 'utils';
import { CheckSquareOutlined, DeleteFilled, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { columnPath, getAllNodes, getCellFocus, getNodes, getSelectedNodes } from 'components/TableV4/TableV4';
import { useDataAPI, _fieldZodDescription, parseFilter } from 'utils/useDataAPIV4';
import { API_URL, ROOT_URL, DATETIME_FORMAT, BOBINE_ESTADOS, PALETE_SIZES } from 'config';
import { Action, Bool, EstadoBobine, MultiLine, PRIORIDADES_DESTINOS, Options, Value, useDestinosStyles } from 'components/TableV4/TableColumnsV4';
import { fetchPostV4 } from 'utils/fetch';
import { sortBy, prop, is, isEmpty, isNil, isNotNil } from 'ramda';
import { valueByPath, json } from 'utils/object';
import YScroll from 'components/YScroll';
import Portal from "components/portal";
import IconButton from "components/iconButton";
import { Container as FormContainer, Field, Label, ClientesLookupField, Lookup, ButtonChooser, SelectorPopup, EstadoBobineLookup } from 'components/FormFields/FormsV2';
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
import { noValue, minOf, unique, uniqueValues } from 'utils';
import loadInitV3 from 'utils/loadInitV3';
import { usePermission } from 'utils/usePermission';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';
import { styled } from 'styled-components';
import SvgSchema from './SvgSchemaV3';

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

const ToolbarItems = ({ onClick }) => {
    return (
        <Row gutterWidth={2} justify='center' style={{ overflowX: "auto", backgroundColor: "#fafafa", padding: "5px" }} wrap='nowrap'>
            <Col xs="content"><StyledButton onClick={() => onClick("g01")} icon={<img src={imgGroup01} alt="Icon" />} /></Col>
            <Col xs="content"><StyledButton onClick={() => onClick("g02")} icon={<img src={imgGroup02} alt="Icon" />} /></Col>
            <Col xs="content"><StyledButton onClick={() => onClick("g05")} icon={<img src={imgGroup05} alt="Icon" />} /></Col>
            <Col xs="content"><StyledButton onClick={() => onClick("g03")} icon={<img src={imgGroup03} alt="Icon" />} /></Col>
            <Col xs="content"><StyledButton onClick={() => onClick("g04")} icon={<img src={imgGroup04} alt="Icon" />} /></Col>
            <Col xs="content"><StyledButton onClick={() => onClick("g06")} icon={<img src={imgGroup06} alt="Icon" />} /></Col>

            <Col xs="content"><StyledButton onClick={() => onClick("1")}><img src={imgItem01} alt="Icon" /><div className='txt'>Palete</div></StyledButton></Col>
            <Col xs="content"><StyledButton onClick={() => onClick("2")}><img src={imgItem02} alt="Icon" /><div className='txt'>Bobines</div></StyledButton></Col>
            <Col xs="content"><StyledButton onClick={() => onClick("3")}><img src={imgItem03} alt="Icon" /><div className='txt'>Placa de Cartão</div></StyledButton></Col>
            <Col xs="content"><StyledButton onClick={() => onClick("4")}><img src={imgItem04} alt="Icon" /><div className='txt'>Placa MDF</div></StyledButton></Col>
            <Col xs="content"><StyledButton onClick={() => onClick("5")}><img src={imgItem05} alt="Icon" /><div className='txt'>Placa de Plástico</div></StyledButton></Col>
            <Col xs="content"><StyledButton onClick={() => onClick("6")}><img src={imgItem06} alt="Icon" /><div className='txt'>Cantoneira</div></StyledButton></Col>
            <Col xs="content"><StyledButton onClick={() => onClick("7")}><img src={imgItem07} alt="Icon" /><div className='txt'>Cut Here!</div></StyledButton></Col>
        </Row>
    );
}

export default ({ noid = true, noPrint = true, noEdit = true, loadOnInit = true, defaultFilters = {}, defaultSort = [], style, ...props }) => {
    const classes = useTableStyles();
    const location = useLocation();
    const navigate = useNavigate();
    const permission = usePermission({ permissions: props?.permissions });
    const submitting = useSubmitting(true);
    const gridRefItems = useRef(); //not required
    const modalApi = useModalApi(); //not Required;
    const modeApi = useModeApi(); //not Required;
    const [isDirty, setIsDirty] = useState(false);
    const defaultParameters = { method: null };
    const baseFilters = {};
    const dataAPIItems = useDataAPI({ payload: { primaryKey: "id", pagination: { enabled: false, limit: 500 } } });
    const [validation, setValidation] = useState({});
    const [inputParameters, setInputParameters] = useState();
    const _inputParameters = useRef(loadInitV3({}, {}, { ...props?.parameters }, { ...location?.state }));

    useEffect(() => {
        submitting.end();
    }, []);

    const onGridReady = async ({ api, ...params }) => { }
    const onGridRequest = async () => { };
    const onGridResponse = async (api) => {
        if (dataAPIItems.requestsCount() === 1) {
        }
    };

    const onBeforeCellEditRequest = async (data, colDef, path, newValue, event) => {
        /**
         * Método que permite antes do "commit", fazer pequenas alterações aos dados.
         * No caso dessas alterações afetarem os valores de outras colunas da "Grid", é necessário desablitar o TabOnNextCell da coluna,
         * pois o próximo campo entra em edição antes deste método (isto é um Workaround!!!!!), para isso na definição da coluna colocar:
         * suppressKeyboardEvent: (params)=>disableTabOnNextCell(params)
         */
        const field = columnPath(event.column);
        return null;
    }
    const onAfterCellEditRequest = async (data, colDef, path, newValue, event, result) => {
        const r = await validateRows([data], schema, dataAPIItems.getPrimaryKey(), { validationGroups: _validationGroups });
        r.onValidationFail((p) => {
            setValidation(prev => ({ ...prev, ...p.alerts.error }));
        });
        r.onValidationSuccess((p) => {
            setValidation(prev => ({ ...prev, ...p.alerts.error }));
        });
    }

    const onAddSave = async (rows, allRows) => { };

    const onEditSave = async (rows, allRows) => {
        const rv = await validateRows(rows, schemaFinal, dataAPIItems.getPrimaryKey(), { passthrough: false, validationGroups: _validationGroups });
        rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });
        return (await rv.onValidationSuccess(async (p) => {
            setValidation(prev => ({ ...prev, ...p.alerts.error }));
            return true;
        }));
    };

    const onExitMode = () => {
        setValidation({});
    };

    const onActionSave = useCallback(async (row, option) => {
        submitting.trigger();
        submitting.end();
    }, []);

    const actionItems = useCallback((params) => {
        return []
    }, []);

    const _validationGroups = useMemo(() => validationGroups(dataAPIItems), []);
    const cellParams = useCallback((params = {}, editorParams = {}, headerParams = {}) => {
        /**
         * editColumnControl, transfere para cada elemento entrar em modo de edição, em vez de ser a grid, para isso tem de ser true, e na grid suppressClickEdit=true  
         */
        return {
            cellRendererParams: { validation, modeApi, modalApi, validationGroups: _validationGroups, ...params },
            cellEditorParams: { ...editorParams },
            headerComponentParams: { ...headerParams }
        };
    }, [validation, modeApi?.isOnMode()]);

    const isCellEditable = useCallback((params) => { return true; }, [modeApi?.isOnMode()]);

    const columnDefs = useMemo(() => {
        return {
            cols: [
                { field: 'id', hide: true },
                { field: 'item_id', hide: true },
                { field: 'item_order', hide: true },
                { field: 'item_des', headerName: 'Item', ...cellParams(), width: 165, cellRenderer: (params) => <Value bold params={params} /> },
                { field: 'value', headerName: 'Valor', ...cellParams(), width: 100, cellRenderer: (params) => <Value params={params} /> }
                //{ field: 'num_bobines', headerName: 'Bobines', ...cellParams(), width: 100, cellRenderer: (params) => <Value params={params} /> },
                //{ field: 'palete_size', headerName: 'Palete', ...cellParams(), width: 100, cellRenderer: (params) => <Value params={params} /> },
            ], timestamp: new Date()
        };
    }, [validation, modeApi?.isOnMode()]);

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
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 1, item_des: "Palete", item_order: 0, value: PALETE_SIZES[0].value, item_paletesize:PALETE_SIZES[0].value });
                break;
            case "2":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null, item_numbobines:null });
                break;
            case "3":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 3, item_des: "Placa de Cartão", item_order: 0, value: null });
                break;
            case "4":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 4, item_des: "Placa MDF", item_order: 0, value: null });
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
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 1, item_des: "Palete", item_order: 0, value: PALETE_SIZES[0].value, item_paletesize:PALETE_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 3, item_des: "Placa de Cartão", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null,item_numbobines:null });
                break;
            case "g02":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 1, item_des: "Palete", item_order: 0, value: PALETE_SIZES[0].value, item_paletesize:PALETE_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 3, item_des: "Placa de Cartão", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null,item_numbobines:null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 5, item_des: "Placa de Plástico", item_order: 0, value: null });
                break;
            case "g05":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 4, item_des: "Placa MDF", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 1, item_des: "Palete", item_order: 0, value: PALETE_SIZES[0].value, item_paletesize:PALETE_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 3, item_des: "Placa de Cartão", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null,item_numbobines:null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 5, item_des: "Placa de Plástico", item_order: 0, value: null });
                break;
            case "g03":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 1, item_des: "Palete", item_order: 0, value: PALETE_SIZES[0].value, item_paletesize:PALETE_SIZES[0].value });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 3, item_des: "Placa de Cartão", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null,item_numbobines:null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                break;
            case "g04":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 7, item_des: "Etiqueta Cut Here", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null,item_numbobines:null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                break;
            case "g06":
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 7, item_des: "Etiqueta Cut Here", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 2, item_des: "Bobines", item_order: 0, value: null,item_numbobines:null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 6, item_des: "Cantoneira Cartão Branco", item_order: 0, value: null });
                _rows.splice(0, 0, { [dataAPIItems.getPrimaryKey()]: uid(6), item_id: 5, item_des: "Placa de Plástico", item_order: 0, value: null });
                break;
        }
        dataAPIItems.setRows(_reorder(_rows));
        setIsDirty(true);
    }



    return (
        <>
            <TitleForm visible={true} loading={submitting.state} auth={permission.auth} level={location?.state?.level} title={props?.title ? props.title : title} subTitle={props?.subTitle ? props.subTitle : subTitle} />
            <ToolbarItems onClick={onAddItem} />
            <FormContainer fluid style={{}}>
                <Row>
                    <Col width={400}>
                        <TableGridEdit
                            local
                            domLayout={'autoHeight'}
                            style={{ height: "auto" }}
                            gridRef={gridRefItems}
                            singleClickEdit={true}
                            onAfterCellEditRequest={onAfterCellEditRequest}
                            onBeforeCellEditRequest={onBeforeCellEditRequest}
                            showTopToolbar={true}
                            topToolbar={{ showSettings: false }}
                            columnDefs={columnDefs}
                            filters={null}
                            dataAPI={dataAPIItems}
                            modeApi={modeApi}
                            modeOptions={{ enabled: true, showControls: false, allowEdit: true }}
                        />
                    </Col>
                    <Col></Col>
                    <Col><SvgSchema timestamp={dataAPIItems.getTimeStamp()} data={{details:dataAPIItems.getData().rows}}/></Col>
                </Row>
            </FormContainer>
        </>
    );
}

