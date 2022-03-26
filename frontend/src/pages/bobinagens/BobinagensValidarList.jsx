import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { API_URL, GTIN } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues, getFilterValue, isValue } from 'utils';

import FormManager, { FieldLabel, FieldSet as OldFieldSet, FilterTags, AutoCompleteField as OldAutoCompleteField, useMessages, DropDown } from "components/form";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, InputAddon, SelectField, TitleForm, WrapperForm, SelectDebounceField, AutoCompleteField, RangeDateField, RangeTimeField, FilterDrawer, CheckboxField, SwitchField } from "components/formLayout";
import Drawer from "components/Drawer";
import Table, { setColumns } from "components/table";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import MoreFilters from 'assets/morefilters.svg';
import { Outlet, useNavigate } from "react-router-dom";
import YScroll from "components/YScroll";
import { MdAdjust } from 'react-icons/md';


import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge } from "antd";
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled } from '@ant-design/icons';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, BOBINE_DEFEITOS } from 'config';
const { Title } = Typography;
import { SocketContext } from '../App';
const BobinesValidarList = lazy(() => import('../bobines/BobinesValidarList'));


const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const filterRules = (keys) => {
    return getSchema({
        //field1: Joi.string().label("Designação")
    }, keys).unknown(true);
}

const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;

const filterSchema = ({ ordersField, customersField, itemsField, ordemFabricoStatusField }) => [
    { fbobinagem: { label: "Nº Bobinagem", field: { type: 'input', size: 'small' } } },
    { fdata: { label: "Data Bobinagem", field: { type: "rangedate", size: 'small' } } },
    { ftime: { label: "Início/Fim", field: { type: "rangetime", size: 'small' } } },
    { fduracao: { label: "Duração", field: { type: 'input', size: 'small' }, span: 12 } },
    { farea: { label: "Área", field: { type: 'input', size: 'small' }, span: 12 }, fdiam: { label: "Diâmetro", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcore: { label: "Core", field: { type: 'input', size: 'small' }, span: 12 }, fcomp: { label: "Comprimento", field: { type: 'input', size: 'small' }, span: 12 } },
    //Defeitos
    {
        freldefeitos: { label: " ", field: TipoRelation, span: 4 },
        fdefeitos: {
            label: 'Defeitos', field: {
                type: 'selectmulti', size: 'small', options: BOBINE_DEFEITOS
            }, span: 20
        }
    },
    //Estados
    {
        festados: {
            label: 'Estados', field: {
                type: 'selectmulti', size: 'small', options: BOBINE_ESTADOS
            }
        }
    },
    { fcliente: { label: "Cliente", field: { type: 'input', size: 'small' } } },
    { fdestino: { label: "Destino", field: { type: 'input', size: 'small' } } },
    //{ f_ofabrico: { label: "Ordem de Fabrico" } },
    //{ f_agg: { label: "Agregação Ordem de Fabrico" } },
    //{ fofstatus: { label: "Ordem de Fabrico: Estado", field: ordemFabricoStatusField, initialValue: 'all', ignoreFilterTag: (v) => v === 'all' } },
    //{ fmulti_order: { label: "Nº Encomenda/Nº Proforma", field: ordersField } },
    //{ fmulti_customer: { label: "Nº/Nome de Cliente", field: customersField } },
    //{ fmulti_item: { label: "Cód/Designação Artigo", field: itemsField } },
    //{ forderdate: { label: "Data Encomenda", field: { type: "rangedate", size: 'small' } } },
    //{ fstartprevdate: { label: "Data Prevista Início", field: { type: "rangedate", size: 'small' } } },
    //{ fendprevdate: { label: "Data Prevista Fim", field: { type: "rangedate", size: 'small' } } },

    /* { SHIDAT_0: { label: "Data Expedição", field: { type: "rangedate" } } },
    { LASDLVNUM_0: { label: "Nº Última Expedição" } },
    { ofstatus: { label: "Ordem de Fabrico: Estado", field: ordemFabricoStatusField, ignoreFilterTag: (v) => v === 'all' } } */
];

const ToolbarTable = ({ form, dataAPI }) => {
    const navigate = useNavigate();

    const leftContent = (
        <>
            <button onClick={() => navigate(-1)}>go back</button>
            {/* <Button type="primary" size="small" disabled={flyoutStatus.visible ? true : false} onClick={() => setFlyoutStatus(prev => ({ ...prev, visible: !prev.visible }))}>Flyout</Button> */}
        </>
    );

    const rightContent = (
        <Space>
            <div style={{ display: "flex", flexDirection: "row", whiteSpace: "nowrap" }}>

            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }}>
                <Form form={form} initialValues={{}}>
                    <FormLayout id="tbt-of" schema={schema}>
                    </FormLayout>
                </Form>
            </div>
        </Space>
    );
    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}

