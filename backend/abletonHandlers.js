/* eslint-disable no-unused-vars */
import { TRACK_TYPES, findMatchingOutputTracks } from './sceneTrackLogic.js';

export const stopClip = async ({ state, ableton }) => {
  const highlightedClipSlot = await ableton.song.view.get(
    'highlighted_clip_slot'
  );

  if (
    highlightedClipSlot?.raw?.has_clip &&
    highlightedClipSlot?.raw?.is_playing
  ) {
    await highlightedClipSlot.stop();
  }
};

export const deleteClip = async ({ state, ableton }) => {
  const highlightedClipSlot = await ableton.song.view.get(
    'highlighted_clip_slot'
  );

  if (highlightedClipSlot?.raw?.has_clip) {
    await highlightedClipSlot.deleteClip();
  }
};

export const duplicateScene = async ({ state, ableton }) => {
  await ableton.song.duplicateScene(state.selectedSceneIndex);
  const selectedScene = await ableton.song.view.get('selected_scene');
  selectedScene.fire();
  console.log('- duplicated scene');
};

export const toggleSend = async ({ state, ableton, trackKey }) => {
  const track = state.tracks.find((track) => track.raw.name === trackKey);

  if (!track) {
    return console.log('no track found');
  }

  const mixerDevice = await track.get('mixer_device');
  const sends = await mixerDevice.get('sends');
  const outputSend = sends.find((send) =>
    send.raw.name.toLowerCase().includes('loops')
  );

  console.log('has send', outputSend);

  const currentValue = outputSend.raw.value;

  console.log('current sendvalue', currentValue);
  console.log('new sendvalue', currentValue > 0 ? 1 : 0);
  await outputSend.set('value', currentValue > 0 ? 0 : 1);
};

export const triggerRecord = async ({ state, ableton }) => {
  const [trackKey, trackType] = state.selectedTrackName.split('-');
  const highlightedClipSlot = await ableton.song.view.get(
    'highlighted_clip_slot'
  );

  if (
    highlightedClipSlot.raw.is_recording ||
    (!highlightedClipSlot.raw.has_clip && trackType === TRACK_TYPES.RENDER)
  ) {
    await highlightedClipSlot.fire();
    return;
  }

  const matchingOutputTracks = await findMatchingOutputTracks({
    state,
    trackKey: 'r',
  });

  if (!matchingOutputTracks.length) {
    console.log('- out of tracks, making a new one');
    await ableton.song.duplicateTrack(state.selectedTrackIndex);
    const newHighlightedClipSlot = await ableton.song.view.get(
      'highlighted_clip_slot'
    );

    if (newHighlightedClipSlot?.raw?.has_clip) {
      await newHighlightedClipSlot.deleteClip();
      const selectedTrack = await ableton.song.view.get('selected_track');
      await selectedTrack.set('arm', true);
    }

    await newHighlightedClipSlot.fire();
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
};
