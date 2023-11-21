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
    selectedSceneId: state.selectedSceneId,
    selectedTrackIndex: state.selectedTrackIndex,
    selectedTrackName: state.selectedTrackName,
    selectedTrackId: state.selectedTrackId,
    selectedGroup: state.selectedTrackName?.split('-')?.[0],
    isRecording: state.isRecording,
    isPlaying: state.isPlaying,
    songTime: state.songTime,
    tracks: filteredTracks,
  };
};

const initServer = async (onMessage) => {
  const app = express();
  const server = http.createServer(app);

  const WebSocket = await import('ws');
  const wss = new WebSocket.WebSocketServer({ server });

  app.get('/state', async (req, res) => {
    res.json();
    res.json(await getSerializableState(state));
  });

  wss.on('connection', async (ws) => {
    const sendState = async () => {
      ws.send(JSON.stringify(await getSerializableState(state)));
    };

    // Send initial state
    sendState();

    // Set an interval to send state every 200 milliseconds
    const intervalId = setInterval(sendState, 200);

    const stateChangeHandler = async () => {
      sendState();
    };

    subscribeToStateChanges(stateChangeHandler);

    if (onMessage) {
      ws.on('message', (message) => {
        onMessage(message, ws);
      });
    }

    ws.on('close', () => {
      // Clear the interval when the connection is closed
      clearInterval(intervalId);
      unsubscribeFromStateChanges(stateChangeHandler);
    });
  });

  server.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
};

export { initServer };
