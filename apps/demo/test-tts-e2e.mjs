/**
 * End-to-End TTS Test
 * Tests all 8 test cases from TASK4_INTEGRATION_GUIDE.md
 */

import WebSocket from 'ws';

const WS_URL = 'ws://localhost:3013/ws/elevenlabs-tts';
let testResults = [];

console.log('🧪 End-to-End TTS Test Suite');
console.log('=' .repeat(70));
console.log(`📍 Target: ${WS_URL}\n`);

// Test helper function
function runTest(testNum, description, testFn) {
  return new Promise((resolve) => {
    console.log(`\n🔬 Test ${testNum}: ${description}`);
    console.log('-'.repeat(70));
    testFn(resolve);
  });
}

// Test 1: Basic English text (short)
await runTest(1, 'Basic English text (short)', (resolve) => {
  const ws = new WebSocket(WS_URL);
  const testText = 'Hello, this is a test.';
  let receivedChunks = 0;
  let totalChunks = 0;
  let hasConnected = false;

  ws.on('open', () => {
    console.log('✅ Connected');
    hasConnected = true;
    const request = {
      type: 'tts',
      text: testText,
      voice_id: 'moBQ5vcoHD68Es6NqdGR',
      model_id: 'eleven_v3',
      session_id: `test1_${Date.now()}`
    };
    ws.send(JSON.stringify(request));
    console.log(`📤 Sent TTS request: "${testText}"`);
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());

    if (message.type === 'audio_chunk') {
      receivedChunks++;
      totalChunks = message.total_chunks;
      console.log(`📦 Chunk ${message.chunk_index + 1}/${message.total_chunks} - "${message.text}"`);
      console.log(`   Audio size: ${message.audio_data.length} base64 chars`);
    } else if (message.type === 'completed') {
      console.log(`✅ Completed: Received ${receivedChunks}/${totalChunks} chunks`);
      testResults.push({ test: 1, pass: receivedChunks === totalChunks && hasConnected });
      ws.close();
      resolve();
    } else if (message.type === 'error') {
      console.log(`❌ Error: ${message.error}`);
      testResults.push({ test: 1, pass: false });
      ws.close();
      resolve();
    }
  });

  ws.on('error', (error) => {
    console.log(`❌ WebSocket error: ${error.message}`);
    testResults.push({ test: 1, pass: false });
    resolve();
  });

  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('⏱️ Test timeout');
      testResults.push({ test: 1, pass: false });
      ws.close();
      resolve();
    }
  }, 30000);
});

// Test 2: Thai text (multi-language support)
await runTest(2, 'Thai text (multi-language support)', (resolve) => {
  const ws = new WebSocket(WS_URL);
  const testText = 'สวัสดีครับ, นี่คือการทดสอบภาษาไทย';
  let receivedChunks = 0;
  let totalChunks = 0;

  ws.on('open', () => {
    console.log('✅ Connected');
    const request = {
      type: 'tts',
      text: testText,
      voice_id: 'moBQ5vcoHD68Es6NqdGR',
      model_id: 'eleven_v3',
      session_id: `test2_${Date.now()}`
    };
    ws.send(JSON.stringify(request));
    console.log(`📤 Sent TTS request: "${testText}"`);
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());

    if (message.type === 'audio_chunk') {
      receivedChunks++;
      totalChunks = message.total_chunks;
      console.log(`📦 Chunk ${message.chunk_index + 1}/${message.total_chunks} - "${message.text}"`);
    } else if (message.type === 'completed') {
      console.log(`✅ Completed: Received ${receivedChunks}/${totalChunks} chunks`);
      testResults.push({ test: 2, pass: receivedChunks === totalChunks });
      ws.close();
      resolve();
    } else if (message.type === 'error') {
      console.log(`❌ Error: ${message.error}`);
      testResults.push({ test: 2, pass: false });
      ws.close();
      resolve();
    }
  });

  ws.on('error', (error) => {
    console.log(`❌ WebSocket error: ${error.message}`);
    testResults.push({ test: 2, pass: false });
    resolve();
  });

  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('⏱️ Test timeout');
      testResults.push({ test: 2, pass: false });
      ws.close();
      resolve();
    }
  }, 30000);
});

