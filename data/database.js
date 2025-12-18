require('dotenv').config();
const { MongoClient } = require('mongodb');

let database;

const initDb = (callback) => {
  if (database) {
    console.log('Database is already initialized!');
    return callback(null, database);
  }

  MongoClient.connect(process.env.MONGODB_URI)
    .then((client) => {
      database = client.db(process.env.DB_NAME);
      console.log('Database initialized!');
      return callback(null, database);
    })
    .catch((err) => {
      console.error('Failed to connect to the database:', err);
      return callback(err);
    });
};

const getDb = () => {
  if (!database) {
    throw new Error('Database not initialized. Call initDb first.');
  }
  return database;
};

module.exports = {
  initDb,
  getDb,
};
