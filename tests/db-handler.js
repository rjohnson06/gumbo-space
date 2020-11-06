// tests/db-handler.js

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer({
  instance: {
    args: ["--enableMajorityReadConcern=false"]
  }
});

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  console.log("connect");

    try {
      const uri = await mongod.getConnectionString();

      console.log("got connection string");

      const mongooseOpts = {
          useNewUrlParser: true,
          autoReconnect: true,
          reconnectTries: Number.MAX_VALUE,
          reconnectInterval: 1000
      };

      await mongoose.connect(uri, mongooseOpts);

    } catch(e) {
      console.log("exception: " + e);
    }
}

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
}

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
}
