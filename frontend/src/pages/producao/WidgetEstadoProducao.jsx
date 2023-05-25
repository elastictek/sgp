import React, { useEffect, useState, useCallback, useRef, useContext, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
//import moment from 'moment';
import dayjs from 'dayjs';
import { uid } from 'uid';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, sleep, lpadFloat } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS, bColors, BOBINE_DEFEITOS, BOBINE_ESTADOS } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay, getFloat } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch, Card, Progress, Collapse, Checkbox } from "antd";
const { Panel } = Collapse;
const { TextArea } = Input;
// import ToolbarTitle from './commons/ToolbarTitle';
const { Title } = Typography;
import { json } from "utils/object";
import {
    EditOutlined, CameraOutlined, DeleteTwoTone, ExpandAltOutlined, TabletOutlined, PaperClipOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined,
    CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, CaretLeftOutlined, CaretRightOutlined,
    RightOutlined, LeftOutlined
} from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import ReactECharts from 'components/ReactECharts';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import WidgetTitle, { WidgetSimpleTitle } from 'components/WidgetTitle';
import { InputNumberEditor, MateriasPrimasTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, Link, DateTime, QueueNwColumn, PosColumn } from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext, SocketContext } from "../App";
import { usePermission, Permissions } from "utils/usePermission";
// import { isPrivate, LeftUserItem } from './commons';
import IconButton from "components/iconButton";
import { CiRuler } from 'react-icons/ci';
import { TbMathAvg } from 'react-icons/tb';
import { BsDatabaseDown, BsDatabaseUp, BsDatabase } from 'react-icons/bs';
import PaletizacaoSchema from '../currentline/ordemfabrico/paletizacaoSchema/SvgSchema';
import Palete from '../paletes/Palete';
import PaletesList from '../paletes/PaletesList';
import BobinesList from '../bobines/BobinesList';
import BobinagensList from '../bobinagens/BobinagensList';
const FormCortes = React.lazy(() => import('../currentline/FormCortes'));

const FormFormulacao = React.lazy(() => import('../formulacao/FormFormulacao'));
const GranuladoPick = React.lazy(() => import('../picking/GranuladoPick'));
const PaletesStockList = React.lazy(() => import('../paletes/PaletesStockList'));

const title = "Produção";
const defeitosToSum = ['con', 'descen', 'presa', 'diam_insuf', 'esp', 'troca_nw', 'outros', 'nok', 'car', 'fmp', 'lac', 'ncore', 'sbrt', 'suj', 'tr', 'buraco', 'fc', 'ff', 'furos', 'rugas', 'prop'];

const TitleForm = ({ data, onChange, level, auth, form }) => {
    return (<ToolbarTitle id={auth?.user} description={title} title={<>
        <Col>
            <Row style={{ marginBottom: "5px" }} wrap="nowrap" nogutter>
                <Col xs='content' style={{}}><Row nogutter><Col title={title} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}><span style={{}}>{title}</span></Col></Row></Col>
                {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
            </Row>

        </Col>
    </>
    }
    />);
}

const StyledCollapse = styled(Collapse)`

    .ant-collapse-header{
        background-color:#f5f5f5;
        border-radius: 2px!important;
        padding:1px 1px!important;
        margin-top:5px;
    }
    .ant-collapse-content > .ant-collapse-content-box{
        padding:2px 2px!important;
    }

`;


const useStyles = createUseStyles({
    container: {
        display: 'flex',
        '& > div > div > div': {
            marginRight: (props) => props?.hSpacing ? `${props.hSpacing}px` : '0',
            marginTop: (props) => props?.vSpacing ? `${props.vSpacing}px` : '0',
        },
    },


    bobineschart: {
        display: 'flex',
        flexDirection: 'row',
        boxShadow: "0 0 2px rgba(0, 0, 0, 0.3)",
        '& div:first-child': {
            //borderRadius: "3px 0 0 3px"
        },
        '& div:last-child': {
            //borderRadius: "0 3px 3px 0"
        },
        '& > div': {
            alignItems: "center",
            justifyContent: "center",
            padding: "1px"
        },
    }
});


const MiniGaugeVelocidade = ({ data, title, min = 0, max = 100, style, ...props }) => {

    const option = {
        title: {
            left: 'center',
            text: title,
            textStyle: {
                fontSize: 12,
                fontWeight: 'bolder'
            }
        },
        series: [
            {
                type: 'gauge',
                center: ['50%', '60%'],
                startAngle: 200,
                endAngle: -20,
                radius: "75%",
                min: min,
                max: max,
                splitNumber: 1,
                itemStyle: {
                    color: '#1677ff'
                },
                progress: {
                    show: true,
                    width: 10
                },
                pointer: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        width: 10
                    }
                },
                axisTick: {
                    show: false,
                    distance: -45,
                    splitNumber: 5,
                    lineStyle: {
                        width: 1,
                        color: '#999'
                    }
                },
                splitLine: {
                    show: false,
                    distance: -52,
                    length: 14,
                    lineStyle: {
                        width: 3,
                        color: '#999'
                    }
                },
                axisLabel: {
                    distance: 35,
                    color: 'red',
                    fontSize: 8,
                    formatter: (value) => {
                        if (value === max) {
                            return value;
                        }
                        return '';
                    }
                },
                anchor: {
                    show: false
                },
                detail: {
                    valueAnimation: true,
                    width: '60%',
                    lineHeight: 40,
                    borderRadius: 8,
                    offsetCenter: [0, '-15%'],
                    fontSize: 14,
                    fontWeight: 'bolder',
                    formatter: '{value}',
                    color: 'inherit'
                },
                title: {
                    offsetCenter: [0, '20%'],
                    fontSize: 10
                },
                data: [
                    {
                        value: data || 0,
                        name: 'm/min'
                    }
                ]
            }
        ]
    };

    return (<ReactECharts option={option} style={{ ...style }} />);
}


