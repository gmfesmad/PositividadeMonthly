import type { TopReel } from '../types'

interface TopReelsListProps {
  reels: TopReel[]
}

function formatDate(ts: number): string {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function TopReelsList({ reels }: TopReelsListProps) {
  if (reels.length === 0) {
    return <p className="text-sm text-white/50">Nenhum reel com reações encontrado.</p>
  }

  return (
    <ol className="space-y-3">
      {reels.map((reel, index) => (
        <li
          key={reel.id}
          className="rounded-xl border border-white/10 bg-white/5 p-3"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-sm font-bold">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{reel.sender}</p>
              <p className="text-sm text-pink-300">
                {reel.reactionCount} reação{reel.reactionCount !== 1 ? 'ões' : ''}
                {reel.timestamp ? ` · ${formatDate(reel.timestamp)}` : ''}
              </p>
              {reel.reactors.length > 0 && (
                <p className="mt-1 text-xs text-white/50">
                  {reel.reactors.join(', ')}
                </p>
              )}
              {reel.link && (
                <a
                  href={reel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-violet-300 underline-offset-2 hover:underline"
                >
                  Abrir reel
                </a>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
