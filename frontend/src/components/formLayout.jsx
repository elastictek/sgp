import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { Form, Tooltip, Drawer, Modal, Button, Row, Col, Input, Tag, AutoComplete, Select, Switch, Alert, Checkbox, Spin } from "antd";
import styled, { css } from "styled-components";
import classNames from "classnames";
import { createUseStyles } from 'react-jss';
import { ConditionalWrapper } from './conditionalWrapper';
import Portal from "./portal";
import PointingLabel from "./poitingLabel";
import { debounce } from "utils";
import { validate } from "utils/schemaValidator";
import { LoadingOutlined } from '@ant-design/icons';
import { BiWindow } from "react-icons/bi";
import { BsBoxArrowInDownRight } from "react-icons/bs";
import { AiOutlineFullscreen } from "react-icons/ai";

import { MediaContext } from '../pages/App';


const ParentContext = createContext({});

const Title = styled.div`
    h4{
        color: rgba(0, 0, 0, 0.85);
        font-weight: 700;
        font-size: 18px;
        line-height: 1.4;
        margin-bottom:0;
    }
    h5{

    }
`;
export const TitleForm = ({ title, subTitle, toogleMaximize, toogleFullScreen, setNormal }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Title>
                <h4>{title}</h4>
                {subTitle && <h5>{subTitle}</h5>}
            </Title>
            <div><div onClick={toogleMaximize}><BiWindow /></div><div onClick={toogleFullScreen}><AiOutlineFullscreen /></div></div>
        </div>
    );
}


export const WrapperForm = props => {
    const ctx = useContext(MediaContext);
    // // setWidth({ width: 100, unit: "%", maxWidth: 100, maxUnit: "%", device: "mobile", orientation });
    // console.log("drawer-----",ctx);
    const { type = 'modal', visible = false, setVisible, children, title, mode = "normal", width, ...rest } = props;
    const [widthMode, setWidthMode] = useState();

    useEffect(() => {
        if (widthMode) {
            setWidthMode({ width: computeWitdth(mode), mode, prevMode: mode });
        } else {
            setWidthMode({ width: computeWitdth(mode, width), mode, prevMode: mode });
        }
    }, [ctx]);

    const computeWitdth = (mode, width) => {
        console.log("COMPUT....", ctx)
        if (width)
            return width;
        if (mode === "normal") {
            return `${ctx.width}${ctx.unit}`;
        } else if (mode === "maximized") {
            return `${ctx.maxWidth}${ctx.maxUnit}`;
        } else if (mode === "fullscreen") {
            return "100%";
        }
    }

    const toogleMaximize = () => {
        const newMode = widthMode.mode === "maximized" ? widthMode.prevMode : "maximized";
        const newWidth = computeWitdth(newMode === "fullscreen" ? "normal" : newMode);
        setWidthMode({ width: newWidth, mode: (newMode === "fullscreen" ? "normal" : newMode), prevMode: widthMode.mode });
    }
    const toogleFullScreen = () => {
        const newMode = widthMode.mode === "fullscreen" ? widthMode.prevMode : "fullscreen";
        setWidthMode({ width: computeWitdth(newMode), mode: newMode, prevMode: widthMode.mode });
    }

    const setNormal = () => {
        setWidthMode({ width: computeWitdth("normal"), mode: "normal", prevMode: "normal" });
    }
    const titleForm = React.cloneElement(title, { ...title.props, toogleMaximize, toogleFullScreen, setNormal });

    return (
        <>
            {widthMode && <>
                {type == 'modal' ? (
                    <Modal
                        {...rest}
                        width={widthMode.width}
                        title={titleForm}
                        centered
                        visible={visible}
                        onCancel={() => setVisible(false)}
                    >
                        {children}
                    </Modal>
                ) : (
                    <Drawer {...rest} width={widthMode.width} title={titleForm} visible={visible} onClose={() => setVisible(false)}>
                        {children}
                    </Drawer>
                )}
            </>
            }
        </>
    );
};

