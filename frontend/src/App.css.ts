import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import {
  PlayArrowOutlined,
  Square,
  RadioButtonChecked,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import Icon from '@mui/material/Icon';

const commonWidth = '60vw';
const gapWidthPercentage = 2; // The percentage of the gap relative to the commonWidth
const numberOfGaps = 3; // Since we want 4 slots, there will be 3 gaps in between
const gapWidth = `calc(${commonWidth} * ${gapWidthPercentage / 100})`; // The width of a single gap
const totalGapWidth = `calc(${gapWidth} * ${numberOfGaps})`; // Total width of all gaps
const trackSlotBaseWidth = `calc((${commonWidth} - ${totalGapWidth}) / 5)`; // The base width for each TrackSlotUI without padding or border

export const TrackSlotUI = styled(Paper)`
  height: 50px;
  width: ${trackSlotBaseWidth};
  box-sizing: border-box; // Include padding and border in the element's width
  padding: 10px; // Example padding
  border: 1px solid #ccc; // Example border
  margin-right: -1px; // Adjust for the border overlap
  display: flex;
  align-items: center;
  justify-content: center;

  &.isSelected {
    border: 4px solid #b5b4b4;
  }
`;

export const TrackRowUI = styled.div`
  margin-top: 30px;
  display: flex;
  gap: ${gapWidth};
  width: ${commonWidth};
  flex-wrap: wrap;
  box-sizing: border-box;
`;

export const CenterCardUI = styled(Paper)`
  width: ${commonWidth};
  height: 100px;
  padding: 30px;
  box-sizing: border-box;
`;

export const TrackCardUI = styled(Paper)`
  width: ${commonWidth};
  font-size: 50px;
  text-align: center;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-top: 10px;
  margin-bottom: 30px;
  border-radius: 5px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

export const TrackNavButtonUI = styled.button`
  padding: 0;
  padding-left: 15px;
  padding-right: 15px;
`;

export const DecrementTrackButton = styled(TrackNavButtonUI)``;

export const BackdropUI = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #f7f7ff;

  transition: background-color 0.4s ease;

  &.count-in {
    background-color: #ffcece;
  }

  &.playing {
    background-color: #a8bcff;
  }

  &.recording {
    background-color: #ff8f8f;
  }
`;

export const ConnectedUI = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  margin: 2px;
  font-size: 12px;
`;

export const MetaUI = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  margin: 20px;
`;

export const WrapperUI = styled.div``;

export const PlayArrowUI = styled(PlayArrowOutlined)``;
export const StopUI = styled(Square)``;
export const RecordUI = styled(RadioButtonChecked)``;
export const TriggeredUI = styled(RadioButtonUnchecked)``;

export const IconUI = styled(Icon)``;
