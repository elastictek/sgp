import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import IconButton from "components/iconButton";
import ResultMessage from 'components/resultMessage';
import Toolbar from "components/toolbar";
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useImmer } from "use-immer";

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

const Bobine = ({ id, value, index, moveBobine, width = 0, forInput = false }) => {
    const classes = useStyles({ width });
    const ref = useRef(null);
    const style = {
        color: "#1890ff",
        fontStyle: "italic",
        height: "100%",
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
        <div ref={ref} className={classes.bobine} style={{ opacity }} data-handler-id={handlerId}>
            <div style={{ fontSize: "10px", textAlign: "center" }}>{index + 1}</div>
            <div style={style}>{value}</div>
        </div>
    );
}

const loadCortesOrdemLookup = async ({ cortes_id, token }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/cortesordemlookup/`, filter: { cortes_id }, sort: [], cancelToken: token });
    return rows;
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, wrapForm = "form", forInput = true }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
    const [guides, setGuides] = useState(false);
    const [bobines, setBobines] = useImmer([]);
    const [larguraTotal, setLarguraTotal] = useState(0);
    const [cortesOrdemLookup, setCortesOrdemLookup] = useState([]);


    const init = ({ token }) => {
        const { cortes, cortesordem } = record;
        (setFormTitle) && setFormTitle({ title: `Posicionar Cortes` });
        const { largura_json } = cortes;
        const _bobines = [];
        let _larguraTotal = 0;

        if (!loading) {
            setLoading(true);
        }
        (async () => {
            const _cortesOrdemLookup = await loadCortesOrdemLookup({ cortes_id: cortes.id, token });
            setCortesOrdemLookup(_cortesOrdemLookup);
            if (!cortesordem || cortesordem.id == null) {
                if (forInput) {
                    for (const [key, value] of Object.entries(JSON.parse(largura_json))) {
                        _bobines.push(...(new Array(value)).fill(key));
                        _larguraTotal = _larguraTotal + value * key;
                    }
                }
            } else {
                const _cortesordem = JSON.parse(cortesordem.largura_ordem);
                _bobines.push(..._cortesordem);
                form.setFieldsValue({ designacao: cortesordem.designacao });
                _larguraTotal = _cortesordem.reduce((sum, v) => Number(sum) + Number(v));
            }
            form.setFieldsValue({ cortes_id: cortes.id, cortesordem_id: cortesordem?.id });
            setBobines(_bobines);
            setLarguraTotal(_larguraTotal);
            setLoading(false);
        })();
    }

    useEffect(() => {
        const token = cancelToken();
        init({ token });
        return (() => token.cancel("Form Cortes Cancelled"));
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
            //const response = await fetchPost({ url: `${API_URL}/updatecortesordem/`, parameters: { ...values, largura_ordem: JSON.stringify(bobines), cortes_id } });
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
                        <FieldSet>
                            {form.getFieldValue("cortes_id") && <Toolbar
                                style={{ width: "100%" }}
                                left={
                                    <FieldSet>
                                        <Field wide={10} name="designacao" label={{ enabled: false }}><Input placeholder="Designação" size="small" /></Field>
                                    </FieldSet>
                                }
                                right={
                                    <FieldSet >
                                        <Field name="cortesordem_id" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: false, text: "Posição Cortes", pos: "left" }}>
                                            <SelectField size="small" data={cortesOrdemLookup} keyField="id" textField="designacao"
                                                optionsRender={(d, keyField, textField) => ({ label: <div><div style={{ display: "flex" }}><div style={{ minWidth: "150px" }}><b>{d[textField]}</b></div><div>v.{d["versao"]}</div></div><div style={{ color: "#1890ff" }}>{d["largura_ordem"].replaceAll('"', ' ')}</div></div>, value: d[keyField] })}
                                            />
                                        </Field>
                                    </FieldSet>
                                }
                            />
                            }
                        </FieldSet>
                    </>
                    }
                </FormLayout>
            </Form>
            <DndProvider backend={HTML5Backend}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    {bobines.map((v, i) => {
                        return (<Bobine key={`b-${v}.${i}`} id={`b-${v}.${i}`} value={v} index={i} moveBobine={moveBobine} width={(v * 100) / larguraTotal} forInput={forInput} />);
                    })}
                </div>
            </DndProvider>
            {parentRef && <Portal elId={parentRef.current}>
                <Space>
                    <Button type="primary" onClick={() => form.submit()}>Guardar</Button>
                    <Button onClick={() => setGuides(!guides)}>{guides ? "No Guides" : "Guides"}</Button>
                </Space>
            </Portal>
            }
        </>
    );
}