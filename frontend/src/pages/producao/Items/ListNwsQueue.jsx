import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Collapse, Form, Input, Typography, Space, Button } from "antd";
import { DATETIME_FORMAT } from "config";
import { useLocation, useNavigate } from "react-router-dom";
import { getFloat, useSubmitting } from "utils";
import { useDataAPI } from "utils/useDataAPIV3";
import { AppContext, MediaContext } from "app";
import ResponsiveModal from 'components/Modal';
import { DateTime, NwColumn, PosColumn, QueueNwColumn, RightAlign } from 'components/TableColumns';
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

const useStyles = createUseStyles({});


export default ({ hash, data, onNwsPick, onNwsPrint, ...props }) => {
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
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: ``, primaryKey: "id", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });
    const submitting = useSubmitting(false);
    const [unSelected, setUnSelected] = useState({});
    const [lastTab, setLastTab] = useState('1');
    const [selectedNws, setSelectedNws] = useState([]);

    // const [modalParameters, setModalParameters] = useState({});
    // const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

    //     const content = () => {
    //         switch (modalParameters.content) {
    //             case "details": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
    //         }
    //     }

    //     return (
    //         <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
    //             {content()}
    //         </ResponsiveModal>
    //     );
    // }, [modalParameters]);
    // const onClick = (type, row) => {
    //     setModalParameters({ content: "details", tab: lastTab, setLastTab, type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: loadData, parameters: { palete: row, palete_id: row.palete_id, palete_nome: row.nome } });
    //     showModal();
    // }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        // if (data?.group) {
        //     return tableCls.right;
        // }
    };

    const groups = [{ name: 'bobines', header: 'Bobines', headerAlign: "center" }];

    const columns = [
        ...(true) ? [{ name: 'type', header: '', userSelect: true, defaultLocked: false, defaultWidth: 50, headerAlign: "center", render: ({ cellProps, data }) => <PosColumn value={data.type} cellProps={cellProps} /> }] : [],
        ...(true) ? [{ name: 'n_lote', header: 'Nonwoven', userSelect: true, defaultLocked: false, defaultWidth: 150, flex: 1, headerAlign: "center", render: ({ cellProps, data }) => <NwColumn data={data} cellProps={cellProps} /> }] : [],
        //...(true) ? [{ name: 'artigo_cod', header: 'Cód', userSelect: true, defaultLocked: false, defaultWidth: 100, headerAlign: "center", render: ({ cellProps, data }) => data?.artigo_cod }] : [],
        //...(true) ? [{ name: 'artigo_des', header: 'Artigo', userSelect: true, defaultLocked: false, defaultWidth: 140, flex: 1, headerAlign: "center", render: ({ cellProps, data }) => data?.artigo_des.replace("Nonwoven ", "") }] : [],
        ...(true) ? [{ name: 'queue', header: 'Fila', userSelect: true, defaultLocked: false, defaultWidth: 90, headerAlign: "center", render: ({ cellProps, data }) => <QueueNwColumn style={{ fontSize: "9px" }} value={data.queue} status={data.status} /> }] : [],
        ...(true) ? [{ name: 't_stamp', header: 'Data', userSelect: true, defaultLocked: false, defaultWidth: 110, headerAlign: "center", render: ({ cellProps, data }) => <DateTime cellProps={cellProps} value={data?.t_stamp} format={DATETIME_FORMAT} /> }] : [],
        ...(true) ? [{ name: 'comp', header: 'Comp.', userSelect: true, defaultLocked: false, defaultWidth: 55, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m">{getFloat(data?.comp, 0)}</RightAlign> }] : [],
    ];


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [hash?.hash_estadoproducao]);

    const loadData = async ({ signal, init = false } = {}) => {
        dataAPI.setData({ rows: data?.nws_queue, total: data?.nws_queue?.length });
    }

    const onSelectionChange = useCallback(({ selected, unselected }) => {
        setSelectedNws(selected);
        setUnSelected(unselected)
    }, []);

    const onFilterFinish = (type, values) => { }
    const onFilterChange = (changedValues, values) => { };
    const rowClassName = ({ data }) => {
        // if (data?.nbobines_real != data?.num_bobines) {
        //     return tableCls.warning;
        // }
    }

    return (<>


        <Row nogutter style={{ border: "solid 1px #595959", padding: "3px", margin: "3px 0 0 0 " }}>
            <Col >
                <Row nogutter>
                    <Col style={{ background: "#f0f0f0", padding: "3px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
                        <div style={{}}>Nonwovens Fila</div>
                        <div>
                            <Space>
                                <Button type="primary" size="small" icon={<PrinterOutlined />} title="Imprimir etiquetas de nonwovens" onClick={()=>onNwsPrint(selectedNws)}>Imprimir</Button>
                                {/* <Button type="primary" size="small" icon={<TabletOutlined />} title="Entrada e saida de Nonwovens" onClick={onNwsPick} />
                                <div><Button type="primary" size="small"  onClick={onBobinagensExpand}  ghost icon={<ExpandAltOutlined />} /></div> */}
                            </Space>
                        </div>
                    </Col>
                </Row>
                <Row nogutter>
                    <Col>
                        <Table
                            {...true && { style: { fontSize: "10px", minHeight: "160px" } }}
                            {...true && { rowHeight: 35 }}
                            //rowHeight={null}
                            headerHeight={25}
                            cellNavigation={false}
                            onSelectionChange={onSelectionChange}
                            checkboxColumn={true}
                            selected={selectedNws}
                            //enableSelection={false}
                            //showActiveRowIndicator={false}
                            //loading={submitting.state}
                            showLoading={false}
                            idProperty={dataAPI.getPrimaryKey()}
                            local={true}
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