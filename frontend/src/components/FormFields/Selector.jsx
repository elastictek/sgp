import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { Form, Tooltip, Drawer, Modal, Button, Input, Tag, AutoComplete, Select, Switch, Alert, Checkbox, Spin, DatePicker, InputNumber, TimePicker } from "antd";
const { Search } = Input;
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { useSubmitting } from "utils";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import styled, { css } from "styled-components";
import classNames from "classnames";
import { createUseStyles } from 'react-jss';
import YScroll from "../YScroll";
import { useDataAPI } from "utils/useDataAPIV3";
import Table from 'components/TableV2';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField } from 'components/FormFields';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";


import { Context } from "./formFields";
import { ClearOutlined, SearchOutlined, CloseCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { sleep } from 'utils/';

const useStyles = createUseStyles({
    inputContainer: {
        position: 'relative',
        //display: 'inline-block',
        '&:hover $clearButton': {
            display: 'block',
        },
    },
    input: {
        //width:"100%",
        /*         padding: '8px', */

    },
    clearButton: {
        position: 'absolute',
        top: '50%',
        right: '40px',
        zIndex:2000,
        transform: 'translateY(-50%)',
        display: 'none',
        cursor: 'pointer'
    },
});


const schema = (options = {}) => {
    return getSchema({}, options).unknown(true);
}

const Filters = ({ filters }) => {
    const autoFocusRef = useRef(null);
    useEffect(() => {
        if (autoFocusRef.current) {
            autoFocusRef.current.focus();
        }
    }, []);
    return (<>
        {Object.keys(filters).map(k => {
            return (
                <Col key={k} xs='content'><Field name={k} label={{ enabled: true, text: filters[k]?.text, pos: "top", padding: "0px" }}>
                    <Input size='small' allowClear width={filters[k]?.width ? filters[k]?.width : 100} ref={filters[k]?.autoFocus && autoFocusRef} />
                </Field></Col>
            );
        })}
    </>)
}

const Popup = ({ params, columns, filters, moreFilters, onSelect, closeSelf, toolbar = true, rowHeight = 24 }) => {
    const [visible, setVisible] = useState({ drawer: { open: false } });
    const dataAPI = useDataAPI(params);
    const submitting = useSubmitting(true);
    const [formFilter] = Form.useForm();
    const defaultParameters = {};
    const defaultFilters = {};
    const defaultSort = [];
    useEffect(() => {
        const controller = new AbortController();
        loadData({ init: true, signal: controller.signal });
        return (() => controller.abort());
    }, []);
    const loadData = ({ init = false, signal }) => {
        if (init) {
            if (!params?.payload?.data) {
                //const { ...initFilters } = loadInit({ ...defaultFilters, ...defaultParameters }, { ...dataAPI.getAllFilter(), tstamp: dataAPI.getTimeStamp() }, {}, location?.state, [...Object.keys(location?.state ? location?.state : {}), ...Object.keys(dataAPI.getAllFilter())]);
                //let { filterValues, fieldValues } = fixRangeDates([], initFilters);
                //formFilter.setFieldsValue({ ...fieldValues });
                //dataAPI.addFilters(filterValues, true, false);
                //dataAPI.setSort(defaultSort);
                //dataAPI.addParameters({}, true, false);
                //console.log(fieldValues,filterValues,"#######");
                dataAPI.fetchPost({ signal });
            }
        }
        submitting.end();
    }
    const onOpen = (component, data) => {
        setVisible(prev => ({ ...prev, [component]: { ...data, title: <div>Bobine <span style={{ fontWeight: 900 }}>{data.nome}</span></div>, open: true } }));
    }
    const onClose = (component) => {
        setVisible(prev => ({ ...prev, [component]: { open: false } }));
    }
    const onRowClick = (row, col) => {
        onSelect(row);
        closeSelf();
    }
    const onFilterFinish = (type, values) => {
        switch (type) {
            case "filter":
                //remove empty values
                const { typelist, ...vals } = Object.fromEntries(Object.entries({ ...defaultFilters, ...values }).filter(([_, v]) => v !== null && v !== ''));
                const _values = {
                    ...vals,
                    ...(Object.keys(filters).reduce((accumulator, value) => {
                        return { ...accumulator, [value]: getFilterValue(vals[value], filters[value].type) };
                    }, {}))
                };
                dataAPI.addFilters(_values, true);
                dataAPI.first();
                dataAPI.fetchPost();
                break;
        }
    };
    const onFilterChange = (changedValues, values) => {
    };

    return (<YScroll>
        <Table
            onRowClick={onRowClick}
            rowStyle={`cursor:pointer;font-size:12px;`}
            headerStyle={`background-color:#f0f0f0;font-size:10px;`}
            loadOnInit={false}
            columns={columns}
            rowHeight={rowHeight}
            dataAPI={dataAPI}
            toolbar={toolbar}
            search={true}
            moreFilters={false}
            rowSelection={false}
            editable={false}
            toolbarFilters={{
                filters: <Filters filters={filters} />,
                form: formFilter, schema, wrapFormItem: true,
                onFinish: onFilterFinish, onValuesChange: onFilterChange
            }}
        //rowHeight={28}
        />
    </YScroll>);
}

const StyledSearch = styled(Search)`
    button{
        vertical-align:0px !important;
    },
    input{
        cursor:pointer;
    }
`;

const InternalForView = ({ forViewBorder, minHeight, forViewBackground, style, onDoubleClick, value, loading = false }) => {
    return (
        <div style={{ borderRadius: "3px", padding: "2px", ...forViewBorder && { border: "solid 1px #d9d9d9" }, display: "flex", alignItems: "center", minHeight, whiteSpace: "nowrap", ...forViewBackground && { background: "#f0f0f0" }, ...(style && style) }} {...onDoubleClick && { onDoubleClick }}>{value}{loading && <LoadingOutlined />}</div>
    );
}

export default React.forwardRef(({ data, onKeyDown, autoFocus = false, customSearch, rowHeight, forView, type = "modal", keyField, /* valueField, */textField, detailText, size = "middle", title, popupWidth = 600, popupHeight = 400, params, toolbar, filters = {}, moreFilters = {}, columns, onChange, onSelect, value, allowClear, load, onClear, style, ...rest }, ref) => {
    const dataAPI = useDataAPI(params);
    const classes = useStyles();
    const [internalValue, setInternalValue] = useState();
    const [modalParameters, setModalParameters] = useState({});
    const [loaded, setLoaded] = useState(false);
    const ctx = useContext(Context);
    const iRef = useRef();
    const initialized = useRef(0);
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = () => {
            return (<Popup {...modalParameters} />)
        }
        return (
            <ResponsiveModal type={modalParameters.type} responsive title={title} onCancel={() => { hideModal(); focus(); }} width={popupWidth} height={popupHeight} footer="ref" yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    const loadData = async () => {
        let _value = null;
        if (initialized.current == 1) {
            initialized.current = 2;
            setLoaded(false);
        }
        if (typeof value === "object") {
            _value = value;
            setLoaded(true);
            setInternalValue(_value);
        } else if (Array.isArray(params?.payload?.data?.rows)) {
            setLoaded(true);
            _value = params.payload.data.rows.find(v => {
                if (Array.isArray(keyField) && v[keyField[0]] === value) {
                    return v;
                } else {
                    if (v[keyField] === value) {
                        return v;
                    }
                }
            })
            setInternalValue(_value);
        } else if ((load && value && initialized.current === 2) || (load && value)) {
            dataAPI.addFilters({ idSelector: value }, false);

            setLoaded(false);
            const _data = await dataAPI.fetchPost();
            setLoaded(true);
            if (_data?.rows && _data.rows.length > 0) {
                _value = _data.rows[0];
            } else {
                _value = null;
            }
            setInternalValue(_value);
        }
        if (initialized.current == 0) {
            initialized.current = 1;
            setLoaded(true);
        }
    }

    const focus = () => {
        if (autoFocus) {
            if (!ref) {
                iRef.current.focus();
            } else {
                ref.current.focus();
            }
        }
    }

    useEffect(() => {
        focus();
    }, []);

    useEffect(() => {
        loadData();
    }, [value]);

    const _onKeyDown = (e) => {
        if (e.key === 'Enter') {
            onPopup();
        }
        if (typeof onKeyDown === "function") {
            onKeyDown(e);
        }
    }

    const onSelectRow = (row) => {
        if ("name" in rest) {
            ctx.updateFieldStatus(rest.name, {});
        }
        if (onSelect && typeof onSelect === 'function') {
            onSelect(row);
        }
        onChange(row);
        setInternalValue(row);
    }

    const onPopup = () => {
        setModalParameters({ params, title, filters, moreFilters, columns, onSelect: onSelectRow, toolbar, rowHeight, type })
        showModal();
    }

    const clear = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (onClear) {
            onClear();
        }
        onChange(null);
        setInternalValue(null);
    }

    return (
        <div style={{ ...style }}>
            {
                forView ?
                    <InternalForView value={(internalValue && textField in internalValue) && internalValue[textField]} size={size} loading={(load && !loaded)} {...rest} /> :
                    customSearch ? React.cloneElement(customSearch, { ...customSearch.props, value: (internalValue && textField in internalValue) && internalValue[textField], size, ...rest, onClick: onPopup, onKeyDown: _onKeyDown }) :
                        <div className={classes.inputContainer}>
                            <Input value={(internalValue && textField in internalValue) && internalValue[textField]} className={classes.input} style={{ cursor: "pointer" }} size={size} ref={ref ? ref : iRef} {...rest} onClick={onPopup} onKeyDown={_onKeyDown} readOnly /* {...(allowClear && internalValue && viewClear) && { suffix: <CloseCircleOutlined onClick={clear} style={{ cursor: "pointer" }} /> }} */
                                addonAfter={(load && !loaded) ? <LoadingOutlined /> : <SearchOutlined onClick={onPopup} style={{ cursor: "pointer" }} />} />

                            {(allowClear && internalValue) &&
                                (
                                    <div className={classes.clearButton} onClick={clear}>
                                        <CloseCircleFilled /* onClick={clear}  */style={{ cursor: "pointer",color:"gray" }} />
                                    </div>
                                )
                                //suffix: <CloseCircleOutlined onClick={clear} style={{ cursor: "pointer" }} />
                            }



                        </div>
                //<StyledSearch allowClear={allowClear} value={(internalValue && textField in internalValue) && internalValue[textField]} size={size} ref={ref} {...rest} onSearch={onPopup} onClick={onPopup} readOnly />
            }
            <div style={{ fontSize: "11px" }}>{((value && typeof detailText === 'function')) && detailText(internalValue)}</div>
        </div>
    );
});