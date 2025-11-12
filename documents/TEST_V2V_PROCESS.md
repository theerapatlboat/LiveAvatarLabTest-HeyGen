# Voice-to-Voice Testing Process
**แผนการทดสอบระบบ Real-time V2V Communication**

## สารบัญ

1. [การเตรียมการทดสอบ](#การเตรียมการทดสอบ)
2. [Phase 1: Session Management Tests](#phase-1-session-management-tests)
3. [Phase 2: Voice Chat Tests (FULL Mode)](#phase-2-voice-chat-tests-full-mode)
4. [Phase 3: Custom Voice Chat Tests](#phase-3-custom-voice-chat-tests)
5. [Phase 4: ElevenLabs Realtime STT Tests](#phase-4-elevenlabs-realtime-stt-tests)
6. [Phase 5: WebSocket OpenAI Chat Tests](#phase-5-websocket-openai-chat-tests)
7. [Phase 6: WebSocket ElevenLabs TTS Tests](#phase-6-websocket-elevenlabs-tts-tests)
8. [Integration Tests](#integration-tests)
9. [Performance Tests](#performance-tests)
10. [Test Tools & Resources](#test-tools--resources)

---

## การเตรียมการทดสอบ

### ติดตั้ง Tools

```bash
# ติดตั้ง Postman (สำหรับทดสอบ API)
# Download: https://www.postman.com/downloads/

# ติดตั้ง wscat (สำหรับทดสอบ WebSocket)
npm install -g wscat

# ติดตั้ง HTTP client
npm install -g httpie
```

### ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:

```env
LIVEAVATAR_API_KEY=sk-heygen-xxxxx
LIVEAVATAR_AVATAR_ID=dd73ea75-1218-4ef3-92ce-606d5f7fbc0a
LIVEAVATAR_VOICE_ID=your_voice_id
LIVEAVATAR_CONTEXT_ID=your_context_id
LIVEAVATAR_LANGUAGE=th

OPENAI_API_KEY=sk-xxxxx
ELEVENLABS_API_KEY=sk_xxxxx
ELEVENLABS_VOICE_ID=pqHfZKP75CvOlQylNhV4
```

### รันโปรเจ็ค

```bash
# Terminal 1: รัน Next.js
pnpm dev

# Terminal 2: รัน WebSocket Server (สำหรับ Phase 5-6)
pnpm ws-server
```

---

## PHASE 1: Session Management Tests

### TEST 1.1: Start Session (FULL Mode)

#### วิธีทดสอบด้วย Postman

**Request:**
```
POST http://localhost:3000/api/start-session
Content-Type: application/json
```

**Expected Response (200 OK):**
```json
{
  "session_token": "eyJhbGci...",
  "session_id": "abc123..."
}
```

**การตรวจสอบ:**
- ✅ Status code = 200
- ✅ มี session_token และ session_id
- ✅ session_token เป็น JWT format
- ✅ ใช้เวลาไม่เกิน 2 วินาที

**Test Cases:**
- ✅ สำเร็จกับ environment variables ที่ถูกต้อง
- ❌ ล้มเหลวถ้า API key ไม่ถูกต้อง
- ❌ ล้มเหลวถ้า avatar_id ไม่มีอยู่

#### Simple HTML Test Page

สร้างไฟล์ `tests/test-start-session.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Start Session</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .result { margin-top: 20px; padding: 10px; background: #f0f0f0; }
    .success { background: #d4edda; }
    .error { background: #f8d7da; }
    button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Test Start Session (FULL Mode)</h1>

  <button onclick="testStartSession()">Start Session</button>
  <button onclick="clearResult()">Clear</button>

  <div id="result" class="result"></div>

  <script>
    async function testStartSession() {
      const resultDiv = document.getElementById('result');
      resultDiv.className = 'result';
      resultDiv.innerHTML = 'Testing...';

      try {
        const startTime = Date.now();

        const response = await fetch('/api/start-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const duration = Date.now() - startTime;
        const data = await response.json();

        if (response.ok) {
          resultDiv.className = 'result success';
          resultDiv.innerHTML = `
            <h3>✅ Success (${duration}ms)</h3>
            <p><strong>Session Token:</strong> ${data.session_token.substring(0, 50)}...</p>
            <p><strong>Session ID:</strong> ${data.session_id}</p>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          `;

          // Save to sessionStorage for next tests
          sessionStorage.setItem('session_token', data.session_token);
          sessionStorage.setItem('session_id', data.session_id);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = `
          <h3>❌ Error</h3>
          <p>${error.message}</p>
        `;
      }
    }

    function clearResult() {
      document.getElementById('result').innerHTML = '';
    }
  </script>
</body>
</html>
```

### TEST 1.2: Start Session (CUSTOM Mode)

**Postman Request:**
```
POST http://localhost:3000/api/start-custom-session
Content-Type: application/json
```

**Expected Response:**
```json
{
  "session_token": "eyJhbGci...",
  "session_id": "xyz789..."
}
```

**HTML Test:** `tests/test-start-custom-session.html` (คล้าย 1.1)

### TEST 1.3: Keep Session Alive

**Postman Request:**
```
POST http://localhost:3000/api/keep-session-alive
Content-Type: application/json

{
  "session_token": "{{session_token}}"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Session extended successfully"
}
```

### TEST 1.4: Stop Session

**Postman Request:**
```
POST http://localhost:3000/api/stop-session
Content-Type: application/json

{
  "session_token": "{{session_token}}"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Session stopped successfully"
}
```

**HTML Test:** `tests/test-session-lifecycle.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Session Lifecycle</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    button { margin: 10px; padding: 10px 20px; }
    .log { background: #f0f0f0; padding: 10px; margin-top: 20px; max-height: 400px; overflow-y: auto; }
  </style>
</head>
<body>
  <h1>Test Session Lifecycle</h1>

  <button onclick="startSession()">1. Start Session</button>
  <button onclick="keepAlive()">2. Keep Alive</button>
  <button onclick="stopSession()">3. Stop Session</button>
  <button onclick="clearLog()">Clear Log</button>

  <div class="log" id="log"></div>

  <script>
    let sessionToken = null;
    let sessionId = null;

    function log(message, type = 'info') {
      const logDiv = document.getElementById('log');
      const time = new Date().toLocaleTimeString();
      const color = type === 'success' ? 'green' : type === 'error' ? 'red' : 'black';
      logDiv.innerHTML += `<div style="color: ${color}">[${time}] ${message}</div>`;
      logDiv.scrollTop = logDiv.scrollHeight;
    }

    async function startSession() {
      try {
        log('Starting session...', 'info');
        const response = await fetch('/api/start-session', {
          method: 'POST'
        });
        const data = await response.json();

        if (response.ok) {
          sessionToken = data.session_token;
          sessionId = data.session_id;
          log(`✅ Session started: ${sessionId}`, 'success');
          log(`Token: ${sessionToken.substring(0, 30)}...`, 'info');
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        log(`❌ Error: ${error.message}`, 'error');
      }
    }

    async function keepAlive() {
      if (!sessionToken) {
        log('❌ No session token. Start session first!', 'error');
        return;
      }

      try {
        log('Sending keep-alive...', 'info');
        const response = await fetch('/api/keep-session-alive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken })
        });
        const data = await response.json();

        if (data.success) {
          log(`✅ ${data.message}`, 'success');
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        log(`❌ Error: ${error.message}`, 'error');
      }
    }

    async function stopSession() {
      if (!sessionToken) {
        log('❌ No session token. Start session first!', 'error');
        return;
      }

      try {
        log('Stopping session...', 'info');
        const response = await fetch('/api/stop-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken })
        });
        const data = await response.json();

        if (data.success) {
          log(`✅ ${data.message}`, 'success');
          sessionToken = null;
          sessionId = null;
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        log(`❌ Error: ${error.message}`, 'error');
      }
    }

    function clearLog() {
      document.getElementById('log').innerHTML = '';
    }
  </script>
</body>
</html>
```

---

## PHASE 2: Voice Chat Tests (FULL Mode)

### TEST 2.1: OpenAI Whisper STT

**Postman Request:**
```
POST http://localhost:3000/api/openai-whisper-stt
Content-Type: multipart/form-data

[Upload audio file]
```

**Expected Response:**
```json
{
  "transcript": "สวัสดีครับ ผมชื่อ John"
}
```

**การทดสอบด้วย Postman:**
1. เปิด Postman
2. สร้าง POST request ไปที่ `/api/openai-whisper-stt`
3. เลือก Body → form-data
4. Key: `audio`, Type: File
5. เลือกไฟล์เสียง (WAV, MP3, M4A)
6. กด Send

**Test Audio Files:**
- `tests/audio/thai-greeting.wav` - "สวัสดีครับ"
- `tests/audio/english-hello.wav` - "Hello, how are you?"
- `tests/audio/noise.wav` - เสียงรบกวน (ควรได้ transcript ว่าง)

**HTML Test:** `tests/test-whisper-stt.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Whisper STT</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .controls { margin: 20px 0; }
    button { margin: 5px; padding: 10px 20px; }
    #status { margin: 20px 0; padding: 10px; background: #e3f2fd; }
    #transcript { margin: 20px 0; padding: 10px; background: #f5f5f5; min-height: 50px; }
  </style>
</head>
<body>
  <h1>Test OpenAI Whisper STT</h1>

  <div class="controls">
    <button id="recordBtn" onclick="toggleRecording()">🎤 Start Recording</button>
    <button onclick="uploadFile()">📁 Upload File</button>
    <input type="file" id="fileInput" accept="audio/*" style="display: none" onchange="handleFileSelect()">
  </div>

  <div id="status">Ready</div>
  <div id="transcript">Transcript will appear here...</div>

  <script>
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;

    async function toggleRecording() {
      if (!isRecording) {
        await startRecording();
      } else {
        await stopRecording();
      }
    }

    async function startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          await sendToWhisper(audioBlob);
        };

        mediaRecorder.start();
        isRecording = true;
        document.getElementById('recordBtn').textContent = '⏹️ Stop Recording';
        document.getElementById('status').textContent = 'Recording...';
      } catch (error) {
        alert('Microphone access denied: ' + error.message);
      }
    }

    async function stopRecording() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        document.getElementById('recordBtn').textContent = '🎤 Start Recording';
        document.getElementById('status').textContent = 'Processing...';
      }
    }

    async function sendToWhisper(audioBlob) {
      try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        const response = await fetch('/api/openai-whisper-stt', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          document.getElementById('transcript').textContent = data.transcript;
          document.getElementById('status').textContent = '✅ Transcription complete';
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        document.getElementById('status').textContent = '❌ Error: ' + error.message;
      }
    }

    function uploadFile() {
      document.getElementById('fileInput').click();
    }

    async function handleFileSelect() {
      const file = document.getElementById('fileInput').files[0];
      if (file) {
        document.getElementById('status').textContent = 'Processing file...';
        await sendToWhisper(file);
      }
    }
  </script>
</body>
</html>
```

### TEST 2.2: OpenAI Chat Completion

**Postman Request:**
```
POST http://localhost:3000/api/openai-chat-complete
Content-Type: application/json

{
  "message": "สวัสดีครับ คุณชื่ออะไร",
  "model": "gpt-4o-mini",
  "system_prompt": "You are a helpful Thai-speaking assistant."
}
```

**Expected Response:**
```json
{
  "response": "สวัสดีครับ ผมชื่อ AI Assistant ยินดีที่ได้รู้จักครับ"
}
```

**Test Cases:**
| Input | Expected Output |
|-------|----------------|
| "สวัสดีครับ" | Thai greeting response |
| "Hello" | English greeting |
| "1+1=?" | "2" or mathematical explanation |
| Empty string | Error message |

**HTML Test:** `tests/test-chat-completion.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Chat Completion</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    .chat-container { border: 1px solid #ddd; padding: 20px; margin: 20px 0; background: #f9f9f9; }
    .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
    .user { background: #e3f2fd; text-align: right; }
    .assistant { background: #f1f8e9; }
    .input-area { display: flex; gap: 10px; }
    input { flex: 1; padding: 10px; font-size: 14px; }
    button { padding: 10px 20px; font-size: 14px; }
  </style>
</head>
<body>
  <h1>Test OpenAI Chat Completion</h1>

  <div class="chat-container" id="chatContainer"></div>

  <div class="input-area">
    <input type="text" id="messageInput" placeholder="Type your message..." onkeypress="handleKeyPress(event)">
    <button onclick="sendMessage()">Send</button>
    <button onclick="clearChat()">Clear</button>
  </div>

  <script>
    async function sendMessage() {
      const input = document.getElementById('messageInput');
      const message = input.value.trim();

      if (!message) return;

      // Add user message to UI
      addMessage('user', message);
      input.value = '';

      try {
        // Call API
        const response = await fetch('/api/openai-chat-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            model: 'gpt-4o-mini',
            system_prompt: 'You are a helpful Thai-speaking assistant.'
          })
        });

        const data = await response.json();

        if (response.ok) {
          addMessage('assistant', data.response);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        addMessage('error', 'Error: ' + error.message);
      }
    }

    function addMessage(role, text) {
      const container = document.getElementById('chatContainer');
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message ' + role;
      messageDiv.innerHTML = `<strong>${role === 'user' ? 'You' : 'AI'}:</strong> ${text}`;
      container.appendChild(messageDiv);
      container.scrollTop = container.scrollHeight;
    }

    function clearChat() {
      document.getElementById('chatContainer').innerHTML = '';
    }

    function handleKeyPress(event) {
      if (event.key === 'Enter') {
        sendMessage();
      }
    }
  </script>
</body>
</html>
```

### TEST 2.3: ElevenLabs Text-to-Speech

**Postman Request:**
```
POST http://localhost:3000/api/elevenlabs-text-to-speech
Content-Type: application/json

{
  "text": "สวัสดีครับ ยินดีที่ได้รู้จักครับ",
  "voice_id": "pqHfZKP75CvOlQylNhV4",
  "model_id": "eleven_v3"
}
```

**Expected Response:**
```json
{
  "audio": "base64_encoded_pcm_audio..."
}
```

**การตรวจสอบ:**
- ✅ Response มี audio field
- ✅ audio เป็น base64 string
- ✅ ความยาวของ audio สมเหตุสมผล (ประมาณ 1-2 วินาที/คำ)
- ✅ ใช้เวลาไม่เกิน 5 วินาที

**HTML Test:** `tests/test-elevenlabs-tts.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test ElevenLabs TTS</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
    textarea { width: 100%; height: 100px; padding: 10px; font-size: 14px; }
    button { margin: 10px 5px; padding: 10px 20px; }
    .status { padding: 10px; margin: 10px 0; background: #f0f0f0; }
    .audio-player { margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Test ElevenLabs TTS</h1>

  <textarea id="textInput" placeholder="Enter text to synthesize...">สวัสดีครับ ยินดีที่ได้รู้จักครับ</textarea>

  <div>
    <button onclick="synthesize()">🔊 Synthesize</button>
    <button onclick="playAudio()">▶️ Play</button>
    <button onclick="downloadAudio()">💾 Download</button>
  </div>

  <div class="status" id="status">Ready</div>

  <div class="audio-player">
    <audio id="audioPlayer" controls style="width: 100%; display: none;"></audio>
  </div>

  <script>
    let currentAudio = null;

    async function synthesize() {
      const text = document.getElementById('textInput').value.trim();

      if (!text) {
        alert('Please enter some text');
        return;
      }

      document.getElementById('status').textContent = 'Synthesizing...';

      try {
        const startTime = Date.now();

        const response = await fetch('/api/elevenlabs-text-to-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            voice_id: 'pqHfZKP75CvOlQylNhV4',
            model_id: 'eleven_v3'
          })
        });

        const duration = Date.now() - startTime;
        const data = await response.json();

        if (response.ok) {
          currentAudio = data.audio;
          document.getElementById('status').textContent =
            `✅ Synthesized in ${duration}ms (${Math.round(currentAudio.length / 1024)}KB)`;

          // Convert PCM base64 to playable audio
          convertToWav(currentAudio);

          document.getElementById('audioPlayer').style.display = 'block';
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        document.getElementById('status').textContent = '❌ Error: ' + error.message;
      }
    }

    function convertToWav(pcmBase64) {
      // Convert base64 PCM to WAV
      const pcmData = atob(pcmBase64);
      const pcmArray = new Uint8Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        pcmArray[i] = pcmData.charCodeAt(i);
      }

      // Create WAV header
      const wavHeader = createWavHeader(pcmArray.length, 24000, 1, 16);
      const wavData = new Uint8Array(wavHeader.length + pcmArray.length);
      wavData.set(wavHeader, 0);
      wavData.set(pcmArray, wavHeader.length);

      // Create blob and URL
      const blob = new Blob([wavData], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      document.getElementById('audioPlayer').src = url;
    }

    function createWavHeader(dataLength, sampleRate, channels, bitsPerSample) {
      const header = new ArrayBuffer(44);
      const view = new DataView(header);

      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + dataLength, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, channels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * channels * (bitsPerSample / 8), true);
      view.setUint16(32, channels * (bitsPerSample / 8), true);
      view.setUint16(34, bitsPerSample, true);
      writeString(36, 'data');
      view.setUint32(40, dataLength, true);

      return new Uint8Array(header);
    }

    function playAudio() {
      const player = document.getElementById('audioPlayer');
      if (player.src) {
        player.play();
      } else {
        alert('Please synthesize audio first');
      }
    }

    function downloadAudio() {
      const player = document.getElementById('audioPlayer');
      if (player.src) {
        const a = document.createElement('a');
        a.href = player.src;
        a.download = 'synthesized-audio.wav';
        a.click();
      } else {
        alert('Please synthesize audio first');
      }
    }
  </script>
</body>
</html>
```

---

## PHASE 3: Custom Voice Chat Tests

### TEST 3.1: Complete Voice Flow

**HTML Test:** `tests/test-custom-voice-chat.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Custom Voice Chat</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    .controls { margin: 20px 0; }
    button { margin: 5px; padding: 10px 20px; font-size: 14px; }
    button.recording { background: #f44336; color: white; }
    .status { padding: 15px; margin: 20px 0; background: #e3f2fd; border-radius: 5px; }
    .conversation { border: 1px solid #ddd; padding: 20px; margin: 20px 0; min-height: 300px; background: #fafafa; }
    .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
    .user { background: #e3f2fd; }
    .assistant { background: #f1f8e9; }
    .processing { background: #fff3e0; color: #666; font-style: italic; }
  </style>
</head>
<body>
  <h1>Test Custom Voice Chat (Complete Flow)</h1>

  <div class="controls">
    <button id="recordBtn" onclick="toggleRecording()">🎤 Start Recording</button>
    <button onclick="clearConversation()">🗑️ Clear</button>
  </div>

  <div class="status" id="status">
    <div><strong>Status:</strong> <span id="statusText">Ready</span></div>
    <div><strong>Recording:</strong> <span id="recordingStatus">No</span></div>
    <div><strong>Processing:</strong> <span id="processingStatus">No</span></div>
  </div>

  <div class="conversation" id="conversation"></div>

  <script>
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    let audioContext = null;
    let workletNode = null;

    async function toggleRecording() {
      if (!isRecording) {
        await startRecording();
      } else {
        await stopRecording();
      }
    }

    async function startRecording() {
      try {
        updateStatus('Initializing microphone...', false, false);

        // Create audio context
        audioContext = new AudioContext({ sampleRate: 16000 });

        // Load audio processor
        await audioContext.audioWorklet.addModule('/audio-processor.js');

        // Get microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        // Create worklet node
        workletNode = new AudioWorkletNode(audioContext, 'audio-recorder-processor');
        audioChunks = [];

        // Collect audio data
        workletNode.port.onmessage = (event) => {
          if (event.data.type === 'audioData') {
            audioChunks.push(new Float32Array(event.data.data));
          }
        };

        // Connect audio pipeline
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(workletNode);

        isRecording = true;
        document.getElementById('recordBtn').textContent = '⏹️ Stop Recording';
        document.getElementById('recordBtn').classList.add('recording');
        updateStatus('Recording...', true, false);

      } catch (error) {
        alert('Microphone error: ' + error.message);
        updateStatus('Error: ' + error.message, false, false);
      }
    }

    async function stopRecording() {
      isRecording = false;
      document.getElementById('recordBtn').textContent = '🎤 Start Recording';
      document.getElementById('recordBtn').classList.remove('recording');

      // Stop audio processing
      if (workletNode) {
        workletNode.disconnect();
        workletNode = null;
      }

      if (audioContext) {
        await audioContext.close();
        audioContext = null;
      }

      // Process the recorded audio
      await processAudio();
    }

    async function processAudio() {
      updateStatus('Processing audio...', false, true);
      addMessage('processing', 'Processing your speech...');

      try {
        // 1. Combine audio chunks
        const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combinedBuffer = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of audioChunks) {
          combinedBuffer.set(chunk, offset);
          offset += chunk.length;
        }

        // 2. Convert to WAV
        const wavBlob = pcmToWav(combinedBuffer, 16000);

        // 3. Speech-to-Text (Whisper)
        updateStatus('Transcribing...', false, true);
        const formData = new FormData();
        formData.append('audio', wavBlob, 'recording.wav');

        const sttResponse = await fetch('/api/openai-whisper-stt', {
          method: 'POST',
          body: formData
        });

        if (!sttResponse.ok) throw new Error('STT failed');

        const { transcript } = await sttResponse.json();
        addMessage('user', transcript);

        // 4. Get AI response
        updateStatus('Thinking...', false, true);
        const chatResponse = await fetch('/api/openai-chat-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: transcript,
            system_prompt: 'You are a helpful Thai-speaking assistant.'
          })
        });

        if (!chatResponse.ok) throw new Error('Chat failed');

        const { response: aiResponse } = await chatResponse.json();
        addMessage('assistant', aiResponse);

        // 5. Text-to-Speech
        updateStatus('Synthesizing speech...', false, true);
        const ttsResponse = await fetch('/api/elevenlabs-text-to-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: aiResponse,
            voice_id: 'pqHfZKP75CvOlQylNhV4'
          })
        });

        if (!ttsResponse.ok) throw new Error('TTS failed');

        const { audio } = await ttsResponse.json();

        // 6. Play audio (optional)
        // Note: ในระบบจริงจะส่งไปยัง Avatar
        updateStatus('✅ Complete! Ready for next message.', false, false);

        // Remove processing message
        const processingMsgs = document.querySelectorAll('.processing');
        processingMsgs.forEach(msg => msg.remove());

      } catch (error) {
        updateStatus('❌ Error: ' + error.message, false, false);
        addMessage('error', error.message);
      }
    }

    function pcmToWav(pcmData, sampleRate) {
      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);

      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + pcmData.length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, pcmData.length * 2, true);

      const pcm16 = new Int16Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        const s = Math.max(-1, Math.min(1, pcmData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      return new Blob([wavHeader, pcm16.buffer], { type: 'audio/wav' });
    }

    function updateStatus(text, recording, processing) {
      document.getElementById('statusText').textContent = text;
      document.getElementById('recordingStatus').textContent = recording ? 'Yes' : 'No';
      document.getElementById('processingStatus').textContent = processing ? 'Yes' : 'No';
    }

    function addMessage(role, text) {
      const conv = document.getElementById('conversation');
      const msg = document.createElement('div');
      msg.className = 'message ' + role;
      msg.innerHTML = `<strong>${
        role === 'user' ? 'You' :
        role === 'assistant' ? 'AI' :
        role === 'processing' ? 'System' :
        'Error'
      }:</strong> ${text}`;
      conv.appendChild(msg);
      conv.scrollTop = conv.scrollHeight;
    }

    function clearConversation() {
      document.getElementById('conversation').innerHTML = '';
      updateStatus('Ready', false, false);
    }
  </script>
</body>
</html>
```

---

## PHASE 4: ElevenLabs Realtime STT Tests

### TEST 4.1: WebSocket Connection

**Test ด้วย wscat:**

```bash
# ขอ token ก่อน
curl -X POST http://localhost:3000/api/elevenlabs-stt-token

# ได้ token แล้ว connect WebSocket
wscat -c "wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime&language_code=th&audio_format=pcm_16000&commit_strategy=vad"

# ส่ง auth
{"message_type":"auth","token":"your_token_here"}

# ควรได้ response
{"message_type":"session_started",...}
```

**Expected Responses:**
```json
// Success
{
  "message_type": "session_started",
  "session_id": "...",
  "config": {...}
}

// Error
{
  "message_type": "auth_error",
  "error": "Invalid token"
}
```

### TEST 4.2: Realtime Transcription

**HTML Test:** `tests/test-elevenlabs-realtime-stt.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test ElevenLabs Realtime STT</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    button { margin: 10px 5px; padding: 10px 20px; }
    .status { padding: 15px; margin: 20px 0; background: #e3f2fd; }
    .transcript { padding: 20px; margin: 20px 0; background: #f5f5f5; min-height: 200px; }
    .partial { color: #666; font-style: italic; }
    .final { color: #000; font-weight: bold; margin: 5px 0; }
  </style>
</head>
<body>
  <h1>Test ElevenLabs Realtime STT</h1>

  <div>
    <button onclick="connect()">Connect</button>
    <button onclick="disconnect()">Disconnect</button>
    <button onclick="startRecording()">🎤 Start Recording</button>
    <button onclick="stopRecording()">⏹️ Stop Recording</button>
    <button onclick="clearTranscript()">Clear</button>
  </div>

  <div class="status">
    <div><strong>WebSocket:</strong> <span id="wsStatus">Disconnected</span></div>
    <div><strong>Recording:</strong> <span id="recStatus">No</span></div>
  </div>

  <div class="transcript">
    <div><strong>Partial:</strong> <span id="partial" class="partial"></span></div>
    <div style="margin-top: 20px;"><strong>Final Transcripts:</strong></div>
    <div id="finals"></div>
  </div>

  <script>
    let ws = null;
    let audioContext = null;
    let workletNode = null;
    let isRecording = false;

    async function connect() {
      try {
        // Get token
        const tokenRes = await fetch('/api/elevenlabs-stt-token', {
          method: 'POST'
        });
        const { token } = await tokenRes.json();

        // Build URL
        const params = new URLSearchParams({
          model_id: 'scribe_v2_realtime',
          language_code: 'th',
          audio_format: 'pcm_16000',
          commit_strategy: 'vad',
          vad_silence_threshold_secs: '1.0'
        });

        const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?${params}`;

        // Connect
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          document.getElementById('wsStatus').textContent = 'Connected';

          // Send auth
          ws.send(JSON.stringify({
            message_type: 'auth',
            token: token
          }));
        };

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          handleMessage(msg);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          document.getElementById('wsStatus').textContent = 'Disconnected';
        };

      } catch (error) {
        alert('Connection error: ' + error.message);
      }
    }

    function disconnect() {
      if (ws) {
        ws.close();
        ws = null;
      }
      stopRecording();
    }

    function handleMessage(msg) {
      console.log('Received:', msg);

      switch (msg.message_type) {
        case 'session_started':
          console.log('Session started:', msg);
          break;

        case 'partial_transcript':
          document.getElementById('partial').textContent = msg.text;
          break;

        case 'committed_transcript':
          const finalDiv = document.getElementById('finals');
          const p = document.createElement('div');
          p.className = 'final';
          p.textContent = msg.text;
          finalDiv.appendChild(p);
          document.getElementById('partial').textContent = '';
          break;

        case 'auth_error':
        case 'transcriber_error':
        case 'input_error':
          alert('Error: ' + (msg.error || msg.message_type));
          break;
      }
    }

    async function startRecording() {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert('Please connect first');
        return;
      }

      try {
        // Create audio context
        audioContext = new AudioContext({ sampleRate: 16000 });
        await audioContext.audioWorklet.addModule('/audio-processor.js');

        // Get microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        // Create worklet
        workletNode = new AudioWorkletNode(audioContext, 'audio-recorder-processor');

        // Send audio to WebSocket
        workletNode.port.onmessage = (event) => {
          if (event.data.type === 'audioData' && ws.readyState === WebSocket.OPEN) {
            const pcmData = new Float32Array(event.data.data);

            // Convert to Int16
            const int16Data = new Int16Array(pcmData.length);
            for (let i = 0; i < pcmData.length; i++) {
              const s = Math.max(-1, Math.min(1, pcmData[i]));
              int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            // Convert to base64
            const base64 = btoa(String.fromCharCode(...new Uint8Array(int16Data.buffer)));

            // Send to ElevenLabs
            ws.send(JSON.stringify({
              message_type: 'input_audio_chunk',
              audio_base_64: base64,
              sample_rate: 16000,
              commit: false
            }));
          }
        };

        // Connect pipeline
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(workletNode);

        isRecording = true;
        document.getElementById('recStatus').textContent = 'Yes';

      } catch (error) {
        alert('Recording error: ' + error.message);
      }
    }

    function stopRecording() {
      if (workletNode) {
        workletNode.disconnect();
        workletNode = null;
      }

      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }

      isRecording = false;
      document.getElementById('recStatus').textContent = 'No';
    }

    function clearTranscript() {
      document.getElementById('partial').textContent = '';
      document.getElementById('finals').innerHTML = '';
    }
  </script>
</body>
</html>
```

---

## PHASE 5: WebSocket OpenAI Chat Tests

### TEST 5.1: WebSocket Connection

**Test ด้วย wscat:**

```bash
# เริ่ม WebSocket server ก่อน
pnpm ws-server

# Connect
wscat -c ws://localhost:3001/ws-chat

# ส่งข้อความ
{"type":"chat","text":"สวัสดีครับ","system_prompt":"You are helpful."}

# ควรได้ response
{"type":"chat_response","text":"สวัสดีครับ..."}
```

### TEST 5.2: Chat History

**HTML Test:** `tests/test-ws-chat.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test WebSocket Chat</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    .status { padding: 10px; background: #e3f2fd; margin: 10px 0; }
    .messages { border: 1px solid #ddd; padding: 20px; min-height: 400px; margin: 20px 0; }
    .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
    .user { background: #e3f2fd; text-align: right; }
    .assistant { background: #f1f8e9; }
    .input-area { display: flex; gap: 10px; }
    input { flex: 1; padding: 10px; }
    button { padding: 10px 20px; }
  </style>
</head>
<body>
  <h1>Test WebSocket Chat</h1>

  <div class="status">
    <strong>Status:</strong> <span id="status">Disconnected</span>
  </div>

  <div class="messages" id="messages"></div>

  <div class="input-area">
    <input type="text" id="input" placeholder="Type message..." onkeypress="handleKeyPress(event)">
    <button onclick="send()">Send</button>
    <button onclick="reset()">Reset</button>
  </div>

  <script>
    let ws = null;

    // Auto-connect
    window.onload = () => {
      connect();
    };

    function connect() {
      ws = new WebSocket('ws://localhost:3001/ws-chat');

      ws.onopen = () => {
        document.getElementById('status').textContent = 'Connected';
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case 'chat_response':
            addMessage('assistant', msg.text);
            break;

          case 'reset_confirmed':
            document.getElementById('messages').innerHTML = '';
            break;

          case 'error':
            alert('Error: ' + msg.error);
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        document.getElementById('status').textContent = 'Disconnected';
      };
    }

    function send() {
      const input = document.getElementById('input');
      const text = input.value.trim();

      if (!text) return;

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert('Not connected');
        return;
      }

      // Add to UI
      addMessage('user', text);

      // Send to server
      ws.send(JSON.stringify({
        type: 'chat',
        text: text,
        system_prompt: 'You are a helpful Thai-speaking assistant.'
      }));

      input.value = '';
    }

    function reset() {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'reset' }));
      }
    }

    function addMessage(role, text) {
      const div = document.createElement('div');
      div.className = 'message ' + role;
      div.innerHTML = `<strong>${role === 'user' ? 'You' : 'AI'}:</strong> ${text}`;
      document.getElementById('messages').appendChild(div);
    }

    function handleKeyPress(event) {
      if (event.key === 'Enter') {
        send();
      }
    }
  </script>
</body>
</html>
```

---

## PHASE 6: WebSocket ElevenLabs TTS Tests

### TEST 6.1: Streaming TTS

**Test ด้วย wscat:**

```bash
# Connect
wscat -c ws://localhost:3001/ws-tts

# Request synthesis
{"type":"synthesize","text":"สวัสดีครับ","voice_id":"pqHfZKP75CvOlQylNhV4"}

# ควรได้ audio chunks
{"type":"audio_chunk","chunk_index":0,"audio":"base64..."}
{"type":"audio_chunk","chunk_index":1,"audio":"base64..."}
...
{"type":"synthesis_complete"}
```

**HTML Test:** `tests/test-ws-tts.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test WebSocket TTS</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
    textarea { width: 100%; height: 100px; padding: 10px; }
    button { margin: 10px 5px; padding: 10px 20px; }
    .status { padding: 10px; background: #e3f2fd; margin: 10px 0; }
    .progress { padding: 10px; background: #f5f5f5; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>Test WebSocket TTS</h1>

  <textarea id="text" placeholder="Enter text...">สวัสดีครับ ยินดีที่ได้รู้จักครับ</textarea>

  <div>
    <button onclick="connect()">Connect</button>
    <button onclick="disconnect()">Disconnect</button>
    <button onclick="synthesize()">🔊 Synthesize</button>
  </div>

  <div class="status">
    <strong>Status:</strong> <span id="status">Disconnected</span>
  </div>

  <div class="progress">
    <strong>Chunks received:</strong> <span id="chunks">0</span><br>
    <strong>Synthesizing:</strong> <span id="synthesizing">No</span>
  </div>

  <script>
    let ws = null;
    let audioChunks = [];

    function connect() {
      ws = new WebSocket('ws://localhost:3001/ws-tts');

      ws.onopen = () => {
        document.getElementById('status').textContent = 'Connected';
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case 'audio_chunk':
            audioChunks.push(msg.audio);
            document.getElementById('chunks').textContent = audioChunks.length;
            break;

          case 'synthesis_complete':
            document.getElementById('synthesizing').textContent = 'No';
            alert(`Synthesis complete! Received ${audioChunks.length} chunks`);
            break;

          case 'error':
            alert('Error: ' + msg.error);
            document.getElementById('synthesizing').textContent = 'No';
            break;
        }
      };

      ws.onclose = () => {
        document.getElementById('status').textContent = 'Disconnected';
      };
    }

    function disconnect() {
      if (ws) {
        ws.close();
        ws = null;
      }
    }

    function synthesize() {
      const text = document.getElementById('text').value.trim();

      if (!text) {
        alert('Enter some text');
        return;
      }

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert('Not connected');
        return;
      }

      audioChunks = [];
      document.getElementById('chunks').textContent = '0';
      document.getElementById('synthesizing').textContent = 'Yes';

      ws.send(JSON.stringify({
        type: 'synthesize',
        text: text,
        voice_id: 'pqHfZKP75CvOlQylNhV4',
        model_id: 'eleven_v3'
      }));
    }
  </script>
</body>
</html>
```

---

## Integration Tests

### INT-1: Complete V2V Flow

สร้างไฟล์ `tests/test-complete-v2v.html` ที่รวม:
1. ElevenLabs Realtime STT (WebSocket)
2. OpenAI Chat (WebSocket)
3. ElevenLabs TTS (WebSocket)
4. HeyGen Avatar (Mock)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Complete V2V Integration Test</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .panel { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
    .controls { margin: 20px 0; }
    button { margin: 5px; padding: 10px 20px; font-size: 14px; cursor: pointer; }
    button.active { background: #4CAF50; color: white; }
    button.recording { background: #f44336; color: white; animation: pulse 1s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
    .status-item { padding: 10px; background: #f5f5f5; border-radius: 3px; }
    .status-item.active { background: #c8e6c9; }
    .conversation { border: 1px solid #ddd; padding: 20px; min-height: 300px; background: #fafafa; border-radius: 5px; }
    .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
    .user { background: #e3f2fd; }
    .assistant { background: #f1f8e9; }
    .partial { background: #fff3e0; font-style: italic; color: #666; }
    .log { background: #263238; color: #aed581; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 12px; max-height: 400px; overflow-y: auto; }
    .log-entry { margin: 2px 0; }
    .log-stt { color: #81d4fa; }
    .log-chat { color: #ffeb3b; }
    .log-tts { color: #ff8a65; }
    .log-error { color: #ef5350; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎙️ Complete Voice-to-Voice Integration Test</h1>
      <p>Real-time STT → AI Chat → TTS → Avatar</p>
    </div>

    <div class="controls">
      <button id="startBtn" onclick="startSystem()">🚀 Start System</button>
      <button id="stopBtn" onclick="stopSystem()" disabled>🛑 Stop System</button>
      <button id="recordBtn" onclick="toggleRecording()" disabled>🎤 Start Recording</button>
      <button onclick="clearAll()">🗑️ Clear All</button>
    </div>

    <div class="status-grid">
      <div class="status-item" id="status-stt">
        <strong>STT WebSocket:</strong> <span id="stt-status">Disconnected</span>
      </div>
      <div class="status-item" id="status-chat">
        <strong>Chat WebSocket:</strong> <span id="chat-status">Disconnected</span>
      </div>
      <div class="status-item" id="status-tts">
        <strong>TTS WebSocket:</strong> <span id="tts-status">Disconnected</span>
      </div>
      <div class="status-item" id="status-recording">
        <strong>Recording:</strong> <span id="recording-status">No</span>
      </div>
    </div>

    <div class="grid">
      <div class="panel">
        <h3>💬 Conversation</h3>
        <div class="conversation" id="conversation"></div>
      </div>

      <div class="panel">
        <h3>📋 System Log</h3>
        <div class="log" id="log"></div>
      </div>
    </div>
  </div>

  <script>
    // WebSocket connections
    let sttWs = null;
    let chatWs = null;
    let ttsWs = null;

    // Audio
    let audioContext = null;
    let workletNode = null;
    let isRecording = false;
    let isSystemReady = false;

    // State
    let currentPartial = '';
    let ttsChunks = [];

    // ========== System Control ==========

    async function startSystem() {
      try {
        addLog('Starting system...', 'info');

        // Connect all WebSockets
        await connectSTT();
        await connectChat();
        await connectTTS();

        isSystemReady = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('recordBtn').disabled = false;

        addLog('✅ System ready!', 'info');
      } catch (error) {
        addLog(`❌ System start failed: ${error.message}`, 'error');
      }
    }

    function stopSystem() {
      stopRecording();

      if (sttWs) sttWs.close();
      if (chatWs) chatWs.close();
      if (ttsWs) ttsWs.close();

      isSystemReady = false;
      document.getElementById('startBtn').disabled = false;
      document.getElementById('stopBtn').disabled = true;
      document.getElementById('recordBtn').disabled = true;

      addLog('System stopped', 'info');
    }

    // ========== STT WebSocket ==========

    async function connectSTT() {
      addLog('[STT] Getting token...', 'stt');

      const tokenRes = await fetch('/api/elevenlabs-stt-token', { method: 'POST' });
      const { token } = await tokenRes.json();

      const params = new URLSearchParams({
        model_id: 'scribe_v2_realtime',
        language_code: 'th',
        audio_format: 'pcm_16000',
        commit_strategy: 'vad',
        vad_silence_threshold_secs: '1.0'
      });

      const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?${params}`;

      return new Promise((resolve, reject) => {
        sttWs = new WebSocket(wsUrl);

        sttWs.onopen = () => {
          addLog('[STT] Connected', 'stt');
          updateStatus('stt', 'Connected', true);

          sttWs.send(JSON.stringify({
            message_type: 'auth',
            token: token
          }));
        };

        sttWs.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          handleSTTMessage(msg);
        };

        sttWs.onerror = (error) => {
          addLog('[STT] Error', 'error');
          reject(error);
        };

        sttWs.onclose = () => {
          addLog('[STT] Disconnected', 'stt');
          updateStatus('stt', 'Disconnected', false);
        };

        // Resolve when session starts
        const checkReady = setInterval(() => {
          if (sttWs.readyState === WebSocket.OPEN) {
            clearInterval(checkReady);
            resolve();
          }
        }, 100);
      });
    }

    function handleSTTMessage(msg) {
      switch (msg.message_type) {
        case 'session_started':
          addLog('[STT] Session started', 'stt');
          break;

        case 'partial_transcript':
          currentPartial = msg.text;
          updatePartialMessage(msg.text);
          break;

        case 'committed_transcript':
          addLog(`[STT] Transcript: ${msg.text}`, 'stt');
          addMessage('user', msg.text);
          currentPartial = '';

          // Send to chat
          if (chatWs && chatWs.readyState === WebSocket.OPEN) {
            chatWs.send(JSON.stringify({
              type: 'chat',
              text: msg.text,
              system_prompt: 'You are a helpful Thai-speaking assistant.'
            }));
          }
          break;

        case 'auth_error':
        case 'transcriber_error':
          addLog(`[STT] Error: ${msg.error || msg.message_type}`, 'error');
          break;
      }
    }

    // ========== Chat WebSocket ==========

    async function connectChat() {
      return new Promise((resolve, reject) => {
        chatWs = new WebSocket('ws://localhost:3001/ws-chat');

        chatWs.onopen = () => {
          addLog('[CHAT] Connected', 'chat');
          updateStatus('chat', 'Connected', true);
          resolve();
        };

        chatWs.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          handleChatMessage(msg);
        };

        chatWs.onerror = (error) => {
          addLog('[CHAT] Error', 'error');
          reject(error);
        };

        chatWs.onclose = () => {
          addLog('[CHAT] Disconnected', 'chat');
          updateStatus('chat', 'Disconnected', false);
        };
      });
    }

    function handleChatMessage(msg) {
      switch (msg.type) {
        case 'chat_response':
          addLog(`[CHAT] Response: ${msg.text.substring(0, 50)}...`, 'chat');
          addMessage('assistant', msg.text);

          // Send to TTS
          if (ttsWs && ttsWs.readyState === WebSocket.OPEN) {
            ttsChunks = [];
            ttsWs.send(JSON.stringify({
              type: 'synthesize',
              text: msg.text,
              voice_id: 'pqHfZKP75CvOlQylNhV4'
            }));
          }
          break;

        case 'error':
          addLog(`[CHAT] Error: ${msg.error}`, 'error');
          break;
      }
    }

    // ========== TTS WebSocket ==========

    async function connectTTS() {
      return new Promise((resolve, reject) => {
        ttsWs = new WebSocket('ws://localhost:3001/ws-tts');

        ttsWs.onopen = () => {
          addLog('[TTS] Connected', 'tts');
          updateStatus('tts', 'Connected', true);
          resolve();
        };

        ttsWs.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          handleTTSMessage(msg);
        };

        ttsWs.onerror = (error) => {
          addLog('[TTS] Error', 'error');
          reject(error);
        };

        ttsWs.onclose = () => {
          addLog('[TTS] Disconnected', 'tts');
          updateStatus('tts', 'Disconnected', false);
        };
      });
    }

    function handleTTSMessage(msg) {
      switch (msg.type) {
        case 'audio_chunk':
          ttsChunks.push(msg.audio);
          addLog(`[TTS] Chunk ${msg.chunk_index} received`, 'tts');
          // ในระบบจริงจะส่งไปยัง Avatar ทันที
          break;

        case 'synthesis_complete':
          addLog(`[TTS] Complete (${ttsChunks.length} chunks)`, 'tts');
          break;

        case 'error':
          addLog(`[TTS] Error: ${msg.error}`, 'error');
          break;
      }
    }

    // ========== Recording ==========

    async function toggleRecording() {
      if (!isRecording) {
        await startRecording();
      } else {
        await stopRecording();
      }
    }

    async function startRecording() {
      try {
        audioContext = new AudioContext({ sampleRate: 16000 });
        await audioContext.audioWorklet.addModule('/audio-processor.js');

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        workletNode = new AudioWorkletNode(audioContext, 'audio-recorder-processor');

        workletNode.port.onmessage = (event) => {
          if (event.data.type === 'audioData' && sttWs?.readyState === WebSocket.OPEN) {
            const pcmData = new Float32Array(event.data.data);
            const int16Data = new Int16Array(pcmData.length);

            for (let i = 0; i < pcmData.length; i++) {
              const s = Math.max(-1, Math.min(1, pcmData[i]));
              int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            const base64 = btoa(String.fromCharCode(...new Uint8Array(int16Data.buffer)));

            sttWs.send(JSON.stringify({
              message_type: 'input_audio_chunk',
              audio_base_64: base64,
              sample_rate: 16000,
              commit: false
            }));
          }
        };

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(workletNode);

        isRecording = true;
        document.getElementById('recordBtn').textContent = '⏹️ Stop Recording';
        document.getElementById('recordBtn').classList.add('recording');
        updateStatus('recording', 'Yes', true);
        addLog('[REC] Recording started', 'info');

      } catch (error) {
        addLog(`[REC] Error: ${error.message}`, 'error');
      }
    }

    function stopRecording() {
      if (workletNode) {
        workletNode.disconnect();
        workletNode = null;
      }

      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }

      isRecording = false;
      document.getElementById('recordBtn').textContent = '🎤 Start Recording';
      document.getElementById('recordBtn').classList.remove('recording');
      updateStatus('recording', 'No', false);
      addLog('[REC] Recording stopped', 'info');
    }

    // ========== UI Helpers ==========

    function addMessage(role, text) {
      const conv = document.getElementById('conversation');

      // Remove partial if exists
      const partial = document.querySelector('.partial');
      if (partial) partial.remove();

      const msg = document.createElement('div');
      msg.className = 'message ' + role;
      msg.innerHTML = `<strong>${role === 'user' ? 'You' : 'AI'}:</strong> ${text}`;
      conv.appendChild(msg);
      conv.scrollTop = conv.scrollHeight;
    }

    function updatePartialMessage(text) {
      let partial = document.querySelector('.partial');

      if (!partial) {
        const conv = document.getElementById('conversation');
        partial = document.createElement('div');
        partial.className = 'message partial';
        conv.appendChild(partial);
      }

      partial.innerHTML = `<strong>Listening:</strong> ${text}`;
      document.getElementById('conversation').scrollTop = 999999;
    }

    function addLog(message, type = 'info') {
      const log = document.getElementById('log');
      const entry = document.createElement('div');
      entry.className = 'log-entry log-' + type;
      const time = new Date().toLocaleTimeString();
      entry.textContent = `[${time}] ${message}`;
      log.appendChild(entry);
      log.scrollTop = log.scrollHeight;
    }

    function updateStatus(component, text, active) {
      const statusEl = document.getElementById(`status-${component}`);
      const textEl = document.getElementById(`${component}-status`);

      if (textEl) textEl.textContent = text;
      if (statusEl) {
        if (active) {
          statusEl.classList.add('active');
        } else {
          statusEl.classList.remove('active');
        }
      }
    }

    function clearAll() {
      document.getElementById('conversation').innerHTML = '';
      document.getElementById('log').innerHTML = '';
    }
  </script>