const PaletePositionColumn = ({ data, cellProps }) => {

    const btn = (pos, max, bobines) => {
        if ((pos != 1 && pos != max) || max == 1) {
            return <Button style={{ maxHeight: "25px", padding: "0px 4px", width: "40px", maxWidth: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>{bobines}</Button>;
        } else if (pos == max) {
            return <Button style={{ maxHeight: "25px", padding: "0px 4px", width: "40px", maxWidth: "40px", display: "flex", alignItems: "center", justifyContent: "center" }} icon={<CaretUpOutlined />} >{bobines}</Button>;
        } else if (pos == 1) {
            return <Button style={{ maxHeight: "25px", padding: "0px 4px", width: "40px", maxWidth: "40px", display: "flex", alignItems: "center", justifyContent: "center" }} icon={<CaretDownOutlined />}>{bobines}</Button>;
        }
    }

    return (
        <Space size={1}>{json(data?.lvl).map(v => {
            return (
                <div key={`pp-${v}-${data?.of_cod}}`}>{btn(v, data?.maxlvl, data?.bobines_por_palete)}</div>
            );
        })}  </Space>
    )
}


const ArtigoColumn = ({ data, cellProps }) => {
    return (
        <div>
            <div style={{ display: "flex", fontSize: "11px" }}>
                <div style={{ marginRight: "10px", fontWeight: 700 }}>{data?.of_cod}</div>
                <div style={{}}>{data?.artigo_cod}</div>
            </div>
            <div style={{ display: "flex", fontSize: "10px" }}>
                <div>{data?.artigo_des}</div>
            </div>
            <div style={{ display: "flex", fontSize: "10px" }}>
                <div>{data?.cliente_nome}</div>
            </div>
        </div>
    );
}

const ListPaletesOf = ({ hash_estadoproducao, mini = false, data, ...props }) => {
    const media = useContext(MediaContext);
    const permission = usePermission({ name: "widget", item: "estadoProducao" });//Permissões Iniciais
    const inputParameters = useRef({});
    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: ``, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });
    const submitting = useSubmitting(false);

    const [lastTab, setLastTab] = useState('1');

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "details": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onClickPalete = (type, row) => {
        setModalParameters({ content: "details", tab: lastTab, setLastTab, type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: loadData, parameters: { palete: row, palete_id: row.palete_id, palete_nome: row.nome } });
        showModal();
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        // if (data?.group) {
        //     return tableCls.right;
        // }
    };


    const groups = [{ name: 'bobines', header: 'Bobines', headerAlign: "center" }];

    const columns = [
        ...(true) ? [{ name: 'nome', header: 'Palete', userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center", render: ({ cellProps, data }) => <Link cellProps={cellProps} value={data?.nome} onClick={() => onClickPalete("all", data)} /> }] : [],
        ...(true) ? [{ name: 'ofid', header: 'Ordem', userSelect: true, defaultLocked: false, defaultWidth: 115, headerAlign: "center", render: ({ cellProps, data }) => data?.ofid }] : [],
        ...(true) ? [{ name: 'current_stock', header: 'Stock', userSelect: true, defaultLocked: false, defaultWidth: 53, headerAlign: "center", render: ({ cellProps, data }) => <Bool cellProps={cellProps} value={data?.current_stock} /> }] : [],
        ...(true) ? [{ name: 'comp_real', header: 'Comp.', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m">{getFloat(data?.comp_real, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'area_real', header: 'Área.', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m2">{getFloat(data?.area_real, 2)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'num_bobines', header: 'Total', group: "bobines", userSelect: true, defaultLocked: false, defaultWidth: 50, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps}>{getFloat(data?.num_bobines, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'nbobines_real', header: 'Atual', group: "bobines", userSelect: true, defaultLocked: false, defaultWidth: 50, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps}>{getFloat(data?.nbobines_real, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'nbobines_emendas', header: 'Emendas', group: "bobines", userSelect: true, defaultLocked: false, defaultWidth: 72, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps}>{getFloat(data?.nbobines_emendas, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'largura_bobines', header: "Largura", userSelect: true, defaultLocked: false, defaultWidth: 60, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="mm">{getFloat(data?.largura_bobines, 0)}</RightAlign> }] : [],
        // ...(true) ? [{ name: 'matprima_des', header: 'Artigo', userSelect: true, defaultLocked: false, minWidth: 170, flex: 1, headerAlign: "center", render: ({ cellProps, data }) => <div style={{ fontWeight: 700 }}>{data?.matprima_des}</div> }] : [],
        // ...(true) ? [{ name: 'densidade', header: 'Densidade', userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", render: (p) => <RightAlign>{p.data?.densidade}</RightAlign> }] : [],
        // ...(true) ? [{ name: 'arranque', header: 'Arranque', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", render: (p) => <RightAlign unit="%">{p.data?.arranque}</RightAlign> }] : [],
        // ...(true) ? [{ name: 'tolerancia', header: 'Tolerância', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", render: (p) => <RightAlign unit="%">{p.data?.tolerancia}</RightAlign> }] : [],
        // ...(true) ? [{ name: 'vglobal', header: 'Global', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", render: (p) => <RightAlign unit="%">{p.data?.vglobal}</RightAlign> }] : []
    ];


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [hash_estadoproducao, data?.timestamp, data?.filter]);

    const loadData = async ({ signal, init = false } = {}) => {
        //submitting.trigger();
        const _d = data?.paletes.filter(v => data?.filter.includes(v.ofid) && v.palete_id);
        dataAPI.setData({ rows: _d, total: _d.length });
        // if (parameters?.data?.rows) {

        //     const _dj = Object.values(parameters?.data?.rows.reduce((acc, cur) => {
        //         if (!acc[cur.gid]) {
        //             acc[cur.gid] = { ...cur, stock: cur.current_stock == 1 ? cur : {} };
        //         } else {
        //             if (cur.current_stock == 1) {
        //                 acc[cur.gid].stock = cur;
        //             } else {
        //                 //acc[cur.gid].a += cur.a;
        //             }
        //         }

        //         //totals
        //         acc[cur.gid].paletizacao = { ...parameters?.data?.paletizacao.find(v => v.of_cod == acc[cur.gid]?.of_cod) };
        //         acc[cur.gid].bobines = parameters?.data?.bobines?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
        //         acc[cur.gid].num_paletes_of_percentage = getFloat((100 * getFloat(acc[cur.gid].current_num_paletes_of)) / getFloat(acc[cur.gid].num_paletes_of), 0);
        //         acc[cur.gid].total_planned = {
        //             num_paletes: getFloat(acc[cur.gid].num_paletes) * json(acc[cur.gid].lvl).length,
        //             num_bobines: getFloat(acc[cur.gid].num_bobines) * json(acc[cur.gid].lvl).length
        //         };
        //         acc[cur.gid].total_current = {
        //             num_paletes_line: getFloat(acc[cur.gid]?.current_num_paletes),
        //             num_paletes_stock: getFloat(acc[cur.gid]?.stock?.current_num_paletes),
        //             num_bobines_line: getFloat(acc[cur.gid]?.current_num_bobines),
        //             num_bobines_stock: getFloat(acc[cur.gid]?.stock?.current_num_bobines)
        //         }
        //         acc[cur.gid].total_current["num_paletes"] = acc[cur.gid].total_current["num_paletes_line"] + acc[cur.gid].total_current["num_paletes_stock"];
        //         acc[cur.gid].total_current["num_paletes_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_paletes) / (acc[cur.gid].total_planned.num_paletes), 0);
        //         acc[cur.gid].total_current["num_bobines"] = acc[cur.gid].total_current["num_bobines_line"] + acc[cur.gid].total_current["num_bobines_stock"];
        //         acc[cur.gid].total_current["num_bobines_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_bobines) / (acc[cur.gid].total_planned.num_bobines), 0);

        //         return acc;
        //     }, {}));
        //     console.log(_dj)
        //     setOfs([...new Set(_dj.map(obj => obj.of_cod))]);
        //     dataAPI.setData({ rows: _dj, total: _dj.length });





        //     // setOfsData(_dj);
        //     // const _djd = parameters?.data?.rows.filter((obj, index, self) =>
        //     //     index === self.findIndex((t) => (
        //     //         t.of_cod === obj.of_cod
        //     //     ))
        //     // );
        //     // setOfs(_djd);
        // }
        //submitting.end();
    }

    const onFilterFinish = (type, values) => { }
    const onFilterChange = (changedValues, values) => { };
    const rowClassName = ({ data }) => {
        if (data?.nbobines_real != data?.num_bobines) {
            return tableCls.warning;
        }
    }

    return (<>
        <Table
            {...mini && { style: { fontSize: "10px", minHeight: "170px" } }}
            {...mini && { rowHeight: 25 }}
            //rowHeight={null}
            headerHeight={25}
            cellNavigation={false}
            enableSelection={false}
            showActiveRowIndicator={false}
            //loading={submitting.state}
            showLoading={false}
            idProperty={dataAPI.getPrimaryKey()}
            local={true}
            onRefresh={loadData}
            rowClassName={rowClassName}
            groups={groups}
            sortable={true}
            reorderColumns={false}
            showColumnMenuTool={false}
            disableGroupByToolbar={true}
            editable={{ enabled: false, add: false }}
            columns={columns}
            dataAPI={dataAPI}
            moreFilters={false}
            leftToolbar={false}
            toolbarFilters={false}
            toolbar={false}
        />
    </>);
}

const ListNWsQueue = ({ hash_estadoproducao, data, ...props }) => {
    const media = useContext(MediaContext);
    const permission = usePermission({ name: "widget", item: "estadoProducao" });//Permissões Iniciais
    const inputParameters = useRef({});
    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: ``, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });
    const submitting = useSubmitting(false);

    const [lastTab, setLastTab] = useState('1');

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "details": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onClickPalete = (type, row) => {
        setModalParameters({ content: "details", tab: lastTab, setLastTab, type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: loadData, parameters: { palete: row, palete_id: row.palete_id, palete_nome: row.nome } });
        showModal();
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        // if (data?.group) {
        //     return tableCls.right;
        // }
    };


    const groups = [{ name: 'bobines', header: 'Bobines', headerAlign: "center" }];

    const columns = [
        ...(true) ? [{ name: 'type', header: '', userSelect: true, defaultLocked: false, defaultWidth: 50, headerAlign: "center", render: ({ cellProps, data }) => <PosColumn value={data.type} cellProps={cellProps} /> }] : [],
        ...(true) ? [{ name: 'artigo_cod', header: 'Cód', userSelect: true, defaultLocked: false, defaultWidth: 100, headerAlign: "center", render: ({ cellProps, data }) => data?.artigo_cod }] : [],
        ...(true) ? [{ name: 'artigo_des', header: 'Artigo', userSelect: true, defaultLocked: false, defaultWidth: 140, headerAlign: "center", render: ({ cellProps, data }) => data?.artigo_des.replace("Nonwoven ", "") }] : [],
        ...(true) ? [{ name: 'queue', header: 'Fila', userSelect: true, defaultLocked: false, defaultWidth: 90, headerAlign: "center", render: ({ cellProps, data }) => <QueueNwColumn style={{ fontSize: "9px" }} value={data.queue} status={data.status} /> }] : [],
        ...(true) ? [{ name: 't_stamp', header: 'Data', userSelect: true, defaultLocked: false, defaultWidth: 110, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.t_stamp} format={DATETIME_FORMAT} /> }] : [],
        ...(true) ? [{ name: 'comp', header: 'Comp.', userSelect: true, defaultLocked: false, defaultWidth: 55, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m">{getFloat(data?.comp, 0)}</RightAlign> }] : [],
    ];


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [hash_estadoproducao, data?.timestamp, data?.filter]);

    const loadData = async ({ signal, init = false } = {}) => {
        //submitting.trigger();
        //const _d = data?.paletes.filter(v => data?.filter.includes(v.ofid) && v.palete_id);
        dataAPI.setData({ rows: data?.nws_queue, total: data?.nws_queue?.length });
        // if (parameters?.data?.rows) {

        //     const _dj = Object.values(parameters?.data?.rows.reduce((acc, cur) => {
        //         if (!acc[cur.gid]) {
        //             acc[cur.gid] = { ...cur, stock: cur.current_stock == 1 ? cur : {} };
        //         } else {
        //             if (cur.current_stock == 1) {
        //                 acc[cur.gid].stock = cur;
        //             } else {
        //                 //acc[cur.gid].a += cur.a;
        //             }
        //         }

        //         //totals
        //         acc[cur.gid].paletizacao = { ...parameters?.data?.paletizacao.find(v => v.of_cod == acc[cur.gid]?.of_cod) };
        //         acc[cur.gid].bobines = parameters?.data?.bobines?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
        //         acc[cur.gid].num_paletes_of_percentage = getFloat((100 * getFloat(acc[cur.gid].current_num_paletes_of)) / getFloat(acc[cur.gid].num_paletes_of), 0);
        //         acc[cur.gid].total_planned = {
        //             num_paletes: getFloat(acc[cur.gid].num_paletes) * json(acc[cur.gid].lvl).length,
        //             num_bobines: getFloat(acc[cur.gid].num_bobines) * json(acc[cur.gid].lvl).length
        //         };
        //         acc[cur.gid].total_current = {
        //             num_paletes_line: getFloat(acc[cur.gid]?.current_num_paletes),
        //             num_paletes_stock: getFloat(acc[cur.gid]?.stock?.current_num_paletes),
        //             num_bobines_line: getFloat(acc[cur.gid]?.current_num_bobines),
        //             num_bobines_stock: getFloat(acc[cur.gid]?.stock?.current_num_bobines)
        //         }
        //         acc[cur.gid].total_current["num_paletes"] = acc[cur.gid].total_current["num_paletes_line"] + acc[cur.gid].total_current["num_paletes_stock"];
        //         acc[cur.gid].total_current["num_paletes_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_paletes) / (acc[cur.gid].total_planned.num_paletes), 0);
        //         acc[cur.gid].total_current["num_bobines"] = acc[cur.gid].total_current["num_bobines_line"] + acc[cur.gid].total_current["num_bobines_stock"];
        //         acc[cur.gid].total_current["num_bobines_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_bobines) / (acc[cur.gid].total_planned.num_bobines), 0);

        //         return acc;
        //     }, {}));
        //     console.log(_dj)
        //     setOfs([...new Set(_dj.map(obj => obj.of_cod))]);
        //     dataAPI.setData({ rows: _dj, total: _dj.length });





        //     // setOfsData(_dj);
        //     // const _djd = parameters?.data?.rows.filter((obj, index, self) =>
        //     //     index === self.findIndex((t) => (
        //     //         t.of_cod === obj.of_cod
        //     //     ))
        //     // );
        //     // setOfs(_djd);
        // }
        //submitting.end();
    }

    const onFilterFinish = (type, values) => { }
    const onFilterChange = (changedValues, values) => { };
    const rowClassName = ({ data }) => {
        if (data?.nbobines_real != data?.num_bobines) {
            return tableCls.warning;
        }
    }

    return (<>
        <Table
            {...true && { style: { fontSize: "10px", minHeight: "150px" } }}
            {...true && { rowHeight: 25 }}
            //rowHeight={null}
            headerHeight={25}
            cellNavigation={false}
            enableSelection={false}
            showActiveRowIndicator={false}
            //loading={submitting.state}
            showLoading={false}
            idProperty={dataAPI.getPrimaryKey()}
            local={true}
            onRefresh={loadData}
            rowClassName={rowClassName}
            groups={groups}
            sortable={true}
            reorderColumns={false}
            showColumnMenuTool={false}
            disableGroupByToolbar={true}
            editable={{ enabled: false, add: false }}
            columns={columns}
            dataAPI={dataAPI}
            moreFilters={false}
            leftToolbar={false}
            toolbarFilters={false}
            toolbar={false}
        />
    </>);
}

const ListGranuladoInline = ({ hash_estadoproducao, data, ...props }) => {
    const media = useContext(MediaContext);
    const permission = usePermission({ name: "widget", item: "estadoProducao" });//Permissões Iniciais
    const inputParameters = useRef({});
    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: ``, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });
    const submitting = useSubmitting(false);

    const [lastTab, setLastTab] = useState('1');

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "details": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onClickPalete = (type, row) => {
        setModalParameters({ content: "details", tab: lastTab, setLastTab, type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: loadData, parameters: { palete: row, palete_id: row.palete_id, palete_nome: row.nome } });
        showModal();
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        // if (data?.group) {
        //     return tableCls.right;
        // }
    };


    const groups = [{ name: 'bobines', header: 'Bobines', headerAlign: "center" }];

    const columns = [
        ...(true) ? [{
            name: 'cuba', header: 'Pos.', headerAlign: "center", userSelect: true, showColumnMenuTool: false, defaultLocked: true, width: 70, render: (p) => <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                <Cuba style={{ fontSize: "10px", height: "15px", lineHeight: 1.2 }} value={p.data?.cuba} />
                {p.data?.dosers}
            </div>
        }] : [],
        ...(true) ? [{
            name: 'artigo_cod', header: 'Artigo', headerAlign: "center", userSelect: true, showColumnMenuTool: false, defaultWidth: 170, render: (p) => <div style={{ display: "flex", alignItems: "start", flexDirection: "column" }}>
                <div style={{ fontWeight: 700 }}>{p.data?.artigo_cod}</div>
                <div style={{}}>{p.data?.artigo_des}</div>
            </div>
        }] : [],
        ...(true) ? [{
            name: 'n_lote', header: 'Lote', headerAlign: "center", userSelect: true, showColumnMenuTool: false, defaultWidth: 140, render: (p) =>
                <div style={{ display: "flex", alignItems: "start", flexDirection: "column" }}>
                    <div style={{ fontWeight: 700 }}>{p.data?.n_lote}</div>
                    <RightAlign unit="kg">{p.data?.qty_lote}</RightAlign>
                </div>
        }] : [],
        ...(true) ? [{ name: 'arranque', header: '%', headerAlign: "center", userSelect: true, showColumnMenuTool: false, width: 40, render: (p) => <RightAlign unit="%">{p.data?.arranque}</RightAlign> }] : [],
        ...(true) ? [{ name: 't_stamp', header: 'Data', headerAlign: "center", userSelect: true, showColumnMenuTool: false, width: 120, render: (p) => <DateTime value={p.data?.t_stamp} format={DATETIME_FORMAT} cellProps={p.cellProps} /> }] : [],
    ]


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [hash_estadoproducao, data?.timestamp, data?.filter]);

    const loadData = async ({ signal, init = false } = {}) => {
        //submitting.trigger();
        //const _d = data?.paletes.filter(v => data?.filter.includes(v.ofid) && v.palete_id);
        dataAPI.setData({ rows: data?.granulado_inline, total: data?.granulado_inline?.length });
        // if (parameters?.data?.rows) {

        //     const _dj = Object.values(parameters?.data?.rows.reduce((acc, cur) => {
        //         if (!acc[cur.gid]) {
        //             acc[cur.gid] = { ...cur, stock: cur.current_stock == 1 ? cur : {} };
        //         } else {
        //             if (cur.current_stock == 1) {
        //                 acc[cur.gid].stock = cur;
        //             } else {
        //                 //acc[cur.gid].a += cur.a;
        //             }
        //         }

        //         //totals
        //         acc[cur.gid].paletizacao = { ...parameters?.data?.paletizacao.find(v => v.of_cod == acc[cur.gid]?.of_cod) };
        //         acc[cur.gid].bobines = parameters?.data?.bobines?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
        //         acc[cur.gid].num_paletes_of_percentage = getFloat((100 * getFloat(acc[cur.gid].current_num_paletes_of)) / getFloat(acc[cur.gid].num_paletes_of), 0);
        //         acc[cur.gid].total_planned = {
        //             num_paletes: getFloat(acc[cur.gid].num_paletes) * json(acc[cur.gid].lvl).length,
        //             num_bobines: getFloat(acc[cur.gid].num_bobines) * json(acc[cur.gid].lvl).length
        //         };
        //         acc[cur.gid].total_current = {
        //             num_paletes_line: getFloat(acc[cur.gid]?.current_num_paletes),
        //             num_paletes_stock: getFloat(acc[cur.gid]?.stock?.current_num_paletes),
        //             num_bobines_line: getFloat(acc[cur.gid]?.current_num_bobines),
        //             num_bobines_stock: getFloat(acc[cur.gid]?.stock?.current_num_bobines)
        //         }
        //         acc[cur.gid].total_current["num_paletes"] = acc[cur.gid].total_current["num_paletes_line"] + acc[cur.gid].total_current["num_paletes_stock"];
        //         acc[cur.gid].total_current["num_paletes_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_paletes) / (acc[cur.gid].total_planned.num_paletes), 0);
        //         acc[cur.gid].total_current["num_bobines"] = acc[cur.gid].total_current["num_bobines_line"] + acc[cur.gid].total_current["num_bobines_stock"];
        //         acc[cur.gid].total_current["num_bobines_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_bobines) / (acc[cur.gid].total_planned.num_bobines), 0);

        //         return acc;
        //     }, {}));
        //     console.log(_dj)
        //     setOfs([...new Set(_dj.map(obj => obj.of_cod))]);
        //     dataAPI.setData({ rows: _dj, total: _dj.length });





        //     // setOfsData(_dj);
        //     // const _djd = parameters?.data?.rows.filter((obj, index, self) =>
        //     //     index === self.findIndex((t) => (
        //     //         t.of_cod === obj.of_cod
        //     //     ))
        //     // );
        //     // setOfs(_djd);
        // }
        //submitting.end();
    }

    const onFilterFinish = (type, values) => { }
    const onFilterChange = (changedValues, values) => { };
    const rowClassName = ({ data }) => {
        if (data?.nbobines_real != data?.num_bobines) {
            return tableCls.warning;
        }
    }

    return (<>
        <Table
            {...true && { style: { fontSize: "10px", minHeight: "315px" } }}
            {...true && { rowHeight: 35 }}
            //rowHeight={null}
            headerHeight={25}
            cellNavigation={false}
            enableSelection={false}
            showActiveRowIndicator={false}
            //loading={submitting.state}
            showLoading={false}
            idProperty={dataAPI.getPrimaryKey()}
            local={true}
            onRefresh={loadData}
            rowClassName={rowClassName}
            groups={groups}
            sortable={true}
            reorderColumns={false}
            showColumnMenuTool={false}
            disableGroupByToolbar={true}
            editable={{ enabled: false, add: false }}
            columns={columns}
            dataAPI={dataAPI}
            moreFilters={false}
            leftToolbar={false}
            toolbarFilters={false}
            toolbar={false}
        />
    </>);
}

