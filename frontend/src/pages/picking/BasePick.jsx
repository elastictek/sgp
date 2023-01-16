import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import moment from 'moment';
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
import useWebSocket from 'react-use-websocket';
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

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const title = "Registo Nonwovens - Entrada em Linha";
const TitleForm = ({ data, onChange, record, level, form }) => {
    const st = JSON.stringify(record?.ofs)?.replaceAll(/[\[\]\"]/gm, "")?.replaceAll(",", " | ");
    return (<ToolbarTitle /* history={level === 0 ? [] : ['Registo Nonwovens - Entrada em Linha']} */ title={<>
        <Col>
            <Row>
                <Col xs='content' style={{}}><Row nogutter><Col><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>{title}</span></Col></Row></Col>
                <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col>
            </Row>
            <Row style={{ marginTop: "10px" }}>
                <Col>Nonwoven Inferior</Col>
                <Col>Nonwoven Superior</Col>
            </Row>
            <Row>
                <Col>
                    <span style={{ fontWeight: 700 }}>{record.nonwovens?.nw_cod_inf}</span> {record.nonwovens?.nw_des_inf}
                </Col>
                <Col>
                    <span style={{ fontWeight: 700 }}>{record.nonwovens?.nw_cod_sup}</span> {record.nonwovens?.nw_des_sup}
                </Col>
            </Row>
        </Col>
    </>
    } right={
        <Col xs="content">
            <FormContainer id="frm-title" form={form} wrapForm={true} wrapFormItem={true} schema={schema} label={{ enabled: false }} onValuesChange={onChange} fluid>
                <Col style={{ alignItems: "center" }}>
                    <Row gutterWidth={2} justify='end'>
                        <Col xs="content">
                            <Field name="type" label={{ enabled: false }}>
                                <SelectField size="small" keyField="value" textField="label" data={
                                    [{ value: "1", label: "Lotes da Ordem de Fabrico" },
                                    { value: "-1", label: "Todas os Lotes" }]} />
                            </Field>
                        </Col>
                    </Row>
                </Col>
            </FormContainer>
        </Col>
    } />);
}

const ActionContent = ({ dataAPI, hide, onClick, ...props }) => {
    const items = [
        { label: 'Eliminar Entrada', key: 'delete', icon: <DeleteOutlined /> }
    ];
    return (<Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />);
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'>
            <Field name="fof" label={{ enabled: true, text: "Ordem de Fabrico", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="fartigo" label={{ enabled: true, text: "Artigo", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="fdata" label={{ enabled: true, text: "Data Entrada", pos: "top", padding: "0px" }}>
                <RangeDateField size='small' allowClear />
            </Field>
        </Col>
    </>
    );
}


const Blinker = styled.div`
    animation: blinker 1s linear infinite;
    font-weight:700;
    font-size:22px;
    margin-right:3px;
    font-family:'Times New Roman', serif;
    @keyframes blinker {
        50% { opacity: 0; }
    }
`;

const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    }
});

export default ({ lastValue, setLastValue, parentRef, closeParent, minItems = 10, maxItems = 12 }) => {
    const permission = usePermission({ allowed: {} });
    const value = useRef('');
    const pick = useRef(true);
    const ref = useRef(null);
    const [current, setCurrent] = useState('');
    const [status, setStatus] = useState(true);
    const [form] = Form.useForm();
    const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/lotespick`, {
        onOpen: () => console.log(`Connected to Web Socket`),
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000
    });

    // useEffect(() => {
    //     if (lastJsonMessage !== null) {
    //         setLastValue(prev => ({ ...prev?.last && { last: { ...prev?.last } }, type: prev?.type, picked: true, row: { id: uuIdInt(0).uuid(), t_stamp: Date(), notValid: 1, qty_consumed: 0, qty_reminder: lastJsonMessage.row.qty_lote, ...lastJsonMessage.row }, error: lastJsonMessage.error }));
    //     }
    // }, [lastJsonMessage]);

    const onPick = () => {
        if (current !== '') {
            const v = current.startsWith("000026") ? current.replace("000026", "") : current.startsWith("\\000026") ? current.replace("\\000026", "") : current;
            console.log("PICK", v)
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
        console.log("bbbbbbbbbbbb")
        if (e?.srcElement?.className === "ant-input-number-input" || e?.srcElement?.className === "ant-select-selection-search-input") {
            setStatus(false);
            pick.current = false;
        } else {
            setStatus(true);
            pick.current = true;
            ref.current.focus();
        }
    }
    const focusOut = (e, src) => {
        // if (e?.srcElement?.className !== "ant-input-number-input" && e?.srcElement?.className !== "ant-select-selection-search-input") {
        setStatus(false);
        pick.current = false;
        // }
    }
    const paste = async (e) => {
        value.current = await navigator.clipboard.readText();
        setCurrent(value.current);
    }

    const onChange = (e) => {
        setCurrent(e.target.value);
        value.current = e.target.value;
    }

    useEffect(() => {
        ref.current.focus();
        //document.body.addEventListener('keydown', keydownHandler);
        document.body.addEventListener('focusout', focusOut);
        document.body.addEventListener('focusin', focusIn);
        //window.addEventListener('paste', paste);

        const items = [...Array(maxItems).fill(0).map((x, i) => ({ nlote: null, required: i < (minItems - 1) ? true : false }))];
        console.log("aaaaaaa",items)
        form.setFieldsValue({ items });

        return () => {
            //document.body.removeEventListener('keydown', keydownHandler);
            document.body.removeEventListener('focusout', focusOut);
            document.body.removeEventListener('focusin', focusIn);
            //window.removeEventListener('paste', paste);
        };
    }, []);
    return (
        <div style={{ width: "100%", height: "100vh" }} tabIndex={0}>
            <FormContainer id="pick-container" wrapForm form={form}>

                <Row align='center' gutterWidth={5}><Col>
                    <Row align='center' gutterWidth={5} style={{ border: status ? "solid 2px #1890ff" : "solid 2px #f0f0f0", height: "50px", margin: "10px 0px" }}>
                        <Col style={{ fontSize: "22px", fontWeight: 700 }}><Input style={{ border: "0px", fontSize: "18px", fontWeight: 700, height: "38px" }} ref={ref} value={current} onChange={onChange} onKeyDown={keydownHandler} /></Col>
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
                                        <Row key={field.key} nogutter style={{ padding: "10px", marginBottom: "10px", borderRadius: "3px", border: "1px solid rgba(5, 5, 5,0.1)" /* background: index % 2 ? "#d9eaff" : "#e9f3ff" */ }}>
                                            <Col width={30} style={{ display: "flex", flexDirection: "column", alignItems: "center", fontWeight: 700, fontSize: "15px" }}><div>{index + 1}</div></Col>
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