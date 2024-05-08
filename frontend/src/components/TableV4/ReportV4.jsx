import React, { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react';
import { Button, Menu, Dropdown, InputNumber, Popover, Select, message, Checkbox } from "antd";
import { FilePdfTwoTone, FileExcelTwoTone, FileWordTwoTone, FileFilled, DownOutlined } from '@ant-design/icons';
import axios from 'axios';
import uuIdInt from "utils/uuIdInt";
import YScroll from 'components/YScroll';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';


/* const menuItems = [
    { label: 'Packing List', key: 'pl-pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} /> },
    { label: 'Packing List', key: 'pl-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} /> },
    { label: 'Packing List Detalhado', key: 'pld-pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} /> },
    { label: 'Packing List Detalhado', key: 'pld-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} /> }
]; */

/* const menu = (
    <Menu onClick={(v) => exportFile(v)}>
        <Menu.Item key="pdf" icon={<FilePdfTwoTone twoToneColor="red" />}>Pdf</Menu.Item>
        <Menu.Item key="excel" icon={<FileExcelTwoTone twoToneColor="#52c41a" />}>Excel</Menu.Item>
        <Menu.Item key="word" icon={<FileWordTwoTone />}>Word</Menu.Item>
    </Menu>
); */

export const downloadFile = (data, filename, mime, bom) => {
    var blobData = (typeof bom !== 'undefined') ? [bom, data] : [data]
    var blob = new Blob(blobData, { type: mime || 'application/octet-stream' });
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        var blobURL = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
        var tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = blobURL;
        tempLink.setAttribute('download', filename);

        // Safari thinks _blank anchor are pop ups. We only want to set _blank
        // target if the browser does not support the HTML5 download attribute.
        // This allows you to download files in desktop safari if pop up blocking
        // is enabled.
        if (typeof tempLink.download === 'undefined') {
            tempLink.setAttribute('target', '_blank');
        }

        document.body.appendChild(tempLink);
        tempLink.click();

        // Fixes "webkit blob resource error 1"
        setTimeout(function () {
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobURL);
        }, 200);
    }
};

const PopupProgress = ({ controller, content, messageKey }) => {

    const oc = () => {
        message.destroy(messageKey);
        controller.abort();
    }
    return (<div>
        <Button size="small" style={{ marginBottom: "5px" }} onClick={oc}>Cancelar</Button>
        {content}
    </div>);
}


const getMenuItems = (items) => {
    //if (items.length === 0) {
    return [
        { label: 'Pdf', key: 'pdf', icon: <FilePdfTwoTone twoToneColor="red" style={{ fontSize: "18px" }} />, data: { orientation: "landscape", extension: "pdf" } },
        { label: 'Excel', key: 'excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { orientation: "landscape", extension: "xlsx" } },
        { label: 'Excel (Sem formatação)', key: 'clean-excel', icon: <FileExcelTwoTone twoToneColor="#52c41a" style={{ fontSize: "18px" }} />, data: { orientation: "landscape", extension: "xlsx" } },
        // { label: 'Word', key: 'word', icon: <FileWordTwoTone style={{ fontSize: "18px" }} />, data: { orientation: "landscape", extension: "docx" } }
        ...items
    ];
    //}
    //return items;
}

const Content = ({ menuItems, limit, setLimit, orientation, setOrientation, notListed, setNotListed, setIsDirty, onClick }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <YScroll height="180px">
            <Menu onClick={(v) => onClick(v)} items={menuItems}></Menu>
            </YScroll>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}><div><b>Max. Linhas:</b></div><InputNumber min={100} max={50000} size="small" value={limit} onChange={(v) => { setIsDirty(true); setLimit(v); }} style={{ marginLeft: "5px", marginBottom: "5px", marginTop: "5px" }} /></div>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "end" }}><Checkbox checked={notListed} onChange={(e) => { setIsDirty(true); setNotListed(e.target.checked); }}>Colunas não listadas</Checkbox></div>
            <Select value={orientation} onChange={(v) => { setIsDirty(true); setOrientation(v); }} size="small" options={[{ value: "landsacpe", label: "Horizontal" }, { value: "vertical", label: "Vertical" }]} />
        </div>
    );
}


