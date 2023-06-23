import React, { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import classNames from "classnames";
import Joi from 'joi';
import moment from 'moment';
import { useImmer } from 'use-immer';
import { fetch, fetchPost } from "utils/fetch";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import { useDataAPI } from "utils/useDataAPI";
import { usePermission, Permissions } from "utils/usePermission";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { useNavigate, useLocation } from "react-router-dom";
import Portal from "components/portal";
import IconButton from "components/iconButton";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Typography, Modal, Checkbox, Tag, Badge, Alert, DatePicker, TimePicker, Divider, Drawer, Select, Menu } from "antd";
const { TextArea } = Input;
import { PlusOutlined, MoreOutlined, EditOutlined, ReadOutlined, PrinterOutlined, LockOutlined, CopyOutlined, SearchOutlined } from '@ant-design/icons';
import { CgCloseO } from 'react-icons/cg';
import Table from 'components/TableV2';
import { API_URL, DATE_FORMAT, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, SelectMultiField, Selector, Label, SwitchField } from 'components/FormFields';
import { Status, toolbarFilters, postProcess, processFilters } from "./commons";
import YScroll from 'components/YScroll';
import ToolbarTitle from 'components/ToolbarTitle';
import { DateTimeEditor, InputNumberEditor, ModalObsEditor, SelectDebounceEditor, ModalRangeEditor, useEditorStyles, DestinoEditor, ItemsField, MultiLine, CheckColumn, FieldEstadoEditor, FieldDefeitosEditor, FieldDefeitos } from 'components/tableEditors';
import FormPrint from '../commons/FormPrint';
import OF from '../commons/OF';
import Palete from '../paletes/Palete';

const title = "";

const useStyles = createUseStyles({
    l1: {
        backgroundColor: "#fffbe6"
    },
    l1_start: {
        backgroundColor: "#fffbe6",
        borderLeft: "solid 3px #000"
    },
    l1_end: {
        backgroundColor: "#fffbe6",
        borderRight: "solid 3px #000"
    },
    l2: {
        backgroundColor: "#fff1b8"
    },
    l2_start: {
        backgroundColor: "#fff1b8",
        borderLeft: "solid 3px #000"
    },
    l2_end: {
        backgroundColor: "#fff1b8",
        borderRight: "solid 3px #000"
    },
    l3: {
        backgroundColor: "#ffe58f"
    },
    l3_start: {
        backgroundColor: "#ffe58f",
        borderLeft: "solid 3px #000"
    },
    l3_end: {
        backgroundColor: "#ffe58f",
        borderRight: "solid 3px #000"
    },
    l4: {
        backgroundColor: "#ffd666"
    },
    l4_start: {
        backgroundColor: "#ffd666",
        borderLeft: "solid 3px #000"
    },
    l4_end: {
        backgroundColor: "#ffd666",
        borderRight: "solid 3px #000"
    },
    l5: {
        backgroundColor: "#ffc53d"
    },
    l5_start: {
        backgroundColor: "#ffc53d",
        borderLeft: "solid 3px #000"
    },
    l5_end: {
        backgroundColor: "#ffc53d",
        borderRight: "solid 3px #000"
    },
});