const ListBobinagens = ({ hash_estadoproducao, data, ...props }) => {
    const media = useContext(MediaContext);
    const permission = usePermission({ name: "widget", item: "estadoProducao" });//Permissões Iniciais
    const inputParameters = useRef({});
    const { openNotification } = useContext(AppContext);
    const [formDirty, setFormDirty] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = { method: "BobinagensList" };
    const defaultSort = [{ column: "id", direction: "DESC" }];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: `${API_URL}/bobinagens/sql/`, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false, limit: 5 }, filter: defaultFilters, sort: [...defaultSort] } });
    const submitting = useSubmitting(false);

    const [lastTab, setLastTab] = useState('1');

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "details": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onClickPalete = (type, row) => {
        setModalParameters({ content: "details", tab: lastTab, setLastTab, type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: loadData, parameters: { palete: row, palete_id: row.palete_id, palete_nome: row.nome } });
        showModal();
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        // if (data?.group) {
        //     return tableCls.right;
        // }
    };

    const onBobinesExpand = () => { }


    const groups = [{ name: 'bobines', header: 'Bobines', headerAlign: "center" }];

    const columns = [
        ...(true) ? [{ name: 'nome', header: 'Nome', userSelect: true, defaultLocked: false, flex: 1, headerAlign: "center", render: ({ cellProps, data }) => <Link cellProps={cellProps} value={data?.nome} onClick={() => onClickPalete("all", data)} /> }] : [],
        ...(true) ? [{ name: 'inico', header: 'Início', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => data?.inico }] : [],
        ...(true) ? [{ name: 'fim', header: 'Fim', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => data?.fim }] : [],
        ...(true) ? [{ name: 'duracao', header: 'Duração', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => data?.duracao }] : [],
        ...(true) ? [{ name: 'comp', header: 'Comp.', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m">{getFloat(data?.comp, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'area', header: 'Área.', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m2">{getFloat(data?.area, 2)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'diam', header: 'Diam.', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="mm">{getFloat(data?.diam, 2)}</RightAlign> }] : []
    ];


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [hash_estadoproducao, data?.timestamp, data?.filter]);

    const loadData = async ({ signal, init = false } = {}) => {
        //submitting.trigger();
        setFormDirty(false);
        dataAPI.setAction("init", true);
        dataAPI.update(true);
        /* if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, null);
            inputParameters.current = paramsIn;
        }*/

        /*let { filterValues, fieldValues } = fixRangeDates([], inputParameters.current);
        formFilter.setFieldsValue({ ...fieldValues });
        dataAPI.addFilters({ ...filterValues }, true);
        dataAPI.setSort(dataAPI.getSort(), defaultSort);
        dataAPI.addParameters({ ...defaultParameters }, true); */
        //submitting.end();
    }

    const onFilterFinish = (type, values) => { }
    const onFilterChange = (changedValues, values) => { };
    const rowClassName = ({ data }) => {
        if (data?.valid == 0) {
            return tableCls.warning;
        }
    }

    return (<>
        <Table
            {...true && { style: { fontSize: "10px", minHeight: "150px" } }}
            {...true && { rowHeight: 25 }}
            //rowHeight={null}
            dirty={formDirty}
            loadOnInit={false}
            headerHeight={25}
            cellNavigation={false}
            enableSelection={false}
            showActiveRowIndicator={false}
            // loading={submitting.state}
            showLoading={false}
            idProperty={dataAPI.getPrimaryKey()}
            local={false}
            onRefresh={loadData}
            rowClassName={rowClassName}
            groups={groups}
            sortable={true}
            reorderColumns={false}
            showColumnMenuTool={false}
            disableGroupByToolbar={true}
            editable={{ enabled: false, add: false }}
            columns={columns}
            dataAPI={dataAPI}
            moreFilters={false}
            leftToolbar={false}
            toolbarFilters={false}
            toolbar={false}
        />
    </>);
}

