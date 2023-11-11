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
    for (const track of tracks) {
      const trackId = track.raw.id;
      const mixerDevice = await track.get('mixer_device');
      const volume = await mixerDevice.get('volume');
      const panning = await mixerDevice.get('panning');
      const sends = await mixerDevice.get('sends');
      const activator = await mixerDevice.get('track_activator');
      this.mixprint[trackId] = {
        trackId: trackId,
        trackName: track.raw.name,
        activator: activator.raw.value,
        volume: volume.raw.value,
        panning: panning.raw.value,
        sends: sends.map((send) => send.raw),
      };
    }
    console.log('saved mix');
    await this.saveMixToFile();
  }

  async restoreMix(ableton) {
    const tracks = await ableton.song.get('tracks');
    for (const key in this.mixprint) {
      const track = tracks.find((track) => track.raw.id === key);
      if (!track) {
        return;
      }
      const mixerDevice = await track.get('mixer_device');
      const activator = await mixerDevice.get('track_activator');
      await activator.set('value', this.mixprint[key].activator);
      const volume = await mixerDevice.get('volume');
      await volume.set('value', this.mixprint[key].volume);
      const panning = await mixerDevice.get('panning');
      await panning.set('value', this.mixprint[key].panning);
      const sends = await mixerDevice.get('sends');
      for (const send of sends) {
        const sendToPrint = this.mixprint[key].sends.find(
          (capturedSend) => capturedSend.id === send.raw.id
        );
        if (sendToPrint) {
          await send.set('value', sendToPrint.value);
        }
      }
    }
    console.log('restored mix');
  }
}

export default AbletonMixManager;
