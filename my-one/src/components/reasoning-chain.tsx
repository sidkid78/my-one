'use client'

import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import type { ThoughtStep } from '@/types/reasoning'

interface ReasoningChainProps {
  steps: ThoughtStep[]
}

export function ReasoningChain({ steps }: ReasoningChainProps) {
  const motionProps: HTMLMotionProps<"div"> & { className?: string } = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
    className: "space-y-4"
  }

  return (
    <motion.div {...motionProps}>
      <h2 className="text-2xl font-semibold mb-4">Reasoning Steps</h2>
      {steps.map((step, index) => (
        <div key={index} className="bg-gray-800 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Step {index + 1}</h3>
          <p className="mb-2">{step.thought}</p>
          <div className="space-y-2">
            <p><strong>Supporting Facts:</strong></p>
            <ul className="list-disc pl-5">
              {step.supporting_facts.map((fact, i) => (
                <li key={i}>{fact}</li>
              ))}
            </ul>
          </div>
          <p className="mt-2">
            <strong>Confidence:</strong> {(step.confidence * 100).toFixed(1)}%
          </p>
        </div>
      ))}
    </motion.div>
  )
}

