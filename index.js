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
let mixprint = {};

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

        case '0': {
          for (var track of state.tracks) {
            const trackId = track.raw.id;
            const mixerDevice = await track.get('mixer_device');
            const volume = await mixerDevice.get('volume');
            const panning = await mixerDevice.get('panning');
            const sends = await mixerDevice.get('sends');
            const activator = await mixerDevice.get('track_activator');
            mixprint[trackId] = {
              trackId: trackId,
              trackName: track.raw.name,
              activator: activator.raw.value,
              volume: volume.raw.value,
              panning: panning.raw.value,
              sends: sends.map((send) => send.raw),
            };
          }
          console.log('saved mix');
          break;
        }

        case '1': {
          const tracks = await ableton.song.get('tracks', key);

          for (key in mixprint) {
            const track = tracks.find((track) => track.raw.id === key);

            if (!track) {
              return;
            }

            const mixerDevice = await track.get('mixer_device');
            const activator = await mixerDevice.get('track_activator');
            await activator.set('value', mixprint[key].activator);
            const volume = await mixerDevice.get('volume');
            await volume.set('value', mixprint[key].volume);
            const panning = await mixerDevice.get('panning');
            await panning.set('value', mixprint[key].panning);
            const sends = await mixerDevice.get('sends');
            for (var send of sends) {
              const sendToPrint = mixprint[key].sends.find(
                (capturedSend) => capturedSend.id === send.raw.id
              );

              if (sendToPrint) {
                await send.set('value', sendToPrint.value);
              }
            }
          }
          console.log('restored mix');
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
