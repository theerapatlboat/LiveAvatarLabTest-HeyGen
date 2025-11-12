# Voice-to-Voice Real-time Communication System
**HeyGen LiveAvatar + OpenAI + ElevenLabs Integration**

---

## 📊 IMPLEMENTATION STATUS SUMMARY

### ระดับความพร้อม: **70% พร้อมใช้งาน** ✅

| Phase | Status | Progress | Ready for Production |
|-------|--------|----------|---------------------|
| **Phase 1**: Session Management | ✅ สำเร็จ | 100% | ✅ YES |
| **Phase 2**: Voice Chat (FULL) | ✅ สำเร็จ | 100% | ✅ YES |
| **Phase 3**: Custom Voice Chat | ✅ สำเร็จ | 100% | ✅ YES |
| **Phase 4**: Realtime STT | ⚠️ ยังไม่สำเร็จ | 0% | ❌ NO |
| **Phase 5**: WebSocket Chat | ⚠️ ยังไม่สำเร็จ | 0% | ❌ NO |
| **Phase 6**: WebSocket TTS | ⚠️ ยังไม่สำเร็จ | 0% | ❌ NO |

### สิ่งที่พร้อมใช้งาน (Production Ready)

✅ **โหมด FULL** - Voice-to-Voice สมบูรณ์ด้วย HeyGen built-in AI
- Latency: ~1-2 วินาที
- ใช้งานได้ทันที

✅ **โหมด CUSTOM + REST APIs** - Voice-to-Voice แบบปรับแต่งได้
- Pipeline: User Speech → Whisper STT → OpenAI Chat → ElevenLabs TTS → Avatar
- Latency: ~3-5 วินาที
- ปรับแต่ง AI และเสียงได้เต็มที่

### สิ่งที่ยังต้องพัฒนา (Need Implementation)

⚠️ **Phase 4-6**: Real-time WebSocket Features
- ElevenLabs Realtime STT (ไม่มี API endpoint และ Hook)
- WebSocket Chat Server (ไม่มี Custom Server)
- WebSocket Streaming TTS (ไม่มี Custom Server)
- Total Effort: ~18-25 ชั่วโมง

### การใช้งานปัจจุบัน

**สำหรับโปรเจ็คที่ยอมรับ Latency 3-5 วินาที:**
```bash
pnpm dev
# เปิด http://localhost:3000
# เลือก CUSTOM mode → ใช้งานได้เลย
```

**สำหรับโปรเจ็คที่ต้องการ Real-time (<1 วินาที):**
- ต้องทำ Phase 4-6 ให้เสร็จก่อน
- ดูรายละเอียดด้านล่าง

---

## สรุปหลักการทำงาน

โปรเจ็คนี้เป็นระบบสนทนา Voice-to-Voice แบบ Real-time ที่ใช้ HeyGen LiveAvatar เป็น Avatar หลัก โดยรองรับ 2 โหมด:

### โหมด FULL ✅ (พร้อมใช้งาน)
- HeyGen จัดการทุกอย่าง (STT, AI, TTS, Lip-sync)
- เหมาะสำหรับการใช้งานที่ต้องการความง่ายและรวดเร็ว
- Latency: 1-2 วินาที

### โหมด CUSTOM ✅ (พร้อมใช้งาน)
- ผู้ใช้ควบคุม AI (OpenAI GPT) และ TTS (ElevenLabs)
- HeyGen ทำหน้าที่แค่ Video Streaming และ Lip-sync
- เหมาะสำหรับการปรับแต่งบุคลิกภาพและเสียงของ Avatar
- Latency: 3-5 วินาที (REST APIs)

### โหมด CUSTOM + WebSocket ⚠️ (ยังไม่พร้อม - ต้องพัฒนา Phase 4-6)
- ใช้ WebSocket แทน REST APIs
- Latency: <1 วินาที (Real-time streaming)
- ต้องการ Custom WebSocket Server

## เทคโนโลยีหลักที่ใช้

