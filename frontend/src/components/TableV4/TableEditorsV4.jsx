import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { AutoComplete, Checkbox, DatePicker, Input, InputNumber, Select, Form, Space, Button, Tooltip, Switch, Modal } from 'antd';
import { uid } from 'uid';
import { dayjsValue, getValue, isNullOrEmpty, useSubmitting, updateArrayWhere, deleteArrayElementWhere, maxOf } from 'utils';
import { CheckSquareOutlined, DeleteFilled, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { columnPath, getAllNodes, getCellFocus, getNodes, getSelectedNodes } from './TableV4';
import { useDataAPI, _fieldZodDescription, parseFilter } from 'utils/useDataAPIV4';
import { API_URL, DATETIME_FORMAT, BOBINE_ESTADOS } from 'config';
import { Action, Bool, EstadoBobine, MultiLine, PRIORIDADES_DESTINOS, Options, Value, useDestinosStyles } from './TableColumnsV4';
import TableGridSelect from './TableGridSelect';
import { fetchPostV4 } from 'utils/fetch';
import { sortBy, prop, is, isEmpty, isNil, isNotNil } from 'ramda';
import { valueByPath, json } from 'utils/object';
import YScroll from 'components/YScroll';
import Portal from "components/portal";
import IconButton from "components/iconButton";
import { Container as FormContainer, Field, Label, ClientesLookupField, Lookup, ButtonChooser, SelectorPopup, EstadoBobineLookup } from 'components/FormFields/FormsV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { CgCloseO } from 'react-icons/cg';
import { zGroupIntervalNumber, zGroupRangeNumber } from 'utils/schemaZodRules';
import { z } from "zod";
import TextArea from 'antd/es/input/TextArea';
import useModalApi from "utils/useModalApi";
import { rules, validate, validateList, validateRows } from 'utils/useValidation';
import TableGridEdit from './TableGridEdit';
import useModeApi from 'utils/useModeApi';
import { createUseStyles } from 'react-jss';
import TableGridView from './TableGridView';
import { noValue, minOf, unique, uniqueValues } from 'utils';
const gutterWidth = 5;


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

export const AntdAutoCompleteEditor = forwardRef((props, ref) => {
    const { onValueChange } = props;
    const { map } = props.column.getDefinition()?.cellRendererParams || {};
    const { options: opt, remote, ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};
    const _options = opt ? opt : map ? Object.entries(map).map(([value, { label }]) => ({ value: value, label })) : [];
    const [options, setOptions] = useState([]);

    const value = useMemo(() => {
        if (isNil(props.value)) {
            return null;
        }
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

    const handleSearch = async (value) => {
        if (remote && remote?.fetch) {
            try {
                const _col = (remote?.column) ? remote.column : columnPath(props.column);
                const { data: { rows } } = await remote.fetch(value);
                setOptions(rows.map(item => ({ value: item?.[_col], label: item?.[_col] })));
            } catch (e) {
                console.log(e)
            }
        } else if (Array.isArray(_options)) {
            setOptions(_options.filter(v => v.value.toLowerCase().includes(value.toLowerCase())));
        }
    };
    return <AutoComplete showSearch allowClear style={{ width: "100%" }} autoFocus popupMatchSelectWidth={false} value={value} onChange={handleChange} onSearch={handleSearch} options={options} {...editorParams} />;
});
export const AntdSelectEditor = forwardRef((props, ref) => {
    const { onValueChange } = props;
    const { map } = props.column.getDefinition()?.cellRendererParams || {};
    const { options, ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};
    const _options = options ? options : map ? Object.entries(map).map(([value, { label }]) => ({ value: value, label })) : [];

    const value = useMemo(() => {
        return props?.value;
    }, [props?.value]);

    const handleChange = (v) => {
        onValueChange(v);
    };
    // Expose the Input value to ag-Grid
    useImperativeHandle(ref, () => ({
        getValue() {
            return value;
        },
    }));
    return <Select style={{ width: "100%" }} autoFocus popupMatchSelectWidth={false} value={value} onChange={handleChange} options={_options} {...editorParams} />;
});
export const AntdMultiSelectEditor = forwardRef((props, ref) => {
    const { onValueChange } = props;
    const { map } = props.column.getDefinition()?.cellRendererParams || {};
    const { options, ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};
    const _options = options ? options : map ? Object.entries(map).map(([value, { label }]) => ({ value: value, label })) : [];

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
    return <Select mode="multiple" style={{ width: "100%" }} autoFocus popupMatchSelectWidth={false} value={value} onChange={handleChange} options={_options} {...editorParams} />;
});
export const AntdCheckboxEditor = forwardRef((props, ref) => {
    const { onValueChange } = props;
    const { checkedValues = [1, "1", true], unCheckedValues = [0, "0", false], checkedValue = null, unCheckedValue = null, ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};

    const value = useMemo(() => {
        return checkedValues.includes(props?.value) ? true : false;
    }, [props.value]);

    const handleChange = (e) => {
        if (e.target.checked === true) {
            if (checkedValue != null) {
                onValueChange(checkedValue);
            } else {
                onValueChange(checkedValues[0]);
            }
        }
        if (e.target.checked === false) {
            if (unCheckedValue != null) {
                onValueChange(unCheckedValue);
            } else {
                onValueChange(unCheckedValues[0]);
            }
        }

    };
    // Expose the Input value to ag-Grid
    useImperativeHandle(ref, () => ({
        getValue() {
            return value;
        },
    }));
    return <div style={{ width: "100%", textAlign: "left", paddingLeft: "10px", backgroundColor: "#ffffff" }}><Checkbox checked={value} autoFocus onChange={handleChange} {...editorParams} /></div>;
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
    return <InputNumber style={{ width: "100%" }} autoFocus value={value} onChange={handleChange} {...editorParams} />;
});
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
            pagination: { enabled: true, page: 1, pageSize: 20 }, baseFilter: { ...parseFilter("sgp_id", `!isnull`, { type: "number" }) },
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

const schemaMultiRange = ({ ctx }) => z.object({
    min: z.any(),
    max: z.any(),
    type: z.coerce.string()
}).refine(v => {
    const r = rules();
    r(v, "min").number().required().between(0, ctx.maxValue);
    r(v, "max").number().required().between(v.min, ctx.maxValue);
    if (!r().valid()) {
        throw new z.ZodError(r().errors());
    }
    return true;
}, {});
const FormRangeDefeitosEditor = ({ value, field, data, unit, wndRef, closeSelf, forInput, onValueChange, gridApi }) => {
    const submitting = useSubmitting(true);
    const minValue = 0;
    const maxValue = unit == "m" ? data.comp_actual : data.diam;
    const _ff = ["ff_pos"].includes(field) ? true : false
    const _furos = ["furos_pos"].includes(field) ? true : false
    const [isDirty, setIsDirty] = useState(false);
    const [validation, setValidation] = useState({});
    const removed = useRef(false);
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({ items: [...value ? value : []].reverse() });
        submitting.end();
    }, []);

    const onValuesChange = async (cv, av) => {
        if (removed.current) {
            removed.current = false;
            setIsDirty(true);
            return;
        }
        const index = cv.items.length - 1;
        const r = await validate(form.getFieldValue(["items", index]), schemaMultiRange({ ctx: { maxValue } }), { passthrough: false });
        r.onValidationFail((p) => {
            setValidation(prev => ({ ...prev, [index]: p.alerts.error }));
        });
        r.onValidationSuccess((p) => {
            setValidation(prev => ({ ...prev, [index]: null }));
        });
        setIsDirty(true);
    }
    const onSave = async () => {
        const values = form.getFieldValue("items");
        const r = await validateList(values, schemaMultiRange({ ctx: { maxValue } }), { passthrough: false });
        r.onValidationFail((p) => {
            setValidation(prev => ({ ...prev, ...p.alerts.error }));
        });
        r.onValidationSuccess((p) => {
            setValidation(prev => ({ ...prev, ...p.alerts.error }));
            onValueChange(values);
            gridApi.stopEditing();
            closeSelf();
        });
    }

    return (<>
        <FormContainer fluid form={form} forInput={forInput} wrapForm={true} wrapFormItem={true} style={{}} onValuesChange={onValuesChange} validation={validation}>
            <Row style={{}} gutterWidth={gutterWidth}>
                <Col>
                    <Form.List name="items">
                        {(fields, { add, remove, move }) => {
                            const addRow = (fields) => {
                                if (fields.length === 0 && _furos) {
                                    add({ [`min`]: 0, [`max`]: maxValue, "unit": unit });
                                } else {
                                    add({ [`min`]: null, [`max`]: null, "unit": unit, ...(_ff && { "type": "Desbobinagem" }) });
                                }
                            }
                            const removeRow = (fieldName, field) => {
                                removed.current = true;
                                remove(fieldName);
                            }
                            return (
                                <>
                                    <div style={{ height: "300px" }}>
                                        <YScroll>
                                            {fields.map((field, index) => (
                                                <Row key={field.key} gutterWidth={gutterWidth}>
                                                    <Col width={20} style={{ alignSelf: "center", fontWeight: 700 }}>{index + 1}</Col>
                                                    <Field name={[field.name, `min`]}><InputNumber autoFocus style={{ width: "110px", textAlign: "right" }} controls={false} addonAfter={<b>{unit}</b>} min={minValue} max={maxValue} /></Field>
                                                    <Field name={[field.name, `max`]}><InputNumber style={{ width: "110px", textAlign: "right" }} controls={false} addonAfter={<b>{unit}</b>} min={minValue} max={maxValue} /></Field>
                                                    {_ff && <Col xs="content"><Field name={[field.name, `type`]}><Select style={{ width: "150px", textAlign: "right" }} options={[{ value: "Bobinagem" }, { value: "Desbobinagem" }]} /></Field></Col>}
                                                    <Col xs={2} style={{ alignSelf: "center", paddingLeft: "10px" }} >{forInput && <div><IconButton onClick={() => removeRow(field.name, field)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton></div>}</Col>
                                                </Row>
                                            ))}
                                        </YScroll>
                                    </div>
                                    {forInput && <Row style={{ marginTop: "5px" }}><Col><Button disabled={!forInput} type="default" onClick={() => addRow(fields)} style={{ width: "100%" }}><PlusOutlined />Adicionar</Button></Col></Row>}
                                </>
                            )
                        }
                        }
                    </Form.List>
                </Col>
            </Row>
        </FormContainer>
        {wndRef && <Portal elId={wndRef.current}>
            <Space>
                <Button disabled={submitting.state} onClick={closeSelf}>Fechar</Button>
                {isDirty && <Button type="primary" disabled={submitting.state} onClick={onSave}>Guardar</Button>}
            </Space>
        </Portal>}
    </>);
}
export const RangeDefeitosEditor = forwardRef((props, ref) => {
    const initialized = useRef(false);
    const modalApi = useModalApi();
    const { onValueChange, api } = props;
    const { ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};
    const { unit, title } = props.column.getDefinition()?.cellRendererParams || {};
    const _field = columnPath(props.column);

    useEffect(() => {
        initialized.current = true;
        onPopup();
    }, []);

    const onPopup = () => {
        modalApi.setModalParameters({
            content: <FormRangeDefeitosEditor forInput unit={unit} field={_field} value={valueByPath(props.data, _field)} data={props.data} onValueChange={onValueChange} gridApi={api} />,
            closable: true,
            title: title ? title : props.column.getDefinition().headerName,
            lazy: false,
            type: "modal",
            width: "700px",
            height: "350px",
            parameters: { ...getCellFocus(api) }
        });
        modalApi.showModal();
    }

    return <div style={{ cursor: "pointer", width: "100%", height: "100%", backgroundColor: "#fff" }} onClick={() => initialized.current && onPopup()} /* onKeyDown={_onKeyDown} */></div>;
});

const schemaDestinos = ({ ctx }) => z.object({
    prioridade: z.any()
}).refine(v => {
    const r = rules();
    r(v, "prioridade").number().required();
    if (!r().valid()) {
        throw new z.ZodError(r().errors());
    }
    return true;
}, {});

const GridPrioridades = ({ estado, regranular, dataAPI, prioridades, initValue, setIsDirty, modeApi, validation }) => {
    const classes = useDestinosStyles();
    const submitting = useSubmitting(true);
    const gridRef = useRef(); //not required
    const modalApi = useModalApi(); //not Required;
    const rowsRef = useRef();

    useEffect(() => {
        let _rows;
        if (isNil(rowsRef.current)) {
            _rows = !isNullOrEmpty(initValue) ? initValue : [];
            rowsRef.current = _rows;
            dataAPI.setRows(_rows);
        } else {
            submitting.trigger();
            _rows = prioridades.map(v => {
                return { id: v, value: null, ...rowsRef.current.find(x => v == x?.id) };
            });
        }
        rowsRef.current = _rows;
        dataAPI.setRows(_rows);
        submitting.end();
    }, [prioridades]);

    const onBeforeCellEditRequest = async (_data, colDef, path, newValue, event) => {
        /**
     * Método que permite antes do "commit", fazer pequenas alterações aos dados.
     * No caso dessas alterações afetarem os valores de outras colunas da "Grid", é necessário desablitar o TabOnNextCell da coluna,
     * pois o próximo campo entra em edição antes deste método (isto é um Workaround!!!!!), para isso na definição da coluna colocar:
     * suppressKeyboardEvent: (params)=>disableTabOnNextCell(params)
     */
        return null;
    }
    const onAfterCellEditRequest = async (_data, colDef, path, newValue, event, result) => {
        const _gRows = getAllNodes(event.api);
        rowsRef.current = _gRows;
        dataAPI.setRows(_gRows);
        setIsDirty(true);
    }
    const cellParams = useCallback((params = {}, editorParams = {}, headerParams = {}) => {
        return {
            cellRendererParams: { validation, modeApi, modalApi, ...params },
            cellEditorParams: { ...editorParams },
            headerComponentParams: { ...headerParams }
        };
    }, [validation]);
    const columnDefs = useMemo(() => {
        return {
            cols: [
                { field: 'id', headerName: 'Prioridade', ...cellParams(), width: 70, cellClass: params => { return !isNullOrEmpty(params.value) ? classes[params.value] : null }, cellRenderer: (params) => <Options map={PRIORIDADES_DESTINOS} params={params} /> },
                { field: 'value', wrapText: true, autoHeight: true, headerName: 'Obs.', ...cellParams(null, { maxLength: 1000, rows: 4 }), type: "editableColumn", cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true, width: 200, flex: 1 }
            ], timestamp: new Date()
        };
    }, [validation, dataAPI.getTimeStamp()]);

    return (
        <TableGridEdit
            local
            domLayout={'autoHeight'}
            style={{ height: "auto" }}
            gridRef={gridRef}
            singleClickEdit={true}
            onAfterCellEditRequest={onAfterCellEditRequest}
            onBeforeCellEditRequest={onBeforeCellEditRequest}
            showTopToolbar={false}
            columnDefs={columnDefs}
            filters={null}
            dataAPI={dataAPI}
            modeApi={modeApi}
        />
    );
}

const SELECT_PRIORIDADES_DESTINOS = Object.entries(PRIORIDADES_DESTINOS).map(([value, { label }]) => ({ value: value, label }));
export const FormDestinosEditor = ({ value, selectedNodes, field, data, wndRef, extraRef, closeSelf, forInput, onValueChange, gridApi }) => {
    const classes = useDestinosStyles();
    const submitting = useSubmitting(true);
    const gridRef = useRef(); //not required
    const modalApi = useModalApi(); //not Required;
    const modalApi2 = useModalApi(); //not Required;
    const modeApi = useModeApi(); //not Required;
    const dataAPI = useDataAPI({ payload: { primaryKey: "id", pagination: { enabled: false, limit: 500 } } });
    const dataAPIBobines = useDataAPI({ payload: { primaryKey: "id", pagination: { enabled: false, limit: 500 } } });
    const dataAPIPri = useDataAPI({ payload: { primaryKey: "id", pagination: { enabled: false, limit: 500 } } });
    const [isDirty, setIsDirty] = useState(false);
    const [validation, setValidation] = useState({});
    const previousEstado = useRef(false);
    const [form] = Form.useForm();
    const isLegacy = useMemo(() => !data?.destinos && data?.destino, []);
    const estado = Form.useWatch('estado', form);
    const regranular = Form.useWatch('regranular', form);

    useEffect(() => {
        const rows = !isNullOrEmpty(value?.destinos) ? value.destinos.map(v => ({ [dataAPI.getPrimaryKey()]: uid(6), prioridade: v?.prioridade ? v.prioridade : 1, cliente_cod: v.cliente.BPCNUM_0, cliente_des: v.cliente.BPCNAM_0, largura: v.largura, obs: v.obs })) : [];
        dataAPI.setRows(rows);
        let _minLargura = data?.lar;
        if (selectedNodes) {
            _minLargura = minOf(selectedNodes, "lar");
            dataAPIBobines.setRows(selectedNodes);
        }
        form.setFieldsValue({ ...value, largura: _minLargura, estado: noValue(value?.estado, { value: data.estado }), regranular: noValue(value?.regranular, 0), obs: data?.obs, prop_obs: data?.prop_obs, troca_etiqueta: data?.troca_etiqueta });
        submitting.end();
    }, []);

    const prioridades = useMemo(() => {
        return uniqueValues(dataAPI.getData().rows, ["prioridade"]).map(v => v.prioridade);
    }, [dataAPI.getTimeStamp()]);


    const onValuesChange = async (cv, av) => {
        setIsDirty(true);
    }

    const onEstadoChange = async (row) => {
        if (form.getFieldValue("regranular")) {
            form.setFieldsValue({ estado: { value: "R", label: "REJEITADO" } });
            dataAPI.setRows([]);
            setIsDirty(true);
        } else if (row?.value === "R") {
            Modal.confirm({
                content: "Ao alterar o estado para Rejeitado, as linhas de destino serão eliminadas! Deseja continuar?",
                onOk: () => {
                    form.setFieldValue("estado", row);
                    dataAPI.setRows([]);
                    setIsDirty(true);
                },
                onCancel: () => { }
            });
        } else {
            form.setFieldValue("estado", row);
            setIsDirty(true);
        }
        return false; //avoid exeute change to the form element!
    }

    const onRegranularChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.checked == true) {
            Modal.confirm({
                content: "Ao regranular, as linhas de destino serão eliminadas! Deseja continuar?",
                onOk: () => {
                    form.setFieldValue("regranular", 1);
                    form.setFieldsValue({ estado: { value: "R", label: "REJEITADO" } });
                    previousEstado.current = { value: "R", label: "REJEITADO" };
                    dataAPI.setRows([]);
                    setIsDirty(true);
                },
                onCancel: () => form.setFieldValue("regranular", 0)
            });
        } else {
            form.setFieldValue("regranular", 0);
            form.setFieldValue("estado", data?.estado);
            setIsDirty(true);
        }
    }

    const onSave = async () => {
        // const values = form.getFieldValue("items");
        let _destinos = getAllNodes(gridRef.current?.api);
        const _obs_prioridades = dataAPIPri.getData().rows;
        const rv = await validateRows(_destinos, schemaDestinos({}), dataAPI.getPrimaryKey(), { passthrough: false });
        rv.onValidationFail((p) => { setValidation(prev => ({ ...prev, ...p.alerts.error })); });
        return (await rv.onValidationSuccess(async (p) => {
            let _destinoTxt = "";
            let _destinos_has_obs = 0;
            _destinos = _destinos.map(v => {
                _destinos_has_obs = (_destinos_has_obs === 0 && !isNullOrEmpty(v?.obs)) ? 1 : _destinos_has_obs;
                _destinoTxt = `${_destinoTxt}${_destinoTxt && " // "}${v.cliente_des} ${v?.largura}`;
                return { prioridade: v?.prioridade, obs: v?.obs, largura: v?.largura, cliente: { BPCNUM_0: v?.cliente_cod, BPCNAM_0: v?.cliente_des } };
            });
            _destinos_has_obs = (_destinos_has_obs === 0 && _obs_prioridades?.some(v => !isNullOrEmpty(v?.value))) ? 1 : _destinos_has_obs;
            _destinoTxt = `${_destinoTxt} ${BOBINE_ESTADOS.find(v => v.value === estado.value).label} ${regranular == 1 ? "REGRANULAR" : ""}`.trim();
            const _values = { destino: _destinoTxt, destinos_has_obs: _destinos_has_obs, estado: estado.value, destinos: { estado, regranular, obs_prioridades: _obs_prioridades?.map(({ id, value }) => ({ id, value })), destinos: _destinos } };
            setValidation(prev => ({ ...prev, ...p.alerts.error }));
            onValueChange(_values);
            gridApi.stopEditing();
            closeSelf();
        }));
    }
    const onBeforeCellEditRequest = async (_data, colDef, path, newValue, event) => {
        /**
     * Método que permite antes do "commit", fazer pequenas alterações aos dados.
     * No caso dessas alterações afetarem os valores de outras colunas da "Grid", é necessário desablitar o TabOnNextCell da coluna,
     * pois o próximo campo entra em edição antes deste método (isto é um Workaround!!!!!), para isso na definição da coluna colocar:
     * suppressKeyboardEvent: (params)=>disableTabOnNextCell(params)
     */
        const field = columnPath(event.column);
        if (field === "obs") {
            return null;
        }
        const valid = _checkLargura(field === "prioridade" ? _data.largura : 0, form.getFieldValue("largura"), event.api, field === "prioridade" ? newValue : _data.prioridade).valid;
        if (!valid) {
            return false;
        }
        return null;
    }
    const onAfterCellEditRequest = async (_data, colDef, path, newValue, event, result) => {
        const _gRows = getAllNodes(event.api);
        dataAPI.setRows(sortBy(prop('prioridade'), _gRows));
        setIsDirty(true);
    }
    const cellParams = useCallback((params = {}, editorParams = {}, headerParams = {}) => {
        return {
            cellRendererParams: { validation, modeApi, modalApi, ...params },
            cellEditorParams: { ...editorParams },
            headerComponentParams: { ...headerParams }
        };
    }, [validation]);
    const columnDefs = useMemo(() => {
        return {
            cols: [
                { field: 'prioridade', headerName: 'Prioridade', ...cellParams(), width: 70, cellClass: params => { return !isNullOrEmpty(params.value) ? classes[params.value] : null }, type: "editableColumn", cellEditor: AntdSelectEditor, cellEditorParams: { options: SELECT_PRIORIDADES_DESTINOS }, cellRenderer: (params) => <Options map={PRIORIDADES_DESTINOS} params={params} /> },
                { field: 'cliente_cod', headerName: 'Cod.', ...cellParams(), width: 70, cellRenderer: (params) => <Value params={params} /> },
                { field: 'cliente_des', headerName: 'Cliente', width: 200, ...cellParams(), cellRenderer: (params) => <Value bold params={params} /> },
                { field: 'largura', headerName: 'Lar.', width: 70, ...cellParams(), cellRenderer: (params) => <Value unit=" mm" params={params} /> },
                { field: 'obs', wrapText: true, autoHeight: true, headerName: 'Obs.', ...cellParams(null, { maxLength: 1000, rows: 4 }), type: "editableColumn", cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true, width: 200, flex: 1 /* cellRenderer: (params) => <MultiLine params={params} /> */ },
                //{ field: 'obs_option', wrapText: true, autoHeight: true, headerName: 'Obs. Prioriodades', ...cellParams(), type: "editableColumn", cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true, width: 200, flex: 1 /* cellRenderer: (params) => <MultiLine params={params} /> */ },
                { colId: 'action', type: "actionOnEditColumn", cellRenderer: (params) => <Action params={params} onClick={(option) => onAction(params.data, params.rowIndex, option)} items={() => actionItems(params)} /> }
            ], timestamp: new Date()
        };
    }, [validation, dataAPI.getTimeStamp()]);

    const _checkLargura = (init = 0, max, api, prioridade, excludeIndex = null) => {
        let _lar = init;
        getNodes(api, (n) => {
            if (n.data.prioridade == prioridade && excludeIndex !== n.rowIndex) {
                _lar += n.data.largura;
            }
        });
        if (_lar > max) {
            return { valid: false, largura: _lar };
        }
        return { valid: true, largura: _lar };
    }

    const onDestinosSelect = async (rows, rowIdx = null, _data = null, _priority = null, api) => {
        const _gRows = getAllNodes(api);
        if (rowIdx === null) {
            const _rows = [];
            let _lar = _checkLargura(0, form.getFieldValue("largura"), gridRef.current.api, _priority).largura;
            for (const r of rows) {
                const _cliente_cod = r.data.cliente_cod_to;
                const _largura = r.data.lar_to;
                const _cliente_des = r.data.nome;
                if (!_gRows.some(v => isNullOrEmpty(v?.prioridade) && v.cliente_cod == _cliente_cod && v.largura == _largura)) {
                    _lar += _largura;
                    _rows.push({ [dataAPI.getPrimaryKey()]: uid(6), prioridade: _priority, cliente_cod: _cliente_cod, cliente_des: _cliente_des, largura: _largura, obs: null });
                }
            }
            if (_lar <= form.getFieldValue("largura") || isNullOrEmpty(_priority)) {
                dataAPI.setRows(sortBy(prop('prioridade'), [..._gRows, ..._rows]));
                setIsDirty(true);
            } else {
                return false;
            }
        } else {
            const _cliente_cod = rows[0].data.cliente_cod_to;
            const _largura = rows[0].data.lar_to;
            const _cliente_des = rows[0].data.nome;
            let _lar = _checkLargura(0, form.getFieldValue("largura"), api, _priority, rowIdx).largura;
            if (!_gRows.some(v => v.cliente_cod == _cliente_cod && v.largura == _largura)) {
                const _n = api.getRowNode(_data[dataAPI.getPrimaryKey()]).data;
                const _r = { ..._n, cliente_cod: _cliente_cod, cliente_des: _cliente_des, largura: _largura };
                _lar += _r.largura;
                if (_lar <= form.getFieldValue("largura")) {
                    const _rows = updateArrayWhere(_gRows, _r, { [dataAPI.getPrimaryKey()]: _n[dataAPI.getPrimaryKey()] });
                    dataAPI.setRows([..._rows]);
                    setIsDirty(true);
                } else {
                    return false;
                }
            }
        }
    };

    const onAction = async (row, index, option) => {
        submitting.trigger();
        switch (option.key) {
            case "delete":
                Modal.confirm({
                    content: <div>Tem a certeza que deseja apagar o destino?</div>, onOk: async () => {
                        const _gRows = getAllNodes(gridRef.current.api);
                        const _rows = deleteArrayElementWhere(_gRows, { [dataAPI.getPrimaryKey()]: row[dataAPI.getPrimaryKey()] });
                        dataAPI.setRows([..._rows]);
                        setIsDirty(true);
                    }
                })
                break;
            case "edit": onLookup(index, row); break;
        };
        submitting.end();
    };

    const actionItems = useCallback((params) => {
        return [
            ...[{ label: "Alterar Destino", key: "edit", icon: <EditOutlined style={{ fontSize: "16px" }} /> }],
            { type: 'divider' },
            ...[{ label: "Apagar Destino", key: "delete", icon: <DeleteFilled style={{ fontSize: "16px" }} /> }]
        ]
    }, []);

    const onLookup = (index = null, _data = null) => {
        const _lookup = (priority) => modalApi.setModalParameters({
            content:
                <Lookup
                    payload={{
                        url: `${API_URL}/bobines/sql/`, primaryKey: "id", parameters: { method: "BobinesDestinosHint" },
                        pagination: { enabled: false, limit: 500 }, baseFilter: {
                            ...parseFilter("artigo_id_from", `==${data?.artigo_id}`, { type: "number", group: "t1" }),
                            ...parseFilter("pd.lar_to", `<=${form.getFieldValue("largura")}`, { type: "number", group: "t1" }),
                            ...parseFilter("pa2.id", `==${data?.artigo_id}`, { type: "number", group: "t2" }),
                            ...parseFilter("pa2.lar", `<=${form.getFieldValue("largura")}`, { type: "number", group: "t2" }),
                        }
                    }}
                    onOk={(rows) => onDestinosSelect(rows, index, _data, priority, gridRef.current.api)}
                    onCancel={() => { }}
                    columnDefs={[
                        { colId: "cliente_cod_to", field: 'cliente_cod_to', headerName: 'Cliente Cod.', width: 130, cellRenderer: (params) => <Value bold params={params} /> },
                        { colId: "nome", field: 'nome', headerName: 'Cliente', flex: 1, cellRenderer: (params) => <Value params={params} /> },
                        { colId: "lar_to", field: 'lar_to', headerName: 'Largura', width: 90, cellRenderer: (params) => <Value unit=" mm" params={params} /> },
                        { colId: "used", field: 'used', headerName: 'Utilizado', width: 90, cellRenderer: (params) => <Bool params={params} /> }
                    ]}
                    filters={{
                        toolbar: ["nome", { field: "lar_to", type: "number" }],
                        more: [],
                        no: ["artigo_id_from"],
                        other: [{ field: "nome", colId: "pc.nome", group: "t3" }, { field: "lar_to", alias: "pa.lar", type: "number", group: "t3" }]
                    }}
                    style={{ height: `calc(80vh - 70px)` }}
                    rowSelection={index ? "single" : "multiple"}
                />,
            closable: true,
            type: "drawer",
            width: "600px",
            responsive: true,
            title: "Selecionar Destinos"
        });

        if (index == null) {
            modalApi2.setModalParameters({
                content:
                    <Lookup
                        columnDefs={[
                            {
                                field: 'value', headerName: 'Prioridade', flex: 1,
                                cellClass: params => { return !isNullOrEmpty(params.value) ? classes[params.value] : null },
                                cellRenderer: (params) => <Value style={{ cursor: "pointer" }} align='center' bold value={params.value == null ? "Ignorar" : params.value} params={params} />
                            }
                        ]}
                        dataGridProps={{ local: true, showTopToolbar: false, headerHeight: 0 }}
                        payload={{ data: { rows: [{ value: null, label: "Ignorar" }, ...SELECT_PRIORIDADES_DESTINOS] }, pagination: { enabled: false, limit: 20 } }}
                        onOk={(rows) => onDestinosSelect(rows, index, _data, null, gridRef.current.api)}
                        rowSelection="single"
                        style={{ height: `calc(300px - 15px` }}
                        onSelectionChanged={(row, closeSelf) => {
                            _lookup(row[0].value);
                            modalApi.showModal();
                            closeSelf();
                        }}
                    />,
                closable: true,
                width: "170px",
                type: "modal",
                responsive: true,
                title: "Prioridade"
            });
            modalApi2.showModal();
        } else {
            _lookup(_data.prioridade);
            modalApi.showModal();
        }
    }

    return (<>
        <FormContainer fluid form={form} forInput={forInput} wrapForm={true} wrapFormItem={true} style={{}} onValuesChange={onValuesChange} validation={validation}>
            <Row style={{ maxHeight: "200px", overflowY: "auto" }} gutterWidth={gutterWidth}>
                <Col>
                    {selectedNodes &&
                        <TableGridView
                            local
                            showTopToolbar={false}
                            columnDefs={[
                                { colId: "mb.nome", field: 'nome', width: 95, cellRenderer: (params) => <Value bold params={params} /> },
                                { colId: 'mb.lar', field: 'lar', headerName: 'Lar.', width: 60, ...cellParams(), cellRenderer: (params) => <Value params={params} /> },
                                { field: 'prop_obs', wrapText: true, autoHeight: true, headerName: 'Prop. Obs.', ...cellParams(), width: 200, flex: 1, cellRenderer: (params) => <MultiLine params={params} /> },
                                { field: 'obs', wrapText: true, autoHeight: true, headerName: 'Obs.', ...cellParams(), width: 200, flex: 1, cellRenderer: (params) => <MultiLine params={params} /> }
                            ]}
                            filters={null}
                            dataAPI={dataAPIBobines}
                            domLayout={'autoHeight'}
                            style={{ height: "auto" }}
                        />
                    }
                </Col>
            </Row>
            <Row style={{}} gutterWidth={gutterWidth}>
                <Col md={12}>
                    {(isLegacy) &&
                        <>
                            <Row style={{ marginBottom: "15px" }} gutterWidth={gutterWidth}>
                                <Col>
                                    <Field name="destino" label={{ text: "Destino (legacy)" }}>
                                        <TextArea autoSize={{ minRows: 2, maxRows: 16 }} style={{ width: "100%" }} />
                                    </Field>
                                </Col>
                            </Row>
                            {/* <Row style={{ marginBottom: "15px" }} gutterWidth={gutterWidth}>
                                <Col>
                                    <Field name="obs" label={{ text: "Observações" }}>
                                        <TextArea autoSize={{ minRows: 2, maxRows: 16 }} style={{ width: "100%" }} />
                                    </Field>
                                </Col>
                            </Row>
                            <Row style={{ marginBottom: "15px" }} gutterWidth={gutterWidth}>
                                <Col>
                                    <Field name="prop_obs" label={{ text: "Propriedades Observações" }}>
                                        <TextArea autoSize={{ minRows: 2, maxRows: 16 }} style={{ width: "100%" }} />
                                    </Field>
                                </Col>
                            </Row> */}
                        </>
                    }
                    {(!isLegacy) &&
                        <>
                            {/*                             <Row gutterWidth={gutterWidth}>
                                <Col></Col>
                                <Col width={150}>
                                    <Field name="troca_etiqueta" label={{ enabled: false }}>
                                        <Switch style={{ width: "100%" }} size="default" checkedChildren="Trocar Etiqueta" unCheckedChildren="Trocar Etiqueta" />
                                    </Field>
                                </Col>
                                <Col width={150}>
                                    <Field name="regranular" label={{ enabled: false }}>
                                        <Switch style={{ width: "100%" }} size="default" checkedChildren="Regranular" unCheckedChildren="Regranular" />
                                    </Field>
                                </Col>
                                <Col xs="content">
                                    <Field name="estado" label={{ enabled: false }} type="selector">
                                        <EstadoBobineLookup onSelectionChange={onEstadoChange} field={{ estado: "value", largura: null }} />
                                    </Field>
                                </Col>
                            </Row> */}
                            {/* <Row gutterWidth={gutterWidth}>
                                <Col>
                                    <Field name="obs" label={{ text: "Observações" }}>
                                        <TextArea autoSize={{ minRows: 2, maxRows: 16 }} style={{ width: "100%" }} />
                                    </Field>
                                </Col>
                            </Row>
                            <Row gutterWidth={gutterWidth}>
                                <Col>
                                    <Field name="prop_obs" label={{ text: "Propriedades Observações" }}>
                                        <TextArea autoSize={{ minRows: 2, maxRows: 16 }} style={{ width: "100%" }} />
                                    </Field>
                                </Col>
                            </Row> */}
                            {extraRef && <Portal elId={extraRef.current}>
                                <Row nogutter style={{ padding: "5px", alignItems: "center" }}>
                                    <Col xs="content">
                                        <Field name="regranular" label={{ text: "Regranular", pos: "column", style: { fontWeight: 400 } }} rowStyle={{ alignItems: "center", flexDirection: "row-reverse" }}>
                                            <Checkbox onChange={onRegranularChange} /*  style={{ width: "100%" }} */ size="default" /* checkedChildren="Regranular" unCheckedChildren="Regranular" */ />
                                        </Field>
                                    </Col>
                                    <Col xs="content">
                                        <Field name="estado" label={{ enabled: false }} type="selector">
                                            <EstadoBobineLookup onSelectionChange={onEstadoChange} field={{ estado: "value", largura: null }} />
                                        </Field>
                                    </Col>
                                </Row>
                            </Portal>}
                            {((regranular == 0 || form.getFieldValue("regranular") == 0) && (estado?.value !== "R" || form.getFieldValue("estado")?.value != "R")) && <Row>
                                <Col md={7}>
                                    <Row nogutter style={{ padding: "5px", alignItems: "center", height: "45px" }}>
                                        <Col></Col>
                                        <Col xs="content">
                                            {(forInput && regranular == 0 && estado?.value !== "R") && <Button onClick={() => onLookup()} icon={<CheckSquareOutlined />} type="primary">Selecionar</Button>}
                                        </Col>
                                    </Row>
                                    <Row nogutter>
                                        <Col>
                                            <TableGridEdit
                                                local
                                                domLayout={'autoHeight'}
                                                style={{ height: "auto" }}
                                                gridRef={gridRef}
                                                singleClickEdit={true}
                                                onAfterCellEditRequest={onAfterCellEditRequest}
                                                onBeforeCellEditRequest={onBeforeCellEditRequest}
                                                showTopToolbar={false}
                                                columnDefs={columnDefs}
                                                filters={null}
                                                dataAPI={dataAPI}
                                                modeApi={modeApi}
                                                modeOptions={{ ...forInput && { enabled: true, showControls: false, mode: modeApi.EDIT, allowEdit: true } }}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col md={5}>
                                    <Row nogutter style={{ padding: "5px", alignItems: "center", height: "45px" }}>
                                        <Col></Col>
                                    </Row>
                                    <Row nogutter>
                                        <Col>
                                            <GridPrioridades dataAPI={dataAPIPri} regranular={regranular} estado={estado} prioridades={prioridades} initValue={value?.obs_prioridades} setIsDirty={setIsDirty} modeApi={modeApi} validation={validation} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            }
                        </>
                    }
                </Col>
            </Row>
        </FormContainer>
        {wndRef && <Portal elId={wndRef.current}>
            <Space>
                <Button disabled={submitting.state} onClick={closeSelf}>Fechar</Button>
                {isDirty && <Button type="primary" disabled={submitting.state} onClick={onSave}>Confirmar</Button>}
            </Space>
        </Portal>}
    </>);
}
export const DestinosEditor = forwardRef((props, ref) => {
    const initialized = useRef(false);
    const modalApi = useModalApi();
    const { onValueChange, api } = props;
    const { ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};
    const { title } = props.column.getDefinition()?.cellRendererParams || {};
    const _field = columnPath(props.column);

    useEffect(() => {
        initialized.current = true;
        onPopup();
    }, []);

    const onPopup = () => {
        const _nodes = getSelectedNodes(props.api);
        const _selectedNodes = (_nodes && _nodes.length > 0) ? _nodes.map(v => v.data) : [{ ...props.data }];
        modalApi.setModalParameters({
            content: <FormDestinosEditor forInput selectedNodes={_selectedNodes} field="destinos" value={valueByPath(props.data, "destinos")} data={props.data} onValueChange={onValueChange} gridApi={api} />,
            closable: false,
            title: title ? title : props.column.getDefinition().headerName,
            lazy: false,
            type: "drawer",
            width: "95vw",
            responsive: true,
            parameters: { ...getCellFocus(api) }
        });
        modalApi.showModal();
    }

    return <div style={{ cursor: "pointer", width: "100%", height: "100%", backgroundColor: "#fff" }} onClick={() => initialized.current && onPopup()} /* onKeyDown={_onKeyDown} */>
        {valueByPath(props.data, _field)}
    </div>;
});



