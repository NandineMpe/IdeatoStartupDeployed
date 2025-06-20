"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState, useMemo } from "react"


export interface ComingSoonOverlayProps {
  title?: string
  description?: string
}

export function ComingSoonOverlay({
  title = "Coming Soon",
  description = "We're working hard to bring you this feature. It will be available in the near future.",
}: ComingSoonOverlayProps) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  const comingSoonPages = useMemo(
    () => [
      "/dashboard/idea/value-proposition",
      "/dashboard/idea/business-model",
      "/dashboard/idea/roadmap",
      "/dashboard/market/llc-formation",
      "/dashboard/market/legal",
      "/dashboard/market/investors",
      "/dashboard/market/funding-score",
      "/dashboard/market/funding-strategy",
      "/dashboard/market/opportunity-scanner",
      "/dashboard/scale/credits",
      "/dashboard/scale/events",
      "/dashboard/scale/financial",
      "/dashboard/scale/recruiting",
      "/dashboard/scale/competition",
      "/dashboard/scale/international",
      "/dashboard/scale/business-plan",
      "/dashboard/scale/cap-table",
    ],
    []
  )

  useEffect(() => {
    setVisible(comingSoonPages.includes(pathname))
  }, [pathname, comingSoonPages])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-w-md p-6 bg-gray-900 rounded-lg border border-primary/20 shadow-xl text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">{title}</h2>
        <p className="text-white/80 mb-6">{description}</p>
        <div className="flex justify-center">
          <button
            onClick={() => setVisible(false)}
            className="px-4 py-2 bg-primary text-black font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
