// server.js
import express from 'express';
import http from 'http';
import {
  state,
  subscribeToStateChanges,
  unsubscribeFromStateChanges,
} from './state.js';

const initServer = async () => {
  const app = express();
  const server = http.createServer(app);

  const WebSocket = await import('ws');
  const wss = new WebSocket.WebSocketServer({ server });

  app.get('/state', (req, res) => {
    res.json({
      selectedSceneIndex: state.selectedSceneIndex,
      selectedTrackIndex: state.selectedTrackIndex,
      selectedTrackName: state.selectedTrackName,
      isRecording: state.isRecording,
    });
    // res.json(state);
  });

  wss.on('connection', (ws) => {
    ws.send('fdfdsf');
    const stateChangeHandler = (newState) => {
      ws.send(
        JSON.stringify({
          selectedSceneIndex: state.selectedSceneIndex,
          selectedTrackIndex: state.selectedTrackIndex,
          selectedTrackName: state.selectedTrackName,
          isRecording: state.isRecording,
        })
      );
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
