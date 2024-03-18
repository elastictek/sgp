import React, { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react';
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
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, PaperClipOutlined, AppstoreTwoTone, UnorderedListOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, PrinterTwoTone, SettingOutlined } from '@ant-design/icons';
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
import { LiaDatabaseSolid } from 'react-icons/lia';

const title = "Painel de Controlo";
const TitleForm = ({ data, onChange, level, auth, form }) => {
    return (<ToolbarTitle id={auth?.user} description={title} leftTitle={<span style={{}}></span>} />);
}

const StyledButton = styled(Button)`
    height:90px;
    width:120px;
    .txt{
        height:20px;
        line-height:1;
        text-wrap:wrap;
    }
`;

const MenuContainer = styled.div`
    max-width: 1fr;
    columns: 3 500px;
    column-gap: 10px;
    padding: 0px 10px;
    /*display: grid;*/
    /*grid-template-columns: repeat(auto-fill, minmax(300px, 400px));
    gap: 15px;*/
`;

const Box = styled.div`
    margin: 0 0 10px;
    /*display: inline-block;*/ 
    width: 100%;
    min-width:350px;
    break-inside: avoid;
    background-color:#ffffff;
`;

const Group = ({ title, right, more, visible = true, children }) => {
    const hasItems = React.Children.count(children) > 0;
    return (
        <>{visible &&
            <Box>
                <div style={{ border: "solid 1px #bfbfbf", borderRadius: "3px" }}>
                    <div style={{ display: "flex", borderBottom: "solid 1px #f0f0f0", height: "35px", alignItems: "center", padding: "5px 5px", marginBottom: "10px" }}>
                        <div style={{ flex: 1 }}><span style={{ fontWeight: 900, fontSize: "14px" }}>{title}</span></div>
                        <div><Space.Compact block>{right}</Space.Compact></div>
                        <div>
                            {more && <Dropdown trigger={["click"]} menu={{ ...more }}>
                                <Button onClick={() => { }} icon={<MoreOutlined />} />
                            </Dropdown>}
                        </div>
                    </div>
                    {hasItems &&
                        <Row gutterWidth={5} style={{ padding: "0px 10px", marginBottom: "5px" }}>
                            {children}
                        </Row>
                    }
                </div>
            </Box>
        }</>);
}