const LineParameters = ({ data }) => {
    return (<>
        <Row nogutter>
            <Col width={200} style={{ textAlign: "center" }}>{(getFloat(data?.winder_speed, 1) - getFloat(data?.line_speed, 1)).toFixed(1)} m/min</Col>
        </Row>
        <Row nogutter>
            <Col>
                <Row nogutter>
                    <Col width={100}>
                        <MiniGaugeVelocidade data={getFloat(data?.winder_speed, 1)} title="V.Bobinadora" min={0} max={100} style={{ width: "80px", height: "80px" }} />
                    </Col>
                    <Col width={100}>
                        <MiniGaugeVelocidade data={getFloat(data?.line_speed, 1)} title="V. Linha" min={0} max={100} style={{ width: "80px", height: "80px" }} />
                    </Col>
                    <Col width={100}>
                        <MiniGaugeVelocidade data={getFloat(data?.avg_line_speed, 1)} title="V. Média" min={0} max={100} style={{ width: "80px", height: "80px" }} />
                    </Col>
                    <Col width={100}>
                        <MiniGaugeVelocidade data={getFloat(data?.max_line_speed, 1)} title="V. Máxima" min={0} max={100} style={{ width: "80px", height: "80px" }} />
                    </Col>
                    <Col width={100}>
                        <Row nogutter style={{}}><Col style={{ fontSize: "12px", fontFamily: "Microsoft YaHei", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center" }}><CiRuler fontSize={"18px"} />Capacity(current/set)</Col></Row>
                        <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>kg/h</Col></Row>
                        <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.Qnet_PV, 1)}/{getFloat(data?.Qnet_SP, 1)}</Col></Row>
                    </Col>
                </Row>
            </Col>
        </Row>
        <Row nogutter>
            <Col width={100}>
                <Row nogutter style={{}}><Col style={{ fontSize: "12px", fontFamily: "Microsoft YaHei", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center" }}>Film Thickness</Col></Row>
                <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.spess_PV, 1)}/{getFloat(data?.spess_MIS, 1)} &#181;m</Col></Row>
            </Col>
            <Col width={100}>
                <Row nogutter style={{}}><Col style={{ fontSize: "12px", fontFamily: "Microsoft YaHei", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center" }}>Film Density</Col></Row>
                <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.density, 3)} g/cm&sup3;</Col></Row>
            </Col>
            <Col width={100}>
                <Row nogutter style={{}}><Col style={{ fontSize: "12px", fontFamily: "Microsoft YaHei", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center" }}>Film Grammage</Col></Row>
                <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.grammage, 2)} g/m&sup2;</Col></Row>
            </Col>
            <Col width={100}>
                <Row nogutter style={{}}><Col style={{ fontSize: "12px", fontFamily: "Microsoft YaHei", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center", alignItems: "center" }}><TbMathAvg fontSize={"14px"} />Diameter</Col></Row>
                <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.diametro_bobine, 1)} mm</Col></Row>
            </Col>
            <Col width={80}>
                <Row nogutter style={{}}><Col style={{ fontSize: "12px", fontFamily: "Microsoft YaHei", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center" }}><CiRuler fontSize={"18px"} />Meters</Col></Row>
                <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.metros_bobine, 1)} m</Col></Row>
            </Col>
        </Row>
    </>);
}

const BobinesDefeitos = ({ data, onDefeitosClick }) => {
    const [summedData, setSummedData] = useState({});

    useEffect(() => {
        if (data?.defeitos) {
            const result = { id: data?.id, of_cod: data?.of_cod };
            for (const obj of data.defeitos) {
                const { id, ...rest } = obj;
                for (const column of defeitosToSum) {
                    result[column] = getFloat(result?.[column]) + getFloat(rest[column]);
                }
            }
            setSummedData(result);
        }
    }, [data?.timestamp]);

    return (<Container fluid style={{ padding: "0px", margin: "0px", fontSize: "10px" }}>
        <Row gutterWidth={2}>
            {BOBINE_DEFEITOS.filter(v=>v.value!=="troca_nw").map((item, index) => {
                return (
                    <React.Fragment key={`def-${summedData?.id}-${index}`}>
                        {summedData?.[item.value] > 0 && <><Col xs={5} style={{ textAlign: "right", fontWeight: summedData?.[item.value] > 0 ? 700 : 400 }}>{item.label}</Col>
                            <Col xs={1} style={{ fontWeight: summedData?.[item.value] > 0 ? 700 : 400 }}>{summedData?.[item.value] > 0 ? <div onClick={() => onDefeitosClick({ of_cod: summedData?.of_cod }, item)} style={{ color: "#0050b3" }}>{summedData?.[item.value]}</div> : summedData?.[item.value]}</Col>
                        </>}
                    </React.Fragment>
                );
            })}
        </Row>
    </Container>);
}

