import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import moment from 'moment';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, getFilterRangeValues, getFilterValue, isValue } from "utils";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { useNavigate, useLocation } from "react-router-dom";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select } from "antd";
const { Title } = Typography;
const { TextArea } = Input;
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined } from '@ant-design/icons';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import { usePermission } from "utils/usePermission";
import { Status } from './commons';
import YScroll from 'components/YScroll';

const title = "Reciclado(Granulado) Lotes";
const TitleForm = ({ data, onChange }) => {
    return (<ToolbarTitle title={
        <Col xs='content' style={{}}><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title}</span></Col>
    } />);
}



const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const schemaNewLote = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const ActionContent = ({ dataAPI, hide, onClick, ...props }) => {
    const items = [
        { label: 'Eliminar Entrada', key: 'delete', icon: <DeleteOutlined /> }
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    const [produtoGranulado, setProdutoGranulado] = useState([]);
    const loadData = async ({ signal }) => {
        const pg = await loadProdutoGranuladoLookup(signal);
        setProdutoGranulado(pg);
    };

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    return (<>
        <Col xs='content'><Field wrapFormItem={true} name="flote" label={{ enabled: true, text: "Lote" }}><Input width={250} size="small" /></Field></Col>
        <Col xs='content'><Field wrapFormItem={true} name="fproduto" label={{ enabled: true, text: "Produto" }}><SelectField allowClear size="small" style={{ width: "200px" }} keyField="id" textField="produto_granulado" data={produtoGranulado} /></Field></Col>
        <Col xs='content' style={{ alignSelf: "end" }}><Field wrapFormItem={true} name="fdata" label={{ enabled: true, text: "Data Lote", pos: "top", padding: "0px" }}>
            <RangeDateField size='small' allowClear />
        </Field></Col>
    </>
    );
}


const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    }
});

