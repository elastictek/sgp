import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { DatePicker, Input, InputNumber, Select } from 'antd';
import { dayjsValue } from 'utils/index';
import { SearchOutlined } from '@ant-design/icons';
import { getCellFocus, useModalApi } from './TableV4';
import { useDataAPI } from 'utils/useDataAPIV4';
import { API_URL,DATETIME_FORMAT } from 'config';
import { Value } from './TableColumnsV4';
import TableGridSelect from './TableGridSelect';



// const DateField = React.forwardRef((props, ref) => (
//   <DatePicker
//     {...props}
//   />
// ));

// const DateEditor = memo(({ value, onValueChange }) => {
//   const refInput = useRef(null);

//   useEffect(() => {
//     // focus on the input
//     /* if (refInput.current) {
//       refInput.current.focus();
//     } */

//     onValueChange(value);
//   }, []);

//   // Gets called once before editing starts, to give editor a chance to
//   // cancel the editing before it even starts.
//   // const isCancelBeforeStart = useCallback(() => {
//   //   return false;
//   // }, []);

//   // Gets called once when editing is finished (eg if Enter is pressed).
//   // If you return true, then the result of the edit will be ignored.
//   const isCancelAfterEnd = useCallback(() => {
//     // our editor will reject any value greater than 1000
//     //return value / 2 > 1000;
//     return false;
//   }, [value]);

//   /* Pass Component Editor Lifecycle callbacks to the grid */
//   useGridCellEditor({
//     // isCancelBeforeStart,
//     isCancelAfterEnd,
//   });

//   return (
//     <DateField ref={refInput}
//       autoFocus
//       value={value}
//       onChange={(value, str) => {
//         console.log("aaaa", value, str)
//         onValueChange(value)
//       }
//       } />
//   );
// });


// export const ClientesTableEditor = ({ ...props }) => {

//     return (<FieldSelectorEditor
//         {...props}
//         selectorProps={{
//             title: "Clientes",
//             value: { BPCNUM_0: props?.cellProps?.data?.cliente_cod, BPCNAM_0: props?.cellProps?.data?.cliente_nome },
//             params: { payload: { url: `${API_URL}/artigos/sql/`, parameters: { method: "ClientesLookup" }, pagination: { enabled: true, pageSize: 15 }, filter: {}, sort: [] } },
//             keyField: ["BPCNUM_0"],
//             textField: "BPCNAM_0",
//             /* detailText: r => r?.BPCNUM_0, */
//             columns: [
//                 { key: 'BPCNUM_0', name: 'Cód', width: 160 },
//                 { key: 'BPCNAM_0', name: 'Nome' }
//             ],
//             filters: { fmulti_customer: { type: "any", width: 150, text: "Cliente", autoFocus: true } },
//             moreFilters: {}
//         }}
//     />)
// }

// export const ArtigosTableEditor = ({ ...props }) => {

//     return (<FieldSelectorEditor
//         {...props}
//         selectorProps={{
//             value: { artigo_id: props?.cellProps?.data?.artigo_id, des: props?.cellProps?.data?.des, cod: props?.cellProps?.data?.cod },
//             title: "Artigo",
//             params: { payload: { url: `${API_URL}/artigos/sql/`, parameters: { method: "ArtigosLookup" }, pagination: { enabled: true }, filter: {}, sort: [] } },
//             keyField: ["id"],
//             textField: "des",
//             // detailText={r => r?.cod}
//             columns: [
//                 { key: 'cod', name: 'Cód', width: 160 },
//                 { key: 'des', name: 'Nome' }
//             ],
//             filters: { fartigo: { type: "any", width: 150, text: "Artigo", autoFocus: true } },
//             moreFilters: {}
//         }}
//     />)
// }

export const AntdInputEditor = forwardRef((props, ref) => {
    const { onValueChange } = props;
    const { ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};
    const value = useMemo(() => {
        return props.value;
    }, [props.value]);

    const handleChange = (e) => {
        onValueChange(e.target.value);
    };
    // Expose the Input value to ag-Grid
    useImperativeHandle(ref, () => ({
        getValue() {
            return value;
        },
    }));
    return <Input autoFocus value={value} onChange={handleChange} {...editorParams} />;
});
export const AntdDateEditor = forwardRef((props, ref) => {
    const { onValueChange } = props;
    const { format = DATETIME_FORMAT } = props.column.getDefinition()?.cellRendererParams || {};
    const { ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};

    const value = useMemo(() => {
        return dayjsValue(props.value);
    }, [props.value]);

    const handleChange = (v, s) => {
        let _v = dayjsValue(v, null);
        if (_v) {
            _v = _v.format(format);
        }

        onValueChange(_v);
    };
    useImperativeHandle(ref, () => ({
        getValue() {
            return value;
        },
    }));
    return <DatePicker style={{ width: "100%" }} autoFocus value={value} onChange={handleChange} {...editorParams} />;
});
export const AntdSelectEditor = forwardRef((props, ref) => {
    const { onValueChange } = props;
    const { options, ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};

    const value = useMemo(() => {
        return `${props.value}`;
    }, [props.value]);

    const handleChange = (v) => {
        onValueChange(v);
    };
    // Expose the Input value to ag-Grid
    useImperativeHandle(ref, () => ({
        getValue() {
            return value;
        },
    }));
    return <Select style={{ width: "100%" }} autoFocus popupMatchSelectWidth={false} value={value} onChange={handleChange} options={options} {...editorParams} />;
});
export const AntdInputNumberEditor = forwardRef((props, ref) => {
    const { onValueChange } = props;
    const { ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};
    const value = useMemo(() => {
        return props.value;
    }, [props.value]);

    const handleChange = (v) => {
        onValueChange(v);
    };
    // Expose the Input value to ag-Grid
    useImperativeHandle(ref, () => ({
        getValue() {
            return value;
        },
    }));
    return <InputNumber autoFocus value={value} onChange={handleChange} {...editorParams} />;
});

