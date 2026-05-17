import { useCallback, useEffect, useState } from 'react'
import type { MvpVoteState } from '../types'
import { castVote, clearVote, loadVotes, subscribeToVotes } from '../lib/votes'

interface MvpVoteProps {
  monthKey: string
  candidates: string[]
}

export function MvpVote({ monthKey, candidates }: MvpVoteProps) {
  const [state, setState] = useState<MvpVoteState | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    const next = await loadVotes(monthKey)
    setState(next)
    return next
  }, [monthKey])

  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      setError(null)
      try {
        const next = await loadVotes(monthKey)
        if (!cancelled) setState(next)
      } catch {
        if (!cancelled) {
          setError('Não foi possível carregar os votos.')
          setState(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void init()
    const unsubscribe = subscribeToVotes(monthKey, (next) => {
      if (!cancelled) setState(next)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [monthKey])

  async function handleVote(candidate: string) {
    if (!state?.configured || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      setState(await castVote(monthKey, candidate))
    } catch {
      setError('Não foi possível registar o voto. Tenta outra vez.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleClearVote() {
    if (!state?.configured || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      setState(await clearVote(monthKey))
    } catch {
      setError('Não foi possível remover o voto.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-white/50">A carregar votos…</p>
  }

  if (!state?.configured) {
    return (
      <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Votação indisponível: faltam{' '}
        <code className="text-amber-100">VITE_SUPABASE_URL</code> e{' '}
        <code className="text-amber-100">VITE_SUPABASE_ANON_KEY</code>. Copia{' '}
        <code className="text-amber-100">.env.example</code> para{' '}
        <code className="text-amber-100">.env.local</code> e corre o SQL em{' '}
        <code className="text-amber-100">supabase/schema.sql</code>.
      </p>
    )
  }

  const sorted = Object.entries(state.votes).sort((a, b) => b[1] - a[1])
  const leader = sorted[0]
  const totalVotes = sorted.reduce((sum, [, n]) => sum + n, 0)

  return (
    <section className="space-y-4">
      <p className="text-sm text-white/60">
        Um voto por dispositivo. Os resultados são partilhados com todo o grupo em tempo
        real.
      </p>

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {candidates.map((name) => {
          const isSelected = state.userVote === name
          const count = state.votes[name] ?? 0
          return (
            <button
              key={name}
              type="button"
              disabled={submitting}
              onClick={() => void handleVote(name)}
              className={`rounded-xl border px-4 py-3 text-left transition disabled:opacity-50 ${
                isSelected
                  ? 'border-pink-400 bg-pink-500/20 text-white'
                  : 'border-white/15 bg-white/5 text-white/90 hover:border-white/25'
              }`}
            >
              <span className="block font-medium">{name}</span>
              <span className="text-xs text-white/50">
                {count} voto{count !== 1 ? 's' : ''}
              </span>
            </button>
          )
        })}
      </div>

      {state.userVote && (
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleClearVote()}
          className="text-sm text-white/45 underline-offset-2 hover:text-white/70 hover:underline disabled:opacity-50"
        >
          Remover o meu voto
        </button>
      )}

      {leader && totalVotes > 0 && (
        <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Líder atual: <strong>{leader[0]}</strong> com {leader[1]} de {totalVotes} voto
          {totalVotes !== 1 ? 's' : ''}
        </p>
      )}

      <button
        type="button"
        disabled={submitting}
        onClick={() => void refresh().catch(() => setError('Não foi possível atualizar.'))}
        className="text-xs text-white/40 hover:text-white/60 disabled:opacity-50"
      >
        Atualizar resultados
      </button>
    </section>
  )
}
