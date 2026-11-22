"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useVoiceCount } from "./useVoice";
import { Play, RotateCcw, Check, Trash2 } from "lucide-react";
import {
  activeCandidate,
  allCandidates,
  approveCandidate,
  candidateRevision,
  candidateUrl,
  deleteCandidate,
  importCandidate,
  importDialogueFiles,
  restoreOriginalVoice,
  subscribeCandidates,
  type Character,
} from "../game/voiceCandidates";
import {
  voiceGroups,
  voicePrompts,
  requiredVoiceIds,
} from "../game/voicePrompts";
import { playVoiceSource, preloadVoice, stopAudio } from "../game/audio";
export default function VoicePreview({ muted }: { muted: boolean }) {
  useSyncExternalStore(subscribeCandidates, candidateRevision, () => 0);
  const originalClipCount = useVoiceCount();
  const [selected, setSelected] = useState(""),
    [name, setName] = useState(""),
    [character, setCharacter] = useState<Character>("tiggy"),
    [line, setLine] = useState("tiggy-hello"),
    [message, setMessage] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [busy, setBusy] = useState(false);
  const packs = allCandidates(),
    candidate = packs.find((c) => c.id === selected),
    approved = activeCandidate(character),
    source = candidate ? candidateUrl(candidate.id, line) : undefined;
  useEffect(() => () => stopAudio(), []);
  function choose(id: string) {
    stopAudio();
    setSelected(id);
    setConfirmed(false);
    const c = packs.find((c) => c.id === id);
    if (c) {
      setName(c.name);
      setCharacter(c.character);
    } else setName("");
    setMessage("");
  }
  async function importing(task: () => Promise<string>) {
    setBusy(true);
    stopAudio();
    try {
      const id = await task();
      setSelected(id);
      if (!candidateUrl(id, line)) {
        const first = allCandidates().find((c) => c.id === id)?.clips[0];
        if (first) setLine(first.id);
      }
      setConfirmed(false);
      setMessage(
        "Imported for audition only. Your gameplay voice has not changed.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Import failed. Try a smaller local file.",
      );
    } finally {
      setBusy(false);
    }
  }
  function preview() {
    if (!source) return;
    playVoiceSource(source, () =>
      setMessage(
        "This audio could not play. Try the WAV or MP3 version, then tap Play again.",
      ),
    );
    setMessage(
      "Listen for clear pronunciation, a natural youthful character and gentle delivery. No pitch or speed effects are applied.",
    );
  }
  return (
    <section className="voice-preview" aria-labelledby="preview-title">
      <h3 id="preview-title">Tiggy’s voice studio</h3>
      <p>
        Audition first. Importing or listening never replaces your current
        voice. Approve the available clips only when you are happy with the
        voice. Missing dialogue stays visual.
      </p>
      <p className="voice-note">
        No childlike generated candidate is bundled yet. Add original
        prerecorded MP3 or WAV dialogue below. Missing lines use speech bubbles
        and optional chimes.
      </p>
      <label>
        Character
        <select
          aria-label="Character"
          value={character}
          disabled={busy}
          onChange={(e) => {
            stopAudio();
            setCharacter(e.target.value as Character);
            setSelected("");
            setName("");
            setConfirmed(false);
          }}
        >
          <option value="tiggy">Tiggy</option>
          <option value="benny">Benny Bear</option>
        </select>
      </label>
      <p>
        Active voice:{" "}
        <strong>
          {packs.find((c) => c.id === approved)?.name ||
            (character === "tiggy" && originalClipCount > 0
              ? "Existing on-device recordings"
              : "Speech bubbles only")}
        </strong>
      </p>
      <label>
        Candidate to audition
        <select
          aria-label="Candidate to audition"
          value={selected}
          disabled={busy}
          onChange={(e) => choose(e.target.value)}
        >
          <option value="">New candidate</option>
          {packs
            .filter((c) => c.character === character)
            .map((c) => (
              <option value={c.id} key={c.id}>
                {c.name} · {c.clips.length}/{voicePrompts.length} lines
              </option>
            ))}
        </select>
      </label>
      <label>
        Candidate name
        <input
          maxLength={80}
          value={name}
          disabled={busy || !!candidate}
          placeholder="For example: Tiggy, warm and playful"
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="voice-import">
        Add MP3 or WAV dialogue
        <input
          type="file"
          multiple
          accept=".mp3,.wav,audio/mpeg,audio/wav"
          disabled={busy || (approved === selected && !!selected)}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            if (files.length)
              void importing(() =>
                importDialogueFiles(
                  selected || undefined,
                  name,
                  character,
                  files,
                ),
              );
          }}
        />
      </label>
      <p className="small-print">
        Name files after the phrase IDs below, for example{" "}
        <code>well-done.mp3</code>. Import several together or add more to the
        same candidate later. Use the same character voice for every line.
      </p>
      <label className="voice-import">
        Or import a character candidate pack
        <input
          type="file"
          accept=".json,application/json"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file)
              void importing(async () => {
                const id = await importCandidate(file);
                const c = allCandidates().find((c) => c.id === id)!;
                setCharacter(c.character);
                setName(c.name);
                return id;
              });
          }}
        />
      </label>
      <label>
        Preview phrase
        <select
          aria-label="Preview phrase"
          value={line}
          onChange={(e) => {
            stopAudio();
            setLine(e.target.value);
          }}
        >
          {voiceGroups.map((g) => (
            <optgroup key={g.name} label={g.name}>
              {voicePrompts
                .filter((p) => g.ids.includes(p[0]))
                .map(([id, text]) => (
                  <option value={id} key={id}>
                    {text}
                    {candidateUrl(selected, id) ? " · ready" : " · missing"}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <blockquote className="speech-bubble">
        {voicePrompts.find((p) => p[0] === line)?.[1]}
      </blockquote>
      <div className="voice-actions">
        <button
          className="primary"
          disabled={!source || muted || busy}
          onClick={preview}
        >
          <Play size={18} />
          Play candidate
        </button>
        <button
          className="pill"
          disabled={!source || muted || busy}
          onClick={preview}
        >
          <RotateCcw size={18} />
          Repeat audio
        </button>
        <button className="pill" onClick={stopAudio}>
          Stop audio
        </button>
      </div>
      {muted && <p>Sound is muted. Turn it on above to listen.</p>}
      {candidate && (
        <>
          <p>
            {candidate.clips.length} clips imported ·{" "}
            {requiredVoiceIds(candidate.character).length} required lines ·{" "}
            {candidate.provider}
          </p>
          <p className="voice-note">
            {
              requiredVoiceIds(candidate.character).filter(
                (id) => !candidate.clips.some((c) => c.id === id),
              ).length
            }{" "}
            required lines missing. Those lines stay as speech bubbles; another
            speaker’s recordings will not be substituted.
          </p>
          <button
            type="button"
            role="checkbox"
            aria-checked={confirmed}
            className="voice-approval"
            disabled={busy}
            onClick={() => setConfirmed((v) => !v)}
          >
            <span className="approval-mark" aria-hidden="true">
              {confirmed && <Check size={20} />}
            </span>
            <span>
              I have listened and approve these available clips in one
              consistent character voice. Missing lines will use visual prompts.
            </span>
          </button>
          <button
            className="primary"
            disabled={!confirmed || busy || approved === selected}
            onClick={() => {
              try {
                stopAudio();
                approveCandidate(selected);
                preloadVoice();
                setMessage(
                  "Approved on this device. All games now use this character’s pack. Previous recordings are preserved.",
                );
              } catch (e) {
                setMessage(
                  e instanceof Error
                    ? e.message
                    : "Approval could not be saved.",
                );
              }
            }}
          >
            <Check size={18} />
            Approve this voice for games
          </button>
          <button
            className="text-button"
            disabled={busy || approved === selected}
            onClick={async () => {
              setBusy(true);
              stopAudio();
              try {
                await deleteCandidate(selected);
                choose("");
                setMessage("Candidate deleted.");
              } catch (e) {
                setMessage(e instanceof Error ? e.message : "Delete failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Trash2 size={16} />
            Delete candidate
          </button>
        </>
      )}
      {approved && (
        <button
          className="pill"
          onClick={() => {
            try {
              stopAudio();
              restoreOriginalVoice(character);
              preloadVoice();
              setMessage(
                "Previous voice restored. Candidate remains available for preview.",
              );
            } catch {
              setMessage("This browser could not save the change.");
            }
          }}
        >
          Restore previous voice
        </button>
      )}
      <details>
        <summary>Phrase library and missing assets</summary>
        {voiceGroups.map((g) => (
          <div key={g.name}>
            <h4>{g.name}</h4>
            <ul>
              {voicePrompts
                .filter((p) => g.ids.includes(p[0]))
                .map(([id, text]) => (
                  <li key={id}>
                    <strong>{text}</strong> <code>{id}.mp3 / .wav</code> ·{" "}
                    {candidateUrl(selected, id) ? "ready" : "missing"}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </details>
      <p role="status" className="voice-status">
        {busy ? "Saving local audio…" : message}
      </p>
    </section>
  );
}
