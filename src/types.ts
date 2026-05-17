export interface Reaction {
  actor: string
  emoji?: string
}

export interface ReelMessage {
  id: string
  sender: string
  timestamp: number
  link?: string
  preview?: string
  reactions: Reaction[]
}

export interface MemberReelCount {
  name: string
  count: number
}

export interface ReactorStat {
  reactor: string
  count: number
}

export interface SenderReactionBreakdown {
  sender: string
  totalReactions: number
  reactors: ReactorStat[]
}

export interface TopReel {
  id: string
  sender: string
  link?: string
  reactionCount: number
  reactors: string[]
  timestamp: number
}

export interface MonthlyAnalytics {
  monthLabel: string
  totalReels: number
  members: string[]
  topSender: MemberReelCount | null
  reelsPerMember: MemberReelCount[]
  topReels: TopReel[]
  reactionBreakdown: SenderReactionBreakdown[]
}

export interface MvpVoteState {
  votes: Record<string, number>
  userVote: string | null
  voterId: string
  configured: boolean
}
