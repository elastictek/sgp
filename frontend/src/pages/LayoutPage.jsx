import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { PAGE_TOOLBAR_HEIGHT } from "config"
import { Outlet, useNavigate } from "react-router-dom";
import { Button, Spin, Tag, List, Typography, Form, InputNumber, Input, Card, Collapse, DatePicker, Space, Alert, Modal } from "antd";
import YScroll from "components/YScroll";
import ResponsiveModal from "components/ResponsiveModal";

const FormLotes = React.lazy(() => import('./currentline/FormLotes'));

const TitleLotes = ({ }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Space>
                    <div><b style={{ textTransform: "capitalize" }}></b>Lotes em Linha de Produção</div>
                </Space>
            </div>
        </div>
    );
}


const Wnd = ({visible,setVisible}) => {
    return (
        <ResponsiveModal
            title={<TitleLotes />}
            visible={visible}
            centered
            responsive
            onCancel={setVisible}
            maskClosable={true}
            destroyOnClose={true}
            fullWidthDevice={100}
            bodyStyle={{ /* backgroundColor: "#f0f0f0" */ }}
        >
            <YScroll>
            <Suspense fallback={<></>}><FormLotes/></Suspense>
            </YScroll>
        </ResponsiveModal>
    );

}

export default () => {
    const [modalVisible, setModalVisible] = useState(false);
    const navigate = useNavigate();

    const onModalVisible = ()=>{
        setModalVisible(!modalVisible);
    }

    return (
        <div>
            <Wnd visible={modalVisible} setVisible={onModalVisible}/>
            <div style={{ height: PAGE_TOOLBAR_HEIGHT, maxHeight: PAGE_TOOLBAR_HEIGHT, overflow: "hidden", overflowY: "auto" }}>
                LAYOUT PAGE
                <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
                    <li style={{ float: "left", cursor: "pointer", color: "blue", marginLeft: "10px", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center" }}>
                        <div onClick={() => { navigate('/app'); window.location.reload(); }}>Refresh</div>
                    </li>
                    <li style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center" }}>
                        <div onClick={() => navigate('/app')}>Home</div>
                    </li>
                    <li style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center" }}>
                        <div onClick={()=>navigate('/')}>Home SGP</div>
                    </li>
                    {/*                     <li style={{float: "left",cursor:"pointer", color:"blue", marginRight:"10px", backgroundColor: "lightgray", width:"120px", textAlign: "center"}}>
                        <div onClick={() => navigate('/app/sorders')}>Encomendas</div>
                    </li> */}
                    <li style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center" }}>
                        <div onClick={() => navigate('/app/ofabricolist')}>Ordens Fabrico</div>
                    </li>
                    <li style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center" }}>
                        <div onClick={() => navigate('/app/validateReellings')}>Validar Bobinagens</div>
                    </li>
                    <li style={{ float: "left", cursor: "pointer", color: "blue", marginRight: "10px", backgroundColor: "lightgray", width: "120px", textAlign: "center" }}>
                        <div onClick={onModalVisible}>Lotes MP</div>
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