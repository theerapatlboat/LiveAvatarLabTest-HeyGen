import type WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment configuration
const PORT = 3013;
const WS_PATH = '/ws/elevenlabs-tts';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

// Validate API key
if (ELEVENLABS_API_KEY) {
  console.log('✅ ElevenLabs API key found');
} else {
  console.warn('⚠️ ELEVENLABS_API_KEY not found in environment variables');
}

// Create HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ElevenLabs WebSocket TTS Server is running\n');
});

// Create WebSocket server
const wss = new WebSocketServer({
  server,
  path: WS_PATH
});

console.log(`🚀 Starting WebSocket TTS server...`);
console.log(`📍 Port: ${PORT}`);
console.log(`🛤️  Path: ${WS_PATH}`);

// WebSocket connection handler
wss.on('connection', (ws: WebSocket, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`📞 New client connected from ${clientIP}`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to ElevenLabs WebSocket TTS Server',
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages
  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 Received message type: ${message.type}`);

      switch (message.type) {
        case 'tts':
          await handleTTSRequest(ws, message);
          break;
        case 'stop':
          handleStopRequest(ws, message);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;
        default:
          sendError(ws, `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
      sendError(ws, 'Invalid message format');
    }
  });

  // Handle connection close
  ws.on('close', () => {
    console.log(`🔌 Client disconnected from ${clientIP}`);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`❌ WebSocket error from ${clientIP}:`, error);
  });
});

/**
 * Text Chunking Logic
 * Split text ONLY by delimiters - NO maxChunkSize limit
 * Delimiters: Period (.), Exclamation (!), Question (?), Comma (,), Semicolon (;), Colon (:)
 * Each delimiter creates a new chunk regardless of length
 */
function chunkText(text: string): string[] {
  console.log('🔪 Starting delimiter-based text chunking...');
  console.log(`📝 Original text length: ${text.length} characters`);

  // If text is empty, return empty array
  if (!text || text.trim().length === 0) {
    console.log('⚠️ Empty text, returning empty array');
    return [];
  }

  const chunks: string[] = [];
  let currentChunk = '';

  // All delimiters: , ! ? : ; .
  const allDelimiters = /([.!?,;:])/g;

  // Split by all delimiters
  const parts = text.split(allDelimiters);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Skip empty parts
    if (!part || part.trim().length === 0) continue;

    // Add part to current chunk
    currentChunk += part;

    // Check if current part is a delimiter
    const isDelimiter = /[.!?,;:]/.test(part);

    // If it's a delimiter, flush the current chunk
    if (isDelimiter && currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
      console.log(`✂️ Chunk ${chunks.length}: ${currentChunk.length} chars - "${currentChunk.substring(0, 50)}..."`);
      currentChunk = '';
    }
  }

  // Add remaining text as final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
    console.log(`✂️ Chunk ${chunks.length} (final): ${currentChunk.length} chars - "${currentChunk.substring(0, 50)}..."`);
  }

  // If no chunks were created (edge case), return original text as single chunk
  if (chunks.length === 0) {
    console.log('⚠️ No delimiters found, returning text as single chunk');
    chunks.push(text.trim());
    console.log(`✂️ Chunk 1 (no delimiters): ${text.trim().length} chars`);
  }

  console.log(`✅ Text chunked into ${chunks.length} chunks using delimiters: , ! ? : ; .`);
  return chunks;
}

