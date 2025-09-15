
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

function ClerkWithRouter() {
  const navigate = useNavigate()
  
  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-slate-500 hover:bg-slate-400 text-sm normal-case'
        }
      }}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <App />
      <Toaster />
    </ClerkProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ClerkWithRouter />
  </BrowserRouter>
)


// impact of ai in the software industry 
