import React from 'react'
import { useAppStore } from '../../store/useAppStore'

type MedalStyle = {
  emoji: string
  rowClass: string
  badgeClass: string
}

const medalFor = (rank: number): MedalStyle | null => {
  switch (rank) {
    case 1:
      return {
        emoji: '🥇',
        rowClass: 'bg-amber-100 border-amber-300',
        badgeClass: 'text-amber-800'
      }
    case 2:
      return {
        emoji: '🥈',
        rowClass: 'bg-slate-100 border-slate-300',
        badgeClass: 'text-slate-700'
      }
    case 3:
      return {
        emoji: '🥉',
        rowClass: 'bg-orange-100 border-orange-300',
        badgeClass: 'text-orange-800'
      }
    default:
      return null
  }
}

export default function Leaderboard({ title = 'Leaderboard' }: { title?: string }) {
  const leaderboard = useAppStore((s) => s.leaderboard)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{title}</h4>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 border text-slate-600">
          Weekly
        </span>
      </div>

      <ol className="space-y-2">
        {leaderboard.map((e, i) => {
          const rank = i + 1
          const medal = medalFor(rank)
          const baseRow =
            'flex items-center justify-between rounded-xl p-3 border shadow-soft transition'
          const rowClass = medal ? `${baseRow} ${medal.rowClass}` : `${baseRow} bg-white`

          return (
            <li key={e.name} className={rowClass}>
              <div className="flex items-center gap-3 min-w-0">
                {/* Medal / Rank */}
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full bg-white border ${medal ? medal.badgeClass : 'text-slate-600'}`}
                  aria-label={`Rank ${rank}`}
                  title={`Rank ${rank}`}
                >
                  {medal ? medal.emoji : `#${rank}`}
                </div>

                {/* Name */}
                <div className="truncate">
                  <div className="font-medium truncate">{e.name}</div>
                  <div className="text-xs text-slate-500">Score</div>
                </div>
              </div>

              {/* Score */}
              <div className="text-slate-800 font-semibold tabular-nums">{e.score}</div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
