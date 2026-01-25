import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { fetchPublicProfile } from '@/lib/actions/public-profile'
import { PublicProfileCard } from '@/components/profile/public-profile-card'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const result = await fetchPublicProfile(id)

  if (result.status !== 'success') {
    return {
      title: 'Profile Not Found | Guild Hall',
      description: 'This profile is not available.',
    }
  }

  const { data: profile } = result

  return {
    title: `${profile.display_name} | Guild Hall`,
    description: profile.bio
      ? `${profile.bio.slice(0, 150)}...`
      : `${profile.display_name} has completed ${profile.quests_completed} quests and earned ${profile.total_points} points on Guild Hall.`,
    openGraph: {
      title: `${profile.display_name} | Guild Hall`,
      description: profile.bio ?? `Adventurer on Guild Hall`,
      type: 'profile',
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
    },
  }
}

/**
 * Public profile page
 * Accessible without authentication
 * Respects user privacy settings
 */
export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params
  const result = await fetchPublicProfile(id)

  // Handle different result statuses
  switch (result.status) {
    case 'not_found':
      notFound()

    case 'private':
      notFound()

    case 'error':
      // Log the error server-side
      console.error('Error fetching public profile:', result.error)
      notFound()

    case 'success':
      return (
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="mx-auto max-w-2xl">
              <PublicProfileCard profile={result.data} />
            </div>
          </div>
        </main>
      )
  }
}
