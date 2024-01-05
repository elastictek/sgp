import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import { useSubmitting } from "utils";
import { uid } from 'uid';
import { json, includeObjectKeys } from "utils/object";
import { Button, Spin} from "antd";
import { EditOutlined, RollbackOutlined, PlusOutlined } from '@ant-design/icons';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import YScroll from 'components/YScroll';
import XScroll, { RowXScroll } from 'components/XScroll';
import Pagination, { paginationI18n } from './PaginatorV4';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import { LicenseManager } from "ag-grid-enterprise";
LicenseManager.setLicenseKey("my-license-key");

const GRID_CELL_CLASSNAME = 'ag-cell';

const GridContainer = styled.div`
  height: 100%;
  width: 100%;    
  .ag-custom{
    height: 100%;
    width: 100%;
    --ag-font-size: 11px;
   }
`;
const StatusRightPanel = ({ loading, dataAPI, modeApi, showRange, allowGoTo, showFromTo, showTotalCount, ...props }) => {

  const onPageSizeChange = useCallback((n) => {
    dataAPI.pageSize(n, true);
    //props.api.setGridOption("paginationPageSize", n);
  }, []);

  const onPageChange = useCallback((page, refresh = false) => {
    if (refresh) {
      props.api.refreshServerSide({ purge: false });
    } else {
      props.api.paginationGoToPage(page - 1);
    }
  }, []);

  return (<div style={{ color: "#000" }}>
    <div>{!modeApi.isOnMode() && <Pagination loading={loading} showRange={showRange} onPageSizeChange={onPageSizeChange} allowGoTo={allowGoTo} showTotalCount={showTotalCount} showFromTo={showFromTo} totalCount={dataAPI.getTotalRows()} rowsFromTo={dataAPI.getRowsFromTo()} onPageChange={onPageChange} currentPage={dataAPI.getCurrentPage()} pageSize={dataAPI.getPageSize()} /* {...paginationProps} */ /* {...(editable.enabled || editable.add) && { skip: dataAPI?.getSkip() }} */ {...paginationI18n} /* bordered={false} */ />}</div>
  </div>)
}
const Toolbar = ({ visible = true, loading = false, modeApi, onExit, onAdd, title, start, left, right }) => {
  if (!visible) {
    return (<></>);
  }

  return (
    <Spin spinning={loading} indicator={<></>} >
      <Container fluid>
        {title && <Row gutterWidth={5} style={{ padding: "5px" }}>
          <Col>{title}</Col>
        </Row>}
        <RowXScroll gutterWidth={5} style={{ padding: "5px" }} align='center' wrap='nowrap'>
          <Col xs="content">
            {start && start}
          </Col>

          {modeApi.isReady() && <>
            {(!modeApi.isOnMode() && modeApi.allowAdd()) && <Col xs="content"><Button type="default" icon={<PlusOutlined />} onClick={onAdd}>{modeApi.addText()}</Button></Col>}
            {(!modeApi.isOnMode() && modeApi.allowEdit()) && <Col xs="content"><Button type="default" icon={<EditOutlined />} onClick={modeApi.onEditMode}>{modeApi.editText()}</Button></Col>}
            {(modeApi.isOnMode() && modeApi.isDirty()) && <Col xs="content"><Button type="primary" icon={<EditOutlined />} onClick={onAdd}>{modeApi.saveText()}</Button></Col>}
            {modeApi.isOnMode() && <Col xs="content"><Button type="default" icon={<RollbackOutlined />} onClick={onExit} /></Col>}
          </>}

          <Col xs="content">
            {left && left}
          </Col>

          <Col></Col>

          <Col xs="content">{right && right}</Col>
          <Col xs="content">Settings</Col>
        </RowXScroll>
      </Container>
    </Spin>
  );
}
export const useTableStyles = createUseStyles({
  error: {
    background: "rgb(255, 17, 0) !important"
  },
  warning: {
    background: "#ffec3d !important"
  },
  cellPadding1: {
    padding: "1px 5px !important"
  },
  rowNotValid: {
    background: "#ffe7ba !important"
  },
  right: {
    textAlign: "right"
  },
  selectable: {
    cursor: "pointer"
  }
});
const getAllFocusableElementsOf = (el) => {
  return Array.from(
    el.querySelectorAll(
      'button, [href], input, div, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((focusableEl) => {
    return focusableEl.tabIndex !== -1;
  });
};
const getEventPath = (event) => {
  const path = [];
  let currentTarget = event.target;
  while (currentTarget) {
    path.push(currentTarget);
    currentTarget = currentTarget.parentElement;
  }
  return path;
};
/**
 * Capture whether the user is tabbing forwards or backwards and suppress keyboard event if tabbing
 * outside of the children
 */
