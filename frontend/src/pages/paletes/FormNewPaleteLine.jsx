import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { uid } from 'uid';
import { useImmer } from 'use-immer';
import { useNavigate, useLocation } from "react-router-dom";
import { ConditionalWrapper } from 'components/conditionalWrapper';
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, sleep } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS, CINTASPALETES_OPTIONS, PALETES_WEIGH } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch, Tooltip, Steps, Badge, Popover } from "antd";
const { Step } = Steps;
const { TextArea } = Input;
// import ToolbarTitle from './commons/ToolbarTitle';
const { Title } = Typography;
import { json } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, CheckCircleTwoTone, CloseCircleTwoTone, CloseCircleFilled, InfoCircleOutlined, CheckCircleFilled } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba } from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser, HorizontalRule } from 'components/FormFields';
import YScroll from 'components/YScroll';
import XScroll from 'components/XScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';
import IconButton from "components/iconButton";
import { MdAdjust, MdAssignmentReturned } from 'react-icons/md';
import SvgSchema from './paletizacao/SvgSchema';

const title = "Nova Palete de Produto Acabado";
const TitleForm = ({ data, onChange, level, auth, form }) => {
    return (<ToolbarTitle id={auth?.user} description={title} title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }} wrap="nowrap" nogutter>
                <Col xs='content' style={{}}><Row nogutter><Col title={title} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}><span style={{}}><div style={{ fontWeight: 900 }}>Nova Palete <span>de linha</span> <span style={{ fontSize: "12px", fontWeight: 400 }}>{data?.of}</span></div></span></Col></Row></Col>
                {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
            </Row>

        </Col>
    </>
    }
    />);
}

const schema = (options = {}) => {
    return getSchema({
        pesobruto: Joi.number().positive().label("Peso Bruto").required(),
        pesopalete: Joi.number().positive().label("Peso da Palete").required()
    }, options).unknown(true);
}

const useStyles = createUseStyles({
    container: {
        margin: "1px",
        display: "flex",
        alignItems: "stretch",
        border: "1px solid #d9d9d9"
    },
    valueBorder: {
        flex: 1,
        paddingLeft: "2px",
        /* boxSizing: "border-box",  */
        /* border: "1px solid #d9d9d9", */
    },
    valueBorder1: {
        flex: 1,
        paddingLeft: "2px",
        background:"#f0f0f0"
        /* boxSizing: "border-box",  */
        /* border: "1px solid #d9d9d9", */
    },
    labelBorder: {
        paddingLeft: "2px",
        display: "flex",
        alignItems: "center",
        /* marginRight: "2px",  */
        width: "155px",
        borderRight: "1px solid #d9d9d9"
        /* boxSizing: "border-box",   */
        /*  border: "1px solid #d9d9d9", */
        /*  borderRight: "none" */
    },
});

const loadPaletizacao = async (params, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...params }, sort: [], parameters: { method: "GetPaletizacao" }, signal });
    if (rows && rows.length > 0) {
        const j = json(rows[0]?.paletizacao);
        const cintas_option = CINTASPALETES_OPTIONS.find(v => v.value == j.cintas_palete)?.label;
        return { ...j, designacao: `${j.contentor_id}`, /* designacao: `${j.contentor_id} ${rows[0].designacao}`, */ cintas_option, folha_identificativa: j?.folha_identificativa ? 1 : 0 };
    }
    return {};
}

