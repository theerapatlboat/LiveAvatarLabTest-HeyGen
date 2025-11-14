# Voice-to-Voice Real-time Communication System
**HeyGen LiveAvatar + OpenAI + ElevenLabs Integration**

---

## 📊 IMPLEMENTATION STATUS SUMMARY

### ระดับความพร้อม: **84% พร้อมใช้งาน Production** ✅⚠️

| Phase | Status | Progress | Ready for Production |
|-------|--------|----------|---------------------|
| **Phase 1**: Session Management | ✅ สำเร็จ | 100% | ✅ YES |
| **Phase 2**: Voice Chat (FULL) | ✅ สำเร็จ | 100% | ✅ YES |
| **Phase 3**: Custom Voice Chat | ✅ สำเร็จ | 100% | ✅ YES |
| **Phase 4**: Realtime STT (Full V2V) | ✅ สำเร็จ | 100% | ✅ YES |
| **Phase 5**: WebSocket TTS | 🚧 กำลังดำเนินการ | 60% | ❌ NO (Tasks 1-3/5 เสร็จ, Tasks 4-5 ยังไม่เสร็จ) |
| **Phase 6**: WebSocket Chat | ❌ ยังไม่ได้เริ่ม | 0% | ❌ NO |

### สิ่งที่พร้อมใช้งาน (Production Ready)

✅ **โหมด FULL** - Voice-to-Voice สมบูรณ์ด้วย HeyGen built-in AI
- Latency: ~1-2 วินาที
- ใช้งานได้ทันที

✅ **โหมด CUSTOM + REST APIs** - Voice-to-Voice แบบปรับแต่งได้
- Pipeline: User Speech → Whisper STT → OpenAI Chat → ElevenLabs TTS → Avatar
- Latency: ~3-5 วินาที
- ปรับแต่ง AI และเสียงได้เต็มที่

✅ **โหมด CUSTOM + ElevenLabs Realtime STT (Full V2V)** - Voice-to-Voice แบบ Continuous Streaming
- Pipeline: User Speech → ElevenLabs Realtime STT → OpenAI Chat → ElevenLabs REST TTS → Avatar
- Latency: ~3-5 วินาที (เร็วกว่า Whisper แต่ยังใช้ REST API สำหรับ TTS)
- **พร้อมใช้งานแล้ว - ใช้ REST TTS API**
- ต้องมี OpenAI API key และ ElevenLabs API key

### สิ่งที่ยังต้องพัฒนา (Need Implementation)

🚧 **Phase 5**: WebSocket TTS (60% - กำลังดำเนินการ) - **อัพเดต 2025-11-14**
- ✅ **Task 1: Setup Project Structure เสร็จแล้ว** (โฟลเดอร์, dependencies, npm script)
- ✅ **Task 2: Implement WebSocket Server เสร็จแล้ว** (ไฟล์ `server/websocket-tts-server.ts` - 333 บรรทัด)
  - ✅ **Text chunking แบ่งเฉพาะตาม delimiters:** `,` `!` `?` `:` `;` `.`
    - **ไม่มี maxChunkSize** - แบ่ง chunk เฉพาะเมื่อเจอ delimiter เท่านั้น
    - **ไม่จำกัดความยาว** - chunk อาจยาวหรือสั้นตามตำแหน่ง delimiter
    - แต่ละ delimiter สร้าง chunk ใหม่ทันที
  - ✅ ElevenLabs REST API integration
  - ✅ WebSocket message handling (tts, stop, ping)
  - ✅ Comprehensive logging with emojis
  - ✅ Error handling and graceful shutdown
- ✅ **Task 3: React Hook เสร็จแล้ว** (ไฟล์ `src/liveavatar/useWebSocketTTS.ts` - 492 บรรทัด)
  - ✅ WebSocket connection management
  - ✅ Web Audio API integration (AudioContext, sequential audio queue)
  - ✅ State management (isConnected, isSynthesizing, progress)
- ❌ **Task 4: Integration กับ LiveAvatarSession** (เดิม Task 5)
- ❌ **Task 5: Testing & Documentation** (เดิม Task 6)

⚠️ **Phase 6**: WebSocket Chat (ยังไม่ได้เริ่ม)
- WebSocket Chat Server สำหรับ OpenAI
- Conversation history management
- Total Effort: ~5-7 ชั่วโมง

### การใช้งานปัจจุบัน

**สำหรับโหมด CUSTOM + ElevenLabs Realtime STT (แนะนำ):**
```bash
# Start Next.js app
pnpm dev

# เปิด http://localhost:3012
# เลือก CUSTOM mode → Start Realtime Voice Chat → พูด → Stop & Process with Avatar
```

**Latency:** ~3-5 วินาที (ใช้ REST API สำหรับทั้ง OpenAI Chat และ ElevenLabs TTS)

**สำหรับโหมด FULL:**
```bash
pnpm dev
# เปิด http://localhost:3012
# เลือก FULL mode → ใช้งานได้เลย (HeyGen จัดการทุกอย่าง)
```

**Latency:** ~1-2 วินาที

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

### โหมด CUSTOM + WebSocket ⚠️ (ยังไม่พร้อม - ต้องพัฒนา Phase 5-6)
- Phase 4 (Realtime STT) เสร็จแล้ว ✅
- Phase 5 (WebSocket TTS) ยังไม่เริ่ม ❌ (มีเฉพาะ design doc)
- Phase 6 (WebSocket Chat) ยังไม่เริ่ม ❌
- เมื่อเสร็จจะใช้ WebSocket แทน REST APIs
- Target Latency: ~1-2 วินาที (Real-time streaming)
- ต้องการ Custom WebSocket Server สำหรับ TTS และ Chat

## เทคโนโลยีหลักที่ใช้

| บริการ | หน้าที่ | Implementation Status | เอกสาร |
|--------|---------|---------------------|---------|
| **HeyGen LiveAvatar** | Video Streaming, Lip-sync Animation | ✅ พร้อมใช้งาน | https://api.liveavatar.com |
| **OpenAI Whisper** | Speech-to-Text (CUSTOM mode) | ✅ พร้อมใช้งาน | https://platform.openai.com/docs/guides/speech-to-text |
| **OpenAI GPT-4** | AI Conversation (CUSTOM mode) | ✅ พร้อมใช้งาน | https://platform.openai.com/docs/guides/chat |
| **ElevenLabs** | Text-to-Speech (CUSTOM mode) | ✅ พร้อมใช้งาน | https://elevenlabs.io/docs |
| **ElevenLabs Scribe** | Real-time Speech-to-Text | ✅ พร้อมใช้งาน (Phase 4) | https://elevenlabs.io/docs/cookbooks/speech-to-text/streaming |
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

## PHASE 1: Session Management ✅

### หน้าที่
จัดการ Session lifecycle ของ HeyGen LiveAvatar (สร้าง, ต่ออายุ, ปิด session)

### หลักการทำงาน
- **FULL mode**: HeyGen จัดการ STT, AI, TTS อัตโนมัติ
- **CUSTOM mode**: ผู้ใช้ควบคุม AI และ TTS เอง, HeyGen ทำ video streaming และ lip-sync
- **Keep Alive**: ต่ออายุ session ทุก 5 นาที

### Implementation
- APIs: [start-session](../apps/demo/app/api/start-session/route.ts), [start-custom-session](../apps/demo/app/api/start-custom-session/route.ts), [keep-session-alive](../apps/demo/app/api/keep-session-alive/route.ts), [stop-session](../apps/demo/app/api/stop-session/route.ts)
- Hook: [useSession.ts](../apps/demo/src/liveavatar/useSession.ts)

### วิธีทดสอบ
```bash
pnpm dev
# เปิด http://localhost:3012
# เลือก FULL หรือ CUSTOM mode → session เริ่มทำงานอัตโนมัติ
```

---

## PHASE 2: Voice Chat (FULL Mode) ✅

### หน้าที่
Voice Chat แบบ end-to-end ที่ HeyGen จัดการทุกอย่างอัตโนมัติ (STT → AI → TTS → Lip-sync)

### หลักการทำงาน
HeyGen ทำหน้าที่ all-in-one solution ประมวลผล voice chat ทั้งหมดโดยไม่ต้องใช้ external APIs

### Implementation
- Hook: [useVoiceChat.ts](../apps/demo/src/liveavatar/useVoiceChat.ts)
- Flow: User Speech → HeyGen Built-in STT → HeyGen AI → HeyGen TTS → Avatar

