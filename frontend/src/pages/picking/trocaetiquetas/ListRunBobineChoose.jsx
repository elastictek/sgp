import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle, Suspense } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL, DATE_FORMAT, DATETIME_FORMAT } from "config";
import { useDataAPI, parseFilter } from "utils/useDataAPIV4";
import { usePermission, Permissions } from "utils/usePermission";
import ToolbarTitle, { Title } from 'components/ToolbarTitleV3';
import loadInit from "utils/loadInitV3";
import BobinesChoose from '../BobinesChoose';
import { OPTIONS_TROCAETIQUETAS } from "components/TableV4/TableColumnsV4";
import { suppressKeyboardEvent, getCellFocus, refreshDataSource } from 'components/TableV4/TableV4';
import useModalApi from "utils/useModalApi";
import Portal from "components/portal";
import { useSubmitting } from "utils";
import { zIntervalDate } from "utils/schemaZodRules";
import { z } from "zod";
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import AlertsContainer from "components/FormFields/AlertsContainerV2";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Tabs } from "antd";
import { Field, Container as FormContainer, SelectField, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule } from 'components/FormFields';
import dayjs from 'dayjs';
import FormPrint from "../../commons/FormPrint";
import Page from 'components/FormFields/FormsV2';

const OPTIONS_SUBTYPE = Object.entries(OPTIONS_TROCAETIQUETAS).map(([value, { label }]) => ({ value: value, label }));

