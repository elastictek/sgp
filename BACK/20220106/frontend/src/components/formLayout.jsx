import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { Form, Tooltip, Drawer, Modal, Button, Row, Col, Input, Tag, AutoComplete, Select, Switch, Alert } from "antd";
import styled from "styled-components";
import classNames from "classnames";
import { createUseStyles } from 'react-jss';
import * as R from "ramda";
import { ConditionalWrapper } from './conditionalWrapper';
import Portal from "./portal";
import PointingLabel from "./poitingLabel";
import { validate } from "utils/schemaValidator";

const ParentContext = createContext({});

const inheritSelf = (props = {}, parentProps = {}) => {

    /**
     * Calcula "width" de acordo com o valor de "wide" or "split"
     */
    const widthValue = (props) => {
        if (props.wide) {
            return `${props.wide * 6.25}%`;
        } else if (props.split) {
            return `${100 / props.split}%`;
        }
        return '100%';
    }

    const wideValue = (wide, idx) => {
        if (Number.isInteger(wide)) {
            return wide;
        } else if (Array.isArray(wide)) {
            if (wide[idx] === "*") {
                let sum = wide.reduce((sum, x) => (x === '*') ? sum : sum + x);
                return 16 - sum;
            } else {
                return wide[idx];
            }
        }
    }
    const wideOrSplit = (self = {}, parent = {}) => {
        let ret = {};
        if (!("wide" in self) && ("split" in self)) {
            const { wide: w, ...data } = parent;
            ret = { ...data, ...self };
        } else if (("wide" in self) && !("split" in self)) {
            const { split: s, ...data } = parent;
            ret = { ...data, ...self };
        } else {
            ret = { ...parent, ...self };
        }
        if (("wide" in ret) && ("split" in ret)) {
            const { split: s, ...data } = ret;
            ret = { ...data };
        }

        if ("wide" in ret) {
            ret.wide = wideValue(ret.wide, self.index);
        }

        if (!("forInput" in ret)) {
            ret.forInput = true;
        }

        ret.width = widthValue(ret);

        return ret;
    }
    const obj = wideOrSplit(props, parentProps)

    const layout = (self = {}, parent = {}) => {

        const ret = {
            layout: {
                top: { ...parent?.layout?.top, ...self?.layout?.top },
                right: { ...parent?.layout?.right, ...self?.layout?.right },
                center: { ...parent?.layout?.center, ...self?.layout?.center },
                left: { ...parent?.layout?.left, ...self?.layout?.left },
                bottom: { ...parent?.layout?.bottom, ...self?.layout?.bottom },
            }
        }

    }

    return {
        ...obj,
        label: { ...parentProps?.label, ...props?.label },
        alert: { ...parentProps?.alert, ...props?.alert },
        ...layout(props, parentProps)
    };
}

/**
 * O FieldSet pode ter "filhos", (Field, FieldSet,...), sendo necessário repassar o que vem do "pai" e sobrepor 
 * eventuais parametros que estejam definidos no próprio FieldSet
*/
const propsToChildren = (props = {}, parentProps = {}, refMainAlertContainer) => {
    const { field: pField = {}, fieldSet: pFieldSet = {}, schema, layoutId } = parentProps;
    const { field = {}, fieldSet = {} } = props;
    return { field: { ...pField, ...field }, fieldSet: { ...pFieldSet, ...fieldSet }, schema, layoutId, refMainAlertContainer };
}

