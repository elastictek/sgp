import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import { Button, Tag } from "antd";
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import { TbPin } from 'react-icons/tb';

const useStyles = createUseStyles({
  wrapperContainer: {
    /*     background: "#f0f0f0", */
    /* border: "1px solid #dee2e6", */
    borderRadius: "3px",
    padding: "1px",
    fontSize: "11px",
    /*     height: "45px", */
    justifyContent: "center"
  },
  scrollContainer: {
    "-ms-overflow-style": "none",
    "scrollbar-width": "none",
    "align-self": "center",
    '&::-webkit-scrollbar': {
      display: "none"
    }
  }
});

const ItemTitle = ({ children }) => {
  return (<Tag style={{ fontSize: "10px" }}>{children}</Tag>)
}

function LeftArrow() {
  const { isFirstItemVisible, scrollPrev } =
    React.useContext(VisibilityContext);

  return (
    <>{!isFirstItemVisible && <CaretLeftOutlined style={{ alignSelf: "center" }}/*  disabled={isFirstItemVisible} */ onClick={() => scrollPrev()} />}</>
  );
}

function RightArrow() {
  const { isLastItemVisible, scrollNext } = React.useContext(VisibilityContext);

  return (
    <>{!isLastItemVisible && <CaretRightOutlined style={{ alignSelf: "center" }} /* disabled={isLastItemVisible} */ onClick={() => scrollNext()} />}</>
  );
}

export const WidgetSimpleTitle = ({ parameters, onClose, onPinItem, title, children }) => {
  const classes = useStyles();
  const { pinnable, closable, ofs: items } = parameters;

  return (
    <Container fluid style={{ padding: "0px" }}>
      <Row gutterWidth={10}>
        <Col>
          <Row nogutter>
            <Col>
              {title && <div style={{ fontSize: "16px", fontWeight: 700 }}>{title}</div>}
            </Col>
          </Row>
        </Col>
        <Col xs="content" style={{ display: "flex", alignSelf: "end" }}>
          {children && <>{children}</>}
        </Col>
        <Col xs="content">{closable && <Button size="small" style={{ fontWeight: 700, border: "0px" }} onClick={onClose}>x</Button>}</Col>
        <Col xs="content">{pinnable && <Button type={parameters?.static && "primary"} size="small" onClick={onPinItem} icon={<TbPin />} />}</Col>
      </Row>
    </Container>
  );
}


export default ({ parameters, onClose, onPinItem, title, children }) => {
  const classes = useStyles();
  const { pinnable, closable, ofs: items } = parameters;


  const onWheel = (apiObj, ev) => {
    const isThouchpad = Math.abs(ev.deltaX) !== 0 || Math.abs(ev.deltaY) < 15;
    if (isThouchpad) {
      ev.stopPropagation();
      return;
    }
    if (ev.deltaY < 0) {
      apiObj.scrollNext();
    } else if (ev.deltaY > 0) {
      apiObj.scrollPrev();
    }
  }

  return (
    <Container fluid style={{ padding: "0px" }}>
      <Row gutterWidth={10}>
        <Col>
          <Row nogutter>
            <Col>
              {title && <div style={{ fontSize: "16px", fontWeight: 700 }}>{title}</div>}
              {items &&
                <ScrollMenu LeftArrow={<LeftArrow />} RightArrow={<RightArrow />} onWheel={onWheel} wrapperClassName={classes.wrapperContainer} scrollContainerClassName={classes.scrollContainer}>
                  {items.map(v => (
                    <ItemTitle key={`t-${v.of_cod}`} itemId={`t-${v.of_cod}`}>{v.of_cod}</ItemTitle>
                  ))}
                </ScrollMenu>
              }
            </Col>
          </Row>
        </Col>
        <Col xs="content" style={{ display: "flex", alignSelf: "end" }}>
          {children && <>{children}</>}
        </Col>
        <Col xs="content">
          <Row nogutter><Col>{closable && <Button size="small" style={{ fontWeight: 700, border: "0px" }} onClick={onClose}>x</Button>}</Col></Row>
          <Row nogutter><Col>{pinnable && <Button type={parameters?.static && "primary"} size="small" onClick={onPinItem} icon={<TbPin />} />}</Col></Row>
        </Col>
      </Row>
    </Container>
  );
}