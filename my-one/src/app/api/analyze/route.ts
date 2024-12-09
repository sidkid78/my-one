import { NextResponse } from 'next/server'
import type { ReasoningChain } from '@/types/reasoning'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(req: Request) {
  try {
    const chain = await req.json() as ReasoningChain

    // Validate the reasoning chain structure
    if (!chain.question || !Array.isArray(chain.steps) || !chain.final_answer || !chain.metadata) {
      return NextResponse.json(
        { error: 'Invalid reasoning chain structure' },
        { status: 400 }
      )
    }

    // Validate each step has required properties
    const hasValidSteps = chain.steps.every(step => 
      step.thought &&
      Array.isArray(step.supporting_facts) &&
      typeof step.confidence === 'number' &&
      Array.isArray(step.next_steps)
    )

    if (!hasValidSteps) {
      return NextResponse.json(
        { error: 'Invalid step structure in reasoning chain' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chain),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const analysis = await response.json()
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error in analysis route:', error)
    return NextResponse.json(
      { error: 'Failed to analyze reasoning chain' },
      { status: 500 }
    )
  }
}