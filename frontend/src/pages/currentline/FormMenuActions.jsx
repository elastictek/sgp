import React, { useEffect, useState, useCallback, useRef, Suspense, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import YScroll from "components/YScroll";
import { Button, Spin, Tag, List, Typography, Form, InputNumber, Input, Card, Collapse, DatePicker, Space, Alert, Modal } from "antd";
const { Title, Text } = Typography;
const { Panel } = Collapse;
import { LoadingOutlined, EditOutlined, PlusOutlined, EllipsisOutlined, SettingOutlined, PaperClipOutlined, HistoryOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT, THICKNESS, TIME_FORMAT, SCREENSIZE_OPTIMIZED } from 'config';
import { remove } from 'ramda';
import Table, { setColumns } from "components/table";
import { useDataAPI } from "utils/useDataAPI";

import { MdProductionQuantityLimits } from 'react-icons/md';
import { FaPallet, FaWarehouse, FaTape } from 'react-icons/fa';
import { Object } from 'sugar';
import { VerticalSpace } from 'components/formLayout';
import ResponsiveModal from 'components/ResponsiveModal';
import Modalv4 from 'components/Modalv4';

import { GiBandageRoll } from 'react-icons/gi';
import { AiOutlineVerticalAlignTop, AiOutlineVerticalAlignBottom } from 'react-icons/ai';
import { VscDebugStart } from 'react-icons/vsc';
import { BsFillStopFill } from 'react-icons/bs';
import { IoCodeWorkingOutline } from 'react-icons/io5';
import { BiWindowOpen } from 'react-icons/bi';


import { SocketContext, MediaContext } from '../App';
const FormLotes = React.lazy(() => import('./FormLotes'));
const FormFormulacao = React.lazy(() => import('./FormFormulacaoUpsert'));
const FormGamaOperatoria = React.lazy(() => import('./FormGamaOperatoriaUpsert'));
const FormSpecs = React.lazy(() => import('./FormSpecsUpsert'));
const FormCortes = React.lazy(() => import('./FormCortes'));
const BobinesValidarList = React.lazy(() => import('../bobines/BobinesValidarList'));
const LineLogList = React.lazy(() => import('../logslist/LineLogList'));
const OFabricoTimeLineShortList = React.lazy(() => import('../OFabricoTimeLineShortList'));
const BobinagensValidarList = React.lazy(() => import('../bobinagens/BobinagensValidarList'));





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

const colorsOfs = ['#f5222d', '#fa8c16', '#fadb14', '#52c41a', '#13c2c2', '#1890ff', '#722ed1', '#eb2f96'];

const TitleLotes = ({ }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Space>
                    <div><b style={{ textTransform: "capitalize" }}></b>Lotes em Linha de Produção</div>
                </Space>
            </div>
        </div>
    );
}

