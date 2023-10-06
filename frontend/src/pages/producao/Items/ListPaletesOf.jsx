import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form } from "antd";
import { AppContext, MediaContext } from "app";
import ResponsiveModal from 'components/Modal';
import { Bool, Link, RightAlign } from 'components/TableColumns';
import Table, { useTableStyles } from 'components/TableV3';
import { useModal } from "react-modal-hook";
import { useLocation, useNavigate } from "react-router-dom";
import { getFloat, useSubmitting } from "utils";
import { useDataAPI } from "utils/useDataAPIV3";
import { usePermission } from "utils/usePermission";
import { createUseStyles } from 'react-jss';

import Palete from '../../paletes/Palete';

const useStyles = createUseStyles({

    link: {
        color: '#fff',
        '&:hover': {
            color: '#003eb3',
        },
    }
});

export default ({ hash, data, filter, mini = false, ...props }) => {
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
    const dataAPI = useDataAPI({ id: props.id, payload: { url: ``, primaryKey: "palete_id", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });
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
        ...(true) ? [{ name: 'nome', header: 'Palete', userSelect: true, defaultLocked: false, defaultWidth: 110, flex: 1, headerAlign: "center", render: ({ cellProps, data }) => <Link  {...data?.nok_estados > 0 && { className: classes.link }} cellProps={cellProps} value={data?.nome} onClick={() => onClickPalete("all", data)} /> }] : [],
        ...(true) ? [{ name: 'ofid', header: 'Ordem', userSelect: true, defaultLocked: false, defaultWidth: 115, headerAlign: "center", render: ({ cellProps, data }) => data?.ofid }] : [],
        ...(true) ? [{ name: 'current_stock', header: 'Stock', userSelect: true, defaultLocked: false, defaultWidth: 53, headerAlign: "center", render: ({ cellProps, data }) => <Bool cellProps={cellProps} value={data?.current_stock} /> }] : [],
        ...(true) ? [{ name: 'comp_real', header: 'Comp.', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m">{getFloat(data?.comp_real, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'area_real', header: 'Área.', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m2">{getFloat(data?.area_real, 2)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'num_bobines', header: 'Total', group: "bobines", userSelect: true, defaultLocked: false, defaultWidth: 50, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps}>{getFloat(data?.num_bobines, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'nbobines_real', header: 'Atual', group: "bobines", userSelect: true, defaultLocked: false, defaultWidth: 50, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps}>{getFloat(data?.nbobines_real, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'nbobines_emendas', header: 'Emendas', group: "bobines", userSelect: true, defaultLocked: false, defaultWidth: 72, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps}>{getFloat(data?.nbobines_emendas, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'largura_bobines', header: "Largura", userSelect: true, defaultLocked: false, defaultWidth: 60, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="mm">{getFloat(data?.largura_bobines, 0)}</RightAlign> }] : [],
        // ...(true) ? [{ name: 'matprima_des', header: 'Artigo', userSelect: true, defaultLocked: false, minWidth: 170, flex: 1, headerAlign: "center", render: ({ cellProps, data }) => <div style={{ fontWeight: 700 }}>{data?.matprima_des}</div> }] : [],
        // ...(true) ? [{ name: 'densidade', header: 'Densidade', userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", render: (p) => <RightAlign>{p.data?.densidade}</RightAlign> }] : [],
        // ...(true) ? [{ name: 'arranque', header: 'Arranque', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", render: (p) => <RightAlign unit="%">{p.data?.arranque}</RightAlign> }] : [],
        // ...(true) ? [{ name: 'tolerancia', header: 'Tolerância', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", render: (p) => <RightAlign unit="%">{p.data?.tolerancia}</RightAlign> }] : [],
        // ...(true) ? [{ name: 'vglobal', header: 'Global', group: "extrusora", userSelect: true, defaultLocked: false, width: 150, headerAlign: "center", render: (p) => <RightAlign unit="%">{p.data?.vglobal}</RightAlign> }] : []
    ];


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [hash?.hash_estadoproducao, filter]);

    const loadData = async ({ signal, init = false } = {}) => {
        //submitting.trigger();
        const _d = data?.paletes.filter(v => filter.includes(v.ofid) && v.palete_id);
        dataAPI.setData({ rows: _d, total: _d.length });
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
        if (data?.nok_estados > 0) {
            return tableCls.error;
        }
        if (data?.nok > 0) {
            return tableCls.warning;
        }
    }

    return (<>
        <Table
            {...mini && { style: { fontSize: "10px", minHeight: "192px" } }}
            {...mini && { rowHeight: 25 }}
            //rowHeight={null}
            headerHeight={25}
            cellNavigation={false}
            //enableSelection={false}
            //showActiveRowIndicator={true}
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