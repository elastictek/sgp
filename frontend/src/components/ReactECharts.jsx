import React, { useRef, useEffect } from "react";
import { init, getInstanceByDom } from "echarts";

export default ({
  option,
  style,
  settings,
  loading,
  theme,
  opts={},
  data
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // init chart
    let chart;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme,{renderer: "canvas",...opts});
    }

    // chart resize listener
    function resizeChart() {
      chart?.resize();
    }
    window.addEventListener("resize", resizeChart);

    return () => {
      chart?.dispose();
      window.removeEventListener("resize", resizeChart);
    };
  }, [theme]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart.setOption(option, settings);
    }
  }, [option, settings, theme]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      loading === true ? chart.showLoading() : chart.hideLoading();
    }
  }, [loading, theme]);

  return <div ref={chartRef} style={{ width: "80px", height: "80px", ...style }} />;
}