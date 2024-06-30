// init.js
import initKeys from './keys.js';
import initMidi from './midi.js';
import { ableton, registerAbletonListeners } from './abletonListeners.js';
import { logCurrentState, getState } from './state.js';
import {
  handleSceneChange,
  selectMonitorTrack,
  selectTrack,
} from './sceneTrackLogic.js';
import AbletonMixManager from './mix.js';
import { initServer } from './server.js';
import {
  stopClip,
  deleteClip,
  triggerRecord,
  toggleSend,
} from './abletonHandlers.js';

const DOUBLE_PRESS_DELAY = 600; // milliseconds
let lastKeyPress = { key: null, time: 0 };

const isDoublePress = (key) => {
  const now = Date.now();
  const isDouble =
    key === lastKeyPress.key && now - lastKeyPress.time < DOUBLE_PRESS_DELAY;
  lastKeyPress = { key, time: now };
  return isDouble;
};

const handleMessage = async (message, ws) => {
  const parsedMessage = JSON.parse(message);
  const { type, payload } = parsedMessage;
  const state = getState();

  switch (type) {
    case 'FIRE':
      await triggerRecord({ state, ableton });
      break;
    case 'STOP':
      await ableton.song.stop();
      break;
    case 'PLAY':
      await ableton.song.play();
      break;
    case 'TOGGLE_SEND':
      await toggleSend({ state, ableton, trackKey: payload.trackKey });
      break;
    case 'INCREMENT_GROUP':
      break;
    case 'DECREMENT_SCENE':
      break;
    default:
      break;
  }
  // await ableton.song.stopAllClips();
  console.log(parsedMessage);
};

const init = async () => {
  try {
    initMidi();
    await ableton.start();
    await registerAbletonListeners();
    await initServer(handleMessage); // Pass the handleMessage function
    const mixManager = new AbletonMixManager('./mixtape.json');
    let isBlocked = false;

    initKeys(async (key) => {
      const state = getState();
      key = key.toLowerCase();

      // return;

      if (key === 'forward slash') {
        isBlocked = !isBlocked;
        logBlockedStatus();
        return;
      }

      if (isBlocked) {
        return;
      }

      if (key === 'a' || key === 'b' || key === 'c') {
        const doublePress = isDoublePress(key);
        if (!doublePress) {
          setTimeout(async () => {
            if (lastKeyPress.key === key && !isDoublePress(key)) {
              if (key === 'a') {
                // Single press 'a'
                await handleSceneChange({ state, direction: -1 });
              } else if (key === 'b') {
                // Single press 'b'
                await handleSceneChange({ state, direction: +1 });
              } else if (key === 'c') {
                // Single press 'c'
                await triggerRecord({ state, ableton });
              }
            }
          }, DOUBLE_PRESS_DELAY);
        } else {
          if (key === 'a') {
            // Double press 'a'
            await ableton.song.stopPlaying();
          } else if (key === 'b') {
            // Double press 'b
            await ableton.song.duplicateScene(state.selectedSceneIndex);
          } else if (key === 'c') {
            // Double press 'c'
            await deleteClip({ state, ableton });
          }
        }
        return;
      }

      // Immediate actions for other keys
      switch (key) {
        case 'k': {
          await triggerRecord({ state, ableton });
          break;
        }
        case 'n': {
          await deleteClip({ state, ableton });
          break;
        }

        case 'q':
          await mixManager.saveMix(ableton);
          break;
        case 'w':
          await mixManager.restoreMix(ableton);
          break;

        case '1': {
          await selectTrack({ state, ableton, trackKey: 'drums' });
          break;
        }

        case '2': {
          await selectMonitorTrack({ state, ableton, groupName: 'keys1' });
          break;
        }

        case '3': {
          await selectMonitorTrack({ state, ableton, groupName: 'keys2' });
          break;
        }
        case '4': {
          await selectMonitorTrack({ state, ableton, groupName: 'push' });
          break;
        }

        case '5': {
          await selectMonitorTrack({ state, ableton, groupName: 'bass' });
          break;
        }

        case '6': {
          await selectMonitorTrack({ state, ableton, groupName: 'git' });
          break;
        }

        case '7': {
          await selectMonitorTrack({ state, ableton, groupName: 'vox1' });
          break;
        }
        case '8': {
          await selectMonitorTrack({ state, ableton, groupName: 'vox2' });
          break;
        }

        case '9': {
          await selectMonitorTrack({ state, ableton, groupName: 'vox2' });
          break;
        }

        case '0': {
          await selectMonitorTrack({ state, ableton, groupName: 'vox2' });
          break;
        }
      }
    });
  } catch (e) {
    console.error(e);
  }
};

const logBlockedStatus = (isBlocked) => {
  console.log(
    isBlocked ? 'Keypresses are now blocked' : 'Keypresses are now allowed'
  );
};

init();