| บริการ | หน้าที่ | Implementation Status | เอกสาร |
|--------|---------|---------------------|---------|
| **HeyGen LiveAvatar** | Video Streaming, Lip-sync Animation | ✅ พร้อมใช้งาน | https://api.liveavatar.com |
| **OpenAI Whisper** | Speech-to-Text (CUSTOM mode) | ✅ พร้อมใช้งาน | https://platform.openai.com/docs/guides/speech-to-text |
| **OpenAI GPT-4** | AI Conversation (CUSTOM mode) | ✅ พร้อมใช้งาน | https://platform.openai.com/docs/guides/chat |
| **ElevenLabs** | Text-to-Speech (CUSTOM mode) | ✅ พร้อมใช้งาน | https://elevenlabs.io/docs |
| **ElevenLabs Scribe** | Real-time Speech-to-Text | ⚠️ ยังไม่ได้ใช้งาน | https://elevenlabs.io/docs/cookbooks/speech-to-text/streaming |
| **LiveKit** | WebRTC Video Streaming | ✅ พร้อมใช้งาน | https://docs.livekit.io |
| **WebSocket** | Real-time Command/Event Communication | ⚠️ ใช้บางส่วน (HeyGen) | - |

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
# HeyGen LiveAvatar (จำเป็น)
LIVEAVATAR_API_KEY=your_heygen_api_key
LIVEAVATAR_AVATAR_ID=dd73ea75-1218-4ef3-92ce-606d5f7fbc0a

# สำหรับ FULL mode (optional)
LIVEAVATAR_VOICE_ID=your_voice_id
LIVEAVATAR_CONTEXT_ID=your_context_id
LIVEAVATAR_LANGUAGE=en

# สำหรับ CUSTOM mode (จำเป็น)
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

## PHASE 1: Session Management ✅ พร้อมใช้งาน

**Status:** ✅ สำเร็จแล้ว - ทำงานได้ทั้ง FULL และ CUSTOM mode

### การทำงาน

Phase นี้จัดการ Session lifecycle ทั้งหมด:

1. **Start Session (FULL/CUSTOM Mode)** - สร้าง session token จาก HeyGen API
   - FULL Mode: มี avatar_persona (voice_id, context_id, language)
   - CUSTOM Mode: ไม่มี avatar_persona (ควบคุมเอง)

2. **Keep Session Alive** - ต่ออายุ session ทุก 5 นาที (ป้องกัน timeout)

3. **Stop Session** - ปิด session และ cleanup resources

4. **WebSocket Connection** - เชื่อมต่อ WebSocket สำหรับ CUSTOM mode (ส่งคำสั่งควบคุม Avatar)

### Files Implemented

- API: `apps/demo/app/api/start-session/route.ts` ✅
- API: `apps/demo/app/api/start-custom-session/route.ts` ✅
- API: `apps/demo/app/api/keep-session-alive/route.ts` ✅
- API: `apps/demo/app/api/stop-session/route.ts` ✅
- Hook: `apps/demo/src/liveavatar/useSession.ts` ✅

### การทดสอบ

```bash
# 1. ทดสอบด้วย Postman
POST http://localhost:3000/api/start-session

# 2. ทดสอบด้วย HTML (Optional)
# สร้างไฟล์: public/test-session-lifecycle.html
# เปิด: http://localhost:3000/test-session-lifecycle.html

# 3. ทดสอบในแอพหลัก
pnpm dev
# เปิด http://localhost:3000 → Start Session
```

---

## PHASE 2: Voice Chat (FULL Mode) ✅ พร้อมใช้งาน

**Status:** ✅ สำเร็จแล้ว - ใช้งานได้เต็มรูปแบบ

### การทำงาน

FULL Mode ใช้ HeyGen จัดการ Voice Chat ทั้งหมด:

1. **Voice Chat Start** - เริ่มต้น voice chat พร้อม microphone access
2. **Real-time STT** - HeyGen แปลงเสียงเป็นข้อความ
3. **AI Response** - HeyGen generate คำตอบด้วย built-in AI
4. **TTS & Lip-sync** - HeyGen สร้างเสียงและทำ lip-sync
5. **Microphone Control** - Mute/Unmute/Stop

