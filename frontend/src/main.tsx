import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SaltProvider } from '@salt-ds/core'
// import '@salt-ds/core/styles.css'
// import '@salt-ds/theme/index.css'
import '@salt-ds/core/css/salt-core.css'
import './index.css'
import App from './App.tsx'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <SaltProvider theme="light" density="medium" mode="light">
      {/* <div style={{ '--salt-size-unit': '4px' } as React.CSSProperties}> */}
        <App />
      {/* </div> */}

    </SaltProvider>
  // </StrictMode>,
)