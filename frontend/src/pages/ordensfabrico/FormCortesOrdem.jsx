import React, { useEffect, useState, useCallback, useRef, useContext, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { json } from "utils/object";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import IconButton from "components/iconButton";
import ResultMessage from 'components/resultMessage';
import { useSubmitting } from "utils";
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, Menu, Dropdown } from "antd";
import { EllipsisOutlined, EditOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useImmer } from "use-immer";
import { AppContext } from "app";

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const colors = [
    { bcolor: '#002766', color: '#ffffff' }, { bcolor: '#0050b3', color: '#ffffff' }, { bcolor: '#1890ff', color: '#000000' },
    { bcolor: '#69c0ff', color: '#000000' }, { bcolor: '#bae7ff', color: '#000000' }, { bcolor: '#ffffff', color: '#000000' }
];

const useStyles = createUseStyles({
    bobine: {
        ...(props) => props.forInput && { cursor: "move" },
        height: (props) => props.height ? props.height : "120px",
        padding: "3px",
        width: (props) => `${props.width}%`,
        minWidth: "34px",
        '& .inner': {
            border: "solid 1px #bfbfbf",
            boxShadow: "2px 1px 2px #f0f0f0",
            borderRadius: "3px",
            height: "100%",
            '&:hover': {
                backgroundColor: "#e6f7ff"
            }
        },
    }
})

const Bobine = ({ id, value, index, moveBobine, onClick, width = 0, forInput = false, larguras, height, selected }) => {
    const classes = useStyles({ width, forInput, height });
    const ref = useRef(null);
    const [color, setColor] = useState(colors[larguras.indexOf(parseInt(value))]);

    const [{ handlerId }, drop] = useDrop({
        accept: 'bobine',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        drop(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) {
                return;
            }
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            moveBobine(dragIndex, hoverIndex);
            item.index = hoverIndex;
        }
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'bobine',

        item: () => {
            return { id, index };
        },
        canDrag(monitor) {
            return forInput;
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0 : 1;
    drag(ref);
    drop(ref);
    return (
        <div ref={ref} className={classes.bobine} data-handler-id={handlerId}>
            <div className="inner" style={{ opacity, background: selected ? "#fa8c16" : color.bcolor, color: selected ? "#000" : color.color }} onClick={() => onClick && onClick(id, index, value)}>
                <div style={{ fontWeight: selected ? 900 : 400, fontSize: selected ? "16px" : "10px", textAlign: "center", height: "10%" }}>{index + 1}</div>
                <div style={{
                    color: color.color,
                    fontStyle: "italic",
                    height: "70%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>{value}</div>
            </div>
        </div>
    );
}

const loadCortesOrdemLookup = async ({ acs_id, cs_id, cortesordem_id, agg_of_id, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "CortesOrdemLookup" }, filter: { agg_of_id, acs_id, cs_id, cortesordem_id }, sort: [], signal });
    return rows;
}
const loadCortesTestLookup = async ({ acs_id, cs_id, cortesordem_id, agg_of_id,use_cs_id, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "CortesTestLookup" }, filter: { use_cs_id,agg_of_id, acs_id, cs_id, cortesordem_id }, sort: [], signal });
    return rows;
}

