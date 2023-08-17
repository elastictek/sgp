import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
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
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Empty } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector,Chooser } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext, AppContext } from "app";
import FormPalete from './FormPalete';
import BobinesDefeitosList from '../bobines/BobinesDefeitosList';
import BobinesDestinosList from '../bobines/BobinesDestinosList';
import BobinesPropriedadesList from '../bobines/BobinesPropriedadesList';
import PaletesHistoryList from './PaletesHistoryList';
import BobinesMPGranuladoList from '../bobines/BobinesMPGranuladoList';
import BobinesOriginaisList from '../bobines/BobinesOriginaisList';
import FormPaletizacao from './FormPaletizacao';
import { FaWeightHanging } from 'react-icons/fa';


export const Context = React.createContext({});


export const LeftToolbar = ({ form, dataAPI, permission }) => {
    return (<>
        {/* <Button title='Retroceder' type="link" icon={<LeftOutlined />} onClick={() => navigate(-1)}></Button> */}
    </>);
}

export const RightToolbar = ({ form, dataAPI, permission, edit, parameters, misc, ...props }) => {
    console.log("dsdsd",parameters)

    const onAction = () => {
        changeOf({ openNotification: misc?.openNotification, row: { id: parameters?.palete_id,nome:parameters?.palete_nome }, showModal: misc?.showModal, setModalParameters: misc?.setModalParameters, item: {key:"changeof"} });
    }

    return (
        <Space>
            <Button disabled={!permission.isOk({ action: "printEtiqueta" })} title='Imprimir Etiqueta' icon={<PrinterOutlined />} onClick={() => { }}>Etiqueta</Button>
            <Button disabled={!permission.isOk({ action: "changeOrdem" })} onClick={onAction}>Alterar Ordem de Fabrico</Button>
            <Button disabled={!permission.isOk({ action: "refazerPalete" })} onClick={() => { }}>Refazer Palete</Button>
            <Button disabled={!permission.isOk({ action: "pesarPalete" })} icon={<FaWeightHanging />} onClick={() => { }}>Pesar Palete</Button>
        </Space>
    );
}

export const BtnEtiquetasBobines = () => {
    return (
        <Button icon={<PrinterOutlined />} onClick={onPrint} title="Imprimir Etiquetas das bobines">Etiquetas</Button>
    );
}


const onChangeOf = async ({ data, closeSelf, palete_id, openNotification }) => {
    let response = null;
    try {
        response = await fetchPost({ url: `${API_URL}/paletes/sql/`, filter: { palete_id }, parameters: { method: "changePaleteOrdemFabrico", ordem_id: data?.id } });
        if (response.data.status !== "error") {
            closeSelf();
            openNotification(response.data.status, 'top', "Notificação", response.data.title);
        } else {
            openNotification(response.data.status, 'top', "Notificação", response.data.title, null);
        }
    } catch (e) {
        openNotification(response?.data?.status, 'top', "Notificação", e.message, null);
    } finally {
    };
}

export const changeOf = ({ setModalParameters, showModal, openNotification, item, row }) => {
    setModalParameters({
        content: item.key, responsive: true, type: "drawer", title: `Ordens de Fabrico Compatíveis [Palete ${row?.nome}]`, push: false, loadData: () => { }, parameters: {
            payload: { payload: { url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "id", parameters: { method: "GetPaleteCompatibleOrdensFabricoOpen" }, pagination: { enabled: false, limit: 50 }, filter: { palete_id: row.id }, sort: [] } },
            toolbar: false,
            columns: [
                { name: 'ofid', header: 'Ordem', defaultWidth: 160 },
                { name: 'prf_cod', header: 'Prf', defaultWidth: 160 },
                { name: 'order_cod', header: 'Encomenda', defaultWidth: 160 },
                { name: 'item_cod', header: 'Artigo', defaultWidth: 160 },
                { name: 'cliente_nome', header: 'Cliente', defaultWidth: 160 },
                { name: 'artigo_lar', header: 'Largura', defaultWidth: 100 },
                { name: 'artigo_core', header: 'Core', defaultWidth: 100 },
                { name: 'item_numbobines', header: 'Bobines', defaultWidth: 100 }

            ],
            onSelect: ({ rowProps, closeSelf }) => onChangeOf({ data: rowProps?.data, closeSelf, palete_id: row.id, openNotification })
        },

    });
    showModal();
}


// const ToolbarTable = ({ form, dataAPI, typeListField, validField, typeField }) => {
//     const navigate = useNavigate();

//     const onChange = (v, field) => {


//     }

//     const leftContent = (<>
//         {/* <Button title='Retroceder' type="link" icon={<LeftOutlined />} onClick={() => navigate(-1)}></Button> */}
//     </>);

//     const rightContent = (
//         <Space>
//             <Button title='Imprimir Etiqueta' icon={<PrinterOutlined />} onClick={() => { }}>Imprimir</Button>
//             <Button onClick={() => { }}>Refazer Palete</Button>
//         </Space>
//     );
//     return (
//         <Toolbar left={leftContent} right={rightContent} />
//     );
// }

