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
import TitleCard from './TitleCard';

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

    useEffect(() => {
    }, [record?.agg_of_id]);

    return (
        <>
            <Card
                hoverable
                headStyle={{ padding: "0px 32px 0px 12px" }}
                /* onClick={onEdit} */
                style={{ height: "100%", border: "1px solid #8c8c8c" }}
                bodyStyle={{ height: "calc(100% - 61px)" }}
                size="small"
                title={<TitleCard data={record} title={card.title} />}
                extra={<>{Object.keys(record).length > 0 && <Space><Button onClick={onEdit} icon={<EditOutlined />} /></Space>}</>}
            >
                {Object.keys(record).length > 0 &&
                    <YScroll>
                        <FormCortes record={record} forInput={false} />
                    </YScroll>
                }
            </Card>
        </>
    );
}
