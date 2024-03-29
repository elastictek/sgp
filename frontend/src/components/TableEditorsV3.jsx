import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import classNames from "classnames";
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting, sleep } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { useDataAPI } from "utils/useDataAPI";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Drawer, Badge, Checkbox } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
import { CheckCircleOutlined, DeleteOutlined, PlusOutlined, CopyOutlined, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, ReadOutlined, LockOutlined, DeleteFilled, PlusCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV3';
import uuIdInt from "utils/uuIdInt";
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import YScroll from 'components/YScroll';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, SwitchField, Label, SelectMultiField, AutoCompleteField, Chooser } from 'components/FormFields';
import { API_URL, DOSERS, TIME_FORMAT, BOBINE_DEFEITOS, BOBINE_ESTADOS, DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, FORMULACAO_MANGUEIRAS, JUSTIFICATION_OUT } from 'config';
import { Status } from '../pages/bobines/commons';
import IconButton from "components/iconButton";
import { Cuba, MetodoOwner, MetodoAging, EstadoBobine } from "./TableColumns";
import { CgCloseO } from 'react-icons/cg';
import { sha1 } from 'crypto-hash';
import { json, orderObjectKeys } from "utils/object"
import { Clientes } from "./EditorsV3";

const focus = (el, h,) => { el?.focus(); };

export const InputTableEditor = ({ dataAPI, inputProps, ...props }) => {
    const onChange = async (v) => {
        props.onChange(v?.target?.value === '' ? null : v?.target?.value);
    };
    const onComplete = (v) => {
        props.onComplete(v === '' ? null : v);
    }
    const onKeyDown = (e) => {
        if (e.key == 'Escape') {
            props.onCancel();
        }
        if (e.key == 'Tab' || e.key == "Enter") {
            e.preventDefault();
            e.stopPropagation();
            props.onTabNavigation(
                true /*complete navigation?*/,
                e.shiftKey ? -1 : 1 /*backwards of forwards*/
            );
        }
    }
    return (<Input onKeyDown={onKeyDown}
        autoFocus
        value={props?.value}
        onChange={onChange}
        onBlur={onComplete}
        style={{ width: "100%" }}
        {...inputProps}
    />);
}

export const InputNumberTableEditor = ({ dataAPI, inputProps, ...props }) => {
    const onChange = async (v) => {
        props.onChange(v === '' ? null : v);
    };
    const onComplete = (v) => {
        props.onComplete(v === '' ? null : v);
    }
    const onKeyDown = (e) => {
        if (e.key == 'Escape') {
            props.onCancel();
        }
        if (e.key == 'Tab' || e.key == "Enter") {
            e.preventDefault();
            e.stopPropagation();
            props.onTabNavigation(
                true /*complete navigation?*/,
                e.shiftKey ? -1 : 1 /*backwards of forwards*/
            );
        }
    }
    return (<InputNumber onKeyDown={onKeyDown}
        autoFocus
        value={props?.value}
        onChange={onChange}
        onBlur={onComplete}
        style={{ width: "100%" }}
        {...inputProps}
    />);
}

export const BooleanTableEditor = ({ dataAPI, selectProps, checkbox = true, checkBoxProps, ...props }) => {
    const selected = useRef(false);
    const onChange = async (v) => {
        let _value = v;
        if (checkbox) {
            if (!v.target.checked) {
                _value = 0;
            } else {
                _value = 1;
            }
        }
        props.onChange(_value === '' ? null : _value);
        await sleep(300);
        props.onComplete(_value === '' ? null : _value);
    };
    const onComplete = (v) => {
        props.onComplete(v === '' ? null : v);
    }
    const onSelect = (v) => {
        selected.current = true;
        props.onChange(v === '' ? null : v);
    };
    const onKeyDown = (e) => {
        if (e.key == 'Tab' || e.key == 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!selected.current) {
                props.onTabNavigation(
                    true /*complete navigation?*/,
                    e.shiftKey ? -1 : 1 /*backwards of forwards*/
                );
            }
            selected.current = false;
        }
    }

    const onClick = (e)=>{
        e.preventDefault();
        e.stopPropagation();
    }

    return (<>
        {checkbox ? <div style={{ display: "flex", flex: 1 }}><div><Checkbox
            onKeyDown={onKeyDown}
            autoFocus
            checked={props?.value}
            onChange={onChange}
            onClick={onClick}
            //onBlur={onComplete}
            {...checkBoxProps}
        /></div></div> : <Select
            onKeyDown={onKeyDown}
            autoFocus
            options={[{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }]}
            value={props?.value}
            onChange={onChange}
            onBlur={onComplete}
            style={{ width: "100%" }}
            {...selectProps}
        />
        }
    </>
    );
}