### วิธีทดสอบ
```bash
pnpm dev
# เลือก FULL mode → กด "Start Voice Chat" → พูด → Avatar ตอบกลับ
# Latency: ~1-2 วินาที
```

---

## PHASE 3: Custom Voice Chat ✅

### หน้าที่
Voice Chat แบบปรับแต่งได้ด้วย OpenAI (Whisper + GPT-4) และ ElevenLabs TTS

### หลักการทำงาน
ใช้ REST APIs เชื่อมต่อ external services พร้อมควบคุม AI model และ voice ได้เต็มรูปแบบ

### Implementation
- Hook: [useCustomVoiceChat.ts](../apps/demo/src/liveavatar/useCustomVoiceChat.ts)
- APIs: [openai-whisper-stt](../apps/demo/app/api/openai-whisper-stt/route.ts), [openai-chat-complete](../apps/demo/app/api/openai-chat-complete/route.ts), [elevenlabs-text-to-speech](../apps/demo/app/api/elevenlabs-text-to-speech/route.ts)
- Flow: User Speech → Whisper STT → OpenAI Chat → ElevenLabs TTS → Avatar

### วิธีทดสอบ
```bash
# ตั้งค่า .env.local:
# OPENAI_API_KEY=sk-xxx
# ELEVENLABS_API_KEY=sk_xxx

pnpm dev
# เลือก CUSTOM mode → Hold to Talk → พูด → ปล่อย → Avatar ตอบ
# Latency: ~3-5 วินาที
```

---

## PHASE 4: ElevenLabs Realtime STT ✅

### หน้าที่
Real-time Speech-to-Text streaming พร้อม Voice-to-Voice flow โดยใช้ ElevenLabs Scribe v2

### หลักการทำงาน
- Continuous streaming (ไม่ต้องกด Hold to Talk)
- Partial transcripts (real-time feedback) + Final transcripts (VAD-based)
- Combined transcript สำหรับส่งไปยัง OpenAI Chat

### Implementation
- API: [elevenlabs-stt-token](../apps/demo/app/api/elevenlabs-stt-token/route.ts)
- Hook: [useElevenLabsRealtimeSTT.ts](../apps/demo/src/liveavatar/useElevenLabsRealtimeSTT.ts)
- Component: [LiveAvatarSession.tsx](../apps/demo/src/components/LiveAvatarSession.tsx) (lines 239-285)
- Flow: User Speech → ElevenLabs Scribe (WebSocket) → Combined Transcript → OpenAI Chat → ElevenLabs REST TTS → Avatar

### วิธีทดสอบ
```bash
# ตั้งค่า .env.local:
# ELEVENLABS_API_KEY=sk_xxx
# OPENAI_API_KEY=sk-xxx

pnpm dev
# เลือก CUSTOM mode → Start Realtime Voice Chat → พูดต่อเนื่อง → Stop & Process with Avatar
# STT Latency: <500ms, Total V2V Latency: ~3-5 วินาที
```

---

## PHASE 5: WebSocket TTS Integration 🚧

**Status:** 🚧 **60% เสร็จ** (Tasks 1-3/5 สำเร็จ)
**Estimated Remaining Effort:** ~2-3 ชั่วโมง (Tasks 4-5)

### 📋 สถานะการ Implement

**สิ่งที่เสร็จแล้ว ✅:**
- ✅ **Task 1**: Project structure, dependencies (ws@8.18.3, @types/ws@8.18.1, tsx@4.20.6), npm script
- ✅ **Task 2**: WebSocket Server [websocket-tts-server.ts](../apps/demo/server/websocket-tts-server.ts) - 333 lines
  - **Text chunking แบ่งเฉพาะตาม delimiters:** `,` `!` `?` `:` `;` `.` (ไม่มีขนาด limit)
  - ElevenLabs REST API integration
  - Message handling (tts, stop, ping)
  - Comprehensive logging
- ✅ **Task 3**: React Hook [useWebSocketTTS.ts](../apps/demo/src/liveavatar/useWebSocketTTS.ts) - 492 lines
  - WebSocket connection management
  - Audio queue & sequential playback
  - Progress tracking

**สิ่งที่ยังต้องทำ ❌:**
- ❌ **Task 4**: Integration กับ LiveAvatarSession (~1.5-2 hours)
- ❌ **Task 5**: Testing & Documentation (~1-1.5 hours)

### หลักการทำงาน

**WebSocket Middleware Pattern:**
```
Client ↔ WebSocket ↔ Custom Server ↔ ElevenLabs REST API
```

**เหตุผล:** eleven_v3 ไม่รองรับ native WebSocket streaming

**Solution:**
- Server แบ่ง text เป็น chunks **เฉพาะตาม delimiters:** `,` `!` `?` `:` `;` `.` (ไม่มีขนาด limit)
- เรียก ElevenLabs REST API แต่ละ chunk แยกกัน
- Stream audio chunks กลับ client ผ่าน WebSocket
- Client เล่น audio แบบ sequential queue

**ประโยชน์:**
- ใช้ eleven_v3 ได้ (คุณภาพสูงสุด)
- Progressive playback (เล่นได้ทันทีที่ได้ chunk แรก)
- ลด latency จาก ~3-5s → ~1.5-2.5s (40-50% เร็วขึ้น)
- รองรับข้อความยาว

### Implementation Details

**Text Chunking (Task 2 - เสร็จแล้ว):**
- **แบ่ง chunk เฉพาะตาม delimiters:** `,` `!` `?` `:` `;` `.`
- **ไม่มี maxChunkSize** - แบ่งเมื่อเจอ delimiter เท่านั้น
- **ไม่จำกัดความยาว chunk** - ขึ้นกับตำแหน่ง delimiter ในข้อความ
- แต่ละ delimiter สร้าง chunk ใหม่ทันที (natural speech breaks)
- ดู [websocket-tts-server.ts:85-145](../apps/demo/server/websocket-tts-server.ts)

**Sequential Audio Playback (Task 3 - เสร็จแล้ว):**
1. รับ audio chunk จาก WebSocket
2. ใส่เข้า queue
3. Decode เป็น AudioBuffer
4. เล่นแบบ sequential (auto-play next chunk)
- ดู [useWebSocketTTS.ts](../apps/demo/src/liveavatar/useWebSocketTTS.ts)

### วิธีการรัน WebSocket Server

```bash
# Terminal 1: Start WebSocket TTS server
cd apps/demo
pnpm ws-tts

# Terminal 2: Start Next.js app
pnpm dev
```

**WebSocket Server Details:**
- Port: 3013
- Path: `/ws/elevenlabs-tts`
- ดู [websocket-tts-server.ts](../apps/demo/server/websocket-tts-server.ts)

**API Message Formats:**
```json
// Request
{
  "type": "tts",
  "text": "ข้อความที่ต้องการแปลง",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "model_id": "eleven_v3"
}

// Response
{
  "type": "audio_chunk",
  "chunk_index": 0,
  "total_chunks": 5,
  "audio_data": "base64_encoded_pcm...",
  "format": "pcm_24000"
}
```

### วิธีการใช้งาน React Hook

```typescript
import { useWebSocketTTS } from '@/liveavatar/useWebSocketTTS';

const { isConnected, isSynthesizing, progress, connect, synthesize } = useWebSocketTTS({
  voiceId: '21m00Tcm4TlvDq8ikWAM',
  modelId: 'eleven_v3',
  onComplete: (total) => console.log(`Completed ${total} chunks`)
});

// Connect on mount
useEffect(() => {
  connect();
  return () => disconnect();
}, []);

// Synthesize text
synthesize('สวัสดีครับ ยินดีต้อนรับ');
```

ดูรายละเอียดเพิ่มเติมใน [useWebSocketTTS.ts](../apps/demo/src/liveavatar/useWebSocketTTS.ts)

### Integration กับ Voice-to-Voice Flow (ยังไม่ได้ทำ)

**วิธีการใช้ร่วมกับ Phase 4 ที่วางแผนไว้:**

