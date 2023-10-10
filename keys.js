//https://www.npmjs.com/package/node-global-key-listener
import { GlobalKeyboardListener } from 'node-global-key-listener';

const init = (callback) => {
  if (!callback) {
    return console.error('No callback provided to initKeys');
  }
  const keys = new GlobalKeyboardListener();

  //Log every key that's pressed.
  keys.addListener(function (e, down) {
    if (e.state !== 'DOWN') return;
    callback(e.name);
  });
};

export default init;