export const StatusApprovalTableEditor = ({ dataAPI, selectProps, allowed = [-1, 0, 1], genre = "m", ...props }) => {
    const selected = useRef(false);
    const onChange = async (v) => {
        let _value = v;
        props.onChange(_value === '' ? null : _value);
        await sleep(300);
        props.onComplete(_value === '' ? null : _value);
    };
    const onComplete = (v) => {
        props.onComplete(v === '' ? null : v);
    }
    const onSelect = (v) => {
        selected.current = true;
        props.onChange(v === '' ? null : v);
    };
    const onKeyDown = (e) => {
        if (e.key == 'Tab' || e.key == 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!selected.current) {
                props.onTabNavigation(
                    true /*complete navigation?*/,
                    e.shiftKey ? -1 : 1 /*backwards of forwards*/
                );
            }
            selected.current = false;
        }
    }

    return (

        <Select
            onKeyDown={onKeyDown}
            autoFocus
            options={[
                ...allowed.includes(-1) ? [{ value: -1, label: `Obsolet${genre === "m" ? "o" : "a"}` }] : [],
                ...allowed.includes(0) ? [{ value: 0, label: `Em Elaboração` }] : [],
                ...allowed.includes(1) ? [{ value: 1, label: `Em Standby` }] : [],
                ...allowed.includes(2) ? [{ value: 2, label: `Aprovad${genre === "m" ? "o" : "a"}` }] : [],
            ]}
            value={props?.value}
            onChange={onChange}
            onBlur={onComplete}
            popupMatchSelectWidth={false}
            style={{ width: "100%" }}
            {...selectProps}
        />
    );
}

export const StatusTableEditor = ({ dataAPI, selectProps, checkBoxProps, allowed = [0, 1], genre = "m", checkbox = false, ...props }) => {
    const selected = useRef(false);
    const onChange = async (v) => {
        let _value = v;
        if (checkbox) {
            if (!v.target.checked) {
                _value = 0;
            } else {
                _value = 1;
            }
        }
        props.onChange(_value === '' ? null : _value);
        await sleep(300);
        props.onComplete(_value === '' ? null : _value);
    };
    const onComplete = (v) => {
        props.onComplete(v === '' ? null : v);
    }
    const onSelect = (v) => {
        selected.current = true;
        props.onChange(v === '' ? null : v);
    };
    const onKeyDown = (e) => {
        if (e.key == 'Tab' || e.key == 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!selected.current) {
                props.onTabNavigation(
                    true /*complete navigation?*/,
                    e.shiftKey ? -1 : 1 /*backwards of forwards*/
                );
            }
            selected.current = false;
        }
    }

    const onClick = (e)=>{
        e.preventDefault();
        e.stopPropagation();
    }

    return (<>
        {checkbox ? <div style={{ display: "flex", flex: 1 }}><div><Checkbox
            onKeyDown={onKeyDown}
            autoFocus
            checked={props?.value}
            onChange={onChange}
            onClick={onClick}
            //onBlur={onComplete}
            {...checkBoxProps}
        /></div></div> :
            <Select
                onKeyDown={onKeyDown}
                autoFocus
                options={[
                    ...allowed.includes(0) ? [{ value: 0, label: `Inativ${genre === "m" ? "o" : "a"}` }] : [],
                    ...allowed.includes(1) ? [{ value: 1, label: `Ativ${genre === "m" ? "o" : "a"}` }] : [],
                    ...allowed.includes(9) ? [{ value: 9, label: `Finalizad${genre === "m" ? "o" : "a"}` }] : [],
                ]}
                value={props?.value}
                onChange={onChange}
                onBlur={onComplete}
                style={{ width: "100%" }}
                {...selectProps}
            />}
    </>
    );
}

