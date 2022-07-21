import React, { useEffect, useState, useCallback, useRef, Suspense, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, SelectDebounceField, SwitchField } from "components/formLayout";
import Toolbar from "components/toolbar";
import AlertMessages from "components/alertMessages";
import YScroll from "components/YScroll";
import { Button, Spin, Select, Tag, List, Typography, Form, InputNumber, Input, Card, Collapse, DatePicker, Space, Alert, Modal, Dropdown, Menu } from "antd";
const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;
import { LoadingOutlined, EditOutlined, PlusOutlined, EllipsisOutlined, SettingOutlined, PaperClipOutlined, HistoryOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT, THICKNESS, TIME_FORMAT, SCREENSIZE_OPTIMIZED } from 'config';
import { remove } from 'ramda';
import Table, { setColumns } from "components/table";
import { useDataAPI } from "utils/useDataAPI";
import Portal from "components/portal";



import { MdProductionQuantityLimits } from 'react-icons/md';
import { FaPallet, FaWarehouse, FaTape } from 'react-icons/fa';
import { Object } from 'sugar';
import { VerticalSpace } from 'components/formLayout';
import ResponsiveModal from 'components/ResponsiveModal';
import Modalv4 from 'components/Modalv4';
import useModalv4 from 'components/useModalv4';
import moment from 'moment';
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
const FormSettings = React.lazy(() => import('./ordemfabrico/FormSettings'));
const SvgSchema = React.lazy(() => import('../planeamento/paletizacaoSchema/SvgSchema'));


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

const schemaCreatePalete = (keys, excludeKeys) => {
    return getSchema({
        /* produto_cod: Joi.string().label("Designação do Produto").required(),
        artigo_formu: Joi.string().label("Fórmula").required(),
        artigo_nw1: Joi.string().label("Nonwoven 1").required(),
        artigo_width: Joi.number().integer().min(1).max(5000).label("Largura").required(),
        artigo_diam: Joi.number().integer().min(1).max(5000).label("Diâmetro").required(),
        artigo_core: Joi.number().integer().valid(3, 6).label("Core").required(),
        artigo_gram: Joi.number().integer().min(1).max(1000).label("Gramagem").required(),
        artigo_thickness: Joi.number().integer().min(0).max(5000).label("Espessura").required() */
    }, keys, excludeKeys).unknown(true);
}

const loadCustomersLookup = async (value) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellcustomerslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_customer"]: `%${value.replaceAll(' ', '%%')}%` } });
    return rows;
}

