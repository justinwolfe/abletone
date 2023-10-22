const TRACK_TYPES = {
  MONITOR: 'm',
  GROUP: 'g',
  TEMPLATE: 't',
  RENDER: 't',
};

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

export { handleSceneChange, findMatchingOutputTracks, TRACK_TYPES };