import { useCallback, useState } from 'react'
import { computeAnalytics } from './lib/analytics'
import {
  extractParticipants,
  inferMonthLabel,
  monthKeyFromLabel,
  parseReelsFromExport,
} from './lib/parser'
import type { MonthlyAnalytics } from './types'
import { FileUpload } from './components/FileUpload'
import { MvpVote } from './components/MvpVote'
import { ReactionBreakdown } from './components/ReactionBreakdown'
import { ReelsChart } from './components/ReelsChart'
import { Section } from './components/Section'
import { StatCard } from './components/StatCard'
import { TopReelsList } from './components/TopReelsList'

function Dashboard({ analytics }: { analytics: MonthlyAnalytics }) {
  const monthKey = monthKeyFromLabel(analytics.monthLabel)

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-widest text-pink-400/80">
          Positividade Reels
        </p>
        <h1 className="text-2xl font-bold capitalize text-white">{analytics.monthLabel}</h1>
        <p className="text-sm text-white/50">
          {analytics.totalReels} reel{analytics.totalReels !== 1 ? 's' : ''} no período
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          title="Mais reels enviados"
          value={analytics.topSender?.name ?? '—'}
          subtitle={
            analytics.topSender
              ? `${analytics.topSender.count} reel${analytics.topSender.count !== 1 ? 's' : ''}`
              : undefined
          }
          accent="pink"
        />
        <StatCard
          title="Reel mais reagido"
          value={analytics.topReels[0]?.sender ?? '—'}
          subtitle={
            analytics.topReels[0]
              ? `${analytics.topReels[0].reactionCount} reações`
              : undefined
          }
          accent="purple"
        />
      </div>

      <Section title="Reels por membro">
        <ReelsChart data={analytics.reelsPerMember} />
      </Section>

      <Section title="Top 3 reels com mais reações">
        <TopReelsList reels={analytics.topReels} />
      </Section>

      <Section title="Quem reagiu aos reels de cada um">
        <ReactionBreakdown breakdown={analytics.reactionBreakdown} />
      </Section>

      <Section title="Vota no MVP do mês">
        <MvpVote monthKey={monthKey} candidates={analytics.members} />
      </Section>
    </div>
  )
}

export default function App() {
  const [analytics, setAnalytics] = useState<MonthlyAnalytics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const text = await file.text()
      const data: unknown = JSON.parse(text)
      const reels = parseReelsFromExport(data)

      if (reels.length === 0) {
        setError(
          'Nenhum reel encontrado. Confirma que o JSON tem mensagens com links instagram.com/reel ou export oficial do Instagram.',
        )
        setAnalytics(null)
        return
      }

      const monthLabel = inferMonthLabel(data, file.name)
      const members = extractParticipants(data, reels.map((r) => r.sender))
      setAnalytics(computeAnalytics(reels, members, monthLabel))
    } catch {
      setError('Ficheiro JSON inválido. Verifica o formato e tenta de novo.')
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSample = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/sample-messages.json')
      const data: unknown = await res.json()
      const reels = parseReelsFromExport(data)
      const monthLabel = inferMonthLabel(data, 'abril-2026.json')
      const members = extractParticipants(data, reels.map((r) => r.sender))
      setAnalytics(computeAnalytics(reels, members, monthLabel))
    } catch {
      setError('Não foi possível carregar o exemplo.')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-dvh bg-[#0f0f12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(236,72,153,0.15),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.12),_transparent_45%)]" />

      <main className="relative mx-auto max-w-lg px-4 pb-safe pt-6 sm:max-w-xl sm:px-6 sm:pt-10">
        {!analytics ? (
          <div className="space-y-6">
            <header className="space-y-2 text-center sm:text-left">
              <p className="text-sm font-medium uppercase tracking-widest text-pink-400/80">
                Positividade Reels
              </p>
              <h1 className="text-3xl font-bold text-white">Monthly Analytics</h1>
              <p className="text-white/55">
                Carrega o export JSON do grupo do Instagram e vê quem mandou mais reels,
                quais tiveram mais reações e vota no MVP.
              </p>
            </header>

            <FileUpload onFile={handleFile} loading={loading} />

            <button
              type="button"
              onClick={loadSample}
              disabled={loading}
              className="w-full rounded-xl border border-white/15 py-3 text-sm text-white/70 transition hover:bg-white/5 disabled:opacity-50"
            >
              Experimentar com dados de exemplo
            </button>

            {error && (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setAnalytics(null)}
              className="mb-4 text-sm text-white/45 hover:text-white/70"
            >
              ← Carregar outro mês
            </button>
            <Dashboard analytics={analytics} />
          </>
        )}
      </main>
    </div>
  )
}