// const AAA = () => {
//     return (<div>ferererererere</div>)
// }

// const FormDestinosEditor = ({ value, field, data, wndRef, closeSelf, forInput, onValueChange, gridApi }) => {
//     const submitting = useSubmitting(true);
//     const minValue = 0;
//     const [isDirty, setIsDirty] = useState(false);
//     const removed = useRef(false);
//     const [form] = Form.useForm();
//     const [alerts, setAlerts] = useState({});
//     const modalApi = useModalApi();
//     const isLegacy = useMemo(() => !data?.destinos && data?.destino, []);

//     useEffect(() => {
//         form.setFieldsValue({ ...value ? value : {} });
//         submitting.end();
//     }, []);



//     // const _validate = (v, index) => {
//     //     const ret = {};
//     //     if (isEmpty(v?.min) || isEmpty(v?.max)) {
//     //         ret[index] = { lim: { message: ["O limite inferior e o limite superior são obrigatórios!"] } };
//     //     } else if (!is(Number, v?.min) || !is(Number, v?.max)) {
//     //         ret[index] = { lim: { message: ["O limite inferior e o limite superior têm de ser valores numéricos!"] } };
//     //     } else if (v.max < v.min) {
//     //         ret[index] = { lim: { message: ["O limite inferior tem de ser inferior ou igual ao limite superior!"] } };
//     //     }
//     //     return ret;
//     // }

