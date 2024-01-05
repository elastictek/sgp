import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH, BOBINE_ESTADOS } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys, excludeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Radio, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, StopOutlined, UploadOutlined, CaretDownOutlined, CaretUpOutlined, ClockCircleTwoTone, ExperimentFilled, SettingOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, SelectOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles, getFilters, getMoreFilters, getFiltersValues } from 'components/TableV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn, EstadoBobines, Largura, OF, EstadoBobine } from 'components/TableColumns';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN, bColors } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { produce } from 'immer';
import { useImmer } from "use-immer";
import { GrSelect } from "react-icons/gr";
import { FaCheck } from 'react-icons/fa';
import { AiOutlineSelect } from 'react-icons/ai';

const TitleForm = ({ level, auth, hasEntries, onSave, loading, title }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, auth, num, v, columns, ...props }) => {
    return (<>
        {true && <>
            {getFilters({ columns: columns })}
            {/* <Col xs="content">
                <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
                </Field>
            </Col> */}
            {/*<Col xs="content">
                <Field name="fyear" shouldUpdate label={{ enabled: true, text: "Ano", pos: "top", padding: "0px" }}>
                    <DatePicker size="small" picker="year" format={"YYYY"} />
                </Field>
            </Col>
            <Col xs="content">
                <Field name="fquarter" label={{ enabled: true, text: "Quarter", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: 1, label: "Q1" }, { value: 2, label: "Q2" }, { value: 3, label: "Q3" }, { value: 4, label: "Q4" }]} allowClear style={{ width: "60px" }} />
                </Field>
            </Col> */}
        </>}
    </>
    );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFilters = ({ form, columns }) => [
    ...getMoreFilters({ columns }),
    // <Col xs="content">
    //     <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
    //         <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
    //     </Field>
    // </Col>
    /* { fgroup: { label: "Grupo", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcod: { label: "Artigo Cód.", field: { type: 'input', size: 'small' }, span: 8 }, fdes: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span: 16 } }, */
];

const BobineEstado = styled.div`
    display:flex;
    background-color:${props => props.color};
    color:${props => props.$fontColor};
`;

const BobineOuter = styled.div`
    margin-right:1px;
    text-align:center;
    min-height:${props => props.height}px;
    width:${props => props.width};
    min-width:${props => props.width};
    display: flex;
    opacity: 1;
    flex-direction: row;
    .bobine{
        cursor:${props => props.status == 1 ? "pointer" : "default"};
        border-radius:3px;
        width:50px;
        height:${props => props.height - 2}px;
        border:${props => props.status == 1 ? "solid 1px #000" : "solid 1px #d9d9d9"};

        ${props => {

        if (props.status == 1) {
            if (props.testSelected == 1) {
                return css`
                box-shadow: 2px 2px 2px 0 rgba(0, 0, 0, 1);
                background-color: #ffe7ba;
            `;
            } else if (props.testSelected == 2) {
                return css`
                box-shadow: 2px 2px 2px 0 rgba(0, 0, 0, 1);
                background-color: #ffc069;
            `;
            }
        } else {
            if (props.testSelected == 1) {
                return css`
                background-color: #ffe7ba;
            `;
            } else if (props.testSelected == 2) {
                return css`
                background-color: #ffc069;
            `;
            }
        }

    }}

      
        font-size:9px;
        display:flex;
        flex-direction:column;
        &:hover {
            border-color: #d9d9d9;
        }
        .lar{
            font-size:10px;
            font-weight:700;
        }
        .gsm{
            font-size:11px;
        }
        .peel{
            font-size:11px;
        }
    }
`;


const generateBobinesTest = (ncortes, type = 1) => {
    /**
     * type
     * 1 - teste normal
     * 2 - teste peel + gsm
     * 3 - teste perfil
     */
    const inf = 2;
    const sup = ncortes - 1;
    const cortes = [];
    if ([1, 2].includes(type) && ncortes >= 10) {
        cortes.push(...[inf, sup]); //limite inferior e superior
        if (ncortes % 2 !== 1) {
            //even
            const idx = Math.ceil(ncortes / 2);
            cortes.push(idx);
            cortes.push(inf + ((idx - inf) / 2));
            cortes.push(Math.ceil(idx - 1 + idx / 2));
            // cortes.push(...(ncortes > 10 ? [idx, idx + 1] : [idx]));
            // cortes.push(inf + ((idx - inf) / 2));
            // cortes.push(
            //     ncortes > 10 ? Math.ceil(idx + (idx / 2)) : Math.floor(idx + idx / 2)
            // );
        } else {
            //odd
            const idx = Math.ceil(ncortes / 2);
            cortes.push(idx);
            cortes.push(inf + ((idx - inf) / 2));
            cortes.push(Math.ceil(idx - 1 + idx / 2));
        }
    } else {
        if (ncortes >= 10) {

            if (ncortes % 2 == 1) {
                const idx = Math.ceil(ncortes / 2);
                cortes.push(...[idx, idx + 1]);
            }
            for (let i = 2; i <= ncortes; i += 2) {
                if (!cortes.includes(i)) {
                    cortes.push(i);
                }
            }

        } else {
            for (let i = 1; i <= ncortes; i += 1) {
                cortes.push(i);
            }
        }
    }
    console.log("cortes---", cortes.sort((a, b) => a - b))
    return cortes.sort((a, b) => a - b);
};

const BobinagemQuality = ({ data, state, startTest, finishTest, selectCortes, uploadTest }) => {
    return (
        <div>
            <div style={{ fontWeight: 900 }}>{data.nome}</div>
            <BobinagemToolbar data={data} state={state} startTest={startTest} finishTest={finishTest} selectCortes={selectCortes} />
            {state.action == null &&
                <div style={{ fontSize: "11px" }}>
                    <div>gsm = 100</div>
                    <div>Peel = 1,5</div>
                    <div>Tensile = xx</div>
                </div>
            }
        </div>
    );
}


/* {!state.bobinagem_id && <div><Button size="small" onClick={() => selectCortes(data.id)} icon={<GrSelect size={18} style={{paddingTop:"3px"}} />} title="Selecionar Cortes" /></div>}
            {!state.bobinagem_id && <div><Button size="small" onClick={() => startTest(data.id)} icon={<ExperimentFilled />} title="Iniciar Teste" /></div>}
            {(state.bobinagem_id && state.bobinagem_id == data.id) && <>
                <div><Button size="small" onClick={finishTest} icon={<StopOutlined />} title='Finalizar Teste' /></div>
                <div><Button size="small" onClick={uploadTest} icon={<UploadOutlined />} title='Carregar Teste' /></div>
            </>}

            <div><Button size="small" icon={<SettingOutlined />} title='Alterar bobines de teste' /></div> */


const BobinagemToolbar = ({ data, state, startTest, finishTest, selectCortes, uploadTest }) => {
    let content;
    
    //if (state.action=="select" && data.)
    
    switch (state.action) {
        case 'select':
            content = <>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div><SelectOutlined style={{ fontSize: "16px", color: "#1890ff", marginRight: "5px" }} /></div>
                    <div><Button size="small" onClick={finishTest} icon={<StopOutlined />} title='Cancelar cortes' /></div>
                    <div><Button size="small" onClick={uploadTest} icon={<FaCheck />} title='Guardar cortes' /></div>
                </div>
                <Radio.Group size='small' onChange={() => { }}>
                    <Space direction="vertical" size={1}>
                        <Radio defaultChecked value={1}>Normal</Radio>
                        <Radio value={2}>+Perfil</Radio>
                    </Space>
                </Radio.Group>
            </>;
            break;
        case 'test':
            content = <>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div><Button size="small" onClick={finishTest} icon={<StopOutlined />} title='Finalizar Teste' /></div>
                    <div><Button size="small" onClick={uploadTest} icon={<UploadOutlined />} title='Carregar Teste' /></div>
                </div>
            </>;
            break;
        default:
            content = <>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div><Button size="small" onClick={() => selectCortes(data.id,data.teste_id)} icon={<SelectOutlined style={{ fontSize: "16px" }} />} title="Selecionar Cortes" /></div>
                    <div><Button size="small" onClick={() => startTest(data.id,data.teste_id)} icon={<ExperimentFilled />} title="Iniciar Teste" /></div>
                </div>
            </>;
    }

    return (
        <div>

            {content}

        </div>
    );
}


const BobineQuality = ({ index, data, align, state }) => {

    const testSelected = useCallback(() => {
        if (data?.bobines_lab_perfil && data.bobines_lab_perfil.includes(index + 1)) {
            return 2;
        }
        if (data.bobines_lab && data.bobines_lab.includes(index + 1)) {
            return 1;
        }
        return 0;
    }, [index, data?.bobines_lab, data?.bobines_lab_perfil]);

    const myStatus = useCallback(() => {
        if (data.bobines[index].recycle == 0 && !data.bobines[index].carga_id && data.bobines[index].comp > 0) {
            return 1;
        }
        return 0;
    }, [data.bobines[index]?.recycle, data.bobines[index]?.carga_id, data.bobines[index]?.comp]);

    const isProvisory = useCallback(() => {
        //TODO - se estiver selecionada para teste 2, se estiver selecionada para teste de perfil 3
        if (data.bobines[index]?.provisory && data.bobines[index].estado == "G") {
            return 1;
        }
        return 0;
    }, [data.bobines[index]?.provisory, data.bobines[index]?.estado]);


    return (<>
        {index < data.bobines.length &&
            <div style={{ display: "flex", flexDirection: "row", lineHeight: "12px", justifyContent: align }}>
                <BobineOuter width="100%" height={80} status={myStatus()} testSelected={testSelected()}>
                    <div className="bobine">
                        <div className="lar">L{data.bobines[index].lar}</div>
                        <div style={{ flex: 1 }}></div>
                        {(myStatus() && testSelected() == 1 && state.bobinagem_id == data.id) ? <>
                            <div className="gsm"><InputNumber placeholder='gsm' size="small" controls={false} style={{ width: "45px" }} precision={1} max={999} maxLength={5} /></div>
                        </> : <></>}
                        {(myStatus() && testSelected() == 2 && state.bobinagem_id == data.id) ? <>
                            <div className="gsm"><InputNumber placeholder='LA' size="small" controls={false} style={{ width: "45px" }} precision={1} max={999} maxLength={5} /></div>
                            <div className="gsm"><InputNumber placeholder='LO' size="small" controls={false} style={{ width: "45px" }} precision={1} max={999} maxLength={5} /></div>
                        </> : <></>}
                        {((!myStatus() || (myStatus() && state.bobinagem_id !== data.id)) && testSelected() > 0) ? <>
                            <div className="gsm">G 101.5</div>
                            <div className="peel">P 1.5</div>
                        </> : <></>}
                        <div style={{ flex: 1 }}></div>
                        <BobineEstado color={bColors(data.bobines[index].estado).color} $fontColor={bColors(data.bobines[index].estado).fontColor}>
                            <div style={{ flex: 1 }}></div>
                            <div>{data.bobines[index].estado}</div>
                            <div style={{ flex: 1 }}><ClockCircleTwoTone /></div>
                        </BobineEstado>
                    </div>
                </BobineOuter>

                {/*                 <StyledBobineQuality color={bColors(data.bobines[index].estado).color} $fontColor={bColors(data.bobines[index].estado).fontColor}>
                    {data.bobines[index].nome}
                </StyledBobineQuality> */}
            </div>
        }
    </>);
}

export const postProcess = async (dt, submitting) => {
    for (let [i, v] of dt.rows.entries()) {
        dt.rows[i]["bobines"] = json(dt.rows[i]["bobines"]).sort((a, b) => (a.nome < b.nome) ? -1 : 1);
        if (dt.rows[i]?.teste) {
            console.log("--->", dt.rows[i]?.teste)
        }
        // if (!dt.rows[i]?.selected_bobines) {

        //     if (!dt.rows[i]?.default_bobines) {
        //         dt.rows[i].default_bobines = generateBobinesTest(dt.rows[i].bobines.length, 3);
        //     }

        // } else {

        // }


    }
    submitting.end();
    return dt;
}

export default ({ extraRef, closeSelf, loadParentData, noid = false, defaultFilters = {}, defaultSort = [], onSelect, onSelectBobine, title, onFilterChange, refresh, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "controlpanel" });

    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    //const defaultFilters = { fcarga: "isnull", fdisabled: "==0", fdispatched: "isnull" };
    const defaultParameters = { method: "BobinagensListLab" };
    //const defaultSort = [{ column: `t.timestamp`, direction: "DESC" }];
    const dataAPI = useDataAPI({ ...(!noid && { id: "bobinagenslist_lab" }), fnPostProcess: (dt) => postProcess(dt, submitting), payload: { url: `${API_URL}/bobinagens/sql/`, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 8 }, filter: {}, baseFilter: defaultFilters, sort: defaultSort } });

    const [state, updateState] = useImmer({
        action: null,
        bobinagem_id: null,
        teste_id:null
    });


    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    useEffect(() => {
        if (refresh) {
            (async () => await dataAPI.update(true))();
        }
    }, [refresh]);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, { ...props?.parameters }, { ...location?.state }, null);
            inputParameters.current = paramsIn;
        }
        let { filterValues, fieldValues } = fixRangeDates(null, inputParameters.current);
        formFilter.setFieldsValue(excludeObjectKeys({ ...dataAPI.getFilter(), ...fieldValues }, ['tstamp']));
        dataAPI.addFilters(excludeObjectKeys({ ...dataAPI.getFilter(), ...fieldValues }, ['tstamp']), true);
        //dataAPI.setSort(defaultSort);
        dataAPI.setBaseFilters(defaultFilters);
        dataAPI.setAction("init", true);
        dataAPI.update(true);
        submitting.end();
    }

    const startTest = useCallback((bobinagem_id,teste_id) => {
        updateState(draft => {
            draft.action = "test";
            draft.bobinagem_id = bobinagem_id;
            draft.teste_id = teste_id;
        });
    }, [state.bobinagem_id,state.teste_id]);

    const finishTest = useCallback(() => {
        updateState(draft => {
            draft.action = null;
            draft.bobinagem_id = null;
            draft.teste_id=null;
        });
    }, [state.bobinagem_id,state.teste_id]);

    const selectCortes = useCallback((bobinagem_id,teste_id) => {
        updateState(draft => {
            draft.action = "select";
            draft.bobinagem_id = bobinagem_id;
            draft.teste_id = teste_id;
        });
    }, [state.bobinagem_id,state.teste_id]);

    const uploadTest = useCallback(() => {
    }, [state.bobinagem_id,state.teste_id]);


    const columns = [
        ...(true) ? [{ name: 'nome', header: 'Bobinagem', filter: { show: "toolbar", alias: "bobinagem", op: "any", field: { style: { width: "160px" } } }, userSelect: true, defaultLocked: true, defaultWidth: 120, headerAlign: "center", render: ({ data, cellProps }) => <BobinagemQuality data={data} state={state} selectCortes={selectCortes} startTest={startTest} finishTest={finishTest} uploadTest={uploadTest} /> }] : [],
        ...(true) ? Array.from({ length: 24 }, (_, index) => {
            return {
                name: String(index + 1).padStart(2, '0'), style: { padding: "0px" }, showColumnMenuTool: false, header: String(index + 1).padStart(2, '0'), sortable: false, userSelect: true, defaultLocked: false, defaultWidth: 70, minWidth: 70, flex: 1, headerAlign: "center", render: ({ data, cellProps }) => (Array.isArray(data?.bobines) && data.bobines.length > 0) &&
                    <BobineQuality state={state} onClick={onSelectBobine} align="center" data={data} index={index} />
            };
        }) : [],
        //...(true) ? [{ name: 'comp', header: 'Comprimento', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp} m</div> }] : [],
        //...(true) ? [{ name: 'comp_par', header: 'Comp. Emenda', width: 100, editable: editable, cellClass: editableClass, editor: p => <InputNumberEditor p={p} field="comp_par" min={0} max={p.row.comp} addonAfter="m" onChange={onChange} />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_par} m</div> }] : [],
        //...(true) ? [{ name: 'comp_cli', header: 'Comp. Cliente', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_cli} m</div> }] : [],
        //...(true) ? [{ name: 'diam', header: 'Diâmetro', width: 100, editable: (r) => editable(r, 'diam'), cellClass: r => editableClass(r, 'diam'), editor: p => <InputNumberEditor p={p} field="diam" min={0} max={1500} addonAfter="mm" onChange={onChange} />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{p.row.diam} mm</div> }] : [],
        //...(true) ? [{ name: 'largura', header: 'Largura', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.largura} mm</div> }] : [],
        //...(true) ? [{ name: 'area', header: 'Área', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.area} m&sup2;</div> }] : [],
        //...(true) ? [{ name: 'largura_bruta', header: 'Largura Bruta', width: 100, editable: editable, cellClass: editableClass, editor: p => <InputNumberEditor p={p} field="largura_bruta" min={p.row.largura} addonAfter="mm" onChange={onChange} />, editorOptions: { editOnClick: true }, formatter: p => <div style={{ textAlign: "right" }}>{p.row.largura_bruta} mm</div> }] : [],
        //...(true) ? [{ name: 'nwinf', header: 'Nw Inf.', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.nwinf} m</div> }] : [],
        //...(true) ? [{ name: 'nwsup', header: 'Nw Sup.', width: 100, formatter: p => <div style={{ textAlign: "right" }}>{p.row.nwsup} m</div> }] : [],
        ////...formFilter.getFieldValue('typelist') === "A" ? [{ key: 'bobines', minWidth: 750, width: 750, name: <ColumnBobines n={28} />, sortable: false, formatter: p => <Bobines onClick={onBobineClick} b={JSON.parse(p.row.bobines)} bm={p.row}/*  setShow={setShowValidar} */ /> }] : [],
        ////...formFilter.getFieldValue('typelist') === "C" ? [
        ////    { key: 'ofs', name: 'Ordens de Fabrico', width: 480, sortable: false, formatter: (p) => <Ofs /* rowIdx={i} */ r={p.row} /* setShow={setShowValidar} */ /> }
        ////] : [],
        //...(true) ? [{ name: 'tiponwinf', header: 'Tipo NW Inferior', width: 300, sortable: true }] : [],
        //...(true) ? [{ name: 'tiponwsup', header: 'Tipo NW Superior', width: 300, sortable: true }] : [],
        //...(true) ? [{ name: 'lotenwinf', header: 'Lote NW Inferior', width: 150, sortable: true, editable: (r) => editable(r, 'lotenwinf'), cellClass: r => editableClass(r, 'lotenwinf'), editor: p => <SelectDebounceEditor onSelect={(o, v) => onChange(p, v, 'lotenwinf', 'n_lote')} fetchOptions={(v) => loadNwLotesLookup(p, v)} optionsRender={optionsRender} p={p} field="lotenwinf" />, editorOptions: { editOnClick: true } }] : [],
        //...(true) ? [{ name: 'lotenwsup', header: 'Lote NW Superior', width: 150, sortable: true, editable: (r) => editable(r, 'lotenwsup'), cellClass: r => editableClass(r, 'lotenwsup'), editor: p => <SelectDebounceEditor onSelect={(o, v) => onChange(p, v, 'lotenwsup', 'n_lote')} fetchOptions={(v) => loadNwLotesLookup(p, v)} optionsRender={optionsRender} p={p} field="lotenwsup" />, editorOptions: { editOnClick: true } }] : []
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
                    ...getFiltersValues({ columns, values: vals, server: false })
                };


                dataAPI.setBaseFilters({ ...defaultFilters });
                dataAPI.addFilters(dataAPI.removeEmpty({ ...excludeObjectKeys(_values, Object.keys(defaultFilters)) }));
                dataAPI.setSort(dataAPI.getSort(), defaultSort);
                dataAPI.addParameters({ ...defaultParameters });


                //formFilter.setFieldsValue({ fyear: dayjs().year(_year) });
                dataAPI.first();
                dataAPI.setAction("filter", true);
                dataAPI.update(true);
                break;
        }
    };

    const onFilter = (changedValues, values) => {
        if (typeof onFilterChange == 'function') {
            onFilterChange(changedValues, values);
        }

        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onSelectionChange = (v) => {
        if (typeof onSelect == 'function') {
            onSelect(v);
        }
        //navigate("/app/picking/newpaleteline", { state: { palete_id: v.data.id, palete_nome: v.data.nome, ordem_id:v.data.ordem_id, num_bobines:v.data.num_bobines } });
    }

    const rowClassName = ({ data }) => {
        if (data.valid === 0) {
            return tableCls.warning;
        }
    }

    return (
        <>
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />
            <Container fluid style={{ padding: "0px", margin: "0px" }}>
                <Row>
                    <Col>
                        <Table
                            dirty={false}
                            loading={submitting.state}
                            idProperty={dataAPI.getPrimaryKey()}
                            local={false}
                            onRefresh={loadData}
                            cellNavigation={false}
                            rowHeight={90}
                            rowSelect={true}
                            onSelectionChange={onSelectionChange}
                            checkboxColumn={false}
                            rowClassName={rowClassName}
                            showHoverRows={false}
                            showCellBorders="horizontal"
                            enableSelection={true}
                            showActiveRowIndicator={true}
                            //groups={groups}
                            sortable
                            reorderColumns={false}
                            showColumnMenuTool
                            loadOnInit={false}
                            //editStartEvent={"click"}
                            pagination="remote"
                            defaultLimit={20}
                            columns={columns}
                            dataAPI={dataAPI}
                            moreFilters={true}
                            // onCellAction={onCellAction}
                            toolbarFilters={{
                                form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilter,
                                filters: <ToolbarFilters dataAPI={dataAPI} auth={permission.auth} v={formFilter.getFieldsValue(true)} columns={columns} />,
                                moreFilters: { filters: moreFilters }
                            }}
                            editable={{
                                enabled: false,
                                add: false
                            }}
                            leftToolbar={<Space></Space>}
                        />
                    </Col >
                </Row >
            </Container >
        </>
    )

}