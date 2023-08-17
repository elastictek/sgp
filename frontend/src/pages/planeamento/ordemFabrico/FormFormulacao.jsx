import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon } from "components/formLayout";
import Toolbar from "components/toolbar";
import { Button, Spin } from "antd";
import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import FormFormulacaoUpsert from '../formulacao/FormFormulacaoUpsert';
import { OFabricoContext } from './FormOFabricoValidar';
import FormulacaoReadOnly from '../../formulacao/FormulacaoReadOnly';

const DrawerFormulacao = ({ showWrapper, setShowWrapper, parentReload }) => {
    const [formTitle, setFormTitle] = useState({});
    const iref = useRef();
    const { record = {} } = showWrapper;
    const onVisible = () => {
        setShowWrapper(prev => ({ ...prev, show: !prev.show }));
    }
    return (
        <WrapperForm
            title={<TitleForm title={formTitle.title} subTitle={formTitle.subTitle} />}
            type="drawer"
            destroyOnClose={true}
            //width={width}
            mask={true}
            /* style={{ maginTop: "48px" }} */
            setVisible={onVisible}
            visible={showWrapper.show}
            width={800}
            bodyStyle={{ height: "450px" /*  paddingBottom: 80 *//* , overflowY: "auto", minHeight: "350px", maxHeight: "calc(100vh - 50px)" */ }}
            footer={<div ref={iref} id="form-wrapper" style={{ textAlign: 'right' }}></div>}
        >
            <FormFormulacaoUpsert setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} parentReload={parentReload} />
        </WrapperForm>
    );
}

const loadFormulacaoesLookup = async ({ produto_id, token }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/formulacoeslookup/`, filter: { produto_id }, sort: [], cancelToken: token });
    return rows;
}
const getFormulacaoMateriasPrimas = async ({ formulacao_id, token }) => {
    if (!formulacao_id) {
        return [];
    }
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/formulacaomateriasprimasget/`, filter: { formulacao_id }, sort: [], cancelToken: token });
    return rows;
}

export default ({ changedValues }) => {
    const { form, guides, schema, fieldStatus, ...ctx } = useContext(OFabricoContext);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState({ show: false });
    const [formulacoes, setFormulacoes] = useState([]);

    useEffect(() => {
        const cancelFetch = cancelToken();
        loadData({ formulacao_id: form.getFieldValue("formulacao_id"), token: cancelFetch });
        return (() => cancelFetch.cancel("Form Formulação Cancelled"));
    }, []);

    useEffect(() => {
        const cancelFetch = cancelToken();
        if (changedValues) {
            if ("formulacao_id" in changedValues) {
                setLoading(true);
                loadData({ formulacao_id: changedValues.formulacao_id, token: cancelFetch });
            }
        }
        return (() => cancelFetch.cancel("Form Formulação Cancelled"));
    }, [changedValues]);

    const loadData = (data = {}, type = "init") => {
        const { formulacao_id, token } = data;
        switch (type) {
            case "lookup":
                setLoading(true);
                (async () => {
                    setFormulacoes(await loadFormulacaoesLookup({ produto_id: ctx.produto_id, token }));
                    setLoading(false);
                })();
                break;
            default:
                if (!loading) {
                    setLoading(true);
                }
                (async () => {
                    let _formulacoes = formulacoes;
                    if (ctx.produto_id) {
                        _formulacoes = await loadFormulacaoesLookup({ produto_id: ctx.produto_id, token });
                        setFormulacoes(_formulacoes);
                    }
                    if (formulacao_id) {
                        let [formulacao] = _formulacoes.filter(v => v.id === formulacao_id);
                        const formulacaoMateriasPrimas = await getFormulacaoMateriasPrimas({ formulacao_id, token });
                        formulacao = { ...formulacao, cliente_cod: { key: formulacao.cliente_cod, value: formulacao.cliente_cod, label: formulacao.cliente_nome } };
                        form.setFieldsValue({ formulacao, formulacaoMatPrimas: [...formulacaoMateriasPrimas] });
                    }
                    setLoading(false);
                })();
        }
    }

    const onShowForm = (newForm = false, forInput = false) => {
        if (newForm) {
            setShowForm(prev => ({ ...prev, show: !prev.show, record: {}, forInput }));
        } else {
            setShowForm(prev => ({ ...prev, show: !prev.show, record: { ...form.getFieldsValue(["formulacao_id","formulacao", "formulacaoMatPrimas"]) }, forInput }));
        }
    }

    return (
        <div style={{height:"calc(100vh - 350px)"}}>
            <FormulacaoReadOnly noDosers header={true} form={form} parameters={{formulacao_id:form.getFieldValue("formulacao_id")}}/>
        </div>
    );



    // <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
    //             <DrawerFormulacao showWrapper={showForm} setShowWrapper={setShowForm} parentReload={loadData} />
    //             <FormLayout
    //                 id="LAY-FORMULACAO"
    //                 guides={guides}
    //                 layout="vertical"
    //                 style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
    //                 schema={schema}
    //                 field={{
    //                     //wide: [3, 2, 1, '*'],
    //                     margin: "2px", overflow: false, guides: guides,
    //                     label: { enabled: true, pos: "top", align: "start", vAlign: "center", /* width: "80px", */ wrap: false, overflow: false, colon: true, ellipsis: true },
    //                     alert: { pos: "right", tooltip: true, container: true /* container: "el-external" */ },
    //                     layout: { top: "", right: "", center: "", bottom: "", left: "" },
    //                     addons: {}, //top|right|center|bottom|left
    //                     required: true,
    //                     style: { alignSelf: "top" }
    //                 }}
    //                 fieldSet={{
    //                     guides: guides,
    //                     wide: 16, margin: "2px", layout: "horizontal", overflow: false
    //                 }}
    //             >
    //                 <FieldSet>
    //                     <Toolbar
    //                         style={{ width: "100%" }}
    //                         left={
    //                             <FieldSet>
    //                                 <Field name="formulacao_id" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Formulacao", pos: "left" }} addons={{
    //                                     ...(form.getFieldValue("formulacao_id") && { right: <Button onClick={() => onShowForm(false, true)} style={{ marginLeft: "3px" }} size="small"><EditOutlined style={{ fontSize: "16px" }} /></Button> })
    //                                 }}>
    //                                     <SelectField allowClear size="small" data={formulacoes} keyField="id" textField="designacao"
    //                                         optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ minWidth: "150px" }}><b>{d[textField]}</b></div><div>v.{d["versao"]}</div></div>, value: d[keyField] })}
    //                                     />
    //                                 </Field>
    //                             </FieldSet>
    //                         }
    //                         right={<Button onClick={() => onShowForm(true, true)}>Nova Formulação</Button>}
    //                     />
    //                 </FieldSet>
    //                 <FieldSet>
    //                     {(!loading && form.getFieldValue("formulacao_id")) && <FormFormulacaoUpsert record={form.getFieldsValue(true)} wrapForm={false} forInput={false} parentReload={loadData} />}
    //                 </FieldSet>
    //             </FormLayout>
    //         </Spin>
}