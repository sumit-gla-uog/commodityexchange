import { Card, Text } from '@salt-ds/core'
import { ArrowUpIcon, ArrowDownIcon } from '@salt-ds/icons'
import type { CommodityPrice } from '../../types/commodity'
import styles from './PriceCard.module.css'

interface PriceCardProps {
  commodity: CommodityPrice
  onClick: () => void
  isSelected: boolean
}

export const PriceCard = ({ commodity, onClick, isSelected }: PriceCardProps) => {
  const isUp = commodity.trend === 'up'

  return (
    <div
      onClick={onClick}
      className={`${styles.priceCard} ${isSelected ? styles.selected : ''}`}
    >
      <div className={styles.header}>
        <span className={styles.category}>{commodity.category}</span>
        <span className={`${styles.change} ${isUp ? styles.up : styles.down}`}>
          {isUp ? <ArrowUpIcon size={1} /> : <ArrowDownIcon size={1} />}
          {Math.abs(commodity.monthly_change)}%
        </span>
      </div>
      <div className={styles.nameWrap}>
        <Text styleAs="label" className="text-gray-300 font-medium">
          {commodity.name}
        </Text>
      </div>
      <div className={styles.priceWrap}>
        <Text styleAs="h3" className="text-white font-bold">
          ${commodity.latest_price.toLocaleString()}
        </Text>
      </div>
      <Text styleAs="label" className="text-gray-500 text-xs">
        {commodity.unit}
      </Text>
    </div>
  )
}