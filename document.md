# LiveAvatar Web SDK - Voice Chat Documentation

## สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────────────┐
│              Client Application (React)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│           LiveAvatarSession (Main Controller)                 │
│  • จัดการ session lifecycle                                  │
│  • ผสานรวม VoiceChat, WebSocket, LiveKit                     │
└────┬─────────────────┬──────────────────────┬────────────────┘
     │                 │                      │
     ▼                 ▼                      ▼
┌──────────┐    ┌─────────────┐    ┌────────────────────┐
│VoiceChat │    │  WebSocket  │    │   LiveKit Room     │
│  Module  │    │  Signaling  │    │    (WebRTC)        │
└──────────┘    └─────────────┘    └────────────────────┘
     │                 │                      │
     ▼                 ▼                      ▼
┌──────────┐    ┌─────────────┐    ┌────────────────────┐
│Microphone│    │Event Messages│   │Audio/Video Streams │
│  Input   │    │(Commands/    │   │(Remote Avatar)     │
│          │    │ Transcripts) │   │                    │
└──────────┘    └─────────────┘    └────────────────────┘
```

---

## Services ที่ใช้ในแต่ละโหมด

ระบบมี **2 โหมดการทำงาน** ที่ใช้ services ต่างกัน:

### FULL Mode (โหมดเต็มรูปแบบ)
**ใช้ LIVEAVATAR API เป็นหลัก - ทำทุกอย่างให้**

| ขั้นตอน | Service | คำอธิบาย |
|---------|---------|----------|
| 1. Speech-to-Text | **LIVEAVATAR** | แปลงเสียงพูดเป็นข้อความ (ทำฝั่ง server) |
| 2. AI Conversation | **LIVEAVATAR** | สร้างคำตอบด้วย AI (ใช้ context_id ที่กำหนด) |
| 3. Text-to-Speech | **LIVEAVATAR** | แปลงข้อความเป็นเสียง (ใช้ voice_id ที่กำหนด) |
| 4. Avatar Animation | **LIVEAVATAR** | สร้างภาพ lip-sync animation |
| 5. Streaming | **LiveKit (WebRTC)** | ส่ง audio/video แบบ real-time |
****
**Configuration**:
```env
LIVEAVATAR_API_KEY=**your_api_key**
LIVEAVATAR_AVATAR_ID=dd73ea75-1218-4ef3-92ce-606d5f7fbc0a
LIVEAVATAR_VOICE_ID=c2527536-6d1f-4412-a643-53a3497dada9
LIVEAVATAR_CONTEXT_ID=5b9dba8a-aa31-11f0-a6ee-066a7fa2e369
LIVEAVATAR_LANGUAGE=en
```

**ข้อดี**: ใช้งานง่าย ไม่ต้องจัดการ AI/TTS เอง
**ข้อเสีย**: ต้องใช้ context และ voice ของ LiveAvatar

---

### CUSTOM Mode (โหมดปรับแต่งเอง)
**ใช้ Services ภายนอกร่วมกัน - ควบคุมเองทุกขั้นตอน**

| ขั้นตอน | Service | คำอธิบาย |
|---------|---------|----------|
| 1. Speech-to-Text | **LIVEAVATAR** | แปลงเสียงพูดเป็นข้อความ (ทำฝั่ง server) |
| 2. AI Conversation | **OPENAI** | ใช้ GPT-4o-mini สร้างคำตอบ |
| 3. Text-to-Speech | **ELEVENLABS** | แปลงข้อความเป็นเสียง PCM 24KHz |
| 4. Avatar Animation | **LIVEAVATAR** | สร้างภาพ lip-sync จากไฟล์เสียง |
| 5. Streaming | **LiveKit (WebRTC)** | ส่ง audio/video แบบ real-time |

**Configuration**:
```env
LIVEAVATAR_API_KEY=your_api_key
LIVEAVATAR_AVATAR_ID=dd73ea75-1218-4ef3-92ce-606d5f7fbc0a
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

**Code Flow** (จาก `useTextChat.ts`):
```typescript
// 1. User พูด → LiveAvatar STT → ได้ transcript
session.on(AgentEventsEnum.USER_TRANSCRIPTION, async (data) => {
  const userMessage = data.transcript;

  // 2. ส่งไป OpenAI เพื่อสร้างคำตอบ
  const res1 = await fetch("/api/openai-chat-complete", {
    method: "POST",
    body: JSON.stringify({ message: userMessage })
  });
  const { response: chatResponseText } = await res1.json();

  // 3. ส่งข้อความไป ElevenLabs แปลงเป็นเสียง
  const res2 = await fetch("/api/elevenlabs-text-to-speech", {
    method: "POST",
    body: JSON.stringify({ text: chatResponseText })
  });
  const { audio } = await res2.json();  // PCM 24KHz base64

  // 4. ส่งเสียงให้ avatar พูด + สร้าง lip-sync
  session.repeatAudio(audio);
});
```

