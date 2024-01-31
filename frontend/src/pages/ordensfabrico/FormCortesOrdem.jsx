import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, Menu, Dropdown } from "antd";
import { EllipsisOutlined } from '@ant-design/icons';
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useImmer } from "use-immer";
import {loadCortesOrdemLookup} from './FormCortes';

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
        minWidth: "50px",//"34px",
        '& .inner': {
            border: "solid 1px #bfbfbf",
            boxShadow: "2px 1px 2px #f0f0f0",
            borderRadius: "3px",
            height: (props) => props.measure ? "70%" : "100%",
            '&:hover': {
                backgroundColor: "#e6f7ff"
            }
        },
    }
})

const Bobine = ({ id, value, index, moveBobine, onClick, width = 0, forInput = false, larguras, height, selected, nBobines, measure, measures, onMeasureChange, measureIsValid }) => {
    const classes = useStyles({ width, forInput, height, measure });
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
            {(!forInput && measure) && <div style={{ height: "25px", textAlign: "center" }}><InputNumber status={measureIsValid("LA", index + 1, nBobines) ? null : "error"} min={1} max={3000} style={{ width: "100%" }} value={measures?.["LA"]?.[index + 1]} tabIndex={index + 2} size="small" controls={false} onChange={(v) => onMeasureChange("LA", index + 1, v)} /></div>}
            <div className="inner" style={{ opacity, background: selected ? "orange" : color.bcolor, color: selected ? "#000" : color.color }} onClick={() => onClick && onClick(id, index, value)}>
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
            {(!forInput && measure) && <div style={{ height: "25px", textAlign: "center" }}><InputNumber status={measureIsValid("LO", index + 1, nBobines) ? null : "error"} min={1} max={3000} style={{ width: "100%" }} value={measures?.["LO"]?.[index + 1]} size="small" tabIndex={(31 + nBobines) - (index + 1)} controls={false} onChange={(v) => onMeasureChange("LO", index + 1, v)} /></div>}
        </div>
    );
}

export default ({ onChangeCortesOrdem, record, larguras: _larguras, forInput = true, height, measure = false, cortesChoose, parameters, measures, measureIsValid, onMeasureChange,onOffsetChange, offset }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [bobines, setBobines] = useImmer([]);
    const [larguraTotal, setLarguraTotal] = useState(0);
    const [idx, setIdx] = useState();
    const [larguras, setLarguras] = useState(_larguras);
    const [largurasTxt, setLargurasTxt] = useState();
    const [cortesTest, setCortesTest] = useState();



    const init = async () => {
        const _co = (parameters?.cortesOrdemId) ? parameters?.cortesOrdemId : parameters?.cortesordem_id;
        if (_co) {
            console.log("cortesordem!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", _co)
            const _rows = await loadCortesOrdemLookup({ cortesordem_id: _co });
            console.log("RRRR",_rows)
            setBobines(json(_rows[0].largura_ordem));
            
            setLarguraTotal(_rows[0].largura_util);
            setIdx(null);
            setLargurasTxt(_rows[0].largura_json.replace("{", "[").replace("}", "]").replace(":", "x"));
            setLarguras(Object.keys(json(_rows[0].largura_json)).map(Number));
            setCortesTest(parameters?.cortes_test?.cortes);
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
            setBobines(record?.cortes_ordem);
            setLarguraTotal(record?.largura_util);
            setIdx(record?.idx);
        }
    }

    useEffect(() => {
        init();
    }, [record, parameters?.cortesOrdemId]);

    useEffect(() => {
        console.log(parameters?.cortesOrdemId, record)
    }, [cortesChoose?.edit, cortesChoose?.save]);

    const onFinish = async (values) => {
        const status = { error: [], warning: [], info: [], success: [] };
        const { cortes, ordem, cortes_id } = record;
        let touched = false;
        if (!ordem) {
            touched = true;
        } else {
            if (!JSON.parse(ordem.largura_ordem).every((v, i) => v === bobines[i])) {
                touched = true;
            }
        }
        if (touched) {
            const response = await fetchPost({ url: `${API_URL}/updatecortesordem/`, parameters: { ...values, largura_ordem: JSON.stringify(bobines), cortes_id } });
            if (response.data.status !== "error") {
                status.success.push({ message: response.data.title });
                parentReload({}, "lookup");
                closeParent();
            } else {
                status.error.push({ message: response.data.title });
            }
            setFormStatus(status);
        }
    }

    const moveBobine = useCallback((dragIndex, hoverIndex) => {
        const _b = [...bobines];
        const tmp = _b[hoverIndex];
        _b[hoverIndex] = _b[dragIndex];
        _b[dragIndex] = tmp;
        setBobines(_b);
        onChangeCortesOrdem(idx, _b);
    }, [bobines]);

    const onChooseTest = (id, index, value) => {
        const _arr = cortesTest.findIndex(v => index + 1)
        console.log("aaaa,choose-->", id, index, value)
    }




    return (
        <>
            <AlertMessages formStatus={formStatus} />
            <div style={{ display: "flex" }}><div style={{ fontWeight: 700 }}>{largurasTxt}</div><div style={{ marginLeft: "20px" }}>Largura Útil:</div><div style={{ marginLeft: "2px", fontWeight: 700 }}>{larguraTotal}mm</div></div>
            {(!forInput && measure) && <div style={{marginLeft:"22px"}}><div>Offset</div><div><InputNumber tabIndex={1} value={offset} onChange={onOffsetChange} size='small' min={0} max={2200} /></div></div>}
            <DndProvider backend={HTML5Backend}>
                <div style={{ display: "flex", flexDirection: "row", /* justifyContent: "space-around", */flexWrap: "wrap" }}>
                    {(!forInput && measure) && <div style={{ height: "25px", textAlign: "center", marginTop: "3px" }}><span style={{ fontWeight: 700, marginRight: "3px" }}>LA</span>{/* <InputNumber min={1} max={3000} style={{ width: "50px" }} value={measures?.["LA"]?.[0]} tabIndex={1} size="small" controls={false} onChange={(v) => onMeasureChange("LA", 0, v)} /> */}</div>}
                    {bobines && bobines.map((v, i) => {
                        return (
                            <Bobine measure={measure} measures={measures} measureIsValid={measureIsValid} onMeasureChange={onMeasureChange} selected={cortesTest?.includes(i + 1)} key={`b-${v}.${i}`} id={`b-${v}.${i}`} value={v} index={i} {...cortesChoose?.edit && { onClick: onChooseTest }} nBobines={bobines.length} moveBobine={moveBobine} width={(v * (measure ? 97 : 100)) / larguraTotal} larguras={larguras} forInput={forInput} height={height} />);
                    })}
                    {(!forInput && measure) && <div style={{ height: "25px", textAlign: "center", alignSelf: "end", marginBottom: "11px" }}>{/* <InputNumber min={1} max={3000} style={{ width: "50px" }} value={measures?.["LO"]?.[bobines.length + 1]} tabIndex={30} size="small" controls={false} onChange={(v) => onMeasureChange("LO", bobines.length + 1, v)} /> */}<span style={{ fontWeight: 700, marginLeft: "3px" }}>LO</span></div>}
                </div>
            </DndProvider>
        </>
    );
}