"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { TopNavbar } from "@/components/dashboard/top-navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in")
    }
  }, [isLoaded, userId, router])

  if (!isLoaded || !userId) {
    return null // or a loading spinner
  }

  return (
    <div className="flex h-screen bg-black">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-black">
        <TopNavbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-black">
          {children}
        </main>
      </div>
    </div>
  )
}
