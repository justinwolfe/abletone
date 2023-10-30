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

initMidi();

const init = async () => {
  try {
    await ableton.start();
    await registerAbletonListeners();

    initKeys(async (key) => {
      switch (key.toLowerCase()) {
        case 'a':
          handleSceneChange({ state, direction: -1 });
          break;
        case 'b':
          handleSceneChange({ state, direction: 1 });
          break;
        case 'c':
          await ableton.song.duplicateScene(state.selectedSceneIndex);
          const selectedScene = await ableton.song.view.get('selected_scene');
          selectedScene.fire();
          console.log('- duplicated scene');
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
            const highlightedClipSlot = await ableton.song.view.get(
              'highlighted_clip_slot'
            );

            if (highlightedClipSlot?.raw?.has_clip) {
              await highlightedClipSlot.deleteClip();
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

        case 'n':
          const highlightedClipSlot = await ableton.song.view.get(
            'highlighted_clip_slot'
          );

          if (highlightedClipSlot?.raw?.has_clip) {
            await highlightedClipSlot.deleteClip();
          }

          break;

        case '1': {
          // await selecttMonitorTrack('')
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
