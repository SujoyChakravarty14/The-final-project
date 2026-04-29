import os
import shutil
import stat

src_triage = r"C:\Users\SUJOY\OneDrive\Desktop\triage-agent"
dst_triage = r"C:\Users\SUJOY\OneDrive\Desktop\The Final project\triage-agent"

def ignore_files(dir, files):
    return [f for f in files if f in ["node_modules", ".venv", ".venv-1", "venv", "__pycache__", ".git"]]

print("Copying triage-agent...")
if not os.path.exists(dst_triage):
    shutil.copytree(src_triage, dst_triage, ignore=ignore_files)

print("Copy complete!")
