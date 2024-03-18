import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates, newWindow } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH, ROOT_URL } from "config";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
import { useModal } from "react-modal-hook";
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn } from 'components/TableColumns';
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { useImmer } from "use-immer";
import FormPaletizacao from '../paletes/paletizacao/FormPaletizacao';
import OrdensFabricoChoose from './OrdensFabricoChoose';
import Page from 'components/FormFields/FormsV2';
import { ClienteArtigo, Encomenda, OrdemFabricoStatus } from 'components/TableV4/TableColumnsV4';

//const title = "Nova Palete";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

const steps = [
    {
        title: 'Ordens'
    }, {
        title: 'Esquema de embalamento'
    }
];

export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "ordemfabrico" });
    const [title, setTitle] = useState("Esquema de Embalamento");

    const [state, updateState] = useImmer({
        action: null,
        maxStep: null,
        step: null,
        pos: null,
    });

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        updateState(draft => {
            draft.step = 0;
            draft.maxStep = 0;
        });
        submitting.end();
    }

    const next = (item) => {
        console.log("RRRRR",item)
        updateState(draft => {
            if (state.step === 0) {
                draft.pos = item;
            }
            draft.step = state.step + 1;
            draft.maxStep = (draft.step > draft.maxStep) ? draft.step : draft.maxStep;
        });
    };

    const prev = (v = null) => {
        updateState(draft => {
            draft.step = (v !== null) ? v : draft.step - 1;
        });
    };

    const onStepChange = (value) => {
        if (value == 0) {
            prev(value);
        }
    }

    const onSelectOrdem = (item) => {
        if (Array.isArray(item)) {
            next(item[0]);
        }
    }

    return (
        <Page.Ready ready={permission?.isReady}>
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />
            <Container fluid>
                <Row>
                    <Col>
                        <Row nogutter>
                            {!["delete"].includes(state.action) ?
                                <Col>
                                    <Steps type='inline' current={state.step} items={steps} direction="horizontal" onChange={onStepChange} /* style={{ flexDirection: "row" }} */ />
                                </Col> :
                                <Col></Col>
                            }
                            <Col xs="content">
                                <Space>
                                </Space>
                            </Col>
                        </Row>

                        <Row nogutter>
                            <Col>
                                <Container fluid style={{ borderRadius: "3px", border: "1px dashed #d9d9d9", marginTop: "10px", padding: "5px" }}>
                                    <Row>
                                        <Col>
                                            <YScroll height="80vh">
                                                {(state.step == 0) && <Col>
                                                    <OrdensFabricoChoose permission={permission} allowInElaboration={permission.isOk({ item: "viewInElaboration" })} onClick={onSelectOrdem} /></Col>}
                                                {state.step == 1 && <Col>
                                                    <Row style={{ marginBottom: "10px" }}>
                                                        <Col xs="content"><OrdemFabricoStatus field={{ status: "ofabrico_status", ofId: "ofid" }} params={{ data: state.pos }} /></Col>
                                                        <Col xs="content"><ClienteArtigo field={{ clienteNome: "cliente_nome", artigoCod: "item_cod", artigoDes: "artigo_des" }} params={{ data: state.pos }} /></Col>
                                                        <Col xs="content"><Encomenda field={{ orderCod: "order_cod", prfCod: "prf_cod" }} params={{ data: state.pos }} /></Col>
                                                    </Row>
                                                    <FormPaletizacao permissions={permission.permissions} associate={true} edit={false} header={false} parameters={{ artigo_cod: state.pos?.item_cod, cliente_cod: state.pos?.cliente_cod, ...state.pos.ofabrico_status == 1 ? { id: state.pos.paletizacao_id, draft_id: state.pos.draft_id } : { of_id: state.pos.id, ofabrico_status: state.pos.ofabrico_status } }} />
                                                </Col>}
                                            </YScroll>
                                        </Col>
                                    </Row>
                                </Container>
                            </Col>
                        </Row>
                    </Col >
                </Row >
            </Container >
        </Page.Ready>
    )

}