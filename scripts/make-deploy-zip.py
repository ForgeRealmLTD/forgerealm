"""Creates a Unix-compatible zip for Elastic Beanstalk deployment."""
import zipfile
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND = os.path.join(ROOT, 'backend')
OUT = os.path.join(ROOT, 'backend-deploy.zip')

SKIP_DIRS  = {'.git', 'node_modules', '.env', '__pycache__', 'dist', 'coverage', 'uploads'}
SKIP_FILES = {'.env', '.env.local', '.env.production'}

def should_skip_dir(name):
    return name in SKIP_DIRS

def collect(base):
    entries = []
    for dirpath, dirnames, filenames in os.walk(base):
        dirnames[:] = [d for d in dirnames if not should_skip_dir(d)]
        for fname in filenames:
            if fname in SKIP_FILES or fname.startswith('.env'):
                continue
            full = os.path.join(dirpath, fname)
            rel  = os.path.relpath(full, base).replace('\\', '/')
            entries.append((full, rel))
    return entries

entries = collect(BACKEND)

with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as zf:
    for full, rel in entries:
        zf.write(full, rel)

print(f'Created {OUT} with {len(entries)} files')
