import { mkdir, realpath } from "node:fs/promises";
import path from "node:path";
/** Resolve symlinks so /tmp aliases and another cwd cannot expose private auditions. */
export async function privateOutputFolder(output, repository) {
  const repo = await realpath(repository);
  await mkdir(path.resolve(output), { recursive: true, mode: 0o700 });
  const target = await realpath(path.resolve(output));
  if (target === repo || target.startsWith(repo + path.sep))
    throw Error(
      "Unapproved audio must be outside the Git checkout, including public/.",
    );
  return target;
}
/** Build-time/local-only provider client. Never import into src/ or a browser bundle. */
export const TIGGY_DESCRIPTION =
  "Native English with a gentle natural Irish lilt. An original fictional young cartoon boy: cheerful, curious and kind. Light youthful timbre, clear consonants, short natural phrases and warm restrained enthusiasm. Clean studio audio. Not an adult narrator, squeaky baby impression or imitation of a real person. No pitch conversion.";
export const AUDITION_TEXT =
  "Hello! I’m Tiggy. Let’s play! Can you find the red one? Well done! You did it! More, please. Thank you! Help me, please!";
export function createElevenClient({
  apiKey,
  fetchImpl = fetch,
  projectApproved = false,
}) {
  if (!apiKey?.trim())
    throw Error(
      "Configure ELEVENLABS_API_KEY privately in .env.local. Never paste it into chat or a NEXT_PUBLIC_ variable.",
    );
  if (!projectApproved)
    throw Error(
      "ElevenLabs approval for this children’s app is not confirmed. See docs/audio/ELEVENLABS.md.",
    );
  const clean = (value) =>
    String(value).replaceAll(apiKey, "[redacted]").slice(0, 600);
  async function request(endpoint, body) {
    let response;
    try {
      response = await fetchImpl(`https://api.elevenlabs.io${endpoint}`, {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000),
      });
    } catch {
      throw Error(
        "ElevenLabs request did not complete. No automatic retry was made; check provider history before retrying an uncertain request.",
      );
    }
    if (!response.ok) {
      let message = "Provider request failed";
      try {
        const data = await response.json();
        message =
          data.detail?.message ||
          data.detail?.status ||
          (typeof data.detail === "string" ? data.detail : message);
      } catch {}
      throw Error(
        `ElevenLabs ${response.status}: ${clean(message)}. Stopped without retry or fallback voice.`,
      );
    }
    return response;
  }
  return {
    async design({
      description = TIGGY_DESCRIPTION,
      text = AUDITION_TEXT,
      model = "eleven_ttv_v3",
    } = {}) {
      if (
        description.length < 20 ||
        description.length > 1000 ||
        text.length < 100 ||
        text.length > 1000
      )
        throw Error(
          "Design needs a 20–1000 character description and a 100–1000 character audition script.",
        );
      if (!["eleven_ttv_v3", "eleven_multilingual_ttv_v2"].includes(model))
        throw Error("Choose a documented ElevenLabs design model.");
      const r = await request(
        "/v1/text-to-voice/design?output_format=mp3_44100_128",
        {
          voice_description: description,
          text,
          model_id: model,
          stream_previews: false,
        },
      );
      const data = await r.json();
      if (
        !Array.isArray(data.previews) ||
        !data.previews.length ||
        data.previews.length > 5
      )
        throw Error(
          "No valid audition previews were returned. No replacement was generated.",
        );
      const previews = data.previews.map((p) => {
        if (
          typeof p.generated_voice_id !== "string" ||
          typeof p.audio_base_64 !== "string" ||
          !p.media_type?.startsWith("audio/") ||
          !Number.isFinite(p.duration_secs) ||
          p.duration_secs <= 0 ||
          !/^[-A-Za-z0-9_]+$/.test(p.generated_voice_id) ||
          !/^[A-Za-z0-9+/=\s]+$/.test(p.audio_base_64)
        )
          throw Error("Invalid provider audition response.");
        const bytes = Buffer.from(p.audio_base_64, "base64");
        if (!bytes.length || bytes.length > 8_000_000)
          throw Error("Provider audition is empty or too large.");
        return {
          id: p.generated_voice_id,
          bytes,
          type: p.media_type,
          duration: p.duration_secs,
        };
      });
      return {
        text: typeof data.text === "string" ? data.text : text,
        description,
        model,
        previews,
      };
    },
    async save({
      generatedId,
      name,
      description = TIGGY_DESCRIPTION,
      voiceApproved = false,
    }) {
      if (!voiceApproved)
        throw Error(
          "Listen to the auditions and explicitly approve one before saving a voice.",
        );
      if (!/^[-A-Za-z0-9_]+$/.test(generatedId || "") || !name?.trim())
        throw Error("A returned audition ID and voice name are required.");
      const data = await (
        await request("/v1/text-to-voice", {
          voice_name: name.trim().slice(0, 80),
          voice_description: description,
          generated_voice_id: generatedId,
        })
      ).json();
      if (
        typeof data.voice_id !== "string" ||
        !/^[-A-Za-z0-9_]+$/.test(data.voice_id)
      )
        throw Error(
          "No valid saved voice ID was returned. Check provider history before retrying.",
        );
      return { id: data.voice_id, name: data.name || name };
    },
    async speak({ voiceId, text, model = "eleven_v4", voiceApproved = false }) {
      if (!voiceApproved)
        throw Error("Approve the selected voice before generating dialogue.");
      if (
        !/^[-A-Za-z0-9_]+$/.test(voiceId || "") ||
        !text?.trim() ||
        text.length > 1000
      )
        throw Error(
          "A selected voice ID and short dialogue phrase are required.",
        );
      const r = await request(
        `/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
        { text, model_id: model, voice_settings: { speed: 1 } },
      );
      if (!r.headers.get("content-type")?.startsWith("audio/"))
        throw Error(
          "The provider returned a non-audio response. No file was saved.",
        );
      const bytes = Buffer.from(await r.arrayBuffer());
      if (!bytes.length || bytes.length > 8_000_000)
        throw Error("The generated recording is empty or too large.");
      return { bytes, requestId: r.headers.get("request-id") };
    },
  };
}
