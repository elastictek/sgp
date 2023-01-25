import React, { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import classNames from "classnames";
import Joi from 'joi';
import moment from 'moment';
import { useImmer } from 'use-immer';
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import { API_URL, DATETIME_FORMAT } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { usePermission } from "utils/usePermission";
import loadInit from "utils/loadInit";
import { useNavigate, useLocation } from "react-router-dom";
import Portal from "components/portal";
import IconButton from "components/iconButton";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Typography, Modal, Checkbox, Tag, Badge, Alert, DatePicker, TimePicker, Divider, Drawer, Select } from "antd";
const { TextArea } = Input;
import { PlusOutlined, MoreOutlined, EditOutlined, ReadOutlined, PrinterOutlined } from '@ant-design/icons';
import { CgCloseO } from 'react-icons/cg';
import Table from 'components/TableV2';
import { DATE_FORMAT, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, SelectMultiField } from 'components/FormFields';
import FormPrint from "../commons/FormPrint";
import { Status } from "./commons";
import YScroll from 'components/YScroll';
import ToolbarTitle from 'components/ToolbarTitle';

const title = { A: "Validar Bobinagem", B: "Bobinagem" };

const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    },
    obs: {
        //overflowY:"scroll"
    },
    center: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%"
    },
    bold: {
        fontWeight: 700
    }
});

const TitleForm = ({ bobinagem, data, onChange }) => {
    return (<ToolbarTitle title={bobinagem && <>
        <Col xs='content' style={{}}><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{bobinagem?.valid == 0 ? title.A : title.B}</span></Col>
        <Col xs='content' style={{ paddingTop: "3px" }}><Tag icon={<MoreOutlined />} color="#2db7f5">{bobinagem.nome}</Tag></Col>
    </>} />);
}

const CheckColumn = ({ id, name, onChange, defaultChecked = false, forInput, valid }) => {
    const ref = useRef();
    const onCheckChange = (e) => {
        ref.current.checked = !ref.current.checked;
        onChange(id, e);
    }
    return (<Space>{name}{(forInput && valid === 1) && <Checkbox ref={ref} onChange={onCheckChange} defaultChecked={defaultChecked} />}</Space>);
};

const focus = (el, h,) => { el?.focus(); };
const FieldEstadoEditor = ({ p }) => {
    const onChange = (v) => p.onRowChange({ ...p.row, estado: v }, true);
    return (
        <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.estado} ref={focus} onChange={onChange} size="small" keyField="value" textField="label" data={BOBINE_ESTADOS} />
    );
}
const FieldDefeitosEditor = ({ p }) => {
    const onChange = (v) => p.onRowChange({ ...p.row, defeitos: v }, true);
    return (
        <SelectMultiField autoFocus defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.defeitos} /* ref={focus}  */ onChange={onChange} allowClear size="small" data={BOBINE_DEFEITOS.filter(v => v.value !== 'furos' && v.value !== 'buraco' && v.value !== 'rugas' && v.value !== 'ff' && v.value !== 'fc')} />
    );
}
const FieldDefeitos = ({ p }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
                {p.row.defeitos && p.row.defeitos.filter(v => v.value !== 'furos' && v.value !== 'buraco' && v.value !== 'rugas' && v.value !== 'ff' && v.value !== 'fc').map((v) => {
                    return (<Tag key={`d${v.value}-${p.row.id}`} color="error">{v.label}</Tag>);
                })}
            </div>
        </div>
    );
}

const applyToAllRows = (rows, col, currentIndex, added, removed) => {
    return rows.map((v, i) => {
        if (i !== currentIndex) {
            let _d = v[col] || [];
            _d = _d.filter(a => !removed?.map(b => b.value).includes(a.value));
            _d = [..._d, ...added.filter(a => !_d?.map(b => b.value).includes(a.value))];
            return { ...v, [col]: _d };
        }
        return v;
    });
}
const applyRangeToAllRows = (rows, col, currentIndex, added, removed) => {
    return rows.map((v, i) => {
        if (i !== currentIndex) {
            let _d = v[col] || [];
            _d = _d.filter(a => !removed?.map(({ min, max }) => ({ min, max })).some(v => v.min === a.min && v.max === a.max));
            _d = [..._d, ...added.filter(a => !_d?.map(({ min, max }) => ({ min, max })).some(v => v.min === a.min && v.max === a.max))];
            return { ...v, [col]: _d };
        }
        return v;
    });
}
const applyValueToAllRows = (rows, col, currentIndex, value) => {
    return rows.map((v, i) => {
        if (i !== currentIndex) {
            return { ...v, [col]: value };
        }
        return v;
    });
}


function sleep({ fn, ms, signal }) {
    if (signal?.aborted) {
        return Promise.reject(new DOMException("Aborted", "AbortError"));
    }
    return new Promise((resolve, reject) => {
        console.log("Promise Started");
        let timeout;
        const abortHandler = () => {
            clearTimeout(timeout);
            reject(new DOMException("Aborted", "AbortError"));
        }
        // start async operation
        timeout = setTimeout(() => {
            fn();
            resolve("Promise Resolved");
            signal?.removeEventListener("abort", abortHandler);
        }, ms);
        signal?.addEventListener("abort", abortHandler);
    });
}

let controller;
const MultiLine = ({ children, isCellSelected, value }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    useEffect(() => {
        if (isCellSelected) {
            controller?.abort();
            controller = new AbortController();
            sleep({ fn: () => { if (children) { setShowTooltip(true) } }, ms: 1000, signal: controller.signal });
        } else {
            setShowTooltip(false);
        }
    }, [isCellSelected]);
    return (
        <>{value && <Tooltip style={{ maxWidth: "350px" }} placement="left" open={showTooltip} title={children} mouseEnterDelay={5}>{children}</Tooltip>}</>
    );
}

