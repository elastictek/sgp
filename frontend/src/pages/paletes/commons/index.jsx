
import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
/* import { Button, Select, Typography, Card, Collapse, Space, Form, Tag, Modal } from "antd"; */
/* import { API_URL, DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from "config";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { EditOutlined, HistoryOutlined, AppstoreAddOutlined, MoreOutlined, PrinterOutlined } from '@ant-design/icons';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import TextArea from 'antd/lib/input/TextArea'; */

import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert } from "antd";
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

import { Bobines } from '../../bobinagens/commons';

export const Largura = ({ id, artigos, nome, onClick }) => {
    return (<>
        {Array.isArray(artigos) && [...new Set(artigos.map(item => item.lar))].map(v => <Tag style={{ fontWeight: 600, cursor: "pointer" }} onClick={() => onClick && onClick("lar", id, nome, { lar: v })} key={`${id}_${v}`}>{v}</Tag>)}
    </>);
}

export const Core = ({ id, artigos, nome, onClick }) => {
    return (<>
        {Array.isArray(artigos) && [...new Set(artigos.map(item => item.core))].map(v => <Tag style={{ fontWeight: 600, cursor: "pointer" }} onClick={() => onClick && onClick("core", id, nome, { core: v })} key={`${id}_${v}`}>{v}''</Tag>)}
    </>);
}

export const EstadoBobines = ({ id, artigos, nome, onClick, align }) => {
    return (<>
        {Array.isArray(artigos) && <Bobines align={align} id={id} onClick={(v) => onClick && onClick("estado", id, nome, v)} b={uniqWith(allPass(map(eqProps)(['lar', 'estado'])))(artigos).map(v => ({ estado: v.estado, lar: v.lar }))} />}
    </>);
}



/* 

export const Quantity = ({ v, u }) => {
    const getUnit = () => {
        switch (u) {
            case "M2": return <span>m<sup>2</sup></span>;
            case "KG": return <span>kg</span>;
            case "UN": return <span>un</span>;
            case "M": return <span>m</span>;
            case "MM": return <span>mm</span>;
            default: return <span>{u}</span>;
        }
    }
    return (<div style={{ textAlign: "right" }}>{v} {getUnit()}</div>);
}

export const ColumnPrint = ({ record, dataAPI, onClick }) => {
    const onPrintClick = async () => {
        const response = await fetchPost({ url: `${API_URL}/printmpbuffer/`, parameters: { ...record } });
        if (response.data.status !== "error") {
            Modal.confirm({ title: 'Etiqueta Impressa', content: <div><b>{record.ITMDES1_0}</b>  {record.LOT_0}</div> });
        } else {
            Modal.error({ title: 'Erro ao Imprimir Etiqueta', content: response.data.title });
        }
    }
    return (<>{(record.LOC_0==="BUFFER" || record.LOC_0==="ARM") && <Button onClick={onClick ? onClick : onPrintClick} icon={<PrinterOutlined />}></Button>}</>);
}

export const FormPrint = ({ v, parentRef, closeParent }) => {
    const [values, setValues] = useState({ impressora: "PRINTER-BUFFER" })
    const onClick = async () => {
        
        const response = await fetchPost({ url: `${API_URL}/printmpbuffer/`, parameters: { ...v.row, ...values } });
        if (response.data.status !== "error") {
            Modal.confirm({ title: 'Etiqueta Impressa', content: <div><b>{v.row.ITMDES1_0}</b>  {v.row.LOT_0}</div> });
            closeParent();
        } else {
            Modal.error({ title: 'Erro ao Imprimir Etiqueta', content: response.data.title });
        }
        
        
        
        // const response = await fetchPost({ url: `${API_URL}/printmpbuffer/`, parameters: { type: "bobinagem", bobinagem: v.bobinagem, ...values } });
        // if (response.data.status !== "error") {
        //     closeParent();
        // }else{
        //     Modal.error({title:response.data.title})
        // }
        
    }

    const onChange = (t, v) => {
        if (v?.target){
            setValues(prev => ({ ...prev, [t]: v.target.value }));
        }
        else{
            setValues(prev => ({ ...prev, [t]: v }));
        }
    }

    return (<>
        <Container>
            <Row>
                <Col><b>Impressora:</b></Col>
            </Row>
            <Row>
                <Col><Select onChange={(v) => onChange("impressora", v)} defaultValue={values.impressora} style={{ width: "100%" }} options={[{ value: 'PRINTER-BUFFER', label: 'BUFFER' }]} /></Col>
            </Row>
            <Row style={{marginTop:"5px"}}>
                <Col><TextArea rows={4} onChange={(v) => onChange("obs", v)} defaultValue={values.obs} style={{ width: "100%" }} /></Col>
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
    </>);
} */