let mixprint = {};

const saveMix = async (ableton) => {
  const tracks = await ableton.song.get('tracks');
  for (var track of tracks) {
    const trackId = track.raw.id;
    const mixerDevice = await track.get('mixer_device');
    const volume = await mixerDevice.get('volume');
    const panning = await mixerDevice.get('panning');
    const sends = await mixerDevice.get('sends');
    const activator = await mixerDevice.get('track_activator');
    mixprint[trackId] = {
      trackId: trackId,
      trackName: track.raw.name,
      activator: activator.raw.value,
      volume: volume.raw.value,
      panning: panning.raw.value,
      sends: sends.map((send) => send.raw),
    };
  }
  console.log('saved mix');
};

const restoreMix = async (ableton) => {
  const tracks = await ableton.song.get('tracks');
  for (let key in mixprint) {
    const track = tracks.find((track) => track.raw.id === key);
    if (!track) {
      return;
    }
    const mixerDevice = await track.get('mixer_device');
    const activator = await mixerDevice.get('track_activator');
    await activator.set('value', mixprint[key].activator);
    const volume = await mixerDevice.get('volume');
    await volume.set('value', mixprint[key].volume);
    const panning = await mixerDevice.get('panning');
    await panning.set('value', mixprint[key].panning);
    const sends = await mixerDevice.get('sends');
    for (var send of sends) {
      const sendToPrint = mixprint[key].sends.find(
        (capturedSend) => capturedSend.id === send.raw.id
      );
      if (sendToPrint) {
        await send.set('value', sendToPrint.value);
      }
    }
  }
  console.log('restored mix');
};

export { saveMix, restoreMix };
