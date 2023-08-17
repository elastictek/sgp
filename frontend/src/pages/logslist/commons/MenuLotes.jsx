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
import ButtonIcon from "components/buttonIcon";
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
import { FiMoreVertical } from 'react-icons/fi';

import { IoCodeWorkingOutline } from 'react-icons/io5';
import Modalv4 from 'components/Modalv4';
import useModalv4 from 'components/useModalv4';
const StockListByIgBobinagem = lazy(() => import('../../artigos/StockListByIgBobinagem'));





import { Button, Menu, Dropdown, Modal } from "antd";
import { StopOutlined, LockOutlined } from '@ant-design/icons';

import Icon, { EllipsisOutlined } from "@ant-design/icons";
import { DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT, THICKNESS, BOBINE_ESTADOS, BOBINE_DEFEITOS, API_URL, GTIN, SCREENSIZE_OPTIMIZED, DOSERS } from 'config';

const actionItems = [
    { label: 'Adicionar Lote Acima', key: 'up' },
    { label: 'Adicionar Lote Abaixo', key: 'down' },
    { label: 'Corrigir Consumos da Bobinagem', key: 'rectify' }
];

export const Action = ({ r, before, onClick, dataAPI }) => {
    /* const m = Modalv4; */
    const showAdd = () => {
        if ((!before || before["nome"] !== r["nome"]) && r["type_mov_doser"] === "C") {
            return true;
        }
        return false;
    }

    const showOut = () => {
        if (r["type_mov_doser"] === "IN") {
            return true;
        }
        return false
    }
/* 
    const Confirm = () => {
        let confirm = Modal.confirm();
        confirm.update({
            centered: true,
            title: `Adicionar Lotes na Bobinagem ${r.nome}?`,
            content: <div style={{ textAlign: "center" }}>
                <Button onClick={() => { confirm.destroy(); onClick(r, "addlotes", "down"); }} style={{ marginRight: "2px" }} type="primary">Adicionar Lotes Abaixo</Button>
                <Button onClick={() => { confirm.destroy(); onClick(r, "addlotes", "up") }} type="primary">Adicionar Lotes Acima</Button>
            </div>
        });

    } */

    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
            {showOut() && <>
                <ButtonIcon size="small" onClick={() => onClick(r, "removelote",dataAPI)} style={{ alignSelf: "center", color: "red", fontSize: "12px" }} shape="default"><StopOutlined title="Dar Saída" /></ButtonIcon>
            </>}
            {showAdd() && <>
                <Dropdown overlay={<Menu onClick={(e,v)=>onClick(r, e.key,dataAPI)} items={actionItems}/>}>
                       <Button size="small" icon={<EllipsisOutlined /* style={{fontSize:"26px"}}  *//>}/>
                </Dropdown>
                {/* <ButtonIcon size="small" onClick={
                    () => Modalv4.show({
                        width: "400px", height: "200px",
                        title: `Retificar a bobinagem ${r.nome}?`,
                        content: <div>Atenção! Ao retificar a bobinagem, todas as bobinagens posteriores têm de ser corrigidas!</div>,
                        defaultFooter: true,
                        onOk: () => onClick(r, "rectify")
                    })}



                    style={{ alignSelf: "center", color: "green", fontSize: "12px", marginRight: "2px" }} shape="default"><CheckOutlined title="Corrigir bobinagem" /></ButtonIcon>
                <Button size="small"
                    onClick={Confirm}
                    style={{ alignSelf: "center" }} shape="default">Ad. Lotes</Button> */}
            </>}
        </div>
    );
}

export const StatusColumn = ({ v, r, onClick, dataAPI }) => {
    return (
        <>
            {(v === -1 && r["type_mov_doser"] === "IN") && <LockOutlined onClick={() => onClick(r, "unlock",dataAPI)} style={{ color: "orange", fontSize: "18px", cursor: "pointer" }} />}
            {(v === 1 && r["type_mov_doser"] === "IN") && <LockOutlined onClick={() => onClick(r, "lock",dataAPI)} style={{ color: "orange", fontSize: "18px", cursor: "pointer" }} />}
        </>
    );
}

export const handleWndClick = async (bm, type, dataAPI,modal) => {
    let title = '';

    if (type === "lock") {
        Modal.confirm({
            title: 'Bloquear Entrada?', content: <div>Tem a certeza que deseja bloquear a entrada<br /><br /><b>{bm.doser}</b><br /><b>{bm.artigo_cod}</b><br /><b>{bm.n_lote}</b> ?</div>,
            onOk: () => { }
        });
        return;
    }
    if (type === "unlock") {
        Modal.confirm({
            title: 'Desbloquear Entrada?', content: <div>Tem a certeza que deseja desbloquear a entrada<br /><br /><b>{bm.doser}</b><br /><b>{bm.artigo_cod}</b><br /><b>{bm.n_lote}</b> ?</div>,
            onOk: () => { }
        });
        return;
    }
    if (type === "rectify") {
        console.log(bm);
        const response = await fetchPost({ url: `${API_URL}/rectifybobinagem/`, parameters: { ig_id: bm.ig_bobinagem_id } });
        if (response.data.status == "error") {
            Modal.error({ title: 'Erro ao corrigir a bobinagem', content: response.data.title });
        } else {
            dataAPI.fetchPost();
        }
        return;
    }
    if (type === "removelote") {
        Modal.confirm({
            title: 'Dar Saída do Lote no doseador?', content: <div>Tem a certeza que deseja dar saída do lote no doseador<br /><br /><b>{bm.doser}</b><br /><b>{bm.artigo_cod}</b><br /><b>{bm.n_lote}</b> ?</div>,
            onOk: () => { }
        });
        return;
    }

    if (type === "up") {
        title = `Adicionar Lotes antes da bobinagem ${bm.nome}`;
    }
    if (type === "down") {
        title = `Adicionar Lotes após bobinagem ${bm.nome}`;
    }
    modal.show({
        propsToChild: true, footer: null, height: "500px", title, width: "1300px", fullWidthDevice: 3,
        content: <StockListByIgBobinagem type="addlotes" data={{ bobinagem_nome: bm.nome, ig_id: bm.ig_bobinagem_id, order: bm.order, direction: type, t_stamp: bm.t_stamp }} />
    });
    //Modalv4.show({ width: "1300px", fullWidthDevice: 3, title, content: <StockListByIgBobinagem type="addlotes" data={{ id: bm.id, bobinagem_nome: bm.nome, ig_id: bm.ig_bobinagem_id, order: bm.order, direction }} /> });
    //setShowValidar({ show: true, width: "1300px", fullWidthDevice: 3, type, data: { title, id: bm.id, bobinagem_nome: bm.nome, ig_id: bm.ig_bobinagem_id, order: bm.order, direction } });
};