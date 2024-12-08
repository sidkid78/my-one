export interface ThoughtStep {
    thought: string
    supporting_facts: string[]
    confidence: number
    next_steps: string[]
  }
  
  export interface ReasoningChain {
    question: string
    steps: ThoughtStep[]
    final_answer: string
    metadata: {
      num_steps: number
      average_confidence: number
      finish_reason: string
    }
  }
  
  