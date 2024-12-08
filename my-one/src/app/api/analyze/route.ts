import { NextResponse } from 'next/server'
import type { ReasoningChain } from '@/types/reasoning'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(req: Request) {
  try {
    const chain = await req.json()

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