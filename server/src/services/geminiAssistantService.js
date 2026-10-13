import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Deterministic Algorithmic Fallback Planner
 * Generates tailored event planning concepts, budget splits, and milestone checklists
 */
function generateDeterministicPlan({ eventType, guestCount, totalBudget, location, themeStyle, notes }) {
  const budget = parseFloat(totalBudget || 10000);
  const guests = parseInt(guestCount || 50, 10);
  const type = eventType || 'Celebration';

  // Budget Allocation Breakdown
  const budgetBreakdown = [
    {
      category: 'Catering & Dining',
      percentage: 35,
      amount: Math.round(budget * 0.35),
      description: `Covers banquet dining, cocktail hour, and beverages (~$${Math.round((budget * 0.35) / Math.max(1, guests))} per guest).`
    },
    {
      category: 'Venue & Hall',
      percentage: 25,
      amount: Math.round(budget * 0.25),
      description: 'Private venue rental, security, and climate-controlled pavilion.'
    },
    {
      category: 'Photography & Cinema',
      percentage: 15,
      amount: Math.round(budget * 0.15),
      description: 'Full day dual-photographer coverage with digital heirloom deliverables.'
    },
    {
      category: 'Floral & Decor Design',
      percentage: 12,
      amount: Math.round(budget * 0.12),
      description: 'Thematic floral centerpieces, entrance archway, and ambient table drapery.'
    },
    {
      category: 'Live Music & DJ',
      percentage: 8,
      amount: Math.round(budget * 0.08),
      description: 'Professional sound system, evening DJ set, and ambient uplighting.'
    },
    {
      category: 'Coordination & Contingency',
      percentage: 5,
      amount: Math.round(budget * 0.05),
      description: 'Day-of director oversight and unexpected milestone emergency fund.'
    }
  ];

  // Theme Concepts
  const themeSuggestions = [
    {
      title: themeStyle || 'Lavender Sunset & White Silk Elegance',
      palette: ['#C9B3F5 (Lavender)', '#FFFFFF (Crisp White)', '#6240A0 (Deep Purple)', '#D4AF37 (Subtle Gold)'],
      description: `A modern, romantic aesthetic pairing fragrant lavender floral notes with candlelit white table runner textures and polished bronze accents.`
    },
    {
      title: 'Modern Minimalist Conservatory',
      palette: ['#F8F5FF (Lilac White)', '#35204F (Royal Indigo)', '#E8E2F2 (Muted Silver)'],
      description: `Clean architectural lines, glass vaults, ambient warm wireless uplighting, and sculptural foliage arrangements.`
    }
  ];

  // Milestone Checklist
  const checklist = [
    {
      phase: 'Phase 1: Foundation (3-6 Months Out)',
      tasks: [
        'Lock down primary date and finalize estimated guest count',
        'Book the primary Venue and secure contract deposit',
        'Browse EventEase verified caterers and request tasting menus',
        'Define color palette and aesthetic moodboard'
      ]
    },
    {
      phase: 'Phase 2: Creative Vendors (1-3 Months Out)',
      tasks: [
        'Confirm editorial photographer and videographer bookings',
        'Finalize custom floral compositions and table mockups with florist',
        'Select DJ playlist must-plays and do-not-play lists',
        'Send digital or letterpress invitations with RSVP deadlines'
      ]
    },
    {
      phase: 'Phase 3: Final Countdown (2-4 Weeks Out)',
      tasks: [
        'Confirm final guest headcount with caterer and venue',
        'Conduct final vendor walkthrough at the venue location',
        'Build day-of master minute-by-minute timeline',
        'Prepare vendor balance payments and day-of emergency kit'
      ]
    }
  ];

  return {
    source: 'rule_based_engine',
    summary: `Tailored plan created for your ${guests}-guest ${type} with a total budget of $${budget.toLocaleString()}.`,
    themeSuggestions,
    budgetBreakdown,
    checklist,
    recommendations: [
      'Prioritize booking Venue and Catering first, as they represent 60% of your total budget allocation.',
      `With ${guests} guests, buffet or family-style service will maximize your culinary budget.`,
      'Request quotes from at least 2 verified EventEase vendors per category to compare inclusions.'
    ]
  };
}

/**
 * Generate Event Planning Assistance using Google Gemini API or Fallback
 */
export async function generateEventPlan(planRequest) {
  const { eventType, guestCount, totalBudget, location, themeStyle, notes } = planRequest;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.log('[AI Assistant] GEMINI_API_KEY not provided. Using deterministic fallback.');
    return generateDeterministicPlan(planRequest);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert luxury event planning director for EventEase, a high-end event booking platform designed around a lavender and white aesthetic.
Generate a structured, actionable event plan in pure JSON format for the following event details:
- Event Type: ${eventType || 'Celebration'}
- Guest Count: ${guestCount || 50}
- Total Budget: $${totalBudget || 10000}
- Location: ${location || 'San Francisco, CA'}
- Desired Theme/Style: ${themeStyle || 'Lavender & White Elegant Modern'}
- Additional Notes: ${notes || 'None'}

Return ONLY valid JSON with this exact structure:
{
  "source": "gemini_ai",
  "summary": "Short 2-sentence executive summary",
  "themeSuggestions": [
    {
      "title": "Theme Title",
      "palette": ["Hex/Name 1", "Hex/Name 2", "Hex/Name 3"],
      "description": "Theme description and atmosphere"
    }
  ],
  "budgetBreakdown": [
    {
      "category": "Category Name",
      "percentage": 35,
      "amount": 3500,
      "description": "How to spend this allocation"
    }
  ],
  "checklist": [
    {
      "phase": "Phase Name (e.g., 3-6 Months Out)",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    }
  ],
  "recommendations": [
    "Key actionable tip 1",
    "Key actionable tip 2",
    "Key actionable tip 3"
  ]
}
Do not wrap in markdown quotes if possible, or if wrapped in markdown \`\`\`json, return parseable json.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean any markdown formatting if present
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsedPlan = JSON.parse(jsonText);
    parsedPlan.source = 'gemini_ai';
    return parsedPlan;
  } catch (error) {
    console.warn('[AI Assistant] Gemini API call failed or timed out. Falling back to deterministic planner:', error.message);
    return generateDeterministicPlan(planRequest);
  }
}
