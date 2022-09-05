import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import moment from 'moment';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL, DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_MANGUEIRAS, FORMULACAO_CUBAS } from "config";
import { useModal } from "react-modal-hook";
import { getSchema } from "utils/schemaValidator";
import { useSubmitting, noValue } from "utils";
import { useDataAPI } from "utils/useDataAPI";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space, Form, Modal } from "antd";
const { Option } = Select;
import Portal from "components/portal";
import ResponsiveModal from 'components/Modal';
import Table from 'components/TableV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer } from 'components/FormFields';
import {Cuba} from "./ItemFormulacao";

const title = "Alterar Doseadores";
const useStyles = createUseStyles({});
const schema = (options={}) => {
    return getSchema({}, options).unknown(true);
}

const primaryKeys = [];

const columns = (extrusora, onChange) => [
    {
        key: `cuba_${extrusora}`, sortable: false, name: `Cuba`, frozen: true, minWidth: 65, width: 65, formatter: p => <Cuba value={p.row[`cuba_${extrusora}`]} />,
        editor: p => <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row[`cuba_${extrusora}`]} ref={(el, h,) => { el?.focus(); }} onChange={(v) => onChange(`cuba_${extrusora}`, v, p)} size="small" data={FORMULACAO_CUBAS} keyField="key" textField="value" />,
        editorOptions: { editOnClick: true }
    },
    ...extrusora === "A" ? [{
        key: 'doseador_A', sortable: false, name: `Doseador`, frozen: true, minWidth: 80, width: 80, formatter: p => <div style={{ textAlign: "center", fontSize: "14px" }}><b>{p.row.doseador_A}</b></div>,
        editor: p => <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.doseador_A} ref={(el, h,) => { el?.focus(); }} onChange={(v) => onChange('doseador_A', v, p)} size="small" data={FORMULACAO_MANGUEIRAS["A"]} keyField="key" textField="key" />,
        editorOptions: { editOnClick: true }
    }] : [],
    ...extrusora === "BC" ? [
        {
            key: 'doseador_B', sortable: false, name: `Doseador`, frozen: true, minWidth: 40, width: 40, formatter: p => <div style={{ textAlign: "center", fontSize: "14px" }}><b>{p.row.doseador_B}</b></div>,
            editor: p => <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.doseador_B} ref={(el, h,) => { el?.focus(); }} onChange={(v) => onChange('doseador_B', v, p)} size="small" data={FORMULACAO_MANGUEIRAS["B"]} keyField="key" textField="key" />,
            editorOptions: { editOnClick: true },
            colSpan(args) {if (args.type === 'HEADER') {return 2;}return undefined;}
        },
        {
            key: 'doseador_C', sortable: false, name: ``, frozen: true, minWidth: 40, width: 40, formatter: p => <div style={{ textAlign: "center", fontSize: "14px" }}><b>{p.row.doseador_C}</b></div>,
            editor: p => <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.doseador_C} ref={(el, h,) => { el?.focus(); }} onChange={(v) => onChange('doseador_C', v, p)} size="small" data={FORMULACAO_MANGUEIRAS["C"]} keyField="key" textField="key" />,
            editorOptions: { editOnClick: true }
        }
    ] : [],
    { key: 'matprima_des', sortable: false, name: `Extrusora ${extrusora}`, frozen: true, formatter: p => <b>{p.row.matprima_des}</b> },
    { key: 'densidade', sortable: false, name: 'Densidade', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.densidade}</div> },
    { key: 'arranque', sortable: false, name: 'Arranque', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.arranque} %</div> },
    { key: 'tolerancia', sortable: false, name: 'Tolerância', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.tolerancia} %</div> },
    { key: 'vglobal', sortable: false, name: '% Global', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.vglobal} %</div> }
];

