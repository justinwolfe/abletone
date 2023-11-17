import { useState, useEffect } from 'react';
import './App.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import classnames from 'classnames';
import classNames from 'classnames';

const getRecordingStatus = (number: number) => {
  if (number === 2) {
    return 'Counting in';
  }

  if (number === 1) {
    return 'Recording';
  }

  return '';
};

const CenterCardUI = styled(Paper)`
  width: 500px;
  height: 500px;
  padding: 30px;
`;

const TrackCardUI = styled(Paper)`
  font-size: 30px;
  text-align: center;
  padding-left: 30px;
  padding-right: 27px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 30px;
  border-radius: 5px;
`;

const BackdropUI = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #f7f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: background-color 0.4s ease;

  &.count-in {
    background-color: #c7c7ff;
  }

  &.recording {
    background-color: #8f8fff;
  }
`;

const ConnectedUI = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  margin: 2px;
  font-size: 12px;
`;

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

        <div>SCENE: {selectedSceneIndex}</div>
        <div>recording: {getRecordingStatus(isRecording)}</div>
        <div>playing: {isPlaying}</div>
        <div>songTime: {songTime}</div>
      </CenterCardUI>
    </BackdropUI>
  );
}

export default App;
