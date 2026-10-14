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
  console.log('🚀 Starting Database Initialization (Tamil Nadu / Coimbatore Localized Dataset)...');

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
  console.log('⏳ Executing schema.sql tables, constraints, and indexes...');
  await conn.query(schemaSql);
  console.log('✅ Schema tables and foreign keys created successfully.');

  // Step 4: Seed initial data
  console.log('⏳ Seeding localized Coimbatore & Tamil Nadu vendors, customers, events, and reviews...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 1. Admin Users (support both @eventease.local and @eventease.com)
  const [adminResult] = await conn.execute(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
     VALUES (?, ?, 'admin', 'Kavitha', 'Sundaram', '+91 94422 11000', TRUE)`,
    ['admin@eventease.local', passwordHash]
  );
  const adminId = adminResult.insertId;

  await conn.execute(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
     VALUES (?, ?, 'admin', 'Kavitha', 'Sundaram', '+91 94422 11000', TRUE)`,
    ['admin@eventease.com', passwordHash]
  );

  // 2. Service Categories (7 localized categories)
  const categoriesData = [
    {
      name: 'Catering & Food Services',
      slug: 'catering',
      description: 'Vegetarian and non-vegetarian catering for weddings, birthdays and family functions.',
      icon_name: 'Utensils',
      budget_pct: 35
    },
    {
      name: 'Photography & Videography',
      slug: 'photography',
      description: 'Wedding, birthday and reception photography with edited photos and video.',
      icon_name: 'Camera',
      budget_pct: 15
    },
    {
      name: 'Marriage Halls & Venues',
      slug: 'venues',
      description: 'Function hall for weddings, receptions, engagements and family celebrations.',
      icon_name: 'Castle',
      budget_pct: 25
    },
    {
      name: 'Stage & Flower Decoration',
      slug: 'decor-floral',
      description: 'Wedding stage decoration, flower decoration, entrance decoration and reception setup.',
      icon_name: 'Flower2',
      budget_pct: 12
    },
    {
      name: 'DJ & Sound Services',
      slug: 'music-dj',
      description: 'DJ music, speakers, microphones and sound systems for weddings and celebrations.',
      icon_name: 'Music',
      budget_pct: 8
    },
    {
      name: 'Event Planning & Coordination',
      slug: 'event-planning',
      description: 'We help arrange decorations, catering, photography and other services for your event.',
      icon_name: 'CalendarHeart',
      budget_pct: 5
    },
    {
      name: 'Bridal Makeup & Styling',
      slug: 'bridal-makeup',
      description: 'Bridal makeup, engagement makeup and party makeup for special occasions.',
      icon_name: 'Sparkles',
      budget_pct: 10
    }
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

  // 3. Localized Vendors (12 realistic Tamil Nadu / Coimbatore vendors)
  const vendorsData = [
    {
      email: 'vendor1@eventease.local',
      alt_email: 'vendor.rightstudio@eventease.com',
      legacy_email: 'vendor.lumiere@eventease.com',
      first_name: 'Ramesh',
      last_name: 'Kumar',
      phone: '+91 98421 22334',
      business_name: 'Right Studio Photography',
      bio: 'Wedding, birthday and reception photography with edited photos and video.',
      city: 'Coimbatore',
      service_radius_km: 75,
      starting_price: 25000.00,
      rating: 4.95,
      review_count: 38,
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80',
      category: 'photography',
      services: [
        { title: 'Wedding Photography', desc: 'Wedding and reception photography with candid shots and high-resolution digital album.', price: 25000.00, unit: 'event' },
        { title: 'Candid Photography', desc: 'Dedicated candid photographer capturing authentic moments and emotions.', price: 15000.00, unit: 'event' },
        { title: 'Wedding Videography', desc: 'Cinematic HD wedding video, teaser video and full event coverage.', price: 20000.00, unit: 'event' },
        { title: 'Album Printing', desc: 'Premium 40-page customized photo album with velvet box packaging.', price: 8000.00, unit: 'event' },
        { title: 'Birthday Photography', desc: 'Complete photography coverage for birthday party and family moments.', price: 8000.00, unit: 'event' }
      ],
      portfolio: [
        { url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80', caption: 'Traditional Wedding Photography' },
        { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80', caption: 'Candid Wedding Moments' },
        { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', caption: 'Reception Photoshoot' }
      ]
    },
    {
      email: 'vendor2@eventease.local',
      alt_email: 'vendor.annapoorna@eventease.com',
      legacy_email: 'vendor.lavish@eventease.com',
      first_name: 'Sundaram',
      last_name: 'Chettiar',
      phone: '+91 98425 33445',
      business_name: 'Kovai Annapoorna Catering Services',
      bio: 'Vegetarian and non-vegetarian catering for weddings, birthdays and family functions.',
      city: 'Coimbatore',
      service_radius_km: 65,
      starting_price: 350.00,
      rating: 4.92,
      review_count: 52,
      avatar_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=1200&q=80',
      category: 'catering',
      services: [
        { title: 'Wedding Catering', desc: 'Grand South Indian traditional wedding feast with 21 items on plantain leaf.', price: 450.00, unit: 'plate' },
        { title: 'Lunch Catering', desc: 'Authentic vegetarian lunch feast with sweets, vadai, sambar and rasam.', price: 350.00, unit: 'plate' },
        { title: 'Dinner Catering', desc: 'Evening dinner buffet with live dosa, poori and variety rice counters.', price: 400.00, unit: 'plate' },
        { title: 'Buffet Catering', desc: 'Grand reception dinner buffet with soup, live chaat, starters and desserts.', price: 550.00, unit: 'plate' }
      ],
      portfolio: [
        { url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80', caption: 'Vegetarian Wedding Buffet' },
        { url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80', caption: 'Traditional Banana Leaf Feast' },
        { url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80', caption: 'Evening Reception Buffet' }
      ]
    },
    {
      email: 'vendor3@eventease.local',
      alt_email: 'vendor.murugan@eventease.com',
      legacy_email: 'vendor.botanica@eventease.com',
      first_name: 'Murugan',
      last_name: 'Palanisamy',
      phone: '+91 98428 44556',
      business_name: 'Sri Murugan Wedding Decorations',
      bio: 'Wedding stage decoration, flower decoration, entrance decoration and reception setup.',
      city: 'Coimbatore',
      service_radius_km: 70,
      starting_price: 20000.00,
      rating: 4.88,
      review_count: 29,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80',
      category: 'decor-floral',
      services: [
        { title: 'Wedding Stage Decoration', desc: 'Traditional muhurtham stage decoration with fresh flower backdrop and pillars.', price: 25000.00, unit: 'event' },
        { title: 'Flower Decoration', desc: 'Fresh jasmine, rose and marigold floral setup for stage and hall.', price: 15000.00, unit: 'event' },
        { title: 'Reception Decoration', desc: 'Modern reception backdrop with subtle lighting and pastel flower draping.', price: 20000.00, unit: 'event' },
        { title: 'Floral Entrance Decoration', desc: 'Grand fresh flower entrance archway with welcome board setup.', price: 12000.00, unit: 'event' }
      ],
      portfolio: [
        { url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', caption: 'Wedding Stage Decoration' },
        { url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80', caption: 'Floral Entrance Decoration' },
        { url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80', caption: 'Reception Stage Setup' }
      ]
    },
    {
      email: 'vendor4@eventease.local',
      alt_email: 'vendor.kongumahal@eventease.com',
      legacy_email: 'vendor.monarch@eventease.com',
      first_name: 'Rangasamy',
      last_name: 'Gounder',
      phone: '+91 94430 55667',
      business_name: 'Kongu Mahal',
      bio: 'Function hall for weddings, receptions, engagements and family celebrations.',
      city: 'Coimbatore',
      service_radius_km: 50,
      starting_price: 40000.00,
      rating: 4.94,
      review_count: 46,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
      category: 'venues',
      services: [
        { title: 'Marriage Hall Booking', desc: 'Air-conditioned hall with 800 seating capacity, dining hall and 6 AC rooms.', price: 50000.00, unit: 'day' },
        { title: 'Reception Hall Booking', desc: 'Evening reception booking with lighting, generator backup and parking for 150 cars.', price: 35000.00, unit: 'event' },
        { title: 'Engagement Hall Booking', desc: 'Mini hall rental for engagements, family functions and naming ceremonies.', price: 20000.00, unit: 'event' }
      ],
      portfolio: [
        { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', caption: 'Reception Hall Setup' },
        { url: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=800&q=80', caption: 'Marriage Hall Interior' },
        { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', caption: 'Dining Hall Area' }
      ]
    },
    {
      email: 'vendor5@eventease.local',
      alt_email: 'vendor.kovaievents@eventease.com',
      legacy_email: 'vendor.serene@eventease.com',
      first_name: 'Senthil',
      last_name: 'Nathan',
      phone: '+91 98432 66778',
      business_name: 'Kovai Event Planners',
      bio: 'We help arrange decorations, catering, photography and other services for your event.',
      city: 'Coimbatore',
      service_radius_km: 80,
      starting_price: 30000.00,
      rating: 4.96,
      review_count: 34,
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
      category: 'event-planning',
      services: [
        { title: 'Wedding Planning', desc: 'Complete wedding coordination including vendor booking, guest hospitality and schedule management.', price: 50000.00, unit: 'event' },
        { title: 'Birthday Planning', desc: 'Full birthday celebration arrangement with theme decor, cake, DJ and entertainment.', price: 15000.00, unit: 'event' },
        { title: 'Corporate Event Planning', desc: 'Corporate seminars, award ceremonies and annual day event coordination.', price: 35000.00, unit: 'event' }
      ],
      portfolio: [
        { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80', caption: 'Wedding Planning Setup' },
        { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80', caption: 'College Event Stage' },
        { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', caption: 'Corporate Annual Day Setup' }
      ]
    },
    {
      email: 'vendor6@eventease.local',
      alt_email: 'vendor.divyamakeup@eventease.com',
      first_name: 'Divya',
      last_name: 'Bharathi',
      phone: '+91 98426 77889',
      business_name: 'Divya Bridal Makeup Studio',
      bio: 'Bridal makeup, engagement makeup and party makeup for special occasions.',
      city: 'Coimbatore',
      service_radius_km: 50,
      starting_price: 10000.00,
      rating: 4.97,
      review_count: 41,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&q=80',
      category: 'bridal-makeup',
      services: [
        { title: 'Bridal Makeup', desc: 'HD bridal makeup with saree draping, hairstyling, flower setting and accessories.', price: 15000.00, unit: 'event' },
        { title: 'Reception Makeup', desc: 'Glamorous evening reception look with airbrush makeup and elegant hair styling.', price: 10000.00, unit: 'event' },
        { title: 'Party Makeup', desc: 'Natural party and family makeup for engagement or anniversary celebrations.', price: 6000.00, unit: 'event' }
      ],
      portfolio: [
        { url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80', caption: 'Bridal Makeup' },
        { url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80', caption: 'Reception Look Styling' },
        { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', caption: 'Traditional Muhurtham Makeup' }
      ]
    },
    {
      email: 'vendor7@eventease.local',
      alt_email: 'vendor.beatbox@eventease.com',
      legacy_email: 'vendor.velvet@eventease.com',
      first_name: 'Vignesh',
      last_name: 'Sundar',
      phone: '+91 98435 88990',
      business_name: 'Beatbox DJ and Sound Services',
      bio: 'DJ music, speakers, microphones and sound systems for weddings and celebrations.',
      city: 'Coimbatore',
      service_radius_km: 60,
      starting_price: 12000.00,
      rating: 4.91,
      review_count: 28,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80',
      category: 'music-dj',
      services: [
        { title: 'Wedding DJ', desc: 'High-energy wedding sangeet and reception DJ with Tamil, Hindi and Western hits.', price: 18000.00, unit: 'event' },
        { title: 'Birthday DJ', desc: 'Fun DJ party set with sound system and moving party lights for birthdays.', price: 12000.00, unit: 'event' },
        { title: 'Sound System Rental', desc: 'Professional JBL speakers, wireless microphones, podium audio and mixer setup.', price: 8000.00, unit: 'day' }
      ],
      portfolio: [
        { url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80', caption: 'Wedding DJ & Sound Setup' },
        { url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', caption: 'Dance Floor Lighting' },
        { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', caption: 'Stage Sound System' }
      ]
    },
    {
      email: 'vendor8@eventease.local',
      alt_email: 'vendor.pixelmoments@eventease.com',
      first_name: 'Pravin',
      last_name: 'Kumar',
      phone: '+91 97890 12345',
      business_name: 'Pixel Moments Photography',
      bio: 'Candid wedding photography, pre-wedding outdoor shoots, and cinematic teasers.',
      city: 'Tiruppur',
      service_radius_km: 70,
      starting_price: 22000.00,
      rating: 4.89,
      review_count: 25,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80',
      category: 'photography',
      services: [
        { title: 'Wedding Photography', desc: 'Candid wedding coverage with teaser video, photo highlights and online gallery.', price: 25000.00, unit: 'event' },
        { title: 'Pre-Wedding Shoot', desc: 'Outdoor scenic pre-wedding shoot with stylized photos and reels.', price: 15000.00, unit: 'event' },
        { title: 'Reception Photography', desc: 'Full evening reception photography and family portrait sessions.', price: 12000.00, unit: 'event' }
      ],
      portfolio: [
        { url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80', caption: 'Candid Wedding Moments' },
        { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', caption: 'Pre-Wedding Shoot' },
        { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', caption: 'Outdoor Portrait' }
      ]
    },
    {
      email: 'vendor9@eventease.local',
      alt_email: 'vendor.srilakshmi@eventease.com',
      first_name: 'Lakshmi',
      last_name: 'Narayanan',
      phone: '+91 94432 23456',
      business_name: 'Sri Lakshmi Catering Services',
      bio: 'Authentic Kongu-style vegetarian and non-vegetarian feasts for traditional functions.',
      city: 'Erode',
      service_radius_km: 65,
      starting_price: 300.00,
      rating: 4.87,
      review_count: 31,
      avatar_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
      category: 'catering',
      services: [
        { title: 'Wedding Catering', desc: 'Kongu traditional feast with chicken chukka, mutton biryani or pure veg options.', price: 400.00, unit: 'plate' },
        { title: 'Lunch Catering', desc: 'Authentic family function lunch with sambar, rasam, kootu, poriyal and payasam.', price: 300.00, unit: 'plate' },
        { title: 'Buffet Catering', desc: 'Grand reception dinner buffet with variety rice, chapathi, veg gravies and ice cream.', price: 450.00, unit: 'plate' }
      ],
      portfolio: [
        { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', caption: 'Kongu Style Feast' },
        { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', caption: 'Live Dosa Counter' },
        { url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80', caption: 'Traditional Sweets & Snacks' }
      ]
    },
    {
      email: 'vendor10@eventease.local',
      alt_email: 'vendor.malar@eventease.com',
      first_name: 'Malathi',
      last_name: 'Krishnan',
      phone: '+91 98423 34567',
      business_name: 'Malar Wedding Decorators',
      bio: 'Fresh jasmine, marigold, and rose flower decorations for temple and hall weddings.',
      city: 'Coimbatore',
      service_radius_km: 55,
      starting_price: 15000.00,
      rating: 4.90,
      review_count: 27,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1200&q=80',
      category: 'decor-floral',
      services: [
        { title: 'Wedding Stage Decoration', desc: 'Fresh flower mandap decoration with jasmine garlands and marigold pillars.', price: 20000.00, unit: 'event' },
        { title: 'Flower Decoration', desc: 'Traditional entrance arch and pathway flower setup with brass vilakku.', price: 12000.00, unit: 'event' },
        { title: 'Floral Entrance Decoration', desc: 'Grand fresh flower entrance archway with welcome board setup.', price: 12000.00, unit: 'event' },
        { title: 'Car Flower Decoration', desc: 'Elegant fresh flower decoration for bride & groom arrival car.', price: 4000.00, unit: 'event' }
      ],
      portfolio: [
        { url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80', caption: 'Fresh Flower Mandap' },
        { url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', caption: 'Jasmine Floral Garland' },
        { url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80', caption: 'Floral Entrance Decoration' }
      ]
    },
    {
      email: 'vendor11@eventease.local',
      alt_email: 'vendor.happymoments@eventease.com',
      first_name: 'Anitha',
      last_name: 'Raj',
      phone: '+91 98424 45678',
      business_name: 'Happy Moments Event Decor',
      bio: 'Birthday balloon decoration, theme backdrops and lighting for parties.',
      city: 'Coimbatore',
      service_radius_km: 45,
      starting_price: 7000.00,
      rating: 4.93,
      review_count: 36,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&q=80',
      category: 'decor-floral',
      services: [
        { title: 'Birthday Decoration', desc: 'Custom theme balloon backdrop, cake table setup and welcome standee.', price: 7000.00, unit: 'event' },
        { title: 'Theme Stage Backdrop', desc: 'Kids cartoon or superhero theme 3D cutouts with LED backlighting.', price: 10000.00, unit: 'event' },
        { title: 'Baby Shower Decoration', desc: 'Pastel balloon arch, flower ring backdrop and fairy light decor.', price: 8000.00, unit: 'event' }
      ],
      portfolio: [
        { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80', caption: 'Birthday Party Decoration' },
        { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80', caption: 'Theme Balloon Arch' },
        { url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80', caption: 'Baby Shower Backdrop' }
      ]
    },
    {
      email: 'vendor12@eventease.local',
      alt_email: 'vendor.royalstage@eventease.com',
      first_name: 'Shanmugam',
      last_name: 'Velu',
      phone: '+91 94435 56789',
      business_name: 'Royal Stage Decorations',
      bio: 'Grand wedding stage backdrops, LED lighting setups, and reception stages.',
      city: 'Salem',
      service_radius_km: 75,
      starting_price: 18000.00,
      rating: 4.86,
      review_count: 22,
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
      banner_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
      category: 'decor-floral',
      services: [
        { title: 'Wedding Stage Decoration', desc: 'Grand reception stage with fiber pillars, warm crystal lighting and floral draping.', price: 28000.00, unit: 'event' },
        { title: 'Reception Decoration', desc: 'LED stage setup with geometric frames and elegant floral centerpieces.', price: 18000.00, unit: 'event' },
        { title: 'Stage Lighting Setup', desc: 'Complete pathway, truss and ceiling ambient lighting for marriage hall.', price: 12000.00, unit: 'event' }
      ],
      portfolio: [
        { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', caption: 'Grand Stage Backdrop' },
        { url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80', caption: 'LED Pathway Lighting' },
        { url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', caption: 'Reception Stage' }
      ]
    }
  ];

  const vendorIdMap = {};
  const vendorServiceIdMap = {};

  for (const v of vendorsData) {
    // Insert primary user
    const [uRes] = await conn.execute(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
       VALUES (?, ?, 'vendor', ?, ?, ?, TRUE)`,
      [v.email, passwordHash, v.first_name, v.last_name, v.phone]
    );
    const userId = uRes.insertId;

    // Create vendor profile
    const [vRes] = await conn.execute(
      `INSERT INTO vendor_profiles (user_id, business_name, bio, city, service_radius_km, starting_price, verification_status, average_rating, review_count, avatar_url, banner_url)
       VALUES (?, ?, ?, ?, ?, ?, 'verified', ?, ?, ?, ?)`,
      [userId, v.business_name, v.bio, v.city, v.service_radius_km, v.starting_price, v.rating, v.review_count, v.avatar_url, v.banner_url]
    );
    const vendorId = vRes.insertId;
    vendorIdMap[v.email] = vendorId;
    if (v.alt_email) vendorIdMap[v.alt_email] = vendorId;
    if (v.legacy_email) vendorIdMap[v.legacy_email] = vendorId;

    // Also insert alt email account so either login works
    if (v.alt_email) {
      await conn.execute(
        `INSERT IGNORE INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
         VALUES (?, ?, 'vendor', ?, ?, ?, TRUE)`,
        [v.alt_email, passwordHash, v.first_name, v.last_name, v.phone]
      );
    }
    if (v.legacy_email) {
      await conn.execute(
        `INSERT IGNORE INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
         VALUES (?, ?, 'vendor', ?, ?, ?, TRUE)`,
        [v.legacy_email, passwordHash, v.first_name, v.last_name, v.phone]
      );
    }

    // Insert Services
    const catId = categoryMap[v.category];
    vendorServiceIdMap[vendorId] = [];
    for (const s of v.services) {
      const [sRes] = await conn.execute(
        `INSERT INTO vendor_services (vendor_id, category_id, title, description, price, pricing_unit)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [vendorId, catId, s.title, s.desc, s.price, s.unit || 'event']
      );
      vendorServiceIdMap[vendorId].push({ id: sRes.insertId, title: s.title, price: s.price });
    }

    // Insert Portfolio
    for (let i = 0; i < v.portfolio.length; i++) {
      await conn.execute(
        `INSERT INTO vendor_portfolio (vendor_id, image_url, caption, is_featured)
         VALUES (?, ?, ?, ?)`,
        [vendorId, v.portfolio[i].url, v.portfolio[i].caption, i === 0]
      );
    }

    // Availability defaults
    await conn.execute(
      `INSERT INTO vendor_availability (vendor_id, date, status, notes)
       VALUES (?, '2026-11-15', 'blocked', 'Diwali Festive Holiday'), (?, '2026-11-28', 'available', 'Prime Auspicious Muhurtham Date')`,
      [vendorId, vendorId]
    );
  }

  // 4. Localized Demo Customers (Priya Ramanathan & Karthik Subramanian)
  const [c1User] = await conn.execute(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
     VALUES (?, ?, 'customer', 'Priya', 'Ramanathan', '+91 98422 12345', TRUE)`,
    ['customer@eventease.local', passwordHash]
  );
  const c1UserId = c1User.insertId;

  // Also support customer@eventease.com
  await conn.execute(
    `INSERT IGNORE INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
     VALUES (?, ?, 'customer', 'Priya', 'Ramanathan', '+91 98422 12345', TRUE)`,
    ['customer@eventease.com', passwordHash]
  );

  const [c1Prof] = await conn.execute(
    `INSERT INTO customer_profiles (user_id, city, preferred_theme, budget_tier, avatar_url)
     VALUES (?, 'Coimbatore', 'Traditional Tamil Wedding & Floral Decor', '₹1,00,000 - ₹3,00,000', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80')`,
    [c1UserId]
  );
  const customerId = c1Prof.insertId;

  const [c2User] = await conn.execute(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
     VALUES (?, ?, 'customer', 'Karthik', 'Subramanian', '+91 94433 67890', TRUE)`,
    ['karthik@eventease.local', passwordHash]
  );
  const c2UserId = c2User.insertId;
  await conn.execute(
    `INSERT INTO customer_profiles (user_id, city, preferred_theme, budget_tier, avatar_url)
     VALUES (?, 'Coimbatore', 'Simple Birthday Celebration', 'Under ₹50,000', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80')`,
    [c2UserId]
  );

  const [c3User] = await conn.execute(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
     VALUES (?, ?, 'customer', 'Arjun', 'Natarajan', '+91 98940 54321', TRUE)`,
    ['arjun@eventease.local', passwordHash]
  );
  const c3UserId = c3User.insertId;
  await conn.execute(
    `INSERT INTO customer_profiles (user_id, city, preferred_theme, budget_tier, avatar_url)
     VALUES (?, 'Tiruppur', 'Modern Wedding Reception', '₹3,00,000+', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80')`,
    [c3UserId]
  );

  // 5. Localized Events for Customer 1 (Priya)
  // Event 1: Arjun's Wedding Reception (Active Booking in Progress)
  const [evtRes] = await conn.execute(
    `INSERT INTO events (customer_id, title, event_type, event_date, event_time, location, city, guest_count, total_budget, theme_style, description, status)
     VALUES (?, 'Arjun\\'s Wedding Reception', 'Wedding', '2026-11-28', '18:30:00', 'Kongu Mahal, Avinashi Road', 'Coimbatore', 350, 250000.00, 'Traditional Tamil Wedding', 'Traditional wedding reception with floral stage decoration, South Indian dinner feast, and photo coverage.', 'booking_in_progress')`,
    [customerId]
  );
  const eventId = evtRes.insertId;

  // Event Requirements
  await conn.execute(
    `INSERT INTO event_requirements (event_id, category_id, allocated_budget, special_requests)
     VALUES (?, ?, 100000.00, 'Pure vegetarian traditional South Indian dinner feast with live dosa and payasam counters for 350 guests.'),
            (?, ?, 35000.00, 'Candid and traditional photo coverage with edited wedding album.'),
            (?, ?, 30000.00, 'Lavender and white flower stage backdrop with entrance garland arch.')`,
    [eventId, categoryMap['catering'], eventId, categoryMap['photography'], eventId, categoryMap['decor-floral']]
  );

  // 6. Sample Bookings for Event 1
  const rightStudioVendorId = vendorIdMap['vendor1@eventease.local'];
  const annapoornaVendorId = vendorIdMap['vendor2@eventease.local'];
  const muruganVendorId = vendorIdMap['vendor3@eventease.local'];

  const rightStudioServices = vendorServiceIdMap[rightStudioVendorId] || [];
  const annapoornaServices = vendorServiceIdMap[annapoornaVendorId] || [];
  const muruganServices = vendorServiceIdMap[muruganVendorId] || [];

  // Pending Booking with Right Studio Photography
  const [b1Res] = await conn.execute(
    `INSERT INTO bookings (event_id, customer_id, vendor_id, category_id, service_id, status, quote_amount, customer_notes, vendor_response)
     VALUES (?, ?, ?, ?, ?, 'pending', 25000.00, 'We need wedding and reception photography with traditional albums for 350 guests at Kongu Mahal.', NULL)`,
    [eventId, customerId, rightStudioVendorId, categoryMap['photography'], rightStudioServices[0]?.id || null]
  );

  // Accepted Booking with Kovai Annapoorna Catering Services
  const [b2Res] = await conn.execute(
    `INSERT INTO bookings (event_id, customer_id, vendor_id, category_id, service_id, status, quote_amount, customer_notes, vendor_response)
     VALUES (?, ?, ?, ?, ?, 'accepted', 75000.00, 'Dinner feast for 350 guests with traditional sweets and live dosa counters.', 'Vanakkam! Delighted to cater for Arjun\\'s wedding reception. We will arrange live dosa counters and our signature Kovai payasam.')`,
    [eventId, customerId, annapoornaVendorId, categoryMap['catering'], annapoornaServices[0]?.id || null]
  );

  // Accepted Booking with Sri Murugan Wedding Decorations
  await conn.execute(
    `INSERT INTO bookings (event_id, customer_id, vendor_id, category_id, service_id, status, quote_amount, customer_notes, vendor_response)
     VALUES (?, ?, ?, ?, ?, 'accepted', 25000.00, 'Lavender and white fresh flower stage decoration for reception.', 'Thank you! We have reserved the date and will prepare a grand stage backdrop with fresh jasmine and roses.')`,
    [eventId, customerId, muruganVendorId, categoryMap['decor-floral'], muruganServices[0]?.id || null]
  );

  // 7. Completed Past Event & Verified Review
  const [pastEvtRes] = await conn.execute(
    `INSERT INTO events (customer_id, title, event_type, event_date, event_time, location, city, guest_count, total_budget, theme_style, description, status)
     VALUES (?, 'Karthik\\'s Birthday Celebration', 'Birthday', '2026-08-14', '17:00:00', 'Fun Republic Party Hall, Peelamedu', 'Coimbatore', 50, 35000.00, 'Simple Birthday Celebration', 'Birthday celebration with balloon decor, DJ sound system, and snacks catering.', 'completed')`,
    [customerId]
  );
  const pastEvtId = pastEvtRes.insertId;

  const happyMomentsVendorId = vendorIdMap['vendor11@eventease.local'];
  const happyMomentsServices = vendorServiceIdMap[happyMomentsVendorId] || [];

  const [bPastRes] = await conn.execute(
    `INSERT INTO bookings (event_id, customer_id, vendor_id, category_id, service_id, status, quote_amount, customer_notes, vendor_response)
     VALUES (?, ?, ?, ?, ?, 'completed', 7000.00, 'Jungle theme balloon decoration and entrance arch for birthday.', 'Thank you for having Happy Moments decorate for Karthik\\'s special day!')`,
    [pastEvtId, customerId, happyMomentsVendorId, categoryMap['decor-floral'], happyMomentsServices[0]?.id || null]
  );

  await conn.execute(
    `INSERT INTO reviews (booking_id, customer_id, vendor_id, rating, comment)
     VALUES (?, ?, ?, 5, 'Happy Moments did a wonderful balloon setup for my son\\'s birthday! The kids loved it and the decoration was ready on time.')`,
    [bPastRes.insertId, customerId, happyMomentsVendorId]
  );

  // 8. Sample Conversation & Chat Messages
  const [convRes] = await conn.execute(
    `INSERT INTO conversations (event_id, booking_id, customer_id, vendor_id)
     VALUES (?, ?, ?, ?)`,
    [eventId, b1Res.insertId, customerId, rightStudioVendorId]
  );
  const convId = convRes.insertId;

  const [vUserRight] = await conn.execute(`SELECT user_id FROM vendor_profiles WHERE id = ?`, [rightStudioVendorId]);
  const rightStudioUserId = vUserRight[0].user_id;

  await conn.execute(
    `INSERT INTO messages (conversation_id, sender_id, content, is_read)
     VALUES (?, ?, 'Vanakkam! We are looking for wedding photography for Arjun\\'s Wedding Reception in November at Kongu Mahal, Coimbatore.', TRUE),
            (?, ?, 'Vanakkam Priya! We would love to capture your celebration. We specialize in both traditional muhurtham and candid shots.', FALSE)`,
    [convId, c1UserId, convId, rightStudioUserId]
  );

  // 9. Sample Notifications
  await conn.execute(
    `INSERT INTO notifications (user_id, title, message, type, link_url, is_read)
     VALUES (?, 'Booking Accepted!', 'Kovai Annapoorna Catering Services has accepted your booking request for Arjun\\'s Wedding Reception.', 'success', '/customer/bookings', FALSE),
            (?, 'New Booking Inquiry', 'You have a pending photography inquiry from Priya Ramanathan for Arjun\\'s Wedding Reception.', 'info', '/vendor/bookings', FALSE)`,
    [c1UserId, rightStudioUserId]
  );

  // 10. Audit Activity Log
  await conn.execute(
    `INSERT INTO activity_logs (user_id, action, details, ip_address)
     VALUES (?, 'SYSTEM_LOCALIZED', 'EventEase database successfully localized for Coimbatore, Tamil Nadu with verified Indian vendor dataset.', '127.0.0.1')`,
    [adminId]
  );

  await conn.end();
  console.log('🎉 Localized database initialization and seeding completed successfully!');
  console.log('\nDefault Test Accounts (Password: Password123!):');
  console.log('----------------------------------------------------');
  console.log('Admin:    admin@eventease.local    / Password123!');
  console.log('Customer: customer@eventease.local / Password123!');
  console.log('Vendor 1 (Photography): vendor1@eventease.local / Password123!');
  console.log('Vendor 2 (Catering):    vendor2@eventease.local / Password123!');
  console.log('----------------------------------------------------');
}

initDatabase().catch((err) => {
  console.error('❌ Database Initialization Failed:', err);
  process.exit(1);
});
