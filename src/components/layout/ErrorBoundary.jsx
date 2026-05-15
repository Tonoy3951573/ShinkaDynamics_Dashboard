import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught exception:', error, errorInfo)
  }

  handleRestart = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[rgba(15,23,42,0.6)] backdrop-blur-[16px] [backdrop-filter:blur(16px)_grayscale(20%)] p-4">
          <div className="w-full max-w-[28rem] bg-[rgba(30,36,48,0.85)] border border-[rgba(191,97,106,0.5)] [box-shadow:0_25px_50px_-12px_rgba(191,97,106,0.25)] rounded-3xl py-10 px-8 text-center flex flex-col items-center animate-[error-modal-slide-up_400ms_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-[rgba(191,97,106,0.15)] flex items-center justify-center mb-6 border border-[rgba(191,97,106,0.3)]">
              <AlertTriangle className="w-9 h-9 text-[#bf616a] animate-[error-pulse_2s_ease-in-out_infinite]" />
            </div>
            <h1 className="text-[color:var(--text,#eceff4)] text-2xl font-bold tracking-tight mb-3">System Fault Detected</h1>
            <p className="text-[color:var(--muted,#d8dee9)] text-[0.9375rem] leading-relaxed mb-8">
              A critical component has crashed, halting the dashboard to prevent further instability.
            </p>
            <div className="w-full bg-black/40 border border-[rgba(191,97,106,0.2)] rounded-xl p-4 mb-8 text-left overflow-x-auto">
              <code className="text-[#bf616a] font-mono text-[0.8125rem]">{this.state.error?.message || 'Unknown render error occurred.'}</code>
            </div>
            <button className="inline-flex items-center gap-2 bg-[#bf616a] text-white border-none py-3.5 px-7 rounded-full font-semibold text-[0.9375rem] cursor-pointer transition-[transform,box-shadow,background] duration-200 ease-linear [box-shadow:0_4px_14px_0_rgba(191,97,106,0.4)] hover:-translate-y-px hover:bg-[#d06f79] hover:[box-shadow:0_6px_20px_rgba(191,97,106,0.5)]" onClick={this.handleRestart}>
              <RefreshCw className="w-[1.125rem] h-[1.125rem]" />
              Restart Dashboard
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
