import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace, InputAddon, SelectDebounceField } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import ResultMessage from 'components/resultMessage';
import Portal from "components/portal";
import Toolbar from "components/toolbar";
import YScroll from "components/YScroll";
import { Input, Space, Form, Button, InputNumber, DatePicker, Select, Spin, Transfer, Tag } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import Table, { setColumns } from "components/table";
import { useDataAPI } from "utils/useDataAPI";
import { RightOutlined, LeftOutlined, LoadingOutlined, SwapOutlined } from '@ant-design/icons';

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const setId = (id) => {
    if (id) {
        return { key: "update", values: { id } };
    }
    return { key: "insert", values: {} };
}

const loadPaletesStockLookup = async (of_id) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/paletesstocklookup/`, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: { of_id } });
    return rows;
}



/* <Table
    rowSelection={rowSelection}
    columns={columns}
    dataSource={filteredItems}
    size="small"
    rowKey="nome"
    style={{ pointerEvents: listDisabled ? 'none' : null }}
    onRow={({ key, disabled: itemDisabled }) => ({
        onClick: () => {
            if (itemDisabled || listDisabled) return;
            onItemSelect(key, !listSelectedKeys.includes(key));
        },
    })}
/> */


const TableTransfer = ({ aggItem, leftColumns, rightColumns, leftDataAPI, rightDataAPI, setResultMessage, ...props }) => {
    const { tempof_id: id, qty_encomenda } = aggItem;
    const [leftSelectedRows, setLeftSelectedRows] = useState([]);
    const [rightSelectedRows, setRightSelectedRows] = useState([]);
    const [selectedTotais, setSelectedTotais] = useState({ left: { st: 0, stm2: 0, total: 0, totalm2: 0 }, right: { st: 0, stm2: 0, total: 0, totalm2: 0, vTotal: 0, vTotalm2: 0 } });

    useEffect(() => {
        if (!(leftDataAPI.isLoading() && rightDataAPI.isLoading())) {
            const totalm2 = rightDataAPI.getData().rows.reduce((a, b) => a + (b["area"] || 0), 0);
            setSelectedTotais(prev => ({
                left: { st: 0, stm2: 0, total: 0, totalm2: 0 },
                right: { st: 0, stm2: 0, vTotal: rightDataAPI.getData().total, vTotalm2: totalm2, total: rightDataAPI.getData().total, totalm2 }
            }));
        }
    }, [(leftDataAPI.isLoading() && rightDataAPI.isLoading())]);


    const addRemove = async () => {
        const response = await fetchPost({ url: `${API_URL}/savepaletesstock/`, parameters: { id, left: leftSelectedRows, right: rightSelectedRows } });
        if (response.data.status !== "error") {
            const cancelFetch = cancelToken();
            setLeftSelectedRows([]);
            leftDataAPI.fetchPost({ token: cancelFetch });
            rightDataAPI.fetchPost({ token: cancelFetch });
        } else {
            setResultMessage(response.data);
        }
    }

    const selection = (s, key, keyValue, value) => {
        if (Array.isArray(value)) {
            s[key] = { ...s[key], st: value.length, stm2: value.reduce((a, b) => a + (b["area"] || 0), 0) };
            console.log("array", s);
        } else {
            if (keyValue.length <= s[key].st) {
                //remove
                s[key] = { ...s[key], st: keyValue.length, stm2: (parseFloat(s[key].stm2) - value.area) };
            } else {
                //add
                s[key] = { ...s[key], st: keyValue.length, stm2: (parseFloat(s[key].stm2) + value.area) };
            }
        }
    }


    const onSelectionLeft = (keyValue, value) => {
        const s = { ...selectedTotais };
        selection(s, "left", keyValue, value);
        s.right.vTotal = s.right.total - s.right.st + s.left.st;
        s.right.vTotalm2 = s.right.totalm2 - s.right.stm2 + s.left.stm2;
        setSelectedTotais(s);
    }

    const onSelectionRight = (keyValue, value) => {
        const s = { ...selectedTotais };
        selection(s, "right", keyValue, value);
        s.right.vTotal = s.right.total - s.right.st + s.left.st;
        s.right.vTotalm2 = s.right.totalm2 - s.right.stm2 + s.left.stm2;
        setSelectedTotais(s);
    }




    return (
        <>

            <div>
                <Toolbar
                    style={{ width: "100%" }}
                    left={
                        <div>Encomenda <b>{aggItem.qty_encomenda} m&#178;</b></div>
                    }
                    right={<div>
                        <div><b>{selectedTotais.right.total}</b> Paletes Adicionadas</div>
                        <div style={{ color: qty_encomenda <= selectedTotais.right.vTotalm2 ? "#389e0d" : "#000" }}><b>{selectedTotais.right.totalm2.toFixed(2)} m&#178;</b></div>
                    </div>}
                />
            </div>



            <div style={{ display: "flex", flexDirection: "row"/* , alignItems: "center" */ }}>
                <div style={{ width: "45%" }}>
                    <div>
                        <div>Paletes em Stock (<b>{selectedTotais.left.st}</b> selecionadas)</div>
                        <div><b>{selectedTotais.left.stm2.toFixed(2)} m&#178;</b></div>
                    </div>
                    <Table
                        columnChooser={false}
                        reload={false}
                        clearSort={false}
                        stripRows
                        darkHeader={false}
                        size="small"
                        selection={{ enabled: true, rowKey: "id", onSelection: onSelectionLeft, multiple: true, selectedRows: leftSelectedRows, setSelectedRows: setLeftSelectedRows }}
                        paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }}
                        dataAPI={leftDataAPI}
                        columns={leftColumns}
                        onFetch={leftDataAPI.fetchPost}
                    //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}
                    />
                </div>
                <div style={{ width: "5%", textAlign: "center", alignSelf: "center" }}><Button type='primary' onClick={addRemove} size="small" icon={<SwapOutlined />} /></div>
                <div style={{ width: "45%" }}>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        {/*                         <div style={{ width: "50%" }}>
                            <div><b>{selectedTotais.right.total}</b> Paletes Adicionadas</div>
                            <div style={{ color: qty_encomenda <= selectedTotais.right.vTotalm2 ? "#389e0d" : "#000" }}><b>{selectedTotais.right.totalm2.toFixed(2)} m&#178;</b></div>
                        </div> */}
                        <div style={{ width: "50%" }}>
                            <div>Total Virtual <b>{selectedTotais.right.vTotal}</b> Paletes</div>
                            <div style={{ color: qty_encomenda <= selectedTotais.right.vTotalm2 ? "#389e0d" : "#000" }}><b>{selectedTotais.right.vTotalm2.toFixed(2)} m&#178;</b></div>
                        </div>
                    </div>
                    <Table
                        columnChooser={false}
                        reload={false}
                        clearSort={false}
                        stripRows
                        darkHeader={false}
                        size="small"
                        selection={{ enabled: true, rowKey: "id", onSelection: onSelectionRight, multiple: true, selectedRows: rightSelectedRows, setSelectedRows: setRightSelectedRows }}
                        /* paginationProps={{ pageSizeOptions: [10, 15, 20, 30] }} */
                        dataAPI={rightDataAPI}
                        columns={rightColumns}
                        onFetch={rightDataAPI.fetchPost}
                        scroll={{ y: 465, scrollToFirstRowOnChange: true }}
                        /* style={{ maxHeight: "465px", overflowY: "auto" }} */
                    //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}
                    />
                </div>
            </div>
        </>

    );
}


export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const { aggItem } = record;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [changedValues, setChangedValues] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [operation, setOperation] = useState(setId(aggItem.of_id));
    const [resultMessage, setResultMessage] = useState({ status: "none" });
    const leftDataAPI = useDataAPI({ payload: { url: `${API_URL}/paletesstocklookup/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 15 }, filter: { item_id: aggItem.item_id }, sort: [] } });
    const rightDataAPI = useDataAPI({ payload: { url: `${API_URL}/paletesstockget/`, parameters: {}, pagination: { enabled: false }, filter: { of_id: aggItem.tempof_id }, sort: [] } });

    const init = () => {
        const cancelFetch = cancelToken();
        (async () => {
            (setFormTitle) && setFormTitle({ title: `Paletes em Stock ${aggItem.item_cod}`, subTitle: `${aggItem.cliente_nome}` });
            leftDataAPI.first();
            leftDataAPI.fetchPost({ token: cancelFetch });
            rightDataAPI.first();
            rightDataAPI.fetchPost({ token: cancelFetch });
            setLoading(false);
        })();
    }

    const columns = {
        ...((common) => (
            {
                nome: { title: "Palete", width: 100, render: v => (<div style={{ fontSize: "12px", fontWeight: 700 }}>{v}</div>), ...common },
                largura_bobines: { title: "Larg.", width: 60, render: v => (<div style={{ fontSize: "10px" }}>{v} mm</div>), ...common },
                core_bobines: { title: "Core", width: 60, render: v => (<div style={{ fontSize: "10px" }}>{v}''</div>), ...common },
                area: { title: "Área", width: 80, render: v => (<div style={{ fontSize: "10px" }}>{v} m&#178;</div>), ...common },
                comp_total: { title: "Comp.", width: 60, render: v => (<div style={{ fontSize: "10px" }}>{v} m</div>), ...common }
            }
        ))({ idx: 1, optional: false, sort: false })
    };

    const leftColumns = setColumns(
        {
            dataAPI: leftDataAPI,
            data: leftDataAPI.getData().rows,
            uuid: "leftPaletesStock",
            include: columns,
            exclude: []
        }
    );
    const rightColumns = setColumns(
        {
            dataAPI: rightDataAPI,
            data: rightDataAPI.getData().rows,
            uuid: "rightPaletesStock",
            include: columns,
            exclude: []
        }
    );



    useEffect(() => {
        init(true);
    }, []);

    const onErrorOK = () => {
        setResultMessage({ status: "none" });
    }

    const onClose = (reload = false) => {
        closeParent();
    }

    return (
        <>
            <ResultMessage
                result={resultMessage}
                errorButtonOK={<Button type="primary" key="goto-ok" onClick={onErrorOK}>OK</Button>}
                errorButtonClose={<Button key="goto-close" onClick={onClose}>Fechar</Button>}
            >
                <Spin spinning={(leftDataAPI.isLoading() || rightDataAPI.isLoading())} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                    {(leftDataAPI.hasData() && rightDataAPI.hasData()) &&
                        <TableTransfer
                            aggItem={aggItem}
                            leftColumns={leftColumns}
                            rightColumns={rightColumns}
                            leftDataAPI={leftDataAPI}
                            rightDataAPI={rightDataAPI}
                            setResultMessage={setResultMessage}
                        />
                    }
                </Spin>

                {parentRef && <Portal elId={parentRef.current}>
                    <Space>
                        <Button type="primary" onClick={() => form.submit()}>Guardar</Button>
                        <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button>
                    </Space>
                </Portal>
                }
            </ResultMessage>
        </>
    );
}