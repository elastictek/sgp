import React, { useEffect, useState, Suspense, lazy, useContext } from 'react';
import { useMediaQuery } from 'react-responsive';
import useWindowDimensions from 'utils/useWindowDimensions';

export default () => {
    const isBigScreen = useMediaQuery({ minWidth: 1824 });
    const isDesktop = useMediaQuery({ minWidth: 992 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isPortrait = useMediaQuery({ orientation: 'portrait' });
    const windowDimension = useWindowDimensions();
    const [width, setWidth] = useState();

    useEffect(() => {
        const orientation = (isPortrait) ? "portrait" : "landscape";
        if (isBigScreen) {
            setWidth({ width: 900, unit: "px", maxWidth: 80, maxUnit: "%", device: "bigscreen", deviceW: 4, orientation, minWidthQuery: 1824, windowDimension });
        } else if (isDesktop) {
            setWidth({ width: 800, unit: "px", maxWidth: 80, maxUnit: "%", device: "desktop", orientation, deviceW: 3, minWidthQuery: 992, windowDimension });
        } else if (isTablet) {
            setWidth({ width: 100, unit: "%", maxWidth: 100, maxUnit: "%", device: "tablet", orientation, deviceW: 2, minWidthQuery: 768, maxWidthQuery: 991, windowDimension });
        } else {
            setWidth({ width: 100, unit: "%", maxWidth: 100, maxUnit: "%", device: "mobile", orientation, maxWidthQuery: 767, deviceW: 1, windowDimension });
        }
    }, [isDesktop, isTablet, isMobile, isBigScreen, windowDimension]);

    return [width];
};