const ModalObsEditor = ({ p, column, title, forInput, ...props }) => {
    const [visible, setVisible] = useState(true);
    const [value, setvalue] = useState(p.row[column]);

    const onConfirm = (e) => {
        if (e.type === "click" || (e.type === "keydown" && e.key === 'Enter')) {
            p.onRowChange({ ...p.row, [column]: value }, true);
            p.onClose(true);
        }
    }
    const onCancel = () => {
        p.onClose();
        setVisible(false);

    };

    return (
        <Modal title={title} open={visible} destroyOnClose onCancel={onCancel} onOk={forInput ? onConfirm : onCancel}>
            <TextArea disabled={!forInput} autoFocus value={value} onChange={(e) => setvalue(e.target.value)} onKeyDown={e => (e.key === 'Enter') && e.stopPropagation()} {...props} />
        </Modal>
    );
}


const schemaRange = ({ wrapObject = false, wrapArray = true, excludeKeys = [], keys = [] } = {}) => {
    return getSchema(
        Joi.object(
            pick(keys, {
                min: Joi.number().required().label("Mínimo"),
                max: Joi.number().greater(Joi.ref('min')).required().label("Máximo")
            }, excludeKeys)).unknown(true), { wrapObject, wrapArray, excludeKeys, keys });
}

const ItemsField = ({ row, column }) => {
    const count = row[column] ? row[column].length : null;
    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", height: "100%", alignItems: "center" }}><Badge count={count} /></div>
    )
}

const ModalRangeEditor = ({ p, type, column, title, forInput, valid, unit = "m", ...props }) => {
    const classes = useStyles();
    const [visible, setVisible] = useState(true);
    const [value, setvalue] = useState();
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(false);

    useEffect(() => {
        form.setFieldsValue({ items: p.row[column] });
    }, []);

    const onFinish = (e) => {
        if (!forInput || valid !== 1) {
            p.onClose();
            setVisible(false);
            return;
        }
        submitting.trigger();
        const values = form.getFieldsValue(true);
        if (e.type === "click" || (e.type === "keydown" && e.key === 'Enter')) {
            const v = schemaRange().label("items").required().messages({ "any.required": "É obrigatório definir pelo menos um intervalo de valores!" }).validate(values?.items, { abortEarly: false, messages: validateMessages });
            const { errors, warnings, value, ...status } = getStatus(v);
            setFieldStatus({ ...status.fieldStatus });
            setFormStatus({ ...status.formStatus });
            if (errors === 0) {
                p.onRowChange({ ...p.row, [column]: value.map(({ min, max, unit, type }) => ({ min, max, unit, type })) }, true);
                p.onClose(true);
                setVisible(false);
            }
        }
        submitting.end();
    }

    const onValuesChange = () => { };
    const onCancel = () => {
        p.onClose();
        setVisible(false);

    };

    return (
        <Modal title={title} open={visible} destroyOnClose onCancel={onCancel} onOk={onFinish} width="350px">

            <Form form={form} name={`f-range`} onValuesChange={onValuesChange} initialValues={{}}>
                <AlertsContainer /* id="el-external" */ mask /* fieldStatus={fieldStatus} */ formStatus={formStatus} portal={false} />
                <FormContainer id="FRM-RANGE" fluid forInput={forInput} loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} style={{ marginTop: "5px", padding: "0px" }} schema={schemaRange} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }}>
                    <Form.List name="items">
                        {(fields, { add, remove, move }) => {
                            const addRow = (fields) => {
                                if (fields.length === 0 && type == "furos") {
                                    add({ [`min`]: 1, [`max`]: p.row.comp_actual, "unit": unit, removeCtrl: true });
                                } else {
                                    add({ [`min`]: null, [`max`]: null, "unit": unit, ...(type == "ff" && { "type": "Desbobinagem" }), removeCtrl: true });
                                }
                            }
                            const removeRow = (fieldName, field) => {
                                remove(fieldName);
                            }
                            const moveRow = (from, to) => {
                                //move(from, to);
                            }
                            return (
                                <>
                                    <div style={{ height: "300px" }}>
                                        <YScroll>
                                            {fields.map((field, index) => (
                                                <Row key={field.key} gutterWidth={1}>
                                                    <Col><Field name={[field.name, `min`]} label={{ enabled: false }}><InputNumber autoFocus size="small" style={{ width: "100%", textAlign: "right" }} controls={false} addonAfter={<b>{unit}</b>} min={0} max={p.row.comp} /></Field></Col>
                                                    <Col><Field name={[field.name, `max`]} label={{ enabled: false }} includeKeyRules={['min']} allValues={{ min: form.getFieldValue(['items', index, 'min']) }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} controls={false} addonAfter={<b>{unit}</b>} min={0} max={p.row.comp_actual} /></Field></Col>
                                                    {type === "ff" && <Col xs="content"><Field name={[field.name, `type`]} label={{ enabled: false }}><Select size="small" style={{ width: "100%", textAlign: "right" }} options={[{ value: "Bobinagem" }, { value: "Desbobinagem" }]} /></Field></Col>}
                                                    <Col xs={2}>{forInput && <div className={classNames(classes.center)}><IconButton onClick={() => removeRow(field.name, field)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton></div>}</Col>
                                                </Row>
                                            ))}
                                        </YScroll>
                                    </div>
                                    <Row style={{ marginTop: "5px" }}><Col><Button disabled={!forInput} type="default" onClick={() => addRow(fields)} style={{ width: "100%" }}><PlusOutlined />Adicionar</Button></Col></Row>
                                </>
                            )
                        }
                        }
                    </Form.List>
                </FormContainer>
            </Form>

        </Modal>
    );
}


/* const ApproveButton = styled(Button)`
  &&& {
    ${({ disabled }) => !disabled && css`
        background-color: #389e0d;
        border-color: #389e0d;
        color:#fff;
        &:hover{
            background-color: #52c41a;
            border-color: #52c41a;
        }
    `}
  }
`;
const HoldButton = styled(Button)`
  &&& {

    ${({ disabled }) => !disabled && css`
        background-color: #cf1322;
        border-color: #cf1322;
        color:#fff;
        &:hover{
            background-color: #f5222d;
            border-color: #f5222d;
        }
    `}
  }
`; */