Number.prototype.pad = function (size) {
    var sign = Math.sign(this) === -1 ? '-' : '';
    return sign + new Array(size).concat([Math.abs(this)]).join('0').slice(-size);
}

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

        if (!self?.wide && self?.split) {
            const { wide: w, ...data } = parent;
            ret = { ...data, ...self };
        } else if (self?.wide && !self?.split) {
            const { split: s, ...data } = parent;
            ret = { ...data, ...self };
        } else {
            ret = { ...parent, ...self };
        }
        if (ret?.wide && ret?.split) {
            const { split: s, ...data } = ret;
            ret = { ...data };
        }

        if (ret?.wide) {
            ret.wide = wideValue(ret.wide, self.index);
        }



        /*         let ctrl = '0';
                if (!("wide" in self) && ("split" in self)) {
                    const { wide: w, ...data } = parent;
                    ret = { ...data, ...self };
                    ctrl='1';
                } else if (("wide" in self) && !("split" in self)) {
                    const { split: s, ...data } = parent;
                    ret = { ...data, ...self };
                    ctrl='2';
                } else {
                    ret = { ...parent, ...self };
                    ctrl='3';
                }
                if (("wide" in ret) && ("split" in ret)) {
                    const { split: s, ...data } = ret;
                    ret = { ...data };
                    ctrl=`${ctrl}-1`;
                }
        
                if ("wide" in ret) {
                    ret.wide = wideValue(ret.wide, self.index);
                    ctrl=`${ctrl}-2`;
                } */

        //        if (self.name==="extr4_val"){
        //console.log("splittttt", " ret-wide -->", ret?.wide, " ret-split -->", ret?.split, " self-wide -->", self?.wide, " self-split -->", self?.split, " --- ", ctrl, " --- " , self.name);
        //console.log("splittttt", " ret-wide -->", ret?.wide?.pad(2), " ret-split -->", ret?.split?.pad(2), " self-wide -->", self?.wide?.pad(2), " self-split -->", self?.split?.pad(2), " --- ", ctrl, " --- " , self.name);
        //           }


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
    const { field: pField = {}, fieldSet: pFieldSet = {}, schema, layoutId, fieldStatus, updateFieldStatus, clearFieldStatus } = parentProps;
    const { field = {}, fieldSet = {} } = props;
    return { field: { ...pField, ...field }, fieldSet: { ...pFieldSet, ...fieldSet }, schema, layoutId, refMainAlertContainer, fieldStatus, updateFieldStatus, clearFieldStatus };
}


const StyledHorizontalRule = styled('hr').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children'].includes(prop)
})`
    border: none;
    height: 1px;
    background-color: #dcdddf;
    flex-shrink: 0;
    flex-grow: 0;
    width: 100%;
    margin: 0px;
`;

const StyledHRuleTitle = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children'].includes(prop)
})`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background:#f3f3f3;

    .title{
        font-weight: 700;
        font-size:14px;
        margin: 0px;
        margin-right:5px;
    }

    .description{
        align-self: center;
        color:#595959;
    }

    
`;

export const HorizontalRule = ({ margin = false, title, description, props }) => {
    const parentProps = useContext(ParentContext);
    const myProps = inheritSelf({ ...props, margin }, parentProps?.field);
    /* const classes = useFieldStyles(myProps); */
    const { refMainAlertContainer } = parentProps;
    return (
        <StyledField className={classNames("field", { "padding": !myProps?.margin })} {...myProps}>
            <ConditionalWrapper
                condition={myProps?.margin}
                wrapper={children => <div className={classNames("margin", "padding", myProps?.className)}>{children}</div>}
            >
                {title && <StyledHRuleTitle><div className="title">{title}</div><div className="description">{description}</div></StyledHRuleTitle>}
                <StyledHorizontalRule />
            </ConditionalWrapper>
        </StyledField>
    );
}

const StyledVerticalSpace = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children'].includes(prop)
})`
    ${({ height }) => `height: ${height ? height : "12px"};`}
    width: 100%;
`;

export const VerticalSpace = ({ margin = "0px", height = "12px", props }) => {
    const parentProps = useContext(ParentContext);
    const myProps = inheritSelf({ ...props, margin }, parentProps?.field);
    /* const classes = useFieldStyles(myProps); */
    const { refMainAlertContainer } = parentProps;
    return (
        <StyledField className={classNames("field", { "padding": !myProps?.margin })} {...myProps}>
            <ConditionalWrapper
                condition={myProps?.margin}
                wrapper={children => <div className={classNames("margin", "padding", myProps?.className)}>{children}</div>}
            >
                <StyledVerticalSpace height={height} />
            </ConditionalWrapper>
        </StyledField>
    );
}


export const SwitchField = ({ value, checkedValue = 1, uncheckedValue = 0, ...rest }) => {
    const parseToBool = (v) => {
        return (v === checkedValue) ? true : false;
    }
    const parseFromBool = (v) => {
        return (v === true) ? checkedValue : uncheckedValue;
    }

    const onSwitch = (checked) => {
        onChange?.(parseFromBool(checked));
    }

    return (
        <div>
            <Switch
                checked={parseToBool(value)}
                onChange={onSwitch}
                {...rest}
            />
        </div>
    );
};

