// load midi input
// load midi output
// load keyboard input
// load ableton connection

// listen for messages from ableton and display UI
// send messages to ableton from UI/keys

import initMidi from './midi.js';
import initKeys from './keys.js';
import initAbleton from './ableton.js';

initMidi();
initKeys();
initAbleton();
