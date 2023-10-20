import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { uid } from 'uid';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, sleep } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, CONTENTORES_OPTIONS, CINTASPALETES_OPTIONS, PALETE_SIZES, PALETIZACAO_ITEMS } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch } from "antd";
const { TextArea } = Input;
// import ToolbarTitle from './commons/ToolbarTitle';
const { Title } = Typography;
import { json, excludeObjectKeys } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba,OFabricoStatus } from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Item, FieldItem, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, HorizontalRule, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser, Label } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';
import IconButton from "components/iconButton";
import { MdAdjust, MdAssignmentReturned } from 'react-icons/md';
import SvgSchema from "./SvgSchemaV2";
import { CgArrowDownO, CgArrowUpO, CgCloseO } from 'react-icons/cg';

const PERMISSION = { name: "paletizacao", item: "form" };
const title = "Paletização";
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
    return getSchema({
        npaletes: Joi.number().positive().label("Número de Paletes/Contentor").required(),
    }, options).unknown(true);
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

const loadPaletizacao = async (params, primaryKey, signal) => {
    //console.log("feoreeee")
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...params }, sort: [], parameters: { method: "GetPaletizacao" }, signal });
    console.log("lllllllllll", rows)
    //console.log("loadddddddddddddddddddddd", rows)
    if (rows && rows.length > 0) {
        return rows[0];
        //     let _v = json(rows[0]?.formulacao);
        //     if (!_v?.items) {
        //         _v["items"] = [];
        //     }
        //     if (!("joinbc" in _v) || _v?.joinbc == 1) {
        //         const _c = _v?.items?.filter(v => v?.extrusora === "C");
        //         _v["items"] = _v?.items?.filter(v => v?.extrusora !== "C").map((v, i) => ({ ...v, [primaryKey]: `${v.extrusora}-${uid(4)}`, doseador: [...new Set([v?.doseador, ...v?.extrusora !== "A" ? _c.filter(x => (x?.cuba == v?.cuba)).map(x => x?.doseador) : []].filter(Boolean))].join(",") })).sort((a, b) => a.extrusora.localeCompare(b.extrusora));
        //     } else {
        //         _v["items"] = _v?.items?.map(v => ({ ...v, [primaryKey]: `${v.extrusora}-${uid(4)}` })).sort((a, b) => a.extrusora.localeCompare(b.extrusora));
        //     }
        //     return _v;
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

export default ({ setFormTitle, enableAssociation = true, extraRef, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission(PERMISSION);//Permissões Iniciais
    const [mode, setMode] = useState({ form: { edit: false, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const [uid, setUid] = useState();
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


    const [item, setItem] = useState(1);



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
        const _filter = form.getFieldsValue(["cliente_cod","artigo_cod"]);
        setModalParameters({
            content: "ordensfabrico", responsive: true, type: "drawer", width: 1200, title: "Ordens de Fabrico", push: false, loadData: () => { }, parameters: {
                payload: { payload: { url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "of_id", parameters: { method: "OrdensFabricoAllowed" }, pagination: { enabled: false, limit: 50 }, filter: { ..._filter }, sort: [] } },
                toolbar: false,
                //pt.status,pf.designacao,pf.group_name ,pf.subgroup_name , pf.versao, pt2.cliente_nome
                columns: [
                    { name: 'cod', header: 'Agg.', defaultWidth: 160 },
                    { name: 'of_id', header: 'Ordem', defaultWidth: 160 },
                    { name: 'ofabrico_status', header: 'Estado', defaultWidth: 160, render:({data,cellProps})=><OFabricoStatus cellProps={{}} data={data}/> },
                    { name: 'cliente_nome', header: 'Cliente', minWidth: 260,flex:1 },
                    { name: 'artigo_cod', header: 'Artigo', minWidth: 160 },
                    
                    
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
            //response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { aggid: rowProps?.data?.id }, parameters: { method: "SetOrdemFabricoFormulacao", ...inputParameters.current } });
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

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, ["paletizacao_id", "cs_id", "audit_cs_id", "new", "type", "of_id"]);
            inputParameters.current = paramsIn;
        }
        setFormDirty(false);
        if (inputParameters.current?.new) {
            setMode(prev => ({ ...prev, form: { edit: false, add: true } }));
            form.setFieldsValue({
                palete_maxaltura: 2.55, netiquetas_bobine: 2, netiquetas_lote: 2, netiquetas_final: 1, folha_identificativa: 1,
                filmeestiravel_bobines: 1, filmeestiravel_exterior: 0, cintas: 0, ncintas: 0, paletes_sobrepostas: 0, cintas_palete: 0
            });
        } else {
            const { details, ...paletizacao } = await loadPaletizacao({ ...inputParameters.current }, dataAPI.getPrimaryKey(), signal);
            // details.sort((a, b) => {
            //     if (b.item_order === a.item_order) {
            //         return details.indexOf(a) - details.indexOf(b);
            //     }
            //     return b.item_order - a.item_order;
            // });

            details.sort((a, b) => b.item_order - a.item_order);
            console.log("loadddedddd", {
                details,
                ...paletizacao,
                cliente: { BPCNUM_0: paletizacao?.cliente_cod, BPCNAM_0: paletizacao?.cliente_nome },
                artigo_id: paletizacao?.artigo_id
            })

            //dataAPI.setData({ rows: items, total: items?.length });
            form.setFieldsValue({
                details,
                ...paletizacao,
                ncintas: !paletizacao.cintas ? 0 : paletizacao.ncintas,
                cliente: { BPCNUM_0: paletizacao?.cliente_cod, BPCNAM_0: paletizacao?.cliente_nome },
                artigo_id: paletizacao?.artigo_id
            });
            setUid(uuIdInt(0).uuid());
        }
        submitting.end();
    }


    const onValuesChange = (changed, all) => {
        setFormDirty(true);

        if ("cintas" in changed) {
            if (changed["cintas"]) {
                if (!all["ncintas"]) {
                    form.setFieldValue("ncintas", 2);
                    form.setFieldValue("cintas_palete", 1);
                }
            }
        }
        if ("details" in changed) {
            let idx = changed.details.length - 1;
            const key = (changed.details[idx]?.item_id && changed.details[idx]?.item_id?.key) ? changed.details[idx]?.item_id?.key : changed.details[idx]?.item_id ? changed.details[idx]?.item_id : null;
            let cnt = all.details.filter(obj => obj.item_id === 2).length;
            console.log("key",key,idx)
            if (key !== null) {
                const _item = PALETIZACAO_ITEMS.filter(v => v.key === key)[0];
                if (key === 2) {
                    //default value
                    form.setFieldValue(["details", idx, "item_numbobines"], 1);
                    cnt = cnt + 1;
                }
                if (key === 1) {
                    //default value
                    form.setFieldValue(["details", idx, "item_paletesize"], PALETE_SIZES[0].key);
                }
                form.setFieldValue(["details", idx, "item_id"], key);
                form.setFieldValue(["details", idx, "item_des"], _item.value);

                if (cnt > 1) {
                    form.setFieldValue("paletes_sobrepostas", 1);
                } else {
                    form.setFieldValue("paletes_sobrepostas", 0);
                }
            }
        }
        setUid(uuIdInt(0).uuid());
    }

    const onEditCancel = async () => {
        await loadData();
        return false;
    }

    const editable = () => (mode.form.edit || mode.form.add);

    const onSelectItem = (f) => {
        setItem(form.getFieldValue(["details", f, "item_id"]));
    }

    const onEditSave = async () => {
        // const rows = dataAPI.dirtyRows().map(({ id, group }) => ({ artigo_id: id, group }));
        submitting.trigger();
        let response = null;
        try {
            const values = form.getFieldsValue(true);
            const v = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
            let { errors, warnings, value, ...status } = getStatus(v);
            setFieldStatus({ ...status.fieldStatus });
            setFormStatus({ ...status.formStatus });
            if (!values.details || values.details.length == 0) {
                errors++;
                openNotification("error", 'top', "Notificação", "Tem de definir os items no esquema de paletização.");
            }
            if (values.details) {
                if (values.details.filter(v => v.item_id == 2).length == 0) {
                    errors++;
                    openNotification("error", 'top', "Notificação", "Tem de definir pelo menos um item do tipo bobines.");
                } else {
                    values.details = values.details.reverse().map((v, i) => ({ ...v, item_order: i }));
                }
            }
            if (errors === 0) {
                console.log("SAVING-", inputParameters.current)
                console.log(values)
                response = await fetchPost({
                    url: `${API_URL}/ordensfabrico/sql/`, filter: { ...inputParameters.current }, parameters: {
                        method: "SavePaletizacao", ...dataAPI.removeEmpty(values, []),
                        type: inputParameters.current?.type,
                    }
                });

                if (response.data.status !== "error") {
                    //A ordem dos if's é muito importante!!!!
                    if ("cs_id" in inputParameters.current) {
                        setMode(v => ({ ...v, form: { edit: false, add: false } }));
                    } else if ("paletizacao_id" in inputParameters.current) {
                        if (response.data?.id) {
                            inputParameters.current = { paletizacao_id: response.data.id };
                            setMode(v => ({ ...v, form: { edit: false, add: false } }));
                        }
                        loadData();
                    } else if ("new" in inputParameters.current) {
                        inputParameters.current = { paletizacao_id: response.data.id };
                        loadData();
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

    return (
        <YScroll>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            <FormContainer id="form" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onValuesChange={onValuesChange} wrapFormItem={true} forInput={editable()} style={{ padding: "0px" }} alert={{ tooltip: true, pos: "none" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col xs={2} md={1}><Field name="versao" forInput={false} label={{ enabled: true, text: "Versao" }}><Input /></Field></Col>
                    <Col xs={12} md={4} lg={4}><Field name="designacao" label={{ enabled: true, text: "Designação" }}><Input /></Field></Col>
                    <Col xs={6} md={3} lg={2}><Field name="contentor_id" label={{ enabled: true, text: "Contentor" }}><SelectField data={CONTENTORES_OPTIONS} optionsRender={(d, keyField, textField) => ({ label: d[textField], value: d[keyField] })} /></Field></Col>

                    <Col xs={12} md={6} lg={4}><Artigos name="artigo_id" allowClear label={{ enabled: true, text: "Artigo" }} load /></Col>
                    <Col xs={12} md={6} lg={4}><Clientes name="cliente" allowClear label={{ enabled: true, text: "Cliente" }} /></Col>
                </Row>
                <Row>
                    <Col width={150}><Field label={{ text: "Paletes/Contentor" }} name="npaletes"><InputNumber size="small" min={1} max={150} /></Field></Col>
                    <Col width={150}><Field label={{ text: "Altura Máx. Palete" }} name="palete_maxaltura"><InputNumber size="small" min={1} max={150} addonAfter="m" /></Field></Col>
                    <Col width={150}><Field required={false} name="paletes_sobrepostas" label={{ enabled: true, text: "Paletes Sobrepostas" }}><CheckboxField disabled={true} /></Field></Col>
                    <Col width={150}><Field name="netiquetas_bobine" label={{ enabled: true, text: "Etiqueta/Bobine" }}><InputNumber size="small" min={1} max={10} /></Field></Col>
                    <Col width={150}><Field name="netiquetas_lote" label={{ enabled: true, text: "Etiqueta Palete" }}><InputNumber size="small" min={1} max={10} /></Field></Col>
                    <Col width={150}><Field name="netiquetas_final" label={{ enabled: true, text: "Etiqueta Final Palete" }}><InputNumber size="small" min={1} max={10} /></Field></Col>
                    <Col width={150}><Field required={false} name="filmeestiravel_bobines" label={{ enabled: true, text: "Filme Palete" }}><CheckboxField /></Field></Col>
                    <Col width={150}><Field required={false} name="filmeestiravel_exterior" label={{ enabled: true, text: "Filme Exterior" }}><CheckboxField /></Field></Col>
                    <Col width={210}>
                        <div style={{ display: "flex", alignItems: "center" }}><Field name="cintas" style={{ minWidth: "20px", alignSelf: "center" }} layout={{ ...!editable() && { middle: "height:0px;align-items:center;" }, ...editable() && { middle: "height:0px;align-items:center;margin-top:-10px", center: "height:0px;align-items:center;" } }} label={{ enabled: false }}><CheckboxField style={{ height: "0px" }} /></Field><Label text="Cintas" /></div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <FieldItem label={{ enabled: false }}>
                                <Item shouldUpdate={(prevValues, curValues) => prevValues?.cintas !== curValues?.cintas}>
                                    {() =>
                                        <Field rule={schema(['cintas', 'ncintas'])} allValues={form.getFieldsValue(true)} layout={{ center: "min-width: 50px;max-width: 50px; align-self:center;" }} name="ncintas" label={{ enabled: false, text: "Cintas" }}>
                                            <InputNumber style={{ width: "50px" }} disabled={form.getFieldValue(["cintas"]) !== 1} size="small" min={1} max={10} />
                                        </Field>
                                    }
                                </Item>
                            </FieldItem>
                            <FieldItem label={{ enabled: false }}>
                                <Item shouldUpdate={(prevValues, curValues) => prevValues?.cintas !== curValues?.cintas}>
                                    {() =>
                                        <Field name="cintas_palete" layout={{ center: "align-self:center;" }} label={{ enabled: false }}>
                                            <SelectField size="small" data={CINTASPALETES_OPTIONS} keyField="value" textField="label" disabled={form.getFieldValue(["cintas"]) !== 1}
                                                optionsRender={(d, keyField, textField) => ({ label: d[textField], value: d[keyField] })}
                                            />
                                        </Field>
                                    }</Item>
                            </FieldItem>
                        </div>
                    </Col>
                    <Col width={150}><Field name="folha_identificativa" required={false} /* layout={{ center: "align-self:center;" }} */ label={{ enabled: true, text: "Folha Identificativa" }}><InputNumber size="small" min={0} max={10} /></Field></Col>
                    {/*                     <Col width={150}>
                        <FieldItem label={{ enabled: false }}>
                            <Item shouldUpdate={(prevValues, curValues) => prevValues?.cintas !== curValues?.cintas}>
                                {() =>
                                    <Field name="cintas_palete" layout={{ center: "align-self:center;" }} label={{ enabled: false }}>
                                        <SelectField size="small" data={CINTASPALETES_OPTIONS} keyField="value" textField="label" disabled={form.getFieldValue(["cintas"]) !== 1}
                                            optionsRender={(d, keyField, textField) => ({ label: d[textField], value: d[keyField] })}
                                        />
                                    </Field>
                                }</Item>
                        </FieldItem>
                    </Col>
                    

 */}

                </Row>
                <Row><Col><HorizontalRule title="Esquema" hr={false} style={{ background: "rgb(248, 249, 250)", alignItems: "center" }} right={
                    <Space>
                        {/* {(mode.datagrid.edit && inputParameters.current?.type !== "formulacao_dosers_change") && < Dropdown trigger={['click']} menu={{ onClick: menuClick, items: menuOptions({ edit: mode.datagrid.edit, joinbc: form.getFieldValue("joinbc"), referenceDisabled: inputParameters.current?.cs_id }) }}>
                            <Button>
                                <Space>
                                    <EllipsisOutlined />
                                </Space>
                            </Button>
                        </Dropdown>} */}
                    </Space>
                } /></Col></Row>
                <Row style={{}} nogutter>
                    <Form.List name="details">
                        {(fields, { add, remove, move }) => {

                            const getItem = (item) => {
                                return form.getFieldValue(["details", item.name, "item_id"]);
                            }

                            const addRow = (fields) => {
                                add({ item_id: 1, item_paletesize: '970x970', item_numbobines: 10 }, 0);
                            }
                            const removeRow = (fieldName) => {
                                remove(fieldName);
                            }
                            const moveRow = (from, to) => {
                                move(from, to);
                            }
                            return (
                                <Col width={350}>
                                    <Container fluid style={{ padding: "0px" }}>
                                        <Row>
                                            <Col>
                                                {editable() && <Button type="dashed" onClick={() => addRow(fields)} style={{ width: "100%" }}><PlusOutlined />Adicionar</Button>}
                                            </Col>
                                        </Row>
                                        {fields.map((itemField, index) => (
                                            <Row key={`p-sch-${index + 1}`} gutterWidth={5}>
                                                <Col width={15}>{editable() && index > 0 && <IconButton onClick={() => moveRow(index, index - 1)} style={{ alignSelf: "center" }}><CgArrowUpO /></IconButton>}</Col>
                                                <Col width={15}>{editable() && index < (fields.length - 1) && <IconButton onClick={() => moveRow(index, index + 1)} style={{ alignSelf: "center" }}><CgArrowDownO /></IconButton>}</Col>
                                                <Col>
                                                    <Field wrapFormItem={true} forInput={editable()} forViewBackground={true} label={{ enabled: false }} name={[itemField.name, "item_id"]}>
                                                        <Selector
                                                            size="small"
                                                            toolbar={false}
                                                            title="Items de Embalamento"
                                                            popupWidth={350}
                                                            params={{ payload: { data: { rows: PALETIZACAO_ITEMS }, pagination: { limit: 30 } } }}
                                                            keyField={["key"]}
                                                            textField="value"
                                                            columns={[{ key: 'key', name: 'Item', formatter: p => p.row.value }]}
                                                        />
                                                    </Field>
                                                </Col>
                                                <Col width={100}>
                                                    {getItem(itemField) === 1 && <Field forInput={editable()} forViewBackground={true} label={{ enabled: false }} name={[itemField.name, "item_paletesize"]}>
                                                        <SelectField size="small" data={PALETE_SIZES} keyField="key" textField="value" />
                                                    </Field>
                                                    }
                                                    {getItem(itemField) === 2 && <Field forInput={editable()} forViewBackground={true} label={{ enabled: false }} name={[itemField.name, "item_numbobines"]}>
                                                        <InputNumber size="small" min={1} max={80} />
                                                    </Field>
                                                    }
                                                    {(getItem(itemField) > 2 || getItem(itemField) === undefined) && <></>}
                                                </Col>
                                                <Col width={15}>{editable() && <IconButton onClick={() => removeRow(itemField.name)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton>}</Col>
                                            </Row>





                                        ))}
                                    </Container>
                                </Col>
                            );
                        }}
                    </Form.List>
                    <Col>
                        <SvgSchema reverse={false} data={form.getFieldsValue(true)} tStamp={uid} />
                    </Col>
                    <Col></Col>
                </Row>
            </FormContainer>

            {extraRef && <Portal elId={extraRef.current}>
                <Permissions permissions={permission} action="edit" forInput={[enableAssociation, form.getFieldValue("id") > 0, !inputParameters.current?.cs_id, (!mode.form.edit && !mode.form.add)]}>
                    <Space>
                        <Button type="primary" onClick={() => setMode(prev => ({ ...prev, form: { edit: true, add: false } }))}>Editar</Button>
                        <Button onClick={addToOFabrico}>Associar a Ordem Fabrico</Button>
                    </Space>
                </Permissions>
                <Permissions permissions={permission} action="add" forInput={[(mode.form.add)]}>
                    {(formDirty) && <Button type="primary" onClick={onEditSave}>Guardar</Button>}
                </Permissions>
                <Permissions permissions={permission} action="edit" forInput={[(mode.form.edit)]}>
                    <Space>
                        <Button type="default" onClick={() => { setMode(prev => ({ ...prev, form: { edit: false, add: false } })); loadData(); }}>Cancelar</Button>
                        {(formDirty) && <Button type="primary" onClick={onEditSave}>Guardar</Button>}
                    </Space>
                </Permissions>
            </Portal>
            }

        </YScroll >
    );


};