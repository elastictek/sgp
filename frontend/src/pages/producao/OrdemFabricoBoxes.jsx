import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
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
    RightOutlined, LeftOutlined, UnorderedListOutlined, MoreOutlined
} from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import ReactECharts from 'components/ReactECharts';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle from 'components/ToolbarTitleV3';
import WidgetTitle, { WidgetSimpleTitle } from 'components/WidgetTitle';
import { InputNumberEditor, MateriasPrimasTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, Link, DateTime, QueueNwColumn, PosColumn, ArtigoColumn, NwColumn, EventColumn, StatusProduction, OFabricoStatus } from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "../App";
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
import BobinesGroup from '../bobines/BobinesGroup';
import BobinagensList from '../bobinagens/BobinagensList';
const FormBobinagemValidar = React.lazy(() => import('../bobinagens/FormValidar'));

const Bobinagem = React.lazy(() => import('../bobinagens/Bobinagem'));
const FormCortes = React.lazy(() => import('../currentline/FormCortes'));
const LineLogList = React.lazy(() => import('../logslist/LineLogList'));
const FormFormulacao = React.lazy(() => import('../formulacao/FormFormulacao'));
const GranuladoPick = React.lazy(() => import('../picking/GranuladoPick'));
const PaletesStockList = React.lazy(() => import('../paletes/PaletesStockList'));
const FormAttachements = React.lazy(() => import('../ordensfabrico/FormAttachements'));
const FormPaletizacao = React.lazy(() => import('../ordensfabrico/FormPaletizacao'));

const defeitosToSum = ['con', 'descen', 'presa', 'diam_insuf', 'esp', 'troca_nw', 'outros', 'nok', 'car', 'fmp', 'lac', 'ncore', 'sbrt', 'suj', 'tr', 'buraco', 'fc', 'ff', 'furos', 'rugas', 'prop'];


const StyledCollapse = styled(Collapse)`

    .ant-collapse-header{
        background-color:#f5f5f5;
        border-radius: 2px!important;
        padding:1px 1px!important;
        margin-top:3px;
    }
    .ant-collapse-content > .ant-collapse-content-box{
        padding:2px 2px!important;
    }

`;


