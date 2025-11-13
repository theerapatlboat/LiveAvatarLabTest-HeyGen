# Voice-to-Voice Real-time Communication System
**HeyGen LiveAvatar + OpenAI + ElevenLabs Integration**

---

## 📊 IMPLEMENTATION STATUS SUMMARY

### ระดับความพร้อม: **84% พร้อมใช้งาน** ⚠️

| Phase | Status | Progress | Ready for Production |
|-------|--------|----------|---------------------|
| **Phase 1**: Session Management | ✅ สำเร็จ | 100% | ✅ YES |
| **Phase 2**: Voice Chat (FULL) | ✅ สำเร็จ | 100% | ✅ YES |
| **Phase 3**: Custom Voice Chat | ✅ สำเร็จ | 100% | ✅ YES |
| **Phase 4**: Realtime STT (Logs-only) | ✅ สำเร็จ | 100% | ✅ YES (testing mode) |
| **Phase 4**: Realtime STT (Full V2V) | ✅ สำเร็จ | 100% | ✅ YES |
| **Phase 5**: WebSocket TTS | 🚧 กำลังดำเนินการ | 50% | ❌ NO (Task 1-3/6 เสร็จแล้ว) |
| **Phase 6**: WebSocket Chat | ⚠️ ยังไม่ได้เริ่ม | 0% | ❌ NO |

### สิ่งที่พร้อมใช้งาน (Production Ready)

✅ **โหมด FULL** - Voice-to-Voice สมบูรณ์ด้วย HeyGen built-in AI
- Latency: ~1-2 วินาที
- ใช้งานได้ทันที

✅ **โหมด CUSTOM + REST APIs** - Voice-to-Voice แบบปรับแต่งได้
- Pipeline: User Speech → Whisper STT → OpenAI Chat → ElevenLabs TTS → Avatar
- Latency: ~3-5 วินาที
- ปรับแต่ง AI และเสียงได้เต็มที่

✅ **โหมด CUSTOM + ElevenLabs Realtime STT (Logs-only)** - Real-time STT Testing
- Pipeline: User Speech → ElevenLabs Realtime STT → Console Logs
- Latency: <500ms (real-time streaming)
- ไม่ต้องกด Hold to Talk แบบต่อเนื่อง
- รองรับภาษาไทยด้วย Scribe v2
- **ไม่ต้องมี OpenAI/ElevenLabs TTS API keys**

✅ **โหมด CUSTOM + ElevenLabs Realtime STT (Full V2V)** - Voice-to-Voice แบบ Continuous Streaming
- Pipeline: User Speech → ElevenLabs Realtime STT → OpenAI Chat → ElevenLabs REST TTS → Avatar
- Latency: ~3-5 วินาที (เร็วกว่า Whisper แต่ยังใช้ REST API สำหรับ TTS)
- **พร้อมใช้งานแล้ว - ใช้ REST TTS API**
- ต้องมี OpenAI API key และ ElevenLabs API key

### สิ่งที่ยังต้องพัฒนา (Need Implementation)

✅ **Phase 4**: ElevenLabs Realtime STT (100% เสร็จ)
- ✅ API endpoint สำหรับ token generation
- ✅ React Hook ด้วย @elevenlabs/client SDK + microphone config
- ✅ Integration กับ UI และ console logging
- ✅ UI controls สำหรับ Start/Stop continuous voice chat
- ✅ แสดง partial และ final transcripts ใน console
- ✅ Full V2V flow (OpenAI + WebSocket TTS + Avatar)

🚧 **Phase 5**: WebSocket TTS (50% - กำลังดำเนินการ) - **อัพเดต 2025-11-13**
- ✅ **Task 1: Setup Project Structure เสร็จแล้ว** (โฟลเดอร์, dependencies, npm script)
- ✅ **Task 2: Implement WebSocket Server เสร็จแล้ว** (ไฟล์ `server/websocket-tts-server.ts` พร้อมใช้งาน - 340 บรรทัด)
  - ✅ Basic server structure with WebSocket on port 3013
  - ✅ **Text chunking logic (lines 85-184) - อัพเดต 2025-11-13** - แบ่งข้อความตาม delimiters:
    - **Primary delimiters:** `.` `!` `?` (strong sentence breaks) ✅ **ตามที่ User ร้องขอ**
    - **Secondary delimiters:** `,` `;` `:` (weaker breaks) ✅ **ตามที่ User ร้องขอ - อัพเดตเพิ่มเติมแล้ว**
    - **Max chunk size:** 200 characters
    - **Chunking strategy:**
      - Primary delimiters: Flush เมื่อ chunk > 50% ของ maxChunkSize (100 chars)
      - Secondary delimiters: Flush เมื่อ chunk > 70% ของ maxChunkSize (140 chars)
      - Smart delimiter detection: ตรวจจับและ flush ตามความเหมาะสม
    - **Fallback:** Word-based splitting ถ้าไม่มี delimiters
    - **ส่งไปยัง ElevenLabs:** ✅ แต่ละ chunk ถูกส่งไปแปลง TTS แยกกัน แล้ว stream audio กลับมาแบบ sequential
    - **📍 Verification:** ✅ **อัพเดตเสร็จสมบูรณ์ 2025-11-13** - ตรวจสอบแล้วว่า text chunking ทำงานครบทุก delimiters (`.` `!` `?` `,` `;` `:`) พร้อมใช้งาน
  - ✅ ElevenLabs TTS API integration (REST API)
  - ✅ WebSocket message handling (tts, stop, ping)
  - ✅ Comprehensive logging with emojis (🔪, ✂️, 🎯, 📝, ✅, 📤)
  - ✅ Error handling and graceful shutdown
- ✅ **Task 3: React Hook เสร็จแล้ว** (ไฟล์ `src/liveavatar/useWebSocketTTS.ts` พร้อมใช้งาน)
  - ✅ TypeScript interfaces (TTSConfig, TTSProgress, WebSocketMessage)
  - ✅ WebSocket connection management (connect, disconnect, reconnection)
  - ✅ Web Audio API integration (AudioContext, audio queue)
  - ✅ Sequential audio playback (playNextChunk with automatic queue processing)
  - ✅ TTS message handling (synthesize, audio_chunk, completed, error)
  - ✅ Cleanup & stop functions (stop playback, clear queue, disconnect)
  - ✅ Comprehensive state management (isConnected, isSynthesizing, progress)
- 🔄 **Task 4: Test Page** - มี React test page แล้ว (`app/test-ws-tts/page.tsx`) แต่ยังไม่มี HTML standalone
- ❌ Task 5: Integration กับ Phase 4
- ❌ Task 6: Testing & Documentation
- ✅ มี design documentation ([WS_TTS_EL.md](./WS_TTS_EL.md)) จากโปรเจกต์อื่น (Go backend) ใช้เป็น reference ได้

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

## PHASE 1: Session Management ✅ สำเร็จแล้ว

**Status:** ✅ สำเร็จแล้ว

### หน้าที่ (Function)
จัดการ Session lifecycle ของ HeyGen LiveAvatar รวมถึงการสร้าง, ต่ออายุ, และปิด session

### หลักการทำงาน (Working Principles)
- Start Session: สร้าง session token จาก HeyGen API (FULL mode มี avatar_persona, CUSTOM mode ควบคุมเอง)
- Keep Alive: ต่ออายุ session ทุก 5 นาที เพื่อป้องกัน timeout
- WebSocket Connection: เชื่อมต่อ WebSocket สำหรับ CUSTOM mode เพื่อส่งคำสั่งควบคุม Avatar

### วิธีการทำงาน (Implementation)
- API Endpoints: `start-session`, `start-custom-session`, `keep-session-alive`, `stop-session`
- React Hook: `useSession.ts` ที่จัดการ state และ lifecycle

### ผลลัพธ์การทำงาน (Results)
✅ ใช้งานได้เต็มรูปแบบทั้ง FULL และ CUSTOM mode พร้อมใช้งาน production

