import { Metadata } from 'next'
import { Sparkles, Brain, Wand2, MessageSquare, Lightbulb, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Smart Quest Creator | GM Dashboard',
  description: 'AI-powered quest generation coming soon',
}

const upcomingFeatures = [
  {
    icon: MessageSquare,
    title: 'Natural Language Input',
    description: 'Describe your quest idea in plain English and let AI structure it into objectives',
  },
  {
    icon: Wand2,
    title: 'Auto-Generated Objectives',
    description: 'AI breaks down your quest into logical steps with appropriate difficulty',
  },
  {
    icon: Brain,
    title: 'Smart Point Allocation',
    description: 'Points automatically balanced based on complexity and time requirements',
  },
  {
    icon: Lightbulb,
    title: 'Narrative Enhancement',
    description: 'Add engaging story elements and transformation goals to any quest',
  },
  {
    icon: Zap,
    title: 'Bulk Generation',
    description: 'Create multiple related quests from a single concept or theme',
  },
]

export default function SmartCreatorPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Hero section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Quest Creator</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          AI-powered quest generation that helps you create engaging, balanced quests in seconds
        </p>
        <Badge variant="secondary" className="text-base px-4 py-1">
          Coming Soon
        </Badge>
      </div>

      {/* Teaser features */}
      <Card>
        <CardHeader>
          <CardTitle>What to Expect</CardTitle>
          <CardDescription>
            Powerful AI tools to streamline your quest creation process
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {upcomingFeatures.map((feature) => (
            <div key={feature.title} className="flex gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex-shrink-0">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Preview mockup */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Quest Generator Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium">GM</span>
              </div>
              <div className="flex-1 bg-muted rounded-lg p-3 text-sm">
                Create a quest about learning React hooks for beginner developers, should take about a week
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 bg-primary/10 rounded-lg p-3 text-sm space-y-2">
                <p className="font-medium">Generated Quest: "The Hook Master's Journey"</p>
                <p className="text-muted-foreground text-xs">
                  A structured learning path with 5 objectives covering useState, useEffect, useContext, custom hooks, and a final project...
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">7 days</Badge>
                  <Badge variant="outline" className="text-xs">350 points</Badge>
                  <Badge variant="outline" className="text-xs">5 objectives</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          While we're working on this feature, you can still create quests manually
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/gm/quests/new">Create Quest Manually</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/gm/templates">Browse Templates</Link>
          </Button>
        </div>
      </div>

      {/* Newsletter/notify section */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-8 text-center">
          <h3 className="font-medium mb-2">Want to be notified when this launches?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We'll let you know as soon as Smart Quest Creator is available
          </p>
          <Button variant="secondary" disabled>
            Notify Me (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
