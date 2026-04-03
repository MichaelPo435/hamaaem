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

  return `צור תוכנית אימון ל-4 שבועות עבור המשתמש הבא:

מטרות: ${goals}
רמת ניסיון: ${level}
ימי אימון בשבוע: ${user.weeklyAvailability}
משך כל אימון: ${user.sessionDuration} דקות
ציוד זמין: ${equipment}
${user.injuries?.length ? `מגבלות/פציעות: ${user.injuries.join(', ')}` : ''}
${user.age ? `גיל: ${user.age}` : ''}
${user.weightKg ? `משקל: ${user.weightKg} ק"ג` : ''}

חשוב:
- כלול רק ימי אימון במערך days (אל תכלול ימי מנוחה עם isRestDay:true)
- התרגילים חייבים להיות מתאימים לציוד הזמין
- שמות תרגילים בשדה exerciseSlug: השתמש ב-slug האנגלי (squat, deadlift, bench-press, push-up, pull-up, lunge, plank, burpee, kettlebell-swing, thruster, box-jump, wall-ball, jump-rope, easy-run, tempo-run, interval-run, long-run, hill-run, rowing-machine, assault-bike, swimming-freestyle, etc.)
- בכל תרגיל כלול nameHe בעברית
- תוכנית מקדמת - שבוע 1 קל יותר, שבוע 8 הכי קשה
- ימי מנוחה בין ימי אימון כבדים

החזר JSON בלבד (ללא הסברים נוספים) לפי הסכמה:
{
  "title": "כותרת תוכנית בעברית",
  "description": "תיאור קצר בעברית",
  "type": "${user.goals[0]}",
  "durationWeeks": 4,
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "שבוע בסיס",
      "days": [
        {
          "dayOfWeek": 0,
          "isRestDay": false,
          "session": {
            "id": "unique-id",
            "title": "שם האימון",
            "type": "${user.goals[0]}",
            "estimatedDurationMinutes": ${user.sessionDuration},
            "blocks": [
              {
                "id": "block-id",
                "title": "חימום",
                "type": "warmup",
                "exercises": [
                  {
                    "exerciseSlug": "easy-run",
                    "nameHe": "ריצה קלה",
                    "durationSeconds": 300
                  }
                ]
              },
              {
                "id": "block-id-2",
                "title": "בלוק ראשי",
                "type": "main",
                "exercises": [
                  {
                    "exerciseSlug": "squat",
                    "nameHe": "סקוואט",
                    "sets": 3,
                    "reps": "8-10",
                    "weightNote": "70% מ-1RM",
                    "restSeconds": 90
                  }
                ]
              }
            ]
          }
        },
        {
          "dayOfWeek": 2,
          "isRestDay": true
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