const useFieldStyles = createUseStyles({
    field: ({ grow = false, width, overflow, guides = false }) => ({
        ...(grow ?
            {
                "minWidth": width
            }
            : {
                "minWidth": width,
                "maxWidth": width
            }),
        "overflow": overflow ? "visible" : "hidden",
        ...(guides && { "border": "1px dashed blue" })
    }),
    padding: ({ padding }) => ({ ...(padding && { "padding": padding }) }),
    margin: ({ margin, guides }) => ({ ...(margin && { "margin": margin }), ...(guides && { "border": "1px solid red" }) }),
    rowTop: ({ guides, layout = {} }) => ({
        ...{ ...layout.top },
        ...(guides && { "margin": "2px", "border": "1px solid green" }),
    }),
    rowBottom: ({ guides, layout = {} }) => ({
        ...{ ...layout.bottom },
        ...(guides && { "margin": "2px", "border": "1px solid green" }),
    }),
    rowMiddle: ({ guides }) => ({
        "display": "flex",
        "flexDirection": 'row',
        "flexGrow": 0,
        "flexShrink": 0,
        "flexWrap": "nowrap",
        "alignItems": "stretch",
        ...(guides && { "margin": "2px", "border": "1px solid green" })
    }),
    left: ({ guides, layout = {} }) => ({
        ...{ ...layout.left },
        ...(guides && { "margin": "2px", "border": "1px solid blue" })
    }),
    right: ({ guides, layout = {} }) => ({
        ...{ ...layout.right },
        ...(guides && { "margin": "2px", "border": "1px solid blue" })
    }),
    center: ({ guides, layout = {} }) => ({
        ...{ flex: 1, ...layout.center },
        ...(guides && { "margin": "2px", "border": "1px solid blue" })
    }),
    error: () => ({
        "& input": {
            "color": "#9f3a38",
            "background": "#fff6f6",
            "borderColor": "#e0b4b4"
        }
    }),
    warning: () => ({
        "& input": {
            "borderColor": "#c9ba9b",
            "background": "#fffaf3",
            "color": "#573a08"
        }
    })
});

/**
 * 
 * @param {*} name Nome do campo
 * @param {*} wide Tamanho do Field, tipo de dados: {int entre 1 e 16 | array no formato [int,int,'*'] }  (Atenção! wide(default) e split são mutuamente exclusivos)
 * @param {*} split Tamanho do Field, divide o espaço (16) pelo número de vezes indicada (Atenção! wide(default) e split são mutuamente exclusivos)
 * 
 * @returns 
 */
export const Field = ({ children, ...props }) => {
    const [localStatus, setLocalStatus] = useState({ status: "none", messages: [] });
    const parentProps = useContext(ParentContext);
    const myProps = inheritSelf(props, parentProps?.field);
    const classes = useFieldStyles(myProps);
    const { refMainAlertContainer } = parentProps;

    return (
        <div className={classNames(classes.field, { [classes.padding]: !myProps?.margin })} style={{ ...myProps?.style }}>
            <ConditionalWrapper
                condition={myProps?.margin}
                wrapper={children => <div className={classNames(classes.margin, classes.padding, myProps?.className)}>{children}</div>}
            >
                <InnerField {...myProps} localStatus={localStatus} setLocalStatus={setLocalStatus} refMainAlertContainer={refMainAlertContainer}>
                    {children}
                </InnerField>
            </ConditionalWrapper>

        </div>
    );
}

export const FieldItem = ({ children, ...props }) => {
    return (
        <Field forInput={false} {...props}>{children}</Field>
    );
}


const FormItemWrapper = ({ children, forInput = true, localStatus, setLocalStatus, name }) => {
    const { schema } = useContext(ParentContext);

    const validator = async (r, v) => {
        const rule = schema([r.field]);
        (async () => {
            try {
                const { value, warning } = await rule.validateAsync({ [r.field]: v }, { abortEarly: false, warnings: true });
                setLocalStatus((warning === undefined) ? { status: "none", messages: [] } : { status: "warning", messages: [...warning.details] });
            } catch (e) {
                setLocalStatus({ status: "error", messages: [...e.details] });
            }
        })();
    }

    return (
        <ConditionalWrapper
            condition={forInput}
            wrapper={children => <Form.Item rules={[{ validator: validator }]} validateTrigger={["onBlur"]} noStyle name={name}>
                {children}
            </Form.Item>}
        >
            {children ? children : <>{children}</>}
        </ConditionalWrapper>
    );
}



const InnerField = ({ children, ...props }) => {
    const classes = useFieldStyles(props);
    const { name, label, alert, required, guides, forInput = true, localStatus, setLocalStatus, refMainAlertContainer } = props;
    const refs = {
        top: useRef(),
        left: useRef(),
        right: useRef(),
        bottom: useRef(),
        center: useRef(),
        container: refMainAlertContainer
    };
    const cssCenter = classNames(classes.center, { [classes.error]: localStatus.status == "error" }, { [classes.warning]: localStatus.status == "warning" });
    const tooltipColor = (localStatus?.status == "warning" ? "orange" : "red");


    return (
        <>
            <div className={classes.rowTop} ref={refs.top} />
            <div className={classes.rowMiddle}>
                <div className={classes.left} ref={refs.left} />
                <ConditionalWrapper
                    condition={alert?.tooltip && (localStatus.status == "error" || localStatus.status == "warning")}
                    wrapper={children => <Tooltip title={<InnerAlertFieldMessages name={name} messages={localStatus?.messages} />} color={tooltipColor}>{children}</Tooltip>}
                >
                    <div className={cssCenter} ref={refs.center}><FormItemWrapper name={name} forInput={forInput} localStatus={localStatus} setLocalStatus={setLocalStatus}>{children}</FormItemWrapper></div>
                </ConditionalWrapper>
                <div className={classes.right} ref={refs.right} />
            </div>
            <div className={classes.rowBottom} ref={refs.bottom} />
            <LabelRef refs={refs} {...label} name={name} required={required} guides={guides} />
            {alert?.container &&
                <AlertField refs={refs} fieldStatus={localStatus} name={name} {...alert} />
            }
        </>
    );
}


