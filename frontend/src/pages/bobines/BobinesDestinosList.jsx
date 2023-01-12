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
import { useDataAPI } from "utils/useDataAPI";
import { usePermission, Permissions } from "utils/usePermission";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { useNavigate, useLocation } from "react-router-dom";
import Portal from "components/portal";
import IconButton from "components/iconButton";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Typography, Modal, Checkbox, Tag, Badge, Alert, DatePicker, TimePicker, Divider, Drawer, Select, Menu } from "antd";
const { TextArea } = Input;
import { PlusOutlined, MoreOutlined, EditOutlined, ReadOutlined, PrinterOutlined, LockOutlined, CopyOutlined } from '@ant-design/icons';
import { CgCloseO } from 'react-icons/cg';
import Table from 'components/TableV2';
import { API_URL, DATE_FORMAT, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, SelectMultiField, Selector, Label, SwitchField } from 'components/FormFields';
import { Status, FormPrint } from "./commons";
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
    },
    edit: {
        position: "relative",
        '&:before': {
            /* we need this to create the pseudo-element */
            content: "''",
            display: "block",
            /* position the triangle in the top right corner */
            position: "absolute",
            zIndex: "0",
            top: "0",
            right: "0",
            /* create the triangle */
            width: "0",
            height: "0",
            border: ".3em solid transparent",
            borderTopColor: "#66afe9",
            borderRightColor: "#66afe9"

        }
    }
});

const CheckColumn = ({ id, name, onChange, defaultChecked = false, forInput, valid }) => {
    const ref = useRef();
    const onCheckChange = (e) => {
        ref.current.checked = !ref.current.checked;
        onChange(id, e);
    }
    return (<Space>{name}{(forInput) && <Checkbox ref={ref} onChange={onCheckChange} defaultChecked={defaultChecked} />}</Space>);
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
        <Drawer push={false} title={title} open={visible} destroyOnClose onCancel={onCancel} onOk={forInput ? onConfirm : onCancel}>
            <TextArea disabled={!forInput} autoFocus value={value} onChange={(e) => setvalue(e.target.value)} onKeyDown={e => (e.key === 'Enter') && e.stopPropagation()} {...props} />
        </Drawer>
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

const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [
        ...(modeEdit && props.row?.closed === 0 && props.row?.valid !== 0) ? [{ label: <span style={{}}>Fechar movimento</span>, key: 'close', icon: <CheckCircleOutlined style={{ fontSize: "16px" }} /> }, { type: 'divider' }] : [],
        ...(modeEdit && props.row?.closed === 0 && props.row?.valid !== 0 && props.row?.type_mov == 1) ? [{ label: <span style={{}}>Saída de Linha</span>, key: 'out', icon: <ImArrowLeft size={16} style={{ verticalAlign: "text-top" }} /> }, { type: 'divider' }] : [],
        (modeEdit && props.row?.closed === 0 && props.row?.valid !== 0) && { label: <span style={{ fontWeight: 700 }}>Eliminar Registo</span>, key: 'delete', icon: <DeleteFilled style={{ fontSize: "16px", color: "red" }} /> }
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}


const loadCustomersLookup = async (value) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellcustomerslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_customer"]: `%${value.replaceAll(' ', '%%')}%` } });
    return rows;
}

const CustomEstadoSearch = ({ value, onClick, ...props }) => {
    return (
        <Status b={{ estado: value }} onClick={onClick} {...props} />
    );
}

