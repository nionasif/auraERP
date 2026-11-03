#!/usr/bin/env python3
"""
AuraTech ERP - Full-Stack Orchestration Runner
Starts both the Frontend (Vite) and Backend (Express) servers simultaneously
with graceful shutdown on Ctrl+C.
"""

import os
import sys
import time
import subprocess
import threading
import webbrowser

# Resolve project paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
ML_DIR = os.path.join(BASE_DIR, "ml")
FASTAPI_DIR = os.path.join(BASE_DIR, "fastapi_backend")

# Auto-detect project virtual environment
venv_python = os.path.join(BASE_DIR, ".venv", "Scripts", "python.exe")
if os.path.exists(venv_python):
    PYTHON_EXE = venv_python
else:
    PYTHON_EXE = sys.executable

# Track child processes
processes = []


def stream_output(process, prefix, color_code):
    """Streams and prefixes output from a subprocess."""
    reset_code = "\033[0m"
    try:
        while True:
            line = process.stdout.readline()
            if not line:
                if process.poll() is not None:
                    break
                time.sleep(0.02)
                continue
            text = line.strip()
            if text:
                print(f"{color_code}{prefix}{reset_code} {text}", flush=True)
    except Exception:
        pass


def is_npm_installed():
    """Verify that npm is available in PATH."""
    try:
        subprocess.run(
            ["npm", "--version"],
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        return True
    except Exception:
        return False


def start_server(cmd, cwd, prefix, color_code):
    """Starts a server process and streams its output in a background thread."""
    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1
    )
    processes.append(proc)

    thread = threading.Thread(
        target=stream_output,
        args=(proc, prefix, color_code),
        daemon=True
    )
    thread.start()
    return proc


def cleanup():
    """Gracefully terminates all spawned child processes."""
    print("\n\033[33m[SHUTDOWN] Stopping all AuraTech ERP servers...\033[0m")
    for proc in processes:
        if proc.poll() is None:
            if sys.platform == "win32":
                # Kill entire process tree on Windows
                subprocess.run(
                    ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    shell=True
                )
            else:
                proc.terminate()
    print("\033[32m[SHUTDOWN] All servers stopped cleanly. Goodbye!\033[0m")


def main():
    # Enable ANSI color support on Windows
    if sys.platform == "win32":
        os.system("")

    print("\033[36m" + "=" * 65 + "\033[0m")
    print("\033[1;33m  🏢 AuraTech ERP - Enterprise IT Full-Stack Runner\033[0m")
    print("\033[36m" + "=" * 65 + "\033[0m")

    # Verify npm
    if not is_npm_installed():
        print("\033[31m[ERROR] Node.js / npm is not installed or not in PATH!\033[0m")
        sys.exit(1)

    # Verify directories
    if not os.path.exists(FRONTEND_DIR) or not os.path.exists(BACKEND_DIR):
        print("\033[31m[ERROR] Frontend or Backend directory not found in:\033[0m", BASE_DIR)
        sys.exit(1)

    # 1. Start Python ML Intelligence Core (port 8000)
    if os.path.exists(ML_DIR):
        print("\033[36m[1/4] Starting Python ML Intelligence Core (:8000)...\033[0m")
        start_server(f'"{PYTHON_EXE}" server.py', ML_DIR, "[ML-CORE]", "\033[36m")
        time.sleep(1.0)

    # 2. Start Python FastAPI HR & Auth Backend (port 8001)
    if os.path.exists(FASTAPI_DIR):
        print("\033[34m[2/4] Starting Python FastAPI HR & Auth Backend (:8001)...\033[0m")
        start_server(f'"{PYTHON_EXE}" main.py', FASTAPI_DIR, "[FASTAPI-HR]", "\033[34m")
        time.sleep(1.0)

    # 3. Start Backend (Express on port 5000)
    print("\033[35m[3/4] Starting Backend Server (Express on :5000)...\033[0m")
    start_server("npm start", BACKEND_DIR, "[BACKEND]", "\033[35m")

    # Give backend a moment to bind port
    time.sleep(1.5)

    # 4. Start Frontend (Vite on port 5173)
    print("\033[32m[4/4] Starting Frontend Web Client (Vite on :5173)...\033[0m")
    start_server("npm run dev", FRONTEND_DIR, "[FRONTEND]", "\033[32m")

    print("\033[36m" + "-" * 65 + "\033[0m")
    print("  \033[1;32m➜ Frontend Client:\033[0m   http://localhost:5173/")
    print("  \033[1;34m➜ FastAPI HR Core:\033[0m   http://localhost:8001/api")
    print("  \033[1;35m➜ Node Backend:\033[0m      http://localhost:5000/api")
    print("  \033[1;36m➜ Python ML Core:\033[0m    http://localhost:8000/")
    print("  \033[1;33m➜ Controls:\033[0m          Press \033[1mCtrl+C\033[0m to stop all servers")
    print("\033[36m" + "-" * 65 + "\033[0m")

    # Automatically open browser after 2.5 seconds
    def open_browser():
        time.sleep(2.5)
        webbrowser.open("http://localhost:5173/")

    threading.Thread(target=open_browser, daemon=True).start()

    # Keep script alive and catch keyboard interrupt
    try:
        while True:
            time.sleep(0.5)
            # Exit if both processes died unexpectedly
            if all(p.poll() is not None for p in processes):
                print("\033[31m[ERROR] All server processes exited unexpectedly.\033[0m")
                break
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()


if __name__ == "__main__":
    main()
