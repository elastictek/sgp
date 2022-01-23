import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { hasValue, deepMerge } from "utils";
import { getSchema } from "utils/schemaValidator";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon } from "components/formLayout";
import Tabs, { TabPane } from "components/Tabs";
import AlertMessages from "components/alertMessages";
import ResultMessage from 'components/resultMessage';
import IconButton from "components/iconButton";
import Portal from "components/portal";
import { Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, DatePicker, InputNumber, TimePicker, Spin } from "antd";
const { Option, OptGroup } = Select;
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { CgRemove } from 'react-icons/cg';
import { DATE_FORMAT, DATETIME_FORMAT, PALETIZACAO_ITEMS, PALETE_SIZES } from 'config';
import FormPaletizacao from './FormPaletizacao';
import FormFormulacao from './FormFormulacao';
import FormGamaOperatoria from './FormGamaOperatoria';
import FormSpecs from './FormSpecs';
import FormRequirements from './FormRequirements';
import FormCortes from './FormCortes';
import { VerticalSpace, HorizontalRule } from 'components/formLayout';

const schema = (keys, excludeKeys) => {
    return getSchema({
        /*  "artigo_nw1": Joi.number().positive().precision(2).label("nw1").required(),
         "artigo_nw2": Joi.number().positive().precision(2).label("nw2").required(), */
        "artigo_width": Joi.number().positive().precision(2).label("width").required(),
        //"artigo_diam": Joi.number().positive().precision(2).label("diam").required(),
        "artigo_diam": Joi.number().min(5).rule({ warn: true }).max(10),
        "matprima_des": Joi.number().positive().precision(2).label("Mat Prima Des").required(),
        "qty": Joi.number().positive().precision(13).label("Quantidade").required()
        //bwi: Joi.number().positive().precision(2).label("Basis weight Inferior").required(),
        //bws: Joi.number().positive().precision(2).label("Basis weight Superior"),
        //tenpi: Joi.number().positive().precision(2).label("Tensile at peak CD").required(),
        //tenps: Joi.number().positive().precision(2).label("Tensile at peak CD"),
        //bws: Joi.number().min(5).rule({ warn: true }).max(10)
    }, keys, excludeKeys).unknown(true);
}

const AddOn = ({ value, children }) => {
    return (
        <>
            <StyledAddOn noStyle={!value && !children}>
                {value}
                {children}
            </StyledAddOn>
        </>
    );
}

const StyledAddOn = styled.div`
    margin: 2px;

    ${({ noStyle }) => !noStyle && `
        background-color: #fafafa; 
        border: 1px solid #d9d9d9;
        border-radius: 2px;
        align-self: center;
        text-align: center; 
        font-weight: 500;
        font-size: 10px;    
    `}

    width: 45px; 

`;




