import { useRef, useState, useCallback, useEffect } from 'react';
import { Scribe, AudioFormat, RealtimeEvents, CommitStrategy } from "@elevenlabs/client";

interface ScribeConfig {
  languageCode?: string;
  onPartialTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string, timestamps?: any) => void;
  onError?: (error: any) => void;
}

export function useElevenLabsRealtimeSTT(config: ScribeConfig = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [partialText, setPartialText] = useState('');
  const [finalText, setFinalText] = useState('');
  const connectionRef = useRef<any>(null);

  // Store callbacks in refs to avoid dependency issues
  const callbacksRef = useRef(config);

  // Update callbacks ref when config changes
  useEffect(() => {
    callbacksRef.current = config;
  }, [config]);

  const connect = useCallback(async () => {
    try {
      console.log('🔌 Starting connection to ElevenLabs Scribe...');

      // 1. Get single-use token from backend
      const tokenRes = await fetch('/api/elevenlabs-stt-token', {
        method: 'POST'
      });
      const { token } = await tokenRes.json();
      console.log('✅ Token received');

      // 2. Connect with Scribe SDK
      console.log('🎤 Requesting microphone access...');

      const connection = Scribe.connect({
        token,
        modelId: "scribe_v2_realtime",
        languageCode: callbacksRef.current.languageCode || "th",
        audioFormat: AudioFormat.PCM_16000,
        commitStrategy: CommitStrategy.VAD,
        vadSilenceThresholdSecs: 1.5,
        vadThreshold: 0.4,
        minSpeechDurationMs: 100,
        minSilenceDurationMs: 100,
        // ✅ CRITICAL FIX: Enable automatic microphone capture
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      } as any);

      console.log('📦 Connection object created');
      connectionRef.current = connection;

      // 3. Handle events
      connection.on(RealtimeEvents.SESSION_STARTED, () => {
        console.log('✅ SESSION_STARTED - ElevenLabs Scribe session started');
        console.log('🎙️ You can now speak into your microphone...');
        setIsConnected(true);
      });

      connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data: any) => {
        console.log('🎤 PARTIAL_TRANSCRIPT:', data.text);
        setPartialText(data.text);
        callbacksRef.current.onPartialTranscript?.(data.text);
      });

      connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data: any) => {
        console.log('✅ COMMITTED_TRANSCRIPT:', data.text);
        setFinalText(prev => prev + ' ' + data.text);
        callbacksRef.current.onFinalTranscript?.(data.text);
        setPartialText('');
      });

      connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT_WITH_TIMESTAMPS, (data: any) => {
        console.log('📝 COMMITTED_TRANSCRIPT_WITH_TIMESTAMPS:', data);
        callbacksRef.current.onFinalTranscript?.(data.text, data.timestamps);
      });

      connection.on(RealtimeEvents.ERROR, (error: any) => {
        console.error('❌ ERROR:', error);
        callbacksRef.current.onError?.(error);
      });

      connection.on(RealtimeEvents.AUTH_ERROR, (error: any) => {
        console.error('🚫 AUTH_ERROR:', error);
        callbacksRef.current.onError?.(error);
      });

      connection.on(RealtimeEvents.CLOSE, () => {
        console.log('🔌 CONNECTION CLOSED');
        setIsConnected(false);
      });

    } catch (error) {
      console.error('❌ Failed to connect:', error);
      callbacksRef.current.onError?.(error);
    }
  }, []); // Empty dependency array - callbacks handled via ref

  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    setIsConnected(false);
    setPartialText('');
  }, []);

  const reset = useCallback(() => {
    setFinalText('');
    setPartialText('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    partialText,
    finalText,
    connect,
    disconnect,
    reset
  };
}