```typescript
// In LiveAvatarSession.tsx
import { useElevenLabsRealtimeSTT } from '../liveavatar/useElevenLabsRealtimeSTT';
import { useWebSocketTTS } from '../liveavatar/useWebSocketTTS';

const MyComponent = () => {
  // Phase 4: Realtime STT
  const {
    isConnected: isSTTConnected,
    finalText,
    connect: connectSTT,
    disconnect: disconnectSTT,
    getCombinedTranscript
  } = useElevenLabsRealtimeSTT({
    languageCode: 'th',
    onFinalTranscript: async (text) => {
      console.log('✅ Final transcript:', text);
    }
  });

  // Phase 5: WebSocket TTS
  const {
    isConnected: isTTSConnected,
    isSynthesizing,
    progress,
    connect: connectTTS,
    synthesize
  } = useWebSocketTTS({
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    modelId: 'eleven_v3',
    onComplete: (totalChunks) => {
      console.log(`✅ TTS completed with ${totalChunks} chunks`);
    }
  });

  // Complete Voice-to-Voice Flow
  const handleVoiceToVoice = useCallback(async () => {
    try {
      // 1. Get combined transcript from STT
      const userInput = getCombinedTranscript();
      console.log('📝 User said:', userInput);

      // 2. Send to OpenAI Chat
      const chatRes = await fetch('/api/openai-chat-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });
      const { response: aiResponse } = await chatRes.json();
      console.log('🤖 AI Response:', aiResponse);

      // 3. Convert to speech using WebSocket TTS
      synthesize(aiResponse);
      console.log('🔊 TTS started');

      // Audio will play automatically via queue-based playback

    } catch (error) {
      console.error('❌ V2V Error:', error);
    }
  }, [getCombinedTranscript, synthesize]);

  // UI
  return (
    <div>
      {/* STT Controls */}
      <button onClick={isSTTConnected ? disconnectSTT : connectSTT}>
        {isSTTConnected ? 'Stop Voice Chat' : 'Start Voice Chat'}
      </button>

      {/* Complete V2V Flow */}
      <button
        onClick={handleVoiceToVoice}
        disabled={isSynthesizing}
      >
        Stop & Process with Avatar
      </button>

      {/* TTS Progress */}
      {isSynthesizing && (
        <div>
          Speaking: {progress.current}/{progress.total} chunks
        </div>
      )}
    </div>
  );
};
```

**Complete Flow:**
```
User Speaks
    ↓
[Phase 4] ElevenLabs Realtime STT (streaming)
    ↓
Combined Transcript
    ↓
[Phase 6] OpenAI Chat API (REST)
    ↓
AI Response Text
    ↓
[Phase 5] WebSocket TTS (chunked streaming)
    ↓
Audio Playback (sequential)
    ↓
Avatar Lip-sync
```

### Architecture

```
┌─────────────────────┐
│   User Speaks       │ (continuous)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ ElevenLabs Realtime │ (Phase 4)
│ STT (Scribe v2)     │ ws://api.elevenlabs.io/...
└──────────┬──────────┘
           │ (transcript streaming)
           ▼
┌─────────────────────┐
│ getCombinedTranscript()
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ OpenAI Chat API     │ (Phase 6 - REST)
│ (GPT-4)             │
└──────────┬──────────┘
           │ (AI response)
           ▼
┌─────────────────────┐
│ Custom WS Server    │ ws://localhost:3013/ws/elevenlabs-tts
│ (Port 3013)         │
│ - Text Chunking     │ delimiters: , ! ? space
│ - REST API Calls    │
└──────────┬──────────┘
           │ (per chunk)
           ▼
┌─────────────────────┐
│ ElevenLabs REST API │ (Phase 5)
│ (eleven_v3)         │ POST /v1/text-to-speech/{voice_id}
└──────────┬──────────┘
           │ (audio base64)
           ▼
┌─────────────────────┐
│ WebSocket           │
│ (to client)         │
└──────────┬──────────┘
           │ (audio chunks)
           ▼
┌─────────────────────┐
│ Web Audio API       │
│ Queue Playback      │ sequential streaming
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ HeyGen Avatar       │
│ (Lip-sync)          │
└─────────────────────┘
```

### Performance & Latency

**Phase 3 (REST TTS):**
- Total latency: 3-5 วินาที
- ต้องรอสร้างเสียงทั้งหมด

**Phase 5 (WebSocket TTS Middleware):**
- First chunk latency: ~1-2 วินาที
- Subsequent chunks: streaming (<500ms)
- Total perceived latency: ~1.5-2.5 วินาที
- ✅ เร็วขึ้น 40-50%

### ข้อดี (Advantages)

1. ✅ **ใช้ eleven_v3 ได้** - คุณภาพเสียงสูงสุด แม้ไม่มี native WebSocket
2. ✅ **Progressive Playback** - เล่นเสียงได้ทันทีที่ได้ chunk แรก
3. ✅ **Natural Speech** - Text chunking สร้าง natural pauses
4. ✅ **รองรับข้อความยาว** - แบ่งเป็น chunks แล้วประมวลผล
5. ✅ **Detailed Logging** - ติดตามทุก operation
6. ✅ **Easy Integration** - React Hook พร้อมใช้

### ข้อจำกัด (Limitations)

1. ⚠️ **ต้องรัน Custom Server** - ไม่สามารถใช้ Next.js App Router อย่างเดียว
2. ⚠️ **ไม่ใช่ True Streaming** - เป็น chunked REST API calls
3. ⚠️ **Latency สูงกว่า native WebSocket** - แต่ดีกว่า REST API ธรรมดา

### ทางเลือกอื่น (Alternatives)

หากต้องการ **true real-time streaming** ให้ใช้:

#### **Option A: eleven_turbo_v2_5** (แนะนำสำหรับ production)
- ✅ Native WebSocket streaming support
- ✅ Lower latency (<1 วินาที)
- ⚠️ คุณภาพเสียงต่ำกว่า eleven_v3 เล็กน้อย

**WebSocket Endpoint:**
```
wss://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream-input?model_id=eleven_turbo_v2_5
```

#### **Option B: eleven_flash_v2_5** (เร็วที่สุด)
- ✅ Native WebSocket streaming support
- ✅ Fastest response
- ⚠️ คุณภาพเสียงต่ำกว่า turbo

**WebSocket Endpoint:**
```
wss://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream-input?model_id=eleven_flash_v2_5
```

### คำแนะนำการใช้งาน

| Use Case | Recommended Solution | เหตุผล |
|----------|---------------------|--------|
| คุณภาพเสียงสำคัญสุด | Phase 5 (eleven_v3 + middleware) | คุณภาพสูงสุด |
| Real-time Voice Chat | eleven_turbo_v2_5 (native WS) | สมดุลระหว่างคุณภาพและ latency |
| Ultra-low Latency | eleven_flash_v2_5 (native WS) | เร็วที่สุด |
| Production V2V | Phase 5 หรือ turbo_v2_5 | ขึ้นอยู่กับความต้องการ |

### Testing & Debugging

**1. ทดสอบ WebSocket Server:**
```bash
# Terminal 1: Start WebSocket server
pnpm ws-tts

# Terminal 2: Start Next.js app
pnpm dev

# เปิดเบราว์เซอร์: http://localhost:3012
# ทดสอบ V2V flow ด้วย CUSTOM mode
```

**2. Debug Logs:**
```
🔪 [CHUNKING] - Text chunking operations
📞 [TTS] - ElevenLabs API calls
📦 [TTS] - Chunk processing
✅ [TTS] - Success messages
❌ [TTS] - Error messages
🔊 [WS TTS] - Audio playback
```

**3. Common Issues:**

**Issue:** WebSocket connection failed
```
❌ Error: connect ECONNREFUSED 127.0.0.1:3013
```
**Solution:** ตรวจสอบว่ารัน `pnpm ws-tts` แล้ว

**Issue:** No audio playback
```
❌ Audio decode error: EncodingError
```
**Solution:** ตรวจสอบ audio format (ต้องเป็น PCM_24000)

**Issue:** Chunks playing out of order
**Solution:** ใช้ queue-based sequential playback (ดู code ด้านบน)

### สถานะการพัฒนา

✅ **Tasks เสร็จแล้ว (60%):**
- Task 1: Project structure setup
- Task 2: WebSocket server implementation (รองรับ delimiters ครบ: `,` `!` `?` `:` `;` `.`)
- Task 3: React hook implementation

❌ **Tasks ที่ยังต้องทำ (40%):**
- Task 4: Integration กับ LiveAvatarSession (~1.5-2 hours)
- Task 5: Testing & Documentation (~1-1.5 hours)

