import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { useDataAPI } from "utils/useDataAPI";
import { getSchema } from "utils/schemaValidator";
import { getFilterRangeValues, getFilterValue, isValue } from 'utils';
import FormManager, { FieldLabel, FieldSet as OldFieldSet, FilterTags, AutoCompleteField as OldAutoCompleteField, useMessages, DropDown } from "components/form";
import { FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, InputAddon, SelectField, TitleForm, WrapperForm, SelectDebounceField, AutoCompleteField, RangeDateField, RangeTimeField, FilterDrawer, CheckboxField, SwitchField } from "components/formLayout";
import Table, { setColumns } from "components/table";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import loadInit from "utils/loadInit";
import { filterObjectKeys } from "utils/object";
import MoreFilters from 'assets/morefilters.svg';
import { Alert, Input, Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge, Popover } from "antd";
import Icon, { SearchOutlined, LoadingOutlined, LeftOutlined, EllipsisOutlined } from "@ant-design/icons";
const ButtonGroup = Button.Group;
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, BOBINE_ESTADOS, BOBINE_DEFEITOS, API_URL, GTIN, SCREENSIZE_OPTIMIZED } from 'config';
const { Title, Text } = Typography;
import { SocketContext } from 'gridlayout';
import { MediaContext } from 'app';
import { Wnd, ColumnBobines, Ofs, Bobines, typeListField, typeField, validField } from "./commons";
import { useNavigate, useLocation } from "react-router-dom";
import Reports, { downloadReport } from "components/DownloadReports";
import useModalv4 from 'components/useModalv4';


const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}



const filterRules = (keys) => {
    return getSchema({}, keys).unknown(true);
}

const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;

const filterSchema = ({ }) => [
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
    { fofabrico: { label: "Ordem de Fabrico", field: { type: 'input', size: 'small' } } },
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

const ToolbarTable = ({ form, dataAPI, typeListField, validField, typeField }) => {
    const navigate = useNavigate();

    const onChange = (v, field) => {


    }

    const leftContent = (<>
        <Button title='Retroceder' type="link" icon={<LeftOutlined />} onClick={() => navigate(-1)}></Button>
    </>);

    const rightContent = (
        <Space>
            <div style={{ display: "flex", flexDirection: "row", whiteSpace: "nowrap" }}>

            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }}>
                <Form form={form}>
                    <Form.Item name="typelist" noStyle>
                        {typeListField({ onChange })}
                    </Form.Item>
                    <Form.Item name="type" noStyle>
                        {typeField({ onChange })}
                    </Form.Item>
                    <Form.Item name="valid" noStyle>
                        {validField({ onChange })}
                    </Form.Item>


                </Form>
            </div>
        </Space>
    );
    return (
        <Toolbar left={leftContent} right={rightContent} />
    );
}

