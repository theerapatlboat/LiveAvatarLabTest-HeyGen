import { OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_WHISPER_MODEL } from "../secrets";

export async function POST(request: Request) {
  try {
    const formDataRequest = await request.formData();
    const audioFile = formDataRequest.get("audio") as File;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "audio file is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Create FormData for Whisper API
    const formData = new FormData();
    formData.append("file", audioFile, "recording.webm");
    formData.append("model", OPENAI_WHISPER_MODEL);
    formData.append("language", "th"); // Thai language

    // Call OpenAI Whisper API
    const res = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("OpenAI Whisper API error:", errorData);
      return new Response(
        JSON.stringify({
          error: "Failed to transcribe audio",
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
    const transcript = data.text || "";

    return new Response(JSON.stringify({ transcript }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return new Response(
      JSON.stringify({ error: "Failed to transcribe audio" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
