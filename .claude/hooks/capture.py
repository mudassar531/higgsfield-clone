#!/usr/bin/env python3
# Captures verbatim prompt/response pairs per turn into .agent-logs/, driven by
# Claude Code hooks (UserPromptSubmit + Stop, with SessionStart/PostModelSwitch
# only used to keep the recorded model name current across /model switches).
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Model active when this hook was installed. SessionStart/PostModelSwitch correct
# it from here on; this is only the bootstrap value for the very first turn.
FALLBACK_MODEL = "claude-sonnet-5"
AUTHOR = "mudassar531"
TOOL = "claude-code"

PROJECT_DIR = Path(os.environ.get("CLAUDE_PROJECT_DIR") or Path(__file__).resolve().parents[2])
LOGS_DIR = PROJECT_DIR / ".agent-logs"
STATE_DIR = PROJECT_DIR / ".claude" / ".capture-state"


def now_iso():
    dt = datetime.now(timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"


def state_path(session_id):
    return STATE_DIR / f"{session_id}.json"


def body_path(session_id):
    return STATE_DIR / f"{session_id}.body.md"


def load_state(session_id):
    p = state_path(session_id)
    if p.exists():
        return json.loads(p.read_text())
    return None


def save_state(session_id, state):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    state_path(session_id).write_text(json.dumps(state, indent=2))


def append_body(session_id, text):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    with body_path(session_id).open("a") as f:
        f.write(text)


def read_body(session_id):
    p = body_path(session_id)
    return p.read_text() if p.exists() else ""


def init_state(session_id, model):
    dt = datetime.now(timezone.utc)
    short_id = session_id.split("-")[0]
    log_filename = f"{dt.strftime('%Y-%m-%d_%H-%M-%S')}_{session_id}.md"
    return {
        "session_id": session_id,
        "short_id": short_id,
        "date": dt.strftime("%Y-%m-%d"),
        "log_file": log_filename,
        "model": model,
        "prompt_count": 0,
        "first_prompt_time": None,
        "last_prompt_time": None,
    }


def render(state):
    header = (
        "---\n"
        f"session_id: {state['session_id']}\n"
        f"date: {state['date']}\n"
        f"author: {AUTHOR}\n"
        f"model: {state['model']}\n"
        f"tool: {TOOL}\n"
        f"project: {PROJECT_DIR.name}\n"
        f"total_exchanges: {state['prompt_count']}\n"
        f"first_prompt_time: {state['first_prompt_time']}\n"
        f"last_prompt_time: {state['last_prompt_time']}\n"
        "---\n\n"
        f"# Session Log - {state['date']}\n\n"
        f"Session: `{state['short_id']}` | Project: `{PROJECT_DIR.name}` | Author: `{AUTHOR}`\n\n"
        "---\n\n"
    )
    return header + read_body(state["session_id"])


def write_log(state):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    (LOGS_DIR / state["log_file"]).write_text(render(state))


def recover_prompt_from_transcript(path):
    # Fallback for the bootstrap edge case: Stop fires before any UserPromptSubmit
    # was ever captured for this session (e.g. the hook was installed mid-turn).
    if not path:
        return "[unable to recover prompt: no transcript_path provided]"
    p = Path(path)
    if not p.exists():
        return "[unable to recover prompt: transcript not found]"
    try:
        lines = p.read_text().splitlines()
    except OSError:
        return "[unable to recover prompt: transcript unreadable]"
    for line in reversed(lines):
        if not line.strip():
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if obj.get("type") == "user":
            content = obj.get("message", {}).get("content")
            if isinstance(content, str):
                return content
            if isinstance(content, list):
                parts = [c.get("text", "") for c in content if isinstance(c, dict) and c.get("type") == "text"]
                if parts:
                    return "\n".join(parts)
    return "[unable to recover prompt: no user message found in transcript]"


def make_entry(kind, num, short_id, ts, model, text):
    return (
        f"[LOG_ENTRY type={kind} num={num} session={short_id}]\n"
        f"timestamp: {ts}\n"
        f"model: {model}\n\n"
        f"{text}\n\n\n"
    )


def main():
    raw = sys.stdin.read()
    try:
        data = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        return
    event = data.get("hook_event_name", "")
    session_id = data.get("session_id")
    if not session_id:
        return

    state = load_state(session_id)

    if event == "SessionStart":
        if state is None:
            state = init_state(session_id, data.get("model") or FALLBACK_MODEL)
            save_state(session_id, state)
        elif data.get("model"):
            state["model"] = data["model"]
            save_state(session_id, state)
        return

    if event == "PostModelSwitch":
        to_model = data.get("to_model")
        if not to_model:
            return
        if state is None:
            state = init_state(session_id, to_model)
        else:
            state["model"] = to_model
        save_state(session_id, state)
        return

    if event == "UserPromptSubmit":
        if state is None:
            state = init_state(session_id, FALLBACK_MODEL)
        state["prompt_count"] += 1
        ts = now_iso()
        if state["first_prompt_time"] is None:
            state["first_prompt_time"] = ts
        state["last_prompt_time"] = ts
        append_body(session_id, make_entry(
            "PROMPT", state["prompt_count"], state["short_id"], ts, state["model"],
            data.get("prompt", ""),
        ))
        save_state(session_id, state)
        write_log(state)
        return

    if event == "Stop":
        last_msg = data.get("last_assistant_message") or {}
        text = last_msg.get("text", "") if isinstance(last_msg, dict) else ""
        if not text:
            return
        if state is None:
            state = init_state(session_id, FALLBACK_MODEL)
            state["prompt_count"] += 1
            ts = now_iso()
            state["first_prompt_time"] = ts
            state["last_prompt_time"] = ts
            append_body(session_id, make_entry(
                "PROMPT", state["prompt_count"], state["short_id"], ts, state["model"],
                recover_prompt_from_transcript(data.get("transcript_path")),
            ))
        append_body(session_id, make_entry(
            "RESPONSE", state["prompt_count"], state["short_id"], now_iso(), state["model"], text,
        ))
        save_state(session_id, state)
        write_log(state)
        return


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"capture.py error: {e}", file=sys.stderr)
    sys.exit(0)
