from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.analyzer import analyze_code_diff

app = FastAPI(title="AI PR Code Reviewer API")

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReviewRequest(BaseModel):
    diff: str

@app.get("/")
def home():
    return {"message": "AI Code Reviewer backend is running successfully!"}

@app.post("/api/review")
def review_pr(request: ReviewRequest):
    if not request.diff.strip():
        raise HTTPException(status_code=400, detail="Diff cannot be empty.")
    
    result = analyze_code_diff(request.diff)
    return result
