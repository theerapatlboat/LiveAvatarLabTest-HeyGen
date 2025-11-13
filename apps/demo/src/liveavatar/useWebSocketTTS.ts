import { useRef, useState, useCallback, useEffect } from 'react';

// ==================== TypeScript Interfaces ====================

/**
 * Configuration for WebSocket TTS
 */
export interface TTSConfig {
  /** WebSocket URL (default: ws://localhost:3013/ws/elevenlabs-tts) */
  wsUrl?: string;
  /** ElevenLabs voice ID (default: JBFqnCBsd6RMkjVDRZzb - George) */
  voiceId?: string;
  /** ElevenLabs model ID (default: eleven_multilingual_v2) */
  modelId?: string;
  /** Voice stability (0-1, default: 0.5) */
  stability?: number;
  /** Similarity boost (0-1, default: 0.75) */
  similarityBoost?: number;
  /** Voice style (0-1, default: 0.0) */
  style?: number;
  /** Speech speed (0.25-4.0, default: 1.0) */
  speed?: number;
  /** Auto-connect on mount (default: false) */
  autoConnect?: boolean;
  /** Callback when audio chunk is received */
  onAudioChunk?: (chunkIndex: number, totalChunks: number, text: string) => void;
  /** Callback when synthesis completes */
  onComplete?: (totalChunks: number) => void;
  /** Callback when error occurs */
  onError?: (error: string | Error) => void;
  /** Callback when connection state changes */
  onConnectionChange?: (isConnected: boolean) => void;
}

/**
 * Progress tracking for TTS synthesis
 */
export interface TTSProgress {
  /** Current chunk being processed */
  current: number;
  /** Total number of chunks */
  total: number;
  /** Current chunk text */
  currentText: string;
}

/**
 * Audio chunk message from server
 */
interface AudioChunkMessage {
  type: 'audio_chunk';
  chunk_index: number;
  total_chunks: number;
  audio_data: string; // base64 encoded
  text: string;
  format: string;
  session_id: string;
}

/**
 * WebSocket message types
 */
interface WebSocketMessage {
  type: 'connected' | 'audio_chunk' | 'completed' | 'stopped' | 'error' | 'pong';
  message?: string;
  error?: string;
  timestamp?: string;
  session_id?: string;
  total_chunks?: number;
  // audio_chunk specific
  chunk_index?: number;
  audio_data?: string;
  text?: string;
  format?: string;
}

// ==================== Main Hook ====================

