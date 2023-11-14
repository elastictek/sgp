import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import dayjs from 'dayjs';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken, serverPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { uid } from 'uid';
import { useDataAPI } from "utils/useDataAPIV3";
import Toolbar from "components/toolbar";
import { orderObjectKeys, json, isObjectEmpty, nullIfEmpty } from "utils/object";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll, getFloat } from "utils";
import Portal from "components/portal";
import { Button, Upload, message, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, TimePicker, Switch } from "antd";
const { Dragger } = Upload;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import { API_URL, ROOT_URL, DOWNLOAD_URL, DATE_FORMAT, DATETIME_FORMAT, CSRF, MAX_UPLOAD_SIZE, TIPOANEXOS_OF, MEDIA_URL } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Cores, FormulacaoPlanSelect } from 'components/EditorsV3';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, DatetimeField, TimeField, CortesField, Chooser, VerticalSpace, RowSpace, SwitchField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { ObsTableEditor } from 'components/TableEditorsV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { Core, EstadoBobines, Largura, Link, DateTime, RightAlign, LeftAlign, Favourite, IndexChange } from "components/TableColumns";
import { LeftToolbar, RightToolbar, Edit } from "./OrdemFabrico";
import { ImArrowDown, ImArrowUp } from 'react-icons/im';
import { MediaContext, AppContext } from 'app';
import { getInt } from 'utils/index';

const EDITKEY = "attachements";
const PERMISSION = { item: "edit", action: "attachements" };

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

const renderRowDetails = ({ data }) => {
    return (
        <div style={{ background: '#464d56', color: '#c5cae9', padding: 10 }}>
            <h3>Observações:</h3>
            <pre>
                {data?.observacoes}
            </pre>
        </div>
    );
};

const loadAttachments = async ({ aggid, draft_id, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "GetAttachements" }, filter: { aggid, draft_id }, sort: [], signal });
    return rows;
}

export const loadOrdemFabrico = async ({ draft_id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { draft_id }, sort: [], parameters: { method: "OrdensFabricoPlanGet", allowInElaboration: true }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows[0];
    }
    return {};
}

const StyledFile = styled.div`
    display:flex;
    flex-direction:row;
    margin:2px;
    font-size:11px;
    padding-bottom:2px;
    border-bottom:solid 1px #f5f5f5;
    align-items: center;

    &:hover,
    &:focus {
        background-color: #f5f5f5;
    }
    .itemtype{
        flex-basis: 180px;
	    flex-grow: 0;
	    flex-shrink: 0;
    }
    .itemacesso{
        flex-basis: 50px;
	    flex-grow: 0;
	    flex-shrink: 0;
    }
    .itemfile{
        flex:1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .itemfile span{
        color:#2f54eb;
        cursor:pointer;
        font-weight:700;
    }
    .itemremove{
        flex-basis: 30px;
        flex-grow: 0;
        flex-shrink: 0;
        cursor:pointer;
    }
    .itemremove span:hover{
        color:red;
    }
`;

const StyledDragger = styled(Dragger)`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    .ant-upload.ant-upload-drag{
        width: 80%;
        margin: 20px;
    }
    .ant-upload-list.ant-upload-list-picture{
        width: 100%;
        margin: 20px;
    }
    .ant-upload-list{
        width: 100%;
        border-radius: 2px;
        padding: 10px;
        /*border:solid 1px gray;*/
    }
`;

const File = ({ originNode, file, currFileList, onRemove, attachmentType, setAttachmentType, attachmentAcesso, setAttachmentAcesso }) => {

    const onTypeChange = (value, option) => {
        setAttachmentType(prev => ({ ...prev, [file.uid]: value }));
    }
    const onAcessoChange = (value) => {
        setAttachmentAcesso(prev => ({ ...prev, [file.uid]: value ? 1 : 0 }));
    }

    return (
        <>
            <div className="itemacesso">Global</div>
            <StyledFile>
                <div className="itemacesso"><Switch onChange={onAcessoChange} size='small' /></div>
                <div className="itemtype"><SelectField onChange={onTypeChange} defaultValue={TIPOANEXOS_OF[0].key} style={{ width: "170px" }} size="small" data={TIPOANEXOS_OF} keyField="value" textField="value"
                    optionsRender={(d, keyField, textField) => ({ label: d[textField], value: d[keyField] })}
                /></div>
                <div className="itemfile">{file.name}</div>
                <div className="itemremove" onClick={() => onRemove(file)}><DeleteOutlined /></div>
            </StyledFile>
        </>
    );
}

