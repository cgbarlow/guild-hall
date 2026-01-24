import { describe, it, expect } from 'vitest'
import { render, screen } from '@/tests/utils/test-utils'
import { QuestCard } from '@/components/quests/quest-card'
import type { Quest } from '@/lib/types/quest'

describe('QuestCard', () => {
  const mockQuest: Quest = {
    id: 'quest-1',
    guild_id: 'guild-1',
    title: 'Defeat the Dragon',
    description: 'A fearsome dragon terrorizes the village. Slay it and earn great rewards!',
    short_description: 'Slay the dragon and save the village',
    status: 'open',
    points: 500,
    xp_reward: 500,
    time_limit_days: 7,
    deadline: null,
    category_id: 'cat-combat',
    category: {
      id: 'cat-combat',
      name: 'Combat',
      description: 'Battle quests',
      icon: 'sword',
      color: '#dc2626',
      created_at: '2024-01-01T00:00:00.000Z',
    },
    created_by: 'gm-1',
    claimed_by: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  }

  it('should render quest title', () => {
    render(<QuestCard quest={mockQuest} />)
    expect(screen.getByText('Defeat the Dragon')).toBeInTheDocument()
  })

  it('should render quest description', () => {
    render(<QuestCard quest={mockQuest} />)
    expect(screen.getByText('Slay the dragon and save the village')).toBeInTheDocument()
  })

  it('should render quest points', () => {
    render(<QuestCard quest={mockQuest} />)
    expect(screen.getByText(/500/)).toBeInTheDocument()
    expect(screen.getByText(/pts/i)).toBeInTheDocument()
  })

  it('should render time limit when available', () => {
    render(<QuestCard quest={mockQuest} />)
    expect(screen.getByText(/7 days/i)).toBeInTheDocument()
  })

  it('should render category badge when category exists', () => {
    render(<QuestCard quest={mockQuest} />)
    expect(screen.getByText('Combat')).toBeInTheDocument()
  })

  it('should not render category badge when category is null', () => {
    const questWithoutCategory = { ...mockQuest, category: null }
    render(<QuestCard quest={questWithoutCategory} />)
    expect(screen.queryByText('Combat')).not.toBeInTheDocument()
  })

  it('should render status badge', () => {
    render(<QuestCard quest={mockQuest} />)
    // Status badge should be present
    expect(screen.getByTestId('quest-status-badge')).toBeInTheDocument()
  })

  it('should render open status correctly', () => {
    render(<QuestCard quest={mockQuest} />)
    expect(screen.getByText(/Open/i)).toBeInTheDocument()
  })

  it('should render in_progress status correctly', () => {
    const inProgressQuest = { ...mockQuest, status: 'in_progress' as const }
    render(<QuestCard quest={inProgressQuest} />)
    expect(screen.getByText(/In Progress/i)).toBeInTheDocument()
  })

  it('should render completed status correctly', () => {
    const completedQuest = { ...mockQuest, status: 'completed' as const }
    render(<QuestCard quest={completedQuest} />)
    expect(screen.getByText(/Completed/i)).toBeInTheDocument()
  })

  it('should use full description when short_description is not available', () => {
    const questWithoutShortDesc = { ...mockQuest, short_description: null }
    render(<QuestCard quest={questWithoutShortDesc} />)
    expect(screen.getByText(/A fearsome dragon terrorizes the village/)).toBeInTheDocument()
  })

  it('should be clickable and navigate to quest detail', () => {
    render(<QuestCard quest={mockQuest} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/quests/quest-1')
  })
})
