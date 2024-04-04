import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useSubmitting, removeEmpty, sleep, unique, isObject } from "utils";
import { usePermission } from "utils/usePermission";
import { useImmer } from 'use-immer';
import { isEmpty, isNil, assocPath, assoc } from 'ramda';
import { filterRegExp, filtersDef, processConditions } from 'utils/useDataAPIV4';
import { uid } from 'uid';
import dayjs from 'dayjs';
import { json, includeObjectKeys, excludeObjectKeys, isObjectEmpty, valueByPath, updateByPath } from "utils/object";
import { Button, Spin, Input, Flex, Badge, Select, Popover, Menu, Drawer, List, Avatar, Checkbox } from "antd";
import Icon, { EditOutlined, RollbackOutlined, PlusOutlined, SearchOutlined, SettingOutlined, ReloadOutlined, FilterOutlined, ConsoleSqlOutlined, MoreOutlined, PullRequestOutlined, QuestionCircleTwoTone, CaretRightOutlined, CaretLeftOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import ClearSort from 'assets/clearsort.svg';
import MoreFilters from 'assets/morefilters.svg'
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import YScroll from 'components/YScroll';
import XScroll, { RowXScroll } from 'components/XScroll';
import Pagination, { paginationI18n } from './PaginatorV4';

import { AgGridReact } from 'ag-grid-react';
import { DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT, API_URL } from 'config';
import TextArea from 'antd/es/input/TextArea';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { fetchPost } from 'utils/fetch';
import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';
import Portal from 'components/portal';
// import 'ag-grid-enterprise';
// import { LicenseManager } from "ag-grid-enterprise";
// LicenseManager.setLicenseKey("my-license-key");
const GRID_CELL_CLASSNAME = 'ag-cell';

export const TableContext = React.createContext({});

export const refreshDataSource = (api, purge = false) => {
    api.refreshServerSide({ purge });
}
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
        <div>{!modeApi?.isOnMode() && <Pagination loading={loading} showRange={showRange} onPageSizeChange={onPageSizeChange} allowGoTo={allowGoTo} showTotalCount={showTotalCount} showFromTo={showFromTo} totalCount={dataAPI.getTotalRows()} rowsFromTo={dataAPI.getRowsFromTo()} onPageChange={onPageChange} currentPage={dataAPI.getCurrentPage()} pageSize={dataAPI.getPageSize()} /* {...paginationProps} */ /* {...(editable.enabled || editable.add) && { skip: dataAPI?.getSkip() }} */ {...paginationI18n} /* bordered={false} */ />}</div>
    </div>)
}

