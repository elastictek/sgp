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
import { API_URL, ROOT_URL, DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, DATE_FORMAT_NO_SEPARATOR, FORMULACAO_PONDERACAO_EXTRUSORAS, bColors, BOBINE_DEFEITOS, BOBINE_ESTADOS, DASHBOARD_URL, SOCKET, HISTORY_DEFAULT, HISTORY_DEFAULT_FOOTER } from "config";
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
    RightOutlined, LeftOutlined, UnorderedListOutlined, PrinterOutlined, ControlOutlined
} from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
//import Table from 'components/TableV2';
import ReactECharts from 'components/ReactECharts';
import Table, { useTableStyles } from 'components/TableV3';
import ToolbarTitle, { SimpleDropdownHistory } from 'components/ToolbarTitleV3';
import WidgetTitle, { WidgetSimpleTitle } from 'components/WidgetTitle';
import { InputNumberEditor, MateriasPrimasTableEditor } from 'components/TableEditorsV3';
import { Clientes, Produtos, Artigos, FormulacaoGroups, FormulacaoSubGroups } from 'components/EditorsV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, Link, DateTime, QueueNwColumn, PosColumn, ArtigoColumn, NwColumn, EventColumn, StatusProduction, OFabricoStatus } from 'components/TableColumns';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SelectMultiField, AutoCompleteField, SwitchField, Chooser, FormPrint, printersList } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { MediaContext, AppContext } from "app";
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
import OrdemFabricoBoxes from './OrdemFabricoBoxes';
const FormBobinagemValidar = React.lazy(() => import('../bobinagens/FormValidar'));
const FormOrdemFabricoValidar = React.lazy(() => import('../ordensfabrico/FormValidar'));
const OrdemFabrico = React.lazy(() => import('../ordensfabrico/OrdemFabrico'));
import { downloadFile } from 'components/DownloadReports';
import { uniqueKeys } from 'utils/index';
import Logo from 'assets/logowhite.svg';
import LogoWhite from 'assets/logowhite.svg';
import MainMenu from '../currentline/dashboard/MainMenu';
import { useImmer } from 'use-immer';
import useWebSocket from 'react-use-websocket';

import ListPaletesOf from './items/ListPaletesOf';
import ListNwsQueue from './items/ListNwsQueue';
import ListGranuladoInline from './items/ListGranuladoInline';
import ListBobinagens from './items/ListBobinagens';
import LineParameters from './items/LineParameters';
import ListReciclado from './items/ListReciclado';
import { newWindow } from 'utils/loadInitV3';

const FormCortesOrdem = React.lazy(() => import('../ordensfabrico/FormCortesOrdem'));
const LineLogList = React.lazy(() => import('../logslist/LineLogList'));
const FormFormulacao = React.lazy(() => import('../formulacao/FormFormulacao'));
const GranuladoPick = React.lazy(() => import('../picking/GranuladoPick'));
const PaletesStockList = React.lazy(() => import('../paletes/PaletesStockList'));


const PickNWList = lazy(() => import('../picking/PickNWList'));

const title = "Produção";
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

    link: {
        color: '#fff',
        '&:hover': {
            color: '#003eb3',
        },
    },

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


