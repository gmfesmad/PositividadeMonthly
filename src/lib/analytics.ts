import type {
  MemberReelCount,
  MonthlyAnalytics,
  ReelMessage,
  SenderReactionBreakdown,
  TopReel,
} from '../types'

function countBySender(reels: ReelMessage[]): MemberReelCount[] {
  const counts = new Map<string, number>()
  for (const reel of reels) {
    counts.set(reel.sender, (counts.get(reel.sender) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'))
}

function buildReactionBreakdown(reels: ReelMessage[]): SenderReactionBreakdown[] {
  const bySender = new Map<string, Map<string, number>>()

  for (const reel of reels) {
    if (!bySender.has(reel.sender)) bySender.set(reel.sender, new Map())
    const reactors = bySender.get(reel.sender)!
    for (const { actor } of reel.reactions) {
      if (actor === reel.sender) continue
      reactors.set(actor, (reactors.get(actor) ?? 0) + 1)
    }
  }

  return [...bySender.entries()]
    .map(([sender, reactorMap]) => {
      const reactors = [...reactorMap.entries()]
        .map(([reactor, count]) => ({ reactor, count }))
        .sort((a, b) => b.count - a.count || a.reactor.localeCompare(b.reactor, 'pt-BR'))
      const totalReactions = reactors.reduce((sum, r) => sum + r.count, 0)
      return { sender, totalReactions, reactors }
    })
    .sort(
      (a, b) =>
        b.totalReactions - a.totalReactions ||
        a.sender.localeCompare(b.sender, 'pt-BR'),
    )
}

function buildTopReels(reels: ReelMessage[], limit = 3): TopReel[] {
  return reels
    .map((reel) => ({
      id: reel.id,
      sender: reel.sender,
      link: reel.link,
      reactionCount: reel.reactions.length,
      reactors: [...new Set(reel.reactions.map((r) => r.actor))],
      timestamp: reel.timestamp,
    }))
    .sort(
      (a, b) =>
        b.reactionCount - a.reactionCount ||
        b.timestamp - a.timestamp,
    )
    .slice(0, limit)
}

export function computeAnalytics(
  reels: ReelMessage[],
  members: string[],
  monthLabel: string,
): MonthlyAnalytics {
  const reelsPerMember = countBySender(reels)

  return {
    monthLabel,
    totalReels: reels.length,
    members,
    topSender: reelsPerMember[0] ?? null,
    reelsPerMember,
    topReels: buildTopReels(reels),
    reactionBreakdown: buildReactionBreakdown(reels),
  }
}
