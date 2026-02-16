// Script to create an admin user

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

(async () => {
  try {


    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is not defined. Looked at', path.resolve(__dirname, '..', '.env'));
      process.exit(1);
    }

    await mongoose.connect(uri);

    const hashed = await bcrypt.hash('12345', 10);

    await User.create({
      username: 'Admin',
      email: 'admin@capstone.com',
      passwordHash: hashed,
      role: 'ADMIN',
      permissions: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE'],
      status: 'ACTIVE',
      lastLoginAt: new Date(),
      isRootUser: true,
    });

    console.log('Admin user created');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin user:', err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
})();