const GlobalSearch = ({ form, dataAPI, columns, setShowFilter, showFilter } = {}) => {
    const [changed, setChanged] = useState(false);
    const onFinish = (type, values) => {
        switch (type) {
            case "filter":
                (!changed) && setChanged(true);
                console.log(values);
                const _values = {
                    ...values,
                    fbobinagem: getFilterValue(values?.fbobinagem, 'any'),
                    fdata: getFilterRangeValues(values["fdata"]?.formatted),
                    ftime: getFilterRangeValues(values["ftime"]?.formatted),
                    fduracao: getFilterValue(values?.fduracao, '=='),
                    fcliente: getFilterValue(values?.fcliente, 'any'),
                    fdestino: getFilterValue(values?.fdestino, 'any'),
                    //f_ofabrico: getFilterValue(values?.f_ofabrico, 'exact'),
                    //f_agg: getFilterValue(values?.f_agg, 'exact'),
                    //fmulti_customer: getFilterValue(values?.fmulti_customer, 'any'),
                    //fmulti_order: getFilterValue(values?.fmulti_order, 'any'),
                    //fmulti_item: getFilterValue(values?.fmulti_item, 'any'),
                    //forderdate: getFilterRangeValues(values["forderdate"]?.formatted),
                    //fstartprevdate: getFilterRangeValues(values["fstartprevdate"]?.formatted),
                    //fendprevdate: getFilterRangeValues(values["fendprevdate"]?.formatted)
                };
                dataAPI.addFilters(_values);
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };

    const onValuesChange = (type, changedValues, allValues) => {
        switch (type) {
            case "filter":
                form.setFieldsValue(allValues);
                break;
        }
    }

    /*     const fetchCustomers = async (value) => {
            const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellcustomerslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_customer"]: `%${value.replaceAll(' ', '%%')}%` } });
            return rows;
        }
        const fetchOrders = async (value) => {
            const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellorderslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_order"]: `%${value.replaceAll(' ', '%%')}%` } });
            console.log("FETECHED", rows)
            return rows;
        }
        const fetchItems = async (value) => {
            const { data: { rows } } = await fetchPost({ url: `${API_URL}/sellitemslookup/`, pagination: { limit: 10 }, filter: { ["fmulti_item"]: `%${value.replaceAll(' ', '%%')}%` } });
            return rows;
        }
     */
    /* const customersField = () => (
        <AutoCompleteField
            placeholder="Cliente"
            size="small"
            keyField="BPCNAM_0"
            textField="BPCNAM_0"
            dropdownMatchSelectWidth={250}
            allowClear
            fetchOptions={fetchCustomers}
        />
    );
    const ordersField = () => (
        <AutoCompleteField
            placeholder="Encomenda/Prf"
            size="small"
            keyField="SOHNUM_0"
            textField="computed"
            dropdownMatchSelectWidth={250}
            allowClear
            fetchOptions={fetchOrders}
        />
    );
    const itemsField = () => (
        <AutoCompleteField
            placeholder="Artigo"
            size="small"
            keyField="ITMREF_0"
            textField="computed"
            dropdownMatchSelectWidth={250}
            allowClear
            fetchOptions={fetchItems}
        />
    ); */

    const downloadFile = (data, filename, mime, bom) => {
        var blobData = (typeof bom !== 'undefined') ? [bom, data] : [data]
        var blob = new Blob(blobData, { type: mime || 'application/octet-stream' });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
            // IE workaround for "HTML7007: One or more blob URLs were
            // revoked by closing the blob for which they were created.
            // These URLs will no longer resolve as the data backing
            // the URL has been freed."
            window.navigator.msSaveBlob(blob, filename);
        }
        else {
            var blobURL = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
            var tempLink = document.createElement('a');
            tempLink.style.display = 'none';
            tempLink.href = blobURL;
            tempLink.setAttribute('download', filename);

            // Safari thinks _blank anchor are pop ups. We only want to set _blank
            // target if the browser does not support the HTML5 download attribute.
            // This allows you to download files in desktop safari if pop up blocking
            // is enabled.
            if (typeof tempLink.download === 'undefined') {
                tempLink.setAttribute('target', '_blank');
            }

            document.body.appendChild(tempLink);
            tempLink.click();

            // Fixes "webkit blob resource error 1"
            setTimeout(function () {
                document.body.removeChild(tempLink);
                window.URL.revokeObjectURL(blobURL);
            }, 200);
        }
    }

    const menu = (
        <Menu onClick={(v) => exportFile(v)}>
            <Menu.Item key="pdf" icon={<FilePdfTwoTone twoToneColor="red" />}>Pdf</Menu.Item>
            <Menu.Item key="excel" icon={<FileExcelTwoTone twoToneColor="#52c41a" />}>Excel</Menu.Item>
            <Menu.Item key="word" icon={<FileWordTwoTone />}>Word</Menu.Item>
        </Menu>
    );

    const exportFile = async (type) => {
        const requestData = dataAPI.getPostRequest();

        requestData.parameters = {
            ...requestData.parameters,
            "config": "default",
            "orientation": "landscape",
            "template": "TEMPLATES-LIST/LIST-A4-${orientation}",
            "title": "Ordens de Fabrico",
            "export": type.key,
            cols: columns
        }
        delete requestData.parameters.cols.bobines;
        requestData.parameters.cols.area.title = "Área m2";
        const response = await fetchPostBlob(requestData);
        switch (type.key) {
            case "pdf":
                downloadFile(response.data, `list-${new Date().toJSON().slice(0, 10)}.pdf`);
                break;
            case "excel":
                downloadFile(response.data, `list-${new Date().toJSON().slice(0, 10)}.xlsx`);
                break;
            case "word":
                downloadFile(response.data, `list-${new Date().toJSON().slice(0, 10)}.docx`);
                break;
        }
    }

    return (
        <>

            <FilterDrawer schema={filterSchema({ form /* ordersField, customersField, itemsField */ })} filterRules={filterRules()} form={form} width={350} setShowFilter={setShowFilter} showFilter={showFilter} />
            <Form form={form} name={`fps`} onFinish={(values) => onFinish("filter", values)} onValuesChange={onValuesChange}>
                <FormLayout
                    id="LAY-BOBINAGENS"
                    layout="horizontal"
                    style={{ width: "700px", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{ guides: false, wide: [3, 4, 3, 1.5, 1.5], style: { marginLeft: "2px", alignSelf: "end" } }}
                    fieldSet={{ guides: false, wide: 16, margin: false, layout: "horizontal", overflow: false }}
                >
                    <Field name="fbobinagem" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Nº Bobinagem", pos: "top" }}>
                        <Input size='small' />
                    </Field>
                    <Field name="fdata" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Data Bobinagem", pos: "top" }}>
                        <RangeDateField size='small' />
                    </Field>
                    <Field name="ftime" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Início/Fim", pos: "top" }}>
                        <RangeTimeField size='small' format={TIME_FORMAT} />
                    </Field>
                    {/*                     <Field name="fmulti_customer" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Cliente", pos: "top" }}>
                        {customersField()}
                    </Field>
                    <Field name="fmulti_order" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Encomenda/Prf", pos: "top" }}>
                        {ordersField()}
                    </Field>
                    <Field name="fmulti_item" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Artigo", pos: "top" }}>
                        {itemsField()}
                    </Field>
                    <Field name="forderdate" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Data Encomenda", pos: "top" }}>
                        <RangeDateField size='small' />
    </Field>*/}
                    <FieldItem label={{ enabled: false }}>
                        <ButtonGroup size='small' style={{ marginLeft: "5px" }}>
                            <Button style={{ padding: "0px 3px" }} onClick={() => form.submit()}><SearchOutlined /></Button>
                            <Button style={{ padding: "0px 3px" }}><MoreFilters style={{ fontSize: "16px", marginTop: "2px" }} onClick={() => setShowFilter(prev => !prev)} /></Button>
                        </ButtonGroup>
                    </FieldItem>
                    <FieldItem label={{ enabled: false }}><Dropdown overlay={menu}>
                        <Button size="small" icon={<FileFilled />}><DownOutlined /></Button>
                    </Dropdown>
                    </FieldItem>
                </FormLayout>
            </Form>
        </>
    );
}

const StyledBobine = styled.div`
    border:dashed 1px #000;
    background-color:${props => props.color};
    border-radius:3px;
    margin-right:1px;
    text-align:center;
    width:25px;
    font-size:9px;
    cursor:pointer;
    &:hover {
        border-color: #d9d9d9;
    }
`;

const useStyles = createUseStyles({
    columnBobines: {
        width: '25px',
        textAlign: "center",
        marginRight: "1px"
    }
})

const ColumnBobines = ({ n }) => {
    const classes = useStyles();
    return (<div style={{ display: "flex", flexDirection: "row" }}>
        {[...Array(n)].map((x, i) =>
            <div className={classes.columnBobines} key={`bh-${i}`}>{i + 1}</div>
        )}
    </div>);
}

const bColors = (estado) => {
    if (estado === "G") {
        return "#237804";//"green";
    } else if (estado === "DM") {
        return "#fadb14";//"gold";
    } else if (estado === "R") {
        return "#ff1100";//"red";
    } else if (estado === "LAB") {
        return "#13c2c2";//"cyan";
    } else if (estado === "BA") {
        return "#ff1100";//"red";
    } else if (estado === "IND") {
        return "#0050b3";//"blue";
    } else if (estado === "HOLD") {
        return "#391085";//"purple";
    }
}

const Bobines = ({ b, bm, setShow }) => {
    let bobines = b;

    const handleClick = () => {
        console.log("OI", bm.id)
        setShow({ show: true, data: { bobinagem_id: bm.id, bobinagem_nome: bm.nome } });
    };

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {bobines.map((v, i) => {
                return (<StyledBobine onClick={handleClick} color={bColors(v.estado)} key={`bob-${v.id}`}><b>{v.estado}</b><div>{v.lar}</div></StyledBobine>);
            })}
        </div>
    );
};

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};


