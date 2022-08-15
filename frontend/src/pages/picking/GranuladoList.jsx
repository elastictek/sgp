import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import moment from 'moment';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { useNavigate, useLocation } from "react-router-dom";
//import { WrapperForm, TitleForm, FormLayout, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';

const title = "Granulado Lotes";

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}
const schemaNewLote = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const ActionContent = ({ dataAPI, hide, onClick, ...props }) => {
    const items = [
        { label: 'Eliminar Entrada', key: 'delete', icon: <DeleteOutlined /> }
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'><Field wrapFormItem={true} name="lote" label={{ enabled: true, text: "Lote" }}><Input width={250} size="small" /></Field></Col>
        <Col xs='content'><Field wrapFormItem={true} name="source" label={{ enabled: true, text: "Origem" }}><Input width={100} size="small" /></Field></Col>
        <Col xs='content'><Field wrapFormItem={true} name="timestamp" label={{ enabled: true, text: "Data" }}><Input width={150} size="small" /></Field></Col>
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
        console.log(values, { peso: 0, tara: 15, produto_granulado: values.produto });
        try {
            const response = await fetchPost({ url: `${API_URL}/newlotegranulado/`, parameters: { peso: 0, tara: '15 kg', estado: 'ND', produto_granulado_id: values.produto } });
            if (response.data.status !== "error") {
                navigate('/app/picking/pickgranulado', { state: { id: response.data.id[0] } });
            } else {
                status.error.push({ message: response.data.title });
                setFormStatus({ ...status });
            }
        } catch (e) {
            status.error.push({ message: e.message });
            setFormStatus({ ...status });
        } finally {
            submitting.end();
        }

        //navigate('/app/picking/pickgranulado', { state: {} });
        //console.log("entreiiiiiiii")
        //const v = validateForm(schemaWeigh());
        //await v.validate(values);
        //console.log("XXXXXXXXXXXXXXXXXXXXXXXXX",v.fieldStatus(),v.fieldMessages());
        //setFieldStatus(v.fieldStatus());
        //const v = schemaWeigh().validate(values, { abortEarly: false });
        //console.log("FINISH", v.error.details);
    }

    const onValuesChange = (values, changedValues) => {

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

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, forInput = true }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/granuladolist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, sort: [{ column: "timestamp", direction: "DESC" }] } });
    const [selectedRows, setSelectedRows] = useState(() => new Set());
    const [newRows, setNewRows] = useState([]);
    const primaryKeys = ['id'];
    const columns = [
        //{ key: 'print', name: '',  minWidth: 45, width: 45, sortable: false, resizable: false, formatter:props=><Button size="small"><PrinterOutlined/></Button> },
        { key: 'lote', name: 'Lote', formatter: p => <b>{p.row.lote}</b> },
        { key: 'estado', name: 'Estado' },
        { key: 'peso', name: 'Peso', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{p.row.peso} kg</div> },
        { key: 'tara', name: 'Tara', minWidth: 95, width: 95, formatter: p => <div style={{ textAlign: "right" }}>{p.row.tara}</div> },
        { key: 'produto_granulado', name: 'Produto', minWidth: 95, width: 95 },
        { key: 'timestamp', name: 'Data', formatter: props => moment(props.row.timestamp).format(DATETIME_FORMAT) }
        //{ key: 'delete', name: '', cellClass: classes.noOutline, minWidth: 45, width: 45, sortable: false, resizable: false, formatter: props => <Button size="small" onClick={() => onDelete(props.row, props)}><DeleteOutlined style={{ color: "#cf1322" }} /></Button> }
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

    /*  const onDelete = (row, props) => {
         if (row?.notValid === 1) {
             //remove locally
             Modal.confirm({ title: <div>Remover a entrada do Lote: <span style={{ color: "#cf1322", fontSize: "18px" }}>{row.lote}</span> ?</div>, onOk: () => dataAPI.deleteRow({ id: row.id }, primaryKeys) });
         }
         else {
             //remove from DB
         }
     }; */
    /*     const onSave = () => {
            console.log(dataAPI.getData().rows)
        } */

    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };


    return (
        <>
            {!setFormTitle && <div style={{ paddingLeft: "10px" }}><Title style={{ marginBottom: "0px" }} level={4}>{title}</Title></div>}
            <Table
                //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
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