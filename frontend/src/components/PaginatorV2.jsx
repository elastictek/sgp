import React, { useMemo, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { Button, InputNumber, Divider } from 'antd';
import { LeftOutlined, RightOutlined, EllipsisOutlined, DoubleRightOutlined, DoubleLeftOutlined, VerticalLeftOutlined, VerticalRightOutlined, ReloadOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { debounce, getInt } from "utils";
import { BsBoxArrowInUpRight } from 'react-icons/bs';
import { useDataAPI } from 'utils/useDataAPIV3';

export const DOTS = '...';


const BoldInputNumber = styled(InputNumber)`
    width: 80px; 
    input{
            font-weight:700;
        }
`;

const StyledContainer = styled.ul`

    display: flex;
    list-style-type: none;
  
    .pagination-item {
      padding: 0 12px;
      height: 32px;
      text-align: center;
      margin: auto 4px;
      color: rgba(0, 0, 0, 0.87);
      display: flex;
      box-sizing: border-box;
      align-items: center;
      letter-spacing: 0.01071em;
      border-radius: 16px;
      line-height: 1.43;
      font-size: 13px;
      min-width: 32px;
  
      &.dots:hover {
        background-color: transparent;
        cursor: default;
      }
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
        cursor: pointer;
      }
  
      &.selected {
        background-color: rgba(0, 0, 0, 0.08);
      }
  
      .arrow {
        &::before {
          position: relative;
          /* top: 3pt; Uncomment this to lower the icons as requested in comments*/
          content: '';
          /* By using an em scale, the arrows will size with the font */
          display: inline-block;
          width: 0.4em;
          height: 0.4em;
          border-right: 0.12em solid rgba(0, 0, 0, 0.87);
          border-top: 0.12em solid rgba(0, 0, 0, 0.87);
        }
  
        &.left {
          transform: rotate(-135deg) translate(-50%);
        }
  
        &.right {
          transform: rotate(45deg);
        }
      }
  
      &.disabled {
        pointer-events: none;
  
        .arrow::before {
          border-right: 0.12em solid rgba(0, 0, 0, 0.43);
          border-top: 0.12em solid rgba(0, 0, 0, 0.43);
        }
  
        &:hover {
          background-color: transparent;
          cursor: default;
        }
      }
    }

`;


const range = (start, end) => {
    let length = end - start + 1;
    /*
        Create an array of certain length and set the elements within it from
      start value to end value.
    */
    return Array.from({ length }, (_, idx) => idx + start);
};

export const getPageCount = ({ count, limit }) => Math.ceil(count / limit);
export const getSkipForPage = ({ page, limit }) => Math.max(0, limit * (page - 1));
export const getCurrentPage = ({ skip, limit }) => Math.floor(skip / limit) + 1;
// it's 1 based
export const hasNextPage = ({ skip, limit, count }) => getCurrentPage({ skip, limit }) < getPageCount({ count, limit });
export const hasPrevPage = ({ skip, limit }) => getCurrentPage({ skip, limit }) > 1;


export const usePagination = ({
    totalCount,
    pageSize,
    siblingCount = 1,
    currentPage
}) => {
    const paginationRange = useMemo(() => {
        const totalPageCount = Math.ceil(totalCount / pageSize);

        // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
        const totalPageNumbers = siblingCount + 5;

        /*
          Case 1:
          If the number of pages is less than the page numbers we want to show in our
          paginationComponent, we return the range [1..totalPageCount]
        */
        if (totalPageNumbers >= totalPageCount) {
            return range(1, totalPageCount);
        }

        /*
            Calculate left and right sibling index and make sure they are within range 1 and totalPageCount
        */
        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(
            currentPage + siblingCount,
            totalPageCount
        );

        /*
          We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPageCount. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPageCount - 2
        */
        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPageCount;

        /*
            Case 2: No left dots to show, but rights dots to be shown
        */
        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = range(1, leftItemCount);

            return [...leftRange, { dots: DOTS, op: "+" }, totalPageCount];
        }

        /*
            Case 3: No right dots to show, but left dots to be shown
        */
        if (shouldShowLeftDots && !shouldShowRightDots) {

            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = range(
                totalPageCount - rightItemCount + 1,
                totalPageCount
            );
            return [firstPageIndex, { dots: DOTS, op: "-" }, ...rightRange];
        }

        /*
            Case 4: Both left and right dots to be shown
        */
        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, { dots: DOTS, op: "-" }, ...middleRange, { dots: DOTS, op: "+" }, lastPageIndex];
        }
    }, [totalCount, pageSize, siblingCount, currentPage]);

    return paginationRange || [];
};


