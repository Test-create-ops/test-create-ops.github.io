import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import { CLERK_PUBLISHABLE_KEY } from './lib/config'
import './styles.css'

if (!CLERK_PUBLISHABLE_KEY.startsWith('pk_')) {
  console.warn('⚠ Incolla la tua Clerk publishable key in src/lib/config.ts')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl={window.location.origin}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
