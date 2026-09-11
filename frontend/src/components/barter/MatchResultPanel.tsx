import { useEffect } from 'react'
import { Text, Button, FlexLayout } from '@salt-ds/core'
import { useMatchTrade } from '../../hooks/useMatchTrade'
import styles from './MatchResultPanel.module.css'
import { SwapIcon } from '@salt-ds/icons'

interface MatchResultPanelProps {
  listingId: string
  onClose: () => void
  onSuccess: () => void
}

export const MatchResultPanel = ({ listingId, onClose, onSuccess }: MatchResultPanelProps) => {
  const {
    stage,
    source,
    matched,
    fairValue,
    orderRef,
    platformFee,
    platformFeeRate,
    findMatch,
    startConfirming,
    confirmTrade,
  } = useMatchTrade()

  useEffect(() => {
    findMatch(listingId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId])

  const settlementLine = () => {
    if (!fairValue || !source || !matched) return ''
    if (fairValue.delta_usd > 0) return `${matched.sme_name} pays ${source.sme_name} £${Math.abs(fairValue.delta_usd).toLocaleString()} to balance the exchange`
    if (fairValue.delta_usd < 0) return `${source.sme_name} pays ${matched.sme_name} £${Math.abs(fairValue.delta_usd).toLocaleString()} to balance the exchange`
    return 'Perfectly balanced, no additional payment needed'
  }

  if (stage === 'loading') {
    return (
      <div className={styles.panel}>
        <Text className={styles.statusText}>Finding a match...</Text>
      </div>
    )
  }

  if (stage === 'no-match') {
    return (
      <div className={`${styles.panel} ${styles.centerRow}`}>
        <Text className={styles.statusText}>No matches found for this listing.</Text>
        <Button onClick={onClose}>Close</Button>
      </div>
    )
  }

  if (stage === 'error') {
    return (
      <div className={`${styles.panel} ${styles.centerRow}`}>
        <Text className={styles.statusText}>Something went wrong. Please try again.</Text>
        <Button onClick={onClose}>Close</Button>
      </div>
    )
  }

  if (stage === 'success') {
    return (
      <div className={styles.successBox}>
        <div className={styles.successRow}>
          <span className={styles.successIcon}>✓</span>
          <div className={styles.fieldGroup}>
            <Text className={styles.successTitle}>Trade Initiated Successfully</Text>
            <Text className={styles.successDetail}>
              Ref <strong>{orderRef}</strong> · {matched?.sme_name} notified · Escrow active · 48hr settlement.
            </Text>
          </div>
        </div>
        <Button onClick={onClose}>Close</Button>
      </div>
    )
  }

  if (!matched || !fairValue) return null

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.dot} />
        <Text className={styles.headerTitle}>Match Found</Text>
      </div>

      <div className={styles.grid}>
        <div className={styles.fieldGroup}>
          <Text className={styles.label}>Matched SME</Text>
          <Text className={styles.value}>{matched.sme_name}</Text>
          <Text className={styles.subvalue}>{matched.location_uk}</Text>
        </div>
        <div className={styles.fieldGroup}>
          <Text className={styles.label}>They Offer</Text>
          <Text className={styles.value}>{matched.commodity_offered}</Text>
          <Text className={styles.subvalue}>{matched.quantity_offered_mt}t</Text>
        </div>
        <div className={styles.fieldGroup}>
          <Text className={styles.label}>They Want</Text>
          <Text className={styles.value}>{matched.commodity_wanted}</Text>
          <Text className={styles.subvalue}>{matched.quantity_wanted_mt}t</Text>
        </div>
        <div className={styles.fieldGroup}>
          <Text className={styles.label}>Fair Value</Text>
          <Text className={styles.valueGreen}>£{fairValue.value_a.toLocaleString()}</Text>
          <Text className={styles.subvalue}>Settlement estimate</Text>
        </div>
      </div>

      {stage === 'found' && (
        <div className={styles.actionsRow}>
          <Text className={styles.footnote}>Settlement via CommodEx Escrow · HMRC-compliant · 48hr fulfilment</Text>
          <Button onClick={startConfirming} className={styles.initiateButton}>
            <FlexLayout style={{ gap: "16px" }}><SwapIcon></SwapIcon> <Text>Initiate Trade</Text></FlexLayout>
          </Button>
        </div>
      )}

      {(stage === 'confirming' || stage === 'submitting') && (
        <div className={styles.confirmBox}>
          <Text className={styles.confirmTitle}>Confirm Trade Initiation</Text>
          <Text className={styles.confirmSubtitle}>
            Barter trade with <strong>{matched.sme_name}</strong>. Fair value: <span className={styles.valueGreen}>£{fairValue.value_a.toLocaleString()}</span>.
          </Text>
          {settlementLine() && <Text className={styles.settlementLine}>{settlementLine()}</Text>}

          <div className={styles.confirmFieldsRow}>
            <div className={styles.fieldGroup}>
              <Text className={styles.label}>Platform Fee</Text>
              <Text className={styles.value}>{(platformFeeRate * 100).toFixed(2)}%</Text>
            </div>
            <div className={styles.fieldGroup}>
              <Text className={styles.label}>Escrow Hold</Text>
              <Text className={styles.value}>48 hrs</Text>
            </div>
            <div className={styles.fieldGroup}>
              <Text className={styles.label}>VAT Treatment</Text>
              <Text className={styles.value}>Zero-rated</Text>
            </div>
          </div>

          <div className={styles.confirmActions}>
            <Button onClick={onClose} disabled={stage === 'submitting'}>Cancel</Button>
            <Button onClick={() => confirmTrade(onSuccess)} disabled={stage === 'submitting'} className={styles.confirmButton}>
              {stage === 'submitting' ? 'Sending...' : 'Confirm & Send to Escrow'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}