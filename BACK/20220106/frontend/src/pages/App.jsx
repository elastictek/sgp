import React, { useEffect, useState, Suspense, lazy } from 'react';
import ReactDOM from "react-dom";
import { Route, Routes, useRoutes, BrowserRouter } from 'react-router-dom';
import { Spin } from 'antd';
import './app.css'
import 'antd/dist/antd.compact.less';

const NotFound = lazy(() => import('./404'));
const SOrders = lazy(() => import('./SOrders'));
const LayoutPage = lazy(() => import('./LayoutPage'));
const OFDetails = lazy(() => import('./ordemFabrico/FormDetails'));

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
                {path: "sorders", element: <Suspense fallback={<Spin />}><SOrders /></Suspense>},
                {path: "ordemfabrico/formdetails", element: <Suspense fallback={<Spin />}><OFDetails /></Suspense>},
            ]
        },
        {path: "*", element: <Suspense fallback={<Spin />}><NotFound /></Suspense>}
    ]);
    return element;
};



const App = () => {
    return (
        <BrowserRouter>
            {/*             <Routes> */}
            {/* <Route path="/app" element={<Suspense fallback={<Spin />}><LayoutPage /></Suspense>} />
                <Route path="/app/sorders" element={<Suspense fallback={<Spin />}><SOrders /></Suspense>} />
                <Route path="/app/ordemfabrico/formdetails" element={<Suspense fallback={<Spin />}><OFDetails /></Suspense>} />
                <Route path="*" element={<Suspense fallback={<Spin />}><NotFound /></Suspense>} /> */}
            <RenderRouter />
            {/*             </Routes> */}
        </BrowserRouter>
    );
}


export default App;

const container = document.getElementById("app");
ReactDOM.render(<App />, container);