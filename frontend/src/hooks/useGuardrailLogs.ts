import { useState, useEffect, useCallback } from 'react'
import { BASE_URL } from '../api/client'

interface GuardrailLog {
  status: 'BLOCKED' | 'PASSED' | 'FLAGGED'
  query: string
  reason: string
  timestamp: string
}

interface UseGuardrailLogsResult {
  logs: GuardrailLog[]
  total: number
  page: number
  setPage: (page: number) => void
  isLoading: boolean
}

export const useGuardrailLogs = (pageSize = 5): UseGuardrailLogsResult => {
  const [logs, setLogs] = useState<GuardrailLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const fetchLogs = useCallback(() => {
    setIsLoading(true)
    fetch(`${BASE_URL}/api/guardrails/log?page=${page}&page_size=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs)
        setTotal(data.total)
      })
      .catch(() => {
        setLogs([])
        setTotal(0)
      })
      .finally(() => setIsLoading(false))
  }, [page, pageSize])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { logs, total, page, setPage, isLoading }
}