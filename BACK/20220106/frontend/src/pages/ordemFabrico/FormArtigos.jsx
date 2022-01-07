import React, { useEffect, useState, Suspense } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL } from "config";
import Toolbar from "components/toolbar";
import List from "components/List";
import ButtonIcon from 'components/buttonIcon';
import ResultMessage from 'components/resultMessage';

import { Button, Input, Result } from "antd";
import Icon, { CloseCircleOutlined } from "@ant-design/icons";
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import { useNavigate } from "react-router-dom";


const InputAddon = styled(Input)`
    .ant-input{
        text-align: right;
    }
    .ant-input-group-addon{
        background: #f5f5f5;
    }
`;

const getListKey = (item) => {
    return `${item.SOHNUM_0}_${item.ITMREF_0}`;
}

const ArtigoDetails = ({ item, index, formData, onFormDataChange }) => {
    const key = getListKey(item);
    return (
        <>
            {key in formData &&
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <InputAddon id={`core-${index}`} style={{ width: 90, marginRight: "2px" }} suffix={<b>''</b>} addonBefore="Core" maxLength={1} onChange={(e) => onFormDataChange(e, item)} value={formData[key].core} />
                    <InputAddon id={`width-${index}`} style={{ width: 100, marginRight: "2px" }} suffix={<b>mm</b>} addonBefore="L" maxLength={4} onChange={(e) => onFormDataChange(e, item)} value={formData[key].width} />
                    <InputAddon id={`diam-${index}`} style={{ width: 100, marginRight: "2px" }} suffix={<b>mm</b>} addonBefore="&#8960;" maxLength={4} onChange={(e) => onFormDataChange(e, item)} value={formData[key].diam} />
                    <InputAddon id={`gram-${index}`} style={{ width: 90, marginRight: "2px" }} suffix={<b>gsm</b>} addonBefore="G" maxLength={3} onChange={(e) => onFormDataChange(e, item)} value={formData[key].gram} />
                </div>
            }
        </>
    );
}

const ListHeader = ({ item, index, formData, onFormDataChange }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", flex: 1, justifyContent: "space-between" }}>
            <div style={{ marginRight: "10px" }}>
                <div style={{ color: "#0050b3", fontSize: "16px", lineHeight: "24px", fontWeight: 600 }}>{item.BPCNAM_0}</div>
                <div style={{ fontSize: "14px", lineHeight: "22px", fontWeight: 500 }}>{item.ITMREF_0}</div>
                <div style={{ fontWeight: 400 }}>{item.ITMDES1_0}</div>
                <ArtigoDetails item={item} index={index} formData={formData} onFormDataChange={onFormDataChange} />
            </div>
            <div style={{ alignSelf: "flex-end" }}>
                <div style={{ color: "#8c8c8c", fontSize: "12px", lineHeight: "20px", fontWeight: 400 }}>Encomenda</div>
                <div style={{ fontSize: "14px", lineHeight: "22px", fontWeight: 500 }}>{item.SOHNUM_0}</div>
                <div style={{ fontSize: "14px", lineHeight: "22px", fontWeight: 400 }}>{item.PRFNUM_0}</div>
                <InputAddon disabled style={{ width: 120 }} suffix={<b>m<sup>2</sup></b>} addonBefore="Qtd." value={item.DSPTOTQTY_0 / 1000} />
            </div>
        </div>
    );
}

const ListActions = ({ removeItem }) => {
    return (<ButtonIcon icon={<CloseCircleOutlined style={{ color: "red" }} />} onClick={() => removeItem()} />);
}