//     const onValuesChange = async (cv, av) => {
//         // if (removed.current) {
//         //     removed.current = false;
//         //     setIsDirty(true);
//         //     return;
//         // }
//         // const index = cv.items.length - 1;
//         // const v = form.getFieldValue(["items", index]);
//         // const validation = _validate(v, index);
//         // if (isEmpty(validation)) {
//         //     const _alerts = { ...alerts };
//         //     delete _alerts[index];
//         //     setAlerts(_alerts);
//         // } else {
//         //     setAlerts(prev => ({ ...prev, ...validation }));
//         // }
//         // setIsDirty(true);
//     }
//     const onSave = async () => {
//         // const values = form.getFieldValue(["items"]);
//         // let _alerts = {};
//         // for (const [i, v] of values.entries()) {
//         //     const validation = _validate(v, i);
//         //     if (!isEmpty(validation)) {
//         //         _alerts = { ..._alerts, ...validation };
//         //     }
//         // }
//         // setAlerts(_alerts);
//         // if (isEmpty(_alerts)) {
//         //     onValueChange(values);
//         //     gridApi.stopEditing();
//         //     closeSelf();
//         // }

//     }

//     const teste = () => {
//         modalApi.setModalParameters({
//             content: <AAA />,
//             closable: true,
//             title: null, //"Carregar Parâmetros",
//             lazy: true,
//             type: "drawer",
//             responsive: true,
//             width: "95%",
//             parameters: {} //{ ...getCellFocus(gridRef.current.api) }
//         });
//         modalApi.showModal();
//     }

