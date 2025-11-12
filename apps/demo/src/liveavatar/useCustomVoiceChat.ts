import { useCallback, useRef, useState } from "react";
import { useLiveAvatarContext } from "./context";

export const useCustomVoiceChat = () => {
  const { sessionRef } = useLiveAvatarContext();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioBuffersRef = useRef<Float32Array[]>([]);
  const recordingStartTimeRef = useRef<number>(0);

  // Handle transcript: OpenAI Chat → ElevenLabs TTS → LiveAvatar
  const handleTranscript = async (text: string) => {
    setIsProcessing(true);
    try {
      // 1. Send to OpenAI Chat
      const chatRes = await fetch("/api/openai-chat-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!chatRes.ok) {
        const error = await chatRes.json();
        console.error("OpenAI Chat error:", error);
        return;
      }

      const { response: chatResponseText } = await chatRes.json();
      console.log("OpenAI response:", chatResponseText);

      // 2. Send to ElevenLabs TTS
      const ttsRes = await fetch("/api/elevenlabs-text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chatResponseText }),
      });

      if (!ttsRes.ok) {
        const error = await ttsRes.json();
        console.error("ElevenLabs TTS error:", error);
        return;
      }

      const { audio } = await ttsRes.json();

      if (!audio) {
        console.error("No audio received from ElevenLabs");
        return;
      }

      // 3. Send to LiveAvatar for lip-sync
      await sessionRef.current.repeatAudio(audio);

    } catch (error) {
      console.error("Error processing transcript:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert Float32Array PCM to WAV file
  const pcmToWav = (pcmData: Float32Array, sampleRate: number): Blob => {
    const numChannels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = pcmData.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); // byte rate
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Convert float PCM to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < pcmData.length; i++) {
      const sample = Math.max(-1, Math.min(1, pcmData[i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, int16, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  // Start recording using Web Audio API
  const startRecording = useCallback(async () => {
    console.log("🎤 startRecording called (Web Audio API)");
    try {
      // List all audio input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(d => d.kind === "audioinput");
      console.log("🎙️ Available audio devices:", audioDevices.map(d => ({
        label: d.label,
        deviceId: d.deviceId
      })));

      // Try to find a non-Intel Smart Sound Technology device first
      let selectedDeviceId: string | undefined = undefined;
      const preferredDevice = audioDevices.find(d =>
        d.label && !d.label.toLowerCase().includes("intel") && !d.label.toLowerCase().includes("smart sound")
      );

      if (preferredDevice) {
        console.log("✨ Found non-Intel device:", preferredDevice.label);
        selectedDeviceId = preferredDevice.deviceId;
      } else if (audioDevices.length > 1) {
        console.log("🔄 Trying alternative device:", audioDevices[1].label);
        selectedDeviceId = audioDevices[1].deviceId;
      }

      const constraints: MediaStreamConstraints = selectedDeviceId
        ? { audio: { deviceId: { exact: selectedDeviceId } } }
        : { audio: true };

      console.log("🎙️ Using constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("✅ Microphone access granted");

      streamRef.current = stream;
      audioBuffersRef.current = [];

      // Create AudioContext
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      console.log("✅ AudioContext created, sample rate:", audioContext.sampleRate);

      // Load AudioWorklet processor
      await audioContext.audioWorklet.addModule('/audio-processor.js');
      console.log("✅ AudioWorklet module loaded");

      // Create AudioWorklet node
      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'audio-recorder-processor');
      audioWorkletNodeRef.current = workletNode;

      // Handle audio data from worklet
      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'audioData') {
          const audioData = new Float32Array(event.data.data);
          console.log(`📦 Received audio chunk: ${audioData.length} samples`);
          audioBuffersRef.current.push(audioData);
        }
      };

      // Connect audio graph
      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      // Start recording
      workletNode.port.postMessage({ command: 'start' });
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
      console.log("✅ Web Audio API recording started");

    } catch (error) {
      console.error("❌ Error starting recording:", error);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(async () => {
    console.log("🛑 stopRecording called");

    try {
      if (!audioWorkletNodeRef.current || !audioContextRef.current) {
        console.log("⚠️ No active recording to stop");
        return;
      }

      // Calculate recording duration
      const recordingDuration = Date.now() - recordingStartTimeRef.current;
      console.log(`⏱️ Recording duration: ${recordingDuration}ms`);

      // Minimum recording time: 500ms
      const minRecordingTime = 500;
      if (recordingDuration < minRecordingTime) {
        const waitTime = minRecordingTime - recordingDuration;
        console.log(`⏳ Waiting ${waitTime}ms to reach minimum recording time...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Stop recording
      audioWorkletNodeRef.current.port.postMessage({ command: 'stop' });
      console.log("⏹️ Recording stopped");

      // Wait a bit for final chunks
      await new Promise(resolve => setTimeout(resolve, 200));

      // Disconnect and cleanup
      audioWorkletNodeRef.current.disconnect();
      audioContextRef.current.close();

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      setIsRecording(false);

      // Combine all audio buffers
      const totalLength = audioBuffersRef.current.reduce((acc, buf) => acc + buf.length, 0);
      console.log(`🔊 Total audio samples: ${totalLength}, chunks: ${audioBuffersRef.current.length}`);

      if (totalLength === 0 || audioBuffersRef.current.length === 0) {
        console.warn("⚠️ No audio data recorded");
        setIsProcessing(false);
        return;
      }

      const combinedBuffer = new Float32Array(totalLength);
      let offset = 0;
      for (const buffer of audioBuffersRef.current) {
        combinedBuffer.set(buffer, offset);
        offset += buffer.length;
      }

      // Convert to WAV
      const sampleRate = 16000;
      const wavBlob = pcmToWav(combinedBuffer, sampleRate);
      console.log(`🎵 WAV file created: ${wavBlob.size} bytes`);

      // Send to backend for STT
      try {
        setIsProcessing(true);
        console.log("Sending audio to Whisper API...");

        const formData = new FormData();
        formData.append("audio", wavBlob, "recording.wav");

        const sttRes = await fetch("/api/openai-whisper-stt", {
          method: "POST",
          body: formData,
        });

        if (!sttRes.ok) {
          const error = await sttRes.json();
          console.error("Whisper STT error:", error);
          setIsProcessing(false);
          return;
        }

        const { transcript: userTranscript } = await sttRes.json();
        console.log("User said:", userTranscript);
        setTranscript(userTranscript);

        // Process with OpenAI Chat + ElevenLabs + LiveAvatar
        await handleTranscript(userTranscript);
      } catch (error) {
        console.error("Error processing audio:", error);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("❌ Error stopping recording:", error);
      setIsProcessing(false);
    }
  }, [pcmToWav, handleTranscript]);

  return {
    isRecording,
    isProcessing,
    transcript,
    startRecording,
    stopRecording,
  };
};
