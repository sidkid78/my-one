'use client'

import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

interface FinalAnswerProps {
  answer: string
}

export function FinalAnswer({ answer }: FinalAnswerProps) {
  const motionProps: HTMLMotionProps<"div"> & { className?: string } = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 },
    className: "bg-blue-600 p-6 rounded-lg"
  }

  return (
    <motion.div {...motionProps}>
      <h2 className="text-2xl font-semibold mb-2">Final Answer</h2>
      <p className="text-lg">{answer}</p>
    </motion.div>
  )
}