//     return (<>
//         <FormContainer fluid form={form} forInput={forInput} wrapForm={true} wrapFormItem={true} style={{}} onValuesChange={onValuesChange}>
//             <Row style={{}} gutterWidth={gutterWidth}>
//                 <Col>
//                     <Row gutterWidth={gutterWidth}>
//                         <Col width={150}>
//                             <Field name="troca_etiqueta" label={{ enabled: false }}>
//                                 <Switch style={{ width: "100%" }} size="default" checkedChildren="Trocar Etiqueta" unCheckedChildren="Trocar Etiqueta" />
//                             </Field>
//                         </Col>
//                     </Row>
//                     {(isLegacy) &&
//                         <>
//                             <Row gutterWidth={gutterWidth}><Col>ISLEGACY</Col></Row>
//                         </>
//                     }
//                     {(!isLegacy) &&
//                         <>
//                             <Row gutterWidth={gutterWidth}>
//                                 <Col width={150}>
//                                     <Field name="regranular" label={{ enabled: false }}>
//                                         <Switch style={{ width: "100%" }} size="default" checkedChildren="Regranular" unCheckedChildren="Regranular" />
//                                     </Field>
//                                 </Col>
//                                 <Col onClick={teste}>fsdfsfsdfs</Col>
//                             </Row>
//                             <Row gutterWidth={gutterWidth}>
//                                 <Col>
//                                     <Field name="obs" label={{ text: "Observações" }}>
//                                         <TextArea autoSize={{ minRows: 2, maxRows: 16 }} style={{ width: "100%" }} />
//                                     </Field>
//                                 </Col>
//                             </Row>
//                             <Row gutterWidth={gutterWidth}>
//                                 <Col>
//                                     <Field name="prop_obs" label={{ text: "Propriedades Observações" }}>
//                                         <TextArea autoSize={{ minRows: 2, maxRows: 16 }} style={{ width: "100%" }} />
//                                     </Field>
//                                 </Col>
//                             </Row>
//                             <Form.List name="destinos">
//                                 {(fields, { add, remove, move }) => {
//                                     const addRow = (fields, duplicate = false) => {
//                                         //if (fields.length === 0) {
//                                         if (duplicate) {
//                                             add(form.getFieldValue(["destinos", duplicate.name]));
//                                         } else {
//                                             add({ cliente: null, largura: p.row.lar, obs: null });
//                                         }
//                                         //} else {
//                                         //    add({ [`min`]: null, [`max`]: null, "unit": unit, ...(type == "ff" && { "type": "Desbobinagem" }) });
//                                         //}
//                                     }
//                                     const removeRow = (fieldName, field) => {
//                                         remove(fieldName);
//                                     }
//                                     const moveRow = (from, to) => {
//                                         //move(from, to);
//                                     }
//                                     return (
//                                         <>
//                                             <div style={{}}>
//                                                 <YScroll>
//                                                     {fields.length > 0 &&
//                                                         <Row nogutter>
//                                                             <Col width={30} style={{ fontWeight: 700, fontSize: "15px" }}></Col>
//                                                             <Col><Label text="Cliente" /></Col>
//                                                             <Col width={100}><Label text="Largura" /></Col>
//                                                             <Col width={30}></Col>
//                                                         </Row>
//                                                     }
//                                                     {/* {fields.map((field, index) => (
//                                                         <Row key={field.key} nogutter style={{ padding: "10px", marginBottom: "10px", borderRadius: "3px", border: "1px solid rgba(5, 5, 5,0.1)" }}>
//                                                             <Col width={30} style={{ display: "flex", flexDirection: "column", alignItems: "center", fontWeight: 700, fontSize: "15px" }}><div>{index + 1}</div>{forInput && <Button onClick={() => addRow(fields, field)} size="small" icon={<CopyOutlined />} />}</Col>
//                                                             <Col>
//                                                                 <Row gutterWidth={gutterWidth}>
//                                                                     <Col>
//                                                                         <Field wrapFormItem={true} forViewBackground={false} name={[field.name, `cliente`]} label={{ enabled: false, text: "Cliente" }}>
//                                                                             <Selector
//                                                                                 size="small"
//                                                                                 title="Clientes"
//                                                                                 params={{ payload: { url: `${API_URL}/sellcustomerslookup/`, parameters: {}, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } }}
//                                                                                 keyField={["BPCNUM_0"]}
//                                                                                 textField="BPCNAM_0"
//                                                                                 detailText={r => r?.ITMDES1_0}
//                                                                                 style={{ fontWeight: 700 }}
//                                                                                 columns={[
//                                                                                     { key: 'BPCNUM_0', name: 'Cód', width: 160 },
//                                                                                     { key: 'BPCNAM_0', name: 'Nome' }
//                                                                                 ]}
//                                                                                 filters={{ fmulti_customer: { type: "any", width: 150, text: "Cliente", autoFocus: true } }}
//                                                                                 moreFilters={{}}
//                                                                             />
//                                                                         </Field>
//                                                                     </Col>
//                                                                     <Col width={100}><Field name={[field.name, `largura`]} forViewBackground={false} label={{ enabled: false, text: "Largura" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} controls={false} addonAfter={<b>mm</b>} min={10} max={500} /></Field></Col>
//                                                                 </Row>
//                                                                 <Row>
//                                                                     <Col>
//                                                                         <Field wrapFormItem={true} forViewBackground={false} name={[field.name, `obs`]} label={{ enabled: false }}>
//                                                                             <TextArea onKeyDown={(e) => (e.key == 'Enter') && e.stopPropagation()} autoSize={{ minRows: 1, maxRows: 3 }} style={{ width: "100%" }} />
//                                                                         </Field>
//                                                                     </Col>
//                                                                 </Row>
//                                                             </Col>
//                                                             <Col width={30}>{forInput && <div className={classNames(classes.center)}><IconButton onClick={() => removeRow(field.name, field)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton></div>}</Col>
//                                                         </Row>
//                                                     ))} */}