const loadProdutoGranuladoLookup = async (signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/produtogranuladolookup/`, filter: {}, sort: [], signal });
    return rows;
}
const NewLoteContent = ({ loteId, parentRef, closeParent }) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
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
        const status = { error: [], warning: [], info: [], success: [] };
        submitting.trigger();
        try {
            const response = await fetchPost({ url: `${API_URL}/newlotegranulado/`, parameters: { peso: 0, tara: '15 kg', estado: 'ND', produto_granulado_id: values.produto } });
            if (response.data.status !== "error") {
                navigate('/app/picking/pickgranulado', { state: { id: response.data.id[0] } });
            } else {
                status.error.push({ message: <div>{response.data.title} {response.data.subTitle && response.data.subTitle}</div> });
                setFormStatus({ ...status });
            }
        } catch (e) {
            status.error.push({ message: e.message });
            setFormStatus({ ...status });
        } finally {
            submitting.end();
        }
    }

    const onValuesChange = (changedValues, values) => {

    }

    return (
        <Form form={form} name={`f-lote`} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={{ produto: 1, tara: 15 }}>
            <AlertsContainer mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-LOTE" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} schema={schemaNewLote} wrapFormItem={true} forInput={true}>
                <Row style={{}} gutterWidth={10}>
                    <Col xs={6}><Field wrapFormItem={true} name="produto" label={{ enabled: true, text: "Produto" }}><SelectField style={{ width: "100%" }} size="small" keyField="id" textField="produto_granulado" data={produtoGranulado} /></Field></Col>
                </Row>
            </FormContainer>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" disabled={submitting.state} onClick={() => form.submit()}>Registar</Button>
                    <Button onClick={closeParent}>Cancelar</Button>
                </Space>
            </Portal>
            }
        </Form>
    );
}

const focus = (el, h,) => { el?.focus(); };
const FieldEstadoEditor = ({ p, onEstadoChange }) => {
    const onChange = (v) => {
        /* p.onRowChange({ ...p.row, estado: v }, true) */
    };
    return (
        <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.estado} ref={focus} onChange={(v) => onEstadoChange(p, v)} size="small" keyField="value" textField="label" data={[{ value: 'G', label: 'GOOD' }, { value: 'R', label: 'REJEITADO' }]} />
    );
}

const ConfirmEstadoContent = ({ parameters, parentRef, closeParent }) => {
    const { lote, id, obs, submitting } = parameters;
    const onCancel = () => {
        console.log("oooooooooooooooooooooooooo", submitting.state)
        submitting.end();
        closeParent();
    }
    return (<div>
        <TextArea autoFocus value={obs} />
        {parentRef && <Portal elId={parentRef.current}>
            <Space>
                <Button type="primary" disabled={submitting.state} onClick={() => { }}>Registar</Button>
                <Button onClick={onCancel}>Cancelar</Button>
            </Space>
        </Portal>
        }
    </div>);
}

const schemaEstado = (options = {}) => {
    return getSchema({
        estado: Joi.string().label("Estado").required(),
        obs: Joi.when('estado', { is: "R", then: Joi.string().required() }).label("Observações")
    }, options).unknown(true);
}

const ModalEstadoChange = ({ p, submitting, dataAPI }) => {
    const [visible, setVisible] = useState(true);
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [fieldStatus, setFieldStatus] = useState({});
    const [obs, setObs] = useState(p.row.obs);
    const [estado, setEstado] = useState(p.row.estado);

    const onConfirm = async (e) => {
        submitting.trigger();
        const v = schemaEstado().validate({ estado, obs }, { abortEarly: false, messages: validateMessages, context: {} });
        const { errors, warnings, value, ...status } = getStatus(v);
        if (errors > 0) {
            setFormStatus({...status.formStatus});
            setFieldStatus({...status.fieldStatus});
            submitting.end();
        } else {
            if (e.type === "click" || (e.type === "keydown" && e.key === 'Enter')) {

                try {
                    const response = await fetchPost({ url: `${API_URL}/updategranulado/`, filter: { id: p.row.id }, parameters: { estado, obs } });
                    if (response.data.status !== "error") {
                        dataAPI.fetchPost();
                    } else {
                        Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro ao alterar', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{response.data.title}</YScroll></div></div> });
                    }
                } catch (e) {
                    Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro ao alterar', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
                } finally {
                    submitting.end();
                    p.onClose();
                }
            }
        }
    }
    const onCancel = () => {
        p.onClose();
        setVisible(false);
    };

    return (
        <Modal title={<div>Alterar estado do lote <span style={{fontWeight:900}}>{p.row.lote}</span></div>} open={visible} destroyOnClose onCancel={onCancel} onOk={onConfirm}>
            <AlertsContainer mask formStatus={formStatus} fieldStatus={fieldStatus} portal={false} />
            <Container>
                <Row style={{ marginBottom: "15px", marginTop:"15px" }}>
                    <Col>
                        <Select size="small" value={estado} options={[{ value: "G", label: "GOOD" }, { value: "R", label: "REJEITADO" }]} onChange={v => setEstado(v)} />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <TextArea rows={4} autoFocus value={obs} onChange={(e) => setObs(e.target.value)} onKeyDown={e => (e.key === 'Enter') && e.stopPropagation()} />
                    </Col>
                </Row>
            </Container>
        </Modal>
    );
}


export default ({ record, setFormTitle, parentRef, closeParent, parentReload, forInput = true }) => {
    const submitting = useSubmitting(false);
    const navigate = useNavigate();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "granuladolist", payload: { url: `${API_URL}/granuladolist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, sort: [{ column: "timestamp", direction: "DESC" }] } });

    const permission = usePermission({ allowed: { producao: 100, logistica: 100, qualidade: 100 } });
    const [allowEdit, setAllowEdit] = useState({ form: false, datagrid: false });
    const [modeEdit, setModeEdit] = useState({ form: false, datagrid: false });

    const primaryKeys = ['id'];
    const columns = [
        //{ key: 'print', name: '',  minWidth: 45, width: 45, sortable: false, resizable: false, formatter:props=><Button size="small"><PrinterOutlined/></Button> },
        { key: 'lote', name: 'Lote', formatter: p => <Button type="link" size="small" onClick={() => navigate('/app/picking/pickgranulado', { state: { id: p.row.id } })}>{p.row.lote}</Button> },
        { key: 'estado', name: 'Estado', width: 80, formatter: p => <Status estado={p.row.estado} />, editor(p) { return p.row.status === 1 && <ModalEstadoChange p={p} submitting={submitting} dataAPI={dataAPI} /> }, editorOptions: { editOnClick: true } },
        { key: 'peso', name: 'Peso', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{p.row.peso} kg</div> },
        { key: 'tara', name: 'Tara', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{p.row.tara}</div> },
        { key: 'produto_granulado', name: 'Produto', minWidth: 150, width: 150 },
        { key: 'timestamp', name: 'Data', formatter: props => moment(props.row.timestamp).format(DATETIME_FORMAT) }
    ];
    const [showNewLoteModal, hideNewLoteModal] = useModal(({ in: open, onExited }) => {
        return <ResponsiveModal title="Novo Lote de Granulado"
            onCancel={hideNewLoteModal}
            width={600} height={200} footer="ref" >
            <NewLoteContent />
        </ResponsiveModal>;
    }, [dataAPI.getTimeStamp()]);

    useEffect(() => {
        (setFormTitle) && setFormTitle({ title });
    }, []);

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const vals = Object.fromEntries(Object.entries({ ...dataAPI.getAllFilter(), ...values }).filter(([_, v]) => v !== null && v!==''));
                const _values = {
                    ...vals,
                    flote: getFilterValue(values?.flote, 'any'),
                    fdata: getFilterRangeValues(values?.fdata?.formatted),
                    fproduto: getFilterValue(values?.fproduto, '==')
                };
                dataAPI.addFilters(_values);
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };


    return (
        <>
            {!setFormTitle && <TitleForm data={dataAPI.getAllFilter()} onChange={onFilterChange} />}
            <Table
                //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
                loading={submitting.state}
                reportTitle={title}
                loadOnInit={true}
                columns={columns}
                dataAPI={dataAPI}
                //actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                toolbar={true}
                search={true}
                moreFilters={false}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                rowClass={(row) => (row?.status === 0 ? classes.notValid : undefined)}
                //selectedRows={selectedRows}
                //onSelectedRowsChange={setSelectedRows}
                leftToolbar={<>
                    <Button type='primary' icon={<AppstoreAddOutlined />} onClick={(showNewLoteModal)}>Novo Lote</Button>
                </>}
                //content={<PickHolder/>}
                //paginationPos='top'
                toolbarFilters={{ form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange, filters: <ToolbarFilters dataAPI={dataAPI} /> }}
            />
        </>
    );
}