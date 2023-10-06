import React, { useEffect, useState, Suspense, lazy, useContext, useRef } from 'react';
//import ReactDOM from "react-dom";
import * as ReactDOM from 'react-dom/client';
import { Route, Routes, useRoutes, BrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin, Input, Modal, notification, ConfigProvider } from 'antd';
import { useMediaQuery } from 'react-responsive';
import './app.css'
//import 'antd/dist/antd.compact.less';
import 'antd/dist/reset.css';
import { SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import { useImmer } from "use-immer";
import useMedia from 'utils/useMedia';
import { ModalProvider } from "react-modal-hook";
import GridLayout from './dashboard/GridLayout';
import { useSubmitting } from "utils";
import YScroll from "components/YScroll";
import { fetch, fetchPost } from "utils/fetch";
import { API_URL, ROOT_URL } from "config";
import { openNotification } from 'components/openNotification';
import { json } from "utils/object";
import dayjs from 'dayjs';
let quarterOfYear = require('dayjs/plugin/quarterOfYear');
dayjs.extend(quarterOfYear);

/*import 'react-data-grid/lib/styles.css';*/




const NotFound = lazy(() => import('./404'));
const SOrders = lazy(() => import('./SOrders'));
const OFabricoList = lazy(() => import('./OFabricoList'));
const OFabricoShortList = lazy(() => import('./OFabricoShortList'));
/* const BobinagensValidarList = lazy(() => import('./bobinagens/BobinagensValidarList')); */
const BobinagensList = lazy(() => import('./bobinagens/BobinagensList'));

const FormBobinagemValidar = lazy(() => import('./bobinagens/FormValidar'));

const StockList = lazy(() => import('./artigos/StockList'));
const MPBufferList = lazy(() => import('./artigos/MPBufferList'));
const LayoutPage = lazy(() => import('./LayoutPage'));
const FormPickMP = lazy(() => import('./currentline/FormPickMP'));
const LineLogList = lazy(() => import('./logslist/LineLogList'));
const StockLogList = lazy(() => import('./logslist/StockLogList'));
const ExpedicoesTempoList = lazy(() => import('./expedicoes/ExpedicoesTempoList'));
const ConsumptionNeedLogList = lazy(() => import('./logslist/ConsumptionNeedLogList'));
const BobinesOriginaisList = lazy(() => import('./bobines/BobinesOriginaisList'));
const BobinesList = lazy(() => import('./bobines/BobinesList'));
const BobinesValidarList = lazy(() => import('./bobines/BobinesValidarList'));
const BobinagensFixLotes = lazy(() => import('./bobinagens/BobinagensFixLotes'));
const FormMenuActions = lazy(() => import('./currentline/FormMenuActions'));
const FormPalete = lazy(() => import('./paletes/FormPalete'));
const RecicladoList = lazy(() => import('./picking/RecicladoList'));
const PickReciclado = lazy(() => import('./picking/PickReciclado'));
const PickNWList = lazy(() => import('./picking/PickNWList'));
const PickGranuladoList = lazy(() => import('./picking/PickGranuladoList'));
const GranuladoList = lazy(() => import('./artigos/GranuladoList'));
const NwList = lazy(() => import('./artigos/NwList'));
const MPAlternativas = lazy(() => import('./artigos/MPAlternativas'));
const DevolucoesList = lazy(() => import('./devolucoes/DevolucoesList'));
const GranuladoBufferLineList = lazy(() => import('./artigos/GranuladoBufferLineList'));
const ConsumosList = lazy(() => import('./artigos/ConsumosList'));
const FormEtapasCortes = lazy(() => import('./currentline/FormEtapasCortes'));
const PaletesList = lazy(() => import('./paletes/PaletesList'));
const BasePick = lazy(() => import('./picking/BasePick'));
const GranuladoPick = lazy(() => import('./picking/GranuladoPick'));
const CheckLists = lazy(() => import('./ordensfabrico/CheckLists'));
const ArtigosCompativeis = lazy(() => import('./artigos/ArtigosCompativeis'));
const ArtigosProducao = lazy(() => import('./artigos/ArtigosProducao'));
const LabParametersList = lazy(() => import('./qualidade/LabParametersList'));
const LabMetodosList = lazy(() => import('./qualidade/LabMetodosList'));
const LabArtigosSpecsList = lazy(() => import('./qualidade/LabArtigosSpecsList'));
const LabBobinagensEssaysList = lazy(() => import('./qualidade/LabBobinagensEssaysList'));

const Formulacao = lazy(() => import('./formulacao/FormFormulacao'));
const FormulacaoReadOnly = lazy(() => import('./formulacao/FormulacaoReadOnly'));
const FormulacaoList = lazy(() => import('./formulacao/FormulacoesList'));
const OrdemFabrico = React.lazy(() => import('./ordensfabrico/OrdemFabrico'));
const OrdensFabricoList = React.lazy(() => import('./ordensfabrico/OrdensFabricoList'));

const SalesPriceList = lazy(() => import('./comercial/SalesPriceList'));
const FormNewPaleteLine = lazy(() => import('./paletes/FormNewPaleteLine'));
const LinkExpired = lazy(() => import('./linkExpired'));


/* const OFDetails = lazy(() => import('./ordemFabrico/FormDetails')); */

export const LayoutContext = React.createContext({});
export const MediaContext = React.createContext({});
// export const SocketContext = React.createContext({});
export const AppContext = React.createContext({});

import { Field, Container } from 'components/FormFields';
import { Row, Col } from 'react-grid-system';
import WidgetEstadoProducao from './producao/WidgetEstadoProducao';
import FormPickGranuladoIn from './picking/FormPickGranuladoIn';
import FormPickGranuladoOut from './picking/FormPickGranuladoOut';
const MainPicking = lazy(() => import('./picking/MainPicking'));
const FormPickNonwovensIn = lazy(() => import('./picking/FormPickNonwovensIn'));
const FormPickNewPaleteLine = lazy(() => import('./picking/FormPickNewPaleteLine'));
const FormPickRedoPaleteLine = lazy(() => import('./picking/FormPickRedoPaleteLine'));
const FormPickWeighPalete = lazy(() => import('./picking/FormPickWeighPalete'));
const FormPickDeletePalete = lazy(() => import('./picking/FormPickDeletePalete'));


const loadAuthUser = async ({ }, signal) => {
    let response;
    try {
        response = await fetchPost({ url: `${API_URL}/getauthuser/`, parameters: {}, signal });
    } catch (e) {
        Modal.error({
            centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro de Autenticação', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}>
                <YScroll>
                    {e.message}
                    <div style={{ textAlign: "center", marginTop: "10px" }}><a href={`${ROOT_URL}/users/login/`}><b>Login</b></a></div>
                </YScroll>
            </div></div>,
            onOk: () => window.location.href = `${ROOT_URL}/users/login/`
        });
    };
    return response;
}



const WrapperRouteComponent = ({ titleId, auth, ...props }) => {
    //const { formatMessage } = useIntl();
    //const WitchRoute = auth ? PrivateRoute : Route;
    const WitchRoute = Route;
    //if (titleId) {document.title = formatMessage({id: titleId});}
    return <WitchRoute {...props} />;
};


const MainLayout = () => {
    const location = useLocation();
    return (<>
        {(location.pathname === "/app" || location.pathname === "/app/") && <GridLayout />}<Outlet />
    </>);
}

const RenderRouter = () => {
    let element = useRoutes([
        {
            path: '/app',
            //element: <Suspense fallback={<Spin />}><LayoutMain /></Suspense>,
            //element: <Suspense fallback={<Spin />}><LayoutPage /></Suspense>,
            element: <MainLayout />,
            children: [
                { path: "bobinagens/reellings", element: <Suspense fallback={<Spin />}><BobinagensList /></Suspense> },
                /* { path: "validateReellings", element: <Suspense fallback={<Spin />}><BobinagensValidarList /></Suspense> }, //TO REMOVE */
                { path: "bobines/validarlist", element: <Suspense fallback={<Spin />}><BobinesValidarList /></Suspense> },
                { path: "ofabricolist", element: <Suspense fallback={<Spin />}><OFabricoList /></Suspense> },
                { path: "sorders", element: <Suspense fallback={<Spin />}><SOrders /></Suspense> },
                { path: "pick", element: <Suspense fallback={<Spin />}><FormPickMP /></Suspense> },
                { path: "paletes/palete", element: <Suspense fallback={<Spin />}><FormPalete /></Suspense> },
                { path: "ofabricoshortlist", element: <Suspense fallback={<Spin />}><OFabricoShortList /></Suspense> },
                { path: "stocklist", element: <Suspense fallback={<Spin />}><StockList /></Suspense> },
                { path: "artigos/mpbufferlist", element: <Suspense fallback={<Spin />}><MPBufferList /></Suspense> },
                { path: "logslist/lineloglist", element: <Suspense fallback={<Spin />}><LineLogList /></Suspense> },
                { path: "logslist/stockloglist", element: <Suspense fallback={<Spin />}><StockLogList /></Suspense> },
                { path: "logslist/comsumptionneedloglist", element: <Suspense fallback={<Spin />}><ConsumptionNeedLogList /></Suspense> },
                { path: "bobines/bobinesoriginaislist", element: <Suspense fallback={<Spin />}><BobinesOriginaisList /></Suspense> },
                { path: "bobines/bobineslist", element: <Suspense fallback={<Spin />}><BobinesList /></Suspense> },
                { path: "bobinagens/fixlotes", element: <Suspense fallback={<Spin />}><BobinagensFixLotes /></Suspense> },
                { path: "currentline/menuactions", element: <Suspense fallback={<Spin />}><FormMenuActions /></Suspense> },
                { path: "expedicoes/timearmazem", element: <Suspense fallback={<Spin />}><ExpedicoesTempoList /></Suspense> },

                { path: "picking/recicladolist", element: <Suspense fallback={<Spin />}><RecicladoList /></Suspense> },
                { path: "picking/pickreciclado", element: <Suspense fallback={<Spin />}><PickReciclado /></Suspense> },
                { path: "picking/pickgranuladolist", element: <Suspense fallback={<Spin />}><PickGranuladoList /></Suspense> },
                { path: "picking/picknwlist", element: <Suspense fallback={<Spin />}><PickNWList /></Suspense> },

                { path: "ofabrico/checklists", element: <Suspense fallback={<Spin />}><CheckLists /></Suspense> },

                { path: "artigos/nwlist", element: <Suspense fallback={<Spin />}><NwList /></Suspense> },
                { path: "artigos/consumoslist", element: <Suspense fallback={<Spin />}><ConsumosList /></Suspense> },
                { path: "artigos/granuladobufferlinelist", element: <Suspense fallback={<Spin />}><GranuladoBufferLineList /></Suspense> },
                { path: "artigos/granuladolist", element: <Suspense fallback={<Spin />}><GranuladoList /></Suspense> },
                { path: "artigos/mpalternativas", element: <Suspense fallback={<Spin />}><MPAlternativas /></Suspense> },
                { path: "artigos/artigoscompativeis", element: <Suspense fallback={<Spin />}><ArtigosCompativeis /></Suspense> },
                { path: "artigos/artigosproducao", element: <Suspense fallback={<Spin />}><ArtigosProducao /></Suspense> },


                { path: "qualidade/labparameterslist", element: <Suspense fallback={<Spin />}><LabParametersList /></Suspense> },
                { path: "qualidade/labmetodoslist", element: <Suspense fallback={<Spin />}><LabMetodosList /></Suspense> },
                { path: "qualidade/labartigosspecslist", element: <Suspense fallback={<Spin />}><LabArtigosSpecsList /></Suspense> },
                { path: "qualidade/labbobinagensessayslist", element: <Suspense fallback={<Spin />}><LabBobinagensEssaysList /></Suspense> },

                { path: "devolucoes/devolucoeslist", element: <Suspense fallback={<Spin />}><DevolucoesList /></Suspense> },
                { path: "planeamento/etapascortes", element: <Suspense fallback={<Spin />}><FormEtapasCortes /></Suspense> },

                { path: "paletes/paleteslist", element: <Suspense fallback={<Spin />}><PaletesList /></Suspense> },
                { path: "paletes/formnewpaleteline", element: <Suspense fallback={<Spin />}><FormNewPaleteLine /></Suspense> },

                { path: "picking/base", element: <Suspense fallback={<Spin />}><BasePick /></Suspense> },
                { path: "picking/granulado", element: <Suspense fallback={<Spin />}><GranuladoPick /></Suspense> },

                { path: "ofabrico/formulacao", element: <Suspense fallback={<Spin />}><Formulacao /></Suspense> },
                { path: "ofabrico/formulacaoreadonly", element: <Suspense fallback={<Spin />}><FormulacaoReadOnly /></Suspense> },
                { path: "ofabrico/formulacaolist", element: <Suspense fallback={<Spin />}><FormulacaoList /></Suspense> },
                { path: "ofabrico/ordemfabrico", element: <Suspense fallback={<Spin />}><OrdemFabrico /></Suspense> },
                { path: "ofabrico/ordensfabricolist", element: <Suspense fallback={<Spin />}><OrdensFabricoList /></Suspense> },

                { path: "producao/widgetestadoproducao", element: <Suspense fallback={<Spin />}><WidgetEstadoProducao /></Suspense> },
                { path: "picking/main", element: <Suspense fallback={<Spin />}><MainPicking /></Suspense> },
                { path: "picking/nonwovensin", element: <Suspense fallback={<Spin />}><FormPickNonwovensIn /></Suspense> },
                { path: "picking/granuladoin", element: <Suspense fallback={<Spin />}><FormPickGranuladoIn /></Suspense> },
                { path: "picking/granuladoout", element: <Suspense fallback={<Spin />}><FormPickGranuladoOut /></Suspense> },
                { path: "picking/newpaleteline", element: <Suspense fallback={<Spin />}><FormPickNewPaleteLine /></Suspense> },
                { path: "picking/redopaleteline", element: <Suspense fallback={<Spin />}><FormPickRedoPaleteLine /></Suspense> },
                { path: "picking/weighpalete", element: <Suspense fallback={<Spin />}><FormPickWeighPalete /></Suspense> },
                { path: "picking/deletepalete", element: <Suspense fallback={<Spin />}><FormPickDeletePalete /></Suspense> },
               
                
                { path: "bobinagens/formbobinagemvalidar", element: <Suspense fallback={<Spin />}><FormBobinagemValidar /></Suspense> },

                { path: "comercial/salespricelist", element: <Suspense fallback={<Spin />}><SalesPriceList /></Suspense> },


                { path: "linkexpired", element: <Suspense fallback={<Spin />}><LinkExpired /></Suspense> },

                /*  { path: "ordemfabrico/formdetails", element: <Suspense fallback={<Spin />}><OFDetails /></Suspense> }, */
            ]
        },
        { path: "*", element: <Suspense fallback={<Spin />}><NotFound /></Suspense> }
    ]);
    return element;
};




const App = () => {
    const [width] = useMedia();
    const [api, contextHolder] = notification.useNotification();
    const submitting = useSubmitting(true);
    // const { lastJsonMessage: wsMessageBroadcast, sendJsonMessage: wsSendMessageBroadcast } = useWebSocket(`${SOCKET.url}/realtimealerts`, {
    //     onOpen: () => console.log(`Connected to Web Socket Broadcast`),
    //     queryParams: { /* 'token': '123456' */ },
    //     onError: (event) => { console.error(event); },
    //     shouldReconnect: (closeEvent) => true,
    //     reconnectInterval: 5000,
    //     reconnectAttempts: 500
    // });
    // const { lastJsonMessage: wsMessage, sendJsonMessage: wsSendMessage } = useWebSocket(`${SOCKET.url}/realtimegeneric`, {
    //     onOpen: () => console.log(`Connected to Web Socket generic`),
    //     queryParams: { /* 'token': '123456' */ },
    //     onError: (event) => { console.error(event); },
    //     shouldReconnect: (closeEvent) => true,
    //     reconnectInterval: 5000,
    //     reconnectAttempts: 500
    // });
    //const [aggId, setAggId] = useState(null);
    const aggId = useRef(null);
    // const [estadoProducao, setEstadoProducao] = useState({});
    const [auth, setAuth] = useState();

    const loadData = async ({ signal }) => {
        const response = await loadAuthUser({}, signal);
        console.log("AUTH-USER-LOAD:", response?.data)
        setAuth(response?.data);
        //setAuth({ ...response.data, isAdmin: false, permissions: { producao: 200 } });
        submitting.end();
    }
    useEffect(() => {
        const controller = new AbortController();
        let interval = null;
        //interval = loadInterval();
        loadData({ signal: controller.signal });
        return (() => { controller.abort(); interval && clearInterval(interval); });
        //sendJsonMessage({ cmd: 'initAlerts' });
    }, []);

/*     useEffect(() => {
            setEstadoProducao(wsMessageBroadcast);
            console.log("MESSAGE BROADCAST",wsMessageBroadcast?.hash?.hash_estadoproducao,wsMessageBroadcast?.hash?.hash_estadoproducao_realtime)
    }, [wsMessageBroadcast?.hash?.hash_estadoproducao]); */

    const updateAggId = (_aggId) => {
        /* if (_aggId) {
            console.log("get xxxxxxxxxxx do estado de produção ao server pelo aggId através de websocket");
            aggId.current = _aggId;
            wsSendMessage({ cmd: 'getEstadoProducao', value: { aggId: aggId.current } });
            //setAggId(_aggId);
        } else {
            aggId.current = null;
            //setAggId(null);
            setEstadoProducao(wsMessageBroadcast);
        } */
    }

    return (
        <BrowserRouter>
            <MediaContext.Provider value={width}>
                <AppContext.Provider value={{ auth,/*  estadoProducao,  */openNotification: openNotification(api), updateAggId }}>
                    {contextHolder}
                    {/* <SocketContext.Provider value={estadoProducao}> */}
                        <ModalProvider>
                            <ConfigProvider
                                theme={{
                                    token: {
                                        borderRadius:3,
                                        //sizeStep:2,
                                        //sizeUnit:2,
                                        fontSize:12,
                                        controlHeight:28
                                    },
                                }}>
                                {auth?.isAuthenticated && <RenderRouter />}
                            </ConfigProvider>
                        </ModalProvider>
                   {/*  </SocketContext.Provider> */}
                </AppContext.Provider>
            </MediaContext.Provider>
        </BrowserRouter>
    );
}

const container = document.getElementById("app");
const root = ReactDOM.createRoot(container);
root.render(<App />);