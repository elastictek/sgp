import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import moment from 'moment';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL, DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, CINTASPALETES_OPTIONS, PALETIZACAO_ITEMS, PALETE_SIZES, ARTIGOS_SPECS, GAMAOPERATORIA } from "config";
import { useModal } from "react-modal-hook";
import { useDataAPI } from "utils/useDataAPI";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space, Form, Tag, Drawer, Tabs, Modal, Input, InputNumber } from "antd";
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Option } = Select;
import { EditOutlined, HistoryOutlined, AppstoreAddOutlined, MoreOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { BiWindowOpen } from 'react-icons/bi';
import ResponsiveModal from 'components/Modal';
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import loadInit from "utils/loadInit";
/* const FormCortes = React.lazy(() => import('../FormCortes')); */
import Table from 'components/TableV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, CheckboxField } from 'components/FormFields';
import TitleCard from './TitleCard';
import useWebSocket from 'react-use-websocket';
import { EventColumn, doserConsume } from '../../logslist/commons';
import { SocketContext } from '../../App';
import { useSubmitting, noValue } from "utils";
import { usePermission } from "utils/usePermission";
import IconButton from "components/iconButton";
import { CgArrowDownO, CgArrowUpO, CgCloseO } from 'react-icons/cg';
import SvgSchema from '../ordemfabrico/paletizacaoSchema/SvgSchema';
import FormFormulacaoDosers from './FormFormulacaoDosers';
const FormCortes = React.lazy(() => import('../FormCortes'));


const title = "Eventos da Linha";
const useStyles = createUseStyles({});

const schema = ({ wrapObject = false, wrapArray = false, excludeKeys = [], keys = [] } = {}) => {
    return getSchema(Joi.object(pick(keys, {

    }, excludeKeys)).unknown(true), { wrapObject, wrapArray, excludeKeys, keys }
    );
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        {/*         <Col xs='content'><Field wrapFormItem={true} name="lote" label={{ enabled: true, text: "Lote" }}><Input width={250} size="small" /></Field></Col>
        <Col xs='content'><Field wrapFormItem={true} name="source" label={{ enabled: true, text: "Origem" }}><Input width={100} size="small" /></Field></Col>
        <Col xs='content'><Field wrapFormItem={true} name="timestamp" label={{ enabled: true, text: "Data" }}><Input width={150} size="small" /></Field></Col> */}
    </>
    );
}

const SelectData = ({ onView, onChangeContent, dataAPI }) => {
    return (
        <Space>
            <Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} disabled={dataAPI.isLoading()} />
        </Space>
    );
}

const Status = ({ type_op, last = false, onClick }) => {
    const text = () => {
        switch (type_op) {
            case 'created': return "OF Criada";
            case 'formulacao_dosers_change': return "Doseadores Alterados";
            case 'formulacao_formulation_change': return "Formulação Alterada";
            case 'status_finished': return "OF Terminada";
            case 'status_inproduction': return "OF Em Produção";
            case 'status_stopped': return "OF Parada";
            case 'specs': return "Especificações Alteradas";
            case 'gamaoperatoria': return "Gama Operatória Alterada";
            case 'cortes': return "Cortes Alterados";
            case 'paletizacao': return "Paletização Alterada";
            case 'settings_of_change': return "Definições Alteradas";
            case 'nonwovens': return "Nonwovens Alterados";
        }
    }
    return (<Button onClick={onClick} size="small" type="link" style={{ ...(last && { fontWeight: 700 }) }}>{text()}</Button>);
}




