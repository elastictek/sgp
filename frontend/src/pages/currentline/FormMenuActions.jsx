import React, { useEffect, useState, useCallback, useRef, Suspense, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import YScroll from "components/YScroll";
import { Button, Spin, Tag, List, Typography, Form, InputNumber, Input, Card, Collapse, DatePicker, Space, Alert } from "antd";
const { Title, Text } = Typography;
const { Panel } = Collapse;
import { LoadingOutlined, EditOutlined, PlusOutlined, EllipsisOutlined, SettingOutlined, PaperClipOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT, THICKNESS } from 'config';
import { remove } from 'ramda';
import { MdProductionQuantityLimits } from 'react-icons/md';
import { FaPallet, FaWarehouse, FaTape } from 'react-icons/fa';
import { Object } from 'sugar';

const FormLotes = React.lazy(() => import('./FormLotes'));


const StyledCard = styled(Card)`
    .ant-card-body{
        overflow-y:hidden;
    }

`;

const StyledCollapse = styled(Collapse)`

    .ant-collapse-header{
        background-color:#f5f5f5;
        border-radius: 2px!important;
        padding:1px 1px!important;
    }
    .ant-collapse-content > .ant-collapse-content-box{
        padding:15px 15px!important;
    }

`;

const StyledGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-gap: .5rem;
    grid-auto-flow: dense;
    align-items: start;
    padding:4px 10px;
`;



const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const Drawer = ({ showWrapper, setShowWrapper, parentReload }) => {
    const [formTitle, setFormTitle] = useState({});
    const iref = useRef();
    
    const onVisible = () => {
        setShowWrapper(prev => ({ ...prev, show: !prev.show }));
    }
 
    return (
        <WrapperForm
            title={<TitleForm title={formTitle.title} subTitle={formTitle.subTitle} />}
            type={showWrapper.mode}
            mode="fullscreen"
            destroyOnClose={true}
            mask={true}
            /* style={{ maginTop: "48px" }} */
            setVisible={onVisible}
            visible={showWrapper.show}
            bodyStyle={{ height: "100%"/*  paddingBottom: 80 *//* , overflowY: "auto", minHeight: "350px", maxHeight: "calc(100vh - 50px)" */ }}
            footer={<div ref={iref} id="form-wrapper" style={{ textAlign: 'right' }}></div>}
        >
            <YScroll>
                {showWrapper.type === "lotes" && <Suspense fallback={<></>}><FormLotes setFormTitle={setFormTitle} record={showWrapper.record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {/*                 {!showWrapper.type && <FormAggUpsert setFormTitle={setFormTitle} parentRef={iref} closeParent={onVisible} parentReload={parentReload} />}
                {showWrapper.type === "paletes_stock" && <Suspense fallback={<></>}><FormPaletesStockUpsert setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.type === "schema" && <Suspense fallback={<></>}><FormPaletizacao setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.type === "settings" && <Suspense fallback={<></>}><FormSettings setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.type === "attachments" && <Suspense fallback={<></>}><FormAttachments setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>} */}
            </YScroll>
        </WrapperForm>
    );
}

const loadCurrentSettings = async (aggId, token) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/currentsettingsget/`, filter: { aggId }, sort: [], cancelToken: token });
    return rows;
}


