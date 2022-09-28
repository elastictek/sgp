import React, { useEffect, useState, useCallback, useRef, useMemo, useContext } from 'react';
import { AppContext } from '../pages/App';

export const usePermission = ({ allowed = {} } = {}) => {
    const { auth } = useContext(AppContext);
    const allowedKeys = Object.keys(allowed);
    const permissionKeys = Object.keys(auth.permissions);

    const allow = (_allowed = null, forInput = null) => {
        if (Array.isArray(forInput)){
            if (forInput.includes(false)){
                return false;
            }
        }
        if (forInput === false || !auth.isAuthenticated) {
            return false;
        }
        if (auth.isAdmin){
            return true;
        }
        let min = null;
        let value = -1;
        const aKeys = (_allowed) ? Object.keys(_allowed) : allowedKeys;
        const a = (_allowed) ? _allowed : allowed;
        for (const k of permissionKeys) {
            if (aKeys.includes(k)) {
                min = (min > a[k] || min===null) ? a[k] : min;
                value = (value < auth.permissions[k]) ? auth.permissions[k] : value;
            }
        }
        if (min <= value) {
            return true;
        }
        return false;
    }

    return { auth, allow };
}