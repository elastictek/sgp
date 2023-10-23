import React, { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import styled, { css } from 'styled-components';
import classNames from "classnames";
import Joi from 'joi';
import dayjs from 'dayjs';
import { useImmer } from 'use-immer';
import { fetch, fetchPost } from "utils/fetch";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import { useDataAPI } from "utils/useDataAPI";
import { usePermission, Permissions } from "utils/usePermission";
import loadInit, { fixRangeDates,newWindow } from "utils/loadInit";
import { useNavigate, useLocation } from "react-router-dom";
import Portal from "components/portal";
import IconButton from "components/iconButton";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Typography, Modal, Checkbox, Tag, Badge, Alert, DatePicker, TimePicker, Divider, Drawer, Select, Menu } from "antd";
const { TextArea } = Input;
import { PlusOutlined, MoreOutlined, EditOutlined, ReadOutlined, PrinterOutlined, LockOutlined, CopyOutlined, SearchOutlined } from '@ant-design/icons';
import { CgCloseO } from 'react-icons/cg';
import Table from 'components/TableV2';
import { API_URL, DATE_FORMAT, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS, DATETIME_FORMAT,ROOT_URL } from 'config';
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

const title = "";

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
            <Field name="fartigo" label={{ enabled: true, text: "Artigo", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
        <Col xs='content'>
            <Field name="flote" label={{ enabled: true, text: "Lote", pos: "top", padding: "0px" }}>
                <Input size='small' allowClear />
            </Field>
        </Col>
    </>
    );
}

