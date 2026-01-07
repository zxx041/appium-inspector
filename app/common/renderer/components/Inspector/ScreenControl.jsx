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

  // 这个是为了监听 canvasElement
  const resizeObserverRef = useRef(null);

  // let touchCanvas = null;
  useEffect(() => {

    let canvasElement = null;

    const doIt = async () => {
      if (containerRef.current && !containerRef.current.contains(window.__zcxWsScrcpy_video)) {
        // Todo.
        console.log("attachSessionId.... ", attachSessId, 'udid: ', udid);
        // debugger
        // console.log("sessionDetails:", sessionDetails);
        let host = sessionDetails.scrcpyHost;
        let port = sessionDetails.scrcpyPort;
        if(!host) {
          host = sessionDetails.host;
        }
        if(!port) {
          port = 29418;
        }
        console.log("scrcpyHost:", host, ",scrcpyPort:", port);
        // await window.__zcxWsScrcpy_init(`action=stream&udid=${udid}&player=mse&ws=ws%3A%2F%2Flocalhost%3A8000%2F%3Faction%3Dproxy-adb%26remote%3Dtcp%253A8886%26udid%3D${udid}`);
        await window.__zcxWsScrcpy_init(`action=stream&udid=${udid}&player=mse&ws=ws%3A%2F%2F${host}%3A${port}%2F%3Faction%3Dproxy-adb%26remote%3Dtcp%253A8886%26udid%3D${udid}`);
        // await window.__zcxWsScrcpy_init(`action=stream&udid=${udid}&player=mse&ws=ws%3A%2F%2F127.0.0.1%3A8001%2F%3Faction%3Dproxy-adb%26remote%3Dtcp%253A8886%26udid%3D${udid}%26backend=127.0.0.1`);
        // 将 window.__zcxWsScrcpy_video 这个全局对象 挂载给当前的 containerRef，并渲染
        containerRef.current.appendChild(window.__zcxWsScrcpy_video);

        // 这段是为了后面实现 事件穿透 用的
        setTimeout(() => {
          // 这个变量可以废掉 __zcxWsScrcpy_canvasRect
          // let canvasRect = window.__zcxWsScrcpy_video.getBoundingClientRect();
          // window.__zcxWsScrcpy_canvasRect = canvasRect;
          // console.log("canvasRect:x:", canvasRect.width, ",y:", canvasRect.height);

          // 1. 校验视频元素是否存在
          canvasElement = containerRef.current.querySelector('#screenshotContainer canvas#__zcxWsScrcpy_touchCanvasId');
          if (!canvasElement) {
            console.log('ws-scrcpy 视频元素不存在');
            // setLoading(false);
            return;
          }

          // 2. 初始化 ResizeObserver，监听宽高变化
          resizeObserverRef.current = new ResizeObserver((entries) => {
            for (const entry of entries) {
              // 获取元素实际渲染的宽高（contentBox 是内容区域尺寸）
              const { width, height } = entry.contentRect;
              if (width && height) {
                // // 每次发现长宽变化，这一行也执行下
                // window.__zcxWsScrcpy_canvasRect = window.__zcxWsScrcpy_video.getBoundingClientRect();
                //
                console.log("device maybe rotate, width:", width, ",height:", height);
                // 调用父组件方法
                onRender?.();
              }
            }
          });

          // 3. 开始监听视频元素
          resizeObserverRef.current.observe(canvasElement);

          // 4. 初始获取一次宽高（避免监听触发前无数据）
          const initWidth = canvasElement.offsetWidth;
          const initHeight = canvasElement.offsetHeight;
          if (initWidth && initHeight) {
            console.log("initWidth:", initWidth, ",initHeight:", initHeight);
            // 调用父组件方法
            onRender?.();
            // setVideoSize({
            //   width: initWidth,
            //   height: initHeight,
            //   ratio: (initWidth / initHeight).toFixed(2)
            // });
            // setLoading(false);
          }

        }, 1500);

      }
    };

    doIt().then(()=>{
      // 调用父组件方法
      onRender?.();
    });

    // 5. 组件卸载/依赖变化时：销毁监听（关键！避免内存泄漏）
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.unobserve(canvasElement);
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };

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
