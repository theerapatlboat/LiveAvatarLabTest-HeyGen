# Voice-to-Voice Real-time Communication System
**HeyGen LiveAvatar + OpenAI + ElevenLabs Integration**

## สรุปหลักการทำงาน

โปรเจ็คนี้เป็นระบบสนทนา Voice-to-Voice แบบ Real-time ที่ใช้ HeyGen LiveAvatar เป็น Avatar หลัก โดยรองรับ 2 โหมด:

### โหมด FULL
- HeyGen จัดการทุกอย่าง (STT, AI, TTS, Lip-sync)
- เหมาะสำหรับการใช้งานที่ต้องการความง่ายและรวดเร็ว

### โหมด CUSTOM
- ผู้ใช้ควบคุม AI (OpenAI GPT) และ TTS (ElevenLabs)
- HeyGen ทำหน้าที่แค่ Video Streaming และ Lip-sync
- เหมาะสำหรับการปรับแต่งบุคลิกภาพและเสียงของ Avatar

## เทคโนโลยีหลักที่ใช้

| บริการ | หน้าที่ | เอกสาร |
|--------|---------|---------|
| **HeyGen LiveAvatar** | Video Streaming, Lip-sync Animation | https://api.liveavatar.com |
| **OpenAI Whisper** | Speech-to-Text (CUSTOM mode) | https://platform.openai.com/docs/guides/speech-to-text |
| **OpenAI GPT-4** | AI Conversation (CUSTOM mode) | https://platform.openai.com/docs/guides/chat |
| **ElevenLabs** | Text-to-Speech (CUSTOM mode) | https://elevenlabs.io/docs |
| **ElevenLabs Scribe** | Real-time Speech-to-Text | https://elevenlabs.io/docs/cookbooks/speech-to-text/streaming |
| **LiveKit** | WebRTC Video Streaming | https://docs.livekit.io |
| **WebSocket** | Real-time Command/Event Communication | - |

## วิธีการรันโปรเจ็ค

### 1. ติดตั้ง Dependencies

```bash
# ติดตั้ง pnpm (ถ้ายังไม่มี)
npm install -g pnpm@9.0.0

# ติดตั้ง dependencies
pnpm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ใน `apps/demo/`:

```env
# HeyGen LiveAvatar
LIVEAVATAR_API_KEY=your_heygen_api_key
LIVEAVATAR_AVATAR_ID=dd73ea75-1218-4ef3-92ce-606d5f7fbc0a

# สำหรับ FULL mode
LIVEAVATAR_VOICE_ID=your_voice_id
LIVEAVATAR_CONTEXT_ID=your_context_id
LIVEAVATAR_LANGUAGE=en

# สำหรับ CUSTOM mode
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=pqHfZKP75CvOlQylNhV4
ELEVENLABS_MODEL=eleven_v3
```

### 3. รันโปรเจ็ค

```bash
# รัน Demo application
pnpm demo

# หรือรัน Development mode
pnpm dev

# Build โปรเจ็ค
pnpm build
```

เปิดเบราว์เซอร์ที่ http://localhost:3000

---

# IMPLEMENTATION FLOW

## PHASE 1: Session Management

### TASK 1.1: เริ่มต้น Session (FULL Mode)

**Step 1.1.1: สร้าง Session Token**

```typescript
// API: POST /api/start-session
// File: apps/demo/app/api/start-session/route.ts

// Request
POST /api/start-session
Content-Type: application/json

// Response
{
  "session_token": "eyJhbGci...",
  "session_id": "abc123..."
}
```

**Backend Logic:**
```typescript
const response = await fetch(`${LIVEAVATAR_API_URL}/v1/sessions/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': LIVEAVATAR_API_KEY,
  },
  body: JSON.stringify({
    mode: "FULL",
    avatar_id: LIVEAVATAR_AVATAR_ID,
    avatar_persona: {
      voice_id: LIVEAVATAR_VOICE_ID,
      context_id: LIVEAVATAR_CONTEXT_ID,
      language: LIVEAVATAR_LANGUAGE
    }
  })
});
```

**Step 1.1.2: เริ่มต้น LiveKit Session**

```typescript
// Frontend: apps/demo/src/liveavatar/useSession.ts

const session = new LiveAvatarSession();

await session.start({
  sessionToken: session_token,
  serverUrl: "https://api.liveavatar.com"
});
```

**Step 1.1.3: เชื่อมต่อ Video Element**

```typescript
// Wait for stream ready
session.on(SessionEventsEnum.SESSION_STREAM_READY, () => {
  const videoElement = document.querySelector('video');
  session.attach(videoElement);
});
```

### TASK 1.2: เริ่มต้น Session (CUSTOM Mode)

**Step 1.2.1: สร้าง Session Token**

```typescript
// API: POST /api/start-custom-session
// File: apps/demo/app/api/start-custom-session/route.ts

POST /api/start-custom-session

// Response
{
  "session_token": "eyJhbGci...",
  "session_id": "abc123..."
}
```

**Backend Logic:**
```typescript
const response = await fetch(`${LIVEAVATAR_API_URL}/v1/sessions/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': LIVEAVATAR_API_KEY,
  },
  body: JSON.stringify({
    mode: "CUSTOM",
    avatar_id: LIVEAVATAR_AVATAR_ID
  })
});
```

**Step 1.2.2: เชื่อมต่อ WebSocket**

```typescript
// SDK: packages/js-sdk/src/LiveAvatarSession/LiveAvatarSession.ts:317-397

