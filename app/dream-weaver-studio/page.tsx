"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Rocket,
  ShoppingBag,
  Sparkle,
  Users,
  Bot,
  Lightbulb,
  Hammer,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DreamWeaverStudio() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")

  const handleNotify = () => {
    toast({
      title: "You're on the list!",
      description: "We'll notify you when Dream Weaver Studio launches.",
    })
    setEmail("")
  }

  return (
    <div className="p-6 space-y-12">
      <section className="text-center space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold text-primary"
        >
          Dream Weaver Studio
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-white/80 max-w-2xl mx-auto"
        >
          Build, discover and share innovative apps in our venture marketplace.
          Dream big and bring your vision to life.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button className="bg-primary text-black hover:bg-primary/90 px-8 py-4 rounded-none text-lg">
            Get Started
          </Button>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <Lightbulb className="h-8 w-8 text-primary" />
            <CardTitle className="text-white">Idea Forge</CardTitle>
            <CardDescription className="text-white/60">
              Generate and refine concepts with AI assistance.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-card border-primary/10 text-center py-8 px-4">
          <CardHeader className="flex flex-col items-center gap-2">
            <Hammer className="h-8 w-8 text-primary" />
            <CardTitle className="text-white">Rapid Prototype</CardTitle>
            <CardDescription className="text-white/60">
              Build and test MVPs in record time.
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
            <CardTitle className="text-white">Collaboration Hub</CardTitle>
            <CardDescription className="text-white/60">
              Team up with other founders to build something amazing.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-card border-primary/10 text-center py-8 px-4">
          <CardHeader className="flex flex-col items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <CardTitle className="text-white">AI Mentor</CardTitle>
            <CardDescription className="text-white/60">
              Get guidance from your personal AI coach.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="bg-primary/5 border border-primary/10 rounded-lg p-6 space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-primary flex items-center justify-center gap-2">
          <Sparkle className="h-6 w-6" />
          Join the Beta
        </h2>
        <p className="text-white/80 max-w-xl mx-auto">
          The Dream Weaver Studio marketplace is under construction. Sign up to
          be the first to know when it launches.
        </p>
        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/50 border-primary/20"
          />
          <Button
            disabled={!email.trim()}
            onClick={handleNotify}
            className="bg-primary text-black hover:bg-primary/90"
          >
            Notify Me
          </Button>
        </div>
      </section>
    </div>
  )
}

