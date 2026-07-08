interface MonthWinnerProps {
  name?: string
  monthLabel: string
  photo: string
}

export function MonthWinner({ name, monthLabel, photo }: MonthWinnerProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-orange-600/10">
      <img
        src={photo}
        alt={name ?? `MVP de ${monthLabel}`}
        className="aspect-square w-full object-cover"
      />
      <div className="p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-white/55">
          MVP de {monthLabel}
        </p>
        {name && <p className="mt-1 text-2xl font-bold text-white">{name}</p>}
      </div>
    </article>
  )
}
