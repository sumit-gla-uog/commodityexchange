import { useState } from 'react'
import { Text } from '@salt-ds/core'
import { ListingForm } from '../../components/barter/ListingForm'
import { ListingsTable } from '../../components/barter/ListingTable'
import { MatchResult } from '../../components/barter/MatchResult'

export const BarterPage = () => {
  const [matchResult, setMatchResult] = useState<any>(null)

  return (
    <div className="flex flex-col gap-6">
      <Text styleAs="h2" className="text-white font-bold">
        Barter Matching Engine
      </Text>

      <div className="grid grid-cols-2 gap-6">
        {/* Left — Listing Form */}
        <ListingForm />

        {/* Right — Active Listings */}
        <ListingsTable onMatch={setMatchResult} />
      </div>

      {/* Match Result */}
      {matchResult && <MatchResult result={matchResult} />}
    </div>
  )
}