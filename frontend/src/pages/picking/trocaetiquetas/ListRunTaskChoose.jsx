import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL, DATE_FORMAT } from "config";
import { useDataAPI, parseFilter } from "utils/useDataAPIV4";
import { usePermission, Permissions } from "utils/usePermission";
import ToolbarTitle from 'components/ToolbarTitleV3';
import TaskChoose from './TaskChoose';

const title = "Troca de Etiquetas";
const subTitle = "1. Selecione a tarefa...";
const TitleForm = ({ level, auth, hasEntries, onSave, loading, title,subTitle }) => {
    return (<ToolbarTitle disabled={loading} id={auth?.user} description={title}
        leftTitle={<span style={{}}>{title}</span>}
        {...subTitle && {leftSubTitle:<span style={{}}>{subTitle}</span>}}
    />);
}

export default ({ noid = false, defaultFilters = {}, baseFilters: _baseFilters, defaultSort = [], onClick, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const permission = usePermission({ name: "checklist" });

    const onSelectionChanged = (rows) => {
        if (rows && rows.length > 0) {
            navigate("/app/picking/trocaetiquetas/listrunbobinechoose", { state: { action: "run", ...rows[0] } });
        }
    }

    return (
        <>
            <TitleForm auth={permission.auth} level={location?.state?.level} title={props?.title ? props.title : title} subTitle={props?.subTitle ? props.subTitle : subTitle} />
            <TaskChoose
                noid={true}
                baseFilters={{ ...parseFilter("type", "==1", { type: "number" }), ...parseFilter("status", "==1", { type: "number" }) }}
                defaultSort={[{ column: "timestamp", direction: "DESC" }]}
                permission={permission}
                onClick={onSelectionChanged}
            />
        </>
    );

}