export default ({ onChangeCortesOrdem, forInput = true, height, parameters, operationsRef }) => {
    const [form] = Form.useForm();
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const submitting = useSubmitting(true);
    const { openNotification } = useContext(AppContext);
    const [state, updateState] = useImmer({
        larguraTotal: 0,
        idx: null,
        larguras: null,
        largurasTxt: null,
        cortesTest: null,
        bobines: [],
        cortesChoose: false
    });


    const init = async () => {
        if (parameters?.cortesordem_id || parameters?.acs_id || parameters?.cs_id || parameters?.agg_of_id) {
            const _rows = await loadCortesOrdemLookup({ acs_id: parameters?.acs_id, cs_id: parameters?.cs_id, cortesordem_id: parameters?.cortesordem_id, agg_of_id: parameters?.agg_of_id });
            let _cortes_test = parameters?.cortes_test?.cortes;
            if (!parameters?.cortes_test?.cortes) {
                _cortes_test = await loadCortesTestLookup({ use_cs_id:parameters?.use_cs_id, acs_id: parameters?.acs_id, cs_id: parameters?.cs_id, cortesordem_id: parameters?.cortesordem_id, agg_of_id: parameters?.agg_of_id });
                if (_cortes_test && _cortes_test.length>0){
                    _cortes_test = json(_cortes_test[0].cortes_test)?.cortes;
                }else{
                    _cortes_test = null;
                }
            }
            updateState(draft => {
                draft.bobines = json(_rows[0].largura_ordem);
                draft.larguraTotal = _rows[0].largura_util;
                draft.idx = null;
                draft.largurasTxt = _rows[0].largura_json.replace("{", "[").replace("}", "]").replace(":", "x");
                draft.larguras = Object.keys(json(_rows[0].largura_json)).map(Number);
                draft.cortesTest = _cortes_test;
                draft.cortesChoose = false;
            });
        } else {
            /* const { cortesOrdem, ...rest } = record;
            console.log("CORTES-ORDEM--->", cortesOrdem)
            const _bobines = [];
            let _larguraTotal = 0;
            if (!cortesOrdem) {
                for (const [k, v] of Object.entries(rest.n_cortes)) {
                    _bobines.push(...(new Array(v)).fill(k));
                    _larguraTotal = _larguraTotal + parseInt(v) * parseInt(k);
                }
            } else {
                // const _cortesOrdem = JSON.parse(cortesOrdem.largura_ordem);
                // _bobines.push(..._cortesOrdem);
                // form.setFieldsValue({ designacao: cortesOrdem.designacao });
                // _larguraTotal = _cortesOrdem.reduce((sum, v) => Number(sum) + Number(v));
            } */
            updateState(draft => {
                draft.bobines = parameters?.selected?.cortes_ordem;
                draft.larguraTotal = parameters?.selected?.largura_util;
                draft.idx = parameters?.selected?.idx;
                draft.largurasTxt = null;
                draft.larguras = parameters?.larguras;
                draft.cortesTest = parameters?.cortes_test?.cortes;
                draft.cortesChoose = false;
            });
        }
        submitting.end();
    }

    useEffect(() => {
        init();
    }, [JSON.stringify(parameters?.selected), parameters?.cortesordem_id, JSON.stringify(parameters?.cortes_test?.cortes), parameters?.acs_id, parameters?.cs_id]);

    const onSave = async () => {
        submitting.trigger();
        let response = null;
        try {
            response = await fetchPost({
                url: `${API_URL}/ordensfabrico/sql/`, filter: {
                    cortes_plan: parameters?.cortes_plan, cs_id: parameters?.cs_id, agg_of_id: parameters?.agg_of_id,
                    cortesordem_id: parameters?.cortesordem_id
                }, parameters: {
                    method: "SaveCortesTest", cortes: state.cortesTest
                }
            });
            if (response?.data?.status == "error") {
                openNotification(response?.data?.status, 'top', "Notificação", response?.data?.title, null);
            } else {
                updateState(draft => { draft.cortesChoose = false; });
            }
        }
        catch (e) {
            console.log(e)
            openNotification("error", 'top', "Notificação", e.message, null);
        }
        submitting.end();
    }

    const moveBobine = useCallback((dragIndex, hoverIndex) => {
        const _b = [...state.bobines];
        const tmp = _b[hoverIndex];
        _b[hoverIndex] = _b[dragIndex];
        _b[dragIndex] = tmp;
        updateState(draft => {
            draft.bobines = _b;
        });
        onChangeCortesOrdem(idx, _b);
    }, [state.bobines]);

    const onChooseTest = (id, index, value) => {
        updateState(draft => {
            let _newTests = [];
            if (draft.cortesTest.includes(index + 1)) {
                _newTests = draft.cortesTest.filter(item => item !== index + 1);
            } else {
                _newTests = [...draft.cortesTest, index + 1];
            }
            draft.cortesTest = _newTests.sort((a, b) => a - b);
        });
    }

    const onCortesChoose = (v) => {
        updateState(draft => {
            draft.cortesChoose = v;
        });
    }

    return (
        <>
            <div style={{ display: "flex" }}><div style={{ fontWeight: 700 }}>{state.largurasTxt}</div><div style={{ marginLeft: "20px" }}>Largura Útil:</div><div style={{ marginLeft: "2px", fontWeight: 700 }}>{state.larguraTotal}mm</div></div>
            <DndProvider backend={HTML5Backend}>
                <div style={{ display: "flex", flexDirection: "row", /* justifyContent: "space-around", */flexWrap: "wrap" }}>
                    {state.bobines && state.bobines.map((v, i) => {
                        return (<Bobine selected={state.cortesTest?.includes(i + 1)} key={`b-${v}.${i}`} id={`b-${v}.${i}`} value={v} index={i} {...state.cortesChoose && { onClick: onChooseTest }} moveBobine={moveBobine} width={(v * 100) / state.larguraTotal} larguras={state.larguras} forInput={forInput} height={height} />);
                    })}
                </div>
            </DndProvider>
            {operationsRef && <Portal elId={operationsRef.current}>
                <Space>
                    {(!state.cortesChoose && !submitting.state) && <div><Button type="primary" size="small" onClick={() => onCortesChoose(true)} icon={<EditOutlined />}>Bobines a testar</Button></div>}
                    {state.cortesChoose && <div><Button disabled={submitting.state} type="primary" ghost size="small" onClick={() => onCortesChoose(false)}>Cancelar</Button></div>}
                    {state.cortesChoose && <div><Button disabled={submitting.state} type="primary" size="small" onClick={onSave}>Submeter</Button></div>}
                </Space>
            </Portal>
            }
        </>
    );
}