// const Report = ({ data }) => {
//     return (
//         <>
//             <Row nogutter style={{ fontWeight: 700, fontSize: "12px" }}>
//                 {data.chk_artigos > 0 && <Col width={60} style={{ textAlign: "center" }}>Artigos</Col>}
//                 {data.chk_produtos > 0 && <Col width={60} style={{ textAlign: "center" }}>Produtos</Col>}
//                 {data.chk_bobines > 0 && <Col width={60} style={{ textAlign: "center" }}>Bobines</Col>}
//                 {data.chk_cores > 0 && <Col width={60} style={{ textAlign: "center" }}>Cores</Col>}
//                 {data.chk_diams > 0 && <Col width={60} style={{ textAlign: "center" }}>Diâmetros</Col>}
//                 {data.chk_duplicates > 0 && <Col width={60} style={{ textAlign: "center" }}>Duplicadas</Col>}
//                 {data.chk_emendas > 0 && <Col width={60} style={{ textAlign: "center" }}>Emendas</Col>}
//                 {data.chk_estados > 0 && <Col width={60} style={{ textAlign: "center" }}>Estados</Col>}
//                 {data.chk_expired > 0 && <Col width={60} style={{ textAlign: "center" }}>Expiradas</Col>}
//                 {data.chk_larguras > 0 && <Col width={60} style={{ textAlign: "center" }}>Larguras</Col>}
//                 {data.chk_paletes > 0 && <Col width={60} style={{ textAlign: "center" }}>Paletes</Col>}
//             </Row>
//             <Row nogutter style={{ fontSize: "12px", marginBottom: "5px" }}>
//                 {data.chk_artigos > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_artigos}</Col>}
//                 {data.chk_produtos > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_produtos}</Col>}
//                 {data.chk_bobines > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_bobines}</Col>}
//                 {data.chk_cores > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_cores}</Col>}
//                 {data.chk_diams > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_diams}</Col>}
//                 {data.chk_duplicates > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_duplicates}</Col>}
//                 {data.chk_emendas > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_emendas}</Col>}
//                 {data.chk_estados > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_estados}</Col>}
//                 {data.chk_expired > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_expired}</Col>}
//                 {data.chk_larguras > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_larguras}</Col>}
//                 {data.chk_paletes > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_paletes}</Col>}
//             </Row>
//         </>
//     );
// }


const ContentStep = styled.div`
    /*color: rgba(0, 0, 0, 0.45);*/
    /*background-color: rgba(0, 0, 0, 0.02);*/
    padding:10px;
    border-radius: 5px;
    border: 1px dashed #d9d9d9;
    margin-top: 5px;
`;

const ErrorsPopover = ({ item }) => {
    return (<ul>
        {item.artigo_ok == 1 && <li>Artigo não corresponde ao da ordem de fabrico</li>}
        {item.produto_ok == 1 && <li>Produto não corresponde ao da ordem de fabrico</li>}
        {item.bobine_ok == 1 && <li>A bobine não existe, foi reciclada ou o comprimento é igual a zero</li>}
        {item.core_ok == 1 && <li>O core não corresponde ao da ordem de fabrico</li>}
        {item.diam_ok == 1 && <li>O diâmetro da bobine não está dentro dos limites establecidos pelo cliente</li>}
        {item.duplicate == 1 && <li>Existem bobines duplicadas</li>}
        {item.emendas_ok == 1 && <li>Número de emendas excede o definido na ordem de fabrico</li>}
        {item.estado_ok == 1 && <li>Estado da bobine diferente de GOOD</li>}
        {item.expired_ok == 1 && <li>Bobine foi produzida à mais de 3 meses</li>}
        {item.largura_ok == 1 && <li>Largura não corresponde à da ordem de fabrico</li>}
        {item.palete_ok == 1 && <li>Bobine encontra-se numa palete final</li>}
    </ul>)
}

