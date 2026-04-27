export type DiscoverAgeBandId = "0-3" | "4-6" | "6-9" | "9-12" | "12-18"

export interface DiscoverTip {
  title: string
  body: string
}

export interface DiscoverAgeBand {
  id: DiscoverAgeBandId
  label: string
  minAgeMonths: number
  maxAgeMonths: number
  accentClass: string
  tips: DiscoverTip[]
}

export const DISCOVER_AGE_BANDS: DiscoverAgeBand[] = [
  {
    id: "0-3",
    label: "0-3 Months",
    minAgeMonths: 0,
    maxAgeMonths: 3,
    accentClass: "from-ring-sleep/20 to-ring-sleep/5 border-ring-sleep/30",
    tips: [
      {
        title: "Short tummy time bursts",
        body: "Try 1-2 minute tummy time sessions a few times a day and slowly build up as your baby tolerates it.",
      },
      {
        title: "Use contrast and faces",
        body: "Newborns respond well to bold black-and-white patterns and close face-to-face interaction.",
      },
      {
        title: "Follow sleep cues early",
        body: "Watch for yawns, staring off, or fussiness and start a sleep routine before overtiredness kicks in.",
      },
      {
        title: "Keep feedings flexible",
        body: "In the first months, feeding patterns can vary day to day. Track what works rather than aiming for a perfect schedule.",
      },
      {
        title: "Build calm routines",
        body: "Simple repeated steps like diaper, swaddle, feed, and cuddle help babies feel secure.",
      },
    ],
  },
  {
    id: "4-6",
    label: "4-6 Months",
    minAgeMonths: 4,
    maxAgeMonths: 6,
    accentClass: "from-ring-feeding/20 to-ring-feeding/5 border-ring-feeding/30",
    tips: [
      {
        title: "Support rolling practice",
        body: "Place toys just out of reach to encourage reaching, rolling, and core strength during floor play.",
      },
      {
        title: "Introduce solids gradually",
        body: "If your child is ready, offer small tasting opportunities one at a time so you can watch for preferences and reactions.",
      },
      {
        title: "Keep naps predictable",
        body: "A repeatable nap routine can make the transition into longer wake windows much smoother.",
      },
      {
        title: "Practice seated support",
        body: "Offer upright play with support so your baby can strengthen trunk control and look around the room.",
      },
      {
        title: "Talk through your day",
        body: "Narrating simple actions builds language exposure even before your baby can respond with words.",
      },
    ],
  },
  {
    id: "6-9",
    label: "6-9 Months",
    minAgeMonths: 6,
    maxAgeMonths: 9,
    accentClass: "from-ring-presence/20 to-ring-presence/5 border-ring-presence/30",
    tips: [
      {
        title: "Offer finger-food practice",
        body: "Start with soft, easy-to-grasp pieces and stay close while your child explores texture and self-feeding.",
      },
      {
        title: "Rotate floor play spaces",
        body: "A blanket, play mat, and open floor space give your baby new ways to push, pivot, and reach.",
      },
      {
        title: "Use repetition for language",
        body: "Repeat the same simple words during everyday routines to build recognition and early communication.",
      },
      {
        title: "Encourage supported sitting",
        body: "Short supported sitting sessions help with balance, hand use, and visual exploration.",
      },
      {
        title: "Keep toys low and reachable",
        body: "Ground-level toys encourage grasping, transferring objects, and independent play.",
      },
    ],
  },
  {
    id: "9-12",
    label: "9-12 Months",
    minAgeMonths: 9,
    maxAgeMonths: 12,
    accentClass: "from-chart-4/20 to-chart-4/5 border-chart-4/30",
    tips: [
      {
        title: "Baby-proof the next room",
        body: "As mobility grows, scan low shelves, cords, and small objects before your child reaches them.",
      },
      {
        title: "Make crawling games simple",
        body: "Use tunnels, cushions, or a favorite toy just ahead to make movement feel like play.",
      },
      {
        title: "Offer choice between two items",
        body: "Holding up two toys or foods helps children practice decision-making and communication.",
      },
      {
        title: "Keep routines visible",
        body: "Use the same words and order for meals, naps, and bedtime so your child can start anticipating what comes next.",
      },
      {
        title: "Celebrate new words and gestures",
        body: "Pointing, waving, and first words are all progress worth noticing and repeating back.",
      },
    ],
  },
  {
    id: "12-18",
    label: "12-18 Months",
    minAgeMonths: 12,
    maxAgeMonths: 18,
    accentClass: "from-chart-5/20 to-chart-5/5 border-chart-5/30",
    tips: [
      {
        title: "Invite first-step practice",
        body: "Let your child move between stable furniture, you, and a favorite toy to build confidence.",
      },
      {
        title: "Name feelings during frustration",
        body: "Labeling emotions like mad, sad, or excited helps toddlers build early regulation skills.",
      },
      {
        title: "Offer tiny chores",
        body: "Simple tasks like putting a diaper in the bin or handing you a spoon support independence.",
      },
      {
        title: "Keep reading short and repeated",
        body: "Toddlers often love the same board books over and over, which is great for language learning.",
      },
      {
        title: "Use movement to reset",
        body: "When energy runs high, a walk, dancing, or pushing a toy can help reset the day.",
      },
    ],
  },
]

export function getDiscoverAgeBand(ageInMonths: number): DiscoverAgeBand | null {
  return DISCOVER_AGE_BANDS.find((band) => ageInMonths >= band.minAgeMonths && ageInMonths <= band.maxAgeMonths) || null
}

export function getDiscoverTipIndex(seed: number, bandId: DiscoverAgeBandId, tipCount: number): number {
  if (tipCount === 0) return 0

  const bandOffset = DISCOVER_AGE_BANDS.findIndex((band) => band.id === bandId)
  return (seed + Math.max(0, bandOffset)) % tipCount
}
