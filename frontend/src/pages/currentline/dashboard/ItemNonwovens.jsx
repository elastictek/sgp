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
const FormFormulacao = React.lazy(() => import('./FormFormulacaoUpsert'));
const FormFormulacaoDosers = React.lazy(() => import('./FormFormulacaoDosers'));
import Table from 'components/TableV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';
import TitleCard from './TitleCard';
import { Cuba } from "./commons/Cuba";
import { usePermission } from "utils/usePermission";

const title = "Formulação";
const useStyles = createUseStyles({});
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [form] = Form.useForm();
    const permission = usePermission({ allowed: { producao: 200, planeamento: 200 } });
    const [fieldStatus, setFieldStatus] = useState({});
    const [forInput, setFormInput] = useState(false);
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);

    useEffect(() => {
        console.log("Entrei nos nonwovens---", record)
        if (record?.nonwovens) {
            console.log("aaaaaaaaaaaaaaa")
        }
    }, [record?.nonwovens]);

    const onEdit = (type) => {
        switch (type) {
            default: break;
        }
    }

    const ofClosed = () => {
        if (record?.status === 9 || !record?.status) {
            return true;
        } else {
            return false;
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
                extra={<>{Object.keys(record).length > 0 && <Space><Button disabled={!permission.allow(null, [!ofClosed()])} onClick={() => onEdit("nonwovens")} icon={<EditOutlined />} /></Space>}</>}
            >
                {Object.keys(record).length > 0 &&
                    <FormContainer id="FRM-NONWOVENS" loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} style={{ marginTop: "5px" }} schema={schema} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }} forInput={forInput}>

                    </FormContainer>
                }
            </Card>
        </>
    );
}
