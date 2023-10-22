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

const state = new Proxy(baseState, {
  set(target, property, value) {
    target[property] = value;
    // logCurrentState();
    return true;
  },
});

export { state, logCurrentState };
