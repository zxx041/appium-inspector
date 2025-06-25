import React ,{useEffect,useState} from 'react';

import InspectorCSS from './Inspector.module.css';

import {ENTRY_TO_SELECT_EL} from '../../constants/common';

/**
 * Absolute positioned divs that overlay the app screenshot and highlight the bounding
 * boxes of the elements in the app
 */
const HighlighterRectForElem = (props) => {
  const {
    hoveredElement = {},
    selectHoveredElement,
    unselectHoveredElement,
    selectedElement = {},
    selectElement,
    unselectElement,
    dimensions,
    element,
    isSourceRefreshOn,
    methodCallInProgress,
    mjpegScreenshotUrl,
  } = props;

  const {width, height, left, top} = dimensions;
  const key = element.path;
  let highlighterClasses = [InspectorCSS['highlighter-box']];

  // useEffect(() => {
  //   let disabledEle = InspectorCSS['disabled-element-box'];

  //   if(!!methodCallInProgress && mjpegScreenshotUrl && isSourceRefreshOn){
  //     // highlighterClasses.push(InspectorCSS['disabled-element-box']);
  //     if(!isNotAllowedOn) {
  //       setMouseNotAllowedClasses(true);
  //     }
  //     // setLoading(true)
  //   }else{
  //     if(isNotAllowedOn) {
  //       setMouseNotAllowedClasses(false);
  //     }

  //     // let index=''
  //     // highlighterClasses.forEach((i,ind)=>{
  //     //  if(i.indexOf('disabled-element-box')>-1){
  //     //   index=ind
  //     //  }
  //     // })
  //     // if (index !== -1) {
  //     //   highlighterClasses.splice(index, 1); // 删除第一个匹配的元素
  //     // }
  //     // highlighterClasses.push(InspectorCSS['disabled-element-box']);
  //     // setLoading(true)
  //   }
  // },[isSourceRefreshOn,methodCallInProgress,mjpegScreenshotUrl]);

  // Add class + special classes to hovered and selected elements
  if (hoveredElement.path === element.path) {
    highlighterClasses.push(InspectorCSS['hovered-element-box']);
  }
  if (selectedElement.path === element.path) {
    highlighterClasses.push(InspectorCSS['inspected-element-box']);
  }

  // if(isNotAllowedOn) {
  // console.log("methodCallInProgress,isSourceRefreshOn:", methodCallInProgress, isSourceRefreshOn);
  // if(!!methodCallInProgress && mjpegScreenshotUrl && isSourceRefreshOn) {
  //   highlighterClasses.push(InspectorCSS['disabled-element-box']);
  // }

  // console.log("highlighterClasses:", highlighterClasses);

  const renderElements = () => {
    // debugger
    // console.log('selectedElementselectedElement', selectedElement);

    // if(key === selectedElement.path){
    //   unselectElement()
    // }else{
    //   selectElement(key, ENTRY_TO_SELECT_EL.FROM_LEFT_SCREEN,{left: left, top: top , width: width , height: height })
    // }
    selectElement(key, ENTRY_TO_SELECT_EL.FROM_LEFT_SCREEN,{left: left, top: top , width: width , height: height })
  }

  return (
    <div
      className={highlighterClasses.join(' ').trim()}
      onMouseOver={() => selectHoveredElement(key)}
      onMouseOut={unselectHoveredElement}
      // onClick={renderElements}
      onMouseDown={renderElements}
      key={key}
      style={{left: left || 0, top: top || 0, width: width || 0, height: height || 0}}
    >
      <div></div>
    </div>
  );
};

export default HighlighterRectForElem;
