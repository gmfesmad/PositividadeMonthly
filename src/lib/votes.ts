import type { MvpVoteState } from '../types'
import { isSupabaseConfigured, supabase } from './supabase'

const VOTER_ID_KEY = 'positividade-mvp-voter-id'

function voterId(): string {
  let id = localStorage.getItem(VOTER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(VOTER_ID_KEY, id)
  }
  return id
}

function aggregateVotes(
  rows: { candidate: string; voter_id: string }[],
  voter: string,
): MvpVoteState {
  const votes: Record<string, number> = {}
  let userVote: string | null = null

  for (const row of rows) {
    votes[row.candidate] = (votes[row.candidate] ?? 0) + 1
    if (row.voter_id === voter) userVote = row.candidate
  }

  return { votes, userVote, voterId: voter, configured: true }
}

const emptyState = (voter: string): MvpVoteState => ({
  votes: {},
  userVote: null,
  voterId: voter,
  configured: isSupabaseConfigured,
})

export async function loadVotes(monthKey: string): Promise<MvpVoteState> {
  const voter = voterId()

  if (!supabase) {
    return emptyState(voter)
  }

  const { data, error } = await supabase
    .from('mvp_votes')
    .select('candidate, voter_id')
    .eq('month_key', monthKey)

  if (error) throw error

  return aggregateVotes(data ?? [], voter)
}

export async function castVote(monthKey: string, candidate: string): Promise<MvpVoteState> {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }

  const voter = voterId()

  const { error } = await supabase.from('mvp_votes').upsert(
    { month_key: monthKey, voter_id: voter, candidate },
    { onConflict: 'month_key,voter_id' },
  )

  if (error) throw error

  return loadVotes(monthKey)
}

export async function clearVote(monthKey: string): Promise<MvpVoteState> {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }

  const voter = voterId()

  const { error } = await supabase
    .from('mvp_votes')
    .delete()
    .eq('month_key', monthKey)
    .eq('voter_id', voter)

  if (error) throw error

  return loadVotes(monthKey)
}

export function subscribeToVotes(
  monthKey: string,
  onUpdate: (state: MvpVoteState) => void,
): () => void {
  const client = supabase
  if (!client) return () => {}

  const channel = client
    .channel(`mvp-votes:${monthKey}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'mvp_votes',
        filter: `month_key=eq.${monthKey}`,
      },
      () => {
        loadVotes(monthKey).then(onUpdate).catch(() => {})
      },
    )
    .subscribe()

  return () => {
    void client.removeChannel(channel)
  }
}