// Test 3: Long text with multiple delimiters (chunking test)
await runTest(3, 'Long text with multiple delimiters', (resolve) => {
  const ws = new WebSocket(WS_URL);
  const testText = 'This is the first sentence. This is the second sentence! Is this the third? Yes, it is: a complete test. Let me explain; this tests chunking.';
  let receivedChunks = 0;
  let totalChunks = 0;

  ws.on('open', () => {
    console.log('✅ Connected');
    const request = {
      type: 'tts',
      text: testText,
      voice_id: 'moBQ5vcoHD68Es6NqdGR',
      model_id: 'eleven_v3',
      session_id: `test3_${Date.now()}`
    };
    ws.send(JSON.stringify(request));
    console.log(`📤 Sent TTS request: "${testText.substring(0, 50)}..."`);
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());

    if (message.type === 'audio_chunk') {
      receivedChunks++;
      totalChunks = message.total_chunks;
      console.log(`📦 Chunk ${message.chunk_index + 1}/${message.total_chunks}`);
      console.log(`   Text: "${message.text}"`);
    } else if (message.type === 'completed') {
      console.log(`✅ Completed: Received ${receivedChunks}/${totalChunks} chunks`);
      // Should have multiple chunks due to delimiters
      const hasMultipleChunks = totalChunks > 1;
      console.log(`   ${hasMultipleChunks ? '✅' : '❌'} Chunking working: ${totalChunks} chunks`);
      testResults.push({ test: 3, pass: receivedChunks === totalChunks && hasMultipleChunks });
      ws.close();
      resolve();
    } else if (message.type === 'error') {
      console.log(`❌ Error: ${message.error}`);
      testResults.push({ test: 3, pass: false });
      ws.close();
      resolve();
    }
  });

  ws.on('error', (error) => {
    console.log(`❌ WebSocket error: ${error.message}`);
    testResults.push({ test: 3, pass: false });
    resolve();
  });

  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('⏱️ Test timeout');
      testResults.push({ test: 3, pass: false });
      ws.close();
      resolve();
    }
  }, 30000);
});

// Test 4: Empty text (error handling)
await runTest(4, 'Empty text (error handling)', (resolve) => {
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('✅ Connected');
    const request = {
      type: 'tts',
      text: '',
      voice_id: 'moBQ5vcoHD68Es6NqdGR',
      model_id: 'eleven_v3',
      session_id: `test4_${Date.now()}`
    };
    ws.send(JSON.stringify(request));
    console.log('📤 Sent TTS request with empty text');
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());

    if (message.type === 'error') {
      console.log(`✅ Expected error received: "${message.error}"`);
      testResults.push({ test: 4, pass: true });
      ws.close();
      resolve();
    } else if (message.type === 'completed') {
      console.log('❌ Should have returned error for empty text');
      testResults.push({ test: 4, pass: false });
      ws.close();
      resolve();
    }
  });

  ws.on('error', (error) => {
    console.log(`❌ WebSocket error: ${error.message}`);
    testResults.push({ test: 4, pass: false });
    resolve();
  });

  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('⏱️ Test timeout');
      testResults.push({ test: 4, pass: false });
      ws.close();
      resolve();
    }
  }, 10000);
});

// Test 5: Invalid message format
await runTest(5, 'Invalid message format (error handling)', (resolve) => {
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('✅ Connected');
    ws.send('invalid json data');
    console.log('📤 Sent invalid JSON');
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());

    if (message.type === 'error') {
      console.log(`✅ Expected error received: "${message.error}"`);
      testResults.push({ test: 5, pass: true });
      ws.close();
      resolve();
    }
  });

  ws.on('error', (error) => {
    console.log(`❌ WebSocket error: ${error.message}`);
    testResults.push({ test: 5, pass: false });
    resolve();
  });

  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('⏱️ Test timeout');
      testResults.push({ test: 5, pass: false });
      ws.close();
      resolve();
    }
  }, 10000);
});

