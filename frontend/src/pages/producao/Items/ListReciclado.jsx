import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Collapse, Form, Input, Typography, Space, Button } from "antd";
import { DATETIME_FORMAT, API_URL } from "config";
import { useLocation, useNavigate } from "react-router-dom";
import { getFloat, useSubmitting, noValue } from "utils";
import { useDataAPI } from "utils/useDataAPIV3";
import { AppContext, MediaContext } from "app";
import ResponsiveModal from 'components/Modal';
import { NwColumn, PosColumn, QueueNwColumn, RightAlign, EstadoReciclado, DateTime, LeftAlign, Link } from 'components/TableColumns';
import Table, { useTableStyles } from 'components/TableV3';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { useModal } from "react-modal-hook";
import { usePermission } from "utils/usePermission";
import { createUseStyles } from 'react-jss';
import {
    EditOutlined, CameraOutlined, DeleteTwoTone, ExpandAltOutlined, TabletOutlined, PaperClipOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined,
    CaretDownOutlined, CaretUpOutlined, LockOutlined, RollbackOutlined, PlusOutlined, EllipsisOutlined, StarFilled, CaretLeftOutlined, CaretRightOutlined,
    RightOutlined, LeftOutlined, UnorderedListOutlined, PrinterOutlined
} from '@ant-design/icons';
import RecicladoList from "../../picking/RecicladoList";
import PickReciclado from "../../picking/PickReciclado";

const useStyles = createUseStyles({});


