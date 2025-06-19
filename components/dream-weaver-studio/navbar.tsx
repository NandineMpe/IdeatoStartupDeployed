"use client"

import Link from "next/link"
import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export default function DreamWeaverNavbar() {
  const { user } = useUser()
  const { signOut } = useClerk()

  return (
    <header className="bg-black border-b border-primary/10">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-white text-lg font-semibold">
          IdeaToStartup
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-white hover:text-primary">
            Home
          </Link>
          <Link href="/dream-weaver-studio" className="text-white hover:text-primary">
            Studio
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-white hover:text-primary">
                Dashboard
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ redirectUrl: "/" })}
                className="text-white hover:text-primary"
              >
                Sign out
              </Button>
            </>
          ) : (
            <Link href="/sign-in" className="text-white hover:text-primary">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
