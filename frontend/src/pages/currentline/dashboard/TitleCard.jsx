import React from 'react';
import { Select, Tag } from "antd";
import { MoreOutlined } from '@ant-design/icons';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import XScroll from 'components/XScroll';

export default ({ data, title }) => {
    return (
        <XScroll>
            <Container fluid>
                <Row nogutter>
                    <Col xs='content' style={{}}><span style={{ fontSize: "16px", fontWeight: 700 }}>{title}</span></Col>
                </Row>
                <Row nogutter>
                    <Col xs='content' style={{ paddingTop: "3px" }}>
                        {data?.ofs && data?.ofs.map(({ of_cod }) => <Tag style={{marginRight:"2px"}} key={`b-${of_cod}`} icon={<MoreOutlined />} color="#2db7f5">{of_cod}</Tag>)}
                    </Col>
                </Row>
            </Container>
        </XScroll>
    );
}