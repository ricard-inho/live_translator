import logo from "./logo.svg";
import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';

function App() {
  // add random cliend id by date time
  const [clientId, setClientId] = useState(
    Math.floor(new Date().getTime() / 1000)
  );


  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);

  
  const recorder = useRef(null);
  const stream = useRef(null);

  const [websckt, setWebsckt] = useState();

  const [isConnected, setConnected] = useState(false);
  const [isRecording, setRecording] = useState(false);

  useEffect(() => {

    const url = 'wss://0.0.0.0:8000/ws/' + clientId;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setConnected(true);
      ws.send('Connect');


      stream.current =navigator.mediaDevices.getUserMedia({video: false, audio: true}).then( stream => {
        recorder.current = RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/webm',
          sampleRate: 44100,
          desiredSampRate: 16000,
          recorderType: StereoAudioRecorder,
          numberOfAudioChannels: 1,
          timeSlice: 500,
          bufferSize: 1024,
          ondataavailable: function(blob) {
            ws.send(blob);
          }
        });
      })

    };

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      setMessages((prevMessages) => [...prevMessages, message]);

    };
    

    setWebsckt(ws);

    return () => {
        ws.close();
    };
  }, []);

  const startRecording = () => {
    recorder.current.startRecording();
    setRecording(true)
  };

  const stopRecording = () => {
    recorder.current.stopRecording();
    recorder.current.reset();
    setRecording(false)
  }

  //Text Area
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [messages]);

  const clearTextarea = () => {
    setMessages([]);
  };

  
  return (
    <div className="container">
      <h1>Live Recording</h1>
      <h2>Your client id: {clientId} </h2>
      <div className="connectionContainer">
        <div className="rightMargin">Connection</div>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}></div>
        <div className="rightMargin">Recording</div>
        <div className={`connection-status ${isRecording ? 'connected' : 'disconnected'}`}></div>
      </div>

      <div className="loadModel">
        <h2>Model Settings</h2>
        <select>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>
      </div>

      <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
      <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
      <button onClick={clearTextarea}>Clear Textarea</button>

      <div className="chat-container">
        <textarea ref={textareaRef} className="chat-textarea" value={messages.map((value) => value.message).join(' ')} readOnly />
      </div>
      
    </div>
  );
}

export default App;