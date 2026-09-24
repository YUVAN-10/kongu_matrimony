import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
          <AlertTriangle className="size-8 text-destructive mb-2" />
          <h3 className="font-heading font-semibold text-base">Something went wrong while rendering this section</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={this.handleReset}
            className="mt-4 gap-1.5 border-destructive/30 hover:bg-destructive/20"
          >
            <RefreshCw className="size-3.5" />
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
