import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import YScroll from './YScroll';
import { Alert } from 'antd';

export const openNotification = (api) => (status, placement, message, description, duration = 5, style, { distinct } = { distinct: true }) => {
    let _description = null;
    let _d = null;
    if (Array.isArray(description)) {
        _d = (distinct) ? [...new Set(description)] : description;
        _description = <YScroll maxHeight="60vh"><ul>{_d.map((v, i) => <li style={{ padding: "0px" }} key={`not-${i}`}>{v}</li>)}</ul></YScroll>;
    } else if (typeof description === 'object') {
        if (distinct) {
            const flatMessages = Object.values(description)
                .filter(value => value !== null)
                .flatMap(messages => messages.map(obj => obj.message));
            _d = [...new Set(flatMessages)];
        } else {
            _d = description;
        }
        _description = <YScroll maxHeight="60vh"><ul>{_d.map((v, i) => <li style={{ padding: "0px" }} key={`not-${i}`}>{v}</li>)}</ul></YScroll>;
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