// Test 6: Different voice ID
await runTest(6, 'Different voice ID (George)', (resolve) => {
  const ws = new WebSocket(WS_URL);
  const testText = 'Testing with George voice.';
  let receivedChunks = 0;

  ws.on('open', () => {
    console.log('✅ Connected');
    const request = {
      type: 'tts',
      text: testText,
      voice_id: 'JBFqnCBsd6RMkjVDRZzb', // George
      model_id: 'eleven_v3',
      session_id: `test6_${Date.now()}`
    };
    ws.send(JSON.stringify(request));
    console.log(`📤 Sent TTS request with George voice: "${testText}"`);
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());

    if (message.type === 'audio_chunk') {
      receivedChunks++;
      console.log(`📦 Chunk ${message.chunk_index + 1}/${message.total_chunks}`);
    } else if (message.type === 'completed') {
      console.log(`✅ Completed: Received ${receivedChunks} chunks with George voice`);
      testResults.push({ test: 6, pass: receivedChunks > 0 });
      ws.close();
      resolve();
    } else if (message.type === 'error') {
      console.log(`❌ Error: ${message.error}`);
      testResults.push({ test: 6, pass: false });
      ws.close();
      resolve();
    }
  });

  ws.on('error', (error) => {
    console.log(`❌ WebSocket error: ${error.message}`);
    testResults.push({ test: 6, pass: false });
    resolve();
  });

  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('⏱️ Test timeout');
      testResults.push({ test: 6, pass: false });
      ws.close();
      resolve();
    }
  }, 30000);
});

// Test 7: Audio chunk sequencing
await runTest(7, 'Audio chunk sequencing (order validation)', (resolve) => {
  const ws = new WebSocket(WS_URL);
  const testText = 'First part. Second part. Third part.';
  let chunks = [];

  ws.on('open', () => {
    console.log('✅ Connected');
    const request = {
      type: 'tts',
      text: testText,
      voice_id: 'moBQ5vcoHD68Es6NqdGR',
      model_id: 'eleven_v3',
      session_id: `test7_${Date.now()}`
    };
    ws.send(JSON.stringify(request));
    console.log(`📤 Sent TTS request: "${testText}"`);
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());

    if (message.type === 'audio_chunk') {
      chunks.push(message.chunk_index);
      console.log(`📦 Chunk ${message.chunk_index + 1}/${message.total_chunks} - Index: ${message.chunk_index}`);
    } else if (message.type === 'completed') {
      // Check if chunks are in sequential order
      const isSequential = chunks.every((val, idx) => val === idx);
      console.log(`   Chunks received: [${chunks.join(', ')}]`);
      console.log(`   ${isSequential ? '✅' : '❌'} Chunks in sequential order: ${isSequential}`);
      testResults.push({ test: 7, pass: isSequential });
      ws.close();
      resolve();
    } else if (message.type === 'error') {
      console.log(`❌ Error: ${message.error}`);
      testResults.push({ test: 7, pass: false });
      ws.close();
      resolve();
    }
  });

  ws.on('error', (error) => {
    console.log(`❌ WebSocket error: ${error.message}`);
    testResults.push({ test: 7, pass: false });
    resolve();
  });

  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('⏱️ Test timeout');
      testResults.push({ test: 7, pass: false });
      ws.close();
      resolve();
    }
  }, 30000);
});

// Test 8: Ping-Pong utility
await runTest(8, 'Ping-Pong utility message', (resolve) => {
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('✅ Connected');
    const request = { type: 'ping' };
    ws.send(JSON.stringify(request));
    console.log('📤 Sent ping');
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());

    if (message.type === 'pong') {
      console.log(`✅ Pong received: ${message.timestamp}`);
      testResults.push({ test: 8, pass: true });
      ws.close();
      resolve();
    }
  });

  ws.on('error', (error) => {
    console.log(`❌ WebSocket error: ${error.message}`);
    testResults.push({ test: 8, pass: false });
    resolve();
  });

  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('⏱️ Test timeout');
      testResults.push({ test: 8, pass: false });
      ws.close();
      resolve();
    }
  }, 10000);
});

// Print test summary
console.log('\n' + '='.repeat(70));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(70));

const passedTests = testResults.filter(r => r.pass).length;
const totalTests = testResults.length;

testResults.forEach((result) => {
  const status = result.pass ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - Test ${result.test}`);
});

console.log('-'.repeat(70));
console.log(`Total: ${passedTests}/${totalTests} tests passed`);
console.log(`Pass rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
console.log('='.repeat(70));

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! WebSocket TTS is ready for integration.\n');
  process.exit(0);
} else {
  console.log(`\n⚠️ ${totalTests - passedTests} test(s) failed. Please review the errors above.\n`);
  process.exit(1);
}
