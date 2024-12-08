'use client'

import { useState } from 'react'
import { QuestionInput } from '@/components/question-input'
import { ReasoningChain } from '@/components/reasoning-chain'
import { FinalAnswer } from '@/components/final-answer'
import { ChainAnalysis } from '@/components/chain-analysis'
import type { ReasoningChain as ReasoningChainType } from '@/types/reasoning'

export default function Home() {
  const [reasoningChain, setReasoningChain] = useState<ReasoningChainType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleQuestionSubmit = async (question: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // First API call for reasoning
      const reasoningResponse = await fetch('/api/reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })

      if (!reasoningResponse.ok) {
        throw new Error(`Error: ${reasoningResponse.status}`)
      }

      const reasoningData = await reasoningResponse.json()
      setReasoningChain(reasoningData)

      // Second API call for analysis
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reasoningData)
      })

      if (!analysisResponse.ok) {
        throw new Error(`Analysis Error: ${analysisResponse.status}`)
      }

      const analysisData = await analysisResponse.json()
      setReasoningChain(prev => prev ? { ...prev, metadata: { ...prev.metadata, ...analysisData } } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Azure Chain of Thought Reasoner</h1>
      
      <QuestionInput onSubmit={handleQuestionSubmit} disabled={isLoading} />
      
      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="mt-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
          <p className="mt-4">Thinking...</p>
        </div>
      )}

      {reasoningChain && !isLoading && (
        <div className="mt-8 space-y-8">
          <ReasoningChain steps={reasoningChain.steps} />
          <FinalAnswer answer={reasoningChain.final_answer} />
          <ChainAnalysis analysis={reasoningChain.metadata} />
        </div>
      )}
    </main>
  )
}
