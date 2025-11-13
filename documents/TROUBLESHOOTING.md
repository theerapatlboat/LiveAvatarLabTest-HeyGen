# TROUBLESHOOTING: ElevenLabs Realtime STT Integration

## ปัญหา: Connection สำเร็จแต่ไม่มี Transcript ออกมา

### 🔍 Symptoms (อาการ)
- ✅ "SESSION_STARTED" แสดงใน console
- ✅ "Connected: true" แสดงใน UI
- ✅ Microphone permission ได้รับอนุญาตแล้ว
- ❌ แต่เมื่อพูดเข้าไมค์ ไม่มี PARTIAL_TRANSCRIPT หรือ COMMITTED_TRANSCRIPT logs
- ❌ ไม่เห็น partial text หรือ final text แสดงใน UI
- ✅ ปุ่ม "Hold to Talk" (OpenAI Whisper) ทำงานได้ปกติ

### 🐛 Root Cause (สาเหตุหลัก)

#### **PRIMARY ISSUE: Missing `microphone` Configuration Object** ⚠️

**นี่คือสาเหตุหลักของปัญหา!**

SDK ต้องการ `microphone` configuration object เพื่อเปิดใช้งาน **automatic microphone capture**:

```typescript
// ❌ ปัญหา: ไม่มี microphone config - Connection สำเร็จแต่ไม่มีการจับเสียง!
const connection = Scribe.connect({
  token,
  modelId: "scribe_v2_realtime",
  languageCode: "th",
  // ... missing microphone config!
});
```

**ผลกระทบ:**
- Connection จะเชื่อมต่อสำเร็จ (SESSION_STARTED event fires)
- แต่ SDK จะ**ไม่เริ่มจับเสียงจากไมค์โดยอัตโนมัติ**
- ไม่มี audio stream ส่งไปที่ ElevenLabs API
- จึงไม่มี transcripts ออกมา

**✅ วิธีแก้ (CRITICAL FIX):**
```typescript
const connection = Scribe.connect({
  token,
  modelId: "scribe_v2_realtime",
  languageCode: "th",
  audioFormat: AudioFormat.PCM_16000,
  commitStrategy: CommitStrategy.VAD,
  // ✅ เพิ่ม microphone config เพื่อเปิดใช้งาน automatic capture
  microphone: {
    echoCancellation: true,    // ลด echo
    noiseSuppression: true,     // ลด background noise
    autoGainControl: true,      // ปรับระดับเสียงอัตโนมัติ
  },
});
```

