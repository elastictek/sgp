import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import moment from 'moment';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
//import { WrapperForm, TitleForm, FormLayout, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select } from "antd";
const { Title } = Typography;
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import { Field, Container } from 'components/FormFields';
import { Row, Col } from 'react-grid-system';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';

const title = "Registo de Granulado";

const schema = (keys, excludeKeys) => {
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


const Blinker = styled.div`
    animation: blinker 1s linear infinite;
    font-weight:700;
    font-size:22px;
    margin-right:3px;
    font-family:'Times New Roman', serif;
    @keyframes blinker {
        50% { opacity: 0; }
    }
`;

const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    }
});

const PickContent = ({ lastValue, setLastValue, onChange, parentRef, closeParent }) => {
    const value = useRef('');
    const pick = useRef(true);
    const [current, setCurrent] = useState('');
    const [status, setStatus] = useState(true);
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/lotespick`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000
    });

    useEffect(() => {
        if (lastJsonMessage !== null) {
            setLastValue({ picked: true, row: { id: uuIdInt(0).uuid(), timestamp: Date(), notValid: 1, ...lastJsonMessage.row }, error: lastJsonMessage.error });
        }
    }, [lastJsonMessage]);

    const onPick = () => {
        //v = v.startsWith("000026") ? v.replace("000026", "").split(";") : v.split(";");
        if (value.current !== '') {
            const isElasticBand = value.current.match(/^\d{4}\d{2}\d{2}-\d{2}-\d{2}$/g);
            sendJsonMessage({ cmd: 'getlotequantity', lote: value.current, type: isElasticBand ? "elasticband" : "nw", unit: isElasticBand ? "m" : "m" });
            value.current = '';
            setCurrent(value.current);
        }
    }

    const keydownHandler = async (e, obj) => {
        if (e.srcElement.name === "qtd" || e.srcElement.name === "unit" || !pick.current) {
            return;
        }
        e.preventDefault();
        const keyCode = (e === null) ? obj.keyCode : e.keyCode;
        if (keyCode == 9 || keyCode == 13) {
            onPick();
        } else if ((keyCode >= 48 && keyCode <= 90) || keyCode == 186 || keyCode == 188 || keyCode == 110 || keyCode == 190 || keyCode == 189) {
            value.current = `${value.current}${e.key}`;
            setCurrent(value.current);
        } else if (keyCode == 16) {

        } else if (keyCode === 8) {
            value.current = value.current.slice(0, -1);
            setCurrent(value.current);
        }
        else {
            value.current = '';
            //setLastValue('');
        }
    };

    const focusIn = (e, src = null) => {
        if (e?.srcElement?.className === "ant-input-number-input" || e?.srcElement?.className === "ant-select-selection-search-input") {
            setStatus(false);
            pick.current = false;
        } else {
            setStatus(true);
            pick.current = true;
        }
    }
    const focusOut = (e, src) => {
        if (e?.srcElement?.className !== "ant-input-number-input" && e?.srcElement?.className !== "ant-select-selection-search-input") {
            setStatus(false);
            pick.current = false;
        }
    }
    const paste = async (e) => {
        value.current = await navigator.clipboard.readText();
        setCurrent(value.current);
    }

    useEffect(() => {
        document.body.addEventListener('keydown', keydownHandler);
        document.body.addEventListener('focusout', focusOut);
        document.body.addEventListener('focusin', focusIn);
        //window.addEventListener('paste', paste);
        return () => {
            document.body.removeEventListener('keydown', keydownHandler);
            document.body.removeEventListener('focusout', focusOut);
            document.body.removeEventListener('focusin', focusIn);
            //window.removeEventListener('paste', paste);
        };
    }, []);
    return (<><Container id="pick-container">
        {lastValue.row?.lote && <>
            <Row style={lastValue.error === null ? { border: "solid 1px #b7eb8f", background: "#f6ffed", padding: "5px" } : { border: "solid 1px #ffccc7", background: "#fff2f0", padding: "5px" }}>
                <Col>
                    <Row align='center' gutterWidth={5}>
                        <Col>{lastValue.error === null ? "Último lote registado:" : lastValue.error}</Col>
                        <Col style={{ maxWidth: "95px", width: "95px" }}>Quantidade</Col>
                        <Col style={{ maxWidth: "100px", width: "100px" }}>Unidade Medida</Col>
                    </Row>
                    <Row gutterWidth={5} align='center'>
                        <Col style={{ fontSize: "14px", fontWeight: 700 }}>{lastValue.row.lote}</Col>
                        <Col style={{ maxWidth: "95px", width: "95px" }}><InputNumber value={lastValue.row?.qtd} width={100} name='qtd' size="large" min={0} onFocus={(e) => focusIn(e, "input")} onBlur={(e) => focusOut(e, "input")} onChange={(v) => onChange(v, 'qtd')} /></Col>
                        <Col style={{ maxWidth: "100px", width: "100px" }}><Select optionLabelProp="label" defaultValue="kg" style={{ width: "60px" }} value={lastValue.row?.unit} name='unit' size="large" options={[{ value: "m", label: "m" }, { value: "kg", label: "kg" }, { value: "m2", label: <div>m&sup2;</div> }]} onChange={(v) => onChange(v, 'unit')} onFocus={(e) => focusIn(e, "select")} onBlur={(e) => focusOut(e, "select")} /></Col>
                    </Row>
                </Col>
            </Row>
        </>}
        <Row align='center' gutterWidth={5}><Col>
            <Row align='center' gutterWidth={5} style={{ border: status ? "solid 2px #1890ff" : "solid 2px #f0f0f0", height: "50px", margin: "10px 0px" }}>
                {status && <Col xs="content"><Blinker>|</Blinker></Col>}
                <Col style={{ fontSize: "22px", fontWeight: 700 }}>{value.current}</Col>
            </Row>
        </Col>
            <Col xs='content'><Button icon={<SnippetsOutlined />} onClick={paste} title="Colar" /></Col>
        </Row>
    </Container>
        {parentRef && <Portal elId={parentRef.current}>
            <Space>
                <Button disabled={current === ''} type="primary" onClick={onPick}>Registar</Button>
                <Button onClick={closeParent}>Cancelar</Button>
            </Space>
        </Portal>
        }
    </>);
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, forInput = true }) => {
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/paletesstocklookup/`, parameters: {}, pagination: { enabled: false, limit: 200 }, filter: { item_id: 5 }, sort: [] } });
    const [selectedRows, setSelectedRows] = useState(() => new Set());
    const [newRows, setNewRows] = useState([]);
    const primaryKeys = ['id'];
    const columns = [
        //{ key: 'print', name: '',  minWidth: 45, width: 45, sortable: false, resizable: false, formatter:props=><Button size="small"><PrinterOutlined/></Button> },
        { key: 'lote', name: 'Lote', formatter: p => <b>{p.row.lote}</b> },
        { key: 'source', name: 'Origem', formatter: p => p.row.source === 'elasticband' ? "ELASTIC BAND" : "NONWOVEN" },
        { key: 'qtd', name: 'Quantidade', cellClass: classes.noOutline, minWidth: 95, width: 95, editor: p => <InputNumber size="small" value={p.row.qtd} ref={(el, h,) => { el?.focus(); }} onChange={(e) => p.onRowChange({ ...p.row, qtd: e }, false)} /> },
        { key: 'unit', name: 'Unidade', cellClass: classes.noOutline, minWidth: 95, width: 95, editor: p => <Select optionLabelProp="label" defaultValue="kg" style={{ width: "100%" }} value={p.row.unit} ref={(el, h,) => { el?.focus(); }} onChange={(v) => p.onRowChange({ ...p.row, unit: v }, false)} name='unit' size="small" options={[{ value: "m", label: "m" }, { value: "kg", label: "kg" }, { value: "m2", label: <div>m&sup2;</div> }]} /> },
        { key: 'timestamp', name: 'Data', formatter: props => moment(props.row.timestamp).format(DATETIME_FORMAT) },
        { key: 'delete', name: '', cellClass: classes.noOutline, minWidth: 45, width: 45, sortable: false, resizable: false, formatter: props => <Button size="small" onClick={() => onDelete(props.row, props)}><DeleteOutlined style={{ color: "#cf1322" }} /></Button> }
    ];
    const [showPickingModal, hidePickingModal] = useModal(({ in: open, onExited }) => {
        const [lastValue, setLastValue] = useState({ picked: false, row: {}, error: null });
        const [dirty, setDirty] = useState(false);
        useEffect(() => {
            if (lastValue.picked && lastValue.error === null) {
                const idx = dataAPI.getData().rows ? dataAPI.getData().rows.findIndex(x => x.lote === lastValue.row.lote) : -1;
                if (idx === -1) {
                    dataAPI.addRow({ ...lastValue.row }, primaryKeys, 0);
                    setLastValue(prev => ({ ...prev, picked: false }));
                } else {
                    setLastValue(prev => ({ ...prev, error: "O Lote já foi registado!", picked: false }));
                }
            } else {
                setLastValue(prev => ({ ...prev, picked: false }));
            }
        }, [lastValue.picked]);
        const onChange = (v, f) => {
            const rows = dataAPI.getData().rows;
            const idx = rows.findIndex(x => x.lote === lastValue.row.lote);
            if (idx > -1) {
                rows[idx][f] = v;
                dataAPI.setRows([...rows], rows.length);
                setLastValue(prev => ({ ...prev, row: { ...prev?.row, [f]: v } }));
            }

        }
        return <ResponsiveModal title={<div style={{ display: "flex", flexDirection: "row" }}><div><SyncOutlined spin /></div><div style={{ marginLeft: "5px" }}>Registo de Lotes em Curso...</div></div>}
            onCancel={hidePickingModal}
            onOk={() => onPickFinish(lastValue)}
            width={600} height={200} footer="ref">

            <PickContent lastValue={lastValue} setLastValue={setLastValue} onFinish={onPickFinish} onChange={onChange} />
        </ResponsiveModal>;
    }, [dataAPI.getTimeStamp()]);

    useEffect(() => {
        (setFormTitle) && setFormTitle({ title });
    }, []);

    const onPickFinish = (values) => { console.log("picking", values) };

    const onDelete = (row, props) => {
        if (row?.notValid === 1) {
            //remove locally
            Modal.confirm({ title: <div>Remover a entrada do Lote: <span style={{ color: "#cf1322", fontSize: "18px" }}>{row.lote}</span> ?</div>, onOk: () => dataAPI.deleteRow({ id: row.id }, primaryKeys) });
        }
        else {
            //remove from DB
        }
    };

    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };

    return (
        <>
            {!setFormTitle && <div style={{paddingLeft:"10px"}}>
                <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>
                <div style={{display:"flex",flexDirection:"row", marginBottom: "2px", marginTop:"4px" }}><Title style={{ marginBottom: "2px", marginTop:"4px" }} level={5}>G-202220811-01</Title><Button style={{ marginLeft: "5px", background:"green", color:"#fff" }} icon={<CheckOutlined />}>Fechar Lote de Granulado</Button></div>
            </div>}
            <Table
                //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
                reportTitle={title}
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                //actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                toolbar={true}
                search={true}
                moreFilters={false}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                rowClass={(row) => (row?.notValid === 1 ? classes.notValid : undefined)}
                //selectedRows={selectedRows}
                //onSelectedRowsChange={setSelectedRows}
                leftToolbar={<>
                    <Button type='primary' icon={<AppstoreAddOutlined />} onClick={showPickingModal}>Picar Lotes</Button>
                    {(dataAPI.hasData() && dataAPI.getData().rows.filter(v => v?.notValid === 1).length > 0) && <Button style={{ marginLeft: "5px" }} icon={<CheckOutlined />}>Guardar Registos</Button>}
                </>}
                //content={<PickHolder/>}
                //paginationPos='top'
                toolbarFilters={{ form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange, filters: <ToolbarFilters dataAPI={dataAPI} /> }}
            />
        </>
    );
}