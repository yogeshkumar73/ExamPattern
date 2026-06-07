from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel

app = FastAPI(title="Smart Lab AI Services")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AIRequest(BaseModel):
    userId: str
    prompt: str = ""
    context: str = ""
    code: str = ""
    language: str = ""
    questionTitle: str = ""
    questionDescription: str = ""
    category: str = ""
    difficulty: str = ""

@app.post("/api/ai/hint")
async def get_hint(request: AIRequest):
    # Mock LLM generation
    return {"hint": f"Consider checking your base cases for {request.language}."}

@app.post("/api/ai/explain")
async def get_explain(request: AIRequest):
    return {"explanation": "This code iterates through the array and stores seen elements to achieve O(n) runtime."}

@app.post("/api/ai/review")
async def get_review(request: AIRequest):
    return {"review": "Your logic is mostly correct. Ensure you are handling edge cases where input is empty."}

@app.post("/api/ai/debug")
async def get_debug(request: AIRequest):
    return {"debug": "There might be an off-by-one error in your loop condition."}

@app.post("/api/ai/optimize")
async def get_optimize(request: AIRequest):
    return {"optimization": "Instead of nested loops, use a Hash Map to reduce time complexity from O(n^2) to O(n)."}

@app.post("/api/ai/interview-question")
async def get_interview_question(request: AIRequest):
    return {"question": f"Explain the concept of Virtual DOM in {request.category}."}

@app.post("/api/ai/feedback")
async def get_feedback(request: AIRequest):
    return {
        "score": 85,
        "readinessScore": 80,
        "communicationScore": 90,
        "technicalAccuracyScore": 85,
        "problemSolvingScore": 80,
        "feedback": "Great job! You clearly articulated the trade-offs of your approach."
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
