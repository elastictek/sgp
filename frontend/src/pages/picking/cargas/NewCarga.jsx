import React, { useEffect, useState, useCallback, useRef, useContext, useMemo, useImperativeHandle } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith, clone, isNil, is } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { useSubmitting, populateArray, isNullOrEmpty, tryParseDate } from "utils";
import loadInit, { fixRangeDates, newWindow } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH, ROOT_URL, CONTENTORES_OPTIONS, DATE_FORMAT } from "config";
import { json, includeObjectKeys, valueByPath } from "utils/object";
import { Button, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List, Result } from "antd";
import { PrinterOutlined, SearchOutlined, StopOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';

import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { useImmer } from "use-immer";
import { rules, validate, validateList, validateRows } from 'utils/useValidation';
import { useDataAPI, parseFilter } from 'utils/useDataAPIV4';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';
import Page, { Container as FormContainer, Field, Label, Lookup, SelectorPopup } from 'components/FormFields/FormsV2';
import { Value } from 'components/TableV4/TableColumnsV4';
import { z } from "zod";
import { FormPrint, printersList } from 'components/FormFields';
import useModalApi from 'utils/useModalApi';
import OpenOrdersChoose from '../OpenOrdersChoose';
import OpenOrderPaletesChoose from './OpenOrderPaletesChoose';
import { getSelectedNodes } from 'components/TableV4/TableV4';


const title = "Nova Carga";
const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
    return (<>{visible && <ToolbarTitleV3 disabled={loading} id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
        {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
    />}</>);
}


const steps = [
    {
        title: 'Encomenda'
    }, {
        title: 'Paletes'
    }, {
        title: 'Resultado'
    }
];

const _defaultForm = {};
const _default = {
    order: { eef: null, prf: null, cliente: null, cliente_abr: null, details: null },
    paletes: [],
    carga: null,
    report: { valid: false, list: [] },
    timestamp: Date.now()
};
const _setDefault = (draft) => {
    draft.paletes = [];
    draft.carga = null;
    draft.timestamp = Date.now();
}

const schema = z.object({
    contentor_id: z.any(),
    num_paletes: z.any()
}).refine((v) => {
    const errors = [];
    if (isNullOrEmpty(v.num_paletes)) {
        errors.push({ path: ['num_paletes'], message: 'O número de paletes tem de ser preenchido!' });
    } else if (!is(Number, v.num_paletes) || v.num_paletes < 1 || v.num_paletes > 100) {
        errors.push({ path: ['num_paletes'], message: 'O número de paletes não é válido!' });
    }
    if (isNullOrEmpty(v.contentor_id)) {
        errors.push({ path: ['contentor_id'], message: 'O tipo de Contentor tem de estar preenchido!' });
    }
    if (errors.length > 0) {
        throw new z.ZodError(errors);
    }
    return true;
}, {});

export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [validation, setValidation] = useState({});
    const { openNotification } = useContext(AppContext);
    const paleteRef = useRef();
    const bobinesRef = useRef();
    const dataAPI = useDataAPI();
    const modalApi = useModalApi();

    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "controlpanel" });


    const step = useRef({ allowedActions: [], step: 0, allowed: [0] });
    const [state, updateState] = useImmer(_default);

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const _step = useMemo(() => step.current.step, [state.timestamp, submitting.timestamp]);
    const _allowedActions = useMemo(() => step.current.allowedActions, [state.timestamp, submitting.timestamp]);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        inputParameters.current = { ...location?.state, ...props?.parameters };
        //window.history.replaceState({}, document.title, window.location.pathname); //clear location state...
        form.setFieldsValue(_defaultForm);
        submitting.end();
    }

    const next = (maxAllowed) => {
        step.current.step++;
        if (!isNullOrEmpty(maxAllowed)) {
            if (step.current.step >= maxAllowed) {
                step.current.allowed = populateArray(maxAllowed);
            } else {
                step.current.step++;
                step.current.allowed = populateArray(maxAllowed);
            }
        } else {
            const _max = Math.max(...step.current.allowed);
            step.current.allowed = populateArray((step.current.step > _max) ? step.current.step : _max);
        }
    };

    const goTo = (v = null, _updateState = true) => {
        if (Math.max(...step.current.allowed) < v) {
            return;
        }
        step.current.step = (v == null) ? (step.current.step == 0 ? 0 : step.current.step - 1) : v;
        if (_updateState) {
            updateState(draft => { draft.timestamp = Date.now(); });
        }
    };

    const onStepChange = (value) => {
        if (value == 0) {
            updateState(draft => {
                draft.order = null;
                draft.paletes = [];
                draft.timestamp = Date.now();
            });
        }
        goTo(value);
    }







    const onSelectOrder = async (v) => {
        step.current.allowed = populateArray(1);
        goTo(1);
        const _r = await dataAPI.safePost(`${API_URL}/cargas/sql/`, "GetOrdemFabricoByOrder", { notify: ["run_fail", "fatal"], filter: { ...parseFilter("eef", `==${v[0].eef}`) }, pagination: { enabled: false, limit: 1 } });
        if (_r.success) {
            if (_r.response?.rows && _r.response.rows.length > 0) {
                form.setFieldsValue({ contentor_id: _r.response.rows[0].tipo_transporte, data_prevista: tryParseDate(v[0].data_expedicao) });
            }
        }
        updateState(draft => {
            draft.order = { ...includeObjectKeys(v[0], ["eef", "prf", "cliente", "cliente_abr", "cliente_cod", "details", "data_expedicao"]) }
            draft.timestamp = Date.now();
        });
    }

    const onCreate = async (rows) => {
        submitting.trigger();
        const values = form.getFieldsValue(true);
        const _paletes = rows.map(v => ({ id: v.data.id }));
        const r = await validate(values, schema, { passthrough: false });
        r.onValidationFail((p) => {
            setValidation(prev => ({ ...prev, errors: p.alerts.error }));
        });
        r.onValidationSuccess((p) => {
            setValidation(prev => ({ ...prev, errors: p.alerts.error }));
        });
        if (r.valid) {
            const result = await dataAPI.safePost(`${API_URL}/cargas/sql/`, "NewCarga", {
                notify: ["run_fail", "fatal"], parameters: {
                    paletes: _paletes,
                    ...values,
                    ...state.order
                }
            });
            result.onSuccess(({ response }) => {
                next();
                step.current.allowed = populateArray(0);
                updateState(draft => {
                    draft.carga = response.data.carga;
                    draft.timestamp = Date.now();
                });
            });
            result.onFail((p) => { });
        }
        submitting.end();
    }

    const isPaleteSelectable = (v) => {
        if (v.data.nbobines_real != v.data.num_bobines) {
            return false;
        }
        return true;
    }



    return (
        <Page.Ready ready={permission?.isReady} loading={submitting.state}>
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />
            {isNullOrEmpty(state?.order?.eef) ?
                <Container fluid >
                    <Row>
                        <Col>
                            <OpenOrdersChoose defaultSort={[{ column: "id", direction: "DESC" }]} showHeader permission={permission} onClick={onSelectOrder} />
                        </Col>
                    </Row>
                </Container>
                : <Container fluid >
                    <Row>
                        <Col>
                            <Row nogutter>
                                <Col>
                                    <Steps type='inline' current={_step} items={steps} direction="horizontal" onChange={onStepChange} />
                                </Col>
                                <Col xs="content">
                                    <Space>
                                        {/* {(!submitting.state && [1].includes(_step) && state.paletes.length>0) && <Button onClick={onCreate} type="primary">Criar Carga</Button>} */}
                                        {/*{(!submitting.state && _allowedActions.includes("create") && [3].includes(_step)) && <Button onClick={onCreate} type="primary">Criar Palete</Button>} */}
                                    </Space>
                                </Col>
                            </Row>
                            <Row nogutter>
                                <Col>
                                    <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px", height: "88vh" }}>
                                        {(_step > 0) &&

                                            <FormContainer fluid form={form} wrapForm wrapFormItem validation={validation}>
                                                <Row nogutter align='center'>
                                                    <Col>
                                                        <Row nogutter>
                                                            <Col width={140}>
                                                                <Row nogutter><Col>Encomenda</Col></Row>
                                                                <Row nogutter><Col style={{ fontWeight: 700 }}>{state.order.eef}</Col></Row>
                                                            </Col>
                                                            <Col width={140}>
                                                                <Row nogutter><Col>PRF</Col></Row>
                                                                <Row nogutter><Col style={{ fontWeight: 700 }}>{state.order.prf}</Col></Row>
                                                            </Col>
                                                            <Col>
                                                                <Row nogutter><Col>Cliente</Col></Row>
                                                                <Row nogutter><Col style={{ fontWeight: 700 }}>{state.order.cliente}</Col></Row>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                                <Row nogutter align='center' style={{ /* backgroundColor: "#f5f5f5", borderRadius: "3px" */ }}>
                                                    <Col width={100}><Field name="num_paletes" label={{ enabled: true, text: "Nº Paletes" }}><InputNumber size="small" style={{ width: "100%" }} /></Field></Col>
                                                    <Col width={150}><Field name="contentor_id" label={{ enabled: true, text: "Contentor" }}><Select size="small" style={{ width: "100%" }} options={CONTENTORES_OPTIONS} /></Field></Col>
                                                </Row>
                                            </FormContainer>}
                                        {(_step == 1) && <Row nogutter>
                                            <Col>
                                                <OpenOrderPaletesChoose
                                                    rowSelection="multiple"
                                                    header={false}
                                                    baseFilters={{
                                                        ...parseFilter("po.eef", `==${state.order.eef}`)
                                                    }}
                                                    onOk={onCreate}
                                                    okText='Criar Carga'
                                                    isRowSelectable={isPaleteSelectable}
                                                    topToolbar={{ start: <></> }}
                                                />
                                            </Col>
                                        </Row>}
                                        {(_step == 2) && <Row><Col style={{}}>
                                            <Result
                                                status="success"
                                                title="A carga foi criada com sucesso"
                                                subTitle={state.carga}
                                            />
                                        </Col></Row>}
                                    </Container>
                                </Col>
                            </Row>
                        </Col >
                    </Row >
                </Container >}
        </Page.Ready>
    )

}