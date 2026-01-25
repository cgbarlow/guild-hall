import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create untyped client for seeding (bypasses Supabase type issues)
function createUntypedClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Map evidence types from docs to database enum
function mapEvidenceType(evidence: string): 'none' | 'text' | 'link' | 'text_or_link' {
  if (evidence === 'Self-certified') return 'none'
  if (evidence === 'Text') return 'text'
  if (evidence === 'Link') return 'link'
  if (evidence === 'Link (code)' || evidence === 'Link (code/demo)' || evidence === 'Link (video/code)' || evidence === 'Link (diagram)') return 'link'
  if (evidence === 'Text + Link' || evidence === 'Text + Link (mockup)' || evidence === 'Text + Link (diagram)') return 'text_or_link'
  return 'text'
}

// All objectives data extracted from quest docs
const questObjectives: Record<string, Array<{
  title: string
  description: string
  points: number
  evidence_type: string
  depends_on_title?: string
}>> = {
  'First Steps in the Realm': [
    { title: 'Join the Tribe', description: 'Join the Agentics NZ WhatsApp group and introduce yourself with your background and what you hope to learn.', points: 5, evidence_type: 'Self-certified' },
    { title: 'Know the Foundation', description: 'Read the Agentics Foundation website and watch one recorded session from the YouTube channel.', points: 5, evidence_type: 'Self-certified' },
    { title: 'Attend Your First Hackerspace', description: 'Join a monthly AI Hackerspace event (live or watch recording within 7 days).', points: 10, evidence_type: 'Self-certified' },
    { title: 'Share a Spark', description: 'Post one question, insight, or resource in the WhatsApp group that could help others.', points: 5, evidence_type: 'Self-certified' },
  ],
  'The Prompt Whisperer': [
    { title: 'Study the Fundamentals', description: "Read Anthropic's prompt engineering guide and one additional resource of your choice. Note 3 key principles you learned.", points: 10, evidence_type: 'Text' },
    { title: 'Analyze the Masters', description: 'Find 3 effective prompts online (Reddit, GitHub, blogs). For each, explain what makes it work well.', points: 10, evidence_type: 'Text + Link' },
    { title: 'Craft Your First Spell', description: "Write an original prompt for a real task you face. Submit the prompt, the AI's response, and what you'd improve.", points: 15, evidence_type: 'Text', depends_on_title: 'Study the Fundamentals' },
    { title: 'The Iteration Trial', description: 'Take feedback on Objective 3, refine your prompt, and demonstrate measurable improvement in the output.', points: 15, evidence_type: 'Text', depends_on_title: 'Craft Your First Spell' },
  ],
  'Local Model Liberation': [
    { title: 'Choose Your Weapon', description: "Research local model options (Ollama, LM Studio, llama.cpp, etc.). Document your hardware specs and which tool you'll use.", points: 15, evidence_type: 'Text' },
    { title: 'First Boot', description: 'Install your chosen tool and successfully run a small model (7B or under). Screenshot the output.', points: 20, evidence_type: 'Text + Link', depends_on_title: 'Choose Your Weapon' },
    { title: 'Push the Limits', description: 'Run the largest model your hardware can handle. Document inference speed, memory usage, and quality observations.', points: 25, evidence_type: 'Text', depends_on_title: 'First Boot' },
    { title: 'Practical Application', description: 'Use your local model for a real task (summarization, coding help, writing). Compare results to a cloud model.', points: 25, evidence_type: 'Text', depends_on_title: 'Push the Limits' },
    { title: 'Share the Knowledge', description: 'Post your setup guide and findings to the WhatsApp group or write a short blog post.', points: 15, evidence_type: 'Link', depends_on_title: 'Practical Application' },
  ],
  'The GRASP Protocol': [
    { title: 'Deep Study', description: 'Read both parts of "What Happens When the Machine Never Stops Thinking?" Take detailed notes on each GRASP phase.', points: 20, evidence_type: 'Text' },
    { title: 'Architecture Design', description: 'Design a system architecture for implementing GRASP. Include memory storage, phase transitions, and validation mechanisms.', points: 30, evidence_type: 'Text + Link', depends_on_title: 'Deep Study' },
    { title: 'Generate & Review', description: 'Implement the Generate and Review phases. Demonstrate an agent that explores a topic and validates its outputs.', points: 35, evidence_type: 'Link (code)', depends_on_title: 'Architecture Design' },
    { title: 'Absorb & Synthesise', description: 'Add external memory (vector DB, file system, etc.). Show the agent updating and consolidating knowledge.', points: 35, evidence_type: 'Link (code)', depends_on_title: 'Generate & Review' },
    { title: 'Persist & Present', description: 'Complete the cycle with goal persistence. Present your implementation at an AI Hackerspace event.', points: 30, evidence_type: 'Link', depends_on_title: 'Absorb & Synthesise' },
  ],
  "She'll Be Right Compliance": [
    { title: 'Know the Rules', description: 'Research NZ Health & Safety at Work Act requirements for small businesses. Document 5 key compliance tasks that are paperwork-heavy.', points: 20, evidence_type: 'Text + Link' },
    { title: 'Talk to a Tradie', description: 'Interview a tradesperson or small business owner about their compliance pain points. Summarize findings.', points: 25, evidence_type: 'Text' },
    { title: 'Design the Solution', description: 'Create a product concept: what does the AI agent do, what inputs does it need, what outputs does it produce?', points: 30, evidence_type: 'Text + Link' },
    { title: 'Build a Prototype', description: 'Implement a working prototype that generates at least one compliance document from user input.', points: 35, evidence_type: 'Link (code/demo)', depends_on_title: 'Design the Solution' },
    { title: 'Validate with Users', description: 'Get feedback from 2+ potential users. Document what worked and what needs improvement.', points: 15, evidence_type: 'Text', depends_on_title: 'Build a Prototype' },
  ],
  'The Dreaming Machine': [
    { title: 'Study Sleep Science', description: 'Research the five biological sleep functions mapped to AI (memory consolidation, synaptic homeostasis, creative recombination, predictive refinement, emotional processing). Document each.', points: 25, evidence_type: 'Text' },
    { title: 'Experience Capture', description: 'Build a system that logs agent interactions with uncertainty markers and contradiction flags.', points: 30, evidence_type: 'Link (code)', depends_on_title: 'Study Sleep Science' },
    { title: 'Triage Sleep', description: 'Implement deduplication, salience filtering, and chunk formation on captured experiences.', points: 35, evidence_type: 'Link (code)', depends_on_title: 'Experience Capture' },
    { title: 'Deep Dreaming', description: 'Add at least two of: compression, abstraction, integration, counterfactual generation, or adversarial testing.', points: 40, evidence_type: 'Link (code)', depends_on_title: 'Triage Sleep' },
    { title: 'Integrity Verification', description: 'Implement coherence checking and hallucination detection on consolidated knowledge.', points: 30, evidence_type: 'Link (code)', depends_on_title: 'Deep Dreaming' },
    { title: 'Dream Journal', description: 'Document your architecture, findings, and open questions. Share with the guild.', points: 15, evidence_type: 'Text + Link', depends_on_title: 'Integrity Verification' },
  ],
  'Sovereign Data, Sovereign AI': [
    { title: 'The Five Pillars', description: "Read the guild's sovereignty article. Summarize each pillar (Data, Infrastructure, Regulatory, Economic, Competitive) in your own words.", points: 15, evidence_type: 'Text' },
    { title: 'Global Examples', description: 'Research two other nations pursuing sovereign AI (e.g., France/Mistral, UAE/Falcon). What can NZ learn from their approaches?', points: 20, evidence_type: 'Text + Link' },
    { title: 'Te Tiriti & AI', description: 'Investigate how Te Tiriti o Waitangi principles might apply to AI governance in NZ. Document at least 3 considerations.', points: 20, evidence_type: 'Text' },
    { title: 'Local Landscape', description: 'Map NZ organizations working on sovereign AI (companies, research groups, government initiatives).', points: 10, evidence_type: 'Text + Link' },
    { title: 'Personal Manifesto', description: 'Write a 500-word piece: "What sovereign AI means to me and what I can do about it."', points: 10, evidence_type: 'Text' },
  ],
  'Agent Swarm Commander': [
    { title: 'Swarm Theory', description: 'Study multi-agent coordination patterns (hierarchical, mesh, consensus). Document trade-offs of each approach.', points: 25, evidence_type: 'Text' },
    { title: 'Tool Mastery', description: 'Set up Claude Code with claude-flow. Successfully run a basic multi-agent workflow.', points: 30, evidence_type: 'Text + Link', depends_on_title: 'Swarm Theory' },
    { title: 'Design a Swarm', description: 'Design a swarm architecture for a non-trivial task (research, code review, content generation). Document agent roles and communication patterns.', points: 35, evidence_type: 'Text + Link', depends_on_title: 'Tool Mastery' },
    { title: 'Build & Run', description: 'Implement your swarm. Demonstrate it completing a real task with observable coordination.', points: 50, evidence_type: 'Link (video/code)', depends_on_title: 'Design a Swarm' },
    { title: 'Failure Analysis', description: "Document what went wrong, where agents drifted, and how you'd improve the design.", points: 30, evidence_type: 'Text', depends_on_title: 'Build & Run' },
    { title: 'Teach Others', description: 'Create a tutorial or present at AI Hackerspace on what you learned.', points: 30, evidence_type: 'Link', depends_on_title: 'Failure Analysis' },
  ],
  "The Mentor's Path": [
    { title: 'Commit to the Path', description: 'Register as a mentor in the WhatsApp group. Be matched with a mentee who has completed "First Steps in the Realm."', points: 10, evidence_type: 'Text' },
    { title: 'Set the Direction', description: 'Meet with your mentee (video call or in person). Understand their goals and agree on a learning plan for 6 weeks.', points: 20, evidence_type: 'Text', depends_on_title: 'Commit to the Path' },
    { title: 'Weekly Guidance', description: 'Hold at least 4 weekly check-ins. Document topics covered, challenges faced, and progress made.', points: 40, evidence_type: 'Text', depends_on_title: 'Set the Direction' },
    { title: 'Quest Companion', description: 'Support your mentee through completing at least one Journeyman-level quest.', points: 40, evidence_type: 'Text', depends_on_title: 'Weekly Guidance' },
    { title: 'Reflection', description: 'Write a reflection on what you learned as a mentor, what worked, and advice for future mentors.', points: 20, evidence_type: 'Text', depends_on_title: 'Quest Companion' },
    { title: 'Mentee Testimonial', description: 'Have your mentee write a brief testimonial about the experience.', points: 20, evidence_type: 'Text', depends_on_title: 'Quest Companion' },
  ],
  'Gorse Bot 3000': [
    { title: 'Know Your Enemy', description: 'Research gorse biology, current control methods, and the scale of the problem in NZ. Interview a farmer or DOC ranger if possible.', points: 25, evidence_type: 'Text + Link' },
    { title: 'Data Reconnaissance', description: 'Identify available data sources: satellite imagery, drone footage, existing weed mapping projects. Document access methods.', points: 25, evidence_type: 'Text + Link' },
    { title: 'Detection Design', description: 'Design an AI system for gorse detection from imagery. Could be ML classification, vision model prompting, or hybrid approach.', points: 35, evidence_type: 'Text + Link' },
    { title: 'Prototype Detection', description: 'Build a working gorse detector. Demonstrate on sample imagery with accuracy metrics.', points: 45, evidence_type: 'Link (code/demo)', depends_on_title: 'Detection Design' },
    { title: 'Agent Orchestration', description: 'Design an agent system that takes detection outputs and generates treatment recommendations (location priority, method, timing).', points: 35, evidence_type: 'Text + Link', depends_on_title: 'Prototype Detection' },
    { title: 'Field Validation', description: 'If possible, validate with real-world data or expert review. Document findings and next steps.', points: 20, evidence_type: 'Text', depends_on_title: 'Agent Orchestration' },
    { title: 'Open Source', description: 'Release your code and documentation for the guild and broader community.', points: 15, evidence_type: 'Link', depends_on_title: 'Field Validation' },
  ],
}