export default ({ record, card, parentReload, setFormTitle, parentRef, closeParent }) => {
    const navigate = useNavigate();
    const [isTouched, setIsTouched] = useState(false);
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);
    const dataAPI_A = useDataAPI({ id: "dashb-formulacao-a", payload: { parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [] } });
    const dataAPI_BC = useDataAPI({ id: "dashb-formulacao-bc", payload: { parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [] } });

    useEffect(() => {
        submitting.trigger();
        (setFormTitle) && setFormTitle({ title });
        dataAPI_A.setData({ rows: record.formulacao.items.filter(v => v.extrusora === "A") }, { tstamp: Date.now() });
        dataAPI_BC.setData({ rows: record.formulacao.items.filter(v => v.extrusora === "BC") }, { tstamp: Date.now() });
        submitting.end();
    }, [record.formulacao]);

    const rowKeyGetter = (row) => {
        return `${row.extrusora}-${row.matprima_cod}`;
    }

    const onChange = (field, v, p) => {
        if (field.startsWith('cuba_')) {
            const rowsA = dataAPI_A.getData().rows;
            const rowsBC = dataAPI_BC.getData().rows;
            dataAPI_A.setData({ rows: rowsA.map(x => (x.matprima_cod === p.row.matprima_cod) ? { ...x, cuba_A: v } : x) }, { tstamp: Date.now() });
            dataAPI_BC.setData({ rows: rowsBC.map(x => (x.matprima_cod === p.row.matprima_cod) ? { ...x, cuba_BC: v } : x) }, { tstamp: Date.now() });
        } else if (field === 'doseador_A') {
            p.onRowChange({ ...p.row, [field]: v }, true);
        } else if (field === 'doseador_B') {
            p.onRowChange({ ...p.row, [field]: v, ...((!p.row['doseador_C']) && { doseador_C: v.replace('B', 'C') }) }, true);
        } else if (field === 'doseador_C') {
            p.onRowChange({ ...p.row, [field]: v, ...((!p.row['doseador_B']) && { doseador_B: v.replace('C', 'B') }) }, true);
        }
        setIsTouched(true);
    }

    const onFinish = async () => {
        submitting.trigger();
        let valid = true;
        const status = { error: [], warning: [], info: [], success: [] };
        const _formulacao = { ...record.formulacao };
        for (let [i, v] of _formulacao.formu_materiasprimas_A.entries()) {
            const d = dataAPI_A.getData().rows.find(x => x.matprima_cod === v.matprima_cod_A);
            if ((!d?.cuba_A || !d?.doseador_A) && valid) { valid = false; }
            _formulacao.formu_materiasprimas_A[i]["cuba_A"] = d?.cuba_A;
            _formulacao.formu_materiasprimas_A[i]["doseador_A"] = d?.doseador_A;
        }
        for (let [i, v] of _formulacao.formu_materiasprimas_BC.entries()) {
            const d = dataAPI_BC.getData().rows.find(x => x.matprima_cod === v.matprima_cod_BC);
            if ((!d?.cuba_BC || !d?.doseador_B || !d?.doseador_C) && valid) { valid = false; }
            _formulacao.formu_materiasprimas_BC[i]["cuba_BC"] = d?.cuba_BC;
            _formulacao.formu_materiasprimas_BC[i]["doseador_B"] = d?.doseador_B;
            _formulacao.formu_materiasprimas_BC[i]["doseador_C"] = d?.doseador_C;
        }
        _formulacao["items"] = [...dataAPI_A.getData().rows,...dataAPI_BC.getData().rows];

        if (!valid) {
            status.error.push({ message: "Os doseadores têm de ser todos definidos!" });
            setFormStatus({ ...status });
        } else {
            try {
                 const response = await fetchPost({ url: `${API_URL}/updatecurrentsettings/`, filter: { csid: record.id }, parameters: { type: `formulacao_${record.feature}`, formulacao: { ..._formulacao, valid:1 } } });
                 if (response.data.status !== "error") {
                     Modal.success({ title: "Doseadores alterados com sucesso!", onOk: () => { parentReload(); closeParent(); } })
                 } else {
                     status.error.push({ message: response.data.title });
                     setFormStatus({ ...status });
                }
            } catch (e) {
                status.error.push({ message: e.message });
                setFormStatus({ ...status });
            }
        }
        submitting.end();
    }


    const assignVats = () => {
        let vatPos = 0;
        const _aux = {};
        const rowsA = dataAPI_A.getData().rows;
        const rowsBC = dataAPI_BC.getData().rows;
        dataAPI_A.setData({
            rows: rowsA.map(x => {
                let vat = FORMULACAO_CUBAS[vatPos].key;
                if (x.matprima_cod in _aux) {
                    vat = _aux[x.matprima_cod];
                } else {
                    _aux[x.matprima_cod] = vat;
                    vatPos++;
                }
                return { ...x, cuba_A: vat };
            })
        }, { tstamp: Date.now() });
        dataAPI_BC.setData({
            rows: rowsBC.map(x => {
                let vat = FORMULACAO_CUBAS[vatPos].key;
                if (x.matprima_cod in _aux) {
                    vat = _aux[x.matprima_cod];
                } else {
                    _aux[x.matprima_cod] = vat;
                    vatPos++;
                }
                return { ...x, cuba_BC: vat };
            })
        }, { tstamp: Date.now() });
        setIsTouched(true);
    }

    return (
        <FormContainer id="f-dosers" wrapForm={false} wrapFormItem={false} loading={submitting.state}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            <Container style={{ marginBottom: "5px", marginTop:"5px" }}>
                <Row style={{ border: "solid 1px #dee2e6", background: "#f8f9fa", padding: "5px" }}>
                    <Col>
                        <Button size="small" onClick={assignVats}>Atribuir Cubas</Button>
                    </Col>
                    <Col>

                    </Col>
                </Row>
            </Container>

            <Table
                //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
                rowStyle={`font-size:12px;`}
                //headerStyle={`background-color:#f0f0f0;font-size:10px;`}
                reportTitle={title}
                loadOnInit={false}
                columns={columns('A', onChange)}
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
                rowStyle={`font-size:12px;`}
                //headerStyle={`background-color:#f0f0f0;font-size:10px;`}
                reportTitle={title}
                loadOnInit={false}
                columns={columns('BC', onChange)}
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
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    {isTouched && <Button disabled={submitting.state} type="primary" onClick={onFinish}>Guardar</Button>}
                    <Button onClick={closeParent}>Fechar</Button>
                </Space>
            </Portal>
            }
        </FormContainer>
    );
}
