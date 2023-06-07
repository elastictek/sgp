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
import { Field, Container as FormContainer, SubContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace, InputNumberField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../../App";
import FormProdutoAlt from './FormProdutoAlt';
import { schemaRequirements as schema} from './FormOrdemFabrico';


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




export default ({ parameters, extraRef, closeSelf, loadParentData, form, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    //const permission = usePermission({ allowed: { producao: 100, planeamento: 100 } });//Permissões Iniciais
    //const [allowEdit, setAllowEdit] = useState({ form: false, datagrid: false });//Se tem permissões para alterar (Edit)
    //const [modeEdit, setModeEdit] = useState({ form: false, datagrid: false }); //Se tem permissões para alternar entre Mode Edit e View
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const dataAPIArtigos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "ordemfabrico" });
    const [clienteExists, setClienteExists] = useState(false);
    const primaryKeys = [];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "produtoalt": return <FormProdutoAlt updateProdutoAlt={updateProdutoAlt} parameters={modalParameters.parameters} permission={permission} />;
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
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal } = {}) => {
        //form.setFieldsValue({});
        submitting.end();
    }

    const updateProdutoAlt = (v) => {
        form.setFieldsValue({ produto_alt: v, produto_cod: v });
    }
    const changeProdutoAlt = () => {
        const values = form.getFieldsValue(["produto_alt", "artigo_id"]);
        const cliente_id = parameters?.cliente_id;
        if (cliente_id && values?.artigo_id) {
            setModalParameters({ content: "produtoalt", height: 180, width: 450, type: "modal", updateProdutoAlt, title: "Definir Nome Alternativo do Produto", /* loadData: () => dataAPI.fetchPost() */ parameters: { ...values, cliente_id } });
            showModal();
        }
    }

    return (
        <YScroll>
            <SubContainer fluid schema={schema} forInput={permission.isOk({ item: "planeamento", action: "requisitos" })} loading={submitting.state}>

                <HorizontalRule title="1. Artigo" description={<a onClick={changeProdutoAlt}>{form.getFieldValue("produto_cod")}</a>} />
                <Row style={{}} gutterWidth={10}>
                    <Col width={150}><Field forInput={false} required={false} label={{ text: "Gtin" }} name="artigo_gtin"><Input size="small" /></Field></Col>
                </Row>
                <Row style={{}} gutterWidth={10}>
                    <Col width={150}><Field forInput={false} required={false} label={{ text: "Largura" }} name="artigo_width"><InputNumber size="small" addonAfter={<b>mm</b>} maxLength={4} /></Field></Col>
                    <Col width={150}><Field forInput={false} required={false} label={{ text: "Diâmetro" }} name="artigo_diam"><InputNumber size="small" addonAfter={<b>mm</b>} maxLength={4} /></Field></Col>
                    <Col width={150}><Field forInput={false} required={false} label={{ text: "Core" }} name="artigo_core"><InputNumber size="small" addonAfter={<b>''</b>} maxLength={1} /></Field></Col>
                    <Col width={150}><Field forInput={false} required={false} label={{ text: "Gramagem" }} name="artigo_gram"><InputNumber size="small" addonAfter={<b>gsm</b>} maxLength={4} /></Field></Col>
                    <Col width={150}><Field forInput={false} required={false}
                        label={{
                            text: <Tooltip title="A espessura é usada como valor de referência, na conversão de metros&#xB2; -> metros lineares." color="blue">
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "3px" }}>Espessura<InfoCircleOutlined style={{ color: "#096dd9" }} /></div>
                            </Tooltip>
                        }}
                        name="artigo_thickness">
                        <InputNumber size="small" addonAfter={<b>&#x00B5;</b>} maxLength={4} />
                    </Field></Col>
                </Row>
                <VerticalSpace />
                <HorizontalRule title="2. Planificação" />
                <Row style={{}} gutterWidth={10}>
                    <Col width={180}><Field required={true} label={{ text: "Data Prevista Início" }} name="start_prev_date"><DatePicker showTime size="small" format={DATETIME_FORMAT} /></Field></Col>
                    <Col width={180}><Field required={true} label={{ text: "Data Prevista Fim" }} name="end_prev_date"><DatePicker showTime size="small" format={DATETIME_FORMAT} /></Field></Col>
                </Row>
                <VerticalSpace />
                <HorizontalRule title="3. Amostragem, Enrolamento e Observações" />
                <VerticalSpace />
                <Row style={{}} gutterWidth={10}>
                    <Col width={280}>
                        <Row style={{}} gutterWidth={10}>
                            <Col width={150}><Field name="sentido_enrolamento" label={{ enabled: true, text: "Sentido Enrolamento" }}>
                                <SelectField size="small" data={ENROLAMENTO_OPTIONS} keyField="value" textField="label" optionsRender={(d, keyField, textField) => ({ label: d[textField], value: d[keyField] })} />
                            </Field></Col>
                            <Col width={120}><Field label={{ text: "Amostragem" }} name="amostragem"><InputNumber style={{width:"100%"}} size="small" min={0} max={100} /></Field></Col>
                        </Row>
                    </Col>
                    <Col md={12} lg={6}><Field required={false} label={{ text: "Observações" }} name="observacoes"><TextArea autoSize={{ minRows: 4, maxRows: 6 }} allowClear maxLength={3000} /></Field></Col>
                </Row>
            </SubContainer>
        </YScroll>
    )

}