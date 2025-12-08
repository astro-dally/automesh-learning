"use client"

import { AlertTriangle, Shield, CheckCircle, Ban } from "lucide-react"
import type { SimulationMetrics, SimulationMode } from "@/lib/simulation-types"

interface CompactMetricsProps {
  metrics: SimulationMetrics
  mode: SimulationMode
}

export function CompactMetrics({ metrics, mode }: CompactMetricsProps) {
  return (
    <div className="shrink-0 border-b border-border">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px bg-border">
        <div className="bg-card p-3">
          <div className="flex items-center gap-1.5 text-destructive mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Infected</span>
          </div>
          <div className="text-2xl font-bold text-destructive">{metrics.infectedNodes}</div>
          <div className="text-[10px] text-muted-foreground">{metrics.infectionRate.toFixed(1)}% compromised</div>
        </div>

        <div className="bg-card p-3">
          <div className="flex items-center gap-1.5 text-success mb-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Healthy</span>
          </div>
          <div className="text-2xl font-bold text-success">{metrics.healthyNodes}</div>
          <div className="text-[10px] text-muted-foreground">Safe systems</div>
        </div>

        <div className="bg-card p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Ban className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Isolated</span>
          </div>
          <div className="text-2xl font-bold">{metrics.isolatedNodes}</div>
          <div className="text-[10px] text-muted-foreground">Quarantined</div>
        </div>

        <div className="bg-card p-3">
          <div className="flex items-center gap-1.5 text-primary mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Protected</span>
          </div>
          <div className="text-2xl font-bold text-primary">{metrics.protectedNodes}</div>
          <div className="text-[10px] text-muted-foreground">Security nodes</div>
        </div>
      </div>

      {/* Infection progress bar */}
      <div className="p-3 bg-card">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
          <span>Infection Progress</span>
          <span className="font-mono">{metrics.spreadRate.toFixed(1)} nodes/min</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-destructive h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(metrics.infectionRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Defense stats for protected mode */}
      {mode === "protected" && (metrics.blockedAttempts > 0 || metrics.timeToDetection !== null) && (
        <div className="p-3 bg-success/5 border-t border-success/20">
          <div className="flex items-center gap-1.5 text-success mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Defense Response</span>
          </div>
          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-success font-bold">{metrics.blockedAttempts}</span>
              <span className="text-muted-foreground ml-1">blocked</span>
            </div>
            {metrics.timeToDetection !== null && (
              <div>
                <span className="text-warning font-bold">{metrics.timeToDetection}s</span>
                <span className="text-muted-foreground ml-1">to detect</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Critical assets */}
      {metrics.criticalAssetsCompromised.length > 0 && (
        <div className="p-3 bg-destructive/5 border-t border-destructive/20">
          <div className="text-[10px] font-medium text-destructive mb-1.5">Critical Assets Compromised:</div>
          <div className="flex flex-wrap gap-1">
            {metrics.criticalAssetsCompromised.slice(0, 4).map((asset, idx) => (
              <span key={idx} className="text-[10px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">
                {asset}
              </span>
            ))}
            {metrics.criticalAssetsCompromised.length > 4 && (
              <span className="text-[10px] text-destructive">+{metrics.criticalAssetsCompromised.length - 4} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