//                                                 </YScroll>
//                                             </div>
//                                             {(forInput && form.getFieldValue("regranular") == 0 && form.getFieldValue("estado")?.value !== "R") && <Row style={{ marginTop: "5px" }}><Col><Button disabled={!forInput} type="default" onClick={() => addRow(fields)} style={{ width: "100%" }}><PlusOutlined />Adicionar</Button></Col></Row>}
//                                         </>
//                                     )
//                                 }}
//                             </Form.List>
//                         </>
//                     }
//                 </Col>
//             </Row>
//         </FormContainer>
//         {wndRef && <Portal elId={wndRef.current}>
//             <Space>
//                 <Button disabled={submitting.state} onClick={closeSelf}>Fechar</Button>
//                 {isDirty && <Button type="primary" disabled={submitting.state} onClick={onSave}>Guardar</Button>}
//             </Space>
//         </Portal>}
//     </>);
// }
// export const DestinosEditor = forwardRef((props, ref) => {
//     const initialized = useRef(false);
//     const modalApi = useModalApi();
//     const { onValueChange, api } = props;
//     const { ...editorParams } = props.column.getDefinition()?.cellEditorParams || {};
//     const { title } = props.column.getDefinition()?.cellRendererParams || {};
//     const _field = columnPath(props.column);

//     useEffect(() => {
//         initialized.current = true;
//         onPopup();
//     }, []);

//     const onPopup = () => {
//         modalApi.setModalParameters({
//             content: <FormDestinosEditor forInput field="destinos" value={valueByPath(props.data, "destinos")} data={props.data} onValueChange={onValueChange} gridApi={api} />,
//             closable: true,
//             title: title ? title : props.column.getDefinition().headerName,
//             lazy: false,
//             type: "drawer",
//             width: "1000px",
//             parameters: { ...getCellFocus(api) }
//         });
//         modalApi.showModal();
//     }

//     return <div style={{ cursor: "pointer", width: "100%", height: "100%", backgroundColor: "#fff" }} onClick={() => initialized.current && onPopup()} /* onKeyDown={_onKeyDown} */>
//         {valueByPath(props.data, _field)}
//     </div>;
// });