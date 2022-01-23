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
import { Button, Spin, Tag, List, Typography, Form, InputNumber, Input, Card, Collapse } from "antd";
const { Panel } = Collapse;
import { LoadingOutlined, EditOutlined, PlusOutlined, EllipsisOutlined, SettingOutlined, PaperClipOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT, THICKNESS } from 'config';
import FormAggUpsert from '../agg/FormAggUpsert';
const FormPaletesStockUpsert = React.lazy(() => import('../paletesStock/FormPaletesStockUpsert'));
const FormPaletizacao = React.lazy(() => import('./FormPaletizacao'));
const FormSettings = React.lazy(() => import('./FormSettings'));
const FormAttachments = React.lazy(() => import('./FormAttachments'));
import { remove } from 'ramda';
import { MdProductionQuantityLimits } from 'react-icons/md';
import { FaPallet, FaWarehouse, FaTape } from 'react-icons/fa';

import { OFabricoContext } from '../ordemFabrico/FormOFabricoValidar';
import SvgSchema from '../paletizacaoSchema/SvgSchema';

const StyledCard = styled(Card)`
    .ant-card-body{
        height:350px;
        max-height:500px; 
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



const Drawer = ({ showWrapper, setShowWrapper, parentReload }) => {
    const [formTitle, setFormTitle] = useState({});
    const iref = useRef();
    const { record = {} } = showWrapper;
    const onVisible = () => {
        setShowWrapper(prev => ({ ...prev, show: !prev.show }));
    }
    return (
        <WrapperForm
            title={<TitleForm title={formTitle.title} subTitle={formTitle.subTitle} />}
            type={showWrapper.mode}
            destroyOnClose={true}
            width={800}
            mask={true}
            /* style={{ maginTop: "48px" }} */
            setVisible={onVisible}
            visible={showWrapper.show}
            bodyStyle={{ height: "450px" /*  paddingBottom: 80 *//* , overflowY: "auto", minHeight: "350px", maxHeight: "calc(100vh - 50px)" */ }}
            footer={<div ref={iref} id="form-wrapper" style={{ textAlign: 'right' }}></div>}
        >
            <YScroll>
                {!showWrapper.type && <FormAggUpsert setFormTitle={setFormTitle} /* record={record} */ parentRef={iref} closeParent={onVisible} parentReload={parentReload} />}
                {showWrapper.type === "paletes_stock" && <Suspense fallback={<></>}><FormPaletesStockUpsert setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.type === "schema" && <Suspense fallback={<></>}><FormPaletizacao setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.type === "settings" && <Suspense fallback={<></>}><FormSettings setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
                {showWrapper.type === "attachments" && <Suspense fallback={<></>}><FormAttachments setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} /></Suspense>}
            </YScroll>
        </WrapperForm>
    );
}

const loadAggsLookup = async (produto_id, token) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/tempaggofabricolookup/`, filter: { status: 6, produto_id }, sort: [], cancelToken: token });
    return rows;
}

