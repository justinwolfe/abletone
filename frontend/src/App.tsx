import { useState, useEffect, useMemo } from 'react';
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
  WrapperUI,
  PlayArrowUI,
  StopUI,
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

  const {
    selectedSceneIndex,
    selectedTrackIndex,
    selectedTrackName,
    selectedTrackId,
    selectedGroup,
    isRecording,
    isPlaying,
    songTime,
    tracks,
  } = apiState;

  const tracksForSelectedGroup = useMemo(() => {
    if (!selectedGroup || !tracks?.length) {
      return [];
    }

    const renderTracksForGroup = tracks.filter(
      (track) => track.group === selectedGroup
    );

    return renderTracksForGroup;
  }, [selectedGroup, tracks]);

  const renderTracksForSelectedGroup = useMemo(
    () => tracksForSelectedGroup.filter((track) => track.isRender),
    [tracksForSelectedGroup]
  );

  console.log(renderTracksForSelectedGroup);

  if (Object.keys(apiState).length === 0) {
    return null;
  }

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
      <WrapperUI>
        <CenterCardUI>
          <ConnectedUI>
            <div>connection status: {connectionStatus}</div>
          </ConnectedUI>
        </CenterCardUI>
        <TrackRowUI>
          {renderTracksForSelectedGroup.map((track) => {
            console.log(renderTracksForSelectedGroup, selectedSceneIndex);
            const clipSlot = track?.clipSlots[selectedSceneIndex];

            if (!clipSlot) {
              return 'error';
            }

            const { hasClip, isPlaying } = clipSlot;

            const isSelected = track.id === selectedTrackId;

            console.log('isSelected', isSelected);

            return (
              <TrackSlotUI
                key={track?.id}
                isSelected={isSelected}
                className={classNames(isSelected && 'isSelected')}
              >
                {hasClip && !isPlaying && <PlayArrowUI />}
                {hasClip && isPlaying && <StopUI />}
              </TrackSlotUI>
            );
          })}
        </TrackRowUI>
      </WrapperUI>
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
