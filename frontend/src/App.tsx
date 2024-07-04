import { useState, useEffect, useMemo } from 'react';
import './App.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import {
  PlayArrow,
  Stop,
  Mic,
  Schedule,
  Delete,
  ArrowDropUp,
  ArrowDropDown,
} from '@mui/icons-material';
import Slider from '@mui/material/Slider';
import styled from 'styled-components';

import classNames from 'classnames';
import {
  BackdropUI,
  TrackSlotUI,
  StopUI,
  RecordUI,
  PlayArrowUI,
  TriggeredUI,
  TransportContainerUI,
} from './App.css.ts';

const CenterBoxUI = styled.div`
  display: flex;
  justify-content: space-between;
  width: 76%;
  padding-left: 12%;
  padding-right: 12%;
  padding-top: 7%;
`;

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
    metronomeEnabled,
    songTime,
    tempo,
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
    return tracks?.filter((track: any) => track.name.includes('r-'));
  }, [tracks]);

  const monitorTracks = useMemo(() => {
    return tracks?.filter((track: any) => !track.name.includes('r-'));
  }, [tracks]);

  if (Object.keys(apiState).length === 0) {
    return null;
  }

  if (connectionStatus === 'closed') {
    return null;
  }

  const handleTempoChange = (event, newValue) => {
    // Update the state or send the new value to the backend
    sendToApi({ type: 'SET_TEMPO', payload: { tempo: newValue } });
  };

  const renderHeader = () => (
    <CenterBoxUI>
      <Button
        variant={metronomeEnabled ? 'contained' : 'outlined'}
        onClick={() => sendToApi({ type: 'TOGGLE_METRONOME' })}
      >
        <Schedule />
      </Button>
      <div>
        <Slider
          aria-label="Tempo"
          value={tempo}
          onChange={handleTempoChange}
          min={60}
          max={160}
          style={{ width: 250, margin: '10px' }}
          valueLabelDisplay="on"
        />
      </div>
      <Button
        variant={'contained'}
        onClick={() => sendToApi({ type: 'DELETE_ALL_CLIPS' })}
        style={{ margin: '10px' }}
      >
        <Delete />
      </Button>
    </CenterBoxUI>
  );

  const renderRows = () => (
    <CenterBoxUI>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {monitorTracks.map((trackToRender: any) => {
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
        </div>
        {renderTransport()}
      </div>
    </CenterBoxUI>
  );

  const renderTransport = () => (
    <TransportContainerUI>
      <IconButton onClick={() => sendToApi({ type: 'FIRE' })}>
        <Mic style={{ height: '100px', width: '100px' }} />
      </IconButton>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <IconButton onClick={() => sendToApi({ type: 'PLAY' })}>
          <PlayArrow style={{ height: '50px', width: '50px' }} />
        </IconButton>
        <IconButton onClick={() => sendToApi({ type: 'STOP' })}>
          <Stop style={{ height: '50px', width: '50px' }} />
        </IconButton>
      </div>
    </TransportContainerUI>
  );

  const renderClips = () => {
    return (
      <CenterBoxUI>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '15% 1fr',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '64px',
            }}
          >
            <IconButton onClick={() => sendToApi({ type: 'DECREMENT_SCENE' })}>
              <ArrowDropUp sx={{ fontSize: 70 }} />
            </IconButton>
            <div style={{ fontSize: '30px' }}>{selectedSceneIndex + 1}</div>
            <IconButton onClick={() => sendToApi({ type: 'INCREMENT_SCENE' })}>
              <ArrowDropDown sx={{ fontSize: 70 }} />
            </IconButton>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginTop: '0px',
            }}
          >
            {renderTracks.map((track) => {
              const clipSlot = track?.clipSlots[selectedSceneIndex];

              if (!clipSlot) {
                return 'error';
              }

              const {
                hasClip,
                isPlaying,
                isRecording: isClipRecording,
                isTriggered,
              } = clipSlot;

              const isSelected = track.id === selectedTrackId;

              return (
                <TrackSlotUI
                  key={track.id}
                  className={classNames(isSelected && 'isSelected')}
                  onClick={() => {
                    console.log('hi', clipSlot);
                    sendToApi({
                      type: 'TOGGLE_CLIP',
                      payload: {
                        clipSlotId: clipSlot.id,
                      },
                    });
                  }}
                  tabIndex={0}
                >
                  {Boolean(hasClip && !isPlaying) && <PlayArrowUI />}
                  {Boolean(hasClip && isPlaying && !isClipRecording) && (
                    <StopUI />
                  )}
                  {Boolean(!hasClip && isTriggered) && <TriggeredUI />}
                  {Boolean(hasClip && isPlaying && isClipRecording) && (
                    <RecordUI />
                  )}
                </TrackSlotUI>
              );
            })}
          </div>
        </div>
      </CenterBoxUI>
    );
  };

  return (
    <BackdropUI
      className={classNames(
        isRecording === 2 && 'count-in',
        isRecording === 1 && 'recording',
        isPlaying && 'playing'
      )}
    >
      {renderHeader()}
      {renderRows()}
      {renderClips()}
    </BackdropUI>
  );
}

export default App;
