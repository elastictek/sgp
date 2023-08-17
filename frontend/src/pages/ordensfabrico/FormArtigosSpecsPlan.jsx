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
import { API_URL, ROOT_URL } from "config";
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
import { Core, EstadoBobines, Largura, Link, DateTime, RightAlign, LeftAlign, Favourite, IndexChange, TextAreaViewer, MetodoOwner, MetodoAging, Status } from "components/TableColumns";
import { LeftToolbar, RightToolbar, Edit } from "./OrdemFabrico";
import { ImArrowDown, ImArrowUp } from 'react-icons/im';
import { MediaContext, AppContext } from 'app';

const EDITKEY = "specs_plan";
const PERMISSION = { item: "edit", action: "specs_plan" };

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

export const loadSpecsPlan = async ({ of_id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { of_id }, sort: [], parameters: { method: "ArtigosSpecsPlanList" }, signal });
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
                case "specs": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal lazy={modalParameters?.lazy} responsive={modalParameters?.responsive} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

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
        ...(true) ? [{ name: 'designacao', header: 'Designação', cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, flex: 2, headerAlign: "center", render: ({ data, cellProps }) => <Link cellProps={cellProps} onClick={() => onOpenParameters(data)} value={data?.designacao} /> }] : [],
        ...(true) ? [{ name: 'lab_metodo', header: 'Método', cellProps: { className: columnClass }, render: ({ cellProps, data }) => data?.metodo_designacao, userSelect: true, defaultLocked: false, flex: 2, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'des', header: 'Artigo', cellProps: { className: columnClass }, render: ({ cellProps, data }) => <div>{data?.cod} <span style={{ fontWeight: 700 }}>{data?.des?.replace(new RegExp(`Nonwoven Elastic Bands |Nonwoven Elastic Band |NW Elastic Bands `, "gi"), "")}</span></div>, userSelect: true, defaultLocked: false, defaultWidth:350, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'cliente_nome', header: 'Cliente', cellProps: { className: columnClass }, render: ({ cellProps, data }) => data?.cliente_nome, userSelect: true, defaultLocked: false, defaultWidth:350, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'owner', header: 'Owner',  render: ({ data, cellProps }) => <MetodoOwner cellProps={cellProps} value={data?.owner} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 'aging', header: 'Aging', render: ({ data, cellProps }) => <MetodoAging cellProps={cellProps} value={data?.aging} />, cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 120, headerAlign: "center" }] : [],
        ...(true) ? [{ name: 't_stamp', header: 'Data', render: ({ cellProps, data }) => <DateTime value={data?.t_stamp} format={DATETIME_FORMAT} />,cellProps: { className: columnClass }, userSelect: true, defaultLocked: false, width: 150, headerAlign: "center" }] : [],
    ];

    const tableColumns = [
        ...(true) ? [{ name: 'idx', header: 'Index', headerAlign: "center", userSelect: true, defaultLocked: true, defaultWidth: 70, render: ({ data, cellProps }) => <IndexChange onDelete={onDelete} onUp={onUp} onDown={onDown} value={data?.idx} modeEdit={mode.datagrid.edit} allowDelete cellProps={cellProps} /> }] : [],
        ...columns,
        ...(true) ? [{ name: "observacoes", header: "Observações", headerAlign: "center", userSelect: true, defaultLocked: false, defaultWidth:400, editable: columnEditable, renderEditor: (props) => <ObsTableEditor dataAPI={dataAPI} {...props} />, cellProps: { className: columnClass } }] : [],

    ];

    const onSelectSpecs = () => {
        const _filter = { fcliente_cod: props?.parameters?.cliente_cod, fartigo_id: props?.parameters?.item_id };
        setModalParameters({
            content: "specs", responsive: true, type: "drawer", width: "85%", title: "Especificações disponíveis", push: false, loadData: () => { }, parameters: {
                offsetHeight: "200px",
                multipleSelection: true,
                payload: { payload: { url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "id", parameters: { method: "ArtigosSpecsAvailableList" }, pagination: { enabled: true, pageSize: 20 }, baseFilter: _filter, sort: [] } },
                toolbar: true,
                pagination: true,
                columns: [...columns],
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
            const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, ["temp_ofabrico", "temp_ofabrico_agg", "agg_of_id"]);
            inputParameters.current = { ...pickAll([{ temp_ofabrico: "of_id" }, "temp_ofabrico_agg", "agg_of_id"], paramsIn) };
        }
        const _rows = await loadSpecsPlan({ of_id: inputParameters.current.of_id }, signal);
        dataAPI.setData({ rows: _rows, total: _rows.length });
        submitting.end();
    }

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
            response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { ...pickAll(["of_id", "agg_of_id"], inputParameters.current) }, parameters: { method: "SaveArtigosSpecsPlan", rows: dataAPI.getData().rows } });
            if (response.data.status !== "error") {
                loadData();
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
                                columns={tableColumns}
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
                                    <Permissions permissions={permission} {...PERMISSION} forInput={[mode.datagrid.edit, props?.editParameters?.isEditable(false)]}><Button onClick={onSelectSpecs}>Adicionar Especificação</Button></Permissions>
                                </Space>}


                            />
                            {/* </Col>
                </Row>
            </FormContainer> */}
                        </YScroll>


                        {/* <ListFormulacaoPlan parameters={inputParameters.current} permissions={props?.permissions} editable={props?.editParameters?.isEditable(false)} editKey={props?.editParameters?.editKey}/> */}</Col>
                </Row>
                {(operationsRef && props?.activeTab == '6') && <Portal elId={operationsRef.current}>
                    <Edit permissions={permission} {...PERMISSION} editable={props?.editParameters?.isEditable(false)} {...props?.editParameters} resetData={loadData} fn={onSave} />
                </Portal>
                }

            </Container>
        </>
    )

}