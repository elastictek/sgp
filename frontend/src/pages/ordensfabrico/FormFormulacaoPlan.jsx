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
import loadInit, { fixRangeDates, newWindow } from "utils/loadInitV3";
import { uid } from 'uid';
import { API_URL,ROOT_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import Toolbar from "components/toolbar";
import { orderObjectKeys, json } from "utils/object";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll, getFloat } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, TimePicker } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles } from 'components/TableV3';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, TIME_FORMAT, ENROLAMENTO_OPTIONS } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Cores } from 'components/EditorsV3';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, DatetimeField, TimeField, CortesField, Chooser } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { ObsTableEditor } from 'components/TableEditorsV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { Core, EstadoBobines, Largura, Link, DateTime, RightAlign, LeftAlign, Favourite, IndexChange, TextAreaViewer } from "components/TableColumns";
import { LeftToolbar, RightToolbar, Edit } from "./OrdemFabrico";
import { ImArrowDown, ImArrowUp } from 'react-icons/im';
import { MediaContext, AppContext } from 'app';
import FormulacaoReadOnly from '../formulacao/FormulacaoReadOnly';
const FormFormulacao = React.lazy(() => import('../formulacao/FormFormulacao'));

const EDITKEY = "formulacao_plan";
const PERMISSION = { item: "edit", action: "formulacao_plan" };

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

export const loadFormulacaoPlan = async ({ agg_of_id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { agg_of_id }, sort: [], parameters: { method: "FormulacaoPlanList" }, signal });
    if (rows && rows.length > 0) {
        return rows;
    }
    return [];
}

