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
import loadInit, { fixRangeDates, newWindow } from "utils/loadInitV3";
import { API_URL, ROOT_URL } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Card, Dropdown } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, PaperClipOutlined, AppstoreTwoTone, UnorderedListOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, PrinterTwoTone } from '@ant-design/icons';
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
import { AppContext, MediaContext } from 'app';

const title = "Painel de Controlo";
const TitleForm = ({ data, onChange, level, auth, form }) => {
    return (<ToolbarTitle id={auth?.user} description={title} leftTitle={<span style={{}}></span>} />);
}

const StyledButton = styled(Button)`
    height:80px;
    width:100px;
    .txt{
        height:20px;
        line-height:1;
    }
`;


export default ({ extraRef, closeSelf, loadParentData, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const media = useContext(MediaContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission();
    const [formDirty, setFormDirty] = useState(false);
    const [allows, setAllows] = useState();


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
        const instantPermissions = await permission.loadInstantPermissions({ name: "controlpanel", module: "main" });
        const _allows = {};
        for (const k of Object.keys(instantPermissions)) {
            _allows[k] = { n: 0 };
            for (const x of Object.keys(instantPermissions[k])) {
                const v = permission.isOk({ item: k, action: x, instantPermissions });
                _allows[k].n = (v) ? _allows[k].n + 1 : _allows[k].n;
                _allows[k][x] = v;
            }
        }
        setAllows({ ..._allows });
        submitting.end();
    }



    return (
        <>
            <TitleForm auth={permission.auth} level={location?.state?.level} />
            <Container fluid>
                <Row>
                    <Col xs={12} md={4}>
                        <Row>
                            {allows?.ordensFabrico?.n > 0 && <Col xs={12} style={{ marginTop: "5px" }}>
                                <Card bodyStyle={{ padding: "7px" }} size="small" title={<span style={{ fontWeight: 900, fontSize: "14px" }}>Ordens de Fabrico</span>} style={{ width: "100%" }} extra={
                                    <Space.Compact block>
                                        <Button onClick={() => navigate("/app/ofabrico/ordensfabricolist/")} icon={<UnorderedListOutlined />} type="link" >
                                            Lista
                                        </Button>
                                        <Button onClick={() => { }} icon={<MoreOutlined />} />
                                    </Space.Compact>
                                }>
                                    <Container fluid style={{ padding: "0px", margin: "0px" }}>
                                        <Row gutterWidth={5} style={{ /* justifyContent: "center" */ }}>
                                            {allows?.ordensFabrico?.attachements && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/ofabricoattachements")}>
                                                    <div><PaperClipOutlined style={{ fontSize: "22px", color: "rgb(22, 119, 255)" }} /></div>
                                                    <div className='txt'>Anexos</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.ordensFabrico?.status && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/ofabricochangestatus")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Gerir<br />Estados</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.ordensFabrico?.formulacao && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/ofabricoformulacao")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Gerir<br />Formulação</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.ordensFabrico?.doseadores && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/ofabricodoseadores")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Gerir<br />Doseadores</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.ordensFabrico?.cortes && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/ofabricocortes")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Cortes</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.ordensFabrico?.nonwovens && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/ofabricononwovens")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Nonwovens</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {/* <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                        <StyledButton onClick={() => navigate("/app/picking/ofabricochangestatus")}>
                                            <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                            <div className='txt'>Cores</div>
                                        </StyledButton>
                                    </Col> */}
                                        </Row>
                                    </Container>
                                </Card>
                            </Col>
                            }


                            {allows?.paletes?.n > 0 && <Col xs={12} style={{ marginTop: "5px" }}>
                                <Card bodyStyle={{ padding: "7px" }} size="small" title={<span style={{ fontWeight: 900, fontSize: "14px" }}>Paletes</span>} style={{ width: "100%" }} extra={
                                    <Space.Compact block>
                                        <Button onClick={() => navigate("/app/paletes/paleteslist", { noid: false })} icon={<UnorderedListOutlined />} type="link">
                                            Lista
                                        </Button>
                                        <Button onClick={() => { }} icon={<MoreOutlined />} />
                                    </Space.Compact>
                                }>
                                    <Container fluid style={{ padding: "0px", margin: "0px" }}>
                                        <Row gutterWidth={5} style={{ /* justifyContent: "center" */ }}>
                                            {allows?.paletes?.newline && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/newpaleteline")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Nova Palete<br />Linha</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.paletes?.newcliente && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => newWindow(`${ROOT_URL}/producao/palete/create/`, {}, `paletecreate`)}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Nova Palete<br />Cliente</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.paletes?.redo && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/redopaleteline")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Refazer Palete</div>
                                                </StyledButton>
                                            </Col>}
                                            {allows?.paletes?.weigh && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/weighpalete")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Pesar Palete</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.paletes?.print && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/printetiquetapalete")}>
                                                    <div><PrinterTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Imprimir<br />Etiqueta</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.paletes?.delete && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/deletepalete")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Apagar Palete</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                        </Row>
                                    </Container>
                                </Card>
                            </Col>}

                        </Row>
                    </Col>
                    <Col xs={12} md={4}>
                        <Row>
                            {allows?.cargas?.n > 0 && <Col xs={12} style={{ marginTop: "5px" }}>
                                <Card bodyStyle={{ padding: "7px" }} size="small" title={<span style={{ fontWeight: 900, fontSize: "14px" }}>Cargas</span>} style={{ width: "100%" }}>
                                    <Container fluid style={{ padding: "0px", margin: "0px" }}>
                                        <Row gutterWidth={5} style={{ /* justifyContent: "center" */ }}>
                                            {allows?.cargas?.prepicking && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/prepicking")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Pré-Picking</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.cargas?.new && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/addpaletescarga")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Criar Carga</div>
                                                </StyledButton>
                                            </Col>}
                                            {allows?.cargas?.delete && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/xxxxx")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Apagar Carga</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                        </Row>
                                    </Container>
                                </Card>
                            </Col>
                            }

                            {allows?.materiasPrimas?.n > 0 && <Col xs={12} style={{ marginTop: "5px" }}>
                                <Card bodyStyle={{ padding: "7px" }} size="small" title={<span style={{ fontWeight: 900, fontSize: "14px" }}>Matérias Primas</span>} style={{ width: "100%" }}>
                                    <Container fluid style={{ padding: "0px", margin: "0px" }}>
                                        <Row gutterWidth={5} style={{ /* justifyContent: "center" */ }}>
                                            {allows?.materiasPrimas?.ingranulado && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/granuladoin")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Entrada<br />Granulado</div>
                                                </StyledButton>
                                            </Col>}
                                            {allows?.materiasPrimas?.outgranulado && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/granuladoout")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Saída<br />Granulado</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.materiasPrimas?.innw && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/nonwovensin")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Entrada<br />Nonwovens</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.materiasPrimas?.outnw && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/nonwovensout")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Saída<br />Nonwovens</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.materiasPrimas?.fixqueue && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/nonwovensqueue")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Ajustar Fila<br />Nonwovens</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.materiasPrimas?.printnw && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/nonwovensprint")}>
                                                    <div><PrinterTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Imp. Amostras<br />Nonwovens</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.materiasPrimas?.printbuffer && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/printbuffer")}>
                                                    <div><PrinterTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Imprimir<br />Etiqueta Buffer</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                        </Row>
                                    </Container>
                                </Card>
                            </Col>
                            }
                        </Row>
                    </Col>
                    <Col xs={12} md={4}>
                        <Row>
                            {allows?.bobinagens?.n > 0 && <Col xs={12} style={{ marginTop: "5px" }}>
                                <Card bodyStyle={{ padding: "7px" }} size="small" title={<span style={{ fontWeight: 900, fontSize: "14px" }}>Bobinagens</span>} style={{ width: "100%", fontWeight: 900 }}
                                    extra={
                                        <Space.Compact block>
                                            <Button onClick={() => navigate("/app/bobinagens/reellings", { noid: false })} icon={<UnorderedListOutlined />} type="link">
                                                Lista
                                            </Button>
                                            <Button onClick={() => { }} icon={<MoreOutlined />} />
                                        </Space.Compact>
                                    }
                                >
                                    <Container fluid style={{ padding: "0px", margin: "0px" }}>
                                        <Row gutterWidth={5} style={{ /* justifyContent: "center" */ }}>
                                            {allows?.bobinagens?.validate && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/validatebobinagem")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Validar<br />Bobinagem</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.bobinagens?.delete && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/deletebobinagem")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Apagar<br />Bobinagem</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.bobinagens?.new && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/newbobinagemline")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Nova<br />Bobinagem</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.bobinagens?.fix && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/fixbobinagem")}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Corrigir<br />Bobinagem</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.bobinagens?.print && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={() => navigate("/app/picking/printetiquetabobinagem")}>
                                                    <div><PrinterTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Imprimir<br />Etiqueta</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                        </Row>
                                    </Container>
                                </Card>
                            </Col>
                            }


                            {allows?.retrabalho?.n > 0 && <Col xs={12} style={{ marginTop: "5px" }}>
                                <Card bodyStyle={{ padding: "7px" }} size="small" title={<span style={{ fontWeight: 900, fontSize: "14px" }}>Retrabalho</span>} style={{ width: "100%", fontWeight: 900 }}>
                                    <Container fluid style={{ padding: "0px", margin: "0px" }}>
                                        <Row gutterWidth={5} style={{ /* justifyContent: "center" */ }}>
                                            {allows?.retrabalho?.ordens && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={(e) => {
                                                    e.stopPropagation();
                                                    newWindow(`${ROOT_URL}/planeamento/ordemdeproducao/list-retrabalho/`, {}, "ordensretrabalho");
                                                }}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Ordens<br />Retrabalho</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.retrabalho?.bobinagens && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={(e) => {
                                                    e.stopPropagation();
                                                    newWindow(`${ROOT_URL}/producao/retrabalho/`, {}, "bobinagensretrabalho");
                                                }}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Bobinagens<br />Retrabalho</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                            {allows?.retrabalho?.paletes && <Col xs="content" style={{ textAlign: "center", marginTop: "5px" }}>
                                                <StyledButton onClick={(e) => {
                                                    e.stopPropagation();
                                                    newWindow(`${ROOT_URL}/producao/palete/retrabalho`, {}, "paletedm");
                                                }}>
                                                    <div><AppstoreTwoTone style={{ fontSize: "22px" }} /></div>
                                                    <div className='txt'>Paletes<br />Retrabalho</div>
                                                </StyledButton>
                                            </Col>
                                            }
                                        </Row>
                                    </Container>
                                </Card>
                            </Col>
                            }
                        </Row>
                    </Col>










                </Row>
            </Container>
        </>
    )

}