export default ({ dataSource, setDataSource, footerRef, closeParent, reloadDataTable }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [resultMessage, setResultMessage] = useState({ status: "none" });

    const updateFormData = (item, data) => {
        const key = getListKey(item);
        if (key in formData) {
            data[key] = { ...formData[key] };
            return;
        }
        data[key] = {
            qty: item.DSPTOTQTY_0 / 1000,
            ITMREF_0: item.ITMREF_0,
            SOHNUM_0: item.SOHNUM_0,
            BPCORD_0: item.BPCORD_0,
            changed: false,
            new: false
        };
        if (item.id) {
            data[key].nw1 = item.nw1;
            data[key].nw2 = item.nw2;
            data[key].width = item.lar;
            data[key].formula = item.formu;
            data[key].diam = item.diam_ref;
            data[key].core = item.core;
            data[key].gram = item.gsm;
            data[key].gtin = item.gtin;
            return;
        }

        const des = item.ITMDES1_0.split(' ').reverse();
        data[key].new = true;
        for (let v of des) {
            if (!("core" in data[key]) && (v.includes("''") || v.includes("'"))) {
                data[key].core = v.replaceAll("'", "");
                continue;
            }
            if (!("width" in data[key]) && (v.toLowerCase().startsWith('l'))) {
                data[key].width = v.toLowerCase().replaceAll("l", "");
                continue;
            }
            if (!("diam" in data[key]) && (v.toLowerCase().startsWith('d'))) {
                data[key].diam = v.toLowerCase().replaceAll("d", "");
                continue;
            }
            if (!("gram" in data[key]) && (v.toLowerCase().startsWith('g') || (!isNaN(v) && Number.isInteger(parseFloat(v))))) {
                data[key].gram = v.toLowerCase().replaceAll("g", "");
                continue;
            }
        }
    }

    useEffect(() => {
        let data = {};
        for (let item of dataSource) {
            updateFormData(item, data);
        }
        setFormData({ ...data });
    }, [dataSource]);

    const removeItem = (item) => {
        const data = dataSource.filter((v) => (v.ITMREF_0 !== item.ITMREF_0 || v.SOHNUM_0 !== item.SOHNUM_0));
        setDataSource(data);
    }

    const onFinish = async () => {
        const response = await fetchPost({ url: `${API_URL}/newordemfabrico/`, parameters: formData });
        console.log("ENTREI NO ONFINISH", response.data);
        setResultMessage(response.data);
    };

    const onFormDataChange = (e, item) => {
        const key = getListKey(item);
        const property = e.target.id.split('-')[0];
        console.log("CHANGE--->", key, property);
        setFormData(prev => ({
            ...prev,
            [key]: { ...prev[key], [property]: e.target.value, changed: true }
        }));
    }

    const onSuccessOK = () => {
        console.log("BEFORE-NAVIGATE", { ...resultMessage });
        navigate('/app/ordemfabrico/formdetails', { state: { ...resultMessage } });
    }

    const onErrorOK = () => {
        setResultMessage({ status: "none" });
    }

    const onClose = (reload = false) => {
        if (reload) {
            reloadDataTable();
        }
        setDataSource([]);
        closeParent();
    }

    return (
        <>

            <ResultMessage
                result={resultMessage}
                successButtonOK={<Button type="primary" key="goto-of" onClick={onSuccessOK}>Ir para Ordem de Fabrico</Button>}
                successButtonClose={<Button key="goto-close" onClick={() => onClose(true)}>Fechar</Button>}
                errorButtonOK={<Button type="primary" key="goto-ok" onClick={onErrorOK}>OK</Button>}
                errorButtonClose={<Button key="goto-close" onClick={onClose}>Fechar</Button>}
            >
                {dataSource.length > 0 && <Toolbar center={<Button block type="primary" size="small" onClick={onFinish}>Registar</Button>} />}
                <List dataSource={dataSource} listItemStyle={{ marginBottom: "20px", marginTop: "5px", paddingBottom: "5px", borderBottom: "solid 1px #f0f0f0" }} render={
                    (item, idx) => (
                        <>
                            <List.ItemHeader
                                leftStyle={{ width: "100%", marginRight: "20px" }}
                                left={<ListHeader index={idx} item={item} formData={formData} onFormDataChange={onFormDataChange} /* form={form} */ />}
                                right={<ListActions removeItem={() => removeItem(item)} />}
                            />
                        </>
                    )
                }
                />

            </ResultMessage>
        </>
    );
}