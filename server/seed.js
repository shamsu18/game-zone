import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Station from './models/Station.js';
import Package from './models/Package.js';
import Tournament from './models/Tournament.js';
import Settings from './models/Settings.js';

const seed = async () => {
  await connectDB();

  try {
    // ===== Admin =====
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gamezone.bd').toLowerCase();
    let admin = await User.findOne({ email: adminEmail });
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
    if ((await Station.countDocuments()) === 0) {
      await Station.insertMany([
        {
          name: 'PS5 Station 1',
          type: 'PS5',
          pricePerHour: 200,
          description: 'PlayStation 5 with 4K TV and DualSense controllers.',
          image: '',
          status: 'active',
        },
        {
          name: 'PS5 Station 2',
          type: 'PS5',
          pricePerHour: 200,
          description: 'PlayStation 5 with FIFA, Call of Duty and more.',
          status: 'active',
        },
        {
          name: 'Gaming PC 1',
          type: 'PC',
          pricePerHour: 150,
          description: 'RTX 4070, 240Hz monitor, mechanical keyboard.',
          status: 'active',
        },
        {
          name: 'VR Arena',
          type: 'VR',
          pricePerHour: 300,
          description: 'Meta Quest 3 immersive VR experiences.',
          status: 'active',
        },
        {
          name: 'Pool Table 1',
          type: 'Pool',
          pricePerHour: 250,
          description: 'Professional 8-ball pool table.',
          status: 'active',
        },
        {
          name: 'Snooker Table',
          type: 'Snooker',
          pricePerHour: 350,
          description: 'Full-size snooker table.',
          status: 'maintenance',
        },
      ]);
      console.log('✔ Sample stations created');
    }

    // ===== Packages =====
    if ((await Package.countDocuments()) === 0) {
      await Package.insertMany([
        {
          name: 'Happy Hour',
          price: 500,
          durationHours: 3,
          discountPercent: 15,
          description: '3 hours of gaming at a discounted rate. Weekdays only.',
          active: true,
        },
        {
          name: 'Squad Combo',
          price: 1200,
          durationHours: 4,
          discountPercent: 20,
          description: '4 PS5 controllers, 4 hours. Perfect for friends.',
          active: true,
        },
        {
          name: 'Weekend Warrior',
          price: 800,
          durationHours: 5,
          discountPercent: 10,
          description: '5 hours of PC gaming on the weekend.',
          active: true,
        },
      ]);
      console.log('✔ Sample packages created');
    }

    // ===== Tournaments =====
    if ((await Tournament.countDocuments()) === 0) {
      const inTwoWeeks = new Date();
      inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
      await Tournament.insertMany([
        {
          title: 'FIFA 25 Champions Cup',
          description: 'Single-elimination FIFA 25 tournament. Prize pool ৳10,000.',
          date: inTwoWeeks,
          entryFee: 300,
          status: 'upcoming',
        },
        {
          title: 'Valorant 5v5 Showdown',
          description: 'Team-based Valorant competition. Bring your squad!',
          date: inTwoWeeks,
          entryFee: 500,
          status: 'upcoming',
        },
      ]);
      console.log('✔ Sample tournaments created');
    }

    // ===== Settings =====
    const settings = await Settings.getSingleton();
    if (!settings.contactEmail) {
      settings.siteName = 'GameZone BD';
      settings.contactPhone = '+880 1700-000000';
      settings.contactEmail = 'hello@gamezone.bd';
      settings.address = 'House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh';
      settings.openingHours = '10:00 AM – 11:00 PM (Everyday)';
      settings.socialLinks = {
        facebook: 'https://facebook.com/gamezonebd',
        instagram: 'https://instagram.com/gamezonebd',
        whatsapp: 'https://wa.me/8801700000000',
      };
      settings.offers = [
        {
          title: 'Student Discount',
          description: '20% off on weekdays with a valid student ID.',
          image: '',
        },
      ];
      settings.testimonials = [
        {
          name: 'Rakib H.',
          message: 'Best gaming lounge in Dhaka! The PS5 setup is amazing.',
          avatar: '',
        },
        {
          name: 'Nabila K.',
          message: 'Loved the VR experience. Staff were super friendly.',
          avatar: '',
        },
      ];
      await settings.save();
      console.log('✔ Default settings created');
    }

    console.log('\n✅ Seeding complete.');
  } catch (err) {
    console.error('✖ Seeding failed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