const loadPaleteLookup = async (palete_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/paletes/paletessql/`, pagination: { limit: 1 }, filter: { palete_id: `==${palete_id}` }, parameters: { method: "PaletesLookup" } });
    return rows;
}

export default (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const permission = usePermission({ name: "paletes" });//Permissões Iniciais
    const [modeEdit, setModeEdit] = useState({});

    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];
    const [activeTab, setActiveTab] = useState();
    const [paleteExists, setPaleteExists] = useState(false);
    const [editKey, setEditKey] = useState(null);
    const [formDirty, setFormDirty] = useState(false);
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "changeof": return <Chooser parameters={modalParameters.parameters} />
                default: return (<div>Teste</div>);
            }
        }
        return (
            <ResponsiveModal type={modalParameters?.type} push={modalParameters?.push} title={modalParameters.title} onCancel={hideModal} width={modalParameters?.width} height={modalParameters?.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    useEffect(() => {

        props.setFormTitle({ title: `Palete ${props?.parameters?.palete?.nome}` }); //Set main Title
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal } = {}) => {
        // const _allowEdit = {
        //     formPalete: permission.allow({ producao: 100 }),
        //     formPaletizacao: permission.allow({ planeamento: 100, producao: 300 }),
        //     bobinesDefeitos: permission.allow({ qualidade: 100, producao: 300 })
        // };
        // setAllowEdit({ ..._allowEdit });
        // setModeEdit({});
        /*if (!permission.allow()) {
            Modal.error({ content: "Não tem permissões!" });
            return;
        } */
        const { palete, ..._parameters } = props?.parameters || {};
        const { ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, _parameters, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys(_parameters ? _parameters : {})]);
        const formValues = await loadPaleteLookup(initFilters.palete_id);
        if (formValues.length > 0 && formValues[0]?.artigo) {
            setPaleteExists(true);
        }
        setActiveTab(props?.tab);
        /*         console.log("############PALETEPROPS--", props) */
        submitting.end();
        /*let { filterValues, fieldValues } = fixRangeDates([], initFilters);
        formFilter.setFieldsValue({ ...fieldValues });
        dataAPI.addFilters({ ...filterValues }, true, false);
        dataAPI.setSort(defaultSort);
        dataAPI.addParameters(defaultParameters, true, false);
        dataAPI.fetchPost({
            signal, rowFn: async (dt) => {
                submitting.end();
                return dt;
            }
        });*/

    }

    const onTabChange = (k) => {
        //Guarda a tab selecionada no parent, por forma a abrir sempre no último selecionado.
        if (props?.setTab) {
            props.setTab(k);
        }
        setActiveTab(k);
    }
    const changeMode = (key) => {
        setModeEdit(prev => ({ ...prev, [key]: (modeEdit[key]) ? false : allowEdit[key] }));
    }

    const onEdit = (key) => {
        if (editKey !== null) {
            openNotification("error", 'top', "Notificação", "Não é possível editar o registo. Existe uma edição em curso!");
        } else {
            setEditKey(key);
            setFormDirty(false);
        }
    }

    const onEndEdit = async () => {
        if (formDirty) {
            switch (editKey) {
                case "planificacao": break;
            }
        }
        setEditKey(null);
        setFormDirty(false);
    }

    const onCancelEdit = async (resetData) => {
        await resetData();
        setEditKey(null);
        setFormDirty(false);
    }

    return (
        // <Context.Provider value={{ parameters: props?.parameters, permission, allowEdit, modeEdit, setAllowEdit, setModeEdit }}>
        <div style={{ height: "calc(100vh - 130px)" }}>
            <YScroll>
                {paleteExists &&
                    <Tabs type="card" dark={1} defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}
                        items={[
                            {
                                label: `Informação`,
                                key: '1',
                                children: <div style={{ height: "calc(100vh - 230px)" }}><YScroll><FormPalete {...{ parameters: props?.parameters, permissions: permission.permissions, misc:{setModalParameters,showModal,openNotification} }} editParameters={{ editKey, onEdit, onEndEdit, onCancelEdit, formDirty }} /></YScroll></div>,
                            },
                            {
                                label: `Embalamento`,
                                key: '2',
                                children: <div style={{ height: "calc(100vh - 230px)" }}><YScroll><FormPaletizacao {...{ parameters: props?.parameters, permissions: permission.permissions }} editParameters={{ editKey, onEdit, onEndEdit, onCancelEdit, formDirty }} /></YScroll></div>,
                            },
                            {
                                label: `Bobines`,
                                key: '3',
                                children: <div style={{ height: "calc(100vh - 230px)" }}><YScroll><BobinesPropriedadesList {...{ parameters: props?.parameters, noPrint: false, noEdit: false, permissions: permission.permissions }} /></YScroll></div>,
                            }, {
                                label: `Bobines Defeitos`,
                                key: '4',
                                children: <div style={{ height: "calc(100vh - 230px)" }}><YScroll><BobinesDefeitosList {...{ parameters: props?.parameters, noPrint: false, noEdit: false, permissions: permission.permissions }} /></YScroll></div>,
                            },
                            {
                                label: `Bobines Destinos`,
                                key: '5',
                                children: <div style={{ height: "calc(100vh - 230px)" }}><YScroll><BobinesDestinosList {...{ parameters: props?.parameters, noPrint: false, noEdit: false, permissions: permission.permissions }} /></YScroll></div>,
                            },
                            {
                                label: `MP Granulado (Lotes)`,
                                key: '6',
                                children: <BobinesMPGranuladoList {...{ parameters: props?.parameters, permissions: permission.permissions }} />,
                            }, {
                                label: `Bobines Originais`,
                                key: '7',
                                children: <BobinesOriginaisList {...{ parameters: props?.parameters, noPrint: true, noEdit: true, permissions: permission.permissions }} />,
                            },
                            {
                                label: `Histórico`,
                                key: '8',
                                children: <PaletesHistoryList {...{ parameters: props?.parameters, permissions: permission.permissions }} />,
                            },
                        ]}

                    />}
                {(!paleteExists && !submitting.state) && <Empty description="A Palete não foi encontrada!" />}
            </YScroll>
        </div>
        // </Context.Provider>
    )

}