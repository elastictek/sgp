import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema } from "utils/schemaValidator";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
//import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace, HorizontalRule, SelectDebounceField } from "components/formLayout";
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Button, Form, Space, Input, InputNumber, Tooltip, Popover, Dropdown, Menu, Divider, Select } from "antd";
import Icon, { LoadingOutlined, EditOutlined, CompassOutlined, InfoCircleOutlined, ReloadOutlined, EllipsisOutlined, FilterOutlined, SettingOutlined, SearchOutlined, FileFilled } from '@ant-design/icons';
import ClearSort from 'assets/clearsort.svg';
import MoreFilters from 'assets/morefilters.svg'
import ResultMessage from 'components/resultMessage';
import { Report } from "components/DownloadReports";
import Pagination from 'components/Paginator';
import Spin from "./Spin";
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS } from 'config';
import DataGrid, { Row as TableRow } from 'react-data-grid';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer } from 'components/FormFields';

const columns = [
    { key: 'action', name: '' },
    { key: 'id', name: 'id' },
    { key: 'nome', name: 'Palete' },
    { key: 'largura_bobines', name: 'Largura' },
    { key: 'area', name: 'Área' },
    { key: 'comp_total', name: 'Comprimento' }

];

//cols = ['distinct(pp.id),pp.nome,pp.largura_bobines,pp.core_bobines,pp.area,pp.comp_total']

/* const rows = [
    { id: 0, title: 'Example' },
    { id: 1, title: 'Demo' }
]; */

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const Table = styled(DataGrid).withConfig({
    shouldForwardProp: (prop) =>
        !['height', 'pagination'].includes(prop)
})`
    block-size:${props => {
        const h = props?.height ? props.height : "100%";
        const p = props.paginationPos === 'both' ? "90px" : "45px";
        return props?.pagination ? `calc(${h} - ${p})` : h;
    }};
    scrollbar-color:rgba(105,112,125,.5) transparent;
    scrollbar-width:thin;
    -webkit-mask-image:linear-gradient(180deg,rgba(255,0,0,.1) 0 7.5px calc(100%-7.5px),rgba(255,0,0,.1));
    mask-image:linear-gradient(180deg,rgba(255,0,0,.1) 0 7.5px calc(100%-7.5px),rgba(255,0,0,.1));
    &::-webkit-scrollbar {
      width:16px;
      height:16px;
    }
    &::-webkit-scrollbar-thumb{
      background-color:rgba(105,112,125,.5);
      background-clip:content-box;
      border-radius:16px;
      border:6px solid transparent;
    }
    &::-webkit-scrollbar-corner{
      background-color:transparent;
    }
    &:focus {
        outline: none;
    }
    &:focus:focus-visible{
      outline-style:auto;
    } 


    .ant-btn-icon-only{
        vertical-align:0px;
    }

    .rdg-header-row{
        color: #fff!important;
        background-color: #262626!important;
        font-size:12px;
    }
    .rdg-row{
        font-size:12px;
    }
`;

const Action = ({ dataAPI, content, ...props }) => {
    const [clickPopover, setClickPopover] = useState(false);

    const handleClickPopover = (visible) => {
        setClickPopover(visible);
    };

    const hide = () => {
        setClickPopover(false);
    };

    return (
        <>
            <Popover
                visible={clickPopover}
                onVisibleChange={handleClickPopover}
                placement="bottomRight"
                title=""
                content={React.cloneElement(content, { ...content.props, hide })}
                trigger="click"
            >
                <Button size="small" icon={<EllipsisOutlined />} />
            </Popover>
        </>
    )
}