export const MetodoOwnerTableEditor = ({ dataAPI, selectProps, ...props }) => {
    const selected = useRef(false);
    const onChange = async (v) => {
        props.onChange(v === '' ? null : v);
        await sleep(300);
        props.onComplete(v === '' ? null : v);
    };
    const onComplete = (v) => {
        props.onComplete(v === '' ? null : v);
    }
    const onSelect = (v) => {
        selected.current = true;
        props.onChange(v === '' ? null : v);
    };
    const onKeyDown = (e) => {
        if (e.key == 'Tab' || e.key == 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!selected.current) {
                props.onTabNavigation(
                    true /*complete navigation?*/,
                    e.shiftKey ? -1 : 1 /*backwards of forwards*/
                );
            }
            selected.current = false;
        }
    }

    return (<>
        <Select
            onKeyDown={onKeyDown}
            autoFocus
            options={[
                { value: 0, label: "Elastictek" },
                { value: 1, label: "Cliente" }
            ]}
            value={props?.value}
            onChange={onChange}
            onBlur={onComplete}
            style={{ width: "100%" }}
            {...selectProps}
        />
    </>
    );
}

export const MetodoTipoTableEditor = ({ dataAPI, selectProps, ...props }) => {
    const selected = useRef(false);
    const onChange = async (v) => {
        props.onChange(v === '' ? null : v);
        await sleep(300);
        props.onComplete(v === '' ? null : v);
    };
    const onComplete = (v) => {
        props.onComplete(v === '' ? null : v);
    }
    const onSelect = (v) => {
        selected.current = true;
        props.onChange(v === '' ? null : v);
    };
    const onKeyDown = (e) => {
        if (e.key == 'Tab' || e.key == 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!selected.current) {
                props.onTabNavigation(
                    true /*complete navigation?*/,
                    e.shiftKey ? -1 : 1 /*backwards of forwards*/
                );
            }
            selected.current = false;
        }
    }

    const onClick = (e)=>{
        e.preventDefault();
        e.stopPropagation();
    }

    return (<>
        <Select
            onClick={onClick}
            onKeyDown={onKeyDown}
            autoFocus
            options={[
                { value: "gramagem", label: "Gramagem" },
                { value: "peel", label: "Peel" },
                { value: "traction", label: "Tração" },
                { value: "histerese", label: "Histerese" }
            ]}
            value={props?.value}
            onChange={onChange}
            onBlur={onComplete}
            style={{ width: "100%" }}
            {...selectProps}
        />
    </>
    );
}

export const MetodoModeTableEditor = ({ dataAPI, selectProps, ...props }) => {
    const selected = useRef(false);
    const onChange = async (v) => {
        props.onChange(v === '' ? null : v);
        await sleep(300);
        props.onComplete(v === '' ? null : v);
    };
    const onComplete = (v) => {
        props.onComplete(v === '' ? null : v);
    }
    const onSelect = (v) => {
        selected.current = true;
        props.onChange(v === '' ? null : v);
    };
    const onKeyDown = (e) => {
        if (e.key == 'Tab' || e.key == 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!selected.current) {
                props.onTabNavigation(
                    true /*complete navigation?*/,
                    e.shiftKey ? -1 : 1 /*backwards of forwards*/
                );
            }
            selected.current = false;
        }
    }
    
    const onClick = (e)=>{
        e.preventDefault();
        e.stopPropagation();
    }

    return (<>
        <Select
            onClick={onClick}
            onKeyDown={onKeyDown}
            autoFocus
            options={[
                { value: "simples", label: "Simples" },
                { value: "controle", label: "Controle" },
                { value: "cíclico", label: "Cíclico" }
            ]}
            value={props?.value}
            onChange={onChange}
            onBlur={onComplete}
            style={{ width: "100%" }}
            {...selectProps}
        />
    </>
    );
}


