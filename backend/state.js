const baseState = {
  scenes: [],
  tracks: [],
  selectedSceneIndex: undefined,
  selectedTrackIndex: undefined,
  selectedSceneId: undefined,
  selectedTrackName: undefined,
  selectedTrackId: undefined,
  isRecording: false,
  isPlaying: false,
};

const stateChangeSubscribers = [];

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
    stateChangeSubscribers.forEach((callback) => callback({ ...target }));

    // logCurrentState();
    return true;
  },
});

const subscribeToStateChanges = (callback) => {
  stateChangeSubscribers.push(callback);
};

const unsubscribeFromStateChanges = (callback) => {
  const index = stateChangeSubscribers.indexOf(callback);
  if (index > -1) {
    stateChangeSubscribers.splice(index, 1);
  }
};

const getState = () => state;

export {
  getState,
  state,
  logCurrentState,
  subscribeToStateChanges,
  unsubscribeFromStateChanges,
};
