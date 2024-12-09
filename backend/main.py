# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
from openai import AzureOpenAI

# Load environment variables
load_dotenv()

class ThoughtStep(BaseModel):
    thought: str
    supporting_facts: List[str]
    confidence: float
    next_steps: List[str]

class ReasoningChain(BaseModel):
    question: str
    steps: List[ThoughtStep]
    final_answer: str
    metadata: Dict

class QuestionRequest(BaseModel):
    question: str

# Initialize FastAPI app
app = FastAPI(title="Chain of Thought Reasoning API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your Next.js app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

COT_PROMPT_TEMPLATE = """
Question: {question}

Please help me solve this step by step. For each step:
1. Share your thought process
2. List any relevant facts you're using
3. Rate your confidence (0-1)
4. Suggest next steps to explore

Structure each step as JSON:
{{
    "thought": "your current thought",
    "supporting_facts": ["fact1", "fact2"],
    "confidence": 0.XX,
    "next_steps": ["step1", "step2"]
}}

After your chain of thought, provide a final answer starting with "Final Answer:"

Think it through step by step:
"""

class ChainOfThoughtReasoner:
    def __init__(self, client: AzureOpenAI, deployment_name: str):
        self.client = client
        self.deployment_name = deployment_name
        
    def _parse_thought_steps(self, response: str) -> List[ThoughtStep]:
        """Extract and parse thought steps from model response."""
        import re
        import json
        
        # Find all JSON-like structures in the response
        json_pattern = r'\{[^{}]*\}'
        json_matches = re.finditer(json_pattern, response)
        
        thought_steps = []
        for match in json_matches:
            try:
                step_dict = json.loads(match.group())
                thought_step = ThoughtStep(
                    thought=step_dict["thought"],
                    supporting_facts=step_dict["supporting_facts"],
                    confidence=step_dict["confidence"],
                    next_steps=step_dict["next_steps"]
                )
                thought_steps.append(thought_step)
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Error parsing thought step: {e}")
                continue
                
        return thought_steps

    def _extract_final_answer(self, response: str) -> str:
        """Extract the final answer from the model response."""
        import re
        final_answer_pattern = r'Final Answer:\s*(.+)(?:\n|$)'
        match = re.search(final_answer_pattern, response, re.IGNORECASE)
        return match.group(1).strip() if match else ""

    async def reason(self, question: str) -> ReasoningChain:
        """Generate a chain of thought reasoning process for the given question."""
        prompt = COT_PROMPT_TEMPLATE.format(question=question)
        
        try:
            response = await self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful AI that thinks through problems step by step."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            
            thought_steps = self._parse_thought_steps(content)
            final_answer = self._extract_final_answer(content)
            
            metadata = {
                "num_steps": len(thought_steps),
                "average_confidence": sum(step.confidence for step in thought_steps) / len(thought_steps) if thought_steps else 0,
                "model": self.deployment_name,
                "finish_reason": response.choices[0].finish_reason
            }
            
            return ReasoningChain(
                question=question,
                steps=thought_steps,
                final_answer=final_answer,
                metadata=metadata
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Reasoning failed: {str(e)}")

# Initialize reasoner
reasoner = ChainOfThoughtReasoner(
    client=client,
    deployment_name=os.getenv("AZURE_DEPLOYMENT_NAME", "gpt-4o")
)

@app.get("/")
async def read_root():
    return {"status": "ok", "message": "Chain of Thought Reasoning API"}

@app.post("/api/reason", response_model=ReasoningChain)
async def create_reasoning_chain(request: QuestionRequest):
    try:
        result = await reasoner.reason(request.question)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "azure_endpoint": os.getenv("AZURE_OPENAI_ENDPOINT") is not None,
        "deployment_name": os.getenv("AZURE_DEPLOYMENT_NAME")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)