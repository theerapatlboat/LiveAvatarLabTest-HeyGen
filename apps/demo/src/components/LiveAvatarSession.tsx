"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  LiveAvatarContextProvider,
  useSession,
  useTextChat,
  useVoiceChat,
  useCustomVoiceChat,
} from "../liveavatar";
import { SessionState } from "@heygen/liveavatar-web-sdk";
import { useAvatarActions } from "../liveavatar/useAvatarActions";
import { useElevenLabsRealtimeSTT } from "../liveavatar/useElevenLabsRealtimeSTT";
import { useLiveAvatarContext } from "../liveavatar/context";
import { useWebSocketTTS } from "../liveavatar/useWebSocketTTS";

const Button: React.FC<{
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, onMouseDown, onMouseUp, onTouchStart, onTouchEnd, disabled, children, className }) => {
  return (
    <button
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      disabled={disabled}
      className={className || "bg-white text-black px-4 py-2 rounded-md"}
    >
      {children}
    </button>
  );
};

const LiveAvatarSessionComponent: React.FC<{
  mode: "FULL" | "CUSTOM";
  onSessionStopped: () => void;
}> = ({ mode, onSessionStopped }) => {
  const [message, setMessage] = useState("");
  const {
    sessionState,
    isStreamReady,
    startSession,
    stopSession,
    connectionQuality,
    keepAlive,
    attachElement,
  } = useSession();
  const {
    isAvatarTalking,
    isUserTalking,
    isMuted,
    isActive,
    isLoading,
    start,
    stop,
    mute,
    unmute,
  } = useVoiceChat();

  // Custom Voice Chat for CUSTOM mode (OpenAI Realtime STT)
  const {
    isRecording: isCustomRecording,
    isProcessing: isCustomProcessing,
    transcript: customTranscript,
    startRecording: startCustomRecording,
    stopRecording: stopCustomRecording,
  } = useCustomVoiceChat();

  const { interrupt, repeat, startListening, stopListening } =
    useAvatarActions(mode);

  const { sendMessage } = useTextChat(mode);
  const { sessionRef } = useLiveAvatarContext();
  const videoRef = useRef<HTMLVideoElement>(null);

  // ElevenLabs Realtime STT Integration with Voice-to-Voice Flow
  const {
    isConnected: isRealtimeSTTConnected,
    partialText: realtimePartialText,
    finalText: realtimeFinalText,
    connect: connectRealtimeSTT,
    disconnect: disconnectRealtimeSTT,
    reset: resetRealtimeSTT,
    getCombinedTranscript,
  } = useElevenLabsRealtimeSTT({
    languageCode: "th",
    onPartialTranscript: (text) => {
      console.log("🎤 [REALTIME STT] Partial transcript:", text);
    },
    onFinalTranscript: async (text) => {
      console.log("✅ [REALTIME STT] Final transcript:", text);
      console.log("📊 [REALTIME STT] Transcript length:", text.length, "characters");
    },
    onError: (error) => {
      console.error("❌ [REALTIME STT] Error:", error);
    },
  });

  // WebSocket TTS Integration
  const {
    isConnectedTTS: isWSTTSConnected,
    isSynthesizing: isWSTTSSynthesizing,
    progress: wsTTSProgress,
    connect: connectWSTTS,
    disconnect: disconnectWSTTS,
    synthesize: synthesizeWSTTS,
  } = useWebSocketTTS({
    wsUrl: 'ws://localhost:3013/ws/elevenlabs-tts',
    voiceId: 'moBQ5vcoHD68Es6NqdGR',
    modelId: 'eleven_v3',
    autoConnect: false,
    onAudioChunk: (chunkIndex, totalChunks, text) => {
      console.log(`🎵 Audio chunk ${chunkIndex + 1}/${totalChunks}:`, text);
    },
    onComplete: (totalChunks) => {
      console.log(`✅ [WS-TTS] Synthesis completed - ${totalChunks} chunks`);
    },
    onError: (error) => {
      console.error('❌ [WS-TTS] Error:', error);
      alert(`Error: ${error}`);
    },
    onConnectionChange: (connected) => {
      console.log(`🔌 [WS-TTS] Connection: ${connected ? 'Connected ✅' : 'Disconnected ❌'}`);
    }
  });

  // Voice-to-Voice flow handler
  const handleVoiceToVoice = useCallback(async () => {
    try {
      // Get combined transcript from entire session
      const combinedText = getCombinedTranscript();

      if (!combinedText || combinedText.trim().length === 0) {
        console.log("⚠️ [V2V] No transcript to process");
        return;
      }

      console.log("🚀 [V2V] Starting Voice-to-Voice flow...");
      console.log("📝 [V2V] Transcript:", combinedText);
      console.log("📊 [V2V] Total length:", combinedText.length, "characters");

      // 1. Send combined transcript to OpenAI Chat API
      console.log("🤖 [V2V] Sending to OpenAI...");
      const chatRes = await fetch("/api/openai-chat-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: combinedText }),
      });
      const { response: aiResponse } = await chatRes.json();
      console.log("✅ [V2V] AI Response (original):", aiResponse);

      // Process AI response: Add periods after sentences with spaces for better TTS chunking
      let processedResponse = aiResponse;
      if (aiResponse && aiResponse.trim().length > 0) {
        // Add period after sentences that end with space (for better chunking)
        // This helps TTS split into natural chunks at sentence boundaries

        // Strategy: Add periods at multiple strategic points for Thai and English
        processedResponse = aiResponse
          // Pattern 1: Before English capital letters (e.g., "hello World" → "hello. World")
          .replace(/([^\.\!\?])\s+([A-Z])/g, '$1. $2')
          // Pattern 2: Before Thai words after space (Thai consonants: ก-ฮ)
          .replace(/([^\.\!\?ก-๙])\s+([ก-ฮ])/g, '$1. $2')
          // Pattern 3: After Thai ending particles (ครับ, ค่ะ, นะ, จ้า, etc.) followed by space
          .replace(/(ครับ|ค่ะ|คะ|ค่า|นะ|จ้า|เลย|แล้ว|ล่ะ)\s+/g, '$1. ')
          // Pattern 4: After Thai question word (ไหม, มั้ย, หรือ, เหรอ) followed by space
          .replace(/(ไหม|มั้ย|หรือ|เหรอ|รึ)\s+/g, '$1. ')
          // Pattern 5: Add period at the very end if missing
          .replace(/([^\.\!\?])\s*$/g, '$1.');

        console.log("📝 [V2V] Processed Response (with periods):", processedResponse);
        console.log("📊 [V2V] Original length:", aiResponse.length, "→ Processed length:", processedResponse.length);
      }

      // 2. Convert AI response to speech via WebSocket TTS (NEW!)
      console.log("🔊 [V2V] Converting to speech via WebSocket TTS...");

      // Ensure WebSocket is connected
      if (!isWSTTSConnected) {
        console.log("⚠️ [V2V] WebSocket not connected, connecting...");
        await connectWSTTS();
        // Wait for connection to establish
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Synthesize via WebSocket (use processed response with periods)
      await synthesizeWSTTS(processedResponse);
      console.log("✅ [V2V] WebSocket TTS synthesis started");
      console.log("🔊 [V2V] Audio will play automatically via Web Audio API");

      // Note: Audio plays automatically via useWebSocketTTS hook
      // Avatar lip-sync integration will be added in Step 4.3 (Progressive Lip-sync)

    } catch (error) {
      console.error("❌ [V2V] Error in voice-to-voice flow:", error);
    }
  }, [
    getCombinedTranscript,
    isWSTTSConnected,
    connectWSTTS,
    synthesizeWSTTS
  ]);

  useEffect(() => {
    if (sessionState === SessionState.DISCONNECTED) {
      onSessionStopped();
    }
  }, [sessionState, onSessionStopped]);

  useEffect(() => {
    if (isStreamReady && videoRef.current) {
      attachElement(videoRef.current);
    }
  }, [attachElement, isStreamReady]);

  useEffect(() => {
    if (sessionState === SessionState.INACTIVE) {
      startSession();
    }
  }, [startSession, sessionState]);

  // Auto-Connect/Disconnect WebSocket TTS based on mode
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (mode === 'CUSTOM' && !isWSTTSConnected) {
      console.log('🔌 [WS-TTS] Auto-connecting to WebSocket TTS server...');

      // ✅ Delay connection to ensure component is fully mounted
      timeoutId = setTimeout(() => {
        connectWSTTS();
      }, 500); // 500ms delay prevents race condition
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (mode === 'CUSTOM' && isWSTTSConnected) {
        console.log('🔌 [WS-TTS] Disconnecting from WebSocket TTS server...');
        disconnectWSTTS();
      }
    };
  }, [mode, isWSTTSConnected]);

  const VoiceChatComponents = (
    <>
      <p>Voice Chat Active: {isActive ? "true" : "false"}</p>
      <p>Voice Chat Loading: {isLoading ? "true" : "false"}</p>
      {isActive && <p>Muted: {isMuted ? "true" : "false"}</p>}
      <Button
        onClick={() => {
          if (isActive) {
            stop();
          } else {
            start();
          }
        }}
        disabled={isLoading}
      >
        {isActive ? "Stop Voice Chat" : "Start Voice Chat"}
      </Button>
      {isActive && (
        <Button
          onClick={() => {
            if (isMuted) {
              unmute();
            } else {
              mute();
            }
          }}
        >
          {isMuted ? "Unmute" : "Mute"}
        </Button>
      )}
    </>
  );

  const CustomVoiceChatComponents = (
    <>
      <p>Recording: {isCustomRecording ? "true" : "false"}</p>
      <p>Processing: {isCustomProcessing ? "true" : "false"}</p>
      {customTranscript && <p>Transcript: {customTranscript}</p>}
      <Button
        onMouseDown={() => {
          console.log("👆 Button onMouseDown triggered");
          startCustomRecording();
        }}
        onMouseUp={() => {
          console.log("👆 Button onMouseUp triggered");
          stopCustomRecording();
        }}
        onTouchStart={() => {
          console.log("👆 Button onTouchStart triggered");
          startCustomRecording();
        }}
        onTouchEnd={() => {
          console.log("👆 Button onTouchEnd triggered");
          stopCustomRecording();
        }}
        disabled={isCustomProcessing}
        className={`px-6 py-3 rounded-md font-semibold transition-all ${isCustomRecording
          ? "bg-red-500 text-white scale-110 shadow-lg"
          : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
          } ${isCustomProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isCustomRecording ? "🎤 Recording..." : "Hold to Talk"}
      </Button>
    </>
  );

  const RealtimeSTTComponents = (
    <>
      <div className="w-full border-t-2 border-yellow-400 pt-4 mt-4">
        <h3 className="text-lg font-bold text-yellow-400 mb-2">
          ElevenLabs Realtime STT (Continuous Voice Chat)
        </h3>
        <p>STT Connected: {isRealtimeSTTConnected ? "true" : "false"}</p>

        {/* 🆕 WebSocket TTS Status Section */}
        <div className="mt-3 p-3 bg-gray-800 rounded border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-300">
              WebSocket TTS:
            </span>
            <span className={`text-sm font-bold ${isWSTTSConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isWSTTSConnected ? '✅ Connected' : '❌ Disconnected'}
            </span>
          </div>

          {isWSTTSSynthesizing && (
            <div className="mt-2 p-2 bg-blue-900 bg-opacity-30 rounded border border-blue-600">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-sm">🔊 Synthesizing...</span>
                <span className="text-blue-300 text-sm font-mono">
                  {wsTTSProgress.current}/{wsTTSProgress.total} chunks
                </span>
              </div>
              {wsTTSProgress.currentText && (
                <p className="text-xs text-gray-400 mt-1 truncate">
                  "{wsTTSProgress.currentText.substring(0, 50)}..."
                </p>
              )}
            </div>
          )}
        </div>
        {/* End WebSocket TTS Status */}

        {realtimePartialText && (
          <p className="text-gray-400 italic mt-2">Partial: {realtimePartialText}</p>
        )}
        {realtimeFinalText && (
          <p className="text-white font-semibold mt-2">Transcript: {realtimeFinalText}</p>
        )}

        {/* Buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            onClick={async () => {
              if (isRealtimeSTTConnected) {
                // First disconnect, then trigger Voice-to-Voice flow
                disconnectRealtimeSTT();
                // Wait a moment for the CLOSE event to log combined transcript
                await new Promise(resolve => setTimeout(resolve, 100));
                // Trigger Voice-to-Voice flow with combined transcript
                await handleVoiceToVoice();
              } else {
                connectRealtimeSTT();
              }
            }}
            disabled={isWSTTSSynthesizing} // 🆕 Disable during synthesis
            className={`px-6 py-3 rounded-md font-semibold transition-all ${
              isRealtimeSTTConnected
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-green-500 text-white hover:bg-green-600"
            } ${isWSTTSSynthesizing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isWSTTSSynthesizing
              ? "🔊 Speaking..."
              : isRealtimeSTTConnected
              ? "Stop & Process with Avatar"
              : "Start Realtime Voice Chat"}
          </Button>
          <Button
            onClick={() => {
              resetRealtimeSTT();
            }}
            disabled={!isRealtimeSTTConnected || isWSTTSSynthesizing}
          >
            Reset Transcript
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="w-[1080px] max-w-full h-full flex flex-col items-center justify-center gap-4 py-4">
      <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
        <button
          className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded-md"
          onClick={() => stopSession()}
        >
          Stop
        </button>
      </div>
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <p>Session state: {sessionState}</p>
        <p>Connection quality: {connectionQuality}</p>
        {mode === "FULL" && (
          <p>User talking: {isUserTalking ? "true" : "false"}</p>
        )}
        <p>Avatar talking: {isAvatarTalking ? "true" : "false"}</p>
        {mode === "FULL" && VoiceChatComponents}
        {mode === "CUSTOM" && CustomVoiceChatComponents}
        {mode === "CUSTOM" && RealtimeSTTComponents}
        <Button
          onClick={() => {
            keepAlive();
          }}
        >
          Keep Alive
        </Button>
        <div className="w-full h-full flex flex-row items-center justify-center gap-4">
          <Button
            onClick={() => {
              startListening();
            }}
          >
            Start Listening
          </Button>
          <Button
            onClick={() => {
              stopListening();
            }}
          >
            Stop Listening
          </Button>
          <Button
            onClick={() => {
              interrupt();
            }}
          >
            Interrupt
          </Button>
        </div>
        <div className="w-full h-full flex flex-row items-center justify-center gap-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-[400px] bg-white text-black px-4 py-2 rounded-md"
          />
          <Button
            onClick={() => {
              sendMessage(message);
              setMessage("");
            }}
          >
            Send
          </Button>
          <Button
            onClick={() => {
              repeat(message);
              setMessage("");
            }}
          >
            Repeat
          </Button>
        </div>
      </div>
    </div>
  );
};

export const LiveAvatarSession: React.FC<{
  mode: "FULL" | "CUSTOM";
  sessionAccessToken: string;
  onSessionStopped: () => void;
}> = ({ mode, sessionAccessToken, onSessionStopped }) => {
  return (
    <LiveAvatarContextProvider sessionAccessToken={sessionAccessToken}>
      <LiveAvatarSessionComponent
        mode={mode}
        onSessionStopped={onSessionStopped}
      />
    </LiveAvatarContextProvider>
  );
};