const ContentSettings = ({ setIsDirty, onClick, dataAPI, columns, pageSize, setPageSize, reportTitle: _reportTitle, moreFilters, reports }) => {
    const [reportTitle, setReportTitle] = useState(_reportTitle);
    const updateReportTitle = (e) => {
        console.log(e.target)
        setReportTitle(e.target.value);
    }
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <Menu onClick={(v) => onClick(v)} items={[
                { label: 'Atualizar', key: 'refresh', icon: <ReloadOutlined />, data: {} },
                { label: 'Limpar Ordenação', key: 'cleansort', icon: <Icon component={ClearSort} />, data: {} },
                (moreFilters) && { label: 'Mais Filtros', key: 'morefilters', icon: <Icon component={MoreFilters} />, data: {} }
            ]}></Menu>
            <Divider style={{ margin: "8px 0" }} />
            <div style={{ display: "flex", flexDirection: "row" }}>
                <Select value={pageSize} onChange={(v) => { setIsDirty(true); setPageSize(v); }} size="small" options={[{ value: 10, label: "10" }, { value: 15, label: "15" }, { value: 20, label: "20" }, { value: 30, label: "30" }, { value: 50, label: "50" }, { value: 100, label: "100" }]} />
                <div style={{ marginLeft: "5px" }}>Registos/Página</div>
            </div>
            {reports && <>
                <Divider orientation="left" orientationMargin="0" style={{ margin: "8px 0" }}>Relatórios</Divider>
                <Input value={reportTitle} onChange={updateReportTitle} size="small" maxLength={200} />
                <Report dataAPI={dataAPI} columns={columns} hide={onClick} title={reportTitle} />
            </>}
        </div>
    );
}

const ToolbarFilters = ({ form, dataAPI, schema, onFinish, onValuesChange, initialValues, filters }) => {
    useEffect(() => {
        console.log("entreiiinnnni", filters);
    });
    return (
        <Form form={form} name={`f-ltf`} onFinish={(values) => onFinish("filter", values)} onValuesChange={onValuesChange} onKeyPress={(e) => { if (e.key === "Enter") { form.submit(); } }} initialValues={initialValues}>

            <FormContainer id="LAY-TOOLBAR-FILTERS" wrapForm={false} form={form} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} forInput={true}>
                <Row style={{ justifyContent: "end" }} gutterWidth={2}>
                    {filters}
                </Row>
            </FormContainer>
        </Form>
    )
}



