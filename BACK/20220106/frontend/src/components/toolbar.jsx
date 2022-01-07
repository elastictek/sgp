import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import {Space} from 'antd';

const StyledToolbar = styled.div`
    display: flex;

    .left{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex: 1;
        white-space: nowrap;
    }
    .center{
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
        white-space: nowrap;
    }
    .right{
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex: 1;
        white-space: nowrap;
    }

    ${(props) => {
        return (!props?.clean) ? `
            padding: .5rem;
            margin-bottom: .5rem!important;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 3px;
        ` : `
            padding-top: 5px;
            padding-bottom: 5px;
            padding-left: 24px;
            padding-right: 24px;
        `
    }};


    
`;

export default ({ left, right, center, clean = false }) => {
    //children.displayName || this.props.children.type.name
    return (
        <StyledToolbar clean={clean}>
            <div className="left">{left}</div>
            <div className="center">{center}</div>
            <div className="right">{right}</div>
        </StyledToolbar>
    );
}

/* display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center; */