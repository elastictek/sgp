import React, { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { useSubmitting } from "utils";
import { json } from "utils/object";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import Reports, { downloadReport } from "components/DownloadReports";
import { API_URL } from "config";
import { parseFilter, useDataAPI } from "utils/useDataAPIV4";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, AutoComplete, Checkbox } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Table from 'components/TableV3';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN, MODO_EXPEDICAO } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer } from 'components/FormFields/FormsV2';
import { FormPrint, printersList } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";

export default ({ extraRef, wndRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [validation, setValidation] = useState({});
    const classes = useStyles();
    const [form] = Form.useForm();
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});
    const dataAPI = useDataAPI();
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "ordemfabrico" });

    const [state, setState] = useState({ produtos: [], cargas: [] });
    const carga = Form.useWatch('carga', form);

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, { ...props?.parameters }, { ...location?.state }, null);
            inputParameters.current.eef = paramsIn?.eef;
            inputParameters.current.report = paramsIn?.report;
        }
        const { eef } = inputParameters.current;
        if (eef) {

            const result = await dataAPI.safePost(`${API_URL}/cargas/sql/`, "CargasLookup", {
                notify: ["run_fail", "fatal"], filter: {
                    ...parseFilter("pc.eef", `==${eef}`)
                }
            });
            if (result.success) {
                const _cargas = result.response?.rows;
                setState(prev => ({ ...prev, cargas: _cargas }));
                form.setFieldsValue({
                    carga: { value: _cargas[0].id, label: _cargas[0].carga },
                    produto: json(_cargas[0].produto, [])?.[0],
                    matricula: _cargas[0].matricula || "",
                    matricula_reboque: _cargas[0].matricula_reboque || "",
                    modo_exp: _cargas[0].modo_exp || "",
                    data_producao: _cargas[0].data_producao || 0,
                    po_cliente: _cargas[0].po_cliente || ""
                });
            }
        }
        setFormDirty(false);
        submitting.end();
    }




    const onPrint = async () => {
        submitting.trigger();
        if (inputParameters.current.report) {
            const values = form.getFieldsValue(true);
            const _carga = state.cargas.find(v => v.id == values.carga.value);
            const dataexport = {
                ...inputParameters.current.report,
                "conn-name": "PG-SGP-GW",
                "data": {
                    "TITLE": "PACKING LIST",
                    "PRODUCT_ID": values.produto,
                    "CONTAINER": values.matricula,
                    "CONTAINER-TRAILER": values.matricula_reboque,
                    "MODO-EXP": values.modo_exp,
                    "CARGA_ID": values.carga.value,
                    "PRF_COD": _carga.prf,
                    "ORDER_COD": _carga.eef,
                    "PO_COD": values.po_cliente,
                    "DATES": values.data_producao
                }
            };
            await dataAPI.safePost(`${API_URL}/cargas/sql/`, "UpdateCargaPL", { notify:["run_fail","fatal"], filter: { carga_id: values.carga.value }, parameters: { ...values } });
            await downloadReport({ dataAPI, url: `${API_URL}/print/sql/`, method: "ExportFile", type: { key: inputParameters.current.report.export }, dataexport, limit: 5000 });
            submitting.end();
        }
    }

    const cargas = useMemo(() => {
        return state.cargas.map(v => ({ value: v.id, label: v.carga }));
    }, [state.cargas]);

    const options = useMemo(() => {
        return {
            produtos: [...new Set(json(state.cargas?.find(v => v.id == carga.value)?.produto, []))].map(v => ({ value: v }))
        };
    }, [carga]);


    return (
        <YScroll>
            <FormContainer fluid wrapFormItem={true} validation={validation} forInput={carga?.value && permission.isOk({ item: "packingList" })} loading={submitting.state} wrapForm={true} form={form}>
                <Row style={{ justifyContent: "center" }} nogutter>
                    <Col>
                        <Field name="produto" label={{ enabled: true, text: "Produto" }}>
                            <AutoComplete style={{ width: "100%" }} options={options?.produtos} />
                        </Field>
                    </Col>
                </Row>
                <Row style={{ justifyContent: "center" }} nogutter>
                    <Col><Field name="matricula" label={{ enabled: true, text: "Container" }}><Input style={{ width: '100%' }} /></Field></Col>
                </Row>
                <Row style={{ justifyContent: "center" }} nogutter>
                    <Col><Field name="matricula_reboque" label={{ enabled: true, text: "Trailer Container" }}><Input style={{ width: '100%' }} /></Field></Col>
                </Row>
                <Row style={{ justifyContent: "center" }} nogutter>
                    <Col><Field name="modo_exp" label={{ enabled: true, text: "Modo Expedição" }}><Input style={{ width: '100%' }} /></Field></Col>
                    <Col><Field name="po_cliente" label={{ enabled: true, text: "PO Cliente" }}><Input style={{ width: '100%' }} /></Field></Col>
                </Row>
                <Row style={{ justifyContent: "center" }} nogutter>
                    <Col><Field name="data_producao" label={{ enabled: true, text: "Data Produção/Validade" }}><Checkbox /></Field></Col>
                </Row>
                <Row style={{ justifyContent: "center" }} nogutter>
                    <Col><Field name="carga" label={{ enabled: true, text: "Carga" }}>
                        <Select style={{ width: '100%' }} labelInValue options={cargas} />
                    </Field>
                    </Col>
                </Row>
            </FormContainer>
            {wndRef && <Portal elId={wndRef.current}>
                {(carga?.value && permission.isOk({ item: "packingList" })) && <Space>
                    <Button disabled={submitting.state} type="primary" onClick={onPrint}>Download</Button>
                </Space>}
            </Portal>
            }
        </YScroll>
    )

}