# TROUBLESHOOTING: Voice-to-Voice Integration

## 📑 Table of Contents
1. [WebSocket TTS Connection Failed](#websocket-tts-connection-failed)
2. [TypeScript Error: 'currentChunkText' is possibly 'undefined'](#typescript-error-currentchunktext-is-possibly-undefined)
3. [ELEVENLABS_API_KEY not configured (but exists in .env.local)](#elevenlabs_api_key-not-configured-but-exists-in-envlocal)
4. [404 Not Found: /test-ws-tts](#404-not-found-test-ws-tts)
5. [Module not found: Can't resolve '@/liveavatar/useWebSocketTTS'](#module-not-found-cant-resolve-liveavatarusewebsockettts)
6. [ElevenLabs Realtime STT - No Transcripts](#elevenlabs-realtime-stt-no-transcripts)

---

## ปัญหา: WebSocket TTS Connection Failed

### 🔍 Symptoms (อาการ)
- ❌ "Could not connect to ws://localhost:3013/ws/elevenlabs-tts"
- ❌ "Socket connection error. Please try again."
- ❌ Connection status shows "Disconnected"
- ❌ Cannot send TTS requests via WebSocket

### 🐛 Root Cause (สาเหตุหลัก)

#### **PRIMARY ISSUE: WebSocket Server Not Running** ⚠️

**นี่คือสาเหตุหลักของปัญหา!**

WebSocket TTS server ยังไม่ได้รัน ทำให้ client ไม่สามารถเชื่อมต่อได้

**ผลกระทบ:**
- ไม่สามารถเชื่อมต่อ WebSocket ได้
- ไม่สามารถใช้ WebSocket TTS streaming ได้
- ต้องใช้ REST API แทน (latency สูงกว่า)

### 🔧 Solution (วิธีแก้ปัญหา)

#### Step 1: ตรวจสอบว่า WebSocket Server ทำงานหรือไม่

**วิธีที่ 1: ตรวจสอบผ่าน Terminal**
```bash
# Windows
netstat -ano | findstr :3013

# Linux/Mac
lsof -i :3013

# Expected: ควรเห็น process ที่ listen บน port 3013
# ถ้าไม่มีผลลัพธ์ = server ไม่ได้รัน
```

**วิธีที่ 2: ตรวจสอบผ่าน Browser**
```
เปิด: http://localhost:3013

Expected:
✅ "ElevenLabs WebSocket TTS Server is running"

ถ้าเห็น error หรือไม่สามารถเชื่อมต่อ = server ไม่ได้รัน
```

#### Step 2: ตรวจสอบและสร้างไฟล์ .env

**ตำแหน่งไฟล์:** `apps/demo/.env`

```bash
# 1. ตรวจสอบว่ามีไฟล์ .env หรือไม่
cd apps/demo
ls -la .env

# ถ้าไม่มี ให้สร้างจาก .env.example
cp .env.example .env

# 2. แก้ไขไฟล์ .env
# เปิดไฟล์ apps/demo/.env และเพิ่ม ELEVENLABS_API_KEY
```

**เนื้อหาไฟล์ .env ที่จำเป็น:**
```env
# ElevenLabs API Configuration
# Get your API key from: https://elevenlabs.io/app/settings/api-keys
ELEVENLABS_API_KEY=your_actual_api_key_here
```

**⚠️ สำคัญมาก:**
- แทนที่ `your_actual_api_key_here` ด้วย API key จริงของคุณ
- รับ API key ได้ที่: https://elevenlabs.io/app/settings/api-keys
- ห้าม commit ไฟล์ .env ลง git (มีใน .gitignore แล้ว)

#### Step 3: รัน WebSocket TTS Server

**Terminal 1: เริ่ม WebSocket Server**
```bash
cd apps/demo
pnpm ws-tts
```

**Expected Output:**
```
🚀 Starting WebSocket TTS server...
📍 Port: 3013
🛤️  Path: /ws/elevenlabs-tts
✅ ElevenLabs API key found
✅ WebSocket TTS Server is listening on port 3013
🔗 Connect to: ws://localhost:3013/ws/elevenlabs-tts
💡 Use 'pnpm ws-tts' to start this server
```

**❌ ถ้าเห็น Error:**

**Error 1: "ELEVENLABS_API_KEY not found"**
```
⚠️ ELEVENLABS_API_KEY not found in environment variables
```
**Solution:** กลับไปทำ Step 2 - สร้างและตั้งค่าไฟล์ .env

**Error 2: "Port 3013 already in use"**
```
Error: listen EADDRINUSE: address already in use :::3013
```
**Solution:**
```bash
# Windows
netstat -ano | findstr :3013
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3013
kill -9 <PID>

# หรือเปลี่ยน PORT ในไฟล์ server/websocket-tts-server.ts
```

**Error 3: "Cannot find module 'ws'"**
```
Error: Cannot find module 'ws'
```
**Solution:**
```bash
cd apps/demo
pnpm install
# ลองรัน pnpm ws-tts อีกครั้ง
```

#### Step 4: ทดสอบการเชื่อมต่อ

**วิธีที่ 1: ใช้ WebSocket Testing Tool**

เปิดเว็บ: https://www.piesocket.com/websocket-tester

```
URL: ws://localhost:3013/ws/elevenlabs-tts
Click "Connect"

Expected:
✅ Status: "Connected"
✅ Receive message: {"type":"connected","message":"Connected to ElevenLabs WebSocket TTS Server","timestamp":"..."}
```

**วิธีที่ 2: ใช้ wscat (Command Line Tool)**

```bash
# ติดตั้ง wscat
npm install -g wscat

# เชื่อมต่อ WebSocket
wscat -c ws://localhost:3013/ws/elevenlabs-tts

# Expected:
# Connected (press CTRL+C to quit)
# < {"type":"connected","message":"Connected to ElevenLabs WebSocket TTS Server","timestamp":"..."}

# ทดสอบส่ง ping message
> {"type":"ping"}

# Expected response:
# < {"type":"pong","timestamp":"..."}
```

**วิธีที่ 3: ใช้ Browser Console**

```javascript
// เปิด Browser Console (F12) แล้วรัน:
const ws = new WebSocket('ws://localhost:3013/ws/elevenlabs-tts');

ws.onopen = () => console.log('✅ Connected');
ws.onmessage = (event) => console.log('📨 Message:', JSON.parse(event.data));
ws.onerror = (error) => console.error('❌ Error:', error);
ws.onclose = () => console.log('🔌 Disconnected');

// Expected:
// ✅ Connected
// 📨 Message: {type: "connected", message: "Connected to ElevenLabs WebSocket TTS Server", timestamp: "..."}
```

#### Step 5: รัน Next.js Application

**Terminal 2: เริ่ม Next.js (ในขณะที่ WebSocket server ยังรันอยู่)**
```bash
cd apps/demo
pnpm dev
```

**Expected Output:**
```
▲ Next.js 15.4.2
- Local:        http://localhost:3012
- Network:      http://xxx.xxx.xxx.xxx:3012

✓ Ready in 2.3s
```

#### Step 6: ทดสอบใน Application

```bash
# เปิดเบราว์เซอร์
http://localhost:3012

# ถ้ามี test page สำหรับ WebSocket TTS:
http://localhost:3012/test-elevenlabs-ws-tts.html

# Expected:
# ✅ เห็นปุ่ม "Connect to WebSocket"
# ✅ กดปุ่ม → Status เป็น "Connected"
# ✅ ไม่มี connection errors
```

### 🔍 Additional Debugging Steps

#### 1. ตรวจสอบ Server Logs

เมื่อ client พยายามเชื่อมต่อ ควรเห็น logs ใน terminal ที่รัน `pnpm ws-tts`:

```
📞 New client connected from ::1
```

ถ้าไม่เห็น log = client ไม่ได้พยายามเชื่อมต่อจริง หรือ port ผิด

#### 2. ตรวจสอบ Firewall

**Windows:**
```bash
# ตรวจสอบว่า port 3013 ถูก block หรือไม่
netsh advfirewall firewall show rule name=all | findstr 3013

# ถ้า blocked ให้อนุญาต:
netsh advfirewall firewall add rule name="WebSocket TTS" dir=in action=allow protocol=TCP localport=3013
```

**Linux/Mac:**
```bash
# ตรวจสอบ firewall rules
sudo ufw status
sudo iptables -L -n

# อนุญาต port 3013 (ถ้าจำเป็น)
sudo ufw allow 3013/tcp
```

#### 3. ตรวจสอบ Network Configuration

```bash
# ตรวจสอบว่า server listen บน interface ไหน
# ใน server code ควร listen บน 0.0.0.0 (all interfaces) หรือ 127.0.0.1 (localhost only)

# ทดสอบเชื่อมต่อจาก localhost
curl http://localhost:3013

# Expected: "ElevenLabs WebSocket TTS Server is running"
```

### ⚠️ Common Mistakes

#### 1. ลืมรัน WebSocket Server
**Mistake:** รัน `pnpm dev` อย่างเดียว โดยไม่ได้รัน `pnpm ws-tts`

**Solution:** ต้องรัน **2 terminals พร้อมกัน**:
- Terminal 1: `pnpm ws-tts` (WebSocket server)
- Terminal 2: `pnpm dev` (Next.js app)

#### 2. Port ไม่ตรงกัน
**Mistake:** Server รันบน port อื่น แต่ client พยายามเชื่อมต่อ 3013

**Solution:** ตรวจสอบว่า port ตรงกัน:
- Server: `apps/demo/server/websocket-tts-server.ts` → `const PORT = 3013;`
- Client: Connection URL → `ws://localhost:3013/ws/elevenlabs-tts`

#### 3. Path ไม่ถูกต้อง
**Mistake:** เชื่อมต่อไปที่ `ws://localhost:3013` (ไม่มี path)

**Solution:** ต้องมี path `/ws/elevenlabs-tts`:
- ❌ `ws://localhost:3013`
- ✅ `ws://localhost:3013/ws/elevenlabs-tts`

#### 4. ไม่มี ELEVENLABS_API_KEY
**Mistake:** ไม่ได้ตั้งค่า API key ในไฟล์ .env

**Solution:**
- สร้างไฟล์ `apps/demo/.env`
- เพิ่ม `ELEVENLABS_API_KEY=your_actual_key`
- Restart WebSocket server

### 📊 Troubleshooting Checklist

- [ ] ✅ WebSocket server รันอยู่ (`pnpm ws-tts`)
- [ ] ✅ เห็น log "WebSocket TTS Server is listening on port 3013"
- [ ] ✅ Port 3013 available (ไม่ถูกใช้โดย process อื่น)
- [ ] ✅ ไฟล์ .env มี ELEVENLABS_API_KEY
- [ ] ✅ API key ถูกต้อง (ทดสอบที่ https://elevenlabs.io)
- [ ] ✅ Firewall ไม่ block port 3013
- [ ] ✅ Next.js app รันอยู่ (`pnpm dev`)
- [ ] ✅ Browser เปิดที่ http://localhost:3012
- [ ] ✅ Console ไม่มี WebSocket connection errors

### 💡 Quick Reference

**การรัน WebSocket TTS Server:**
```bash
# Terminal 1: WebSocket Server
cd apps/demo
pnpm ws-tts

# Terminal 2: Next.js App
cd apps/demo
pnpm dev

# Browser
http://localhost:3012
```

**ตรวจสอบ Connection:**
```bash
# Check if server is running
curl http://localhost:3013

# Check if port is open (Windows)
netstat -ano | findstr :3013

# Check if port is open (Linux/Mac)
lsof -i :3013
```

**WebSocket URL ที่ถูกต้อง:**
```
ws://localhost:3013/ws/elevenlabs-tts
```

---

## ปัญหา: TypeScript Error: 'currentChunkText' is possibly 'undefined'

### 🔍 Symptoms (อาการ)
- ❌ TypeScript error ในไฟล์ `apps/demo/server/websocket-tts-server.ts`
- ❌ Error message: `'currentChunkText' is possibly 'undefined'.ts(18048)`
- ❌ Error ที่บรรทัด: `console.log(\`📝 Text: "${currentChunkText.substring(0, 100)}...`
- ⚠️ Code ทำงานได้ แต่ TypeScript compiler แสดง warning

### 🐛 Root Cause (สาเหตุหลัก)

#### **PRIMARY ISSUE: Array Index Access Type Safety** ⚠️

**นี่คือสาเหตุหลักของปัญหา!**

TypeScript ไม่สามารถรับรองได้ว่าการเข้าถึง array ด้วย index จะได้ค่าที่ไม่ใช่ `undefined` เสมอ

```typescript
// ❌ ปัญหา: TypeScript ไม่แน่ใจว่า chunks[i] มีค่า
for (let i = 0; i < chunks.length; i++) {
  const currentChunkText = chunks[i]; // Type: string | undefined
  console.log(currentChunkText.substring(0, 100)); // Error: possibly undefined
}
```

**ทำไมถึงเกิดปัญหา:**
- TypeScript array type เป็น `string[]` แต่การเข้าถึงด้วย index คืนค่า `string | undefined`
- แม้ว่าเราจะตรวจสอบ `chunks.length > 0` แล้ว TypeScript ก็ยังไม่สามารถ infer ได้ว่า `chunks[i]` มีค่าแน่นอน
- นี่เป็น safety feature ของ TypeScript เพื่อป้องกัน runtime errors

**ผลกระทบ:**
- TypeScript compilation แสดง error
- IDE แสดง red underline
- ไม่สามารถใช้ `pnpm typecheck` ได้
- Code ยังทำงานได้ปกติ (runtime ไม่มีปัญหา) แต่ไม่ผ่าน type checking

### 🔧 Solution (วิธีแก้ปัญหา)

#### วิธีที่ 1: เพิ่ม Type Guard (แนะนำ) ✅

เพิ่มการตรวจสอบว่า chunk มีค่าก่อนใช้งาน:

```typescript
// ✅ วิธีแก้: เพิ่ม type guard
for (let i = 0; i < chunks.length; i++) {
  const currentChunkText = chunks[i];
  const chunkIndex = i;
  const totalChunks = chunks.length;

  // Type guard: ensure chunk text exists
  if (!currentChunkText) {
    console.warn(`⚠️ Skipping empty chunk at index ${chunkIndex}`);
    continue;
  }

  // หลังจากนี้ TypeScript รู้ว่า currentChunkText เป็น string แน่นอน
  console.log(`📝 Text: "${currentChunkText.substring(0, 100)}..."`);
  // ... ใช้งาน currentChunkText ได้โดยไม่มี error
}
```

**ข้อดี:**
- ✅ ปลอดภัยที่สุด - ป้องกัน runtime errors
- ✅ ผ่าน TypeScript checking
- ✅ Handle edge cases (ถ้ามี empty chunks)
- ✅ เพิ่ม logging สำหรับ debugging

#### วิธีที่ 2: ใช้ Non-null Assertion Operator (ไม่แนะนำ) ⚠️

บอก TypeScript ว่าเรามั่นใจว่าค่าไม่ใช่ `undefined`:

```typescript
// ⚠️ ไม่แนะนำ: ใช้ ! เพื่อ override TypeScript
for (let i = 0; i < chunks.length; i++) {
  const currentChunkText = chunks[i]!; // ! = non-null assertion
  console.log(`📝 Text: "${currentChunkText.substring(0, 100)}..."`);
}
```

**ข้อเสีย:**
- ❌ ไม่ปลอดภัย - ถ้ามี bug อาจเกิด runtime error
- ❌ ไม่ handle edge cases
- ❌ Bad practice ใน production code

#### วิธีที่ 3: ใช้ Optional Chaining (ทางเลือก) 🔄

ใช้ optional chaining เพื่อ safe access:

```typescript
// 🔄 ทางเลือก: ใช้ optional chaining
for (let i = 0; i < chunks.length; i++) {
  const currentChunkText = chunks[i];
  if (!currentChunkText) continue;

  console.log(`📝 Text: "${currentChunkText.substring(0, 100)}..."`);
}
```

**ข้อดี:**
- ✅ ปลอดภัย
- ✅ กระชับกว่าวิธีที่ 1
- ✅ ผ่าน TypeScript checking

### 🔍 Code Changes Required

**ไฟล์ที่ต้องแก้:** `apps/demo/server/websocket-tts-server.ts`

**ตำแหน่ง:** บรรทัด ~210-220

**Before (มี Error):**
```typescript
// Process each chunk with ElevenLabs API
try {
  for (let i = 0; i < chunks.length; i++) {
    const currentChunkText = chunks[i];  // ❌ Type: string | undefined
    const chunkIndex = i;
    const totalChunks = chunks.length;

    console.log(`\n🎯 Processing chunk ${chunkIndex + 1}/${totalChunks}`);
    console.log(`📝 Text: "${currentChunkText.substring(0, 100)}..."`);  // ❌ Error here

    try {
      // ... rest of code
```

**After (แก้ไขแล้ว):**
```typescript
// Process each chunk with ElevenLabs API
try {
  for (let i = 0; i < chunks.length; i++) {
    const currentChunkText = chunks[i];
    const chunkIndex = i;
    const totalChunks = chunks.length;

    // ✅ Type guard: ensure chunk text exists
    if (!currentChunkText) {
      console.warn(`⚠️ Skipping empty chunk at index ${chunkIndex}`);
      continue;
    }

    console.log(`\n🎯 Processing chunk ${chunkIndex + 1}/${totalChunks}`);
    console.log(`📝 Text: "${currentChunkText.substring(0, 100)}..."`);  // ✅ No error

    try {
      // ... rest of code
```

### 🧪 Testing Steps (ขั้นตอนการทดสอบ)

#### Step 1: ตรวจสอบว่าแก้ไขแล้ว

```bash
cd apps/demo

# ทดสอบ TypeScript type checking
npx tsc --noEmit --esModuleInterop server/websocket-tts-server.ts

# Expected: ไม่มี errors
```

#### Step 2: รัน Server เพื่อทดสอบ

```bash
# ตรวจสอบว่า .env มี ELEVENLABS_API_KEY
cat .env | grep ELEVENLABS_API_KEY

# รัน WebSocket server
pnpm ws-tts

# Expected:
# ✅ Server เริ่มต้นได้โดยไม่มี errors
# ✅ แสดง log "WebSocket TTS Server is listening on port 3013"
```

#### Step 3: ทดสอบ Edge Case

สร้าง test case เพื่อทดสอบว่า type guard ทำงาน:

```typescript
// เพิ่ม test code ชั่วคราวใน server
const testChunks = ['Hello', '', 'World', undefined, 'Test'];
console.log('Testing type guard with mixed chunks...');

for (let i = 0; i < testChunks.length; i++) {
  const chunk = testChunks[i];

  if (!chunk) {
    console.warn(`⚠️ Skipping empty chunk at index ${i}`);
    continue;
  }

  console.log(`✅ Valid chunk ${i}: "${chunk}"`);
}

// Expected output:
// ✅ Valid chunk 0: "Hello"
// ⚠️ Skipping empty chunk at index 1
// ✅ Valid chunk 2: "World"
// ⚠️ Skipping empty chunk at index 3
// ✅ Valid chunk 4: "Test"
```

### 📊 Verification Checklist

- [ ] ✅ แก้ไข code เพิ่ม type guard ใน `websocket-tts-server.ts`
- [ ] ✅ รัน `npx tsc --noEmit` ผ่านโดยไม่มี errors
- [ ] ✅ IDE ไม่แสดง red underline ที่ `currentChunkText`
- [ ] ✅ รัน `pnpm ws-tts` ได้โดยไม่มี runtime errors
- [ ] ✅ ทดสอบ TTS request ทำงานได้ปกติ
- [ ] ✅ Logs แสดงผล "⚠️ Skipping empty chunk" เมื่อเจอ empty chunk (ถ้ามี)

### 💡 Best Practices

**1. เสมอใช้ Type Guards สำหรับ Array Access:**
```typescript
// ✅ Good: Always check before use
const item = array[index];
if (!item) return;
// use item safely

// ❌ Bad: Assume array[index] always exists
const item = array[index];
item.someMethod(); // May crash if undefined
```

**2. ใช้ Array Methods ที่ปลอดภัยกว่า:**
```typescript
// ✅ Better: Use array methods that handle undefined
chunks.forEach((chunk, index) => {
  if (!chunk) return; // Type guard
  // use chunk safely
});

// Or use filter first
chunks
  .filter((chunk): chunk is string => !!chunk)
  .forEach((chunk, index) => {
    // chunk is guaranteed to be string
  });
```

**3. Enable Strict TypeScript Options:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true  // Makes array[index] return T | undefined
  }
}
```

### ⚠️ Common Mistakes

#### 1. ลืมเพิ่ม Type Guard
**Mistake:** เพิ่ม type guard แต่ไม่ได้ return หรือ continue

```typescript
// ❌ ผิด: ไม่ได้ return/continue
if (!currentChunkText) {
  console.warn('Empty chunk');
  // ยังใช้ currentChunkText ต่อ -> จะ error
}
console.log(currentChunkText.length); // Error!

// ✅ ถูก: ต้อง return หรือ continue
if (!currentChunkText) {
  console.warn('Empty chunk');
  continue; // หรือ return
}
console.log(currentChunkText.length); // Safe
```

#### 2. ใช้ Non-null Assertion โดยไม่จำเป็น
**Mistake:** ใช้ `!` เพื่อ bypass TypeScript แทนที่จะแก้ปัญหาจริง

```typescript
// ❌ ผิด: Override TypeScript without checking
const chunk = chunks[i]!; // Assume not undefined
chunk.toUpperCase(); // May crash if actually undefined

// ✅ ถูก: Check first
const chunk = chunks[i];
if (chunk) {
  chunk.toUpperCase(); // Safe
}
```

### 📝 Related Issues

**ปัญหาที่เกี่ยวข้อง:**
1. TypeScript strict null checks
2. Array bounds checking
3. Runtime type safety

**วิธีป้องกัน:**
- เปิด `strict` mode ใน tsconfig.json
- ใช้ type guards สำหรับ array access ทุกครั้ง
- ใช้ array methods (map, filter, forEach) แทน for loops เมื่อเป็นไปได้
- เขียน unit tests สำหรับ edge cases

### 🔗 References

- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook: Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [MDN: Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)

---

## ปัญหา: ELEVENLABS_API_KEY not configured (but exists in .env.local)

### 🔍 Symptoms (อาการ)
- ✅ มี `ELEVENLABS_API_KEY` ในไฟล์ `apps/demo/.env.local` แล้ว
- ❌ WebSocket server แสดง error: `"ELEVENLABS_API_KEY not configured. Check environment variables"`
- ❌ เมื่อส่ง TTS request ไปยัง WebSocket server ได้รับ error response:
  ```json
  {
    "type": "error",
    "error": "ELEVENLABS_API_KEY not configured. Check environment variables",
    "timestamp": "2025-11-13T09:34:46.504Z"
  }
  ```
- ⚠️ Next.js app (`pnpm dev`) ทำงานได้ปกติ แต่ WebSocket server ไม่เห็น API key

### 🐛 Root Cause (สาเหตุหลัก)

#### **PRIMARY ISSUE: .env.local vs .env** ⚠️

**นี่คือสาเหตุหลักของปัญหา!**

Next.js และ WebSocket server ใช้ไฟล์ environment variables **คนละไฟล์**:

| ไฟล์ | ใช้โดย | โหลดอัตโนมัติ |
|------|---------|---------------|
| `.env.local` | Next.js app (`pnpm dev`) | ✅ YES |
| `.env` | WebSocket server (`pnpm ws-tts`) | ❌ NO (ต้องใช้ dotenv) |

**ทำไมถึงเกิดปัญหา:**

1. **Next.js โหลด `.env.local` อัตโนมัติ**
   - Next.js มี built-in support สำหรับ `.env.local`
   - เมื่อรัน `pnpm dev` → Next.js โหลด environment variables จาก `.env.local`
   - ทำให้ Next.js app เห็น `ELEVENLABS_API_KEY` ได้

2. **WebSocket server ไม่โหลดไฟล์ environment ใดๆ อัตโนมัติ**
   - WebSocket server รันด้วย `tsx` (TypeScript executor)
   - `tsx` **ไม่มี** built-in support สำหรับ `.env` หรือ `.env.local`
   - `process.env.ELEVENLABS_API_KEY` จึงเป็น `undefined`

3. **`.env.local` ไม่ได้ถูกใช้โดย standalone Node.js scripts**
   - `.env.local` เป็น Next.js convention
   - Node.js scripts ทั่วไปต้องใช้ `dotenv` library เพื่อโหลด `.env`

**ผลกระทบ:**
- ✅ Next.js app ทำงานได้ (มี API key)
- ❌ WebSocket server ทำงานไม่ได้ (ไม่มี API key)
- ❌ TTS requests ล้มเหลวทั้งหมด
- ❌ ไม่สามารถใช้ WebSocket TTS streaming ได้

### 🔧 Solution (วิธีแก้ปัญหา)

มี **2 วิธี** ในการแก้ปัญหานี้:

#### วิธีที่ 1: สร้างไฟล์ .env จาก .env.local (แนะนำ) ✅

**วิธีนี้เหมาะสำหรับ:** Development environment

**ขั้นตอน:**

```bash
cd apps/demo

# คัดลอก .env.local ไปเป็น .env
cp .env.local .env

# หรือบน Windows:
copy .env.local .env

# ตรวจสอบว่า .env ถูกสร้างแล้ว
cat .env | grep ELEVENLABS_API_KEY
```

**Expected output:**
```
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxx
```

**ข้อดี:**
- ✅ แก้ไขง่ายและรวดเร็ว
- ✅ ไม่ต้องแก้ไข code
- ✅ ใช้ได้ทันที

**ข้อเสีย:**
- ⚠️ ต้องมี 2 ไฟล์ (.env และ .env.local)
- ⚠️ ถ้าอัพเดต API key ต้องแก้ทั้ง 2 ไฟล์

#### วิธีที่ 2: แก้ไข WebSocket Server ให้โหลด .env ด้วย dotenv (แนะนำสำหรับ Production) ✅

**วิธีนี้เหมาะสำหรับ:** ต้องการแก้ปัญหาถาวร และทำให้ code มี portability สูง

**ขั้นตอน:**

**Step 1: ติดตั้ง `dotenv` package**

```bash
cd apps/demo
pnpm add dotenv
```

**Step 2: แก้ไข `server/websocket-tts-server.ts`**

เพิ่ม code ที่บรรทัดแรกๆ ของไฟล์:

```typescript
import type WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';  // ← เพิ่มบรรทัดนี้

// Load environment variables from .env file
dotenv.config();  // ← เพิ่มบรรทัดนี้

// Environment configuration
const PORT = 3013;
const WS_PATH = '/ws/elevenlabs-tts';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
```

**Step 3: สร้างไฟล์ .env**

```bash
cd apps/demo

# สร้างจาก .env.local
cp .env.local .env

# หรือสร้างใหม่
echo "ELEVENLABS_API_KEY=your_api_key_here" > .env
```

**Step 4: ทดสอบ**

```bash
# รัน WebSocket server
pnpm ws-tts

# Expected output:
# ✅ ElevenLabs API key found
# ✅ WebSocket TTS Server is listening on port 3013
```

**ข้อดี:**
- ✅ Server โหลด environment variables อัตโนมัติ
- ✅ ทำงานได้บนทุก environment (dev, staging, production)
- ✅ เป็น best practice สำหรับ Node.js projects
- ✅ รองรับ `.env`, `.env.local`, `.env.production` ฯลฯ

**ข้อเสีย:**
- ⚠️ ต้องติดตั้ง dependency เพิ่ม (dotenv)
- ⚠️ ต้องแก้ไข code

### 🧪 Testing Steps (ขั้นตอนการทดสอบ)

#### Step 1: ตรวจสอบว่ามีไฟล์ .env แล้ว

```bash
cd apps/demo

# ตรวจสอบว่ามีไฟล์ .env
ls -la .env

# Expected: -rw-r--r-- 1 user user 123 Nov 13 09:00 .env

# ตรวจสอบว่ามี ELEVENLABS_API_KEY
cat .env | grep ELEVENLABS_API_KEY

# Expected: ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxx
```

#### Step 2: รัน WebSocket Server

```bash
cd apps/demo
pnpm ws-tts
```

**Expected Output:**
```
🚀 Starting WebSocket TTS server...
📍 Port: 3013
🛤️  Path: /ws/elevenlabs-tts
✅ ElevenLabs API key found
✅ WebSocket TTS Server is listening on port 3013
🔗 Connect to: ws://localhost:3013/ws/elevenlabs-tts
💡 Use 'pnpm ws-tts' to start this server
```

**❌ ถ้ายังเห็น:**
```
⚠️ ELEVENLABS_API_KEY not found in environment variables
```

**แปลว่า:**
- ไฟล์ `.env` ไม่มี หรือไม่ได้ถูกโหลด
- กลับไปทำ Step 1 อีกครั้ง

#### Step 3: ทดสอบ TTS Request

**ใช้ WebSocket Testing Tool:**

1. เปิด https://www.piesocket.com/websocket-tester
2. URL: `ws://localhost:3013/ws/elevenlabs-tts`
3. กด "Connect"
4. ส่ง message:

```json
{
  "type": "tts",
  "text": "สวัสดีครับ ยินดีต้อนรับ",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "model_id": "eleven_v3",
  "stability": 0.5,
  "similarity_boost": 0.75
}
```

**Expected Response:**

```json
{
  "type": "audio_chunk",
  "chunk_index": 0,
  "total_chunks": 2,
  "audio_data": "base64_encoded_audio_data...",
  "text": "สวัสดีครับ",
  "format": "mp3_44100_128",
  "session_id": "session_1699876486504"
}
```

**❌ ถ้ายังได้ error:**
```json
{
  "type": "error",
  "error": "ELEVENLABS_API_KEY not configured. Check environment variables",
  "timestamp": "..."
}
```

**แก้ไข:**
1. ตรวจสอบว่า `.env` มี API key ถูกต้อง
2. Restart WebSocket server (Ctrl+C แล้ว `pnpm ws-tts` ใหม่)
3. ตรวจสอบว่าใช้ `dotenv.config()` ในไฟล์ server

#### Step 4: ตรวจสอบ Server Logs

เมื่อส่ง TTS request ควรเห็น logs:

```
📨 Received message type: tts
🎤 Processing TTS request...
📋 Session: session_1699876486504
🗣️ Voice ID: 21m00Tcm4TlvDq8ikWAM
🤖 Model: eleven_v3
🔪 Starting text chunking...
📝 Original text length: 30 characters
✅ Text fits in single chunk
📦 Processing 2 chunks...

🎯 Processing chunk 1/2
📝 Text: "สวัสดีครับ"
📞 [TTS] Calling ElevenLabs API...
✅ Audio generated: 45678 bytes
📤 Sent audio chunk 1/2 to client (61234 base64 chars)
```

**ถ้าไม่เห็น logs เหล่านี้** = API key ยังไม่ถูกโหลด

### 📊 Verification Checklist

- [ ] ✅ มีไฟล์ `apps/demo/.env` (ไม่ใช่ `.env.local` เพียงอย่างเดียว)
- [ ] ✅ ไฟล์ `.env` มี `ELEVENLABS_API_KEY=sk_xxxxx`
- [ ] ✅ API key ถูกต้อง (ทดสอบที่ https://elevenlabs.io)
- [ ] ✅ ติดตั้ง `dotenv` package แล้ว (`pnpm add dotenv`)
- [ ] ✅ แก้ไข `server/websocket-tts-server.ts` เพิ่ม `dotenv.config()`
- [ ] ✅ Restart WebSocket server หลังแก้ไข
- [ ] ✅ Server log แสดง "✅ ElevenLabs API key found"
- [ ] ✅ TTS request ไม่แสดง error "ELEVENLABS_API_KEY not configured"
- [ ] ✅ ได้รับ audio_chunk response กลับมา

### 💡 Best Practices

**1. ใช้ .env สำหรับ environment variables:**

```bash
# ✅ Good: มีไฟล์ .env สำหรับ WebSocket server
apps/demo/.env                # สำหรับ WebSocket server
apps/demo/.env.local          # สำหรับ Next.js app (optional)
apps/demo/.env.example        # Template (commit to git)

# ❌ Bad: มีแค่ .env.local
apps/demo/.env.local          # Next.js เท่านั้น
```

**2. ใช้ dotenv.config() ใน Node.js scripts:**

```typescript
// ✅ Good: โหลด environment variables อัตโนมัติ
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.ELEVENLABS_API_KEY;

// ❌ Bad: ไม่โหลด environment variables
const API_KEY = process.env.ELEVENLABS_API_KEY; // undefined
```

**3. Validate API key ก่อนใช้งาน:**

```typescript
// ✅ Good: ตรวจสอบและแสดง error ชัดเจน
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

if (!ELEVENLABS_API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY not found in environment variables');
  console.error('💡 Please create apps/demo/.env file with ELEVENLABS_API_KEY');
  process.exit(1); // Exit with error
}

console.log('✅ ElevenLabs API key found');
```

**4. ใช้ .env.example เป็น template:**

```bash
# สร้าง .env.example (commit to git)
cat > apps/demo/.env.example << EOF
# ElevenLabs API Configuration
# Get your API key from: https://elevenlabs.io/app/settings/api-keys
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
EOF

# ให้ developers สร้าง .env จาก .env.example
cp apps/demo/.env.example apps/demo/.env
# แล้วแก้ไข .env ใส่ API key จริง
```

### ⚠️ Common Mistakes

#### 1. ใช้แค่ .env.local ไม่มี .env

**Mistake:** คิดว่า `.env.local` ใช้ได้กับทุก Node.js scripts

```bash
# ❌ ผิด: มีแค่ .env.local
apps/demo/.env.local

# WebSocket server ไม่เห็น API key
```

**Solution:**
```bash
# ✅ ถูก: มีทั้ง .env และ .env.local
apps/demo/.env        # สำหรับ WebSocket server
apps/demo/.env.local  # สำหรับ Next.js (optional)
```

#### 2. ลืม Restart Server หลังแก้ไข .env

**Mistake:** แก้ไข `.env` แล้วไม่ได้ restart server

```bash
# แก้ไข .env
echo "ELEVENLABS_API_KEY=new_key" > apps/demo/.env

# ❌ ผิด: ไม่ได้ restart server
# Server ยังใช้ค่า environment variables เดิม
```

**Solution:**
```bash
# ✅ ถูก: Restart server หลังแก้ไข .env
# กด Ctrl+C ที่ terminal server
# แล้วรัน pnpm ws-tts ใหม่
cd apps/demo
pnpm ws-tts
```

#### 3. ลืมติดตั้ง dotenv

**Mistake:** แก้ไข code ใช้ `dotenv.config()` แต่ไม่ได้ติดตั้ง package

```typescript
// ❌ Error: Cannot find module 'dotenv'
import dotenv from 'dotenv';
dotenv.config();
```

**Solution:**
```bash
# ✅ ติดตั้ง dotenv ก่อน
cd apps/demo
pnpm add dotenv
```

#### 4. ใช้ API key ผิด

**Mistake:** คัดลอก API key ไม่ครบ หรือมีช่องว่างผิดตำแหน่ง

```bash
# ❌ ผิด: มีช่องว่างหน้า key
ELEVENLABS_API_KEY= sk_xxxxx

# ❌ ผิด: ใช้ quotes
ELEVENLABS_API_KEY="sk_xxxxx"

# ✅ ถูก: ไม่มีช่องว่างและไม่ใช้ quotes
ELEVENLABS_API_KEY=sk_xxxxx
```

### 📝 Related Issues

**ปัญหาที่เกี่ยวข้อง:**
1. Environment variables ไม่ถูกโหลดใน Node.js scripts
2. Next.js vs standalone Node.js environment configuration
3. dotenv package usage และ configuration

**วิธีป้องกัน:**
- ใช้ `.env` สำหรับทุก Node.js scripts (ไม่ใช่แค่ Next.js)
- เพิ่ม `dotenv.config()` ใน entry point ของทุก standalone scripts
- สร้าง `.env.example` และเพิ่มใน git เพื่อให้ developers รู้ว่าต้องการ environment variables อะไร
- เพิ่ม validation เพื่อตรวจสอบว่า required environment variables มีครบ
- เขียน documentation ชัดเจนเรื่อง environment setup

### 🔗 References

- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Node.js process.env](https://nodejs.org/api/process.html#processenv)
- [ElevenLabs API Keys](https://elevenlabs.io/app/settings/api-keys)

---

## ปัญหา: 404 Not Found: /test-ws-tts

### 🔍 Symptoms (อาการ)
- ❌ เปิด `http://localhost:3012/test-ws-tts` แล้วได้ "404 - This page could not be found"
- ❌ Browser console แสดง error "GET /test-ws-tts 404"
- ❌ Next.js development server ไม่มี error แต่หน้าไม่ปรากฏ
- ✅ Next.js server รันได้ปกติที่ port 3012

### 🐛 Root Cause (สาเหตุหลัก)

#### **PRIMARY ISSUE: Test Page ยังไม่ถูกสร้าง** ⚠️

**นี่คือสาเหตุหลักของปัญหา!**

Test page สำหรับทดสอบ WebSocket TTS Hook (`/test-ws-tts`) ยังไม่ถูกสร้างในโปรเจกต์

**ทำไมถึงเกิดปัญหา:**

1. **Task 3 สร้าง Hook เสร็จแล้ว แต่ไม่ได้สร้าง Test Page**
   - ไฟล์ `useWebSocketTTS.ts` ถูกสร้างแล้ว (Task 3)
   - แต่ test page ยังไม่ถูกสร้าง (จะเป็นส่วนหนึ่งของ Task 4)
   - Documentation ใน V2V_REALTIME.md มีตัวอย่าง test code แต่ยังไม่ได้ implement

2. **Next.js App Router ต้องการไฟล์ page.tsx**
   - Next.js 13+ ใช้ App Router
   - Route `/test-ws-tts` ต้องมีไฟล์ `apps/demo/app/test-ws-tts/page.tsx`
   - ถ้าไม่มีไฟล์นี้ Next.js จะ return 404

3. **โครงสร้างไดเรกทอรีที่หายไป**
   ```
   apps/demo/app/
   ├── page.tsx           ✅ มี (หน้าแรก)
   ├── api/               ✅ มี (API routes)
   └── test-ws-tts/       ❌ ไม่มี (ยังไม่สร้าง)
       └── page.tsx       ❌ ไม่มี
   ```

**ผลกระทบ:**
- ❌ ไม่สามารถทดสอบ `useWebSocketTTS` Hook ได้
- ❌ ไม่สามารถ verify Task 3 implementation ได้
- ❌ ต้องสร้าง test component เองทุกครั้ง

### 🔧 Solution (วิธีแก้ปัญหา)

#### Step 1: สร้างไดเรกทอรี test-ws-tts

```bash
cd apps/demo
mkdir -p app/test-ws-tts
```

#### Step 2: สร้างไฟล์ page.tsx

สร้างไฟล์ `apps/demo/app/test-ws-tts/page.tsx` ด้วยเนื้อหาดังนี้:

```typescript
'use client';

import { useWebSocketTTS } from '@/liveavatar/useWebSocketTTS';
import { useState } from 'react';

export default function TestWSTTS() {
  const [testText, setTestText] = useState('สวัสดีครับ ยินดีต้อนรับสู่ระบบ WebSocket TTS');

  const {
    isConnected,
    isSynthesizing,
    progress,
    connect,
    disconnect,
    synthesize,
    stop,
    ping
  } = useWebSocketTTS({
    onAudioChunk: (chunkIndex, totalChunks, text) => {
      console.log(`🎵 Audio chunk ${chunkIndex + 1}/${totalChunks}:`, text);
    },
    onComplete: (total) => {
      console.log('✅ Synthesis completed! Total chunks:', total);
    },
    onError: (err) => {
      console.error('❌ Error:', err);
      alert(`Error: ${err}`);
    },
    onConnectionChange: (connected) => {
      console.log(`🔌 Connection status changed: ${connected ? 'Connected' : 'Disconnected'}`);
    }
  });

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎤 Test WebSocket TTS Hook</h1>

      {/* Status Display */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f5f5f5' }}>
        <h2>Status</h2>
        <p>Connected: <strong style={{ color: isConnected ? 'green' : 'red' }}>
          {isConnected ? '✅ YES' : '❌ NO'}
        </strong></p>
        <p>Synthesizing: <strong>{isSynthesizing ? '🔄 YES' : '⏸️ NO'}</strong></p>
        <p>Progress: <strong>{progress.current}/{progress.total}</strong></p>
        {progress.currentText && (
          <p>Current Text: <em>"{progress.currentText}"</em></p>
        )}
      </div>

      {/* Connection Controls */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={connect} disabled={isConnected}>
          🔌 Connect
        </button>
        <button onClick={disconnect} disabled={!isConnected}>
          🔌 Disconnect
        </button>
        <button onClick={ping} disabled={!isConnected}>
          🏓 Ping
        </button>
      </div>

      {/* Text Input */}
      <div style={{ marginBottom: '2rem' }}>
        <label>Test Text:</label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      {/* Synthesis Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button
          onClick={() => synthesize(testText)}
          disabled={!isConnected || isSynthesizing}
        >
          🎤 Synthesize
        </button>
        <button onClick={stop} disabled={!isSynthesizing}>
          🛑 Stop
        </button>
      </div>

      {/* Instructions */}
      <div style={{ padding: '1rem', backgroundColor: '#fef3c7' }}>
        <h3>⚠️ Instructions</h3>
        <ol>
          <li>Make sure WebSocket server is running: <code>pnpm ws-tts</code></li>
          <li>Click "Connect" to establish WebSocket connection</li>
          <li>Enter text in the textarea</li>
          <li>Click "Synthesize" to convert text to speech</li>
          <li>Check browser console (F12) for detailed logs</li>
        </ol>
      </div>
    </div>
  );
}
```

**ไฟล์เต็มอยู่ที่:** `apps/demo/app/test-ws-tts/page.tsx`

#### Step 3: Restart Next.js Development Server (ถ้าจำเป็น)

```bash
# กด Ctrl+C ที่ terminal Next.js
# แล้วรันใหม่
cd apps/demo
pnpm dev
```

**หมายเหตุ:** Next.js Hot Module Replacement (HMR) ควรโหลดหน้าใหม่อัตโนมัติ แต่ถ้าไม่ทำงาน ให้ restart server

#### Step 4: ทดสอบหน้าใหม่

```bash
# เปิดเบราว์เซอร์
http://localhost:3012/test-ws-tts
```

**Expected Result:**
- ✅ หน้า test page โหลดสำเร็จ
- ✅ แสดง UI สำหรับทดสอบ WebSocket TTS
- ✅ ไม่มี 404 error

### 🧪 Testing Steps (ขั้นตอนการทดสอบ)

#### Test 1: ตรวจสอบว่าไฟล์ถูกสร้างแล้ว

```bash
cd apps/demo

# ตรวจสอบว่ามีไดเรกทอรีและไฟล์
ls -la app/test-ws-tts/page.tsx

# Expected: -rw-r--r-- 1 user user 5678 Nov 13 16:50 app/test-ws-tts/page.tsx
```

#### Test 2: รัน Next.js และเปิดหน้า

```bash
# Terminal 1: WebSocket Server
pnpm ws-tts

# Terminal 2: Next.js
pnpm dev

# Browser
http://localhost:3012/test-ws-tts
```

**Expected Output:**
- ✅ หน้าโหลดสำเร็จ
- ✅ แสดง heading "🎤 Test WebSocket TTS Hook"
- ✅ แสดง status: Connected, Synthesizing, Progress
- ✅ แสดงปุ่ม Connect, Disconnect, Ping, Synthesize, Stop
- ✅ มี textarea สำหรับใส่ข้อความ

#### Test 3: ทดสอบ Functionality

**Step 3.1: ทดสอบ Connection**
```
1. คลิกปุ่ม "🔌 Connect"
2. Expected: Status เปลี่ยนเป็น "Connected: ✅ YES"
3. Expected: Console log: "🔌 Connection status changed: true"
```

**Step 3.2: ทดสอบ Ping**
```
1. คลิกปุ่ม "🏓 Ping"
2. Expected: Console log: "🏓 Ping sent"
3. Expected: Server log: "🏓 Pong received"
```

**Step 3.3: ทดสอบ Synthesis**
```
1. ใส่ข้อความในช่อง textarea: "สวัสดีครับ"
2. คลิกปุ่ม "🎤 Synthesize"
3. Expected: Status เปลี่ยนเป็น "Synthesizing: 🔄 YES"
4. Expected: Progress เริ่มนับ (0/2, 1/2, 2/2)
5. Expected: ได้ยินเสียงพูด
6. Expected: Console logs แสดง audio chunks
```

**Step 3.4: ทดสอบ Stop**
```
1. Synthesize ข้อความยาวๆ
2. คลิกปุ่ม "🛑 Stop" ระหว่างเล่น
3. Expected: เสียงหยุดทันที
4. Expected: Status เป็น "Synthesizing: ⏸️ NO"
```

### 📊 Verification Checklist

- [ ] ✅ มีไดเรกทอรี `apps/demo/app/test-ws-tts/`
- [ ] ✅ มีไฟล์ `apps/demo/app/test-ws-tts/page.tsx`
- [ ] ✅ Next.js server รันอยู่ (`pnpm dev`)
- [ ] ✅ WebSocket server รันอยู่ (`pnpm ws-tts`)
- [ ] ✅ เปิด http://localhost:3012/test-ws-tts ได้
- [ ] ✅ ไม่มี 404 error
- [ ] ✅ หน้า test page แสดงผล UI ถูกต้อง
- [ ] ✅ สามารถ Connect ไปยัง WebSocket server ได้
- [ ] ✅ สามารถ Synthesize และได้ยินเสียง

### 💡 Best Practices

**1. ใช้ Next.js App Router Convention:**

```
✅ Good: ใช้โครงสร้าง App Router
apps/demo/app/
├── test-ws-tts/
│   └── page.tsx       # Route: /test-ws-tts
├── other-page/
│   └── page.tsx       # Route: /other-page
└── page.tsx           # Route: /

❌ Bad: สร้าง component แล้วคาดหวังว่าจะมี route อัตโนมัติ
apps/demo/src/components/TestPage.tsx  # ไม่ได้สร้าง route
```

**2. ใช้ 'use client' สำหรับ Client Components:**

```typescript
// ✅ Good: ประกาศ 'use client' ที่บรรทัดแรก
'use client';

import { useWebSocketTTS } from '@/liveavatar/useWebSocketTTS';

export default function TestPage() {
  // ใช้ React hooks ได้
  const { isConnected } = useWebSocketTTS();
  return <div>...</div>;
}

// ❌ Bad: ไม่มี 'use client' แต่ใช้ hooks
import { useWebSocketTTS } from '@/liveavatar/useWebSocketTTS';

export default function TestPage() {
  // Error: React hooks ใช้ไม่ได้ใน Server Components
  const { isConnected } = useWebSocketTTS();
  return <div>...</div>;
}
```

**3. ตั้งชื่อ Component Function ให้ตรงกับ File:**

```typescript
// ✅ Good: Function name ชัดเจน
// File: app/test-ws-tts/page.tsx
export default function TestWSTTS() {
  return <div>Test Page</div>;
}

// ⚠️ Acceptable: ใช้ anonymous function
// File: app/test-ws-tts/page.tsx
export default function() {
  return <div>Test Page</div>;
}
```

### ⚠️ Common Mistakes

#### 1. ลืมเพิ่ม 'use client' Directive

**Mistake:** สร้าง page.tsx ที่ใช้ React hooks แต่ไม่มี 'use client'

```typescript
// ❌ ผิด: ไม่มี 'use client'
import { useWebSocketTTS } from '@/liveavatar/useWebSocketTTS';

export default function TestPage() {
  const { isConnected } = useWebSocketTTS(); // Error!
  return <div>{isConnected ? 'Yes' : 'No'}</div>;
}
```

**Error Message:**
```
Error: useWebSocketTTS only works in Client Components.
Add the "use client" directive at the top of the file to use it.
```

**Solution:**
```typescript
// ✅ ถูก: เพิ่ม 'use client'
'use client';

import { useWebSocketTTS } from '@/liveavatar/useWebSocketTTS';

export default function TestPage() {
  const { isConnected } = useWebSocketTTS(); // Works!
  return <div>{isConnected ? 'Yes' : 'No'}</div>;
}
```

#### 2. สร้างไฟล์ในตำแหน่งผิด

**Mistake:** สร้างไฟล์ใน `src/components/` แทนที่จะเป็น `app/`

```bash
# ❌ ผิด: ไม่ได้สร้าง route
apps/demo/src/components/TestWSTTS.tsx

# ✅ ถูก: สร้าง route /test-ws-tts
apps/demo/app/test-ws-tts/page.tsx
```

#### 3. ลืม Restart Next.js หลังสร้างไฟล์ใหม่

**Mistake:** สร้าง page.tsx แล้วไม่ได้ restart Next.js dev server

```bash
# สร้างไฟล์ใหม่
mkdir -p app/test-ws-tts
touch app/test-ws-tts/page.tsx

# ❌ ผิด: ไม่ได้ restart
# บางครั้ง HMR ไม่ catch ไฟล์ใหม่

# ✅ ถูก: Restart Next.js
# กด Ctrl+C
pnpm dev
```

#### 4. ใช้ชื่อไฟล์ผิด

**Mistake:** ใช้ชื่อไฟล์ที่ไม่ใช่ `page.tsx`

```bash
# ❌ ผิด: Next.js ไม่รู้จักไฟล์เหล่านี้
apps/demo/app/test-ws-tts/index.tsx
apps/demo/app/test-ws-tts/TestPage.tsx
apps/demo/app/test-ws-tts/test.tsx

# ✅ ถูก: ต้องใช้ชื่อ page.tsx
apps/demo/app/test-ws-tts/page.tsx
```

### 📝 Related Issues

**ปัญหาที่เกี่ยวข้อง:**
1. Next.js App Router file conventions
2. Client Components vs Server Components
3. File-system based routing
4. Hot Module Replacement (HMR) ไม่ทำงาน

**วิธีป้องกัน:**
- ศึกษา Next.js App Router conventions
- ใช้ 'use client' กับทุก page ที่ใช้ React hooks
- ตั้งชื่อไฟล์ตาม conventions: `page.tsx`, `layout.tsx`, `loading.tsx`
- Restart dev server หลังสร้างไฟล์ใหม่

### 🔗 References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js File Conventions](https://nextjs.org/docs/app/building-your-application/routing)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [useWebSocketTTS Hook Documentation](../apps/demo/src/liveavatar/useWebSocketTTS.ts)

### 📄 Complete Test Page Code

ดูโค้ดเต็มได้ที่: [`apps/demo/app/test-ws-tts/page.tsx`](../apps/demo/app/test-ws-tts/page.tsx)

---

## ปัญหา: Module not found: Can't resolve '@/liveavatar/useWebSocketTTS'

### 🔍 Symptoms (อาการ)
- ❌ Build Error: "Module not found: Can't resolve '@/liveavatar/useWebSocketTTS'"
- ❌ Next.js compilation failed
- ❌ Browser แสดง error overlay สีแดง
- ❌ Error ใน file: `app/test-ws-tts/page.tsx` บรรทัด 3
- ✅ ไฟล์ `src/liveavatar/useWebSocketTTS.ts` มีอยู่จริง

### 🐛 Root Cause (สาเหตุหลัก)

#### **PRIMARY ISSUE: Missing TypeScript Path Alias Configuration** ⚠️

**นี่คือสาเหตุหลักของปัญหา!**

TypeScript/Next.js ไม่รู้จัก path alias `@/` ที่ใช้ใน import statement

**ทำไมถึงเกิดปัญหา:**

1. **Path Alias `@/` ไม่ได้ถูกกำหนดใน tsconfig.json**
   - Import statement ใช้: `import { useWebSocketTTS } from '@/liveavatar/useWebSocketTTS';`
   - แต่ tsconfig.json ไม่มี `paths` mapping สำหรับ `@/*`
   - TypeScript ไม่รู้ว่า `@/` หมายถึง `src/`

2. **Next.js ต้องการ Path Alias Configuration**
   - Next.js รองรับ path aliases แต่ต้องกำหนดใน `tsconfig.json`
   - ต้องมี `baseUrl` และ `paths` ใน `compilerOptions`
   - ไม่มี configuration = import ล้มเหลว

3. **ไฟล์มีอยู่จริงแต่ TypeScript หาไม่เจอ**
   ```
   ✅ File exists: apps/demo/src/liveavatar/useWebSocketTTS.ts
   ❌ Import fails: @/liveavatar/useWebSocketTTS
   ✅ Would work: ../../src/liveavatar/useWebSocketTTS (relative path)
   ```

**ผลกระทบ:**
- ❌ Next.js build ล้มเหลว
- ❌ ไม่สามารถรัน development server ได้
- ❌ Test page `/test-ws-tts` ไม่สามารถโหลดได้
- ❌ ทุกไฟล์ที่ใช้ `@/` alias จะ error

### 🔧 Solution (วิธีแก้ปัญหา)

#### Step 1: เพิ่ม Path Alias Configuration ใน tsconfig.json

แก้ไขไฟล์ `apps/demo/tsconfig.json`:

**Before (ไม่มี paths):**
```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "next-env.d.ts",
    "next.config.js",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

**After (เพิ่ม paths):**
```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "next-env.d.ts",
    "next.config.js",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

**สิ่งที่เพิ่ม:**
- ✅ `"baseUrl": "."` - กำหนด base directory
- ✅ `"paths": { "@/*": ["./src/*"] }` - map `@/` ไปยัง `src/`

#### Step 2: Restart Next.js Development Server

```bash
# กด Ctrl+C ที่ terminal Next.js
# แล้วรันใหม่
cd apps/demo
pnpm dev
```

**หมายเหตุ:** **ต้อง restart server** เพราะ tsconfig.json changes ไม่ถูก hot-reload

#### Step 3: ตรวจสอบว่าแก้ไขแล้ว

```bash
# เปิดเบราว์เซอร์
http://localhost:3012/test-ws-tts
```

**Expected Result:**
- ✅ หน้าโหลดสำเร็จ ไม่มี build error
- ✅ แสดง UI ของ test page
- ✅ ไม่มี "Module not found" error

### 🧪 Testing Steps (ขั้นตอนการทดสอบ)

#### Test 1: ตรวจสอบ tsconfig.json

```bash
cd apps/demo

# ตรวจสอบว่ามี paths configuration
cat tsconfig.json | grep -A 3 "paths"

# Expected output:
# "paths": {
#   "@/*": ["./src/*"]
# }
```

#### Test 2: ทดสอบ TypeScript Resolution

```bash
# ตรวจสอบ TypeScript type checking
cd apps/demo
npx tsc --noEmit

# Expected: ไม่มี errors เกี่ยวกับ module resolution
```

#### Test 3: ทดสอบ Next.js Build

```bash
cd apps/demo
pnpm dev

# Expected output:
# ✓ Ready in 2.3s
# ✓ Compiled / in 1234ms
```

#### Test 4: ทดสอบหน้า Test Page

```bash
# เปิดเบราว์เซอร์
http://localhost:3012/test-ws-tts

# Expected:
# ✅ หน้าโหลดสำเร็จ
# ✅ แสดง "🎤 Test WebSocket TTS Hook"
# ✅ ไม่มี build error overlay
```

### 📊 Verification Checklist

- [ ] ✅ แก้ไข `apps/demo/tsconfig.json` เพิ่ม `baseUrl` และ `paths`
- [ ] ✅ `paths` มี mapping: `"@/*": ["./src/*"]`
- [ ] ✅ Restart Next.js server (Ctrl+C → `pnpm dev`)
- [ ] ✅ `npx tsc --noEmit` ผ่านโดยไม่มี module errors
- [ ] ✅ เปิด http://localhost:3012/test-ws-tts ได้
- [ ] ✅ ไม่มี "Module not found" error
- [ ] ✅ Import `@/liveavatar/useWebSocketTTS` ทำงานได้

### 💡 Best Practices

**1. กำหนด Path Aliases ใน tsconfig.json:**

```json
// ✅ Good: มี path aliases
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}

// ❌ Bad: ไม่มี path aliases
{
  "compilerOptions": {
    // ไม่มี baseUrl และ paths
  }
}
```

**2. ใช้ Path Aliases อย่างสม่ำเสมอ:**

```typescript
// ✅ Good: ใช้ path alias
import { useWebSocketTTS } from '@/liveavatar/useWebSocketTTS';
import { Button } from '@/components/Button';

// ❌ Bad: ใช้ relative path ยาวๆ
import { useWebSocketTTS } from '../../src/liveavatar/useWebSocketTTS';
import { Button } from '../../../components/Button';
```

**3. Restart Server หลังแก้ tsconfig.json:**

```bash
# ❌ Bad: ไม่ restart server
# แก้ tsconfig.json แล้วคาดหวังว่าจะ hot-reload

# ✅ Good: Restart server ทุกครั้งที่แก้ tsconfig.json
# กด Ctrl+C
pnpm dev
```

**4. ตรวจสอบ Path Mapping ด้วย TypeScript:**

```bash
# ตรวจสอบว่า TypeScript resolve paths ถูกต้อง
npx tsc --noEmit --traceResolution | grep "useWebSocketTTS"

# ควรเห็น resolved path ไปยัง src/liveavatar/useWebSocketTTS.ts
```

### ⚠️ Common Mistakes

#### 1. ลืมเพิ่ม baseUrl

**Mistake:** เพิ่ม `paths` แต่ไม่มี `baseUrl`

```json
// ❌ ผิด: มี paths แต่ไม่มี baseUrl
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// ✅ ถูก: ต้องมีทั้ง baseUrl และ paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 2. Path Mapping ไม่ตรงกับโครงสร้างจริง

**Mistake:** กำหนด path ที่ไม่ตรงกับ directory structure

```json
// ❌ ผิด: map ไปยัง directory ที่ไม่มี
{
  "paths": {
    "@/*": ["./lib/*"]  // แต่ไม่มี lib/ directory
  }
}

// ✅ ถูก: map ไปยัง directory ที่มีจริง
{
  "paths": {
    "@/*": ["./src/*"]  // มี src/ directory
  }
}
```

**ตรวจสอบ directory structure:**
```bash
ls -la apps/demo/src/
# ต้องมี liveavatar/ directory
```

#### 3. ลืม Restart Next.js หลังแก้ tsconfig.json

**Mistake:** แก้ tsconfig.json แล้วไม่ restart server

```bash
# แก้ tsconfig.json
nano apps/demo/tsconfig.json

# ❌ ผิด: ไม่ restart server
# Changes ไม่มีผล

# ✅ ถูก: Restart server
# กด Ctrl+C ที่ terminal
cd apps/demo
pnpm dev
```

#### 4. ใช้ Path Alias ผิด Format

**Mistake:** ใช้ format ที่ไม่ถูกต้อง

```typescript
// ❌ ผิด: ใช้ @/ แบบผิด
import { useWebSocketTTS } from '@liveavatar/useWebSocketTTS';  // ไม่มี /
import { useWebSocketTTS } from '@//liveavatar/useWebSocketTTS';  // มี // เกิน

// ✅ ถูก: ใช้ @/ อย่างถูกต้อง
import { useWebSocketTTS } from '@/liveavatar/useWebSocketTTS';
```

### 📝 Related Issues

**ปัญหาที่เกี่ยวข้อง:**
1. TypeScript module resolution
2. Next.js path aliases configuration
3. Import path ไม่ถูกต้อง
4. tsconfig.json hot-reload limitations

**วิธีป้องกัน:**
- กำหนด path aliases ใน tsconfig.json ตั้งแต่เริ่มโปรเจกต์
- ใช้ path alias อย่างสม่ำเสมอในทุกไฟล์
- Restart development server หลังแก้ tsconfig.json
- ใช้ TypeScript `--traceResolution` เพื่อ debug module resolution
- เขียน documentation เรื่อง path aliases สำหรับทีม

### 🔗 References

- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [Next.js Absolute Imports and Module Path Aliases](https://nextjs.org/docs/app/building-your-application/configuring/absolute-imports-and-module-aliases)
- [tsconfig.json Reference](https://www.typescriptlang.org/tsconfig)

### 💻 Complete Configuration Example

**apps/demo/tsconfig.json (Complete):**
```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "next-env.d.ts",
    "next.config.js",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

**Usage in Code:**
```typescript
// app/test-ws-tts/page.tsx
'use client';

import { useWebSocketTTS } from '@/liveavatar/useWebSocketTTS';
import { useState } from 'react';

export default function TestWSTTS() {
  const { isConnected, synthesize } = useWebSocketTTS();
  // ... rest of component
}
```

---

## ปัญหา: ElevenLabs Realtime STT - No Transcripts

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
