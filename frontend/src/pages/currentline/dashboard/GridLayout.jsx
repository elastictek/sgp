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
import { Button, Select, Typography, Card, Collapse, Space, Modal, Popover, Menu, Divider, Drawer, message, Checkbox } from "antd";
const { Text, Title } = Typography;
import { SyncOutlined, SettingOutlined, MenuOutlined, AppstoreOutlined, LogoutOutlined, ProjectOutlined, SaveOutlined, ClearOutlined, PushpinOutlined, CaretDownOutlined } from '@ant-design/icons';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { MdOutlineApps, MdOutlineMenu, MdOutlineReceipt } from 'react-icons/md';
import { BsChevronCompactLeft, BsChevronCompactRight, BsDot } from 'react-icons/bs';
import { GoPrimitiveDot } from 'react-icons/go';
import { TbPinnedOff, TbPin } from 'react-icons/tb';
import { usePermission } from "utils/usePermission";



import Logo from 'assets/logo.svg';
import LogoWhite from 'assets/logowhite.svg';
import { useRef } from 'react';
import MainMenu from './MainMenu';
const ItemCortes = React.lazy(() => import('./ItemCortes'));
const ItemActions = React.lazy(() => import('./ItemActions'));
const ItemAgg = React.lazy(() => import('./ItemAgg'));
const ItemNav = React.lazy(() => import('./ItemNav'));
const ItemReciclado = React.lazy(() => import('./ItemReciclado'));
const ItemBobinagens = React.lazy(() => import('./ItemBobinagens'));
const ItemFormulacao = React.lazy(() => import('./ItemFormulacao'));
const ItemGamaOperatoria = React.lazy(() => import('./ItemGamaOperatoria'));
const ItemSpecs = React.lazy(() => import('./ItemSpecs'));
const ItemOrdensFabrico = React.lazy(() => import('./ItemOrdensFabrico'));
const ItemOperations = React.lazy(() => import('./ItemOperations'));
const ItemPickingNW = React.lazy(() => import('./ItemPickingNW'));
const ItemPickingGranulado = React.lazy(() => import('./ItemPickingGranulado'));
const ItemLineLogList = React.lazy(() => import('./ItemLineLogList'));
const ItemMPLocal = React.lazy(() => import('./ItemMPLocal'));
const ItemReportReciclado = React.lazy(() => import('./reports/ItemReportReciclado'));
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
    toolboxDropdownItem: {
        lineHeight: 1,
        cursor: "pointer",
        minWidth: "85px",
        minHeight: "25px",
        display: "flex",
        flexDirection: "row",
        marginRight: "5px",
        border: "solid 1px #d9d9d9",
        borderRadius: "6px",
        whiteSpace: "nowrap",
        padding: "3px",
        alignItems: "center",
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
    { id: "tpl-01", description: "Produção", oneElement: false, ofs: { visible: false, static: false, allowChange: true } },
    { id: "tpl-02", description: "Planeamento", oneElement: false, ofs: { visible: true, static: false, allowChange: false } },
    { id: "tpl-03", description: "Matérias Prima", oneElement: false, ofs: { visible: false, static: false, allowChange: true } },
    { id: "ly-01", description: "Dashboard 1", oneElement: false, ofs: { visible: false, static: false, allowChange: true } },
    { id: "ly-02", description: "Dashboard 2", oneElement: false, ofs: { visible: false, static: false, allowChange: true } },
    { id: "ly-03", description: "Dashboard 3", oneElement: false, ofs: { visible: false, static: false, allowChange: true } },
    { id: "ly-04", description: "Dashboard 4", oneElement: false, ofs: { visible: false, static: false, allowChange: true } },
    { id: "ly-05", description: "Dashboard 5", oneElement: false, ofs: { visible: false, static: false, allowChange: true } },
    { id: "ly-06", description: "Dashboard 6", oneElement: false, ofs: { visible: false, static: false, allowChange: true } }
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
        { i: "ordemfabrico", x: 0, y: 0, w: 8, h: 8, minH: 4, closable: true },
        { i: "linelog", x: 0, y: 0, w: 8, h: 8, minH: 4, closable: true },
        //{ i: "nav", x: 0, y: 0, w: 8, h: 8, minH: 4, closable: true },
        { i: "mp" },
        { i: "mp#local", x: 0, y: 0, w: 4, h: 8, minH: 4, closable: true },
        { i: "mp#reciclado", x: 0, y: 0, w: 4, h: 8, minH: 4, closable: true },
        { i: "mp#nonwovens", x: 0, y: 0, w: 4, h: 8, minH: 4, closable: true },
        { i: "mp#granulado", x: 0, y: 0, w: 8, h: 8, minH: 4, closable: true },
        //{ i: "prod-reports" },
        //{ i: "prod-reports#reciclado", x: 0, y: 0, w: 8, h: 8, minH: 4, closable: true },
        { i: "fichaprocesso", x: 0, y: 0, w: 4, h: 8, minH: 4, closable: true },
        { i: "fichaprocesso#gamaoperatoria", x: 0, y: 0, w: 4, h: 8, minH: 4, closable: true },
        { i: "fichaprocesso#specs", x: 0, y: 0, w: 8, h: 8, minH: 4, closable: true },
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
            { i: "operations", x: 0, y: 0, w: 3, h: 4, minH: 4, maxW: 4, static: true }
        ],
        "tpl-02": [
            /* { i: "cortes", x: 0, y: 0, w: 6, h: 6, minH: 4, closable: true } */
        ]
    }
}

