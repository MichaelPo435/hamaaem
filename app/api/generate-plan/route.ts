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

    // Build 4 weeks from the single-week template
    const DAY_SLOTS = [0, 1, 2, 3, 4, 5, 6]
    const workoutDaysPerWeek = user.weeklyAvailability || 3
    const spacing = Math.floor(7 / workoutDaysPerWeek)
    const trainingDaySlots = Array.from({ length: workoutDaysPerWeek }, (_, i) => (i * spacing) % 7)

    const weeks = Array.from({ length: 4 }, (_, weekIdx) => ({
      weekNumber: weekIdx + 1,
      theme: ['שבוע בסיס', 'שבוע עצימות', 'שבוע עומס', 'שבוע שיא'][weekIdx],
      days: DAY_SLOTS.map(dow => {
        const sessionIdx = trainingDaySlots.indexOf(dow)
        if (sessionIdx === -1) return { dayOfWeek: dow, isRestDay: true }
        const dayTemplate = planData.days?.[sessionIdx % (planData.days?.length || 1)]
        if (!dayTemplate) return { dayOfWeek: dow, isRestDay: true }
        return {
          dayOfWeek: dow,
          isRestDay: false,
          session: {
            id: `w${weekIdx + 1}-d${dow}`,
            title: dayTemplate.title,
            type: dayTemplate.type,
            estimatedDurationMinutes: dayTemplate.estimatedDurationMinutes,
            blocks: dayTemplate.blocks?.map((b: { id: string; [key: string]: unknown }) => ({
              ...b,
              id: `${b.id}-w${weekIdx + 1}-d${dow}`,
            })) ?? [],
          },
        }
      }),
    }))

    const plan: TrainingPlan = {
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      generatedBy: 'claude',
      status: 'active',
      level: user.experienceLevel,
      title: planData.title,
      description: planData.description,
      type: planData.type,
      durationWeeks: 4,
      weeks,
    }

    return NextResponse.json(plan)
  } catch (error: unknown) {
    console.error('Error generating plan:', error)
    const message = error instanceof Error ? error.message : 'שגיאה לא ידועה'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
