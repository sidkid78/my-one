"use client"

import { useState } from 'react'
import { QuestionInput } from './question-input'
import { ReasoningChain } from './reasoning-chain'
import { FinalAnswer } from './final-answer'
import { ChainAnalysis } from './chain-analysis'
import { ReasoningChain as ReasoningChainType } from '@/types/reasoning'

export function AzureReasonerTab() {
  const [reasoningChain, setReasoningChain] = useState<ReasoningChainType | null>(null)

  const handleQuestionSubmit = async (question: string) => {
    const response = await fetch('/api/reason', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    })
    const data = await response.json()
    setReasoningChain(data)
  }

  return (
    <div className="space-y-6">
      <QuestionInput onSubmit={handleQuestionSubmit} />
      {reasoningChain && (
        <>
          <ReasoningChain steps={reasoningChain.steps} />
          <FinalAnswer answer={reasoningChain.final_answer} />
          <ChainAnalysis analysis={reasoningChain.metadata} />
        </>
      )}
    </div>
  )
}

