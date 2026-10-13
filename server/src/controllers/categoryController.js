import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      `SELECT id, name, slug, description, icon_name, suggested_budget_percentage
       FROM service_categories
       ORDER BY name ASC`
    );
    return sendSuccess(res, categories, 'Categories retrieved successfully.');
  } catch (error) {
    console.error('[Categories Error]', error);
    return sendError(res, 'Failed to fetch categories.', 500);
  }
};