const toolboxItems = {
    cortes: { description: "Cortes", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} /> },
    formulacao: { description: "Formulação", icon: <MdOutlineReceipt style={{ fontSize: '18px', color: '#08c' }} /> },
    bobinagens: { description: "Bobinagens", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} /> },
    actions: { description: "Menu", icon: <MdOutlineMenu style={{ fontSize: '18px', color: '#08c' }} /> },
    ordemfabrico: { description: "Ordens Fabrico", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} /> },
    operations: { description: "Ações", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} /> },
    linelog: { description: "Eventos da Linha", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} /> },
    //nav: { description: "Estado", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} /> },
    mp: {
        description: "Matérias Primas", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} />, children: {
            local: { description: "Localização Matérias Primas", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} /> },
            nonwovens: { description: "Nonwovens Linha", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} /> },
            granulado: { description: "Granulado Linha", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} /> },
            reciclado: { description: "Reciclado", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} /> }
        }
    },
    fichaprocesso: {
        description: "Ficha Processo", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} />, children: {
            gamaoperatoria: { description: "Gama Operatória", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} /> },
            specs: { description: "Especificações", icon: <MdOutlineApps style={{ fontSize: '18px', color: '#08c' }} /> }
        }
    },
    //"prod-reports": {
    //    description: "Relatórios Produção", icon: <ProjectOutlined style={{ fontSize: '18px', color: '#08c' }} />, children: {
    //        reciclado: { description: "Reciclado produzido e consumido", icon: <ProjectOutlined style={{ fontSize: '18px', color: '#08c' }} /> }
    //    }
    //}
}


