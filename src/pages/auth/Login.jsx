import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getAuthErrorMessage } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('konguadmin@gmail.com')
  const [password, setPassword] = useState('Kongu@123')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const from = location.state?.from?.pathname || '/dashboard'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await login(email.trim(), password, rememberMe)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <ShieldCheck className="size-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Kongu Matrimony
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to access the administrator control panel
        </p>
      </div>

      {/* Login Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Admin Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="h-11 pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 pl-10 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                disabled={loading}
              />
              <label
                htmlFor="remember"
                className="cursor-pointer text-xs font-medium text-muted-foreground select-none"
              >
                Remember me
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In as Admin'
            )}
          </Button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        Authorized administrative personnel only.
      </div>
    </div>
  )
}
