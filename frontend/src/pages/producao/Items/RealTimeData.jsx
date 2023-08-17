import React, { useEffect, useState, useCallback, useRef, useContext, Suspense, lazy } from 'react';
import { ExpandAltOutlined } from '@ant-design/icons';
import { Button } from "antd";

export default ({ data, onLineLogExpand }) => {
    return (<div style={{ display: "flex", justifyContent: "space-between" }}>
        {data && <>
            <div></div>
            <div>
                <span style={{ fontSize: "10px", fontWeight: 400, marginRight: "10px" }}>Tempo restante</span>
                <span style={{ fontWeight: 700, fontSize: "14px" }}>{data?.time_bobinagem?.split(':').map(num => num.padStart(2, '0')).join(':')}</span>
            </div>
            <div><Button type="primary" size="small" onClick={onLineLogExpand} ghost icon={<ExpandAltOutlined />} /></div>
        </>}
    </div>);
}