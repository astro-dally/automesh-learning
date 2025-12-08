"use client"

import { useState } from "react"
import { Info, AlertTriangle, Shield, ChevronDown, ChevronUp, Bug, Lock, Network, Eye, Server } from "lucide-react"
import type { SimulationMode } from "@/lib/simulation-types"

interface SecurityInfoProps {
  mode: SimulationMode
}

export function SecurityInfo({ mode }: SecurityInfoProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <h2 className="font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          Educational Information
        </h2>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* WannaCry Facts */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <h3 className="font-medium flex items-center gap-2 text-destructive mb-3">
              <Bug className="w-4 h-4" />
              WannaCry Attack (May 2017)
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-destructive shrink-0" />
                <span>Exploited EternalBlue (MS17-010) - an SMBv1 vulnerability leaked from NSA</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-destructive shrink-0" />
                <span>Infected 200,000+ computers across 150 countries within hours</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-destructive shrink-0" />
                <span>NHS UK lost access to patient records, causing cancelled surgeries</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-destructive shrink-0" />
                <span>Total estimated damages exceeded $4 billion globally</span>
              </li>
            </ul>
          </div>

          {/* Protection Methods */}
          <div className="bg-success/5 border border-success/20 rounded-lg p-4">
            <h3 className="font-medium flex items-center gap-2 text-success mb-3">
              <Shield className="w-4 h-4" />
              How to Protect Mesh Networks
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 mt-0.5 text-success shrink-0" />
                <span>
                  <strong>Patch Management:</strong> Apply security updates promptly (MS17-010 was released 2 months
                  before attack)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Eye className="w-3.5 h-3.5 mt-0.5 text-success shrink-0" />
                <span>
                  <strong>IDS/IPS:</strong> Intrusion Detection Systems monitor traffic for malicious patterns
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Network className="w-3.5 h-3.5 mt-0.5 text-success shrink-0" />
                <span>
                  <strong>Network Segmentation:</strong> Isolate critical systems to limit lateral movement
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Server className="w-3.5 h-3.5 mt-0.5 text-success shrink-0" />
                <span>
                  <strong>Disable SMBv1:</strong> Block legacy protocols that have known vulnerabilities
                </span>
              </li>
            </ul>
          </div>

          {/* Current Mode Explanation */}
          <div
            className={`rounded-lg p-4 ${
              mode === "protected" ? "bg-primary/5 border border-primary/20" : "bg-warning/5 border border-warning/20"
            }`}
          >
            <h3 className={`font-medium mb-2 ${mode === "protected" ? "text-primary" : "text-warning"}`}>
              {mode === "protected" ? "Protected Mode Active" : "Unprotected Mode Active"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {mode === "protected"
                ? "This simulation demonstrates how IDS, firewalls, patched systems, and network monitoring can detect and contain ransomware attacks before they spread across the entire network."
                : "This simulation recreates the conditions of the May 2017 WannaCry attack - unpatched Windows systems, no IDS monitoring, and unrestricted lateral movement through SMB connections."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
