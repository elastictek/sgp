import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
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
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS, bColors, BOBINE_DEFEITOS,BOBINE_ESTADOS } from "config";
import { useDataAPI, getLocalStorage } from "utils/useDataAPIV3";
import { getFilterRangeValues, getFilterValue, secondstoDay, getFloat } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, Typography, Modal, Select, Tag, Alert, Drawer, Image, TimePicker, InputNumber, DatePicker, Dropdown, Switch, Card, Progress, Collapse, Checkbox } from "antd";
const { Panel } = Collapse;
const { TextArea } = Input;
// import ToolbarTitle from './commons/ToolbarTitle';
const { Title } = Typography;
import { json } from "utils/object";
import { EditOutlined, CameraOutlined, DeleteTwoTone, ExpandAltOutlined, CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, CaretLeftOutlined, CaretRightOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import ReactECharts from 'components/ReactECharts';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import WidgetTitle, { WidgetSimpleTitle } from 'components/WidgetTitle';
import { InputNumberEditor, MateriasPrimasTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, Link } from 'components/TableColumns';
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

const title = "Produção";
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
    }
    .ant-collapse-content > .ant-collapse-content-box{
        padding:2px 2px!important;
    }

`;


const useStyles = createUseStyles({
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
        if (max == 1 && pos != 1) {
            return <Button style={{ maxHeight: "25px", padding: "0px 4px", width: "50px", maxWidth: "50px", display: "flex", alignItems: "center", justifyContent: "center" }} icon={<BsDatabase fontSize={18} />}>{bobines}</Button>;
        } else if (pos == max) {
            return <Button style={{ maxHeight: "25px", padding: "0px 4px", width: "50px", maxWidth: "50px", display: "flex", alignItems: "center", justifyContent: "center" }} icon={<BsDatabase fontSize={18} />}>{bobines}</Button>;
        } else if (pos == 1) {
            return <Button style={{ maxHeight: "25px", padding: "0px 4px", width: "50px", maxWidth: "50px", display: "flex", alignItems: "center", justifyContent: "center" }} icon={<BsDatabase fontSize={18} />}>{bobines}</Button>;
        }
    }

    return (
        <Space>{json(data?.lvl).map(v => {
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

const PaletesOf = ({ hash_estadoproducao, onPaletesExpand, mini = false, data, ...props }) => {
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
        ...(true) ? [{ name: 'area_real', header: 'Área.', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m">{getFloat(data?.area_real, 2)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'num_bobines', header: 'Total', group: "bobines", userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps}>{getFloat(data?.num_bobines, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'nbobines_real', header: 'Atual', group: "bobines", userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps}>{getFloat(data?.nbobines_real, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'nbobines_emendas', header: 'Emendas', group: "bobines", userSelect: true, defaultLocked: false, defaultWidth: 72, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps}>{getFloat(data?.nbobines_emendas, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'largura_bobines', header: () => (<div><div>Largura</div>{onPaletesExpand && <div><Button size="small" onClick={onPaletesExpand} ghost icon={<ExpandAltOutlined />} /></div>}</div>), userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="mm">{getFloat(data?.largura_bobines, 0)}</RightAlign> }] : [],
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
    const rowClassName = ({ data }) => { }

    return (<>
        <Table
            {...mini && { style: { fontSize: "10px", height: "250px" } }}
            {...mini && { rowHeight: 25 }}
            //rowHeight={null}
            headerHeight={25}
            cellNavigation={false}
            enableSelection={false}
            showActiveRowIndicator={false}
            loading={submitting.state}
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
            <Col width={100}>
                <Row nogutter style={{}}><Col style={{ fontSize: "12px", fontFamily: "Microsoft YaHei", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center" }}><CiRuler fontSize={"18px"} />Meters</Col></Row>
                <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.metros_bobine, 1)} m</Col></Row>
            </Col>
        </Row>
    </>);
}

const BobinesDefeitos = ({ data, onDefeitosClick }) => {
    return (<Container fluid style={{ padding: "0px", margin: "0px", fontSize: "10px" }}>
        <Row gutterWidth={2}>
            {BOBINE_DEFEITOS.map((item, index) => {
                return (
                    <React.Fragment key={`def-${data.defeitos.id}-${index}`}>
                        <Col xs={5} style={{ textAlign: "right", fontWeight: data.defeitos?.[item.value] > 0 ? 700 : 400 }}>{item.label}</Col>
                        <Col xs={1} style={{ fontWeight: data.defeitos?.[item.value] > 0 ? 700 : 400 }}>{data.defeitos?.[item.value] > 0 ? <div onClick={() => onDefeitosClick(data, item)} style={{color:"#0050b3"}}>{data.defeitos?.[item.value]}</div> : data.defeitos?.[item.value]}</Col>
                    </React.Fragment>
                );
            })}
        </Row>
    </Container>);
}

const EstadoProducao = ({ hash_estadoproducao, parameters, ...props }) => {
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
    const submitting = useSubmitting(true);
    const [ofs, setOfs] = useState([]);
    const [paletes, setPaletes] = useState([]);
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "paletesexpand": return <PaletesList parameters={{ ...modalParameters.parameters }} noid={true} />
                case "bobines": return <BobinesList parameters={{ ...modalParameters.parameters }} noid={true} />
                //case "paletesexpand": return <PaletesOf data={{ ...modalParameters.parameters }} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onPaletesExpand = () => {
        setModalParameters({ content: "paletesexpand", type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Paletes</div>, parameters: { filter: { fof: `in:${ofs.join(",")}` } } });
        //setModalParameters({ content: "paletesexpand", type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Paletes</div>, parameters: { paletes: parameters?.data?.paletes, timestamp: parameters?.data?.timestamp, filter: paletes } });
        showModal();
    }
    const onDefeitosClick = (data, item) => {
        setModalParameters({ content: "bobines", type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Bobines</div>, parameters: { filter: { fcomp:">=0",frecycle:"in:0,1", fof: `==${data?.of_cod}`, fdefeitos: [{ ...item, key: item.value }] } } });
        showModal();
    }
    const onEstadoClick = (data, estado) => {
        const item = BOBINE_ESTADOS.filter(v=>v.value===estado)[0];
        setModalParameters({ content: "bobines", type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Bobines</div>, parameters: { filter: { fcomp:">=0",frecycle:"in:0,1", fof: `==${data?.of_cod}`, festados: [{ ...item, key: item.value }] } } });
        showModal();
    }

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [hash_estadoproducao, parameters?.data?.timestamp, parameters?.isRunning]);

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
                acc[cur.gid].paletizacao = { ...parameters?.data?.paletizacao.find(v => v.of_cod == acc[cur.gid]?.of_cod) };
                acc[cur.gid].bobines = parameters?.data?.bobines?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
                acc[cur.gid].defeitos = parameters?.data?.defeitos?.filter(v => v.ofid == acc[cur.gid]?.of_cod)[0];
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
            console.log(_dj)
            setOfs([...new Set(_dj.map(obj => obj.of_cod))]);
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

    const onTogglePaletes = (v) => {
        const _p = [...paletes];
        const idx = _p.indexOf(v);
        if (idx === -1) {
            _p.push(v);
        } else {
            _p.splice(idx, 1);
        }
        console.log("oiiiiiiii")
        setPaletes(_p);
    }

    return (<>
        <Container fluid style={{ padding: "0px" }}>
            <Row gutterWidth={5}>
                {dataAPI.hasData() && ofs.map((v, i) => {
                    const items = dataAPI.getData().rows.filter(x => x.of_cod == v);
                    return (
                        <Col key={`off-${i}`} /* style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 2px 4px 0px, rgba(0, 0, 0, 0.19) 0px 2px 4px 0px" }} */ xs="content">
                            <Row nogutter>
                                <Col width={350} style={{}}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#002766", color: "#fff", padding: "5px" }}><ArtigoColumn data={items[0]} /><Checkbox onChange={() => onTogglePaletes(v)} /></div>
                                    <div style={{ border: "solid 1px #595959" }}>
                                        <StyledCollapse expandIconPosition="end" bordered={false} activeKey={["1", "2"]} style={{ padding: "5px" }}>
                                            <Panel header={<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%" }}><div><b>Paletes</b></div></div>} key="1">
                                                <Container fluid style={{ padding: "0px" }}>
                                                    <Row gutterWidth={2} style={{ backgroundColor: "#fafafa", textAlign: "center" }}>
                                                        <Col width={50}></Col>
                                                        <Col width={50}>Linha</Col>
                                                        <Col width={50}>Stock</Col>
                                                        <Col width={50}>Total</Col>
                                                        <Col><Progress percent={items[0]?.num_paletes_of_percentage} showInfo={true} trailColor="#dbdbdb" /></Col>
                                                    </Row>
                                                    {items.map((x, idx) => {
                                                        return (
                                                            <Row key={`itm-${v}-${idx}`} gutterWidth={2} style={{ textAlign: "center", alignItems: "center" }}>
                                                                <Col width={50}>{/* <PaletePositionColumn data={x} /> */}</Col>
                                                                <Col width={50}>{lpadFloat(x?.total_current?.num_paletes_line)}</Col>
                                                                <Col width={50}>{lpadFloat(x?.total_current?.num_paletes_stock)}</Col>
                                                                <Col width={50}><b>{lpadFloat(x?.total_current?.num_paletes)}</b>/{lpadFloat(x?.num_paletes)}</Col>
                                                                <Col></Col>
                                                            </Row>
                                                        );
                                                    })}
                                                    <Row gutterWidth={2} style={{ textAlign: "center", alignItems: "center", margin: "10px 0" }}>
                                                        <Col><MiniBarBobines onEstadoClick={onEstadoClick} data={items[0]} style={{ width: "100%", height: "25px" }} /></Col>
                                                    </Row>
                                                </Container>
                                            </Panel>
                                            <Panel header={<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%" }}><div><b>Defeitos</b></div></div>} key="2">
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
                                </Col>
                            </Row>
                        </Col>
                    )
                })
                }
                <Col width={520} style={{ border: "solid 1px #595959", padding: "5px" }}>
                    {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#002766", color: "#fff", padding: "5px" }}>xxxxx</div> */}
                    <div style={{}}><LineParameters data={parameters?.data?.params} /></div>
                </Col>
            </Row>
            <Row gutterWidth={5} style={{ marginTop: "5px" }}>
                {paletes.length > 0 && <Col width={710}><PaletesOf data={{ paletes: parameters?.data?.paletes, timestamp: parameters?.data?.timestamp, filter: paletes }} onPaletesExpand={onPaletesExpand} mini={true} /></Col>}
            </Row>
        </Container>
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
        return (<div onClick={() => onEstadoClick(data,v.estado)} key={`cbe-${i}-${v.ofid}`} style={{ width: `${widths[i]}%`, background: bColors(v.estado).color, color: bColors(v.estado).fontColor }}><div style={{ fontWeight: 700 }}>{v.estado}</div><div>{v.total_por_estado_of}</div></div>);
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
    const classes = useStyles();
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
            console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", json(estadoProducao)["estado_producao_status"])
            // setDataParams(json(estadoProducao)["estado_producao_params"]);
            setDataEstadoProducao({
                timestamp: Date.now(), rows: json(estadoProducao)["estado_producao"], bobines: json(estadoProducao)["estado_producao_bobines"],
                paletes: json(estadoProducao)["estado_producao_paletes"], paletizacao: json(json(estadoProducao)["estado_producao_paletizacao"]),
                status: json(estadoProducao)["estado_producao_status"][0],
                params: json(estadoProducao)["estado_producao_params"],
                defeitos: json(estadoProducao)["estado_producao_defeitos"]
            });

        } else {
            setDataParams({});
            setDataEstadoProducao({});
        }
    }, [hash_estadoproducao]);

    // const isClosed = () => {
    //     if (props?.parameters?.status === 9 || !props?.parameters?.status) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
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
            bodyStyle={{ height: "calc(100% - 61px)" }}
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
                <Container fluid>
                    {/* <Row nogutter>
                        <Col width={200} style={{ height: "100%", fontSize: "12px", fontFamily: "Microsoft YaHei", fontWeight: "bolder", color: "#464646",textAlign:"center" }}>Diff.</Col>
                    </Row> */}
                    <Row nogutter>
                        <Col>
                            <EstadoProducao hash_estadoproducao={hash_estadoproducao} parameters={{ data: dataEstadoProducao, isRunning: isRunning() }} />
                        </Col>
                    </Row>
                    <Row style={{ height: "10px" }}><Col></Col></Row>
                </Container>
            </YScroll>
        </Card>
    );


};