import type { UserProfile } from '@/types/user'

const GOAL_LABELS: Record<string, string> = {
  running: 'ריצה',
  crossfit: 'קרוספיט',
  weightlifting: 'הרמת משקולות',
  swimming: 'שחייה',
  hybrid: 'אטלטיקה היברידית (כוח+קרדיו)',
  mobility: 'מוביליטי ויוגה',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'מתחיל',
  intermediate: 'בינוני',
  advanced: 'מתקדם',
}

const EQUIPMENT_LABELS: Record<string, string> = {
  full_gym: 'חדר כושר מלא',
  barbell: 'מוט ומשקולות',
  dumbbells: 'משקולות יד',
  pull_up_bar: 'מוט מתח',
  kettlebells: 'קטלבלים',
  resistance_bands: 'גומיות',
  none: 'ללא ציוד',
}

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

export function buildPlanPrompt(user: UserProfile): string {
  const goals = user.goals.map(g => GOAL_LABELS[g] || g).join(', ')
  const level = LEVEL_LABELS[user.experienceLevel] || user.experienceLevel
  const equipment = user.equipment.map(e => EQUIPMENT_LABELS[e] || e).join(', ')

  return `צור תוכנית אימון עבור המשתמש הבא:

מטרות: ${goals}
רמת ניסיון: ${level}
ימי אימון בשבוע: ${user.weeklyAvailability}
משך כל אימון: ${user.sessionDuration} דקות
ציוד זמין: ${equipment}
${user.injuries?.length ? `מגבלות/פציעות: ${user.injuries.join(', ')}` : ''}
${user.age ? `גיל: ${user.age}` : ''}
${user.weightKg ? `משקל: ${user.weightKg} ק"ג` : ''}

חשוב:
- צור רק ${user.weeklyAvailability} אימונים (ימי מנוחה אל תכלול בכלל)
- כל אימון: חימום (1 תרגיל), בלוק ראשי (3-4 תרגילים), קירור (1 תרגיל)
- exerciseSlug: slug אנגלי בלבד (squat, deadlift, bench-press, push-up, pull-up, lunge, plank, burpee, easy-run, tempo-run, interval-run, kettlebell-swing, thruster, box-jump)
- nameHe: שם בעברית לכל תרגיל

החזר JSON בלבד:
{
  "title": "כותרת בעברית",
  "description": "תיאור קצר",
  "type": "${user.goals[0]}",
  "days": [
    {
      "dayIndex": 0,
      "title": "שם האימון",
      "type": "${user.goals[0]}",
      "estimatedDurationMinutes": ${user.sessionDuration},
      "blocks": [
        {
          "id": "w-b1",
          "title": "חימום",
          "type": "warmup",
          "exercises": [{"exerciseSlug": "easy-run", "nameHe": "ריצה קלה", "durationSeconds": 300}]
        },
        {
          "id": "w-b2",
          "title": "בלוק ראשי",
          "type": "main",
          "exercises": [
            {"exerciseSlug": "squat", "nameHe": "סקוואט", "sets": 3, "reps": "8-10", "restSeconds": 90}
          ]
        }
      ]
    }
  ]
}`
}

export const SYSTEM_PROMPT = `אתה מאמן כושר מוסמך ומנוסה עם 15 שנה של ניסיון בבניית תוכניות אימון.
אתה מומחה בתחומי: הרמת משקולות, ריצה, קרוספיט, שחייה ואטלטיקה היברידית.
המשימה שלך היא לבנות תוכנית אימון מותאמת אישית ומדעית.
החזר JSON בלבד ללא טקסט נוסף לפני או אחרי. ה-JSON חייב להיות תקין ומוכן לפרסינג.`
