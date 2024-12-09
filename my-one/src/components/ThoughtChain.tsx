// components/ThoughtChain.tsx
import { Card } from '@/components/ui/card';
import type { ReasoningChain } from '@/types/reasoning';

interface ThoughtChainProps {
    chain: ReasoningChain;
  }
  
  export function ThoughtChain({ chain }: ThoughtChainProps) {
    return (
      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Reasoning Process</h2>
        
        <div className="space-y-6">
          {chain.steps.map((step, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  Step {index + 1}
                </div>
                <div className="text-sm text-gray-500">
                  Confidence: {(step.confidence * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="pl-4 border-l-2 border-blue-100 space-y-2">
                <p className="font-medium">{step.thought}</p>
                
                {step.supporting_facts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Supporting Facts:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {step.supporting_facts.map((fact, i) => (
                        <li key={i}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {step.next_steps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Next Steps:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {step.next_steps.map((nextStep, i) => (
                        <li key={i}>{nextStep}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
  
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-medium text-gray-500">Final Answer:</h3>
          <p className="mt-2">{chain.final_answer}</p>
        </div>
      </Card>
    );
  }