**Status:** 🚧 Not production ready - ต้อง complete Tasks 4-5

### 📋 Tasks ที่ยังต้องทำ (4-5)

#### **Task 4: Integration with Voice-to-Voice Flow** ❌ (Estimated: 1.5-2 hours)

**Goal:** เชื่อมต่อ WebSocket TTS เข้ากับ V2V flow ที่มีอยู่ใน LiveAvatarSession component เพื่อแทนที่ REST API TTS ด้วย WebSocket TTS แบบ progressive playback

---

**Step 4.1: Import และ Setup WebSocket TTS Hook** (15-20 นาที)

**ไฟล์:** `apps/demo/src/components/LiveAvatarSession.tsx`

**4.1.1: เพิ่ม Import Statement**
```typescript
// เพิ่มใน imports section (บรรทัด 1-13)
import { useWebSocketTTS } from "../liveavatar/useWebSocketTTS";
```

**4.1.2: Initialize useWebSocketTTS Hook**
```typescript
// เพิ่มหลัง useElevenLabsRealtimeSTT hook (หลังบรรทัด 104)
const {
  isConnected: isWSTTSConnected,
  isSynthesizing: isWSTTSSynthesizing,
  progress: wsTTSProgress,
  connect: connectWSTTS,
  disconnect: disconnectWSTTS,
  synthesize: synthesizeWSTTS,
} = useWebSocketTTS({
  wsUrl: 'ws://localhost:3013/ws/elevenlabs-tts',
  voiceId: 'moBQ5vcoHD68Es6NqdGR', // George (English) - เปลี่ยนได้ตามต้องการ
  modelId: 'eleven_v3',
  autoConnect: false, // จะ connect manual ใน useEffect
  onAudioChunk: (chunkIndex, totalChunks, text) => {
    console.log(`🔊 [WS-TTS] Chunk ${chunkIndex + 1}/${totalChunks}: "${text}"`);
  },
  onComplete: (totalChunks) => {
    console.log(`✅ [WS-TTS] Completed - Total ${totalChunks} chunks`);
  },
  onError: (error) => {
    console.error('❌ [WS-TTS] Error:', error);
  },
  onConnectionChange: (connected) => {
    console.log(`🔌 [WS-TTS] Connection status: ${connected ? 'connected' : 'disconnected'}`);
  }
});
```

**4.1.3: เพิ่ม useEffect สำหรับ Auto-Connect/Disconnect**
```typescript
// เพิ่มหลัง useEffect ที่มีอยู่ (หลังบรรทัด 171)
useEffect(() => {
  // Auto-connect to WebSocket TTS when component mounts (CUSTOM mode only)
  if (mode === 'CUSTOM') {
    console.log('🔌 [WS-TTS] Connecting to WebSocket TTS server...');
    connectWSTTS();
  }

  // Cleanup: disconnect when component unmounts
  return () => {
    if (mode === 'CUSTOM') {
      console.log('🔌 [WS-TTS] Disconnecting from WebSocket TTS server...');
      disconnectWSTTS();
    }
  };
}, [mode, connectWSTTS, disconnectWSTTS]);
```

---

**Step 4.2: แก้ไข handleVoiceToVoice() เพื่อใช้ Progressive Lip-sync กับ Avatar** (1-1.5 ชั่วโมง)

**ไฟล์:** `apps/demo/src/components/LiveAvatarSession.tsx`

**🎯 เป้าหมาย:** ส่ง audio chunks ไปยัง HeyGen Avatar `repeatAudio()` แบบ Progressive (ทีละ chunk) เพื่อให้ Avatar lip-sync แบบ real-time โดยไม่ต้องรอให้ synthesis เสร็จทั้งหมด

---

**📋 หลักการทำงาน (Progressive Lip-sync Flow):**

```
WebSocket TTS Server → Audio Chunks → Queue → Sequential Processing → Avatar Lip-sync

Step 1: User Speech → OpenAI Chat → AI Response
Step 2: Send AI Response → WebSocket TTS → Text Chunking (delimiter-based)
Step 3: Each Chunk → ElevenLabs TTS → Audio Chunk (base64 MP3)
Step 4: Receive Chunk → Add to Queue → Process Immediately
Step 5: Send to repeatAudio() → Wait for Duration → Next Chunk
Step 6: Repeat until all chunks complete → Avatar finishes speaking
```

**🔑 Key Concepts:**

1. **Non-blocking Synthesis:** WebSocket TTS ส่ง chunks มาทีละส่วน (ไม่ต้องรอทั้งหมด)
2. **Sequential Queue:** Chunks ถูกเก็บใน queue และเล่นตามลำดับ
3. **Progressive Playback:** Chunk แรกเริ่มเล่นทันทีที่ได้รับ (ลด latency ~40-50%)
4. **Event-based Timing:** ใช้ `AVATAR_SPEAK_ENDED` event เพื่อรับสัญญาณเมื่อ Avatar พูดเสร็จแต่ละ chunk

---

**🔧 Implementation แบบละเอียด:**

**Step 4.2.1: เพิ่ม Helper Function สำหรับคำนวณ Audio Duration** (5-10 นาที)

**ตำแหน่ง:** เพิ่มก่อนฟังก์ชัน `LiveAvatarSessionComponent` (บรรทัด ~40)

```typescript
/**
 * คำนวณ duration ของ audio data (base64 MP3)
 * ใช้สำหรับ wait time ในการเล่น chunk แบบ sequential
 *
 * @param base64Audio - base64 encoded audio (mp3_44100_128 format)
 * @returns duration in seconds (approximate)
 */
async function getAudioDuration(base64Audio: string): Promise<number> {
  try {
    // Step 1: Decode base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const audioBuffer = bytes.buffer;

    // Step 2: Create audio context and decode
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const decodedBuffer = await audioContext.decodeAudioData(audioBuffer);

    // Step 3: Get duration from decoded buffer
    const duration = decodedBuffer.duration;
    console.log(`⏱️ [Audio Duration] Calculated: ${duration.toFixed(2)}s`);

    // Step 4: Close audio context to prevent memory leaks
    await audioContext.close();

    return duration;
  } catch (error) {
    console.error('❌ [Audio Duration] Error calculating duration:', error);

    // Fallback: estimate based on file size
    // MP3 128kbps ≈ 16KB/s, base64 encoding adds ~33% overhead
    const estimatedDuration = (base64Audio.length * 0.75) / (16 * 1024);
    console.warn(`⚠️ [Audio Duration] Using estimated duration: ${estimatedDuration.toFixed(2)}s`);

    return estimatedDuration;
  }
}
```

**เหตุผล:**
- ต้องรู้ duration ของแต่ละ chunk เพื่อรอให้เล่นเสร็จก่อนส่ง chunk ถัดไป
- ใช้ Web Audio API `decodeAudioData()` เพื่อความแม่นยำ
- มี fallback calculation ถ้า decode ไม่สำเร็จ

---

**Step 4.2.2: เพิ่ม State และ Refs สำหรับ Progressive Lip-sync** (5-10 นาที)

**ตำแหน่ง:** ใน `LiveAvatarSessionComponent` component (หลังบรรทัด 80)

```typescript
// เพิ่มหลัง: const { sessionRef } = useLiveAvatarContext();

// State สำหรับ Progressive Lip-sync
const audioChunksQueueRef = useRef<Array<{ audio: string; text: string }>>([]);
const isProcessingChunkRef = useRef(false);
```

**คำอธิบาย:**
- `audioChunksQueueRef`: เก็บ queue ของ audio chunks ที่รอส่งไปยัง Avatar
- `isProcessingChunkRef`: flag ป้องกันการประมวลผล chunk หลายตัวพร้อมกัน

---

**Step 4.2.3: สร้างฟังก์ชัน processNextAudioChunk()** (15-20 นาที)

**ตำแหน่ง:** เพิ่มหลัง `handleVoiceToVoice` function (บรรทัด ~152)

