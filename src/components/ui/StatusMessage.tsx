import type { ReactNode } from 'react'

type Props = {
  tone?: 'info' | 'error'
  children: ReactNode
}

export function StatusMessage({ tone = 'info', children }: Props) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={
        tone === 'error'
          ? 'rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-red-800'
          : 'rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-slate-600'
      }
    >
      {children}
    </div>
  )
}
