interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  accent?: 'pink' | 'purple' | 'amber'
}

const accentClasses = {
  pink: 'from-pink-500/20 to-rose-600/10 border-pink-400/30',
  purple: 'from-violet-500/20 to-fuchsia-600/10 border-violet-400/30',
  amber: 'from-amber-500/20 to-orange-600/10 border-amber-400/30',
}

export function StatCard({ title, value, subtitle, accent = 'pink' }: StatCardProps) {
  return (
    <article
      className={`rounded-2xl border bg-gradient-to-br p-4 ${accentClasses[accent]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-white/55">{title}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-white/65">{subtitle}</p>}
    </article>
  )
}
