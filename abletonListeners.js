import { state, logCurrentState } from './state.js';
import { Ableton } from 'ableton-js';

const ableton = new Ableton({ logger: console });

const getIndexByRawId = (id, collection) =>
  collection.findIndex((item) => item.raw.id === id);

async function updateScenes() {
  state.scenes = await ableton.song.get('scenes');
}

async function updateTracks() {
  state.tracks = await ableton.song.get('tracks');
}

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
    console.log('> selected track: ', state.selectedTrackName);
  });

  ableton.song.view.addListener('selected_scene', async (sc) => {
    state.selectedSceneIndex = getIndexByRawId(sc.raw.id, state.scenes);
    console.log('# selected scene: ', state.selectedSceneIndex);
  });

  logCurrentState();
};

export { ableton, registerAbletonListeners };
