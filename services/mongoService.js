const { MongoClient } = require('mongodb');

const connectionString = 'mongodb+srv://jrd_db_user:dangel@cluster0.r7tnoun.mongodb.net/';
const client = new MongoClient(connectionString);

let db;

async function connectDB() {
    try {
        await client.connect();

        db = client.db("test");
        console.log("Successfully Connected to DB!");

        // Check if neccessary collections exist, create if they don't
        const collectionName = "users";
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length === 0) {
            await db.createCollection(collectionName);
            await db.collection(collectionName).createIndex({ "$**": "text" });
            console.log(`Collection '${collectionName}' created.`);
        }

        return db;
    } catch (error) {
        console.error("Connection failed!", error);
    }
}

const getDb = () => {
    if (!db) {
        throw new Error("Database not connected. Call connectDB first.");
    }
    return db;
};

module.exports = { connectDB, getDb };