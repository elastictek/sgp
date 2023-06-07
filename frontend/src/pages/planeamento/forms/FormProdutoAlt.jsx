import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import moment from 'moment';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN, ENROLAMENTO_OPTIONS } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../../App";


const TitleForm = ({ ofabrico }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div><ExclamationCircleOutlined style={{ color: "#faad14" }} /></div>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 800 }}>Validar Ordem de Fabrico</div>
                <div style={{ color: "#1890ff" }}>{ofabrico}</div>
            </div>
        </div>
    );
}

const schema = (options = {}) => {
    return getSchema({
        produto_alt: Joi.string().label("Designação do Produto").required(),
        // artigo_formu: Joi.string().label("Fórmula").required(),
        // artigo_nw1: Joi.string().label("Nonwoven 1").required(),
        // typeofabrico: Joi.number().integer().min(0).max(2).label("Tipo Ordem de Fabrico").required(),
        // artigo_width: Joi.number().integer().min(1).max(5000).label("Largura").required(),
        // artigo_diam: Joi.number().integer().min(1).max(5000).label("Diâmetro").required(),
        // artigo_core: Joi.number().integer().valid(3, 6).label("Core").required(),
        // artigo_gram: Joi.number().integer().min(1).max(1000).label("Gramagem").required(),
        // artigo_thickness: Joi.number().integer().min(0).max(5000).label("Espessura").required()
    }, options).unknown(true);
}

export default ({ parameters, updateProdutoAlt, parentRef, closeSelf, permission }) => {
    const submitting = useSubmitting(true);
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });

    useEffect(() => {
        console.log(parameters);
        form.setFieldsValue({ produto_alt: parameters?.produto_alt });
        submitting.end();
    }, []);

    const onFinish = async () => {
        submitting.trigger();
        const values = form.getFieldsValue(true);
        const v = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
        let { errors, warnings, value, ...status } = getStatus(v);
        setFieldStatus({ ...status.fieldStatus });
        setFormStatus({ ...status.formStatus });

        if (errors === 0) {
            try {
                let response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "SaveProdutoAlt", ...values }, filter: { ...parameters } });
                if (response.data.status !== "error") {
                    updateProdutoAlt(values.produto_alt);
                    closeSelf();
                } else {
                    Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
                }
            } catch (e) {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            } finally {

            };
        }
        submitting.end();
    }

    return (
        <FormContainer id="LAY-PALT" schema={schema} fluid forInput={permission.isOk({ item: "planeamento", action: "requisitos" })} loading={submitting.state} wrapForm={true} form={form} onFinish={onFinish} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }}>
            <Row style={{}} gutterWidth={10}>
                <Col><Field required={true} name="produto_alt" label={{ text: "Designação do Produto" }}><Input size="small" /></Field></Col>
            </Row>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button disabled={submitting.state} type="primary" onClick={onFinish}>Registar</Button>
                    <Button onClick={closeSelf}>Fechar</Button>
                </Space>
            </Portal>}
        </FormContainer>
    );
}