const { getDb } = require('../data/database');

const collectionName = 'messages';

const Message = {
  // Create new anonymous message
  async create(messageData) {
    const db = getDb();
    const ObjectId = require('mongodb').ObjectId;

    const newMessage = {
      toUserId: new ObjectId(messageData.toUserId),
      fromUserId: messageData.fromUserId
        ? new ObjectId(messageData.fromUserId)
        : null, // ← FIX HERE
      text: messageData.text,
      createdAt: new Date(),
      read: false,
    };
    const result = await db.collection(collectionName).insertOne(newMessage);
    return { id: result.insertedId, ...newMessage };
  },

  // Get all messages for a user
  async getByUserId(userId) {
    const db = getDb();
    const ObjectId = require('mongodb').ObjectId;
    const id = new ObjectId(userId);
    return await db
      .collection(collectionName)
      .find({ toUserId: id })
      .sort({ createdAt: -1 })
      .toArray();
  },

  async findByUsername(username) {
    const db = getDb();
    return await db.collection('users').findOne({ username });
  },

  // Get all messages sent by a user
  async getBySenderId(senderId) {
    const db = getDb();
    const ObjectId = require('mongodb').ObjectId;
    const id = new ObjectId(senderId);
    return await db
      .collection(collectionName)
      .find({ fromUserId: id })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Send a reply to a message
  async replyTo(newMessage) {
    const db = getDb();
    const ObjectId = require('mongodb').ObjectId;

    const replyMessage = {
      toUserId: new ObjectId(newMessage.toUserId),
      fromUserId: new ObjectId(newMessage.fromUserId),
      text: newMessage.text.trim(),
      createdAt: new Date(),
      read: false,
      replyTo: newMessage.replyTo ? new ObjectId(newMessage.replyTo) : null, // ← link to original
    };

    const result = await db.collection(collectionName).insertOne(replyMessage);
    return { id: result.insertedId, ...replyMessage };
  },

  async findById(messageId) {
    const db = getDb();
    const ObjectId = require('mongodb').ObjectId;
    return await db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(messageId) });
  },

  // Get all replies in a thread (recursive)
  async getReplies(parentId) {
    const db = getDb();
    const ObjectId = require('mongodb').ObjectId;
    return await db
      .collection(collectionName)
      .find({ replyTo: new ObjectId(parentId) })
      .sort({ createdAt: 1 })
      .toArray();
  },
};

module.exports = Message;
