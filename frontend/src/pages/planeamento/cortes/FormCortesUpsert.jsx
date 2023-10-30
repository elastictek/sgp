import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import IconButton from "components/iconButton";
import ResultMessage from 'components/resultMessage';
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useImmer } from "use-immer";
/* import SvgSchema from '../paletizacaoSchema/SvgSchema'; */

const schema = (keys, excludeKeys) => {
    return getSchema({}, keys, excludeKeys).unknown(true);
}

const useStyles = createUseStyles({
    bobine: {
        cursor: "move",
        border: "solid 1px #bfbfbf",
        height: "150px",
        boxShadow: "2px 1px 2px #f0f0f0",
        margin: "3px",
        borderRadius: "3px",
        width: (props) => `${props.width}%`,
        '&:hover': {
            backgroundColor: "#e6f7ff"
        }
    }
})

const Bobine = ({ id, value, index, moveBobine, width = 0, forInput = false, cortes }) => {
    const classes = useStyles({ width });
    const ref = useRef(null);
    const color = cortes.find(v => v.item_lar == value);
    console.log("cortesssssssssssss",cortes)
    const style = {
        color: color.color,
        fontStyle: "italic",
        height: "70%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    };
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
            <div style={{ fontSize: "10px", textAlign: "center" }}>{index + 1}</div>
            <div style={style}>{value}</div>
        </div>
    );
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [bobines, setBobines] = useImmer([]);
    const [larguraTotal, setLarguraTotal] = useState(0);


    const init = () => {
        const { cortes, cortesOrdem } = record;
        (setFormTitle) && setFormTitle({ title: `Posicionar Cortes` });
        const { largura_json } = cortes[0];
        const _bobines = [];
        let _larguraTotal = 0;
        if (!cortesOrdem) {
            for (const [key, value] of Object.entries(JSON.parse(largura_json))) {
                _bobines.push(...(new Array(value)).fill(key));
                _larguraTotal = _larguraTotal + value * key;
            }
        } else {
            const _cortesOrdem = JSON.parse(cortesOrdem.largura_ordem);
            _bobines.push(..._cortesOrdem);
            form.setFieldsValue({ designacao: cortesOrdem.designacao });
            _larguraTotal = _cortesOrdem.reduce((sum, v) => Number(sum) + Number(v));
        }
        setBobines(_bobines);
        setLarguraTotal(_larguraTotal);
    }

    useEffect(() => {
        init();
    }, [record]);

    const onFinish = async (values) => {
        const status = { error: [], warning: [], info: [], success: [] };
        const { cortes, ordem } = record;
        const { cortes_id } = cortes[0];
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
        setBobines(draft => {
            const tmp = draft[hoverIndex];
            draft[hoverIndex] = draft[dragIndex];
            draft[dragIndex] = tmp;
        });
    }, [bobines]);

    
    const onSubmit = useCallback(() =>{
        setSubmitting(true);
        form.submit();
    },[]);

    return (
        <>
            <AlertMessages formStatus={formStatus} />
            <Form form={form} name={`fps`} onFinish={onFinish} component={wrapForm}>
                <FormLayout
                    id="LAY-CORTESORDEM-UPSERT"
                    guides={guides}
                    layout="vertical"
                    style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{
                        forInput,
                        wide: [16],
                        margin: "2px", overflow: false, guides: guides,
                        label: { enabled: true, pos: "top", align: "start", vAlign: "center", /* width: "80px", */ wrap: false, overflow: false, colon: true, ellipsis: true },
                        alert: { pos: "right", tooltip: true, container: false /* container: "el-external" */ },
                        layout: { top: "", right: "", center: "", bottom: "", left: "" },
                        required: true,
                        style: { alignSelf: "top" }
                    }}
                    fieldSet={{
                        guides: guides,
                        wide: 16, margin: "2px", layout: "horizontal", overflow: false
                    }}
                >
                    {forInput && <>
                        <FieldSet margin={false} field={{ wide: [6, 4] }}>
                            <Field name="designacao" label={{ enabled: false }}><Input placeholder="Designação" size="small" /></Field>
                        </FieldSet>
                        <VerticalSpace height="24px" />
                    </>
                    }
                </FormLayout>
            </Form>

            <DndProvider backend={HTML5Backend}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    {bobines.map((v, i) => {
                        return (<Bobine key={`b-${v}.${i}`} id={`b-${v}.${i}`} value={v} index={i} moveBobine={moveBobine} width={(v * 100) / larguraTotal} cortes={record.cortes} forInput={forInput} />);
                    })}
                </div>
            </DndProvider>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button disabled={submitting} onClick={onSubmit} type="primary">Guardar</Button>
                    {/* <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button> */}
                </Space>
            </Portal>
            }
        </>
    );
}