export default ({ hash, data, ...props }) => {
    const media = useContext(MediaContext);
    const permission = usePermission({ name: "widget", item: "estadoProducao" });//Permissões Iniciais
    const inputParameters = useRef({});
    const { openNotification } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = { method: "RecicladoList" };
    const defaultSort = [{ column: "id", direction: "DESC" }];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: `${API_URL}/reciclado/sql/`, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false, limit: 10 }, filter: defaultFilters, sort: [...defaultSort] } });
    const submitting = useSubmitting(false);
    const [unSelected, setUnSelected] = useState({});
    const [lastTab, setLastTab] = useState('1');
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            switch (modalParameters.content) {
                case "recicladoexpand": return <RecicladoList parameters={{ ...modalParameters.parameters }} />
                case "reciclado": return <PickReciclado parameters={{ ...modalParameters.parameters }} />
                /* case "bobines": return <BobinesGroup tab={modalParameters.tab} setTab={modalParameters.setLastTab} parameters={{ ...modalParameters.parameters }} noid={true} />
                case "bobinagensexpand": return <BobinagensList parameters={{ ...modalParameters.parameters }} noid={true} />
                case "formulacao": return <FormFormulacao parameters={modalParameters.parameters} />
                case "granuladopick": return <GranuladoPick parameters={modalParameters.parameters} />
                case "paletesstock": return <PaletesStockList parameters={modalParameters.parameters} />
                case "linelogexpand": return <LineLogList parameters={modalParameters.parameters} />
                case "nwspick": return <PickNWList {...modalParameters.parameters} />;
                case "nwsprint": return <FormPrint {...modalParameters.parameters} />; */
            }
        }
        return (
            <ResponsiveModal lazy={modalParameters?.lazy} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        // if (data?.group) {
        //     return tableCls.right;
        // }
    };

    const groups = [/* { name: 'bobines', header: 'Bobines', headerAlign: "center" } */];

    const columns = [
        { name: 'lote', header: 'Lote', defaultWidth: 120,  render: ({ cellProps, data }) => <Link cellProps={cellProps} value={data?.lote} onClick={() => onClickReciclado(data)} />  /* formatter: p => <Button type="link" size="small" onClick={() => navigate('/app/picking/pickreciclado', { state: { id: p.row.id } })}>{p.row.lote}</Button> */ },
        { name: 'estado', header: 'Estado', defaultWidth: 60, render: ({ cellProps, data }) => <EstadoReciclado estado={data.estado} cellProps={cellProps} /> /* formatter: p => <Status estado={p.row.estado} />, editor(p) { return p.row.status === 1 && <ModalEstadoChange p={p} submitting={submitting} dataAPI={dataAPI} /> }, editorOptions: { editOnClick: true }*/ },
        { name: 'peso', header: 'Peso', defaultWidth: 60, render: ({ cellProps, data }) => <RightAlign unit={noValue(data?.peso).toString().endsWith("kg") ? null : "kg"}>{data?.peso}</RightAlign> /* formatter: p => <div style={{ textAlign: "right" }}>{p.row.peso} kg</div> */ },
        { name: 'tara', header: 'Tara', defaultWidth: 60, render: ({ cellProps, data }) => <RightAlign unit={noValue(data?.tara).toString().endsWith("kg") ? null : "kg"}>{data?.tara}</RightAlign> /* formatter: p => <div style={{ textAlign: "right" }}>{p.row.tara}</div> */ },
        { name: 'produto_granulado', header: 'Produto', flex:1},
        { name: 'timestamp', header: 'Data', defaultWidth: 110, render: ({ cellProps, data }) => <DateTime value={data?.timestamp} cellProps={cellProps} /> }
    ];

    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [hash?.hash_estadoproducao]);

    const loadData = async ({ signal, init = false } = {}) => {
        dataAPI.setAction("init", true);
        dataAPI.update(true);
    }

    const onFilterFinish = (type, values) => { }
    const onFilterChange = (changedValues, values) => { };
    const rowClassName = ({ data }) => {
        if (data?.status == 0) {
            return tableCls.warning;
        }
    }

    const onRecicladoExpand = () => {
        setModalParameters({ content: "recicladoexpand", type: "drawer", push: false, width: "90%", title: null, parameters: { filter: {} } });
        showModal();
    }
    const onClickReciclado = (data) => {
        setModalParameters({ content: "reciclado", type: "drawer", push: false, width: "90%", title: null, parameters: { id:data?.id } });
        showModal();
    }

    return (<>
        <Row nogutter style={{ border: "solid 1px #595959", padding: "3px", margin: "3px 0 0 0 " }}>
            <Col >
                <Row nogutter>
                    <Col style={{ background: "#f0f0f0", padding: "3px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                        <div style={{}}>Reciclado</div>
                        <div>
                            <Space>
                                {/* <Button type="primary" size="small" icon={<PrinterOutlined />} title="Imprimir etiquetas de nonwovens" onClick={()=>onNwsPrint(selectedNws)}>Imprimir</Button>
                                <Button type="primary" size="small" icon={<TabletOutlined />} title="Entrada e saida de Nonwovens" onClick={onNwsPick} />*/}
                                <div><Button type="primary" size="small" ghost icon={<ExpandAltOutlined />} onClick={onRecicladoExpand} /></div>
                            </Space>
                        </div>
                    </Col>
                </Row>
                <Row nogutter>
                    <Col>
                        <Table
                            {...true && { style: { fontSize: "10px", minHeight: "100px" } }}
                            // {...true && { rowHeight: 35 }}
                            //rowHeight={null}
                            headerHeight={25}
                            cellNavigation={false}
                            // onSelectionChange={onSelectionChange}
                            checkboxColumn={false}
                            // selected={selectedNws}
                            //enableSelection={false}
                            //showActiveRowIndicator={false}
                            //loading={submitting.state}
                            showLoading={false}
                            idProperty={dataAPI.getPrimaryKey()}
                            local={false}
                            onRefresh={loadData}
                            rowClassName={rowClassName}
                            groups={groups}
                            sortable={true}
                            reorderColumns={false}
                            showColumnMenuTool={false}
                            disableGroupByToolbar={true}
                            editable={{ enabled: false, add: false }}
                            columns={columns}
                            dataAPI={dataAPI}
                            moreFilters={false}
                            leftToolbar={false}
                            toolbarFilters={false}
                            toolbar={false}
                        />

                    </Col>
                </Row>
            </Col>
        </Row>




    </>);
}