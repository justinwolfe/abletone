//https://www.npmjs.com/package/node-global-key-listener
import { GlobalKeyboardListener } from 'node-global-key-listener';

const init = () => {
  const keys = new GlobalKeyboardListener();

  //Log every key that's pressed.
  keys.addListener(function (e, down) {
    if (e.state !== 'DOWN') return;
    console.log(`[key input]: ${e.name} DOWN`);
  });
};

init();

export default init;
