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
import { Cuba } from "./commons/Cuba";
import {transformFormulacaoDataList} from "./commons";
import { GiArrowWings } from 'react-icons/gi';

const title = "Alterar Doseadores";
const useStyles = createUseStyles({
    extrusora: {
        outline: "none !important",
        background: "#f0f0f0"
    },
});
const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const primaryKeys = [];

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

const columns = (onChange, forInput) => [
    {
        key: `cuba`, sortable: false, name: `Cuba`, minWidth: 65, width: 65, formatter: p => <>{p.row.id < 0 ? <ExtrusoraTitle id={p.row.id} /> : <Cuba value={p.row.cuba} />}</>,
        ...((forInput) && { editor: p => <>{p.row.id !== -1 ? <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.cuba} ref={(el, h,) => { el?.focus(); }} onChange={(v) => onChange(`cuba`, v, p)} size="small" data={FORMULACAO_CUBAS} keyField="key" textField="value" /> : <ExtrusoraTitle id={p.row.id} />}</> }),
        editorOptions: { editOnClick: true }, colSpan(args) { if (args.type === "ROW" && args.row.id < 0) { return 8; }; return undefined; }
    },
    {
        key: 'doseador', sortable: false, name: `Doseador`, minWidth: 80, width: 80, formatter: p => <div style={{ textAlign: "center", fontSize: "14px" }}><b>{p.row.doseador}</b></div>,
        ...((forInput) && { editor: p => <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.doseador} ref={(el, h,) => { el?.focus(); }} onChange={(v) => onChange('doseador', v, p)} size="small" data={FORMULACAO_MANGUEIRAS[p.row.extrusora]} keyField="key" textField="key" /> }),
        editorOptions: { editOnClick: true }
    },
    // ...extrusora === "BC" ? [
    //     {
    //         key: 'doseador_B', sortable: false, name: `Doseador`, minWidth: 40, width: 40, formatter: p => <div style={{ textAlign: "center", fontSize: "14px" }}><b>{p.row.doseador_B}</b></div>,
    //         ...((forInput) && { editor: p => <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.doseador_B} ref={(el, h,) => { el?.focus(); }} onChange={(v) => onChange('doseador_B', v, p)} size="small" data={FORMULACAO_MANGUEIRAS["B"]} keyField="key" textField="key" /> }),
    //         editorOptions: { editOnClick: true },
    //         colSpan(args) { if (args.type === 'HEADER') { return 2; } return undefined; }
    //     },
    //     {
    //         key: 'doseador_C', sortable: false, name: ``, minWidth: 40, width: 40, formatter: p => <div style={{ textAlign: "center", fontSize: "14px" }}><b>{p.row.doseador_C}</b></div>,
    //         ...((forInput) && { editor: p => <SelectField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={p.row.doseador_C} ref={(el, h,) => { el?.focus(); }} onChange={(v) => onChange('doseador_C', v, p)} size="small" data={FORMULACAO_MANGUEIRAS["C"]} keyField="key" textField="key" /> }),
    //         editorOptions: { editOnClick: true }
    //     }
    // ] : [],
    { key: 'matprima_des', sortable: false, name: `Matéria Prima`, formatter: p => p.row.matprima_des },
    { key: 'densidade', sortable: false, name: 'Densidade', width: 80, formatter: p => <div style={{ textAlign: "right" }}>{p.row.densidade}</div> },
    { key: 'arranque', sortable: false, name: 'Arranque', width: 80, formatter: p => <div style={{ textAlign: "right" }}>{p.row.arranque} %</div> },
    { key: 'tolerancia', sortable: false, name: 'Tolerância', width: 80, formatter: p => <div style={{ textAlign: "right" }}>{p.row.tolerancia} %</div> },
    { key: 'vglobal', sortable: false, name: '% Global', width: 80, formatter: p => <div style={{ textAlign: "right" }}>{p.row.vglobal} %</div> }
];


