import { Ableton } from 'ableton-js';

const ableton = new Ableton({ logger: console });

// import initMidi from './midi.js';
// initMidi();
// import initKeys from './keys.js';
import { GlobalKeyboardListener } from 'node-global-key-listener';

const initKeys = (callback) => {
  if (!callback) {
    return console.error('No callback provided to initKeys');
  }
  const keys = new GlobalKeyboardListener();

  //Log every key that's pressed.
  keys.addListener(function (e, down) {
    if (e.state !== 'DOWN') return;
    callback(e.name);
  });
};

const TRACK_TYPES = {
  MONITOR: 'm',
  GROUP: 'g',
  TEMPLATE: 't',
  RENDER: 't',
};

const getIndexByRawId = (id, collection) =>
  collection.findIndex((item) => item.raw.id === id);

// 1. Create an object to hold the state of your variables
const baseState = {
  scenes: [],
  tracks: [],
  selectedSceneIndex: undefined,
  selectedTrackIndex: undefined,
  selectedTrackName: undefined,
  isRecording: false,
};

const logCurrentState = () => {
  console.log({
    scenesLength: baseState.scenes.length,
    tracksLength: baseState.tracks.length,
    selectedSceneIndex: baseState.selectedSceneIndex,
    selectedTrackIndex: baseState.selectedTrackIndex,
    selectedTrackName: baseState.selectedTrackName,
  });
};

// 3. Use a Proxy to watch for changes in the `baseState` object
const state = new Proxy(baseState, {
  set(target, property, value) {
    target[property] = value;
    // logCurrentState();
    return true;
  },
});

const updateScenes = async () => {
  state.scenes = await ableton.song.get('scenes');
};

const updateTracks = async () => {
  state.tracks = await ableton.song.get('tracks');
};

const registerAbletonListeners = async () => {
  await updateScenes();
  await updateTracks();

  const initialSelectedScene = await ableton.song.view.get('selected_scene');
  state.selectedSceneIndex = getIndexByRawId(
    initialSelectedScene.raw.id,
    state.scenes
  );

  const initialSelectedTrack = await ableton.song.view.get('selected_track');
  state.selectedTrackIndex = getIndexByRawId(
    initialSelectedTrack.raw.id,
    state.tracks
  );
  state.selectedTrackName = initialSelectedTrack.raw.name;

  ableton.song.addListener('tracks', async (t) => {
    state.tracks = t;
  });

  ableton.song.addListener('scenes', async (s) => {
    state.scenes = s;
  });

  ableton.song.view.addListener('selected_track', async (tr) => {
    state.selectedTrackIndex = getIndexByRawId(tr.raw.id, state.tracks);
    state.selectedTrackName = tr.raw.name;
  });

  ableton.song.view.addListener('selected_scene', async (sc) => {
    state.selectedSceneIndex = getIndexByRawId(sc.raw.id, state.scenes);
  });

  logCurrentState();
};

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
          console.log('- duplicated scene');
          break;
        case 'r':
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
        case '#delete':
          break;
      }
    });
  } catch (e) {
    console.error(e);
  }
};

init();

async function handleSceneChange({ state, direction }) {
  let newSceneIndex = state.selectedSceneIndex + direction;

  if (newSceneIndex < 0) {
    newSceneIndex = 0;
  } else if (newSceneIndex >= state.scenes.length) {
    newSceneIndex = state.scenes.length - 1;
  }

  const scene = state.scenes[newSceneIndex];
  await scene.fire();

  let logMsg = direction === -1 ? '⬆️ - previous scene' : '⬇️ - next scene';
  console.log(logMsg);
}

async function findMatchingOutputTracks({ state, trackKey }) {
  const matchingOutputTracks = [];

  for (const track of state.tracks) {
    const [trackName, trackType] = track.raw.name.split('-');

    if (
      trackName !== trackKey ||
      trackType === TRACK_TYPES.MONITOR ||
      trackType === TRACK_TYPES.GROUP
    ) {
      continue;
    }

    const clipSlots = await track.get('clip_slots');
    const currentClipSlotHasClip =
      clipSlots[state.selectedSceneIndex].raw.has_clip;

    if (!currentClipSlotHasClip) {
      matchingOutputTracks.push(track);
    }
  }

  return matchingOutputTracks;
}
