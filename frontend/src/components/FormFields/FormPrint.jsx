import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { fetchPost, fetchPostBlob } from "utils/fetch";

import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';

import { Space, Typography, Button, Select, Modal, InputNumber, Checkbox, Badge } from "antd";
import { API_URL } from 'config';

export const printersList = {
    CABS: [{ value: 'Bobinadora_CAB_A4_200', label: 'BOBINADORA' }, { value: 'DM12_CAB_A4_200', label: 'DM12' }],
    ADMINISTRATIVO: [{ value: "Canon_iR-ADV_C3720_UFR_II", label: "Canon C3720" }],
    ARMAZEM: [{ value: "PRINTER-ARMAZEM-CANON", label: "Canon Armazém" }],
    SQUIX: [{ value: "cab_SQUIX_6.3_200", label: "SQUIX Armazém" }],
    BUFFER: [{ value: 'PRINTER-BUFFER', label: 'BUFFER' }]
};


export default ({ v, parentRef, closeParent, printers, url, parameters, numCopiasMax = 3, printer = "Bobinadora_CAB_A4_200", numCopias = 1, allowDownload = true,onComplete }) => {
    const [values, setValues] = useState({ impressora: printer, num_copias: numCopias })
    const onClick = async (download) => {
        const response = (download) ? await fetchPostBlob({ url, parameters: { ...parameters, ...values, ...download && { download } } }) : await fetchPost({ url, parameters: { ...parameters, ...values, ...download && { download } } });
        if (response.data.status !== "error") {
            if (onComplete){
                onComplete(response);
            }
            closeParent();
        } else {
            Modal.error({ title: response.data.title });
        }
    }

    const onChange = (t, v) => {
        setValues(prev => ({ ...prev, [t]: v }));
    }

    return (<>
        <Container>
            <Row>
                <Col><b>Cópias:</b></Col>
            </Row>
            <Row>
                <Col><InputNumber onChange={(v) => onChange("num_copias", v)} min={1} max={numCopiasMax} defaultValue={values.num_copias} /></Col>
            </Row>
            <Row>
                <Col><b>Impressora:</b></Col>
            </Row>
            <Row>
                <Col><Select onChange={(v) => onChange("impressora", v)} defaultValue={values.impressora} style={{ width: "100%" }} options={printers} /></Col>
            </Row>
            <Row style={{ marginTop: "15px" }}>
                <Col style={{ textAlign: "right" }}>
                    <Space>
                        <Button onClick={closeParent}>Cancelar</Button>
                        {allowDownload && <Button onClick={() => onClick("download")}>Download</Button>}
                        <Button type="primary" onClick={onClick}>Imprimir</Button>
                    </Space>
                </Col>
            </Row>
        </Container>
    </>);
}