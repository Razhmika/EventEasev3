import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// 1. Discover Vendors with Multi-Criteria Filters
export const getVendors = async (req, res) => {
  try {
    const {
      search,
      category,
      eventType,
      city,
      minPrice,
      maxPrice,
      minRating,
      date,
      sortBy = 'rating',
      sortOrder = 'DESC',
      page = 1,
      limit = 12
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    const conditions = ["vp.verification_status = 'verified'", "u.is_active = TRUE"];

    if (search) {
      conditions.push("(vp.business_name LIKE ? OR vp.bio LIKE ? OR sc.name LIKE ? OR sc.slug LIKE ? OR vs.title LIKE ? OR vs.description LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term, term, term);
    }

    if (category) {
      conditions.push("(sc.slug = ? OR sc.id = ? OR sc.name LIKE ?)");
      params.push(category, category, `%${category}%`);
    }

    if (eventType) {
      conditions.push("(vs.title LIKE ? OR vs.description LIKE ? OR vp.bio LIKE ? OR sc.name LIKE ?)");
      const evTerm = `%${eventType}%`;
      params.push(evTerm, evTerm, evTerm, evTerm);
    }

    if (city) {
      conditions.push("vp.city LIKE ?");
      params.push(`%${city}%`);
    }

    if (minPrice) {
      conditions.push("vp.starting_price >= ?");
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      conditions.push("vp.starting_price <= ?");
      params.push(parseFloat(maxPrice));
    }

    if (minRating) {
      conditions.push("vp.average_rating >= ?");
      params.push(parseFloat(minRating));
    }

    // Availability Filter on a specific date
    if (date) {
      conditions.push(`
        vp.id NOT IN (
          SELECT vendor_id FROM vendor_availability 
          WHERE date = ? AND status IN ('blocked', 'booked')
        )
      `);
      params.push(date);
    }

    // Sorting logic
    let orderByClause = 'ORDER BY vp.average_rating DESC';
    if (sortBy === 'price_asc') orderByClause = 'ORDER BY vp.starting_price ASC';
    else if (sortBy === 'price_desc') orderByClause = 'ORDER BY vp.starting_price DESC';
    else if (sortBy === 'reviews') orderByClause = 'ORDER BY vp.review_count DESC';
    else if (sortBy === 'rating') orderByClause = 'ORDER BY vp.average_rating DESC';

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countSql = `
      SELECT COUNT(DISTINCT vp.id) as total
      FROM vendor_profiles vp
      JOIN users u ON vp.user_id = u.id
      LEFT JOIN vendor_services vs ON vp.id = vs.vendor_id AND vs.is_active = TRUE
      LEFT JOIN service_categories sc ON vs.category_id = sc.id
      ${whereClause}
    `;
    const [countRows] = await pool.execute(countSql, params);
    const totalVendors = countRows[0].total;

    // Data query
    const dataSql = `
      SELECT 
        vp.id,
        vp.business_name,
        vp.bio,
        vp.city,
        vp.address,
        vp.service_radius_km,
        vp.starting_price,
        vp.average_rating,
        vp.review_count,
        vp.avatar_url,
        vp.banner_url,
        u.first_name,
        u.last_name,
        GROUP_CONCAT(DISTINCT sc.name ORDER BY sc.name SEPARATOR ', ') as categories_list,
        GROUP_CONCAT(DISTINCT sc.slug SEPARATOR ', ') as category_slugs
      FROM vendor_profiles vp
      JOIN users u ON vp.user_id = u.id
      LEFT JOIN vendor_services vs ON vp.id = vs.vendor_id AND vs.is_active = TRUE
      LEFT JOIN service_categories sc ON vs.category_id = sc.id
      ${whereClause}
      GROUP BY vp.id
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    // mysql2 handles numeric LIMIT/OFFSET parameters
    const queryParams = [...params, parseInt(limit, 10), parseInt(offset, 10)];
    const [vendors] = await pool.query(dataSql, queryParams);

    return sendSuccess(res, {
      vendors,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: totalVendors,
        totalPages: Math.ceil(totalVendors / parseInt(limit, 10))
      }
    }, 'Vendors retrieved successfully.');
  } catch (error) {
    console.error('[Vendor Discovery Error]', error);
    return sendError(res, 'Failed to discover vendors.', 500);
  }
};

// 2. Public Vendor Profile by ID
export const getVendorById = async (req, res) => {
  const { id } = req.params;

  try {
    const [vendors] = await pool.execute(
      `SELECT 
        vp.id,
        vp.user_id,
        vp.business_name,
        vp.bio,
        vp.city,
        vp.address,
        vp.service_radius_km,
        vp.starting_price,
        vp.verification_status,
        vp.average_rating,
        vp.review_count,
        vp.avatar_url,
        vp.banner_url,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
       FROM vendor_profiles vp
       JOIN users u ON vp.user_id = u.id
       WHERE vp.id = ?`,
      [id]
    );

    if (vendors.length === 0) {
      return sendError(res, 'Vendor not found.', 404);
    }

    const vendor = vendors[0];

    // Services
    const [services] = await pool.execute(
      `SELECT vs.id, vs.title, vs.description, vs.price, vs.pricing_unit, sc.id as category_id, sc.name as category_name, sc.slug as category_slug
       FROM vendor_services vs
       JOIN service_categories sc ON vs.category_id = sc.id
       WHERE vs.vendor_id = ? AND vs.is_active = TRUE
       ORDER BY vs.price ASC`,
      [id]
    );

    // Portfolio
    const [portfolio] = await pool.execute(
      `SELECT id, image_url, caption, is_featured
       FROM vendor_portfolio
       WHERE vendor_id = ?
       ORDER BY is_featured DESC, id DESC`,
      [id]
    );

    // Reviews
    const [reviews] = await pool.execute(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.first_name, u.last_name, cp.avatar_url as customer_avatar
       FROM reviews r
       JOIN customer_profiles cp ON r.customer_id = cp.id
       JOIN users u ON cp.user_id = u.id
       WHERE r.vendor_id = ?
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id]
    );

    // Blocked/Booked Availability for the next 90 days
    const [availability] = await pool.execute(
      `SELECT date, status, notes
       FROM vendor_availability
       WHERE vendor_id = ? AND date >= CURDATE()
       ORDER BY date ASC`,
      [id]
    );

    return sendSuccess(res, {
      ...vendor,
      services,
      portfolio,
      reviews,
      availability
    }, 'Vendor profile retrieved successfully.');
  } catch (error) {
    console.error('[Vendor Profile Error]', error);
    return sendError(res, 'Failed to fetch vendor profile.', 500);
  }
};

// 3. Current Vendor's Services Management
export const getMyServices = async (req, res) => {
  try {
    const vendorId = req.user.profileId;
    const [services] = await pool.execute(
      `SELECT vs.id, vs.title, vs.description, vs.price, vs.pricing_unit, vs.is_active, sc.id as category_id, sc.name as category_name
       FROM vendor_services vs
       JOIN service_categories sc ON vs.category_id = sc.id
       WHERE vs.vendor_id = ?
       ORDER BY vs.created_at DESC`,
      [vendorId]
    );
    return sendSuccess(res, services, 'Vendor services retrieved.');
  } catch (error) {
    console.error('[Vendor Services Error]', error);
    return sendError(res, 'Failed to retrieve services.', 500);
  }
};

export const addService = async (req, res) => {
  const vendorId = req.user.profileId;
  const { categoryId, title, description, price, pricingUnit } = req.body;

  if (!categoryId || !title || price === undefined) {
    return sendError(res, 'Category, title, and price are required.', 400);
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO vendor_services (vendor_id, category_id, title, description, price, pricing_unit)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vendorId, categoryId, title.trim(), description || null, parseFloat(price), pricingUnit || 'event']
    );

    return sendSuccess(res, { id: result.insertId }, 'Service added successfully.', 201);
  } catch (error) {
    console.error('[Add Service Error]', error);
    return sendError(res, 'Failed to add service.', 500);
  }
};

export const updateService = async (req, res) => {
  const vendorId = req.user.profileId;
  const { id } = req.params;
  const { categoryId, title, description, price, pricingUnit, isActive } = req.body;

  try {
    const [resUpdate] = await pool.execute(
      `UPDATE vendor_services 
       SET category_id = COALESCE(?, category_id),
           title = COALESCE(?, title),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           pricing_unit = COALESCE(?, pricing_unit),
           is_active = COALESCE(?, is_active)
       WHERE id = ? AND vendor_id = ?`,
      [
        categoryId || null,
        title || null,
        description !== undefined ? description : null,
        price !== undefined ? parseFloat(price) : null,
        pricingUnit || null,
        isActive !== undefined ? isActive : null,
        id,
        vendorId
      ]
    );

    if (resUpdate.affectedRows === 0) {
      return sendError(res, 'Service not found or unauthorized.', 404);
    }

    return sendSuccess(res, null, 'Service updated successfully.');
  } catch (error) {
    console.error('[Update Service Error]', error);
    return sendError(res, 'Failed to update service.', 500);
  }
};

export const deleteService = async (req, res) => {
  const vendorId = req.user.profileId;
  const { id } = req.params;

  try {
    const [delRes] = await pool.execute(
      `DELETE FROM vendor_services WHERE id = ? AND vendor_id = ?`,
      [id, vendorId]
    );

    if (delRes.affectedRows === 0) {
      return sendError(res, 'Service not found or unauthorized.', 404);
    }

    return sendSuccess(res, null, 'Service deleted successfully.');
  } catch (error) {
    console.error('[Delete Service Error]', error);
    return sendError(res, 'Failed to delete service.', 500);
  }
};

// 4. Portfolio Management
export const getMyPortfolio = async (req, res) => {
  try {
    const vendorId = req.user.profileId;
    const [items] = await pool.execute(
      `SELECT id, image_url, caption, is_featured, created_at
       FROM vendor_portfolio
       WHERE vendor_id = ?
       ORDER BY is_featured DESC, id DESC`,
      [vendorId]
    );
    return sendSuccess(res, items, 'Portfolio items retrieved.');
  } catch (error) {
    console.error('[Get Portfolio Error]', error);
    return sendError(res, 'Failed to fetch portfolio items.', 500);
  }
};

export const addPortfolioItem = async (req, res) => {
  const vendorId = req.user.profileId;
  const { imageUrl, caption, isFeatured } = req.body;

  if (!imageUrl) {
    return sendError(res, 'Image URL is required.', 400);
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO vendor_portfolio (vendor_id, image_url, caption, is_featured)
       VALUES (?, ?, ?, ?)`,
      [vendorId, imageUrl.trim(), caption || null, !!isFeatured]
    );

    return sendSuccess(res, { id: result.insertId }, 'Portfolio item added.', 201);
  } catch (error) {
    console.error('[Add Portfolio Error]', error);
    return sendError(res, 'Failed to add portfolio item.', 500);
  }
};

export const deletePortfolioItem = async (req, res) => {
  const vendorId = req.user.profileId;
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      `DELETE FROM vendor_portfolio WHERE id = ? AND vendor_id = ?`,
      [id, vendorId]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 'Portfolio item not found or unauthorized.', 404);
    }

    return sendSuccess(res, null, 'Portfolio item removed.');
  } catch (error) {
    console.error('[Delete Portfolio Error]', error);
    return sendError(res, 'Failed to remove portfolio item.', 500);
  }
};

// 5. Availability Management
export const getMyAvailability = async (req, res) => {
  try {
    const vendorId = req.user.profileId;
    const [records] = await pool.execute(
      `SELECT id, date, status, notes, created_at
       FROM vendor_availability
       WHERE vendor_id = ? AND date >= CURDATE()
       ORDER BY date ASC`,
      [vendorId]
    );
    return sendSuccess(res, records, 'Availability schedule retrieved.');
  } catch (error) {
    console.error('[Get Availability Error]', error);
    return sendError(res, 'Failed to fetch availability schedule.', 500);
  }
};

export const setAvailability = async (req, res) => {
  const vendorId = req.user.profileId;
  const { date, status, notes } = req.body;

  if (!date || !status) {
    return sendError(res, 'Date and status (available, blocked, booked) are required.', 400);
  }

  try {
    await pool.execute(
      `INSERT INTO vendor_availability (vendor_id, date, status, notes)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)`,
      [vendorId, date, status, notes || null]
    );

    return sendSuccess(res, null, 'Availability updated successfully.');
  } catch (error) {
    console.error('[Set Availability Error]', error);
    return sendError(res, 'Failed to update availability date.', 500);
  }
};
