import { useState } from 'react'
import type { SenderReactionBreakdown } from '../types'

interface ReactionBreakdownProps {
  breakdown: SenderReactionBreakdown[]
}

export function ReactionBreakdown({ breakdown }: ReactionBreakdownProps) {
  const [expanded, setExpanded] = useState<string | null>(
    breakdown[0]?.sender ?? null,
  )

  if (breakdown.length === 0) {
    return <p className="text-sm text-white/50">Sem reações registadas nos reels.</p>
  }

  return (
    <div className="space-y-2">
      {breakdown.map((item) => {
        const isOpen = expanded === item.sender
        return (
          <div
            key={item.sender}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
          >
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : item.sender)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <span className="font-medium text-white">{item.sender}</span>
              <span className="shrink-0 text-sm text-pink-300">
                {item.totalReactions} reações
              </span>
            </button>
            {isOpen && item.reactors.length > 0 && (
              <ul className="border-t border-white/10 px-4 py-2">
                {item.reactors.map((r) => (
                  <li
                    key={r.reactor}
                    className="flex justify-between py-1.5 text-sm text-white/75"
                  >
                    <span>{r.reactor}</span>
                    <span className="tabular-nums text-white/50">{r.count}×</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
