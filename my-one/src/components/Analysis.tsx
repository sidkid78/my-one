// components/Analysis.tsx
import { Card } from '@/components/ui/card';
import type { ReasoningChain } from '@/types/reasoning';

interface AnalysisProps {
  chain: ReasoningChain;
}

export function Analysis({ chain }: AnalysisProps) {
  const analysis = {
    chainLength: chain.steps.length,
    averageConfidence: chain.metadata.average_confidence,
    factUsage: chain.steps.reduce((sum, step) => sum + step.supporting_facts.length, 0),
    branchingFactor: chain.steps.reduce((sum, step) => sum + step.next_steps.length, 0) / chain.steps.length,
    lowConfidenceSteps: chain.steps
      .map((step, i) => ({ step, index: i }))
      .filter(({ step }) => step.confidence < 0.7)
      .map(({ index }) => index + 1)
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Reasoning Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Chain Length</h3>
          <p className="text-2xl font-semibold">{analysis.chainLength} steps</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Average Confidence</h3>
          <p className="text-2xl font-semibold">
            {(analysis.averageConfidence * 100).toFixed(1)}%
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Supporting Facts Used</h3>
          <p className="text-2xl font-semibold">{analysis.factUsage}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Average Branching Factor</h3>
          <p className="text-2xl font-semibold">{analysis.branchingFactor.toFixed(1)}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Low Confidence Steps</h3>
          <p className="text-2xl font-semibold">
            {analysis.lowConfidenceSteps.length > 0 
              ? analysis.lowConfidenceSteps.join(', ')
              : 'None'}
          </p>
        </div>
      </div>
    </Card>
  );
}