const Item = ({ title, icon, onClick, visible = true, style }) => {
    return (
        <>
            {visible &&
                <Col xs="content" style={{ marginBottom: "5px" }}>
                    <StyledButton onClick={onClick} style={{ ...style && style }}>
                        <div>{icon ? icon : <AppstoreTwoTone style={{ fontSize: "22px" }} />}</div>
                        <div className='txt'>{title}</div>
                    </StyledButton>
                </Col>
            }</>
    )
}

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
        document.body.style.backgroundColor = '#f5f5f5';
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => { document.body.style.backgroundColor = ''; controller.abort(); });
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


    const ofsItems = useMemo(() => {
        return [
            ...allows?.cortes?.admin ? [{ key: "cortesmanage", label: "Gerir cortes", icon: <SettingOutlined /> }] : [],
            ...allows?.base?.admin ? [{ key: "artigosclientemanage", label: "Gerir relação artigo/cliente", icon: <SettingOutlined /> }] : [],
            ...allows?.base?.admin ? [{ key: "paletizacoesmanage", label: "Gerir Esquemas de embalamento", icon: <SettingOutlined /> }] : []
        ];

    }, [allows]);

    const onOfsItemsClick = useCallback((item) => {
        switch (item.key) {
            case "cortesmanage": navigate("/app/picking/cortes/managecortes"); break;
            case "artigosclientemanage": navigate("/app/picking/base/manageartigoscliente"); break;
            case "paletizacoesmanage": navigate("/app/paletes/paletizacoeslist", { state: { edit: true } }); break;
        }
    }, []);

    const qualidadeItems = useMemo(() => {
        return [
            ...allows?.qualidade?.admin ? [{ key: "parameters", label: "Gerir Parâmetros", icon: <SettingOutlined /> }] : []
        ];

    }, [allows]);

    const onQualidadeItemsClick = useCallback((item) => {
        switch (item.key) {
            case "parameters": navigate("/app/qualidade/labparameterslist"); break;
        }
    }, []);

    return (
        <>
            <TitleForm auth={permission.auth} level={location?.state?.level} />

            <MenuContainer>

                <Group title="Ordens de Fabrico" visible={allows?.ordensFabrico?.n > 0}
                    right={<><Button onClick={() => navigate("/app/ofabrico/ordensfabricolist/")} icon={<UnorderedListOutlined />} type="link" >Lista</Button></>}
                    more={{ items: ofsItems, onClick: onOfsItemsClick }}>

                    <Item title="Anexos" visible={allows?.ordensFabrico?.attachements}
                        onClick={() => navigate("/app/picking/ofabricoattachements")}
                        icon={<PaperClipOutlined style={{ fontSize: "22px", color: "rgb(22, 119, 255)" }} />}
                    />
                    <Item title="Gerir Estados" visible={allows?.ordensFabrico?.status}
                        onClick={() => navigate("/app/picking/ofabricochangestatus")}
                    />
                    <Item title="Gerir Formulação" visible={allows?.ordensFabrico?.formulacao}
                        onClick={() => navigate("/app/picking/ofabricoformulacao")}
                    />
                    <Item title="Gerir Doseadores" visible={allows?.ordensFabrico?.doseadores}
                        onClick={() => navigate("/app/picking/ofabricodoseadores")}
                    />
                    <Item title="Cortes" visible={allows?.ordensFabrico?.cortes}
                        onClick={() => navigate("/app/picking/ofabricocortes")}
                    />
                    <Item title="Nonwovens" visible={allows?.ordensFabrico?.nonwovens}
                        onClick={() => navigate("/app/picking/ofabricononwovens")}
                    />
                    <Item title="Esquema de Embalamento" visible={allows?.ordensFabrico?.paletizacao}
                        onClick={() => navigate("/app/picking/ofabricopaletizacao")}
                    />

                </Group>

                <Group title="Paletes" visible={allows?.paletes?.n > 0}
                    right={<><Button onClick={() => navigate("/app/paletes/paleteslist", { noid: false })} icon={<UnorderedListOutlined />} type="link" >Lista</Button></>}>

                    <Item title="Nova Palete Linha" visible={allows?.paletes?.newline}
                        icon={<LiaDatabaseSolid size={28} color="#1677ff" />} onClick={() => navigate("/app/picking/newpaleteline")}
                    />
                    <Item title="Nova Palete HOLD" visible={allows?.paletes?.newhold} style={{ backgroundColor: "#391085", color: "#fff" }}
                        icon={<LiaDatabaseSolid size={28} color="#fff" />} onClick={() => navigate("/app/picking/newpalete", { state: { type: "HOLD", title: "Nova Palete HOLD", ordemFabrico: { enabled: false, retrabalho: null } } })}
                    />
                    <Item title="Nova Palete Stock" visible={allows?.paletes?.newcliente}
                        onClick={() => newWindow(`${ROOT_URL}/producao/palete/create/`, {}, `paletecreate`)}
                    />
                    <Item title="Refazer Palete" visible={allows?.paletes?.redo}
                        onClick={() => navigate("/app/picking/redopaleteline")}
                    />
                    <Item title="Pesar Palete" visible={allows?.paletes?.weigh}
                        onClick={() => navigate("/app/picking/weighpalete")}
                    />
                    <Item title="Imprimir Etiqueta" visible={allows?.paletes?.print}
                        icon={<PrinterTwoTone style={{ fontSize: "22px" }} />}
                        onClick={() => navigate("/app/picking/printetiquetapalete")}
                    />
                    <Item title="Apagar Palete" visible={allows?.paletes?.delete}
                        onClick={() => navigate("/app/picking/deletepalete")}
                    />
                </Group>

                <Group title="Cargas" visible={allows?.cargas?.n > 0}>

                    <Item title="Pré-Picking" visible={allows?.cargas?.prepicking}
                        onClick={() => navigate("/app/picking/prepicking")}
                    />
                    <Item title="Criar Carga" visible={allows?.cargas?.new}
                        onClick={() => navigate("/app/picking/addpaletescarga")}
                    />
                    <Item title="Apagar Carga" visible={allows?.cargas?.delete}
                        onClick={() => navigate("/app/picking/xxxxx")}
                    />

                </Group>

                <Group title="Matérias Primas" visible={allows?.materiasPrimas?.n > 0}>

                    <Item title="Entrada Granulado" visible={allows?.materiasPrimas?.ingranulado}
                        onClick={() => navigate("/app/picking/granuladoin")}
                    />
                    <Item title="Saída Granulado" visible={allows?.materiasPrimas?.outgranulado}
                        onClick={() => navigate("/app/picking/granuladoout")}
                    />
                    <Item title="Entrada Nonwovens" visible={allows?.materiasPrimas?.innw}
                        onClick={() => navigate("/app/picking/nonwovensin")}
                    />
                    <Item title="Saída Nonwovens" visible={allows?.materiasPrimas?.outnw}
                        onClick={() => navigate("/app/picking/nonwovensout")}
                    />
                    <Item title="Ajustar Fila Nonwovens" visible={allows?.materiasPrimas?.fixqueue}
                        onClick={() => navigate("/app/picking/nonwovensqueue")}
                    />
                    <Item title="Imp. Amostras Nonwovens" visible={allows?.materiasPrimas?.printnw}
                        icon={<PrinterTwoTone style={{ fontSize: "22px" }} />}
                        onClick={() => navigate("/app/picking/nonwovensprint")}
                    />
                    <Item title="Imprimir Etiqueta Buffer" visible={allows?.materiasPrimas?.printbuffer}
                        icon={<PrinterTwoTone style={{ fontSize: "22px" }} />}
                        onClick={() => navigate("/app/picking/printbuffer")}
                    />

                </Group>

                <Group title="Bobinagens" visible={allows?.bobinagens?.n > 0}
                    right={<><Button onClick={() => navigate("/app/bobinagens/reellings", { noid: false })} icon={<UnorderedListOutlined />} type="link" >Lista</Button></>}>

                    <Item title="Validar Bobinagem" visible={allows?.bobinagens?.validate}
                        onClick={() => navigate("/app/picking/validatebobinagem")}
                    />
                    <Item title="Apagar Bobinagem" visible={allows?.bobinagens?.delete}
                        onClick={() => navigate("/app/picking/deletebobinagem")}
                    />
                    <Item title="Nova Bobinagem" visible={allows?.bobinagens?.new}
                        onClick={() => navigate("/app/picking/newbobinagemline")}
                    />
                    <Item title="Corrigir Bobinagem" visible={allows?.bobinagens?.fix}
                        onClick={() => navigate("/app/picking/fixbobinagem")}
                    />
                    <Item title="Imprimir Etiqueta" visible={allows?.bobinagens?.print}
                        icon={<PrinterTwoTone style={{ fontSize: "22px" }} />}
                        onClick={() => navigate("/app/picking/printetiquetabobinagem")}
                    />

                </Group>

                <Group title="Retrabalho" visible={allows?.retrabalho?.n > 0}>

                    <Item title="Ordens Retrabalho" visible={allows?.retrabalho?.ordens}
                        onClick={(e) => {
                            e.stopPropagation();
                            newWindow(`${ROOT_URL}/planeamento/ordemdeproducao/list-retrabalho/`, {}, "ordensretrabalho");
                        }}
                    />
                    <Item title="Bobinagens Retrabalho" visible={allows?.retrabalho?.bobinagens}
                        onClick={(e) => {
                            e.stopPropagation();
                            newWindow(`${ROOT_URL}/producao/retrabalho/`, {}, "bobinagensretrabalho");
                        }}
                    />
                    <Item title="Paletes Retrabalho" visible={allows?.retrabalho?.paletes}
                        onClick={(e) => {
                            e.stopPropagation();
                            newWindow(`${ROOT_URL}/producao/palete/retrabalho`, {}, "paletedm");
                        }}
                    />

                </Group>

                <Group title="Qualidade" visible={allows?.qualidade?.n > 0}
                    more={{ items: qualidadeItems, onClick: onQualidadeItemsClick }}
                >

                    <Item title="Testar Bobinagens" visible={allows?.qualidade?.tests}
                        onClick={() => navigate("/app/picking/qualitytestbm")}
                    />
                    <Item title="TEST-AG-GRID" visible={allows?.qualidade?.tests}
                        onClick={() => navigate("/app/picking/test-ag-grid")}
                    />
                    <Item title="TEST-AG-GRID SINGLE SELECT" visible={allows?.qualidade?.tests}
                        onClick={() => navigate("/app/examples/ExampleTableSingleSelect")}
                    />

                </Group>

                <Group title="Troca de Etiquetas" visible={allows?.trocaetiquetas?.n > 0}
                    right={<Button onClick={() => navigate("/app/picking/trocaetiquetas/listtasksexecuted", { noid: false })} icon={<UnorderedListOutlined />} type="link">Lista</Button>}
                >

                    <Item title="Trocar Etiquetas" visible={allows?.trocaetiquetas?.execute}
                        onClick={() => navigate("/app/picking/trocaetiquetas/listruntaskchoose")}
                    />
                    <Item title="Gerir Tarefas" visible={allows?.trocaetiquetas?.admin}
                        onClick={() => navigate("/app/picking/trocaetiquetas/managetasks")}
                    />

                </Group>


            </MenuContainer>

        </>
    )

}