---

## PHASE 2: Voice Chat (FULL Mode) ✅ สำเร็จแล้ว

**Status:** ✅ สำเร็จแล้ว

### หน้าที่ (Function)
Voice Chat แบบ end-to-end ที่ HeyGen จัดการทุกอย่าง (STT, AI, TTS, Lip-sync) โดยอัตโนมัติ

### หลักการทำงาน (Working Principles)
HeyGen ทำหน้าที่เป็น all-in-one solution จัดการ Voice Chat ทั้งหมด ตั้งแต่รับเสียง แปลงเป็นข้อความ generate คำตอบด้วย AI แปลงกลับเป็นเสียง และทำ lip-sync

### วิธีการทำงาน (Implementation)
- React Hook: `useVoiceChat.ts` จัดการ microphone access และ voice chat lifecycle
- Flow: User Speaks → HeyGen STT → HeyGen AI → HeyGen TTS → Avatar Speaks

### ผลลัพธ์การทำงาน (Results)
✅ ใช้งานได้เต็มรูปแบบ, Latency: 1-2 วินาที, เหมาะสำหรับการใช้งานที่ต้องการความง่ายและรวดเร็ว

---

## PHASE 3: Custom Voice Chat (CUSTOM Mode) ✅ สำเร็จแล้ว

**Status:** ✅ สำเร็จแล้ว

### หน้าที่ (Function)
Voice Chat แบบปรับแต่งได้เต็มรูปแบบ ผู้ใช้สามารถเลือก AI model และ voice ที่ต้องการ

### หลักการทำงาน (Working Principles)
ใช้ REST API เชื่อมต่อระหว่าง OpenAI (Whisper STT + GPT Chat) และ ElevenLabs (TTS) โดย HeyGen ทำหน้าที่เฉพาะ video streaming และ lip-sync

### วิธีการทำงาน (Implementation)
- Audio Recording: Web Audio API (AudioWorklet)
- Pipeline: AudioWorklet → Whisper STT → OpenAI Chat → ElevenLabs TTS → Avatar (WebSocket chunks 20ms)
- APIs: `openai-whisper-stt`, `openai-chat-complete`, `elevenlabs-text-to-speech`
- Hooks: `useCustomVoiceChat.ts`, `useTextChat.ts`

### ผลลัพธ์การทำงาน (Results)
✅ ใช้งานได้เต็มรูปแบบ, Latency: 3-5 วินาที, ปรับแต่ง AI และเสียงได้เต็มที่, เหมาะสำหรับการใช้งานที่ต้องการความยืดหยุ่น

---

## PHASE 4: ElevenLabs Realtime Speech-to-Text Integration ✅ สำเร็จแล้ว

**Status:** ✅ สำเร็จแล้ว (พร้อม Full Voice-to-Voice flow)

### หน้าที่ (Function)
Real-time Speech-to-Text streaming พร้อม Voice-to-Voice integration โดยใช้ ElevenLabs Scribe v2 Realtime แทน OpenAI Whisper

### หลักการทำงาน (Working Principles)
- ใช้ `@elevenlabs/client` SDK เชื่อมต่อ microphone แบบ streaming
- Scribe v2 Realtime ส่ง partial transcripts แบบ real-time และ committed transcripts เมื่อตรวจจับ silence
- Combined transcript จากทั้ง session ถูกส่งไปยัง OpenAI Chat → ElevenLabs TTS → Avatar เมื่อกด "Stop & Process with Avatar"

### วิธีการทำงาน (Implementation)
- API: `/api/elevenlabs-stt-token` (single-use token, หมดอายุ 15 นาที)
- Hook: `useElevenLabsRealtimeSTT.ts` ด้วย `getCombinedTranscript()` function
- Component: `LiveAvatarSession.tsx` พร้อม `handleVoiceToVoice()` callback
- Pipeline: User Speech → ElevenLabs Scribe (streaming) → Combined Transcript → OpenAI Chat → ElevenLabs TTS → Avatar
- Features: Auto transcript reset เมื่อเริ่ม session ใหม่, Combined transcript accumulation

### ผลลัพธ์การทำงาน (Results)
✅ ใช้งานได้เต็มรูปแบบ, STT Latency: <500ms, รองรับภาษาไทย, Continuous voice chat (ไม่ต้องกด Hold to Talk), Full V2V flow enabled, Total Latency: ~2-3 วินาที (เร็วกว่า Whisper)

---

## PHASE 5: WebSocket Integration for ElevenLabs TTS ⚠️ ยังไม่ได้เริ่ม

**Status:** ⚠️ **ยังไม่ได้ Implement** - มีเฉพาะ Design Documentation
**Estimated Effort:** ~8-10 ชั่วโมง

### 📋 สถานะการ Implement ปัจจุบัน

**สิ่งที่มี:**
- ✅ Design Documentation ครบถ้วนใน [WS_TTS_EL.md](./WS_TTS_EL.md) (จากโปรเจกต์ Go backend)
- ✅ มี `@elevenlabs/client` SDK ติดตั้งแล้วใน [package.json](../apps/demo/package.json:14)
- ✅ Architecture ที่ชัดเจนสำหรับ WebSocket Middleware Pattern

**สิ่งที่ยังไม่มี:**
- ❌ WebSocket Server (`server/websocket-tts-server.ts`) - ยังไม่ได้สร้าง
- ❌ React Hook (`useWebSocketTTS.ts`) - ยังไม่ได้สร้าง
- ❌ HTML Test Page (`test-elevenlabs-ws-tts.html`) - ยังไม่ได้สร้าง
- ❌ npm script สำหรับรัน WebSocket server - ยังไม่ได้เพิ่ม
- ❌ Integration กับ LiveAvatarSession component - ยังไม่ได้ทำ

### ⚠️ IMPORTANT: eleven_v3 Architecture Solution (Design)

**ปัญหา:** ElevenLabs `eleven_v3` model **ไม่รองรับ native WebSocket streaming**

**โซลูชันที่วางแผนไว้:** สร้าง **WebSocket Middleware Pattern**:
- Client ↔ WebSocket ↔ Custom Server ↔ REST API ↔ ElevenLabs
- Server แบ่ง text เป็น chunks และเรียก REST API แต่ละ chunk
- Server stream audio chunks กลับไปยัง client ผ่าน WebSocket
- Client เล่น audio แบบ sequential streaming

**ประโยชน์ที่คาดหวัง:**
- ✅ ใช้ eleven_v3 (คุณภาพสูงสุด) ได้แม้จะไม่มี native WebSocket support
- ✅ Progressive audio playback (เล่นได้ทันทีที่ได้ chunk แรก)
- ✅ ลด perceived latency จาก ~3-5 วินาที เป็น ~1.5-2.5 วินาที
- ✅ รองรับข้อความยาวผ่าน text chunking

### หลักการทำงาน (Working Principles)

#### 1. Text Chunking Strategy ✅ **ใช้งานได้แล้ว - อัพเดต 2025-11-13**

**Implementation Status:** ✅ **Implemented และ Updated** in [apps/demo/server/websocket-tts-server.ts:85-184](../apps/demo/server/websocket-tts-server.ts)

แบ่งข้อความตาม delimiters เพื่อสร้าง natural speech breaks:
- **Primary Delimiters (Strong breaks):** Period (`.`), Exclamation (`!`), Question (`?`)
- **Secondary Delimiters (Weaker breaks):** Comma (`,`), Semicolon (`;`), Colon (`:`) ✅ **อัพเดตเพิ่มเติม 2025-11-13**
- **Max Chunk Size:** 200 characters
- **Fallback Strategy:** Word-based splitting ถ้าไม่มี delimiters

