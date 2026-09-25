#!/usr/bin/env python3
"""Automatically export only human prompts and final Codex answers for this repo.

The local Codex rollout is the source of truth. Entries are immutable: existing
body bytes must be an exact prefix of the new body. Only frontmatter counters
are refreshed. No tool, reasoning, commentary, or encrypted payload is exported.
"""
import argparse
import fcntl
import json
import os
from pathlib import Path
import sys
import time

ROOT = Path(__file__).resolve().parents[2]
CONFIG = json.loads((ROOT / ".codex/capture.json").read_text())


def text_content(payload):
    return "".join(part.get("text", "") for part in payload.get("content", [])
                   if part.get("type") in ("input_text", "output_text", "text"))


def collect(path):
    records = []
    with path.open(encoding="utf-8") as source:
        for line in source:
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                # Codex can be in the middle of writing the final line.
                break
    if not records or records[0].get("type") != "session_meta":
        return None
    meta = records[0]["payload"]
    cwd = Path(meta.get("cwd", "/")).resolve()
    if cwd != ROOT and ROOT not in cwd.parents:
        return None
    if isinstance(meta.get("source"), dict) and "subagent" in meta["source"]:
        return None  # Internal delegation is not a human prompt/response exchange.

    model, turn_id, number = "unknown", None, 0
    turns, entries, prompts_seen, answers_seen = {}, [], set(), set()
    for record in records:
        payload = record.get("payload", {})
        kind = record.get("type")
        if kind == "turn_context":
            model = payload.get("model", model)
            turn_id = payload.get("turn_id", turn_id)
        elif kind == "response_item" and payload.get("type") == "message" and payload.get("role") == "user":
            details = payload.get("internal_chat_message_metadata_passthrough", {})
            kinds = details.get("content_item_kinds", [])
            if kinds and not any(k.startswith("user.") for k in kinds):
                continue
            text = text_content(payload)
            if not kinds and (text.startswith("# AGENTS.md instructions") or text.startswith("<environment_context>")):
                continue
            identity = payload.get("id", str(record.get("ordinal", len(entries))))
            if identity in prompts_seen:
                continue
            prompts_seen.add(identity)
            number += 1
            current_turn = details.get("turn_id", turn_id)
            turns[current_turn] = number
            entries.append(("PROMPT", number, record["timestamp"], model, text))
        elif kind == "event_msg" and payload.get("type") == "task_complete":
            completed_turn = payload.get("turn_id", turn_id)
            text = payload.get("last_agent_message")
            if completed_turn in answers_seen or completed_turn not in turns or not isinstance(text, str):
                continue
            answers_seen.add(completed_turn)
            entries.append(("RESPONSE", turns[completed_turn], record["timestamp"], model, text))
    return (meta, entries) if entries else None


def render(meta, entries):
    session = meta["id"]
    short = session[:8]
    prompts = [entry for entry in entries if entry[0] == "PROMPT"]
    first, last = prompts[0][2], prompts[-1][2]
    date = first[:10]
    head = (f"---\nsession_id: {session}\ndate: {date}\n"
            f"author: {CONFIG['author']}\nmodel: {prompts[0][3]}\ntool: codex-cli\n"
            f"project: {CONFIG['project']}\ntotal_exchanges: {len(prompts)}\n"
            f"first_prompt_time: {first}\nlast_prompt_time: {last}\n---\n")
    body = (f"\n# Session Log - {date}\n\nSession: `{short}` | Project: `{CONFIG['project']}`"
            f" | Author: `{CONFIG['author']}`\n\n---\n")
    for kind, number, timestamp, model, text in entries:
        body += (f"\n[LOG_ENTRY type={kind} num={number} session={short}]\n"
                 f"timestamp: {timestamp}\nmodel: {model}\n\n{text}\n\n")
    filename = f"{date}_{first[11:19].replace(':', '-')}_{session}.md"
    return filename, head, body


def export_session(path):
    result = collect(path)
    if not result:
        return
    filename, head, body = render(*result)
    destination = ROOT / ".agent-logs" / filename
    destination.parent.mkdir(exist_ok=True)
    if destination.exists():
        existing = destination.read_text(encoding="utf-8")
        old_body = existing.split("\n---\n", 1)[1]
        if not body.startswith(old_body):
            raise RuntimeError(f"Refusing to alter existing capture entries: {filename}")
        if existing == head + body:
            return
    temporary = destination.with_suffix(".tmp")
    temporary.write_text(head + body, encoding="utf-8")
    os.replace(temporary, destination)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--watch", action="store_true")
    args = parser.parse_args()
    runtime = ROOT / ".git" / "agent-capture"
    runtime.mkdir(parents=True, exist_ok=True)
    with (runtime / "capture.lock").open("w") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return
        known = {}
        while True:
            for path in sorted(Path(CONFIG["session_directory"]).expanduser().rglob("*.jsonl")):
                signature = (path.stat().st_size, path.stat().st_mtime_ns)
                if known.get(path) == signature:
                    continue
                try:
                    export_session(path)
                    known[path] = signature
                except (OSError, ValueError, KeyError, RuntimeError) as error:
                    print(f"Capture error: {error}", file=sys.stderr, flush=True)
            if not args.watch:
                break
            time.sleep(CONFIG["poll_seconds"])


if __name__ == "__main__":
    main()