export const CheckboxField = ({ onChange, value, checkedValue = 1, uncheckedValue = 0, ...rest }) => {
    const parseToBool = (v) => {
        return (v === checkedValue) ? true : false;
    }
    const parseFromBool = (v) => {
        return (v === true) ? checkedValue : uncheckedValue;
    }

    const onSwitch = (v) => {
        onChange?.(parseFromBool(v.target.checked));
    }

    return (
        <div>
            <Checkbox
                checked={parseToBool(value)}
                onChange={onSwitch}
                {...rest}
            />
        </div>
    );
};

export const SelectDebounceField = ({ fetchOptions, debounceTimeout = 800, onChange, value, keyField, valueField, textField, optionsRender = false, ...rest }) => {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState([]);
    const fetchRef = useRef(0);
    keyField = (keyField) ? keyField : valueField;
    valueField = (valueField) ? valueField : keyField;
    const _optionsRender = (optionsRender) ? optionsRender : d => ({ label: d[textField], key: d[keyField], value: d[valueField] });

    const debounceFetcher = React.useMemo(() => {
        const loadOptions = (v) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);
            fetchOptions(v).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    // for fetch callback order
                    return;
                }
                const opts = newOptions.map(d => _optionsRender(d));
                setOptions(opts);
                setFetching(false);
            });
        };

        return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);

    const onSelectChange = (v) => {
        onChange?.(v);
    }

    return (
        <Select
            labelInValue
            filterOption={false}
            onSearch={debounceFetcher}
            value={value}
            onChange={onSelectChange}
            notFoundContent={fetching ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} size="small" /> : null}
            {...rest}
            options={options}
        />
    );
}

export const SelectField = ({ data, keyField, valueField, textField, showSearch = false, optionsRender, ...rest }) => {
    //const options = data.map((d,i) => <Option disabled={(i<5) ? true :false} key={d[keyField]} value={valueField ? d[valueField] : d[keyField]}>111{d[textField]}</Option>);
    const _optionsRender = (optionsRender) ? optionsRender : d => ({ label: d[textField], value: d[keyField] });
    const options = data ? data.map((d) => _optionsRender(d, keyField, textField)) : [];



    const onChange = (v, option) => {
        /*  if (v !== undefined) {
             onChange?.(("key" in option) ? option.key : option[keyField]);
         } */
    }

    return (
        <Select showSearch={showSearch} options={options} {...rest}>
            {/* {optionsRender({ data, keyField, valueField })} */}
        </Select>
    );
}

/* export const ViewField = ({ value, ...rest }) => {
    console.log("VIEWFIELD-->",value, rest);
    return (<div>{value}</div>);
} */


/* const useFieldStyles = createUseStyles({
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
 */



const StyledField = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children'].includes(prop)
})`
    
    ${({ grow = false, width }) => grow ? css`
        min-width: ${width};
    ` : css`
        min-width: ${width};
        max-width: ${width};
    `
    }
    ${({ guides }) => guides && css`border: 1px dashed blue;`}
    ${({ overflow }) => `overflow: ${overflow ? "visible" : "hidden"};`}

    &.padding, .padding{
        ${({ padding }) => padding && { "padding": padding }}
    }

    .margin{
        ${({ margin }) => margin && css`margin: ${margin};`}
        ${({ guides }) => guides && css`border: 1px solid red;`}
    }

    .error input{
        color: #9f3a38;
        background: #fff6f6;
        border-color: #e0b4b4;
    }
    .warning input{
        border-color: #c9ba9b;
        background: #fffaf3;
        color: #573a08;
    }
    .error .ant-input-number{
        color: #9f3a38;
        background: #fff6f6;
        border-color: #e0b4b4;
    }
    .error .ant-select-selector{
        color: #9f3a38!important;
        background: #fff6f6!important;
        border-color: #e0b4b4!important;
    }
    .warning .ant-input-number{
        border-color: #c9ba9b;
        background: #fffaf3;
        color: #573a08;
    }
    .ant-picker{
        width: 100%;
    }
    .ant-input-number{
        width: 100%;
    }
    .ant-select{
        width: 100%;
    }
`;

const FieldRowTop = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children', 'ref'].includes(prop)
})`
    ${({ guides }) => guides && css`
        margin: 2px;
        border: 1px solid green;
    `}
    ${({ layout = {} }) => css`${layout?.top}`} 
`;

const FieldRowMiddle = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children', 'ref'].includes(prop)
})`
    ${({ guides }) => guides && css`
    margin: 2px;
    border: 1px solid green;
    `}
    display: flex;
    flex-direction: row;
    flex-grow: 0;
    flex-shrink: 0;
    flex-wrap: nowrap;
    align-items: stretch;
`;

