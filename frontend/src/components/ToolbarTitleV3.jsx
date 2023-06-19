import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import styled from 'styled-components';
import { Button, Breadcrumb, Drawer, Dropdown, Space } from "antd";
import { HomeOutlined, MenuOutlined, CaretDownFilled } from '@ant-design/icons';
import { Row, Col } from 'react-grid-system';
import { Container as FormContainer } from 'components/FormFields';
import MainMenu from '../pages/currentline/dashboard/MainMenu';
import LogoWhite from 'assets/logowhite.svg';
import { getSchema } from "utils/schemaValidator";
import { DASHBOARD_URL } from 'config';
import YScroll from "components/YScroll";

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



export default ({ title, right, details, description, id }) => {
    const navigate = useNavigate();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [history, setHistory] = useState([]);
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname.endsWith("/") ? location.pathname : `${location.pathname}/`;
        let _h = getFromLS(id).filter(v => v.key !== path);
        _h.push({ label: description, key: path, state: location?.state });
        setHistory(_h);
        saveToLS(_h, id);
    }, []);


    const onShowDrawer = () => {
        setDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setDrawerVisible(false);
    };

    const onNavigate = (url) => {
        const path = url.key.endsWith("/") ? url.key : `${url.key}/`;
        let _old = history.find(v => v.key === path);
        let _h = history.filter(v => v.key !== path);
        _h.push({ state: _old?.state, label: url?.label, key: path });
        setHistory(_h);
        saveToLS(_h, id);
        navigate(url.key, { replace: true, state: _old?.state });
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
                visible={drawerVisible}
            >
                <YScroll>
                    <MainMenu dark />
                </YScroll>
            </StyledDrawer>
            <FormContainer id="frm-title" /* form={form} */ wrapForm={false} wrapFormItem={false} schema={schema} fluid style={{}}>
                <Row style={{ marginBottom: "5px" }}>
                    <Col>
                        <Row align='center' nogutter>
                            <Col xs="content">
                                <Button type='link' icon={<MenuOutlined />} onClick={onShowDrawer} />
                            </Col>
                            <Col>
                                <Breadcrumb>
                                    {history.length > 0 &&
                                        <Breadcrumb.Item>
                                            <Dropdown menu={{ items: history, onClick: (e) => onNavigate(history.find(v => v.key === e.key)) }} trigger={['click']}>
                                                <a onClick={(e) => e.preventDefault()}>
                                                    <Space>
                                                        <CaretDownFilled />
                                                    </Space>
                                                </a>
                                            </Dropdown>
                                        </Breadcrumb.Item>
                                    }
                                    <Breadcrumb.Item onClick={() => onNavigate({ label: "Dashboard", key: DASHBOARD_URL })}>
                                        <Space style={{ cursor: "pointer", display: "flex", alignItems: "center" }} size={4}>
                                            <HomeOutlined style={{ fontSize: "14px" }} />
                                            <span>Dashboard</span>
                                        </Space>
                                    </Breadcrumb.Item>
                                </Breadcrumb>
                            </Col>
                        </Row>
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