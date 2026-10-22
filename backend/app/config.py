import os
from dotenv import load_dotenv

# Load variables from .env file if it exists
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GITHUB_WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET", "my_secret_key_123")