const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    input,
    handleSave,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
        if (editing) {
            inputRef.current.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{
                    margin: 0,
                }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                {React.isValidElement(input) ? React.cloneElement(input, { ref: inputRef, onPressEnter: save, onBlur: save, ...input.props }) : <Input ref={inputRef} onPressEnter={save} onBlur={save} />}
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{
                    paddingRight: 24,
                }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

const TitleValidar = ({ data }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Space>
                    <div><b style={{ textTransform: "capitalize" }}></b>Validar/Classificar a Bobinagem {data.bobinagem_nome}</div>
                </Space>
            </div>
        </div>
    );
}

const ModalValidar = ({ show, setShow }) => {
    const [confirmLoading, setConfirmLoading] = React.useState(false);

    const handleCancel = () => {
        setShow({ show: false, data: {} });
    };

    return (
        <>
            <Modal
                title={<TitleValidar data={show.data}/* aggCod={aggCod} */ />}
                visible={show.show}
                centered
                onCancel={handleCancel}
                confirmLoading={confirmLoading}
                maskClosable={true}
                footer={null}
                destroyOnClose={true}
                bodyStyle={{ height: "calc(100vh - 60px)"/* , backgroundColor: "#f0f0f0" */ }}
                width={"100%"}
            >
                <YScroll>
                    <Suspense fallback={<></>}>{<BobinesValidarList data={show.data} />}</Suspense>
                </YScroll>
            </Modal>
        </>
    );
};

