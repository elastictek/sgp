import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { useDataAPI } from "utils/useDataAPI";
import { API_URL, ROOT_URL, DATETIME_FORMAT, DATE_FORMAT } from "config";
import { useModal } from "react-modal-hook";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import ResponsiveModal from 'components/Modal';
import Portal from "components/portal";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space, Form, Modal, DatePicker } from "antd";
const { Option } = Select;
const { Panel } = Collapse;
import { EditOutlined, HistoryOutlined } from '@ant-design/icons';
import { VerticalSpace } from 'components/FormFields';
import { usePermission } from "utils/usePermission";
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, SelectDebounceField } from 'components/FormFields';
import { useSubmitting, noValue } from "utils";
import Table from 'components/TableV2';
import TitleCard from '../TitleCard';
import c3 from "c3";
import 'c3/c3.css';
import 'webdatarocks/webdatarocks.css';
import * as WebDataRocksReact from 'react-webdatarocks';

const Chart = ({ data, categories, className }) => {
    useEffect(() => {
        c3.generate({
            bindto: '#chart',
            data: {
                columns: [...data],
                axes: {
                    Resultado: "y2",
                    //Zero: "y2"
                },
                type: 'bar',
                types: {
                    Resultado: "line",
                    //Zero: "line"
                },
                colors: {
                    Zero: "#d9d9d9"
                },
                labels: {
                    //            format: function (v, id, i, j) { return "Default Format"; },
                    format: {
                        Resultado: true,
                        //                data1: function (v, id, i, j) { return "Format for data1"; },
                    }
                }
            },
            grid: {
                y: {
                    lines: [{ value: 0, axis: 'y2', position: 'start' }]
                }
            },
            bar: {
                width: {
                    ratio: 0.2
                }
            },
            zoom: {
                enabled: true
            },
            axis: {
                x: {
                    type: 'category',
                    categories: categories,
                    tick: {
                        rotate: 75,
                        multiline: false
                    },
                    height: 80
                },
                y2: {
                    show: true,
                    //default: [-3000, 6000],
                    padding: { top: 100, bottom: 150 }
                    //padding: { top: 0, bottom: 0 },
                    //max: 20
                }
            },
            legend: {
                show: true
            }
        });
        // c3.generate({
        //     bindto: "#chart",
        //     data: {
        //         columns: [...data],
        //         type: "bar",
        //     },
        //     axis: {
        //         x: {
        //             label: {
        //                 /*  text: 'States',
        //                  position: 'outer-center', */
        //             },
        //             type: 'category',
        //             categories: categories,
        //             tick: {
        //                 centered: true
        //             }
        //         },
        //         y: {
        //             label: {
        //                 /* text: 'Rainfall (inches)',
        //                 position: 'outer-middle' */
        //             },
        //            /*  max: 10,
        //             min: 0,
        //             padding: {
        //                 top: 0,
        //                 bottom: 0
        //             } */
        //         }
        //     },
        //     legend: {
        //         show: true
        //     }
        // });
    });

    return <div id="chart" className={className} />;
};

const StylesChart = styled(Chart)`    
.c3-circles-Zero {
        display: none;
    }
`;

const SelectData = ({ onView, onChangeContent, dataAPI }) => {
    return (
        <Space>
            <Select defaultValue={noValue(dataAPI.getParameters()?.type, "1")} style={{ width: 200 }} onChange={(v) => onChangeContent(v, "type")} dropdownMatchSelectWidth={false}>
                <Option value="1">Gráfico</Option>
                <Option value="2">Tabela</Option>
                <Option value="3">Pivot</Option>
            </Select>
            <DatePicker allowClear={false} format={DATE_FORMAT} defaultValue={noValue(dayjs(dataAPI.getFilter(true)?.date), dayjs())} onChange={(v) => onChangeContent(v, "date")} disabled={dataAPI.isLoading()} />
        </Space>
    );
}

