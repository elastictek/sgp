import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { uid } from 'uid';
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import Toolbar from "components/toolbar";
import { orderObjectKeys, json, isObjectEmpty, nullIfEmpty } from "utils/object";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll, getFloat } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, TimePicker } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, TIME_FORMAT, ENROLAMENTO_OPTIONS } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Cores, CortesPlanSelect } from 'components/EditorsV3';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, DatetimeField, TimeField, CortesField, Chooser, VerticalSpace, RowSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { ObsTableEditor } from 'components/TableEditorsV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { Core, EstadoBobines, Largura, Link, DateTime, RightAlign, LeftAlign, Favourite, IndexChange } from "components/TableColumns";
import { LeftToolbar, RightToolbar, Edit, loadEstadoProducao } from "./OrdemFabrico";
import { estadoProducaoData } from "../producao/WidgetEstadoProducao";
import OrdemFabricoBoxes from "../producao/OrdemFabricoBoxes";
import { ImArrowDown, ImArrowUp } from 'react-icons/im';
import { MediaContext, AppContext } from 'app';




const EDITKEY = "report";
const PERMISSION = { item: "view", action: "report" };

const schema = (options = {}) => {
    return getSchema({
        /* xxxx: Joi.any().label("xxxxx").required()*/
    }, options).unknown(true);
}

const ToolbarTable = ({ form, modeEdit, allowEdit, submitting, changeMode, parameters, permission }) => {
    const navigate = useNavigate();

    const onChange = (v, field) => {


    }

    const leftContent = (<>
        {/* <Space>
            {modeEdit?.formPalete && <Button disabled={(!allowEdit.formPalete || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={()=>changeMode('formPalete')} />}
            {!modeEdit?.formPalete && <Button disabled={(!allowEdit.formPalete || submitting.state)} icon={<EditOutlined />} onClick={()=>changeMode('formPalete')}>Editar</Button>}
        </Space> */}
        <LeftToolbar permission={permission} />
    </>);

    const rightContent = (
        <Space>
            <RightToolbar permission={permission} bobinagem={{ id: parameters?.bobinagem?.id, nome: parameters?.bobinagem?.nome }} />
        </Space>
    );
    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}

export default ({ operationsRef, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);

    const permission = usePermission({ permissions: props?.permissions });//Permissões Iniciais
    const [mode, setMode] = useState({ form: { edit: false, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});

    const classes = useStyles();
    const [form] = Form.useForm();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const [ofs, setOfs] = useState([]);
    const submitting = useSubmitting(true);
    const primaryKeys = [];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                //case "formulacao": return <FormFormulacao enableAssociation={modalParameters?.enableAssociation} postProcess={modalParameters?.postProcess} parameters={modalParameters.parameters} />
            }
        }
        return (
            <ResponsiveModal lazy={modalParameters?.lazy} responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, [props?.parentUpdated]);

    /*     useEffect(() => {
            setMode(v => ({ ...v, form: { ...v.form, edit: permission.isOk(PERMISSION) && props?.editParameters?.editKey === EDITKEY } }));
        }, [props?.editParameters?.editKey]); */

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        setFormDirty(false);
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
        }
        const _data = await loadEstadoProducao(inputParameters.current.agg_of_id, inputParameters.current.ofabrico_sgp);
        const v = estadoProducaoData({ data: _data });
        setOfs(v.ofs);
        dataAPI.setData({ rows: v.rows, total: v.total });
        submitting.end();
    }

    return (
        <>
            <ToolbarTable {...props} parameters={inputParameters.current} submitting={submitting} />
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <FormContainer id="LAY-REPORT" fluid loading={submitting.state} /* wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} */ /* onFinish={onFinish} */ /* onValuesChange={onValuesChange} */ /* schema={schema} wrapFormItem={true} */ forInput={false} alert={{ tooltip: true, pos: "none" }}>
                <Row nogutter>
                    <Col>
                        <OrdemFabricoBoxes onTogglePaletes={()=>{}} paletes={[]} dataAPI={dataAPI} height="50vh" />
                    </Col>
                </Row>
                {(operationsRef && props?.activeTab == '11') && <Portal elId={operationsRef.current}>
                    <></>
                    {/* <Edit permissions={permission} {...PERMISSION} editable={props?.editParameters?.isEditable(false)} {...props?.editParameters} resetData={loadData} /> */}
                </Portal>
                }

            </FormContainer>
        </>
    )

}