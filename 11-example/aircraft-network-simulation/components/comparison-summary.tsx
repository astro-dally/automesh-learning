"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RotateCcw, ArrowRight } from "lucide-react"

interface ComparisonSummaryProps {
  onRestart: () => void
  onTryAgain: () => void
}

export function ComparisonSummary({ onRestart, onTryAgain }: ComparisonSummaryProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-balance">
          Air India Flight 171 — Network Analysis
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Centralized Outcome */}
          <div className="bg-red-950/30 border border-red-900 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-red-400 flex items-center gap-2">
              <XCircle className="w-6 h-6" />
              What Actually Happened
            </h2>
            <p className="text-sm text-slate-400">(Centralized Network)</p>

            <ul className="space-y-3">
              {[
                "Core Network System failed at T+42s",
                "All systems lost communication",
                "Fuel switches moved to CUTOFF",
                "Pilots had 29 seconds before impact",
                "No redundant paths available",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-red-300">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-red-900">
              <div className="text-3xl font-bold text-red-400">270</div>
              <div className="text-sm text-red-300/70">Fatalities</div>
            </div>
          </div>

          {/* Mesh Outcome */}
          <div className="bg-emerald-950/30 border border-emerald-900 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              What Could Have Been
            </h2>
            <p className="text-sm text-slate-400">(Mesh Network)</p>

            <ul className="space-y-3">
              {[
                "Core Network System fails at same T+42s",
                "Traffic automatically reroutes in 47ms",
                "Fuel systems maintain connection to engines",
                "Pilots retain full control",
                "Multiple redundant paths available",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-emerald-300">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-emerald-900">
              <div className="text-3xl font-bold text-emerald-400">Safe Landing</div>
              <div className="text-sm text-emerald-300/70">Likely Outcome</div>
            </div>
          </div>
        </div>

        {/* Key Lesson */}
        <div className="bg-amber-950/30 border border-amber-900 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-amber-400 mb-3">Key Lesson</h3>
          <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Single points of failure in safety-critical systems can be catastrophic. Mesh networks provide the
            redundancy needed to prevent such disasters by ensuring that no single component failure can bring down the
            entire system.
          </p>
        </div>

        {/* Memorial Note */}
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-lg p-4 text-center">
          <p className="text-sm text-slate-500 italic">
            This simulation honors the memory of the 241 passengers, crew members, and 29 people on the ground who lost
            their lives on June 12, 2025. May their tragedy lead to safer aviation systems.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" onClick={onTryAgain} className="bg-amber-600 hover:bg-amber-500 text-white gap-2">
            <ArrowRight className="w-5 h-5" />
            Try Another Scenario
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onRestart}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2 bg-transparent"
          >
            <RotateCcw className="w-5 h-5" />
            Back to Start
          </Button>
        </div>
      </div>
    </div>
  )
}