const useAlertFieldStyles = createUseStyles({
    alert: () => ({
        "display": "flex",
        "width": "100%",
        /* "height": "100%", */
        "alignItems": "center"
    })
});

const InnerAlertFieldMessages = ({ name, messages }) => {
    console.log(messages);
    return (
        <div>
            {messages.map((v, i) => <div key={`fmsg-${name}-${i}`}>
                {v.message}
            </div>)
            }

        </div>
    );
}

const AlertField = ({ fieldStatus, name, pos = "bottom", refs, container, ...props }) => {
    const classes = useAlertFieldStyles(props);
    const [domReady, setDomReady] = useState(false);
    React.useEffect(() => { setDomReady(true); }, []);

    const ref = (container === true) ? refs["container"].current : (container in refs) ? refs[pos].current : container;
    console.log("ref", ref);

    return (
        <Portal elId={ref}>
            {(fieldStatus?.status === "error" || fieldStatus?.status === "warning") &&
                <div className={classes.alert}>
                    {pos === "list" ?
                        <InnerAlertFieldMessages name={name} messages={fieldStatus?.messages} status={fieldStatus?.status} />
                        :
                        <PointingLabel status={fieldStatus?.status} text={<InnerAlertFieldMessages name={name} messages={fieldStatus?.messages} />} position={pos} />
                    }
                </div>
            }
        </Portal>
    );
}

export const AlertsContainer = ({ main = false, parentPath, ...props }) => {
    const parentProps = useContext(ParentContext);
    const { refMainAlertContainer } = parentProps;
    const [domReady, setDomReady] = useState(false);
    React.useEffect(() => { setDomReady(true); }, []);
    return (
        <div {...(main && { ref: refMainAlertContainer })} {...props}></div>
    );
}




const useLabelStyles = createUseStyles({
    wrapper: ({ pos, wrap = false, overflow = true, colon = true, ellipsis = true, width, align = "start", vAlign = "start", padding = "5px", required, guides }) => ({
        "display": "flex",
        "flexDirection": "row",
        "alignItems": vAlign,
        "justifyContent": align,
        "padding": padding,
        "width": width,
        "height": "100%",
        "fontWeight": 600,
        "fontSize": "12px",
        "lineHeight": "20px",
        ...(guides && { "margin": "2px", "border": "1px dotted orange" }),

        '& label': {
            ...((!wrap && !ellipsis) && { "whiteSpace": "nowrap" }),
            ...(!ellipsis && { "overflow": overflow ? "visible" : "hidden" }),
            ...(ellipsis && {
                "whiteSpace": "nowrap",
                "overflow": "hidden",
                "textOverflow": "ellipsis"
            })
        },

        ...(pos === "right" ? {
            '&:after': {
                ...(required && {
                    content: '"*"',
                    display: "inline-block",
                    color: "red",
                    marginRight: "4px"
                })
            },
            '&:before': {
                ...(colon && {
                    content: '":"',
                    display: "inline-block",
                    marginLeft: "1px"
                })
            }
        } : {
            '&:before': {
                ...(required && {
                    content: '"*"',
                    display: "inline-block",
                    color: "red",
                    marginRight: "4px"
                })
            },
            '&:after': {
                ...(colon && {
                    content: '":"',
                    display: "inline-block",
                    marginLeft: "1px"
                })
            }
        })
    })
});

const LabelRef = ({ refs, ...props }) => {
    const { pos = "top", enabled = true } = props;
    const [domReady, setDomReady] = useState(false);
    React.useEffect(() => { setDomReady(true); }, []);
    return (
        <>
            {enabled &&
                <Portal elId={refs[pos].current}>
                    <Label {...props} />
                </Portal>
            }
        </>
    );
}