const OfArtigoColumn = ({ data, cellProps }) => {
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
                    <div style={{ flex: 1, fontWeight: 700 }}>{getFloat(data?.qty_encomenda, 1)} {((getFloat(data?.paletes_m2_produzidas, 1) / getFloat(data?.qty_encomenda, 1)) * 100).toFixed(2)}%</div>
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





export const estadoProducaoData = ({ data }) => {
    let _acc = [];
    for (let cur of data?.rows) {
        let idx = _acc.findIndex(v => v.gid == cur.gid);
        if (idx == -1) {
            _acc.push({ ...cur, stock: cur.current_stock == 1 ? cur : {} });
            idx = _acc.length - 1;
        } else {
            if (cur.current_stock == 1) {
                _acc[idx].stock = cur;
            }
        }
        //totals
        _acc[idx].timestamp = data?.timestamp;
        _acc[idx].agg_cod = data?.current?.agg_cod;
        _acc[idx].cortes = json(data?.current?.cortes);
        _acc[idx].cortesordem = json(data?.current?.cortesordem);
        _acc[idx].current = json(data?.current);
        _acc[idx].nonwovens = json(data?.current?.nonwovens);
        _acc[idx].paletizacao = { ...json(data?.current?.paletizacao).find(v => v.of_cod == _acc[idx]?.of_cod) };
        _acc[idx].emendas = { ...json(data?.current?.emendas).find(v => v.of_cod == _acc[idx]?.of_cod) };
        _acc[idx].of = { ...json(data?.current?.ofs).find(v => v.of_cod == _acc[idx]?.of_cod) };
        _acc[idx].bobines = data?.bobines?.filter(v => v.ofid == _acc[idx]?.of_cod);
        _acc[idx].bobines_nopalete = data?.bobines_nopalete?.filter(v => v.ofid == _acc[idx]?.of_cod);
        _acc[idx].bobines_retrabalhadas = data?.bobines_retrabalhadas?.filter(v => v.ofid == _acc[idx]?.of_cod);
        _acc[idx].paletes_m2_produzidas = data?.paletes.find(v => v.ofid == _acc[idx]?.of_cod)?.num_m2_produzidos; //Calcula até ao nº de paletes planeados
        _acc[idx].paletes_m2_produzidas_total = data?.paletes.find(v => v.ofid == _acc[idx]?.of_cod)?.num_m2_produzidos_total; //Calcula todas as paletes produzidas, mesmo passando o planeado
        _acc[idx].paletes_m2_total = data?.paletes.find(v => v.ofid == _acc[idx]?.of_cod)?.num_m2_total; //Calcula todas as paletes produzidas+stock, mesmo passando o planeado
        _acc[idx].qty_encomenda = data?.paletes.find(v => v.ofid == _acc[idx]?.of_cod)?.qty_encomenda;
        _acc[idx].defeitos = data?.defeitos?.filter(v => v.ofid == _acc[idx]?.of_cod);
        _acc[idx].num_paletes_of_percentage = getFloat((100 * getFloat(_acc[idx].current_num_paletes_of)) / getFloat(_acc[idx].num_paletes_of), 0);
        _acc[idx].total_planned = {
            num_paletes: getFloat(_acc[idx].num_paletes) * json(_acc[idx].lvl).length,
            num_bobines: getFloat(_acc[idx].num_bobines) * json(_acc[idx].lvl).length
        };

        if (cur.current_stock == 1) {
            _acc[idx].total_current = {
                num_paletes_line: _acc[idx].total_current?.["num_paletes_line"] ? _acc[idx].total_current["num_paletes_line"] : 0,
                num_bobines_line: _acc[idx].total_current?.["num_bobines_line"] ? _acc[idx].total_current["num_bobines_line"] : 0,
                ..._acc[idx].total_current,
                num_paletes_stock: getFloat(_acc[idx]?.stock?.current_num_paletes),
                num_bobines_stock: getFloat(_acc[idx]?.stock?.current_num_bobines)
            }
        } else {
            _acc[idx].total_current = {
                num_paletes_stock: _acc[idx].total_current?.["num_paletes_stock"] ? _acc[idx].total_current["num_paletes_stock"] : 0,
                num_bobines_stock: _acc[idx].total_current?.["num_bobines_stock"] ? _acc[idx].total_current["num_bobines_stock"] : 0,
                ..._acc[idx].total_current,
                num_paletes_line: getFloat(_acc[idx]?.current_num_paletes),
                num_bobines_line: getFloat(_acc[idx]?.current_num_bobines)
            }
        }
        _acc[idx].total_current["num_paletes"] = _acc[idx].total_current["num_paletes_line"] + _acc[idx].total_current["num_paletes_stock"];
        _acc[idx].total_current["num_paletes_percentage"] = getFloat((100 * _acc[idx].total_current.num_paletes) / (_acc[idx].total_planned.num_paletes), 0);
        _acc[idx].total_current["num_bobines"] = _acc[idx].total_current["num_bobines_line"] + _acc[idx].total_current["num_bobines_stock"];
        _acc[idx].total_current["num_bobines_percentage"] = getFloat((100 * _acc[idx].total_current.num_bobines) / (_acc[idx].total_planned.num_bobines), 0);




    }


    // const _dj = Object.values(data?.rows.reduce((acc, cur) => {
    //     if (!acc[cur.gid]) {
    //         acc[cur.gid] = { ...cur, stock: cur.current_stock == 1 ? cur : {} };
    //     } else {
    //         if (cur.current_stock == 1) {
    //             acc[cur.gid].stock = cur;
    //         } else {
    //             //acc[cur.gid].a += cur.a;
    //         }
    //     }

    //     //totals
    //     acc[cur.gid].timestamp = data?.timestamp;
    //     acc[cur.gid].agg_cod = data?.current?.agg_cod;
    //     acc[cur.gid].cortes = json(data?.current?.cortes);
    //     acc[cur.gid].cortesordem = json(data?.current?.cortesordem);
    //     acc[cur.gid].current = json(data?.current);
    //     acc[cur.gid].nonwovens = json(data?.current?.nonwovens);
    //     acc[cur.gid].paletizacao = { ...json(data?.current?.paletizacao).find(v => v.of_cod == acc[cur.gid]?.of_cod) };
    //     acc[cur.gid].emendas = { ...json(data?.current?.emendas).find(v => v.of_cod == acc[cur.gid]?.of_cod) };
    //     acc[cur.gid].of = { ...json(data?.current?.ofs).find(v => v.of_cod == acc[cur.gid]?.of_cod) };
    //     acc[cur.gid].bobines = data?.bobines?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
    //     acc[cur.gid].bobines_nopalete = data?.bobines_nopalete?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
    //     acc[cur.gid].bobines_retrabalhadas = data?.bobines_retrabalhadas?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
    //     acc[cur.gid].paletes_m2_produzidas = data?.paletes.find(v => v.ofid == acc[cur.gid]?.of_cod)?.num_m2_produzidos; //Calcula até ao nº de paletes planeados
    //     acc[cur.gid].paletes_m2_produzidas_total = data?.paletes.find(v => v.ofid == acc[cur.gid]?.of_cod)?.num_m2_produzidos_total; //Calcula todas as paletes produzidas, mesmo passando o planeado
    //     acc[cur.gid].paletes_m2_total = data?.paletes.find(v => v.ofid == acc[cur.gid]?.of_cod)?.num_m2_total; //Calcula todas as paletes produzidas+stock, mesmo passando o planeado
    //     acc[cur.gid].qty_encomenda = data?.paletes.find(v => v.ofid == acc[cur.gid]?.of_cod)?.qty_encomenda;
    //     acc[cur.gid].defeitos = data?.defeitos?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
    //     acc[cur.gid].num_paletes_of_percentage = getFloat((100 * getFloat(acc[cur.gid].current_num_paletes_of)) / getFloat(acc[cur.gid].num_paletes_of), 0);
    //     acc[cur.gid].total_planned = {
    //         num_paletes: getFloat(acc[cur.gid].num_paletes) * json(acc[cur.gid].lvl).length,
    //         num_bobines: getFloat(acc[cur.gid].num_bobines) * json(acc[cur.gid].lvl).length
    //     };

    //     if (cur.current_stock == 1) {
    //         acc[cur.gid].total_current = {
    //             num_paletes_line: acc[cur.gid].total_current?.["num_paletes_line"] ? acc[cur.gid].total_current["num_paletes_line"] : 0,
    //             num_bobines_line: acc[cur.gid].total_current?.["num_bobines_line"] ? acc[cur.gid].total_current["num_bobines_line"] : 0,
    //             ...acc[cur.gid].total_current,
    //             num_paletes_stock: getFloat(acc[cur.gid]?.stock?.current_num_paletes),
    //             num_bobines_stock: getFloat(acc[cur.gid]?.stock?.current_num_bobines)
    //         }
    //     } else {
    //         acc[cur.gid].total_current = {
    //             num_paletes_stock: acc[cur.gid].total_current?.["num_paletes_stock"] ? acc[cur.gid].total_current["num_paletes_stock"] : 0,
    //             num_bobines_stock: acc[cur.gid].total_current?.["num_bobines_stock"] ? acc[cur.gid].total_current["num_bobines_stock"] : 0,
    //             ...acc[cur.gid].total_current,
    //             num_paletes_line: getFloat(acc[cur.gid]?.current_num_paletes),
    //             num_bobines_line: getFloat(acc[cur.gid]?.current_num_bobines)
    //         }
    //     }
    //     acc[cur.gid].total_current["num_paletes"] = acc[cur.gid].total_current["num_paletes_line"] + acc[cur.gid].total_current["num_paletes_stock"];
    //     acc[cur.gid].total_current["num_paletes_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_paletes) / (acc[cur.gid].total_planned.num_paletes), 0);
    //     acc[cur.gid].total_current["num_bobines"] = acc[cur.gid].total_current["num_bobines_line"] + acc[cur.gid].total_current["num_bobines_stock"];
    //     acc[cur.gid].total_current["num_bobines_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_bobines) / (acc[cur.gid].total_planned.num_bobines), 0);

    //     return acc;
    // }, {}));
    const _ofs = uniqueKeys(_acc, "of_cod"); //[...new Set(_dj.map(obj => obj.of_cod))];
    return { ofs: _ofs, rows: _acc, total: _acc.length };
}

const EstadoProducao = ({ hash, parameters, ...props }) => {
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
    const [lastBobinesTab, setLastBobinesTab] = useState('1');
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "paletesexpand": return <PaletesList parameters={{ ...modalParameters.parameters }} noid={true} />
                case "bobines": return <BobinesGroup tab={modalParameters.tab} setTab={modalParameters.setLastTab} parameters={{ ...modalParameters.parameters }} noid={true} />
                case "bobinagensexpand": return <BobinagensList parameters={{ ...modalParameters.parameters }} noid={true} />
                case "formulacao": return <FormFormulacao parameters={modalParameters.parameters} />
                case "granuladopick": return <GranuladoPick parameters={modalParameters.parameters} />
                case "paletesstock": return <PaletesStockList parameters={modalParameters.parameters} />
                case "linelogexpand": return <LineLogList parameters={modalParameters.parameters} />
                case "nwspick": return <PickNWList {...modalParameters.parameters} />;
                case "nwsprint": return <FormPrint {...modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal lazy={modalParameters?.lazy} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    const onDownloadComplete = async (response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, '_blank');
        //downloadFile(response.data,"etiqueta_nw.pdf");
    }

    // const onNwsPrint = useCallback(() => {
    //     let _nws = [];
    //     if (selectedNws === true && parameters?.data?.nws_queue && parameters.data.nws_queue.length > 0) {
    //         _nws = parameters?.data?.nws_queue.map(v => v.id);
    //     } else {
    //         _nws = Object.keys(selectedNws);
    //     }
    //     if (_nws.length > 0) {
    //         setModalParameters({
    //             width: "500px",
    //             height: "200px",
    //             content: "nwsprint", type: "modal", push: false/* , width: "90%" */, title: <div style={{ fontWeight: 900 }}>Imprimir Etiquetas de Nonwovens</div>,
    //             parameters: {
    //                 url: `${API_URL}/print/sql/`, printers: printersList?.CABS,
    //                 onComplete: onDownloadComplete,
    //                 parameters: {
    //                     method: "PrintNwsEtiquetas",
    //                     ids: _nws.join(','),
    //                     name: "ETIQUETAS-NWS-AMOSTRA",
    //                     path: "ETIQUETAS/NWS-AMOSTRA"
    //                 }
    //             }
    //         });
    //         showModal();
    //     }
    // }, [selectedNws]);


    const onNwsPrint = (selectedNws) => {
        let _nws = [];
        if (selectedNws === true && parameters?.data?.nws_queue && parameters.data.nws_queue.length > 0) {
            _nws = parameters?.data?.nws_queue.map(v => v.id);
        } else {
            _nws = Object.keys(selectedNws);
        }
        if (_nws.length > 0) {
            setModalParameters({
                width: "500px",
                height: "200px",
                content: "nwsprint", type: "modal", push: false/* , width: "90%" */, title: <div style={{ fontWeight: 900 }}>Imprimir Etiquetas de Nonwovens</div>,
                parameters: {
                    url: `${API_URL}/print/sql/`, printers: printersList?.CABS,
                    onComplete: onDownloadComplete,
                    parameters: {
                        method: "PrintNwsEtiquetas",
                        ids: _nws.join(','),
                        name: "ETIQUETAS-NWS-AMOSTRA",
                        path: "ETIQUETAS/NWS-AMOSTRA"
                    }
                }
            });
            showModal();
        }
    };

    const onPaletesExpand = () => {
        setModalParameters({ content: "paletesexpand", type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Paletes</div>, parameters: { filter: { fof: `in:${ofs.join(",")}` } } });
        showModal();
    }
    const onLineLogExpand = () => {
        setModalParameters({ content: "linelogexpand", lazy: true, type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Eventos da Linha</div>, parameters: {} });
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
    const onEstadoClick = (data, estado, noPalete = null) => {
        const item = BOBINE_ESTADOS.filter(v => v.value === estado)[0];
        setModalParameters({ content: "bobines", type: "drawer", push: false, width: "90%", tab: lastBobinesTab, setLastTab: setLastBobinesTab, title: <div style={{ fontWeight: 900 }}>Bobines</div>, parameters: { filter: { ...noPalete && { palete_id: "isnull" }, fcomp: ">=0", frecycle: "in:0,1", fof: `==${data?.of_cod}`, festados: [{ ...item, key: item.value }] } } });
        showModal();
    }
    const onTotaisEstadoClick = (estado, ofsData, defeito) => {
        const item = BOBINE_ESTADOS.filter(v => v.value === estado)[0];
        setModalParameters({ content: "bobines", type: "drawer", push: false, width: "90%", title: <div style={{ fontWeight: 900 }}>Bobines</div>, parameters: { filter: { fcomp: ">=0", frecycle: "in:0,1", fof: `in:${ofsData.join(",")}`, festados: [{ ...item, key: item.value }], ...defeito && { fdefeitos: [defeito] } } } });
        showModal();
    }
    const onPaletesStockClick = (data) => {
        setModalParameters({ content: "paletesstock", type: "drawer", push: false, width: "90%", lazy: true, title: <div style={{ fontWeight: 900 }}>Paletes de Stock {data?.of_cod}</div>, parameters: { status: data?.status, id: data.id, cliente_cod: data?.cliente_cod, artigo_cod: data?.artigo_cod, filter: { fordem_id: `==${data?.id}` } } });
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

    const onNwsPick = () => {
        setModalParameters({ content: "nwspick", type: "drawer", width: "95%", title: "Entrada/Saída de Nonwovens", lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: {} });
        showModal();
    }



    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [hash.hash_estadoproducao, parameters?.data?.timestamp, parameters?.isRunning, parameters?.isClosed]);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (parameters?.data?.rows) {
            const v = estadoProducaoData({ data: parameters?.data });
            //setOfs([..._ofs]);
            //dataAPI.setData({ rows: _dj, total: _dj.length });
            setOfs(v.ofs);
            dataAPI.setData({ rows: v.rows, total: v.total });

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
                <Col width={ofs.length < 2 ? 360 : 720}>
                    <OrdemFabricoBoxes onTogglePaletes={onTogglePaletes} paletes={paletes} boxWidth={ofs.length < 2 ? 12 : 6} dataAPI={dataAPI} />
                </Col>


                <Col>
                    <Row nogutter className={classes.container} >
                        {/**PALETES */}
                        <Col lg={12} xl={7}>
                            <Row nogutter>
                                <Col /* width={650} */ style={{ border: "solid 1px #595959", padding: "3px" }}>
                                    <Row nogutter>
                                        <Col style={{ background: "#f0f0f0", padding: "3px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                                            <div style={{}}>Paletes</div>
                                            <div><Button type="primary" size="small" onClick={onPaletesExpand} ghost icon={<ExpandAltOutlined />} /></div>
                                        </Col>
                                    </Row>
                                    <Row nogutter>
                                        <Col>
                                            <div style={{}}><ListPaletesOf hash={hash} data={parameters?.data} filter={paletes} mini={true} /></div>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>

                        {/**CORTES */}
                        <Col lg={12} xl={5}>
                            <Row nogutter>
                                <Col style={{ border: "solid 1px #595959", padding: "3px", height: "227px" }}>
                                    <Row nogutter>
                                        <Col style={{ background: "#f0f0f0", padding: "3px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                                            <div style={{}}>Cortes</div>
                                            {/* <div><Button type="primary" size="small" onClick={onPaletesExpand} ghost icon={<EditOutlined />} /></div> */}
                                        </Col>
                                    </Row>
                                    <Row nogutter>
                                        <Col>
                                            <div style={{}}>
                                                <Suspense fallback={<></>}><FormCortesOrdem height="77px" cortesOrdemId={json(parameters?.data?.current?.cortesordem)?.id} /* forInput={false} record={{ ofs, cortes: json(parameters?.data?.current?.cortes), cortesordem: json(parameters?.data?.current?.cortesordem) }} */ /></Suspense>
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
                                    <Row nogutter style={{ border: "solid 1px #595959", padding: "3px" }}>
                                        <Col>
                                            <div style={{}}><LineParameters hash={hash} data={parameters?.data} onLineLogExpand={onLineLogExpand} /></div>
                                        </Col>
                                    </Row>
                                    {/*                     <Row nogutter style={{ border: "solid 1px #595959", margin: "3px 0 0 0", padding: "3px" }}>
                                    <Col>
                                        <div style={{}}><TotaisEstadoBobines data={parameters?.data} onTotaisEstadoClick={onTotaisEstadoClick} /></div>
                                    </Col>
                                </Row> */}

                                    <Row nogutter style={{ border: "solid 1px #595959", padding: "3px", margin: "3px 0 0 0" }}>{/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#002766", color: "#fff", padding: "3px" }}>xxxxx</div> */}
                                        <Col>
                                            <Row nogutter>
                                                <Col style={{ background: "#f0f0f0", padding: "3px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                                                    <div style={{}}>Granulado em linha</div>
                                                    <div>
                                                        <Space>
                                                            {/* <Button type="primary" size="small" ghost title="Alterar formulação" disabled={!permission.isOk({ item: "formulacao", action: "inproduction", forInput: !parameters?.isClosed })} onClick={() => onOpenFormulacao("formulacao_formulation_change")}>Formulação</Button>
                                                            <Button type="primary" size="small" ghost title="Alterar doseadores" disabled={!permission.isOk({ item: "formulacao", action: "inproduction", forInput: !parameters?.isClosed })} onClick={() => onOpenFormulacao("formulacao_dosers_change")}>Doseadores</Button>
                                                            <Button type="primary" size="small" icon={<TabletOutlined />} title="Entrada e saida de granulado da linha" onClick={onGranuladoPick} />
                                                            <Button type="primary" size="small" onClick={onBobinagensExpand} ghost icon={<ExpandAltOutlined />} title="Ver movimentos de granulado na linha" /> */}
                                                        </Space>
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row nogutter>
                                                <Col>
                                                    <div style={{}}><ListGranuladoInline hash={hash} data={parameters?.data} /></div>
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
                                    <Row nogutter style={{ border: "solid 1px #595959", padding: "3px" }}>
                                        <Col >
                                            <Row nogutter>
                                                <Col style={{ background: "#f0f0f0", padding: "3px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
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
                                                    <div style={{}}><ListBobinagens hash={hash} data={parameters?.data} /></div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>


                                    {/**NONWOVENS PLANEADOS */}
                                    <Row nogutter style={{ border: "solid 1px #595959", padding: "3px", margin: "3px 0 0 0 " }}>
                                        <Col >
                                            <Row nogutter>
                                                <Col style={{ background: "#f0f0f0", padding: "3px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                                                    <div style={{}}>Nonwovens planeados</div>
                                                    {/* <div><Button type="primary" size="small" onClick={onBobinagensExpand} ghost icon={<EditOutlined />} /></div> */}
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
                                    <ListNwsQueue hash={hash} data={parameters?.data} onNwsPick={onNwsPick} onNwsPrint={onNwsPrint}/*  selectedNws={selectedNws} setSelectedNws={setSelectedNws} */ />

                                    {/**Reciclado */}
                                    <ListReciclado hash={hash} data={parameters?.data} />


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
        return (<div onClick={() => onEstadoClick(data, v.estado, true)} key={`cbe-${i}-${v.ofid}`} style={{ width: `${widths[i]}%`, background: bColors(v.estado).color, color: bColors(v.estado).fontColor, opacity: 0.6 }}><div style={{ fontWeight: 700 }}>{v.estado}</div><div>{v.total_por_estado_of}</div></div>);
    })}</div>}</>);
}


/* 
const OrdemFabricoChooser = ({ parameters, onClick }) => {

    useEffect(() => {
        console.log("chooser--------------------", parameters)
    }, [parameters?.data?.agg_cod]);

    return (<div onClick={onClick}>{parameters?.data?.agg_cod}</div>);
} */

const StyledDrawer = styled(Drawer)`
    .ant-drawer-wrapper-body{
        background:#2a3142;
    }    
    .ant-drawer-content{
        background:#2a3142;
    }
    .ant-drawer-header{
        border-bottom:none;
    }

`;

export default ({ setFormTitle, ...props }) => {
    const media = useContext(MediaContext);
    /*     const { hash: { hash_estadoproducao, hash_linelog_params }, data: { estadoProducao } } = useContext(SocketContext) || { hash: {}, data: {} }; */
    /*     const { updateAggId } = useContext(AppContext); */
    /*     const [dataParams, setDataParams] = useState({}); */
    const [dataEstadoProducao, setDataEstadoProducao] = useState([]);
    const [hash, updateHash] = useImmer({ hash_estadoproducao: null, hash_estadoproducao_realtime: null, updated: null });
    const { lastJsonMessage: wsMessageBroadcast, sendJsonMessage: wsSendMessageBroadcast } = useWebSocket(`${SOCKET.url}/realtimealerts`, {
        onOpen: () => console.log(`Connected to Web Socket Broadcast`),
        queryParams: { /* 'token': '123456' */ },
        onError: (event) => { console.error(event); },
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 500
    });

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
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "ordemfabrico": return <Chooser parameters={modalParameters.parameters} />;
            }
        }
        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const [modalParametersL1, setModalParametersL1] = useState({});
    const [showModalL1, hideModalL1] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParametersL1.content) {
                case "validar": return <FormOrdemFabricoValidar parameters={modalParametersL1.parameters} />;
                case "viewordemfabrico": return <OrdemFabrico parameters={modalParametersL1.parameters} />;
            }
        }
        return (
            <ResponsiveModal lazy={modalParametersL1?.lazy} title={modalParametersL1?.title} type={modalParametersL1?.type} push={modalParametersL1?.push} onCancel={hideModalL1} width={modalParametersL1.width} height={modalParametersL1.height} footer="ref" extra="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParametersL1]);
    const onOpenFormulacao = (type) => {
        // console.log(inputParameters.current)
        // if (inputParameters.current?.cs_id) {
        //     setModalParameters({ content: "formulacao", type: "drawer", width: "95%", title: "Formulação", push: false, loadData: () => dataAPI.fetchPost(), parameters: { cs_id: inputParameters.current?.cs_id, type } });
        //     showModal();
        // }
    }


    // cod: { title: "Agg", width: 130, render: v => <span style={{ color: "#096dd9" }}>{v}</span>, ...common },
    // /* ofabrico_sgp: { title: "OF.SGP", width: 60, render: v => <>{v}</>, ...common }, */
    // estado: { title: "", sort:false, width: 125, render: (v, r) => <ColumnEstado onValidar={onValidar} allow={permission.allow()} record={r} showMenuActions={showMenuActions} setShowMenuActions={setShowMenuActions} /*showConfirm={showConfirm} setShowConfirm={setShowConfirm} */ onAction={onEstadoChange} /*    setEstadoRecord={setEstadoRecord} estadoRecord={estadoRecord} reloadParent={reloadFromChild} rowKey={selectionRowKey(r)} record={r} */ />, ...common },
    // /* options: { title: "", sort: false, width: 25, render: (v, r) => <ActionButton content={<MenuActionButton record={r} />} />, ...common }, */
    // //item: { title: "Artigo(s)", width: 140, render: v => <>{v}</>, ...common },
    // item_nome: { title: "Artigo(s)", ellipsis: true, render: v => <div style={{ /* overflow:"hidden", textOverflow:"ellipsis" */whiteSpace: 'nowrap' }}>{v}</div>, ...common },
    // cliente_nome: { title: "Cliente(s)", ellipsis: true, render: v => <div style={{ whiteSpace: 'nowrap' }}><b>{v}</b></div>, ...common },


    const onOFStatusClick = (e, data, allowChangeStatus, allowValidar, allowReopen) => {
        e.preventDefault();
        e.stopPropagation();
        if (data?.ofabrico_status === 0 && allowChangeStatus && allowValidar) {
            //Validar
            setModalParametersL1({ content: "validar", type: "drawer", width: "95%"/* , title: "Entrada/Saída de granulado em linha" */, lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: { ...data } });
            showModalL1();

        }
        if ((data?.ofabrico_status === 2 || data?.ofabrico_status === 3 || data?.ofabrico_status === 9)) {
            //navigate("/app/ofabrico/formordemfabrico", { state: { parameters: { ...data, allowChangeStatus, allowValidar, allowReopen }, tstamp: Date.now() }, replace: true });
            //Validar
            setModalParametersL1({ content: "viewordemfabrico", type: "drawer", width: "95%", title: `${dataEstadoProducao?.current?.agg_cod}`, lazy: true, push: false/* , loadData: () => dataAPI.fetchPost() */, parameters: { ...data, allowChangeStatus, allowValidar, allowReopen } });
            showModalL1();

        }
    }

    const onOrdemFabricoClick = async () => {
        navigate('/app/ofabrico/ordensfabricolist/');
        return;
        const instantPermissions = await permission.loadInstantPermissions({ name: "ordemfabrico", module: "main" });
        permission.isOk(instantPermissions);
        const allowChangeStatus = permission.isOk({ item: "changeStatus", instantPermissions });
        const allowValidar = permission.isOk({ item: "changeStatus", action: "validar", instantPermissions });
        const allowReopen = permission.isOk({ item: "changeStatus", action: "reopen", instantPermissions });
        const allowInElaboration = permission.isOk({ item: "viewInElaboration", instantPermissions });
        const allowViewValidar = permission.isOk({ item: "viewValidar", instantPermissions });
        //const { status, cod, temp_ofabrico_agg } = record;
        //navigate("/app", { state: { aggId: 244, tstamp: Date.now() }, replace: true });
        setModalParameters({
            content: "ordemfabrico", responsive: true, type: "drawer", width: "95%", title: "Ordens de Fabrico", push: false, loadData: () => { }, parameters: {
                payload: { payload: { url: `${API_URL}/ordensfabrico/sql/`, primaryKey: "rowid", parameters: { method: "OrdensFabricoList", allowInElaboration, allowViewValidar }, pagination: { enabled: true, pageSize: 20 }, filter: {}, baseFilter: {}, sort: [{ column: 'ofabrico_status', direction: 'ASC' }, { column: 'ofabrico', direction: 'DESC' }] } },
                toolbar: false,
                pagination: "remote",
                multipleSelection: false,
                columns: [
                    ...(true) ? [{ name: 'ofabrico', header: 'Nome', userSelect: true, defaultLocked: false, defaultWidth: 120, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.ofabrico}</LeftAlign> }] : [],
                    ...(true) ? [{ name: 'prf', header: 'Designação', userSelect: true, defaultLocked: false, defaultWidth: 120, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.prf}</LeftAlign> }] : [],
                    ...(true) ? [{ name: 'iorder', header: 'Encomenda', render: ({ data, cellProps }) => data?.iorder, userSelect: true, defaultLocked: false, defaultWidth: 140, headerAlign: "center" }] : [],
                    ...(true) ? [{ name: 'cod', header: 'Agg', userSelect: true, defaultLocked: false, defaultWidth: 140, headerAlign: "center" }] : [],
                    ...(true) ? [{ name: 'ofabrico_status', header: '', userSelect: true, defaultLocked: false, defaultWidth: 130, headerAlign: "center", render: ({ data, cellProps }) => <OFabricoStatus data={data} cellProps={cellProps} onClick={(e) => onOFStatusClick(e, data, allowChangeStatus, allowValidar, allowReopen)} /> }] : [],
                    ...(true) ? [{ name: "cliente_nome", header: "Cliente", defaultWidth: 160, flex: 1, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{ fontWeight: "700" }}>{data?.cliente_nome}</LeftAlign> }] : [],
                    ...(true) ? [{ name: "item", header: "Artigo", defaultWidth: 160, userSelect: true, defaultlocked: false, headerAlign: "center", render: ({ data, cellProps }) => <LeftAlign style={{}}>{data?.item}</LeftAlign> }] : [],
                    ...(true) ? [{ name: 'start_prev_date', header: 'Início Previsto', userSelect: true, defaultLocked: false, defaultWidth: 128, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.start_prev_date} format={DATETIME_FORMAT} /> }] : [],
                    ...(true) ? [{ name: 'end_prev_date', header: 'Fim Previsto', userSelect: true, defaultLocked: false, defaultWidth: 128, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.end_prev_date} format={DATETIME_FORMAT} /> }] : [],
                    ...(true) ? [{ name: 'inicio', header: 'Início', userSelect: true, defaultLocked: false, defaultWidth: 128, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.inicio} format={DATETIME_FORMAT} /> }] : [],
                    ...(true) ? [{ name: 'fim', header: 'Fim', userSelect: true, defaultLocked: false, defaultWidth: 128, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.fim} format={DATETIME_FORMAT} /> }] : [],
                    // ...(true) ? [{ name: 'parameter_mode', header: 'Modo', render: ({ data, cellProps }) => <MetodoMode cellProps={cellProps} value={data?.parameter_mode} />, userSelect: true, defaultLocked: false, width: 100, headerAlign: "center" }] : [],
                    // ...(true) ? [{ name: 'unit', header: 'Unidade', userSelect: true, defaultLocked: false, width: 150, headerAlign: "center" }] : [],
                    // //...(true) ? [{ name: 'nvalues', header: 'Nº Valores', userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
                    // ...(true) ? [{ name: 'min_value', header: 'Min', userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
                    // ...(true) ? [{ name: 'max_value', header: 'Max', userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
                    // ...(true) ? [{ name: 'value_precision', header: 'Precisão', userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
                    // ...(true) ? [{ name: 'status', header: 'Estado', render: ({ data }) => <Status value={data?.status} genre="m" />, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : [],
                    // ...(true) ? [{ name: 'required', header: 'Obrigatório', render: ({ data }) => <Bool value={data?.required} />, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" }] : []
                ],
                onSelect: onSelectParameters
                // filters: { fofabrico: { type: "any", width: 150, text: "Ordem", autoFocus: true } },
            },

        });
        showModal();
    }
    const onSelectParameters = (data) => {
    }

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [/* props?.parameters?.cs_id */]);

    const loadData = async ({ signal, init = false } = {}) => {
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, {}, { ...location?.state }, null/* ["cs_id"] */);
            inputParameters.current = paramsIn;
            wsSendMessageBroadcast({ cmd: 'getEstadoProducao', value: {} });
            // saveNavigation("Estado da Produção", permission.auth?.user, location);
        }
        submitting.end();
    }

    useEffect(() => {
        let updated = false;
        if (wsMessageBroadcast?.hash?.hash_estadoproducao !== hash?.hash_estadoproducao || wsMessageBroadcast?.hash?.hash_estadoproducao_realtime !== hash?.hash_estadoproducao_realtime) {
            updated = true;
        }
        updateHash(draft => {
            draft.hash_estadoproducao = wsMessageBroadcast?.hash?.hash_estadoproducao;
            draft.hash_estadoproducao_realtime = wsMessageBroadcast?.hash?.hash_estadoproducao_realtime;
            if (updated) {
                draft.updated = dayjs().valueOf();
            }
        });
        if (updated) {
            const _data = json(wsMessageBroadcast?.data?.estadoProducao, null);
            if (_data) {
                setDataEstadoProducao({
                    timestamp: Date.now(),
                    rows: _data["estado_producao"],
                    bobines: _data["estado_producao_bobines"],
                    bobines_nopalete: _data["estado_producao_bobines_nopalete"],
                    bobines_retrabalhadas: _data["estadoproducao_bobines_retrabalhadas"],
                    paletes: _data["estado_producao_paletes"],
                    current: json(_data["estado_producao_current"]),
                    status: _data["estado_producao_status"][0],
                    bobinagens: _data["estado_producao_bobinagens"],
                    params: _data["estado_producao_params"],
                    defeitos: _data["estado_producao_defeitos"],
                    nws_planeados: _data["estado_producao_nws"],
                    nws_queue: _data["estado_producao_nw_queue"],
                    granulado_inline: _data["estado_producao_granulado_inline"],
                    realtime: _data["estado_producao_realtime"],
                    events: _data["estado_producao_events"]
                });

            } else {
                setDataEstadoProducao({});
            }
        }
        console.log("MESSAGE BROADCAST", wsMessageBroadcast?.hash?.hash_estadoproducao, wsMessageBroadcast?.hash?.hash_estadoproducao_realtime)
    }, [wsMessageBroadcast?.hash?.hash_estadoproducao, wsMessageBroadcast?.hash?.hash_estadoproducao_realtime]);

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


    const onShowDrawer = () => {
        setDrawerVisible(true);
    };

    const onCloseDrawer = () => {
        setDrawerVisible(false);
    };


    return (<>
        <StyledDrawer
            title={
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <LogoWhite style={{ width: "100px", height: "24px", paddingRight: "10px" }} />
                </div>
            }
            placement="left"
            closable={false}
            onClose={onCloseDrawer}
            open={drawerVisible}
        >
            <YScroll>
                <MainMenu dark />
            </YScroll>
        </StyledDrawer>
        <Card
            hoverable
            headStyle={{ padding: "5px 10px", backgroundColor: isRunning() ? "#389e0d" : isRunning() === null ? "#d46b08" : "#cf1322" }}
            style={{ height: "100%", border: "1px solid #8c8c8c" }}
            bodyStyle={{ height: "calc(100vh - 55px)", padding: "0px 3px 3px 0px" }}
            size="small"
            title={
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <SimpleDropdownHistory description="Dashboard Produção Linha 1" id={permission.auth?.user} fixedTopItems={HISTORY_DEFAULT} fixedFooterItems={HISTORY_DEFAULT_FOOTER}
                        center={
                            <div /* onClick={onOrdemFabricoClick} */ className={classes.widgetTitle}>{dataEstadoProducao?.current?.agg_cod}</div>
                        } />
                    <div style={{ width: "3px" }}></div>
                    {/* <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><Logo onClick={onShowDrawer} style={{ width: "100px", height: "24px", marginLeft: "5px", paddingRight: "10px", cursor: "pointer" }} /><div style={{ fontSize: "8px" }}></div></div> */}
                    {/* <Button ghost icon={<UnorderedListOutlined />} onClick={onOrdemFabricoClick} title="Ordens de Fabrico" /> */}
                    <div>
                        <Space>
                            <Button ghost onClick={() => newWindow("/app/picking/main/", {}, "mainpicking")} icon={<ControlOutlined style={{ fontSize: "14px" }} />} />
                        </Space>
                    </div>
                </div>
            }
        >
            <YScroll>
                {/* <Container fluid style={{padding:"0px"}}> */}
                {/* <Row nogutter>
                        <Col width={200} style={{ height: "100%", fontSize: "12px", fontFamily: "Microsoft YaHei", fontWeight: "bolder", color: "#464646",textAlign:"center" }}>Diff.</Col>
                    </Row> */}
                {/* <Row nogutter>
                        <Col> */}

                <EstadoProducao hash={hash} parameters={{ data: dataEstadoProducao, isRunning: isRunning(), isClosed: isClosed() }} />
                {/*                         </Col>
                    </Row> */}
                {/* <Row style={{ height: "10px" }}><Col></Col></Row> */}
                {/*                 </Container> */}
            </YScroll>
        </Card>
    </>
    );


};