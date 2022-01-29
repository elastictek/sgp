import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { noValue } from "utils";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule } from "components/formLayout";
import Toolbar from "components/toolbar";
import { Button, Spin, Input, Skeleton, Tooltip, InputNumber, DatePicker, TimePicker } from "antd";
const { TextArea } = Input;
import { LoadingOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT, THICKNESS, ENROLAMENTO_OPTIONS, TIPOEMENDA_OPTIONS } from 'config';
import FormNonwovens from './FormNonwovens';
import { dateTimeDiffValidator } from "utils/schemaValidator";
import { OFabricoContext } from './FormOFabricoValidar';
import { MediaContext } from '../../App';


const loadArtigoDetail = async ({ item_cod, item_nome, produto_cod }, token) => {
    let artigo = {};
    let exists = false;
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellitemsdetailsget/`, filter: { "cod": item_cod }, cancelToken: token });

    if (rows.length > 0) {
        exists = true;
        artigo = {
            "artigo_id": rows[0].id,
            "artigo_nw1": rows[0].nw1,
            "artigo_nw2": rows[0].nw2,
            "artigo_width": rows[0].lar,
            "artigo_formula": rows[0].formu,
            "artigo_diam": rows[0].diam_ref,
            "artigo_core": rows[0].core,
            "artigo_gram": rows[0].gsm,
            "artigo_gtin": rows[0].gtin,
            "artigo_thickness": rows[0].thickness,
            "produto_cod": rows[0].produto_cod,
        };
    } else {
        const designacao = item_nome.split(' ').reverse();
        artigo["produto_cod"] = produto_cod;
        artigo["artigo_thickness"] = THICKNESS;
        for (let v of designacao) {
            if (v.includes("''") || v.includes("'")) {
                artigo["artigo_core"] = v.replaceAll("'", "");
                continue;
            }
            if (v.toLowerCase().startsWith('l')) {
                artigo["artigo_width"] = v.toLowerCase().replaceAll("l", "");
                continue;
            }
            if (v.toLowerCase().startsWith('d')) {
                artigo["artigo_diam"] = v.toLowerCase().replaceAll("d", "");
                continue;
            }
            if (v.toLowerCase().startsWith('g') || (!isNaN(v) && Number.isInteger(parseFloat(v)))) {
                artigo["artigo_gram"] = v.toLowerCase().replaceAll("g", "");
                continue;
            }
        }
    }
    return { artigo, exists };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

export default ({ /* record, form, guides, schema, */ changedValues, /* nonwovensChangedValues, fieldStatus */ }) => {
    const { form, guides, schema, fieldStatus, ...ctx } = useContext(OFabricoContext);
    /* const mediaCtx = useContext(MediaContext); */

    const [loading, setLoading] = useState(true);
    const [coresLookup, setCoresLookup] = useState([]);
    const [artigoExists, setArtigoExists] = useState(true);

    useEffect(() => {
        const cancelFetch = cancelToken();
        loadData({ token: cancelFetch });
        /* const { item } = record;
        loadData({ artigospecs_id: id, item }); */
        return (() => cancelFetch.cancel("Form Requirements Cancelled"));
    }, []);

    useEffect(() => {
        if (changedValues) {
            /* if ("start_date" in changedValues || "start_hour" in changedValues || "end_date" in changedValues || "end_hour" in changedValues) {
                const { start_date, start_hour, end_date, end_hour } = form.getFieldsValue(true);
                setFieldStatus(dateTimeDiffValidator(start_date, start_hour, end_date, end_hour).fields);
            } */
        }
    }, [changedValues]);

    const loadData = ({ token }, type = "init") => {
        switch (type) {
            case "lookup":
                setLoading(true);
                (async () => {
                    setLoading(false);
                })();
                break;
            default:
                if (!loading) {
                    setLoading(true);
                }
                (async () => {
                    const { artigo, exists } = await loadArtigoDetail(ctx, token);
                    artigo["qty_item"] = ctx.qty_item;
                    await sleep(250);
                    setArtigoExists(exists);
                    const plan = {
                        start_prev_date: dayjs(noValue(form.getFieldValue("start_prev_date"), ctx.sage_start_date), 'YYYY-MM-DD HH:mm'),
                        end_prev_date: dayjs(noValue(form.getFieldValue("end_prev_date"), ctx.sage_end_date), 'YYYY-MM-DD HH:mm'),
                        f_amostragem:(form.getFieldValue("amostragem")) ? form.getFieldValue("amostragem") : 4,
                        sentido_enrolamento:form.getFieldValue("sentido_enrolamento") ? parseInt(form.getFieldValue("sentido_enrolamento")) : 1,
                        observacoes:form.getFieldValue("observacoes") ? form.getFieldValue("observacoes") : ''
                    }
                    form.setFieldsValue({ ...artigo, ...plan });
                    setLoading(false);
                })();
        }
    }

    return (
        <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
            {!loading &&
                <>
                    <FormLayout
                        id="LAY-REQ"
                        guides={guides}
                        layout="vertical"
                        style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                        schema={schema}
                        fieldStatus={fieldStatus}
                        field={{
                            wide: [4, 4, '*'],
                            margin: "2px", overflow: true, guides: guides,
                            label: { enabled: true, pos: "top", align: "start", vAlign: "center", /* width: "80px", */ wrap: false, overflow: false, colon: false, ellipsis: true },
                            alert: { pos: "alert", tooltip: false, container: true, /* container: "el-external"*/ },
                            layout: { top: "", right: "", center: "align-self: center;", bottom: "", left: "" },
                            required: true,
                            style: { alignSelf: "center" }
                        }}
                        fieldSet={{
                            guides: guides,
                            wide: 16, margin: false, layout: "horizontal", overflow: false
                        }}
                    >
                        <FieldSet margin={false} layout="vertical">
                            <HorizontalRule title="1. Artigo" description={form.getFieldValue("produto_cod")} />
                            {/* <FieldSet margin={false}>
                                <Field wide={16} forInput={false} required={false} label={{ text: "Produto" }} name="produto_cod"><Input size="small" /></Field>
                            </FieldSet> */}
                            <FieldSet>
                                <Field forInput={!artigoExists} required={false} label={{ text: "Gtin" }} name="artigo_gtin"><Input size="small" /></Field>
                                <AlertsContainer style={{ alignSelf: "end", paddingBottom: "2px" }} main={true} />
                            </FieldSet>
                            <FieldSet field={{ wide: [2, 2, 1, 2, 2, '*'] }}>
                                <Field forInput={!artigoExists} required={false} label={{ text: "Largura" }} name="artigo_width"><InputAddon size="small" addonAfter={<b>mm</b>} maxLength={4} /></Field>
                                <Field forInput={!artigoExists} required={false} label={{ text: "Diâmetro" }} name="artigo_diam"><InputAddon size="small" addonAfter={<b>mm</b>} maxLength={4} /></Field>
                                <Field forInput={!artigoExists} required={false} label={{ text: "Core" }} name="artigo_core"><InputAddon size="small" addonAfter={<b>''</b>} maxLength={1} /></Field>
                                <Field forInput={!artigoExists} required={false} label={{ text: "Gramagem" }} name="artigo_gram"><InputAddon size="small" addonAfter={<b>gsm</b>} maxLength={4} /></Field>
                                <Field forInput={!artigoExists} required={false}
                                    label={{
                                        text: <Tooltip title="A espessura é usada como valor de referência, na conversão de metros&#xB2; -> metros lineares." color="blue">
                                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "3px" }}>Espessura<InfoCircleOutlined style={{ color: "#096dd9" }} /></div>
                                        </Tooltip>
                                    }}
                                    name="artigo_thickness">
                                    <InputAddon size="small" addonAfter={<b>&#x00B5;</b>} maxLength={4} />
                                </Field>
                                <AlertsContainer style={{ alignSelf: "end", paddingBottom: "2px" }} main={true} />
                            </FieldSet>
                        </FieldSet>
                        <VerticalSpace />
{/*                         <HorizontalRule title="2. Encomenda" />
                        <FieldSet margin={false}>
                            <Field wide={3} forInput={false} required={false} label={{ text: "Qtd. Encomenda" }} name="qty_item"><InputAddon size="small" addonAfter={<b>m&#178;</b>} maxLength={4} /></Field>
                            <Field wide={3} forInput={false} required={false} label={{ text: "Metros/Bobine" }} name="linear_meters"><InputAddon size="small" addonAfter={<b>m</b>} maxLength={4} /></Field>
                            <Field wide={3} forInput={false} required={false} label={{ text: <span>Metros&#178;/Bobine</span> }} name="sqm_bobine"><InputAddon size="small" addonAfter={<b>m&#178;</b>} maxLength={4} /></Field>
                            <Field wide={2} forInput={false} required={false} label={{ text: "Nº Bobines" }} name="nbobines"><InputNumber size="small" min={1} max={10000} /></Field>
                        </FieldSet>
                        <VerticalSpace /> */}
                        <HorizontalRule title="2. Planificação" />
                        <FieldSet field={{ wide: [3, 3, 4], label: { pos: "top", wrap: true, ellipsis: false, width: "130px" } }}>
                            <Field required={true} label={{ text: "Data Prevista Início" }} name="start_prev_date"><DatePicker showTime size="small" format="YYYY-MM-DD HH:mm"/></Field>
                            <Field required={true} label={{ text: "Data Prevista Fim" }} name="end_prev_date"><DatePicker showTime size="small" format="YYYY-MM-DD HH:mm"/></Field>
                            <AlertsContainer style={{ alignSelf: "end", paddingBottom: "6px" }} main={true} />
                        </FieldSet>
                        {/* <FieldSet field={{ wide: [3, 3, 4], label: { pos: "top", wrap: true, ellipsis: false, width: "130px" } }}>
                            <Field required={true} label={{ text: "Data Início" }} name="start_date"><DatePicker showTime size="small" /></Field>
                            <Field required={true} label={{ text: "Data Fim" }} name="end_date"><DatePicker showTime size="small" /></Field>
                            <AlertsContainer style={{ alignSelf: "end", paddingBottom: "6px" }} main={true} />
                        </FieldSet> */}
                        {/*                         <VerticalSpace />
                        <HorizontalRule title="4. Core" />
                        <VerticalSpace />
                        <FieldSet margin={false}>
                            <Field wide={[10]} name="core_cod" label={{ enabled: false, text: "Core", pos: "top" }} required={false}>
                                <SelectField size="small" data={coresLookup} keyField="ITMREF_0" textField="ITMDES1_0"
                                    optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                    showSearch
                                    labelInValue
                                    filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                />
                            </Field>
                        </FieldSet> */}
                        <VerticalSpace />
                        {/* <HorizontalRule title="4. Emendas" />
                        <VerticalSpace />
                        <FieldSet margin={false} field={{ wide: 4, style: { alignSelf: "left" }, label: { pos: "top", wrap: false, ellipsis: false, width: "130px" } }} layout="vertical">
                            <Field name="tipo_emenda" label={{ text: "Tipo Emenda" }}>
                                <SelectField size="small" data={TIPOEMENDA_OPTIONS} keyField="value" textField="label"
                                    optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                />
                            </Field>
                            <FieldSet margin={false}>
                                <Field wide={2} name="maximo" label={{ text: "Máximo" }}><InputNumber size="small" addonAfter={<b>%</b>} min={0} max={100} /></Field>
                                <Field wide={2} label={{ text: "Emendas/Rolo" }} name="nemendas_rolo"><InputNumber size="small" min={0} max={100} /></Field>
                                <Field wide={2} overflow={true} label={{ text: "Paletes/Contentor" }} name="nemendas_paletescontentor"><InputNumber size="small" min={0} max={100} /></Field>
                            </FieldSet>
                        </FieldSet>
                        <VerticalSpace /> */}
                        <HorizontalRule title="3. Amostragem, Enrolamento e Observações" />
                        <VerticalSpace />
                        <FieldSet margin={false} field={{ wide: 4, style: { alignSelf: "left" }, label: { pos: "top", wrap: false, ellipsis: false, width: "130px" } }} layout="vertical">
                            <FieldSet margin={false}>
                                <Field wide={4} name="sentido_enrolamento" label={{ enabled: true, text: "Sentido Enrolamento" }}>
                                    <SelectField size="small" data={ENROLAMENTO_OPTIONS} keyField="value" textField="label"
                                        optionsRender={(d, keyField, textField) => ({ label: d[textField], value: d[keyField] })}
                                    />
                                </Field>
                                <Field wide={2} label={{ text: "Amostragem" }} name="f_amostragem"><InputNumber size="small" min={0} max={100} /></Field>
                            </FieldSet>
                            <Field required={false} wide={16} label={{ text: "Observações" }} name="observacoes"><TextArea autoSize={{ minRows: 4, maxRows: 6 }} allowClear maxLength={3000} /></Field>
                        </FieldSet>
                    </FormLayout>
                    {/* <FormNonwovens forInput={false} id={form.getFieldValue("nonwovens_id")} record={record} form={form} guides={guides} schema={schema} changedValues={nonwovensChangedValues} /> */}



                </>
            }
        </Spin >
    );
}