const DestinoEditor = ({ p, onChange, forInput, ...props }) => {
    const classes = useStyles();
    const [visible, setVisible] = useState(true);
    const [value, setvalue] = useState();
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(false);
    const schemaEditor = (options = {}) => { return getSchema({}, options).unknown(true); }

    useEffect(() => {
        form.setFieldsValue({ estado: { value: p.row.estado }, regranular: 0 });
        //form.setFieldsValue({ items: p.row[column] });
    }, []);

    const onFinish = (e) => {
        /* if (!forInput || valid !== 1) {
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
        submitting.end(); */
    }

    const onValuesChange = () => { };
    const onCancel = () => {
        p.onClose();
        setVisible(false);
    };

    return (
        <>
            <div>
                <Drawer maskClosable={true} title={<div>Destinos <span style={{ fontWeight: 900 }}>{p.row.nome}</span></div>} open={visible} destroyOnClose onClose={onCancel} width="550px" footer={true}>
                    <Form form={form} name={`f-destinos`} onValuesChange={onValuesChange} initialValues={{}}>
                        <AlertsContainer /* id="el-external" */ mask /* fieldStatus={fieldStatus} */ formStatus={formStatus} portal={false} />
                        <FormContainer id="FRM-Destinos" fluid forInput={forInput} loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} style={{ marginTop: "5px", padding: "0px" }} schema={schemaRange} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }}>
                            <Form.List name="destinos">
                                {(fields, { add, remove, move }) => {
                                    const addRow = (fields, duplicate = false) => {
                                        //if (fields.length === 0) {
                                        if (duplicate) {
                                            add(form.getFieldValue(["destinos",duplicate.name]));
                                        } else {
                                            add({ cliente_id: null, cliente_cod: null, cliente_nome: null, largura: p.row.lar, obs: null, removeCtrl: true });
                                        }
                                        //} else {
                                        //    add({ [`min`]: null, [`max`]: null, "unit": unit, ...(type == "ff" && { "type": "Desbobinagem" }), removeCtrl: true });
                                        //}
                                    }
                                    const removeRow = (fieldName, field) => {
                                        remove(fieldName);
                                    }
                                    const moveRow = (from, to) => {
                                        //move(from, to);
                                    }
                                    return (
                                        <>
                                            <div style={{}}>
                                                <YScroll>
                                                    {fields.length > 0 &&
                                                        <Row gutterWidth={1}>
                                                            <Col width={30} style={{ fontWeight: 700, fontSize: "15px" }}></Col>
                                                            <Col><Label text="Cliente" /></Col>
                                                            <Col width={100}><Label text="Largura" /></Col>
                                                            <Col width={30}></Col>
                                                        </Row>
                                                    }
                                                    {fields.map((field, index) => (
                                                        <Row key={field.key} gutterWidth={1} style={{ marginBottom: "15px" }}>
                                                            <Col width={30} style={{ display: "flex", flexDirection: "column", alignItems: "center", fontWeight: 700, fontSize: "15px" }}><div>{index + 1}</div><Button onClick={() => addRow(fields, field)} size="small" icon={<CopyOutlined />} /></Col>
                                                            <Col>
                                                                <Row gutterWidth={1}>
                                                                    <Col>
                                                                        <Field wrapFormItem={true} name={[field.name, `client_cod`]} label={{ enabled: false, text: "Cliente" }}>
                                                                            <Selector
                                                                                size="small"
                                                                                title="Clientes"
                                                                                params={{ payload: { url: `${API_URL}/sellcustomerslookup/`, parameters: {}, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } }}
                                                                                keyField={["BPCNUM_0"]}
                                                                                textField="BPCNAM_0"
                                                                                detailText={r => r?.ITMDES1_0}
                                                                                style={{ fontWeight: 700 }}
                                                                                columns={[
                                                                                    { key: 'BPCNUM_0', name: 'Cód', width: 160 },
                                                                                    { key: 'BPCNAM_0', name: 'Nome' }
                                                                                ]}
                                                                                filters={{ fmulti_customer: { type: "any", width: 150, text: "Cliente" } }}
                                                                                moreFilters={{}}
                                                                            />
                                                                        </Field>
                                                                    </Col>
                                                                    <Col width={100}><Field name={[field.name, `largura`]} label={{ enabled: false, text: "Largura" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} controls={false} addonAfter={<b>mm</b>} min={10} max={500} /></Field></Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col>
                                                                        <Field wrapFormItem={true} name={[field.name, `obs`]} label={{ enabled: false }}>
                                                                            <TextArea onKeyDown={(e) => (e.key == 'Enter') && e.stopPropagation()} autoSize={{ minRows: 1, maxRows: 3 }} onChange={(v) => onChange("obs", v)} style={{ width: "100%" }} />
                                                                        </Field>
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                            <Col width={30}>{forInput && <div className={classNames(classes.center)}><IconButton onClick={() => removeRow(field.name, field)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton></div>}</Col>
                                                            {/* <Col><Field name={[field.name, `min`]} label={{ enabled: false }}><InputNumber autoFocus size="small" style={{ width: "100%", textAlign: "right" }} controls={false} addonAfter={<b>{unit}</b>} min={0} max={p.row.comp} /></Field></Col>
                                                    <Col><Field name={[field.name, `max`]} label={{ enabled: false }} includeKeyRules={['min']} allValues={{ min: form.getFieldValue(['items', index, 'min']) }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} controls={false} addonAfter={<b>{unit}</b>} min={0} max={p.row.comp_actual} /></Field></Col>
                                                    {type === "ff" && <Col xs="content"><Field name={[field.name, `type`]} label={{ enabled: false }}><Select size="small" style={{ width: "100%", textAlign: "right" }} options={[{ value: "Bobinagem" }, { value: "Desbobinagem" }]} /></Field></Col>}
                                                    <Col xs={2}>{forInput && <div className={classNames(classes.center)}><IconButton onClick={() => removeRow(field.name, field)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton></div>}</Col> */}
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
                            <Row style={{marginTop:"10px"}} gutterWidth={5}>
                                <Col width={50}><Field wrapFormItem={true} name="estado" label={{ enabled: false, text: "Estado" }}>
                                    <Selector
                                        size="small"
                                        toolbar={false}
                                        title="Estados"
                                        popupWidth={130}
                                        params={{ payload: { data: { rows: BOBINE_ESTADOS }, pagination: { limit: 20 } } }}
                                        keyField={["value"]}
                                        textField="value"
                                        rowHeight={28}
                                        columns={[
                                            { key: 'value', name: 'Estado', formatter: p => <Status b={{ estado: p.row.value }} /> }
                                        ]}
                                        customSearch={<CustomEstadoSearch />}
                                    />
                                </Field></Col>
                                <Col width={120}>
                                    <Field wrapFormItem={true} name="regranular" label={{ enabled: false, text: "Regranular" }}>
                                        <SwitchField checkedChildren="Regranular" unCheckedChildren="Regranular" />
                                    </Field>
                                </Col>
                            </Row>
                            <Row style={{}} gutterWidth={1}>
                                <Col>
                                    <Field wrapFormItem={true} name="obs" label={{ enabled: true, text: "Observações" }}>
                                        <TextArea onKeyDown={(e) => (e.key == 'Enter') && e.stopPropagation()} autoSize={{ minRows: 2, maxRows: 4 }} onChange={(v) => onChange("obs", v)} style={{ width: "100%" }} />
                                    </Field>
                                </Col>
                            </Row>
                        </FormContainer>
                    </Form>

                </Drawer>
            </div>
        </>
    );
}

export default (props) => {
    const submitting = useSubmitting(true);
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();
    const [formFilter] = Form.useForm();

    const permission = usePermission({});
    const [modeEdit, setModeEdit] = useState({ datagrid: false });

    const [bobinagem, setBobinagem] = useState();
    const [checkData, setCheckData] = useImmer({ destino: false });
    const defaultParameters = {};
    const defaultFilters = {};
    const defaultSort = [{ column: 'nome', direction: 'ASC' }];
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/validarbobineslist/`, parameters: {}, pagination: { enabled: false, limit: 100 }, filter: {}, sort: [] } });
    const primaryKeys = ['id'];
    const editable = (row, col) => {
        if (modeEdit.datagrid && permission.isOk({ action: "changeDestino" }) && !props?.parameters?.palete?.carga_id && !props?.parameters?.palete?.SDHNUM_0 && props?.parameters?.palete?.nome.startsWith('D')) {
            return (col === "destino") ? true : false;
        }
        return false;
    }
    const editableClass = (row, col) => {
        if (modeEdit.datagrid && permission.isOk({ action: "changeDestino" }) && !props?.parameters?.palete?.carga_id && !props?.parameters?.palete?.SDHNUM_0 && props?.parameters?.palete?.nome.startsWith('D')) {
            return (col === "destino") ? classes.edit : undefined;
        }
    }

    const onCheckChange = (key, value) => { setCheckData(draft => { draft[key] = value.target.checked; }); }
    const [modalParameters, setModalParameters] = useState({});
    const [showPrintModal, hidePrintModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal title={modalParameters.title} footer="none" onCancel={hidePrintModal} width={300} height={180}><FormPrint v={{ ...modalParameters }} /></ResponsiveModal>
    ), [modalParameters]);
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal title={modalParameters.title} lazy={true} footer="ref" onCancel={hideModal} width={5000} height={5000}><IFrame src={modalParameters.src} /></ResponsiveModal>
    ), [modalParameters]);


    const columns = [
        { key: 'nome', sortable: false, name: 'Bobine', width: 130, frozen: true, formatter: p => <Button size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.nome}</Button> },
        { key: 'estado', sortable: false, name: 'Estado', minWidth: 85, width: 85, formatter: (p) => <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status b={p.row} /></div> },
        {
            key: 'destino', width: 200, editable: true, headerRenderer: p => <CheckColumn id="destino" name="Destino" onChange={onCheckChange} defaultChecked={checkData.estado} forInput={editable(p.row, 'destino')} />, cellClass: r => editableClass(r, 'destino'),
            editor: p => <DestinoEditor forInput={editable(p.row, 'destino')} p={p} palete={props?.parameters?.palete} column="destino" onChange={() => { console.log("changedddddddd") }} />,
            editorOptions: { editOnClick: true, commitOnOutsideClick: false }, formatter: p => p.row.destino
        },

        { key: 'l_real', sortable: false, name: 'Largura Real', width: 90, formatter: ({ row }) => row.l_real },
        { key: 'fc_pos', sortable: false, width: 85, name: "Falha Corte", formatter: ({ row }) => <ItemsField row={row} column="fc_pos" />, editor(p) { return <ModalRangeEditor type="fc" unit='mm' p={p} column="fc_pos" title="Falha de Corte" forInput={false} valid={1} /> } },
        { key: 'ff_pos', sortable: false, width: 85, name: "Falha de Filme", formatter: ({ row }) => <ItemsField row={row} column="ff_pos" />, editor(p) { return <ModalRangeEditor type="ff" p={p} column="ff_pos" title="Falha de Filme" forInput={false} valid={1} /> } },
        { key: 'buracos_pos', sortable: false, width: 85, name: "Buracos", formatter: ({ row }) => <ItemsField row={row} column="buracos_pos" />, editor(p) { return <ModalRangeEditor type="buracos" p={p} column="buracos_pos" title="Buracos" forInput={false} valid={1} /> } },
        { key: 'furos_pos', sortable: false, width: 85, name: "Furos", formatter: ({ row }) => <ItemsField row={row} column="furos_pos" />, editor(p) { return <ModalRangeEditor p={p} type="furos" column="furos_pos" title="Furos" forInput={false} valid={1} /> } },
        { key: 'rugas_pos', sortable: false, width: 85, name: "Rugas", formatter: ({ row }) => <ItemsField row={row} column="rugas_pos" />, editor(p) { return <ModalRangeEditor type="rugas" p={p} column="rugas_pos" title="Rugas" forInput={false} valid={1} /> } },
        { key: 'comp', sortable: false, name: "Comprimento", width: 100, formatter: ({ row }) => row.comp },
        { key: 'defeitos', sortable: false, width: 250, name: "Outros Defeitos", formatter: (p) => <FieldDefeitos p={p} /> },
        { key: 'prop_obs', sortable: false, name: "Propriedades Observações", formatter: ({ row, isCellSelected }) => <MultiLine value={row.prop_obs} isCellSelected={isCellSelected}><pre style={{ whiteSpace: "break-spaces" }}>{row.prop_obs}</pre></MultiLine>, editor(p) { return <ModalObsEditor forInput={false} p={p} column="prop_obs" title="Propriedades Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> } },
        { key: 'obs', sortable: false, name: "Observações", formatter: ({ row, isCellSelected }) => <MultiLine value={row.obs} isCellSelected={isCellSelected}><pre style={{ whiteSpace: "break-spaces" }}>{row.obs}</pre></MultiLine>, editor(p) { return <ModalObsEditor forInput={false} p={p} column="obs" title="Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> } },
    ];

    const loadData = async ({ signal } = {}) => {
        const { palete, ..._parameters } = props?.parameters || {};
        const { bobinagem_id, bobinagem_nome, ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, _parameters, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys(_parameters ? _parameters : {})]);
        let { filterValues, fieldValues } = fixRangeDates([], initFilters);
        formFilter.setFieldsValue({ ...fieldValues });
        dataAPI.addFilters({ ...filterValues, ...(bobinagem_id && { bobinagem_id }) }, true, false);
        dataAPI.setSort(defaultSort);
        dataAPI.addParameters(defaultParameters, true, false);
        dataAPI.fetchPost({
            signal, rowFn: async (dt) => {
                const bobineDefeitos = BOBINE_DEFEITOS.filter(v => v.value !== 'furos' && v.value !== 'buraco' && v.value !== 'rugas' && v.value !== 'ff' && v.value !== 'fc');
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
                    dt.rows[i]["estado"] = dt.rows[i]["estado"];
                }
                // setBobinagem({ id: bobinagem_id, nome: bobinagem_nome, agg_of_id: dt["agg_of_id"], valid: dt["valid"], acs_id: dt["audit_current_settings_id"], ig_id: dt["ig_bobinagem_id"], "timestamp": moment(dt["timestamp"]).format(DATETIME_FORMAT) });
                // if (dt["valid"] === 0) {
                //     let nwl = await loadNWLookup(signal, { cs_status: 3, status: 1, queue: 1 });
                //     let ni = nwl.find(x => x.type == 0);
                //     let ns = nwl.find(x => x.type == 1);
                //     dt["tiponwinf"] = ni ? ni.artigo_des : null;
                //     dt["tiponwsup"] = ns ? ns.artigo_des : null;

                //     setNWList(nwl);
                // }
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

    const changeMode = () => {
        setModeEdit({ datagrid: (modeEdit.datagrid) ? false : true });
    }

    const onAction = (item, row) => {
        // switch (item.key) {
        //     case "delete": Modal.confirm({
        //         title: <div>Eliminar Movimento <b>{row.vcr_num}</b></div>, content: <ul>
        //             {row.type_mov === 1 && <li>Serão eliminados os movimentos de entrada e saída!</li>}
        //             <li style={{ fontWeight: 700 }}>Atenção!! Se tiver alterações por guardar, ao efetuar esta operação perderá todas as alterações.</li>
        //         </ul>, onOk: async () => {
        //             submitting.trigger();
        //             try {
        //                 let response = await fetchPost({ url: `${API_URL}/deletegranulado/`, filter: { vcr_num: row.vcr_num, type_mov: row.type_mov }, parameters: {} });
        //                 if (response.data.status !== "error") {
        //                     dataAPI.fetchPost();
        //                 } else {
        //                     Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
        //                 }
        //             } catch (e) {
        //                 Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        //             } finally {
        //                 submitting.end();
        //             };
        //         }
        //     });
        //         break;
        //     case "out":
        //         setModalParameters({ type: item.key, title: "Saída de lote em linha", loadData: () => dataAPI.fetchPost(), record: row });
        //         showModal();
        //         break;
        //     case "close":
        //         setModalParameters({ type: item.key, title: "Fechar movimento", loadData: () => dataAPI.fetchPost(), record: row, height: 300 });
        //         showModal();
        //         break;
        // }
    }

    return (
        <>
            {/* <TitleForm data={dataAPI.getAllFilter()} bobinagem={bobinagem} onChange={onFilterChange} /> */}
            <Table
                loading={submitting.state}
                actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} modeEdit={modeEdit.datagrid} />}
                frozenActionColumn
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
                leftToolbar={<Space>

                    <Permissions permissions={props?.permission} action="editList">
                        {!modeEdit.datagrid && <Button disabled={submitting.state} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
                        {modeEdit.datagrid && <Button disabled={submitting.state} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                        {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={submitting.state} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                    </Permissions>

                </Space>}
            />
        </>
    );
}