const FieldLeft = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children', 'ref'].includes(prop)
})`
    ${({ guides }) => guides && css`
    margin: 2px;
    border: 1px solid blue;
    `}
    ${({ layout = {} }) => css`${layout?.left}`} 
`;

const FieldCenter = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children', 'ref'].includes(prop)
})`
    ${({ guides }) => guides && css`
    margin: 2px;
    border: 1px solid blue;
    `}
    flex: 1; 
    ${({ layout = {} }) => css`${layout?.center}`} 
`;

const FieldRight = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children', 'ref'].includes(prop)
})`
    ${({ guides }) => guides && css`
    margin: 2px;
    border: 1px solid blue;
    `}
    ${({ layout = {} }) => css`${layout?.right}`} 
`;

const FieldBottom = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children', 'ref'].includes(prop)
})`
    ${({ guides }) => guides && css`
    margin: 2px;
    border: 1px solid green;
    `}
    ${({ layout = {} }) => css`${layout?.bottom}`} 
`;

/**
 * 
 * @param {*} name Nome do campo
 * @param {*} wide Tamanho do Field, tipo de dados: {int entre 1 e 16 | array no formato [int,int,'*'] }  (Atenção! wide(default) e split são mutuamente exclusivos)
 * @param {*} split Tamanho do Field, divide o espaço (16) pelo número de vezes indicada (Atenção! wide(default) e split são mutuamente exclusivos)
 * 
 * @returns 
 */
export const Field = ({ children, ...props }) => {
    /* const [localStatus, setLocalStatus] = useState({ status: "none", messages: [] }); */
    const parentProps = useContext(ParentContext);
    const myProps = inheritSelf(props, parentProps?.field);
    /* const classes = useFieldStyles(myProps); */
    const { refMainAlertContainer } = parentProps;

    return (
        <StyledField className={classNames("field", { "padding": !myProps?.margin })} {...myProps}>

            {/* <div className={classNames(classes.field, { [classes.padding]: !myProps?.margin })} style={{ ...myProps?.style }}> */}
            <ConditionalWrapper
                condition={myProps?.margin}
                wrapper={children => <div className={classNames("margin", "padding", myProps?.className)}>{children}</div>}
            >
                <InnerField {...myProps} /* localStatus={localStatus} setLocalStatus={setLocalStatus} */ refMainAlertContainer={refMainAlertContainer}>
                    {(() => {
                        if (!children) {
                            return <>{children}</>
                        } else if (myProps.forInput) {
                            return children;
                        } else if (children) {
                            return <ForView {...children?.props}>{children}</ForView>;
                        }
                    })()}
                </InnerField>
            </ConditionalWrapper>
        </StyledField>
    );
}


// export const Field = ({ children, ...props }) => {
//     const [localStatus, setLocalStatus] = useState({ status: "none", messages: [] });
//     const parentProps = useContext(ParentContext);
//     const myProps = inheritSelf(props, parentProps?.field);
//     /* const classes = useFieldStyles(myProps); */
//     const { refMainAlertContainer } = parentProps;

//     return (
//         <StyledField className={classNames("field", { "padding": !myProps?.margin })} {...myProps}>

//         </StyledField>
//     );
// }




export const FieldItem = ({ children, ...props }) => {
    return (
        <Field noItemWrap={true} {...props}>{children}</Field>
    );
}

export const Item = ({ children = <></>, ...props }) => {
    return (
        <Form.Item noStyle {...props}>
            {children}
        </Form.Item>
    );
}

const ForView = ({ children, data, keyField, textField, optionsRender, labelInValue, ...rest }) => {
    return (
        <>
            {"value" in rest ? <>
                {(() => {
                    const value = rest.value;
                    switch (children.type.name) {
                        case 'Input':
                            return (<div style={{ padding: "2px", border: "dashed 1px #d9d9d9", minHeight: "25px" }}>{value}</div>);
                        case 'CheckboxField':
                            return (
                                <CheckboxField {...children.props} value={value} disabled={true} />
                            )
                        case 'SwitchField':
                            return (
                                <SwitchField {...children.props} value={value} disabled={true} />
                            )
                        case 'SelectDebounceField':
                            /* const r = data.find(v => v[keyField] === value);
                            let text = "";
                            if (r !== undefined) {
                                text = (typeof optionsRender === 'function') ? optionsRender(r, keyField, textField).label : r[textField];
                            }
                            return (
                                <div style={{ padding: "2px", border: "dashed 1px #d9d9d9" }}>{text}</div>
                            ) */
                            return (
                                <div style={{ padding: "2px", border: "dashed 1px #d9d9d9", minHeight: "25px" }}>{value?.label}</div>
                            )
                        case 'SelectField':
                            let text = "";
                            if (labelInValue) {
                                text = value?.label;
                            } else {
                                const r = data.find(v => v[keyField] === value);
                                if (r !== undefined) {
                                    text = (typeof optionsRender === 'function') ? optionsRender(r, keyField, textField).label : r[textField];
                                }
                            }
                            return (
                                <div style={{ padding: "2px", border: "dashed 1px #d9d9d9", minHeight: "25px" }}>{text}</div>
                            )
                        default:

                            if ("addonAfter" in children.props || "addonAfter" in children.props) {
                                return (<div style={{ padding: "2px", border: "dashed 1px #d9d9d9", display: "flex", flexDirection: "row" }}>
                                    {("addonBefore" in children.props) && <div style={{ marginRight: "2px" }}>{children.props.addonBefore}</div>}
                                    <div style={{ flex: 1 }}>{value}</div>
                                    {("addonAfter" in children.props) && <div style={{ marginLeft: "2px" }}>{children.props.addonAfter}</div>}
                                </div>)
                            }

                            return (<div style={{ padding: "2px", border: "dashed 1px #d9d9d9", minHeight: "25px" }}>{value}</div>);
                    }

                })()}

            </> : children}
        </>
    );
}


