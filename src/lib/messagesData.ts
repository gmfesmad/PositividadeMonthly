import messagesData from '../data/messages.json'
import { computeAnalytics } from './analytics'
import {
  extractParticipants,
  inferMonthLabel,
  parseReelsFromExport,
} from './parser'
import type { MonthlyAnalytics } from '../types'

/** Edit `src/data/messages.json` and rebuild to refresh analytics. */
export function buildMonthlyAnalytics(data: unknown = messagesData): MonthlyAnalytics | null {
  const reels = parseReelsFromExport(data)
  if (reels.length === 0) return null

  const monthLabel = inferMonthLabel(data, 'messages.json')
  const members = extractParticipants(
    data,
    reels.map((r) => r.sender),
  )
  return computeAnalytics(reels, members, monthLabel)
}

export const monthlyAnalytics = buildMonthlyAnalytics()
