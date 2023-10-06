import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import dayjs from 'dayjs';
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
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined,GatewayOutlined } from '@ant-design/icons';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET,SAGE_LOCS, SAGE_STATUS, SAGE_ESTABELECIMENTOS } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { usePermission } from "utils/usePermission";
import { Status } from './commons';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { json, excludeObjectKeys, xmlToJSON } from "utils/object";

const title = "Reciclado";
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
const NewLoteContent = ({ parentRef,closeParent, ...props }) => {
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
            const response = await fetchPost({ url: `${API_URL}/newlotereciclado/`, parameters: { peso: 0, tara: '15 kg', estado: 'ND', produto_granulado_id: values.produto } });
            if (response.data.status !== "error") {
                navigate('/app/picking/pickreciclado', { state: { id: response.data.id[0] } });
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
            setFormStatus({ ...status.formStatus });
            setFieldStatus({ ...status.fieldStatus });
            submitting.end();
        } else {
            if (e.type === "click" || (e.type === "keydown" && e.key === 'Enter')) {

                try {
                    const response = await fetchPost({ url: `${API_URL}/updatereciclado/`, filter: { id: p.row.id }, parameters: { estado, obs } });
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
        <Modal title={<div>Alterar estado do lote <span style={{ fontWeight: 900 }}>{p.row.lote}</span></div>} open={visible} destroyOnClose onCancel={onCancel} onOk={onConfirm}>
            <AlertsContainer mask formStatus={formStatus} fieldStatus={fieldStatus} portal={false} />
            <Container>
                <Row style={{ marginBottom: "15px", marginTop: "15px" }}>
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

const FormSyncRecicladoReport = ({ parameters, extraRef, closeSelf, loadParentData, openNotification, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    //const permission = usePermission({ allowed: { producao: 100, planeamento: 100 } });//Permissões Iniciais
    //const [allowEdit, setAllowEdit] = useState({ form: false, datagrid: false });//Se tem permissões para alterar (Edit)
    //const [modeEdit, setModeEdit] = useState({ form: false, datagrid: false }); //Se tem permissões para alternar entre Mode Edit e View
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [form] = Form.useForm();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const dataAPIArtigos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "ordemfabrico" });
    const [clienteExists, setClienteExists] = useState(false);
    const [calls, setCalls] = useState();
    const primaryKeys = [];

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal } = {}) => {
        form.setFieldsValue({ fcy: SAGE_ESTABELECIMENTOS[0], loc: SAGE_LOCS[0], sta: SAGE_STATUS[0] });
        submitting.end();
    }

    const xmlTagToJson = (xml, tagName, attributeKey) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        const obj = {};
        for (const node of xmlDoc.children) {
            for (const child of node.children) {
                obj[child.getAttribute(attributeKey)] = child.textContent
            }

        }
        return obj;
    }

    const onFinish = async (type = 'run') => {
        const values = form.getFieldsValue(true);
        submitting.trigger();
        let response = null;
        try {
            response = await fetchPost({
                ...{
                    url: `${API_URL}/sage/sql/`, parameters: {
                        method: "SyncRecicladoProductionReport",
                        run: type === "run" ? 1 : 0,
                        //...pickAll(["ofabrico", "temp_ofabrico", "ofabrico_sgp", "item"], parameters?.data)
                        fcy: values.fcy.value,
                        loc: values.loc.value,
                        sta: values.sta.value
                    }
                }
            });
            if (response.data.status !== "error") {
                const _calls = [];
                for (const [key, value] of Object.entries(json(response.data.calls))) {
                    const _details = [];
                    for (const v of value.bodyd)
                        _details.push(xmlTagToJson(v, "FLD", "NAME"));
                    _calls.push({ data: key, header: xmlTagToJson(value.bodyh, "FLD", "NAME"), details: _details })
                }
                setCalls(_calls)
                if (type == "run") {
                    openNotification(response.data.status, 'top', "Notificação", response.data.title);
                    loadParentData();
                }
            } else {
                openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
            }
        } catch (e) {
            openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        }
        submitting.end();
    }

    const onValuesChange = (changedValues, values) => {
        if ("YYYY" in changedValues) {
            //console.log(changedValues)
            //form.setFieldsValue("YYYY", null);
        }
    }

    return (
        <YScroll>
            <FormContainer id="LAY-SYNCWOP" fluid forInput={true} loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }}>
                <Row>
                    <Col width={220}>
                        <Row>
                            <Col width={200}>
                                <Field name="fcy" label={{ enabled: true, text: "Estabelecimento" }}>
                                    <SelectField size="small" keyField="value" textField="label" data={SAGE_ESTABELECIMENTOS} />
                                </Field>
                            </Col>
                        </Row>
                        <Row>
                            <Col width={200}>
                                <Field name="loc" label={{ enabled: true, text: "Localização" }}>
                                    <SelectField size="small" keyField="value" textField="label" data={SAGE_LOCS} />
                                </Field>
                            </Col>
                        </Row>
                        <Row>
                            <Col width={200}>
                                <Field name="sta" label={{ enabled: true, text: "Estado" }}>
                                    <SelectField size="small" keyField="value" textField="label" data={SAGE_STATUS} />
                                </Field>
                            </Col>
                        </Row>
                    </Col>
                    {calls &&
                        <Col>
                            <Row>
                                <Col style={{ fontWeight: 700, fontSize: "14px" }}>
                                    Relatório de Produção
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <YScroll>
                                        {calls && calls.map(v => {

                                            return <React.Fragment key={`h-${v.data}`}>
                                                {/*HEADER*/}
                                                <div style={{ display: "flex" }}>{Object.keys(v.header).map((h, i) => {

                                                    return <React.Fragment key={`h-${v.data}.${i}`}>
                                                        {i == 0 && <div style={{ marginRight: "5px" }}>
                                                            <div style={{ fontWeight: 700, height: "10px" }}></div>
                                                            <div style={{}}>#{v.details.length}</div>
                                                        </div>
                                                        }
                                                        <div style={{ marginRight: "5px" }}>
                                                            <div style={{ fontWeight: 700, height: "10px" }}></div>
                                                            <div style={{ fontWeight: 700 }}>{v.header[h]}</div>
                                                        </div>
                                                    </React.Fragment>
                                                })}</div>
                                                {/*DETAILS*/}
                                                <div style={{ paddingLeft: "10px" }}>{v.details.map((d, i) => {
                                                    return <React.Fragment key={`dh-${v.data}-${i}`}>

                                                        <div style={{ display: "flex" }}>{Object.keys(d).map(h => {
                                                            return <div key={`dh-${v.data}-${i}-${h}`} style={{ marginRight: "5px" }}>
                                                                <div>{d[h]}</div>
                                                            </div>
                                                        })}</div>

                                                    </React.Fragment>
                                                })}</div>

                                            </React.Fragment>

                                        })}
                                    </YScroll>
                                </Col>
                            </Row>
                        </Col>
                    }
                </Row>
                {/* <Row>
                    <Col xs="content"><Field name="ip_date" label={{ enabled: true, text: "Data de Imputação", padding: "0px" }}><DatePicker showTime={false} format={DATE_FORMAT} /></Field></Col>
                </Row> */}
                {extraRef && <Portal elId={extraRef.current}>
                    <Space>
                        <Button disabled={submitting.state} onClick={closeSelf}>Cancelar</Button>
                        <Button disabled={submitting.state} onClick={() => onFinish("simulation")} icon={<GatewayOutlined />}>Simular</Button>
                        <Button disabled={submitting.state} type="primary" onClick={() => onFinish("run")}>Sincronizar</Button>
                    </Space>
                </Portal>
                }
            </FormContainer>
        </YScroll>
    )

}



