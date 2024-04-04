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
import { usePermission, Permissions } from "utils/usePermission";

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

const IFrame = ({ src }) => {
    return <div dangerouslySetInnerHTML={{ __html: `<iframe frameBorder="0" onload="this.width=screen.width;this.height=screen.height;" src='${src}'/>` }} />;
}

export default ({ dark = false }) => {
    const navigate = useNavigate();
    const permission = usePermission({ name: "mainmenu" });
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
        <ResponsiveModal title={modalParameters.title} lazy={true} footer="ref" onCancel={hideFrameModal} width={5000} height={5000}><IFrame src={modalParameters.src} /></ResponsiveModal>
    ), [modalParameters]);

    const onMenuChange = (v) => {
        localStorage.setItem(idMenu, JSON.stringify(v));
    }

    const onClickItemFrame = (src, title) => {
        setModalParameters({ src, title });
        showFrameModal();
    }

    return (

        <StyledCollapse defaultActiveKey={selectedItems} ghost={true} expandIconPosition="end" onChange={onMenuChange}>
            <Permissions permissions={permission} item="pick" key="1" clone>
                <Panel header={<b>Picagem de Material</b>} key="1">
                    <Permissions permissions={permission} item="pick" action="A"><Button size='small' type="link" onClick={() => navigate('/app/picking/recicladolist', {})} title="A">Reciclado (Granulado)</Button></Permissions>
                    <Permissions permissions={permission} item="pick" action="B"><Button size='small' type="link" onClick={() => navigate('/app/picking/picknwlist', {})} title="B">Linha de Produção - Nonwoven</Button></Permissions>
                    {/*                 <Button size='small' type="link">Linha de Produção - Cores</Button> */}
                    {/*                 <Button size='small' type="link" onClick={() => navigate('/app/picking/pickgranuladolist', {})}>Linha de Produção - Granulado</Button> */}
                </Panel>
            </Permissions>
            <Permissions permissions={permission} item="planeamento" key="2" clone>
                <Panel header={<b>Planeamento</b>} key="2">
                    <Permissions permissions={permission} item="planeamento" action="A"><Button size='small' type="link" onClick={() => navigate('/app/ofabrico/ordensfabricolist/', {})} title="A">Ordens de Fabrico</Button></Permissions>
                    <Permissions permissions={permission} item="planeamento" action="B"><Button size='small' type="link" onClick={() => onClickItemFrame('/producao/perfil/list/', 'Perfis de Bobinagem')} title="B">Perfis de Bobinagem</Button></Permissions>
                    <Permissions permissions={permission} item="planeamento" action="C"><Button size='small' type="link" onClick={() => navigate('/app/ofabrico/checklists', {})} title="C">CheckLists</Button></Permissions>
                    <Permissions permissions={permission} item="planeamento" action="E"><Button size='small' type="link" onClick={() => navigate('/app/ofabrico/formulacaolist', {})} title="E">Formulações</Button></Permissions>
                    <Permissions permissions={permission} item="planeamento" action="F"><Button size='small' type="link" onClick={() => navigate('/app/ofabrico/paletizacoeslist', {})} title="F">Paletizações</Button></Permissions>
                    <Permissions permissions={permission} item="planeamento" action="D"><Button size='small' type="link" onClick={() => navigate('/app/artigos/artigoscompativeis', {})} title="D">Artigos Compatíveis</Button></Permissions>
                    {/*                 <Button size='small' type="link" onClick={() => { }}>Formulação</Button>
                <Button size='small' type="link" onClick={() => { }}>Gama Operatória</Button>
                <Button size='small' type="link" onClick={() => { }}>Especificações</Button> */}
                </Panel>
            </Permissions>
            <Permissions permissions={permission} item="materiasprimas" key="6" clone>
                <Panel header={<b>Matérias Primas</b>} key="6">
                    <Permissions permissions={permission} item="materiasprimas" action="A"><Button size='small' type="link" onClick={() => navigate('/app/artigos/consumoslist', {})} title="A">Consumos de Matérias Primas</Button></Permissions>
                    <Permissions permissions={permission} item="materiasprimas" action="B"><Button size='small' type="link" onClick={() => navigate('/app/artigos/mpalternativas', {})} title="B">Matérias Primas Alternativas</Button></Permissions>
                    <Permissions permissions={permission} item="materiasprimas" action="C"><Button size='small' type="link" onClick={() => navigate('/app/artigos/granuladobufferlinelist', {})} title="C">Granulado Movimentos Buffer&#8594;Linha</Button></Permissions>
                    <Permissions permissions={permission} item="materiasprimas" action="D"><Button size='small' type="link" onClick={() => navigate('/app/artigos/granuladolist', {})} title="D">Granulado Movimentos em Linha</Button></Permissions>
                    <Permissions permissions={permission} item="materiasprimas" action="E"><Button size='small' type="link" onClick={() => navigate('/app/artigos/nwlist', {})} title="E">Nonwovens Movimentos em Linha</Button></Permissions>
                    <Permissions permissions={permission} item="materiasprimas" action="F"><Button size='small' type="link" onClick={() => navigate('/app/artigos/mpbufferlist', {})} title="F">Localização de Matéria Primas (SAGE)</Button></Permissions>
                    <Permissions permissions={permission} item="materiasprimas" action="G"><Button size='small' type="link" onClick={() => navigate('/app/artigos/mpmovimentoslist', {})} title="G">Matéria Primas Movimentos (SAGE)</Button></Permissions>
                </Panel>
            </Permissions>
            <Permissions permissions={permission} item="linhaproducao" key="3" clone>
                <Panel header={<b>Linha de Produção</b>} key="3">
                    <Permissions permissions={permission} item="linhaproducao" action="A"><Button size='small' type="link" onClick={() => navigate('/app/bobinagens/reellings', {})} title="A">Bobinagens</Button></Permissions>
                    <Permissions permissions={permission} item="linhaproducao" action="E"><Button size='small' type="link" onClick={() => navigate('/app/bobines/bobineslist', {})} title="A">Bobines</Button></Permissions>
                    {/* <Permissions permissions={permission} item="linhaproducao" action="B"><Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/paletelist/`, 'Paletes')} title="B">Paletes</Button></Permissions> */}
                    <Permissions permissions={permission} item="linhaproducao" action="C"><Button size='small' type="link" onClick={() => navigate('/app/paletes/paleteslist', {})} title="C">Paletes</Button></Permissions>
                    <Permissions permissions={permission} item="linhaproducao" action="D"><Button size='small' type="link" onClick={() => navigate('/app/logslist/lineloglist', {})} title="D">Eventos da Linha</Button></Permissions>
                </Panel>
            </Permissions>
            <Permissions permissions={permission} item="retrabalho" key="4" clone>
                <Panel header={<b>Retrabalho</b>} key="4">
                    <Permissions permissions={permission} item="retrabalho" action="A"><Button size='small' type="link" onClick={() => onClickItemFrame(`/planeamento/ordemdeproducao/list-retrabalho/`, 'Ordens de Retrabalho')} title="A">Ordens de Retrabalho</Button></Permissions>
                    <Permissions permissions={permission} item="retrabalho" action="B"><Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/retrabalho/`, 'Bobinagens de Retrabalho')} title="B">Bobinagens de Retrabalho</Button></Permissions>
                    <Permissions permissions={permission} item="retrabalho" action="C"><Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/palete/retrabalho/`, 'Paletes de Retrabalho')} title="C">Paletes de Retrabalho</Button></Permissions>
                </Panel>
            </Permissions>
            <Permissions permissions={permission} item="armazem" key="5" clone>
                <Panel header={<b>Armazém</b>} key="5">
                    {/* <Permissions permissions={permission} item="armazem" action="A"><Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/carga/`, 'Cargas')} title="A">Cargas</Button></Permissions> */}
                    {/* <Permissions permissions={permission} item="armazem" action="B"><Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/palete/selecao/`, 'Pesagem')} title="B">Pesagem</Button></Permissions> */}
                    {/* <Permissions permissions={permission} item="armazem" action="C"><Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/stock/`, 'Stock')} title="C">Stock</Button></Permissions> */}
                    <Permissions permissions={permission} item="armazem" action="D"><Button size='small' type="link" onClick={() => onClickItemFrame(`/producao/export_bobines_originais/`, 'Exportar')} title="D">Exportar</Button></Permissions>
                    <Permissions permissions={permission} item="armazem" action="E"><Button size='small' type="link" onClick={() => navigate('/app/devolucoes/devolucoeslist', {})} title="A">Devoluções de Produto Acabado</Button></Permissions>
                    <Permissions permissions={permission} item="armazem" action="F"><Button size='small' type="link" onClick={() => navigate('/app/expedicoes/timearmazem', {})} title="B">Relatório de Expedições Mensal</Button></Permissions>
                </Panel>
            </Permissions>
            <Permissions permissions={permission} item="qualidade" key="8" clone>
                <Panel header={<b>Qualidade</b>} key="8">
                    <Permissions permissions={permission} item="qualidade" action="A"><Button size='small' type="link" onClick={() => navigate('/app/qualidade/labparameterslist', {})} title="A">Parâmetros</Button></Permissions>
                    <Permissions permissions={permission} item="qualidade" action="B"><Button size='small' type="link" onClick={() => navigate('/app/qualidade/labmetodoslist', {})} title="B">Métodos</Button></Permissions>
                    <Permissions permissions={permission} item="qualidade" action="C"><Button size='small' type="link" onClick={() => navigate('/app/qualidade/labartigosspecslist', {})} title="C">Especificações dos Artigos</Button></Permissions>
                    <Permissions permissions={permission} item="qualidade" action="D"><Button size='small' type="link" onClick={() => navigate('/app/qualidade/labbobinagensessayslist', {})} title="D">Ensaios de Bobinagens</Button></Permissions>
                </Panel>
            </Permissions>
            <Permissions permissions={permission} item="reports" key="7" clone>
                <Panel header={<b>Relatórios</b>} key="7">
                    <Permissions permissions={permission} item="reports" action="A"><Button size='small' type="link" onClick={() => navigate('/app/artigos/artigosproducao', {})} title="E">Volume Produzido - Artigos</Button></Permissions>
                </Panel>
            </Permissions>
            <Permissions permissions={permission} item="comercial" key="9" clone>
                <Panel header={<b>Comercial</b>} key="9">
                    <Permissions permissions={permission} item="comercial" action="A"><Button size='small' type="link" onClick={() => navigate('/app/comercial/salespricelist', {})} title="A">Preços de Venda</Button></Permissions>
                </Panel>
            </Permissions>
        </StyledCollapse>

    );

}