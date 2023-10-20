import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH, BOBINE_ESTADOS, LOCALIZACOES } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys, excludeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Badge, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles, getFilters, getMoreFilters, getFiltersValues } from 'components/TableV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn, EstadoBobines, Largura, OF } from 'components/TableColumns';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace, FormPrint, printersList } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { produce } from 'immer';
import { useImmer } from "use-immer";
import useWebSocket from 'react-use-websocket';

const title = "Imprimir Etiqueta Buffer";
const TitleForm = ({ level, auth, hasEntries, onSave, loading }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, auth, num, v, columns, ...props }) => {
    return (<>
        {true && <>
            {getFilters({ columns: columns })}
            {/* <Col xs="content">
                <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
                </Field>
            </Col> */}
            {/*<Col xs="content">
                <Field name="fyear" shouldUpdate label={{ enabled: true, text: "Ano", pos: "top", padding: "0px" }}>
                    <DatePicker size="small" picker="year" format={"YYYY"} />
                </Field>
            </Col>
            <Col xs="content">
                <Field name="fquarter" label={{ enabled: true, text: "Quarter", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: 1, label: "Q1" }, { value: 2, label: "Q2" }, { value: 3, label: "Q3" }, { value: 4, label: "Q4" }]} allowClear style={{ width: "60px" }} />
                </Field>
            </Col> */}
        </>}
    </>
    );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFilters = ({ form, columns }) => [
    ...getMoreFilters({ columns }),
    // <Col xs="content">
    //     <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
    //         <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
    //     </Field>
    // </Col>
    /* { fgroup: { label: "Grupo", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcod: { label: "Artigo Cód.", field: { type: 'input', size: 'small' }, span: 8 }, fdes: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span: 16 } }, */
];

export const Quantity = ({ v, u }) => {
    const getUnit = () => {
        switch (u) {
            case "M2": return <span>m<sup>2</sup></span>;
            case "KG": return <span>kg</span>;
            case "UN": return <span>un</span>;
            case "M": return <span>m</span>;
            case "MM": return <span>mm</span>;
            default: return <span>{u}</span>;
        }
    }
    return (<div style={{ textAlign: "right" }}>{v} {getUnit()}</div>);
}

const printers = [...printersList?.BUFFER, ...printersList?.ARMAZEM, ...printersList?.PRODUCAO];

const ModeAutoPrint = ({}) => {
    const [lastNum, setLastNum] = useState(null);
    const [printed, setPrinted] = useState([]);
    const [valuesForm, setValuesForm] = useState({ impressora: printers[0]?.value })
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimegeneric`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        queryParams: { /* 'token': '123456' */ },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 500
    });

    const onPrint = (row) => {
        setModalParameters({ title: "Imprimir Etiqueta", row });
        showPrintModal();
    }

    const loadData = async ({ signal } = {}) => {
        const request = (async () => sendJsonMessage({ cmd: 'checkbufferin', value: {} }));
        request();
        return setInterval(request, 2000);
    }

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ signal: controller.signal });
        return (() => { controller.abort(); clearInterval(interval); });
    }, []);


    useEffect(() => {
        if (lastJsonMessage) {
            console.log(lastJsonMessage)
            if (lastNum === null) {
                if (lastJsonMessage?.rows && lastJsonMessage.rows.length > 0) {
                    setLastNum(lastJsonMessage.rows[0]["VCRNUM_0"]);
                } else {
                    setLastNum(0);
                }
            } else {
                if (lastJsonMessage?.rows && lastJsonMessage.rows.length > 0) {
                    if (lastNum !== lastJsonMessage.rows[0]["VCRNUM_0"]) {
                        print(lastJsonMessage.rows[0]);
                        setLastNum(lastJsonMessage.rows[0]["VCRNUM_0"]);
                    }
                }
            }
        }
    }, [lastJsonMessage?.hash]);

    const print = (record) => {
        (async () => {
             const response = await fetchPost({ url: `${API_URL}/print/sql/`, parameters: {  method: "PrintMPBufferEtiqueta", ...record, ...valuesForm } });
             if (response.data.status !== "error") {
                 setPrinted(prev => [...prev, { ...record, error: false }]);
             } else {
                 setPrinted(prev => [...prev, { ...record, error: false }]);
             }
         })();
    }

    const onChange = (t, v) => {
        if (v?.target) {
            setValuesForm(prev => ({ ...prev, [t]: v.target.value }));
        }
        else {
            setValuesForm(prev => ({ ...prev, [t]: v }));
        }
    }

    return (<Container fluid>
        <Row><Col style={{ fontWeight: 900, textAlign: "center", marginBottom: "5px" }}><SyncOutlined spin /> Impressão de entrada em Buffer/ARM, via PDA!</Col></Row>
        <Row>
            <Col style={{ textAlign: "center" }}><Select onChange={(v) => onChange("impressora", v)} defaultValue={valuesForm.impressora} style={{ width: "250px", textAlign: "left" }} options={printers} /></Col>
        </Row>
        <Row nogutter><Col style={{ paddingTop: '5px' }}>

            <YScroll style={{ height: "280px" }}>

                {printed.map((v, i) => {
                    return (
                        <Row key={`mp-${v.VCRNUM_0}-${i}`} nogutter style={{ borderBottom: "solid 1px #d9d9d9", paddingBottom: "2px" }}>
                            <Col xs="content" style={{ marginRight: "5px" }}><PrinterOutlined onClick={() => print(v)} style={{ fontSize: "16px", cursor: "pointer" }} /></Col>
                            <Col xs={2}><b>{v.ITMREF_0}</b></Col><Col xs={2}><b>{v.LOT_0}</b></Col><Col xs={5}>{v.ITMDES1_0}</Col><Col xs={2}>{v.QTYPCU_0} {v.PCU_0}</Col><Col xs="content">{v.error ? <Badge status="error" /> : <Badge status="success" />}</Col>
                        </Row>
                    )
                })}

            </YScroll>

        </Col></Row>
    </Container>);
}


export default ({ extraRef, closeSelf, loadParentData, noid = true, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "picking" });
    const [load, setLoad] = useState(false);

    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = { type: "-1" };
    const defaultParameters = { method: "ListMateriasPrimas" };
    const defaultSort = [{ column: `CREDATTIM_0`, direction: "DESC" }];
    const dataAPI = useDataAPI({ ...(!noid && { id: "stocklistbuffer" }), /* fnPostProcess: (dt) => postProcess(dt, submitting), */ payload: { url: `${API_URL}/materiasprimas/sql/`, primaryKey: "ROWID", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: { floc: "BUFFER" }, baseFilter: defaultFilters, sort: defaultSort } });

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "print": return <FormPrint {...modalParameters.parameters} printer={modalParameters.parameters?.printers && modalParameters.parameters?.printers[0]?.value} />;
                case "printpda": return <ModeAutoPrint {...modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            if (!load) {
                formFilter.setFieldsValue({ floc: "BUFFER" });
            }
            const { tstamp, ...paramsIn } = loadInit({}, {}, { ...props?.parameters }, { ...location?.state }, null);
            inputParameters.current = paramsIn;
            if (inputParameters.current?.id) {
                onSelectionChange({ data: inputParameters.current });
            } else {
                setLoad(true);
            }
        }
        submitting.end();
    }

    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onSelectionChange = (v) => {
        setModalParameters({
            width: "500px",
            height: "300px",
            content: "print", type: "modal", push: false/* , width: "90%" */, title: <div style={{ fontWeight: 900 }}>Imprimir Etiqueta<span style={{ marginLeft: "10px", fontWeight: 400 }}>{v.data?.LOT_0}</span></div>,
            parameters: {
                obs: true,
                url: `${API_URL}/print/sql/`, printers,
                onComplete: onDownloadComplete,
                parameters: {
                    method: "PrintMPBufferEtiqueta",
                    ...v.data
                }
            }
        });
        showModal();
    }

    const onModePrintPDA = () => {
        setModalParameters({
            content: "printpda", type: "drawer",width: "95%", push: false, parameters: {printers}
        });
        showModal();
    }

    const onDownloadComplete = async (response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, '_blank');
        //downloadFile(response.data,"etiqueta_nw.pdf");
    }

    //navigate("/app/artigos/mpbufferlist", { state: { ...dataAPI.getFilter(true), type: '-1', tstamp: Date.now() } });

    // const dataAPI = useDataAPI({ id: "mpbufflerlist", payload: { url: `${API_URL}/stocklistbuffer/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: {}, sort: [] } });
    // const primaryKeys = ['ROWID'];
    // const [modalParameters, setModalParameters] = useState({});
    // const defaultFilters = { type: "-1", loc: "BUFFER" };
    // const defaultSort = [{ column: 'CREDATTIM_0', direction: 'DESC' }];
    // const [showPrintModal, hidePrintModal] = useModal(({ in: open, onExited }) => (
    //     <ResponsiveModal title={modalParameters.title} footer="none" onCancel={hidePrintModal} width={500} height={280}><FormPrint v={{ ...modalParameters }} /></ResponsiveModal>
    // ), [modalParameters]);
    // const columns = [
    //     { key: 'print', frozen: true, name: '', cellClass: classes.noOutline, minWidth: 50, width: 50, sortable: false, resizable: false, formatter: p => <ColumnPrint record={p.row} dataAPI={dataAPI} onClick={() => onPrint(p.row)} /> },
    //     { key: 'LOT_0', name: 'Lote', width: 180, frozen: true },
    //     { key: 'ITMREF_0', name: 'Artigo Cód.', width: 180, frozen: true },
    //     { key: 'ITMDES1_0', name: 'Artigo' },
    //     { key: 'VCRNUM_0', name: 'Cód. Movimento' },
    //     { key: 'QTYPCU_0', name: 'Qtd.', width: 110, formatter: p => <Quantity v={p.row.QTYPCU_0} u={p.row.PCU_0} /> },
    //     { key: 'LOC_0', name: 'Localização', width: 110 },
    //     { key: 'CREDATTIM_0', name: 'Data', width: 130, formatter: props => dayjs(props.row.CREDATTIM_0).format(DATETIME_FORMAT) }
    // ];

    const columns = [
        ...(true) ? [{ name: 'LOT_0', header: 'Lote', filter: { show: "toolbar", op: "any", alias: "lote" }, userSelect: true, defaultLocked: true, defaultWidth: 180, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.LOT_0}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'ITMREF_0', header: 'Artigo Cód.', filter: { show: true, op: "any", alias: "itm" }, userSelect: true, defaultLocked: true, defaultWidth: 180, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.ITMREF_0}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'ITMDES1_0', header: 'Artigo Des.', filter: { show: "toolbar", op: "any" }, userSelect: true, defaultLocked: false, minWidth: 220, flex: 1, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{data?.ITMDES1_0}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'VCRNUM_0', header: 'Movimento', filter: { show: true, op: "any", alias: "vcr" }, userSelect: true, defaultLocked: false, defaultWidth: 180, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.VCRNUM_0}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'QTYPCU_0', header: 'Quantidade', filter: { show: true, type: "number", alias: "qty_lote" }, userSelect: true, defaultLocked: false, defaultWidth: 120, headerAlign: "center", render: ({ data, cellProps }) => <Quantity v={data.QTYPCU_0} u={data.PCU_0} /> }] : [],
        ...(true) ? [{ name: 'LOC_0', header: 'Localização', filter: { show: "toolbar", alias: "loc", type: "select", field: { style: { width: "80px" }, options: LOCALIZACOES } }, userSelect: true, defaultLocked: false, defaultWidth: 120, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{data?.LOC_0}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'CREDATTIM_0', header: 'Data', filter: { show: true, alias: "date", type: "rangedatetime", field: { style: { width: "90px" }, format: DATE_FORMAT } }, userSelect: true, defaultLocked: false, defaultWidth: 128, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.CREDATTIM_0} format={DATETIME_FORMAT} /> }] : []
    ];

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const vals = dataAPI.removeEmpty({ ...defaultFilters, ...values });
                const _values = {
                    ...vals,
                    ...getFiltersValues({ columns, values: vals, server: false })
                };
                console.log(_values)

                dataAPI.setBaseFilters({ ...defaultFilters });
                dataAPI.addFilters(dataAPI.removeEmpty({ ...excludeObjectKeys(_values, Object.keys(defaultFilters)) }));
                dataAPI.setSort(dataAPI.getSort(), defaultSort);
                dataAPI.addParameters({ ...defaultParameters });


                //formFilter.setFieldsValue({ fyear: dayjs().year(_year) });
                dataAPI.first();
                dataAPI.setAction("filter", true);
                dataAPI.update(true);
                break;
        }
    };

    const onFilter = (changedValues, values) => {
        if (typeof onFilterChange == 'function') {
            onFilterChange(changedValues, values);
        }

        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    return (
        <>
            {load &&
                <>
                    <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />
                    <Container fluid style={{ padding: "0px", margin: "0px" }}>
                        <Row>
                            <Col>
                                <Table
                                    responsiveToolbar={false}
                                    dirty={false}
                                    loading={submitting.state}
                                    idProperty={dataAPI.getPrimaryKey()}
                                    local={false}
                                    onRefresh={loadData}
                                    cellNavigation={false}
                                    rowHeight={30}
                                    rowSelect={true}
                                    onSelectionChange={onSelectionChange}
                                    enableSelection={true}
                                    checkboxColumn={false}
                                    // rowClassName={rowClassName}
                                    //groups={groups}
                                    sortable
                                    reorderColumns={false}
                                    showColumnMenuTool
                                    loadOnInit={true}
                                    //editStartEvent={"click"}
                                    pagination="remote"
                                    defaultLimit={20}
                                    columns={columns}
                                    dataAPI={dataAPI}
                                    moreFilters={true}
                                    // onCellAction={onCellAction}
                                    toolbarFilters={{
                                        form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilter,
                                        filters: <ToolbarFilters dataAPI={dataAPI} auth={permission.auth} v={formFilter.getFieldsValue(true)} columns={columns} />,
                                        moreFilters: { filters: moreFilters }
                                    }}
                                    editable={{
                                        enabled: false,
                                        add: false
                                    }}
                                    leftToolbar={<Space>
                                        <Button type="primary" onClick={onModePrintPDA}>Impressão via PDA</Button>
                                    </Space>}
                                />
                            </Col >
                        </Row >
                    </Container >
                </>
            }
        </>
    )

}