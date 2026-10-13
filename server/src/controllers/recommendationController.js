import { calculateVendorRecommendations } from '../services/recommendationEngine.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getRecommendationsForEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const recommendations = await calculateVendorRecommendations(eventId);
    return sendSuccess(res, recommendations, 'Recommendations generated successfully.');
  } catch (error) {
    console.error('[Recommendations Error]', error);
    if (error.message === 'Event not found.') {
      return sendError(res, error.message, 404);
    }
    return sendError(res, 'Failed to calculate vendor recommendations.', 500);
  }
};
