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

const StyledCollapse = styled(Collapse)`
    .ant-collapse-content-box{
        padding:0px 0px !important;
        display:flex;
        flex-direction:column;
        align-items:start;
    }
    .ant-collapse-header-text{
        color:#fff;
        font-size:14px;
    }
    .ant-collapse-expand-icon{
        color:#fff;
    }
    .ant-btn-link{
        color:#d9d9d9;
        &:hover{
            background:#91d5ff;
            color:#000;
        }
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
const idMenu = "dashb-menu-01";
const selectedItems = getLocalStorage(idMenu);

const IFrame = ({src})=> {
    return <div dangerouslySetInnerHTML={{ __html: `<iframe frameBorder="0" onload="this.width=screen.width;this.height=screen.height;" src='${src}'/>`}} />;
}

export default ({dark=false}) => {
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
    const [showFrameModal, hideFrameModal] = useModal(({ in: open, onExited }) => (
            <ResponsiveModal title={modalParameters.title} lazy={true} footer="ref" onCancel={hideFrameModal} width={5000} height={5000}><IFrame src={modalParameters.src}/></ResponsiveModal>
    ), [modalParameters]);

    const onMenuChange = (v) => {
        localStorage.setItem(idMenu, JSON.stringify(v));
    }

    const onClickItemFrame = (src,title) => {
        setModalParameters({src,title});
        showFrameModal();
    }

    return (

        <StyledCollapse defaultActiveKey={selectedItems} ghost={true} expandIconPosition="end" onChange={onMenuChange}>
            <Panel header={<b>Picagem de Material</b>} key="1">
                <Button size='small' type="link" onClick={() => navigate('/app/picking/recicladolist', {})}>Reciclado (Granulado)</Button>
                <Button size='small' type="link" onClick={() => navigate('/app/picking/picknwlist', {})}>Linha de Produção - Nonwoven</Button>
{/*                 <Button size='small' type="link">Linha de Produção - Cores</Button> */}
{/*                 <Button size='small' type="link" onClick={() => navigate('/app/picking/pickgranuladolist', {})}>Linha de Produção - Granulado</Button> */}
            </Panel>
            <Panel header={<b>Planeamento</b>} key="2">
                <Button size='small' type="link" onClick={() => navigate('/app/ofabricolist', {})}>Ordens de Fabrico</Button>
                <Button size='small' type="link" onClick={() => onClickItemFrame('/producao/perfil/list/','Perfis de Bobinagem')}>Perfis de Bobinagem</Button>
{/*                 <Button size='small' type="link" onClick={() => { }}>Formulação</Button>
                <Button size='small' type="link" onClick={() => { }}>Gama Operatória</Button>
                <Button size='small' type="link" onClick={() => { }}>Especificações</Button> */}
            </Panel>
            <Panel header={<b>Linha de Produção</b>} key="3">
                <Button size='small' type="link" onClick={() => navigate('/app/validateReellings', {})}>Bobinagens</Button>
                <Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/paletelist/`,'Paletes')}>Paletes</Button>
                <Button size='small' type="link" onClick={() => navigate('/app/logslist/lineloglist', {})}>Eventos da Linha</Button>
            </Panel>
            <Panel header={<b>Retrabalho</b>} key="4">
                <Button size='small' type="link" onClick={() => onClickItemFrame(`/planeamento/ordemdeproducao/list-retrabalho/`,'Ordens de Retrabalho')}>Ordens de Retrabalho</Button>
                <Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/retrabalho/`,'Bobinagens de Retrabalho')}>Bobinagens de Retrabalho</Button>
                <Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/palete/retrabalho/`,'Paletes de Retrabalho')}>Paletes de Retrabalho</Button>
            </Panel>
            <Panel header={<b>Armazém</b>} key="5">
                <Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/carga/`,'Cargas')}>Cargas</Button>
                <Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/palete/selecao/`,'Pesagem')}>Pesagem</Button>
                <Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/stock/`,'Stock')}>Stock</Button>
                <Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/export_bobines_originais/`,'Exportar')}>Exportar</Button>
            </Panel>
        </StyledCollapse>

    );

}