const Lookup = ({ dataAPI, columnDefs, filters, onSelectionChanged, style, closeSelf }) => {
    return (<>
        <TableGridSelect
            style={style}
            ignoreRowSelectionOnCells={[]}
            columnDefs={columnDefs}
            filters={filters}
            dataAPI={dataAPI}
            onSelectionChanged={(row) => onSelectionChanged(row, closeSelf)}
        />
    </>);
}

export const ArtigosLookupEditor = forwardRef((props, ref) => {
    const modalApi = useModalApi();
    const { onValueChange, api } = props;
    const { options, title = "Artigos", baseFilters = {}, keyField = "cod", textField = "des", ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};
    const dataAPI = useDataAPI({
        payload: {
            url: `${API_URL}/artigos/sql/`, primaryKey: "id", parameters: { method: "ArtigosLookup" },
            pagination: { enabled: true, page: 1, pageSize: 20 }, baseFilter: {},
            sortMap: {}
        }
    });

    const value = useMemo(() => {
        if (props.value === undefined || props.value === null || props.value === "") {
            return null;
        }
        if (typeof props.value === 'object') {
            return props.value?.[keyField];
        }
        return `${props.value}`;
    }, [props.value]);

    // Expose the Input value to ag-Grid
    useImperativeHandle(ref, () => ({
        getValue() {
            return value;
        },
    }));

    const columnDefs = useMemo(() => [
        { field: 'cod', headerName: 'Artigo Cód.', width: 130, cellRenderer: (params) => <Value bold params={params} /> },
        { field: 'des', headerName: 'Artigo', flex: 1, cellRenderer: (params) => <Value params={params} /> },
    ], []);
    const filters = useMemo(() => ({
        toolbar: ["@columns"],
        more: [],
        no: [...Object.keys(baseFilters)]
    }), []);

    const onSelectionChanged = (row, closeSelf) => {
        onValueChange(row[0]);
        closeSelf();
    }
    const onPopup = () => {
        modalApi.setModalParameters({
            content: <Lookup style={{ height: "420px" }} dataAPI={dataAPI} columnDefs={columnDefs} filters={filters} onSelectionChanged={onSelectionChanged} />,
            closable: true,
            title: title,
            lazy: false,
            type: "modal",
            width: "700px",
            height: "500px",
            parameters: { ...getCellFocus(api) }
        });
        modalApi.showModal();
    }

    return <Input value={value} style={{ cursor: "pointer", width: "100%" }} onClick={onPopup} /* onKeyDown={_onKeyDown} */ readOnly suffix={<SearchOutlined onClick={onPopup} style={{ cursor: "pointer" }} />} />;
});

export const ClientesLookupEditor = forwardRef((props, ref) => {
    const modalApi = useModalApi();
    const { onValueChange, api } = props;
    const { options, title = "Clientes", baseFilters = {}, keyField = "BPCNUM_0", textField = "BPCNAM_0", ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};
    const dataAPI = useDataAPI({
        payload: {
            url: `${API_URL}/artigos/sql/`, primaryKey: "BPCNUM_0", parameters: { method: "ClientesLookup" },
            pagination: { enabled: true, page: 1, pageSize: 20 }, baseFilter: {},
            sortMap: {}
        }
    });

    const value = useMemo(() => {
        if (props.value === undefined || props.value === null || props.value === "") {
            return null;
        }
        if (typeof props.value === 'object') {
            return props.value?.[keyField];
        }
        return `${props.value}`;
    }, [props.value]);

    // Expose the Input value to ag-Grid
    useImperativeHandle(ref, () => ({
        getValue() {
            return value;
        },
    }));

    const columnDefs = useMemo(() => [
        { colId: '"BPCNUM_0"', field: 'BPCNUM_0', headerName: 'Cliente Cód.', width: 130, cellRenderer: (params) => <Value bold params={params} /> },
        { colId: '"BPCNAM_0"', field: 'BPCNAM_0', headerName: 'Cliente', flex: 1, cellRenderer: (params) => <Value params={params} /> },
    ], []);
    const filters = useMemo(() => ({
        toolbar: ["@columns"],
        more: [],
        no: [...Object.keys(baseFilters)]
    }), []);

    const onSelectionChanged = (row, closeSelf) => {
        onValueChange(row[0]);
        closeSelf();
    }
    const onPopup = () => {
        modalApi.setModalParameters({
            content: <Lookup style={{ height: "420px" }} dataAPI={dataAPI} columnDefs={columnDefs} filters={filters} onSelectionChanged={onSelectionChanged} />,
            closable: true,
            title: title,
            lazy: false,
            type: "modal",
            width: "700px",
            height: "500px",
            parameters: { ...getCellFocus(api) }
        });
        modalApi.showModal();
    }

    return <Input value={value} style={{ cursor: "pointer", width: "100%" }} onClick={onPopup} /* onKeyDown={_onKeyDown} */ readOnly suffix={<SearchOutlined onClick={onPopup} style={{ cursor: "pointer" }} />} />;
});