### Flow

```
User Speaks → HeyGen STT → HeyGen AI → HeyGen TTS → Avatar Speaks
           (All handled by HeyGen internally)
```

### Files Implemented

- Hook: `apps/demo/src/liveavatar/useVoiceChat.ts` ✅
- Component: `apps/demo/src/components/LiveAvatarSession.tsx` ✅

### การทดสอบ

```bash
pnpm dev
# เปิด http://localhost:3000
# 1. เลือก "FULL Mode"
# 2. กด "Start Session"
# 3. กด "Start Voice Chat"
# 4. พูดอะไรก็ได้ → Avatar ควรตอบกลับ
```

---

## PHASE 3: Custom Voice Chat (CUSTOM Mode) ✅ พร้อมใช้งาน

**Status:** ✅ สำเร็จแล้ว - ใช้งานได้เต็มรูปแบบ

### การทำงาน

CUSTOM Mode ให้ผู้ใช้ควบคุม AI และ TTS เอง:

1. **Audio Recording** - บันทึกเสียงด้วย Web Audio API (AudioWorklet)
2. **Speech-to-Text** - OpenAI Whisper แปลงเสียงเป็นข้อความ (batch)
3. **AI Chat** - OpenAI GPT-4o-mini generate คำตอบ
4. **Text-to-Speech** - ElevenLabs สร้างเสียง (PCM 24kHz)
5. **Avatar Lip-sync** - ส่งเสียงไป HeyGen ผ่าน WebSocket (chunks 20ms)

### Flow

```
User Speaks → AudioWorklet → Whisper STT → OpenAI Chat → ElevenLabs TTS → Avatar Speaks
                                                                            (WebSocket chunks)
```

### Files Implemented

- Hook: `apps/demo/src/liveavatar/useCustomVoiceChat.ts` ✅
- Hook: `apps/demo/src/liveavatar/useTextChat.ts` ✅
- API: `apps/demo/app/api/openai-whisper-stt/route.ts` ✅
- API: `apps/demo/app/api/openai-chat-complete/route.ts` ✅
- API: `apps/demo/app/api/elevenlabs-text-to-speech/route.ts` ✅
- Audio Processor: `apps/demo/public/audio-processor.js` ✅
- SDK: `packages/js-sdk/src/audio_utils.ts` ✅

### การทดสอบ

```bash
pnpm dev
# เปิด http://localhost:3000
# 1. เลือก "CUSTOM Mode"
# 2. กด "Start Session"
# 3. กด "Start Recording" (Push-to-talk)
# 4. พูดอะไรก็ได้
# 5. กด "Stop Recording"
# 6. ระบบจะ: STT → AI → TTS → Avatar พูด
```

### API Testing

```bash
# Test Whisper STT
POST http://localhost:3000/api/openai-whisper-stt
Content-Type: multipart/form-data
Body: audio file

# Test OpenAI Chat
POST http://localhost:3000/api/openai-chat-complete
Content-Type: application/json
Body: {"message": "สวัสดีครับ"}

# Test ElevenLabs TTS
POST http://localhost:3000/api/elevenlabs-text-to-speech
Content-Type: application/json
Body: {"text": "สวัสดีครับ"}
```

---

## PHASE 4: ElevenLabs Realtime Speech-to-Text Integration 🔄 กำลังดำเนินการ

**Status:** 🔄 **กำลังดำเนินการ** - TASK 4.1 เสร็จแล้ว (33% complete)
**Progress:**
- ✅ TASK 4.1: Single-Use Token API (สำเร็จ)
- ⚠️ TASK 4.2: React Hook (ยังไม่ได้ทำ)
- ⚠️ TASK 4.3: Integration (ยังไม่ได้ทำ)

**Estimated Remaining Effort:** 3-4 ชั่วโมง

### ทำไมต้องมี Phase นี้?