// const formSchema = (keys, excludeKeys) => {
//     return getSchema({
//         /* npaletes: Joi.number().positive().label("Paletes/Contentor").required(),
//         palete_maxaltura: Joi.number().positive().precision(2).label("Altura Máx. Palete (metros)").required(),
//         //designacao: Joi.string().label("Designação").required(),
//         netiquetas_bobine: Joi.number().positive().precision(2).label("Etiqueta/Bobine").required(),
//         netiquetas_lote: Joi.number().positive().precision(2).label("Etiqueta do Lote da Palete").required(),
//         netiquetas_final: Joi.number().positive().precision(2).label("Etiqueta Final da Palete").required(),
//         folha_identificativa: Joi.number().min(0).precision(2).label("Folha Identificativa Palete").required(),
//         cintas: Joi.number().valid(0, 1),
//         ncintas: Joi.when('cintas', { is: 1, then: Joi.number().positive().required() }),
//         paletizacao: Joi.array().min(1).label("Items da Paletização").required() */
//     }, keys, excludeKeys).unknown(true);
// };

// const BobinagemValidarForm = ({ data, wrapForm = "form", forInput = true }) => {
//     const { bobinagem, bobines } = data;
//     const [form] = Form.useForm();
//     const [resultMessage, setResultMessage] = useState({ status: "none" });
//     const [changedValues, setChangedValues] = useState({});
//     const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });


