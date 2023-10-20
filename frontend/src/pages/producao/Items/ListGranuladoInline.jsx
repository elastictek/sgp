import React, { lazy, useContext, useEffect, useRef, useState } from 'react';
import { Collapse, Form, Input, Typography } from "antd";
import { DATETIME_FORMAT } from "config";
import { createUseStyles } from 'react-jss';
import { useLocation, useNavigate } from "react-router-dom";
import { useSubmitting } from "utils";
import { useDataAPI } from "utils/useDataAPIV3";
import { AppContext, MediaContext } from "app";
import ResponsiveModal from 'components/Modal';
import { ArtigoColumn, Cuba, DateTime, RightAlign } from 'components/TableColumns';
import Table, { useTableStyles } from 'components/TableV3';
import { useModal } from "react-modal-hook";
import { usePermission } from "utils/usePermission";

const useStyles = createUseStyles({

    link: {
        color: '#fff',
        '&:hover': {
            color: '#003eb3',
        }
    }
});


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
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: ``, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });
    const submitting = useSubmitting(false);

    const [lastTab, setLastTab] = useState('1');

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "details": return <Palete tab={modalParameters.tab} setTab={modalParameters.setLastTab} loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onClickPalete = (type, row) => {
        setModalParameters({ content: "details", tab: lastTab, setLastTab, type: "drawer", push: false, width: "90%", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: loadData, parameters: { palete: row, palete_id: row.palete_id, palete_nome: row.nome } });
        showModal();
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        // if (data?.group) {
        //     return tableCls.right;
        // }
    };


    const groups = [{ name: 'bobines', header: 'Bobines', headerAlign: "center" }];

    const columns = [
        ...(true) ? [{
            name: 'cuba', header: 'Pos.', headerAlign: "center", userSelect: true, showColumnMenuTool: false, defaultLocked: true, width: 70, render: (p) => <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                <Cuba style={{ fontSize: "10px", height: "13px", lineHeight: 1.2 }} value={p.data?.cuba} />
                {p.data?.dosers}
            </div>
        }] : [],
        ...(true) ? [{
            name: 'artigo_cod', header: 'Artigo', headerAlign: "center", userSelect: true, showColumnMenuTool: false, defaultWidth: 170, flex: 1, render: ({ data, cellProps }) => <ArtigoColumn data={data} cellProps={cellProps} />
        }] : [],
        ...(true) ? [{
            name: 'n_lote', header: 'Lote', headerAlign: "center", userSelect: true, showColumnMenuTool: false, defaultWidth: 140, render: (p) =>
                <div style={{ display: "flex", alignItems: "start", flexDirection: "column" }}>
                    <div style={{ fontWeight: 700 }}>{p.data?.n_lote}</div>
                    <RightAlign unit="kg">{p.data?.qty_lote}</RightAlign>
                </div>
        }] : [],
        ...(true) ? [{ name: 'arranque', header: '%', headerAlign: "center", userSelect: true, showColumnMenuTool: false, width: 40, render: (p) => <RightAlign unit="%">{p.data?.arranque}</RightAlign> }] : [],
        ...(true) ? [{ name: 't_stamp', header: 'Data', headerAlign: "center", userSelect: true, showColumnMenuTool: false, width: 120, render: (p) => <DateTime value={p.data?.t_stamp} format={DATETIME_FORMAT} cellProps={p.cellProps} /> }] : [],
    ]


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [hash?.hash_estadoproducao]);

    const loadData = async ({ signal, init = false } = {}) => {
        //submitting.trigger();
        //const _d = data?.paletes.filter(v => data?.filter.includes(v.ofid) && v.palete_id);
        dataAPI.setData({ rows: data?.granulado_inline, total: data?.granulado_inline?.length });
        // if (parameters?.data?.rows) {

        //     const _dj = Object.values(parameters?.data?.rows.reduce((acc, cur) => {
        //         if (!acc[cur.gid]) {
        //             acc[cur.gid] = { ...cur, stock: cur.current_stock == 1 ? cur : {} };
        //         } else {
        //             if (cur.current_stock == 1) {
        //                 acc[cur.gid].stock = cur;
        //             } else {
        //                 //acc[cur.gid].a += cur.a;
        //             }
        //         }

        //         //totals
        //         acc[cur.gid].paletizacao = { ...parameters?.data?.paletizacao.find(v => v.of_cod == acc[cur.gid]?.of_cod) };
        //         acc[cur.gid].bobines = parameters?.data?.bobines?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
        //         acc[cur.gid].num_paletes_of_percentage = getFloat((100 * getFloat(acc[cur.gid].current_num_paletes_of)) / getFloat(acc[cur.gid].num_paletes_of), 0);
        //         acc[cur.gid].total_planned = {
        //             num_paletes: getFloat(acc[cur.gid].num_paletes) * json(acc[cur.gid].lvl).length,
        //             num_bobines: getFloat(acc[cur.gid].num_bobines) * json(acc[cur.gid].lvl).length
        //         };
        //         acc[cur.gid].total_current = {
        //             num_paletes_line: getFloat(acc[cur.gid]?.current_num_paletes),
        //             num_paletes_stock: getFloat(acc[cur.gid]?.stock?.current_num_paletes),
        //             num_bobines_line: getFloat(acc[cur.gid]?.current_num_bobines),
        //             num_bobines_stock: getFloat(acc[cur.gid]?.stock?.current_num_bobines)
        //         }
        //         acc[cur.gid].total_current["num_paletes"] = acc[cur.gid].total_current["num_paletes_line"] + acc[cur.gid].total_current["num_paletes_stock"];
        //         acc[cur.gid].total_current["num_paletes_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_paletes) / (acc[cur.gid].total_planned.num_paletes), 0);
        //         acc[cur.gid].total_current["num_bobines"] = acc[cur.gid].total_current["num_bobines_line"] + acc[cur.gid].total_current["num_bobines_stock"];
        //         acc[cur.gid].total_current["num_bobines_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_bobines) / (acc[cur.gid].total_planned.num_bobines), 0);

        //         return acc;
        //     }, {}));
        //     console.log(_dj)
        //     setOfs([...new Set(_dj.map(obj => obj.of_cod))]);
        //     dataAPI.setData({ rows: _dj, total: _dj.length });





        //     // setOfsData(_dj);
        //     // const _djd = parameters?.data?.rows.filter((obj, index, self) =>
        //     //     index === self.findIndex((t) => (
        //     //         t.of_cod === obj.of_cod
        //     //     ))
        //     // );
        //     // setOfs(_djd);
        // }
        //submitting.end();
    }

    const onFilterFinish = (type, values) => { }
    const onFilterChange = (changedValues, values) => { };
    const rowClassName = ({ data }) => {
        if (data.arranque == null){
            return tableCls.error;
        }
        if (data.n_lote == null){
            return tableCls.error;
        }
        // if (data?.nbobines_real != data?.num_bobines) {
        //     return tableCls.warning;
        // }
    }

    return (<>
        <Table
            {...true && { style: { fontSize: "10px", minHeight: "446px" } }}
            {...true && { rowHeight: 35 }}
            //rowHeight={null}
            headerHeight={25}
            cellNavigation={false}
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
    </>);
}