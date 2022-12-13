import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import AlertMessages from "components/alertMessages";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import ResultMessage from 'components/resultMessage';
import { ConditionalWrapper } from 'components/conditionalWrapper';
import { Button, Spin, Input, Form, InputNumber, Skeleton, Space, Radio, Tooltip, Modal, Tag } from "antd";
import { LoadingOutlined, EditOutlined, PlusOutlined, InfoCircleOutlined, HistoryOutlined, MoreOutlined, SyncOutlined, SearchOutlined,EllipsisOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import { useNavigate, useLocation } from "react-router-dom";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, getFilterRangeValues, getFilterValue, isValue } from "utils";
import classNames from "classnames";
import { CgCloseO } from 'react-icons/cg';
import IconButton from "components/iconButton";
import FormCortesOrdem from './FormCortesOrdem';
import Table from 'components/TableV2';
import { v4 as uuidv4 } from 'uuid';
import { useImmer } from "use-immer";
import Modalv4 from "components/Modalv4";
/* import { OFabricoContext } from './FormOFabricoValidar'; */
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { json } from "utils/object";
import { Field, Container as FormContainer, SelectField, AlertsContainer, SelectMultiField, VerticalSpace, HorizontalRule, InputNumberField } from 'components/FormFields';
import YScroll from 'components/YScroll';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { usePermission } from "utils/usePermission";
import ToolbarTitle from 'components/ToolbarTitle';

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const useStyles = createUseStyles({
    noOutline: {
        outline: "none !important"
    },
    notValid: {
        background: "#ffe7ba"
    },
    obs: {
        //overflowY:"scroll"
    },
    center: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%"
    },
    right: {
        display: "flex",
        justifyContent: "end",
        alignItems: "center",
        height: "100%"
    },
    bold: {
        fontWeight: 700
    }
});

const TitleForm = ({ data, onChange, form }) => {
    //const st = (parseInt(data?.type) === -1 || !data?.ofs) ? null : JSON.stringify(data?.ofs).replaceAll(/[\[\]\"]/gm, "").replaceAll(",", " | ");
    return (<ToolbarTitle title={<>
        <Col xs='content' style={{}}><span style={{ fontSize: "21px", lineHeight: "normal", fontWeight: 900 }}>Planeamento da Linha</span></Col>
        {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
    </>} right={<></>} />);
}

const coloured = (field, form, index) => {
    switch (field) {
        case 'largura_util':
            const diff = form.getFieldValue('largura_util') - form.getFieldValue('cortes')[index].largura_util;
            console.log(diff)
            if (diff >= 40) {
                return "#ff4d4f";
            }
            if (diff != 0) {
                return "#ffec3d";
            }
            break;
    }
}

const RowHover = styled(Row)`
    cursor:pointer;
    padding:5px;
    ${({ selected }) => (selected === 1) && `background-color:#d9f7be;`}
    border-radius:3px;
    ${({ selected }) => (selected === 0) && `
    &:hover {
        background-color:#f5f5f5;
    `}

  }`;

const loadCortesOrdemLookup = async ({ cortes, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/cortesordemlookup/`, filter: { cortes }, sort: [{ column: 'versao', direction: 'DESC' }], signal });
    return rows;
}

const loadNWNonwovensLookup = async ({ produto_id, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/nonwovenslookup/`, filter: { produto_id }, sort: [], signal });
    return rows;
}

const VersionsPopup = ({ record, closeSelf }) => {
    const [visible, setVisible] = useState({ drawer: { open: false } });
    const dataAPI = useDataAPI({ payload: { parameters: {}, pagination: { enabled: false, limit: 30 }, filter: {}, sort: [] } });
    const primaryKeys = ['id'];
    const columns = [
        { key: 'versao', name: 'Versão', width: 30 },
        { key: 'designacao', name: 'Designação', width: 150 },
        { key: 'largura_ordem', name: 'Posicionamento', formatter: p => <div style={{ color: "#1890ff", fontWeight: 600 }}>{p.row.largura_ordem.replaceAll('"', ' ')}</div> }
    ];

    useEffect(() => {
        dataAPI.setData({ rows: record.versions }, { tstamp: Date.now() });
    }, []);

    const onOpen = (component, data) => {
        setVisible(prev => ({ ...prev, [component]: { ...data, title: <div>Bobine <span style={{ fontWeight: 900 }}>{data.nome}</span></div>, open: true } }));
    }

    const onClose = (component) => {
        setVisible(prev => ({ ...prev, [component]: { open: false } }));
    }

    const onSelect = (row, col) => {
        record.onSelect(row);
        closeSelf();
    }

    return (<YScroll>
        <Table
            onRowClick={onSelect}
            rowStyle={`cursor:pointer;font-size:12px;`}
            headerStyle={`background-color:#f0f0f0;font-size:10px;`}
            loadOnInit={false}
            columns={columns}
            dataAPI={dataAPI}
            toolbar={false}
            search={false}
            moreFilters={false}
            rowSelection={false}
            primaryKeys={primaryKeys}
            editable={false}
        //rowHeight={28}
        />
    </YScroll>);
}


