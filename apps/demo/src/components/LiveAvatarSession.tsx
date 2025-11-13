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

  // Voice-to-Voice flow handler
  const handleVoiceToVoice = useCallback(async () => {
    try {
      // Get combined transcript from entire session
      const combinedText = getCombinedTranscript();

      if (!combinedText || combinedText.trim().length === 0) {
        console.log("⚠️ No transcript to process");
        return;
      }

      console.log("🚀 [V2V] Starting Voice-to-Voice flow...");
      console.log("📝 [V2V] Combined transcript:", combinedText);
      console.log("📊 [V2V] Total length:", combinedText.length, "characters");

      // 1. Send combined transcript to OpenAI Chat API
      console.log("🤖 [V2V] Sending to OpenAI...");
      const chatRes = await fetch("/api/openai-chat-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: combinedText }),
      });
      const { response: aiResponse } = await chatRes.json();
      console.log("✅ [V2V] AI Response:", aiResponse);

      // 2. Convert AI response to speech using ElevenLabs TTS
      console.log("🔊 [V2V] Converting to speech...");
      const ttsRes = await fetch("/api/elevenlabs-text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiResponse }),
      });
      const { audio } = await ttsRes.json();
      console.log("✅ [V2V] TTS Audio generated");

      // 3. Send audio to Avatar for lip-sync
      if (sessionRef.current) {
        console.log("👄 [V2V] Sending to Avatar...");
        await sessionRef.current.repeatAudio(audio);
        console.log("✅ [V2V] Avatar speaking!");
      } else {
        console.warn("⚠️ [V2V] Avatar session not available");
      }
    } catch (error) {
      console.error("❌ [V2V] Error in voice-to-voice flow:", error);
    }
  }, [getCombinedTranscript, sessionRef]);

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
        className={`px-6 py-3 rounded-md font-semibold transition-all ${
          isCustomRecording
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
        <p>Connected: {isRealtimeSTTConnected ? "true" : "false"}</p>
        {realtimePartialText && (
          <p className="text-gray-400 italic">Partial: {realtimePartialText}</p>
        )}
        {realtimeFinalText && (
          <p className="text-white font-semibold">Transcript: {realtimeFinalText}</p>
        )}
        <div className="flex gap-2 mt-2">
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
            className={`px-6 py-3 rounded-md font-semibold transition-all ${
              isRealtimeSTTConnected
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {isRealtimeSTTConnected ? "Stop & Process with Avatar" : "Start Realtime Voice Chat"}
          </Button>
          <Button
            onClick={() => {
              resetRealtimeSTT();
            }}
            disabled={!isRealtimeSTTConnected}
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