const loadAuditCurrentSettings = async ({ acsid, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/auditcurrentsettingsget/`, filter: { acsid }, sort: [], signal });
    return rows;
}


const defaultTab = (type_op) => {
    switch (type_op) {
        case "formulacao_formulation_change": return '4';
        case "formulacao_dosers_change": return '4';
        case "created": return '1';
        case "status_finished": return '1';
        case "status_inproduction": return '1';
        case "status_stopped": return '1';
        case "gamaoperatoria": return '5';
        case "cortes": return '6';
        case "nonwovens": return '2';
        case "specs": return '3';
        default: return '1';
    }
}

const OrdemFabrico = ({ record }) => {
    const [activeTab, setActiveTab] = useState();
    const submitting = useSubmitting(true);
    const permission = usePermission();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });

    const dTab = useMemo(() => defaultTab(record.type_op), [record.type_op]);

    useEffect(() => {
        setActiveTab(dTab);
    }, [dTab])

    const loadData = async ({ signal }) => {
        try {
            let acs = await loadAuditCurrentSettings({ acsid: record.id, signal });
            if (acs.length > 0) {
                const artigospecs = (typeof acs[0].artigospecs === "string") ? JSON.parse(acs[0].artigospecs) : acs[0].artigospecs;
                const gamaoperatoria = (typeof acs[0].gamaoperatoria === "string") ? JSON.parse(acs[0].gamaoperatoria) : acs[0].gamaoperatoria;
                const cortes = (typeof acs[0].cortes === "string") ? JSON.parse(acs[0].cortes) : acs[0].cortes;
                const cortesordem = (typeof acs[0].cortesordem === "string") ? JSON.parse(acs[0].cortesordem) : acs[0].cortesordem;
                const formulacao = (typeof acs[0].formulacao === "string") ? JSON.parse(acs[0].formulacao) : acs[0].formulacao;
                const nonwovens = (typeof acs[0].nonwovens === "string") ? JSON.parse(acs[0].nonwovens) : acs[0].nonwovens;
                const ofs = (typeof acs[0].ofs === "string") ? JSON.parse(acs[0].ofs) : acs[0].ofs;
                const emendas = (typeof acs[0].emendas === "string") ? JSON.parse(acs[0].emendas) : acs[0].emendas;
                const paletizacao = (typeof acs[0].paletizacao === "string") ? JSON.parse(acs[0].paletizacao) : acs[0].paletizacao;
                const values = {
                    cortes,
                    cortesordem,
                    nonwovens,
                    artigospecs,
                    gamaoperatoria,
                    formulacao,
                    ofs: ofs.map(v => {
                        let _em = emendas.find(x => x.of_id == v.of_id).emendas;
                        let _pal = paletizacao.find(x => x.of_id == v.of_id).paletizacao;
                        _pal = (typeof _pal === "string") ? JSON.parse(_pal) : _pal;
                        if (_pal?.details && _pal.details.length > 1 && _pal.details[0].item_order === 0) {
                            _pal.details = _pal.details.reverse();
                        }
                        v.emendas = (typeof _em === "string") ? JSON.parse(_em) : _em;
                        v.paletizacao = _pal;
                        return v;
                    })
                }
                form.setFieldsValue(values);
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        } finally {
            submitting.end();
        };
    };

    const tabPanes = [
        { label: 'Ordens', key: '1', children: <YScroll style={{ height: "calc(100vh - 160px)" }}><FormAgg form={form} record={form.getFieldsValue(["ofs"])} /></YScroll>, forceRender: true },
        { label: 'Nonwovens', key: '2', children: <YScroll style={{ height: "calc(100vh - 160px)" }}><FormNonwovens form={form} record={form.getFieldsValue(["nonwovens"])} /></YScroll> },
        { label: 'Especificações', key: '3', children: <YScroll style={{ height: "calc(100vh - 160px)" }}><FormArtigoSpecs form={form} record={form.getFieldsValue(["artigospecs"])} /></YScroll> },
        { label: 'Formulação', key: '4', children: <YScroll style={{ height: "calc(100vh - 160px)" }}><FormFormulacaoDosers forInput={false} form={form} record={form.getFieldsValue(["formulacao"])} /></YScroll> },
        { label: 'Gama Operatória', key: '5', children: <YScroll style={{ height: "calc(100vh - 160px)" }}><FormGamaOperatoria form={form} record={form.getFieldsValue(["gamaoperatoria"])} /></YScroll> },
        { label: 'Cortes', key: '6', children: <Suspense fallback={<></>}><FormCortes wrapForm={false} forInput={false} record={{ ...form.getFieldsValue(["cortesordem"]), ...form.getFieldsValue(["cortes"]), ...form.getFieldsValue(["ofs"]) }} /></Suspense> }
    ];

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    return (
        <FormContainer id="frm-of-c" schema={schema} form={form} wrapForm={true} wrapFormItem={true} label={{ enabled: false }} forInput={false} fluid style={{ padding: "0px" }}>
            {submitting.state === false &&
                <Row nogutter><Col>
                    <Tabs /* onChange={() => { }} */ type="card" dark={1} activeKey={activeTab} onChange={(k) => setActiveTab(k)} items={tabPanes} />
                </Col></Row>
            }
        </FormContainer>
    );
}


const StyledPanel = styled(Panel)`
    .ant-collapse-content{
        background-color:#fff !important;
    }
    .ant-collapse-header{
        background:#002766;
        fontWeight:700;
    }
    .ant-collapse-header{
        color:#fff !important;
    }

`;

const forViewBackground = false;
const FormAgg = ({ record, form }) => {
    return (
        <>
            {record?.ofs &&
                <Form.List name={`ofs`}>
                    {(fields, { add, remove, move }) => {
                        const _values = record.ofs;
                        const addRow = (fields) => { }
                        const removeRow = (fieldName, field) => { }
                        const moveRow = (from, to) => { }
                        return (
                            <Collapse
                                bordered={false}
                                defaultActiveKey={['1']}
                                //onChange={onChange}
                                expandIconPosition="start"
                                accordion
                            >
                                {fields.map((field, index) => (
                                    <StyledPanel key={`${index + 1}`} header={`${_values[index].of_cod}`} extra={<div>{_values[index].artigo_des}</div>}>
                                        <YScroll>
                                            <Container fluid style={{ padding: "0px", maxHeight: "60vh", height: "60vh" }}>
                                                <Row style={{ fontWeight: 700, marginBottom: "5px", /* borderBottom: "solid 1px #bfbfbf", */ background: "#d9d9d9", padding: "1px" }}>
                                                    <Col>1. Artigo</Col>
                                                </Row>
                                                <Row gutterWidth={5}>
                                                    <Col xs={3}><Field forViewBackground={forViewBackground} name={[field.name, `artigo_cod`]} label={{ enabled: true, text: "Cód. Artigo" }}><Input size="small" /></Field></Col>
                                                    <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `artigo_gtin`]} label={{ enabled: true, text: "Gtin" }}><Input size="small" /></Field></Col>
                                                    <Col xs={7}><Field forViewBackground={forViewBackground} name={[field.name, `artigo_produto`]} label={{ enabled: true, text: "Produto" }}><Input size="small" /></Field></Col>
                                                </Row>
                                                <Row gutterWidth={5}>
                                                    <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `artigo_lar`]} label={{ enabled: true, text: "Largura" }}><InputNumber style={{ fontWeight: 700 }} addonAfter="mm" size="small" min={1} /></Field></Col>
                                                    <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `artigo_diam_ref`]} label={{ enabled: true, text: "Diâmetro" }}><InputNumber addonAfter="mm" size="small" min={1} /></Field></Col>
                                                    <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `artigo_core`]} label={{ enabled: true, text: "Core" }}><InputNumber addonAfter="''" size="small" min={1} /></Field></Col>
                                                    <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `artigo_gsm`]} label={{ enabled: true, text: "Gramagem" }}><InputNumber addonAfter="gsm" size="small" min={1} /></Field></Col>
                                                    <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `artigo_thickness`]} label={{ enabled: true, text: "Espessura" }}><InputNumber addonAfter={<span>&#x00B5;</span>} size="small" min={1} /></Field></Col>
                                                </Row>
                                                <Row gutterWidth={5}>
                                                    <Col xs={6}><Field forViewBackground={forViewBackground} name={[field.name, `core_des`]} label={{ enabled: true, text: "Core" }}><Input size="small" /></Field></Col>
                                                </Row>
                                                <Row style={{ fontWeight: 700, marginTop: "5px", marginBottom: "5px", /* borderBottom: "solid 1px #bfbfbf", */ background: "#d9d9d9", padding: "1px" }}>
                                                    <Col>2. Encomenda</Col>
                                                </Row>
                                                <Row gutterWidth={5}>
                                                    <Col xs={3}><Field forViewBackground={forViewBackground} name={[field.name, `order_cod`]} label={{ enabled: true, text: "Encomenda" }}><Input style={{ fontWeight: 700 }} size="small" /></Field></Col>
                                                    <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `prf_cod`]} label={{ enabled: true, text: "Prf" }}><Input size="small" /></Field></Col>
                                                    <Col xs={7}><Field forViewBackground={forViewBackground} name={[field.name, `cliente_nome`]} label={{ enabled: true, text: "Cliente" }}><Input style={{ fontWeight: 700 }} size="small" /></Field></Col>
                                                </Row>
                                                <Row gutterWidth={5}>
                                                    <Col xs={3}><Field forViewBackground={forViewBackground} name={[field.name, `qty_encomenda`]} label={{ enabled: true, text: "Qtd. Encomenda" }}><InputNumber addonAfter={<span>m&#178;</span>} style={{ fontWeight: 700 }} size="small" /></Field></Col>
                                                    <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `n_paletes_total`]} label={{ enabled: true, text: "Paletes Total" }}><Input size="small" /></Field></Col>
                                                </Row>
                                                <Row style={{ fontWeight: 700, marginTop: "5px", marginBottom: "5px", /* borderBottom: "solid 1px #bfbfbf", */ background: "#d9d9d9", padding: "1px" }}>
                                                    <Col>3. Emendas</Col>
                                                </Row>
                                                <Row gutterWidth={5}>
                                                    <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `emendas`, `tipo_emenda`]} label={{ enabled: true, text: "Tipo Emenda" }}><SelectField size="small" data={TIPOEMENDA_OPTIONS} textField="value" keyField="key" /></Field></Col>
                                                    <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `emendas`, `maximo`]} label={{ enabled: true, text: "Máximo" }}><InputNumber size="small" addonAfter="%" /></Field></Col>
                                                    <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `emendas`, `paletes_contentor`]} label={{ enabled: true, text: "Paletes/Contentor" }}><InputNumber size="small" /></Field></Col>
                                                    <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `emendas`, `emendas_rolo`]} label={{ enabled: true, text: "Emendas/Rolo" }}><InputNumber size="small" /></Field></Col>
                                                </Row>
                                                <Row style={{ fontWeight: 700, marginTop: "5px", marginBottom: "5px", /* borderBottom: "solid 1px #bfbfbf", */ background: "#d9d9d9", padding: "1px" }}>
                                                    <Col>4. Paletização</Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <FormPaletizacao field={field} form={form} /* record={_values[index].paletizacao} */ />
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <FormPaletizacaoSchema field={field} form={form} /* record={_values[index].paletizacao} */ />
                                                    </Col>
                                                </Row>
                                                {/* <Row gutterWidth={5}>
                                            <Col xs={3}><Field forViewBackground={forViewBackground} name={[field.name, `order_cod`]} label={{ enabled: true, text: "Encomenda" }}><Input style={{ fontWeight: 700 }} size="small" /></Field></Col>
                                            <Col xs={2}><Field forViewBackground={forViewBackground} name={[field.name, `prf_cod`]} label={{ enabled: true, text: "Prf" }}><Input size="small" /></Field></Col>
                                            <Col xs={7}><Field forViewBackground={forViewBackground} name={[field.name, `cliente_nome`]} label={{ enabled: true, text: "Cliente" }}><Input style={{ fontWeight: 700 }} size="small" /></Field></Col>
                                        </Row> */}
                                            </Container>
                                        </YScroll>
                                    </StyledPanel>
                                ))}
                            </Collapse>
                        )
                    }}
                </Form.List>
            }
        </>
    );
}

const FormPaletizacao = ({ record, field, form }) => {
    return (
        <Container fluid style={{ padding: "0px" }}>
            <Row gutterWidth={5}>
                <Col xs={4}><Field forViewBackground={forViewBackground} label={{ enabled: true, text: "Paletes/Contentor", pos: "right", width: "150px" }} name={[field.name, `paletizacao`, `npaletes`]}><InputNumber size="small" min={1} max={150} /></Field></Col>
                <Col xs={4}><Field forViewBackground={forViewBackground} label={{ enabled: true, text: "Etiqueta/Bobine", pos: "right", width: "150px" }} name={[field.name, `paletizacao`, `netiquetas_bobine`]}><InputNumber size="small" min={1} max={10} /></Field></Col>
                <Col xs={4}><Field forViewBackground={forViewBackground} label={{ enabled: true, text: "Filme Estirável/Palete", pos: "right", width: "170px" }} name={[field.name, `paletizacao`, `filmeestiravel_bobines`]}><CheckboxField /></Field></Col>
            </Row>
            <Row gutterWidth={5}>
                <Col xs={4}><Field forViewBackground={forViewBackground} label={{ text: "Altura Máx. Palete", pos: "right", width: "150px" }} name={[field.name, `paletizacao`, "palete_maxaltura"]}><InputNumber size="small" min={1} max={150} addonAfter="m" /></Field></Col>
                <Col xs={4}><Field forViewBackground={forViewBackground} label={{ text: "Etiqueta do Lote da Palete", pos: "right", width: "150px" }} name={[field.name, `paletizacao`, "netiquetas_lote"]}><InputNumber size="small" min={1} max={10} /></Field></Col>
                <Col xs={4}><Field forViewBackground={forViewBackground} label={{ text: "Filme Estirável Exterior", pos: "right", width: "170px" }} name={[field.name, `paletizacao`, "filmeestiravel_exterior"]}><CheckboxField /></Field></Col>
            </Row>
            <Row gutterWidth={5}>
                <Col xs={4}><Field forViewBackground={forViewBackground} required={false} name={[field.name, `paletizacao`, "paletes_sobrepostas"]} label={{ enabled: true, text: "Paletes Sobrepostas", pos: "right", width: "150px" }}><CheckboxField disabled={true} /></Field></Col>
                <Col xs={4}><Field forViewBackground={forViewBackground} label={{ text: "Etiqueta Final da Palete", pos: "right", width: "150px" }} name={[field.name, `paletizacao`, "netiquetas_final"]}><InputNumber size="small" min={1} max={10} /></Field></Col>
            </Row>
            <Row gutterWidth={5}>
                <Col width={20}><Field forViewBackground={forViewBackground} label={{ enabled: false }} name={[field.name, `paletizacao`, "cintas"]}><CheckboxField /></Field></Col>
                <Col width={100}>
                    <Form.Item noStyle style={{ width: "100%" }} shouldUpdate={(prevValues, curValues) => prevValues.ofs[field.name].paletizacao?.cintas !== curValues.ofs[field.name].paletizacao?.cintas}>
                        {() => <Field forViewBackground={forViewBackground} name={[field.name, `paletizacao`, "ncintas"]} label={{ enabled: true, width: "50px", text: "Cintas", pos: "right", colon: false }}>
                            <InputNumber style={{ width: "45px" }} disabled={form.getFieldValue(["ofs", field.name, `paletizacao`, "cintas"]) !== 1} size="small" min={1} max={10} />
                        </Field>
                        }
                    </Form.Item>
                </Col>
                <Col width={150}>
                    <Form.Item noStyle style={{ width: "100%" }} shouldUpdate={(prevValues, curValues) => prevValues.ofs[field.name].paletizacao?.cintas !== curValues.ofs[field.name].paletizacao?.cintas}>
                        {() => <Field forViewBackground={forViewBackground} name={[field.name, `paletizacao`, "cintas_palete"]} label={{ enabled: false }}>
                            <SelectField size="small" data={CINTASPALETES_OPTIONS} keyField="value" textField="label" disabled={form.getFieldValue(["ofs", field.name, `paletizacao`, "cintas"]) !== 1} />
                        </Field>
                        }
                    </Form.Item>
                </Col>
                <Col xs={4}><Field forViewBackground={forViewBackground} label={{ text: "Folha Identificativa da Palete", pos: "left", width: "180px" }} name={[field.name, `paletizacao`, "folha_identificativa"]}><InputNumber size="small" min={0} max={10} /></Field></Col>
            </Row>
        </Container>
    );
}

const FormPaletizacaoSchema = ({ record, field, form, forInput = false }) => {

    const getItem = (item) => {
        return form.getFieldValue(["ofs", field.name, `paletizacao`, "details", item.name, "item_id"]);
    }

    return (
        <Form.List name={[field.name, `paletizacao`, "details"]}>
            {(fields, { add, remove, move }) => {
                const addRow = (fields) => { }
                const removeRow = (fieldName, itemField) => { }
                const moveRow = (from, to) => { }
                return (
                    <Container fluid style={{ padding: "0px", marginTop: "15px" }}>
                        <Row nogutter>
                            <Col style={{ alignSelf: "center" }}>
                                <Container fluid style={{ padding: "0px" }}>
                                    {fields.map((itemField, index) => (
                                        <Row key={`p-sch-${index + 1}`} gutterWidth={5}>
                                            <Col width={15}>{forInput && index > 0 && <IconButton onClick={() => move(index, index - 1)} style={{ alignSelf: "center" }}><CgArrowUpO /></IconButton>}</Col>
                                            <Col width={15}>{forInput && index < (fields.length - 1) && <IconButton onClick={() => move(index, index + 1)} style={{ alignSelf: "center" }}><CgArrowDownO /></IconButton>}</Col>
                                            <Col>
                                                <Field forViewBackground={forViewBackground} label={{ enabled: false }} name={[itemField.name, "item_id"]}>
                                                    <SelectField /* onChange={() => onSelect(itemField.name)} */ size="small" data={PALETIZACAO_ITEMS} keyField="key" textField="value" />
                                                </Field>
                                            </Col>
                                            <Col width={100}>
                                                {getItem(itemField) === 1 && <Field forViewBackground={forViewBackground} label={{ enabled: false }} name={[itemField.name, "item_paletesize"]}>
                                                    <SelectField size="small" data={PALETE_SIZES} keyField="key" textField="value" />
                                                </Field>
                                                }
                                                {getItem(itemField) === 2 && <Field forViewBackground={forViewBackground} label={{ enabled: false }} name={[itemField.name, "item_numbobines"]}>
                                                    <InputNumber size="small" min={1} max={80} />
                                                </Field>
                                                }
                                                {(getItem(itemField) > 2 || getItem(itemField) === undefined) && <></>}
                                            </Col>
                                            <Col width={15}>{forInput && <IconButton onClick={() => remove(itemField.name)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton>}</Col>
                                        </Row>
                                    ))}
                                </Container>
                            </Col>
                            <Col>
                                <SvgSchema form={form} items={form.getFieldValue(["ofs", field.name, `paletizacao`])} />
                            </Col>
                        </Row>
                    </Container>
                )
            }}
        </Form.List>
    );
}

const FormNonwovens = ({ record, form }) => {
    return (
        <FormContainer id="v-nw" form={form} wrapForm={false} wrapFormItem={true} label={{ enabled: false }} forInput={false} fluid>
            <Row>
                <Col>
                    <Field forViewBackground={forViewBackground} forViewBorder={false} name={["nonwovens", "nw_cod_sup"]} label={{ enabled: true, text: "Nonwoven Superior", align: "end" }}>
                        <Input style={{ fontWeight: 700 }} size="small" />
                    </Field>
                    <Field forViewBackground={forViewBackground} name={["nonwovens", "nw_des_sup"]} label={{ enabled: false, text: "Nonwoven Superior", pos: "top" }}>
                        <Input size="small" />
                    </Field>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Field forViewBackground={forViewBackground} forViewBorder={false} name={["nonwovens", "nw_cod_inf"]} label={{ enabled: true, text: "Nonwoven Inferior", align: "end" }}>
                        <Input style={{ fontWeight: 700 }} size="small" />
                    </Field>
                    <Field forViewBackground={forViewBackground} name={["nonwovens", "nw_des_inf"]} label={{ enabled: false, text: "Nonwoven Inferior", pos: "top" }}>
                        <Input size="small" />
                    </Field>
                </Col>
            </Row>
        </FormContainer>
    );
}

const FormArtigoSpecs = ({ record, form }) => {
    useEffect(() => {
        console.log(record)
    }, [])

    const getItem = (key) => {
        return ARTIGOS_SPECS.find(x => x.key === key);
    }

    return (
        <Container fluid style={{ padding: "0px" }}>
            <Row style={{ border: "solid 1px #dee2e6", background: "#f8f9fa", padding: "5px" }}>
                <Col xs={6}>
                    <Field forViewBackground={forViewBackground} name={["artigospecs", "designacao"]} label={{ enabled: false, text: "Especificações", pos: "left" }}>
                        <Input size="small" addonAfter={<b>v.{record.artigospecs.versao}</b>} />
                    </Field>
                </Col>
            </Row>
            <Row nogutter style={{ margin: "10px 0px" }}>
                <Col xs={6}>
                    <Field forViewBackground={forViewBackground} name={["artigospecs", "cliente_nome"]} label={{ enabled: false }}>
                        <Input size="small" />
                    </Field>
                </Col>
            </Row>
            <Row nogutter>
                <Col>
                    <Form.List name={[`artigospecs`, `items`]}>
                        {(fields, { add, remove, move }) => {
                            const _values = record.artigospecs;
                            const addRow = (fields) => { }
                            const removeRow = (fieldName, field) => { }
                            const moveRow = (from, to) => { }
                            return (
                                <Container fluid style={{ padding: "0px" }}>
                                    <Row nogutter wrap='nowrap'>
                                        <Col xs={5}></Col>
                                        <Col style={{ textAlign: "center", fontWeight: 700 }} xs={2}>TDS</Col>
                                        <Col width={5}></Col>
                                        <Col style={{ textAlign: "center", fontWeight: 700 }} xs={2}>Objetivo</Col>
                                    </Row>
                                    <Row nogutter wrap='nowrap'>
                                        <Col xs={5}></Col>
                                        <Col style={{ textAlign: "center" }} xs={1}>Min.</Col>
                                        <Col style={{ textAlign: "center" }} xs={1}>Máx.</Col>
                                        <Col width={5}></Col>
                                        <Col style={{ textAlign: "center" }} xs={1}>Min.</Col>
                                        <Col style={{ textAlign: "center" }} xs={1}>Máx.</Col>
                                    </Row>
                                    {fields.map((field, index) => {
                                        let v = getItem(_values.items[index].item_key);
                                        return (
                                            <Row gutterWidth={2} wrap='nowrap' key={`a-specs-${index + 1}`}>
                                                <Col xs={5} style={{ fontSize: "11px" }}><b>{v.designacao}</b> ({v.unidade})</Col>
                                                {_values.items[index].item_values.map((x, i) => {
                                                    return (
                                                        <React.Fragment key={`ispecs-${index}-${i}`}>
                                                            {i === 2 &&
                                                                <Col style={{ textAlign: "center" }} width={5}></Col>
                                                            }
                                                            <Col style={{ textAlign: "center" }} xs={1}>
                                                                <Field name={[field.name, "item_values", i]} label={{ enabled: false }}>
                                                                    <InputNumber min={v.min} max={v.max} controls={false} size="small" precision={v?.precision} />
                                                                </Field>
                                                            </Col>
                                                        </React.Fragment>
                                                    )
                                                })}
                                            </Row>
                                        );
                                    })}
                                </Container>
                            );
                        }}
                    </Form.List >
                </Col>
            </Row>
        </Container>
    );
}

const FormGamaOperatoria = ({ record, form }) => {

    const getItem = (key) => {
        return GAMAOPERATORIA.find(x => x.key === key);
    }

    return (
        <Container fluid style={{ padding: "0px" }}>
            <Row style={{ border: "solid 1px #dee2e6", background: "#f8f9fa", padding: "5px", marginBottom: "10px" }}>
                <Col xs={6}>
                    <Field forViewBackground={forViewBackground} name={["gamaoperatoria", "designacao"]} label={{ enabled: false, text: "Gama Operatória", pos: "left" }}>
                        <Input size="small" addonAfter={<b>v.{record.gamaoperatoria.versao}</b>} />
                    </Field>
                </Col>
            </Row>
            {/* <Row nogutter style={{ margin: "10px 0px" }}>
                <Col xs={6}>
                    <Field forViewBackground={forViewBackground} name={["gamaoperatoria", "cliente_nome"]} label={{ enabled: false }}>
                        <Input size="small" />
                    </Field>
                </Col>
            </Row> */}
            <Row nogutter>
                <Col>
                    <Form.List name={[`gamaoperatoria`, `items`]}>
                        {(fields, { add, remove, move }) => {
                            const _values = record.gamaoperatoria;
                            const addRow = (fields) => { }
                            const removeRow = (fieldName, field) => { }
                            const moveRow = (from, to) => { }
                            return (
                                <Container fluid style={{ padding: "0px" }}>
                                    {fields.map((field, index) => {
                                        let v = getItem(_values.items[index].item_key);
                                        return (
                                            <Row gutterWidth={2} wrap='nowrap' key={`g-oper-${index + 1}`}>
                                                <Col xs={5} style={{ fontSize: "11px" }}><b>{v.designacao}</b> ({v.unidade})</Col>
                                                <Col>
                                                    <Container fluid style={{ padding: "0px" }}>
                                                        <Row gutterWidth={2}>
                                                            {_values.items[index].item_values.map((x, i) => {
                                                                return (
                                                                    <React.Fragment key={`ioper-${index}-${i}`}>
                                                                        <Col style={{ textAlign: "center" }} xs={1}>
                                                                            <Field name={[field.name, "item_values", i]} label={{ enabled: false }}>
                                                                                <InputNumber min={v.min} max={v.max} controls={false} size="small" precision={v?.precision} />
                                                                            </Field>
                                                                        </Col>
                                                                    </React.Fragment>
                                                                )
                                                            })}
                                                            <Col style={{ textAlign: "center" }}>
                                                                <Field layout={{ center: { "max-width": "50px" }, middle: { "justify-content": "end" } }} name={[field.name, "tolerancia"]} label={{ enabled: false }}>
                                                                    <InputNumber addonBefore="&plusmn;" min={0} max={100} controls={false} size="small" precision={v?.precision} />
                                                                </Field>
                                                            </Col>
                                                        </Row>
                                                    </Container>
                                                </Col>
                                            </Row>
                                        );
                                    })}
                                </Container>
                            );
                        }}
                    </Form.List >
                </Col>
            </Row>
        </Container>
    );
}



export default ({ record, card, parentReload }) => {
    const socketContext = useContext(SocketContext);
    const navigate = useNavigate();
    const classes = useStyles();
    const [visible, setVisible] = useState({ drawer: { open: false } });
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/eventosproducao/`, parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <Drawer size='large' open={true} onClose={hideModal} title={modalParameters.drawer?.title}/*  width={800} *//*  height={400} */>
            <OrdemFabrico record={modalParameters.drawer} />
        </Drawer>
    ), [modalParameters]);



    const loadData = async ({ signal } = {}) => {
        dataAPI.addFilters({ "csid": record.id }, true, true);
        dataAPI.fetchPost({ signal });
    }

    /*     useEffect(() => {
            const controller = new AbortController();
            loadData({signal: controller.signal });
            return (() => {controller.abort(); });
        }, []); */

    useEffect(() => {
        if (socketContext?.hash?.hash_auditcs) {
            loadData();
        }

    }, [socketContext?.hash?.hash_auditcs, record?.id]);



    const onView = () => {
        //navigate("/app/logslist/lineloglist", { state: { tstamp: Date.now() } });
    }

    const onOpen = (component, data) => {
        setModalParameters({ [component]: { ...data, title: <div style={{display:"flex",alignItems:"center"}}><FieldTimeOutlined style={{fontSize:"18px",marginRight:"5px"}}/>Ordem de Fabrico em <span style={{ marginLeft:"5px", fontWeight: 900 }}>{moment(data.timestamp).format(DATETIME_FORMAT)}</span></div>, open: true } });
        showModal();
        //setVisible(prev => ({...prev, [component]: {...data, title: <div>Ordem de Fabrico em <span style={{ fontWeight: 900 }}>{moment(data.timestamp).format(DATETIME_FORMAT)}</span></div>, open: true } }));
    }

    const onClose = (component) => {
        //setVisible(prev => ({ ...prev, [component]: { open: false } }));
    }

    return (
        <>
            {/* <Drawer destroyOnClose title={visible.drawer?.title} open={visible.drawer.open} size="large" onClose={() => onClose("drawer")}><OrdemFabrico record={visible.drawer} /></Drawer> */}
            <Card
                hoverable
                headStyle={{ padding: "0px 32px 0px 12px" }}
                style={{ height: "100%", border: "1px solid #8c8c8c" }}
                bodyStyle={{ height: "calc(100% - 61px)" }}
                size="small"
                title={<TitleCard title={card.title} />}
                extra={<></>}
            >
                <YScroll>
                    <Container fluid>
                        {dataAPI.hasData() && dataAPI.getData().rows.map((v, idx) => {
                            return (<Row key={`evt-prod-${v.id}`} gutterWidth={5} wrap="nowrap" style={{ borderBottom: "solid 1px #d9d9d9", display: "flex", alignItems: "center", ...(dataAPI.getData().rows.length === (idx + 1) && { fontWeight: 800 }) }}>
                                <Col xs="content">{idx}</Col>
                                <Col><Status onClick={(e) => onOpen("drawer", v)} type_op={v.type_op} last={dataAPI.getData().rows.length === (idx + 1)} /></Col>
                                <Col xs="content">{moment(v.timestamp).format(DATETIME_FORMAT)}</Col>
                            </Row>)
                        })}
                    </Container>
                </YScroll>
            </Card>
        </>
    );
}
