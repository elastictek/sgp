import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { useModal } from "react-modal-hook";
import YScroll from "components/YScroll";
import useWebSocket from 'react-use-websocket';
import { SOCKET } from 'config';
import { Button, Select, Typography, Card, Collapse, Space } from "antd";
const { Text } = Typography;
import { EditOutlined, HistoryOutlined, PaperClipOutlined } from '@ant-design/icons';

import ResponsiveModal from 'components/Modal';
import { Container,Row,Col } from 'react-grid-system';
const FormSettings = React.lazy(() => import('../ordemfabrico/FormSettings'));
const FormPaletizacao = React.lazy(() => import('../ordemfabrico/paletizacaoSchema/FormPaletizacaoSchema'));
const FormPaletesStock = React.lazy(() => import('../ordemfabrico/FormPaletesStock'));

const computeQty = (ofItem, paletesStock) => {
    const ps = paletesStock.find(v => v.of_id = ofItem.of_id);
    const total = { n_paletes: ofItem.n_paletes_total, linear_meters: ofItem.linear_meters, qty_encomenda: ofItem.qty_encomenda, paletes_stock: (ps.paletes ? ps.paletes.length : 0) };
    total.paletes_produzir = total.n_paletes - total.paletes_stock;
    return total;
}

export default ({ record, card, parentReload }) => {
    const [totais, setTotais] = useState({});
    const [settingsParams, setSettingsParams] = useState({});
    const [showSettingsModal, hideSettingsModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal lazy={true} footer="ref" onCancel={hideSettingsModal} width={800} height={650}><FormSettings forInput={settingsParams?.forInput} record={settingsParams} /></ResponsiveModal>
    ), [settingsParams]);
    const [paletizacaoParams, setPaletizacaoParams] = useState({});
    const [showPaletizacaoModal, hidePaletizacaoModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal lazy={true} footer="ref" onCancel={hidePaletizacaoModal} width={800} height={650}><FormPaletizacao forInput={paletizacaoParams?.forInput} record={paletizacaoParams} parentReload={parentReload} /></ResponsiveModal>
    ), [paletizacaoParams]);
    const [paletesStockParams, setPaletesStockParams] = useState({});
    const [showPaletesStockModal, hidePaletesStockModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal lazy={true} footer="ref" onCancel={hidePaletesStockModal} width={800} height={650}><FormPaletesStock forInput={paletesStockParams?.forInput} record={paletesStockParams} parentReload={parentReload} /></ResponsiveModal>
    ), [paletizacaoParams]);

    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimeofs`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        queryParams: { /* 'token': '123456' */ },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 500
    });

    useEffect(() => {
        const request = (async () => sendJsonMessage({ cmd: 'loadpaletes', value: { of_id: ofItem?.of_id } }));
        request();
        const interval = setInterval(request, 30000);
        return (() => clearInterval(interval));
    }, []);

    useEffect(() => {
        if (lastJsonMessage) {
            const _totais = computeQty(ofItem, record.paletesstock);
            _totais["paletes_produzidas"] = lastJsonMessage.rows.filter(obj => obj.num_bobines === obj.num_bobines_act).length;
            _totais["done"] = (_totais["n_paletes"] === (_totais["paletes_produzidas"] + _totais["paletes_stock"])) ? 1 : (_totais["n_paletes"] < (_totais["paletes_produzidas"] + _totais["paletes_stock"])) ? 2 : 0;
            setTotais({ ..._totais });
        }
    }, [lastJsonMessage?.hash]);

    const onEdit = () => {
        setModalParameters({ ...record });
        showModal();
    }

    const onAction = async (type) => {
        switch (type) {
            case 'settings':
                setSettingsParams({ aggItem: { ...ofItem, emendas: record.emendas, cores: record.cores }, csid: record.id });
                showSettingsModal();
                break;
            case 'schema':
                const paletizacao = JSON.parse(record.paletizacao.filter(v => v.of_id === ofItem.of_id)[0].paletizacao);
                setPaletizacaoParams({ aggItem: { ...ofItem }, paletizacao, items: paletizacao.details.reverse(), csid: record.id });
                showPaletizacaoModal();
                break;
            case 'paletes_stock':
                window.location.href = `/planeamento/ordemdeproducao/details/${ofItem?.of_id}/`;
                //const paletesstock = (record?.paletesstock) ? JSON.parse(record.paletesstock?.filter(v => v.of_id === ofItem.of_id)[0].paletes) : [];
                //setPaletesStockParams({ aggItem: { ...ofItem }, paletesstock, csid: record.id });
                //showPaletesStockModal();
                break;
            case "palete":
                window.location.href = `/producao/palete/create/`;
                break;
        }
    }

    /*     useEffect(() => {
            setTotais(computeQty(ofItem, record.paletesstock));
        }, []) */

    return (
        <>
            <Container>
                <Row>

                    {Object.keys(record).length > 0 && record.ofs.map((ofItem, idx) => { return(
                    <Col style={{border: "1px solid #8c8c8c"}}><Card
                        headStyle={{ backgroundColor: "#002766", color: "#fff" }}
                        title={<div>
                            <div style={{ fontWeight: 700, fontSize: "12px", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                <div>{ofItem.of_cod}</div>
                            </div>
                            <div style={{ color: "#fff", fontSize: ".6rem" }}>{ofItem.cliente_nome}</div>
                        </div>}
                        size="small"
                        actions={[
                            <div key="settings" onClick={() => onAction('settings')} title="Outras definições">Definições</div>,
                            <div key="schema" onClick={() => onAction('schema')} title="Paletização (Esquema)">Paletização</div>,
                            <div key="paletes_stock" onClick={() => onAction('paletes_stock')}>Stock</div>,
                            <div key="attachments" onClick={() => onAction('attachments')}><span><PaperClipOutlined />Anexos</span></div>
                        ]}
                        extra={<div>{record.status > 0 && <Button size="small" onClick={() => onAction('palete')}>Criar Palete</Button>}</div>}
                        hoverable
                        //onClick={onEdit}
                        style={{ height: "100%" }}
                        bodyStyle={{ height: "calc(100% - 90px)" }}
                    /* title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{card.title}</div>} */
                    //extra={<Space><Button onClick={onEdit} icon={<HistoryOutlined />} /></Space>}
                    >
                        <YScroll>
                            <Text strong style={{ fontSize: "11px" }}>{ofItem.item_des}</Text>
                            <div><Text>{ofItem.prf_cod}</Text></div>
                            <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                                <div>Encomenda</div>
                                <div style={{ minWidth: "120px", fontWeight: 700, fontSize: "12px" }}>{totais.qty_encomenda} m&#178;</div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>Paletes Total</div>
                                <div style={{ minWidth: "120px", fontWeight: 700, fontSize: "12px" }}>{totais.n_paletes}</div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>Paletes Stock</div>
                                <div style={{ minWidth: "120px", fontWeight: 700, fontSize: "12px" }}>{totais.paletes_stock}</div>
                            </div>
                            <div style={{ borderTop: "solid 1px #000", display: "flex", justifyContent: "space-between" }}>
                                <div>Produzir (Produzidas)</div>
                                <div style={{ minWidth: "120px", fontWeight: 700, fontSize: "14px", ...(totais.done === 1) && { color: "#389e0d" }, ...(totais.done === 2) && { color: "#d46b08" } }}>{totais.paletes_produzir} ({totais.paletes_produzidas})</div>
                            </div>
                        </YScroll>
                    </Card>
                    </Col>)
                    })}
                </Row>
            </Container>
        </>
    );
}
