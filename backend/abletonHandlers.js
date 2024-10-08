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
  } else {
    console.log('no clip to delete');

    // Select the previous track
    let previousTrackIndex = state.selectedTrackIndex - 1;
    if (previousTrackIndex < 0) {
      previousTrackIndex = 0; // Ensure we don't go out of bounds
    }

    const previousTrack = state.tracks[previousTrackIndex];
    if (previousTrack) {
      await ableton.song.view.set('selected_track', previousTrack.raw.id);
      console.log(`Selected previous track: ${previousTrack.raw.name}`);
    } else {
      console.log('No previous track found');
    }
  }
};

export const deleteAllClips = async ({ ableton }) => {
  const tracks = await ableton.song.get('tracks');

  for (const track of tracks) {
    if (!track.raw.name.includes('r-')) {
      continue;
    }
    const clipSlots = await track.get('clip_slots');
    for (const clipSlot of clipSlots) {
      if (clipSlot.raw.has_clip) {
        await clipSlot.deleteClip();
        console.log(
          `Deleted clip in track ${track.raw.name}, slot ${clipSlot.raw.index}`
        );
      }
    }
  }

  console.log('All clips deleted');
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

  if (!outputSend) {
    return console.log('no send found');
  }

  const currentValue = outputSend?.raw?.value;

  await outputSend.set('value', currentValue > 0 ? 0 : 1);
};

export const toggleClip = async ({ state, ableton, clipSlotId }) => {
  const tracks = state.tracks;

  let matchingClipSlot = null;
  let matchingTrack = null;

  for (let track of tracks) {
    const clipSlots = await track.get('clip_slots');
    const clipSlot = clipSlots.find(
      (clipSlot) => clipSlot.raw.id === clipSlotId
    );

    if (clipSlot) {
      matchingClipSlot = clipSlot;
      matchingTrack = track;
      break;
    }
  }

  if (matchingClipSlot && matchingTrack) {
    const { has_clip, is_playing, is_recording, is_triggered } =
      matchingClipSlot.raw;

    if (has_clip && is_playing && !is_recording) {
      await matchingClipSlot.stop();
      return;
    }

    if (has_clip && is_playing && is_recording) {
      await matchingClipSlot.fire();
      return;
    }

    await matchingTrack.set('arm', true);

    await matchingClipSlot.fire();
    console.log('fired clip slot');
  }
};

export const triggerRecord = async ({ state, ableton }) => {
  const [trackKey, trackType] = state.selectedTrackName.split('-');
  const highlightedClipSlot = await ableton.song.view.get(
    'highlighted_clip_slot'
  );

  if (highlightedClipSlot?.raw?.is_recording) {
    await highlightedClipSlot.fire();
    return;
  }

  // if (!highlightedClipSlot.raw.has_clip && trackType === TRACK_TYPES.RENDER) {
  //   await highlightedClipSlot.fire();
  //   return;
  // }

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
