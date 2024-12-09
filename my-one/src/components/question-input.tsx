"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface QuestionInputProps {
  onSubmit: (question: string) => void
}

export function QuestionInput({ onSubmit }: QuestionInputProps) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim()) {
      onSubmit(question)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <Input
        type="text"
        placeholder="Enter your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="flex-grow"
      />
      <Button type="submit">Reason</Button>
    </form>
  )
}

