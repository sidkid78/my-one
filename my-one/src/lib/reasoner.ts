// lib/reasoner.ts
import { AzureOpenAI } from 'openai';

export interface ThoughtStep {
  thought: string;
  supporting_facts: string[];
  confidence: number;
  next_steps: string[];
}

export interface ReasoningChain {
  question: string;
  steps: ThoughtStep[];
  final_answer: string;
  metadata: {
    num_steps: number;
    average_confidence: number;
    model: string;
    finish_reason?: string;
  };
}

export interface ChainAnalysis {
  chain_length: number;
  average_confidence: number;
  fact_usage: number;
  branching_factor: number;
  low_confidence_steps: number[];
  finish_reason?: string;
  error?: string;
}

const COT_PROMPT_TEMPLATE = `
  Question: {question}
  
  Please help me solve this step by step. For each step:
  1. Share your thought process
  2. List any relevant facts you're using
  3. Rate your confidence (0-1)
  4. Suggest next steps to explore
  
  Structure each step as JSON:
  {
      "thought": "your current thought",
      "supporting_facts": ["fact1", "fact2"],
      "confidence": 0.XX,
      "next_steps": ["step1", "step2"]
  }
  
  After your chain of thought, provide a final answer starting with "Final Answer:"
  
  Think it through step by step:
`;

function parseThoughtSteps(response: string): ThoughtStep[] {
  const jsonPattern = /\{[^{}]*\}/g;
  const matches = response.match(jsonPattern) || [];
  
  return matches.reduce<ThoughtStep[]>((thoughtSteps, match) => {
    try {
      const stepDict = JSON.parse(match);
      
      if (
        typeof stepDict.thought === 'string' &&
        Array.isArray(stepDict.supporting_facts) &&
        typeof stepDict.confidence === 'number' &&
        Array.isArray(stepDict.next_steps)
      ) {
        thoughtSteps.push({
          thought: stepDict.thought,
          supporting_facts: stepDict.supporting_facts,
          confidence: stepDict.confidence,
          next_steps: stepDict.next_steps
        });
      }
    } catch (error) {
      console.error('Error parsing thought step:', error);
    }
    return thoughtSteps;
  }, []);
}

function extractFinalAnswer(response: string): string {
  const finalAnswerPattern = /Final Answer:\s*(.+)(?:\n|$)/i;
  const match = response.match(finalAnswerPattern);
  return match ? match[1].trim() : "";
}

export function analyzeReasoningChain(chain: ReasoningChain): ChainAnalysis {
  if (!chain.steps.length) {
    return {
      chain_length: 0,
      average_confidence: 0,
      fact_usage: 0,
      branching_factor: 0,
      low_confidence_steps: [],
      error: "No reasoning steps found in the chain"
    };
  }

  return {
    chain_length: chain.steps.length,
    average_confidence: chain.metadata.average_confidence,
    fact_usage: chain.steps.reduce(
      (sum, step) => sum + step.supporting_facts.length,
      0
    ),
    branching_factor: chain.steps.reduce(
      (sum, step) => sum + step.next_steps.length,
      0
    ) / chain.steps.length,
    low_confidence_steps: chain.steps
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step.confidence < 0.7)
      .map(({ index }) => index),
    finish_reason: chain.metadata.finish_reason
  };
}

export class AzureChainOfThoughtReasoner {
  private client: AzureOpenAI;
  private deployment_name: string;

  constructor(
    azure_endpoint: string,
    azure_api_key: string,
    deployment_name: string,
    api_version: string = "2024-08-01-preview"
  ) {
    this.client = new AzureOpenAI({
      apiKey: azure_api_key,
      baseURL: `${azure_endpoint}/openai/deployments/${deployment_name}`,
      defaultHeaders: { "api-key": azure_api_key },
      defaultQuery: { "api-version": api_version }
    });
    this.deployment_name = deployment_name;
  }

  async reason(question: string): Promise<ReasoningChain> {
    const prompt = COT_PROMPT_TEMPLATE.replace('{question}', question);

    try {
      const response = await this.client.chat.completions.create({
        model: this.deployment_name,
        messages: [
          {
            role: "system",
            content: "You are a helpful AI that thinks through problems step by step."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error('No content in response');
      }

      const thoughtSteps = parseThoughtSteps(content);
      const finalAnswer = extractFinalAnswer(content);

      if (thoughtSteps.length === 0) {
        throw new Error('No valid thought steps found in response');
      }

      const metadata = {
        num_steps: thoughtSteps.length,
        average_confidence: thoughtSteps.reduce((sum, step) => sum + step.confidence, 0) / thoughtSteps.length,
        model: this.deployment_name,
        finish_reason: response.choices[0].finish_reason
      };

      return {
        question,
        steps: thoughtSteps,
        final_answer: finalAnswer,
        metadata
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Reasoning failed: ${error.message}`);
      }
      throw new Error('An unknown error occurred during reasoning');
    }
  }
}