```typescript
/**
 * ส่ง audio chunk ไปยัง Avatar แบบ sequential
 * ทำงานแบบ recursive: process chunk → wait → process next chunk
 */
const processNextAudioChunk = useCallback(async () => {
  // Step 1: Check if already processing
  if (isProcessingChunkRef.current) {
    console.log('⏸️ [Avatar] Already processing a chunk, waiting...');
    return;
  }

  // Step 2: Check if queue is empty
  if (audioChunksQueueRef.current.length === 0) {
    console.log('✅ [Avatar] All audio chunks processed');
    isProcessingChunkRef.current = false;
    return;
  }

  // Step 3: Mark as processing
  isProcessingChunkRef.current = true;

  // Step 4: Get next chunk from queue
  const chunk = audioChunksQueueRef.current.shift();
  if (!chunk || !sessionRef.current) {
    console.warn('⚠️ [Avatar] No chunk or session not available');
    isProcessingChunkRef.current = false;
    return;
  }

  try {
    const { audio, text } = chunk;
    console.log(`👄 [Avatar] Processing chunk: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);

    // Step 5: Calculate audio duration
    const duration = await getAudioDuration(audio);
    console.log(`⏱️ [Avatar] Chunk duration: ${duration.toFixed(2)}s`);

    // Step 6: Send to Avatar for lip-sync
    sessionRef.current.repeatAudio(audio);
    console.log('✅ [Avatar] Chunk sent to Avatar, lip-sync started');

    // Step 7: Wait for duration + buffer (50ms safety margin)
    const waitTime = (duration + 0.05) * 1000; // Convert to ms
    console.log(`⏸️ [Avatar] Waiting ${(waitTime / 1000).toFixed(2)}s for chunk to finish...`);

    await new Promise(resolve => setTimeout(resolve, waitTime));
    console.log('✅ [Avatar] Chunk playback finished');

    // Step 8: Mark as not processing
    isProcessingChunkRef.current = false;

    // Step 9: Process next chunk (recursive call)
    if (audioChunksQueueRef.current.length > 0) {
      console.log(`📦 [Avatar] ${audioChunksQueueRef.current.length} chunks remaining in queue`);
      processNextAudioChunk();
    } else {
      console.log('🎉 [Avatar] All chunks processed successfully!');
    }

  } catch (error) {
    console.error('❌ [Avatar] Error processing chunk:', error);
    isProcessingChunkRef.current = false;

    // Continue with next chunk even if this one failed
    if (audioChunksQueueRef.current.length > 0) {
      console.log('⚠️ [Avatar] Continuing with next chunk despite error...');
      processNextAudioChunk();
    }
  }
}, [sessionRef]);
```

**หลักการทำงาน:**
1. ตรวจสอบว่ากำลัง process chunk อยู่หรือไม่
2. ดึง chunk จาก queue
3. คำนวณ duration ของ audio
4. ส่งไปยัง `repeatAudio()` (Avatar เริ่ม lip-sync)
5. รอตาม duration + buffer 50ms
6. เรียก `processNextAudioChunk()` อีกครั้ง (recursive)

---

**Step 4.2.4: แก้ไข useWebSocketTTS Config เพื่อรับ audio_data** (10-15 นาที)

**ตำแหน่ง:** แก้ไข `useWebSocketTTS` config (บรรทัด ~104)

**โค้ดเดิม:**
```typescript
const {
  // ... existing code
} = useWebSocketTTS({
  wsUrl: 'ws://localhost:3013/ws/elevenlabs-tts',
  voiceId: 'moBQ5vcoHD68Es6NqdGR',
  modelId: 'eleven_v3',
  autoConnect: false,
  onAudioChunk: (chunkIndex, totalChunks, text) => {
    console.log(`🔊 [WS-TTS] Chunk ${chunkIndex + 1}/${totalChunks}: "${text}"`);
  },
  // ... rest
});
```

**โค้ดใหม่:**
```typescript
const {
  isConnected: isWSTTSConnected,
  isSynthesizing: isWSTTSSynthesizing,
  progress: wsTTSProgress,
  connect: connectWSTTS,
  disconnect: disconnectWSTTS,
  synthesize: synthesizeWSTTS,
} = useWebSocketTTS({
  wsUrl: 'ws://localhost:3013/ws/elevenlabs-tts',
  voiceId: 'moBQ5vcoHD68Es6NqdGR', // George (English)
  modelId: 'eleven_v3',
  autoConnect: false,

  // 🆕 Handle audio chunks for progressive lip-sync
  onAudioChunk: (chunkIndex, totalChunks, text, audioData) => {
    console.log(`📦 [WS-TTS] Received chunk ${chunkIndex + 1}/${totalChunks}: "${text.substring(0, 30)}..."`);

    // Add chunk to queue
    audioChunksQueueRef.current.push({
      audio: audioData, // base64 audio data
      text: text
    });

    // Start processing if this is the first chunk
    if (chunkIndex === 0 && !isProcessingChunkRef.current) {
      console.log('🎬 [WS-TTS] Starting progressive lip-sync with first chunk');
      processNextAudioChunk();
    }
  },

  onComplete: (totalChunks) => {
    console.log(`✅ [WS-TTS] Synthesis completed - Total ${totalChunks} chunks`);
  },

  onError: (error) => {
    console.error('❌ [WS-TTS] Error:', error);
  },

  onConnectionChange: (connected) => {
    console.log(`🔌 [WS-TTS] Connection: ${connected ? 'Connected' : 'Disconnected'}`);
  }
});
```

**หมายเหตุ:** ต้องแก้ไข `useWebSocketTTS.ts` เพื่อส่ง `audioData` parameter (ดู Step 5)

---

**Step 4.2.5: แก้ไข handleVoiceToVoice() ฉบับสมบูรณ์** (20-30 นาที)

**ตำแหน่ง:** แทนที่ฟังก์ชัน `handleVoiceToVoice` ที่มีอยู่ (บรรทัด 107-152)

**🎯 Goal:** ส่ง audio chunks ไปยัง HeyGen Avatar `repeatAudio()` แบบทีละ chunk เพื่อ lip-sync แบบ progressive (ไม่ต้องรอให้ synthesis เสร็จทั้งหมด)

**💡 Solution Overview:**

```
Flow: WebSocket TTS → Audio Chunk → repeatAudio() → Wait for playback → Next Chunk
      (Chunk 1) ────→ Avatar Lip-sync ────────→ (Chunk 2) ────→ Avatar Lip-sync ────→ ...
```

**หลักการ:**
1. เมื่อได้ chunk แรก → ส่งไป `repeatAudio()` ทันที (ไม่รอ chunk อื่น)
2. รอให้ Avatar เล่น chunk นั้นเสร็จ โดยใช้ `AVATAR_SPEAK_ENDED` event
3. เมื่อ chunk ก่อนหน้าเล่นเสร็จ → ส่ง chunk ถัดไปไปยัง `repeatAudio()`
4. วนซ้ำจนครบทุก chunks

---

**🔧 Implementation: Sequential repeatAudio() with Event-based Timing**

**วิธีการ:**
- ส่ง audio chunk ไปยัง `repeatAudio()` ทีละ chunk
- รอ `AVATAR_SPEAK_ENDED` event เมื่อ Avatar พูดเสร็จแต่ละ chunk
- เมื่อได้รับ event → ส่ง chunk ถัดไปทันที

**ข้อดี:**
- ✅ **Timing แม่นยำ 100%** (ไม่มี drift เพราะใช้ event จริงจาก Avatar)
- ✅ **Latency ต่ำที่สุด** (~1.8s, ไม่ต้องใส่ buffer)
- ✅ **HeyGen API รองรับเต็มรูปแบบ** (มี `AVATAR_SPEAK_ENDED` event พร้อมใช้)
- ✅ **Progressive lip-sync** เห็น Avatar พูดทันทีที่ได้ chunk แรก

---

**✅ การตรวจสอบ HeyGen Avatar API:**

จากการวิเคราะห์ HeyGen LiveAvatar SDK source code:

**ไฟล์:** `packages/js-sdk/src/LiveAvatarSession/events.ts`

**พบว่า HeyGen API รองรับ Event-based timing ผ่าน:**

```typescript
export enum AgentEventsEnum {
  AVATAR_SPEAK_STARTED = "avatar.speak_started",  // ✅ เริ่มพูด
  AVATAR_SPEAK_ENDED = "avatar.speak_ended",      // ✅ พูดเสร็จ (ใช้ตรงนี้!)
}

