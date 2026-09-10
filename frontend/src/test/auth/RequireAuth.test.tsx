import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RequireAuth } from '../../auth/RequireAuth'

const renderWithRouter = (initialRoute = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<div>Landing Page</div>} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <div>Protected Dashboard Content</div>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>
  )

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the protected content when a token exists', () => {
    localStorage.setItem('token', 'fake-jwt-token')
    renderWithRouter()

    expect(screen.getByText('Protected Dashboard Content')).toBeInTheDocument()
  })

  it('redirects to the landing page when no token exists', () => {
    renderWithRouter()

    expect(screen.getByText('Landing Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Dashboard Content')).not.toBeInTheDocument()
  })
})