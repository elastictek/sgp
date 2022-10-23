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
import { transformFormulacaoDataList } from "./commons";
import { usePermission } from "utils/usePermission";

const title = "Formulação";
const useStyles = createUseStyles({
    extrusora: {
        outline: "none !important",
        background: "#f0f0f0"
    }
});
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const primaryKeys = [];
const cubaValue = (v) => {
    if (v) {
        return FORMULACAO_CUBAS.find(x => x.key === v)?.value;
    }
    return null;
}

const columns = () => [
    {key: `cuba`, sortable: false, name: `Cuba`, minWidth: 65, width: 65, formatter: p => <>{p.row.id < 0 ? <ExtrusoraTitle id={p.row.id} /> : <Cuba value={p.row.cuba} />}</>,
        colSpan(args) { if (args.type === "ROW" && args.row.id < 0) { return 8; }; return undefined; }},
    {key: 'doseador', sortable: false, name: `Doseador`, minWidth: 80, width: 80, formatter: p => <div style={{ textAlign: "center", fontSize: "14px" }}><b>{p.row.doseador}</b></div>},
    { key: 'matprima_des', sortable: false, name: `Matéria Prima`, formatter: p => p.row.matprima_des },
    { key: 'densidade', sortable: false, name: 'Densidade', width: 80, formatter: p => <div style={{ textAlign: "right" }}>{p.row.densidade}</div> },
    { key: 'arranque', sortable: false, name: 'Arranque', width: 80, formatter: p => <div style={{ textAlign: "right" }}>{p.row.arranque} %</div> },
    { key: 'tolerancia', sortable: false, name: 'Tolerância', width: 80, formatter: p => <div style={{ textAlign: "right" }}>{p.row.tolerancia} %</div> },
    { key: 'vglobal', sortable: false, name: '% Global', width: 80, formatter: p => <div style={{ textAlign: "right" }}>{p.row.vglobal} %</div> }
];
const ExtrusoraTitle = ({ id }) => {
    const getExtrusora = () => {
        switch (id) {
            case -1: return "A";
            case -2: return "B";
            case -3: return "C";
        }
    }
    return (<div style={{ fontWeight: 800, textAlign: "right", marginRight: "20px" }}>Extrusora {getExtrusora()}</div>);
}

export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const permission = usePermission({ allowed: { producao: 200, planeamento: 200 } });
    const dataAPI = useDataAPI({ id: "dashb-formulacao", payload: { parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [] } });

    const [modalParameters, setModalParameters] = useState({});
    const [showFormulacaoModal, hideFormulacaoModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal type="drawer" lazy={true} footer="ref" onCancel={hideFormulacaoModal} width={1000}>
            <FormFormulacao forInput={modalParameters.forInput} record={{ ...record, ...modalParameters }} parentReload={parentReload} />
        </ResponsiveModal>
    ), [modalParameters]);
    const [showFormulacaoDosersModal, hideFormulacaoDosersModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal type="drawer" lazy={true} footer="ref" onCancel={hideFormulacaoDosersModal}>
            <FormFormulacaoDosers forInput={modalParameters.forInput} record={{ ...record, ...modalParameters }} parentReload={parentReload} />
        </ResponsiveModal>
    ), [modalParameters]);

    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };

    useEffect(() => {
        if (record?.formulacao) {
            dataAPI.setData({ rows: transformFormulacaoDataList(record.formulacao) }, { tstamp: Date.now() });
        }
    }, [record.formulacao]);

    const rowKeyGetter = (row) => {
        if (row.id < 0) {
            return `e-${row.id}`;
        }
        return `${row.extrusora}-${row.matprima_cod}`;
    }

    const onEdit = (type) => {
        switch (type) {
            case "formulacao":
                setModalParameters({ forInput: !ofClosed(), feature: "formulation_change" });
                showFormulacaoModal();
                break;
            case "doseadores":
                setModalParameters({ forInput: !ofClosed(), feature: "dosers_change" });
                showFormulacaoDosersModal();
                break;
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
                extra={<>{Object.keys(record).length > 0 && <Space><Button disabled={!permission.allow(null, [!ofClosed()])} onClick={() => onEdit("doseadores")}>Doseadores</Button><Button disabled={!permission.allow(null)} onClick={() => onEdit("formulacao")} icon={<EditOutlined />} /></Space>}</>}
            >
                {Object.keys(record).length > 0 &&
                    <YScroll>
                        <Table
                            //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
                            rowStyle={`font-size:12px;`}
                            //headerStyle={`background-color:#f0f0f0;font-size:10px;`}
                            reportTitle={title}
                            loadOnInit={false}
                            columns={columns()}
                            dataAPI={dataAPI}
                            //actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                            toolbar={false}
                            search={false}
                            moreFilters={false}
                            rowSelection={false}
                            rowClass={(row) => (row?.id < 0 ? classes.extrusora : undefined)}
                            //primaryKeys={primaryKeys}
                            editable={false}
                            rowKeyGetter={rowKeyGetter}
                        />
                    </YScroll>
                }
            </Card>
        </>
    );
}