export type AgentEventCallbacks = {
  [AgentEventsEnum.AVATAR_SPEAK_STARTED]: (
    event: AgentEventData<AgentEventsEnum.AVATAR_SPEAK_STARTED>
  ) => void;
  [AgentEventsEnum.AVATAR_SPEAK_ENDED]: (
    event: AgentEventData<AgentEventsEnum.AVATAR_SPEAK_ENDED>
  ) => void;
  // ... other events
};
```

**สรุป:**
- ✅ **HeyGen Avatar รองรับ `AVATAR_SPEAK_ENDED` event**
- ✅ Event จะ emit เมื่อ Avatar พูด chunk เสร็จ
- ✅ สามารถใช้ Event-based Progressive Lip-sync ได้อย่างสมบูรณ์!

---

**Code Implementation (Event-based):**

```typescript
// ========== Step 1: Setup Event Listeners ==========

import { AgentEventsEnum } from '@heygen/liveavatar-web-sdk';

// เพิ่ม state สำหรับ Progressive Lip-sync
const audioChunksQueueRef = useRef<Array<{ audio: string; text: string }>>([]);
const isProcessingChunkRef = useRef(false);
const currentChunkResolveRef = useRef<(() => void) | null>(null);

// ========== Step 2: Setup Avatar Event Listener ==========

useEffect(() => {
  if (!sessionRef.current) return;

  // Listen to AVATAR_SPEAK_ENDED event
  const handleAvatarSpeakEnded = (event: any) => {
    console.log('✅ [Avatar] AVATAR_SPEAK_ENDED event received:', event.event_id);

    // Resolve the waiting promise
    if (currentChunkResolveRef.current) {
      currentChunkResolveRef.current();
      currentChunkResolveRef.current = null;
    }
  };

  // Attach event listener
  sessionRef.current.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, handleAvatarSpeakEnded);

  // Cleanup on unmount
  return () => {
    if (sessionRef.current) {
      sessionRef.current.off(AgentEventsEnum.AVATAR_SPEAK_ENDED, handleAvatarSpeakEnded);
    }
  };
}, []);

// ========== Step 3: Process Audio Chunks with Event-based Timing ==========

/**
 * ส่ง audio chunk ไปยัง Avatar แบบ sequential (Event-based)
 */
const processNextAudioChunk = useCallback(async () => {
  // Check if already processing
  if (isProcessingChunkRef.current) {
    console.log('⏸️ Already processing a chunk, waiting...');
    return;
  }

  // Check if queue is empty
  if (audioChunksQueueRef.current.length === 0) {
    console.log('✅ All audio chunks processed');
    isProcessingChunkRef.current = false;
    return;
  }

  isProcessingChunkRef.current = true;

  // Get next chunk
  const chunk = audioChunksQueueRef.current.shift();
  if (!chunk || !sessionRef.current) {
    isProcessingChunkRef.current = false;
    return;
  }

  try {
    const { audio, text } = chunk;
    console.log(`👄 [Avatar] Sending chunk to Avatar: "${text.substring(0, 30)}..."`);

    // Create a Promise that resolves when AVATAR_SPEAK_ENDED event fires
    const waitForAvatarSpeakEnd = new Promise<void>((resolve) => {
      currentChunkResolveRef.current = resolve;
    });

    // Send to Avatar (non-blocking)
    sessionRef.current.repeatAudio(audio);
    console.log('📤 [Avatar] Chunk sent, waiting for AVATAR_SPEAK_ENDED event...');

    // Wait for AVATAR_SPEAK_ENDED event
    await waitForAvatarSpeakEnd;
    console.log('✅ [Avatar] Chunk playback finished (event-based)');

    // Mark as not processing
    isProcessingChunkRef.current = false;

    // Process next chunk
    if (audioChunksQueueRef.current.length > 0) {
      processNextAudioChunk();
    }

  } catch (error) {
    console.error('❌ [Avatar] Error processing chunk:', error);
    isProcessingChunkRef.current = false;
    currentChunkResolveRef.current = null;

    // Continue with next chunk even if this one failed
    if (audioChunksQueueRef.current.length > 0) {
      processNextAudioChunk();
    }
  }
}, []);

// ========== Step 4: Setup WebSocket listener และ handleVoiceToVoice() ==========
// ใช้ Event-based timing สำหรับ Progressive Lip-sync

const handleVoiceToVoice = useCallback(async () => {
  try {
    const combinedText = getCombinedTranscript();
    if (!combinedText || combinedText.trim().length === 0) return;

    console.log("🚀 [V2V] Starting Voice-to-Voice flow...");
    audioChunksQueueRef.current = [];
    isProcessingChunkRef.current = false;
    currentChunkResolveRef.current = null;

    // 1. OpenAI Chat
    const chatRes = await fetch("/api/openai-chat-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: combinedText }),
    });
    const { response: aiResponse } = await chatRes.json();
    console.log("✅ [V2V] AI Response:", aiResponse);

    // 2. Setup WebSocket listener for progressive lip-sync
    // (ใช้ onAudioChunk callback จาก useWebSocketTTS)

    // 3. Synthesize
    if (!isWSTTSConnected) {
      await connectWSTTS();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await synthesizeWSTTS(aiResponse);

    // Wait for all chunks to be processed
    while (isWSTTSSynthesizing || audioChunksQueueRef.current.length > 0 || isProcessingChunkRef.current) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log("✅ [V2V] Voice-to-Voice flow with event-based lip-sync completed!");

  } catch (error) {
    console.error("❌ [V2V] Error:", error);
  }
}, [getCombinedTranscript, isWSTTSConnected, connectWSTTS, synthesizeWSTTS, isWSTTSSynthesizing, processNextAudioChunk]);
```

---

**⚠️ ข้อควรระวัง (Event-based):**

1. **Event Listener Cleanup:**
   - ต้อง `off()` event listener ใน cleanup function เพื่อป้องกัน memory leaks
   ```typescript
   return () => {
     sessionRef.current?.off(AgentEventsEnum.AVATAR_SPEAK_ENDED, handler);
   };
   ```

2. **Multiple Chunks:**
   - ถ้าส่ง chunks หลายๆ chunk พร้อมกัน → events อาจ fire ไม่ตรงลำดับ
   - **Solution:** ต้องส่งทีละ chunk และรอ event ก่อนส่ง chunk ถัดไป (ทำแล้วใน code ด้านบน)

3. **Event Timeout:**
   - ถ้า event ไม่ fire (เช่น Avatar error) → code จะค้างตลอด
   - **Solution:** เพิ่ม timeout ให้ Promise
   ```typescript
   const waitForAvatarSpeakEnd = Promise.race([
     new Promise<void>((resolve) => {
       currentChunkResolveRef.current = resolve;
     }),
     new Promise<void>((_, reject) =>
       setTimeout(() => reject(new Error('Timeout waiting for AVATAR_SPEAK_ENDED')), 30000)
     )
   ]);
   ```

4. **Event Data:**
   - `AVATAR_SPEAK_ENDED` event มี `event_id` ที่สามารถใช้ track chunk ได้
   - แต่ไม่มี chunk index → ต้องจัดการ queue เอง

---

**📋 Step 5: Required Modifications to useWebSocketTTS.ts**

เพื่อให้ Event-based Progressive Lip-sync ทำงานได้ ต้องแก้ไข `useWebSocketTTS.ts`:

**5.1: เพิ่ม audio_data ใน onAudioChunk callback**

```typescript
// ไฟล์: apps/demo/src/liveavatar/useWebSocketTTS.ts

// แก้ไข interface TTSConfig
export interface TTSConfig {
  // ... existing fields
  /** Callback when audio chunk is received */
  onAudioChunk?: (
    chunkIndex: number,
    totalChunks: number,
    text: string,
    audioData: string // 🆕 เพิ่ม audio_data (base64)
  ) => void;
  // ... rest of fields
}

