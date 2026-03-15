import Anthropic from '@anthropic-ai/sdk'

export interface AdviseInput {
  careerGoal: string
  careerTags: string[]
  program: string
  currentSemester: number
  schedule: Array<{ code: string; name: string }>
}

const anthropic = new Anthropic()

/**
 * Generates 2-3 sentences of personalized advice explaining why a schedule
 * moves the student toward their career goal. Never throws — falls back to a
 * generic message on any error.
 */
export async function adviseSchedule(input: AdviseInput): Promise<string> {
  const FALLBACK = `Your schedule is optimized for your ${(input.careerTags[0] ?? 'academic')} path.`

  try {
    const courseList = input.schedule.map(c => `${c.code} – ${c.name}`).join(', ')

    const message = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: `You are an academic advisor. Student details:
Program: ${input.program}, Semester: ${input.currentSemester}, Career goal: "${input.careerGoal}", Tags: ${input.careerTags.join(', ')}
Recommended schedule: ${courseList}
Write exactly 1 concise sentence explaining why this schedule fits their goals. Name 1-2 specific courses. No lists or headers.`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    return text.length > 0 ? text : FALLBACK
  } catch {
    return FALLBACK
  }
}