const Report = ({ report, lvl, bobines, onBobineChange, forInput = true }) => {
    const inputRef = useRef(null);
    useEffect(() => {

        inputRef.current.focus();

    }, []);

    return (

        <Row nogutter style={{}} wrap='nowrap'>
            <Visible xs sm md>
                <Col style={{ height: "calc(100vh - 240px)" }}>
                    <YScroll>
                        {(lvl?.nbobines && lvl?.nbobines > 0) && bobines.map((_, idx) => (
                            <Row nogutter key={`pbob-${idx}`} style={{ fontWeight: 700, fontSize: "14px", justifyContent: "center", alignItems: "center" }} wrap='nowrap'>
                                <Col width={30}>{idx + 1}</Col>
                                <Col width={150}><Input {...idx == 0 && { ref: inputRef }} readOnly={!forInput} onChange={(e) => onBobineChange && onBobineChange(e, idx)} value={bobines[idx]} /></Col>
                                {(report && report.length > 0) &&
                                    <Col width={65} style={{ textAlign: "center" }}>{report[idx].isok == 1 ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <Popover content={<ErrorsPopover item={report[idx]} />} title="Erros" trigger="click"><CloseCircleFilled style={{ color: "#f5222d" }} /></Popover>}</Col>
                                }
                            </Row>
                        ))}
                    </YScroll>
                </Col>
            </Visible>
            <Hidden xs sm md>
                <Col>
                    {(report && report.length > 0) &&
                        <>
                            {/*                                 <Row nogutter style={{ border: "1px solid #ffccc7", borderRadius: "3px" }}>
                    <Col xs="content" style={{ alignSelf: "center", paddingLeft: "5px" }}><CloseCircleFilled style={{ fontSize: "18px", color: "red" }} /></Col>
                    <Col><Report data={report[0]} /></Col>
                </Row> */}
                            <Row nogutter style={{ fontSize: "12px", alignItems: "center", justifyContent: "center" }} wrap='nowrap'>
                                <Col width={30}></Col>
                                <Col width={150}></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Badge count={report[0]?.chk_artigos} showZero={false} /></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Badge count={report[0]?.chk_produtos} showZero={false} /></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Badge count={report[0]?.chk_bobines} showZero={false} /></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Badge count={report[0]?.chk_cores} showZero={false} /></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Badge count={report[0]?.chk_diams} showZero={false} /></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Badge count={report[0]?.chk_duplicates == 0 ? 0 : '.'} showZero={false} /></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Badge count={report[0]?.chk_emendas} showZero={false} /></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Badge count={report[0]?.chk_estados} showZero={false} /></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Badge count={report[0]?.chk_expired} showZero={false} /></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Badge count={report[0]?.chk_larguras} showZero={false} /></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Badge count={report[0]?.chk_paletes} showZero={false} /></Col>
                            </Row>
                            <Row nogutter style={{ fontSize: "12px", alignItems: "center", justifyContent: "center" }} wrap='nowrap'>
                                <Col width={30}></Col>
                                <Col width={150}></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: o artigo não corresponde ao da ordem de fabrico">Artigo</Tooltip></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: o produto não corresponde ao da ordem de fabrico">Produto</Tooltip></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: a bobine não existe, foi reciclada ou o comprimento é igual a zero">Bobine</Tooltip></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: o core não corresponde ao da ordem de fabrico">Core</Tooltip></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: o diametro da bobine não está dentro dos limites establecidos pelo cliente">Diâmetro</Tooltip></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: existirem bobines duplicadas">Duplicada</Tooltip></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: o número de emendas excede o definido na ordem de fabrico">Emendas</Tooltip></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: o estado da bobine for diferente de GOOD">Estado</Tooltip></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: a bobine foi produzida à mais de 3 meses">Expirada</Tooltip></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: a largura não corresponde à da ordem de fabrico">Largura</Tooltip></Col>
                                <Col width={65} style={{ textAlign: "center" }}><Tooltip title="Erro se: a bobine se encontra numa palete final" trigger={["click", "hover"]}>Palete</Tooltip></Col>
                            </Row>
                        </>
                    }
                    <Row nogutter>
                        <Col style={{ height: "calc(100vh - 240px)" }}>
                            <YScroll>
                                {(lvl?.nbobines && lvl?.nbobines > 0) && bobines.map((_, idx) => (
                                    <Row nogutter key={`pbob-${idx}`} style={{ fontWeight: 700, fontSize: "14px", justifyContent: "center", alignItems: "center" }} wrap='nowrap'>
                                        <Col width={30}>{idx + 1}</Col>
                                        <Col width={150}><Input {...idx == 0 && { ref: inputRef }} readOnly={!forInput} onChange={(e) => onBobineChange && onBobineChange(e, idx)} value={bobines[idx]} /></Col>
                                        {(report && report.length > 0) && <>
                                            <Col width={65} style={{ textAlign: "center" }}>{report[idx].artigo_ok == 1 ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <CloseCircleFilled style={{ color: "#f5222d" }} />}</Col>
                                            <Col width={65} style={{ textAlign: "center" }}>{report[idx].produto_ok == 1 ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <CloseCircleFilled style={{ color: "#f5222d" }} />}</Col>
                                            <Col width={65} style={{ textAlign: "center" }}>{report[idx].bobine_ok == 1 ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <CloseCircleFilled style={{ color: "#f5222d" }} />}</Col>
                                            <Col width={65} style={{ textAlign: "center" }}>{report[idx].core_ok == 1 ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <CloseCircleFilled style={{ color: "#f5222d" }} />}</Col>
                                            <Col width={65} style={{ textAlign: "center" }}>{report[idx].diam_ok == 1 ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <CloseCircleFilled style={{ color: "#f5222d" }} />}</Col>
                                            <Col width={65} style={{ textAlign: "center" }}>{report[idx].duplicate == 1 ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <CloseCircleFilled style={{ color: "#f5222d" }} />}</Col>
                                            <Col width={65} style={{ textAlign: "center" }}>{report[idx].emendas_ok == 1 ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <CloseCircleFilled style={{ color: "#f5222d" }} />}</Col>
                                            <Col width={65} style={{ textAlign: "center" }}>{report[idx].estado_ok == 1 ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <CloseCircleFilled style={{ color: "#f5222d" }} />}</Col>
                                            <Col width={65} style={{ textAlign: "center" }}>{report[idx].expired_ok == 1 ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <CloseCircleFilled style={{ color: "#f5222d" }} />}</Col>
                                            <Col width={65} style={{ textAlign: "center" }}>{report[idx].largura_ok == 1 ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <CloseCircleFilled style={{ color: "#f5222d" }} />}</Col>
                                            <Col width={65} style={{ textAlign: "center" }}>{report[idx].palete_ok == 1 ? <CheckCircleFilled style={{ color: "#52c41a" }} /> : <CloseCircleFilled style={{ color: "#f5222d" }} />}</Col>
                                        </>}
                                    </Row>
                                ))}
                            </YScroll>
                        </Col>
                    </Row>
                </Col>
            </Hidden>
        </Row>

    );
}

