import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { useModal } from "react-modal-hook";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space } from "antd";
import { EditOutlined, HistoryOutlined } from '@ant-design/icons';

import ResponsiveModal from 'components/Modal';
const FormCortes = React.lazy(() => import('../FormCortes'));


export default ({ record, card, parentReload }) => {
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal footer="ref" onCancel={hideModal} width={800} height={400}>
            <FormCortes forInput={modalParameters.forInput} record={modalParameters} parentReload={parentReload} />
        </ResponsiveModal>
    ), [modalParameters]);

    const onEdit = () => {
        setModalParameters({ ...record });
        showModal();
    }

    return (
        <>
            {Object.keys(record).length > 0 && <Card
                hoverable
                /* onClick={onEdit} */
                style={{ height: "100%" }} bodyStyle={{ height: "calc(100% - 45px)" }}
                size="small"
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{card.title}</div>}
                extra={<Space><Button onClick={onEdit} icon={<EditOutlined />} /></Space>}
            >
                <YScroll>
                    <FormCortes record={record} forInput={false} />
                </YScroll>
            </Card>
            }
        </>
    );
}