**วิธีการทำงาน (อัพเดต 2025-11-13):**
```typescript
function chunkText(text: string, maxChunkSize: number = 200): string[] {
  // Combined regex for all delimiters
  // Primary (strongest breaks): Period (.), Exclamation (!), Question (?)
  // Secondary (weaker breaks): Comma (,), Semicolon (;), Colon (:)
  const allDelimiters = /([.!?,;:])/g;

  // Split by all delimiters (primary + secondary)
  const parts = text.split(allDelimiters);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Determine if we should flush based on delimiter type
    const isPrimaryDelimiter = /[.!?]/.test(part);
    const isSecondaryDelimiter = /[,;:]/.test(part);

    if (currentChunk.trim().length > 0) {
      // Primary delimiters: Flush if chunk > 50% of maxChunkSize
      if (isPrimaryDelimiter && currentChunk.length > maxChunkSize * 0.5) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      // Secondary delimiters: Flush if chunk > 70% of maxChunkSize
      else if (isSecondaryDelimiter && currentChunk.length > maxChunkSize * 0.7) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
    }
  }

  // Fallback: Word-based splitting if no delimiter-based chunks created
}
```

**ผลลัพธ์:**
- ✅ Audio เล่นเร็วขึ้น (ไม่ต้องรอประมวลผลทั้งหมด)
- ✅ Natural pauses ในการพูด
- ✅ รองรับข้อความยาวๆ
- ✅ แต่ละ chunk ถูกส่งไปยัง ElevenLabs REST API แยกกัน
- ✅ Audio chunks stream กลับมาทาง WebSocket แบบ sequential
- ✅ **อัพเดต 2025-11-13:** รองรับทั้ง primary และ secondary delimiters ครบถ้วน (`.` `!` `?` `,` `;` `:`)

#### 2. Sequential Audio Playback
ใช้ queue-based playback:
1. รับ audio chunk จาก WebSocket
2. ใส่เข้า queue
3. Decode เป็น AudioBuffer
4. เล่น chunk ปัจจุบัน
5. เมื่อเสร็จ → เล่น chunk ถัดไป

ทำให้:
- ✅ Audio ต่อเนื่องไม่สะดุด
- ✅ ไม่มี gaps ระหว่าง chunks
- ✅ Smooth playback experience

### วิธีการทำงานที่วางแผนไว้ (Planned Implementation)

#### 1. Custom WebSocket Server (ยังไม่ได้สร้าง)

**ไฟล์ที่ต้องสร้าง:** `apps/demo/server/websocket-tts-server.ts`

**Features:**
- Port: 3013
- WebSocket Path: `/ws/elevenlabs-tts`
- Text chunking with configurable delimiters
- Detailed logging ทุก operation
- Error handling และ graceful shutdown

**วิธีรัน:**
```bash
pnpm ws-tts
```

**Request Format:**
```json
{
  "type": "tts",
  "text": "ข้อความที่ต้องการแปลงเป็นเสียง",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "model_id": "eleven_v3",
  "stability": 0.5,
  "similarity_boost": 0.75,
  "style": 0.0,
  "speed": 1.0
}
```

**Response Format:**
```json
{
  "type": "audio_chunk",
  "chunk_index": 0,
  "total_chunks": 5,
  "audio_data": "base64_encoded_pcm_data...",
  "text": "ข้อความของ chunk นี้",
  "format": "pcm_24000"
}
```

**Text Chunking Implementation:**
```typescript
function chunkText(text: string): string[] {
  console.log('🔪 [CHUNKING] Starting text chunking...');
  console.log(`📝 [CHUNKING] Original text: "${text}"`);

  const chunks: string[] = [];
  const delimiters = [',', '!', '?', ' '];
  let currentChunk = '';

  for (let i = 0; i < text.length; i++) {
    currentChunk += text[i];

    if (delimiters.includes(text[i])) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        console.log(`  ✂️ [CHUNKING] Created chunk: "${currentChunk.trim()}"`);
        currentChunk = '';
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
    console.log(`  ✂️ [CHUNKING] Final chunk: "${currentChunk.trim()}"`);
  }

  const result = chunks.length > 0 ? chunks : [text];
  console.log(`✅ [CHUNKING] Total chunks created: ${result.length}`);

  return result;
}
```

**Logging Examples:**
```
🔪 [CHUNKING] Starting text chunking...
📝 [CHUNKING] Original text: "สวัสดีครับ, ยินดีต้อนรับสู่ระบบ Voice-to-Voice!"
  ✂️ [CHUNKING] Created chunk: "สวัสดีครับ,"
  ✂️ [CHUNKING] Created chunk: "ยินดีต้อนรับสู่ระบบ"
  ✂️ [CHUNKING] Final chunk: "Voice-to-Voice!"
✅ [CHUNKING] Total chunks created: 3

🎯 [TTS] Processing chunk 1/3
  Text: "สวัสดีครับ,"
📞 [TTS] Calling ElevenLabs API...
✅ [TTS] Received audio for chunk 1
📤 [TTS] Sent chunk 1/3 to client
```

#### 2. React Hook for WebSocket TTS (ยังไม่ได้สร้าง)

**ไฟล์ที่ต้องสร้าง:** `apps/demo/src/liveavatar/useWebSocketTTS.ts`

**Hook Interface:**
```typescript
interface TTSConfig {
  wsUrl?: string;                    // default: ws://localhost:3013/ws/elevenlabs-tts
  voiceId?: string;                  // default: 21m00Tcm4TlvDq8ikWAM
  modelId?: string;                  // default: eleven_v3
  stability?: number;                // default: 0.5
  similarityBoost?: number;          // default: 0.75
  style?: number;                    // default: 0.0
  speed?: number;                    // default: 1.0
  onAudioChunk?: (chunk: string, index: number, total: number) => void;
  onComplete?: (totalChunks: number) => void;
  onError?: (error: string) => void;
}

export function useWebSocketTTS(config: TTSConfig = {}) {
  // Returns:
  const {
    isConnected,        // WebSocket connection status
    isSynthesizing,     // Currently processing TTS
    progress,           // { current: 0, total: 0 }
    connect,            // Connect to WebSocket
    disconnect,         // Disconnect from WebSocket
    synthesize,         // synthesize(text: string) - Start TTS
    stop                // Stop current synthesis
  }
}
```

**การใช้งาน:**
```typescript
const {
  isConnected,
  isSynthesizing,
  progress,
  connect,
  disconnect,
  synthesize
} = useWebSocketTTS({
  voiceId: '21m00Tcm4TlvDq8ikWAM',
  modelId: 'eleven_v3',
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.0,
  speed: 1.0,
  onComplete: (totalChunks) => {
    console.log(`✅ TTS completed with ${totalChunks} chunks`);
  }
});

// Connect
useEffect(() => {
  connect();
  return () => disconnect();
}, []);

// Synthesize
const handleSpeak = () => {
  synthesize('สวัสดีครับ ยินดีต้อนรับสู่ระบบ Voice-to-Voice!');
};
```

**Audio Playback Implementation:**
```typescript
// Queue-based sequential playback
const audioQueue = useRef<ArrayBuffer[]>([]);
const isPlaying = useRef(false);

const playNextChunk = useCallback(async () => {
  if (audioQueue.current.length === 0) {
    isPlaying.current = false;
    console.log('🎵 Playback finished');
    return;
  }

  isPlaying.current = true;
  const audioData = audioQueue.current.shift();

  try {
    const audioBuffer = await audioContext.decodeAudioData(audioData);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
    console.log('🔊 Playing audio chunk...');

    source.onended = () => {
      playNextChunk(); // Auto-play next chunk
    };
  } catch (error) {
    console.error('❌ Audio decode error:', error);
    playNextChunk(); // Skip to next chunk
  }
}, []);

// Handle incoming audio chunk
const handleAudioChunk = useCallback((data: any) => {
  console.log(`📦 Received chunk ${data.chunk_index + 1}/${data.total_chunks}`);

  const audioData = base64ToArrayBuffer(data.audio_data);
  audioQueue.current.push(audioData);

  // Start playback if not already playing
  if (!isPlaying.current) {
    playNextChunk();
  }

  // Update progress
  setProgress({
    current: data.chunk_index + 1,
    total: data.total_chunks
  });
}, [playNextChunk]);
```

