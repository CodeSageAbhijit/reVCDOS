import subprocess, sys

subprocess.run([sys.executable, "server.py", "--port", "7860"], check=True)
