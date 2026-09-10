import { useState } from 'react'
import { useCreateListing } from '../../hooks/useCreateListing'
import styles from './CreateListingDialog.module.css'

interface CreateListingDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}



export const CreateListingDialog = ({ open, onClose, onSuccess }: CreateListingDialogProps) => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const [form, setForm] = useState({
    commodity_offered: '',
    quantity_offered_mt: '',
    commodity_wanted: '',
    quantity_wanted_mt: '',
    location_uk: '',
  })
  const { createListing, submitting } = useCreateListing()

  if (!open) return null

  const handleSubmit = async () => {
    if (!form.commodity_offered || !form.quantity_offered_mt || !form.commodity_wanted || !form.quantity_wanted_mt || !form.location_uk) return

    const success = await createListing({
      sme_name: currentUser.sme_name,
      commodity_offered: form.commodity_offered,
      quantity_offered_mt: Number(form.quantity_offered_mt),
      commodity_wanted: form.commodity_wanted,
      quantity_wanted_mt: Number(form.quantity_wanted_mt),
      location_uk: form.location_uk,
    })

    if (success) {
      setForm({ commodity_offered: '', quantity_offered_mt: '', commodity_wanted: '', quantity_wanted_mt: '', location_uk: '' })
      onSuccess()
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>List Surplus Commodity</span>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label}>Offering Commodity</label>
            <input
              className={styles.input}
              value={form.commodity_offered}
              onChange={(e) => setForm({ ...form, commodity_offered: e.target.value })}
              placeholder="e.g. Aluminium"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Quantity (mt)</label>
            <input
              type="number"
              className={styles.input}
              value={form.quantity_offered_mt}
              onChange={(e) => setForm({ ...form, quantity_offered_mt: e.target.value })}
              placeholder="e.g. 150"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Location (UK)</label>
            <input
              className={styles.input}
              value={form.location_uk}
              onChange={(e) => setForm({ ...form, location_uk: e.target.value })}
              placeholder="e.g. Sheffield"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Wanted In Return</label>
            <input
              className={styles.input}
              value={form.commodity_wanted}
              onChange={(e) => setForm({ ...form, commodity_wanted: e.target.value })}
              placeholder="e.g. Copper"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Quantity Wanted (mt)</label>
            <input
              type="number"
              className={styles.input}
              value={form.quantity_wanted_mt}
              onChange={(e) => setForm({ ...form, quantity_wanted_mt: e.target.value })}
              placeholder="e.g. 25"
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button className={styles.postButton} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Posting...' : ' Post Listing'}
          </button>
        </div>
      </div>
    </div>
  )
}