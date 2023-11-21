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
  state.selectedSceneId = initialSelectedScene.raw.id;

  const initialSelectedTrack = await ableton.song.view.get('selected_track');
  state.selectedTrackIndex = getIndexByRawId(
    initialSelectedTrack.raw.id,
    state.tracks
  );
  state.selectedTrackName = initialSelectedTrack.raw.name;
  state.selectedTrackId = initialSelectedTrack.raw.id;

  ableton.song.addListener('tracks', async (t) => {
    state.tracks = t;
  });

  ableton.song.addListener('scenes', async (s) => {
    state.scenes = s;
  });

  ableton.song.addListener('is_playing', async (isPlaying) => {
    state.isPlaying = isPlaying;
  });

  ableton.song.addListener('session_record_status', async (isRecording) => {
    state.isRecording = isRecording;
  });

  // save until there's a real use
  // ableton.song.addListener('current_song_time', async (time) => {
  //   state.songTime = time;
  // });

  ableton.song.view.addListener('selected_track', async (tr) => {
    state.selectedTrackIndex = getIndexByRawId(tr.raw.id, state.tracks);
    state.selectedTrackName = tr.raw.name;
    state.selectedSceneId = initialSelectedScene.raw.id;
    console.log('> selected track: ', state.selectedTrackName);
  });

  ableton.song.view.addListener('selected_scene', async (sc) => {
    state.selectedSceneIndex = getIndexByRawId(sc.raw.id, state.scenes);
    state.selectedTrackId = initialSelectedTrack.raw.id;
    console.log('# selected scene: ', state.selectedSceneIndex);
  });

  logCurrentState();
};

export { ableton, registerAbletonListeners };
