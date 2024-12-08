import { NextResponse } from 'next/server'
import type { ReasoningChain } from '@/types/reasoning'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(req: Request) {
  try {
    const { question } = await req.json()

    const response = await fetch(`${BACKEND_URL}/api/reason`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data: ReasoningChain = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in reasoning route:', error)
    return NextResponse.json(
      { error: 'Failed to process reasoning request' },
      { status: 500 }
    )
  }
}

