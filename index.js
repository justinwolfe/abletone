import { Ableton } from 'ableton-js';

const ableton = new Ableton({ logger: console });

import initMidi from './midi.js';
import initKeys from './keys.js';

initMidi();

const getIndexByRawId = (id, collection) =>
  collection.findIndex((item) => item.raw.id === id);

// 1. Create an object to hold the state of your variables
const baseState = {
  scenes: [],
  tracks: [],
  selectedSceneIndex: undefined,
  selectedTrackIndex: undefined,
  selectedTrackName: undefined,
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
    logCurrentState();
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
};

const init = async () => {
  await ableton.start();

  await registerAbletonListeners();

  initKeys(async (key) => {
    switch (key.toLowerCase()) {
      case 'a':
        console.log('hello');
        break;
      case 'b':
        console.log('foo');
        break;
      case 'c': {
        console.log('bar');
        const scenes = await ableton.song.get('scenes');
        const scene = await ableton.song.view.get('selected_scene');
        const sceneIndex = scenes.findIndex((s) => s.raw.id === scene.raw.id);
        console.log('sceneIndex', sceneIndex);
        break;
      }
    }
  });
};

init();
