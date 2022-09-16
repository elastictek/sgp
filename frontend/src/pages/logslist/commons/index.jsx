import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import ResponsiveModal from "components/ResponsiveModal";
import YScroll from "components/YScroll";
import { Space, Typography, Form, Button, Menu, Dropdown, Switch, Select, Tag, Tooltip, Popconfirm, notification, Spin, Modal, InputNumber, Checkbox, Badge } from "antd";
import { useSubmitting, noValue } from "utils";
import { GiBandageRoll } from 'react-icons/gi';
import { AiOutlineVerticalAlignTop, AiOutlineVerticalAlignBottom } from 'react-icons/ai';
import { VscDebugStart } from 'react-icons/vsc';
import { BsFillStopFill } from 'react-icons/bs';
import { IoCodeWorkingOutline } from 'react-icons/io5';


export const EventColumn = ({ v }) => {
    return (<>

        {v === "reeling_exchange" && <GiBandageRoll color="#69c0ff" size={20} />}
        {v === "state_stop" && <BsFillStopFill color="red" size={20} />}
        {v === "state_start" && <VscDebugStart color="orange" size={20} />}
        {v === "state_working" && <IoCodeWorkingOutline color="green" size={20} />}
        {v === "nw_sup_change" && <AiOutlineVerticalAlignTop size={20} />}
        {v === "nw_inf_change" && <AiOutlineVerticalAlignBottom size={20} />}

    </>);
}

export const doserConsume = (d, dlag, dreset, event) => {
    if (event !== 1) {
        return null;
    }
    let _d = noValue(d, 0);
    let _dlag = noValue(dlag, 0);
    let _dreset = noValue(dreset, 0);
    return <div style={{ textAlign: "right" }}>{((((_d < _dlag) ? _dreset : 0) + _d) - _dlag).toFixed(2)} kg</div>;

}




export const WndTitle = ({ data }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Space>
                    <div><b style={{ textTransform: "capitalize" }}></b>{data.title}</div>
                </Space>
            </div>
        </div>
    );
}

export const Wnd = ({ show, setShow, children }) => {
    const [confirmLoading, setConfirmLoading] = React.useState(false);

    const handleCancel = () => {
        setShow({...show, show: false, data: {} });
    };

    return (
        <>
            <ResponsiveModal
                title={<WndTitle data={show.data} />}
                visible={show.show}
                centered
                responsive
                onCancel={handleCancel}
                maskClosable={true}
                destroyOnClose={true}
                fullWidthDevice={show?.fullWidthDevice ? show.fullWidthDevice : 100}
                minFullHeight={show?.minFullHeight}
                width={show?.width}
                height={show?.height}
                /* bodyStyle={{ backgroundColor: "#f0f0f0" }} */
            >
                <YScroll>
                    {children}
                    {/* <Suspense fallback={<></>}>{<BobinesValidarList data={show.data} closeSelf={handleCancel} />}</Suspense> */}
                </YScroll>
            </ResponsiveModal>
        </>
    );
};