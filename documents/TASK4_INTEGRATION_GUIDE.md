# Task 4: Integration with Voice-to-Voice Flow
## WebSocket TTS Integration Guide with Detailed Testing

**Last Updated:** 2025-11-14 18:30
**Status:** 🚧 Ready to Start (Pre-tests Required)
**Estimated Time:** 1.5-2 hours

---

## 📑 Table of Contents

1. [Current Project Status](#-current-project-status)
2. [**PHASE 0: Integration Overview** (START HERE!)](#-phase-0-integration-overview-start-here)
3. [Pre-Integration Testing](#-pre-integration-testing-required)
4. [PHASE 1: Basic Integration](#-phase-1-basic-integration)
5. [PHASE 2: Testing & Validation](#-phase-2-testing--validation)
6. [PHASE 3: Progressive Lip-sync (Optional)](#-phase-3-progressive-lip-sync-optional)
7. [Success Criteria](#-success-criteria)

---

## 📊 Current Project Status

### ✅ Components Ready (85%)

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| **WebSocket Server** | ✅ 100% | `server/websocket-tts-server.ts` | CORS configured |
| **React Hook** | ✅ 100% | `src/liveavatar/useWebSocketTTS.ts` | 492 lines, tested |
| **Dependencies** | ✅ 100% | `package.json` | All installed |
| **Environment** | ✅ 100% | `.env`, `.env.local` | API keys set |
| **CORS Config** | ✅ 100% | Lines 22-56 in server | **NEW: Just added!** |
| **Integration** | ❌ 0% | `LiveAvatarSession.tsx` | **To be done** |
| **TypeScript** | ⚠️ Errors | `useCustomVoiceChat.ts` | **BLOCKER** |

### 🔴 Blockers

**TypeScript Errors in `useCustomVoiceChat.ts`:**
```
Line 101:47 - error TS2345: Argument of type 'number | undefined' is not assignable
Line 132:54 - error TS2532: Object is possibly 'undefined'
Line 133:28 - error TS2532: Object is possibly 'undefined'
```

**Action:** Fix these errors OR comment out unused code before starting Task 4

---

## 🎯 PHASE 0: Integration Overview (START HERE!)

**Purpose:** แผนภาพรวมของการ integrate WebSocket TTS เข้ากับ V2V flow

### สิ่งที่ต้องทำ (High-Level Overview)

ปัจจุบัน LiveAvatarSession.tsx ใช้ **REST API TTS** สำหรับ Voice-to-Voice flow:

```
User Speech → ElevenLabs Realtime STT → OpenAI Chat → ElevenLabs REST TTS → Avatar
                                                              ↑ OLD (3-5s latency)
```

เราจะเปลี่ยนเป็น **WebSocket TTS** เพื่อลด latency:

```
User Speech → ElevenLabs Realtime STT → OpenAI Chat → WebSocket TTS → Avatar
                                                            ↑ NEW (1.5-2.5s latency)
```

---

### Integration Roadmap

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 0: Integration Overview (คุณอยู่ที่นี่)              │
│  - เข้าใจ architecture                                      │
│  - ดู code changes ที่ต้องทำ                               │
│  - เตรียมความพร้อม                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Pre-Tests (5 tests, ~30 นาที)                              │
│  - ทดสอบว่า components พร้อมทั้งหมด                        │
│  - แก้ TypeScript errors                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: Basic Integration (~1 hour)                       │
│  - Import hook                                              │
│  - Initialize และ setup                                    │
│  - แก้ไข handleVoiceToVoice()                             │
│  - เพิ่ม UI status                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: Testing & Validation (~30 นาที)                  │
│  - End-to-end tests                                         │
│  - Edge cases                                               │
│  - Performance validation                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: Progressive Lip-sync (Optional, ~1 hour)          │
│  - Avatar lip-sync integration                              │
│  - Event-based timing                                       │
└─────────────────────────────────────────────────────────────┘
```

---

### What Needs to Change

**ไฟล์เดียวที่ต้องแก้:** `apps/demo/src/components/LiveAvatarSession.tsx`

**การเปลี่ยนแปลง 5 จุด:**

#### 1. Import Statement (Line ~13)

**เพิ่ม:**
```typescript
import { useWebSocketTTS } from "../liveavatar/useWebSocketTTS";
```

---

#### 2. Hook Initialization (After line ~104)

**เพิ่ม:**
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
  voiceId: 'moBQ5vcoHD68Es6NqdGR',
  modelId: 'eleven_v3',
  autoConnect: false,
  onAudioChunk: (chunkIndex, totalChunks, text) => {
    console.log(`🔊 [WS-TTS] Chunk ${chunkIndex + 1}/${totalChunks}: "${text}"`);
  },
  onComplete: (totalChunks) => {
    console.log(`✅ [WS-TTS] Completed ${totalChunks} chunks`);
  },
  onError: (error) => {
    console.error('❌ [WS-TTS] Error:', error);
  },
});
```

---

#### 3. Auto-Connect useEffect (After line ~171)

**เพิ่ม:**
```typescript
useEffect(() => {
  if (mode === 'CUSTOM') {
    console.log('🔌 Connecting to WebSocket TTS server...');
    connectWSTTS();
  }
  return () => {
    if (mode === 'CUSTOM') {
      console.log('🔌 Disconnecting...');
      disconnectWSTTS();
    }
  };
}, [mode, connectWSTTS, disconnectWSTTS]);
```

---

#### 4. Modify handleVoiceToVoice() (Lines 107-152)

**เปลี่ยนจาก (OLD - REST API):**
```typescript
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
  await sessionRef.current.repeatAudio(audio);
}
```

**เป็น (NEW - WebSocket TTS):**
```typescript
// 2. Convert AI response to speech via WebSocket TTS
console.log("🔊 [V2V] Converting to speech via WebSocket TTS...");

// Ensure connected
if (!isWSTTSConnected) {
  await connectWSTTS();
  await new Promise(resolve => setTimeout(resolve, 500));
}

// Synthesize via WebSocket
await synthesizeWSTTS(aiResponse);
console.log("✅ [V2V] WebSocket TTS started");

// Audio plays automatically via Web Audio API
// (Avatar lip-sync is optional - Phase 3)
```

---

#### 5. UI Status Display (Lines 239-285)

**เพิ่ม WebSocket TTS status section:**
```typescript
const RealtimeSTTComponents = (
  <>
    <div className="w-full border-t-2 border-yellow-400 pt-4 mt-4">
      <h3>ElevenLabs Realtime STT</h3>
      <p>STT Connected: {isRealtimeSTTConnected ? "true" : "false"}</p>

      {/* 🆕 NEW: WebSocket TTS Status */}
      <div className="mt-3 p-3 bg-gray-800 rounded">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">WebSocket TTS:</span>
          <span className={isWSTTSConnected ? 'text-green-400' : 'text-red-400'}>
            {isWSTTSConnected ? '✅ Connected' : '❌ Disconnected'}
          </span>
        </div>
        {isWSTTSSynthesizing && (
          <div className="mt-2">
            🔊 Synthesizing... {wsTTSProgress.current}/{wsTTSProgress.total} chunks
          </div>
        )}
      </div>

      {/* ... existing transcripts ... */}
      <Button
        onClick={handleVoiceToVoice}
        disabled={isWSTTSSynthesizing} // 🆕 Disable during synthesis
      >
        {isWSTTSSynthesizing ? "🔊 Speaking..." : "Stop & Process"}
      </Button>
    </div>
  </>
);
```

---

### Side-by-Side Comparison

| Aspect | REST API TTS (OLD) | WebSocket TTS (NEW) |
|--------|-------------------|---------------------|
| **Latency** | 3-5 seconds | 1.5-2.5 seconds (40% faster) |
| **Audio Delivery** | Single blob (all-at-once) | Progressive chunks |
| **First Audio** | After complete synthesis | After first chunk (~1-2s) |
| **User Experience** | Wait for full synthesis | Hear audio immediately |
| **Implementation** | Simple fetch call | WebSocket + hook |
| **Code Complexity** | Low | Medium |
| **Production Ready** | ✅ Yes | 🚧 After this task |

---

### Prerequisites Checklist

ก่อนเริ่ม integration ต้องมี:

**Infrastructure:**
- [x] WebSocket Server running (`pnpm ws-tts`)
- [x] CORS configured (done ✅)
- [x] Next.js dev server running (`pnpm dev`)

**Code:**
- [x] `useWebSocketTTS.ts` hook available
- [x] Dependencies installed (`ws`, `tsx`, etc.)
- [ ] TypeScript errors fixed ⚠️ **BLOCKER**

**Environment:**
- [x] `.env` file with `ELEVENLABS_API_KEY`
- [x] `.env.local` with API keys

**Knowledge:**
- [ ] Read this Phase 0 overview
- [ ] Understand what will change
- [ ] Ready to follow step-by-step guide

---

### Estimated Time Breakdown

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| **Phase 0** | Read overview (this section) | 10 min | 📖 |
| **Pre-Tests** | 5 validation tests | 30 min | 🔴 |
| **Phase 1.1** | Import + Initialize hook | 10 min | 🔴 |
| **Phase 1.2** | Auto-connect useEffect | 10 min | 🔴 |
| **Phase 1.3** | Modify handleVoiceToVoice() | 20 min | 🔴 |
| **Phase 1.4** | Add UI status display | 15 min | 🔴 |
| **Phase 2** | End-to-end testing | 30 min | 🟠 |
| **Phase 3** | Progressive lip-sync (optional) | 1 hour | 🟡 |
| **Total (Required)** | Phase 0-2 | **~2 hours** | |
| **Total (Complete)** | All phases | **~3 hours** | |

---

### Common Pitfalls & Solutions

| Pitfall | Solution |
|---------|----------|
| ❌ Forgot to start WebSocket server | Run `pnpm ws-tts` in Terminal 1 |
| ❌ TypeScript errors block compilation | Fix errors in `useCustomVoiceChat.ts` first |
| ❌ WebSocket not connecting | Check CORS, check server running, check URL |
| ❌ Audio not playing | Check browser console for Web Audio API errors |
| ❌ Chunks out of order | `useWebSocketTTS` handles this - check server logs |
| ❌ Button stays disabled | Check `isWSTTSSynthesizing` state updates |

---

### Quick Start Commands

**Terminal Setup (need 2 terminals):**

```bash
# Terminal 1: WebSocket Server (keep running)
cd apps/demo
pnpm ws-tts

# Terminal 2: Next.js Dev Server (keep running)
cd apps/demo
pnpm dev

# Browser: http://localhost:3012
# Select CUSTOM mode to test
```

---

### Ready to Start?

**Before proceeding:**
1. ✅ Read this Phase 0 overview
2. ✅ Understand the 5 code changes needed
3. ✅ Have 2 terminals ready
4. ✅ WebSocket server can start successfully
5. ⚠️ **Fix TypeScript errors** (CRITICAL!)

**Next:** [Jump to Pre-Tests](#-pre-integration-testing-required) →

---

## 🧪 PRE-INTEGRATION TESTING (Required)

**⚠️ ต้องผ่านทุก Pre-Test ก่อนเริ่ม Task 4**

---

### Pre-Test 1: WebSocket Server Startup ✅

**Time:** 5 minutes
**Purpose:** Verify WebSocket server runs correctly with CORS

**Steps:**
```bash
cd apps/demo
pnpm ws-tts
```

**Expected Output:**
```
✅ ElevenLabs API key found
🚀 Starting WebSocket TTS server...
📍 Port: 3013
🛤️  Path: /ws/elevenlabs-tts
✅ WebSocket TTS Server is listening on port 3013
🔗 Connect to: ws://localhost:3013/ws/elevenlabs-tts
💡 Use 'pnpm ws-tts' to start this server
```

**Validation Checklist:**
- [ ] Server starts without errors
- [ ] Port 3013 is listening
- [ ] API key found message appears
- [ ] No TypeScript errors during startup
- [ ] Process doesn't crash immediately

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Port 3013 already in use | Kill process: `netstat -ano \| findstr :3013` then `taskkill /PID <pid>` |
| API key not found | Check `.env` file has `ELEVENLABS_API_KEY=...` |
| Module not found | Run `pnpm install` |

**Result:** ✅ PASS / ❌ FAIL

---

### Pre-Test 2: HTTP CORS Headers ✅

**Time:** 3 minutes
**Purpose:** Verify HTTP CORS configuration

**Steps:**
```bash
# Option 1: Using curl
curl -i http://localhost:3013

# Option 2: Using browser
# Open: http://localhost:3013
```

**Expected HTTP Response:**
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3012
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Content-Type: text/plain
Date: Thu, 14 Nov 2025 11:00:00 GMT
Content-Length: 46

ElevenLabs WebSocket TTS Server is running
```

**Validation Checklist:**
- [ ] Status code: 200 OK
- [ ] Header `Access-Control-Allow-Origin: http://localhost:3012` present
- [ ] Header `Access-Control-Allow-Methods` includes GET, POST, OPTIONS
- [ ] Response body correct

**Test OPTIONS Request:**
```bash
curl -i -X OPTIONS http://localhost:3013
```

**Expected Response:**
```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:3012
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**Result:** ✅ PASS / ❌ FAIL

---

### Pre-Test 3: WebSocket Connection & Origin Validation ✅

**Time:** 5 minutes
**Purpose:** Test WebSocket connection from allowed origin

**Steps:**

**3.1: Test from Allowed Origin (localhost:3012)**

```bash
# Terminal 1: Ensure WebSocket server is running
pnpm ws-tts

# Terminal 2: Start Next.js dev server
pnpm dev
```

Open browser: `http://localhost:3012`

**Browser Console:**
```javascript
const ws = new WebSocket('ws://localhost:3013/ws/elevenlabs-tts');

ws.onopen = () => console.log('✅ Connected!');
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  console.log('📨 Message:', msg);
};
ws.onerror = (e) => console.error('❌ Error:', e);
ws.onclose = () => console.log('🔌 Closed');
```

**Expected Browser Console Output:**
```
✅ Connected!
📨 Message: {
  type: "connected",
  message: "Connected to ElevenLabs WebSocket TTS Server",
  timestamp: "2025-11-14T11:00:00.000Z"
}
```

**Expected Server Console Output:**
```
📞 New client connected from ::1
```

**Validation Checklist:**
- [ ] WebSocket connection opens successfully
- [ ] Received "connected" message
- [ ] Server logs new client connection
- [ ] No CORS or connection errors

**3.2: Test Origin Validation (Reject Invalid Origin)**

Open a different website (e.g., `https://google.com`)

**Browser Console:**
```javascript
const ws = new WebSocket('ws://localhost:3013/ws/elevenlabs-tts');
ws.onerror = (e) => console.log('Expected error:', e);
```

**Expected Server Console:**
```
❌ Rejected connection from origin: https://google.com
```

**Expected Browser Console:**
```
WebSocket connection to 'ws://localhost:3013/ws/elevenlabs-tts' failed
```

**Validation Checklist:**
- [ ] Connection rejected from unauthorized origin
- [ ] Server logs rejection message
- [ ] Browser shows connection failed

**Result:** ✅ PASS / ❌ FAIL

---

### Pre-Test 4: WebSocket TTS End-to-End Test ✅

**Time:** 10-15 minutes
**Purpose:** Full TTS workflow test (most important!)

**Setup:**
```bash
# Terminal 1: WebSocket server
cd apps/demo
pnpm ws-tts

# Terminal 2: Next.js dev server
pnpm dev

# Browser: http://localhost:3012/test-ws-tts
```

#### Test Case 4.1: Simple English Text

**Input:** `"Hello, world!"`

**Expected Browser Console:**
```
🔌 Connecting to ws://localhost:3013/ws/elevenlabs-tts...
✅ WebSocket connection established
🎤 Synthesizing text: "Hello, world!"
📤 TTS request sent
📨 Received message type: audio_chunk
📦 Received audio chunk 1/2
📝 Text: "Hello,"
➕ Added to queue (queue size: 1)
🎵 Decoded audio chunk: 0.50s
▶️ Playing audio chunk
📨 Received message type: audio_chunk
📦 Received audio chunk 2/2
📝 Text: "world!"
✅ Chunk playback finished
✅ TTS synthesis completed
```

**Expected Server Console:**
```
📨 Received message type: tts
🎤 Processing TTS request...
🔪 Starting delimiter-based text chunking...
📝 Original text length: 13 characters
✂️ Chunk 1: 6 chars - "Hello,"
✂️ Chunk 2 (final): 6 chars - "world!"
✅ Text chunked into 2 chunks

🎯 Processing chunk 1/2
📝 Text: "Hello,"
✅ Audio generated: 12544 bytes
📤 Sent audio chunk 1/2 to client

🎯 Processing chunk 2/2
📝 Text: "world!"
✅ Audio generated: 11328 bytes
📤 Sent audio chunk 2/2 to client

✅ TTS processing completed
📊 Successfully processed 2 chunks
```

**Validation Checklist:**
- [ ] Text split into 2 chunks at comma
- [ ] Audio chunks received in order
- [ ] Audio plays sequentially (no overlap)
- [ ] Voice is clear and correct
- [ ] No errors in console
- [ ] "Synthesizing..." indicator shows progress

---

#### Test Case 4.2: Thai Text with Multiple Delimiters

**Input:** `"สวัสดีครับ! ยินดีต้อนรับ, คุณสบายดีไหม?"`

**Expected Chunks:** 3 chunks
- Chunk 1: `"สวัสดีครับ!"`
- Chunk 2: `"ยินดีต้อนรับ,"`
- Chunk 3: `"คุณสบายดีไหม?"`

**Validation Checklist:**
- [ ] Thai text processed correctly
- [ ] Split at `!`, `,`, `?` delimiters
- [ ] 3 audio chunks received
- [ ] Thai pronunciation correct
- [ ] Sequential playback works

---

#### Test Case 4.3: Long Text (Stress Test)

**Input:**
```
"The quick brown fox jumps over the lazy dog. This is a test sentence.
Multiple delimiters, including commas! And exclamation marks?
Question marks too: also colons; and semicolons."
```

**Expected:** ~8-10 chunks

**Validation Checklist:**
- [ ] All delimiters detected: `. , ! ? : ;`
- [ ] Multiple chunks (8-10)
- [ ] Sequential playback smooth
- [ ] No memory leaks
- [ ] Server handles load well

---

#### Test Case 4.4: No Delimiters (Edge Case)

**Input:** `"Hello"`

**Expected:** 1 chunk (entire text)

**Validation Checklist:**
- [ ] Single chunk returned
- [ ] Audio plays immediately
- [ ] No chunking errors

---

#### Test Case 4.5: Empty/Whitespace (Edge Case)

**Input:** `"   "` (spaces only)

**Expected:**
- Server logs: `"⚠️ Empty text, returning empty array"`
- Client receives error or no chunks

**Validation Checklist:**
- [ ] Handled gracefully
- [ ] No server crash
- [ ] Client shows appropriate error

---

#### Test Case 4.6: Stop Function

**Steps:**
1. Input long text: `"One, two, three, four, five, six, seven, eight"`
2. Click "Synthesize"
3. Immediately click "Stop"

**Expected:**
- Audio playback stops
- Queue cleared
- State reset
- No lingering audio

**Validation Checklist:**
- [ ] Stop button works
- [ ] Audio stops immediately
- [ ] No chunks continue playing
- [ ] UI state resets

---

#### Test Case 4.7: Connection Loss

**Steps:**
1. Start synthesis
2. Kill WebSocket server (Ctrl+C in Terminal 1)
3. Observe behavior

**Expected:**
- Browser console: `"❌ WebSocket error"`
- Connection status: "Disconnected ❌"
- Error callback triggered
- UI shows disconnected state

**Validation Checklist:**
- [ ] Error detected
- [ ] UI updates correctly
- [ ] No infinite reconnect loops
- [ ] Graceful degradation

---

#### Test Case 4.8: Reconnection

**Steps:**
1. Kill server
2. Wait 5 seconds
3. Restart server: `pnpm ws-tts`
4. Refresh browser page
5. Try synthesis again

**Expected:**
- Connection re-establishes
- Synthesis works normally

**Validation Checklist:**
- [ ] Reconnects successfully
- [ ] Synthesis works after reconnect
- [ ] No stale state issues

---

### Pre-Test 5: TypeScript Validation ⚠️

**Time:** 5 minutes
**Purpose:** Ensure no TypeScript errors before integration

**Steps:**
```bash
cd apps/demo
pnpm typecheck
```

**Current Output (2025-11-14):**
```
❌ FAILED

src/liveavatar/useCustomVoiceChat.ts(101,47): error TS2345
src/liveavatar/useCustomVoiceChat.ts(132,54): error TS2532
src/liveavatar/useCustomVoiceChat.ts(133,28): error TS2532
```

**Required Actions:**

**Option 1: Fix Errors (Recommended)**
- Open `src/liveavatar/useCustomVoiceChat.ts`
- Fix undefined value issues
- Add proper type guards

**Option 2: Comment Out (Quick Fix)**
```typescript
// Temporarily comment out problematic code if not used
```

**Expected After Fix:**
```
✅ PASSED
No TypeScript errors
```

**Validation Checklist:**
- [ ] `pnpm typecheck` exits with code 0
- [ ] No errors in output
- [ ] All .ts and .tsx files compile

**Result:** ✅ PASS / ❌ FAIL (Currently FAIL - BLOCKER)

---

## 🚀 TASK 4: INTEGRATION IMPLEMENTATION

**⚠️ DO NOT START until all Pre-Tests PASS**

---

### Step 4.1: Import useWebSocketTTS Hook

**Time:** 10 minutes

**File:** `apps/demo/src/components/LiveAvatarSession.tsx`

**Changes:**

**4.1.1: Add Import**

Location: Line ~13 (in imports section)

```typescript
// Add this line
import { useWebSocketTTS } from "../liveavatar/useWebSocketTTS";
```

**After:**
```typescript
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
import { useWebSocketTTS } from "../liveavatar/useWebSocketTTS"; // 🆕 NEW
```

**🧪 Test Point 4.1.1:**
```bash
pnpm typecheck
```
**Expected:** No import errors for `useWebSocketTTS`

---

**4.1.2: Initialize Hook**

Location: After line ~104 (after `useElevenLabsRealtimeSTT` hook)

```typescript
// Add this block
const {
  isConnected: isWSTTSConnected,
  isSynthesizing: isWSTTSSynthesizing,
  progress: wsTTSProgress,
  connect: connectWSTTS,
  disconnect: disconnectWSTTS,
  synthesize: synthesizeWSTTS,
} = useWebSocketTTS({
  wsUrl: 'ws://localhost:3013/ws/elevenlabs-tts',
  voiceId: 'moBQ5vcoHD68Es6NqdGR', // George (English) - can change
  modelId: 'eleven_v3',
  autoConnect: false, // Manual control
  onAudioChunk: (chunkIndex, totalChunks, text) => {
    console.log(`🔊 [WS-TTS] Chunk ${chunkIndex + 1}/${totalChunks}: "${text.substring(0, 30)}..."`);
  },
  onComplete: (totalChunks) => {
    console.log(`✅ [WS-TTS] Synthesis completed - ${totalChunks} chunks`);
  },
  onError: (error) => {
    console.error('❌ [WS-TTS] Error:', error);
  },
  onConnectionChange: (connected) => {
    console.log(`🔌 [WS-TTS] Connection: ${connected ? 'Connected ✅' : 'Disconnected ❌'}`);
  }
});
```

**🧪 Test Point 4.1.2:**
```bash
# TypeScript check
pnpm typecheck

# Expected: No errors related to useWebSocketTTS
```

**🧪 Test Point 4.1.3: Hook Initialization Test**

Start dev server:
```bash
pnpm dev
# Open http://localhost:3012
```

**Browser Console (Should NOT see any WS-TTS logs yet):**
- No connection attempts (because `autoConnect: false`)
- No errors

**Validation:**
- [ ] Page loads without errors
- [ ] No WebSocket connection auto-started
- [ ] TypeScript compiles successfully

---

**4.1.3: Auto-Connect/Disconnect useEffect**

Location: After line ~171 (after existing useEffect hooks)

```typescript
// Add this useEffect
useEffect(() => {
  if (mode === 'CUSTOM') {
    console.log('🔌 [WS-TTS] Auto-connecting to WebSocket TTS server...');
    connectWSTTS();
  }

  return () => {
    if (mode === 'CUSTOM') {
      console.log('🔌 [WS-TTS] Disconnecting from WebSocket TTS server...');
      disconnectWSTTS();
    }
  };
}, [mode, connectWSTTS, disconnectWSTTS]);
```

**🧪 Test Point 4.1.4: Auto-Connect Test**

**Prerequisites:**
- WebSocket server running: `pnpm ws-tts`
- Next.js dev running: `pnpm dev`

**Steps:**
1. Open `http://localhost:3012`
2. Select **CUSTOM mode**
3. Check browser console

**Expected Browser Console:**
```
🔌 [WS-TTS] Auto-connecting to WebSocket TTS server...
🔌 Connecting to ws://localhost:3013/ws/elevenlabs-tts...
✅ WebSocket connection established
🔌 [WS-TTS] Connection: Connected ✅
```

**Expected Server Console:**
```
📞 New client connected from ::1
```

**Validation Checklist:**
- [ ] Connection established automatically on CUSTOM mode
- [ ] No connection in FULL mode
- [ ] Server receives connection
- [ ] No errors in console

**Test Cleanup:**
1. Switch to FULL mode
2. Expected: `"🔌 [WS-TTS] Disconnecting..."`
3. Switch back to CUSTOM mode
4. Expected: Reconnects automatically

**Result:** ✅ PASS / ❌ FAIL

---

### Step 4.2: Modify handleVoiceToVoice()

**Time:** 20-30 minutes

**Goal:** Replace REST API TTS with WebSocket TTS

**Location:** Lines 107-152 (entire `handleVoiceToVoice` function)

**Original Code (REST API):**
```typescript
const handleVoiceToVoice = useCallback(async () => {
  try {
    const combinedText = getCombinedTranscript();
    if (!combinedText || combinedText.trim().length === 0) {
      console.log("⚠️ No transcript to process");
      return;
    }

    console.log("🚀 [V2V] Starting Voice-to-Voice flow...");

    // 1. OpenAI Chat
    const chatRes = await fetch("/api/openai-chat-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: combinedText }),
    });
    const { response: aiResponse } = await chatRes.json();
    console.log("✅ [V2V] AI Response:", aiResponse);

    // 2. REST API TTS (OLD)
    console.log("🔊 [V2V] Converting to speech...");
    const ttsRes = await fetch("/api/elevenlabs-text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: aiResponse }),
    });
    const { audio } = await ttsRes.json();
    console.log("✅ [V2V] TTS Audio generated");

    // 3. Avatar lip-sync
    if (sessionRef.current) {
      console.log("👄 [V2V] Sending to Avatar...");
      await sessionRef.current.repeatAudio(audio);
      console.log("✅ [V2V] Avatar speaking!");
    }
  } catch (error) {
    console.error("❌ [V2V] Error:", error);
  }
}, [getCombinedTranscript, sessionRef]);
```

**New Code (WebSocket TTS):**
```typescript
const handleVoiceToVoice = useCallback(async () => {
  try {
    const combinedText = getCombinedTranscript();
    if (!combinedText || combinedText.trim().length === 0) {
      console.log("⚠️ [V2V] No transcript to process");
      return;
    }

    console.log("🚀 [V2V] Starting Voice-to-Voice flow...");
    console.log("📝 [V2V] Transcript:", combinedText);

    // 1. OpenAI Chat (unchanged)
    console.log("🤖 [V2V] Sending to OpenAI...");
    const chatRes = await fetch("/api/openai-chat-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: combinedText }),
    });
    const { response: aiResponse } = await chatRes.json();
    console.log("✅ [V2V] AI Response:", aiResponse);

    // 2. WebSocket TTS (NEW!)
    console.log("🔊 [V2V] Converting to speech via WebSocket TTS...");

    // Ensure WebSocket is connected
    if (!isWSTTSConnected) {
      console.log("⚠️ [V2V] WebSocket not connected, connecting...");
      await connectWSTTS();
      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Synthesize via WebSocket
    await synthesizeWSTTS(aiResponse);
    console.log("✅ [V2V] WebSocket TTS synthesis started");
    console.log("🔊 [V2V] Audio will play automatically via Web Audio API");

    // Note: Audio plays automatically via useWebSocketTTS hook
    // No need to call repeatAudio() unless you want Avatar lip-sync

  } catch (error) {
    console.error("❌ [V2V] Error:", error);
  }
}, [
  getCombinedTranscript,
  isWSTTSConnected,
  connectWSTTS,
  synthesizeWSTTS
]);
```

**🧪 Test Point 4.2.1: Code Compilation**

```bash
pnpm typecheck
```

**Expected:** No TypeScript errors

---

**🧪 Test Point 4.2.2: Basic V2V Flow Test**

**Prerequisites:**
- Terminal 1: `pnpm ws-tts` (WebSocket server running)
- Terminal 2: `pnpm dev` (Next.js running)
- Browser: `http://localhost:3012`

**Test Steps:**
1. Select **CUSTOM mode**
2. Click "Start Realtime Voice Chat"
3. Say: "Hello, how are you?"
4. Click "Stop & Process with Avatar"
5. Observe console logs

**Expected Browser Console:**
```
🚀 [V2V] Starting Voice-to-Voice flow...
📝 [V2V] Transcript: Hello, how are you?
🤖 [V2V] Sending to OpenAI...
✅ [V2V] AI Response: I'm doing well, thank you for asking!
🔊 [V2V] Converting to speech via WebSocket TTS...
🔌 [WS-TTS] Connection: Connected ✅
📤 TTS request sent
📨 Received message type: audio_chunk
🔊 [WS-TTS] Chunk 1/2: "I'm doing well,"
📦 Received audio chunk 1/2
➕ Added to queue (queue size: 1)
🎵 Decoded audio chunk: 0.85s
▶️ Playing audio chunk
📨 Received message type: audio_chunk
🔊 [WS-TTS] Chunk 2/2: "thank you for asking!"
✅ Chunk playback finished
✅ [V2V] WebSocket TTS synthesis started
✅ [WS-TTS] Synthesis completed - 2 chunks
```

**Expected Server Console:**
```
📨 Received message type: tts
🔪 Starting delimiter-based text chunking...
✂️ Chunk 1: "I'm doing well,"
✂️ Chunk 2: "thank you for asking!"
✅ Text chunked into 2 chunks
[... TTS processing logs ...]
✅ TTS processing completed
```

**Validation Checklist:**
- [ ] Voice chat records audio
- [ ] Transcript appears
- [ ] OpenAI responds
- [ ] WebSocket TTS triggers
- [ ] Audio chunks received
- [ ] Audio plays sequentially
- [ ] Voice is clear
- [ ] No errors

**Result:** ✅ PASS / ❌ FAIL

---

### Step 4.3: Add UI Status Display

**Time:** 15-20 minutes

**Goal:** Show WebSocket TTS connection and progress in UI

**Location:** Lines 239-285 (`RealtimeSTTComponents` section)

**Original Code:**
```typescript
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
      {/* ... buttons ... */}
    </div>
  </>
);
```

**New Code (with WebSocket TTS status):**
```typescript
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
              disconnectRealtimeSTT();
              await new Promise(resolve => setTimeout(resolve, 100));
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
          onClick={() => resetRealtimeSTT()}
          disabled={!isRealtimeSTTConnected || isWSTTSSynthesizing}
        >
          Reset Transcript
        </Button>
      </div>
    </div>
  </>
);
```

**🧪 Test Point 4.3.1: UI Display Test**

**Steps:**
1. Open `http://localhost:3012` (CUSTOM mode)
2. Observe WebSocket TTS status section

**Expected UI:**
```
┌─────────────────────────────────────┐
│ ElevenLabs Realtime STT             │
│ STT Connected: false                │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ WebSocket TTS:    ✅ Connected  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Start Realtime Voice Chat]         │
└─────────────────────────────────────┘
```

**Validation:**
- [ ] "WebSocket TTS" section visible
- [ ] Shows "✅ Connected" (green)
- [ ] No synthesis progress (nothing synthesizing yet)

---

**🧪 Test Point 4.3.2: Synthesis Progress Test**

**Steps:**
1. Start voice chat
2. Say something long: "Hello, this is a test. How are you today? I hope you're doing well!"
3. Click "Stop & Process"
4. Watch UI during synthesis

**Expected UI (during synthesis):**
```
┌─────────────────────────────────────┐
│ WebSocket TTS:    ✅ Connected      │
│ ┌─────────────────────────────────┐ │
│ │ 🔊 Synthesizing...    2/5 chunks│ │
│ │ "this is a test..."              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [🔊 Speaking...] (button disabled)  │
└─────────────────────────────────────┘
```

**Validation:**
- [ ] Progress counter updates (1/5, 2/5, etc.)
- [ ] Current chunk text shows
- [ ] Button changes to "🔊 Speaking..."
- [ ] Button is disabled during synthesis
- [ ] After completion, button re-enables

**Result:** ✅ PASS / ❌ FAIL

---

### Step 4.4: Final Integration Testing

**Time:** 30-45 minutes

**Test all scenarios end-to-end**

#### Test 4.4.1: Happy Path (Thai)

**Input:** "สวัสดีครับ วันนี้อากาศดีมาก"

**Expected Flow:**
1. STT → Transcript appears
2. Click "Stop & Process"
3. OpenAI → Thai response
4. WebSocket TTS → Thai audio chunks
5. Sequential audio playback
6. Clear Thai pronunciation

**Validation:** ✅ / ❌

---

#### Test 4.4.2: Happy Path (English)

**Input:** "What's the weather like today?"

**Expected:** Same flow, English audio

**Validation:** ✅ / ❌

---

#### Test 4.4.3: Long Response

**Input:** "Tell me a long story"

**Expected:**
- AI gives 200+ word response
- Multiple chunks (10-20)
- All chunks play sequentially
- Progress indicator accurate
- No audio gaps or overlaps

**Validation:** ✅ / ❌

---

#### Test 4.4.4: Network Interruption

**Steps:**
1. Start synthesis
2. Kill WebSocket server mid-synthesis
3. Observe recovery

**Expected:**
- Error detected
- UI shows "❌ Disconnected"
- Synthesis stops gracefully
- Restart server → Auto-reconnects

**Validation:** ✅ / ❌

---

#### Test 4.4.5: Rapid Requests

**Steps:**
1. Click "Stop & Process" multiple times quickly

**Expected:**
- Previous synthesis cancelled
- New synthesis starts
- No queue buildup
- No crashes

**Validation:** ✅ / ❌

---

#### Test 4.4.6: Mode Switching

**Steps:**
1. CUSTOM mode → Start synthesis
2. Switch to FULL mode mid-synthesis

**Expected:**
- WebSocket disconnects
- Synthesis stops
- Clean state reset

**Validation:** ✅ / ❌

---

## 📊 Final Validation Checklist

### Code Quality
- [ ] TypeScript compiles with no errors
- [ ] No ESLint warnings
- [ ] Code follows project conventions
- [ ] All console.logs meaningful and helpful

### Functionality
- [ ] WebSocket connection stable
- [ ] CORS working correctly
- [ ] Audio plays sequentially
- [ ] Progress tracking accurate
- [ ] Error handling robust
- [ ] State management clean

### User Experience
- [ ] UI updates reflect state correctly
- [ ] Loading indicators work
- [ ] Buttons disable appropriately
- [ ] Error messages clear
- [ ] Audio quality good
- [ ] Latency acceptable (<2s first chunk)

### Edge Cases
- [ ] Empty transcript handled
- [ ] Network errors handled
- [ ] Server restart recovery
- [ ] Multiple rapid clicks handled
- [ ] Long text (1000+ chars) works
- [ ] Special characters in text OK

---

## 🎯 Success Criteria

**Task 4 is COMPLETE when:**

✅ **All Pre-Tests Pass**
✅ **Integration Code Merged**
✅ **UI Shows WebSocket TTS Status**
✅ **End-to-End V2V Works**
✅ **No TypeScript Errors**
✅ **All Test Cases Pass**
✅ **Performance Acceptable** (first chunk <2s)
✅ **Documentation Updated**

---

## 📝 Next Steps After Task 4

Once Task 4 complete → **Task 5: Testing & Documentation**

1. Write comprehensive test cases
2. Document API usage
3. Update V2V_REALTIME.md status
4. Performance benchmarking
5. Production readiness checklist

---

**Estimated Total Time:** 1.5-2 hours (if all pre-tests pass)
**Current Blocker:** TypeScript errors in useCustomVoiceChat.ts

**Ready to start?** Fix TypeScript errors first! 🚀
