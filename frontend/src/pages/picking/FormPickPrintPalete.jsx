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
import { API_URL, PALETES_WEIGH, BOBINE_ESTADOS } from "config";
import { useDataAPI } from "utils/useDataAPIV3";
import { json, includeObjectKeys, excludeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor, Segmented, Avatar, ConfigProvider, FloatButton, Steps, List } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, CaretDownOutlined, CaretUpOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, DeleteTwoTone, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table, { useTableStyles, getFilters, getMoreFilters, getFiltersValues } from 'components/TableV3';
import { RightAlign, LeftAlign, CenterAlign, Cuba, Bool, TextAreaViewer, MetodoTipo, MetodoMode, StatusApproval, DateTime, OFabricoStatus, StatusProduction, PosColumn, EstadoBobines, Largura, OF } from 'components/TableColumns';
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
import SvgSchema from "../paletes/paletizacao/SvgSchemaV2";
import PaletesChoose from './PaletesChoose';

const title = "Imprimir Etiqueta";
const TitleForm = ({ level, auth, hasEntries, onSave, loading }) => {
    return (<ToolbarTitle id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
    />);
}

export const loadBobines = async ({ palete_id }, signal) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/bobines/sql/`, filter: { fpaleteid: palete_id }, sort: [], parameters: { method: "BobinesLookup" }, signal });
    if (rows && Object.keys(rows).length > 0) {
        return rows;
    }
    return [{}];
}


const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const ToolbarFilters = ({ dataAPI, auth, num, v, columns, ...props }) => {
    return (<>
        {true && <>
            {getFilters({ columns: columns })}
            {/* <Col xs="content">
                <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
                </Field>
            </Col> */}
            {/*<Col xs="content">
                <Field name="fyear" shouldUpdate label={{ enabled: true, text: "Ano", pos: "top", padding: "0px" }}>
                    <DatePicker size="small" picker="year" format={"YYYY"} />
                </Field>
            </Col>
            <Col xs="content">
                <Field name="fquarter" label={{ enabled: true, text: "Quarter", pos: "top", padding: "0px" }}>
                    <Select size="small" options={[{ value: 1, label: "Q1" }, { value: 2, label: "Q2" }, { value: 3, label: "Q3" }, { value: 4, label: "Q4" }]} allowClear style={{ width: "60px" }} />
                </Field>
            </Col> */}
        </>}
    </>
    );
}
const moreFiltersRules = (keys) => { return getSchema({}, { keys }).unknown(true); }
const TipoRelation = () => <Select size='small' options={[{ value: "e" }, { value: "ou" }, { value: "!e" }, { value: "!ou" }]} />;
const moreFilters = ({ form, columns }) => [
    ...getMoreFilters({ columns }),
    // <Col xs="content">
    //     <Field name="fdocstatus" label={{ enabled: true, text: "Estado Documento", pos: "top", padding: "0px" }}>
    //         <Select size="small" options={[{ value: null, label: "Todos" }, { value: 0, label: "Em elaboração" }, { value: 1, label: "Em revisão" }, { value: 2, label: "Fechado" }]} allowClear style={{ width: "150px" }} />
    //     </Field>
    // </Col>
    /* { fgroup: { label: "Grupo", field: { type: 'input', size: 'small' }, span: 12 } },
    { fcod: { label: "Artigo Cód.", field: { type: 'input', size: 'small' }, span: 8 }, fdes: { label: "Artigo Des.", field: { type: 'input', size: 'small' }, span: 16 } }, */
];

export default ({ extraRef, closeSelf, loadParentData, noid = true, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openNotification } = useContext(AppContext);
    const inputParameters = useRef({});
    const submitting = useSubmitting(true);
    const permission = usePermission({ name: "picking" });
    const [load, setLoad] = useState(false);

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "print": return <FormPrint {...modalParameters.parameters} printer={modalParameters.parameters?.printers && modalParameters.parameters?.printers[0]?.value} />;
            }
        }
        return (
            <ResponsiveModal details={modalParameters?.details} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);


    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal, init: true });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal, init = false } = {}) => {
        submitting.trigger();
        if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, { ...props?.parameters }, { ...location?.state }, null);
            inputParameters.current = paramsIn;
            if (inputParameters.current?.id) {
                onSelectionChange({ data: inputParameters.current });
            } else {
                setLoad(true);
            }
        }
        submitting.end();
    }

    const onFilterChange = (changedValues, values) => {
        /* if ("type" in changedValues) {
            navigate("/app/picking/picknwlist", { state: { ...location?.state, ...formFilter.getFieldsValue(true), type: changedValues.type, tstamp: Date.now() }, replace: true });
        } */
    };

    const onSelectionChange = (v) => {
        setModalParameters({
            width: "500px",
            height: "200px",
            content: "print", type: "modal", push: false/* , width: "90%" */, title: <div style={{ fontWeight: 900 }}>Imprimir Etiqueta</div>,
            parameters: {
                url: `${API_URL}/print/sql/`, printers: [...printersList?.PRODUCAO, ...printersList?.ARMAZEM], numCopias: 2,
                onComplete: async (response, download) => await onDownloadComplete(response, download, v),
                parameters: {
                    method: "PrintPaleteEtiqueta",
                    id: v.data.id,
                    palete_nome: v.data.nome,
                    name: v?.data?.nome.startsWith("DM") ? "ETIQUETAS-PALETE-DM" : "ETIQUETAS-PALETE",
                    path: v?.data?.nome.startsWith("DM") ? "ETIQUETAS/PALETE-DM" : "ETIQUETAS/PALETE-DM"
                }
            }
        });
        showModal();
        //navigate("/app/picking/newpaleteline", { state: { action: "weigh", palete_id: v.data.id, palete_nome: v.data.nome, ordem_id: v.data.ordem_id, num_bobines: v.data.num_bobines, lvl: v.data.lvl } });
    }

    const onPrintPaleteHold = async (v) => {
        const hasBobinesHold = (await loadBobines({ palete_id: v.data.id })).findIndex(x => x?.estado === "HOLD");
        if (hasBobinesHold >= 0) {
            setModalParameters({
                width: "500px",
                height: "250px",
                content: "print", type: "modal", push: false/* , width: "90%" */,
                title: <div style={{ fontWeight: 900 }}>Imprimir Etiqueta</div>,
                details: <div>
                    <div>Produto Acabado em <span style={{ fontWeight: 900 }}>HOLD</span></div>
                    <Alert
                        style={{fontWeight:400}}                        
                        message="Nota Importante!"
                        description={<span style={{fontWeight:700}}>Imprimir etiqueta(s) em folha rosa.</span>}
                        type="info"
                    />
                </div>,
                parameters: {
                    url: `${API_URL}/print/sql/`, printers: [...printersList?.PRODUCAO, ...printersList?.ARMAZEM], numCopias: 2,
                    onComplete: async (response, download) => await onDownloadComplete(response, download),
                    parameters: {
                        method: "PrintPaleteEtiqueta",
                        id: v.data.id,
                        palete_nome: v.data.nome,
                        user:permission.auth.user,
                        name: "ETIQUETAS-PALETE-HOLD",
                        path: "ETIQUETAS/PALETE-HOLD"
                    }
                }
            });
            showModal();
        }
    }

    const onDownloadComplete = async (response, download, v) => {
        if (download == "download") {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');
            //downloadFile(response.data,"etiqueta_nw.pdf");
        }
        if (v) {
            await onPrintPaleteHold(v);
        }
    }

    return (
        <>
            {load &&
                <PaletesChoose
                    noid={false}
                    title="Imprimir Etiqueta"
                    onFilterChange={onFilterChange} onSelect={onSelectionChange}
                    defaultSort={[{ column: `sgppl.timestamp`, direction: "DESC" }]}
                    defaultFilters={{ /* fcarga: "isnull", */ fdisabled: "==0"/* , fdispatched: "isnull" */ }}
                />
            }
        </>
    )

}