const FormItemWrapper = ({ children, forInput = true, noItemWrap = false /* , localStatus, setLocalStatus */, name, nameId, shouldUpdate, rule, allValues = {} }) => {
    const { schema, fieldStatus, updateFieldStatus } = useContext(ParentContext);
    const validator = async (r, v) => {
        const _rule = (rule) ? rule : ((Array.isArray(name)) ? schema([name[name.length - 1]]) : schema([name]));
        (async () => {
            try {
                const { value, warning } = await _rule.validateAsync({ ...allValues, [(Array.isArray(name)) ? name[name.length - 1] : name]: v }, { abortEarly: false, warnings: true });
                updateFieldStatus(nameId, (warning === undefined) ? { status: "none", messages: [] } : { status: "warning", messages: [...warning.details] });
            } catch (e) {
                updateFieldStatus(nameId, { status: "error", messages: [...e.details] });
            }
        })();
    }

    return (
        <>
            <ConditionalWrapper
                condition={!noItemWrap}
                wrapper={children => <Form.Item rules={[{ validator: validator }]} validateTrigger={["onBlur"]} shouldUpdate={shouldUpdate} noStyle {...(nameId && { name: nameId })}>
                    {children}
                </Form.Item>}
            >
                {children}
            </ConditionalWrapper>
        </>
    );
}


const AddOns = ({ refs, addons = {} }) => {
    const { top, right, left, bottom, center } = addons;
    const [domReady, setDomReady] = useState(false);
    React.useEffect(() => { setDomReady(true); }, []);
    return (
        <>
            {top && <Portal elId={refs["top"].current}>
                {top}
            </Portal>}
            {right && <Portal elId={refs["right"].current}>
                {right}
            </Portal>}
            {left && <Portal elId={refs["left"].current}>
                {left}
            </Portal>}
            {bottom && <Portal elId={refs["bottom"].current}>
                {bottom}
            </Portal>}
            {center && <Portal elId={refs["center"].current}>
                {center}
            </Portal>}
        </>
    );
}

const InnerField = ({ children, ...props }) => {
    /* const classes = useFieldStyles(props); */
    const { fieldStatus, updateFieldStatus, clearFieldStatus } = useContext(ParentContext);
    const { name, alias, label, alert, required, guides, forInput = true, noItemWrap = false, rule, allValues, /* localStatus, setLocalStatus, */ refMainAlertContainer, shouldUpdate, layout, addons } = props;
    const refs = {
        top: useRef(),
        left: useRef(),
        right: useRef(),
        bottom: useRef(),
        center: useRef(),
        container: refMainAlertContainer
    };
    /* const cssCenter = classNames("center", {"error": localStatus.status == "error" }, {"warning": localStatus.status == "warning" });
            const tooltipColor = (localStatus?.status == "warning" ? "orange" : "red"); */
    const nameId = (!alias) ? name : alias;
    const localStatus = fieldStatus[nameId];
    const cssCenter = classNames({ "error": localStatus?.status === "error" }, { "warning": localStatus?.status === "warning" });
    const tooltipColor = (localStatus?.status === "warning" ? "orange" : "red");

    return (
        <>
            <FieldRowTop ref={refs.top} guides={guides} layout={layout} />
            <FieldRowMiddle guides={guides} layout={layout}>
                <FieldLeft ref={refs.left} guides={guides} layout={layout} />
                <FieldCenter className={cssCenter} ref={refs.center} guides={guides} layout={layout}>



                    <Tooltip
                        title={(alert?.tooltip && (localStatus?.status === "error" || localStatus?.status === "warning")) && <InnerAlertFieldMessages nameId={nameId} messages={localStatus?.messages} />}
                        color={tooltipColor}
                    >
                        <div>
                            <FormItemWrapper nameId={nameId} name={name} shouldUpdate={shouldUpdate} forInput={forInput} rule={rule} allValues={allValues} noItemWrap={noItemWrap}>{children}</FormItemWrapper>
                        </div>
                    </Tooltip>



                </FieldCenter>
                <FieldRight ref={refs.right} guides={guides} layout={layout} />
            </FieldRowMiddle>
            <FieldBottom ref={refs.bottom} guides={guides} layout={layout} />
            <LabelRef refs={refs} {...label} nameId={nameId} required={required} guides={guides} />
            <AddOns refs={refs} addons={addons} />
            {alert?.container &&
                <AlertField refs={refs} fieldStatus={localStatus} /* fieldStatus={localStatus} */ nameId={nameId} {...alert} />
            }
        </>
    );
}