const startResponse = await fetch(`${serverUrl}/v1/sessions/start`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sessionToken}`
  }
});

const { ws_url, livekit_url, livekit_client_token } = await startResponse.json();

// Connect WebSocket for commands
this._sessionEventSocket = new WebSocket(ws_url);

this._sessionEventSocket.onopen = () => {
  console.log('WebSocket connected');
};

this._sessionEventSocket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleServerEvent(message);
};
```

### TASK 1.3: รักษา Session ให้ทำงานต่อ

**Step 1.3.1: Keep-Alive ทุก 5 นาที**

```typescript
// API: POST /api/keep-session-alive

POST /api/keep-session-alive
Content-Type: application/json

{
  "session_token": "eyJhbGci..."
}
```

**Frontend Implementation:**
```typescript
// Set interval to keep session alive
setInterval(async () => {
  await fetch('/api/keep-session-alive', {
    method: 'POST',
    body: JSON.stringify({ session_token })
  });
}, 5 * 60 * 1000); // Every 5 minutes
```

### TASK 1.4: หยุด Session

**Step 1.4.1: ปิด Session**

```typescript
// API: POST /api/stop-session

POST /api/stop-session
Content-Type: application/json

{
  "session_token": "eyJhbGci..."
}
```

**Frontend:**
```typescript
await session.stop();
await fetch('/api/stop-session', {
  method: 'POST',
  body: JSON.stringify({ session_token })
});
```

---

## PHASE 2: Voice Chat (FULL Mode)

### TASK 2.1: เริ่มต้น Voice Chat

**Step 2.1.1: เข้าถึง Microphone**

```typescript
// File: apps/demo/src/liveavatar/useVoiceChat.ts

const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
});
```

**Step 2.1.2: เริ่ม Voice Chat**

```typescript
await session.voiceChat.start();

// Voice chat state changes
session.voiceChat.on(VoiceChatEventsEnum.STATE_CHANGED, (state) => {
  console.log('Voice chat state:', state);
  // States: IDLE, STARTING, ACTIVE, STOPPING
});
```

### TASK 2.2: รับฟัง User Transcription

```typescript
session.on(AgentEventsEnum.USER_SPEAK_STARTED, () => {
  console.log('User started speaking');
});

session.on(AgentEventsEnum.USER_TRANSCRIPTION, (data) => {
  console.log('User said:', data.text);
  // data = { text: string, is_final: boolean }
});

session.on(AgentEventsEnum.USER_SPEAK_ENDED, () => {
  console.log('User stopped speaking');
});
```

### TASK 2.3: รับฟัง Avatar Response

```typescript
session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
  console.log('Avatar started speaking');
});

session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, (data) => {
  console.log('Avatar said:', data.text);
});

session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
  console.log('Avatar stopped speaking');
});
```

### TASK 2.4: ควบคุม Microphone

```typescript
// Mute microphone
await session.voiceChat.mute();

session.voiceChat.on(VoiceChatEventsEnum.MUTED, () => {
  console.log('Microphone muted');
});

// Unmute microphone
await session.voiceChat.unmute();

session.voiceChat.on(VoiceChatEventsEnum.UNMUTED, () => {
  console.log('Microphone unmuted');
});

// Stop voice chat
await session.voiceChat.stop();
```

---

## PHASE 3: Custom Voice Chat (CUSTOM Mode)

### TASK 3.1: บันทึกเสียงจาก Microphone

**Step 3.1.1: สร้าง AudioContext**

```typescript
// File: apps/demo/src/liveavatar/useCustomVoiceChat.ts

const audioContext = new AudioContext({
  sampleRate: 16000  // 16kHz for Whisper
});
```

**Step 3.1.2: โหลด AudioWorklet Processor**

```typescript
// Load audio processor
await audioContext.audioWorklet.addModule('/audio-processor.js');

// Create worklet node
const workletNode = new AudioWorkletNode(
  audioContext,
  'audio-recorder-processor'
);
```

**Step 3.1.3: รับ Audio Chunks**