const title = "Troca de Etiquetas";
const subTitle = "2. Selecione a bobine...";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title, subTitle }) => {
    return (<ToolbarTitle disabled={loading} id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
        {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
    />);
}

const schema = z.object({
    artigo: z.object({
        cod: z.string({ description: "Artigo" }).min(1)
    }),
    cliente: z.object({
        BPCNUM_0: z.string({ description: "Cliente" }).min(1)
    }),
    data_imputacao: z.coerce.date({ description: "Data imputação" }).max(dayjs().subtract(1, 'day').toDate()),
    id: z.coerce.number({ description: "Tarefa" }).min(1),
    subtype: z.coerce.number({ description: "Tipo tarefa" }).min(1),
    bobine_id: z.coerce.number({ description: "Bobine" }).min(1),
})

const RunTask = ({ bobine, task, closeSelf, wndRef, refreshParentData, setTitle, setFormTitle, ...props }) => {
    const dataAPI = useDataAPI();
    const submitting = useSubmitting(true);
    const [formStatus, setFormStatus] = useState({});
    const modalApi = useModalApi() //not Required;

    useEffect(() => {
        /**IMPORTANT! when using Portal */
        submitting.end();
    }, [])

    const onFinish = async () => {
        submitting.trigger();

        const _bobine = { bobine_id: bobine.id };
        const _task = {
            id: task?.id,
            data_imputacao: task?.data_imputacao,
            artigo: { cod: task.artigo.cod },
            cliente: { BPCNUM_0: task?.cliente?.cod },
            subtype: task?.subtype?.value
        };

        const result = await dataAPI.safePost(`${API_URL}/bobines/sql/`, "TrocaEtiqueta", {
            parameters: _task,
            filter: _bobine,
            values: { ..._task, ..._bobine },
            schema,
            onPre: (p) => { }
        });
        result.onValidationFail((p) => { });
        result.onSuccess((p) => {
            refreshParentData();
        });
        result.onFail((p) => { });
        setFormStatus(result);
        submitting.end();
    }

    return (<>
        <Container>
            <AlertsContainer formStatus={formStatus} />
            {!formStatus?.success && <><Row style={{ marginBottom: "10px" }}>
                <Col>Troca de Etiqueta da bobine <b>{bobine.nome}</b></Col>
            </Row>
                <Row style={{ borderRadius: "5px", margin: "10px", fontSize: "18px", fontWeight: 700, textAlign: "center", color: "#003eb3", padding: "10px" }}>
                    <Col>
                        {task.subtype.label}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <ul>
                            <li>Cód.Artigo <b>{task.artigo.cod}</b></li>
                            <li>Des.Artigo <b>{task.artigo.des}</b></li>
                            <li>Cliente <b>{task.cliente.des}</b></li>
                            <li>Data imputação <b>{task.data_imputacao}</b></li>
                        </ul>
                    </Col>
                </Row>
            </>}
            {formStatus?.success &&
                <>
                    <Row style={{ marginBottom: "10px" }}>
                        <Col><Title text={<div style={{ fontWeight: 400 }}>Imprimir Etiquetas Bobine <b>{formStatus.response.data.nome}</b></div>} /></Col>
                    </Row>
                    <Row>
                        <Col><FormPrint closeParent={closeSelf} v={{ bobine: { id: formStatus.response.data.id, nome: formStatus.response.data.nome } }} /></Col>
                    </Row>
                </>
            }
            {(wndRef && !formStatus?.success) && <Portal elId={wndRef.current}>
                <Space>
                    <Button disabled={submitting.state} onClick={closeSelf}>Cancelar</Button>
                    <Button disabled={submitting.state} type="primary" onClick={onFinish}>Submeter</Button>
                </Space>
            </Portal>}
        </Container>

    </>
    );
}

export default ({ noid = false, defaultFilters = {}, baseFilters: _baseFilters, defaultSort = [], onClick, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const gridRef = useRef(); //Not Required
    const permission = usePermission({ name: "checklist" });
    const [form] = Form.useForm();
    const modalApi = useModalApi() //not Required;
    const inputParameters = useRef(loadInit({}, {}, { ...props?.parameters }, { ...location?.state }));

    useEffect(() => {
        form.setFieldsValue({
            id: inputParameters.current.id,
            nome: inputParameters.current.nome,
            subtype: { value: inputParameters.current.subtype, label: OPTIONS_TROCAETIQUETAS[inputParameters.current.subtype].label },
            data_imputacao: inputParameters.current.parameters.data_imputacao,
            artigo: { cod: inputParameters.current.parameters.artigo.cod, des: inputParameters.current.parameters.artigo.des },
            cliente: { cod: inputParameters.current.parameters.cliente.BPCNUM_0, des: inputParameters.current.parameters.cliente.BPCNAM_0 },
            lar: inputParameters.current.parameters.artigo.lar,
            core: inputParameters.current.parameters.artigo.core
        });
    }, []);

    const refreshData = () => {
        refreshDataSource(gridRef.current.api);
    }

    const onSelectionChanged = (rows) => {
        if (rows && rows.length > 0) {
            modalApi.setModalParameters({
                content: <RunTask bobine={{ id: rows[0].id, nome: rows[0].nome }} task={form.getFieldsValue(true)} refreshParentData={refreshData} />,
                closable: false,
                title: "Trocar Etiqueta",
                lazy: false,
                type: "modal",
                width: "700px",
                parameters: { /* ...getCellFocus(gridRef.current.api) */ }
            });
            modalApi.showModal();
        }
    }

    return (
        <Page.Ready ready={permission?.isReady}>
            <TitleForm auth={permission.auth} level={location?.state?.level} title={props?.title ? props.title : title} subTitle={props?.subTitle ? props.subTitle : subTitle} />
            <FormContainer fluid form={form} forInput={false} wrapForm={true} wrapFormItem={true} style={{ borderTop: "solid 1px #d9d9d9" }}>
                <Row style={{}} gutterWidth={10}>
                    <Col width={150}><Field name="nome" label={{ text: "Tarefa" }}><Input size="small" /></Field></Col>
                    <Col width={150}><Field name="subtype" label={{ text: "Tipo" }}><SelectField size="small" keyField="value" textField="label" data={OPTIONS_SUBTYPE} /></Field></Col>
                    <Col width={160}><Field name="data_imputacao" label={{ text: "Data Imputação" }}><DatePicker format={DATE_FORMAT} size="small" /></Field></Col>
                    <Col width={110}><Field name="lar" label={{ text: "Largura" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter="mm" /></Field></Col>
                    <Col width={110}><Field name="core" label={{ text: "Core" }}><InputNumber style={{ textAlign: "right" }} size="small" addonAfter="''" /></Field></Col>
                    <Col width={400}>
                        <Field name="artigo" label={{ text: "Artigo" }}>
                            <Selector size="small" keyField={["id"]} textField="des" detailText={r => r?.cod} style={{ fontWeight: 700 }} />
                        </Field>
                    </Col>
                    <Col width={400}>
                        <Field name="cliente" label={{ text: "Cliente" }}>
                            <Selector size="small" keyField={["cod"]} textField="des" detailText={r => r?.cod} style={{ fontWeight: 700 }} />
                        </Field>
                    </Col>
                </Row>
            </FormContainer>

            <BobinesChoose
                gridRef={gridRef}
                style={{ height: "70vh" }}
                noid={true}
                baseFilters={{
                    ...parseFilter("mb.recycle", `==0`, { type: "number" }),
                    ...parseFilter("mb.comp_actual", `>0`, { type: "number" }),
                    ...parseFilter("sgppl.disabled", `==0`, { type: "number" }),
                    ...parseFilter("sgppl.carga_id", `isnull`, { type: "number" }),
                    ...parseFilter("mb.estado", `==G`, { case: "s" }),
                    ...parseFilter("mb.lar", `==${location.state.parameters.artigo.lar}`, { type: "number" }),
                    ...parseFilter("mb.core", `==${location.state.parameters.artigo.core}`, { type: "number" })
                }}
                defaultSort={[{ column: "mb.timestamp", direction: "DESC" }]}
                onClick={onSelectionChanged}
            />
        </Page.Ready>
    );

}