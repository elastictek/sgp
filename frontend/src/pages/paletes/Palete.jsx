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
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Empty } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, CaretLeftFilled, CaretRightFilled } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS } from 'config';
import useWebSocket from 'react-use-websocket';
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Chooser } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
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

const title = "Palete";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, paleteNome = "", loadData, nav = false, submitting, sort }) => {
    const reverseDirection = (sort && sort.length > 0 && sort[0].direction == "DESC") ? true : false;
    return (<ToolbarTitle id={auth?.user} description={`${title} ${paleteNome}`}
        leftTitle={<span style={{}}>{`${title} ${paleteNome}`}</span>}
        actions={
            <Space.Compact style={{ marginLeft: "5px" }}>
                {(loadData && nav) && <>
                    <Button disabled={submitting.state} style={{ background: "#d9d9d9", border: "0px" }} icon={<CaretLeftFilled />} onClick={() => loadData({ navDirection: reverseDirection ? 1 : -1 })} />
                    <Button disabled={submitting.state} style={{ background: "#d9d9d9", border: "0px" }} icon={<CaretRightFilled />} onClick={() => loadData({ navDirection: reverseDirection ? -1 : 1 })} />
                </>
                }
            </Space.Compact>
        }
    />);
}

export const LeftToolbar = ({ form, dataAPI, permission }) => {
    return (<>
        {/* <Button title='Retroceder' type="link" icon={<LeftOutlined />} onClick={() => navigate(-1)}></Button> */}
    </>);
}

export const RightToolbar = ({ form, dataAPI, permission, edit, parameters, misc,loadParentData, ...props }) => {
    const onAction = () => {
        changeOf({ loadParentData, openNotification: misc?.openNotification, row: { id: parameters?.palete?.id, nome: parameters?.palete?.nome }, showModal: misc?.showModal, setModalParameters: misc?.setModalParameters, item: { key: "changeof" } });
    }

    return (
        <Space style={{ marginRight: "5px" }}>
            {/* <Button disabled={!permission.isOk({ action: "printEtiqueta" })} title='Imprimir Etiqueta' icon={<PrinterOutlined />} onClick={() => { }}>Etiqueta</Button> */}
            <Button disabled={!permission.isOk({ action: "changeOrdem" })} onClick={onAction}>Alterar Ordem de Fabrico</Button>
            {/*             <Button disabled={!permission.isOk({ action: "refazerPalete" })} onClick={() => { }}>Refazer Palete</Button>
            <Button disabled={!permission.isOk({ action: "pesarPalete" })} icon={<FaWeightHanging />} onClick={() => { }}>Pesar Palete</Button> */}
        </Space>
    );
}

export const BtnEtiquetasBobines = () => {
    return (
        <Button icon={<PrinterOutlined />} onClick={onPrint} title="Imprimir Etiquetas das bobines">Etiquetas</Button>
    );
}


const onChangeOf = async ({ data, closeSelf, palete_id, openNotification,loadParentData }) => {
    let response = null;
    try {
        response = await fetchPost({ url: `${API_URL}/paletes/sql/`, filter: { palete_id }, parameters: { method: "changePaleteOrdemFabrico", ordem_id: data?.id } });
        if (response && response.data.status !== "error") {
            if (loadParentData){
                loadParentData();
            }
            closeSelf();
            openNotification(response.data.status, 'top', "Notificação", response.data.title);
        } else {
            openNotification("error", 'top', "Notificação", response.data.title, null);
        }
    } catch (e) {
        openNotification("error", 'top', "Notificação", e.message, null);
    } finally {
    };
}

