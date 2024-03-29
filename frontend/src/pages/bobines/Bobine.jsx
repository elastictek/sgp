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
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../App";
import FormBobine from './FormBobine';
// import BobinesDefeitosList from '../bobines/BobinesDefeitosList';
// import BobinesDestinosList from '../bobines/BobinesDestinosList';
// import BobinesPropriedadesList from '../bobines/BobinesPropriedadesList';
// import PaletesHistoryList from './PaletesHistoryList';
// import BobinesMPGranuladoList from '../bobines/BobinesMPGranuladoList';
// import BobinesOriginaisList from '../bobines/BobinesOriginaisList';
// import FormPaletizacao from './FormPaletizacao';
import { FaWeightHanging } from 'react-icons/fa';


export const Context = React.createContext({});


export const LeftToolbar = ({ form, dataAPI, permission }) => {
    return (<>
        {/* <Button title='Retroceder' type="link" icon={<LeftOutlined />} onClick={() => navigate(-1)}></Button> */}
    </>);
}

export const RightToolbar = ({ form, dataAPI, permission, edit, ...props }) => {
    return (
        <Space>
            {/* <Button disabled={!permission.isOk({ action: "printEtiqueta" })} title='Imprimir Etiqueta' icon={<PrinterOutlined />} onClick={() => { }}>Etiqueta</Button>
            <Button disabled={!edit || !permission.isOk({ action: "refazerPalete" })} onClick={() => { }}>Refazer Palete</Button>
            <Button disabled={!edit || !permission.isOk({ action: "pesarPalete" })} icon={<FaWeightHanging />} onClick={() => { }}>Pesar Palete</Button> */}
        </Space>
    );
}

export const BtnEtiquetasBobines = () => {
    return (
        <Button icon={<PrinterOutlined />} onClick={onPrint} title="Imprimir Etiquetas das bobines">Etiquetas</Button>
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

const loadBobineLookup = async (bobine_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobines/sql/`, pagination: { limit: 1 }, filter: { bobine_id: `==${bobine_id}` }, parameters: { method: "BobinesLookup" } });
    return rows;
}

export default (props) => {
    const location = useLocation();
    const navigate = useNavigate();

    const permission = usePermission({});//Permissões Iniciais
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
    const [bobineExists, setBobineExists] = useState(false);
    const [modalParameters, setModalParameters] = useState({});
    const [values, setValues] = useState();
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                /* case "option": return <ReactComponent loadParentData={modalParameters.loadData} record={modalParameters.record} />; */
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
        props.setFormTitle({ title: `Bobine ${props?.parameters?.bobine?.nome}` }); //Set main Title
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
        const { bobine, ..._parameters } = props?.parameters || {};
        const { ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, _parameters, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys(_parameters ? _parameters : {})]);
        const formValues = await loadBobineLookup(initFilters.bobine_id);
        if (formValues.length > 0) {
            setBobineExists(true);
            setValues(formValues[0]);
        }
        setActiveTab(props?.tab);
        console.log("####", formValues)
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
        if (props?.setTab) { props.setTab(k); }
        setActiveTab(k);
    }
    const changeMode = (key) => {
        setModeEdit(prev => ({ ...prev, [key]: (modeEdit[key]) ? false : allowEdit[key] }));
    }

    return (
        // <Context.Provider value={{ parameters: props?.parameters, permission, allowEdit, modeEdit, setAllowEdit, setModeEdit }}>
        <div style={{ height: "calc(100vh - 120px)" }}>
            <YScroll>
                {bobineExists &&
                    <Tabs type="card" dark={1} defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}
                        items={[
                            {
                                label: `Informação`,
                                key: '1',
                                children: <FormBobine {...{ parameters: props?.parameters, permission }} />,
                            },
                            {
                                label: `Embalamento`,
                                key: '2',
                                children: <div></div> //<FormPaletizacao {...{ parameters: props?.parameters, permission }} />,
                            },
                            {
                                label: `Bobines`,
                                key: '3',
                                children: <div></div> //<BobinesPropriedadesList {...{ parameters: props?.parameters, print: true, edit: true, permission }} />,
                            }, {
                                label: `Bobines Defeitos`,
                                key: '4',
                                children: <div></div>//<BobinesDefeitosList print={true} edit={true} {...{ parameters: props?.parameters, print: true, edit: true, permission }} />,
                            },
                            {
                                label: `Bobines Destinos`,
                                key: '5',
                                children: <div></div>//<BobinesDestinosList print={true} edit={true} {...{ parameters: props?.parameters, print: true, edit: true, permission }} />,
                            },
                            {
                                label: `MP Granulado (Lotes)`,
                                key: '6',
                                children: <div></div>// <BobinesMPGranuladoList {...{ parameters: props?.parameters, permission }} />,
                            }, {
                                label: `Bobines Originais`,
                                key: '7',
                                children: <div></div>//<BobinesOriginaisList {...{ parameters: props?.parameters, print: false, edit: false, permission }} />,
                            },
                            {
                                label: `Histórico`,
                                key: '8',
                                children: <div></div>//<PaletesHistoryList {...{ parameters: props?.parameters, permission }} />,
                            },
                        ]}

                    />}
                {(!bobineExists && !submitting.state) && <Empty description="A Bobine não foi encontrada!" />}
            </YScroll>
        </div>
        // </Context.Provider>
    )

}