const CardAgg = ({ ofItem, setShowForm, /* aggItem */ of_id }) => {
    const { of_cod, cliente_nome, produto_cod, item_des } = ofItem;
    // const paletes = JSON.parse(aggItem?.n_paletes);
    // const onAction = (op) => {
    //     switch (op) {
    //         case 'paletes_stock':
    //             setShowForm(prev => ({ ...prev, type: op, mode: "drawer", show: !prev.show, record: { /* aggItem, */ aggItem, of_id } }));
    //             break;
    //         case 'schema':
    //             setShowForm(prev => ({ ...prev, type: op, mode: "drawer", show: !prev.show, record: { /* aggItem, */ aggItem, of_id } }));
    //             break;
    //         case 'settings':
    //             setShowForm(prev => ({ ...prev, type: op, mode: "drawer", show: !prev.show, record: { /* aggItem, */ aggItem, of_id } }));
    //             break;
    //         case 'attachments':
    //             setShowForm(prev => ({ ...prev, type: op, mode: "drawer", show: !prev.show, record: { /* aggItem, */ aggItem, of_id } }));
    //             break;
    //     }
    // }

    useEffect(() => {
        console.log("ENTREI MENU OFSACTION", ofItem)
    }, [])

    return (
        <div style={{ height: '100%' }}>
            <StyledCard hoverable
                style={{ width: '100%', height: '100%'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                headStyle={{ backgroundColor: "#002766", color: "#fff" }}
                title={<div>
                    <div style={{ fontWeight: 700, fontSize: "12px" }}>{of_cod}</div>
                    <div style={{ color: "#fff", fontSize: ".6rem" }}>{cliente_nome}</div>
                </div>} size="small"
                actions={[
                    <div key="settings" onClick={() => onAction('settings')} title="Outras definições">Definições</div>,
                    <div key="schema" onClick={() => onAction('schema')} title="Paletização (Esquema)">Paletização</div>,
                    <div key="paletes" onClick={() => onAction('paletes_stock')}>Stock</div>,
                    <div key="attachments" onClick={() => onAction('attachments')}><span><PaperClipOutlined />Anexos</span></div>
                ]}
            >
                <YScroll>
                    <Text strong>{item_des}</Text>
                </YScroll>


            </StyledCard>
        </div>
    );
}

const CardPlanificacao = ({ menuItem, record }) => {
    const { planificacao } = record;

    useEffect(() => {
        console.log("ENTREI PLANIFICACAO", record)
    }, [])

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
            >
                <div>
                    <div>Horas de Produção Previstas</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "16px" }}>{planificacao.horas_previstas_producao}H</div>

                <div style={{ display: "flex" }}>
                    <div style={{ flex: 1 }}>Início</div>
                    <div style={{ flex: 1 }}>Fim</div>
                </div>
                <div style={{ display: "flex" }}>
                    <div style={{ flex: 1, fontWeight: 600 }}>{planificacao.start_prev_date}</div>
                    <div style={{ flex: 1, fontWeight: 600 }}>{planificacao.end_prev_date}</div>
                </div>
            </Card>
        </div>
    );
}

const CardLotes = ({ menuItem, record, setShowForm }) => {
    const { formulacao, cores, nonwovens } = record;

    const onEdit = () => {
        setShowForm(prev => ({ ...prev, type: menuItem.type, show: !prev.show, record, fullScreen:true }))
    }

    useEffect(() => {
        console.log("ENTREI LOTES", record)
    }, [])

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
                extra={<Button onClick={onEdit} icon={<EditOutlined />} />}
            >

                {/* <div>
                    <div>Horas de Produção Previstas</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "16px" }}>{planificacao.horas_previstas_producao}H</div>

                <div style={{ display: "flex" }}>
                    <div style={{ flex: 1 }}>Início</div>
                    <div style={{ flex: 1 }}>Fim</div>
                </div>
                <div style={{ display: "flex" }}>
                    <div style={{ flex: 1, fontWeight: 600 }}>{planificacao.start_prev_date}</div>
                    <div style={{ flex: 1, fontWeight: 600 }}>{planificacao.end_prev_date}</div>
                </div> */}
            </Card>
        </div>
    );
}

const CardFormulacao = ({ menuItem, record }) => {
    const { formulacao } = record;

    useEffect(() => {
        console.log("ENTREI NA FORMULAÇÃO", record)
    }, [])

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
                extra={<Button icon={<EditOutlined />} />}
            >
            </Card>
        </div>
    );
}

const CardArtigoSpecs = ({ menuItem, record }) => {
    const { artigospecs } = record;

    useEffect(() => {
        console.log("ENTREI NAs ESPECIFICAÇÕES", record)
    }, [])

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
                extra={<Button icon={<EditOutlined />} />}
            >
            </Card>
        </div>
    );
}

const menuItems = [
    {
        type: "planificacao",
        title: "Planificação",
    }, {
        type: "lotes",
        title: "Lotes de Matérias Primas"
    }, {
        type: "especificacoes",
        title: "Especificações"
    }, {
        type: "formulacao",
        title: "Formulação",
        span: 2
    }
];