const schemaRegister = ({ wrapObject = false, wrapArray = false, excludeKeys = [], keys = [] } = {}) => {
    return getSchema(Joi.object(
        pick(keys, {
            //largura_bruta: Joi.number().positive().label("Largura Bruta").required(),
            comp_par: Joi.when(Joi.ref('$new_lote'), { is: 1, then: Joi.number().required() }).label("Comprimento da Emenda"),
            lotenwinf: Joi.string().required().label("Lote Nonwoven Inferior"),
            lotenwsup: Joi.string().required().label("Lote Nonwoven Superior")
            //lotenwinf: Joi.when(Joi.ref('$new_lote'), { is: 1, then: Joi.string().required() }).label("Lote Nonwoven Inferior"),
            //lotenwsup: Joi.when(Joi.ref('$new_lote'), { is: 1, then: Joi.string().required() }).label("Lote Nonwoven Superior")
        }, excludeKeys)).unknown(true), { wrapObject, wrapArray, excludeKeys, keys }
    );
}

const loadProdutoGranuladoLookup = async (signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/produtogranuladolookup/`, filter: {}, sort: [], signal });
    return rows;
}


const validarSubmit = async (status, parameters, setFormStatus, submitting, loadData) => {
    try {
        let response = await fetchPost({ url: `${API_URL}/validarbobinagem/`, parameters });
        if (response.data.status !== "error") {
            loadData();
        } else {
            let rowsi = (("rowsi" in response.data) && response.data?.rowsi && response.data["rowsi"].length > 0) ? response.data["rowsi"] : null;
            let rowso = (("rowso" in response.data) && response.data?.rowso && response.data["rowso"].length > 0) ? response.data["rowso"] : null;
            if (rowsi || rowso) {
                Modal.error({
                    centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro na Entrada/Saída de Matérias Primas!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}>
                        <YScroll>
                            <Container fluid>
                                {rowsi &&
                                    <>
                                        <Row nogutter><Col style={{ fontWeight: 900, marginBottom: "10px" }}>Falta dar entrada de granulado no(s) seguinte(s) doseadores!</Col></Row>
                                        {
                                            rowsi.map(v => {
                                                return (<Row nogutter>
                                                    <Col xs="content" style={{ fontWeight: 500, marginRight: "10px" }}>{v.doser}</Col>
                                                    <Col>{v.matprima_cod}</Col>
                                                </Row>);
                                            })
                                        }
                                    </>
                                }
                                {rowso &&
                                    <>
                                        <Row nogutter><Col style={{ fontWeight: 900 }}>Falta dar saída de granulado no(s) seguinte(s) doseadores!</Col></Row>
                                        {
                                            rowso.map(v => {
                                                return (<Row nogutter>
                                                    <Col xs="content" style={{ fontWeight: 500, marginRight: "10px" }}>{v.doser}</Col>
                                                    <Col>{v.matprima_cod}</Col>
                                                </Row>);
                                            })
                                        }
                                    </>
                                }
                            </Container>
                        </YScroll>
                    </div></div>
                });
            } else {
                status.formStatus.error.push({ message: response.data.title });
                setFormStatus({ ...status.formStatus });
            }
        }
    } catch (e) {
        Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
    };
    submitting.end();
}

const NewLoteContent = ({ parentRef, closeParent, parameters }) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const submitting = useSubmitting(true);

    const [produtoGranulado, setProdutoGranulado] = useState([]);
    const loadData = async ({ signal }) => {
        const pg = await loadProdutoGranuladoLookup(signal);
        setProdutoGranulado(pg);
        submitting.end();
    };

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const onFinish = async (values) => {
        try {
            await validarSubmit(parameters.status, { bobines: parameters.data.bobines, values: parameters.data.values, bobinagem: parameters.data.bobinagem, produto_id: values.produto }, parameters.setFormStatus, parameters.submitting, parameters.loadData);

            closeParent();
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            submitting.end();
        };
    }

    const onCancel = () => {
        parameters.submitting.end();
        closeParent();
    }

    const onValuesChange = (changedValues, values) => {

    }

    return (
        <Form form={form} name={`f-lote`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{ produto: 1, tara: 15 }}>
            <FormContainer id="LAY-LOTE" loading={submitting.state} wrapForm={false} form={form} schema={() => getSchema({}).unknown(true)} wrapFormItem={true} forInput={true}>
                <Row gutterWidth={10}>
                    <Col>
                        <Alert showIcon message="Aviso" description={<div>Não existem em aberto lotes de Reciclado(Granulado).<br />
                            Se não for criado, não será possível validar a bobinagem.</div>} type="warning" />
                    </Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col xs={6}><Field wrapFormItem={true} name="produto" label={{ enabled: true, text: "Produto" }}><SelectField style={{ width: "100%" }} size="small" keyField="id" textField="produto_granulado" data={produtoGranulado} /></Field></Col>
                </Row>
            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Registar</Button>
                    <Button onClick={onCancel}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}

const CortesField = ({ value }) => {
    const v = JSON.parse(value);
    return (
        <div>
            <div style={{ fontWeight: 600 }}>Cortes</div>
            <div style={{ border: "dashed 1px #d9d9d9", display: "flex", flexDirection: "row", height: "28px", alignItems: "center", background: "#f0f0f0", padding: "0px 10px" }}>{Object.keys(v).map(x => {
                return <div style={{ marginRight: "5px" }} key={`c-${x}${v[x]}`}>{x}x{v[x]}</div>
            })}
            </div>
        </div>
    );
}



const loadNWLookup = async (signal, data) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/nwlistlookup/`, filter: { ...data }, sort: [], signal });
    return rows;
}

const convertToM2 = (v, largura) => {
    return (v * largura) / 1000;
}


