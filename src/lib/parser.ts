import type { Reaction, ReelMessage } from '../types'

const REEL_URL_PATTERN =
  /instagram\.com\/(?:reel|reels|p)\/|instagr\.am\/(?:reel|reels|p)\//i

function decodeInstagramName(name: string): string {
  try {
    return decodeURIComponent(JSON.parse(`"${name.replace(/"/g, '\\"')}"`))
  } catch {
    return name
  }
}

function normalizeName(raw: unknown): string {
  if (typeof raw === 'string') return decodeInstagramName(raw.trim())
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (typeof obj.name === 'string') return decodeInstagramName(obj.name)
    if (typeof obj.username === 'string') return obj.username
  }
  return 'Desconhecido'
}

function extractLink(msg: Record<string, unknown>): string | undefined {
  const share = msg.share as Record<string, unknown> | undefined
  if (share?.link && typeof share.link === 'string') return share.link

  const content = typeof msg.content === 'string' ? msg.content : ''
  const text = typeof msg.text === 'string' ? msg.text : content
  const urlMatch = text.match(/https?:\/\/[^\s]+/i)
  if (urlMatch) return urlMatch[0]

  return undefined
}

function isReelMessage(msg: Record<string, unknown>): boolean {
  const link = extractLink(msg)
  if (link && REEL_URL_PATTERN.test(link)) return true

  const content = [
    msg.content,
    msg.text,
    (msg.share as Record<string, unknown> | undefined)?.share_text,
  ]
    .filter((v): v is string => typeof v === 'string')
    .join(' ')
    .toLowerCase()

  if (/reel|reels/.test(content) && /instagram|instagr\.am/.test(content)) {
    return true
  }

  const itemType = String(msg.item_type ?? msg.type ?? '').toLowerCase()
  if (itemType.includes('reel') || itemType === 'clip') return true

  return false
}

function parseReactions(msg: Record<string, unknown>): Reaction[] {
  const raw = msg.reactions
  if (!Array.isArray(raw)) return []

  const reactions: Reaction[] = []
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue
    const reaction = r as Record<string, unknown>
    const actor = normalizeName(reaction.actor ?? reaction.sender_name ?? reaction.user)
    if (!actor || actor === 'Desconhecido') continue
    const parsed: Reaction = { actor }
    if (typeof reaction.reaction === 'string') parsed.emoji = reaction.reaction
    else if (typeof reaction.emoji === 'string') parsed.emoji = reaction.emoji
    reactions.push(parsed)
  }
  return reactions
}

function parseTimestamp(msg: Record<string, unknown>): number {
  if (typeof msg.timestamp_ms === 'number') return msg.timestamp_ms
  if (typeof msg.timestamp === 'number') {
    return msg.timestamp < 1e12 ? msg.timestamp * 1000 : msg.timestamp
  }
  return 0
}

function messageId(msg: Record<string, unknown>, index: number): string {
  if (typeof msg.message_id === 'string') return msg.message_id
  if (typeof msg.item_id === 'string') return msg.item_id
  const ts = parseTimestamp(msg)
  const sender = normalizeName(msg.sender_name ?? msg.user)
  return `${ts}-${sender}-${index}`
}

function extractMessages(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.filter((m) => m && typeof m === 'object') as Record<string, unknown>[]
  if (!data || typeof data !== 'object') return []

  const root = data as Record<string, unknown>
  if (Array.isArray(root.messages)) {
    return root.messages.filter((m) => m && typeof m === 'object') as Record<string, unknown>[]
  }

  return []
}

export function extractParticipants(data: unknown, reelSenders: string[]): string[] {
  const names = new Set<string>(reelSenders)

  if (!data || typeof data !== 'object') return [...names].sort()

  const root = data as Record<string, unknown>
  const thread =
    root.thread && typeof root.thread === 'object'
      ? (root.thread as Record<string, unknown>)
      : null
  const participants = root.participants ?? thread?.participants

  if (Array.isArray(participants)) {
    for (const p of participants) {
      const name = normalizeName(p)
      if (name !== 'Desconhecido') names.add(name)
    }
  }

  return [...names].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export function parseReelsFromExport(data: unknown): ReelMessage[] {
  const messages = extractMessages(data)
  const reels: ReelMessage[] = []

  messages.forEach((msg, index) => {
    if (!isReelMessage(msg)) return

    const sender = normalizeName(
      msg.sender_name ?? (msg.user as Record<string, unknown> | undefined),
    )
    if (sender === 'Desconhecido') return

    reels.push({
      id: messageId(msg, index),
      sender,
      timestamp: parseTimestamp(msg),
      link: extractLink(msg),
      preview:
        typeof msg.content === 'string'
          ? msg.content.slice(0, 120)
          : typeof msg.text === 'string'
            ? msg.text.slice(0, 120)
            : undefined,
      reactions: parseReactions(msg),
    })
  })

  return reels.sort((a, b) => b.timestamp - a.timestamp)
}

export function inferMonthLabel(data: unknown, fileName?: string): string {
  if (fileName) {
    const match = fileName.match(/(\d{4})[-_]?(\d{2})/)
    if (match) {
      const date = new Date(Number(match[1]), Number(match[2]) - 1)
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    }
    const monthNames =
      /janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|january|february|march|april|may|june|july|august|september|october|november|december/i
    if (monthNames.test(fileName)) {
      return fileName.replace(/\.json$/i, '').replace(/[-_]/g, ' ')
    }
  }

  const reels = parseReelsFromExport(data)
  if (reels.length > 0) {
    const date = new Date(reels[0].timestamp)
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function monthKeyFromLabel(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '-')
}
