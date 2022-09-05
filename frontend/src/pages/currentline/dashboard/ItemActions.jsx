import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL, ROOT_URL } from "config";
import { useModal } from "react-modal-hook";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space } from "antd";
const { Panel } = Collapse;
import { EditOutlined, HistoryOutlined } from '@ant-design/icons';

import ResponsiveModal from 'components/Modal';
import MainMenu from './MainMenu';
/* const FormCortes = React.lazy(() => import('../FormCortes')); */


/* const StyledCollapse = styled(Collapse)`
    .ant-collapse-content-box{
        padding:0px 0px !important;
        display:flex;
        flex-direction:column;
        align-items:start;
    }
    .ant-collapse-header{
        padding:0px 0px !important;
    }
`

const getLocalStorage = (id) => {
    if (id) {
        const selItems = JSON.parse(localStorage.getItem(id));
        return (selItems) ? selItems : ['1'];
    }
    return ['1'];
}
const idMenu="dashb-menu-01";
const selectedItems=getLocalStorage(idMenu); */

export default ({ record, card, parentReload }) => {
    /*     const navigate = useNavigate();
        const [modalParameters, setModalParameters] = useState({});
        const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
            <ResponsiveModal footer="ref" onCancel={hideModal} width={800} height={400}>
                <div></div>
            </ResponsiveModal>
        ), [modalParameters]);
        const onEdit = () => {
            setModalParameters({ ...record });
            showModal();
        }
    
        const onMenuChange = (v)=>{
            localStorage.setItem(idMenu, JSON.stringify(v));
        } */
       
    return (
        <>
            {Object.keys(record).length > 0 && <Card
                hoverable
                headStyle={{background: "#2a3142",padding:"0px 32px 0px 12px"}}
                /* onClick={onEdit} */
                style={{ height: "100%", background:"#2a3142" }}
                bodyStyle={{ height: "calc(100% - 45px)", background: "#2a3142" }}
                size="small"
                title={<div style={{ fontWeight: 700, fontSize: "16px", color:"#fff" }}>{card.title}</div>}
            >
                <YScroll>
                    <MainMenu />
                </YScroll>
            </Card>
            }
        </>
    );
}
