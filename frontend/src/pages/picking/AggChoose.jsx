import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInitV3";
import { API_URL, PALETES_WEIGH } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn } from 'components/TableColumns';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace, FormPrint, printersList } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { AppContext } from 'app';
import { produce } from 'immer';
import { useImmer } from "use-immer";
import { FaStop, FaPlay, FaPause } from 'react-icons/fa';
import { dayjsValue } from 'utils/index';

export const loadOrdensFabrico = async ({ id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, filter: { id }, sort: [], parameters: { method: "OrdensFabricoInProduction" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return null;
}

const ListItem = styled(List.Item)`
    cursor: pointer;
    padding: 10px;
    transition: background-color 0.3s ease; /* Add a smooth transition effect */
    border-radius: 3px;
    &:hover {
    background-color: #bae7ff; /* Background color on hover */
    }
`;

export const TitleAgg = ({ item }) => {
    return (<div><span style={{ fontSize: "14px" }}>{item.items[0].agg_cod}</span><OFabricoStatus data={item.items[0]} cellProps={{}} /></div>);
}

export const TitleAuditAgg = ({ item }) => {
    return (<div style={{ diplay: "flex" }}>
        <div>
            <div style={{ fontSize: "14px",fontWeight:700 }}>{dayjsValue(item.items[0].timestamp).format(DATETIME_FORMAT)}</div>
        </div>
        <OFabricoStatus aggCod={true} data={item.items[0]} cellProps={{}} /></div>);
}

export const ContentAgg = ({ item }) => {
    return (
        <>
            {item.items.map(v => {
                return (
                    <div key={v.ofid} style={{ display: "flex" }}>
                        <div>
                            <div style={{display:"flex"}}><div style={{ fontWeight: 900, fontSize: "14px", color: "#000",marginRight:"5px" }}>{v.ofid}</div><div style={{ fontSize: "14px", color: "#000" }}>{v.cliente_nome}</div></div>
                            <div><span>{v.item_cod}</span><span style={{ marginLeft: "10px" }}>{v.artigo_des?.replace(new RegExp(`Nonwoven Elastic Bands |Nonwoven Elastic Band |NW Elastic Bands `, "gi"), "")}</span></div>
                        </div>
                    </div>
                );
            })}
        </>
    );
}

export default ({ openNotification, next, actionsContent, actions, onClick, ...props }) => {
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const defaultFilters = {};
    const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
    const defaultParameters = {};

    const [items, setItems] = useState();
    const [allowInit, setAllowInit] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);



    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, { tstamp: Date.now() }, props?.parameters, null, null);
            inputParameters.current = { ...paramsIn };
        }
        const _items = await loadOrdensFabrico({}, signal);
        console.log(_items)
        const groupData = _items.reduce((grouped, item) => {
            const { agg_cod, ...rest } = item;
            if (!grouped[agg_cod]) {
                grouped[agg_cod] = [];
            }
            grouped[agg_cod].push(rest);
            return grouped;
        }, {});
        const _groupArray = Object.entries(groupData).map(([agg_cod, items]) => ({ agg_cod, items }));
        setAllowInit(_items.filter(v => v.ofabrico_status === 3).length >= 1 ? false : true);
        setItems(_groupArray);

        submitting.end();
    }

    // const onChange = async (item, status) => {
    //     const ret = await onChangeStatus(item, status);
    //     if (ret) {
    //         loadData({ init: true });
    //     }
    // }

    return (<YScroll>

        <List
            size="small"
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item, index) => (
                <>
                    {onClick ?
                        <ListItem onClick={() => onClick(item, index, loadData, allowInit)} {...actions && { actions: actions(item, index, loadData, allowInit) }} >
                            <List.Item.Meta
                                // avatar={<div style={{ width: "90px", maxWidth: "90px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                //     <OFabricoStatus data={item} cellProps={{}} />
                                // </div>}
                                title={<TitleAgg item={item} />}
                                description={
                                    <ContentAgg item={item} />
                                }
                            />
                        </ListItem>
                        :
                        <List.Item {...actions && { actions: actions(item, index, loadData, allowInit) }}>
                            <List.Item.Meta
                                // avatar={<div style={{ width: "90px", maxWidth: "90px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                //     <OFabricoStatus data={item} cellProps={{}} />
                                // </div>}
                                title={<div>{item.agg_cod}<OFabricoStatus data={item.items[0]} cellProps={{}} /></div>}
                                description={
                                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                                        <div style={{}}>
                                            {item.items.map(v => {
                                                return (
                                                    <div key={v.ofid}>
                                                        <div style={{ fontWeight: 900, fontSize: "14px", color: "#000" }}>{v.ofid}</div>
                                                        <div style={{ fontSize: "14px", color: "#000" }}>{v.cliente_nome}</div>
                                                        <div><span>{v.item_cod}</span><span style={{ marginLeft: "10px" }}>{v.artigo_des?.replace(new RegExp(`Nonwoven Elastic Bands |Nonwoven Elastic Band |NW Elastic Bands `, "gi"), "")}</span></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {actionsContent && <Space wrap={false} style={{ whiteSpace: "nowrap" }}>{actionsContent(item, index, loadData, allowInit)}</Space>}
                                    </div>
                                }
                            />
                        </List.Item>}
                </>)}
        />

    </YScroll >);
}