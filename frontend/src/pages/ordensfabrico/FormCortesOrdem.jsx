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
import { props } from 'ramda';


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
        border: "solid 1px #bfbfbf",
        height: (props)=> props.height ? props.height : "120px",
        boxShadow: "2px 1px 2px #f0f0f0",
        margin: "3px",
        borderRadius: "3px",
        width: (props) => `${props.width}%`,
        '&:hover': {
            backgroundColor: "#e6f7ff"
        }
    }
})

const Bobine = ({ id, value, index, moveBobine, width = 0, forInput = false, larguras, height }) => {
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
        <div ref={ref} className={classes.bobine} style={{ opacity, background: color.bcolor, color: color.color }} data-handler-id={handlerId}>
            <div style={{ fontSize: "10px", textAlign: "center", height: "10%" }}>{index + 1}</div>
            <div style={{
                color: color.color,
                fontStyle: "italic",
                height: "70%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>{value}</div>
        </div>
    );
}

const loadCortesOrdemLookup = async ({ cortesOrdemId, signal }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, parameters: { method: "CortesOrdemLookup" }, filter: { cortesOrdemId }, sort: [], signal });
    return rows;
}

export default ({ onChangeCortesOrdem, record, larguras:_larguras, cortesOrdemId, forInput = true, height }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [bobines, setBobines] = useImmer([]);
    const [larguraTotal, setLarguraTotal] = useState(0);
    const [idx, setIdx] = useState();
    const [larguras,setLarguras] = useState(_larguras);
    const [largurasTxt,setLargurasTxt] = useState();


    const init = async () => {
        if (cortesOrdemId) {
            const _rows = await loadCortesOrdemLookup({ cortesOrdemId });
            console.log("####$$",cortesOrdemId)
            setBobines(json(_rows[0].largura_ordem));
            setLarguraTotal(_rows[0].largura_util);
            setIdx(null);
            setLargurasTxt(_rows[0].largura_json.replace("{","[").replace("}","]").replace(":","x"));
            setLarguras(Object.keys(json(_rows[0].largura_json)).map(Number));
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
    }, [record, cortesOrdemId]);

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

    return (
        <>
            <AlertMessages formStatus={formStatus} />
            <div style={{display:"flex"}}><div style={{fontWeight:700}}>{largurasTxt}</div><div style={{marginLeft:"20px"}}>Largura Útil:</div><div style={{marginLeft:"2px",fontWeight:700}}>{larguraTotal}mm</div></div>
            <DndProvider backend={HTML5Backend}>
                <div style={{ display: "flex", flexDirection: "row", /* justifyContent: "space-around", */flexWrap:"wrap" }}>
                    {bobines.map((v, i) => {
                        return (<Bobine key={`b-${v}.${i}`} id={`b-${v}.${i}`} value={v} index={i} moveBobine={moveBobine} width={(v * 100) / larguraTotal} larguras={larguras} forInput={forInput} height={height}/>);
                    })}
                </div>
            </DndProvider>
        </>
    );
}