// init.js
import initKeys from './keys.js';
import initMidi from './midi.js';
import { ableton, registerAbletonListeners } from './abletonListeners.js';
import { logCurrentState, getState } from './state.js';
import { handleSceneChange, selectMonitorTrack } from './sceneTrackLogic.js';
import AbletonMixManager from './mix.js';
import { initServer } from './server.js';
import { stopClip, deleteClip, triggerRecord } from './abletonHandlers.js';

const DOUBLE_PRESS_DELAY = 600; // milliseconds
let lastKeyPress = { key: null, time: 0 };

const isDoublePress = (key) => {
  const now = Date.now();
  const isDouble =
    key === lastKeyPress.key && now - lastKeyPress.time < DOUBLE_PRESS_DELAY;
  lastKeyPress = { key, time: now };
  return isDouble;
};

const init = async () => {
  try {
    initMidi();
    await initServer();
    await ableton.start();
    await registerAbletonListeners();
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

      if (key === 'a' || key === 'c') {
        const doublePress = isDoublePress(key);
        if (!doublePress) {
          setTimeout(async () => {
            if (lastKeyPress.key === key && !isDoublePress(key)) {
              if (key === 'a') {
                // Single press 'a'
                await handleSceneChange({ state, direction: +1 });
              } else if (key === 'c') {
                // Single press 'c'
                await stopClip({ state, ableton });
              }
            }
          }, DOUBLE_PRESS_DELAY);
        } else {
          if (key === 'a') {
            // Double press 'a'
            await handleSceneChange({ state, direction: -1 });
          } else if (key === 'c') {
            // Double press 'c'
            await deleteClip({ state, ableton });
          }
        }
        return;
      }

      // Immediate actions for other keys
      switch (key) {
        case 'b':
          await triggerRecord({ state, ableton });
          break;
        case 'k': {
          await triggerRecord({ state, ableton });
          break;
        }
        case 'n': {
          await deleteClip({ state, ableton });
          break;
        }

        case '9':
          await mixManager.saveMix(ableton);
          break;
        case '0':
          await mixManager.restoreMix(ableton);
          break;

        case '1':
          await selectMonitorTrack({ state, ableton, groupName: 'drums' });
          break;
        case '2': {
          await selectMonitorTrack({ state, ableton, groupName: 'keys1' });
          break;
        }
        case '3': {
          await selectMonitorTrack({ state, ableton, groupName: 'keys2' });
          break;
        }
        case '4': {
          await selectMonitorTrack({ state, ableton, groupName: 'git' });
          break;
        }
        case '5': {
          await selectMonitorTrack({ state, ableton, groupName: 'vox1' });
          break;
        }
        case '6': {
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
