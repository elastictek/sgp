import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues, getFilterValue, isValue, noValue } from 'utils';
import uuIdInt from "utils/uuIdInt";
import FormManager, { FieldLabel, FieldSet as OldFieldSet, FilterTags, AutoCompleteField as OldAutoCompleteField, useMessages, DropDown } from "components/form";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, InputAddon, SelectField, TitleForm, WrapperForm, SelectDebounceField, AutoCompleteField, RangeDateField, RangeTimeField, FilterDrawer, CheckboxField, SwitchField, SelectMultiField } from "components/formLayout";
import Drawer from "components/Drawer";
import Table, { setColumns } from "components/table";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import ResponsiveModal from "components/ResponsiveModal";
import MoreFilters from 'assets/morefilters.svg';
import { Outlet, useNavigate } from "react-router-dom";
import YScroll from "components/YScroll";
import { MdAdjust } from 'react-icons/md';
import { GiBandageRoll } from 'react-icons/gi';
import { AiOutlineVerticalAlignTop, AiOutlineVerticalAlignBottom } from 'react-icons/ai';
import { VscDebugStart } from 'react-icons/vsc';
import { BsFillStopFill } from 'react-icons/bs';
import { IoCodeWorkingOutline } from 'react-icons/io5';






import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge, DatePicker, message } from "antd";
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled } from '@ant-design/icons';

import Icon, { ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SwapRightOutlined, CheckSquareTwoTone, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined, LoadingOutlined, UnorderedListOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, BOBINE_DEFEITOS, API_URL, GTIN, SCREENSIZE_OPTIMIZED, DOSERS } from 'config';
const { Title } = Typography;


const mainTitle = 'Relat??rio de Expedi????es Mensal';

const useStyles = createUseStyles({});

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const filterRules = (keys) => {
    return getSchema({
        fmes: Joi.any().label("M??s").required(),
        fyear: Joi.any().label("Ano").required()
    }, keys).unknown(true);
}

const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;

const ToolbarTable = ({ form, dataAPI }) => {
    //const navigate = useNavigate();

    const onChange = (v) => {
        form.submit();
    }

    const leftContent = (
        <>
            {/* <button onClick={() => navigate(-1)}>go back</button> */}
            {/* <Button type="primary" size="small" disabled={flyoutStatus.visible ? true : false} onClick={() => setFlyoutStatus(prev => ({ ...prev, visible: !prer.visible }))}>Flyout</Button> */}
        </>
    );

    const rightContent = (
        <Space>
            <div style={{ display: "flex", flexDirection: "row", whiteSpace: "nowrap" }}>

            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }}>
                {/* <Form form={form} initialValues={{ typelist: [] }}>
                    <Form.Item name="typelist" noStyle>
                        {typeListField({ onChange, typeList })}
                    </Form.Item>
                </Form> */}
            </div>
        </Space>
    );
    return (
        <>{/* <Toolbar left={leftContent} right={rightContent} /> */}</>
    );
}


const MesField = ({ onChange } = {}) => {
    return (
        <SelectField onChange={onChange} keyField="value" valueField="label" size="small" style={{ width: 150 }} options={
            [{ value: "1", label: "Janeiro" },
            { value: "2", label: "Fevereiro" },
            { value: "3", label: "Mar??o" },
            { value: "4", label: "Abril" },
            { value: "5", label: "Maio" },
            { value: "6", label: "Junho" },
            { value: "7", label: "Julho" },
            { value: "8", label: "Agosto" },
            { value: "9", label: "Setembro" },
            { value: "10", label: "Outubro" },
            { value: "11", label: "Novembro" },
            { value: "12", label: "Dezembro" }
            ]
        } />
    );
}

const filterSchema = ({ }) => [];

const PopupProgress = ({ controller, content }) => {
    const oc = ()=>{
        controller.abort("Aborting Download");
        console.log(controller);
    }
    return (<div>
        <Button onClick={oc}>Cancelar</Button>
        {content}
    </div>);
}