**ข้อดี**: ควบคุม AI personality, เสียง, และภาษาได้เต็มที่
**ข้อเสีย**: ต้องจัดการ API หลายตัว, ซับซ้อนกว่า

---

## Flow การทำงานทั้งหมด (เริ่มต้นจนจบ)

### 1. เริ่มต้น Session

```typescript
// 1. ขอ session token จาก backend
const { session_token } = await fetch("/api/start-session")
  .then(r => r.json());

// 2. สร้าง session พร้อมเปิด voice chat
const session = new LiveAvatarSession(session_token, {
  voiceChat: true
});

// 3. เริ่ม session
await session.start();
```

#### การทำงานภายใน
**File**: `packages/js-sdk/src/LiveAvatarSession/LiveAvatarSession.ts:105-142`

```
1. เปลี่ยนสถานะเป็น CONNECTING
2. เรียก API startSession() → ได้:
   • livekit_url
   • livekit_client_token
   • ws_url (สำหรับ CUSTOM mode)
3. เชื่อมต่อ LiveKit room
4. เชื่อมต่อ WebSocket (ถ้ามี)
5. เริ่ม quality monitoring
6. เริ่ม voice chat อัตโนมัติ (ถ้าเปิดใช้งาน)
7. เปลี่ยนสถานะเป็น CONNECTED
8. ส่ง event SESSION_STREAM_READY เมื่อได้ audio/video
```

---

### 2. เริ่ม Voice Chat

**File**: `packages/js-sdk/src/VoiceChat/VoiceChat.ts:39-79`

```
1. ตรวจสอบ: Room ต้องเชื่อมต่อแล้ว
2. ตรวจสอบ: Voice chat ต้องเป็น INACTIVE
3. เปลี่ยนสถานะเป็น STARTING
4. ขอสิทธิ์ใช้ไมโครโฟน
5. สร้าง LocalAudioTrack พร้อม:
   ✓ Echo cancellation (กำจัดเสียงสะท้อน)
   ✓ Noise suppression (ลดเสียงรบกวน)
   ✓ Auto gain control (ปรับระดับเสียง)
6. ตั้งค่า mute ตามที่กำหนด (ถ้ามี)
7. Publish track ไปยัง LiveKit room
8. ตั้งค่า event listeners (mute/unmute)
9. เปลี่ยนสถานะเป็น ACTIVE
10. ส่ง event STATE_CHANGED
```

**โค้ดตัวอย่าง**:
```typescript
this.track = await createLocalAudioTrack({
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  deviceId,  // ระบุไมโครโฟนเฉพาะ (ถ้าต้องการ)
});

await this.room.localParticipant.publishTrack(this.track);
```

---

### 3. Flow การส่งเสียง (User พูด)

```
Microphone
    ↓
LocalAudioTrack (ประมวลผลเสียง)
    ↓
LiveKit Room (WebRTC)
    ↓
Server
    ↓
Speech-to-Text (Transcription)
    ↓
ส่ง Events กลับมา:
  • USER_SPEAK_STARTED (เริ่มพูด)
  • USER_TRANSCRIPTION (ข้อความที่แปลงได้)
  • USER_SPEAK_ENDED (พูดจบ)
    ↓
Client รับ event ผ่าน LiveKit data channel หรือ WebSocket
```

#### รับ Events
**File**: `packages/js-sdk/src/LiveAvatarSession/LiveAvatarSession.ts:278-298`

```typescript
this.room.on(RoomEvent.DataReceived, (roomMessage, _, __, topic) => {
  if (topic === "agent-response") {
    const eventMsg = JSON.parse(new TextDecoder().decode(roomMessage));

    // ประมวลผล event ต่างๆ
    if (eventMsg.event_type === "USER_SPEAK_STARTED") {
      this.emit(AgentEventsEnum.USER_SPEAK_STARTED, eventMsg);
    }
    // ...
  }
});
```

---

### 4. Flow การรับเสียง (Avatar พูด)