export default ({ aggId }) => {
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState({ show: false, type: null, mode: 'modal' });
    const [guides, setGuides] = useState(false);
    const [currentSettings, setCurrentSettings] = useState({});



    useEffect(() => {
        /*         console.log("FORM-AGG->", ctx) */
        const cancelFetch = cancelToken();
        loadData({ aggId, token: cancelFetch });
        return (() => cancelFetch.cancel("Form Actions Menu Cancelled"));
    }, []);

    const loadData = (data = {}, type = "init") => {
        const { aggId, token } = data;
        switch (type) {
            default:
                if (!loading) {
                    setLoading(true);
                }
                (async () => {
                    let raw = await loadCurrentSettings(aggId, token);

                    const formulacao = JSON.parse(raw[0].formulacao);
                    const gamaoperatoria = JSON.parse(raw[0].gamaoperatoria);
                    const nonwovens = JSON.parse(raw[0].nonwovens);
                    const artigospecs = JSON.parse(raw[0].artigospecs);
                    const cortes = JSON.parse(raw[0].cortes);
                    const cortesordem = JSON.parse(raw[0].cortesordem);
                    const cores = JSON.parse(raw[0].cores);
                    const emendas = JSON.parse(raw[0].emendas);
                    const ofs = JSON.parse(raw[0].ofs);
                    const paletizacao = JSON.parse(raw[0].paletizacao);

                    console.log("#####", ofs)

                    setCurrentSettings({
                        id: raw[0].id, user_id: raw[0].user_id, status: raw[0].status,
                        planificacao: {
                            start_prev_date: dayjs(raw[0].start_prev_date, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm'),
                            end_prev_date: dayjs(raw[0].end_prev_date, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm'), horas_previstas_producao: raw[0].horas_previstas_producao
                        },
                        sentido_enrolamento: raw[0].sentido_enrolamento, observacoes: raw[0].observacoes, formulacao, gamaoperatoria,
                        nonwovens, artigospecs, cortes, cortesordem, cores, emendas, ofs, paletizacao, status: raw[0].status
                    });
                    setLoading(false);
                })();
        }
    }

    const onShowForm = (/* newForm = false */) => {
        setShowForm(prev => ({ ...prev, type: null, show: !prev.show, record: {} }));
    }

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                <Drawer showWrapper={showForm} setShowWrapper={setShowForm} parentReload={loadData} />

                {/*                     <FormLayout id="LAY-MENU-ACTIONS-0" style={{ width: "500px", padding: "0px" }} field={{label:{enabled:false}}}>
                        <FieldSet margin={false} field={{ wide: [8,8] }}>
                            <FieldItem><DatePicker showTime size="small" format="YYYY-MM-DD HH:mm" /></FieldItem>
                            <FieldItem><DatePicker showTime size="small" format="YYYY-MM-DD HH:mm" /></FieldItem>
                        </FieldSet>
                    </FormLayout> */}

                {Object.keys(currentSettings).length > 0 && <StyledGrid>
                    {menuItems.map((menuItem, idx) => {
                        const { planificacao, formulacao, cores, nonwovens, artigospecs } = currentSettings;
                        switch (menuItem.type) {
                            case "planificacao":
                                return (<CardPlanificacao key={`ct-${menuItem.type}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, planificacao }} setShowForm={setShowForm} />);
                            case "lotes":
                                return (<CardLotes key={`ct-${menuItem.type}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, formulacao, cores, nonwovens }} setShowForm={setShowForm} />);
                            case "formulacao":
                                return (<CardFormulacao key={`ct-${menuItem.type}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, formulacao }} setShowForm={setShowForm} />);
                            case "especificacoes":
                                return (<CardArtigoSpecs key={`ct-${menuItem.type}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, artigospecs }} setShowForm={setShowForm} />);
                            default: <React.Fragment key={`ct-${idx}`} />
                        }
                    })}
                </StyledGrid>}

                {Object.keys(currentSettings).length > 0 && <StyledGrid style={{ marginTop: "15px" }}>
                    {currentSettings.ofs.map((ofItem, idx) => {
                        return (<CardAgg key={`ct-agg-${idx}`} ofItem={ofItem} setShowForm={setShowForm} />)
                    })}
                </StyledGrid>}
                {currentSettings.observacoes &&
                    <div style={{ padding: "10px" }}>
                        <Alert
                            style={{ width: "100%" }}
                            message="Observações"
                            description={currentSettings.observacoes}
                            type="info"
                        />
                    </div>
                }


            </Spin>
        </>
    );
}