export const ObsTableEditor = ({ dataAPI, inputProps, ...props }) => {
    const [visible, setVisible] = useState(true);
    const onChange = async (v) => {
        props.onChange(v?.target?.value === '' ? null : v?.target?.value);
    };
    const onComplete = (v) => {
        props.onComplete();
        setVisible(false);
    }
    const onKeyDown = (e) => {
        if (e.key == 'Escape') {
            props.onCancel();
        }
        if (e.key == 'Tab' || e.key == "Enter") {
            e.preventDefault();
            e.stopPropagation();
            props.onTabNavigation(
                true /*complete navigation?*/,
                e.shiftKey ? -1 : 1 /*backwards of forwards*/
            );
        }
    }

    const onCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setVisible(false);
        props.onCancel();
    };


    /**
     * 
     *     <Input onKeyDown={onKeyDown}
            autoFocus
            value={props?.value}
            onChange={onChange}
            onBlur={onComplete}
            style={{ width: "100%" }}
            {...inputProps}
        />
     * 
     * 
     */

    return (

        <Drawer push={false} /* title={title} */ open={visible} destroyOnClose onClose={onCancel} width="550px"
            extra={<Space><Button onClick={onCancel}>Cancelar</Button><Button onClick={onComplete} type="primary">Confirmar</Button></Space>}>
            <TextArea autoSize={{ minRows: 4, maxRows: 12 }} autoFocus value={props?.value} onChange={onChange} onKeyDown={e => (e.key === 'Enter') && e.stopPropagation()} {...inputProps} />
        </Drawer>



    );
}

export const FieldSelectorEditor = ({ dataAPI, selectorProps, onSelect, ...props }) => {
    const onChange = async (v) => {
        props.onChange(v === '' ? null : v);
        await sleep(300);
        props.onComplete();
    };
    const onComplete = () => {
        props.onComplete();
    }
    // const onSelect = (v) => {
    //     props.onChange(v === '' ? null : v);
    // };
    const onKeyDown = async (e) => {
        if (e.key == 'Escape') {
            props.onCancel();
        }
        if (e.key == 'Tab') {
            e.preventDefault();
            e.stopPropagation();
            await onChange(selectorProps?.value);
            //props.onCancel();
            props.onTabNavigation(
                true /*complete navigation?*/,
                e.shiftKey ? -1 : 1 /*backwards of forwards*/
            );
        }
    }
    return (<>
        <Selector
            onKeyDown={onKeyDown}
            autoFocus
            value={selectorProps?.value}
            onChange={onChange}
            style={{ width: "100%" }}
            {...selectorProps}
        />
    </>
    );
}

export const MateriasPrimasTableEditor = ({ type, ...props }) => {
    return (
        <FieldSelectorEditor {...props}
            selectorProps={{
                value: { ITMREF_0: props?.cellProps?.data?.matprima_cod, ITMDES1_0: props?.cellProps?.data?.matprima_des },
                title: "Matéria Prima",
                params: { payload: { url: `${API_URL}/materiasprimas/sql/`, parameters: { method: "MateriasPrimasLookup", type }, pagination: { enabled: true, limit: 15 }, filter: {}, sort: [] } },
                keyField: ["ITMREF_0"],
                textField: "ITMDES1_0",
                columns: [
                    { key: 'ITMREF_0', name: 'Código', width: 160 },
                    { key: 'ITMDES1_0', name: 'Designação' }
                ],
                filters: { fmulti_artigo: { type: "any", width: 150, text: "Artigo", autoFocus: true } },
                moreFilters: {}
            }} />
    )
}

