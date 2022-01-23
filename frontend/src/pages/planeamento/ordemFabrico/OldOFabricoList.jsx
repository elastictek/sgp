import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues, isValue } from 'utils';

import FormManager, { FieldLabel, FieldSet as OldFieldSet, TitleForm, WrapperForm, FilterDrawer, SelectField, FilterTags, AutoCompleteField, useMessages, DropDown } from "components/form";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer } from "components/formLayout";
import Table, { setColumns } from "components/table";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import MoreFilters from 'assets/morefilters.svg'
import SubLayout from "components/SubLayout";
import Container from "components/container";
import ProgressBar from "components/ProgressBar";
import ActionButton from "components/ActionButton";
import TagButton from "components/TagButton";
import { GrStorage } from "react-icons/gr";
import { RiRefreshLine } from "react-icons/ri";

import FormOFabricoValidar from './ordemFabrico/FormOFabricoValidar';



import { Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification } from "antd";
const { Option } = Select;

import Icon, { SearchOutlined, UserOutlined, DownOutlined, ProfileOutlined, RightOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, SyncOutlined, CheckOutlined, EllipsisOutlined, MenuOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
const { Title } = Typography;

const filterRules = (keys) => {
    return getSchema({
        //field1: Joi.string().label("Designação")
    }, keys).unknown(true);
}

const filterSchema = ({ /*field_multi, field_daterange, field*/ }) => [
    /*{ field1: { label: "field", field: field } },
    { field2: { label: "Date Range", field: { type: "rangedate" } } },
    { field3: { label: "Multi", field: field_multi } }*/
];

const ToolbarTable = ({ form, dataAPI, setFlyoutStatus, flyoutStatus }) => {
    const leftContent = (
        <>
            <Button type="primary" size="small" disabled={flyoutStatus.visible ? true : false} onClick={() => setFlyoutStatus(prev => ({ ...prev, visible: !prev.visible }))}>Flyout</Button>
        </>
    );

    const rightContent = (
        <Space>
            <div style={{ display: "flex", flexDirection: "row", whiteSpace: "nowrap" }}>
                Right Content Element
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }}>
                Another Right Content Element
            </div>
        </Space>
    );

    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}