const FormRegister = ({ submitting, dataAPI, loadData, bobinagem, modeEdit, setModeEdit, allowEdit, nwList }) => {
    const permission = usePermission();
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const onValuesChange = () => { };
    const larguraUtil = () => {
        return dataAPI.getData().rows.reduce((accumulator, object) => {
            return accumulator + object.largura;
        }, 0);
    }
    const comp = () => { return dataAPI.getData().rows[0].comp; }
    const [modalParameters, setModalParameters] = useState({});
    const [showNewLoteModal, hideNewLoteModal] = useModal(({ in: open, onExited }) => {
        return <ResponsiveModal title="Criar Lote de Reciclado(Granulado)?"
            onCancel={hideNewLoteModal}
            width={600} height={200} footer="ref" >
            <NewLoteContent parameters={modalParameters} />
        </ResponsiveModal>;
    }, [modalParameters]);

    const onFinish = async (action) => {
        if (!modeEdit.datagrid) {
            return;
        }
        submitting.trigger();
        const values = form.getFieldsValue(true);
        const v = schemaRegister().validate(values, { abortEarly: false, messages: validateMessages, context: { new_lote: dataAPI.getData().new_nw_lotes } });
        const { errors, warnings, value, ...status } = getStatus(v);
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });
        if (errors === 0) {
            const rows = dataAPI.getData().rows;
            for (let [i, r] of dataAPI.getData().rows.entries()) {
                r.defeitos = (r?.defeitos ? r.defeitos : [])
                const hasDefeitos = (r?.defeitos && r.defeitos.length > 0 || r.fc_pos?.length > 0 || r.ff_pos?.length > 0 || r.fc_pos?.length > 0 || r.furos_pos?.length > 0 || r.buracos_pos?.length > 0 || r.rugas_pos?.length > 0 || r.prop_obs?.length > 0 || r.obs?.length > 0) ? true : false;
                const estado = r.estado;
                // if ((r.estado_original === "HOLD")/*  && !permission.allow() */) {
                //     status.formStatus.error.push({ message: <span><b>{r.nome}</b>: Não tem permissões para alterar o estado de uma bobine em <b>HOLD</b>.</span> });
                // }
                // if ((estado === "HOLD")/*  && !permission.allow() */) {
                //     status.formStatus.error.push({ message: <span><b>{r.nome}</b>: Não tem permissões para alterar o estado para <b>HOLD</b>.</span> });
                // }
                if ((estado === "R" || estado === "DM") && !hasDefeitos) {
                    status.formStatus.error.push({ message: <span><b>{r.nome}</b>: Para classificar como <b>DM</b> ou <b>R</b> tem de definir pelo menos um defeito.</span> });
                }
                if (r.defeitos.some(x => x.key === "fmp") && !r.obs?.length > 0) {
                    status.formStatus.error.push({ message: <span><b>{r.nome}</b>: Falha de <b>Matéria Prima</b>, preencher nas observações o motivo.</span> });
                }
                if (r.defeitos.some(x => x.key === "esp") && !r.prop_obs?.length > 0) {
                    status.formStatus.error.push({ message: <span><b>{r.nome}</b>: <b>Gramagem</b>, preencher nas observações das propriedades o motivo.</span> });
                }
                if (r.defeitos.some(x => x.key === "prop") && !r.prop_obs?.length > 0) {
                    status.formStatus.error.push({ message: <span><b>{r.nome}</b>: <b>Propriedades</b>, preencher nas observações das propriedades o motivo.</span> });
                }
                rows[i]["prop"] = (r.prop_obs?.length > 0) ? 1 : 0;
                rows[i]["fc"] = (r.fc_pos?.length > 0) ? 1 : 0;
                rows[i]["ff"] = (r.ff_pos?.length > 0) ? 1 : 0;
                rows[i]["furos"] = (r.furos_pos?.length > 0) ? 1 : 0;
                rows[i]["buraco"] = (r.buracos_pos?.length > 0) ? 1 : 0;
                rows[i]["rugas"] = (r.rugas_pos?.length > 0) ? 1 : 0;

            }

            if (bobinagem.nome.startsWith("20") && bobinagem.id >= 107127) {
                if (!values?.largura_bruta || values?.largura_bruta < values.lar_util) {
                    status.formStatus.error.push({ message: <span>A<b>Largura Bruta</b> tem de ser preenchida ou maior que a Largura Útil!</span> });
                }
            }

            if (bobinagem.valid == 0) {
                console.log("list nw", nwList);
                console.log(values.lotenwsup, "--", values.lotenwinf);
                console.log(values.nwsup, "--", values.nwinf);
                const lns = nwList.find(v => v.n_lote === values.lotenwsup && v.type === 1);
                const lni = nwList.find(v => v.n_lote === values.lotenwinf && v.type === 0);

                if (!lns || !lni) {
                    status.formStatus.error.push({ message: <span>Não foram encontrados lotes de Nonwoven em linha!</span> });
                } else {
                    let vs = lns.qty_reminder - convertToM2(values.nwsup, lns.largura);
                    let vi = lni.qty_reminder - convertToM2(values.nwinf, lni.largura);
                    //if (vs<(-100)){
                    //    status.formStatus.error.push({ message: <span>A quantidade Existente no lote Superior de Nonwoven é insuficiente!</span> });
                    //}else if (vi<-100){
                    //    status.formStatus.error.push({ message: <span>A quantidade Existente no lote Inferior de Nonwoven é insuficiente!</span> });
                    //}
                }
            }
            if (status.formStatus.error.length === 0) {
                try {
                    const { data: { rows: granulado } } = await fetchPost({ url: `${API_URL}/recicladolookup/`, pagination: { enabled: false, limit: 1 }, filter: { status: 0 }, sort: [{ column: "timestamp", direction: "desc" }] });
                    if (granulado.length === 0 && bobinagem.valid == 0) {
                        setModalParameters({ setFormStatus, submitting, status, data: { bobines: rows, values, bobinagem }, loadData });
                        showNewLoteModal();
                    } else {
                        await validarSubmit(status, { bobines: rows, values: { ...values, nome: bobinagem.nome }, bobinagem }, setFormStatus, submitting, loadData);
                    }
                } catch (e) {
                    Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
                    submitting.end();
                };

                console.log("row ok", rows, values);
            } else {
                setFormStatus({ ...status.formStatus });
                submitting.end();
            }
        } else {
            submitting.end();
        }
    }

    useEffect(() => {
        if (dataAPI.hasData()) {
            form.setFieldsValue({
                comp: dataAPI.getData()["comp"],
                comp_par: dataAPI.getData()["comp_par"],
                lar_util: larguraUtil(),
                data: moment(dataAPI.getData()["data"]),
                core: dataAPI.getData()["core"],
                cortes: dataAPI.getData()["cortes"],
                perfil_nome: dataAPI.getData()["perfil_nome"],
                produto_cod: dataAPI.getData()["produto_cod"],
                area: dataAPI.getData()["area"],
                inico: moment(dataAPI.getData()["inico"], TIME_FORMAT),
                fim: moment(dataAPI.getData()["fim"], TIME_FORMAT),
                duracao: dataAPI.getData()["duracao"],
                diam: dataAPI.getData()["diam"],
                tiponwsup: dataAPI.getData()["tiponwsup"],
                tiponwinf: dataAPI.getData()["tiponwinf"],
                lotenwsup: dataAPI.getData()["lotenwsup"],
                lotenwinf: dataAPI.getData()["lotenwinf"],
                nwsup: dataAPI.getData()["nwsup"],
                nwinf: dataAPI.getData()["nwinf"],
                largura_bruta: dataAPI.getData()["largura_bruta"]
            });
            console.log("nwlist", nwList)
        }
    }, [dataAPI.hasData()]);

    const changeMode = () => {
        if (allowEdit.form || allowEdit.datagrid) {
            setModeEdit({ elevated: (modeEdit.form) ? false : allowEdit.elevated, form: (modeEdit.form) ? false : allowEdit.form, datagrid: (modeEdit.datagrid) ? false : allowEdit.datagrid });
        }
    }



    return (
        <>
            {dataAPI.hasData() && <Form form={form} name={`f-register`} onValuesChange={onValuesChange} initialValues={{}}>

                <FormContainer fluid id="FRM-REGISTER" forInput={false} style={{ margin: "0px", background: "#fff", border: "solid 1px #d0d7de", borderBottom: "none", padding: "0px" }} loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} schema={schemaRegister} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }}>
                    <Row nogutter style={{ background: "#f6f8fa", borderBottom: "solid 1px #d0d7de", height: "40px", alignItems: "center", padding: "0px 15px" }}>
                        <Col>
                            {(modeEdit.form || modeEdit.datagrid) ? <Row nogutter justify='end'>
                                <Col xs="content">
                                    <Portal elId="save-btn">
                                        {(bobinagem?.valid === 1) && <Button disabled={(!allowEdit.form || !allowEdit.datagrid) ? false : true} type="primary" onClick={() => onFinish("save")}>Guardar Registos</Button>}
                                        {(bobinagem?.valid === 0) && <Button disabled={!allowEdit.validate} type="primary" onClick={() => onFinish("save")}>Validar Bobinagem</Button>}
                                    </Portal>
                                    <Divider type="vertical" style={{ margin: "0 8px" }} />
                                    <Button onClick={changeMode} icon={<ReadOutlined title="Modo de Leitura" />} />
                                </Col>
                            </Row> :
                                <Row nogutter>
                                    <Col xs={12} style={{ textAlign: "right" }}><Button disabled={(!allowEdit.form || !allowEdit.datagrid) ? false : true} icon={<EditOutlined />} onClick={changeMode} title="Editar" /></Col>
                                </Row>
                            }
                        </Col>
                    </Row>
                    <Row nogutter >
                        <Col md={12} lg={6} style={{ padding: "0px 15px" }}>
                            <Row nogutter>
                                <Col style={{ padding: "10px" }}>


                                    <Row gutterWidth={5} style={{ marginBottom: "10px" }}>
                                        <Col><Field name={dataAPI.getData()["agg_of_id"] ? "produto_cod" : "perfil_nome"} label={{ enabled: true, text: dataAPI.getData()["agg_of_id"] ? "Produto" : "Perfil", padding: "0px" }}><Input style={{ padding: "0px 10px" }} /></Field></Col>
                                        <Col xs="content"><Field name="data" label={{ enabled: true, text: "Data", padding: "0px" }}><DatePicker style={{ padding: "0px 10px" }} showTime={false} format={DATE_FORMAT} /></Field></Col>
                                        <Col xs="content"><Field name="inico" label={{ enabled: true, text: "Início", padding: "0px" }}><TimePicker style={{ padding: "0px 10px" }} format={TIME_FORMAT} /></Field></Col>
                                        <Col xs="content"><Field name="fim" label={{ enabled: true, text: "Fim", padding: "0px" }}><TimePicker style={{ padding: "0px 10px" }} format={TIME_FORMAT} /></Field></Col>
                                        <Col xs="content"><Field name="duracao" label={{ enabled: true, text: "Duração", padding: "0px" }}><Input style={{ padding: "0px 10px" }} /></Field></Col>
                                    </Row>



                                    <Row gutterWidth={5} style={{ marginBottom: "10px" }}>
                                        <Col width={150}><Field name="lar_util" label={{ enabled: true, text: "Largura Útil", padding: "0px" }}><InputNumber style={{ width: "100%", textAlign: "right" }} min={0} addonAfter={<b>mm</b>} /></Field></Col>
                                        <Col width={150}><Field required forInput={modeEdit.form} name="largura_bruta" label={{ enabled: true, text: "Largura Bruta", padding: "0px" }}><InputNumber style={{ width: "100%", textAlign: "right" }} min={larguraUtil()} addonAfter={<b>mm</b>} /></Field></Col>
                                        <Col width={150}><Field name="comp_par" forInput={modeEdit.form && (dataAPI.getData().troca_nw === 1 || dataAPI.getData().tr === 1)} required label={{ enabled: true, text: "Comprimento Emenda", padding: "0px" }}><InputNumber style={{ textAlign: "right" }} min={0} addonAfter={<b>m</b>} /></Field></Col>
                                        <Col width={150}><Field name="diam" label={{ enabled: true, text: "Diâmetro", padding: "0px" }}><InputNumber style={{ width: "100%", textAlign: "right" }} min={0} addonAfter={<b>mm</b>} /></Field></Col>
                                        <Col width={150}><Field name="area" label={{ enabled: true, text: "Área", padding: "0px" }}><InputNumber style={{ width: "100%", textAlign: "right" }} min={0} addonAfter={<b>m<sup>2</sup></b>} /></Field></Col>
                                        {dataAPI.getData()["agg_of_id"] && <>
                                            <Col><CortesField value={dataAPI.getData()["cortes"]} /></Col>
                                            <Col xs="content"><Field name="core" label={{ enabled: true, text: "Core", padding: "0px" }}><Input style={{ padding: "0px 10px" }} addonAfter={<b>''</b>} /></Field></Col>
                                        </>}
                                    </Row>

                                    <Row nogutter>
                                        <Col style={{ border: "solid 1px #d0d7de" }} >

                                            <Row nogutter style={{ /* background: "#f6f8fa", */ height: "28px", alignItems: "center", padding: "0px 15px" }} >
                                                <Col><b>Nonwoven Inferior</b></Col>
                                                <Col><b>Nonwoven Superior</b></Col>
                                                <Col width={80}></Col>
                                            </Row>
                                            <Row gutterWidth={3} style={{ padding: "2px 10px" }}>
                                                <Col><Field name="tiponwinf" label={{ enabled: false }}><Input style={{}} /></Field></Col>
                                                <Col><Field name="tiponwsup" label={{ enabled: false }}><Input style={{}} /></Field></Col>
                                                <Col width={80} style={{ alignSelf: "center", paddingLeft: "10px" }}><b>Tipo</b></Col>
                                            </Row>
                                            <Row gutterWidth={3} style={{ padding: "2px 10px" }}>
                                                <Col><Field forInput={(modeEdit.form && dataAPI.getData().new_nw_lotes === 1) || modeEdit.elevated} name="lotenwinf" label={{ enabled: false }}>
                                                    <Input />
                                                </Field></Col>
                                                <Col><Field forInput={(modeEdit.form && dataAPI.getData().new_nw_lotes === 1) || modeEdit.elevated} name="lotenwsup" label={{ enabled: false }}>
                                                    <Input />
                                                </Field></Col>
                                                <Col width={80} style={{ alignSelf: "center", paddingLeft: "10px" }}><b>Lote</b></Col>
                                            </Row>
                                            <Row gutterWidth={3} style={{ padding: "2px 10px" }}>
                                                <Col style={{ display: "flex", justifyContent: "end" }}><Field name="nwinf" forInput={false} label={{ enabled: false }}><InputNumber style={{ width: "100px", textAlign: "right" }} min={0} addonAfter={<b>m</b>} /></Field></Col>
                                                <Col style={{ display: "flex", justifyContent: "end" }}><Field name="nwsup" forInput={false} label={{ enabled: false }}><InputNumber style={{ width: "100px", textAlign: "right" }} min={0} addonAfter={<b>m</b>} /></Field></Col>
                                                <Col width={80} style={{ alignSelf: "center", paddingLeft: "10px" }}><b>Consumo</b></Col>
                                            </Row>

                                        </Col>
                                    </Row>

                                </Col>
                            </Row>
                        </Col>
                        <Col style={{ padding: "15px 15px" }}>
                            <AlertsContainer mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
                        </Col>
                    </Row>
                </FormContainer>
            </Form>}
        </>
    );
}