export async function GET() {
  const supabase = createUntypedClient()

  // Get all quests
  const { data: rawQuests, error: questError } = await supabase
    .from('quests')
    .select('id, title')

  if (questError) {
    return NextResponse.json({ error: 'Failed to fetch quests', details: questError }, { status: 500 })
  }

  const quests = (rawQuests || []) as Array<{ id: string; title: string }>
  const results: Array<{ quest: string; objectives: number; error?: string }> = []

  for (const quest of quests) {
    const objectives = questObjectives[quest.title]
    if (!objectives) {
      results.push({ quest: quest.title, objectives: 0, error: 'No objectives defined' })
      continue
    }

    // First, delete existing objectives for this quest
    await supabase.from('objectives').delete().eq('quest_id', quest.id)

    // Create a map of title -> id for dependency resolution
    const titleToId: Record<string, string> = {}

    // Insert objectives in order
    let displayOrder = 1
    for (const obj of objectives) {
      const objectiveData = {
        quest_id: quest.id,
        title: obj.title,
        description: obj.description,
        points: obj.points,
        display_order: displayOrder++,
        evidence_required: obj.evidence_type !== 'Self-certified',
        evidence_type: mapEvidenceType(obj.evidence_type),
        depends_on_id: obj.depends_on_title ? titleToId[obj.depends_on_title] : null,
      }

      const { data: rawInserted, error: insertError } = await supabase
        .from('objectives')
        .insert(objectiveData)
        .select('id')
        .single()

      if (insertError) {
        results.push({ quest: quest.title, objectives: displayOrder - 1, error: insertError.message })
        break
      }

      const inserted = rawInserted as { id: string } | null
      if (inserted) {
        titleToId[obj.title] = inserted.id
      }
    }

    results.push({ quest: quest.title, objectives: displayOrder - 1 })
  }

  return NextResponse.json({ success: true, results })
}
