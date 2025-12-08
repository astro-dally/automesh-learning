"use client"

import { Shield, ShieldOff } from "lucide-react"
import type { SimulationMode } from "@/lib/simulation-types"

interface ModeSelectorProps {
  mode: SimulationMode
  onModeChange: (mode: SimulationMode) => void
  disabled: boolean
}

export function ModeSelector({ mode, onModeChange, disabled }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
      <button
        onClick={() => onModeChange("unprotected")}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
          mode === "unprotected"
            ? "bg-destructive text-destructive-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <ShieldOff className="w-3 h-3" />
        Vulnerable
      </button>
      <button
        onClick={() => onModeChange("protected")}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
          mode === "protected"
            ? "bg-success text-success-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Shield className="w-3 h-3" />
        Protected
      </button>
    </div>
  )
}