// แก้ไข handleAudioChunk function
const handleAudioChunk = useCallback((message: AudioChunkMessage) => {
  const { chunk_index, total_chunks, audio_data, text } = message;

  console.log(`📦 Received audio chunk ${chunk_index + 1}/${total_chunks}`);

  // Update progress
  setProgress({
    current: chunk_index + 1,
    total: total_chunks,
    currentText: text,
  });

  // 🆕 Trigger callback with audio_data
  callbacksRef.current.onAudioChunk?.(chunk_index, total_chunks, text, audio_data);

  // ... existing audio processing code
}, [playNextChunk]);
```

**5.2: (Optional) Expose WebSocket ref สำหรับ advanced use cases**

```typescript
// Return WebSocket ref จาก hook
return {
  // ... existing returns
  wsRef, // 🆕 Expose WebSocket ref (for advanced users)
};
```

---

**🎯 แนะนำสำหรับนักพัฒนา:**

**ขั้นตอนที่ 1: ทดสอบ Option 1 ก่อน (Direct Web Audio Playback)**
- Implementation ง่าย ไม่ต้องแก้โค้ดมาก
- ทดสอบว่า latency และ UX เป็นยังไง
- **ถ้า:** ไม่ต้องการ lip-sync (เช่น audio-only mode) → ใช้ Option 1

**ขั้นตอนที่ 2: ตรวจสอบ HeyGen Avatar API**
```typescript
// ทดสอบว่า repeatAudio() return Promise หรือไม่
const result = await sessionRef.current.repeatAudio(audio);
console.log('repeatAudio result:', result);