const AttachmentsList = ({ attachments, setLoading, loadData, permission, ordemFabrico }) => {
    const [changedTypes, setChangedTypes] = useState({});
    const [changedAcesso, setChangedAcesso] = useState({});

    const onRemove = (id, tipo_doc) => {
        setChangedTypes((prev) => {
            const newchanges = { ...prev }
            delete newchanges[id];
            return newchanges;
        });
        setChangedAcesso((prev) => {
            const newchanges = { ...prev }
            delete newchanges[id];
            return newchanges;
        });
        setLoading(true);
        serverPost({ url: `${API_URL}/ofattachmentschange/`, parameters: { type: "remove", id, tipo_doc, ordem_id: ordemFabrico.id } }).then(function (response) {
            loadData();
            console.log("data", response.data);
        }).catch(function (error) {
            message.error("Erro ao Remover Anexo!");
        }).finally(() => {
            setLoading(false);
        });
    }
    const onTypeChange = (id, value) => {
        setChangedTypes(prev => ({ ...prev, [id]: value }));
    }
    const onAcessoChange = (id, value) => {
        setChangedAcesso(prev => ({ ...prev, [id]: value ? 1 : 0 }));
    }
    const saveChanges = () => {
        setLoading(true);
        serverPost({ url: `${API_URL}/ofattachmentschange/`, parameters: { type: "changedtypes", changedTypes,changedAcesso } }).then(function (response) {
            console.log("data", response.data);
        }).catch(function (error) {
            message.error("Erro ao Alterar Anexos!");
        }).finally(() => {
            setLoading(false);
        });
    }

    const urlAttachemnt = (p) => {
        if (p.id === null) {
            return `${ROOT_URL}${MEDIA_URL}/${encodeURI(p.path)}`;
        } else {
            return `${ROOT_URL}${API_URL}${DOWNLOAD_URL}/?i=${p.of_id}&t=${encodeURI(p.tipo_doc)}&f=${encodeURI(p.path.split("/").slice(1).join('/'))}`;
        }
    }

    return (
        <>
            <Toolbar
                style={{ width: "100%" }}
                right={((permission.isOk(PERMISSION)) && (ordemFabrico?.ativa == 1 || ordemFabrico?.ofabrico_status == 1)) && <Button type="primary" disabled={(Object.keys(changedAcesso).length == 0 && Object.keys(changedTypes).length == 0) ? true : false} onClick={saveChanges}>Guardar Alterações</Button>}
            />
            <div className="itemacesso">Global</div>
            {attachments.map((v, i) => <StyledFile key={`attf-${v.id}-${i}`}>
                {v?.id ? <div className="itemacesso"><Switch disabled={(v?.id == null || !permission.isOk(PERMISSION) || !v.ativa) && true} onChange={(val, o) => onAcessoChange(v.id, val)} defaultChecked={getInt(v.tipo_acesso,0)==0 ? false : true} size='small' /></div> : <div className="itemacesso"></div>}
                <div className="itemtype"><SelectField disabled={(v?.id == null || !permission.isOk(PERMISSION) || !v.ativa) && true} onChange={(val, o) => onTypeChange(v.id, val)} defaultValue={v.tipo_doc} style={{ width: "170px" }} size="small" data={TIPOANEXOS_OF} keyField="value" textField="value"
                    optionsRender={(d, keyField, textField) => ({ label: d[textField], value: d[keyField] })}
                /></div>
                <a className="itemfile" href={urlAttachemnt(v)} target="_blank"><span>{v.path.split("/").pop()}</span></a>
                {((permission.isOk(PERMISSION)) && v.ativa == 1) && <div className="itemremove" onClick={() => onRemove(v.id, v.tipo_doc)}><DeleteOutlined /></div>}
            </StyledFile>
            )}
        </>
    );
}