export default ({ record, card, parentReload, setFormTitle, parentRef, closeParent, forInput = true }) => {
    const navigate = useNavigate();
    const [isTouched, setIsTouched] = useState(false);
    const classes = useStyles();
    const [formFilter] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);
    const dataAPI = useDataAPI({ id: "dashb-formulacao", payload: { parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [] } });

    useEffect(() => {
        submitting.trigger();
        (setFormTitle) && setFormTitle({ title });
        console.log(record)
        dataAPI.setData({ rows: transformFormulacaoDataList(record.formulacao) }, { tstamp: Date.now() });
        submitting.end();
    }, [record.formulacao]);

    const rowKeyGetter = (row) => {
        if (row.id < 0) {
            return `e-${row.id}`;
        }
        return `${row.extrusora}-${row.doseador}-${row.matprima_cod}`;
    }

    const onChange = (field, v, p) => {
        if (field === 'cuba') {
            let rows = dataAPI.getData().rows;
            rows = rows.map(x => {
                if (p.row.extrusora === "A" && x.matprima_cod === p.row.matprima_cod) {
                    return { ...x, cuba: v };
                } else if (p.row.extrusora === "B" && x.matprima_cod === p.row.matprima_cod) {
                    if (x.extrusora !== "A") {
                        return { ...x, cuba: v };
                    }
                } else if (p.row.extrusora === "C" && x.matprima_cod === p.row.matprima_cod) {
                    if (x.extrusora === "C") {
                        return { ...x, cuba: v };
                    }
                }
                return x;
            });
            dataAPI.setData({ rows }, { tstamp: Date.now() });
        } else if (field === 'doseador') {
            if (p.row.extrusora === "A") {
                p.onRowChange({ ...p.row, [field]: v }, true);
            } else if (p.row.extrusora === "B") {
                let rows = dataAPI.getData().rows;
                rows = rows.map(x => {
                    if (x.extrusora == "C" && x.matprima_cod === p.row.matprima_cod && (x?.doseador===undefined || x.doseador===p.row.doseador.replace('B', 'C'))) {
                        return { ...x, "doseador": v.replace('B', 'C') };
                    }else if (p.row.cuba === x.cuba && p.row.doseador === x.doseador && x.matprima_cod === p.row.matprima_cod) {
                        return { ...x, "doseador": v };
                    }
                    return x;
                });
                dataAPI.setData({ rows }, { tstamp: Date.now() });
            } else if (p.row.extrusora === "C") {
                p.onRowChange({ ...p.row, [field]: v }, true);
            }
        }
        setIsTouched(true);
    }

    const onFinish = async () => {
        submitting.trigger();
        let valid = true;
        const status = { error: [], warning: [], info: [], success: [] };
        const _formulacao = { ...record.formulacao };

        console.log("formulacao....",_formulacao)
        const rows = dataAPI.getData().rows.filter(v=>v.id>=0);
        const formu_materiasprimas_A =[];
        const formu_materiasprimas_B =[];
        const formu_materiasprimas_C =[];
        for (let v of rows){
            if ((!v?.cuba || !v?.doseador) && valid) { valid = false; }
            if (!valid){
                break;
            }
            if (v.extrusora === "A") {
                formu_materiasprimas_A.push({
                    [`arranque`]: v.arranque,
                    [`cuba`]: v.cuba,
                    [`densidade`]: v.densidade,
                    [`doseador`]: v.doseador,
                    [`global`]: v.vglobal,
                    [`matprima_cod`]: v.matprima_cod,
                    [`orig_matprima_cod`]: v.matprima_cod,
                    [`removeCtrl`]: true,
                    [`tolerancia`]: v.tolerancia
                });
            }else if (v.extrusora === "B") {
                formu_materiasprimas_B.push({
                    [`arranque`]: v.arranque,
                    [`cuba`]: v.cuba,
                    [`densidade`]: v.densidade,
                    [`doseador`]: v.doseador,
                    [`global`]: v.vglobal,
                    [`matprima_cod`]: v.matprima_cod,
                    [`orig_matprima_cod`]: v.matprima_cod,
                    [`removeCtrl`]: true,
                    [`tolerancia`]: v.tolerancia
                });
            }else if (v.extrusora === "C") {
                formu_materiasprimas_C.push({
                    [`arranque`]: v.arranque,
                    [`cuba`]: v.cuba,
                    [`densidade`]: v.densidade,
                    [`doseador`]: v.doseador,
                    [`global`]: v.vglobal,
                    [`matprima_cod`]: v.matprima_cod,
                    [`orig_matprima_cod`]: v.matprima_cod,
                    [`removeCtrl`]: true,
                    [`tolerancia`]: v.tolerancia
                });
            } 
        }
        if (!valid) {
            status.error.push({ message: "Os doseadores têm de ser todos definidos!" });
            setFormStatus({ ...status });
        } else {
            try {
                if ("formu_materiasprimas_BC" in _formulacao){
                    delete _formulacao.formu_materiasprimas_BC;
                }
                _formulacao.items = rows;
                _formulacao.formu_materiasprimas_A=formu_materiasprimas_A;
                _formulacao.formu_materiasprimas_B=formu_materiasprimas_B;
                _formulacao.formu_materiasprimas_C=formu_materiasprimas_C;
                const response = await fetchPost({ url: `${API_URL}/updatecurrentsettings/`, filter: { csid: record.id }, parameters: { type: `formulacao_${record.feature}`, formulacao: { ..._formulacao, valid: 1 } } });
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
        let rows = dataAPI.getData().rows;
        rows = rows.map(x => {
            if (x.id<0){return x;}
            let vat = FORMULACAO_CUBAS[vatPos].key;
            if (x.matprima_cod in _aux) {
                vat = _aux[x.matprima_cod];
            } else {
                _aux[x.matprima_cod] = vat;
                vatPos++;
            }
            return { ...x, cuba: vat };
        });
        dataAPI.setData({ rows }, { tstamp: Date.now() });
        setIsTouched(true);
    }

    return (
        <FormContainer id="f-dosers" wrapForm={false} wrapFormItem={false} loading={submitting.state}>
            <AlertsContainer /* id="el-external" */ mask fieldStatus={fieldStatus} formStatus={formStatus} portal={false} />
            {forInput && <Container style={{ marginBottom: "5px", marginTop: "5px" }}>
                <Row style={{ border: "solid 1px #dee2e6", background: "#f8f9fa", padding: "5px" }}>
                    <Col>
                        <Button size="small" onClick={assignVats}>Atribuir Cubas</Button>
                    </Col>
                    <Col>

                    </Col>
                </Row>
            </Container>
            }

            <Table
                //title={!setFormTitle && <Title style={{ marginBottom: "0px" }} level={4}>{title}</Title>}
                rowStyle={`font-size:12px;`}
                //headerStyle={`background-color:#f0f0f0;font-size:10px;`}
                reportTitle={title}
                loadOnInit={false}
                columns={columns(onChange, forInput)}
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
