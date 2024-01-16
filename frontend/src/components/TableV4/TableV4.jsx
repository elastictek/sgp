import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useSubmitting } from "utils";
import { usePermission } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { isEmpty, isNil } from 'ramda';
import { uid } from 'uid';
import dayjs from 'dayjs';
import { json, includeObjectKeys, excludeObjectKeys, isObjectEmpty } from "utils/object";
import { Button, Spin, Input, Flex, Badge, Select, Popover, Menu, Drawer, List, Avatar } from "antd";
import Icon, { EditOutlined, RollbackOutlined, PlusOutlined, SearchOutlined, SettingOutlined, ReloadOutlined, FilterOutlined, ConsoleSqlOutlined, MoreOutlined } from '@ant-design/icons';
import ClearSort from 'assets/clearsort.svg';
import MoreFilters from 'assets/morefilters.svg'
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import YScroll from 'components/YScroll';
import XScroll, { RowXScroll } from 'components/XScroll';
import Pagination, { paginationI18n } from './PaginatorV4';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';

import { AgGridReact } from 'ag-grid-react';
import { removeEmpty, unique } from 'utils/index';
import { DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, API_URL } from 'config';
import TextArea from 'antd/es/input/TextArea';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { fetchPost } from 'utils/fetch';
// import 'ag-grid-enterprise';
// import { LicenseManager } from "ag-grid-enterprise";
// LicenseManager.setLicenseKey("my-license-key");
const GRID_CELL_CLASSNAME = 'ag-cell';

export const TableContext = React.createContext({});

const GridContainer = styled.div`
  height: 100%;
  width: 100%;    
  .ag-custom{
    height: 100%;
    width: 100%;
    --ag-font-size: 11px;
   }
`;
const StatusRightPanel = ({ loading, dataAPI, modeApi, showRange, allowGoTo, showFromTo, showTotalCount, ...props }) => {

    const onPageSizeChange = useCallback((n) => {
        dataAPI.pageSize(n, true);
        //props.api.setGridOption("paginationPageSize", n);
    }, []);

    const onPageChange = useCallback((page, refresh = false) => {
        if (refresh) {
            props.api.refreshServerSide({ purge: true });
        } else {
            props.api.paginationGoToPage(page - 1);
        }
    }, []);

    return (<div style={{ color: "#000" }}>
        <div>{!modeApi.isOnMode() && <Pagination loading={loading} showRange={showRange} onPageSizeChange={onPageSizeChange} allowGoTo={allowGoTo} showTotalCount={showTotalCount} showFromTo={showFromTo} totalCount={dataAPI.getTotalRows()} rowsFromTo={dataAPI.getRowsFromTo()} onPageChange={onPageChange} currentPage={dataAPI.getCurrentPage()} pageSize={dataAPI.getPageSize()} /* {...paginationProps} */ /* {...(editable.enabled || editable.add) && { skip: dataAPI?.getSkip() }} */ {...paginationI18n} /* bordered={false} */ />}</div>
    </div>)
}

const _filters = (filters, gridRef, all = false) => {
    let _idx = filters?.toolbar.indexOf("@columns");
    let _newfilters = (_idx >= 0) ? [...filters?.toolbar.slice(0, _idx), ...gridRef.current.api.getColumnDefs().filter(v => !filters?.no.includes(v.field)), ...filters?.toolbar.slice(_idx)] : [...filters?.toolbar];
    if (all) {
        let _idx = filters?.more.indexOf("@columns");
        let _morefilters = (_idx >= 0) ? [...filters?.more.slice(0, _idx), ...gridRef.current.api.getColumnDefs().filter(v => !filters?.no.includes(v.field)), ...filters?.more.slice(_idx)] : [...filters?.more];
        _newfilters = [..._newfilters, ..._morefilters, "fcustom"];
    }
    const _f = {};
    for (const v of _newfilters.filter(v => v !== "@columns")) {
        if (Object.prototype.toString.call(v) === '[object Object]') {
            let _headerName = "";
            if (v?.colId || v?.headerName) {
                _headerName = v?.headerName;
            } else {
                _headerName = gridRef.current.api.getColumnDefs().find(x => x.field === v.field)?.headerName;
            }
            let _alias = v.field;
            if (!v?.colId && !v?.alias) {
                _alias = gridRef.current.api.getColumnDefs().find(x => x.field === v.field)?.colId;
                if (!_alias) {
                    _alias = v.field;
                }
            }
            _f[v.field] = {
                type: v?.type ? v.type : _f?.[v.field]?.type ? _f[v.field]?.type : "input",
                name: v.field,
                alias: v?.colId ? v.colId : v?.alias ? v.alias : _f?.[v.field]?.colId ? _f[v.field]?.colId : _alias,
                style: v?.style ? v?.style : _f?.[v.field]?.style ? _f[v.field]?.style : null,
                op: v?.op ? v.op : _f?.[v.field]?.op ? _f[v.field]?.op : null,
                label: v?.label ? v.label : _f?.[v.field]?.label ? _f[v.field]?.label : _headerName ? _headerName : v.field,
                col: v?.col ? v.col : _f?.[v.field]?.col ? _f[v.field]?.col : "content",
                mask: v?.mask ? v.mask : _f?.[v.field]?.mask ? _f[v.field]?.mask : null,
                group: v?.group ? v.group : _f?.[v.field]?.group ? _f[v.field]?.group : "t1",
                multi: v?.multi ? v.multi : _f?.[v.field]?.multi ? _f[v.field]?.multi : false,
                exp: v?.exp ? v.exp : _f?.[v.field]?.exp ? _f[v.field]?.exp : null,
                options: v?.options ? v.options : _f?.[v.field]?.options ? _f[v.field]?.options : null
            }
        } else {
            const _s = gridRef.current.api.getColumnDefs().find(x => x.field === v);
            const _headerName = _s?.headerName;
            let _alias = _s?.colId;
            if (!_alias) {
                _alias = v;
            }
            _f[v] = {
                type: _f?.[v]?.type ? _f[v]?.type : "input",
                name: v,
                alias: _f?.[v]?.alias ? _f[v]?.alias : _alias,
                style: _f?.[v]?.style ? _f[v]?.style : null,
                op: _f?.[v]?.op ? _f[v]?.op : null,
                label: _f?.[v]?.label ? _f[v]?.label : _headerName ? _headerName : v,
                col: _f?.[v]?.col ? _f[v]?.col : "content",
                mask: _f?.[v]?.mask ? _f[v]?.mask : null,
                group: _f?.[v]?.group ? _f[v]?.group : "t1",
                multi: _f?.[v]?.multi ? _f[v]?.multi : false,
                exp: _f?.[v]?.exp ? _f[v]?.exp : null,
                options: _f?.[v]?.options ? _f[v]?.options : null,
            }
        }
    }
    return Object.values(_f);
};