```
Server สร้าง TTS
    ↓
ส่งผ่าน LiveKit Room
    ↓
RemoteAudioTrack + RemoteVideoTrack
    ↓
Client subscribe tracks
    ↓
AVATAR_SPEAK_STARTED event
    ↓
Attach ไปยัง <video> element
    ↓
เล่นเสียงผ่าน speakers + แสดงวิดีโอ
    ↓
AVATAR_SPEAK_ENDED event
```

#### Attach Audio/Video
**File**: `packages/js-sdk/src/LiveAvatarSession/LiveAvatarSession.ts:251-275`

```typescript
this.room.on(RoomEvent.TrackSubscribed, (track, _, participant) => {
  if (participant.identity === "heygen") {
    if (track.kind === "audio") {
      this._remoteAudioTrack = track;
    }
    if (track.kind === "video") {
      this._remoteVideoTrack = track;
    }
    mediaStream.addTrack(track.mediaStreamTrack);
  }
});

// ใช้งาน:
session.attach(videoElement);  // เล่นทั้งเสียงและวิดีโอ
```

---

### 5. Flow การส่งคำสั่ง (Text Message)

```
User พิมพ์ข้อความ
    ↓
session.message(text)
    ↓
sendCommandEvent()
    ↓
เลือกช่องทางส่ง:
  มี WebSocket? → ส่งผ่าน WebSocket
  ไม่มี → ส่งผ่าน LiveKit data channel
    ↓
Server ประมวลผล
    ↓
สร้าง TTS + animation
    ↓
ส่งกลับมาเป็น audio/video stream
```

---

### 6. การปิด Session

**File**: `packages/js-sdk/src/LiveAvatarSession/LiveAvatarSession.ts:144-152, 415-451`

```
1. เรียก session.stop()
2. เปลี่ยนสถานะเป็น DISCONNECTING
3. หยุด quality monitoring
4. หยุด voice chat:
   • หยุดและลบ local audio track
   • Unpublish จาก room
5. หยุด remote audio/video tracks
6. ลบ event listeners ทั้งหมด
7. ปิด WebSocket connection
8. Disconnect จาก LiveKit room
9. เรียก API stopSession()
10. เปลี่ยนสถานะเป็น DISCONNECTED
11. ส่ง event SESSION_DISCONNECTED
```

---

## API Reference

### LiveAvatarSession

#### Constructor
```typescript
const session = new LiveAvatarSession(
  sessionAccessToken: string,
  config?: {
    voiceChat?: boolean | VoiceChatConfig;
    apiUrl?: string;
  }
);
```

#### Methods - Session Control

```typescript
// เริ่ม session
await session.start(): Promise<void>

// หยุด session
await session.stop(): Promise<void>

// ต่ออายุ session
await session.keepAlive(): Promise<void>

// Attach audio/video ไปยัง HTML element
session.attach(element: HTMLMediaElement): void
```

#### Methods - Avatar Control

```typescript
// ส่งข้อความให้ avatar ตอบกลับ
session.message(message: string): void

// ให้ avatar พูดซ้ำข้อความ
session.repeat(message: string): void

// ให้ avatar พูดจากไฟล์เสียงที่เตรียมไว้
session.repeatAudio(audio: string): void

// ควบคุมการฟัง
session.startListening(): void
session.stopListening(): void

// ขัดจังหวะ avatar
session.interrupt(): void
```

#### Properties

```typescript
// สถานะ session
session.state: SessionState

// VoiceChat instance
session.voiceChat: VoiceChat

// Connection quality
session.connectionQuality: ConnectionQuality
```

---

### VoiceChat

#### Methods

```typescript
// เริ่ม voice chat
await voiceChat.start(config?: VoiceChatConfig): Promise<void>

// หยุด voice chat
voiceChat.stop(): void

// ปิดเสียงไมค์
await voiceChat.mute(): Promise<void>

// เปิดเสียงไมค์
await voiceChat.unmute(): Promise<void>

// เปลี่ยนไมโครโฟน
await voiceChat.setDevice(deviceId: string): Promise<boolean>
```

#### Properties

```typescript
// สถานะปัจจุบัน
voiceChat.state: VoiceChatState  // INACTIVE | STARTING | ACTIVE

// สถานะ mute
voiceChat.isMuted: boolean
```

---

## Events ทั้งหมด

### Session Events

