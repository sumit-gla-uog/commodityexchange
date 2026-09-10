import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent,act } from '@testing-library/react'
import { LandingPage } from '../../../pages/LandingPage/LandingPage'
import * as priceServiceModule from '../../../api/priceService'
import type { CommodityPrice } from '../../../types/commodity'


vi.mock('../../../pages/LoginPage/LoginForm', () => ({
  LoginForm: ({ onSwitchToRegister }: any) => (
    <div data-testid="login-form">
      <button onClick={onSwitchToRegister}>Switch to Register</button>
    </div>
  ),
}))

vi.mock('../../../pages/RegisterPage/RegisterForm', () => ({
  RegisterForm: ({ onSwitchToLogin }: any) => (
    <div data-testid="register-form">
      <button onClick={onSwitchToLogin}>Switch to Login</button>
    </div>
  ),
}))

vi.mock('../../../pages/LandingPage/MarketPreview', () => ({
  MarketPreview: ({ onLoginClick }: any) => (
    <div data-testid="market-preview">
      <button onClick={onLoginClick}>Login from Market</button>
    </div>
  ),
}))

vi.mock('../../../pages/LandingPage/BarterPreview', () => ({
  BarterPreview: ({ onLoginClick }: any) => <div data-testid="barter-preview" onClick={onLoginClick} />,
}))

vi.mock('../../../pages/LandingPage/AiIntelligencePreview', () => ({
  AiIntelligencePreview: ({ onLoginClick }: any) => <div data-testid="ai-preview" onClick={onLoginClick} />,
}))

vi.mock('../../../pages/LandingPage/HelpPreview', () => ({
  HelpPreview: ({ onLoginClick }: any) => <div data-testid="help-preview" onClick={onLoginClick} />,
}))

const makeCommodity = (overrides: Partial<CommodityPrice> = {}): CommodityPrice => ({
  name: 'Copper',
  category: 'Metals',
  latest_price: 13552,
  latest_date: '2026-03',
  unit: 'USD per metric ton',
  monthly_change: 0.07,
  trend: 'up',
  chart_data: [],
  ...overrides,
})

describe('LandingPage', () => {
  beforeEach(() => {
    vi.spyOn(priceServiceModule, 'usePrices').mockReturnValue({
      commodities: [makeCommodity({ name: 'Copper' })],
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the LoginForm by default', () => {
    render(<LandingPage />)
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.queryByTestId('register-form')).not.toBeInTheDocument()
  })

  it('switches to RegisterForm when the navbar Register button is clicked', () => {
    render(<LandingPage />)
    fireEvent.click(screen.getByText('Register'))
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
  })

  it('switches from LoginForm to RegisterForm via the form link', () => {
    render(<LandingPage />)
    fireEvent.click(screen.getByText('Switch to Register'))
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
  })

  it('switches from RegisterForm back to LoginForm via the form link', () => {
    render(<LandingPage />)
    fireEvent.click(screen.getByText('Register'))
    fireEvent.click(screen.getByText('Switch to Login'))
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })

  it('shows MarketPreview when "Market Data" is clicked', () => {
    render(<LandingPage />)
    fireEvent.click(screen.getByText('Market Data'))
    expect(screen.getByTestId('market-preview')).toBeInTheDocument()
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument()
  })

  it('shows BarterPreview when "Barter Exchange" is clicked', () => {
    render(<LandingPage />)
    fireEvent.click(screen.getByText('Barter Exchange'))
    expect(screen.getByTestId('barter-preview')).toBeInTheDocument()
  })

  it('shows AiIntelligencePreview when "AI Intelligence" is clicked', () => {
    render(<LandingPage />)
    fireEvent.click(screen.getByText('AI Intelligence'))
    expect(screen.getByTestId('ai-preview')).toBeInTheDocument()
  })

  it('shows HelpPreview when "Help" is clicked', () => {
    render(<LandingPage />)
    fireEvent.click(screen.getByText('Help'))
    expect(screen.getByTestId('help-preview')).toBeInTheDocument()
  })

  it('returns to the auth view when the logo is clicked', () => {
    render(<LandingPage />)
    fireEvent.click(screen.getByText('Market Data'))
    expect(screen.getByTestId('market-preview')).toBeInTheDocument()

    fireEvent.click(screen.getByText('CommodEx'))
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })

  it('returns to the auth view when a preview\'s onLoginClick is triggered', () => {
    render(<LandingPage />)
    fireEvent.click(screen.getByText('Market Data'))
    fireEvent.click(screen.getByText('Login from Market'))
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })

  it('renders carousel stats from commodities data', () => {
  render(<LandingPage />)
  expect(screen.getAllByText('Copper').length).toBeGreaterThan(0)
})

  it('rotates the carousel every 1.5 seconds when there are more commodities than STATS_PER_VIEW', () => {
  vi.useFakeTimers()

  const manyCommodities = Array.from({ length: 8 }, (_, i) =>
    makeCommodity({ name: `Commodity ${i}` })
  )
  vi.spyOn(priceServiceModule, 'usePrices').mockReturnValue({
    commodities: manyCommodities,
    isLoading: false,
    isError: false,
    mutate: vi.fn(),
  })

  render(<LandingPage />)
  expect(screen.getByText('Commodity 0')).toBeInTheDocument()

  act(() => {
    vi.advanceTimersByTime(1500)
  })

  expect(screen.getByText('Commodity 5')).toBeInTheDocument()
})

 it('does not rotate the carousel when commodities fit within STATS_PER_VIEW', () => {
  vi.useFakeTimers()

  render(<LandingPage />)

  act(() => {
    vi.advanceTimersByTime(5000)
  })

  expect(screen.getAllByText('Copper').length).toBeGreaterThan(0)
})
})