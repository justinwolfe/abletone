// server.js
import express from 'express';
import http from 'http';
import {
  state,
  subscribeToStateChanges,
  unsubscribeFromStateChanges,
} from './state.js';
import { Color } from 'ableton-js/util/color.js';
import { ableton } from './abletonListeners.js';

const getSerializableState = async (state) => {
  const trackPromises = state.tracks.map(async (track) => {
    const clipSlots = await track.get('clip_slots');
    const mixerDevice = await track.get('mixer_device');
    const sends = await mixerDevice.get('sends');
    const outputSend = sends.find((send) =>
      send.raw.name.toLowerCase().includes('loops')
    );

    const outputSendValue = outputSend?.raw?.value || 0;

    return {
      id: track.raw.id,
      name: track.raw.name,
      group: track.raw.name.split('-')?.[0].trim(),
      color: new Color(track.raw.color).hex,
      isRender: track.raw.name.includes('r-'),
      recordSendEnabled: outputSendValue > 0 ? true : false,
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
  const metronome = await ableton.song.get('metronome');
  const tempo = await ableton.song.get('tempo');

  return {
    selectedSceneIndex: state.selectedSceneIndex,
    selectedSceneId: state.selectedSceneId,
    selectedTrackIndex: state.selectedTrackIndex,
    selectedTrackName: state.selectedTrackName,
    selectedTrackId: state.selectedTrackId,
    selectedGroup: state.selectedTrackName?.split('-')?.[0],
    metronomeEnabled: metronome,
    isRecording: state.isRecording,
    isPlaying: state.isPlaying,
    songTime: state.songTime,
    tracks: filteredTracks,
    tempo: tempo,
  };
};

let server;
const initServer = async (onMessage) => {
  if (server) {
    server.close();
  }

  const app = express();
  server = http.createServer(app);

  const WebSocket = await import('ws');
  const wss = new WebSocket.WebSocketServer({ server });

  app.get('/state', async (req, res) => {
    res.json(await getSerializableState(state));
  });

  wss.on('connection', async (ws) => {
    let lastSentState = null; // Variable to store the last sent state

    const sendState = async () => {
      const currentState = await getSerializableState(state);
      // Compare the current state with the last sent state before sending
      if (JSON.stringify(currentState) !== JSON.stringify(lastSentState)) {
        ws.send(JSON.stringify(currentState));
        lastSentState = currentState; // Update last sent state
      }
    };

    // Send initial state
    sendState();

    // Set an interval to send state every 20 milliseconds
    const intervalId = setInterval(sendState, 20);

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

  server
    .listen(3005, () => {
      console.log('Server listening on port 3005');
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error('Port 3005 is in use, retrying...');
        setTimeout(() => {
          server.close();
          initServer(onMessage);
        }, 1000); // wait 1 second before retrying
      } else {
        throw err;
      }
    });
};

export { initServer };