export const suppressKeyboardEvent = ({ event }) => {
  const { key, shiftKey } = event;
  const path = getEventPath(event);
  const isTabForward = key === 'Tab' && shiftKey === false;
  const isTabBackward = key === 'Tab' && shiftKey === true;
  let suppressEvent = false;
  // Handle cell children tabbing
  if (isTabForward || isTabBackward) {
    const eGridCell = path.find((el) => {
      if (el.classList === undefined) return false;
      return el.classList.contains(GRID_CELL_CLASSNAME);
    });
    if (!eGridCell) {
      return suppressEvent;
    }
    const focusableChildrenElements = getAllFocusableElementsOf(eGridCell);
    const lastCellChildEl = focusableChildrenElements[focusableChildrenElements.length - 1];
    const firstCellChildEl = focusableChildrenElements[0];
    // Suppress keyboard event if tabbing forward within the cell and the current focused element is not the last child
    if (isTabForward && focusableChildrenElements.length > 0) {
      const isLastChildFocused =
        lastCellChildEl && document.activeElement === lastCellChildEl;
      if (!isLastChildFocused) {
        suppressEvent = true;
      }
    }
    // Suppress keyboard event if tabbing backwards within the cell, and the current focused element is not the first child
    else if (isTabBackward && focusableChildrenElements.length > 0) {
      const cellHasFocusedChildren =
        eGridCell.contains(document.activeElement) &&
        eGridCell !== document.activeElement;
      // Manually set focus to the last child element if cell doesn't have focused children
      if (!cellHasFocusedChildren) {
        lastCellChildEl.focus();
        // Cancel keyboard press, so that it doesn't focus on the last child and then pass through the keyboard press to
        // move to the 2nd last child element
        event.preventDefault();
      }
      const isFirstChildFocused = firstCellChildEl && document.activeElement === firstCellChildEl;
      if (!isFirstChildFocused) {
        suppressEvent = true;
      }
    }
  }
  return suppressEvent;
};


