import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-32 size-96 rounded-full bg-secondary/20 blur-3xl"
      />
      <div className="relative w-full">
        <Outlet />
      </div>
    </div>
  )
}