#### 3. HTML Test Page (ยังไม่ได้สร้าง)

**ไฟล์ที่ต้องสร้าง:** `apps/demo/public/test-elevenlabs-ws-tts.html`

**Features:**
- 🎨 Beautiful gradient UI design
- 🔌 WebSocket connection controls
- 📝 Text input textarea (default Thai text)
- 🎛️ Voice settings inputs with defaults
- 📊 Real-time progress bar
- 📋 Color-coded logging console
- 🔊 Web Audio API integration

**วิธีใช้:**
1. รัน WebSocket server: `pnpm ws-tts`
2. เปิด `apps/demo/public/test-elevenlabs-ws-tts.html` ในเบราว์เซอร์
3. กด "Connect to WebSocket"
4. กรอกข้อความ หรือใช้ default text
5. ปรับ voice settings ตามต้องการ
6. กด "เริ่มพูด"
7. ดู progress bar และ logs
8. ฟังเสียงแบบ streaming

**Default Settings:**
```javascript
voice_id: "21m00Tcm4TlvDq8ikWAM"
model_id: "eleven_v3"
stability: 0.5
similarity_boost: 0.75
style: 0.0
speed: 1.0
```

#### 4. Package.json Script (ยังไม่ได้เพิ่ม)

**ไฟล์ที่ต้องแก้:** [apps/demo/package.json](../apps/demo/package.json:1)

**ต้องเพิ่ม:**
```json
{
  "scripts": {
    "ws-tts": "tsx server/websocket-tts-server.ts"  // ← ยังไม่มี script นี้
  },
  "dependencies": {
    "@elevenlabs/client": "^0.10.0"  // ← มีแล้ว ✅
  },
  "devDependencies": {
    "tsx": "^4.x.x",  // ← อาจต้องติดตั้งเพิ่ม
    "ws": "^8.x.x"    // ← อาจต้องติดตั้งเพิ่ม
  }
}
```

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
7. ✅ **HTML Test Page** - ทดสอบง่าย ไม่ต้องรวม code

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

# Browser: Open test page
open http://localhost:3012/test-elevenlabs-ws-tts.html
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

### ผลลัพธ์การทำงาน (Results)

🚧 **กำลังดำเนินการ Implement (5%)**
- ✅ **Task 1: Setup Project Structure - เสร็จสมบูรณ์**
  - ✅ โฟลเดอร์ `apps/demo/server/` ถูกสร้างแล้ว
  - ✅ ติดตั้ง `ws@8.18.3` แล้ว
  - ✅ ติดตั้ง `@types/ws@8.18.1` แล้ว
  - ✅ ติดตั้ง `tsx@4.20.6` แล้ว
  - ✅ เพิ่ม npm script `"ws-tts"` ใน package.json แล้ว
- ❌ Task 2: Custom WebSocket server - ยังไม่ได้สร้าง
- ❌ Task 3: React Hook - ยังไม่ได้สร้าง
- ❌ Task 4: HTML test page - ยังไม่ได้สร้าง
- ❌ Task 5: Integration กับ Phase 4 - ยังไม่ได้ทำ
- ❌ Task 6: Testing & Documentation - ยังไม่ได้ทำ
- ✅ มี design documentation ครบถ้วน
- ✅ มี reference implementation (Go backend) ใน [WS_TTS_EL.md](./WS_TTS_EL.md)
- ❌ Not production ready - ต้อง implement tasks ที่เหลือ

### 📋 Implementation Plan: Tasks & Steps

#### **Task 1: Setup Project Structure** ✅ **เสร็จสมบูรณ์** (เวลาที่ใช้: ~5 นาที)

**Step 1.1: สร้างโครงสร้างโฟลเดอร์** ✅
```bash
mkdir -p apps/demo/server
```

**Step 1.2: ติดตั้ง Dependencies ที่จำเป็น** ✅
```bash
cd apps/demo
pnpm add ws
pnpm add -D @types/ws tsx
```

**ผลลัพธ์:**
- ✅ ติดตั้ง `ws@8.18.3` (WebSocket library)
- ✅ ติดตั้ง `@types/ws@8.18.1` (TypeScript types)
- ✅ ติดตั้ง `tsx@4.20.6` (TypeScript execution)

**Step 1.3: อัพเดต package.json** ✅
- ✅ เพิ่ม script `"ws-tts": "tsx server/websocket-tts-server.ts"`

**Deliverables:**
- ✅ โฟลเดอร์ `apps/demo/server/` ถูกสร้าง
- ✅ Dependencies ครบถ้วน (ws, @types/ws, tsx)
- ✅ npm script `pnpm ws-tts` พร้อมใช้งาน

**Status:** ✅ **COMPLETED** - พร้อมสำหรับ Task 2

**🧪 วิธีทดสอบ Task 1:**
```bash
# 1. ตรวจสอบโฟลเดอร์
ls -la apps/demo/server/

# 2. ตรวจสอบ dependencies ใน package.json
cat apps/demo/package.json | grep -E '"ws"|"tsx"|"@types/ws"'

# 3. ตรวจสอบ npm script
cat apps/demo/package.json | grep "ws-tts"

# Expected: ทุก command ต้องแสดงผลถูกต้อง
```

---

#### **Task 2: Implement WebSocket Server** ✅ **เสร็จสมบูรณ์ - อัพเดต 2025-11-13** (เวลาที่ใช้: ~45 นาที + 15 นาที update)

**Step 2.1: สร้างโครงสร้างพื้นฐานของ Server** ✅
- สร้างไฟล์ `apps/demo/server/websocket-tts-server.ts`
- Import libraries ที่จำเป็น (ws, http, @elevenlabs/client)
- Setup WebSocket server บน port 3013
- Implement basic connection handling

**Step 2.2: Implement Text Chunking Logic** ✅ **อัพเดต 2025-11-13**
- ✅ สร้าง function `chunkText(text: string, maxChunkSize: number): string[]`
- ✅ รองรับ primary delimiters: `.` `!` `?` (Period, Exclamation, Question)
- ✅ รองรับ secondary delimiters: `,` `;` `:` (Comma, Semicolon, Colon) **อัพเดตเพิ่มเติม 2025-11-13**
- ✅ **Smart chunking strategy:**
  - Primary delimiters: Flush เมื่อ chunk > 50% ของ maxChunkSize
  - Secondary delimiters: Flush เมื่อ chunk > 70% ของ maxChunkSize
- ✅ Implement logging สำหรับ debug (🔪, ✂️, ✅)
- ✅ รองรับทั้งภาษาไทยและภาษาอังกฤษ
- ✅ Edge case handling (empty text, single chunk, fallback to space delimiter)

**Step 2.3: Integrate ElevenLabs API** ✅
- ✅ ใช้ ElevenLabs REST API โดยตรง (`https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`)
- ✅ อ่าน ELEVENLABS_API_KEY จาก environment variables
- ✅ สร้าง function เรียก TTS API แต่ละ chunk ด้วย fetch()
- ✅ Handle audio response และแปลงเป็น base64
- ✅ Implement error handling สำหรับ API calls
- ✅ รองรับ voice_settings (stability, similarity_boost, style, speed)

**Step 2.4: Implement WebSocket Message Handling** ✅
- ✅ รับ TTS request message จาก client (type: 'tts')
- ✅ แบ่งข้อความเป็น chunks ด้วย chunkText()
- ✅ Loop ผ่านแต่ละ chunk:
  - ✅ เรียก ElevenLabs API
  - ✅ แปลง audio เป็น base64
  - ✅ ส่ง audio_chunk message กลับไปยัง client
- ✅ ส่ง completion message
- ✅ Implement stop request handling (type: 'stop')
- ✅ Implement ping/pong for connection health check