const loadPaletesGet = async (tempof_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/paletesstockget/`, parameters: {}, pagination: { enabled: false }, filter: { of_id: tempof_id }, sort: [] });
    return rows;
}

const PaletesStock = ({ item }) => {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", flexDirection: "row-reverse" }}>
            {item.paletesstock && item.paletesstock.map((v, idx) => { return <div style={{ flex: "1 1 80px" }} key={`ps-${item.tempof_id}-${idx}`}>{v}</div> })}
        </div>
    )
}

const CardAgg = ({ aggItem, setShowForm, /* aggItem */ of_id }) => {
    const paletes = JSON.parse(aggItem?.n_paletes);
    const onAction = (op) => {
        switch (op) {
            case 'paletes_stock':
                setShowForm(prev => ({ ...prev, type: op, mode: "drawer", show: !prev.show, record: { /* aggItem, */ aggItem, of_id } }));
                break;
            case 'schema':
                setShowForm(prev => ({ ...prev, type: op, mode: "drawer", show: !prev.show, record: { /* aggItem, */ aggItem, of_id } }));
                break;
            case 'settings':
                setShowForm(prev => ({ ...prev, type: op, mode: "drawer", show: !prev.show, record: { /* aggItem, */ aggItem, of_id } }));
                break;
            case 'attachments':
                setShowForm(prev => ({ ...prev, type: op, mode: "drawer", show: !prev.show, record: { /* aggItem, */ aggItem, of_id } }));
                break;
        }
    }

    return (


        <List.Item>
            <StyledCard hoverable
                style={{ width: '100%'/* , height:"300px", maxHeight:"400px", overflowY:"auto" */ }}
                headStyle={{ backgroundColor: "#002766", color: "#fff" }}
                title={<div>
                    <div style={{ fontWeight: 700, fontSize: "14px" }}>{aggItem.of_id}</div>
                    <div style={{ color: "#fff", fontSize: ".7rem" }}>{aggItem.item_cod} - {aggItem.cliente_nome}</div>
                </div>} size="small"
                actions={[
                    <div key="settings" onClick={() => onAction('settings')} title="Outras definições">Definições</div>,
                    /* <FaPallet key="schema" onClick={() => onAction('schema')} title="Paletização (Esquema)" />, */
                    /* <FaWarehouse key="paletes" onClick={() => onAction('paletes_stock')} title="Paletes em Stock" />, */
                    <div key="schema" onClick={() => onAction('schema')} title="Paletização (Esquema)">Paletização</div>,
                    <div key="paletes" onClick={() => onAction('paletes_stock')}>Stock</div>,
                    <div key="attachments" onClick={() => onAction('attachments')}><span><PaperClipOutlined />Anexos</span></div>
                    /* <div key="quantity" onClick={() => onAction('quantity')} title="Quantidades">Quantidades</div> */
                    /*<SettingOutlined key="settings" onClick={() => onAction('settings')} title="Outras definições" />,*/
                    /*<MdProductionQuantityLimits key="quantity" onClick={() => onAction('quantity')} title="Quantidades" />*/
                    /*                     <EditOutlined key="edit" />,
                                        <EllipsisOutlined key="ellipsis" />, */
                ]}
            >
                <YScroll>
                    <FieldSet wide={16} margin={false} layout="vertical">
                        <StyledCollapse defaultActiveKey={['1']} expandIconPosition="right" bordered>
                            <Panel header={<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%" }}><div><b>Encomenda</b></div><div>{aggItem.qty_encomenda} m&#178;</div></div>} key="1">
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{aggItem.linear_meters.toFixed(2)}</div><div>m/bobine</div></div>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{aggItem.sqm_bobine.toFixed(2)}</div><div>m&#178;/bobine</div></div>
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{(aggItem.qty_encomenda / aggItem.sqm_bobine).toFixed(2)}</div><div>bobines</div></div>
                                {paletes?.items && <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{paletes.total.n_paletes.toFixed(2)}</div><div>paletes</div></div>}
                                {paletes?.items && <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{paletes.total.sqm_contentor.toFixed(2)}</div><div>m&#178;/contentor</div></div>}
                                {paletes?.items && <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>{(aggItem.qty_encomenda / paletes.total.sqm_contentor).toFixed(2)}</div><div>contentores</div></div>}
                            </Panel>
                            <Panel header={<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%" }}><div><b>Paletização</b></div></div>} key="2">
                                {paletes?.items && paletes.items.map((v, idx) => {
                                    return (
                                        <div style={{ borderBottom: "20px" }} key={`pc-${aggItem.name}-${v.id}`}>
                                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", borderBottom: "solid 1px #d9d9d9" }}><div><b>Palete</b> {idx + 1}</div><div><b>Bobines</b> {v.num_bobines}</div></div>
                                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div style={{ color: "#595959" }}>m&#178;</div><div>{v.sqm_palete.toFixed(2)}</div></div>
                                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div style={{ color: "#595959" }}>Nº Paletes</div><div>{(paletes.total.n_paletes / paletes.items.length).toFixed(2)}</div></div>
                                        </div>
                                    );
                                })}
                                <SvgSchema items={aggItem} width="100%" height="100%" />
                            </Panel>
                            {aggItem?.paletesstock?.length && <Panel header={<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%" }}><div><b>{aggItem?.paletesstock?.length} Paletes de Stock</b></div></div>} key="3">
                                <div style={{ height: "150px", overflowY: "hidden" }}>
                                    <YScroll>
                                        <PaletesStock item={aggItem} />
                                    </YScroll>
                                </div>
                            </Panel>
                            }
                        </StyledCollapse>

                    </FieldSet>
                </YScroll>


            </StyledCard>
        </List.Item>


    );
}

export default ({ /* changedValues */ }) => {
    const { form, guides, schema, ...ctx } = useContext(OFabricoContext);
    //temp_ofabrico_agg, item_id, form, guides, schema

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState({ show: false, type: null });
    const [aggs, setAggs] = useState([]);
    const [aggId, setAggId] = useState();


    useEffect(() => {
        /*         console.log("FORM-AGG->", ctx) */
        const cancelFetch = cancelToken();
        loadData({ agg_id: ctx.agg_id, token: cancelFetch });
        return (() => cancelFetch.cancel("Form Agg Cancelled"));
    }, []);

    /*     useEffect(() => {
            const cancelFetch = cancelToken();
            if (changedValues) {
                console.log("CHANGED",changedValues)
                if ("agg_id" in changedValues) {
                    setLoading(true);
                    loadData({ agg_id: changedValues.agg_id, token: cancelFetch });
                }
            }
            return (() => cancelFetch.cancel("Form Agg Cancelled"));
        }, [changedValues]); */

    const loadData = (data = {}, type = "init") => {
        const { agg_id, token } = data;
        switch (type) {
            case "lookup":
                setLoading(true);
                (async () => {
                    setAggs(await loadAggsLookup(ctx.produto_id, token));
                    setLoading(false);
                })();
                break;
            default:
                if (!loading) {
                    setLoading(true);
                }
                (async () => {
                    let _aggs = await loadAggsLookup(ctx.produto_id, token);
                    setAggs(_aggs);
                    console.log("LOAD-DATA-AGG",agg_id)
                    if (agg_id && _aggs[0]?.v) {
                        //const { id, group_id, group_ofid, group_item_cod, group_qty_item } = _aggs[0].v.filter(v => v.id == agg_of_id)[0];
                        const ret = _aggs[0].v.filter(v => v.id == agg_id);
                        //setAggId({ id, group_id: group_id.split(','), group_ofid: group_ofid.split(','), group_item_cod: group_item_cod.split(','), group_qty_item: group_qty_item.split(',') });
                        console.log("CHANGED", _aggs[0].v.filter(v => v.id == agg_id))
                        setAggId(_aggs[0].v.filter(v => v.id == agg_id));
                        //console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxx", { id, group_id: group_id.split(','), group_ofid: group_ofid.split(','), group_item_cod: group_item_cod.split(','), group_qty_item: group_qty_item.split(',') });
                        //form.setFieldsValue({ thikness: THICKNESS });
                        // let [artigoSpecs] = _artigosspecs.filter(v => v.id === artigospecs_id);
                        // const artigoSpecsItems = await getArtigoSpecsItems({ artigospecs_id });
                        // const fieldsValue = { nitems: artigoSpecsItems.length };
                        // for (let [i, v] of artigoSpecsItems.entries()) {
                        //     fieldsValue[`key-${i}`] = v.item_key;
                        //     fieldsValue[`des-${i}`] = v.item_des;
                        //     const vals = (typeof v.item_values === "string") ? JSON.parse(v.item_values) : v.item_values;
                        //     for (let [iV, vV] of vals.entries()) {
                        //         fieldsValue[`v${v.item_key}-${iV}`] = vV;
                        //     }
                        // }
                        // artigoSpecs = { ...artigoSpecs, cliente_cod: { key: artigoSpecs.cliente_cod, value: artigoSpecs.cliente_cod, label: artigoSpecs.cliente_nome } };
                        // form.setFieldsValue({ artigoSpecs, artigoSpecsItems: fieldsValue });
                    }
                    setLoading(false);
                })();
        }
    }

    const onShowForm = (/* newForm = false */) => {
        /* const { produto_id, produto_cod, ofabrico, temp_ofabrico_agg, temp_ofabrico } = ctx; */
        /* if (newForm) { */
        setShowForm(prev => ({ ...prev, type: null, show: !prev.show, /* record: { produto_id, produto_cod, ofabrico, temp_ofabrico_agg, temp_ofabrico } */ }));
        /* } else { */
        //setShowForm(prev => ({ ...prev, show: !prev.show, record: { ...form.getFieldsValue(true) } }));
        /* } */
    }

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                <Drawer showWrapper={showForm} setShowWrapper={setShowForm} parentReload={loadData} />
                <FormLayout
                    id="LAY-AGGS"
                    guides={guides}
                    layout="vertical"
                    style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{
                        //wide: [3, 2, 1, '*'],
                        margin: "2px", overflow: false, guides: guides,
                        label: { enabled: true, pos: "top", align: "start", vAlign: "center", width: "180px", wrap: false, overflow: false, colon: true, ellipsis: true },
                        alert: { pos: "right", tooltip: true, container: true /* container: "el-external" */ },
                        layout: { top: "", right: "", center: "", bottom: "", left: "" },
                        addons: {}, //top|right|center|bottom|left
                        required: true,
                        style: { alignSelf: "top" }
                    }}
                    fieldSet={{
                        guides: guides,
                        wide: 16, margin: "2px", layout: "horizontal", overflow: false
                    }}
                >
                    <FieldSet margin={false}>
                        <Toolbar
                            style={{ width: "100%" }}
                            /* left={<FieldSet>
                                <Field name="thikness" wide={11} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, width: "100px", text: "Espessura", pos: "left" }}>
                                    <SelectField size="small" data={THICKNESS} keyField="t" textField="t"
                                        optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ minWidth: "100px" }}><b>{d[textField]} &#x00B5;</b></div></div>, value: d[keyField] })}
                                    />
                                </Field>
                            </FieldSet>} */
                            right={<Button onClick={() => onShowForm()}>Agrupar</Button>}
                        />
                    </FieldSet>

                    <FieldSet margin={false}>
                        {aggId &&
                            /*                             <Form.List name="agg" initialValue={aggId}>
                                                            {(fields, { add, remove, move }) => {
                                                                return ( */
                            <List
                                style={{ width: "100%" }}
                                grid={{
                                    gutter: 16,
                                    xs: 1,
                                    sm: 1,
                                    md: 2,
                                    lg: 2,
                                    xl: 2,
                                    xxl: 2,
                                }}
                                size="small"
                                dataSource={aggId}
                                renderItem={aggItem => {
                                    return (<CardAgg aggItem={aggItem} /* aggItem={aggId[item.name]} */ of_id={ctx.of_id} setShowForm={setShowForm} />);
                                }}
                            >
                            </List>
                            /*                                     )
                                                            }}
                                                        </Form.List> */
                        }
                    </FieldSet>



                </FormLayout>
            </Spin>
        </>
    );
}