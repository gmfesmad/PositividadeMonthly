import { monthlyAnalytics } from './lib/messagesData'
import { monthKeyFromLabel } from './lib/parser'
import type { MonthlyAnalytics } from './types'
import { MayWinner } from './components/MayWinner'
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
  return (
    <div className="min-h-dvh bg-[#0f0f12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(236,72,153,0.15),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.12),_transparent_45%)]" />

      <main className="relative mx-auto max-w-lg px-4 pb-safe pt-6 sm:max-w-xl sm:px-6 sm:pt-10">
        {!monthlyAnalytics ? (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Nenhum reel encontrado em{' '}
            <code className="text-red-100">src/data/messages.json</code>. Substitui o ficheiro pelo
            export do Instagram e volta a fazer build.
          </p>
        ) : (
          <Dashboard analytics={monthlyAnalytics} />
        )}
      </main>
    </div>
  )
}