const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFiltersSchema = ({ form }) => [
    // { flote: { label: "Lote", field: { type: 'input', size: 'small' } } },
    // { fnbobinesreal: { label: "Nº Bobines", field: { type: 'input', size: 'small' }, span: 8 }, flargura: { label: "Largura", field: { type: 'input', size: 'small' }, span: 8 }, fdisabled: { label: 'Ativo', field: { type: 'select', size: 'small', options: [{ value: null, label: " " }, { value: 0, label: "Sim" }, { value: 1, label: "Não" }] }, span: 8 } },
    // { festados: { label: 'Estados', field: { type: 'selectmulti', size: 'small', options: BOBINE_ESTADOS } } },
    // { fbobine: { label: "Bobine(s)", field: { type: 'input', size: 'small' } } },
    // { fartigo: { label: "Artigo", field: { type: 'input', size: 'small' } } },
    // { fdata: { label: "Data", field: { type: "rangedate", size: 'small' } } },
    // { fano: { label: "Ano Exp.", field: { type: 'input', size: 'small' }, span: 6 }, fmes: { label: "Mês Exp.", field: { type: 'input', size: 'small' }, span: 6 } },
    // { farea: { label: "Área", field: { type: 'input', size: 'small' }, span: 12 }, fcomp: { label: "Comprimento", field: { type: 'input', size: 'small' }, span: 12 } },
    // { fdiam_min: { label: "Diâmetro (Min)", field: { type: 'input', size: 'small' }, span: 8 }, fdiam_max: { label: "Diâmetro (Max)", field: { type: 'input', size: 'small' }, span: 8 }, fdiam_avg: { label: "Diâmetro (Médio)", field: { type: 'input', size: 'small' }, span: 8 } },
    // { fpeso_bruto: { label: "Peso Bruto", field: { type: 'input', size: 'small' }, span: 12 }, fpeso_liquido: { label: "Peso Líquido", field: { type: 'input', size: 'small' }, span: 12 } },
    // {
    //     fdispatched: { label: 'Expedido', field: { type: 'select', size: 'small', options: [{ value: "ALL", label: " " }, { value: 1, label: "Sim" }, { value: 0, label: "Não" }] }, span: 6 },
    //     fcarga: { label: 'Carga', field: { type: 'select', size: 'small', options: [{ value: "ALL", label: " " }, { value: 1, label: "Sim" }, { value: 0, label: "Não" }] }, span: 6 },
    //     feec: { label: 'EEC', field: { type: 'input', size: 'small' }, span: 6 }
    // },
    // { fcarganome: { label: "Carga Designação", field: { type: 'input', size: 'small' } } },
    // { fsdh: { label: "Expedição", field: { type: 'input', size: 'small' }, span: 12 }, fclienteexp: { label: "Expedição Cliente", field: { type: 'input', size: 'small' }, span: 12 } },
    // { fartigoexp: { label: "Artigo Expedição", field: { type: 'input', size: 'small' } } },
    // { fdestinoold: { label: "Destino (Legacy)", field: { type: 'input', size: 'small' } } },
    // { flotenw: { label: "Lote Nonwoven", field: { type: 'input', size: 'small' } } },
    // { ftiponw: { label: "Nononwoven Artigo", field: { type: 'input', size: 'small' } } }


    // { fqty: { label: "Quantidade Lote", field: { type: 'input', size: 'small' }, span: 12 } },
    // { fqty_reminder: { label: "Quantidade Restante", field: { type: 'input', size: 'small' }, span: 12 } },
    // { ftype_mov: { label: 'Movimento', field: { type: 'select', size: 'small', options: [{ value: 0, label: "Saída" }, { value: 1, label: "Entrada" }] }, span: 6 } },
];



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
    const permission = usePermission({permissions:props?.permissions});
    const [modeEdit, setModeEdit] = useState({ datagrid: false });
    const [parameters, setParameters] = useState();
    const [checkData, setCheckData] = useImmer({ destino: false });
    const defaultParameters = { method: "BobinesGranuladoMPList" };
    const [defaultFilters, setDefaultFilters] = useState({});
    const defaultSort = [{ column: 'pb.nome', direction: 'ASC' }];
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/bobines/sql/`, parameters: {}, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: {}, sort: [] } });
    const primaryKeys = ['id', 'artigo_cod', 'n_lote'];
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
        { key: 'nome', sortable: true, name: 'Bobine', width: 135, frozen: true, formatter: p => <Button size="small" type="link" onClick={() => onBobineClick(p.row)}>{p.row.nome}</Button> },
        { key: 'posicao_palete', sortable: false, name: 'Pos. Palete', width: 90, formatter: p => p.row.posicao_palete },
        { key: 'estado', sortable: false, name: 'Estado', minWidth: 85, width: 85, formatter: (p) => <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}><Status b={p.row} /></div> },
        { key: 'artigo_cod', name: 'Cód. Matéria Prima', width: 150, sortable: true },
        { key: 'artigo_des', name: 'Matéria Prima', sortable: true },
        { key: 'n_lote', name: 'Lote', width: 220, sortable: true },
        { key: 't_stamp', width: 130, name: 'Data Entrada', formatter: p => p.row.t_stamp && dayjs(p.row.t_stamp).format(DATETIME_FORMAT) },
        { key: 't_stamp_out', width: 130, name: 'Data Saída', formatter: p => p.row.t_stamp_out && dayjs(p.row.t_stamp_out).format(DATETIME_FORMAT) },
        { key: 't_stamp_close', width: 130, name: 'Data Fecho', formatter: p => p.row.t_stamp_close && dayjs(p.row.t_stamp_close).format(DATETIME_FORMAT) }
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
        dataAPI.addFilters({ ...defaultFilters, ...filterValues, ...(palete_id && { palete_id, fcompactual: ">0" }), ...(bobinagem_id && { bobinagem_id, fcompactual: ">=0", frecycle: ">=0" }) }, true, true);
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
        newWindow(`${ROOT_URL}/producao/bobine/details/${row.id}/`, {}, `bobine-${row.id}`);
        //setModalParameters({ src: `/producao/bobine/details/${row.id}/`, title: `Bobine ${row.nome}` });
        //showModal();
    }

    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const vals = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
                const _values = {
                    ...vals,
                    fbobine: getFilterValue(vals?.fbobine, 'any'),
                    fartigo: getFilterValue(vals?.fartigo, 'any'),
                    flote: getFilterValue(vals?.flote, 'any')
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
                toolbarFilters={{
                    form: formFilter, schema, onFinish: onFilterFinish, onValuesChange: onFilterChange,
                    filters: <ToolbarFilters dataAPI={dataAPI} />,
                    moreFilters: { schema: moreFiltersSchema, rules: moreFiltersRules, width: 350, mask: true }
                }}
                leftToolbar={<Space>
                    <Permissions permissions={permission} action="editList">
                        {/* {!modeEdit.datagrid && <Button disabled={submitting.state} icon={<EditOutlined />} onClick={changeMode}>Editar</Button>} */}
                        {/* {modeEdit.datagrid && <Button disabled={submitting.state} icon={<LockOutlined title="Modo de Leitura" />} onClick={changeMode} />} */}
                        {/*  {(modeEdit.datagrid && dataAPI.getData().rows.filter(v => v?.valid === 0).length > 0) && <Button type="primary" disabled={submitting.state} icon={<EditOutlined />} onClick={onSave}>Guardar Alterações</Button>} */}
                    </Permissions>

                </Space>}
            />
        </>
    );
}