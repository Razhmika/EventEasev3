import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'eventease_db';

async function initDatabase() {
  console.log('🚀 Starting Database Initialization...');

  // Step 1: Connect to server without database to create it if needed
  const rootConn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  });

  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`✅ Database \`${DB_NAME}\` ensured.`);
  await rootConn.end();

  // Step 2: Connect to specific database with multipleStatements enabled
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true
  });

  // Step 3: Run schema.sql
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  console.log('⏳ Executing schema.sql tables and constraints...');
  await conn.query(schemaSql);
  console.log('✅ Schema tables, foreign keys, and indexes created successfully.');

  // Step 4: Seed initial data
  console.log('⏳ Seeding demo users, categories, vendors, events, and reviews...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Admin User
  const [adminResult] = await conn.execute(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
     VALUES (?, ?, 'admin', 'Elena', 'Vance', '+1 (555) 019-2834', TRUE)`,
    ['admin@eventease.com', passwordHash]
  );
  const adminId = adminResult.insertId;

  // 2. Service Categories
  const categoriesData = [
    { name: 'Catering & Dining', slug: 'catering', description: 'Gourmet multi-course dining, artisanal hors d’oeuvres, and bespoke beverage bars.', icon_name: 'Utensils', budget_pct: 35 },
    { name: 'Photography & Cinema', slug: 'photography', description: 'Fine-art editorial photography, 4K documentary videography, and drone captures.', icon_name: 'Camera', budget_pct: 15 },
    { name: 'Venues & Mansions', slug: 'venues', description: 'Historic estates, modern panoramic lofts, vineyard chateaus, and private villas.', icon_name: 'Castle', budget_pct: 25 },
    { name: 'Floral & Decor Design', slug: 'decor-floral', description: 'Sculptural floral installations, candlelit table design, and luxury drapery.', icon_name: 'Flower2', budget_pct: 12 },
    { name: 'Live Music & DJ', slug: 'music-dj', description: 'Acoustic string quartets, international touring DJs, and full brass swing bands.', icon_name: 'Music', budget_pct: 8 },
    { name: 'Full Event Coordination', slug: 'event-planning', description: 'End-to-end event production, design curation, and flawless day-of master direction.', icon_name: 'CalendarHeart', budget_pct: 5 }
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const [res] = await conn.execute(
      `INSERT INTO service_categories (name, slug, description, icon_name, suggested_budget_percentage)
       VALUES (?, ?, ?, ?, ?)`,
      [cat.name, cat.slug, cat.description, cat.icon_name, cat.budget_pct]
    );
    categoryMap[cat.slug] = res.insertId;
  }

  // 3. Demo Vendors
  const vendorsData = [
    {
      email: 'vendor.lavish@eventease.com',
      first_name: 'Julian',
      last_name: 'Mercer',
      phone: '+1 (415) 890-1122',
      business_name: 'Lavish Table Culinary Atelier',
      bio: 'Michelin-trained culinary artisans creating bespoke seasonal banquet experiences tailored to intimate gatherings and grand galas.',
      city: 'San Francisco',
      service_radius_km: 75,
      starting_price: 3200.00,
      rating: 4.95,
      review_count: 24,
      avatar_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80',
      category: 'catering',
      services: [
        { title: 'Five-Course French Seasonal Banquet', desc: 'Custom curated menu with wine pairing notes, tableside finishing, and fine porcelain presentation.', price: 4500.00 },
        { title: 'Artisanal Canapés & Cocktail Station', desc: '10 crafted amuse-bouche selections with craft signature cocktail pairings for up to 150 guests.', price: 2800.00 }
      ],
      portfolio: [
        'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80'
      ]
    },
    {
      email: 'vendor.lumiere@eventease.com',
      first_name: 'Chloe',
      last_name: 'Laurent',
      phone: '+1 (415) 345-7788',
      business_name: 'Lumière Fine Art Photography',
      bio: 'Ethereal, natural-light storytelling capturing timeless human connections, candid joy, and editorial elegance.',
      city: 'San Francisco',
      service_radius_km: 100,
      starting_price: 2400.00,
      rating: 4.98,
      review_count: 38,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
      category: 'photography',
      services: [
        { title: 'Full-Day Editorial Wedding & Gala Collection', desc: '10 hours of dual-photographer coverage, drone perspectives, online high-res gallery & heirloom album.', price: 3800.00 },
        { title: 'Intimate Event & Milestone Story', desc: '5 hours of refined photo coverage with next-day highlight preview deliverables.', price: 2200.00 }
      ],
      portfolio: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80'
      ]
    },
    {
      email: 'vendor.botanica@eventease.com',
      first_name: 'Sienna',
      last_name: 'Hayes',
      phone: '+1 (510) 782-9011',
      business_name: 'Botanica & Bloom Floral Studio',
      bio: 'Organic, garden-style botanical compositions, romantic hanging floral chandeliers, and delicate tablescapes.',
      city: 'Oakland',
      service_radius_km: 60,
      starting_price: 1800.00,
      rating: 4.88,
      review_count: 19,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1200&q=80',
      category: 'decor-floral',
      services: [
        { title: 'Grand Floral Arch & Ceremony Suite', desc: 'Custom freestanding architectural ceremony arch, aisle markers, and coordinated focal accents.', price: 2400.00 },
        { title: 'Tablescape Curation & Centerpieces (15 Tables)', desc: 'Low lush ceramic bowls, tapered candles, hand-dyed silks, and textured greenery runners.', price: 1950.00 }
      ],
      portfolio: [
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80'
      ]
    },
    {
      email: 'vendor.monarch@eventease.com',
      first_name: 'Marcus',
      last_name: 'Sterling',
      phone: '+1 (408) 551-3344',
      business_name: 'The Monarch Glasshouse Estate',
      bio: 'An architectural marvel featuring 30-foot glass vaults surrounded by 20 acres of manicured lavender fields and ancient olive groves.',
      city: 'San Jose',
      service_radius_km: 120,
      starting_price: 5500.00,
      rating: 4.96,
      review_count: 42,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
      category: 'venues',
      services: [
        { title: 'Full Weekend Glasshouse Estate Buyout', desc: 'Exclusive access Friday through Sunday, luxury bridal cottage, commercial prep kitchen, and parking.', price: 9500.00 },
        { title: 'Single Day Twilight Reception Sanctuary', desc: '12 hours venue rental including climate-controlled glass pavilion and outdoor terrace lounge.', price: 5800.00 }
      ],
      portfolio: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
        'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=800&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
      ]
    },
    {
      email: 'vendor.velvet@eventease.com',
      first_name: 'Dominic',
      last_name: 'Cruz',
      phone: '+1 (415) 762-8822',
      business_name: 'Velvet Sound & Lighting Collective',
      bio: 'Sophisticated acoustic soundscapes, live sax-accompanied DJ sets, and architectural ambient wireless uplighting.',
      city: 'San Francisco',
      service_radius_km: 80,
      starting_price: 1500.00,
      rating: 4.91,
      review_count: 27,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80',
      category: 'music-dj',
      services: [
        { title: 'Platinum DJ & Saxophone Live Performance', desc: '6 hours of seamless live transitions, wireless microphones, subwoofers, and intelligent dance lighting.', price: 2200.00 },
        { title: 'Architectural Lavender Ambient Uplighting', desc: '24 wireless programmable LED fixtures bathing walls and pillars in warm lavender tones.', price: 1100.00 }
      ],
      portfolio: [
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'
      ]
    },
    {
      email: 'vendor.serene@eventease.com',
      first_name: 'Amara',
      last_name: 'Patel',
      phone: '+1 (415) 993-4411',
      business_name: 'Serene Curations Event Design',
      bio: 'Boutique planning firm dedicated to high-touch sensory event production, seamless vendor synchronization, and calm luxury.',
      city: 'San Francisco',
      service_radius_km: 90,
      starting_price: 2800.00,
      rating: 4.97,
      review_count: 31,
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
      category: 'event-planning',
      services: [
        { title: 'Full Signature Event Production', desc: 'Concept development, 3D floorplans, curated vendor negotiations, contract oversight, and two coordinators on-site.', price: 4200.00 },
        { title: 'Final Month & Day-Of Coordination', desc: 'Timeline development, final vendor walkthroughs, rehearsal direction, and 12-hour event execution.', price: 2400.00 }
      ],
      portfolio: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80'
      ]
    }
  ];

  const vendorIdMap = {};
  for (const v of vendorsData) {
    const [uRes] = await conn.execute(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
       VALUES (?, ?, 'vendor', ?, ?, ?, TRUE)`,
      [v.email, passwordHash, v.first_name, v.last_name, v.phone]
    );
    const userId = uRes.insertId;

    const [vRes] = await conn.execute(
      `INSERT INTO vendor_profiles (user_id, business_name, bio, city, service_radius_km, starting_price, verification_status, average_rating, review_count, avatar_url, banner_url)
       VALUES (?, ?, ?, ?, ?, ?, 'verified', ?, ?, ?, ?)`,
      [userId, v.business_name, v.bio, v.city, v.service_radius_km, v.starting_price, v.rating, v.review_count, v.avatar_url, v.banner_url]
    );
    const vendorId = vRes.insertId;
    vendorIdMap[v.email] = vendorId;

    // Services
    const catId = categoryMap[v.category];
    for (const s of v.services) {
      await conn.execute(
        `INSERT INTO vendor_services (vendor_id, category_id, title, description, price, pricing_unit)
         VALUES (?, ?, ?, ?, ?, 'event')`,
        [vendorId, catId, s.title, s.desc, s.price]
      );
    }

    // Portfolio
    for (let i = 0; i < v.portfolio.length; i++) {
      await conn.execute(
        `INSERT INTO vendor_portfolio (vendor_id, image_url, caption, is_featured)
         VALUES (?, ?, ?, ?)`,
        [vendorId, v.portfolio[i], `${v.business_name} Highlight Showcase`, i === 0]
      );
    }

    // Default availability: block a couple of sample dates
    await conn.execute(
      `INSERT INTO vendor_availability (vendor_id, date, status, notes)
       VALUES (?, '2026-11-15', 'blocked', 'Private Holiday'), (?, '2026-11-20', 'available', 'Prime Availability')`,
      [vendorId, vendorId]
    );
  }

  // 4. Demo Customers
  const [c1User] = await conn.execute(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
     VALUES (?, ?, 'customer', 'Sophia', 'Montgomery', '+1 (415) 220-9988', TRUE)`,
    ['customer@eventease.com', passwordHash]
  );
  const c1UserId = c1User.insertId;
  const [c1Prof] = await conn.execute(
    `INSERT INTO customer_profiles (user_id, city, preferred_theme, budget_tier, avatar_url)
     VALUES (?, 'San Francisco', 'Lavender Luxe & Modern Minimalist', 'High-End', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80')`,
    [c1UserId]
  );
  const customerId = c1Prof.insertId;

  const [c2User] = await conn.execute(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
     VALUES (?, ?, 'customer', 'Liam', 'Kensington', '+1 (510) 331-4455', TRUE)`,
    ['liam@eventease.com', passwordHash]
  );
  const c2UserId = c2User.insertId;
  await conn.execute(
    `INSERT INTO customer_profiles (user_id, city, preferred_theme, budget_tier, avatar_url)
     VALUES (?, 'Oakland', 'Industrial Botanical & Warm Ambient', 'Mid-to-High', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80')`,
    [c2UserId]
  );

  // 5. Demo Event for Customer 1
  const [evtRes] = await conn.execute(
    `INSERT INTO events (customer_id, title, event_type, event_date, event_time, location, city, guest_count, total_budget, theme_style, description, status)
     VALUES (?, 'Sophia & Oliver Autumn Gala', 'Wedding & Reception', '2026-11-28', '16:00:00', 'Palace of Fine Arts / Private Conservatory', 'San Francisco', 120, 25000.00, 'Lavender Glow & Candlelit Elegance', 'A celebration of love featuring fine gastronomy, bespoke florals, and atmospheric music.', 'booking_in_progress')`,
    [customerId]
  );
  const eventId = evtRes.insertId;

  // Event Requirements
  await conn.execute(
    `INSERT INTO event_requirements (event_id, category_id, allocated_budget, special_requests)
     VALUES (?, ?, 5000.00, 'Locally sourced farm-to-table gourmet dining with vegan pairing options'),
            (?, ?, 3500.00, 'Film editorial aesthetic, candid reception documentary style'),
            (?, ?, 2500.00, 'Soft lilac and white garden roses with hanging botanical canopy')`,
    [eventId, categoryMap['catering'], eventId, categoryMap['photography'], eventId, categoryMap['decor-floral']]
  );

  // 6. Sample Bookings
  const lavishVendorId = vendorIdMap['vendor.lavish@eventease.com'];
  const lumiereVendorId = vendorIdMap['vendor.lumiere@eventease.com'];

  // Pending Booking with Lavish
  const [b1Res] = await conn.execute(
    `INSERT INTO bookings (event_id, customer_id, vendor_id, category_id, status, quote_amount, customer_notes, vendor_response)
     VALUES (?, ?, ?, ?, 'pending', 4800.00, 'We would love your 5-course banquet with custom dessert station.', NULL)`,
    [eventId, customerId, lavishVendorId, categoryMap['catering']]
  );

  // Accepted Booking with Lumière Photography
  const [b2Res] = await conn.execute(
    `INSERT INTO bookings (event_id, customer_id, vendor_id, category_id, status, quote_amount, customer_notes, vendor_response)
     VALUES (?, ?, ?, ?, 'accepted', 3600.00, 'We admire your soft, natural-light storytelling.', 'Delighted to capture your autumn wedding. I have locked the date in my calendar!')`,
    [eventId, customerId, lumiereVendorId, categoryMap['photography']]
  );

  // 7. Sample Review for Completed Past Booking
  // Create past event for customer 1
  const [pastEvtRes] = await conn.execute(
    `INSERT INTO events (customer_id, title, event_type, event_date, event_time, location, city, guest_count, total_budget, theme_style, description, status)
     VALUES (?, 'Montgomery Family Milestone Celebration', 'Anniversary', '2026-08-14', '18:00:00', 'The Clift Royal Sonesta Hotel', 'San Francisco', 60, 10000.00, 'Classic Vintage Romance', 'Silver anniversary celebration with family and friends.', 'completed')`,
    [customerId]
  );
  const pastEvtId = pastEvtRes.insertId;

  const [bPastRes] = await conn.execute(
    `INSERT INTO bookings (event_id, customer_id, vendor_id, category_id, status, quote_amount, customer_notes, vendor_response)
     VALUES (?, ?, ?, ?, 'completed', 2400.00, 'Need an intimate evening photo story.', 'A joy to photograph!')`,
    [pastEvtId, customerId, lumiereVendorId, categoryMap['photography']]
  );

  await conn.execute(
    `INSERT INTO reviews (booking_id, customer_id, vendor_id, rating, comment)
     VALUES (?, ?, ?, 5, 'Chloe was extraordinary! Every photograph felt like high-fashion poetry. Our family will treasure these images forever.')`,
    [bPastRes.insertId, customerId, lumiereVendorId]
  );

  // 8. Sample Conversation & Messages
  const [convRes] = await conn.execute(
    `INSERT INTO conversations (event_id, booking_id, customer_id, vendor_id)
     VALUES (?, ?, ?, ?)`,
    [eventId, b2Res.insertId, customerId, lumiereVendorId]
  );
  const convId = convRes.insertId;

  await conn.execute(
    `INSERT INTO messages (conversation_id, sender_id, content, is_read)
     VALUES (?, ?, 'Hi Chloe! We are so thrilled to connect with you regarding our November wedding.', TRUE),
            (?, (SELECT user_id FROM vendor_profiles WHERE id = ?), 'Hello Sophia! Congratulations! The Palace of Fine Arts has breathtaking light in late November. I cannot wait to work with you!', FALSE)`,
    [convId, c1UserId, convId, lumiereVendorId]
  );

  // 9. Sample Notifications
  await conn.execute(
    `INSERT INTO notifications (user_id, title, message, type, link_url, is_read)
     VALUES (?, 'Booking Accepted!', 'Lumière Fine Art Photography has accepted your booking request for Sophia & Oliver Autumn Gala.', 'success', '/customer/bookings', FALSE),
            ((SELECT user_id FROM vendor_profiles WHERE id = ?), 'New Booking Inquiry', 'You have a pending catering inquiry from Sophia Montgomery.', 'info', '/vendor/bookings', FALSE)`,
    [c1UserId, lavishVendorId]
  );

  // 10. Audit Activity Log
  await conn.execute(
    `INSERT INTO activity_logs (user_id, action, details, ip_address)
     VALUES (?, 'SYSTEM_INITIALIZED', 'EventEase database successfully initialized with verified seed dataset.', '127.0.0.1')`,
    [adminId]
  );

  await conn.end();
  console.log('🎉 Database initialization and seeding completed successfully!');
  console.log('\nDefault Test Accounts:');
  console.log('----------------------------------------------------');
  console.log('Admin:    admin@eventease.com      / password123');
  console.log('Customer: customer@eventease.com   / password123');
  console.log('Vendor:   vendor.lavish@eventease.com / password123');
  console.log('Vendor:   vendor.lumiere@eventease.com / password123');
  console.log('----------------------------------------------------');
}

initDatabase().catch((err) => {
  console.error('❌ Database Initialization Failed:', err);
  process.exit(1);
});