export default ({ operationsRef, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);

    const permission = usePermission({ permissions: props?.permissions });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: false, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const inputParameters = useRef({});
    const tableCls = useTableStyles();

    const classes = useStyles();
    const [form] = Form.useForm();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ payload: { primaryKey: "id", parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "formulacoes": return <Chooser parameters={modalParameters.parameters} />;
                case "formulacao": return <FormFormulacao parameters={modalParameters.parameters} />;
                //case "palete": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
                case "textarea": return <TextAreaViewer parameters={modalParameters.parameters} />;
                // case "parameters": return <LabArtigoSpecsParametersList parameters={modalParameters.parameters} />;
                // case "load": return <LoadEssay parameters={modalParameters.parameters} />;
                //case "paletesstock": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal lazy={modalParameters?.lazy} responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    const onOpenFormulacao = (e,formulacao_id) => {
        e.stopPropagation();
        newWindow(`${ROOT_URL}/app/ofabrico/formulacaoreadonly`,{formulacao_id},"formulacao");
        //setModalParameters({ content: "formulacao", type: "drawer", width: "95%", title: "Formulação", push: false, loadData: () => dataAPI.fetchPost(), parameters: { ...formulacao_id ? { formulacao_id } : { new: true } } });
        //showModal();
    }
    const onSelectFormulacao = () => {
        const _filter = { fproduto_id: props.parameters.produto_id };
        setModalParameters({
            content: "formulacoes", responsive: true, type: "drawer", width: "85%", title: "Formulações disponíveis", push: false, loadData: () => { }, parameters: {
                offsetHeight: "200px",
                multipleSelection: true,
                payload: { payload: { url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "id", parameters: { method: "FormulacoesAvailableList" }, pagination: { enabled: true, pageSize: 20 }, baseFilter: _filter, sort: [] } },
                toolbar: true,
                pagination: true,
                columns: [
                    ...(true) ? [{ name: 'designacao', header: 'Designação', userSelect: true, defaultLocked: true, defaultWidth: 390, render: ({ data }) => <Link onClick={(e) => onOpenFormulacao(e,data?.id)} /* onClick={() => navigate('/app/ofabrico/formulacao', { state: { formulacao_id: data?.id, tstamp: Date.now() } })} */ value={data?.designacao} /> }] : [],
                    ...(true) ? [{ name: 'group_name', header: 'Grupo', userSelect: true, defaultLocked: false, defaultWidth: 170 }] : [],
                    ...(true) ? [{ name: 'subgroup_name', header: 'SubGrupo', userSelect: true, defaultLocked: false, defaultWidth: 170 }] : [],
                    ...(true) ? [{ name: 'versao', header: 'Versão', userSelect: true, defaultLocked: false, defaultWidth: 90, render: (p) => <div style={{}}>{p.data?.versao}</div> }] : [],
                    ...(true) ? [{ name: 'cliente_nome', header: 'Cliente', userSelect: true, defaultLocked: false, defaultWidth: 190, render: (p) => <div style={{}}>{p.data?.cliente_nome}</div> }] : [],
                    ...(true) ? [{ name: 'produto_cod', header: 'Produto', userSelect: true, defaultLocked: false, defaultWidth: 190, render: (p) => <div style={{}}>{p.data?.produto_cod}</div> }] : [],
                    ...(true) ? [{ name: 'cod', header: 'Artigo', userSelect: true, defaultLocked: false, defaultWidth: 170, render: (p) => <div style={{}}>{p.data?.cod}</div> }] : [],
                    ...(true) ? [{ name: 'des', header: 'Artigo Des.', userSelect: true, defaultLocked: false, defaultWidth: 170, render: (p) => <div style={{}}>{p.data?.des}</div> }] : [],
                    ...(true) ? [{ name: 'reference', header: 'Referência', userSelect: true, defaultLocked: false, width: 90, render: ({ data }) => <Favourite value={data?.reference} /> }] : [],
                    ...(true) ? [{ name: 'created_date', header: 'Data Criação', userSelect: true, defaultLocked: false, minWidth: 170, render: (p) => <div style={{}}>{dayjs(p.data?.created_date).format(DATETIME_FORMAT)}</div> }] : [],
                    ...(true) ? [{ name: 'updated_date', header: 'Data Alteração', userSelect: true, defaultLocked: false, minWidth: 170, render: (p) => <div style={{}}>{dayjs(p.data?.updated_date).format(DATETIME_FORMAT)}</div> }] : []
                ],
                onSelect: async ({ data, rows, close }) => {
                    const _current = dataAPI.getData().rows.map(v => v?.id);
                    const idxstart = _current.length;
                    const _rows = rows.map((r, idx) => ({ ...r, idx: idxstart + idx + 1/* , [dataAPI.getPrimaryKey()]: `id_${uid(4)}`  */ }));
                    dataAPI.addRows(_rows);
                    dataAPI.setAction("edit", true);
                    dataAPI.update(true);
                },
                filters: { /* flote: { type: "any", width: 150, text: "Palete", autoFocus: true } */ }
            },

        });
        showModal();
    }

    const groups = [/*{ name: 'name', header: 'Header', headerAlign: "center" }*/]

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    useEffect(() => {
        setMode(v => ({ ...v, datagrid: { ...v.datagrid, edit: permission.isOk(PERMISSION) && props?.editParameters?.editKey === EDITKEY } }));
    }, [props?.editParameters?.editKey]);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
        }
        const _rows = await loadFormulacaoPlan({ agg_of_id: inputParameters.current.agg_of_id }, signal);
        dataAPI.setData({ rows: _rows, total: _rows.length });
        submitting.end();
    }


    const rowClassName = ({ data }) => {
        // if () {
        //     return tableCls.error;
        // }
    }
    const columnEditable = (v, { data, name }) => {
        if (["observacoes"].includes(name) && mode.datagrid.edit) {
            return true;
        }
        return false;
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        // if (dataAPI.getFieldStatus(data[dataAPI.getPrimaryKey()])?.[name]?.status === "error") {
        //     return tableCls.error;
        // }
        if (["observacoes"].includes(name) && mode.datagrid.edit) {
            return tableCls.edit;
        }
    };

    const columns = [
        ...(true) ? [{ name: 'idx', header: 'Index', headerAlign: "center", userSelect: true, defaultLocked: true, defaultWidth: 70, render: ({ data, cellProps }) => <IndexChange onDelete={onDelete} onUp={onUp} onDown={onDown} value={data?.idx} modeEdit={mode.datagrid.edit} allowDelete cellProps={cellProps} /> }] : [],
        ...(true) ? [{ name: 'versao', header: 'Versão', headerAlign: "center", userSelect: true, defaultLocked: true, defaultWidth: 90, render: (p) => <div style={{}}>{p.data?.versao}</div> }] : [],
        ...(true) ? [{ name: 'designacao', header: 'Designação', headerAlign: "center", userSelect: true, defaultLocked: true, defaultWidth: 390, render: ({ data }) => <Link onClick={(e) => onOpenFormulacao(e,data?.id)} /* onClick={() => navigate('/app/ofabrico/formulacao', { state: { formulacao_id: data?.id, tstamp: Date.now() } })} */ value={data?.designacao} /> }] : [],
        ...(true) ? [{ name: 'group_name', header: 'Grupo', headerAlign: "center", userSelect: true, defaultLocked: false, defaultWidth: 170 }] : [],
        ...(true) ? [{ name: 'subgroup_name', header: 'SubGrupo', headerAlign: "center", userSelect: true, defaultLocked: false, defaultWidth: 170 }] : [],
        ...(true) ? [{ name: "observacoes", header: "Observações", headerAlign: "center", userSelect: true, defaultLocked: false, defaultWidth: 420, editable: columnEditable, renderEditor: (props) => <ObsTableEditor dataAPI={dataAPI} {...props} />, cellProps: { className: columnClass } }] : [],
        ...(true) ? [{ name: 'cliente_nome', header: 'Cliente', headerAlign: "center", userSelect: true, defaultLocked: false, defaultWidth: 220, render: (p) => <div style={{}}>{p.data?.cliente_nome}</div> }] : [],
        ...(true) ? [{ name: 'produto_cod', header: 'Produto', headerAlign: "center", userSelect: true, defaultLocked: false, defaultWidth: 220, render: (p) => <div style={{}}>{p.data?.produto_cod}</div> }] : [],
        ...(true) ? [{ name: 'cod', header: 'Artigo', headerAlign: "center", userSelect: true, defaultLocked: false, defaultWidth: 170, render: (p) => <div style={{}}>{p.data?.cod}</div> }] : [],
        ...(true) ? [{ name: 'des', header: 'Artigo Des.', headerAlign: "center", userSelect: true, defaultLocked: false, defaultWidth: 170, render: (p) => <div style={{}}>{p.data?.des}</div> }] : [],
        ...(true) ? [{ name: 'reference', header: 'Referência', headerAlign: "center", userSelect: true, defaultLocked: false, width: 90, render: ({ data }) => <Favourite value={data?.reference} /> }] : [],
        ...(true) ? [{ name: 'created_date', header: 'Data Criação', headerAlign: "center", userSelect: true, defaultLocked: false, minWidth: 170, render: (p) => <div style={{}}>{dayjs(p.data?.created_date).format(DATETIME_FORMAT)}</div> }] : [],
        ...(true) ? [{ name: 'updated_date', header: 'Data Alteração', headerAlign: "center", userSelect: true, defaultLocked: false, minWidth: 170, render: (p) => <div style={{}}>{dayjs(p.data?.updated_date).format(DATETIME_FORMAT)}</div> }] : []
    ];

    const postProcess = async (dt, submitting) => { }

    const onDelete = async (rowIndex) => {
        const _rows = dataAPI.deleteRowByIndex(rowIndex, "idx");
    }
    const onUp = async (rowIndex) => {
        dataAPI.moveRowUp(rowIndex, "idx");
    }
    const onDown = async (rowIndex) => {
        dataAPI.moveRowDown(rowIndex, "idx");
    }

    const onEditComplete = ({ value, columnId, rowIndex, data, ...rest }) => {
        //const index = dataAPI.getIndex(data);
        const index = rowIndex;
        if (index >= 0) {
            let _rows = [];
            _rows = dataAPI.updateValues(index, columnId, { [columnId]: value });
        }
    }

    const onCellAction = (data, column, key) => {
        if (key === "Enter" || key === "DoubleClick") {
            if (column.name === "observacoes") {
                setModalParameters({ content: "textarea", type: "drawer", width: 550, title: column.header, push: false, parameters: { value: data[column.name] } });
                showModal();
            }
        }
    }

    const onSave = async () => {
        let response = null;
        try {
            response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { agg_of_id: inputParameters.current.agg_of_id }, parameters: { method: "SaveFormulacaoPlan", rows: dataAPI.getData().rows } });
            if (response.data.status !== "error") {
                props.loadParentData();
                openNotification(response.data.status, 'top', "Notificação", response.data.title);
            } else {
                openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
            }
        }
        catch (e) {
            console.log(e)
            openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
        }
    }


    return (
        <>
            <ToolbarTable {...props} parameters={inputParameters.current} submitting={submitting} />
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <Container fluid>
                <Row gutterWidth={10} style={{}}>
                    <Col>

                        <YScroll>
                            {/* {!setFormTitle && <TitleForm auth={permission.auth} data={dataAPI.getFilter(true)} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />} */}
                            <Table
                                // dirty={props?.editParameters?.formDirty}
                                loading={submitting.state}
                                idProperty={dataAPI.getPrimaryKey()}
                                dynamicHeight={70}
                                local={true}
                                onRefresh={loadData}
                                rowClassName={rowClassName}
                                //offsetHeight="150px"
                                style={{ minHeight: `200px`, fontSize: "12px" }}
                                //groups={groups}
                                /* sortable */
                                reorderColumns={false}
                                /* showColumnMenuTool */
                                loadOnInit={false}
                                pagination={false}
                                //defaultLimit={20}
                                //rowHeight={40}
                                enableColumnAutosize={true}
                                columns={columns}
                                dataAPI={dataAPI}
                                moreFilters={false}
                                sortable={false}
                                // rowExpandHeight={200}
                                // renderRowDetails={renderRowDetails}
                                // multiRowExpand={false}
                                onCellAction={onCellAction}
                                // toolbarFilters={{
                                //     form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                                //     filters: <ToolbarFilters dataAPI={dataAPI} auth={permission.auth} v={formFilter.getFieldsValue(true)} />,
                                //     moreFilters: { schema: moreFiltersSchema }
                                // }}
                                editable={{
                                    enabled: permission.isOk({ forInput: [!submitting.state, props?.editParameters?.isEditable(false)], ...PERMISSION }),
                                    add: false,
                                    controls: false,
                                    /* onAdd: onAdd, onAddSave: onAddSave, */
                                    //onSave: () => onSave("update"), onCancel: onEditCancel,
                                    modeKey: "datagrid", /* setMode, */ mode: { datagrid: { edit: mode.datagrid.edit } }, onEditComplete
                                }}
                                leftToolbar={<Space style={{ alignSelf: "center" }}>
                                    <Permissions permissions={permission} {...PERMISSION} forInput={[mode.datagrid.edit, props?.editParameters?.isEditable(false)]}><Button onClick={onSelectFormulacao}>Adicionar Formulação</Button></Permissions>
                                </Space>}


                            />
                            {/* </Col>
                </Row>
            </FormContainer> */}
                        </YScroll>


                        {/* <ListFormulacaoPlan parameters={inputParameters.current} permissions={props?.permissions} editable={props?.editParameters?.isEditable(false)} editKey={props?.editParameters?.editKey}/> */}</Col>
                </Row>
                {(operationsRef && props?.activeTab == '3') && <Portal elId={operationsRef.current}>
                    <Edit permissions={permission} {...PERMISSION} editable={props?.editParameters?.isEditable(false)} {...props?.editParameters} resetData={loadData} fn={onSave} />
                </Portal>
                }

            </Container>
        </>
    )

}