const Pagination = props => {
    const {
        showTotals = true,
        onPageChange,
        totalCount,
        siblingCount = 1,
        rowsFromTo,
        currentPage,
        pageSize,
        isLoading,
        debounceTimeout = 1000,
        maxPage = true,
        className
    } = props;

    const paginationRange = usePagination({
        currentPage,
        totalCount,
        siblingCount,
        pageSize
    });

    const debounceEvent = React.useMemo(() => {
        const goto = (v) => {
            onGoto(v);
        }
        return debounce(goto, debounceTimeout);
    }, [onGoto, isLoading, onPageChange, debounceTimeout]);


    // If there are less than 2 times in pagination range we shall not render the component
    if (/* currentPage === 0 ||  */paginationRange.length < 2) {
        return null;
    }

    const onFirst = () => {
        if (isLoading) {
            return;
        }
        onPageChange(1);
    };

    const onLast = () => {
        if (isLoading) {
            return;
        }
        onPageChange(lastPage);
    };

    const onRefresh = () => {
        if (isLoading) {
            return;
        }
        onPageChange(currentPage);
    };

    const onNext = () => {
        if (isLoading) {
            return;
        }
        onPageChange(currentPage + 1);
    };

    const onPrevious = () => {
        if (isLoading) {
            return;
        }
        onPageChange(currentPage - 1);
    };

    const onGoto = (v) => {
        if (isLoading) {
            return;
        }
        onPageChange(getInt(v, 1));
    }

    const onDots = (obj) => {
        if (isLoading) {
            return;
        }
        if (obj.op === "+") {
            onPageChange(currentPage + 5);
        } else {
            onPageChange(currentPage - 5);
        }
    }

    const handleInputFocus = (event) => {
        const inputElement = event.target;
        inputElement.select();
    };

    let _dots = 0;
    let lastPage = paginationRange[paginationRange.length - 1];
    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
            <BoldInputNumber prefix={<BsBoxArrowInUpRight />} size="small" title='Ir Para' onFocus={handleInputFocus} value={currentPage} onStep={onGoto} onPressEnter={(e) => onGoto(e.target.value)} onBlur={(e) => onGoto(e.target.value)} /* onChange={debounceEvent}  */ min={1} {...maxPage && { max: lastPage }} controls={true} />
            <Button style={{ margin: "2px" }} icon={<LeftOutlined />} onClick={onPrevious} size="small" disabled={currentPage === 1} />
            {paginationRange.map(pageNumber => {
                // If the pageItem is a DOT, render the DOTS unicode character
                if (typeof pageNumber === 'object' && pageNumber.dots === DOTS) {
                    _dots++;
                    return <Button style={{ margin: "2px" }} key={`dots-${_dots}`} icon={<EllipsisOutlined />} size="small" onClick={() => onDots(pageNumber)} />;
                }
                return (
                    <Button key={`nv-${pageNumber}`} style={{ margin: "2px", ...currentPage === pageNumber && { borderColor: "#1890ff", color: "#1890ff" } }} size="small" onClick={() => onPageChange(pageNumber)}>{pageNumber}</Button>
                );
            })}
            <Button style={{ margin: "2px" }} icon={<RightOutlined />} onClick={onNext} size="small" disabled={currentPage === lastPage} />
            <Button style={{ margin: "2px" }} icon={<ReloadOutlined />} onClick={onRefresh} size="small" />
            {showTotals &&
                <>
                    <div style={{ marginLeft: "3px" }}>{rowsFromTo?.from}</div>
                    <div>-</div>
                    <div>{rowsFromTo?.to}</div>
                    <div style={{ margin: "0px 3px" }}>de</div>
                    <div>{totalCount}</div>
                </>
            }
        </div>
    );
};


export default Pagination;