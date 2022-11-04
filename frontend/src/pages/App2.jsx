import React, { useEffect, useState, Suspense, lazy, useContext } from 'react';
import * as ReactDOM from 'react-dom/client';
import GridLayout, { Responsive, WidthProvider } from "react-grid-layout";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

const container = document.getElementById("app");
const root = ReactDOM.createRoot(container);
const A = ()=><ResponsiveReactGridLayout useCSSTransforms={false}>
<div key="1"><button onClick={() => alert("teste")}>teste3</button></div>
</ResponsiveReactGridLayout>
root.render(<A />);
