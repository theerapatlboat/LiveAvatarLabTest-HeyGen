import { NextResponse } from 'next/server';
import { ELEVENLABS_API_KEY } from '../secrets';

/**
 * ElevenLabs Scribe v2 Realtime - Single-Use Token Generator
 *
 * This endpoint generates a single-use token for authenticating WebSocket connections
 * to ElevenLabs Scribe v2 Realtime Speech-to-Text API.
 *
 * Security:
 * - Token expires in 15 minutes
 * - Token can only be used once per WebSocket connection
 * - Keeps ELEVENLABS_API_KEY secure on backend
 *
 * API Docs: https://elevenlabs.io/docs/api-reference/speech-to-text-websocket
 */
export async function POST() {
  try {
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Call ElevenLabs API to generate single-use token
    const response = await fetch(
      'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ElevenLabs API error:', errorData);
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      token: data.token,
      expires_at: data.expires_at
    });

  } catch (error) {
    console.error('Error generating ElevenLabs STT token:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