export const CubaTableEditor = ({ type, onSelect, ...props }) => {
    const [showModal, setModal] = useState(true);
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ payload: { url: ``, primaryKey: "key", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });

    const _onSelect = async ({ rowProps, closeSelf }) => {
        if (typeof onSelect === "function") {
            await onSelect({ rowProps, closeSelf });
        } else {
            props.onChange(rowProps.data?.key);
            await sleep(300);
            props.onComplete(rowProps.data?.key);
        }
        //closeSelf();
    }

    //     const _onMultiSelect = async ({ data, closeSelf }) => {       
    //     if (typeof onSelect === "function") {
    //         await onSelect({ data, closeSelf });
    //     } else {
    //         props.onChange(data);
    //         await sleep(300);
    //         props.onComplete(data);
    //     }
    //     //closeSelf();
    // }

    const getOptions = () => {
        return FORMULACAO_CUBAS;
    }

    return (
        <ResponsiveModal open={showModal} title="Cubas" type="drawer" push={false} onCancel={() => setModal(false)} width={"400px"} height={null} footer="ref" extra="ref" yScroll>
            <Chooser parameters={{
                multipleSelection: false,
                settings: false,
                toolbar: false,
                toolbarFilters: false,
                data: getOptions(),
                payload: { payload: { url: ``, primaryKey: "key", parameters: { ...defaultParameters }, pagination: { enabled: false, limit: 50 }, filter: {}, sort: [] } },
                columns: [
                    { name: "key", header: 'Cuba', flex: 1, render: ({ cellProps, data }) => <Cuba value={data?.key} /> }
                ],
                onSelect: _onSelect

            }} />
        </ResponsiveModal>
    )
}

export const EstadoTableEditor = ({ type, onSelect, filter, ...props }) => {
    const [showModal, setModal] = useState(true);
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ payload: { url: ``, primaryKey: "value", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });

    const _onSelect = async ({ rowProps, closeSelf }) => {
        if (typeof onSelect === "function") {
            await onSelect({ rowProps, closeSelf });
        } else {
            props.onChange(rowProps.data?.value);
            await sleep(300);
            props.onComplete(rowProps.data?.value);
        }
        //closeSelf();
    }

    //     const _onMultiSelect = async ({ data, closeSelf }) => {       
    //     if (typeof onSelect === "function") {
    //         await onSelect({ data, closeSelf });
    //     } else {
    //         props.onChange(data);
    //         await sleep(300);
    //         props.onComplete(data);
    //     }
    //     //closeSelf();
    // }

    const getOptions = () => {
        if (filter) {
            return BOBINE_ESTADOS.filter(v => filter(v));
        }
        return BOBINE_ESTADOS;
    }

    return (
        <ResponsiveModal open={showModal} title="Estado" type="drawer" push={false} onCancel={() => setModal(false)} width={"400px"} height={null} footer="ref" extra="ref" yScroll>
            <Chooser parameters={{
                multipleSelection: false,
                settings: false,
                toolbar: false,
                toolbarFilters: false,
                data: getOptions(),
                payload: { payload: { url: ``, primaryKey: "value", parameters: { ...defaultParameters }, pagination: { enabled: false, limit: 50 }, filter: {}, sort: [] } },
                columns: [
                    { name: "value", header: 'Estado', flex: 1, render: ({ cellProps, data }) => <EstadoBobine estado={data?.value} /> }
                ],
                onSelect: _onSelect

            }} />
        </ResponsiveModal>
    )
}

