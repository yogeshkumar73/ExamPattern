import os
import json
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

# Try loading from the root folder directory
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Aura Study Logic - Python LLM Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration / Keys
OLLAMA_URL = "http://localhost:11434"
GEMINI_KEY = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or os.getenv("NEXT_GEMINI_API_KEY")
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

class AiRequest(BaseModel):
    userId: Optional[str] = None
    prompt: Optional[str] = None
    context: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = None
    questionTitle: Optional[str] = None
    questionDescription: Optional[str] = None
    answers: Optional[List[str]] = None

def call_ollama(prompt: str, system_prompt: str = "") -> Optional[str]:
    """Tries to query a local Ollama instance if available."""
    try:
        # Check if Ollama is running first with a quick timeout
        res = requests.get(OLLAMA_URL, timeout=1.0)
        if res.status_code == 200:
            payload = {
                "model": "llama3", # default model fallback
                "prompt": f"System: {system_prompt}\n\nUser: {prompt}",
                "stream": False,
                "options": {
                    "temperature": 0.5
                }
            }
            # Attempt to call Ollama generate
            ollama_res = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=10.0)
            if ollama_res.status_code == 200:
                return ollama_res.json().get("response")
    except Exception as e:
        print(f"Ollama is offline or failed: {e}")
    return None

def call_gemini(prompt: str, system_prompt: str = "") -> Optional[str]:
    """Queries Gemini API using google-generativeai SDK if key is configured."""
    if not GEMINI_KEY:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        full_prompt = f"{system_prompt}\n\nUser Prompt:\n{prompt}"
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API invocation failed: {e}")
    return None

def call_openrouter(prompt: str, system_prompt: str = "") -> Optional[str]:
    """Queries OpenRouter / OpenAI API if key is configured."""
    if not OPENAI_KEY:
        return None
    try:
        headers = {
            "Authorization": f"Bearer {OPENAI_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Aura Study AI"
        }
        
        # If it's an OpenRouter key, it starts with sk-or-v1-
        url = "https://openrouter.ai/api/v1/chat/completions" if OPENAI_KEY.startswith("sk-or-v1-") else "https://api.openai.com/v1/chat/completions"
        model = "meta-llama/llama-3.3-70b-instruct" if OPENAI_KEY.startswith("sk-or-v1-") else "gpt-3.5-turbo"
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.5
        }
        res = requests.post(url, json=payload, headers=headers, timeout=15.0)
        if res.status_code == 200:
            return res.json()["choices"][0]["message"]["content"]
        else:
            print(f"OpenRouter/OpenAI API returned status code {res.status_code}: {res.text}")
    except Exception as e:
        print(f"OpenRouter/OpenAI invocation failed: {e}")
    return None

def ask_llm(prompt: str, system_prompt: str = "You are a professional coding coach and interviewer.") -> str:
    """Invokes Ollama -> Gemini -> OpenRouter in order, falling back to None if all fail."""
    # 1. Try Ollama (Local LLM)
    response = call_ollama(prompt, system_prompt)
    if response:
        return response.strip()
        
    # 2. Try Gemini API
    response = call_gemini(prompt, system_prompt)
    if response:
        return response.strip()
        
    # 3. Try OpenRouter/OpenAI API
    response = call_openrouter(prompt, system_prompt)
    if response:
        return response.strip()
        
    # 4. If all fail, raise Exception to trigger smart template fallback in caller
    raise RuntimeError("No LLM providers are online or configured.")

@app.get("/health")
def health_check():
    providers = []
    if GEMINI_KEY: providers.append("Gemini")
    if OPENAI_KEY: providers.append("OpenRouter/OpenAI")
    
    # Check Ollama
    ollama_status = "Offline"
    try:
        if requests.get(OLLAMA_URL, timeout=1.0).status_code == 200:
            ollama_status = "Online"
            providers.append("Ollama (Local)")
    except Exception:
        pass
        
    return {
        "status": "Healthy",
        "ollama": ollama_status,
        "configured_providers": providers
    }

@app.post("/api/ai/hint")
def generate_hint(req: AiRequest):
    sys_prompt = "You are a helpful coding tutor. Provide a brief, subtle, 2-3 sentence hint to guide a student solving a coding problem. Do not provide code blocks or solutions."
    prompt = f"Problem Title: {req.questionTitle or 'Coding Problem'}\nDescription: {req.questionDescription or 'No description'}\n"
    if req.code:
        prompt += f"My Current Code ({req.language or 'javascript'}):\n{req.code}\n"
    
    try:
        hint = ask_llm(prompt, sys_prompt)
        return {"hint": hint}
    except Exception:
        # Fallback template
        return {"hint": "Try breaking down the problem: review the base conditions first, then verify if your loops/indexes are correctly accessing array bounds."}

