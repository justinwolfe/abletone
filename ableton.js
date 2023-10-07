//https://www.npmjs.com/package/ableton-js
import { Ableton } from 'ableton-js';

// Log all messages to the console
const ableton = new Ableton({ logger: console });

const init = async () => {
  // Establishes a connection with Live
  await ableton.start();

  console.log(
    await ableton.song.view.addListener('selected_track', (e) => {
      console.log(e.raw.name);
    })
  );

  ableton.song.addListener('scenes', (d) => console.log('Data:', d));

  // ableton.on('message', (m) => console.log('Message:', m));
  // const scenes = await ableton.song.get('scenes');
  // const tracks = await ableton.song.get('tracks');
  // console.log(await tracks[0].get('name'));
  // // console.log(await tracks[0].get('name'));

  // // ableton.song.startPlaying();

  // // // Observe the current playback state and tempo
  // // ableton.song.addListener('is_playing', (p) => console.log('Playing:', p));
  // // ableton.song.addListener('tempo', (t) => console.log('Tempo:', t));
  // ableton.song.addListener('metronome', (m) => console.log('Metronome:', m));
  // ableton.song.addListener('tracks', (t) => console.log('Tracks:', t));

  // console.log(await ableton.song.get('tracks'));

  // // Get the current tempo
  // const tempo = await ableton.song.get('tempo');
  // console.log('Current tempo:', tempo);

  // // Set the tempo
  // await ableton.song.set('tempo', 85);
};

init();

export default init;
