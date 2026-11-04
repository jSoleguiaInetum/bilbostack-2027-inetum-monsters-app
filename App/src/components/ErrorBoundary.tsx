import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-4xl">⚠️</p>
          <p className="text-white font-bold text-lg">Algo salió mal</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-secondary text-white font-bold px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Recargar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
