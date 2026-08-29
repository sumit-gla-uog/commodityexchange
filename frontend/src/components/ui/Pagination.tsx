import styles from './Pagination.module.css'

interface PaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export const Pagination = ({ currentPage, totalItems, pageSize, onPageChange }: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  if (totalPages <= 1) return null

  return (
    <div className={styles.wrap}>
      <span className={styles.info}>
        Page {currentPage} of {totalPages} · {totalItems} total
      </span>
      <div className={styles.controls}>
        <button
          className={styles.pageButton}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹ Prev
        </button>
        <button
          className={styles.pageButton}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next ›
        </button>
      </div>
    </div>
  )
}