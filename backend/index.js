// init.js
import initKeys from './keys.js';
import initMidi from './midi.js';
import { ableton, registerAbletonListeners } from './abletonListeners.js';
import { state, logCurrentState } from './state.js';
import {
  handleSceneChange,
  findMatchingOutputTracks,
  selectMonitorTrack,
  TRACK_TYPES,
} from './sceneTrackLogic.js';
import AbletonMixManager from './mix.js';
import { initServer } from './server.js';

const DOUBLE_PRESS_DELAY = 300; // milliseconds
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
      key = key.toLowerCase();
      if (key === 'forward slash') {
        isBlocked = !isBlocked;
        console.log(
          isBlocked
            ? 'Keypresses are now blocked'
            : 'Keypresses are now allowed'
        );
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
                handleSceneChange({ state, direction: +1 });
              } else if (key === 'c') {
                // Single press 'c'
                await ableton.song.duplicateScene(state.selectedSceneIndex);
                const selectedScene = await ableton.song.view.get(
                  'selected_scene'
                );
                selectedScene.fire();
                console.log('- duplicated scene');
              }
            }
          }, DOUBLE_PRESS_DELAY);
        } else {
          if (key === 'a') {
            // Double press 'a'
            handleSceneChange({ state, direction: -1 });
          } else if (key === 'c') {
            // Double press 'c'
            // Add your logic here for double press 'c'
          }
        }
        return;
      }

      // Immediate actions for other keys
      switch (key) {
        case 'b':
          handleSceneChange({ state, direction: 1 });
          break;
        case 'k': {
          const [trackKey, trackType] = state.selectedTrackName.split('-');
          const highlightedClipSlot = await ableton.song.view.get(
            'highlighted_clip_slot'
          );

          if (
            highlightedClipSlot.raw.is_recording ||
            (!highlightedClipSlot.raw.has_clip &&
              trackType === TRACK_TYPES.RENDER)
          ) {
            await highlightedClipSlot.fire();
            return;
          }

          const matchingOutputTracks = await findMatchingOutputTracks({
            state,
            trackKey,
          });

          if (!matchingOutputTracks.length) {
            console.log('- out of tracks, making a new one');
            await ableton.song.duplicateTrack(state.selectedTrackIndex);
            const newHighlightedClipSlot = await ableton.song.view.get(
              'highlighted_clip_slot'
            );

            if (newHighlightedClipSlot?.raw?.has_clip) {
              await newHighlightedClipSlot.deleteClip();
              const selectedTrack = await ableton.song.view.get(
                'selected_track'
              );
              await selectedTrack.set('arm', true);
            }
            return;
          }

          const firstEmptyTrack = matchingOutputTracks[0];
          await ableton.song.view.set('selected_track', firstEmptyTrack.raw.id);
          const selectedTrack = await ableton.song.view.get('selected_track');
          await selectedTrack.set('arm', true);

          const newHighlightedClipSlot = await ableton.song.view.get(
            'highlighted_clip_slot'
          );
          await newHighlightedClipSlot.fire();
          break;
        }
        case 'n': {
          const highlightedClipSlot = await ableton.song.view.get(
            'highlighted_clip_slot'
          );

          if (highlightedClipSlot?.raw?.has_clip) {
            await highlightedClipSlot.deleteClip();
          }

          break;
        }

        case '0':
          await mixManager.saveMix(ableton);
          break;

        case '1':
          await mixManager.restoreMix(ableton);
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

init();