export const DoserTableEditor = ({ type, joinbc, onSelect, ...props }) => {
    const key = "key";
    const [showModal, setModal] = useState(true);
    const defaultFilters = {};
    const defaultParameters = {};
    const defaultSort = [];
    const dataAPI = useDataAPI({ payload: { url: ``, primaryKey: "key", parameters: defaultParameters, pagination: { enabled: false }, filter: defaultFilters } });

    // const _onSelect = async ({ rowProps, closeSelf }) => {       
    //     if (typeof onSelect === "function") {
    //         await onSelect({ rowProps, closeSelf });
    //     } else {
    //         props.onChange(rowProps.data?.[key]);
    //         await sleep(300);
    //         props.onComplete(rowProps.data?.[key]);
    //     }
    //     //closeSelf();
    // }

    const _onMultiSelect = async ({ data, closeSelf }) => {
        if (typeof onSelect === "function") {
            await onSelect({ data, closeSelf });
        } else {
            props.onChange(data.join(","));
            await sleep(300);
            props.onComplete(data.join(","));
        }
        //closeSelf();
    }

    const getOptions = () => {
        const _extrusora = props.cellProps.data.extrusora;
        if (_extrusora === "A") {
            return FORMULACAO_MANGUEIRAS.A;
        }
        if (_extrusora === "B" && !joinbc) {
            return FORMULACAO_MANGUEIRAS.B;
        }
        if (_extrusora === "C" && !joinbc) {
            return FORMULACAO_MANGUEIRAS.C;
        }
        return FORMULACAO_MANGUEIRAS.BC;
    }

    return (
        <ResponsiveModal open={showModal} title="Doseadores" type="drawer" push={false} onCancel={() => setModal(false)} width={"400px"} height={null} footer="ref" extra="ref" yScroll>
            <Chooser parameters={{
                multipleSelection: true,
                toolbarFilters: false,
                settings: false,
                toolbar: false,
                data: getOptions(),
                payload: { payload: { url: ``, primaryKey: "key", parameters: { ...defaultParameters }, pagination: { enabled: false, limit: 50 }, filter: {}, sort: [] } },
                columns: [
                    { name: "key", header: 'Doseador', flex: 1 }
                ],
                onSelect: _onMultiSelect

            }} />
        </ResponsiveModal>
    )
}

const fetchArtigosCompativeisGroups = async ({ value, groups, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/artigos/sql/`, parameters: { method: "ArtigosCompativeisGroupsLookup" }, pagination: { limit: 20 }, filter: { group: getFilterValue(value, 'any') }, signal });
    if (!groups || groups.length === 0) {
        return rows;
    } else {
        const r = [...rows];
        groups.forEach(el => { if (!r.some(v => v.group === el)) { r.push({ group: el }); } });
        return r;
    }
}
export const ArtigosCompativeisGroupEditor = ({ dataAPI, ...props }) => {
    const selected = useRef(false);
    const onChange = (v) => {
        props.onChange(v === '' ? null : v);
    };
    const onComplete = (v) => {
        props.onComplete(v === '' ? null : v);
    }
    const onSelect = (v) => {
        selected.current = true;
        props.onChange(v === '' ? null : v);
    };
    const onKeyDown = (e) => {
        if (e.key == 'Tab' || e.key == 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!selected.current) {
                props.onTabNavigation(
                    true /*complete navigation?*/,
                    e.shiftKey ? -1 : 1 /*backwards of forwards*/
                );
            }
            selected.current = false;
        }
    }
    return (
        <AutoCompleteField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={props.value} ref={focus} onSelect={onSelect} onChange={onChange} onBlur={onComplete}
            onKeyDown={onKeyDown}
            size="small"
            keyField="group"
            textField="group"
            showSearch
            showArrow
            allowClear
            fetchOptions={async (value) => await fetchArtigosCompativeisGroups({ value, groups: dataAPI.dirtyRows().map(v => v?.group) })}
        />
    );
}

const fetchLabParametersUnit = async ({ value, units, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/qualidade/sql/`, parameters: { method: "LabParametersUnitLookup" }, pagination: { limit: 20 }, filter: { unit: getFilterValue(value, 'any') }, signal });
    if (!units || units.length === 0) {
        return rows;
    } else {
        const r = [...rows];
        units.forEach(el => { if (!r.some(v => v.unit === el)) { r.push({ unit: el }); } });
        return r;
    }
}
export const LabParametersUnitEditor = ({ dataAPI, ...props }) => {
    const selected = useRef(false);
    const onChange = (v) => {
        props.onChange(v === '' ? null : v);
    };
    const onComplete = (v) => {
        props.onComplete(v === '' ? null : v);
    }
    const onSelect = (v) => {
        selected.current = true;
        props.onChange(v === '' ? null : v);
    };
    const onKeyDown = (e) => {
        if (e.key == 'Tab' || e.key == 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!selected.current) {
                props.onTabNavigation(
                    true /*complete navigation?*/,
                    e.shiftKey ? -1 : 1 /*backwards of forwards*/
                );
            }
            selected.current = false;
        }
    }
    return (
        <AutoCompleteField defaultOpen={true} bordered={false} style={{ width: "100%" }} value={props.value} ref={focus} onSelect={onSelect} onChange={onChange} onBlur={onComplete}
            onKeyDown={onKeyDown}
            size="small"
            keyField="unit"
            textField="unit"
            showSearch
            showArrow
            allowClear
            fetchOptions={async (value) => await fetchLabParametersUnit({ value, units: dataAPI.dirtyRows().map(v => v?.unit) })}
        />
    );
}

