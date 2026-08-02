import { useState, useEffect, useMemo } from 'react'
import { Text } from '@salt-ds/core'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz } from 'ag-grid-community'

interface PerQuestion {
  question: string
  faithfulness: number
  answer_relevancy: number
}

interface EvalResults {
  faithfulness: number
  answer_relevancy: number
  total_questions: number
  per_question: PerQuestion[]
}

const darkTheme = themeQuartz.withParams({
  backgroundColor: '#1f2937',
  foregroundColor: '#f9fafb',
  headerBackgroundColor: '#111827',
  borderColor: '#374151',
  rowHoverColor: '#374151',
  oddRowBackgroundColor: '#1a2432',
})

const ScoreCard = ({ label, score }: { label: string; score: number }) => {
  const color = score >= 0.7 ? '#4ade80' : score >= 0.5 ? '#fbbf24' : '#f87171'
  const barColor = score >= 0.7 ? '#22c55e' : score >= 0.5 ? '#f59e0b' : '#ef4444'
  const badge = score >= 0.7 ? 'Good' : score >= 0.5 ? 'Needs Review' : 'Poor'
  const badgeBg = score >= 0.7 ? '#14532d' : score >= 0.5 ? '#78350f' : '#7f1d1d'

  return (
    <div style={{
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '20px'
    }}>
      <p style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '8px' }}>
        <p style={{ color, fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{score.toFixed(2)}</p>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>/ 1.0</p>
      </div>
      <div style={{ backgroundColor: '#374151', borderRadius: '999px', height: '6px', marginBottom: '8px' }}>
        <div style={{ backgroundColor: barColor, borderRadius: '999px', height: '6px', width: `${score * 100}%` }} />
      </div>
      <span style={{
        backgroundColor: badgeBg,
        color,
        fontSize: '11px',
        padding: '2px 8px',
        borderRadius: '4px',
        fontWeight: '600'
      }}>
        {badge}
      </span>
    </div>
  )
}

export const EvaluationsPage = () => {
  const [results, setResults] = useState<EvalResults | null>(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/evals')
      .then(res => res.json())
      .then(data => {
        console.log('Evals data:', data)
        setResults(data)
      })
  }, [])

  const columnDefs = useMemo(() => [
    {
      headerName: '#',
      valueGetter: (p: any) => p.node.rowIndex + 1,
      width: 60
    },
    {
      field: 'question',
      headerName: 'Query',
      flex: 2,
      cellStyle: { color: '#d1d5db' }
    },
    {
      field: 'faithfulness',
      headerName: 'Faithfulness',
      width: 140,
      cellStyle: (p: any) => ({
        color: p.value >= 0.7 ? '#4ade80' : p.value >= 0.5 ? '#fbbf24' : '#f87171',
        fontWeight: '600'
      }),
      valueFormatter: (p: any) => p.value?.toFixed(2) ?? 'N/A'
    },
    {
      field: 'answer_relevancy',
      headerName: 'Answer Relevancy',
      width: 160,
      cellStyle: (p: any) => ({
        color: p.value >= 0.7 ? '#4ade80' : p.value >= 0.5 ? '#fbbf24' : '#f87171',
        fontWeight: '600'
      }),
      valueFormatter: (p: any) => p.value?.toFixed(2) ?? 'N/A'
    },
    {
      headerName: 'Overall',
      width: 130,
      valueGetter: (p: any) => ((p.data.faithfulness + p.data.answer_relevancy) / 2),
      cellStyle: (p: any) => ({
        color: p.value >= 0.7 ? '#4ade80' : p.value >= 0.5 ? '#fbbf24' : '#f87171',
        fontWeight: '700'
      }),
      valueFormatter: (p: any) => p.value?.toFixed(2) ?? 'N/A'
    }
  ], [])

  const chartOptions = useMemo((): Highcharts.Options => ({
    chart: {
      type: 'column',
      backgroundColor: '#1f2937',
      style: { fontFamily: 'Inter, sans-serif' }
    },
    title: {
      text: 'Metric Scores Overview',
      style: { color: '#ffffff', fontSize: '14px' }
    },
    xAxis: {
      categories: ['Faithfulness', 'Answer Relevancy'],
      labels: { style: { color: '#9ca3af' } },
      lineColor: '#374151'
    },
    yAxis: {
      min: 0,
      max: 1,
      title: { text: 'Score', style: { color: '#9ca3af' } },
      labels: { style: { color: '#9ca3af' } },
      gridLineColor: '#374151',
      plotLines: [{
        color: '#4ade80',
        width: 1,
        value: 0.7,
        dashStyle: 'Dash',
        label: {
          text: 'Good threshold (0.7)',
          style: { color: '#4ade80', fontSize: '11px' }
        }
      }]
    },
    series: [{
      type: 'column',
      name: 'Score',
      data: results ? [
        { y: results.faithfulness, color: results.faithfulness >= 0.7 ? '#22c55e' : '#f59e0b' },
        { y: results.answer_relevancy, color: results.answer_relevancy >= 0.7 ? '#22c55e' : '#f59e0b' }
      ] : [],
      borderRadius: 4,
      dataLabels: {
        enabled: true,
        style: { color: '#ffffff', fontWeight: '600' },
        formatter: function () { return (this.y as number).toFixed(2) }
      }
    }],
    legend: { enabled: false },
    credits: { enabled: false },
    tooltip: {
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      style: { color: '#ffffff' },
      formatter: function () {
        return `<b>${this.x}</b>: ${(this.y as number).toFixed(3)}`
      }
    }
  }), [results])

  if (!results) return <Text className="text-white">Loading evaluation results...</Text>

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Text styleAs="h2" className="text-white font-bold">RAG Evaluation Dashboard</Text>
        <p className="text-gray-400 text-sm mt-1">
          LLM-as-Judge evaluation across {results.total_questions} commodity test cases
        </p>
      </div>

      {/* Score Cards — inline style to avoid Tailwind conflict */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <ScoreCard label="Faithfulness" score={results.faithfulness} />
        <ScoreCard label="Answer Relevancy" score={results.answer_relevancy} />
      </div>

      {/* Chart */}
      <div style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '16px' }}>
        <HighchartsReact.default
          key={`chart-${results.faithfulness}`}
          highcharts={Highcharts}
          options={chartOptions}
        />
      </div>

      {/* AG Grid */}
      <div style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #374151' }}>
          <Text styleAs="h3" className="text-white font-bold">Per Query Breakdown</Text>
          <p className="text-gray-400 text-xs mt-1">Individual scores per evaluated query</p>
        </div>
        <div style={{ height: '450px' }}>
          <AgGridReact
            rowData={results.per_question}
            columnDefs={columnDefs}
            theme={darkTheme}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      </div>
    </div>
  )
}