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
import { orderObjectKeys, json } from "utils/object";
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

const title = "";


const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [];
    return (<>{items.length > 0 && <Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />}</>);
}

const applyToAllRows = (rows, col, currentIndex, added, removed) => {
    return rows.map((v, i) => {
        if (i !== currentIndex) {
            let _d = v[col] || [];
            _d = _d.filter(a => !removed?.map(b => b.value).includes(a.value));
            _d = [..._d, ...added.filter(a => !_d?.map(b => b.value).includes(a.value))];
            return { ...v, [col]: _d, notValid: 1 };
        }
        return v;
    });
}
const applyRangeToAllRows = (rows, col, currentIndex, added, removed) => {
    return rows.map((v, i) => {
        if (i !== currentIndex) {
            let _d = v[col] || [];
            _d = _d.filter(a => !removed?.map(({ min, max }) => ({ min, max })).some(v => v.min === a.min && v.max === a.max));
            _d = [..._d, ...added.filter(a => !_d?.map(({ min, max }) => ({ min, max })).some(v => v.min === a.min && v.max === a.max))];
            return { ...v, [col]: _d, notValid: 1 };
        }
        return v;
    });
}
const applyValueToAllRows = (rows, col, currentIndex, value) => {
    return rows.map((v, i) => {
        if (i !== currentIndex) {
            return { ...v, [col]: value, notValid: 1 };
        }
        return v;
    });
}

