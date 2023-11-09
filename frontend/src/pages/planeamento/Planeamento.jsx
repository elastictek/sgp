import React, { useEffect, useState, useCallback, useRef, useContext,Suspense } from 'react';
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
import FormPlaneamento from './FormPlaneamento';
const FormFormulacaoPlan = React.lazy(() => import('./FormFormulacaoPlan'));
import { GoDotFill } from 'react-icons/go';

//const title = "Planeamento";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

// const steps = (dirty = []) => [
//     {
//         title: <div style={{ ...dirty.includes(0) && { textDecoration: "underline #fa8c16 3px" } }}>Informação</div>
//     }, {
//         title: <div style={{ ...dirty.includes(1) && { textDecoration: "underline #fa8c16 3px" } }}>Embalamento</div>
//     }, {
//         title: <div style={{ ...dirty.includes(2) && { textDecoration: "underline #fa8c16 3px" } }}>Nonwovens</div>
//     }, {
//         title: <div style={{ ...dirty.includes(3) && { textDecoration: "underline #fa8c16 3px" } }}>Cores</div>
//     }, {
//         title: <div style={{ ...dirty.includes(4) && { textDecoration: "underline #fa8c16 3px" } }}>Especificações</div>
//     }, {
//         title: <div style={{ ...dirty.includes(5) && { textDecoration: "underline #fa8c16 3px" } }}>Formulação</div>
//     }, {
//         title: <div style={{ ...dirty.includes(6) && { textDecoration: "underline #fa8c16 3px" } }}>Gama Operatória</div>
//     }, {
//         title: <div style={{ ...dirty.includes(7) && { textDecoration: "underline #fa8c16 3px" } }}>Cortes</div>
//     }, {
//         title: <div style={{ ...dirty.includes(8) && { textDecoration: "underline #fa8c16 3px" } }}>Anexos</div>
//     },
// ];

const loadOrdemFabrico = async (agg_of_id, ordem_id, draft_ordem_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, pagination: { enabled: false }, filter: { agg_of_id, ordem_id, draft_ordem_id }, parameters: { method: "GetOrdemFabricoSettings" } });
    return rows;
}
export const loadPlaneamento = async (current) => {
    const _data = await loadOrdemFabrico(current?.temp_ofabrico_agg, current?.ofabrico_sgp, current?.temp_ofabrico);
    const formulacao_plan = includeObjectKeys(_data, ["fplan_%"]);
    const cortes_plan = includeObjectKeys(_data, ["cplan_%"]);
    return {
        ...current, ...formulacao_plan, ...cortes_plan, cortesordem_id: json(_data?.cortesordem)?.id, cortes_id: json(_data?.cortes)?.id, formulacao_id: json(_data?.formulacao)?.id,
        paletizacao_id: json(json(_data.paletizacao))?.id,
        ...pickAll([{ id: "cs_id" }, "sentido_enrolamento", "amostragem", "observacoes", "agg_of_id", "formulacao_plan_id", "fplan_", "cortes_plan_id", "cplan_"], _data),
        of: json(_data.ofs), emendas: json(_data.emendas),
        hasPaletizacao: json(json(_data.paletizacao))?.id ? true : false
    };
}

const Edit = ({ operations, editable, action, item, permissions, onEdit, onEndEdit, onCancelEdit, ...props }) => {
    return (
        <Permissions permissions={permissions} item={item} action={action} forInput={editable}>
            {!operations.edit && <Button onClick={() => onEdit(action)} type="link" icon={<EditOutlined />}>Editar</Button>}
            {operations.edit && <Button onClick={() => onCancelEdit()} type="link">Cancelar</Button>}
            {/* {editKey === action && <Button onClick={() => onEndEdit(fn)} type="primary" icon={<EditOutlined />}>Guardar</Button>} */}
        </Permissions>
    );
}

