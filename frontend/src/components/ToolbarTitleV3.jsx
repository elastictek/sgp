import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import styled from 'styled-components';
import { Button, Breadcrumb, Drawer, Dropdown, Space, Modal } from "antd";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { HomeOutlined, MenuOutlined, CaretDownFilled, UnorderedListOutlined, MoreOutlined, CaretLeftOutlined, HomeFilled, HistoryOutlined, LeftCircleFilled, UserOutlined } from '@ant-design/icons';
import { Row, Col, Hidden } from 'react-grid-system';
import { Container as FormContainer } from 'components/FormFields';
import MainMenu from '../pages/currentline/dashboard/MainMenu';
import LogoWhite from 'assets/logowhite.svg';
import LogoWhiteNoText from 'assets/logowhite_notext.svg';

import { getSchema } from "utils/schemaValidator";
import { DASHBOARD_URL, HISTORY_DEFAULT, HISTORY_DEFAULT_FOOTER, LOGIN_URL, LOGOUT_URL } from 'config';
import YScroll from "components/YScroll";
import DropdownButton from 'antd/es/dropdown/dropdown-button';
import { newWindow } from 'utils/loadInitV3';
import { usePermission } from "utils/usePermission";

const schema = (options = {}) => { return getSchema({}, options).unknown(true); };


const StyledDrawer = styled(Drawer)`
    .ant-drawer-wrapper-body{
        background:#2a3142;
    }
    .ant-drawer-content{
        background:#2a3142;
    }
    .ant-drawer-header{
        border-bottom:none;
    }

`;

const StyledLogo = styled(LogoWhiteNoText)`
    &:hover svg path[style*="fill:#fff"
        fill: rgb(21, 145, 196);
    }
`;


const getFromLS = (id) => {
    let ls = null;
    if (global.localStorage) {
        try {
            ls = JSON.parse(global.localStorage.getItem(`history-${id}`));
        } catch (e) { }
    }
    return !ls ? [] : ls;
}

const saveToLS = (value, id) => {
    if (global.localStorage) {
        global.localStorage.setItem(`history-${id}`, JSON.stringify(value));
    }
}

export const saveNavigation = (description, id, location) => {
    const path = location.pathname.endsWith("/") ? location.pathname : `${location.pathname}/`;
    let _h = getFromLS(id).filter(v => v.key !== path);
    _h.push({ label: description, key: path, state: location?.state });
    if (global.localStorage) {
        global.localStorage.setItem(`history-${id}`, JSON.stringify(_h));
    }
}