export default ({ record, setFormTitle, parentRef, closeParent }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});
    const [selectedMatPrimas, setSelectedMatPrimas] = useState({});
    const [paletizacaoChangedValues, setPaletizacaoChangedValues] = useState({});
    const [formulacaoChangedValues, setFormulacaoChangedValues] = useState({});
    const [gamaOperatoriaChangedValues, setGamaOperatoriaChangedValues] = useState({});
    const [artigoSpecsChangedValues, setArtigoSpecsChangedValues] = useState({});
    const [nonwovensChangedValues, setNonwovensChangedValues] = useState({});
    const [requirementsChangedValues, setRequirementsChangedValues] = useState({});

    const [fieldsLength, setFieldsLength] = useState({});
    //const [matPrimasLookup, setMatPrimasLookup] = useState({});
    const [bomLookup, setBomLookup] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    



    const LoadMateriasPrimas = async (record) => {
        const { data: { rows } } = await fetchPost({
            url: `${API_URL}/materiasprimasget/`, filter: {
                "cod": record.item,
                ...(("bomalt" in record) && { "bomalt": record.bomalt }),
                ...(("ofabrico" in record) && { "ofabrico": record.ofabrico })
            }
        });
        setSelectedMatPrimas(rows.map(v => v.matprima_cod));
        /*     const ret = { length: rows.length };
            for (const [i, v] of rows.entries()) {
                ret[`matprima_cod_${i}`] = v.matprima_cod;
                ret[`qty_${i}`] = v.qty;
                ret[`matprima_unidade_${i}`] = v.matprima_unidade;
                ret[`qty_base_${i}`] = v.qty_base;
            }
            return ret; */
        return rows;
    }

    const LoadMateriasPrimasLookup = async (record) => {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimaslookup/`, filter: {} });
        return rows;
    }
    const LoadBomLookup = async (record) => {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/bomlookup/`, filter: { "cod": record.item } });
        return rows;
    }
    const LoadOFabricoTemp = async (record) => {
        const { iorder, item, cliente_cod, ofabrico } = record;
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/tempofabricoget/`, filter: { of_id: ofabrico, item_cod: item, cliente_cod, order_cod: iorder } });
        return rows;
    }

    useEffect(() => {
        setFormTitle({ title: `Validar Ordem de Fabrico ${record.ofabrico}`, subTitle: `${record.item} - ${record.item_nome}` });
        (async () => {
            //const matPrimas = await LoadMateriasPrimas(record);
            //const mpLookup = await LoadMateriasPrimasLookup(record);
            //const bomLookup = await LoadBomLookup(record);
            let [oFabricoTemp] = await LoadOFabricoTemp(record);
            
            //setFieldsLength({ matPrimas: length });
            //setMatPrimasLookup(mpLookup);
            //setBomLookup(bomLookup);
            //form.setFieldsValue({ ...artigo, matPrimas, bom_alt: record.bom_alt, ...oFabricoTemp });
            oFabricoTemp = { ...oFabricoTemp, core_cod: { key: oFabricoTemp?.core_cod, value: oFabricoTemp?.core_cod, label: oFabricoTemp?.core_des } };
            form.setFieldsValue({ bom_alt: record.bom_alt, ...oFabricoTemp });
            setLoading(false);
        })();
    }, []);

    const onValuesChange = (changedValues, allValues) => {
        console.log("entrei", changedValues);
        /* if ("bom_alt" in changedValues) {
            (async () => {
                setLoading(true);
                const matPrimas = await LoadMateriasPrimas({ item: record.item, bomalt: changedValues.bom_alt });
                form.setFieldsValue({ ...allValues, matPrimas });
                setLoading(false);
            })();
        } */
        /*         if ("matPrimas" in changedValues) {
                    setSelectedMatPrimas(allValues.matPrimas.map(v => v.matprima_cod));
                } */
        if ("paletizacao_id" in changedValues) {
            setPaletizacaoChangedValues(changedValues);
        } else if ("formulacao_id" in changedValues) {
            setFormulacaoChangedValues(changedValues);
        } else if ("gamaoperatoria_id" in changedValues) {
            setGamaOperatoriaChangedValues(changedValues);
        } else if ("artigospecs_id" in changedValues) {
            setArtigoSpecsChangedValues(changedValues);
        } else if ("nonwovens_id" in changedValues) {
            console.log("ENTREI NONWOVENS")
            setNonwovensChangedValues(changedValues);
        } else {
            console.log("ENTREI REQUIREMENTS")
            setRequirementsChangedValues(changedValues);
        }
        /* if ("matPrimas" in changedValues){
            let idx = changedValues.matPrimas.length - 1;
            if ("matprima_cod" in changedValues.matPrimas[idx]){
                const v = matPrimasLookup.find(el => el.ITMREF_0 === changedValues.matPrimas[idx]["matprima_cod"]);
                console.log("ON CHANGE VALUE MATPRIMAS->", " -- ", v);
            }
        }
 */

        //form.setFieldsValue({ "matPrimas": [{ "qty_base": 564 }] });
        //console.log("get VALUE->", changedValues, allValues);
        ////setFormData({ ...form.getFieldsValue(true) });
    }

    const onFinish = async (values) => {
        const { cliente_cod, cliente_nome, iorder, item, ofabrico } = record;
        const { core_cod: { value: core_cod, label: core_des } = {} } = values;

        console.log("finish....", { ...record, ...values });
        const response = await fetchPost({ url: `${API_URL}/savetempordemfabrico/`, parameters: { ...values, cliente_cod, cliente_nome, iorder, item, ofabrico, core_cod, core_des } });
        setResultMessage(response.data);

        /*  console.log("--Toutched--", form.isFieldsTouched());
         console.log("--Toutched-BOM_ALT-", form.isFieldTouched("bom_alt"));
         console.log("--Toutched-ARTIGO_WIDTH-", form.isFieldTouched("artigo_width"));
         console.log("--Toutched-NUMPALETES_PROD-", form.isFieldTouched("num_paletes_produzir"));
         console.log("--Toutched-MAT-PRIMAS-", form.isFieldTouched(["matPrimas", 0, "matprima_cod"]));
         console.log("--Values--", values); */



        return;


        const v = schema(null, ['qty']).append({
            matPrimas: Joi.array().items(schema(['qty']))
        }).validate(values, { abortEarly: false });

        /*         const vv = Joi.object().keys({
                    matPrimas: Joi.array().items(schema(['qty']))
                });
        
                console.log("=======>", vv.validate(values, { abortEarly: false })); */

        console.log("ERRRORRRR->", { ...(v.error && { error: v.error.details }), ...(v.warning && { warning: v.warning.details }) });
        setFormStatus({ ...(v.error && { error: v.error.details }), ...(v.warning && { warning: v.warning.details }) });


        //         try {
        //             const v = await schema().validateAsync(values, { abortEarly: false/* , messages: messages || validateMessages */, warnings: true });
        //             //form.setFieldsValue({ ...v.value }); Pode não ser necessário
        //             console.log("validated....",v);
        //             /* fieldStatus = { error: {}, info: {}, warning: {} };
        //             values = v.value;
        //  */
        //         } catch (error) {
        //             console.log("ERRRORRRR->",error)
        //             /* fieldStatus = { error: {}, info: {}, warning: {} };
        //             for (let { context, message } of error.details) {
        //                 addMessage("error", message, context.key);
        //             }
        //             values = {}; */
        //         }


    };

    const onSuccessOK = () => {
        setResultMessage({ status: "none" });
    }

    const onErrorOK = () => {
        setResultMessage({ status: "none" });
    }

    const onClose = (reload = false) => {
        /*         if (reload) {
                    reloadDataTable();
                }
                setDataSource([]);*/
        closeParent();
    }


    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                <ResultMessage
                    result={resultMessage}
                    successButtonOK={<Button type="primary" key="goto-of" onClick={onSuccessOK}>Continuar</Button>}
                    successButtonClose={<Button key="goto-close" onClick={() => onClose(true)}>Fechar</Button>}
                    errorButtonOK={<Button type="primary" key="goto-ok" onClick={onErrorOK}>OK</Button>}
                    errorButtonClose={<Button key="goto-close" onClick={onClose}>Fechar</Button>}
                >
                    <AlertsContainer id="el-external" />
                    <AlertMessages formStatus={formStatus} />


                    <Form form={form} name={`form-of-validar`} onFinish={onFinish} onValuesChange={onValuesChange}>

                        <Tabs onChange={() => { }} type="card" dark={1}>
                            <TabPane tab="Requisitos" key="1">

                                <FormRequirements record={record} form={form} guides={guides} schema={schema} changedValues={requirementsChangedValues} nonwovensChangedValues={nonwovensChangedValues} />

                            </TabPane>
                            <TabPane tab="Especificações" key="3">
                                <FormSpecs id={form.getFieldValue("artigospecs_id")} record={record} form={form} guides={guides} schema={schema} changedValues={artigoSpecsChangedValues} />
                            </TabPane>
                            {/* <TabPane tab="Características Técnicas (Cliente)" key="4">


                                <FormLayout
                                    id="LAY-SPECS-CLIENT"
                                    guides={guides}
                                    layout="vertical"
                                    style={{ width: "100%", padding: "0px" }}
                                    schema={schema}
                                    field={{
                                        wide: [6, 5, 2, 2, 1, '*'],
                                        margin: "2px", overflow: false, guides: guides,
                                        label: { enabled: false, pos: "top", align: "end", vAlign: "center", wrap: false, overflow: false, colon: true, ellipsis: true },
                                        alert: { pos: "alert", tooltip: true, container: "el-external" },
                                        layout: { top: {}, right: {}, center: {}, bottom: {}, left: {} },
                                        required: true,
                                        style: { alignSelf: "center" }
                                    }}
                                    fieldSet={{
                                        guides: guides,
                                        wide: 16, margin: "2px", layout: "horizontal", overflow: false,
                                        layout: {} //Por definir
                                    }}
                                >


                                    <Form.List name="specsCliente">
                                        {(fields, { add, remove }) => {
                                            const addRow = (fields, add) => {
                                                if (fields.length == 0 || form.getFieldValue(["specsCliente", fields.length - 1]) !== undefined) {
                                                    if (fields.length == 0 || form.getFieldValue(["specsCliente", fields.length - 1])?.spec_des1) {
                                                        add();
                                                    }
                                                }
                                            }
                                            return (
                                                <>
                                                    {fields.map((field, index) => (
                                                        <FieldSet key={field.key}>
                                                            <Field label={{ enabled: false }} name={[field.name, "spec_des1"]}>
                                                                <SelectField size="small" />
                                                            </Field>
                                                            <Field label={{ enabled: false }} name={[field.name, "spec_des2"]}>
                                                                <SelectField size="small" />
                                                            </Field>
                                                            <Field label={{ enabled: false }} name={[field.name, "spec_vi"]}><InputNumber size="small" /></Field>
                                                            <Field label={{ enabled: false }} name={[field.name, "spec_vs"]}><InputNumber size="small" /></Field>
                                                            <Item>
                                                                <AddOn value="" />
                                                            </Item>
                                                            <IconButton onClick={() => remove(field.name)} style={{ alignSelf: "center" }}><CgRemove /></IconButton>
                                                            <AlertsContainer style={{ alignSelf: "end", paddingBottom: "2px" }} main={true} />
                                                        </FieldSet>
                                                    ))}
                                                    <FieldSet wide={10}>
                                                        <Button type="dashed" onClick={() => addRow(fields, add)} style={{ width: "100%" }}><PlusOutlined />Adicionar</Button>
                                                    </FieldSet>
                                                </>
                                            );
                                        }}
                                    </Form.List>



                                </FormLayout>













                            </TabPane> */}
                            <TabPane tab="Formulação" key="5">
                                <FormFormulacao id={form.getFieldValue("formulacao_id")} record={record} form={form} guides={guides} schema={schema} changedValues={formulacaoChangedValues} />
                            </TabPane>
                            <TabPane tab="Gama Operatória" key="6">
                                <FormGamaOperatoria id={form.getFieldValue("gamaoperatoria_id")} record={record} form={form} guides={guides} schema={schema} changedValues={gamaOperatoriaChangedValues} />
                            </TabPane>
                            <TabPane tab="Matérias Primas" key="7">
                                <FormLayout
                                    id="LAY-MATERIASPRIMAS"
                                    guides={guides}
                                    layout="vertical"
                                    style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                                    schema={schema}
                                    field={{
                                        wide: [7, 2, 1, 1, '*'],
                                        margin: "2px", overflow: false, guides: guides,
                                        label: { enabled: true, pos: "top", align: "start", vAlign: "center", /* width: "80px", */ wrap: false, overflow: false, colon: true, ellipsis: true },
                                        alert: { pos: "right", tooltip: true, container: true /* container: "el-external" */ },
                                        layout: { top: "", right: "", center: "", bottom: "", left: "" },
                                        required: true,
                                        style: { alignSelf: "top" }
                                    }}
                                    fieldSet={{
                                        guides: guides,
                                        wide: 16, margin: "2px", layout: "horizontal", overflow: false
                                    }}
                                >

                                    <FieldSet>
                                        <Field wide={5} name="bom_alt" label={{ text: "BOM de Materiais" }}>
                                            <SelectField size="small" data={bomLookup} keyField="BOMALT_0" textField="CREDAT_0"
                                                optionsRender={(d, keyField, textField) => ({ label: `${d[keyField]} - ${dayjs(d[textField]).format(DATE_FORMAT)}`, value: d[keyField] })}
                                            />
                                        </Field>
                                        <AlertsContainer style={{ alignSelf: "end", paddingBottom: "2px" }} main={true} />
                                    </FieldSet>

                                    <FieldSet>
                                        <Field label={{ enabled: false }}><b>Matéria Prima</b></Field>
                                        <Field label={{ enabled: false }}><b>Quantidade</b></Field>
                                        <Field label={{ enabled: false }} />
                                    </FieldSet>


                                    <Form.List name="matPrimas">
                                        {(fields, { add, remove }) => {
                                            const addRow = (fields, add) => {
                                                if (fields.length == 0 || form.getFieldValue(["matPrimas", fields.length - 1]) !== undefined) {
                                                    if (fields.length == 0 || form.getFieldValue(["matPrimas", fields.length - 1])?.matprima_cod) {
                                                        add({ "qty": 0 });
                                                    }
                                                }
                                            }
                                            /**
                                             * `fields` internal fill with `name`, `key`, `fieldKey` props.
                                             * You can extends this into sub field to support multiple dynamic fields.
                                             */
                                            return (
                                                <>
                                                    {fields.map((field, index) => (
                                                        <FieldSet key={field.key}>
                                                            <Field label={{ enabled: false }} name={[field.name, "matprima_cod"]}>
                                                                <SelectField size="small" data={matPrimasLookup} keyField="ITMREF_0" textField="ITMDES1_0" optionFilterProp="children"
                                                                    optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField], disabled: selectedMatPrimas.includes(d[keyField]) })}
                                                                    showSearch
                                                                    filterOption={(input, option) =>
                                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                                    } />
                                                            </Field>
                                                            <Field label={{ enabled: false }} name={[field.name, "qty"]}><InputNumber size="small" /></Field>
                                                            <Item shouldUpdate={(prevValues, curValues) => prevValues.matPrimas[field.name]?.matprima_cod !== curValues.matPrimas[field.name]?.matprima_cod}>
                                                                {() => {
                                                                    const cod = form.getFieldValue(["matPrimas", field.name, "matprima_cod"]);
                                                                    if (cod) {
                                                                        const item = matPrimasLookup.find(v => v.ITMREF_0 === cod);
                                                                        return <AddOn value={`${item.SAUSTUCOE_0}${item.STU_0}`} />
                                                                    }
                                                                    return <AddOn value="" />;
                                                                }}
                                                            </Item>
                                                            {/* <AddOn value={`${hasValue(form.getFieldValue(["matPrimas", field.name, "qty_base"]), undefined)}${hasValue(form.getFieldValue(["matPrimas", field.name, "matprima_unidade"]), undefined)}`} /> */}
                                                            <IconButton onClick={() => remove(field.name)} style={{ alignSelf: "center" }}><CgRemove /></IconButton>
                                                            <AlertsContainer style={{ alignSelf: "end", paddingBottom: "2px" }} main={true} />
                                                        </FieldSet>
                                                    ))}
                                                    <FieldSet wide={10}>
                                                        <Button type="dashed" onClick={() => addRow(fields, add)} style={{ width: "100%" }}><PlusOutlined />Adicionar</Button>
                                                    </FieldSet>
                                                </>
                                            );
                                        }}
                                    </Form.List>
                                </FormLayout>

                            </TabPane>
                            <TabPane tab="Paletização" key="8">
                                <FormPaletizacao id={form.getFieldValue("paletizacao_id")} record={record} form={form} guides={guides} schema={schema} changedValues={paletizacaoChangedValues} />
                            </TabPane>
                            {/*                             <TabPane tab="Documentos" key="8">
                            </TabPane> */}
                        </Tabs>
                    </Form>
                </ResultMessage>
                <Portal elId={parentRef.current}>
                    <Space>
                        <Button type="primary" onClick={() => form.submit()}>Submeter para Produção</Button>
                        <Button onClick={() => form.submit()}>Guardar Ordem de Fabrico</Button>
                        <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button>
                    </Space>
                </Portal>
            </Spin>
        </>
    );

}