import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, DOSERS } from "config";
import { useDataAPI } from "utils/useDataAPI";
//import { WrapperForm, TitleForm, FormLayout, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Drawer } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { json } from "utils/object";
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, DeleteTwoTone } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, BOBINE_ESTADOS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
// import { Status } from './commons';
import { TbCircles } from "react-icons/tb";
import { GoArrowUp } from 'react-icons/go';
import { ImArrowLeft } from 'react-icons/im';
// import { Cuba } from "../currentline/dashboard/commons/Cuba";
// import { Core, EstadoBobines, Largura } from "./commons";
import FormCheckList from './FormChecklist';
import FormChecklist from './FormChecklist';
import { MediaContext, AppContext } from "../App";
// import OF from '../commons/OF';
import { MultiLine, FieldSelectEditor } from 'components/tableEditors';
import { checklistStatus,Status,changeStatus } from './commons';
import dayjs from 'dayjs';

const focus = (el, h,) => { el?.focus(); };
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}
const title = "CheckLists";
const TitleForm = ({ data, onChange, record, level, form }) => {
    // const st = JSON.stringify(record.ofs)?.replaceAll(/[\[\]\"]/gm, "")?.replaceAll(",", " | ");
    return (<ToolbarTitle /* history={level === 0 ? [] : ['Registo Nonwovens - Entrada em Linha']} */ title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }}>
                <Col xs='content' style={{}}><Row nogutter><Col><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title}</span></Col></Row></Col>
                {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
            </Row>

        </Col>
    </>
    }
    />);
}
const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'>
            <Field name="fnome" label={{ enabled: true, text: "Código", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="fdata" label={{ enabled: true, text: "Data", pos: "top", padding: "0px" }}>
                <RangeDateField size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="fstatus" label={{ enabled: true, text: "Estado", pos: "top", padding: "0px" }}>
                <Select size='small' options={[...checklistStatus, { value: null, label: " " }]} allowClear style={{ width: "100px" }} />
            </Field>
        </Col>
    </>
    );
}

