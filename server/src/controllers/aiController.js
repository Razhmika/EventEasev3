import { generateEventPlan } from '../services/geminiAssistantService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const planEventWithAI = async (req, res) => {
  const { eventType, guestCount, totalBudget, location, themeStyle, notes } = req.body;

  try {
    const plan = await generateEventPlan({
      eventType,
      guestCount,
      totalBudget,
      location,
      themeStyle,
      notes
    });

    return sendSuccess(res, plan, 'Event plan generated successfully.');
  } catch (error) {
    console.error('[AI Planning Controller Error]', error);
    return sendError(res, 'Failed to generate event planning suggestions.', 500);
  }
};
