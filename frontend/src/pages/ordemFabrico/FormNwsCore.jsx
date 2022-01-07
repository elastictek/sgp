import React, { useEffect, useState, useCallback, useRef,useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule } from "components/formLayout";
import Toolbar from "components/toolbar";
import { Button, Spin, Input, Skeleton, Tooltip, InputNumber, DatePicker, TimePicker } from "antd";
import { LoadingOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT, THICKNESS, ENROLAMENTO_OPTIONS } from 'config';
import FormNonwovens from './FormNonwovens';
import { dateTimeDiffValidator } from "utils/schemaValidator";
import { OFabricoContext } from './FormOFabricoValidar';


const loadCoresLookup = async (core, token) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/materiasprimaslookup/`, filter: {}, parameters: { type: 'cores', core }, cancelToken: token });
    return rows;
}

export default ({ /* record, form, guides, schema, coreChangedValues, */ nwChangedValues /* fieldStatus */ }) => {
    const { form, guides, schema, fieldStatus, ...ctx } = useContext(OFabricoContext);
    const [loading, setLoading] = useState(true);
    const [coresLookup, setCoresLookup] = useState([]);

    useEffect(() => {
        const cancelFetch = cancelToken();
        loadData({ token: cancelFetch });
        return (() => cancelFetch.cancel("Form Requirements Cancelled"));
    }, []);

    const loadData = ({ token }, type = "init") => {
        switch (type) {
            case "lookup":
                setLoading(true);
                (async () => {
                    setCoresLookup(await loadCoresLookup(form.getFieldValue("artigo_core"), token));
                    setLoading(false);
                })();
                break;
            default:
                if (!loading) {
                    setLoading(true);
                }
                (async () => {                   
                    setCoresLookup(await loadCoresLookup(form.getFieldValue("artigo_core"), token));
                     setLoading(false);
                })();
        }
    }

    return (
        <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
            {!loading &&
                <>
                    <FormLayout
                        id="LAY-NWSCORE"
                        guides={guides}
                        layout="vertical"
                        style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                        schema={schema}
                        fieldStatus={fieldStatus}
                        field={{
                            wide: [4, 4, '*'],
                            margin: "2px", overflow: false, guides: guides,
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

                            <HorizontalRule title="1. Core" />
                            <VerticalSpace />
                            <FieldSet margin={false}>
                                <Field wide={[10]} name="core_cod" label={{ enabled: false, text: "Core", pos: "top" /* pos: "left", width: "140px", align: "end" */ }} required={false}>
                                    <SelectField size="small" data={coresLookup} keyField="ITMREF_0" textField="ITMDES1_0"
                                        optionsRender={(d, keyField, textField) => ({ label: `${d[textField]}`, value: d[keyField] })}
                                        showSearch
                                        labelInValue
                                        filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    />
                                </Field>
                            </FieldSet>
                        </FieldSet>

                    </FormLayout>
                    <FormNonwovens forInput={false} /* record={ctx} form={form} guides={guides} schema={schema} */ changedValues={nwChangedValues} />
                </>
            }
        </Spin >
    );
}