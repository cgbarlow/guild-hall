import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function createUntypedClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Quest data from markdown files
const questUpdates: Record<string, {
  newTitle?: string
  narrative_context: string
  transformation_goal: string
}> = {
  'First Steps in the Realm': {
    narrative_context: "Every legendary agentic engineer began as a curious wanderer. Before you can command swarms of AI agents, you must first understand the landscape you're entering. This quest marks your initiation into the guild.",
    transformation_goal: "You will move from curious observer to active participant—someone who knows where to find answers, who to ask, and how the community operates.",
  },
  'The Prompt Whisperer': {
    narrative_context: "In ages past, commanding powerful forces required complex incantations. Today, a new form of magic has emerged—the ability to commune with large language models. But speaking to these digital oracles requires skill and precision. Master this art, and you'll unlock capabilities that would have seemed like sorcery a decade ago.",
    transformation_goal: "You will develop confidence in crafting effective prompts, a mental framework for breaking complex requests into clear instructions, and a portfolio of prompts you've created and refined.",
  },
  'Local Model Liberation': {
    narrative_context: "The cloud giants offer convenience, but true sovereignty requires the ability to run AI on your own terms. Local models mean your data stays yours, your costs become predictable, and you're never cut off from your tools. This is the path to independence.",
    transformation_goal: "You will gain hands-on experience running LLMs locally, understand the trade-offs between local and cloud inference, and have a working setup you can build upon.",
  },
  'The GRASP Protocol': {
    narrative_context: "Chris Barlow's GRASP framework represents the cutting edge of continuous machine cognition—a cycle of Generate, Review, Absorb, Synthesise, and Persist. Few have attempted to implement it. Will you be among the first to bring theory into practice?",
    transformation_goal: "You will deeply understand the GRASP framework, implement a working prototype, and contribute to the guild's collective knowledge of continuous cognition architectures.",
  },
  'Shes Right Compliance': {
    newTitle: "She'll Be Right Compliance",
    narrative_context: "Kiwi tradies are legendary for their work ethic but notorious for their paperwork aversion. Health & Safety compliance is critical but tedious. What if an AI agent could handle the boring bits—generating site safety plans, logging incidents, tracking certifications? This is AI with a practical Kiwi purpose.",
    transformation_goal: "You will prototype an AI solution for a real NZ compliance problem, learning to navigate local regulations while building something genuinely useful for small businesses.",
  },
  'The Dreaming Machine': {
    narrative_context: "Humans consolidate memories during sleep—pruning, connecting, and transforming raw experience into lasting knowledge. What if AI could dream? The guild has theorized a five-phase dreaming architecture. Now it's time to build it.",
    transformation_goal: "You will push the boundaries of AI memory architecture, implementing systems that don't just accumulate data but actively process, consolidate, and refine knowledge over time.",
  },
  'Sovereign Data Sovereign AI': {
    newTitle: 'Sovereign Data, Sovereign AI',
    narrative_context: '"Can New Zealand afford not to control its AI destiny?" This question haunts our digital future. Most AI models reflect American and European perspectives—where does that leave Te Reo Māori, Pacific languages, and our bicultural identity? This quest explores the five pillars of AI sovereignty.',
    transformation_goal: "You will understand the strategic importance of sovereign AI, be able to articulate NZ-specific risks and opportunities, and identify concrete actions for building local capability.",
  },
  'Agent Swarm Commander': {
    narrative_context: "A single agent is powerful. A coordinated swarm is transformative. The Agentics Foundation's tools—Claude Code and claude-flow—enable orchestration of parallel agents working toward shared goals. Master this, and you become a conductor of digital intelligence.",
    transformation_goal: "You will gain practical experience orchestrating multi-agent systems, understand coordination patterns and failure modes, and build something that demonstrates swarm capabilities.",
  },
  'The Mentors Path': {
    newTitle: "The Mentor's Path",
    narrative_context: "Guilds have always transferred knowledge through mentorship. The master guides the apprentice, sharing not just technique but wisdom—the subtle art of knowing when to push and when to step back. Now it's your turn to give back to those following in your footsteps.",
    transformation_goal: "You will develop mentoring skills, deepen your own understanding by teaching, and directly contribute to the guild's mission of building the next generation of agentic engineers.",
  },
  'Gorse Bot 3000': {
    narrative_context: "Gorse is the golden curse of New Zealand's pastures—beautiful but invasive, choking out native species and productive farmland. Traditional control is expensive and labor-intensive. What if AI agents could coordinate targeted treatment, identifying gorse patches from imagery and optimizing eradication efforts? This is agentic engineering for greener pastures.",
    transformation_goal: "You will apply agentic AI to a real NZ agricultural problem, learning to work with domain experts, geospatial data, and practical deployment constraints.",
  },
}

export async function GET() {
  const supabase = createUntypedClient()

  const results: Array<{ quest: string; success: boolean; error?: string }> = []

  for (const [currentTitle, updates] of Object.entries(questUpdates)) {
    const updateData: Record<string, string> = {
      narrative_context: updates.narrative_context,
      transformation_goal: updates.transformation_goal,
    }

    if (updates.newTitle) {
      updateData.title = updates.newTitle
    }

    const { error } = await supabase
      .from('quests')
      .update(updateData)
      .eq('title', currentTitle)

    results.push({
      quest: updates.newTitle || currentTitle,
      success: !error,
      error: error?.message,
    })
  }

  return NextResponse.json({ success: true, results })
}
