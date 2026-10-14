import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function fixAuthAndPhones() {
  console.log('🔄 Starting Auth & Phone DB Normalization...');

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Razhmika#2096',
    database: process.env.DB_NAME || 'eventease_db'
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 1. Normalize existing phone numbers to clean 10-digit format
  const [users] = await db.query('SELECT id, phone FROM users WHERE phone IS NOT NULL');
  for (const u of users) {
    if (u.phone) {
      const cleanDigits = u.phone.replace(/\D/g, '');
      const tenDigits = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits.padEnd(10, '0');
      await db.query('UPDATE users SET phone = ? WHERE id = ?', [tenDigits, u.id]);
    }
  }
  console.log(`✅ Normalized ${users.length} phone numbers to 10 digits.`);

  // 2. Ensure explicit intuitive example.com demo accounts exist and link directly
  const demoAccounts = [
    {
      email: 'divya.makeup@example.com',
      role: 'vendor',
      first_name: 'Divya',
      last_name: 'Bharathi',
      phone: '9842677889',
      vendor_profile_id: 6
    },
    {
      email: 'priya.customer@example.com',
      role: 'customer',
      first_name: 'Priya',
      last_name: 'Ramanathan',
      phone: '9842212345',
      customer_profile_id: 1
    },
    {
      email: 'rightstudio@example.com',
      role: 'vendor',
      first_name: 'Ramesh',
      last_name: 'Kumar',
      phone: '9842122334',
      vendor_profile_id: 1
    },
    {
      email: 'kongumahal@example.com',
      role: 'vendor',
      first_name: 'Rangasamy',
      last_name: 'Gounder',
      phone: '9443055667',
      vendor_profile_id: 4
    },
    {
      email: 'admin@eventease.com',
      role: 'admin',
      first_name: 'Kavitha',
      last_name: 'Sundaram',
      phone: '9442211000'
    }
  ];

  for (const acc of demoAccounts) {
    const [exist] = await db.query('SELECT id FROM users WHERE email = ?', [acc.email]);
    let uid;
    if (exist.length === 0) {
      const [ins] = await db.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
         VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
        [acc.email, passwordHash, acc.role, acc.first_name, acc.last_name, acc.phone]
      );
      uid = ins.insertId;
      console.log(`   + Created account: ${acc.email} (ID: ${uid})`);
    } else {
      uid = exist[0].id;
      await db.query('UPDATE users SET password_hash = ?, is_active = TRUE, phone = ? WHERE id = ?', [passwordHash, acc.phone, uid]);
      console.log(`   * Updated account: ${acc.email} (ID: ${uid}) with Password123!`);
    }

    // Link customer profile if applicable
    if (acc.customer_profile_id) {
      const [cp] = await db.query('SELECT id FROM customer_profiles WHERE user_id = ?', [uid]);
      if (cp.length === 0) {
        await db.query(
          `INSERT INTO customer_profiles (user_id, city, preferred_theme, budget_tier, avatar_url)
           VALUES (?, 'Coimbatore', 'Traditional Tamil Wedding', 'Mid-to-High', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80')`,
          [uid]
        );
      }
    }
  }

  // Also ensure all existing seed accounts have working Password123!
  await db.query(
    `UPDATE users SET password_hash = ? WHERE email LIKE '%@eventease.local' OR email LIKE '%@eventease.com'`,
    [passwordHash]
  );
  console.log('✅ Synchronized Password123! across all @eventease.local and @eventease.com accounts.');

  await db.end();
  console.log('🎉 DB Auth & Phone Normalization complete!');
}

fixAuthAndPhones().catch(err => {
  console.error('Error during normalization:', err);
  process.exit(1);
});