const IFrame = ({ src }) => {
    return <div dangerouslySetInnerHTML={{ __html: `<iframe frameBorder="0" onload="this.width=screen.width;this.height=screen.height;" src='${src}'/>` }} />;
}

export default (props) => {
    const submitting = useSubmitting(true);
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();
    const permission = usePermission({ allowed: { producao: 100, logistica: 100, qualidade: 100, planeamento: 100 } });

    const [allowEdit, setAllowEdit] = useState({ form: false, datagrid: false });
    const [modeEdit, setModeEdit] = useState({ form: false, datagrid: false });

    const [bobinagem, setBobinagem] = useState();
    const [checkData, setCheckData] = useImmer({ estado: false, defeitos: false, fc_pos: false, ff_pos: false, buracos_pos: false, furos_pos: false, prop_obs: false, rugas_pos: false, obs: false });
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/validarbobineslist/`, parameters: {}, pagination: { enabled: false, limit: 100 }, filter: {}, sort: [{ column: 'nome', direction: 'ASC' }] } });
    const primaryKeys = ['id'];
    const onCheckChange = (key, value) => { setCheckData(draft => { draft[key] = value.target.checked; }); }
    const [nwList, setNWList] = useState([]);
    const [modalParameters, setModalParameters] = useState({});
    const [showPrintModal, hidePrintModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal title={modalParameters.title} footer="none" onCancel={hidePrintModal} width={300} height={180}><FormPrint v={{ ...modalParameters }} /></ResponsiveModal>
    ), [modalParameters]);
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal title={modalParameters.title} lazy={true} footer="ref" onCancel={hideModal} width={5000} height={5000}><IFrame src={modalParameters.src} /></ResponsiveModal>
    ), [modalParameters]);


    const columns = [
        { key: 'nome', sortable: false, name: 'Bobine', width: 130, frozen: true, formatter: p => <Button size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.nome}</Button> },
        { key: 'estado', sortable: false, headerRenderer: p => <CheckColumn id="estado" name="Estado" onChange={onCheckChange} defaultChecked={checkData.estado} forInput={modeEdit.datagrid} valid={bobinagem?.valid} />, minWidth: 85, width: 85, formatter: (p) => <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status b={p.row} /></div>, ...((modeEdit.datagrid && allowEdit.datagrid) && { editor: p => <FieldEstadoEditor p={p} /> }), editorOptions: { editOnClick: true } },
        { key: 'l_real', sortable: false, name: 'Largura Real', width: 90, ...((modeEdit.datagrid && allowEdit.datagrid) && { editor: p => <InputNumber style={{ width: "100%" }} bordered={false} size="small" value={p.row.l_real} ref={focus} onChange={(e) => p.onRowChange({ ...p.row, l_real: e === null ? 0 : e }, true)} min={0} /> }), editorOptions: { editOnClick: true }, formatter: ({ row }) => row.l_real },
        { key: 'fc_pos', sortable: false, width: 85, headerRenderer: p => <CheckColumn id="fc_pos" name='F. Corte' onChange={onCheckChange} defaultChecked={checkData.fc_pos} forInput={modeEdit.datagrid} valid={bobinagem?.valid} />, editor(p) { return <ModalRangeEditor type="fc" unit='mm' p={p} column="fc_pos" title="Falha de Corte" forInput={modeEdit.datagrid && allowEdit.datagrid} valid={bobinagem?.valid} /> }, formatter: ({ row }) => <ItemsField row={row} column="fc_pos" />, editorOptions: { editOnClick: true } },
        { key: 'ff_pos', sortable: false, width: 85, headerRenderer: p => <CheckColumn id="ff_pos" name='F. Filme' onChange={onCheckChange} defaultChecked={checkData.ff_pos} forInput={modeEdit.datagrid} valid={bobinagem?.valid} />, editor(p) { return <ModalRangeEditor type="ff" p={p} column="ff_pos" title="Falha de Filme" forInput={modeEdit.datagrid && allowEdit.datagrid} valid={bobinagem?.valid} /> }, formatter: ({ row }) => <ItemsField row={row} column="ff_pos" />, editorOptions: { editOnClick: true } },
        { key: 'buracos_pos', sortable: false, width: 85, headerRenderer: p => <CheckColumn id="buracos_pos" name='Buracos' onChange={onCheckChange} defaultChecked={checkData.buracos_pos} forInput={modeEdit.datagrid} valid={bobinagem?.valid} />, editor(p) { return <ModalRangeEditor type="buracos" p={p} column="buracos_pos" title="Buracos" forInput={modeEdit.datagrid && allowEdit.datagrid} valid={bobinagem?.valid} /> }, formatter: ({ row }) => <ItemsField row={row} column="buracos_pos" />, editorOptions: { editOnClick: true } },
        { key: 'furos_pos', sortable: false, width: 85, headerRenderer: p => <CheckColumn id="furos_pos" name='Furos' onChange={onCheckChange} defaultChecked={checkData.furos_pos} forInput={modeEdit.datagrid} valid={bobinagem?.valid} />, editor(p) { return <ModalRangeEditor p={p} type="furos" column="furos_pos" title="Furos" forInput={modeEdit.datagrid && allowEdit.datagrid} valid={bobinagem?.valid} /> }, formatter: ({ row }) => <ItemsField row={row} column="furos_pos" />, editorOptions: { editOnClick: true } },
        { key: 'rugas_pos', sortable: false, width: 85, headerRenderer: p => <CheckColumn id="rugas_pos" name='Rugas' onChange={onCheckChange} defaultChecked={checkData.rugas_pos} forInput={modeEdit.datagrid} valid={bobinagem?.valid} />, editor(p) { return <ModalRangeEditor type="rugas" p={p} column="rugas_pos" title="Rugas" forInput={modeEdit.datagrid && allowEdit.datagrid} valid={bobinagem?.valid} /> }, formatter: ({ row }) => <ItemsField row={row} column="rugas_pos" />, editorOptions: { editOnClick: true } },
        { key: 'comp', sortable: false, name: "Comprimento", width: 100, formatter: ({ row }) => row.comp },
        { key: 'defeitos', sortable: false, width: 250, headerRenderer: p => <CheckColumn id="defeitos" name='Outros Defeitos' onChange={onCheckChange} defaultChecked={checkData.defeitos} forInput={modeEdit.datagrid} valid={bobinagem?.valid} />, ...((modeEdit.datagrid && allowEdit.datagrid) && { editor: p => <FieldDefeitosEditor p={p} /> }), editorOptions: { editOnClick: true }, formatter: (p) => <FieldDefeitos p={p} />, editorOptions: { editOnClick: true } },
        { key: 'prop_obs', sortable: false, headerRenderer: p => <CheckColumn id="prop_obs" name='Propriedades Observações' onChange={onCheckChange} defaultChecked={checkData.prop_obs} forInput={modeEdit.datagrid} valid={bobinagem?.valid} />, width: 450, editor(p) { return <ModalObsEditor forInput={modeEdit.datagrid && allowEdit.datagrid} p={p} column="prop_obs" title="Propriedades Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> }, formatter: ({ row, isCellSelected }) => <MultiLine value={row.prop_obs} isCellSelected={isCellSelected}><pre style={{ whiteSpace: "break-spaces" }}>{row.prop_obs}</pre></MultiLine> },
        { key: 'obs', sortable: false, headerRenderer: p => <CheckColumn id="obs" name='Observações' onChange={onCheckChange} defaultChecked={checkData.obs} forInput={modeEdit.datagrid} valid={bobinagem?.valid} />, width: 450, editor(p) { return <ModalObsEditor forInput={modeEdit.datagrid && allowEdit.datagrid} p={p} column="obs" title="Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> }, formatter: ({ row, isCellSelected }) => <MultiLine value={row.obs} isCellSelected={isCellSelected}><pre style={{ whiteSpace: "break-spaces" }}>{row.obs}</pre></MultiLine> },
    ];

    const loadData = async ({ signal } = {}) => {
        /*         if (!permission.allow()) {
                    Modal.error({ content: "Não tem permissões!" });
                    return;
                } */
        const { bobinagem_id, bobinagem_nome, ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, location?.state, [...Object.keys(location?.state), ...Object.keys(dataAPI.getAllFilter())]);
        const bobineDefeitos = BOBINE_DEFEITOS.filter(v => v.value !== 'furos' && v.value !== 'buraco' && v.value !== 'rugas' && v.value !== 'ff' && v.value !== 'fc');
        dataAPI.addFilters({ bobinagem_id, ...initFilters }, true, true);
        dataAPI.fetchPost({
            signal, rowFn: async (dt) => {
                for (let [i, v] of dt.rows.entries()) {
                    let defeitos = [];
                    for (let p of bobineDefeitos) {
                        (v[p.value] === 1) && defeitos.push(p);
                    }
                    dt.rows[i]["defeitos"] = defeitos;
                    dt.rows[i]["estado_original"] = dt.rows[i]["estado"];
                    dt.rows[i]["fc_pos"] = JSON.parse(dt.rows[i]["fc_pos"]);
                    dt.rows[i]["ff_pos"] = JSON.parse(dt.rows[i]["ff_pos"]);
                    dt.rows[i]["furos_pos"] = JSON.parse(dt.rows[i]["furos_pos"]);
                    dt.rows[i]["buracos_pos"] = JSON.parse(dt.rows[i]["buracos_pos"]);
                    dt.rows[i]["rugas_pos"] = JSON.parse(dt.rows[i]["rugas_pos"]);
                    dt.rows[i]["estado"] = (dt.valid === 0 && dataAPI.getData()?.isba == 1) ? "BA" : dt.rows[i]["estado"];
                }
                const _allowEdit = {
                    validate: permission.allow({ producao: 100 }),
                    elevated: (dt.valid === 0) ? permission.allow({ producao: 200 }) : false,
                    form: (dt.valid === 0) ? permission.allow({ producao: 100 }) : false,
                    datagrid: (dt.valid === 0) ? permission.allow({ producao: 100, qualidade: 100 }) : permission.allow({ producao: 100, qualidade: 100 })
                };


                setAllowEdit({ ..._allowEdit });
                setModeEdit(dt.valid === 0 ? { elevated: _allowEdit.elevated, form: _allowEdit.form, datagrid: _allowEdit.datagrid } : { form: false, datagrid: false, elevated: false });
                setBobinagem({ id: bobinagem_id, nome: bobinagem_nome, agg_of_id: dt["agg_of_id"], valid: dt["valid"], acs_id: dt["audit_current_settings_id"], ig_id: dt["ig_bobinagem_id"], "timestamp": moment(dt["timestamp"]).format(DATETIME_FORMAT) });
                if (dt["valid"] === 0) {
                    let nwl = await loadNWLookup(signal, { cs_status: 3, status: 1, queue: 1 });
                    let ni = nwl.find(x => x.type == 0);
                    let ns = nwl.find(x => x.type == 1);
                    dt["tiponwinf"] = ni ? ni.artigo_des : null;
                    dt["tiponwsup"] = ns ? ns.artigo_des : null;

                    setNWList(nwl);
                }
                submitting.end();
                return dt;
            }
        });

    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());

    }, []);

    const onBobineClick = (row) => {
        setModalParameters({ src: `/producao/bobine/details/${row.id}/`, title: `Bobine ${row.nome}` });
        showModal();
    }

    useEffect(() => {
        console.log("BOBINAGEM--", dataAPI.getData())
    }, [dataAPI.hasData()])

    const onFilterFinish = (type, values) => { };
    const onFilterChange = (changedValues, values) => { };
    const onRowsChange = (rows, changedRows) => {
        const column = changedRows.column.key;
        const indexRow = changedRows.indexes[0];
        if (column === "defeitos") {
            const defeitos = rows[indexRow].defeitos || [];
            const defeitosOriginal = dataAPI.getData().rows[indexRow].defeitos || [];
            const removed = defeitosOriginal.filter(a => !defeitos?.map(b => b.value).includes(a.value));
            const added = defeitos.filter(a => !defeitosOriginal?.map(b => b.value).includes(a.value));
            if (checkData.defeitos === true) {
                rows = applyToAllRows(rows, "defeitos", indexRow, added, removed);

            } else if (added.some(v => (v.value === "troca_nw" || v.value === "tr")) || removed.some(v => (v.value === "troca_nw" || v.value === "tr"))) {
                rows = applyToAllRows(rows, "defeitos", indexRow, added, removed);
            }

        }
        if (column.endsWith("_pos")) {
            let value = (rows[indexRow][column]) ? rows[indexRow][column] : [];
            const valueOriginal = dataAPI.getData().rows[indexRow][column] || [];
            const removed = valueOriginal.filter(a => !value?.map(({ min, max }) => ({ min, max })).some(v => a.min === v.min && a.max === v.max));
            const added = value.filter(a => !valueOriginal?.map(({ min, max }) => ({ min, max })).some(v => a.min === v.min && a.max === v.max));
            if (checkData[column] === true) {
                rows = applyRangeToAllRows(rows, column, indexRow, added, removed);
            }
        }
        if (column === "estado") {
            const estado = rows[indexRow].estado;
            if (checkData.estado === true) {
                rows = applyValueToAllRows(rows, "estado", indexRow, estado);
            } else if (estado === "BA") {
                rows = applyValueToAllRows(rows, "estado", indexRow, estado);
            }
        }
        if (column === "obs") {
            const obs = rows[indexRow].obs;
            if (checkData.obs === true) {
                rows = applyValueToAllRows(rows, "obs", indexRow, obs);
            }
        }
        if (column === "prop_obs") {
            const prop_obs = rows[indexRow].prop_obs;
            if (checkData.prop_obs === true) {
                rows = applyValueToAllRows(rows, "prop_obs", indexRow, prop_obs);
            }
        }
        dataAPI.setRows(rows);
    }

    const onPrint = () => {
        setModalParameters({ bobinagem, title: `Imprimir Bobinagem ${bobinagem.nome} ` });
        showPrintModal();
    }

    return (
        <>
            <TitleForm data={dataAPI.getAllFilter()} bobinagem={bobinagem} onChange={onFilterChange} />
            <FormRegister nwList={nwList} submitting={submitting} dataAPI={dataAPI} allowEdit={allowEdit} setModeEdit={setModeEdit} modeEdit={modeEdit} loadData={loadData} bobinagem={bobinagem} />
            <Table
                loading={submitting.state}
                reportTitle="Bobines"
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                toolbar={true}
                search={false}
                moreFilters={false}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={false}
                rowHeight={28}
                onRowsChange={onRowsChange}
                toolbarFilters={{ content: <Col xs="content"><Button disabled={!bobinagem?.valid} icon={<PrinterOutlined />} onClick={onPrint}>Imprimir Etiquetas</Button></Col> }}
                leftToolbar={<>
                    <div id="save-btn"></div>
                </>}
            />
        </>
    );
}