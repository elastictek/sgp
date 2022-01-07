import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import styled from "styled-components";
import classNames from "classnames";
import { createUseStyles } from 'react-jss';
import * as R from "ramda";
import { ConditionalWrapper } from './conditionalWrapper';
import Portal from "./portal";
import "./css/label.css"

const pointer = (pos) => {
    switch (pos) {
        case "left": return "right";
        case "right": return "left";
        case "top": return "bottom";
    }
    return "";
}


export default ({ status = "error", position = "bottom", text }) => {
    const css = classNames("ui", "mini", `${pointer(position)}`, "pointing", { "red": status == "error" }, { "orange": status == "warning" }, "basic", "label");
    return (
        <div className={css}>
            {text}
        </div>
    );
}