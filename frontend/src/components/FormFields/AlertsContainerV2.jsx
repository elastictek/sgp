import React, { useState, useEffect, useContext, createContext, useRef, useMemo, useCallback } from 'react';
import { Alert } from "antd";
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import YScroll from "../YScroll";


export default ({ id, formStatus = {}, style, showErrors = ["props"], showSuccess = [], showWarnings = [], showInfos = [], ...props }) => {
    const { error = [], info = [], warning = [], success = [] } = formStatus?.alerts || {};
    const ref = useRef();

    const getId = useMemo(() => {
        return (id) ? id : "container";
    }, []);

    const _errors = useMemo(() => {
        return error.filter(v => showErrors && showErrors.includes(v.type));
    }, [formStatus?.timestamp]);

    const _success = useMemo(() => {
        return success.filter(v => showSuccess && showSuccess.includes(v.type));
    }, [formStatus?.timestamp]);

    const _warnings = useMemo(() => {
        return warning.filter(v => showWarnings && showWarnings.includes(v.type));
    }, [formStatus?.timestamp]);

    const _infos = useMemo(() => {
        return info.filter(v => showInfos && showInfos.includes(v.type));
    }, [formStatus?.timestamp]);

    const [domReady, setDomReady] = useState(false);
    React.useEffect(() => { setDomReady(true); }, []);

    return (
        <Row style={style}>
            <Col>
                {getId && <div id={getId} ref={ref} {...props}></div>}

                {(_errors.length > 0) && <Alert type="error" message={<YScroll><div style={{ maxHeight: "100px" }}>{
                    _errors.map((v, i) => <div key={`ac.e-${i}`}><span style={{ fontWeight: 700, marginRight: "5px" }}>{v?.label}</span>{v.message}</div>)
                }</div></YScroll>} />}
                {(_warnings.length > 0) && <Alert type="warning" message={<YScroll><div style={{ maxHeight: "100px" }}>{
                    _warnings.map((v, i) => <div key={`ac.w-${i}`}>{v.message}</div>)
                }</div></YScroll>} />}
                {(_infos.length > 0) && <Alert type="info" message={<YScroll><div style={{ maxHeight: "100px" }}>{
                    _infos.map((v, i) => <div key={`ac.i-${i}`}>{v.message}</div>)
                }</div></YScroll>} />}
                {(_success.length > 0) && <Alert type="success" message={<YScroll><div style={{ maxHeight: "100px" }}>{
                    _success.map((v, i) => <div key={`ac.s-${i}`}>{v.message}</div>)
                }</div></YScroll>} />}
            </Col>
        </Row>
    );
}