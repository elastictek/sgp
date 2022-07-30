import React, { useEffect, useState, useCallback, useRef, Suspense, useContext, useLayoutEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import YScroll from "components/YScroll";
import { Modal } from "antd";

import { MediaContext } from '../pages/App';


const TitleModal = ({ title, eTitle }) => {
    const getTitle = () => {
        if (title) {
            return title;
        }
        return (eTitle === null || eTitle.title === '') ? null : eTitle.title;
    }

    return (
        <div><b style={{ textTransform: "capitalize" }}></b>{getTitle()}</div>
    );
}



export default ({ responsive = true, width = 800, height = 300, children, footer, title: iTitle, lazy=false, ...props }) => {
    const [size, setSize] = useState({ width, height, fullscreen: false, computed: false });
    const [title, setTitle] = useState(null);
    const ctx = useContext(MediaContext);
    const footerRef = useRef();

    useLayoutEffect(() => {
        if (responsive) {
            const _size = size;
            if (ctx.windowDimension.width <= width) {
                _size.width = "100vw";
                _size.height = "calc(100vh - 90px)";
                _size.fullscreen = true;
                _size.computed = true;
            } else {
                _size.width = width;
                _size.height = height;
                _size.fullscreen = false;
                _size.computed = true;
            }
            setSize({ ..._size });
        }
    }, [ctx.windowDimension]);


    const footerButtons = () => {
        if (footer === "ref") {
            return <div ref={footerRef} style={{ textAlign: 'right' }}></div>;
        } else {
            return footer;
        }
    }

    const wrapWithClose = (method) => async () => {
        method && await method();
        if (props?.onCancel) {
            props.onCancel();
        }
    };

    return (
        <>
            {size.computed &&
                <Modal
                    title={<TitleModal title={iTitle} eTitle={title} />}
                    visible={true}
                    centered={size.fullscreen ? false : true}
                    maskClosable={true}
                    destroyOnClose={true}
                    okText="Confirmar"
                    cancelText="Cancelar"
                    width={size.width}
                    {...(footer && { footer: footerButtons() })}
                    bodyStyle={{ height: size.height }}
                    style={{ ...(size.fullscreen && { top: "0px", margin: "0px", maxWidth: size.width, paddingBottom: "0px" }) }}
                    {...props}
                >
                    <YScroll>
                        {(children && lazy) && <Suspense fallback={<></>}>{React.cloneElement(children, { ...children.props, ...{ wndRef: footerRef, parentRef: footerRef, setFormTitle: setTitle, setTitle: setTitle, closeSelf: wrapWithClose(props?.onCancel), closeParent: wrapWithClose(props?.onCancel) } })}</Suspense>}
                        {(children && !lazy) && React.cloneElement(children, { ...children.props, ...{ wndRef: footerRef, parentRef: footerRef, setFormTitle: setTitle, setTitle: setTitle, closeSelf: wrapWithClose(props?.onCancel), closeParent: wrapWithClose(props?.onCancel) } })}
                    </YScroll>
                </Modal>
            }
        </>
    );
}