const NonwovensPopup = ({ record, closeSelf }) => {
    const [visible, setVisible] = useState({ drawer: { open: false } });
    const dataAPI = useDataAPI({ payload: { url: `${API_URL}/materiasprimaslookup/`, parameters: {}, pagination: { enabled: false, limit: 30 }, filter: {}, sort: [] } });
    const submitting = useSubmitting(true);
    const [formFilter] = Form.useForm();
    const defaultParameters = { type: 'nonwovens', qty: true };
    const defaultFilters = {};
    const defaultSort = [{ column: 'ITMREF_0', direction: 'ASC' }];
    const primaryKeys = ['ITMREF_0'];
    const columns = [
        { key: 'ITMREF_0', name: 'Código', width: 160 },
        { key: 'ITMDES1_0', name: 'Designação' },
        { key: 'TSICOD_3', name: 'Largura', width: 100 },
        { key: 'comp', name: 'Comprimento', formatter: p => p.row.TSICOD_3 && (p.row.QTYPCU_0 / (p.row.TSICOD_3 / 1000)).toFixed(0), width: 100 }
    ];
    useEffect(() => {
        const controller = new AbortController();
        loadData({ init: true, signal: controller.signal });
        return (() => controller.abort());
    }, []);
    const loadData = ({ init = false, signal }) => {
        if (init) {
            const { type, qty, ...initFilters } = loadInit({ ...defaultFilters, ...defaultParameters }, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, {}, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter())]);
            let { filterValues, fieldValues } = fixRangeDates([], initFilters);
            formFilter.setFieldsValue({ ...fieldValues });
            dataAPI.addFilters(filterValues, true, false);
            dataAPI.setSort(defaultSort);
            dataAPI.addParameters({ type, qty }, true, false);
            dataAPI.fetchPost({ signal });
        }
        submitting.end();
    }
    const onOpen = (component, data) => {
        setVisible(prev => ({ ...prev, [component]: { ...data, title: <div>Bobine <span style={{ fontWeight: 900 }}>{data.nome}</span></div>, open: true } }));
    }
    const onClose = (component) => {
        setVisible(prev => ({ ...prev, [component]: { open: false } }));
    }
    const onSelect = (row, col) => {
        record.onSelect(row, record.pos, record.index);
        closeSelf();
    }
    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const { typelist, ...vals } = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
                const _values = {
                    ...vals,
                    fmulti_artigo: getFilterValue(vals?.fmulti_artigo, 'any')
                };
                dataAPI.addFilters(_values, true);
                //dataAPI.addParameters({ typelist })
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
    };

    return (<YScroll>
        <Table
            onRowClick={onSelect}
            rowStyle={`cursor:pointer;font-size:12px;`}
            headerStyle={`background-color:#f0f0f0;font-size:10px;`}
            loadOnInit={false}
            columns={columns}
            dataAPI={dataAPI}
            toolbar={true}
            search={true}
            moreFilters={false}
            rowSelection={false}
            primaryKeys={primaryKeys}
            editable={false}
            toolbarFilters={{
                filters: <Col xs='content'><Field name="fmulti_artigo" label={{ enabled: true, text: "Artigo", pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear width={200} />
                </Field></Col>,
                form: formFilter, schema, wrapFormItem: true,
                onFinish: onFilterFinish, onValuesChange: onFilterChange
            }}
        //rowHeight={28}
        />
    </YScroll>);
}

const NonwovenPos = ({ field, form, index, showNWLookup, allowEdit, submitting, pos }) => {
    return (
        <Row nogutter>
            <Col>
                <Row gutterWidth={5} style={{ alignItems: "center", height: "50px", border: "solid 1px #dcdddf", marginBottom: "1px", borderRadius: "3px" }}>
                    <Col width={30} style={{ height: "48px", background: "#dcdddf" }}><Row nogutter><Col>{pos === 'inf' ? 'Inf.' : 'Sup.'}</Col></Row><Row nogutter><Col><Button disabled={(!allowEdit.form || submitting.state)} icon={<EllipsisOutlined />} size="small" onClick={() => showNWLookup(index, pos)} /></Col></Row></Col>
                    <Col width={30}><Field forInput={false} name={[field.name, pos, 'qtd']} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "100%", padding: "0px" }} controls={false} /></Field></Col>
                    {/* <Col width={30}><Button disabled={(!allowEdit.form || submitting.state)} icon={<SearchOutlined />} size="small" onClick={() => showNWLookup(index, pos)} /></Col> */}
                    {form.getFieldValue([`nonwovens`, index, pos]) ? <>
                        <Col>
                            <Row gutterWidth={5}><Col style={{ fontWeight: 600 }}>{form.getFieldValue([`nonwovens`, index, pos, "ITMDES1_0"])}</Col></Row>
                            <Row gutterWidth={5} style={{ alignItems: "center" }}><Col xs="content">{form.getFieldValue([`nonwovens`, index, pos, "ITMREF_0"])}</Col>
                                <Col width={60}><Field forInput={false} name={[field.name, pos, 'TSICOD_3']} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "100%", padding: "0px" }} controls={false} addonAfter="mm" /></Field></Col>
                                <Col width={100}><Field forInput={true} name={[field.name, pos, 'comp']} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "100%", padding: "0px" }} controls={false} addonAfter={<span>m<sup>2</sup></span>} /></Field></Col>
                            </Row>
                        </Col>
                    </> : <Col></Col>}
                </Row>
            </Col>
            <Col xs="content" style={{textAlign:"center"}}>{(allowEdit.form || submitting.state) && <div /* className={classNames(classes.right)} */><IconButton /* onClick={(e) => removeRow(e, field.name, field)} */ style={{ alignSelf: "center" }}><CgCloseO /></IconButton></div>}</Col>
        </Row>
    );
}

