import React, { useEffect, useState, useCallback, useRef, useContext, useMemo, useImperativeHandle } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith, clone, isNil, is } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { useSubmitting, populateArray, isNullOrEmpty } from "utils";
import loadInit, { fixRangeDates, newWindow } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH, ROOT_URL } from "config";
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
import Pick, { ListColumns, PickMax } from "../commons/Pick";


//const title = "Nova Palete ...";
//const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
    return (<>{visible && <ToolbarTitleV3 disabled={loading} id={auth?.user} description={title}
        leftTitle={<span style={{fontSize:"14px"}}>{title}</span>}
        {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
    />}</>);
}


const steps = [
    {
        title: 'Confirmar'
    }, {
        title: 'Resultado'
    }
];

const schemaWeigh = z.object({
    pesobruto: z.any()
}).refine((v) => {
    const errors = [];
    if (isNullOrEmpty(v.pesobruto)) {
        errors.push({ path: ['pesobruto'], message: 'Tem de pesar a palete!' });
    } else if (!is(Number, v.pesobruto) || v.pesobruto < 10) {
        errors.push({ path: ['pesobruto'], message: 'O peso introduzido não é válido!' });
    }
    if (errors.length > 0) {
        throw new z.ZodError(errors);
    }
    return true;
}, {});

const CustomSearchButton = ({ value, forView, ...props }) => {
    return (<Button icon={<SearchOutlined />} {...props} />);
}

const _defaultForm = { pesobruto: null, haspalete: 1 }

const _default = {
    nPaletes: 0,
    loaded: false,
    paletes: [],
    confirmed: [],
    report: { valid: false, list: [] },
    timestamp: Date.now()
};
const _setDefault = (draft) => {
    draft.nPaletes = 0;
    draft.loaded = false;
    draft.paletes = [];
    draft.confirmed = [];
    draft.report = { valid: false, list: [] };
    draft.timestamp = Date.now();
}

const PaletesCarga = ({ picked, items, width = "100%", height = "70vh" }) => {
    
    const isPicked = (v) => {
        return picked.includes(v) ? { backgroundColor: "#b7eb8f", borderRadius: "3px", border: "solid 1px #73d13d", margin: "1px" } : { margin: "1px",borderRadius: "3px", border: "solid 1px #d9d9d9",backgroundColor: "#fff" };
    }

    return (
        <YScroll width={width} height={height}>
            <ListColumns $nItems={items.length} $columnWidth={90} $columns={Math.floor(items.length / 24) + 1}>
                {items.map((v, i) => {
                    return (<div style={{ textAlign:"center", width: "80px", padding: "2px", fontWeight: 700, fontSize: "12px", userSelect: "none", ...isPicked(v) }} key={`ic-${i}`}>{v}</div>);
                })}
            </ListColumns>
        </YScroll>
    );
}

export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [validation, setValidation] = useState({});
    const { openNotification } = useContext(AppContext);
    const paletesRef = useRef();
    const dataAPI = useDataAPI();
    const modalApi = useModalApi();

    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "controlpanel" });
    const [picked, setPicked] = useState([]);

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
        const result = await dataAPI.safePost(`${API_URL}/cargas/sql/`, "PaletesCargaList", {
            notify: ["run_fail", "fatal"], filter: {
                ...parseFilter("sgppl.carga_id", `==${inputParameters.current.id}`, { type: "number" })
            }
        }
        );
        if (result.success) {
            updateState(draft => {
                draft.loaded = true;
                draft.nPaletes = result.response.rows.length;
                draft.paletes = result.response.rows.map(v => v.nome);
                draft.confirmed = [];
                draft.timestamp = Date.now();
            });
        }
        //window.history.replaceState({}, document.title, window.location.pathname); //clear location state...
        //form.setFieldsValue(_defaultForm);
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
        // if (Math.max(...step.current.allowed) < v) {
        //     return;
        // }
        if (!step.current.allowed.includes(v)) {
            return;
        }
        step.current.step = (v == null) ? (step.current.step == 0 ? 0 : step.current.step - 1) : v;
        if (_updateState) {
            updateState(draft => { draft.timestamp = Date.now(); });
        }
    };

    const onStepChange = (value) => {
        goTo(value);
    }

    const onInputChange = (type, v, i, st) => {
        const { picked, n, items } = paletesRef.current.inputsRef.current;
        const _items = items.map(v => v.item);
        setPicked(_items);
        step.current.allowedActions = [];
        if (picked === n) {
            const done = state.paletes.every(item => _items.includes(item));
            if (done) {
                step.current.allowedActions = ["confirm"];
                updateState(draft => {
                    draft.timestamp = Date.now();
                });
            }
        }
    }

    const onConfirm = async () => {
        submitting.trigger();

        const result = await dataAPI.safePost(`${API_URL}/cargas/sql/`, "ConfirmCarga", {
            notify: ["run_fail", "fatal"], parameters: {
                carga_id: inputParameters.current.id,
                paletes: picked
            }
        });
        result.onSuccess(({ response }) => {
            next();
            step.current.allowed = [1];
            updateState(draft => {
                draft.timestamp = Date.now();
            });
        });
        result.onFail((p) => { });
        submitting.end();
    }

    const _titleForm = useCallback(() => {
        return `${inputParameters.current.nome}`;
    }, [submitting.timestamp]);

    return (
        <Page.Ready ready={permission?.isReady && state.loaded} loading={submitting.state}>
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={_titleForm()} />
            <Container fluid >
                <Row>
                    <Col>
                        <Row nogutter>
                            <Col>
                                <Steps type='inline' current={_step} items={steps} direction="horizontal" onChange={onStepChange} />
                            </Col>
                            <Col xs="content">
                                <Space>
                                    {(!submitting.state && _allowedActions.includes("confirm") && [0].includes(_step)) && <Button onClick={onConfirm} type="primary">Confirmar</Button>}
                                </Space>
                            </Col>
                        </Row>
                        <Row nogutter>
                            <Col>
                                <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                                    <Row gutterWidth={5} wrap='nowrap'>
                                        {[0].includes(_step) &&
                                            <>
                                                <Col style={{}}>
                                                    <Pick disablePaste={true} initialInputs={[]} columnWidth={150} disabled={submitting.state} onInputChange={(v, i, st) => onInputChange("confirm", v, i, st)} n={state.nPaletes} ref={paletesRef} pattern={/^(P|R)\d{4}-\d{4}$/} duplicates={false} height={"70vh"} />
                                                </Col>
                                                <Col style={{ borderRadius:"3px", backgroundColor:"#f5f5f5" }}>
                                                    <PaletesCarga items={state.paletes} picked={picked} />
                                                </Col>
                                            </>}
                                        {(_step == 1) && <Col style={{}}>
                                            <Result
                                                status="success"
                                                title="A carga foi confirmada com sucesso"
                                                subTitle={inputParameters.current.nome}
                                                extra={[
                                                    <Button type="primary" key="back" onClick={() => window.history.back()} >Voltar</Button>,
                                                ]}
                                            />
                                        </Col>}
                                    </Row>
                                </Container>
                            </Col>
                        </Row>
                    </Col >
                </Row >
            </Container >
        </Page.Ready>
    )

}