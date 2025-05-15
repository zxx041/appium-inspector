import styles from './Inspector.module.css';
import React, {useRef, useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import {DEFAULT_SWIPE, DEFAULT_TAP, SCREENSHOT_INTERACTION_MODE} from '../../constants/screenshot';
import {POINTER_TYPES} from '../../constants/gestures';
import HighlighterRects from './HighlighterRects.jsx';

const {POINTER_UP, POINTER_DOWN, PAUSE, POINTER_MOVE} = POINTER_TYPES;
const {TAP, SELECT, SWIPE, TAP_SWIPE} = SCREENSHOT_INTERACTION_MODE;

const ScreenControl = (props) => {
  const {
    udid,
    recordFlag,
    t,
    selectedElement,
    selectedElementId,
    attachSessId,
    containerEl,
    sessionDetails,
    onRender,
    openPositionFlag,
  } = props;

  const containerRef = useRef(null);

  let touchCanvas = null;
  useEffect(() => {

    const doIt = async () => {
      if (containerRef.current && !containerRef.current.contains(window.__zcxWsScrcpy_video)) {
        // Todo.
        console.log("attachSessionId.... ", attachSessId, 'udid: ', udid);
        // debugger
        // console.log("sessionDetails:", sessionDetails);
        const host = sessionDetails.host;
        console.log("remote host:", host);
        // await window.__zcxWsScrcpy_init(`action=stream&udid=${udid}&player=mse&ws=ws%3A%2F%2Flocalhost%3A8000%2F%3Faction%3Dproxy-adb%26remote%3Dtcp%253A8886%26udid%3D${udid}`);
        await window.__zcxWsScrcpy_init(`action=stream&udid=${udid}&player=mse&ws=ws%3A%2F%2F${host}%3A8000%2F%3Faction%3Dproxy-adb%26remote%3Dtcp%253A8886%26udid%3D${udid}`);

        containerRef.current.appendChild(window.__zcxWsScrcpy_video);

        setTimeout(() => {
          let canvasRect = window.__zcxWsScrcpy_video.getBoundingClientRect();
          window.__zcxWsScrcpy_canvasRect = canvasRect;
          console.log("animation ....");
        }, 1500);

        touchCanvas = document.getElementById('__zcxWsScrcpy_touchCanvasId');

      }
    };
    
    doIt().then(()=>{
      onRender?.(); // 通知父组件已渲染
    });
    
  }, []);

  // let generateEvent = (e, type) => {
  //   e = e.nativeEvent;
  //
  //     const event = new MouseEvent(type, {
  //       bubbles: true,
  //       clientX: e.clientX,
  //       clientY: e.clientY
  //     });
  //     event.__zcxWsScrcpy_fakeMEvent = true;
  //     event.__zcxWsScrcpy_fakeMEvent_target = touchCanvas;
  //     return event;
  // };
  //
  // const handleMouseMove = (e) => {
  //   if (touchCanvas) {
  //     const event = generateEvent(e, 'mousemove');
  //     touchCanvas.dispatchEvent(event);
  //   }
  // };
  //
  // const handleMouseDown = (e) => {
  //   console.log('mouse down...', e.clientX, e.clientY);
  //   if (touchCanvas) {
  //     const event = generateEvent(e, 'mousedown');
  //     touchCanvas.dispatchEvent(event);
  //   }
  // };
  //
  // const handleMouseUp = (e) => {
  //   if (touchCanvas) {
  //     const event = generateEvent(e, 'mouseup');
  //     touchCanvas.dispatchEvent(event);
  //   }
  // };

  // useEffect(() => {
  //   if (isScriptLoaded && window.root) {
  //     ReactDOM.render(<A />, window.root);
  //   }
  // }, [isScriptLoaded]);

  return (
    <div>
      <div ref={containerRef}></div>
      <div
        // onMouseDown={handleMouseDown}
        // onMouseUp={handleMouseUp}
        // onMouseMove={handleMouseMove}

        className={styles.containerForSwipe}
      >
        {recordFlag && (
          <HighlighterRects {...props} containerEl={containerEl}/>
        )
        }
        {/* 注意： 录制和定位是 互斥的  */}
        {
          openPositionFlag && (
            <HighlighterRects {...props} containerEl={containerEl}/>
          )
        }

      </div>
    </div>
  );
};

export default ScreenControl;
