import React, { useRef, useEffect } from "react";
import { init, getInstanceByDom } from "echarts";
import { alternatives } from "joi";

export default ({
  option,
  style,
  settings,
  loading,
  theme,
  opts = {},
  data,
  events,
  onTooltipClick
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // init chart
    let chart;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme, { renderer: "canvas", ...opts });
      if (events) {
        for (const event of events) {
          const { eventName, query, handler } = event;
          if (query) {
            chart.on(eventName, query, handler);
          } else {
            chart.on(eventName, handler);
          }
        }
      }

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
      if (onTooltipClick) {
        chartRef.current.addEventListener('click', handleChartClick);
      }
    }
    return () => {
      if (onTooltipClick) {
        if (chartRef.current) {
          chartRef.current.removeEventListener('click', handleChartClick);
        }
      }
      //chart.dispose();
    };
  }, [option, settings, theme]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      loading === true ? chart.showLoading() : chart.hideLoading();
    }
  }, [loading, theme]);

  // Handle chart click event
  const handleChartClick = (event) => {
    const target = event.target;

    // Check if the clicked element is a tooltip item
    if (target.classList.contains('tooltip-item')) {
      const index = parseInt(target.getAttribute('data-index'), 10);
      const axisValue = target.getAttribute('data-axisvalue');
      // Call your custom function to handle the tooltip item click
      handleItemClick(index, axisValue);
    }
  };
  const handleItemClick = (index, axisValue) => {
    // Access the clicked item's data using the index  
    const clickedItem = getInstanceByDom(chartRef.current).getOption().series[index].data;
    // Perform your desired action with the clicked item's data
    onTooltipClick(clickedItem, axisValue);
  };


  return <div ref={chartRef} style={{ width: "80px", height: "80px", ...style }} />;
}