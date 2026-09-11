import { useState } from 'react'
import { Text } from '@salt-ds/core'
import type { Order } from '../../types/commodity'
import { useUpdateOrderNote } from '../../hooks/useUpdateOrderNote'
import styles from './OrderCard.module.css'
import { AddDocumentIcon } from '@salt-ds/icons'

interface OrderCardProps {
  order: Order
  onNoteUpdated?: () => void
}

const statusLabel: Record<string, string> = {
  pending: 'In Progress',
  settled: 'Completed',
  cancelled: 'Cancelled',
}

const statusClass: Record<string, string> = {
  pending: styles.statusPending,
  settled: styles.statusSettled,
  cancelled: styles.statusCancelled,
}

export const OrderCard = ({ order, onNoteUpdated }: OrderCardProps) => {
  //   const [note, setNote] = useState(order.note ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(order.note ?? '')
  const { updateNote, submitting } = useUpdateOrderNote()

  const settlementLine = () => {
    if (order.fair_value_delta > 0) {
      return `${order.party_b_name} pays ${order.party_a_name} £${Math.abs(order.fair_value_delta).toLocaleString()}`
    }
    if (order.fair_value_delta < 0) {
      return `${order.party_a_name} pays ${order.party_b_name} £${Math.abs(order.fair_value_delta).toLocaleString()}`
    }
    return 'Balanced, no additional payment'
  }

  const handleSave = async () => {
    const success = await updateNote(order.id, draft)
    if (success) {
      setIsEditing(false)
      onNoteUpdated?.()
    }
  }

  const handleCancel = () => {
    setDraft(order.note ?? '')
    setIsEditing(false)
  }


  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <Text className={styles.matchId}>{order.id.slice(0, 8)}</Text>
        <span className={`${styles.statusBadge} ${statusClass[order.status] ?? ''}`}>
          {statusLabel[order.status] ?? order.status}
        </span>
        <Text className={styles.updatedDate}>
          Updated {new Date(order.updated_at ?? order.created_at).toLocaleString()}
        </Text>
      </div>

      <Text styleAs="h4" className={styles.partyName}>{order.party_b_name}</Text>

      <div className={styles.offerRow}>
        <div className={styles.offerBox}>
          <Text className={styles.label}>You Offered</Text>
          <Text className={styles.value}>{order.party_a_commodity} {order.party_a_quantity}t</Text>
        </div>
        <div className={styles.offerBox}>
          <Text className={styles.label}>You Received</Text>
          <Text className={styles.value}>{order.party_b_commodity} {order.party_b_quantity}t</Text>
        </div>
        <div className={styles.offerBox}>
          <Text className={styles.label}>Escrow</Text>
          <Text className={styles.value}>{order.escrow_status ?? '-'}</Text>
        </div>
        <div className={styles.offerBox}>
          <Text className={styles.label}>VAT Treatment</Text>
          <Text className={styles.value}>{order.vat_treatment ?? '—'}</Text>
        </div>
      </div>

      <div className={styles.numbersRow}>
        <div className={styles.numberBox}>
          <Text className={styles.label}>Fair Value</Text>
          <Text className={styles.value}>£{order.fair_value?.toLocaleString() ?? '—'}</Text>
        </div>
        <div className={styles.numberBox}>
          <Text className={styles.label}>Delta</Text>
          <Text className={order.fair_value_delta >= 0 ? styles.deltaPositive : styles.deltaNegative}>
            {order.fair_value_delta >= 0 ? '+' : ''}£{order.fair_value_delta.toLocaleString()}
          </Text>
        </div>
        <div className={styles.numberBox}>
          <Text className={styles.label}>Platform Fee</Text>
          <Text className={styles.value}>£{order.platform_fee?.toLocaleString() ?? '—'}</Text>
        </div>
      </div>

      <Text className={styles.settlementLine}>{settlementLine()}</Text>

      {isEditing ? (
        <div className={styles.noteEditRow}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a note..." className={styles.noteInput} disabled={submitting} />
          <button onClick={handleSave} className={styles.noteSaveButton} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
          <button onClick={handleCancel} className={styles.noteCancelButton} disabled={submitting}>Cancel</button>
        </div>
      ) : order.note ? (
        <div className={styles.noteRow} onClick={() => setIsEditing(true)}>
          <Text className={styles.noteText}>{order.note}</Text>
          <span className={styles.editIcon}>✎</span>
        </div>
      ) : (
        <button onClick={() => setIsEditing(true)} className={styles.addNoteButton}><AddDocumentIcon /> Add note</button>
      )}
    </div>
  )
}