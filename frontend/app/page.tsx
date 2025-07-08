import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, BarChart3, Users, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-amber-500/10" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-mono">
              <Zap className="w-4 h-4 text-amber-400" />
              Distributed Message Queue
            </div>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-amber-400 bg-clip-text text-transparent">
              GoQueue
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-300 mb-4 font-mono">A visual distributed message queue</p>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">for producers and consumers</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold">
                Launch Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/topics">
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg bg-transparent"
              >
                Manage Topics
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">Built for Scale</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Monitor, manage, and visualize your distributed message queues with real-time insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Analytics</h3>
              <p className="text-slate-400">
                Monitor message throughput, queue depth, and system performance with live charts
              </p>
            </div>

            <div className="glass-card p-8 text-center">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Consumer Groups</h3>
              <p className="text-slate-400">
                Manage consumer groups, track message acknowledgments, and handle failures
              </p>
            </div>

            <div className="glass-card p-8 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Reliable Delivery</h3>
              <p className="text-slate-400">
                Ensure message delivery with acknowledgments, retries, and dead letter queues
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
