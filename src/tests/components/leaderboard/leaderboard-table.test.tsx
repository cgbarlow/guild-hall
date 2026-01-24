import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import type { LeaderboardEntry } from '@/lib/hooks/use-leaderboard'

const mockEntries: LeaderboardEntry[] = [
  {
    id: 'user-1',
    display_name: 'Top Player',
    avatar_url: 'https://example.com/avatar1.jpg',
    points: 5000,
    quests_completed: 50,
    rank: 1,
  },
  {
    id: 'user-2',
    display_name: 'Second Place',
    avatar_url: 'https://example.com/avatar2.jpg',
    points: 4500,
    quests_completed: 45,
    rank: 2,
  },
  {
    id: 'user-3',
    display_name: null,
    avatar_url: null,
    points: 4000,
    quests_completed: 40,
    rank: 3,
  },
]

describe('LeaderboardTable', () => {
  it('should render table headers', () => {
    render(<LeaderboardTable entries={mockEntries} />)

    expect(screen.getByText('Rank')).toBeInTheDocument()
    expect(screen.getByText('Adventurer')).toBeInTheDocument()
    expect(screen.getByText('Quests')).toBeInTheDocument()
    expect(screen.getByText('Points')).toBeInTheDocument()
  })

  it('should render all entries', () => {
    render(<LeaderboardTable entries={mockEntries} />)

    expect(screen.getByText('Top Player')).toBeInTheDocument()
    expect(screen.getByText('Second Place')).toBeInTheDocument()
    expect(screen.getByText('Anonymous Adventurer')).toBeInTheDocument() // Fallback for null display_name
  })

  it('should display points correctly', () => {
    render(<LeaderboardTable entries={mockEntries} />)

    expect(screen.getByText('5,000')).toBeInTheDocument()
    expect(screen.getByText('4,500')).toBeInTheDocument()
    expect(screen.getByText('4,000')).toBeInTheDocument()
  })

  it('should display quest counts', () => {
    render(<LeaderboardTable entries={mockEntries} />)

    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
  })

  it('should highlight current user', () => {
    const { container } = render(
      <LeaderboardTable entries={mockEntries} currentUserId="user-2" />
    )

    // The "You" badge should be visible for the current user
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('should call onRowClick when row is clicked', async () => {
    const user = userEvent.setup()
    const handleRowClick = vi.fn()

    render(
      <LeaderboardTable entries={mockEntries} onRowClick={handleRowClick} />
    )

    await user.click(screen.getByText('Top Player'))

    expect(handleRowClick).toHaveBeenCalledWith(mockEntries[0])
  })

  it('should show empty state when no entries', () => {
    render(<LeaderboardTable entries={[]} />)

    expect(screen.getByText('No adventurers on the leaderboard yet')).toBeInTheDocument()
  })

  it('should show loading skeleton when isLoading', () => {
    render(<LeaderboardTable entries={[]} isLoading />)

    // Should render skeleton rows (check for table structure without actual data)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.queryByText('No adventurers on the leaderboard yet')).not.toBeInTheDocument()
  })
})