const FormConfirmCreatePalete = ({ form, ofItem, paletizacao, forInput = true, closeSelf, parentRef, navigate }) => {
    const [formStatus, setFormStatus] = useState({});
    const [confirmLoading, setConfirmLoading] = useState(false);


    useEffect(() => {
        let t = paletizacao.paletizacao.findLast(v => v.item_id === 2);
        let o = ofItem.order_cod ? 1 : 0;
        form.setFieldsValue({ cliente_cod: { value: ofItem.cliente_cod, label: ofItem.cliente_nome }, data: moment(), pos: { value: "bottom", label: "Palete Inferior" }, num_bobines: t.item_numbobines, enc: o, peso_palete: 13 });
        console.log("ENTREIII-0", ofItem);
        console.log("ENTREIII-1", paletizacao);
    }, []);

    const onFinish = async () => {
        const { data, ...values } = form.getFieldsValue(true);
        setConfirmLoading(true);
        console.log("SUBMITTING-----", values, ofItem);
        let mdf = 2;
        if (values.pos === "top") {
            let idx = paletizacao.paletizacao.findIndex(v => v.item_id === 2);
            if (paletizacao.paletizacao[idx + 1].item_id === 4) {
                mdf = 1
            }
        } else {
            let idx = paletizacao.paletizacao.findLastIndex(v => v.item_id === 2);
            if (paletizacao.paletizacao[idx + 1].item_id === 4) {
                mdf = 1
            }
        }

        const postdata = {
            ...values, data: moment(data).format(DATE_FORMAT),
            order_cod: ofItem.order_cod, of_id: ofItem.of_id, of_cod: ofItem.of_cod, core: ofItem.artigo_core, lar: ofItem.artigo_lar, mdf,
            draft_of_id: ofItem.draft_of_id, produto_cod: ofItem.produto_cod, produto_id: ofItem.produto_id, artigo_des: ofItem.artigo_des
        };

        const response = await fetchPost({
            url: `${API_URL}/createpalete/`, parameters: postdata
        });
        if (response.data.status !== "error") {
            navigate({ ...response.data.id, ...postdata });
            closeSelf();
        } else {
            Modal.error({ title: response.data.title });
        }
        console.log("Submitaaaaaaaa", response.data);
        setConfirmLoading(false);
    }

    const onChange = (value) => {
        let t = null;
        if (value === "top") {
            t = paletizacao.paletizacao.find(v => v.item_id === 2);
        } else {
            t = paletizacao.paletizacao.findLast(v => v.item_id === 2);
        }
        form.setFieldsValue({ num_bobines: t.item_numbobines });
    }

    return (
        <Spin spinning={confirmLoading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
            <div style={{ width: "600px", height: "300px" }}>
                <div style={{ display: "flex", flexAlign: "row" }}>
                    <div style={{ width: "300px", height: "300px" }}><SvgSchema viewBox="110 100 350 100" items={paletizacao} width="100%" height="100%" /></div>
                    <Form form={form} name={`fppalete`} onFinish={onFinish} component="form">
                        <AlertMessages formStatus={formStatus} />
                        <FormLayout
                            id="LAY-SPALETE"
                            layout="vertical"
                            style={{ width: "250px", padding: "0px" }}
                            schema={schemaCreatePalete}
                            fieldStatus={{}}
                            field={{ forInput, wide: [16], alert: { pos: "right", tooltip: true, container: false } }}
                            fieldSet={{ wide: 16 }}
                        >
                            {ofItem.order_cod && <FieldSet field={{ wide: [16] }}>
                                <Field required={false} layout={{ center: "align-self:center;max-width:25px;", left: "width:180px;align-self:center;" }} label={{ text: "Associar Palete à Encomenda?", pos: "left" }} name="enc"><SwitchField size="small" /></Field>
                            </FieldSet>
                            }
                            <FieldSet>
                                <Field forInput={false} name="cliente_cod" label={{ text: "Cliente" }}>
                                    <SelectDebounceField
                                        placeholder="Cliente"
                                        size="small"
                                        keyField="BPCNUM_0"
                                        textField="BPCNAM_0"
                                        showSearch
                                        showArrow
                                        allowClear
                                        fetchOptions={loadCustomersLookup}
                                    />

                                </Field>
                            </FieldSet>
                            <FieldSet field={{ wide: [8] }}>
                                <Field required={true} label={{ text: "Data da Palete" }} name="data"><DatePicker allowClear={false} size="small" format={DATE_FORMAT} /></Field>
                            </FieldSet>
                            <FieldSet field={{ wide: [8, 8], margin: "2px" }}>
                                <Field required={false} label={{ text: "Nº da Palete" }} name="num"><InputNumber min={1} size="small" /></Field>
                                <Field required={false} label={{ text: "Peso da Palete" }} name="peso_palete"><InputNumber min={1} max={25} size="small" addonBefore="kg" /></Field>
                            </FieldSet>
                            <FieldSet field={{ wide: [12] }}>
                                <Field required={true} label={{ text: "Posição no Esquema" }} name="pos">
                                    <SelectField disabled={paletizacao.paletizacao.filter(v => v.item_id === 2).length <= 1} size="small" keyField="value" valueField="label" style={{ width: 150 }} onChange={onChange} options={
                                        [{ value: "top", label: "Palete Superior" },
                                        { value: "bottom", label: "Palete Inferior" }]
                                    } />
                                </Field>
                            </FieldSet>
                            <FieldSet field={{ wide: [8] }}>
                                <Field required={false} forInput={false} label={{ text: "Nº de Bobines" }} name="num_bobines"><InputNumber min={1} max={20} size="small" /></Field>
                            </FieldSet>
                        </FormLayout>
                    </Form>
                    {parentRef && <Portal elId={parentRef.current}>
                        <Space>
                            <Button size="small" disabled={confirmLoading} onClick={closeSelf}>Cancelar</Button>
                            <Button size="small" disabled={confirmLoading} type="primary" onClick={onFinish}>Criar Palete</Button>
                        </Space>
                    </Portal>
                    }
                </div>
            </div >
        </Spin>
    );
}

const TitleConfirm = ({ action, ofabrico, order_cod }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div><ExclamationCircleOutlined style={{ color: "#faad14" }} /></div>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "column" }}>
                <div><b>Criar Palete na Ordem de Fabrico</b> {ofabrico}?</div>
                {order_cod && <div style={{ color: "#1890ff" }}>{order_cod}</div>}
            </div>
        </div>
    );
}

