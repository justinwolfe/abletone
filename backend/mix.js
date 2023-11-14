import fs from 'fs/promises';
import path from 'path';

class AbletonMixManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.mixprint = {};

    // Load mixprint state from file if it exists
    this.loadMixFromFile();
  }

  async loadMixFromFile() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      this.mixprint = JSON.parse(data);
      console.log('Mixprint state loaded from file.');
    } catch (error) {
      console.log('No existing mixprint file found, starting fresh.');
    }
  }

  async saveMixToFile() {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(this.mixprint));
      console.log('Mixprint state saved to file.');
    } catch (error) {
      console.error('Error saving mixprint state to file:', error);
    }
  }

  async saveMix(ableton) {
    const tracks = await ableton.song.get('tracks');
    const mixPromises = tracks.map(async (track) => {
      const trackId = track.raw.id;
      const mixerDevice = await track.get('mixer_device');
      const [volume, panning, sends, activator] = await Promise.all([
        mixerDevice.get('volume'),
        mixerDevice.get('panning'),
        mixerDevice.get('sends'),
        mixerDevice.get('track_activator'),
      ]);
      this.mixprint[trackId] = {
        trackId: trackId,
        trackName: track.raw.name,
        activator: activator.raw.value,
        volume: volume.raw.value,
        panning: panning.raw.value,
        sends: sends.map((send) => send.raw),
      };
    });

    await Promise.all(mixPromises);
    console.log('saved mix');
    await this.saveMixToFile();
  }

  async restoreMix(ableton) {
    const tracks = await ableton.song.get('tracks');
    const restorePromises = Object.keys(this.mixprint).map(async (key) => {
      const track = tracks.find((track) => track.raw.id === key);
      if (!track) return;

      const mixerDevice = await track.get('mixer_device');
      const [activator, volume, panning, sends] = await Promise.all([
        mixerDevice.get('track_activator'),
        mixerDevice.get('volume'),
        mixerDevice.get('panning'),
        mixerDevice.get('sends'),
      ]);

      await Promise.all([
        activator.set('value', this.mixprint[key].activator),
        volume.set('value', this.mixprint[key].volume),
        panning.set('value', this.mixprint[key].panning),
        ...sends.map((send) => {
          const sendToPrint = this.mixprint[key].sends.find(
            (capturedSend) => capturedSend.id === send.raw.id
          );
          return sendToPrint
            ? send.set('value', sendToPrint.value)
            : Promise.resolve();
        }),
      ]);
    });

    await Promise.all(restorePromises);
    console.log('restored mix');
  }
}
export default AbletonMixManager;