const GlobalSearch = ({ form, dataAPI, setShowFilter, showFilter, ordemFabricoStatusField } = {}) => {
    const [formData, setFormData] = useState({});
    const [changed, setChanged] = useState(false);
    const onFinish = (type, values) => {
        switch (type) {
            case "filter":
                (!changed) && setChanged(true);
                const _values = {
                    ...values
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

    return (
        <>
            <FilterDrawer schema={filterSchema({ form })} filterRules={filterRules()} form={form} width={350} setShowFilter={setShowFilter} showFilter={showFilter} />
            <FormManager
                visible={true}
                form={form}
                name="feature-form-1"
                layout="horizontal"
                onFinish={(values) => onFinish("filter", values)}
                onValuesChange={(changedValues, allValues) => onValuesChange("filter", changedValues, allValues)}
                //messages={messages}
                /* formData={formData} */
                style={{ minWidth: "40vw" }}
                rowGap="10px"
                field={{ /* split: 3, */ layout: "vertical", gap: "5px", overflow: false, labelStyle: { align: "left" /* width: "90px", align: "right", gap: "10px" */ }, alert: { position: "right", visible: true } }}
                fieldSet={{ wide: 4, layout: "horizontal", overflow: false, grow: false /* alert: { position: "right", visible: true } */, alert: { position: "bottom", visible: true } }}
            >
                <OldFieldSet wide={2} style={{ alignItems: "flex-end", justifyContent: "flex-start" }}>


                    <ButtonGroup>
                        <Button style={{ padding: "3px" }} onClick={() => form.submit()}><SearchOutlined /></Button>
                        <Button style={{ padding: "3px" }}><MoreFilters style={{ fontSize: "16px", marginTop: "2px" }} onClick={() => setShowFilter(prev => !prev)} /></Button>
                        {/* <Dropdown overlay={menu}>
                            <Button style={{ padding: "3px" }}><DownOutlined /></Button>
                        </Dropdown> */}
                    </ButtonGroup>

                </OldFieldSet>
            </FormManager>
        </>
    );
}

const ModalValidar = ({ showValidar, setShowValidar }) => {
    const [formTitle, setFormTitle] = useState({});
    const iref = useRef();
    const { record = {} } = showValidar;
    const onVisible = () => {
        setShowValidar(prev => ({ ...prev, show: !prev.show }));
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
            visible={showValidar.show}
            width={800}
            bodyStyle={{ height: "450px" /*  paddingBottom: 80 *//* , overflowY: "auto", minHeight: "350px", maxHeight: "calc(100vh - 50px)" */ }}
            footer={<div ref={iref} id="form-wrapper" style={{ textAlign: 'right' }}></div>}
        >
            <FormOFabricoValidar setFormTitle={setFormTitle} record={record} parentRef={iref} closeParent={onVisible} />
            {/* <ArtigosForm show={showUpsert} form={form} setFormTitle={setFormTitle} selectedKey={selectedKey} pRef={iref} /> */}
        </WrapperForm>
    );
}

/* const MenuActionButton = ({ record }) => {
    return (
        <Menu onClick={() => { }} theme="dark">
            {(record.ativa == 1 && record.completa == 0) &&
                <>
                    <Menu.Item key="1" icon={<UserOutlined />}>Finalizar</Menu.Item>
                </>
            }
            {(record.ativa == 0 && record.completa == 0) &&
                <>
                    <Menu.Item key="2" icon={<UserOutlined />}>Iniciar</Menu.Item>
                </>
            }
            {(record.ativa == 0 && record.completa == 1) &&
                <>
                    <Menu.Item key="3" icon={<UserOutlined />}>Reabrir</Menu.Item>
                </>
            }
        </Menu>)
}; */

const ColumnEstado = ({ record, rowKey, visibleRecord, setVisibleRecord, showValidar, setShowValidar, reloadParent }) => {
    const title = (record.ativa == 1 && record.completa == 0) ? "Finalizar" : (record.ativa == 0 && record.completa == 0) ? "Iniciar" : "Reabrir";
    const [confirmLoading, setConfirmLoading] = useState(false);
    const showPopconfirm = () => {
        if (!visibleRecord) {
            setVisibleRecord(rowKey);
        }
    };
    const handleCancel = () => {
        setVisibleRecord(false);
    };

    const openNotificationWithIcon = response => {
        notification[response.status]({
            message: response.title,
            description: response.subTitle,
            placement: "bottomRight",
            duration: response.status === "error" ? 0 : 4.5
        });
    };

    const confirm = async () => {
        setConfirmLoading(true);
        const { ofabrico, ofabrico_sgp, ativa, completa } = record;
        const response = await fetchPost({ url: `${API_URL}/setofabricostatus/`, parameters: { ofabrico, ofabrico_sgp, ativa, completa } });
        setConfirmLoading(false);
        setVisibleRecord(false);
        if (response.data.status !== "error") {
            reloadParent();
        }
        openNotificationWithIcon(response.data);
    }

    const onValidar = () => {
        setShowValidar(prev => ({ ...prev, show: !prev.show, record }));
    }
    const onIgnorar = () => {
        
    }

    return (<>
        {(!record.ofabrico_sgp) && <div style={{display:"flex",flexDirection:"row"}}>
            <TagButton onClick={onValidar} style={{ width: "98px", textAlign: "center" }} icon={<CheckOutlined />} color="#108ee9">Validar</TagButton>
            <TagButton onClick={onIgnorar}>...</TagButton>
        </div>}
        {(record.ofabrico_sgp) && <Popconfirm
            title={<div><b>{title}</b> a Ordem de Fabrico?</div>}
            visible={rowKey === visibleRecord}
            onConfirm={confirm}
            okButtonProps={{ loading: confirmLoading }}
            onCancel={handleCancel}
        >
            {(record.ativa == 1 && record.completa == 0) && <TagButton onClick={showPopconfirm} style={{ width: "98px", textAlign: "center" }} icon={<SyncOutlined spin />} color="processing">Em Curso</TagButton>}
            {(record.ativa == 0 && record.completa == 0) && <TagButton onClick={showPopconfirm} style={{ width: "98px", textAlign: "center" }} icon={<ClockCircleOutlined />} color="warning">A Aguardar</TagButton>}
            {(record.ativa == 0 && record.completa == 1) && <TagButton onClick={showPopconfirm} style={{ width: "98px", textAlign: "center" }} color="error">Finalizada</TagButton>}
        </Popconfirm>
        }
    </>);
}

const ColumnProgress = ({ record, type }) => {
    let current, total;
    let showProgress = (record.ativa == 1 && record.completa == 0) ? true : false;
    if (type === 1) {
        current = record.n_paletes_produzidas;
        total = record.num_paletes_produzir;
    } else if (type === 2) {
        current = record.n_paletes_stock_in;
        total = record.num_paletes_stock;
    } else if (type === 3) {
        current = record.n_paletes_produzidas + record.n_paletes_stock_in;
        total = record.num_paletes_produzir + record.num_paletes_stock;
    }

    return (<>
        {showProgress ?
            <ProgressBar value={current} max={total} />
            : <div style={{ textAlign: "center" }}>{current}/{total}</div>}
    </>);
}

export default () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false });
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({
        payload: {
            url: `${API_URL}/ofabricolist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 10 }, filter: {}, sort: [
                { column: 'ativa', direction: 'DESC', options: "NULLS FIRST" }, { column: 'completa' }, { column: 'end_date', direction: 'DESC' }
            ]
        }
    });
    const elFilterTags = document.getElementById('filter-tags');
    const [flyoutStatus, setFlyoutStatus] = useState({ visible: false, fullscreen: false });
    const flyoutFooterRef = useRef();
    const [estadoConfirmRecord, setEstadoConfirmRecord] = useState(false);

    useEffect(() => {
        dataAPI.first();
        dataAPI.fetchPost();
    }, []);

    const selectionRowKey = (record) => {
        return `${record.ofabrico}-${isValue(record.item, undefined)}-${isValue(record.iorder, undefined)}`;
    }

    const reloadFromChild = () => {
        dataAPI.fetchPost();
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "ofabricolist",
            include: {
                ...((common) => (
                    {
                        ofabrico: { title: "Ordem Fabrico", width: 140, render: v => <b>{v}</b>, ...common },
                        iorder: { title: "Encomenda(s)", width: 140, ...common },
                        /* ofabrico_sgp: { title: "OF.SGP", width: 60, render: v => <>{v}</>, ...common }, */
                        estado: { title: "", width: 110, render: (v, r) => <ColumnEstado showValidar={showValidar} setShowValidar={setShowValidar} reloadParent={reloadFromChild} rowKey={selectionRowKey(r)} visibleRecord={estadoConfirmRecord} setVisibleRecord={setEstadoConfirmRecord} record={r} />, ...common },
                        /* options: { title: "", sort: false, width: 25, render: (v, r) => <ActionButton content={<MenuActionButton record={r} />} />, ...common }, */
                        //item: { title: "Artigo(s)", width: 140, render: v => <>{v}</>, ...common },
                        item_nome: { title: "Artigo(s)", ellipsis: true, render: v => <div style={{ /* overflow:"hidden", textOverflow:"ellipsis" */whiteSpace: 'nowrap' }}>{v}</div>, ...common },
                        cliente_nome: { title: "Cliente(s)", ellipsis: true, render: v => <div style={{ whiteSpace: 'nowrap' }}><b>{v}</b></div>, ...common },
                        produzidas: { title: "Produzidas", width: 100, render: (v, r) => <ColumnProgress type={1} record={r} />, ...common },
                        pstock: { title: "Para Stock", width: 100, render: (v, r) => <ColumnProgress type={2} record={r} />, ...common },
                        total: { title: "Total", width: 100, render: (v, r) => <ColumnProgress type={3} record={r} />, ...common },
                        details: {
                            title: "", width: 50, render: (v, r) => <Space>
                                {r.stock == 1 && <GrStorage title="Para Stock" />}
                                {r.retrabalho == 1 && <RiRefreshLine title="Para Retrabalho" />}
                            </Space>, table: "sgp_op", ...common
                        }


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

    const closeFlyout = () => {
        setFlyoutStatus(prev => ({ ...prev, visible: false }));
    }



    return (
        <>
            <ModalValidar showValidar={showValidar} setShowValidar={setShowValidar} />
            <SubLayout flyoutWidth="700px" flyoutStatus={flyoutStatus} style={{ height: "100vh" }}>
                <SubLayout.content>
                    <ToolbarTable form={formFilter} dataAPI={dataAPI} setFlyoutStatus={setFlyoutStatus} flyoutStatus={flyoutStatus} />
                    {elFilterTags && <Portal elId={elFilterTags}>
                        <FilterTags form={formFilter} filters={dataAPI.getAllFilter()} schema={filterSchema} rules={filterRules()} />
                    </Portal>}
                    <Table
                        title={<Title level={4}>Ordens de Fabrico</Title>}
                        columnChooser
                        reload
                        stripRows
                        darkHeader
                        size="small"
                        toolbar={<GlobalSearch form={formFilter} dataAPI={dataAPI} setShowFilter={setShowFilter} showFilter={showFilter} />}
                        selection={{ enabled: false, rowKey: record => selectionRowKey(record), onSelection: setSelectedRows, multiple: false, selectedRows, setSelectedRows }}
                        paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                        dataAPI={dataAPI}
                        columns={columns}
                        onFetch={dataAPI.fetchPost}
                    //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}
                    />
                </SubLayout.content>
                <SubLayout.flyout>
                    <Container.Header fullScreen={false} setStatus={setFlyoutStatus} left={<Title level={4} style={{ marginBottom: "0px" }}>Title</Title>} />
                    <Container.Body>

                    </Container.Body>
                    {/* <Container.Footer right={<div ref={flyoutFooterRef}/>} /> */}
                </SubLayout.flyout>
            </SubLayout>



        </>
    )
}