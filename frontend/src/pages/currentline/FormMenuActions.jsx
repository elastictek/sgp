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
import { LoadingOutlined, EditOutlined, PlusOutlined, EllipsisOutlined, SettingOutlined, PaperClipOutlined, HistoryOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT, THICKNESS } from 'config';
import { remove } from 'ramda';
import { MdProductionQuantityLimits } from 'react-icons/md';
import { FaPallet, FaWarehouse, FaTape } from 'react-icons/fa';
import { Object } from 'sugar';
import { VerticalSpace } from 'components/formLayout';

const FormLotes = React.lazy(() => import('./FormLotes'));
const FormFormulacao = React.lazy(() => import('./FormFormulacaoUpsert'));
const FormGamaOperatoria = React.lazy(() => import('./FormGamaOperatoriaUpsert'));
const FormSpecs = React.lazy(() => import('./FormSpecsUpsert'));
const FormCortes = React.lazy(() => import('./FormCortes'));


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
            type={showWrapper.type}
            mode={showWrapper.mode}
            width={showWrapper?.width}
            height={showWrapper?.height}
            destroyOnClose={true}
            mask={true}
            /* style={{ maginTop: "48px" }} */
            setVisible={onVisible}
            visible={showWrapper.show}
            bodyStyle={{ height: "100%"/*  paddingBottom: 80 *//* , overflowY: "auto", minHeight: "350px", maxHeight: "calc(100vh - 50px)" */ }}
            footer={<div ref={iref} id="form-wrapper" style={{ textAlign: 'right' }}></div>}
        >
            <YScroll>
                {showWrapper.idcard === "lotes" && <Suspense fallback={<></>}><FormLotes setFormTitle={setFormTitle} record={showWrapper.record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.idcard === "formulacao" && <Suspense fallback={<></>}><FormFormulacao setFormTitle={setFormTitle} record={showWrapper.record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.idcard === "gamaoperatoria" && <Suspense fallback={<></>}><FormGamaOperatoria setFormTitle={setFormTitle} record={showWrapper.record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.idcard === "especificacoes" && <Suspense fallback={<></>}><FormSpecs setFormTitle={setFormTitle} record={showWrapper.record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.idcard === "cortes" && <Suspense fallback={<></>}><FormCortes setFormTitle={setFormTitle} record={showWrapper.record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {/*                 {!showWrapper.type && <FormAggUpsert setFormTitle={setFormTitle} parentRef={iref} closeParent={onVisible} parentReload={parentReload} />}
                {showWrapper.idcard === "paletes_stock" && <Suspense fallback={<></>}><FormPaletesStockUpsert setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.idcard === "schema" && <Suspense fallback={<></>}><FormPaletizacao setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.idcard === "settings" && <Suspense fallback={<></>}><FormSettings setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.idcard === "attachments" && <Suspense fallback={<></>}><FormAttachments setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>} */}
            </YScroll>
        </WrapperForm>
    );
}

const loadCurrentSettings = async (aggId, token) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/currentsettingsget/`, filter: { aggId }, sort: [], cancelToken: token });
    return rows;
}


const CardAgg = ({ ofItem, paletesStock, setShowForm }) => {
    const { of_cod, cliente_nome, produto_cod, item_des } = ofItem;
    const totais = useRef({});

    // const paletes = JSON.parse(aggItem?.n_paletes);
    const onAction = (idcard) => {
        console.log("$$$$$", idcard, ofItem)
        switch (idcard) {
            case 'paletes_stock':
                setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, mode: "none", type: "modal", width: "300px", height: "300px" }));
                break;
            case 'schema':
                setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, mode: "none", type: "modal", width: "300px", height: "300px" }));
                break;
            case 'settings':
                setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, mode: "none", type: "modal", width: "300px", height: "300px" }));
                break;
            case 'attachments':
                setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, mode: "none", type: "modal", width: "300px", height: "300px" }));
                break;
        }
    }

    const computeQty = () => {
        const ps = paletesStock.find(v => v.of_id = ofItem.of_id);
        const total = { n_paletes: ofItem.n_paletes_total, linear_meters: ofItem.linear_meters, qty_encomenda: ofItem.qty_encomenda, paletes_stock: (ps.paletes ? ps.paletes.length : 0) };
        total.paletes_produzir = total.n_paletes - total.paletes_stock;
        return total;
    }

    useEffect(() => {
        totais.current = computeQty();
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
                    <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                        <div>Encomenda</div>
                        <div style={{ minWidth: "120px", fontWeight: 700, fontSize: "12px" }}>{totais.current.qty_encomenda} m&#178;</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>Paletes Total</div>
                        <div style={{ minWidth: "120px", fontWeight: 700, fontSize: "12px" }}>{totais.current.n_paletes}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>Paletes Stock</div>
                        <div style={{ minWidth: "120px", fontWeight: 700, fontSize: "12px" }}>{totais.current.paletes_stock}</div>
                    </div>
                    <div style={{ borderTop: "solid 1px #000", display: "flex", justifyContent: "space-between" }}>
                        <div>Paletes a Produzir</div>
                        <div style={{ minWidth: "120px", fontWeight: 700, fontSize: "12px" }}>{totais.current.paletes_produzir}</div>
                    </div>
                </YScroll>


            </StyledCard>
        </div>
    );
}

const CardPlanificacao = ({ menuItem, record }) => {
    const { planificacao, ofs, paletesstock } = record;
    const totais = useRef({});

    const computeQty = () => {
        const paletes_stock = paletesstock.reduce((ac, v) => {
            ac += (v.paletes) ? v.paletes.length : 0;
            return ac;
        }, 0);

        const total = ofs.reduce((ac, v) => {
            ac.n_paletes += v.n_paletes_total;
            ac.linear_meters += v.linear_meters;
            ac.qty_encomenda += v.qty_encomenda;
            return ac;
        }, { n_paletes: 0, linear_meters: 0, qty_encomenda: 0, paletes_stock });
        total.paletes_produzir = total.n_paletes - total.paletes_stock;
        return total;
    }

    useEffect(() => {
        totais.current = computeQty();
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

                <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                    <div>Encomenda</div>
                    <div style={{ minWidth: "120px", fontWeight: 700, fontSize: "14px" }}>{totais.current.qty_encomenda} m&#178;</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>Paletes Total</div>
                    <div style={{ minWidth: "120px", fontWeight: 700, fontSize: "14px" }}>{totais.current.n_paletes}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>Paletes Stock</div>
                    <div style={{ minWidth: "120px", fontWeight: 700, fontSize: "14px" }}>{totais.current.paletes_stock}</div>
                </div>
                <div style={{ borderTop: "solid 1px #000", display: "flex", justifyContent: "space-between" }}>
                    <div>Paletes a Produzir</div>
                    <div style={{ minWidth: "120px", fontWeight: 700, fontSize: "14px" }}>{totais.current.paletes_produzir}</div>
                </div>
            </Card>
        </div>
    );
}

const CardLotes = ({ menuItem, record, setShowForm }) => {
    const { formulacao, cores, nonwovens } = record;

    const onEdit = () => {
        setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, mode: "fullscreen", type: "modal" }))
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

const CardFormulacao = ({ menuItem, record, setShowForm }) => {
    const { formulacao } = record;

    useEffect(() => {
        console.log("ENTREI NA FORMULAÇÃO", record)
    }, []);

    const onEdit = () => {
        setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, mode: "maximized", type: "modal", width: null, height: null }))
    }

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
                extra={<Space><Button onClick={onEdit} icon={<EditOutlined />} /><Button onClick={onEdit} icon={<HistoryOutlined />} /></Space>}
                bodyStyle={{ height: "200px", maxHeight: "400px", overflow: "hidden" }}
            >
                <YScroll>
                    <FormFormulacao record={record} forInput={false} />
                </YScroll>
            </Card>
        </div>
    );
}

const CardGamaOperatoria = ({ menuItem, record, setShowForm }) => {
    const { gamaoperatoria } = record;

    useEffect(() => {
        console.log("ENTREI NA GAMA OPERATORIA", record)
    }, []);

    const onEdit = () => {
        setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, mode: "normal", type: 'modal', width: null, height: null }))
    }

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
                extra={<Space><Button onClick={onEdit} icon={<EditOutlined />} /><Button onClick={onEdit} icon={<HistoryOutlined />} /></Space>}
                bodyStyle={{ height: "200px", maxHeight: "400px", overflow: "hidden" }}
            >
                <YScroll>
                    <FormGamaOperatoria record={record} forInput={false} />
                </YScroll>
            </Card>
        </div>
    );
}

const CardArtigoSpecs = ({ menuItem, record, setShowForm }) => {
    const { artigospecs } = record;

    useEffect(() => {
        console.log("ENTREI NAs ESPECIFICAÇÕES", record)
    }, []);

    const onEdit = () => {
        setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, mode: "normal", type: 'modal', width: null, height: null }))
    };

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
                extra={<Space><Button onClick={onEdit} icon={<EditOutlined />} /><Button onClick={onEdit} icon={<HistoryOutlined />} /></Space>}
                bodyStyle={{ height: "200px", maxHeight: "400px", overflow: "hidden" }}
            >
                <YScroll>
                    <FormSpecs record={record} forInput={false} />
                </YScroll>
            </Card>
        </div>
    );
}

const CardCortes = ({ menuItem, record, setShowForm }) => {
    const { formulacao } = record;

    useEffect(() => {
        console.log("ENTREI NOS CORTES", record)
    }, []);

    const onEdit = () => {
        setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, mode: "maximized", type: "modal", width: null, height: null }))
    }

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
                extra={<Space><Button onClick={onEdit} icon={<EditOutlined />} /><Button onClick={onEdit} icon={<HistoryOutlined />} /></Space>}
                bodyStyle={{ height: "200px", maxHeight: "400px", overflow: "hidden" }}
            >
                <YScroll>
                    <FormCortes record={record} forInput={false} />
                </YScroll>
            </Card>
        </div>
    );
}

const CardOperacoes = ({ menuItem, record, setShowForm, parentReload }) => {
    const { status } = record;

    const onEdit = () => {
        setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, mode: "fullscreen", type: "modal" }))
    }

    useEffect(() => {
        console.log("ENTREI NAS OPERAÇÕES", record)
    }, [])

    const changeStatus = async (status) => {
        const response = await fetchPost({ url: `${API_URL}/changecurrsettings/`, parameters: { id: record.id, status, agg_of_id:record.agg_of_id } });
        if (response.data.status !== "error") {
            parentReload({ aggId:record.agg_of_id });
        }
    }

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
            >
                {record.status == 1 &&
                    <>
                        <Button block size="large" style={{ background: "#389e0d", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(3)}>Iniciar Produção</Button>
                        <VerticalSpace height="5px" />
                        <Button block size="large" style={{ background: "#fa8c16", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(0)}>Refazer Planeamento</Button>
                    </>
                }
                {record.status == 3 &&
                    <>
                        <Button block size="large" style={{ background: "red", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(1)}>Parar/Suspender Produção</Button>
                    </>
                }
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

const menuItems = [
    {
        idcard: "planificacao",
        title: "Planificação",
    }, {
        idcard: "lotes",
        title: "Lotes de Matérias Primas"
    }, {
        idcard: "especificacoes",
        title: "Especificações"
    }, {
        idcard: "formulacao",
        title: "Formulação",
        span: 3
    }, {
        idcard: "operacoes",
        title: "Operações"
    }, {
        idcard: "gamaoperatoria",
        title: "Gama Operatória",
        span: 2
    }, {
        idcard: "cortes",
        title: "Cortes",
        span: 3
    }
];

export default ({ aggId }) => {
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState({ show: false, type: 'modal', mode: "fullscreen" });
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
                    console.log("CURRENT--SETTINGS", raw[0]);
                    const formulacao = JSON.parse(raw[0].formulacao);
                    const gamaoperatoria = JSON.parse(raw[0].gamaoperatoria);
                    const nonwovens = JSON.parse(raw[0].nonwovens);
                    const artigospecs = JSON.parse(raw[0].artigospecs);
                    const cortes = JSON.parse(raw[0].cortes);
                    const cortesordem = JSON.parse(raw[0].cortesordem);
                    const cores = JSON.parse(raw[0].cores);
                    const emendas = JSON.parse(raw[0].emendas);
                    const paletesstock = JSON.parse(raw[0].paletesstock);
                    const ofs = JSON.parse(raw[0].ofs);
                    const paletizacao = JSON.parse(raw[0].paletizacao);
                    const lotes = raw[0]?.lotes ? JSON.parse(raw[0].lotes) : [];

                    const quantity = ofs.reduce((basket, ofitem) => {
                        basket["square_meters"] = (!basket?.square_meters) ? ofitem.qty_encomenda : basket.square_meters + ofitem.qty_encomenda;
                        basket["linear_meters"] = (!basket?.linear_meters) ? ofitem.linear_meters : basket.linear_meters + ofitem.linear_meters;
                        basket["n_paletes"] = (!basket?.n_paletes) ? ofitem.n_paletes_total : basket.n_paletes + ofitem.n_paletes_total;
                        return basket;
                    }, {});
                    setCurrentSettings({
                        id: raw[0].id, user_id: raw[0].user_id, status: raw[0].status, agg_of_id: raw[0].agg_of_id,
                        quantity,
                        planificacao: {
                            start_prev_date: dayjs(raw[0].start_prev_date, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm'),
                            end_prev_date: dayjs(raw[0].end_prev_date, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm'), horas_previstas_producao: raw[0].horas_previstas_producao
                        },
                        produto: { produto_id: raw[0].produto_id, produto_cod: raw[0].produto_cod, gsm: raw[0].gsm },
                        sentido_enrolamento: raw[0].sentido_enrolamento, observacoes: raw[0].observacoes, formulacao, gamaoperatoria, paletesstock,
                        nonwovens, artigospecs, cortes, cortesordem, cores, emendas, ofs, paletizacao, status: raw[0].status, lotes
                    });
                    setLoading(false);
                })();
        }
    }

    // const onShowForm = (/* newForm = false */) => {
    //     setShowForm(prev => ({ ...prev, type: 'modal', show: !prev.show, record: {} }));
    // }

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
                {Object.keys(currentSettings).length > 0 && <StyledGrid>
                    {menuItems.map((menuItem, idx) => {
                        const { planificacao, formulacao, cores, nonwovens, artigospecs, produto, quantity, gamaoperatoria, lotes, cortes, cortesordem, ofs, paletesstock } = currentSettings;
                        switch (menuItem.idcard) {
                            case "planificacao":
                                return (<CardPlanificacao key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, planificacao, ofs, paletesstock }} setShowForm={setShowForm} />);
                            case "lotes":
                                return (<CardLotes key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, formulacao, nonwovens, produto, quantity, lotes }} setShowForm={setShowForm} />);
                            case "formulacao":
                                return (<CardFormulacao key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, formulacao }} setShowForm={setShowForm} />);
                            case "gamaoperatoria":
                                return (<CardGamaOperatoria key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, gamaoperatoria }} setShowForm={setShowForm} />);
                            case "especificacoes":
                                return (<CardArtigoSpecs key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, artigospecs }} setShowForm={setShowForm} />);
                            case "cortes":
                                return (<CardCortes key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, cortes, cortesordem, agg_of_id: currentSettings.agg_of_id }} setShowForm={setShowForm} />);
                            case "operacoes":
                                return (<CardOperacoes key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, agg_of_id: currentSettings.agg_of_id, status: currentSettings.status }} setShowForm={setShowForm} parentReload={loadData} />);
                            default: <React.Fragment key={`ct-${idx}`} />
                        }
                    })}
                </StyledGrid>}

                {Object.keys(currentSettings).length > 0 && <StyledGrid style={{ marginTop: "15px" }}>
                    {currentSettings.ofs.map((ofItem, idx) => {
                        return (<CardAgg key={`ct-agg-${idx}`} ofItem={ofItem} setShowForm={setShowForm} paletesStock={currentSettings.paletesstock} />)
                    })}
                </StyledGrid>}



            </Spin>
        </>
    );
}