import pool from '../src/config/db.js';

async function migrate() {
  try {
    console.log('🚀 Running migration for service-specific booking forms...');

    // 1. Add service_requirements to bookings if not present
    const [bCols] = await pool.query('DESCRIBE bookings');
    const hasServiceReq = bCols.some(c => c.Field === 'service_requirements');
    if (!hasServiceReq) {
      console.log('Adding service_requirements column to bookings...');
      await pool.query('ALTER TABLE bookings ADD COLUMN service_requirements JSON NULL AFTER quote_amount');
      console.log('✅ Added service_requirements to bookings.');
    } else {
      console.log('ℹ️ service_requirements already exists in bookings.');
    }

    // 2. Add address to vendor_profiles if not present
    const [vCols] = await pool.query('DESCRIBE vendor_profiles');
    const hasAddress = vCols.some(c => c.Field === 'address');
    if (!hasAddress) {
      console.log('Adding address column to vendor_profiles...');
      await pool.query('ALTER TABLE vendor_profiles ADD COLUMN address VARCHAR(255) NULL AFTER city');
      console.log('✅ Added address to vendor_profiles.');
    } else {
      console.log('ℹ️ address already exists in vendor_profiles.');
    }

    // 3. Update addresses for existing vendors
    const vendorAddresses = [
      { name: '%Right Studio%', addr: 'Crosscut Road, Gandhipuram, Coimbatore, Tamil Nadu 641012' },
      { name: '%Annapoorna%', addr: '75 Dr. Nanjappa Road, Near Central Bus Stand, Coimbatore, Tamil Nadu 641018' },
      { name: '%Kongu Mahal%', addr: 'Avinashi Road, Near Hope College, Peelamedu, Coimbatore, Tamil Nadu 641004' },
      { name: '%Divya Bridal%', addr: '124 D.B. Road, R.S. Puram, Coimbatore, Tamil Nadu 641002' },
      { name: '%Murugan Wedding%', addr: 'Sathy Road, Saravanampatti, Coimbatore, Tamil Nadu 641035' },
      { name: '%Beatbox DJ%', addr: 'Trichy Road, Ramanathapuram, Coimbatore, Tamil Nadu 641045' },
      { name: '%Kovai Event Planners%', addr: '100 Feet Road, Tatabad, Coimbatore, Tamil Nadu 641012' },
      { name: '%Pixel Moments%', addr: 'Kumaran Road, Near Railway Station, Tiruppur, Tamil Nadu 641601' },
      { name: '%Sri Lakshmi%', addr: 'Brough Road, Erode, Tamil Nadu 638001' },
      { name: '%Malar Wedding%', addr: 'Mettupalayam Road, Thudiyalur, Coimbatore, Tamil Nadu 641034' },
      { name: '%Happy Moments%', addr: 'Vadavalli Main Road, Coimbatore, Tamil Nadu 641041' },
      { name: '%Royal Stage%', addr: 'Omalur Main Road, Fairlands, Salem, Tamil Nadu 636016' }
    ];

    for (const item of vendorAddresses) {
      await pool.query('UPDATE vendor_profiles SET address = ? WHERE business_name LIKE ?', [item.addr, item.name]);
    }
    console.log('✅ Updated all vendor profile addresses.');

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
