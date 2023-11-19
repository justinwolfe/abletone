import { useState, useEffect } from 'react';
import './App.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import classNames from 'classnames';
import {
  TrackCardUI,
  CenterCardUI,
  ConnectedUI,
  TrackRowUI,
  MetaUI,
  BackdropUI,
  TrackSlotUI,
} from './App.css.ts';
import { getRecordingStatus } from './app.utils';

function App() {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    'ws://localhost:3000/ws'
  );
  const [apiState, setApiState] = useState({});
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'connecting',
    [ReadyState.OPEN]: 'open',
    [ReadyState.CLOSING]: 'closing',
    [ReadyState.CLOSED]: 'closed',
    [ReadyState.UNINSTANTIATED]: 'uninstantiated',
  }[readyState];

  console.log(apiState);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendToApi = (message: string) => {
    sendMessage(JSON.stringify('phone home'));
  };

  useEffect(() => {
    if (!lastMessage?.data) {
      return;
    }

    const newData = JSON.parse(lastMessage.data);
    setApiState(newData);
  }, [lastMessage]);

  if (Object.keys(apiState).length === 0) {
    return null;
  }

  const {
    selectedSceneIndex,
    selectedTrackIndex,
    selectedTrackName,
    isRecording,
    isPlaying,
    songTime,
  } = apiState;

  return (
    <BackdropUI
      className={classNames(
        isRecording === 2 && 'count-in',
        isRecording === 1 && 'recording'
      )}
    >
      <TrackCardUI>
        <div>{selectedTrackName}</div>
      </TrackCardUI>
      <CenterCardUI>
        <ConnectedUI>
          <div>connection status: {connectionStatus}</div>
        </ConnectedUI>
      </CenterCardUI>
      <TrackRowUI>
        <TrackSlotUI></TrackSlotUI>
        <TrackSlotUI></TrackSlotUI>
        <TrackSlotUI></TrackSlotUI>
        <TrackSlotUI></TrackSlotUI>
        <TrackSlotUI></TrackSlotUI>
        <TrackSlotUI></TrackSlotUI>
        <TrackSlotUI></TrackSlotUI>
        <TrackSlotUI></TrackSlotUI>
      </TrackRowUI>
      <MetaUI>
        <div>SCENE: {selectedSceneIndex}</div>
        <div>recording: {getRecordingStatus(isRecording)}</div>
        <div>playing: {isPlaying}</div>
        <div>songTime: {songTime}</div>
      </MetaUI>
    </BackdropUI>
  );
}

export default App;
