"""SND Engine Adapter — subprocess bridge to the SND legal search engine."""

import os
import subprocess
from typing import Dict, Any, List

import config


def get_available_scripts() -> List[Dict[str, Any]]:
    """Return candidate scripts with existence info."""
    scripts = []
    for name in config.CANDIDATE_SCRIPTS:
        path = os.path.join(config.ENGINE_CODE_DIR, name)
        scripts.append({
            "name": name,
            "path": path,
            "exists": os.path.isfile(path),
        })
    return scripts


def select_script() -> str:
    """Select the first existing engine script."""
    for name in config.CANDIDATE_SCRIPTS:
        path = os.path.join(config.ENGINE_CODE_DIR, name)
        if os.path.isfile(path):
            return path
    return ""


def ask_engine(question: str) -> Dict[str, Any]:
    """Run the SND engine subprocess and return raw output."""

    # Validate question
    if not question or not question.strip():
        return {
            "ok": False,
            "confidence": "RED",
            "answer_text": "Question is empty.",
            "engine_debug": {
                "script": "",
                "command": [],
                "returncode": -1,
                "stderr": "Empty question received.",
            },
        }

    # Select engine script
    selected_script = select_script()
    available_scripts = get_available_scripts()

    if not selected_script:
        return {
            "ok": False,
            "confidence": "RED",
            "answer_text": (
                "SND engine script not found. "
                f"Check {config.ENGINE_CODE_DIR}."
            ),
            "engine_debug": {
                "candidate_scripts": available_scripts,
            },
        }

    # Build command
    cmd = [
        config.ENGINE_PYTHON,
        selected_script,
        question,
        "--top-k",
        "8",
    ]

    # Prepare environment
    env = {**os.environ, "PYTHONIOENCODING": "utf-8"}

    try:
        result = subprocess.run(
            cmd,
            cwd=config.ENGINE_ROOT,
            timeout=180,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
        )

        # Always capture debug info
        engine_debug = {
            "script": selected_script,
            "command": cmd,
            "returncode": result.returncode,
            "stderr": result.stderr if result.stderr else "",
        }

        if result.returncode == 0:
            # Success — return raw stdout, do NOT parse
            return {
                "ok": True,
                "confidence": "UNKNOWN",
                "answer_text": result.stdout if result.stdout else "(Engine returned no output)",
                "engine_debug": engine_debug,
            }
        else:
            # Subprocess failed
            return {
                "ok": False,
                "confidence": "RED",
                "answer_text": "SND engine error. See engine_debug.stderr.",
                "engine_debug": {
                    **engine_debug,
                    "stdout": result.stdout if result.stdout else "",
                },
            }

    except subprocess.TimeoutExpired:
        return {
            "ok": False,
            "confidence": "RED",
            "answer_text": "SND engine timed out after 180 seconds.",
            "engine_debug": {
                "script": selected_script,
                "command": cmd,
                "returncode": -1,
                "stderr": "Timeout: Engine process exceeded 180 seconds.",
            },
        }

    except Exception as e:
        return {
            "ok": False,
            "confidence": "RED",
            "answer_text": f"SND engine exception: {str(e)}",
            "engine_debug": {
                "script": selected_script,
                "command": cmd,
                "returncode": -1,
                "stderr": str(e),
            },
        }
