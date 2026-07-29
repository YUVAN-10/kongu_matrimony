import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'

const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !import.meta.env[key])

const root = createRoot(document.getElementById('root'))

if (missingEnvVars.length > 0) {
  // Firebase's getAuth() throws synchronously on an invalid/missing API key,
  // which would otherwise crash the whole module graph (App -> AuthContext ->
  // firebase.js) before React ever renders, producing a blank white screen
  // with no visible error. Catch the misconfiguration here instead.
  root.render(
    <StrictMode>
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center text-foreground">
        <div className="max-w-md space-y-2">
          <h1 className="font-heading text-xl font-semibold text-primary">
            Firebase is not configured
          </h1>
          <p className="text-sm text-muted-foreground">
            Copy <code>.env.example</code> to <code>.env.local</code>, fill in your Firebase
            project values, then restart the dev server.
          </p>
          <p className="text-xs text-muted-foreground">Missing: {missingEnvVars.join(', ')}</p>
        </div>
      </div>
    </StrictMode>
  )
} else {
  // Dynamically imported so firebase.js (and getAuth()) is only ever
  // evaluated once we know the required env vars are present.
  import('./App.jsx').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  })
}
