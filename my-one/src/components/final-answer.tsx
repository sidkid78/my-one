"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FinalAnswerProps {
  answer: string
}

export function FinalAnswer({ answer }: FinalAnswerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle>Final Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{answer}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