```typescript
session.on(SessionEvent.SESSION_STATE_CHANGED, (state: SessionState) => {
  // เปลี่ยนสถานะ session: INACTIVE, CONNECTING, CONNECTED, DISCONNECTING, DISCONNECTED
});

session.on(SessionEvent.SESSION_STREAM_READY, () => {
  // audio/video พร้อมใช้งาน
});

session.on(SessionEvent.SESSION_CONNECTION_QUALITY_CHANGED, (quality: ConnectionQuality) => {
  // คุณภาพการเชื่อมต่อเปลี่ยน: UNKNOWN, GOOD, BAD
});

session.on(SessionEvent.SESSION_DISCONNECTED, () => {
  // session ปิดแล้ว
});
```

### Voice Chat Events

```typescript
voiceChat.on(VoiceChatEvent.MUTED, () => {
  // ไมค์ถูกปิด
});

voiceChat.on(VoiceChatEvent.UNMUTED, () => {
  // ไมค์ถูกเปิด
});

voiceChat.on(VoiceChatEvent.STATE_CHANGED, (state: VoiceChatState) => {
  // สถานะ voice chat เปลี่ยน: INACTIVE, STARTING, ACTIVE
});
```

### Agent Events (Server → Client)

```typescript
session.on(AgentEventsEnum.USER_SPEAK_STARTED, (data) => {
  // ตรวจจับเสียงผู้ใช้
});

session.on(AgentEventsEnum.USER_SPEAK_ENDED, (data) => {
  // ผู้ใช้พูดจบ
});

session.on(AgentEventsEnum.USER_TRANSCRIPTION, (data) => {
  // ข้อความที่แปลงจากเสียงผู้ใช้
  console.log(data.transcript);
});

session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, (data) => {
  // Avatar เริ่มพูด
});

session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, (data) => {
  // Avatar พูดจบ
});

session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, (data) => {
  // ข้อความที่ avatar พูด
  console.log(data.transcript);
});
```

---

## ไฟล์สำคัญ

### Core SDK Files

| File | Location | Responsibilities |
|------|----------|-----------------|
| **LiveAvatarSession.ts** | `packages/js-sdk/src/LiveAvatarSession/` | Main session controller, integrates all components, WebSocket management, event routing |
| **VoiceChat.ts** | `packages/js-sdk/src/VoiceChat/` | Manages local audio track, microphone access, mute/unmute, device selection |
| **SessionApiClient.ts** | `packages/js-sdk/src/LiveAvatarSession/` | HTTP API client for session lifecycle (start/stop/keepAlive) |
| **audio_utils.ts** | `packages/js-sdk/src/` | Audio processing utilities (PCM chunking for TTS) |
| **events.ts** (Session) | `packages/js-sdk/src/LiveAvatarSession/` | Event definitions for session and agent communication |
| **events.ts** (VoiceChat) | `packages/js-sdk/src/VoiceChat/` | Event definitions for voice chat state changes |
| **types.ts** (Session) | `packages/js-sdk/src/LiveAvatarSession/` | Type definitions for session config, states, enums |
| **types.ts** (VoiceChat) | `packages/js-sdk/src/VoiceChat/` | Type definitions for voice chat config and states |
| **const.ts** | `packages/js-sdk/src/LiveAvatarSession/` | Constants (LiveKit topics, API URL) |

### Quality Monitoring Files

| File | Location | Responsibilities |
|------|----------|-----------------|
| **base.ts** | `packages/js-sdk/src/QualityIndicator/` | Abstract base class for connection quality tracking |
| **LiveKitQualityIndicator.ts** | `packages/js-sdk/src/QualityIndicator/` | Monitors LiveKit connection quality and state |
| **WebRTCQualityIndicator.ts** | `packages/js-sdk/src/QualityIndicator/` | Monitors WebRTC peer connection using MOS scores |
| **index.ts** | `packages/js-sdk/src/QualityIndicator/` | Composite quality indicator combining both monitors |

### Demo Application Files

| File | Location | Responsibilities |
|------|----------|-----------------|
| **context.tsx** | `apps/demo/src/liveavatar/` | React context provider, state management for session/voice chat |
| **useVoiceChat.ts** | `apps/demo/src/liveavatar/` | React hook for voice chat operations |
| **useSession.ts** | `apps/demo/src/liveavatar/` | React hook for session management |
| **useAvatarActions.ts** | `apps/demo/src/liveavatar/` | React hook for avatar control (interrupt, repeat, listening) |
| **useTextChat.ts** | `apps/demo/src/liveavatar/` | React hook for text messaging with avatar |
| **LiveAvatarSession.tsx** | `apps/demo/src/components/` | Main session component with UI controls |
| **LiveAvatarDemo.tsx** | `apps/demo/src/components/` | Demo entry point with session token management |

