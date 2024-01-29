import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import styled from 'styled-components';
import { Button, Breadcrumb, Drawer, Space, ConfigProvider } from "antd";
import { HomeOutlined, MenuOutlined } from '@ant-design/icons';
import { Row, Col } from 'react-grid-system';
import { Container as FormContainer } from 'components/FormFields';
import MainMenu from '../pages/currentline/dashboard/MainMenu';
import LogoWhite from 'assets/logowhite.svg';
import { getSchema } from "utils/schemaValidator";
import YScroll from "components/YScroll";

const schema = (options = {}) => { return getSchema({}, options).unknown(true); };


export default ({ title, right, history = [], details }) => {
    const navigate = useNavigate();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const onShowDrawer = () => {
        setDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setDrawerVisible(false);
    };

    return (
        <>
            <ConfigProvider
                theme={{
                    token: {
                        colorBgElevated: "#2a3142"
                    },
                }}
            >
                <Drawer
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
                </Drawer>
            </ConfigProvider>
            <FormContainer id="frm-title" /* form={form} */ wrapForm={false} wrapFormItem={false} schema={schema} label={{ enabled: false }} fluid style={{ margin: "0px" }}>
                <Row style={{ marginBottom: "10px" }}>
                    <Col>
                        <Row align='center' nogutter>
                            <Col xs="content">
                                <Button type='link' icon={<MenuOutlined />} onClick={onShowDrawer} />
                            </Col>
                            <Col>
                                <Breadcrumb>
                                    {history.length === 0 ?
                                        <Breadcrumb.Item style={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => navigate(-1)}>
                                            <Space>
                                                <HomeOutlined style={{ fontSize: "14px" }} />
                                                <span>Dashboard</span>
                                            </Space>
                                        </Breadcrumb.Item>
                                        : ['Dashboard', ...history].map((v, i) => {
                                            return (<React.Fragment key={`hst-${i}`}>
                                                {i > 0 ? <Breadcrumb.Item style={{ cursor: "pointer" }} onClick={() => navigate(((history.length + 1) - i) * -1)}>
                                                    <span>{v}</span>
                                                </Breadcrumb.Item>
                                                    : <Breadcrumb.Item onClick={() => navigate(((history.length + 1) - i) * -1)}>
                                                        <Space style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                                                            <HomeOutlined style={{ fontSize: "14px" }} />
                                                            <span>Dashboard</span>
                                                        </Space>
                                                    </Breadcrumb.Item>}
                                            </React.Fragment>
                                            )
                                        })
                                    }
                                </Breadcrumb>
                            </Col>
                        </Row>
                        {title && <Row style={{ alignItems: "center" }} gutterWidth={5}>
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
                    <Col>
                        {details}
                    </Col>
                </Row>}
            </FormContainer>

        </>
    );
}