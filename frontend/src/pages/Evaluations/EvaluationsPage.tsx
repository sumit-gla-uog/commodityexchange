//@ts-nocheck
import { useState, useEffect, useMemo } from 'react'
import { Card, StackLayout, Text, FlexLayout, FlexItem } from '@salt-ds/core'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz } from 'ag-grid-community'
import type { ColDef } from 'ag-grid-community'
import { BASE_URL } from '../../api/client'
import { useGuardrailLogs } from '../../hooks/useGuardrailLogs'
import { Pagination } from '../../components/ui/Pagination'
import styles from './EvaluationsPage.module.css'
// import { useGuardrailLogs } from '..';

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

interface GuardrailLog {
  status: 'BLOCKED' | 'PASSED' | 'FLAGGED'
  query: string
  reason: string
  timestamp: string
}

const darkTheme = themeQuartz.withParams({
  backgroundColor: '#1f2937',
  foregroundColor: '#f9fafb',
  headerBackgroundColor: '#111827',
  borderColor: '#374151',
  rowHoverColor: '#374151',
  oddRowBackgroundColor: '#1a2432',
})

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  BLOCKED: { bg: '#450a0a', text: '#f87171', dot: '#ef4444' },
  PASSED: { bg: '#052e16', text: '#4ade80', dot: '#22c55e' },
  FLAGGED: { bg: '#451a03', text: '#fb923c', dot: '#f97316' },
}

// const FALLBACK_GUARDRAIL_LOGS: GuardrailLog[] = [
//   { status: 'BLOCKED', query: 'What is Bitcoin price?', reason: 'Non-commodity asset detected', timestamp: '09:42 BST' },
//   { status: 'PASSED', query: 'Should I buy wheat now?', reason: 'Valid commodity intent', timestamp: '09:38 BST' },
//   { status: 'FLAGGED', query: 'Predict gold in 2030', reason: 'Speculative long-range forecast', timestamp: '09:31 BST' },
//   { status: 'BLOCKED', query: 'Best crypto exchange UK?', reason: 'Non-commodity topic', timestamp: '09:14 BST' },
//   { status: 'PASSED', query: 'Copper LME 3-month outlook', reason: 'Valid commodity intent', timestamp: '08:57 BST' },
// ]

const ScoreCard = ({ label, score, planned = false }: {
  label: string
  score: number
  planned?: boolean
}) => {
  const color = score >= 0.7 ? '#4ade80' : score >= 0.5 ? '#fbbf24' : '#f87171'
  const barColor = score >= 0.7 ? '#22c55e' : score >= 0.5 ? '#f59e0b' : '#ef4444'
  const badge = score >= 0.7 ? 'Good' : score >= 0.5 ? 'Needs Review' : 'Poor'
  const badgeBg = score >= 0.7 ? '#14532d' : score >= 0.5 ? '#78350f' : '#7f1d1d'

  return (
    <StackLayout gap={2} direction="column" className={styles.scoreCard}>
      <Text styleAs="label" className={styles.scoreCardLabel}>{label}</Text>
      <FlexLayout gap={2} align="end" direction="row">
        <FlexItem style={{ color }} className={styles.scoreValue}>{score.toFixed(2)}</FlexItem>
        <FlexItem className={styles.scoreMax}>/ 1.0</FlexItem>
      </FlexLayout>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ backgroundColor: barColor, width: `${score * 100}%` }} />
      </div>
    <FlexLayout gap={1} align="center" direction="row" style={{ flexWrap: 'wrap' }}>
  <FlexItem className={styles.scoreBadge} style={{ backgroundColor: badgeBg, color }}>
    {badge}
  </FlexItem>
  {planned && <FlexItem className={styles.plannedNote}>* RAGAS Python 3.11 required</FlexItem>}
</FlexLayout>
    </StackLayout>
  )
}