</body>
</html>
```

---

## Performance Tests

### PERF-1: Latency Measurement

สร้าง `tests/test-latency.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Latency Test</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #4CAF50; color: white; }
    button { margin: 10px 5px; padding: 10px 20px; }
    .good { background: #c8e6c9; }
    .medium { background: #fff9c4; }
    .bad { background: #ffcdd2; }
  </style>
</head>
<body>
  <h1>Voice-to-Voice Latency Test</h1>

  <button onclick="runTest()">Run Test</button>
  <button onclick="clearResults()">Clear</button>

  <table>
    <thead>
      <tr>
        <th>Phase</th>
        <th>Duration (ms)</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody id="results"></tbody>
  </table>

  <div id="total"></div>

  <script>
    async function runTest() {
      const results = [];

      // Test 1: Session Start
      let start = Date.now();
      await fetch('/api/start-session', { method: 'POST' });
      results.push({ phase: 'Session Start', duration: Date.now() - start, threshold: 2000 });

      // Test 2: Whisper STT
      const audioBlob = await generateTestAudio();
      const formData = new FormData();
      formData.append('audio', audioBlob);

      start = Date.now();
      await fetch('/api/openai-whisper-stt', { method: 'POST', body: formData });
      results.push({ phase: 'Whisper STT', duration: Date.now() - start, threshold: 3000 });

      // Test 3: OpenAI Chat
      start = Date.now();
      await fetch('/api/openai-chat-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' })
      });
      results.push({ phase: 'OpenAI Chat', duration: Date.now() - start, threshold: 2000 });

      // Test 4: ElevenLabs TTS
      start = Date.now();
      await fetch('/api/elevenlabs-text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'สวัสดีครับ' })
      });
      results.push({ phase: 'ElevenLabs TTS', duration: Date.now() - start, threshold: 3000 });

      displayResults(results);
    }

    function displayResults(results) {
      const tbody = document.getElementById('results');
      tbody.innerHTML = '';

      let total = 0;

      results.forEach(result => {
        total += result.duration;

        const row = tbody.insertRow();
        const cellPhase = row.insertCell(0);
        const cellDuration = row.insertCell(1);
        const cellStatus = row.insertCell(2);

        cellPhase.textContent = result.phase;
        cellDuration.textContent = result.duration;

        if (result.duration < result.threshold * 0.7) {
          cellStatus.textContent = '✅ Good';
          row.className = 'good';
        } else if (result.duration < result.threshold) {
          cellStatus.textContent = '⚠️ Medium';
          row.className = 'medium';
        } else {
          cellStatus.textContent = '❌ Slow';
          row.className = 'bad';
        }
      });

      document.getElementById('total').innerHTML = `
        <h3>Total End-to-End Latency: ${total}ms</h3>
        <p>Target: < 10000ms (10 seconds)</p>
      `;
    }

    async function generateTestAudio() {
      // Generate 1 second of silence as test audio
      const sampleRate = 16000;
      const duration = 1;
      const numSamples = sampleRate * duration;

      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);

      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + numSamples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, numSamples * 2, true);

      const pcmData = new Int16Array(numSamples);
      return new Blob([wavHeader, pcmData.buffer], { type: 'audio/wav' });
    }

    function clearResults() {
      document.getElementById('results').innerHTML = '';
      document.getElementById('total').innerHTML = '';
    }
  </script>
