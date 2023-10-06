//https://www.npmjs.com/package/node-global-key-listener
import { GlobalKeyboardListener } from 'node-global-key-listener';

const init = () => {
  const keys = new GlobalKeyboardListener();

  //Log every key that's pressed.
  keys.addListener(function (e, down) {
    console.log(
      `${e.name} ${e.state == 'DOWN' ? 'DOWN' : 'UP  '} [${e.rawKey._nameRaw}]`
    );
  });
};

export default init;