//     const onValuesChange = (changedValues, allValues) => {
//         console.log("chv-------", changedValues)
//         setChangedValues(changedValues);
//     }

//     const onFinish = async (values) => {
//         const status = { error: [], warning: [], info: [], success: [] };
//         setFormStatus(status);
//     }


//     return (

//         <Form form={form} name={`fpv`} onFinish={onFinish} onValuesChange={onValuesChange} component={wrapForm}>
//             <FormLayout
//                 id="LAY-VALIDAR-BM"
//                 guides={false}
//                 layout="vertical"
//                 style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
//                 schema={formSchema}
//                 field={{
//                     forInput,
//                     wide: [16],
//                     margin: "0px", overflow: false, guides: false,
//                     label: { enabled: true, pos: "top", align: "start", vAlign: "center", /* width: "80px", */ wrap: false, overflow: false, colon: true, ellipsis: true },
//                     alert: { pos: "right", tooltip: true, container: false /* container: "el-external" */ },
//                     layout: { top: "", right: "", center: "", bottom: "", left: "" },
//                     required: true,
//                     style: { alignSelf: "center" }
//                 }}
//                 fieldSet={{
//                     guides: false,
//                     wide: 16, margin: "0px", layout: "horizontal", overflow: false
//                 }}
//             >

//                 <FieldSet layout="vertical" wide={16}>
//                     <Form.List name="validacao_bobines_list">
//                         {(fields, { add, remove, move }) => {
//                             const addRow = (fields) => {
//                                 add({ item_id: 1, item_paletesize: '970x970', item_numbobines: 10 }, 0);
//                             }
//                             /*const removeRow = (fieldName) => {
//                                 remove(fieldName);
//                             }
//                             const moveRow = (from, to) => {
//                                 move(from, to);
//                             } */
//                             return (
//                                 <>
//                                     <FieldSet margin="5px">
//                                         {forInput && <Button type="dashed" onClick={() => addRow(fields)} style={{ width: "100%" }}><UserOutlined />Adicionar</Button>}
//                                     </FieldSet>
//                                     {fields.map((field, index) => (