const useStyles = createUseStyles({

    widgetTitle: {
        color: 'black',
        '&:hover': {
            color: '#fff',
        },
    },

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

const PaletePositionColumn = ({ data, cellProps }) => {

    const btn = (pos, max, bobines) => {
        if ((pos != 1 && pos != max) || max == 1) {
            return <Button style={{ maxHeight: "23px", padding: "0px 4px", width: "40px", maxWidth: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>{bobines}</Button>;
        } else if (pos == max) {
            return <Button style={{ maxHeight: "23px", padding: "0px 4px", width: "40px", maxWidth: "40px", display: "flex", alignItems: "center", justifyContent: "center" }} icon={<CaretUpOutlined />} >{bobines}</Button>;
        } else if (pos == 1) {
            return <Button style={{ maxHeight: "23px", padding: "0px 4px", width: "40px", maxWidth: "40px", display: "flex", alignItems: "center", justifyContent: "center" }} icon={<CaretDownOutlined />}>{bobines}</Button>;
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



const ArtigoTitle = ({ data, cellProps }) => {
    return (
        <div>
            <div style={{ display: "flex", fontSize: "11px" }}>
                <div style={{ marginRight: "10px", fontWeight: 700 }}>{data?.of_cod}</div>
                <div style={{}}>{data?.artigo_cod}</div>
            </div>
            <div style={{ display: "flex", fontSize: "10px" }}>
                <div>{data?.artigo_des?.replace(new RegExp(`Nonwoven Elastic Bands |Nonwoven Elastic Band |NW Elastic Bands `, "gi"), "")}</div>
            </div>
            <div style={{ display: "flex", fontSize: "10px" }}>
                <div>{data?.cliente_nome}</div>
            </div>
        </div>
    );
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
        return (<div onClick={() => onEstadoClick(data, v.estado, true)} key={`cbe-${i}-${v.ofid}`} style={{ width: `${widths[i]}%`, background: bColors(v.estado).color, color: bColors(v.estado).fontColor, opacity: 0.6 }}><div style={{ fontWeight: 700 }}>{v.estado}</div><div>{v.total_por_estado_of}</div></div>);
    })}</div>}</>);
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
            {BOBINE_DEFEITOS.filter(v => v.value !== "troca_nw").map((item, index) => {
                return (
                    <React.Fragment key={`def-${summedData?.id}-${index}`}>
                        {summedData?.[item.value] > 0 && <><Col xs={5} style={{ textAlign: "right", fontWeight: summedData?.[item.value] > 0 ? 700 : 400 }}>{item.label}</Col>
                            <Col xs={1} style={{ fontWeight: summedData?.[item.value] > 0 ? 700 : 400, fontSize: "10px" }}>{summedData?.[item.value] > 0 ? <div onClick={() => onDefeitosClick({ of_cod: summedData?.of_cod }, item)} style={{ color: "#0050b3" }}>{summedData?.[item.value]}</div> : summedData?.[item.value]}</Col>
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
            <div style={{ background: "#f0f0f0", padding: "3px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
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
            <div style={{ border: "solid 1px #000", fontSize: "10px", marginTop: "3px" }}>
                <div style={{ display: "flex", padding: "2px", justifyContent: "space-between", background: "#f0f0f0" }}><div style={{ fontWeight: 700 }}>Total produzido para a encomenda</div><div>{getFloat(data?.qty_encomenda, 1).toLocaleString('pt-PT')}m&#178;</div></div>
                <div style={{ display: "flex", flexDirection: "row", textAlign: "right", fontSize: "10px", padding: "2px" }}>
                    <div style={{ flex: 1, fontWeight: 700 }}>{getFloat(data?.paletes_m2_produzidas, 1).toLocaleString('pt-PT')}m&#178;</div>
                    <div style={{ flex: 1, fontWeight: 700 }}>{((getFloat(data?.paletes_m2_produzidas, 1) / getFloat(data?.qty_encomenda, 1)) * 100).toFixed(2)}%</div>
                </div>
            </div>
            <div style={{ border: "solid 1px #000", fontSize: "10px", marginTop: "3px" }}>
                <div style={{ display: "flex", padding: "2px", justifyContent: "space-between", background: "#f0f0f0" }}><div style={{ fontWeight: 700 }}>Total</div></div>
                <div style={{ display: "flex", flexDirection: "row", textAlign: "right", fontSize: "10px", padding: "2px" }}>
                    <div style={{ flex: 1 }}>Produzido</div>
                    <div style={{ flex: 1, fontWeight: 700 }}>{getFloat(data?.paletes_m2_produzidas_total, 1).toLocaleString('pt-PT')}m&#178;</div>
                    <div style={{ flex: 1, fontWeight: 700 }}>{((getFloat(data?.paletes_m2_produzidas_total, 1) / getFloat(data?.qty_encomenda, 1)) * 100).toFixed(2)}%</div>
                </div>
                <div style={{ display: "flex", flexDirection: "row", textAlign: "right", fontSize: "10px", padding: "2px" }}>
                    <div style={{ flex: 1 }}>Produzido+Stock</div>
                    <div style={{ flex: 1, fontWeight: 700 }}>{getFloat(data?.paletes_m2_total, 1).toLocaleString('pt-PT')}m&#178;</div>
                    <div style={{ flex: 1, fontWeight: 700 }}>{((getFloat(data?.paletes_m2_total, 1) / getFloat(data?.qty_encomenda, 1)) * 100).toFixed(2)}%</div>
                </div>
            </div>
        </>
    );
}

export default ({ dataAPI, onTogglePaletes, paletes, /* activeKeys=[], onActiveKeyChange */ boxWidth = 3, height, ...props }) => {
    const media = useContext(MediaContext);
    const permission = usePermission({ /* name: "widget", item: "estadoProducao" */ });//Permissões Iniciais
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
    //const dataAPI = useDataAPI({ id: props.id, payload: { url: ``, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });
    const submitting = useSubmitting(true);
    const [activeKeys, setActiveKeys] = useState(["1", "2", "3"]);
    const [ofs, setOfs] = useState([]);
    const [modalParameters, setModalParameters] = useState({});
    const [lastBobinesTab, setLastBobinesTab] = useState('1');
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "paletesexpand": return <PaletesList parameters={{ ...modalParameters.parameters }} noid={true} />
                case "bobines": return <BobinesGroup tab={modalParameters.tab} setTab={modalParameters.setLastTab} parameters={{ ...modalParameters.parameters }} noid={true} />
                case "bobinagensexpand": return <BobinagensList parameters={{ ...modalParameters.parameters }} noid={true} />
                case "formulacao": return <FormFormulacao parameters={modalParameters.parameters} />
                case "attachments": return <FormAttachements parameters={modalParameters.parameters} />
                case "paletizacao": return <FormPaletizacao parameters={modalParameters.parameters} />
                case "granuladopick": return <GranuladoPick parameters={modalParameters.parameters} />
                case "paletesstock": return <PaletesStockList parameters={modalParameters.parameters} />
                case "linelogexpand": return <LineLogList parameters={modalParameters.parameters} />
                //case "paletesexpand": return <ListPaletesOf data={{ ...modalParameters.parameters }} />;
            }
        }

        return (
            <ResponsiveModal lazy={modalParameters?.lazy} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    const onDefeitosClick = (data, item) => {
        setModalParameters({ content: "bobines", type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Bobines</div>, parameters: { filter: { fcomp: ">=0", frecycle: "in:0,1", fof: `==${data?.of_cod}`, fdefeitos: [{ ...item, key: item.value }] } } });
        showModal();
    }
    const onEstadoClick = (data, estado, noPalete = null) => {
        const item = BOBINE_ESTADOS.filter(v => v.value === estado)[0];
        setModalParameters({ content: "bobines", type: "drawer", push: false, width: "90%", tab: lastBobinesTab, setLastTab: setLastBobinesTab, title: <div style={{ fontWeight: 900 }}>Bobines</div>, parameters: { filter: { ...noPalete && { palete_id: "isnull" }, fcomp: ">=0", frecycle: "in:0,1", fof: `==${data?.of_cod}`, festados: [{ ...item, key: item.value }] } } });
        showModal();
    }

    const onPaletesStockClick = (data) => {
        setModalParameters({ content: "paletesstock", type: "drawer", push: false, width: "90%", lazy: true, title: <div style={{ fontWeight: 900 }}>Paletes de Stock {data?.of_cod}</div>, parameters: { ativa: data?.ativa, id: data.id, cliente_cod: data?.cliente_cod, artigo_cod: data?.artigo_cod, filter: { fordem_id: `==${data?.id}` } } });
        showModal();
    }

    const onAttachmentsClick = (data) => {
        console.log("$$$$", data)
        setModalParameters({ content: "attachments", type: "drawer", push: false, width: "90%", lazy: true, title: <div style={{ fontWeight: 900 }}>Anexos {data?.of_cod}</div>, parameters: { draft_id: data.of.draft_of_id } });
        showModal();
    }

    const onPaletizacaoClick = (data) => {
        setModalParameters({ content: "paletizacao", type: "drawer", push: false, width: "90%", lazy: true, title: <div style={{ fontWeight: 900 }}>Esquema de Paletização {data?.of_cod}</div>, parameters: { temp_ofabrico: data.of.draft_of_id } });
        showModal();
    }

    useEffect(() => {
        if (dataAPI.hasData()) {
            const n1 = dataAPI.getData().rows.filter(v=>v.total_current.num_paletes<v.total_planned.num_paletes);
            n1.sort((a,b)=>{
                if (a.total_current.num_paletes > 0 && b.total_current.num_paletes > 0) {
                    return b.total_current.num_paletes - a.total_current.num_paletes;
                } else if (a.total_current.num_paletes > 0) {
                    return -1; // a should come before b
                } else if (b.total_current.num_paletes > 0) {
                    return 1; // b should come before a
                }
            });
            const n2 = dataAPI.getData().rows.filter(v=>v.total_current.num_paletes>=v.total_planned.num_paletes);
            n2.sort((a,b)=>{
                if (a.total_current.num_paletes >= a.total_planned.num_paletes && b.total_current.num_paletes >= b.total_planned.num_paletes) {
                    return 0; // No change in order
                } else if (a.total_current.num_paletes >= a.total_planned.num_paletes) {
                    return 1; // a should come after b
                } else if (b.total_current.num_paletes >= b.total_planned.num_paletes) {
                    return -1; // b should come after a
                }
            });
            setOfs([...new Set([...n1.map(v=>v.of_cod),...n2.map(v=>v.of_cod)])]);
        } else {
            setOfs([]);
        }
    }, [dataAPI.getTimeStamp()]);

    const onActiveKeyChange = (v) => {
        setActiveKeys([...new Set(["1", "2", "3", ...v])]);
    }


    return (

        <Row nogutter style={{}}>
            {dataAPI.hasData() && ofs.map((v, i) => {
                const items = dataAPI.getData().rows.filter(x => x.of_cod == v);
                return (
                    <Col key={`off-${i}`} sm={12} md={boxWidth}>
                        <Row nogutter style={{ border: "solid 1px #595959", margin: "3px 3px 0 3px" }}>


                            <Col style={{}}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#002766", color: "#fff", padding: "5px" }}><ArtigoTitle data={items[0]} /><Checkbox checked={paletes.includes(v)} onChange={() => onTogglePaletes && onTogglePaletes(v)} /></div>
                                {/**TOOLBOX */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0f0f0", color: "#000", padding: "2px 5px 2px 5px" }}>
                                    <div>
                                        <Space>
                                            {/* <Button type="primary" icon={<MoreOutlined/>} size="small" onClick={() => onPaletesStockClick(items[0])} title="Paletes de stock">Mais</Button> */}
                                        </Space>
                                    </div>
                                    <div>
                                        <Space>
                                            <Button type="primary" size="small" onClick={() => onAttachmentsClick(items[0])} ghost icon={<PaperClipOutlined />} title="Anexos" />
                                            <Button type="primary" size="small" onClick={() => onPaletizacaoClick(items[0])} ghost title="Paletização">Paletização</Button>
                                            <Button type="primary" size="small" onClick={() => onPaletesStockClick(items[0])} ghost title="Paletes de stock">Stock</Button>
                                        </Space>
                                    </div>
                                </div>
                                <div style={{ height: height ? height : (ofs.length <= 2 ? "400px" : "300px") }}>
                                    <YScroll>
                                        <div style={{}}>

                                            <Container fluid style={{ padding: "0px" }}>
                                                <Row nogutter style={{ backgroundColor: "#fafafa", textAlign: "center", display: "flex", alignItems: "center", marginTop: "3px" }}>
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
                                            <StyledCollapse expandIconPosition="end" bordered={false} activeKey={activeKeys} style={{ padding: "3px" }} onChange={onActiveKeyChange && onActiveKeyChange}>
                                                <Panel showArrow={false} header={<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "80%" }}><div><b>Bobines</b></div></div>} key="1">
                                                    <Container fluid style={{ padding: "0px" }}>

                                                        <Row gutterWidth={2} style={{ textAlign: "center", alignItems: "center", margin: "10px 0" }}>
                                                            <Col><MiniBarBobines onEstadoClick={onEstadoClick} data={items[0]} style={{ width: "100%", height: "23px" }} /></Col>
                                                        </Row>
                                                    </Container>
                                                </Panel>
                                                {items[0]?.bobines_nopalete.length > 0 && <Panel showArrow={false} header={<div style={{ display: "flex", flexDirection: "row", fontWeight: 700/* , justifyContent: "right" */, width: "100%"/* , fontStyle: "italic" */ }}><div>Bobines sem palete atribuída</div></div>} key="2">
                                                    <Container fluid style={{ padding: "0px" }}>
                                                        <Row gutterWidth={2} style={{ textAlign: "center", alignItems: "center", margin: "10px 0" }}>
                                                            <Col><MiniBarBobinesNoPalete onEstadoClick={onEstadoClick} data={items[0]} style={{ width: "100%", height: "23px" }} /></Col>
                                                        </Row>
                                                    </Container>
                                                </Panel>}
                                                <Panel showArrow={true} header={<div style={{ width: "100%", fontSize: "10px" }}>
                                                    <div style={{ fontWeight: 700, fontSize: "12px" }}>Resumo de Produção</div>
                                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                                        <div style={{ width: "43px", fontWeight: 700 }}>Bobines:</div>
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
                                                            <Col><BobinesDefeitos onDefeitosClick={onDefeitosClick} data={items[0]} style={{ width: "100%", height: "23px" }} /></Col>
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


    );
}