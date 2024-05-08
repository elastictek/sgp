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
import FormPaletizacao from '../../paletes/paletizacao/FormPaletizacao';
import OrdensFabricoChoose from '../OrdensFabricoChoose';
import Page from 'components/FormFields/FormsV2';
import { ClienteArtigo, Encomenda, OrdemFabricoStatus } from 'components/TableV4/TableColumnsV4';

//const title = "Nova Palete";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "ordemfabrico" });
    const [title, setTitle] = useState("Ordens de Fabrico");


    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.end();
    }

    const onItemsClick = (item,data) => {
        switch(item){
            case "paletizacao":navigate("/app/picking/ordensfabrico/paletizacao");
        }
    }

    return (
        <Page.Ready ready={permission?.isReady}>
            <TitleForm auth={permission.auth} level={location?.state?.level} loading={submitting.state} title={title} />
            <Container fluid>
                <Row nogutter>
                    <Col>
                        <YScroll height="80vh">
                            <Col><OrdensFabricoChoose onItemsClick={onItemsClick} permission={permission} allowInElaboration={permission.isOk({ item: "viewInElaboration" })} /> </Col>
                            {/* {state.step == 1 && <Col>
                                                    <Row style={{ marginBottom: "10px" }}>
                                                        <Col xs="content"><OrdemFabricoStatus field={{ status: "ofabrico_status", ofId: "ofid" }} params={{ data: state.pos }} /></Col>
                                                        <Col xs="content"><ClienteArtigo field={{ clienteNome: "cliente_nome", artigoCod: "item_cod", artigoDes: "artigo_des" }} params={{ data: state.pos }} /></Col>
                                                        <Col xs="content"><Encomenda field={{ orderCod: "order_cod", prfCod: "prf_cod" }} params={{ data: state.pos }} /></Col>
                                                    </Row>
                                                    <FormPaletizacao permissions={permission.permissions} associate={true} edit={false} header={false} parameters={{ artigo_cod: state.pos?.item_cod, cliente_cod: state.pos?.cliente_cod, ...state.pos.ofabrico_status == 1 ? { id: state.pos.paletizacao_id, draft_id: state.pos.draft_id } : { of_id: state.pos.id, ofabrico_status: state.pos.ofabrico_status } }} />
                                                </Col>} */}
                        </YScroll>
                    </Col >
                </Row >
            </Container >
        </Page.Ready >
    )

}