//                                         <FieldSet layout="vertical" field={{ wide: [16] }} key={field.key}>
//                                             <FieldSet layout="horizontal" field={{ wide: [1, 15] }} style={{ justifyContent: "center" }}>
//                                                 <Button style={{ alignSelf: "center" }} icon={<MdAdjust />} />
//                                                 <div style={{ display: "flex", flexDirection: "row" }}>{data.bobines.map((v, i) => {
//                                                     return (
//                                                         <div key={`bl-${i}`}>
//                                                             {/* <div style={{ textAlign: "center" }}>{i}</div> */}
//                                                             <StyledBobine color={bColors(v.estado)}>
//                                                                 <Field label={{ enabled: false }} name={[field.name, `bobine_id_${i}`]}>
//                                                                     <CheckboxField />
//                                                                 </Field>
//                                                                 <b>{v.estado}</b><b>{i}</b><div>{v.lar}</div>
//                                                                 <Field label={{ enabled: false }} name={[field.name, `largura_${i}`]}>
//                                                                     <Input />
//                                                                 </Field>
//                                                             </StyledBobine>
//                                                         </div>
//                                                     );
//                                                 })}</div>
//                                             </FieldSet>

//                                             {/*                                             <FieldSet layout="vertical" field={{ wide: [16] }}>
//                                                 <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid" }}>
//                                                     <tr>
//                                                         <th style={{ border: "1px solid" }}>Classificação</th>
//                                                         <th style={{ border: "1px solid" }}>Lastname</th>
//                                                     </tr>
//                                                     <tr>
//                                                         <td style={{ border: "1px solid" }}>Peter</td>
//                                                         <td style={{ border: "1px solid" }}><Field name={[field.name, `nok`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field></td>
//                                                     </tr>
//                                                     <tr>
//                                                         <td style={{ border: "1px solid" }}>Lois</td>
//                                                         <td style={{ border: "1px solid" }}>Griffin</td>
//                                                     </tr>
//                                                 </table>
//                                             </FieldSet> */}

//                                             <FieldSet layout="vertical" field={{ wide: [15] }} style={{ marginTop: "5px" }}>
//                                                 <FieldSet layout="horizontal" style={{ backgroundColor: "#e6f7ff", border: "solid 1px #595959", textAlign: "right" }} field={{ wide: [2, 1, 2, 1, 2, 1, 2, 1, 3, 1], label: { enabled: false }, padding: "2px" }}>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3" }}>Largura NOK</FieldItem>
//                                                     <Field name={[field.name, `nok`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Cónico</FieldItem>
//                                                     <Field name={[field.name, `con`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Descentrada</FieldItem>
//                                                     <Field name={[field.name, `desc`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Presa</FieldItem>
//                                                     <Field name={[field.name, `presa`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Diâmetro</FieldItem>
//                                                     <Field name={[field.name, `diam`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                 </FieldSet>
//                                                 <FieldSet layout="horizontal" style={{ backgroundColor: "#e6f7ff", border: "solid 1px #595959", textAlign: "right" }} field={{ wide: [2, 1, 2, 1, 2, 1, 2, 1, 3, 1], label: { enabled: false }, padding: "2px" }}>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3" }}>Sujidade</FieldItem>
//                                                     <Field name={[field.name, `suj`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Carro Atrás</FieldItem>
//                                                     <Field name={[field.name, `carro`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Não Colou</FieldItem>
//                                                     <Field name={[field.name, `ncolou`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Sobretiragem</FieldItem>
//                                                     <Field name={[field.name, `sobr`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Falha Corte</FieldItem>
//                                                     <Field name={[field.name, `falhacorte`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                 </FieldSet>
//                                                 <FieldSet layout="horizontal" style={{ backgroundColor: "#e6f7ff", border: "solid 1px #595959", textAlign: "right" }} field={{ wide: [2, 1, 2, 1, 2, 1, 2, 1, 3, 1], label: { enabled: false }, padding: "2px" }}>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3" }}>Inicio Diam. (mm)</FieldItem>
//                                                     <Field name={[field.name, `inicio_diam`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Fim Diam. (mm)</FieldItem>
//                                                     <Field name={[field.name, `fim_diam`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Falha Filme</FieldItem>
//                                                     <Field name={[field.name, `falhafilme`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Início Metros Desb. (m)</FieldItem>
//                                                     <Field name={[field.name, `iniciodesb`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Fim Metros Desb. (m)</FieldItem>
//                                                     <Field name={[field.name, `fimdesb`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                 </FieldSet>
//                                                 <FieldSet layout="horizontal" style={{ backgroundColor: "#e6f7ff", border: "solid 1px #595959", textAlign: "right" }} field={{ wide: [2, 1, 2, 1, 2, 1, 2, 1, 3, 1], label: { enabled: false }, padding: "2px" }}>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3" }}>Falha M.P.</FieldItem>
//                                                     <Field name={[field.name, `falha_mp`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Furos</FieldItem>
//                                                     <Field name={[field.name, `furos`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Buracos Gram.</FieldItem>
//                                                     <Field name={[field.name, `buracos`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Início Metros Desb. (m)</FieldItem>
//                                                     <Field name={[field.name, `iniciodesb`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                     <FieldItem style={{ backgroundColor: "#eaeef3", borderRight: "none", borderLeft: "solid 1px #595959" }}>Fim Metros Desb. (m)</FieldItem>
//                                                     <Field name={[field.name, `fimdesb`]} style={{ backgroundColor: "#f5f5f5", borderLeft: "solid 1px #595959", textAlign: "center" }}><SwitchField size="small" /></Field>
//                                                 </FieldSet>
//                                             </FieldSet>


