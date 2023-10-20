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
import { API_URL, PALETES_WEIGH } from "config";
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
import { FaStop, FaPlay, FaPause } from 'react-icons/fa';
import AggChoose from './AggChoose';
import FormFormulacao from '../formulacao/FormFormulacao';

//const title = "";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title, subTitle }) => {
    return (<ToolbarTitle id={auth?.user} description={`${title}/${subTitle}`} details={<span style={{ fontSize: "16px", marginLeft: "90px" }}>{subTitle}</span>}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

export const loadOrdensFabrico = async ({ id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { id }, sort: [], parameters: { method: "OrdensFabricoInProduction" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
}

const steps = [
    {
        title: 'Seleção'
    },
    {
        title: 'Formulação'
    }
];

export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "picking" });
    const [title, setTitle] = useState("Ordens de Fabrico");
    const [subTitle, setSubTitle] = useState("Gerir Formulação");

    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });

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

    useEffect(() => {
        setTitle(`Ordens de Fabrico`);
        setSubTitle(`Gerir Formulação`);
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        inputParameters.current = { ...location?.state };
        window.history.replaceState({}, document.title, window.location.pathname);
        updateState(draft => {
            draft.pos = null;
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
            draft.step = state.step + 1;
            draft.maxStep = (draft.step > draft.maxStep) ? draft.step : draft.maxStep;
        });
    };

    const prev = (v = null) => {
        updateState(draft => {
            draft.pos = null;
            draft.step = (v !== null) ? v : draft.step - 1;
        });
    };

    const onStepChange = (value) => {
        if (value == 0) {
            prev(0);
        }
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
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} subTitle={subTitle} />
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
                                </Space>
                            </Col>
                        </Row>

                        <Row nogutter>
                            <Col>
                                <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                                    <Row>
                                        {state.step == 0 && <Col><AggChoose openNotification={openNotification} onClick={onSelectOrdem} /></Col>}
                                        {state.step == 1 && <Col>
                                            <YScroll maxHeight={"80vh"}>
                                                <FormFormulacao noHeader={true} setFormTitle={true} parameters={{ cs_id: state.pos.items[0].cs_id, type: "formulacao_formulation_change" }} />
                                            </YScroll>
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