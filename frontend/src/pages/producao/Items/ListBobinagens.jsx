import React, { useContext, useEffect, useRef, useState } from 'react';
import { Collapse, Form, Input, Typography } from "antd";
import { API_URL } from "config";
import { useLocation, useNavigate } from "react-router-dom";
import { getFloat, useSubmitting } from "utils";
import { useDataAPI } from "utils/useDataAPIV3";
const { Panel } = Collapse;
const { TextArea } = Input;
const { Title } = Typography;
import { createUseStyles } from 'react-jss';
import { AppContext, MediaContext } from "app";
import ResponsiveModal from 'components/Modal';
import { Link, RightAlign } from 'components/TableColumns';
import Table, { useTableStyles } from 'components/TableV3';
import { useModal } from "react-modal-hook";
import { usePermission } from "utils/usePermission";
const FormBobinagemValidar = React.lazy(() => import('../../bobinagens/FormValidar'));
const Bobinagem = React.lazy(() => import('../../bobinagens/Bobinagem'));

const useStyles = createUseStyles({

    link: {
        color: '#fff',
        '&:hover': {
            color: '#003eb3',
        },
    }
});


export default ({ hash, ...props }) => {
    const media = useContext(MediaContext);
    const permission = usePermission({ name: "widget", item: "estadoProducao" });//Permissões Iniciais
    const inputParameters = useRef({});
    const { openNotification } = useContext(AppContext);
    const [formDirty, setFormDirty] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const tableCls = useTableStyles();
    const [formFilter] = Form.useForm();
    const defaultFilters = {};
    const defaultParameters = { method: "BobinagensList" };
    const defaultSort = [{ column: "id", direction: "DESC" }];
    const dataAPI = useDataAPI({ id: props.id, payload: { url: `${API_URL}/bobinagens/sql/`, primaryKey: "rowid", parameters: defaultParameters, pagination: { enabled: false, limit: 10 }, filter: defaultFilters, sort: [...defaultSort] } });
    const submitting = useSubmitting(false);

    const [lastTab, setLastTab] = useState('1');
    const [lastBobinagemTab, setLastBobinagemTab] = useState('1');

    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {

        const content = () => {
            switch (modalParameters.content) {
                case "validar": return <FormBobinagemValidar /* tab={modalParameters.tab} setTab={modalParameters.setLastTab} */ loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
                case "bobinagem": return <Bobinagem /* tab={modalParameters.tab} setTab={modalParameters.setLastTab} */ loadParentData={modalParameters.loadData} parameters={modalParameters.parameters} />;
            }
        }

        return (
            <ResponsiveModal lazy={modalParameters?.lazy} title={modalParameters?.title} type={modalParameters?.type} push={modalParameters?.push} onCancel={hideModal} width={modalParameters.width} height={modalParameters.height} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);
    const onClickBobinagem = (row) => {
        if (row?.valid == 0) {
            setModalParameters({ content: "validar", /* tab: lastTab, setLastTab, */lazy: true, type: "drawer", push: false, width: "90%", title: "Validar Bobinagem", /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: loadData, parameters: { bobinagem: row, bobinagem_id: row.id, bobinagem_nome: row.nome } });
            showModal();
        } else {
            setModalParameters({ content: "bobinagem", tab: lastBobinagemTab, setLastTab: setLastBobinagemTab, lazy: true, type: "drawer", push: false, width: "90%", /* title: "Bobinagem", */ /* title: <div style={{ fontWeight: 900 }}>{title}</div>, */ loadData: loadData, parameters: { bobinagem: row, bobinagem_id: row.id, bobinagem_nome: row.nome } });
            showModal();
        }
    }

    const columnClass = ({ value, rowActive, rowIndex, data, name }) => {
        // if (data?.group) {
        //     return tableCls.right;
        // }
    };

    const onBobinesExpand = () => { }


    const groups = [{ name: 'bobines', header: 'Bobines', headerAlign: "center" }];

    const columns = [
        ...(true) ? [{ name: 'nome', header: 'Nome', userSelect: true, defaultLocked: false, defaultWidth: 110, flex: 1, headerAlign: "center", render: ({ cellProps, data }) => <Link cellProps={cellProps} value={data?.nome} onClick={() => onClickBobinagem(data)} /> }] : [],
        ...(true) ? [{ name: 'inico', header: 'Início', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => data?.inico }] : [],
        ...(true) ? [{ name: 'fim', header: 'Fim', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => data?.fim }] : [],
        ...(true) ? [{ name: 'duracao', header: 'Duração', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => data?.duracao }] : [],
        ...(true) ? [{ name: 'comp', header: 'Comp.', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m">{getFloat(data?.comp, 0)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'area', header: 'Área.', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="m2">{getFloat(data?.area, 2)}</RightAlign> }] : [],
        ...(true) ? [{ name: 'diam', header: 'Diam.', userSelect: true, defaultLocked: false, defaultWidth: 70, headerAlign: "center", render: ({ cellProps, data }) => <RightAlign cellProps={cellProps} unit="mm">{getFloat(data?.diam, 2)}</RightAlign> }] : []
    ];


    useEffect(() => {
        const controller = new AbortController();
        const interval = loadData({ init: true, signal: controller.signal });
        return (() => { controller.abort(); (interval) && clearInterval(interval); });
    }, [hash?.hash_estadoproducao]);

    const loadData = async ({ signal, init = false } = {}) => {
        console.log("LIST BOBINAGENS UPDATED")
        //submitting.trigger();
        setFormDirty(false);
        dataAPI.setAction("init", true);
        dataAPI.update(true);
        /* if (init) {
            const { tstamp, ...paramsIn } = loadInit({}, {}, props?.parameters, { ...location?.state }, null);
            inputParameters.current = paramsIn;
        }*/

        /*let { filterValues, fieldValues } = fixRangeDates([], inputParameters.current);
        formFilter.setFieldsValue({ ...fieldValues });
        dataAPI.addFilters({ ...filterValues }, true);
        dataAPI.setSort(dataAPI.getSort(), defaultSort);
        dataAPI.addParameters({ ...defaultParameters }, true); */
        //submitting.end();
    }

    const onFilterFinish = (type, values) => { }
    const onFilterChange = (changedValues, values) => { };
    const rowClassName = ({ data }) => {
        if (data?.valid == 0) {
            return tableCls.warning;
        }
    }

    return (<>
        <Table
            {...true && { style: { fontSize: "10px", minHeight: "150px" } }}
            {...true && { rowHeight: 25 }}
            //rowHeight={null}
            dirty={formDirty}
            loadOnInit={false}
            headerHeight={25}
            cellNavigation={false}
            //enableSelection={false}
            //showActiveRowIndicator={false}
            // loading={submitting.state}
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
    </>);
}