const GlobalSearch = ({ form, dataAPI, columns, setShowFilter, showFilter } = {}) => {
    const [changed, setChanged] = useState(false);
    const onFinish = (type, values) => {
        switch (type) {
            case "filter":
                (!changed) && setChanged(true);
                const { typelist, ...vals } = values;


                //if (!v.error) {
                //    response = await onAction(data, action, { ...values, artigo_nome: item_nome, main_gtin: GTIN });
                // }

                const _values = {
                    ...vals,
                    fmes: vals["fmes"], //getFilterValue(vals["fmes"],"=="),
                    fyear: vals["fyear"]?.year() //getFilterValue(vals["fyear"]?.year(),"==")
                };

                dataAPI.addFilters(_values);
                dataAPI.addParameters({ typelist })
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
            <Menu.Item key="clean-excel" icon={<FileExcelTwoTone twoToneColor="#52c41a" />}>Excel Sem Formata????o</Menu.Item>
        </Menu>
    );

    const exportFile = async (type) => {

        let v = filterRules().validate(form.getFieldsValue(true), { abortEarly: false });
        if (v.error) {
            Modal.error({ title: "Erro!", content: "Os Filtros M??s e Ano t??m de estar preenchidos!" });
        } else {


            const requestData = dataAPI.getPostRequest();

            requestData.parameters = {
                ...requestData.parameters,
                "config": "default",
                "orientation": "landscape",
                "template": "TEMPLATES-LIST/LIST-A4-${orientation}",
                "title": mainTitle,
                "export": type.key,
                cols: columns
            };
            const controller = new AbortController();
            requestData.signal=controller.signal;
            let mkey = uuIdInt(4);
            message.loading({
                key: mkey,
                content: <PopupProgress controller={controller} content={<div>A exportar, aguarde um momento, Por favor...[Limite 5000 linhas]</div>} />,
                duration: 0
                //onClick: (() => message.destroy(mkey))
            });
            //const hide = message.loading(<PopupProgress cancelToken={cancelFetch} content={<div>A exportar, aguarde um momento, Por favor...[Limite 5000 linhas]</div>}/>, 0,()=>{console.log("0000")});
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
                case "clean-excel":
                    downloadFile(response.data, `list-${new Date().toJSON().slice(0, 10)}.xlsx`);
                    break;
            }
            message.destroy(mkey);
            //hide();
        }
    }

    return (
        <>

            {/*  <FilterDrawer schema={filterSchema({ form })} filterRules={filterRules()} form={form} width={350} setShowFilter={setShowFilter} showFilter={showFilter} /> */}
            <Form form={form} name={`fps`} onFinish={(values) => onFinish("filter", values)} onValuesChange={onValuesChange} onKeyPress={(e) => {if (e.key === "Enter") {form.submit();}}}>
                <FormLayout
                    id="LAY"
                    layout="horizontal"
                    style={{ width: "700px", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{ guides: false, wide: [4, 4, 1.5, 1.5], style: { marginLeft: "2px", alignSelf: "end" } }}
                    fieldSet={{ guides: false, wide: 16, margin: false, layout: "horizontal", overflow: false }}
                >
                    <Field name="fmes" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "M??s", pos: "top" }}>
                        <MesField />
                    </Field>
                    <Field name="fyear" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Ano", pos: "top" }}>
                        <DatePicker size="small" picker="year" />
                    </Field>
                    <FieldItem label={{ enabled: false }}>
                        <ButtonGroup size='small' style={{ marginLeft: "5px" }}>
                            <Button style={{ padding: "0px 3px" }} onClick={() => form.submit()}><SearchOutlined /></Button>
                            {/* <Button style={{ padding: "0px 3px" }}><MoreFilters style={{ fontSize: "16px", marginTop: "2px" }} onClick={() => setShowFilter(prev => !prev)} /></Button> */}
                        </ButtonGroup>
                    </FieldItem>
                    <FieldItem label={{ enabled: false }}><Dropdown overlay={menu} trigger={['click']}>
                        <Button size="small" icon={<FileFilled />}><DownOutlined /></Button>
                    </Dropdown>
                    </FieldItem>
                </FormLayout>
            </Form>
        </>
    );
}




