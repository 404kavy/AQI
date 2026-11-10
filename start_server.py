"""
AirGuard AI — Application Launch Script
Runs the unified FastAPI + built React frontend server on http://127.0.0.1:8000
"""

import os
import sys
import uvicorn

# Add backend directory to Python path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

if __name__ == "__main__":
    print("=" * 70)
    print("  AIRGUARD AI — Research Decision Support Framework")
    print("  Serving full-stack application at: http://127.0.0.1:8000")
    print("  Authority Portal: http://127.0.0.1:8000/authority")
    print("  Citizen Portal:   http://127.0.0.1:8000/citizen")
    print("  Explainability:   http://127.0.0.1:8000/research/explainability")
    print("  About Research:   http://127.0.0.1:8000/about")
    print("  API Docs:         http://127.0.0.1:8000/docs")
    print("=" * 70)
    uvicorn.run("src.api.app:app", host="127.0.0.1", port=8000, reload=False)