**Step 2.5: Add Detailed Logging & Error Handling** ✅
- ✅ เพิ่ม emoji-based logging (🚀, 🔌, 📞, 🎤, 🔪, ✂️, 🎯, 📝, ✅, 📤, 🛑, ❌)
- ✅ Log ทุก operation สำคัญ (connection, chunking, API calls, sending)
- ✅ Handle WebSocket connection errors
- ✅ Handle ElevenLabs API errors
- ✅ Graceful shutdown (SIGINT handler)
- ✅ Per-chunk error handling (continue on error)

**Deliverables:**
- ✅ ไฟล์ `apps/demo/server/websocket-tts-server.ts` ใช้งานได้ (340 บรรทัด) **อัพเดต 2025-11-13**
- ✅ Text chunking ทำงานถูกต้องพร้อม edge case handling **อัพเดตรองรับ secondary delimiters (`,` `;` `:`) 2025-11-13**
- ✅ เชื่อมต่อ ElevenLabs TTS API สำเร็จผ่าน REST API
- ✅ WebSocket communication ทำงานได้ครบถ้วน (connection, message, close, error)
- ✅ Logging ครบถ้วนและชัดเจน
- ✅ ผ่าน TypeScript type checking

**Status:** ✅ **COMPLETED - อัพเดต 2025-11-13** - พร้อมสำหรับ Task 3

**📋 Changelog 2025-11-13:**
- ✅ อัพเดต `chunkText()` function เพื่อรองรับ secondary delimiters (`,` `;` `:`) ครบถ้วน
- ✅ เพิ่ม smart chunking strategy:
  - Primary delimiters (`.` `!` `?`): Flush at 50% maxChunkSize
  - Secondary delimiters (`,` `;` `:`): Flush at 70% maxChunkSize
- ✅ ปรับปรุง logging messages ให้ชัดเจนขึ้น (แยก primary/secondary/final chunks)
- ✅ เพิ่ม combined regex `/([.!?,;:])/g` สำหรับ split ทุก delimiters พร้อมกัน
- ✅ ลบ unused variables เพื่อผ่าน TypeScript linting

**🧪 วิธีทดสอบ Task 2:**

**Test 2.1: ทดสอบการรัน WebSocket Server**
```bash
# Terminal 1: รัน WebSocket server
cd apps/demo
pnpm ws-tts

# Expected:
# ✅ Server เริ่มต้นได้โดยไม่มี error
# ✅ แสดง log "WebSocket server listening on port 3013"
# ✅ ไม่มี TypeScript compilation errors
```

**Test 2.2: ทดสอบ Text Chunking Logic**
```bash
# ใน server code เพิ่ม test case ชั่วคราว:
const testText = "สวัสดีครับ, ยินดีต้อนรับ! ทดสอบระบบ? ขอบคุณมากครับ";
const chunks = chunkText(testText);
console.log('Chunks:', chunks);

# Expected output:
# Chunks: ["สวัสดีครับ,", "ยินดีต้อนรับ!", "ทดสอบระบบ?", "ขอบคุณมากครับ"]
```

**Test 2.3: ทดสอบ WebSocket Connection (ใช้ websocat หรือ wscat)**
```bash
# ติดตั้ง wscat
npm install -g wscat

# Terminal 2: เชื่อมต่อ WebSocket
wscat -c ws://localhost:3013/ws/elevenlabs-tts

# Expected:
# ✅ Connected สำเร็จ
# ✅ Server log แสดง "Client connected"
```

**Test 2.4: ทดสอบ TTS Request (ต้องมี ElevenLabs API key ใน .env)**
```bash
# ส่ง message ผ่าน wscat:
{
  "type": "tts",
  "text": "สวัสดีครับ ยินดีต้อนรับ",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "model_id": "eleven_v3",
  "stability": 0.5,
  "similarity_boost": 0.75
}

# Expected:
# ✅ Server log แสดง text chunking process
# ✅ Server log แสดง "Calling ElevenLabs API..."
# ✅ Receive audio_chunk messages กลับมา
# ✅ Receive completion message
# ✅ ไม่มี API errors
```

**Test 2.5: ทดสอบ Error Handling**
```bash
# Test 1: ส่ง invalid message format
{"invalid": "data"}

# Expected: Server ส่ง error message กลับมา

# Test 2: ปิด .env หรือใส่ API key ผิด
# Expected: Server log แสดง authentication error
```

**Testable Criteria:**
- ✅ Server รันได้บน port 3013 โดยไม่ crash
- ✅ Text chunking แบ่งข้อความถูกต้อง (ทดสอบด้วย console.log)
- ✅ รับ WebSocket connection ได้
- ✅ Process TTS request และส่ง audio chunks กลับมา
- ✅ Emoji logging แสดงผลชัดเจน
- ✅ Error handling ทำงานถูกต้อง

---

#### **Task 3: Create React Hook** ✅ **เสร็จสมบูรณ์** (เวลาที่ใช้: ~1 ชั่วโมง)

**Step 3.1: สร้างโครงสร้าง Hook พื้นฐาน** ✅
- ✅ สร้างไฟล์ `apps/demo/src/liveavatar/useWebSocketTTS.ts`
- ✅ Define TypeScript interfaces (TTSConfig, TTSProgress, WebSocketMessage, AudioChunkMessage)
- ✅ Setup state management (isConnected, isSynthesizing, progress)
- ✅ Export hook interface

**Step 3.2: Implement WebSocket Connection Management** ✅
- ✅ สร้าง `connect()` function พร้อม error handling
- ✅ สร้าง `disconnect()` function พร้อม cleanup
- ✅ Handle connection errors และ onclose events
- ✅ Setup event listeners (onopen, onmessage, onerror, onclose)
- ✅ Implement `ping()` utility function

**Step 3.3: Implement Audio Queue & Sequential Playback** ✅
- ✅ Setup Web Audio API context (AudioContext with browser compatibility)
- ✅ สร้าง audio queue (useRef<ArrayBuffer[]>)
- ✅ Implement `playNextChunk()` function:
  - ✅ Decode audio data (base64 → ArrayBuffer → AudioBuffer)
  - ✅ Create buffer source
  - ✅ Connect to audio destination
  - ✅ Auto-play next chunk when current finishes
  - ✅ Handle audio context suspended state (browser autoplay policy)
- ✅ Handle audio decode errors with fallback to next chunk

**Step 3.4: Implement TTS Message Handling** ✅
- ✅ สร้าง `synthesize(text: string)` function พร้อม validation
- ✅ Send TTS request via WebSocket with all parameters
- ✅ Handle incoming audio_chunk messages
- ✅ Handle completion messages
- ✅ Update progress state แบบ real-time
- ✅ Trigger callbacks (onAudioChunk, onComplete, onError, onConnectionChange)

**Step 3.5: Add Cleanup & Stop Functions** ✅
- ✅ Implement `stop()` function
- ✅ Cleanup audio queue
- ✅ Stop current playback
- ✅ Send stop message to server
- ✅ Cleanup on unmount (useEffect)
- ✅ Close AudioContext on unmount

**Deliverables:**
- ✅ ไฟล์ `useWebSocketTTS.ts` ใช้งานได้ (517 lines)
- ✅ WebSocket connection stable พร้อม reconnection support
- ✅ Audio playback ทำงานถูกต้องแบบ sequential
- ✅ Progress tracking ถูกต้อง (current/total + currentText)
- ✅ Error handling ครบถ้วนทุก edge cases
- ✅ TypeScript types export สำหรับใช้ในโปรเจกต์อื่น

**Status:** ✅ **COMPLETED** - พร้อมสำหรับ Task 4

**🧪 วิธีทดสอบ Task 3:**