const CardAgg = ({ ofItem, paletesStock, emendas, setShowForm, csid, cores, paletizacao, status }) => {
    const navigate = useNavigate();
    const [formPalete] = Form.useForm();
    const { of_cod, cliente_nome, produto_cod, item_des, color } = ofItem;
    const totais = useRef({});
    const modal = useModalv4();

    const paleteNavigate = (postdata) => {
        navigate('/app/paletes/palete', { state: postdata });
        console.log("aaaaa-", postdata);
    }

    // const paletes = JSON.parse(aggItem?.n_paletes);
    const onAction = (idcard) => {
        switch (idcard) {
            case 'paletes_stock':
                modal.show({ propsToChild: true, width: "800px", height: "450px", fullWidthDevice: 2, responsive: true });
                //setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, mode: "none", type: "modal", width: "300px", height: "300px" }));
                break;
            case 'schema':
                modal.show({ propsToChild: true, width: "800px", height: "450px", fullWidthDevice: 2 });
                //setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, mode: "none", type: "modal", width: "300px", height: "300px" }));
                break;
            case 'settings':
                modal.show({
                    propsToChild: true, width: "800px", height: "450px", fullWidthDevice: 2, footer: "ref", content:
                        <FormSettings record={{ aggItem: { ...ofItem, emendas, cores }, csid }} /* setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} */ />
                });
                //setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, mode: "none", type: "modal", width: "300px", height: "300px" }));
                break;
            case 'attachments':
                modal.show({ propsToChild: true, width: "800px", height: "450px", fullWidthDevice: 2 });
                //setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, mode: "none", type: "modal", width: "300px", height: "300px" }));
                break;
            case 'position':
                modal.show({ propsToChild: true, width: "800px", height: "450px", fullWidthDevice: 2 });
                //setShowForm(prev => ({ ...prev, idcard, show: !prev.show, record: { /* aggItem, */ ofItem, draft_of_id: ofItem.draft_of_id }, width: "300px", height: "300px" }));
                break;
            case 'palete':
                const { details, ...rest } = JSON.parse(paletizacao[0].paletizacao);
                modal.show({
                    propsToChild: true, footer: "ref",
                    maskClosable: false,
                    closable: false,
                    width: "650px", fullWidthDevice: 2, height: "380px",
                    title: <TitleConfirm ofabrico={ofItem.of_cod} order_cod={ofItem.order_cod} />,
                    content: <FormConfirmCreatePalete navigate={paleteNavigate} form={formPalete} ofItem={ofItem} paletizacao={{ ...rest, paletizacao: details }} />
                });

                /* Modal.confirm({
                    width: 650,
                    centered: true, title: "Criar Palete?", content: <FormConfirmCreatePalete form={formPalete} ofItem={ofItem} paletizacao={{ ...rest, paletizacao: details }} />,
                    footer:[],
                    onOk: async () => {
                        return new Promise((resolve, reject) => {
                            formPalete.submit();
                            
                            //setTimeout(Math.random() > 0.5 ? resolve : reject, 10000);
                          }).catch(() => console.log('Oops errors!'));

                    }
                }); */
                //navigate("/app/paletes/palete", { state: { ...ofItem, tstamp: Date.now() } });    
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
                extra={<div>{status > 0 && <Button size="small" onClick={() => onAction('palete')}>Criar Palete</Button>}</div>}
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
    const modal = useModalv4();

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
        modal.show({ content: <div><b>TODO</b></div> });
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

const CardFormulacao = ({ menuItem, record }) => {
    const { formulacao } = record;
    const modal = useModalv4();

    useEffect(() => {
        console.log("ENTREI NA FORMULAÇÃO", record)
    }, []);

    const onEdit = (data = {}) => {
        switch (data.feature) {
            case "formulation_change":
            case "dosers_change":
                modal.show({ propsToChild: true, footer: "ref", width: '1200px', height: '700px', fullWidthDevice: 3, minFullHeight: 900, content: <FormFormulacao forInput={data.forInput} record={{ ...record, ...data }} /> });
                break;
            default: modal.show({ content: <div><b>TODO</b></div> });
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

const CardGamaOperatoria = ({ menuItem, record }) => {
    const { gamaoperatoria } = record;
    const modal = useModalv4();

    useEffect(() => {
        console.log("ENTREI NA GAMA OPERATORIA", record)
    }, []);

    const onEdit = () => {
        modal.show({ propsToChild: true, footer: "ref", width: '1000px', height: '600px', minFullHeight: 900, fullWidthDevice: 2, content: <FormGamaOperatoria forInput={record?.forInput} record={record} /> });
        /*         setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, mode: "normal", type: 'modal', width: "1000px", height: '800px', minFullHeight: 900 })) */
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

const CardArtigoSpecs = ({ menuItem, record }) => {
    const { artigospecs } = record;
    const modal = useModalv4();

    const onEdit = () => {

        modal.show({ propsToChild: true, footer: "ref", width: '900px', height: '600px', minFullHeight: 900, fullWidthDevice: 2, content: <FormSpecs forInput={record?.forInput} record={record} /> });
        /* setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, width: '900px', height: '800px', minFullHeight: 900 })) */
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

const CardCortes = ({ menuItem, record }) => {
    const { formulacao } = record;
    const modal = useModalv4();

    useEffect(() => {
    }, []);

    const onEdit = () => {
        modal.show({ propsToChild: true, width: '1500px', height: '700px', minFullHeight: 800, content: <FormCortes forInput={record?.forInput} record={record} /> });
        /* Modalv4.show({
            propsToChild: true, width: '1500px', height: '700px', minFullHeight: 800, content: <FormCortes record={record} parentReload={parentReload} />
        }); */
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


const fetchBobinagens = async (value) => {
    if (value) {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/getconsumosbobinagenslookup/`, pagination: { limit: 20 }, filter: { ["fbobinagem"]: `%${value.replaceAll(' ', '%%')}%` }, sort: [{ column: 'ig.t_stamp', direction: 'ASC' }] });
        return rows;
    }
}

const lastBobinagem = async () => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/getconsumosbobinagenslookup/`, pagination: { limit: 1 }, filter: {}, sort: [{ column: 'ig.t_stamp', direction: 'DESC' }] });
    return rows;
}

const FecharOrdemFabrico = ({ closeParent, parentDataAPI, parentRef, parentReload, data }) => {
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [lastId, setLastId] = useState();



    useEffect(() => {
        setSubmitting(true);
        (async () => {
            let bobinagem = await lastBobinagem();
            if (bobinagem.length > 0) {
                form.setFieldsValue({ date: bobinagem[0]["t_stamp"], fbobinagem: { key: bobinagem[0]["id"], value: bobinagem[0]["id"], label: <div key={`ls-${bobinagem[0]["id"]}`}><b>{bobinagem[0]["nome"]}</b> {moment(bobinagem[0]["t_stamp"]).format(DATETIME_FORMAT)}</div> } });
                setLastId(bobinagem[0]["id"]);
                setSubmitting(false);
            }
        })();
    }, []);

    const onValuesChange = (v) => {
        if ("fbobinagem" in v) {
            form.setFieldsValue({ date: moment(v.fbobinagem.value) });
        }
    }

    const onSubmit = async () => {
        setSubmitting(true);
        const { fbobinagem, date } = form.getFieldsValue(true);
        const dt = moment.isMoment(date) ? date.format(DATETIME_FORMAT) : moment(date).format(DATETIME_FORMAT);
        const response = await fetchPost({ url: `${API_URL}/changecurrsettings/`, parameters: { ...data, ig_id: fbobinagem.key, last: (lastId === fbobinagem.key ? true : false), date: dt } });
        parentReload();
        setSubmitting(false);
        closeParent();
    }


    return (

        <Form form={form} name={`frm-tt`} onFinish={onSubmit} onValuesChange={onValuesChange}>
            <FormLayout
                id="LAY-FRMMOV"
                layout="vertical"
                style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                schema={schema}
                field={{ guides: false, wide: [16], alert: { pos: "alert", tooltip: true, container: false, /* container: "el-external"*/ }, }}
                fieldSet={{ guides: false, wide: 16, margin: false, layout: "horizontal", overflow: false }}
            >

                <FieldSet>
                    <Field required={false} name="fbobinagem" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Bobinagem", pos: "top" }}>
                        <SelectDebounceField
                            placeholder="Bobinagem"
                            size="small"
                            keyField="id"
                            textField="nome"
                            showSearch
                            showArrow
                            allowClear
                            fetchOptions={fetchBobinagens}
                            optionsRender={(d, keyField, textField) => ({ label: <div><b>{d["nome"]}</b> {moment(d["t_stamp"]).format(DATETIME_FORMAT)}</div>, value: d["t_stamp"], key: d["id"] })}
                        />
                    </Field>
                </FieldSet>
                {parentRef && <Portal elId={parentRef.current}>
                    <Space>
                        <Button onClick={closeParent}>Cancelar</Button>
                        <Button disabled={submitting} type="primary" onClick={onSubmit}>Confirmar</Button>
                    </Space>
                </Portal>
                }
            </FormLayout>
        </Form>

    );
}

const PararOrdemFabrico = () => {
    return (<></>);
}

const CardOperacoes = ({ menuItem, record, setShowForm, parentReload }) => {
    const { status } = record;
    const modal = useModalv4();

    const onEdit = () => {
        setShowForm(prev => ({ ...prev, idcard: menuItem.idcard, show: !prev.show, record, mode: "fullscreen", type: "modal" }))
    }

    useEffect(() => {
        console.log("ENTREI NAS OPERAÇÕES", record)
    }, [])

    const suspenderProducao = async () => {
        //return new Promise((resolve, reject) => {
        //setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        const response = await fetchPost({ url: `${API_URL}/changecurrsettings/`, parameters: { id: record.id, status: 1, agg_of_id: record.agg_of_id } });
        //}).catch(() => console.log('Oops errors!'));

        //console.log("vou suspender!!!!!!!")
        //setSubmitting(true);
        //const { fbobinagem, date } = form.getFieldsValue(true);
        //const response = await fetchPost({ url: `${API_URL}/changecurrsettings/`, parameters: { ...data, ig_id: fbobinagem.key, last: (lastId === fbobinagem.key ? true : false), date: date.format(DATETIME_FORMAT) } });
        //parentReload();
        //setSubmitting(false);
        //closeParent();
    }

    const changeStatus = async (status) => {
        if (status === 9) {
            modal.show({
                propsToChild: true, width: '400px', height: '150px', fullWidthDevice: 2, footer: "ref",
                title: `Finalizar Produção`,
                content: <FecharOrdemFabrico data={{ id: record.id, status, agg_of_id: record.agg_of_id }} parentReload={() => parentReload({ aggId: record.agg_of_id })} />
            });
        }
        if (status === 1) {
            //Modal.confirm({ title: "Parar/Suspender Produção!", content: "Tem a certeza que deseja Parar/Suspender a Produção?", onOk: suspenderProducao })
            modal.show({
                 propsToChild: true, width: '400px', height: '150px', fullWidthDevice: 2, footer: "ref",
                 title: `Parar/Suspender Produção`,
                 content: <FecharOrdemFabrico data={{ id: record.id, status, agg_of_id: record.agg_of_id }} parentReload={() => parentReload({ aggId: record.agg_of_id })} />
             });
        }
        if (status === 3 || status === 0) {
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
    }

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
            >
                {(record.status == 1 || record.status == 2) &&
                    <>
                        <Button block size="large" style={{ background: "#389e0d", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(3)}>Iniciar Produção</Button>
                        <VerticalSpace height="5px" />
                        {/* <Button block size="large" style={{ background: "#fa8c16", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(0)}>Refazer Planeamento</Button> */}
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

const SelectBobinagens = ({ onView, onChangeContent, loading }) => {
    return (

        <Space>
            <Select defaultValue="0" style={{ width: 200 }} onChange={(v) => onChangeContent(v, "valid")} dropdownMatchSelectWidth={false} disabled={loading}>
                <Option value="0">Por validar</Option>
                <Option value="1">Validadas</Option>
                <Option value="-1"> </Option>
            </Select>
            <Select defaultValue="1" style={{ width: 200 }} onChange={(v) => onChangeContent(v, "type")} dropdownMatchSelectWidth={false} disabled={loading}>
                <Option value="1">Bobinagens da Ordem de Fabrico</Option>
                <Option value="-1">Todas as Bobinagens</Option>
            </Select>
            <Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} disabled={loading} />
            {/* <Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} disabled={loading}/> */}
        </Space>
    );
}

const CardValidarBobinagens = ({ socket, menuItem, record, parentReload }) => {
    const [loading, setLoading] = useState(false);
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/validarbobinagenslist/`, parameters: {}, pagination: { enabled: false, limit: 20 }, filter: { agg_of_id: record.agg_of_id, valid: "0", type: "1" }, sort: [{ column: 'nome', direction: 'ASC' }] } });
    const modal = useModalv4();
    const navigate = useNavigate();

    useEffect(() => {
        const cancelFetch = cancelToken();
        //dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, [socket]);

    useEffect(() => {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    }, [dataAPI.isLoading()]);


    const handleWndClick = (r) => {
        modal.show({ propsToChild: true, width: '1500px', height: '700px', minFullHeight: 800, title: `Validar e Classificar Bobinagem ${r.nome}`, content: <BobinesValidarList data={{ bobinagem_id: r.id, bobinagem_nome: r.nome }} /> })
        /*         Modalv4.show({
                    propsToChild: true, width: '1500px', height: '700px', minFullHeight: 800, title: `Validar e Classificar Bobinagem ${r.nome}`, content: <BobinesValidarList data={{ bobinagem_id: r.id, bobinagem_nome: r.nome }} />
                }); */
    }
    const onView = () => {
        navigate("/app/validateReellings", { state: { ...dataAPI.getFilter(true), agg_of_id: record.agg_of_id, ofs: record.ofs.map(v => v.of_cod), tstamp: Date.now() } });
    }

    const selectionRowKey = (record) => {
        return `bob-${record.id}`;
    }



    const onChangeContent = async (v, field) => {
        dataAPI.addFilters({ ...dataAPI.getFilter(true), [field]: v }, true);
        dataAPI.fetchPost();
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

                extra={<SelectBobinagens onChangeContent={onChangeContent} onView={onView} loading={dataAPI.isLoading()} />}

                //extra={<Space><Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} /></Space>}
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


const FormulacaoMenu = ({ onMenuClick }) => {
    return (<Menu
        onClick={onMenuClick}
        items={[
            {
                key: 'formulation_change',
                label: 'Alterar Formulação',
            },
            {
                key: 'dosers_change',
                label: 'Alterar Doseadores',
            }
        ]}
    />);
};


const CardActions = ({ menuItem, record, parentReload }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const modal = useModalv4();

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

    const onClick = (type) => {
        console.log(record)
        if (type === "gamaoperatoria") {
            modal.show({ propsToChild: true, footer: "ref", width: '1000px', height: '600px', minFullHeight: 900, fullWidthDevice: 2, content: <FormGamaOperatoria forInput={record?.forInput} record={record} /> });
        } else if (type === "specs") {
            modal.show({ propsToChild: true, footer: "ref", width: '900px', height: '600px', minFullHeight: 900, fullWidthDevice: 2, content: <FormSpecs forInput={record?.forInput} record={record} /> });
        }
    }

    const onMenuClick = (option) => {
        let data = {}
        switch (option.key) {
            case "formulation_change":
                data = { feature: option.key, forInput: true }
                break;
            case "dosers_change":
                data = { feature: option.key, forInput: false }
                break;
            default:
                data = { forInput: false }
        }
        modal.show({ propsToChild: true, footer: "ref", width: '1200px', height: '700px', fullWidthDevice: 3, minFullHeight: 900, content: <FormFormulacao forInput={data.forInput} record={{ ...record, ...data }} /> });
    }

    return (
        <div style={{ height: '100%', ...menuItem.span && { gridColumn: `span ${menuItem.span}` } }}>
            <Card hoverable
                style={{ width: '100%', height: '100%', textAlign: 'center'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                title={<div style={{ fontWeight: 700, fontSize: "16px" }}>{menuItem.title}</div>}
            >
                <Button block size="large" onClick={() => navigate('/app/pick')}>Picar Matérias Primas</Button>
                <VerticalSpace height="5px" />
                <Button block size="large" onClick={() => navigate('/app/logslist/comsumptionneedloglist', { replace: true })}>Consumos de Lotes</Button>
                <VerticalSpace height="5px" />
                <Button block size="large" onClick={() => onClick("gamaoperatoria")}>Gama Operatória</Button>
                <VerticalSpace height="5px" />
                <Button block size="large" onClick={() => onClick("specs")}>Especificações</Button>
                <VerticalSpace height="5px" />
                <Button block size="large" onClick={() => navigate('/app/stocklistbuffer')}>Matérias Primas em Buffer</Button>
                <VerticalSpace height="5px" />
                <Button block size="large" onClick={() => navigate('/app/bobines/bobineslist')}>Bobines</Button>
                <VerticalSpace height="5px" />
                <Dropdown.Button trigger={["click"]} onClick={onMenuClick} overlay={<FormulacaoMenu onMenuClick={onMenuClick} />}>Formulação</Dropdown.Button>
            </Card>
        </div>
    );
}

const CardEventosLinha = ({ socket, menuItem, record, parentReload }) => {
    const [loading, setLoading] = useState(false);
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/lineloglist/`, parameters: {}, pagination: { enabled: false, limit: 20 }, filter: {}, sort: [{ column: 'id', direction: 'DESC' },] } });
    const modal = useModalv4();

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
        modal.show({
            propsToChild: true, width: "900px", height: "500px", buttons: ["cancel"], fullWidthDevice: 2, title: "Ordens de Fabrico", content: <OFabricoTimeLineShortList params={{ data: { id: ig_id, fim_ts, parentReload: reload } }} />
        });
        //Modalv4.show({
        //    propsToChild: true, width: "900px", height: "500px", fullWidthDevice: 2, title: "Ordens de Fabrico", content: <OFabricoTimeLineShortList params={{ data: { id: ig_id, fim_ts, parentReload: reload } }} />
        //});
    }
    const onView = () => {
        modal.show({ propsToChild: true, width: '1500px', height: '600px', minFullHeight: 800, content: <LineLogList /> })
        /*         Modalv4.show({
                    propsToChild: true, width: '1500px', height: '800px', minFullHeight: 800, content: <LineLogList />
                }); */
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

const SelectLotesAvailable = ({ onView, onChangeContent }) => {
    return (

        <Space>
            <Select defaultValue="default" style={{ width: 200 }} onChange={onChangeContent} dropdownMatchSelectWidth={false}>
                <Option value="default">Lotes disponíveis em Linha</Option>
                <Option value="groupartigo">Disponibilidade por Artigo</Option>
                <Option value="buffer">Lotes em Buffer e Reciclado</Option>
                <Option value="allconsumed">Lotes Totalmente Consumidos</Option>
            </Select>
            <Button onClick={(e) => { e.stopPropagation(); onView(); }} icon={<BiWindowOpen style={{ fontSize: "16px", marginTop: "4px" }} />} />
        </Space>



    );
}

const CardLotesAvailable = ({ socket, menuItem, record, parentReload }) => {
    const [loading, setLoading] = useState(false);
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/lotesavailable/`, parameters: { type: "default" }, pagination: { enabled: false, limit: 100 }, filter: {}, sort: [{ column: 'order', direction: 'ASC' }] } });
    const modal = useModalv4();

    useEffect(() => {
        const cancelFetch = cancelToken();
        //dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, [socket]);

    const handleWndClick = (r) => {
        //modal.show({ propsToChild: true, width: '1500px', height: '700px', minFullHeight: 800, title: `Validar e Classificar Bobinagem ${r.nome}`, content: <BobinesValidarList data={{ bobinagem_id: r.id, bobinagem_nome: r.nome }} /> })
        /*         Modalv4.show({
                    propsToChild: true, width: '1500px', height: '700px', minFullHeight: 800, title: `Validar e Classificar Bobinagem ${r.nome}`, content: <BobinesValidarList data={{ bobinagem_id: r.id, bobinagem_nome: r.nome }} />
                }); */
    }
    const onView = () => {
        //modal.show({ propsToChild: true, width: '1500px', height: '800px', minFullHeight: 800, content: <BobinagensValidarList /> });
        /*         Modalv4.show({
                    propsToChild: true, width: '1500px', height: '800px', minFullHeight: 800, content: <BobinagensValidarList />
                }); */
    }

    const selectionRowKey = (record) => {
        return `lot-${record.lote_id}`;
    }

    const onChangeContent = (v) => {
        switch (v) {
            case "buffer": break;
            case "groupartigo":
                dataAPI.addParameters({ type: v });
                dataAPI.fetchPost({});
                break;
            case "allconsumed": break;
            default: break;

        }
        console.log(v);
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "lotes_available",
            include: {
                ...((common) => (
                    {
                        ITMDES1_0: { title: "Artigo", width: 160, fixed: "left", render: (v, r) => v, ...common },
                        artigo_cod: { title: "cod", width: 100, fixed: "left", render: (v, r) => v, ...common },
                        n_lote: { title: "Lote", width: 100, fixed: "left", render: (v, r) => v, ...common },
                        qty_lote: { title: "Qtd. Lote", width: 100, fixed: "left", render: (v, r) => v, ...common },
                        qty_lote_consumed: { title: "Qtd. Consumida", width: 100, fixed: "left", render: (v, r) => v, ...common },
                        qty_lote_available: { title: "Qtd. Disponível", width: 100, fixed: "left", render: (v, r) => v, ...common },

                        // nome: { title: "Bobinagem", sort: false, width: 90, fixed: 'left', render: (v, r) => <span onClick={() => handleWndClick(r)} style={{ color: "#096dd9", cursor: "pointer" }}>{v}</span>, ...common },
                        /* data: { title: "Data", render: (v, r) => dayjs(v).format(DATE_FORMAT), ...common }, */
                        //inico: { title: "Início", sort: false, render: (v, r) => dayjs('01-01-1970 ' + v).format(TIME_FORMAT), ...common },
                        //fim: { title: "Fim", sort: false, render: (v, r) => dayjs('01-01-1970 ' + v).format(TIME_FORMAT), ...common },
                        //duracao: { title: "Duração", sort: false, width: 80, render: (v, r) => v, ...common },
                        //core: { title: "Core", sort: false, width: 35, render: (v, r) => v, ...common },
                        //comp: { title: "Comp.", sort: false, render: (v, r) => v, input: <InputNumber />, ...common },
                        //comp_par: { title: "Comp. Emenda", sort: false, render: (v, r) => v, ...common },
                        //comp_cli: { title: "Comp. Cliente", sort: false, render: (v, r) => v, ...common },
                        //area: { title: <span>Área m&#178;</span>, sort: false, render: (v, r) => v, ...common },
                        //diam: { title: "Diâmetro mm", sort: false, render: (v, r) => v, ...common },
                        //nwinf: { title: "Nw Inf. m", sort: false, render: (v, r) => v, ...common },
                        //nwsup: { title: "Nw Sup. m", sort: false, render: (v, r) => v, ...common }
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
                extra={<SelectLotesAvailable onChangeContent={onChangeContent} onView={onView} />}
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
    }, *//*  {
        idcard: "formulacao",
        title: "Formulação",
        span: 4
    }, */
    {
        idcard: "validarbobinagens",
        title: "Bobinagens para Validação",
        span: 4
    },
    {
        idcard: "cortes",
        title: "Cortes",
        span: 4
    },
    {
        idcard: "linelogs",
        title: "Eventos de Linha",
        span: 3
    }, ,
    {
        idcard: "lotesavailable",
        title: "Lotes em Linha",
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

export default (props) => {
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState({ show: false, type: 'modal', mode: "fullscreen" });
    const [guides, setGuides] = useState(false);
    const [currentSettings, setCurrentSettings] = useState({});
    const { data: dataSocket } = useContext(SocketContext) || {};

    useEffect(() => {
        if (dataSocket) {
            const cancelFetch = cancelToken();
            loadData({ aggId: props?.aggId, token: cancelFetch });
            return (() => cancelFetch.cancel("Form Actions Menu Cancelled"));
        }
    }, [dataSocket?.inproduction]);


    useEffect(() => {
        /*         console.log("FORM-AGG->", ctx) */
        const cancelFetch = cancelToken();
        loadData({ aggId: props?.aggId, token: cancelFetch });
        return (() => cancelFetch.cancel("Form Actions Menu Cancelled"));
    }, []);

    const loadData = (data = {}, type = "init") => {
        const { token } = data;
        let aggId = (data?.aggId) ? data.aggId : location?.state?.aggId;
        switch (type) {
            default:
                if (!loading) {
                    setLoading(true);
                }
                (async () => {
                    let raw = await loadCurrentSettings(aggId, token);
                    if (!raw[0]){return;}
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

                    console.log("###############", paletizacao)

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
            <Button onClick={() => navigate(-1, { state: { f: 1 } })}>Voltar</Button>
            {/*  <Modalv4 /> */}
            {/* <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar..."> */}
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
                            return (<CardPlanificacao socket={dataSocket?.inproduction} key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, planificacao, ofs, paletesstock }} setShowForm={setShowForm} parentReload={loadData} />);
                        case "lotes":
                            return (<CardLotes key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, formulacao, nonwovens, produto, quantity, lotes }} setShowForm={setShowForm} parentReload={loadData} />);
                        case "formulacao":
                            return (<CardFormulacao socket={dataSocket?.inproduction} key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, formulacao }} setShowForm={setShowForm} parentReload={loadData} />);
                        case "gamaoperatoria":
                            return (<CardGamaOperatoria socket={dataSocket?.inproduction} key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, gamaoperatoria }} setShowForm={setShowForm} parentReload={loadData} />);
                        case "especificacoes":
                            return (<CardArtigoSpecs socket={dataSocket?.inproduction} key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, artigospecs }} setShowForm={setShowForm} parentReload={loadData} />);
                        case "cortes":
                            return (<CardCortes socket={dataSocket?.inproduction} key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, cortes, cortesordem, agg_of_id: currentSettings.agg_of_id, ofs }} setShowForm={setShowForm} parentReload={loadData} />);
                        case "operacoes":
                            return (<CardOperacoes key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, agg_of_id: currentSettings.agg_of_id, status: currentSettings.status }} setShowForm={setShowForm} parentReload={loadData} />);
                        case "validarbobinagens":
                            return (<CardValidarBobinagens socket={dataSocket?.bobinagens} key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, agg_of_id: currentSettings.agg_of_id, ofs: currentSettings.ofs, status: currentSettings.status }} setShowForm={setShowForm} parentReload={loadData} />);
                        case "linelogs":
                            return (<CardEventosLinha socket={dataSocket?.igbobinagens} key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, agg_of_id: currentSettings.agg_of_id, status: currentSettings.status }} setShowForm={setShowForm} parentReload={loadData} />);
                        case "actions":
                            return (<CardActions socket={dataSocket?.inproduction} key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, agg_of_id: currentSettings.agg_of_id, status: currentSettings.status, formulacao, artigospecs, gamaoperatoria }} parentReload={loadData} />);
                        case "lotesavailable":
                            return (<CardLotesAvailable socket={dataSocket?.inproduction} key={`ct-${menuItem.idcard}-${idx}`} menuItem={menuItem} record={{ id: currentSettings.id, agg_of_id: currentSettings.agg_of_id, status: currentSettings.status }} parentReload={loadData} />);
                        default: <React.Fragment key={`ct-${idx}`} />
                    }
                })}
                {currentSettings.ofs.map((ofItem, idx) => {
                    return (<CardAgg key={`ct-agg-${idx}`} status={currentSettings.status} csid={currentSettings.id} cores={currentSettings.cores} paletizacao={currentSettings.paletizacao} ofItem={ofItem} emendas={currentSettings.emendas} setShowForm={setShowForm} paletesStock={currentSettings.paletesstock} />)
                })}
            </StyledGrid>}

            {/* {Object.keys(currentSettings).length > 0 && <StyledGrid style={{ marginTop: "15px" }}>
                {currentSettings.ofs.map((ofItem, idx) => {
                    return (<CardAgg key={`ct-agg-${idx}`} ofItem={ofItem} setShowForm={setShowForm} paletesStock={currentSettings.paletesstock} />)
                })}
            </StyledGrid>} */}



            {/*             </Spin> */}
        </>
    );
}