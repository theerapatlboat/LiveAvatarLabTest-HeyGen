netstat -aon | findstr :3012
taskkill /PID 4567 /F

อัพเดตไฟล์ documents\V2V_REALTIME.md ในส่วนของ PHASE 4: ElevenLabs Realtime Speech-to-Text Integration ด้วยเนื้อหาต่อไปนี้
- ใช้ import { Scribe, AudioFormat, RealtimeEvents, CommitStrategy } from "@elevenlabs/client"; ในการ Configure the SDK แทน React Hook หรือใช้วิธี Manual audio chunking  แทน React Hook
- ใช้โปรแกรมต่อไปนี้ในการเชื่อมต่อกับ ElevenLabs 
import { Scribe, AudioFormat, CommitStrategy } from "@elevenlabs/client";

const connection = Scribe.connect({
  token: "your-token",
  modelId: "scribe_v2_realtime",
  languageCode: "en",
  audioFormat: AudioFormat.PCM_16000,
  commitStrategy: CommitStrategy.VAD,
  vadSilenceThresholdSecs: 1.5,
  vadThreshold: 0.4,
  minSpeechDurationMs: 100,
  minSilenceDurationMs: 100,
});
- ให้ใช้ pcm_16000 ในการเก็บเสียงเป็นหลัก เพื่อส่งไปให้ ElevenLabs Realtime Speech-to-Text ประมวลผล
- วิเคราะห์เอกสารต่อไปนี้อย่างละเอียด https://elevenlabs.io/docs/cookbooks/speech-to-text/streaming#received-events เพื่อนำข้อมูลหลักการเขียนโปรแกรมมาปรับใช้กับโปรแกรมนี้
- หากมีคำถามที่ต้องการข้อมูลเพิ่มเติมสำหรับการดำเนินการนี้ สามารถถามได้

ให้อัพเดตไฟล์ documents\V2V_REALTIME.md ให้ใช้ วิธีการ 1: Scribe.connect() with Microphone ใน TASK 4.2: Setup Realtime STT with Scribe.connect()