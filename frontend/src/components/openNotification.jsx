import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import YScroll from './YScroll';
import { Alert } from 'antd';

export const openNotification = (api) => (status, placement, message, description, duration = 5, style) => {
    let _description = null;
    if (Array.isArray(description)) {
        _description = <YScroll maxHeight="60vh"><ul>{description.map((v, i) => <li style={{ padding: "0px" }} key={`not-${i}`}>{v}</li>)}</ul></YScroll>;
    } else {
        _description = <YScroll maxHeight="60vh">{description}</YScroll>;
    }

    if (status === "error") {
        api.error({
            message: message ? message : `Notificação`,
            description: <Alert message={_description} type="error" />,
            placement,
            duration,
            style: { width: "600px", ...style && style }
        });
    } else if (status === "success") {
        api.success({
            message: message ? message : `Notificação`,
            description: <Alert message={_description} type="success" />,
            placement,
            duration,
            style: { width: "384px", ...style && style }
        });
    } else {
        api.info({
            message: message ? message : `Notificação`,
            description: _description,
            placement,
            duration,
            style: { width: "384px", ...style && style }
        });
    }
};
