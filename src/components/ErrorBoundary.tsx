// src/components/ErrorBoundary.tsx
import { Component, } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

/**
 * Error boundary to catch Three.js/React Three Fiber errors
 * and prevent the entire app from crashing.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0b1b24',
            color: '#eafcff',
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            padding: '2rem',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Something went wrong</h2>
          <pre
            style={{
              fontSize: '0.875rem',
              color: 'rgba(210, 238, 240, 0.7)',
              textAlign: 'left',
              maxWidth: '90%',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {this.state.error?.message || 'Unknown error'}
            {this.state.error?.stack && `\n\n${this.state.error.stack}`}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #d3f6f8 0%, #8fdee6 100%)',
              color: '#0b1b24',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}