import React, { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import classNames from "classnames";
import Joi from 'joi';
import { useImmer } from 'use-immer';
import { fetch, fetchPost } from "utils/fetch";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import { useDataAPI } from "utils/useDataAPI";
import { usePermission, Permissions } from "utils/usePermission";
import loadInit, { fixRangeDates,newWindow } from "utils/loadInitV3";
import { useNavigate, useLocation } from "react-router-dom";
import Portal from "components/portal";
import IconButton from "components/iconButton";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Typography, Modal, Checkbox, Tag, Badge, Alert, DatePicker, TimePicker, Divider, Drawer, Select, Menu } from "antd";
const { TextArea } = Input;
import { PlusOutlined, MoreOutlined, EditOutlined, ReadOutlined, PrinterOutlined, LockOutlined, CopyOutlined, SearchOutlined } from '@ant-design/icons';
import { CgCloseO } from 'react-icons/cg';
import Table from 'components/TableV2';
import { API_URL, DATE_FORMAT, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS,ROOT_URL } from 'config';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, SelectMultiField, Selector, Label, SwitchField } from 'components/FormFields';
import { Status, toolbarFilters, postProcess, processFilters } from "./commons";
import YScroll from 'components/YScroll';
import ToolbarTitle from 'components/ToolbarTitle';
import { DateTimeEditor, InputNumberEditor, ModalObsEditor, SelectDebounceEditor, ModalRangeEditor, useEditorStyles, DestinoEditor, ItemsField, MultiLine, CheckColumn, FieldEstadoEditor, FieldDefeitosEditor, FieldDefeitos } from 'components/tableEditors';
import FormPrint from '../commons/FormPrint';
import Palete from '../paletes/Palete';

const title = "";

const useStyles = createUseStyles({
    hasObs: {
        backgroundColor: "#fffb8f"
    }
});


const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [];
    return (<>{items.length > 0 && <Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />}</>);
}

