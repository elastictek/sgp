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
import c3 from "c3";
import 'c3/c3.css';

import ResponsiveModal from 'components/Modal';
import { Container, Row, Col } from 'react-grid-system';
const FormSettings = React.lazy(() => import('../ordemfabrico/FormSettings'));
const FormPaletizacao = React.lazy(() => import('../ordemfabrico/paletizacaoSchema/FormPaletizacaoSchema'));
const FormPaletesStock = React.lazy(() => import('../ordemfabrico/FormPaletesStock'));

const computeQty = (ofItem, paletesStock) => {
    const ps = paletesStock.find(v => v.of_id = ofItem.of_id);
    const total = { n_paletes: ofItem.n_paletes_total, linear_meters: ofItem.linear_meters, qty_encomenda: ofItem.qty_encomenda, paletes_stock: (ps.paletes ? ps.paletes.length : 0) };
    total.paletes_produzir = total.n_paletes - total.paletes_stock;
    return total;
}



const Chart = ({ data, categories, className, bindto }) => {
    useEffect(() => {
        c3.generate({
            bindto: `#${bindto}`,
            size: {
                height: 160,
                width: 180
            },
            data: {
                columns: [...data],
                type: 'donut',
                order: null
            },
            zoom: {
                enabled: false
            },
            legend: {
                show: true
            }
        });
    });

    return <div id={`${bindto}`} className={className} />;
};




export default ({ record, card, parentReload }) => {
    const [totais, setTotais] = useState({});
    const [progress, setProgress] = useState({});
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
        console.log("aaaa", { ofs_id: record.ofs.map(v => v.of_id).join() })

        const request = (async () => sendJsonMessage({ cmd: 'loadpaletes', value: { ofs_id: record.ofs.map(v => v.of_id).join() } }));
        request();
        const interval = setInterval(request, 30000);
        return (() => clearInterval(interval));
    }, [record?.agg_of_id]);

    useEffect(() => {
        if (lastJsonMessage?.rows && lastJsonMessage.rows.length>0 && record?.ofs) {
            
            const _progress = {};
            for (let v of record.ofs) {
                console.log("33333333333333333333333333333333333333333333333333333333333333333",lastJsonMessage.rows)
                _progress[v.of_id] = { details: v };
            }
            for (let v of lastJsonMessage.rows) {
                console.log("44444444444444444444444444444444444444444444")
                console.log(v)
                const num_paletes_emfalta = v.num_paletes_total - (v.num_paletes_produzidas + v.num_paletes_stock_in);
                _progress[v.id] = { ..._progress[v.id], ...v, num_paletes_emfalta };
            }

            setProgress(_progress);
            //console.log(lastJsonMessage.rows)
            /*             const _totais = computeQty(ofItem, record.paletesstock);
                        _totais["paletes_produzidas"] = lastJsonMessage.rows.filter(obj => obj.num_bobines === obj.num_bobines_act).length;
                        _totais["done"] = (_totais["n_paletes"] === (_totais["paletes_produzidas"] + _totais["paletes_stock"])) ? 1 : (_totais["n_paletes"] < (_totais["paletes_produzidas"] + _totais["paletes_stock"])) ? 2 : 0;
                        setTotais({ ..._totais }); */
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
            <Container fluid>
                <Row nogutter>

                    {Object.keys(progress).length > 0 && Object.keys(progress).map((p, idx) => {
                        return (
                            <Col width={200} key={`card-${progress[p].details.of_id}`} style={{ border: "1px solid #8c8c8c" }}>
                                <YScroll>
                                    <Chart bindto={`chof-${progress[p].details.of_id}`} data={[["a", progress[p].num_paletes_produzidas], ["b", progress[p].num_paletes_stock_in], ["c", progress[p].num_paletes_emfalta]]}/>
                                    {/* <Text strong style={{ fontSize: "11px" }}>{ofItem.item_des}</Text>
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
                            </div> */}
                                </YScroll>
                            </Col>)
                    })}
                </Row>
            </Container>
        </>
    );
}
