import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, validate } from "utils/schemaValidator";
import { API_URL, PAGE_TOOLBAR_HEIGHT } from "config";
import { Tabs, Form, Input, Button, Space, Collapse, InputNumber } from 'antd';
const { TabPane } = Tabs;
const { Panel } = Collapse;

import FormManager, { /* FieldLabel, TitleForm, Field, FieldItem, FieldSet, validateForm, useMessages, SelectField */ } from "components/form";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer } from "components/formLayout";

const FormTechnicalFeaturesx = ({ item }) => {
    const [formData, setFormData] = useState({

        cliente: item.BPCNAM_0

    });
    const [form] = Form.useForm(); //Características Técnicas

    console.log("=========>", item);

    return (
        <FormManager
            form={form}
            name="form-ct"
            layout="vertical"
            /*onFinish={onFinish}
            onValuesChange={onValuesChange}
            validation={validation}
            formMessages={formMessages}
            messages={messages}*/
            style={{ width: "1000px" }}
            formData={formData}
            rowGap="5px"
            field={{ wide: 8, layout: "vertical", gap: "5px", overflow: false, labelStyle: { /* width: "90px", align: "right", gap: "10px" */ }, alert: { position: "right", visible: true } }}
            fieldSet={{ wide: 10, layout: "vertical", overflow: false, grow: false, alert: { position: "bottom", visible: true } }}
        >
            {/* BPCNAM_0: "Active Medical Iberica, SL"
ITMDES1_0: "Nonwoven Elastic Bands ELA-ACE 100 HT L200 D1100 3''' "
ORIQTY_0: 4200
cod: "EEEEFTACPAAR000160"
core: "3"
diam_ref: 1100
formu: "HT"
gsm: "100"
gtin: "560084119079"
id: 80
lar: 200
nw1: "ELA-ACE"
nw2: null
ofaid: 15 */}

            <FieldSet>
                <Field name="cliente" label="Cliente" alert={{ position: "bottom", visible: true }}><Input disabled /></Field>
                <Field name="des" required={true}><Input /></Field>
            </FieldSet>
        </FormManager>
    );

}

const AddOn = styled.div`
    margin: 2px;
    background-color: #fafafa; 
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    align-self: center;
    text-align: center; 
    width: 45px; 
    font-weight: 500;
    font-size: 10px;
`;

const schemaTechnicalFeatures = (keys) => {
    return getSchema({
        bwi: Joi.number().positive().precision(2).label("Basis weight Inferior").required(),
        bws: Joi.number().positive().precision(2).label("Basis weight Superior"),
        tenpi: Joi.number().positive().precision(2).label("Tensile at peak CD").required(),
        tenps: Joi.number().positive().precision(2).label("Tensile at peak CD"),
        //bws: Joi.number().min(5).rule({ warn: true }).max(10)
    }, keys).unknown(true);
}


