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

const ActionContent = ({ dataAPI, hide, onClick, modeEdit, ...props }) => {
    const items = [];
    return (<>{items.length > 0 && <Menu items={items} onClick={v => { hide(); onClick(v, props.row); }} />}</>);
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
    const defaultParameters = { method: "BobinesList" };
    const [defaultFilters, setDefaultFilters] = useState({});
    const defaultSort = [{ column: 'posicao_palete', direction: 'ASC' }];
    const [lastPaleteTab, setLastPaleteTab] = useState('1');
    const dataAPI = useDataAPI({
        payload: {
            url: `${API_URL}/bobines/sql/`, parameters: {}, pagination: {
                ...props?.paging ? { enabled: true, page: 1, pageSize: 20 } : { limit: 100 }
            }, filter: {}, sort: []
        }
    });
    const primaryKeys = ['id'];
    const [modalParameters, setModalParameters] = useState({});
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

    const columns = [
        { key: 'nome', sortable: true, name: 'Bobine', width: 130, frozen: true, formatter: p => <Button size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.nome}</Button> },
        ...(props?.columns && 'palete_nome' in props?.columns) ? [{ key: 'palete_nome', sortable: true, name: 'Palete', width: 130, formatter: p => <Button style={{ color: "#0050b3", fontWeight: 700 }} size="small" type="link" onClick={() => onPaleteClick(p.row, 0)}>{p.row.palete_nome}</Button> }] : [],
        { key: 'posicao_palete', sortable: true, name: 'Pos.', width: 60, formatter: p => p.row.posicao_palete },
        { key: 'estado', sortable: true, name: 'Estado', minWidth: 85, width: 85, formatter: (p) => <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status b={p.row} /></div> },
        { key: 'comp_actual', sortable: true, name: 'Comp. Atual', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp_actual} m</div> },
        { key: 'comp', sortable: true, name: 'Comp. Original', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.comp} m</div> },
        { key: 'area', sortable: true, name: 'Área', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.area} m&sup2;</div> },
        { key: 'lar', sortable: true, name: 'Largura', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.lar} mm</div> },
        { key: 'core', sortable: true, name: 'Core', width: 90, formatter: p => <div style={{ textAlign: "right" }}>{p.row.core} ''</div> },
        { key: 'nwinf', name: 'Nw Inf.', width: 100, formatter: p => p.row?.nwinf && <div style={{ textAlign: "right" }}>{p.row.nwinf} m</div> },
        { key: 'nwsup', name: 'Nw Sup.', width: 100, formatter: p => p.row?.nwsup && <div style={{ textAlign: "right" }}>{p.row.nwsup} m</div> },
        { key: 'tiponwinf', name: 'Tipo NW Inferior', width: 300, sortable: true },
        { key: 'tiponwsup', name: 'Tipo NW Superior', width: 300, sortable: true },
        { key: 'lotenwinf', name: 'Lote NW Inferior', width: 150, sortable: true },
        { key: 'lotenwsup', name: 'Lote NW Superior', width: 150, sortable: true },
        { key: 'ofid', name: 'Ordem Fabrico', width: 130, formatter: p => <OF id={p.row.ordem_id} ofid={p.row.ofid} /> },
    ];


    const loadData = async ({ signal } = {}) => {
        const { palete, bobinagem, ..._parameters } = props?.parameters || {};

        let { filter: inputFilter, palete_id, palete_nome, bobinagem_id, bobinagem_nome, ...initFilters } = loadInit({}, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, _parameters, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter()), ...Object.keys(_parameters ? _parameters : {})]);
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
        setDefaultFilters(prev => ({ ...prev, filter: inputFilter, palete_id, bobinagem_id }));
        dataAPI.addFilters({ ...defaultFilters, ...filterValues, ...inputFilter && { filter: inputFilter }, ...(palete_id && { palete_id, fcompactual: ">0" }), ...(bobinagem_id && { bobinagem_id }) }, true, true);
        dataAPI.setSort(defaultSort);
        dataAPI.addParameters(defaultParameters, true, true);
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
                    {!props?.noPrint && <Button icon={<PrinterOutlined />} onClick={onPrint}>Imprimir Etiquetas</Button>}
                    <Permissions permissions={props?.permission} action="editList" forInput={!props?.noEdit}>
                        {/* {!modeEdit.datagrid && <Button disabled={submitting.state} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>} */}
                        {/* {modeEdit.datagrid && <Button disabled={submitting.state} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />} */}
                        {/*  {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={submitting.state} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>} */}
                    </Permissions>

                </Space>}
            />
        </>
    );
}