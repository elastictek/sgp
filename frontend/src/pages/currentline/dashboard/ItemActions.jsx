import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL, ROOT_URL } from "config";
import { useModal } from "react-modal-hook";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space } from "antd";
const { Panel } = Collapse;
import { EditOutlined, HistoryOutlined } from '@ant-design/icons';

import ResponsiveModal from 'components/Modal';
/* const FormCortes = React.lazy(() => import('../FormCortes')); */


const StyledCollapse = styled(Collapse)`
    .ant-collapse-content-box{
        padding:0px 0px !important;
        display:flex;
        flex-direction:column;
        align-items:start;
    }
    .ant-collapse-header{
        padding:0px 0px !important;
    }
`

const getLocalStorage = (id) => {
    if (id) {
        const selItems = JSON.parse(localStorage.getItem(id));
        return (selItems) ? selItems : ['1'];
    }
    return ['1'];
}
const idMenu="dashb-menu-01";
const selectedItems=getLocalStorage(idMenu);

export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal footer="ref" onCancel={hideModal} width={800} height={400}>
            <div></div>
        </ResponsiveModal>
    ), [modalParameters]);
    const onEdit = () => {
        setModalParameters({ ...record });
        showModal();
    }

    const onMenuChange = (v)=>{
        localStorage.setItem(idMenu, JSON.stringify(v));
    }

    return (
        <>
            {Object.keys(record).length > 0 && <Card
                hoverable
                /* onClick={onEdit} */
                style={{ height: "100%" }} bodyStyle={{ height: "calc(100% - 45px)" }}
                size="small"
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{card.title}</div>}
            >
                <YScroll>
                    <StyledCollapse defaultActiveKey={selectedItems} ghost={true} expandIconPosition="end" onChange={onMenuChange}>
                        <Panel header={<b>Picagem de Material</b>} key="1">
                            <Button size='small' type="link" onClick={() => navigate('/app/picking/granuladolist', {})}>Reciclado (Granulado)</Button>
                            <Button size='small' type="link">Linha de Produção - Nonwoven</Button>
                            <Button size='small' type="link">Linha de Produção - Cores</Button>
                            <Button size='small' type="link">Linha de Produção - Granulado</Button>
                        </Panel>
                        <Panel header={<b>Planeamento</b>} key="2">
                            <Button size='small' type="link" onClick={() => navigate('/app/ofabricolist', {})}>Ordens de Fabrico</Button>
                            <Button size='small' type="link" onClick={() => window.location.href='/producao/perfil/list/'}>Perfis de Bobinagem</Button>
                            <Button size='small' type="link" onClick={()=>{}}>Formulação</Button>
                            <Button size='small' type="link" onClick={()=>{}}>Gama Operatória</Button>
                            <Button size='small' type="link" onClick={()=>{}}>Especificações</Button>
                        </Panel>
                        <Panel header={<b>Linha de Produção</b>} key="3">
                            <Button size='small' type="link" onClick={() => navigate('/app/validateReellings',{})}>Bobinagens</Button>
                            <Button size='small' type="link" onClick={() => window.location.href = `/producao/paletelist/`}>Paletes</Button>                            
                        </Panel>
                        <Panel header={<b>Retrabalho</b>} key="4">
                            <Button size='small' type="link" onClick={() => window.location.href = `/producao/retrabalho/`}>Bobinagens de Retrabalho</Button>
                            <Button size='small' type="link" onClick={() => window.location.href = `/producao/palete/retrabalho/`}>Paletes de Retrabalho</Button>                            
                        </Panel>
                        <Panel header={<b>Armazém</b>} key="5">
                            <Button size='small' type="link" onClick={() => window.location.href = `/producao/carga/`}>Cargas</Button>
                        </Panel>                        
                    </StyledCollapse>
                </YScroll>
            </Card>
            }
        </>
    );
}
