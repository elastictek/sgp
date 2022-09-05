import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL, ROOT_URL } from "config";
import { useModal } from "react-modal-hook";
import YScroll from "components/YScroll";
import { Button, Select, Typography, Card, Collapse, Space } from "antd";
const { Panel } = Collapse;
import { EditOutlined, HistoryOutlined } from '@ant-design/icons';
import { VerticalSpace } from 'components/FormFields';

import ResponsiveModal from 'components/Modal';

export default ({ record, card, parentReload }) => {
    

    const changeStatus = async (status) => {
       /*  if (status === 9) {
            modal.show({
                propsToChild: true, width: '400px', height: '150px', fullWidthDevice: 2, footer: "ref",
                title: `Finalizar Produção`,
                content: <FecharOrdemFabrico data={{ id: record.id, status, agg_of_id: record.agg_of_id }} parentReload={() => parentReload({ aggId: record.agg_of_id })} />
            });
        }
        if (status === 1) {
            //Modal.confirm({ title: "Parar/Suspender Produção!", content: "Tem a certeza que deseja Parar/Suspender a Produção?", onOk: suspenderProducao })
            modal.show({
                 propsToChild: true, width: '400px', height: '150px', fullWidthDevice: 2, footer: "ref",
                 title: `Parar/Suspender Produção`,
                 content: <FecharOrdemFabrico data={{ id: record.id, status, agg_of_id: record.agg_of_id }} parentReload={() => parentReload({ aggId: record.agg_of_id })} />
             });
        }
        if (status === 3 || status === 0) {
            const response = await fetchPost({ url: `${API_URL}/changecurrsettings/`, parameters: { id: record.id, status, agg_of_id: record.agg_of_id } });
            if (response.data.status !== "error") {
                Modal.success({ content: response.data.title });
                parentReload({ aggId: record.agg_of_id });

            } else {
                Modal.error({
                    title: 'Erro ao alterar estado da Ordem de Fabrico',
                    content: response.data.title,
                });
            }
        } */
    }

       



    return (
        <>
            {Object.keys(record).length > 0 && <Card
                hoverable
                headStyle={{padding:"0px 32px 0px 12px"}}
                /* onClick={onEdit} */
                style={{ height: "100%", border: "1px solid #8c8c8c" }}
                bodyStyle={{ height: "calc(100% - 45px)" }}
                size="small"
                title={<div style={{ fontWeight: 700, fontSize: "16px", color:"#000" }}>{card.title}</div>}
            >
                <YScroll>
                {(record.status == 1 || record.status == 2) &&
                    <>
                        <Button block size="large" style={{ background: "#389e0d", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(3)}>Iniciar Produção</Button>
                        <VerticalSpace height="5px" />
                        {/* <Button block size="large" style={{ background: "#fa8c16", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(0)}>Refazer Planeamento</Button> */}
                    </>
                }
                {record.status == 3 &&
                    <>
                        <Button block size="large" style={{ background: "red", color: "#fff", fontWeight: 700 }} onClick={() => changeStatus(1)}>Parar/Suspender Produção</Button>
                        <VerticalSpace height="5px" />
                        <Button block size="large" style={{ background: "#40a9ff", color: "#000", fontWeight: 700 }} onClick={() => changeStatus(9)}>Finalizar Produção</Button>
                    </>
                }
                </YScroll>
            </Card>
            }
        </>
    );
}