const useStyles = createUseStyles({
    hasObs: {
        backgroundColor: "#fffb8f"
    },
    diffAbove: {
        backgroundColor: "#ffa39e"
    },
    diffBellow: {
        backgroundColor: "#fffb8f"
    },
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    },
    closed: {
        background: "#d9f7be"
    },
    edit: {
        position: "relative",
        '&:before': {
            /* we need this to create the pseudo-element */
            content: "''",
            display: "block",
            /* position the triangle in the top right corner */
            position: "absolute",
            zIndex: "0",
            top: "0",
            right: "0",
            /* create the triangle */
            width: "0",
            height: "0",
            border: ".3em solid transparent",
            borderTopColor: "#66afe9",
            borderRightColor: "#66afe9"

        }
    }
});
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    { fnome: { label: "Código", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data", field: { type: "rangedate", size: 'small' } } },
    { fstatus: { label: 'Estado', field: { type: 'select', size: 'small', options: [...checklistStatus, { value: null, label: " " }] }, span: 6 } },
    { fagg: { label: "Ordem Fabrico agregada", field: { type: 'input', size: 'small' } } },
    { fobs: { label: "Observações", field: { type: 'input', size: 'small' } } },
];

// const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
//     const items = [
//         ...(modeEdit && props.row?.closed === 0 && props.row?.valid !== 0) ? [{ label: <span style={{}}>Fechar movimento</span>, key: 'close', icon: <CheckCircleOutlined style={{ fontSize: "16px" }} /> }, { type: 'divider' }] : [],
//         ...(modeEdit && props.row?.closed === 0 && props.row?.valid !== 0 && props.row?.type_mov == 1) ? [{ label: <span style={{}}>Saída de Linha</span>, key: 'out', icon: <ImArrowLeft size={16} style={{ verticalAlign: "text-top" }} /> }, { type: 'divider' }] : [],
//         (modeEdit && props.row?.closed === 0 && props.row?.valid !== 0) && { label: <span style={{ fontWeight: 700 }}>Eliminar Registo</span>, key: 'delete', icon: <DeleteFilled style={{ fontSize: "16px", color: "red" }} /> }
//     ];
//     return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
// }


// export const ModalViewer = ({ p, title, width = "90%", type = "drawer", push = false, height, footer = "ref", yScroll = true, children }) => {
//     const [visible, setVisible] = useState(true);

//     const onCancel = () => {
//         p.onClose();
//         setVisible(false);
//     };

//     return (
//         <ResponsiveModal title={title} type={type} push={push} onCancel={onCancel} width={width} height={height} footer={footer} yScroll={yScroll}>
//             {children}
//         </ResponsiveModal>
//     );
// };



export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);
    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({ name: "checklist", item: "checklist" });
    const [modeEdit, setModeEdit] = useState({ datagrid: false });

    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = { method: "CheckLists" };
    const defaultSort = [{ column: "timestamp", direction: "DESC" }];
    const dataAPI = useDataAPI({ id: "lst-chklists", payload: { url: `${API_URL}/ordensfabrico/sql/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: [] } });
    const submitting = useSubmitting(true);
    const [lastTab, setLastTab] = useState('1');

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "checklist": return <FormChecklist loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const primaryKeys = ['id'];
    const editable = (row, col) => {
        // if (modeEdit.datagrid && permission.isOk({ action: "changeDestino" }) && !row?.carga_id && !row?.SDHNUM_0) {
        //     return (col === "destino") ? true : false;
        // }
        return false;
    }
    const editableClass = (row, col) => {
        // if (col === "destino" && row.destinos_has_obs > 0) {
        //     return classes.hasObs;
        // }
    }

    const columns = [
        { key: 'nome', name: 'Código Checklist', frozen: true, width: 160, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onChecklistClick(p.row)}>{p.row.nome}</Button> },
        { key: 'timestamp', width: 130, name: 'Data', formatter: p => dayjs(p.row.timestamp).format(DATETIME_FORMAT) },
        { key: 'agg_cod', width: 150, name: 'OF Agregada', formatter: p => p.row.agg_cod },
        { key: 'status', width: 110, name: 'Estado', formatter: p => <Status v={p.row.status} genre="f" onClick={()=>onChangeStatus(p.row)} /> },
        {
            key: 'obs', sortable: false,
            name: 'Obs.',
            formatter: ({ row, isCellSelected }) => <MultiLine value={row.obs} isCellSelected={isCellSelected}><pre style={{ whiteSpace: "break-spaces" }}>{row.obs}</pre></MultiLine>,
            cellClass: r => editableClass(r, 'generic'),
            editorOptions: { editOnClick: true },
        },
        { key: 'baction', name: '', minWidth: 45, maxWidth: 45, width: 45, formatter: p => <Permissions permissions={permission} forInput={[p.row.status !== 9]} action="delete"><Button icon={<DeleteTwoTone />} size="small" onClick={() => onDelList(p.row)} /></Permissions> }
    ];

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, []);

    const loadData = async ({ init = false, signal } = {}) => {
        if (init) {
            const initFilters = loadInit({ fstatus: 1 }, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, {}, [...Object.keys(dataAPI.getAllFilter())]);
            let { filterValues, fieldValues } = fixRangeDates(['fdata'], initFilters);
            formFilter.setFieldsValue({ ...fieldValues });
            dataAPI.addFilters({ ...filterValues }, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters(defaultParameters, true, true);
            dataAPI.fetchPost({ signal });
        }
        submitting.end();
    }

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const vals = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
                const _values = {
                    ...vals,
                    fnome: getFilterValue(vals?.fnome, 'any'),
                    fagg: getFilterValue(vals?.fagg, 'any'),
                    fobs: getFilterValue(vals?.fobs, 'any'),
                    fdata: getFilterRangeValues(vals["fdata"]?.formatted),
                };
                dataAPI.addFilters(_values, true);
                dataAPI.addParameters(defaultParameters);
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onAction = (item, row) => {
        // switch (item.key) {
        // }
    }

    const onNewChecklist = () => {
        setModalParameters({ content: "checklist", type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: () => dataAPI.fetchPost(), parameters: {} });
        showModal();
    }
    const onChecklistClick = (r) => {
        setModalParameters({ content: "checklist", type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: () => dataAPI.fetchPost(), parameters: { checklist_id: r.id } });
        showModal();
    }
    const onChangeStatus=(r) => {
        changeStatus("Alteração do estado",checklistStatus,()=>{},"f");
    }


    const onDelList = (r) => {
        Modal.confirm({
            title: <div>Eliminar a Checklist <b>{r.nome}</b></div>, content: "Tem a certeza que deseja eliminar a Checklist selecionada?", onOk: async () => {
                submitting.trigger();
                try {
                    let response = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { id: r.id }, parameters: { method: "DeleteChecklist" } });
                    if (response.data.status !== "error") {
                        openNotification(response.data.status, 'top', "Notificação", `Checklist ${r.nome} eliminada com sucesso!`);
                        dataAPI.fetchPost();
                    } else {
                        openNotification(response.data.status, 'top', "Notificação", `Erro ao eliminar a checklist ${r.nome}!`);
                    }
                } catch (e) {
                    openNotification("error", 'top', "Notificação", e);
                } finally {
                    submitting.end();
                };
            }
        });
    }

    return (
        <>
            {!setFormTitle && <TitleForm data={dataAPI.getAllFilter()} onChange={onFilterChange} level={location?.state?.level} form={formFilter} />}
            <Table
                loading={submitting.state}
                /*                 actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} modeEdit={modeEdit.datagrid} />} */
                frozenActionColumn={true}
                reportTitle={title}
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                toolbar={true}
                search={true}
                moreFilters={true}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={false}
                rowHeight={28}
                rowClass={(row) => (row?.valid === 0 ? classes.notValid : undefined)}
                leftToolbar={<Space>
                    <Permissions permissions={permission} action="new"><Button disabled={submitting.state} onClick={onNewChecklist}>Nova Checklist</Button></Permissions>
                    {/* <Permissions permissions={permission} action="editList">
                        {!modeEdit.datagrid && <Button disabled={submitting.state} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
                        {modeEdit.datagrid && <Button disabled={submitting.state} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                        {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={submitting.state} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                    </Permissions> */}

                    {/* {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<CheckCircleOutlined />} onClick={onClose}>Fechar Movimentos</Button>}
                    {modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<PlusCircleOutlined />} onClick={onAdd}>Nova Entrada</Button>}
                    {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                    {!modeEdit.datagrid && <Button disabled={(!allowEdit.datagrid || submitting.state)} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>} */}
                </Space>}
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 500, mask: true }
                }}
            />
        </>
    );
}