**อ้างอิง:** [ElevenLabs Realtime STT Documentation](https://elevenlabs.io/docs/cookbooks/speech-to-text/streaming)

---

#### 2. **Secondary Issue: React useCallback Dependency** (แก้ไขแล้ว)

```typescript
// ❌ ปัญหารอง: config object ใน dependency array
const connect = useCallback(async () => {
  // ... code that uses config
}, [config]); // config เป็น object ที่ถูกสร้างใหม่ทุก render
```

**✅ วิธีแก้:**
```typescript
// ใช้ ref แทน direct config access
const callbacksRef = useRef(config);

useEffect(() => {
  callbacksRef.current = config;
}, [config]);

const connect = useCallback(async () => {
  // ใช้ callbacksRef.current แทน config
  const connection = Scribe.connect({
    languageCode: callbacksRef.current.languageCode || "th",
    // ...
  });
}, []); // Empty dependency array
```

### 🔧 Solution (วิธีแก้ปัญหา)

#### Step 1: แก้ไข `useElevenLabsRealtimeSTT.ts`

ไฟล์: `apps/demo/src/liveavatar/useElevenLabsRealtimeSTT.ts`

**การแก้ไขที่ทำแล้ว:**

1. **✅ CRITICAL: เพิ่ม `microphone` configuration object เพื่อเปิดใช้ automatic audio capture**
2. **✅ เพิ่ม callback refs เพื่อหลีกเลี่ยง dependency issues**
3. **✅ เพิ่ม detailed logging เพื่อ debug**
4. **✅ ปรับปรุง event listeners**

```typescript
import { useRef, useState, useCallback, useEffect } from 'react';
import { Scribe, AudioFormat, RealtimeEvents, CommitStrategy } from "@elevenlabs/client";

interface ScribeConfig {
  languageCode?: string;
  onPartialTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string, timestamps?: any) => void;
  onError?: (error: any) => void;
}

export function useElevenLabsRealtimeSTT(config: ScribeConfig = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [partialText, setPartialText] = useState('');
  const [finalText, setFinalText] = useState('');
  const connectionRef = useRef<any>(null);

  // ✅ FIX: Store callbacks in refs to avoid dependency issues
  const callbacksRef = useRef(config);

  // ✅ FIX: Update callbacks ref when config changes
  useEffect(() => {
    callbacksRef.current = config;
  }, [config]);

  const connect = useCallback(async () => {
    try {
      console.log('🔌 Starting connection to ElevenLabs Scribe...');

      // 1. Get single-use token from backend
      const tokenRes = await fetch('/api/elevenlabs-stt-token', {
        method: 'POST'
      });
      const { token } = await tokenRes.json();
      console.log('✅ Token received');

      // 2. Connect with Scribe SDK
      console.log('🎤 Requesting microphone access...');

      const connection = Scribe.connect({
        token,
        modelId: "scribe_v2_realtime",
        languageCode: callbacksRef.current.languageCode || "th",
        audioFormat: AudioFormat.PCM_16000,
        commitStrategy: CommitStrategy.VAD,
        vadSilenceThresholdSecs: 1.5,
        vadThreshold: 0.4,
        minSpeechDurationMs: 100,
        minSilenceDurationMs: 100,
        // ✅ CRITICAL FIX: Enable automatic microphone capture
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      } as any);

      console.log('📦 Connection object created');
      connectionRef.current = connection;

      // 3. Handle events with proper logging
      connection.on(RealtimeEvents.SESSION_STARTED, () => {
        console.log('✅ SESSION_STARTED - ElevenLabs Scribe session started');
        console.log('🎙️ You can now speak into your microphone...');
        setIsConnected(true);
      });

      connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data: any) => {
        console.log('🎤 PARTIAL_TRANSCRIPT:', data.text);
        setPartialText(data.text);
        callbacksRef.current.onPartialTranscript?.(data.text);
      });

      connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data: any) => {
        console.log('✅ COMMITTED_TRANSCRIPT:', data.text);
        setFinalText(prev => prev + ' ' + data.text);
        callbacksRef.current.onFinalTranscript?.(data.text);
        setPartialText('');
      });

      connection.on(RealtimeEvents.ERROR, (error: any) => {
        console.error('❌ ERROR:', error);
        callbacksRef.current.onError?.(error);
      });

      connection.on(RealtimeEvents.CLOSE, () => {
        console.log('🔌 CONNECTION CLOSED');
        setIsConnected(false);
      });

    } catch (error) {
      console.error('❌ Failed to connect:', error);
      callbacksRef.current.onError?.(error);
    }
  }, []); // ✅ Empty dependency array - callbacks handled via ref

  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    setIsConnected(false);
    setPartialText('');
  }, []);

  const reset = useCallback(() => {
    setFinalText('');
    setPartialText('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    partialText,
    finalText,
    connect,
    disconnect,
    reset
  };
}
```

#### Step 2: ทดสอบหลังจากแก้ไข

1. **Refresh browser** (Hard refresh: Ctrl+Shift+R)
2. **Clear console** (คลิก clear button หรือกด Ctrl+L)
3. **Start Session** → เลือก CUSTOM Mode
4. **Click "Start Realtime Voice Chat"**
5. **อนุญาต Microphone** (ถ้าถูกถาม)
6. **พูดเข้าไมค์** เช่น "สวัสดีครับ"

**Expected Logs:**
```
🔌 Starting connection to ElevenLabs Scribe...
✅ Token received
🎤 Requesting microphone access...
📦 Connection object created
✅ SESSION_STARTED - ElevenLabs Scribe session started
🎙️ You can now speak into your microphone...
🎤 PARTIAL_TRANSCRIPT: สวัส
🎤 PARTIAL_TRANSCRIPT: สวัสดี
🎤 PARTIAL_TRANSCRIPT: สวัสดีครับ
✅ COMMITTED_TRANSCRIPT: สวัสดีครับ
```

### 🔍 Additional Debugging Steps

#### 1. ตรวจสอบ SDK Version
```bash
# ใน terminal
cd apps/demo
pnpm list @elevenlabs/client

# Expected: @elevenlabs/client@0.10.0
```

#### 2. ตรวจสอบ Microphone Permission
```javascript
// ใน Browser Console
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone access granted:', stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.error('❌ Microphone access denied:', error);
  });
```

#### 3. ทดสอบ SDK โดยตรง
```javascript
// ใน Browser Console (หลังจากรันโปรเจ็คแล้ว)
(async () => {
  const { Scribe, AudioFormat, RealtimeEvents, CommitStrategy } =
    await import('@elevenlabs/client');

  const tokenRes = await fetch('/api/elevenlabs-stt-token', { method: 'POST' });
  const { token } = await tokenRes.json();

  const connection = Scribe.connect({
    token,
    modelId: "scribe_v2_realtime",
    languageCode: "th",
    audioFormat: AudioFormat.PCM_16000,
    commitStrategy: CommitStrategy.VAD,
    vadSilenceThresholdSecs: 1.5,
    vadThreshold: 0.4,
    minSpeechDurationMs: 100,
    minSilenceDurationMs: 100,
    // ✅ CRITICAL: Enable microphone capture
    microphone: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  connection.on(RealtimeEvents.SESSION_STARTED, () => {
    console.log('✅ Test: Session started');
  });

  connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data) => {
    console.log('✅ Test: Partial:', data.text);
  });

  connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data) => {
    console.log('✅ Test: Final:', data.text);
  });

  window.testConnection = connection;
})();
```

### ⚠️ Known Issues

#### 1. Browser Compatibility
**Issue:** Safari และบาง browser versions ไม่รองรับ WebSocket features ของ SDK

**Solution:**
- ใช้ Chrome, Edge, หรือ Firefox (latest versions)
- Check browser support: https://caniuse.com/websockets

#### 2. HTTPS Required
**Issue:** บาง browser ต้องการ HTTPS สำหรับ microphone access

**Current Setup:** localhost อนุญาตให้ใช้ HTTP ได้
**Production:** ต้องใช้ HTTPS

#### 3. Token Expiration
**Issue:** Token หมดอายุใน 15 นาที

**Symptoms:**
- Connection ทำงานปกติ แล้วหยุดทันที
- เห็น AUTH_ERROR ใน console

**Solution:**
- Disconnect และ Connect ใหม่
- Implement auto token refresh (future enhancement)

#### 4. Multiple Microphone Inputs
**Issue:** ถ้ามี microphone หลายตัว SDK อาจเลือกผิด

**Solution:**
```javascript
// Check available devices
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const audioInputs = devices.filter(d => d.kind === 'audioinput');
    console.log('Available microphones:', audioInputs);
  });
```

### 📊 Comparison: Working vs Not Working

| Aspect | ❌ Not Working | ✅ Working |
|--------|---------------|-----------|
| **SESSION_STARTED** | ✅ Shows | ✅ Shows |
| **Microphone Permission** | ✅ Granted | ✅ Granted |
| **PARTIAL_TRANSCRIPT** | ❌ No logs | ✅ Shows while speaking |
| **COMMITTED_TRANSCRIPT** | ❌ No logs | ✅ Shows after silence |
| **UI Partial Text** | ❌ Empty | ✅ Updates real-time |
| **UI Final Text** | ❌ Empty | ✅ Shows after commit |

### 🎯 Quick Fix Checklist

- [ ] แก้ไข `useElevenLabsRealtimeSTT.ts` ตามด้านบน
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Clear browser cache ถ้าจำเป็น
- [ ] ตรวจสอบ console ว่ามี detailed logs
- [ ] ทดสอบพูดภาษาไทย เช่น "สวัสดีครับ"
- [ ] ตรวจสอบว่าเห็น PARTIAL_TRANSCRIPT logs
- [ ] ตรวจสอบว่าเห็น COMMITTED_TRANSCRIPT logs

### 💡 Tips

1. **ถ้ายังไม่ work:**
   - ลอง disconnect และ connect ใหม่
   - ลองใช้ microphone อื่น
   - ลองเปลี่ยน browser

2. **ถ้า partial transcripts ไม่แสดง:**
   - ตรวจสอบว่าพูดดังพอหรือไม่
   - ลอง adjust `vadThreshold` (ลดค่าลง เช่น 0.2)
   - ตรวจสอบว่าไม่มี background noise มาก

3. **ถ้า committed transcripts ออกช้า:**
   - ลด `vadSilenceThresholdSecs` (เช่น จาก 1.5 เป็น 1.0)
   - จะทำให้ commit เร็วขึ้นหลังจากเงียบ

### 📞 Support

ถ้ายังแก้ไขไม่ได้:
1. Check ElevenLabs API status: https://status.elevenlabs.io/
2. Review ElevenLabs SDK docs: https://elevenlabs.io/docs/cookbooks/speech-to-text/streaming
3. Check browser console for any errors
4. Try the manual SDK test (above) to isolate the issue

---

## 📋 Summary

### The Problem
Connection to ElevenLabs Scribe v2 Realtime was successful (SESSION_STARTED event fired), but no audio was captured from the microphone, resulting in no transcripts being generated.

### The Root Cause
**Missing `microphone` configuration object in `Scribe.connect()` call.**

The ElevenLabs SDK requires an explicit `microphone` configuration object to enable automatic microphone access and audio streaming. Without it:
- ✅ Connection establishes successfully
- ✅ SESSION_STARTED event fires
- ❌ **No audio is captured from the microphone**
- ❌ No transcripts are generated

### The Solution
Added the `microphone` configuration object with audio processing options:

```typescript
const connection = Scribe.connect({
  // ... other config
  microphone: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
});
```

### Files Modified
1. **`apps/demo/src/liveavatar/useElevenLabsRealtimeSTT.ts`** - Added microphone config
2. **`documents/TROUBLESHOOTING.md`** - Documented the issue and solution

### Verification Steps
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear console
3. Click "Start Realtime Voice Chat"
4. Allow microphone permission
5. Speak into microphone
6. **Expected:** PARTIAL_TRANSCRIPT and COMMITTED_TRANSCRIPT logs appear
7. **Expected:** Partial and final text displayed in UI

---

**Last Updated:** 2025-01-15
**Status:** ✅ Fixed - Missing microphone configuration resolved
**Critical Fix:** Added `microphone` object to enable automatic audio capture
