import React, { useEffect, useState, Suspense, lazy, useContext } from 'react';
//import ReactDOM from "react-dom";
import * as ReactDOM from 'react-dom/client';
import { Route, Routes, useRoutes, BrowserRouter } from 'react-router-dom';
import { Spin } from 'antd';
import { useMediaQuery } from 'react-responsive';
import './app.css'
import 'antd/dist/antd.compact.less';
import { SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import { useImmer } from "use-immer";
import useWindowDimensions from 'utils/useWindowDimensions';

const NotFound = lazy(() => import('./404'));
const SOrders = lazy(() => import('./SOrders'));
const OFabricoList = lazy(() => import('./OFabricoList'));
const OFabricoShortList = lazy(() => import('./OFabricoShortList'));
const BobinagensValidarList = lazy(() => import('./bobinagens/BobinagensValidarList'));
const StockList = lazy(() => import('./artigos/StockList'));
const LayoutPage = lazy(() => import('./LayoutPage'));
const FormLotes = lazy(() => import('./currentline/FormLotes'));
const LineLogList = lazy(() => import('./logslist/LineLogList'));
const StockLogList = lazy(() => import('./logslist/StockLogList'));
const BobinesOriginaisList = lazy(() => import('./bobines/BobinesOriginaisList'));
/* const OFDetails = lazy(() => import('./ordemFabrico/FormDetails')); */

export const MediaContext = React.createContext({});
export const SocketContext = React.createContext({});
export const AppContext = React.createContext({});

const WrapperRouteComponent = ({ titleId, auth, ...props }) => {
    //const { formatMessage } = useIntl();
    //const WitchRoute = auth ? PrivateRoute : Route;
    const WitchRoute = Route;
    //if (titleId) {document.title = formatMessage({id: titleId});}
    return <WitchRoute {...props} />;
};

const RenderRouter = () => {
    let element = useRoutes([
        {
            path: '/app',
            element: <Suspense fallback={<Spin />}><LayoutPage /></Suspense>,
            children: [
                { path: "validateReellings", element: <Suspense fallback={<Spin />}><BobinagensValidarList /></Suspense> },
                { path: "ofabricolist", element: <Suspense fallback={<Spin />}><OFabricoList /></Suspense> },
                { path: "sorders", element: <Suspense fallback={<Spin />}><SOrders /></Suspense> },
                { path: "pick", element: <Suspense fallback={<Spin />}><FormLotes /></Suspense> },
                { path: "ofabricoshortlist", element: <Suspense fallback={<Spin />}><OFabricoShortList /></Suspense> },
                { path: "stocklist", element: <Suspense fallback={<Spin />}><StockList /></Suspense> },
                { path: "logslist/lineloglist", element: <Suspense fallback={<Spin />}><LineLogList /></Suspense> },
                { path: "logslist/stockloglist", element: <Suspense fallback={<Spin />}><StockLogList /></Suspense> },
                { path: "bobines/bobinesoriginaislist", element: <Suspense fallback={<Spin />}><BobinesOriginaisList /></Suspense> },

                /*  { path: "ordemfabrico/formdetails", element: <Suspense fallback={<Spin />}><OFDetails /></Suspense> }, */
            ]
        },
        { path: "*", element: <Suspense fallback={<Spin />}><NotFound /></Suspense> }
    ]);
    return element;
};


const useMedia = () => {
    const isBigScreen = useMediaQuery({ minWidth: 1824 });
    const isDesktop = useMediaQuery({ minWidth: 992 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isPortrait = useMediaQuery({ orientation: 'portrait' });
    const windowDimension = useWindowDimensions();
    const [width, setWidth] = useState();

    useEffect(() => {
        const orientation = (isPortrait) ? "portrait" : "landscape";
        if (isBigScreen) {
            setWidth({ width: 900, unit: "px", maxWidth: 80, maxUnit: "%", device: "bigscreen", deviceW: 4, orientation, minWidthQuery: 1824, windowDimension });
        } else if (isDesktop) {
            setWidth({ width: 800, unit: "px", maxWidth: 80, maxUnit: "%", device: "desktop", orientation, deviceW: 3, minWidthQuery: 992, windowDimension });
        } else if (isTablet) {
            setWidth({ width: 100, unit: "%", maxWidth: 100, maxUnit: "%", device: "tablet", orientation, deviceW: 2, minWidthQuery: 768, maxWidthQuery: 991, windowDimension });
        } else {
            setWidth({ width: 100, unit: "%", maxWidth: 100, maxUnit: "%", device: "mobile", orientation, maxWidthQuery: 767, deviceW: 1, windowDimension });
        }
    }, [isDesktop, isTablet, isMobile, isBigScreen, windowDimension]);

    return [width];
};

const App = () => {
    const [width] = useMedia();
    const [appState, updateAppState] = useImmer({});
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimealerts`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        queryParams: { /* 'token': '123456' */ },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 500
    });

    useEffect(() => { }, [
        lastJsonMessage?.hash.hash_igbobinagens,
        lastJsonMessage?.hash.hash_bobinagens,
        lastJsonMessage?.hash.hash_buffer,
        lastJsonMessage?.hash.hash_dosers,
        lastJsonMessage?.hash.hash_doserssets,
        lastJsonMessage?.hash.hash_inproduction,
        lastJsonMessage?.hash.hash_lotes_availability
    ]);


    useEffect(() => {
        //sendJsonMessage({ cmd: 'initAlerts' });
    }, []);

    //    useEffect(()=>{
    //
    //   },[lastJsonMessage])

    return (
        <BrowserRouter>
            {/*             <Routes> */}
            {/* <Route path="/app" element={<Suspense fallback={<Spin />}><LayoutPage /></Suspense>} />
                <Route path="/app/sorders" element={<Suspense fallback={<Spin />}><SOrders /></Suspense>} />
                <Route path="/app/ordemfabrico/formdetails" element={<Suspense fallback={<Spin />}><OFDetails /></Suspense>} />
                <Route path="*" element={<Suspense fallback={<Spin />}><NotFound /></Suspense>} /> */}



            {/*  <Default><RenderRouter /></Default> */}


            {/*             <MediaContext.Provider value={contextValue}>
                
            </MediaContext.Provider> */}
            {/*             </Routes> */}
            <MediaContext.Provider value={width}>
                <AppContext.Provider value={{}}>
                    <SocketContext.Provider value={lastJsonMessage}>
                        <RenderRouter />
                    </SocketContext.Provider>
                </AppContext.Provider>
            </MediaContext.Provider>

        </BrowserRouter>
    );
}


export default App;

const container = document.getElementById("app");
const root = ReactDOM.createRoot(container);
root.render(<App />);
//ReactDOM.render(<App />, container);