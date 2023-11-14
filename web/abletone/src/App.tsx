import { useState, useEffect } from 'react';
import './App.css';
import useWebSocket from 'react-use-websocket';

function App() {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    'ws://localhost:3000/ws'
  );
  const [apiState, setApiState] = useState({});

  useEffect(() => {
    if (!lastMessage?.data) {
      return;
    }

    const newData = JSON.parse(lastMessage.data);
    setApiState(newData);
  }, [lastMessage]);

  return (
    <>
      <div>{JSON.stringify(apiState)}</div>
    </>
  );
}

export default App;