const StyledMenu = styled(Menu)`
    .ant-menu-item{
        height:25px !important;
        line-height:25px !important;
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

export const HeaderCheck = ({ data, column, api }) => {
    const _headerName = column.getDefinition().headerName;
    const { checks, updateChecks, checkKey } = column.getDefinition().headerComponentParams || {};
    const _checkKey = checkKey ? checkKey : column.getDefinition().field;

    const onChange = useCallback((e) => {
        const _v = [];
        if (e.target.checked) {
            api.forEachNode((node) => {
                _v.push(node.id);
            });
        }
        updateChecks(draft => {
            draft[_checkKey] = _v;
            draft.timestamp = new Date();
        });
    }, []);

    const _value = useMemo(() => {
        let _count = 0;
        api.forEachNode((node) => {
            _count++;
        });
        return (checks[_checkKey].length == _count) ? true : false;
    }, [checks[_checkKey].length]);

    return (
        <div style={{ fontSize: "12px", display: "flex", width: "100%", justifyContent: "space-between" }}>
            <span>{_headerName}</span>
            <Checkbox checked={_value} onChange={onChange} defaultChecked={false} />
        </div>
    );
}

export const TypeRelation = ({ disabled, onChange, name, value, background = false }) => {
    return (
        <StyledType disabled={disabled} size='small' background={background} popupMatchSelectWidth={false} name={`rel-${name}`} onChange={(e) => onChange(name, e, true, false)} value={value} options={[{ value: "and", label: "e" }, { value: "or", label: "ou" }]} />
    );
};
export const TypeLogic = ({ onChange, name, value, background = false, disabled }) => {
    return (
        <StyledType disabled={disabled} size='small' background={background} popupMatchSelectWidth={false} name={`lo-${name}`} onChange={(e) => onChange(name, e, false, true)} value={value} options={[{ value: "|", label: "(ou)" }, { value: "&", label: "(e)" }, { value: "!&", label: "Não (e)" }, { value: "!|", label: "Não (ou)" }]} />
    );
};

const _selectOptions = (v) => {
    if (v?.options) {
        if (Array.isArray(v.options)) {
            return v.options;
        } else if (v.options instanceof Object) {
            return Object.entries(v.options).map(([value, { label }]) => ({ value: value, label }));
        }else{
            return _getSelectDefaultOptions(v.options);
        }
    }
    return v?.options;
};
const DEFAULTWIDTH = "150px";
const FiltersToolbar = React.forwardRef(({ onFilterFinish, onPredifinedFilters, onChange, _value, onSelectChange }, ref) => {
    const { dataAPI, modeApi, gridRef, stateFilters, topToolbar: { filters, initFilterValues } = {} } = useContext(TableContext);
    const countFilters = useMemo(() => Object.keys(removeEmpty(dataAPI.getFilters())).length, [dataAPI.getFilters()]);

    return (<>
        {initFilterValues !== undefined &&
            <Flex wrap="nowrap" gap="small" align='end'>{filtersDef(filters, gridRef, { keys: ["toolbar"] }).map((v, i) =>
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
                                    {v.multi && <TypeLogic disabled={modeApi?.isOnMode()} background name={v.name} onChange={onChange} value={stateFilters?.[v.name]?.logic} />}
                                    <Select disabled={modeApi?.isOnMode()} mode={v.multi && "multiple"} allowClear popupMatchSelectWidth={false} style={{ width: "100%" }} size="small" name={v.name} value={_value(v.name, v.multi ? [] : null)} onChange={(x) => onSelectChange(v.name, x)} options={_selectOptions(v)} />
                                </div>,
                                options: <FilterSelect disabled={modeApi?.isOnMode()} style={v?.style} name={v.name} _value={_value} onChange={onSelectChange} options={_selectOptions(v)} />
                                // datetime: <DatetimeField allowClear size="small" {...v?.filter?.field && v.filter.field} style={{ width: "80px", ...style }} />
                            }[v.type] || <Input onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { onFilterFinish("filter", removeEmpty(stateFilters)); } }} disabled={modeApi?.isOnMode()} addonBefore={v.multi && <TypeRelation disabled={modeApi?.isOnMode()} name={v.name} onChange={onChange} value={stateFilters?.[v.name]?.rel} />} size="small" value={_value(v.name)} onChange={(e) => onChange(v.name, e)} name={v.name} allowClear /* {...v?.filter?.field && v.filter.field} */ style={{ width: DEFAULTWIDTH, ...v?.style }} />

                        }
                    </div>
                </div>)}
                {ref && <Portal elId={ref.current}>
                    <Badge dot={countFilters > 0 ? true : false} offset={[-2, 0]} style={{ backgroundColor: '#52c41a' }} /* count={countFilters}  *//* size="small" */><Button disabled={modeApi?.isOnMode()} onClick={() => onFilterFinish("filter", removeEmpty(stateFilters))} size="small" icon={<SearchOutlined />} /></Badge>
                    <Button size="small" disabled={modeApi?.isOnMode()} onClick={onPredifinedFilters} icon={<MoreOutlined />} />
                </Portal>
                }
            </Flex>
        }
    </>
    );
});

const ContentSettings = ({ modeApi, clearSort, showFilters, showMoreFilters, setIsDirty, onClick, dataAPI, columns/*  pageSize, setPageSize */, reportTitle: _reportTitle, moreFilters, reports, modeEdit, modeAdd, reportItems }) => {
    const [reportTitle, setReportTitle] = useState(_reportTitle);
    const permission = usePermission();
    const updateReportTitle = (e) => {
        setReportTitle(e.target.value);
    }
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <StyledMenu onClick={(v) => onClick(v)} items={[
                (!modeApi?.isOnMode()) && { label: 'Atualizar', key: 'refresh', icon: <ReloadOutlined />, data: {} },
                (clearSort && !modeApi?.isOnMode()) && { label: 'Limpar Ordenação', key: 'clearsort', icon: <Icon component={ClearSort} />, data: {} },
                (showFilters && !modeApi?.isOnMode()) && { label: 'Limpar Filtros', key: 'clearfilters', icon: <FilterOutlined />, data: {} },
                (showMoreFilters && !modeApi?.isOnMode()) && { label: 'Mais Filtros', key: 'morefilters', icon: <Icon component={MoreFilters} />, data: {} },
                { type: 'divider' },
                (permission.auth.isAdmin) && { label: <span style={{ color: "#10239e" }}>Server Request and Execution</span>, key: 'sqlquery', icon: <PullRequestOutlined style={{ color: "#10239e" }} />, data: {} },
                { type: 'divider' },
                { label: <span style={{ color: "#10239e" }}>Ajuda Filtros</span>, key: 'helpfilters', icon: <QuestionCircleTwoTone style={{ fontSize: "14px" }} />, data: {} },
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
        case "bool:1": return [{ value: "", label: " " }, { value: "1", label: "Sim" }, { value: "0", label: "Não" }];
        case "opt:0": return [{ value: "0", label: "Ok" }, { value: "1", label: "Not Ok" }];
        case "opt:1": return [{ value: "0", label: "Ok" }, { value: ">=1", label: "Not Ok" }];
        case "opt:2": return [{ value: "", label: " " }, { value: "!isnull", label: "Sim" }, { value: "isnull", label: "Não" }];
        case "opt:3": return [{ value: "0", label: "Saída" }, { value: "1", label: "Entrada" }];
        case "opt:4": return [{ value: "1", label: "Aberto" }, { value: "9", label: "Fechado" }];
        case "opt:5": return [{ value: "1", label: "Ativo" }, { value: "0", label: "Inativo" }];
        case "opt:6": return [{ value: "0", label: "Aberta" }, { value: "1", label: "Fechada" }];
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

    return (<Drawer push={false} title="Filtros" open={visible} onClose={() => setVisible(false)} width="500px"
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
                {filtersDef(filters, gridRef, { keys: ["toolbar", "more"] }).filter(v => v.name !== "fcustom").map((v, i) => {
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
                                        <Select mode={v.multi && "multiple"} allowClear popupMatchSelectWidth={false} style={{ width: "100%" }} size="small" name={v.name} value={_value(v.name, v.multi ? [] : null)} onChange={(x) => onSelectChange(v.name, x)} options={_selectOptions(v)} />
                                    </div>,
                                    options: <FilterSelect style={v?.style} name={v.name} _value={_value} onChange={onSelectChange} options={_selectOptions(v)} />
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

const DrawerHelp = ({ visible, setVisible, dataAPI }) => {
    const [data, setData] = useState();
    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible]);

    const loadData = useCallback(async () => {
        let response;
        try {
            response = await fetchPost({ url: `${API_URL}/print/sql/`, parameters: { method: "FiltersHelp" } });
            setData(response.data.file_content);
        } catch (e) {
            console.log(e);
        };
    }, []);

    return (<Drawer push={false} title="Ajuda Filtros" open={visible} onClose={() => setVisible(false)} width="100%"
        footer={
            <div style={{ textAlign: 'right' }}>
                <Button onClick={() => setVisible(false)} type="primary">Fechar</Button>
            </div>
        }
    >
        <Container fluid style={{ padding: "0px" }}>
            <Row nogutter>
                <Col>
                    <div dangerouslySetInnerHTML={{ __html: data }} />
                </Col>
            </Row>
        </Container >
    </Drawer >);
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
                    //.filter(([key, value]) => value.parsed !== null)
                    .reduce((acc, [key, value]) => {
                        if (!isObject(value)) {
                            acc[key] = value;
                        } else {
                            acc[key] = { ...Object.fromEntries(Object.entries(value.groups).filter(([key, value]) => value.parsed !== null).map(([key, value]) => [key, value.parsed])) };
                        }
                        return acc;
                    }, {})
            };
        }
        return Object.entries(_filters)
            //.filter(([key, value]) => value.parsed !== null)
            .reduce((acc, [key, value]) => {
                if (!isObject(value)) {
                    acc[key] = value;
                } else {
                    acc[key] = { ...Object.fromEntries(Object.entries(value.groups).filter(([key, value]) => value.parsed !== null).map(([key, value]) => [key, value.parsed])) };
                }
                return acc;
            }, {});
    }, []);

    return (<Drawer push={false} title={<div>
        <div style={{ fontWeight: 900, fontSize: "18px" }}>Server Request and Execution</div>
        <div style={{ fontWeight: 400 }}>{dataAPI.getPayload()?.url}[<span style={{ fontWeight: 700 }}>{dataAPI.getPayload()?.parameters?.method}</span>]</div>
    </div>}
        open={visible} onClose={() => setVisible(false)} width="100%"
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
        const _defs = filtersDef(topToolbarFilters, gridRef, { all: true });
        const _values = {};
        for (const [key, value] of Object.entries(json(item.filters))) {
            const _f = _defs.find(obj => obj.name === key);
            _values[key] = { ...excludeObjectKeys(_f, ["options", "style", "op", "col", "fnvalue", "fn"]), ...value }
        }
        dataAPI.setPreFilters({ filter: _values, designacao: item.designacao });
        gridRef.current.api.refreshServerSide({ purge: false });
    }

    const onClear = () => {
        dataAPI.setPreFilters({});
        gridRef.current.api.refreshServerSide({ purge: false });
    }

    return (<Drawer push={false} title="Filtros Predefinidos" open={visible} onClose={() => setVisible(false)} size='large'
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

export const exitMode = (gridApi, onExitModeRefresh = true, data = null, fn = null) => {
    gridApi.stopEditing();
    if (typeof fn === "function") {
        fn();
    }
    if (onExitModeRefresh) {
        if (!data) {
            gridApi.refreshServerSide({ purge: false });
        } else {
            // _gridRef.current.api.refreshCells({force:true});
            // _gridRef.current.api.redrawRows();
            gridApi.updateGridOptions({ rowData: data });
        }
    }
}

const ScrollButton = styled(Button)`
  /* position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index:9999; */
  background-color: rgba(0, 0, 0, 0.03);
  ${({ $left }) => $left ? 'left: 0;' : 'right: 0;'}
