import React, { useEffect, useState, Suspense, lazy, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import { API_URL, ROOT_URL } from "config";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import loadInit from "utils/loadInit";
import YScroll from "components/YScroll";
import Toolbar from "components/toolbar";
import GridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import { Button, Select, Typography, Card, Collapse, Space, Modal, Popover, Menu, Divider, Drawer } from "antd";
const { Text, Title } = Typography;
import { SyncOutlined, SettingOutlined, MenuOutlined, AppstoreOutlined, LogoutOutlined, ProjectOutlined } from '@ant-design/icons';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { MdOutlineApps, MdOutlineMenu, MdOutlineReceipt } from 'react-icons/md';
import { BsChevronCompactLeft, BsChevronCompactRight, BsDot } from 'react-icons/bs';
import { GoPrimitiveDot } from 'react-icons/go';



import Logo from 'assets/logo.svg';
import LogoWhite from 'assets/logowhite.svg';
import { useRef } from 'react';
import MainMenu from './MainMenu';
const ItemCortes = React.lazy(() => import('./ItemCortes'));
const ItemActions = React.lazy(() => import('./ItemActions'));
const ItemAgg = React.lazy(() => import('./ItemAgg'));
const ItemGranulado = React.lazy(() => import('./ItemGranulado'));
const ItemBobinagens = React.lazy(() => import('./ItemBobinagens'));
const ItemFormulacao = React.lazy(() => import('./ItemFormulacao'));
const ItemOrdensFabrico = React.lazy(() => import('./ItemOrdensFabrico'));
const ItemOperations = React.lazy(() => import('./ItemOperations'));
import { AppContext } from "../../App";


const useStyles = createUseStyles({
    toolboxItem: {
        lineHeight: 1,
        cursor: "pointer",
        width: "85px",
        minHeight: "25px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "5px",
        border: "solid 1px #d9d9d9",
        borderRadius: "6px",
        whiteSpace: "nowrap",
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
        height: "45px",
        justifyContent: "center"
    },
    scrollContainer: {
        "-ms-overflow-style": "none",
        "scrollbar-width": "none",
        "align-self": "center",
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

const StyledTitle = styled(Title)`
    margin: 0px 5px 0px 0px; 
    white-space: nowrap;
    cursor: pointer;
    &:hover{
        color:#096dd9;
    }
`;

const StyledLink = styled(Button)`
    color:#000;
    &:hover{
        color:#096dd9;
    }
`;


const getFromLS = (key, dashboard) => {
    let ls = null;
    if (global.localStorage) {
        try {
            if (key === "currentDashboard") {
                ls = JSON.parse(global.localStorage.getItem("currentDashboard"));
            } else if (key === "dashboards") {
                ls = JSON.parse(global.localStorage.getItem("dashboards"));
            } else if (key === "preventCollisions") {
                ls = JSON.parse(global.localStorage.getItem("preventCollisions"));
            } else if (key === "overlap") {
                ls = JSON.parse(global.localStorage.getItem("overlap"));
            } else {
                if (dashboard) {
                    ls = JSON.parse(global.localStorage.getItem(`${dashboard}-${key}`));
                }
            }
        } catch (e) {
            /*Ignore*/
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
        } else if (key === "preventCollisions") {
            global.localStorage.setItem("preventCollisions", JSON.stringify(value));
        } else if (key === "overlap") {
            global.localStorage.setItem("overlap", JSON.stringify(value));
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
        { i: "actions", x: 0, y: 0, w: 2, h: 8, minH: 4 },
        { i: "operations", x: 0, y: 0, w: 2, h: 2, minH: 2 }
    ]
};
const originalToolbox = {
    lg: [
        { i: "granulado", x: 0, y: 0, w: 4, h: 8, minH: 4 },
        { i: "ordemfabrico", x: 0, y: 0, w: 4, h: 8, minH: 4 }
    ]
};




const toolboxItems = {
    cortes: { description: "Cortes", icon: <MdOutlineApps /> },
    formulacao: { description: "Formulação", icon: <MdOutlineReceipt /> },
    bobinagens: { description: "Bobinagens", icon: <MdOutlineApps /> },
    actions: { description: "Menu", icon: <MdOutlineMenu /> },
    granulado: { description: "Reciclado", icon: <MdOutlineApps /> },
    ordemfabrico: { description: "Ordens Fabrico", icon: <MdOutlineApps /> },
    operations: { description: "Ações", icon: <MdOutlineApps /> },
   /*  "prod-reports":{description:"Relatórios Produção", icon:<ProjectOutlined />} */
}

const ToolboxItem = ({ item, onTakeItem }) => {
    const classes = useStyles();
    const toolItem = toolboxItems[item.i];
    return (
        <>
        {item?.children ?
            <div style={{display:"flex",flexDirection:"row"}}>
                <div>content</div>
                <div>dropdown</div>
            </div> 
        :
        <div className={classes.toolboxItem} onClick={() => onTakeItem(item)}>
            <div>{toolItem?.icon && toolItem.icon}</div>
            <div>{toolItem?.description ? toolItem.description : item.i}</div>
        </div>}
        </>
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
            <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><Logo onClick={onShowDrawer} style={{ width: "100px", height: "24px", marginLeft: "5px", paddingRight: "10px", cursor: "pointer" }} /><div style={{fontSize:"8px"}}>v.220903.11.45</div></div>
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

const SettingsLayout = ({ clickSettings, onSettingsClick, handleSettingsClick, dashboards, setDashboards, currentDashboard, showOfs, preventCollisions, overlap }) => {
    const { auth } = useContext(AppContext);
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
                            { label: showOfs() === true ? 'Esconder Ordens de Fabrico' : 'Mostrar Ordens de Fabrico', key: 'viewofs', icon: <GoPrimitiveDot /> }
                        ]}></Menu>
                        <Divider style={{ margin: "8px 0" }} />
                        <Menu onClick={(v) => onSettingsClick(v)} items={[
                            { label: !preventCollisions ? 'Previnir Colisões' : 'Permitir Colisões', key: 'collisions', icon: <GoPrimitiveDot /> },
                            { label: !overlap ? 'Permitir Sobreposição' : 'Não Permitir Sobreposição', key: 'overlap', icon: <GoPrimitiveDot /> }
                        ]}></Menu>
                        <Divider style={{ margin: "8px 0" }} />
                        <Menu onClick={(v) => onSettingsClick(v)} items={[
                            { label: 'Repor Layout Original', key: 'resetlayout', icon: <SyncOutlined /> }
                        ]}></Menu>
                        <Divider style={{ margin: "8px 0" }} />
                        <Menu onClick={(v) => onSettingsClick(v)} items={[
                            { label: 'Logout', key: 'logout', icon: <LogoutOutlined /> }
                        ]}></Menu>
                    </div>
                } trigger="click">
                <div style={{ cursor: "pointer", textAlign: "center" }}>
                    <StyledLink type="link" size="small" icon={<SettingOutlined />} style={{ marginLef: "5px", marginBottom: "0px" }}><span style={{ fontSize: "12px", fontWeight: 700 }}>{dashboards.find(v => v.id === currentDashboard)?.description}</span></StyledLink>
                    <div style={{ textAlign: "center", whiteSpace: "nowrap", padding: "0px 5px" }}>{auth.name} {auth.turno.enabled && <span><Text type="secondary">|</Text> Turno <b>{`${auth.turno.turno}`}</b></span>}</div>
                </div>
            </Popover >
        </>
    );
}

const CustomGridItemComponent = React.forwardRef(({ style, className, children, ...props }, ref) => {
    return (
        <div style={{ ...style }} className={className} ref={ref} {...props}>
            {children}
        </div>
    );
});

const CloseItem = styled.div`

    position: absolute;
    right: 10px; 
    top: 4px; 
    cursor: pointer;
    z-index: 1000;
    font-size: 16px;
    font-weight:700;
    color:${({ color }) => color ? color : "#000"};
    &::after {
        content: "x";
    }
    &:hover {
        color:#096dd9;
    }

`;


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
    const [preventCollisions, setPreventCollisions] = useState(false);
    const [overlap, setOverlap] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);


    useEffect(() => {
        const controller = new AbortController();
        loadData({ aggId: props?.aggId, signal: controller.signal });
        return (() => controller.abort());
    }, [location]);

    const hideSettings = () => {
        setClickSettings(false);
    };

    const handleSettingsClick = (visible) => {
        setClickSettings(visible);
    };

    const onSettingsClick = async (type) => {
        if (type?.key) {
            switch (type.key) {
                case 'collisions':
                    saveToLS("preventCollisions", !preventCollisions);
                    setPreventCollisions(prev => !prev);
                    break;
                case 'overlap':
                    saveToLS("overlap", !overlap);
                    setOverlap(prev => !prev);
                    break;
                case 'logout':


                    try {
                        let response = await fetchPost({ url: `${ROOT_URL}/users/logout-/`, parameters: {} });
                        if (response.status === 200) {
                            window.location.href = `${ROOT_URL}/users/login/`;
                        }
                    } catch (e) {
                        Modal.error({
                            centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro de Logout', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}>
                                <YScroll>
                                    {e.message}
                                </YScroll>
                            </div></div>
                        });
                    };
                    break;
                case 'resetlayout': resetLayout(currentDashboard); break;
                case type?.key.match(/^dashboard-/)?.input:
                    changeCurrentDashboard(type.key.replace("dashboard-", ""));
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

    const changeCurrentDashboard = (key) => {
        let _breakpoint = (currentBreakpoint) ? currentBreakpoint : "lg"
        let _current = key;
        if (!_current) {
            _current = (global.localStorage.getItem("currentDashboard") !== null) ? JSON.parse(global.localStorage.getItem("currentDashboard")) : originalDashboards[0].id;
        }
        saveToLS("currentDashboard", _current);
        setCurrentDashboard(_current);
        const _layouts = getFromLS("layouts", _current);
        const _toolbox = getFromLS("toolbox", _current);
        if (_layouts === null) {
            setLayouts({ lg: [] });
        } else {
            setLayouts(_layouts);
        }
        if (_toolbox === null) {
            setToolbox({ [_breakpoint]: [...originalLayouts[_breakpoint].filter(v => !v.disabled), ...originalToolbox[_breakpoint].filter(v => !v.disabled)] });
        } else {
            setToolbox(_toolbox);
        }
    }

    useEffect(() => {
        if (dashboards) {
            saveToLS("dashboards", dashboards);
        }
    }, [dashboards]);



    const onLayoutChange = (layout, layouts) => {
        saveToLS("layouts", layouts);
        saveToLS("toolbox", toolbox);
        setLayouts(layouts);
    }

    const resetLayout = () => {
        const db = dashboards.find(v => v.id === currentDashboard);
        if (db?.main === true) {
            setLayouts(originalLayouts);
            setToolbox(originalToolbox);
        } else {
            setDashboards(prev => {
                const newState = prev.map(obj => {
                    if (obj.id === currentDashboard) {
                        return { ...obj, ofs: false };
                    }
                    return obj;
                });
                return newState;
            });
            setLayouts({ lg: [] });
            setToolbox({ [currentBreakpoint]: [...originalLayouts[currentBreakpoint].filter(v => !v.disabled), ...originalToolbox[currentBreakpoint].filter(v => !v.disabled)] });
        }

    }

    const loadData = (data = {}, type = "init") => {

        const { signal } = data;
        const { aggId } = loadInit({}, {}, data, location?.state, [...Object.keys(location?.state || {}), ...Object.keys(data || {})]);

        //let aggId = (data?.aggId) ? data.aggId : location?.state?.aggId;
        switch (type) {
            default:
                (async () => {
                    let raw = await loadCurrentSettings(aggId, signal);
                    setCurrentBreakpoint("lg");
                    setDashboards(getFromLS("dashboards") || originalDashboards);
                    setPreventCollisions(getFromLS("preventCollisions") || false);
                    setOverlap(getFromLS("overlap") || false);
                    changeCurrentDashboard();
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
            {(currentDashboard) && <>
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
                <ScrollMenu onWheel={onWheel} LeftArrow={<LeftArrow items={(toolbox[currentBreakpoint] || [])} onShowDrawer={onShowDrawer} />} RightArrow={<RightArrow optionsLayout={<SettingsLayout clickSettings={clickSettings} handleSettingsClick={handleSettingsClick} onSettingsClick={onSettingsClick} setDashboards={setDashboards} dashboards={dashboards} currentDashboard={currentDashboard} showOfs={showOfs} preventCollisions={preventCollisions} overlap={overlap} />} items={(toolbox[currentBreakpoint] || [])} />} wrapperClassName={classes.wrapperContainer} scrollContainerClassName={classes.scrollContainer}>
                    {(toolbox[currentBreakpoint] || []).map(item => <ToolboxItem itemId={`t-${item.i}`} key={`t-${item.i}`} item={item} onTakeItem={onTakeItem} />)}
                </ScrollMenu>
                <Suspense fallback={<></>}>
                    {Object.keys(currentSettings).length > 0 && <ResponsiveReactGridLayout
                        className="layout"
                        layouts={layouts}
                        compactType="horizontal"
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={35}
                        preventCollision={preventCollisions}
                        allowOverlap={overlap}
                        measureBeforeMount={true}

                        //transformScale={0.8}
                        onLayoutChange={onLayoutChange}
                    >
                        {showOfs() && currentSettings.ofs.map((ofItem, idx) => {
                            return (<div key={`agg-${ofItem.of_id}-${idx}`} data-grid={{ x: 0, y: 0, w: 2, h: 6, minW: 2, maxW: 3, minH: 5 }}><ItemAgg record={{ ...currentSettings }} ofItem={ofItem} parentReload={loadData} /></div>)
                        })}
                        {layouts[currentBreakpoint].filter(v => !v?.disabled && !v.i.startsWith('agg-')).map(v => {
                            return (
                                <CustomGridItemComponent key={v.i}>
                                    {v.i === "formulacao" && <><CloseItem onClick={() => onPutItem(v)} /><ItemFormulacao card={{ title: "Formulação" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "bobinagens" && <><CloseItem onClick={() => onPutItem(v)} /><ItemBobinagens card={{ title: "Bobinagens" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "cortes" && <><CloseItem onClick={() => onPutItem(v)} /><ItemCortes card={{ title: "Cortes" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "actions" && <><CloseItem color="#fff" onClick={() => onPutItem(v)} /><ItemActions card={{ title: "Menu" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "granulado" && <><CloseItem onClick={() => onPutItem(v)} /><ItemGranulado card={{ title: "Reciclado(Granulado) Lotes" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "ordemfabrico" && <><CloseItem onClick={() => onPutItem(v)} /><ItemOrdensFabrico card={{ title: "Ordens de Fabrico" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "operations" && <><CloseItem onClick={() => onPutItem(v)} /><ItemOperations card={{ title: "Ações" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                </CustomGridItemComponent>
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