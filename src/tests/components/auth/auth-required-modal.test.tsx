import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthRequiredModal } from '@/components/auth/auth-required-modal'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

describe('AuthRequiredModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    returnUrl: '/quests/quest-123',
  }

  it('should not render when open=false', () => {
    render(<AuthRequiredModal {...defaultProps} open={false} />)

    expect(screen.queryByText('Sign in to continue')).not.toBeInTheDocument()
  })

  it('should render title and description when open', () => {
    render(<AuthRequiredModal {...defaultProps} />)

    expect(screen.getByText('Sign in to continue')).toBeInTheDocument()
    expect(
      screen.getByText('You need to be signed in to perform this action.')
    ).toBeInTheDocument()
  })

  it('should render custom title and description', () => {
    render(
      <AuthRequiredModal
        {...defaultProps}
        title="Custom Title"
        description="Custom description text"
      />
    )

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom description text')).toBeInTheDocument()
  })

  it('should show Sign In button linking to /login with returnUrl', () => {
    render(<AuthRequiredModal {...defaultProps} />)

    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute(
      'href',
      '/login?returnUrl=%2Fquests%2Fquest-123'
    )
  })

  it('should show Create Account link to /register with returnUrl', () => {
    render(<AuthRequiredModal {...defaultProps} />)

    const createAccountLink = screen.getByRole('link', { name: /create one/i })
    expect(createAccountLink).toBeInTheDocument()
    expect(createAccountLink).toHaveAttribute(
      'href',
      '/register?returnUrl=%2Fquests%2Fquest-123'
    )
  })

  it('should call onOpenChange when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(<AuthRequiredModal {...defaultProps} onOpenChange={onOpenChange} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should encode returnUrl correctly', () => {
    render(
      <AuthRequiredModal
        {...defaultProps}
        returnUrl="/quests/quest-123?tab=objectives"
      />
    )

    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toHaveAttribute(
      'href',
      '/login?returnUrl=%2Fquests%2Fquest-123%3Ftab%3Dobjectives'
    )
  })
})