export const ClientesTableEditor = ({ ...props }) => {

    return (<FieldSelectorEditor
        {...props}
        selectorProps={{
            title: "Clientes",
            value: { BPCNUM_0: props?.cellProps?.data?.cliente_cod, BPCNAM_0: props?.cellProps?.data?.cliente_nome },
            params: { payload: { url: `${API_URL}/artigos/sql/`, parameters: { method: "ClientesLookup" }, pagination: { enabled: true, pageSize: 15 }, filter: {}, sort: [] } },
            keyField: ["BPCNUM_0"],
            textField: "BPCNAM_0",
            /* detailText: r => r?.BPCNUM_0, */
            columns: [
                { key: 'BPCNUM_0', name: 'Cód', width: 160 },
                { key: 'BPCNAM_0', name: 'Nome' }
            ],
            filters: { fmulti_customer: { type: "any", width: 150, text: "Cliente", autoFocus: true } },
            moreFilters: {}
        }}
    />)
}

export const SalesPriceProdutosTableEditor = ({ ...props }) => {
    return (<>{props?.cellProps?.data?.cliente_cod ? <FieldSelectorEditor
        {...props}
        selectorProps={{
            title: "Produtos",
            value: { produto: props?.cellProps?.data?.produto, gsm: props?.cellProps?.data?.gsm },
            params: { payload: { url: `${API_URL}/artigos/sql/`, parameters: { method: "SalesPriceProdutosLookup" }, pagination: { enabled: false, limit: 100 }, filter: { cliente_cod: props?.cellProps?.data?.cliente_cod }, sort: [] } },
            keyField: ["produto"],
            textField: "produto",
            /* detailText: r => r?.BPCNUM_0, */
            columns: [
                { key: 'produto', name: 'Produto' },
                { key: 'gsm_des', name: 'Gsm', width: 160 }
            ],
            filters: { /* fmulti_customer: { type: "any", width: 150, text: "Cliente", autoFocus: true } */ },
            moreFilters: {}
        }}
    /> : <></>}</>)
}