export default ({
  columnDefs, defaultColDef, columnTypes, dataAPI, local = false, gridApi, setGridApi, loadOnInit = true,
  loading = false, showRange = true, allowGoTo = true, showFromTo, showTotalCount, gridRef, showTopToolbar = true, topToolbar = {},
  onExitModeRefresh = true, rowClassRules = {},
  modeApi, ...props
}) => {
  const classes = useTableStyles();
  const _gridRef = gridRef || useRef();
  const submitting = useSubmitting(false);
  const sourceType = useMemo(() => local ? "clientSide" : "serverSide", [local]);
  const [initialState, setInitialState] = useState();

  //const [rowData, setRowData] = useState();

  // useEffect(() => {
  //   setInitialState({
  //     pagination: {
  //       page: 10,//dataAPI.getPagination().page,
  //       pageSize: dataAPI.getPagination().pageSize
  //     }
  //   });
  // }, []);

  const isLoading = useMemo(() => {
    if (loading || submitting.state || dataAPI.isLoading()) {
      return true;
    }
    return false;
  }, [loading, submitting.state, dataAPI.isLoading()]);

  const onGridReady = useCallback((params) => {
    console.log("GIRD-READY");
    //load Grid State through dataAPI
    params.api.applyColumnState({
      state: dataAPI.getSort().map(v => includeObjectKeys(v, ["colId", "sort"])),
      defaultState: { sort: null },
    });

    if (setGridApi) {
      const { api } = params;
      setGridApi(api);
    }

    if (loadOnInit && local == false) {
      let datasource = dataAPI.dataSourceV4();
      params.api.setGridOption("serverSideDatasource", datasource);
    }
  }, []);

  // const onGridPreDestroyed = useCallback(
  //   (params) => {
  //     console.log("GRID-PREDESTROYED");
  //     if (!gridApi) {
  //       return;
  //     }
  //     setGridApi(null);
  //   }, [gridApi]);

  const onPaginationChanged = useCallback(() => {
    // Workaround for bug in events order
    if (_gridRef.current.api) {
      //_gridRef.current.api.paginationGoToPage(14);

      //console.log('GRID PAGINATION ');
      if (local) {
        dataAPI.currentPage(_gridRef.current.api.paginationGetCurrentPage() + 1, true);
      }
      //console.log("GRID PAGINATION->", dataAPI.getCurrentPage(), dataAPI.getPageSize(), _gridRef.current.api.paginationGetCurrentPage() + 1)

      //   setText(
      //     '#lbLastPageFound',
      //     gridRef.current.api.paginationIsLastPageFound()
      //   );
      //   setText('#lbPageSize', gridRef.current.api.paginationGetPageSize());
      //   // we +1 to current page, as pages are zero based
      //   setText(
      //     '#lbCurrentPage',
      //     gridRef.current.api.paginationGetCurrentPage() + 1
      //   );
      //   setText('#lbTotalPages', gridRef.current.api.paginationGetTotalPages());
      //   setLastButtonDisabled(!gridRef.current.api.paginationIsLastPageFound());
    }
  }, []);

  // useEffect(() => {
  //   const el = document.querySelector(".ag-custom");
  //   if (el) {
  //     el.classList.toggle("normal", true);
  //   }
  // }, []);

  // const refreshCache = useCallback((route) => {
  //   const purge = true;
  //   //const purge = !!document.querySelector('#purge').checked;
  //   //_gridRef.current.api.refreshServerSide({ route: route, purge: purge });
  //   _gridRef.current.api.refreshServerSide({ route: route, purge: purge });
  // }, []);

  const onFirstDataRendered = useCallback((params) => {
    if (dataAPI.getCurrentPage() !== 1) {
      //LOAD CURRENT PAGE FROM STATE
      _gridRef.current.api.paginationGoToPage(dataAPI.getCurrentPage() - 1);
    }
  }, []);

  const getRowId = useMemo(() => {
    return (params) => { return `${params.data?.[dataAPI.getPrimaryKey()]}`; };
  }, []);

  // const onPaging = useCallback(async (page, purge = true) => {
  //   _gridRef.current.api.showLoadingOverlay();
  //   dataAPI.currentPage(page, true);
  //   if (typeof onPageChange === "function") {
  //     onPageChange();
  //   } else {
  //     //await dataAPI.fetchPost();
  //     //_gridRef.current.api.paginationProxy.currentPage = dataAPI.getCurrentPage() - 1;
  //     _gridRef.current.api.paginationGoToPage(dataAPI.getCurrentPage() - 1);
  //     //_gridRef.current.api.refreshServerSide({ purge: purge });
  //     //dataAPI.update(true);
  //     //dataAPI.fetchPost();
  //   }
  //   _gridRef.current.api.hideOverlay();
  // }, []);



  const statusBar = useMemo(() => {
    return {
      statusPanels: [
        ...dataAPI.getPagination().enabled ? [{
          statusPanel: StatusRightPanel,
          align: 'right',
          statusPanelParams: {
            modeApi: modeApi,
            dataAPI: dataAPI,
            loading: isLoading,
            showTotalCount: showTotalCount,
            showFromTo: showFromTo,
            showRange: showRange,
            allowGoTo: allowGoTo
          }
        }] : []
      ],
    };
  }, [isLoading, dataAPI.getTimeStamp(), dataAPI.getPageSize(), dataAPI.getCurrentPage(), modeApi.isOnMode()]);


  const onCellEditRequest = event => {
    console.log('Cell Editing updated a cell, but the grid did nothing!', _gridRef.current);
    const transaction = {
      update: [{ ...event.data, [event.column.getDefinition().field]: event.newValue, rowvalid: 0 }],
    };
    if (local) {
      const result = _gridRef.current.api.applyTransaction(transaction);
    } else {
      const result = _gridRef.current.api.applyServerSideTransaction(transaction);
    }
    modeApi.setDirty(true);
  };

  // const handleAddRow = () => {
  //   // Simulate adding a new row on the server (replace with actual API call)
  //   const newServerRow = { id: 3, nome: 'New Row' };

  //   // Inform Ag-Grid about the new row
  //   _gridRef.current.api.applyTransaction({
  //     add: [newServerRow],
  //   });
  // };

  // const handleAddRow = useCallback(() => {
  //   // const selectedRows = _gridRef.current.api.getSelectedNodes();
  //   // if (selectedRows.length === 0) {
  //   //   console.warn('[Example] No row selected.');
  //   //   return;
  //   // }
  //   const rowIndex = 0;//selectedRows[0].rowIndex;
  //   const transaction = {
  //     addIndex: rowIndex != null ? rowIndex : undefined,
  //     add: [{ id: 3, nome: 'New Row', rowadded: 1, rowvalid: 0 }],
  //   };
  //   const result = _gridRef.current.api.applyServerSideTransaction(transaction);
  // }, []);

  const onExitMode = useCallback(() => {
    _gridRef.current.api.stopEditing();
    if (onExitModeRefresh) {
      if (!local) {
        _gridRef.current.api.refreshServerSide({ purge: false });
      } else {
        // _gridRef.current.api.refreshCells({force:true});
        // _gridRef.current.api.redrawRows();
        console.log(dataAPI.getData().rows)
        _gridRef.current.api.updateGridOptions({ rowData: dataAPI.getData().rows });
      }
    }
  }, [dataAPI.getTimeStamp()]);

  const onAddMode = useCallback((idx = null, row) => {
    let _first = _gridRef.current.api.getFirstDisplayedRow() == -1 ? 0 : _gridRef.current.api.getFirstDisplayedRow();
    const transaction = {
      addIndex: idx != null ? idx : _first,
      add: [{ ...row, rowadded: 1, rowvalid: 0 }],
    };
    if (local) {
      const result = _gridRef.current.api.applyTransaction(transaction);
    } else {
      const result = _gridRef.current.api.applyServerSideTransaction(transaction);
    }
  }, []);

  const _rowClassRules = useMemo(() => {
    return {
      [classes.rowNotValid]: (params) => {
        return params.data?.rowvalid === 0;
      },
      ...rowClassRules
    };
  }, []);

  return (
    <GridContainer>
      <Toolbar loading={isLoading} visible={showTopToolbar} modeApi={modeApi} onExit={() => modeApi.onExit(onExitMode)} onAdd={() => modeApi.onAddMode(onAddMode)}  {...topToolbar} />
      <div className="ag-theme-quartz ag-custom">
        <AgGridReact
          ref={_gridRef}
          onFirstDataRendered={onFirstDataRendered}
          //initialState={{ pagination: { page: 15 } }}
          // initialState={{
          //   pagination: {
          //     "page": 2,
          //     "pageSize": 100
          //   }
          // }}
          // initialState={{
          //   currentPage:10,
          //   pagination: {
          //     page: 10,//dataAPI.getPagination().page,
          //     pageSize: 50//dataAPI.getPagination().pageSize
          //   }
          // }}
          pagination={dataAPI.getPagination().enabled}
          paginationPageSize={dataAPI.getPagination().pageSize}
          suppressPaginationPanel={true}
          suppressScrollOnNewData={true}
          onPaginationChanged={onPaginationChanged}

          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowModelType={sourceType}
          columnTypes={columnTypes}
          maxBlocksInCache={0}
          {...!local ? { cacheBlockSize: dataAPI.getPageSize() } : {}}
          {...local ? { rowData: dataAPI.getData().rows } : {}}

          //sideBar={'columns'}
          onGridReady={onGridReady}
          getRowId={getRowId}

          enableCellTextSelection={false}
          suppressContextMenu={true}
          //onCellKeyDown={(v) => console.log("###", v)}
          //onCellClicked={(v) => console.log("###", v)}
          //onGridPreDestroyed={onGridPreDestroyed}
          statusBar={statusBar}

          onCellEditRequest={onCellEditRequest}
          readOnlyEdit={true}
          rowClassRules={_rowClassRules}

          {...props}
        />
      </div>
    </GridContainer>
  );
};