import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Row, Col, Hidden } from 'react-grid-system';

const StyledToolbar = styled(Row).withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children', 'ref'].includes(prop)
})`
    ${({ clean = 0 }) => {
        return (clean == 0) ? `
            padding:5px;
            margin:0px 0px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 3px;
        ` : `
            margin:0px 0px;    
            padding-top: 1px;
            padding-bottom: 1px;
            padding-left: 1px;
            padding-right: 1px;            
        `
    }};    
`;

export default ({ left, right, center, clean = false, style, ...props }) => {
    //children.displayName || this.props.children.type.name
    return (
        <Row nogutter style={{ ...clean ? { padding: "1px" } : { padding: "5px", background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "3px" }, ...style }} {...props}>
            <Col xs="content">{left}</Col>
            <Col>{center}</Col>
            <Col xs="content">{right}</Col>
        </Row>
    );
}

/* display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center; */