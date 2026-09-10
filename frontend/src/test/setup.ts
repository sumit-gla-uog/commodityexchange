import '@testing-library/jest-dom/vitest'
if (typeof window !== 'undefined' && !window.CSS) {
  // @ts-ignore
  window.CSS = {}
}
if (typeof window !== 'undefined' && !window.CSS.supports) {
  window.CSS.supports = () => false
}