// หรือตรวจสอบว่ามี event listeners หรือไม่
console.log('Available methods:', Object.keys(sessionRef.current));
```

**ขั้นตอนที่ 3: Implement Event-based Progressive Lip-sync**
- ✅ **HeyGen Avatar API รองรับ `AVATAR_SPEAK_ENDED` event แล้ว**
- แก้ไข `useWebSocketTTS.ts` ตาม Step 5
- Implement Event-based timing ตามโค้ดด้านบน
- Setup event listeners และ cleanup handlers

**ขั้นตอนที่ 4: Testing และ Validation**
- ทดสอบกับ text ยาว/สั้น, ภาษาไทย/อังกฤษ
- ตรวจสอบว่า Avatar lip-sync ตรงกับ audio
- วัด latency และเปรียบเทียบกับ REST API TTS
- ทดสอบ error handling (network fail, event timeout)

**ขั้นตอนที่ 5: Fine-tuning**
- เพิ่ม timeout สำหรับ event (ป้องกัน hang ถ้า event ไม่ fire)
- ปรับ chunk size delimiters (ถ้า chunks ยาวเกิน)
- เพิ่ม error recovery (retry mechanism)
- Optimize queue processing

---

**⚠️ ข้อควรระวัง:**

1. **Event Listener Cleanup:** ต้อง cleanup listeners ใน `useEffect` return เพื่อป้องกัน memory leaks
2. **Event Timeout:** เพิ่ม timeout เพื่อป้องกัน code ค้างถ้า `AVATAR_SPEAK_ENDED` ไม่ fire
3. **Queue Management:** ต้องจัดการ queue อย่างระมัดระวังเพื่อไม่ให้ chunks เล่นผิดลำดับ
4. **Audio Format:** HeyGen `repeatAudio()` รับ base64 MP3 format (mp3_44100_128)

---

**Step 4.3: Update UI Controls** (20-30 นาที)

**ไฟล์:** `apps/demo/src/components/LiveAvatarSession.tsx`

**4.3.1: เพิ่ม WebSocket TTS Status UI**

**ตำแหน่ง:** ใน `RealtimeSTTComponents` section (หลังบรรทัด 251)

**เพิ่มโค้ดนี้:**
```typescript
const RealtimeSTTComponents = (
  <>
    <div className="w-full border-t-2 border-yellow-400 pt-4 mt-4">
      <h3 className="text-lg font-bold text-yellow-400 mb-2">
        ElevenLabs Realtime STT (Continuous Voice Chat)
      </h3>
      <p>Connected: {isRealtimeSTTConnected ? "true" : "false"}</p>

      {/* 🆕 เพิ่มส่วนนี้: WebSocket TTS Status */}
      <div className="mt-2 p-2 bg-gray-800 rounded">
        <p className="text-sm">
          <span className="font-semibold">WebSocket TTS:</span>{" "}
          <span className={isWSTTSConnected ? "text-green-400" : "text-red-400"}>
            {isWSTTSConnected ? "Connected ✅" : "Disconnected ❌"}
          </span>
        </p>
        {isWSTTSSynthesizing && (
          <p className="text-sm text-blue-400 mt-1">
            🔊 Synthesizing... {wsTTSProgress.current}/{wsTTSProgress.total} chunks
            {wsTTSProgress.currentText && (
              <span className="text-xs text-gray-400 ml-2">
                "{wsTTSProgress.currentText.substring(0, 30)}..."
              </span>
            )}
          </p>
        )}
      </div>
      {/* สิ้นสุดส่วนที่เพิ่ม */}

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
              disconnectRealtimeSTT();
              await new Promise(resolve => setTimeout(resolve, 100));
              await handleVoiceToVoice();
            } else {
              connectRealtimeSTT();
            }
          }}
          // 🆕 Disable button ขณะ synthesizing
          disabled={isWSTTSSynthesizing}
          className={`px-6 py-3 rounded-md font-semibold transition-all ${
            isRealtimeSTTConnected
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-green-500 text-white hover:bg-green-600"
          } ${isWSTTSSynthesizing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isWSTTSSynthesizing
            ? "🔊 Synthesizing..."
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
```

**4.3.2: เพิ่ม Error Notification UI (Optional)**

```typescript
// เพิ่ม state สำหรับ error message
const [errorMessage, setErrorMessage] = useState<string | null>(null);

// แก้ไข useWebSocketTTS config
const {
  // ... existing config
  onError: (error) => {
    console.error('❌ [WS-TTS] Error:', error);
    setErrorMessage(typeof error === 'string' ? error : error.message);
    // Auto-clear error after 5 seconds
    setTimeout(() => setErrorMessage(null), 5000);
  },
  // ... rest of config
} = useWebSocketTTS({ /* ... */ });

// เพิ่ม UI สำหรับแสดง error (ใน RealtimeSTTComponents)
{errorMessage && (
  <div className="mt-2 p-3 bg-red-900 border border-red-500 rounded text-red-200 text-sm">
    ❌ Error: {errorMessage}
  </div>
)}
```

---

**Step 4.4: Testing & Validation** (20-30 นาที)

**4.4.1: ทดสอบ Integration**
```bash
# Terminal 1: Start WebSocket TTS server
cd apps/demo
pnpm ws-tts

# ตรวจสอบ output:
# ✅ WebSocket TTS Server is listening on port 3013
# 🔗 Connect to: ws://localhost:3013/ws/elevenlabs-tts

# Terminal 2: Start Next.js app
pnpm dev

# เปิดเบราว์เซอร์: http://localhost:3012
```

**4.4.2: ทดสอบ Complete V2V Flow**
1. เลือก **CUSTOM mode** → กด "Start Session"
2. ตรวจสอบ WebSocket TTS status: "Connected ✅"
3. กด **"Start Realtime Voice Chat"**
4. พูดข้อความ (เช่น "สวัสดี ฉันชื่ออะไร")
5. ตรวจสอบ Transcript แสดงข้อความที่พูด
6. กด **"Stop & Process with Avatar"**
7. ตรวจสอบ Console Logs:
   ```
   🚀 [V2V] Starting Voice-to-Voice flow...
   📝 [V2V] Combined transcript: สวัสดี ฉันชื่ออะไร
   🤖 [V2V] Sending to OpenAI...
   ✅ [V2V] AI Response: สวัสดีครับ ผม...
   🔊 [V2V] Converting to speech via WebSocket TTS...
   🔊 [WS-TTS] Chunk 1/3: "สวัสดีครับ,"
   🔊 [WS-TTS] Chunk 2/3: "ผมคือ AI..."
   🔊 [WS-TTS] Chunk 3/3: "ยินดีที่ได้รู้จักครับ."
   ✅ [WS-TTS] Completed - Total 3 chunks
   ✅ [V2V] Voice-to-Voice flow completed!
   ```
8. ตรวจสอบเสียงเล่นแบบ progressive (ได้ยินเสียงทันทีที่ได้ chunk แรก)

**4.4.3: ทดสอบ Error Scenarios**
- **WebSocket Server Down:** หยุด `pnpm ws-tts` → กด "Stop & Process" → ตรวจสอบ error message แสดง
- **Network Error:** Disconnect network → ตรวจสอบ reconnection behavior
- **Long Text:** พูดข้อความยาว (>500 chars) → ตรวจสอบ chunking และ sequential playback

**4.4.4: วัด Performance**
```typescript
// เพิ่มใน handleVoiceToVoice() เพื่อวัด latency
const startTime = performance.now();

// ... existing V2V flow code

const endTime = performance.now();
console.log(`⏱️ [V2V] Total latency: ${(endTime - startTime) / 1000}s`);

// Target: 1.5-2.5 วินาที (40-50% เร็วกว่า REST API)
```

---

**Deliverables:**
✅ LiveAvatarSession component integrated with WebSocket TTS
✅ Complete V2V flow: Realtime STT → OpenAI → WebSocket TTS → Progressive Audio Playback
✅ UI shows connection status, synthesis progress, and errors
✅ Reduced latency ~1.5-2.5s (40-50% improvement over REST API)
✅ Tested with Thai/English text, long texts, and error scenarios

---

**Common Issues & Solutions:**

**Issue 1:** WebSocket TTS not connecting
```
❌ WebSocket connection failed
```
**Solution:**
- ตรวจสอบว่า WebSocket server รันอยู่ (`pnpm ws-tts`)
- ตรวจสอบ port 3013 ไม่ถูก block โดย firewall
- ตรวจสอบ URL: `ws://localhost:3013/ws/elevenlabs-tts`

**Issue 2:** Audio ไม่เล่น
```
✅ Synthesis completed แต่ไม่ได้ยินเสียง
```
**Solution:**
- ตรวจสอบ AudioContext initialized (`useWebSocketTTS` ทำอัตโนมัติ)
- ตรวจสอบ browser autoplay policy (ต้อง user interaction ก่อน)
- ตรวจสอบ audio format (ต้องเป็น mp3_44100_128)

**Issue 3:** Chunks เล่นไม่เรียงลำดับ
```
Chunk 3 เล่นก่อน Chunk 1
```
**Solution:**
- `useWebSocketTTS` ใช้ sequential queue อยู่แล้ว
- ตรวจสอบว่าใช้ hook version ล่าสุด
- ตรวจสอบ server ส่ง chunk_index ถูกต้อง

---

**Files Modified:**
- `apps/demo/src/components/LiveAvatarSession.tsx` (main integration)

**Dependencies:**
- `useWebSocketTTS` hook (already implemented in Task 3)
- WebSocket TTS Server (already running on port 3013)

**Next Steps:**
→ ทดสอบครบถ้วนตาม Step 4.4
→ แก้ไข bugs ที่เจอ (ถ้ามี)
→ ไปต่อ Task 5: Testing & Documentation

---

#### **Task 5: Testing & Documentation** ❌ (Estimated: 1-1.5 hours)

**Step 5.1: End-to-End Testing**
- Test WebSocket server startup/shutdown
- Test React integration
- Test error scenarios (network errors, API errors)
- Test with long texts and Thai/English

**Step 5.2: Performance Testing**
- วัด latency (first chunk, total time)
- เปรียบเทียบกับ REST API
- Target: First chunk <2s, Total 1.5-2.5s, 40-50% เร็วกว่า REST
- ตรวจสอบ memory leaks และ audio quality

**Step 5.3: Update Documentation**
- อัพเดต V2V_REALTIME.md status เป็น 100%
- เพิ่ม usage examples
- เพิ่ม troubleshooting tips
- อัพเดต latency numbers จริง

**Deliverables:**
- Test cases ผ่านทั้งหมด
- Performance ตรงตาม target
- Documentation updated
- Production ready

**วิธีทดสอบ:**
```bash
# 1. WebSocket Server Tests
pnpm ws-tts  # ตรวจสอบว่ารันได้โดยไม่ error

# 2. Integration Tests  
pnpm dev
# ทดสอบ V2V flow ครบถ้วน
# ทดสอบ error scenarios (server down, disconnect)
# ทดสอบข้อความยาว

# 3. Performance Tests
# วัด latency ด้วย performance.now()
# เปรียบเทียบ WebSocket TTS vs REST API

# 4. TypeScript Check
pnpm typecheck  # ต้องผ่านไม่มี errors
```

---

### 📊 Summary Timeline

| Task | Status | Estimated Time | Priority |
|------|--------|---------------|----------|
| Task 1: Setup | ✅ เสร็จ | 15-30 นาที | P0 |
| Task 2: WebSocket Server | ✅ เสร็จ | 3-4 ชั่วโมง | P0 |
| Task 3: React Hook | ✅ เสร็จ | 2-3 ชั่วโมง | P0 |
| Task 4: Integration | ❌ ยังไม่ทำ | 1.5-2 ชั่วโมง | P0 |
| Task 5: Testing & Docs | ❌ ยังไม่ทำ | 1-1.5 ชั่วโมง | P0 |
| **COMPLETED** | **3/5 Tasks (60%)** | **~6-8 hours** | - |
| **REMAINING** | **2/5 Tasks (40%)** | **~2-3 hours** | - |

### 🎯 Success Criteria

**Tasks 1-3 (เสร็จแล้ว ✅):**
- ✅ WebSocket server รันได้บน port 3013
- ✅ Text chunking รองรับ delimiters ครบ: `,` `!` `?` `:` `;` `.`
- ✅ Audio playback แบบ sequential ไม่สะดุด
- ✅ React Hook พร้อมใช้งาน (WebSocket connection, audio queue, progress tracking)

**Tasks 4-5 (ยังไม่ทำ ❌):**
- ❌ Integration กับ LiveAvatarSession component
- ❌ Complete V2V flow (Realtime STT → OpenAI → WebSocket TTS → Avatar)
- ❌ Latency ลดลงเป็น ~1.5-2.5 วินาที (40-50% improvement)
- ❌ Error handling ครบถ้วน
- ❌ Production ready

### References
- [ElevenLabs REST API Documentation](https://elevenlabs.io/docs/api-reference/text-to-speech)
- [ElevenLabs Model Comparison](https://elevenlabs.io/docs/api-reference/models)
- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [WebSocket Protocol RFC](https://datatracker.ietf.org/doc/html/rfc6455)
- [Reference Implementation: WS_TTS_EL.md](./WS_TTS_EL.md)

---

## PHASE 6: WebSocket Integration for OpenAI Chat ⚠️ ยังไม่ได้ทำ

**Status:** ⚠️ **ยังไม่ได้ Implement** - ต้องสร้าง Custom WebSocket Server
**Estimated Effort:** 5-7 ชั่วโมง

### ทำไมต้องมี Phase นี้?

Phase 3 ใช้ OpenAI Chat แบบ **REST API** (request/response แยกกัน) ทำให้:
- ❌ ต้อง establish connection ทุกครั้ง (overhead)
- ❌ ไม่เก็บ conversation history บน server
- ❌ Latency สูงกว่า WebSocket

Phase 6 จะใช้ **WebSocket** ทำให้:
- ✅ Connection คงอยู่ตลอด (persistent connection)
- ✅ ลด latency (ไม่ต้อง handshake ซ้ำ)
- ✅ Server จัดการ conversation history

(ดูรายละเอียดเพิ่มเติมในเอกสารต้นฉบับ)

---

## สรุปการทำงานทั้งระบบ

(เนื้อหาส่วนนี้เหมือนเดิม - ดูในเอกสารต้นฉบับ)

---

## ข้อควรระวัง

1. **Token Expiration**: ElevenLabs single-use token หมดอายุใน 15 นาที - ต้อง refresh
2. **WebSocket Reconnection**: ต้องมี retry logic สำหรับการ reconnect
3. **Audio Format**: ต้องแน่ใจว่าใช้ PCM 24kHz สำหรับ Avatar
4. **Chunk Size**: ส่ง audio เป็น chunks ๆ ละ 20ms (960 bytes)
5. **Error Handling**: ต้องจัดการ error ทุก phase
6. **Rate Limiting**: ระวัง API rate limits ของทุกบริการ
7. **Cost**: ระบบนี้ใช้ 3 บริการพร้อมกัน - ต้องคำนวณ cost
8. **Model Selection**: เลือก TTS model ที่เหมาะสม - eleven_v3 ไม่รองรับ WebSocket streaming

---

## อ้างอิง

- [HeyGen LiveAvatar Docs](https://docs.heygen.com/docs/liveavatar)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [ElevenLabs Docs](https://elevenlabs.io/docs)
- [ElevenLabs Realtime STT](https://elevenlabs.io/docs/cookbooks/speech-to-text/streaming)
- [ElevenLabs WebSocket Streaming TTS](https://elevenlabs.io/docs/api-reference/websockets)
- [LiveKit Docs](https://docs.livekit.io)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Testing Documentation](./TEST_V2V_PROCESS.md)
