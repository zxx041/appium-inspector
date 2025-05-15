import {
  AppstoreOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  VideoCameraOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PoweroffOutlined,
  SelectOutlined,
} from '@ant-design/icons';
import {Button, Select, Space, Tooltip} from 'antd';
import React, {useState, useEffect} from 'react';
import {BiCircle, BiSquare} from 'react-icons/bi';
import {HiOutlineHome, HiOutlineMicrophone} from 'react-icons/hi';
import {IoChevronBackOutline} from 'react-icons/io5';

import {BUTTON} from '../../constants/antd-types';
import {LINKS} from '../../constants/common';
import {APP_MODE} from '../../constants/session-inspector';
import {shell} from '../../polyfills';
import InspectorStyles from './Inspector.module.css';

import Rec from './rec.svg';
import Rec2 from './rec2.svg';


const HeaderButtons = (props) => {
  const {
    selectAppMode,
    appMode,
    mjpegScreenshotUrl,
    isSourceRefreshOn,
    toggleRefreshingState,
    isRecording,
    recordFlag,
    toggleRecordFlag,
    startRecording,
    pauseRecording,
    showLocatorTestModal,
    showSiriCommandModal,
    applyClientMethod,
    quitCurrentSession,
    driver,
    contexts,
    currentContext,
    setContext,
    t,
    setSourceTreeOpenFlag,
    sourceTreeOpenFlag,
    toggleOpenPositionFlag,
  } = props;

  const [count, setCount] = useState(0);

  useEffect(() => {
    let intervalId
    if(recordFlag){
        intervalId = setInterval(() => {
        setCount(prevCount => prevCount + 1); 
        // 使用函数式更新防止闭包问题
      }, 500); // 
    } else {
      return () => clearInterval(intervalId); 
    }
  },[recordFlag]);

  const deviceControls = (
    <Button.Group style={{display:'flex',flexDirection:'column'}}>
      {driver && driver.client.isIOS && (
        <>
          <Tooltip title={t('Press Home Button')} placement="right">
            <Button
              id="btnPressHomeButton"
              style={{marginLeft: '-1px'}}
              icon={<HiOutlineHome className={InspectorStyles['custom-button-icon']} />}
              onClick={() =>
                applyClientMethod({
                  methodName: 'executeScript',
                  args: ['mobile:pressButton', [{name: 'home'}]],
                })
              }
            />
          </Tooltip>
          <Tooltip title={t('Execute Siri Command')} placement="right">
            <Button
              id="siriCommand"
              icon={<HiOutlineMicrophone className={InspectorStyles['custom-button-icon']} />}
              onClick={showSiriCommandModal}
            />
          </Tooltip>
        </>
      )}
      {driver && driver.client.isAndroid && (
        <>
          <Tooltip title={t('Press Power Button')} placement="right">
            <Button
              id="btnPressPowerButton"
              icon={<PoweroffOutlined className={InspectorStyles['custom-button-icon']} />}
              onClick={() => applyClientMethod({methodName: 'executeScript', args: ['mobile: shell', [{command: 'input', args: ['keyevent', '26']}]]})}
            />
          </Tooltip>
          <Tooltip title={t('Press Back Button')} placement="right">
            <Button
              id="btnPressHomeButton"
              icon={<IoChevronBackOutline className={InspectorStyles['custom-button-icon']} />}
              onClick={() => applyClientMethod({methodName: 'pressKeyCode', args: [4]})}
            />
          </Tooltip>
          <Tooltip title={t('Press Home Button')} placement="right">
            <Button
              id="btnPressHomeButton"
              icon={<BiCircle className={InspectorStyles['custom-button-icon']} />}
              onClick={() => applyClientMethod({methodName: 'pressKeyCode', args: [3]})}
            />
          </Tooltip>
          <Tooltip title={t('Press App Switch Button')} placement="right">
            <Button
              id="btnPressHomeButton"
              icon={<BiSquare className={InspectorStyles['custom-button-icon']} />}
              onClick={() => applyClientMethod({methodName: 'pressKeyCode', args: [187]})}
            />
          </Tooltip>
        </>
      )}
    </Button.Group>
  );

  const appModeControls = (
    <Button.Group value={appMode}>
      <Tooltip title={t('Native App Mode')}>
        <Button
          icon={<AppstoreOutlined />}
          onClick={() => selectAppMode(APP_MODE.NATIVE)}
          type={appMode === APP_MODE.NATIVE ? BUTTON.PRIMARY : BUTTON.DEFAULT}
        />
      </Tooltip>
      <Tooltip title={t('Web/Hybrid App Mode')}>
        <Button
          icon={<GlobalOutlined />}
          onClick={() => selectAppMode(APP_MODE.WEB_HYBRID)}
          type={appMode === APP_MODE.WEB_HYBRID ? BUTTON.PRIMARY : BUTTON.DEFAULT}
        />
      </Tooltip>
      {contexts && contexts.length === 1 && (
        <Tooltip
          title={t('noAdditionalContextsFound')}
          overlayClassName={InspectorStyles['wide-tooltip']}
        >
          <div
            className={`${InspectorStyles['contexts-custom-btn']} ${InspectorStyles['no-contexts-info-icon']}`}
          >
            <ExclamationCircleOutlined className={InspectorStyles['custom-button-icon']} />
          </div>
        </Tooltip>
      )}
      {contexts && contexts.length > 1 && (
        <>
          <Select
            className={InspectorStyles['header-context-selector']}
            value={currentContext}
            dropdownMatchSelectWidth={false}
            onChange={(value) => {
              setContext(value);
              applyClientMethod({methodName: 'switchContext', args: [value]});
            }}
          >
            {contexts.map(({id, title}) => (
              <Select.Option key={id} value={id}>
                {title ? `${title} (${id})` : id}
              </Select.Option>
            ))}
          </Select>
          <Tooltip
            title={
              <>
                {t('contextDropdownInfo')}{' '}
                <a
                  onClick={(e) => e.preventDefault() || shell.openExternal(LINKS.HYBRID_MODE_DOCS)}
                >
                  {LINKS.HYBRID_MODE_DOCS}
                </a>
              </>
            }
            overlayClassName={InspectorStyles['wide-tooltip']}
          >
            <div
              className={`${InspectorStyles['contexts-custom-btn']} ${InspectorStyles['contexts-info-icon']}`}
            >
              <InfoCircleOutlined className={InspectorStyles['custom-button-icon']} />
            </div>
          </Tooltip>
        </>
      )}
    </Button.Group>
  );

  const generalControls = (
    <Button.Group style={{display:'flex',flexDirection:'column',marginTop:'8px'}}>
      {mjpegScreenshotUrl && !isSourceRefreshOn && (
        <Tooltip title={t('Start Refreshing Source')} placement="right">
          <Button
            id="btnStartRefreshing"
            icon={<PlayCircleOutlined />}
            onClick={toggleRefreshingState}
            style={{marginLeft: '-1px'}}
          />
        </Tooltip>
      )}
      {mjpegScreenshotUrl && isSourceRefreshOn && (
        <Tooltip title={t('Pause Refreshing Source')} placement="right">
          <Button
            id="btnPauseRefreshing"
            icon={<PauseCircleOutlined />}
            onClick={toggleRefreshingState}
          />
        </Tooltip>
      )}
      <Tooltip title={t('refreshSource')} placement="right">
        <Button
          id="btnReload"
          icon={<ReloadOutlined />}
          onClick={() => applyClientMethod({methodName: 'getPageSource'})}
        />
      </Tooltip>
      <Tooltip title={t('Search for element')} placement="right">
        <Button id="searchForElement" icon={<SearchOutlined />} onClick={showLocatorTestModal} />
      </Tooltip>
      {!recordFlag && (
        <Tooltip title={t('Start Recording')} placement="right">
          <Button id="btnStartRecording" icon={<VideoCameraOutlined />} onClick={toggleRecordFlag} />
        </Tooltip>
      )}
      {/* icon={<VideoCameraOutlined />} */}
      {recordFlag && (
        <Tooltip title={t('Pause Recording')} placement="right">
          <Button
            id="btnPause"
            icon={<img style={{width:'24px',height:'24px'}} src={count % 2 === 0?Rec:Rec2} alt="icon" />}
            type={BUTTON.DANGER}
            onClick={toggleRecordFlag}
          />
        </Tooltip>
      )}
        <Tooltip title={t('Position Element')} placement="right">
          <Button
            id="btnPosition"
            icon={<SelectOutlined />}
            onClick={toggleOpenPositionFlag}
          />
        </Tooltip>
    </Button.Group>
  );

  // const quitSessionButton = (
  //   <Tooltip title={t('Quit Session')}>
  //     <Button id="btnClose" icon={<CloseOutlined />} onClick={quitCurrentSession} />
  //   </Tooltip>
  // );

  return (
    // className={InspectorStyles['inspector-toolbar']}
    <div style={{height: '100%', display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between', 
                paddingLeft: '1em'}}>
      {/* <Space size="middle"> */}
        <div>
          {deviceControls}
          {/* {appModeControls} */}
          {generalControls}
          {/* {quitSessionButton} */ /* 注释掉退出会话 */}
        </div>

        <div>
          <Button.Group>
            {!sourceTreeOpenFlag
            && (
            <Tooltip title={t('Look App Source')} placement="right">
              <Button
                id="btnOpenSourceTree"
                icon={<EyeOutlined />}
                onClick={setSourceTreeOpenFlag}
              />
            </Tooltip>
            )}
            {sourceTreeOpenFlag
            && (
            <Tooltip title={t('NotLook App Source')} placement="right">
              <Button
                id="btnOpenSourceTree"
                icon={<EyeInvisibleOutlined />}
                onClick={setSourceTreeOpenFlag}
              />
            </Tooltip>
            )}
          </Button.Group>
        </div>

      {/* </Space> */}
    </div>
  );
};

export default HeaderButtons;
