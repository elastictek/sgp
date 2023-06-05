import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { Form, Tooltip, Drawer, Modal, Button, Input, Tag, AutoComplete, Select, Switch, Alert, Checkbox, Spin, DatePicker, InputNumber, TimePicker } from "antd";
import { orderObjectKeys, json } from "utils/object";

export default ({ value }) => {
    const v = json(value);
    return (
        <div>
            <div style={{ fontWeight: 600 }}>Cortes</div>
            <div style={{ border: "dashed 1px #d9d9d9", display: "flex", flexDirection: "row", height: "28px", alignItems: "center", background: "#f0f0f0", padding: "0px 10px" }}>{Object.keys(v).map(x => {
                return <div style={{ marginRight: "5px" }} key={`c-${x}${v[x]}`}>{x}x{v[x]}</div>
            })}
            </div>
        </div>
    );
}