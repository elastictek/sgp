import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import moment from 'moment';
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
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs } from "antd";
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
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { MediaContext } from "../App";
import FormPalete from './FormPalete';
import BobinesDefeitosList from '../bobines/BobinesDefeitosList';
import BobinesDestinosList from '../bobines/BobinesDestinosList';
import BobinesPropriedadesList from '../bobines/BobinesPropriedadesList';
import PaletesHistoryList from './PaletesHistoryList';
import BobinesMPGranuladoList from '../bobines/BobinesMPGranuladoList';
import FormPaletizacao from './FormPaletizacao';
import { FaWeightHanging } from 'react-icons/fa';


export const Context = React.createContext({});


export const LeftToolbar = ({ form, dataAPI, permission }) => {
    return (<>
        {/* <Button title='Retroceder' type="link" icon={<LeftOutlined />} onClick={() => navigate(-1)}></Button> */}
    </>);
}

export const RightToolbar = ({ form, dataAPI, permission, edit }) => {
    return (
        <Space>
            <Button disabled={!permission.isOk({ action: "printEtiqueta" })} title='Imprimir Etiqueta' icon={<PrinterOutlined />} onClick={() => { }}>Etiqueta</Button>
            <Button disabled={!edit || !permission.isOk({ action: "refazerPalete" })} onClick={() => { }}>Refazer Palete</Button>
            <Button disabled={!edit || !permission.isOk({ action: "pesarPalete" })} icon={<FaWeightHanging />} onClick={() => { }}>Pesar Palete</Button>
        </Space>
    );
}

export const BtnEtiquetasBobines = () => {
return(
    <Button icon={<PrinterOutlined />} onClick={onPrint} title="Imprimir Etiquetas das bobines">Etiquetas</Button>
);
}

// const ToolbarTable = ({ form, dataAPI, typeListField, validField, typeField }) => {
//     const navigate = useNavigate();

//     const onChange = (v, field) => {
//         /* if (field === "typelist") {
//             navigate("/app/validateReellings", { replace:true, state: { ...dataAPI.getAllFilter(), typelist: v, tstamp: Date.now() } });
//         } else {
//             form.submit();
//         } */

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
    const [modalParameters, setModalParameters] = useState({});
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
        const {palete,..._parameters} = props?.parameters || {};
        const { ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, _parameters, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys(_parameters ? _parameters : {})]);
        setActiveTab(props?.tab);
        console.log("####", initFilters)
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



            <Tabs type="card" dark={1} defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}
                items={[
                    {
                        label: `Informação`,
                        key: '1',
                        children: <FormPalete {...{ parameters: props?.parameters, permission }} />,
                    },
                    {
                        label: `Embalamento`,
                        key: '2',
                        children: <FormPaletizacao {...{ parameters: props?.parameters, permission }} />,
                    },
                    {
                        label: `Bobines`,
                        key: '3',
                        children: <BobinesPropriedadesList {...{ parameters: props?.parameters, permission }} />,
                    }, {
                        label: `Bobines Defeitos`,
                        key: '4',
                        children: <BobinesDefeitosList {...{ parameters: props?.parameters, permission }} />,
                    },
                    {
                        label: `Bobines Destinos`,
                        key: '5',
                        children: <BobinesDestinosList {...{ parameters: props?.parameters, permission }} />,
                    },,
                    {
                        label: `MP Granulado (Lotes)`,
                        key: '6',
                        children: <BobinesMPGranuladoList {...{ parameters: props?.parameters, permission }} />,
                    },
                    {
                        label: `Histórico`,
                        key: '7',
                        children: <PaletesHistoryList {...{ parameters: props?.parameters, permission }} />,
                    },
                ]}

            />
        // </Context.Provider>
    )

}