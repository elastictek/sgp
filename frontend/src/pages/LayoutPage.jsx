import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { PAGE_TOOLBAR_HEIGHT } from "config"
import { Outlet, useNavigate } from "react-router-dom";
import { Button, Spin, Tag, List, Typography, Form, InputNumber, Input, Card, Collapse, DatePicker, Space, Alert, Modal } from "antd";
import YScroll from "components/YScroll";
import ResponsiveModal from "components/ResponsiveModal";

const FormLotes = React.lazy(() => import('./currentline/FormLotes'));
const OFabricoShortList = React.lazy(() => import('./OFabricoShortList'));

const TitleWnd = ({ title }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Space>
                    <div><b style={{ textTransform: "capitalize" }}></b>{title}</div>
                </Space>
            </div>
        </div>
    );
}


const Wnd = ({ parameters, setVisible }) => {
    return (
        <ResponsiveModal
            title={<TitleWnd title={parameters.title} />}
            visible={parameters.visible}
            centered
            responsive
            onCancel={setVisible}
            maskClosable={true}
            destroyOnClose={true}
            fullWidthDevice={parameters.fullWidthDevice}
            width={parameters?.width}
            height={parameters?.height}
            bodyStyle={{ /* backgroundColor: "#f0f0f0" */ }}
        >
            <YScroll>
                {parameters.type === "lotesmp" && <Suspense fallback={<></>}><FormLotes /></Suspense>}
                {parameters.type === "ofabricoshortlist" && <Suspense fallback={<></>}><OFabricoShortList feature={parameters.data.feature} /></Suspense>}
            </YScroll>
        </ResponsiveModal>
    );

}

export default () => {
    const [modalParameters, setModalParameters] = useState({ visible: false });
    const navigate = useNavigate();

    const onModalVisible = (e, type, feature) => {
        if (!type) {
            setModalParameters(prev => ({ visible: false }));
        } else {
            switch (type) {
                case "lotesmp": setModalParameters(prev => ({ visible: !prev.visible, type, fullWidthDevice: 100, title: "Lotes em Linha de Produção", data: {} })); break;
                case "ofabricoshortlist":
                    let title = (feature === "dosers_change") ? "Alteração de Doseadores" : "Alteração de Formulação";
                    setModalParameters(prev => ({ visible: !prev.visible, type, width: "500px", height: "400px", fullWidthDevice: 2, data: { feature }, title })); break;
            }
        }
    }

    return (
        <div>
            <Wnd parameters={modalParameters} setVisible={onModalVisible} />
            <div style={{ height: PAGE_TOOLBAR_HEIGHT, maxHeight: PAGE_TOOLBAR_HEIGHT, overflow: "hidden", overflowY: "auto", }}>
                <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
                    <li onClick={() => { navigate('/app'); window.location.reload(); }} style={{ float: "left", cursor: "pointer", color: "blue", marginLeft: "10px", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div>Refresh</div>
                    </li>
                    <li onClick={() => navigate('/app')} style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div>Home</div>
                    </li>
                    <li onClick={() => navigate('/')} style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div>Home SGP</div>
                    </li>
                    {/*                     <li style={{float: "left",cursor:"pointer", color:"blue", marginRight:"10px", backgroundColor: "lightgray", width:"120px", textAlign: "center"}}>
                        <div onClick={() => navigate('/app/sorders')}>Encomendas</div>
                    </li> */}
                    <li onClick={() => navigate('/app/ofabricolist')} style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div>Ordens Fabrico</div>
                    </li>
                    <li onClick={() => navigate('/app/validateReellings')} style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div >Validar Bobinagens</div>
                    </li>
                    <li onClick={() => onModalVisible(null, 'lotesmp')} style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div >Lotes MP</div>
                    </li>
                    <li onClick={() => onModalVisible(null, 'ofabricoshortlist', "dosers_change")} style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div >Alterar Doseadores</div>
                    </li>
                    <li onClick={() => onModalVisible(null, 'ofabricoshortlist', "formulation_change")} style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div >Alterar Formulação</div>
                    </li>
                    <li onClick={() => navigate('/app/stocklist')} style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div >Lotes Stock (Formulacao Ativa)</div>
                    </li>
                    <li onClick={() => navigate('/app/logslist/lineloglist')} style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div >Eventos da Linha</div>
                    </li>
                    <li onClick={() => navigate('/app/logslist/stockloglist')} style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div >Movimento de Lotes</div>
                    </li>
                    <li onClick={() => navigate('/app/bobines/bobinesoriginaislist')} style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div >Bobines Originais</div>
                    </li>
                    <li onClick={() => navigate('/app/bobinagens/fixlotes')} style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center", height: PAGE_TOOLBAR_HEIGHT }}>
                        <div>Corrigir Consumos de Bobinagens</div>
                    </li>
                    {/*                     <li style={{float: "left",cursor:"pointer", color:"blue", marginRight:"10px", backgroundColor: "lightgray", width:"120px", textAlign: "center"}}>
                        <div onClick={() => navigate('/app/ordemfabrico/formdetails', { state: { id: 48 } })}>Form Ordem Fabrico</div>
                    </li> */}
                    {/*                     <li style={{float: "left",cursor:"pointer", color:"blue", marginRight:"10px", backgroundColor: "lightgray", width:"120px", textAlign: "center"}}>
                        <div onClick={() => navigate('/notexists')}>Not Found</div>
                    </li> */}
                </ul>
            </div>
            <Outlet />
        </div>
    );

}