// app/api/cot/route.ts
import { NextResponse } from 'next/server';
import { AzureChainOfThoughtReasoner } from '@/lib/reasoner';

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    
    const reasoner = new AzureChainOfThoughtReasoner(
      process.env.AZURE_OPENAI_ENDPOINT!,
      process.env.AZURE_OPENAI_API_KEY!,
      process.env.AZURE_DEPLOYMENT_NAME!
    );
    
    const reasoningChain = await reasoner.reason(question);
    return NextResponse.json(reasoningChain);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
