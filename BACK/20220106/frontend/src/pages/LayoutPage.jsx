import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import {PAGE_TOOLBAR_HEIGHT} from "config"
import {Outlet,useNavigate} from "react-router-dom";


export default () => {
    const navigate = useNavigate();
    return (
        <div>
            <div style={{height:PAGE_TOOLBAR_HEIGHT,maxHeight:PAGE_TOOLBAR_HEIGHT, overflow:"hidden", overflowY:"auto"}}>
                LAYOUT PAGE
                <ul>
                    <li>
                        <div onClick={() => { navigate('/app'); window.location.reload(); }}>Refresh</div>
                    </li>
                    <li>
                        <div onClick={() => navigate('/app')}>Home</div>
                    </li>
                    <li>
                        <div onClick={() => navigate('/app/sorders')}>Encomendas</div>
                    </li>
                    <li>
                        <div onClick={() => navigate('/app/ordemfabrico/formdetails', { state: { id: 48 } })}>Form Ordem Fabrico</div>
                    </li>
                    <li>
                        <div onClick={() => navigate('/notexists')}>Not Found</div>
                    </li>
                </ul>
            </div>
            <Outlet />
        </div>
    );

}