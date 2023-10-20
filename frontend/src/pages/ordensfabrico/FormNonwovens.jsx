import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { uid } from 'uid';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, sleep } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch } from "antd";
const { TextArea } = Input;
// import ToolbarTitle from './commons/ToolbarTitle';
const { Title } = Typography;
import { json, excludeObjectKeys } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { InputNumberTableEditor, MateriasPrimasTableEditor, CubaTableEditor, DoserTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, OFabricoStatus } from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';
import IconButton from "components/iconButton";
import { MdAdjust, MdAssignmentReturned } from 'react-icons/md';
import { Nonwovens } from 'components/EditorsV3';
import Toolbar from 'components/toolbar';

const title = "Nonwovens";
const TitleForm = ({ data, onChange, level, auth, form }) => {
    return (<ToolbarTitle id={auth?.user} description={title} title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }} wrap="nowrap" nogutter>
                <Col xs='content' style={{}}><Row nogutter><Col title={title} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}><span style={{}}>{title}</span></Col></Row></Col>
                {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
            </Row>

        </Col>
    </>
    }
    />);
}

const useStyles = createUseStyles({});

const schema = (options = {}) => {
    return getSchema({
        "nwsup":
            Joi.alternatives(
                Joi.string(),
                Joi.object().keys({
                    ITMREF_0: Joi.string().label("Nonwoven superior").required()
                }).unknown(true)).label("Nonwoven superior").required(),
        "nwinf":
            Joi.alternatives(
                Joi.string(),
                Joi.object().keys({
                    ITMREF_0: Joi.string().label("Nonwoven inferior").required()
                }).unknown(true)).label("Nonwoven inferior").required(),
    }, options).unknown(true);
}

const loadNonwovens = async (params, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...params }, sort: [], parameters: { method: "GetNonwovens" }, signal });
    if (rows && rows.length > 0) {
        return json(rows[0].nonwovens);
    }
    return {};
}


export default ({ setFormTitle, enableAssociation = true, loadParentData, ...props }) => {
    const media = useContext(MediaContext);

    const permission = usePermission({ name: "ordemfabrico", item: "edit" });//Permissões Iniciais
    const [mode, setMode] = useState({ form: { edit: true, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});
    const [form] = Form.useForm();

    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: ``, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });
    const submitting = useSubmitting(true);

    // const [modalParameters, setModalParameters] = useState({});
    // const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
    //     const content = () => {
    //         switch (modalParameters.content) {
    //             case "ordensfabrico": return <Chooser parameters={modalParameters.parameters} />;
    //         }
    //     }
    //     return (
    //         <ResponsiveModal responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
    //             {content()}
    //         </ResponsiveModal>
    //     );
    // }, [modalParameters]);




    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, ["nonwovens_id", "cs_id", "audit_cs_id", "new", "type", "agg_of_id"]);
            inputParameters.current = paramsIn;
        }
        setFormDirty(false);
        if (inputParameters.current?.new) {
            form.setFieldsValue({});
        } else {
            const row = await loadNonwovens({ ...inputParameters.current }, signal);
            form.setFieldsValue({
                ...row,
                nwsup: { ITMREF_0: row?.nw_cod_sup, ITMDES1_0: row?.nw_des_sup },
                nwinf: { ITMREF_0: row?.nw_cod_inf, ITMDES1_0: row?.nw_des_inf }
            });
        }
        submitting.end();
    }


    const onSave = async (type) => {
        // // const rows = dataAPI.dirtyRows().map(({ id, group }) => ({ artigo_id: id, group }));
        submitting.trigger();
        let response = null;
        try {
            const values = form.getFieldsValue(true);
            const _values = schema().validate(values, { abortEarly: false, messages: validateMessages, context: {} });
            let { errors, warnings, value, ...status } = getStatus(_values);
            setFieldStatus({ ...status.fieldStatus });
            setFormStatus({ ...status.formStatus });
            if (errors == 0) {
                const _v = {
                    ...excludeObjectKeys(_values.value, ["nwsup", "nwinf"]),
                    nw_cod_inf: _values.value.nwinf.ITMREF_0,
                    nw_des_inf: _values.value.nwinf.ITMDES1_0,
                    nw_cod_sup: _values.value.nwsup.ITMREF_0,
                    nw_des_sup: _values.value.nwsup.ITMDES1_0
                }
                response = await fetchPost({
                    url: `${API_URL}/ordensfabrico/sql/`, filter: { ...inputParameters.current }, parameters: {
                        method: "SaveNonwovens", ..._v, type: inputParameters.current?.type,
                    }
                });
                if (response && response?.data?.status !== "error") {
                    openNotification(response?.data?.status, 'top', "Notificação", response?.data?.title, null);
                    if (loadParentData) {
                        loadParentData();
                    }
                } else {
                    openNotification("error", 'top', "Notificação", response?.data?.title, null);
                }
            }
        } catch (e) {
            console.log(e)
            openNotification("error", 'top', "Notificação", e.message, null);
        } finally {
            submitting.end();
        };
    }


    const onValuesChange = (changed, all) => {
        console.log(all)
        setFormDirty(true);
    }

    const onEditCancel = async () => {
        await loadData();
        return false;
    }

    return (
        <YScroll>
            {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            <FormContainer id="form" schema={schema} fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onValuesChange={onValuesChange} wrapFormItem={true} forInput={mode.form.edit} style={{ padding: "0px" }} alert={{ tooltip: true, pos: "none" }}>
                <Row>
                    <Col>
                        <Toolbar style={{ minHeight: "30px", background: "rgb(248, 249, 250)", borderRadius: "4px" }} right={formDirty && <Button disabled={submitting.state} type="primary" onClick={onSave}>Submeter</Button>} />
                    </Col>
                </Row>
                <Row gutterWidth={10}>
                    <Col xs={12} md={6} lg={4}>
                        <Nonwovens name="nwsup" allowClear label={{ enabled: true, text: "Nonwoven Superior" }} />
                    </Col>
                </Row>
                <Row gutterWidth={10}>
                    <Col xs={12} md={6} lg={4}>
                        <Nonwovens name="nwinf" allowClear label={{ enabled: true, text: "Nonwoven Inferior" }} />
                    </Col>
                </Row>
            </FormContainer>
        </YScroll>
    );


};