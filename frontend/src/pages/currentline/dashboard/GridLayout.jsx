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
import { Button, Select, Typography, Card, Collapse, Space, Modal, Popover, Menu, Divider, Drawer, message } from "antd";
const { Text, Title } = Typography;
import { SyncOutlined, SettingOutlined, MenuOutlined, AppstoreOutlined, LogoutOutlined, ProjectOutlined, SaveOutlined, ClearOutlined } from '@ant-design/icons';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { MdOutlineApps, MdOutlineMenu, MdOutlineReceipt } from 'react-icons/md';
import { BsChevronCompactLeft, BsChevronCompactRight, BsDot } from 'react-icons/bs';
import { GoPrimitiveDot } from 'react-icons/go';
import { usePermission } from "utils/usePermission";


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
const ItemPickingNW = React.lazy(() => import('./ItemPickingNW'));
import { AppContext } from "../../App";


const useStyles = createUseStyles({
    toolboxItem: {
        lineHeight: 1,
        cursor: "pointer",
        minWidth: "85px",
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


const getFromLS = (key, dashboard, user) => {
    let ls = null;
    if (global.localStorage) {
        try {
            if (key === "exists") {
                return localStorage.getItem(`layout-${user}`) === null ? false : true;
            }
            const lsUser = JSON.parse(global.localStorage.getItem(`layout-${user}`));
            if (key === "all") {
                ls = lsUser;
            } else if (key === "currentDashboard") {
                ls = lsUser["currentDashboard"];
                //ls = JSON.parse(global.localStorage.getItem("currentDashboard"));
            } else if (key === "dashboards") {
                ls = lsUser["dashboards"];
                //ls = JSON.parse(global.localStorage.getItem("dashboards"));
            } else if (key === "preventCollisions") {
                ls = lsUser["preventCollisions"];
                //ls = JSON.parse(global.localStorage.getItem("preventCollisions"));
            } else if (key === "overlap") {
                ls = lsUser["overlap"];
                //ls = JSON.parse(global.localStorage.getItem("overlap"));
            } else {
                if (dashboard) {
                    ls = lsUser[`${dashboard}-${key}`];
                    //ls = JSON.parse(global.localStorage.getItem(`${dashboard}-${key}`));
                }
            }
        } catch (e) {
            /*Ignore*/
        }
    } else {
        if (key === "exists") {
            return false;
        }
    }
    return (ls === undefined) ? null : ls;
}

const saveToLS = (key, value, user) => {

    if (global.localStorage) {
        if (key === "saveall") {
            global.localStorage.setItem(`layout-${user}`, value);
            return;
        }
        if (key === "clearall") {
            global.localStorage.removeItem(`layout-${user}`);
            return;
        }

        let lsUser = JSON.parse(global.localStorage.getItem(`layout-${user}`));
        if (lsUser === null) {
            lsUser = {};
        }
        if (key === "currentDashboard") {
            lsUser["currentDashboard"] = value;
            global.localStorage.setItem(`layout-${user}`, JSON.stringify(lsUser));
            //global.localStorage.setItem("currentDashboard", JSON.stringify(value));
        } else if (key === "dashboards") {
            lsUser["dashboards"] = value;
            global.localStorage.setItem(`layout-${user}`, JSON.stringify(lsUser));
            //global.localStorage.setItem("dashboards", JSON.stringify(value));
        } else if (key === "preventCollisions") {
            lsUser["preventCollisions"] = value;
            global.localStorage.setItem(`layout-${user}`, JSON.stringify(lsUser));
            //global.localStorage.setItem("preventCollisions", JSON.stringify(value));
        } else if (key === "overlap") {
            lsUser["overlap"] = value;
            global.localStorage.setItem(`layout-${user}`, JSON.stringify(lsUser));
            //global.localStorage.setItem("overlap", JSON.stringify(value));
        } else {
            const cd = (lsUser["currentDashboard"] !== null) ? lsUser["currentDashboard"] : originalDashboards[0].id;
            //const cd = (global.localStorage.getItem("currentDashboard") !== null) ? JSON.parse(global.localStorage.getItem("currentDashboard")) : originalDashboards[0].id;
            lsUser[`${cd}-${key}`] = value;
            global.localStorage.setItem(`layout-${user}`, JSON.stringify(lsUser));
            //global.localStorage.setItem(`${cd}-${key}`, JSON.stringify(value));
        }
    }
}

const originalDashboards = [
    { id: "tpl-01", description: "Produção", ofs: { visible: false, static: false, allowChange: true } },
    { id: "tpl-02", description: "Planeamento", ofs: { visible: true, static: false, allowChange: false } },
    { id: "tpl-03", description: "Matérias Prima", ofs: { visible: false, static: false, allowChange: true } },
    { id: "ly-01", description: "Dashboard 1", ofs: { visible: false, static: false, allowChange: true } },
    { id: "ly-02", description: "Dashboard 2", ofs: { visible: false, static: false, allowChange: true } },
    { id: "ly-03", description: "Dashboard 3", ofs: { visible: false, static: false, allowChange: true } },
    { id: "ly-04", description: "Dashboard 4", ofs: { visible: false, static: false, allowChange: true } },
    { id: "ly-05", description: "Dashboard 5", ofs: { visible: false, static: false, allowChange: true } },
    { id: "ly-06", description: "Dashboard 6", ofs: { visible: false, static: false, allowChange: true } }
];

const allItems = {
    lg: [
        { i: "a", x: 0, y: 0, w: 2, h: 2/* , static: true */, disabled: true },
        { i: "b", x: 2, y: 0, w: 4, h: 2, minW: 2, maxW: 4, disabled: true },
        { i: "c", x: 6, y: 0, w: 2, h: 2, disabled: true },
        { i: "d", x: 8, y: 0, w: 2, h: 2, disabled: true },
        { i: "e", x: 0, y: 8, w: 4, h: 4, maxW: 12, disabled: true },
        { i: "cortes", x: 0, y: 0, w: 6, h: 6, minH: 4, closable: true },
        { i: "formulacao", x: 0, y: 0, w: 4, h: 8, minH: 4, closable: true },
        { i: "bobinagens", x: 0, y: 0, w: 6, h: 8, minH: 4, closable: true },
        { i: "actions", x: 0, y: 0, w: 2, h: 8, minH: 4, closable: true },
        { i: "operations", x: 0, y: 0, w: 2, h: 4, minH: 4, maxW: 8, closable: true },
        { i: "granulado", x: 0, y: 0, w: 4, h: 8, minH: 4, closable: true },
        { i: "nonwovens", x: 0, y: 0, w: 4, h: 8, minH: 4, closable: true },
        { i: "ordemfabrico", x: 0, y: 0, w: 8, h: 8, minH: 4, closable: true }
    ]
}

const templates = {
    lg: {
        "default": [],
        "tpl-01": [
            /*  { i: "cortes", x: 0, y: 0, w: 6, h: 6, minH: 4, static: false, closable: true },
             { i: "formulacao", x: 0, y: 0, w: 4, h: 8, minH: 4, closable: true },
             { i: "bobinagens", x: 0, y: 0, w: 6, h: 8, minH: 4, closable: true },
             { i: "actions", x: 0, y: 0, w: 2, h: 8, minH: 4, closable: true }, */
            { i: "operations", x: 0, y: 0, w: 3, h: 4, minH: 4, maxW:4, static:true }
        ],
        "tpl-02": [
            /* { i: "cortes", x: 0, y: 0, w: 6, h: 6, minH: 4, closable: true } */
        ]
    }
}

const toolboxItems = {
    cortes: { description: "Cortes", icon: <MdOutlineApps /> },
    formulacao: { description: "Formulação", icon: <MdOutlineReceipt /> },
    bobinagens: { description: "Bobinagens", icon: <MdOutlineApps /> },
    actions: { description: "Menu", icon: <MdOutlineMenu /> },
    granulado: { description: "Reciclado", icon: <MdOutlineApps /> },
    nonwovens: { description: "Nonwovens Linha", icon: <MdOutlineApps /> },
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
                <div style={{ display: "flex", flexDirection: "row" }}>
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><Logo onClick={onShowDrawer} style={{ width: "100px", height: "24px", marginLeft: "5px", paddingRight: "10px", cursor: "pointer" }} /><div style={{ fontSize: "8px" }}>v.220908.22.26</div></div>
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

const SettingsLayout = ({ clickSettings, onSettingsClick, handleSettingsClick, dashboards, setDashboards, currentDashboard, showOfs, setShowOfs, preventCollisions, overlap }) => {
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
            const ofs = { ...showOfs, visible: !showOfs.visible };
            setDashboards(prev => {
                const newState = prev.map(obj => {
                    if (obj.id === currentDashboard) {
                        return { ...obj, ofs };
                    }
                    return obj;
                });
                return newState;
            });
            setShowOfs({ ...ofs });
        }
    }

    const getDescription = (id) => {
        return dashboards.find(v => v.id === id)?.description;
    }

    return (
        <>
            <Popover
                open={clickSettings}
                onOpenChange={handleSettingsClick}
                placement="bottomRight" title="Definições"
                content={
                    <div style={{ display: "flex", flexDirection: "column" }}>

                        <Menu onClick={(v) => onSettingsClick(v)} items={dashboards.map((x) => {
                            return (
                                { label: <Text style={{ fontWeight: 700 }} onClick={e => { if (startEdit.current === true) { e.stopPropagation(); startEdit.current = false; } }} editable={{ onStart: () => startEdit.current = true, onChange: (v) => onChange("description", v, x) }}>{x.description}</Text>, key: `dashboard-${x.id}`, icon: <AppstoreOutlined /> }
                            );
                        })}></Menu>

                        {showOfs.allowChange === true && <><Divider style={{ margin: "8px 0" }} />
                            <Menu onClick={() => onChange("ofs")} items={[
                                { label: showOfs.visible === true ? 'Esconder Ordens de Fabrico' : 'Mostrar Ordens de Fabrico', key: 'viewofs', icon: <GoPrimitiveDot /> }
                            ]}></Menu>
                        </>}
                        <Divider style={{ margin: "8px 0" }} />
                        <Menu onClick={(v) => onSettingsClick(v)} items={[
                            { label: !preventCollisions ? 'Previnir Colisões' : 'Permitir Colisões', key: 'collisions', icon: <GoPrimitiveDot /> },
                            { label: !overlap ? 'Permitir Sobreposição' : 'Não Permitir Sobreposição', key: 'overlap', icon: <GoPrimitiveDot /> }
                        ]}></Menu>
                        <Divider style={{ margin: "8px 0" }} />
                        <Menu onClick={(v) => onSettingsClick(v)} items={[
                            { label: <b>Guardar Layouts</b>, key: 'savelayout', icon: <SaveOutlined /> },
                            { label: <span>Repor Layout <b>{getDescription(currentDashboard)}</b></span>, key: 'resetlayout', icon: <SyncOutlined /> },
                            { label: <span>Repor todos os Layouts</span>, key: 'resetalllayouts', icon: <ClearOutlined /> }
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
${({ closable, color }) => closable && `
    position: absolute;
    right: 10px; 
    top: 4px; 
    cursor: pointer;
    z-index: 1000;
    font-size: 16px;
    font-weight:700;
    color:${color ? color : "#000"};
    &::after {
        content: "x";
    }
    &:hover {
        color:#096dd9;
    }
`}
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
    const [showOfs, setShowOfs] = useState({ visible: false, static: false, allowChange: true });
    const [drawerVisible, setDrawerVisible] = useState(false);
    const permission = usePermission();

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
                    saveToLS("preventCollisions", !preventCollisions, permission.auth.user);
                    setPreventCollisions(prev => !prev);
                    break;
                case 'overlap':
                    saveToLS("overlap", !overlap, permission.auth.user);
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
                case 'savelayout':
                    try {
                        let response = await fetchPost({ url: `${API_URL}/savelayout/`, filter: {}, parameters: { user: permission.auth.user, layout: getFromLS("all", null, permission.auth.user) } });
                        if (response.data.status !== "error") {
                            message.success({
                                content: 'Layouts/Dashboards gravados com sucesso.',
                                style: {
                                    marginTop: 'calc(90vh - 40px)',
                                    marginLeft: "calc(100% - 350px)"
                                }
                            });
                        }
                    } catch (e) {
                        Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
                    };
                    break;
                case 'resetlayout': resetLayout(currentDashboard); break;
                case 'resetalllayouts': resetLayout(); break;
                case type?.key.match(/^dashboard-/)?.input:
                    changeCurrentDashboard(type.key.replace("dashboard-", ""));
                    break;
                default: break;
            }
        }
        hideSettings();
    }

    const onTakeItem = (item) => {
        const _layouts = { ...layouts, [currentBreakpoint]: [...layouts[currentBreakpoint] || [], item] };
        const _toolbox = { ...toolbox, [currentBreakpoint]: [...(toolbox[currentBreakpoint] || []).filter(({ i }) => i !== item.i)] };
        setLayouts(_layouts);
        setToolbox(_toolbox);
        if (layouts[currentBreakpoint].length === 0) {
            saveToLS("layouts", _layouts, permission.auth.user);
            saveToLS("toolbox", _toolbox, permission.auth.user);
        }
    };

    const onPutItem = (item) => {
        if (!item?.closable) {
            return;
        }
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
        let _current = key;
        if (!_current) {
            if (getFromLS("currentDashboard", null, permission.auth.user) !== null) {
                _current = getFromLS("currentDashboard", null, permission.auth.user);
            } else {
                _current = originalDashboards[0].id;
                saveToLS("currentDashboard", _current, permission.auth.user);
            }
        } else {
            saveToLS("currentDashboard", _current, permission.auth.user);
        }
        setCurrentDashboard(_current);
    }

    useEffect(() => {
        if (dashboards) {
            saveToLS("dashboards", dashboards, permission.auth.user);
        }
    }, [dashboards]);

    useEffect(() => {
        if (currentDashboard) {
            let _breakpoint = (currentBreakpoint) ? currentBreakpoint : "lg"
            let _layouts;
            let _toolbox;
            _layouts = getFromLS("layouts", currentDashboard, permission.auth.user);
            _toolbox = getFromLS("toolbox", currentDashboard, permission.auth.user);
            if (layouts === null || _toolbox === null) {
                _layouts = { [_breakpoint]: (templates[_breakpoint][currentDashboard]) ? templates[_breakpoint][currentDashboard] : templates[_breakpoint]["default"] };
                _toolbox = { [_breakpoint]: allItems[_breakpoint].filter(v => !v?.disabled && !_layouts[_breakpoint].some(x => x.i === v.i)) };
            }
            _layouts = (_layouts === null) ? { [_breakpoint]: [] } : _layouts;
            const db = dashboards.find(v => v.id === currentDashboard);
            setShowOfs(prev => ({ ...prev, ...db["ofs"] }));
            setLayouts(_layouts);
            setToolbox((_toolbox === null) ? { [_breakpoint]: allItems[_breakpoint].filter(v => !v?.disabled && !_layouts[_breakpoint].some(x => x.i === v.i)) } : _toolbox);
        }
    }, [currentDashboard]);


    const onLayoutChange = async (layout, layouts) => {
        layouts[currentBreakpoint].map(v => {
            let itm;
            if (templates[currentBreakpoint][currentDashboard]) {
                itm = templates[currentBreakpoint][currentDashboard].find(x => x.i === v.i);
            }
            if (!itm) {
                itm = allItems[currentBreakpoint].find(x => x.i === v.i);
            }
            if (itm) { v.closable = itm?.closable; }
            return v;
        });
        saveToLS("layouts", layouts, permission.auth.user);
        saveToLS("toolbox", toolbox, permission.auth.user);
        setLayouts(layouts);
    }

    const resetLayout = (_currentDashboard) => {
        if (_currentDashboard) {
            let _breakpoint = (currentBreakpoint) ? currentBreakpoint : "lg"
            let _layouts = { [_breakpoint]: (templates[_breakpoint][_currentDashboard]) ? templates[_breakpoint][_currentDashboard] : templates[_breakpoint]["default"] };
            let _toolbox = { [_breakpoint]: allItems[_breakpoint].filter(v => !v?.disabled && !_layouts[_breakpoint].some(x => x.i === v.i)) };
            _layouts = (_layouts === null) ? { [_breakpoint]: [] } : _layouts;
            const db = dashboards.find(v => v.id === _currentDashboard);
            setShowOfs(prev => ({ ...prev, ...db["ofs"] }));
            setLayouts(_layouts);
            setToolbox((_toolbox === null) ? { [_breakpoint]: allItems[_breakpoint].filter(v => !v?.disabled && !_layouts[_breakpoint].some(x => x.i === v.i)) } : _toolbox);
        } else {
            saveToLS("clearall", null, permission.auth.user);
            loadData({ loadLayout: false });
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
                    if (raw.length == 0) {
                        setCurrentSettings({});
                    }
                    setCurrentBreakpoint("lg");
                    if (data?.loadLayout != false && !getFromLS("exists", null, permission.auth.user)) {
                        try {
                            let response = await fetchPost({ url: `${API_URL}/loadlayout/`, filter: { user: permission.auth.user }, parameters: {} });
                            if (response.data.status !== "error" && response.data.rows.length > 0) {
                                saveToLS("saveall", response.data.rows[0].layout, permission.auth.user);
                            }
                        } catch (e) { };
                    }
                    setDashboards(getFromLS("dashboards", null, permission.auth.user) || originalDashboards);
                    setPreventCollisions(getFromLS("preventCollisions", null, permission.auth.user) || false);
                    setOverlap(getFromLS("overlap", null, permission.auth.user) || false);
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

    const onShowDrawer = () => {
        setDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setDrawerVisible(false);
    };

    return (
        <div/*  style={{transform: 'scale(0.8)',transformOrigin: "left top"}} */ /* style={{ transform: 'scale(0.8) translate(-12%, -12%)' }} */>
            {(layouts) && <>
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
                <ScrollMenu onWheel={onWheel} LeftArrow={<LeftArrow items={(toolbox[currentBreakpoint] || [])} onShowDrawer={onShowDrawer} />} RightArrow={<RightArrow optionsLayout={<SettingsLayout clickSettings={clickSettings} handleSettingsClick={handleSettingsClick} onSettingsClick={onSettingsClick} setDashboards={setDashboards} dashboards={dashboards} currentDashboard={currentDashboard} showOfs={showOfs} setShowOfs={setShowOfs} preventCollisions={preventCollisions} overlap={overlap} />} items={(toolbox[currentBreakpoint] || [])} />} wrapperClassName={classes.wrapperContainer} scrollContainerClassName={classes.scrollContainer}>
                    {(toolbox[currentBreakpoint] || []).map(item => <ToolboxItem itemId={`t-${item.i}`} key={`t-${item.i}`} item={item} onTakeItem={onTakeItem} />)}
                </ScrollMenu>
                <Suspense fallback={<></>}>
                    <ResponsiveReactGridLayout
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
                        {(Object.keys(currentSettings).length > 0 && showOfs.visible) && currentSettings.ofs.map((ofItem, idx) => {
                            return (<div key={`agg-${ofItem.of_id}-${idx}`} data-grid={{ x: 0, y: 0, w: 2, h: 6, minW: 2, maxW: 3, minH: 5, static: showOfs.static }}><ItemAgg record={{ ...currentSettings }} ofItem={ofItem} parentReload={loadData} /></div>)
                        })}
                        {layouts[currentBreakpoint].filter(v => !v?.disabled && !v.i.startsWith('agg-')).map(v => {
                            return (
                                <CustomGridItemComponent key={v.i}>
                                    {v.i === "formulacao" && <><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemFormulacao card={{ title: "Formulação" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "bobinagens" && <><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemBobinagens card={{ title: "Bobinagens" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "cortes" && <><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemCortes card={{ title: "Cortes" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "actions" && <><CloseItem closable={v?.closable} color="#fff" onClick={() => onPutItem(v)} /><ItemActions card={{ title: "Menu" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "granulado" && <><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemGranulado card={{ title: "Reciclado(Granulado) Lotes" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "nonwovens" && <><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemPickingNW card={{ title: "Nonwovens em Linha - Lotes" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "ordemfabrico" && <><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemOrdensFabrico card={{ title: "Ordens de Fabrico" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "operations" && <><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemOperations card={{ title: "Ações" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                </CustomGridItemComponent>
                            );
                        })
                        }
                    </ResponsiveReactGridLayout>
                </Suspense>
            </>
            }
        </div>
    );
}