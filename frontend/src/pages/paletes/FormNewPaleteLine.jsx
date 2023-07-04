import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
//import moment from 'moment';
import dayjs from 'dayjs';
import { uid } from 'uid';
import { useImmer } from 'use-immer';
import { useNavigate, useLocation } from "react-router-dom";
import { ConditionalWrapper } from 'components/conditionalWrapper';
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, sleep } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS, CINTASPALETES_OPTIONS, PALETES_WEIGHT } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch, Tooltip, Steps } from "antd";
const { Step } = Steps;
const { TextArea } = Input;
// import ToolbarTitle from './commons/ToolbarTitle';
const { Title } = Typography;
import { json } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, CheckCircleTwoTone, CloseCircleTwoTone, InfoCircleOutlined } from '@ant-design/icons';
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
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';
import IconButton from "components/iconButton";
import { MdAdjust, MdAssignmentReturned } from 'react-icons/md';
import SvgSchema from './paletizacao/SvgSchema';

const title = "Nova Palete de Linha";
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

const useStyles = createUseStyles({});

const loadPaletizacao = async (params, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...params }, sort: [], parameters: { method: "GetPaletizacao" }, signal });
    if (rows && rows.length > 0) {
        const j = json(rows[0]?.paletizacao);
        const cintas_option = CINTASPALETES_OPTIONS.find(v => v.value == j.cintas_palete)?.label;
        return { ...j, designacao: `${j.contentor_id} ${rows[0].designacao}`, cintas_option, folha_identificativa: j?.folha_identificativa ? 1 : 0 };
    }
    return {};
}

const Report = ({ data }) => {
    return (
        <>
            <Row nogutter style={{ fontWeight: 700, fontSize: "12px" }}>
                {data.chk_artigos > 0 && <Col width={60} style={{ textAlign: "center" }}>Artigos</Col>}
                {data.chk_produtos > 0 && <Col width={60} style={{ textAlign: "center" }}>Produtos</Col>}
                {data.chk_bobines > 0 && <Col width={60} style={{ textAlign: "center" }}>Bobines</Col>}
                {data.chk_cores > 0 && <Col width={60} style={{ textAlign: "center" }}>Cores</Col>}
                {data.chk_diams > 0 && <Col width={60} style={{ textAlign: "center" }}>Diâmetros</Col>}
                {data.chk_duplicates > 0 && <Col width={60} style={{ textAlign: "center" }}>Duplicadas</Col>}
                {data.chk_emendas > 0 && <Col width={60} style={{ textAlign: "center" }}>Emendas</Col>}
                {data.chk_estados > 0 && <Col width={60} style={{ textAlign: "center" }}>Estados</Col>}
                {data.chk_expired > 0 && <Col width={60} style={{ textAlign: "center" }}>Expiradas</Col>}
                {data.chk_larguras > 0 && <Col width={60} style={{ textAlign: "center" }}>Larguras</Col>}
                {data.chk_paletes > 0 && <Col width={60} style={{ textAlign: "center" }}>Paletes</Col>}
            </Row>
            <Row nogutter style={{ fontWeight: 700, fontSize: "12px", marginBottom: "5px" }}>
                {data.chk_artigos > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_artigos}<CloseCircleTwoTone twoToneColor="#f5222d" style={{ marginLeft: "2px" }} /></Col>}
                {data.chk_produtos > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_produtos}<CloseCircleTwoTone twoToneColor="#f5222d" style={{ marginLeft: "2px" }} /></Col>}
                {data.chk_bobines > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_bobines}<CloseCircleTwoTone twoToneColor="#f5222d" style={{ marginLeft: "2px" }} /></Col>}
                {data.chk_cores > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_cores}<CloseCircleTwoTone twoToneColor="#f5222d" style={{ marginLeft: "2px" }} /></Col>}
                {data.chk_diams > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_diams}<CloseCircleTwoTone twoToneColor="#f5222d" style={{ marginLeft: "2px" }} /></Col>}
                {data.chk_duplicates > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_duplicates}<CloseCircleTwoTone twoToneColor="#f5222d" style={{ marginLeft: "2px" }} /></Col>}
                {data.chk_emendas > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_emendas}<CloseCircleTwoTone twoToneColor="#f5222d" style={{ marginLeft: "2px" }} /></Col>}
                {data.chk_estados > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_estados}<CloseCircleTwoTone twoToneColor="#f5222d" style={{ marginLeft: "2px" }} /></Col>}
                {data.chk_expired > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_expired}<CloseCircleTwoTone twoToneColor="#f5222d" style={{ marginLeft: "2px" }} /></Col>}
                {data.chk_larguras > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_larguras}<CloseCircleTwoTone twoToneColor="#f5222d" style={{ marginLeft: "2px" }} /></Col>}
                {data.chk_paletes > 0 && <Col width={60} style={{ textAlign: "center" }}>{data.chk_paletes}<CloseCircleTwoTone twoToneColor="#f5222d" style={{ marginLeft: "2px" }} /></Col>}
            </Row>
        </>
    );
}


