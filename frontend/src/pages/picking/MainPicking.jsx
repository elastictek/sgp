import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV3';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';

const title = "Picking";
const TitleForm = ({ data, onChange, level, auth, form }) => {
    return (<ToolbarTitle id={auth?.user} description={title} title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }} wrap="nowrap" nogutter>
                <Col xs='content' style={{}}><Row nogutter><Col title={title} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}><span style={{}}>{title}</span></Col></Row></Col>
                {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
            </Row>
            <Row>
                <Col style={{ borderTop: "solid 1px #000" }}></Col>
            </Row>
        </Col>
    </>
    }
    />);
}

const StyledButton = styled(Button)`
    height:80px;
`;

export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "picking" });
    const [formDirty, setFormDirty] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        setFormDirty(false);
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, location?.state, null);
            inputParameters.current = { ...paramsIn };
        }

        submitting.end();
    }



    return (
        <>
            <TitleForm auth={permission.auth} level={location?.state?.level} />
            <Container>
                <Row>
                    <Col xs="content" style={{ textAlign: "center" }}>
                        <StyledButton onClick={() => navigate("/app/picking/newpaleteline")}>
                            <div><PrinterOutlined style={{ fontSize: "22px" }} /></div>
                            <div>Nova Palete de linha</div>
                        </StyledButton>
                    </Col>
                    <Col xs="content" style={{ textAlign: "center" }}>
                        <StyledButton onClick={() => navigate("/app/picking/redopaleteline")}>
                            <div><PrinterOutlined style={{ fontSize: "22px" }} /></div>
                            <div>Refazer Palete</div>
                        </StyledButton>
                    </Col>
                    <Col xs="content" style={{ textAlign: "center" }}>
                        <StyledButton onClick={() => navigate("/app/picking/weighpalete")}>
                            <div><PrinterOutlined style={{ fontSize: "22px" }} /></div>
                            <div>Pesar Palete</div>
                        </StyledButton>
                    </Col>
                    <Col xs="content" style={{ textAlign: "center" }}>
                        <StyledButton onClick={() => navigate("/app/picking/deletepalete")}>
                            <div><PrinterOutlined style={{ fontSize: "22px" }} /></div>
                            <div>Apagar Palete</div>
                        </StyledButton>
                    </Col>
                    <Col xs="content" style={{ textAlign: "center" }}><StyledButton>Validar Bobinagem</StyledButton></Col>
                    <Col xs="content" style={{ textAlign: "center" }}>
                        <StyledButton onClick={() => navigate("/app/picking/granuladoin")}>
                            <div><PrinterOutlined style={{ fontSize: "22px" }} /></div>
                            <div>Entrada Granulado</div>
                        </StyledButton>
                    </Col>
                    <Col xs="content" style={{ textAlign: "center" }}>
                        <StyledButton onClick={() => navigate("/app/picking/granuladoout")}>
                            <div><PrinterOutlined style={{ fontSize: "22px" }} /></div>
                            <div>Saída Granulado</div>
                        </StyledButton>
                    </Col>
                    <Col xs="content" style={{ textAlign: "center" }}><StyledButton onClick={() => navigate("/app/picking/nonwovensin")}>Entrada Nonwovens</StyledButton></Col>
                </Row>
            </Container>
        </>
    )

}