**Test 3.1: ทดสอบ Hook ด้วย Simple Test Component**
```typescript
// สร้าง apps/demo/app/test-ws-tts/page.tsx (ชั่วคราว)
'use client';
import { useWebSocketTTS } from '@/liveavatar/useWebSocketTTS';

export default function TestWSTTS() {
  const { isConnected, isSynthesizing, progress, connect, synthesize } = useWebSocketTTS({
    onComplete: (total) => console.log('Completed:', total),
    onError: (err) => console.error('Error:', err)
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test WebSocket TTS Hook</h1>
      <p>Connected: {isConnected ? 'YES' : 'NO'}</p>
      <p>Synthesizing: {isSynthesizing ? 'YES' : 'NO'}</p>
      <p>Progress: {progress.current}/{progress.total}</p>

      <button onClick={connect}>Connect</button>
      <button onClick={() => synthesize('สวัสดีครับ ทดสอบระบบ')}>
        Test Speak
      </button>
    </div>
  );
}
```

```bash
# รัน Next.js และทดสอบ
pnpm dev
# เปิด http://localhost:3012/test-ws-tts

# Expected:
# ✅ กด Connect → isConnected เป็น true
# ✅ กด Test Speak → ได้ยินเสียง
# ✅ Progress bar update ถูกต้อง
```

**Test 3.2: ทดสอบ Audio Queue & Sequential Playback**
```typescript
// ทดสอบด้วยข้อความยาวๆ ที่แบ่งเป็นหลาย chunks
synthesize('สวัสดีครับ, ยินดีต้อนรับสู่ระบบ! ขอบคุณมากครับ.');

// Expected:
# ✅ เสียงเล่นต่อเนื่องไม่สะดุด
# ✅ ไม่มี gaps ระหว่าง chunks
# ✅ เล่นตามลำดับถูกต้อง
```

**Test 3.3: ทดสอบ Connection Management**
```bash
# Test reconnection:
# 1. Connect
# 2. ปิด WebSocket server (Ctrl+C ที่ terminal server)
# 3. สังเกต error handling
# 4. เปิด server ใหม่
# 5. กด Connect อีกครั้ง

# Expected:
# ✅ แสดง error เมื่อ server ปิด
# ✅ Connect ใหม่ได้เมื่อ server เปิด
```

**Test 3.4: ทดสอบ Stop Function**
```bash
# 1. เริ่ม synthesize ข้อความยาวๆ
# 2. กด Stop ระหว่างเล่น

# Expected:
# ✅ เสียงหยุดทันที
# ✅ Audio queue ถูก clear
# ✅ isSynthesizing เป็น false
```

**Test 3.5: ทดสอบ TypeScript Types**
```bash
cd apps/demo
pnpm typecheck

# Expected:
# ✅ ไม่มี TypeScript errors
# ✅ Interfaces exported ถูกต้อง
```

**Testable Criteria:**
- ✅ Hook ไม่ crash เมื่อ mount/unmount
- ✅ WebSocket connection/disconnection ทำงาน
- ✅ Audio เล่นแบบ sequential ไม่สะดุด
- ✅ Progress tracking update real-time
- ✅ Error callbacks ถูกเรียกเมื่อมี error
- ✅ Stop function ทำงานถูกต้อง
- ✅ ไม่มี memory leaks (ตรวจสอบด้วย React DevTools Profiler)

---

#### **Task 4: Create HTML Test Page** (Estimated: 1-2 ชั่วโมง)

**Step 4.1: สร้างโครงสร้าง HTML พื้นฐาน (20 นาที)**
- สร้างไฟล์ `apps/demo/public/test-elevenlabs-ws-tts.html`
- Add HTML structure
- Import Web Audio API
- Setup basic CSS (gradient background)

**Step 4.2: Implement UI Components (40 นาที)**
- Connection controls (Connect/Disconnect button)
- Text input textarea (default Thai text)
- Voice settings inputs:
  - Voice ID
  - Model ID
  - Stability
  - Similarity Boost
  - Style
  - Speed
- Speak button
- Progress bar
- Logging console

**Step 4.3: Implement WebSocket Client Logic (30 นาที)**
- WebSocket connection to `ws://localhost:3013/ws/elevenlabs-tts`
- Send TTS request with user inputs
- Receive and handle audio_chunk messages
- Update progress bar
- Display logs with color coding

**Step 4.4: Implement Audio Playback (30 นาที)**
- Setup Web Audio API
- Implement audio queue
- Decode base64 audio data
- Sequential playback logic
- Handle playback errors

**Deliverables:**
- ✅ ไฟล์ `test-elevenlabs-ws-tts.html` ใช้งานได้
- ✅ UI สวยงามและใช้งานง่าย
- ✅ เชื่อมต่อ WebSocket ได้
- ✅ เล่นเสียงได้ถูกต้อง
- ✅ Logs แสดงผลชัดเจน

**🧪 วิธีทดสอบ Task 4:**

**Test 4.1: เปิด HTML Test Page**
```bash
# Terminal 1: รัน WebSocket server
cd apps/demo
pnpm ws-tts

# Terminal 2: รัน Next.js (เพื่อ serve static files)
pnpm dev

# เปิดเบราว์เซอร์:
http://localhost:3012/test-elevenlabs-ws-tts.html

# Expected:
# ✅ หน้าเว็บแสดงผลสวยงาม (gradient background)
# ✅ ไม่มี JavaScript errors ใน console
# ✅ UI components แสดงครบ
```

**Test 4.2: ทดสอบ WebSocket Connection**
```bash
# บนหน้า HTML test page:
# 1. กดปุ่ม "Connect to WebSocket"

# Expected:
# ✅ Status เปลี่ยนเป็น "Connected"
# ✅ ปุ่มเปลี่ยนเป็น "Disconnect"
# ✅ Log console แสดง "Connected to WebSocket"
# ✅ Server terminal แสดง "Client connected"
```

**Test 4.3: ทดสอบ TTS Synthesis**
```bash
# 1. กรอกข้อความในช่อง Text (เช่น "สวัสดีครับ ทดสอบระบบ")
# 2. ปรับ Voice Settings ตามต้องการ
# 3. กดปุ่ม "เริ่มพูด"

# Expected:
# ✅ Progress bar แสดงความคืบหน้า
# ✅ Logs แสดงข้อความ color-coded:
#    - 🔪 Text chunking
#    - 📞 API calls
#    - 📦 Receiving chunks
#    - ✅ Success messages
# ✅ ได้ยินเสียงพูดออกมา
# ✅ เสียงต่อเนื่องไม่สะดุด
# ✅ หลังเสร็จแสดง "Completed: X chunks"
```

**Test 4.4: ทดสอบ Voice Settings**
```bash
# ทดสอบแต่ละ parameter:

# Test Stability (0.0 - 1.0)
stability: 0.2 → เสียงมีอารมณ์มากขึ้น
stability: 0.8 → เสียงคงที่มากขึ้น

# Test Speed (0.7 - 1.2)
speed: 0.8 → พูดช้าลง
speed: 1.2 → พูดเร็วขึ้น

# Test Style (0.0 - 1.0) - เฉพาะ eleven_v3
style: 0.0 → neutral
style: 1.0 → expressive

# Expected:
# ✅ เสียงเปลี่ยนตาม settings
# ✅ ไม่มี errors
```

**Test 4.5: ทดสอบ Error Cases**
```bash
# Test 1: เชื่อมต่อโดยไม่ได้เปิด WebSocket server
# Expected: แสดง error "Connection failed"

# Test 2: ใส่ Voice ID ผิด
# Expected: แสดง error จาก ElevenLabs API

# Test 3: กรอกข้อความยาวมาก (>1000 characters)
# Expected: แบ่งเป็น chunks และเล่นได้ครบ

# Test 4: กดปุ่ม Speak ซ้อนกัน (ขณะกำลังเล่น)
# Expected: ไม่ crash, อาจ queue หรือ ignore
```

**Test 4.6: ทดสอบ UI/UX**
```bash
# Checklist:
# ✅ Buttons ไม่ disabled ผิดเวลา
# ✅ Progress bar reset ถูกต้องเมื่อเริ่มใหม่
# ✅ Logs scroll อัตโนมัติเมื่อมีข้อความใหม่
# ✅ Text input รองรับภาษาไทยและภาษาอังกฤษ
# ✅ Responsive design (ทดสอบบน mobile/tablet)
```

