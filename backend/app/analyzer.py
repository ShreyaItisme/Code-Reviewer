import json
import os
import re
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

client = None
if GROQ_API_KEY:
    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=GROQ_API_KEY,
    )

def extract_json_from_text(text: str) -> dict:
    """Extracts JSON object from response even if enclosed in markdown fences."""
    try:
        return json.loads(text)
    except Exception:
        pass

    # Extract JSON inside ```json ... ``` or ``` ... ```
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass

    # Extract any top-level { ... }
    match = re.search(r"(\{.*\})", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass

    return {
        "summary": "Review completed (raw format).",
        "comments": [{"line": 1, "body": text.strip()}]
    }

def analyze_code_diff(diff_text: str) -> dict:
    if not client:
        return {
            "summary": "Mock Review: No active Groq API key found.",
            "comments": [{"line": 1, "body": "Please configure GROQ_API_KEY in backend/.env."}]
        }

    combined_prompt = f"""You are an automated code quality and security reviewer.
Analyze this git diff and return STRICTLY valid JSON with no markdown and no other text.

JSON format:
{{
  "summary": "Short 1-2 sentence overview of the changes and overall quality",
  "comments": [
    {{"line": 12, "body": "Specific explanation of the bug, security flaw, or anti-pattern"}}
  ]
}}

Git diff to analyze:
{diff_text}
"""

    # Primary chat models to try in order of availability
    models_to_try = [
        "llama-3.1-8b-instant",
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
        "mixtral-8x7b-32768",
    ]

    last_error = ""
    for model_name in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "user", "content": combined_prompt}
                ],
                temperature=0.1,
            )
            raw_output = response.choices[0].message.content
            return extract_json_from_text(raw_output)
        except Exception as e:
            last_error = str(e)
            continue

    return {
        "summary": "Review execution error",
        "comments": [{"line": 1, "body": f"AI service error across available models: {last_error}"}]
    }