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
import { remove } from 'ramda';
import { MdProductionQuantityLimits } from 'react-icons/md';
import { FaPallet, FaWarehouse, FaTape } from 'react-icons/fa';


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

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

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

export default ({ aggId }) => {

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState({ show: false, type: null });
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

                    console.log("################...", { formulacao, gamaoperatoria, nonwovens, artigospecs, cortes, cortesordem, cores, emendas, ofs, paletizacao, status: raw[0].status })


                    setCurrentSettings({ formulacao, gamaoperatoria, nonwovens, artigospecs, cortes, cortesordem, cores, emendas, ofs, paletizacao, status: raw[0].status });
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
                <FormLayout
                    id="LAY-MENU-ACTIONS"
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
                    {/*                     <FieldSet margin={false}>
                        <Toolbar
                            style={{ width: "100%" }}
                            right={<Button onClick={() => onShowForm()}>Agrupar</Button>}
                        />
                    </FieldSet>

                    <FieldSet margin={false}>
                        {aggId &&
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
                                    return (<CardAgg aggItem={aggItem} of_id={ctx.of_id} setShowForm={setShowForm} />);
                                }}
                            >
                            </List>
                        }
                    </FieldSet> */}
                </FormLayout>
            </Spin>
        </>
    );
}