const SelectPalete = ({ form, inputParameters, submitting, onNewPalete }) => {
    const classes = useStyles();

    return (<Row nogutter>
        <Hidden xs sm md><Col xs={3}></Col></Hidden>
        <Col style={{ /* display: "flex", justifyContent: "center" */ }}>

            <Row nogutter style={{ /* borderBottom: "solid 1px #d9d9d9" */ }}>
                {/* <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Designação</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} name="designacao" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col> */}
                {/* <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Paletes/Contentor</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} name="npaletes" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col> */}
                <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Etiquetas/Bobine</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} name="netiquetas_bobine" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col>
                <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Etiqueta do Lote da Palete</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} name="netiquetas_lote" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col>
                <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Filme Estirável/Palete</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} required={false} name="filmeestiravel_bobines" label={{ enabled: false }}><CheckboxField /></Field></div></div></Col>
                {/* <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Altura Máx. Palete</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} name="palete_maxaltura" forInput={false} label={{ enabled: false }}><Input size="small" addonAfter="m" style={{ fontWeight: 700 }} /></Field></div></div></Col> */}

                <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Filme Estirável Exterior</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} required={false} name="filmeestiravel_exterior" label={{ enabled: false }}><CheckboxField /></Field></div></div></Col>
                {/* <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Paletes Sobrepostas</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} required={false} name="paletes_sobrepostas" label={{ enabled: false }}><CheckboxField /></Field></div></div></Col> */}
                <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Etiqueta Final da Palete</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} name="netiquetas_final" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col>
                {form.getFieldValue("cintas") == 1 && <>
                    <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Cintas</div><Field name="ncintas" forViewBorder={false} forViewBackground={false} forInput={false} label={{ enabled: false }}><Input size="small" /></Field><Field forViewBorder={false} forViewBackground={false} name="cintas_option" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></Col>
                </>}
                <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Folha Identificativa</div><Field name="folha_identificativa" forViewBorder={false} forViewBackground={false} forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></Col>
            </Row>
            <Row nogutter style={{ marginTop: "20px" }}>
                <Col xs={12}><SvgSchema form={form} changedValues={submitting.state} reverse={true} onClick={onNewPalete} /></Col>
            </Row>

        </Col>
        <Hidden xs sm md><Col xs={3}></Col></Hidden>
    </Row>);
}
const PickBobines = ({ report, lvl, bobines, onBobineChange, onCheckBobines, onCancel }) => {
    return (
        <>
            <Row nogutter style={{ width: "100%", /* backgroundColor: "rgba(0, 0, 0, 0.02)", */ marginBottom: "5px", padding: "5px" }}>
                <Col xs="content"><Button onClick={() => onCancel(true)}>Anterior</Button></Col>
                <Col></Col>
                <Col xs="content"><Button type="primary" onClick={onCheckBobines}>Seguinte</Button></Col>
            </Row>
            <Row nogutter >
                <Hidden xs sm md><Col xs={2}></Col></Hidden>
                <Col style={{}}>
                    <Report report={report} lvl={lvl} bobines={bobines} onBobineChange={onBobineChange} forInput={true} />
                </Col>
                <Hidden xs sm md><Col xs={2}></Col></Hidden>
            </Row >
        </>
    );
}
const WeighPalete = ({ form, onCancel, onCreate }) => {
    return (
        <>
            <Row nogutter style={{ width: "100%", /* backgroundColor: "rgba(0, 0, 0, 0.02)", */ marginBottom: "5px", padding: "5px" }}>
                <Col xs="content"><Button onClick={() => onCancel(false)}>Anterior</Button></Col>
                <Col></Col>
                <Col xs="content"><Button type="primary" onClick={onCreate}>Criar Palete</Button></Col>
            </Row>
            <Row nogutter>
                <Hidden xs sm md><Col xs={4}></Col></Hidden>
                <Col style={{ /* display: "flex", justifyContent: "center" */ }}>

                    <Row nogutter style={{ /* borderBottom: "solid 1px #d9d9d9" */ }}>
                        <Col></Col>
                        <Col xs="content"><Field forInput={true} wrapFormItem={true} name="pesobruto" label={{ enabled: true, text: "Peso bruto" }}><InputNumber addonAfter="kg" /></Field></Col>
                        <Col width={5}></Col>
                        <Col xs="content"><Field forInput={true} wrapFormItem={true} name="pesopalete" label={{ enabled: true, text: "Peso palete" }}><SelectField keyField="key" textField="value" data={PALETES_WEIGH} /></Field></Col>
                        <Col></Col>
                    </Row>

                </Col>
                <Hidden xs sm md><Col xs={4}></Col></Hidden>
            </Row>
        </>
    );
}
const Done = ({ bobines, onOk }) => {
    return (
        <>
            <Row nogutter >
                <Hidden xs sm md><Col xs={2}></Col></Hidden>
                <Col style={{}}>
                    <Button onClick={onOk}>OK</Button>
                </Col>
                <Hidden xs sm md><Col xs={2}></Col></Hidden>
            </Row >
        </>
    );
}

