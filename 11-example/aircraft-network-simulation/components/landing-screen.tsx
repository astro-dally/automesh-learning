"use client"

import { Button } from "@/components/ui/button"
import { Plane, Play, BookOpen } from "lucide-react"

interface LandingScreenProps {
  onStart: () => void
}

export function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Plane className="w-10 h-10 text-amber-500" />
          <h1 className="text-3xl md:text-4xl font-bold text-balance">Air India Flight 171</h1>
        </div>

        <h2 className="text-xl md:text-2xl text-slate-400 font-medium">Network Failure Analysis</h2>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-left space-y-4">
          <p className="text-slate-300 leading-relaxed">
            On <span className="text-amber-500 font-semibold">June 12, 2025</span>, Air India Flight 171 crashed 32
            seconds after takeoff, killing <span className="text-red-400 font-semibold">270 people</span>.
          </p>

          <p className="text-slate-300 leading-relaxed">
            The cause: A <span className="text-red-400 font-semibold">Core Network System failure</span> that
            demonstrated the fatal flaw of centralized architecture in safety-critical systems.
          </p>

          <p className="text-slate-300 leading-relaxed">
            This simulation compares what happened with what could have been prevented using{" "}
            <span className="text-emerald-400 font-semibold">mesh networking</span>.
          </p>
        </div>

        <div className="bg-slate-900/30 border border-slate-800/50 rounded-lg p-4">
          <p className="text-sm text-slate-500 italic">
            In memory of the 241 passengers, crew, and 29 people on the ground who lost their lives. This educational
            tool honors their memory by demonstrating how such tragedies can be prevented.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            size="lg"
            onClick={onStart}
            className="bg-amber-600 hover:bg-amber-500 text-white gap-2 text-lg px-8 py-6"
          >
            <Play className="w-5 h-5" />
            Start Simulation
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2 bg-transparent"
            onClick={() => window.open("https://en.wikipedia.org/wiki/Air_India_Flight_171", "_blank")}
          >
            <BookOpen className="w-5 h-5" />
            Learn More
          </Button>
        </div>
      </div>
    </div>
  )
}
