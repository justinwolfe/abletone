export const getRecordingStatus = (number: number) => {
  if (number === 2) {
    return 'Counting in';
  }

  if (number === 1) {
    return 'Recording';
  }

  return '';
};
