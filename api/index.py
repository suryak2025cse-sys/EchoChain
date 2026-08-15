import os
import sys

# Ensure backend directory is in Python path for Vercel serverless imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(parent_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from app.main import app

# Export app for Vercel ASGI serverless handler
app = app