const GlobalSearch = ({ form, dataAPI, columns, setShowFilter, showFilter, setTitle, title } = {}) => {
    const [changed, setChanged] = useState(false);
    const onFinish = (type, values) => {
        switch (type) {
            case "filter":
                (!changed) && setChanged(true);
                const { typelist, ...vals } = values;
                const _values = {
                    ...vals,
                    fbobinagem: getFilterValue(vals?.fbobinagem, 'any'),
                    fdata: getFilterRangeValues(vals["fdata"]?.formatted),
                    ftime: getFilterRangeValues(vals["ftime"]?.formatted),
                    fduracao: getFilterValue(vals?.fduracao, '=='),
                    fofabrico: getFilterValue(vals?.fofabrico, 'any'),
                    fcliente: getFilterValue(vals?.fcliente, 'any'),
                    fdestino: getFilterValue(vals?.fdestino, 'any'),
                };
                const { typelist: tp, ...dt } = { ...dataAPI.getAllFilter(), ..._values };
                setTitle(dt);
                dataAPI.addFilters(dt);
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

    return (
        <>
            {columns &&
                <>
                    <FilterDrawer schema={filterSchema({ form /* ordersField, customersField, itemsField */ })} filterRules={filterRules()} form={form} width={350} setShowFilter={setShowFilter} showFilter={showFilter} />
                    <Form form={form} name={`fps`} onFinish={(values) => onFinish("filter", values)} onValuesChange={onValuesChange} onKeyPress={(e) => { if (e.key === "Enter") { form.submit(); } }}>
                        <FormLayout
                            id="LAY-BOBINAGENS"
                            layout="horizontal"
                            style={{ width: "700px", padding: "0px"/* , minWidth: "700px" */ }}
                            schema={schema}
                            field={{ guides: false, wide: [3, 4, 3, 1.5, 1.5], style: { marginLeft: "2px", alignSelf: "end" } }}
                            fieldSet={{ guides: false, wide: 16, margin: false, layout: "horizontal", overflow: false }}
                        >
                            <Field name="fbobinagem" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Nº Bobinagem", pos: "top" }}>
                                <Input size='small' allowClear />
                            </Field>
                            <Field name="fdata" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Data Bobinagem", pos: "top" }}>
                                <RangeDateField size='small' allowClear />
                            </Field>
                            <Field name="ftime" required={false} layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Início/Fim", pos: "top" }}>
                                <RangeTimeField size='small' format={TIME_FORMAT} allowClear />
                            </Field>
                            <FieldItem label={{ enabled: false }}>
                                <ButtonGroup size='small' style={{ marginLeft: "5px" }}>
                                    <Button style={{ padding: "0px 3px" }} onClick={() => form.submit()}><SearchOutlined /></Button>
                                    <Button style={{ padding: "0px 3px" }}><MoreFilters style={{ fontSize: "16px", marginTop: "2px" }} onClick={() => setShowFilter(prev => !prev)} /></Button>
                                </ButtonGroup>
                            </FieldItem>
                            <FieldItem label={{ enabled: false }}>
                                <Reports columns={columns} dataAPI={dataAPI} title={`${title.title} ${title.subtitle}`} />
                            </FieldItem>
                        </FormLayout>
                    </Form>
                </>
            }
        </>
    );
}

const ListTitle = ({ title }) => {
    return (
        <div>
            <Title style={{ margin: "0px" }} level={4}>{title?.title}</Title>
            {title.subtitle && <Text code>{title.subtitle}</Text>}
        </div>
    );
}

const getMenuActionItems = (r) => {
    return [
        { label: 'Validar Bobinagem', key: 'validate', data: {}, disabled: (r.valid === 1) ? true : false }
    ];
}

const Action = ({ v, r, dataAPI }) => {
    const modal = useModalv4();
    const [downloading, setDownloading] = useState(false);
    const [clickPopover, setClickPopover] = useState(false);
    const menuItems = getMenuActionItems(r);

    const hide = () => {
        setClickPopover(false);
    };

    const handleClickPopover = (visible) => {
        setClickPopover(visible);
    };


    const onClick = async () => {
        hide();
    }


    const showForm = ({ type, r, ...rest }) => {
        //modal.show({ propsToChild: true, width: '500px', height: '320px', title, onOk: () => onDownload({ type, r, ...rest }), content: <PackingListForm form={form} downloading={false} r={{ ...r, produto_cod: r.item_nome.substring(0, r.item_nome.lastIndexOf(' L')) }} /> });
        return false;
    }

    return (
        <>
            <Popover
                open={clickPopover}
                onOpenChange={handleClickPopover}
                placement="bottomRight" title="Ações" content={

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <Menu onClick={(v) => onClick()} items={menuItems}></Menu>
                    </div>

                } trigger="click">
                <Button size="small" icon={<EllipsisOutlined />} />
            </Popover>
            {/* <Reports onExport={(type, limit, orientation, isDirty) => showForm({ type, limit, orientation, isDirty, r })} items={rowReportItems} dataAPI={dataAPI} button={<Button size="small" icon={<EllipsisOutlined />} />} />} */}
        </>
    )
}


export default (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showValidar, setShowValidar] = useState({ show: false, data: {} });
    const [formFilter] = Form.useForm();
    const dataAPI = useDataAPI({ id: "bobineslist", payload: { url: `${API_URL}/bobineslist/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 10 }, filter: {}, sort: [{ column: 'nome', direction: 'DESC' }] } });
    const elFilterTags = document.getElementById('filter-tags');
    const { data: dataSocket } = useContext(SocketContext) || {};
    const { windowDimension } = useContext(MediaContext);
    const [title, setTitle] = useState({ title: "", subtitle: "" });

    useEffect(() => {
        const cancelFetch = cancelToken();
        const { typelist, ...dt } = loadInit({ typelist: "A", type: "-1", valid: "-1" }, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, props, location?.state, [/* "agg_of_id", "ofs", "typelist", */ ...Object.keys(dataAPI.getAllFilter())]);
        setListTitle(dt);
        formFilter.setFieldsValue({ typelist, ...dt });
        dataAPI.addFilters(dt);
        dataAPI.addParameters({ typelist });
        //dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, [dataSocket?.bobinagens, location]);

    useEffect(() => {
        console.log(".......................", dataAPI.getData().rows)
    }, [dataAPI.isLoading()])

    const selectionRowKey = (record) => {
        return `${record.id}`;
    }

    const setListTitle = (v) => {
        //const st = (parseInt(v.type) === -1 || !v?.ofs) ? null : JSON.stringify(v.ofs).replaceAll(/[\[\]\"]/gm, "").replaceAll(",", " | ");
        //if (parseInt(v.valid) === 0) {
            setTitle({ title: "Bobines"/* , subtitle: st */ });
        //} else
        //    setTitle({ title: "Bobinagens da Linha 1", subtitle: st });
    }

    const handleWndClick = (bm) => {
        navigate("/app/bobines/validarlist", { state: { title: `Validar e Classificar Bobinagem ${bm.nome}`, bobinagem_id: bm.id, bobinagem_nome: bm.nome, tstamp: Date.now() } });
        //setShowValidar({ show: true, data: { title: `Validar e Classificar Bobinagem ${bm.nome}`, bobinagem_id: bm.id, bobinagem_nome: bm.nome } });
    };

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "bobineslist",
            include: {
                ...((common) => (
                    {
                       /* action: { title: "", fixed: "left", width: 40, render: (v, r) => <Action v={v} r={r} dataAPI={dataAPI} />, ...common },*/
                        nome: { title: "Bobinagem", width: 90, fixed: 'left', render: (v, r) => <span onClick={() => handleWndClick(r)} style={{ color: "#096dd9", cursor: "pointer" }}>{v}</span>, ...common },
                        /* data: { title: "Data", render: (v, r) => dayjs(v).format(DATE_FORMAT), ...common }, */
                        /*inico: { title: "Início", width: 70, render: (v, r) => dayjs('01-01-1970 ' + v).format(TIME_FORMAT), ...common },
                        fim: { title: "Fim", width: 70, render: (v, r) => dayjs('01-01-1970 ' + v).format(TIME_FORMAT), ...common },
                        duracao: { title: "Duração", width: 80, render: (v, r) => v, ...common },
                        core: { title: "Core", width: 40, render: (v, r) => v, ...common },
                        comp: { title: "Comp.", width: 80, render: (v, r) => v, input: <InputNumber />, ...common },
                        comp_par: { title: "Comp. Emenda", width: 80, render: (v, r) => v, ...common },
                        comp_cli: { title: "Comp. Cliente", width: 80, render: (v, r) => v, ...common },
                        area: { title: <span>Área m&#178;</span>, reportTitle: "Área m2", width: 80, render: (v, r) => v, ...common },
                        diam: { title: "Diâmetro mm", width: 80, render: (v, r) => v, ...common },
                        nwinf: { title: "Nw Inf. m", width: 80, render: (v, r) => v, ...common },
                        nwsup: { title: "Nw Sup. m", width: 80, render: (v, r) => v, ...common }*/
                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    /*     const handleWndCancel = () => {
            setShowValidar({ show: false, data: {} });
        }; */

    return (
        <>
            <Spin spinning={dataAPI.isLoading()} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /* style={{ top: "50%", left: "50%", position: "absolute" }} */ >
                {/* <Wnd show={showValidar} setShow={setShowValidar}>
                    <Suspense fallback={<></>}>{<BobinesValidarList data={showValidar.data} closeSelf={handleWndCancel} />}</Suspense>
                </Wnd> */}
                <ToolbarTable form={formFilter} dataAPI={dataAPI} typeListField={typeListField} typeField={typeField} validField={validField} />
                {elFilterTags && <Portal elId={elFilterTags}>
                    <FilterTags form={formFilter} filters={filterObjectKeys(dataAPI.getAllFilter(), ["type", "typelist", "valid", "ofs", "agg_of_id"])} schema={filterSchema} rules={filterRules()} />
                </Portal>}
                <Table
                    title={<ListTitle title={title} />}
                    columnChooser={false}
                    reload
                    stripRows
                    darkHeader
                    size="small"
                    toolbar={<GlobalSearch columns={columns?.report} form={formFilter} dataAPI={dataAPI} setShowFilter={setShowFilter} showFilter={showFilter} title={title} setTitle={setListTitle} />}
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