export default () => {
    const classes = useStyles();
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/expedicoestempolist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: {}, sort: [] } });
    const elFilterTags = document.getElementById('filter-tags');

    useEffect(() => {
        const cancelFetch = cancelToken();
        dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, []);

    const selectionRowKey = (record) => {
        return `${record.nome_bobine}`;
    }

    const reload = () => {
        dataAPI.fetchPost();
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "listexptime",
            include: {
                ...((common) => (
                    {
                        "expedicao": { title: "Expedi????o", fixed: "left", width: 150, render: (v, r) => <b>{v}</b>, ...common },
                        "ITMDES1_0": { title: "Artigo", width: 250, render: (v, r) => <b>{v}</b>, ...common },
                        "ITMREF_0": { title: "Artigo C??d.", width: 150, render: (v, r) => v, ...common },
                        "ano": { title: "Ano", width: 100, render: (v, r) => v, ...common },
                        "mes": { title: "M??s", width: 100, render: (v, r) => v, ...common },
                        "encomenda": { title: "Encomenda", width: 150, render: (v, r) => v, ...common },
                        "BPCNAM_0": { title: "Cliente", width: 250, render: (v, r) => v, ...common },
                        "LOT_0": { title: "Palete", width: 100, render: (v, r) => v, ...common },
                        "nome_bobine": { title: "Bobine", width: 100, render: (v, r) => v, ...common },
                        "IPTDAT_0": { title: "Data Expedi????o", width: 130, render: (v, r) => v && dayjs(v).format(DATETIME_FORMAT), ...common },
                        "data_bobine": { title: "Data Bobine", width: 130, render: (v, r) => v && dayjs(v).format(DATETIME_FORMAT), ...common },
                        "DEMDLVDAT_0": { title: "Data Solicitada", width: 130, render: (v, r) => v && dayjs(v).format(DATETIME_FORMAT), ...common },
                        "EECICT_0": { title: "Incoterm", width: 80, render: (v, r) => v, ...common },
                        "diff": { title: "N. Dias", width: 80, render: (v, r) => v, ...common },
                        "exp": { title: "Expedi????o (Dias)", align: "center", width: 120, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}>{r.min_expedicao}/{r.avg_expedicao}/{r.max_expedicao}</div>, ...common },
                        "enc": { title: "Encomenda (Dias)", align: "center", width: 120, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}>{r.min_encomenda}/{r.avg_encomenda}/{r.max_encomenda}</div>, ...common },
                        "pal": { title: "Palete (Dias)", align: "center", width: 120, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}>{r.min_palete}/{r.avg_palete}/{r.max_palete}</div>, ...common },
                        "mesano": { title: "M??s/Ano (Dias)", align: "center", width: 120, render: (v, r) => <div style={{ display: "flex", flexDirection: "row" }}>{r.min_mesano}/{r.avg_mesano}/{r.max_mesano}</div>, ...common },
                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    return (
        <>
            <Spin spinning={dataAPI.isLoading()} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                <Table
                    title={<Title level={4}>{mainTitle}</Title>}
                    columnChooser={false}
                    reload
                    rowHover={false}
                    stripRows={false}
                    darkHeader
                    rowClassName={(record) => (record.nome || record.type !== 1) ? 'data-row' : `data-row ${classes.noRelationRow}`}
                    size="small"
                    toolbar={<GlobalSearch columns={columns?.report} form={formFilter} dataAPI={dataAPI} setShowFilter={setShowFilter} showFilter={showFilter} />}
                    selection={{ enabled: false, rowKey: record => selectionRowKey(record), onSelection: setSelectedRows, multiple: false, selectedRows, setSelectedRows }}
                    paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                    dataAPI={dataAPI}
                    columns={columns}
                    onFetch={dataAPI.fetchPost}
                    scroll={{ x: (SCREENSIZE_OPTIMIZED.width - 20), y: '70vh', scrollToFirstRowOnChange: true }}
                //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}
                />
            </Spin>
        </>
    )
}