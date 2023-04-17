import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';

export const openNotification = (api) => (status, placement, message, description, duration = 5,style) => {
    let _description = null;
    if (Array.isArray(description)) {
        _description = <ul>{description.map((v,i) => <li style={{padding:"0px"}} key={`not-${i}`}>{v}</li>)}</ul>;
    } else {
        _description = description;
    }

    if (status === "error") {
        api.error({
            message: message ? message : `Notificação`,
            description: _description,
            placement,
            duration,
            style:{...style && style}
        });
    } else if (status === "success") {
        api.success({
            message: message ? message : `Notificação`,
            description: _description,
            placement,
            duration,
            style:{...style && style}
        });
    } else {
        api.info({
            message: message ? message : `Notificação`,
            description: _description,
            placement,
            duration,
            style:{...style && style}
        });
    }
};