export function useWebSocketTTS(config: TTSConfig = {}) {
  // ==================== Configuration ====================
  const {
    wsUrl = 'ws://localhost:3013/ws/elevenlabs-tts',
    voiceId = 'moBQ5vcoHD68Es6NqdGR', // George (English)
    modelId = 'eleven_v3',
    stability = 0.5,
    similarityBoost = 0.75,
    style = 0.0,
    speed = 1.0,
    autoConnect = false,
  } = config;

  // ==================== State Management ====================
  const [isConnected, setIsConnected] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [progress, setProgress] = useState<TTSProgress>({
    current: 0,
    total: 0,
    currentText: '',
  });

  // ==================== Refs ====================
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const sessionIdRef = useRef<string>('');

  // Store callbacks in refs to avoid dependency issues
  const callbacksRef = useRef(config);

  // Update callbacks ref when config changes
  useEffect(() => {
    callbacksRef.current = config;
  }, [config]);

  // ==================== Audio Context Setup ====================
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🔊 Audio context initialized');
    }
    return audioContextRef.current;
  }, []);

  // ==================== Audio Queue & Sequential Playback ====================

  /**
   * Play next audio chunk from queue
   */
  const playNextChunk = useCallback(async () => {
    if (audioQueueRef.current.length === 0) {
      console.log('✅ Audio queue empty, playback complete');
      isPlayingRef.current = false;
      return;
    }

    if (isPlayingRef.current) {
      console.log('⏸️ Already playing, waiting for current chunk to finish');
      return;
    }

    isPlayingRef.current = true;
    const audioData = audioQueueRef.current.shift();

    if (!audioData) {
      isPlayingRef.current = false;
      return;
    }

    try {
      const audioContext = initAudioContext();

      // Resume audio context if suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('▶️ Audio context resumed');
      }

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      console.log(`🎵 Decoded audio chunk: ${audioBuffer.duration.toFixed(2)}s`);

      // Create buffer source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      // Store reference for stopping
      currentSourceRef.current = source;

      // Auto-play next chunk when current finishes
      source.onended = () => {
        console.log('✅ Chunk playback finished');
        currentSourceRef.current = null;
        isPlayingRef.current = false;

        // Play next chunk if available
        if (audioQueueRef.current.length > 0) {
          playNextChunk();
        }
      };

      // Start playback
      source.start(0);
      console.log('▶️ Playing audio chunk');

    } catch (error: any) {
      console.error('❌ Error playing audio chunk:', error);
      callbacksRef.current.onError?.(error);
      isPlayingRef.current = false;

      // Try to play next chunk even if this one failed
      if (audioQueueRef.current.length > 0) {
        playNextChunk();
      }
    }
  }, [initAudioContext]);

  // ==================== WebSocket Message Handlers ====================

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log(`📨 Received message type: ${message.type}`);

      switch (message.type) {
        case 'connected':
          console.log('✅ Connected to WebSocket TTS server');
          setIsConnected(true);
          callbacksRef.current.onConnectionChange?.(true);
          break;

        case 'audio_chunk':
          handleAudioChunk(message as unknown as AudioChunkMessage);
          break;

        case 'completed':
          console.log('✅ TTS synthesis completed');
          setIsSynthesizing(false);
          callbacksRef.current.onComplete?.(message.total_chunks || 0);
          break;

        case 'stopped':
          console.log('🛑 TTS synthesis stopped');
          setIsSynthesizing(false);
          break;

        case 'error':
          console.error('❌ Server error:', message.error);
          setIsSynthesizing(false);
          callbacksRef.current.onError?.(message.error || 'Unknown error');
          break;

        case 'pong':
          console.log('🏓 Pong received');
          break;

        default:
          console.warn('⚠️ Unknown message type:', message.type);
      }
    } catch (error: any) {
      console.error('❌ Error parsing WebSocket message:', error);
      callbacksRef.current.onError?.(error);
    }
  }, []);

  const handleAudioChunk = useCallback((message: AudioChunkMessage) => {
    const { chunk_index, total_chunks, audio_data, text } = message;

    console.log(`📦 Received audio chunk ${chunk_index + 1}/${total_chunks}`);
    console.log(`📝 Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

    // Update progress
    setProgress({
      current: chunk_index + 1,
      total: total_chunks,
      currentText: text,
    });

    // Trigger callback
    callbacksRef.current.onAudioChunk?.(chunk_index, total_chunks, text);

    try {
      // Decode base64 to ArrayBuffer
      const binaryString = atob(audio_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioArrayBuffer = bytes.buffer;

      // Add to queue
      audioQueueRef.current.push(audioArrayBuffer);
      console.log(`➕ Added to queue (queue size: ${audioQueueRef.current.length})`);

      // Start playing if not already playing
      if (!isPlayingRef.current) {
        playNextChunk();
      }

    } catch (error: any) {
      console.error('❌ Error processing audio chunk:', error);
      callbacksRef.current.onError?.(error);
    }
  }, [playNextChunk]);

  // ==================== WebSocket Connection Management ====================

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('⚠️ Already connected');
      return;
    }

    try {
      console.log(`🔌 Connecting to ${wsUrl}...`);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connection established');
        setIsConnected(true);
        callbacksRef.current.onConnectionChange?.(true);
      };

      ws.onmessage = handleWebSocketMessage;

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        callbacksRef.current.onError?.(error as any);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        setIsConnected(false);
        setIsSynthesizing(false);
        callbacksRef.current.onConnectionChange?.(false);
        wsRef.current = null;
      };

    } catch (error: any) {
      console.error('❌ Failed to connect:', error);
      callbacksRef.current.onError?.(error);
    }
  }, [wsUrl, handleWebSocketMessage]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      console.log('🔌 Disconnecting from WebSocket...');
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsSynthesizing(false);
    callbacksRef.current.onConnectionChange?.(false);
  }, []);

  // ==================== TTS Synthesis ====================

  /**
   * Synthesize text to speech
   */
  const synthesize = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) {
      console.warn('⚠️ Empty text provided');
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      const errorMsg = 'WebSocket not connected. Call connect() first.';
      console.error(`❌ ${errorMsg}`);
      callbacksRef.current.onError?.(errorMsg);
      return;
    }

    try {
      console.log(`🎤 Synthesizing text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);

      // Reset state
      setIsSynthesizing(true);
      setProgress({ current: 0, total: 0, currentText: '' });
      audioQueueRef.current = [];
      isPlayingRef.current = false;

      // Generate session ID
      sessionIdRef.current = `session_${Date.now()}`;

      // Initialize audio context
      initAudioContext();

      // Send TTS request
      const request = {
        type: 'tts',
        text: text.trim(),
        voice_id: voiceId,
        model_id: modelId,
        session_id: sessionIdRef.current,
        stability,
        similarity_boost: similarityBoost,
        style,
        speed,
      };

      wsRef.current.send(JSON.stringify(request));
      console.log('📤 TTS request sent');

    } catch (error: any) {
      console.error('❌ Error synthesizing text:', error);
      setIsSynthesizing(false);
      callbacksRef.current.onError?.(error);
    }
  }, [voiceId, modelId, stability, similarityBoost, style, speed, initAudioContext]);

  /**
   * Stop current synthesis and playback
   */
  const stop = useCallback(() => {
    console.log('🛑 Stopping synthesis and playback...');

    // Stop current audio playback
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
        currentSourceRef.current.disconnect();
        currentSourceRef.current = null;
      } catch (error) {
        console.warn('⚠️ Error stopping audio source:', error);
      }
    }

    // Clear audio queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;

    // Reset state
    setIsSynthesizing(false);
    setProgress({ current: 0, total: 0, currentText: '' });

    // Send stop message to server
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'stop',
        session_id: sessionIdRef.current,
      }));
      console.log('📤 Stop message sent to server');
    }

    console.log('✅ Stopped');
  }, []);

  /**
   * Send ping to server (for testing connection)
   */
  const ping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
      console.log('🏓 Ping sent');
    } else {
      console.warn('⚠️ Cannot ping: not connected');
    }
  }, []);

  // ==================== Lifecycle Management ====================

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      stop();
      disconnect();

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [autoConnect, connect, disconnect, stop]);

  // ==================== Return Hook Interface ====================

  return {
    // State
    isConnected,
    isSynthesizing,
    progress,

    // Connection management
    connect,
    disconnect,

    // TTS functions
    synthesize,
    stop,

    // Utility
    ping,
  };
}