```typescript
const audioBuffers: Float32Array[] = [];

workletNode.port.onmessage = (event) => {
  if (event.data.type === 'audioData') {
    audioBuffers.push(new Float32Array(event.data.data));
  }
};
```

**Step 3.1.4: เชื่อมต่อ Microphone**

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
});

const source = audioContext.createMediaStreamSource(stream);
source.connect(workletNode);
workletNode.connect(audioContext.destination);
```

### TASK 3.2: แปลงเสียงเป็นข้อความ (OpenAI Whisper)

**Step 3.2.1: หยุดบันทึกและรวม Audio Chunks**

```typescript
// Stop recording
workletNode.port.postMessage({ type: 'stop' });

// Combine all chunks
const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.length, 0);
const combinedBuffer = new Float32Array(totalLength);
let offset = 0;
for (const buffer of audioBuffers) {
  combinedBuffer.set(buffer, offset);
  offset += buffer.length;
}
```

**Step 3.2.2: แปลง Float32Array เป็น WAV**

```typescript
function pcmToWav(pcmData: Float32Array, sampleRate: number): Blob {
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcmData.length * 2, true);

  // Convert Float32 to Int16
  const pcm16 = new Int16Array(pcmData.length);
  for (let i = 0; i < pcmData.length; i++) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  return new Blob([wavHeader, pcm16.buffer], { type: 'audio/wav' });
}

const wavBlob = pcmToWav(combinedBuffer, 16000);
```

**Step 3.2.3: ส่งไปยัง OpenAI Whisper**

```typescript
// API: POST /api/openai-whisper-stt
// File: apps/demo/app/api/openai-whisper-stt/route.ts

const formData = new FormData();
formData.append('audio', wavBlob, 'audio.wav');

const response = await fetch('/api/openai-whisper-stt', {
  method: 'POST',
  body: formData
});

const { transcript } = await response.json();
console.log('Transcript:', transcript);
```

**Backend (Whisper API):**
```typescript
const formData = new FormData();
formData.append('file', audioBlob, 'audio.wav');
formData.append('model', 'whisper-1');
formData.append('language', 'th'); // or 'en'

const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  },
  body: formData
});

const { text } = await response.json();
```

### TASK 3.3: สร้างคำตอบด้วย OpenAI Chat

**Step 3.3.1: เรียก OpenAI Chat Completion API**

```typescript
// API: POST /api/openai-chat-complete
// File: apps/demo/app/api/openai-chat-complete/route.ts

const response = await fetch('/api/openai-chat-complete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: transcript,
    model: 'gpt-4o-mini',
    system_prompt: 'You are a helpful Thai-speaking assistant.'
  })
});

const { response: aiResponse } = await response.json();
```

**Backend:**
```typescript
const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt || 'You are a helpful assistant.'
      },
      {
        role: 'user',
        content: message
      }
    ]
  })
});

const data = await chatResponse.json();
const responseText = data.choices[0].message.content;
```

### TASK 3.4: แปลงข้อความเป็นเสียง (ElevenLabs TTS)

**Step 3.4.1: เรียก ElevenLabs API**

```typescript
// API: POST /api/elevenlabs-text-to-speech
// File: apps/demo/app/api/elevenlabs-text-to-speech/route.ts

const response = await fetch('/api/elevenlabs-text-to-speech', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: aiResponse,
    voice_id: 'pqHfZKP75CvOlQylNhV4', // Bill - Thai voice
    model_id: 'eleven_v3'
  })
});

const { audio } = await response.json();
// audio = base64 PCM 24000Hz
```

**Backend:**
```typescript
const ttsResponse = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_v3',
      output_format: 'pcm_24000'
    })
  }
);

const audioBuffer = await ttsResponse.arrayBuffer();
const base64Audio = Buffer.from(audioBuffer).toString('base64');
```

### TASK 3.5: ส่งเสียงไปยัง Avatar ผ่าน WebSocket

**Step 3.5.1: แบ่ง Audio เป็น Chunks (20ms)**

```typescript
// File: packages/js-sdk/src/audio_utils.ts

function splitPcm24kStringToChunks(pcmBase64: string): string[] {
  const BYTES_PER_20MS = 960; // 480 samples * 2 bytes at 24kHz
  const chunks: string[] = [];

  for (let i = 0; i < pcmBase64.length; i += BYTES_PER_20MS) {
    chunks.push(pcmBase64.slice(i, i + BYTES_PER_20MS));
  }

  return chunks;
}

const audioChunks = splitPcm24kStringToChunks(audio);
```

**Step 3.5.2: ส่ง Audio Chunks ผ่าน WebSocket**

```typescript
// File: packages/js-sdk/src/LiveAvatarSession/LiveAvatarSession.ts:612-642

const eventId = generateUUID();

