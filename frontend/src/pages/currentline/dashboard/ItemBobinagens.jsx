import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import moment from 'moment';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL, DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from "config";
import { useModal } from "react-modal-hook";
import { getSchema } from "utils/schemaValidator";
import { useSubmitting, noValue } from "utils";
import { useDataAPI } from "utils/useDataAPI";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space, Form } from "antd";
const { Option } = Select;
import { EditOutlined, HistoryOutlined,AppstoreAddOutlined  } from '@ant-design/icons';
import { BiWindowOpen } from 'react-icons/bi';
import ResponsiveModal from 'components/Modal';
import loadInit from "utils/loadInit";
/* const FormCortes = React.lazy(() => import('../FormCortes')); */
import Table from 'components/TableV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';

const title = "Bobinagens";
const useStyles = createUseStyles({});
const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}
const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
{/*         <Col xs='content'><Field wrapFormItem={true} name="lote" label={{ enabled: true, text: "Lote" }}><Input width={250} size="small" /></Field></Col>
        <Col xs='content'><Field wrapFormItem={true} name="source" label={{ enabled: true, text: "Origem" }}><Input width={100} size="small" /></Field></Col>
        <Col xs='content'><Field wrapFormItem={true} name="timestamp" label={{ enabled: true, text: "Data" }}><Input width={150} size="small" /></Field></Col> */}
    </>
    );
}

const SelectBobinagens = ({ onView, onChangeContent, dataAPI }) => {
    return (
        <Space>
            <Select defaultValue={noValue(dataAPI.getFilter(true)?.valid,"0")} style={{ width: 200 }} onChange={(v) => onChangeContent(v, "valid")} dropdownMatchSelectWidth={false} disabled={dataAPI.isLoading()}>
                <Option value="0">Por validar</Option>
                <Option value="1">Validadas</Option>
                <Option value="-1"> </Option>
            </Select>
            <Select defaultValue={noValue(dataAPI.getFilter(true)?.type,"1")} style={{ width: 200 }} onChange={(v) => onChangeContent(v, "type")} dropdownMatchSelectWidth={false} disabled={dataAPI.isLoading()}>
                <Option value="1">Bobinagens da Ordem de Fabrico</Option>
                <Option value="-1">Todas as Bobinagens</Option>
            </Select>
            <Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} disabled={dataAPI.isLoading()} />
        </Space>
    );
}


export default ({ record, card, parentReload }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id:"dashb-bobinagens", payload: { url: `${API_URL}/validarbobinagenslist/`, parameters: {}, pagination: { enabled: false, limit: 20 }, filter: { agg_of_id: record.agg_of_id, valid: "0", type: "1" }, sort: [{ column: 'nome', direction: 'ASC' }] } });
    const primaryKeys = ['id'];
    const columns = [
        { key: 'nome', name: 'Bobinagem', width:115,frozen: true, formatter:p=><Button size="small" type="link" onClick={()=>onBobinagemClick(p.row)}>{p.row.nome}</Button> },
        { key: 'inico', name: 'Início', width:90 },
        { key: 'fim', name: 'Fim', width:90 },
        { key: 'duracao', name: 'Duração', width:90 },
        { key: 'core', name: 'Core', width:90 },
        { key: 'comp', name: 'Comprimento', width:100 },
        { key: 'comp_par', name: 'Comp. Emenda', width:100 },
        { key: 'comp_cli', name: 'Comp. Cliente', width:100 },
        { key: 'area', name: 'Área', width:90 },
        { key: 'diam', name: 'Diâmetro', width:100 },
        { key: 'nwinf', name: 'Nw Inf. m', width:100 },
        { key: 'nwsup', name: 'Nw Sup. m', width:100 }
    ];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
        <ResponsiveModal footer="ref" onCancel={hideModal} width={800} height={400}>
            {/* <FormCortes forInput={modalParameters.forInput} record={modalParameters} parentReload={parentReload} /> */}
        </ResponsiveModal>
    ), [modalParameters]);

    const onBobinagemClick = (row)=>{
        if (row?.valid===1){
            window.location.href=`/producao/bobinagem/${row.id}/`;
        }else{
            navigate("/app/bobines/validarlist", { state: { title: `Validar e Classificar Bobinagem ${row.nome}`, bobinagem_id: row.id, bobinagem_nome: row.nome, tstamp: Date.now() } });
        }
    }
    const onFilterFinish = (type, values) => { console.log("vvvv", values) };
    const onFilterChange = (value, changedValues) => { console.log("aaaa", value, changedValues) };

    const onView = () => {
        navigate("/app/validateReellings", { state: { ...dataAPI.getFilter(true), agg_of_id: record.agg_of_id, ofs: record.ofs.map(v => v.of_cod), tstamp: Date.now() } });
    }

    const onChangeContent = async (v, field) => {
        dataAPI.addFilters({ ...dataAPI.getFilter(true), [field]: v });
        dataAPI.fetchPost();
    }

    return (
        <>
            {Object.keys(record).length > 0 && <Card
                hoverable
                style={{ height: "100%" }} bodyStyle={{ height: "calc(100% - 45px)" }}
                size="small"
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{card.title}</div>}
                extra={<SelectBobinagens onChangeContent={onChangeContent} onView={onView} dataAPI={dataAPI} />}
            >
                <YScroll>
                    <Table
                        //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
                        reportTitle={title}
                        loadOnInit={true}
                        columns={columns}
                        dataAPI={dataAPI}
                        //actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} />}
                        toolbar={false}
                        search={false}
                        moreFilters={false}
                        rowSelection={false}
                        primaryKeys={primaryKeys}
                        editable={false}
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
            </Card>
            }
        </>
    );
}
