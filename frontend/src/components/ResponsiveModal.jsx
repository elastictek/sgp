import React, { useEffect, useLayoutEffect, useState, useCallback, useRef, useContext } from 'react';
import styled from 'styled-components';
import { Space, Popconfirm, Popover, Button, Modal } from 'antd';
import YScroll from './YScroll';
import { MediaContext } from '../pages/App';

const computeHeight = (height, footer) => {
    if (footer) {
        console.log("CALCULATE -- > ",`calc(${height} - 120px)`);
        return `calc(${height} - 120px)`;
    }
    console.log("CALCULATE -- > ",`calc(${height} - 60px)`);
    return `calc(${height} - 60px)`;
}

export default ({ children, footer = null, ...props }) => {
    const ctx = useContext(MediaContext);
    const { responsive = false, width, height ="100vh", bodyStyle, destroyOnClose = true, maskClosable = true, centered = true, visible, title, onCancel, fullWidthDevice = 1, minFullHeight = 0, ...rest } = props;
    const [respWidth, setRespWidth] = useState(width);
    const [respHeight, setRespHeight] = useState(height);

    useLayoutEffect(() => {
        if (responsive) {
            if (ctx.deviceW <= fullWidthDevice) {
                setRespWidth("100%");
            } else {
                setRespWidth(width);
            }
            if (ctx.windowDimension.height <= minFullHeight) {
                setRespHeight(computeHeight("100vh", footer));
            } else {
                setRespHeight(computeHeight(height, footer));
            }
        }
    }/* , [ctx.deviceW, ctx.windowDimension,width,height,fullWidthDevice,minFullHeight] */);

    return (
        <Modal
            title={title}
            visible={visible}
            centered={centered}
            onCancel={onCancel}
            maskClosable={maskClosable}
            footer={footer}
            destroyOnClose={destroyOnClose}
            bodyStyle={bodyStyle ? ({ height: respHeight, ...bodyStyle }) : ({ height: respHeight })}
            width={respWidth}
            {...rest}
        >
            <YScroll>
                {children}
            </YScroll>
        </Modal>
    );
}