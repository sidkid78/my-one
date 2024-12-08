'use client'

import { motion } from 'framer-motion'
import type { MotionProps } from 'framer-motion'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface ChainAnalysisProps {
  analysis: {
    num_steps: number
    average_confidence: number
    finish_reason: string
  }
}

type MotionSectionProps = MotionProps & React.HTMLAttributes<HTMLElement>

export function ChainAnalysis({ analysis }: ChainAnalysisProps) {
  const chartData = {
    labels: ['Number of Steps', 'Average Confidence'],
    datasets: [
      {
        label: 'Chain Analysis',
        data: [analysis.num_steps, analysis.average_confidence],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const motionProps: MotionSectionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
    className: "bg-gray-800 p-6 rounded-lg"
  }

  return (
    <motion.section {...motionProps}>
      <h2 className="text-2xl font-semibold mb-4">Chain Analysis</h2>
      <div className="mb-4">
        <p>
          <strong>Number of Steps:</strong> {analysis.num_steps}
        </p>
        <p>
          <strong>Average Confidence:</strong>{' '}
          {(analysis.average_confidence * 100).toFixed(2)}%
        </p>
        <p>
          <strong>Finish Reason:</strong> {analysis.finish_reason}
        </p>
      </div>
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </motion.section>
  )
}