// Send chunks sequentially
for (const chunk of audioChunks) {
  const message = {
    type: 'agent.speak',
    event_id: eventId,
    audio: chunk
  };

  this._sessionEventSocket?.send(JSON.stringify(message));

  // Wait a bit between chunks (optional)
  await new Promise(resolve => setTimeout(resolve, 20));
}

// Signal end of audio
const endMessage = {
  type: 'agent.speak_end',
  event_id: eventId
};

this._sessionEventSocket?.send(JSON.stringify(endMessage));
```

**Step 3.5.3: รับ Events จาก Server**

```typescript
this._sessionEventSocket.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'agent.speak_started':
      // Avatar เริ่มพูด
      this.emit(AgentEventsEnum.AVATAR_SPEAK_STARTED);
      break;

    case 'agent.speak_ended':
      // Avatar พูดจบ
      this.emit(AgentEventsEnum.AVATAR_SPEAK_ENDED);
      break;

    default:
      console.log('Received event:', message);
  }
};
```

---

## PHASE 4: ElevenLabs Realtime Speech-to-Text Integration

### TASK 4.1: สร้าง API Endpoint สำหรับ Single-Use Token

**Step 4.1.1: สร้าง Token Generation Endpoint**

```typescript
// สร้างไฟล์ใหม่: apps/demo/app/api/elevenlabs-stt-token/route.ts

import { NextResponse } from 'next/server';
import { ELEVENLABS_API_KEY } from '../secrets';