const steps = [
    {
        key: "1",
        title: "Selecionar Palete",
        content: <SelectPalete />,
    },
    {
        key: "2",
        title: "Picar Bobines",
        content: <PickBobines />,
    },
    {
        key: "3",
        title: "Pesar Palete",
        content: <WeighPalete />,
    }, {
        key: "4",
        title: "Concluído",
        content: <Done />,
    }

];

const _bobines = ["30221222-05-01", "30221222-06-01", "30221222-07-01", "30221222-08-01", "30221222-09-01", "30221222-10-01", "30221222-11-01", "30221222-12-01", '30230113-14-01',
    '30230113-15-01',
    '30230113-16-01',
    '30230113-17-01',
    '30230113-18-01',
    '30230113-19-01',
    '30230113-20-01', "30221222-05-01", "30221222-06-01", "30221222-07-01", "30221222-08-01", "30221222-09-01", "30221222-10-01", "30221222-11-01", "30221222-12-01", '30230113-14-01',
    '30230113-15-01',
    '30230113-16-01',
    '30230113-17-01',
    '30230113-18-01',
    '30230113-19-01',
    '30230113-20-01',
    "30221222-05-01", "30221222-06-01", "30221222-07-01", "30221222-08-01", "30221222-09-01", "30221222-10-01", "30221222-11-01", "30221222-12-01", '30230113-14-01',
    '30230113-15-01',
    '30230113-16-01',
    '30230113-17-01',
    '30230113-18-01',
    '30230113-19-01',
    '30230113-20-01', '30230113-19-01',
    '30230113-20-01'];

