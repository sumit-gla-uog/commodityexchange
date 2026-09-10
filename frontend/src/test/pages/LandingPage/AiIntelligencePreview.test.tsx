import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AiIntelligencePreview } from '../../../pages/LandingPage/AiIntelligencePreview'

describe('AiIntelligencePreview', () => {
  it('renders the heading and description', () => {
    render(<AiIntelligencePreview onLoginClick={vi.fn()} />)
    expect(screen.getByText('AI Commodity Intelligence')).toBeInTheDocument()
    expect(
      screen.getByText('Ask questions about pricing and procurement, grounded in live data and historical trends')
    ).toBeInTheDocument()
  })

  it('renders all sample questions', () => {
    render(<AiIntelligencePreview onLoginClick={vi.fn()} />)

    expect(screen.getByText('Should I buy copper now or wait for prices to drop?')).toBeInTheDocument()
    expect(screen.getByText('What is the current price trend for wheat?')).toBeInTheDocument()
    expect(screen.getByText('Is now a good time to procure aluminium for manufacturing?')).toBeInTheDocument()
  })

  it('renders the CTA card and calls onLoginClick when clicked', () => {
    const onLoginClick = vi.fn()
    render(<AiIntelligencePreview onLoginClick={onLoginClick} />)

    expect(screen.getByText('Get grounded procurement advice')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Login / Register'))
    expect(onLoginClick).toHaveBeenCalledOnce()
  })
})