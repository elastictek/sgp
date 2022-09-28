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
import {Cuba} from "./commons/Cuba";
import { usePermission } from "utils/usePermission";

const title = "Formulação";
const useStyles = createUseStyles({});
const schema = (options={}) => {
    return getSchema({}, options).unknown(true);
}

const primaryKeys = [];
const cubaValue = (v) => {
    if (v) {
        return FORMULACAO_CUBAS.find(x => x.key === v)?.value;
    }
    return null;
}
const columns = (extrusora) => [
    { key: `cuba_${extrusora}`, sortable: false, name: ``, frozen: true, minWidth: 45, width: 45, formatter: p => <Cuba value={p.row[`cuba_${extrusora}`]} /> },
    ...extrusora === "A" ? [{ key: 'doseador_A', sortable: false, name: ``, frozen: true, minWidth: 60, width: 60, formatter: p => <div style={{ textAlign: "center", fontSize: "14px" }}><b>{p.row.doseador_A}</b></div> }] : [],
    ...extrusora === "BC" ? [
        { key: 'doseador_B', sortable: false, name: ``, frozen: true, minWidth: 30, width: 30, colSpan(args) { if (args.type === 'HEADER') { return 2; } return undefined; }, formatter: p => <div style={{ textAlign: "center", fontSize: "14px" }}><b>{p.row.doseador_B}</b></div> },
        { key: 'doseador_C', sortable: false, name: ``, frozen: true, minWidth: 30, width: 30, formatter: p => <div style={{ textAlign: "center", fontSize: "14px" }}><b>{p.row.doseador_C}</b></div> }
    ] : [],
    { key: 'matprima_des', sortable: false, name: `Extrusora ${extrusora}`, frozen: true, formatter: p => <b>{p.row.matprima_des}</b> },
    { key: 'densidade', sortable: false, name: 'Densidade', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.densidade}</div> },
    { key: 'arranque', sortable: false, name: 'Arranque', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.arranque} %</div> },
    { key: 'tolerancia', sortable: false, name: 'Tolerância', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.tolerancia} %</div> },
    { key: 'vglobal', sortable: false, name: '% Global', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.vglobal} %</div> }
];

export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const permission = usePermission({ allowed: { producao: 200, planeamento: 200 } });
   
    const dataAPI_A = useDataAPI({ id: "dashb-formulacao-a", payload: { parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [] } });
    const dataAPI_BC = useDataAPI({ id: "dashb-formulacao-bc", payload: { parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [] } });

    const [modalParameters, setModalParameters] = useState({});
    const [showFormulacaoModal, hideFormulacaoModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal lazy={true} footer="ref" onCancel={hideFormulacaoModal} width={1100} height={700}>
            <FormFormulacao forInput={modalParameters.forInput} record={{ ...record, ...modalParameters }} parentReload={parentReload} />
        </ResponsiveModal>
    ), [modalParameters]);
    const [showFormulacaoDosersModal, hideFormulacaoDosersModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal lazy={true} footer="ref" onCancel={hideFormulacaoDosersModal} width={1100} height={550}>
            <FormFormulacaoDosers forInput={modalParameters.forInput} record={{ ...record, ...modalParameters }} parentReload={parentReload} />
        </ResponsiveModal>
    ), [modalParameters]);

    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };

    useEffect(() => {
        console.log("Entrei formulacao---",record)
        if (record?.formulacao){
            dataAPI_A.setData({ rows: record.formulacao.items.filter(v => v.extrusora === "A") }, { tstamp: Date.now() });
            dataAPI_BC.setData({ rows: record.formulacao.items.filter(v => v.extrusora === "BC") }, { tstamp: Date.now() });
        }
    }, [record.formulacao]);

    const rowKeyGetter = (row) => {
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

    const ofClosed = () =>{
        if (record?.status===9 || !record?.status){
            return true;
        }else{
            return false;
        }
    }

    return (
        <>
            <Card
                hoverable
                headStyle={{padding:"0px 32px 0px 12px"}}
                style={{ height: "100%", border:"1px solid #8c8c8c" }} 
                bodyStyle={{ height: "calc(100% - 61px)" }}
                size="small"
                title={<TitleCard data={record} title={card.title} />}
                extra={<>{Object.keys(record).length > 0 && <Space><Button disabled={!permission.allow(null,[!ofClosed()])} onClick={() => onEdit("doseadores")}>Doseadores</Button><Button disabled={!permission.allow(null)} onClick={() => onEdit("formulacao")} icon={<EditOutlined />} /></Space>}</>}
            >
                {Object.keys(record).length > 0 &&
                <YScroll>
                    <Table
                        //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
                        rowStyle={`font-size:10px;`}
                        headerStyle={`background-color:#f0f0f0;font-size:10px;`}
                        reportTitle={title}
                        loadOnInit={false}
                        columns={columns('A')}
                        dataAPI={dataAPI_A}
                        //actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                        toolbar={false}
                        search={false}
                        moreFilters={false}
                        rowSelection={false}
                        //primaryKeys={primaryKeys}
                        editable={false}
                        rowKeyGetter={rowKeyGetter}
                    //rowClass={(row) => (row?.status === 0 ? classes.notValid : undefined)}
                    //selectedRows={selectedRows}
                    //onSelectedRowsChange={setSelectedRows}
                    // leftToolbar={<>
                    //     {/* <Button type='primary' icon={<AppstoreAddOutlined />} onClick={(showNewLoteModal)}>Novo Lote</Button> */}
                    // </>}
                    //content={<PickHolder/>}
                    //paginationPos='top'
                    // toolbarFilters={{ form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange, filters: <ToolbarFilters dataAPI={dataAPI} /> }}
                    />
                    <Table
                        //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
                        rowStyle={`font-size:10px;`}
                        headerStyle={`background-color:#f0f0f0;font-size:10px;`}
                        reportTitle={title}
                        loadOnInit={false}
                        columns={columns('BC')}
                        dataAPI={dataAPI_BC}
                        //actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                        toolbar={false}
                        search={false}
                        moreFilters={false}
                        rowSelection={false}
                        //primaryKeys={primaryKeys}
                        editable={false}
                        rowKeyGetter={rowKeyGetter}
                    //rowClass={(row) => (row?.status === 0 ? classes.notValid : undefined)}
                    //selectedRows={selectedRows}
                    //onSelectedRowsChange={setSelectedRows}
                    // leftToolbar={<>
                    //     {/* <Button type='primary' icon={<AppstoreAddOutlined />} onClick={(showNewLoteModal)}>Novo Lote</Button> */}
                    // </>}
                    //content={<PickHolder/>}
                    //paginationPos='top'
                    // toolbarFilters={{ form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange, filters: <ToolbarFilters dataAPI={dataAPI} /> }}
                    />
                </YScroll>
}
            </Card>
        </>
    );
}