export default ({ record, card, parentReload }) => {
    const permission = usePermission();
    const [data, setData] = useState();
    const [categories, setCategories] = useState();
    //const submitting = useSubmitting(true);
    const dataAPI = useDataAPI({ id: "dashb-rprt-reciclado", payload: { url: `${API_URL}/report/reciclado/`, parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
    const primaryKeys = ['dt'];
    const columns = [
        { key: 'dt', name: 'Data', width: 110, frozen: true },
        { key: 'ano', name: 'Ano', width: 80, frozen: true },
        { key: 'nweek', name: 'Semana', width: 80 },
        { key: 'day_peso', name: 'Qtd.Produzida Diária', width: 140, formatter: p => <div style={{ textAlign: "right" }}>{p.row.day_peso} kg</div> },
        { key: 'week_peso', name: 'Qtd.Produzida Semana', width: 150, formatter: p => <div style={{ textAlign: "right" }}>{p.row.week_peso} kg</div> },
        { key: 'day_consumo', name: 'Qtd.Consumida Diária', width: 150, formatter: p => <div style={{ textAlign: "right" }}>{p.row.day_consumo} kg</div> },
        { key: 'week_consumo', name: 'Qtd.Consumida Semana', width: 160, formatter: p => <div style={{ textAlign: "right" }}>{p.row.week_consumo} kg</div> },
        { key: 'day_resultado', name: 'Resultado Diário', width: 120, formatter: p => <div style={{ textAlign: "right" }}>{p.row.day_resultado} kg</div> },
        { key: 'week_resultado', name: 'Resultado Semana', width: 130, formatter: p => <div style={{ textAlign: "right" }}>{p.row.week_resultado} kg</div> }
    ];



    const loadData = async ({ signal, field, value, init } = {}) => {
        switch (field) {
            case 'date':
                dataAPI.addFilters({ ...(value && { date: dayjs(value).format(DATE_FORMAT) }) }, true, true);
                break;
            case 'type':
                dataAPI.addParameters({ type: value }, true, true);
                break;
        }
        dataAPI.fetchPost({ signal });
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => { controller.abort(); });
    }, []);

    const onChangeContent = async (v, field) => {
        loadData({ field, value: v });
    }


    useEffect(() => {
        if (dataAPI.hasData() && dataAPI.getParameters()?.type !== '2') {
            const columns = [];
            let categories = [];
            const rows = dataAPI.getData().rows;
            console.log("####################yeah----",rows);
            //const { data: { rows } } = await fetchPost({ url: `${API_URL}/report/reciclado/`, filter: { ...(date && { date: dayjs(date).format(DATE_FORMAT) }) }, sort: [], signal });

            const weeks = rows.filter((e, i) => rows.findIndex(a => a.nweek === e.nweek) === i);
            const weeks_labels = weeks.map(v => `w${v.nweek}`);
            const weeks_pesos = weeks.map(v => v.week_peso);
            const weeks_consumos = weeks.map(v => v.week_consumo);
            const weeks_resultado = weeks.map(v => v.week_resultado);


            const days = rows.slice(-16);
            const days_labels = days.map(v => `${v.dt}`);
            const days_pesos = days.map(v => v.day_peso);
            const days_pesos_consumos = days.map(v => v.day_consumo);
            const days_resultado = days.map(v => v.day_resultado);


            categories = [...weeks_labels, ...days_labels];
            columns.push(['Produzido', ...weeks_pesos, ...days_pesos]);
            columns.push(['Consumido', ...weeks_consumos, ...days_pesos_consumos]);
            columns.push(['Resultado', ...weeks_resultado, ...days_resultado]);
            columns.push(['Zero', ...new Array(categories.length).fill(0)]);

            setData(columns);
            setCategories(categories);
            //submitting.end();
        }
    }, [dataAPI.getTimeStamp()]);


    return (
        <>
            <Card
                hoverable
                headStyle={{ padding: "0px 32px 0px 12px" }}
                /* onClick={onEdit} */
                style={{ height: "100%", border: "1px solid #8c8c8c" }}
                bodyStyle={{ height: "calc(100% - 61px)" }}
                size="small"
                title={<TitleCard title={card.title} />}
                extra={<SelectData onChangeContent={onChangeContent} dataAPI={dataAPI} />}
            >
                {Object.keys(record).length > 0 &&
                    <YScroll>
                        {(data && dataAPI.getParameters()?.type === '1') && <StylesChart data={data} categories={categories} />}
                        {(dataAPI.hasData() && dataAPI.getParameters()?.type === '2') &&
                            <Table
                                reportTitle={card.title}
                                loadOnInit={false}
                                columns={columns}
                                dataAPI={dataAPI}
                                toolbar={false}
                                search={false}
                                moreFilters={false}
                                rowSelection={false}
                                primaryKeys={primaryKeys}
                                editable={false}
                            />}
                        {(dataAPI.hasData() && dataAPI.getParameters()?.type === '3') &&
                            <WebDataRocksReact.Pivot
                                toolbar={true}
                                width="100%"
                                report={{
                                    dataSource:{data:dataAPI.getData().rows}
                                }}

                            />
                        }

                    </YScroll>
                }
            </Card>
        </>
    );
}
