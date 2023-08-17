import React, { useContext, useEffect, useRef, useState } from 'react';
import { Collapse, Input, Typography } from "antd";
import ReactECharts from 'components/ReactECharts';
import { EventColumn } from 'components/TableColumns';
import { Col, Row } from 'react-grid-system';
import { CiRuler } from 'react-icons/ci';
import { TbMathAvg } from 'react-icons/tb';
import { createUseStyles } from 'react-jss';
import { getFloat } from "utils";

import RealTimeData from './RealTimeData';

const useStyles = createUseStyles({

    link: {
        color: '#fff',
        '&:hover': {
            color: '#003eb3',
        },
    }
});

const MiniGaugeVelocidade = ({ data, title, min = 0, max = 100, style, ...props }) => {

    const option = {
        title: {
            left: 'center',
            text: title,
            textStyle: {
                fontSize: 10,
                fontWeight: 'bolder',
                fontFamily: "Roboto,sans-serif"
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
                    fontSize: 12,
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

const LastEvents = ({ data }) => {
    return (
        <div style={{}}>
            <div>
                {data && data.map((item, index) => (
                    <div key={`evt-${item.id}`} style={{ display: "flex" }}>
                        <div style={{ /* border: "solid 1px #f0f0f0", */ height: "22px", margin: "0px 3px 0px 3px" }}><EventColumn v={item.type} title={item.t_stamp} /></div>
                        <div style={{ /* border: "solid 1px #f0f0f0", */ fontSize: "10px" }}>{item.t_stamp}</div>
                    </div>
                ))}
            </div>
            {/*             <div style={{ fontSize: "10px" }}>{data && data[0].t_stamp}</div> */}
        </div>
    );
}

export default ({ hash, data, onLineLogExpand }) => {

    useEffect(() => {
    }, [hash?.updated]);

    return (<>
        <Row nogutter>
            <Col style={{ background: "#f0f0f0", padding: "3px", fontWeight: 800/* , display: "flex", justifyContent: "center" */ }}>
                <div><RealTimeData data={data?.realtime} onLineLogExpand={onLineLogExpand} /></div>
            </Col>
        </Row>
        {/*         <Row nogutter>
            <Col width={200} style={{ textAlign: "center" }}>{(getFloat(data?.realtime?.winder_speed, 1) - getFloat(data?.realtime?.line_speed, 1)).toFixed(1)} m/min</Col>
        </Row> */}
        <Row nogutter>
            <Col>
                <Row nogutter>
                    <Col>
                        <Row nogutter>
                            <Col width={80}>
                                <MiniGaugeVelocidade data={getFloat(data?.realtime?.winder_speed, 1)} title="V.Bobinadora" min={0} max={100} style={{ width: "80px", height: "70px" }} />
                            </Col>
                            <Col width={10} style={{ alignSelf: "center" }}>
                                {(getFloat(data?.realtime?.winder_speed, 1) - getFloat(data?.realtime?.line_speed, 1)).toFixed(1)}
                            </Col>
                            <Col width={80}>
                                <MiniGaugeVelocidade data={getFloat(data?.realtime?.line_speed, 1)} title="V. Linha" min={0} max={100} style={{ width: "80px", height: "70px" }} />
                            </Col>
                            <Col width={80}>
                                <MiniGaugeVelocidade data={getFloat(data?.params?.avg_line_speed, 1)} title="V. Média" min={0} max={100} style={{ width: "80px", height: "70px" }} />
                            </Col>
                            <Col width={80}>
                                <MiniGaugeVelocidade data={getFloat(data?.params?.max_line_speed, 1)} title="V. Máxima" min={0} max={100} style={{ width: "80px", height: "70px" }} />
                            </Col>
                            <Col width={80}>
                                <Row nogutter style={{}}><Col style={{ fontSize: "10px", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center" }}><CiRuler fontSize={"18px"} />Capacity(current/set)</Col></Row>
                                <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>kg/h</Col></Row>
                                <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.realtime?.Qnet_PV, 1)}/{getFloat(data?.realtime?.Qnet_SP, 1)}</Col></Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row nogutter>
                    <Col width={80}>
                        <Row nogutter style={{}}><Col style={{ fontSize: "10px", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center" }}>Film Thickness</Col></Row>
                        <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.realtime?.spess_PV, 1)}/{getFloat(data?.realtime?.spess_MIS, 1)} &#181;m</Col></Row>
                    </Col>
                    <Col width={80}>
                        <Row nogutter style={{}}><Col style={{ fontSize: "10px", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center" }}>Film Density</Col></Row>
                        <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.realtime?.density, 3)} g/cm&sup3;</Col></Row>
                    </Col>
                    <Col width={80}>
                        <Row nogutter style={{}}><Col style={{ fontSize: "10px", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center" }}>Film gsm</Col></Row>
                        <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.realtime?.grammage, 2)} g/m&sup2;</Col></Row>
                    </Col>
                    <Col width={80}>
                        <Row nogutter style={{}}><Col style={{ fontSize: "10px", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center", alignItems: "center" }}><TbMathAvg fontSize={"14px"} />Diameter</Col></Row>
                        <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.realtime?.diametro_bobine, 1)} mm</Col></Row>
                    </Col>
                    <Col width={80}>
                        <Row nogutter style={{}}><Col style={{ fontSize: "10px", fontWeight: "bolder", color: "#464646", display: "flex", justifyContent: "center" }}><CiRuler fontSize={"18px"} />Meters</Col></Row>
                        <Row nogutter style={{}}><Col style={{ display: "flex", justifyContent: "center" }}>{getFloat(data?.realtime?.metros_bobine, 1)} m</Col></Row>
                    </Col>
                </Row>
            </Col>
            <Col width={120}>
                <LastEvents data={data?.events} />
            </Col>
        </Row>
    </>);
}