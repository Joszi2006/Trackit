import Anthropic from '@anthropic-ai/sdk'
import { keywordFallback } from './fallback'

const anthropic = new Anthropic()

/**
 * Parses a career goal string into 3–6 lowercase hyphenated tags.
 * Falls back to keyword matching if the API call fails — app never breaks.
 */
export async function parseCareerGoal(goal: string): Promise<string[]> {
  if (!goal.trim()) return keywordFallback(goal)

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Extract 3-6 academic career domain tags from this goal.
Return ONLY a JSON array of lowercase hyphenated strings.
No markdown, no explanation, just the array.
Goal: "${goal}"
Example output: ["machine-learning","data-science","algorithms"]`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed: unknown = JSON.parse(text.trim())

    if (Array.isArray(parsed) && parsed.every(t => typeof t === 'string')) {
      return parsed as string[]
    }
    return keywordFallback(goal)
  } catch {
    return keywordFallback(goal)
  }
}