const ContentStep = styled.div`
    color: rgba(0, 0, 0, 0.45);
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 5px;
    border: 1px dashed #d9d9d9;
    margin-top: 16px;
`;

const SelectPalete = ({ form, inputParameters, submitting, onNewPalete }) => {
    return (<Row nogutter>
        <Hidden xs sm md><Col></Col></Hidden>
        <Col style={{ /* display: "flex", justifyContent: "center" */ }}>

            <Row nogutter style={{ borderBottom: "solid 1px #d9d9d9" }}>
                <Col xs={12} md={6}><div style={{ display: "flex", alignItems: "center" }}><div style={{ marginRight: "2px", width: "155px" }}>Designação</div><div style={{ flex: 1 }}><Field forViewBorder={false} forViewBackground={false} name="designacao" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col>
                <Col xs={12} md={6}><div style={{ display: "flex", alignItems: "center" }}><div style={{ marginRight: "2px", width: "155px" }}>Paletes/Contentor</div><div style={{ flex: 1 }}><Field forViewBorder={false} forViewBackground={false} name="npaletes" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col>
                <Col xs={12} md={6}><div style={{ display: "flex", alignItems: "center" }}><div style={{ marginRight: "2px", width: "155px" }}>Etiquetas/Bobine</div><div style={{ flex: 1 }}><Field forViewBorder={false} forViewBackground={false} name="netiquetas_bobine" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col>
                <Col xs={12} md={6}><div style={{ display: "flex", alignItems: "center" }}><div style={{ marginRight: "2px", width: "155px" }}>Etiqueta do Lote da Palete</div><div style={{ flex: 1 }}><Field forViewBorder={false} forViewBackground={false} name="netiquetas_lote" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col>
                <Col xs={12} md={6}><div style={{ display: "flex", alignItems: "center" }}><div style={{ marginRight: "2px", width: "155px" }}>Filme Estirável/Palete</div><div style={{ flex: 1 }}><Field forViewBorder={false} forViewBackground={false} required={false} name="filmeestiravel_bobines" label={{ enabled: false }}><CheckboxField /></Field></div></div></Col>
                <Col xs={12} md={6}><div style={{ display: "flex", alignItems: "center" }}><div style={{ marginRight: "2px", width: "155px" }}>Altura Máx. Palete</div><div style={{ flex: 1 }}><Field forViewBorder={false} forViewBackground={false} name="palete_maxaltura" forInput={false} label={{ enabled: false }}><Input size="small" addonAfter="m" style={{ fontWeight: 700 }} /></Field></div></div></Col>

                <Col xs={12} md={6}><div style={{ display: "flex", alignItems: "center" }}><div style={{ marginRight: "2px", width: "155px" }}>Filme Estirável Exterior</div><div style={{ flex: 1 }}><Field forViewBorder={false} forViewBackground={false} required={false} name="filmeestiravel_exterior" label={{ enabled: false }}><CheckboxField /></Field></div></div></Col>
                <Col xs={12} md={6}><div style={{ display: "flex", alignItems: "center" }}><div style={{ marginRight: "2px", width: "155px" }}>Paletes Sobrepostas</div><div style={{ flex: 1 }}><Field forViewBorder={false} forViewBackground={false} required={false} name="paletes_sobrepostas" label={{ enabled: false }}><CheckboxField /></Field></div></div></Col>
                <Col xs={12} md={6}><div style={{ display: "flex", alignItems: "center" }}><div style={{ marginRight: "2px", width: "155px" }}>Etiqueta Final da Palete</div><div style={{ flex: 1 }}><Field forViewBorder={false} forViewBackground={false} name="netiquetas_final" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></div></Col>
                {form.getFieldValue("cintas") == 1 && <>
                    <Col xs={12} md={6}><div style={{ display: "flex", alignItems: "center" }}><div style={{ marginRight: "2px", width: "155px" }}>Cintas</div><Field name="ncintas" forInput={false} label={{ enabled: false }}><Input size="small" /></Field><Field name="cintas_option" forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></Col>
                </>}
                <Col xs={12} md={6}><div style={{ display: "flex", alignItems: "center" }}><div style={{ marginRight: "2px", width: "155px" }}>Folha Identificativa da Palete</div><Field name="folha_identificativa" forViewBorder={false} forViewBackground={false} forInput={false} label={{ enabled: false }}><Input size="small" style={{ fontWeight: 700 }} /></Field></div></Col>
            </Row>
            <Row nogutter style={{ marginTop: "20px" }}>
                <Col xs={12}><SvgSchema form={form} changedValues={submitting.state} reverse={true} onClick={onNewPalete} /></Col>
            </Row>

        </Col>
        <Hidden xs sm md><Col></Col></Hidden>
    </Row>);
}
const PickBobines = ({ }) => {
    return (<div>sssss</div>);
}
const WeighPalete = ({ }) => {
    return (<div>sssss</div>);
}
const Submit = ({ }) => {
    return (<div>sssss</div>);
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
        title: "Confirmar",
        content: <Submit />,
    }

];

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
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters?.filter, { ...location?.state }, ["id", "of"]);
            inputParameters.current = paramsIn;
        }
        setFormDirty(false);
        // if (inputParameters.current?.new) {
        //     form.setFieldsValue({ joinbc: 1, reference: 0 });
        // } else {
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
                content: "Tem a criação de uma palete em curso. Ao confirmar os dados relativos à palete serão perdidos. Tem a certeza que deseja continuar?", onOk: () => _newPalete(v, _lvl)
            });
        } else {
            _newPalete(v, _lvl);
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

    const onCreate = async () => {
        const _bobines = ["30221222-05-01", "30221222-06-01", "30221222-07-01", "30221222-08-01", "30221222-09-01", "30221222-10-01", "30221222-11-01", "30221222-12-01"];
        const _values = form.getFieldsValue(true);
        const v = schema().validate(_values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);
        const _nbobines = bobines.filter(item => !item).length;
        if (_nbobines > 0) {
            //errors = 1;
            //status.formStatus.error.push({ message: "Existem bobines que não foram picadas!" });
        }
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            submitting.trigger();


            try {
                const response = await fetchPost({ url: `${API_URL}/paletes/sql/`, parameters: { method: "CreatePaleteLine", ...inputParameters.current, bobines: _bobines, ...lvl, pesobruto: _values?.pesobruto, pesopalete: _values?.pesopalete } });
                if (response?.data?.status !== "error") {
                    if (response.data?.data) {
                        setReport(response.data.data);
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

    const onCancel = () => {

        Modal.confirm({
            title: "Atenção!",
            content: "Tem a criação de uma palete em curso. Ao cancelar os dados relativos à palete serão perdidos. Tem a certeza que deseja continuar?", onOk: _cancelPalete
        });

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
                    <Col style={{ padding: "10px" }}>
                        <Steps current={currentStep} items={steps} />
                        <ContentStep>{React.cloneElement(steps[currentStep].content, { form, inputParameters: inputParameters.current, onBobineChange, submitting, onNewPalete })}</ContentStep>
                    </Col>
                </Row>
            </FormContainer>
        </YScroll>
    );


};