import json
import re
import os
from typing import List, Dict, Optional
from dataclasses import dataclass
from openai import AzureOpenAI

@dataclass
class ThoughtStep:
    thought: str
    supporting_facts: List[str]
    confidence: float
    next_steps: List[str]

@dataclass
class ReasoningChain:
    question: str
    steps: List[ThoughtStep]
    final_answer: str
    metadata: Dict

class AzureChainOfThoughtReasoner:
    def __init__(
        self,
        azure_endpoint: str,
        azure_api_key: str,
        deployment_name: str,
        api_version: str = "2024-02-15-preview"
    ):
        self.client = AzureOpenAI(
            azure_endpoint=azure_endpoint,
            api_key=azure_api_key,
            api_version=api_version
        )
        self.deployment_name = deployment_name
        
        # Prompt template for eliciting structured reasoning
        self.cot_prompt_template = """
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

    def _parse_thought_steps(self, response: str) -> List[ThoughtStep]:
        """Extract and parse thought steps from model response."""
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
        final_answer_pattern = r'Final Answer:\s*(.+)(?:\n|$)'
        match = re.search(final_answer_pattern, response, re.IGNORECASE)
        return match.group(1).strip() if match else ""

    def reason(self, question: str) -> ReasoningChain:
        """
        Generate a chain of thought reasoning process for the given question.
        Returns a ReasoningChain object containing the full reasoning process.
        """
        # Prepare the prompt
        prompt = self.cot_prompt_template.format(question=question)
        
        # Get model response
        response = self.client.chat.completions.create(
            model=self.deployment_name,
            messages=[
                {"role": "system", "content": "You are a helpful AI that thinks through problems step by step."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content
        
        # Parse the response
        thought_steps = self._parse_thought_steps(content)
        final_answer = self._extract_final_answer(content)
        
        # Create metadata about the reasoning process
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

    def analyze_reasoning_chain(self, chain: ReasoningChain) -> Dict:
        """
        Analyze the quality and characteristics of a reasoning chain.
        """
        if not chain.steps:
            return {
                "error": "No reasoning steps found in the chain"
            }
            
        analysis = {
            "chain_length": len(chain.steps),
            "average_confidence": chain.metadata["average_confidence"],
            "fact_usage": sum(len(step.supporting_facts) for step in chain.steps),
            "branching_factor": sum(len(step.next_steps) for step in chain.steps) / len(chain.steps),
            "low_confidence_steps": [
                i for i, step in enumerate(chain.steps) 
                if step.confidence < 0.7
            ],
            "finish_reason": chain.metadata.get("finish_reason")
        }
        return analysis

def main():
    # Initialize the reasoner with Azure OpenAI credentials
    reasoner = AzureChainOfThoughtReasoner(
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        azure_api_key=os.getenv("AZURE_OPENAI_KEY"),
        deployment_name="your-deployment-name"  # e.g., "gpt-4" or your custom deployment name
    )
    
    # Example question
    question = "What would happen if everyone on Earth jumped at the same time?"
    
    # Generate reasoning chain
    reasoning_chain = reasoner.reason(question)
    
    # Print the reasoning process
    print(f"Question: {reasoning_chain.question}\n")
    
    for i, step in enumerate(reasoning_chain.steps, 1):
        print(f"Step {i}:")
        print(f"Thought: {step.thought}")
        print(f"Supporting facts: {step.supporting_facts}")
        print(f"Confidence: {step.confidence}")
        print(f"Next steps: {step.next_steps}\n")
        
    print(f"Final Answer: {reasoning_chain.final_answer}\n")
    
    # Analyze the reasoning chain
    analysis = reasoner.analyze_reasoning_chain(reasoning_chain)
    print("Reasoning Chain Analysis:")
    print(json.dumps(analysis, indent=2))

if __name__ == "__main__":
    main()