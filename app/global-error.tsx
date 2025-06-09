'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if ((error as any)?.name === 'ChunkLoadError') {
      // force reload to recover from missing chunk
      window.location.reload()
    }
  }, [error])

  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="mb-4 text-xl font-semibold">Something went wrong!</h2>
        <button
          className="px-4 py-2 text-white bg-gray-800 rounded"
          onClick={() => reset()}
        >
          Try again
        </button>
      </body>
    </html>
  )
}