---

## ตัวอย่างการใช้งาน

### Basic Setup

```typescript
import { LiveAvatarSession } from '@heygen/liveavatar-web-sdk';

// สร้าง session
const session = new LiveAvatarSession(sessionToken, {
  voiceChat: true  // เปิด voice chat
});

// ฟัง events
session.on(SessionEvent.SESSION_STREAM_READY, () => {
  console.log('Stream ready!');

  // Attach ไปยัง video element
  const videoElement = document.getElementById('avatar-video');
  session.attach(videoElement);
});

// เริ่ม session
await session.start();
```

### Voice Chat Control

```typescript
const { voiceChat } = session;

// เช็คสถานะ
console.log(voiceChat.state);      // INACTIVE | STARTING | ACTIVE
console.log(voiceChat.isMuted);    // true | false

// ควบคุมไมค์
await voiceChat.mute();         // ปิดเสียงไมค์
await voiceChat.unmute();       // เปิดเสียงไมค์
await voiceChat.setDevice(deviceId);  // เปลี่ยนไมโครโฟน

// ฟัง events
voiceChat.on(VoiceChatEvent.MUTED, () => {
  console.log('Microphone muted');
});

voiceChat.on(VoiceChatEvent.UNMUTED, () => {
  console.log('Microphone unmuted');
});
```

### Conversation Control

```typescript
// ส่งข้อความ
session.message("สวัสดีครับ");

// ให้ avatar พูดซ้ำ
session.repeat("ทดสอบการพูด");

// ขัดจังหวะ
session.interrupt();

// ควบคุมการฟัง
session.startListening();
session.stopListening();
```

### Transcription Handling

```typescript
// รับ transcript ของผู้ใช้
session.on(AgentEventsEnum.USER_TRANSCRIPTION, (data) => {
  console.log('User said:', data.transcript);
});

// รับ transcript ของ avatar
session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, (data) => {
  console.log('Avatar said:', data.transcript);
});

// ตรวจจับการพูด
session.on(AgentEventsEnum.USER_SPEAK_STARTED, () => {
  console.log('User started speaking');
});

session.on(AgentEventsEnum.USER_SPEAK_ENDED, () => {
  console.log('User stopped speaking');
});
```

### React Integration

```typescript
import { useEffect, useRef, useState } from 'react';
import { LiveAvatarSession, SessionEvent, AgentEventsEnum } from '@heygen/liveavatar-web-sdk';

function AvatarComponent() {
  const sessionRef = useRef<LiveAvatarSession>();
  const videoRef = useRef<HTMLVideoElement>();
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');

  useEffect(() => {
    const session = new LiveAvatarSession(sessionToken, {
      voiceChat: true
    });

    session.on(SessionEvent.SESSION_STREAM_READY, () => {
      setIsReady(true);
      if (videoRef.current) {
        session.attach(videoRef.current);
      }
    });

    session.on(AgentEventsEnum.USER_TRANSCRIPTION, (data) => {
      setUserTranscript(data.transcript);
    });

    session.voiceChat.on(VoiceChatEvent.MUTED, () => {
      setIsMuted(true);
    });

    session.voiceChat.on(VoiceChatEvent.UNMUTED, () => {
      setIsMuted(false);
    });

    session.start();
    sessionRef.current = session;

    return () => {
      session.stop();
    };
  }, []);

  const toggleMute = async () => {
    if (isMuted) {
      await sessionRef.current?.voiceChat.unmute();
    } else {
      await sessionRef.current?.voiceChat.mute();
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
      <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <p>You said: {userTranscript}</p>
    </div>
  );
}
```

---

## Audio Processing

### Audio Input (Microphone)

ระบบจะประมวลผลเสียงจากไมโครโฟนด้วย:

1. **Echo Cancellation** - กำจัดเสียงสะท้อนจาก speaker
2. **Noise Suppression** - ลดเสียงรบกวนพื้นหลัง
3. **Auto Gain Control** - ปรับระดับเสียงอัตโนมัติ

```typescript
// ตั้งค่าอัตโนมัติโดย SDK
const track = await createLocalAudioTrack({
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
});
```

### Audio Output (Speakers)

- เสียงจาก Avatar จะถูกส่งมาเป็น `RemoteAudioTrack`
- Attach ไปยัง `<video>` element เพื่อเล่นเสียง
- รองรับทั้ง audio และ video stream

