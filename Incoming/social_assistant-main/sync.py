import os
import subprocess

os.system("python maintain/doc_generator.py")
os.system("git add . && git commit -m 'update' && git push origin main --force")
print("✅")