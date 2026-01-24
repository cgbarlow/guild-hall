import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestSearch } from '@/components/quests/quest-search'

describe('QuestSearch', () => {
  it('should render search input', () => {
    const onChange = vi.fn()
    render(<QuestSearch value="" onChange={onChange} />)

    expect(screen.getByPlaceholderText('Search quests...')).toBeInTheDocument()
  })

  it('should render with custom placeholder', () => {
    const onChange = vi.fn()
    render(<QuestSearch value="" onChange={onChange} placeholder="Find quests..." />)

    expect(screen.getByPlaceholderText('Find quests...')).toBeInTheDocument()
  })

  it('should call onChange when input changes', () => {
    const onChange = vi.fn()
    render(<QuestSearch value="" onChange={onChange} />)

    const input = screen.getByLabelText('Search quests')
    fireEvent.change(input, { target: { value: 'test query' } })

    expect(onChange).toHaveBeenCalledWith('test query')
  })

  it('should show clear button when value is present', () => {
    const onChange = vi.fn()
    render(<QuestSearch value="test" onChange={onChange} />)

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
  })

  it('should not show clear button when value is empty', () => {
    const onChange = vi.fn()
    render(<QuestSearch value="" onChange={onChange} />)

    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
  })

  it('should clear search when clear button is clicked', () => {
    const onChange = vi.fn()
    render(<QuestSearch value="test" onChange={onChange} />)

    const clearButton = screen.getByLabelText('Clear search')
    fireEvent.click(clearButton)

    expect(onChange).toHaveBeenCalledWith('')
  })

  it('should apply custom className', () => {
    const onChange = vi.fn()
    const { container } = render(
      <QuestSearch value="" onChange={onChange} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should have accessible search icon', () => {
    const onChange = vi.fn()
    render(<QuestSearch value="" onChange={onChange} />)

    // Input should have proper aria-label
    const input = screen.getByLabelText('Search quests')
    expect(input).toBeInTheDocument()
  })
})