export const SimpleDropdownHistory = ({ fixedTopItems, fixedFooterItems, right, center, details, description, id }) => {
    const navigate = useNavigate();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [history, setHistory] = useState([]);
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname.endsWith("/") ? location.pathname : `${location.pathname}/`;
        let _h = getFromLS(id).filter(v => v.key !== path);
        _h.push({ label: description, key: path, state: location?.state });
        _h = _h.slice(-15);
        setHistory(_h);
        saveToLS(_h, id);
        document.title = description;
    }, []);


    const onShowDrawer = () => {
        setDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setDrawerVisible(false);
    };

    // const onNavigate = (url, key) => {
    //     if (!url && key) {
    //         let _p = key.endsWith("/") ? key : `${key}/`;
    //         _p = _p.startsWith("#") ? _p.slice(1) : _p;
    //         navigate(_p, { replace: true });
    //     } else {
    //         const path = url.key.endsWith("/") ? url.key : `${url.key}/`;
    //         let _old = history.find(v => v.key === path);
    //         let _h = history.filter(v => v.key !== path);
    //         _h.push({ state: _old?.state, label: url?.label, key: path });
    //         setHistory(_h);
    //         saveToLS(_h, id);
    //         navigate(url.key, { replace: true, state: _old?.state });
    //     }
    // }

    const onNavigate = async (url, action) => {
        if (action !== "back" && action !== "logout") {
            let path = url.key.endsWith("/") ? url.key : `${url.key}/`;
            path = path.startsWith("#") ? path.slice(1) : path;
            let _old = history.find(v => v.key === path);
            let _h = history.filter(v => v.key !== path);
            _h.push({ state: _old?.state, label: url?.label, key: path });
            setHistory(_h);
            saveToLS(_h, id);
            if (url?.state && url?.state?.newWindow) {
                newWindow(path, { ..._old?.state }, url?.state?.newWindow);
            } else {
                navigate(path, { replace: true, state: _old?.state });
            }
        } else if (action == "back") {
            const _h = [...history];
            _h.pop();
            const _t = _h[_h.length - 1];
            if (!_t?.key) {
                return;
            }
            setHistory(_h);
            saveToLS(_h, id);
            navigate(_t.key, { replace: true, state: _t?.state });
        } else if (action == "logout") {
            try {
                let response = await fetchPost({ url: LOGOUT_URL, parameters: {} });
                if (response.status === 200) {
                    window.location.href = LOGIN_URL;
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
        }
    }

    return (
        <>
            <StyledDrawer
                title={
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <LogoWhite style={{ width: "100px", height: "24px", paddingRight: "10px" }} />
                    </div>
                }
                placement="left"
                closable={false}
                onClose={onCloseDrawer}
                open={drawerVisible}
            >
                <YScroll>
                    <MainMenu dark />
                </YScroll>
            </StyledDrawer>
            <FormContainer id="frm-title" /* form={form} */ wrapForm={false} wrapFormItem={false} schema={schema} fluid style={{ padding: "0px" }}>
                <Row nogutter style={{ /* marginBottom: "5px" */ }}>
                    <Col>
                        <Row align='center' nogutter>
                            <Col xs="content" style={{ display: "flex" }}>
                                <StyledLogo style={{ width: "35px", height: "28px"/* , paddingRight: "10px" */ }} onClick={onShowDrawer} />
                            </Col>
                            {center && <Col xs="content" style={{ display: "flex" }}>{center}</Col>}
                            <Col width={25} style={{ textAlign: "right" }}>
                                <Dropdown menu={{ items: [...fixedTopItems, ...history, ...fixedFooterItems], onClick: (e) => onNavigate(e.key == "back" ? null : [...fixedTopItems, ...history, ...fixedFooterItems].find(v => v.key === e.key), e.key) }} trigger={['click']}>
                                    {/* <Dropdown menu={{ items: [...fixedItems, ...history], onClick: (e) => (history && history.length > 0) && onNavigate(history.find(v => v.key === e.key), e.key) }} trigger={['click']}> */}
                                    <Button ghost style={{ border: "0px" }} icon={<MenuOutlined style={{/* fontSize:"24px" */ }} />} onClick={(e) => e.preventDefault()} />
                                </Dropdown>
                            </Col>
                        </Row>
                    </Col>
                    {right && <Col style={{ alignItems: "center" }}>
                        <Row gutterWidth={2} justify='end'>
                            {right}
                        </Row>
                    </Col>}
                </Row>
                {details && <Row>
                    <Col style={{}}>
                        {details}
                    </Col>
                </Row>}
            </FormContainer>

        </>
    );
}

export default ({ title, leftTitle, right, rightHeader, details, description, id, actions, showHistory = true, save = true, logInInfo = true }) => {
    const navigate = useNavigate();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [history, setHistory] = useState([]);
    const location = useLocation();
    const permission = usePermission({});

    useEffect(() => {
        const path = location.pathname.endsWith("/") ? location.pathname : `${location.pathname}/`;
        let _h = getFromLS(id).filter(v => v.key !== path);
        if (save) {
            _h.push({ label: description, key: path, state: location?.state });
            _h = _h.slice(-15);
        }
        setHistory(_h);
        saveToLS(_h, id);
        document.title = description;

        // Optionally, you can also return a cleanup function to revert the title when the component unmounts
        /* return () => {
          document.title = 'Original Page Title';
        }; */
    }, []);


    const onShowDrawer = () => {
        setDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setDrawerVisible(false);
    };

    const onNavigate = async (url, action) => {
        if (action == "mainmenu") {
            onShowDrawer();
        }
        else if (action !== "back" && action !== "logout") {
            let path = url.key.endsWith("/") ? url.key : `${url.key}/`;
            path = path.startsWith("#") ? path.slice(1) : path;
            let _old = history.find(v => v.key === path);
            let _h = history.filter(v => v.key !== path);
            _h.push({ state: _old?.state, label: url?.label, key: path });
            setHistory(_h);
            saveToLS(_h, id);

            if (url?.state && url?.state?.newWindow) {
                newWindow(path, { ..._old?.state }, url?.state?.newWindow);
            } else {
                navigate(path, { replace: true, state: _old?.state });
            }
        } else if (action == "back") {
            const _h = [...history];
            _h.pop();
            const _t = _h[_h.length - 1];
            if (!_t?.key) {
                return;
            }
            setHistory(_h);
            saveToLS(_h, id);
            navigate(_t.key, { replace: true, state: _t?.state });
        } else if (action == "logout") {
            try {
                let response = await fetchPost({ url: LOGOUT_URL, parameters: {} });
                if (response.status === 200) {
                    window.location.href = LOGIN_URL;
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
        }
    }

    return (
        <>
            {showHistory && <StyledDrawer
                title={
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <LogoWhite style={{ width: "100px", height: "24px", paddingRight: "10px" }} />
                    </div>
                }
                placement="left"
                closable={false}
                onClose={onCloseDrawer}
                open={drawerVisible}
            >
                <YScroll>
                    <MainMenu dark />
                </YScroll>
            </StyledDrawer>}
            <FormContainer id="frm-title" /* form={form} */ wrapForm={false} wrapFormItem={false} schema={schema} fluid style={{}}>
                <Row style={{ marginBottom: "5px" }}>
                    <Col style={{ paddingTop: "5px" }}>
                        {showHistory && <Row align='center' nogutter>
                            {/* <Col xs="content">
                                <Button type='link' icon={<MenuOutlined />} onClick={onShowDrawer} />
                            </Col> */}
                            <Col xs="content" style={{ marginRight: "2px" }}>
                                <Button onClick={() => onNavigate(null, "back")} style={{ padding: "0px 5px", background: "#f0f0f0", border: "0px" }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <LeftCircleFilled style={{ marginRight: "5px" /* fontSize: "16px", cursor: "pointer", color: "#8c8c8c" */ }} />
                                        <div>Voltar</div>
                                    </div>
                                </Button>
                            </Col>
                            <Col xs="content">
                                <Dropdown menu={{ items: [...HISTORY_DEFAULT, ...history, ...HISTORY_DEFAULT_FOOTER], onClick: (e) => onNavigate(e.key == "back" ? null : [...HISTORY_DEFAULT, ...history, ...HISTORY_DEFAULT_FOOTER].find(v => v.key === e.key), e.key) }} trigger={['click']}>
                                    <Button type='link' icon={<MenuOutlined />} style={{ background: "#f0f0f0" }} />
                                </Dropdown>
                            </Col>
                            <Col xs="content">
                                {actions && actions}
                            </Col>

                            <Col style={{ display: "flex", alignItems: "center" }}>

                                {/* <Space.Compact> */}

                                {/*  </Space.Compact> */}


                                {/* <div><LeftCircleFilled onClick={() => onNavigate(null, "back")} style={{ fontSize: "16px", cursor: "pointer",marginRight:"5px",color:"#8c8c8c" }} /></div> */}

                                {leftTitle && <div style={{ marginLeft: "10px", alignItems: "center", fontSize: "18px", lineHeight: "normal", fontWeight: 900 }}>{leftTitle}</div>}
                                {/* <Breadcrumb>
                                    {history.length > 0 && <>
                                        {history.length > 1 && <Breadcrumb.Item><Button onClick={(e) => onNavigate(null, "back")} title='Retroceder' size="small" type="link" icon={<CaretLeftOutlined />} /> </Breadcrumb.Item>}
                                        <Breadcrumb.Item>
                                            <Dropdown menu={{ items: [...HISTORY_DEFAULT, ...history], onClick: (e) => onNavigate(e.key == "back" ? null : [...HISTORY_DEFAULT, ...history].find(v => v.key === e.key), e.key) }} trigger={['click']}>
                                                <a onClick={(e) => e.preventDefault()}>
                                                    <Space>
                                                        <HistoryOutlined />
                                                        <CaretDownFilled />
                                                    </Space>
                                                </a>
                                            </Dropdown>
                                        </Breadcrumb.Item>
                                    </>
                                    }
                                    <Breadcrumb.Item onClick={() => onNavigate({ label: "Dashboard", key: DASHBOARD_URL })}>
                                        <Space style={{ cursor: "pointer", display: "flex", alignItems: "center" }} size={4}>
                                            <HomeFilled style={{ fontSize: "14px" }} />
                                        </Space>
                                    </Breadcrumb.Item>
                                </Breadcrumb> */}
                            </Col>
                            {rightHeader && <Col xs="content" style={{ alignItems: "center" }}>
                                <Row gutterWidth={2} justify='end'>
                                    {rightHeader}
                                </Row>
                            </Col>}
                            {logInInfo && <Hidden xs sm md>
                                <Col xs="content" style={{ fontWeight: 400, fontSize: "12px" }}>
                                    <UserOutlined /><span style={{fontSize:"11px"}}>{permission.auth?.name}</span>
                                </Col>
                            </Hidden>}
                        </Row>}
                        {title && <Row style={{ alignItems: "center", fontSize: "18px", lineHeight: "normal", fontWeight: 900 }} gutterWidth={5}>
                            {title}
                        </Row>}
                    </Col>
                    {right && <Col style={{ alignItems: "center" }}>
                        <Row gutterWidth={2} justify='end'>
                            {right}
                        </Row>
                    </Col>}
                </Row>
                {details && <Row>
                    <Col style={{}}>
                        {details}
                    </Col>
                </Row>}
            </FormContainer>

        </>
    );
}