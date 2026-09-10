import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MatchResultPanel } from '../../../components/barter/MatchResultPanel'
import * as useMatchTradeModule from '../../../hooks/useMatchTrade'

const mockSource = {
  id: 'L1',
  sme_name: 'Sumit Exchange Ltd',
  commodity_offered: 'Copper',
  quantity_offered_mt: 50,
  commodity_wanted: 'Aluminum',
  quantity_wanted_mt: 197,
  location_uk: 'London',
}

const mockMatched = {
  id: 'L2',
  sme_name: 'Scottish Metals Ltd',
  commodity_offered: 'Aluminum',
  quantity_offered_mt: 48,
  commodity_wanted: 'Copper',
  quantity_wanted_mt: 50,
  location_uk: 'Glasgow',
  status: 'active' as const,
  user_id: 'user-999',
  created_at: '2026-08-30T21:34:05Z',
}

const mockFairValue = {
  value_a: 677600,
  value_b: 165072,
  delta_usd: 512528,
  delta_pct: 75.6,
  is_fair: false,
  recommendation: 'Adjust quantity to balance the exchange',
}

const baseHookReturn = {
  stage: 'idle' as const,
  source: null,
  matched: null,
  fairValue: null,
  orderRef: '',
  platformFee: 0,
  platformFeeRate: 0.003,
  findMatch: vi.fn(),
  startConfirming: vi.fn(),
  confirmTrade: vi.fn(),
  reset: vi.fn(),
}

describe('MatchResultPanel', () => {
  beforeEach(() => {
    vi.spyOn(useMatchTradeModule, 'useMatchTrade').mockReturnValue(baseHookReturn)
  })

  it('calls findMatch on mount with the given listingId', () => {
    const mockFindMatch = vi.fn()
    vi.spyOn(useMatchTradeModule, 'useMatchTrade').mockReturnValue({
      ...baseHookReturn,
      findMatch: mockFindMatch,
    })

    render(<MatchResultPanel listingId="L1" onClose={vi.fn()} onSuccess={vi.fn()} />)

    expect(mockFindMatch).toHaveBeenCalledWith('L1')
  })

  it('shows a loading message during the loading stage', () => {
    vi.spyOn(useMatchTradeModule, 'useMatchTrade').mockReturnValue({
      ...baseHookReturn,
      stage: 'loading',
    })

    render(<MatchResultPanel listingId="L1" onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByText('Finding a match...')).toBeInTheDocument()
  })

  it('shows a no-match message and Close button in the no-match stage', () => {
    const onClose = vi.fn()
    vi.spyOn(useMatchTradeModule, 'useMatchTrade').mockReturnValue({
      ...baseHookReturn,
      stage: 'no-match',
    })

    render(<MatchResultPanel listingId="L1" onClose={onClose} onSuccess={vi.fn()} />)
    expect(screen.getByText('No matches found for this listing.')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Close'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows an error message in the error stage', () => {
    vi.spyOn(useMatchTradeModule, 'useMatchTrade').mockReturnValue({
      ...baseHookReturn,
      stage: 'error',
    })

    render(<MatchResultPanel listingId="L1" onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
  })

  it('shows match details in the found stage', () => {
    vi.spyOn(useMatchTradeModule, 'useMatchTrade').mockReturnValue({
      ...baseHookReturn,
      stage: 'found',
      source: mockSource,
      matched: mockMatched,
      fairValue: mockFairValue,
    })

    render(<MatchResultPanel listingId="L1" onClose={vi.fn()} onSuccess={vi.fn()} />)

    expect(screen.getByText('Match Found')).toBeInTheDocument()
    expect(screen.getByText('Scottish Metals Ltd')).toBeInTheDocument()
    expect(screen.getByText('Aluminum')).toBeInTheDocument()
    expect(screen.getByText('£677,600')).toBeInTheDocument()
    expect(screen.getByText('Initiate Trade')).toBeInTheDocument()
  })

  it('calls startConfirming when Initiate Trade is clicked', () => {
    const mockStartConfirming = vi.fn()
    vi.spyOn(useMatchTradeModule, 'useMatchTrade').mockReturnValue({
      ...baseHookReturn,
      stage: 'found',
      source: mockSource,
      matched: mockMatched,
      fairValue: mockFairValue,
      startConfirming: mockStartConfirming,
    })

    render(<MatchResultPanel listingId="L1" onClose={vi.fn()} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByText('Initiate Trade'))

    expect(mockStartConfirming).toHaveBeenCalledOnce()
  })

  it('shows the settlement line and confirm actions in the confirming stage', () => {
    vi.spyOn(useMatchTradeModule, 'useMatchTrade').mockReturnValue({
      ...baseHookReturn,
      stage: 'confirming',
      source: mockSource,
      matched: mockMatched,
      fairValue: mockFairValue,
    })

    render(<MatchResultPanel listingId="L1" onClose={vi.fn()} onSuccess={vi.fn()} />)

    expect(screen.getByText('Confirm Trade Initiation')).toBeInTheDocument()
    expect(
      screen.getByText('Scottish Metals Ltd pays Sumit Exchange Ltd £512,528 to balance the exchange')
    ).toBeInTheDocument()
    expect(screen.getByText('Confirm & Send to Escrow')).toBeInTheDocument()
  })

  it('calls confirmTrade with onSuccess when Confirm & Send to Escrow is clicked', () => {
    const mockConfirmTrade = vi.fn()
    const onSuccess = vi.fn()
    vi.spyOn(useMatchTradeModule, 'useMatchTrade').mockReturnValue({
      ...baseHookReturn,
      stage: 'confirming',
      source: mockSource,
      matched: mockMatched,
      fairValue: mockFairValue,
      confirmTrade: mockConfirmTrade,
    })

    render(<MatchResultPanel listingId="L1" onClose={vi.fn()} onSuccess={onSuccess} />)
    fireEvent.click(screen.getByText('Confirm & Send to Escrow'))

    expect(mockConfirmTrade).toHaveBeenCalledWith(onSuccess)
  })

  it('disables Cancel and Confirm buttons and shows "Sending..." during submitting', () => {
    vi.spyOn(useMatchTradeModule, 'useMatchTrade').mockReturnValue({
      ...baseHookReturn,
      stage: 'submitting',
      source: mockSource,
      matched: mockMatched,
      fairValue: mockFairValue,
    })

    render(<MatchResultPanel listingId="L1" onClose={vi.fn()} onSuccess={vi.fn()} />)

    expect(screen.getByText('Sending...')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeDisabled()
    expect(screen.getByText('Sending...')).toBeDisabled()
  })

  it('shows the success message with order ref in the success stage', () => {
    vi.spyOn(useMatchTradeModule, 'useMatchTrade').mockReturnValue({
      ...baseHookReturn,
      stage: 'success',
      matched: mockMatched,
      orderRef: 'order-abc123',
    })

    render(<MatchResultPanel listingId="L1" onClose={vi.fn()} onSuccess={vi.fn()} />)

    expect(screen.getByText('Trade Initiated Successfully')).toBeInTheDocument()
    expect(screen.getByText('order-abc123')).toBeInTheDocument()
  })

  it('renders nothing if matched or fairValue is missing outside of known stages', () => {
    vi.spyOn(useMatchTradeModule, 'useMatchTrade').mockReturnValue({
      ...baseHookReturn,
      stage: 'confirming',
      source: mockSource,
      matched: null,
      fairValue: null,
    })

    const { container } = render(<MatchResultPanel listingId="L1" onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })
})