export default ({ extraRef, closeSelf, loadParentData, setFormTitle, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "ordemfabrico" });
    const [title, setTitle] = useState("Planeamento");
    const operationsRef = useRef();

    const [state, updateState] = useImmer({
        loaded: false,
        action: null,
        maxStep: null,
        step: null,
        ids: {
            temp_id: null,
            agg_id: null,
            cs_id: null,
            ordem_id: null
        },
        ordem: null,
        operations: { dirtyForms: [], edit: false }
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
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
        }
        const planeamento = await loadPlaneamento(inputParameters.current);

        updateState(draft => {
            draft.ids = {
                temp_id: inputParameters.current.temp_ofabrico, //temp_ofabrico id
                agg_id: inputParameters.current.temp_ofabrico_agg, //temp_ofabricoagg id
                cs_id: planeamento?.cs_id,  //current_settings id
                ordem_id: inputParameters.current?.ofabrico_sgp //planeamento_producao id
            }
            draft.ordem = planeamento;
            draft.step = 0;
            draft.maxStep = 0;
            draft.operations = { dirtyForms: [], edit: false }
            draft.loaded = true;
        });
        submitting.end();
    }

    const isEditable = (allowOnPrfOpen = false, minStatus = 1) => {
        if (allowOnPrfOpen) {
            return ((state.ordem?.ofabrico_status >= minStatus && state.ordem?.ofabrico_status < 9) || (state.ordem?.ativa == 1));
        } else {
            return (state.ordem?.ofabrico_status >= minStatus && state.ordem?.ofabrico_status < 9);
        }
    }

    const onEdit = () => {
        updateState(draft => {
            draft.operations.edit = true;
        });
    }
    const onCancelEdit = () => {
        updateState(draft => {
            draft.operations = { dirtyForms: [], edit: false }
        });
    }

    const onSave = async () => {
        submitting.trigger();
        let response = null;
        try {

        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        };
        submitting.end();
    }

    const next = (item) => {
        updateState(draft => {
            draft.step = state.step + 1;
            draft.maxStep = (draft.step > draft.maxStep) ? draft.step : draft.maxStep;
        });
    };

    const prev = (v = null) => {
        updateState(draft => {
            draft.step = (v !== null) ? v : draft.step - 1;
        });
    };

    const onStepChange = (value) => {
        prev(value);
    }

    return (
        <ConfigProvider
            theme={{
                components: {
                    Segmented: {
                        itemSelectedBg: "#1890ff"
                    },
                    Steps: {
                        colorTextQuaternary: "#000",

                    }
                },
            }}
        >
            {!setFormTitle && <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />}
            {state.loaded && <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", padding: "5px" }}>
                <Row nogutter>
                    <Col>
                        <Tabs
                            tabBarExtraContent={(!submitting.state) && <Space>
                                <Edit operations={state.operations} permissions={permission} item="edit" action="ordem_fabrico" editable={[isEditable(true)]} onEdit={onEdit} onCancelEdit={onCancelEdit} />
                                <div ref={operationsRef}></div>
                            </Space>}
                            defaultActiveKey="1"
                            size="small"
                            style={{ marginBottom: 32 }}
                            items={[
                                {
                                    key: 1,
                                    children: <FormPlaneamento index={1} updateState={updateState} operations={state.operations} permissions={permission.permissions} parameters={{ ...state.ids, ordem: state.ordem }} operationsRef={operationsRef} />,
                                    label: <div style={{}}>Informação{state.operations.dirtyForms.includes(1) && <GoDotFill fontSize="16px" color='#d46b08' />}</div>
                                }, {
                                    key: 2,
                                    children: <div>b</div>,
                                    label: <div style={{ ...state.operations.dirtyForms.includes(2) && { textDecoration: "underline #fa8c16 3px" } }}>Embalamento</div>
                                }, {
                                    key: 3,
                                    children:  <div>c</div>,
                                    label: <div style={{ ...state.operations.dirtyForms.includes(3) && { textDecoration: "underline #fa8c16 3px" } }}>Nonwovens</div>
                                }, {
                                    key: 4,
                                    children: <div>a</div>,
                                    label: <div style={{ ...state.operations.dirtyForms.includes(4) && { textDecoration: "underline #fa8c16 3px" } }}>Cores</div>
                                }, {
                                    key: 5,
                                    children: <div>a</div>,
                                    label: <div style={{ ...state.operations.dirtyForms.includes(5) && { textDecoration: "underline #fa8c16 3px" } }}>Especificações</div>
                                }, {
                                    key: 6,
                                    children: <Suspense fallback={<Spin />}><FormFormulacaoPlan  index={6} updateState={updateState} operations={state.operations} permissions={permission.permissions} parameters={{ ...state.ids, ordem: state.ordem }} operationsRef={operationsRef}/></Suspense>,
                                    label: <div style={{ ...state.operations.dirtyForms.includes(6) && { textDecoration: "underline #fa8c16 3px" } }}>Formulação</div>
                                }, {
                                    key: 7,
                                    children: <div>a</div>,
                                    label: <div style={{ ...state.operations.dirtyForms.includes(7) && { textDecoration: "underline #fa8c16 3px" } }}>Gama Operatória</div>
                                }, {
                                    key: 8,
                                    children: <div>a</div>,
                                    label: <div style={{ ...state.operations.dirtyForms.includes(8) && { textDecoration: "underline #fa8c16 3px" } }}>Cortes</div>
                                }, {
                                    key: 9,
                                    children: <div>a</div>,
                                    label: <div style={{ ...state.operations.dirtyForms.includes(9) && { textDecoration: "underline #fa8c16 3px" } }}>Anexos</div>
                                },
                            ]}
                        />


                        {/*  <Row nogutter>
                            <Col>
                                <Steps style={{ color: "#000" }} type='inline' current={state.step} items={steps(state.operations.dirtyForms)} direction="horizontal" onChange={onStepChange} />
                            </Col>
                            <Col xs="content">
                                <Space>
                                    {(!submitting.state) && <Space>
                                        <Edit operations={state.operations} permissions={permission} item="edit" action="ordem_fabrico" editable={[isEditable(true)]} onEdit={onEdit} onCancelEdit={onCancelEdit} />
                                        <div ref={operationsRef}></div>
                                    </Space>}
                                </Space>
                            </Col>
                        </Row>
                        <Row nogutter>
                            <Col>
                                <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                                    <Row>
                                        {state.step == 0 && <Col>
                                            <FormPlaneamento index={0} updateState={updateState} operations={state.operations} permissions={permission.permissions} parameters={{ temp_id: state.temp_id, agg_id: state.agg_id, ordem: state.ordem }} operationsRef={operationsRef} />
                                        </Col>}
                                    </Row>
                                </Container>
                            </Col>
                        </Row> */}
                    </Col >
                </Row >
            </Container >}
        </ConfigProvider>
    )

}