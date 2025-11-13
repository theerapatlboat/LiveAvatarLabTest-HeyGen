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
    <div style={{
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      color: '#1a1a1a'
    }}>
      <h1 style={{
        fontSize: '2rem',
        marginBottom: '1rem',
        color: '#1a1a1a'
      }}>
        🎤 Test WebSocket TTS Hook
      </h1>

      <div style={{
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #ddd',
        color: '#1a1a1a'
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>Status</h2>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div>
            <strong>Connected:</strong>{' '}
            <span style={{
              color: isConnected ? '#16a34a' : '#dc2626',
              fontWeight: 'bold'
            }}>
              {isConnected ? '✅ YES' : '❌ NO'}
            </span>
          </div>
          <div>
            <strong>Synthesizing:</strong>{' '}
            <span style={{
              color: isSynthesizing ? '#2563eb' : '#6b7280',
              fontWeight: 'bold'
            }}>
              {isSynthesizing ? '🔄 YES' : '⏸️ NO'}
            </span>
          </div>
          <div>
            <strong>Progress:</strong>{' '}
            <span style={{ fontWeight: 'bold' }}>
              {progress.current}/{progress.total}
            </span>
            {progress.total > 0 && (
              <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                ({Math.round((progress.current / progress.total) * 100)}%)
              </span>
            )}
          </div>
          {progress.currentText && (
            <div>
              <strong>Current Text:</strong>{' '}
              <span style={{
                fontStyle: 'italic',
                color: '#6b7280'
              }}>
                "{progress.currentText.substring(0, 50)}
                {progress.currentText.length > 50 ? '...' : ''}"
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={connect}
          disabled={isConnected}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: isConnected ? '#9ca3af' : '#16a34a',
            color: 'white',
            cursor: isConnected ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🔌 Connect
        </button>

        <button
          onClick={disconnect}
          disabled={!isConnected}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: !isConnected ? '#9ca3af' : '#dc2626',
            color: 'white',
            cursor: !isConnected ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🔌 Disconnect
        </button>

        <button
          onClick={ping}
          disabled={!isConnected}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: !isConnected ? '#9ca3af' : '#2563eb',
            color: 'white',
            cursor: !isConnected ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🏓 Ping
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 'bold',
          color: '#1a1a1a'
        }}>
          Test Text:
        </label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Enter text to synthesize..."
          rows={4}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            resize: 'vertical',
            color: '#1a1a1a',
            backgroundColor: '#ffffff'
          }}
        />
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Character count: {testText.length}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => synthesize(testText)}
          disabled={!isConnected || isSynthesizing || !testText.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: (!isConnected || isSynthesizing || !testText.trim()) ? '#9ca3af' : '#2563eb',
            color: 'white',
            cursor: (!isConnected || isSynthesizing || !testText.trim()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🎤 Synthesize
        </button>

        <button
          onClick={stop}
          disabled={!isSynthesizing}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: !isSynthesizing ? '#9ca3af' : '#dc2626',
            color: 'white',
            cursor: !isSynthesizing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🛑 Stop
        </button>
      </div>

      <div style={{
        padding: '1rem',
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        border: '1px solid #fbbf24',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: '1rem',
          marginBottom: '0.5rem',
          color: '#92400e'
        }}>
          ⚠️ Instructions
        </h3>
        <ol style={{
          margin: '0',
          paddingLeft: '1.5rem',
          color: '#92400e'
        }}>
          <li>Make sure WebSocket server is running: <code>pnpm ws-tts</code></li>
          <li>Click "Connect" to establish WebSocket connection</li>
          <li>Enter text in the textarea (Thai or English)</li>
          <li>Click "Synthesize" to convert text to speech</li>
          <li>Listen to the audio playback</li>
          <li>Check browser console (F12) for detailed logs</li>
        </ol>
      </div>

      <div style={{
        padding: '1rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #38bdf8'
      }}>
        <h3 style={{
          fontSize: '1rem',
          marginBottom: '0.5rem',
          color: '#0c4a6e'
        }}>
          💡 Quick Test Examples
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => setTestText('สวัสดีครับ ยินดีต้อนรับ')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              borderRadius: '4px',
              border: '1px solid #38bdf8',
              backgroundColor: 'white',
              color: '#0c4a6e',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Thai: "สวัสดีครับ ยินดีต้อนรับ"
          </button>
          <button
            onClick={() => setTestText('Hello, welcome to the WebSocket TTS system!')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              borderRadius: '4px',
              border: '1px solid #38bdf8',
              backgroundColor: 'white',
              color: '#0c4a6e',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            English: "Hello, welcome to the WebSocket TTS system!"
          </button>
          <button
            onClick={() => setTestText('สวัสดีครับ, ยินดีต้อนรับสู่ระบบ! ขอบคุณมากครับ. วันนี้อากาศดีมากเลยครับ.')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              borderRadius: '4px',
              border: '1px solid #38bdf8',
              backgroundColor: 'white',
              color: '#0c4a6e',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Long Thai: Multiple sentences (tests chunking)
          </button>
        </div>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>
        <strong>WebSocket URL:</strong> ws://localhost:3013/ws/elevenlabs-tts<br/>
        <strong>Test Page Path:</strong> /test-ws-tts<br/>
        <strong>Hook File:</strong> src/liveavatar/useWebSocketTTS.ts
      </div>
    </div>
  );
}
