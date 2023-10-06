// https://www.npmjs.com/package/easymidi
import easymidi from 'easymidi';

const init = () => {
  console.log('init midi');
  var inputs = easymidi.getInputs();
  var outputs = easymidi.getOutputs();
  var virtualOutput = new easymidi.Output('Virtual output name', true);

  console.log(easymidi.getOutputs());

  console.log(inputs);
  console.log(outputs);

  //   const input = new easymidi.Input('MIDI Input Name');
  //   input.on('noteon', function (msg) {
  //     // do something with msg
  //   });

  //   const output = new easymidi.Output('MIDI Output Name');
  //   output.send('noteon', {
  //     note: 64,
  //     velocity: 127,
  //     channel: 3,
  //   });
};

export default init;