const TotaisEstadoBobines = ({ data, onTotaisEstadoClick }) => {
    const options = () => {
        // const legend = {
        //     data: []
        // };
        const xAxis = [
            { type: 'category', axisTick: { show: false }, data: [] }
        ];
        const yAxis = [
            { type: 'value' }
        ];
        let series = [];

        const _ofs = [...new Set(data?.bobines.map(item => item.ofid))];

        if (data?.bobines) {
            const groupedData = data?.bobines.reduce((acc, item) => {
                if (acc.hasOwnProperty(item.estado)) {
                    // if (!acc[item.estado].other.ofid.includes(item.ofid)) {
                    //     acc[item.estado].other.ofid.push(item.ofid);
                    //   }
                } else {
                    acc[item.estado] = { value: item.total_por_estado, itemStyle: { color: bColors(item.estado).color }, other: { ofid: _ofs } };
                }
                return acc;
            }, {});

            // Generate 'xAxis' and 'series' arrays
            xAxis[0].data = Object.keys(groupedData);
            // legend.data = Object.keys(groupedData);
            series.push({
                name: "estado",
                type: "bar",
                barWidth: 25,
                barGap: 0,
                label: {
                    show: true,
                    position: "top",
                },
                data: Object.values(groupedData)
            });
        }

        if (data?.defeitos) {
            const gData = data?.defeitos.reduce((acc, item) => {
                const { estado } = item;
                if (estado && !acc.hasOwnProperty(estado)) {
                    acc[estado] = defeitosToSum.reduce((sums, column) => {
                        sums[column] = getFloat(item[column]);
                        return sums;
                    }, {});
                    acc[estado]["ofid"] = [item.ofid];
                } else if (estado) {
                    // if (!acc[estado]["ofid"].includes(item.ofid)) {
                    //     acc[estado]["ofid"].push(item.ofid);
                    //   }
                    acc[estado]["estado"] = estado;
                    defeitosToSum.forEach((column) => {
                        acc[estado][column] += getFloat(item[column]);
                    });
                }
                return acc;
            }, {});
            // Generate the 'series' array
            series.push(...defeitosToSum.map((column) => ({
                id: column,
                name: BOBINE_DEFEITOS.find((item) => item.value === column)?.label,
                type: 'bar',
                stack: 'defeitos',
                barWidth: 15,
                data: Object.values(gData).map((sums) => ({ value: sums[column], label: BOBINE_DEFEITOS.find((item) => item.value === column)?.label, other: { ofid: _ofs, estado: sums["estado"], defeito: column } })),
            })));
        }

        const option = {
            title: {
                show: false,
                text: 'Bobines [Estados e Defeitos]',
                textAlign: "left",
                textStyle: {
                    fontSize: 12
                }
            },
            grid: {
                left: 2,
                containLabel: true,
                bottom: 2,
                top: 30,
                right: 20
            },
            tooltip: {
                show: true,
                trigger: 'axis',
                triggerOn: "mousemove",
                confine: true,
                enterable: true,
                formatter: function (params, a, b, c) {
                    var content = '';
                    // Iterate over each item in params
                    for (var i = 0; i < params.length; i++) {
                        var data = params[i].data; // Data for the specific bar in the stack
                        var seriesName = params[i].seriesName; // Series name (stack name)
                        var value = Array.isArray(data) ? data[params[i].dataIndex] : data;
                        content += `<div class="tooltip-item" data-index="${i}" data-axisvalue="${params[i].axisValue}" style="font-weight:${value.value > 0 ? 700 : 400};"><span style="color:` + params[i].color + '">&#9632;</span> ' + seriesName + ': ' + value.value + '</div>';
                    }
                    return content;
                },
                axisPointer: {
                    type: 'shadow'
                },
                textStyle: {
                    fontSize: 9
                }
            },
            toolbox: {
                show: true,
                orient: 'vertical',
                //left: 'right',
                top: 'center',
                right: 0,
                itemSize: 12,
                itemGap: 3,
                feature: {
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                    saveAsImage: { show: true },
                    dataZoom: { show: true }
                }
            },
            /* legend, */
            xAxis,
            yAxis,
            series
        };
        return option;
    }

    useEffect(() => {
    }, [data?.timestamp]);

    const onSeriesClick = (v) => {
        onTotaisEstadoClick(v.name, v.data.other.ofid);
    }

    const onTooltipClick = (v, axisValue) => {
        let defeito = null;
        if (v[0].other.defeito) {
            defeito = { value: v[0].other.defeito, label: v[0].label, key: v[0].other.defeito };
        }
        onTotaisEstadoClick(axisValue, v[0].other.ofid, defeito && defeito);
    }

    return (<div>
        {data?.bobines && <>
            <div style={{ background: "#f0f0f0", padding: "5px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                <div style={{}}>Bobines [Estados e Defeitos]</div>
            </div>
            <ReactECharts option={options()} onTooltipClick={onTooltipClick} events={[
                { eventName: "click", query: { seriesName: 'estado' }, handler: onSeriesClick }
            ]} style={{ width: "500px", height: "200px" }} /></>}
    </div>);
}

const BobinesTotais = ({ data }) => {
    return (
        <>
            {/* <div style={{ display: "flex", flexDirection: "row", textAlign: "right", fontSize: "11px" }}>
                <div style={{ width: "60px" }}></div>
                <div style={{ flex: .6, fontWeight: 700, paddingRight: "3px" }}>{getFloat(data?.qty_encomenda, 1).toLocaleString('pt-PT')}m&#178;</div>
                <div style={{ width: "60px" }}></div>
                <div style={{ flex: 1, fontWeight: 700, paddingRight: "3px" }}>{getFloat(data?.paletes_m2_produzidas, 1).toLocaleString('pt-PT')}m&#178;</div>
                <div style={{ width: "70px" }}></div>
                <div style={{ flex: 1, fontWeight: 700, paddingRight: "3px" }}>{getFloat(data.bobines_retrabalhadas[0]?.total_por_of_m2, 1).toLocaleString('pt-PT')}m&#178;</div>
            </div> */}
            {/* <div style={{ width: "60px" }}></div>
                <div style={{ flex: .6, fontWeight: 700 }}></div>
                <div style={{ width: "60px" }}></div>
                <div style={{ flex: 1, fontWeight: 700 }}>{((getFloat(data.bobines[0]?.total_produzidas_of) * 100) / getFloat(data.num_bobines_of)).toFixed(1)}%</div>
                <div style={{ width: "70px" }}></div>
                <div style={{ flex: 1, fontWeight: 700 }}>{getFloat(data.bobines[0]?.total_produzidas_of) == 0 ? 0 : ((getFloat(data.bobines_retrabalhadas[0]?.total_por_of) * 100) / getFloat(data.bobines[0]?.total_produzidas_of)).toFixed(1)}%</div> */}
            <div style={{ border: "solid 1px #000", fontSize: "10px" }}>
                <div style={{ display: "flex", padding: "2px", justifyContent: "space-between", background: "#f0f0f0" }}><div style={{ fontWeight: 700 }}>Total de bobines retrabalhadas</div><div style={{ fontWeight: 700 }}>{getFloat(data.bobines_retrabalhadas[0]?.total_por_of_m2, 1).toLocaleString('pt-PT')}m&#178;</div><div style={{ fontWeight: 700 }}>{getFloat(data.bobines[0]?.total_produzidas_of) == 0 ? 0 : ((getFloat(data.bobines_retrabalhadas[0]?.total_por_of) * 100) / getFloat(data.bobines[0]?.total_produzidas_of)).toFixed(1)}%</div></div>
            </div>
            <div style={{ border: "solid 1px #000", fontSize: "10px", marginTop: "5px" }}>
                <div style={{ display: "flex", padding: "2px", justifyContent: "space-between", background: "#f0f0f0" }}><div style={{ fontWeight: 700 }}>Total produzido para a encomenda</div><div>{getFloat(data?.qty_encomenda, 1).toLocaleString('pt-PT')}m&#178;</div></div>
                <div style={{ display: "flex", flexDirection: "row", textAlign: "right", fontSize: "10px", padding: "2px" }}>
                    <div style={{ flex: 1, fontWeight: 700 }}>{getFloat(data?.paletes_m2_produzidas, 1).toLocaleString('pt-PT')}m&#178;</div>
                    <div style={{ flex: 1, fontWeight: 700 }}>{getFloat(data?.qty_encomenda, 1)} {((getFloat(data?.paletes_m2_produzidas, 1) / getFloat(data?.qty_encomenda, 1)) * 100).toFixed(2)}%</div>
                </div>
            </div>
            <div style={{ border: "solid 1px #000", fontSize: "10px", marginTop: "5px" }}>
                <div style={{ display: "flex", padding: "2px", justifyContent: "space-between", background: "#f0f0f0" }}><div style={{ fontWeight: 700 }}>Total produzido</div></div>
                <div style={{ display: "flex", flexDirection: "row", textAlign: "right", fontSize: "10px", padding: "2px" }}>
                    <div style={{ flex: 1, fontWeight: 700 }}>{getFloat(data?.paletes_m2_produzidas_total, 1).toLocaleString('pt-PT')}m&#178;</div>
                    <div style={{ flex: 1, fontWeight: 700 }}>{((getFloat(data?.paletes_m2_produzidas_total, 1) / getFloat(data?.qty_encomenda, 1)) * 100).toFixed(2)}%</div>
                </div>
            </div>
        </>
    );
}

const EstadoProducao = ({ hash_estadoproducao, parameters, ...props }) => {
    const media = useContext(MediaContext);
    const permission = usePermission({ name: "widget", item: "estadoProducao" });//Permissões Iniciais
    const inputParameters = useRef({});
    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles({ vSpacing: 5, hSpacing: 5 });
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: ``, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });
    const submitting = useSubmitting(true);
    const [ofs, setOfs] = useState([]);
    const [activeKeys, setActiveKeys] = useState(["1", "2", "3"]);
    const [paletes, setPaletes] = useState([]);
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "paletesexpand": return <PaletesList parameters={{ ...modalParameters.parameters }} noid={true} />
                case "bobines": return <BobinesList parameters={{ ...modalParameters.parameters }} noid={true} />
                case "bobinagensexpand": return <BobinagensList parameters={{ ...modalParameters.parameters }} noid={true} />
                case "formulacao": return <FormFormulacao parameters={modalParameters.parameters} />
                case "granuladopick": return <GranuladoPick parameters={modalParameters.parameters} />
                case "paletesstock": return <PaletesStockList parameters={modalParameters.parameters} />
                //case "paletesexpand": return <ListPaletesOf data={{ ...modalParameters.parameters }} />;
            }
        }

        return (
            <ResponsiveModal lazy={modalParameters?.lazy} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onPaletesExpand = () => {
        setModalParameters({ content: "paletesexpand", type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Paletes</div>, parameters: { filter: { fof: `in:${ofs.join(",")}` } } });
        showModal();
    }
    const onBobinagensExpand = () => {
        setModalParameters({ content: "bobinagensexpand", type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Bobinagens</div>, parameters: { filter: { fofabrico: `in:${ofs.join(",")}` } } });
        showModal();
    }
    const onDefeitosClick = (data, item) => {
        setModalParameters({ content: "bobines", type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Bobines</div>, parameters: { filter: { fcomp: ">=0", frecycle: "in:0,1", fof: `==${data?.of_cod}`, fdefeitos: [{ ...item, key: item.value }] } } });
        showModal();
    }
    const onEstadoClick = (data, estado) => {
        const item = BOBINE_ESTADOS.filter(v => v.value === estado)[0];
        setModalParameters({ content: "bobines", type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Bobines</div>, parameters: { filter: { fcomp: ">=0", frecycle: "in:0,1", fof: `==${data?.of_cod}`, festados: [{ ...item, key: item.value }] } } });
        showModal();
    }
    const onTotaisEstadoClick = (estado, ofsData, defeito) => {
        const item = BOBINE_ESTADOS.filter(v => v.value === estado)[0];
        setModalParameters({ content: "bobines", type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Bobines</div>, parameters: { filter: { fcomp: ">=0", frecycle: "in:0,1", fof: `in:${ofsData.join(",")}`, festados: [{ ...item, key: item.value }], ...defeito && { fdefeitos: [defeito] } } } });
        showModal();
    }
    const onPaletesStockClick = (data) => {
        setModalParameters({ content: "paletesstock", type: "drawer", push: false, width: "90%", lazy:true, title: <div style={{ fontWeight: 900 }}>Paletes de Stock</div>, parameters: { filter: { fordem_id: `==${data?.id}` } } });
        showModal();
    }


    const onOpenFormulacao = (type) => {
        if (parameters?.data?.current?.cs_id) {
            setModalParameters({ content: "formulacao", type: "drawer", width: "95%", title: "Formulação", lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: { cs_id: parameters?.data?.current?.cs_id, type } });
            showModal();
        }
    }
    const onGranuladoPick = () => {
        setModalParameters({ content: "granuladopick", type: "drawer", width: "95%", title: "Entrada/Saída de granulado em linha", lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: {} });
        showModal();
    }



    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [hash_estadoproducao, parameters?.data?.timestamp, parameters?.isRunning, parameters?.isClosed]);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (parameters?.data?.rows) {
            const _dj = Object.values(parameters?.data?.rows.reduce((acc, cur) => {
                if (!acc[cur.gid]) {
                    acc[cur.gid] = { ...cur, stock: cur.current_stock == 1 ? cur : {} };
                } else {
                    if (cur.current_stock == 1) {
                        acc[cur.gid].stock = cur;
                    } else {
                        //acc[cur.gid].a += cur.a;
                    }
                }

                //totals
                acc[cur.gid].timestamp = parameters?.data?.timestamp;
                acc[cur.gid].paletizacao = { ...json(parameters?.data?.current?.paletizacao).find(v => v.of_cod == acc[cur.gid]?.of_cod) };
                acc[cur.gid].bobines = parameters?.data?.bobines?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
                acc[cur.gid].bobines_nopalete = parameters?.data?.bobines_nopalete?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
                acc[cur.gid].bobines_retrabalhadas = parameters?.data?.bobines_retrabalhadas?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
                acc[cur.gid].paletes_m2_produzidas = parameters?.data?.paletes.find(v => v.ofid == acc[cur.gid]?.of_cod)?.num_m2_produzidos; //Calcula até ao nº de paletes planeados
                acc[cur.gid].paletes_m2_produzidas_total = parameters?.data?.paletes.find(v => v.ofid == acc[cur.gid]?.of_cod)?.num_m2_produzidos_total; //Calcula todas as paletes produzidas, mesmo passando o planeado
                acc[cur.gid].qty_encomenda = parameters?.data?.paletes.find(v => v.ofid == acc[cur.gid]?.of_cod)?.qty_encomenda;
                acc[cur.gid].defeitos = parameters?.data?.defeitos?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
                acc[cur.gid].num_paletes_of_percentage = getFloat((100 * getFloat(acc[cur.gid].current_num_paletes_of)) / getFloat(acc[cur.gid].num_paletes_of), 0);
                acc[cur.gid].total_planned = {
                    num_paletes: getFloat(acc[cur.gid].num_paletes) * json(acc[cur.gid].lvl).length,
                    num_bobines: getFloat(acc[cur.gid].num_bobines) * json(acc[cur.gid].lvl).length
                };
                acc[cur.gid].total_current = {
                    num_paletes_line: getFloat(acc[cur.gid]?.current_num_paletes),
                    num_paletes_stock: getFloat(acc[cur.gid]?.stock?.current_num_paletes),
                    num_bobines_line: getFloat(acc[cur.gid]?.current_num_bobines),
                    num_bobines_stock: getFloat(acc[cur.gid]?.stock?.current_num_bobines)
                }
                acc[cur.gid].total_current["num_paletes"] = acc[cur.gid].total_current["num_paletes_line"] + acc[cur.gid].total_current["num_paletes_stock"];
                acc[cur.gid].total_current["num_paletes_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_paletes) / (acc[cur.gid].total_planned.num_paletes), 0);
                acc[cur.gid].total_current["num_bobines"] = acc[cur.gid].total_current["num_bobines_line"] + acc[cur.gid].total_current["num_bobines_stock"];
                acc[cur.gid].total_current["num_bobines_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_bobines) / (acc[cur.gid].total_planned.num_bobines), 0);

                return acc;
            }, {}));
            console.log("djjjjjjjjjjj", _dj, parameters?.data)
            const _ofs = [...new Set(_dj.map(obj => obj.of_cod))];
            setOfs([..._ofs]);
            dataAPI.setData({ rows: _dj, total: _dj.length });





            // setOfsData(_dj);
            // const _djd = parameters?.data?.rows.filter((obj, index, self) =>
            //     index === self.findIndex((t) => (
            //         t.of_cod === obj.of_cod
            //     ))
            // );
            // setOfs(_djd);
        }
        submitting.end();
    }

    useEffect(() => {
        setPaletes([...ofs]);
    }, [JSON.stringify(ofs)])

    const onTogglePaletes = (v) => {
        let _p = [...paletes];
        const idx = _p.indexOf(v);
        if (idx === -1) {
            _p.push(v);
        } else {
            _p.splice(idx, 1);
        }
        if (_p.length == 0) {
            _p = [...ofs];
        }
        setPaletes(_p);
    }

    const onActiveKeyChange = (v) => {
        setActiveKeys([...new Set(["1", "2", "3", ...v])]);
    }

    return (<>
        <Container fluid style={{ padding: "0px" }}>
            <Row nogutter>
                <Col width={720}>
                    <Row nogutter style={{}}>
                        {dataAPI.hasData() && ofs.map((v, i) => {
                            const items = dataAPI.getData().rows.filter(x => x.of_cod == v);
                            return (
                                <Col key={`off-${i}`} lg={12} xl={6}>
                                    <Row nogutter style={{ border: "solid 1px #595959", margin: "5px 5px 0 0" }}>


                                        <Col style={{}}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#002766", color: "#fff", padding: "5px" }}><ArtigoColumn data={items[0]} /><Checkbox checked={paletes.includes(v)} onChange={() => onTogglePaletes(v)} /></div>
                                            {/**TOOLBOX */}
                                            <div style={{ display: "flex", justifyContent: "end", alignItems: "center", background: "#f0f0f0", color: "#000", padding: "2px" }}>
                                                <Space>
                                                    <Button type="primary" size="small" /* onClick={onBobinagensExpand} */ ghost icon={<PaperClipOutlined />} title="Anexos" />
                                                    <Button type="primary" size="small" /* onClick={onBobinagensExpand} */ ghost title="Paletização">Paletização</Button>
                                                    <Button type="primary" size="small" onClick={()=>onPaletesStockClick(items[0])} ghost title="Paletes de stock">Stock</Button>
                                                </Space>
                                            </div>
                                            <div style={{ height: "300px" }}>
                                                <YScroll>
                                                    <div style={{}}>

                                                        <Container fluid style={{ padding: "0px" }}>
                                                            <Row nogutter style={{ backgroundColor: "#fafafa", textAlign: "center", display: "flex", alignItems: "center", marginTop: "5px" }}>
                                                                <Col width={120} style={{ fontSize: "10px" }}>Bobines por palete</Col>
                                                                <Col width={35}>Linha</Col>
                                                                <Col width={35}>Stock</Col>
                                                                <Col width={50}>Total</Col>
                                                                <Col><Progress percent={items[0]?.num_paletes_of_percentage} showInfo={true} trailColor="#dbdbdb" /></Col>
                                                            </Row>
                                                            {items.map((x, idx) => {
                                                                return (
                                                                    <Row key={`itm-${v}-${idx}`} gutterWidth={2} style={{ textAlign: "center", alignItems: "center" }}>
                                                                        <Col width={120}><PaletePositionColumn data={x} /></Col>
                                                                        <Col width={35}>{lpadFloat(x?.total_current?.num_paletes_line)}</Col>
                                                                        <Col width={35}>{lpadFloat(x?.total_current?.num_paletes_stock)}</Col>
                                                                        <Col width={50}><b>{lpadFloat(x?.total_current?.num_paletes)}</b>/{lpadFloat(x?.num_paletes)}</Col>
                                                                        <Col></Col>
                                                                    </Row>
                                                                );
                                                            })}
                                                        </Container>

                                                    </div>
                                                    <div style={{}}>
                                                        <StyledCollapse expandIconPosition="end" bordered={false} activeKey={activeKeys} style={{ padding: "5px" }} onChange={onActiveKeyChange}>
                                                            <Panel showArrow={false} header={<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%" }}><div><b>Bobines</b></div></div>} key="1">
                                                                <Container fluid style={{ padding: "0px" }}>

                                                                    <Row gutterWidth={2} style={{ textAlign: "center", alignItems: "center", margin: "10px 0" }}>
                                                                        <Col><MiniBarBobines onEstadoClick={onEstadoClick} data={items[0]} style={{ width: "100%", height: "25px" }} /></Col>
                                                                    </Row>
                                                                </Container>
                                                            </Panel>
                                                            {items[0]?.bobines_nopalete.length > 0 && <Panel showArrow={false} header={<div style={{ display: "flex", flexDirection: "row", fontWeight: 700/* , justifyContent: "right" */, width: "100%"/* , fontStyle: "italic" */ }}><div>Bobines sem palete atribuída</div></div>} key="2">
                                                                <Container fluid style={{ padding: "0px" }}>
                                                                    <Row gutterWidth={2} style={{ textAlign: "center", alignItems: "center", margin: "10px 0" }}>
                                                                        <Col><MiniBarBobinesNoPalete onEstadoClick={onEstadoClick} data={items[0]} style={{ width: "100%", height: "25px" }} /></Col>
                                                                    </Row>
                                                                </Container>
                                                            </Panel>}
                                                            <Panel showArrow={true} header={<div style={{ width: "100%", fontSize: "10px" }}>
                                                                <div style={{ fontWeight: 700, fontSize: "12px" }}>Resumo de Produção</div>
                                                                <div style={{ display: "flex", flexDirection: "row" }}>
                                                                    <div style={{ width: "45px", fontWeight: 700 }}>Bobines:</div>
                                                                    <div style={{ width: "60px" }}>Planeadas</div>
                                                                    <div style={{ flex: .6, fontWeight: 700 }}>{getFloat(items[0].num_bobines_of)}</div>
                                                                    <div style={{ width: "60px" }}>Produzidas</div>
                                                                    <div style={{ flex: 1, fontWeight: 700, paddingRight: "3px" }}>{getFloat(items[0].bobines[0]?.total_produzidas_of)}</div>
                                                                    <div style={{ width: "70px" }}>Retrabalhadas</div>
                                                                    <div style={{ flex: 1, fontWeight: 700, paddingRight: "3px" }}>{getFloat(items[0].bobines_retrabalhadas[0]?.total_por_of)}</div>
                                                                </div>
                                                            </div>

                                                            } key={`tof-${items[0].id}10`}>
                                                                <Container fluid style={{ padding: "0px" }}>
                                                                    <Row gutterWidth={2} style={{ textAlign: "center", alignItems: "center", margin: "10px 0" }}>
                                                                        <Col><BobinesTotais data={items[0]} /></Col>
                                                                    </Row>
                                                                </Container>
                                                            </Panel>
                                                            <Panel showArrow={false} header={<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%" }}><div><b>Defeitos</b></div></div>} key="3">
                                                                <Container fluid style={{ padding: "0px" }}>
                                                                    <Row gutterWidth={2} style={{ textAlign: "center", alignItems: "center", margin: "10px 0" }}>
                                                                        <Col><BobinesDefeitos onDefeitosClick={onDefeitosClick} data={items[0]} style={{ width: "100%", height: "25px" }} /></Col>
                                                                    </Row>
                                                                </Container>
                                                            </Panel>
                                                            {/* <Panel header={<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%" }} ><div><b>Paletização</b></div></div>} key="2">
                                                            <div style={{height: "200px"}}>
                                                            <YScroll>
                                                                <PaletizacaoSchema items={json(items[0]?.paletizacao?.paletizacao)} heightPercentage={.6} />
                                                            </YScroll>
                                                            </div>
                                                        </Panel> */}
                                                        </StyledCollapse>
                                                    </div>
                                                </YScroll>
                                            </div>
                                        </Col>

                                    </Row>
                                </Col>
                            )
                        })
                        }



                    </Row>
                </Col>


                <Col>
                    <Row nogutter className={classes.container} >
                        {/**PALETES */}
                        <Col lg={12} xl={7}>
                            <Row nogutter>
                                {paletes.length > 0 && <Col /* width={650} */ style={{ border: "solid 1px #595959", padding: "5px" }}>
                                    <Row nogutter>
                                        <Col style={{ background: "#f0f0f0", padding: "5px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                                            <div style={{}}>Paletes</div>
                                            <div><Button type="primary" size="small" onClick={onPaletesExpand} ghost icon={<ExpandAltOutlined />} /></div>
                                        </Col>
                                    </Row>
                                    <Row nogutter>
                                        <Col>
                                            <div style={{}}><ListPaletesOf data={{ paletes: parameters?.data?.paletes, timestamp: parameters?.data?.timestamp, filter: paletes }} mini={true} /></div>
                                        </Col>
                                    </Row>
                                </Col>}
                            </Row>
                        </Col>

                        {/**CORTES */}
                        <Col lg={12} xl={5}>
                            <Row nogutter>
                                <Col style={{ border: "solid 1px #595959", padding: "5px" }}>
                                    <Row nogutter>
                                        <Col style={{ background: "#f0f0f0", padding: "5px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                                            <div style={{}}>Cortes</div>
                                            <div><Button type="primary" size="small" /* onClick={onPaletesExpand} */ ghost icon={<EditOutlined />} /></div>
                                        </Col>
                                    </Row>
                                    <Row nogutter>
                                        <Col>
                                            <div style={{}}>
                                                <Suspense fallback={<></>}><FormCortes forInput={false} record={{ ofs, cortes: json(parameters?.data?.current?.cortes), cortesordem: json(parameters?.data?.current?.cortesordem) }} /></Suspense>
                                                {/* <ListPaletesOf data={{ paletes: parameters?.data?.paletes, timestamp: parameters?.data?.timestamp, filter: paletes }} mini={true} /> */}
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>

                        {/**PARAMETROS DE LINHA E GRANULADO EM LINHA */}
                        <Col lg={12} xl={6}>
                            <Row nogutter>

                                <Col style={{ display: "flex", flexDirection: "column" }}>
                                    <Row nogutter style={{ border: "solid 1px #595959", padding: "5px" }}>
                                        <Col>
                                            <div style={{}}><LineParameters data={parameters?.data?.params} /></div>
                                        </Col>
                                    </Row>
                                    {/*                     <Row nogutter style={{ border: "solid 1px #595959", margin: "5px 0 0 0", padding: "5px" }}>
                                    <Col>
                                        <div style={{}}><TotaisEstadoBobines data={parameters?.data} onTotaisEstadoClick={onTotaisEstadoClick} /></div>
                                    </Col>
                                </Row> */}

                                    <Row nogutter style={{ border: "solid 1px #595959", padding: "5px", margin: "5px 0 0 0" }}>{/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#002766", color: "#fff", padding: "5px" }}>xxxxx</div> */}
                                        <Col>
                                            <Row nogutter>
                                                <Col style={{ background: "#f0f0f0", padding: "5px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                                                    <div style={{}}>Granulado em linha</div>
                                                    <div>
                                                        <Space>
                                                            <Button type="primary" size="small" ghost title="Alterar formulação" disabled={!permission.isOk({ item: "formulacao", action: "inproduction", forInput: !parameters?.isClosed })} onClick={() => onOpenFormulacao("formulacao_formulation_change")}>Formulação</Button>
                                                            <Button type="primary" size="small" ghost title="Alterar doseadores" disabled={!permission.isOk({ item: "formulacao", action: "inproduction", forInput: !parameters?.isClosed })} onClick={() => onOpenFormulacao("formulacao_dosers_change")}>Doseadores</Button>
                                                            <Button type="primary" size="small" icon={<TabletOutlined />} title="Entrada e saida de granulado da linha" onClick={onGranuladoPick} />
                                                            <Button type="primary" size="small" /* onClick={onBobinagensExpand} */ ghost icon={<ExpandAltOutlined />} title="Ver movimentos de granulado na linha" />
                                                        </Space>
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row nogutter>
                                                <Col>
                                                    <div style={{}}><ListGranuladoInline data={parameters?.data} /></div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>


                                </Col>
                            </Row>
                        </Col>




                        <Col lg={12} xl={6}>
                            <Row nogutter>
                                <Col style={{ display: "flex", flexDirection: "column" }}>
                                    {/**ÚLTIMAS BOBINAGENS */}
                                    <Row nogutter style={{ border: "solid 1px #595959", padding: "5px" }}>
                                        <Col >
                                            <Row nogutter>
                                                <Col style={{ background: "#f0f0f0", padding: "5px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                                                    <div style={{}}>Últimas bobinagens</div>
                                                    <div><Button type="primary" size="small" onClick={onBobinagensExpand} ghost icon={<ExpandAltOutlined />} /></div>
                                                </Col>
                                            </Row>
                                            <Row gutterWidth={5} style={{ display: "flex", fontSize: "11px" }}>
                                                <Col width={115} style={{ fontWeight: 700, fontSize: "10px" }}>Nº Bobinagens</Col>
                                                <Col width={55} style={{}}>{parameters?.data?.bobinagens?.n_bobinagens}</Col>
                                                <Col width={30} style={{ fontWeight: 700, fontSize: "10px" }}>Mín.</Col>
                                                <Col width={55} style={{}}>{secondstoDay(getFloat(parameters?.data?.bobinagens?.min) * 60)}</Col>
                                                <Col width={90} style={{ fontWeight: 700, fontSize: "10px" }}>Duração média</Col>
                                                <Col width={55} style={{}}>{secondstoDay(getFloat(parameters?.data?.bobinagens?.average) * 60)}</Col>
                                            </Row>
                                            <Row gutterWidth={5} style={{ display: "flex", fontSize: "11px" }}>
                                                <Col width={115} style={{ fontWeight: 700, fontSize: "10px" }}>Última bobinagem</Col>
                                                <Col width={55} style={{}}>{secondstoDay(getFloat(parameters?.data?.bobinagens?.last_bobinagem) * 60)}</Col>
                                                <Col width={30} style={{ fontWeight: 700, fontSize: "10px" }}>Máx.</Col>
                                                <Col width={55} style={{}}>{secondstoDay(getFloat(parameters?.data?.bobinagens?.max) * 60)}</Col>
                                                <Col width={90} style={{ fontWeight: 700, fontSize: "10px" }}>Diam. Médio</Col>
                                                <Col width={55} style={{}}>{getFloat(parameters?.data?.bobinagens?.diam_avg)}mm</Col>
                                                <Col width={90} style={{ fontWeight: 700, fontSize: "10px" }}>Comp. Médio</Col>
                                                <Col width={55} style={{}}>{getFloat(parameters?.data?.bobinagens?.comp_avg)}m</Col>
                                            </Row>
                                            <Row nogutter>
                                                <Col>
                                                    <div style={{}}><ListBobinagens data={parameters?.data} /></div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>


                                    {/**NONWOVENS PLANEADOS */}
                                    <Row nogutter style={{ border: "solid 1px #595959", padding: "5px", margin: "5px 0 0 0 " }}>
                                        <Col >
                                            <Row nogutter>
                                                <Col style={{ background: "#f0f0f0", padding: "5px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                                                    <div style={{}}>Nonwovens planeados</div>
                                                    <div><Button type="primary" size="small" /* onClick={onBobinagensExpand} */ ghost icon={<EditOutlined />} /></div>
                                                </Col>
                                            </Row>
                                            <Row gutterWidth={5} style={{ display: "flex", fontSize: "11px" }}>
                                                <Col width={60} style={{ fontWeight: 700, fontSize: "10px", display: "flex", alignItems: "center" }}><CaretUpOutlined style={{ fontSize: "14px" }} /><div>Superior</div></Col>
                                                <Col width={100} style={{}}>{parameters?.data?.nws_planeados?.nw_cod_sup}</Col>
                                                <Col style={{ fontWeight: 700 }}>{parameters?.data?.nws_planeados?.nw_des_sup}</Col>
                                            </Row>

                                            <Row gutterWidth={5} style={{ display: "flex", fontSize: "11px" }}>
                                                <Col width={60} style={{ fontWeight: 700, fontSize: "10px", display: "flex", alignItems: "center" }}><CaretDownOutlined style={{ fontSize: "14px" }} /><div>Inferior</div></Col>
                                                <Col width={100} style={{}}>{parameters?.data?.nws_planeados?.nw_cod_inf}</Col>
                                                <Col style={{ fontWeight: 700 }}>{parameters?.data?.nws_planeados?.nw_des_inf}</Col>
                                            </Row>
                                        </Col>
                                    </Row>


                                    {/**NONWOVENS FILA */}
                                    <Row nogutter style={{ border: "solid 1px #595959", padding: "5px", margin: "5px 0 0 0 " }}>
                                        <Col >
                                            <Row nogutter>
                                                <Col style={{ background: "#f0f0f0", padding: "5px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                                                    <div style={{}}>Nonwovens Fila</div>
                                                    <div><Button type="primary" size="small"/*  onClick={onBobinagensExpand} */ ghost icon={<ExpandAltOutlined />} /></div>
                                                </Col>
                                            </Row>
                                            <Row nogutter>
                                                <Col>
                                                    <div style={{}}><ListNWsQueue data={parameters?.data} /></div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>



                                </Col>

                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container >
        {/* <Table
            style={{ fontSize: "11px", minHeight: (70 + (42 * dataAPI.getTotalRows())), backgroundColor: parameters?.isRunning ? "#d9f7be" : "#ffa39e" }}
            rowHeight={40}
            //rowHeight={null}
            headerHeight={20}
            cellNavigation={false}
            enableSelection={false}
            showActiveRowIndicator={false}
            loading={submitting.state}
            idProperty={dataAPI.getPrimaryKey()}
            local={true}
            onRefresh={loadData}
            rowClassName={rowClassName}
            groups={groups}
            sortable={false}
            reorderColumns={false}
            showColumnMenuTool={false}
            disableGroupByToolbar={true}
            editable={{ enabled: false, add: false }}
            columns={columns}
            dataAPI={dataAPI}
            moreFilters={false}
            leftToolbar={false}
            toolbarFilters={false}
            toolbar={false}
        /> */}
    </>);
}

const MiniBarBobinesx = ({ data, style, opts, ...props }) => {

    useEffect(() => {
        console.log("DATA-CHART", data)
    }, [data?.timestamp])

    const option = {
        tooltip: {
            extraCssText: 'z-index:9000;',
            trigger: 'axis',
            axisPointer: {
                // Use axis to trigger tooltip
                type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
            }
        },
        legend: { show: false },
        grid: {
            //left: '50px',
            //containLabel: true
        },
        xAxis: {
            type: 'value',
            show: false,
        },
        yAxis: {
            type: 'category',
            data: ['Estado'],
            show: false
        },
        series: [
            {
                name: 'Direct',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                // emphasis: {
                //     focus: 'series'
                // },
                data: [320]
            },
            {
                name: 'Mail Ad',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                // emphasis: {
                //     focus: 'series'
                // },
                data: [210]
            },
            {
                name: 'Affiliate Ad',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                // emphasis: {
                //     focus: 'series'
                // },
                data: [310]
            },
            {
                name: 'Video Ad',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                // emphasis: {
                //     focus: 'series'
                // },
                data: [410]
            },
            {
                name: 'Search Engine',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                // emphasis: {
                //     focus: 'series'
                // },
                data: [1320]
            }
        ]
    };
    return (<ReactECharts option={option} opts={opts} style={{ ...style }} />);
}

const MiniBarBobines = ({ data, style, minWidth = 35, max = 200, onEstadoClick, ...props }) => {
    const cls = useStyles();
    const [widths, setWidths] = useState([]);
    useEffect(() => {
        let sum = 0;

        const _widths = data?.bobines?.map((v, i) => {
            const totalProduzidas = data.bobines[0].total_produzidas_of;
            const t = ((v.total_por_estado_of * max) / totalProduzidas) + minWidth;
            sum = sum + (t);
            return t;
        });
        setWidths(_widths.map((v, i) => {
            return ((100 * v) / sum);
        }));
    }, [data?.timestamp])

    // const cWidth = (value) => {
    //     const totalProduzidas = data.bobines[0].total_produzidas_of;
    //     console.log("$$$$", getFloat(value), getFloat(totalProduzidas))
    //     console.log(`${((getFloat(value) * max) / getFloat(totalProduzidas))}px`)
    //     return `${((value * max) / totalProduzidas) + minWidth}px`;
    // }

    return (<>{data?.bobines && <div className={cls.bobineschart} style={{ lineHeight: 1.1, fontSize: "10px", ...style }}>{data?.bobines?.map((v, i) => {
        return (<div onClick={() => onEstadoClick(data, v.estado)} key={`cbe-${i}-${v.ofid}`} style={{ width: `${widths[i]}%`, background: bColors(v.estado).color, color: bColors(v.estado).fontColor }}><div style={{ fontWeight: 700 }}>{v.estado}</div><div>{v.total_por_estado_of}</div></div>);
    })}</div>}</>);
}

const MiniBarBobinesNoPalete = ({ data, style, minWidth = 35, max = 200, onEstadoClick, ...props }) => {
    const cls = useStyles();
    const [widths, setWidths] = useState([]);
    useEffect(() => {
        let sum = 0;
        const _widths = data?.bobines_nopalete?.map((v, i) => {
            const total = data.bobines_nopalete[0].total_por_of;
            const t = ((v.total_por_estado_of * max) / total) + minWidth;
            sum = sum + (t);
            return t;
        });
        setWidths(_widths.map((v, i) => {
            return ((100 * v) / sum);
        }));
    }, [data?.timestamp])

    // const cWidth = (value) => {
    //     const totalProduzidas = data.bobines[0].total_produzidas_of;
    //     console.log("$$$$", getFloat(value), getFloat(totalProduzidas))
    //     console.log(`${((getFloat(value) * max) / getFloat(totalProduzidas))}px`)
    //     return `${((value * max) / totalProduzidas) + minWidth}px`;
    // }

    return (<>{data?.bobines_nopalete && <div className={cls.bobineschart} style={{ lineHeight: 1.1, fontSize: "10px", ...style }}>{data?.bobines_nopalete?.map((v, i) => {
        return (<div onClick={() => onEstadoClick(data, v.estado)} key={`cbe-${i}-${v.ofid}`} style={{ width: `${widths[i]}%`, background: bColors(v.estado).color, color: bColors(v.estado).fontColor, opacity: 0.6 }}><div style={{ fontWeight: 700 }}>{v.estado}</div><div>{v.total_por_estado_of}</div></div>);
    })}</div>}</>);
}

export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);
    const { hash: { hash_estadoproducao, hash_linelog_params }, data: { estadoProducao } } = useContext(SocketContext) || { hash: {}, data: {} };
    const [dataParams, setDataParams] = useState({});
    const [dataEstadoProducao, setDataEstadoProducao] = useState([]);



    const permission = usePermission({ name: "widget", item: "estadoProducao" });//Permissões Iniciais
    const inputParameters = useRef({});

    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles({ vSpacing: 5, hSpacing: 5 });
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: ``, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });
    const submitting = useSubmitting(true);
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            // switch (modalParameters.content) {
            //     case "formulacao": return <FormFormulacao parameters={modalParameters.parameters} />;
            // }
        }
        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onOpenFormulacao = (type) => {
        // console.log(inputParameters.current)
        // if (inputParameters.current?.cs_id) {
        //     setModalParameters({ content: "formulacao", type: "drawer", width: "95%", title: "Formulação", push: false, loadData: () => dataAPI.fetchPost(), parameters: { cs_id: inputParameters.current?.cs_id, type } });
        //     showModal();
        // }
    }

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [props?.parameters?.cs_id]);

    const loadData = async ({ signal, init = false } = {}) => {
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, ["cs_id"]);
            inputParameters.current = paramsIn;
        }
        submitting.end();
    }

    useEffect(() => {
        if (estadoProducao) {
            // setDataParams(json(estadoProducao)["estado_producao_params"]);
            setDataEstadoProducao({
                timestamp: Date.now(), rows: json(estadoProducao)["estado_producao"], bobines: json(estadoProducao)["estado_producao_bobines"],
                bobines_nopalete: json(estadoProducao)["estado_producao_bobines_nopalete"],
                bobines_retrabalhadas: json(estadoProducao)["estadoproducao_bobines_retrabalhadas"],
                paletes: json(estadoProducao)["estado_producao_paletes"],
                current: json(json(estadoProducao)["estado_producao_current"]),
                status: json(estadoProducao)["estado_producao_status"][0],
                bobinagens: json(estadoProducao)["estado_producao_bobinagens"],
                params: json(estadoProducao)["estado_producao_params"],
                defeitos: json(estadoProducao)["estado_producao_defeitos"],
                nws_planeados: json(estadoProducao)["estado_producao_nws"],
                nws_queue: json(estadoProducao)["estado_producao_nw_queue"],
                granulado_inline: json(estadoProducao)["estado_producao_granulado_inline"]
            });
        } else {
            setDataParams({});
            setDataEstadoProducao({});
        }
    }, [hash_estadoproducao]);

    const isClosed = () => {
        if (dataEstadoProducao?.status?.status === 9 || !dataEstadoProducao?.status?.status) {
            return true;
        } else {
            return false;
        }
    }
    const isRunning = () => {
        if (dataEstadoProducao?.status?.status == 3 && dataEstadoProducao?.status?.isrunning == 1) {
            return true;
        } else if (dataEstadoProducao?.status?.status == 3 && dataEstadoProducao?.status?.isrunning == 0) {
            return null;
        } else {
            return false;
        }
        // if (props?.parameters?.status == 3) {
        //     return true;
        // } else {
        //     return false;
        // }
    }





    return (
        <Card
            hoverable
            headStyle={{ padding: "0px 10px", backgroundColor: isRunning() ? "#389e0d" : isRunning() === null ? "#d46b08" : "#cf1322" }}
            style={{ height: "100%", border: "1px solid #8c8c8c" }}
            bodyStyle={{ height: "calc(100% - 61px)", padding: "0px 5px 5px 0px" }}
            size="small"
            title={
                <WidgetSimpleTitle title="Produção" parameters={props?.parameters} onClose={props?.onClose} onPinItem={props?.onPinItem}>
                    {/* {props?.parameters?.ofs && <Space>
                        <Button disabled={!permission.isOk({ action: "inproduction", forInput: !isClosed() })} onClick={()=>onOpenFormulacao("formulacao_formulation_change")} icon={<EditOutlined />}>Alterar</Button>
                        <Button disabled={!permission.isOk({ action: "inproduction", forInput: !isClosed() })} onClick={()=>onOpenFormulacao("formulacao_dosers_change")} icon={<EditOutlined />}>Doseadores</Button>
                    </Space>} */}
                </WidgetSimpleTitle>
            }
        >
            <YScroll>
                {/* <Container fluid style={{padding:"0px"}}> */}
                {/* <Row nogutter>
                        <Col width={200} style={{ height: "100%", fontSize: "12px", fontFamily: "Microsoft YaHei", fontWeight: "bolder", color: "#464646",textAlign:"center" }}>Diff.</Col>
                    </Row> */}
                {/* <Row nogutter>
                        <Col> */}

                <EstadoProducao hash_estadoproducao={hash_estadoproducao} parameters={{ data: dataEstadoProducao, isRunning: isRunning(), isClosed: isClosed() }} />
                {/*                         </Col>
                    </Row> */}
                {/* <Row style={{ height: "10px" }}><Col></Col></Row> */}
                {/*                 </Container> */}
            </YScroll>
        </Card>
    );


};