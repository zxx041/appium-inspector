import {Spin, Modal, Input,Button} from 'antd';
import React, {useRef, useState, useEffect} from 'react';
import { SearchOutlined } from '@ant-design/icons';
import {GESTURE_ITEM_STYLES, POINTER_TYPES} from '../../constants/gestures';
import {SCREENSHOT_INTERACTION_MODE} from '../../constants/screenshot';
import {INSPECTOR_TABS} from '../../constants/session-inspector';
import ScreenControl from './ScreenControl.jsx';
import styles from './Inspector.module.css';

import {ENTRY_TO_SELECT_EL} from '../../constants/common';

const {POINTER_UP, POINTER_DOWN, PAUSE, POINTER_MOVE} = POINTER_TYPES;
const {TAP, SELECT, SWIPE, TAP_SWIPE} = SCREENSHOT_INTERACTION_MODE;

/**
 * Shows screenshot of running application and divs that highlight the elements' bounding boxes
 */
const Screenshot = (props) => {
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
    fromWhere,
  } = props;

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [bottom, setBottom] = useState('');

  // 使用 useEffect 监听 selectedElement.attributes.focused 的变化
  useEffect(() => {
    const focused = selectedElement && selectedElement.attributes && selectedElement.attributes.focused;
    const positionTop = selectedElement && selectedElement.position && selectedElement.position.top;
    
    if(focused==='true' && fromWhere === ENTRY_TO_SELECT_EL.FROM_LEFT_SCREEN && positionTop) {
      const element = document.querySelector('.ant-spin-container')
      
      if (element) { 
        const { width, height } = element.getBoundingClientRect();
        if(selectedElement.position.top+(selectedElement.position.height/2)<60){
          setTop(0)  
        }else{
          setTop(selectedElement.position.top+(selectedElement.position.height/2)-60+12)  
        }       
        setLeft(width+24)
        if(selectedElement.position.top+selectedElement.position.height/2+60>height+12){
          setBottom(0) 
        }
      }

      setModalOpen(true);
      // setTimeout(() => {
      // const element2 = document.querySelector('.inspected-element-box')
      // console.log('element2',element2);

      // const element3 = document.querySelector('.my-custom-modal')
      //   if(element3.clientHeight){
      //     if(selectedElement.position.top+selectedElement.position.height/2<element3.clientHeight/2){
      //       setTop(0)  
      //     }else{
      //       setTop(selectedElement.position.top+selectedElement.position.height/2-element3.clientHeight/2+12)  
      //     }  
      //     if(selectedElement.position.top+selectedElement.position.height/2+element3.clientHeight/2>height+12){
      //       setBottom(0) 
      //     }
      //   }
      // }, 800);

      
    }
    else {
      setModalOpen(false);
    }
  }, [selectedElement]);  

  // modal save button
  const onSaveAsOk = () => {
    console.log("strategyMap", selectedElement.strategyMap);
    if (inputRef.current) {
      // clear first 
      applyClientMethod({
        methodName: 'clear', 
        elementId: selectedElementId
      });
      // sendKeys to phone
      applyClientMethod({
        methodName: 'sendKeys',
        elementId: selectedElementId,
        args: [inputValue || ''],
      });

      // send input event to parent
      const xpathArr = selectedElement.strategyMap.find(subArr => subArr[0] === 'xpath');
      const xpathVal = xpathArr[1];
      if(xpathVal) {
        let msg = {
          command: "input",
          type: "xpath",
          value: xpathVal,
          selectedElement,
          textValue: inputValue?inputValue:''
        }
        console.log("uitest-record,input msg:", msg);
        window.parent.postMessage(msg, "*");
      }
    }
    setInputValue('');
    setModalOpen(false); 
  };
  // modal cancel button
  const onCancel = () => {
    setInputValue('');
    setModalOpen(false); 
  };
  // end 

  const containerEl = useRef();


  // retrieve and format gesture for svg drawings
  const getGestureCoordinates = () => {
    const {showGesture} = props;
    const {FILLED, NEW_DASHED, WHOLE, DASHED} = GESTURE_ITEM_STYLES;
    const defaultTypes = {pointerDown: WHOLE, pointerUp: DASHED};

    if (!showGesture) {
      return null;
    }
    return showGesture.map((pointer) => {
      // 'type' is used to keep track of the last pointerup/pointerdown move
      let type = DASHED;
      const temp = [];
      for (const tick of pointer.ticks) {
        if (tick.type === PAUSE) {
          continue;
        }
        const len = temp.length;
        type = tick.type !== POINTER_MOVE ? defaultTypes[tick.type] : type;
        if (tick.type === POINTER_MOVE && tick.x !== undefined && tick.y !== undefined) {
          temp.push({id: tick.id, type, x: tick.x, y: tick.y, color: pointer.color});
        }
        if (len === 0) {
          if (tick.type === POINTER_DOWN) {
            temp.push({id: tick.id, type: FILLED, x: 0, y: 0, color: pointer.color});
          }
        } else {
          if (tick.type === POINTER_DOWN && temp[len - 1].type === DASHED) {
            temp[len - 1].type = FILLED;
          }
          if (tick.type === POINTER_UP && temp[len - 1].type === WHOLE) {
            temp[len - 1].type = NEW_DASHED;
          }
        }
      }
      return temp;
    });
  };

  // If we're tapping or swiping, show the 'crosshair' cursor style
  const screenshotStyle = {
    width: '360px', height: '780px'
  };
  if (screenshotInteractionMode === TAP_SWIPE || selectedTick) {
    screenshotStyle.cursor = 'crosshair';
  }

  const screenSrc = mjpegScreenshotUrl || `data:image/gif;base64,${screenshot}`;
  const screenImg = <img src={screenSrc} id="screenshot" />;
  const points = getGestureCoordinates();

  // Show the screenshot and highlighter rects.
  // Show loading indicator if a method call is in progress, unless using MJPEG mode.
  return (
    <Spin size="large" spinning={!!methodCallInProgress && !mjpegScreenshotUrl}>
      <div className={styles.innerScreenshotContainer}>
        <div
          ref={containerEl}
          style={screenshotStyle}
          className={styles.screenshotBox}
        >
          {screenshotInteractionMode !== SELECT && (
            <div className={styles.coordinatesContainer}>
              <p>{t('xCoordinate', {x})}</p>
              <p>{t('yCoordinate', {y})}</p>
            </div>
          )}
          {<ScreenControl {...props} containerEl={containerEl.current} />}
          {selectedInspectorTab === INSPECTOR_TABS.GESTURES && points && (
            <svg key="gestureSVG" className={styles.gestureSvg}>
              {points.map((pointer) =>
                pointer.map((tick, index) => (
                  <React.Fragment key={tick.id}>
                    {index > 0 && (
                      <line
                        className={styles[tick.type]}
                        key={`${tick.id}.line`}
                        x1={pointer[index - 1].x / scaleRatio}
                        y1={pointer[index - 1].y / scaleRatio}
                        x2={tick.x / scaleRatio}
                        y2={tick.y / scaleRatio}
                        style={{stroke: tick.color}}
                      />
                    )}
                    <circle
                      className={styles[`circle-${tick.type}`]}
                      key={`${tick.id}.circle`}
                      cx={tick.x / scaleRatio}
                      cy={tick.y / scaleRatio}
                      style={
                        tick.type === GESTURE_ITEM_STYLES.FILLED
                          ? {fill: tick.color}
                          : {stroke: tick.color}
                      }
                    />
                  </React.Fragment>
                )),
              )}
            </svg>
          )}
        </div>
      </div>
      <Modal
          open={modalOpen}
          title={t('titleForModal')}
          okText={t('Send Keys')}
          cancelText={t('Cancel')} 
          onCancel={onCancel}
          onOk={onSaveAsOk}
          width={320} 
          maskClosable={false}
          style={{position:'absolute',top:top,left:left,bottom:bottom}}
          className="my-custom-modal"
          footer={[
            <Button key="back" onClick={onCancel}  size="small">
              {t('Cancel')} 
            </Button>,
            <Button key="submit"  type="primary" onClick={onSaveAsOk}  size="small">
              {t('Send Keys')}
            </Button>
          ]}
        >
          <div style={{position:'absolute',left:'-10px',width: '0px', height: '0px',
              borderTop: '10px solid transparent',
              borderRight: '10px solid white',
              borderBottom: '10px solid transparent'}}></div>
          <Input value={inputValue} ref={inputRef} onChange={(e) => setInputValue(e.target.value)} placeholder={t('Enter Keys to Send')} prefix={<SearchOutlined />} style={{width:'280px'}}/>
        </Modal>
    </Spin>
  );
};

export default Screenshot;