export const Label = ({ ...props }) => {
    const { pos = "top", text = "", enabled = true, colon = true, required = false, className, style, container = {}, name } = props;
    const { width = ((pos === "left" || pos === "right") && "100px") } = props;
    const classes = useLabelStyles({ ...props, width });
    return (
        <div className={classNames(classes.wrapper, className)} style={{ ...style }}>
            <label htmlFor={name} title={text}>
                {text}
            </label>
        </div>
    );
}

export const LabelField = ({ index, ...props }) => {
    return (<FieldItem label={{ enabled: true, padding: "0px", pos: "center", ...props }} index={index} />);
}





const useFieldSetStyles = createUseStyles({
    fieldSet: ({ grow = false, width, guides }) => ({
        ...(grow ?
            {
                "minWidth": width
            }
            : {
                "minWidth": width,
                "maxWidth": width
            }),
        ...(guides && { "border": "1px solid green" })
    }),
    padding: ({ padding }) => ({ ...(padding && { "padding": padding }) }),
    margin: ({ margin }) => ({ ...(margin && { "margin": margin }) }),
    flex: ({ layout = "horizontal", overflow = false }) => ({
        "display": "flex",
        "flexDirection": layout == "vertical" ? 'column' : 'row',
        "flexGrow": 0,
        "flexShrink": 0,
        "flexWrap": "nowrap",
        "overflow": overflow ? "visible" : "hidden"
    })
});

/**
 * 
 * @param {*} wide Tamanho do FieldSet, tipo de dados: {int entre 1 e 16 | array no formato [int,int,'*'] }  (Atenção! wide(default) e split são mutuamente exclusivos)
 * @param {*} split Tamanho do FieldSet, divide o espaço (16) pelo número de vezes indicada (Atenção! wide(default) e split são mutuamente exclusivos)
 * 
 * @returns 
 */
export const FieldSet = ({ children, ...props }) => {
    const parentProps = useContext(ParentContext);
    const myProps = inheritSelf(props, parentProps?.fieldSet);
    const classes = useFieldSetStyles(myProps);
    const refMainAlertContainer = useRef();
    const { parentPath = '' } = props;


    return (
        <div
            className={classNames(classes.fieldSet, { [classes.flex]: !myProps?.margin }, { [classes.padding]: !myProps?.margin })}
            {...(!myProps?.margin && { style: { ...myProps?.style } })}
        >
            <ParentContext.Provider value={propsToChildren(props, parentProps, refMainAlertContainer)}>
                <ConditionalWrapper
                    condition={myProps?.margin}
                    wrapper={children => <div className={classNames(classes.flex, classes.margin, classes.padding, myProps?.className)} style={{ ...myProps?.style }}>{children}</div>}
                >
                    {React.Children.map(children, (child, i) => (
                        <>
                            {(React.isValidElement(child)) ? React.cloneElement(child, { ...child.props, index: i, parentPath: `${parentPath}-${props.index}` }) : child}
                        </>
                    ))
                    }
                </ConditionalWrapper>
            </ParentContext.Provider>
        </div>
    );
}



const useFormLayoutStyles = createUseStyles({
    formLayout: ({ layout = 'vertical', wrap = false, guides }) => ({
        ...(guides && { "border": "2px solid blue" }),
        "display": "flex",
        "flexDirection": layout == "horizontal" ? 'row' : 'column',
        "flexWrap": wrap ? "wrap" : "nowrap"
    })
});
/**
 * 
 * @param {*} layout Disposição dos elementos [vertical,horizontal]
 * @param {*} field Parametros Globais a herdar pelo elemento Field (No override)
 * @param {*} fieldSet Parametros Globais a herdar pelo elemento FieldSet (No override)
 * 
 * @returns 
 */
export const FormLayout = ({ className, style, field, fieldSet, schema, children, id, ...props }) => {
    const classes = useFormLayoutStyles(props);
    const dataContext = { field, fieldSet, schema, layoutId: id };
    if (!id) { throw new Error(`FormLayout key is Required!`) }
    return (
        <div className={classNames(classes.formLayout, className)} style={style}>
            <ParentContext.Provider value={dataContext}>
                {
                    React.Children.map(children, (child, i) => (
                        <>
                            {(React.isValidElement(child)) ? React.cloneElement(child, { ...child.props, index: i, parentPath: id }) : child}
                        </>
                    ))
                }
            </ParentContext.Provider>

        </div>
    );
}