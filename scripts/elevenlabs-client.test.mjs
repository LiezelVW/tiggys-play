import test from "node:test";
import assert from "node:assert/strict";
import {
  createElevenClient,
  AUDITION_TEXT,
  TIGGY_DESCRIPTION,
} from "./elevenlabs-client.mjs";
const key = "test-key-not-a-real-credential";
test("requires private credentials and a confirmed permitted use before any request", () => {
  let requests = 0;
  const fetchImpl = async () => {
    requests++;
  };
  assert.throws(
    () => createElevenClient({ apiKey: "", projectApproved: true, fetchImpl }),
    /ELEVENLABS_API_KEY/,
  );
  assert.throws(
    () =>
      createElevenClient({ apiKey: key, projectApproved: false, fetchImpl }),
    /approval/,
  );
  assert.equal(requests, 0);
});
test("designs original text-only auditions without uploading recordings or selecting a voice", async () => {
  let request;
  const client = createElevenClient({
    apiKey: key,
    projectApproved: true,
    fetchImpl: async (url, options) => {
      request = { url, options };
      return Response.json({
        text: AUDITION_TEXT,
        previews: [
          {
            generated_voice_id: "preview_1",
            audio_base_64: Buffer.from("test media bytes").toString("base64"),
            media_type: "audio/mpeg",
            duration_secs: 2.3,
          },
        ],
      });
    },
  });
  const result = await client.design();
  assert.equal(result.previews.length, 1);
  assert.equal(result.previews[0].id, "preview_1");
  assert.equal(result.previews[0].duration, 2.3);
  assert.equal(
    request.url,
    "https://api.elevenlabs.io/v1/text-to-voice/design?output_format=mp3_44100_128",
  );
  assert.equal(request.options.headers["xi-api-key"], key);
  const body = JSON.parse(request.options.body);
  assert.equal(body.voice_description, TIGGY_DESCRIPTION);
  assert.equal(body.model_id, "eleven_ttv_v3");
  assert.equal(body.text, AUDITION_TEXT);
  assert.equal("reference_audio_base64" in body, false);
  assert.equal("pitch" in body, false);
});
test("saving or generating speech requires explicit voice approval", async () => {
  let requests = 0;
  const client = createElevenClient({
    apiKey: key,
    projectApproved: true,
    fetchImpl: async () => {
      requests++;
      return Response.json({});
    },
  });
  await assert.rejects(
    client.save({ generatedId: "preview_1", name: "Tiggy" }),
    /approve/,
  );
  await assert.rejects(
    client.speak({ voiceId: "voice_1", text: "Well done!" }),
    /Approve/,
  );
  assert.equal(requests, 0);
});
test("uses the chosen voice at original speed and returns original audio bytes", async () => {
  let request;
  const bytes = Buffer.from("ID3 provider audio fixture");
  const client = createElevenClient({
    apiKey: key,
    projectApproved: true,
    fetchImpl: async (url, options) => {
      request = { url, body: JSON.parse(options.body) };
      return new Response(bytes, {
        headers: { "content-type": "audio/mpeg", "request-id": "request_1" },
      });
    },
  });
  const result = await client.speak({
    voiceId: "chosen_voice",
    text: "You did it!",
    voiceApproved: true,
  });
  assert.equal(
    request.url,
    "https://api.elevenlabs.io/v1/text-to-speech/chosen_voice?output_format=mp3_44100_128",
  );
  assert.equal(request.body.model_id, "eleven_v4");
  assert.equal(request.body.voice_settings.speed, 1);
  assert.equal(request.body.text, "You did it!");
  assert.deepEqual(result.bytes, bytes);
  assert.equal(result.requestId, "request_1");
});
test("provider refusals stop once, redact credentials, and never choose a fallback", async () => {
  let requests = 0;
  const client = createElevenClient({
    apiKey: key,
    projectApproved: true,
    fetchImpl: async () => {
      requests++;
      return Response.json(
        { detail: { message: `Not permitted ${key}` } },
        { status: 403 },
      );
    },
  });
  await assert.rejects(client.design(), (e) => {
    assert.match(e.message, /403/);
    assert.equal(e.message.includes(key), false);
    return true;
  });
  assert.equal(requests, 1);
});
test("does not save empty or non-audio provider responses", async () => {
  const client = createElevenClient({
    apiKey: key,
    projectApproved: true,
    fetchImpl: async () => Response.json({ status: "not audio" }),
  });
  await assert.rejects(
    client.speak({
      voiceId: "chosen_voice",
      text: "Yay!",
      voiceApproved: true,
    }),
    /non-audio/,
  );
});
test("network exceptions never leak a key or trigger an automatic retry", async () => {
  let requests = 0;
  const client = createElevenClient({
    apiKey: key,
    projectApproved: true,
    fetchImpl: async () => {
      requests++;
      throw Error(`Bad header ${key}`);
    },
  });
  await assert.rejects(client.design(), (e) => {
    assert.equal(e.message.includes(key), false);
    assert.match(e.message, /No automatic retry/);
    return true;
  });
  assert.equal(requests, 1);
});
test("private output guard rejects repository paths and symlink aliases", async () => {
  const { mkdtemp, mkdir, symlink, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const path = await import("node:path");
  const { privateOutputFolder } = await import("./elevenlabs-client.mjs");
  const root = await mkdtemp(path.join(tmpdir(), "tiggy-private-output-"));
  try {
    const repo = path.join(root, "repo");
    await mkdir(path.join(repo, "public"), { recursive: true });
    await symlink(path.join(repo, "public"), path.join(root, "outside-alias"));
    await assert.rejects(
      privateOutputFolder(path.join(repo, "public", "candidate"), repo),
      /outside/,
    );
    await assert.rejects(
      privateOutputFolder(path.join(root, "outside-alias", "candidate"), repo),
      /outside/,
    );
    assert.match(
      await privateOutputFolder(path.join(root, "private-review"), repo),
      /private-review$/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
