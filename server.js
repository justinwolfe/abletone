// server.js
import express from 'express';
import http from 'http';
import {
  state,
  subscribeToStateChanges,
  unsubscribeFromStateChanges,
} from './state.js';

const getSerializableState = (state) => {
  return {
    selectedSceneIndex: state.selectedSceneIndex,
    selectedTrackIndex: state.selectedTrackIndex,
    selectedTrackName: state.selectedTrackName,
    isRecording: state.isRecording,
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