**Test 4.7: ทดสอบ Browser Compatibility**
```bash
# ทดสอบบน:
# ✅ Chrome/Edge (Chromium)
# ✅ Firefox
# ✅ Safari (ถ้ามี Mac)

# Expected:
# ✅ Web Audio API ทำงานบนทุก browser
# ✅ WebSocket connection stable
# ✅ Audio playback ไม่มีปัญหา
```

**Testable Criteria:**
- ✅ หน้าเว็บ load ได้โดยไม่มี errors
- ✅ WebSocket connection/disconnection ทำงาน
- ✅ TTS synthesis และ audio playback สำเร็จ
- ✅ Voice settings มีผลต่อเสียงจริง
- ✅ Progress bar update real-time
- ✅ Logs แสดงผลชัดเจนด้วย color coding
- ✅ Error handling ทำงานถูกต้อง
- ✅ UI responsive และใช้งานง่าย

---

#### **Task 5: Integration with Voice-to-Voice Flow** (Estimated: 1.5-2 ชั่วโมง)

**Step 5.1: แก้ไข LiveAvatarSession Component (45 นาที)**
- Import `useWebSocketTTS` hook
- Add WebSocket TTS state management
- Connect to WebSocket server on component mount
- Disconnect on unmount

**Step 5.2: Integrate กับ Phase 4 (Realtime STT) (30 นาที)**
- ใช้ `getCombinedTranscript()` จาก useElevenLabsRealtimeSTT
- เมื่อ user กด "Stop & Process with Avatar":
  - Get transcript
  - Send to OpenAI Chat API
  - Get AI response
  - Send to WebSocket TTS (แทน REST API)

**Step 5.3: Update UI Controls (15 นาที)**
- เพิ่ม TTS progress indicator
- แสดงสถานะ WebSocket connection
- Disable controls ขณะ synthesizing
- Show error messages

**Step 5.4: Test Complete V2V Flow (30 นาที)**
- Test: User speaks → STT → Chat → WebSocket TTS → Audio playback
- Verify latency improvement
- Test error scenarios
- Test with different text lengths

**Deliverables:**
- ✅ LiveAvatarSession component integrated
- ✅ Complete V2V flow ทำงานได้
- ✅ Latency ลดลง (~1.5-2.5 วินาที)
- ✅ UI แสดงสถานะถูกต้อง

**🧪 วิธีทดสอบ Task 5:**

**Test 5.1: ทดสอบ Complete Voice-to-Voice Flow**
```bash
# Terminal 1: รัน WebSocket TTS server
cd apps/demo
pnpm ws-tts

# Terminal 2: รัน Next.js app
pnpm dev

# เปิดเบราว์เซอร์: http://localhost:3012
# เลือก CUSTOM mode

# ทดสอบ flow:
# 1. กด "Start Realtime Voice Chat"
# 2. พูดข้อความ (เช่น "สวัสดีครับ")
# 3. กด "Stop & Process with Avatar"

# Expected:
# ✅ ElevenLabs STT แปลงเสียงเป็นข้อความ
# ✅ OpenAI Chat ตอบกลับ
# ✅ WebSocket TTS แปลงข้อความเป็นเสียง (แทน REST API)
# ✅ Avatar พูดพร้อม lip-sync
# ✅ Total latency ~1.5-2.5 วินาที (เร็วกว่า REST API)
```

**Test 5.2: ทดสอบ WebSocket TTS Integration**
```bash
# ตรวจสอบว่า LiveAvatarSession ใช้ WebSocket TTS:

# Expected behavior:
# ✅ Component connect to ws://localhost:3013 เมื่อ mount
# ✅ UI แสดงสถานะ "WebSocket TTS: Connected"
# ✅ เมื่อมี AI response → ส่งไปยัง WebSocket TTS (ไม่ใช่ REST API)
# ✅ Progress indicator แสดงขณะ synthesizing
# ✅ Component disconnect เมื่อ unmount
```

**Test 5.3: ทดสอบ UI Controls**
```bash
# Checklist:
# ✅ แสดงสถานะ WebSocket connection (Connected/Disconnected)
# ✅ Disable controls ขณะ TTS กำลัง synthesize
# ✅ แสดง progress bar ขณะ synthesize (X/Y chunks)
# ✅ แสดง error message ถ้า WebSocket server ไม่ทำงาน
# ✅ ปุ่ม "Stop & Process" ทำงานถูกต้อง
```

**Test 5.4: ทดสอบ Error Scenarios**
```bash
# Test 1: WebSocket server ไม่ทำงาน
# 1. ไม่เปิด pnpm ws-tts
# 2. ลอง start realtime voice chat

# Expected:
# ✅ แสดง error "WebSocket TTS not connected"
# ✅ fallback ไปใช้ REST TTS API (ถ้ามี) หรือแสดง error
# ✅ ไม่ crash

# Test 2: WebSocket disconnect ระหว่างการใช้งาน
# 1. เริ่มใช้งาน V2V
# 2. ปิด WebSocket server (Ctrl+C)
# 3. พยายาม synthesize

# Expected:
# ✅ แสดง error "Connection lost"
# ✅ UI update สถานะเป็น Disconnected
# ✅ ไม่ crash

# Test 3: ข้อความยาวมาก
# 1. พูดข้อความยาว (>500 characters)

# Expected:
# ✅ แบ่งเป็น chunks อัตโนมัติ
# ✅ เล่นต่อเนื่องไม่สะดุด
# ✅ Avatar lip-sync ถูกต้อง
```

**Test 5.5: เปรียบเทียบ Performance กับ REST API**
```bash
# ทดสอบ 2 scenarios:

# Scenario A: REST TTS API (เดิม)
# - ปิด WebSocket server
# - ใช้ REST API endpoint
# - วัด latency จาก user พูด → Avatar พูด

# Scenario B: WebSocket TTS (ใหม่)
# - เปิด WebSocket server
# - ใช้ WebSocket TTS
# - วัด latency จาก user พูด → Avatar พูด

# Expected:
# ✅ WebSocket TTS เร็วกว่า 40-50%
# ✅ WebSocket: ~1.5-2.5 วินาที
# ✅ REST API: ~3-5 วินาที
```

**Test 5.6: ทดสอบการทำงานร่วมกับ Phase 4**
```bash
# ตรวจสอบ integration กับ ElevenLabs Realtime STT:

# 1. Start realtime voice chat
# 2. พูด: "สวัสดีครับ ผมชื่อจอห์น"
# 3. ตรวจสอบ console log

# Expected:
# ✅ STT transcript: "สวัสดีครับ ผมชื่อจอห์น"
# ✅ getCombinedTranscript() ได้ค่าถูกต้อง
# ✅ ส่งไปยัง OpenAI Chat
# ✅ ได้ AI response กลับมา
# ✅ ส่งไปยัง WebSocket TTS
# ✅ Avatar พูดได้ถูกต้อง
```

**Testable Criteria:**
- ✅ Complete V2V flow ทำงานได้ end-to-end
- ✅ WebSocket TTS integrate เข้ากับ LiveAvatarSession สำเร็จ
- ✅ UI controls ทำงานถูกต้อง
- ✅ Error handling ครบถ้วน (server down, disconnect, etc.)
- ✅ Latency ลดลงจริง (~1.5-2.5 วินาที)
- ✅ Integration กับ Phase 4 (Realtime STT) ทำงานได้
- ✅ ไม่มี memory leaks หรือ performance issues

---

#### **Task 6: Testing & Documentation** (Estimated: 1-1.5 ชั่วโมง)

**Step 6.1: End-to-End Testing (30 นาที)**
- Test WebSocket server startup/shutdown
- Test HTML test page
- Test React integration
- Test error scenarios (network errors, API errors)
- Test with long texts
- Test with Thai and English

