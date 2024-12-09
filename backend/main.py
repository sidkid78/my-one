from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from .openai_one import AzureChainOfThoughtReasoner, ReasoningChain
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class QuestionRequest(BaseModel):
    question: str

class ThoughtStepResponse(BaseModel):
    thought: str
    supporting_facts: List[str]
    confidence: float
    next_steps: List[str]

class ReasoningResponse(BaseModel):
    question: str
    steps: List[ThoughtStepResponse]
    final_answer: str
    metadata: Dict

# Initialize the reasoner
reasoner = AzureChainOfThoughtReasoner(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    azure_api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    deployment_name=os.getenv("AZURE_DEPLOYMENT_NAME")
)

@app.post("/api/reason", response_model=ReasoningResponse)
async def create_reasoning_chain(request: QuestionRequest):
    try:
        chain = reasoner.reason(request.question)
        return chain
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze")
async def analyze_chain(chain: ReasoningResponse):
    try:
        analysis = reasoner.analyze_reasoning_chain(chain)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 