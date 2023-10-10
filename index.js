import { Ableton } from 'ableton-js';

const ableton = new Ableton({ logger: console });

import initMidi from './midi.js';
import initKeys from './keys.js';

initMidi();

const getIndexByRawId = (id, collection) =>
  collection.findIndex((item) => item.raw.id === id);

// 1. Create an object to hold the state of your variables
const state = {
  scenes: [],
  tracks: [],
  selectedSceneIndex: undefined,
  selectedTrackIndex: undefined,
  selectedTrackName: undefined,
};

const logCurrentState = () => {
  console.log({
    scenesLength: state.scenes.length,
    tracksLength: state.tracks.length,
    selectedSceneIndex: state.selectedSceneIndex,
    selectedTrackIndex: state.selectedTrackIndex,
    selectedTrackName: state.selectedTrackName,
  });
};

// 3. Use a Proxy to watch for changes in the `state` object
const stateProxy = new Proxy(state, {
  set(target, property, value) {
    target[property] = value;
    logCurrentState();
    return true;
  },
});

const updateScenes = async () => {
  stateProxy.scenes = await ableton.song.get('scenes');
};

const updateTracks = async () => {
  stateProxy.tracks = await ableton.song.get('tracks');
};

const registerAbletonListeners = async () => {
  await updateScenes();
  await updateTracks();

  const initialSelectedScene = await ableton.song.view.get('selected_scene');
  stateProxy.selectedSceneIndex = getIndexByRawId(
    initialSelectedScene.raw.id,
    stateProxy.scenes
  );

  const initialSelectedTrack = await ableton.song.view.get('selected_track');
  stateProxy.selectedTrackIndex = getIndexByRawId(
    initialSelectedTrack.raw.id,
    stateProxy.tracks
  );
  stateProxy.selectedTrackName = initialSelectedTrack.raw.name;

  ableton.song.addListener('tracks', async (t) => {
    stateProxy.tracks = t;
  });

  ableton.song.addListener('scenes', async (s) => {
    stateProxy.scenes = s;
  });

  ableton.song.view.addListener('selected_track', async (tr) => {
    stateProxy.selectedTrackIndex = getIndexByRawId(
      tr.raw.id,
      stateProxy.tracks
    );
    stateProxy.selectedTrackName = tr.raw.name;
  });

  ableton.song.view.addListener('selected_scene', async (sc) => {
    stateProxy.selectedSceneIndex = getIndexByRawId(
      sc.raw.id,
      stateProxy.scenes
    );
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
