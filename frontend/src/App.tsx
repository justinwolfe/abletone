import { useState, useEffect } from 'react';
import './App.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';

function App() {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    'ws://localhost:3000/ws'
  );
  const [apiState, setApiState] = useState({});
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
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
    <>
      <div>connection status: {connectionStatus}</div>
      <div>TRACK: {selectedTrackName}</div>
      <div>SCENE: {selectedSceneIndex}</div>
      <div>recording: {isRecording}</div>
      <div>playing: {isPlaying}</div>
      <div>songTime: {songTime}</div>
    </>
  );
}

export default App;