export default (props) => {
    const submitting = useSubmitting(true);
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useEditorStyles();
    const [formFilter] = Form.useForm();
    const permission = usePermission({});
    const [modeEdit, setModeEdit] = useState({ datagrid: false });
    const [parameters, setParameters] = useState();
    const [checkData, setCheckData] = useImmer({ destino: false });
    const defaultParameters = {};
    const [defaultFilters, setDefaultFilters] = useState({ fcompactual: ">0" });
    const defaultSort = [{ column: 'nome', direction: 'ASC' }];
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/bobineslist/`, parameters: {}, pagination: { enabled: false, limit: 100 }, filter: {}, sort: [] } });
    const primaryKeys = ['id'];
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "print": return <FormPrint v={{ ...modalParameters }} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    const editable = (row, col) => {
        if (modeEdit.datagrid && permission.isOk({ action: "changeDefeitos" }) && !props?.parameters?.palete?.carga_id && !props?.parameters?.palete?.SDHNUM_0 && props?.parameters?.palete?.nome.startsWith('D')) {
            return (col === "generic") ? true : false;
        }
        return false;
    }
    const editableClass = (row, col) => {
        if (modeEdit.datagrid && permission.isOk({ action: "changeDefeitos" }) && !props?.parameters?.palete?.carga_id && !props?.parameters?.palete?.SDHNUM_0 && props?.parameters?.palete?.nome.startsWith('D')) {
            return (col === "generic") ? classes.edit : undefined;
        }
    }

    const onCheckChange = (key, value) => { setCheckData(draft => { draft[key] = value.target.checked; }); }

    const columns = [
        { key: 'nome', sortable: false, name: 'Bobine', width: 130, frozen: true, formatter: p => <Button size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.nome}</Button> },
        {
            key: 'estado', sortable: false, name: 'Estado', minWidth: 85, width: 85,
            headerRenderer: p => <CheckColumn id="estado" name="Estado" onChange={onCheckChange} defaultChecked={checkData?.estado} forInput={editable(p.row, 'generic')} />,
            editor: p => <FieldEstadoEditor forInput={editable(p.row, 'generic')} p={p} />,
            formatter: (p) => <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status b={p.row} /></div>,
            editorOptions: { editOnClick: true },
            cellClass: r => editableClass(r, 'generic')
        },
        { key: 'l_real', sortable: false, name: 'Largura Real', width: 90, formatter: ({ row }) => row.l_real },
        {
            key: 'fc_pos', sortable: false, width: 85,
            headerRenderer: p => <CheckColumn id="fc_pos" name="Falha Corte" onChange={onCheckChange} defaultChecked={checkData?.fc_pos} forInput={editable(p.row, 'generic')} />,
            formatter: ({ row }) => <ItemsField row={row} column="fc_pos" />,
            editor(p) { return <ModalRangeEditor type="fc" unit='mm' p={p} column="fc_pos" title="Falha de Corte" forInput={editable(p.row, 'generic')} valid={1} /> },
            editorOptions: { editOnClick: true },
            cellClass: r => editableClass(r, 'generic')
        },
        {
            key: 'ff_pos', sortable: false, width: 85,
            headerRenderer: p => <CheckColumn id="ff_pos" name="Falha de Filme" onChange={onCheckChange} defaultChecked={checkData?.ff_pos} forInput={editable(p.row, 'generic')} />,
            formatter: ({ row }) => <ItemsField row={row} column="ff_pos" />,
            editor(p) { return <ModalRangeEditor type="ff" p={p} column="ff_pos" title="Falha de Filme" forInput={editable(p.row, 'generic')} valid={1} /> },
            editorOptions: { editOnClick: true },
            cellClass: r => editableClass(r, 'generic')
        },
        {
            key: 'buracos_pos', sortable: false, width: 85,
            headerRenderer: p => <CheckColumn id="buracos_pos" name="Buracos" onChange={onCheckChange} defaultChecked={checkData?.buracos} forInput={editable(p.row, 'generic')} />,
            formatter: ({ row }) => <ItemsField row={row} column="buracos_pos" />,
            editor(p) { return <ModalRangeEditor type="buracos" p={p} column="buracos_pos" title="Buracos" forInput={editable(p.row, 'generic')} valid={1} /> },
            editorOptions: { editOnClick: true },
            cellClass: r => editableClass(r, 'generic')
        },
        {
            key: 'furos_pos', sortable: false, width: 85,
            headerRenderer: p => <CheckColumn id="furos_pos" name="Furos" onChange={onCheckChange} defaultChecked={checkData?.furos_pos} forInput={editable(p.row, 'generic')} />,
            formatter: ({ row }) => <ItemsField row={row} column="furos_pos" />,
            editor(p) { return <ModalRangeEditor p={p} type="furos" column="furos_pos" title="Furos" forInput={editable(p.row, 'generic')} valid={1} /> },
            editorOptions: { editOnClick: true },
            cellClass: r => editableClass(r, 'generic')
        },
        {
            key: 'rugas_pos', sortable: false, width: 85,
            headerRenderer: p => <CheckColumn id="rugas_pos" name="Rugas" onChange={onCheckChange} defaultChecked={checkData?.rugas_pos} forInput={editable(p.row, 'generic')} />,
            formatter: ({ row }) => <ItemsField row={row} column="rugas_pos" />,
            editor(p) { return <ModalRangeEditor type="rugas" p={p} column="rugas_pos" title="Rugas" forInput={editable(p.row, 'generic')} valid={1} /> },
            editorOptions: { editOnClick: true },
            cellClass: r => editableClass(r, 'generic')
        },
        { key: 'comp', sortable: false, name: "Comprimento", width: 100, formatter: ({ row }) => row.comp },
        {
            key: 'defeitos', sortable: false,
            headerRenderer: p => <CheckColumn id="defeitos" name="Outros Defeitos" onChange={onCheckChange} defaultChecked={checkData?.defeitos} forInput={editable(p.row, 'generic')} />,
            editor: p => <FieldDefeitosEditor p={p} />, editorOptions: { editOnClick: true },
            width: 250, formatter: (p) => <FieldDefeitos p={p} />,
            cellClass: r => editableClass(r, 'generic'),
        },
        {
            key: 'prop_obs', sortable: false,
            headerRenderer: p => <CheckColumn id="prop_obs" name="Propriedades Observações" onChange={onCheckChange} defaultChecked={checkData?.prop_obs} forInput={editable(p.row, 'generic')} />,
            formatter: ({ row, isCellSelected }) => <MultiLine value={row.prop_obs} isCellSelected={isCellSelected}><pre style={{ whiteSpace: "break-spaces" }}>{row.prop_obs}</pre></MultiLine>,
            editor(p) { return <ModalObsEditor forInput={editable(p.row, 'generic')} p={p} column="prop_obs" title="Propriedades Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> },
            cellClass: r => editableClass(r, 'generic'),
            editorOptions: { editOnClick: true }
        },
        {
            key: 'obs', sortable: false,
            headerRenderer: p => <CheckColumn id="obs" name="Observações" onChange={onCheckChange} defaultChecked={checkData?.obs} forInput={editable(p.row, 'generic')} />,
            formatter: ({ row, isCellSelected }) => <MultiLine value={row.obs} isCellSelected={isCellSelected}><pre style={{ whiteSpace: "break-spaces" }}>{row.obs}</pre></MultiLine>,
            editor: (p) => { return <ModalObsEditor forInput={editable(p.row, 'generic')} p={p} column="obs" title="Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> },
            cellClass: r => editableClass(r, 'generic'),
            editorOptions: { editOnClick: true },
        },
    ];

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
        dataAPI.addFilters({ ...defaultFilters, ...filterValues, ...(palete_id && { palete_id }), ...(bobinagem_id && { bobinagem_id }) }, true, false);
        dataAPI.setSort(defaultSort);
        dataAPI.addParameters(defaultParameters, true, false);
        dataAPI.fetchPost({
            signal, rowFn: (dt) => postProcess(dt, submitting)
        });

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

    const onRowsChange = (rows, changedRows) => {
        const column = changedRows.column.key;
        const indexRow = changedRows.indexes[0];
        if (column === "defeitos") {
            const defeitos = rows[indexRow].defeitos || [];
            const defeitosOriginal = dataAPI.getData().rows[indexRow].defeitos || [];
            const removed = defeitosOriginal.filter(a => !defeitos?.map(b => b.value).includes(a.value));
            const added = defeitos.filter(a => !defeitosOriginal?.map(b => b.value).includes(a.value));
            if (checkData.defeitos === true) {
                rows = applyToAllRows(rows, "defeitos", indexRow, added, removed);

            } else if (added.some(v => (v.value === "troca_nw" || v.value === "tr")) || removed.some(v => (v.value === "troca_nw" || v.value === "tr"))) {
                rows = applyToAllRows(rows, "defeitos", indexRow, added, removed);
            }

        }
        if (column.endsWith("_pos")) {
            let value = (rows[indexRow][column]) ? rows[indexRow][column] : [];
            const valueOriginal = dataAPI.getData().rows[indexRow][column] || [];
            const removed = valueOriginal.filter(a => !value?.map(({ min, max }) => ({ min, max })).some(v => a.min === v.min && a.max === v.max));
            const added = value.filter(a => !valueOriginal?.map(({ min, max }) => ({ min, max })).some(v => a.min === v.min && a.max === v.max));
            if (checkData[column] === true) {
                rows = applyRangeToAllRows(rows, column, indexRow, added, removed);
            }
        }
        if (column === "estado") {
            const estado = rows[indexRow].estado;
            if (checkData.estado === true) {
                rows = applyValueToAllRows(rows, "estado", indexRow, estado);
            } else if (estado === "BA") {
                rows = applyValueToAllRows(rows, "estado", indexRow, estado);
            }
        }
        if (column === "obs") {
            const obs = rows[indexRow].obs;
            if (checkData.obs === true) {
                rows = applyValueToAllRows(rows, "obs", indexRow, obs);
            }
        }
        if (column === "prop_obs") {
            const prop_obs = rows[indexRow].prop_obs;
            if (checkData.prop_obs === true) {
                rows = applyValueToAllRows(rows, "prop_obs", indexRow, prop_obs);
            }
        }
        dataAPI.setRows(rows);
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
        console.log("saving")
        submitting.trigger();
        //const values = form.getFieldsValue(true);
        //const v = schemaRegister().validate(values, { abortEarly: false, messages: validateMessages, context: { new_lote: dataAPI.getData().new_nw_lotes } });
        //const { errors, warnings, value, ...status } = getStatus({});
        //setFieldStatus({ ...status.fieldStatus });
        //setFormStatus({ ...status.formStatus });
        const status = { error: [] };
        const rows = dataAPI.getData().rows;
        for (let [i, r] of rows.entries()) {

            if (r?.notValid) {
                r.defeitos = (r?.defeitos ? r.defeitos : []);
                const hasDefeitos = (r?.defeitos && r.defeitos.length > 0 || r.fc_pos?.length > 0 || r.ff_pos?.length > 0 || r.fc_pos?.length > 0 || r.furos_pos?.length > 0 || r.buracos_pos?.length > 0 || r.rugas_pos?.length > 0 || r.prop_obs?.length > 0 || r.obs?.length > 0) ? true : false;
                const estado = r.estado;
                // if ((r.estado_original === "HOLD")/*  && !permission.allow() */) {
                //     status.error.push({ message: <span><b>{r.nome}</b>: Não tem permissões para alterar o estado de uma bobine em <b>HOLD</b>.</span> });
                // }
                // if ((estado === "HOLD")/*  && !permission.allow() */) {
                //     status.error.push({ message: <span><b>{r.nome}</b>: Não tem permissões para alterar o estado para <b>HOLD</b>.</span> });
                // }
                if ((estado === "R" || estado === "DM") && !hasDefeitos) {
                    status.error.push({ message: <span><b>{r.nome}</b>: Para classificar como <b>DM</b> ou <b>R</b> tem de definir pelo menos um defeito.</span> });
                }
                if (r.defeitos.some(x => x.key === "fmp") && !r.obs?.length > 0) {
                    status.error.push({ message: <span><b>{r.nome}</b>: Falha de <b>Matéria Prima</b>, preencher nas observações o motivo.</span> });
                }
                if (r.defeitos.some(x => x.key === "esp") && !r.prop_obs?.length > 0) {
                    status.error.push({ message: <span><b>{r.nome}</b>: <b>Gramagem</b>, preencher nas observações das propriedades o motivo.</span> });
                }
                if (r.defeitos.some(x => x.key === "prop") && !r.prop_obs?.length > 0) {
                    status.error.push({ message: <span><b>{r.nome}</b>: <b>Propriedades</b>, preencher nas observações das propriedades o motivo.</span> });
                }
            }
            if (status.error.length > 0) {
                Modal.error({
                    title: "Erros",
                    content: <YScroll style={{ maxHeight: "270px" }}>
                        <ul style={{ padding: "0px 0px 5px 20px", background: "#fff2f0", border: "solid 1px #ffccc7" }}>
                            {status.error.map((v, i) => <li key={`err-${i}`}>{v.message}</li>)}
                        </ul>
                    </YScroll>
                })
                submitting.end();
                return;
            }

            rows[i]["prop"] = (r.prop_obs?.length > 0) ? 1 : 0;
            rows[i]["fc"] = (r.fc_pos?.length > 0) ? 1 : 0;
            rows[i]["ff"] = (r.ff_pos?.length > 0) ? 1 : 0;
            rows[i]["furos"] = (r.furos_pos?.length > 0) ? 1 : 0;
            rows[i]["buraco"] = (r.buracos_pos?.length > 0) ? 1 : 0;
            rows[i]["rugas"] = (r.rugas_pos?.length > 0) ? 1 : 0;

        }

        try {
            let response = await fetchPost({ url: `${API_URL}/bobines/sql/`, parameters: { method: "UpdateDefeitos", rows: rows.filter(v => v?.notValid === 1), ...parameters }, filter: {} });
            if (response.data.status !== "error") {
                Modal.success({ title: "Registos alterados com sucesso!" })
                //loadData();
            } else {
                Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: "Erro!", content: response.data.content });
            }
        } catch (e) {
            Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
            submitting.end();
        };


        console.log("aaaaaaaaaaaa", rows);

        //     if (bobinagem.nome.startsWith("20") && bobinagem.id >= 107127) {
        //         if (!values?.largura_bruta || values?.largura_bruta < values.lar_util) {
        //             status.formStatus.error.push({ message: <span>A<b>Largura Bruta</b> tem de ser preenchida ou maior que a Largura Útil!</span> });
        //         }
        //     }

        //     if (bobinagem.valid == 0) {
        //         console.log("list nw", nwList);
        //         console.log(values.lotenwsup, "--", values.lotenwinf);
        //         console.log(values.nwsup, "--", values.nwinf);
        //         const lns = nwList.find(v => v.n_lote === values.lotenwsup && v.type === 1);
        //         const lni = nwList.find(v => v.n_lote === values.lotenwinf && v.type === 0);

        //         if (!lns || !lni) {
        //             status.formStatus.error.push({ message: <span>Não foram encontrados lotes de Nonwoven em linha!</span> });
        //         } else {
        //             let vs = lns.qty_reminder - convertToM2(values.nwsup, lns.largura);
        //             let vi = lni.qty_reminder - convertToM2(values.nwinf, lni.largura);
        //             //if (vs<(-100)){
        //             //    status.formStatus.error.push({ message: <span>A quantidade Existente no lote Superior de Nonwoven é insuficiente!</span> });
        //             //}else if (vi<-100){
        //             //    status.formStatus.error.push({ message: <span>A quantidade Existente no lote Inferior de Nonwoven é insuficiente!</span> });
        //             //}
        //         }
        //     }
        //     if (status.formStatus.error.length === 0) {
        //         try {
        //             const { data: { rows: granulado } } = await fetchPost({ url: `${API_URL}/recicladolookup/`, pagination: { enabled: false, limit: 1 }, filter: { status: 0 }, sort: [{ column: "timestamp", direction: "desc" }] });
        //             if (granulado.length === 0 && bobinagem.valid == 0) {
        //                 setModalParameters({ setFormStatus, submitting, status, data: { bobines: rows, values, bobinagem }, loadData });
        //                 showNewLoteModal();
        //             } else {
        //                 await validarSubmit(status, { bobines: rows, values, bobinagem }, setFormStatus, submitting, loadData);
        //             }
        //         } catch (e) {
        //             Modal.error({ centered: true, width: "auto", style: { maxWidth: "768px" }, title: 'Erro!', content: <div style={{ display: "flex" }}><div style={{ maxHeight: "60vh", width: "100%" }}><YScroll>{e.message}</YScroll></div></div> });
        //             submitting.end();
        //         };

        //         console.log("row ok", rows, values);
        //     } else {
        //         setFormStatus({ ...status.formStatus });
        //         submitting.end();
        //     }
        submitting.end();
    }

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const _values = processFilters(type, values, defaultFilters);
                dataAPI.addFilters(_values, true);
                dataAPI.addParameters({});
                dataAPI.first();
                dataAPI.fetchPost({ rowFn: (dt) => postProcess(dt, submitting) });
                break;
        }



        // const festados = formFilter.getFieldsValue(true).festados?.map(v => v.key);
        // if (festados){
        //     console.log("aaaaaaaaa", dataAPI.getData().rows.filter(v => festados.includes(v.estado)), festados)
        // }
    };
    const onFilterChange = (changedValues, values) => { };

    return (
        <>
            {/* <TitleForm data={dataAPI.getAllFilter()} bobinagem={bobinagem} onChange={onFilterChange} /> */}
            <Table
                loading={submitting.state}
                actionColumn={<ActionContent dataAPI={dataAPI} onClick={onAction} modeEdit={modeEdit.datagrid} />}
                frozenActionColumn
                reportTitle={parameters && `Bobines da ${(parameters?.palete) ? `Palete ${parameters.palete.nome}` : `Bobinagem ${parameters.bobinagem.nome}`}`}
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
                rowClass={(row) => (row?.notValid === 1 ? classes.notValid : undefined)}
                onRowsChange={onRowsChange}
                toolbarFilters={{ ...toolbarFilters(formFilter), onFinish: onFilterFinish, onValuesChange: onFilterChange }}
                leftToolbar={<Space>
                    <Button icon={<PrinterOutlined />} onClick={onPrint}>Imprimir Etiquetas</Button>
                    <Permissions permissions={props?.permission} action="editList">
                        {!modeEdit.datagrid && <Button disabled={submitting.state} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
                        {modeEdit.datagrid && <Button disabled={submitting.state} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                        {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.notValid === 1).length > 0) && <Button type="primary" disabled={submitting.state} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>}
                    </Permissions>

                </Space>}
            />
        </>
    );
}