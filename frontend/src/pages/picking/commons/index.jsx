import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues, getFilterValue, isValue } from 'utils';

import FormManager, { FieldLabel, FieldSet as OldFieldSet, FilterTags, AutoCompleteField as OldAutoCompleteField, useMessages, DropDown } from "components/form";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, InputAddon, SelectField, TitleForm, WrapperForm, SelectDebounceField, AutoCompleteField, RangeDateField, RangeTimeField, FilterDrawer, CheckboxField, SwitchField } from "components/formLayout";
import Drawer from "components/Drawer";
import Table, { setColumns } from "components/table";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import ResponsiveModal from "components/ResponsiveModal";
import MoreFilters from 'assets/morefilters.svg';
import YScroll from "components/YScroll";
import { GoArrowUp } from 'react-icons/go';
import { ImArrowUp, ImArrowDown, ImArrowRight, ImArrowLeft } from 'react-icons/im';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge } from "antd";
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, BOBINE_DEFEITOS, API_URL, GTIN, SCREENSIZE_OPTIMIZED, RECICLADO_ARTIGO } from 'config';





const StyledStatus = styled.div`
    border:dashed 1px #000;
    background-color:${props => props.color};
    color:${props => props.fontColor};
    border-radius:3px;
    margin-right:1px;
    text-align:center;
    width:35px;
    height:22px;
    display:flex;
    align-items:center;
    justify-content:center;
    line-height:12px;
    font-size:8px;
    cursor:pointer;
    &:hover {
        border-color: #d9d9d9;
    }
    .lar{
        font-size:9px;
    }
`;

export const bColors = (estado) => {
    if (estado === "G") {
        return { color: "#237804", fontColor: "#fff" };//"green";
    } else if (estado === "R") {
        return { color: "#ff1100", fontColor: "#fff" };//"red";
    } else {
        return { color: "#fff", fontColor: "#000" };
    }
}

export const Status = ({ estado }) => {
    return (
        <StyledStatus color={bColors(estado).color} fontColor={bColors(estado).fontColor}><b>{estado}</b></StyledStatus>
    );
}

export const PosColumn = ({ value }) => {
    return (<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {value === 1 ? <ImArrowUp /> : <ImArrowDown />}
        <div style={{ marginRight: "5px" }}>{value === 1 ? "SUP" : "INF"}</div>
    </div>);
}
export const MovColumn = ({ value }) => {
    return (<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {value === 1 ? <ImArrowRight color='green' /> : <ImArrowLeft color="red" />}
        <div style={{ marginRight: "5px" }}>{value === 1 ? "Entrada" : "Saída"}</div>
    </div>);
}

export const MovGranuladoColumn = ({ value }) => {
    return (<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {value === 1 ? <ImArrowRight color='green' /> : <ImArrowLeft color="red" />}
        <div style={{ marginRight: "5px" }}>{value === 1 ? "Entrada" : "Saída"}</div>
    </div>);
}

export const MovNwColumn = ({ value }) => {
    return (<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            {value===0 && <><ImArrowLeft color='red' /><span style={{marginRight:"5px"}}>S</span></>}<ImArrowRight color='green' /><span>E</span>
    </div>);
}

export const QueueNwColumn = ({ value, status, style={} }) => {

    const getValue = () => {
        if (status === 0) {
            return <div />;
        }
        switch (value) {
            case 1: return <Tag style={{ width: "100%", color:"#000", ...style }} color="#87d068">Em uso</Tag>;
            case 2: return <Tag style={{ width: "100%",color:"#000", ...style }} color="#fff566">Em espera</Tag>
            default: return <Tag style={{ width: "100%",color:"#000", ...style }} color="#2db7f5">Em preparação</Tag>
        }
    }

    return (<>{getValue(value)}</>);
}

export const FormPrint = ({ v, parentRef, closeParent }) => {
    const [values, setValues] = useState({ impressora: v?.old ? "ARMAZEM_CAB_SQUIX_6.3_200" : "CAB_SQUIX_6.3_200", num_copias: 4 })
    const onClick = async () => {
        if (v?.old === true) {
            const response = await fetchPost({ url: `${API_URL}/printetiqueta/`, parameters: { type: "reciclado", reciclado: { ...v.reciclado, timestamp: dayjs(v.reciclado.timestamp).format(DATETIME_FORMAT) }, ...values } });
            if (response.data.status !== "error") {
                closeParent();
            } else {
                Modal.error({ title: response.data.title })
            }
        } else {
            const data = {
                ...values,
                artigo_cod:RECICLADO_ARTIGO.cod,
                artigo_des:RECICLADO_ARTIGO.des,
                produto:v.reciclado.produto_granulado,
                tara:v.reciclado.tara,
                unit:"KG",
                qty:v.reciclado.peso,
                inicio:dayjs(v.reciclado.timestamp).format(DATETIME_FORMAT),
                fim:dayjs(v.reciclado.timestamp_edit).format(DATETIME_FORMAT),
                n_lote:v.reciclado.lote
            };
            const response = await fetchPost({ url: `${API_URL}/printreciclado/`, parameters: { ...data } });
            if (response.data.status !== "error") {
                Modal.confirm({ title: 'Etiqueta Impressa', content: <div><b>{RECICLADO_ARTIGO.des}</b>  {v.lote}</div> });
                closeParent();
            } else {
                Modal.error({ title: 'Erro ao Imprimir Etiqueta', content: response.data.title });
            }

        }

    }

    const onChange = (t, v) => {
        setValues(prev => ({ ...prev, [t]: v }));
    }

    return (<>
        {v?.old === true && <Container>
            <Row>
                <Col><b>Cópias:</b></Col>
            </Row>
            <Row>
                <Col><InputNumber onChange={(v) => onChange("num_copias", v)} min={1} max={4} defaultValue={values.num_copias} /></Col>
            </Row>
            <Row>
                <Col><b>Impressora:</b></Col>
            </Row>
            <Row>
                <Col><Select onChange={(v) => onChange("impressora", v)} defaultValue={values.impressora} style={{ width: "100%" }} options={[{ value:'ARMAZEM_CAB_SQUIX_6.3_200', label: 'ARMAZÉM' }]} /></Col>
            </Row>
            <Row style={{ marginTop: "15px" }}>
                <Col style={{ textAlign: "right" }}>
                    <Space>
                        <Button onClick={closeParent}>Cancelar</Button>
                        <Button type="primary" onClick={onClick}>Imprimir</Button>
                    </Space>
                </Col>
            </Row>
        </Container>
        }
        {!v?.old && <Container>
            <Row>
                <Col><b>Cópias:</b></Col>
            </Row>
            <Row>
                <Col><InputNumber onChange={(v) => onChange("num_copias", v)} min={1} max={4} defaultValue={values.num_copias} /></Col>
            </Row>
            <Row>
                <Col><b>Impressora:</b></Col>
            </Row>
            <Row>
                <Col><Select onChange={(v) => onChange("impressora", v)} defaultValue={values.impressora} style={{ width: "100%" }} options={[{ value: 'CAB_SQUIX_6.3_200', label: 'ARMAZÉM' }]} /></Col>
            </Row>
            <Row style={{ marginTop: "15px" }}>
                <Col style={{ textAlign: "right" }}>
                    <Space>
                        <Button onClick={closeParent}>Cancelar</Button>
                        <Button type="primary" onClick={onClick}>Imprimir</Button>
                    </Space>
                </Col>
            </Row>
        </Container>}
    </>);
}