//                                         </FieldSet>

//                                     ))}
//                                 </>
//                             );
//                         }}
//                     </Form.List>
//                 </FieldSet>



//             </FormLayout>
//         </Form>
//     );
// }


export default () => {
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false, data: {} });
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/validarbobinagenslist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 10 }, filter: {}, sort: [{ column: 'data', direction: 'DESC' }] } });
    const elFilterTags = document.getElementById('filter-tags');
    const { data: dataSocket } = useContext(SocketContext) || {};

    /*     useEffect(() => {
            const cancelFetch = cancelToken();
            dataAPI.first();
            dataAPI.fetchPost({token: cancelFetch });
            return (() => cancelFetch.cancel());
        }, []); */

    useEffect(() => {
        console.log("NOVA BOBINAGEM DETETADA...", dataSocket);
        const cancelFetch = cancelToken();
        dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, [dataSocket]);

    const selectionRowKey = (record) => {
        return `${record.id}`;
    }

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "bobinagenslist_validar",
            include: {
                ...((common) => (
                    {
                        nome: { title: "Bobinagem", width: 60, render: v => <span style={{ color: "#096dd9", cursor: "pointer" }}>{v}</span>, ...common },
                        /* data: { title: "Data", render: (v, r) => dayjs(v).format(DATE_FORMAT), ...common }, */
                        inico: { title: "Início", render: (v, r) => dayjs('01-01-1970 ' + v).format(TIME_FORMAT), ...common },
                        fim: { title: "Fim", render: (v, r) => dayjs('01-01-1970 ' + v).format(TIME_FORMAT), ...common },
                        duracao: { title: "Duração", width: 20, render: (v, r) => v, ...common },
                        core: { title: "Core", width: 5, render: (v, r) => v, ...common },
                        comp: { title: "Comp.", render: (v, r) => v, editable: true, input: <InputNumber />, ...common },
                        comp_par: { title: "Comp. Emenda", render: (v, r) => v, ...common },
                        comp_cli: { title: "Comp. Cliente", render: (v, r) => v, ...common },
                        area: { title: <span>Área m&#178;</span>, render: (v, r) => v, ...common },
                        diam: { title: "Diâmetro mm", render: (v, r) => v, ...common },
                        nwinf: { title: "Nw Inf. m", render: (v, r) => v, ...common },
                        nwsup: { title: "Nw Sup. m", render: (v, r) => v, ...common },
                        bobines: { title: <ColumnBobines n={28} />, sorter: false, render: (v, r) => <Bobines b={JSON.parse(v)} bm={r} setShow={setShowValidar} />, ...common }
                        //cod: { title: "Agg", width: 140, render: v => <span style={{ color: "#096dd9" }}>{v}</span>, ...common },
                        //ofabrico: { title: "Ordem Fabrico", width: 140, render: v => <b>{v}</b>, ...common },
                        //prf: { title: "PRF", width: 140, render: v => <b>{v}</b>, ...common },
                        //iorder: { title: "Encomenda(s)", width: 140, ...common },
                        /* ofabrico_sgp: { title: "OF.SGP", width: 60, render: v => <>{v}</>, ...common }, */
                        //estado: { title: "", width: 125, ...common },
                        /* options: { title: "", sort: false, width: 25, render: (v, r) => <ActionButton content={<MenuActionButton record={r} />} />, ...common }, */
                        //item: { title: "Artigo(s)", width: 140, render: v => <>{v}</>, ...common },
                        //item_nome: { title: "Artigo(s)", ellipsis: true, render: v => <div style={{ /* overflow:"hidden", textOverflow:"ellipsis" */whiteSpace: 'nowrap' }}>{v}</div>, ...common },
                        //cliente_nome: { title: "Cliente(s)", ellipsis: true, render: v => <div style={{ whiteSpace: 'nowrap' }}><b>{v}</b></div>, ...common },
                        //start_date: { title: "Início Previsto", ellipsis: true, render: (v, r) => <div style={{ whiteSpace: 'nowrap' }}><span>{dayjs((r.start_prev_date) ? r.start_prev_date : v).format(DATETIME_FORMAT)}</span></div>, ...common },
                        //end_date: { title: "Fim Previsto", ellipsis: true, render: (v, r) => <div style={{ whiteSpace: 'nowrap' }}><span>{dayjs((r.end_prev_date) ? r.end_prev_date : v).format(DATETIME_FORMAT)}</span></div>, ...common },
                        //produzidas: { title: "Produzidas", width: 100, render: (v, r) => <ColumnProgress type={1} record={r} />, ...common },
                        //pstock: { title: "Para Stock", width: 100, render: (v, r) => <ColumnProgress type={2} record={r} />, ...common },
                        //total: { title: "Total", width: 100, render: (v, r) => <ColumnProgress type={3} record={r} />, ...common },
                        /* details: {
                            title: "", width: 50, render: (v, r) => <Space>
                                {r.stock == 1 && <GrStorage title="Para Stock" />}
                                {r.retrabalho == 1 && <RiRefreshLine title="Para Retrabalho" />}
                            </Space>, table: "sgp_op", ...common
                        } */


                        //PRFNUM_0: { title: "Prf", width: '160px', ...common },
                        //DSPTOTQTY_0: { title: "Quantidade", width: '160px', ...common }
                        //COLUNA2: { title: "Coluna 2", width: '160px', render: v => dayjs(v).format(DATE_FORMAT), ...common },
                        //COLUNA3: { title: "Coluna 3", width: '20%', render: v => <div style={{ whiteSpace: 'nowrap' }}><b>{v}</b></div>, ...common }
                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                <ModalValidar show={showValidar} setShow={setShowValidar} />
                <ToolbarTable form={formFilter} dataAPI={dataAPI} />
                {elFilterTags && <Portal elId={elFilterTags}>
                    <FilterTags form={formFilter} filters={dataAPI.getAllFilter()} schema={filterSchema} rules={filterRules()} />
                </Portal>}
                <Table
                    title={<Title level={4}>Validar Bobinagens da Linha 1</Title>}
                    columnChooser={false}
                    reload
                    stripRows
                    darkHeader
                    size="small"
                    toolbar={<GlobalSearch columns={columns?.report} form={formFilter} dataAPI={dataAPI} setShowFilter={setShowFilter} showFilter={showFilter} />}
                    selection={{ enabled: false, rowKey: record => selectionRowKey(record), onSelection: setSelectedRows, multiple: false, selectedRows, setSelectedRows }}
                    paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                    dataAPI={dataAPI}
                    columns={columns}
                    onFetch={dataAPI.fetchPost}
                    components={components}
                //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}
                />
            </Spin>
        </>
    )
}