export default ({ operationsRef, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);

    const permission = usePermission({ name: "ordemFabrico", permissions: props?.permissions });//Permissões Iniciais
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
    const dataAPIArtigos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];
    const [fileList, setFileList] = useState([]);
    const [attachmentType, setAttachmentType] = useState({});
    const [attachmentAcesso, setAttachmentAcesso] = useState({});
    const [attachments, setAttachments] = useState([]);
    const [ordemFabrico, setOrdemFabrico] = useState();


    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) { }
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

    useEffect(() => {
        setMode(v => ({ ...v, form: { ...v.form, edit: permission.isOk(PERMISSION) && props?.editParameters?.editKey === EDITKEY } }));
    }, [props?.editParameters?.editKey]);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        setFormDirty(false);
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
        }
        const o = await loadOrdemFabrico({ draft_id: inputParameters.current?.draft_id, signal });
        const a = await loadAttachments({ draft_id: inputParameters.current?.draft_id, signal });
        setAttachments(a);
        setOrdemFabrico(o);
        // form.setFieldsValue({ formulacao_plan: nullIfEmpty({ ...pickAll([{ formulacao_plan_id: "plan_id" }, { fplan_designacao: "designacao" }, { fplan_idx: "idx" }, { fplan_cliente_nome: "cliente_nome" }, { fplan_group_name: "group_name" }, { fplan_subgroup_name: "subgroup_name" }], inputParameters.current) }) });
        // setFormulacao({ ...inputParameters.current, tstamp: Date.now() });
        submitting.end();
    }

    const onValuesChange = async (changedValues, values) => {
        // if ("formulacao_plan" in changedValues) {
        //     if (values?.formulacao_plan?.id){
        //         setFormulacao({ data: null, formulacao_id: values?.formulacao_plan?.id, tstamp: Date.now() });
        //     }
        //     //console.log(changedValues)
        //     //form.setFieldsValue("YYYY", null);
        // }
        // if (props?.onValuesChange) {
        //     props?.onValuesChange(changedValues, values);
        // }
    }

    const onSave = async () => {
        // let response = null;
        // try {
        //     response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...pickAll(["cs_id", "formulacao_id", "agg_of_id"], inputParameters.current) }, parameters: { method: "SaveFormulacao", formulacao_plan: form.getFieldValue("formulacao_plan") } });
        //     if (response?.data?.status !== "error") {
        //         loadData();
        //         props.loadParentData();
        //         openNotification(response?.data?.status, 'top', "Notificação", response?.data?.title);
        //     } else {
        //         openNotification(response?.data?.status, 'top', "Notificação", response?.data?.title, null);
        //     }
        // }
        // catch (e) {
        //     console.log(e)
        //     openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        // }
    }



    const onChange = ({ newFileList }) => {
        //setFileList(newFileList);
    };


    const beforeUpload = (file, fl) => {
        const flst = [];
        const filesType = {};
        const filesAcesso = {};
        for (const f of fl) {
            const isSize = f.size / 1024 / 1024 < MAX_UPLOAD_SIZE;
            if (!isSize) {
                message.error(`O ficheiro tem de ser inferior a ${MAX_UPLOAD_SIZE}MB!`);
            } else {
                if (f.uid) {
                    filesType[f.uid] = TIPOANEXOS_OF[0].key;
                    filesAcesso[f.uid] = 0;
                }
                flst.push(f);
            }
        }
        setAttachmentType(prev => ({ ...prev, ...filesType }));
        setAttachmentAcesso(prev => ({ ...prev, ...filesAcesso }));
        setFileList([...fileList, ...flst]);
        return false;
    }

    const onRemove = (file) => {
        setAttachmentType((prev) => {
            const newtypes = { ...prev }
            delete newtypes[file.uid];
            return newtypes;
        });
        setAttachmentAcesso((prev) => {
            const newacessos = { ...prev }
            delete newacessos[file.uid];
            return newacessos;
        });
        setFileList(prev => {
            const index = prev.indexOf(file);
            const newFileList = prev.slice();
            newFileList.splice(index, 1);
            return newFileList;
        });
    }

    const handleUpload = () => {
        const { ofid, draft_id } = inputParameters.current;
        const formData = new FormData();
        formData.append("of_id", ofid);
        formData.append("tempof_id", draft_id);

        fileList.forEach(file => {
            formData.append(file.uid, file);
            formData.append(`${file.uid}_type`, attachmentType[file.uid], attachmentAcesso[file.uid]);
        });

        submitting.trigger();

        serverPost({ url: `${API_URL}/ofupload/`, parameters: formData, headers: { "Content-type": "multipart/form-data" } }).then(function (response) {
            message.success(response.data.title);
            submitting.end();
        }).catch(function (error) {
            message.error("Erro ao submeter os Ficheiros!");
            console.log(error);
        }).finally(() => {
            loadData();
        });
    };

    return (
        <>
            <FormContainer id="LAY-OFFL" fluid loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} /* onFinish={onFinish} */ onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={false} alert={{ tooltip: true, pos: "none" }}>
                <Row>
                    <Col>
                        <AttachmentsList attachments={attachments} setLoading={(v) => v ? submitting.trigger() : submitting.end()} loadData={loadData} permission={permission} ordemFabrico={ordemFabrico} />
                    </Col>
                </Row>
                {((permission.isOk(PERMISSION)) && (ordemFabrico?.ativa == 1 || ordemFabrico?.ofabrico_status == 1)) && <>
                    <Row>
                        <Col>
                            <StyledDragger
                                method='post'
                                action={`${API_URL}/ofupload/`}
                                headers={{ "X-CSRFToken": CSRF }}
                                withCredentials={true}
                                fileList={fileList}
                                onChange={onChange}
                                maxCount={10}
                                beforeUpload={beforeUpload}
                                multiple
                                onRemove={onRemove}
                                itemRender={(originNode, file, currFileList) => (
                                    <File originNode={originNode} file={file} currFileList={currFileList} onRemove={onRemove} attachmentType={attachmentType} setAttachmentType={setAttachmentType} attachmentAcesso={attachmentAcesso} setAttachmentAcesso={setAttachmentAcesso} />
                                )}
                            >
                                <div className="ant-upload-drag-icon">
                                    <InboxOutlined style={{ /* color: "green" */ }} />
                                </div>
                                <div className="ant-upload-text">Arraste os Ficheiros a submeter</div>
                            </StyledDragger>
                        </Col>
                    </Row>
                    <Row>
                        <Col></Col>
                        <Col xs="content"><Button
                            type="primary"
                            onClick={handleUpload}
                            disabled={fileList.length === 0}
                            loading={submitting.state}
                            style={{ marginTop: 16 }}
                        >
                            {submitting.state ? 'A submeter...' : 'Submeter'}
                        </Button></Col></Row>
                </>}
            </FormContainer>
        </>
    )

}