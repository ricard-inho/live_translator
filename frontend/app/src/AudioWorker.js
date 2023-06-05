
const audioQueue = [];

const handleDataAvailable = (event) => {
  if (event.data.size > 0) {
    audioQueue.push(event.data);
  }
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
    mediaRecorder.start();

    // Listen for stop signal from main thread
    globalThis.self.addEventListener('message', (event) => {
    if (event.data === 'stop') {
        // Stop recording and close the stream
        mediaRecorder.removeEventListener('dataavailable', handleDataAvailable);
        mediaRecorder.stop();
        stream.getTracks().forEach((track) => track.stop());

        // Send the audio queue to the main thread
        globalThis.self.postMessage(audioQueue);
    }
    });
    

  } catch (error) {
    console.error('Error accessing microphone:', error);
  }

};

startRecording();

// Send the audio queue to the main thread periodically
setInterval(() => {
    globalThis.self.postMessage(audioQueue);
  audioQueue.length = 0; // Clear the queue after sending the data
}, 1000); // Adjust the interval as needed
