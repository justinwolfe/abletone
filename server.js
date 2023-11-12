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
    console.log('test it');
    res.json({ test: 'it' });
    // res.json(state);
  });

  wss.on('connection', (ws) => {
    const stateChangeHandler = (newState) => {
      ws.send({ test: 'it' });
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
