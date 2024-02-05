import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ROOT_URL, API_URL, DATE_FORMAT, CSRF } from "config";
import { useDataAPI, parseFilter, getFilterValue } from "utils/useDataAPIV4";
import { newWindow } from 'utils/loadInitV3'
import { usePermission, Permissions } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { useSubmitting, sleep } from "utils";
import { uid } from 'uid';
import dayjs from 'dayjs';
import ToolbarTitle from 'components/ToolbarTitleV3';
import { useGridCellEditor } from 'ag-grid-react';
import { suppressKeyboardEvent, useModalApi, getCellFocus, columnPath, refreshDataSource, disableTabOnNextCell } from 'components/TableV4/TableV4';

import { Value, Bool, MultiLine, Larguras, Cores, Ordens, FromTo, EstadoBobines, BadgeNumber, Options, Cortes, CortesOrdem, Action, OPTIONS_LAB_MODE, OPTIONS_LAB_PARAMETERTYPE } from "components/TableV4/TableColumnsV4";
import useModeApi from 'utils/useModeApi';
import TableGridEdit from 'components/TableV4/TableGridEdit';
import { AntdAutoCompleteEditor, AntdCheckboxEditor, AntdDateEditor, AntdInputEditor, AntdInputNumberEditor, AntdSelectEditor, ArtigosLookupEditor, ClientesLookupEditor } from 'components/TableV4/TableEditorsV4';
import { firstKey, firstKeyValue, includeObjectKeys, json, updateByPath, valueByPath } from 'utils/object';
import { z } from "zod";
import { CloseCircleFilled, DeleteFilled, DownloadOutlined, EditOutlined, InboxOutlined, StockOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Modal, Upload, message } from 'antd';
const { Dragger } = Upload;
import { AppContext } from 'app';
import { zGroupIntervalNumber, zGroupRangeNumber, zIntervalNumber, zOneOfNumber, zRangeNumber } from 'utils/schemaZodRules';
import { fetchPost } from 'utils/fetch';
import { columns,schema,fecthUnits } from './LabParametersList';
import { isNotNil, isNil } from 'ramda';

const title = "Carregar Parâmetros";
const subTitle = null;
const TitleForm = ({ visible = true, level, auth, hasEntries, onSave, loading, title, subTitle }) => {
    return (<>{visible && <ToolbarTitle disabled={loading} id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
        {...subTitle && { leftSubTitle: <span style={{}}>{subTitle}</span> }}
    />}</>);
}

// const postProcess = async (dt) => {
//   for (let [i, v] of dt.rows.entries()) {}
//   return dt;
// };

const postProcessParamaters = (dt,info) => {

}

