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

  const [isConnected, setConnected] = useState(false);
  const [isRecording, setRecording] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  //const [audioChunks, setAudioChunks] = useState([]);



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
          sampleRate: 44100, //22050
          desiredSampRate: 44100,
          recorderType: StereoAudioRecorder,
          numberOfAudioChannels: 1,
          timeSlice: 100,
          bufferSize: 8192, //2048
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
    

    return () => {
        ws.close();
    };
  }, []);

  const startRecording = async () => {
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

  //Settings
  const [language, setLanguage] = useState("Auto");
  const [task, setTask] = useState("transcribe");
  const setSettings = () => {
    fetch('https://0.0.0.0:8000/setSettings?language=' + language + '&task=' + task)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setModelLoaded(true);
      })
      .catch((err) => {
        console.log(err.message);
        setModelLoaded(false);
    });
  }
  
  
  return (
    <div className="container">
      <h1>LR</h1>
      <div className="connectionContainer">
        <div className="rightMargin">Connection</div>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}></div>
        <div className="rightMargin">Recording</div>
        <div className={`connection-status ${isRecording ? 'connected' : 'disconnected'}`}></div>
      </div>

      <div className="loadModel">
        <h2>Model Settings</h2>

        <div className="settingsContainer">
          <header>Language</header>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="cat">Catalan</option>
            <option value="en">English</option>
            <option value="jp">Japanese</option>
            <option value="sp">Spanish</option>
          </select>

          <header>Task</header>
          <select value={task} onChange={(e) => setTask(e.target.value)}>
            <option value="transcribe">Transcribe</option>
            <option value="translate">Translate</option>
          </select>
        </div>

        <button onClick={setSettings}>Set Settings</button>

      </div>

      <button onClick={startRecording} disabled={!modelLoaded || isRecording}>Start Recording</button>
      <button onClick={stopRecording} disabled={!modelLoaded || !isRecording}>Stop Recording</button>
      <button onClick={clearTextarea}>Clear Textarea</button>

      <div className="chat-container">
        <textarea ref={textareaRef} className="chat-textarea" value={messages.map((value) => value.message).join(' ')} readOnly />
      </div>
      
    </div>
  );
}

export default App;

//########################################
// import React, { useEffect, useState } from 'react';

// const SpeechToText = () => {
//   const [isListening, setIsListening] = useState(false);
//   const [recognizedText, setRecognizedText] = useState('');

//   useEffect(() => {
//     let recognition = null;

//     const handleSpeechRecognition = (event) => {
//       console.log("called2")
//       const transcript = event.results[0][0].transcript;
//       setRecognizedText(transcript);
//     };

//     const startSpeechRecognition = (stream) => {
//       // Create a SpeechRecognition instance
//       recognition = new window.webkitSpeechRecognition();
//       recognition.continuous = true;
//       recognition.interimResults = true;
//       recognition.lang = 'en-US';

//       // Start speech recognition
//       recognition.start();

//       // Event handler when speech is recognized
//       recognition.onresult = handleSpeechRecognition;
//     };

//     const initializeSpeechRecognition = async () => {
//       try {
//         // Request user permission for microphone access
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         startSpeechRecognition(stream);
//       } catch (error) {
//         console.error('Error accessing microphone:', error);
//       }
//     };

//     if (isListening) {
//       initializeSpeechRecognition();
//     } else {
//       if (recognition) {
//         recognition.stop();
//         recognition = null;
//       }
//     }

//     // Cleanup function
//     return () => {
//       if (recognition) {
//         recognition.stop();
//         recognition = null;
//       }
//     };
//   }, [isListening]);

//   const toggleListening = () => {
//     setIsListening(!isListening);
//   };

//   return (
//     <div>
//       <button onClick={toggleListening}>{isListening ? 'Stop Listening' : 'Start Listening'}</button>
//       <p>Recognized Text: {recognizedText}</p>
//     </div>
//   );
// };

// export default SpeechToText;
