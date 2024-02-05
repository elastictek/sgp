import React, { useEffect, useState, useCallback, useRef, useMemo, useContext } from 'react';
import { fetch, fetchPost } from "utils/fetch";
import { useLocation } from 'react-router-dom';
import { API_URL } from "config";
import { json } from "./object";
import { ConditionalWrapper } from "components/conditionalWrapper";
import { AppContext } from '../pages/App';

/**
 * Objecto React que em caso de ter ou não permissão faz o render
 * example.1  <Permissions permissions={permission} action="teste"><SampleObject/></Permissions>
 * O atributo permission é o objeto iniciado por -> const permission = usePermission({});
 */
export const Permissions = ({ permissions, action = null, item = null, forInput = null, onPlace = null, clone, children, log, ...props }) => {
    return (
        <ConditionalWrapper
            condition={!permissions || !permissions?.isOk({ action, item, forInput, onPlace, log })}
            wrapper={children => <></>}
        >

            {!clone && children}
            {clone && React.cloneElement(children, { ...children.props, ...props })}

        </ConditionalWrapper>
    );
}

const loadPermissions = async ({ name, module,path }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/permissions/sql/`, pagination: { limit: 1 }, filter: { name, module,path }, parameters: { method: "PermissionsLookup" } });
    if (rows?.length > 0) {
        return rows[0];
    }
    return {};
}

export const usePermission = ({ load = true, allowed = {}, name, module = 'main', item: globalItem, permissions:objPermissions } = {}) => {
    const [permissions, setPermissions] = useState();
    const { auth } = useContext(AppContext);
    const userKeys = Object.keys(auth.permissions);
    const loc = useLocation();
    const allowedKeys = Object.keys(allowed); //deprecated
    const permissionKeys = Object.keys(auth.permissions); //deprecated
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        loadData({ signal: controller.signal });
        return (() => controller.abort());
    }, []);

    const loadData = async ({ signal } = {}) => {
        if (objPermissions){
            //console.log("start--",objPermissions)
            setPermissions(objPermissions);
        }else if (load) {
            //console.log("isAdmin is commented, uncomment!!!!!")
            console.log("Permissions Location/Name:", name ? name : loc.pathname.replace(/\:$/, ''), " module:", module)
            const _perm = await loadPermissions({ path: loc.pathname.replace(/\:$/, ''), ...name && { name }, module });
            setPermissions(json(_perm?.permissions));
        }
        setLoaded(true);
    }

    const loadInstantPermissions = async ({ name, module = "main", set = false }) => {
        const _perm = await loadPermissions({ path: loc.pathname.replace(/\:$/, ''), ...name && { name }, module });
        if (set) {
            setPermissions(json(_perm?.permissions));
        }
        return json(_perm?.permissions);
    }

    const setInstantPermissions = async ({ objPermissions, set = false }) => {
        if (set) {
            setPermissions(objPermissions);
        }
        return json(objPermissions);
    }

    const isOk = ({ action = null, item = null, forInput = null, onPlace = null, log = null, instantPermissions = null }) => {
        //onPlace - indica as permissões mínimas para ter acesso, sobrepõe-se às "permissions" definidas em app_permissions 
        //example.1 {createRecord: {rolename: 200}} | Gives permission to "rolename" to action ("createRecord") if level is at least 200
        //example.2 {formA: { createRecord: {rolename: 200}}} | Gives permission to "rolename" to action ("createRecord") if level is at least 200 on item ("formA")
        const _permissions = (instantPermissions) ? instantPermissions : permissions;
        if (!item && globalItem) {
            item = globalItem;
        } else if (!item && _permissions) {
            //deprecated (not needed)
            //item = Object.keys(_permissions)[0];
        }
        if (Array.isArray(forInput)) {
            if (forInput.includes(false)) {
                return false;
            }
        }
        if (forInput === false || !auth.isAuthenticated) {
            return false;
        }
        if (auth.isAdmin) {
            return true;
        }
        if (!_permissions) {
            return false;
        }
        let min = null;
        let value = -1;
        let p = (onPlace) ? json(onPlace) : (item) ? (_permissions[item] ? _permissions[item][action] : null) : _permissions[action];
        if (!p) {
            p = (item) ? (_permissions[item] ? ((_permissions[item]["default"]) ? _permissions[item]["default"] : _permissions["default"]) : null) : _permissions["default"];
        }
        if (!p) {
            return false;
        }
        const pKeys = Object.keys(p);
        for (const k of userKeys) {
            if (pKeys.includes(k)) {
                min = (min === null || min > p[k]) ? p[k] : min;
                value = (value < auth.permissions[k]) ? auth.permissions[k] : value;
            }
        }
        if (min <= value) {
            return true;
        }
        return false;
    }


    //deprecated
    const allow = (_allowed = null, forInput = null) => {
        if (Array.isArray(forInput)) {
            if (forInput.includes(false)) {
                return false;
            }
        }
        if (forInput === false || !auth.isAuthenticated) {
            return false;
        }
        if (auth.isAdmin) {
            return true;
        }
        let min = null;
        let value = -1;
        const aKeys = (_allowed) ? Object.keys(_allowed) : allowedKeys;
        const a = (_allowed) ? _allowed : allowed;
        for (const k of permissionKeys) {
            if (aKeys.includes(k)) {
                min = (min > a[k] || min === null) ? a[k] : min;
                value = (value < auth.permissions[k]) ? auth.permissions[k] : value;
            }
        }
        if (min <= value) {
            return true;
        }
        return false;
    }

    return { isReady:loaded,loaded,auth, allow, permissions, name: name ? name : loc.pathname, module, isOk, loadInstantPermissions, setInstantPermissions };
}