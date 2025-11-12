import { API_KEY, API_URL } from "../secrets";

export async function GET() {
  try {
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: "LiveAvatar API key not configured" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Call LiveAvatar API to list all voices
    // https://docs.liveavatar.com/reference/list_voices_v1_voices_get
    const res = await fetch(`${API_URL}/v1/voices`, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
      },
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("HeyGen API error:", errorData);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch voices",
          details: errorData,
        }),
        {
          status: res.status,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const data = await res.json();

    console.log("LiveAvatar API response structure:", JSON.stringify(data, null, 2));

    // LiveAvatar API returns voices array - try multiple possible structures
    let voices = [];
    if (Array.isArray(data)) {
      voices = data;
    } else if (data.voices && Array.isArray(data.voices)) {
      voices = data.voices;
    } else if (data.data && data.data.voices && Array.isArray(data.data.voices)) {
      voices = data.data.voices;
    } else if (data.data && Array.isArray(data.data)) {
      voices = data.data;
    }

    // Filter only voices that support interactive avatar
    const interactiveVoices = voices.filter(
      (voice: any) => voice.support_interactive_avatar === true
    );

    // Format for easier reading
    const formattedVoices = interactiveVoices.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      language: voice.language,
      gender: voice.gender,
      support_interactive_avatar: voice.support_interactive_avatar,
      emotion_support: voice.emotion_support || [],
      preview_audio: voice.preview_audio || voice.preview_audio_url,
    }));

    return new Response(
      JSON.stringify({
        total: formattedVoices.length,
        voices: formattedVoices,
        raw_response_keys: Object.keys(data) // Debug: show what keys we got
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching voices:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch voices" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
