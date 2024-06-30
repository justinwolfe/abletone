import { useState, useEffect, useMemo } from 'react';
import './App.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import classNames from 'classnames';
import {
  CenterCardUI,
  ConnectedUI,
  MetaUI,
  BackdropUI,
  WrapperUI,
} from './App.css.ts';
import { getRecordingStatus } from './app.utils';

function App() {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    'ws://localhost:3005/ws'
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
  const sendToApi = (message: any) => {
    sendMessage(JSON.stringify(message));
  };

  const persistMixPrint = () => sendToApi({ type: 'PERSIST_MIXPRINT' });
  const restoreMixPrint = () => sendToApi({ type: 'RESTORE_MIXPRINT' });
  const toggleClip = (clipSlotId) =>
    sendToApi({
      type: 'TOGGLE_CLIP_SLOT',
      payload: { clipSlotId: '' },
    });
  const goToPreviousGroup = () => sendToApi({ type: 'DECREMENT_GROUP' });
  const goToNextGroup = () => sendToApi({ type: 'INCREMENT_GROUP' });

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

  const renderTracks = useMemo(() => {
    return tracks?.filter((track: any) => !track.name.includes('r-'));
  }, [tracks]);

  const renderTrackKeys = useMemo(() => {
    return renderTracks?.map((track: any) => track.name);
  }, [renderTracks]);

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
      <WrapperUI>
        <CenterCardUI>
          <ConnectedUI>
            <div>connection status: {connectionStatus}</div>
          </ConnectedUI>
          <Stack direction="row" spacing={1}>
            {renderTracks.map((trackToRender: any) => {
              return (
                <Button
                  key={trackToRender.id}
                  value={Boolean(trackToRender.recordSendEnabled)}
                  variant={
                    trackToRender.recordSendEnabled ? 'contained' : 'outlined'
                  }
                  onClick={() => {
                    sendToApi({
                      type: 'TOGGLE_SEND',
                      payload: {
                        trackKey: trackToRender.name,
                      },
                    });
                  }}
                >
                  {trackToRender.name}
                </Button>
              );
            })}
          </Stack>
        </CenterCardUI>

        {/* <TrackRowUI>
          {renderTracksForSelectedGroup.map((track) => {
            const clipSlot = track?.clipSlots[selectedSceneIndex];

            if (!clipSlot) {
              return 'error';
            }

            const { hasClip, isPlaying } = clipSlot;

            const isSelected = track.id === selectedTrackId;

            return (
              <TrackSlotUI
                key={track.id}
                className={classNames(isSelected && 'isSelected')}
              >
                {hasClip && !isPlaying && <PlayArrowUI />}
                {hasClip && isPlaying && <StopUI />}
              </TrackSlotUI>
            );
          })}
        </TrackRowUI> */}
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
