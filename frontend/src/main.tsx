import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SaltProvider } from '@salt-ds/core'
// import '@salt-ds/core/styles.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SaltProvider theme="dark" density="medium" mode="dark">
      <div style={{ '--salt-size-unit': '4px' } as React.CSSProperties}>
        <App />
      </div>

    </SaltProvider>
  </StrictMode>,
)