// Handle TTS request
async function handleTTSRequest(ws: WebSocket, message: any) {
  console.log('🎤 Processing TTS request...');

  // Validation
  if (!message.text || typeof message.text !== 'string') {
    sendError(ws, 'Missing or invalid "text" field');
    return;
  }

  if (!ELEVENLABS_API_KEY) {
    sendError(ws, 'ELEVENLABS_API_KEY not configured. Check environment variables');
    return;
  }

  // Extract parameters
  const {
    text,
    voice_id = 'JBFqnCBsd6RMkjVDRZzb', // Default: George (English)
    model_id = 'eleven_multilingual_v2',
    session_id = `session_${Date.now()}`,
    stability = 0.5,
    similarity_boost = 0.75,
    style = 0.0,
    speed = 1.0
  } = message;

  console.log(`📋 Session: ${session_id}`);
  console.log(`🗣️ Voice ID: ${voice_id}`);
  console.log(`🤖 Model: ${model_id}`);

  // Step 1: Chunk the text (delimiter-based only, no size limit)
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    sendError(ws, 'Text chunking resulted in no chunks');
    return;
  }

  console.log(`📦 Processing ${chunks.length} chunks...`);

  // Process each chunk with ElevenLabs API
  try {
    for (let i = 0; i < chunks.length; i++) {
      const currentChunkText = chunks[i];
      const chunkIndex = i;
      const totalChunks = chunks.length;

      // Type guard: ensure chunk text exists
      if (!currentChunkText) {
        console.warn(`⚠️ Skipping empty chunk at index ${chunkIndex}`);
        continue;
      }

      console.log(`\n🎯 Processing chunk ${chunkIndex + 1}/${totalChunks}`);
      console.log(`📝 Text: "${currentChunkText.substring(0, 100)}${currentChunkText.length > 100 ? '...' : ''}"`);

      try {
        // Call ElevenLabs TTS API using REST API
        const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: currentChunkText,
            model_id: model_id,
            voice_settings: {
              stability: stability,
              similarity_boost: similarity_boost,
              style: style,
              use_speaker_boost: true
            }
          })
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
        }

        // Get audio buffer from response
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        console.log(`✅ Audio generated: ${audioBuffer.length} bytes`);

        // Convert to base64 for transmission
        const audioBase64 = audioBuffer.toString('base64');

        // Send audio chunk to client
        const audioChunkMessage = {
          type: 'audio_chunk',
          chunk_index: chunkIndex,
          total_chunks: totalChunks,
          audio_data: audioBase64,
          text: currentChunkText,
          format: 'mp3_44100_128',
          session_id: session_id
        };

        ws.send(JSON.stringify(audioChunkMessage));
        console.log(`📤 Sent audio chunk ${chunkIndex + 1}/${totalChunks} to client (${audioBase64.length} base64 chars)`);

      } catch (chunkError: any) {
        console.error(`❌ Error processing chunk ${chunkIndex + 1}:`, chunkError.message);
        sendError(ws, `Failed to process chunk ${chunkIndex + 1}: ${chunkError.message}`);
        // Continue with next chunk instead of stopping entire process
        continue;
      }
    }

    // Send completion message
    const completionMessage = {
      type: 'completed',
      session_id: session_id,
      total_chunks: chunks.length,
      timestamp: new Date().toISOString()
    };

    ws.send(JSON.stringify(completionMessage));
    console.log(`\n✅ TTS processing completed for session: ${session_id}`);
    console.log(`📊 Successfully processed ${chunks.length} chunks\n`);

  } catch (error: any) {
    console.error('❌ Error in TTS processing:', error);
    sendError(ws, `TTS processing failed: ${error.message}`);
  }
}

// Handle stop request
function handleStopRequest(ws: WebSocket, message: any) {
  console.log('🛑 Stop request received');
  ws.send(JSON.stringify({
    type: 'stopped',
    session_id: message.session_id,
    timestamp: new Date().toISOString()
  }));
}

// Send error message to client
function sendError(ws: WebSocket, errorMessage: string) {
  console.error(`❌ Error: ${errorMessage}`);
  ws.send(JSON.stringify({
    type: 'error',
    error: errorMessage,
    timestamp: new Date().toISOString()
  }));
}

// Start server
server.listen(PORT, () => {
  console.log(`✅ WebSocket TTS Server is listening on port ${PORT}`);
  console.log(`🔗 Connect to: ws://localhost:${PORT}${WS_PATH}`);
  console.log(`💡 Use 'pnpm ws-tts' to start this server`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  wss.clients.forEach((client) => {
    client.close();
  });
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});
