// AudioWorklet processor for capturing PCM audio data
class AudioRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isRecording = false;

    this.port.onmessage = (event) => {
      if (event.data.command === 'start') {
        this.isRecording = true;
        console.log('AudioWorklet: Recording started');
      } else if (event.data.command === 'stop') {
        this.isRecording = false;
        console.log('AudioWorklet: Recording stopped');
      }
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];

    if (this.isRecording && input && input.length > 0) {
      const channelData = input[0]; // Get first channel

      if (channelData && channelData.length > 0) {
        // Send audio data to main thread
        this.port.postMessage({
          type: 'audioData',
          data: channelData.slice() // Clone the array
        });
      }
    }

    return true; // Keep processor alive
  }
}

registerProcessor('audio-recorder-processor', AudioRecorderProcessor);