Phase 3 ใช้ OpenAI Whisper แบบ **batch** (ต้องรอบันทึกเสียงเสร็จก่อน) ทำให้มี latency สูง (3-5 วินาที)

Phase 4 จะใช้ ElevenLabs Scribe **real-time streaming** ทำให้:
- ✅ มี partial transcripts (เห็นข้อความแบบ real-time ขณะพูด)
- ✅ ลด latency เหลือ <500ms
- ✅ ประสบการณ์ดีกว่า (ไม่ต้องรอ)

### สิ่งที่ต้องทำ

1. ✅ **API Endpoint**: `/api/elevenlabs-stt-token` - **สำเร็จแล้ว**
   - Generate single-use token สำหรับ WebSocket authentication
   - Token หมดอายุใน 15 นาที
   - HTML test page: `http://localhost:3000/test-elevenlabs-stt-token.html`

2. ⚠️ **React Hook**: `apps/demo/src/liveavatar/useElevenLabsRealtimeSTT.ts` - **ยังไม่ได้ทำ**
   - Connect WebSocket to ElevenLabs Scribe API
   - Stream audio จาก microphone
   - Handle partial/final transcripts

3. ⚠️ **Integration**: เชื่อมต่อกับ Avatar และ OpenAI Chat - **ยังไม่ได้ทำ**

### Architecture

```
┌──────────────┐
│ Microphone   │
└──────┬───────┘
       │ (Web Audio API)
       ▼
┌──────────────────────┐
│ AudioWorklet         │
│ (PCM 16kHz)          │
└──────┬───────────────┘
       │ (Real-time chunks)
       ▼
┌──────────────────────────────┐
│ ElevenLabs WebSocket         │ ← wss://api.elevenlabs.io/v1/speech-to-text/realtime
│ (Scribe v2 Realtime)         │
└──────┬───────────────────────┘
       │
       ├─→ partial_transcript (ขณะพูด)
       └─→ committed_transcript (พูดเสร็จ)
```

### TASK 4.1: สร้าง API Endpoint สำหรับ Single-Use Token ✅ สำเร็จแล้ว

**Status:** ✅ **สำเร็จแล้ว** - API endpoint พร้อมใช้งาน

**ไฟล์ที่สร้าง:** `apps/demo/app/api/elevenlabs-stt-token/route.ts` ✅

```typescript
import { NextResponse } from 'next/server';
import { ELEVENLABS_API_KEY } from '../secrets';

export async function POST() {
  try {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
      {
        method: 'POST',
        headers: { 'xi-api-key': ELEVENLABS_API_KEY }
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

**การทดสอบ:**

1. **ด้วย HTML Test Page (แนะนำ):**
```bash
# รันโปรเจ็ค
pnpm dev

# เปิด test page
http://localhost:3000/test-elevenlabs-stt-token.html

# คลิก "Generate Token" → ดูผลลัพธ์และ countdown
```

2. **ด้วย Postman:**
```bash
POST http://localhost:3000/api/elevenlabs-stt-token

