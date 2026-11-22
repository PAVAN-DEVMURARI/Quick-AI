import { useNavigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from '../App'
import { Toaster } from 'react-hot-toast'

export default function ClerkWithRouter() {
  const navigate = useNavigate()

  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
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