---

## Connection Quality Monitoring

### Quality States

```typescript
enum ConnectionQuality {
  UNKNOWN = "UNKNOWN",  // ไม่ทราบคุณภาพ
  GOOD = "GOOD",        // การเชื่อมต่อดี
  BAD = "BAD"           // การเชื่อมต่อแย่
}
```

### Monitoring

ระบบใช้ 2 วิธีในการตรวจสอบคุณภาพ:

1. **LiveKit Quality Indicator** - ตรวจสอบจาก LiveKit metrics
2. **WebRTC Quality Indicator** - ใช้ MOS (Mean Opinion Score)

```typescript
session.on(SessionEvent.SESSION_CONNECTION_QUALITY_CHANGED, (quality) => {
  if (quality === ConnectionQuality.BAD) {
    console.warn('Poor connection detected!');
  }
});
```

---

## Two Operating Modes

### FULL Mode (Default)

- ใช้ LiveKit ทั้งหมด
- Speech-to-text อัตโนมัติ
- Avatar ตอบด้วย AI
- จัดการ conversation เอง

### CUSTOM Mode

- LiveKit สำหรับ streaming เท่านั้น
- ใช้ backend เองสำหรับ STT/TTS/LLM
- ควบคุม conversation logic เอง
- ต้องมี WebSocket connection

**Example**: ใช้ OpenAI สำหรับ chat, ElevenLabs สำหรับ TTS

---

## API Endpoints

Base URL: `https://api.liveavatar.com`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/sessions/start` | POST | เริ่ม session, รับ LiveKit credentials |
| `/v1/sessions/stop` | POST | หยุด session |
| `/v1/sessions/keep-alive` | POST | ต่ออายุ session |

Headers:
```
Authorization: Bearer <sessionToken>
```

---

## Dependencies

**Core Dependencies**:
- **livekit-client** (2.15.7) - WebRTC room management, audio/video tracks
- **typed-emitter** (2.1.0) - Type-safe event emitter
- **events** (3.3.0) - Node.js EventEmitter for browser
- **webrtc-issue-detector** (1.16.3) - Real-time connection quality monitoring

---

## Troubleshooting

### ไม่ได้ยินเสียง Avatar

1. ตรวจสอบว่า `attach()` ถูกเรียกแล้ว
2. เช็ค video element มี `autoPlay` และ `playsInline`
3. ตรวจสอบ browser permissions

### ไมโครโฟนไม่ทำงาน

1. ตรวจสอบ browser permissions
2. เช็คว่า voice chat state เป็น `ACTIVE`
3. ตรวจสอบว่าไม่ได้ mute

### Connection Quality แย่

1. ตรวจสอบ network bandwidth
2. ลดคุณภาพวิดีโอถ้าจำเป็น
3. ตรวจสอบ WebRTC connection stats

---

## Best Practices

1. **Error Handling**: ใส่ try-catch ในทุก async operations
2. **Cleanup**: เรียก `session.stop()` เมื่อไม่ใช้งาน
3. **Event Listeners**: ลบ listeners เมื่อ component unmount
4. **Quality Monitoring**: แจ้งเตือน user เมื่อ connection แย่
5. **Mute by Default**: พิจารณาเปิด mute ตั้งแต่เริ่มต้น

```typescript
// Good practice
const session = new LiveAvatarSession(token, {
  voiceChat: {
    defaultMuted: true  // เริ่มต้นด้วย mute
  }
});

try {
  await session.start();
} catch (error) {
  console.error('Failed to start session:', error);
}

// Cleanup
useEffect(() => {
  return () => {
    session?.stop();
  };
}, []);
```

---

## สรุป

LiveAvatar Web SDK ใช้เทคโนโลยี:

1. **WebRTC (ผ่าน LiveKit)** - Real-time audio/video streaming
2. **WebSocket** - Bidirectional event messaging
3. **Event-Driven Architecture** - State changes ผ่าน typed events
4. **Modular Design** - แยก VoiceChat, Session, Quality monitoring
5. **Audio Processing** - Echo cancellation, noise suppression, AGC

ระบบผสานรวมการรับเสียงจากไมโครโฟน, เสียงจาก avatar, real-time transcription และการสื่อสาร 2 ทางอย่างลงตัว เพื่อสร้างประสบการณ์การสนทนากับ AI avatars ที่เป็นธรรมชาติ
