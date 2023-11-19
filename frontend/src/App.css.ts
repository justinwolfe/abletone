import Paper from '@mui/material/Paper';
import styled from 'styled-components';

export const CenterCardUI = styled(Paper)`
  width: 600px;
  height: 60px;
  padding: 30px;
`;

export const TrackCardUI = styled(Paper)`
  font-size: 50px;
  text-align: center;
  padding-left: 120px;
  padding-right: 120px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-top: 10px;
  margin-bottom: 30px;
  border-radius: 5px;
`;

export const BackdropUI = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #f7f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: background-color 0.4s ease;

  &.count-in {
    background-color: #c7c7ff;
  }

  &.recording {
    background-color: #8f8fff;
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

export const TrackRowUI = styled.div`
  margin-top: 30px;
  display: flex;
  gap: 20px;
  width: 80%;
  flex-wrap: wrap;
`;

export const TrackSlotUI = styled(Paper)`
  height: 100px;
  width: 100px;
  flex-shrink: 0;
`;