`;

const Scroll = ({ children, style, ...props }) => {
    const contentRef = useRef(null);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [scrollLeftOnDragStart, setScrollLeftOnDragStart] = useState(0);

    const updateButtonVisibility = () => {
        if (contentRef.current) {
            setShowLeftButton(contentRef.current.scrollLeft > 0);
            setShowRightButton((contentRef.current.scrollLeft + contentRef.current.clientWidth) < contentRef.current.scrollWidth);
        }
    };

    useEffect(() => {
        updateButtonVisibility();

        const handleScroll = () => {
            updateButtonVisibility();
        };

        const handleResize = () => {
            updateButtonVisibility();
        };

        const handleDragStart = (event) => {
            if (event.type === 'mousedown') {
                setDragStartX(event.clientX);
            } else if (event.type === 'touchstart') {
                setDragStartX(event.touches[0].clientX);
            }
            setScrollLeftOnDragStart(contentRef.current.scrollLeft);
            contentRef.current.style.cursor = 'grabbing'; // Change cursor style during drag
        };

        const handleDragEnd = () => {
            contentRef.current.style.cursor = 'grab';
        };

        const handleDragMove = (event) => {
            if (contentRef.current && (event.buttons === 1 || event.type === 'touchmove')) {
                const clientX = event.type === 'mousemove' ? event.clientX : event.touches[0].clientX;
                const deltaX = clientX - dragStartX;
                contentRef.current.scrollLeft = scrollLeftOnDragStart - deltaX;
            }
        };

        if (contentRef.current) {
            contentRef.current.addEventListener('scroll', handleScroll);
            window.addEventListener('resize', handleResize);
            contentRef.current.addEventListener('mousedown', handleDragStart);
            contentRef.current.addEventListener('touchstart', handleDragStart);
            contentRef.current.addEventListener('mouseup', handleDragEnd);
            contentRef.current.addEventListener('touchend', handleDragEnd);
            contentRef.current.addEventListener('mousemove', handleDragMove);
            contentRef.current.addEventListener('touchmove', handleDragMove);
        }

        return () => {
            if (contentRef.current) {
                contentRef.current.removeEventListener('scroll', handleScroll);
                contentRef.current.removeEventListener('mousedown', handleDragStart);
                contentRef.current.removeEventListener('touchstart', handleDragStart);
                contentRef.current.removeEventListener('mouseup', handleDragEnd);
                contentRef.current.removeEventListener('touchend', handleDragEnd);
                contentRef.current.removeEventListener('mousemove', handleDragMove);
                contentRef.current.removeEventListener('touchmove', handleDragMove);
            }
            window.removeEventListener('resize', handleResize);

        };
    }, [dragStartX, scrollLeftOnDragStart]);

    const scrollLeft = () => {
        if (contentRef.current) {
            contentRef.current.scrollLeft -= 100;
        }
    };

    const scrollRight = () => {
        if (contentRef.current) {
            contentRef.current.scrollLeft += 100;
        }
    };
    return (
        <>
            {showLeftButton && <Col xs="content" style={{ display: "flex" }}><ScrollButton size="small" $left type="link" onClick={scrollLeft} icon={<BsChevronCompactLeft style={{ fontSize: "20px" }} color="#262626" />} /></Col>}
            <Col style={{ overflow: "hidden", userSelect: "none", ...style }} {...props}>
                <Col ref={contentRef} style={{ overflow: "hidden" }}>
                    {children}
                </Col>
                {/* {showLeftButton && <ScrollButton $left type="link" onClick={scrollLeft} icon={<BsChevronCompactLeft style={{ fontSize: "24px" }} color="#262626" />} />}
                {showRightButton && <ScrollButton type="link" onClick={scrollRight} icon={<BsChevronCompactRight style={{ fontSize: "24px" }} color="#262626" />} />} */}
            </Col>
            {showRightButton && <Col xs="content" style={{ display: "flex" }}><ScrollButton size="small" type="link" onClick={scrollRight} icon={<BsChevronCompactRight style={{ fontSize: "20px" }} color="#262626" />} /></Col>}
        </>
    );
}




const Toolbar = ({ visible = true, loading = false, /* onExit, onAdd, */ onExitModeRefresh, onAddSaveExit, onEditSaveExit, onFilterFinish, onExitMode, minHeight = "20px" }) => {
    const filterButtons = useRef();
    const [moreFilters, setMoreFilters] = useState(false);
    const [sqlQueryView, setSqlQueryView] = useState(false);
    const [helpfilters, setHelpFilters] = useState(false);
    const [predifinedFilters, setPredifinedFilters] = useState(false);
    const [clickSettings, setClickSettings] = useState(false);
    const { modeApi, dataAPI, gridRef, local, updateStateFilters, stateFilters, topToolbar: { title, leftTitle, start, left, right, filters, showSettings = true, showFilters = true, showMoreFilters = true, clearSort = true } = {} } = useContext(TableContext);
    if (!visible) {
        return (<></>);
    }

    const _exitMode = () => {
        exitMode(gridRef.current.api, onExitModeRefresh, local ? dataAPI.getData().rows : null, onExitMode);
    }
    // const onExitMode = useCallback(() => {
    //     gridRef.current.api.stopEditing();
    //     if (typeof onExitMode==="function"){
    //         _onExitMode();
    //     }
    //     if (onExitModeRefresh) {
    //         if (!local) {
    //             gridRef.current.api.refreshServerSide({ purge: false });
    //         } else {
    //             // _gridRef.current.api.refreshCells({force:true});
    //             // _gridRef.current.api.redrawRows();
    //             gridRef.current.api.updateGridOptions({ rowData: dataAPI.getData().rows });
    //         }
    //     }
    // }, [dataAPI.getTimeStamp()]);

    const onAddMode = useCallback(async (idx = null, row) => {
        let _first = gridRef.current.api.getFirstDisplayedRow() == -1 ? 0 : gridRef.current.api.getFirstDisplayedRow();
        const _idx = idx != null ? idx : _first
        const transaction = {
            addIndex: _idx,
            add: [{ ...row, rowadded: 1, rowvalid: 0 }],
        };
        if (local) {
            const result = gridRef.current.api.applyTransaction(transaction);
        } else {
            const result = gridRef.current.api.applyServerSideTransaction(transaction);
        }
    }, []);

    const onSave = useCallback(async () => {
        if (modeApi?.isOnMode()) {
            gridRef.current.api.stopEditing();
            const loadedRows = [];
            const updatedRows = [];
            const addedRows = [];
            gridRef.current.api.forEachNode((node) => {
                loadedRows.push(node.data);
                if (node.data?.rowadded == 1) {
                    addedRows.push(node.data);
                }
                if (!node.data?.rowadded && node.data.rowvalid == 0) {
                    updatedRows.push(node.data);
                }
            });
            if (modeApi.isOnAddMode()) {
                if (addedRows.length > 0) {
                    const success = await modeApi.onAddSave(addedRows, loadedRows);
                    if (success == true && onAddSaveExit) {
                        modeApi.onExit(_exitMode);
                    }
                } else {
                    dataAPI.openNotification("info", 'top', null, "Não existem dados a processar.");
                }
            } else if (modeApi.isOnEditMode()) {
                if (updatedRows.length > 0) {
                    const success = await modeApi.onEditSave(updatedRows, loadedRows);
                    if (success == true) {
                        modeApi.setDirty(false);
                    }
                    if (success == true && onEditSaveExit) {
                        modeApi.onExit(_exitMode);
                    }
                } else {
                    dataAPI.openNotification("info", 'top', null, "Não existem dados a processar.");
                }
            }
        }
    }, [modeApi?.isOnMode()]);


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
            case "helpfilters":
                setHelpFilters(true);
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
                <DrawerHelp visible={helpfilters} setVisible={setHelpFilters} dataAPI={dataAPI} />
                <DrawerSqlQueryView visible={sqlQueryView} setVisible={setSqlQueryView} dataAPI={dataAPI} />
                {moreFilters && <DrawerMoreFilters visible={moreFilters} setVisible={setMoreFilters} onFilterFinish={onFilterFinish} onChange={onChange} onSelectChange={onSelectChange} _value={_value} />}
            </>}
            <Container fluid style={{ padding: "0px" }}>
                {(title || (!title && !leftTitle && dataAPI.preFilters()?.designacao)) && <Row gutterWidth={5} style={{ padding: "5px" }}>
                    <Col>{title}{dataAPI.preFilters()?.designacao && <span style={{ color: "#8c8c8c", fontSize: "14px", fontWeight: 700 }}>{dataAPI.preFilters()?.designacao}</span>}</Col>
                </Row>}
                <Row wrap='nowrap' gutterWidth={5} style={{ padding: "5px", minHeight, backgroundColor: "#f5f5f5", borderRadius: "3px" }} align='end'>

                    <Scroll style={{ display: "flex", alignItems: "end", minHeight }}>
                        <Row nogutter wrap='nowrap' style={{}}>
                            <Col style={{ alignSelf: "end" }} xs="content">
                                {(leftTitle && !title) && <>{leftTitle}{dataAPI.preFilters()?.designacao && <span style={{ color: "#8c8c8c" }}>{dataAPI.preFilters()?.designacao}</span>}</>}
                            </Col>
                            <Col style={{ alignSelf: "end" }} xs="content">
                                {start && start}
                            </Col>

                            {modeApi?.showControls() && modeApi?.enabled() && modeApi?.isReady() && <>
                                {(!modeApi.isOnMode() && modeApi.allowAdd()) && <Col style={{ alignSelf: "end" }} xs="content"><Button type="default" icon={<PlusOutlined />} onClick={() => modeApi.onAddMode(onAddMode)}>{modeApi.addText()}</Button></Col>}
                                {(!modeApi.isOnMode() && modeApi.allowEdit()) && <Col style={{ alignSelf: "end" }} xs="content"><Button type="default" icon={<EditOutlined />} onClick={modeApi.onEditMode}>{modeApi.editText()}</Button></Col>}
                                {(modeApi.isOnMode() && modeApi.isDirty()) && <Col style={{ alignSelf: "end" }} xs="content"><Button type="primary" icon={<EditOutlined />} onClick={onSave}>{modeApi.saveText()}</Button></Col>}
                                {modeApi.isOnMode() && <Col style={{ alignSelf: "end" }} xs="content"><Button type="default" icon={<RollbackOutlined />} onClick={() => modeApi.onExit(_exitMode)} /></Col>}
                            </>}

                            <Col style={{ alignSelf: "end" }} xs="content">
                                {left && left}
                            </Col>
                            <Col style={{ alignSelf: "end", minWidth: "50px" }}></Col>

                            <Col style={{ alignSelf: "end" }} xs="content">{(filters?.toolbar && showFilters) && <FiltersToolbar ref={filterButtons} onPredifinedFilters={() => setPredifinedFilters(true)} onFilterFinish={onFilterFinish} onChange={onChange} onSelectChange={onSelectChange} _value={_value} />}</Col>

                            <Col style={{ alignSelf: "end" }} xs="content">{right && right}</Col>

                        </Row>

                    </Scroll>

                    {(filters?.toolbar && showFilters) && <Col xs="content" ref={filterButtons}></Col>}
                    {showSettings && <Col xs="content" style={{ display: "flex", alignItems: "end", minHeight }}>
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
                </Row>
            </Container>
        </Spin>
    );
}
export const useTableStyles = createUseStyles({
    headerCenter: {
        '& .ag-header-cell-label': { //<-- what should i use here, if there is anything that would work at all?
            justifyContent: 'center'
        }
    },
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
    center: {
        textAlign: "center"
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

export const getAllNodes = (api) => {
    if (!api) {
        return [];
    }
    const _v = [];
    api.forEachNode((node) => {
        _v.push(node.data);
    });
    return _v;
}
export const getAllNodesMap = (api, fn) => {
    if (!api) {
        return [];
    }
    const _v = [];
    const _fn = fn ? fn : (n, i) => n;
    api.forEachNode((node, i) => {
        _v.push(_fn(node.data, i));
    });
    return _v;
}
export const getNodes = (api, fn) => {
    if (!api) {
        return [];
    }
    const _v = [];
    const _fn = fn ? fn : () => true;
    api.forEachNode((node) => {
        if (_fn(node)) { _v.push(node.data) };
    });
    return _v;
}

export const getSelectedNodes = (api, local = false) => {
    if (local) {
        return api.getSelectedNodes();
    }
    const selectedNodes = [];
    const _state = api.getServerSideSelectionState();
    if (_state.selectAll) {
        api.forEachNode(n => {
            if (!_state.toggledNodes.includes(n.id)) {
                selectedNodes.push(n);
            }
        });
    } else {
        api.forEachNode(n => {
            if (_state.toggledNodes.includes(n.id)) {
                selectedNodes.push(n);
            }
        });
    }
    return selectedNodes;
}

const Status = ({ dataAPI }) => {
    return (<div style={{ color: "#f5222d", fontWeight: 700 }}>{dataAPI?.getData()?.status === "error" && dataAPI?.getData()?.title}</div>)
}

export const getCellFocus = (api) => {
    const _t = api.getFocusedCell();
    return { gridApi: api, cellFocus: { rowIndex: _t.rowIndex, colId: _t.column.colId } };

}

export const columnPath = (col) => {
    if (col?.getDefinition()) {
        return col.getDefinition().cellRendererParams?.path ? col.getDefinition().cellRendererParams.path : col.getDefinition().field;
    }
    return null;
}

export const columnHasPath = (col) => {
    return col.getDefinition().cellRendererParams?.path ? true : false;
}

export const defaultValueGetter = (params, fn) => {
    if (typeof fn === "function") {
        const _v = fn(params);
        if (_v !== undefined) {
            return _v;
        }
    }
    const obj=columnHasPath(params.column) ? valueByPath(params.data, columnPath(params.column)) : params.data?.[columnPath(params.column)];
    if (Array.isArray(obj)){
        return obj.join(",");
    }else if (obj instanceof Object){
        return Object.values(obj).join('\t');
    }
    return obj;
}

export const disableTabOnNextCell = ({ event, api, editing, node, column }, onEdit = true) => {
    if (event.key === "Tab" && ((editing == true && onEdit) || !onEdit)) {
        event.preventDefault();
        if (editing) {
            api.stopEditing();
        }
        api.setFocusedCell(node.rowIndex, column.colId);
        return true;
    }
    return false;
}

export default ({
    columnDefs, defaultColDef, columnTypes, dataAPI, local = false, gridApi, setGridApi, modalApi, loadOnInit = true,
    loading = false, showRange = true, allowGoTo = true, showFromTo, showTotalCount, gridRef, showTopToolbar = true, topToolbar = {},
    rowClassRules = {}, modeApi, rowSelection, onSelectionChanged, onCellClick, onRowClick, isRowSelectable,
    ignoreRowSelectionOnCells = [], onBeforeCellEditRequest, onAfterCellEditRequest, rowSelectionIgnoreOnMode = false, suppressCellFocus = false, onGridReady,
    onGridRequest, onGridResponse, onGridFailRequest, modeOptions = {}, gridCss,
    ...props
}) => {
    const { onExitModeRefresh = true, onAddSaveExit = true, onEditSaveExit = false, onExitMode } = modeOptions;
    const classes = useTableStyles();
    const _gridRef = gridRef || useRef();
    const submitting = useSubmitting(false);
    const sourceType = useMemo(() => local ? "clientSide" : "serverSide", [local]);
    const [isReady, setIsReady] = useState(false);
    const [initialState, setInitialState] = useState();
    const [stateFilters, updateStateFilters] = useState({});
    const _columnClicked = useRef();

    const parseFilters = useCallback((values) => {
        const _defs = filtersDef(topToolbar?.filters, _gridRef, { all: true });
        const _values = {};
        for (const [key, value] of Object.entries(values)) {
            const _f = { ..._defs.find(obj => obj.name === key) };
            for (let [_k, _g] of Object.entries(_f.groups)) {
                _f.groups[_k] = processConditions(value?.value ? value.value : value, _g, value?.rel, value?.logic);
                if (!("value" in _f) && _f.groups[_k] !== null) {
                    _f.value = _f.groups[_k].value;
                    _f.logic = _f.groups[_k]?.logic;
                    _f.rel = _f.groups[_k]?.rel;
                }
            }
            const _groups = Object.fromEntries(Object.entries(_f.groups).filter(([key, value]) => value !== null));
            if (!isEmpty(_groups)) {
                _values[key] = excludeObjectKeys({ ..._f, groups: _groups }, ["options", "style", "op", "col", "fnvalue"]);
            }
            // console.log("groups--->", _f);
            // const _pf = processConditions(value?.value ? value.value : value, _f, value?.rel, value?.logic);
            // console.log("filter--->", _pf);
            // if (_pf !== null) {
            //     _values[key] = excludeObjectKeys(_pf, ["options", "style", "op", "col", "fnvalue"]);
            // }
        }
        return _values;
    }, []);

    const isLoading = useMemo(() => {
        if (loading || submitting.state || dataAPI.isLoading()) {
            return true;
        }
        return false;
    }, [loading, submitting.state, dataAPI.isLoading()]);

    useEffect(() => {
        if (dataAPI) {
            dataAPI.onGridRequest(onGridRequest);
            dataAPI.onGridResponse(onGridResponse);
            dataAPI.onGridFailRequest(onGridFailRequest);
        }
        if (modeApi) {
            // modeApi.setOptions({
            //     ...includeObjectKeys(modeOptions,["onAddSave","onEditSave","onModeChange"])
            // });
        }
    });

    useEffect(() => {
        if (isReady && modeApi) {
            modeApi.setOptions({ ...excludeObjectKeys(modeOptions, ["onExitModeRefresh", "onAddSaveExit", "onEditSaveExit", "onExitMode"]), isReady: true });
        }
    }, [isReady]);



    const _onGridReady = useCallback(async (params) => {
        console.log("GIRD-READY");
        //Load Filters State
        updateStateFilters({ ...topToolbar?.initFilterValues?.filter || {} });
        if (topToolbar?.filters && isObjectEmpty(dataAPI.getFilters()) && isObjectEmpty(dataAPI.preFilters())) {
            const _values = parseFilters(topToolbar?.initFilterValues?.filter);
            dataAPI.setFilters(_values);
        }
        if (setGridApi) {
            const { api } = params;
            setGridApi(api);
        }



        if (typeof onGridReady == "function") {
            await onGridReady({ api: params.api, dataAPI });
        }
        if (loadOnInit && local == false) {
            let datasource = dataAPI.dataSourceV4(null, params.api);
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

    const _columnTypes = useMemo(() => {
        return {
            number:{},
            datetime:{},
            date:{},
            time:{},
            options:{},
            text:{},
            input:{},
            actionOnViewColumn: {
                sortable: false,
                supressMenu: true,
                editable: false,
                hide: true,
                width: 45,
                resizable: false,
                cellStyle: (params) => {
                    return {

                    };
                }
            },
            actionOnModeColumn: {
                sortable: false,
                supressMenu: true,
                editable: false,
                hide: true,
                width: 45,
                resizable: false,
                cellStyle: (params) => {
                    return {

                    };
                }
            },
            actionOnEditColumn: {
                sortable: false,
                supressMenu: true,
                editable: false,
                hide: true,
                width: 45,
                resizable: false,
                cellStyle: (params) => {
                    return {

                    };
                }
            },
            actionOnAddColumn: {
                sortable: false,
                supressMenu: true,
                editable: false,
                hide: true,
                width: 45,
                resizable: false,
                cellStyle: (params) => {
                    return {

                    };
                }
            },
            actionColumn: {
                sortable: false,
                supressMenu: true,
                editable: false,
                hide: true,
                width: 45,
                resizable: false,
                cellStyle: (params) => {
                    return {

                    };
                }
            },
            ...columnTypes
        };
    }, [modeApi?.isOnMode()]);

    useEffect(() => {
        if (modeApi && isReady) {
            _gridRef.current.api.getColumns().forEach(c => {
                if (c.getDefinition().type === "actionOnViewColumn") {
                    _gridRef.current.api.setColumnsVisible([c], !modeApi.isOnMode());
                } else if (c.getDefinition().type === "actionOnModeColumn") {
                    _gridRef.current.api.setColumnsVisible([c], modeApi.isOnMode());
                } else if (c.getDefinition().type === "actionOnEditColumn") {
                    _gridRef.current.api.setColumnsVisible([c], modeApi.isOnEditMode());
                } else if (c.getDefinition().type === "actionOnAddColumn") {
                    _gridRef.current.api.setColumnsVisible([c], modeApi.isOnAddMode());
                }
            });
        } else if (!modeApi && isReady) {
            _gridRef.current.api.getColumns().forEach(c => {
                if (c.getDefinition().type === "actionOnViewColumn") {
                    _gridRef.current.api.setColumnsVisible([c], true);
                }
            });
        }
    }, [isReady, modeApi?.isOnMode(), columnDefs?.timestamp]);

    useEffect(() => {
        //Apenas loading externo!!!!
        if (loading && isReady) {
            _gridRef.current.api.showLoadingOverlay();
        } else if (!loading && isReady) {
            _gridRef.current.api.hideOverlay();
        }
    }, [loading, isReady]);

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
            ]
        };
    }, [isLoading, dataAPI.getTimeStamp(), dataAPI.getPageSize(), dataAPI.getCurrentPage(), modeApi?.isOnMode()]);


    const _onCellEditRequest = async event => {
        const _path = columnPath(event.column);
        let _eventdata = event.data;
        let _data;

        if (typeof onBeforeCellEditRequest === "function") {
            _data = await onBeforeCellEditRequest(_eventdata, event.column.getDefinition(), _path, event.newValue, event);
        }
        let result;
        if (_data !== false) {
            if (isNil(_data)) {
                _data = assocPath(_path.split('.'), event.newValue, _eventdata);
            }
            const transaction = {
                update: [{ ...assoc('rowvalid', 0, _data) }],
            };
            if (local) {
                result = _gridRef.current.api.applyTransaction(transaction);
            } else {
                result = _gridRef.current.api.applyServerSideTransaction(transaction);

            }
        }
        if (typeof onAfterCellEditRequest === "function") {
            await onAfterCellEditRequest(event.node.data, event.column.getDefinition(), _path, event.newValue, event, result);
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
            _gridRef.current.api.refreshServerSide({ purge: true });
            //_gridRef.current.api.paginationGoToPage(0);
        }
    }, []);

    const _onSelectionChanged = useCallback(() => {
        if (ignoreRowSelectionOnCells.includes(_columnClicked.current)) {
            return;
        }
        const selectedRows = _gridRef.current.api.getSelectedRows();
        if (typeof onSelectionChanged === "function") {
            onSelectionChanged(selectedRows);
        }
    }, []);

    const _onCellClick = useCallback((data) => {
        _columnClicked.current = data.column.colId;
        if (typeof onCellClick === "function") {
            onCellClick(data.colDef, data.data);
        }
    }, []);

    const _onRowClick = useCallback((data, v, y) => {
        if (typeof onRowClick === "function") {
            onRowClick(data.data, data.rowIndex);
        }
    }, []);

    const _isRowSelectable = useCallback((params) => {
        if (typeof isRowSelectable === "function") {
            return isRowSelectable(params);
        }
        return true;
    }, []);

    return (
        <GridContainer>
            <TableContext.Provider value={{ dataAPI, modeApi, gridRef: _gridRef, stateFilters, updateStateFilters, topToolbar, local }}>
                {isReady && <Toolbar loading={isLoading} visible={showTopToolbar} onExitModeRefresh={onExitModeRefresh} onAddSaveExit={onAddSaveExit} onEditSaveExit={onEditSaveExit} onExitMode={onExitMode} /* onExit={() => modeApi.onExit(onExitMode)} onAdd={() => modeApi.onAddMode(onAddMode)} */ onFilterFinish={onFilterFinish} />}
                <div className={`ag-theme-quartz ag-custom ${gridCss}`}>
                    <AgGridReact
                        animateRows={false}
                        ref={_gridRef}
                        onFirstDataRendered={onFirstDataRendered}
                        isRowSelectable={_isRowSelectable}
                        enableRangeSelection={true}
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
                        paginationPageSize={dataAPI.getPageSize()}
                        suppressPaginationPanel={true}
                        suppressScrollOnNewData={true}
                        {...dataAPI.getPagination().enabled && { onPaginationChanged }}

                        columnDefs={columnDefs?.cols ? columnDefs?.cols : columnDefs}
                        defaultColDef={defaultColDef}
                        rowModelType={sourceType}
                        columnTypes={_columnTypes}
                        maxBlocksInCache={0}
                        {...!local ? { cacheBlockSize: dataAPI.getPageSize() } : {}}
                        {...local ? { rowData: dataAPI.getData().rows } : {}}

                        {...(rowSelection && !rowSelectionIgnoreOnMode) && {
                            rowSelection: modeApi?.enabled() ? null : rowSelection,
                            onSelectionChanged: _onSelectionChanged,
                            suppressCellFocus: modeApi?.enabled() ? false : true
                        }}
                        {...(rowSelection && rowSelectionIgnoreOnMode) && {
                            rowSelection,
                            onSelectionChanged: _onSelectionChanged,
                            suppressCellFocus
                        }}
                        //sideBar={'columns'}
                        onGridReady={_onGridReady}
                        getRowId={getRowId}
                        maxComponentCreationTimeMs={2500}
                        enableCellTextSelection={false}
                        suppressContextMenu={true}
                        onRowClicked={_onRowClick}
                        //onCellKeyDown={(v) => console.log("###", v)}
                        //onCellClicked={(v) => console.log("###", v)}
                        //onGridPreDestroyed={onGridPreDestroyed}
                        statusBar={statusBar}
                        onCellEditRequest={_onCellEditRequest}
                        onCellClicked={_onCellClick}
                        readOnlyEdit={true}
                        rowClassRules={_rowClassRules}
                        reactiveCustomComponents
                        rowHeight={31}

                        overlayLoadingTemplate={
                            '<div style="background:#fafafa;border-radius:5px;padding:10px;">Aguarde um momento...</div>'
                        }
                        {...props}
                    />
                </div>
            </TableContext.Provider>
        </GridContainer>
    );
};