export async function POST() {
  try {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      token: data.token,
      expires_at: data.expires_at
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
```

### TASK 4.2: สร้าง WebSocket Client สำหรับ Realtime STT

**Step 4.2.1: สร้าง Hook สำหรับ Realtime STT**

```typescript
// สร้างไฟล์ใหม่: apps/demo/src/liveavatar/useElevenLabsRealtimeSTT.ts

import { useState, useRef, useCallback } from 'react';

interface RealtimeSTTConfig {
  language?: string;
  sampleRate?: number;
  onPartialTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onError?: (error: any) => void;
}

export function useElevenLabsRealtimeSTT(config: RealtimeSTTConfig = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [partialText, setPartialText] = useState('');
  const [finalText, setFinalText] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    try {
      // Get token from backend
      const tokenRes = await fetch('/api/elevenlabs-stt-token', {
        method: 'POST'
      });
      const { token } = await tokenRes.json();

      // Build WebSocket URL
      const params = new URLSearchParams({
        model_id: 'scribe_v2_realtime',
        language_code: config.language || 'th', // Thai
        audio_format: `pcm_${config.sampleRate || 16000}`,
        commit_strategy: 'vad', // Auto-commit on silence
        vad_silence_threshold_secs: '1.0',
        vad_threshold: '0.5'
      });

      const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?${params}`;

      // Connect WebSocket
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('ElevenLabs STT connected');
        setIsConnected(true);

        // Send authentication
        ws.send(JSON.stringify({
          message_type: 'auth',
          token: token
        }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.message_type) {
          case 'session_started':
            console.log('Session started:', message);
            break;

          case 'partial_transcript':
            setPartialText(message.text);
            config.onPartialTranscript?.(message.text);
            break;

          case 'committed_transcript':
            setFinalText(prev => prev + ' ' + message.text);
            config.onFinalTranscript?.(message.text);
            setPartialText(''); // Clear partial
            break;

          case 'auth_error':
          case 'transcriber_error':
          case 'input_error':
            console.error('STT Error:', message);
            config.onError?.(message);
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        config.onError?.(error);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      config.onError?.(error);
    }
  }, [config]);

  // Start recording and streaming
  const startRecording = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      await connect();
    }

    try {
      const sampleRate = config.sampleRate || 16000;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate });
      audioContextRef.current = audioContext;

      // Load audio processor
      await audioContext.audioWorklet.addModule('/audio-processor.js');

      // Create worklet node
      const workletNode = new AudioWorkletNode(
        audioContext,
        'audio-recorder-processor'
      );
      workletNodeRef.current = workletNode;

      // Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: sampleRate
        }
      });
      streamRef.current = stream;

      // Connect audio pipeline
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(workletNode);

      // Handle audio chunks
      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'audioData' && wsRef.current) {
          const pcmData = new Float32Array(event.data.data);

          // Convert Float32 to Int16
          const int16Data = new Int16Array(pcmData.length);
          for (let i = 0; i < pcmData.length; i++) {
            const s = Math.max(-1, Math.min(1, pcmData[i]));
            int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          // Convert to base64
          const base64Audio = btoa(
            String.fromCharCode(...new Uint8Array(int16Data.buffer))
          );

          // Send to ElevenLabs
          wsRef.current.send(JSON.stringify({
            message_type: 'input_audio_chunk',
            audio_base_64: base64Audio,
            sample_rate: sampleRate,
            commit: false
          }));
        }
      };

      setIsRecording(true);

    } catch (error) {
      console.error('Failed to start recording:', error);
      config.onError?.(error);
    }
  }, [connect, config]);

  // Stop recording
  const stopRecording = useCallback(() => {
    // Stop audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Disconnect audio nodes
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    stopRecording();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, [stopRecording]);

  // Manual commit (if using manual strategy)
  const commit = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        message_type: 'input_audio_chunk',
        audio_base_64: '',
        commit: true,
        sample_rate: config.sampleRate || 16000
      }));
    }
  }, [config.sampleRate]);

  return {
    isConnected,
    isRecording,
    partialText,
    finalText,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    commit
  };
}
```

**Step 4.2.2: ใช้งาน Hook ในหน้าเว็บ**

```typescript
// ในไฟล์ Component (เช่น apps/demo/src/components/LiveAvatarSession.tsx)

import { useElevenLabsRealtimeSTT } from '../liveavatar/useElevenLabsRealtimeSTT';

function LiveAvatarSession() {
  const {
    isConnected,
    isRecording,
    partialText,
    finalText,
    connect,
    disconnect,
    startRecording,
    stopRecording
  } = useElevenLabsRealtimeSTT({
    language: 'th', // Thai
    sampleRate: 16000,
    onPartialTranscript: (text) => {
      console.log('Partial:', text);
    },
    onFinalTranscript: async (text) => {
      console.log('Final:', text);

      // ส่งไปยัง OpenAI Chat
      const chatRes = await fetch('/api/openai-chat-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const { response } = await chatRes.json();

      // แปลงเป็นเสียงด้วย ElevenLabs
      const ttsRes = await fetch('/api/elevenlabs-text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: response })
      });
      const { audio } = await ttsRes.json();

      // ส่งไปยัง Avatar
      sessionRef.current?.repeatAudio(audio);
    },
    onError: (error) => {
      console.error('STT Error:', error);
    }
  });

  return (
    <div>
      <button onClick={connect} disabled={isConnected}>
        Connect STT
      </button>
      <button onClick={disconnect} disabled={!isConnected}>
        Disconnect STT
      </button>
      <button onClick={startRecording} disabled={!isConnected || isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>

      <div>
        <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        <p>Recording: {isRecording ? 'Yes' : 'No'}</p>
        <p>Partial: {partialText}</p>
        <p>Final: {finalText}</p>
      </div>
    </div>
  );
}
```

### TASK 4.3: เชื่อมต่อกับ Avatar WebSocket

**Step 4.3.1: ใช้ Realtime STT + Avatar ร่วมกัน**

```typescript
// Flow: ElevenLabs STT → OpenAI Chat → ElevenLabs TTS → Avatar

function useRealtimeVoiceChat(session: LiveAvatarSession) {
  const [messages, setMessages] = useState<Array<{role: string, text: string}>>([]);

  const stt = useElevenLabsRealtimeSTT({
    language: 'th',
    sampleRate: 16000,

    onFinalTranscript: async (userText) => {
      // Add user message
      setMessages(prev => [...prev, { role: 'user', text: userText }]);

      try {
        // Get AI response
        const chatRes = await fetch('/api/openai-chat-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            system_prompt: 'You are a helpful Thai-speaking assistant.'
          })
        });
        const { response } = await chatRes.json();

        // Add AI message
        setMessages(prev => [...prev, { role: 'assistant', text: response }]);

        // Convert to speech
        const ttsRes = await fetch('/api/elevenlabs-text-to-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: response,
            voice_id: 'pqHfZKP75CvOlQylNhV4' // Thai voice
          })
        });
        const { audio } = await ttsRes.json();

        // Make avatar speak
        await session.repeatAudio(audio);

      } catch (error) {
        console.error('Error in voice chat:', error);
      }
    }
  });

  return {
    ...stt,
    messages
  };
}
```

---

## PHASE 5: WebSocket Integration for OpenAI Chat

### TASK 5.1: สร้าง WebSocket Endpoint สำหรับ OpenAI Chat

**Step 5.1.1: สร้าง WebSocket Server**

```typescript
// สร้างไฟล์ใหม่: apps/demo/app/api/ws-openai-chat/route.ts

import { NextRequest } from 'next/server';
import { OPENAI_API_KEY } from '../secrets';

export async function GET(request: NextRequest) {
  const upgradeHeader = request.headers.get('upgrade');

  if (upgradeHeader !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 });
  }

  // Note: Next.js doesn't support WebSocket natively
  // ต้องใช้ custom server หรือ external WebSocket server
  // ตัวอย่างนี้แสดงแนวคิด - ใช้งานจริงต้องใช้ ws library

  return new Response('WebSocket endpoint - requires custom server', {
    status: 501
  });
}
```

**Step 5.1.2: สร้าง Custom WebSocket Server**

```typescript
// สร้างไฟล์ใหม่: apps/demo/server/websocket-server.ts

import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to OpenAI Chat WebSocket');

  let conversationHistory: Array<{role: string, content: string}> = [];

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'chat':
          // Add user message to history
          conversationHistory.push({
            role: 'user',
            content: message.text
          });

          // Call OpenAI
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: message.system_prompt || 'You are a helpful assistant.'
                },
                ...conversationHistory
              ]
            })
          });

          const data = await response.json();
          const assistantMessage = data.choices[0].message.content;

          // Add to history
          conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
          });

          // Send response
          ws.send(JSON.stringify({
            type: 'chat_response',
            text: assistantMessage
          }));
          break;

        case 'reset':
          conversationHistory = [];
          ws.send(JSON.stringify({
            type: 'reset_confirmed'
          }));
          break;
      }

    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(3001, () => {
  console.log('WebSocket server running on port 3001');
});
```

**Step 5.1.3: สร้าง Hook สำหรับ WebSocket Chat**

```typescript
// สร้างไฟล์ใหม่: apps/demo/src/liveavatar/useWebSocketChat.ts

import { useState, useRef, useCallback, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function useWebSocketChat(wsUrl: string = 'ws://localhost:3001') {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to chat WebSocket');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'chat_response':
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: message.text,
            timestamp: Date.now()
          }]);
          break;

        case 'error':
          console.error('Chat error:', message.error);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from chat');
      setIsConnected(false);
    };
  }, [wsUrl]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Send message
  const sendMessage = useCallback((text: string, systemPrompt?: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    // Add user message to UI
    setMessages(prev => [...prev, {
      role: 'user',
      content: text,
      timestamp: Date.now()
    }]);

    // Send to server
    wsRef.current.send(JSON.stringify({
      type: 'chat',
      text,
      system_prompt: systemPrompt
    }));
  }, []);

  // Reset conversation
  const reset = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'reset'
      }));
      setMessages([]);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    messages,
    connect,
    disconnect,
    sendMessage,
    reset
  };
}
```

**Step 5.1.4: ใช้งานใน Component**

```typescript
import { useWebSocketChat } from '../liveavatar/useWebSocketChat';

function ChatInterface() {
  const { isConnected, messages, sendMessage, reset } = useWebSocketChat();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>Send</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

---

## PHASE 6: WebSocket Integration for ElevenLabs TTS

### TASK 6.1: สร้าง WebSocket Endpoint สำหรับ Streaming TTS

**Step 6.1.1: สร้าง WebSocket Server สำหรับ TTS**

```typescript
// เพิ่มใน apps/demo/server/websocket-server.ts

// TTS WebSocket Server
const ttsWss = new WebSocketServer({ noServer: true });

ttsWss.on('connection', (ws) => {
  console.log('Client connected to TTS WebSocket');

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'synthesize') {
        // Call ElevenLabs streaming TTS
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${message.voice_id}/stream`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': process.env.ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
              text: message.text,
              model_id: message.model_id || 'eleven_v3',
              output_format: 'pcm_24000'
            })
          }
        );

        if (!response.body) {
          throw new Error('No response body');
        }

        // Stream audio chunks
        const reader = response.body.getReader();
        let chunkIndex = 0;

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Send completion signal
            ws.send(JSON.stringify({
              type: 'synthesis_complete'
            }));
            break;
          }

          // Send audio chunk
          const base64Chunk = Buffer.from(value).toString('base64');
          ws.send(JSON.stringify({
            type: 'audio_chunk',
            chunk_index: chunkIndex++,
            audio: base64Chunk
          }));
        }
      }

    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });
});

// Upgrade handler
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;

  if (pathname === '/ws-chat') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else if (pathname === '/ws-tts') {
    ttsWss.handleUpgrade(request, socket, head, (ws) => {
      ttsWss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});
```

**Step 6.1.2: สร้าง Hook สำหรับ Streaming TTS**

```typescript
// สร้างไฟล์ใหม่: apps/demo/src/liveavatar/useWebSocketTTS.ts

import { useState, useRef, useCallback } from 'react';

interface TTSConfig {
  voiceId?: string;
  modelId?: string;
  onAudioChunk?: (chunk: string, index: number) => void;
  onComplete?: () => void;
  onError?: (error: any) => void;
}

export function useWebSocketTTS(
  wsUrl: string = 'ws://localhost:3001/ws-tts',
  config: TTSConfig = {}
) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioChunksRef = useRef<string[]>([]);

  // Connect
  const connect = useCallback(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to TTS WebSocket');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'audio_chunk':
          audioChunksRef.current.push(message.audio);
          config.onAudioChunk?.(message.audio, message.chunk_index);
          break;

        case 'synthesis_complete':
          setIsSynthesizing(false);
          config.onComplete?.();
          break;

        case 'error':
          console.error('TTS error:', message.error);
          setIsSynthesizing(false);
          config.onError?.(message.error);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      config.onError?.(error);
    };

    ws.onclose = () => {
      console.log('Disconnected from TTS');
      setIsConnected(false);
    };
  }, [wsUrl, config]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Synthesize text
  const synthesize = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    audioChunksRef.current = [];
    setIsSynthesizing(true);

    wsRef.current.send(JSON.stringify({
      type: 'synthesize',
      text,
      voice_id: config.voiceId || 'pqHfZKP75CvOlQylNhV4',
      model_id: config.modelId || 'eleven_v3'
    }));
  }, [config.voiceId, config.modelId]);

  // Get all audio chunks combined
  const getAudio = useCallback(() => {
    return audioChunksRef.current.join('');
  }, []);

  return {
    isConnected,
    isSynthesizing,
    connect,
    disconnect,
    synthesize,
    getAudio
  };
}
```

**Step 6.1.3: ใช้ WebSocket TTS กับ Avatar**

```typescript
// ตัวอย่างการใช้งานร่วมกับ Avatar

function VoiceChat({ session }: { session: LiveAvatarSession }) {
  const tts = useWebSocketTTS('ws://localhost:3001/ws-tts', {
    voiceId: 'pqHfZKP75CvOlQylNhV4',

    onAudioChunk: (chunk, index) => {
      // ส่ง chunk ไปยัง Avatar ทันที (streaming)
      session.sendCommand({
        type: 'agent.speak',
        event_id: 'streaming-tts',
        audio: chunk
      });
    },

    onComplete: () => {
      // Signal end of speech
      session.sendCommand({
        type: 'agent.speak_end',
        event_id: 'streaming-tts'
      });
    }
  });

  const handleSpeak = async (text: string) => {
    // เริ่ม TTS streaming
    tts.synthesize(text);
  };

  return (
    <div>
      <button onClick={() => handleSpeak('สวัสดีครับ')}>
        Speak Thai
      </button>
    </div>
  );
}
```

### TASK 6.2: รวม Real-time STT + WebSocket Chat + Streaming TTS

**Step 6.2.1: สร้าง Complete Voice-to-Voice System**

```typescript
// สร้างไฟล์ใหม่: apps/demo/src/liveavatar/useCompleteVoiceChat.ts

import { useElevenLabsRealtimeSTT } from './useElevenLabsRealtimeSTT';
import { useWebSocketChat } from './useWebSocketChat';
import { useWebSocketTTS } from './useWebSocketTTS';

export function useCompleteVoiceChat(session: LiveAvatarSession) {
  const [isActive, setIsActive] = useState(false);

  // WebSocket Chat
  const chat = useWebSocketChat('ws://localhost:3001/ws-chat');

  // WebSocket TTS
  const tts = useWebSocketTTS('ws://localhost:3001/ws-tts', {
    onAudioChunk: (chunk) => {
      // Stream audio to avatar
      session.sendCommand({
        type: 'agent.speak',
        event_id: 'voice-chat',
        audio: chunk
      });
    },
    onComplete: () => {
      session.sendCommand({
        type: 'agent.speak_end',
        event_id: 'voice-chat'
      });
    }
  });

  // Realtime STT
  const stt = useElevenLabsRealtimeSTT({
    language: 'th',
    sampleRate: 16000,

    onFinalTranscript: async (userText) => {
      console.log('User said:', userText);

      // Send to chat WebSocket
      chat.sendMessage(userText);
    }
  });

  // Listen to chat responses
  useEffect(() => {
    if (chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];

      if (lastMessage.role === 'assistant') {
        // Convert to speech via TTS WebSocket
        tts.synthesize(lastMessage.content);
      }
    }
  }, [chat.messages]);

  // Start complete voice chat
  const start = useCallback(async () => {
    await stt.connect();
    await chat.connect();
    await tts.connect();
    await stt.startRecording();
    setIsActive(true);
  }, [stt, chat, tts]);

  // Stop voice chat
  const stop = useCallback(() => {
    stt.stopRecording();
    stt.disconnect();
    chat.disconnect();
    tts.disconnect();
    setIsActive(false);
  }, [stt, chat, tts]);

  return {
    isActive,
    start,
    stop,
    messages: chat.messages,
    partialText: stt.partialText,
    isSpeaking: tts.isSynthesizing
  };
}
```

**Step 6.2.2: ใช้งานใน Component**

```typescript
function CompleteVoiceChat({ session }: { session: LiveAvatarSession }) {
  const {
    isActive,
    start,
    stop,
    messages,
    partialText,
    isSpeaking
  } = useCompleteVoiceChat(session);

  return (
    <div className="voice-chat">
      <div className="controls">
        {!isActive ? (
          <button onClick={start}>Start Voice Chat</button>
        ) : (
          <button onClick={stop}>Stop Voice Chat</button>
        )}
      </div>

      <div className="status">
        <div>Active: {isActive ? 'Yes' : 'No'}</div>
        <div>Avatar Speaking: {isSpeaking ? 'Yes' : 'No'}</div>
        {partialText && <div>Listening: {partialText}</div>}
      </div>

      <div className="conversation">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'Avatar'}:</strong>
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## สรุปการทำงานทั้งระบบ

### ขั้นตอนการทำงานแบบเต็มรูปแบบ (Complete Real-time V2V)

```
┌─────────────────┐
│  User speaks    │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ ElevenLabs Realtime STT  │ ← WebSocket streaming
│ (Scribe v2)              │
└────────┬─────────────────┘
         │ Transcript
         ▼
┌──────────────────────────┐
│ OpenAI GPT-4o            │ ← WebSocket chat
│ (Chat Completion)        │
└────────┬─────────────────┘
         │ Response text
         ▼
┌──────────────────────────┐
│ ElevenLabs TTS           │ ← WebSocket streaming
│ (Text-to-Speech)         │
└────────┬─────────────────┘
         │ Audio chunks (PCM 24kHz)
         ▼
┌──────────────────────────┐
│ HeyGen Avatar            │ ← WebSocket commands
│ (Lip-sync + Video)       │
└────────┬─────────────────┘
         │ Video stream (LiveKit)
         ▼
┌──────────────────────────┐
│ User sees/hears Avatar   │
└──────────────────────────┘
```

### ความแตกต่างระหว่างโหมด

| Feature | FULL Mode | CUSTOM Mode | CUSTOM + WebSocket |
|---------|-----------|-------------|-------------------|
| **STT** | HeyGen built-in | OpenAI Whisper (batch) | ElevenLabs Scribe (realtime) |
| **AI** | HeyGen built-in | OpenAI (REST API) | OpenAI (WebSocket) |
| **TTS** | HeyGen built-in | ElevenLabs (REST API) | ElevenLabs (WebSocket streaming) |
| **Latency** | Low | Medium | Lowest |
| **Customization** | Limited | Full | Full |
| **Complexity** | Simple | Medium | Advanced |
| **Cost** | HeyGen only | HeyGen + OpenAI + ElevenLabs | Same |
| **Real-time** | Yes | Partial | Full |

---

## การรัน WebSocket Server

### สร้าง Package Script

```json
// เพิ่มใน apps/demo/package.json

{
  "scripts": {
    "dev": "next dev",
    "ws-server": "tsx server/websocket-server.ts",
    "dev:full": "concurrently \"pnpm dev\" \"pnpm ws-server\""
  },
  "devDependencies": {
    "ws": "^8.14.2",
    "tsx": "^4.7.0",
    "concurrently": "^8.2.2"
  }
}
```

### รันทั้งระบบ

```bash
# ติดตั้ง dependencies เพิ่มเติม
pnpm add -D ws tsx concurrently @types/ws

# รันทั้ง Next.js และ WebSocket server พร้อมกัน
pnpm dev:full
```

---

## Environment Variables ที่ต้องเพิ่ม

```env
# ElevenLabs Realtime STT
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# HeyGen
LIVEAVATAR_API_KEY=your_heygen_api_key
LIVEAVATAR_AVATAR_ID=dd73ea75-1218-4ef3-92ce-606d5f7fbc0a
```

---

## ข้อควรระวัง

1. **Token Expiration**: ElevenLabs single-use token หมดอายุใน 15 นาที - ต้อง refresh
2. **WebSocket Reconnection**: ต้องมี retry logic สำหรับการ reconnect
3. **Audio Format**: ต้องแน่ใจว่าใช้ PCM 24kHz สำหรับ Avatar
4. **Chunk Size**: ส่ง audio เป็น chunks ๆ ละ 20ms (960 bytes)
5. **Error Handling**: ต้องจัดการ error ทุก phase
6. **Rate Limiting**: ระวัง API rate limits ของทุกบริการ
7. **Cost**: ระบบนี้ใช้ 3 บริการพร้อมกัน - ต้องคำนวณ cost

---

## อ้างอิง

- [HeyGen LiveAvatar Docs](https://docs.heygen.com/docs/liveavatar)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [ElevenLabs Docs](https://elevenlabs.io/docs)
- [ElevenLabs Realtime STT](https://elevenlabs.io/docs/cookbooks/speech-to-text/streaming)
- [LiveKit Docs](https://docs.livekit.io)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
