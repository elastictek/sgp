import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { useDataAPI } from "utils/useDataAPIV3";
import Table from 'components/TableV3';
import YScroll from 'components/YScroll';


export default ({ record, closeSelf }) => {
    const [visible, setVisible] = useState({ drawer: { open: false } });
    const dataAPI = useDataAPI({ payload: { parameters: {}, primaryKey: "id", pagination: { enabled: false, limit: 30 }, filter: {}, sort: [] } });
    const columns = [
        { name: 'versao', header: 'Versão', defaultWidth: 50 },
        { name: 'designacao', header: 'Designação', defaultWidth: 180 },
        { name: 'largura_ordem', flex: 1, header: 'Posicionamento', render: ({ data, cellProps }) => <div style={{ color: "#1890ff", fontWeight: 600 }}>{data.largura_ordem.replaceAll('"', ' ')}</div> }
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
        record.onSelect(row?.data);
        closeSelf();
    }

    return (<YScroll>

        <Table
            idProperty={dataAPI.getPrimaryKey()}
            local={true}
            cellNavigation={false}
            onSelectionChange={onSelect}
            enableSelection={true}
            rowSelect={true}
            sortable={false}
            settings={false}
            reorderColumns={false}
            showColumnMenuTool={false}
            loadOnInit={false}
            defaultLimit={30}
            columns={columns}
            dataAPI={dataAPI}
            moreFilters={false}
        />
    </YScroll>);
}