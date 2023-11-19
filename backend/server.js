// server.js
import express from 'express';
import http from 'http';
import {
  state,
  subscribeToStateChanges,
  unsubscribeFromStateChanges,
} from './state.js';
import { Color } from 'ableton-js/util/color.js';

const getSerializableState = async (state) => {
  const trackPromises = state.tracks.map(async (track) => {
    const [key, type] = track.raw.name.split('-');

    if (!key || !type) {
      return false;
    }

    const clipSlots = await track.get('clip_slots');

    return {
      id: track.raw.id,
      name: track.raw.name,
      group: track.raw.name.split('-')?.[0].trim(),
      color: new Color(track.raw.color).hex,
      isGroup: type.trim() === 'g',
      isMonitor: type.trim() === 'm',
      isRender: type.trim() === 'r',
      clipSlots: clipSlots.map((clipSlot, i) => {
        return {
          index: i,
          id: clipSlot.raw.id,
          hasClip: clipSlot.raw.has_clip,
          isPlaying: clipSlot.raw.is_playing,
          isRecording: clipSlot.raw.is_recording,
          isTriggered: clipSlot.raw.is_triggered,
        };
      }),
    };
  });

  const serializableTracks = await Promise.all(trackPromises);
  const filteredTracks = serializableTracks.filter(Boolean);

  return {
    selectedSceneIndex: state.selectedSceneIndex,
    selectedTrackIndex: state.selectedTrackIndex,
    selectedTrackName: state.selectedTrackName,
    selectedGroup: state.selectedTrackName?.split('-')?.[0],
    isRecording: state.isRecording,
    isPlaying: state.isPlaying,
    songTime: state.songTime,
    tracks: filteredTracks,
  };
};

const initServer = async () => {
  const app = express();
  const server = http.createServer(app);

  const WebSocket = await import('ws');
  const wss = new WebSocket.WebSocketServer({ server });

  app.get('/state', async (req, res) => {
    res.json();
    res.json(await getSerializableState(state));
  });

  wss.on('connection', async (ws) => {
    ws.send(JSON.stringify(await getSerializableState(state)));

    const stateChangeHandler = async (newState) => {
      ws.send(JSON.stringify(await getSerializableState(newState)));
    };

    subscribeToStateChanges(stateChangeHandler);

    ws.on('close', () => {
      unsubscribeFromStateChanges(stateChangeHandler);
    });
  });

  server.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
};

export { initServer };
