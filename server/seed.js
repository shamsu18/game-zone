import dotenv from 'dotenv';
dotenv.config();

import { connectDB, sequelize } from './config/db.js';
import { User, Station, Package, Tournament, Settings } from './models/index.js';

const seed = async () => {
  await connectDB();
  // Ensure tables exist before seeding
  await sequelize.sync();

  try {
    // ===== Admin =====
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gamezone.bd').toLowerCase();
    let admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = await User.create({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: adminEmail,
        phone: process.env.ADMIN_PHONE || '017000000000',
        password: process.env.ADMIN_PASSWORD || 'admin1234',
        role: 'admin',
      });
      console.log(`✔ Admin created: ${adminEmail} / ${process.env.ADMIN_PASSWORD || 'admin1234'}`);
    } else {
      console.log(`• Admin already exists: ${adminEmail}`);
    }

    // ===== Stations =====
    if ((await Station.count()) === 0) {
      await Station.bulkCreate([
        { name: 'PS5 Station 1', type: 'PS5', pricePerHour: 200, description: 'PlayStation 5 with 4K TV and DualSense controllers.', status: 'active' },
        { name: 'PS5 Station 2', type: 'PS5', pricePerHour: 200, description: 'PlayStation 5 with FIFA, Call of Duty and more.', status: 'active' },
        { name: 'Gaming PC 1', type: 'PC', pricePerHour: 150, description: 'RTX 4070, 240Hz monitor, mechanical keyboard.', status: 'active' },
        { name: 'VR Arena', type: 'VR', pricePerHour: 300, description: 'Meta Quest 3 immersive VR experiences.', status: 'active' },
        { name: 'Pool Table 1', type: 'Pool', pricePerHour: 250, description: 'Professional 8-ball pool table.', status: 'active' },
        { name: 'Snooker Table', type: 'Snooker', pricePerHour: 350, description: 'Full-size snooker table.', status: 'maintenance' },
      ]);
      console.log('✔ Sample stations created');
    }

    // ===== Packages =====
    if ((await Package.count()) === 0) {
      await Package.bulkCreate([
        { name: 'Happy Hour', price: 500, durationHours: 3, discountPercent: 15, description: '3 hours of gaming at a discounted rate. Weekdays only.', active: true },
        { name: 'Squad Combo', price: 1200, durationHours: 4, discountPercent: 20, description: '4 PS5 controllers, 4 hours. Perfect for friends.', active: true },
        { name: 'Weekend Warrior', price: 800, durationHours: 5, discountPercent: 10, description: '5 hours of PC gaming on the weekend.', active: true },
      ]);
      console.log('✔ Sample packages created');
    }

    // ===== Tournaments =====
    if ((await Tournament.count()) === 0) {
      const inTwoWeeks = new Date();
      inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
      await Tournament.bulkCreate([
        { title: 'FIFA 25 Champions Cup', description: 'Single-elimination FIFA 25 tournament. Prize pool ৳10,000.', date: inTwoWeeks, entryFee: 300, status: 'upcoming' },
        { title: 'Valorant 5v5 Showdown', description: 'Team-based Valorant competition. Bring your squad!', date: inTwoWeeks, entryFee: 500, status: 'upcoming' },
      ]);
      console.log('✔ Sample tournaments created');
    }

    // ===== Settings =====
    const settings = await Settings.getSingleton();
    if (!settings.contactEmail) {
      await settings.update({
        siteName: 'GameZone BD',
        contactPhone: '+880 1700-000000',
        contactEmail: 'hello@gamezone.bd',
        address: 'House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh',
        openingHours: '10:00 AM – 11:00 PM (Everyday)',
        socialLinks: {
          facebook: 'https://facebook.com/gamezonebd',
          instagram: 'https://instagram.com/gamezonebd',
          whatsapp: 'https://wa.me/8801700000000',
        },
        offers: [
          { title: 'Student Discount', description: '20% off on weekdays with a valid student ID.', image: '' },
        ],
        testimonials: [
          { name: 'Rakib H.', message: 'Best gaming lounge in Dhaka! The PS5 setup is amazing.', avatar: '' },
          { name: 'Nabila K.', message: 'Loved the VR experience. Staff were super friendly.', avatar: '' },
        ],
      });
      console.log('✔ Default settings created');
    }

    console.log('\n✅ Seeding complete.');
  } catch (err) {
    console.error('✖ Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seed();
