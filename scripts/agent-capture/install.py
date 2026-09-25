#!/usr/bin/env python3
"""Install a persistent macOS user agent; no per-session invocation needed."""
import json
import os
from pathlib import Path
import plistlib
import subprocess
import sys

root = Path(__file__).resolve().parents[2]
config = json.loads((root / ".codex/capture.json").read_text())
label = config["launchd_label"]
runtime = root / ".git" / "agent-capture"
runtime.mkdir(parents=True, exist_ok=True)
plist = Path.home() / "Library" / "LaunchAgents" / f"{label}.plist"
plist.parent.mkdir(parents=True, exist_ok=True)
definition = {
    "Label": label,
    "ProgramArguments": [sys.executable, str(root / "scripts/agent-capture/capture.py"), "--watch"],
    "WorkingDirectory": str(root),
    "RunAtLoad": True,
    "KeepAlive": True,
    "ThrottleInterval": 5,
    "StandardOutPath": str(runtime / "stdout.log"),
    "StandardErrorPath": str(runtime / "stderr.log"),
}
with plist.open("wb") as target:
    plistlib.dump(definition, target)
domain = f"gui/{os.getuid()}"
subprocess.run(["launchctl", "bootout", f"{domain}/{label}"], capture_output=True)
subprocess.run(["launchctl", "bootstrap", domain, str(plist)], check=True)
subprocess.run(["launchctl", "kickstart", f"{domain}/{label}"], check=True)
print(f"Automatic capture installed: {plist}")