export default ({ props }) => {
    const classes = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const [visible, setVisible] = useState(true);
    const [form] = Form.useForm();
    const [fieldStatus, setFieldStatus] = useState({});
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });

    const permission = usePermission({ allowed: { planeamento: 200, producao: 200 } });
    const [allowEdit, setAllowEdit] = useState({ form: false });
    const [modeEdit, setModeEdit] = useState({ form: false });

    const submitting = useSubmitting(true);
    const [larguras, setLarguras] = useState([]);
    const [cortes, setCortes] = useState();
    const [lineTemplate, setLineTemplate] = useState();
    const [optimizedCuts, setOptimizedCuts] = useState();
    const [estadoProducao, setEstadoProducao] = useState();
    // const [versions, setVersions] = useState([]);
    const [selected, setSelected] = useState();
    const [produtoId, setProdutoId] = useState();

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.type) {
                case "versions": return <VersionsPopup record={{ ...modalParameters }} />
                case "nwlookup": return <NonwovensPopup record={{ ...modalParameters }} />
            }
        }

        return (
            <ResponsiveModal title={modalParameters.title} onCancel={hideModal} width={modalParameters.width ? modalParameters.width : 600} height={modalParameters.height ? modalParameters.height : 250} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    const loadStockCutOptimizer = async (child_rolls, parent_rolls, max_cutters) => {
        const { data } = await fetchPost({ url: `${API_URL}/stockcutoptimizer/`, parameters: { child_rolls, parent_rolls, max_cutters } });
        return data;
        //setOptimizedCuts(data);
    }

    const loadEstadoProducao = async (record) => {
        return await fetchPost({ url: `${API_URL}/estadoproducao/`, pagination: { enabled: false }, filter: { agg_of_id: record.ofs[0]["agg_of_id"] } });
    }

    const loadData = async (record) => {
        let _estadoProducao = await loadEstadoProducao(record);
        setEstadoProducao(_estadoProducao.data.paletes_bobines);
        setProdutoId(record.produto.produto_id);
        const headerFields = [];
        const unique = {};
        let linear_meters = 0;
        record.ofs.forEach((v, i) => {
            if (i === 0) {
                linear_meters = v.linear_meters;
            }
            let details = json(json(record.paletizacao.find(x => x.of_id === v.of_id))?.paletizacao)?.details;
            let cnt_paletes = details.reduce((count, v) => v.item_id === 1 ? count + 1 : count, 0);
            //let n_bobines = details.reduce((ac, x) => { return (x.item_id === 2) ? ac + x.item_numbobines : ac; }, 0)
            let bobines = details.filter(x => x.item_id === 2);
            for (let b of bobines) {
                if (!(`${v.artigo_lar}_${b.item_numbobines}` in unique)) {
                    unique[`${v.artigo_lar}_${b.item_numbobines}`] = 1;
                    headerFields.push({ largura: v.artigo_lar, n_bobines: b.item_numbobines, n_paletes_original: (v.n_paletes_total / cnt_paletes), n_paletes: (v.n_paletes_total / cnt_paletes), n_paletes_stock: 0, n_bobines_total: (b.item_numbobines * (v.n_paletes_total / cnt_paletes)), n_paletes_para_stock: 0 });
                } else {
                    let idx = headerFields.findIndex(x => x.largura === v.artigo_lar && x.n_bobines === b.item_numbobines);
                    headerFields[idx].n_paletes_original = headerFields[idx].n_paletes_original + (v.n_paletes_total / cnt_paletes);
                    headerFields[idx].n_paletes = headerFields[idx].n_paletes + (v.n_paletes_total / cnt_paletes);
                    headerFields[idx].n_paletes_stock = headerFields[idx].n_paletes_stock + 0;
                    headerFields[idx].n_bobines_total = headerFields[idx].n_bobines_total + (b.item_numbobines * (v.n_paletes_total / cnt_paletes));
                }

            }
        });
        setLarguras([...new Set(headerFields.map(v => v.largura))]);
        form.setFieldsValue({ larguras: headerFields, linear_meters });
        submitting.end();
    }

    useEffect(() => {
        const { ...initData } = loadInit({}, {}, props, location?.state, [...Object.keys(location?.state ? location?.state : {})]);
        setAllowEdit({ form: permission.allow() });
        setModeEdit({ form: permission.allow() });
        loadData(initData?.record);

        //generateLineTemplate();
    }, []);

    const onUpdateBobinesStock = () => {
        const a = form.getFieldsValue(true);
        for (let [i, v] of a.larguras.entries()) {
            let ep = estadoProducao.find(x => x.artigo_lar === v.largura && x.bobines_por_palete === v.n_bobines);
            console.log("%%%%%%%%%%%%",ep,estadoProducao,a.larguras)
            let l = a.larguras[i];
            a.larguras[i].n_paletes_stock = ep.num_paletes_stock_in;
            a.larguras[i].n_bobines_total = (l.n_paletes - l.n_paletes_stock) * l.n_bobines;
            let _paleteproduzir = l.n_paletes - ep.num_paletes_stock_in;
            a.larguras[i].n_paletes_para_stock = l.n_paletes_original < _paleteproduzir ? _paleteproduzir - l.n_paletes_original : 0;
        }
        form.setFieldsValue({ ...a });
    }

    const onValuesChange = (v, a) => {
        if ("larguras" in v) {
            let idx = v.larguras.length;
            let l = a.larguras[idx - 1];
            a.larguras[idx - 1].n_bobines_total = (l.n_paletes - l.n_paletes_stock) * l.n_bobines;
            let _paleteproduzir = l.n_paletes - l.n_paletes_stock;
            a.larguras[idx - 1].n_paletes_para_stock = l.n_paletes_original < _paleteproduzir ? _paleteproduzir - l.n_paletes_original : 0;
            form.setFieldsValue({ ...a });
        }
        if ("cortes" in v) {
            if (form.getFieldsValue(["remove"])?.remove === true) {
                form.setFieldsValue({ remove: false });
            }
            else {
                let _max_cutters = form.getFieldValue("max_cutters")
                let idx = v.cortes.length;
                let l = a.cortes[idx - 1];
                let _n_cuts = Object.values(l.n_cortes).reduce((a, b) => a + b, 0);
                if (_n_cuts > _max_cutters) {
                    l.n_cortes[Object.keys(v.cortes[idx - 1].n_cortes)[0]] = Object.values(v.cortes[idx - 1].n_cortes)[0] - (_n_cuts - _max_cutters);
                }
                let _lar_util = Object.entries(l.n_cortes).reduce((a, b) => a + (b[0] * b[1]), 0);
                let _n_bobines_total = Object.entries(l.n_cortes).reduce((a, b) => a + (b[1] * l.n), 0);
                a.cortes[idx - 1].largura_util = _lar_util;
                a.cortes[idx - 1].n_bobines_total = _n_bobines_total;
                if (l.idx === selected?.idx) {
                    if (JSON.stringify(l.n_cortes) !== JSON.stringify(selected.n_cortes)) {
                        const _cortes_ordem = [];
                        for (let x of larguras) {
                            _cortes_ordem.push(...(new Array(l.n_cortes[x])).fill(x));
                        }
                        a.cortes[idx - 1].cortes_ordem = _cortes_ordem;
                        setSelected(a.cortes[idx - 1]);
                    }
                }
                form.setFieldsValue({ ...a });
            }
        }
    };

    const gerar = async () => {
        let _lines = [];
        let values = form.getFieldsValue(true);

        const child_rolls = values.larguras.map(v => {
            return [v.n_bobines_total, v.largura];
        });
        const parent_rolls = [[10, values.largura_util]];
        const max_cutters = values.max_cutters;
        const _op = await loadStockCutOptimizer(child_rolls, parent_rolls, max_cutters);
        for (const [i, v] of _op.entries()) {
            let _template = { largura: {}, n_cortes: {} };
            let _n_bobines_total = 0;
            let _cortes_ordem = [];
            for (let x of larguras) {
                let _cuts = (x in v.cuts_count) ? v.cuts_count[x] : 0;
                _template = { largura: { ..._template.largura, [x]: x }, n_cortes: { ..._template.n_cortes, [x]: _cuts } };
                _n_bobines_total += _cuts;
                _cortes_ordem.push(...(new Array(_cuts)).fill(x));
            }
            _lines.push({ idx: uuidv4(), ..._template, n: v.n, largura_util: v.largura_util, selected: 0, /* cuts: v.cuts_count */ n_bobines_total: _n_bobines_total * v.n, cortes_ordem: _cortes_ordem });
        }
        setSelected(null);
        form.setFieldsValue({ cortes: _lines });
    }

    const onGerar = async () => {
        submitting.trigger();
        if (!form.getFieldValue("cortes")) {
            await gerar();
            submitting.end();
        } else {
            Modal.confirm({
                title: <div>Deseja gerar novos esquemas de corte?</div>, content: <div>Atenção!! Se continuar, todos os esquemas de cortes definidos serão perdidos!</div>, onCancel: () => submitting.end(), onOk: async () => {
                    await gerar();
                    submitting.end();
                }
            });
        }
    }

    const onSelectCorte = async (index) => {
        let _sel = null;
        form.getFieldValue("cortes")
        const c = form.getFieldValue("cortes").map((v, i) => {
            if (i === index) {
                _sel = v;
            }
            return v;
        })
        form.setFieldsValue({ cortes: c });
        //setVersions(await loadCortesOrdemLookup({ cortes: JSON.stringify(form.getFieldValue("cortes")[index].n_cortes) }));
        setSelected(_sel);
    }

    const showVersions = async () => {
        const versions = await loadCortesOrdemLookup({ cortes: JSON.stringify(selected.n_cortes) });
        setModalParameters({ type: 'versions', width: 850, title: <div>Versões de Posicionamento <span style={{ fontWeight: 900 }}>{JSON.stringify(selected.n_cortes).replaceAll(":", "x").replaceAll('"', "")}</span></div>, versions, onSelect: onSelectCortesOrdem });
        showModal();
    }

    const showNWVersions = async () => {
        /*         const versions = await loadCortesOrdemLookup({ cortes: JSON.stringify(selected.n_cortes) });
                setModalParameters({ type: 'versions', width: 850, title: <div>Versões de Posicionamento <span style={{ fontWeight: 900 }}>{JSON.stringify(selected.n_cortes).replaceAll(":", "x").replaceAll('"', "")}</span></div>, versions, onSelectCortesOrdem });
                showModal(); */
    }



    const showNWLookup = async (index, pos) => {
        setModalParameters({ type: 'nwlookup', width: 850, height: 350, title: <div>Nonwovens</div>, onSelect: onSelectNonwoven, pos, index });
        showModal();
    }

    const onSelectNonwoven = (row, pos, index) => {
        form.setFieldValue(["nonwovens", index, pos], {...row,comp:row?.QTYPCU_0/(row?.TSICOD_3/1000)});
        //console.log(form.getFieldValue(["nonwovens",index,type]));
        console.log(row, index, pos);
    }

    const onSelectCortesOrdem = (row) => {
        onChangeCortesOrdem(selected.idx, json(row.largura_ordem));
    }

    const subTotal = (type) => {
        switch (type) {
            case 'bobines_a_produzir':
                return (form.getFieldValue('larguras')) && form.getFieldValue('larguras').reduce((a, b) => a + b.n_bobines_total, 0);
            case 'paletes_a_produzir':
                return (form.getFieldValue('larguras')) && form.getFieldValue('larguras').reduce((a, b) => a + b.n_paletes, 0);
            case 'paletes_stock':
                return (form.getFieldValue('larguras')) && form.getFieldValue('larguras').reduce((a, b) => a + b.n_paletes_stock, 0);
            case 'bobines_total':
                return (form.getFieldValue('cortes')) && form.getFieldValue('cortes').reduce((a, b) => a + b.n_bobines_total, 0);
            case 'n_bobinagens':
                return (form.getFieldValue('cortes')) && form.getFieldValue('cortes').reduce((a, b) => a + b.n, 0);
        }
    }

    const onChangeCortesOrdem = (idx, ordem) => {
        const index = form.getFieldValue(["cortes"]).findIndex(x => x.idx === idx);
        setSelected(prev => ({ ...prev, cortes_ordem: ordem }));
        form.setFieldValue(["cortes", index, 'cortes_ordem'], ordem);
    }

    const onLineClick = () => {
        setSelected(prev => ({ ...prev, inuse: true }));
        form.setFieldsValue({ cortes: form.getFieldValue("cortes").map(v => ({ ...v, inuse: v.idx === selected.idx ? 1 : 0 })) });
    }

    return (
        <Form form={form} name={`f-cortes-steps`} onValuesChange={onValuesChange} initialValues={{ largura_util: 2100, max_cutters: 24, base_init: "planned" }}>
            <TitleForm data={{}} onChange={() => { }} form={form} />
            <AlertsContainer /* id="el-external" */ mask /* fieldStatus={fieldStatus} */ formStatus={formStatus} portal={false} />
            <FormContainer fluid id="FRM-CORTES-STEPS" forInput={true} loading={submitting.state} wrapForm={false} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} style={{ marginTop: "5px", padding: "15px" }} schema={schema} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }}>
                <Row>
                    <Col lg={6} xs={12}>
                        <HorizontalRule title="Definições Gerais" marginTop='0px' />
                        <Row>
                            <Col width={120}><Field name="largura_util" label={{ enabled: true, text: "Largura Útil", pos: "top" }}><InputNumberField size="small" controls={false} addonAfter={<b>mm</b>} min={100} max={2400} /></Field></Col>
                            <Col width={120}><Field name="max_cutters" label={{ enabled: true, text: "Nº de Bandas", pos: "top" }}><InputNumberField size="small" controls={false} min={1} max={25} /></Field></Col>
                            <Col width={120}>
                                <Field name="linear_meters" label={{
                                    enabled: true, text: <Tooltip title="Os metros lineares de cada bobinagem, são calculados por meio de um modelo teórico." color="blue">
                                        <div style={{ display: "flex", alignItems: "center" }}><span>Metros Lineares</span><InfoCircleOutlined style={{ color: "#096dd9", marginLeft: "4px" }} /></div></Tooltip>, pos: "top"
                                }}><InputNumberField size="small" controls={false} addonAfter={<b>m</b>} min={100} max={5000} /></Field>
                            </Col>
                            <Col></Col>
                        </Row>
                        <Row>

                            <Col></Col>
                        </Row>
                        <VerticalSpace />
                        <Form.List name="larguras">
                            {(fields, { add, remove, move }) => {
                                const addRow = (fields) => { }
                                const removeRow = (fieldName, field) => { }
                                const moveRow = (from, to) => { }
                                return (
                                    <>
                                        <HorizontalRule title="Necessidades de Produção" description={<Space><Button disabled={(!allowEdit.form || submitting.state)} size="small" onClick={onUpdateBobinesStock} value="state">Atualizar Bobines de Stock</Button><Button disabled={(!allowEdit.form || submitting.state)} size="small" onClick={onGerar}>Gerar Plano de Cortes</Button></Space>} />
                                        <Row gutterWidth={5}>
                                            <Col width={65} style={{ /* fontWeight: 700 */ }}></Col>
                                            <Col width={65} style={{ /* fontWeight: 700 */ }}>Bobines por Palete</Col>
                                            <Col></Col>
                                            <Col width={65} style={{ /* fontWeight: 700 */ }}>Paletes</Col>
                                            <Col width={65} style={{ /* fontWeight: 700 */ }}>Paletes de Stock</Col>
                                            <Col></Col>
                                            <Col width={65} style={{ /* fontWeight: 700 */ }}>Bobines a Produzir</Col>
                                            <Col width={65} style={{ /* fontWeight: 700 */ }}>Paletes para Stock</Col>
                                        </Row>
                                        {fields.map((field, index) => (
                                            <Row key={field.key} gutterWidth={5}>
                                                <Col width={65}><Field forInput={false} name={[field.name, `largura`]} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "100%", }} controls={false} addonAfter={<b>mm</b>} /></Field></Col>
                                                <Col width={65}><Field forInput={false} name={[field.name, `n_bobines`]} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "100%", }} controls={false} /></Field></Col>
                                                <Col></Col>
                                                <Col width={65} ><Field name={[field.name, `n_paletes`]} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "100%", }} controls={false} /></Field></Col>
                                                <Col width={65} ><Field name={[field.name, `n_paletes_stock`]} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "100%", }} controls={false} /></Field></Col>
                                                <Col></Col>
                                                <Col width={65}><Field forInput={false} name={[field.name, `n_bobines_total`]} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "100%", }} controls={false} /></Field></Col>
                                                <Col width={65}><Field forInput={false} name={[field.name, `n_paletes_para_stock`]} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "100%", }} controls={false} /></Field></Col>
                                            </Row>
                                        ))}
                                        <Row gutterWidth={5}>
                                            <Col width={65}></Col>
                                            <Col width={65}></Col>
                                            <Col></Col>
                                            <Col width={65} style={{ borderTop: "solid 2px #000", textAlign: "end", paddingRight: "5px", fontWeight: 600 }}>{subTotal('paletes_a_produzir')}</Col>
                                            <Col width={65} style={{ borderTop: "solid 2px #000", textAlign: "end", paddingRight: "5px", fontWeight: 600 }}>{subTotal('paletes_stock')}</Col>
                                            <Col></Col>
                                            <Col width={65} style={{ borderTop: "solid 2px #000", textAlign: "end", paddingRight: "5px", fontWeight: 600 }}>{subTotal('bobines_a_produzir')}</Col>
                                            <Col width={65}></Col>
                                        </Row>
                                    </>
                                )
                            }
                            }
                        </Form.List>
                        <VerticalSpace />
                        <Form.List name="cortes">
                            {(fields, { add, remove, move }) => {
                                const addRow = (fields) => {
                                    let _template = { largura: {}, n_cortes: {} };
                                    for (let x of larguras) {
                                        _template = { largura: { ..._template.largura, [x]: x }, n_cortes: { ..._template.n_cortes, [x]: 0 } };
                                    }
                                    add({ idx: uuidv4(), ..._template, n: 0, largura_util: 0, n_bobines_total: 0, cortes_ordem: [] });
                                }
                                const removeRow = (e, fieldName, field) => {
                                    e.stopPropagation();
                                    form.setFieldsValue({ remove: true });
                                    remove(fieldName);
                                }
                                const moveRow = (from, to) => {
                                    //move(from, to);
                                }
                                return (
                                    <>
                                        <HorizontalRule title="Plano de Cortes" description={<Button size="small" disabled={(!allowEdit.form || submitting.state)} onClick={() => addRow(fields)} style={{ width: "100%" }}><PlusOutlined />Nova combinação de cortes </Button>} />
                                        {fields.map((field, index) => (
                                            <RowHover wrap='nowrap' selected={form.getFieldValue([`cortes`, field.name, "idx"]) === selected?.idx ? 1 : 0} key={field.key} gutterWidth={5} onClick={(e) => onSelectCorte(index)}>
                                                {/* <Col width={20} style={{ alignSelf: "center" }}><Field forInput={(allowEdit.form || submitting.state)} name={[field.name, `selected`]} label={{ enabled: false }}><Radio checked={form.getFieldValue([`cortes`, field.name, "selected"]) === 0 ? false : true} /></Field></Col> */}
                                                <Col width={30} style={{ alignSelf: "center" }}><b>{index + 1} </b></Col>

                                                {larguras.map(v => {
                                                    return (<React.Fragment key={`${field.key}_${v}`}>
                                                        <Col width={70}><Field forInput={false} name={[field.name, `largura`, `${v}`]} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "65px", padding: "0px" }} controls={false} addonAfter={<b>mm</b>} /></Field></Col>
                                                        <Col width={52} style={{ flexDirection: "row", display: "flex", alignItems: "center", marginRight: "10px" }}><div>&nbsp;x&nbsp;</div><Field name={[field.name, `n_cortes`, `${v}`]} label={{ enabled: false }}><InputNumber onClick={(e) => e.stopPropagation()} size="small" style={{ width: "35px", textAlign: "right", padding: "0px" }} controls={false} min={0} max={25} /></Field></Col>
                                                    </React.Fragment>);
                                                })}
                                                <Col></Col>
                                                <Col width={90} style={{ alignSelf: "center" }}>{form.getFieldValue(["cortes", field.name, 'inuse']) === 1 && <Tag icon={<SyncOutlined spin />} color="processing">Em Uso</Tag>}</Col>
                                                <Col width={65}><Field name={[field.name, 'n']} label={{ enabled: false }}><InputNumberField onClick={(e) => e.stopPropagation()} size="small" style={{ width: "100%", padding: "0px" }} controls={false} /></Field></Col>
                                                <Col width={65}><Field forInput={false} name={[field.name, 'n_bobines_total']} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "100%", padding: "0px" }} controls={false} /></Field></Col>
                                                <Col width={75}><Field forInput={false} name={[field.name, 'largura_util']} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "100%", padding: "1px", backgroundColor: coloured('largura_util', form, index) }} controls={false} addonAfter={<b>mm</b>} /></Field></Col>
                                                <Col width={20}>{(allowEdit.form || submitting.state) && <div className={classNames(classes.right)}><IconButton onClick={(e) => removeRow(e, field.name, field)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton></div>}</Col>
                                            </RowHover>
                                        ))}
                                        {form.getFieldValue("cortes")?.length > 0 &&
                                            <Row wrap='nowrap' gutterWidth={5}>
                                                <Col width={20}></Col>
                                                {larguras.map((v, i) => {
                                                    return (<React.Fragment key={`col-${i}`}>
                                                        <Col width={70}></Col>
                                                        <Col width={52} style={{ marginRight: "10px" }}></Col>
                                                    </React.Fragment>);
                                                })}
                                                <Col></Col>
                                                <Col width={65} style={{ borderTop: "solid 2px #000", textAlign: "end", paddingRight: "10px", fontWeight: 600 }}>{subTotal("n_bobinagens")}</Col>
                                                <Col width={65} style={{ borderTop: "solid 2px #000", textAlign: "end", paddingRight: "10px", fontWeight: 600 }}>{subTotal("bobines_total")}</Col>
                                                <Col width={75}></Col>
                                                <Col width={20}></Col>
                                            </Row>
                                        }
                                    </>
                                )
                            }
                            }
                        </Form.List>
                        {selected && <>
                            <HorizontalRule title="Posicionamento dos Cortes" description={
                                <Space>
                                    <Button size="small" disabled={(!allowEdit.form || submitting.state)} onClick={onLineClick} style={{ width: "100%" }}>Definir esquema Em Uso</Button>
                                    <Button size="small" disabled={(!allowEdit.form || submitting.state)} onClick={showVersions} style={{ width: "100%" }}><HistoryOutlined />Versões</Button>
                                </Space>
                            } />
                            <FormCortesOrdem /* idx={selected.idx} */ onChangeCortesOrdem={onChangeCortesOrdem} /* record={form.getFieldValue(["cortes"]).find(x => x.idx === selected.idx)} */ record={selected} larguras={larguras} />
                        </>}
                    </Col>
                    <Col>
                        <Form.List name="nonwovens">
                            {(fields, { add, remove, move }) => {
                                const addRow = (fields) => {

                                    /*"id": 21,
                                    "versao": 5,
                                    "designacao": "2022-10-10 17:52:02",
                                    "nw_cod_inf": "N00000000000085",
                                    "nw_cod_sup": "N00000000000085",
                                    "nw_des_inf": "Nonwoven Spunlace Sandler 01191-001 25gsm L2150",
                                    "nw_des_sup": "Nonwoven Spunlace Sandler 01191-001 25gsm L2150",
                                    "produto_id": 3,
                                    "created_date": "2022-10-10 17:52:02.294154",
                                    "updated_date": "2022-10-10 17:52:02.294160"
                                    */

                                    add({ nbobinagem: 1, nw_cod_inf: null, nw_cod_sup: null, nw_des_inf: null, nw_des_sup: null });
                                    /* if (fields.length === 0 && type == "furos") {
                                        add({ [`min`]: 1, [`max`]: p.row.comp_actual, "unit": unit, removeCtrl: true });
                                    } else {
                                        add({ [`min`]: null, [`max`]: null, "unit": unit, ...(type == "ff" && { "type": "Desbobinagem" }), removeCtrl: true });
                                    } */
                                }
                                const removeRow = (fieldName, field) => {
                                    remove(fieldName);
                                }
                                const moveRow = (from, to) => {
                                    //move(from, to);
                                }
                                return (
                                    <>
                                        <HorizontalRule marginTop='0px' title="Nonwovens" description={<Space>
                                            <Button type="default" size="small" disabled={(!allowEdit.form || submitting.state)} onClick={() => addRow(fields)} style={{ width: "100%" }}>Adicionar</Button>
                                            {/*                                             <Button type="default" size="small" disabled={(!allowEdit.form || submitting.state)} onClick={() => addRow(fields)} style={{ width: "100%" }}>Troca de Nonwovens</Button>
                                            <Button type="default" size="small" disabled={(!allowEdit.form || submitting.state)} onClick={() => addRow(fields)} style={{ width: "100%" }}>Troca de Granulado</Button> */}
                                        </Space>} />
                                        <Row gutterWidth={5} style={{ fontWeight: 600 }}>
                                            <Col width={70}>Bobinagem</Col>
                                            <Col></Col>
                                        </Row>
                                        {fields.map((field, index) => (
                                            <Row key={field.key} gutterWidth={5} style={{ marginBottom: "10px", paddingBottom: "5px", alignItems: "center", borderBottom: "solid 1px #dcdddf" }}>
                                                <Col width={70}><Field name={[field.name, 'nbobinagem']} label={{ enabled: false }}><InputNumberField size="small" style={{ width: "100%", padding: "0px" }} controls={false} /></Field></Col>
                                                <Col>
                                                    <NonwovenPos allowEdit={allowEdit} field={field} form={form} index={index} pos="sup" showNWLookup={showNWLookup} submitting={submitting} />
                                                    <NonwovenPos allowEdit={allowEdit} field={field} form={form} index={index} pos="inf" showNWLookup={showNWLookup} submitting={submitting} />
                                                </Col>
                                            </Row>


                                        ))}
                                    </>
                                )
                            }
                            }
                        </Form.List>
                    </Col>
                </Row>
            </FormContainer>
        </Form>


    )
}