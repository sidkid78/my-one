"use client"

import { motion } from 'framer-motion'
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Chain Analysis</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </motion.div>
  )
}

