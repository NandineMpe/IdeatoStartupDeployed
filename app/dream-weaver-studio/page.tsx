"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Rocket, ShoppingBag, Sparkle, Users } from "lucide-react"

export default function DreamWeaverStudio() {
  return (
    <div className="p-6 space-y-10">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-primary">Dream Weaver Studio</h1>
        <p className="text-white/80 max-w-2xl mx-auto">
          Build, discover and share innovative apps in our venture marketplace. Dream big and bring your vision to life.
        </p>
        <Button className="bg-primary text-black hover:bg-primary/90 px-8 py-4 rounded-none text-lg">
          Get Started
        </Button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-primary/10 text-center py-8 px-4">
          <CardHeader className="flex flex-col items-center gap-2">
            <Rocket className="h-8 w-8 text-primary" />
            <CardTitle className="text-white">Launchpad</CardTitle>
            <CardDescription className="text-white/60">
              Kickstart your app ideas with templates and tools.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-card border-primary/10 text-center py-8 px-4">
          <CardHeader className="flex flex-col items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <CardTitle className="text-white">Marketplace</CardTitle>
            <CardDescription className="text-white/60">
              Explore and trade apps created by the community.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-card border-primary/10 text-center py-8 px-4">
          <CardHeader className="flex flex-col items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <CardTitle className="text-white">Collaborate</CardTitle>
            <CardDescription className="text-white/60">
              Team up with other founders to build something amazing.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="relative bg-primary/5 border border-primary/10 rounded-lg p-6 space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-primary flex items-center justify-center gap-2">
          <Sparkle className="h-6 w-6" />
          Coming Soon
        </h2>
        <p className="text-white/80 max-w-xl mx-auto">
          The Dream Weaver Studio marketplace is under construction. Check back soon to discover, buy and sell cutting-edge startup apps.
        </p>
      </section>
    </div>
  )
}
