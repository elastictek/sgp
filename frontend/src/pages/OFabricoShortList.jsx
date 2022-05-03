import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { fetch, fetchPost, cancelToken, fetchPostBlob } from "utils/fetch";
import { isValue } from 'utils';
import { useDataAPI } from "utils/useDataAPI";
import Table, { setColumns } from "components/table";
import { Typography, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge } from "antd";
import { TitleForm } from "components/formLayout";
import Icon, { LoadingOutlined, UnorderedListOutlined, SyncOutlined } from "@ant-design/icons";
import TagButton from "components/TagButton";
const ButtonGroup = Button.Group;
import { API_URL, SCREENSIZE_OPTIMIZED } from 'config';
import YScroll from "components/YScroll";
import ResponsiveModal from "components/ResponsiveModal";
const { Title } = Typography;

const FormFormulacao = React.lazy(() => import('./currentline/FormFormulacaoUpsert'));

const loadCurrentSettings = async (aggId, token) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/currentsettingsget/`, filter: { aggId }, sort: [], cancelToken: token });
    return rows;
}

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
                {parameters?.parameters && <>
                    <Suspense fallback={<></>}><FormFormulacao setFormTitle={setFormTitle} record={parameters?.parameters} forInput={parameters?.parameters.forInput} parentRef={iref} closeParent={setVisible} /></Suspense>
                </>
                }
            </YScroll>
        </ResponsiveModal>
    );

}

const ColumnEstado = ({ record, feature, onModalVisible }) => {
    const { status, temp_ofabrico, temp_ofabrico_agg } = record;

    const onClick = async () => {
        const raw = await loadCurrentSettings(temp_ofabrico_agg);
        const fData = { id: raw[0].id, formulacao: JSON.parse(raw[0].formulacao), feature, forInput: ((feature == "dosers_change") ? false : true) }
        onModalVisible(null, fData);
    }

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {(status == 2 && temp_ofabrico) && <>
                <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<UnorderedListOutlined />} color="orange">Na Produção</TagButton>
            </>}
            {status == 3 && <>
                <TagButton onClick={onClick} style={{ width: "110px", textAlign: "center" }} icon={<SyncOutlined spin />} color="success">Em Produção</TagButton>
            </>}
        </div>
    );
}

export default ({ feature }) => {
    const [loading, setLoading] = useState(false);
    const [modalParameters, setModalParameters] = useState({ visible: false });
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/ofabricolist/`, parameters: {}, pagination: { enabled: false }, filter: { fofstatus: "IN(2,3)" }, sort: [] } });

    useEffect(() => {
        const cancelFetch = cancelToken();
        //dataAPI.first();
        dataAPI.fetchPost({ token: cancelFetch });
        return (() => cancelFetch.cancel());
    }, []);

    const selectionRowKey = (record) => {
        return `${record.ofabrico}-${isValue(record.item, undefined)}-${isValue(record.iorder, undefined)}`;
    }

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "ofshortlist",
            include: {
                ...((common) => (
                    {
                        ofabrico: { title: "Ordem Fabrico", width: 130, fixed: 'left', render: (v, r) => v, ...common },
                        prf: { title: "PRF", width: 130, render: v => <b>{v}</b>, ...common },
                        estado: { title: "", width: 125, render: (v, r) => <ColumnEstado record={r} feature={feature} onModalVisible={onModalVisible} />, ...common },
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
                    header={false}
                    stripRows
                    darkHeader
                    size="small"
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