export const downloadReport = async ({ dataAPI, url, method, type, dataexport, limit, title, orientation, isDirty, columns, notListed }) => {
    const requestData = dataAPI.getPostRequest({ url });
    const _orientation = (!isDirty && dataexport?.orientation) ? dataexport?.orientation : orientation.value;
    const _notListed = (!isDirty && dataexport?.notListed) ? dataexport?.notListed : notListed;
    const _type = (!isDirty && dataexport?.export) ? dataexport?.export : type.key;
    const _title = (dataexport?.title) ? dataexport?.title : title;


    let cols = {};
    if (Array.isArray(columns)) {
        for (const v of columns) {
            const def = v?.getDefinition() || {};
            const params = def?.cellRendererParams;
            cols[params?.report?.col ? params.report.col : (v?.colId ? v.colId : def?.field)] = {
                field: def?.field ? def?.field : v?.colId,
                reportField: params?.report?.col ? params.report.col : null,
                title: def?.headerName && typeof def.headerName !== "object" ? def.headerName : def?.field,
                format: params?.report?.format && params?.report?.format,
                width: params?.report?.width ? params.report.width : (def?.width ? def.width : (def?.minWidth ? def.minWidth : 100)),
                visible: params?.report?.hide === true ? false : (params?.report?.hide === false ? true : (def?.hide === true ? false : true))
            }
        }
    } else {
        cols = columns;
    }

    requestData.parameters = {
        ...requestData.parameters,
        "config": "default",
        ...(_title) && { title: _title },
        "template": `TEMPLATES-LIST/LIST-A4-${_orientation.toUpperCase()}`,
        "export": _type,
        "orientation": _orientation.toUpperCase(),
        "notListed": _notListed,
        "limit": limit ? limit : 5000,
        ...(columns) && { cols },
        ...dataexport
    };
    const { filter = {}, sort = [], pagination = {}, parameters = {}, apiversion } = requestData;
    const fetch = { url: requestData.url, method: "post", responseType: "blob", data: { sort, filter, pagination, parameters: { ...parameters, ...(method && { method }) }, options: requestData?.options } };
    const controller = new AbortController();
    let mkey = uuIdInt(4);
    message.loading({
        key: mkey,
        content: <PopupProgress messageKey={mkey} controller={controller} content={<div>A exportar, aguarde um momento, Por favor...[Limite {limit} linhas]</div>} />,
        duration: 0,
        style: {
            marginRight: '5px',
        }
    });

    const response = await axios({
        ...fetch,
        signal: controller.signal
    });
    message.destroy(mkey);
    downloadFile(response.data, `list-${new Date().toJSON().slice(0, 10)}.${dataexport.extension}`);
}


export default ({ button, items = [], onExport, dataAPI, title, columns, onClick: _onClick }) => {
    const [isDirty, setIsDirty] = useState(false);
    const [limit, setLimit] = useState(10000);
    const [notListed, setNotListed] = useState(true);
    const [orientation, setOrientation] = useState({ value: "landscape", label: "Horizontal" });
    const menuItems = getMenuItems(items, limit, setLimit);

    const onClick = async (type) => {
        _onClick(); //To hide the settings popover
        if (onExport) {
            if (!onExport(type, limit, orientation, isDirty, notListed)) {
                return false;
            }
        }
        let dataexport = menuItems.filter(v => v.key === type.key)[0]?.data;
        await downloadReport({ dataAPI, type, dataexport, columns, limit, orientation, title, isDirty, notListed });
    }

    return (
        <Content setIsDirty={setIsDirty} orientation={orientation} setOrientation={setOrientation} setNotListed={setNotListed} notListed={notListed} limit={limit} setLimit={setLimit} onClick={onClick} menuItems={menuItems} />
    );
}