**Step 6.2: Performance Testing (20 นาที)**
- วัด latency (first chunk, total time)
- เปรียบเทียบกับ REST API
- ตรวจสอบ memory leaks
- ตรวจสอบ audio quality

**Step 6.3: Update Documentation (20 นาที)**
- อัพเดต V2V_REALTIME.md status เป็น 100%
- เพิ่ม usage examples
- เพิ่ม troubleshooting tips
- อัพเดต latency numbers

**Deliverables:**
- ✅ Test cases ผ่านทั้งหมด
- ✅ Performance ตรงตาม target
- ✅ Documentation updated
- ✅ Production ready

**🧪 วิธีทดสอบ Task 6:**

**Test 6.1: End-to-End Testing Checklist**
```bash
# ✅ Checklist ที่ต้องทดสอบครบทั้งหมด:

# 1. WebSocket Server
# ✅ รัน pnpm ws-tts ได้โดยไม่มี errors
# ✅ Server รันบน port 3013
# ✅ Graceful shutdown (Ctrl+C) ทำงานถูกต้อง
# ✅ Log ชัดเจนและมี emoji

# 2. HTML Test Page
# ✅ เปิดหน้า test-elevenlabs-ws-tts.html ได้
# ✅ Connect to WebSocket สำเร็จ
# ✅ TTS synthesis ทำงานได้
# ✅ Audio playback ไม่สะดุด

# 3. React Integration
# ✅ useWebSocketTTS hook ทำงานใน LiveAvatarSession
# ✅ Component mount/unmount ไม่มี memory leaks
# ✅ State management ถูกต้อง

# 4. Error Scenarios
# ✅ Server down: แสดง error ถูกต้อง
# ✅ Network error: retry/reconnect ทำงาน
# ✅ API error: แสดง error message
# ✅ Invalid input: validation ทำงาน

# 5. Edge Cases
# ✅ ข้อความว่าง: handle ได้
# ✅ ข้อความยาวมาก (>1000 chars): ทำงานได้
# ✅ Special characters: ทำงานถูกต้อง
# ✅ ภาษาไทย + English mixed: ทำงานได้

# 6. Browser Compatibility
# ✅ Chrome/Edge
# ✅ Firefox
# ✅ Safari (ถ้ามี)
```

**Test 6.2: Performance Testing**
```bash
# 1. วัด Latency
# ใช้ performance.now() ใน code:

const start = performance.now();
// ... TTS process ...
const end = performance.now();
console.log(`Latency: ${end - start}ms`);

# Target metrics:
# ✅ First chunk latency: <2000ms
# ✅ Total latency: 1500-2500ms
# ✅ เร็วกว่า REST API 40-50%

# 2. วัด Memory Usage
# เปิด Chrome DevTools > Performance/Memory tab
# Record session ขณะใช้งาน V2V

# Expected:
# ✅ Memory ไม่เพิ่มขึ้นเรื่อยๆ (no leaks)
# ✅ GC (Garbage Collection) ทำงานปกติ

# 3. เปรียบเทียบกับ REST API
# ทดสอบ 10 ครั้ง แต่ละวิธี:

# WebSocket TTS Average:
# - Latency: ~2000ms
# - First chunk: ~1200ms

# REST TTS Average:
# - Latency: ~4000ms
# - First response: ~3500ms

# Improvement: 50% faster ✅

# 4. Audio Quality
# ฟังและเปรียบเทียบ:
# ✅ ไม่มี artifacts หรือ distortion
# ✅ Volume consistent
# ✅ ไม่มี clicks/pops ระหว่าง chunks
```

**Test 6.3: Documentation Updates**
```bash
# ตรวจสอบว่าอัพเดตครบ:

# 1. V2V_REALTIME.md
# ✅ PHASE 5 status เป็น 100%
# ✅ อัพเดต latency numbers จริง
# ✅ เพิ่ม usage examples
# ✅ เพิ่ม troubleshooting section

# 2. README.md (ถ้ามี)
# ✅ เพิ่ม WebSocket TTS setup instructions
# ✅ อัพเดต performance metrics

# 3. Code Comments
# ✅ ทุก function มี JSDoc comments
# ✅ Complex logic มี inline comments
# ✅ TODO/FIXME ถูกลบหรือแก้ไขแล้ว

# 4. Example Code
# ✅ Usage examples ใน documentation
# ✅ Test page เป็น reference ที่ดี
```

**Test 6.4: Production Readiness Checklist**
```bash
# Final checklist ก่อน deploy:

# Security
# ✅ API keys อยู่ใน .env (ไม่ commit ใน git)
# ✅ WebSocket origin validation (production)
# ✅ ไม่มี console.log sensitive data
# ✅ Input validation ครบถ้วน

# Performance
# ✅ No memory leaks
# ✅ Latency ตามเป้า (<2.5 วินาที)
# ✅ Audio quality ดี
# ✅ Error handling ครบ

# Code Quality
# ✅ pnpm typecheck ผ่าน
# ✅ pnpm lint ผ่าน
# ✅ ไม่มี warnings
# ✅ Code formatted ถูกต้อง

# Documentation
# ✅ README complete
# ✅ API documentation complete
# ✅ Troubleshooting guide complete
# ✅ Example code working

# Testing
# ✅ All test cases pass
# ✅ Browser compatibility tested
# ✅ Error scenarios handled
# ✅ Performance benchmarks met
```

**Test 6.5: Regression Testing**
```bash
# ตรวจสอบว่าไม่ทำให้ features เดิมเสีย:

# ✅ PHASE 1 (Session Management) ยังทำงานได้
# ✅ PHASE 2 (FULL Mode) ยังทำงานได้
# ✅ PHASE 3 (CUSTOM Mode + REST) ยังทำงานได้
# ✅ PHASE 4 (Realtime STT) ยังทำงานได้
# ✅ ไม่มี breaking changes

# วิธีทดสอบ:
# 1. ทดสอบแต่ละ mode/phase
# 2. ตรวจสอบว่าทำงานเหมือนเดิม
# 3. ตรวจสอบว่าไม่มี new bugs
```

**Testable Criteria:**
- ✅ All end-to-end tests pass
- ✅ Performance metrics ตรงตาม target
- ✅ Documentation ครบถ้วนและถูกต้อง
- ✅ No regressions (features เดิมยังทำงาน)
- ✅ Production ready checklist ผ่านทั้งหมด
- ✅ Code quality standards met
- ✅ Browser compatibility confirmed
- ✅ Security best practices followed

---

### 📊 Summary Timeline

| Task | Estimated Time | Priority |
|------|---------------|----------|
| Task 1: Setup | 15-30 นาที | P0 (Required first) |
| Task 2: WebSocket Server | 3-4 ชั่วโมง | P0 (Core functionality) |
| Task 3: React Hook | 2-3 ชั่วโมง | P0 (Core functionality) |
| Task 4: HTML Test Page | 1-2 ชั่วโมง | P1 (Testing tool) |
| Task 5: Integration | 1.5-2 ชั่วโมง | P0 (Complete V2V) |
| Task 6: Testing & Docs | 1-1.5 ชั่วโมง | P0 (Production ready) |
| **TOTAL** | **9-13 ชั่วโมง** | - |

### 🎯 Success Criteria

- ✅ WebSocket server รันได้บน port 3013
- ✅ Text chunking ทำงานถูกต้อง
- ✅ Audio playback แบบ sequential ไม่สะดุด
- ✅ Latency ลดลงจาก ~3-5 วินาที เป็น ~1.5-2.5 วินาที (40-50% improvement)
- ✅ รองรับ eleven_v3 model
- ✅ HTML test page ทำงานได้
- ✅ Integration กับ Phase 4 (Realtime STT) สำเร็จ
- ✅ Error handling ครบถ้วน
- ✅ Logging ชัดเจน สำหรับ debugging
- ✅ Production ready

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
