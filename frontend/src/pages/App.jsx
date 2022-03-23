import React, { useEffect, useState, Suspense, lazy, useContext } from 'react';
import ReactDOM from "react-dom";
import { Route, Routes, useRoutes, BrowserRouter } from 'react-router-dom';
import { Spin } from 'antd';
import { useMediaQuery } from 'react-responsive';
import './app.css'
import 'antd/dist/antd.compact.less';
import { SOCKET } from 'config';
import useWebSocket from 'react-use-websocket';
import { useImmer } from "use-immer";
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
dayjs.locale('pt');


const NotFound = lazy(() => import('./404'));
const SOrders = lazy(() => import('./SOrders'));
const OFabricoList = lazy(() => import('./OFabricoList'));
const BobinagensValidarList = lazy(() => import('./bobinagens/BobinagensValidarList'));
const LayoutPage = lazy(() => import('./LayoutPage'));
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
    const [width, setWidth] = useState();

    useEffect(() => {
        const orientation = (isPortrait) ? "portrait" : "landscape";
        if (isBigScreen) {
            setWidth({ width: 900, unit: "px", maxWidth: 80, maxUnit: "%", device: "bigscreen", orientation });
        } else if (isDesktop) {
            setWidth({ width: 800, unit: "px", maxWidth: 80, maxUnit: "%", device: "desktop", orientation });
        } else if (isTablet) {
            setWidth({ width: 100, unit: "%", maxWidth: 100, maxUnit: "%", device: "tablet", orientation });
        } else {
            setWidth({ width: 100, unit: "%", maxWidth: 100, maxUnit: "%", device: "mobile", orientation });
        }
    }, [isDesktop, isTablet, isMobile, isBigScreen]);

    return [width];
};

const App = () => {
    const [width] = useMedia();
    const [appState, updateAppState] = useImmer({});
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimealerts`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        /*         onMessage: (v) => {
                    if (lastJsonMessage) {
                        console.log(v,lastJsonMessage);
                    }
                }, */
        queryParams: { 'token': '123456' },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000
    });

    useEffect(() => {
        console.log("RECIVING",lastJsonMessage)
    }, [lastJsonMessage?.hash]);

    
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
ReactDOM.render(<App />, container);