export const ArtigosTableEditor = ({ ...props }) => {

    return (<FieldSelectorEditor
        {...props}
        selectorProps={{
            value: { artigo_id: props?.cellProps?.data?.artigo_id, des: props?.cellProps?.data?.des, cod: props?.cellProps?.data?.cod },
            title: "Artigo",
            params: { payload: { url: `${API_URL}/artigos/sql/`, parameters: { method: "ArtigosLookup" }, pagination: { enabled: true }, filter: {}, sort: [] } },
            keyField: ["id"],
            textField: "des",
            // detailText={r => r?.cod}
            columns: [
                { key: 'cod', name: 'Cód', width: 160 },
                { key: 'des', name: 'Nome' }
            ],
            filters: { fartigo: { type: "any", width: 150, text: "Artigo", autoFocus: true } },
            moreFilters: {}
        }}
    />)
}

export const LabMetodosTableEditor = ({ ...props }) => {

    return (<FieldSelectorEditor
        {...props}
        selectorProps={{
            value: { lab_metodo_id: props?.cellProps?.data?.lab_metodo_id, designacao: props?.cellProps?.data?.metodo_designacao },
            title: "Métodos de Testagem",
            params: { payload: { url: `${API_URL}/qualidade/sql/`, parameters: { method: "ListLabMetodos" }, pagination: { enabled: true }, filter: {}, sort: [] } },
            keyField: ["id"],
            textField: "designacao",
            // detailText={r => r?.cod}
            columns: [
                { key: 'designacao', name: 'Designação' },
                { key: 'owner', header: 'Owner', render: ({ data, cellProps }) => <MetodoOwner cellProps={cellProps} value={data?.owner} />, userSelect: true, defaultLocked: false, width: 110, headerAlign: "center" },
                { key: 'aging', header: 'Aging', render: ({ data, cellProps }) => <MetodoAging cellProps={cellProps} value={data?.aging} />, userSelect: true, defaultLocked: false, width: 120, headerAlign: "center" },

            ],
            filters: { fdes: { type: "any", width: 150, text: "Designação", autoFocus: true } },
            moreFilters: {}
        }}
    />)
}

export const NwTableEditor = ({ ...props }) => {
    return (<FieldSelectorEditor
        {...props}
        selectorProps={{
            value: { artigo_id: props?.cellProps?.data?.artigo_id, des: props?.cellProps?.data?.des, cod: props?.cellProps?.data?.cod },
            title: "Nonwovens",
            params: { payload: { url: `${API_URL}/materiasprimas/sql/`, parameters: { type:"nonwovens", method: "MateriasPrimasLookup" }, pagination: { enabled: true }, filter: {}, sort: [] } },
            keyField: ["ITMREF_0"],
            textField: "ITMDES1_0",
            // detailText={r => r?.cod}
            columns: [
                { key: 'ITMREF_0', name: 'Cód', width: 160 },
                { key: 'ITMDES1_0', name: 'Nome' }
            ],
            filters: { fmulti_artigo: { type: "any", width: 150, text: "Artigo", autoFocus: true } },
            moreFilters: {}
        }}
    />)
}

export const NwQueueTableEditor = ({ filters, ...props }) => {
    return (
        <FieldSelectorEditor {...props}
            selectorProps={{
                popupWidth: 700,
                value: { vcr_num: (filters?.type == 0) ? props?.cellProps?.data?.vcr_num_inf : props?.cellProps?.data?.vcr_num_sup, n_lote: (filters?.type == 0) ? props?.cellProps?.data?.lotenwinf : props?.cellProps?.data?.lotenwsup },
                title: "Lotes de Nonwovens",
                params: { payload: { url: `${API_URL}/materiasprimas/sql/`, parameters: { method: "ListNwQueue" }, pagination: { enabled: true, limit: 15 }, filter: { ...filters }, sort: [] } },
                keyField: ["vcr_num"],
                textField: "n_lote",
                columns: [
                    { key: 'artigo_cod', name: 'Artigo', width: 160 },
                    { key: 'artigo_des', name: 'Designação', width: 160 },
                    { key: 'n_lote', name: 'Lote', width: 160 },
                    { key: 'vcr_num', name: 'Movimento', width: 160 }
                ],
                filters: {},
                moreFilters: {}
            }} />
    )
}
