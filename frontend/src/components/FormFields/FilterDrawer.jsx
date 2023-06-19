import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { Form, Tooltip, Drawer, Modal, Button, Row, Col, Input, Tag, AutoComplete, Select, Switch, Alert, Checkbox, Spin, DatePicker, InputNumber, TimePicker } from "antd";
import styled, { css } from "styled-components";
import classNames from "classnames";
import { createUseStyles } from 'react-jss';
import { ConditionalWrapper } from '../conditionalWrapper';
import Portal from "../portal";
import YScroll from "../YScroll";
import PointingAlert from "../pointingAlert";
import { debounce, dayjsValue } from "utils";
import { validate, getSchema, pick, getStatus } from "utils/schemaValidator";
import { LoadingOutlined } from '@ant-design/icons';
import { BiWindow } from "react-icons/bi";
import { BsBoxArrowInDownRight } from "react-icons/bs";
import { AiOutlineFullscreen } from "react-icons/ai";
import RangeDate from "../RangeDate";
import RangeTime from "../RangeTime";
import { DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT } from 'config';
import { Container as MainContainer, Col as GsCol, Row as GsRow } from 'react-grid-system';
import { Field, Container as FormContainer, FilterDrawer, AutoCompleteField, RangeDateField, RangeTimeField, SelectMultiField, SelectField, DatetimeField, CheckboxField } from 'components/FormFields';
import Selector from './Selector';


const useStyles = createUseStyles({
});





export default ({ schema, filters, filterRules, width = 400, showFilter, setShowFilter, form, onFinish, mask = false, dataAPI }) => {
    return (
        <>
            <Drawer
                title="Filtros"
                width={width}
                mask={mask}
                /* style={{ top: "48px" }} */
                onClose={() => setShowFilter(false)}
                open={showFilter}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={() => { form.resetFields(); dataAPI.addFilters({}, true); }} style={{ marginRight: 8 }}>Limpar</Button>
                        <Button onClick={() => onFinish("filter", form.getFieldsValue(true))} type="primary">Aplicar</Button>
                    </div>
                }
            >
                {(filters && filters.length>0) && <>
                    <FormContainer id="search-form" form={form} wrapForm={true} wrapFormItem={true} style={{ padding: "0px" }} onKeyPress={(e) => { if (e.key === "Enter") { onFinish("filter", form.getFieldsValue(true)); } }} fluid>
                        <GsRow nogutter>
                            {filters}
                        </GsRow>
                    </FormContainer>
                </>}

                {/**schema is deprecated use filters instead!! */}
                {schema && <Form form={form} name="search-form" layout="vertical" hideRequiredMark onKeyPress={(e) => { if (e.key === "Enter") { onFinish("filter", form.getFieldsValue(true)); } }}>
                    {schema.map((line, ridx) => (
                        <Row key={`rf-${ridx}`} gutter={16}>
                            {Object.keys(line).map((col, cidx) => {
                                const span = ("span" in line[col]) ? line[col].span : 24;
                                const itemWidth = ("itemWidth" in line[col]) ? { width: line[col].itemWidth } : {};
                                const label = ("label" in line[col]) ? line[col].label : filterRules.$_mapLabels([col]);
                                const labelChk = ("labelChk" in line[col]) ? line[col].labelChk : filterRules.$_mapLabels([col]);
                                const field = ("field" in line[col]) ? line[col].field : { type: "input" };
                                const initialValue = ("initialValue" in line[col]) ? line[col].initialValue : undefined;
                                return (
                                    <Col key={`cf-${cidx}`} span={span} style={{ paddingLeft: "1px", paddingRight: "1px" }}>
                                        <Form.Item style={{ marginBottom: "0px" }} key={`fd-${col}`} name={`${col}`} label={label} {...(initialValue !== undefined && { initialValue: initialValue })} labelCol={{ style: { padding: "0px" } }}>
                                            {(typeof field === 'function') ? field() :
                                                {
                                                    autocomplete: <AutoCompleteField allowClear {...field} />,
                                                    rangedate: <RangeDateField allowClear {...field} />,
                                                    rangetime: <RangeTimeField allowClear {...field} />,
                                                    inputnumber: <InputNumber allowClear {...field} />,
                                                    selectmulti: <SelectMultiField allowClear {...field} />,
                                                    select: <SelectField allowClear {...field} />,
                                                    datetime: <DatetimeField allowClear {...field} />,
                                                    checkbox: <CheckboxField {...field}>{labelChk}</CheckboxField>
                                                }[field?.type] || <Input style={{ ...itemWidth }} allowClear {...field} />
                                            }

                                        </Form.Item>
                                    </Col>
                                );
                            })}
                        </Row>
                    ))}
                </Form>
                }
            </Drawer>
        </>
    );
};