export default ({ record, setFormTitle, parentRef, closeParent, parentReload, forInput = true }) => {
    const submitting = useSubmitting(false);
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();
    const { openNotification } = useContext(AppContext);
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "recicladolist", payload: { url: `${API_URL}/recicladolist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, sort: [{ column: "timestamp", direction: "DESC" }] } });

    const permission = usePermission({ name: "ordemfabrico", item: "list" });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: false, add: false } });
    const [allows, setAllows] = useState();

    const primaryKeys = ['id'];
    const columns = [
        //{ key: 'print', name: '',  minWidth: 45, width: 45, sortable: false, resizable: false, formatter:props=><Button size="small"><PrinterOutlined/></Button> },
        { key: 'lote', name: 'Lote', formatter: p => <Button type="link" size="small" onClick={() => navigate('/app/picking/pickreciclado', { state: { id: p.row.id } })}>{p.row.lote}</Button> },
        { key: 'estado', name: 'Estado', width: 80, formatter: p => <Status estado={p.row.estado} />, editor(p) { return p.row.status === 1 && <ModalEstadoChange p={p} submitting={submitting} dataAPI={dataAPI} /> }, editorOptions: { editOnClick: true } },
        { key: 'peso', name: 'Peso', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{p.row.peso} kg</div> },
        { key: 'tara', name: 'Tara', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{p.row.tara}</div> },
        { key: 'produto_granulado', name: 'Produto', minWidth: 150, width: 150 },
        { key: 'timestamp', name: 'Data', formatter: props => dayjs(props.row.timestamp).format(DATETIME_FORMAT) }
    ];

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "novolote": return <NewLoteContent loadParentData={modalParameters.loadParentData} parameters={modalParameters.parameters} />;
                case "syncreciclado": return <FormSyncRecicladoReport loadParentData={modalParameters.loadParentData} parameters={modalParameters.parameters} openNotification={openNotification} />
                //case "content": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal lazy={modalParameters?.lazy} responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    // const [showNewLoteModal, hideNewLoteModal] = useModal(({ in: open, onExited }) => {
    //     return <ResponsiveModal title="Novo Lote de Reciclado"
    //         onCancel={hideNewLoteModal}
    //         width={600} height={200} footer="ref" >
    //         <NewLoteContent />
    //     </ResponsiveModal>;
    // }, [dataAPI.getTimeStamp()]);

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        (setFormTitle) && setFormTitle({ title });
        const instantPermissions = await permission.loadInstantPermissions({ name: "reciclado", module: "main" });
        const allowSync = permission.isOk({ item: "edit", action: "sync-sage", instantPermissions });
        setAllows({ allowSync });
        submitting.end();
    }

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const vals = Object.fromEntries(Object.entries({ ...dataAPI.getAllFilter(), ...values }).filter(([_, v]) => v !== null && v !== ''));
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


    const onNovoLote = () => {
        setModalParameters({ content: "novolote", type: "drawer", lazy: true, push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Novo Lote de Reciclado</div>, loadParentData: loadData, parameters: {} });
        showModal();
    }

    const onSyncReciclado = () => {
        setModalParameters({ content: "syncreciclado", type: "drawer", lazy: true, push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Sincronizar Relatório de Produção (Reciclado)</div>, loadParentData: loadData, parameters: { data: {} } });
        showModal();
    }

    return (
        <>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            {/* {!setFormTitle && <TitleForm data={dataAPI.getAllFilter()} onChange={onFilterChange} />} */}
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
                leftToolbar={<Space>
                    <Button type='primary' icon={<AppstoreAddOutlined />} onClick={(onNovoLote)}>Novo Lote</Button>
                    {allows?.allowSync && <Button type='primary' icon={<SyncOutlined style={{}} />} onClick={(onSyncReciclado)}>Sincronizar Reciclado (ERP)</Button>}
                </Space>}
                //content={<PickHolder/>}
                //paginationPos='top'
                toolbarFilters={{ form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange, filters: <ToolbarFilters dataAPI={dataAPI} /> }}
            />
        </>
    );
}