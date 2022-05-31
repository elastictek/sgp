import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';

export default ({ctxSocket})=>{
    useEffect(()=>{
        console.log("teste->",ctxSocket);
    },[ctxSocket])
    return(<div>aaa</div>);
}