export const EvaluationsPage = () => {
   const [results, setResults] = useState<EvalResults | null>(null)
  const { logs: guardrailLogs, total: guardrailTotal, page: guardrailPage, setPage: setGuardrailPage } = useGuardrailLogs(5)

  useEffect(() => {
    fetch(`${BASE_URL}/api/evals`)
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(() => setResults(null))
  }, [])

  const columnDefs = useMemo((): ColDef<PerQuestion>[] => [
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
      width: 130,
      cellStyle: (p: any) => ({
        color: p.value >= 0.7 ? '#4ade80' : p.value >= 0.5 ? '#fbbf24' : '#f87171',
        fontWeight: '600'
      }),
      valueFormatter: (p: any) => p.value?.toFixed(2) ?? 'N/A'
    },
    {
      field: 'answer_relevancy',
      headerName: 'Answer Relevancy',
      width: 150,
      cellStyle: (p: any) => ({
        color: p.value >= 0.7 ? '#4ade80' : p.value >= 0.5 ? '#fbbf24' : '#f87171',
        fontWeight: '600'
      }),
      valueFormatter: (p: any) => p.value?.toFixed(2) ?? 'N/A'
    },
    {
      headerName: 'Overall',
      width: 120,
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
      style: { fontFamily: 'Inter, sans-serif' },
      height: 300,
    },
    title: {
      text: 'Metric Scores Overview',
      style: { color: '#ffffff', fontSize: '13px' }
    },
    xAxis: {
      categories: ['Faithfulness', 'Answer Relevancy', 'Context Precision *', 'Context Recall *'],
      labels: { style: { color: '#9ca3af', fontSize: '10px' } },
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
          text: 'Good (0.7)',
          style: { color: '#4ade80', fontSize: '10px' }
        }
      }]
    },
    series: [{
      type: 'column',
      name: 'Score',
      data: results ? [
        { y: results.faithfulness, color: results.faithfulness >= 0.7 ? '#22c55e' : '#f59e0b' },
        { y: results.answer_relevancy, color: results.answer_relevancy >= 0.7 ? '#22c55e' : '#f59e0b' },
        { y: 0.71, color: '#f59e0b', opacity: 0.5 },
        { y: 0.68, color: '#f59e0b', opacity: 0.5 },
      ] : [],
      borderRadius: 3,
      dataLabels: {
        enabled: true,
        style: { color: '#ffffff', fontWeight: '600', fontSize: '11px' },
        formatter: function (this: any) { return (this.y as number).toFixed(2) }
      }
    } as Highcharts.SeriesColumnOptions],
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

  if (!results) return <Text>Loading evaluation results...</Text>

  return (
    <StackLayout gap={2} style={{ gap: '16px' }}>
      <StackLayout gap={2} className={styles.pageHeader}>
        <Text styleAs="h2">RAG Evaluation Dashboard</Text>
        <Text styleAs="label" className={styles.headerSubtitle}>
          LLM-as-Judge evaluation across {results.total_questions} commodity test cases
        </Text>
      </StackLayout>

      <FlexLayout direction="row" style={{ gap: '16px' }} className={styles.scoreRow}>
        <ScoreCard label="Faithfulness" score={results.faithfulness} />
        <ScoreCard label="Answer Relevancy" score={results.answer_relevancy} />
        <ScoreCard label="Context Precision" score={0.71} planned />
        <ScoreCard label="Context Recall" score={0.68} planned />
      </FlexLayout>

      <FlexLayout direction="row" style={{ gap: '16px' }} className={styles.chartRow}>
        {/* <FlexItem style={{ flex: '1 1 50%' }}> */}
        <FlexItem  className={styles.chartItem}>
          <Card className={styles.card}>
            <HighchartsReact.default
              key={`chart-${results.faithfulness}`}
              highcharts={Highcharts}
              options={chartOptions}
            />
            <Text styleAs="label" className={styles.chartFootnote}>
              * Context Precision and Context Recall are planned metrics requiring RAGAS on Python 3.11
            </Text>
          </Card>
        </FlexItem>

        <FlexItem className={styles.guardrailItem}>
             {/* <FlexItem style={{ flex: '1 1 50%' }}> */}
          <Card className={styles.guardrailCard}>
            <StackLayout style={{gap:'16px'}}>
              <FlexLayout gap={1} align="center" style={{padding: '8px 8px 0px'}}>
                {/* <span className={styles.statusDot} /> */}
                <Text styleAs="h3">Guardrail Activity</Text>
              </FlexLayout>
              <StackLayout style={{gap:'4px', borderRadius:'8px'}}>
                {guardrailLogs.map((log, i) => {
                  const s = statusColors[log.status] ?? statusColors['PASSED']
                  return (
                    <div key={i} className={styles.logEntry} style={{ backgroundColor: s.bg }}>
                      <FlexLayout justify="space-between" className={styles.logHeader} >
                        <FlexLayout gap={1} align="center" style={{gap:'4px'}}>
                          <span className={styles.logDot} style={{ backgroundColor: s.dot }} />
                          <span className={styles.logStatus} style={{ color: s.text }}>{log.status}</span>
                        </FlexLayout>
                        <span className={styles.logTimestamp}>{log.timestamp}</span>
                      </FlexLayout>
                      <p className={styles.logQuery}>{log.query}</p>
                      <p className={styles.logReason}>{log.reason}</p>
                    </div>
                  )
                })}
                <Pagination
  currentPage={guardrailPage}
  totalItems={guardrailTotal}
  pageSize={5}
  onPageChange={setGuardrailPage}
/>

              </StackLayout>
              
            </StackLayout>
          </Card>
        </FlexItem>
      </FlexLayout>

      <Card className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <Text styleAs="h3">Per Query Breakdown</Text>
          <Text styleAs="label" className={styles.tableHeaderSubtitle}>Individual scores per evaluated query</Text>
        </div>
        <div className={styles.gridWrap}>
          <AgGridReact
            rowData={results.per_question}
            columnDefs={columnDefs}
            theme={darkTheme}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      </Card>
    </StackLayout>
  )
}