const ToolboxItem = ({ currentBreakpoint, item, onTakeItem }) => {
    const classes = useStyles();
    const toolItem = toolboxItems[item.i];

    const [clickDropdown, setClickDropdown] = useState(false);

    const handleDropdownClick = (visible) => {
        setClickDropdown(visible);
    }

    const itemsClick = (i) => {
        const key = i.key;
        const _item = allItems[currentBreakpoint].find(v => v.i == key);
        onTakeItem(_item);
    }

    return (
        <>
            {item.i in toolboxItems &&
                <>
                    {toolItem?.children ?
                        <Popover
                            open={clickDropdown}
                            onOpenChange={handleDropdownClick}
                            title={<div style={{ fontWeight: 700 }}>{toolItem.description}</div>}
                            trigger={["click"]}
                            content={
                                <div style={{ display: "flex", flexDirection: "column" }}>

                                    <Menu onClick={(v) => itemsClick(v)} items={Object.keys(toolItem.children).map((x) => {
                                        return (
                                            { style: { display: "flex", alignItems: "center" }, label: <Text style={{}}>{toolItem.children[x].description}</Text>, icon: toolItem.children[x].icon, key: `${item.i}#${x}` }
                                        );
                                    })}></Menu>
                                </div>
                            }
                        >
                            <div className={classes.toolboxDropdownItem}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div>{toolItem?.icon && toolItem.icon}</div>
                                    <div>{toolItem?.description ? toolItem.description : item.i}</div>
                                </div>
                                <CaretDownOutlined />
                            </div>
                        </Popover>
                        :
                        <div className={classes.toolboxItem} onClick={() => onTakeItem(item)}>
                            <div>{toolItem?.icon && toolItem.icon}</div>
                            <div>{toolItem?.description ? toolItem.description : item.i}</div>
                        </div>}
                </>
            }
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><Logo onClick={onShowDrawer} style={{ width: "100px", height: "24px", marginLeft: "5px", paddingRight: "10px", cursor: "pointer" }} /><div style={{ fontSize: "8px" }}>v.220922.13.18</div></div>
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

    const getOneElement = () => {
        return dashboards.find(v => v.id === currentDashboard)?.oneElement;
    }

    return (
        <>
            {/*             <Popover
                open={clickSettings}
                onOpenChange={handleSettingsClick}
                placement="bottomRight" title="Definições"
                content={ */}
            <YScroll>
                <div style={{ display: "flex", flexDirection: "column" }}>

                    <Menu onClick={(v) => onSettingsClick(v)} items={dashboards.map((x) => {
                        return (
                            { label: <Text style={{ fontWeight: 700 }} onClick={e => { if (startEdit.current === true) { e.stopPropagation(); startEdit.current = false; } }} editable={{ onStart: () => startEdit.current = true, onChange: (v) => onChange("description", v, x) }}>{x.description}</Text>, key: `dashboard-${x.id}`, icon: <AppstoreOutlined style={{ fontSize: '18px' }} /> }
                        );
                    })}></Menu>

                    {showOfs.allowChange === true && <><Divider style={{ margin: "8px 0" }} />
                        <Menu onClick={() => onChange("ofs")} items={[
                            { label: <Checkbox onClick={(e) => e.stopPropagation()} checked={showOfs.visible}>Mostrar ordens de fabrico</Checkbox>, key: 'viewofs', icon: <GoPrimitiveDot /> }
                        ]}></Menu>
                    </>}
                    <Divider style={{ margin: "8px 0" }} />
                    <Menu onClick={(v) => onSettingsClick(v)} items={[
                        { label: <Checkbox onClick={(e) => e.stopPropagation()} checked={getOneElement()}>Apenas um elemento na área de trabalho</Checkbox>, key: 'oneelement', icon: <GoPrimitiveDot /> },
                        { label: <Checkbox onClick={(e) => e.stopPropagation()} checked={preventCollisions}>Prevenir colisões</Checkbox>, key: 'collisions', icon: <GoPrimitiveDot /> },
                        { label: <Checkbox onClick={(e) => e.stopPropagation()} checked={overlap}>Permitir sobreposições</Checkbox>, key: 'overlap', icon: <GoPrimitiveDot /> }
                    ]}></Menu>
                    <Divider style={{ margin: "8px 0" }} />
                    <Menu onClick={(v) => onSettingsClick(v)} items={[
                        { label: <b>Guardar áreas de trabalho</b>, key: 'savelayout', icon: <SaveOutlined style={{ fontSize: '18px' }} /> },
                        { label: <span>Repor área de trabalho <b>{getDescription(currentDashboard)}</b></span>, key: 'resetlayout', icon: <SyncOutlined style={{ fontSize: '18px' }} /> },
                        { label: <span>Repor todas as áreas de trabalho</span>, key: 'resetalllayouts', icon: <ClearOutlined style={{ fontSize: '18px' }} /> }
                    ]}></Menu>
                    <Divider style={{ margin: "8px 0" }} />
                    <Menu onClick={(v) => onSettingsClick(v)} items={[
                        { label: 'Logout', key: 'logout', icon: <LogoutOutlined style={{ fontSize: '18px' }} /> }
                    ]}></Menu>
                </div>
            </YScroll>
            {/*                 } trigger="click">
                <div style={{ cursor: "pointer", textAlign: "center" }}>
                    <StyledLink type="link" size="small" icon={<SettingOutlined/>} style={{ marginLef: "5px", marginBottom: "0px" }}><span style={{ fontSize: "12px", fontWeight: 700 }}>{dashboards.find(v => v.id === currentDashboard)?.description}</span></StyledLink>
                    <div style={{ textAlign: "center", whiteSpace: "nowrap", padding: "0px 5px" }}>{auth.name} {auth.turno.enabled && <span><Text type="secondary">|</Text> Turno <b>{`${auth.turno.turno}`}</b></span>}</div>
                </div>
            </Popover > */}
        </>
    );
}

const ButtonSettings = ({ onClick, dashboards, currentDashboard }) => {
    const { auth } = useContext(AppContext);
    return (
        <div style={{ cursor: "pointer", textAlign: "center" }} onClick={() => onClick(true)}>
            <StyledLink type="link" size="small" icon={<SettingOutlined />} style={{ marginLef: "5px", marginBottom: "0px" }}><span style={{ fontSize: "12px", fontWeight: 700 }}>{dashboards.find(v => v.id === currentDashboard)?.description}</span></StyledLink>
            <div style={{ textAlign: "center", whiteSpace: "nowrap", padding: "0px 5px" }}>{auth.name} {auth.turno.enabled && <span><Text type="secondary">|</Text> Turno <b>{`${auth.turno.turno}`}</b></span>}</div>
        </div>
    );
}

const CustomGridItemComponent = React.forwardRef(({ style, className, children, ...props }, ref) => {
    return (
        <div style={{ ...style }} className={className} ref={ref} {...props}>
            {children}
        </div>
    );
});

const StylesClose = styled(Button).withConfig({
    shouldForwardProp: (prop) => !['closable'].includes(prop)
})`
${({ closable, color, background }) => closable && `
    position: absolute;
    right: 6px; 
    top: 3px;
    width:18px !important;
    height:18px !important;
    line-height:1;
    z-index: 1000;
    padding:0px 0px !important;
    font-weight:700;
    color:${color ? color : "#000"};
    background:${background ? background : "#fff"};
`}
`;

const CloseItem = ({ value, ...props }) => {
    return (<>
        {props?.closable === true && <StylesClose size="small" {...props}>x</StylesClose>}
    </>);
}

const Pin = styled(Button).withConfig({
    shouldForwardProp: (prop) => !['pinnable'].includes(prop)
})`
${({ pinnable, color, background }) => pinnable && `
    position: absolute;
    right: 6px; 
    top: 22px; 
    width:18px !important;
    height:18px !important;
    z-index: 1000;
    color:${color ? color : "#000"};
    background:${background ? background : "#fff"};
`}
`;

const PinItem = ({ value, ...props }) => {
    return (<>
        <Pin type={value.static && "primary"} size="small" {...props} icon={<TbPin />} />
    </>);
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
    const [preventCollisions, setPreventCollisions] = useState(false);
    const [overlap, setOverlap] = useState(false);
    const [showOfs, setShowOfs] = useState({ visible: false, static: false, allowChange: true });
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [rightDrawerVisible, setRightDrawerVisible] = useState(false);
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
                case 'oneelement': onOneElement(); break;
                case type?.key.match(/^dashboard-/)?.input:
                    changeCurrentDashboard(type.key.replace("dashboard-", ""));
                    break;
                default: break;
            }
        }
        hideSettings();
    }

    const onTakeItem = (item) => {
        if (!layouts[currentBreakpoint].some(v => v.i == item.i)) {
            const db = dashboards.find(v => v.id === currentDashboard);
            let _layouts;
            let _toolbox;
            if (db.oneElement === true) {
                _layouts = { ...layouts, [currentBreakpoint]: [item] };
                _toolbox = { ...toolbox, [currentBreakpoint]: [...allItems[currentBreakpoint].filter(v => !v?.disabled && v.i !== item.i)] };
            } else {
                _layouts = { ...layouts, [currentBreakpoint]: [...layouts[currentBreakpoint] || [], item] };
                _toolbox = { ...toolbox, [currentBreakpoint]: [...(toolbox[currentBreakpoint] || []).filter(({ i }) => i !== item.i)] };
            }
            setLayouts(_layouts);
            setToolbox(_toolbox);
            if (layouts[currentBreakpoint].length === 0) {
                saveToLS("layouts", _layouts, permission.auth.user);
                saveToLS("toolbox", _toolbox, permission.auth.user);
            }
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

    const onPinItem = (item) => {

        setLayouts(prev => ({
            ...prev,
            [currentBreakpoint]: [
                ...(prev[currentBreakpoint] || []).filter(({ i }) => i !== item.i),
                { ...item, static: !item.static }

            ]
        }));

        console.log(item);
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

    const onOneElement = () => {
        const db = dashboards.find(v => v.id === currentDashboard);
        const _layouts = { ...layouts };
        const _toolbox = { ...toolbox };
        const oe = db?.oneElement === true ? false : true;
        const _dashboards = dashboards.map(v => v.id === currentDashboard ? { ...v, oneElement: oe } : v);
        for (let k of Object.keys(_layouts)) {
            if (oe && _layouts[k].length > 1) {
                _layouts[k] = [_layouts[k][0]];
                let cb = !(k in allItems) ? "lg" : k;
                _toolbox[k] = allItems[cb].filter(v => !v?.disabled && !_layouts[k].some(x => x.i === v.i));
            }
        }
        setDashboards(_dashboards);
        console.log("---", _dashboards)
        setLayouts(_layouts);
        setToolbox(_toolbox);
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
                            }else{
                                let defaultt = await fetchPost({ url: `${API_URL}/loadlayout/`, filter: { user: "default" }, parameters: {} });
                                if (defaultt.data.status !== "error" && defaultt.data.rows.length > 0) {
                                    saveToLS("saveall", defaultt.data.rows[0].layout, permission.auth.user);
                                }
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
                <Drawer title={<div style={{ fontWeight: 900 }}>Definições</div>} placement='right' closable={false} onClose={() => setRightDrawerVisible(false)} visible={rightDrawerVisible}>
                    <SettingsLayout clickSettings={clickSettings} handleSettingsClick={handleSettingsClick} onSettingsClick={onSettingsClick} setDashboards={setDashboards} dashboards={dashboards} currentDashboard={currentDashboard} showOfs={showOfs} setShowOfs={setShowOfs} preventCollisions={preventCollisions} overlap={overlap} />
                </Drawer>
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
                <ScrollMenu onWheel={onWheel} LeftArrow={<LeftArrow items={(toolbox[currentBreakpoint] || [])} onShowDrawer={onShowDrawer} />} RightArrow={<RightArrow optionsLayout={<ButtonSettings dashboards={dashboards} currentDashboard={currentDashboard} onClick={setRightDrawerVisible} />} items={(toolbox[currentBreakpoint] || [])} />} wrapperClassName={classes.wrapperContainer} scrollContainerClassName={classes.scrollContainer}>
                    {(toolbox[currentBreakpoint] || []).map(item => <ToolboxItem currentBreakpoint={currentBreakpoint} itemId={`t-${item.i}`} key={`t-${item.i}`} item={item} onTakeItem={onTakeItem} />)}
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
                        {layouts[currentBreakpoint].filter(v => !v?.disabled && !v.i.startsWith('agg-')).map(v => {
                            return (
                                <CustomGridItemComponent key={v.i}>
                                    {v.i === "formulacao" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemFormulacao card={{ title: "Formulação" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "bobinagens" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemBobinagens card={{ title: "Bobinagens" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "cortes" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemCortes card={{ title: "Cortes" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "actions" && <><PinItem value={v} onClick={() => onPinItem(v)} color="#fff" background="#2a3142" pinnable={true} /><CloseItem closable={v?.closable} color="#fff" background="#2a3142" onClick={() => onPutItem(v)} /><ItemActions card={{ title: "Menu" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "mp#reciclado" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemReciclado card={{ title: "Reciclado Lotes" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "mp#nonwovens" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemPickingNW card={{ title: "Nonwovens em Linha - Lotes" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "mp#granulado" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemPickingGranulado card={{ title: "Granulado em Linha - Lotes" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "ordemfabrico" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemOrdensFabrico card={{ title: "Ordens de Fabrico" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "linelog" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemLineLogList card={{ title: "Eventos da Linha" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "nav" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemNav card={{ title: "Estado" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "mp#local" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemMPLocal card={{ title: "Matérias Primas" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "operations" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemOperations card={{ title: "Ações" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "prod-reports#reciclado" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemReportReciclado card={{ title: "Reciclado" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "fichaprocesso#gamaoperatoria" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemGamaOperatoria card={{ title: "Gama Operatória" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                    {v.i === "fichaprocesso#specs" && <><PinItem value={v} onClick={() => onPinItem(v)} pinnable={true} /><CloseItem closable={v?.closable} onClick={() => onPutItem(v)} /><ItemSpecs card={{ title: "Especificações" }} record={{ ...currentSettings }} parentReload={loadData} /></>}
                                </CustomGridItemComponent>
                            );
                        })
                        }
                        {(Object.keys(currentSettings).length > 0 && showOfs.visible) && currentSettings.ofs.map((ofItem, idx) => {
                            return (<div key={`agg-${ofItem.of_id}-${idx}`} data-grid={{ x: 0, y: 0, w: 2, h: 6, minW: 2, maxW: 3, minH: 5, static: showOfs.static }}><ItemAgg record={{ ...currentSettings }} ofItem={ofItem} parentReload={loadData} /></div>)
                        })}
                    </ResponsiveReactGridLayout>
                </Suspense>
            </>
            }
        </div>
    );
}