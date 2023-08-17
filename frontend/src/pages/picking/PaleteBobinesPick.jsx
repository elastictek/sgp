import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit from "utils/loadInit";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
//import { WrapperForm, TitleForm, FormLayout, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET } from 'config';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission } from "utils/usePermission";
import { Status } from './commons';
import { GoArrowUp } from 'react-icons/go';
import { ImArrowUp, ImArrowDown, ImArrowRight, ImArrowLeft } from 'react-icons/im';
import { MovColumn, PosColumn, QueueNwColumn } from "./commons";

const title = "";

const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    }
});

export default ({ lastValue, setLastValue, parentRef, closeParent, minItems = 10, maxItems = 12, ...props }) => {
    const permission = usePermission({ allowed: {} });
    const value = useRef('');
    const pick = useRef(true);
    const ref = useRef(null);
    const [current, setCurrent] = useState('');
    const [status, setStatus] = useState(true);
    const [form] = Form.useForm();

    const onPick = () => {
        if (current !== '') {
            const v = current.startsWith("000026") ? current.replace("000026", "") : current.startsWith("\\000026") ? current.replace("\\000026", "") : current;
            console.log("PICK", v)
            const vals = form.getFieldsValue(true);
            for (let [i, x] of vals.items.entries()){
                if (!x.item){
                    form.setFieldValue(["items", i, "item"],v);
                    break;
                }
            }
            setCurrent("")
        }
    }

    const keydownHandler = async (e, obj) => {
        //e.preventDefault();
        const keyCode = (e === null) ? obj.keyCode : e.keyCode;
        if (keyCode == 9 || keyCode == 13) {
            onPick();
        }
    };

    const focusIn = (e, src = null) => {
        if (e?.srcElement?.className === "ant-input-number-input" || e?.srcElement?.className === "ant-select-selection-search-input" || e?.srcElement?.name?.includes("item")) {
            setStatus(false);
            pick.current = false;
        } else {
            setStatus(true);
            pick.current = true;
            ref.current.focus();
        }
    }
    const focusOut = (e, src) => {
        console.log("focus out")
        // if (e?.srcElement?.className !== "ant-input-number-input" && e?.srcElement?.className !== "ant-select-selection-search-input") {
        setStatus(false);
        pick.current = false;
        // }
    }
    const onChange = (e) => {
        setCurrent(e.target.value);
        value.current = e.target.value;
    }

    const onClear = () => {
        const items = [...Array(maxItems).fill(0).map((x, i) => ({ item: null, required: i < (minItems - 1) ? true : false }))];
        form.setFieldsValue({ items });
    }

    useEffect(() => {
        console.log("xxx->", props)
        ref.current.focus();
        //document.body.addEventListener('keydown', keydownHandler);
        document.body.addEventListener('focusout', focusOut);
        document.body.addEventListener('focusin', focusIn);
        //window.addEventListener('paste', paste);

        const items = [...Array(maxItems).fill(0).map((x, i) => ({ item: null, required: i < (minItems - 1) ? true : false }))];
        form.setFieldsValue({ items });

        return () => {
            //document.body.removeEventListener('keydown', keydownHandler);
            document.body.removeEventListener('focusout', focusOut);
            document.body.removeEventListener('focusin', focusIn);
            //window.removeEventListener('paste', paste);
        };
    }, []);

    const onValuesChange = (values,all) => {}

    return (
        <div style={{ width: "100%", height: "100vh" }} tabIndex={0}>
            <FormContainer id="pick-container" wrapForm form={form} onValuesChange={onValuesChange}>
                <Row>
                    {/* <Col><Toolbar left={}/></Col> */}
                </Row>
                <Row align='center' gutterWidth={5}><Col>
                    <Row align='center' gutterWidth={5} style={{ border: status ? "solid 2px #1890ff" : "solid 2px #f0f0f0", height: "50px", margin: "10px 0px" }}>
                        <Col style={{ fontSize: "22px", fontWeight: 700 }}>
                            <Input style={{ border: "0px", fontSize: "18px", fontWeight: 700 }} ref={ref} value={current} onChange={onChange} onKeyDown={keydownHandler} />
                        </Col>
                        <Col xs="content">
                            <Button type="primary" size='large' onClick={onClear}>Limpar Picagens</Button>
                        </Col>
                    </Row>
                </Col>
                    {/* <Col xs='content'><Button icon={<SnippetsOutlined />} onClick={paste} title="Colar" /></Col> */}
                </Row>

                <Form.List name="items">
                    {(fields, { add, remove, move }) => {
                        const addRow = (fields, duplicate = false) => {
                            //if (fields.length === 0) {
                            //if (duplicate) {
                            //    add(form.getFieldValue(["destinos", duplicate.name]));
                            //} else {
                            //    add({ cliente: null, largura: p.row.lar, obs: null });
                            //}
                            //} else {
                            //    add({ [`min`]: null, [`max`]: null, "unit": unit, ...(type == "ff" && { "type": "Desbobinagem" }) });
                            //}
                        }
                        const removeRow = (fieldName, field) => {
                            remove(fieldName);
                        }
                        const moveRow = (from, to) => {
                            //move(from, to);
                        }
                        return (
                            <>
                                <YScroll>
                                    {fields.map((field, index) => (
                                        <Row key={field.key} nogutter style={{ padding: "1px", marginBottom: "1px", /* borderRadius: "3px", border: "1px solid rgba(5, 5, 5,0.1)" */ /* background: index % 2 ? "#d9eaff" : "#e9f3ff" */ }}>
                                            <Col width={30} style={{ display: "flex", flexDirection: "column", alignItems: "center", fontWeight: 700, fontSize: "15px" }}><div>{index + 1}</div></Col>
                                            <Col style={{ fontSize: "18px", fontWeight: 700 }}>
                                                <Field label={{ enabled: false }} name={[field.name, "item"]} wrapFormItem>
                                                    <Input /* onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} */ allowClear style={{ fontSize: "18px", fontWeight: 700 }} />
                                                </Field>
                                            </Col>

                                        </Row>
                                    ))}

                                </YScroll>
                            </>
                        )
                    }
                    }
                </Form.List>



            </FormContainer >
            {
                parentRef && <Portal elId={parentRef.current}>
                    <Space>
                        <Button disabled={current === ''} type="primary" onClick={onPick}>Registar</Button>
                        <Button onClick={closeParent}>Cancelar</Button>
                    </Space>
                </Portal>
            }
        </div>
    );
}