export default ({ dataAPI, loadOnInit = false, columns: cols, actionColumn, paginationPos = 'bottom', title, reportTitle, settings = true, moreFilters = true, reports = true, toolbar = true, toolbarFilters, ...props }) => {
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);

    const [isSettingsDirty, setSettingsIsDirty] = useState(false);
    const [clickSettings, setClickSettings] = useState(false);

    const updatePageSize = (size) => {
        dataAPI.pageSize(size);
        dataAPI.fetchPost();
    }

    const hideSettings = () => {
        setClickSettings(false);
    };

    const handleSettingsClick = (visible) => {
        setClickSettings(visible);
    };

    const onSettingsClick = async (type) => {
        if (type?.key) {
            switch (type.key) {
                case 'refresh': dataAPI.fetchPost(); break;
                case 'cleansort': dataAPI.clearSort(); dataAPI.fetchPost(); break;
                default: break;
            }
        }
        hideSettings();
    }

    useEffect(() => {
        if (!dataAPI.isLoading()) {
            if (dataAPI.hasData()) {
                setRows(dataAPI.getData().rows);
            } else {
                if (React.isValidElement(actionColumn)) {
                    setColumns([{
                        key: 'action', name: '', minWidth: 40, width: 40, sortable: false, resizable: false,
                        formatter: (props) => <Action {...props} dataAPI={dataAPI} content={actionColumn} />
                    }, ...cols]);
                } else {
                    setColumns([...cols]);
                }
                if (loadOnInit) {
                    console.log("#################################");
                    dataAPI.fetchPost({});
                }
            }
        }
    }, [dataAPI.getTimeStamp()]);

    const onColumnResize = (idx, width) => {
        console.log("column resize->", idx, "-", width);
    }

    const onSortColumnsChange = (columns) => {
        let _columns = columns.map(item => ({
            column: item.columnKey,
            direction: item.direction
        }));
        dataAPI.setSort(_columns, true);
        dataAPI.fetchPost();
    }

    const sortColumns = () => {
        return dataAPI.getSort(true).map(item => ({
            columnKey: item.column,
            direction: item.direction
        }));
    }

    const onPageChange = (page) => {
        dataAPI.currentPage(page, true);
        dataAPI.fetchPost();
    }

    const GridRow = ({ ...props }) => {
        const selectCell = () => {
            if (columns.length > 0 && props.selectedCellIdx !== undefined) {
                return columns[props.selectedCellIdx].key === "action" ? undefined : props.selectedCellIdx;
            }
            return props.selectedCellIdx;
        }
        return <TableRow {...props} selectedCellIdx={selectCell()} />;
    }

    const handleCopy = ({ sourceRow, sourceColumnKey }) => {
        if (window.isSecureContext) {
            navigator.clipboard.writeText(sourceRow[sourceColumnKey]);
        }
    }

    return (
        <Spin loading={dataAPI.isLoading()}>
            {toolbar && <Container fluid style={{ background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "3px", padding: "5px" }}>
                <Row align='start' wrap="nowrap" gutterWidth={2}>
                    <Col xs="content">{title}</Col>
                    <Col>
                        <div /*  style={{display:"flex",flexDirection:"row", justifyContent:"right"}} */>
                            <ToolbarFilters dataAPI={dataAPI} {...toolbarFilters} />
                        </div>
                    </Col>
                    <Col xs="content" style={{ padding: "0px", alignSelf: "end" }}><Button onClick={()=>(toolbarFilters?.form) && toolbarFilters.form.submit()} size="small"><SearchOutlined /></Button></Col>
                {settings && <Col xs="content" style={{ alignSelf: "end"}}>

                    <Popover
                        visible={clickSettings}
                        onVisibleChange={handleSettingsClick}
                        placement="bottomRight" title="Opções"
                        content={
                            <ContentSettings setIsDirty={setSettingsIsDirty} onClick={onSettingsClick}
                                dataAPI={dataAPI} columns={columns} pageSize={dataAPI.getPageSize(true)} setPageSize={updatePageSize} reportTitle={reportTitle}
                                moreFilters={moreFilters} reports={reports}
                            />
                        } trigger="click">
                        <Button size="small" icon={<SettingOutlined />}/>
                    </Popover>

                </Col>}
            </Row>
            </Container>}
            <Container fluid style={{ padding: "0px", ...(toolbar && { marginTop: "5px" }) }}>
                <Row align='center' wrap="nowrap">
                    <Col>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            {(dataAPI.getPagination(true).enabled && paginationPos !== 'bottom') && <Pagination
                                className="pagination-bar"
                                currentPage={dataAPI.getPagination(true).page}
                                totalCount={dataAPI?.hasData() ? dataAPI.getData().total : 0}
                                pageSize={dataAPI.getPageSize(true)}
                                onPageChange={onPageChange}
                                isLoading={dataAPI.isLoading()}
                            />}
                        </div>
                    </Col>
                </Row>
            </Container>
            <Table
                sortColumns={sortColumns()}
                rows={rows}
                rowHeight={React.isValidElement(actionColumn) ? 26 : 24}
                headerRowHeight={24}
                defaultColumnOptions={{ sortable: true, resizable: true }}
                onColumnResize={onColumnResize}
                onSortColumnsChange={onSortColumnsChange}
                pagination={dataAPI.getPagination(true).enabled}
                paginationPos={paginationPos}
                height="100%"
                columns={columns}
                onCopy={handleCopy}
                //onPaste={handlePaste}
                components={{ rowRenderer: GridRow }}
                {...props}
            />
            <Container fluid style={{ background: "#f8f9fa", padding: "0px" }}>
                <Row align='center' nogutter wrap="nowrap">
                    <Col xs="content">
                        <Hidden xs><div id="filter-tags"></div></Hidden>
                        <Visible xs><Dropdown trigger={['click']} overlay={<div id="filter-tags"></div>}><Button icon={<FilterOutlined />} size="small" /></Dropdown></Visible>
                    </Col>
                    <Col></Col>
                    <Col xs='content'>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            {(dataAPI.getPagination(true).enabled && paginationPos !== 'top') && <Pagination
                                className="pagination-bar"
                                currentPage={dataAPI.getPagination(true).page}
                                totalCount={dataAPI?.hasData() ? dataAPI.getData().total : 0}
                                pageSize={dataAPI.getPageSize(true)}
                                onPageChange={onPageChange}
                                isLoading={dataAPI.isLoading()}
                            />}
                        </div>
                    </Col>
                </Row>
            </Container>
        </Spin >
    );
}