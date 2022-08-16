import React, { useEffect, useState, Suspense, lazy, useContext } from 'react';
import { API_URL } from "config";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import dayjs from 'dayjs';


import YScroll from "components/YScroll";
import Toolbar from "components/toolbar";
import GridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import { Button, Select, Typography, Card, Collapse, Space, Modal } from "antd";
import { SyncOutlined } from '@ant-design/icons';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ItemCortes = React.lazy(() => import('./ItemCortes'));
const ItemActions = React.lazy(() => import('./ItemActions'));
const ItemAgg = React.lazy(() => import('./ItemAgg'));
const ItemBobinagens = React.lazy(() => import('./ItemBobinagens'));

const getFromLS = (key) => {
    let ls = {};
    if (global.localStorage) {
        try {
            ls = JSON.parse(global.localStorage.getItem("ly-01")) || {};
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls[key];
}

const saveToLS = (key, value) => {
    if (global.localStorage) {
        global.localStorage.setItem("ly-01", JSON.stringify({ [key]: value }));
    }
}

const originalLayouts = {
    lg: [
        { i: "a", x: 0, y: 0, w: 2, h: 2/* , static: true */ },
        { i: "b", x: 2, y: 0, w: 4, h: 2, minW: 2, maxW: 4 },
        { i: "c", x: 6, y: 0, w: 2, h: 2 },
        { i: "d", x: 8, y: 0, w: 2, h: 2 },
        { i: "e", x: 0, y: 8, w: 4, h: 4, maxW: 12 },
        { i: "cortes", x: 0, y: 0, w: 6, h: 8, minH: 4 },
        { i: "bobinagens", x: 0, y: 0, w: 6, h: 8, minH: 4 },
        { i: "actions", x: 0, y: 0, w: 2, h: 8, minH: 4 },
    ]
};


const loadCurrentSettings = async (aggId, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/currentsettingsget/`, filter: { aggId }, sort: [], signal });
    return rows;
}

export default (props) => {
    const [state, setState] = useState({ layouts: JSON.parse(JSON.stringify(getFromLS("layouts") || originalLayouts)) });
    const [currentSettings, setCurrentSettings] = useState({});

    const onLayoutChange = (layout, layouts) => {
        saveToLS("layouts", layouts);
        setState({ layouts });
    }

    const resetLayout = () => {
        setState({ layouts: originalLayouts });
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ aggId: props?.aggId, signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = (data = {}, type = "init") => {
        const { signal } = data;
        let aggId = (data?.aggId) ? data.aggId : location?.state?.aggId;
        switch (type) {
            default:
                /* if (!loading) {
                    setLoading(true);
                } */
                (async () => {
                    let raw = await loadCurrentSettings(aggId, signal);
                    console.log("ITEMMMM", raw)
                    if (!raw[0]) { return; }
                    const formulacao = JSON.parse(raw[0].formulacao);
                    const gamaoperatoria = JSON.parse(raw[0].gamaoperatoria);
                    const nonwovens = JSON.parse(raw[0].nonwovens);
                    const artigospecs = JSON.parse(raw[0].artigospecs);
                    const cortes = JSON.parse(raw[0].cortes);
                    const cortesordem = JSON.parse(raw[0].cortesordem);
                    const cores = JSON.parse(raw[0].cores);
                    const emendas = JSON.parse(raw[0].emendas);
                    const paletesstock = JSON.parse(raw[0].paletesstock);
                    const ofs = JSON.parse(raw[0].ofs);
                    const paletizacao = JSON.parse(raw[0].paletizacao);
                    const lotes = raw[0]?.lotes ? JSON.parse(raw[0].lotes) : [];

                    //for (const [idx, v] of ofs.entries()) {v['color'] = colorsOfs[idx]}

                    console.log("###############", paletizacao)

                    const quantity = ofs.reduce((basket, ofitem) => {
                        basket["square_meters"] = (!basket?.square_meters) ? ofitem.qty_encomenda : basket.square_meters + ofitem.qty_encomenda;
                        basket["linear_meters"] = (!basket?.linear_meters) ? ofitem.linear_meters : basket.linear_meters + ofitem.linear_meters;
                        basket["n_paletes"] = (!basket?.n_paletes) ? ofitem.n_paletes_total : basket.n_paletes + ofitem.n_paletes_total;
                        return basket;
                    }, {});
                    setCurrentSettings({
                        id: raw[0].id, user_id: raw[0].user_id, status: raw[0].status, agg_of_id: raw[0].agg_of_id,
                        quantity,
                        planificacao: {
                            start_prev_date: dayjs(raw[0].start_prev_date, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm'),
                            end_prev_date: dayjs(raw[0].end_prev_date, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm'), horas_previstas_producao: raw[0].horas_previstas_producao
                        },
                        produto: { produto_id: raw[0].produto_id, produto_cod: raw[0].produto_cod, gsm: raw[0].gsm },
                        sentido_enrolamento: raw[0].sentido_enrolamento, observacoes: raw[0].observacoes, formulacao, gamaoperatoria, paletesstock,
                        nonwovens, artigospecs, cortes, cortesordem, cores, emendas, ofs, paletizacao, status: raw[0].status, lotes
                    });
                    /*                     setLoading(false); */
                })();
        }
    }

    const leftContent = (<></>);
    const rightContent = (
        <Space>
            <Button size="small" icon={<SyncOutlined />} onClick={resetLayout} title="Repor Layout" />
        </Space>
    );

    return (
        <div /* style={{ transform: 'scale(0.8) translate(-12%, -12%)' }} */>
            <Toolbar left={leftContent} right={rightContent} />
            {Object.keys(currentSettings).length > 0 && <ResponsiveReactGridLayout
                className="layout"
                layouts={state.layouts}
                compactType="horizontal"
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={30}
                //transformScale={0.8}
                onLayoutChange={onLayoutChange}
            >
                {currentSettings.ofs.map((ofItem, idx) => {
                    return (<div key={`agg-${ofItem.id}-${idx}`} data-grid={{ x: 0, y: 0, w: 2, h: 8, minW:2, maxW:3, minH:5 }}><ItemAgg record={{ ...currentSettings }} ofItem={ofItem} parentReload={loadData} /></div>)
                })}
                <div key="bobinagens"><ItemBobinagens card={{ title: "Bobinagens" }} record={{ ...currentSettings }} parentReload={loadData} /></div>
                <div key="cortes"><ItemCortes card={{ title: "Cortes" }} record={{ ...currentSettings }} parentReload={loadData} /></div>
                <div key="actions"><ItemActions card={{ title: "Ações" }} record={{ ...currentSettings }} parentReload={loadData} /></div>
            </ResponsiveReactGridLayout>
            }
        </div>
    );
}