@app.post("/api/ai/explain")
def generate_explanation(req: AiRequest):
    sys_prompt = "You are an expert software engineer. Explain this code clearly and concisely. Outline how it works and what data structures it employs in under 4 paragraphs."
    prompt = f"Problem: {req.questionTitle or 'Coding Problem'}\nLanguage: {req.language or 'javascript'}\nCode:\n{req.code or 'No code provided.'}"
    
    try:
        explanation = ask_llm(prompt, sys_prompt)
        return {"explanation": explanation}
    except Exception:
        return {"explanation": "This code implements a solution for the problem. It utilizes iterative parsing to process inputs, allocating variables to track current indexes and return results efficiently."}

@app.post("/api/ai/review")
def generate_review(req: AiRequest):
    sys_prompt = "You are a senior code reviewer. Review the provided code. State 1-2 positive comments and 1-2 areas of improvement regarding performance, memory, or readability."
    prompt = f"Problem: {req.questionTitle or 'Coding Problem'}\nLanguage: {req.language or 'javascript'}\nCode:\n{req.code or 'No code provided.'}"
    
    try:
        review = ask_llm(prompt, sys_prompt)
        return {"review": review}
    except Exception:
        return {"review": "Code Review:\n- Positive: Simple logic and clean variable naming.\n- Improvement: Consider using a hash map to reduce time complexity if input size grows larger."}

@app.post("/api/ai/optimize")
def generate_optimization(req: AiRequest):
    sys_prompt = "You are a high-performance computing expert. Suggest an optimized approach for this code (e.g. reducing complexity, caching, or standard library tricks). Do not write full scripts, just the crucial optimization snippet."
    prompt = f"Problem: {req.questionTitle or 'Coding Problem'}\nLanguage: {req.language or 'javascript'}\nCode:\n{req.code or 'No code provided.'}"
    
    try:
        optimization = ask_llm(prompt, sys_prompt)
        return {"optimization": optimization}
    except Exception:
        return {"optimization": "To optimize this, avoid nested loops which result in O(N^2) complexity. Store seen values in a Set or Map to achieve lookup in O(1) time."}

@app.post("/api/ai/debug")
def generate_debug(req: AiRequest):
    sys_prompt = "You are an expert debugger. Spot any errors, loops, logic flaws, or potential runtime exceptions in the provided code. Suggest the specific line fix."
    prompt = f"Problem: {req.questionTitle or 'Coding Problem'}\nLanguage: {req.language or 'javascript'}\nCode:\n{req.code or 'No code provided.'}"
    
    try:
        debug = ask_llm(prompt, sys_prompt)
        return {"debug": debug}
    except Exception:
        return {"debug": "Ensure that edge cases (like empty arrays, null values, or negative targets) are explicitly handled to avoid index out of bounds exceptions."}

@app.post("/api/ai/interview-question")
def generate_interview_question(req: AiRequest):
    sys_prompt = "You are a tech interviewer. Create a realistic technical interview question (e.g. DSA, System Design, or Framework specific) matching the requested category and difficulty."
    prompt = f"Category: {req.context or 'Software Engineering'}\nDifficulty: {req.prompt or 'Medium'}"
    
    try:
        question = ask_llm(prompt, sys_prompt)
        return {"question": question}
    except Exception:
        return {"question": f"Explain the concept of closures in JavaScript and how they can be used to emulate private variables."}

@app.post("/api/ai/feedback")
def evaluate_feedback(req: AiRequest):
    sys_prompt = (
        "You are an expert technical interviewer. Evaluate the candidate's answers to the mock interview questions. "
        "Return a strictly formatted JSON response containing:\n"
        "- score: Integer (0-100)\n"
        "- readinessScore: Integer (0-100)\n"
        "- communicationScore: Integer (0-100)\n"
        "- technicalAccuracyScore: Integer (0-100)\n"
        "- problemSolvingScore: Integer (0-100)\n"
        "- feedback: Detailed string summary of strengths and weaknesses."
    )
    prompt = f"Candidate Answer Data: {json.dumps(req.answers or [])}"
    
    try:
        res_text = ask_llm(prompt, sys_prompt)
        # Try to parse JSON from the LLM output
        try:
            clean_text = res_text.replace("```json", "").replace("```", "").strip()
            json_match = clean_text.find("{")
            if json_match != -1:
                clean_text = clean_text[json_match:]
            json_end = clean_text.rfind("}")
            if json_end != -1:
                clean_text = clean_text[:json_end+1]
                
            data = json.loads(clean_text)
            return data
        except Exception:
            return {
                "score": 78,
                "readinessScore": 82,
                "communicationScore": 80,
                "technicalAccuracyScore": 75,
                "problemSolvingScore": 80,
                "feedback": res_text
            }
    except Exception:
        return {
            "score": 75,
            "readinessScore": 80,
            "communicationScore": 85,
            "technicalAccuracyScore": 72,
            "problemSolvingScore": 70,
            "feedback": "Overall good performance. The answers show clear fundamentals, but could benefit from deeper technical detail, specifically on architecture and time complexity analysis."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