const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, ...props }) => {
    return (<>
        <Col xs='content'>
            <Field name="fbobine" label={{ enabled: true, text: "Bobine", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="fpalete" label={{ enabled: true, text: "Palete", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="flevel" label={{ enabled: true, text: "Nível", pos: "top", padding: "0px" }}>
                <SelectField allowClear size='small' options={[{ value: 0, label: "0" }, { value: 1, label: "1" }, { value: 2, label: "2" }, { value: 3, label: "3" }, { value: 4, label: "4" }, { value: 5, label: "5" }]} />
            </Field>
        </Col>
    </>
    );
}

const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [];

const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [];
    return (<>{items.length > 0 && <Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />}</>);
}

export default ({ noPrint = true, noEdit = true, ...props }) => {
    const submitting = useSubmitting(true);
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useEditorStyles();
    const clsLevel = useStyles();
    const [formFilter] = Form.useForm();
    const permission = usePermission({});
    const [modeEdit, setModeEdit] = useState({ datagrid: false });
    const [parameters, setParameters] = useState();
    const [checkData, setCheckData] = useImmer({ destino: false });
    const defaultParameters = { method: "BobinesOriginaisList" };
    const [defaultFilters, setDefaultFilters] = useState({});
    const defaultSort = [/* { column: 'posicao_palete', direction: 'ASC' } */];
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/bobines/sql/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, sort: [] } });
    const primaryKeys = ['rowid'];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "print": return <FormPrint v={{ ...modalParameters }} />;
                case "palete": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    const editable = (row, col) => {
        if (modeEdit.datagrid && permission.isOk({ action: "changeDestino" }) && !props?.parameters?.palete?.carga_id && !props?.parameters?.palete?.SDHNUM_0 && props?.parameters?.palete?.nome.startsWith('D')) {
            return (col === "destino") ? true : false;
        }
        return false;
    }
    const editableClass = (row, col) => {
        if (modeEdit.datagrid && permission.isOk({ action: "changeDestino" }) && !props?.parameters?.palete?.carga_id && !props?.parameters?.palete?.SDHNUM_0 && props?.parameters?.palete?.nome.startsWith('D')) {
            return (col === "destino") ? classes.edit : undefined;
        }
    }

    const onCheckChange = (key, value) => { setCheckData(draft => { draft[key] = value.target.checked; }); }

    const cellClass = (row, k, t) => {
        if (k === 1) {
            if (t === 's') { return clsLevel.l1_start; }
            if (t === 'e') { return clsLevel.l1_end; }
            return clsLevel.l1;
        } else if (k === 2) {
            if (t === 's') { return clsLevel.l2_start; }
            if (t === 'e') { return clsLevel.l2_end; }
            return clsLevel.l2;
        } else if (k === 3) {
            if (t === 's') { return clsLevel.l3_start; }
            if (t === 'e') { return clsLevel.l3_end; }
            return clsLevel.l3;
        } else if (k === 4) {
            if (t === 's') { return clsLevel.l4_start; }
            if (t === 'e') { return clsLevel.l4_end; }
            return clsLevel.l4;
        } else if (k === 5) {
            if (t === 's') { return clsLevel.l5_start; }
            if (t === 'e') { return clsLevel.l5_end; }
            return clsLevel.l5;
        }
        return undefined;
    }


    const columns = [
        { key: 'root', sortable: false, name: 'Raíz', width: 135, frozen: true, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.root}</Button> },
        { key: 'bobine0', sortable: false, name: 'Bobine', width: 135, frozen: true, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.bobine0}</Button> },
        { key: 'nretrabalhos', name: 'Retrabalhos', width: 100, formatter: p => p.row.nretrabalhos },
        { key: 'comp0', sortable: false, name: 'Comprimento', width: 100, formatter: p => p.row?.comp0 && <div style={{ textAlign: "right" }}>{p.row.comp0} m</div> },
        { key: 'largura0', sortable: false, name: 'Largura', width: 90, formatter: p => p.row?.largura0 && <div style={{ textAlign: "right" }}>{p.row.largura0} mm</div> },
        { key: 'palete0', sortable: false, name: 'Palete', width: 130, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onPaleteClick(p.row, 0)}>{p.row.palete0}</Button> },
        { key: 'estado0', sortable: false, name: 'Estado', minWidth: 85, width: 85, formatter: (p) => p.row.estado0 && <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status column='estado0' larguraColumn='largura0' b={p.row} /></div> },

        { key: 'original_lvl1', sortable: false, name: 'L1 Bobine', cellClass: (row) => cellClass(row, 1, 's'), width: 135, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.original_lvl1}</Button> },
        { key: 'comp1_original', sortable: false, name: 'L1 Comp. Orig.', cellClass: (row) => cellClass(row, 1), width: 100, formatter: p => p.row?.comp1_original && <div style={{ textAlign: "right" }}>{p.row.comp1_original} m</div> },
        { key: 'comp1_atual', sortable: false, name: 'L1 Comp. Atual', cellClass: (row) => cellClass(row, 1), width: 100, formatter: p => p.row?.comp1_atual && <div style={{ textAlign: "right" }}>{p.row.comp1_atual} m</div> },
        { key: 'metros_cons', sortable: false, name: 'L1 Metros Consumidos', cellClass: (row) => cellClass(row, 1), width: 100, formatter: p => p.row?.metros_cons && <div style={{ textAlign: "right" }}>{p.row.metros_cons} m</div> },
        { key: 'largura1', sortable: false, name: 'L1 Largura', cellClass: (row) => cellClass(row, 1), width: 90, formatter: p => p.row?.largura1 && <div style={{ textAlign: "right" }}>{p.row.largura1} mm</div> },
        { key: 'palete1', sortable: false, name: 'L1 Palete', cellClass: (row) => cellClass(row, 1), width: 135, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onPaleteClick(p.row, 1)}>{p.row.palete1}</Button> },
        { key: 'estado1', sortable: false, name: 'L1 Estado', cellClass: (row) => cellClass(row, 1, 'e'), minWidth: 85, width: 85, formatter: (p) => p.row.estado1 && <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status column='estado1' larguraColumn='largura1' b={p.row} /></div> },

        { key: 'original_lvl2', sortable: false, name: 'L2 Bobine', cellClass: (row) => cellClass(row, 2), width: 135, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.original_lvl2}</Button> },
        { key: 'comp2_original', sortable: false, name: 'L2 Comp.', cellClass: (row) => cellClass(row, 2), width: 100, formatter: p => p.row?.comp2_original && <div style={{ textAlign: "right" }}>{p.row.comp2_original} m</div> },
        { key: 'comp2_atual', sortable: false, name: 'L2 Comp. Atual', cellClass: (row) => cellClass(row, 2), width: 100, formatter: p => p.row?.comp2_atual && <div style={{ textAlign: "right" }}>{p.row.comp2_atual} m</div> },
        { key: 'metros_cons_lvl1', sortable: false, name: 'L2 Metros Consumidos', cellClass: (row) => cellClass(row, 2), width: 100, formatter: p => p.row?.metros_cons_lvl1 && <div style={{ textAlign: "right" }}>{p.row.metros_cons_lvl1} m</div> },
        { key: 'largura2', sortable: false, name: 'L2 Largura', cellClass: (row) => cellClass(row, 2), width: 90, formatter: p => p.row?.largura2 && <div style={{ textAlign: "right" }}>{p.row.largura2} mm</div> },
        { key: 'palete2', sortable: false, name: 'L2 Palete', cellClass: (row) => cellClass(row, 2), width: 135, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onPaleteClick(p.row, 2)}>{p.row.palete2}</Button> },
        { key: 'estado2', sortable: false, name: 'L2 Estado', cellClass: (row) => cellClass(row, 2, 'e'), minWidth: 85, width: 85, formatter: (p) => p.row.estado2 && <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status column='estado2' larguraColumn='largura2' b={p.row} /></div> },

        { key: 'original_lvl3', sortable: false, name: 'L3 Bobine', cellClass: (row) => cellClass(row, 3), width: 135, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.original_lvl3}</Button> },
        { key: 'comp3_original', sortable: false, name: 'L3 Comp.', cellClass: (row) => cellClass(row, 3), width: 100, formatter: p => p.row?.comp3_original && <div style={{ textAlign: "right" }}>{p.row.comp3_original} m</div> },
        { key: 'comp3_atual', sortable: false, name: 'L3 Comp. Atual', cellClass: (row) => cellClass(row, 3), width: 100, formatter: p => p.row?.comp3_atual && <div style={{ textAlign: "right" }}>{p.row.comp3_atual} m</div> },
        { key: 'metros_cons_lvl2', sortable: false, name: 'L3 Metros Consumidos', cellClass: (row) => cellClass(row, 3), width: 100, formatter: p => p.row?.metros_cons_lvl2 && <div style={{ textAlign: "right" }}>{p.row.metros_cons_lvl2} m</div> },
        { key: 'largura3', sortable: false, name: 'L3 Largura', cellClass: (row) => cellClass(row, 3), width: 90, formatter: p => p.row?.largura3 && <div style={{ textAlign: "right" }}>{p.row.largura3} mm</div> },
        { key: 'palete3', sortable: false, name: 'L3 Palete', cellClass: (row) => cellClass(row, 3), width: 135, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onPaleteClick(p.row, 3)}>{p.row.palete3}</Button> },
        { key: 'estado3', sortable: false, name: 'L3 Estado', cellClass: (row) => cellClass(row, 3, 'e'), minWidth: 85, width: 85, formatter: (p) => p.row.estado3 && <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status column='estado3' larguraColumn='largura3' b={p.row} /></div> },

        { key: 'original_lvl4', sortable: false, name: 'L4 Bobine', cellClass: (row) => cellClass(row, 4), width: 135, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.original_lvl4}</Button> },
        { key: 'comp4_original', sortable: false, name: 'L4 Comp.', cellClass: (row) => cellClass(row, 4), width: 100, formatter: p => p.row?.comp4_original && <div style={{ textAlign: "right" }}>{p.row.comp4_original} m</div> },
        { key: 'comp4_atual', sortable: false, name: 'L4 Comp. Atual', cellClass: (row) => cellClass(row, 4), width: 100, formatter: p => p.row?.comp4_atual && <div style={{ textAlign: "right" }}>{p.row.comp4_atual} m</div> },
        { key: 'metros_cons_lvl3', sortable: false, name: 'L4 Metros Consumidos', cellClass: (row) => cellClass(row, 4), width: 100, formatter: p => p.row?.metros_cons_lvl3 && <div style={{ textAlign: "right" }}>{p.row.metros_cons_lvl3} m</div> },
        { key: 'largura4', sortable: false, name: 'L4 Largura', cellClass: (row) => cellClass(row, 4), width: 90, formatter: p => p.row?.largura4 && <div style={{ textAlign: "right" }}>{p.row.largura4} mm</div> },
        { key: 'palete4', sortable: false, name: 'L4 Palete', cellClass: (row) => cellClass(row, 4), width: 135, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onPaleteClick(p.row, 4)}>{p.row.palete4}</Button> },
        { key: 'estado4', sortable: false, name: 'L4 Estado', cellClass: (row) => cellClass(row, 4, 'e'), minWidth: 85, width: 85, formatter: (p) => p.row.estado4 && <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status column='estado4' larguraColumn='largura4' b={p.row} /></div> },

        { key: 'original_lvl5', sortable: false, name: 'L5 Bobine', cellClass: (row) => cellClass(row, 5), width: 135, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.original_lvl5}</Button> },
        { key: 'comp5_original', sortable: false, name: 'L5 Comp.', cellClass: (row) => cellClass(row, 5), width: 100, formatter: p => p.row?.comp5_original && <div style={{ textAlign: "right" }}>{p.row.comp5_original} m</div> },
        { key: 'comp5_atual', sortable: false, name: 'L5 Comp. Atual', cellClass: (row) => cellClass(row, 5), width: 100, formatter: p => p.row?.comp5_atual && <div style={{ textAlign: "right" }}>{p.row.comp5_atual} m</div> },
        { key: 'metros_cons_lvl4', sortable: false, name: 'L5 Metros Consumidos', cellClass: (row) => cellClass(row, 5), width: 100, formatter: p => p.row?.metros_cons_lvl4 && <div style={{ textAlign: "right" }}>{p.row.metros_cons_lvl4} m</div> },
        { key: 'largura5', sortable: false, name: 'L5 Largura', cellClass: (row) => cellClass(row, 5), width: 90, formatter: p => p.row?.largura5 && <div style={{ textAlign: "right" }}>{p.row.largura5} mm</div> },
        { key: 'palete5', sortable: false, name: 'L5 Palete', cellClass: (row) => cellClass(row, 5), width: 135, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onPaleteClick(p.row, 5)}>{p.row.palete5}</Button> },
        { key: 'estado5', sortable: false, name: 'L5 Estado', cellClass: (row) => cellClass(row, 5, 'e'), minWidth: 85, width: 85, formatter: (p) => p.row.estado5 && <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status column='estado5' larguraColumn='largura5' b={p.row} /></div> },


        // { key: 'posicao_palete', sortable: false, name: 'Pos. Palete', width: 90, formatter: p => p.row.posicao_palete },
        // { key: 'estado', sortable: false, name: 'Estado', minWidth: 85, width: 85, formatter: (p) => <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status b={p.row} /></div> },
        // { key: 'comp_actual', sortable: false, name: 'Comp. Atual', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_actual} m</div> },
        // { key: 'comp', sortable: false, name: 'Comp. Original', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp} m</div> },
        // { key: 'area', sortable: false, name: 'Área', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.area} m&sup2;</div> },
        // { key: 'lar', sortable: false, name: 'Largura', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.lar} mm</div> },
        // { key: 'core', sortable: false, name: 'Core', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.core} ''</div> },
        // { key: 'nwinf', name: 'Nw Inf.', width: 100, formatter: p => p.row?.nwinf && <div style={{ textAlign: "right" }}>{p.row.nwinf} m</div> },
        // { key: 'nwsup', name: 'Nw Sup.', width: 100, formatter: p => p.row?.nwsup && <div style={{ textAlign: "right" }}>{p.row.nwsup} m</div> },
        // { key: 'tiponwinf', name: 'Tipo NW Inferior', width: 300, sortable: true },
        // { key: 'tiponwsup', name: 'Tipo NW Superior', width: 300, sortable: true },
        // { key: 'lotenwinf', name: 'Lote NW Inferior', width: 150, sortable: true },
        // { key: 'lotenwsup', name: 'Lote NW Superior', width: 150, sortable: true },
        // { key: 'ofid', name: 'Ordem Fabrico', width: 130, formatter: p => <OF id={p.row.ordem_id} ofid={p.row.ofid} /> },
    ];


    const onDestinoConfirm = async (p, destinos, destinoTxt, obs) => {
        const ids = dataAPI.getData().rows.map(v => v.id);
        const rowsDestinos = (checkData?.destino) ? ids : [p.row.id];
        const rowsObs = (checkData?.obs) ? ids : [p.row.id];
        const values = { destinos, destinoTxt, obs };
        const palete_id = p.row.palete_id;

        try {
            let response = await fetchPost({ url: `${API_URL}/paletes/paletessql/`, parameters: { method: "UpdateDestinos", ids, rowsDestinos, rowsObs, values }, filter: { palete_id } });
            if (response.data.status !== "error") {
                p.onClose(true);
                loadData();
            } else {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        } finally { };
    }

    const loadData = async ({ signal } = {}) => {
        const { palete, bobinagem, ..._parameters } = props?.parameters || {};
        let { palete_id, palete_nome, bobinagem_id, bobinagem_nome, ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, _parameters, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys(_parameters ? _parameters : {})]);

        setParameters({
            palete: {
                id: palete_id,
                nome: palete_nome
            },
            bobinagem: {
                id: bobinagem_id,
                nome: bobinagem_nome
            }
        })

        let { filterValues, fieldValues } = fixRangeDates([], initFilters);
        formFilter.setFieldsValue({ ...fieldValues });
        palete_id = getFilterValue(palete_id, '==')
        bobinagem_id = getFilterValue(bobinagem_id, '==')
        setDefaultFilters(prev => ({ ...prev, palete_id, bobinagem_id }));
        dataAPI.addFilters({ ...defaultFilters, ...filterValues, ...(palete_id && { palete_id,fcompactual: ">0" }), ...(bobinagem_id && { bobinagem_id }) }, true, true);
        dataAPI.setSort(defaultSort);
        dataAPI.addParameters(defaultParameters, true, true);
        dataAPI.fetchPost({ signal });
        submitting.end();
    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());

    }, []);

    const onBobineClick = (row) => {
        setModalParameters({ src: `/producao/bobine/details/${row.id}/`, title: `Bobine ${row.nome}` });
        showModal();
    }

    const onPaleteClick = (row, level) => {
        setModalParameters({ content: "palete", /* tab: lastTab, setLastTab */ type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ /* loadData: () => dataAPI.fetchPost() */ parameters: { palete: { id: row[`palete_id${level}`], nome: row[`palete${level}`] }, palete_id: row[`palete_id${level}`], palete_nome: row[`palete${level}`] } });
        showModal();
    }

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const vals = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
                const _values = {
                    ...vals,
                    fbobine: getFilterValue(vals?.fbobine, 'any'),
                    fpalete: getFilterValue(vals?.fpalete, 'any'),
                    flevel: getFilterValue(vals?.flevel, 'any')
                };
                dataAPI.addFilters(_values, true);
                dataAPI.addParameters(defaultParameters);
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (changedValues, values) => { };

    const onRowsChange = (rows, changedRows) => {
        const column = changedRows.column.key;
        const indexRow = changedRows.indexes[0];

        //dataAPI.setRows(rows);
    }

    const onPrint = () => {
        const palete = parameters.palete?.id ? parameters?.palete : null;
        const bobinagem = parameters.bobinagem?.id ? parameters?.bobinagem : null;
        const _title = palete ? `Etiquetas Bobines - Palete ${palete?.nome} ` : `Etiquetas Bobines - Bobinagem ${bobinagem?.nome} `;
        setModalParameters({ content: "print", palete, bobinagem, title: _title, width: 500, height: 280 });
        showModal();
    }

    const changeMode = () => {
        setModeEdit({ datagrid: (modeEdit.datagrid) ? false : true });
    }

    const onAction = (item, row) => {
    }

    const onSave = async (action) => {

    }


    return (
        <>
            {/* <TitleForm data={dataAPI.getAllFilter()} bobinagem={bobinagem} onChange={onFilterChange} /> */}
            <Table
                loading={submitting.state}
                actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} modeEdit={modeEdit.datagrid} />}
                frozenActionColumn
                reportTitle={parameters && `Bobines Originais da ${(parameters?.palete) ? `Palete ${parameters.palete.nome}` : `Bobinagem ${parameters.bobinagem.nome}`}`}
                loadOnInit={false}
                columns={columns}
                dataAPI={dataAPI}
                toolbar={true}
                search={true}
                moreFilters={true}
                rowSelection={false}
                primaryKeys={primaryKeys}
                editable={true}
                clearSort={false}
                rowHeight={28}
                onRowsChange={onRowsChange}
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 350, mask: true }
                }}
                leftToolbar={<Space>
                    {!noPrint && <Button icon={<PrinterOutlined />} onClick={onPrint}>Imprimir Etiquetas</Button>}
                    <Permissions permissions={props?.permission} action="editList" forInput={!noEdit}>
                        {/* {!modeEdit.datagrid && <Button disabled={submitting.state} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>} */}
                        {/* {modeEdit.datagrid && <Button disabled={submitting.state} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />} */}
                        {/*  {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={submitting.state} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>} */}
                    </Permissions>

                </Space>}
            />
        </>
    );
}