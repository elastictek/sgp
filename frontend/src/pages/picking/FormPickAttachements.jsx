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
import loadInit, { fixRangeDates, newWindow } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH, ROOT_URL } from "config";
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
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace, FormPrint, printersList } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { produce } from 'immer';
import { useImmer } from "use-immer";
import FormAttachements from '../ordensfabrico/FormAttachements';

//const title = "Nova Palete";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

// export const loadQuantity = async ({ value, artigo_cod }, signal) => {
//     const { data: { row } } = await fetchPost({ url: `${API_URL}/materiasprimas/sql/`, filter: { value, artigo_cod }, sort: [], parameters: { method: "GetGranuladoLoteQuantityV2" }, signal });
//     if (row && Object.keys(row).length > 0) {
//         return row;
//     }
//     return null;
// }

export const loadOrdensFabricoOpen = async ({ id,was_in_production }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { was_in_production, id }, sort: [], parameters: { method: "OrdensFabricoOpen" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
}
export const loadOrdensFabrico = async ({ id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { id }, sort: [], parameters: { method: "OrdensFabricoGet" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
}

export const loadBobines = async ({ palete_id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobines/sql/`, filter: { fpaleteid: palete_id }, sort: [{ column: "mb.posicao_palete", direction: "ASC" }], parameters: { method: "BobinesLookup" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
}

const steps = [
    {
        title: 'Ordens'
    }, {
        title: 'Anexos'
    }
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

const OrdensFabricoList = ({ openNotification, next, ...props }) => {
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
        const _items = await loadOrdensFabricoOpen({}, signal);
        setItems(_items);
        submitting.end();
    }

    return (<YScroll>

        <List
            size="small"
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item, index) => (
                <ListItem onClick={() => next(item)}>
                    <List.Item.Meta
                        // avatar={<div style={{ width: "90px", maxWidth: "90px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        //     <OFabricoStatus data={item} cellProps={{}} />
                        // </div>}
                        title={<div>{item.ofid}<OFabricoStatus data={item} cellProps={{}} /></div>}
                        description={<div>
                            <div style={{ fontWeight: 900, fontSize: "14px", color: "#000" }}>{item.cliente_nome}</div>
                            <div><span>{item.item_cod}</span><span style={{ fontWeight: 700, marginLeft: "10px" }}>{item.artigo_des}</span></div>
                        </div>}
                    />
                </ListItem>
            )}
        />

    </YScroll>);
}




export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "controlpanel" });
    const [title, setTitle] = useState("Anexos");

    const [state, updateState] = useImmer({
        action: null,
        maxStep: null,
        step: null,
        pos: null,
    });
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
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

        updateState(draft => {
            draft.step = 0;
            draft.maxStep = 0;
        });

        submitting.end();
    }

    const next = (item) => {
        updateState(draft => {
            if (state.step === 0) {
                draft.pos = item;
            }
            //     if (draft.action === "weigh" && state.step === 1) {
            //         // draft.pos = item;
            //         draft.step = 3;
            //     } else {
            draft.step = state.step + 1;
            //     }
            draft.maxStep = (draft.step > draft.maxStep) ? draft.step : draft.maxStep;
        });
    };

    const prev = (v = null) => {
        // if ((v === 0 && state.palete_id && state.deleted == 0)) {
        //     return;
        // }
        // if (state.maxStep === 4 && v !== 0) {
        //     return;
        // }
        // if (v > state.maxStep) {
        //     return;
        // }
        // updateState(draft => {
        //     draft.step = (v !== null) ? v : draft.step - 1;
        // });
    };

    const onStepChange = (value) => {
        // if (state.action == "weigh" && value < 3) {
        //     prev(3);
        // } else if (value === 0 && state.palete_id) {
        //     prev(1);
        // } else {
        //     prev(value);
        // }
    }

    const onSelectOrdem = (item) => {
        console.log("RRRr", item)
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
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />
            <Container>
                <Row>
                    <Col>
                        <Row nogutter>
                            {!["delete"].includes(state.action) ?
                                <Col>
                                    <Steps type='inline' current={state.step} items={steps} direction="horizontal" onChange={onStepChange} /* style={{ flexDirection: "row" }} */ />
                                </Col> :
                                <Col></Col>
                            }
                            <Col xs="content">
                                <Space>
                                    {/* {(state.step == 2 && state.picked === state.nbobines && !submitting.state) && <Button
                                        onClick={onBobinesCheck}
                                        type="default"
                                    >Validar</Button>}
                                    {(state.step == 3 && state.bobinesOk === 1 && !state.action && !submitting.state) && <Button
                                        onClick={onSave}
                                        type="primary"
                                        icon={<CheckOutlined />}
                                    >Criar</Button>}
                                    {(state.step == 3 && state.bobinesOk === 1 && state.action == "redo" && !submitting.state) && <Button
                                        onClick={onSave}
                                        type="primary"
                                        icon={<CheckOutlined />}
                                    >Refazer</Button>}
                                    {(state.step == 3 && state.action == "weigh" && !submitting.state) && <Button
                                        onClick={onSave}
                                        type="primary"
                                        icon={<CheckOutlined />}
                                    >Pesar</Button>}
                                    {((state.step == 4 && state.palete && !submitting.state) || (state.action == "delete" && state.deleted == 1 && !submitting.state)) && <Button
                                        onClick={() => { _cancelPalete(); if (!state.palete_id || state.deleted == 1) { prev(0); } }}
                                        type="primary"
                                    >Nova Palete</Button>}
                                    {(state.action == "delete" && state.deleted == 0 && !submitting.state) && <Button
                                        onClick={onDelete}
                                        type="primary"
                                    >Apagar Palete</Button>} */}
                                </Space>
                            </Col>
                        </Row>

                        <Row nogutter>
                            <Col>
                                <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                                    <Row>
                                        {state.step == 0 && <Col><OrdensFabricoList openNotification={openNotification} next={onSelectOrdem} /></Col>}
                                        {state.step == 1 && <Col>
                                            <FormAttachements noHeader={true} setFormTitle={true} parameters={{ draft_id: state.pos.draft_id, ofid: state.pos.ofid }} />
                                        </Col>}
                                    </Row>
                                </Container>
                            </Col>
                        </Row>
                    </Col >
                </Row >
            </Container >
        </ConfigProvider>
    )

}