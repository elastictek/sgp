import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn } from 'components/TableColumns';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';

const title = "Entrada de Granulado em Linha";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, showHistory }) => {
    return (<ToolbarTitle id={auth?.user} description={title} showHistory={showHistory}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

export const loadQuantity = async ({ value, artigo_cod }, signal) => {
    const { data: { row } } = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: { value, artigo_cod }, sort: [], parameters: { method: "GetGranuladoLoteQuantityV2" }, signal });
    if (row && Object.keys(row).length > 0) {
        return row;
    }
    return null;
}

export const loadFormulation = async ({ }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: {}, sort: [], parameters: { method: "GetGranuladoInLine" /* "GetCurrentFormulation" */ }, signal });
    if (rows && Object.keys(rows).length > 0) {
        const _rows = groupByMateriaPrima(rows.filter(v => v.arranque !== null));
        //const _rows = groupByMateriaPrima(json(json(rows[0])?.formulacao)?.items);
        return _rows;
    }
    return null;
}

const groupByMateriaPrima = (items) => {
    const grouped = {};

    items.forEach(item => {
        const { artigo_cod, artigo_des, dosers, cuba, n_lote, arranque } = item;

        const key = `${artigo_cod}_${cuba}`;

        if (!grouped[key]) {
            grouped[key] = {
                cuba,
                dosers: [dosers],
                artigo_cod,
                artigo_des,
                n_lote,
                arranque
            };
        } else {
            grouped[key].dosers.push(dosers);
        }
    });

    const result = Object.keys(grouped).map(key => grouped[key]);
    return result;
}

const steps = [
    {
        title: 'Seleção'
    },
    {
        title: 'Registo'
    },
];

const ListItem = styled(List.Item)`
    cursor: pointer;
    padding: 10px;
    transition: background-color 0.3s ease; /* Add a smooth transition effect */
    border-radius: 3px;
    &:hover {
    background-color: #bae7ff; /* Background color on hover */
    }
`;

const FormulacaoList = ({ openNotification, next, ...props }) => {
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};

    const [items, setItems] = useState();

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, null, null);
            inputParameters.current = { ...paramsIn };
        }
        const _items = await loadFormulation({}, signal);
        setItems(_items);
        submitting.end();
    }

    return (<YScroll>

        <List
            size="small"
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item, index) => (
                <ListItem onClick={() => next(item)} style={{ ...(item?.arranque && !item?.n_lote) && { backgroundColor: "rgb(245,34,45,0.45)" } }}>
                    <List.Item.Meta
                        avatar={<div style={{ width: "70px", maxWidth: "80px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Cuba style={{ fontSize: "12px"/* , lineHeight: 1.2 */ }} value={item.cuba} />
                            <div style={{ fontWeight: 700 }}>{item?.dosers?.join(",")}</div>
                        </div>}
                        title={item.artigo_des}
                        description={<div><span>{item.arranque}%</span><span style={{ marginLeft: "10px" }}>{item.artigo_cod}</span></div>}
                    />
                </ListItem>
            )}
        />

    </YScroll>);
}

