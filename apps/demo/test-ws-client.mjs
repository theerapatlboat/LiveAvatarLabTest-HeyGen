/**
 * WebSocket Connection Test Client
 * Tests WebSocket connection and origin validation
 */

import WebSocket from 'ws';

const WS_URL = 'ws://localhost:3013/ws/elevenlabs-tts';

console.log('🧪 WebSocket Connection Test');
console.log('=' .repeat(50));
console.log(`📍 Target: ${WS_URL}\n`);

// Test 1: Connection from allowed origin (localhost:3012)
console.log('🔬 Test 1: Connection with allowed origin (localhost:3012)');
try {
  const ws1 = new WebSocket(WS_URL, {
    headers: {
      'Origin': 'http://localhost:3012'
    }
  });

  ws1.on('open', () => {
    console.log('✅ Test 1 PASS: Connection established from localhost:3012');

    // Send ping
    const ping = { type: 'ping' };
    ws1.send(JSON.stringify(ping));
    console.log('📤 Sent ping message');
  });

  ws1.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 Received: ${message.type} - ${message.message || JSON.stringify(message)}`);

      if (message.type === 'pong') {
        console.log('✅ Ping-Pong test successful\n');
        ws1.close();

        // After successful test 1, run test 2
        setTimeout(runTest2, 1000);
      }
    } catch (e) {
      console.log(`📨 Received: ${data.toString()}`);
    }
  });

  ws1.on('error', (error) => {
    console.log(`❌ Test 1 FAIL: ${error.message}\n`);
  });

  ws1.on('close', () => {
    console.log('🔌 Test 1 connection closed\n');
  });

} catch (error) {
  console.log(`❌ Test 1 FAIL: ${error.message}\n`);
}

// Test 2: Connection from disallowed origin (should be rejected)
function runTest2() {
  console.log('🔬 Test 2: Connection with disallowed origin (example.com)');
  try {
    const ws2 = new WebSocket(WS_URL, {
      headers: {
        'Origin': 'http://example.com'
      }
    });

    ws2.on('open', () => {
      console.log('❌ Test 2 FAIL: Connection should have been rejected!\n');
      ws2.close();
      runTest3();
    });

    ws2.on('error', (error) => {
      // This is expected - connection should be rejected
      if (error.message.includes('403') || error.message.includes('Unexpected server response')) {
        console.log('✅ Test 2 PASS: Connection correctly rejected from disallowed origin');
        console.log(`   Error: ${error.message}\n`);
      } else {
        console.log(`⚠️ Test 2: Unexpected error: ${error.message}\n`);
      }
      runTest3();
    });

    ws2.on('close', () => {
      // Connection closed before opening (rejected)
    });

  } catch (error) {
    console.log(`❌ Test 2 ERROR: ${error.message}\n`);
    runTest3();
  }
}

// Test 3: Connection without Origin header (should be allowed for same-origin)
function runTest3() {
  console.log('🔬 Test 3: Connection without Origin header (same-origin)');
  try {
    const ws3 = new WebSocket(WS_URL);

    ws3.on('open', () => {
      console.log('✅ Test 3 PASS: Connection established without Origin header (same-origin allowed)');

      // Send ping
      const ping = { type: 'ping' };
      ws3.send(JSON.stringify(ping));
    });

    ws3.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'pong') {
          console.log('✅ Ping-Pong successful\n');
          ws3.close();
          printSummary();
        }
      } catch (e) {
        console.log(`📨 Received: ${data.toString()}`);
      }
    });

    ws3.on('error', (error) => {
      console.log(`❌ Test 3 FAIL: ${error.message}\n`);
      printSummary();
    });

    ws3.on('close', () => {
      console.log('🔌 Test 3 connection closed\n');
    });

  } catch (error) {
    console.log(`❌ Test 3 ERROR: ${error.message}\n`);
    printSummary();
  }
}

function printSummary() {
  console.log('=' .repeat(50));
  console.log('📊 Test Summary:');
  console.log('✅ Connection from localhost:3012 should work');
  console.log('✅ Connection from disallowed origin should be rejected');
  console.log('✅ Connection without Origin header should work (same-origin)');
  console.log('=' .repeat(50));

  // Exit after 2 seconds
  setTimeout(() => {
    process.exit(0);
  }, 2000);
}
