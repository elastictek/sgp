import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL, DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET,ROOT_URL } from "config";
import { useModal } from "react-modal-hook";
import { getSchema } from "utils/schemaValidator";
import { useSubmitting, noValue } from "utils";
import { useDataAPI } from "utils/useDataAPI";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space, Form, Tag, Drawer } from "antd";
const { Option } = Select;
import { EditOutlined, HistoryOutlined, AppstoreAddOutlined, MoreOutlined } from '@ant-design/icons';
import ResponsiveModal from 'components/Modal';
import Table from 'components/TableV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';
import { Status } from "../../bobines/commons";
import loadInit, { fixRangeDates,newWindow } from "utils/loadInitV3";

const useStyles = createUseStyles({});

const FormBobine = ({ record }) => {

    return (<FormContainer>

    </FormContainer>);

}

export default ({ record }) => {
    const [visible, setVisible] = useState({ drawer: { open: false } });
    const dataAPI = useDataAPI({ id: "pop-bobines-0", payload: { parameters: {}, pagination: { enabled: false, limit: 30 }, filter: {}, sort: [] } });
    const primaryKeys = ['id'];
    const columns = [
        { key: 'nome', name: 'Bobine', width: 150, formatter: p => <Button size="small" type="link" onClick={() => onOpen("drawer", p.row)}>{p.row.nome}</Button> },
        { key: 'posicao_palete', name: 'Pos.', width: 50, formatter: p => <div>{p.row.posicao_palete}</div> },
        { key: 'estado', name: 'Estado',width: 80, formatter: p => <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status b={{ estado: p.row.estado, largura: p.row.lar }} /></div> },
        { key: 'destino', name: 'Destino', formatter: p => <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>{p.row.destino}</div> }
    ];

    useEffect(() => {
        console.log(record)
        dataAPI.setData({ rows: record.bobines }, { tstamp: Date.now() });
    }, []);

    const onOpen = (component, data) => {
        newWindow(`${ROOT_URL}/producao/bobine/details/${data.id}/`, {}, `bobine-${data.nome}`);
        //setVisible(prev => ({ ...prev, [component]: { ...data, title: <div>Bobine <span style={{ fontWeight: 900 }}>{data.nome}</span></div>, open: true } }));
    }

    const onClose = (component) => {
        //setVisible(prev => ({ ...prev, [component]: { open: false } }));
    }

    return (<YScroll>
        {/* <Drawer title={visible.drawer?.title} open={visible.drawer.open} size="large" onClose={() => onClose("drawer")}></Drawer> */}
        <Table
            rowStyle={`font-size:10px;`}
            headerStyle={`background-color:#f0f0f0;font-size:10px;`}
            loadOnInit={false}
            columns={columns}
            dataAPI={dataAPI}
            toolbar={false}
            search={false}
            moreFilters={false}
            rowSelection={false}
            primaryKeys={primaryKeys}
            editable={false}
            rowHeight={28}
        />
    </YScroll>);
}