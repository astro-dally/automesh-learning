"use client"

import { AlertTriangle, Shield, Activity, Ban, CheckCircle } from "lucide-react"
import type { SimulationMetrics, SimulationMode } from "@/lib/simulation-types"

interface MetricsDashboardProps {
  metrics: SimulationMetrics
  mode: SimulationMode
  elapsedTime: number
}

export function MetricsDashboard({ metrics, mode, elapsedTime }: MetricsDashboardProps) {
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "—"
    return `${seconds}s`
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Real-Time Metrics
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Infection Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Infected</span>
            </div>
            <div className="text-2xl font-bold text-destructive">{metrics.infectedNodes}</div>
            <div className="text-xs text-muted-foreground">{metrics.infectionRate.toFixed(1)}% of network</div>
          </div>

          <div className="bg-success/10 border border-success/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-success mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Healthy</span>
            </div>
            <div className="text-2xl font-bold text-success">{metrics.healthyNodes}</div>
            <div className="text-xs text-muted-foreground">Uncompromised systems</div>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Ban className="w-4 h-4" />
              <span className="text-xs font-medium">Isolated</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{metrics.isolatedNodes}</div>
            <div className="text-xs text-muted-foreground">Quarantined nodes</div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium">Protected</span>
            </div>
            <div className="text-2xl font-bold text-primary">{metrics.protectedNodes}</div>
            <div className="text-xs text-muted-foreground">Security devices</div>
          </div>
        </div>

        {/* Spread Rate */}
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Infection Spread Rate</span>
            <span className="text-sm font-mono font-semibold">{metrics.spreadRate.toFixed(2)} nodes/min</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-destructive h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(metrics.infectionRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Protected Mode Stats */}
        {mode === "protected" && (
          <div className="space-y-3 pt-2 border-t border-border">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              Defense Response
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                <div className="text-lg font-bold text-success">{metrics.blockedAttempts}</div>
                <div className="text-xs text-muted-foreground">Blocked Attempts</div>
              </div>
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <div className="text-lg font-bold text-warning">{formatTime(metrics.timeToDetection)}</div>
                <div className="text-xs text-muted-foreground">Time to Detection</div>
              </div>
            </div>
          </div>
        )}

        {/* Critical Assets */}
        {metrics.criticalAssetsCompromised.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="text-xs font-medium text-destructive mb-2">Critical Assets Compromised:</div>
            <div className="flex flex-wrap gap-1">
              {metrics.criticalAssetsCompromised.map((asset, idx) => (
                <span key={idx} className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                  {asset}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
