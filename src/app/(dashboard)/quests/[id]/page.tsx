import { Metadata } from 'next'
import { getQuestById } from '@/lib/actions/quests'
import { QuestDetailClient } from './quest-detail-client'

interface PageProps {
  params: Promise<{ id: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://guild-hall.agentics.nz'
const defaultOgImage = `${siteUrl}/og-image.jpg`

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const quest = await getQuestById(id)

  if (!quest) {
    return {
      title: 'Quest Not Found',
      description: 'This quest could not be found.',
    }
  }

  // Use quest featured image if available, otherwise default
  const ogImage = quest.featured_image_url || defaultOgImage

  const description = quest.short_description || quest.description || 'Embark on this quest!'
  const truncatedDescription = description.length > 200
    ? description.substring(0, 197) + '...'
    : description

  return {
    title: quest.title,
    description: truncatedDescription,
    openGraph: {
      type: 'article',
      title: quest.title,
      description: truncatedDescription,
      url: `${siteUrl}/quests/${id}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${quest.title} - Quest on Guild Hall`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: quest.title,
      description: truncatedDescription,
      images: [ogImage],
    },
  }
}

export default async function QuestDetailPage({ params }: PageProps) {
  const { id } = await params
  return <QuestDetailClient questId={id} />
}
