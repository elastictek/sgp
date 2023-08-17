import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema, dateTimeDiffValidator } from "utils/schemaValidator";
import { getFilterRangeValues, getFilterForceRangeValues, getFilterValue, isValue } from 'utils';
import uuIdInt from "utils/uuIdInt";
import FormManager, { FieldLabel, FieldSet as OldFieldSet, FilterTags, AutoCompleteField as OldAutoCompleteField, useMessages, DropDown } from "components/form";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, InputAddon, SelectField, VerticalSpace, TitleForm, WrapperForm, SelectDebounceField, AutoCompleteField, RangeDateField, RangeTimeField, FilterDrawer, CheckboxField, SwitchField, SelectMultiField } from "components/formLayout";
import Drawer from "components/Drawer";
import Table, { setColumns } from "components/table";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import ResponsiveModal from "components/ResponsiveModal";
import MoreFilters from 'assets/morefilters.svg';
import { Outlet, useNavigate } from "react-router-dom";
import YScroll from "components/YScroll";
import { MdAdjust } from 'react-icons/md';


import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge, DatePicker } from "antd";
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled } from '@ant-design/icons';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SwapRightOutlined, CheckSquareTwoTone, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, BOBINE_DEFEITOS, API_URL, GTIN, SCREENSIZE_OPTIMIZED, DOSERS } from 'config';
const { Title } = Typography;


const schema = (keys, excludeKeys) => {
    return getSchema({
        fbobinagem: Joi.any().label("Bobinagem"),
        date: Joi.any().label("Data")
    }, keys, excludeKeys).unknown(true);
}

const fetchBobinagens = async (value) => {
    if (value) {
        const { data: { rows } } = await fetchPost({ url: `${API_URL}/getconsumosbobinagenslookup/`, pagination: { limit: 20 }, filter: { ["fbobinagem"]: `%${value.replaceAll(' ', '%%')}%` }, sort:[{ column: 'ig.t_stamp', direction: 'ASC' }] });
        return rows;
    }
}

export default ({ type, data, closeParent, parentDataAPI, parentRef }) => {

    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();


    useEffect(() => {
        form.setFieldsValue({ direction: { value: "up", label: "Acima" } });
    }, []);

    const onValuesChange = (v) => {
        if ("fbobinagem" in v) {
            form.setFieldsValue({ date: dayjs(v.fbobinagem.value) });
        }
    }

    const onSubmit = () => {
        setSubmitting(true);
        form.submit();
    }

    const onFinish = async (values) => {
        const { fbobinagem, direction, date } = values;

        let diff = {};
        const v = schema().custom((v, h) => {
            if (direction.value === "up") {
                diff = dateTimeDiffValidator(v.date, dayjs(v.fbobinagem.value));
                if (diff.errors == true) {
                    return h.message("A Data tem de ser maior que a data da bobinagem!", { key: "fbobinagem", label: "date" })
                }
            }else{
                diff = dateTimeDiffValidator(dayjs(v.fbobinagem.value),v.date);
                if (diff.errors == true) {
                    return h.message("A Data tem de ser menor que a data da bobinagem!", { key: "fbobinagem", label: "date" })
                }
            }
        }).validate(values, { abortEarly: false });
        if (v.error){
            console.log("errorrrrrr",v.error);

        }
        

        const response = await fetchPost({ url: `${API_URL}/pickmanual/`, parameters: { move_position: 1, direction: direction.value, ig_id: fbobinagem.key, idlinha: data.idlinha, date:dayjs(date).format(DATETIME_FORMAT) } });
        setSubmitting(false);
        closeParent();
        parentDataAPI.fetchPost();

    }


    return (
        <>
            <Form form={form} name={`frmov`} onFinish={onFinish} onValuesChange={onValuesChange}>
                <FormLayout
                    id="LAY-FRMMOV"
                    layout="vertical"
                    style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{ guides: false, wide: [16],alert: { pos: "alert", tooltip: true, container: false, /* container: "el-external"*/ }, }}
                    fieldSet={{ guides: false, wide: 16, margin: false, layout: "horizontal", overflow: false }}
                >

                    <FieldSet>
                        <Field required={true} name="fbobinagem" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Bobinagem", pos: "top" }}>
                            <SelectDebounceField
                                placeholder="Bobinagem"
                                size="small"
                                keyField="id"
                                textField="nome"
                                showSearch
                                showArrow
                                allowClear
                                fetchOptions={fetchBobinagens}
                                optionsRender={(d, keyField, textField) => ({ label: <div><b>{d["nome"]}</b> {dayjs(d["t_stamp"]).format(DATETIME_FORMAT)}</div>, value: d["t_stamp"], key: d["id"] })}

                            />
                        </Field>
                    </FieldSet>
                    <FieldSet>
                        <Field name="direction" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Direção", pos: "top" }}>
                            <SelectField keyField="value" valueField="label" style={{ width: 150 }} size="small" options={
                                [{ value: "up", label: "Acima" },
                                { value: "down", label: "Abaixo" }]
                            } />
                        </Field>
                    </FieldSet>
                    <FieldSet>
                        <Field required={true} name="date" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Data", pos: "top" }}><DatePicker showTime size="small" format="YYYY-MM-DD HH:mm" /></Field>
                    </FieldSet>

                    {parentRef && <Portal elId={parentRef.current}>
                        <Space>
                            <Button disabled={submitting} type="primary" onClick={onSubmit}>Registar</Button>
                            <Button onClick={closeParent}>Fechar</Button>
                        </Space>
                    </Portal>
                    }


                    {/* <FieldSet margin={false}>
                    <Field required={true} wide={2} name="qty_lote" label={{ text: "Quantidade" }}><InputNumber size="small" min={1} max={2000} addonAfter="kg" /></Field>
                </FieldSet>
                <FieldSet margin={false}>
                    <Field required={true} wide={3} label={{ text: "Data" }} name="date"><DatePicker showTime size="small" format="YYYY-MM-DD HH:mm" /></Field>
                </FieldSet>
                <FieldSet margin={false}>
                    <Field required={true} wide={3} label={{ text: "Movimento Lote ID" }} name="lote_id"><InputNumber size="small" /></Field>
                    <Field forInput={record.ITMREF_0.startsWith("R000")} required={true} wide={6} label={{ text: "Nº Lote" }} name="n_lote"><Input size="small" /></Field>
                </FieldSet>
                <FieldSet margin={false}>
                    <Field required={true} wide={3} label={{ text: "Grupo (Cuba)" }} name="group_id"><InputNumber size="small" /></Field>
                </FieldSet>
                <FieldSet margin={false}>
                    <Field name="saida_mp" label={{ enabled: true, text: "Saída de Matérias Primas existentes" }}>
                        <SelectField size="small" data={[
                            { label: "Apenas quando a Matéria Prima for diferente", value: 1 },
                            { label: "Não dar saída", value: 2 },
                            { label: "Dar saída", value: 3 }
                        ]} keyField="value" textField="label"
                            optionsRender={(d, keyField, textField) => ({ label: d[textField], value: d[keyField] })}
                        />
                    </Field>
                </FieldSet> */}
                </FormLayout>
            </Form>
        </>
    )
}