export const API_KEY = process.env.LIVEAVATAR_API_KEY || "";
export const API_URL = process.env.LIVEAVATAR_API_URL || "https://api.liveavatar.com";
export const AVATAR_ID = process.env.LIVEAVATAR_AVATAR_ID || "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a";

// FULL MODE Customizations
// Wayne's avatar voice and context
export const VOICE_ID = process.env.LIVEAVATAR_VOICE_ID || "c2527536-6d1f-4412-a643-53a3497dada9";
export const CONTEXT_ID = process.env.LIVEAVATAR_CONTEXT_ID || "5b9dba8a-aa31-11f0-a6ee-066a7fa2e369";
export const LANGUAGE = process.env.LIVEAVATAR_LANGUAGE || "en";

// CUSTOM MODE Customizations
export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
export const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "pqHfZKP75CvOlQylNhV4"; // Bill - male Thai voice
export const ELEVENLABS_MODEL = process.env.ELEVENLABS_MODEL || "eleven_v3"; // eleven_v3 for highest quality
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// OpenAI Realtime API for STT
export const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
export const OPENAI_WHISPER_MODEL = process.env.OPENAI_WHISPER_MODEL || "whisper-1";
export const OPENAI_REQUEST_TIMEOUT = process.env.OPENAI_REQUEST_TIMEOUT || "30s";
export const OPENAI_REALTIME_ENABLED = process.env.OPENAI_REALTIME_ENABLED === "true";
export const OPENAI_REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL || "gpt-4o-realtime-preview";
export const OPENAI_REALTIME_WS_URL = process.env.OPENAI_REALTIME_WS_URL || "wss://api.openai.com/v1/realtime";
export const OPENAI_REALTIME_MODALITIES = process.env.OPENAI_REALTIME_MODALITIES || "text";
export const OPENAI_REALTIME_INTENT = process.env.OPENAI_REALTIME_INTENT || "transcription";
export const OPENAI_REALTIME_TURN_DETECTION = process.env.OPENAI_REALTIME_TURN_DETECTION || "server_vad";
export const OPENAI_REALTIME_LANGUAGE = process.env.OPENAI_REALTIME_LANGUAGE || "th";
export const OPENAI_REALTIME_INPUT_AUDIO_FORMAT = process.env.OPENAI_REALTIME_INPUT_AUDIO_FORMAT || "pcm16";
export const OPENAI_REALTIME_OUTPUT_AUDIO_FORMAT = process.env.OPENAI_REALTIME_OUTPUT_AUDIO_FORMAT || "pcm16";

// HeyGen API (for listing voices, avatars, etc.)
export const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || "";
