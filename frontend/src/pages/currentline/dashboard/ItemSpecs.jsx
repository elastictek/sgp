import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import moment from 'moment';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL, DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS } from "config";
import { useModal } from "react-modal-hook";
import { getSchema } from "utils/schemaValidator";
import { useSubmitting, noValue } from "utils";
import { useDataAPI } from "utils/useDataAPI";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space, Form } from "antd";
const { Option } = Select;
import { EditOutlined, HistoryOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { BiWindowOpen } from 'react-icons/bi';
import ResponsiveModal from 'components/Modal';
import loadInit from "utils/loadInit";
const FormSpecs = React.lazy(() => import('../FormSpecsUpsert'));
import Table from 'components/TableV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';
import TitleCard from './TitleCard';

const title = "Especificações";
const useStyles = createUseStyles({});
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [artigoSpecs, setArtigoSpecs] = useState();

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal lazy={true} footer="ref" onCancel={hideModal} width={1100} height={700}>
            <FormSpecs forInput={modalParameters.forInput} record={{ ...modalParameters.record }} parentReload={parentReload} />
        </ResponsiveModal>
    ), [modalParameters]);


    useEffect(() => {
        if (record?.artigospecs) {
            setArtigoSpecs(record.artigospecs)
        }
    }, [record.artigospecs]);

    const onEdit = (type) => {
        switch (type) {
            default:
                setModalParameters({ forInput: true, record: { id: record.id, artigospecs: artigoSpecs } });
                showModal();
                break;
        }
    }

    return (
        <>
            <Card
                hoverable
                headStyle={{ padding: "0px 32px 0px 12px" }}
                style={{ height: "100%", border: "1px solid #8c8c8c" }}
                bodyStyle={{ height: "calc(100% - 61px)" }}
                size="small"
                title={<TitleCard data={record} title={card.title} />}
                extra={<>{Object.keys(record).length > 0 && <Space><Button onClick={() => onEdit()} icon={<EditOutlined />} /></Space>}</>}
            >
                {Object.keys(record).length > 0 &&
                    <YScroll>
                        {artigoSpecs && <FormSpecs record={{ id: record.id, artigospecs: artigoSpecs }} forInput={false} />}
                    </YScroll>
                }
            </Card>
        </>
    );
}
