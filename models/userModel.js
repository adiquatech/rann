const { getDb } = require('../data/database');
const bcrypt = require('bcryptjs');

const collectionName = 'users';

const User = {
  // Create new user (hash password)
  async create(userData) {
    const db = getDb();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = {
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date(),
    };
    const result = await db.collection(collectionName).insertOne(newUser);
    return { id: result.insertedId, ...newUser };
  },

  // Find user by email
  async findByEmail(email) {
    const db = getDb();
    return await db.collection(collectionName).findOne({ email });
  },

  // Find user by ID
  async findById(id) {
    const db = getDb();
    const ObjectId = require('mongodb').ObjectId;
    return await db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(id) });
  },

  // Compare password
  async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },
};

module.exports = User;
