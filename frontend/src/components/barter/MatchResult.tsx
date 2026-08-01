import { Text } from '@salt-ds/core'

interface MatchResultProps {
  result: any
}

export const MatchResult = ({ result }: MatchResultProps) => {
  if (!result || result.total_matches === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-red-700 p-6">
        <Text styleAs="h3" className="text-red-400 font-bold">
          No Matches Found
        </Text>
        <Text className="text-gray-400 mt-2">
          No active listings match your requirements at this time.
        </Text>
      </div>
    )
  }

  const match = result.matches[0]
  const source = result.source_listing
  const fv = match.fair_value

  return (
    <div className="bg-gray-800 rounded-lg border border-green-700 p-6">
      <Text styleAs="h3" className="text-green-400 font-bold mb-4">
        Match Found
      </Text>

      {/* Match Details */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Your Listing */}
        <div className="bg-gray-900 rounded border border-gray-600 p-4">
          <Text styleAs="label" className="text-gray-400 text-xs uppercase mb-2 block">
            Your Listing
          </Text>
          <Text className="text-white font-semibold">{source.sme_name}</Text>
          <Text className="text-gray-300 text-sm">
            Offering: {source.quantity_offered_mt}mt {source.commodity_offered}
          </Text>
          <Text className="text-gray-300 text-sm">
            Wanting: {source.quantity_wanted_mt}mt {source.commodity_wanted}
          </Text>
          <Text className="text-gray-500 text-xs">{source.location_uk}</Text>
        </div>

        {/* Matched Listing */}
        <div className="bg-gray-900 rounded border border-gray-600 p-4">
          <Text styleAs="label" className="text-gray-400 text-xs uppercase mb-2 block">
            Matched With
          </Text>
          <Text className="text-white font-semibold">{match.matched_listing.sme_name}</Text>
          <Text className="text-gray-300 text-sm">
            Offering: {match.matched_listing.quantity_offered_mt}mt {match.matched_listing.commodity_offered}
          </Text>
          <Text className="text-gray-300 text-sm">
            Wanting: {match.matched_listing.quantity_wanted_mt}mt {match.matched_listing.commodity_wanted}
          </Text>
          <Text className="text-gray-500 text-xs">{match.matched_listing.location_uk}</Text>
        </div>
      </div>

      {/* Fair Value Summary */}
      {fv && (
        <div className="bg-gray-900 rounded border border-blue-700 p-4">
          <Text styleAs="label" className="text-blue-400 text-xs uppercase mb-3 block">
            Simulated Settlement Summary
          </Text>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Text className="text-gray-400 text-xs">Your Value</Text>
              <Text className="text-white font-bold">${fv.value_a.toLocaleString()}</Text>
            </div>
            <div>
              <Text className="text-gray-400 text-xs">Match Value</Text>
              <Text className="text-white font-bold">${fv.value_b.toLocaleString()}</Text>
            </div>
            <div>
              <Text className="text-gray-400 text-xs">Delta</Text>
              <Text className={`font-bold ${fv.is_fair ? 'text-green-400' : 'text-amber-400'}`}>
                ${fv.delta_usd.toLocaleString()} ({fv.delta_pct}%)
              </Text>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <Text className={`text-sm font-medium ${fv.is_fair ? 'text-green-400' : 'text-amber-400'}`}>
              {fv.is_fair ? 'Fair Exchange' : fv.recommendation}
            </Text>
          </div>
        </div>
      )}
    </div>
  )
}