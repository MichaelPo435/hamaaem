import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildPlanPrompt, SYSTEM_PROMPT } from '@/lib/claude/prompts'
import type { UserProfile } from '@/types/user'
import type { TrainingPlan } from '@/types/plan'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const user: UserProfile = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY לא מוגדר. הוסף אותו ל-.env.local' },
        { status: 500 }
      )
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildPlanPrompt(user) }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response (in case there's surrounding text)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'תגובת Claude אינה JSON תקין' }, { status: 500 })
    }

    const planData = JSON.parse(jsonMatch[0])

    const plan: TrainingPlan = {
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      generatedBy: 'claude',
      status: 'active',
      level: user.experienceLevel,
      ...planData,
    }

    return NextResponse.json(plan)
  } catch (error: unknown) {
    console.error('Error generating plan:', error)
    const message = error instanceof Error ? error.message : 'שגיאה לא ידועה'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
