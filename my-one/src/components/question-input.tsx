'use client'

import { useState } from 'react'

interface QuestionInputProps {
  onSubmit: (question: string) => void
  disabled?: boolean
}

export function QuestionInput({ onSubmit, disabled }: QuestionInputProps) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim()) {
      onSubmit(question)
      setQuestion('')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex gap-4">
        <input
          type="text"
          value={question}
          onChange={handleChange}
          placeholder="Ask a question..."
          className="flex-1 p-3 rounded-lg bg-gray-700 text-white disabled:opacity-50"
          disabled={disabled}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
          disabled={disabled}
        >
          {disabled ? 'Thinking...' : 'Ask'}
        </button>
      </div>
    </form>
  )
}