# Expected Response:
{
  "token": "eyJhbGci...",
  "expires_at": "2025-01-15T10:30:00Z"
}
```

**สิ่งที่ได้:**
- ✅ API endpoint ที่สร้าง single-use token
- ✅ Token หมดอายุอัตโนมัติใน 15 นาที
- ✅ HTML test page พร้อม countdown timer
- ✅ รักษา API key ไว้บน backend (ปลอดภัย)

---

### TASK 4.2: สร้าง React Hook สำหรับ Realtime STT

**สร้างไฟล์ใหม่:** `apps/demo/src/liveavatar/useElevenLabsRealtimeSTT.ts`

```typescript
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

  const connect = useCallback(async () => {
    try {
      // 1. Get token from backend
      const tokenRes = await fetch('/api/elevenlabs-stt-token', {
        method: 'POST'
      });
      const { token } = await tokenRes.json();

      // 2. Build WebSocket URL
      const params = new URLSearchParams({
        model_id: 'scribe_v2_realtime',
        language_code: config.language || 'th',
        audio_format: `pcm_${config.sampleRate || 16000}`,
        commit_strategy: 'vad', // Auto-commit on silence
        vad_silence_threshold_secs: '1.0',
        vad_threshold: '0.5'
      });
      const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?${params}`;

      // 3. Connect WebSocket
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
            console.log('Session started');
            break;

          case 'partial_transcript':
            setPartialText(message.text);
            config.onPartialTranscript?.(message.text);
            break;

          case 'committed_transcript':
            setFinalText(prev => prev + ' ' + message.text);
            config.onFinalTranscript?.(message.text);
            setPartialText('');
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

      // Handle audio chunks - Send to ElevenLabs
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

  const stopRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

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

  const disconnect = useCallback(() => {
    stopRecording();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, [stopRecording]);

  return {
    isConnected,
    isRecording,
    partialText,
    finalText,
    connect,
    disconnect,
    startRecording,
    stopRecording
  };
}
```

---

### TASK 4.3: Integration กับ Avatar

**ใช้งาน Hook ใน Component:**

```typescript
// ใน LiveAvatarSession component

import { useElevenLabsRealtimeSTT } from '../liveavatar/useElevenLabsRealtimeSTT';

function LiveAvatarSession() {
  const stt = useElevenLabsRealtimeSTT({
    language: 'th',
    sampleRate: 16000,

    onPartialTranscript: (text) => {
      // แสดง real-time transcript
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
      <button onClick={stt.connect}>Connect STT</button>
      <button onClick={stt.startRecording}>Start Recording</button>
      <button onClick={stt.stopRecording}>Stop Recording</button>
      <button onClick={stt.disconnect}>Disconnect</button>

      <div>Partial: {stt.partialText}</div>
      <div>Final: {stt.finalText}</div>
    </div>
  );
}
```

---

### Testing Phase 4

**1. Test Token Generation:**
```bash
# Postman
POST http://localhost:3000/api/elevenlabs-stt-token

# Expected: { "token": "...", "expires_at": "..." }
```

**2. Test WebSocket Connection:**
```bash
# Install wscat
npm install -g wscat

# Get token
curl -X POST http://localhost:3000/api/elevenlabs-stt-token

# Connect
wscat -c "wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime&language_code=th&audio_format=pcm_16000&commit_strategy=vad"

# Send auth
{"message_type":"auth","token":"your_token_here"}

# Expected: {"message_type":"session_started",...}
```

**3. Test Full Integration:**
```bash
pnpm dev
# เปิด http://localhost:3000
# เลือก CUSTOM Mode
# ใช้ Realtime STT button
# ต้องเห็น partial transcripts แบบ real-time
```

---

## PHASE 5: WebSocket Integration for OpenAI Chat ⚠️ ยังไม่ได้ทำ

**Status:** ⚠️ **ยังไม่ได้ Implement** - ต้องสร้าง Custom WebSocket Server
**Estimated Effort:** 5-7 ชั่วโมง

### ทำไมต้องมี Phase นี้?

Phase 3 ใช้ OpenAI Chat แบบ **REST API** (request/response แยกกัน) ทำให้:
- ❌ ต้อง establish connection ทุกครั้ง (overhead)
- ❌ ไม่เก็บ conversation history บน server
- ❌ Latency สูงกว่า WebSocket

Phase 5 จะใช้ **WebSocket** ทำให้:
- ✅ Connection คงอยู่ตลอด (persistent connection)
- ✅ ลด latency (ไม่ต้อง handshake ซ้ำ)
- ✅ Server จัดการ conversation history

### สิ่งที่ยังต้องสร้าง

1. ❌ **Custom WebSocket Server**: `apps/demo/server/websocket-server.ts`
2. ❌ **React Hook**: `apps/demo/src/liveavatar/useWebSocketChat.ts`
3. ❌ **Package Scripts**: อัพเดต `package.json` สำหรับรัน WebSocket server

**หมายเหตุ:** Next.js ไม่รองรับ WebSocket natively - ต้องสร้าง custom server แยก

### Architecture

```
┌─────────────┐
│ React App   │
│ (Port 3000) │
└──────┬──────┘
       │ (WebSocket)
       ▼
┌──────────────────────┐
│ Custom WS Server     │ ← ws://localhost:3001
│ (Port 3001)          │
└──────┬───────────────┘
       │ (HTTP)
       ▼
┌──────────────────────┐
│ OpenAI API           │
│ (Chat Completions)   │
└──────────────────────┘
```

### TASK 5.1: ติดตั้ง Dependencies

```bash
pnpm add -D ws @types/ws tsx concurrently
```

---

### TASK 5.2: สร้าง Custom WebSocket Server

**สร้างไฟล์ใหม่:** `apps/demo/server/websocket-server.ts`

```typescript
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

---

### TASK 5.3: อัพเดต package.json

**แก้ไข:** `apps/demo/package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "ws-server": "tsx server/websocket-server.ts",
    "dev:full": "concurrently \"pnpm dev\" \"pnpm ws-server\""
  }
}
```

**รัน:**
```bash
# Terminal 1: Next.js
pnpm dev

# Terminal 2: WebSocket server
pnpm ws-server

# หรือรันพร้อมกัน
pnpm dev:full
```

---

### TASK 5.4: สร้าง React Hook

**สร้างไฟล์ใหม่:** `apps/demo/src/liveavatar/useWebSocketChat.ts`

```typescript
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

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

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

**ใช้งาน:**

```typescript
import { useWebSocketChat } from '../liveavatar/useWebSocketChat';

function ChatInterface() {
  const { isConnected, messages, sendMessage, reset } = useWebSocketChat();
  const [input, setInput] = useState('');

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>

      {messages.map((msg, i) => (
        <div key={i}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}

      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={() => sendMessage(input)}>Send</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

---

### Testing Phase 5

**1. Test WebSocket Server:**
```bash
# Install wscat
npm install -g wscat

# Start servers
pnpm dev:full

# Connect
wscat -c ws://localhost:3001

# Send message
{"type":"chat","text":"สวัสดีครับ","system_prompt":"You are helpful."}

# Expected: {"type":"chat_response","text":"สวัสดีครับ..."}
```

**2. Test in App:**
```bash
pnpm dev:full
# เปิด http://localhost:3000
# ใช้ WebSocket Chat feature
# ควรเห็นการสนทนาแบบ real-time พร้อม history
```

---

## PHASE 6: WebSocket Integration for ElevenLabs TTS ⚠️ ยังไม่ได้ทำ

**Status:** ⚠️ **ยังไม่ได้ Implement** - ต้องเพิ่ม TTS endpoint ใน WebSocket Server
**Estimated Effort:** 5-7 ชั่วโมง

### ทำไมต้องมี Phase นี้?

Phase 3 ใช้ ElevenLabs TTS แบบ **REST API** (รอสร้างเสียงทั้งหมดก่อนส่ง) ทำให้:
- ❌ ต้องรอให้ TTS สร้างเสียงทั้งหมดเสร็จก่อน
- ❌ Avatar เริ่มพูดช้า (user รู้สึกว่า lag)
- ❌ Latency สูง (1-3 วินาที)

Phase 6 จะใช้ **WebSocket Streaming TTS** ทำให้:
- ✅ Avatar เริ่มพูดได้ทันทีที่ได้ audio chunk แรก
- ✅ ลด perceived latency (รู้สึกว่าเร็วขึ้น)
- ✅ Smooth playback

### สิ่งที่ยังต้องสร้าง

1. ❌ **เพิ่ม TTS WebSocket Endpoint** ใน `apps/demo/server/websocket-server.ts`
2. ❌ **React Hook**: `apps/demo/src/liveavatar/useWebSocketTTS.ts`
3. ❌ **Complete Integration Hook**: `apps/demo/src/liveavatar/useCompleteVoiceChat.ts`

### Architecture

```
┌─────────────┐
│ Text Input  │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ WS TTS Server        │ ← ws://localhost:3001/ws-tts
│ (Port 3001)          │
└──────┬───────────────┘
       │ (HTTP Streaming)
       ▼
┌──────────────────────┐
│ ElevenLabs API       │
│ (TTS Streaming)      │
└──────┬───────────────┘
       │ (Audio Chunks)
       ▼
┌──────────────────────┐
│ HeyGen Avatar        │ ← Send chunks ทันที
│ (Lip-sync)           │
└──────────────────────┘
```

### TASK 6.1: เพิ่ม TTS WebSocket Endpoint

**แก้ไข:** `apps/demo/server/websocket-server.ts`

```typescript
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();

// Chat WebSocket (existing)
const chatWss = new WebSocketServer({ noServer: true });
// ... existing chat code ...

// TTS WebSocket (NEW)
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

          // Send audio chunk to client
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

// Upgrade handler (handle multiple paths)
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;

  if (pathname === '/ws-chat') {
    chatWss.handleUpgrade(request, socket, head, (ws) => {
      chatWss.emit('connection', ws, request);
    });
  } else if (pathname === '/ws-tts') {
    ttsWss.handleUpgrade(request, socket, head, (ws) => {
      ttsWss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(3001, () => {
  console.log('WebSocket server running on port 3001');
  console.log('  /ws-chat - OpenAI Chat');
  console.log('  /ws-tts  - ElevenLabs TTS');
});
```

---

### TASK 6.2: สร้าง React Hook สำหรับ Streaming TTS

**สร้างไฟล์ใหม่:** `apps/demo/src/liveavatar/useWebSocketTTS.ts`

```typescript
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

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

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

---

### TASK 6.3: Complete Voice Chat Integration

**สร้างไฟล์ใหม่:** `apps/demo/src/liveavatar/useCompleteVoiceChat.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useElevenLabsRealtimeSTT } from './useElevenLabsRealtimeSTT';
import { useWebSocketChat } from './useWebSocketChat';
import { useWebSocketTTS } from './useWebSocketTTS';
import { LiveAvatarSession } from '@heygen/liveavatar-web-sdk';

export function useCompleteVoiceChat(session: LiveAvatarSession) {
  const [isActive, setIsActive] = useState(false);

  // WebSocket Chat
  const chat = useWebSocketChat('ws://localhost:3001/ws-chat');

  // WebSocket TTS with Avatar integration
  const tts = useWebSocketTTS('ws://localhost:3001/ws-tts', {
    onAudioChunk: (chunk) => {
      // Send chunk to avatar immediately (streaming)
      session.sendCommand({
        type: 'agent.speak',
        event_id: 'voice-chat',
        audio: chunk
      });
    },
    onComplete: () => {
      // Signal end of speech
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

  // Listen to chat responses → TTS
  useEffect(() => {
    if (chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];

      if (lastMessage.role === 'assistant') {
        // Convert to speech via TTS WebSocket (streaming)
        tts.synthesize(lastMessage.content);
      }
    }
  }, [chat.messages, tts]);

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

**ใช้งาน:**

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
    <div>
      {!isActive ? (
        <button onClick={start}>🚀 Start Real-time Voice Chat</button>
      ) : (
        <button onClick={stop}>🛑 Stop Voice Chat</button>
      )}

      <div>
        <div>Active: {isActive ? 'Yes' : 'No'}</div>
        <div>Avatar Speaking: {isSpeaking ? 'Yes' : 'No'}</div>
        {partialText && <div>Listening: {partialText}</div>}
      </div>

      <div>
        {messages.map((msg, i) => (
          <div key={i}>
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

### Testing Phase 6

**1. Test TTS WebSocket:**
```bash
# Start servers
pnpm dev:full

# Test with wscat
wscat -c ws://localhost:3001/ws-tts

# Send
{"type":"synthesize","text":"สวัสดีครับ","voice_id":"pqHfZKP75CvOlQylNhV4"}

# Expected: Multiple audio_chunk messages + synthesis_complete
```

**2. Test Complete Integration:**
```bash
pnpm dev:full
# เปิด http://localhost:3000
# เลือก CUSTOM Mode
# กด "Start Real-time Voice Chat"
# พูด → ต้องเห็น:
#   1. Partial transcripts แบบ real-time
#   2. AI response
#   3. Avatar เริ่มพูดเร็วกว่าเดิม (streaming)
```

---

## สรุปการทำงานทั้งระบบ

### Flow Diagram: Complete Real-time V2V

```
┌─────────────────┐
│  User speaks    │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ ElevenLabs Realtime STT  │ ← WebSocket streaming ⚠️ Phase 4
│ (Scribe v2)              │
└────────┬─────────────────┘
         │ Transcript
         ▼
┌──────────────────────────┐
│ OpenAI GPT-4o            │ ← WebSocket chat ⚠️ Phase 5
│ (Chat Completion)        │    (ปัจจุบันใช้ REST API ✅)
└────────┬─────────────────┘
         │ Response text
         ▼
┌──────────────────────────┐
│ ElevenLabs TTS           │ ← WebSocket streaming ⚠️ Phase 6
│ (Text-to-Speech)         │    (ปัจจุบันใช้ REST API ✅)
└────────┬─────────────────┘
         │ Audio chunks (PCM 24kHz)
         ▼
┌──────────────────────────┐
│ HeyGen Avatar            │ ← WebSocket commands ✅ พร้อมใช้งาน
│ (Lip-sync + Video)       │
└────────┬─────────────────┘
         │ Video stream (LiveKit)
         ▼
┌──────────────────────────┐
│ User sees/hears Avatar   │
└──────────────────────────┘
```

### ความแตกต่างระหว่างโหมด

| Feature | FULL Mode ✅ | CUSTOM Mode ✅ | CUSTOM + WebSocket ⚠️ |
|---------|-----------|-------------|-------------------|
| **STT** | HeyGen built-in | OpenAI Whisper (batch) | ElevenLabs Scribe (realtime) |
| **AI** | HeyGen built-in | OpenAI (REST API) | OpenAI (WebSocket) |
| **TTS** | HeyGen built-in | ElevenLabs (REST API) | ElevenLabs (WebSocket streaming) |
| **Latency** | Low (1-2s) | Medium (3-5s) | Lowest (<1s) |
| **Customization** | Limited | Full | Full |
| **Complexity** | Simple | Medium | Advanced |
| **Implementation** | ✅ Done | ✅ Done | ⚠️ Need Phase 4-6 |
| **Ready** | ✅ YES | ✅ YES | ❌ NO |

---

## 📋 TODO List สำหรับการพัฒนาต่อ

### High Priority (สำหรับ Real-time Performance)

- [ ] **Phase 4.1**: สร้าง `/api/elevenlabs-stt-token` endpoint (1-2 ชม.)
- [ ] **Phase 4.2**: สร้าง `useElevenLabsRealtimeSTT.ts` hook (3-4 ชม.)
- [ ] **Phase 4.3**: Integration testing (1 ชม.)

### Medium Priority (สำหรับ Lower Latency)

- [ ] **Phase 5.1**: สร้าง Custom WebSocket Server (2-3 ชม.)
- [ ] **Phase 5.2**: สร้าง `useWebSocketChat.ts` hook (2-3 ชม.)
- [ ] **Phase 5.3**: Integration testing (1 ชม.)

### Advanced (Complete Integration)

- [ ] **Phase 6.1**: เพิ่ม TTS WebSocket endpoint (2-3 ชม.)
- [ ] **Phase 6.2**: สร้าง `useWebSocketTTS.ts` hook (2-3 ชม.)
- [ ] **Phase 6.3**: สร้าง `useCompleteVoiceChat.ts` (2-3 ชม.)
- [ ] **Phase 6.4**: Full system integration testing (2 ชม.)

**Total Estimated Effort: 18-25 ชั่วโมง**

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
- [Testing Documentation](./TEST_V2V_PROCESS.md)
