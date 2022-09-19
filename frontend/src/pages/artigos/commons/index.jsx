
import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { Button, Select, Typography, Card, Collapse, Space, Form, Tag, Modal } from "antd";
import { API_URL, DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from "config";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { EditOutlined, HistoryOutlined, AppstoreAddOutlined, MoreOutlined, PrinterOutlined } from '@ant-design/icons';



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
    return (<>{record.LOC_0==="BUFFER" && <Button onClick={onClick ? onClick : onPrintClick} icon={<PrinterOutlined />}></Button>}</>);
}