// const useAlertFieldStyles = createUseStyles({
//     alert: () => ({
//         "display": "flex",
//         "width": "100%",
//         /* "height": "100%", */
//         "alignItems": "center"
//     })
// });

const StyledAlertField = styled.div`
            display: flex;
            width: 100%;
            align-items: center;
            `;

const InnerAlertFieldMessages = ({ nameId, messages }) => {
    return (
        <div>
            {messages.map((v, i) => <div key={`fmsg-${nameId}-${i}`}>
                {v.message}
            </div>)
            }

        </div>
    );
}

/* const ContainerAlert = ({status, name})=>{
    const [errors,setErrors] = useState([]);
            const [warnings,setWarnings] = useState([]);
            const [infos,setInfos] = useState([]);
    
    useEffect(()=>{
                console.log("CONTAINER-ALERT-LIST->", name, "--", status);
    },[])


            return(<></>);

} */

/* const useAlerts = ({name, status}) => {
    const [errors, setErrors] = useState([]);
            const [warnings, setWarnings] = useState([]);
            const [infos, setInfos] = useState([]);

    useEffect(() => {
                console.log("USE - CONTAINER-ALERT-LIST->", name, "--", status);
    }, [])

            return {errors, warnings, infos};

} */

const AlertField = ({ fieldStatus, nameId, pos = "bottom", refs, container, ...props }) => {
    /*     const classes = useAlertFieldStyles(props); */
    const [domReady, setDomReady] = useState(false);
    React.useEffect(() => { setDomReady(true); }, []);
    const ref = (container === true) ? refs["container"].current : (container in refs) ? refs[pos].current : container;
    return (
        <Portal elId={ref}>
            {(fieldStatus?.status === "error" || fieldStatus?.status === "warning") &&
                <>
                    {pos !== "none" &&
                        <StyledAlertField>
                            <PointingLabel status={fieldStatus?.status} text={<InnerAlertFieldMessages name={nameId} messages={fieldStatus?.messages} />} position={pos} />
                        </StyledAlertField>
                    }
                    {/* <StyledAlertField>
                    <div className={classes.alert}>
                    {pos === "list" ?
                        <InnerAlertFieldMessages name={name} messages={fieldStatus?.messages} status={fieldStatus?.status} />
                        :
                        <PointingLabel status={fieldStatus?.status} text={<InnerAlertFieldMessages name={name} messages={fieldStatus?.messages} />} position={pos} />
                    }

                </StyledAlertField> */}
                </>
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


const StyledLabel = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children'].includes(prop)
})`
            ${({ width, align = "start", vAlign = "start", padding = "5px" }) => css`
            display: flex;
            flex-direction: row;
            align-items: ${vAlign};
            justify-content: ${align};
            padding: ${padding};
            width: ${width};
            height: 100%;
            font-weight: 600;
            font-size: 12px;
            line-height: 20px;
        `
    }
            ${({ guides }) => guides && css`
        margin: 2px;
        border: 1px dotted orange;
    `}

            ${({ pos, required, colon }) => (pos == "right") ? css`
        &:before{
            ${colon && css`
                content: ":";
                display: inline-block;
                margin-left: 1px;
            `}   
        }    
        &:after{
            ${required && css`
                content: "*";
                display: inline-block;
                color: red;
                margin-right: 4px;
            `}   
        }
    ` : css`
        &:before{
            ${required && css`
                content: "*";
                display: inline-block;
                color: red;
                margin-right: 4px;
            `}   
        }    
        &:after{
            ${colon && css`
                content: ":";
                display: inline-block;
                margin-left: 1px;
            `}   
        }
    `};

            label{
                ${({ wrap, ellipsis }) => ((!wrap && !ellipsis) && css`white-space: nowrap;`)}
            ${({ overflow, ellipsis }) => (!ellipsis) && `overflow: ${overflow ? "visible" : "hidden"};`}
            ${({ ellipsis }) => (ellipsis && css`
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `)}
    }


            `;


/* const useLabelStyles = createUseStyles({
                wrapper: ({pos, wrap = false, overflow = true, colon = true, ellipsis = true, width, align = "start", vAlign = "start", padding = "5px", required = false, guides}) => {
        return {
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
            ...(guides && {"margin": "2px", "border": "1px dotted orange" }),

            '& label': {
                ...((!wrap && !ellipsis) && { "whiteSpace": "nowrap" }),
                ...(!ellipsis && {"overflow": overflow ? "visible" : "hidden" }),
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
        }
    }
}); */

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
    const { pos = "top", text = "", enabled = true, colon = true, required = false, className, style, container = {}, nameId } = props;
    const { width = ((pos === "left" || pos === "right") && "100px") } = props;
    //const classes = useLabelStyles({...props, width});

    return (
        <StyledLabel {...props} width={width} ellipsis={false} overflow={true}>
            {/* <div className={classNames(classes.wrapper, className)} style={{ ...style }}> */}
            <label htmlFor={nameId} title={text}>
                {text}
            </label>
            {/* </div> */}
        </StyledLabel>
    );
}