const Drawer = ({ showWrapper, setShowWrapper, parentReload }) => {
    const [formTitle, setFormTitle] = useState({});
    const [confirmLoading, setConfirmLoading] = React.useState(false);
    const iref = useRef();

    const onVisible = () => {
        setShowWrapper(prev => ({ ...prev, show: false }));
    }

    useEffect(() => { }, [showWrapper])

    return (
        <>
            <ResponsiveModal
                title={<TitleForm title={formTitle.title} subTitle={formTitle.subTitle} />}
                visible={showWrapper.show}
                centered
                responsive
                onCancel={onVisible}
                confirmLoading={confirmLoading}
                maskClosable={true}
                destroyOnClose={true}
                fullWidthDevice={2}
                minFullHeight={showWrapper?.minFullHeight}
                width={showWrapper?.width}
                height={showWrapper?.height}
                footer={<div ref={iref} id="form-wrapper" style={{ textAlign: 'right' }}></div>}
            >
                <YScroll>
                    {showWrapper.idcard === "lotes" && <Suspense fallback={<></>}><FormLotes forInput={showWrapper.record?.forInput} setFormTitle={setFormTitle} record={showWrapper.record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                    {showWrapper.idcard === "gamaoperatoria" && <Suspense fallback={<></>}><FormGamaOperatoria forInput={showWrapper.record?.forInput} setFormTitle={setFormTitle} record={showWrapper.record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                    {showWrapper.idcard === "cortes" && <Suspense fallback={<></>}><FormCortes setFormTitle={setFormTitle} forInput={showWrapper.record?.forInput} record={showWrapper.record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                    {showWrapper.idcard === "especificacoes" && <Suspense fallback={<></>}><FormSpecs setFormTitle={setFormTitle} forInput={showWrapper.record?.forInput} record={showWrapper.record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                    {showWrapper.idcard === "formulacao" && <Suspense fallback={<></>}><FormFormulacao setFormTitle={setFormTitle} forInput={showWrapper.record?.forInput} record={showWrapper.record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                    {showWrapper.idcard === "validarbobinagens" && <Suspense fallback={<></>}>{<BobinesValidarList setFormTitle={setFormTitle} data={showWrapper.record} closeSelf={onVisible} />}</Suspense>}
                    {showWrapper.idcard === "linelogs" && <Suspense fallback={<></>}>{<LineLogList setFormTitle={setFormTitle} closeSelf={onVisible} />}</Suspense>}
                    {showWrapper.idcard === "ofabricotimelinelist" && <Suspense fallback={<></>}><OFabricoTimeLineShortList params={showWrapper.record} parentClose={onVisible} /></Suspense>}
                </YScroll>
            </ResponsiveModal>

        </>
    );
}

const loadCurrentSettings = async (aggId, token) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/currentsettingsget/`, filter: { aggId }, sort: [], cancelToken: token });
    return rows;
}

const CardAgg = ({ ofItem, paletesStock, setShowForm }) => {
    const { of_cod, cliente_nome, produto_cod, item_des, color } = ofItem;
    const totais = useRef({});

    // const paletes = JSON.parse(aggItem?.n_paletes);
    const onAction = (idcard) => {
        switch (idcard) {
            case 'paletes_stock':
                Modalv4.show({ width: "800px", height: "450px", fullWidthDevice: 2 });
                //setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, mode: "none", type: "modal", width: "300px", height: "300px" }));
                break;
            case 'schema':
                Modalv4.show({ width: "800px", height: "450px", fullWidthDevice: 2 });
                //setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, mode: "none", type: "modal", width: "300px", height: "300px" }));
                break;
            case 'settings':
                Modalv4.show({ width: "800px", height: "450px", fullWidthDevice: 2 });
                //setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, mode: "none", type: "modal", width: "300px", height: "300px" }));
                break;
            case 'attachments':
                Modalv4.show({ width: "800px", height: "450px", fullWidthDevice: 2 });
                //setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, mode: "none", type: "modal", width: "300px", height: "300px" }));
                break;
            case 'position':
                Modalv4.show({ width: "800px", height: "450px", fullWidthDevice: 2 });
                //setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, width: "300px", height: "300px" }));
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
                    <div style={{ fontWeight: 700, fontSize: "12px", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <div>{of_cod}</div>
                    </div>
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

    const onClick = () => {
        Modalv4.show({ content: <div><b>TODO</b></div> });
    }

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable onClick={onClick}
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
        setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, width: "100%" }))
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

const CardFormulacao = ({ menuItem, record, parentReload }) => {
    const { formulacao } = record;

    useEffect(() => {
        console.log("ENTREI NA FORMULAÇÃO", record)
    }, []);

    const onEdit = (data = {}) => {
        switch (data.feature) {
            case "formulation_change":
            case "dosers_change":
                Modalv4.show({
                    width: "1200px", height: "800px", minFullHeight: 800, propsToChild: true,
                    content: <FormFormulacao forInput={data.forInput} record={{ ...record, ...data }} parentReload={parentReload} />
                });
                break;
            default: Modalv4.show({ content: <div><b>TODO</b></div> });
        }
    }

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
                extra={<Space><Button onClick={() => onEdit({ feature: "dosers_change", forInput: false })}>Doseadores</Button><Button onClick={() => onEdit({ feature: "formulation_change", forInput: true })} icon={<EditOutlined />} /><Button onClick={onEdit} icon={<HistoryOutlined />} /></Space>}
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
        setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, mode: "normal", type: 'modal', width: "1000px", height: '800px', minFullHeight: 900 }))
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

    const onEdit = () => {
        setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, width: '900px', height: '800px', minFullHeight: 900 }))
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

const CardCortes = ({ menuItem, record, parentReload }) => {
    const { formulacao } = record;

    useEffect(() => {
    }, []);

    const onEdit = () => {
        Modalv4.show({
            propsToChild: true, width: '1500px', height: '700px', minFullHeight: 800, content: <FormCortes record={record} parentReload={parentReload} />
        });
    }

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable onClick={onEdit}
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
                extra={<Space><Button onClick={(e) => { e.stopPropagation(); onEdit(); }} icon={<EditOutlined />} /><Button onClick={onEdit} icon={<HistoryOutlined />} /></Space>}
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
        const response = await fetchPost({ url: `${API_URL}/changecurrsettings/`, parameters: { id: record.id, status, agg_of_id: record.agg_of_id } });
        if (response.data.status !== "error") {
            Modal.success({ content: response.data.title });
            parentReload({ aggId: record.agg_of_id });

        } else {
            Modal.error({
                title: 'Erro ao alterar estado da Ordem de Fabrico',
                content: response.data.title,
            });
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
                        <VerticalSpace height="5px" />
                        <Button block size="large" style={{ background: "#40a9ff", color: "#000", fontWeight: 700 }} onClick={() => changeStatus(9)}>Finalizar Produção</Button>
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

const CardValidarBobinagens = ({ socket, menuItem, record, parentReload }) => {
    const [loading, setLoading] = useState(false);
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/validarbobinagenslist/`, parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [{ column: 'nome', direction: 'ASC' }] } });

    useEffect(() => {
        const cancelFetch = cancelToken();
        //dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, [socket]);

    const handleWndClick = (r) => {
        Modalv4.show({
            propsToChild: true, width: '1500px', height: '700px', minFullHeight: 800, title: `Validar e Classificar Bobinagem ${r.nome}`, content: <BobinesValidarList data={{ bobinagem_id: r.id, bobinagem_nome: r.nome }} />
        });
    }
    const onView = () => {
        Modalv4.show({
            propsToChild: true, width: '1500px', height: '800px', minFullHeight: 800, content: <BobinagensValidarList />
        });
    }

    const selectionRowKey = (record) => {
        return `bob-${record.id}`;
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "bobinagenslist_validar",
            include: {
                ...((common) => (
                    {
                        nome: { title: "Bobinagem", sort: false, width: 90, fixed: 'left', render: (v, r) => <span onClick={() => handleWndClick(r)} style={{ color: "#096dd9", cursor: "pointer" }}>{v}</span>, ...common },
                        /* data: { title: "Data", render: (v, r) => dayjs(v).format(DATE_FORMAT), ...common }, */
                        inico: { title: "Início", sort: false, render: (v, r) => dayjs('01-01-1970 ' + v).format(TIME_FORMAT), ...common },
                        fim: { title: "Fim", sort: false, render: (v, r) => dayjs('01-01-1970 ' + v).format(TIME_FORMAT), ...common },
                        duracao: { title: "Duração", sort: false, width: 80, render: (v, r) => v, ...common },
                        core: { title: "Core", sort: false, width: 35, render: (v, r) => v, ...common },
                        comp: { title: "Comp.", sort: false, render: (v, r) => v, input: <InputNumber />, ...common },
                        comp_par: { title: "Comp. Emenda", sort: false, render: (v, r) => v, ...common },
                        comp_cli: { title: "Comp. Cliente", sort: false, render: (v, r) => v, ...common },
                        area: { title: <span>Área m&#178;</span>, sort: false, render: (v, r) => v, ...common },
                        diam: { title: "Diâmetro mm", sort: false, render: (v, r) => v, ...common },
                        nwinf: { title: "Nw Inf. m", sort: false, render: (v, r) => v, ...common },
                        nwsup: { title: "Nw Sup. m", sort: false, render: (v, r) => v, ...common }
                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable/*  onClick={onEdit} */
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
                extra={<Space><Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} /></Space>}
                bodyStyle={{ height: "200px", maxHeight: "400px", overflow: "hidden" }}
            >
                <YScroll>
                    <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                        <Table
                            columnChooser={false}
                            reload
                            header={false}
                            stripRows
                            darkHeader
                            size="small"
                            selection={{ enabled: false, rowKey: record => selectionRowKey(record) }}
                            paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                            dataAPI={dataAPI}
                            columns={columns}
                            onFetch={dataAPI.fetchPost}
                        />
                    </Spin>
                </YScroll>
            </Card>
        </div>
    );
}

const CardActions = ({ menuItem, record, parentReload }) => {
    const navigate = useNavigate();
    const location = useLocation();
    /*     const { status } = record; */

    /*     const onEdit = () => {
            setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, mode: "fullscreen", type: "modal" }))
        } */

    useEffect(() => {
        console.log("ENTREI NAS ACTIONS", record)
    }, [])

    /*     const changeStatus = async (status) => {
            const response = await fetchPost({ url: `${API_URL}/changecurrsettings/`, parameters: { id: record.id, status, agg_of_id: record.agg_of_id } });
            if (response.data.status !== "error") {
                Modal.success({ content: response.data.title });
                parentReload({ aggId: record.agg_of_id });
    
            } else {
                Modal.error({
                    title: 'Erro ao alterar estado da Ordem de Fabrico',
                    content: response.data.title,
                });
            }
        } */

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
            >
                <Button block size="large" onClick={() => navigate('/app/pick')}>Picar Granulado</Button>
                <VerticalSpace height="5px" />
                <Button block size="large" onClick={() => navigate('/app/logslist/comsumptionneedloglist')}>Consumos de Lotes</Button>
            </Card>
        </div>
    );
}



const EventColumn = ({ v }) => {
    return (<>

        {v === "reeling_exchange" && <GiBandageRoll color="#69c0ff" size={20} />}
        {v === "state_stop" && <BsFillStopFill color="red" size={20} />}
        {v === "state_start" && <VscDebugStart color="orange" size={20} />}
        {v === "state_working" && <IoCodeWorkingOutline color="green" size={20} />}
        {v === "nw_sup_change" && <AiOutlineVerticalAlignTop size={20} />}
        {v === "nw_inf_change" && <AiOutlineVerticalAlignBottom size={20} />}

    </>);
}

const ExclamationButton = styled(Button)`
  &&& {
    background-color: #ffa940;
    border-color: #ffc069;
    color:#fff;
    &:hover{
        background-color: #fa8c16;
        border-color: #ffe7ba;
    }
  }
`;

const AssignOFColumn = ({ v, e, onClick, fim_ts, id }) => {

    return (<>
        {v && <b>{v}</b>}
        {(!v && e === 1) && <ExclamationButton size="small" icon={<ExclamationCircleOutlined />} onClick={() => onClick(id, fim_ts)} />}
    </>);
}

const CardEventosLinha = ({ socket, menuItem, record, parentReload }) => {
    const [loading, setLoading] = useState(false);
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/lineloglist/`, parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [{ column: 'id', direction: 'DESC' },] } });

    useEffect(() => {
        const cancelFetch = cancelToken();
        //dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, [socket]);

    const reload = () => {
        dataAPI.fetchPost();
    }

    const handleWndClick = (icard, ig_id, fim_ts) => {
        Modalv4.show({
            propsToChild: true, width: "900px", height: "500px", fullWidthDevice: 2, title: "Ordens de Fabrico", content: <OFabricoTimeLineShortList params={{ data: { id: ig_id, fim_ts, parentReload: reload } }} />
        });
    }
    const onView = () => {
        Modalv4.show({
            propsToChild: true, width: '1500px', height: '800px', minFullHeight: 800, content: <LineLogList />
        });
    }

    const selectionRowKey = (record) => {
        return `ev-${record.id}`;
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "evventline_list",
            include: {
                ...((common) => (
                    {
                        type_desc: { title: "", width: 40, align: "center", fixed: 'left', render: (v, r) => <EventColumn v={v} />, ...common }
                        , nome: { title: "Bobinagem", width: 60, fixed: 'left', align: "center", style: { backgroundColor: "undet" }, render: (v, r) => <AssignOFColumn v={v} e={r.type} fim_ts={r.fim_ts} id={r.id} onClick={() => handleWndClick("ofabricotimelinelist", r.id, r.fim_ts)} />, ...common }
                        , inicio_ts: { title: "Início", width: 80, render: (v, r) => v && dayjs(v).format(DATETIME_FORMAT), ...common }
                        , fim_ts: { title: "Fim", width: 80, render: (v, r) => v && dayjs(v).format(DATETIME_FORMAT), ...common }
                        , diametro: { title: "Diâmetro", width: 90, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}><div style={{ width: "60px" }}>{v}</div>mm</div>, ...common }
                        , metros: { title: "Comprimento", width: 100, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}><div style={{ width: "60px" }}>{v}</div>m</div>, ...common }
                        , nw_inf: { title: "NW Inf.", width: 100, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}><div style={{ width: "60px" }}>{v}</div>m</div>, ...common }
                        , nw_sup: { title: "NW Sup.", width: 100, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}><div style={{ width: "60px" }}>{v}</div>m</div>, ...common }
                        , peso: { title: "Peso", width: 90, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}><div style={{ width: "60px" }}>{parseFloat(v).toFixed(2)}</div>kg</div>, ...common }
                        , cast_speed: { title: "Cast Vel.", width: 90, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}><div style={{ width: "60px" }}>{v}</div>m/s</div>, ...common }
                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
                extra={<Space><Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} /></Space>}
                bodyStyle={{ height: "200px", maxHeight: "400px", overflow: "hidden" }}
            >
                <YScroll>
                    <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                        <Table
                            columnChooser={false}
                            reload
                            header={false}
                            stripRows
                            darkHeader
                            size="small"
                            selection={{ enabled: false, rowKey: record => selectionRowKey(record) }}
                            paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                            dataAPI={dataAPI}
                            columns={columns}
                            onFetch={dataAPI.fetchPost}
                            scroll={{ x: (SCREENSIZE_OPTIMIZED.width - 20), y: '140px', scrollToFirstRowOnChange: true }}
                        />
                    </Spin>
                </YScroll>
            </Card>
        </div>
    );
}

const menuItems = [
    {
        idcard: "operacoes",
        title: "Operações"
    },
    {
        idcard: "planificacao",
        title: "Planificação",
    }, {
        idcard: "actions",
        title: "Ações"
    },/* , {
        idcard: "lotes",
        title: "Lotes de Matérias Primas"
    }, */ {
        idcard: "formulacao",
        title: "Formulação",
        span: 4
    },
    {
        idcard: "validarbobinagens",
        title: "Bobinagens para Validação",
        span: 3
    },
    {
        idcard: "cortes",
        title: "Cortes",
        span: 3
    },
    {
        idcard: "linelogs",
        title: "Eventos de Linha",
        span: 3
    }/* ,

    {
        idcard: "especificacoes",
        title: "Especificações",
        span: 2
    }, {
        idcard: "gamaoperatoria",
        title: "Gama Operatória",
        span: 3
    } */
];

export default ({ aggId }) => {
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState({ show: false, type: 'modal', mode: "fullscreen" });
    const [guides, setGuides] = useState(false);
    const [currentSettings, setCurrentSettings] = useState({});
    const { data: dataSocket } = useContext(SocketContext) || {};

    useEffect(() => {
        console.log("--------------------------------", dataSocket);
        const cancelFetch = cancelToken();
        loadData({ aggId, token: cancelFetch });
        return (() => cancelFetch.cancel("Form Actions Menu Cancelled"));
    }, [dataSocket?.inproduction]);


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

                    for (const [idx, v] of ofs.entries()) {
                        v['color'] = colorsOfs[idx]
                    }

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
            <Modalv4 />
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                {/* <Drawer showWrapper={showForm} setShowWrapper={setShowForm} parentReload={loadData} /> */}

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
                                return (<CardPlanificacao key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, planificacao, ofs, paletesstock }} setShowForm={setShowForm} parentReload={loadData} />);
                            case "lotes":
                                return (<CardLotes key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, formulacao, nonwovens, produto, quantity, lotes }} setShowForm={setShowForm} parentReload={loadData} />);
                            case "formulacao":
                                return (<CardFormulacao key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, formulacao }} setShowForm={setShowForm} parentReload={loadData} />);
                            case "gamaoperatoria":
                                return (<CardGamaOperatoria key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, gamaoperatoria }} setShowForm={setShowForm} parentReload={loadData} />);
                            case "especificacoes":
                                return (<CardArtigoSpecs key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, artigospecs }} setShowForm={setShowForm} parentReload={loadData} />);
                            case "cortes":
                                return (<CardCortes key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, cortes, cortesordem, agg_of_id: currentSettings.agg_of_id, ofs }} setShowForm={setShowForm} parentReload={loadData} />);
                            case "operacoes":
                                return (<CardOperacoes key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, agg_of_id: currentSettings.agg_of_id, status: currentSettings.status }} setShowForm={setShowForm} parentReload={loadData} />);
                            case "validarbobinagens":
                                return (<CardValidarBobinagens socket={dataSocket?.bobinagens} key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, agg_of_id: currentSettings.agg_of_id, status: currentSettings.status }} setShowForm={setShowForm} parentReload={loadData} />);
                            case "linelogs":
                                return (<CardEventosLinha socket={dataSocket?.igbobinagens} key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, agg_of_id: currentSettings.agg_of_id, status: currentSettings.status }} setShowForm={setShowForm} parentReload={loadData} />);
                            case "actions":
                                return (<CardActions key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, agg_of_id: currentSettings.agg_of_id, status: currentSettings.status }} parentReload={loadData} />);
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