export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "paletes", item: "newPalete" });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: false, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});
    const [currentStep, setCurrentStep] = useState(0);
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
    const [lvl, setLvl] = useState({ nbobines: 0, lvl: 0 });
    const [bobines, updateBobines] = useImmer();
    const [report, setReport] = useState();

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                // case "ordensfabrico": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters?.filter, { ...location?.state }, null);
            inputParameters.current = paramsIn;
        }
        setFormDirty(false);
        // if (inputParameters.current?.new) {
        //     form.setFieldsValue({ joinbc: 1, reference: 0 });
        // } else {
        console.log("aaaaaaaaaaaa", inputParameters.current)
        const data = await loadPaletizacao({ ...inputParameters.current }, signal);
        form.setFieldsValue(data);
        //dataAPI.setData({ ...data });
        //     form.setFieldsValue({
        //         joinbc: 1, reference: 0, ...formulacao,
        //         cliente: { BPCNUM_0: formulacao?.cliente_cod, BPCNAM_0: formulacao?.cliente_nome },
        //         produto_id: formulacao?.produto_id,
        //         artigo_id: formulacao?.artigo_id
        //     });
        // }
        submitting.end();
    }


    const _newPalete = (v, _lvl) => {
        const nbobines = v.filter(x => x.item_id == 2).reduce((acc, cur) => acc + cur.item_numbobines, 0);
        setLvl({ nbobines, lvl: _lvl });
        updateBobines(Array(nbobines).fill(null));
        setReport(null);
        form.setFieldsValue({ pesobruto: null, pesopalete: null });
    }

    const _cancelPalete = () => {
        setLvl({ nbobines: 0, lvl: 0 });
        updateBobines([]);
        setReport(null);
        form.setFieldsValue({ pesobruto: null, pesopalete: null });
    }

    const onNewPalete = (v, _lvl) => {
        if (lvl?.nbobines > 0) {
            Modal.confirm({
                title: "Atenção!",
                content: "Tem a criação de uma palete em curso. Ao confirmar, os dados relativos à palete serão perdidos. Tem a certeza que deseja continuar?", onOk: () => _newPalete(v, _lvl)
            });
        } else {
            _newPalete(v, _lvl);
            nextStep();
        }
    }

    const onValuesChange = (changed, all) => {
        // if (!("reference" in changed)) {
        //     setFormDirty(true);
        // }
    }

    const onBobineChange = (e, idx) => {
        updateBobines(draft => { draft[idx] = e.target.value; });
    }

    const onCheckBobines = async (next = true) => {
        let ret = false;
        submitting.trigger();
        try {
            const response = await fetchPost({ url: `${API_URL}/paletes/sql/`, parameters: { method: "CheckBobinesPaleteLine", ...inputParameters.current, bobines: _bobines, ...lvl } });
            if (response?.data?.status !== "error") {
                if (response.data?.data) {
                    setReport(response.data.data);
                    if (response.data.data.length > 0 && response.data.data[0].isok == 0) {
                        ret = true;
                        if (next) {
                            nextStep();
                        }
                    }
                } else {
                    openNotification(response?.data?.status, 'top', "Notificação", "Erro ao verifcar bobines picadas na palete! Não foram retornados registos.", null);
                }
            } else {
                openNotification(response?.data?.status, 'top', "Notificação", response?.data?.title, null);
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        };
        submitting.end();
        return ret;
    };

    const onCancel = (clear = true) => {
        if (clear) {
            Modal.confirm({
                title: "Atenção!",
                content: "Tem a criação de uma palete em curso. Ao retroceder, os dados relativos à palete serão perdidos. Tem a certeza que deseja continuar?", onOk: () => {
                    _cancelPalete();
                    prevStep();
                }
            });
        } else {
            prevStep();
        }
    }

    const onOk = () => {
        setCurrentStep(0);
        _cancelPalete();
    }

    // const onWeigh = () => {
    //     const _values = form.getFieldsValue(true);
    //     const v = schema().validate(_values, { abortEarly: false, messages: validateMessages, context: {} });
    //     let { errors, warnings, value, ...status } = getStatus(v);
    //     setFieldStatus({ ...status.fieldStatus });
    //     setFormStatus({ ...status.formStatus });
    //     if (errors === 0) {
    //         onCheckBobines(false);
    //         nextStep();
    //     }
    // }




    const onCreate = async () => {

        const _values = form.getFieldsValue(true);
        const v = schema().validate(_values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!UNCOMMENT")
        //!!!!!!!!!!!!!!!!!!!!!!!!!!UNCOMMENT
        /* if (errors == 0) {
            const _nbobines = bobines.filter(item => !item).length;
            if (_nbobines > 0) {
                errors = 1;
                status.formStatus.error.push({ message: "Existem bobines que não foram picadas!" });
                prevStep();
            } else {
                const isok = await onCheckBobines(false);
                if (!isok){
                    prevStep();
                }
            }
        } */
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            submitting.trigger();

            try {
                const response = await fetchPost({ url: `${API_URL}/paletes/sql/`, parameters: { method: "CreatePaleteLine", ...inputParameters.current, bobines: _bobines, ...lvl, pesobruto: _values?.pesobruto, pesopalete: _values?.pesopalete } });
                if (response?.data?.status !== "error") {
                    if (response.data?.data) {
                        setReport(response.data.data);
                        if (response.data.data.length > 0 && response.data.data[0].isok == 0) {
                            nextStep();
                        }
                        console.log(response.data.data);
                    } else {
                        openNotification(response?.data?.status, 'top', "Notificação", "Erro ao criar palete! Não foram retornados registos.", null);
                    }
                } else {
                    openNotification(response?.data?.status, 'top', "Notificação", response?.data?.title, null);
                }
                // if (granulado.length === 0 && bobinagem.valid == 0) {
                //     setModalParameters({ setFormStatus, submitting, status, data: { bobines: rows, values, bobinagem }, loadData });
                //     showNewLoteModal();
                // } else {
                //     await validarSubmit(status, { bobines: rows, values: { ...values, nome: bobinagem.nome }, bobinagem }, setFormStatus, submitting, loadData);
                // }
            } catch (e) {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            };
            submitting.end();
        }

    }

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };


    return (
        <YScroll>
            {!setFormTitle && <TitleForm auth={permission.auth} data={inputParameters.current} /* onChange={onFilterChange} */ /* level={location?.state?.level} */ /* form={formFilter}  */ />}
            <FormContainer id="form" fluid schema={schema} loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onValuesChange={onValuesChange} wrapFormItem={true} forInput={mode.datagrid.edit} style={{ padding: "0px" }} alert={{ tooltip: true, pos: "none" }}>
                <Row nogutter>




                    <Hidden xs sm md><Col xs={3}></Col></Hidden>
                    <Col style={{ /* display: "flex", justifyContent: "center" */ }}>
                        
                        <Row nogutter style={{ /* borderBottom: "solid 1px #d9d9d9" */ }}>
                            <Col xs={12} md={10}><div className={classes.container}><div className={classes.labelBorder}>Cliente</div><div className={classes.valueBorder1}><Field forViewBorder={false} forViewBackground={false} name="cliente_nome" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700, fontSize:"20px" }} /></Field></div></div></Col>
                            <Col xs={6} md={1}><div className={classes.container}><div className={classes.labelBorder}>Enc.</div><div className={classes.valueBorder1}><Field forViewBorder={false} forViewBackground={false} name="iorder" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700, fontSize:"20px" }} /></Field></div></div></Col>
                            <Col  xs={6} md={1}><div className={classes.container}><div className={classes.labelBorder}>Prf</div><div className={classes.valueBorder1}><Field forViewBorder={false} forViewBackground={false} name="prf" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700, fontSize:"20px" }} /></Field></div></div></Col>
                        </Row>

                        <Row nogutter style={{ /* borderBottom: "solid 1px #d9d9d9" */ }}>
                            {/* <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Designação</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} name="designacao" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col> */}
                            {/* <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Paletes/Contentor</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} name="npaletes" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col> */}
                            <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Etiquetas/Bobine</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} name="netiquetas_bobine" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col>
                            <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Etiqueta do Lote da Palete</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} name="netiquetas_lote" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col>
                            <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Filme Estirável/Palete</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} required={false} name="filmeestiravel_bobines" label={{ enabled: false }}><CheckboxField /></Field></div></div></Col>
                            {/* <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Altura Máx. Palete</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} name="palete_maxaltura" forInput={false} label={{ enabled: false }}><Input size="small" addonAfter="m" style={{ fontWeight: 700 }} /></Field></div></div></Col> */}

                            <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Filme Estirável Exterior</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} required={false} name="filmeestiravel_exterior" label={{ enabled: false }}><CheckboxField /></Field></div></div></Col>
                            {/* <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Paletes Sobrepostas</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} required={false} name="paletes_sobrepostas" label={{ enabled: false }}><CheckboxField /></Field></div></div></Col> */}
                            <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Etiqueta Final da Palete</div><div className={classes.valueBorder}><Field forViewBorder={false} forViewBackground={false} name="netiquetas_final" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col>
                            {form.getFieldValue("cintas") == 1 && <>
                                <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Cintas</div><Field name="ncintas" forViewBorder={false} forViewBackground={false} forInput={false} label={{ enabled: false }}><Input size="small" /></Field><Field forViewBorder={false} forViewBackground={false} name="cintas_option" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></Col>
                            </>}
                            <Col xs={12} md={3}><div className={classes.container}><div className={classes.labelBorder}>Folha Identificativa</div><Field name="folha_identificativa" forViewBorder={false} forViewBackground={false} forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></Col>
                        </Row>
                    </Col>
                    <Hidden xs sm md><Col xs={3}></Col></Hidden>





                </Row>
                <Row nogutter>
                    <Col style={{ padding: "10px" }}>
                        <Steps current={currentStep} items={steps} />
                        <ContentStep>{React.cloneElement(steps[currentStep].content, { form, inputParameters: inputParameters.current, onBobineChange, submitting, onNewPalete, lvl, report, bobines, onCheckBobines, onCancel, /* onWeigh, */ onCreate, onOk })}</ContentStep>
                    </Col>
                </Row>
            </FormContainer>
        </YScroll>
    );


};