export const LabelField = ({ index, ...props }) => {
    return (<FieldItem forInput={false} label={{ enabled: true, padding: "0px", pos: "center", ...props }} index={index} />);
}







/* const useFieldSetStyles = createUseStyles({
                fieldSet: ({grow = false, width, guides}) => ({
                ...(grow ?
                    {
                        "minWidth": width
                    }
                    : {
                        "minWidth": width,
                        "maxWidth": width
                    }),
        ...(guides && {"border": "1px solid green" })
    }),
            padding: ({padding}) => ({...(padding && { "padding": padding })}),
            margin: ({margin}) => ({...(margin && { "margin": margin })}),
            flex: ({layout = "horizontal", overflow = false}) => ({
                "display": "flex",
            "flexDirection": layout == "vertical" ? 'column' : 'row',
            "flexGrow": 0,
            "flexShrink": 0,
            "flexWrap": "nowrap",
            "overflow": overflow ? "visible" : "hidden"
    })
}); */



const StyledFieldSet = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children'].includes(prop)
})`
            ${({ grow = false, width }) => grow ? css`
            min-width: ${width};
        ` : css`
            min-width: ${width};
            max-width: ${width};
        `
    }

            ${({ margin, layout = "horizontal", overflow = false }) => !margin && css`
        display: flex;
        flex-direction:  ${layout == "vertical" ? 'column' : 'row'};
        flex-grow: 0;
        flex-shrink: 0;
        flex-wrap: nowrap;
        overflow: ${overflow ? "visible" : "hidden"};
    `}
            ${({ padding, margin }) => (padding && !margin) && css`padding: ${padding};`}
            ${({ margin }) => margin && css`margin: ${margin};`}

            ${({ guides }) => guides && css`
        border: 1px solid green;
    `}
            `;

const StyledWrapperFieldSet = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['className', 'style', 'children'].includes(prop)
})`
            ${({ margin, padding, layout = "horizontal", overflow = false }) => css`
    ${(layout == "vertical") ? css`flex-direction:column;` : css`flex-direction:row;`}
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    flex-wrap: nowrap;
    overflow: ${overflow ? "visible" : "hidden"};
    ${(padding) && css`padding: ${padding};`}
    ${margin && css`margin: ${margin};`}
    `}
            `;

/**
 *
 * @param {*} wide Tamanho do FieldSet, tipo de dados: {int entre 1 e 16 | array no formato [int,int,'*'] }  (Atenção! wide(default) e split são mutuamente exclusivos)
            * @param {*} split Tamanho do FieldSet, divide o espaço (16) pelo número de vezes indicada (Atenção! wide(default) e split são mutuamente exclusivos)
            *
            * @returns
            */