const StyledMenu = styled(Menu)`
    .ant-menu-item{
        height:25px !important;
    }
`;

const StyledType = styled(Select).withConfig({
    shouldForwardProp: (prop, defaultValidatorFn) =>
        !['background'].includes(prop)
})`
    .ant-select-selector{
        ${(props) => props?.background && `background-color:#fafafa !important;`}
    }
`;

export const TypeRelation = ({ disabled, onChange, name, value, background = false }) => {
    return (
        <StyledType disabled={disabled} size='small' background={background} popupMatchSelectWidth={false} name={`rel-${name}`} onChange={(e) => onChange(name, e, true, false)} value={value} options={[{ value: "and", label: "e" }, { value: "or", label: "ou" }]} />
    );
};
export const TypeLogic = ({ onChange, name, value, background = false, disabled }) => {
    return (
        <StyledType disabled={disabled} size='small' background={background} popupMatchSelectWidth={false} name={`lo-${name}`} onChange={(e) => onChange(name, e, false, true)} value={value} options={[{ value: "!", label: "Não" }, { value: "", label: "" }]} />
    );
};
const DEFAULTWIDTH = "150px";
const FiltersToolbar = ({ onFilterFinish, onPredifinedFilters, onChange, _value, onSelectChange }) => {
    const { dataAPI, modeApi, gridRef, stateFilters, topToolbar: { filters, initFilterValues } = {} } = useContext(TableContext);
    const countFilters = useMemo(() => Object.keys(removeEmpty(dataAPI.getFilters())).length, [dataAPI.getFilters()]);

    return (<>
        {initFilterValues !== undefined &&
            <Flex wrap="nowrap" gap="small" align='end'>{_filters(filters, gridRef, false).map((v, i) =>
                <div key={`f-${v.name}.${i}`}>
                    <div style={{ padding: "0 0 5px" }}>
                        <label>{v.label}</label>
                    </div>
                    <div>
                        {(typeof v.type === 'function') ? v.type() :
                            {
                                // autocomplete: <AutoCompleteField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                // rangedatetime: <RangeDateField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                //rangedate: <Input addonBefore={<TypeRelation name={v.name} onChange={onChange} value={stateFilters?.[v.name]?.rel} />} size="small" value={_value(v.name)} onChange={(e) => onChange(v.name, e)} name={v.name} allowClear /* {...v?.filter?.field && v.filter.field} */ style={{ width: DEFAULTWIDTH, ...v?.style }} />,//<RangeDateField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                // rangetime: <RangeTimeField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                // number: <Input size="small" allowClear {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                // inputnumber: <InputNumber allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                // selectmulti: <SelectMultiField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                select: <div style={{ display: "flex", width: DEFAULTWIDTH, ...v?.style }}>
                                    {v.multi && <TypeLogic disabled={modeApi.isOnMode()} background name={v.name} onChange={onChange} value={stateFilters?.[v.name]?.logic} />}
                                    <Select disabled={modeApi.isOnMode()} mode={v.multi && "multiple"} allowClear popupMatchSelectWidth={false} style={{ width: "100%" }} size="small" name={v.name} value={_value(v.name, v.multi ? [] : null)} onChange={(x) => onSelectChange(v.name, x)} options={v.options} />
                                </div>,
                                options: <FilterSelect disabled={modeApi.isOnMode()} style={v?.style} name={v.name} _value={_value} onChange={onSelectChange} options={v?.options} />
                                // datetime: <DatetimeField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />
                            }[v.type] || <Input disabled={modeApi.isOnMode()} addonBefore={v.multi && <TypeRelation disabled={modeApi.isOnMode()} name={v.name} onChange={onChange} value={stateFilters?.[v.name]?.rel} />} size="small" value={_value(v.name)} onChange={(e) => onChange(v.name, e)} name={v.name} allowClear /* {...v?.filter?.field && v.filter.field} */ style={{ width: DEFAULTWIDTH, ...v?.style }} />

                        }
                    </div>
                </div>)}
                <div>
                    <Badge dot={countFilters > 0 ? true : false} offset={[-2, 0]} style={{ backgroundColor: '#52c41a' }} /* count={countFilters}  *//* size="small" */><Button disabled={modeApi.isOnMode()} onClick={() => onFilterFinish("filter", removeEmpty(stateFilters))} size="small" icon={<SearchOutlined />} /></Badge>
                    <Button size="small" disabled={modeApi.isOnMode()} onClick={onPredifinedFilters} icon={<MoreOutlined />} />
                </div>
            </Flex>
        }
    </>
    );
}

const ContentSettings = ({ modeApi, clearSort, showFilters, showMoreFilters, setIsDirty, onClick, dataAPI, columns/*  pageSize, setPageSize */, reportTitle: _reportTitle, moreFilters, reports, modeEdit, modeAdd, reportItems }) => {
    const [reportTitle, setReportTitle] = useState(_reportTitle);
    const permission = usePermission();
    const updateReportTitle = (e) => {
        setReportTitle(e.target.value);
    }
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <StyledMenu onClick={(v) => onClick(v)} items={[
                (permission.auth.isAdmin) && { label: 'Verificar Sql Query', key: 'sqlquery', icon: <ConsoleSqlOutlined />, data: {} },
                (!modeApi.isOnMode()) && { label: 'Atualizar', key: 'refresh', icon: <ReloadOutlined />, data: {} },
                (clearSort && !modeApi.isOnMode()) && { label: 'Limpar Ordenação', key: 'clearsort', icon: <Icon component={ClearSort} />, data: {} },
                (showFilters && !modeApi.isOnMode()) && { label: 'Limpar Filtros', key: 'clearfilters', icon: <FilterOutlined />, data: {} },
                (showMoreFilters && !modeApi.isOnMode()) && { label: 'Mais Filtros', key: 'morefilters', icon: <Icon component={MoreFilters} />, data: {} }
            ]}></StyledMenu>
            {/* 
            <Divider style={{ margin: "8px 0" }} />
            {reports && <>
                <Divider orientation="left" orientationMargin="0" style={{ margin: "8px 0" }}>Relatórios</Divider>
                <Input value={reportTitle} onChange={updateReportTitle} size="small" maxLength={200} />
                <Report dataAPI={dataAPI} columns={columns} hide={onClick} title={reportTitle} items={reportItems} />
            </>} */}
        </div>
    );
}

const _getSelectDefaultOptions = (v) => {
    switch (v) {
        case "bool:0": return [{ value: "", label: " " }, { value: "0", label: "Sim" }, { value: "1", label: "Não" }];
        case "opt:0": return [{ value: "0", label: "Ok" }, { value: "1", label: "Not Ok" }];
        case "opt:1": return [{ value: "0", label: "Ok" }, { value: ">=1", label: "Not Ok" }];
        case "opt:2": return [{ value: "", label: " " }, { value: "!isnull", label: "Sim" }, { value: "isnull", label: "Não" }];
        case "opt:3": return [{ value: "0", label: "Saída" }, { value: "1", label: "Entrada" }]
    }
}

const FilterSelect = ({ style, name, _value, onChange, options, disabled }) => {
    const _options = useMemo(() => {
        if (!Array.isArray(options)) {
            return _getSelectDefaultOptions(options);
        } else {
            return options;
        }
    }, []);
    return (
        <Select disabled={disabled} allowClear popupMatchSelectWidth={false} style={{ width: DEFAULTWIDTH, ...style }} size="small" name={name} value={_value(name)} onChange={(x) => onChange(name, x)} options={_options} />
    );
}



const DrawerMoreFilters = ({ visible, setVisible, onFilterFinish, onChange, _value, onSelectChange }) => {
    const { dataAPI, modeApi, gridRef, stateFilters, updateStateFilters, topToolbar: { filters, initFilterValues } = {} } = useContext(TableContext);
    const permission = usePermission();
    return (<Drawer title="Filtros" open={visible} onClose={() => setVisible(false)} width="500px"
        footer={
            <div style={{ textAlign: 'right' }}>
                <Button onClick={() => {

                    dataAPI.addFilters({}, true);
                    updateStateFilters({});
                    gridRef.current.api.refreshServerSide({ purge: false });

                }} style={{ marginRight: 8 }}>Limpar</Button>
                <Button onClick={() => onFilterFinish("filter", removeEmpty(stateFilters))} type="primary">Aplicar</Button>
            </div>
        }
    >
        <Container fluid style={{ padding: "0px" }}>
            <Row gutterWidth={2}>
                {_filters(filters, gridRef, true).filter(v => v.name !== "fcustom").map((v, i) => {
                    return (<Col style={{ marginTop: "5px" }} xs={v.col} key={`fm-${v.name}.${i}`}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                            <label><b>{v.label}</b></label>
                            {v.type === "text" && v.multi && <div style={{ marginLeft: "2px" }}><TypeRelation background name={v.name} onChange={onChange} value={stateFilters?.[v.name]?.rel} /></div>}
                        </div>
                        <div>
                            {(typeof v.type === 'function') ? v.type() :
                                {
                                    text: <TextArea autoSize={{ minRows: 1, maxRows: 6 }} size="small" value={_value(v.name)} onChange={(e) => onChange(v.name, e)} name={v.name} allowClear style={{ width: DEFAULTWIDTH, ...v?.style }} />,
                                    select: <div style={{ display: "flex", width: DEFAULTWIDTH, ...v?.style }}>
                                        {v.multi && <TypeLogic background name={v.name} onChange={onChange} value={stateFilters?.[v.name]?.logic} />}
                                        <Select mode={v.multi && "multiple"} allowClear popupMatchSelectWidth={false} style={{ width: "100%" }} size="small" name={v.name} value={_value(v.name, v.multi ? [] : null)} onChange={(x) => onSelectChange(v.name, x)} options={v.options} />
                                    </div>,
                                    options: <FilterSelect style={v?.style} name={v.name} _value={_value} onChange={onSelectChange} options={v?.options} />
                                    // autocomplete: <AutoCompleteField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                    // rangedatetime: <RangeDateField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                    //rangedate: <Input addonBefore={<TypeRelation name={v.name} onChange={onChange} value={stateFilters?.[v.name]?.rel} />} size="small" value={_value(v.name)} onChange={(e) => onChange(v.name, e)} name={v.name} allowClear /* {...v?.filter?.field && v.filter.field} */ style={{ width: DEFAULTWIDTH, ...v?.style }} />,//<RangeDateField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                    // rangetime: <RangeTimeField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                    // number: <Input size="small" allowClear {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                    // inputnumber: <InputNumber allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                    // selectmulti: <SelectMultiField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                    // select: <SelectField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />,
                                    // datetime: <DatetimeField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />
                                }[v.type] || <Input addonBefore={v.multi && <TypeRelation name={v.name} onChange={onChange} value={stateFilters?.[v.name]?.rel} />} size="small" value={_value(v.name)} onChange={(e) => onChange(v.name, e)} name={v.name} allowClear /* {...v?.filter?.field && v.filter.field} */ style={{ width: DEFAULTWIDTH, ...v?.style }} />


                            }
                        </div>

                    </Col>)
                })}
            </Row>
            {permission.auth.isAdmin && <Row gutterWidth={2} style={{ marginTop: "5px" }}>
                <Col>
                    <TextArea size="small" value={_value("fcustom")} onChange={(e) => onChange("fcustom", e)} name={"fcustom"} allowClear />
                </Col>
            </Row>}
        </Container>
    </Drawer>);
}

const DrawerSqlQueryView = ({ visible, setVisible, dataAPI }) => {
    const [data, setData] = useState({});
    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible]);

    const loadData = useCallback(async () => {
        const r = await dataAPI.fetchPost({ norun: true });
        setData({ ...r });
    }, []);

    const submitted = useCallback((type = "filters") => {
        let _filters = {};
        if (type === "filters") {
            _filters = dataAPI.getFilters();
        } else if (type === "base") {
            _filters = dataAPI.baseFilters();
        } else {
            _filters = dataAPI.preFilters();
            return {
                designacao: _filters?.designacao, ..._filters.filter && Object.entries(_filters.filter)
                    .filter(([key, value]) => value.parsed !== null)
                    .reduce((acc, [key, value]) => {
                        acc[key] = { parsed: value.parsed };
                        return acc;
                    }, {})
            };
        }
        return Object.entries(_filters)
            .filter(([key, value]) => value.parsed !== null)
            .reduce((acc, [key, value]) => {
                acc[key] = { parsed: value.parsed };
                return acc;
            }, {});
    }, []);

    return (<Drawer title="Ver Sql Query" open={visible} onClose={() => setVisible(false)} width="100%"
        footer={
            <div style={{ textAlign: 'right' }}>
                <Button onClick={() => setVisible(false)} type="primary">Fechar</Button>
            </div>
        }
    >
        <Container fluid style={{ padding: "0px" }}>
            <Row nogutter><Col width={90}></Col><Col style={{ fontWeight: 700 }}>Submitted</Col></Row>
            <Row nogutter wrap='wrap'>
                <Col width={90} style={{ textAlign: "right", paddingRight: "5px", alignSelf: "center" }}>Base Filters:</Col>
                <Col><SyntaxHighlighter customStyle={{ marginBottom: "1px" }} wrapLines language="json" style={a11yDark}>{JSON.stringify(submitted("base")).replace(/\\n/g, '\n').replace(/\\"/g, "'")}</SyntaxHighlighter></Col>
            </Row>
            <Row nogutter wrap='wrap'>
                <Col width={90} style={{ textAlign: "right", paddingRight: "5px", alignSelf: "center" }}>Predifined:</Col>
                <Col><SyntaxHighlighter customStyle={{ marginBottom: "1px" }} wrapLines language="json" style={a11yDark}>{JSON.stringify(submitted("pre")).replace(/\\n/g, '\n').replace(/\\"/g, "'")}</SyntaxHighlighter></Col>
            </Row>
            <Row nogutter wrap='wrap'>
                <Col width={90} style={{ textAlign: "right", paddingRight: "5px", alignSelf: "center" }}>Filters:</Col>
                <Col><SyntaxHighlighter customStyle={{ marginBottom: "0px" }} wrapLines language="json" style={a11yDark}>{JSON.stringify(submitted()).replace(/\\n/g, "").replace(/\\"/g, "'")}</SyntaxHighlighter></Col>
            </Row>
            <Row nogutter style={{ marginTop: "1em" }}><Col style={{ fontWeight: 700 }}>Server Parameters</Col></Row>
            <Row nogutter wrap='wrap'>
                <Col><SyntaxHighlighter wrapLines language="json" style={a11yDark}>{JSON.stringify(data["parameters"], (key, value) => (value === null ? undefined : value))}</SyntaxHighlighter></Col>
            </Row>
            <Row nogutter><Col style={{ fontWeight: 700 }}>Server Query</Col></Row>
            <Row nogutter>
                <Col style={{ height: "400px" }}><SyntaxHighlighter wrapLongLines language="sql" style={a11yDark}>{data["sql"]}</SyntaxHighlighter></Col>
            </Row>
        </Container >
    </Drawer >);
}


const DrawerPredifinedFilters = ({ visible, setVisible, dataAPI, gridRef, topToolbarFilters }) => {
    const [data, setData] = useState([]);
    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible]);

    const loadData = useCallback(async () => {
        const r = await fetchPost({ url: `${API_URL}/permissions/sql/`, parameters: { method: "DatagridFilters" }, filter: { id: dataAPI.getId() } });
        setData(r?.data.rows)
    }, []);


    const onPre = (item) => {
        const _defs = _filters(topToolbarFilters, gridRef, true);
        const _values = {};
        for (const [key, value] of Object.entries(json(item.filters))) {
            const _f = _defs.find(obj => obj.name === key);
            _values[key] = { parsed: value?.parsed, ...excludeObjectKeys(_f, ["options", "style", "op", "col"]) }
        }
        dataAPI.setPreFilters({ filter: _values, designacao: item.designacao });
        gridRef.current.api.refreshServerSide({ purge: false });
    }

    const onClear = () => {
        dataAPI.setPreFilters({});
        gridRef.current.api.refreshServerSide({ purge: false });
    }

    return (<Drawer title="Filtros Predefinidos" open={visible} onClose={() => setVisible(false)} size='large'
        footer={
            <div style={{ textAlign: 'right' }}>
                <Button onClick={() => setVisible(false)} type="primary">Fechar</Button>
            </div>
        }
    >
        <Container fluid style={{ padding: "0px" }}>
            <Row nogutter><Col style={{ textAlign: "right" }}><Button style={{ padding: "0px" }} type="link" size='small' onClick={onClear}>Limpar</Button></Col></Row>
            <Row nogutter>
                <Col>
                    <List size='small'
                        itemLayout="horizontal"
                        dataSource={data}
                        renderItem={(item, index) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar style={{ backgroundColor: '#87d068' }} icon={<FilterOutlined />} />}
                                    title={<Button style={{ padding: "0px", fontWeight: 700 }} type="link" size='small' onClick={() => onPre(item)}>{item?.designacao}</Button>}
                                    {...(item?.obs && { description: item.obs })}
                                />
                            </List.Item>
                        )}
                    />

                </Col>
            </Row>

        </Container >
    </Drawer >);
}


const Toolbar = ({ visible = true, loading = false, onExit, onAdd, onFilterFinish }) => {
    const [moreFilters, setMoreFilters] = useState(false);
    const [sqlQueryView, setSqlQueryView] = useState(false);
    const [predifinedFilters, setPredifinedFilters] = useState(false);
    const [clickSettings, setClickSettings] = useState(false);
    const { modeApi, dataAPI, gridRef, local, updateStateFilters, stateFilters, topToolbar: { title, start, left, right, filters, showSettings = true, showFilters = true, showMoreFilters = true, clearSort = true } = {} } = useContext(TableContext);
    if (!visible) {
        return (<></>);
    }

    const onChange = (field, e, rel = false, logic = false) => {
        if (!rel && !logic) {
            //if (field === "fcustom") {
            //    updateStateFilters(prev => ({ ...prev, [field]: { ...prev?.[field], value: e.target.value.startsWith(":") ? e.target.value : `:${e.target.value}` } }));
            //} else {
            updateStateFilters(prev => ({ ...prev, [field]: { ...prev?.[field], value: e.target.value } }));
            //}
        } else if (rel) {
            updateStateFilters(prev => ({ ...prev, [field]: { ...prev?.[field], rel: e } }));
        } else if (logic) {
            updateStateFilters(prev => ({ ...prev, [field]: { ...prev?.[field], logic: e } }));
        }
    };
    const onSelectChange = (field, v) => {
        updateStateFilters(prev => ({ ...prev, [field]: { ...prev?.[field], value: v } }));
    };

    const _value = useCallback((name, valueOnEmpty = null) => {
        if (!isNil(stateFilters?.[name]?.value)) {
            return stateFilters[name].value;
        }
        const _v = stateFilters?.[name];
        if (typeof _v === 'object' && _v !== null) {
            return valueOnEmpty;
        } else {
            if (isEmpty(_v) || isNil(_v)) {
                return valueOnEmpty;
            }
            return _v;
        }
    }, [stateFilters]);

    const hideSettings = () => {
        setClickSettings(false);
    }
    const handleSettingsClick = (visible) => {
        setClickSettings(visible);
    }

    const onSettingsClick = useCallback((o) => {
        switch (o.key) {
            case "refresh":
                gridRef.current.api.refreshServerSide({ purge: false });
                break;
            case "morefilters":
                setMoreFilters(true);
                break;
            case "sqlquery":
                setSqlQueryView(true);
                break;
            case "clearfilters":
                dataAPI.addFilters({}, true);
                dataAPI.setPreFilters({});
                updateStateFilters({});
                gridRef.current.api.refreshServerSide({ purge: false });
                break;
            case "clearsort":
                gridRef.current.api.applyColumnState({
                    state: dataAPI.getDefaultSort().map(v => includeObjectKeys(v, ["colId", "sort"])),
                    defaultState: { sort: null },
                });
                break;
        }
        hideSettings();
    }, []);

    return (
        <Spin spinning={loading} indicator={<></>} >
            {!local && <><DrawerPredifinedFilters visible={predifinedFilters} setVisible={setPredifinedFilters} dataAPI={dataAPI} gridRef={gridRef} topToolbarFilters={filters} />
                <DrawerSqlQueryView visible={sqlQueryView} setVisible={setSqlQueryView} dataAPI={dataAPI} />
                {moreFilters && <DrawerMoreFilters visible={moreFilters} setVisible={setMoreFilters} onFilterFinish={onFilterFinish} onChange={onChange} onSelectChange={onSelectChange} _value={_value} />}
            </>}
            <Container fluid>
                {title && <Row gutterWidth={5} style={{ padding: "5px" }}>
                    <Col>{title}{dataAPI.preFilters()?.designacao && <span style={{ color: "#8c8c8c" }}>{dataAPI.preFilters()?.designacao}</span>}</Col>
                </Row>}
                <RowXScroll gutterWidth={5} style={{ padding: "5px" }} align='center' wrap='nowrap'>
                    <Col xs="content">
                        {start && start}
                    </Col>

                    {modeApi.enabled() && modeApi.isReady() && <>
                        {(!modeApi.isOnMode() && modeApi.allowAdd()) && <Col xs="content"><Button type="default" icon={<PlusOutlined />} onClick={onAdd}>{modeApi.addText()}</Button></Col>}
                        {(!modeApi.isOnMode() && modeApi.allowEdit()) && <Col xs="content"><Button type="default" icon={<EditOutlined />} onClick={modeApi.onEditMode}>{modeApi.editText()}</Button></Col>}
                        {(modeApi.isOnMode() && modeApi.isDirty()) && <Col xs="content"><Button type="primary" icon={<EditOutlined />} onClick={onAdd}>{modeApi.saveText()}</Button></Col>}
                        {modeApi.isOnMode() && <Col xs="content"><Button type="default" icon={<RollbackOutlined />} onClick={onExit} /></Col>}
                    </>}

                    <Col xs="content">
                        {left && left}
                    </Col>

                    <Col></Col>
                    <Col xs="content">{(filters?.toolbar && showFilters) && <FiltersToolbar onPredifinedFilters={() => setPredifinedFilters(true)} onFilterFinish={onFilterFinish} onChange={onChange} onSelectChange={onSelectChange} _value={_value} />}</Col>
                    <Col xs="content">{right && right}</Col>
                    {showSettings && <Col xs="content" style={{ alignSelf: "end" }}>
                        <Popover
                            open={clickSettings}
                            onOpenChange={handleSettingsClick}
                            placement="bottomRight" title="Opções"
                            content={
                                <ContentSettings
                                    modeApi={modeApi}
                                    clearSort={clearSort}
                                    showFilters={showFilters}
                                    showMoreFilters={showMoreFilters}
                                    onClick={onSettingsClick}
                                /* modeEdit={editMode(editable)} modeAdd={addMode(editable)} setIsDirty={setSettingsIsDirty} onClick={onSettingsClick}
                                dataAPI={dataAPI} columns={columns} pageSize={dataAPI?.getPageSize(true)} reportTitle={reportTitle}
                                moreFilters={moreFilters} reports={reports} clearSort={clearSort} reportItems={reportItems} */
                                />
                            }
                            trigger="click">
                            <Button size="small" icon={<SettingOutlined />} />
                        </Popover>
                    </Col>}
                </RowXScroll>
            </Container>
        </Spin>
    );
}
export const useTableStyles = createUseStyles({
    error: {
        background: "rgb(255, 17, 0) !important"
    },
    warning: {
        background: "#ffec3d !important"
    },
    cellPadding1: {
        padding: "1px 5px !important"
    },
    rowNotValid: {
        background: "#ffe7ba !important"
    },
    right: {
        textAlign: "right"
    },
    selectable: {
        cursor: "pointer"
    }
});
const getAllFocusableElementsOf = (el) => {
    return Array.from(
        el.querySelectorAll(
            'button, [href], input, div, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
    ).filter((focusableEl) => {
        return focusableEl.tabIndex !== -1;
    });
};
const getEventPath = (event) => {
    const path = [];
    let currentTarget = event.target;
    while (currentTarget) {
        path.push(currentTarget);
        currentTarget = currentTarget.parentElement;
    }
    return path;
};
/**
 * Capture whether the user is tabbing forwards or backwards and suppress keyboard event if tabbing
 * outside of the children
 */
export const suppressKeyboardEvent = ({ event }) => {
    const { key, shiftKey } = event;
    const path = getEventPath(event);
    const isTabForward = key === 'Tab' && shiftKey === false;
    const isTabBackward = key === 'Tab' && shiftKey === true;
    let suppressEvent = false;
    // Handle cell children tabbing
    if (isTabForward || isTabBackward) {
        const eGridCell = path.find((el) => {
            if (el.classList === undefined) return false;
            return el.classList.contains(GRID_CELL_CLASSNAME);
        });
        if (!eGridCell) {
            return suppressEvent;
        }
        const focusableChildrenElements = getAllFocusableElementsOf(eGridCell);
        const lastCellChildEl = focusableChildrenElements[focusableChildrenElements.length - 1];
        const firstCellChildEl = focusableChildrenElements[0];
        // Suppress keyboard event if tabbing forward within the cell and the current focused element is not the last child
        if (isTabForward && focusableChildrenElements.length > 0) {
            const isLastChildFocused =
                lastCellChildEl && document.activeElement === lastCellChildEl;
            if (!isLastChildFocused) {
                suppressEvent = true;
            }
        }
        // Suppress keyboard event if tabbing backwards within the cell, and the current focused element is not the first child
        else if (isTabBackward && focusableChildrenElements.length > 0) {
            const cellHasFocusedChildren =
                eGridCell.contains(document.activeElement) &&
                eGridCell !== document.activeElement;
            // Manually set focus to the last child element if cell doesn't have focused children
            if (!cellHasFocusedChildren) {
                lastCellChildEl.focus();
                // Cancel keyboard press, so that it doesn't focus on the last child and then pass through the keyboard press to
                // move to the 2nd last child element
                event.preventDefault();
            }
            const isFirstChildFocused = firstCellChildEl && document.activeElement === firstCellChildEl;
            if (!isFirstChildFocused) {
                suppressEvent = true;
            }
        }
    }
    return suppressEvent;
};

export const useModalApi = () => {
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = useCallback(() => {
            return modalParameters.content;
        }, []);
        const onClose = useCallback(() => {
            hideModal();
            modalParameters.parameters.gridApi.setFocusedCell(modalParameters.parameters.cellFocus.rowIndex, modalParameters.parameters.cellFocus.colId, null);
        }, []);
        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={onClose} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    return { setModalParameters, showModal, hideModal };
}

const filterRegExp = new RegExp(/(==|=|!==|!=|>=|<=|>|<|between:|btw:|in:|!btw|!between:|!in:|isnull|!isnull|@:|:)(.*)/, 'i');
//const filterRegExp = new RegExp('(^==|^=|^!==|^!=|^>=|^<=|^>|^<|^between:|^btw:|^in:|^!btw|^!between:|^!in:|isnull|!isnull|^@:)(.*)', 'i');
const _filterParser = (value, filter, opTag) => {
    const _op = filter?.op ? filter.op.toLowerCase() : "any";
    if (opTag !== "" && opTag !== "=" && opTag !== "!=" && !value.includes("%")) {
        return `${value}`;
    }
    if (value.includes("%")) {
        return `${value}`;
    }
    switch (_op) {
        case 'any': return `%${value.replaceAll(' ', '%%')}%`;
        case 'start': return `${value}%`;
        case 'end': return `%${value}`;
        case 'exact': return `==${value}`;
        default: return `${value}`;
    }
}

// const _fixConditions = (v) => {
//     // Rule 0 - trim all spaces not inside '' and all new lines
//     let input = v.replace(/('[^']*')|\s+/g, (match, group1) => group1 || '');

//     // Rule 1
//     input = input.replace(/([^&|\(])\(/g, '$1&(');
//     input = input.replace(/\(\s*[&|]/g, '(');

//     // Rule 2
//     input = input.replace(/\)([^&|\)])/g, ')&$1');

//     // Rule 3
//     input = input.replace(/([^&|\(])\(/g, '$1&(');

//     // Rule 4
//     input = input.replace(/\)([^&|\)])/g, ')&$1');

//     // Rule 5
//     input = input.replace(/([&|])\1+/g, '$1');





//     // Rule 6
//     const openParenCount = (input.match(/\(/g) || []).length;
//     const closeParenCount = (input.match(/\)/g) || []).length;
//     const parenDiff = openParenCount - closeParenCount;

//     if (parenDiff > 0) {
//         for (let i = 0; i < parenDiff; i++) {
//             input += ')';
//         }
//     } else if (parenDiff < 0) {
//         for (let i = 0; i < -parenDiff; i++) {
//             input = '(' + input;
//         }
//     }

//     return input;
// }


const customSplit = (input) => {
    let result = [];
    let insideQuotes = false;
    let currentChunk = '';
    // Rule 0 - trim all spaces not inside '' and all new lines
    //const _input = input.replace(/('[^']*')|\s+/g, (match, group1) => group1 || '');
    const _input = input.replace(/'[^']*'|"[^"]*"|\s+/g, function (match) {
        return match.startsWith("'") || match.startsWith('"') ? match : '';
    });

    for (let i = 0; i < _input.length; i++) {
        const char = _input[i];

        if (char === '"') {
            insideQuotes = !insideQuotes;
            currentChunk += char;
        } else if (insideQuotes) {
            currentChunk += char;
        } else if (char === '&' || char === '|' || char === '(' || char === ')') {
            if (currentChunk.trim() !== '') {
                result.push(currentChunk.trim());
            }
            result.push(char);
            currentChunk = '';
        } else {
            currentChunk += char;
        }
    }

    if (currentChunk.trim() !== '') {
        result.push(currentChunk.trim());
    }

    return result;
}

const _processConditions = (inputValue, filterDef, rel = "and", logic = "") => {
    let _input = inputValue;
    if (isNil(inputValue) || isEmpty(inputValue)) {
        return null;
    }
    if (typeof inputValue === 'object' && !Array.isArray(inputValue)) {
        _input = inputValue?.value;
        if (isNil(_input) || isEmpty(_input)) {
            return null;
        }
    }
    if (Array.isArray(_input)) {
        if (_input.length == 0) { return null; }
        console.log("processed--->", { value: _input, parsed: [`${logic}in:${_input.join(",")}`], logic, ...filterDef });
        return { value: _input, parsed: [`${logic}in:${_input.join(",")}`], logic, ...filterDef };

    }


    //const conditionsArray = _input.split(';');
    // const conditionsArray = _input.split(/([&|])/).reduce((acc, current, index, array) => {
    //     if (index > 0 && array[index - 1] === '&' || array[index - 1] === '|') {
    //       acc[acc.length - 1] += current;
    //     } else {
    //       acc.push(current);
    //     }
    //     return acc;
    //   }, []);.toString().split(/([&|()])/)
    //const conditionsArray = _fixConditions(_input).toString().split(/([&|()])/).filter(Boolean);
    const conditionsArray = customSplit(_input);
    console.log("conditions", conditionsArray)
    const _values = [];
    const _parsedvalues = [];
    for (const [idx, condition] of conditionsArray.entries()) {
        let _valid = true;
        const _value = [];
        const _parsedvalue = [];

        if (["&", "|", "(", ")"].includes(condition)) {
            if (idx >= 1 && !["(", ")"].includes(condition) && ["&", "|"].includes(_values[_values.length - 1])) {
                continue;
            }
            if (["(", ")"].includes(condition)) {
                _parsedvalues.push(condition);
                _values.push(condition);
                continue;
            }

            _parsedvalues.push(condition === "&" ? "and" : "or");
            _values.push(condition);
            continue;
        }
        const matches = condition.trim().toString().match(filterRegExp);
        const _opTag = matches ? matches[1] : "";
        const _x = matches ? matches[2] : condition.trim().toString();
        if (_opTag === "@:") {
            _parsedvalues.push(condition);
            _values.push(condition);
            continue;
        }
        if (_opTag === ":") {
            if (condition.trim() === ":") {
                continue;
            }
            _parsedvalues.push(condition);
            _values.push(condition);
            continue;
        }

        if (!isEmpty(_x) || (["isnull", "!isnull"].includes(_opTag))) {
            for (const value of _x.split(',')) {
                if (filterDef.type === "options") {
                    const _t = (_opTag === "") ? "==" : "";
                    _value.push(value);
                    _parsedvalue.push(`${_t}${value}`);
                } else if (filterDef.type === "number") {
                    if (isNaN(+value)) {
                        _valid = false;
                        break;
                    } else {
                        const _t = (_opTag === "") ? "==" : (_opTag === "=") ? "=" : "";
                        _value.push(value);
                        _parsedvalue.push(`${_t}${value.replace(/\n/g, '')}`);
                    }
                } else if (filterDef.type === "date") {
                    const parsedDate = dayjs(value, { strict: true });
                    if (!parsedDate.isValid()) {
                        _valid = false;
                        break;
                    } else {
                        const _t = (_opTag === "") ? "==" : (_opTag === "=") ? "=" : "";
                        _value.push(parsedDate.format(DATE_FORMAT));
                        _parsedvalue.push(`${_t}${value.replace(/\n/g, '')}`);
                    }
                } else if (filterDef.type === "datetime") {
                    const parsedDate = dayjs(value, { strict: true });
                    if (!parsedDate.isValid()) {
                        _valid = false;
                        break;
                    } else {
                        const _t = (_opTag === "") ? "==" : (_opTag === "=") ? "=" : "";
                        _value.push(parsedDate.format(DATETIME_FORMAT));
                        _parsedvalue.push(`${_t}${value.replace(/\n/g, '')}`);
                    }
                } else if (filterDef.type === "time") {
                    const parsedDate = dayjs(value, TIME_FORMAT);
                    if (!parsedDate.isValid()) {
                        _valid = false;
                        break;
                    } else {
                        const _t = (_opTag === "") ? "==" : (_opTag === "=") ? "=" : "";
                        _value.push(parsedDate.format(TIME_FORMAT));
                        _parsedvalue.push(`${_t}${value.replace(/\n/g, '')}`);
                    }
                } else {
                    _value.push(value);
                    _parsedvalue.push(_filterParser(value.replace(/\n/g, ''), filterDef, _opTag));
                }
            }
            if (_valid) {
                _values.push(`${_opTag}${_value.join(",")}`);
                _parsedvalues.push(`${_opTag}${_parsedvalue.join(",")}`);
            }

        };
    }
    if (_parsedvalues.length === 0) {
        return null;
    }
    if (["&", "|"].includes(_values[_values.length - 1])) {
        _values.splice(_values.length - 1, 1);
        _parsedvalues.splice(_parsedvalues.length - 1, 1);
    }
    console.log("processed--->", { value: _values.join(""), parsed: _parsedvalues, rel, ...filterDef });
    return { value: _values.join(""), parsed: _parsedvalues, rel, ...filterDef };
}

const Status = ({ dataAPI }) => {
    return (<div style={{ color: "#f5222d", fontWeight: 700 }}>{dataAPI?.getData()?.status === "error" && dataAPI?.getData()?.title}</div>)
}

export default ({
    columnDefs, defaultColDef, columnTypes, dataAPI, local = false, gridApi, setGridApi, modalApi, loadOnInit = true,
    loading = false, showRange = true, allowGoTo = true, showFromTo, showTotalCount, gridRef, showTopToolbar = true, topToolbar = {},
    onExitModeRefresh = true, rowClassRules = {}, modeApi, rowSelection, onSelectionChanged, ...props
}) => {
    const classes = useTableStyles();
    const _gridRef = gridRef || useRef();
    const submitting = useSubmitting(false);
    const sourceType = useMemo(() => local ? "clientSide" : "serverSide", [local]);
    const [isReady, setIsReady] = useState(false);
    const [initialState, setInitialState] = useState();

    const [stateFilters, updateStateFilters] = useState({});


    const parseFilters = useCallback((values) => {
        const _defs = _filters(topToolbar?.filters, _gridRef, true);
        const _values = {};
        for (const [key, value] of Object.entries(values)) {
            const _f = _defs.find(obj => obj.name === key);
            const _pf = _processConditions(value?.value ? value.value : value, _f, value?.rel, value?.logic);
            if (_pf !== null) {
                _values[key] = excludeObjectKeys(_pf, ["options", "style", "op", "col"]);
            }
        }
        return _values;
    }, []);

    const isLoading = useMemo(() => {
        if (loading || submitting.state || dataAPI.isLoading()) {
            return true;
        }
        return false;
    }, [loading, submitting.state, dataAPI.isLoading()]);

    const onGridReady = useCallback((params) => {
        console.log("GIRD-READY");
        //Load Filters State

        updateStateFilters({ ...topToolbar?.initFilterValues?.filter || {} });

        if (isObjectEmpty(dataAPI.getFilters()) && isObjectEmpty(dataAPI.preFilters())) {
            const _values = parseFilters(topToolbar?.initFilterValues?.filter);
            dataAPI.setFilters(_values);
        }

        if (setGridApi) {
            const { api } = params;
            setGridApi(api);
        }

        if (loadOnInit && local == false) {
            let datasource = dataAPI.dataSourceV4();
            params.api.setGridOption("serverSideDatasource", datasource);
        }
        setIsReady(true);
    }, []);

    // const onGridPreDestroyed = useCallback(
    //   (params) => {
    //     console.log("GRID-PREDESTROYED");
    //     if (!gridApi) {
    //       return;
    //     }
    //     setGridApi(null);
    //   }, [gridApi]);

    const onPaginationChanged = useCallback(() => {
        // Workaround for bug in events order
        if (_gridRef.current.api) {
            //_gridRef.current.api.paginationGoToPage(14);

            //console.log('GRID PAGINATION ');
            if (local) {
                dataAPI.currentPage(_gridRef.current.api.paginationGetCurrentPage() + 1, true);
            }
            //console.log("GRID PAGINATION->", dataAPI.getCurrentPage(), dataAPI.getPageSize(), _gridRef.current.api.paginationGetCurrentPage() + 1)

            //   setText(
            //     '#lbLastPageFound',
            //     gridRef.current.api.paginationIsLastPageFound()
            //   );
            //   setText('#lbPageSize', gridRef.current.api.paginationGetPageSize());
            //   // we +1 to current page, as pages are zero based
            //   setText(
            //     '#lbCurrentPage',
            //     gridRef.current.api.paginationGetCurrentPage() + 1
            //   );
            //   setText('#lbTotalPages', gridRef.current.api.paginationGetTotalPages());
            //   setLastButtonDisabled(!gridRef.current.api.paginationIsLastPageFound());
        }
    }, []);

    // useEffect(() => {
    //   const el = document.querySelector(".ag-custom");
    //   if (el) {
    //     el.classList.toggle("normal", true);
    //   }
    // }, []);

    // const refreshCache = useCallback((route) => {
    //   const purge = true;
    //   //const purge = !!document.querySelector('#purge').checked;
    //   //_gridRef.current.api.refreshServerSide({ route: route, purge: purge });
    //   _gridRef.current.api.refreshServerSide({ route: route, purge: purge });
    // }, []);

    const onFirstDataRendered = useCallback((params) => {
        if (dataAPI.getCurrentPage() !== 1) {
            //LOAD CURRENT PAGE FROM STATE
            _gridRef.current.api.paginationGoToPage(dataAPI.getCurrentPage() - 1);
        }
    }, []);

    const getRowId = useMemo(() => {
        return (params) => { return `${params.data?.[dataAPI.getPrimaryKey()]}`; };
    }, []);

    // const onPaging = useCallback(async (page, purge = true) => {
    //   _gridRef.current.api.showLoadingOverlay();
    //   dataAPI.currentPage(page, true);
    //   if (typeof onPageChange === "function") {
    //     onPageChange();
    //   } else {
    //     //await dataAPI.fetchPost();
    //     //_gridRef.current.api.paginationProxy.currentPage = dataAPI.getCurrentPage() - 1;
    //     _gridRef.current.api.paginationGoToPage(dataAPI.getCurrentPage() - 1);
    //     //_gridRef.current.api.refreshServerSide({ purge: purge });
    //     //dataAPI.update(true);
    //     //dataAPI.fetchPost();
    //   }
    //   _gridRef.current.api.hideOverlay();
    // }, []);



    const statusBar = useMemo(() => {
        return {
            statusPanels: [{
                statusPanel: Status,
                align: "left",
                statusPanelParams: {
                    dataAPI: dataAPI
                }
            },
            ...dataAPI.getPagination().enabled ? [{
                statusPanel: StatusRightPanel,
                align: 'right',
                statusPanelParams: {
                    modeApi: modeApi,
                    dataAPI: dataAPI,
                    loading: isLoading,
                    showTotalCount: showTotalCount,
                    showFromTo: showFromTo,
                    showRange: showRange,
                    allowGoTo: allowGoTo
                }
            }] : []
            ],
        };
    }, [isLoading, dataAPI.getTimeStamp(), dataAPI.getPageSize(), dataAPI.getCurrentPage(), modeApi.isOnMode()]);


    const onCellEditRequest = event => {
        console.log('Cell Editing updated a cell, but the grid did nothing!', _gridRef.current);
        const transaction = {
            update: [{ ...event.data, [event.column.getDefinition().field]: event.newValue, rowvalid: 0 }],
        };
        if (local) {
            const result = _gridRef.current.api.applyTransaction(transaction);
        } else {
            const result = _gridRef.current.api.applyServerSideTransaction(transaction);
        }
        modeApi.setDirty(true);
    };

    // const handleAddRow = () => {
    //   // Simulate adding a new row on the server (replace with actual API call)
    //   const newServerRow = { id: 3, nome: 'New Row' };

    //   // Inform Ag-Grid about the new row
    //   _gridRef.current.api.applyTransaction({
    //     add: [newServerRow],
    //   });
    // };

    // const handleAddRow = useCallback(() => {
    //   // const selectedRows = _gridRef.current.api.getSelectedNodes();
    //   // if (selectedRows.length === 0) {
    //   //   console.warn('[Example] No row selected.');
    //   //   return;
    //   // }
    //   const rowIndex = 0;//selectedRows[0].rowIndex;
    //   const transaction = {
    //     addIndex: rowIndex != null ? rowIndex : undefined,
    //     add: [{ id: 3, nome: 'New Row', rowadded: 1, rowvalid: 0 }],
    //   };
    //   const result = _gridRef.current.api.applyServerSideTransaction(transaction);
    // }, []);

    const onExitMode = useCallback(() => {
        _gridRef.current.api.stopEditing();
        if (onExitModeRefresh) {
            if (!local) {
                _gridRef.current.api.refreshServerSide({ purge: false });
            } else {
                // _gridRef.current.api.refreshCells({force:true});
                // _gridRef.current.api.redrawRows();
                console.log(dataAPI.getData().rows)
                _gridRef.current.api.updateGridOptions({ rowData: dataAPI.getData().rows });
            }
        }
    }, [dataAPI.getTimeStamp()]);

    const onAddMode = useCallback((idx = null, row) => {
        let _first = _gridRef.current.api.getFirstDisplayedRow() == -1 ? 0 : _gridRef.current.api.getFirstDisplayedRow();
        const transaction = {
            addIndex: idx != null ? idx : _first,
            add: [{ ...row, rowadded: 1, rowvalid: 0 }],
        };
        if (local) {
            const result = _gridRef.current.api.applyTransaction(transaction);
        } else {
            const result = _gridRef.current.api.applyServerSideTransaction(transaction);
        }
    }, []);

    const _rowClassRules = useMemo(() => {
        return {
            [classes.rowNotValid]: (params) => {
                return params.data?.rowvalid === 0;
            },
            ...rowClassRules
        };
    }, []);

    const onFilterFinish = useCallback(async (type, values) => {
        if (topToolbar?.onFilterFinish) {
            await topToolbar?.onFilterFinish(type, values);
        } else {
            const _values = parseFilters(values);
            console.log("onfilter->>>", _values)
            dataAPI.setFilters(_values);
            _gridRef.current.api.refreshServerSide({ purge: false });
            //_gridRef.current.api.paginationGoToPage(0);
        }
    }, []);

    const _onSelectionChanged = useCallback(() => {
        const selectedRows = _gridRef.current.api.getSelectedRows();
        if (typeof onSelectionChanged === "function") {
            onSelectionChanged(selectedRows);
        }
    }, []);

    return (
        <GridContainer>
            <TableContext.Provider value={{ dataAPI, modeApi, gridRef: _gridRef, stateFilters, updateStateFilters, topToolbar, local }}>
                {isReady && <Toolbar loading={isLoading} visible={showTopToolbar} onExit={() => modeApi.onExit(onExitMode)} onAdd={() => modeApi.onAddMode(onAddMode)} onFilterFinish={onFilterFinish} />}
                <div className="ag-theme-quartz ag-custom">
                    <AgGridReact
                        ref={_gridRef}
                        onFirstDataRendered={onFirstDataRendered}
                        //initialState={{ pagination: { page: 15 } }}
                        // initialState={{
                        //   pagination: {
                        //     "page": 2,
                        //     "pageSize": 100
                        //   }
                        // }}
                        // initialState={{
                        //   currentPage:10,
                        //   pagination: {
                        //     page: 10,//dataAPI.getPagination().page,
                        //     pageSize: 50//dataAPI.getPagination().pageSize
                        //   }
                        // }}
                        pagination={dataAPI.getPagination().enabled}
                        paginationPageSize={dataAPI.getPagination().pageSize}
                        suppressPaginationPanel={true}
                        suppressScrollOnNewData={true}
                        onPaginationChanged={onPaginationChanged}

                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        rowModelType={sourceType}
                        columnTypes={columnTypes}
                        maxBlocksInCache={0}
                        {...!local ? { cacheBlockSize: dataAPI.getPageSize() } : {}}
                        {...local ? { rowData: dataAPI.getData().rows } : {}}

                        {...(rowSelection) && {
                            rowSelection: modeApi.enabled() ? null : rowSelection,
                            onSelectionChanged: _onSelectionChanged,
                            suppressCellFocus: modeApi.enabled() ? false : true
                        }}

                        //sideBar={'columns'}
                        onGridReady={onGridReady}
                        getRowId={getRowId}

                        enableCellTextSelection={false}
                        suppressContextMenu={true}
                        //onCellKeyDown={(v) => console.log("###", v)}
                        //onCellClicked={(v) => console.log("###", v)}
                        //onGridPreDestroyed={onGridPreDestroyed}
                        statusBar={statusBar}

                        onCellEditRequest={onCellEditRequest}

                        readOnlyEdit={true}
                        rowClassRules={_rowClassRules}

                        {...props}
                    />
                </div>
            </TableContext.Provider>
        </GridContainer>
    );
};