const FormTechnicalFeatures = ({ item }) => {
    const [form] = Form.useForm();
    const [guides, setGuides] = useState(false);

    const onFinish = (values) => {
        console.log(values);
    };

    return (
        <>
            <Space>
                <Button onClick={() => form.submit()}>Submit</Button>
                <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button>
            </Space>
            <div>{JSON.stringify(form.getFieldsError())}</div>
            <AlertsContainer id="el-external" />
            <Form form={form} name={`ftf-${item.id}`} onFinish={onFinish}>
                <FormLayout
                    id="L0"
                    guides={guides}
                    layout="vertical"
                    padding="0px"
                    style={{ width: "50%", minWidth: "700px" }}
                    schema={schemaTechnicalFeatures}
                    field={{
                        wide: [6, 2, 2, 1, '*'],
                        margin: "2px", overflow: false, guides: guides,
                        label: { enabled: false, pos: "top", align: "end", vAlign: "center", /* width: "80px", */ wrap: false, overflow: false, colon: true, ellipsis: true },
                        alert: { pos: "alert", tooltip: true, /* container:true, */ container:"el-external" },
                        layout: { top: {}, right: {}, center: {}, bottom: {}, left: {} },
                        required: true,
                        style:{alignSelf:"center"}
                    }}
                    fieldSet={{
                        guides: guides,
                        wide: 16, margin: "2px", layout: "horizontal", overflow: false,
                        layout: {} //Por definir
                    }}
                >
                    <FieldSet>
                        <LabelField text="Basis weight" />
                        <Field required={true} label={{ text: "Nu" }} name="bwi"><InputNumber size="small" /></Field>
                        <Field required={true} label={{ text: "other" }} name="bws"><Input size="small" /></Field>
                        <AddOn>gsm</AddOn>
                        <AlertsContainer main={true} />
                    </FieldSet>
                    <FieldSet>
                        <LabelField text="Tensile at peak CD" />
                        <Field required={true} name="tenpi"><Input size="small" /></Field>
                        <Field required={true} name="tenps"><Input size="small" /></Field>
                        <AddOn>N/25mm</AddOn>
                        <AlertsContainer main={true} />
                    </FieldSet>
                    <FieldSet>
                        <LabelField text="Elongation at break CD" />
                        <Field required={true} name="elonbi"><Input size="small" /></Field>
                        <Field required={true} name="elonbs"><Input size="small" /></Field>
                        <AddOn>%</AddOn>
                    </FieldSet>
                    <FieldSet>
                        <LabelField text="Elongation at 9.81N CD" />
                        <Field required={true} name="eloni"><Input size="small" /></Field>
                        <Field required={true} name="elons"><Input size="small" /></Field>
                        <AddOn>%</AddOn>
                    </FieldSet>
                    <FieldSet>
                        <LabelField text="Load at 5% elongation 1st cycle CD" />
                        <Field required={true} name="load5i"><Input size="small" /></Field>
                        <Field required={true} name="load5s"><Input size="small" /></Field>
                        <AddOn>N/50mm</AddOn>
                    </FieldSet>
                    <FieldSet>
                        <LabelField text="Load at 10% elongation 1st cycle CD" />
                        <Field required={true} name="load10i"><Input size="small" /></Field>
                        <Field required={true} name="load10s"><Input size="small" /></Field>
                        <AddOn>N/50mm</AddOn>
                    </FieldSet>
                    <FieldSet>
                        <LabelField text="Load at 20% elongation 1st cycle CD" />
                        <Field required={true} name="load20i"><Input size="small" /></Field>
                        <Field required={true} name="load20s"><Input size="small" /></Field>
                        <AddOn>N/50mm</AddOn>
                    </FieldSet>
                    <FieldSet>
                        <LabelField text="Load at 50% elongation 1st cycle CD" />
                        <Field required={true} name="load50i"><Input size="small" /></Field>
                        <Field required={true} name="load50s"><Input size="small" /></Field>
                        <AddOn>N/50mm</AddOn>
                    </FieldSet>
                    <FieldSet>
                        <LabelField text="Permanent set 2nd cycle" />
                        <Field required={true} name="pset2i"><Input size="small" /></Field>
                        <Field required={true} name="pset2s"><Input size="small" /></Field>
                        <AddOn>%</AddOn>
                    </FieldSet>
                    <FieldSet>
                        <LabelField text="Load at 100% elongation 2nd cycle" />
                        <Field required={true} name="load2ci"><Input size="small" /></Field>
                        <Field required={true} name="load2cs"><Input size="small" /></Field>
                        <AddOn>N/50mm</AddOn>
                    </FieldSet>
                    <FieldSet>
                        <LabelField text="Permanent set 3rd cycle" />
                        <Field required={true} name="pset3i"><Input size="small" /></Field>
                        <Field required={true} name="pset3s"><Input size="small" /></Field>
                        <AddOn>%</AddOn>
                    </FieldSet>
                    <FieldSet>
                        <LabelField text="Load at 100% elongation 3rd cycle" />
                        <Field required={true} name="load3ci"><Input size="small" /></Field>
                        <Field required={true} name="load3cs"><Input size="small" /></Field>
                        <AddOn>N/50mm</AddOn>
                    </FieldSet>
                    <FieldSet>
                        <LabelField text="Lamination strenght (CD)" />
                        <Field required={true} name="lsi"><Input size="small" /></Field>
                        <Field required={true} name="lss"><Input size="small" /></Field>
                        <AddOn>N/25mm</AddOn>
                    </FieldSet>
                </FormLayout>
            </Form>
        </>
    );
}

const FormFichaProcesso = ({ item }) => {
    return (
        <Collapse bordered={false} defaultActiveKey={['1']}>
            <Panel header="Formulação" key="1">

            </Panel>
            <Panel header="Nonwoven Inferior Gama Operatória" key="2">

            </Panel>
            <Panel header="Nonwoven Superior Gama Operatória" key="3">

            </Panel>
        </Collapse>
    );
}

const ItemForm = ({ item }) => {
    return (
        <Tabs tabPosition="top" type="card">
            <TabPane tab="Características Técnicas" key="1">
                <FormTechnicalFeatures item={item} />
            </TabPane>
            <TabPane tab="Ficha de Processo" key="2">
                <FormFichaProcesso item={item} />
            </TabPane>
            <TabPane tab="Paletização" key="3">
                {item.ITMDES1_0}
            </TabPane>
        </Tabs>
    );
}


const TitleItemTabName = ({ value }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", width: "350px", background: "#fafafa", alignItems: "flex-end", border: "1px solid #dee2e6", borderRadius: "3px", padding: "5px" }}>
            <div style={{ color: "#0050b3", fontSize: "12px", lineHeight: "20px", fontWeight: 600 }}>{value.BPCNAM_0}</div>
            <div style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 500 }}>{value.cod}</div>
            <div style={{ fontSize: "10px", lineHeight: "18px", fontWeight: 400 }}>{value.ITMDES1_0}</div>
        </div>
    );
}

const TitleTabName = ({ value }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: 1, width: "350px", border: "1px solid #dee2e6", borderRadius: "3px", padding: "5px" }}>
            <div>{value}</div>
        </div>
    );
}

export default (props) => {
    const { state } = useLocation();
    const [items, setItems] = useState([]);
    const id = (props.id) ? props.id : state.id;

    const fetchArtigos = async (id) => {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/ofartigoslist/`, pagination: { enabled: false }, filter: { ["id"]: id } });
        return rows;
    }

    useEffect(() => {
        (async () => {
            const items = await fetchArtigos(id);
            setItems(items);
        })();
    }, []);

    return (
        <>
            {items.length > 0 &&
                <Tabs tabPosition="left" style={{ height: `calc(100vh - ${PAGE_TOOLBAR_HEIGHT})` }}>
                    <TabPane tab={<TitleTabName value="Geral" />} key={`tp-geral`}>
                    </TabPane>
                    {items.map((v) => (
                        <TabPane tab={<TitleItemTabName value={v} />} key={`itm-${v.ofaid}`}>
                            <ItemForm item={v} />
                        </TabPane>
                    ))}
                </Tabs>
            }
        </>
    );

}