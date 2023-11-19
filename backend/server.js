// server.js
import express from 'express';
import http from 'http';
import {
  state,
  subscribeToStateChanges,
  unsubscribeFromStateChanges,
} from './state.js';
import { Color } from 'ableton-js/util/color.js';

const getSerializableState = (state) => {
  const serializableTracks = state.tracks
    .map((track) => {
      const [key, type] = track.raw.name.split('-');

      if (!key || !type) {
        return false;
      }

      return {
        id: track.raw.id,
        name: track.raw.name,
        group: track.raw.name.split('-')?.[0].trim(),
        color: new Color(track.raw.color).hex,
        isGroup: type.trim() === 'g',
        isMonitor: type.trim() === 'm',
        isTrack: type.trim() === 't',
      };
    })
    .filter(Boolean);

  return {
    selectedSceneIndex: state.selectedSceneIndex,
    selectedTrackIndex: state.selectedTrackIndex,
    selectedTrackName: state.selectedTrackName,
    isRecording: state.isRecording,
    isPlaying: state.isPlaying,
    songTime: state.songTime,
    tracks: serializableTracks,
  };
};

const initServer = async () => {
  const app = express();
  const server = http.createServer(app);

  const WebSocket = await import('ws');
  const wss = new WebSocket.WebSocketServer({ server });

  app.get('/state', (req, res) => {
    res.json();
    res.json(getSerializableState(state));
  });

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify(getSerializableState(state)));

    const stateChangeHandler = (newState) => {
      ws.send(JSON.stringify(getSerializableState(newState)));
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
