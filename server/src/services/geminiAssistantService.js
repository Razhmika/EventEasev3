import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Deterministic Algorithmic Fallback Planner
 * Generates tailored event planning concepts, budget splits, and milestone checklists
 */
function generateDeterministicPlan({ eventType, guestCount, totalBudget, location, themeStyle, notes }) {
  const budget = parseFloat(totalBudget || 150000);
  const guests = parseInt(guestCount || 100, 10);
  const type = eventType || 'Wedding Celebration';

  // Budget Allocation Breakdown
  const budgetBreakdown = [
    {
      category: 'Catering & Food Services',
      percentage: 35,
      amount: Math.round(budget * 0.35),
      description: `Covers traditional feast, live dinner counters, and beverages (~₹${Math.round((budget * 0.35) / Math.max(1, guests)).toLocaleString('en-IN')} per guest).`
    },
    {
      category: 'Marriage Halls & Venues',
      percentage: 25,
      amount: Math.round(budget * 0.25),
      description: 'Marriage hall rental, air-conditioned dining area, and parking facilities.'
    },
    {
      category: 'Photography & Videography',
      percentage: 15,
      amount: Math.round(budget * 0.15),
      description: 'Candid and traditional wedding photography with HD video coverage and albums.'
    },
    {
      category: 'Stage & Flower Decoration',
      percentage: 12,
      amount: Math.round(budget * 0.12),
      description: 'Fresh flower stage decoration, entrance arch, and ambient lighting.'
    },
    {
      category: 'DJ & Sound Services',
      percentage: 8,
      amount: Math.round(budget * 0.08),
      description: 'Stage audio system, wireless microphones, and celebration music DJ.'
    },
    {
      category: 'Coordination & Contingency',
      percentage: 5,
      amount: Math.round(budget * 0.05),
      description: 'Event coordination, guest hospitality, and reserve budget.'
    }
  ];

  // Theme Concepts
  const themeSuggestions = [
    {
      title: themeStyle || 'Traditional Tamil Wedding & Floral Decor',
      palette: ['#C9B3F5 (Lavender)', '#FFFFFF (Crisp White)', '#6240A0 (Deep Purple)', '#D4AF37 (Temple Gold)'],
      description: `A graceful, cultural celebration pairing fragrant jasmine flower arrangements with soft lavender backdrops and golden brass accents.`
    },
    {
      title: 'Modern Reception Elegance',
      palette: ['#F8F5FF (Lilac White)', '#35204F (Royal Indigo)', '#E8E2F2 (Muted Silver)'],
      description: `Clean geometric stage lines, pastel floral installations, and warm ambient reception uplighting.`
    }
  ];

  // Milestone Checklist
  const checklist = [
    {
      phase: 'Phase 1: Foundation (3-6 Months Out)',
      tasks: [
        'Lock down auspicious date and finalize estimated guest count',
        'Book the marriage hall / venue and pay booking advance',
        'Browse EventEase verified caterers in Coimbatore and sample menu items',
        'Decide stage decoration theme and color palette'
      ]
    },
    {
      phase: 'Phase 2: Service Vendors (1-3 Months Out)',
      tasks: [
        'Confirm candid photographer and videographer bookings',
        'Finalize fresh flower stage backdrop and entrance arch with decorator',
        'Book bridal makeup artist and arrange trial styling',
        'Print and distribute wedding invitations'
      ]
    },
    {
      phase: 'Phase 3: Final Countdown (2-4 Weeks Out)',
      tasks: [
        'Confirm final guest headcount with caterer and marriage hall',
        'Finalize sound system, microphone requirements, and music playlist',
        'Review muhurtham timing and schedule with family',
        'Prepare vendor balance payments and day-of checklist'
      ]
    }
  ];

  return {
    source: 'rule_based_engine',
    summary: `Tailored plan created for your ${guests}-guest ${type} with a total budget of ₹${budget.toLocaleString('en-IN')}.`,
    themeSuggestions,
    budgetBreakdown,
    checklist,
    recommendations: [
      'Prioritize booking the Marriage Hall and Catering first, as they represent 60% of your total budget allocation.',
      `With ${guests} guests, traditional banana leaf or buffet service will optimize your catering budget.`,
      'Request quotes from at least 2 verified EventEase vendors in Coimbatore to compare inclusions.'
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
You are an expert event planning director for EventEase, an event booking platform serving Coimbatore and Tamil Nadu, India, designed around a clean lavender and white aesthetic.
Generate a structured, actionable event plan in pure JSON format for the following event details:
- Event Type: ${eventType || 'Wedding Celebration'}
- Guest Count: ${guestCount || 100}
- Total Budget: ₹${totalBudget || 150000} INR
- Location: ${location || 'Coimbatore, Tamil Nadu'}
- Desired Theme/Style: ${themeStyle || 'Traditional Tamil Wedding & Floral Decor'}
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