export const changeOf = ({ setModalParameters, showModal, openNotification,loadParentData, item, row }) => {
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
            onSelect: ({ rowProps, closeSelf }) => onChangeOf({ data: rowProps?.data, closeSelf, palete_id: row.id, openNotification,loadParentData })
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

const loadPaleteLookup = async ({ palete_id }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/paletes/paletessql/`, pagination: { limit: 1 }, filter: { palete_id: `==${palete_id}` }, parameters: { method: "PaletesLookup" } });
    return rows;
}

export default (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const permission = usePermission({ name: "paletes" });//Permissões Iniciais
    const [modeEdit, setModeEdit] = useState({});
    const inputParameters = useRef({});

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
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false, navDirection = null } = {}) => {
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
        submitting.trigger();
        setFormDirty(false);
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
            if (inputParameters.current?.dataAPI) {
                dataAPI.setPayload(inputParameters.current?.dataAPI);
                dataAPI.pageSize(1, false);
                dataAPI.currentPage(inputParameters.current?.dataAPI.offset + 1);
            }
        }
        if (navDirection && inputParameters.current?.dataAPI) {
            if (navDirection == 1) {
                dataAPI.next();
            } else {
                dataAPI.previous();
            }
            const dt = await dataAPI.fetchPost();
            if (inputParameters.current.palete && dt.rows.length > 0) {
                inputParameters.current.palete_id = dt.rows[0].id;
                inputParameters.current.palete_nome = dt.rows[0].nome;
            }
        } else {
            dataAPI.setData({ rows: [{ ...inputParameters.current?.palete, id: inputParameters.current?.palete?.palete_id ? inputParameters.current?.palete?.palete_id : inputParameters.current?.palete?.id }], total: 1 });
        }
        if (props?.setFormTitle) {
            props.setFormTitle({ title: `Palete ${inputParameters.current?.palete_nome}` }); //Set main Title
        }

        const formValues = await loadPaleteLookup({ palete_id: inputParameters.current.palete_id });
        if (formValues.length > 0/* && formValues[0]?.artigo */) {
            setPaleteExists(true);
        }
        setActiveTab(props?.tab);
        submitting.end();









        // const { palete, ..._parameters } = props?.parameters || {};
        // const { ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, _parameters, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys(_parameters ? _parameters : {})]);
        // const formValues = await loadPaleteLookup(initFilters.palete_id);
        // if (formValues.length > 0 && formValues[0]?.artigo) {
        //     setPaleteExists(true);
        // }
        // setActiveTab(props?.tab);
        // /*         console.log("############PALETEPROPS--", props) */
        // submitting.end();
        // /*let { filterValues, fieldValues } = fixRangeDates([], initFilters);
        // formFilter.setFieldsValue({ ...fieldValues });
        // dataAPI.addFilters({ ...filterValues }, true, false);
        // dataAPI.setSort(defaultSort);
        // dataAPI.addParameters(defaultParameters, true, false);
        // dataAPI.fetchPost({
        //     signal, rowFn: async (dt) => {
        //         submitting.end();
        //         return dt;
        //     }
        // });*/

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
        <>
            {(!props?.setFormTitle && dataAPI.hasData()) && <TitleForm submitting={submitting} auth={permission.auth} sort={dataAPI.getSort()} paleteNome={dataAPI.getData().rows[0]?.nome} loadData={loadData} nav={inputParameters.current?.dataAPI ? true : false} />}
            <div style={{ height: "calc(100vh - 130px)" }}>
                <YScroll>
                    {dataAPI.hasData() &&
                        <Tabs type="card" dark={1} defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}
                            items={[
                                {
                                    label: `Informação`,
                                    key: '1',
                                    children: <div style={{ height: "calc(100vh - 230px)" }}><YScroll><FormPalete {...{ parameters: { palete: dataAPI.getData().rows[0], tstamp: dataAPI.getTimeStamp() }, permissions: permission.permissions, misc: { setModalParameters, showModal, openNotification } }} editParameters={{ editKey, onEdit, onEndEdit, onCancelEdit, formDirty }} /></YScroll></div>,
                                },
                                {
                                    label: `Embalamento`,
                                    key: '2',
                                    children: <div style={{ height: "calc(100vh - 230px)" }}><YScroll><FormPaletizacao {...{ parameters: { palete: dataAPI.getData().rows[0], tstamp: dataAPI.getTimeStamp() }, permissions: permission.permissions }} editParameters={{ editKey, onEdit, onEndEdit, onCancelEdit, formDirty }} /></YScroll></div>,
                                },
                                {
                                    label: `Bobines`,
                                    key: '3',
                                    children: <div style={{ height: "calc(100vh - 230px)" }}><YScroll><BobinesPropriedadesList {...{ parameters: { palete: dataAPI.getData().rows[0], tstamp: dataAPI.getTimeStamp() }, noPrint: false, noEdit: false, permissions: permission.permissions }} /></YScroll></div>,
                                }, {
                                    label: `Bobines Defeitos`,
                                    key: '4',
                                    children: <div style={{ height: "calc(100vh - 230px)" }}><YScroll><BobinesDefeitosList {...{ parameters: { palete: dataAPI.getData().rows[0], tstamp: dataAPI.getTimeStamp() }, noPrint: false, noEdit: false, permissions: permission.permissions }} /></YScroll></div>,
                                },
                                {
                                    label: `Bobines Destinos`,
                                    key: '5',
                                    children: <div style={{ height: "calc(100vh - 230px)" }}><YScroll><BobinesDestinosList {...{ parameters: { palete: dataAPI.getData().rows[0], tstamp: dataAPI.getTimeStamp() }, noPrint: false, noEdit: false, permissions: permission.permissions }} /></YScroll></div>,
                                },
                                {
                                    label: `MP Granulado (Lotes)`,
                                    key: '6',
                                    children: <BobinesMPGranuladoList {...{ parameters: { palete: dataAPI.getData().rows[0], tstamp: dataAPI.getTimeStamp() }, permissions: permission.permissions }} />,
                                }, {
                                    label: `Bobines Originais`,
                                    key: '7',
                                    children: <BobinesOriginaisList {...{ parameters: { palete: dataAPI.getData().rows[0], tstamp: dataAPI.getTimeStamp() }, noPrint: true, noEdit: true, permissions: permission.permissions }} />,
                                },
                                {
                                    label: `Histórico`,
                                    key: '8',
                                    children: <PaletesHistoryList {...{ parameters: { palete: dataAPI.getData().rows[0], tstamp: dataAPI.getTimeStamp() }, permissions: permission.permissions }} />,
                                },
                            ]}

                        />}
                    {(!dataAPI.hasData() && !submitting.state) && <Empty description="A Palete não foi encontrada!" />}
                </YScroll>
            </div>
        </>
    )

}