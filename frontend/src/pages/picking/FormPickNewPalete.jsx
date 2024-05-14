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
import { Button, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
import { PrinterOutlined, SearchOutlined, StopOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';

import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { useImmer } from "use-immer";
import { rules, validate, validateList, validateRows } from 'utils/useValidation';
import FormPaletizacao from '../paletes/paletizacao/FormPaletizacao';
import PaletizacoesList from '../paletes/paletizacao/PaletizacoesList';
import { useDataAPI, parseFilter } from 'utils/useDataAPIV4';
import ToolbarTitleV3 from 'components/ToolbarTitleV3';
import Page, { Container as FormContainer, Field, Label, Lookup, SelectorPopup } from 'components/FormFields/FormsV2';
import { Value } from 'components/TableV4/TableColumnsV4';
import { z } from "zod";
import { FormPrint, printersList } from 'components/FormFields';
import useModalApi from 'utils/useModalApi';
import OrdensFabricoChoose from './OrdensFabricoChoose';
import Pick, { PickMax } from "./commons/Pick";
import PaletesChoose from './PaletesChoose';


//const title = "Nova Palete ...";
//const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
    return (<>{visible && <ToolbarTitleV3 disabled={loading} id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
        {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
    />}</>);
}


const steps = [
    {
        title: 'Esquemas de embalamento'
    }, {
        title: 'Esquema'
    }, {
        title: 'Bobines'
    }, {
        title: 'Pesar'
    }, {
        title: 'Palete'
    },
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

const WeighPalete = ({ form, validation }) => {
    const onPesoPaleteSelect = (v) => {
        form.setFieldValue("haspalete", v);
    }

    return (
        <FormContainer fluid form={form} forInput={true} wrapForm={true} wrapFormItem={true} style={{}} /* onValuesChange={onValuesChange} */ validation={validation}>
            <Row style={{ justifyContent: "center" }} nogutter>
                <Col xs="content"><Field name="pesobruto" label={{ enabled: true, text: "Peso bruto" }}><InputNumber autoFocus style={{ width: "100px" }} addonAfter="kg" /></Field></Col>
            </Row>
            <Row style={{ justifyContent: "center", marginTop: "5px" }} nogutter>
                <Col xs="content">
                    <Segmented
                        name='haspalete'
                        onChange={onPesoPaleteSelect}
                        options={[
                            {
                                label: (
                                    <div style={{ padding: 4 }}>
                                        <Avatar style={{ backgroundColor: '#bfbfbf' }} />
                                        <div>Com Palete</div>
                                    </div>
                                ),
                                value: 1,
                            },
                            {
                                label: (
                                    <div style={{ padding: 4 }}>
                                        <Avatar icon={<StopOutlined />}></Avatar>
                                        <div>Sem Palete</div>
                                    </div>
                                ),
                                value: 0,
                            }
                        ]}
                    />

                </Col>
            </Row>
        </FormContainer >
    );
}

const CustomSearchButton = ({ value, forView, ...props }) => {
    return (<Button icon={<SearchOutlined />} {...props} />);
}

const _defaultForm = { pesobruto: null, haspalete: 1 }

const _default = {
    schema: null,
    nBobines: 0,
    schemaBobines: [],
    allSchemaBobines: [],
    bobines: [],
    paleteRef: [],
    palete: null,
    lvl: 0,
    ordemFabrico: { id: null, paletizacao_id: null, ofid: null, allSchemaBobines: [] },
    paletePeso: null,
    paleteSize: null,
    report: { valid: false, list: [] },
    timestamp: Date.now()
};
const _setDefault = (draft) => {
    draft.schema = null;
    draft.schemaBobines = [];
    draft.allSchemaBobines = [];
    draft.nBobines = 0;
    draft.bobines = [];
    draft.paleteRef = [];
    draft.palete = null;
    draft.lvl = 0;
    draft.paletePeso = null;
    draft.paleteSize = null;
    draft.report = { valid: false, list: [] };
    draft.timestamp = Date.now();
}

const ReportItem = ({ value, width = 65 }) => {
    if (isNullOrEmpty(value)) {
        return (<></>);
    }
    return (<Col width={width} style={{ minWidth: `${width}px` }}><div style={{ margin: "0px 20px", border: "dashed 1px", width: "25px", height: "25px", borderRadius: "2px", backgroundColor: value == 1 ? "green" : "#ff4d4f" }}></div></Col>);
}

const ReportItemHeader = ({ visible = false, tooltip, title, width = 65 }) => {
    if (!visible) {
        return (<></>);
    }
    return (<Col width={width} style={{ minWidth: `${width}px`, textAlign: "center", fontSize: "11px" }}><Tooltip title={tooltip}>{title}</Tooltip></Col>);
}

const ReportList = ({ typePalete, list, report, index }) => {
    const getItem = (item) => {
        return report.find(v => v.nome == item);
    }

    return (
        <YScroll xScroll="auto">
            <Container fluid>
                <Row wrap='nowrap' nogutter>
                    <Col>
                        <Row nogutter wrap='nowrap' style={{ padding: "3px" }}>
                            <Col width={30} style={{ minWidth: "30px" }}></Col>
                            <Col width={120} style={{ minWidth: "120px" }}>Nome</Col>
                            <ReportItemHeader visible={!isNullOrEmpty(report?.[0]?.bobine_ok)} tooltip="A bobine já não existe ou não se encontra disponível (retrabalhada/regranulada)" title="Bobine" />
                            <ReportItemHeader visible={!isNullOrEmpty(report?.[0]?.estado_ok)} tooltip="A bobine não se encontra num estado válido" title="Estado" />
                            <ReportItemHeader visible={!isNullOrEmpty(report?.[0]?.palete_ok)} tooltip="A bobine encontra-se numa palete final" title="Palete" />
                            <ReportItemHeader visible={!isNullOrEmpty(report?.[0]?.carga_ok)} tooltip="A bobine encontra-se numa palete que se encontra em carga ou expedida" title="Carga" />
                            <ReportItemHeader visible={!isNullOrEmpty(report?.[0]?.artigo_ok)} tooltip="O artigo não corresponde ao da ordem de fabrico" title="Artigo" />
                            <ReportItemHeader visible={!isNullOrEmpty(report?.[0]?.largura_ok)} tooltip="A largura não corresponde à da ordem de fabrico" title="Largura" />
                            <ReportItemHeader visible={!isNullOrEmpty(report?.[0]?.produto_ok)} tooltip="O produto não corresponde ao da ordem de fabrico" title="Produto" />
                            <ReportItemHeader visible={!isNullOrEmpty(report?.[0]?.core_ok)} tooltip="O core não corresponde ao da ordem de fabrico" title="Core" />
                            <ReportItemHeader visible={!isNullOrEmpty(report?.[0]?.diam_ok)} tooltip="O diâmetro da bobine não está dentro dos limites establecidos pelo cliente" title="Diâmetro" />
                            <ReportItemHeader visible={!isNullOrEmpty(report?.[0]?.duplicate_ok)} tooltip="Existem bobines duplicadas" title="Duplicada" />
                            <ReportItemHeader visible={!isNullOrEmpty(report?.[0]?.item_emendas_ok) && !isNullOrEmpty(report?.[0]?.item_emendas_limit_ok)} tooltip="O número de emendas excede o definido na ordem de fabrico" title="Emendas" />
                            <ReportItemHeader visible={!isNullOrEmpty(report?.[0]?.item_expired_ok)} tooltip="A bobine encontra-se fora do prazo de validade" title="Expirada" />

                        </Row>

                        {list.map((x, i) => {
                            const v = getItem(x.item);
                            return (
                                <Row nogutter key={`err-${i}`} style={{ marginTop: "2px", padding: "3px", ...(i == index) && { background: "#fff1b8" } }} wrap='nowrap'>
                                    <Col style={{ alignSelf: "center", minWidth: "30px" }} width={30}>{`${i + 1}`.padStart(2, '0')}</Col>
                                    <Col style={{ alignSelf: "center", minWidth: "120px", fontWeight: 700 }} width={120}>{v.nome}</Col>
                                    <ReportItem value={v?.bobine_ok} />
                                    <ReportItem value={v?.estado_ok} />
                                    <ReportItem value={v?.palete_ok} />
                                    <ReportItem value={v?.carga_ok} />
                                    <ReportItem value={v?.artigo_ok} />
                                    <ReportItem value={v?.largura_ok} />
                                    <ReportItem value={v?.produto_ok} />
                                    <ReportItem value={v?.core_ok} />
                                    <ReportItem value={v?.diam_ok} />
                                    <ReportItem value={v?.duplicate_ok} />
                                    {!isNullOrEmpty(v?.item_emendas_ok) && !isNullOrEmpty(v?.item_emendas_limit_ok) && <ReportItem value={(v?.item_emendas_ok == 0 || v?.item_emendas_limit_ok == 0) ? 0 : 1} />}
                                    <ReportItem value={v?.item_expired_ok} />
                                </Row>);
                        })}
                    </Col>
                </Row>
            </Container>
        </YScroll>
    );
}

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
        goTo(value);
    }

    const onSelectSchema = (row) => {
        next(); //Atualizar primeiro o step e só depois o state...
        step.current.allowed = populateArray(0);
        form.setFieldsValue(_defaultForm);
        updateState(draft => {
            _setDefault(draft);
            draft.allSchemaBobines = draft.ordemFabrico.allSchemaBobines; //se tiver ordem de fabrico, sobrepõe como default
            draft.schema = row;
            draft.timestamp = Date.now();
        });
    }

    const onSelectLevel = (row) => {
        if (row.valid) {
            // if (inputParameters.current.type == "S" && json(state.schema.bobines)[row.lvl - 1] <= row.nBobines) {
            //     openNotification("error", 'top', "Notificação", `A palete do tipo ${inputParameters.current.type} tem de ter menos bobines que o definido na ordem de fabrico!`, null);
            //     return;
            // }
            step.current.allowed = populateArray(1);
            next();
            form.setFieldsValue(_defaultForm);
            const _previousSchema = state.schema;
            console.log(row)
            updateState(draft => {
                _setDefault(draft);
                draft.schema = _previousSchema;
                draft.paleteSize = row.els.find(v => v.item_id == 1).item_paletesize;
                draft.nBobines = row.nBobines;
                draft.lvl = row.lvl;
                draft.schemaBobines = row.schemaBobines;
                draft.allSchemaBobines = row.allSchemaBobines;
                draft.timestamp = Date.now();
            });
        }
    }

    const onInputChange = (type, v, i, st) => {
        const { picked, n } = bobinesRef.current.inputsRef.current;
        step.current.allowed = populateArray(2);
        if (picked === n) {
            step.current.allowedActions = ["validate"];
            updateState(draft => { draft.timestamp = Date.now(); });
        }
    }

    const onValidate = async () => {
        submitting.trigger();
        step.current.allowedActions = [];
        const { picked, n, items } = bobinesRef.current.inputsRef.current;
        const _paleteRef = paleteRef.current.inputsRef.current?.items.map(v => v.item);
        step.current.allowed = populateArray(2);
        if (picked === n) {
            const _bobines = items.map(v => v.item);
            const result = await dataAPI.safePost(`${API_URL}/paletes/sql/`, "CheckBobinesPalete", {
                notify: ["run_fail", "fatal"], parameters: {
                    type: inputParameters.current.type, ...state, ordem_id: state.ordemFabrico.id, bobines: _bobines, paleteRef: _paleteRef?.[0]?.item,
                    palete_redo_id: inputParameters.current?.palete?.id
                },
            });
            result.onSuccess(({ response }) => {
                if (response.report[0].ok === 1) {
                    step.current.allowedActions = ["create"];
                    next();
                } else {
                    for (const v of response.report) {
                        const idx = items.findIndex(x => x.item == v.nome);
                        if (idx >= 0) {
                            items[idx].status.error = v.item_ok == 1 ? false : true;
                            items[idx].status.picked = v.item_ok == 1 ? true : false;
                        }
                    }
                }
                updateState(draft => {
                    draft.paleteRef = _paleteRef;
                    draft.bobines = _bobines;
                    draft.report.list = response.report;
                    draft.report.valid = response.report[0].ok == 1 ? true : false;
                    draft.timestamp = Date.now();
                });
            });
            result.onFail((p) => { });
        }
        submitting.end();
    }

    const onCreate = async () => {
        submitting.trigger();
        const values = form.getFieldsValue(true);
        const r = await validate(values, schemaWeigh, { passthrough: false });
        step.current.allowed = populateArray(3);
        r.onValidationFail((p) => {
            setValidation(prev => ({ ...prev, errors: p.alerts.error }));
        });
        r.onValidationSuccess((p) => {
            setValidation(prev => ({ ...prev, errors: p.alerts.error }));
        });
        if (r.valid) {
            const _paletePeso = values.haspalete == 1 ? PALETES_WEIGH.find(v => v.value.replace(/\s/g, '') == state.paleteSize.replace(/\s/g, ''))?.key : 0;
            const { report, ..._state } = state;
            const result = await dataAPI.safePost(`${API_URL}/paletes/sql/`, "CreatePalete", {
                notify: ["run_fail", "fatal"], parameters: {
                    type: inputParameters.current.type,
                    paletePeso: _paletePeso,
                    pesoBruto: values.pesobruto,
                    nBobines: state.nBobines,
                    bobines: state.bobines,
                    lvl: state.lvl,
                    paleteSize: state.paleteSize,
                    paleteRef: state.paleteRef?.[0],
                    paletizacao_id: state.schema.id,
                    schemaBobines: state.schemaBobines,
                    ordem_id: state.ordemFabrico.id,
                    palete_redo_id: inputParameters.current?.palete?.id
                }
            });
            result.onSuccess(({ response }) => {
                if (response.report[0].ok === 1) {
                    step.current.allowedActions = ["print"];
                    next(0);
                }
                if (response.report[0].ok === 0) {
                    step.current.allowed = populateArray(2);
                    goTo(2);
                }
                updateState(draft => {
                    draft.palete = response.palete?.[0];
                    draft.report.list = response.report;
                    draft.report.valid = response.report[0].ok == 1 ? true : false;
                    draft.timestamp = Date.now();
                });
            });
            result.onFail((p) => { });
        }
        submitting.end();
    }



    const onReportList = () => {
        modalApi.setModalParameters({
            content: <ReportList typePalete={inputParameters.current?.type} list={bobinesRef.current.inputsRef.current.items} report={state.report.list} />,
            closable: true,
            title: "Relatório de erros",
            lazy: false,
            type: "drawer",
            width: "90%",
            parameters: {}
        });
        modalApi.showModal();
    }

    const onPrint = () => {

        if (_step == 4 && !isNullOrEmpty(state.palete)) {

            const _printers = [...printersList?.PRODUCAO, ...printersList?.ARMAZEM];
            modalApi.setModalParameters({
                content: <FormPrint printer={_printers[0].value}
                    {...{
                        url: `${API_URL}/print/sql/`, printers: _printers, numCopias: 2,
                        onComplete: onDownloadComplete,
                        parameters: {
                            method: "PrintPaleteEtiqueta",
                            id: state.palete.id,
                            palete_nome: state.palete.nome,
                            name: "ETIQUETAS-PALETE",
                            path: "ETIQUETAS/PALETE"
                        }
                    }}
                />,
                closable: true,
                title: "Imprimir Etiqueta",
                lazy: false,
                type: "modal",
                width: "500px",
                height: "200px",
                parameters: {}
            });
            modalApi.showModal();
        }
    }
    const onDownloadComplete = async (response, download) => {
        if (download == "download") {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');
        }
    }

    const onSelectOrdem = (v) => {
        goTo(0);

        if (inputParameters.current.type == "S") {
            updateState(draft => {
                draft.ordemFabrico = { id: v[0].id, ofid: v[0]?.ofid };
                draft.timestamp = Date.now();
            });
        } else {
            const _allSchemabobines = [];
            if (!v[0]?.paletizacao_id) {
                if (v[0]?.bobines_por_palete_inf) {
                    _allSchemabobines.push(v[0]?.bobines_por_palete_inf);
                }
                if (v[0]?.bobines_por_palete) {
                    _allSchemabobines.push(v[0]?.bobines_por_palete);
                }
            }
            updateState(draft => {
                draft.allSchemaBobines = _allSchemabobines;
                draft.ordemFabrico = { id: v[0].id, ofid: v[0]?.ofid, paletizacao_id: v[0].paletizacao_id, allSchemaBobines: _allSchemabobines };
                draft.timestamp = Date.now();
            });
        }
    }

    const onIgnore = () => {
        if (inputParameters.current?.ordemFabrico) {
            inputParameters.current.ordemFabrico.enabled = false;
        }
        goTo(0);
        updateState(draft => {
            draft.timestamp = Date.now();
        });
    }

    const _titleForm = useCallback(() => {
        if (inputParameters.current?.palete?.id) {
            return `Refazer Palete ${inputParameters.current?.palete?.nome}`;
        } else {
            return `Nova ${inputParameters.current.title}`;
        }
    }, [submitting.timestamp]);

    return (
        <Page.Ready ready={permission?.isReady && !isNullOrEmpty(inputParameters.current?.type)} loading={submitting.state}>
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={_titleForm()} />
            {inputParameters.current?.ordemFabrico?.enabled && isNullOrEmpty(state?.ordemFabrico?.id) ?
                <Container fluid >
                    {inputParameters.current?.ordemFabrico?.optional && <Row>
                        <Col style={{ textAlign: "left", fontWeight: "700" }}>
                            <Button onClick={onIgnore} type='link'>Ignorar &gt;&gt;</Button>
                        </Col>
                    </Row>}
                    <Row>
                        <Col>
                            <OrdensFabricoChoose baseFilters={inputParameters.current?.palete?.ordemFilter && inputParameters.current?.palete?.ordemFilter} retrabalho={inputParameters.current?.ordemFabrico?.retrabalho} serverMethod="OrdensFabricoOpen" showHeader showAggCod={false} permission={permission} allowInElaboration={false} onClick={onSelectOrdem} />
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
                                        {(!submitting.state && _allowedActions.includes("validate") && [2].includes(_step)) && <Button onClick={onValidate} type="primary">Validar</Button>}
                                        {(!submitting.state && _allowedActions.includes("create") && [3].includes(_step)) && <Button onClick={onCreate} type="primary">Criar Palete</Button>}
                                    </Space>
                                </Col>
                            </Row>
                            <Row nogutter>
                                <Col>
                                    <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                                        {(_step > 0) && <Row><Col style={{}}></Col></Row>}
                                        <Row nogutter>
                                            {_step == 0 && <Col>
                                                <PaletizacoesList noid showFilters={false} select header={false} edit={false} onSelectionChanged={onSelectSchema} domLayout={'autoHeight'} style={{ height: "auto" }}
                                                    baseFilters={{ ...parseFilter("pp.id", state.ordemFabrico?.paletizacao_id ? `in:${state.ordemFabrico?.paletizacao_id}` : `in:181,182`, { type: "number" }) }}
                                                />
                                            </Col>}
                                            {_step == 1 && <Col>
                                                <FormPaletizacao initialSchemaBobines={state.allSchemaBobines} select={{ enabled: true }} onSelectLevel={onSelectLevel} header={false} associate={false} edit={false} editItems={[2]} parameters={{ id: state.schema?.id }} />
                                            </Col>}
                                            {[2, 4].includes(_step) && <Col style={{}}>
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5px", backgroundColor: inputParameters.current?.backgroundColor, color: inputParameters.current?.color }}>
                                                    <div style={{ fontSize: "22px", fontWeight: 900 }}>{state?.palete?.nome}</div>
                                                    {[4].includes(_step) && <Button onClick={onPrint} icon={<PrinterOutlined />}>Imprimir Etiqueta</Button>}
                                                </div>
                                                {(!state.report.valid && state.report.list.length > 0) && <div style={{ textAlign: "center" }}><Button style={{ background: "#ff4d4f" }} icon={<UnorderedListOutlined />} onClick={onReportList} /></div>}
                                                <Pick
                                                    width="320px"
                                                    adjustWidth={40}
                                                    initialInputs={state.paleteRef}
                                                    disabled={submitting.state || _step == 4}
                                                    onInputChange={(v, i, st) => onInputChange("palete", v, i, st)}
                                                    popupValuePath="nome" 
                                                    selectorPopupComponent={<PaletesChoose closeOnSelect={true} select={true} header={false} />}
                                                    popupProps={{title:"Selecionar Palete"}}
                                                    // selectorPopup={{
                                                    //     payload: {
                                                    //         url: `${API_URL}/paletes/sql/`, primaryKey: "id", parameters: { method: "PaletesListV2" },
                                                    //         pagination: { enabled: true, page: 1, pageSize: 20 }, baseFilter: {}, sortMap: {}
                                                    //     },
                                                    //     dataGridProps: {
                                                    //         columnDefs: [
                                                    //             { colId: 'sgppl.nome', field: 'nome', headerName: 'Palete', width: 130, cellRenderer: (params) => <Value bold params={params} /> },
                                                    //         ],
                                                    //         filters: { toolbar: ["@columns"], more: [], no: [...Object.keys({})] }
                                                    //     },
                                                    //     popupProps: { title: "Paletes", width: "95%", type: "drawer" },
                                                    //     customSearch: <CustomSearchButton />
                                                    // }}
                                                    height="40px" rowNumberWidth={100} rowNumberFn={(index) => <span>Palete Ref.</span>} n={1} allowEmpty={true} ref={paleteRef} pattern={/^(IND|P|R|DM|H|S)\d{4}-\d{4}$/} duplicates={false} />
                                                <Pick initialInputs={clone(state.bobines)} disabled={submitting.state || _step == 4} onInputChange={(v, i, st) => onInputChange("bobines", v, i, st)} n={state.nBobines} ref={bobinesRef} pattern={/^\d{8}-\d{2,}-\d{2,}$/} duplicates={false} height={_step == 4 ? "65vh" : "75vh"} />
                                            </Col>}
                                            {_step == 3 && <Col>
                                                <WeighPalete form={form} validation={validation} />
                                            </Col>}
                                        </Row>
                                    </Container>
                                </Col>
                            </Row>
                        </Col >
                    </Row >
                </Container >}
        </Page.Ready>
    )

}