</body>
</html>
```

---

## สรุปการทดสอบ

### ✅ Checklist สำหรับแต่ละ Phase

**Phase 1: Session Management**
- [ ] Start session (FULL) สำเร็จ
- [ ] Start session (CUSTOM) สำเร็จ
- [ ] Keep-alive ทำงาน
- [ ] Stop session ทำงาน

**Phase 2: Voice Chat (FULL)**
- [ ] Whisper STT ทำงาน
- [ ] OpenAI Chat ตอบกลับถูกต้อง
- [ ] ElevenLabs TTS สร้างเสียงได้

**Phase 3: Custom Voice Chat**
- [ ] บันทึกเสียงจาก microphone ได้
- [ ] แปลงเสียงเป็นข้อความได้
- [ ] Flow ทั้งหมดทำงานต่อเนื่อง

**Phase 4: Realtime STT**
- [ ] WebSocket connection สำเร็จ
- [ ] Partial transcript แสดงผล
- [ ] Final transcript ถูกต้อง

**Phase 5: WebSocket Chat**
- [ ] Connection สำเร็จ
- [ ] รักษา conversation history
- [ ] Error handling ทำงาน

**Phase 6: WebSocket TTS**
- [ ] Streaming TTS ทำงาน
- [ ] รับ audio chunks ครบ
- [ ] Integration กับ Avatar

**Integration**
- [ ] End-to-end V2V ทำงานสมบูรณ์
- [ ] Latency < 10 วินาที
- [ ] ไม่มี memory leak

---

## Test Tools & Resources

### Postman Collection

สร้าง collection สำหรับ import:

```json
{
  "info": {
    "name": "HeyGen V2V API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Start Session (FULL)",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/start-session"
      }
    },
    {
      "name": "Start Session (CUSTOM)",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/start-custom-session"
      }
    },
    {
      "name": "OpenAI Chat",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/openai-chat-complete",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"message\":\"สวัสดีครับ\"}"
        }
      }
    },
    {
      "name": "ElevenLabs TTS",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/elevenlabs-text-to-speech",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"text\":\"สวัสดีครับ\"}"
        }
      }
    }
  ]
}
```

บันทึกเป็น `tests/postman-collection.json`

---

## การรัน Tests

### รัน HTML Tests

```bash
# รัน server
pnpm dev

# เปิด browser
# http://localhost:3000/tests/test-start-session.html
# http://localhost:3000/tests/test-chat-completion.html
# etc.
```

### รัน Integration Test

```bash
# Terminal 1: Next.js
pnpm dev

# Terminal 2: WebSocket Server
pnpm ws-server

# เปิด browser
# http://localhost:3000/tests/test-complete-v2v.html
```

---

## Expected Results Summary

| Test | Expected Time | Pass Criteria |
|------|---------------|---------------|
| Start Session | < 2s | Get session_token |
| Whisper STT | < 3s | Get transcript |
| OpenAI Chat | < 2s | Get response |
| ElevenLabs TTS | < 3s | Get audio base64 |
| Realtime STT | < 500ms | Get partial/final |
| WebSocket Chat | < 2s | Get response |
| WebSocket TTS | < 3s | Get audio chunks |
| End-to-End V2V | < 10s | Complete conversation |

---

**เอกสารนี้ครอบคลุมการทดสอบทุก Phase ของระบบ Voice-to-Voice Real-time Communication ตั้งแต่ API endpoints, WebSocket connections, จนถึง Integration testing แบบสมบูรณ์**