export default ({ extraRef, closeSelf, loadParentData, showHistory = true, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ payload: { primaryKey: "vcr_num", parameters: { ...defaultParameters }, pagination: { enabled: false }, filter: { ...defaultFilters }, sort: [...defaultSort] } });
    const permission = usePermission({ name: "controlpanel" });
    const [step, setStep] = useState(0);
    const [pos, setPos] = useState(null);
    const [value, setValue] = useState(null);
    const inputOk = useRef(false);
    const inputRef = useRef();

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
        }

        submitting.end();
    }

    const onInputOk = async (v) => {
        const _value = (v) ? v.target.value : value;
        inputOk.current = true;
        inputRef.current.focus({ cursor: 'all' });
        await addLineEntry(_value);
    }

    const addLineEntry = async (v) => {
        try {
            if (pos && v && inputOk.current) {
                submitting.trigger();
                let _values = (v.startsWith("000026") ? v.replace("000026", "") : v.startsWith("\\000026") ? v.replace("\\000026", "") : v).split(";");
                let _value = _values.length > 4 ? _values[4] : v; //vcrnum_0
                const _row = await loadQuantity({ value: _value, artigo_cod: pos.artigo_cod });
                if (_row) {
                    const _obs = (_values.length > 5) ? _values[5] === 'null' ? null : _values[5] : null;
                    dataAPI.setData({ rows: [{ ..._row, group_id: pos.cuba, obs: _obs, rowadded: 1, rowvalid: 0 }], total: 1 })
                } else {
                    if (_values.length >= 4) {
                        openNotification("error", 'top', "Notificação", <div>O lote <b>{_values[1]}</b> não pode dar entrada em linha!</div>);
                    } else {
                        openNotification("error", 'top', "Notificação", <div>O movimento <b>{_value}</b> não pode dar entrada em linha!</div>);
                    }
                }
                console.log("add value entry", v, _row);
                clearInput();
                submitting.end();
            }
        }
        catch (e) {
            submitting.end();
            openNotification("error", 'top', "Notificação", e.message, null);
        }
    }

    const clearInput = () => {
        setValue(null);
        inputOk.current = false;
    }

    const onInputChange = (v) => {
        setValue(v.target.value);
    }

    const onDelete = (data, rowIndex) => {
        dataAPI.deleteRow({ [dataAPI.getPrimaryKey()]: data?.[dataAPI.getPrimaryKey()] }, [dataAPI.getPrimaryKey()]);
    }

    const hasEntries = () => {
        return (dataAPI.hasData() && dataAPI.getData().rows.length > 0);
    }

    const onSave = async () => {
        let response = null;
        try {
            response = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: {}, parameters: { method: "AddGranuladoToLine", row: dataAPI.getData().rows[0] } });
            if (response.data.status !== "error") {
                openNotification(response.data.status, 'top', "Notificação", response.data.title);
                prev();
            } else {
                openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
            }
        }
        catch (e) {
            console.log(e)
            openNotification("error", 'top', "Notificação", e.message, null);
        }
    }

    const next = (item) => {
        setPos(item);
        setStep(step + 1);
        const timeout = setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus({ cursor: "all" });
            }
        }, 500);
    };

    const prev = () => {
        dataAPI.clearData();
        setPos(null);
        setStep(step - 1);
    };

    const onStepChange = (value) => {
        if (value == 0 && step == 1) {
            prev();
        }
    }

    const columns = [
        ...(true) ? [{ name: 'bdelete', header: '', headerAlign: "center", userSelect: true, defaultLocked: false, width: 45, render: ({ data, rowIndex }) => <Button ghost onClick={() => onDelete(data, rowIndex)} icon={<DeleteTwoTone twoToneColor="#f5222d" />} /> }] : [],
        //...(true) ? [{ name: 'pos', header: '', userSelect: true, defaultLocked: false, defaultWidth: 50, headerAlign: "center", render: ({ cellProps, data }) => <PosColumn value={data.pos} cellProps={cellProps} /> }] : [],
        ...(true) ? [{ name: 'vcr_num', header: 'Movimento', userSelect: true, defaultLocked: false, defaultWidth: 150, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.vcr_num}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'artigo_cod', header: 'Artigo Cod.', userSelect: true, defaultLocked: false, defaultWidth: 150, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{data?.artigo_cod}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'artigo_des', header: 'Designação', userSelect: true, defaultLocked: false, headerAlign: "center", flex: 1, render: ({ data, cellProps }) => <LeftAlign style={{}}>{data?.artigo_des}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'n_lote', header: 'Lote', userSelect: true, defaultLocked: false, defaultWidth: 180, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: 700 }}>{data?.n_lote}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'qty_lote', header: 'Qtd.', userSelect: true, defaultLocked: false, defaultWidth: 100, headerAlign: "center", render: ({ data, cellProps }) => <RightAlign unit={data?.unit} style={{}}>{data?.qty_lote}</RightAlign> }] : [],
    ];

    return (
        <>
            <TitleForm auth={permission.auth} level={location?.state?.level} hasEntries={hasEntries} onSave={onSave} loading={submitting.state} showHistory={showHistory} />
            <Container>
                <Row>
                    <Col>
                        <Steps type='inline' current={step} items={steps} direction="horizontal" onChange={onStepChange} style={{ flexDirection: "row" }} />
                        <Container fluid style={{ lineHeight: "60px", borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                            <Row>
                                {step == 0 && <Col><div><FormulacaoList openNotification={openNotification} next={next} /></div></Col>}
                                {step == 1 && <Col>
                                    <Row>
                                        <Col>
                                            <List
                                                size="small"
                                                itemLayout="horizontal"
                                                dataSource={[pos]}
                                                renderItem={(item, index) => (
                                                    <List.Item
                                                        actions={[hasEntries() && <Button disabled={submitting.state} size="large" type="primary" onClick={onSave} icon={<CheckOutlined />}>Submeter</Button>]}
                                                    >
                                                        <List.Item.Meta
                                                            avatar={<div style={{ width: "70px", maxWidth: "80px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                <Cuba style={{ fontSize: "12px"/* , lineHeight: 1.2 */ }} value={item.cuba} />
                                                                <div style={{ fontWeight: 700 }}>{item?.dosers?.join(",")}</div>
                                                            </div>}
                                                            title={item.artigo_des}
                                                            description={item.artigo_cod}
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                        </Col>
                                    </Row>
                                    <Row style={{ marginTop: "10px" }}>
                                        <Col style={{ display: "flex" }}>
                                            <Input size='large' disabled={submitting.state} onPressEnter={onInputOk} onChange={onInputChange} value={value} ref={inputRef} suffix={value && <Button type='link' size="small" disabled={submitting.state} icon={<CheckOutlined />} onClick={() => onInputOk()} />} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Table
                                                cellNavigation={false}
                                                offsetHeight={"250px"}
                                                dirty={false}
                                                loading={submitting.state}
                                                idProperty={dataAPI.getPrimaryKey()}
                                                local={true}
                                                settings={false}
                                                sortable={false}
                                                reorderColumns={false}
                                                showColumnMenuTool={false}
                                                loadOnInit={false}
                                                pagination={false}
                                                defaultLimit={20}
                                                columns={columns}
                                                dataAPI={dataAPI}
                                                moreFilters={false}
                                                toolbar={false}
                                            />
                                        </Col>
                                    </Row>
                                </Col>}
                            </Row>
                        </Container>
                    </Col >
                </Row >
            </Container >
        </>
    )

}