import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { AutoComplete, Checkbox, DatePicker, Input, InputNumber, Select, Form, Space, Button, Tooltip, Switch } from 'antd';
import { dayjsValue } from 'utils/index';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { columnPath, getCellFocus, useModalApi } from './TableV4';
import { useDataAPI, _fieldZodDescription } from 'utils/useDataAPIV4';
import { API_URL, DATETIME_FORMAT } from 'config';
import { Value } from './TableColumnsV4';
import TableGridSelect from './TableGridSelect';
import { fetchPost } from 'utils/fetch';
import { is, isEmpty, isNil } from 'ramda';
import { valueByPath,json } from 'utils/object';
import { useSubmitting } from "utils";
import YScroll from 'components/YScroll';
import Portal from "components/portal";
import IconButton from "components/iconButton";
import { Container as FormContainer, Field, Label } from 'components/FormFields/FormsV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { CgCloseO } from 'react-icons/cg';
import { getSchema } from 'utils/schemaValidator';
import { zGroupIntervalNumber, zGroupRangeNumber } from 'utils/schemaZodRules';
import { z } from "zod";
import TextArea from 'antd/es/input/TextArea';
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



const FormRangeDefeitosEditor = ({ value, field, data, unit, wndRef, closeSelf, forInput, onValueChange, gridApi }) => {
    const submitting = useSubmitting(true);
    const minValue = 0;
    const maxValue = unit == "m" ? data.comp_actual : data.diam;
    const _ff = ["ff_pos"].includes(field) ? true : false
    const _furos = ["furos_pos"].includes(field) ? true : false
    const [isDirty, setIsDirty] = useState(false);
    const removed = useRef(false);
    const [form] = Form.useForm();
    const [alerts, setAlerts] = useState({});

    useEffect(() => {
        form.setFieldsValue({ items: [...value ? value : []].reverse() });
        submitting.end();
    }, []);

    const validate = (v, index) => {
        const ret = {};
        if (isEmpty(v?.min) || isEmpty(v?.max)) {
            ret[index] = { lim: { message: ["O limite inferior e o limite superior são obrigatórios!"] } };
        } else if (!is(Number, v?.min) || !is(Number, v?.max)) {
            ret[index] = { lim: { message: ["O limite inferior e o limite superior têm de ser valores numéricos!"] } };
        } else if (v.max < v.min) {
            ret[index] = { lim: { message: ["O limite inferior tem de ser inferior ou igual ao limite superior!"] } };
        }
        return ret;
    }

    const onValuesChange = async (cv, av) => {
        if (removed.current) {
            removed.current = false;
            setIsDirty(true);
            return;
        }
        const index = cv.items.length - 1;
        const v = form.getFieldValue(["items", index]);
        const validation = validate(v, index);
        if (isEmpty(validation)) {
            const _alerts = { ...alerts };
            delete _alerts[index];
            setAlerts(_alerts);
        } else {
            setAlerts(prev => ({ ...prev, ...validation }));
        }
        setIsDirty(true);
    }
    const onSave = async () => {
        const values = form.getFieldValue(["items"]);
        let _alerts = {};
        for (const [i, v] of values.entries()) {
            const validation = validate(v, i);
            if (!isEmpty(validation)) {
                _alerts = { ..._alerts, ...validation };
            }
        }
        setAlerts(_alerts);
        if (isEmpty(_alerts)) {
            onValueChange(values);
            gridApi.stopEditing();
            closeSelf();
        }

    }

    return (<>
        <FormContainer fluid form={form} forInput={forInput} wrapForm={true} wrapFormItem={true} style={{}} onValuesChange={onValuesChange}>
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
                                                    <Field name={[field.name, `min`]} status={alerts[field.name]?.lim}><InputNumber autoFocus style={{ width: "110px", textAlign: "right" }} controls={false} addonAfter={<b>{unit}</b>} min={minValue} max={maxValue} /></Field>
                                                    <Field name={[field.name, `max`]} status={alerts[field.name]?.lim}><InputNumber style={{ width: "110px", textAlign: "right" }} controls={false} addonAfter={<b>{unit}</b>} min={minValue} max={maxValue} /></Field>
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


    // const value = useMemo(() => {
    //     //return 123;
    //     // if (props.value === undefined || props.value === null || props.value === "") {
    //     //     return null;
    //     // }
    //     // if (typeof props.value === 'object') {
    //     //     return props.value?.[keyField];
    //     // }
    //     return `${props.value}`;
    // }, [props.value]);

    // Expose the Input value to ag-Grid
    // useImperativeHandle(ref, () => ({
    //     getValue() {
    //         return value;
    //     },
    // }));

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

const AAA = () =>{
    return(<div>ferererererere</div>)
}

const FormDestinosEditor = ({ value, field, data, wndRef, closeSelf, forInput, onValueChange, gridApi }) => {
    const submitting = useSubmitting(true);
    const minValue = 0;
    const [isDirty, setIsDirty] = useState(false);
    const removed = useRef(false);
    const [form] = Form.useForm();
    const [alerts, setAlerts] = useState({});
    const modalApi = useModalApi();
    const isLegacy = useMemo(() => !data?.destinos && data?.destino, []);

    useEffect(() => {
        form.setFieldsValue({ ...value ? value : {} });
        submitting.end();
    }, []);



    // const validate = (v, index) => {
    //     const ret = {};
    //     if (isEmpty(v?.min) || isEmpty(v?.max)) {
    //         ret[index] = { lim: { message: ["O limite inferior e o limite superior são obrigatórios!"] } };
    //     } else if (!is(Number, v?.min) || !is(Number, v?.max)) {
    //         ret[index] = { lim: { message: ["O limite inferior e o limite superior têm de ser valores numéricos!"] } };
    //     } else if (v.max < v.min) {
    //         ret[index] = { lim: { message: ["O limite inferior tem de ser inferior ou igual ao limite superior!"] } };
    //     }
    //     return ret;
    // }

    const onValuesChange = async (cv, av) => {
        // if (removed.current) {
        //     removed.current = false;
        //     setIsDirty(true);
        //     return;
        // }
        // const index = cv.items.length - 1;
        // const v = form.getFieldValue(["items", index]);
        // const validation = validate(v, index);
        // if (isEmpty(validation)) {
        //     const _alerts = { ...alerts };
        //     delete _alerts[index];
        //     setAlerts(_alerts);
        // } else {
        //     setAlerts(prev => ({ ...prev, ...validation }));
        // }
        // setIsDirty(true);
    }
    const onSave = async () => {
        // const values = form.getFieldValue(["items"]);
        // let _alerts = {};
        // for (const [i, v] of values.entries()) {
        //     const validation = validate(v, i);
        //     if (!isEmpty(validation)) {
        //         _alerts = { ..._alerts, ...validation };
        //     }
        // }
        // setAlerts(_alerts);
        // if (isEmpty(_alerts)) {
        //     onValueChange(values);
        //     gridApi.stopEditing();
        //     closeSelf();
        // }

    }

    const teste = () => {
        modalApi.setModalParameters({
            content: <AAA/>,
            closable: true,
            title: null, //"Carregar Parâmetros",
            lazy: true,
            type: "drawer",
            responsive: true,
            width: "95%",
            parameters: {} //{ ...getCellFocus(gridRef.current.api) }
          });
          modalApi.showModal();
    }

    return (<>
        <FormContainer fluid form={form} forInput={forInput} wrapForm={true} wrapFormItem={true} style={{}} onValuesChange={onValuesChange}>
            <Row style={{}} gutterWidth={gutterWidth}>
                <Col>
                    <Row gutterWidth={gutterWidth}>
                        <Col width={150}>
                            <Field name="troca_etiqueta" label={{ enabled: false }}>
                                <Switch style={{ width: "100%" }} size="default" checkedChildren="Trocar Etiqueta" unCheckedChildren="Trocar Etiqueta" />
                            </Field>
                        </Col>
                    </Row>
                    {(isLegacy) &&
                        <>
                            <Row gutterWidth={gutterWidth}><Col>ISLEGACY</Col></Row>
                        </>
                    }
                    {(!isLegacy) &&
                        <>
                            <Row gutterWidth={gutterWidth}>
                                <Col width={150}>
                                    <Field name="regranular" label={{ enabled: false }}>
                                        <Switch style={{ width: "100%" }} size="default" checkedChildren="Regranular" unCheckedChildren="Regranular" />
                                    </Field>
                                </Col>
                                <Col onClick={teste}>fsdfsfsdfs</Col>
                            </Row>
                            <Row gutterWidth={gutterWidth}>
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
                            </Row>
                            <Form.List name="destinos">
                                {(fields, { add, remove, move }) => {
                                    const addRow = (fields, duplicate = false) => {
                                        //if (fields.length === 0) {
                                        if (duplicate) {
                                            add(form.getFieldValue(["destinos", duplicate.name]));
                                        } else {
                                            add({ cliente: null, largura: p.row.lar, obs: null });
                                        }
                                        //} else {
                                        //    add({ [`min`]: null, [`max`]: null, "unit": unit, ...(type == "ff" && { "type": "Desbobinagem" }) });
                                        //}
                                    }
                                    const removeRow = (fieldName, field) => {
                                        remove(fieldName);
                                    }
                                    const moveRow = (from, to) => {
                                        //move(from, to);
                                    }
                                    return (
                                        <>
                                            <div style={{}}>
                                                <YScroll>
                                                    {fields.length > 0 &&
                                                        <Row nogutter>
                                                            <Col width={30} style={{ fontWeight: 700, fontSize: "15px" }}></Col>
                                                            <Col><Label text="Cliente" /></Col>
                                                            <Col width={100}><Label text="Largura" /></Col>
                                                            <Col width={30}></Col>
                                                        </Row>
                                                    }
                                                    {/* {fields.map((field, index) => (
                                                        <Row key={field.key} nogutter style={{ padding: "10px", marginBottom: "10px", borderRadius: "3px", border: "1px solid rgba(5, 5, 5,0.1)" }}>
                                                            <Col width={30} style={{ display: "flex", flexDirection: "column", alignItems: "center", fontWeight: 700, fontSize: "15px" }}><div>{index + 1}</div>{forInput && <Button onClick={() => addRow(fields, field)} size="small" icon={<CopyOutlined />} />}</Col>
                                                            <Col>
                                                                <Row gutterWidth={gutterWidth}>
                                                                    <Col>
                                                                        <Field wrapFormItem={true} forViewBackground={false} name={[field.name, `cliente`]} label={{ enabled: false, text: "Cliente" }}>
                                                                            <Selector
                                                                                size="small"
                                                                                title="Clientes"
                                                                                params={{ payload: { url: `${API_URL}/sellcustomerslookup/`, parameters: {}, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } }}
                                                                                keyField={["BPCNUM_0"]}
                                                                                textField="BPCNAM_0"
                                                                                detailText={r => r?.ITMDES1_0}
                                                                                style={{ fontWeight: 700 }}
                                                                                columns={[
                                                                                    { key: 'BPCNUM_0', name: 'Cód', width: 160 },
                                                                                    { key: 'BPCNAM_0', name: 'Nome' }
                                                                                ]}
                                                                                filters={{ fmulti_customer: { type: "any", width: 150, text: "Cliente", autoFocus: true } }}
                                                                                moreFilters={{}}
                                                                            />
                                                                        </Field>
                                                                    </Col>
                                                                    <Col width={100}><Field name={[field.name, `largura`]} forViewBackground={false} label={{ enabled: false, text: "Largura" }}><InputNumber size="small" style={{ width: "100%", textAlign: "right" }} controls={false} addonAfter={<b>mm</b>} min={10} max={500} /></Field></Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col>
                                                                        <Field wrapFormItem={true} forViewBackground={false} name={[field.name, `obs`]} label={{ enabled: false }}>
                                                                            <TextArea onKeyDown={(e) => (e.key == 'Enter') && e.stopPropagation()} autoSize={{ minRows: 1, maxRows: 3 }} style={{ width: "100%" }} />
                                                                        </Field>
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                            <Col width={30}>{forInput && <div className={classNames(classes.center)}><IconButton onClick={() => removeRow(field.name, field)} style={{ alignSelf: "center" }}><CgCloseO /></IconButton></div>}</Col>
                                                        </Row>
                                                    ))} */}

                                                </YScroll>
                                            </div>
                                            {(forInput && form.getFieldValue("regranular") == 0 && form.getFieldValue("estado")?.value !== "R") && <Row style={{ marginTop: "5px" }}><Col><Button disabled={!forInput} type="default" onClick={() => addRow(fields)} style={{ width: "100%" }}><PlusOutlined />Adicionar</Button></Col></Row>}
                                        </>
                                    )
                                }}
                            </Form.List>
                        </>
                    }
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
        modalApi.setModalParameters({
            content: <FormDestinosEditor forInput field="destinos" value={valueByPath(props.data, "destinos")} data={props.data} onValueChange={onValueChange} gridApi={api} />,
            closable: true,
            title: title ? title : props.column.getDefinition().headerName,
            lazy: false,
            type: "drawer",
            width: "1000px",
            parameters: { ...getCellFocus(api) }
        });
        modalApi.showModal();
    }

    return <div style={{ cursor: "pointer", width: "100%", height: "100%", backgroundColor: "#fff" }} onClick={() => initialized.current && onPopup()} /* onKeyDown={_onKeyDown} */>
        {valueByPath(props.data, _field)}
    </div>;
});


