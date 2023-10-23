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
import { produce } from 'immer';
import { useImmer } from "use-immer";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps } from "antd";
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
import AggChoose, { TitleAgg, ContentAgg } from './AggChoose';

const title = "Entrada de Nonwovens em Linha";
const TitleForm = ({ level, auth, loading, showHistory }) => {
    return (<ToolbarTitle id={auth?.user} description={title} showHistory={showHistory}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

export const loadQuantity = async ({ value }, signal) => {
    const { data: { row } } = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: { value }, sort: [], parameters: { method: "GetNWLoteQuantity" }, signal });
    if (row && Object.keys(row).length > 0) {
        return row;
    }
    return null;
}

const steps = [
    {
        title: 'Ordens'
    },
    {
        title: 'Entrada'
    },
];

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
    const permission = usePermission({ name: "picking" });
    const [pos, setPos] = useState(null);
    const [value, setValue] = useState(null);
    const inputOk = useRef(false);
    const inputRef = useRef();

    const [state, updateState] = useImmer({
        action: null,
        maxStep: null,
        step: 1,
        item: null,
    });

    useEffect(() => {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus({ cursor: 'all' });
            }
        }, 500);
        loadData({ signal: controller.signal, init: true });

        return (() => { controller.abort(); clearTimeout(timeout) });
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
        }
        submitting.end();
    }

    const onPosSelect = async (v) => {
        setPos(v);
        if (value) {
            inputOk.current = true;
        }
        inputRef.current.focus({ cursor: 'all' });
        await addLineEntry(v, value);
    }

    const onInputOk = async (v) => {
        const _value = (v) ? v.target.value : value;
        inputOk.current = true;
        inputRef.current.focus({ cursor: 'all' });
        await addLineEntry(pos, _value);
    }

    const addLineEntry = async (p, v) => {
        try {
            if (p && v && inputOk.current) {
                submitting.trigger();
                let _values = (v.startsWith("000026") ? v.replace("000026", "") : v.startsWith("\\000026") ? v.replace("\\000026", "") : v).split(";");
                let _value = _values.length > 4 ? _values[4] : v; //vcrnum_0
                const _row = await loadQuantity({ value: _value });
                if (_row) {
                    const _obs = (_values.length > 5) ? _values[5] === 'null' ? null : _values[5] : null;
                    const exists = dataAPI.hasData() ? dataAPI.getData()?.rows.some(obj => obj.vcr_num === _row?.vcr_num) : false;
                    if (!exists) {
                        dataAPI.addRow({ ..._row, pos: (p === "INF") ? 0 : 1, obs: _obs });
                    }
                } else {
                    if (_values.length >= 4) {
                        openNotification("error", 'top', "Notificação", <div>O lote <b>{_values[1]}</b> não pode dar entrada em linha!</div>);
                    } else {
                        openNotification("error", 'top', "Notificação", <div>O movimento <b>{_value}</b> não pode dar entrada em linha!</div>);
                    }
                }
                console.log("add value entry", p, v, _row);
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
        setPos(null);
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
            response = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: {}, parameters: { method: "AddNWToLine", cs_id: state.item.items[0].cs_id, rows: dataAPI.getData().rows } });
            if (response.data.status !== "error") {
                openNotification(response.data.status, 'top', "Notificação", response.data.title);
                navigate("/app/picking/main/");
            } else {
                openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
            }
        }
        catch (e) {
            console.log(e)
            openNotification("error", 'top', "Notificação", e.message, null);
        }
        //AddNWToLine
    }

    const columns = [
        ...(true) ? [{ name: 'bdelete', header: '', headerAlign: "center", userSelect: true, defaultLocked: false, width: 45, render: ({ data, rowIndex }) => <Button ghost onClick={() => onDelete(data, rowIndex)} icon={<DeleteTwoTone twoToneColor="#f5222d" />} /> }] : [],
        ...(true) ? [{ name: 'pos', header: '', userSelect: true, defaultLocked: false, defaultWidth: 50, headerAlign: "center", render: ({ cellProps, data }) => <PosColumn value={data.pos} cellProps={cellProps} /> }] : [],
        ...(true) ? [{ name: 'vcr_num', header: 'Movimento', userSelect: true, defaultLocked: false, defaultWidth: 150, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.vcr_num}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'artigo_cod', header: 'Artigo Cod.', userSelect: true, defaultLocked: false, defaultWidth: 150, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{data?.artigo_cod}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'artigo_des', header: 'Designação', userSelect: true, defaultLocked: false, headerAlign: "center", flex: 1, render: ({ data, cellProps }) => <LeftAlign style={{}}>{data?.artigo_des}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'n_lote', header: 'Lote', userSelect: true, defaultLocked: false, defaultWidth: 180, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: 700 }}>{data?.n_lote}</LeftAlign> }] : [],
        ...(true) ? [{ name: 'qty_lote', header: 'Qtd.', userSelect: true, defaultLocked: false, defaultWidth: 100, headerAlign: "center", render: ({ data, cellProps }) => <RightAlign unit={data?.unit} style={{}}>{data?.qty_lote}</RightAlign> }] : [],
    ];

    const next = (item) => {
        updateState(draft => {
            if (state.step === 0) {
                draft.item = item;
            }
            draft.step = state.step + 1;
            draft.maxStep = (draft.step > draft.maxStep) ? draft.step : draft.maxStep;
        });
    };

    const prev = (v = null) => {
        updateState(draft => {
            draft.item = null;
            draft.step = (v !== null) ? v : draft.step - 1;
        });
    };

    const onStepChange = (value) => {
        //if (value == 0) {
        //    prev(0);
        //}
        prev(value);
    }


    const onSelectOrdem = (item, index, load, allowInit) => {
        next(item);
    }

    return (
        <ConfigProvider
            theme={{
                components: {
                    Segmented: {
                        itemSelectedBg: "#1890ff"
                    },
                },
            }}
        >
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} showHistory={showHistory} />

            <Container>
                <Row>
                    <Col>

                        <Steps type='inline' current={state.step} items={steps} direction="horizontal" onChange={onStepChange} style={{ flexDirection: "row", color: "#000" }} />
                        <Container fluid style={{ lineHeight: "60px", borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>

                            {state.step == 0 && <Col><AggChoose openNotification={openNotification} onClick={onSelectOrdem} /></Col>}

                            {state.step == 1 && <>
                                {state.item && <Row style={{}}>
                                    <Col style={{lineHeight:1.8}}>
                                        <TitleAgg item={state.item} />
                                        <ContentAgg item={state.item} />
                                    </Col>
                                </Row>
                                }
                                <Row style={{ marginTop: "2px" }}>
                                    <Col></Col>
                                    <Col style={{ textAlign: "center" }}>

                                        <Segmented
                                            defaultChecked={false}
                                            value={pos}
                                            onChange={onPosSelect}
                                            options={[
                                                {
                                                    label: (
                                                        <div style={{ padding: 4 }}>
                                                            <Avatar style={{ /* backgroundColor: '#87d068' */ }} icon={<CaretDownOutlined />} />
                                                            <div>Inferior</div>
                                                        </div>
                                                    ),
                                                    value: 'INF'
                                                },
                                                {
                                                    label: (
                                                        <div style={{ padding: 4 }}>
                                                            <Avatar style={{ /* backgroundColor: '#87d068' */ }} icon={<CaretUpOutlined />} />
                                                            <div>Superior</div>
                                                        </div>
                                                    ),
                                                    value: 'SUP'
                                                }
                                            ]}
                                        /></Col>
                                    <Col style={{ display: "flex", alignSelf: "center", justifyContent: "right" }}>{hasEntries() && <Button disabled={submitting.state} size="large" type="primary" onClick={onSave} icon={<CheckOutlined />}>Submeter</Button>}</Col>
                                </Row>
                                <Row style={{ marginTop: "10px" }}>
                                    <Col style={{ display: "flex" }}>
                                        <Input size='large' disabled={submitting.state} onPressEnter={onInputOk} onChange={onInputChange} value={value} ref={inputRef} suffix={value && <Button type='link' size="small" disabled={submitting.state} icon={<CheckOutlined />} onClick={() => onInputOk()} />} />
                                        {/*                         <Button size="large" disabled={submitting.state} icon={<CheckOutlined />} onClick={() => onInputOk()} /> */}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Table
                                            cellNavigation={false}
                                            style={{ minHeight: "150px" }}
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
                            </>}
                        </Container>


                    </Col>
                </Row>
            </Container>





            {/*             {(hasEntries() && !submitting.state) && <FloatButton
                description="Submeter"
                onClick={onSave}
                shape="square"
                type="primary"
                style={{ right: 200,top:100, height:"30px", width:"80px" }}
                icon={<CheckOutlined />}
            />} */}
        </ConfigProvider>
    )

}