export default ({ noPrint = true, noEdit = true, ...props }) => {
    const submitting = useSubmitting(true);
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useEditorStyles();
    const cls = useStyles();
    const [formFilter] = Form.useForm();
    const permission = usePermission({ permissions: props?.permissions });
    const [modeEdit, setModeEdit] = useState({ datagrid: false });
    const [parameters, setParameters] = useState();
    const [checkData, setCheckData] = useImmer({ destino: false });
    const defaultParameters = { method: "BobinesList" };
    const [defaultFilters, setDefaultFilters] = useState({});
    const defaultSort = [{ column: 'posicao_palete', direction: 'ASC' }];
    const dataAPI = useDataAPI({
        fnPostProcess: (dt) => postProcess(dt, submitting), payload: {
            url: `${API_URL}/bobines/sql/`, parameters: {}, pagination: {
                ...props?.paging ? { enabled: true, page: 1, pageSize: 20 } : { limit: 150 }
            }, filter: {}, sort: []
        }
    });
    const primaryKeys = ['id'];
    const [modalParameters, setModalParameters] = useState({});
    const [lastPaleteTab, setLastPaleteTab] = useState('1');
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "print": return <FormPrint v={{ ...modalParameters }} />;
                case "palete": return <Palete tab={modalParameters?.tab} setTab={modalParameters?.setTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onPaleteClick = (row, level) => {
        setModalParameters({ content: "palete", tab: lastPaleteTab, setTab: setLastPaleteTab, type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ /* loadData: () => dataAPI.fetchPost() */ parameters: { palete: { id: row?.palete_id, nome: row?.palete_nome }, palete_id: row?.palete_id, palete_nome: row?.palete_nome } });
        showModal();
    }

    const editable = (row, col) => {
        if (!modeEdit.datagrid){
            return true;
        }
        if (props?.parameters?.palete) {
            if (modeEdit.datagrid && permission.isOk({ action: "changeDestino" }) && !props?.parameters?.palete?.carga_id && !props?.parameters?.palete?.SDHNUM_0 && props?.parameters?.palete?.nome.startsWith('D')) {
                if (col === "destino") { return true; }
            }
            if (modeEdit.datagrid && permission.isOk({ action: "trocaEtiquetas" }) && !props?.parameters?.palete?.carga_id && !props?.parameters?.palete?.SDHNUM_0 && props?.parameters?.palete?.nome.startsWith('D')) {
                if (col === "trocaEtiquetas") { return true; }
            }
        }
        return false;
    }
    const editableClass = (row, col) => {       
        if (props?.parameters?.palete && modeEdit.datagrid && permission.isOk({ action: "changeDestino" }) && !props?.parameters?.palete?.carga_id && !props?.parameters?.palete?.SDHNUM_0 && props?.parameters?.palete?.nome.startsWith('D')) {
            if (col === "destino") { return classes.edit; }
        } else if (props?.parameters?.palete && modeEdit.datagrid && permission.isOk({ action: "trocaEtiquetas" }) && !props?.parameters?.palete?.carga_id && !props?.parameters?.palete?.SDHNUM_0 && props?.parameters?.palete?.nome.startsWith('D')) {
            if (col === "trocaEtiquetas") { return classes.edit; }
        } else {
            if (col === "destino" && row.destinos_has_obs > 0) {
                return cls.hasObs;
            }
        }
    }

    const onCheckChange = (key, value) => { setCheckData(draft => { draft[key] = value.target.checked; }); }

    const columns = [
        { key: 'nome', sortable: false, name: 'Bobine', width: 135, frozen: true, formatter: p => <Button size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.nome}</Button> },
        ...(props?.columns && 'palete_nome' in props?.columns) ? [{ key: 'palete_nome', sortable: false, name: 'Palete', width: 130, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onPaleteClick(p.row, 0)}>{p.row.palete_nome}</Button> }] : [],
        { key: 'posicao_palete', sortable: false, name: 'Pos.', width: 60, formatter: p => p.row.posicao_palete },
        { key: 'estado', sortable: false, name: 'Estado', minWidth: 85, width: 85, formatter: (p) => <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status b={p.row} /></div> },
        { key: 'troca_etiqueta', name: 'Troca Etiqueta', reportFormat: '0', width: 90, formatter: p => <div style={{}}><Checkbox checked={p.row.troca_etiqueta} disabled /></div> },
        {
            key: 'destino', width: 200, editable: true,
            headerRenderer: p => <CheckColumn id="destino" name="Destino" onChange={onCheckChange} defaultChecked={checkData?.destino} forInput={editable(p.row, 'destino')} />,
            editable: p => editable(p.row, 'destino'),
            cellClass: r => editableClass(r, 'destino'),
            editor: p => <DestinoEditor forInput={editable(p.row, 'destino')} forInputTroca={editable(p.row, 'trocaEtitquetas')} p={p} palete={props?.parameters?.palete} column="destino" onConfirm={onDestinoConfirm}/* onChange={() => { console.log("changedddddddd") }} */ />,
            editorOptions: { editOnClick: true, commitOnOutsideClick: false },
            formatter: p => p.row.destino
        },
        { key: 'lar', sortable: false, name: 'Largura', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.lar} mm</div> },
        { key: 'l_real', sortable: false, name: 'Largura Real', width: 90, formatter: ({ row }) => <div style={{ textAlign: "right" }}>{row.l_real}  {row.l_real && "mm"}</div> },
        { key: 'fc_pos', sortable: false, width: 85, name: "Falha Corte", formatter: ({ row }) => <ItemsField row={row} column="fc_pos" />, editor(p) { return <ModalRangeEditor type="fc" unit='mm' p={p} column="fc_pos" title="Falha de Corte" forInput={false} valid={1} /> }, editorOptions: { editOnClick: true } },
        { key: 'ff_pos', sortable: false, width: 85, name: "Falha de Filme", formatter: ({ row }) => <ItemsField row={row} column="ff_pos" />, editor(p) { return <ModalRangeEditor type="ff" p={p} column="ff_pos" title="Falha de Filme" forInput={false} valid={1} /> }, editorOptions: { editOnClick: true } },
        { key: 'buracos_pos', sortable: false, width: 85, name: "Buracos", formatter: ({ row }) => <ItemsField row={row} column="buracos_pos" />, editor(p) { return <ModalRangeEditor type="buracos" p={p} column="buracos_pos" title="Buracos" forInput={false} valid={1} /> }, editorOptions: { editOnClick: true } },
        { key: 'furos_pos', sortable: false, width: 85, name: "Furos", formatter: ({ row }) => <ItemsField row={row} column="furos_pos" />, editor(p) { return <ModalRangeEditor p={p} type="furos" column="furos_pos" title="Furos" forInput={false} valid={1} /> }, editorOptions: { editOnClick: true } },
        { key: 'rugas_pos', sortable: false, width: 85, name: "Rugas", formatter: ({ row }) => <ItemsField row={row} column="rugas_pos" />, editor(p) { return <ModalRangeEditor type="rugas" p={p} column="rugas_pos" title="Rugas" forInput={false} valid={1} /> }, editorOptions: { editOnClick: true } },
        { key: 'comp_actual', sortable: false, name: 'Comp. Atual', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_actual} m</div> },
        { key: 'comp', sortable: false, name: "Comprimento", width: 100, formatter: ({ row }) => <div style={{ textAlign: "right" }}>{row.comp} m</div> },
        { key: 'defeitos', sortable: false, width: 250, name: "Outros Defeitos", formatter: (p) => <FieldDefeitos p={p} /> },
        {
            key: 'prop_obs', sortable: false,
            editable: p => editable(p.row, 'destino'),
            headerRenderer: p => <CheckColumn id="obs" name="Propriedades Observações" onChange={onCheckChange} defaultChecked={checkData?.prop_obs} forInput={editable(p.row, 'destino')} />,
            formatter: ({ row, isCellSelected }) => <MultiLine value={row.prop_obs} isCellSelected={isCellSelected}><pre style={{ whiteSpace: "break-spaces" }}>{row.prop_obs}</pre></MultiLine>, editor(p) { return <ModalObsEditor forInput={false} p={p} column="prop_obs" title="Propriedades Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> }, editorOptions: { editOnClick: true }
        },
        {
            key: 'obs', sortable: false,
            editable: p => editable(p.row, 'destino'),
            headerRenderer: p => <CheckColumn id="obs" name="Observações" onChange={onCheckChange} defaultChecked={checkData?.obs} forInput={editable(p.row, 'destino')} />,
            formatter: ({ row, isCellSelected }) => <MultiLine value={row.obs} isCellSelected={isCellSelected}><pre style={{ whiteSpace: "break-spaces" }}>{row.obs}</pre></MultiLine>, 
            editor: (p) => { return <ModalObsEditor forInput={false} p={p} column="obs" title="Observações" autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} /> },
            editorOptions: { editOnClick: true },
        },
    ];


    const onDestinoConfirm = async (p, destinos, destinoTxt, obs, prop_obs, troca_etiqueta) => {
        const ids = dataAPI.getData().rows.map(v => v.id);
        const rowsDestinos = (checkData?.destino) ? ids : [p.row.id];
        const rowsObs = (checkData?.obs) ? ids : [p.row.id];
        const rowsPropObs = (checkData?.prop_obs) ? ids : [p.row.id];
        const values = { destinos, destinoTxt, obs, prop_obs, ...permission.isOk({ action: "trocaEtiquetas" }) && { troca_etiqueta } };
        const palete_id = p.row.palete_id;

        try {
            let response = await fetchPost({
                url: `${API_URL}/paletes/paletessql/`, parameters: {
                    method: "UpdateDestinos", ids, rowsDestinos, rowsObs, rowsPropObs, values,
                    troca: permission.isOk({ action: "trocaEtiquetas" }),
                    destinos: permission.isOk({ action: "changeDestinos" })
                }, filter: { palete_id }
            });
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
        const { tstamp, ...paramsIn } = loadInit({}, {}, { ...props?.parameters }, { ...location?.state }, null);
        //let { palete_id, palete_nome, bobinagem_id, bobinagem_nome, ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, _parameters, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys(_parameters ? _parameters : {})]);
        const palete_id = paramsIn?.palete?.id;
        const bobinagem_id = paramsIn?.bobinagem?.id;
        setParameters({
            palete: {
                id: paramsIn?.palete?.id,
                nome: paramsIn?.palete?.nome
            },
            bobinagem: {
                id: paramsIn?.bobinagem?.id,
                nome: paramsIn?.bobinagem?.nome
            }
        })
        let { filterValues, fieldValues } = fixRangeDates([], paramsIn);
        formFilter.setFieldsValue({ ...fieldValues });
        setDefaultFilters(prev => ({ ...prev, palete_id, bobinagem_id }));
        dataAPI.addFilters({ ...defaultFilters, ...filterValues, ...(palete_id && { palete_id, fcompactual: ">0" }), ...(bobinagem_id && { bobinagem_id, fcompactual: ">=0", frecycle: ">=0" }) }, true, true);
        dataAPI.setSort(defaultSort);
        dataAPI.addParameters(defaultParameters, true, true);
        dataAPI.fetchPost({ signal });

    }

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());

    }, [props?.parameters?.tstamp, location?.state?.tstamp]);

    const onBobineClick = (row) => {
        newWindow(`${ROOT_URL}/producao/bobine/details/${row.id}/`, {}, `bobine-${row.id}`);
        //setModalParameters({ src: `/producao/bobine/details/${row.id}/`, title: `Bobine ${row.nome}` });
        //showModal();
    }

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const _values = processFilters(type, values, defaultFilters);
                dataAPI.addFilters(_values, true);
                dataAPI.addParameters({ ...defaultParameters });
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }



        // const festados = formFilter.getFieldsValue(true).festados?.map(v => v.key);
        // if (festados){
        //     console.log("aaaaaaaaa", dataAPI.getData().rows.filter(v => festados.includes(v.estado)), festados)
        // }
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
                onRowsChange={onRowsChange}
                toolbarFilters={{ ...toolbarFilters(formFilter), onFinish: onFilterFinish, onValuesChange: onFilterChange }}
                leftToolbar={<Space>
                    {!noPrint && <Button icon={<PrinterOutlined />} onClick={onPrint}>Imprimir Etiquetas</Button>}
                    {props?.parameters?.palete &&
                        <Permissions permissions={permission} action="changeDestinos" forInput={!noEdit}>
                            {!modeEdit.datagrid && <Button disabled={submitting.state} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>}
                            {modeEdit.datagrid && <Button disabled={submitting.state} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />}
                            {/*  {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={submitting.state} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>} */}
                        </Permissions>
                    }
                </Space>}
            />
        </>
    );
}