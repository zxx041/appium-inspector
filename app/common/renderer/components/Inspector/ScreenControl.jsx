import styles from './Inspector.module.css';
import React, {useRef, useState, useEffect} from 'react';
import {DEFAULT_SWIPE, DEFAULT_TAP, SCREENSHOT_INTERACTION_MODE} from '../../constants/screenshot';
import {POINTER_TYPES} from '../../constants/gestures';
import HighlighterRects from './HighlighterRects.jsx';

const {POINTER_UP, POINTER_DOWN, PAUSE, POINTER_MOVE} = POINTER_TYPES;
const {TAP, SELECT, SWIPE, TAP_SWIPE} = SCREENSHOT_INTERACTION_MODE;

const ScreenControl = (props) => {
  const {
    screenshot,
    mjpegScreenshotUrl,
    methodCallInProgress,
    screenshotInteractionMode,
    coordStart,
    coordEnd,
    scaleRatio,
    selectedTick,
    selectedInspectorTab,
    applyClientMethod,
    t,
    selectedElement,
    selectedElementId,
    containerEl
  } = props;


  const [x, setX] = useState();
  const [y, setY] = useState();

  const handleScreenshotClick = async () => {
    console.log('screenshot click...');
    const {tapTickCoordinates} = props;
    if (selectedTick) {
      await tapTickCoordinates(x, y);
    }
  };

  const handleScreenshotDown = async () => {
    console.log('screenshot down .. ');
    const {setCoordStart} = props;
    // if (screenshotInteractionMode === TAP_SWIPE) {
    await setCoordStart(x, y);
    // }
  };

  const handleScreenshotUp = async () => {
    console.log('screenshot up..');
    const {setCoordEnd, clearCoordAction} = props;
    // if (screenshotInteractionMode === TAP_SWIPE) {
    await setCoordEnd(x, y);
    if (Math.abs(coordStart.x - x) < 5 && Math.abs(coordStart.y - y) < 5) {
      await handleDoTap({x, y}); // Pass coordEnd because otherwise it is not retrieved
    } else {
      await handleDoSwipe({x, y}); // Pass coordEnd because otherwise it is not retrieved
    }
    clearCoordAction();
    // }
  };

  const handleMouseMove = (e) => { // 这里修改为相对于screen容器的坐标.而非相对于触发这个事件元素的坐标，以同时使用操控和录制
    // e.stopPropagation();
    const nativeEvent = e.nativeEvent;
    const rect=  containerEl.getBoundingClientRect();

    // const offsetX = e.nativeEvent.offsetX;
    // const offsetY = e.nativeEvent.offsetY;

    const offsetX = nativeEvent.clientX - rect.left;
    const offsetY = nativeEvent.clientY - rect.top;

    const newX = offsetX * scaleRatio;
    const newY = offsetY * scaleRatio;
    setX(Math.round(newX));
    setY(Math.round(newY));
    // console.log(' mouse move ... ', x, y, e.target);

  };

  const handleDoTap = async (tapLocal) => {
    const {POINTER_NAME, DURATION_1, DURATION_2, BUTTON} = DEFAULT_TAP;
    await applyClientMethod({
      methodName: TAP,
      args: [
        {
          [POINTER_NAME]: [
            {type: POINTER_MOVE, duration: DURATION_1, x: tapLocal.x, y: tapLocal.y},
            {type: POINTER_DOWN, button: BUTTON},
            {type: PAUSE, duration: DURATION_2},
            {type: POINTER_UP, button: BUTTON}
          ]
        }
      ]
    });
  };

  const handleDoSwipe = async (swipeEndLocal) => {
    const {POINTER_NAME, DURATION_1, DURATION_2, BUTTON, ORIGIN} = DEFAULT_SWIPE;
    await applyClientMethod({
      methodName: SWIPE,
      args: {
        [POINTER_NAME]: [
          {type: POINTER_MOVE, duration: DURATION_1, x: coordStart.x, y: coordStart.y},
          {type: POINTER_DOWN, button: BUTTON},
          {
            type: POINTER_MOVE,
            duration: DURATION_2,
            origin: ORIGIN,
            x: swipeEndLocal.x,
            y: swipeEndLocal.y
          },
          {type: POINTER_UP, button: BUTTON}
        ]
      }
    });
  };

  return (
    <div
      onMouseDown={handleScreenshotDown}
      onMouseUp={handleScreenshotUp}
      onMouseMove={handleMouseMove}
      onClick={handleScreenshotClick}
    >

      {/*<svg*/}
      {/*  className={styles.swipeSvg}*/}

      {/*  style={{*/}
      {/*    // pointerEvents: 'none', // 透传*/}
      {/*    background: 'transparent' // 透明*/}
      {/*  }}*/}
      {/*>*/}
      {/*  {coordStart && (*/}
      {/*    <circle cx={coordStart.x / scaleRatio} cy={coordStart.y / scaleRatio}/>*/}
      {/*  )}*/}
      {/*  {coordStart && !coordEnd && (*/}
      {/*    <line*/}
      {/*      x1={coordStart.x / scaleRatio}*/}
      {/*      y1={coordStart.y / scaleRatio}*/}
      {/*      x2={x / scaleRatio}*/}
      {/*      y2={y / scaleRatio}*/}
      {/*    />*/}
      {/*  )}*/}
      {/*  {coordStart && coordEnd && (*/}
      {/*    <line*/}
      {/*      x1={coordStart.x / scaleRatio}*/}
      {/*      y1={coordStart.y / scaleRatio}*/}
      {/*      x2={coordEnd.x / scaleRatio}*/}
      {/*      y2={coordEnd.y / scaleRatio}*/}
      {/*    />*/}
      {/*  )}*/}
      {/*</svg>*/}

      <HighlighterRects {...props} containerEl={containerEl}/>

    </div>
  );
};

export default ScreenControl;
