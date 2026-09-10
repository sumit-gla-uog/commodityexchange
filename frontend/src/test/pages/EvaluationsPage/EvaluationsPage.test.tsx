import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EvaluationsPage } from '../../../pages/Evaluations/EvaluationsPage'
import * as guardrailHookModule from '../../../hooks/useGuardrailLogs'

vi.mock('ag-grid-react', () => ({
  AgGridReact: () => <div data-testid="ag-grid" />,
}))

vi.mock('highcharts-react-official', () => ({
  default: { default: () => <div data-testid="highcharts-chart" /> },
}))

vi.mock('../../../components/ui/Pagination', () => ({
  Pagination: ({ currentPage, onPageChange }: any) => (
    <div data-testid="pagination">
      <span>Page {currentPage}</span>
      <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
}))

const mockEvalResults = {
  faithfulness: 0.61,
  answer_relevancy: 0.66,
  total_questions: 12,
  per_question: [
    { question: 'What is copper trading at?', faithfulness: 0.6, answer_relevancy: 0.65 },
  ],
}

describe('EvaluationsPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockEvalResults),
    }))

    vi.spyOn(guardrailHookModule, 'useGuardrailLogs').mockReturnValue({
      logs: [
        { status: 'BLOCKED', query: 'What is Bitcoin price?', reason: 'Not a commodity', timestamp: '2026-09-10T11:47:03+00:00' },
        { status: 'PASSED', query: 'Copper price trend?', reason: 'Valid commodity query', timestamp: '2026-09-10T11:47:19+00:00' },
      ],
      total: 2,
      page: 1,
      setPage: vi.fn(),
      isLoading: false,
    })
  })

  it('shows a loading message before eval results arrive', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    render(<EvaluationsPage />)
    expect(screen.getByText('Loading evaluation results...')).toBeInTheDocument()
  })

  it('renders score cards once results load', async () => {
    render(<EvaluationsPage />)
    expect(await screen.findByText('0.61')).toBeInTheDocument()
    expect(screen.getByText('0.66')).toBeInTheDocument()
  })

  it('renders guardrail log entries from the hook', async () => {
    render(<EvaluationsPage />)
    await screen.findByText('0.61')

    expect(screen.getByText('What is Bitcoin price?')).toBeInTheDocument()
    expect(screen.getByText('Copper price trend?')).toBeInTheDocument()
    expect(screen.getByText('BLOCKED')).toBeInTheDocument()
    expect(screen.getByText('PASSED')).toBeInTheDocument()
  })

  it('forwards page changes from Pagination to the hook', async () => {
    const setPage = vi.fn()
    vi.spyOn(guardrailHookModule, 'useGuardrailLogs').mockReturnValue({
      logs: [],
      total: 12,
      page: 1,
      setPage,
      isLoading: false,
    })

    render(<EvaluationsPage />)
    await screen.findByText('0.61')

    fireEvent.click(screen.getByText('Next'))
    expect(setPage).toHaveBeenCalledWith(2)
  })

  it('renders the per-query breakdown table', async () => {
    render(<EvaluationsPage />)
    await screen.findByText('0.61')
    expect(screen.getByTestId('ag-grid')).toBeInTheDocument()
  })
})