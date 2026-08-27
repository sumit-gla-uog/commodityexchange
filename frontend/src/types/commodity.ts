// Commodity price data from World Bank Pink Sheet
export interface CommodityPrice {
  name: string
  category: 'Metals' | 'Energy' | 'Agriculture'
  latest_price: number
  latest_date: string
  unit: string
  monthly_change: number
  trend: 'up' | 'down'
  chart_data: ChartDataPoint[]
}

export interface ChartDataPoint {
  date: string
  price: number
}

// Barter listing
export interface BarterListing {
  id: string
  sme_name: string
  commodity_offered: string
  quantity_offered_mt: number
  commodity_wanted: string
  quantity_wanted_mt: number
  location_uk: string
  status: 'active' | 'matched' | 'expired'
  created_at: string
}
export interface Order {
  id: string
  party_a_name: string
  party_a_commodity: string
  party_a_quantity: number
  party_b_name: string
  party_b_commodity: string
  party_b_quantity: number
  fair_value_delta: number
  status: string
  created_at: string
}

// Barter match result
export interface MatchResult {
  matched_listing: BarterListing
  fair_value: FairValue
}

export interface FairValue {
  value_a: number
  value_b: number
  delta_usd: number
  delta_pct: number
  is_fair: boolean
  recommendation: string
}

// Chat
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

export interface ChatRequest {
  query: string
}

export interface ChatResponse {
  query: string
  answer: string
  sources: string[]
}

interface Listing {
  id: string
  commodity: string
  quantity: string
  location: string
  wantedInReturn: string
  sme_name?: string
}