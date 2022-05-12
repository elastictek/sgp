import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import ColorHash from 'color-hash';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { isValue } from 'utils';
import { useDataAPI } from "utils/useDataAPI";
import Table, { setColumns } from "components/table";
import { Typography, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge, Form } from "antd";
import { TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AutoCompleteField } from "components/formLayout";
import { getSchema } from "utils/schemaValidator";
import Icon, { LoadingOutlined, UnorderedListOutlined, SyncOutlined, SearchOutlined } from "@ant-design/icons";
import TagButton from "components/TagButton";
const ButtonGroup = Button.Group;
import { API_URL, SCREENSIZE_OPTIMIZED, DATETIME_FORMAT } from 'config';
import YScroll from "components/YScroll";
import ResponsiveModal from "components/ResponsiveModal";
const { Title } = Typography;
/* const FormFormulacao = React.lazy(() => import('./currentline/FormFormulacaoUpsert')); */
const colorHash = new ColorHash();

const useStyles = createUseStyles({
    error: {
        backgroundColor: '#ffa39e'
    }
});

const Wnd = ({ parameters, setVisible }) => {
    const [formTitle, setFormTitle] = useState({});
    const iref = useRef();
    return (
        <ResponsiveModal
            title={<TitleForm title={formTitle.title} subTitle={formTitle.subTitle} />}
            visible={parameters.visible}
            centered
            responsive
            onCancel={setVisible}
            maskClosable={true}
            destroyOnClose={true}
            fullWidthDevice={parameters.fullWidthDevice}
            width={parameters?.width}
            height={parameters?.height}
            bodyStyle={{ /* backgroundColor: "#f0f0f0" */ }}
            footer={<div ref={iref} id="form-wrapper" style={{ textAlign: 'right' }}></div>}
        >
            <YScroll>
                {/* {parameters?.parameters && <>
                    {(parameters.parameters.feature.endsWith("_change")) &&
                        <Suspense fallback={<></>}><FormFormulacao setFormTitle={setFormTitle} record={parameters?.parameters} forInput={parameters?.parameters.forInput} parentRef={iref} closeParent={setVisible} /></Suspense>
                    }
                    {(parameters.parameters.feature === "lotes_stock") &&
                        <Suspense fallback={<></>}></Suspense>
                    }
                </>
                } */}
            </YScroll>
        </ResponsiveModal>
    );

}

const Quantity = ({ v, unit = "kg" }) => {
    return (<div style={{ display: "flex", flexDirection: "row" }}>{v !== null && <><div style={{ width: "80%", textAlign: "right" }}>{parseFloat(v).toFixed(2)}</div><div style={{ width: "20%", marginLeft: "2px" }}>{unit}</div></>}</div>);

}

export default ({ data }) => {
    const [loading, setLoading] = useState(false);
    const classes = useStyles()
    const [formFilter] = Form.useForm();
    const [modalParameters, setModalParameters] = useState({ visible: false });
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/fixsimulatorlist/`, parameters: {}, pagination: { enabled: false }, filter: { ig_id: data.ig_id }, sort: [] } });

    useEffect(() => {
        const cancelFetch = cancelToken();
        //dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, []);

    const selectionRowKey = (record) => {
        return `${record.id}--${isValue(record.lote_id, undefined)}`;
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "ofshortlist",
            include: {
                ...((common) => (
                    {
                        cuba: { title: "", width: 40, fixed: "left", render: (v, r) => r?.group_id && <div style={{ background: colorHash.hex(r.group_id), width: "100%" }}>&nbsp;</div>, ...common },
                        doser: { title: "", width: 50, fixed: "left", render: (v, r) => <b>{v}</b>, ...common },
                        artigo_cod: { title: "Artigo", width: 130, fixed: "left", render: v => v, ...common },
                        n_lote: { title: "Lote", width: 130, fixed: "left", render: v => v, ...common },
                        t_stamp: { title: "Data", width: 120, render: (v, r) => dayjs(r.t_stamp).format(DATETIME_FORMAT), ...common },
                        qty_lote: { title: <div style={{ whiteSpace: "break-spaces" }}>Qtd. Lote</div>, width: 130, render: (v, r) => <Quantity v={v} />, ...common },
                        qty_lote_consumed: { title: <div style={{ whiteSpace: "break-spaces" }}>Qtd. Lote Consumido</div>, align: 'center', width: 130, render: (v, r) => <Quantity v={v} />, ...common },
                        qty_artigo_consumed: { title: <div style={{ whiteSpace: "break-spaces" }}>Qtd. Artigo Consumido</div>, align: 'center', width: 130, render: (v, r) => <Quantity v={v} />, ...common },
                        qty_to_consume: { title: <div style={{ whiteSpace: "break-spaces" }}>Qtd. a Consumir</div>, align: 'center', width: 130, render: (v, r) => <Quantity v={v} />, ...common },
                        qty_consumed: { title: <div style={{ whiteSpace: "break-spaces" }}>Qtd. Consumida</div>, align: 'center', width: 130, render: (v, r) => <Quantity v={v} />, ...common },
                        lacks_consume: { title: <div style={{ whiteSpace: "break-spaces" }}>Falta Consumir</div>, align: 'center', width: 130, render: (v, r) => <Quantity v={v} />, ...common },
                    }
                ))({ idx: 1, optional: false })
            },
            exclude: []
        }
    );

    const onModalVisible = (e, parameters) => {
        if (!parameters) {
            setModalParameters(prev => ({ visible: false }));
        } else {
            setModalParameters(prev => ({ visible: !prev.visible, width: "900px", height: "750px", fullWidthDevice: 3, parameters }));
        }
    }

    return (
        <>
            <Wnd parameters={modalParameters} setVisible={onModalVisible} />
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} style={{ top: "50%", left: "50%", position: "absolute" }} >
                <Table
                    columnChooser={false}
                    reload
                    stripRows={false}
                    clearSort={false}
                    darkHeader
                    size="small"
                    rowClassName={(record) => (parseFloat(record.lacks_consume).toFixed(2) > 0) && `data-row ${classes.error}`}
                    selection={{ enabled: false, rowKey: record => selectionRowKey(record) }}
                    paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                    dataAPI={dataAPI}
                    columns={columns}
                    onFetch={dataAPI.fetchPost}
                    scroll={{ x: 300, scrollToFirstRowOnChange: true }}
                />
            </Spin>
        </>
    )
}