export const FieldSet = ({ children, ...props }) => {
    const parentProps = useContext(ParentContext);
    const { style, ...myProps } = inheritSelf(props, parentProps?.fieldSet);
    /*     const classes = useFieldSetStyles(myProps); */
    const refMainAlertContainer = useRef();
    const { parentPath = '' } = props;
    return (
        <StyledFieldSet {...myProps} {...(!myProps?.margin && { style: { ...style } })} className="fieldset">
            {/*         <div
            className={classNames(classes.fieldSet, { [classes.flex]: !myProps?.margin }, { [classes.padding]: !myProps?.margin })}
            {...(!myProps?.margin && { style: { ...style } })}
> */}
            <ParentContext.Provider value={propsToChildren(props, parentProps, refMainAlertContainer)}>
                <ConditionalWrapper
                    condition={myProps?.margin}
                    wrapper={children => <StyledWrapperFieldSet {...myProps} className={classNames(myProps?.className, "inner")}/* className={classNames(classes.flex, classes.margin, classes.padding, myProps?.className)} */ style={{ ...style }}>{children}</StyledWrapperFieldSet>}
                >
                    <>
                        {React.Children.map(Array.isArray(children) ? children.filter(v => v) : children, (child, i) => (
                            <>
                                {(React.isValidElement(child) && ['AlertsContainer', 'FieldItem', 'Item', 'Field', 'AddOn', 'LabelField'].includes(child.type.name)) ?
                                    React.cloneElement(child, { ...child.props, index: i, parentPath: `${parentPath}-${props.index}` }) :
                                    child}
                            </>
                        ))
                        }
                    </>
                </ConditionalWrapper>
            </ParentContext.Provider>
        </StyledFieldSet>
    );
}



/* const useFormLayoutStyles = createUseStyles({
                formLayout: ({layout = 'vertical', wrap = false, guides}) => ({
                ...(guides && { "border": "2px solid blue" }),
                "display": "flex",
            "flexDirection": layout == "horizontal" ? 'row' : 'column',
            "flexWrap": wrap ? "wrap" : "nowrap"
    })
}); */

const StyledFormLayout = styled('div').withConfig({
    shouldForwardProp: (prop) =>
        ['style', 'className', 'children'].includes(prop)
})`
            ${({ layout = 'vertical', wrap = false }) => css`
        display: flex;
        flex-direction: ${layout == "horizontal" ? 'row' : 'column'};
        flex-wrap: ${wrap ? 'wrap' : 'nowrap'};
    `}
            ${({ guides }) => guides && css`
        border: 2px solid blue;
    `}
            `;


/**
 *
 * @param {*} layout Disposição dos elementos [vertical,horizontal]
            * @param {*} field Parametros Globais a herdar pelo elemento Field (No override)
            * @param {*} fieldSet Parametros Globais a herdar pelo elemento FieldSet (No override)
            *
            * @returns
            */
// export const FormLayout = ({className, style, field, fieldSet, schema, children, id, ...props }) => {
//     /*     const classes = useFormLayoutStyles(props); */
//     const dataContext = {field, fieldSet, schema, layoutId: id };
//     if (!id) { throw new Error(`FormLayout key is Required!`) }
//     return (
//         <StyledFormLayout {...props} className={classNames("formlayout", className)} style={style}>

//             {/* <div className={classNames(classes.formLayout, className)} style={style}> */}
//             <ParentContext.Provider value={dataContext}>
//                 {
//                     React.Children.map(children, (child, i) => (
//                         <>
//                             {(React.isValidElement(child)) ? React.cloneElement(child, { ...child.props, index: i, parentPath: id }) : child}
//                         </>
//                     ))
//                 }
//             </ParentContext.Provider>

//         </StyledFormLayout>
//     );
// }

export const InputAddon = styled(Input)`
    .ant-input{
        text-align: right;
    }
    .ant-input-group-addon{
        background: #f5f5f5;
    }
 `;

export const FormLayout = ({ className, style, field, fieldSet, schema, children, id, fieldStatus, ...props }) => {
    if (!id) { throw new Error(`FormLayout key is Required!`) }
    const [localFieldStatus, setLocalFieldStatus] = useState({});
    const updateLocalFieldStatus = (field, status) => {
        setLocalFieldStatus(prev => ({ ...prev, [field]: status }));
    }
    const clearLocalFieldStatus = () => {
        setLocalFieldStatus({});
    }

    useEffect(() => {
        if (fieldStatus) {
            setLocalFieldStatus(fieldStatus);
        }
    }, [fieldStatus]);

    const dataContext = { field, fieldSet, schema, layoutId: id, fieldStatus: localFieldStatus, updateFieldStatus: updateLocalFieldStatus, clearFieldStatus: clearLocalFieldStatus };

    return (
        <StyledFormLayout {...props} className={classNames("formlayout", className)} style={style}>
            <ParentContext.Provider value={dataContext}>
                {
                    React.Children.map(children, (child, i) => (
                        <>
                            {(React.isValidElement(child)) ? React.cloneElement(child, { ...child.props, index: i, parentPath: id }) : child}
                        </>
                    ))
                }
            </ParentContext.Provider>
        </StyledFormLayout>
    );
}