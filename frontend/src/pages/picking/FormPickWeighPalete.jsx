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
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles, getFilters, getMoreFilters, getFiltersValues } from 'components/TableV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn, EstadoBobines, Largura, OF } from 'components/TableColumns';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
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
import SvgSchema from "../paletes/paletizacao/SvgSchemaV2";
import PaletesChoose from './PaletesChoose';

const title = "Refazer Palete";
const TitleForm = ({ level, auth, hasEntries, onSave, loading }) => {
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

// export const loadQuantity = async ({ value, artigo_cod }, signal) => {
//     const { data: { row } } = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: { value, artigo_cod }, sort: [], parameters: { method: "GetGranuladoLoteQuantityV2" }, signal });
//     if (row && Object.keys(row).length > 0) {
//         return row;
//     }
//     return null;
// }

// export const loadOrdensFabrico = async ({ }, signal) => {
//     const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { was_in_production: 1 }, sort: [], parameters: { method: "OrdensFabricoOpen" }, signal });
//     if (rows && Object.keys(rows).length > 0) {
//         return rows;
//     }
//     return null;
// }

// const steps = [
//     {
//         title: 'Ordens'
//     }, {
//         title: 'Esquema'
//     }, {
//         title: 'Bobines'
//     }, {
//         title: 'Pesar'
//     }, {
//         title: 'Palete'
//     },
// ];

// const ListItem = styled(List.Item)`
//     cursor: pointer;
//     padding: 10px;
//     transition: background-color 0.3s ease; /* Add a smooth transition effect */
//     border-radius: 3px;
//     &:hover {
//     background-color: #bae7ff; /* Background color on hover */
//     }
// `;

// const OrdensFabricoList = ({ openNotification, next, ...props }) => {
//     const inputParameters = useRef({});
//     const submitting = useSubmitting(true);
//     const defaultFilters = {};
//     const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
//     const defaultParameters = {};

//     const [items, setItems] = useState();

//     useEffect(() => {
//         const controller = new AbortController();
//         loadData({ signal: controller.signal, init: true });
//         return (() => controller.abort());
//     }, []);

//     const loadData = async ({ signal, init = false } = {}) => {
//         submitting.trigger();
//         if (init) {
//             const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, null, null);
//             inputParameters.current = { ...paramsIn };
//         }
//         const _items = await loadOrdensFabrico({}, signal);
//         setItems(_items);
//         submitting.end();
//     }

//     return (<YScroll>

//         <List
//             size="small"
//             itemLayout="horizontal"
//             dataSource={items}
//             renderItem={(item, index) => (
//                 <ListItem onClick={() => next(item)}>
//                     <List.Item.Meta
//                         // avatar={<div style={{ width: "90px", maxWidth: "90px", display: "flex", flexDirection: "column", alignItems: "center" }}>
//                         //     <OFabricoStatus data={item} cellProps={{}} />
//                         // </div>}
//                         title={<div>{item.ofid}<OFabricoStatus data={item} cellProps={{}} /></div>}
//                         description={<div>
//                             <div style={{ fontWeight: 900, fontSize: "14px", color: "#000" }}>{item.cliente_nome}</div>
//                             <div><span>{item.item_cod}</span><span style={{ fontWeight: 700, marginLeft: "10px" }}>{item.artigo_des}</span></div>
//                         </div>}
//                     />
//                 </ListItem>
//             )}
//         />

//     </YScroll>);
// }


// const SelectPalete = ({ openNotification, next, data, onSelect, ...props }) => {
//     const inputParameters = useRef({});
//     const submitting = useSubmitting(true);
//     const defaultFilters = {};
//     const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
//     const defaultParameters = {};

//     const [items, setItems] = useState();

//     useEffect(() => {
//         const controller = new AbortController();
//         loadData({ signal: controller.signal, init: true });
//         return (() => controller.abort());
//     }, []);

//     const loadData = async ({ signal, init = false } = {}) => {
//         console.log("RRRRRRRRRRRRRR", json(json(data?.esquema).paletizacao));
//     }

//     return (
//         <YScroll>

//             <SvgSchema reverse={true} data={json(json(data?.esquema).paletizacao)} onClick={onSelect} />

//         </YScroll>);
// }

// const PickBobines = ({ state, updateState, next, cancel, disabled, noStatus }) => {
//     const inputRef = useRef();
//     const [modalParameters, setModalParameters] = useState({});
//     const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

//         const content = () => {
//             switch (modalParameters.content) {
//                 case "errors": return <Errors parameters={modalParameters.parameters} />;
//             }
//         }
//         return (
//             <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
//                 {content()}
//             </ResponsiveModal>
//         );
//     }, [modalParameters]);
//     const onClickError = (idx) => {
//         setModalParameters({ content: "errors", type: "drawer", push: false, width: "90%", title: `Bobine ${state.report[idx].nome}`, parameters: { item: state.report[idx] } });
//         showModal();
//     }

//     useEffect(() => {
//         if (!disabled) {
//             const timeout = setTimeout(() => {
//                 if (inputRef.current) {
//                     inputRef.current.focus({ cursor: 'all' });
//                 }
//             }, 500);
//             /**TOREMOVE */
//             updateState(draft => {
//                 draft.picked = 7;
//                 draft.bobines = [{ lote: "20230720-10-14" }, { lote: "20230720-10-13" }, { lote: "20230720-10-12" }, { lote: "20230720-10-11" }, { lote: "20230720-10-10" }, { lote: "20230720-10-07" }, { lote: "20230720-10-06" }];
//                 draft.bobinesOk = 0;
//             });
//             return (() => { clearTimeout(timeout); });
//         }
//     }, []);

//     const loadData = async ({ signal, init = false } = {}) => {
//         //console.log("RRRRRRRRRRRRRR", json(json(data?.esquema).paletizacao));
//     }

//     const onInputOk = (v, idx) => {
//         const _r = produce(state?.bobines, (draftArray) => {
//             draftArray[idx].lote = v;
//         });
//         const pattern = /^\d{8}-\d{2,}-\d{2,}$/;
//         const t1 = pattern.test(state.bobines[idx].lote);
//         const t2 = pattern.test(v);
//         const _picked = ((!t1 && !t2) || (t1 && t2)) ? state.picked : (t1 && !t2) ? state.picked - 1 : state.picked + 1;
//         updateState(draft => {
//             draft.picked = _picked;
//             draft.bobines = _r;
//             draft.bobinesOk = 0;
//         });
//     }

//     return (
//         <YScroll maxHeight="85vh" {...noStatus && {width:"300px"}}>
//             <List
//                 header={(state.report && !noStatus) ?
//                     <Container fluid style={{ padding: "0px", margin: "0px" }}>
//                         <Row nogutter>
//                             <Hidden xs sm md lg>
//                                 <Col style={{}} width={16 * 2 + 30}></Col>
//                                 <Col style={{}} width={165}></Col>
//                                 <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: o artigo não corresponde ao da ordem de fabrico">Artigo</Tooltip></Col>
//                                 <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: o produto não corresponde ao da ordem de fabrico">Produto</Tooltip></Col>
//                                 <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: a bobine não existe, foi reciclada ou o comprimento é igual a zero">Bobine</Tooltip></Col>
//                                 <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: o core não corresponde ao da ordem de fabrico">Core</Tooltip></Col>
//                                 <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: o diametro da bobine não está dentro dos limites establecidos pelo cliente">Diâmetro</Tooltip></Col>
//                                 <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: existirem bobines duplicadas">Duplicada</Tooltip></Col>
//                                 <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: o número de emendas excede o definido na ordem de fabrico">Emendas</Tooltip></Col>
//                                 <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: o estado da bobine for diferente de GOOD">Estado</Tooltip></Col>
//                                 <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: a bobine foi produzida à mais de 3 meses">Expirada</Tooltip></Col>
//                                 <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: a largura não corresponde à da ordem de fabrico">Largura</Tooltip></Col>
//                                 <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: a bobine se encontra numa palete final" trigger={["click", "hover"]}>Palete</Tooltip></Col>
//                             </Hidden>
//                         </Row>
//                     </Container>
//                     : false
//                 }
//                 size="small"
//                 itemLayout="horizontal"
//                 dataSource={state.bobines}
//                 renderItem={(item, index) => (
//                     <List.Item
//                     // actions={[hasEntries() && <Button disabled={submitting.state} size="large" type="primary" onClick={onSave} icon={<CheckOutlined />}>Submeter</Button>]}
//                     >
//                         <List.Item.Meta
//                             avatar={<div style={{ width: "30px" }}>{index + 1}</div>}
//                             description={

//                                 <div style={{ display: "flex" }}>
//                                     <div><Input disabled={disabled} {...index === 0 && { ref: inputRef }} tabIndex={index + 1} size='small' value={item.lote} onChange={(e) => onInputOk(e.target.value, index)} onPressEnter={(e) => onInputOk(e.target.value, index)} /></div>
//                                     {(state.report && !noStatus) && <>
//                                         <Hidden xs sm md lg>
//                                             <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", backgroundColor: state.report[index].artigo_ok == 1 ? "green" : "#ff4d4f" }}></div>
//                                             <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", backgroundColor: state.report[index].produto_ok == 1 ? "green" : "#ff4d4f" }}></div>
//                                             <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", backgroundColor: state.report[index].bobine_ok == 1 ? "green" : "#ff4d4f" }}></div>
//                                             <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", backgroundColor: state.report[index].core_ok == 1 ? "green" : "#ff4d4f" }}></div>
//                                             <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", backgroundColor: state.report[index].diam_ok == 1 ? "green" : "#ff4d4f" }}></div>
//                                             <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", backgroundColor: state.report[index].duplicate == 1 ? "green" : "#ff4d4f" }}></div>
//                                             <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", backgroundColor: state.report[index].emendas_ok == 1 ? "green" : "#ff4d4f" }}></div>
//                                             <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", backgroundColor: state.report[index].estado_ok == 1 ? "green" : "#ff4d4f" }}></div>
//                                             <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", backgroundColor: state.report[index].expired_ok == 1 ? "green" : "#ff4d4f" }}></div>
//                                             <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", backgroundColor: state.report[index].largura_ok == 1 ? "green" : "#ff4d4f" }}></div>
//                                             <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", backgroundColor: state.report[index].palete_ok == 1 ? "green" : "#ff4d4f" }}></div>
//                                         </Hidden>
//                                         <Visible xs sm md lg>
//                                             <div style={{ margin: "0px 20px", width: "25px", borderRadius: "2px", ...(state.report[index].isok == 0 && { cursor: "pointer" }), backgroundColor: state.report[index].isok == 1 ? "green" : "#ff4d4f" }} onClick={() => state.report[index].isok == 0 && onClickError(index)}></div>
//                                         </Visible>
//                                     </>}
//                                 </div>}
//                         />
//                     </List.Item>
//                 )}
//             />

//         </YScroll>);
// }

// const Errors = ({ parameters }) => {
//     return (<Container fluid>
//         <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: o artigo não corresponde ao da ordem de fabrico">Artigo</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.artigo_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
//         <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: o produto não corresponde ao da ordem de fabrico">Produto</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.produto_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
//         <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: a bobine não existe, foi reciclada ou o comprimento é igual a zero">Bobine</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.bobine_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
//         <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: o core não corresponde ao da ordem de fabrico">Core</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.core_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
//         <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: o diametro da bobine não está dentro dos limites establecidos pelo cliente">Diâmetro</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.diam_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
//         <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: existirem bobines duplicadas">Duplicada</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.duplicate == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
//         <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: o número de emendas excede o definido na ordem de fabrico">Emendas</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.emendas_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
//         <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: o estado da bobine for diferente de GOOD">Estado</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.estado_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
//         <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: a bobine foi produzida à mais de 3 meses">Expirada</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.expired_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
//         <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: a largura não corresponde à da ordem de fabrico">Largura</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.largura_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
//         <Row style={{ marginBottom: "2px" }}><Col width={100} style={{ textAlign: "left", fontWeight: 700 }}><Tooltip title="Erro se: a bobine se encontra numa palete final" trigger={["click", "hover"]}>Palete</Tooltip></Col><Col style={{ borderRadius: "2px", backgroundColor: parameters.item.palete_ok == 1 ? "green" : "#ff4d4f" }} width={25}></Col></Row>
//     </Container>);
// }

// const schemaW = (options = {}) => {
//     return getSchema({
//         pesobruto: Joi.number().positive().label("Peso Bruto").required(),
//         pesopalete: Joi.number().positive().label("Peso da Palete").required()
//     }, options).unknown(true);
// }
// const WeighPalete = ({ state, updateState, next, cancel }) => {
//     return (
//         <Row nogutter>
//             <Hidden xs sm md><Col xs={4}></Col></Hidden>
//             <Col style={{ /* display: "flex", justifyContent: "center" */ }}>
//                 <Row nogutter style={{ /* borderBottom: "solid 1px #d9d9d9" */ }}>
//                     <Col></Col>
//                     <Col xs="content"><Field forInput={true} wrapFormItem={true} name="pesobruto" label={{ enabled: true, text: "Peso bruto" }}><InputNumber style={{ width: "100px" }} addonAfter="kg" /></Field></Col>
//                     <Col width={5}></Col>
//                     <Col xs="content"><Field forInput={true} wrapFormItem={true} name="pesopalete" label={{ enabled: true, text: "Peso palete" }}><SelectField keyField="key" textField="value" data={PALETES_WEIGH} /></Field></Col>
//                     <Col></Col>
//                 </Row>
//             </Col>
//             <Hidden xs sm md><Col xs={4}></Col></Hidden>
//         </Row>
//     );
// }

export default ({ extraRef, closeSelf, loadParentData, noid = true, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "picking" });
    const [load, setLoad] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, { ...props?.parameters }, { ...location?.state }, null);
            inputParameters.current = paramsIn;
            if (inputParameters.current?.id) {
                onSelectionChange({ data: inputParameters.current });
            } else {
                setLoad(true);
            }
        }
        submitting.end();
    }

    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onSelectionChange = (v) => {
        navigate("/app/picking/newpaleteline", { state: { action: "weigh", palete_id: v.data.id, palete_nome: v.data.nome, ordem_id: v.data.ordem_id, num_bobines: v.data.num_bobines, lvl: v.data.lvl } });
    }

    return (
        <>
            {load &&
                <PaletesChoose
                    noid={false}
                    title="Pesar Palete"
                    onFilterChange={onFilterChange} onSelect={onSelectionChange}
                    defaultSort={[{ column: `t.timestamp`, direction: "DESC" }]}
                    defaultFilters={{ fcarga: "isnull", fdisabled: "==0", fdispatched: "isnull" }}
                />
            }
        </>
    )

}