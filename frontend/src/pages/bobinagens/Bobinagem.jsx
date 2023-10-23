import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
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
import uuIdInt from "utils/uuIdInt";
import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../App";
//import FormPalete from './FormPalete';
import BobinesDefeitosList from '../bobines/BobinesDefeitosList';
import BobinesDestinosList from '../bobines/BobinesDestinosList';
import BobinesPropriedadesList from '../bobines/BobinesPropriedadesList';
import BobinagensHistoryList from './BobinagensHistoryList';
import BobinesMPGranuladoList from '../bobines/BobinesMPGranuladoList';
import BobinesOriginaisList from '../bobines/BobinesOriginaisList';
//import FormPaletizacao from './FormPaletizacao';
import { FaWeightHanging } from 'react-icons/fa';
import FormBobinagem from './FormBobinagem';
import FormPrint from "../commons/FormPrint";


export const Context = React.createContext({});

const title = "Bobinagem";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, bobinagemNome = "" }) => {
    return (<ToolbarTitle id={auth?.user} description={`${title} ${bobinagemNome}`}
        leftTitle={<span style={{}}>{`${title} ${bobinagemNome}`}</span>}
    />);
}

export const LeftToolbar = ({ form, dataAPI, permission }) => {
    return (<>
        {/* <Button title='Retroceder' type="link" icon={<LeftOutlined />} onClick={() => navigate(-1)}></Button> */}
    </>);
}


export const RightToolbar = ({ form, dataAPI, permission, edit, ...props }) => {
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "print": return <FormPrint v={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal type={modalParameters?.type} push={modalParameters?.push} title={modalParameters.title} onCancel={hideModal} width={modalParameters?.width} height={modalParameters?.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onPrint = () => {
        setModalParameters({ content: "print", type: "modal", width: 500, height: 280, title: `Etiquetas Bobines - Bobinagem ${props?.bobinagem?.nome} `, parameters: { bobinagem: props?.bobinagem } });
        showModal();
    }

    return (
        <Space>
            <Button disabled={!permission.isOk({ action: "printEtiqueta" })} icon={<PrinterOutlined />} onClick={onPrint} title="Imprimir Etiquetas">Imprimir Etiquetas</Button>
            {/* <Button disabled={!permission.isOk({ action: "printEtiqueta" })} title='Imprimir Etiqueta' icon={<PrinterOutlined />} onClick={props?.onPrint && props.onPrint()}>Etiqueta</Button> */}
            {/*             <Button disabled={!edit || !permission.isOk({ action: "refazerPalete" })} onClick={() => { }}>Refazer Palete</Button>
            <Button disabled={!edit || !permission.isOk({ action: "pesarPalete" })} icon={<FaWeightHanging />} onClick={() => { }}>Pesar Palete</Button> */}
        </Space>
    );
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

const loadBobinagemLookup = async (bobinagem_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobinagens/sql/`, pagination: { limit: 1 }, filter: { bobinagem_id: `==${bobinagem_id}` }, parameters: { method: "BobinagensLookup" } });
    return rows;
}

export default (props) => {
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({ name: "bobinagens"/* , item: "details" */ });//Permissões Iniciais
    const [mode, setMode] = useState({ datagrid: { edit: true, add: false } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [formDirty, setFormDirty] = useState(false);
    const inputParameters = useRef({});

    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};
    const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
    const submitting = useSubmitting(true);
    const primaryKeys = [];
    const [activeTab, setActiveTab] = useState();
    const [bobinagemExists, setBobinagemExists] = useState(false);
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "print": return <FormPrint v={modalParameters.parameters} />;
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

    const loadData = async ({ signal, init = false } = {}) => {
        setFormDirty(false);
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
        }
        if (props?.setFormTitle) {
            props.setFormTitle({ title: `Bobinagem ${inputParameters.current?.bobinagem?.nome}` }); //Set main Title
        } else {

        }
        const formValues = await loadBobinagemLookup(inputParameters.current.bobinagem_id);
        if (formValues.length > 0/* && formValues[0]?.artigo */) {
            setBobinagemExists(true);
        }
        setActiveTab(props?.tab);
        submitting.end();
    }

    const onTabChange = (k) => {
        //Guarda a tab selecionada no parent, por forma a abrir sempre no último selecionado.
        if (props?.setTab) { props.setTab(k); }
        setActiveTab(k);
    }
    const changeMode = (key) => {
        setModeEdit(prev => ({ ...prev, [key]: (modeEdit[key]) ? false : allowEdit[key] }));
    }

    return (
        // <Context.Provider value={{ parameters: props?.parameters, permission, allowEdit, modeEdit, setAllowEdit, setModeEdit }}>
        <>
            {!props?.setFormTitle && <TitleForm auth={permission.auth} bobinagemNome={inputParameters.current.bobinagem_nome} /* data={dataAPI.getFilter(true)} */ /* onChange={onFilterChange} level={location?.state?.level} form={formFilter}  */ />}
            <div style={{ height: "calc(100vh - 130px)" }}>
                <YScroll>
                    {bobinagemExists &&
                        <Tabs type="card" dark={1} defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}
                            items={[
                                {
                                    label: `Informação`,
                                    key: '1',
                                    children: <FormBobinagem {...{ parameters: props?.parameters, permissions: permission.permissions }} />,
                                },
                                {
                                    label: `Bobines`,
                                    key: '3',
                                    children: <BobinesPropriedadesList {...{ parameters: props?.parameters, noPrint: false, noEdit: false, permissions: permission.permissions, columns: { palete_nome: "palete_nome" } }} />,
                                }, {
                                    label: `Bobines Defeitos`,
                                    key: '4',
                                    children: <BobinesDefeitosList {...{ parameters: props?.parameters, noPrint: false, noEdit: false, permissions: permission.permissions, columns: { palete_nome: "palete_nome" } }} />,
                                },
                                {
                                    label: `Bobines Destinos`,
                                    key: '5',
                                    children: <BobinesDestinosList {...{ parameters: props?.parameters, noPrint: false, noEdit: false, permissions: permission.permissions, columns: { palete_nome: "palete_nome" } }} />,
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
                                    children: <BobinagensHistoryList {...{ parameters: props?.parameters, permissions: permission.permissions }} />,
                                },
                            ]}

                        />}
                    {(!bobinagemExists && !submitting.state) && <Empty description="A Bobinagem não foi encontrada!" />}
                </YScroll>
            </div>
        </>
        // </Context.Provider>
    )

}