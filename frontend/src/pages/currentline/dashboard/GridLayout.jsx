import React, { useEffect, useState, Suspense, lazy, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import { API_URL } from "config";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";

import YScroll from "components/YScroll";
import Toolbar from "components/toolbar";
import GridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import { Button, Select, Typography, Card, Collapse, Space, Modal, Popover, Menu, Divider, Drawer } from "antd";
const { Text, Title } = Typography;
import { SyncOutlined, SettingOutlined, MenuOutlined, AppstoreOutlined } from '@ant-design/icons';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { MdOutlineApps, MdOutlineMenu, MdOutlineReceipt } from 'react-icons/md';
import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';


import Logo from 'assets/logo.svg';
import LogoWhite from 'assets/logowhite.svg';
import { useRef } from 'react';
import MainMenu from './MainMenu';
const ItemCortes = React.lazy(() => import('./ItemCortes'));
const ItemActions = React.lazy(() => import('./ItemActions'));
const ItemAgg = React.lazy(() => import('./ItemAgg'));
const ItemBobinagens = React.lazy(() => import('./ItemBobinagens'));
const ItemFormulacao = React.lazy(() => import('./ItemFormulacao'));

const useStyles = createUseStyles({
    toolboxItem: {
        lineHeight: 1,
        cursor: "pointer",
        width: "80px",
        minHeight: "25px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "5px",
        border: "solid 1px #d9d9d9",
        borderRadius: "6px",
        padding: "3px",
        background: "#fff",
        '&:hover': {
            padding: "2px",
            boxShadow: " rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px",
            border: "solid 2px transparent",
            borderImage: "initial"
        }
    },
    wrapperContainer: {
        background: "#f0f0f0",
        border: "1px solid #dee2e6",
        borderRadius: "3px",
        padding: "2px",
        height: "40px",
        justifyContent: "center"
    },
    scrollContainer: {
        "-ms-overflow-style": "none",
        "scrollbar-width": "none",
        '&::-webkit-scrollbar': {
            display: "none"
        }
    }
});

const StyledScrollMenu = styled(ScrollMenu)`

        background: #f0f0f0;
        border: 1px solid #dee2e6; 
        border-radius: 3px; 
        padding: 2px;


`;

const StyledDrawer = styled(Drawer)`
    .ant-drawer-content{
        background:#2a3142;
    }
    .ant-drawer-header{
        border-bottom:none;
    }

`;

const getFromLS = (key, dashboard) => {
    let ls = null;
    if (global.localStorage) {
        if (global.localStorage.getItem("currentDashboard") !== null) {
            console.log("get--", global.localStorage.getItem("currentDashboard"), key)
            try {
                if (key === "currentDashboard") {
                    ls = JSON.parse(global.localStorage.getItem("currentDashboard"));
                } else if (key === "dashboards") {
                    ls = JSON.parse(global.localStorage.getItem("dashboards"));
                } else {
                    const cd = JSON.parse(global.localStorage.getItem("currentDashboard"));
                    ls = JSON.parse(global.localStorage.getItem(`${cd}-${key}`));
                }
            } catch (e) {
                /*Ignore*/
            }
        }
    }
    return ls;
}

const saveToLS = (key, value) => {
    if (global.localStorage) {
        if (key === "currentDashboard") {
            global.localStorage.setItem("currentDashboard", JSON.stringify(value));
        } else if (key === "dashboards") {
            global.localStorage.setItem("dashboards", JSON.stringify(value));
        } else {
            const cd = (global.localStorage.getItem("currentDashboard") !== null) ? JSON.parse(global.localStorage.getItem("currentDashboard")) : originalDashboards[0].id;
            global.localStorage.setItem(`${cd}-${key}`, JSON.stringify(value));
        }
    }
}

const originalDashboards = [
    { id: "ly-01", description: "Dashboard 1", ofs: true, main: true },
    { id: "ly-02", description: "Dashboard 2", ofs: false },
    { id: "ly-03", description: "Dashboard 3", ofs: false },
    { id: "ly-04", description: "Dashboard 4", ofs: false },
    { id: "ly-05", description: "Dashboard 5", ofs: false },
    { id: "ly-06", description: "Dashboard 6", ofs: false }
];

const originalLayouts = {
    lg: [
        { i: "a", x: 0, y: 0, w: 2, h: 2/* , static: true */, disabled: true },
        { i: "b", x: 2, y: 0, w: 4, h: 2, minW: 2, maxW: 4, disabled: true },
        { i: "c", x: 6, y: 0, w: 2, h: 2, disabled: true },
        { i: "d", x: 8, y: 0, w: 2, h: 2, disabled: true },
        { i: "e", x: 0, y: 8, w: 4, h: 4, maxW: 12, disabled: true },
        { i: "cortes", x: 0, y: 0, w: 6, h: 6, minH: 4 },
        { i: "formulacao", x: 0, y: 0, w: 4, h: 8, minH: 4 },
        { i: "bobinagens", x: 0, y: 0, w: 6, h: 8, minH: 4 },
        { i: "actions", x: 0, y: 0, w: 2, h: 8, minH: 4 }
    ]
};
const originalToolbox = {
    lg: []
};

const toolboxItems = {
    cortes: { description: "Cortes", icon: <MdOutlineApps /> },
    formulacao: { description: "Formulação", icon: <MdOutlineReceipt /> },
    bobinagens: { description: "Bobinagens", icon: <MdOutlineApps /> },
    actions: { description: "Menu", icon: <MdOutlineMenu /> }
}

const ToolboxItem = ({ item, onTakeItem }) => {
    const classes = useStyles();
    const toolItem = toolboxItems[item.i];
    return (
        <div className={classes.toolboxItem} onClick={() => onTakeItem(item)}>
            <div>{toolItem?.icon && toolItem.icon}</div>
            <div>{toolItem?.description ? toolItem.description : item.i}</div>
        </div>
    );
}

const loadCurrentSettings = async (aggId, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/currentsettingsget/`, filter: { aggId }, sort: [], signal });
    return rows;
}

const LeftArrow = ({ items, onShowDrawer }) => {
    const { isFirstItemVisible, scrollPrev } = useContext(VisibilityContext);
    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <Logo onClick={onShowDrawer} style={{ width: "100px", height: "24px", marginLeft: "5px", paddingRight: "10px", cursor: "pointer" }} />
            {/* <MenuOutlined onClick={onShowDrawer} style={{ cursor: "pointer" }} /> */}
            <Button type="link" disabled={isFirstItemVisible} onClick={() => scrollPrev()} icon={<BsChevronCompactLeft style={{ fontSize: "24px" }} color={(isFirstItemVisible || items.length === 0) ? "#d9d9d9" : "#262626"} />} />
        </div>
    );
}

const RightArrow = ({ optionsLayout, items }) => {
    const { isLastItemVisible, scrollNext, visibleItems } = useContext(VisibilityContext);
    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <Button type="link" disabled={isLastItemVisible} onClick={() => scrollNext()} icon={<BsChevronCompactRight style={{ fontSize: "24px" }} color={(isLastItemVisible || items.length === 0) ? "#d9d9d9" : "#262626"} />} />
            {optionsLayout}
        </div>

    );
}

const onWheel = (apiObj, ev) => {
    const isThouchpad = Math.abs(ev.deltaX) !== 0 || Math.abs(ev.deltaY) < 15;
    if (isThouchpad) {
        ev.stopPropagation();
        return;
    }
    if (ev.deltaY < 0) {
        apiObj.scrollNext();
    } else if (ev.deltaY > 0) {
        apiObj.scrollPrev();
    }
}

const SettingsLayout = ({ clickSettings, onSettingsClick, handleSettingsClick, dashboards, setDashboards, currentDashboard, showOfs }) => {
    const startEdit = useRef(false);
    const onChange = (type, v, x) => {
        if (type === "description") {
            setDashboards(prev => {
                const newState = prev.map(obj => {
                    if (obj.id === x.id) {
                        return { ...obj, description: v };
                    }
                    return obj;
                });
                return newState;
            });
        } else if (type === "ofs") {
            setDashboards(prev => {
                const newState = prev.map(obj => {
                    if (obj.id === currentDashboard) {
                        return { ...obj, ofs: !showOfs() };
                    }
                    return obj;
                });
                return newState;
            });
        }
    }

    return (
        <>
            <Title level={5} style={{ margin: "0px 5px 0px 0px", whiteSpace: "nowrap" }} >{dashboards.find(v => v.id === currentDashboard)?.description}</Title>
            <Popover
                visible={clickSettings}
                onVisibleChange={handleSettingsClick}
                placement="bottomRight" title="Definições"
                content={
                    <div style={{ display: "flex", flexDirection: "column" }}>

                        <Menu onClick={(v) => onSettingsClick(v)} items={dashboards.map((x) => {
                            return (
                                { label: <Text onClick={e => { if (startEdit.current === true) { e.stopPropagation(); startEdit.current = false; } }} editable={{ onStart: () => startEdit.current = true, onChange: (v) => onChange("description", v, x) }}>{x.description}</Text>, key: `dashboard-${x.id}`, icon: <AppstoreOutlined /> }
                            );
                        })}></Menu>



                        <Divider style={{ margin: "8px 0" }} />
                        <Menu onClick={() => onChange("ofs")} items={[
                            { label: showOfs() === true ? 'Esconder Ordens de Fabrico' : 'Mostrar Ordens de Fabrico', key: 'viewofs', icon: <AppstoreOutlined /> }
                        ]}></Menu>
                        <Divider style={{ margin: "8px 0" }} />
                        <Menu onClick={(v) => onSettingsClick(v)} items={[
                            { label: 'Repor Layout Original', key: 'resetlayout', icon: <SyncOutlined /> }
                        ]}></Menu>
                    </div>
                } trigger="click">
                <Button size="small" icon={<SettingOutlined />} style={{ marginLef: "5px" }} />
            </Popover >
        </>
    );
}

export default (props) => {
    const classes = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentSettings, setCurrentSettings] = useState({});
    const [currentBreakpoint, setCurrentBreakpoint] = useState();
    const [currentDashboard, setCurrentDashboard] = useState();
    const [layouts, setLayouts] = useState();
    const [toolbox, setToolbox] = useState();
    const [dashboards, setDashboards] = useState();
    const [clickSettings, setClickSettings] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);


    useEffect(() => {
        const controller = new AbortController();
        loadData({ aggId: props?.aggId, signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const hideSettings = () => {
        setClickSettings(false);
    };

    const handleSettingsClick = (visible) => {
        setClickSettings(visible);
    };

    const onSettingsClick = async (type) => {
        if (type?.key) {
            switch (type.key) {
                case 'resetlayout': resetLayout(); break;
                case type?.key.match(/^dashboard-/)?.input:
                    setCurrentDashboard(type.key.replace("dashboard-", ""));
                    break;
                default: break;
            }
        }
        hideSettings();
    }

    const onTakeItem = (item) => {
        setLayouts(prev => ({
            ...prev,
            [currentBreakpoint]: [
                ...prev[currentBreakpoint] || [],
                item
            ]
        }));
        setToolbox(prev => ({
            ...prev,
            [currentBreakpoint]: [
                ...(prev[currentBreakpoint] || []).filter(({ i }) => i !== item.i)
            ]
        }));
    };

    const onPutItem = (item) => {
        setToolbox(prev => ({
            ...prev,
            [currentBreakpoint]: [
                ...prev[currentBreakpoint] || [],
                item
            ]
        }));
        setLayouts(prev => ({
            ...prev,
            [currentBreakpoint]: [
                ...(prev[currentBreakpoint] || []).filter(({ i }) => i !== item.i)
            ]
        }));
    }

    useEffect(() => {
        if (toolbox) {
            saveToLS("toolbox", toolbox);
        }
    }, [toolbox]);

    useEffect(() => {
        if (currentDashboard && mounted) {
            saveToLS("currentDashboard", currentDashboard);
            setLayouts(getFromLS("layouts") || { lg: [] });
            setToolbox(getFromLS("toolbox") || { [currentBreakpoint]: originalLayouts[currentBreakpoint].filter(v => !v.disabled) });
        } else if (currentDashboard) {
            saveToLS("currentDashboard", currentDashboard);
            setLayouts(getFromLS("layouts") || originalLayouts);
            setToolbox(getFromLS("toolbox") || originalToolbox);
            setMounted(true);
        }
    }, [currentDashboard]);

    useEffect(() => {
        if (dashboards) {
            saveToLS("dashboards", dashboards);
        }
    }, [dashboards]);



    const onLayoutChange = (layout, layouts) => {
        saveToLS("layouts", layouts);
        setLayouts(layouts);
    }

    const resetLayout = () => {
        setLayouts(originalLayouts);
        setToolbox(originalToolbox);
    }

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

                    setCurrentBreakpoint("lg");
                    setCurrentDashboard(getFromLS("currentDashboard") || originalDashboards[0].id);
                    setLayouts(getFromLS("layouts") || originalLayouts);
                    setToolbox(getFromLS("toolbox") || originalToolbox);
                    setDashboards(getFromLS("dashboards") || originalDashboards);
                })();
        }
    }

    const showOfs = () => {
        const db = dashboards.find(v => v.id === currentDashboard);
        if (db?.main === true) {
            return true;
        } else {
            return (db?.ofs === true) ? true : false;
        }
    }

    const onShowDrawer = () => {
        setDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setDrawerVisible(false);
    };

    return (
        <div/*  style={{transform: 'scale(0.8)',transformOrigin: "left top"}} */ /* style={{ transform: 'scale(0.8) translate(-12%, -12%)' }} */>
            {/* <Toolbar left={leftContent} right={rightContent} /> */}
            {dashboards && <>
                <StyledDrawer
                    title={
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            <LogoWhite style={{ width: "100px", height: "24px", paddingRight: "10px" }} />
                        </div>
                    }
                    placement="left"
                    closable={false}
                    onClose={onCloseDrawer}
                    visible={drawerVisible}
                >
                    <MainMenu dark />
                </StyledDrawer>
                <ScrollMenu onWheel={onWheel} LeftArrow={<LeftArrow items={(toolbox[currentBreakpoint] || [])} onShowDrawer={onShowDrawer} />} RightArrow={<RightArrow optionsLayout={<SettingsLayout clickSettings={clickSettings} handleSettingsClick={handleSettingsClick} onSettingsClick={onSettingsClick} setDashboards={setDashboards} dashboards={dashboards} currentDashboard={currentDashboard} showOfs={showOfs} />} items={(toolbox[currentBreakpoint] || [])} />} wrapperClassName={classes.wrapperContainer} scrollContainerClassName={classes.scrollContainer}>
                    {(toolbox[currentBreakpoint] || []).map(item => <ToolboxItem itemId={`t-${item.i}`} key={`t-${item.i}`} item={item} onTakeItem={onTakeItem} />)}
                </ScrollMenu>
                <Suspense fallback={<></>}>
                    {Object.keys(currentSettings).length > 0 && <ResponsiveReactGridLayout
                        className="layout"
                        layouts={layouts}
                        compactType="horizontal"
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={20}
                        //preventCollision={true}
                        measureBeforeMount={true}

                        //transformScale={0.8}
                        onLayoutChange={onLayoutChange}
                    >
                        {showOfs() && currentSettings.ofs.map((ofItem, idx) => {
                            return (<div key={`agg-${ofItem.of_id}-${idx}`} data-grid={{ x: 0, y: 0, w: 2, h: 6, minW: 2, maxW: 3, minH: 5 }}><ItemAgg record={{ ...currentSettings }} ofItem={ofItem} parentReload={loadData} /></div>)
                        })}
                        {layouts[currentBreakpoint].filter(v => !v?.disabled && !v.i.startsWith('agg-')).map(v => {
                            return (
                                <div key={v.i}>
                                    {v.i === "formulacao" && <><span style={{ position: "absolute", right: "2px", top: 0, cursor: "pointer", zIndex: 1000, fontSize: "14px" }} onClick={() => onPutItem(v)}>x</span><ItemFormulacao card={{ title: "Formulação" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "bobinagens" && <><span style={{ position: "absolute", right: "2px", top: 0, cursor: "pointer", zIndex: 1000 }} onClick={() => onPutItem(v)}>x</span><ItemBobinagens card={{ title: "Bobinagens" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "cortes" && <><span style={{ position: "absolute", right: "2px", top: 0, cursor: "pointer", zIndex: 1000 }} onClick={() => onPutItem(v)}>x</span><ItemCortes card={{ title: "Cortes" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "actions" && <><span style={{ position: "absolute", right: "2px", top: 0, cursor: "pointer", zIndex: 1000 }} onClick={() => onPutItem(v)}>x</span><ItemActions card={{ title: "Menu" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                </div>
                            );
                        })
                        }
                    </ResponsiveReactGridLayout>
                    }
                </Suspense>
            </>
            }
        </div>
    );
}