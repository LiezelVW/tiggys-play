"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, Square, Save, Trash2, Download, Volume2 } from "lucide-react";
import { activeCandidate } from "../game/voiceCandidates";
import { stopAudio } from "../game/audio";
import { voicePrompts } from "../game/voicePrompts";
import {
  saveVoice,
  deleteVoice,
  voiceBlob,
  exportVoicePack,
  restoreVoicePack,
} from "../game/recordings";
import {
  useRecordedVoiceAvailable,
  useVoiceCount,
  useVoiceRevision,
} from "./useVoice";
export default function VoiceRecorder() {
  const [id, setId] = useState<string>(voicePrompts[0][0]),
    [recording, setRecording] = useState(false),
    [requesting, setRequesting] = useState(false),
    [preview, setPreview] = useState<Blob | null>(null),
    [url, setUrl] = useState(""),
    [message, setMessage] = useState(""),
    [elapsed, setElapsed] = useState(0),
    [saving, setSaving] = useState(false);
  const version = useVoiceRevision();
  const available = useRecordedVoiceAvailable(id),
    count = useVoiceCount();
  const media = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null),
    audio = useRef<HTMLAudioElement>(null),
    timer = useRef<ReturnType<typeof setInterval> | null>(null),
    alive = useRef(true);
  function release() {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }
  function stop() {
    if (media.current?.state === "recording") media.current.stop();
    release();
    if (alive.current) setRecording(false);
  }
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stop();
      audio.current?.pause();
    };
  }, []);
  useEffect(() => {
    const blob = preview || (available ? voiceBlob(id) : undefined);
    if (!blob) {
      setUrl("");
      return;
    }
    const value = URL.createObjectURL(blob);
    setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [preview, id, available, version]);
  useEffect(() => {
    const player = audio.current;
    return () => player?.pause();
  }, [url]);
  async function record() {
    stopAudio();
    audio.current?.pause();
    setMessage("");
    setPreview(null);
    setRequesting(true);
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      )
        throw Error(
          "Recording needs a secure browser page with microphone support. You can import an audio recording instead.",
        );
      const input = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      if (!alive.current) {
        input.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = input;
      const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(
        (type) => MediaRecorder.isTypeSupported(type),
      );
      const recorder = new MediaRecorder(
        input,
        mime ? { mimeType: mime } : undefined,
      );
      media.current = recorder;
      const parts: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) parts.push(e.data);
      };
      recorder.onstop = () => {
        release();
        if (alive.current) {
          setRecording(false);
          const captured = new Blob(parts, {
            type: recorder.mimeType || mime || "audio/webm",
          });
          if (!captured.size) {
            setPreview(null);
            setMessage("No audio was captured. Please try again.");
            return;
          }
          setPreview(captured);
          setMessage(
            "Listen to your recording, then choose Use this recording.",
          );
        }
      };
      recorder.onerror = () => {
        stop();
        if (alive.current)
          setMessage("The recording stopped unexpectedly. Please try again.");
      };
      setElapsed(0);
      setRecording(true);
      let seconds = 0;
      timer.current = setInterval(() => {
        seconds++;
        if (alive.current) setElapsed(seconds);
        if (seconds >= 15) stop();
      }, 1000);
      recorder.start();
    } catch (error) {
      release();
      if (alive.current) setRecording(false);
      if (alive.current)
        setMessage(
          error instanceof DOMException && error.name === "NotAllowedError"
            ? "Microphone permission was not allowed. Enable it in your browser, or import a recording."
            : error instanceof Error
              ? error.message
              : "The microphone could not open.",
        );
    } finally {
      if (alive.current) setRequesting(false);
    }
  }
  async function save() {
    if (!preview) return;
    setSaving(true);
    try {
      await saveVoice(id, preview);
      setPreview(null);
      setMessage(
        activeCandidate()
          ? "Personal recording saved. Your approved character pack stays selected; restore the previous voice in the studio to use personal recordings."
          : "Saved on this device. Tiggy will use this recording for this line.",
      );
    } catch {
      setMessage(
        "This browser could not save the recording. Check available storage and try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function remove(all = false) {
    audio.current?.pause();
    try {
      await deleteVoice(all ? undefined : id);
      setPreview(null);
      setMessage(
        all
          ? "All voice recordings deleted from this device."
          : "This recording has been deleted.",
      );
    } catch {
      setMessage("The recording could not be deleted. Please try again.");
    }
  }
  async function download() {
    try {
      const blob = await exportVoicePack(),
        link = document.createElement("a"),
        objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = "tiggys-parent-voice-pack.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setMessage("The voice pack could not be exported.");
    }
  }
  return (
    <section className="voice-recorder" aria-labelledby="voice-title">
      <h3 id="voice-title">Record Tiggy’s voice</h3>
      <p>
        Use your own gentle adult voice. Recordings stay on this device; nothing
        is uploaded. Preview each line before saving it.
      </p>
      <span className="voice-count">
        {count} of {voicePrompts.length} lines saved
      </span>
      <label>
        Line to record
        <select
          value={id}
          disabled={recording || requesting || saving}
          onChange={(e) => {
            audio.current?.pause();
            setId(e.target.value);
            setPreview(null);
            setMessage("");
          }}
        >
          {voicePrompts.map(([key, text], i) => (
            <option key={key} value={key}>
              {i + 1}. {text}
            </option>
          ))}
        </select>
      </label>
      <blockquote>{voicePrompts.find((p) => p[0] === id)?.[1]}</blockquote>
      <div className="voice-actions">
        {recording ? (
          <button className="primary recording-stop" onClick={stop}>
            <Square /> Stop recording · {elapsed}s
          </button>
        ) : (
          <button
            className="primary"
            onClick={record}
            disabled={requesting || saving}
          >
            <Mic /> {requesting ? "Opening microphone…" : "Record this line"}
          </button>
        )}
        {preview && (
          <button
            className="pill"
            onClick={save}
            disabled={recording || saving}
          >
            <Save /> {saving ? "Saving…" : "Use this recording"}
          </button>
        )}
      </div>
      {url && (
        <label className="voice-playback">
          <Volume2 size={18} /> Listen before saving
          <audio
            controls
            ref={audio}
            src={url}
            preload="metadata"
            aria-label="Voice recording playback"
          />
        </label>
      )}
      <label className="voice-import">
        Or import an audio recording
        <input
          type="file"
          accept="audio/*"
          disabled={recording || requesting || saving}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (!file.type.startsWith("audio/") || file.size > 8_000_000) {
                setMessage("Choose an audio file under 8 MB.");
                return;
              }
              setPreview(file);
              setMessage("Preview this audio before saving.");
            }
            e.target.value = "";
          }}
        />
      </label>
      <div className="voice-actions">
        {available && (
          <button
            className="pill"
            disabled={recording || saving}
            onClick={() => remove()}
          >
            <Trash2 size={17} /> Delete this line
          </button>
        )}
        <button
          className="pill"
          disabled={count === 0 || recording || saving}
          onClick={download}
        >
          <Download size={17} /> Export voice pack
        </button>
      </div>
      <label className="voice-import">
        Restore an exported voice pack
        <input
          type="file"
          accept="application/json,.json"
          disabled={recording || requesting || saving}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setSaving(true);
            try {
              await restoreVoicePack(file);
              setPreview(null);
              setMessage("Voice pack restored on this device.");
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "This voice pack could not be restored.",
              );
            } finally {
              if (alive.current) setSaving(false);
            }
          }}
        />
      </label>
      {count > 0 && (
        <button
          className="text-button"
          disabled={recording || saving}
          onClick={() => remove(true)}
        >
          Delete all voice recordings
        </button>
      )}
      <p role="status" className="voice-status">
        {message}
      </p>
    </section>
  );
}