export default ({ noid = false, defaultFilters = {}, defaultSort = [], style, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formStatus, setFormStatus] = useState({});
    const submitting = useSubmitting(false);
    const gridRef = useRef(); //not required
    const modalApi = useModalApi() //not Required;
    const modeApi = useModeApi() //not Required;
    const permission = usePermission({ name: "controlpanel" });
    const defaultParameters = { method: "ListLabParameters" };
    const [validation, setValidation] = useState({});
    const { openNotification } = useContext(AppContext);
    const baseFilters = {
        //...parseFilter("ot.`type`", `==1`, { type: "number" })
    };
    const dataAPI = useDataAPI({
        ...((!noid || location?.state?.noid === false) && { id: "ListLabParameters-01" }), /* fnPostProcess: (dt) => postProcess(dt, null), */
        payload: {
            url: `${API_URL}/qualidade/sql/`, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 },
            filter: {}, baseFilter: baseFilters,
            sortMap: { /* cod: "ot.parameters->>'$.artigo.cod'", des: "ot.parameters->>'$.artigo.des'", cliente: "ot.parameters->>'$.cliente.BPCNAM_0'", data_imputacao: "ot.parameters->>'$.data_imputacao'" */ }
        }
    });

    useEffect(() => {
        if (permission?.isReady) {
            modeApi.load({
                key: null,
                enabled: true,
                showControls: false,
                allowEdit: permission.isOk({ item: "qualidade", action: "admin" }),
                allowAdd: permission.isOk({ item: "qualidade", action: "admin" }),
                newRow: () => ({ [dataAPI.getPrimaryKey()]: uid(6), parameter_type: firstKey(OPTIONS_LAB_PARAMETERTYPE), parameter_mode: firstKey(OPTIONS_LAB_MODE), required: 0 }),
                onModeChange: (m) => { },
                newRowIndex: null,
                onAddSave: async (rows, allRows) => await onAddSave(rows, allRows),
                onEditSave: async (rows, allRows) => await onEditSave(rows, allRows),
                editText: null,
                addText: null,
                saveText: null,
                initMode: modeApi.EDIT
            });
        }
    }, [permission?.isReady]);

    const onBeforeCellEditRequest = async (data, colDef, path, newValue, event) => {
        /**
         * Método que permite antes do "commit", fazer pequenas alterações aos dados.
         * No caso dessas alterações afetarem os valores de outras colunas da "Grid", é necessário desablitar o TabOnNextCell da coluna,
         * pois o próximo campo entra em edição antes deste método (isto é um Workaround!!!!!), para isso na definição da coluna colocar:
         * suppressKeyboardEvent: (params)=>disableTabOnNextCell(params)
         */
        if (newValue && colDef.field === "nome") {
            data = updateByPath(data, colDef.field, newValue);
            if (!valueByPath(data, "designacao")) {
                data = updateByPath(data, "designacao", newValue);
            }
            return data;
        }
        return null;
    }
    const onAfterCellEditRequest = async (data, colDef, path, newValue, event, result) => {
        const r = await dataAPI.validateRows([data], schema, dataAPI.getPrimaryKey(), { validationGroups });
        r.onValidationFail((p) => {
            setValidation(prev => ({ ...prev, ...p.alerts.error }));
        });
        r.onValidationSuccess((p) => {
            setValidation(prev => ({ ...prev, ...p.alerts.error }));
        });
    }

    const onAddSave = useCallback(async (rows, allRows) => {
        const rv = await dataAPI.validateRows(rows, schema, dataAPI.getPrimaryKey(), { validationGroups });
        await rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });

        return (await rv.onValidationSuccess(async (p) => {
            setValidation(prev => ({ ...prev, ...p.alerts.error }));
            const result = await dataAPI.safePost(`${API_URL}/qualidade/sql/`, "NewLabParameter", { parameters: { rows } });
            result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
            result.onFail((p) => { });
            return result.success;
            //setFormStatus(result);
        }));
    }, []);

    const onEditSave = useCallback(async (rows, allRows) => {
        const rv = await dataAPI.validateRows(rows, schema, dataAPI.getPrimaryKey(), { validationGroups });
        rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });

        return (await rv.onValidationSuccess(async (p) => {
            setValidation(prev => ({ ...prev, ...p.alerts.error }));
            const result = await dataAPI.safePost(`${API_URL}/qualidade/sql/`, "UpdateLabParameter", { parameters: { rows } });
            result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
            result.onFail((p) => { });
            //setFormStatus(result);
            return result.success;
        }));
    }, []);

    const onActionSave = useCallback(async (row, option) => {
        submitting.trigger();

        const _safePost = async (method, { filter, parameters }) => {
            const result = await dataAPI.safePost(`${API_URL}/qualidade/sql/`, method, { filter, parameters });
            result.onValidationFail((p) => { });
            result.onSuccess((p) => { refreshDataSource(gridRef.current.api); });
            result.onFail((p) => { });
            //setFormStatus(result);
        }

        switch (option.key) {
            case "delete":
                Modal.confirm({
                    content: <div>Tem a certeza que deseja apagar o parâmetro <b>{row.nome}</b>?</div>, onOk: async () => {
                        await _safePost("DeleteLabParameter", { parameters: {}, filter: { id: row.id } });
                    }
                })
                break;
        };

        submitting.end();
    }, []);

    const actionItems = useCallback((params) => {
        return [
            // { type: 'divider' },
            ...[{ label: "Apagar Parâmetro", key: "delete", icon: <DeleteFilled style={{ fontSize: "16px" }} /> }]
        ]
    }, []);

    const validationGroups = useMemo(() => (dataAPI.validationGroups({
        lvalues: ["min_value", "max_value"]
    })), []);

    const cellParams = useCallback((params = {}, editorParams = {}) => {
        return {
            cellRendererParams: { validation, modeApi, modalApi, validationGroups, ...params },
            cellEditorParams: { ...editorParams }
        };
    }, [validation, modeApi?.isOnMode()]);

    const isCellEditable = useCallback((params) => {
        /* if (modeApi.isOnAddMode() && ["cliente_abv", "liminf", "diam_ref", "limsup"].includes(params.colDef.field)) {
          return (params.data.cliente_id) ? false : true;
        }
        if (modeApi.isOnEditMode() && ["artigo_cod", "cliente_cod"].includes(params.colDef.field)) {
          return false;
        } */
        return true;
    }, [modeApi?.isOnMode()]);

    const columnDefs = useMemo(() => columns(cellParams), [validation, modeApi?.isOnMode()]);

    const filters = useMemo(() => ({
        toolbar: [],
        more: [],
        no: [...Object.keys(baseFilters), "action"]
    }), []);

    return (
        <>
            <TitleForm visible={isNil(props?.setTitle)} loading={submitting.state} auth={permission.auth} level={location?.state?.level} title={props?.title ? props.title : title} subTitle={props?.subTitle ? props.subTitle : subTitle} />
            <div style={{ height: "150px" }}>
                <Dragger {...{
                    name: 'file',
                    multiple: false,
                    accept: ".csv",
                    headers: { "X-CSRFToken": CSRF },
                    withCredentials: true,
                    action: `${API_URL}/qualidade/loadlabparametersbyfile/`,
                    showUploadList: false,
                    onChange(info) {
                        console.log("AAaaaaaaaaaaaaaaaaaa", modeApi.isOnEditMode())
                        const { status } = info.file;
                        if (status !== 'uploading') {
                            if (Array.isArray(info.fileList)) {
                                dataAPI.setData(info.fileList[0].response);
                                //setProcessedData(info.fileList[0].response);
                                console.log("aaaaaaaaaaaa", info, info.fileList[0].response)
                            } else {
                                message.error(`${info.file.name} Erro ao processar ficheiro.`);
                            }
                        }
                        if (status === 'done') {
                            message.success(`${info.file.name} Ficheiro processado com sucesso.`);
                        } else if (status === 'error') {
                            message.error(`${info.file.name} Erro no upload do ficheiro.`);
                        }
                    },
                    onDrop(e) {
                    },
                }}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Clique ou arraste o ficheiro <b>csv</b> para esta área por forma a efetuar o upload</p>
                </Dragger>
            </div>
            <TableGridEdit
                style={{ height: "60vh" }}
                loading={submitting.state}
                local={true}
                loadOnInit={false}
                gridRef={gridRef}
                columnDefs={columnDefs}
                defaultSort={[{ column: "id", direction: "DESC" }]}
                filters={filters}
                permission={permission}
                defaultParameters={defaultParameters}
                isCellEditable={isCellEditable}
                singleClickEdit={true}
                topToolbar={{
                    showFilters: false,
                    showSettings: false
                }}
                // topToolbar={{
                //     left: <>{!modeApi.isOnMode() && <Button onClick={onLoadParameters} icon={<DownloadOutlined />}>Carregar parâmetros</Button>}</>
                // }}
                //rowSelectionIgnoreOnMode={true}
                // rowSelection="single"
                // onSelectionChanged={onselectionchange}
                dataAPI={dataAPI}
                modeApi={modeApi}
                onBeforeCellEditRequest={onBeforeCellEditRequest}
                onAfterCellEditRequest={onAfterCellEditRequest}
                {...props}
            />
        </>
    );

}